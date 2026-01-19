'use client'

import { useActionState, useState, useEffect } from 'react';
import { submitBooking, getSlotAvailability } from '@/app/actions';
import { MapPin, Calendar, Clock, User, Facebook, Phone, Users, CheckCircle, Info, Link as LinkIcon } from 'lucide-react';

// --- DATA CONSTANTS ---
const TIME_FRAMES = [
  "10:00 AM - 11:30 AM",
  "11:30 AM - 1:00 PM",
  "1:00 PM - 2:30 PM",
  "2:30 PM - 4:00 PM",
  "4:00 PM - 5:30 PM",
  "5:30 PM - 7:00 PM"
];

const SERVICES_DATA = [
  { name: "9D Microblading", price: "₱4,500", desc: "Natural hair-like strokes." },
  { name: "Ombre Brows", price: "₱4,000", desc: "Soft, misty powder effect." },
  { name: "Combo Brows", price: "₱5,000", desc: "Microblading + Shading." },
  { name: "Lash Line", price: "₱2,500", desc: "Subtle eye definition." },
  { name: "Lip Blush", price: "₱5,500", desc: "Natural looking lip tint." },
  { name: "Derma Pen", price: "₱2,000", desc: "Microneedling for skin texture." },
  { name: "BB Glow", price: "₱2,500", desc: "Semi-permanent foundation." },
  { name: "Scalp Micropigmentation", price: "Varied", desc: "Hair density simulation." },
  // ... You can add the Mix & Match bundles here later
];

const initialState = {
  success: false,
  message: '',
};

