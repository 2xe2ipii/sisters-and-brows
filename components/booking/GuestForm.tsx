import { User, Phone, Facebook, MessageSquare, CreditCard, ShoppingBag } from 'lucide-react';
// No header here, parent handles it via SectionContainer

interface GuestFormProps {
  initialData?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    fbLink?: string;
    ack?: string;
    mop?: string;
  };
}

export default function GuestForm({ initialData }: GuestFormProps) {
  return (
    <div className="space-y-6">
      
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">First Name</label>
          <input type="text" name="firstName" required defaultValue={initialData?.firstName}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#202124]" placeholder="e.g. Maria"/>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Last Name</label>
          <input type="text" name="lastName" required defaultValue={initialData?.lastName}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#202124]" placeholder="e.g. Santos"/>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Phone className="w-3 h-3" /> Mobile Number</label>
        <input type="tel" name="phone" required defaultValue={initialData?.phone}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#202124]" placeholder="0912 345 6789"/>
      </div>

      {/* FB */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Facebook className="w-3 h-3" /> Facebook Profile</label>
        <input type="url" name="fbLink" defaultValue={initialData?.fbLink}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#202124]" placeholder="https://facebook.com/your.profile"/>
      </div>

      {/* RESTORED: Mode of Payment */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><CreditCard className="w-3 h-3" /> Mode of Payment</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {["Cash", "G-Cash", "Maya", "Bank"].map(mop => (
                <label key={mop} className="cursor-pointer">
                    <input type="radio" name="mop" value={mop} defaultChecked={initialData?.mop === mop || mop === "Cash"} className="peer hidden" />
                    <div className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-center text-slate-600 peer-checked:bg-[#202124] peer-checked:text-[#e6c200] peer-checked:border-[#202124] transition-all">
                        {mop}
                    </div>
                </label>
            ))}
        </div>
      </div>

      {/* RESTORED: After Care Kit */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> Avail After Care Kit?</label>
        <div className="flex gap-4">
             <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="ack" value="ACK" defaultChecked={initialData?.ack === "ACK"} className="w-4 h-4 text-[#202124] focus:ring-[#202124]"/>
                <span className="text-sm font-bold text-slate-700">Yes (Recommended)</span>
             </label>
             <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="ack" value="NO ACK" defaultChecked={initialData?.ack !== "ACK"} className="w-4 h-4 text-[#202124] focus:ring-[#202124]"/>
                <span className="text-sm font-bold text-slate-700">No</span>
             </label>
        </div>
      </div>

      {/* Remarks */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Special Requests</label>
        <textarea name="others" rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#202124]" placeholder="(Optional)"></textarea>
      </div>
    </div>
  );
}