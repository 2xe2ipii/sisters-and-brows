'use server'

import { z } from 'zod';
import { getSheetRows } from '@/lib/googleSheets';

// --- CONFIGURATION ---
const MAX_CAPACITY_PER_SLOT = 4;

const BRANCH_MAP: Record<string, string> = {
  "Parañaque, Metro Manila": "PQ",
  "Lipa, Batangas": "LP",
  "San Pablo, Laguna": "SP",
  "Novaliches, Quezon City": "NV",
  "Dasmariñas, Cavite": "DM",
  "Comembo, Taguig": "TG"
};

const formSchema = z.object({
  type: z.string().optional(),
  branch: z.string().min(1),
  session: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  services: z.union([z.string(), z.array(z.string())]), 
  fbLink: z.string().optional(),
  fbName: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  others: z.string().optional(),
});

// --- ROBUST HELPERS ---

// 1. Normalize String (Trim, Lowercase)
function normalize(str: any) {
  return str ? String(str).trim().toLowerCase() : "";
}

// 2. Normalize Phone (Handles 0917, 917, +63917)
function normalizePhone(str: any) {
  if (!str) return "";
  let clean = String(str).replace(/\D/g, ''); // Remove non-digits
  
  // Standardize to "09..." format if possible
  if (clean.startsWith('63')) clean = '0' + clean.slice(2);
  if (clean.startsWith('9') && clean.length === 10) clean = '0' + clean;
  
  return clean;
}

// 3. Normalize Date (Handle YYYY-MM-DD vs 1/20/2026)
function normalizeDate(raw: any) {
  if (!raw) return "";
  const str = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str; 
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      const [m, d, y] = parts;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  const d = new Date(str);
  return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : str;
}

// 4. Normalize Time
function getCleanTime(timeStr: any) {
  if (!timeStr) return "";
  return String(timeStr).split(' - ')[0].trim().toLowerCase(); 
}

// 5. SMART HEADER FINDER
function findHeaderKey(headerValues: string[], target: string) {
  const normalizedTarget = normalize(target);
  return headerValues.find(h => normalize(h).includes(normalizedTarget)) || target;
}

// --- ACTION 1: CHECK AVAILABILITY ---
export async function getSlotAvailability(date: string, branch: string) {
  try {
    const { sheet, rows } = await getSheetRows();
    const counts: Record<string, number> = {};
    const targetDate = normalizeDate(date);
    const shortBranch = BRANCH_MAP[branch] || branch;

    const headers = sheet.headerValues;
    const branchKey = findHeaderKey(headers, "branch");
    const dateKey = findHeaderKey(headers, "date");
    const timeKey = findHeaderKey(headers, "time");

    rows.forEach(row => {
      const rowDate = normalizeDate(row.get(dateKey));
      const rowBranch = row.get(branchKey);
      const rowTime = row.get(timeKey);

      if (!rowTime) return;
      const tKey = rowTime.split(' - ')[0].trim(); 
      if (rowBranch === shortBranch && rowDate === targetDate) {
         counts[tKey] = (counts[tKey] || 0) + 1;
      }
    });

    return { success: true, counts };
  } catch (error) {
    console.error("Availability Error:", error);
    return { success: false, counts: {} };
  }
}

// --- ACTION 2: SUBMIT BOOKING ---
export async function submitBooking(prevState: any, formData: FormData) {
  console.log("--- SUBMITTING BOOKING (DEBUG MODE) ---");
  
  const servicesRaw = formData.getAll('services');
  const servicesString = servicesRaw.join(', ');

  // FIX: Added '|| ""' to ensure we never pass null to Zod
  const rawData = {
    type: formData.get('type') || "",
    branch: formData.get('branch') || "",
    session: formData.get('session') || "",
    date: formData.get('date') || "",
    time: formData.get('time') || "",
    services: servicesRaw, 
    // FIX HERE: If fbLink is empty string "", logic now defaults to "" instead of falling through to null
    fbLink: formData.get('fbLink') || formData.get('fbName') || "", 
    firstName: formData.get('firstName') || "",
    lastName: formData.get('lastName') || "",
    phone: formData.get('phone') || "",
    others: formData.get('others') || "",
  };

  const validated = formSchema.safeParse(rawData);
  
  if (!validated.success) {
    // Return specific error for debugging
    console.error("Validation Error:", validated.error);
    return { success: false, message: validated.error.issues[0].message };
  }

  try {
    const { sheet, rows } = await getSheetRows();
    const data = validated.data;
    
    // 1. SMART HEADER MAPPING
    const headers = sheet.headerValues;
    console.log("Sheet Headers found:", headers);
    
    const phoneHeader = findHeaderKey(headers, "contact"); 
    const nameHeader = findHeaderKey(headers, "full name");
    const dateHeader = findHeaderKey(headers, "date");
    const timeHeader = findHeaderKey(headers, "time");
    const branchHeader = findHeaderKey(headers, "branch");
    
    console.log(`Using Headers -> Phone: "${phoneHeader}", Name: "${nameHeader}"`);

    // 2. PREPARE TARGETS
    const targetDate = normalizeDate(data.date);
    const displayTime = data.time.split(' - ')[0].trim();
    const targetTimeClean = getCleanTime(displayTime);
    const targetPhone = normalizePhone(data.phone);
    const shortBranch = BRANCH_MAP[data.branch] || data.branch;
    const longBranch = data.branch; 

    // 3. SCAN ROWS
    let slotCount = 0;
    let targetRowIndex = -1;
    let isMovingSlots = true; 

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      const rBranch = row.get(branchHeader);
      const rDate = normalizeDate(row.get(dateHeader));
      const rTime = getCleanTime(row.get(timeHeader));
      const rPhone = normalizePhone(row.get(phoneHeader));

      if (rBranch === shortBranch && rDate === targetDate && rTime === targetTimeClean) {
        slotCount++;
      }

      if (rPhone === targetPhone) {
        if (data.type === 'Reschedule') {
          console.log("-> Found Reschedule Match");
          targetRowIndex = i;
          isMovingSlots = true; 
        } 
        else if ((rBranch === shortBranch || rBranch === longBranch) && rDate === targetDate && rTime === targetTimeClean) {
          console.log("-> Found Duplicate Booking - Updating");
          targetRowIndex = i;
          isMovingSlots = false; 
        }
      }
    }

    // 4. CAPACITY CHECK
    if (isMovingSlots && slotCount >= MAX_CAPACITY_PER_SLOT) {
      return { 
        success: false, 
        message: `Sorry! The ${displayTime} slot is fully booked.` 
      };
    }

    // 5. SAVE
    const newRowData = {
      [branchHeader]: shortBranch,
      'FACEBOOK NAME': data.fbLink || "", 
      [nameHeader]: `${data.firstName} ${data.lastName}`,
      [phoneHeader]: data.phone, 
      [dateHeader]: targetDate, 
      [timeHeader]: displayTime, 
      'CLIENT #': "",
      'SERVICES': servicesString,
      'SESSION': data.session,
      'STATUS': data.type === 'Reschedule' ? 'Reschedule' : 'Pending',
      'ACK?': "NO ACK",
      'M O P': "",
      'REMARKS': data.others || "" 
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