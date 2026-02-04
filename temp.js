/* =========================================
   SISTERS & BROWS - BOOKING SYSTEM v5.2.2
   SURGICAL UPDATE - PRESERVES PRE-FORMATTED SHEETS
   Key: Never clear or reapply data validation
   Fixed: Custom branch order (PQ, LP, NV, DM, TG, etc.)
   ========================================= */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Sisters & Brows')
      .addItem('Force Refresh', 'updateSchedule')
      .addToUi();
}

// function onEdit(e) {
//   const sheet = e.source.getActiveSheet();
//   const range = e.range;
//   const col = range.getColumn();
//   const row = range.getRow();
  
//   // --- CONFIGURATION ---
//   const STATUS_COL = 10; // Column J
//   const DATE_COL = 5;    // Column E
//   const IGNORED_SHEETS = ["Raw_Intake", "Services", "Time_Slots", "Locations", "Config"];

//   if (row < 2) return; 
//   if (IGNORED_SHEETS.includes(sheet.getName())) return;

//   // If Status or Date changes, re-sort that specific sheet immediately
//   if (col === STATUS_COL || col === DATE_COL) {
//     Utilities.sleep(100); 
//     SpreadsheetApp.getActiveSpreadsheet().toast("Re-organizing sheet...", "Processing", 1);
//     processSheetAtomic(sheet, []); // Sort existing data, no new data to add
//   }
// }

/**
 * MAIN SYNC FUNCTION
 */
function updateSchedule() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rawSheet = ss.getSheetByName("Raw_Intake");
  if (!rawSheet) return;

  if (rawSheet.getRange("O1").getValue() !== "Synced") {
    rawSheet.getRange("O1").setValue("Synced").setFontColor("#ccc");
  }

  const lastRow = rawSheet.getLastRow();
  if (lastRow < 2) return;

  // --- 1. READ RAW INTAKE & GROUP BY REF ID ---
  const rawData = rawSheet.getRange(2, 1, lastRow - 1, 15).getValues();
  const batches = new Map();
  const manualRows = [];
  const rowsToMarkSynced = [];

  rawData.forEach((row, index) => {
    const isSynced = String(row[14]).toUpperCase() === "TRUE";
    if (!isSynced) {
      const rowIndex = index + 2;
      const refId = String(row[6]).trim().toUpperCase();
      const cleanRow = row.slice(0, 14);

      rowsToMarkSynced.push(rowIndex);

      if (refId && refId.length > 1) {
        if (!batches.has(refId)) {
          batches.set(refId, []);
        }
        batches.get(refId).push(cleanRow);
      } else {
        manualRows.push(cleanRow);
      }
    }
  });

  if (batches.size === 0 && manualRows.length === 0) return;

  // --- 2. GLOBAL PURGE ---
  const affectedRefIds = Array.from(batches.keys());
  const allSheets = ss.getSheets();
  const IGNORE = ["Raw_Intake", "Services", "Time_Slots", "Locations", "Config"];
  
  const sheetDataMap = new Map();

  allSheets.forEach(sheet => {
    if (!IGNORE.includes(sheet.getName())) {
      sheetDataMap.set(sheet.getName(), {
        sheet: sheet,
        rows: readSheetData(sheet),
        isDirty: false
      });
    }
  });

  if (affectedRefIds.length > 0) {
    sheetDataMap.forEach((data, sheetName) => {
      const originalCount = data.rows.length;
      data.rows = data.rows.filter(r => {
        const rRef = String(r[6]).trim().toUpperCase();
        return !affectedRefIds.includes(rRef);
      });
      
      if (data.rows.length !== originalCount) {
        data.isDirty = true;
      }
    });
  }

  // --- 3. DISTRIBUTE NEW DATA ---
  const addToBucket = (row) => {
    const dateVal = row[4];
    const targetName = getFortnightSheetName(dateVal);
    
    if (!sheetDataMap.has(targetName)) {
      const newSheet = getOrInsertSheet(ss, targetName);
      sheetDataMap.set(targetName, {
        sheet: newSheet,
        rows: [],
        isDirty: true
      });
    }
    
    const bucket = sheetDataMap.get(targetName);
    bucket.rows.push(row);
    bucket.isDirty = true;
  };

  batches.forEach((rows, refId) => {
    rows.forEach(row => addToBucket(row));
  });

  manualRows.forEach(row => addToBucket(row));

  // --- 4. COMMIT CHANGES ---
  sheetDataMap.forEach((data, sheetName) => {
    if (data.isDirty) {
      processSheetAtomic(data.sheet, data.rows);
    }
  });

  // --- 5. MARK SYNCED ---
  if (rowsToMarkSynced.length > 0) {
    rowsToMarkSynced.forEach(rIdx => {
      rawSheet.getRange(rIdx, 15).setValue("TRUE");
    });
  }
}

