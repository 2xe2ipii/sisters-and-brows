'use client'

import { useState, useEffect } from 'react';
import { User, Phone, Facebook, Users, Plus, X, AlertCircle } from 'lucide-react';

interface GuestFormProps {
  initialData?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    fbLink?: string;
    others?: string[] | string; 
  } | null;
  maxCapacity?: number; // v5: Passed from parent
}

export default function GuestForm({ initialData, maxCapacity = 4 }: GuestFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [fbLink, setFbLink] = useState("");
  
  // v5: Array of names instead of one big string
  const [guests, setGuests] = useState<string[]>([]);

  // Calculate available friend slots (Branch Limit - Main Booker (1))
  const maxFriends = Math.max(0, maxCapacity - 1);

  // Sync state when initialData arrives
  useEffect(() => {
    if (initialData) {
        setFirstName(initialData.firstName || "");
        setLastName(initialData.lastName || "");
        setPhone(initialData.phone || "");
        setFbLink(initialData.fbLink || "");

        let companions: string[] = [];
        if (Array.isArray(initialData.others)) {
            companions = initialData.others;
        } else if (typeof initialData.others === 'string') {
            try {
                const parsed = JSON.parse(initialData.others);
                if (Array.isArray(parsed)) companions = parsed;
            } catch {
                companions = [initialData.others];
            }
        }
        setGuests(companions.filter(c => c && c.trim() !== ""));
    }
  }, [initialData]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); 
    if (val.length <= 11) setPhone(val);
  };

  const addGuest = () => {
    if (guests.length < maxFriends) {
      setGuests([...guests, ""]);
    }
  };

  const removeGuest = (index: number) => {
    const newGuests = [...guests];
    newGuests.splice(index, 1);
    setGuests(newGuests);
  };

  const updateGuestName = (index: number, value: string) => {
    const newGuests = [...guests];
    newGuests[index] = value;
    setGuests(newGuests);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            name="firstName" 
            placeholder="First Name" 
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required 
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#e6c200] focus:border-transparent outline-none transition-all text-sm font-bold text-slate-800 placeholder:text-slate-400"
          />
        </div>
        <div className="relative">
          <input 
            type="text" 
            name="lastName" 
            placeholder="Last Name" 
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
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
          value={fbLink}
          onChange={(e) => setFbLink(e.target.value)}
          required 
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#e6c200] focus:border-transparent outline-none transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400"
        />
      </div>

      {/* Companions Section (v5) */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
            <Users className="w-4 h-4 text-[#e6c200]" />
            Bring Friends?
            </label>
            {/* <span className="text-[10px] text-slate-400 font-medium">
                {guests.length} / {maxFriends} slots used
            </span> */}
        </div>
        
        <div className="space-y-3">
            {guests.map((guest, index) => (
                <div key={index} className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
                    <div className="relative w-full">
                        <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                        <input 
                            type="text"
                            name="guestName" // Used by getAll('guestName') in actions.ts
                            value={guest}
                            onChange={(e) => updateGuestName(index, e.target.value)}
                            placeholder={`Friend ${index + 1} Full Name`}
                            required
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#e6c200] focus:border-transparent outline-none"
                        />
                    </div>
                    <button 
                        type="button" 
                        onClick={() => removeGuest(index)}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>

        {guests.length < maxFriends ? (
            <button 
                type="button"
                onClick={addGuest}
                className="flex items-center gap-2 text-xs font-bold text-[#e6c200] hover:text-[#d4b200] transition-colors py-2"
            >
                <Plus className="w-4 h-4" />
                Add a Friend
            </button>
        ) : (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                <AlertCircle className="w-3 h-3" />
                Max capacity for this branch reached ({maxCapacity} pax).
            </div>
        )}
      </div>

    </div>
  );
}