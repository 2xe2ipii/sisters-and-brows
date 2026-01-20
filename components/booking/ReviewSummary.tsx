import { Receipt, Check, AlertCircle } from 'lucide-react';

interface ReviewSummaryProps {
  data: any;
  onEdit: () => void;
  isPending: boolean;
  success: boolean;
  message?: string;
}

export default function ReviewSummary({ data, onEdit, isPending, success, message }: ReviewSummaryProps) {
  if (!data) return null;

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0f172a] rounded-full flex items-center justify-center text-white">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Booking Summary</p>
              <p className="font-bold text-slate-900">{data.type}</p>
            </div>
          </div>
          <button type="button" onClick={onEdit} className="text-xs font-bold text-rose-500 hover:underline">Edit</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Date & Time</p>
              <p className="font-semibold text-slate-800">{data.date}</p>
              <p className="text-sm text-slate-600">{data.time}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
              <p className="font-semibold text-slate-800">{data.branch}</p>
            </div>
          </div>

          <div className="pb-4 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Selected Services</p>
            <div className="flex flex-wrap gap-2">
              {data.services && data.services.length > 0 ? (
                data.services.map((s: string) => (
                  <span key={s} className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold border border-rose-100">{s}</span>
                ))
              ) : <span className="text-slate-400 italic text-sm">None selected</span>}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Client Details</p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="font-bold text-slate-800 text-sm">{data.firstName} {data.lastName}</p>
              <p className="text-slate-500 text-xs">{data.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR DISPLAY */}
      {!success && message && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold">{message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-rose-600 text-white font-bold text-lg py-4 rounded-2xl shadow-xl hover:bg-rose-700 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
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