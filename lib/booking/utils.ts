export function generateRefCode() {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'; 
  let result = 'R-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function normalizeStr(str: any): string { 
  // Collapse multiple spaces into one single space
  return String(str || "").trim().toLowerCase().replace(/\s+/g, ' '); 
}

export function normalizePhone(str: any): string {
  if (!str) return "";
  // Remove all non-digits first
  let clean = String(str).replace(/\D/g, '');
  // Remove leading zero if present (e.g. 0917 -> 917)
  return clean.replace(/^0+/, '');
}

export function normalizeDate(raw: any, targetYear?: number): string {
  if (!raw) return "";
  let str = String(raw).trim().replace(/-/g, ' '); 
  
  const match = str.match(/^([A-Za-z]+)[\s-]?(\d{1,2})$/);
  if (match) {
    const month = match[1];
    const day = match[2];
    const yearToUse = targetYear || new Date().getFullYear();
    str = `${month} ${day} ${yearToUse}`;
  }
  
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  
  let year = d.getFullYear();
  if (targetYear) year = targetYear;

  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

export function normalizeSheetDate(isoDate: string): string {
  if (!isoDate) return "";
  const parts = isoDate.split('-');
  if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[monthIndex]} ${day}, ${year}`;
  }
  return isoDate;
}

export function getStrictTime(timeStr: any): string { 
  if (!timeStr) return "";
  const firstPart = String(timeStr).split('-')[0]; 
  return firstPart.replace(/[\s\u200B\u202F\u00A0]/g, '').toLowerCase(); 
}

export function findColumnKey(headers: string[], keyword: string): string | undefined {
  if (headers.includes(keyword)) return keyword;
  const normKeyword = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');
  return headers.find(h => h.toLowerCase().replace(/[^a-z0-9]/g, '') === normKeyword);
}