export default function BookingForm() {
  const [state, formAction, isPending] = useActionState(submitBooking, initialState);
  
  // State for Availability Logic
  const [selectedBranch, setSelectedBranch] = useState("Parañaque, Metro Manila");
  const [selectedDate, setSelectedDate] = useState("");
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch Availability when Branch or Date changes
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDate || !selectedBranch) return;
      setLoadingSlots(true);
      const result = await getSlotAvailability(selectedDate, selectedBranch);
      if (result.success) {
        setSlotCounts(result.counts);
      }
      setLoadingSlots(false);
    }
    fetchSlots();
  }, [selectedDate, selectedBranch]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-stone-100">
      
      {/* Golden Header with Logo Placeholder */}
      <div className="bg-gradient-to-r from-[#B88746] to-[#D4AF37] p-8 text-center text-white relative">
        <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
           <span className="font-serif text-2xl font-bold">SB</span>
        </div>
        <h2 className="text-3xl font-serif tracking-wide mb-2">Book Your Appointment</h2>
        <p className="text-white/90 text-sm uppercase tracking-widest">Sisters & Brows • Luxury Aesthetics</p>
      </div>

      <form action={formAction} className="p-6 md:p-12 space-y-12">
        
        {/* --- SECTION 1: THE BASICS --- */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
            <Calendar className="text-[#B88746]" size={20} />
            <h3 className="text-xl font-serif text-stone-800">Date & Location</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Branch Selection */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">
                Select Branch
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 text-stone-400" size={18} />
                <select 
                  name="branch" 
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full pl-10 p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-[#B88746] outline-none"
                >
                  <option value="Parañaque, Metro Manila">Parañaque, Metro Manila</option>
                  <option value="Lipa, Batangas">Lipa, Batangas</option>
                  <option value="San Pablo, Laguna">San Pablo, Laguna</option>
                  <option value="Novaliches, Quezon City">Novaliches, Quezon City</option>
                  <option value="Dasmariñas, Cavite">Dasmariñas, Cavite</option>
                  <option value="Comembo, Taguig">Comembo, Taguig</option>
                </select>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Date</label>
              <input 
                name="date" 
                type="date" 
                required 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-[#B88746] outline-none" 
              />
            </div>
          </div>
        </section>

        {/* --- SECTION 2: TIME SLOTS (The Capacity Logic) --- */}
        <section className="space-y-6">
           <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
            <Clock className="text-[#B88746]" size={20} />
            <h3 className="text-xl font-serif text-stone-800">Select Time Slot</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TIME_FRAMES.map((slot) => {
              // Extract "10:00 AM" for matching
              const timeKey = slot.split(' - ')[0]; 
              const count = slotCounts[timeKey] || 0;
              const isFull = count >= 4;

              return (
                <label key={slot} className={`
                  relative border rounded-xl p-4 cursor-pointer transition-all
                  ${isFull 
                    ? 'bg-stone-100 border-stone-200 opacity-50 cursor-not-allowed' 
                    : 'bg-white border-stone-200 hover:border-[#B88746] hover:shadow-md'
                  }
                `}>
                  <input 
                    type="radio" 
                    name="time" 
                    value={slot} 
                    disabled={isFull}
                    required
                    className="absolute top-4 right-4 accent-[#B88746]" 
                  />
                  <div className="pr-6">
                    <span className={`block font-bold text-sm ${isFull ? 'text-stone-400' : 'text-stone-800'}`}>
                      {slot}
                    </span>
                    <span className={`text-xs mt-1 block ${isFull ? 'text-red-500 font-bold' : 'text-green-600'}`}>
                      {isFull ? 'FULLY BOOKED' : `${4 - count} slots left`}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
          {loadingSlots && <p className="text-xs text-[#B88746] animate-pulse">Checking availability...</p>}
        </section>

        {/* --- SECTION 3: SERVICES (The Menu) --- */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
            <CheckCircle className="text-[#B88746]" size={20} />
            <h3 className="text-xl font-serif text-stone-800">Choose Services</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERVICES_DATA.map((service) => (
              <label key={service.name} className="flex items-start gap-4 p-4 border border-stone-100 rounded-xl hover:bg-stone-50 transition cursor-pointer group">
                <input type="checkbox" name="services" value={service.name} className="mt-1 w-5 h-5 accent-[#B88746] rounded" />
                <div>
                  <h4 className="font-bold text-stone-800 group-hover:text-[#B88746] transition">{service.name}</h4>
                  <p className="text-xs text-stone-500 mt-1">{service.desc}</p>
                  <p className="text-sm font-semibold text-[#B88746] mt-2">{service.price}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* --- SECTION 4: CLIENT INFO (Facebook Link Fix) --- */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
            <User className="text-[#B88746]" size={20} />
            <h3 className="text-xl font-serif text-stone-800">Your Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">First Name</label>
              <input name="firstName" type="text" required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-[#B88746]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Last Name</label>
              <input name="lastName" type="text" required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-[#B88746]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Facebook Link with Tooltip */}
             <div>
                <label className="block text-sm font-bold text-stone-700 mb-2 flex justify-between items-center">
                  Facebook Profile Link
                  <div className="group relative">
                    <Info size={14} className="text-stone-400 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-stone-800 text-white text-xs p-2 rounded shadow-lg hidden group-hover:block z-10">
                      Go to your Profile &gt; Click (...) &gt; Copy Link
                    </div>
                  </div>
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3.5 text-stone-400" size={18} />
                  <input 
                    name="fbLink" 
                    type="url" 
                    placeholder="https://facebook.com/your.name" 
                    required 
                    className="w-full pl-10 p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-[#B88746]" 
                  />
                </div>
            </div>
             <div className="relative">
                <label className="block text-sm font-bold text-stone-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 text-stone-400" size={18} />
                  <input name="phone" type="tel" required className="w-full pl-10 p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-[#B88746]" />
                </div>
            </div>
          </div>

          {/* Booking Type (New/Reschedule) */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <span className="block text-sm font-bold text-stone-700 mb-3 uppercase tracking-wide">Booking Options</span>
            <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="type" value="New Appointment" defaultChecked className="accent-[#B88746]" />
                    <span className="text-sm font-medium">New Appointment</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="type" value="Reschedule" className="accent-[#B88746]" />
                    <span className="text-sm font-medium">Reschedule (Move my booking)</span>
                </label>
            </div>
            
            <div className="mt-4 pt-4 border-t border-stone-200">
                <span className="block text-sm font-bold text-stone-700 mb-3 uppercase tracking-wide">Session Type</span>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="session" value="1ST" defaultChecked className="accent-[#B88746]" /> First Session
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="session" value="2ND" className="accent-[#B88746]" /> Second Session
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="session" value="FULL" className="accent-[#B88746]" /> Full Session
                  </label>
                </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2">
              <Users size={16} /> Booking for others? (Optional)
            </label>
            <textarea name="others" rows={2} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-[#B88746]" placeholder="List names here if booking for a group."></textarea>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <div className="pt-6 border-t border-stone-200">
          <label className="flex items-center gap-3 mb-6 cursor-pointer">
            <input type="checkbox" name="agreement" required className="w-5 h-5 accent-[#B88746]" />
            <span className="text-sm text-stone-600">
              I agree that the details provided are correct and I allow Sisters & Brows to contact me.
            </span>
          </label>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[#1A1A1A] text-white font-serif tracking-widest uppercase py-4 rounded-lg hover:bg-[#B88746] transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Processing Booking...' : 'Confirm Appointment'}
          </button>

          {state.message && (
            <div className={`mt-6 p-4 text-center rounded-lg ${state.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              <p className="font-medium">{state.message}</p>
            </div>
          )}
        </div>

      </form>
    </div>
  );
}