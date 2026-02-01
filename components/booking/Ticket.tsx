'use client'

import { useRef, useState } from 'react';
import { MapPin, Download, Loader2, CheckCircle2, Phone, Users, RefreshCw, Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import { toPng } from 'html-to-image';

interface TicketProps {
  data: any;
  refCode: string;
}

// Branch Configuration (Color & Name Mapping)
const getBranchStyle = (rawName: string) => {
    const n = (rawName || "").toLowerCase();
    
    if (n.includes('parañaque') || n.includes('paranaque')) {
        return { 
            name: "Parañaque", 
            color: "bg-orange-500", 
            text: "text-orange-600", 
            border: "border-orange-300",
            accent: "bg-orange-50"
        };
    }
    if (n.includes('lipa')) {
        return { 
            name: "Lipa City", 
            color: "bg-blue-600", 
            text: "text-blue-600", 
            border: "border-blue-300",
            accent: "bg-blue-50"
        };
    }
    if (n.includes('san pablo')) {
        return { 
            name: "San Pablo", 
            color: "bg-yellow-400", 
            text: "text-yellow-700", 
            border: "border-yellow-300",
            accent: "bg-yellow-50"
        };
    }
    if (n.includes('novaliches')) {
        return { 
            name: "Novaliches", 
            color: "bg-violet-600", 
            text: "text-violet-600", 
            border: "border-violet-300",
            accent: "bg-violet-50"
        };
    }
    if (n.includes('dasmariñas') || n.includes('dasmarinas')) {
        return { 
            name: "Dasmariñas", 
            color: "bg-cyan-400", 
            text: "text-cyan-700", 
            border: "border-cyan-300",
            accent: "bg-cyan-50"
        };
    }
    if (n.includes('taguig')) {
        return { 
            name: "Taguig", 
            color: "bg-green-600", 
            text: "text-green-600", 
            border: "border-green-300",
            accent: "bg-green-50"
        };
    }

    // Default fallback
    return { 
        name: rawName || "Main Branch", 
        color: "bg-zinc-800", 
        text: "text-zinc-800", 
        border: "border-zinc-300",
        accent: "bg-zinc-50"
    };
}

// Date Formatter
const formatTicketDate = (dateStr: string) => {
    if (!dateStr) return "Invalid Date";
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) { 
        return dateStr; 
    }
};

