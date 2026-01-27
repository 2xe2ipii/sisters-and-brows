'use client'

import { Edit3, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFormStatus } from 'react-dom';

interface ReviewSummaryProps {
  data: any;
  onEdit: () => void;
}

export default function ReviewSummary({ data, onEdit }: ReviewSummaryProps) {
  const { pending } = useFormStatus();

  // "Jan 29, 2026"
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Helper to render a row, even if empty
  const Row = ({ label, value, isList = false }: any) => (
    <div className="flex flex-col py-3 border-b border-slate-100 last:border-0">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</span>
      {isList && Array.isArray(value) ? (
        <div className="flex flex-wrap gap-1">
          {value.map((v: string, i: number) => (
            <span key={i} className="text-sm font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{v}</span>
          ))}
        </div>
      ) : (
        <span className={`text-sm font-bold ${value ? 'text-slate-900' : 'text-slate-300 italic'}`}>
          {value || 'Not provided'}
        </span>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-500 pb-32">
      
      {/* Header */}
      <div className="px-2 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Final Review</h1>
          <p className="text-slate-500 text-xs font-medium mt-1">Please verify all information below.</p>
        </div>
        <button 
          onClick={onEdit}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          Modify <Edit3 className="w-3 h-3" />
        </button>
      </div>

      {/* Main Data Manifest */}
      <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        
        {/* Booking Details Section */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
           <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-slate-900"></div> Booking Details
           </h3>
        </div>
        <div className="p-6 pt-2">
           <Row label="Date" value={formatDate(data.date)} />
           <Row label="Time Slot" value={data.time} />
           <Row label="Location" value={data.branch} />
           <Row label="Services" value={Array.isArray(data.services) ? data.services : [data.services]} isList />
           <Row label="Session Type" value={data.session || "Full Session"} />
           <Row label="Booking Type" value={data.type || "New Appointment"} />
        </div>

        {/* Guest Details Section */}
        <div className="bg-slate-50 px-6 py-3 border-y border-slate-200">
           <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-slate-900"></div> Guest Info
           </h3>
        </div>
        <div className="p-6 pt-2">
           <Row label="Full Name" value={`${data.firstName} ${data.lastName}`} />
           <Row label="Contact Number" value={data.phone} />
           <Row label="Facebook Profile" value={data.fbLink} />
           <Row label="Payment Method" value={data.mop} />
           <Row label="Care Kit" value={data.ack === 'ACK' ? 'Included' : 'Not Included'} />
           <Row label="Remarks / Notes" value={data.others} />
        </div>

      </div>

      {/* Warning / Confirmation */}
      <div className="mt-6 px-4 flex gap-3 items-start p-4 bg-amber-50 rounded-xl border border-amber-100">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Wait!</strong> Please ensure the Facebook Link provided is correct as we use it for primary communication.
        </p>
      </div>

      {/* Action Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-6 pointer-events-none flex justify-center">
        <div className="w-full max-w-md pointer-events-auto">
          <button 
            type="submit" 
            disabled={pending}
            className="w-full py-4 rounded-xl font-bold text-white bg-slate-900 shadow-2xl shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {pending ? (
              <span>Submitting...</span>
            ) : (
              <>Confirm & Book <CheckCircle2 className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}