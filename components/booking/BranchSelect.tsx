import { MapPin } from 'lucide-react';
import SectionContainer from './SectionContainer';

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
      <div className="flex flex-wrap gap-3">
        {branches.map((b) => {
          const isSelected = selected === b.name;
          return (
            <button
              key={b.code}
              type="button"
              onClick={() => onSelect(b.name)}
              className={`
                px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all flex-1 min-w-[140px]
                ${isSelected 
                  ? 'border-[#202124] bg-slate-50 text-[#202124]' 
                  : 'border-slate-100 text-slate-500 hover:border-slate-200'
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