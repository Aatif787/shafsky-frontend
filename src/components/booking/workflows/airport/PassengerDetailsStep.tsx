import React, { useEffect, useRef, useState } from "react";
import {
  User,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  FileText,
  Plane,
  Search,
} from "lucide-react";
import { AirportWorkflowState, formatBookingServiceDateTime } from "../../hooks/useAirportWorkflow";
import { indianMobileDigits } from "../../validation/sharedValidation";
import { PriceBreakdown } from "../../utils/serviceAirportResolver";
import { FlightItineraryStrip } from "./FlightItineraryStrip";
import { ManualFlightEntryForm } from "../../shared/ManualFlightEntryForm";
import { FlightData } from "@/services/flight/FlightTypes";

interface PassengerDetailsStepProps {
  state: AirportWorkflowState;
  onChange: (fields: Partial<AirportWorkflowState>) => void;
  onBack: () => void;
  onSaveDraft: () => Promise<boolean>;
  onLookupFlight: () => Promise<boolean>;
  onManualFlight: (flight: FlightData) => void;
  lookupBusy?: boolean;
  priceBreakdown?: PriceBreakdown;
}

const FLIGHT_NUM_RE = /^[A-Z0-9]{2,3}\d{1,4}[A-Z]?$/;

function normalizeFlightNumber(value: string): string {
  return value.toUpperCase().replace(/\s+/g, "");
}

