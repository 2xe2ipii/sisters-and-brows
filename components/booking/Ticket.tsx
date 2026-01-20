import { Check, Sparkles, Scissors } from 'lucide-react';

interface TicketProps {
  data: any;
}

export default function Ticket({ data }: TicketProps) {
  if (!data) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#f1f5f9]">
      <div className="w-full max-w-sm relative drop-shadow-2xl animate-in zoom-in duration-700">
        <div className="bg-white w-full rounded-3xl overflow-hidden relative">
          <div className="bg-[#0f172a] p-8 text-center relative z-10">
            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
              <Sparkles className="w-7 h-7 text-rose-400" />
            </div>
            <h2 className="text-white font-serif text-2xl tracking-wider">OFFICIAL PASS</h2>
            <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] mt-2">Sisters & Brows Reservation</p>
          </div>

          <div className="relative h-6 bg-[#0f172a]">
            <div className="absolute top-0 left-0 w-full h-full bg-white rounded-t-3xl"></div>
            <div className="absolute -left-3 top-[-12px] w-6 h-6 bg-[#f1f5f9] rounded-full z-20"></div>
            <div className="absolute -right-3 top-[-12px] w-6 h-6 bg-[#f1f5f9] rounded-full z-20"></div>
            <div className="absolute left-4 right-4 top-0 border-t-2 border-dashed border-slate-200"></div>
          </div>

          <div className="bg-white px-8 pb-8 pt-2 space-y-6">
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                <p className="text-slate-900 font-bold text-sm">{data.date}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time</p>
                <p className="text-slate-900 font-bold text-sm">{data.time}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                <p className="text-slate-900 font-bold text-sm">{data.branch}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Guest</p>
                <p className="text-slate-900 font-bold text-sm truncate">{data.firstName} {data.lastName}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Type</p>
                <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                  {data.type === 'New Appointment' ? 'New' : 'Resched'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                <Scissors className="w-3 h-3" /> Services
              </p>
              <ul className="space-y-2">
                {data.services && data.services.length > 0 ? (
                  data.services.map((s: string) => (
                    <li key={s} className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> {s}
                    </li>
                  ))
                ) : <li className="text-xs text-slate-400 italic">No services selected</li>}
              </ul>
            </div>

            <div className="pt-2">
              <div className="h-12 w-full bg-slate-100 rounded flex items-center justify-center gap-1 opacity-50">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className={`h-8 w-${i % 2 === 0 ? '1' : '0.5'} bg-slate-900`}></div>
                ))}
              </div>
              <p className="text-center text-[9px] text-slate-400 mt-2 font-mono">
                REF: {Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="bg-rose-50 p-3 text-center">
            <p className="text-[10px] text-rose-600 font-bold">Please screenshot this ticket</p>
          </div>
        </div>
      </div>
    </div>
  );
}