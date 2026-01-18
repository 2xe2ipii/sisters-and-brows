'use client'

import { useActionState } from 'react';
import { submitBooking } from '@/app/actions';
import { Calendar, User, Phone, Sparkles, Clock, Facebook, CreditCard, MapPin } from 'lucide-react';

const initialState = {
  success: false,
  message: '',
};

export default function BookingForm() {
  const [state, formAction, isPending] = useActionState(submitBooking, initialState);

  return (
    <form action={formAction} className="bg-stone-50 p-8 rounded-xl shadow-lg border border-stone-200 max-w-lg w-full">
      <h2 className="text-2xl font-serif text-stone-800 mb-6 text-center">Book Appointment</h2>

      {/* Branch & Session (Two columns) */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="flex items-center gap-2 text-stone-600 mb-1 text-sm font-medium">
            <MapPin size={16} /> Branch
          </label>
          <select name="branch" className="w-full p-3 border border-stone-300 rounded-lg bg-white">
            <option value="Lipa">Lipa</option>
            <option value="PQ">PQ</option>
            <option value="SP">SP</option>
          </select>
        </div>
        <div>
          <label className="flex items-center gap-2 text-stone-600 mb-1 text-sm font-medium">
             Session
          </label>
          <select name="session" className="w-full p-3 border border-stone-300 rounded-lg bg-white">
            <option value="1ST">1st Session</option>
            <option value="2ND">2nd Session (Retouch)</option>
          </select>
        </div>
      </div>

      {/* Full Name */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-stone-600 mb-1 text-sm font-medium">
          <User size={16} /> Full Name
        </label>
        <input name="fullName" type="text" required className="w-full p-3 border border-stone-300 rounded-lg outline-none focus:ring-1 focus:ring-amber-500" placeholder="Maria Dela Cruz" />
      </div>

      {/* Facebook Name (Optional but requested) */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-stone-600 mb-1 text-sm font-medium">
          <Facebook size={16} /> Facebook Name
        </label>
        <input name="fbName" type="text" className="w-full p-3 border border-stone-300 rounded-lg outline-none focus:ring-1 focus:ring-amber-500" placeholder="Maria FB" />
      </div>

      {/* Contact */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-stone-600 mb-1 text-sm font-medium">
          <Phone size={16} /> Contact Number
        </label>
        <input name="phone" type="tel" required className="w-full p-3 border border-stone-300 rounded-lg outline-none focus:ring-1 focus:ring-amber-500" placeholder="0917 123 4567" />
      </div>

      {/* Service */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-stone-600 mb-1 text-sm font-medium">
          <Sparkles size={16} /> Service
        </label>
        <select name="service" className="w-full p-3 border border-stone-300 rounded-lg bg-white">
          <option value="Combo Brows">Combo Brows</option>
          <option value="9d microblading">9d Microblading</option>
          <option value="Lash Line">Lash Line</option>
          <option value="Lip Blush">Lip Blush</option>
          <option value="Retouch">Retouch</option>
        </select>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="flex items-center gap-2 text-stone-600 mb-1 text-sm font-medium">
            <Calendar size={16} /> Date
          </label>
          <input name="date" type="date" required className="w-full p-3 border border-stone-300 rounded-lg" />
        </div>
        <div>
          <label className="flex items-center gap-2 text-stone-600 mb-1 text-sm font-medium">
            <Clock size={16} /> Time
          </label>
          <input name="time" type="time" required className="w-full p-3 border border-stone-300 rounded-lg" />
        </div>
      </div>

      {/* Mode of Payment */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-stone-600 mb-1 text-sm font-medium">
          <CreditCard size={16} /> M O P (Mode of Payment)
        </label>
        <select name="mop" className="w-full p-3 border border-stone-300 rounded-lg bg-white">
          <option value="CASH">CASH</option>
          <option value="GCASH">GCASH</option>
        </select>
      </div>

      {/* Submit */}
      <button 
        type="submit" 
        disabled={isPending}
        className="w-full bg-stone-900 text-white py-3 rounded-lg font-medium hover:bg-stone-800 transition disabled:opacity-50"
      >
        {isPending ? 'Submitting...' : 'Confirm Booking'}
      </button>

      {state.message && (
        <p className={`mt-4 text-center text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}