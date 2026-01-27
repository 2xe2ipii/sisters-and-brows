'use client'

import { useRef, useState } from 'react';
import { CheckCircle2, MapPin, Sparkles, Copy, Scissors, Package, CreditCard, User, Download, Plus, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toPng } from 'html-to-image';

interface TicketProps {
  data: any;
  refCode: string;
}

export default function Ticket({ data, refCode }: TicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!data) return null;

  // Helper to safely get data
  const get = (key: string) => data[key] || data[key.toUpperCase()] || data[key.toLowerCase()] || "";

  const servicesRaw = get('SERVICES');
  const services = servicesRaw ? servicesRaw.split(',') : [];
  const isReschedule = get('TYPE') === 'Reschedule';

  // --- DOWNLOAD FUNCTIONALITY (Updated for html-to-image) ---
  const handleDownload = async () => {
    if (!ticketRef.current) return;

    try {
      setDownloading(true);
      
      // toPng uses the browser's native rendering, so it supports Tailwind v4's oklab/oklch colors
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        backgroundColor: '#f8fafc', // Force background color
        pixelRatio: 3, // High resolution (3x)
      });
        
      const link = document.createElement('a');
      link.download = `SistersBrows_Ticket_${refCode}.png`;
      link.href = dataUrl;
      link.click();

    } catch (err) {
      console.error("Download failed:", err);
      alert("Could not generate image. Please take a screenshot manually.");
    } finally {
      setDownloading(false);
    }
  };

  const handleNewBooking = () => {
    window.location.reload();
  };

  return (
    // Outer container
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center pt-12 px-4 font-sans pb-12">
      
      {/* TICKET CONTAINER */}
      <div ref={ticketRef} className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#f1f5f9] relative mb-8">
        
        {/* TOP: BRAND HEADER */}
        <div className="bg-[#202124] py-5 px-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full border-4 border-white/20"></div>
                <div className="absolute left-[-20px] bottom-[-20px] w-16 h-16 rounded-full border-4 border-white/20"></div>
            </div>

            <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border-2 border-[#e6c200] overflow-hidden relative shadow-lg shrink-0">
                   <Image 
                     src="/logo.jpg" 
                     alt="Logo" 
                     fill
                     className="object-cover"
                   />
                </div>
                <div>
                    <h1 className="text-[#e6c200] font-extrabold text-lg tracking-wide uppercase leading-none">Sisters & Brows</h1>
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                        <CheckCircle2 className="w-3 h-3 text-[#e6c200]" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                            {isReschedule ? 'Rescheduled' : 'Confirmed'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* MIDDLE: DETAILS */}
        <div className="p-6 space-y-5">
            
            {/* HERO ROW: Date & Time */}
            <div className="flex bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] overflow-hidden">
                <div className="flex-1 p-3 border-r border-[#e2e8f0] text-center">
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-1">Date</p>
                    <p className="text-lg font-black text-[#0f172a] leading-tight">{get('DATE')}</p>
                </div>
                <div className="flex-1 p-3 text-center bg-[#fffdf5]">
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-1">Time</p>
                    <p className="text-lg font-black text-[#202124] leading-tight">{get('TIME')}</p>
                </div>
            </div>

            {/* MAIN DETAILS GRID */}
            <div className="space-y-4">
                
                {/* Client Name */}
                <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <User className="w-3 h-3" /> Client Name
                    </p>
                    <p className="text-xl font-black text-[#0f172a]">{get('FULL NAME')}</p>
                    <p className="text-sm font-bold text-[#64748b]">{get('Contact Number')}</p>
                </div>

                <div className="w-full h-px bg-[#f1f5f9]"></div>

                {/* Branch & Session */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Branch
                        </p>
                        <p className="text-base font-extrabold text-[#1e293b]">{get('BRANCH')}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Session
                        </p>
                        <p className="text-base font-extrabold text-[#1e293b]">{get('SESSION')}</p>
                    </div>
                </div>

                {/* Services */}
                <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#f1f5f9]">
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Scissors className="w-3 h-3" /> Services
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {services.map((s: string, i: number) => (
                            <span key={i} className="inline-block bg-white border-b-2 border-[#e2e8f0] text-[#1e293b] text-xs font-bold px-2 py-1 rounded-md">
                                {s.trim()}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Admin Verification Box */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="border border-[#e2e8f0] rounded-xl p-3 flex flex-col justify-center">
                        <p className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Payment</p>
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#e6c200]" />
                            <p className="text-sm font-black text-[#0f172a]">{get('M O P')}</p>
                        </div>
                    </div>
                    <div className="border border-[#e2e8f0] rounded-xl p-3 flex flex-col justify-center">
                        <p className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">After Care</p>
                        <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-[#e6c200]" />
                            <p className="text-sm font-black text-[#0f172a]">{get('ACK?') === 'ACK' ? 'Yes (+Kit)' : 'No'}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* BOTTOM: CUTOUT SECTION */}
        <div className="relative bg-[#202124] py-4 px-6">
            {/* Cutout Circles */}
            <div className="absolute top-[-10px] left-[-10px] w-5 h-5 bg-[#f8fafc] rounded-full"></div>
            <div className="absolute top-[-10px] right-[-10px] w-5 h-5 bg-[#f8fafc] rounded-full"></div>
            
            <div className="absolute top-0 left-5 right-5 border-t-2 border-dashed border-white/20"></div>

            <div className="flex justify-between items-center mt-1">
                <div className="space-y-0.5">
                    <p className="text-[10px] text-[#e6c200] font-bold uppercase tracking-widest">Reference ID</p>
                    <p className="text-xl font-mono font-bold text-white tracking-widest">{refCode}</p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg border border-white/5">
                    <Copy className="w-5 h-5 text-[#e6c200]" />
                </div>
            </div>
        </div>
      </div>

      {/* --- ACTION BUTTONS --- */}
      <div className="flex flex-col w-full max-w-sm gap-3">
         
         <button 
           onClick={handleDownload}
           disabled={downloading}
           className="w-full bg-[#202124] text-[#e6c200] font-bold text-base py-4 rounded-2xl shadow-lg hover:bg-black hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
         >
           {downloading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Download className="w-5 h-5" />}
           Save Ticket
         </button>

         <button 
           onClick={handleNewBooking}
           className="w-full bg-white text-[#0f172a] font-bold text-base py-4 rounded-2xl border-2 border-[#e2e8f0] hover:bg-[#f8fafc] transition-all flex items-center justify-center gap-2"
         >
           <Plus className="w-5 h-5" />
           Make Another Booking
         </button>

         <p className="text-center text-[10px] text-[#94a3b8] mt-2">
            Tip: Screenshot if download fails.
         </p>
      </div>

    </div>
  );
}