'use client'

import { MessageSquare } from 'lucide-react';
import SectionContainer from './SectionContainer';

export default function SpecialRequests() {
  return (
    <SectionContainer 
      title="Special Requests" 
      icon={<MessageSquare className="w-4 h-4 text-[#e6c200]" />}
    >
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase">
          Notes / Remarks <span className="text-slate-300 font-normal normal-case">(Optional)</span>
        </label>
        <textarea 
          name="others" 
          rows={3}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none resize-none leading-relaxed" 
        />
      </div>
    </SectionContainer>
  );
}