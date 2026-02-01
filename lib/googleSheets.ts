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
  { id: 'bundle-a', name: 'Bundle A', price: '₱3,999', category: 'Bundles', image: '/bundleA_3999.jpg', desc: 'Premium value package' },
  { id: 'bundle-b', name: 'Bundle B', price: '₱4,999', category: 'Bundles', image: '/bundleB_4999.jpg', desc: 'Complete brow & care package' },
  { id: 'bundle-c', name: 'Bundle C', price: '₱5,499', category: 'Bundles', image: '/bundleC_5499.jpg', desc: 'Ultimate aesthetic package' },
  { id: 'bundle-d', name: 'Bundle D', price: '₱6,499', category: 'Bundles', image: '/bundleD_6499.jpg', desc: 'Full service aesthetic suite' },
  { id: 'mm-1', name: 'Mix & Match 1', price: '₱2,800', category: 'Mix & Match', image: '/mm1.jpg', desc: 'Custom combination' },
  { id: 'mm-2', name: 'Mix & Match 2', price: '₱2,800', category: 'Mix & Match', image: '/mm2.jpg', desc: 'Custom combination' },
  { id: 'mm-3', name: 'Mix & Match 3', price: '₱3,300', category: 'Mix & Match', image: '/mm3.jpg', desc: 'Custom combination' },
  { id: 'mm-4', name: 'Mix & Match 4', price: '₱3,800', category: 'Mix & Match', image: '/mm4.jpg', desc: 'Custom combination' },
  { id: 'mm-5', name: 'Mix & Match 5', price: '₱8,800', category: 'Mix & Match', image: '/mm5.jpg', desc: 'Custom combination' },
  { id: 'mm-6', name: 'Mix & Match 6', price: '₱4,300', category: 'Mix & Match', image: '/mm6.jpg', desc: 'Custom combination' },
  { id: 'mm-7', name: 'Mix & Match 7', price: '₱4,300', category: 'Mix & Match', image: '/mm7.jpg', desc: 'Custom combination' },
  { id: 'mm-8', name: 'Mix & Match 8', price: '₱4,800', category: 'Mix & Match', image: '/mm8.jpg', desc: 'Custom combination' },
  { id: 'mm-9', name: 'Mix & Match 9', price: '₱5,300', category: 'Mix & Match', image: '/mm9.jpg', desc: 'Custom combination' },
  { id: 'mm-10', name: 'Mix & Match 10', price: '₱10,300', category: 'Mix & Match', image: '/mm10.jpg', desc: 'Premium combination' },
  { id: '9d-micro', name: '9D Microblading', price: '₱4,999', category: 'Brows', image: '/mm8.jpg', desc: 'Natural hair-like strokes' },
  { id: 'ombre', name: 'Ombre Brows', price: '₱3,999', category: 'Brows', image: '/ombre_brows.jpg', desc: 'Soft powdered makeup look' },
  { id: 'combo', name: 'Combi Brows', price: '₱5,499', category: 'Brows', image: '/combo_brows.jpg', desc: 'Microblading + Shading mix' },
  { id: 'lip-blush', name: 'Lip Blush', price: '₱3,500', category: 'Lips', image: '/lip_blush.jpg', desc: 'Natural healthy tint' },
  { id: 'lash-line', name: 'Lash Line', price: '₱2,500', category: 'Eyes', image: '/lash_line.jpg', desc: 'Subtle eyeliner enhancement' },
  { id: 'bb-glow', name: 'BB Glow', price: '₱2,500', category: 'Skin', image: '/bb_glow.jpg', desc: 'Semi-permanent foundation' },
  { id: 'derma-pen', name: 'Derma Pen', price: '₱3,000', category: 'Skin', image: '/derma_pen.jpg', desc: 'Microneedling treatment' },
  { id: 'scalp', name: 'Scalp Micro', price: '₱5,000+', category: 'Skin', image: '/scalp_micropigmentation.jpg', desc: 'Hair density illusion' }
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

const CACHE_TIME = process.env.NODE_ENV === 'development' ? 30 : 3600;

export const getCachedServices = unstable_cache(
  async () => {
    try {
      const doc = await getDoc();
      let sheet = doc.sheetsByTitle["Services"];
      if (!sheet) return DEFAULT_SERVICES;

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
      return DEFAULT_SERVICES; // no crash
    }
  },
  ['services-cache'],
  { revalidate: CACHE_TIME } 
);

// Cache Config (Time/Locations) (30s in dev, 1hr in production)
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
  { revalidate: CACHE_TIME } // ← NOW DYNAMIC!
);

// --- RAW INTAKE (No Cache - Must be Live) ---
export const getSheetRows = async () => {
  const doc = await getDoc();
  let sheet = doc.sheetsByTitle["Raw_Intake"];
  if (!sheet) sheet = doc.sheetsByIndex[0];
  
  await sheet.loadHeaderRow(); 
  const rows = await sheet.getRows();
  return { sheet, rows };
};

// Export original getters mapped to cached versions for compatibility
export const getAllServices = getCachedServices;
export const getAppConfig = getCachedAppConfig;