'use client'

import { useActionState, useState, useEffect, useRef } from 'react';
import { submitBooking, getSlotAvailability, fetchAppConfig } from '@/app/actions';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

import StartHere from './booking/StartHere';
import LocationDate from './booking/LocationDate';
import TimeSlotGrid from './booking/TimeSlotGrid';
import ServiceList from './booking/ServiceList';
import GuestForm from './booking/GuestForm';
import ReviewSummary from './booking/ReviewSummary';
import Ticket from './booking/Ticket';

const initialState = {
  success: false,
  message: '',
};

export default function BookingForm() {
  // @ts-ignore
  const [state, formAction, isPending] = useActionState(submitBooking, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [step, setStep] = useState<'FORM' | 'REVIEW'>('FORM');
  const [reviewData, setReviewData] = useState<any>(null);
  
  // --- DYNAMIC DATA STATE ---
  const [configLoaded, setConfigLoaded] = useState(false);
  const [branches, setBranches] = useState<any[]>([]); // Array of { name, code, limit }
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  
  // --- FORM STATE ---
  const [bookingType, setBookingType] = useState("New Appointment");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [maxCapacity, setMaxCapacity] = useState(4); 
  const [loadingSlots, setLoadingSlots] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // 1. FETCH CONFIG ON MOUNT
  useEffect(() => {
    async function init() {
      const res = await fetchAppConfig();
      if (res.success) {
        setBranches(res.data.branches || []);
        setTimeSlots(res.data.timeSlots || []);
        
        // Set default branch if available
        if (res.data.branches && res.data.branches.length > 0) {
          setSelectedBranch(res.data.branches[0].name);
        }
      }
      setConfigLoaded(true);
    }
    init();
  }, []);

  // 2. FETCH SLOTS WHEN DATE/BRANCH CHANGES
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDate || !selectedBranch || !configLoaded) return;
      setLoadingSlots(true);
      try {
        const result = await getSlotAvailability(selectedDate, selectedBranch);
        if (result.success) {
          setSlotCounts(result.counts);
          // Use the limit returned from server, or fallback to config
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

  const handleProceed = () => {
    if (formRef.current && formRef.current.checkValidity()) {
      const formData = new FormData(formRef.current);
      const data = {
        type: formData.get('type'),
        branch: selectedBranch,
        date: selectedDate,
        time: formData.get('time'),
        services: formData.getAll('services'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        phone: formData.get('phone'),
        fbLink: formData.get('fbLink'),
        session: formData.get('session'),
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
    return <Ticket data={reviewData || {}} />;
  }

  if (!configLoaded) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading booking system...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-xl space-y-8">
        
        {step === 'FORM' ? (
          <div className="pl-2 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
                 <Sparkles className="w-4 h-4 text-rose-500" /> Official Booking
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Sisters & Brows</h1>
              <p className="text-slate-600 leading-relaxed">
                Premium Aesthetics & Microblading Services. Please fill out the form below to secure your appointment.
              </p>
          </div>
        ) : (
           <div className="pl-2 animate-in fade-in slide-in-from-right-8 duration-500">
              <button onClick={() => setStep('FORM')} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors mb-4">
                 <ArrowLeft className="w-4 h-4" /> Back to Edit
              </button>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Review Details</h1>
              <p className="text-slate-600">Please confirm everything is correct before finalizing.</p>
           </div>
        )}

        <form ref={formRef} action={formAction} className="space-y-6" noValidate={step === 'REVIEW'}>
          <div className={step === 'FORM' ? 'space-y-6 block animate-in fade-in duration-300' : 'hidden'}>
            
            <StartHere bookingType={bookingType} setBookingType={setBookingType} />

            {/* PASS DYNAMIC BRANCHES HERE */}
            <LocationDate 
              // @ts-ignore (Update LocationDate.tsx to accept 'branches' prop)
              branches={branches}
              selectedBranch={selectedBranch}
              setSelectedBranch={setSelectedBranch}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              minDate={today}
            />
            <input type="hidden" name="date" value={selectedDate} />

            {/* PASS DYNAMIC TIME SLOTS HERE */}
            <TimeSlotGrid 
              // @ts-ignore (Update TimeSlotGrid.tsx to accept 'timeSlots' prop)
              timeSlots={timeSlots}
              slotCounts={slotCounts} 
              loading={loadingSlots} 
              selectedDate={selectedDate}
              maxCapacity={maxCapacity} 
            />

            <ServiceList />
            <GuestForm />

            <label className="flex gap-3 cursor-pointer group">
                <input type="checkbox" name="agreement" required className="mt-0.5 w-4 h-4 text-rose-500 rounded border-slate-300 focus:ring-rose-500" />
                <span className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
                  I confirm the details are correct and authorize Sisters & Brows to contact me.
                </span>
            </label>

            <button type="button" onClick={handleProceed} className="w-full bg-[#0f172a] text-white font-bold text-lg py-4 rounded-2xl shadow-xl hover:bg-slate-900 hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
               Proceed to Review <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {step === 'REVIEW' && (
             <ReviewSummary 
               data={reviewData} 
               onBack={() => setStep('FORM')} 
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