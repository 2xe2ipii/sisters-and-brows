import { CheckCircle2, MapPin, Calendar, Clock, Sparkles, Copy, Scissors, Package, CreditCard, User } from 'lucide-react';
import Image from 'next/image';

interface TicketProps {
  data: any;
  refCode: string;
}

export default function Ticket({ data, refCode }: TicketProps) {
  if (!data) return null;

  // Helper to safely get data
  const get = (key: string) => data[key] || data[key.toUpperCase()] || data[key.toLowerCase()] || "";

  const servicesRaw = get('SERVICES');
  const services = servicesRaw ? servicesRaw.split(',') : [];
  const isReschedule = get('TYPE') === 'Reschedule';

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 font-sans">
      
      {/* TICKET CONTAINER */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative">
        
        {/* TOP: BRAND HEADER */}
        <div className="bg-[#202124] py-5 px-6 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full border-4 border-white/20"></div>
                <div className="absolute left-[-20px] bottom-[-20px] w-16 h-16 rounded-full border-4 border-white/20"></div>
            </div>

            <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border-2 border-[#e6c200] overflow-hidden relative shadow-lg shrink-0">
                   <Image 
                     src="/logo.jpg" 
                     alt="Logo" 
                     fill
                     className="object-cover"
                   />
                </div>
                <div>
                    <h1 className="text-[#e6c200] font-extrabold text-lg tracking-wide uppercase leading-none">Sisters & Brows</h1>
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                        <CheckCircle2 className="w-3 h-3 text-[#e6c200]" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                            {isReschedule ? 'Rescheduled' : 'Confirmed'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* MIDDLE: DETAILS */}
        <div className="p-6 space-y-5">
            
            {/* HERO ROW: Date & Time (High Visibility) */}
            <div className="flex bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                <div className="flex-1 p-3 border-r border-slate-200 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                    <p className="text-lg font-black text-slate-900 leading-tight">{get('DATE')}</p>
                </div>
                <div className="flex-1 p-3 text-center bg-[#fffdf5]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time</p>
                    <p className="text-lg font-black text-[#202124] leading-tight">{get('TIME')}</p>
                </div>
            </div>

            {/* MAIN DETAILS GRID */}
            <div className="space-y-4">
                
                {/* Client Name */}
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <User className="w-3 h-3" /> Client Name
                    </p>
                    <p className="text-xl font-black text-slate-900">{get('FULL NAME')}</p>
                    <p className="text-sm font-bold text-slate-500">{get('Contact Number')}</p>
                </div>

                <div className="w-full h-px bg-slate-100"></div>

                {/* Branch & Session */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Branch
                        </p>
                        <p className="text-base font-extrabold text-slate-800">{get('BRANCH')}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Session
                        </p>
                        <p className="text-base font-extrabold text-slate-800">{get('SESSION')}</p>
                    </div>
                </div>

                {/* Services */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Scissors className="w-3 h-3" /> Services
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {services.map((s: string, i: number) => (
                            <span key={i} className="inline-block bg-white border-b-2 border-slate-200 text-slate-800 text-xs font-bold px-2 py-1 rounded-md">
                                {s.trim()}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Admin Verification Box */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="border border-slate-200 rounded-xl p-3 flex flex-col justify-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payment</p>
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#e6c200]" />
                            <p className="text-sm font-black text-slate-900">{get('M O P')}</p>
                        </div>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-3 flex flex-col justify-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">After Care</p>
                        <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-[#e6c200]" />
                            <p className="text-sm font-black text-slate-900">{get('ACK?') === 'ACK' ? 'Yes (+Kit)' : 'No'}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* BOTTOM: CUTOUT SECTION */}
        <div className="relative bg-[#202124] py-4 px-6">
            {/* Cutout Circles */}
            <div className="absolute top-[-10px] left-[-10px] w-5 h-5 bg-[#f8fafc] rounded-full"></div>
            <div className="absolute top-[-10px] right-[-10px] w-5 h-5 bg-[#f8fafc] rounded-full"></div>
            
            {/* Dashed Line */}
            <div className="absolute top-0 left-5 right-5 border-t-2 border-dashed border-white/20"></div>

            <div className="flex justify-between items-center mt-1">
                <div className="space-y-0.5">
                    <p className="text-[10px] text-[#e6c200] font-bold uppercase tracking-widest">Reference ID</p>
                    <p className="text-xl font-mono font-bold text-white tracking-widest">{refCode}</p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg border border-white/5">
                    <Copy className="w-5 h-5 text-[#e6c200]" />
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}