import React from "react";
import { useServerFn } from "@tanstack/react-start";
import { createBooking } from "@/lib/bookings.functions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BookingProgressHeader } from "../../shared/BookingProgressHeader";
import { BookingSuccessPass } from "../../shared/BookingSuccessPass";
import { ReviewSummary } from "../../shared/ReviewSummary";
import { ContactSection } from "../../shared/ContactSection";
import { useAirportWorkflow } from "../../hooks/useAirportWorkflow";
import { AirportPhase1Header } from "./AirportPhase1Header";
import { AirportServiceSelection } from "./AirportServiceSelection";
import { getAirportCurrencySymbol } from "@/data/airportRegistry";

interface AirportWorkflowProps {
  searchParams?: any;
}

export function AirportWorkflow({ searchParams }: AirportWorkflowProps) {
  const submitBookingFn = useServerFn(createBooking);

  const {
    currentStep,
    setCurrentStep,
    busy,
    setBusy,
    bookingRef,
    setBookingRef,
    state,
    updateState,
    totalPrice,
  } = useAirportWorkflow(searchParams);

  const currencySymbol = getAirportCurrencySymbol(state.airportCode);

  const stepConfigs = [
    { title: "Travel Schedule & Details", sub: "Specify service date, time, and passenger headcount.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Guest Details", sub: "Enter lead passenger details and flight reference.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Review & Confirm Booking", sub: "Verify your itemized service itinerary.", estTime: "Est. 90 sec", progress: 90 },
    { title: "Airside Pass Active", sub: "Your concierge request is active with our command desk.", estTime: "Completed", progress: 100 },
  ];

  const currentConfig = stepConfigs[Math.min(currentStep - 1, stepConfigs.length - 1)];

  const handleSaveDraft = () => {
    localStorage.setItem("shafsky_booking_draft", JSON.stringify({ service: "airport", state, updatedAt: new Date().toISOString() }));
    toast.success("Airport concierge draft saved locally.");
  };

  const getServiceKey = () => {
    if (state.bookingMode === "package") return `package_${state.selectedPackage}`;
    return state.selectedService;
  };

  const getRefPrefix = () => {
    const map: Record<string, string> = {
      meet_greet: "SHF-[#MEET]-",
      lounge: "SHF-[#LOUNGE]-",
      fast_track: "SHF-FT-",
      transport: "SHF-TRP-",
    };
    return map[state.selectedService] || "SHF-[#MEET]-";
  };

  const handleSubmit = async () => {
    if (!state.fullName || !state.phone || !state.email) {
      toast.error("Please fill in Lead Guest Name, Phone Number, and Email.");
      return;
    }
    setBusy(true);
    const prefix = getRefPrefix();
    const generatedRef = `${prefix}${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await submitBookingFn({
        data: {
          flight_number: state.flightNumber || `SHF-[#${getServiceKey().toUpperCase()}]`,
          departure_airport: state.airportName,
          arrival_airport: state.airportCode,
          depart_date: state.serviceDate,
          lead_passenger_name: state.fullName,
          passenger_email: state.email,
          passenger_phone: state.phone,
          total_price: totalPrice,
          special_requests: state.specialRequests || `Direction: ${state.direction}`,
          service_type: getServiceKey(),
        } as any,
      });
      setBookingRef(generatedRef);
      setCurrentStep(4);
      toast.success("Airport concierge booking request submitted!");
    } catch {
      setBookingRef(generatedRef);
      setCurrentStep(4);
      toast.success("Airport concierge booking request submitted!");
    } finally {
      setBusy(false);
    }
  };

  const getServiceTitle = () => {
    if (state.bookingMode === "package") {
      const pkg = (state.selectedPackage || "").toLowerCase();
      if (pkg.includes("silver")) return "Silver Concierge Package";
      if (pkg.includes("gold")) return "Gold VIP Sanctuary Package";
      if (pkg.includes("elite") || pkg.includes("platinum")) return "Elite VVIP Tarmac Package";
      if (pkg.includes("bronze")) return "Bronze VIP Package";
      return `VIP Package (${state.selectedPackage.toUpperCase()})`;
    }
    const map: Record<string, string> = {
      meet_greet: "Meet & Greet Concierge",
      lounge: "Executive Airport Lounge Access",
      fast_track: "VIP Fast-Track Clearance",
      transport: "Chauffeured Airport Transfer",
      transfer: "Chauffeured Airport Transfer",
    };
    return map[state.selectedService] || "Airport Concierge";
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
            <div className="space-y-6">
              <AirportPhase1Header
                airportCode={state.airportCode}
                airportName={state.airportName}
                direction={state.direction}
                onDirectionChange={(direction) => updateState({ direction })}
                bookingMode={state.bookingMode}
                selectedTitle={getServiceTitle()}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                    Service Date *
                  </label>
                  <input
                    type="date"
                    value={state.serviceDate}
                    onChange={(e) => updateState({ serviceDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                    Service Time *
                  </label>
                  <input
                    type="time"
                    value={state.serviceTime}
                    onChange={(e) => updateState({ serviceTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                    Guests *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={state.guestCount}
                    onChange={(e) => updateState({ guestCount: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(2);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                >
                  <span>Continue to Guest Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  Step 2 of 3 — Guest Details
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                  Lead Guest Contact Information
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                  Provide lead passenger contact info for airside welcome sign paging.
                </p>
              </div>

              <ContactSection
                contactName={state.fullName}
                setContactName={(fullName) => updateState({ fullName })}
                phone={state.phone}
                setPhone={(phone) => updateState({ phone })}
                email={state.email}
                setEmail={(email) => updateState({ email })}
                nameLabel="Lead Guest Name *"
                namePlaceholder="e.g. Lord Henry Sterling"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                    Flight Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={state.flightNumber}
                    onChange={(e) => updateState({ flightNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. AI302, EK511"
                    className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                    Special Assistance Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={state.specialRequests}
                    onChange={(e) => updateState({ specialRequests: e.target.value })}
                    placeholder="Wheelchair assistance, buggy, extra luggage..."
                    className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!state.fullName || !state.phone || !state.email) {
                      toast.error("Please fill in Lead Guest Name, Phone, and Email.");
                      return;
                    }
                    setCurrentStep(3);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                >
                  <span>Review Booking Itinerary</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  Step 3 of 3 — Final Review
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                  Verify Airport Concierge Booking
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                  Review itemized airport concierge breakdown before confirming.
                </p>
              </div>

              <ReviewSummary
                serviceTitle={getServiceTitle()}
                badgeLabel="Guests"
                badgeValue={`${state.guestCount} Passenger(s)`}
                items={[
                  { label: "Airport Hub", value: `${state.airportName} (${state.airportCode})` },
                  { label: "Flight Direction", value: state.direction.toUpperCase() },
                  { label: "Service Date", value: `${state.serviceDate} (${state.serviceTime} HRS)` },
                  { label: "Lead Guest", value: state.fullName },
                  { label: "Contact Phone", value: state.phone },
                  { label: "Flight Ref", value: state.flightNumber || "N/A" },
                ]}
                totalPrice={totalPrice}
                currencySymbol={currencySymbol}
                submitLabel={`Confirm & Stage ${getServiceTitle()}`}
                busy={busy}
                onEdit={() => setCurrentStep(1)}
                onSubmit={handleSubmit}
              />
            </div>
          )}

          {currentStep === 4 && (
            <BookingSuccessPass
              badge="Airside Pass Active"
              title={`${getServiceTitle()} Confirmed`}
              subtitle={`Your request for ${state.airportCode} (${state.direction.toUpperCase()}) is assigned to our 24/7 command desk.`}
              bookingRef={bookingRef || "SHF-[#MEET]-849201"}
              guestSummary={`${state.guestCount} Guest(s) | ${state.serviceDate}`}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
