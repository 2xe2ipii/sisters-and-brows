import { FileText, Search, Loader2 } from 'lucide-react';

interface StartHereProps {
  bookingType: string;
  setBookingType: (type: string) => void;
  refCode: string;
  setRefCode: (code: string) => void;
  onLookup: () => void;
  lookupLoading: boolean;
  lookupMessage: string;
}

export default function StartHere({ 
  bookingType, 
  setBookingType, 
  refCode, 
  setRefCode, 
  onLookup, 
  lookupLoading,
  lookupMessage
}: StartHereProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-[#0f172a] px-6 py-4 flex items-center gap-2">
        <FileText className="text-white w-5 h-5" />
        <h2 className="text-white font-bold text-sm tracking-wide uppercase">Start Here</h2>
      </div>
      <div className="p-6">
        <p className="text-sm font-bold text-slate-700 mb-4">What would you like to do?</p>
        
        {/* Radio Buttons */}
        <div className="space-y-3 mb-6">
          {["New Appointment", "Reschedule"].map((type) => (
            <label key={type} className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${bookingType === type ? "border-[#0f172a] bg-slate-50" : "border-slate-100 hover:border-slate-200"}`}>
              <input
                type="radio"
                name="type"
                value={type}
                checked={bookingType === type}
                onChange={() => setBookingType(type)}
                className="w-5 h-5 text-slate-900 focus:ring-slate-900 border-gray-300"
              />
              <span className="ml-3 font-bold text-slate-900">
                {type === "New Appointment" ? "New Reservation" : "Reschedule Booking"}
              </span>
            </label>
          ))}
        </div>

        {/* Reschedule Input Area */}
        {bookingType === "Reschedule" && (
          <div className="animate-in fade-in slide-in-from-top-2 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 font-medium">Enter your Reference Code (e.g., R-X92B1) to retrieve your booking.</p>
            <div className="flex gap-2">
               <input 
                 type="text" 
                 placeholder="Reference Code"
                 value={refCode}
                 onChange={(e) => setRefCode(e.target.value)}
                 className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
               />
               <button 
                 type="button" 
                 onClick={onLookup}
                 disabled={!refCode || lookupLoading}
                 className="bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-rose-600 disabled:opacity-50 flex items-center gap-2"
               >
                 {lookupLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4" />}
                 Find
               </button>
            </div>
            {lookupMessage && (
               <p className={`text-xs font-bold ${lookupMessage.includes("Found") ? "text-green-600" : "text-red-500"}`}>
                 {lookupMessage}
               </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}