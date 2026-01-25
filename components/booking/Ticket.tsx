import { CheckCircle2, MapPin, Calendar, Clock } from 'lucide-react';

interface TicketProps {
  data: any;
}

export default function Ticket({ data }: TicketProps) {
  if (!data) return null;

  const servicesList = Array.isArray(data.services) 
    ? data.services 
    : (data.services ? [data.services] : []);

  const refCode = Math.random().toString(36).substr(2, 8).toUpperCase();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-50">
      
      <div className="w-full max-w-sm animate-in zoom-in duration-500">
        
        <div className="text-center mb-6 space-y-2">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
             <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Booking Success!</h1>
          <p className="text-slate-500 text-sm">Your appointment has been confirmed.</p>
        </div>

        <div className="bg-white w-full rounded-2xl shadow-xl shadow-slate-200 overflow-hidden relative border border-slate-100">
          
          <div className="bg-rose-500 p-6 text-center text-white relative overflow-hidden">
             <div className="relative z-10">
               <h2 className="font-bold text-lg tracking-wide uppercase">Appointment Ticket</h2>
               <p className="text-rose-100 text-xs mt-1 opacity-90">Sisters & Brows</p>
             </div>
             <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none" />
             <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none" />
          </div>

          <div className="relative h-4 bg-white">
            <div className="absolute -left-2 top-[-8px] w-4 h-4 bg-slate-50 rounded-full z-10"></div>
            <div className="absolute -right-2 top-[-8px] w-4 h-4 bg-slate-50 rounded-full z-10"></div>
            <div className="absolute left-4 right-4 top-0 border-t-2 border-dashed border-slate-200"></div>
          </div>

          <div className="px-6 pb-6 space-y-6">
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                <p className="text-slate-900 font-bold text-sm flex justify-center items-center gap-1">
                   <Calendar className="w-3 h-3 text-rose-500" /> {data.date}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time</p>
                <p className="text-slate-900 font-bold text-sm flex justify-center items-center gap-1">
                   <Clock className="w-3 h-3 text-rose-500" /> {data.time ? data.time.split('-')[0] : ""}
                </p>
              </div>
            </div>

            <div className="text-center">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Branch Location</p>
               <p className="text-slate-900 font-bold text-sm flex items-center justify-center gap-1.5">
                 <MapPin className="w-3.5 h-3.5 text-rose-500" />
                 {data.branch}
               </p>
            </div>

            <div className="border-t border-slate-100 my-4"></div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Guest Name</span>
                <span className="font-bold text-slate-900">{data.firstName} {data.lastName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Type</span>
                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-xs uppercase tracking-wide">
                  {data.type === "New Appointment" ? "New Appointment" : (data.type || "Appointment")}
                </span>
              </div>
              
              <div className="pt-2">
                <span className="text-slate-500 block mb-2">Services Availed:</span>
                <ul className="space-y-1.5 pl-1">
                  {servicesList.length > 0 ? (
                    servicesList.map((s: string) => (
                      <li key={s} className="font-semibold text-slate-700 flex items-start gap-2 text-xs">
                         <div className="mt-1.5 w-1 h-1 rounded-full bg-rose-400 shrink-0" /> {s}
                      </li>
                    ))
                  ) : <li className="text-slate-400 italic text-xs">None specified</li>}
                </ul>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t-2 border-dashed border-slate-100 text-center">
               <p className="text-[10px] text-slate-400 font-mono mb-2">REF: {refCode}</p>
               <div className="h-10 bg-slate-100 rounded flex items-center justify-center gap-1 opacity-40">
                  {[...Array(24)].map((_, i) => (
                    <div key={i} className={`h-6 w-${Math.random() > 0.5 ? '0.5' : '1'} bg-slate-800`}></div>
                  ))}
               </div>
               <p className="text-[10px] text-rose-500 font-bold mt-4 uppercase tracking-wide">
                 Please screenshot this ticket
               </p>
            </div>

          </div>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="mt-8 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors w-full text-center"
        >
          Book Another Appointment
        </button>

      </div>
    </div>
  );
}