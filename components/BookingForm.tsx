'use client'

import { useActionState, useState, useEffect, useRef } from 'react';
import { submitBooking, getSlotAvailability } from '@/app/actions';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { BRANCHES } from './booking/constants';

// Subcomponents
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
  const [state, formAction, isPending] = useActionState(submitBooking, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Logic State
  const [step, setStep] = useState<'FORM' | 'REVIEW'>('FORM');
  const [reviewData, setReviewData] = useState<any>(null);
  
  // Form Field State
  const [bookingType, setBookingType] = useState("New Appointment");
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [selectedDate, setSelectedDate] = useState("");
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  
  // NEW: State to hold the dynamic capacity
  const [maxCapacity, setMaxCapacity] = useState(4);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDate || !selectedBranch) return;
      setLoadingSlots(true);
      try {
        const result = await getSlotAvailability(selectedDate, selectedBranch);
        if (result.success) {
          setSlotCounts(result.counts);
          // NEW: Update capacity based on branch
          if (result.maxCapacity) setMaxCapacity(result.maxCapacity);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [selectedDate, selectedBranch]);

  const handleProceed = () => {
    if (formRef.current && formRef.current.checkValidity()) {
      // ... (Rest of handleProceed is same as before)
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

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center py-12 px-4">
      {/* ... Header Code ... */}
      <div className="w-full max-w-xl space-y-8">
        
        {/* HEADER code (omitted for brevity, same as original) */}
        
        <form 
          ref={formRef} 
          action={formAction} 
          className="space-y-6"
          noValidate={step === 'REVIEW'} 
        >
          <div className={step === 'FORM' ? 'space-y-6 block animate-in fade-in duration-300' : 'hidden'}>
            
            <StartHere bookingType={bookingType} setBookingType={setBookingType} />

            <LocationDate 
              selectedBranch={selectedBranch}
              setSelectedBranch={setSelectedBranch}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              minDate={today}
            />

            {/* NEW: Pass maxCapacity to the grid */}
            <TimeSlotGrid 
              slotCounts={slotCounts} 
              loading={loadingSlots} 
              selectedDate={selectedDate}
              maxCapacity={maxCapacity}
            />

            <ServiceList />
            <GuestForm />
            
            {/* ... Terms and Buttons (same as original) ... */}
            <label className="flex gap-3 cursor-pointer group">
                <input type="checkbox" name="agreement" required className="mt-0.5 w-4 h-4 text-rose-500 rounded border-slate-300 focus:ring-rose-500" />
                <span className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
                  I confirm the details are correct and authorize Sisters & Brows to contact me.
                </span>
            </label>

            <button 
              type="button" 
              onClick={handleProceed}
              className="w-full bg-[#0f172a] text-white font-bold text-lg py-4 rounded-2xl shadow-xl hover:bg-slate-900 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
               Proceed to Review <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {step === 'REVIEW' && (
             <ReviewSummary 
               data={reviewData} 
               onEdit={() => setStep('FORM')} 
               isPending={isPending}
               success={state.success}
               message={state.message}
             />
          )}

        </form>
        {/* Footer code */}
      </div>
    </div>
  );
}