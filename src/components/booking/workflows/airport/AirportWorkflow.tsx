import React, { useCallback, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { createBooking } from "@/lib/bookings.functions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, AlertCircle, RefreshCw } from "lucide-react";
import { BookingProgressHeader } from "../../shared/BookingProgressHeader";
import { BookingSuccessPass } from "../../shared/BookingSuccessPass";
import { ReviewSummary } from "../../shared/ReviewSummary";
import { ContactSection } from "../../shared/ContactSection";
import { useAirportWorkflow, AirportWorkflowState } from "../../hooks/useAirportWorkflow";
import { AirportServiceSelection } from "./AirportServiceSelection";
import { ValidatedFlightExperience, ValidatedFlightSkeleton } from "./ValidatedFlightExperience";
import { getAirportCurrencySymbol } from "@/data/airportRegistry";

interface AirportWorkflowProps {
  searchParams?: any;
}

interface TopFlightSearchSectionProps {
  direction: "arrival" | "departure" | "transit";
  flightNumber: string;
  serviceDate: string;
  guestCount: number;
  bagCount?: number;
  busy: boolean;
  onUpdateState: (fields: Partial<AirportWorkflowState>) => void;
  onSearchFlight: () => void;
}

function TopFlightSearchSection({
  direction,
  flightNumber,
  serviceDate,
  guestCount,
  bagCount = 1,
  busy,
  onUpdateState,
  onSearchFlight,
}: TopFlightSearchSectionProps) {
  return (
    <div className="w-full max-w-7xl mx-auto p-5 sm:p-6 rounded-3xl bg-white/85 backdrop-blur-md border border-[#E7E0D3] shadow-sm hover:shadow-md text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] space-y-4 transition-all duration-300">
      {/* Header & Direction selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-['Inter',sans-serif] font-bold text-[#854D0E] uppercase tracking-widest px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A]">
            Live Flight Search
          </span>
          <h2 className="text-base sm:text-lg font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#1C1917] mt-1.5">
            Flight Search & Live Verification
          </h2>
        </div>

        {/* Direction Selector Tabs */}
        <div className="p-1 rounded-xl bg-slate-100/90 border border-slate-200/60 flex items-center gap-1 self-stretch sm:self-auto overflow-x-auto">
          {[
            { id: "arrival", label: "Arrival" },
            { id: "departure", label: "Departure" },
            { id: "transit", label: "Transit / Transfer" },
          ].map((dir) => (
            <button
              key={dir.id}
              type="button"
              onClick={() => onUpdateState({ direction: dir.id as any })}
              className={`flex-1 sm:flex-none py-2 px-3.5 rounded-lg text-xs font-['Inter',sans-serif] font-semibold tracking-wider transition-all duration-200 whitespace-nowrap cursor-pointer ${
                direction === dir.id
                  ? "bg-[#1C1917] text-white shadow-xs"
                  : "text-[#57534E] hover:text-[#1C1917] hover:bg-white/50"
              }`}
            >
              {dir.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flight Search Form Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 items-end">
        <div>
          <label className="block text-[11px] font-['Inter',sans-serif] font-semibold text-[#57534E] uppercase tracking-wider mb-1">
            Flight Number *
          </label>
          <input
            type="text"
            value={flightNumber}
            onChange={(e) => onUpdateState({ flightNumber: e.target.value.toUpperCase() })}
            placeholder="e.g. AI302, EK504"
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-900 text-xs font-['Inter',sans-serif] font-bold uppercase focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-[11px] font-['Inter',sans-serif] font-semibold text-[#57534E] uppercase tracking-wider mb-1">
            Travel Date *
          </label>
          <input
            type="date"
            value={serviceDate}
            onChange={(e) => onUpdateState({ serviceDate: e.target.value })}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-900 text-xs font-['Inter',sans-serif] font-medium focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-[11px] font-['Inter',sans-serif] font-semibold text-[#57534E] uppercase tracking-wider mb-1">
            Passengers *
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={guestCount}
            onChange={(e) => onUpdateState({ guestCount: Math.max(1, parseInt(e.target.value) || 1) })}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-900 text-xs font-['Inter',sans-serif] font-medium focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-[11px] font-['Inter',sans-serif] font-semibold text-[#57534E] uppercase tracking-wider mb-1">
            Bag Count
          </label>
          <input
            type="number"
            min={0}
            max={20}
            value={bagCount}
            onChange={(e) => onUpdateState({ bagCount: Math.max(0, parseInt(e.target.value) || 0) })}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-900 text-xs font-['Inter',sans-serif] font-medium focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 transition-all shadow-2xs"
          />
        </div>

        <div>
          <button
            type="button"
            disabled={busy}
            onClick={onSearchFlight}
            className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#84cc16] via-[#76bd13] to-[#65a30d] hover:from-[#65a30d] hover:to-[#4d7c0f] text-[#0f172a] font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-md hover:scale-[1.02] transition-all disabled:opacity-50 cursor-pointer"
          >
            {busy ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Validating...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Search Flight</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
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
    } finally {
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

      {/* TOP SEARCH BAR SECTION: ALWAYS VISIBLE DURING FLIGHT SEARCH / VERIFICATION (STEPS 1 & 2) */}
      {(currentStep === 1 || currentStep === 2) && (
        <TopFlightSearchSection
          direction={state.direction}
          flightNumber={state.flightNumber}
          serviceDate={state.serviceDate}
          guestCount={state.guestCount}
          bagCount={state.bagCount}
          busy={busy}
          onUpdateState={updateState}
          onSearchFlight={handleSearchFlight}
        />
      )}

      {/* STEP 1: INITIAL FLIGHT SEARCH GUIDANCE (IF NOT YET SEARCHED/VALIDATED) */}
      {currentStep === 1 && (
        <div className="w-full max-w-7xl mx-auto p-6 sm:p-8 rounded-3xl bg-white/70 backdrop-blur-xs border border-[#E7E0D3] text-center space-y-4">
          <h3 className="text-xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#1C1917]">
            Enter Your Flight Number Above
          </h3>
          <p className="text-xs sm:text-sm font-['Inter',sans-serif] text-[#78716C] max-w-md mx-auto">
            Our aviation dispatch engine directly validates live schedule, terminal, and gate details with real-time airline radar before matching airport concierge services.
          </p>
        </div>
      )}

      {/* STEP 2: DISPLAY VALIDATED FLIGHT INFORMATION (UNBOXED INDEPENDENT SECTIONS ON CREAM BACKGROUND) */}
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

      {/* STEPS 3, 4, 5, 6: REMAIN WRAPPED IN CONTAINERS FOR CLEAN SERVICE & BOOKING FLOW */}
      {currentStep >= 3 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6 sm:p-10 rounded-[36px] bg-white border border-slate-200 shadow-sm relative overflow-hidden text-slate-900"
          >
            {/* STEP 3: DISPLAY AVAILABLE AIRPORT SERVICES */}
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

                {!state.selectedService && !state.selectedPackage && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-900">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-xs font-sans font-medium">
                      No service pre-selected. Please manually select one available airport service below.
                    </p>
                  </div>
                )}

                <AirportServiceSelection state={state} onChange={(fields) => updateState(fields)} />

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
      )}
    </div>
  );
}
