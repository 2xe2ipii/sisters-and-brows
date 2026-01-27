'use client';

import { useState } from 'react';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

interface LocationDateProps {
  branches: any[];
  selectedBranch: string;
  setSelectedBranch: (val: string) => void;
  selectedDate: string;
  setSelectedDate: (val: string) => void;
  minDate: string;
}

export default function LocationDate({ 
  branches, 
  selectedBranch, 
  setSelectedBranch, 
  selectedDate, 
  setSelectedDate, 
  minDate 
}: LocationDateProps) {
  
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate calendar days
  // review calendar UI
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null); // Empty slots
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handleDateClick = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const offset = d.getTimezoneOffset(); 
    const dateStr = new Date(d.getTime() - (offset*60*1000)).toISOString().split('T')[0];
    
    if (dateStr >= minDate) {
      setSelectedDate(dateStr);
    }
  };

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      
      {/* 1. COMPACT BRANCH DROPDOWN */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wide">
          <MapPin className="w-4 h-4 text-rose-500" /> Select Branch
        </label>
        <div className="relative">
          <select 
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-xl p-4 pr-10 focus:ring-2 focus:ring-rose-500 outline-none cursor-pointer"
          >
            {branches.map((b) => (
              <option key={b.code} value={b.name}>{b.name}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {/* 2. CUSTOM CALENDAR */}
      <div className="space-y-2">
         <label className="text-slate-900 font-bold text-sm uppercase tracking-wide flex justify-between items-center">
            <span>Select Date</span>
            <span className="text-xs text-rose-500 normal-case">{selectedDate || 'No date selected'}</span>
         </label>
         
         <div className="border border-slate-200 rounded-xl p-4 bg-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
               <button type="button" onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
               <span className="font-bold text-slate-800">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
               <button type="button" onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-full"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
            </div>

            {/* Grid Header - FIXED KEY HERE */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
               {['S','M','T','W','T','F','S'].map((d, i) => (
                 <span key={i} className="text-[10px] font-bold text-slate-400">{d}</span>
               ))}
            </div>
            
            {/* Grid Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                if (!day) return <div key={idx} />; 
                
                const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const offset = d.getTimezoneOffset(); 
                const dateStr = new Date(d.getTime() - (offset*60*1000)).toISOString().split('T')[0];
                
                const isSelected = selectedDate === dateStr;
                const isDisabled = dateStr < minDate;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleDateClick(day)}
                    className={`
                      h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                      ${isSelected ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : ''}
                      ${!isSelected && !isDisabled ? 'text-slate-700 hover:bg-rose-50 hover:text-rose-600' : ''}
                      ${isDisabled ? 'text-slate-300 cursor-not-allowed' : ''}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
         </div>
      </div>
    </div>
  );
}