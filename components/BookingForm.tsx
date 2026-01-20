'use client'

import { useActionState, useState, useEffect, useRef } from 'react';
import { submitBooking, getSlotAvailability } from '@/app/actions';
import { 
  MapPin, Calendar, Check, Sparkles, ChevronDown, 
  FileText, ArrowRight, User, Phone, Link as LinkIcon,
  ArrowLeft, Receipt, Scissors, AlertCircle
} from 'lucide-react';

// --- CONFIGURATION ---
const TIME_FRAMES = [
  "10:00 AM - 11:30 AM",
  "11:30 AM - 1:00 PM",
  "1:00 PM - 2:30 PM",
  "2:30 PM - 4:00 PM",
  "4:00 PM - 5:30 PM",
  "5:30 PM - 7:00 PM"
];

const SERVICES_DATA = [
  { name: "9D Microblading", price: "₱4,500", desc: "Natural hair-like strokes" },
  { name: "Ombre Brows", price: "₱4,000", desc: "Soft, misty powder effect" },
  { name: "Combo Brows", price: "₱5,000", desc: "Microblading + Shading" },
  { name: "Lash Line", price: "₱2,500", desc: "Subtle eye definition" },
  { name: "Lip Blush", price: "₱5,500", desc: "Natural looking lip tint" },
  { name: "Derma Pen", price: "₱2,000", desc: "Microneedling for skin texture" },
  { name: "BB Glow", price: "₱2,500", desc: "Semi-permanent foundation" },
  { name: "Scalp Micropigmentation", price: "Varied", desc: "Hair density simulation" },
];

const BRANCHES = [
  "Parañaque, Metro Manila",
  "Lipa, Batangas",
  "San Pablo, Laguna",
  "Novaliches, Quezon City",
  "Dasmariñas, Cavite",
  "Comembo, Taguig"
];

const initialState = {
  success: false,
  message: '',
};

