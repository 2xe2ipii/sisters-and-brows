import { getDoc } from '@/lib/googleSheets';
import { normalizeDate, normalizeStr, getStrictTime, findColumnKey } from './utils';
import { getDynamicConfig } from './config';

export async function checkSlotAvailability(date: string, branch: string) {
  const { BRANCH_MAP, BRANCH_LIMITS } = await getDynamicConfig();
  
  try {
    const doc = await getDoc();
    const rawSheet = doc.sheetsByTitle["Raw_Intake"];
    if (!rawSheet) return { success: false, counts: {}, limit: 4 };

    await rawSheet.loadHeaderRow(); 
    const rows = await rawSheet.getRows();
    const headers = rawSheet.headerValues;

    const counts: Record<string, number> = {};
    const limit = BRANCH_LIMITS[BRANCH_MAP[branch] || branch] || 4;

    const targetYear = new Date(date).getFullYear();
    const targetDate = normalizeDate(date, targetYear);
    const targetShortBranch = normalizeStr(BRANCH_MAP[branch] || branch);
    const targetFullBranch = normalizeStr(branch);

    const KEY_BRANCH = findColumnKey(headers, "BRANCH");
    const KEY_DATE = findColumnKey(headers, "DATE");
    const KEY_TIME = findColumnKey(headers, "TIME");

    if (KEY_BRANCH && KEY_DATE && KEY_TIME) {
        rows.forEach((row) => {
            const rDate = normalizeDate(String(row.get(KEY_DATE) || ""), targetYear);
            const rBranch = normalizeStr(String(row.get(KEY_BRANCH) || ""));
            const rTime = getStrictTime(String(row.get(KEY_TIME) || ""));
            const status = String(row.get("STATUS") || "").toLowerCase();

            // v5 CHANGE: Count every single row as a consumed slot
            // (Previously, we grouped by Reference ID)
            if (!status.includes("cancel") && 
                (rBranch === targetShortBranch || rBranch === targetFullBranch) && 
                rDate === targetDate) {
                
                if (!counts[rTime]) {
                    counts[rTime] = 0;
                }
                counts[rTime]++;
            }
        });
    }

    return { success: true, counts, limit };
  } catch (error) {
    console.error("Availability Error:", error);
    return { success: false, counts: {}, limit: 4 };
  }
}

export async function checkDuplicate(data: any, headers: string[], rows: any[]) {
    const targetYear = new Date(data.date).getFullYear();
    const targetDate = normalizeDate(data.date, targetYear);
    const cleanTargetTime = getStrictTime(data.time);
    
    const KEY_DATE = findColumnKey(headers, "DATE");
    const KEY_TIME = findColumnKey(headers, "TIME");
    const KEY_FULLNAME = findColumnKey(headers, "FULL NAME");
    const KEY_PHONE = findColumnKey(headers, "Contact Number");

    if (KEY_DATE && KEY_TIME && KEY_FULLNAME && KEY_PHONE) {
        const fullNameInput = normalizeStr(`${data.firstName} ${data.lastName}`);
        
        return rows.find((row: any) => {
            const rDate = normalizeDate(String(row.get(KEY_DATE) || ""), targetYear);
            const rTime = getStrictTime(String(row.get(KEY_TIME) || ""));
            const rName = normalizeStr(String(row.get(KEY_FULLNAME) || ""));
            const rPhone = normalizeStr(String(row.get(KEY_PHONE) || ""));
            const status = String(row.get("STATUS") || "").toLowerCase();

            return (
               !status.includes("cancel") &&
               rDate === targetDate &&
               rTime === cleanTargetTime &&
               (rName === fullNameInput || rPhone === normalizeStr(data.phone))
            );
        });
    }
    return null;
}