import React from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, AlertCircle, AlertTriangle, MapPin } from "lucide-react";
import { type AirportWorkflowState } from "../../hooks/useAirportWorkflow";
import { IntelligentAirportAutocomplete } from "../../shared/IntelligentAirportAutocomplete";
import { isIndianAirportCode } from "@/data/airportRegistry";

export const AIRPORT_WORKFLOW_STEP_CONFIGS = [
  { title: "Journey Details", sub: "Choose service type and airports.", estTime: "Est. 10 sec", progress: 20 },
  { title: "Select Package", sub: "Choose your airport concierge package.", estTime: "Est. 20 sec", progress: 40 },
  { title: "Guest & Flight", sub: "Flight number and lead guest contact.", estTime: "Est. 30 sec", progress: 70 },
  { title: "Review & Pay", sub: "Confirm itinerary and complete booking.", estTime: "Est. 10 sec", progress: 90 },
  { title: "Booking Confirmed", sub: "Airside service request active.", estTime: "Completed", progress: 100 },
];

export function extractBookingApiError(result: any): string {
  const detail = result?.detail ?? result?.error;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
  if (detail && typeof detail === "object" && detail.msg) return String(detail.msg);
  return "";
}

export function loadRazorpayCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface AirportWorkflowStep1JourneyProps {
  state: AirportWorkflowState;
  isAirportPageBooking: boolean;
  applyServiceDirection: (dir: "arrival" | "departure" | "transit") => void;
  updateState: (fields: Partial<AirportWorkflowState>) => void;
  onNavigateToAirportHub: (code: string) => void;
  onGoBack: () => void;
  onContinueToPackages: () => void;
}

