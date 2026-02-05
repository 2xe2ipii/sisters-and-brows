'use client'

import { useRef, useState } from 'react';
import { MapPin, Download, Loader2, CheckCircle2, Phone, Users, RefreshCw, Calendar, Clock, Facebook, Camera } from 'lucide-react';
import Image from 'next/image';
import { toPng } from 'html-to-image';

interface TicketProps {
  data: any;
  refCode: string;
}

// Branch Configuration (Color & Name Mapping)
const getBranchStyle = (rawName: string) => {
    const n = (rawName || "").toLowerCase();
    
    // Using 60-30-10 Rule: 
    // color = The main accent (30%)
    // border = The border color (30%)
    // bgLight = Very subtle tint for backgrounds if needed
    
    if (n.includes('parañaque') || n.includes('paranaque')) {
        return { 
            name: "Parañaque", 
            color: "text-orange-600", 
            border: "border-orange-200",
            bg: "bg-orange-600",
            light: "bg-orange-50"
        };
    }
    if (n.includes('lipa')) {
        return { 
            name: "Lipa City", 
            color: "text-blue-600", 
            border: "border-blue-200",
            bg: "bg-blue-600",
            light: "bg-blue-50"
        };
    }
    if (n.includes('san pablo')) {
        return { 
            name: "San Pablo", 
            color: "text-yellow-600", 
            border: "border-yellow-200",
            bg: "bg-yellow-500",
            light: "bg-yellow-50"
        };
    }
    if (n.includes('novaliches')) {
        return { 
            name: "Novaliches", 
            color: "text-violet-600", 
            border: "border-violet-200",
            bg: "bg-violet-600",
            light: "bg-violet-50"
        };
    }
    if (n.includes('dasmariñas') || n.includes('dasmarinas')) {
        return { 
            name: "Dasmariñas", 
            color: "text-cyan-600", 
            border: "border-cyan-200",
            bg: "bg-cyan-500",
            light: "bg-cyan-50"
        };
    }
    if (n.includes('taguig')) {
        return { 
            name: "Taguig", 
            color: "text-emerald-600", 
            border: "border-emerald-200",
            bg: "bg-emerald-600",
            light: "bg-emerald-50"
        };
    }

    // Default
    return { 
        name: rawName || "Main Branch", 
        color: "text-zinc-800", 
        border: "border-zinc-200",
        bg: "bg-zinc-800",
        light: "bg-zinc-50"
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
  const fbName = data?.fbLink || get('FACEBOOK NAME') || get('facebookName') || "N/A";

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
        backgroundColor: '#f8fafc' // Slight slate background for the image to separate from white
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
      
      {/* --- TICKET COMPONENT --- */}
      <div 
        ref={ticketRef} 
        className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl overflow-hidden relative flex flex-col mb-4"
      >
        
        {/* --- 1. ACTION INSTRUCTION BANNER (MINIMALIST) --- */}
        <div className={`${branchInfo.bg} text-white p-4 text-center`}>
            <span className="text-sm font-black uppercase tracking-widest">
                Take a Screenshot & Send us a copy
            </span>
        </div>

        {/* --- 2. HEADER (HORIZONTAL - COMPACT) --- */}
        <div className="px-4 py-3 bg-slate-50 border-b-2 border-slate-200">
             <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                        Sisters & Brows
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5 uppercase tracking-wider">
                        Microblading Specialist
                    </p>
                </div>
                <div className="w-14 h-14 bg-slate-100 rounded-xl p-1 shadow-sm overflow-hidden border-2 border-slate-200 shrink-0">
                    <Image 
                        src="/logo.jpg" 
                        alt="Logo" 
                        width={56} 
                        height={56} 
                        className="object-cover w-full h-full rounded-lg" 
                    />
                </div>
             </div>
        </div>

        {/* --- 2B. BOOKING CONFIRMED (FULL WIDTH) --- */}
        <div className={`${branchInfo.light} p-3 text-center border-t border-b border-slate-200`}>
            <div className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className={`w-4 h-4 ${branchInfo.color}`} strokeWidth={3} />
                <span className={`text-xs font-bold uppercase tracking-wider ${branchInfo.color}`}>
                    Booking Confirmed
                </span>
            </div>
        </div>

        {/* --- 3. DATE, TIME, BRANCH --- */}
        <div className="px-4 pt-3 bg-white">
            <div className="grid grid-cols-2 gap-3 mb-3">
                 {/* Date */}
                 <div className="bg-white rounded-xl p-3 border-2 border-slate-200 flex items-center gap-2 shadow-sm">
                    <Calendar className="w-5 h-5 text-slate-900" />
                    <p className="text-base font-black text-slate-900 leading-tight">
                        {formatTicketDate(get('date') || get('DATE'))}
                    </p>
                 </div>

                 {/* Time */}
                 <div className="bg-white rounded-xl p-3 border-2 border-slate-200 flex items-center gap-2 shadow-sm">
                    <Clock className="w-5 h-5 text-slate-900" />
                    <p className="text-base font-black text-slate-900 leading-tight">
                        {get('time') || get('TIME')}
                    </p>
                 </div>
            </div>

            {/* Branch */}
            <div className="bg-white rounded-xl p-3 border-2 border-slate-200 flex items-center gap-3 shadow-sm">
                 <MapPin className="w-5 h-5 text-slate-900" strokeWidth={2.5} />
                 <p className={`${branchInfo.color} text-2xl font-black leading-none tracking-tight`}>
                    {branchInfo.name}
                 </p>
            </div>
        </div>

        {/* --- 4. CUSTOMER DETAILS (CLEAN & MINIMAL) --- */}
        <div className="px-4 pt-3 bg-white">
            <div className="bg-white rounded-xl p-4 border-2 border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Guest
                </p>
                <p className="font-black text-slate-900 text-2xl leading-none mb-3">
                    {fullName}
                </p>
                
                {/* Contact Info */}
                <div className="space-y-2 text-base mb-3">
                    {/* Mobile */}
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile</span>
                        <span className="font-bold text-slate-900">
                            {get('phone') || get('Contact Number') || get('CONTACT NUMBER')}
                        </span>
                    </div>
                    
                    {/* Facebook */}
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Facebook</span>
                        <span className="font-bold text-slate-900 text-right max-w-xs break-word">
                            {fbName}
                        </span>
                    </div>
                </div>

                {/* Companions */}
                {companionsDisplay && (
                    <div className="pt-3 border-t border-slate-100">
                        <div className="flex justify-between items-center text-base">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">With</span>
                            <span className="font-bold text-slate-900 text-right">
                                {companionsDisplay}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* --- 5. SERVICE & SESSION (ONE BOX) --- */}
        <div className="px-4 pt-3 bg-white">
            <div className="bg-white rounded-xl p-4 border-2 border-slate-200 shadow-sm">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Service</p>
                        <p className="font-bold text-slate-900 text-base leading-snug break-words">
                            {services}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Session</p>
                        <p className={`font-bold text-base ${branchInfo.color}`}>
                            {get('session') || get('SESSION') || "Standard"}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* --- 6. REFERENCE ID (FULL WIDTH) --- */}
        <div className="pt-3 bg-white">
            <div className="bg-slate-900 p-4 text-center relative">
                 <div className="relative z-10">
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1 font-bold">
                        Reference ID
                    </p>
                    <p className="text-3xl font-mono font-black text-white tracking-[0.15em]">
                        {refCode}
                    </p>
                 </div>
            </div>
        </div>

      </div>

      {/* --- ACTION BUTTONS --- */}
      <div className="w-full max-w-[400px] space-y-3">
          <button 
            onClick={handleDownload} 
            disabled={downloading} 
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {downloading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Generating...</span>
                </>
            ) : (
                <>
                    <Download className="w-5 h-5" />
                    <span>Save to Gallery</span>
                </>
            )}
          </button>

          <button 
            onClick={handleReload}
            className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl border-2 border-slate-300 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Book Another</span>
          </button>
      </div>

    </div>
  );
}