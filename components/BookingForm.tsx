'use client'

import { useActionState, useState, useEffect } from 'react';
import { submitBooking, getSlotAvailability } from '@/app/actions';
import { 
  MapPin, Calendar, Clock, CheckCircle, User, Info, 
  Link as LinkIcon, Phone, Check, Sparkles, ChevronRight, ArrowRight
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
  
  // Logic State
  const [bookingType, setBookingType] = useState("New Appointment");
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [selectedDate, setSelectedDate] = useState("");
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);

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

  useEffect(() => {
    if (state.success && !summaryData) {
      const formElement = document.querySelector('form');
      if (formElement) {
        const formData = new FormData(formElement);
        setSummaryData({
          type: formData.get('type'),
          branch: selectedBranch,
          date: selectedDate,
          time: formData.get('time'),
          services: formData.getAll('services'),
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          phone: formData.get('phone'),
          others: formData.get('others'),
          session: formData.get('session'),
        });
      }
    }
  }, [state.success, selectedBranch, selectedDate, summaryData]);

  // --- TICKET VIEW ---
  if (state.success && summaryData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#fdfbf7]">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden animate-in zoom-in duration-500 border border-stone-100">
          <div className="bg-[#1a1a1a] text-white p-8 text-center relative overflow-hidden">
             <div className="relative z-10">
               <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/10">
                 <Check className="w-8 h-8 text-rose-400" />
               </div>
               <h2 className="text-2xl font-serif tracking-wide">Booking Confirmed</h2>
               <p className="text-stone-400 text-sm mt-1">Sisters & Brows</p>
             </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
               <span className="text-xs font-bold text-stone-400 uppercase">Type</span>
               <span className="font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full text-xs">{summaryData.type}</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                 <span className="text-stone-500 text-sm">Date</span>
                 <span className="font-medium text-stone-900">{summaryData.date}</span>
              </div>
              <div className="flex justify-between">
                 <span className="text-stone-500 text-sm">Time</span>
                 <span className="font-medium text-stone-900">{summaryData.time}</span>
              </div>
              <div className="flex justify-between">
                 <span className="text-stone-500 text-sm">Location</span>
                 <span className="font-medium text-stone-900 text-right">{summaryData.branch}</span>
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
               <p className="text-xs font-bold text-stone-400 uppercase mb-2">Services</p>
               <ul className="space-y-1">
                 {summaryData.services && summaryData.services.length > 0 ? (
                   summaryData.services.map((s: string) => (
                     <li key={s} className="text-sm font-medium text-stone-800 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> {s}
                     </li>
                   ))
                 ) : <li className="text-sm text-stone-400">No services selected</li>}
               </ul>
            </div>

            <div className="pt-2 text-center border-t border-stone-100 pt-4">
              <p className="text-xs text-stone-400">Client: {summaryData.firstName} {summaryData.lastName}</p>
            </div>
          </div>

          <div className="bg-stone-50 p-4 text-center border-t border-stone-200">
            <p className="text-[10px] text-stone-400 uppercase tracking-widest">developed by 2xe2ipi</p>
          </div>
        </div>
      </div>
    );
  }

  // --- FULL SCREEN FORM VIEW ---
  return (
    // Background: Warm Beige/Stone
    <div className="min-h-screen w-full bg-[#fdfbf7] flex flex-col">
      
      {/* GLASS CONTAINER */}
      <div className="flex-1 w-full bg-white/80 backdrop-blur-xl shadow-sm flex flex-col items-center">
        
        <div className="w-full max-w-2xl px-6 py-12 md:py-16 space-y-10">
          
          {/* Internal Header */}
          <div className="text-center space-y-3">
             <div className="inline-flex items-center justify-center p-3 bg-[#1a1a1a] text-rose-300 rounded-2xl shadow-lg">
                <Sparkles className="w-6 h-6" />
             </div>
             <h1 className="text-3xl md:text-4xl font-serif text-stone-900 tracking-tight">Sisters & Brows</h1>
             <p className="text-stone-500 font-medium">Official Reservation Interface</p>
          </div>

          <form action={formAction} className="space-y-8">
            
            {/* 1. BOOKING TYPE (Toggle) */}
            <div className="bg-stone-100 p-1.5 rounded-2xl flex relative">
               <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${bookingType === "Reschedule" ? "translate-x-[100%] left-1.5" : "translate-x-0 left-1.5"}`}></div>
               <button 
                 type="button"
                 onClick={() => setBookingType("New Appointment")}
                 className={`flex-1 relative z-10 py-3 text-sm font-bold text-center transition-colors ${bookingType === "New Appointment" ? "text-stone-900" : "text-stone-500"}`}
               >
                 New Appointment
               </button>
               <button 
                 type="button"
                 onClick={() => setBookingType("Reschedule")}
                 className={`flex-1 relative z-10 py-3 text-sm font-bold text-center transition-colors ${bookingType === "Reschedule" ? "text-stone-900" : "text-stone-500"}`}
               >
                 Reschedule
               </button>
               <input type="hidden" name="type" value={bookingType} />
            </div>

            {/* 2. LOCATION & DATE */}
            <div className="space-y-3">
               <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">Details</h3>
               <div className="bg-white rounded-2xl border border-stone-200 shadow-sm divide-y divide-stone-50">
                  {/* Branch */}
                  <div className="p-4 flex items-center gap-4 hover:bg-stone-50 transition-colors">
                     <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
                        <MapPin className="w-5 h-5" />
                     </div>
                     <div className="flex-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">Branch</label>
                        <select 
                          name="branch" 
                          value={selectedBranch}
                          onChange={(e) => setSelectedBranch(e.target.value)}
                          className="w-full bg-transparent font-bold text-stone-900 outline-none appearance-none cursor-pointer text-base"
                        >
                           {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                     </div>
                     <ChevronRight className="w-5 h-5 text-stone-300" />
                  </div>

                  {/* Date */}
                  <div className="p-4 flex items-center gap-4 hover:bg-stone-50 transition-colors">
                     <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
                        <Calendar className="w-5 h-5" />
                     </div>
                     <div className="flex-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">Date</label>
                        <input 
                          name="date" 
                          type="date" 
                          required 
                          min={today}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full bg-transparent font-bold text-stone-900 outline-none cursor-pointer text-base" 
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* 3. TIME SLOTS - REFINED & OBVIOUS */}
            <div className="space-y-3">
               <div className="flex justify-between items-center ml-1">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Select Time</h3>
                  {loadingSlots && <span className="text-[10px] font-bold text-rose-500 animate-pulse">Checking...</span>}
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {TIME_FRAMES.map((slot) => {
                    const timeKey = slot.split(' - ')[0]; 
                    const count = slotCounts[timeKey] || 0;
                    const MAX = 4;
                    const available = MAX - count;
                    const isFull = available <= 0;
                    const percentage = Math.max(0, (available / MAX) * 100);

                    // Logic: Pink for good, Orange for low, Gray for full
                    let barColor = "bg-rose-400"; 
                    if (percentage <= 50) barColor = "bg-orange-300";
                    if (percentage <= 25) barColor = "bg-red-400";
                    if (isFull) barColor = "bg-stone-600"; // Darker gray for full

                    return (
                      <label key={slot} className={`
                         relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer group
                         ${isFull 
                           ? 'bg-stone-50 border-transparent opacity-60 cursor-not-allowed' 
                           : 'hover:shadow-md'
                         }
                      `}>
                         <input 
                           type="radio" 
                           name="time" 
                           value={slot} 
                           disabled={isFull}
                           required
                           className="peer hidden" 
                         />
                         
                         {/* UNSELECTED STATE: White Bg, Stone Border */}
                         <div className="absolute inset-0 bg-white border border-stone-200 rounded-xl peer-checked:opacity-0 transition-opacity"></div>
                         
                         {/* SELECTED STATE: Solid Black Bg - VERY OBVIOUS */}
                         <div className="absolute inset-0 bg-[#1a1a1a] border border-[#1a1a1a] rounded-xl opacity-0 peer-checked:opacity-100 transition-opacity"></div>

                         {/* Content Layer */}
                         <div className="p-4 relative z-10">
                            <div className="flex justify-between items-center mb-3">
                               <span className={`font-bold text-sm transition-colors duration-300 ${isFull ? 'text-stone-400' : 'text-stone-800 peer-checked:text-white'}`}>
                                 {slot}
                               </span>
                               <span className={`text-[10px] font-bold uppercase transition-colors duration-300 ${isFull ? 'text-stone-400' : 'text-stone-500 peer-checked:text-stone-400'}`}>
                                 {isFull ? 'Full' : `${available} Left`}
                               </span>
                            </div>
                            
                            {/* Visual Bar - Turns White when selected for contrast */}
                            <div className={`w-full h-1.5 rounded-full overflow-hidden transition-colors duration-300 ${isFull ? 'bg-stone-200' : 'bg-stone-100 peer-checked:bg-white/20'}`}>
                               <div 
                                 className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-stone-300' : (percentage < 30 ? 'bg-orange-400 peer-checked:bg-white' : 'bg-rose-400 peer-checked:bg-white')}`} 
                                 style={{ width: `${percentage}%` }}
                               ></div>
                            </div>
                         </div>
                      </label>
                    );
                 })}
               </div>
            </div>

            {/* 4. SERVICES */}
            <div className="space-y-3">
               <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">Menu</h3>
               <div className="bg-white rounded-2xl border border-stone-200 shadow-sm divide-y divide-stone-50">
                 {SERVICES_DATA.map((service) => (
                   <label key={service.name} className="flex items-center gap-4 p-4 hover:bg-stone-50 cursor-pointer transition-colors group">
                      <div className="relative flex items-center justify-center">
                         <input type="checkbox" name="services" value={service.name} className="peer appearance-none w-5 h-5 border-2 border-stone-300 rounded checked:bg-[#1a1a1a] checked:border-[#1a1a1a] transition-all" />
                         <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-center">
                            <span className="font-bold text-stone-900 text-sm group-hover:text-black transition-colors">{service.name}</span>
                            <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded">{service.price}</span>
                         </div>
                         <p className="text-xs text-stone-400 mt-0.5">{service.desc}</p>
                      </div>
                   </label>
                 ))}
               </div>
            </div>

            {/* 5. GUEST INFO */}
            <div className="space-y-3">
               <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1">Guest Info</h3>
               <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase">First Name</label>
                        <input name="firstName" type="text" required className="w-full bg-stone-50 border-0 rounded-lg p-3 text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-[#1a1a1a] placeholder:text-stone-300" placeholder="First Name" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase">Last Name</label>
                        <input name="lastName" type="text" required className="w-full bg-stone-50 border-0 rounded-lg p-3 text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-[#1a1a1a] placeholder:text-stone-300" placeholder="Last Name" />
                     </div>
                  </div>

                  <div className="space-y-1">
                     <div className="flex justify-between">
                       <label className="text-[10px] font-bold text-stone-400 uppercase">Mobile Number</label>
                       <span className="text-[10px] text-stone-400 font-bold">11 Digits</span>
                     </div>
                     <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input 
                          name="phone" 
                          type="tel" 
                          required 
                          pattern="[0-9]{11}" 
                          maxLength={11}
                          minLength={11}
                          className="w-full bg-stone-50 border-0 rounded-lg p-3 pl-10 text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-[#1a1a1a] placeholder:text-stone-300" 
                          placeholder="09..." 
                        />
                     </div>
                  </div>

                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-stone-400 uppercase">Facebook Profile</label>
                     <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input name="fbLink" type="url" required className="w-full bg-stone-50 border-0 rounded-lg p-3 pl-10 text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-[#1a1a1a] placeholder:text-stone-300" placeholder="https://facebook.com/..." />
                     </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase mb-2 block">Session</label>
                        <div className="flex gap-2">
                           {['1ST', '2ND', 'FULL'].map((ses) => (
                             <label key={ses} className="cursor-pointer">
                                <input type="radio" name="session" value={ses} defaultChecked={ses === '1ST'} className="peer hidden" />
                                <span className="px-3 py-1 bg-stone-50 rounded-md text-xs font-bold text-stone-400 peer-checked:bg-[#1a1a1a] peer-checked:text-white transition-all shadow-sm border border-transparent">
                                  {ses}
                                </span>
                             </label>
                           ))}
                        </div>
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase mb-2 block">Notes</label>
                        <input name="others" type="text" className="w-full bg-transparent border-b border-stone-200 p-1 text-sm text-stone-800 focus:border-[#1a1a1a] outline-none placeholder:text-stone-300" placeholder="Optional..." />
                     </div>
                  </div>
               </div>
            </div>

            {/* SUBMIT */}
            <div className="pt-2">
               <label className="flex gap-3 mb-6 cursor-pointer group">
                  <input type="checkbox" name="agreement" required className="mt-0.5 w-4 h-4 text-[#1a1a1a] rounded border-stone-300 focus:ring-[#1a1a1a]" />
                  <span className="text-xs text-stone-500 leading-relaxed group-hover:text-stone-700 transition-colors">
                    I confirm the details are correct and authorize Sisters & Brows to contact me.
                  </span>
               </label>

               <button 
                 type="submit" 
                 disabled={isPending}
                 className="w-full bg-[#1a1a1a] text-white font-bold text-lg py-4 rounded-2xl shadow-xl hover:bg-black hover:scale-[1.01] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
               >
                 {isPending ? 'Processing...' : (
                   <>
                     Confirm Reservation <ArrowRight className="w-5 h-5" />
                   </>
                 )}
               </button>
            </div>

          </form>
          
          {/* FOOTER */}
          <div className="text-center pb-8 opacity-40">
             <p className="text-sm font-bold text-stone-900">Sisters & Brows</p>
             <p className="text-[10px] text-stone-500 mt-0.5 lowercase">developed by 2xe2ipi</p>
          </div>

        </div>
      </div>
    </div>
  );
}