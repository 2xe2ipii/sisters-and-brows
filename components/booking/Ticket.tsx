import { Check, Copy, Scissors, RotateCcw, Calendar, MapPin } from 'lucide-react';

export default function Ticket({ data }: { data: any }) {
  if (!data) return null;
  
  const isReschedule = data.type === 'Reschedule';
  const refCode = Math.random().toString(36).substr(2, 6).toUpperCase();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Dynamic Theme Colors
  const theme = isReschedule 
    ? { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' }
    : { bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' };

  return (
    <div className="min-h-[85vh] w-full flex flex-col items-center justify-center p-6 bg-slate-50">
      
      {/* Success Message */}
      <div className="text-center mb-8 animate-in slide-in-from-bottom-4 duration-700">
        <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-lg border-4 border-white ${theme.bg} text-white`}>
          {isReschedule ? <RotateCcw className="w-7 h-7" /> : <Check className="w-7 h-7" />}
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{isReschedule ? 'Rescheduled!' : 'You are Booked!'}</h1>
        <p className="text-slate-500 text-xs font-medium mt-1">We've sent a receipt to your email.</p>
      </div>

      {/* TICKET CONTAINER */}
      <div className="w-full max-w-[340px] bg-white rounded-2xl shadow-2xl shadow-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-500 flex flex-col">
        
        {/* COLORED TICKET HEADER */}
        <div className={`${theme.bg} p-6 pb-8 text-center relative overflow-hidden`}>
           <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 relative z-10">Admit One</p>
           <h2 className="text-4xl font-black text-white tracking-tighter relative z-10">{data.time?.split('-')[0]}</h2>
           <div className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white font-bold text-xs uppercase tracking-widest relative z-10">
              {formatDate(data.date)}
           </div>
        </div>

        {/* TICKET BODY */}
        <div className="p-8 space-y-6 bg-white relative">
           
           {/* Perforation Effect (Top) */}
           <div className="absolute top-0 left-0 w-full -mt-3 flex justify-between">
              <div className="w-6 h-6 bg-slate-50 rounded-full -ml-3"></div>
              <div className="w-6 h-6 bg-slate-50 rounded-full -mr-3"></div>
           </div>

           {/* Details */}
           <div className="space-y-4">
             <div className="flex items-start gap-4">
               <div className={`p-2 rounded-lg ${theme.light} ${theme.text}`}>
                 <UserAvatar name={`${data.firstName} ${data.lastName}`} />
               </div>
               <div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Guest</p>
                 <p className="text-sm font-bold text-slate-900">{data.firstName} {data.lastName}</p>
               </div>
             </div>

             <div className="flex items-start gap-4">
               <div className={`p-2 rounded-lg ${theme.light} ${theme.text}`}>
                 <MapPin className="w-4 h-4" />
               </div>
               <div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Location</p>
                 <p className="text-sm font-bold text-slate-900">{data.branch}</p>
               </div>
             </div>

             <div className="flex items-start gap-4">
               <div className={`p-2 rounded-lg ${theme.light} ${theme.text}`}>
                 <Scissors className="w-4 h-4" />
               </div>
               <div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Services</p>
                 <div className="flex flex-wrap gap-1">
                    {Array.isArray(data.services) ? data.services.map((s:string, i:number) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold text-slate-700">{s}</span>
                    )) : <span className="text-sm font-bold text-slate-900">{data.services}</span>}
                 </div>
               </div>
             </div>
           </div>

           {/* Dotted Line */}
           <div className="w-full border-t-2 border-dashed border-slate-100 my-6 relative">
              <div className="absolute top-[-9px] left-[-32px] w-5 h-5 bg-slate-50 rounded-full shadow-inner"></div>
              <div className="absolute top-[-9px] right-[-32px] w-5 h-5 bg-slate-50 rounded-full shadow-inner"></div>
           </div>

           {/* Footer Stub */}
           <div className="flex justify-between items-center pt-1">
             <div>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reference ID</p>
               <p className="font-mono text-xl font-bold text-slate-900 tracking-widest">{refCode}</p>
             </div>
             <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
               <Copy className="w-5 h-5" />
             </button>
           </div>
        </div>
      </div>

      <button 
        onClick={() => window.location.reload()}
        className="mt-8 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors"
      >
        Book Another Appointment
      </button>

    </div>
  );
}

// Simple Initials Avatar
const UserAvatar = ({ name }: { name: string }) => {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  return <span className="text-xs font-black">{initials}</span>;
}