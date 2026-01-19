'use client'

import { useActionState } from 'react';
import { submitBooking } from '@/app/actions';
import { MapPin, Calendar, Clock, User, Facebook, Phone, Users, CheckCircle } from 'lucide-react';

const SERVICES = [
  "9D Microblading", "Ombre Brows", "Combo Brows", "Lash Line", 
  "Lip Blush", "Derma Pen", "BB Glow", "Scalp Micropigmentation",
  "Mix and Match 1", "Mix and Match 2", "Mix and Match 3", "Mix and Match 4",
  "Mix and Match 5", "Mix and Match 6", "Mix and Match 7", "Mix and Match 8"
];

const initialState = {
  success: false,
  message: '',
};

export default function BookingForm() {
  const [state, formAction, isPending] = useActionState(submitBooking, initialState);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-stone-100">
      
      {/* Golden Header */}
      <div className="bg-gradient-to-r from-[#B88746] to-[#D4AF37] p-8 text-center text-white">
        <h2 className="text-3xl font-serif tracking-wide mb-2">Book Your Appointment</h2>
        <p className="text-white/90 text-sm uppercase tracking-widest">Sisters & Brows • Luxury Aesthetics</p>
      </div>

      <form action={formAction} className="p-8 md:p-12 space-y-10">
        
        {/* --- SECTION 1: APPOINTMENT DETAILS --- */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-stone-200 pb-2">
            <Calendar className="text-[#B88746]" size={20} />
            <h3 className="text-xl font-serif text-stone-800">Appointment Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Type & Session */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Booking Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer bg-stone-50 px-4 py-2 rounded-lg border border-stone-200 hover:border-[#B88746] transition">
                    <input type="radio" name="type" value="New Appointment" defaultChecked className="accent-[#B88746]" />
                    <span>New Appointment</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-stone-50 px-4 py-2 rounded-lg border border-stone-200 hover:border-[#B88746] transition">
                    <input type="radio" name="type" value="Reschedule" className="accent-[#B88746]" />
                    <span>Reschedule</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Session</label>
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

            {/* Branch */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">
                Select Branch
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-stone-400" size={18} />
                <select name="branch" className="w-full pl-10 p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-[#B88746] outline-none">
                  <option value="Parañaque, Metro Manila">Parañaque, Metro Manila</option>
                  <option value="Lipa, Batangas">Lipa, Batangas</option>
                  <option value="San Pablo, Laguna">San Pablo, Laguna</option>
                  <option value="Novaliches, Quezon City">Novaliches, Quezon City</option>
                  <option value="Dasmariñas, Cavite">Dasmariñas, Cavite</option>
                  <option value="Comembo, Taguig">Comembo, Taguig</option>
                </select>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Date</label>
              <input name="date" type="date" required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-[#B88746] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 text-stone-400" size={18} />
                <input name="time" type="time" required className="w-full pl-10 p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-[#B88746] outline-none" />
              </div>
              <p className="text-xs text-stone-500 mt-1">Open Daily: 10:00 AM - 7:00 PM</p>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: SERVICES --- */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-stone-200 pb-2">
            <CheckCircle className="text-[#B88746]" size={20} />
            <h3 className="text-xl font-serif text-stone-800">Services</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {SERVICES.map((service) => (
              <label key={service} className="flex items-center gap-3 p-3 border border-stone-100 rounded-lg hover:bg-stone-50 transition cursor-pointer">
                <input type="checkbox" name="services" value={service} className="w-4 h-4 accent-[#B88746] rounded" />
                <span className="text-sm text-stone-700">{service}</span>
              </label>
            ))}
          </div>
        </section>

        {/* --- SECTION 3: CLIENT INFO --- */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-stone-200 pb-2">
            <User className="text-[#B88746]" size={20} />
            <h3 className="text-xl font-serif text-stone-800">Client Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">First Name</label>
              <input name="firstName" type="text" placeholder="Maria" required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-[#B88746]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Last Name</label>
              <input name="lastName" type="text" placeholder="Dela Cruz" required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-[#B88746]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             <div className="relative">
                <label className="block text-sm font-bold text-stone-700 mb-2">Facebook Name</label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-3.5 text-stone-400" size={18} />
                  <input name="fbName" type="text" required className="w-full pl-10 p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-[#B88746]" />
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

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2">
              <Users size={16} /> Name of Others (If group booking)
            </label>
            <textarea name="others" rows={3} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-[#B88746]" placeholder="Leave blank if you are booking for 1 person only."></textarea>
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
            className="w-full bg-[#1A1A1A] text-white font-serif tracking-widest uppercase py-4 rounded-lg hover:bg-[#B88746] transition-all duration-300 shadow-lg disabled:opacity-50"
          >
            {isPending ? 'Confirming Appointment...' : 'Submit Booking'}
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