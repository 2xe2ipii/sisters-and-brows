'use client'

import { MapPin, Calendar, CreditCard, Receipt, Edit3, User, ChevronRight } from 'lucide-react';
import { useFormStatus } from 'react-dom';

interface ReviewSummaryProps {
  data: any;
  onEdit: () => void;
}

export default function ReviewSummary({ data, onEdit }: ReviewSummaryProps) {
  const { pending } = useFormStatus();
  const servicesList = Array.isArray(data.services) ? data.services : [data.services];

  // Date Formatter: "2026-01-29" -> "January 29, 2026"
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-500 pb-32">
      
      {/* Page Title */}
      <div className="px-2 mb-8">
        <h1 className="text-3xl font-serif text-slate-900 tracking-tight">Review Details</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Please confirm your appointment information below.</p>
      </div>

      {/* Main Review Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden relative">
        
        {/* Bold Top Bar */}
        <div className="h-6 w-full bg-slate-900" />
        
        <div className="p-0">
          
          {/* Section 1: Schedule (Date & Time) */}
          <div className="p-6 border-b border-slate-100 hover:bg-slate-50 transition-colors group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-rose-50 rounded-lg text-rose-500">
                   <Calendar className="w-5 h-5" />
                 </div>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Schedule</span>
              </div>
              <button onClick={onEdit} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2">
                Modify <Edit3 className="w-3 h-3" />
              </button>
            </div>
            <div className="pl-[52px]">
              <h3 className="text-xl font-bold text-slate-900 leading-tight">{formatDate(data.date)}</h3>
              <p className="text-lg font-medium text-slate-900 mt-1">{data.time ? data.time.split('-')[0] : ''}</p>
            </div>
          </div>

          {/* Section 2: Location */}
          <div className="p-6 border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2 mb-3">
               <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                 <MapPin className="w-5 h-5" />
               </div>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</span>
            </div>
            <div className="pl-[52px]">
              <p className="text-base font-bold text-slate-900">{data.branch}</p>
            </div>
          </div>

          {/* Section 3: Services */}
          <div className="p-6 border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2 mb-3">
               <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                 <Receipt className="w-5 h-5" />
               </div>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Services</span>
            </div>
            <div className="pl-[52px] flex flex-wrap gap-2">
              {servicesList.map((s: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-md shadow-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Section 4: Personal Info */}
          <div className="p-6 bg-slate-50/50">
             <div className="grid grid-cols-2 gap-6 pl-[52px]">
               <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Guest Name</p>
                 <p className="text-sm font-bold text-slate-900 truncate">{data.firstName} {data.lastName}</p>
               </div>
               <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Method</p>
                 <div className="flex items-center gap-2">
                   <CreditCard className="w-4 h-4 text-slate-600" />
                   <span className="text-sm font-bold text-slate-900 capitalize">{data.mop}</span>
                 </div>
               </div>
             </div>
          </div>

        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-6 pointer-events-none">
        <div className="w-full max-w-md pointer-events-auto">
          <button 
            type="submit" 
            disabled={pending}
            className="w-full py-4 rounded-xl font-bold text-white bg-slate-900 shadow-xl shadow-slate-400/20 hover:bg-slate-800 active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex justify-between items-center px-6"
          >
            <span className="text-base">{pending ? 'Confirming Booking...' : 'Confirm Booking'}</span>
            {!pending && <ChevronRight className="w-5 h-5 opacity-80" />}
          </button>
        </div>
      </div>
    </div>
  );
}