export function PassengerDetailsStep({
  state,
  onChange,
  onBack,
  onSaveDraft,
  onLookupFlight,
  onManualFlight,
  lookupBusy = false,
  priceBreakdown,
}: PassengerDetailsStepProps) {
  const [showSpecialRequests, setShowSpecialRequests] = useState<boolean>(
    Boolean(state.specialRequests)
  );
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const lastAutoLookup = useRef("");
  const lookupInFlight = useRef(false);
  const lookupFn = useRef(onLookupFlight);
  lookupFn.current = onLookupFlight;

  const currencySymbol =
    state.catalogCurrency === "USD" ? "$" : state.catalogCurrency === "AED" ? "AED " : "₹";
  const guestCount = state.guestCount || 1;

  const backendFieldErrors = state.draftFieldErrors || {};

  const getFieldError = (field: string) => {
    return localErrors[field] || backendFieldErrors[field] || "";
  };

  const flightReady = Boolean(state.isFlightValidated && state.validatedFlightData?.flightNum);
  const normalizedFlight = normalizeFlightNumber(state.flightNumber || "");

  useEffect(() => {
    if (flightReady) return;
    if (lookupBusy || lookupInFlight.current) return;
    if (!FLIGHT_NUM_RE.test(normalizedFlight)) return;
    if (lastAutoLookup.current === normalizedFlight) return;
    if (!state.serviceDate) return;

    const timer = window.setTimeout(async () => {
      lastAutoLookup.current = normalizedFlight;
      lookupInFlight.current = true;
      try {
        await lookupFn.current();
      } finally {
        lookupInFlight.current = false;
      }
    }, 750);

    return () => window.clearTimeout(timer);
  }, [normalizedFlight, flightReady, lookupBusy, state.serviceDate]);

  const validateLocalForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!normalizedFlight || normalizedFlight.length < 3) {
      errs.flight_number = "Flight number is required (e.g. AI2020).";
    } else if (!FLIGHT_NUM_RE.test(normalizedFlight)) {
      errs.flight_number = "Use a valid IATA flight number (airline code + digits, e.g. AI2020).";
    }

    const nameVal = state.fullName.trim();
    if (!nameVal || nameVal.length < 2) {
      errs.full_name = "Please enter a valid lead passenger name (min 2 characters).";
    }

    const emailVal = state.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      errs.email = "Please enter a valid email address (e.g. name@domain.com).";
    }

    const phoneVal = indianMobileDigits(state.phone);
    if (!phoneVal) {
      errs.phone = "Enter a 10-digit Indian mobile number (e.g. 9876543210).";
    }

    if (state.guestCount < 1) {
      errs.guest_count = "Passenger count must be at least 1.";
    }

    setLocalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLocalForm()) return;

    if (!state.isFlightValidated) {
      const found = await onLookupFlight();
      if (!found) {
        onChange({ isManualMode: true });
        setLocalErrors((prev) => ({
          ...prev,
          flight_number:
            state.flightErrorMessage ||
            "This flight could not be verified. Enter the itinerary manually to continue — no further lookup is required.",
        }));
        return;
      }
    }

    await onSaveDraft();
  };

  const handleFlightNumberChange = (raw: string) => {
    const next = normalizeFlightNumber(raw);
    lastAutoLookup.current = "";
    onChange({
      flightNumber: next,
      isFlightValidated: false,
      validatedFlightData: null,
                    isFlightLocked: false,
                    flightErrorMessage: undefined,
                    routeMatchError: undefined,
                    flightStateMode: "IDLE",
                    serviceTime: "",
                  });
    if (localErrors.flight_number) setLocalErrors((p) => ({ ...p, flight_number: "" }));
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-[10px] font-mono text-amber-800 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
          Step 3 of 5 — Guest & Flight
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
          Guest details
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Flight number is required. We look up the itinerary automatically; if it cannot be found, enter times and airports on this page.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-2 text-slate-900 font-serif font-bold text-lg border-b border-slate-100 pb-3">
          <Plane className="w-5 h-5 text-amber-600" />
          <span>Flight number</span>
          <span className="text-amber-600">*</span>
        </div>

        {flightReady ? (
          <div className="space-y-4">
            <FlightItineraryStrip flight={state.validatedFlightData} />
            {state.flightStateMode === "MANUAL" && (
              <p className="text-xs text-slate-600 font-sans">
                Schedule saved from manual entry. Concierge will operate against this itinerary.
              </p>
            )}
            <button
              type="button"
              onClick={() =>
                onChange({
                  isFlightValidated: false,
                  validatedFlightData: null,
                  isFlightLocked: false,
                  isManualMode: false,
                  flightStateMode: "IDLE",
                  flightErrorMessage: undefined,
                  serviceTime: "",
                })
              }
              className="text-xs font-mono font-bold text-slate-600 underline"
            >
              Change flight
            </button>
          </div>
        ) : (
          <>
            <div>
              <label
                htmlFor="flight_number"
                className="block text-xs font-mono text-slate-900 uppercase tracking-wider font-bold mb-1.5"
              >
                Flight Number <span className="text-amber-600">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="flight_number"
                  type="text"
                  required
                  autoComplete="off"
                  spellCheck={false}
                  value={state.flightNumber}
                  onChange={(e) => handleFlightNumberChange(e.target.value)}
                  onBlur={() => {
                    if (FLIGHT_NUM_RE.test(normalizedFlight) && !flightReady && lastAutoLookup.current !== normalizedFlight) {
                      lastAutoLookup.current = normalizedFlight;
                      void onLookupFlight();
                    }
                  }}
                  placeholder="E.G. AI2020"
                  aria-invalid={Boolean(getFieldError("flight_number") || state.flightErrorMessage)}
                  className={`w-full max-w-sm px-4 py-3.5 rounded-2xl bg-slate-50 text-slate-900 text-sm font-mono font-bold uppercase transition-all outline-none border ${
                    getFieldError("flight_number") || state.flightErrorMessage
                      ? "border-rose-500 bg-rose-50/30 focus:ring-2 focus:ring-rose-500"
                      : "border-slate-200 hover:border-slate-300 focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                  }`}
                />
                <button
                  type="button"
                  disabled={lookupBusy || !FLIGHT_NUM_RE.test(normalizedFlight)}
                  onClick={() => {
                    lastAutoLookup.current = normalizedFlight;
                    void onLookupFlight();
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-800 text-white font-mono text-xs font-extrabold uppercase tracking-widest disabled:opacity-50"
                >
                  {lookupBusy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>{lookupBusy ? "Checking…" : "Find flight"}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-sans">
                Route, terminal, and times appear after verification. Wrong number? Use manual entry — lookup is skipped after you save it.
              </p>
            </div>

            {(getFieldError("flight_number") || state.flightErrorMessage) && (
              <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{getFieldError("flight_number") || state.flightErrorMessage}</span>
              </p>
            )}

            {state.validatedFlightData && !state.isFlightValidated && (
              <FlightItineraryStrip flight={state.validatedFlightData} />
            )}

            <button
              type="button"
              onClick={() => onChange({ isManualMode: !state.isManualMode })}
              className="text-xs font-mono font-bold text-slate-600 underline"
            >
              {state.isManualMode ? "Hide manual entry" : "Enter flight details manually"}
            </button>

            {state.isManualMode && (
              <ManualFlightEntryForm
                direction={state.direction}
                submitLabel="Save flight details"
                initialValues={{
                  flightNum: state.flightNumber,
                  depDate: state.serviceDate,
                  arrDate: state.serviceDate,
                  depAirportCode: state.originCode || (state.direction === "departure" ? state.airportCode : ""),
                  arrAirportCode: state.destCode || (state.direction === "arrival" ? state.airportCode : ""),
                }}
                onClose={() => onChange({ isManualMode: false })}
                onSubmit={(manualData) => {
                  onManualFlight(manualData);
                  setLocalErrors((p) => ({ ...p, flight_number: "" }));
                }}
              />
            )}
          </>
        )}
      </div>

      {state.validationErrors && state.validationErrors.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs font-sans">
            <strong className="font-bold text-rose-950 font-mono uppercase tracking-wider block">
              Validation Alert
            </strong>
            {state.validationErrors.map((msg, i) => (
              <p key={i}>• {msg}</p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 text-slate-900 font-serif font-bold text-lg border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-amber-600" />
              <span>Lead Guest Contact Details</span>
            </div>

            <div>
              <label
                htmlFor="full_name"
                className="block text-xs font-mono text-slate-900 uppercase tracking-wider font-bold mb-1.5"
              >
                Lead Guest Full Name <span className="text-amber-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="full_name"
                  type="text"
                  required
                  value={state.fullName}
                  onChange={(e) => {
                    onChange({ fullName: e.target.value });
                    if (localErrors.full_name) setLocalErrors((p) => ({ ...p, full_name: "" }));
                  }}
                  placeholder="e.g. Lord Henry Sterling"
                  aria-invalid={Boolean(getFieldError("full_name"))}
                  aria-describedby="full_name_error"
                  className={`w-full px-4 py-3.5 rounded-2xl bg-slate-50 text-slate-900 text-sm font-sans font-medium transition-all outline-none border ${
                    getFieldError("full_name")
                      ? "border-rose-500 bg-rose-50/30 focus:ring-2 focus:ring-rose-500"
                      : "border-slate-200 hover:border-slate-300 focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                  }`}
                />
              </div>
              {getFieldError("full_name") && (
                <p id="full_name_error" className="text-xs text-rose-600 font-sans mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{getFieldError("full_name")}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-mono text-slate-900 uppercase tracking-wider font-bold mb-1.5"
                >
                  Email <span className="text-amber-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={state.email}
                    onChange={(e) => {
                      onChange({ email: e.target.value });
                      if (localErrors.email) setLocalErrors((p) => ({ ...p, email: "" }));
                    }}
                    placeholder="e.g. henry@sterling.com"
                    aria-invalid={Boolean(getFieldError("email"))}
                    aria-describedby="email_error"
                    className={`w-full px-4 py-3.5 rounded-2xl bg-slate-50 text-slate-900 text-sm font-sans font-medium transition-all outline-none border ${
                      getFieldError("email")
                        ? "border-rose-500 bg-rose-50/30 focus:ring-2 focus:ring-rose-500"
                        : "border-slate-200 hover:border-slate-300 focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    }`}
                  />
                </div>
                {getFieldError("email") && (
                  <p id="email_error" className="text-xs text-rose-600 font-sans mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{getFieldError("email")}</span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs font-mono text-slate-900 uppercase tracking-wider font-bold mb-1.5"
                >
                  Mobile / WhatsApp Number <span className="text-amber-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={state.phone}
                    onChange={(e) => {
                      onChange({ phone: e.target.value });
                      if (localErrors.phone) setLocalErrors((p) => ({ ...p, phone: "" }));
                    }}
                    placeholder="10-digit mobile, e.g. 9876543210"
                    aria-invalid={Boolean(getFieldError("phone"))}
                    aria-describedby="phone_error"
                    className={`w-full px-4 py-3.5 rounded-2xl bg-slate-50 text-slate-900 text-sm font-sans font-medium transition-all outline-none border ${
                      getFieldError("phone")
                        ? "border-rose-500 bg-rose-50/30 focus:ring-2 focus:ring-rose-500"
                        : "border-slate-200 hover:border-slate-300 focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    }`}
                  />
                </div>
                {getFieldError("phone") && (
                  <p id="phone_error" className="text-xs text-rose-600 font-sans mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{getFieldError("phone")}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-900 uppercase tracking-wider font-bold mb-2">
                Number of Passengers <span className="text-amber-600">*</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onChange({ guestCount: Math.max(1, guestCount - 1) })}
                  className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-lg flex items-center justify-center transition cursor-pointer"
                >
                  -
                </button>

                <div className="px-6 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 font-mono font-extrabold text-base min-w-[80px] text-center">
                  {guestCount} Pax
                </div>

                <button
                  type="button"
                  onClick={() => onChange({ guestCount: Math.min(20, guestCount + 1) })}
                  className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-lg flex items-center justify-center transition cursor-pointer"
                >
                  +
                </button>

                <span className="text-xs text-slate-500 font-sans ml-2">
                  (Includes lead guest + travelling companions)
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowSpecialRequests(!showSpecialRequests)}
                className="flex items-center justify-between w-full text-xs font-mono font-bold text-slate-800 uppercase tracking-wider hover:text-amber-700 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Special Requirements & Assist (Optional)</span>
                </span>
                {showSpecialRequests ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showSpecialRequests && (
                <div className="pt-3 space-y-3">
                  <textarea
                    value={state.specialRequests}
                    onChange={(e) => onChange({ specialRequests: e.target.value })}
                    rows={3}
                    placeholder="e.g. Wheelchair ramp assistance required, 4 heavy luggage bags, extra legroom buggy requested..."
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-sans focus:outline-none focus:border-amber-600 focus:bg-white transition"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Back to Services
            </button>

            <button
              type="submit"
              disabled={state.isSavingDraft || lookupBusy}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white font-mono text-xs font-extrabold uppercase tracking-widest shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
            >
              {state.isSavingDraft ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Saving your details...</span>
                </span>
              ) : (
                <>
                  <span>Continue to Summary & Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="lg:col-span-4 space-y-4 sticky top-24">
          <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Selected Journey</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                {state.direction}
              </span>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Airport:</span>
                <span className="font-bold text-white text-right">
                  {state.resolvedAirport?.name || state.airportName} ({state.resolvedAirport?.code || state.airportCode})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Date & Time:</span>
                <span className="font-bold text-white">
                  {formatBookingServiceDateTime(state)}
                </span>
              </div>

              {priceBreakdown?.packageItem && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">Package: {priceBreakdown.packageItem.title}</span>
                  <span className="font-mono font-bold text-amber-400">
                    {currencySymbol}{priceBreakdown.packageItem.price.toLocaleString()}
                  </span>
                </div>
              )}

              {priceBreakdown?.additionalServices && priceBreakdown.additionalServices.length > 0 && (
                <div className="space-y-1">
                  {priceBreakdown.additionalServices.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-300">
                      <span>• {s.title}</span>
                      <span className="font-mono font-bold text-white">
                        +{currencySymbol}{s.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between font-mono">
                <span className="text-[11px] text-slate-400 uppercase font-bold">Total ({guestCount} Pax)</span>
                <span className="text-xl font-extrabold text-amber-400">
                  {currencySymbol}{(priceBreakdown?.grandTotal || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
