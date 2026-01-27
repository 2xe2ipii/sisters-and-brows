import { Check, MapPin, Calendar, CreditCard, Scissors, Receipt } from 'lucide-react';

export default function Ticket({ data }: { data: any }) {
  if (!data) return null;

  // Ensure services is always an array for rendering
  const servicesList = Array.isArray(data.services) ? data.services : [data.services];

  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center p-4">
      
      {/* Main Ticket Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative">
        
        {/* Pink Top Accent */}
        <div className="h-1.5 w-full bg-rose-400" />

        {/* Success Header */}
        <div className="pt-8 pb-6 px-8 text-center bg-white">
          <div className="mx-auto w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mb-4 ring-4 ring-white shadow-sm">
             <Check className="w-7 h-7 text-rose-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Booking Confirmed!</h1>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-wide">We'll see you soon</p>
        </div>

        {/* Dotted Divider */}
        <div className="relative w-full h-4 bg-white">
           <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-slate-50 rounded-r-full" />
           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-slate-50 rounded-l-full" />
           <div className="absolute top-1/2 left-4 right-4 border-t-2 border-dashed border-slate-100" />
        </div>

        {/* Details Section */}
        <div className="p-8 space-y-5 bg-white">
          
          {/* Booking Type (NEW) */}
          <div className="flex items-start gap-4 pb-5 border-b border-dashed border-slate-100">
             <div className="p-2 bg-amber-50 rounded-lg shrink-0">
               <Receipt className="w-5 h-5 text-amber-500" />
             </div>
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking Type</p>
               <span className={`text-sm font-bold px-2 py-0.5 rounded-md ${data.type === 'Reschedule' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                 {data.type || "New Appointment"}
               </span>
             </div>
          </div>

          <div className="flex items-start gap-4">
             <div className="p-2 bg-rose-50/50 rounded-lg shrink-0">
               <Calendar className="w-5 h-5 text-rose-400" />
             </div>
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date & Time</p>
               <p className="text-sm font-bold text-slate-900">
                 {data.date} <span className="text-slate-300 mx-1">|</span> {data.time?.split('-')[0]}
               </p>
             </div>
          </div>

          <div className="flex items-start gap-4">
             <div className="p-2 bg-rose-50/50 rounded-lg shrink-0">
               <MapPin className="w-5 h-5 text-rose-400" />
             </div>
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Branch</p>
               <p className="text-sm font-bold text-slate-900">{data.branch}</p>
             </div>
          </div>

          <div className="flex items-start gap-4">
             <div className="p-2 bg-rose-50/50 rounded-lg shrink-0">
               <Scissors className="w-5 h-5 text-rose-400" />
             </div>
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Services</p>
               <div className="flex flex-col gap-0.5">
                 {servicesList.map((service: string, index: number) => (
                   <p key={index} className="text-sm font-bold text-slate-900 leading-tight">
                     {service}
                   </p>
                 ))}
               </div>
             </div>
          </div>

          <div className="flex items-start gap-4">
             <div className="p-2 bg-rose-50/50 rounded-lg shrink-0">
               <CreditCard className="w-5 h-5 text-rose-400" />
             </div>
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment & Extras</p>
               <p className="text-sm font-bold text-slate-900 capitalize">
                  {data.mop} 
                  <span className="text-slate-300 mx-1">•</span> 
                  <span className={data.ack === 'ACK' ? 'text-rose-500' : 'text-slate-400'}>
                    {data.ack === 'ACK' ? 'With Kit' : 'No Kit'}
                  </span>
               </p>
             </div>
          </div>

        </div>

        {/* Footer / Reference Code */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Reference Code</p>
          <p className="font-mono text-lg font-bold text-slate-800 tracking-widest">
            {Math.random().toString(36).substr(2, 6).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Action Button (New Dark Style) */}
      <button 
        onClick={() => window.location.reload()}
        className="mt-8 px-8 py-3 rounded-xl text-sm font-bold text-white bg-slate-900 shadow-lg shadow-slate-200 hover:scale-105 active:scale-95 transition-all"
      >
        Book Another Appointment
      </button>

    </div>
  );
}