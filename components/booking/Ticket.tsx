'use client'

import { useRef, useState } from 'react';
import { MapPin, Calendar, Clock, User, Scissors, Download, Loader2, CheckCircle2, Ticket as TicketIcon } from 'lucide-react';
import Image from 'next/image';
import { toPng } from 'html-to-image';

interface TicketProps {
  data: any;
  refCode: string;
}

// Branch Configuration
const BRANCH_CONFIG: Record<string, { name: string; color: string; text: string }> = {
  "PQ": { name: "Parañaque", color: "bg-orange-500", text: "text-orange-600" },
  "LP": { name: "Lipa City", color: "bg-blue-600", text: "text-blue-600" },
  "SP": { name: "San Pablo", color: "bg-yellow-500", text: "text-yellow-700" }, // Darker text for yellow contrast
  "NV": { name: "Novaliches", color: "bg-violet-600", text: "text-violet-600" },
  "DM": { name: "Dasmariñas", color: "bg-cyan-400", text: "text-cyan-700" },
  "TG": { name: "Taguig", color: "bg-green-600", text: "text-green-600" },
};

export default function Ticket({ data, refCode }: TicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!data) return null;

  // Helper to safely get data keys (handles inconsistent casing from sheets)
  const get = (key: string) => data[key] || data[key.toUpperCase()] || data[key.toLowerCase()] || "";

  // Branch Logic
  const rawBranch = get('BRANCH');
  const branchInfo = BRANCH_CONFIG[rawBranch] || { name: rawBranch, color: "bg-zinc-800", text: "text-zinc-800" };

  // Parse Companions
  let companions = "";
  try {
     const rawOthers = get('others') || get('COMPANIONS');
     if (rawOthers) {
        if (rawOthers.startsWith('[')) {
            const parsed = JSON.parse(rawOthers);
            if (Array.isArray(parsed) && parsed.length > 0) companions = parsed.join(', ');
        } else {
            companions = rawOthers;
        }
     }
  } catch (e) { companions = ""; }

  // Parse Services
  let services = get('SERVICES') || 'Consultation';
  if (services.startsWith('[')) {
      try { services = JSON.parse(services).join(', '); } catch {}
  }

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    try {
      setDownloading(true);
      // Increased pixelRatio for crisper text on the generated image
      const dataUrl = await toPng(ticketRef.current, { cacheBust: true, pixelRatio: 4 });
      const link = document.createElement('a');
      link.download = `SistersBrows_${refCode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert("Please screenshot manually.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center pt-4 pb-10 px-4 font-sans bg-slate-50 min-h-screen">
      
      {/* --- TICKET CONTAINER --- */}
      <div 
        ref={ticketRef} 
        className="w-full max-w-[360px] bg-white rounded-3xl shadow-2xl overflow-hidden relative isolate"
      >
        {/* 1. COMPACT HEADER */}
        <div className={`${branchInfo.color} p-4 flex items-center justify-between relative overflow-hidden`}>
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
            
            <div className="flex items-center gap-3 z-10">
                <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-white font-black uppercase tracking-wider text-sm leading-tight">Booking Confirmed</h1>
                    <p className="text-white/80 text-[10px] font-medium">Sisters & Brows</p>
                </div>
            </div>
            
            {/* Logo Watermark */}
             <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md z-10">
                 <Image src="/logo.jpg" alt="Logo" width={40} height={40} className="rounded-full object-cover w-full h-full" />
             </div>
        </div>

        {/* 2. MAIN BODY */}
        <div className="bg-white p-5 pt-6 space-y-6 relative">
            
            {/* Date & Time Row (HUGE TEXT) */}
            <div className="flex items-start justify-between">
                <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3" /> Date
                    </span>
                    <span className="text-3xl font-black text-slate-800 tracking-tight leading-none">
                        {get('DATE').split('-')[0]} {/* Example: Feb */}
                        <span className={`${branchInfo.text} ml-1`}>{get('DATE').split('-')[1]}</span>
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[11px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3" /> Time
                    </span>
                    <span className="text-3xl font-black text-slate-800 tracking-tight leading-none">
                        {get('TIME')}
                    </span>
                </div>
            </div>

            {/* Branch (HUGE TEXT) */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3" /> Branch
                </span>
                <span className={`text-2xl font-black ${branchInfo.text} leading-none block`}>
                    {branchInfo.name}
                </span>
            </div>

            {/* Dashed Separator with Cutouts */}
            <div className="relative flex items-center justify-center my-2">
                <div className="absolute left-[-28px] w-6 h-6 bg-slate-50 rounded-full"></div>
                <div className="w-full border-t-2 border-dashed border-slate-200"></div>
                <div className="absolute right-[-28px] w-6 h-6 bg-slate-50 rounded-full"></div>
            </div>

            {/* Client Details */}
            <div className="space-y-4">
                <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-1 mb-1">
                        <User className="w-3 h-3" /> Guest Name
                    </span>
                    <p className="text-xl font-extrabold text-slate-900 leading-tight">
                        {get('FULL NAME')}
                    </p>
                    {companions && (
                         <p className="text-xs font-medium text-slate-500 mt-1">
                            <span className="font-bold text-slate-700">+ Companions:</span> {companions}
                         </p>
                    )}
                </div>

                <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-1 mb-1">
                        <Scissors className="w-3 h-3" /> Service
                    </span>
                    <p className="text-lg font-bold text-slate-800 leading-snug">
                        {services}
                    </p>
                </div>
            </div>
        </div>

        {/* 3. FOOTER (Ref ID) */}
        <div className="bg-slate-100 p-3 flex flex-col items-center justify-center border-t border-slate-200 border-dashed">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Reference ID</p>
            <p className="text-sm font-mono font-medium text-slate-500 tracking-widest select-all">
                {refCode}
            </p>
        </div>
      </div>

      {/* --- ACTION BUTTON --- */}
      <button 
        onClick={handleDownload} 
        disabled={downloading} 
        className="mt-6 w-full max-w-[360px] bg-[#202124] text-[#e6c200] font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        {downloading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Download className="w-5 h-5" />}
        Save Ticket to Gallery
      </button>

    </div>
  );
}