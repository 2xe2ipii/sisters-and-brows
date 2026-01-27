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

function generateRefCode() {
  return 'R-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function normalizeStr(str: any): string { 
  return String(str || "").trim().toLowerCase(); 
}

function normalizeDate(raw: any, targetYear?: number): string {
  if (!raw) return "";
  let str = String(raw).trim().replace(/-/g, ' '); 
  
  const match = str.match(/^([A-Za-z]+)[\s-]?(\d{1,2})$/);
  if (match) {
    const month = match[1];
    const day = match[2];
    const yearToUse = targetYear || new Date().getFullYear();
    str = `${month} ${day} ${yearToUse}`;
  }
  
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  
  let year = d.getFullYear();
  if (targetYear) year = targetYear;

  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

function normalizeSheetDate(isoDate: string): string {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]}-${d.getDate()}`;
}

// [FIX] Simplifed to match UI Keys (e.g. "10:00 AM")
function getCleanTime(timeStr: any): string { 
  if (!timeStr) return "";
  return String(timeStr).split(' - ')[0].trim(); 
}

function findColumnKey(headers: string[], keyword: string): string | undefined {
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

    const KEY_BRANCH = findColumnKey(headers, "BRANCH");
    const KEY_DATE = findColumnKey(headers, "DATE");
    const KEY_TIME = findColumnKey(headers, "TIME");

    const counts: Record<string, number> = {};
    
    const requestedDateObj = new Date(date);
    const targetYear = requestedDateObj.getFullYear();
    const targetDate = normalizeDate(date, targetYear);
    
    const targetFullBranch = normalizeStr(branch);
    const targetShortBranch = normalizeStr(BRANCH_MAP[branch] || branch);
    const limit = BRANCH_LIMITS[BRANCH_MAP[branch] || branch] || 4;

    if (rows && KEY_BRANCH && KEY_DATE && KEY_TIME) {
      rows.forEach((row) => {
        // [FIX] Ensure get() receives string key, safe navigation
        const rDate = normalizeDate(row.get(KEY_DATE!), targetYear);
        const rBranch = normalizeStr(row.get(KEY_BRANCH!));
        const rTime = getCleanTime(row.get(KEY_TIME!));

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

// --- LOOKUP BOOKING (FOR RESCHEDULE) ---
export async function lookupBooking(refCode: string) {
  try {
    const { sheet, rows } = await getSheetRows();
    if (!sheet || !rows) return { success: false, message: "Database unavailable" };
    
    if (!sheet.headerValues) await sheet.loadHeaderRow();
    const headers = sheet.headerValues;

    const KEY_CLIENT = findColumnKey(headers, "CLIENT #");
    if (!KEY_CLIENT) return { success: false, message: "System Error: No ID column" };

    const match = rows.find(r => String(r.get(KEY_CLIENT!)).trim().toUpperCase() === refCode.trim().toUpperCase());

    if (!match) return { success: false, message: "Booking Reference not found." };

    // Map fields back to form data
    const KEY_BRANCH = findColumnKey(headers, "BRANCH");
    const KEY_DATE = findColumnKey(headers, "DATE");
    const KEY_FIRST = findColumnKey(headers, "FULL NAME"); 
    const KEY_PHONE = findColumnKey(headers, "Contact Number");
    const KEY_FB = findColumnKey(headers, "FACEBOOK NAME");
    const KEY_SESSION = findColumnKey(headers, "SESSION");
    const KEY_SERVICES = findColumnKey(headers, "SERVICES");

    const fullName = KEY_FIRST ? String(match.get(KEY_FIRST)) : "";
    const nameParts = fullName.split(' ');
    const lastName = nameParts.length > 1 ? nameParts.pop() || "" : "";
    const firstName = nameParts.join(' ') || fullName;

    const rawDate = KEY_DATE ? match.get(KEY_DATE) : "";
    const normalizedDate = normalizeDate(rawDate, new Date().getFullYear()); 

    // Reverse Map Branch Code to Name
    const { BRANCH_MAP } = await getDynamicConfig();
    const rawBranch = KEY_BRANCH ? match.get(KEY_BRANCH) : "";
    const branchName = Object.keys(BRANCH_MAP).find(key => BRANCH_MAP[key] === rawBranch) || rawBranch;

    return {
      success: true,
      data: {
        firstName,
        lastName,
        phone: KEY_PHONE ? match.get(KEY_PHONE) : "",
        fbLink: KEY_FB ? match.get(KEY_FB) : "",
        branch: String(branchName), 
        date: normalizedDate, 
        session: KEY_SESSION ? match.get(KEY_SESSION) : "1ST",
        services: KEY_SERVICES ? match.get(KEY_SERVICES) : ""
      }
    };
  } catch (error) {
    console.error("Lookup Error:", error);
    return { success: false, message: "Error finding booking." };
  }
}

// --- SUBMIT BOOKING ---
const formSchema = z.object({
  type: z.string().optional(),
  oldRefCode: z.string().optional(), 
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
    type: String(formData.get('type') || "New Appointment"), 
    oldRefCode: String(formData.get('oldRefCode') || ""),
    branch: String(formData.get('branch') || ""),
    session: String(formData.get('session') || ""),
    date: String(formData.get('date') || ""),
    time: String(formData.get('time') || ""),
    services: servicesRaw, 
    fbLink: String(formData.get('fbLink') || ""), 
    firstName: String(formData.get('firstName') || ""),
    lastName: String(formData.get('lastName') || ""),
    phone: String(formData.get('phone') || ""),
    others: String(formData.get('others') || ""),
    ack: (formData.get('ack') as "ACK" | "NO ACK") || "NO ACK",
    mop: (formData.get('mop') as any) || "Cash",
  };

  const validated = formSchema.safeParse(rawData);
  if (!validated.success) return { success: false, message: validated.error.issues[0].message, refCode: '' };

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
    const cleanTargetTime = getCleanTime(data.time);

    // AVAILABILITY CHECK
    const KEY_BRANCH = findColumnKey(headers, "BRANCH");
    const KEY_DATE = findColumnKey(headers, "DATE");
    const KEY_TIME = findColumnKey(headers, "TIME");
    const KEY_CLIENT = findColumnKey(headers, "CLIENT #");
    
    // Check Limits
    let slotCount = 0;
    if (rows && KEY_BRANCH && KEY_DATE && KEY_TIME) {
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const rDate = normalizeDate(row.get(KEY_DATE!), targetYear);
          const rBranch = normalizeStr(row.get(KEY_BRANCH!));
          const rTime = getCleanTime(row.get(KEY_TIME!));

          if ((rBranch === targetShortBranch || rBranch === targetFullBranch) && 
              rDate === targetDate && 
              rTime === cleanTargetTime) {
            
            // If Rescheduling, Ignore the OLD booking in the count
            if (data.type === 'Reschedule' && data.oldRefCode && KEY_CLIENT) {
               const rRef = String(row.get(KEY_CLIENT)).trim();
               if (rRef === String(data.oldRefCode).trim()) continue; 
            }
            
            slotCount++;
          }
        }
    }

    if (slotCount >= limit) {
      return { 
        success: false, 
        message: `Sorry! The ${displayTime} slot at ${data.branch} is full (Max ${limit}).`,
        refCode: ''
      };
    }

    // --- RESCHEDULE LOGIC: DELETE OLD ENTRY ---
    let finalRefCode = generateRefCode();
    
    if (data.type === 'Reschedule' && data.oldRefCode && KEY_CLIENT) {
       // Find and delete old row
       const rowToDelete = rows?.find(r => String(r.get(KEY_CLIENT!)).trim() === String(data.oldRefCode).trim());
       if (rowToDelete) {
         await rowToDelete.delete();
         finalRefCode = String(data.oldRefCode).trim(); // PRESERVE ID
       }
    }

    // WRITE NEW ROW
    const desiredData: Record<string, string> = {
      "BRANCH": shortBranch,
      "FACEBOOK NAME": data.fbLink || "",
      "FULL NAME": `${data.firstName} ${data.lastName}`,
      "Contact Number": data.phone,
      "DATE": normalizeSheetDate(data.date), 
      "TIME": displayTime,
      "CLIENT #": finalRefCode, 
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
    
    return { success: true, message: "Booking Confirmed! See you there.", refCode: finalRefCode };

  } catch (error) {
    console.error("Sheet Error:", error);
    const msg = error instanceof Error ? error.message : "System Busy";
    return { success: false, message: `System Error: ${msg}`, refCode: '' };
  }
}