export default function BookingForm() {
  const [state, formAction, isPending] = useActionState(submitBooking, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Logic State
  const [step, setStep] = useState<'FORM' | 'REVIEW'>('FORM');
  const [reviewData, setReviewData] = useState<any>(null);
  
  // Form Field State
  const [bookingType, setBookingType] = useState("New Appointment");
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [selectedDate, setSelectedDate] = useState("");
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDate || !selectedBranch) return;
      setLoadingSlots(true);
      try {
        const result = await getSlotAvailability(selectedDate, selectedBranch);
        if (result.success) setSlotCounts(result.counts);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [selectedDate, selectedBranch]);

  // --- HANDLER: PROCEED TO REVIEW ---
  const handleProceed = () => {
    // 1. Trigger Browser Validation
    if (formRef.current && formRef.current.checkValidity()) {
      // 2. Harvest Data for Preview
      const formData = new FormData(formRef.current);
      const data = {
        type: formData.get('type'),
        branch: selectedBranch, // State source of truth
        date: selectedDate,     // State source of truth
        time: formData.get('time'),
        services: formData.getAll('services'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        phone: formData.get('phone'),
        fbLink: formData.get('fbLink'),
        session: formData.get('session'),
        others: formData.get('others'),
      };
      setReviewData(data);
      setStep('REVIEW');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Show validation errors if missing fields
      formRef.current?.reportValidity();
    }
  };

  // --- TICKET VIEW (Success State) ---
  if (state.success) {
    const data = reviewData || {};

    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#f1f5f9]">
        <div className="w-full max-w-sm relative drop-shadow-2xl animate-in zoom-in duration-700">
          
          {/* TICKET CONTAINER */}
          <div className="bg-white w-full rounded-3xl overflow-hidden relative">
            
            {/* Header */}
            <div className="bg-[#0f172a] p-8 text-center relative z-10">
               <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
                 <Sparkles className="w-7 h-7 text-rose-400" />
               </div>
               <h2 className="text-white font-serif text-2xl tracking-wider">BOOKED</h2>
               <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] mt-2">Sisters & Brows Reservation</p>
            </div>

            {/* Cutout Divider */}
            <div className="relative h-6 bg-[#0f172a]">
              <div className="absolute top-0 left-0 w-full h-full bg-white rounded-t-3xl"></div>
              <div className="absolute -left-3 top-[-12px] w-6 h-6 bg-[#f1f5f9] rounded-full z-20"></div>
              <div className="absolute -right-3 top-[-12px] w-6 h-6 bg-[#f1f5f9] rounded-full z-20"></div>
              <div className="absolute left-4 right-4 top-0 border-t-2 border-dashed border-slate-200"></div>
            </div>

            {/* Details Section */}
            <div className="bg-white px-8 pb-8 pt-2 space-y-6">
               <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                     <p className="text-slate-900 font-bold text-sm">{data.date}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time</p>
                     <p className="text-slate-900 font-bold text-sm">{data.time}</p>
                  </div>
                  <div className="col-span-2">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                     <p className="text-slate-900 font-bold text-sm">{data.branch}</p>
                  </div>
                  <div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Guest</p>
                     <p className="text-slate-900 font-bold text-sm truncate">{data.firstName} {data.lastName}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Type</p>
                     <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {data.type === 'New Appointment' ? 'New' : 'Resched'}
                     </span>
                  </div>
               </div>

               {/* Services List */}
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <Scissors className="w-3 h-3" /> Services
                  </p>
                  <ul className="space-y-2">
                     {data.services && data.services.length > 0 ? (
                        data.services.map((s: string) => (
                           <li key={s} className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> {s}
                           </li>
                        ))
                     ) : (
                        <li className="text-xs text-slate-400 italic">No services selected</li>
                     )}
                  </ul>
               </div>

               {/* Barcode Visual */}
               <div className="pt-2">
                  <div className="h-12 w-full bg-slate-100 rounded flex items-center justify-center gap-1 opacity-50">
                     {[...Array(20)].map((_, i) => (
                        <div key={i} className={`h-8 w-${i % 2 === 0 ? '1' : '0.5'} bg-slate-900`}></div>
                     ))}
                  </div>
                  <p className="text-center text-[9px] text-slate-400 mt-2 font-mono">
                    REF: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </p>
               </div>
            </div>

            <div className="bg-rose-50 p-3 text-center">
               <p className="text-[10px] text-rose-600 font-bold">Please screenshot this ticket</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN FORM LAYOUT ---
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-xl space-y-8">
          
        {/* HEADER */}
        {step === 'FORM' ? (
          <div className="pl-2 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
                 <Sparkles className="w-4 h-4 text-rose-500" /> Official Booking
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Sisters & Brows</h1>
              <p className="text-slate-600 leading-relaxed">
                Premium Aesthetics & Microblading Services. Please fill out the form below to secure your appointment.
              </p>
          </div>
        ) : (
           <div className="pl-2 animate-in fade-in slide-in-from-right-8 duration-500">
              <button 
                onClick={() => setStep('FORM')} 
                className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors mb-4"
              >
                 <ArrowLeft className="w-4 h-4" /> Back to Edit
              </button>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Review Details</h1>
              <p className="text-slate-600">Please confirm everything is correct before finalizing.</p>
           </div>
        )}

        <form 
          ref={formRef} 
          action={formAction} 
          className="space-y-6"
          noValidate={step === 'REVIEW'} 
        >
          
          {/* ==================== STEP 1: INPUT FIELDS ==================== */}
          <div className={step === 'FORM' ? 'space-y-6 block animate-in fade-in duration-300' : 'hidden'}>
            
            {/* 1. START HERE CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="bg-[#0f172a] px-6 py-4 flex items-center gap-2">
                  <FileText className="text-white w-5 h-5" />
                  <h2 className="text-white font-bold text-sm tracking-wide uppercase">Start Here</h2>
               </div>
               <div className="p-6">
                  <p className="text-sm font-bold text-slate-700 mb-4">What would you like to do?</p>
                  <div className="space-y-3">
                      <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${bookingType === "New Appointment" ? "border-[#0f172a] bg-slate-50" : "border-slate-100 hover:border-slate-200"}`}>
                         <input type="radio" name="type" value="New Appointment" checked={bookingType === "New Appointment"} onChange={() => setBookingType("New Appointment")} className="w-5 h-5 text-slate-900 focus:ring-slate-900 border-gray-300" />
                         <span className="ml-3 font-bold text-slate-900">New Reservation</span>
                      </label>
                      <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${bookingType === "Reschedule" ? "border-[#0f172a] bg-slate-50" : "border-slate-100 hover:border-slate-200"}`}>
                         <input type="radio" name="type" value="Reschedule" checked={bookingType === "Reschedule"} onChange={() => setBookingType("Reschedule")} className="w-5 h-5 text-slate-900 focus:ring-slate-900 border-gray-300" />
                         <span className="ml-3 font-bold text-slate-900">Reschedule Booking</span>
                      </label>
                  </div>
               </div>
            </div>

            {/* 2. LOCATION & DATE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                   <MapPin className="w-5 h-5 text-slate-400" /> Location & Date
                </div>
                <div className="space-y-4">
                   <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Select Branch</label>
                      <div className="relative">
                         <select name="branch" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="w-full appearance-none bg-slate-50 border border-slate-100 text-slate-900 font-semibold rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer hover:bg-slate-100 transition-colors">
                             {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                   </div>
                   <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Select Date</label>
                      <div className="relative">
                          <input name="date" type="date" value={selectedDate} required min={today} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-slate-50 border border-slate-100 text-slate-900 font-semibold rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer uppercase hover:bg-slate-100 transition-colors placeholder:normal-case" />
                          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                   </div>
                </div>
            </div>

            {/* 3. TIME SLOTS - NOW HIDDEN IF NO DATE SELECTED */}
            {selectedDate ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                        <Sparkles className="w-5 h-5 text-slate-400" /> Available Slots
                     </div>
                     {loadingSlots && <span className="text-xs font-bold text-rose-500 animate-pulse">Checking...</span>}
                  </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {TIME_FRAMES.map((slot) => {
                      const timeKey = slot.split(' - ')[0]; 
                      const count = slotCounts[timeKey] || 0;
                      const MAX = 4;
                      const available = MAX - count;
                      const isFull = available <= 0;
                      const percentage = Math.max(0, (available / MAX) * 100);
                      
                      let barColor = "bg-rose-400"; 
                      if (percentage <= 50) barColor = "bg-orange-400"; 
                      if (percentage <= 25) barColor = "bg-red-500";    
                      if (isFull) barColor = "bg-slate-300";

                      return (
                        <label key={slot} className={`relative overflow-hidden rounded-xl border transition-all duration-200 cursor-pointer group ${isFull ? 'bg-slate-50 border-transparent opacity-60 cursor-not-allowed' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'}`}>
                           <input type="radio" name="time" value={slot} disabled={isFull} required className="peer hidden" />
                           <div className="absolute inset-0 bg-[#0f172a] opacity-0 peer-checked:opacity-100 transition-all duration-300 z-0"></div>
                           <div className={`p-4 relative z-10 transition-colors duration-300 ${isFull ? 'text-slate-400' : 'text-slate-700 peer-checked:text-white'}`}>
                              <div className="flex justify-between items-center mb-3">
                                 <span className="font-bold text-sm">{slot}</span>
                                 <span className="text-[10px] font-bold uppercase opacity-70">{isFull ? 'Full' : `${available} Left`}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden peer-checked:bg-white/20">
                                 <div className={`h-full rounded-full transition-all duration-500 ${barColor} peer-checked:bg-white`} style={{ width: `${percentage}%` }}></div>
                              </div>
                           </div>
                        </label>
                      );
                   })}
                 </div>
              </div>
            ) : (
               /* Empty State */
               <div className="text-center p-6 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-100 rounded-2xl">
                  Select a date above to view available time slots
               </div>
            )}

            {/* 4. SERVICES */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
               <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                  <FileText className="w-5 h-5 text-slate-400" /> Select Services
               </div>
               <div className="divide-y divide-slate-50 border rounded-xl border-slate-100">
                 {SERVICES_DATA.map((service) => (
                   <label key={service.name} className="flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer transition-colors group">
                      <div className="relative flex items-center justify-center">
                         <input type="checkbox" name="services" value={service.name} className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded checked:bg-rose-500 checked:border-rose-500 transition-all" />
                         <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900 text-sm group-hover:text-rose-600 transition-colors">{service.name}</span>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{service.price}</span>
                         </div>
                         <p className="text-xs text-slate-400 mt-0.5">{service.desc}</p>
                      </div>
                   </label>
                 ))}
               </div>
            </div>

            {/* 5. GUEST INFO */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                  <User className="w-5 h-5 text-slate-400" /> Guest Details
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">First Name</label>
                      <input name="firstName" type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-rose-400 outline-none" placeholder="First Name" />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Last Name</label>
                      <input name="lastName" type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-rose-400 outline-none" placeholder="Last Name" />
                   </div>
                </div>
                <div className="space-y-1.5">
                   <div className="flex justify-between">
                     <label className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number</label>
                     <span className="text-[10px] text-rose-500 font-bold">11 Digits</span>
                   </div>
                   <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="phone" type="tel" required pattern="[0-9]{11}" maxLength={11} minLength={11} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-rose-400 outline-none" placeholder="09..." />
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase">Facebook Profile <span className="text-slate-300 font-normal normal-case">(Optional)</span></label>
                   <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="fbLink" type="url" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-rose-400 outline-none placeholder:text-slate-300" placeholder="https://facebook.com/..." />
                   </div>
                </div>
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Session</label>
                      <div className="flex gap-2">
                         {['1ST', '2ND', 'FULL'].map((ses) => (
                           <label key={ses} className="cursor-pointer">
                              <input type="radio" name="session" value={ses} defaultChecked={ses === '1ST'} className="peer hidden" />
                              <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold text-slate-400 peer-checked:bg-[#0f172a] peer-checked:text-white peer-checked:border-[#0f172a] transition-all">
                                {ses}
                              </span>
                           </label>
                         ))}
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Notes</label>
                      <input name="others" type="text" className="w-full bg-transparent border-b border-slate-200 p-1 text-sm text-slate-800 focus:border-rose-400 outline-none placeholder:text-slate-300" placeholder="Optional..." />
                   </div>
                </div>
            </div>

            {/* AGREEMENT */}
            <label className="flex gap-3 cursor-pointer group">
                <input type="checkbox" name="agreement" required className="mt-0.5 w-4 h-4 text-rose-500 rounded border-slate-300 focus:ring-rose-500" />
                <span className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
                  I confirm the details are correct and authorize Sisters & Brows to contact me.
                </span>
            </label>

            {/* PROCEED BUTTON (Validation Only) */}
            <button 
              type="button" 
              onClick={handleProceed}
              className="w-full bg-[#0f172a] text-white font-bold text-lg py-4 rounded-2xl shadow-xl hover:bg-slate-900 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
               Proceed to Review <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* ==================== STEP 2: REVIEW SUMMARY ==================== */}
          {step === 'REVIEW' && reviewData && (
             <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
                
                {/* Summary Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                   <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-[#0f172a] rounded-full flex items-center justify-center text-white">
                            <Receipt className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Booking Summary</p>
                            <p className="font-bold text-slate-900">{reviewData.type}</p>
                         </div>
                      </div>
                      <button type="button" onClick={() => setStep('FORM')} className="text-xs font-bold text-rose-500 hover:underline">Edit</button>
                   </div>
                   
                   <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                         <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Date & Time</p>
                            <p className="font-semibold text-slate-800">{reviewData.date}</p>
                            <p className="text-sm text-slate-600">{reviewData.time}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
                            <p className="font-semibold text-slate-800">{reviewData.branch}</p>
                         </div>
                      </div>

                      <div className="pb-4 border-b border-slate-100">
                         <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Selected Services</p>
                         <div className="flex flex-wrap gap-2">
                            {reviewData.services && reviewData.services.length > 0 ? (
                               reviewData.services.map((s: string) => (
                                  <span key={s} className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold border border-rose-100">{s}</span>
                               ))
                            ) : <span className="text-slate-400 italic text-sm">None selected</span>}
                         </div>
                      </div>

                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Client Details</p>
                         <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="font-bold text-slate-800 text-sm">{reviewData.firstName} {reviewData.lastName}</p>
                            <p className="text-slate-500 text-xs">{reviewData.phone}</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* ERROR DISPLAY - ADDED THIS */}
                {!state.success && state.message && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-start gap-3 animate-in fade-in">
                     <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                     <p className="text-sm font-semibold">{state.message}</p>
                  </div>
                )}

                {/* FINAL CONFIRM BUTTON (Real Submit) */}
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full bg-rose-600 text-white font-bold text-lg py-4 rounded-2xl shadow-xl hover:bg-rose-700 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                >
                  {isPending ? 'Processing...' : (
                    <>
                      Confirm Booking <Check className="w-5 h-5" />
                    </>
                  )}
                </button>
             </div>
          )}

        </form>
        
        {/* FOOTER */}
        <div className="text-center pb-8 opacity-40">
           <p className="text-sm font-bold text-slate-900">Sisters & Brows</p>
           <p className="text-[10px] text-slate-500 mt-0.5 lowercase">developed by 2xe2ipi</p>
        </div>

      </div>
    </div>
  );
}