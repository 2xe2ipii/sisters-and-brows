import { FileText } from 'lucide-react';

interface StartHereProps {
  bookingType: string;
  setBookingType: (type: string) => void;
}

export default function StartHere({ bookingType, setBookingType }: StartHereProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-[#0f172a] px-6 py-4 flex items-center gap-2">
        <FileText className="text-white w-5 h-5" />
        <h2 className="text-white font-bold text-sm tracking-wide uppercase">Start Here</h2>
      </div>
      <div className="p-6">
        <p className="text-sm font-bold text-slate-700 mb-4">What would you like to do?</p>
        <div className="space-y-3">
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
      </div>
    </div>
  );
}