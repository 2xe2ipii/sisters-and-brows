import { Sparkles } from 'lucide-react';

interface TimeSlotGridProps {
  timeSlots: string[]; 
  slotCounts: Record<string, number>;
  loading: boolean;
  selectedDate: string;
  maxCapacity: number; 
}

export default function TimeSlotGrid({ timeSlots, slotCounts, loading, selectedDate, maxCapacity }: TimeSlotGridProps) {
  
  // 1. Show message if no date is selected
  if (!selectedDate) {
    return (
      <div className="text-center p-6 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-100 rounded-2xl">
        Select a date above to view available time slots
      </div>
    );
  }

  // 2. Loading State (Shows while we fetch limits)
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col items-center justify-center gap-3 animate-pulse">
        <Sparkles className="w-6 h-6 text-slate-300 animate-spin-slow" />
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Checking Availability...</span>
      </div>
    );
  }

  // Fallback if timeSlots is empty/undefined
  const slotsToRender = timeSlots && timeSlots.length > 0 ? timeSlots : [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
          <Sparkles className="w-5 h-5 text-slate-400" /> Available Slots
        </div>
      </div>

      {slotsToRender.length === 0 ? (
        <div className="text-center p-4 text-rose-500 font-bold text-sm bg-rose-50 rounded-xl">
          No time slots configured. Please contact support.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {slotsToRender.map((slot) => {
            // Normalize key: "10:00 AM - 11:30 AM" -> "10:00am"
            // This matches the format stored in your specific Google Sheet Counter
            const timeKey = slot.split(' - ')[0].replace(/\s/g, '').toLowerCase();
            const count = slotCounts[timeKey] || 0;
            
            // Limit Logic
            const isFull = (maxCapacity - count) <= 0;

            return (
              <label
                key={slot}
                className={`
                  relative overflow-hidden rounded-xl border transition-all duration-200 cursor-pointer group
                  ${isFull
                    ? 'bg-slate-50 border-transparent opacity-50 cursor-not-allowed pointer-events-none'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md' 
                  }
                `}
              >
                <input
                  type="radio"
                  name="time"
                  value={slot}
                  disabled={isFull}
                  required
                  className="peer hidden"
                />

                {/* Selected State (Dark Blue Background) */}
                <div className="absolute inset-0 bg-[#0f172a] opacity-0 peer-checked:opacity-100 transition-all duration-300 z-0"></div>

                {/* Card Content */}
                <div className={`p-4 relative z-10 transition-colors duration-300 flex items-center justify-between ${isFull ? 'text-slate-400' : 'text-slate-700 peer-checked:text-white'}`}>
                  <span className="font-bold text-sm">{slot}</span>
                  {isFull && <span className="text-[10px] font-bold uppercase tracking-wider">Full</span>}
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}