import { User, Phone, Facebook, MessageSquare } from 'lucide-react';

interface GuestFormProps {
  initialData?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    fbLink?: string;
  };
}

export default function GuestForm({ initialData }: GuestFormProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wide">
        <User className="w-4 h-4 text-rose-500" /> Guest Details
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
          <input 
            type="text" 
            name="firstName" 
            required 
            defaultValue={initialData?.firstName}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500" 
            placeholder="e.g. Maria"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
          <input 
            type="text" 
            name="lastName" 
            required 
            defaultValue={initialData?.lastName}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500" 
            placeholder="e.g. Santos"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
          <Phone className="w-3 h-3" /> Mobile Number
        </label>
        <input 
          type="tel" 
          name="phone" 
          required 
          defaultValue={initialData?.phone}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500" 
          placeholder="0912 345 6789"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
          <Facebook className="w-3 h-3" /> Facebook Profile Link
        </label>
        <input 
          type="url" 
          name="fbLink" 
          defaultValue={initialData?.fbLink}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500" 
          placeholder="https://facebook.com/your.profile"
        />
      </div>
      
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
           <MessageSquare className="w-3 h-3" /> Special Requests / Remarks
        </label>
        <textarea 
          name="others" 
          rows={2} 
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
          placeholder="(Optional)"
        ></textarea>
      </div>

    </div>
  );
}