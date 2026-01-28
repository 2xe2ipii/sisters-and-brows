'use server'

import { z } from 'zod';
import { 
  getAllServices, 
  getAppConfig, 
  getSheetRows,
  getDoc 
} from '@/lib/googleSheets';

// --- TYPES ---
export type BookingState = {
  success: boolean;
  message: string;
  refCode: string;
  data?: Record<string, string>;
};

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
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'; // No O, No 0
  let result = 'R-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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
  const parts = isoDate.split('-');
  if (parts.length === 3) {
     const monthIndex = parseInt(parts[1], 10) - 1;
     const day = parseInt(parts[2], 10);
     const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
     return `${months[monthIndex]}-${day}`;
  }
  return isoDate;
}

function getStrictTime(timeStr: any): string { 
  if (!timeStr) return "";
  const firstPart = String(timeStr).split('-')[0]; 
  return firstPart.replace(/[\s\u200B\u202F\u00A0]/g, '').toLowerCase(); 
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
    const doc = await getDoc();
    const rawSheet = doc.sheetsByTitle["Raw_Intake"];
    
    if (!rawSheet) return { success: false, counts: {}, limit: 4 };

    await rawSheet.loadHeaderRow(); 
    const rows = await rawSheet.getRows();
    const headers = rawSheet.headerValues;

    const uniqueBookings: Record<string, Set<string>> = {};
    const limit = BRANCH_LIMITS[BRANCH_MAP[branch] || branch] || 4;

    const requestedDateObj = new Date(date);
    const targetYear = requestedDateObj.getFullYear();
    const targetDate = normalizeDate(date, targetYear);
    const targetFullBranch = normalizeStr(branch);
    const targetShortBranch = normalizeStr(BRANCH_MAP[branch] || branch);

    const KEY_BRANCH = findColumnKey(headers, "BRANCH");
    const KEY_DATE = findColumnKey(headers, "DATE");
    const KEY_TIME = findColumnKey(headers, "TIME");
    const KEY_CLIENT = findColumnKey(headers, "CLIENT #");

    if (KEY_BRANCH && KEY_DATE && KEY_TIME) {
        rows.forEach((row) => {
            const rDate = normalizeDate(String(row.get(KEY_DATE) || ""), targetYear);
            const rBranch = normalizeStr(String(row.get(KEY_BRANCH) || ""));
            const rTimeStrict = getStrictTime(String(row.get(KEY_TIME) || ""));
            
            const refCode = KEY_CLIENT ? String(row.get(KEY_CLIENT) || "").trim().toUpperCase() : `NOID_${Math.random()}`;

            if ((rBranch === targetShortBranch || rBranch === targetFullBranch) && rDate === targetDate) {
                if (!uniqueBookings[rTimeStrict]) {
                    uniqueBookings[rTimeStrict] = new Set();
                }
                if (refCode.length > 1) {
                    uniqueBookings[rTimeStrict].add(refCode);
                }
            }
        });
    }

    const counts: Record<string, number> = {};
    Object.keys(uniqueBookings).forEach(timeKey => {
        counts[timeKey] = uniqueBookings[timeKey].size;
    });

    return { success: true, counts, limit };
  } catch (error) {
    console.error("Availability Error:", error);
    return { success: false, counts: {}, limit: 4 };
  }
}

