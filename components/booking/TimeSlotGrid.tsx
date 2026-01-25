import { Sparkles } from 'lucide-react';
import { TIME_FRAMES } from './constants';

interface TimeSlotGridProps {
  slotCounts: Record<string, number>;
  loading: boolean;
  selectedDate: string;
  maxCapacity: number; // NEW: Added prop
}

export default function TimeSlotGrid({ slotCounts, loading, selectedDate, maxCapacity }: TimeSlotGridProps) {
  if (!selectedDate) {
    return (
      <div className="text-center p-6 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-100 rounded-2xl">
        Select a date above to view available time slots
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
          <Sparkles className="w-5 h-5 text-slate-400" /> Available Slots
        </div>
        {loading && <span className="text-xs font-bold text-rose-500 animate-pulse">Checking...</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TIME_FRAMES.map((slot) => {
          // Normalize key: "10:00 AM - 11:30 AM" -> "10:00 am"
          const timeKey = slot.split(' - ')[0].trim().toLowerCase();
          const count = slotCounts[timeKey] || 0;
          
          // Use dynamic maxCapacity (e.g. 4 or 6)
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

              {/* Selected State */}
              <div className="absolute inset-0 bg-[#0f172a] opacity-0 peer-checked:opacity-100 transition-all duration-300 z-0"></div>

              {/* Card Content - STRICTLY NO "X LEFT" TEXT */}
              <div className={`p-4 relative z-10 transition-colors duration-300 flex items-center justify-between ${isFull ? 'text-slate-400' : 'text-slate-700 peer-checked:text-white'}`}>
                <span className="font-bold text-sm">{slot}</span>
                {isFull && <span className="text-xs font-bold text-rose-500">FULL</span>}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}