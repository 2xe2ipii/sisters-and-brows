'use client'

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { fetchServices } from '@/app/actions';

// --- FALLBACK DATA ---
const DEFAULT_SERVICES = [
  { id: 'bundle-a', name: 'Bundle A', price: '₱3,999', category: 'Bundles', image: '/bundleA_3999.jpg', desc: 'Premium value package' },
  { id: 'bundle-b', name: 'Bundle B', price: '₱4,999', category: 'Bundles', image: '/bundleB_4999.jpg', desc: 'Complete brow & care package' },
  { id: 'bundle-c', name: 'Bundle C', price: '₱5,499', category: 'Bundles', image: '/bundleC_5499.jpg', desc: 'Ultimate aesthetic package' },
  { id: 'bundle-d', name: 'Bundle D', price: '₱6,499', category: 'Bundles', image: '/bundleD_6499.jpg', desc: 'Full service aesthetic suite' },
  { id: 'mm-1', name: 'Mix & Match 1', price: '₱2,800', category: 'Mix & Match', image: '/mm1.jpg', desc: 'Custom combination' },
  { id: 'mm-2', name: 'Mix & Match 2', price: '₱2,800', category: 'Mix & Match', image: '/mm2.jpg', desc: 'Custom combination' },
  { id: 'mm-3', name: 'Mix & Match 3', price: '₱3,300', category: 'Mix & Match', image: '/mm3.jpg', desc: 'Custom combination' },
  { id: 'mm-4', name: 'Mix & Match 4', price: '₱3,800', category: 'Mix & Match', image: '/mm4.jpg', desc: 'Custom combination' },
  { id: 'mm-5', name: 'Mix & Match 5', price: '₱8,800', category: 'Mix & Match', image: '/mm5.jpg', desc: 'Custom combination' },
  { id: 'mm-6', name: 'Mix & Match 6', price: '₱4,300', category: 'Mix & Match', image: '/mm6.jpg', desc: 'Custom combination' },
  { id: 'mm-7', name: 'Mix & Match 7', price: '₱4,300', category: 'Mix & Match', image: '/mm7.jpg', desc: 'Custom combination' },
  { id: 'mm-8', name: 'Mix & Match 8', price: '₱4,800', category: 'Mix & Match', image: '/mm8.jpg', desc: 'Custom combination' },
  { id: 'mm-9', name: 'Mix & Match 9', price: '₱5,300', category: 'Mix & Match', image: '/mm9.jpg', desc: 'Custom combination' },
  { id: 'mm-10', name: 'Mix & Match 10', price: '₱10,300', category: 'Mix & Match', image: '/mm10.jpg', desc: 'Premium combination' },
  { id: '9d-micro', name: '9D Microblading', price: '₱4,999', category: 'Brows', image: '/mm8.jpg', desc: 'Natural hair-like strokes' },
  { id: 'ombre', name: 'Ombre Brows', price: '₱3,999', category: 'Brows', image: '/ombre_brows.jpg', desc: 'Soft powdered makeup look' },
  { id: 'combo', name: 'Combi Brows', price: '₱5,499', category: 'Brows', image: '/combo_brows.jpg', desc: 'Microblading + Shading mix' },
  { id: 'lip-blush', name: 'Lip Blush', price: '₱3,500', category: 'Lips', image: '/lip_blush.jpg', desc: 'Natural healthy tint' },
  { id: 'lash-line', name: 'Lash Line', price: '₱2,500', category: 'Eyes', image: '/lash_line.jpg', desc: 'Subtle eyeliner enhancement' },
  { id: 'bb-glow', name: 'BB Glow', price: '₱2,500', category: 'Skin', image: '/bb_glow.jpg', desc: 'Semi-permanent foundation' },
  { id: 'derma-pen', name: 'Derma Pen', price: '₱3,000', category: 'Skin', image: '/derma_pen.jpg', desc: 'Microneedling treatment' },
  { id: 'scalp', name: 'Scalp Micro', price: '₱5,000+', category: 'Skin', image: '/scalp_micropigmentation.jpg', desc: 'Hair density illusion' }
];

const CATEGORIES = ["All", "Bundles", "Mix & Match", "Brows", "Lips", "Skin", "Eyes"];

export default function ServiceList({ onNext, onBack }: { onNext?: () => void, onBack?: () => void }) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [servicesData, setServicesData] = useState<any[]>(DEFAULT_SERVICES);

  useEffect(() => {
    async function load() {
      const res = await fetchServices();
      if (res.success && res.data.length > 0) {
        setServicesData(res.data);
      }
    }
    load();
  }, []);

  const toggleService = (name: string) => {
    setSelectedServices(prev => 
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name] 
    );
  };

  const filteredServices = useMemo(() => {
    if (activeCategory === "All") return servicesData;
    return servicesData.filter(s => s.category === activeCategory);
  }, [activeCategory, servicesData]);

  return (
    <div className={`space-y-4 animate-in fade-in slide-in-from-right-8 duration-500 ${onNext ? 'pb-20' : ''}`}>
      
      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 sticky top-0 bg-[#f8fafc] z-10 py-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`
              whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border
              ${activeCategory === cat 
                ? 'bg-[#202124] text-[#e6c200] border-[#202124] shadow-md' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredServices.map((service) => {
          const isSelected = selectedServices.includes(service.name);
          return (
            <div 
              key={service.id}
              onClick={() => toggleService(service.name)}
              className={`
                group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all duration-300
                border-2 bg-white
                ${isSelected 
                  ? 'border-[#e6c200] ring-1 ring-[#e6c200] scale-[0.98]' 
                  : 'border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02]'
                }
              `}
            >
              {/* Square Image Container */}
              <div className="relative aspect-square w-full bg-slate-100">
                <Image 
                  src={service.image || '/bundleA_3999.jpg'} 
                  alt={service.name || 'Service Image'}
                  fill
                  className={`object-cover transition-all duration-300 ${isSelected ? 'opacity-90' : 'opacity-100'}`}
                />
                
                {/* Selection Checkmark */}
                <div className={`
                  absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm z-10
                  ${isSelected ? 'bg-[#e6c200] scale-100' : 'bg-white/80 backdrop-blur scale-90 opacity-70'}
                `}>
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-[#202124]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  )}
                </div>

                {/* Price Tag Overlay */}
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg z-10">
                   <p className="text-[10px] font-bold text-white tracking-wide">{service.price}</p>
                </div>
              </div>

              {/* Info Below Square */}
              <div className="p-3 bg-white border-t border-slate-50 flex-1 flex flex-col justify-between">
                 <div>
                    <h3 className={`font-bold text-xs leading-tight mb-1 ${isSelected ? 'text-[#202124]' : 'text-slate-800'}`}>
                      {service.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {service.desc}
                    </p>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedServices.map((s, i) => (
        <input key={i} type="hidden" name="services" value={s} />
      ))}
    </div>
  );
}