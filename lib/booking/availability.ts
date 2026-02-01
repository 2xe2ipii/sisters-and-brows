import { getDoc } from '@/lib/googleSheets';
import { normalizeDate, normalizeStr, getStrictTime, findColumnKey } from './utils';
import { getDynamicConfig } from './config';

/**
 * Gets the fortnight sheet name based on a date
 * Must match the logic in Code.gs getFortnightSheetName()
 */
function getFortnightSheetName(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Unsorted";
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  
  const lastDay = new Date(year, month + 1, 0).getDate();
  const range = day <= 15 ? "1 - 15" : `16 - ${lastDay}`;
  
  return `${months[month]} ${range}, ${year}`;
}

export async function checkSlotAvailability(date: string, branch: string) {
  const { BRANCH_MAP, BRANCH_LIMITS } = await getDynamicConfig();
  
  try {
    const doc = await getDoc();
    
    // CRITICAL FIX: Check the VIEW SHEET instead of Raw_Intake
    const sheetName = getFortnightSheetName(date);
    const viewSheet = doc.sheetsByTitle[sheetName];
    
    // If the sheet doesn't exist yet, it means no bookings for that period
    if (!viewSheet) {
      return { 
        success: true, 
        counts: {}, 
        limit: BRANCH_LIMITS[BRANCH_MAP[branch] || branch] || 4 
      };
    }

    await viewSheet.loadHeaderRow(); 
    const rows = await viewSheet.getRows();
    const headers = viewSheet.headerValues;

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
            
            // Skip header rows (date headers in view sheets)
            const clientNum = String(row.get("CLIENT #") || "").trim();
            const isDateHeader = !row.get("BRANCH") && clientNum.match(/^[A-Z][a-z]+ \d{1,2}(,\s+\d{4})?$/);
            if (isDateHeader) return;

            // Count each non-cancelled booking
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