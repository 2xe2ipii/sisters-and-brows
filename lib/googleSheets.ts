import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// --- CONFIGURATION ---
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const getDoc = async () => {
  if (!process.env.GOOGLE_SHEET_ID) {
    throw new Error('GOOGLE_SHEET_ID is not defined in environment variables');
  }
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  return doc;
};

// --- DATA: DEFAULTS FOR SEEDING ---
const DEFAULT_SERVICES = [
  { id: 'bundle-a', name: 'Bundle A', price: '₱3,999', category: 'Bundles', image: '/bundleA_3999.jpg', desc: 'Premium value package' },
  { id: 'bundle-b', name: 'Bundle B', price: '₱4,999', category: 'Bundles', image: '/bundleB_4999.jpg', desc: 'Complete brow & care package' },
  { id: 'bundle-c', name: 'Bundle C', price: '₱5,499', category: 'Bundles', image: '/bundleC_5499.jpg', desc: 'Ultimate aesthetic package' },
  { id: 'bundle-d', name: 'Bundle D', price: '₱6,499', category: 'Bundles', image: '/bundleD_6499.jpg', desc: 'Full service aesthetic suite' },
  { id: 'mm-1', name: 'Mix & Match 1', price: '₱2,800', category: 'Mix & Match', image: '/mm1_2800.jpg', desc: 'Custom combination' },
  { id: 'mm-2', name: 'Mix & Match 2', price: '₱2,800', category: 'Mix & Match', image: '/mm2_2800.jpg', desc: 'Custom combination' },
  { id: 'mm-3', name: 'Mix & Match 3', price: '₱3,300', category: 'Mix & Match', image: '/mm3_3300.jpg', desc: 'Custom combination' },
  { id: 'mm-4', name: 'Mix & Match 4', price: '₱3,800', category: 'Mix & Match', image: '/mm4_3800.jpg', desc: 'Custom combination' },
  { id: 'mm-5', name: 'Mix & Match 5', price: '₱8,800', category: 'Mix & Match', image: '/mm5_8800.jpg', desc: 'Custom combination' },
  { id: 'mm-6', name: 'Mix & Match 6', price: '₱4,300', category: 'Mix & Match', image: '/mm6_4300.jpg', desc: 'Custom combination' },
  { id: 'mm-7', name: 'Mix & Match 7', price: '₱4,300', category: 'Mix & Match', image: '/mm7_4300.jpg', desc: 'Custom combination' },
  { id: 'mm-8', name: 'Mix & Match 8', price: '₱4,800', category: 'Mix & Match', image: '/mm8_4800.jpg', desc: 'Custom combination' },
  { id: 'mm-9', name: 'Mix & Match 9', price: '₱5,300', category: 'Mix & Match', image: '/mm9_5300.jpg', desc: 'Custom combination' },
  { id: 'mm-10', name: 'Mix & Match 10', price: '₱10,300', category: 'Mix & Match', image: '/mm10_10300.jpg', desc: 'Premium combination' },
  { id: '9d-micro', name: '9D Microblading', price: '₱4,999', category: 'Brows', image: '/mm8_4800.jpg', desc: 'Natural hair-like strokes' },
  { id: 'ombre', name: 'Ombre Brows', price: '₱3,999', category: 'Brows', image: '/ombre_brows.jpg', desc: 'Soft powdered makeup look' },
  { id: 'combo', name: 'Combi Brows', price: '₱5,499', category: 'Brows', image: '/combo_brows.jpg', desc: 'Microblading + Shading mix' },
  { id: 'lip-blush', name: 'Lip Blush', price: '₱3,500', category: 'Lips', image: '/lip_blush.jpg', desc: 'Natural healthy tint' },
  { id: 'lash-line', name: 'Lash Line', price: '₱2,500', category: 'Eyes', image: '/lash_line.jpg', desc: 'Subtle eyeliner enhancement' },
  { id: 'bb-glow', name: 'BB Glow', price: '₱2,500', category: 'Skin', image: '/bb_glow.jpg', desc: 'Semi-permanent foundation' },
  { id: 'derma-pen', name: 'Derma Pen', price: '₱3,000', category: 'Skin', image: '/derma_pen.jpg', desc: 'Microneedling treatment' },
  { id: 'scalp', name: 'Scalp Micro', price: '₱5,000+', category: 'Skin', image: '/scalp_micropigmentation.jpg', desc: 'Hair density illusion' }
];

