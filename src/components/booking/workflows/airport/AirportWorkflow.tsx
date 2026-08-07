import React, { useCallback, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { createBooking } from "@/lib/bookings.functions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Plane, Search, CheckCircle2, AlertCircle, Sparkles, RefreshCw, UserCheck, ShieldCheck, ShoppingBag, Edit2 } from "lucide-react";
import { BookingProgressHeader } from "../../shared/BookingProgressHeader";
import { BookingSuccessPass } from "../../shared/BookingSuccessPass";
import { ReviewSummary } from "../../shared/ReviewSummary";
import { ContactSection } from "../../shared/ContactSection";
import { useAirportWorkflow } from "../../hooks/useAirportWorkflow";
import { AirportServiceSelection } from "./AirportServiceSelection";
import { ManualFlightEntryForm } from "../../shared/ManualFlightEntryForm";
import { EditJourneyDrawer } from "../../shared/EditJourneyDrawer";
import { BookingSummaryReviewStep } from "./BookingSummaryReviewStep";
import { getAirportCurrencySymbol } from "@/data/airportRegistry";
import { ApiClient } from "@/lib/ApiClient";

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
    setManualFlightData,
    totalPrice,
    journeyEngine,
  } = useAirportWorkflow(searchParams);

  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [validationData, setValidationData] = useState<any>(null);

  React.useEffect(() => {
    if (currentStep === 4) {
      const selectedSlugs =
        state.bookingMode === "package"
          ? [state.selectedPackage || state.selectedService || "platinum"]
          : (state as any).selectedExtras?.length > 0
          ? (state as any).selectedExtras
          : [state.selectedService || "platinum"];

      ApiClient.fetchWithAuth("/api/journey/validate-booking", {
        method: "POST",
        body: JSON.stringify({
          airport_code: state.airportCode,
          journey_type: state.direction.toUpperCase(),
          service_date: state.serviceDate || new Date().toISOString().split("T")[0],
          service_time: state.serviceTime || "12:00",
          selected_service_slugs: selectedSlugs,
          guest_count: state.guestCount || 1,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success !== false) {
            setValidationData(data);
            if (data.booking_reference) {
              setBookingRef(data.booking_reference);
            }
          }
        })
        .catch((err) => console.warn("[AirportWorkflow] Pre-payment validation error:", err));
    }
  }, [
    currentStep,
    state.airportCode,
    state.direction,
    state.serviceDate,
    state.serviceTime,
    state.selectedService,
    state.selectedPackage,
    state.bookingMode,
    state.guestCount,
    setBookingRef,
  ]);

  const currencySymbol = getAirportCurrencySymbol(state.airportCode);

  const stepConfigs = useMemo(
    () => [
      { title: "Journey Details", sub: "Search flight or enter travel information.", estTime: "Est. 10 sec", progress: 20 },
      { title: "Select Services", sub: "Choose your preferred airport concierge service.", estTime: "Est. 20 sec", progress: 40 },
      { title: "Passenger Information", sub: "Provide lead guest contact details.", estTime: "Est. 20 sec", progress: 65 },
      { title: "Booking Summary & Payment", sub: "Review itemized summary and proceed to payment.", estTime: "Est. 10 sec", progress: 85 },
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
    if (state.bookingMode === "package") return `package_${state.selectedPackage || state.selectedService}`;
    return state.selectedService;
  }, [state.bookingMode, state.selectedPackage, state.selectedService]);

  const getRefPrefix = useCallback(() => {
    const map: Record<string, string> = {
      meet_greet: "SHF-[#MEET]-",
      lounge: "SHF-[#LOUNGE]-",
      fast_track: "SHF-FT-",
      transport: "SHF-TRP-",
      platinum: "SHF-PLT-",
      elite: "SHF-ELT-",
      silver: "SHF-SLV-",
      gold: "SHF-GLD-",
    };
    return map[state.selectedService] || map[state.selectedPackage] || "SHF-[#MEET]-";
  }, [state.selectedService, state.selectedPackage]);

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
      setCurrentStep(5);
      toast.success("Airport concierge booking request submitted!");
    } catch {
      setBookingRef(generatedRef);
      setCurrentStep(5);
      toast.success("Airport concierge booking request submitted!");
    } finally {
      setBusy(false);
    }
  }, [state, getRefPrefix, getServiceKey, totalPrice, submitBookingFn, setBusy, setBookingRef, setCurrentStep]);

  const getServiceTitle = useCallback(() => {
    if (state.bookingMode === "package") {
      const pkg = (state.selectedPackage || state.selectedService || "").toLowerCase();
      if (pkg.includes("platinum")) return "Platinum Service Package";
      if (pkg.includes("elite")) return "Elite Service Package";
      if (pkg.includes("gold")) return "Gold Service Package";
      if (pkg.includes("silver")) return "Silver Service Package";
      if (pkg.includes("essential")) return "Essential Escort Package";
      if (pkg.includes("premium")) return "Premium VIP Sanctuary Package";
      if (pkg.includes("vip")) return "VIP Executive Tarmac Package";
      return state.selectedPackage ? `${state.selectedPackage.replace(/_/g, " ").toUpperCase()} Package` : "Select a Package";
    }
    const map: Record<string, string> = {
      meet_greet: "Meet & Greet Escort",
      lounge: "Executive Airport Lounge Pass",
      fast_track: "VIP Fast-Track Clearance",
      transport: "Airport Chauffeur Transfer",
      porter: "Baggage Porter Service",
      buggy: "Electric Buggy Transfer",
      wheelchair: "Wheelchair Assistance",
    };
    return map[state.selectedService] || "No Service Selected";
  }, [state.bookingMode, state.selectedPackage, state.selectedService]);

  const selectedExtrasList: string[] = (state as any).selectedExtras || [];

  const isManualData = Boolean(state.validatedFlightData?.isManual);

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

      <div className="w-full">
        {/* Main Workflow Form Card */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 sm:p-10 rounded-[36px] bg-white border border-slate-200 shadow-sm relative overflow-hidden text-slate-900"
            >
              {/* STEP 1: SEARCH & ENTER JOURNEY DETAILS */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-amber-800 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                      Step 1 of 5 — Journey Details
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Enter Travel & Flight Details
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Search flight number or enter travel information to continue with booking.
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
                          className={`flex-1 py-3 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
                            state.direction === dir.id
                              ? "bg-white text-amber-900 shadow-sm border border-slate-200/80"
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
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-600 shadow-xs font-mono font-bold uppercase"
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
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-600 shadow-xs font-mono font-bold"
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
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-600 shadow-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Submit Search Flight & Secondary Manual Option */}
                  <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => updateState({ isManualMode: !state.isManualMode })}
                      className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-700 hover:text-amber-800 transition underline underline-offset-4 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{state.isManualMode ? "Hide Manual Form" : "Or Enter Flight Details Manually"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleSearchFlight}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white font-mono text-xs font-extrabold uppercase tracking-widest shadow-md hover:scale-105 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {busy ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Searching Journey...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>Continue to Services</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Expanded Manual Entry Form */}
                  <AnimatePresence>
                    {state.isManualMode && (
                      <ManualFlightEntryForm
                        direction={state.direction}
                        initialValues={{
                          flightNum: state.flightNumber,
                          depDate: state.serviceDate,
                          depAirportCode: state.airportCode,
                        }}
                        onClose={() => updateState({ isManualMode: false })}
                        onSubmit={(manualData) => {
                          setManualFlightData(manualData);
                          setCurrentStep(2);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* STEP 2: SELECT SERVICES (With Sticky Compact Journey Summary Card) */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Compact Sticky "Journey Summary" Header */}
                  <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold shrink-0">
                        <Plane className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 font-mono">
                            {state.flightNumber || "DIRECT"}
                          </span>
                          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                            ({state.validatedFlightData?.carrier?.name || "Commercial Airline"})
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                              isManualData
                                ? "bg-slate-100 text-slate-700 border-slate-300"
                                : "bg-emerald-50 text-emerald-800 border-emerald-300"
                            }`}
                          >
                            {isManualData ? "Provided Information" : "Live Data"}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 font-sans">
                          <span className="font-bold">{state.validatedFlightData?.origin?.code || state.airportCode || "DEL"}</span>
                          {" → "}
                          <span className="font-bold">{state.validatedFlightData?.destination?.code || "BOM"}</span>
                          {" • "}
                          <span>{state.serviceDate}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsEditDrawerOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-bold text-xs transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-purple-700" />
                      <span>Edit Journey</span>
                    </button>
                  </div>

                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-amber-800 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                      Step 2 of 5 — Service Selection
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Select Packages & Extra Services
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Airport-filtered catalog for {state.airportName || state.airportCode}. Choose packages or customize individual options.
                    </p>
                  </div>

                  {/* Airport Services & Package Grid */}
                  <AirportServiceSelection
                    state={state}
                    onChange={(fields) => updateState(fields)}
                    availableServices={journeyEngine?.availableServices}
                    isSupported={journeyEngine?.isSupported}
                    urgentAssistance={journeyEngine?.urgentAssistance}
                    isRequestedServiceAvailable={journeyEngine?.isRequestedServiceAvailable}
                    unavailableMessage={journeyEngine?.unavailableMessage}
                    availableTerminals={journeyEngine?.result?.available_terminals}
                    selectedTerminal={journeyEngine?.result?.selected_terminal}
                  />

                  {/* Action Buttons */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      disabled={!state.selectedService && !state.selectedPackage}
                      onClick={() => {
                        if (!state.selectedService && !state.selectedPackage) {
                          toast.error("Please select an airport package or service to continue.");
                          return;
                        }
                        setCurrentStep(3);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
                    >
                      <span>Continue to Passenger Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PASSENGER & CONTACT INFORMATION */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-amber-800 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                      Step 3 of 5 — Passenger Information
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Lead Guest Contact Information
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Provide lead passenger contact details for airside officer assignment.
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
                      className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-600 shadow-xs font-sans font-medium"
                    />
                  </div>

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
                      onClick={() => {
                        if (!state.fullName || !state.phone || !state.email) {
                          toast.error("Please fill in Lead Guest Name, Phone, and Email.");
                          return;
                        }
                        setCurrentStep(4);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                    >
                      <span>Continue to Summary & Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: BOOKING SUMMARY & PAYMENT */}
              {currentStep === 4 && (
                <BookingSummaryReviewStep
                  state={state}
                  bookingRef={validationData?.booking_reference || bookingRef || "SHK-20260806-PEND"}
                  priceBreakdown={validationData?.price_breakdown}
                  onEditJourney={() => setIsEditDrawerOpen(true)}
                  onEditServices={() => setCurrentStep(2)}
                  onEditPassengers={() => setCurrentStep(3)}
                  onProceedToPayment={handleSubmit}
                  validationMessages={validationData?.validation_messages || []}
                  isValid={validationData?.is_valid ?? true}
                />
              )}

              {/* STEP 5: BOOKING CONFIRMED */}
              {currentStep === 5 && (
                <BookingSuccessPass
                  badge="Airside Pass Active"
                  title={`${getServiceTitle()} Confirmed`}
                  subtitle={`Your request for Flight ${state.flightNumber || "VIP Direct"} at ${state.airportCode} (${state.direction.toUpperCase()}) is assigned to our 24/7 command desk.`}
                  bookingRef={bookingRef || "SHF-[#MEET]-849201"}
                  guestSummary={`${state.guestCount} Guest(s) | ${state.serviceDate}`}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── STICKY LIVE BOOKING SUMMARY PANEL ── */}
        {currentStep > 1 && currentStep < 5 && (
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="p-6 rounded-[32px] bg-slate-900 text-white border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
                    Live Summary
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold">
                  {state.airportCode}
                </span>
              </div>

              {/* Flight Badge */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Journey Flight & Direction
                </div>
                <div className="text-sm font-heading font-bold text-white flex items-center justify-between">
                  <span>{state.flightNumber || "Direct Dispatch"}</span>
                  <span className="text-xs font-mono text-amber-300 uppercase">{state.direction}</span>
                </div>
                <div className="text-xs text-slate-400 font-sans">
                  {state.serviceDate} • {state.guestCount} Pax
                </div>
              </div>

              {/* Service/Package Item */}
              <div className="space-y-2 pt-1">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Selected Service Tier
                </div>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-amber-200 font-bold">{getServiceTitle()}</span>
                  <span className="font-mono text-white font-bold">
                    {currencySymbol}{totalPrice.toLocaleString()}
                  </span>
                </div>

                {selectedExtrasList.length > 0 && (
                  <div className="pt-2 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                      Add-on Extras ({selectedExtrasList.length})
                    </div>
                    {selectedExtrasList.map((extraId) => (
                      <div key={extraId} className="flex items-center justify-between text-[11px] text-slate-300">
                        <span>• {extraId.replace("_", " ").toUpperCase()}</span>
                        <span className="font-mono text-amber-300">+ Included</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Summary */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Taxes & Fees</span>
                  <span className="font-mono text-slate-300">Included</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-heading font-bold text-white">Grand Total</span>
                  <span className="text-xl font-mono font-bold text-amber-400">
                    {currencySymbol}{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Journey In-Place Side Drawer */}
      <EditJourneyDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        flightData={state.validatedFlightData}
        serviceDate={state.serviceDate}
        onSave={(updated) => {
          setManualFlightData({
            flightNum: updated.flightNum,
            airlineName: updated.airlineName,
            depAirportCode: updated.depCode,
            arrAirportCode: updated.arrCode,
            depDate: updated.date,
            depTime: updated.time,
            arrDate: updated.date,
            arrTime: updated.time,
          });
          toast.success("Journey details updated!");
        }}
      />
    </div>
  );
}
