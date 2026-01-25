import { Check, MapPin, Calendar, Clock, User } from 'lucide-react';

interface TicketProps {
  data: any;
}

export default function Ticket({ data }: TicketProps) {
  if (!data) return null;

  const servicesList = Array.isArray(data.services) 
    ? data.services 
    : (data.services ? [data.services] : []);

  // Generate a simple reference code
  const refCode = Math.random().toString(36).substr(2, 6).toUpperCase();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-gray-50/50">
      
      {/* Main Card */}
      <div className="w-full max-w-sm bg-white rounded-xl border border-gray-100 shadow-sm animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-8 text-center border-b border-gray-50">
          <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
             <Check className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Booking Confirmed</h1>
          <p className="text-gray-500 text-sm mt-1">We'll see you soon!</p>
        </div>

        {/* Details Section */}
        <div className="p-8 space-y-6">
          
          {/* Primary Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
               <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
               <div>
                 <p className="text-sm font-medium text-gray-900">{data.date}</p>
                 <p className="text-xs text-gray-500">Date</p>
               </div>
            </div>

            <div className="flex items-start gap-3">
               <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
               <div>
                 <p className="text-sm font-medium text-gray-900">
                    {data.time ? data.time.split('-')[0] : "Time not set"}
                 </p>
                 <p className="text-xs text-gray-500">Time</p>
               </div>
            </div>

            <div className="flex items-start gap-3">
               <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
               <div>
                 <p className="text-sm font-medium text-gray-900">{data.branch}</p>
                 <p className="text-xs text-gray-500">Location</p>
               </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 w-full" />

          {/* Guest & Service Info */}
          <div className="space-y-4">
             <div className="flex items-start gap-3">
               <User className="w-5 h-5 text-gray-400 mt-0.5" />
               <div>
                 <p className="text-sm font-medium text-gray-900">{data.firstName} {data.lastName}</p>
                 <p className="text-xs text-gray-500">Guest</p>
               </div>
            </div>

            <div className="pl-8">
              <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-medium">Services</p>
              <ul className="space-y-1">
                {servicesList.length > 0 ? (
                  servicesList.map((s: string) => (
                    <li key={s} className="text-sm text-gray-800 font-medium">
                      • {s}
                    </li>
                  ))
                ) : <li className="text-sm text-gray-400 italic">No services listed</li>}
              </ul>
            </div>
          </div>

          {/* Footer / Ref */}
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 font-mono">REF: {refCode}</p>
            <p className="text-[10px] text-gray-400 mt-1">Please take a screenshot of this page.</p>
          </div>

        </div>

      </div>

      {/* Simple Text Button */}
      <button 
        onClick={() => window.location.reload()}
        className="mt-6 text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors"
      >
        Book Another Appointment
      </button>

    </div>
  );
}