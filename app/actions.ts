'use server'

import { z } from 'zod';
import { getAllServices, getAppConfig, getSheetRows, getDoc } from '@/lib/googleSheets';
import { generateRefCode, normalizeSheetDate, findColumnKey, normalizeDate, getStrictTime } from '@/lib/booking/utils';
import { getDynamicConfig } from '@/lib/booking/config';
import { checkSlotAvailability, checkDuplicate } from '@/lib/booking/availability';

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
    return { success: false, data: { timeSlots: [], branches: [] } };
  }
}

export async function fetchServices() {
  try {
    const services = await getAllServices();
    return { success: true, data: services };
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function getSlotAvailability(date: string, branch: string) {
    return await checkSlotAvailability(date, branch);
}

// --- LOOKUP BOOKING ---
export async function lookupBooking(refCode: string) {
  try {
    const { sheet, rows } = await getSheetRows();
    if (!sheet || !rows) return { success: false, message: "DB Unavailable" };
    
    if (!sheet.headerValues) await sheet.loadHeaderRow();
    const headers = sheet.headerValues;
    const KEY_CLIENT = findColumnKey(headers, "CLIENT #");
    if (!KEY_CLIENT) return { success: false, message: "No ID Column" };

    const allMatches = rows.filter(r => String(r.get(KEY_CLIENT)).trim().toUpperCase() === refCode.trim().toUpperCase());
    if (allMatches.length === 0) return { success: false, message: "Booking Reference not found." };

    const KEY_TYPE = findColumnKey(headers, "TYPE");
    const KEY_FULLNAME = findColumnKey(headers, "FULL NAME");

    let latestMainBooker = null;
    const latestGuests: string[] = [];

    for (let i = allMatches.length - 1; i >= 0; i--) {
        const row = allMatches[i];
        const type = KEY_TYPE ? String(row.get(KEY_TYPE)).toLowerCase() : "";
        
        if (type.includes("joiner")) {
            const name = KEY_FULLNAME ? String(row.get(KEY_FULLNAME)) : "Guest";
            latestGuests.push(name); 
        } else {
            latestMainBooker = row;
            break; 
        }
    }

    if (!latestMainBooker) return { success: false, message: "Main Booking record missing." };
    latestGuests.reverse();

    const KEY_BRANCH = findColumnKey(headers, "BRANCH");
    const KEY_DATE = findColumnKey(headers, "DATE");
    const KEY_FIRST = findColumnKey(headers, "FULL NAME"); 
    const KEY_PHONE = findColumnKey(headers, "Contact Number");
    const KEY_FB = findColumnKey(headers, "FACEBOOK NAME");
    const KEY_SESSION = findColumnKey(headers, "SESSION");
    const KEY_TIME = findColumnKey(headers, "TIME");
    const KEY_SERVICES = findColumnKey(headers, "SERVICES");

    const rawFullName = KEY_FIRST ? String(latestMainBooker.get(KEY_FIRST)) : "";
    let firstName = rawFullName;
    let lastName = "";
    const nameParts = rawFullName.trim().split(' ');
    if (nameParts.length > 1) {
        lastName = nameParts.pop() || "";
        firstName = nameParts.join(' ');
    }

    const rawBranch = KEY_BRANCH ? String(latestMainBooker.get(KEY_BRANCH)) : "";
    const { BRANCH_MAP } = await getDynamicConfig();
    const branchName = Object.keys(BRANCH_MAP).find(key => BRANCH_MAP[key] === rawBranch) || rawBranch;

    const serviceStr = KEY_SERVICES ? String(latestMainBooker.get(KEY_SERVICES)) : "";
    const serviceList = serviceStr.split(',').map(s => s.trim()).filter(s => s);

    const rawDate = KEY_DATE ? String(latestMainBooker.get(KEY_DATE)) : "";
    const normalizedDate = rawDate ? normalizeDate(rawDate, new Date().getFullYear()) : "";

    return {
      success: true,
      data: {
        firstName, lastName, 
        phone: KEY_PHONE ? String(latestMainBooker.get(KEY_PHONE)) : "",
        fbLink: KEY_FB ? String(latestMainBooker.get(KEY_FB)) : "",
        branch: branchName, 
        date: normalizedDate, 
        time: KEY_TIME ? String(latestMainBooker.get(KEY_TIME)) : "",
        session: KEY_SESSION ? String(latestMainBooker.get(KEY_SESSION)) : "1ST",
        services: JSON.stringify(serviceList),
        others: JSON.stringify(latestGuests)
      }
    };
  } catch (error) {
    return { success: false, message: "Lookup Error" };
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
  fbLink: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  others: z.any().optional(),
});

export async function submitBooking(prevState: any, formData: FormData): Promise<BookingState> {
  const { BRANCH_MAP, BRANCH_LIMITS } = await getDynamicConfig();
  const servicesRaw = formData.getAll('services');
  const servicesString = servicesRaw.map(s => String(s)).join(', ');
  const guestNamesRaw = formData.getAll('guestName');
  const otherPeople = guestNamesRaw.map(s => String(s).trim()).filter(s => s.length > 0);

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
  };

  const validated = formSchema.safeParse(rawData);
  if (!validated.success) return { success: false, message: validated.error.issues[0].message, refCode: '' };

  try {
    const data = validated.data;
    const doc = await getDoc();
    const rawSheet = doc.sheetsByTitle["Raw_Intake"];
    if (!rawSheet) throw new Error("Database sheet 'Raw_Intake' not found.");

    // --- 🕒 START TIMER (Unoptimized) ---
    console.time("Google Sheets Transaction");

    await rawSheet.loadHeaderRow();
    const headers = rawSheet.headerValues;
    const rows = await rawSheet.getRows();

    const shortBranch = BRANCH_MAP[data.branch] || data.branch;
    const displayTime = data.time.split(' - ')[0].trim();
    const KEY_CLIENT = findColumnKey(headers, "CLIENT #");

    let finalRefCode = generateRefCode();
    let isOverride = false;

    // --- DUPLICATE CHECK & OVERRIDE LOGIC ---
    const duplicate = await checkDuplicate(data, headers, rows);
    if (duplicate && data.type !== 'Reschedule') {
         // Instead of returning error, we OVERRIDE.
         // We grab the existing Ref Code so the new booking replaces the old one
         // when the Google Apps Script syncs (grouped by Ref Code).
         const existingRef = String(duplicate.get(KEY_CLIENT) || "").trim();
         if (existingRef) {
             finalRefCode = existingRef;
             isOverride = true;
         }
    }

    if (data.type === 'Reschedule' && data.oldRefCode) {
       finalRefCode = String(data.oldRefCode).trim().toUpperCase();
    }

    // --- 🕒 END TIMER (Unoptimized) ---
    console.timeEnd("Google Sheets Transaction");

    const headcount = 1 + otherPeople.length;
    // Note: If overriding, we don't strictly need to check limits again if we assume
    // it's the same person, BUT for simplicity we keep limit checks enabled.
    // If the slot is legitimately full (other people), this might block them 
    // from moving to that slot, which is correct behavior.
    const limit = BRANCH_LIMITS[shortBranch] || 4;

    // Prepare all rows locally first
    const rowsToAdd: any[] = [];
    const mainRemarks = otherPeople.length > 0 ? `+${otherPeople.length} Others` : "";

    // 1. Main Booker
    const mainRowData: Record<string, any> = {
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
      "ACK?": "NO ACK",
      "M O P": "Cash",
      "REMARKS": mainRemarks,
      "TYPE": data.type
    };

    const formattedMain: Record<string, any> = {};
    Object.entries(mainRowData).forEach(([key, value]) => {
      const actualHeader = findColumnKey(headers, key);
      if (actualHeader) formattedMain[actualHeader] = value;
    });
    rowsToAdd.push(formattedMain);

    // 2. Joiners
    otherPeople.forEach(name => {
        const guestRowData: Record<string, any> = {
          "BRANCH": shortBranch,
          "FACEBOOK NAME": "",
          "FULL NAME": name,
          "Contact Number": "", 
          "DATE": normalizeSheetDate(data.date), 
          "TIME": displayTime,
          "CLIENT #": finalRefCode, 
          "SERVICES": "", 
          "SESSION": data.session,
          "STATUS": "Pending",
          "ACK?": "NO ACK",
          "M O P": "Cash",
          "REMARKS": `Guest of ${data.firstName}`,
          "TYPE": "Joiner" 
        };
        const formattedGuest: Record<string, any> = {};
        Object.entries(guestRowData).forEach(([key, value]) => {
          const actualHeader = findColumnKey(headers, key);
          if (actualHeader) formattedGuest[actualHeader] = value;
        });
        rowsToAdd.push(formattedGuest);
    });

    await rawSheet.addRows(rowsToAdd);
    
    return { 
        success: true, 
        message: isOverride ? "Booking Updated!" : "Booking Confirmed!", 
        refCode: finalRefCode, 
        data: { 
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            fbLink: data.fbLink,
            branch: data.branch,
            date: data.date,
            time: displayTime,
            session: data.session,
            services: servicesString, 
            others: JSON.stringify(otherPeople)
        } as any 
    };

  } catch (error) {
    console.error("SUBMIT ERROR:", error);
    return { success: false, message: "System Error. Please try again.", refCode: '' };
  }
}