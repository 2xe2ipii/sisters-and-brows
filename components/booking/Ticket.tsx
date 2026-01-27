import { Check, MapPin, Calendar, RotateCcw, Copy, User } from 'lucide-react';

export default function Ticket({ data }: { data: any }) {
  if (!data) return null;
  
  const isReschedule = data.type === 'Reschedule';
  const refCode = Math.random().toString(36).substr(2, 6).toUpperCase();

  // Date Formatter: "2026-01-29" -> "Jan 29, 2026"
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-[85vh] w-full flex flex-col items-center justify-center p-6">
      
      {/* Success Header */}
      <div className="text-center mb-10 animate-in slide-in-from-bottom-8 duration-700 delay-100">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-xl ring-8 ring-white ${isReschedule ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
          {isReschedule ? <RotateCcw className="w-8 h-8" /> : <Check className="w-8 h-8" />}
        </div>
        <h1 className="text-3xl font-serif text-slate-900 tracking-tight">{isReschedule ? 'Rescheduled' : 'Confirmed'}</h1>
        <p className="text-slate-500 font-medium mt-2">Your booking has been saved.</p>
      </div>

      {/* Ticket Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden relative animate-in zoom-in-95 duration-500 border border-slate-100">
        
        {/* Status Bar */}
        <div className={`h-3 w-full ${isReschedule ? 'bg-amber-500' : 'bg-slate-900'}`} />

        {/* Ticket Body */}
        <div className="p-10 space-y-8">
          
          {/* Main Time & Date */}
          <div className="text-center">
             <h2 className="text-4xl font-black text-slate-900 tracking-tight">{data.time?.split('-')[0]}</h2>
             <div className="inline-flex items-center gap-2 mt-2 px-4 py-1.5 bg-slate-50 rounded-full">
               <Calendar className="w-3.5 h-3.5 text-slate-400" />
               <p className="text-slate-600 font-bold text-sm uppercase tracking-wider">{formatDate(data.date)}</p>
             </div>
          </div>

          {/* Dashed Line */}
          <div className="w-full border-t-2 border-dashed border-slate-100"></div>

          {/* Details */}
          <div className="space-y-6">
             
             {/* Booking For */}
             <div className="flex justify-between items-end">
               <div className="flex items-center gap-2 mb-1">
                 <User className="w-4 h-4 text-slate-400" />
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guest</span>
               </div>
               <span className="text-base font-bold text-slate-900">{data.firstName} {data.lastName}</span>
             </div>

             {/* Location */}
             <div className="flex justify-between items-end">
               <div className="flex items-center gap-2 mb-1">
                 <MapPin className="w-4 h-4 text-slate-400" />
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</span>
               </div>
               <span className="text-base font-bold text-slate-900 text-right">{data.branch}</span>
             </div>

             {/* Services */}
             <div className="flex flex-col gap-2">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Services</span>
               <div className="flex flex-wrap justify-end gap-1.5">
                  {Array.isArray(data.services) ? data.services.map((s:string, i:number) => (
                    <span key={i} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-xs font-bold text-slate-700">{s}</span>
                  )) : <span className="text-sm font-bold text-slate-900">{data.services}</span>}
               </div>
             </div>
             
          </div>

          {/* Ref Code Area */}
          <div className="bg-slate-50 rounded-2xl p-5 flex justify-between items-center border border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reference Code</p>
              <p className="font-mono text-xl font-bold text-slate-900 tracking-widest">{refCode}</p>
            </div>
            <button className="p-2 bg-white rounded-xl text-slate-400 hover:text-slate-900 hover:shadow-sm transition-all border border-slate-200">
              <Copy className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Decorative Cutouts */}
        <div className="absolute top-[160px] -left-3 w-6 h-6 bg-[#fafafa] rounded-full"></div>
        <div className="absolute top-[160px] -right-3 w-6 h-6 bg-[#fafafa] rounded-full"></div>

      </div>

      {/* Action */}
      <button 
        onClick={() => window.location.reload()}
        className="mt-10 px-8 py-3 rounded-full text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all"
      >
        Book Another Appointment
      </button>

    </div>
  );
}