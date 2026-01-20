import { FileText, Check } from 'lucide-react';
import { SERVICES_DATA } from './constants';

export default function ServiceList() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
        <FileText className="w-5 h-5 text-slate-400" /> Select Services
      </div>
      <div className="divide-y divide-slate-50 border rounded-xl border-slate-100">
        {SERVICES_DATA.map((service) => (
          <label key={service.name} className="flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer transition-colors group">
            <div className="relative flex items-center justify-center">
              <input type="checkbox" name="services" value={service.name} className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded checked:bg-rose-500 checked:border-rose-500 transition-all" />
              <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm group-hover:text-rose-600 transition-colors">{service.name}</span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{service.price}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{service.desc}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}