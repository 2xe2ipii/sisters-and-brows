import { FileText, Search, Loader2 } from 'lucide-react';
import SectionContainer from './SectionContainer';

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
    <SectionContainer 
      title="Start Here" 
      icon={<FileText className="w-4 h-4 text-[#e6c200]" />}
    >
      <p className="text-sm font-bold text-slate-700 mb-4">What would you like to do?</p>
      
      {/* Radio Buttons */}
      <div className="space-y-3 mb-6">
        {["New Appointment", "Reschedule"].map((type) => (
          <label key={type} className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${bookingType === type ? "border-[#e6c200] bg-[#fffdf5]" : "border-slate-100 hover:border-slate-200"}`}>
            <input
              type="radio"
              name="type"
              value={type}
              checked={bookingType === type}
              onChange={() => setBookingType(type)}
              className="w-5 h-5 text-[#202124] focus:ring-[#e6c200] border-gray-300 accent-[#202124]"
            />
            <span className={`ml-3 font-bold ${bookingType === type ? "text-[#202124]" : "text-slate-600"}`}>
              {type === "New Appointment" ? "New Reservation" : "Reschedule Booking"}
            </span>
          </label>
        ))}
      </div>

      {/* Reschedule Input Area */}
      {bookingType === "Reschedule" && (
        <div className="animate-in fade-in slide-in-from-top-2 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Enter your Reference Code to retrieve your booking.</p>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full">
             <input 
               type="text" 
               placeholder="REFERENCE CODE"
               value={refCode}
               onChange={(e) => setRefCode(e.target.value)}
               className="flex-1 min-w-0 h-16 border border-slate-300 rounded-xl px-6 text-lg font-bold uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e6c200] focus:border-transparent placeholder:text-slate-300"
             />
             <button 
               type="button" 
               onClick={onLookup}
               disabled={!refCode || lookupLoading}
               className="h-16 bg-[#202124] text-[#e6c200] px-8 rounded-xl text-base font-bold hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 transition-colors shadow-sm"
             >
               {lookupLoading ? <Loader2 className="w-5 h-5 animate-spin text-[#e6c200]"/> : <Search className="w-5 h-5 text-[#e6c200]" />}
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
    </SectionContainer>
  );
}