export const AirportWorkflowStep1Journey: React.FC<AirportWorkflowStep1JourneyProps> = ({
  state,
  isAirportPageBooking,
  applyServiceDirection,
  updateState,
  onNavigateToAirportHub,
  onGoBack,
  onContinueToPackages,
}) => {
  return (
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
              onClick={() => {
                const o = (state.originCode || "").trim().toUpperCase();
                const d = (state.destCode || "").trim().toUpperCase();
                const hasIntlAirport = (o && !isIndianAirportCode(o)) || (d && !isIndianAirportCode(d));
                const isBothDomestic = o && d && isIndianAirportCode(o) && isIndianAirportCode(d);

                if (kind === "domestic" && hasIntlAirport) {
                  const intlCode = o && !isIndianAirportCode(o) ? o : d;
                  toast.warning(
                    `Your route includes an international airport (${intlCode}). Domestic service cannot be selected.`
                  );
                  return;
                }
                if (kind === "international" && isBothDomestic) {
                  const msg = `Both airports (${o} and ${d}) are domestic within India. Switched to Domestic.`;
                  toast.info(msg);
                  updateState({
                    travelType: "domestic",
                    travelTypeAutoSwitchedReason: msg,
                    isFlightValidated: false,
                    validatedFlightData: null,
                  });
                  return;
                }

                updateState({
                  travelType: kind,
                  travelTypeAutoSwitchedReason: undefined,
                  isFlightValidated: false,
                  validatedFlightData: null,
                });
              }}
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

      {/* Informational Callout when Travel Type was Automatically Determined */}
      {state.travelTypeAutoSwitchedReason && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <span className="font-mono font-bold uppercase tracking-wider block text-amber-900">
              Service Category Notice
            </span>
            <p className="text-amber-800 font-sans">
              {state.travelTypeAutoSwitchedReason}
            </p>
          </div>
        </div>
      )}

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
                const nextOrigin = ap.code.trim().toUpperCase();
                const nextAirport =
                  state.direction === "departure" ? nextOrigin : state.airportCode;
                const currentDest = (state.destCode || "").trim().toUpperCase();
                const isNextOriginIntl = !isIndianAirportCode(nextOrigin);
                const isCurrentDestIntl = currentDest ? !isIndianAirportCode(currentDest) : false;
                const isRouteIntl = isNextOriginIntl || isCurrentDestIntl;

                let newTravelType = state.travelType;
                let reason: string | undefined = state.travelTypeAutoSwitchedReason;

                if (isRouteIntl && state.travelType !== "international") {
                  newTravelType = "international";
                  reason = `International airport selected (${nextOrigin}). Service category updated to International.`;
                  toast.info(reason);
                } else if (
                  !isRouteIntl &&
                  currentDest &&
                  isIndianAirportCode(currentDest) &&
                  isIndianAirportCode(nextOrigin) &&
                  state.travelType !== "domestic"
                ) {
                  newTravelType = "domestic";
                  reason = `Domestic route detected (${nextOrigin} → ${currentDest}). Service category updated to Domestic.`;
                  toast.info(reason);
                }

                updateState({
                  originCode: nextOrigin,
                  airportCode: nextAirport || state.airportCode,
                  airportName: state.direction === "departure" ? ap.name : state.airportName,
                  travelType: newTravelType,
                  travelTypeAutoSwitchedReason: reason,
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
                const nextDest = ap.code.trim().toUpperCase();
                const nextAirport =
                  state.direction === "arrival" ? nextDest : state.airportCode;
                const currentOrigin = (state.originCode || "").trim().toUpperCase();
                const isNextDestIntl = !isIndianAirportCode(nextDest);
                const isCurrentOriginIntl = currentOrigin ? !isIndianAirportCode(currentOrigin) : false;
                const isRouteIntl = isNextDestIntl || isCurrentOriginIntl;

                let newTravelType = state.travelType;
                let reason: string | undefined = state.travelTypeAutoSwitchedReason;

                if (isRouteIntl && state.travelType !== "international") {
                  newTravelType = "international";
                  reason = `International airport selected (${nextDest}). Service category updated to International.`;
                  toast.info(reason);
                } else if (
                  !isRouteIntl &&
                  currentOrigin &&
                  isIndianAirportCode(currentOrigin) &&
                  isIndianAirportCode(nextDest) &&
                  state.travelType !== "domestic"
                ) {
                  newTravelType = "domestic";
                  reason = `Domestic route detected (${currentOrigin} → ${nextDest}). Service category updated to Domestic.`;
                  toast.info(reason);
                }

                updateState({
                  destCode: nextDest,
                  airportCode: nextAirport || state.airportCode,
                  airportName: state.direction === "arrival" ? ap.name : state.airportName,
                  travelType: newTravelType,
                  travelTypeAutoSwitchedReason: reason,
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
            onClick={() => onNavigateToAirportHub(state.airportCode)}
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
            min={new Date().toISOString().split("T")[0]}
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
          onClick={onGoBack}
          className="px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          type="button"
          onClick={onContinueToPackages}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white font-mono text-xs font-extrabold uppercase tracking-widest shadow-md hover:scale-105 transition-all cursor-pointer"
        >
          <span>Continue to packages</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export interface AirportServiceErrorAndUncoveredStateProps {
  state: AirportWorkflowState;
  isAirportPageBooking: boolean;
  updateState: (fields: Partial<AirportWorkflowState>) => void;
  onOpenEditDrawer: () => void;
  onGoBack: () => void;
}

export const AirportServiceErrorAndUncoveredState: React.FC<AirportServiceErrorAndUncoveredStateProps> = ({
  state,
  isAirportPageBooking,
  updateState,
  onOpenEditDrawer,
  onGoBack,
}) => {
  return (
    <>
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
              onClick={onOpenEditDrawer}
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
              Shafsky Aviation VIP concierge services are rapidly expanding. Contact our 24/7 support team for custom arrangements or special airport requests.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onGoBack}
              className="px-6 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => {
                window.open(
                  "https://wa.me/919599087959?text=" +
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
                onClick={onOpenEditDrawer}
                className="px-6 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Edit Journey / Change Airport
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
