'use client'

import { useActionState, useState, useEffect, useRef } from 'react';
import { submitBooking, getSlotAvailability, fetchAppConfig, lookupBooking, BookingState } from '@/app/actions';
import { FileText, Clock, Layers, Scissors, User, Loader2 } from 'lucide-react';

import SectionContainer from './booking/SectionContainer';
import StartHere from './booking/StartHere';
import BranchSelect from './booking/BranchSelect'; // New
import DateSelect from './booking/DateSelect';     // New
import TimeSlotGrid from './booking/TimeSlotGrid';
import SessionSelect from './booking/SessionSelect';
import ServiceList from './booking/ServiceList';
import GuestForm from './booking/GuestForm';
import Ticket from './booking/Ticket';

const initialState: BookingState = { success: false, message: '', refCode: '', data: undefined };

export default function BookingForm() {
  const [state, formAction, isPending] = useActionState(submitBooking, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [configLoaded, setConfigLoaded] = useState(false);
  const [branches, setBranches] = useState<any[]>([]); 
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  
  const [bookingType, setBookingType] = useState("New Appointment");
  const [refCode, setRefCode] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState("");
  
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [session, setSession] = useState("1ST");
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [maxCapacity, setMaxCapacity] = useState(4); 
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [guestData, setGuestData] = useState<any>(null); 

  useEffect(() => {
    async function init() {
      const res = await fetchAppConfig();
      if (res.success) {
        setBranches(res.data.branches || []);
        setTimeSlots(res.data.timeSlots || []);
        if (res.data.branches?.length > 0 && !selectedBranch) setSelectedBranch(res.data.branches[0].name);
      }
      setConfigLoaded(true);
    }
    init();
  }, []);

  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDate || !selectedBranch || !configLoaded) return;
      setLoadingSlots(true);
      try {
        const result = await getSlotAvailability(selectedDate, selectedBranch);
        if (result.success) {
          setSlotCounts(result.counts); 
          if (result.limit) setMaxCapacity(result.limit);
        }
      } catch (e) { console.error(e); } finally { setLoadingSlots(false); }
    }
    fetchSlots();
  }, [selectedDate, selectedBranch, configLoaded]);

  const handleLookup = async () => {
    setLookupLoading(true);
    setLookupMessage("");
    try {
      const res = await lookupBooking(refCode);
      if (res.success && res.data) {
        setLookupMessage("Booking Found!");
        const d = res.data;
        setSelectedBranch(d.branch);
        setSelectedDate(d.date);
        setSession(d.session);
        setGuestData(d); // Pre-fill guest data (includes ACK, MOP)
        // Note: Time and Services must be manually selected in UI if they are radio/checkboxes, 
        // or we need to pass pre-fill logic to those components. 
        // For now, GuestForm handles its part. 
        // We'll let user re-confirm Time/Service to be safe or update states if components support it.
      } else {
        setLookupMessage(res.message || "Not found.");
      }
    } catch (e) { setLookupMessage("Error searching."); } finally { setLookupLoading(false); }
  };

  if (state.success) {
    const ticketData = { ...state.data, type: bookingType, session: session };
    return <Ticket data={ticketData} refCode={state.refCode} />;
  }

  if (!configLoaded) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold">Loading...</div>;

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-xl space-y-8">
        
        {/* HEADER: LOGO & TITLE */}
        <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-top-4">
           <img src="/logo.jpg" alt="Logo" className="w-24 h-24 rounded-full shadow-lg border-4 border-white mb-4 object-cover"/>
           <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sisters & Brows</h1>
           <p className="text-slate-500 text-sm font-medium">Premium Aesthetics & Microblading</p>
        </div>

        <form ref={formRef} action={formAction} className="space-y-6">
          
          {/* SECTION 1: START HERE */}
          <SectionContainer title="Start Here" icon={<FileText className="w-4 h-4 text-[#e6c200]"/>}>
             <StartHere 
                bookingType={bookingType} setBookingType={setBookingType} 
                refCode={refCode} setRefCode={setRefCode} 
                onLookup={handleLookup} lookupLoading={lookupLoading} lookupMessage={lookupMessage}
             />
          </SectionContainer>

          {/* SECTION 2: BRANCH */}
          <BranchSelect branches={branches} selected={selectedBranch} onSelect={setSelectedBranch} />
          <input type="hidden" name="branch" value={selectedBranch} />

          {/* SECTION 3: DATE */}
          <DateSelect selected={selectedDate} onSelect={setSelectedDate} minDate={new Date().toISOString().split('T')[0]} />
          <input type="hidden" name="date" value={selectedDate} />

          {/* SECTION 4: TIME SLOTS */}
          <SectionContainer title="Available Slots" icon={<Clock className="w-4 h-4 text-[#e6c200]"/>}>
             <TimeSlotGrid timeSlots={timeSlots} slotCounts={slotCounts} loading={loadingSlots} selectedDate={selectedDate} maxCapacity={maxCapacity} />
          </SectionContainer>

          {/* SECTION 5: SESSION TYPE */}
          <SectionContainer title="Session Type" icon={<Layers className="w-4 h-4 text-[#e6c200]"/>}>
             <SessionSelect selected={session} onSelect={setSession} />
             <input type="hidden" name="session" value={session} />
          </SectionContainer>

          {/* SECTION 6: SERVICES */}
          {session !== 'CONSULTATION' && (
            <SectionContainer title="Services" icon={<Scissors className="w-4 h-4 text-[#e6c200]"/>}>
               <ServiceList />
            </SectionContainer>
          )}

          {/* SECTION 7: PERSONAL DETAILS (Includes MOP & ACK) */}
          <SectionContainer title="Personal Details" icon={<User className="w-4 h-4 text-[#e6c200]"/>}>
             <GuestForm initialData={guestData} />
          </SectionContainer>

          {/* HIDDEN FIELDS */}
          <input type="hidden" name="type" value={bookingType} />
          {bookingType === 'Reschedule' && <input type="hidden" name="oldRefCode" value={refCode} />}

          {/* CONFIRMATION */}
          <div className="pt-2 pb-6">
            <label className="flex gap-3 cursor-pointer group p-2 mb-4">
                <input type="checkbox" name="agreement" required className="mt-0.5 w-4 h-4 text-[#202124] rounded border-slate-300 focus:ring-[#202124]" />
                <span className="text-xs text-slate-500 font-medium group-hover:text-slate-700 transition-colors">
                  I confirm all the details are correct.
                </span>
            </label>

            <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-[#202124] text-[#e6c200] font-bold text-lg py-4 rounded-2xl shadow-xl hover:bg-black hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-70 uppercase tracking-widest"
            >
               {isPending ? <Loader2 className="w-5 h-5 animate-spin"/> : "Confirm Booking"}
            </button>
          </div>
        </form>
        
        <div className="text-center pb-8 opacity-40">
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sisters & Brows 2026</p>
        </div>
      </div>
    </div>
  );
}