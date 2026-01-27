import { useState } from 'react';
import { User, Phone, CreditCard, Facebook, Package } from 'lucide-react';

interface GuestFormProps {
  initialData?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    fbLink?: string;
  } | null;
}

export default function GuestForm({ initialData }: GuestFormProps) {
  const [ack, setAck] = useState("NO ACK");

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      
      {/* ROW 1: Names */}
      <div className="flex gap-4">
        <div className="flex-1 space-y-1">
           <label className="text-[10px] font-bold text-slate-500 uppercase">First Name</label>
           <input 
             name="firstName" 
             type="text"
             required 
             defaultValue={initialData?.firstName || ""}
             className="w-full px-3 py-3 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#e6c200] focus:border-transparent outline-none transition-all" 
           />
        </div>
        <div className="flex-1 space-y-1">
           <label className="text-[10px] font-bold text-slate-500 uppercase">Last Name</label>
           <input 
             name="lastName" 
             type="text"
             required 
             defaultValue={initialData?.lastName || ""}
             className="w-full px-3 py-3 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#e6c200] focus:border-transparent outline-none transition-all" 
           />
        </div>
      </div>

      {/* ROW 2: Mobile */}
      <div className="space-y-1">
         <label className="text-[10px] font-bold text-slate-500 uppercase">Mobile Number (11 Digits)</label>
         <div className="relative">
            <input 
              name="phone" 
              type="tel" 
              pattern="09[0-9]{9}"
              maxLength={11}
              required 
              defaultValue={initialData?.phone || ""}
              className="w-full px-3 py-3 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#e6c200] focus:border-transparent outline-none transition-all tracking-widest" 
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                target.value = target.value.replace(/[^0-9]/g, '').slice(0, 11);
              }}
            />
         </div>
      </div>

      {/* ROW 3: Facebook */}
      <div className="space-y-1">
         <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
            <span>Facebook Profile</span>
            <span className="text-slate-300 font-normal normal-case">Optional</span>
         </label>
         <input 
           name="fbLink" 
           type="url" 
           defaultValue={initialData?.fbLink || ""}
           className="w-full px-3 py-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#e6c200] focus:border-transparent outline-none transition-all" 
         />
      </div>

      {/* ROW 4: Payment */}
      <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Payment Method</label>
          <div className="relative">
             <select 
               name="mop" 
               className="w-full px-3 py-3 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#e6c200] focus:border-transparent outline-none appearance-none cursor-pointer"
             >
               <option value="Cash">Cash</option>
               <option value="G-Cash">GCash</option>
               <option value="Maya">Maya</option>
               <option value="Bank">Bank Transfer</option>
               <option value="Other">Other</option>
             </select>
          </div>
      </div>

      {/* ROW 5: After Care Kit (Vertical) */}
      <div className="space-y-2 pt-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase block text-center">Avail After Care Kit?</label>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setAck("ACK")}
              className={`w-full py-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${ack === "ACK" ? "bg-[#e6c200] text-[#202124] border-[#e6c200] shadow-sm" : "bg-white text-slate-500 border-slate-200"}`}
            >
              <Package className="w-4 h-4"/> Yes, I need one
            </button>
            <button
              type="button"
              onClick={() => setAck("NO ACK")}
              className={`w-full py-3 rounded-xl text-sm font-bold border transition-all ${ack === "NO ACK" ? "bg-[#202124] text-white border-[#202124]" : "bg-white text-slate-500 border-slate-200"}`}
            >
              No, I have my own
            </button>
            <input type="hidden" name="ack" value={ack} />
          </div>
      </div>

    </div>
  );
}