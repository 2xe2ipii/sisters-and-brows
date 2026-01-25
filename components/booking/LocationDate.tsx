import { useState, useEffect } from 'react';
import { MapPin, ChevronDown, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isBefore, 
  startOfDay,
  parseISO 
} from 'date-fns';
import { BRANCHES } from './constants';

interface LocationDateProps {
  selectedBranch: string;
  setSelectedBranch: (val: string) => void;
  selectedDate: string;
  setSelectedDate: (val: string) => void;
  minDate: string;
}

export default function LocationDate({ 
  selectedBranch, 
  setSelectedBranch, 
  selectedDate, 
  setSelectedDate, 
  minDate 
}: LocationDateProps) {
  
  // State for the calendar view (defaults to today or selected date)
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate ? parseISO(selectedDate) : new Date()
  );

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Parsed limits for disabling
  const minDateObj = startOfDay(parseISO(minDate));

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const onDateClick = (day: Date) => {
    // Format as YYYY-MM-DD for consistency with the rest of your app
    setSelectedDate(format(day, 'yyyy-MM-dd'));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      
      {/* HEADER */}
      <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
        <MapPin className="w-5 h-5 text-slate-400" /> Location & Date
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* 1. BRANCH SELECTOR */}
        <div className="space-y-4">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Select Branch
          </label>
          <div className="relative group">
            <select 
              name="branch" 
              value={selectedBranch} 
              onChange={(e) => setSelectedBranch(e.target.value)} 
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 cursor-pointer hover:bg-slate-100 transition-all shadow-sm"
            >
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" />
          </div>

           {/* Mobile-Only Helper Text */}
           <p className="md:hidden text-xs text-slate-400 leading-relaxed">
             Please ensure you select the correct branch before proceeding.
           </p>
        </div>

        {/* 2. CUSTOM CALENDAR */}
        <div className="space-y-4">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Select Date
          </label>
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-slate-900 font-bold text-sm flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-rose-500" />
                {format(currentMonth, 'MMMM yyyy')}
              </h4>
              <div className="flex gap-1">
                <button 
                  type="button" 
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  type="button" 
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-2 text-center">
              {weekDays.map(day => (
                <div key={day} className="text-[10px] font-bold text-slate-400 uppercase">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const isSelected = selectedDate ? isSameDay(day, parseISO(selectedDate)) : false;
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isDisabled = isBefore(day, minDateObj);

                return (
                  <button
                    key={day.toString()}
                    type="button"
                    onClick={() => onDateClick(day)}
                    disabled={isDisabled}
                    className={`
                      h-9 w-full rounded-lg text-xs font-semibold flex items-center justify-center transition-all duration-200 relative
                      ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
                      ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 cursor-pointer'}
                      ${isSelected ? 'bg-rose-500 text-white shadow-md shadow-rose-200 hover:bg-rose-600 !opacity-100' : ''}
                      ${isToday && !isSelected ? 'text-rose-500 font-extrabold bg-rose-50' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}