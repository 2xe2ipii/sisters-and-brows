'use client'

import { MapPin, Calendar, CreditCard, Receipt, Edit2, CheckCircle2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

interface ReviewSummaryProps {
  data: any;
  onEdit: () => void;
}

export default function ReviewSummary({ data, onEdit }: ReviewSummaryProps) {
  const { pending } = useFormStatus();
  const servicesList = Array.isArray(data.services) ? data.services : [data.services];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 pb-28">
      
      {/* Header */}
      <div className="px-2 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Final Step</h1>
          <p className="text-slate-500 text-sm font-medium">Please confirm your appointment.</p>
        </div>
        <button 
          type="button" 
          onClick={onEdit} 
          disabled={pending}
          className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          <Edit2 className="w-3 h-3" /> Edit
        </button>
      </div>

      {/* Main Receipt Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
        {/* Decorative Top */}
        <div className="h-2 w-full bg-[#0f172a]" />
        
        <div className="p-8 space-y-6">
          
          {/* Date & Time */}
          <div className="flex items-center gap-4 pb-6 border-b border-dashed border-slate-200">
             <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
               <Calendar className="w-6 h-6" />
             </div>
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</p>
               <h3 className="text-lg font-extrabold text-slate-900">
                 {data.date}
               </h3>
               <p className="text-sm font-bold text-rose-500">{data.time ? data.time.split('-')[0] : ''}</p>
             </div>
          </div>

          {/* Branch */}
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
               <MapPin className="w-5 h-5" />
             </div>
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</p>
               <p className="text-sm font-bold text-slate-900">{data.branch}</p>
             </div>
          </div>

          {/* Services List */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
               <Receipt className="w-3 h-3" /> Services Selected
             </p>
             <div className="flex flex-wrap gap-2">
               {servicesList.length > 0 ? servicesList.map((s: string, i: number) => (
                 <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 shadow-sm text-slate-700 text-xs font-bold rounded-lg">
                   {s}
                 </span>
               )) : (
                 <span className="text-xs text-red-400 font-bold">No service selected</span>
               )}
             </div>
          </div>

          {/* Payment & Guest */}
          <div className="grid grid-cols-2 gap-4">
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payment</p>
               <div className="flex items-center gap-2">
                 <CreditCard className="w-4 h-4 text-slate-900" />
                 <span className="text-sm font-bold text-slate-900 capitalize">{data.mop}</span>
               </div>
             </div>
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Extras</p>
               <span className={`text-xs font-bold px-2 py-1 rounded ${data.ack === 'ACK' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                 {data.ack === 'ACK' ? 'Care Kit Included' : 'No Care Kit'}
               </span>
             </div>
          </div>

        </div>
        
        {/* Guest Name Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
           <p className="text-xs font-bold text-slate-500">Booking for <span className="text-slate-900">{data.firstName} {data.lastName}</span></p>
        </div>
      </div>

      {/* Sticky Bottom Button Container (Fixed to Viewport Bottom, but constrained Width) */}
      <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center pointer-events-none">
        <div className="w-full max-w-md bg-white border-t border-slate-100 p-4 pointer-events-auto shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <button 
            type="submit" 
            disabled={pending}
            className="w-full py-4 rounded-2xl font-bold text-white bg-[#0f172a] shadow-lg shadow-slate-200 disabled:bg-slate-300 disabled:cursor-not-allowed flex justify-center items-center gap-2 active:scale-95 transition-all"
          >
            {pending ? (
              <>Confirming...</>
            ) : (
              <>Confirm Booking <CheckCircle2 className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}