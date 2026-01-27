import { useState } from 'react';
import { Phone, CreditCard } from 'lucide-react';

export default function GuestForm() {
  const [ack, setAck] = useState("NO ACK");

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
      
      {/* Name Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">First Name</label>
          <input 
            name="firstName" 
            type="text" 
            required 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none" 
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Last Name</label>
          <input 
            name="lastName" 
            type="text" 
            required 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none" 
          />
        </div>
      </div>

      {/* Mobile Number */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
          <Phone className="w-3 h-3" /> Mobile Number (11 Digits)
        </label>
        <div className="relative">
          <input 
            name="phone" 
            type="tel" 
            required 
            pattern="09[0-9]{9}" 
            maxLength={11} 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none tracking-widest" 
          />
        </div>
      </div>

      {/* Facebook Profile */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase">
          Facebook Profile <span className="text-slate-300 font-normal normal-case">(Optional)</span>
        </label>
        <input 
          name="fbLink" 
          type="url" 
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none" 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Mode of Payment */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
             <CreditCard className="w-3 h-3" /> Mode of Payment
          </label>
          <div className="relative">
             <select 
               name="mop" 
               className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none appearance-none cursor-pointer"
             >
               <option value="Cash">Cash</option>
               <option value="G-Cash">GCash</option>
               <option value="Maya">Maya</option>
               <option value="Bank">Bank Transfer</option>
               <option value="Other">Other</option>
             </select>
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
             </div>
          </div>
        </div>

        {/* After Care Kit (Vertical Buttons) */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Avail After Care Kit?</label>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setAck("ACK")}
              className={`py-2 rounded-lg text-xs font-bold border transition-all ${ack === "ACK" ? "bg-rose-500 text-white border-rose-500" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}
            >
              Yes (+Kit)
            </button>
            <button
              type="button"
              onClick={() => setAck("NO ACK")}
              className={`py-2 rounded-lg text-xs font-bold border transition-all ${ack === "NO ACK" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}
            >
              No (Standard)
            </button>
            <input type="hidden" name="ack" value={ack} />
          </div>
        </div>
      </div>

    </div>
  );
}