import { 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Scissors, 
  FileText, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ReviewSummaryProps {
  data: any;
  onEdit: () => void;
  isPending: boolean;
  success?: boolean;
  message?: string;
}

export default function ReviewSummary({ data, isPending, success, message }: ReviewSummaryProps) {
  
  const servicesList = Array.isArray(data.services) 
    ? data.services 
    : (data.services ? [data.services] : []);

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {message && !success && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{message}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* HEADER - Clean, no buttons */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">Booking Summary</h2>
        </div>

        <div className="divide-y divide-slate-100">
          
          <div className="px-6 py-4 flex items-start gap-4">
            <div className="mt-0.5 text-slate-400"><Calendar className="w-5 h-5" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</p>
              <div className="flex items-center gap-3 mt-1 text-slate-900 font-semibold">
                <span>{data.date}</span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1.5">
                   <Clock className="w-4 h-4 text-rose-500" />
                   {data.time ? data.time.split('-')[0] : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 flex items-start gap-4">
             <div className="mt-0.5 text-slate-400"><MapPin className="w-5 h-5" /></div>
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Branch</p>
               <p className="text-slate-900 font-semibold mt-1">{data.branch}</p>
             </div>
          </div>

          <div className="px-6 py-4 flex items-start gap-4">
             <div className="mt-0.5 text-slate-400"><Scissors className="w-5 h-5" /></div>
             <div className="w-full">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Services</p>
               <div className="mt-1 flex flex-wrap gap-2">
                 {servicesList.map((s: string) => (
                   <span key={s} className="text-slate-900 font-semibold border-b-2 border-rose-100 pb-0.5">
                     {s}
                   </span>
                 ))}
               </div>
               {data.session && (
                 <p className="text-xs font-medium text-rose-500 mt-1 uppercase tracking-wide">
                   Session: {data.session}
                 </p>
               )}
             </div>
          </div>

          <div className="px-6 py-4 flex items-start gap-4">
             <div className="mt-0.5 text-slate-400"><User className="w-5 h-5" /></div>
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Guest Info</p>
               <p className="text-slate-900 font-semibold mt-1">{data.firstName} {data.lastName}</p>
               <p className="text-slate-500 text-sm font-mono">{data.phone}</p>
             </div>
          </div>

          {data.others && (
            <div className="px-6 py-4 flex items-start gap-4">
               <div className="mt-0.5 text-slate-400"><FileText className="w-5 h-5" /></div>
               <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remarks</p>
                 <p className="text-slate-600 text-sm mt-1 italic">{data.others}</p>
               </div>
            </div>
          )}

        </div>

        <div className="p-6 bg-slate-50">
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[#0f172a] text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-slate-900 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                Confirm Booking <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}