function readSheetData(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const vals = sheet.getRange(2, 1, lastRow - 1, 14).getValues();
  return vals.filter(r => r.some(c => String(c).trim() !== ""));
}

function processSheetAtomic(sheet, incomingRows) {
  // 1. Determine Data Source
  let dataRows = [];
  if (incomingRows && incomingRows.length > 0) {
    dataRows = incomingRows;
  } else {
    dataRows = readSheetData(sheet);
  }

  if (dataRows.length === 0) {
    const max = sheet.getMaxRows();
    if (max > 1) {
      const range = sheet.getRange(2, 1, max - 1, 14);
      range.clearContent();
    }
    return;
  }

  // 2. Deduplication
  const uniqueMap = new Map();
  dataRows.forEach(row => {
      const valG = String(row[6]).trim(); 
      const isHeader = valG.match(/^[A-Z][a-z]+ \d{1,2}(,\s+\d{4})?$/) && row[0] === "";
      
      if (!isHeader) {
        const key = String(row[4]) + "|" + String(row[5]) + "|" + String(row[2]) + "|" + String(row[7]) + "|" + String(row[6]) + "|" + String(row[9]);
        const existing = uniqueMap.get(key);
        const currentHasId = String(row[6]).length > 1;

        if (!existing) {
          uniqueMap.set(key, row);
        } else {
          const existingHasId = String(existing[6]).length > 1;
          if (currentHasId && !existingHasId) uniqueMap.set(key, row);
        }
      }
  });
  
  const cleanRows = Array.from(uniqueMap.values());

  // 3. SORTING
  cleanRows.sort((a, b) => {
    // A. Date
    const dateA = parseDate(a[4]);
    const dateB = parseDate(b[4]);
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    const timeDiff = dateA.getTime() - dateB.getTime();
    if (timeDiff !== 0) return timeDiff;

    // B. Branch (CUSTOM ORDER)
    const branchA = String(a[0]).trim();
    const branchB = String(b[0]).trim();
    const priorityA = getBranchPriority(branchA);
    const priorityB = getBranchPriority(branchB);
    if (priorityA !== priorityB) return priorityA - priorityB;

    // C. Status
    const weightA = getStatusWeight(a);
    const weightB = getStatusWeight(b);
    if (weightA !== weightB) return weightA - weightB;

    // D. Time
    const timeComp = normalizeTime(a[5]) - normalizeTime(b[5]);
    if (timeComp !== 0) return timeComp;

    // E. Done Numbering
    if (weightA === 2 && weightB === 2) {
        const refA = String(a[6]).trim();
        const refB = String(b[6]).trim();
        const isNumA = /^\d+$/.test(refA);
        const isNumB = /^\d+$/.test(refB);
        if (isNumA && !isNumB) return -1;
        if (!isNumA && isNumB) return 1;
        if (isNumA && isNumB) return parseInt(refA) - parseInt(refB);
    }

    // F. Group
    const refA = String(a[6]).trim();
    const refB = String(b[6]).trim();
    if (refA === refB && refA.length > 1) {
      const typeA = String(a[13]).toLowerCase();
      const typeB = String(b[13]).toLowerCase();
      const isJoinerA = typeA.includes("joiner");
      const isJoinerB = typeB.includes("joiner");
      if (!isJoinerA && isJoinerB) return -1;
      if (isJoinerA && !isJoinerB) return 1; 
    }
    return 0;
  });

  // 4. PREPARE BATCH DATA
  const finalOutput = [];
  const refCounts = {};

  cleanRows.forEach(row => {
    const ref = String(row[6]).trim();
    if (ref.length > 1) refCounts[ref] = (refCounts[ref] || 0) + 1;
  });

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let lastDateStr = "";
  let lastBranch = "";
  let doneCounterMap = {}; 
  
  const rowStyles = [];

  const addStyle = (bg, color, weight) => {
      rowStyles.push({ bg, color, weight });
  };

  const GROUP_PALETTE = ["#e3f2fd", "#fff3e0", "#f3e5f5", "#e0f2f1", "#fff8e1"];
  let colorIndex = 0;
  let lastRefId = "";
  let lastGroupColor = "";

  cleanRows.forEach(row => {
    const d = parseDate(row[4]);
    const currentBranch = String(row[0]).trim();
    let dateNice = "";
    
    if (d) {
      dateNice = monthNames[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
      
      if (dateNice !== lastDateStr) {
        const headerRow = new Array(14).fill("");
        headerRow[6] = "'" + dateNice; 
        finalOutput.push(headerRow);
        addStyle("#202124", "#e6c200", "bold"); 
        
        lastDateStr = dateNice;
        lastBranch = ""; 
      }
    }

    if (lastBranch !== "" && currentBranch !== lastBranch) {
        const dividerRow = new Array(14).fill("");
        finalOutput.push(dividerRow);
        addStyle("#6d28d9", "#6d28d9", "normal"); 
    }
    lastBranch = currentBranch;

    const status = String(row[9]).toLowerCase();
    const session = String(row[8]).toUpperCase();
    const isDone = status === "done";
    const is2nd = session.includes("2ND");
    const isCancel = status.includes("cancel");

    if (isDone && !is2nd) {
        const key = dateNice + "|" + currentBranch;
        if (!doneCounterMap[key]) doneCounterMap[key] = 1;
        row[6] = doneCounterMap[key]; 
        doneCounterMap[key]++;
    }

    finalOutput.push(row);

    const refId = String(row[6]).trim();
    const groupSize = refCounts[refId] || 0;

    if (isCancel) {
        addStyle("#fca5a5", "#7f1d1d", "normal");
    } 
    else if (isDone && is2nd) {
        addStyle("#bbf7d0", "#14532d", "normal");
    }
    else if (groupSize > 1) {
        if (refId === lastRefId) {
            addStyle(lastGroupColor, "#000000", "normal");
        } else {
            const c = GROUP_PALETTE[colorIndex % GROUP_PALETTE.length];
            addStyle(c, "#000000", "normal");
            lastGroupColor = c;
            lastRefId = refId;
            colorIndex++;
        }
    } else {
        addStyle(null, "#000000", "normal"); 
        lastRefId = "";
    }
  });

  // 5. WRITE & FORMAT - SURGICAL APPROACH
  
  if (finalOutput.length > 0) {
    const totalRows = finalOutput.length;
    const bufferSize = 50;
    const neededRows = totalRows + 1 + bufferSize;
    const currentMax = sheet.getMaxRows();

    // === CRITICAL: ENSURE ENOUGH ROWS WITH DATA VALIDATION ===
    ensureFormattedRows(sheet, neededRows);

    // === WRITE VALUES ONLY - ONE COLUMN AT A TIME TO PRESERVE DROPDOWNS ===
    for (let colIndex = 0; colIndex < 14; colIndex++) {
      const columnValues = finalOutput.map(row => [row[colIndex]]);
      const columnRange = sheet.getRange(2, colIndex + 1, totalRows, 1);
      columnRange.setValues(columnValues);
    }

    // === APPLY VISUAL FORMATTING ONLY ===
    const targetRange = sheet.getRange(2, 1, totalRows, 14);
    
    const backgrounds = [];
    const fontColors = [];
    const fontWeights = [];
    const alignments = [];

    rowStyles.forEach((style, index) => {
        const bgRow = new Array(14).fill(style.bg || "#ffffff"); 
        const colorRow = new Array(14).fill(style.color);
        const weightRow = new Array(14).fill(style.weight);
        
        let alignRow;
        if (style.bg === "#202124") { 
             alignRow = new Array(14).fill("center");
        } else {
             alignRow = ["center", "center", "center", "center", "center", "center", "center", "center", "center", "center", "center", "center", "center", "center"];
        }

        backgrounds.push(bgRow);
        fontColors.push(colorRow);
        fontWeights.push(weightRow);
        alignments.push(alignRow);

        if (style.bg === "#6d28d9") {
             sheet.setRowHeight(index + 2, 5);
        } else {
             sheet.setRowHeight(index + 2, 21);
        }
    });

    targetRange.setBackgrounds(backgrounds);
    targetRange.setFontColors(fontColors);
    targetRange.setFontWeights(fontWeights);
    targetRange.setHorizontalAlignments(alignments);
    targetRange.setFontSize(10).setVerticalAlignment("middle");

    // Clear buffer zone content only
    if (bufferSize > 0 && totalRows + bufferSize < currentMax) {
      const bufferRange = sheet.getRange(totalRows + 2, 1, Math.min(bufferSize, currentMax - totalRows - 1), 14);
      bufferRange.clearContent();
    }
    
    // === FIX: Don't trim pre-formatted sheets ===
    if (sheet.getMaxRows() < 1000) {
        const excessRows = sheet.getMaxRows() - neededRows;
        if (excessRows > 500) {
            sheet.deleteRows(neededRows + 1, excessRows);
            Logger.log(`Trimmed ${excessRows} excess rows from ${sheet.getName()}`);
        }
    }
  }
}

/**
 * CRITICAL FUNCTION: Ensures rows have data validation WITHOUT clearing anything
 */
function ensureFormattedRows(sheet, neededRows) {
  const currentMax = sheet.getMaxRows();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rawSheet = ss.getSheetByName("Raw_Intake");
  
  if (!rawSheet) {
    Logger.log("Warning: Raw_Intake sheet not found");
    return;
  }
  
  const template = rawSheet.getRange("A2:N2");
  
  if (currentMax < neededRows) {
    const rowsToAdd = neededRows - currentMax;
    sheet.insertRowsAfter(currentMax, rowsToAdd);
    
    const newRowsRange = sheet.getRange(currentMax + 1, 1, rowsToAdd, 14);
    template.copyTo(newRowsRange, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
    template.copyTo(newRowsRange, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
  }
}

// --- UTILITIES ---

/**
 * Returns branch priority for custom sorting
 * Order: Paranaque, San Pablo, Lipa, Taguig, Das Marinas, Novaliches
 */
function getBranchPriority(branch) {
  const normalized = String(branch).toUpperCase().trim();
  
  // Map both full names and abbreviations
  const priorityMap = {
    // Paranaque (Priority 1)
    'PQ': 1,
    'PARANAQUE': 1,
    'PARAÑAQUE': 1,
    
    // San Pablo (Priority 2)
    'SP': 2,
    'SAN PABLO': 2,
    
    // Lipa (Priority 3)
    'LP': 3,
    'LIPA': 3,
    
    // Taguig (Priority 4)
    'TG': 4,
    'TAGUIG': 4,
    
    // Das Marinas (Priority 5)
    'DM': 5,
    'DAS MARINAS': 5,
    'DASMARIÑAS': 5,
    'DASMARINAS': 5,
    
    // Novaliches (Priority 6)
    'NV': 6,
    'NOVALICHES': 6
  };
  
  return priorityMap[normalized] || 999; // Unknown branches go to the end
}

function getStatusWeight(row) {
    const status = String(row[9]).toLowerCase();
    const session = String(row[8]).toUpperCase();
    if (status.includes("cancel")) return 4;
    if (status === "done") {
        if (session.includes("2ND")) return 3;
        return 2;
    }
    return 1;
}

function getOrInsertSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    const raw = ss.getSheetByName("Raw_Intake");
    
    const headers = raw.getRange("A1:N1").getValues();
    sheet.getRange("A1:N1").setValues(headers)
      .setFontWeight("bold").setBackground("#202124").setFontColor("#e6c200");
    sheet.setFrozenRows(1);
    
    const template = raw.getRange("A2:N2");
    const initialRows = 100;
    sheet.insertRowsAfter(1, initialRows);
    
    const initRange = sheet.getRange(2, 1, initialRows, 14);
    template.copyTo(initRange, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
    template.copyTo(initRange, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
  }
  return sheet;
}

function parseDate(val) {
  if (val instanceof Date) return val;
  if (!val) return null;
  if (typeof val === 'number') return new Date(Math.round((val - 25569) * 86400 * 1000));
  const s = String(val).trim();
  if (s.match(/^[A-Z][a-z]+ \d{1,2}(,\s+\d{4})?$/)) { 
      const year = new Date().getFullYear(); 
      return new Date(s.includes(',') ? s : `${s}, ${year}`);
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function getFortnightSheetName(dateVal) {
  const d = parseDate(dateVal); 
  if (!d) return "Unsorted";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const range = d.getDate() <= 15 ? "1 - 15" : `16 - ${lastDay}`;
  return `${months[d.getMonth()]} ${range}, ${d.getFullYear()}`;
}

function normalizeTime(timeVal) {
  if (!timeVal) return 99999;
  if (timeVal instanceof Date) return timeVal.getHours() * 60 + timeVal.getMinutes();
  let cleanTime = String(timeVal).replace(/[\u00A0\u202F\u200B]/g, " ").trim();
  const d = new Date("1/1/2000 " + cleanTime);
  if (!isNaN(d.getTime())) return d.getHours() * 60 + d.getMinutes();
  const match = cleanTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match) {
      let hour = parseInt(match[1]);
      const minute = parseInt(match[2]);
      const amp = match[3].toUpperCase();
      if (amp === "PM" && hour < 12) hour += 12;
      if (amp === "AM" && hour === 12) hour = 0;
      return hour * 60 + minute;
  }
  return 99999; 
}