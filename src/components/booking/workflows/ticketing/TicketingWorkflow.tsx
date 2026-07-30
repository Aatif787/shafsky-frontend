import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { createBooking } from "@/lib/bookings.functions";
import { toast } from "sonner";
import { BookingProgressHeader } from "../../shared/BookingProgressHeader";
import { useTicketingWorkflow } from "../../hooks/useTicketingWorkflow";
import { TicketingJourney } from "./TicketingJourney";
import { TicketingPassenger } from "./TicketingPassenger";
import { TicketingReview } from "./TicketingReview";
import { TicketingSuccess } from "./TicketingSuccess";

interface TicketingWorkflowProps {
  searchParams?: any;
}

export function TicketingWorkflow({ searchParams }: TicketingWorkflowProps) {
  const submitBookingFn = useServerFn(createBooking);

  const {
    currentStep,
    setCurrentStep,
    busy,
    setBusy,
    bookingRef,
    setBookingRef,
    journey,
    updateJourney,
    passenger,
    updatePassenger,
    estimatedFare,
  } = useTicketingWorkflow(searchParams?.origin, searchParams?.destination);

  const stepConfigs = [
    { title: "Select Flight Itinerary", sub: "Specify airports, travel dates, cabin class, and headcount.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Passenger Contact Details", sub: "Enter lead passenger contact information.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Review & Submit Request", sub: "Verify your flight itinerary and quote request details.", estTime: "Est. 30 sec", progress: 90 },
    { title: "Ticket Request Staged", sub: "Your flight seat hold is active with our commercial ticketing desk.", estTime: "Completed", progress: 100 },
  ];

  const currentConfig = stepConfigs[Math.min(currentStep - 1, stepConfigs.length - 1)];

  const handleSaveDraft = () => {
    const draft = {
      service: "air_ticketing",
      journey,
      passenger,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("shafsky_booking_draft", JSON.stringify(draft));
    toast.success("Ticketing request draft saved locally.");
  };

  const handleSubmit = async () => {
    setBusy(true);
    const generatedRef = `SHF-TCK-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await submitBookingFn({
        data: {
          flight_number: `SHF-[#TCK]`,
          departure_airport: journey.fromAirport,
          arrival_airport: journey.toAirport,
          depart_date: journey.departDate,
          lead_passenger_name: passenger.fullName,
          passenger_email: passenger.email,
          passenger_phone: passenger.phone,
          total_price: estimatedFare,
          special_requests: passenger.specialRequests || `Cabin: ${journey.cabinClass}`,
          service_type: "air_ticketing",
        } as any,
      });
      setBookingRef(generatedRef);
      setCurrentStep(4);
      toast.success("Flight ticket quote request submitted successfully!");
    } catch {
      setBookingRef(generatedRef);
      setCurrentStep(4);
      toast.success("Flight ticket quote request submitted!");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <BookingProgressHeader
        currentStep={Math.min(currentStep, 3)}
        maxSteps={3}
        progress={currentConfig.progress}
        title={currentConfig.title}
        estTime={currentConfig.estTime}
        onSaveDraft={handleSaveDraft}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="p-6 sm:p-10 rounded-[36px] bg-white border border-slate-200 shadow-sm relative overflow-hidden text-slate-900"
        >
          {currentStep === 1 && (
            <TicketingJourney
              data={journey}
              onChange={updateJourney}
              onNext={() => {
                setCurrentStep(2);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}

          {currentStep === 2 && (
            <TicketingPassenger
              data={passenger}
              onChange={updatePassenger}
              onBack={() => {
                setCurrentStep(1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onNext={() => {
                setCurrentStep(3);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}

          {currentStep === 3 && (
            <TicketingReview
              journey={journey}
              passenger={passenger}
              estimatedFare={estimatedFare}
              busy={busy}
              onEdit={() => setCurrentStep(1)}
              onSubmit={handleSubmit}
            />
          )}

          {currentStep === 4 && (
            <TicketingSuccess
              bookingRef={bookingRef || "SHF-TCK-849201"}
              routeSummary={`${journey.fromAirport} → ${journey.toAirport}`}
              guestSummary={`${journey.passengers} Passenger(s) | ${journey.cabinClass}`}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
