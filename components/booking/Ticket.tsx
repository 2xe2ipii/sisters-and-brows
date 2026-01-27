import { Check, Copy, Scissors, RotateCcw, Calendar, MapPin, User } from 'lucide-react';

interface TicketProps {
  data: any;
  refCode: string;
}

export default function Ticket({ data, refCode }: TicketProps) {
  if (!data) return null;
  
  const isReschedule = data.type === 'Reschedule';
  
  // Format Date Nicely
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const servicesList = data.SERVICES 
     ? data.SERVICES.split(',') 
     : (Array.isArray(data.services) ? data.services : [data.services]);

  // Theme Config
  const theme = isReschedule 
    ? { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-100', pill: 'bg-amber-100 text-amber-700' }
    : { bg: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-100', pill: 'bg-rose-100 text-rose-700' };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-100">
      
      {/* TICKET CARD */}
      <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* HEADER */}
        <div className={`${theme.bg} p-6 flex flex-col items-center text-center text-white relative`}>
            {/* Status Icon */}
            <div className="mb-3 p-3 bg-white/20 backdrop-blur-md rounded-full shadow-sm">
                {isReschedule ? <RotateCcw className="w-8 h-8 text-white" /> : <Check className="w-8 h-8 text-white" />}
            </div>
            <h1 className="text-3xl font-black tracking-tight uppercase">
                {isReschedule ? 'Rescheduled' : 'Confirmed'}
            </h1>
            <p className="opacity-90 font-medium text-sm mt-1">Sisters & Brows Booking</p>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
            
            {/* TIME & DATE (Hero Info) */}
            <div className="text-center border-b-2 border-dashed border-slate-100 pb-6">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">
                    {String(data.TIME || data.time).split('-')[0].trim()}
                </h2>
                <div className="flex items-center justify-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-sm">
                    <Calendar className="w-4 h-4" />
                    {formatDate(data.DATE || data.date)}
                </div>
            </div>

            {/* SESSION & TYPE PILLS */}
            <div className="flex justify-center gap-3">
                 <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${theme.pill}`}>
                    {data.SESSION || data.session} Session
                 </span>
                 <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest">
                    {data.BRANCH || data.branch}
                 </span>
            </div>

            {/* DETAILS */}
            <div className="space-y-4 pt-2">
                 <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <User className={`w-5 h-5 mt-0.5 ${theme.text}`} />
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guest</p>
                        <p className="text-lg font-bold text-slate-900">{data["FULL NAME"] || data.firstName + ' ' + data.lastName}</p>
                    </div>
                 </div>

                 <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Scissors className={`w-5 h-5 mt-0.5 ${theme.text}`} />
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Services</p>
                        <div className="flex flex-wrap gap-1">
                            {servicesList.map((s: string, i: number) => (
                                <span key={i} className="text-sm font-bold text-slate-800 leading-tight">
                                    {s}{i < servicesList.length - 1 ? ',' : ''}
                                </span>
                            ))}
                        </div>
                    </div>
                 </div>
            </div>
        </div>

        {/* FOOTER (Ref Code) */}
        <div className="bg-slate-900 p-4 flex items-center justify-between">
            <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Reference ID</p>
                <p className="text-white font-mono font-bold text-lg tracking-widest">{refCode}</p>
            </div>
            <button className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors">
                <Copy className="w-5 h-5 text-white" />
            </button>
        </div>
      </div>
      
      <button 
        onClick={() => window.location.reload()}
        className="mt-8 px-6 py-3 rounded-full bg-white shadow-sm border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
      >
        Book Another
      </button>

    </div>
  );
}