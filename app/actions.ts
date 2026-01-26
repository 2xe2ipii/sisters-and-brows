'use server'

import { z } from 'zod';
import { getSheetRows } from '@/lib/googleSheets';

// --- CONFIGURATION ---
const BRANCH_MAP: Record<string, string> = {
  "Parañaque, Metro Manila": "PQ",
  "Lipa, Batangas": "LP",
  "San Pablo, Laguna": "SP",
  "Novaliches, Quezon City": "NV",
  "Dasmariñas, Cavite": "DM",
  "Comembo, Taguig": "TG"
};

const BRANCH_LIMITS: Record<string, number> = {
  "PQ": 4, "LP": 4, "SP": 2, "NV": 4, "DM": 6, "TG": 4
};

// --- UPDATED SCHEMA (With ACK & MOP) ---
const formSchema = z.object({
  type: z.string().optional(),
  branch: z.string().min(1),
  session: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  services: z.union([z.string(), z.array(z.string())]), 
  fbLink: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  others: z.string().optional(),
  ack: z.enum(["ACK", "NO ACK"]), 
  mop: z.enum(["Cash", "G-Cash", "Maya", "Bank", "Other"])
});

// --- HELPERS ---

function normalizeStr(str: any) {
  if (!str) return "";
  return String(str).trim().toLowerCase(); 
}

function normalizePhone(str: any) {
  if (!str) return "";
  let clean = String(str).replace(/\D/g, ''); 
  if (clean.startsWith('63')) clean = '0' + clean.slice(2);
  if (clean.startsWith('9') && clean.length === 10) clean = '0' + clean;
  return clean;
}

