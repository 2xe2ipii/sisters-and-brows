'use client'

import { useActionState, useState, useEffect, useRef } from 'react';
import { submitBooking, getSlotAvailability, fetchAppConfig, lookupBooking } from '@/app/actions';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

import StartHere from './booking/StartHere';
import LocationDate from './booking/LocationDate';
import TimeSlotGrid from './booking/TimeSlotGrid';
import SessionSelect from './booking/SessionSelect';
import ServiceList from './booking/ServiceList';
import GuestForm from './booking/GuestForm';
import ReviewSummary from './booking/ReviewSummary';
import Ticket from './booking/Ticket';

// [FIX] Add refCode to initial state definition
const initialState = {
  success: false,
  message: '',
  refCode: '' 
};

export default function BookingForm() {
  const [state, formAction, isPending] = useActionState(submitBooking, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [step, setStep] = useState<'FORM' | 'REVIEW'>('FORM');
  const [reviewData, setReviewData] = useState<any>(null);
  
  // --- CONFIG ---
  const [configLoaded, setConfigLoaded] = useState(false);
  const [branches, setBranches] = useState<any[]>([]); 
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  
  // --- FORM STATE ---
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

  const [formError, setFormError] = useState("");
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function init() {
      const res = await fetchAppConfig();
      if (res.success) {
        setBranches(res.data.branches || []);
        setTimeSlots(res.data.timeSlots || []);
        if (res.data.branches?.length > 0 && !selectedBranch) {
            setSelectedBranch(res.data.branches[0].name);
        }
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
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [selectedDate, selectedBranch, configLoaded]);

  // --- LOOKUP HANDLER ---
  const handleLookup = async () => {
    setLookupLoading(true);
    setLookupMessage("");
    try {
      const res = await lookupBooking(refCode);
      if (res.success && res.data) {
        setLookupMessage("Booking Found! Details loaded.");
        const d = res.data;
        // Pre-fill State
        setSelectedBranch(d.branch);
        setSelectedDate(d.date);
        setSession(d.session || "1ST");
        setGuestData({
          firstName: d.firstName,
          lastName: d.lastName,
          phone: d.phone,
          fbLink: d.fbLink,
        });
      } else {
        setLookupMessage(res.message || "Not found.");
      }
    } catch (e) {
      setLookupMessage("Error searching.");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleProceed = () => {
    setFormError("");

    if (!selectedBranch) {
      setFormError("Please select a branch.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!selectedDate) {
      setFormError("Please select a date for your appointment.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (formRef.current && formRef.current.checkValidity()) {
      const formData = new FormData(formRef.current);
      
      if (session !== 'CONSULTATION') {
        const services = formData.getAll('services');
        if (services.length === 0) {
          setFormError("Please select at least one service.");
          return;
        }
      }

      const data = {
        type: bookingType, 
        refCode: refCode, 
        branch: selectedBranch,
        date: selectedDate,
        time: formData.get('time'),
        services: session === 'CONSULTATION' ? ['Consultation Only'] : formData.getAll('services'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        phone: formData.get('phone'),
        fbLink: formData.get('fbLink'),
        session: session, 
        others: formData.get('others'),
        ack: formData.get('ack'),
        mop: formData.get('mop'),
      };
      setReviewData(data);
      setStep('REVIEW');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      formRef.current?.reportValidity();
    }
  };

  if (state.success) {
    // [FIX] Pass refCode from state to Ticket
    return <Ticket data={reviewData || {}} refCode={state.refCode} />;
  }

  if (!configLoaded) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold">Loading booking system...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-xl space-y-8">
        
        {step === 'FORM' && (
          <div className="pl-2 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
                 <Sparkles className="w-4 h-4 text-rose-500" /> Official Booking
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Sisters & Brows</h1>
              <p className="text-slate-600 leading-relaxed">
                Premium Aesthetics & Microblading Services.
              </p>
          </div>
        )}

        <form ref={formRef} action={formAction} className="space-y-6" noValidate={step === 'REVIEW'}>
          
          {/* ERRORS */}
          {!state.success && state.message && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-bold">{state.message}</div>
            </div>
          )}
          {formError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-bold">{formError}</div>
            </div>
          )}

          <div className={step === 'FORM' ? 'space-y-6 block animate-in fade-in duration-300' : 'hidden'}>
            
            <StartHere 
              bookingType={bookingType} 
              setBookingType={setBookingType} 
              refCode={refCode}
              setRefCode={setRefCode}
              onLookup={handleLookup}
              lookupLoading={lookupLoading}
              lookupMessage={lookupMessage}
            />

            <LocationDate 
              branches={branches}
              selectedBranch={selectedBranch}
              setSelectedBranch={setSelectedBranch}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              minDate={today}
            />
            
            {/* HIDDEN INPUTS */}
            <input type="hidden" name="branch" value={selectedBranch} />
            <input type="hidden" name="date" value={selectedDate} />
            <input type="hidden" name="session" value={session} />
            {bookingType === 'Reschedule' && <input type="hidden" name="oldRefCode" value={refCode} />}

            <TimeSlotGrid 
              timeSlots={timeSlots}
              slotCounts={slotCounts} 
              loading={loadingSlots} 
              selectedDate={selectedDate}
              maxCapacity={maxCapacity} 
            />

            <SessionSelect selected={session} onSelect={setSession} />

            {session !== 'CONSULTATION' && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <ServiceList />
              </div>
            )}

            {/* Pass initialData to GuestForm for pre-filling */}
            <GuestForm initialData={guestData} />

            <label className="flex gap-3 cursor-pointer group p-2">
                <input type="checkbox" name="agreement" required className="mt-0.5 w-4 h-4 text-rose-500 rounded border-slate-300 focus:ring-rose-500" />
                <span className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors font-medium">
                  I confirm the details are correct and authorize Sisters & Brows to contact me.
                </span>
            </label>

            <button type="button" onClick={handleProceed} className="w-full bg-[#0f172a] text-white font-bold text-lg py-4 rounded-2xl shadow-xl hover:bg-slate-900 hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
               Review Booking <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {step === 'REVIEW' && (
             <ReviewSummary 
                data={reviewData} 
                onEdit={() => setStep('FORM')} 
             />
          )}
        </form>
        
        <div className="text-center pb-8 opacity-40">
           <p className="text-sm font-bold text-slate-900">Sisters & Brows</p>
           <p className="text-[10px] text-slate-500 mt-0.5 lowercase">developed by 2xe2ipi</p>
        </div>
      </div>
    </div>
  );
}