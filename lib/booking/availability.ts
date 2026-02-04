import { getDoc } from '@/lib/googleSheets';
import { normalizeDate, normalizeStr, getStrictTime, findColumnKey } from './utils';
import { getDynamicConfig } from './config';
import { unstable_cache } from 'next/cache';

/**
 * Gets the fortnight sheet name based on a date
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

/**
 * CACHED SHEET FETCHER
 * This wraps the slow Google API call in a Next.js Cache.
 * It stays fresh for 60 seconds, then re-fetches.
 * Prevents "429 Too Many Requests" errors.
 */
const getCachedSheetData = unstable_cache(
  async (sheetName: string) => {
    console.log(`[CACHE MISS] 🔴 Fetching fresh data from Google for: ${sheetName} at ${new Date().toLocaleTimeString()}`);
    try {
      const doc = await getDoc();
      const sheet = doc.sheetsByTitle[sheetName];
      if (!sheet) return null;

      await sheet.loadHeaderRow();
      const rows = await sheet.getRows();

      // We must convert to plain JSON because 'GoogleSpreadsheetRow' 
      // is too complex to cache (contains circular references).
      return {
        headers: sheet.headerValues,
        rows: rows.map(row => row.toObject())
      };
    } catch (error) {
      console.error(`Cache Fetch Error [${sheetName}]:`, error);
      return null;
    }
  },
  ['sheet-data-cache-v1'], // Unique Cache Key
  { revalidate: 60 } // Revalidate every 60 seconds
);

export async function checkSlotAvailability(date: string, branch: string) {
  const { BRANCH_MAP, BRANCH_LIMITS } = await getDynamicConfig();
  
  try {
    const counts: Record<string, number> = {};
    const limit = BRANCH_LIMITS[BRANCH_MAP[branch] || branch] || 4;

    const targetYear = new Date(date).getFullYear();
    const targetDate = normalizeDate(date, targetYear);
    const targetShortBranch = normalizeStr(BRANCH_MAP[branch] || branch);
    const targetFullBranch = normalizeStr(branch);

    // --- HELPER: Count bookings from cached data ---
    const countBookings = (rows: Record<string, any>[], headers: string[]) => {
      const KEY_BRANCH = findColumnKey(headers, "BRANCH");
      const KEY_DATE = findColumnKey(headers, "DATE");
      const KEY_TIME = findColumnKey(headers, "TIME");

      if (!KEY_BRANCH || !KEY_DATE || !KEY_TIME) return;

      rows.forEach((row) => {
        // Note: With row.toObject(), we access properties like row['Header Name']
        const rDate = normalizeDate(String(row[KEY_DATE] || ""), targetYear);
        const rBranch = normalizeStr(String(row[KEY_BRANCH] || ""));
        const rTime = getStrictTime(String(row[KEY_TIME] || ""));
        const status = String(row["STATUS"] || "").toLowerCase();
        
        // Filter out Date Headers (Visual rows)
        const clientNum = String(row["CLIENT #"] || "").trim();
        const isDateHeader = !row["BRANCH"] && clientNum.match(/^[A-Z][a-z]+ \d{1,2}(,\s+\d{4})?$/);
        
        if (isDateHeader) return;

        // COUNT LOGIC: Must match Branch + Date + Not Cancelled
        if (!status.includes("cancel") && 
            (rBranch === targetShortBranch || rBranch === targetFullBranch) && 
            rDate === targetDate) {
            
            if (!counts[rTime]) {
                counts[rTime] = 0;
            }
            counts[rTime]++;
        }
      });
    };

    // --- FETCH DATA (CACHED) ---
    // We only look at the Dated Sheet (e.g. "Feb 1 - 15")
    // This ignores Raw_Intake (The Blind Spot), but saves massive API quota.
    const sheetName = getFortnightSheetName(date);
    const sheetData = await getCachedSheetData(sheetName);

    if (sheetData) {
      countBookings(sheetData.rows, sheetData.headers);
    }

    return { success: true, counts, limit };

  } catch (error) {
    console.error("Availability Check Failed:", error);
    // Fail safe: If cache fails, allow booking to proceed (or return 0 counts)
    // rather than crashing the UI.
    return { success: false, counts: {}, limit: 4 };
  }
}

// NOTE: checkDuplicate handles Personal Info so it should NOT be cached 
// (or should be cached very carefully). 
// For now, we leave it direct since it runs less frequently.
export async function checkDuplicate(data: any, headers: string[], rows: any[]) {
    // This function expects 'rows' passed from the Page/Action, 
    // which usually fetches fresh data. 
    // If you want to use the cache here too, you'll need to refactor how 
    // 'checkDuplicate' is called in actions.ts.
    
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