function normalizeDate(raw: any) {
  if (!raw) return "";
  let str = String(raw).trim();
  // Handle "January 25" -> "January 25 2026"
  if (/^[A-Za-z]+\s\d{1,2}$/.test(str)) {
     str += ` ${new Date().getFullYear()}`; 
  }
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCleanTime(timeStr: any) {
  if (!timeStr) return "";
  let s = String(timeStr).toLowerCase().split(' - ')[0].trim();
  const match = s.match(/(\d{1,2}:\d{2})/); 
  if (match) {
    const timePart = match[1]; 
    const isPM = s.includes('pm');
    return `${timePart}${isPM ? 'pm' : 'am'}`;
  }
  return s.replace(/\s/g, ''); 
}

// HEADER FINDER: Matches "mop" to "M O P", "date" to "DATE", etc.
function findColumnKey(headers: string[], keyword: string) {
  // 1. Try exact match
  if (headers.includes(keyword)) return keyword;
  
  // 2. Try normalized match (remove spaces, lowercase)
  const normKeyword = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');
  return headers.find(h => h.toLowerCase().replace(/[^a-z0-9]/g, '') === normKeyword);
}

// --- ACTION 1: CHECK AVAILABILITY ---
export async function getSlotAvailability(date: string, branch: string) {
  try {
    const { sheet, rows } = await getSheetRows();

    if (!sheet) return { success: false, counts: {}, limit: 4 };

    // Ensure headers loaded
    if (!sheet.headerValues) await sheet.loadHeaderRow();
    const headers = sheet.headerValues;

    // Resolve Keys Dynamically
    const KEY_BRANCH = findColumnKey(headers, "BRANCH") || "BRANCH";
    const KEY_DATE = findColumnKey(headers, "DATE") || "DATE";
    const KEY_TIME = findColumnKey(headers, "TIME") || "TIME";

    const counts: Record<string, number> = {};
    const targetDate = normalizeDate(date);
    const targetFullBranch = normalizeStr(branch);
    const targetShortBranch = normalizeStr(BRANCH_MAP[branch] || branch);
    const limit = BRANCH_LIMITS[BRANCH_MAP[branch] || branch] || 4;

    if (rows) {
      rows.forEach((row) => {
        const rDateRaw = row.get(KEY_DATE);
        const rBranchRaw = row.get(KEY_BRANCH);
        const rTimeRaw = row.get(KEY_TIME);

        if (!rTimeRaw) return;

        const rDate = normalizeDate(rDateRaw);
        const rBranch = normalizeStr(rBranchRaw);
        const rTime = getCleanTime(rTimeRaw);

        const isBranchMatch = (rBranch === targetShortBranch) || (rBranch === targetFullBranch);
        const isDateMatch = (rDate === targetDate);

        if (isBranchMatch && isDateMatch) {
           counts[rTime] = (counts[rTime] || 0) + 1;
        }
      });
    }

    return { success: true, counts, limit };
  } catch (error) {
    console.error("Availability Error:", error);
    return { success: false, counts: {}, limit: 4 };
  }
}

// --- ACTION 2: SUBMIT BOOKING ---
export async function submitBooking(prevState: any, formData: FormData) {
  const servicesRaw = formData.getAll('services');
  const servicesString = servicesRaw.map(s => String(s)).join(', ');

  // 1. EXTRACT DATA WITH NEW FIELDS
  const rawData = {
    type: formData.get('type') || "New Appointment", 
    branch: formData.get('branch') || "",
    session: formData.get('session') || "",
    date: formData.get('date') || "",
    time: formData.get('time') || "",
    services: servicesRaw, 
    fbLink: formData.get('fbLink') || "", 
    firstName: formData.get('firstName') || "",
    lastName: formData.get('lastName') || "",
    phone: formData.get('phone') || "",
    others: formData.get('others') || "",
    ack: formData.get('ack') || "NO ACK",
    mop: formData.get('mop') || "Cash",        // Default to cash
  };

  const validated = formSchema.safeParse(rawData);
  if (!validated.success) return { success: false, message: validated.error.issues[0].message };

  try {
    const data = validated.data;
    const { sheet, rows } = await getSheetRows();
    
    if (!sheet) throw new Error("Database Sheet Missing");
    
    // 2. FORCE LOAD HEADERS
    if (!sheet.headerValues) await sheet.loadHeaderRow();
    const headers = sheet.headerValues;

    // 3. PREPARE DATA
    const targetDate = normalizeDate(data.date);
    const shortBranch = BRANCH_MAP[data.branch] || data.branch;
    const targetShortBranch = normalizeStr(shortBranch);
    const targetFullBranch = normalizeStr(data.branch);
    const targetTimeClean = getCleanTime(data.time);
    const targetPhone = normalizePhone(data.phone);
    const limit = BRANCH_LIMITS[shortBranch] || 4;
    const displayTime = data.time.split(' - ')[0].trim();

    // 4. DEFINE DESIRED DATA (Exact Header Mapping)
    // Keys here must match the conceptual headers. 
    // findColumnKey will map them to the actual sheet headers (e.g. "ACK?" or "M O P")
    const desiredData: Record<string, string> = {
      "BRANCH": shortBranch,
      "FACEBOOK NAME": data.fbLink || "",
      "FULL NAME": `${data.firstName} ${data.lastName}`,
      "Contact Number": data.phone,
      "DATE": targetDate,
      "TIME": displayTime,
      "CLIENT #": "",
      "SERVICES": servicesString,
      "SESSION": data.session,
      "STATUS": "Pending",
      "ACK?": data.ack,         // Maps to "ACK?" header
      "M O P": data.mop,        // Maps to "M O P" header
      "REMARKS": data.others || "",
      "TYPE": data.type || ""
    };

    // 5. CHECK AVAILABILITY LOOP
    // Resolve Keys for Reading
    const KEY_BRANCH = findColumnKey(headers, "BRANCH");
    const KEY_DATE = findColumnKey(headers, "DATE");
    const KEY_TIME = findColumnKey(headers, "TIME");
    const KEY_PHONE = findColumnKey(headers, "Contact Number");

    let slotCount = 0;
    let targetRowIndex = -1;
    let isMovingSlots = true; 

    // Only scan if we found the critical keys
    if (rows && KEY_BRANCH && KEY_DATE && KEY_TIME && KEY_PHONE) {
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const rDate = normalizeDate(row.get(KEY_DATE));
          const rBranch = normalizeStr(row.get(KEY_BRANCH));
          const rTime = getCleanTime(row.get(KEY_TIME));
          const rPhone = normalizePhone(row.get(KEY_PHONE));

          const isSameBranch = (rBranch === targetShortBranch) || (rBranch === targetFullBranch);
          const isSameDate = (rDate === targetDate);
          const isSameTime = (rTime === targetTimeClean);

          if (isSameBranch && isSameDate && isSameTime) slotCount++;

          if (rPhone === targetPhone) {
            // Update logic (Reschedule or same slot update)
            if (data.type === 'Reschedule') {
              targetRowIndex = i;
              isMovingSlots = true; 
            } 
            else if (isSameBranch && isSameDate && isSameTime) {
              targetRowIndex = i;
              isMovingSlots = false; 
            }
          }
        }
    }

    if (isMovingSlots && slotCount >= limit) {
      return { 
        success: false, 
        message: `Sorry! The ${displayTime} slot is full (Max ${limit}).` 
      };
    }

    // 6. CONSTRUCT SAFE PAYLOAD
    const rowPayload: Record<string, any> = {};
    
    // For each desired field, check if its column exists in the sheet
    Object.entries(desiredData).forEach(([key, value]) => {
      const actualHeader = findColumnKey(headers, key);
      if (actualHeader) {
        rowPayload[actualHeader] = value;
      }
    });

    // 7. WRITE TO SHEET
    if (targetRowIndex !== -1 && rows) {
      const row = rows[targetRowIndex];
      row.assign(rowPayload);
      await row.save();
      return { success: true, message: "Booking Updated Successfully!" };
    } else {
      await sheet.addRow(rowPayload);
      return { success: true, message: "Booking Confirmed! See you there." };
    }

  } catch (error) {
    console.error("Sheet Error:", error);
    const msg = error instanceof Error ? error.message : "System Busy";
    return { success: false, message: `System Error: ${msg}` };
  }
}