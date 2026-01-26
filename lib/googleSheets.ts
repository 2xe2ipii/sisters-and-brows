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

// --- SERVICES (EXISTING) ---
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
    existingRow.assign(serviceData);
    await existingRow.save();
  } else {
    await sheet.addRow(serviceData);
  }
};

export const deleteService = async (id: string) => {
  const sheet = await getServicesSheet();
  const rows = await sheet.getRows();
  const row = rows.find(r => r.get('id') === id);
  if (row) await row.delete();
};

// --- NEW: CONFIGURATION (Time Slots & Locations) ---
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

// --- BOOKING HELPER (Existing) ---
export const getSheetRows = async () => {
  const doc = await getDoc();
  let sheet = doc.sheetsByTitle["Raw_Intake"];
  if (!sheet) sheet = doc.sheetsByIndex[0];
  await sheet.loadHeaderRow();
  const rows = await sheet.getRows();
  return { sheet, rows };
};