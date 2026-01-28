'use server'

import { z } from 'zod';
import { getAllServices, getAppConfig, getSheetRows, getDoc } from '@/lib/googleSheets';

// Import helpers from the new modular structure
import { generateRefCode, normalizeSheetDate, findColumnKey, normalizeDate, normalizeStr, getStrictTime } from '@/lib/booking/utils';
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

export async function lookupBooking(refCode: string) {
  try {
    const { sheet, rows } = await getSheetRows();
    if (!sheet || !rows) return { success: false, message: "DB Unavailable" };
    
    if (!sheet.headerValues) await sheet.loadHeaderRow();
    const headers = sheet.headerValues;
    const KEY_CLIENT = findColumnKey(headers, "CLIENT #");
    if (!KEY_CLIENT) return { success: false, message: "No ID Column" };

    const reversed = [...rows].reverse();
    const match = reversed.find(r => String(r.get(KEY_CLIENT)).trim().toUpperCase() === refCode.trim().toUpperCase());

    if (!match) return { success: false, message: "Booking Reference not found." };

    const KEY_BRANCH = findColumnKey(headers, "BRANCH");
    const KEY_DATE = findColumnKey(headers, "DATE");
    const KEY_FIRST = findColumnKey(headers, "FULL NAME"); 
    const KEY_PHONE = findColumnKey(headers, "Contact Number");
    const KEY_FB = findColumnKey(headers, "FACEBOOK NAME");
    const KEY_SESSION = findColumnKey(headers, "SESSION");

    const fullName = KEY_FIRST ? String(match.get(KEY_FIRST)) : "";
    const nameParts = fullName.split(' ');
    const lastName = nameParts.length > 1 ? nameParts.pop() || "" : "";
    const firstName = nameParts.join(' ') || fullName;
    const rawBranch = KEY_BRANCH ? String(match.get(KEY_BRANCH)) : "";
    
    const { BRANCH_MAP } = await getDynamicConfig();
    const branchName = Object.keys(BRANCH_MAP).find(key => BRANCH_MAP[key] === rawBranch) || rawBranch;

    return {
      success: true,
      data: {
        firstName, lastName,
        phone: KEY_PHONE ? String(match.get(KEY_PHONE)) : "",
        fbLink: KEY_FB ? String(match.get(KEY_FB)) : "",
        branch: branchName, 
        date: KEY_DATE ? normalizeDate(String(match.get(KEY_DATE))) : "", 
        session: KEY_SESSION ? String(match.get(KEY_SESSION)) : "1ST",
      }
    };
  } catch (error) {
    return { success: false, message: "Lookup Error" };
  }
}

// --- SUBMIT ---
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
  others: z.string().optional(),
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
    if (!rawSheet) throw new Error("DB Missing");

    await rawSheet.loadHeaderRow();
    const rows = await rawSheet.getRows();
    const headers = rawSheet.headerValues;

    const shortBranch = BRANCH_MAP[data.branch] || data.branch;
    const displayTime = data.time.split(' - ')[0].trim();
    
    // Parse Guests
    let otherPeople: string[] = [];
    try { otherPeople = JSON.parse(data.others || "[]"); } catch (e) {}

    const KEY_CLIENT = findColumnKey(headers, "CLIENT #");

    // 1. DUPLICATE CHECK
    const duplicate = await checkDuplicate(data, headers, rows);
    if (duplicate && data.type !== 'Reschedule') {
         return { success: true, message: "Booking already exists.", refCode: String(duplicate.get(KEY_CLIENT) || "") };
    }

    // 2. AVAILABILITY CHECK
    const availResult = await checkSlotAvailability(data.date, data.branch);
    if (availResult.counts[getStrictTime(data.time)] !== undefined) {
         if ((availResult.counts[getStrictTime(data.time)] || 0) >= (BRANCH_LIMITS[shortBranch] || 4)) {
             return { success: false, message: "Slot full.", refCode: '' };
         }
    }

    // 3. ID GENERATION
    let finalRefCode = generateRefCode(); 
    if (data.type === 'Reschedule' && data.oldRefCode) {
       finalRefCode = String(data.oldRefCode).trim().toUpperCase();
    }

    // 4. PREPARE ROWS
    const rowsToAdd = [];
    rowsToAdd.push({
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
      "REMARKS": otherPeople.length > 0 ? `+${otherPeople.length} Others` : "",
      "TYPE": data.type
    });

    otherPeople.forEach(name => {
        rowsToAdd.push({
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
        });
    });

    // 5. WRITE
    for (const rowPayload of rowsToAdd) {
        const formattedPayload: Record<string, any> = {};
        Object.entries(rowPayload).forEach(([key, value]) => {
           const actualHeader = findColumnKey(headers, key);
           if (actualHeader) formattedPayload[actualHeader] = value;
        });
        await rawSheet.addRow(formattedPayload);
    }
    
    return { success: true, message: "Booking Confirmed!", refCode: finalRefCode, data: { firstName: data.firstName } as any };

  } catch (error) {
    return { success: false, message: "System Error", refCode: '' };
  }
}