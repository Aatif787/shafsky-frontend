import React, { useCallback, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { createBooking } from "@/lib/bookings.functions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Plane, Search, CheckCircle2, AlertCircle, AlertTriangle, Sparkles, RefreshCw, UserCheck, ShieldCheck, ShoppingBag, Edit2, Lock } from "lucide-react";
import { BookingProgressHeader } from "../../shared/BookingProgressHeader";
import { BookingSuccessPass } from "../../shared/BookingSuccessPass";
import { ReviewSummary } from "../../shared/ReviewSummary";
import { ContactSection } from "../../shared/ContactSection";
import { useAirportWorkflow } from "../../hooks/useAirportWorkflow";
import { AirportServiceSelection } from "./AirportServiceSelection";
import { ManualFlightEntryForm } from "../../shared/ManualFlightEntryForm";
import { EditJourneyDrawer } from "../../shared/EditJourneyDrawer";
import { IntelligentAirportAutocomplete } from "../../shared/IntelligentAirportAutocomplete";
import { BookingSummaryReviewStep } from "./BookingSummaryReviewStep";
import { PassengerDetailsStep } from "./PassengerDetailsStep";
import { AIRPORT_REGISTRY, getAirportCurrencySymbol } from "@/data/airportRegistry";
import { getRequiredBookingFields } from "../../config/services.config";
import { ApiClient } from "@/lib/ApiClient";
import { FlightData } from "@/services/flight/FlightTypes";

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
    selectPackage,
    toggleIndividualService,
    validateWithBackend,
    saveDraftWithBackend,
    priceBreakdown,
    totalPrice,
  } = useAirportWorkflow(searchParams);

  const requiredFields = useMemo(
    () => getRequiredBookingFields(state.selectedService),
    [state.selectedService]
  );

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

    setBusy(true);

    const ref = bookingRef || `${getRefPrefix()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      const result = await submitBookingFn({
        data: {
          bookingRef: ref,
          passengerName: state.fullName,
          passengerEmail: state.email,
          passengerPhone: state.phone,
          serviceCategory: "Airport Assistance",
          serviceType: state.selectedPackage || state.selectedService || "Meet & Assist",
          flightNum: state.flightNumber || "MANUAL-ENTRY",
          originCode: state.validatedFlightData?.origin?.code || state.airportCode,
          destCode: state.validatedFlightData?.destination?.code || state.airportCode,
          departureTime: state.serviceDate ? new Date(`${state.serviceDate}T${state.serviceTime}:00Z`) : new Date(),
          totalAmount: totalPrice,
          currency: state.catalogCurrency || "INR",
          status: "PENDING",
          notes: state.specialRequests || `Airport: ${state.airportCode}, Direction: ${state.direction}`,
        },
      });

      if (result && result.success) {
        setBookingRef(ref);
        setCurrentStep(5);
        toast.success("Booking request submitted successfully!");
      } else {
        toast.error("Error creating booking. Please try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Failed to submit booking. Using offline fallback reference.");
      setBookingRef(ref);
      setCurrentStep(5);
    } finally {
      setBusy(false);
    }
  }, [state, totalPrice, getRefPrefix, submitBookingFn, setCurrentStep, setBusy, setBookingRef, bookingRef]);

  const activeAirportsList: any[] = useMemo(() => {
    return (Object.values(AIRPORT_REGISTRY) as any[]).filter((a: any) => a.status === "Active");
  }, []);

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
                      Select Airport & Enter Travel Details
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Select your service airport, journey type, and verify flight details to continue.
                    </p>
                  </div>

                  {/* Intelligent Searchable Airport Autocomplete */}
                  <div>
                    <label className="flex items-center justify-between text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-2">
                      <span>Service Airport *</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (state.airportCode) {
                            navigate({ to: "/airports/$code", params: { code: state.airportCode } });
                          }
                        }}
                        className="text-[10px] text-[#7c3aed] hover:underline font-semibold font-sans flex items-center gap-1 cursor-pointer"
                      >
                        <span>Explore {state.airportCode} Hub Page</span>
                        <span>→</span>
                      </button>
                    </label>
                    <IntelligentAirportAutocomplete
                      value={state.airportCode ? `${AIRPORT_REGISTRY[state.airportCode]?.city || state.airportCode} (${state.airportCode})` : ""}
                      onSelect={(ap) => {
                        const entry = activeAirportsList.find((a) => a.code === ap.code) || AIRPORT_REGISTRY[ap.code];
                        updateState({
                          airportCode: ap.code,
                          airportName: entry?.name || `${ap.code} International Airport`,
                          isFlightValidated: false,
                          validatedFlightData: null,
                          flightErrorMessage: undefined,
                          routeMatchError: undefined,
                        });
                      }}
                      placeholder="Type Airport Code (e.g. DEL, BOM), City or Name..."
                    />
                  </div>

                  {/* Direction Selector */}
                  <div>
                    <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-2">
                      Flight Direction / Journey Type *
                    </label>
                    <div className="p-1.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-1">
                      {[
                        { id: "arrival", label: "Arrival" },
                        { id: "departure", label: "Departure" },
                        { id: "transit", label: "Transit / Connection" },
                      ].map((dir) => (
                        <button
                          key={dir.id}
                          type="button"
                          onClick={() =>
                            updateState({
                              direction: dir.id as any,
                              isFlightValidated: false,
                              validatedFlightData: null,
                              flightErrorMessage: undefined,
                              routeMatchError: undefined,
                            })
                          }
                          className={`flex-1 py-3 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
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

                  {/* Service Input Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {requiredFields.requiresFlight && (
                      <div>
                        <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                          Flight Number *
                        </label>
                        <input
                          type="text"
                          value={state.flightNumber}
                          onChange={(e) =>
                            updateState({
                              flightNumber: e.target.value.toUpperCase(),
                              isFlightValidated: false,
                              validatedFlightData: null,
                              flightErrorMessage: undefined,
                              routeMatchError: undefined,
                            })
                          }
                          placeholder="e.g. AI2424, EK504"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-600 shadow-xs font-mono font-bold uppercase"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Service / Travel Date *
                      </label>
                      <input
                        type="date"
                        value={state.serviceDate}
                        onChange={(e) => updateState({ serviceDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-600 shadow-xs font-mono font-bold"
                      />
                    </div>

                    {!requiredFields.requiresFlight && (
                      <div>
                        <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                          Service / Pickup Time *
                        </label>
                        <input
                          type="time"
                          value={state.serviceTime || "12:00"}
                          onChange={(e) => updateState({ serviceTime: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-600 shadow-xs font-mono font-bold"
                        />
                      </div>
                    )}

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

                  {/* FLIGHT VERIFICATION SECTION (ONLY FOR FLIGHT-REQUIRED SERVICES) */}
                  {requiredFields.requiresFlight && (
                    <>
                      {state.flightErrorMessage && (
                        <div className="p-5 rounded-3xl bg-red-50 border border-red-200 text-red-900 space-y-4 shadow-sm">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h4 className="text-xs font-mono font-extrabold uppercase tracking-wider text-red-800">
                                Verification / Route Notice
                              </h4>
                              <p className="text-xs font-sans leading-relaxed font-medium">
                                {state.flightErrorMessage}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-red-200/60">
                            <button
                              type="button"
                              onClick={() => {
                                updateState({ flightErrorMessage: undefined, routeMatchError: undefined });
                                const el = document.querySelector("select");
                                if (el) el.focus();
                              }}
                              className="px-4 py-2.5 rounded-xl bg-white border border-red-300 text-red-900 hover:bg-red-100 font-mono text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
                            >
                              [ Change Airport ]
                            </button>
                            <button
                              type="button"
                              onClick={() => updateState({ flightNumber: "", flightErrorMessage: undefined, routeMatchError: undefined })}
                              className="px-4 py-2.5 rounded-xl bg-white border border-red-300 text-red-900 hover:bg-red-100 font-mono text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
                            >
                              [ Change Flight ]
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={handleSearchFlight}
                              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] uppercase tracking-wider font-bold transition shadow-xs cursor-pointer"
                            >
                              [ Try Again ]
                            </button>
                          </div>
                        </div>
                      )}

                      {state.isFlightValidated && state.validatedFlightData ? (
                        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-5 shadow-xl">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono uppercase font-bold tracking-wider">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>✓ Flight Verified for {state.airportName}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                              {state.validatedFlightData.status || "Scheduled"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-y border-slate-800/80 py-4 font-mono">
                            <div>
                              <div className="text-xl sm:text-2xl font-extrabold text-amber-400">{state.validatedFlightData.origin.code || "DEP"}</div>
                              <div className="text-xs text-slate-300 font-sans">{state.validatedFlightData.origin.city || state.validatedFlightData.origin.name || "Origin"}</div>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] text-amber-400 font-bold tracking-widest uppercase mb-1">
                                {state.validatedFlightData.duration || "Direct"}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="h-[2px] w-8 sm:w-16 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                                <Plane className="w-4 h-4 text-amber-500" />
                                <div className="h-[2px] w-8 sm:w-16 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                              </div>
                              <div className="text-[9px] text-slate-400 mt-1 font-bold">{state.validatedFlightData.carrier.name || state.validatedFlightData.flightNum}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl sm:text-2xl font-extrabold text-amber-400">{state.validatedFlightData.destination.code || "ARR"}</div>
                              <div className="text-xs text-slate-300 font-sans">{state.validatedFlightData.destination.city || state.validatedFlightData.destination.name || "Destination"}</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentStep(2);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="flex-1 py-4 px-8 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-mono text-xs font-extrabold uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <span>Continue to Select Services</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => updateState({ flightStateMode: "IDLE", isFlightValidated: false, validatedFlightData: null })}
                              className="py-4 px-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
                            >
                              Search Another Flight
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <button
                            type="button"
                            onClick={() => updateState({ isManualMode: !state.isManualMode, flightStateMode: state.isManualMode ? "IDLE" : "MANUAL" })}
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
                                <span>Verifying Flight...</span>
                              </>
                            ) : (
                              <>
                                <Search className="w-4 h-4" />
                                <span>Verify Flight</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* DIRECT CONTINUE BUTTON FOR NON-FLIGHT SERVICES (e.g. Airport Transfer) */}
                  {!requiredFields.requiresFlight && (
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-end">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          if (!state.airportCode) {
                            toast.error("Please select a service airport.");
                            return;
                          }
                          if (!state.serviceDate) {
                            toast.error("Please select a travel date.");
                            return;
                          }
                          setCurrentStep(2);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white font-mono text-xs font-extrabold uppercase tracking-widest shadow-md hover:scale-105 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <span>Continue to Select Options</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

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
                        onClose={() => updateState({ isManualMode: false, flightStateMode: "IDLE" })}
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

              {/* STEP 2: SELECT SERVICES FROM MASTER AIRPORT CATALOG */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* SERVICE FETCH ERROR STATE */}
                  {state.serviceFetchError && (
                    <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-extrabold text-amber-950 font-mono uppercase">
                            Service Catalog Error
                          </h4>
                          <p className="text-xs text-amber-800 font-sans mt-1">
                            {state.serviceFetchError}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => updateState({ isLoadingServices: true })}
                          className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                        >
                          Retry Fetching Services
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditDrawerOpen(true)}
                          className="px-5 py-2.5 rounded-xl bg-white border border-amber-300 text-amber-950 font-mono text-xs font-bold uppercase tracking-wider transition hover:bg-amber-100 cursor-pointer"
                        >
                          Edit Journey
                        </button>
                      </div>
                    </div>
                  )}

                  {/* UNCOVERED AIRPORT STATE */}
                  {!state.isLoadingServices && !state.serviceFetchError && state.isAirportCovered === false && (
                    <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white border border-slate-800 text-center space-y-6 shadow-lg">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-7 h-7" />
                      </div>

                      <div className="max-w-md mx-auto space-y-2">
                        <span className="text-[10px] font-mono text-amber-400 font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
                          Services Unavailable at this Airport
                        </span>
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white pt-2">
                          {state.isFlightLocked
                            ? `Sorry, we don't currently offer ${state.direction} services at ${state.airportName || state.airportCode}.`
                            : `We currently don't offer services at ${state.airportName || state.airportCode} for ${state.direction} journeys.`
                          }
                        </h3>
                        <p className="text-xs text-slate-400 font-sans leading-relaxed">
                          Shafsky Aviation VIP concierge services are rapidly expanding. Contact our 24/7 Command Desk for bespoke arrangement or custom airport dispatch.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            window.open(
                              "https://wa.me/919876543210?text=" +
                                encodeURIComponent(
                                  `VIP Assistance Request for ${state.airportName || state.airportCode} (${state.direction})`
                                ),
                              "_blank"
                            );
                          }}
                          className="px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white font-mono text-xs font-extrabold uppercase tracking-widest shadow-md hover:scale-105 transition-all cursor-pointer"
                        >
                          Contact Team for VIP Assistance
                        </button>

                        {!state.isFlightLocked && (
                          <button
                            type="button"
                            onClick={() => setIsEditDrawerOpen(true)}
                            className="px-6 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Edit Journey / Change Airport
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* COVERED AIRPORT STATE */}
                  {!state.isLoadingServices && !state.serviceFetchError && state.isAirportCovered !== false && (
                    <>
                      <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-amber-800 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                            Step 2 of 5 — Service Selection
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                            Select Airport Package
                          </h2>
                          <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                            Airport-filtered package catalog for {state.airportName || state.airportCode}. Select an available package to proceed.
                          </p>
                        </div>
                        {!state.isFlightLocked && (
                          <button
                            type="button"
                            onClick={() => setIsEditDrawerOpen(true)}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Journey</span>
                          </button>
                        )}
                      </div>

                      {/* Locked Airport + Direction Banner (shown when flight-verified) */}
                      {state.isFlightLocked && (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <Lock className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                                Locked from Flight Verification
                              </div>
                              <div className="text-sm font-bold text-slate-900">
                                {state.airportName || state.airportCode} — <span className="capitalize">{state.direction}</span>
                              </div>
                              {state.flightNumber && (
                                <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                                  Flight {state.flightNumber}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        </div>
                      )}

                      {/* Airport Package Grid */}
                      <AirportServiceSelection
                        state={state}
                        onChange={(fields) => updateState(fields)}
                        availablePackages={state.availablePackagesList}
                        catalogCurrency={state.catalogCurrency}
                        priceBreakdown={priceBreakdown}
                        onSelectPackage={(id) => selectPackage(id)}
                        selectedTerminal={state.selectedTerminal}
                      />

                      {/* Action Buttons */}
                      <div className="pt-4 flex items-center justify-between">
                        {!state.isFlightLocked ? (
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                          >
                            Back to Step 1
                          </button>
                        ) : (
                          <div />
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setCurrentStep(3);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-mono text-xs font-extrabold uppercase tracking-widest shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <span>Continue to Passenger Details</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STEP 3: PASSENGER DETAILS */}
              {currentStep === 3 && (
                <PassengerDetailsStep
                  state={state}
                  onChange={(fields) => updateState(fields)}
                  onBack={() => setCurrentStep(2)}
                  onSaveDraft={async () => {
                    const saved = await saveDraftWithBackend();
                    if (saved) {
                      setCurrentStep(4);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                    return saved;
                  }}
                  priceBreakdown={priceBreakdown}
                />
              )}

              {/* STEP 4: REVIEW SUMMARY & VALIDATION */}
              {currentStep === 4 && (
                <BookingSummaryReviewStep
                  state={state}
                  bookingRef={bookingRef || "SHF-DRAFT"}
                  priceBreakdown={priceBreakdown}
                  onEditJourney={() => setCurrentStep(1)}
                  onEditServices={() => setCurrentStep(2)}
                  onEditPassengers={() => setCurrentStep(3)}
                  onProceedToPayment={handleSubmit}
                  validateWithBackend={validateWithBackend}
                />
              )}

              {/* STEP 5: BOOKING CONFIRMED */}
              {currentStep === 5 && (
                <BookingSuccessPass
                  title="Booking Confirmed"
                  subtitle={`Your concierge service at ${state.airportCode} has been requested.`}
                  badge="SUCCESS"
                  bookingRef={bookingRef || "SHF-AIR-CONFIRMED"}
                  guestSummary={`${state.fullName || "Guest"} — ${state.guestCount} Pax`}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Edit Journey Drawer */}
        <EditJourneyDrawer
          isOpen={isEditDrawerOpen}
          onClose={() => setIsEditDrawerOpen(false)}
          flightData={state.validatedFlightData}
          serviceDate={state.serviceDate}
          onSave={(updatedData) => {
            updateState({
              flightNumber: updatedData.flightNum,
              serviceDate: updatedData.date,
              serviceTime: updatedData.time,
            });
            setIsEditDrawerOpen(false);
          }}
        />
      </div>
    </div>
  );
}
