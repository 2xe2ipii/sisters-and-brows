'use client'

import { useState, useEffect } from 'react';
import { User, Phone, Facebook, Plus, Trash2 } from 'lucide-react';

interface GuestFormProps {
  initialData?: any; // Contains { firstName, lastName, phone, fbLink, others: string[] }
}

export default function GuestForm({ initialData }: GuestFormProps) {
  const [others, setOthers] = useState<string[]>([]);
  const [newPerson, setNewPerson] = useState("");
  const [phone, setPhone] = useState(initialData?.phone || "");

  // PREFILL: Load others when initialData changes
  useEffect(() => {
    if (initialData?.others && Array.isArray(initialData.others)) {
       setOthers(initialData.others);
    }
    if (initialData?.phone) {
        setPhone(initialData.phone);
    }
  }, [initialData]);

  const addPerson = () => {
    if (newPerson.trim()) {
      setOthers([...others, newPerson.trim()]);
      setNewPerson("");
    }
  };

  const removePerson = (index: number) => {
    setOthers(others.filter((_, i) => i !== index));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (val.length <= 11) {
      setPhone(val);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      
      {/* Main Booker */}
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

      <div className="relative max-w-[200px]"> 
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

      {/* Other Persons Section */}
      <div className="pt-2 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
          Bringing friends? (Optional)
        </label>
        
        {/* List of added friends */}
        <div className="space-y-2 mb-3">
          {others.map((person, idx) => (
            <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-sm font-bold text-slate-700">{person}</span>
              <button type="button" onClick={() => removePerson(idx)} className="text-red-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add new friend input */}
        <div className="flex gap-2">
           <input 
             type="text" 
             value={newPerson}
             onChange={(e) => setNewPerson(e.target.value)}
             placeholder="Full Name of Friend"
             className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#e6c200]"
           />
           <button 
             type="button" 
             onClick={addPerson}
             className="bg-[#202124] text-[#e6c200] p-3 rounded-xl hover:bg-black transition-colors"
           >
             <Plus className="w-5 h-5" />
           </button>
        </div>
        
        {/* Hidden Input to Pass Array to Action */}
        <input type="hidden" name="others" value={JSON.stringify(others)} />
      </div>

    </div>
  );
}