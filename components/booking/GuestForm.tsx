'use client'

import { useState, useEffect } from 'react';
import { User, Phone, Facebook, Users } from 'lucide-react';

interface GuestFormProps {
  initialData?: any; 
}

export default function GuestForm({ initialData }: GuestFormProps) {
  const [phone, setPhone] = useState(initialData?.phone || "");

  // Update phone state if initialData changes
  useEffect(() => {
    if (initialData?.phone) setPhone(initialData.phone);
  }, [initialData]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); 
    if (val.length <= 11) setPhone(val);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      
      {/* Main Booker Name */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            name="firstName" 
            placeholder="First Name" 
            defaultValue={initialData?.firstName}
            required 
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#e6c200] focus:border-transparent outline-none transition-all text-sm font-bold text-slate-800 placeholder:text-slate-400"
          />
        </div>
        <div className="relative">
          <input 
            type="text" 
            name="lastName" 
            placeholder="Last Name" 
            defaultValue={initialData?.lastName}
            required 
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#e6c200] focus:border-transparent outline-none transition-all text-sm font-bold text-slate-800 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Mobile Number */}
      <div className="relative"> 
        <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
        <input 
          type="tel" 
          name="phone" 
          placeholder="09xx..." 
          value={phone}
          onChange={handlePhoneChange}
          required 
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#e6c200] focus:border-transparent outline-none transition-all text-sm font-bold text-slate-800 placeholder:text-slate-400 tracking-widest"
        />
      </div>

      {/* Facebook */}
      <div className="relative">
        <Facebook className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          name="fbLink" 
          placeholder="Facebook Name or Link (Required)" 
          defaultValue={initialData?.fbLink}
          required 
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#e6c200] focus:border-transparent outline-none transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400"
        />
      </div>

      {/* NEW: Simple Text Area for Companions */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
          <Users className="w-4 h-4 text-[#e6c200]" />
          Bringing friends? (Optional)
        </label>
        
        <textarea 
          name="others" 
          rows={3}
          placeholder="If yes, please type their full names here, separated by commas (e.g. Maria Clara, Jose Rizal, Juan Luna)..."
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#e6c200] focus:border-transparent outline-none transition-all resize-none leading-relaxed" 
        />
        <p className="text-[10px] text-slate-400 text-right">
            Just separate names with a comma. We'll handle the rest.
        </p>
      </div>

    </div>
  );
}