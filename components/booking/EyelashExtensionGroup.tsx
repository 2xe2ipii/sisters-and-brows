import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, Check, ZoomIn, X } from 'lucide-react';

// The 8 eyelash extension variants - must match service IDs in googleSheets.ts
const EYELASH_VARIANTS = [
  { id: 'ee-classic', displayName: 'Classic', displayId: 'EE Classic', image: '/classic.png' },
  { id: 'ee-natural', displayName: 'Natural Look', displayId: 'EE Natural Look', image: '/natural_look.png' },
  { id: 'ee-wet', displayName: 'Wet Set', displayId: 'EE Wet Set', image: '/wet_set.png' },
  { id: 'ee-hybrid', displayName: 'Hybrid', displayId: 'EE Hybrid', image: '/hybrid.png' },
  { id: 'ee-whispy', displayName: 'Whispy', displayId: 'EE Whispy', image: '/whispy.png' },
  { id: 'ee-anime', displayName: 'Anime', displayId: 'EE Anime', image: '/anime.png' },
  { id: 'ee-wispy-volume', displayName: 'Wispy Volume', displayId: 'EE Wispy Volume', image: '/wispy_volume.png' },
  { id: 'ee-mega-volume', displayName: 'Mega Volume', displayId: 'EE Mega Volume', image: '/mega_volume.png' },
];

interface Service {
  id: string;
  name: string;
  price: string;
  image?: string;
}

interface EyelashExtensionGroupProps {
  services: Service[]; // Full list of services from sheet (to look up prices)
  isSelected: boolean; // Is any EE service in selectedServices?
  currentVariant?: string | null; // e.g., "EE Classic" (the actual service name)
  onSelect: (serviceName: string) => void; // Parent handles adding the EE service name
  onRemove: () => void; // Parent handles removing all EE services
}

export default function EyelashExtensionGroup({
  services,
  isSelected,
  currentVariant,
  onSelect,
  onRemove,
}: EyelashExtensionGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Helper: Find price for a specific service by ID from the loaded Google Sheet data
  const getPrice = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    return service ? service.price : 'Check Price'; 
  };

  const handleVariantClick = (e: React.MouseEvent, variant: typeof EYELASH_VARIANTS[0]) => {
    e.stopPropagation();
    if (currentVariant === variant.displayId) {
      // Deselect if clicking the already selected one
      onRemove();
    } else {
      // Select new variant - pass the display name (e.g., "EE Classic")
      onSelect(variant.displayId);
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={`
        border rounded-lg overflow-hidden transition-all duration-200
        ${isSelected 
          ? 'border-[#e6c200] bg-[#e6c200]/5 ring-1 ring-[#e6c200]' 
          : 'border-slate-200 bg-white hover:border-[#e6c200]/50'
        }
      `}
    >
      {/* IMAGE MODAL (LIGHTBOX) */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300"
          onClick={() => setPreviewImage(null)}
        >
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
            <X className="w-8 h-8" />
          </button>
          <div className="relative w-full max-w-2xl aspect-square rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>
             <Image 
               src={previewImage} 
               alt="Eyelash Extension Preview" 
               fill
               sizes="(max-width: 1280px) 100vw, 1280px"
               className="object-contain" 
               quality={100}
               unoptimized
               onError={(e) => {
                 e.currentTarget.src = '/eyelash.jpg';
               }}
             />
          </div>
        </div>
      )}

      {/* Main Card Header */}
      <div 
        className="flex cursor-pointer group"
        onClick={toggleExpand}
      >
        {/* Image */}
        <div className="relative w-24 h-24 shrink-0 bg-slate-100 group-hover:brightness-95 transition-all">
           <Image
             src="/eyelash.jpg"
             alt="Eyelash Extension"
             fill
             className="object-cover"
           />
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div className="flex justify-between items-start">
             <div>
                <h3 className={`font-bold text-sm ${isSelected ? 'text-[#202124]' : 'text-slate-800'}`}>
                  Eyelash Extension
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isSelected && currentVariant 
                    ? `Selected: ${currentVariant}`
                    : '8 styles available'
                  }
                </p>
             </div>
             
             <div className="flex items-center gap-2">
                {isSelected && (
                  <div className="flex items-center gap-1 bg-[#e6c200]/20 text-[#202124] px-2 py-1 rounded text-[10px] font-bold">
                    <Check className="w-3 h-3" />
                    <span>SELECTED</span>
                  </div>
                )}
                <ChevronDown 
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                />
             </div>
          </div>
          
          <div className="mt-2 text-[10px] text-[#e6c200] font-medium">
            {isExpanded ? 'Click images to preview, then select a style' : 'Click to view styles & prices'}
          </div>
        </div>
      </div>

      {/* Expandable Grid */}
      {isExpanded && (
        <div className="p-4 bg-white border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {EYELASH_VARIANTS.map((variant) => {
              const isActive = currentVariant === variant.displayId;
              
              return (
                <div key={variant.id} className="flex flex-col gap-2">
                  {/* Image with Zoom */}
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border-2 border-slate-200 hover:border-[#e6c200]/50 transition-all group cursor-pointer">
                    <Image
                      src={variant.image}
                      alt={variant.displayName}
                      fill
                      className="object-cover group-hover:brightness-110 transition-all"
                      onError={(e) => {
                        e.currentTarget.src = '/eyelash.jpg';
                      }}
                    />
                    {/* Zoom Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(variant.image);
                      }}
                      className="absolute bottom-1 left-1 p-1 bg-black/30 hover:bg-black/60 backdrop-blur-md rounded text-white/90 hover:text-white transition-all z-20 hover:scale-110"
                    >
                      <ZoomIn className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Selection Button */}
                  <button
                    onClick={(e) => handleVariantClick(e, variant)}
                    type="button"
                    className={`
                      flex flex-col items-start gap-1 p-2 rounded-lg border-2 text-left transition-all
                      ${isActive 
                        ? 'bg-[#202124] border-[#202124] text-white shadow-md' 
                        : 'bg-white border-slate-200 text-slate-700 hover:border-[#e6c200] hover:bg-slate-50'
                      }
                    `}
                  >
                    <span className="text-xs font-bold leading-tight">{variant.displayName}</span>
                    <span className={`text-[9px] font-semibold ${isActive ? 'text-[#e6c200]' : 'text-slate-500'}`}>
                      {getPrice(variant.id)}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}