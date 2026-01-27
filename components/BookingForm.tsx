'use client'

import { useActionState, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { submitBooking, getSlotAvailability, fetchAppConfig, lookupBooking, BookingState } from '@/app/actions';
import { Sparkles, AlertCircle, Layers, Scissors, User } from 'lucide-react';

import StartHere from './booking/StartHere';
import BranchSelect from './booking/BranchSelect';
import DateSelect from './booking/DateSelect';
import TimeSlotGrid from './booking/TimeSlotGrid';
import SessionSelect from './booking/SessionSelect';
import ServiceList from './booking/ServiceList';
import GuestForm from './booking/GuestForm';
import SpecialRequests from './booking/SpecialRequests';
import Ticket from './booking/Ticket';
import SectionContainer from './booking/SectionContainer';

const initialState: BookingState = {
  success: false,
  message: '',
  refCode: '',
  data: undefined 
};

export default function BookingForm() {
  const [state, formAction, isPending] = useActionState(submitBooking, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [configLoaded, setConfigLoaded] = useState(false);
  const [branches, setBranches] = useState<any[]>([]); 
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  
  // State for Booking
  const [bookingType, setBookingType] = useState("New Appointment");
  const [refCode, setRefCode] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState("");
  const [bookingFound, setBookingFound] = useState(false); 
  
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [session, setSession] = useState("1ST");
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [maxCapacity, setMaxCapacity] = useState(4); 
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [guestData, setGuestData] = useState<any>(null); 
  const [formError, setFormError] = useState("");
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function init() {
      const res = await fetchAppConfig();
      if (res.success) {
        setBranches(res.data.branches || []);
        setTimeSlots(res.data.timeSlots || []);
        if (res.data.branches?.length > 0) setSelectedBranch(res.data.branches[0].name);
      }
      setConfigLoaded(true);
    }
    init();
  }, []);

  useEffect(() => {
    setSelectedTime(""); 
    async function fetchSlots() {
      if (!selectedDate || !selectedBranch || !configLoaded) return;
      setLoadingSlots(true);
      try {
        const result = await getSlotAvailability(selectedDate, selectedBranch);
        if (result.success) {
          setSlotCounts(result.counts);
          if (result.limit) setMaxCapacity(result.limit);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [selectedDate, selectedBranch, configLoaded]);

  const handleTypeChange = (newType: string) => {
    setBookingType(newType);
    if (newType === "New Appointment") {
      setBookingFound(false);
      setRefCode("");
      setLookupMessage("");
      setGuestData(null);
      setSelectedDate("");
      setSelectedTime("");
      if (branches.length > 0) setSelectedBranch(branches[0].name);
    }
  };

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
        setSession(d.session || "1ST");
        setGuestData({
            firstName: d.firstName,
            lastName: d.lastName,
            phone: d.phone,
            fbLink: d.fbLink,
        });
        setBookingFound(true);
      } else {
        setLookupMessage(res.message || "Not found.");
        setBookingFound(false);
      }
    } catch (e) {
      setLookupMessage("Error searching.");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    setFormError("");
    if (!selectedBranch || !selectedDate || !selectedTime) {
       e.preventDefault();
       setFormError("Please complete all selection steps.");
       window.scrollTo({ top: 0, behavior: 'smooth' });
       return;
    }
    if (formRef.current) {
      if (session !== 'CONSULTATION') {
         const formData = new FormData(formRef.current);
         const services = formData.getAll('services');
         if (services.length === 0) {
            e.preventDefault();
            setFormError("Please select at least one service.");
            return;
         }
      }
      if (!formRef.current.checkValidity()) {
         e.preventDefault();
         formRef.current.reportValidity();
         return;
      }
    }
  };

  if (state.success) {
    return <Ticket data={state.data || {}} refCode={state.refCode} />;
  }

  if (!configLoaded) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold">Loading booking system...</div>;
  }

  const showMainForm = bookingType === "New Appointment" || (bookingType === "Reschedule" && bookingFound);

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-xl space-y-6">
        
        {/* COMPACT GRADIENT HEADER - Using specific Dark Hex #202124 */}
        <div className="bg-gradient-to-r from-[#202124] to-[#35363a] p-4 rounded-2xl shadow-lg border border-slate-700 flex items-center gap-5 animate-in fade-in slide-in-from-top-4 duration-500 text-white">
            <div className="relative w-16 h-16 shrink-0 rounded-full overflow-hidden border-2 border-[#e6c200] shadow-sm">
                <Image 
                  src="/logo.jpg" 
                  alt="Logo" 
                  fill
                  className="object-cover"
                  priority
                />
            </div>
            <div className="flex flex-col">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-[#e6c200] uppercase">
                    <Sparkles className="w-3 h-3" /> Official Booking
                </div>
                <h1 className="text-xl font-extrabold text-white leading-tight">Sisters & Brows</h1>
                <p className="text-xs text-slate-400 font-medium">Premium Aesthetics & Microblading Services</p>
            </div>
        </div>

        <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="space-y-6" noValidate>
          
          {!state.success && state.message && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-bold">{state.message}</div>
            </div>
          )}
          {formError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-bold">{formError}</div>
            </div>
          )}

          <div className="space-y-6 block animate-in fade-in duration-300">
            
            <StartHere 
               bookingType={bookingType} 
               setBookingType={handleTypeChange} 
               refCode={refCode}
               setRefCode={setRefCode}
               onLookup={handleLookup}
               lookupLoading={lookupLoading}
               lookupMessage={lookupMessage}
            />

            {showMainForm && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <BranchSelect 
                       branches={branches}
                       selected={selectedBranch}
                       onSelect={setSelectedBranch}
                    />

                    <DateSelect 
                       selected={selectedDate}
                       onSelect={setSelectedDate}
                       minDate={today}
                    />
                    
                    <input type="hidden" name="branch" value={selectedBranch} />
                    <input type="hidden" name="date" value={selectedDate} />
                    <input type="hidden" name="session" value={session} />
                    <input type="hidden" name="type" value={bookingType} />
                    {bookingType === 'Reschedule' && <input type="hidden" name="oldRefCode" value={refCode} />}

                    <TimeSlotGrid 
                      timeSlots={timeSlots}
                      slotCounts={slotCounts} 
                      loading={loadingSlots} 
                      selectedDate={selectedDate}
                      maxCapacity={maxCapacity} 
                      onSelectTime={setSelectedTime}
                    />

                    {selectedTime ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <SectionContainer title="Session Type" icon={<Layers className="w-4 h-4 text-[#e6c200]" />}>
                                <SessionSelect selected={session} onSelect={setSession} />
                            </SectionContainer>

                            {session !== 'CONSULTATION' && (
                                <SectionContainer title="Services" icon={<Scissors className="w-4 h-4 text-[#e6c200]" />}>
                                    <ServiceList />
                                </SectionContainer>
                            )}

                            <SectionContainer title="Personal Details" icon={<User className="w-4 h-4 text-[#e6c200]" />}>
                                <GuestForm initialData={guestData} /> 
                            </SectionContainer>
                            
                            <SpecialRequests />

                            <label className="flex gap-3 cursor-pointer group p-2">
                                <input type="checkbox" name="agreement" required className="mt-0.5 w-4 h-4 text-[#e6c200] rounded border-slate-300 focus:ring-[#e6c200] accent-[#e6c200]" />
                                <span className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors font-medium">
                                I confirm the details are correct and authorize Sisters & Brows to contact me.
                                </span>
                            </label>

                            <button 
                                type="submit" 
                                disabled={isPending}
                                className="w-full bg-[#202124] text-[#e6c200] font-bold text-lg py-4 rounded-2xl shadow-xl hover:bg-black hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed border border-[#35363a]"
                            >
                                {isPending ? 'Processing...' : 'Confirm Booking'}
                            </button>
                        </div>
                    ) : (
                        selectedDate && !loadingSlots && (
                            <div className="text-center py-12 opacity-50">
                                <p className="text-sm font-medium text-slate-400">Select a time slot to continue...</p>
                            </div>
                        )
                    )}
                </div>
            )}

          </div>

        </form>
        
        <div className="text-center pb-8 opacity-40">
           <p className="text-sm font-bold text-slate-900">Sisters & Brows</p>
           <p className="text-[10px] text-slate-500 mt-0.5 lowercase">developed by 2xe2ipi</p>
        </div>
      </div>
    </div>
  );
}