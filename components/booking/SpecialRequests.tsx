'use client'

import { MessageSquare } from 'lucide-react';
import SectionContainer from './SectionContainer';

export default function SpecialRequests() {
  return (
    <SectionContainer 
      title="Special Requests" 
      icon={<MessageSquare className="w-4 h-4 text-[#e6c200]" />}
    >
      <textarea 
        name="others" 
        rows={3}
        placeholder="Any specific requests or notes..."
        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#e6c200] outline-none resize-none leading-relaxed placeholder:text-slate-400" 
      />
    </SectionContainer>
  );
}