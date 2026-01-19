'use server'

import { z } from 'zod';
import { getDoc } from '@/lib/googleSheets';

// Map for Short Codes in Sheets
const BRANCH_MAP: Record<string, string> = {
  "Parañaque, Metro Manila": "PQ",
  "Lipa, Batangas": "LP",
  "San Pablo, Laguna": "SP",
  "Novaliches, Quezon City": "NV",
  "Dasmariñas, Cavite": "DM",
  "Comembo, Taguig": "TG"
};

const formSchema = z.object({
  type: z.string().optional(),
  branch: z.string().min(1),
  session: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  services: z.union([z.string(), z.array(z.string())]), 
  fbName: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  others: z.string().optional(),
});

export async function submitBooking(prevState: any, formData: FormData) {
  
  // 1. Handle Multi-Select Services
  const servicesRaw = formData.getAll('services');
  // Join array into a single string for the Sheet (e.g., "Brows, Lips")
  const servicesString = servicesRaw.join(', ');

  const rawData = {
    type: formData.get('type'),
    branch: formData.get('branch'),
    session: formData.get('session'),
    date: formData.get('date'),
    time: formData.get('time'),
    services: servicesRaw, 
    fbName: formData.get('fbName'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    phone: formData.get('phone'),
    others: formData.get('others'),
  };

  const validated = formSchema.safeParse(rawData);

  if (!validated.success) {
    return { success: false, message: "Please check that all required fields are filled." };
  }

  try {
    const doc = await getDoc();
    // Target "Raw_Intake" specifically
    let sheet = doc.sheetsByTitle["Raw_Intake"];
    if (!sheet) sheet = doc.sheetsByIndex[0];

    // 2. Format Date (YYYY-MM-DD for sorting)
    const dateObj = new Date(validated.data.date);
    const formattedDate = dateObj.toISOString().split('T')[0];

    // 3. Format Time
    const [hours, minutes] = validated.data.time.split(':');
    const timeObj = new Date();
    timeObj.setHours(parseInt(hours), parseInt(minutes));
    const formattedTime = timeObj.toLocaleTimeString('en-US', {
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true
    });

    // 4. Combine Names
    const fullClientName = `${validated.data.firstName} ${validated.data.lastName}`;
    
    // 5. Append "Others" to notes or name if needed, 
    // or just leave it for the admin to read in the raw data.
    // We will append it to the Remarks/Status column or just save it.
    
    const shortBranch = BRANCH_MAP[validated.data.branch] || validated.data.branch;

    await sheet.addRow({
      'BRANCH': shortBranch,
      'FACEBOOK NAME': validated.data.fbName,
      'FULL NAME': fullClientName, // Joined Name
      'Contact Number': validated.data.phone,
      'DATE': formattedDate,
      'TIME': formattedTime,
      'CLIENT #': "",
      'SERVICES': servicesString, // Sent as "Brows, Lips"
      'SESSION': validated.data.session,
      'STATUS': validated.data.type === 'Reschedule' ? 'Reschedule' : 'Pending',
      'ACK?': "NO ACK",
      'M O P': "", // MOP is usually collected later or on site? (Not in your screenshot input list)
      'REMARKS': validated.data.others || "" // <--- NEW: Maps the 'others' input here
    });

    return { success: true, message: "Booking confirmed! Please take a screenshot." };
  } catch (error) {
    console.error("Sheet Error:", error);
    return { success: false, message: "System Busy. Please try again." };
  }
}