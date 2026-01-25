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

// NEW: Specific Capacity Limits
const BRANCH_LIMITS: Record<string, number> = {
  "PQ": 4,
  "LP": 4,
  "SP": 2,
  "NV": 4,
  "DM": 6,
  "TG": 4
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

// ROBUST NORMALIZER: Removes spaces, lowercases everything
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
  return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : str;
}

function getCleanTime(timeStr: any) {
  if (!timeStr) return "";
  // Returns "10:00 am" (lowercase, no extra junk)
  return String(timeStr).split(' - ')[0].trim().toLowerCase(); 
}

// --- ACTION 1: CHECK AVAILABILITY ---
export async function getSlotAvailability(date: string, branch: string) {
  try {
    const { sheet, rows } = await getSheetRows();
    const counts: Record<string, number> = {};
    const targetDate = normalizeDate(date);
    
    // Get Branch Code (e.g., "PQ")
    const shortBranch = BRANCH_MAP[branch] || branch;
    const cleanTargetBranch = normalizeStr(shortBranch);
    
    // Get Limit for this branch (Default to 4)
    const limit = BRANCH_LIMITS[shortBranch] || 4;

    const colBranch = "BRANCH";
    const colDate = "DATE";
    const colTime = "TIME";

    rows.forEach(row => {
      const rowDate = normalizeDate(row.get(colDate));
      const rowBranchRaw = row.get(colBranch);
      const rowTimeRaw = row.get(colTime);

      if (!rowTimeRaw) return;

      // FUZZY MATCHING: Check "pq" against "PQ" or "PQ "
      const cleanRowBranch = normalizeStr(rowBranchRaw);
      
      // Clean time key for counting (e.g. "10:00 am")
      const tKey = getCleanTime(rowTimeRaw); 

      if (cleanRowBranch === cleanTargetBranch && rowDate === targetDate) {
         counts[tKey] = (counts[tKey] || 0) + 1;
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
  const servicesString = servicesRaw.join(', ');

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
    const { sheet, rows } = await getSheetRows();
    const data = validated.data;
    
    // 1. PREPARE TARGETS (Normalize everything)
    const targetDate = normalizeDate(data.date);
    const displayTime = data.time.split(' - ')[0].trim(); // "10:00 AM" (Preserve Case for Saving)
    const targetTimeClean = getCleanTime(displayTime);    // "10:00 am" (LowerCase for Matching)
    const targetPhone = normalizePhone(data.phone);
    
    const shortBranch = BRANCH_MAP[data.branch] || data.branch;
    const cleanTargetBranch = normalizeStr(shortBranch);
    
    const limit = BRANCH_LIMITS[shortBranch] || 4; // Dynamic Limit

    // 2. SCAN ROWS
    const colBranch = "BRANCH";
    const colDate = "DATE";
    const colTime = "TIME";
    const colPhone = "Contact Number";

    let slotCount = 0;
    let targetRowIndex = -1;
    let isMovingSlots = true; 

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rDate = normalizeDate(row.get(colDate));
      const rTime = getCleanTime(row.get(colTime));
      const rPhone = normalizePhone(row.get(colPhone));
      const rBranch = normalizeStr(row.get(colBranch)); // Normalize Sheet Data

      // MATCH LOGIC
      const isSameBranch = rBranch === cleanTargetBranch;
      const isSameDate = rDate === targetDate;
      const isSameTime = rTime === targetTimeClean;

      if (isSameBranch && isSameDate && isSameTime) {
        slotCount++;
      }

      // IDENTITY CHECK (For Rescheduling)
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

    // 3. CHECK CAPACITY
    if (isMovingSlots && slotCount >= limit) {
      return { 
        success: false, 
        message: `Sorry! The ${displayTime} slot at ${shortBranch} is full (Max ${limit}).` 
      };
    }

    // 4. MAP TO SHEET COLUMNS
    const newRowData = {
      'BRANCH': shortBranch,                    
      'FACEBOOK NAME': data.fbLink || "",       
      'FULL NAME': `${data.firstName} ${data.lastName}`, 
      'Contact Number': data.phone,             
      'DATE': targetDate,                       
      'TIME': displayTime,  // Save pretty version "10:00 AM"                    
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