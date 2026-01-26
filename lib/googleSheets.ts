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

// --- DATA: DEFAULT SERVICES ---
// This list will be pushed to Google Sheets if the "Services" tab is empty.
const DEFAULT_SERVICES = [
  // BUNDLES
  { id: 'bundle-a', name: 'Bundle A', price: '₱3,999', category: 'Bundles', image: '/bundleA_3999.jpg', desc: 'Premium value package' },
  { id: 'bundle-b', name: 'Bundle B', price: '₱4,999', category: 'Bundles', image: '/bundleB_4999.jpg', desc: 'Complete brow & care package' },
  { id: 'bundle-c', name: 'Bundle C', price: '₱5,499', category: 'Bundles', image: '/bundleC_5499.jpg', desc: 'Ultimate aesthetic package' },
  { id: 'bundle-d', name: 'Bundle D', price: '₱6,499', category: 'Bundles', image: '/bundleD_6499.jpg', desc: 'Full service aesthetic suite' },

  // MIX & MATCH
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

  // BROWS
  { id: '9d-micro', name: '9D Microblading', price: '₱4,999', category: 'Brows', image: '/mm8_4800.jpg', desc: 'Natural hair-like strokes' },
  { id: 'ombre', name: 'Ombre Brows', price: '₱3,999', category: 'Brows', image: '/ombre_brows.jpg', desc: 'Soft powdered makeup look' },
  { id: 'combo', name: 'Combi Brows', price: '₱5,499', category: 'Brows', image: '/combo_brows.jpg', desc: 'Microblading + Shading mix' },

  // LIPS & EYES
  { id: 'lip-blush', name: 'Lip Blush', price: '₱3,500', category: 'Lips', image: '/lip_blush.jpg', desc: 'Natural healthy tint' },
  { id: 'lash-line', name: 'Lash Line', price: '₱2,500', category: 'Eyes', image: '/lash_line.jpg', desc: 'Subtle eyeliner enhancement' },

  // SKIN
  { id: 'bb-glow', name: 'BB Glow', price: '₱2,500', category: 'Skin', image: '/bb_glow.jpg', desc: 'Semi-permanent foundation' },
  { id: 'derma-pen', name: 'Derma Pen', price: '₱3,000', category: 'Skin', image: '/derma_pen.jpg', desc: 'Microneedling treatment' },
  { id: 'scalp', name: 'Scalp Micro', price: '₱5,000+', category: 'Skin', image: '/scalp_micropigmentation.jpg', desc: 'Hair density illusion' }
];

// --- SERVICES HELPERS ---
export const getServicesSheet = async () => {
  const doc = await getDoc();
  let sheet = doc.sheetsByTitle["Services"];
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = await doc.addSheet({ title: "Services", headerValues: ['id', 'name', 'price', 'category', 'image', 'desc'] });
  }
  return sheet;
}

export const getAllServices = async () => {
  const sheet = await getServicesSheet();
  const rows = await sheet.getRows();
  
  // --- SEEDING LOGIC ---
  // If the sheet is completely empty, populate it with DEFAULT_SERVICES
  if (rows.length === 0) {
    console.log("Sheet 'Services' is empty. Seeding defaults...");
    await sheet.addRows(DEFAULT_SERVICES);
    
    // Refetch the rows we just added to return them
    const newRows = await sheet.getRows();
    return newRows.map(row => ({
      id: row.get('id'),
      name: row.get('name'),
      price: row.get('price'),
      category: row.get('category'),
      image: row.get('image'),
      desc: row.get('desc'),
    }));
  }

  // Otherwise, return what's in the sheet (including Admin edits)
  return rows.map(row => ({
    id: row.get('id'),
    name: row.get('name'),
    price: row.get('price'),
    category: row.get('category'),
    image: row.get('image'),
    desc: row.get('desc'),
  }));
};

export const saveService = async (serviceData: any) => {
  const sheet = await getServicesSheet();
  const rows = await sheet.getRows();
  
  const existingRow = rows.find(r => r.get('id') === serviceData.id);
  
  if (existingRow) {
    // Update existing
    existingRow.assign(serviceData);
    await existingRow.save();
  } else {
    // Add new
    await sheet.addRow(serviceData);
  }
};

export const deleteService = async (id: string) => {
  const sheet = await getServicesSheet();
  const rows = await sheet.getRows();
  const row = rows.find(r => r.get('id') === id);
  if (row) await row.delete();
};

// --- CONFIGURATION HELPERS (Time Slots & Locations) ---
export const getConfigSheet = async () => {
  const doc = await getDoc();
  let sheet = doc.sheetsByTitle["Config"];
  if (!sheet) {
    // key = setting name (e.g. "TIME_SLOTS"), value = JSON string
    sheet = await doc.addSheet({ title: "Config", headerValues: ['key', 'value'] });
    
    // Initialize with Defaults if empty
    await sheet.addRow({ 
      key: 'TIME_SLOTS', 
      value: JSON.stringify([
        "10:00 AM - 11:30 AM", "11:30 AM - 1:00 PM", "1:00 PM - 2:30 PM", 
        "2:30 PM - 4:00 PM", "4:00 PM - 5:30 PM", "5:30 PM - 7:00 PM"
      ]) 
    });
    await sheet.addRow({ 
      key: 'BRANCH_CONFIG', 
      value: JSON.stringify([
        { name: "Parañaque, Metro Manila", code: "PQ", limit: 4 },
        { name: "Lipa, Batangas", code: "LP", limit: 4 },
        { name: "San Pablo, Laguna", code: "SP", limit: 2 },
        { name: "Novaliches, Quezon City", code: "NV", limit: 4 },
        { name: "Dasmariñas, Cavite", code: "DM", limit: 6 },
        { name: "Comembo, Taguig", code: "TG", limit: 4 }
      ])
    });
  }
  return sheet;
}

export const getAppConfig = async () => {
  const sheet = await getConfigSheet();
  const rows = await sheet.getRows();
  
  const timeRow = rows.find(r => r.get('key') === 'TIME_SLOTS');
  const branchRow = rows.find(r => r.get('key') === 'BRANCH_CONFIG');

  return {
    timeSlots: timeRow ? JSON.parse(timeRow.get('value')) : [],
    branches: branchRow ? JSON.parse(branchRow.get('value')) : []
  };
};

export const saveAppConfig = async (key: string, data: any) => {
  const sheet = await getConfigSheet();
  const rows = await sheet.getRows();
  const row = rows.find(r => r.get('key') === key);
  
  if (row) {
    row.set('value', JSON.stringify(data));
    await row.save();
  } else {
    await sheet.addRow({ key, value: JSON.stringify(data) });
  }
};

// --- BOOKING HELPER (Raw Intake) ---
export const getSheetRows = async () => {
  const doc = await getDoc();
  let sheet = doc.sheetsByTitle["Raw_Intake"];
  if (!sheet) {
     sheet = doc.sheetsByIndex[0];
  }
  
  // Ensure headers are loaded so we can map columns
  await sheet.loadHeaderRow();
  
  const rows = await sheet.getRows();
  return { sheet, rows };
};