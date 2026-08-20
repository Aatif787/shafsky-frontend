import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, AlertCircle, AlertTriangle, RefreshCw, Edit2, MapPin } from "lucide-react";
import { BookingProgressHeader } from "../../shared/BookingProgressHeader";
import { BookingSuccessPass } from "../../shared/BookingSuccessPass";
import { useAirportWorkflow, resolveBookingServiceTime } from "../../hooks/useAirportWorkflow";
import { AirportServiceSelection } from "./AirportServiceSelection";
import { EditJourneyDrawer } from "../../shared/EditJourneyDrawer";
import { IntelligentAirportAutocomplete } from "../../shared/IntelligentAirportAutocomplete";
import { BookingSummaryReviewStep } from "./BookingSummaryReviewStep";
import { PassengerDetailsStep } from "./PassengerDetailsStep";
import { ApiClient } from "@/lib/ApiClient";

interface AirportWorkflowProps {
  searchParams?: any;
}

export function AirportWorkflow({ searchParams }: AirportWorkflowProps) {
  const navigate = useNavigate();

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
    validateWithBackend,
    saveDraftWithBackend,
    priceBreakdown,
    totalPrice,
  } = useAirportWorkflow(searchParams);

  const isAirportPageBooking = state.bookingSource === "airport_page";

  const applyServiceDirection = useCallback(
    (dir: "arrival" | "departure" | "transit") => {
      const locked = (state.airportCode || "").trim().toUpperCase();
      const next: Parameters<typeof updateState>[0] = {
        direction: dir,
        isFlightValidated: false,
        validatedFlightData: null,
        flightErrorMessage: undefined,
        routeMatchError: undefined,
      };
      if (isAirportPageBooking && locked) {
        next.airportCode = locked;
        next.airportName = state.airportName;
        if (dir === "arrival") {
          next.destCode = locked;
          next.transitCode = "";
        } else if (dir === "departure") {
          next.originCode = locked;
          next.transitCode = "";
        } else {
          next.transitCode = locked;
        }
      }
      updateState(next);
    },
    [isAirportPageBooking, state.airportCode, state.airportName, updateState]
  );

  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

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
          service_time: state.serviceTime || undefined,
          flight_type: state.travelType?.toUpperCase(),
          selected_service_slugs: selectedSlugs,
          guest_count: state.guestCount || 1,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success !== false && data.booking_reference) {
            setBookingRef(data.booking_reference);
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

  const stepConfigs = useMemo(
    () => [
      { title: "Journey Details", sub: "Choose service type and airports.", estTime: "Est. 10 sec", progress: 20 },
      { title: "Select Package", sub: "Choose your airport concierge package.", estTime: "Est. 20 sec", progress: 40 },
      { title: "Guest & Flight", sub: "Flight number and lead guest contact.", estTime: "Est. 30 sec", progress: 70 },
      { title: "Review & Pay", sub: "Confirm itinerary and complete booking.", estTime: "Est. 10 sec", progress: 90 },
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

  const handleSubmit = useCallback(async () => {
    if (!state.fullName || !state.phone || !state.email) {
      toast.error("Please fill in Lead Guest Name, Phone Number, and Email.");
      return;
    }
    if (!state.isFlightValidated || !(state.flightNumber || "").trim()) {
      toast.error("Please verify the flight number or enter flight details manually before payment.");
      return;
    }

    setBusy(true);

    const serviceClock = resolveBookingServiceTime(state) || state.serviceTime;
    const ref = bookingRef || `${getRefPrefix()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      const res = await ApiClient.fetchWithAuth("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          passengerName: state.fullName,
          passengerEmail: state.email,
          passengerPhone: state.phone,
          serviceCategory: "Airport Assistance",
          serviceType: state.selectedPackage || state.selectedService || "Meet & Assist",
          flightNum: state.flightNumber || "MANUAL-ENTRY",
          originCode: state.originCode || state.validatedFlightData?.origin?.code,
          destCode: state.destCode || state.validatedFlightData?.destination?.code,
          metadataJson: {
            journey_type: state.direction,
            flight_type: state.travelType,
            travel_type: state.travelType,
            transit_code: state.transitCode,
            service_airport: state.airportCode,
          },
          departureTime: state.serviceDate && serviceClock ? new Date(`${state.serviceDate}T${serviceClock}:00`) : new Date(),
          totalAmount: totalPrice,
          currency: state.catalogCurrency || "INR",
          notes: state.specialRequests || `Airport: ${state.airportCode}, Direction: ${state.direction}`,
        }),
      });
      const result = await res.json().catch(() => null);

      if (res.ok && result && result.success) {
        setBookingRef(result.data?.bookingRef || result.data?.booking_ref || ref);
        setCurrentStep(5);
        toast.success("Booking request submitted successfully!");
      } else {
        toast.error("Error creating booking. Please try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Failed to submit booking. Please try again.");
    } finally {
      setBusy(false);
    }
  }, [state, totalPrice, getRefPrefix, setCurrentStep, setBusy, setBookingRef, bookingRef]);

  const handleGoBack = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (currentStep <= 1) {
      const code = (state.airportCode || "").trim().toUpperCase();
      if (code) {
        navigate({ to: "/airports/$code", params: { code } });
        return;
      }
      navigate({ to: "/" });
      return;
    }
    if (currentStep >= 5) {
      navigate({ to: "/" });
      return;
    }
    setCurrentStep(currentStep - 1);
  }, [currentStep, state.airportCode, navigate, setCurrentStep]);

  return (
    <div className="space-y-6">
      <BookingProgressHeader
        currentStep={Math.min(currentStep, 5)}
        maxSteps={5}
        progress={currentConfig.progress}
        title={currentConfig.title}
        estTime={currentConfig.estTime}
        onSaveDraft={handleSaveDraft}
        onBack={handleGoBack}
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
              className="p-6 sm:p-10 rounded-[36px] bg-white border border-slate-200 shadow-sm relative overflow-visible text-slate-900"
            >
              {/* STEP 1: SEARCH & ENTER JOURNEY DETAILS */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-amber-800 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                      Step 1 of 5 — Journey Details
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      {isAirportPageBooking
                        ? `${state.airportName || state.airportCode} Reservation`
                        : "Select Airport & Enter Travel Details"}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      {isAirportPageBooking
                        ? "Choose arrival, departure, or transit. This airport is already selected as the service location."
                        : `Choose service type, travel type, then origin and destination. The existing ${state.airportCode || "airport"} service catalogue opens after validation.`}
                    </p>
                  </div>

                  {/* Direction Selector */}
                  <div>
                    <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-2">
                      Service Type *
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
                          onClick={() => applyServiceDirection(dir.id as "arrival" | "departure" | "transit")}
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

                  <div>
                    <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-2">
                      Travel Type *
                    </label>
                    <div className="p-1.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-1">
                      {(["domestic", "international"] as const).map((kind) => (
                        <button
                          key={kind}
                          type="button"
                          onClick={() =>
                            updateState({
                              travelType: kind,
                              isFlightValidated: false,
                              validatedFlightData: null,
                            })
                          }
                          className={`flex-1 py-3 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                            state.travelType === kind
                              ? "bg-white text-amber-900 shadow-sm border border-slate-200/80"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {kind}
                        </button>
                      ))}
                    </div>
                  </div>

                  {isAirportPageBooking && state.airportCode && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                        Booking Airport
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-slate-900">
                        <MapPin className="w-4 h-4 text-[#7c3aed] shrink-0" />
                        <span className="font-serif font-bold text-lg">
                          {state.airportName || state.airportCode}
                          {state.airportCode ? ` (${state.airportCode})` : ""}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-600 font-sans">
                        {state.direction === "arrival"
                          ? "Arrival services use this airport as the destination. Origin comes from the flight after verification."
                          : state.direction === "departure"
                            ? "Departure services use this airport as the origin. Destination comes from the flight after verification."
                            : "Transit services are provided at this airport. Connecting origin and destination come from the flight after verification."}
                      </p>
                    </div>
                  )}

                  {!isAirportPageBooking && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-2">
                        Origin Airport *
                      </label>
                      <IntelligentAirportAutocomplete
                        key={`wf-origin-${state.direction}`}
                        mode={state.direction === "departure" ? "supported" : "global"}
                        journeyType={state.direction === "departure" ? "DEPARTURE" : undefined}
                        value={state.originCode || ""}
                        onSelect={(ap) => {
                          const nextOrigin = ap.code;
                          const nextAirport =
                            state.direction === "departure" ? nextOrigin : state.airportCode;
                          updateState({
                            originCode: nextOrigin,
                            airportCode: nextAirport || state.airportCode,
                            airportName: state.direction === "departure" ? ap.name : state.airportName,
                            isFlightValidated: false,
                            validatedFlightData: null,
                          });
                        }}
                        placeholder={state.direction === "departure" ? "Search supported origin airport" : "Search origin airport"}
                      />
                    </div>
                    {state.direction === "transit" && (
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-2">
                          Transit Airport *
                        </label>
                        <IntelligentAirportAutocomplete
                          mode="supported"
                          journeyType="TRANSIT"
                          value={state.transitCode || ""}
                          onSelect={(ap) => {
                            updateState({
                              transitCode: ap.code,
                              airportCode: ap.code,
                              airportName: ap.name,
                              isFlightValidated: false,
                              validatedFlightData: null,
                            });
                          }}
                          placeholder="Search supported transit airport"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-2">
                        Destination Airport *
                      </label>
                      <IntelligentAirportAutocomplete
                        key={`wf-dest-${state.direction}`}
                        mode={state.direction === "arrival" ? "supported" : "global"}
                        journeyType={state.direction === "arrival" ? "ARRIVAL" : undefined}
                        value={state.destCode || ""}
                        onSelect={(ap) => {
                          const nextDest = ap.code;
                          const nextAirport =
                            state.direction === "arrival" ? nextDest : state.airportCode;
                          updateState({
                            destCode: nextDest,
                            airportCode: nextAirport || state.airportCode,
                            airportName: state.direction === "arrival" ? ap.name : state.airportName,
                            isFlightValidated: false,
                            validatedFlightData: null,
                          });
                        }}
                        placeholder={state.direction === "arrival" ? "Search supported destination airport" : "Search destination airport"}
                      />
                    </div>
                  </div>
                  )}

                  {!isAirportPageBooking && state.airportCode && (
                    <p className="text-[11px] font-mono text-slate-600">
                      Selected airport:{" "}
                      <span className="font-bold text-slate-900">
                        {state.airportName ? `${state.airportName} (${state.airportCode})` : state.airportCode}
                      </span>
                      {" — "}
                      <button
                        type="button"
                        onClick={() => navigate({ to: "/airports/$code", params: { code: state.airportCode } })}
                        className="text-[#7c3aed] hover:underline font-semibold"
                      >
                        Open existing {state.airportCode} hub
                      </button>
                    </p>
                  )}

                  {/* Service Input Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleGoBack}
                      className="px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!state.airportCode) {
                          toast.error(
                            isAirportPageBooking
                              ? "Booking airport is missing. Please return to the airport page and try again."
                              : "Please complete origin and destination."
                          );
                          return;
                        }
                        if (!state.serviceDate) {
                          toast.error("Please select a travel date.");
                          return;
                        }
                        setCurrentStep(2);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white font-mono text-xs font-extrabold uppercase tracking-widest shadow-md hover:scale-105 transition-all cursor-pointer"
                    >
                      <span>Continue to packages</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
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
                            ? `Sorry, we do not currently offer ${state.direction} services at ${state.airportName || state.airportCode}.`
                            : `We currently do not offer services at ${state.airportName || state.airportCode} for ${state.direction} journeys.`}
                        </h3>
                        <p className="text-xs text-slate-400 font-sans leading-relaxed">
                          Shafsky Aviation VIP concierge services are rapidly expanding. Contact our 24/7 Command Desk for bespoke arrangement or custom airport dispatch.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleGoBack}
                          className="px-6 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-2"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            window.open(
                              "https://wa.me/919876543210?text=" +
                                encodeURIComponent(
                                  `VIP Assist Request for ${state.airportName || state.airportCode} (${state.direction})`
                                ),
                              "_blank"
                            );
                          }}
                          className="px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white font-mono text-xs font-extrabold uppercase tracking-widest shadow-md hover:scale-105 transition-all cursor-pointer"
                        >
                          Contact Team for VIP Assist
                        </button>

                        {!state.isFlightLocked && !isAirportPageBooking && (
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
                            Step 2 of 5 — Package
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                            Select Airport Package
                          </h2>
                          <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                            Airport-filtered package catalog for {state.resolvedAirport?.name || state.airportName || state.airportCode}. Select an available package to proceed.
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
                        <button
                          type="button"
                          onClick={handleGoBack}
                          className="px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer inline-flex items-center gap-2"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (!state.selectedPackageId) {
                              toast.error("Please select a package to continue.");
                              return;
                            }
                            setCurrentStep(3);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-mono text-xs font-extrabold uppercase tracking-widest shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <span>Continue</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STEP 3: GUEST DETAILS + FLIGHT */}
              {currentStep === 3 && (
                <PassengerDetailsStep
                  state={state}
                  onChange={(fields) => updateState(fields)}
                  onBack={() => setCurrentStep(2)}
                  onLookupFlight={validateAndSearchFlight}
                  onManualFlight={(manualData) => setManualFlightData(manualData)}
                  lookupBusy={busy}
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
                  onBack={handleGoBack}
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
