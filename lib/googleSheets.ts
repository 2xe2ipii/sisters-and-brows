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

export const getSheetRows = async () => {
  const doc = await getDoc();
  
  // Priority: 1. "Raw_Intake" 2. First Sheet
  let sheet = doc.sheetsByTitle["Raw_Intake"];
  if (!sheet) {
    console.warn("Raw_Intake sheet not found, falling back to index 0");
    sheet = doc.sheetsByIndex[0];
  }
  
  // FORCE HEADERS TO LOAD
  await sheet.loadHeaderRow();

  const rows = await sheet.getRows();
  return { sheet, rows };
};