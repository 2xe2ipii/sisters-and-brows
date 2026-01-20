import { User, Phone, MessageSquare, Link as LinkIcon } from 'lucide-react';

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

      {/* Mobile Number - Helper text removed, validation kept */}
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

      {/* Facebook Profile - RESTORED */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase">Facebook Profile <span className="text-slate-300 font-normal normal-case">(Optional)</span></label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input name="fbLink" type="url" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-rose-400 outline-none placeholder:text-slate-300" placeholder="https://facebook.com/..." />
        </div>
      </div>

      {/* Notes - Enlarged */}
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