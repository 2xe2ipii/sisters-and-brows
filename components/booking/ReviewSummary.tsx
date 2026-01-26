'use client'

import { 
  MapPin, Calendar, Clock, User, Scissors, CreditCard
} from 'lucide-react';
import { useFormStatus } from 'react-dom';

// Define the shape of the props
interface ReviewSummaryProps {
  data: any;
  onBack: () => void; // <--- This was missing
}

export default function ReviewSummary({ data, onBack }: ReviewSummaryProps) {
  const { pending } = useFormStatus();

  // Ensure services is always an array for rendering
  const servicesList = Array.isArray(data.services) ? data.services : [data.services];

  return (
    <div className="space-y-4 pb-24 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-slate-900">Review Booking</h1>
        <p className="text-slate-500 text-sm">Please ensure all details are correct.</p>
      </div>

      <div className="mx-4 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
        
        {/* Branch & Date */}
        <div className="p-6 grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <MapPin className="w-3 h-3" /> Branch
            </div>
            <p className="font-bold text-slate-900 text-sm">{data.branch}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Calendar className="w-3 h-3" /> Date
            </div>
            <p className="font-bold text-slate-900 text-sm">{data.date}</p>
          </div>
        </div>

        {/* Time & Session */}
        <div className="px-6 py-4 flex items-center gap-4 bg-slate-50/50">
           <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
             <Clock className="w-5 h-5" />
           </div>
           <div>
             <p className="text-xs font-bold text-slate-400 uppercase">Time Slot</p>
             <p className="text-slate-900 font-bold">{data.time ? data.time.split('-')[0] : ''}</p>
           </div>
           <div className="ml-auto text-right">
             <span className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 uppercase">
               {data.session}
             </span>
           </div>
        </div>

        {/* Services */}
        <div className="px-6 py-4 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
            <Scissors className="w-3 h-3" /> Services
          </p>
          <div className="flex flex-wrap gap-2">
            {servicesList.length > 0 ? servicesList.map((s: string, i: number) => (
              <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                {s}
              </span>
            )) : (
              <span className="text-xs text-red-400 font-bold">No service selected</span>
            )}
          </div>
        </div>

        {/* Payment & Extras */}
        <div className="px-6 py-4 flex items-start gap-4">
           <div className="mt-0.5 text-slate-400"><CreditCard className="w-5 h-5" /></div>
           <div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment & Extras</p>
             <div className="flex items-center gap-3 mt-1 text-slate-900 font-semibold text-sm">
               <span className="capitalize">{data.mop}</span>
               <span className="text-slate-300">|</span>
               <span className={data.ack === 'ACK' ? 'text-rose-500' : 'text-slate-500'}>
                  {data.ack === 'ACK' ? 'With After Care Kit' : 'No Kit'}
               </span>
             </div>
           </div>
        </div>

        {/* Guest */}
        <div className="px-6 py-4 bg-slate-50/50 flex items-start gap-4">
          <div className="mt-1"><User className="w-4 h-4 text-slate-400" /></div>
          <div className="space-y-1">
             <p className="text-sm font-bold text-slate-900">{data.firstName} {data.lastName}</p>
             <p className="text-xs text-slate-500 font-mono">{data.phone}</p>
             {data.others && (
               <p className="text-xs text-slate-500 italic mt-2">"{data.others}"</p>
             )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 p-4 flex gap-3 z-50">
        <button 
          type="button" 
          onClick={onBack} 
          disabled={pending}
          className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 bg-slate-100 disabled:opacity-50"
        >
          Back
        </button>
        <button 
          type="submit" 
          disabled={pending}
          className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-rose-500 shadow-lg shadow-rose-200 disabled:bg-rose-300 flex justify-center items-center gap-2"
        >
          {pending ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}