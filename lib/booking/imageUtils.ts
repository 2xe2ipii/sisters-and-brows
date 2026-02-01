/**
 * Converts a Google Drive "View" URL to a "Direct" Image URL.
 * * Input: https://drive.google.com/file/d/1dNxkEvjJ7anUIoi0aT1IOaJJMnMJ0EyI/view?usp=drive_link
 * Output: https://drive.google.com/uc?export=view&id=1dNxkEvjJ7anUIoi0aT1IOaJJMnMJ0EyI
 */
export function getGoogleDriveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // If it's a local path (starts with /) or not a google drive link, return as is
  if (url.startsWith('/') || !url.includes('drive.google.com')) {
      return url;
  }

  try {
    // Regex to extract the File ID from the messy URL
    const idMatch = url.match(/\/d\/([^/]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
    }
  } catch (e) {
    console.error("Error parsing Drive URL:", e);
  }

  // Fallback: return original if we couldn't parse it (though it might fail to load)
  return url;
}