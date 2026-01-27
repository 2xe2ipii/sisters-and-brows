'use server'

import { z } from 'zod';
import { 
  getAllServices, 
  getAppConfig, 
  getSheetRows 
} from '@/lib/googleSheets';

// --- FETCH ACTIONS ---

export async function fetchAppConfig() {
  try {
    const config = await getAppConfig();
    return { success: true, data: config };
  } catch (error) {
    console.error("Config Fetch Error:", error);
    return { success: false, data: { timeSlots: [], branches: [] } };
  }
}

export async function fetchServices() {
  try {
    const services = await getAllServices();
    return { success: true, data: services };
  } catch (error) {
    console.error("Services Fetch Error:", error);
    return { success: false, data: [] };
  }
}

// --- BOOKING LOGIC ---

// Helper to load dynamic maps
async function getDynamicConfig() {
  const config = await getAppConfig();
  const BRANCH_MAP: Record<string, string> = {};
  const BRANCH_LIMITS: Record<string, number> = {};
  
  if (config.branches && Array.isArray(config.branches)) {
    config.branches.forEach((b: any) => {
      BRANCH_MAP[b.name] = b.code;
      BRANCH_LIMITS[b.code] = b.limit;
    });
  }
  
  return { BRANCH_MAP, BRANCH_LIMITS };
}

