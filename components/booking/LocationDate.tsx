import { MapPin, ChevronDown, Calendar } from 'lucide-react';
import { BRANCHES } from './constants';

interface LocationDateProps {
  selectedBranch: string;
  setSelectedBranch: (val: string) => void;
  selectedDate: string;
  setSelectedDate: (val: string) => void;
  minDate: string;
}

export default function LocationDate({ selectedBranch, setSelectedBranch, selectedDate, setSelectedDate, minDate }: LocationDateProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
        <MapPin className="w-5 h-5 text-slate-400" /> Location & Date
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Select Branch</label>
          <div className="relative">
            <select name="branch" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="w-full appearance-none bg-slate-50 border border-slate-100 text-slate-900 font-semibold rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer hover:bg-slate-100 transition-colors">
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Select Date</label>
          <div className="relative">
            <input name="date" type="date" value={selectedDate} required min={minDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-slate-50 border border-slate-100 text-slate-900 font-semibold rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer uppercase hover:bg-slate-100 transition-colors placeholder:normal-case" />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}