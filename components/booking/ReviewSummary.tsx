import { 
  Calendar, Clock, MapPin, User, Phone, 
  FileText, Check, AlertCircle, Edit2, Layers, Bookmark 
} from 'lucide-react';

interface ReviewSummaryProps {
  data: any;
  onEdit: () => void;
  isPending: boolean;
  success: boolean;
  message?: string;
}

export default function ReviewSummary({ data, onEdit, isPending, success, message }: ReviewSummaryProps) {
  if (!data) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0f172a] p-6 text-white flex justify-between items-start">
          <div>
            <h3 className="text-lg font-serif tracking-wide text-white/90">Review Details</h3>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Please check before confirming</p>
          </div>
          <button 
            onClick={onEdit}
            type="button" 
            className="flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors font-sans"
          >
            <Edit2 className="w-3 h-3" /> Edit
          </button>
        </div>

        {/* BOOKING TYPE BANNER - Added Visibility */}
        <div className="bg-rose-50 border-b border-rose-100 p-3 flex items-center justify-center gap-2 text-rose-700">
           <Bookmark className="w-4 h-4" />
           <span className="text-xs font-bold font-sans uppercase tracking-widest">{data.type}</span>
        </div>

        <div className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-100">
             <div className="p-6 border-b md:border-b-0 md:border-r border-slate-100 space-y-4">
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                      <Calendar className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-slate-400 uppercase font-sans">Date</p>
                      <p className="text-slate-900 font-bold text-lg font-serif">{formatDate(data.date)}</p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                      <Clock className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-slate-400 uppercase font-sans">Time Slot</p>
                      <p className="text-slate-900 font-bold text-lg font-sans">{data.time}</p>
                   </div>
                </div>
             </div>
             
             <div className="p-6 flex flex-col justify-center space-y-4">
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                      <MapPin className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-slate-400 uppercase font-sans">Branch Location</p>
                      <p className="text-slate-900 font-medium leading-tight font-sans">{data.branch}</p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                      <Layers className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-slate-400 uppercase font-sans">Session Type</p>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white font-sans">
                        {data.session} SESSION
                      </span>
                   </div>
                </div>
             </div>
          </div>

          <div className="p-6 bg-slate-50/50 space-y-5">
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-1 font-sans">
                  <FileText className="w-3 h-3" /> Selected Services
                </p>
                <div className="flex flex-wrap gap-2">
                   {data.services && data.services.length > 0 ? (
                      data.services.map((s: string) => (
                        <span key={s} className="px-3 py-1.5 bg-white border border-slate-200 shadow-sm text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 font-sans">
                           <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> {s}
                        </span>
                      ))
                   ) : (
                      <span className="text-slate-400 italic text-xs font-sans">No specific services selected</span>
                   )}
                </div>
             </div>

             {data.others && (
               <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-amber-600 uppercase mb-1 font-sans">Notes / Remarks</p>
                  <p className="text-xs text-amber-900 italic font-sans">"{data.others}"</p>
               </div>
             )}
          </div>

          <div className="p-6 border-t border-slate-100 flex flex-col md:flex-row gap-6 md:items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                   <User className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-900 font-sans">{data.firstName} {data.lastName}</p>
                   <p className="text-xs text-slate-500 font-sans">Primary Guest</p>
                </div>
             </div>
             
             <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                <Phone className="w-4 h-4 text-slate-400" />
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase font-sans">Contact</p>
                   <p className="text-sm font-bold text-slate-700 font-mono tracking-tight">{data.phone}</p>
                </div>
             </div>
          </div>

        </div>
      </div>

      {!success && message && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold font-sans">{message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-rose-600 text-white font-bold text-lg py-4 rounded-2xl shadow-xl hover:bg-rose-700 hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-sans"
      >
        {isPending ? 'Processing...' : (
          <>
            Confirm Booking <Check className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}