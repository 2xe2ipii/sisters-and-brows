'use client'

import { Layers, Stethoscope, Sparkles } from 'lucide-react';

interface SessionSelectProps {
  selected: string;
  onSelect: (val: string) => void;
}

export default function SessionSelect({ selected, onSelect }: SessionSelectProps) {
  const options = [
    { id: '1ST', label: '1st Session', sub: 'New Set', icon: Sparkles },
    { id: '2ND', label: '2nd Session', sub: 'Retouch', icon: Layers },
    { id: 'FULL', label: 'Full Session', sub: 'Intensive', icon: Layers },
    { id: 'CONSULTATION', label: 'Consultation', sub: 'Assessment', icon: Stethoscope },
  ];

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
      <label className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wide">
        <Layers className="w-4 h-4 text-rose-500" /> Choose Session Type
      </label>
      
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          const Icon = opt.icon;
          
          return (
            <div
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className={`
                cursor-pointer relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center text-center gap-1 group
                ${isSelected 
                  ? 'border-rose-500 bg-rose-50/80 shadow-sm scale-[1.02]' 
                  : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                }
              `}
            >
              <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-rose-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
              
              <span className={`text-sm font-extrabold ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                {opt.label}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-rose-500' : 'text-slate-400'}`}>
                {opt.sub}
              </span>

              {/* Checkmark Badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 shadow-sm animate-in zoom-in" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}