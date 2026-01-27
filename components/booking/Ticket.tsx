import { CheckCircle2, MapPin, Calendar, Clock, Sparkles, Copy, Scissors, Package, CreditCard, User } from 'lucide-react';
import Image from 'next/image';

interface TicketProps {
  data: any;
  refCode: string;
}

export default function Ticket({ data, refCode }: TicketProps) {
  if (!data) return null;

  // Helper to safely get data regardless of casing from different sources
  const get = (key: string) => data[key] || data[key.toUpperCase()] || data[key.toLowerCase()] || "";

  const servicesRaw = get('SERVICES');
  const services = servicesRaw ? servicesRaw.split(',') : [];
  
  const isReschedule = get('TYPE') === 'Reschedule';

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4">
      
      {/* TICKET CONTAINER - Max width constrained to look like a phone receipt */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative">
        
        {/* TOP: BRAND HEADER (Dark) */}
        <div className="bg-[#202124] p-6 text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full border-4 border-white/20"></div>
                <div className="absolute left-[-20px] bottom-[-20px] w-16 h-16 rounded-full border-4 border-white/20"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#e6c200] overflow-hidden mb-3 relative shadow-lg">
                   <Image 
                     src="/logo.jpg" 
                     alt="Logo" 
                     fill
                     className="object-cover"
                   />
                </div>
                <h1 className="text-[#e6c200] font-extrabold text-xl tracking-wide uppercase">Sisters & Brows</h1>
                <div className="mt-2 inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                    <CheckCircle2 className="w-3 h-3 text-[#e6c200]" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                        {isReschedule ? 'Rescheduled' : 'Booking Confirmed'}
                    </span>
                </div>
            </div>
        </div>

        {/* MIDDLE: DETAILS (White) */}
        <div className="p-6 space-y-5">
            
            {/* HERO ROW: Date & Time */}
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
                        <Calendar className="w-5 h-5 text-[#202124]" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                        <p className="text-sm font-black text-slate-900">{get('DATE')}</p>
                    </div>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div className="flex items-center gap-3">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Time</p>
                        <p className="text-sm font-black text-slate-900 text-right">{get('TIME')}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
                        <Clock className="w-5 h-5 text-[#202124]" />
                    </div>
                </div>
            </div>

            {/* INFO GRID */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                
                {/* Branch */}
                <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3 h-3 text-[#e6c200]" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Branch</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 pl-4">{get('BRANCH')}</p>
                </div>

                {/* Session */}
                <div className="space-y-0.5">
                     <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3 h-3 text-[#e6c200]" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Session</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 pl-4">{get('SESSION')}</p>
                </div>

                {/* Client Name */}
                <div className="space-y-0.5 col-span-2 pt-2 border-t border-dashed border-slate-200">
                     <div className="flex items-center gap-1.5 mb-1">
                        <User className="w-3 h-3 text-[#e6c200]" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Client Name</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 pl-4">{get('FULL NAME')}</p>
                    <p className="text-[10px] font-medium text-slate-500 pl-4">{get('Contact Number')}</p>
                </div>

                {/* SERVICES (Full Width) */}
                <div className="col-span-2 pt-2 border-t border-dashed border-slate-200 space-y-1">
                     <div className="flex items-center gap-1.5 mb-1">
                        <Scissors className="w-3 h-3 text-[#e6c200]" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Services</span>
                    </div>
                    <div className="flex flex-wrap gap-1 pl-4">
                        {services.map((s: string, i: number) => (
                            <span key={i} className="inline-block bg-[#fffdf5] border border-[#e6c200] text-[#202124] text-[10px] font-bold px-2 py-0.5 rounded-md">
                                {s.trim()}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ADMIN CHECK (MOP & ACK) */}
                <div className="col-span-2 grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-2">
                         <div className="bg-white p-1.5 rounded-md shadow-sm">
                            <CreditCard className="w-3 h-3 text-[#e6c200]" />
                         </div>
                         <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Payment</p>
                            <p className="text-xs font-bold text-slate-900">{get('M O P')}</p>
                         </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-2">
                         <div className="bg-white p-1.5 rounded-md shadow-sm">
                            <Package className="w-3 h-3 text-[#e6c200]" />
                         </div>
                         <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">After Care</p>
                            <p className="text-xs font-bold text-slate-900">{get('ACK?') === 'ACK' ? 'Yes (+Kit)' : 'No'}</p>
                         </div>
                    </div>
                </div>

            </div>
        </div>

        {/* BOTTOM: CUTOUT SECTION */}
        <div className="relative bg-[#202124] p-6">
            {/* Cutout Circles */}
            <div className="absolute top-[-12px] left-[-12px] w-6 h-6 bg-[#f8fafc] rounded-full"></div>
            <div className="absolute top-[-12px] right-[-12px] w-6 h-6 bg-[#f8fafc] rounded-full"></div>
            
            {/* Dashed Line */}
            <div className="absolute top-0 left-4 right-4 border-t-2 border-dashed border-white/20"></div>

            <div className="flex justify-between items-center mt-2">
                <div className="space-y-1">
                    <p className="text-[10px] text-[#e6c200] font-bold uppercase tracking-widest">Reference ID</p>
                    <p className="text-2xl font-mono font-black text-white tracking-wider">{refCode}</p>
                </div>
                <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                    <Copy className="w-5 h-5 text-[#e6c200]" />
                </div>
            </div>
            
            <p className="text-center text-[9px] text-slate-500 mt-4 font-medium">
                Please take a screenshot of this ticket and send it to our Facebook Page to confirm your slot.
            </p>
        </div>

      </div>
    </div>
  );
}