// Helper: Generate Unique Reference Code (e.g., R-X92B1)
function generateRefCode() {
  return 'R-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// Data Normalization Helpers
function normalizeStr(str: any) { return String(str).trim().toLowerCase(); }

// [FIXED] Accepts targetYear to align Sheet Data (Jan 28) with Booking Year (2026)
function normalizeDate(raw: any, targetYear?: number) {
  if (!raw) return "";
  
  // 1. Convert to string and clean aggressively (remove extra spaces)
  let str = String(raw).trim().replace(/-/g, ' '); // Handle "Jan-28" -> "Jan 28"
  
  // 2. Handle "Jan 28" pattern
  // We match Alphabets + Separator + Digits
  const match = str.match(/^([A-Za-z]+)[\s-]?(\d{1,2})$/);
  
  if (match) {
    // Force year to ensure match (Default to current, or use targetYear if provided)
    const month = match[1];
    const day = match[2];
    const yearToUse = targetYear || new Date().getFullYear();
    str = `${month} ${day} ${yearToUse}`;
  }
  
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  
  // If targetYear is provided, OVERRIDE the year (crucial for 2026 bookings vs 2025/2001 defaults)
  let year = d.getFullYear();
  if (targetYear) {
    year = targetYear;
  }

  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// [NEW] Formats YYYY-MM-DD back to "Jan-28" for saving to Sheet
function normalizeSheetDate(isoDate: string) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]}-${d.getDate()}`;
}

function getCleanTime(timeStr: any) { return String(timeStr).split(' - ')[0].trim().toLowerCase(); }

function findColumnKey(headers: string[], keyword: string) {
  if (headers.includes(keyword)) return keyword;
  const normKeyword = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');
  return headers.find(h => h.toLowerCase().replace(/[^a-z0-9]/g, '') === normKeyword);
}

// --- CHECK AVAILABILITY ---
export async function getSlotAvailability(date: string, branch: string) {
  const { BRANCH_MAP, BRANCH_LIMITS } = await getDynamicConfig();
  
  try {
    const { sheet, rows } = await getSheetRows();
    if (!sheet) return { success: false, counts: {}, limit: 4 };

    if (!sheet.headerValues) await sheet.loadHeaderRow();
    const headers = sheet.headerValues;

    const KEY_BRANCH = findColumnKey(headers, "BRANCH") || "BRANCH";
    const KEY_DATE = findColumnKey(headers, "DATE") || "DATE";
    const KEY_TIME = findColumnKey(headers, "TIME") || "TIME";

    const counts: Record<string, number> = {};
    
    // [FIX] Extract year from requested date
    const requestedDateObj = new Date(date);
    const targetYear = requestedDateObj.getFullYear();

    const targetDate = normalizeDate(date, targetYear);
    const targetFullBranch = normalizeStr(branch);
    const targetShortBranch = normalizeStr(BRANCH_MAP[branch] || branch);
    const limit = BRANCH_LIMITS[BRANCH_MAP[branch] || branch] || 4;

    if (rows) {
      rows.forEach((row) => {
        // [FIX] Pass targetYear to normalizeDate so Sheet rows (Jan 28) match Booking (2026)
        const rDate = normalizeDate(row.get(KEY_DATE), targetYear);
        const rBranch = normalizeStr(row.get(KEY_BRANCH));
        const rTime = getCleanTime(row.get(KEY_TIME));

        if ((rBranch === targetShortBranch || rBranch === targetFullBranch) && rDate === targetDate) {
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

// --- SUBMIT BOOKING ---
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

export async function submitBooking(prevState: any, formData: FormData) {
  const { BRANCH_MAP, BRANCH_LIMITS } = await getDynamicConfig();

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
    ack: formData.get('ack') || "NO ACK",
    mop: formData.get('mop') || "Cash",
  };

  const validated = formSchema.safeParse(rawData);
  if (!validated.success) return { success: false, message: validated.error.issues[0].message };

  try {
    const data = validated.data;
    const { sheet, rows } = await getSheetRows();
    if (!sheet) throw new Error("Database Sheet Missing");
    
    if (!sheet.headerValues) await sheet.loadHeaderRow();
    const headers = sheet.headerValues;

    // PREPARE DATA
    const bookingDateObj = new Date(data.date);
    const targetYear = bookingDateObj.getFullYear();

    const targetDate = normalizeDate(data.date, targetYear);
    const shortBranch = BRANCH_MAP[data.branch] || data.branch;
    const targetShortBranch = normalizeStr(shortBranch);
    const targetFullBranch = normalizeStr(data.branch);
    const limit = BRANCH_LIMITS[shortBranch] || 4;
    const displayTime = data.time.split(' - ')[0].trim();

    // AVAILABILITY CHECK
    const KEY_BRANCH = findColumnKey(headers, "BRANCH");
    const KEY_DATE = findColumnKey(headers, "DATE");
    const KEY_TIME = findColumnKey(headers, "TIME");
    
    let slotCount = 0;
    
    if (rows && KEY_BRANCH && KEY_DATE && KEY_TIME) {
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          // [FIX] Pass targetYear here too for Booking Limits
          const rDate = normalizeDate(row.get(KEY_DATE), targetYear);
          const rBranch = normalizeStr(row.get(KEY_BRANCH));
          const rTime = getCleanTime(row.get(KEY_TIME));

          if ((rBranch === targetShortBranch || rBranch === targetFullBranch) && 
              rDate === targetDate && 
              rTime === getCleanTime(data.time)) {
            slotCount++;
          }
        }
    }

    if (slotCount >= limit) {
      return { 
        success: false, 
        message: `Sorry! The ${displayTime} slot at ${data.branch} is full (Max ${limit}).` 
      };
    }

    // GENERATE UNIQUE REFERENCE ID
    const refCode = generateRefCode();

    // WRITE TO SHEET
    const desiredData: Record<string, string> = {
      "BRANCH": shortBranch,
      "FACEBOOK NAME": data.fbLink || "",
      "FULL NAME": `${data.firstName} ${data.lastName}`,
      "Contact Number": data.phone,
      "DATE": normalizeSheetDate(data.date), // Save as "Jan-28"
      "TIME": displayTime,
      "CLIENT #": refCode, // [FIX] Insert Unique ID
      "SERVICES": servicesString,
      "SESSION": data.session,
      "STATUS": "Pending",
      "ACK?": data.ack,
      "M O P": data.mop,
      "REMARKS": data.others || "",
      "TYPE": data.type || "New Appointment"
    };

    const rowPayload: Record<string, any> = {};
    Object.entries(desiredData).forEach(([key, value]) => {
      const actualHeader = findColumnKey(headers, key);
      if (actualHeader) rowPayload[actualHeader] = value;
    });

    await sheet.addRow(rowPayload);
    
    // Return the Ref Code so the UI can display it
    return { success: true, message: "Booking Confirmed! See you there.", refCode };

  } catch (error) {
    console.error("Sheet Error:", error);
    const msg = error instanceof Error ? error.message : "System Busy";
    return { success: false, message: `System Error: ${msg}` };
  }
}

// --- RESCHEDULE UTILITY (To be called when user confirms reschedule) ---
export async function cancelBooking(refCode: string) {
  if (!refCode) return { success: false, message: "No Reference Code provided" };

  try {
    const { sheet, rows } = await getSheetRows();
    if (!sheet) throw new Error("Database Unavailable");
    if (!sheet.headerValues) await sheet.loadHeaderRow();
    
    const KEY_CLIENT_NUM = findColumnKey(sheet.headerValues, "CLIENT #");
    if (!KEY_CLIENT_NUM) throw new Error("CLIENT # column not found");

    const rowToDelete = rows.find(r => String(r.get(KEY_CLIENT_NUM)).trim() === refCode.trim());

    if (rowToDelete) {
      await rowToDelete.delete();
      return { success: true, message: "Old booking removed." };
    } else {
      return { success: false, message: "Booking not found." };
    }
  } catch (error) {
    console.error("Cancel Error:", error);
    return { success: false, message: "Failed to remove old booking." };
  }
}