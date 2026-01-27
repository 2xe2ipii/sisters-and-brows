import { User, Phone, Facebook } from 'lucide-react';

interface GuestFormProps {
  initialData?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    fbLink?: string;
  } | null;
}

export default function GuestForm({ initialData }: GuestFormProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      
      {/* Name Fields Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* First Name */}
        <div className="space-y-1.5">
           <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
             First Name <span className="text-rose-500">*</span>
           </label>
           <div className="relative group">
              <User className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-[#e6c200] transition-colors" />
              <input 
                name="firstName" 
                type="text"
                required 
                defaultValue={initialData?.firstName || ""}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#e6c200] focus:border-transparent outline-none transition-all shadow-sm group-hover:border-slate-300" 
                placeholder="Jane" 
              />
           </div>
        </div>

        {/* Last Name */}
        <div className="space-y-1.5">
           <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
             Last Name <span className="text-rose-500">*</span>
           </label>
           <div className="relative group">
              <User className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-[#e6c200] transition-colors" />
              <input 
                name="lastName" 
                type="text"
                required 
                defaultValue={initialData?.lastName || ""}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#e6c200] focus:border-transparent outline-none transition-all shadow-sm group-hover:border-slate-300" 
                placeholder="Doe" 
              />
           </div>
        </div>
      </div>

      {/* Phone Number */}
      <div className="space-y-1.5">
         <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
           Mobile Number <span className="text-rose-500">*</span>
         </label>
         <div className="relative group">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-[#e6c200] transition-colors" />
            <input 
              name="phone" 
              type="tel" 
              required 
              defaultValue={initialData?.phone || ""}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#e6c200] focus:border-transparent outline-none transition-all shadow-sm group-hover:border-slate-300" 
              placeholder="0912 345 6789" 
            />
         </div>
      </div>

      {/* Facebook Link */}
      <div className="space-y-1.5">
         <div className="flex justify-between items-center">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Facebook Profile Link
            </label>
            <span className="text-[10px] font-bold text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
              Optional
            </span>
         </div>
         <div className="relative group">
            <Facebook className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-[#0866ff] transition-colors" />
            <input 
              name="fbLink" 
              type="url" 
              defaultValue={initialData?.fbLink || ""}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-[#0866ff] focus:border-transparent outline-none transition-all shadow-sm group-hover:border-slate-300" 
              placeholder="https://facebook.com/yourprofile" 
            />
         </div>
         <p className="text-[10px] text-slate-400 ml-1">
           Used for appointment reminders via Messenger.
         </p>
      </div>

    </div>
  );
}