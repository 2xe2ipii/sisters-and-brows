import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import SectionContainer from './SectionContainer';

interface DateSelectProps {
  selected: string;
  onSelect: (date: string) => void;
  minDate: string;
}

export default function DateSelect({ selected, onSelect, minDate }: DateSelectProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentMonth]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrev = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const handleNext = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isDateDisabled = (date: Date) => {
    const min = new Date(minDate);
    min.setHours(0,0,0,0);
    const d = new Date(date);
    d.setHours(0,0,0,0);
    return d < min;
  };

  const isSameDay = (d1: Date, d2Str: string) => {
    if (!d2Str) return false;
    const d2 = new Date(d2Str);
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  const formatDateValue = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const d = new Date(date.getTime() - (offset*60*1000));
    return d.toISOString().split('T')[0];
  };

  return (
    <SectionContainer 
      title="Select Date" 
      icon={<CalendarIcon className="w-4 h-4 text-[#e6c200]" />}
    >
      <div className="select-none">
        <div className="flex items-center justify-between mb-4 px-2">
           <button type="button" onClick={handlePrev} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
             <ChevronLeft className="w-5 h-5" />
           </button>
           <span className="text-sm font-bold text-slate-800">
             {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
           </span>
           <button type="button" onClick={handleNext} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
             <ChevronRight className="w-5 h-5" />
           </button>
        </div>

        <div className="grid grid-cols-7 text-center mb-2">
          {weekDays.map(d => (
             <span key={d} className="text-[10px] font-bold text-slate-400 uppercase">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
           {Array(currentMonth.getDay()).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
           
           {daysInMonth.map((date, i) => {
             const disabled = isDateDisabled(date);
             const isSelected = isSameDay(date, selected);
             return (
               <button
                 key={i}
                 type="button"
                 disabled={disabled}
                 onClick={() => onSelect(formatDateValue(date))}
                 className={`
                   aspect-square flex items-center justify-center rounded-lg text-xs font-bold transition-all
                   ${isSelected 
                     ? 'bg-[#202124] text-white shadow-md' 
                     : disabled 
                        ? 'text-slate-300 cursor-not-allowed' 
                        : 'text-slate-700 hover:bg-slate-100'
                   }
                 `}
               >
                 {date.getDate()}
               </button>
             );
           })}
        </div>
      </div>
    </SectionContainer>
  );
}

// const export default