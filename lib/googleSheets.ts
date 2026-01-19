import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const getDoc = async () => {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID as string, serviceAccountAuth);
  await doc.loadInfo();
  return doc;
};

// NEW: Helper to get all rows so we can search them
export const getSheetRows = async () => {
  const doc = await getDoc();
  // Try to find "Raw_Intake", fallback to first sheet if missing
  let sheet = doc.sheetsByTitle["Raw_Intake"];
  if (!sheet) sheet = doc.sheetsByIndex[0];
  
  const rows = await sheet.getRows();
  return { sheet, rows };
};