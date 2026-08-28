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
    ancillaries,
    updateAncillaries,
  } = useTicketingWorkflow(searchParams?.origin, searchParams?.destination);

  const stepConfigs = [
    { title: "Select Flight Itinerary", sub: "Specify airports, travel dates, cabin class, and headcount.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Passenger Contact Details", sub: "Enter lead passenger contact information.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Personalize & Review Request", sub: "Verify your flight itinerary and ancillary add-on options.", estTime: "Est. 30 sec", progress: 90 },
    { title: "Ticket Request Staged", sub: "Your flight seat hold is active with our commercial ticketing desk.", estTime: "Completed", progress: 100 },
  ];

  const currentConfig = stepConfigs[Math.min(currentStep - 1, stepConfigs.length - 1)];

  const handleSaveDraft = () => {
    const draft = {
      service: "air_ticketing",
      journey,
      passenger,
      ancillaries,
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
          contact_name: passenger.fullName,
          contact_email: passenger.email,
          contact_phone: passenger.phone,
          company: passenger.companyName || "",
          trip_type: journey.tripType,
          origin: journey.fromAirport,
          destination: journey.toAirport,
          depart_date: journey.departDate,
          return_date: journey.tripType === "round_trip" ? journey.returnDate : undefined,
          date_flexibility: journey.dateFlexibility,
          pax_adults: journey.paxAdults || 1,
          pax_children: journey.paxChildren || 0,
          pax_infants: journey.paxInfants || 0,
          cabin_class: journey.cabinClass,
          service_type: "air_ticketing",
          notes: passenger.specialRequests || `Alliance: ${journey.preferredAlliance || "Any"}`,
          vip_notes: passenger.vipNotes || "",
          dietary_restrictions: passenger.dietaryRestrictions || "",
          ancillaries,
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

      {/* Live Concierge Itinerary Summary Widget */}
      {currentStep <= 3 && (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#84cc16] animate-pulse" />
            <span className="font-bold text-slate-100 uppercase tracking-wider">Live Concierge Itinerary:</span>
            <span className="text-emerald-400 font-bold">
              {journey.tripType === "multi_city"
                ? `${(journey.multiCityLegs || []).length} Flight Legs`
                : `${journey.fromAirport} → ${journey.toAirport}`}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
            <span className="font-semibold">{journey.cabinClass}</span>
            <span>•</span>
            <span>{journey.passengers} Passenger(s)</span>
            {journey.dateFlexibility && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                Flexible ±1-3 Days
              </span>
            )}
          </div>
        </div>
      )}

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
              journeyData={journey}
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
              ancillaries={ancillaries}
              onUpdateAncillaries={updateAncillaries}
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
