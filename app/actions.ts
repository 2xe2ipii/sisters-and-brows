'use server'

import { z } from 'zod';
import { getDoc } from '@/lib/googleSheets';

const formSchema = z.object({
  branch: z.string().min(1, "Select a branch"),
  fbName: z.string().optional(),
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Phone is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  service: z.string().min(1, "Select a service"),
  session: z.string().min(1, "Select session type"),
  mop: z.string().min(1, "Select MOP"),
});

export async function submitBooking(prevState: any, formData: FormData) {
  
  const rawData = {
    branch: formData.get('branch'),
    fbName: formData.get('fbName'),
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    date: formData.get('date'),
    time: formData.get('time'),
    service: formData.get('service'),
    session: formData.get('session'),
    mop: formData.get('mop'),
  };

  const validated = formSchema.safeParse(rawData);

  if (!validated.success) {
    return { success: false, message: "Please check your inputs." };
  }

  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByIndex[0];

    // --- FORMATTING LOGIC START ---
    
    // 1. Format Date: "2026-01-18" -> "1/18"
    const dateObj = new Date(validated.data.date);
    const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`; 

    // 2. Format Time: "14:30" -> "2:30 PM"
    const [hours, minutes] = validated.data.time.split(':');
    const timeObj = new Date();
    timeObj.setHours(parseInt(hours), parseInt(minutes));
    const formattedTime = timeObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // --- FORMATTING LOGIC END ---

    await sheet.addRow({
      'BRANCH': validated.data.branch,
      'FACEBOOK NAME': validated.data.fbName || "",
      'FULL NAME': validated.data.fullName,
      'Contact Number': validated.data.phone, // We keep the number raw so it's clickable
      'DATE': formattedDate, 
      'TIME': formattedTime,
      'CLIENT #': "", 
      'SERVICES': validated.data.service,
      'SESSION': validated.data.session,
      'STATUS': "Done", // Matches your screenshot (Green usually means Done/Active)
      'ACK?': "NO ACK", 
      'M O P': validated.data.mop
    });

    return { success: true, message: "Booking confirmed!" };
  } catch (error) {
    console.error("Sheet Error:", error);
    return { success: false, message: "Failed to save booking. Try again." };
  }
}