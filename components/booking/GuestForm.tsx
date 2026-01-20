import { User, Phone, Link as LinkIcon } from 'lucide-react';

export default function GuestForm() {
  return (
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
                <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold text-slate-400 peer-checked:bg-[#0f172a] peer-checked:text-white peer-checked:border-[#0f172a] transition-all">{ses}</span>
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
  );
}