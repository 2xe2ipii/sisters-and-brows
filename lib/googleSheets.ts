import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { unstable_cache } from 'next/cache'; // Next.js Native Cache

// --- CONFIGURATION ---
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Singleton Doc instance (avoids re-auth on every call)
let docInstance: GoogleSpreadsheet | null = null;

export const getDoc = async () => {
  if (docInstance) return docInstance; // REUSE INSTANCE
  
  if (!process.env.GOOGLE_SHEET_ID) {
    throw new Error('GOOGLE_SHEET_ID is not defined in environment variables');
  }
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  docInstance = doc; // Store it
  return doc;
};

// --- DATA: DEFAULTS ---
const DEFAULT_SERVICES = [
  // ... (Your existing list - truncated for brevity) ...
  { id: 'bundle-a', name: 'Bundle A', price: '₱3,999', category: 'Bundles', image: '/bundleA_3999.jpg', desc: 'Premium value package' },
   // ... rest of your defaults
];

const DEFAULT_TIME_SLOTS = [
  "10:00 AM - 11:30 AM", "11:30 AM - 1:00 PM", "1:00 PM - 2:30 PM", 
  "2:30 PM - 4:00 PM", "4:00 PM - 5:30 PM", "5:30 PM - 7:00 PM"
];

const DEFAULT_LOCATIONS = [
  { name: "Parañaque, Metro Manila", code: "PQ", limit: 4 },
  { name: "Lipa, Batangas", code: "LP", limit: 4 },
  { name: "San Pablo, Laguna", code: "SP", limit: 2 },
  { name: "Novaliches, Quezon City", code: "NV", limit: 4 },
  { name: "Dasmariñas, Cavite", code: "DM", limit: 6 },
  { name: "Comembo, Taguig", code: "TG", limit: 4 }
];

// --- CACHED FETCHERS (Crucial for Rate Limits) ---

// Cache Services for 1 hour (3600s)
export const getCachedServices = unstable_cache(
  async () => {
    try {
      const doc = await getDoc();
      let sheet = doc.sheetsByTitle["Services"];
      if (!sheet) return DEFAULT_SERVICES; // Don't crash, just return defaults

      const rows = await sheet.getRows();
      if (rows.length === 0) return DEFAULT_SERVICES;

      return rows.map(row => ({
        id: row.get('id'),
        name: row.get('name'),
        price: row.get('price'),
        category: row.get('category'),
        image: row.get('image'),
        desc: row.get('desc'),
      }));
    } catch (e) {
      console.error("Cache Fetch Error (Services):", e);
      return DEFAULT_SERVICES;
    }
  },
  ['services-cache'],
  { revalidate: 3600 } 
);

// Cache Config (Time/Locations) for 1 hour (3600s)
export const getCachedAppConfig = unstable_cache(
  async () => {
    try {
      const doc = await getDoc();
      
      // Parallel Fetch
      const [timeSheet, locSheet] = [
        doc.sheetsByTitle["Time_Slots"],
        doc.sheetsByTitle["Locations"]
      ];

      // Time Slots Logic
      let timeSlots = DEFAULT_TIME_SLOTS;
      if (timeSheet) {
        const rows = await timeSheet.getRows();
        if (rows.length > 0) timeSlots = rows.map(r => r.get('slot'));
      }

      // Locations Logic
      let branches = DEFAULT_LOCATIONS;
      if (locSheet) {
        const rows = await locSheet.getRows();
        if (rows.length > 0) {
          branches = rows.map(r => ({
            name: r.get('name'),
            code: r.get('code'),
            limit: parseInt(r.get('limit') || '4', 10)
          }));
        }
      }

      return { timeSlots, branches };
    } catch (e) {
      console.error("Cache Fetch Error (Config):", e);
      return { timeSlots: DEFAULT_TIME_SLOTS, branches: DEFAULT_LOCATIONS };
    }
  },
  ['config-cache'],
  { revalidate: 3600 }
);

// --- RAW INTAKE (No Cache - Must be Live) ---
export const getSheetRows = async () => {
  const doc = await getDoc();
  let sheet = doc.sheetsByTitle["Raw_Intake"];
  if (!sheet) sheet = doc.sheetsByIndex[0];
  
  // Only load headers, not all rows initially if possible, but we need rows for slot counting
  await sheet.loadHeaderRow(); 
  const rows = await sheet.getRows();
  return { sheet, rows };
};

// Export original getters mapped to cached versions for compatibility
export const getAllServices = getCachedServices;
export const getAppConfig = getCachedAppConfig;