import { User, Phone, MessageSquare, Link as LinkIcon, Package, CreditCard } from 'lucide-react';

export default function GuestForm() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
        <User className="w-5 h-5 text-slate-400" /> Guest Details
      </div>

      {/* Name Row */}
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

      {/* Mobile Number */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number</label>
        <div className="relative max-w-[14rem]">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            name="phone" 
            type="tel" 
            required 
            pattern="[0-9]{11}" 
            maxLength={11} 
            minLength={11} 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-rose-400 outline-none tracking-widest" 
            placeholder="09........." 
          />
        </div>
      </div>

      {/* ACK & MOP Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
             <Package className="w-3 h-3" /> After Care Kit
          </label>
          <div className="relative">
             <select name="ack" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-rose-400 outline-none appearance-none cursor-pointer">
               <option value="NO ACK">No (Standard)</option>
               <option value="ACK">Yes (+Kit)</option>
             </select>
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
             </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
             <CreditCard className="w-3 h-3" /> Mode of Payment
          </label>
          <div className="relative">
             <select name="mop" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-rose-400 outline-none appearance-none cursor-pointer">
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
      </div>

      {/* Facebook Profile */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase">Facebook Profile <span className="text-slate-300 font-normal normal-case">(Optional)</span></label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input name="fbLink" type="url" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-rose-400 outline-none placeholder:text-slate-300" placeholder="https://facebook.com/..." />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5 pt-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
          Notes / Remarks <span className="text-slate-300 font-normal normal-case">(Optional)</span>
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-4 w-4 h-4 text-slate-400" />
          <textarea 
            name="others" 
            rows={4}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-rose-400 outline-none resize-none placeholder:text-slate-300 leading-relaxed" 
            placeholder="Any special requests or details..." 
          />
        </div>
      </div>
    </div>
  );
}