const DEFAULT_TIME_SLOTS = [
  { slot: "10:00 AM - 11:30 AM" },
  { slot: "11:30 AM - 1:00 PM" },
  { slot: "1:00 PM - 2:30 PM" },
  { slot: "2:30 PM - 4:00 PM" },
  { slot: "4:00 PM - 5:30 PM" },
  { slot: "5:30 PM - 7:00 PM" }
];

const DEFAULT_LOCATIONS = [
  { name: "Parañaque, Metro Manila", code: "PQ", limit: 4 },
  { name: "Lipa, Batangas", code: "LP", limit: 4 },
  { name: "San Pablo, Laguna", code: "SP", limit: 2 },
  { name: "Novaliches, Quezon City", code: "NV", limit: 4 },
  { name: "Dasmariñas, Cavite", code: "DM", limit: 6 },
  { name: "Comembo, Taguig", code: "TG", limit: 4 }
];

// --- 1. SERVICES LOGIC ---
export const getServicesSheet = async () => {
  const doc = await getDoc();
  let sheet = doc.sheetsByTitle["Services"];
  if (!sheet) {
    sheet = await doc.addSheet({ title: "Services", headerValues: ['id', 'name', 'price', 'category', 'image', 'desc'] });
  }
  return sheet;
}

export const getAllServices = async () => {
  const sheet = await getServicesSheet();
  const rows = await sheet.getRows();

  // SEED DEFAULTS IF EMPTY
  if (rows.length === 0) {
    console.log("Seeding Default Services...");
    await sheet.addRows(DEFAULT_SERVICES);
    // Return defaults immediately to save a round-trip
    return DEFAULT_SERVICES; 
  }

  return rows.map(row => ({
    id: row.get('id'),
    name: row.get('name'),
    price: row.get('price'),
    category: row.get('category'),
    image: row.get('image'),
    desc: row.get('desc'),
  }));
};

// --- 2. TIME SLOTS LOGIC ---
export const getTimeSlotsSheet = async () => {
  const doc = await getDoc();
  let sheet = doc.sheetsByTitle["Time_Slots"];
  if (!sheet) {
    sheet = await doc.addSheet({ title: "Time_Slots", headerValues: ['slot'] });
  }
  return sheet;
}

export const getTimeSlots = async () => {
  const sheet = await getTimeSlotsSheet();
  const rows = await sheet.getRows();

  // SEED DEFAULTS IF EMPTY
  if (rows.length === 0) {
    console.log("Seeding Default Time Slots...");
    await sheet.addRows(DEFAULT_TIME_SLOTS);
    return DEFAULT_TIME_SLOTS.map(r => r.slot);
  }

  return rows.map(r => r.get('slot'));
};

// --- 3. LOCATIONS LOGIC ---
export const getLocationsSheet = async () => {
  const doc = await getDoc();
  let sheet = doc.sheetsByTitle["Locations"];
  if (!sheet) {
    sheet = await doc.addSheet({ title: "Locations", headerValues: ['name', 'code', 'limit'] });
  }
  return sheet;
}

export const getLocations = async () => {
  const sheet = await getLocationsSheet();
  const rows = await sheet.getRows();

  // SEED DEFAULTS IF EMPTY
  if (rows.length === 0) {
    console.log("Seeding Default Locations...");
    await sheet.addRows(DEFAULT_LOCATIONS);
    return DEFAULT_LOCATIONS;
  }

  return rows.map(r => ({
    name: r.get('name'),
    code: r.get('code'),
    limit: parseInt(r.get('limit') || '4', 10)
  }));
};

// --- 4. APP CONFIG AGGREGATOR ---
export const getAppConfig = async () => {
  // Run in parallel for speed
  const [timeSlots, branches] = await Promise.all([
    getTimeSlots(),
    getLocations()
  ]);
  
  return { timeSlots, branches };
};

// --- 5. BOOKING LOGIC (Raw_Intake) ---
export const getSheetRows = async () => {
  const doc = await getDoc();
  let sheet = doc.sheetsByTitle["Raw_Intake"];
  if (!sheet) sheet = doc.sheetsByIndex[0];
  await sheet.loadHeaderRow();
  const rows = await sheet.getRows();
  return { sheet, rows };
};