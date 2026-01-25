'use server'

import { z } from 'zod';
import { getSheetRows } from '@/lib/googleSheets';

// --- CONFIGURATION ---
// REMOVED: const MAX_CAPACITY_PER_SLOT = 4;

const BRANCH_MAP: Record<string, string> = {
  "Parañaque, Metro Manila": "PQ",
  "Lipa, Batangas": "LP",
  "San Pablo, Laguna": "SP",
  "Novaliches, Quezon City": "NV",
  "Dasmariñas, Cavite": "DM",
  "Comembo, Taguig": "TG"
};

// NEW: Define capacity per branch short code
const BRANCH_CAPACITY: Record<string, number> = {
  "LP": 4,
  "SP": 2,
  "NV": 4,
  "DM": 6,
  "PQ": 4,
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
function normalize(str: any) {
  return str ? String(str).trim().toLowerCase() : "";
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
  return String(timeStr).split(' - ')[0].trim().toLowerCase(); 
}

// --- ACTION 1: CHECK AVAILABILITY ---
export async function getSlotAvailability(date: string, branch: string) {
  try {
    const { sheet, rows } = await getSheetRows();
    const counts: Record<string, number> = {};
    const targetDate = normalizeDate(date);
    const shortBranch = BRANCH_MAP[branch] || branch;
    
    // NEW: Get the specific capacity for this branch (default to 4 if not found)
    const maxCapacity = BRANCH_CAPACITY[shortBranch] || 4;

    const branchKey = "BRANCH";
    const dateKey = "DATE";
    const timeKey = "TIME";

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

    // NEW: Return maxCapacity so the frontend knows when to disable buttons
    return { success: true, counts, maxCapacity };
  } catch (error) {
    console.error("Availability Error:", error);
    return { success: false, counts: {}, maxCapacity: 4 };
  }
}

// --- ACTION 2: SUBMIT BOOKING ---
export async function submitBooking(prevState: any, formData: FormData) {
  console.log("--- SUBMITTING BOOKING ---");
  
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
  
  if (!validated.success) {
    return { success: false, message: validated.error.issues[0].message };
  }

  try {
    const { sheet, rows } = await getSheetRows();
    const data = validated.data;
    
    // 1. PREPARE TARGETS
    const targetDate = normalizeDate(data.date);
    const displayTime = data.time.split(' - ')[0].trim();
    const targetTimeClean = getCleanTime(displayTime);
    const targetPhone = normalizePhone(data.phone);
    const shortBranch = BRANCH_MAP[data.branch] || data.branch;
    
    // NEW: Determine max capacity dynamically
    const maxCapacity = BRANCH_CAPACITY[shortBranch] || 4;

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
      const rBranch = row.get(colBranch);
      const rDate = normalizeDate(row.get(colDate));
      const rTime = getCleanTime(row.get(colTime));
      const rPhone = normalizePhone(row.get(colPhone));

      if (rBranch === shortBranch && rDate === targetDate && rTime === targetTimeClean) {
        slotCount++;
      }

      if (rPhone === targetPhone) {
        if (data.type === 'Reschedule') {
          targetRowIndex = i;
          isMovingSlots = true; 
        } 
        else if (rBranch === shortBranch && rDate === targetDate && rTime === targetTimeClean) {
          targetRowIndex = i;
          isMovingSlots = false; 
        }
      }
    }

    // NEW: Use dynamic maxCapacity instead of constant
    if (isMovingSlots && slotCount >= maxCapacity) {
      return { 
        success: false, 
        message: `Sorry! The ${displayTime} slot is fully booked (Max ${maxCapacity}).` 
      };
    }

    // 3. MAP TO SHEET COLUMNS (A-N)
    const newRowData = {
      'BRANCH': shortBranch,                    
      'FACEBOOK NAME': data.fbLink || "",       
      'FULL NAME': `${data.firstName} ${data.lastName}`, 
      'Contact Number': data.phone,             
      'DATE': targetDate,                       
      'TIME': displayTime,                      
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