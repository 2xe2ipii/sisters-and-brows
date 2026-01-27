import { ReactNode } from 'react';

interface SectionContainerProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function SectionContainer({ title, icon, children, className = "" }: SectionContainerProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
      {/* THE DARK HEADER */}
      <div className="bg-[#202124] px-6 py-4 flex items-center gap-3">
        {icon}
        <h2 className="text-white font-bold text-sm tracking-wide uppercase">{title}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}