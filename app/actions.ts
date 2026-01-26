'use server'

import { z } from 'zod';
import { 
  getAllServices, 
  saveService, 
  deleteService, 
  getAppConfig, 
  saveAppConfig,
  getSheetRows 
} from '@/lib/googleSheets';

// --- CONFIGURATION ACTIONS ---

/**
 * Fetches the dynamic configuration (Time Slots & Branches) from Google Sheets.
 * Used by the Frontend to render the correct options.
 */
export async function fetchAppConfig() {
  try {
    const config = await getAppConfig();
    return { success: true, data: config };
  } catch (error) {
    console.error("Config Fetch Error:", error);
    // Fallback defaults if sheet fails
    return { 
      success: false, 
      data: { 
        timeSlots: ["10:00 AM - 11:30 AM", "11:30 AM - 1:00 PM", "1:00 PM - 2:30 PM", "2:30 PM - 4:00 PM", "4:00 PM - 5:30 PM", "5:30 PM - 7:00 PM"], 
        branches: [{ name: "Lipa City", code: "LP", limit: 4 }] 
      } 
    };
  }
}

export async function updateTimeSlots(password: string, slots: string[]) {
  if (password !== process.env.ADMIN_PASSWORD) return { success: false, message: "Invalid Password" };
  try {
    await saveAppConfig('TIME_SLOTS', slots);
    return { success: true };
  } catch (e) {
    return { success: false, message: "Error updating time slots" };
  }
}

export async function updateBranches(password: string, branches: any[]) {
  if (password !== process.env.ADMIN_PASSWORD) return { success: false, message: "Invalid Password" };
  try {
    await saveAppConfig('BRANCH_CONFIG', branches);
    return { success: true };
  } catch (e) {
    return { success: false, message: "Error updating branches" };
  }
}

// --- SERVICE ACTIONS ---

export async function fetchServices() {
  try {
    const services = await getAllServices();
    return { success: true, data: services };
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function upsertService(prevState: any, formData: FormData) {
  const password = formData.get('adminPassword');
  if (password !== process.env.ADMIN_PASSWORD) {
    return { success: false, message: "Invalid Password" };
  }

  // Handle "PHP" prefix automatically
  let priceRaw = formData.get('price') as string;
  if (!priceRaw.toLowerCase().startsWith('₱') && !priceRaw.toLowerCase().startsWith('php')) {
    priceRaw = `₱${priceRaw.trim()}`;
  }

  const data = {
    id: formData.get('id') as string || `svc_${Date.now()}`,
    name: formData.get('name') as string,
    price: priceRaw,
    category: formData.get('category') as string,
    image: formData.get('image') as string,
    desc: formData.get('desc') as string,
  };

  try {
    await saveService(data);
    return { success: true, message: "Service Saved!" };
  } catch (error) {
    return { success: false, message: "Failed to save service." };
  }
}

export async function removeServiceAction(id: string, password: string) {
  if (password !== process.env.ADMIN_PASSWORD) return { success: false };
  try {
    await deleteService(id);
    return { success: true };
  } catch (e) {
    return { success: false };
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

// Helpers
function normalizeStr(str: any) { return String(str).trim().toLowerCase(); }
function normalizeDate(raw: any) {
  if (!raw) return "";
  let str = String(raw).trim();
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
function getCleanTime(timeStr: any) { return String(timeStr).split(' - ')[0].trim().toLowerCase(); }
function normalizePhone(str: any) { 
  if (!str) return "";
  let clean = String(str).replace(/\D/g, ''); 
  if (clean.startsWith('63')) clean = '0' + clean.slice(2);
  if (clean.startsWith('9') && clean.length === 10) clean = '0' + clean;
  return clean;
}
function findColumnKey(headers: string[], keyword: string) {
  if (headers.includes(keyword)) return keyword;
  const normKeyword = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');
  return headers.find(h => h.toLowerCase().replace(/[^a-z0-9]/g, '') === normKeyword);
}

// --- ACTION: CHECK AVAILABILITY ---
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
    const targetDate = normalizeDate(date);
    const targetFullBranch = normalizeStr(branch);
    const targetShortBranch = normalizeStr(BRANCH_MAP[branch] || branch);
    const limit = BRANCH_LIMITS[BRANCH_MAP[branch] || branch] || 4;

    if (rows) {
      rows.forEach((row) => {
        const rDate = normalizeDate(row.get(KEY_DATE));
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

// --- ACTION: SUBMIT BOOKING ---
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
    const targetDate = normalizeDate(data.date);
    const shortBranch = BRANCH_MAP[data.branch] || data.branch;
    const targetShortBranch = normalizeStr(shortBranch);
    const targetFullBranch = normalizeStr(data.branch);
    const targetTimeClean = getCleanTime(data.time);
    const targetPhone = normalizePhone(data.phone);
    const limit = BRANCH_LIMITS[shortBranch] || 4;
    const displayTime = data.time.split(' - ')[0].trim();

    // DESIRED DATA MAPPING
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
      "ACK?": data.ack,
      "M O P": data.mop,
      "REMARKS": data.others || "",
      "TYPE": data.type || ""
    };

    // CHECK AVAILABILITY
    const KEY_BRANCH = findColumnKey(headers, "BRANCH");
    const KEY_DATE = findColumnKey(headers, "DATE");
    const KEY_TIME = findColumnKey(headers, "TIME");
    const KEY_PHONE = findColumnKey(headers, "Contact Number");

    let slotCount = 0;
    
    if (rows && KEY_BRANCH && KEY_DATE && KEY_TIME && KEY_PHONE) {
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const rDate = normalizeDate(row.get(KEY_DATE));
          const rBranch = normalizeStr(row.get(KEY_BRANCH));
          const rTime = getCleanTime(row.get(KEY_TIME));

          if ((rBranch === targetShortBranch || rBranch === targetFullBranch) && 
              rDate === targetDate && 
              rTime === targetTimeClean) {
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

    // WRITE TO SHEET
    const rowPayload: Record<string, any> = {};
    Object.entries(desiredData).forEach(([key, value]) => {
      const actualHeader = findColumnKey(headers, key);
      if (actualHeader) rowPayload[actualHeader] = value;
    });

    await sheet.addRow(rowPayload);
    return { success: true, message: "Booking Confirmed! See you there." };

  } catch (error) {
    console.error("Sheet Error:", error);
    const msg = error instanceof Error ? error.message : "System Busy";
    return { success: false, message: `System Error: ${msg}` };
  }
}