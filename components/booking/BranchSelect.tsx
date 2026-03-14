import { MapPin } from 'lucide-react';
import SectionContainer from './SectionContainer';
import { getBranchStyle } from '@/lib/booking/branchStyles';

interface BranchSelectProps {
  branches: { name: string; code: string }[];
  selected: string;
  onSelect: (val: string) => void;
}

export default function BranchSelect({ branches, selected, onSelect }: BranchSelectProps) {
  return (
    <SectionContainer
      title="Select Branch"
      icon={<MapPin className="w-4 h-4 text-[#e6c200]" />}
    >
      <div className="grid grid-cols-2 gap-3">
        {branches.map((b) => {
          const isSelected = selected === b.name;
          const style = getBranchStyle(b.name);
          return (
            <button
              key={b.code}
              type="button"
              onClick={() => onSelect(b.name)}
              className={`
                h-16 px-3 rounded-xl text-sm font-bold border-2 transition-all
                flex items-center justify-center text-center leading-tight
                ${isSelected
                  ? `${style.border} ${style.light} ${style.color}`
                  : 'border-slate-100 text-slate-400 hover:border-slate-200 bg-white'
                }
              `}
            >
              {b.name}
            </button>
          );
        })}
      </div>
    </SectionContainer>
  );
}
