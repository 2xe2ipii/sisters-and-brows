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

// --- ACTION 1: CHECK AVAILABILITY ---
export async function getSlotAvailability(date: string, branch: string) {
  try {
    const { sheet, rows } = await getSheetRows();

    // CRITICAL SAFETY CHECK
    if (!sheet) {
      console.error("CRITICAL: 'Raw_Intake' sheet not found!");
      return { success: false, counts: {}, limit: 4 };
    }

    const counts: Record<string, number> = {};
    
    const targetDate = normalizeDate(date);
    const targetFullBranch = normalizeStr(branch);
    const targetShortBranch = normalizeStr(BRANCH_MAP[branch] || branch);
    const limit = BRANCH_LIMITS[BRANCH_MAP[branch] || branch] || 4;

    if (!rows || rows.length === 0) return { success: true, counts, limit };

    // HARDCODED KEYS (Matches your CSV exactly)
    const KEY_BRANCH = "BRANCH";
    const KEY_DATE = "DATE";
    const KEY_TIME = "TIME";

    rows.forEach((row) => {
      // Direct key access - no guessing
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

    if (!sheet) throw new Error("Database Sheet Missing");

    // PREPARE DATA
    const targetDate = normalizeDate(data.date);
    const shortBranch = BRANCH_MAP[data.branch] || data.branch;
    const targetShortBranch = normalizeStr(shortBranch);
    const targetFullBranch = normalizeStr(data.branch);
    const targetTimeClean = getCleanTime(data.time);
    const targetPhone = normalizePhone(data.phone);
    const limit = BRANCH_LIMITS[shortBranch] || 4;

    // HARDCODED KEYS
    const KEY_BRANCH = "BRANCH";
    const KEY_DATE = "DATE";
    const KEY_TIME = "TIME";
    const KEY_PHONE = "Contact Number";

    let slotCount = 0;
    let targetRowIndex = -1;
    let isMovingSlots = true; 

    if (rows) {
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
        message: `Sorry! The ${data.time.split(' - ')[0]} slot is full (Max ${limit}).` 
      };
    }

    const displayTime = data.time.split(' - ')[0].trim();
    const newRowData = {
      [KEY_BRANCH]: shortBranch,                    
      'FACEBOOK NAME': data.fbLink || "",       
      'FULL NAME': `${data.firstName} ${data.lastName}`, 
      [KEY_PHONE]: data.phone,             
      [KEY_DATE]: targetDate,                       
      [KEY_TIME]: displayTime,
      'CLIENT #': "",                           
      'SERVICES': servicesString,               
      'SESSION': data.session,                  
      'STATUS': 'Pending',                      
      'ACK?': "NO ACK",                         
      'MOP': "",                                
      'REMARKS': data.others || "",             
      'TYPE': data.type || ""                   
    };

    if (targetRowIndex !== -1 && rows) {
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