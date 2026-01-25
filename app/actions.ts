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
  const str = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str; 
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

// FIX: Use 'sheet' object directly, not the row
function findHeader(sheet: any, keyword: string) {
  // Access public headerValues array from the sheet
  const headers = sheet.headerValues; 
  if (!headers || !Array.isArray(headers)) return keyword; // Safety fallback
  
  const match = headers.find((h: string) => h.toLowerCase().trim() === keyword.toLowerCase());
  return match || keyword; 
}

// --- ACTION 1: CHECK AVAILABILITY ---
export async function getSlotAvailability(date: string, branch: string) {
  try {
    const { sheet, rows } = await getSheetRows();
    const counts: Record<string, number> = {};
    
    const targetDate = normalizeDate(date);
    const targetFullBranch = normalizeStr(branch);
    const targetShortBranch = normalizeStr(BRANCH_MAP[branch] || branch);
    const limit = BRANCH_LIMITS[BRANCH_MAP[branch] || branch] || 4;

    // FIND HEADERS USING SHEET
    const colBranch = findHeader(sheet, "branch");
    const colDate = findHeader(sheet, "date");
    const colTime = findHeader(sheet, "time");

    console.log(`Availability Check -> Headers: [${colBranch}, ${colDate}, ${colTime}]`);

    rows.forEach((row) => {
      const rDateRaw = row.get(colDate);
      const rBranchRaw = row.get(colBranch);
      const rTimeRaw = row.get(colTime);

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
  };

  const validated = formSchema.safeParse(rawData);
  if (!validated.success) return { success: false, message: validated.error.issues[0].message };

  try {
    const data = validated.data;
    const { sheet, rows } = await getSheetRows();

    // 1. IDENTIFY HEADERS
    const colBranch = findHeader(sheet, "branch");
    const colDate = findHeader(sheet, "date");
    const colTime = findHeader(sheet, "time");
    const colPhone = findHeader(sheet, "contact number");

    // 2. PREPARE DATA
    const targetDate = normalizeDate(data.date);
    const targetFullBranch = normalizeStr(data.branch);
    const shortBranch = BRANCH_MAP[data.branch] || data.branch;
    const targetShortBranch = normalizeStr(shortBranch);
    const targetTimeClean = getCleanTime(data.time);
    const targetPhone = normalizePhone(data.phone);
    const limit = BRANCH_LIMITS[shortBranch] || 4;

    // 3. SCAN AND COUNT
    let slotCount = 0;
    let targetRowIndex = -1;
    let isMovingSlots = true; 

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rDate = normalizeDate(row.get(colDate));
      const rBranch = normalizeStr(row.get(colBranch));
      const rTime = getCleanTime(row.get(colTime));
      const rPhone = normalizePhone(row.get(colPhone));

      const isSameBranch = (rBranch === targetShortBranch) || (rBranch === targetFullBranch);
      const isSameDate = (rDate === targetDate);
      const isSameTime = (rTime === targetTimeClean);

      if (isSameBranch && isSameDate && isSameTime) {
        slotCount++;
      }

      // 4. IDEMPOTENCY CHECK
      if (rPhone === targetPhone) {
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

    // 5. BLOCKER
    if (isMovingSlots && slotCount >= limit) {
      return { 
        success: false, 
        message: `Sorry! The ${data.time.split(' - ')[0]} slot is full (Max ${limit}).` 
      };
    }

    // 6. WRITE TO SHEET
    const displayTime = data.time.split(' - ')[0].trim();
    const newRowData = {
      [colBranch]: shortBranch,                    
      'FACEBOOK NAME': data.fbLink || "",       
      'FULL NAME': `${data.firstName} ${data.lastName}`, 
      [colPhone]: data.phone,             
      [colDate]: targetDate,                       
      [colTime]: displayTime,
      'CLIENT #': "",                           
      'SERVICES': servicesString,               
      'SESSION': data.session,                  
      'STATUS': 'Pending',                      
      'ACK?': "NO ACK",                         
      'MOP': "",                                
      'REMARKS': data.others || "",             
      'TYPE': data.type || ""                   
    };

    if (targetRowIndex !== -1) {
      const row = rows[targetRowIndex];
      row.assign(newRowData);
      await row.save();
      return { success: true, message: "Booking Updated Successfully!" };
    } else {
      await sheet.addRow(newRowData);
      return { success: true, message: "Booking Confirmed! See you there." };
    }

  } catch (error) {
    console.error("Sheet Error:", error);
    return { success: false, message: "System Busy. Please try again." };
  }
}