export default function Ticket({ data, refCode }: TicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!data) return null;

  // --- DATA EXTRACTION ---
  const get = (key: string) => data[key] || data[key.toUpperCase()] || data[key.toLowerCase()] || "";
  
  const rawBranch = get('branch') || get('BRANCH') || "";
  const branchInfo = getBranchStyle(rawBranch);

  const firstName = get('firstName') || get('FULL NAME')?.split(' ')[0] || "";
  const lastName = get('lastName') || "";
  const fullName = get('FULL NAME') || `${firstName} ${lastName}`.trim();

  // Parse Companions
  let companionsList: string[] = [];
  try {
     const rawOthers = get('others') || get('COMPANIONS') || "[]";
     if (rawOthers.startsWith('[')) {
        companionsList = JSON.parse(rawOthers);
     } else if (rawOthers.includes(',')) {
        companionsList = rawOthers.split(',').map((s: string) => s.trim());
     } else if (rawOthers) {
        companionsList = [rawOthers];
     }
  } catch (e) {}
  
  // Format Companions with ampersand
  let companionsDisplay = "";
  if (companionsList.length > 0) {
      if (companionsList.length === 1) {
          companionsDisplay = companionsList[0];
      } else {
          const last = companionsList.pop();
          companionsDisplay = `${companionsList.join(', ')} & ${last}`;
      }
  }

  // Parse Services
  let services = get('services') || get('SERVICES') || "Consultation";
  if (services.startsWith('[')) {
      try { 
          const parsed = JSON.parse(services);
          services = parsed.join(', ');
      } catch {}
  } else {
       services = services.replace(/"/g, '');
  }

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(ticketRef.current, { 
        cacheBust: true, 
        pixelRatio: 3,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `SistersBrows_${refCode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
      alert("Download failed. Please screenshot manually.");
    } finally {
      setDownloading(false);
    }
  };

  const handleReload = () => {
      window.location.reload();
  };

  return (
    <div className="w-full flex flex-col items-center py-4 px-4 bg-slate-50 min-h-screen">
      
      {/* --- COMPACT TICKET COMPONENT --- */}
      <div 
        ref={ticketRef} 
        className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl overflow-hidden relative flex flex-col mb-4"
      >
        
        {/* 1. COMPACT HEADER */}
        <div className={`${branchInfo.color} p-4 relative overflow-hidden`}>
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,_rgba(255,255,255,0.5)_1px,_transparent_0)] bg-[length:16px_16px]"></div>

             <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                    <div>
                        <div className="text-white text-xs font-bold uppercase tracking-wider">
                            Confirmed
                        </div>
                        <h1 className="text-white text-lg font-black tracking-tight leading-none">
                            Sisters & Brows
                        </h1>
                    </div>
                </div>

                <div className="w-12 h-12 bg-white rounded-xl p-0.5 shadow-lg shrink-0 overflow-hidden">
                    <Image 
                        src="/logo.jpg" 
                        alt="Logo" 
                        width={48} 
                        height={48} 
                        className="object-cover w-full h-full rounded-lg" 
                    />
                </div>
             </div>
        </div>

        {/* 2. DATE, TIME, BRANCH - COMPACT GRID */}
        <div className={`p-4 ${branchInfo.accent}`}>
            <div className="grid grid-cols-2 gap-2 mb-3">
                 {/* Date */}
                 <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Date</span>
                    </div>
                    <p className="text-base font-black text-slate-900 leading-tight">
                        {formatTicketDate(get('date') || get('DATE'))}
                    </p>
                 </div>

                 {/* Time */}
                 <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Time</span>
                    </div>
                    <p className="text-base font-black text-slate-900 leading-tight">
                        {get('time') || get('TIME')}
                    </p>
                 </div>
            </div>

            {/* Branch */}
            <div className={`bg-white rounded-lg p-3 border-2 ${branchInfo.border}`}>
                 <div className="flex items-center gap-1 mb-1">
                    <MapPin className={`w-4 h-4 ${branchInfo.text}`} strokeWidth={2.5} />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Branch</span>
                 </div>
                 <p className={`${branchInfo.text} text-2xl font-black leading-none tracking-tight`}>
                    {branchInfo.name}
                 </p>
            </div>
        </div>

        {/* 3. SERVICE - EMPHASIZED BUT COMPACT */}
        <div className="px-4 pt-3 pb-4 bg-gradient-to-br from-slate-50 to-white border-y border-slate-100">
            <div className="text-center">
                <span className="inline-block text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">
                    Service
                </span>
                
                <p className="text-3xl font-black text-slate-900 leading-none tracking-tight mb-2 break-words">
                    {services}
                </p>

                <div className="inline-block px-3 py-1 rounded-lg bg-slate-900 text-[#e6c200] text-[10px] font-bold uppercase tracking-wide">
                    {get('session') || get('SESSION') || "Standard"}
                </div>
            </div>
        </div>

        {/* 4. CUSTOMER DETAILS - COMPACT */}
        <div className="p-4 space-y-3 bg-white">
            
            {/* Booking For */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-slate-600" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Booking For
                        </p>
                        <p className="font-black text-slate-900 text-lg leading-tight break-words">
                            {fullName}
                        </p>
                        
                        {/* Contact */}
                        <div className="mt-2 pt-2 border-t border-slate-200">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Contact
                            </p>
                            <p className="font-bold text-slate-800 text-base font-mono">
                                {get('phone') || get('Contact Number') || get('CONTACT NUMBER')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Companions - Conditional */}
            {companionsDisplay && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-slate-600" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Coming With
                            </p>
                            <p className="font-bold text-slate-800 text-sm leading-snug break-words">
                                {companionsDisplay}
                            </p>
                        </div>
                    </div>
                </div>
            )}

        </div>

        {/* 5. FOOTER - REF ID */}
        <div className="bg-slate-900 p-4 text-center relative">
             <div className="absolute inset-0 opacity-5 bg-[linear-gradient(45deg,transparent_48%,rgba(255,255,255,0.1)_49%,rgba(255,255,255,0.1)_51%,transparent_52%)] bg-[length:16px_16px]"></div>
             
             <div className="relative z-10">
                <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mb-2 font-bold">
                    Reference ID
                </p>
                <p className="text-2xl font-mono font-black text-[#e6c200] tracking-[0.15em]">
                    {refCode}
                </p>
             </div>
        </div>

      </div>

      {/* --- ACTION BUTTONS (Can scroll) --- */}
      <div className="w-full max-w-[400px] space-y-3">
          
          <button 
            onClick={handleDownload} 
            disabled={downloading} 
            className={`
                w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg 
                transition-all flex items-center justify-center gap-2 border border-slate-800
                ${downloading 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:bg-black active:scale-[0.98]'
                }
            `}
          >
            {downloading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" strokeWidth={2.5} />
                    <span className="text-slate-400">Generating...</span>
                </>
            ) : (
                <>
                    <Download className="w-5 h-5 text-[#e6c200]" strokeWidth={2.5} />
                    <span className="text-[#e6c200]">Save to Gallery</span>
                </>
            )}
          </button>

          <button 
            onClick={handleReload}
            className="w-full bg-white text-slate-700 font-bold py-4 rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" strokeWidth={2.5} />
            <span>Book Another</span>
          </button>

          <p className="text-center text-xs text-slate-500 mt-4 px-4">
            Save and send to admin for verification
          </p>
      </div>

    </div>
  );
}