// --- LOOKUP BOOKING ---
export async function lookupBooking(refCode: string) {
  try {
    const { sheet, rows } = await getSheetRows();
    if (!sheet || !rows) return { success: false, message: "Database unavailable" };
    
    if (!sheet.headerValues) await sheet.loadHeaderRow();
    const headers = sheet.headerValues;

    const KEY_CLIENT = findColumnKey(headers, "CLIENT #");
    if (!KEY_CLIENT) return { success: false, message: "System Error: No ID column" };

    const match = rows.find(r => String(r.get(KEY_CLIENT)).trim().toUpperCase() === refCode.trim().toUpperCase());

    if (!match) return { success: false, message: "Booking Reference not found." };

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

    const rawDate = KEY_DATE ? String(match.get(KEY_DATE)) : "";
    const normalizedDate = normalizeDate(rawDate, new Date().getFullYear()); 

    const { BRANCH_MAP } = await getDynamicConfig();
    const rawBranch = KEY_BRANCH ? String(match.get(KEY_BRANCH)) : "";
    const branchName = Object.keys(BRANCH_MAP).find(key => BRANCH_MAP[key] === rawBranch) || rawBranch;

    return {
      success: true,
      data: {
        firstName,
        lastName,
        phone: KEY_PHONE ? String(match.get(KEY_PHONE)) : "",
        fbLink: KEY_FB ? String(match.get(KEY_FB)) : "",
        branch: String(branchName), 
        date: normalizedDate, 
        session: KEY_SESSION ? String(match.get(KEY_SESSION)) : "1ST",
        services: KEY_SERVICES ? String(match.get(KEY_SERVICES)) : ""
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
  
  // MAIN BOOKER
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  
  // OTHERS (JSON Stringified Array)
  others: z.string().optional(), // Now stores JSON of extra people
});

export async function submitBooking(prevState: any, formData: FormData): Promise<BookingState> {
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
    others: String(formData.get('others') || "[]"), 
  };

  const validated = formSchema.safeParse(rawData);
  if (!validated.success) return { success: false, message: validated.error.issues[0].message, refCode: '' };

  try {
    const data = validated.data;
    const doc = await getDoc();
    const rawSheet = doc.sheetsByTitle["Raw_Intake"];
    if (!rawSheet) throw new Error("Database Sheet Missing");

    await rawSheet.loadHeaderRow();
    const rows = await rawSheet.getRows();
    const headers = rawSheet.headerValues;

    // Parse "Others"
    let otherPeople: string[] = [];
    try {
      otherPeople = JSON.parse(data.others || "[]");
    } catch (e) {
      console.error("Failed to parse others", e);
    }
    const totalPeopleCount = 1 + otherPeople.length;

    // --- CHECK AVAILABILITY (Considering Group Size) ---
    const shortBranch = BRANCH_MAP[data.branch] || data.branch;
    const targetYear = new Date(data.date).getFullYear();
    const targetDate = normalizeDate(data.date, targetYear);
    const cleanTargetTime = getStrictTime(data.time);
    
    // Count existing bookings for this slot
    const limit = BRANCH_LIMITS[shortBranch] || 4;
    const uniqueBookings = new Set<string>();
    
    // ... (Use your existing availability logic, loop through rows, add to uniqueBookings)
    // IMPORTANT: Check if there's enough space for ALL people in this request
    const currentCount = uniqueBookings.size; // You need to implement the loop here similar to existing code
    
    // (Re-implementing loop for context)
    const KEY_BRANCH = findColumnKey(headers, "BRANCH");
    const KEY_DATE = findColumnKey(headers, "DATE");
    const KEY_TIME = findColumnKey(headers, "TIME");
    const KEY_CLIENT = findColumnKey(headers, "CLIENT #");

    if (KEY_BRANCH && KEY_DATE && KEY_TIME) {
       rows.forEach((row) => {
          const rDate = normalizeDate(String(row.get(KEY_DATE) || ""), targetYear);
          const rTime = getStrictTime(String(row.get(KEY_TIME) || ""));
          const ref = KEY_CLIENT ? String(row.get(KEY_CLIENT) || "").trim() : "";
          
          if (rDate === targetDate && rTime === cleanTargetTime && ref.length > 1) {
             uniqueBookings.add(ref);
          }
       });
    }

    if (uniqueBookings.size + totalPeopleCount > limit) {
       return { success: false, message: `Not enough slots! (${limit - uniqueBookings.size} left)`, refCode: '' };
    }

    // --- PREPARE ROWS TO ADD ---
    const rowsToAdd = [];
    const mainRefCode = generateRefCode(); // Generate for Main Booker

    // 1. MAIN BOOKER ROW
    rowsToAdd.push({
      "BRANCH": shortBranch,
      "FACEBOOK NAME": data.fbLink || "",
      "FULL NAME": `${data.firstName} ${data.lastName}`,
      "Contact Number": data.phone,
      "DATE": normalizeSheetDate(data.date), 
      "TIME": data.time.split(' - ')[0].trim(),
      "CLIENT #": mainRefCode, 
      "SERVICES": servicesString,
      "SESSION": data.session,
      "STATUS": "Pending",
      "ACK?": "NO ACK", // Default
      "M O P": "Cash",  // Default
      "REMARKS": "",    // Remarks removed from form, default empty
      "TYPE": data.type || "New Appointment"
    });

    // 2. OTHER PEOPLE ROWS (Minimal Data)
    otherPeople.forEach(name => {
       const otherRef = generateRefCode(); // Unique ID for each person
       rowsToAdd.push({
          "BRANCH": shortBranch, // Needed for sorting
          "FACEBOOK NAME": "",
          "FULL NAME": name,
          "Contact Number": "", // Not needed per requirement
          "DATE": normalizeSheetDate(data.date), // Needed for sorting
          "TIME": data.time.split(' - ')[0].trim(), // Needed for sorting
          "CLIENT #": otherRef,
          "SERVICES": "", // Services usually shared or empty? Assuming empty for now or copy if needed
          "SESSION": data.session,
          "STATUS": "Pending",
          "ACK?": "NO ACK",
          "M O P": "Cash",
          "REMARKS": `With ${data.firstName}`,
          "TYPE": "Joiner"
       });
    });

    // --- WRITE ALL ROWS ---
    for (const rowPayload of rowsToAdd) {
       const formattedPayload: Record<string, any> = {};
       Object.entries(rowPayload).forEach(([key, value]) => {
          const actualHeader = findColumnKey(headers, key);
          if (actualHeader) formattedPayload[actualHeader] = value;
       });
       await rawSheet.addRow(formattedPayload);
    }
    
    return { 
        success: true, 
        message: "Booking Confirmed!", 
        refCode: mainRefCode, 
        data: { firstName: data.firstName } as any 
    };

  } catch (error) {
    console.error("Sheet Error:", error);
    return { success: false, message: "System Error", refCode: '' };
  }
}