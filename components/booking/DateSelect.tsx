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

  const handlePrev = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNext = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const isDateDisabled = (date: Date) => {
    const min = new Date(minDate);
    min.setHours(0,0,0,0);
    const d = new Date(date);
    d.setHours(0,0,0,0);
    return d < min;
  };

  const formatDateValue = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const d = new Date(date.getTime() - (offset*60*1000));
    return d.toISOString().split('T')[0];
  };

  return (
    <SectionContainer title="Select Date" icon={<CalendarIcon className="w-4 h-4 text-[#e6c200]" />}>
      <div className="select-none">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
           <button type="button" onClick={handlePrev} className="p-1 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-5 h-5 text-slate-600"/></button>
           <span className="text-sm font-black uppercase tracking-wider text-slate-800">
             {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
           </span>
           <button type="button" onClick={handleNext} className="p-1 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-5 h-5 text-slate-600"/></button>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
           {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
             <span key={d} className="text-[10px] font-bold text-slate-400 uppercase">{d}</span>
           ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
           {Array(daysInMonth[0].getDay()).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
           {daysInMonth.map((date) => {
             const val = formatDateValue(date);
             const isDisabled = isDateDisabled(date);
             const isSelected = selected === val;
             return (
               <button
                 key={val}
                 type="button"
                 disabled={isDisabled}
                 onClick={() => onSelect(val)}
                 className={`
                   h-10 rounded-lg text-sm font-bold transition-all
                   ${isDisabled ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-100'}
                   ${isSelected ? 'bg-[#202124] text-[#e6c200] hover:bg-[#202124]' : ''}
                   ${!isDisabled && !isSelected ? 'text-slate-700' : ''}
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