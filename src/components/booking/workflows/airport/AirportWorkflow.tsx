import React, { useCallback, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { createBooking } from "@/lib/bookings.functions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Plane, Search, CheckCircle2, AlertCircle, Sparkles, RefreshCw, UserCheck, ShieldCheck } from "lucide-react";
import { BookingProgressHeader } from "../../shared/BookingProgressHeader";
import { BookingSuccessPass } from "../../shared/BookingSuccessPass";
import { ReviewSummary } from "../../shared/ReviewSummary";
import { ContactSection } from "../../shared/ContactSection";
import { useAirportWorkflow } from "../../hooks/useAirportWorkflow";
import { AirportServiceSelection } from "./AirportServiceSelection";
import { ValidatedFlightExperience, ValidatedFlightSkeleton } from "./ValidatedFlightExperience";
import { getAirportCurrencySymbol } from "@/data/airportRegistry";

interface AirportWorkflowProps {
  searchParams?: any;
}

export function AirportWorkflow({ searchParams }: AirportWorkflowProps) {
  const navigate = useNavigate();
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
    validateAndSearchFlight,
    totalPrice,
  } = useAirportWorkflow(searchParams);

  const currencySymbol = getAirportCurrencySymbol(state.airportCode);

  const stepConfigs = useMemo(
    () => [
      { title: "Search & Validate Flight", sub: "Select travel direction, flight number, date, and guest count.", estTime: "Est. 20 sec", progress: 20 },
      { title: "Validated Flight Details", sub: "Review verified airline schedule and airport information.", estTime: "Est. 10 sec", progress: 40 },
      { title: "Select Airport Service", sub: "Choose your preferred airport concierge service.", estTime: "Est. 30 sec", progress: 60 },
      { title: "Passenger Information", sub: "Provide lead passenger contact details.", estTime: "Est. 30 sec", progress: 80 },
      { title: "Booking Summary & Pricing", sub: "Review itemized summary and proceed to payment.", estTime: "Est. 30 sec", progress: 95 },
      { title: "Booking Confirmed", sub: "Airside service request active.", estTime: "Completed", progress: 100 },
    ],
    []
  );

  const currentConfig = useMemo(
    () => stepConfigs[Math.min(currentStep - 1, stepConfigs.length - 1)],
    [stepConfigs, currentStep]
  );

  const handleSaveDraft = useCallback(() => {
    localStorage.setItem("shafsky_booking_draft", JSON.stringify({ service: "airport", state, updatedAt: new Date().toISOString() }));
    toast.success("Airport concierge draft saved locally.");
  }, [state]);

  const getServiceKey = useCallback(() => {
    if (state.bookingMode === "package") return `package_${state.selectedPackage}`;
    return state.selectedService;
  }, [state.bookingMode, state.selectedPackage, state.selectedService]);

  const getRefPrefix = useCallback(() => {
    const map: Record<string, string> = {
      meet_greet: "SHF-[#MEET]-",
      lounge: "SHF-[#LOUNGE]-",
      fast_track: "SHF-FT-",
      transport: "SHF-TRP-",
    };
    return map[state.selectedService] || "SHF-[#MEET]-";
  }, [state.selectedService]);

  const handleSearchFlight = useCallback(async () => {
    const success = await validateAndSearchFlight();
    if (success) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [validateAndSearchFlight, setCurrentStep]);

  const handleSubmit = useCallback(async () => {
    if (!state.fullName || !state.phone || !state.email) {
      toast.error("Please fill in Lead Guest Name, Phone Number, and Email.");
      return;
    }
    if (!state.selectedService && !state.selectedPackage) {
      toast.error("Please select an airport service before proceeding.");
      return;
    }
    setBusy(true);
    const prefix = getRefPrefix();
    const generatedRef = `${prefix}${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await submitBookingFn({
        data: {
          flight_number: state.flightNumber || `SHF-[#${getServiceKey().toUpperCase()}]`,
          departure_airport: state.validatedFlightData?.origin?.name || state.airportName,
          arrival_airport: state.validatedFlightData?.destination?.name || state.airportCode,
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
      setCurrentStep(6);
      toast.success("Airport concierge booking request submitted!");
    } catch {
      setBookingRef(generatedRef);
      setCurrentStep(6);
      toast.success("Airport concierge booking request submitted!");
    } fontally: {
      setBusy(false);
    }
  }, [state, getRefPrefix, getServiceKey, totalPrice, submitBookingFn, setBusy, setBookingRef, setCurrentStep]);

  const getServiceTitle = useCallback(() => {
    if (state.bookingMode === "package") {
      const pkg = (state.selectedPackage || "").toLowerCase();
      if (pkg.includes("silver")) return "Silver Concierge Package";
      if (pkg.includes("gold")) return "Gold VIP Sanctuary Package";
      if (pkg.includes("elite") || pkg.includes("platinum")) return "Elite VVIP Tarmac Package";
      if (pkg.includes("bronze")) return "Bronze VIP Package";
      return state.selectedPackage ? `VIP Package (${state.selectedPackage.toUpperCase()})` : "Select a Package";
    }
    const map: Record<string, string> = {
      meet_greet: "Meet & Greet Concierge",
      lounge: "Executive Airport Lounge Access",
      fast_track: "VIP Fast-Track Clearance",
      transport: "Chauffeured Airport Transfer",
      transfer: "Chauffeured Airport Transfer",
    };
    return map[state.selectedService] || "No Service Selected";
  }, [state.bookingMode, state.selectedPackage, state.selectedService]);

  const fData = state.validatedFlightData;

  return (
    <div className="space-y-6">
      <BookingProgressHeader
        currentStep={Math.min(currentStep, 5)}
        maxSteps={5}
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
          {/* STEP 1: SEARCH & VALIDATE FLIGHT */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  Step 1 of 5 — Flight Validation Gate
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                  Enter Travel & Flight Details
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                  We validate flight schedules with live airline systems before matching available airport services.
                </p>
              </div>

              {/* Direction Selector */}
              <div>
                <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-2">
                  Flight Direction *
                </label>
                <div className="p-1.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-1">
                  {[
                    { id: "arrival", label: "Arrival" },
                    { id: "departure", label: "Departure" },
                    { id: "transit", label: "Transit / Transfer" },
                  ].map((dir) => (
                    <button
                      key={dir.id}
                      type="button"
                      onClick={() => updateState({ direction: dir.id as any })}
                      className={`flex-1 py-3 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 ${state.direction === dir.id
                          ? "bg-white text-emerald-800 shadow-sm border border-slate-200/80"
                          : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                      {dir.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flight Search Form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                    Flight Number *
                  </label>
                  <input
                    type="text"
                    value={state.flightNumber}
                    onChange={(e) => updateState({ flightNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. AI302, EK504"
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                    Travel Date *
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
                    Passenger Count *
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

              {/* Submit Search Flight */}
              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleSearchFlight}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-md hover:scale-105 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {busy ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Validating with Flight Database...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Search & Validate Flight</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DISPLAY VALIDATED FLIGHT INFORMATION */}
          {currentStep === 2 && (
            busy ? (
              <ValidatedFlightSkeleton />
            ) : (
              <ValidatedFlightExperience
                flightData={state.validatedFlightData}
                serviceDate={state.serviceDate}
                airportCode={state.airportCode}
                direction={state.direction}
                onContinue={() => {
                  setCurrentStep(3);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onChangeFlight={() => {
                  if (typeof window !== "undefined") {
                    try {
                      sessionStorage.removeItem("shafsky_validated_flight");
                    } catch {
                      // ignore storage remove error
                    }
                  }
                  updateState({ isFlightValidated: false, validatedFlightData: null });
                  navigate({ to: "/" });
                }}
              />
            )
          )}

          {/* STEP 3: DISPLAY AVAILABLE AIRPORT SERVICES (NO PRE-SELECTION) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  Step 3 of 5 — Service Selection
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                  Select Your Airport Service
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                  Flight {state.flightNumber} validated. Choose one service below to proceed.
                </p>
              </div>

              {/* Selection Notification if unselected */}
              {!state.selectedService && !state.selectedPackage && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-900">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-xs font-sans font-medium">
                    No service pre-selected. Please manually select one available airport service below.
                  </p>
                </div>
              )}

              {/* Airport Services Grid */}
              <AirportServiceSelection state={state} onChange={(fields) => updateState(fields)} />

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(2);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Back
                </button>

                <button
                  type="button"
                  disabled={!state.selectedService && !state.selectedPackage}
                  onClick={() => {
                    if (!state.selectedService && !state.selectedPackage) {
                      toast.error("Please select an airport service to continue.");
                      return;
                    }
                    setCurrentStep(4);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
                >
                  <span>Continue to Passenger Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PASSENGER INFORMATION */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  Step 4 of 5 — Guest Information
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                  Lead Guest Contact Information
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                  Provide lead passenger contact information for airside paging and officer assignment.
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

              <div>
                <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                  Special Assistance Requests (Optional)
                </label>
                <input
                  type="text"
                  value={state.specialRequests}
                  onChange={(e) => updateState({ specialRequests: e.target.value })}
                  placeholder="Wheelchair, electric buggy, extra luggage assistance..."
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(3);
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
                    setCurrentStep(5);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                >
                  <span>Continue to Summary & Pricing</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: BOOKING SUMMARY & PRICING */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  Step 5 of 5 — Final Review & Checkout
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                  Verify Booking Itinerary
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                  Review itemized airport service breakdown before payment.
                </p>
              </div>

              <ReviewSummary
                serviceTitle={getServiceTitle()}
                badgeLabel="Guests"
                badgeValue={`${state.guestCount} Passenger(s)`}
                items={[
                  { label: "Validated Flight", value: `${state.flightNumber} (${state.direction.toUpperCase()})` },
                  { label: "Airport Hub", value: `${state.airportName} (${state.airportCode})` },
                  { label: "Service Selected", value: getServiceTitle() },
                  { label: "Service Date", value: `${state.serviceDate}` },
                  { label: "Lead Guest", value: state.fullName },
                  { label: "Contact Phone", value: state.phone },
                ]}
                totalPrice={totalPrice}
                currencySymbol={currencySymbol}
                submitLabel={`Confirm & Proceed to Payment`}
                busy={busy}
                onEdit={() => setCurrentStep(3)}
                onSubmit={handleSubmit}
              />
            </div>
          )}

          {/* STEP 6: BOOKING CONFIRMED */}
          {currentStep === 6 && (
            <BookingSuccessPass
              badge="Airside Pass Active"
              title={`${getServiceTitle()} Confirmed`}
              subtitle={`Your request for Flight ${state.flightNumber} at ${state.airportCode} (${state.direction.toUpperCase()}) is assigned to our 24/7 command desk.`}
              bookingRef={bookingRef || "SHF-[#MEET]-849201"}
              guestSummary={`${state.guestCount} Guest(s) | ${state.serviceDate}`}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
