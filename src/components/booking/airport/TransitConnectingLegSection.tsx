import React from "react";
import {
  Plane,
  Clock,
  AlertCircle,
  PhoneCall,
  Check,
  Loader2,
  ChevronDown,
  CalendarDays,
} from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { AirlineLogo } from "../shared/AirlineLogo";
import { IntelligentAirlineAutocomplete } from "../shared/IntelligentAirlineAutocomplete";
import { FlightTimePicker } from "../shared/FlightTimePicker";
import { FlightData } from "@/services/flight/FlightTypes";
import { RouteMismatchInfo } from "./types";

export interface TransitConnectingLegSectionProps {
  airportCode: string;
  destCode: string;
  airportCityName: string;
  isManualMode2: boolean;
  setIsManualMode2: (v: boolean) => void;
  flightNumber2: string;
  setFlightNumber2: (v: string) => void;
  setIsFlightVerified2: (v: boolean) => void;
  setVerifiedFlight2: (v: FlightData | null) => void;
  flightFetchError2: string | null;
  setFlightFetchError2: (v: string | null) => void;
  isCutoffUrgent2: boolean;
  setIsCutoffUrgent2: (v: boolean) => void;
  handleVerifyFlight2: () => void;
  isFlightFetching2: boolean;
  datePopoverOpen2: boolean;
  setDatePopoverOpen2: (v: boolean) => void;
  dateValue2: Date;
  handleDateChange2: (v: Date | undefined) => void;
  todayStart: Date;
  serviceDate2: string;
  fullName: string;
  isFlightVerified2: boolean;
  verifiedFlight2: FlightData | null;
  manualAirline2: string;
  setManualAirline2: (v: string) => void;
  manualAirlineIata2: string;
  setManualAirlineIata2: (v: string) => void;
  manualFlightNum2: string;
  setManualFlightNum2: (v: string) => void;
  manualDatePopoverOpen2: boolean;
  setManualDatePopoverOpen2: (v: boolean) => void;
  manualDepTime2: string;
  setManualDepTime2: (v: string) => void;
  manualDepTerminal2: string;
  setManualDepTerminal2: (v: string) => void;
  manualArrTime2: string;
  setManualArrTime2: (v: string) => void;
  manualArrTerminal2: string;
  setManualArrTerminal2: (v: string) => void;
  routeMismatch2?: RouteMismatchInfo | null;
  setRouteMismatch2?: (info: RouteMismatchInfo | null) => void;
  confirmingRouteUpdate2?: boolean;
  setConfirmingRouteUpdate2?: (confirm: boolean) => void;
  handleKeepSelectedRoute2?: () => void;
  handleUseFlightRoute2?: () => void;
}

export const TransitConnectingLegSection: React.FC<TransitConnectingLegSectionProps> = ({
  airportCode,
  destCode,
  airportCityName,
  isManualMode2,
  setIsManualMode2,
  flightNumber2,
  setFlightNumber2,
  setIsFlightVerified2,
  setVerifiedFlight2,
  flightFetchError2,
  setFlightFetchError2,
  isCutoffUrgent2,
  setIsCutoffUrgent2,
  handleVerifyFlight2,
  isFlightFetching2,
  datePopoverOpen2,
  setDatePopoverOpen2,
  dateValue2,
  handleDateChange2,
  todayStart,
  serviceDate2,
  fullName,
  isFlightVerified2,
  verifiedFlight2,
  manualAirline2,
  setManualAirline2,
  manualAirlineIata2,
  setManualAirlineIata2,
  manualFlightNum2,
  setManualFlightNum2,
  manualDatePopoverOpen2,
  setManualDatePopoverOpen2,
  manualDepTime2,
  setManualDepTime2,
  manualDepTerminal2,
  setManualDepTerminal2,
  manualArrTime2,
  setManualArrTime2,
  manualArrTerminal2,
  setManualArrTerminal2,
  routeMismatch2,
  setRouteMismatch2,
  confirmingRouteUpdate2,
  setConfirmingRouteUpdate2,
  handleKeepSelectedRoute2,
  handleUseFlightRoute2,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-500 text-slate-950 font-mono text-xs font-bold">
            2
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900">
                Connecting Flight (Leg 2)
              </h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                {airportCode} ➔ {destCode || "Destination"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Outbound flight departing from {airportCityName} ({airportCode}).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsManualMode2(!isManualMode2);
            if (!isManualMode2) {
              setManualFlightNum2(flightNumber2);
            }
          }}
          className="text-xs font-mono font-bold text-slate-600 hover:text-slate-950 underline cursor-pointer"
        >
          {isManualMode2 ? "Use automatic fetch" : "Enter manually"}
        </button>
      </div>

      {/* AUTOMATIC FETCH */}
      {!isManualMode2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-7">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Connecting Flight Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2.5">
                <input
                  type="text"
                  value={flightNumber2}
                  onChange={(e) => {
                    setFlightNumber2(e.target.value.toUpperCase());
                    setIsFlightVerified2(false);
                    setVerifiedFlight2(null);
                    setFlightFetchError2(null);
                    setIsCutoffUrgent2(false);
                    setRouteMismatch2?.(null);
                    setConfirmingRouteUpdate2?.(false);
                  }}
                  placeholder="e.g. EK504, 6E224"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleVerifyFlight2();
                    }
                  }}
                  className="h-12 flex-1 rounded-2xl border border-slate-300 bg-transparent px-4 font-mono text-sm font-bold text-slate-900 uppercase tracking-wider focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
                />
                <button
                  type="button"
                  onClick={handleVerifyFlight2}
                  disabled={isFlightFetching2 || !flightNumber2.trim()}
                  className="h-12 px-5 rounded-2xl bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer flex items-center gap-2 shrink-0"
                >
                  {isFlightFetching2 ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-lime-400" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <span>Fetch Flight</span>
                  )}
                </button>
              </div>
            </div>

            <div className="md:col-span-5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Connecting Flight Date <span className="text-red-500">*</span>
              </label>
              <Popover open={datePopoverOpen2} onOpenChange={setDatePopoverOpen2}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="relative flex h-12 w-full items-center justify-between rounded-2xl border border-slate-300 bg-transparent px-4 text-left text-xs font-semibold text-slate-900 outline-none hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 cursor-pointer shadow-none"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <CalendarDays className="h-4 w-4 text-lime-600 shrink-0" />
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {format(dateValue2, "dd MMM yyyy")}
                      </span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-xl rounded-2xl z-50"
                  align="start"
                >
                  <CalendarPicker
                    mode="single"
                    selected={dateValue2}
                    onSelect={handleDateChange2}
                    disabled={{ before: todayStart }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {isCutoffUrgent2 && (
            <div className="rounded-2xl border border-rose-300 bg-rose-50/80 p-4 text-xs text-rose-950 space-y-2">
              <div className="flex items-center gap-2 font-bold font-mono uppercase text-rose-800">
                <AlertCircle size={15} className="text-rose-600 shrink-0" />
                Urgent: Service Cutoff Window
              </div>
              <p className="leading-relaxed">
                Online verification indicates this connecting flight falls inside the advance notice cutoff. You can proceed manually or connect with our VIP operations desk.
              </p>
              <div className="pt-1 flex items-center gap-3">
                <a
                  href="tel:+919599087959"
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-rose-800 underline hover:text-rose-950"
                >
                  <PhoneCall size={12} /> Call +91 9599087959
                </a>
              </div>
            </div>
          )}

          {/* Route Mismatch Warning & Options for Leg 2 */}
          {routeMismatch2 && (
            <div
              data-testid="route-mismatch-warning-leg2"
              className="rounded-2xl border-2 border-amber-400 bg-amber-50/95 p-5 text-xs text-amber-950 space-y-3.5 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-800 shrink-0 mt-0.5">
                  <AlertCircle size={20} className="text-amber-700" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-serif text-sm font-bold text-amber-950">
                    Flight Route Doesn't Match
                  </h4>
                  <p className="text-xs text-amber-900 leading-relaxed font-sans">
                    {routeMismatch2.message}
                  </p>
                </div>
              </div>

              {!confirmingRouteUpdate2 ? (
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleKeepSelectedRoute2}
                    className="h-10 px-4 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    Keep My Selected Route
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingRouteUpdate2?.(true)}
                    className="h-10 px-4 rounded-xl border border-amber-600 bg-white text-amber-900 font-mono text-xs font-bold uppercase tracking-wider hover:bg-amber-100 transition cursor-pointer flex items-center gap-2"
                  >
                    Use Flight Route
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-300 bg-white/95 p-4 space-y-3">
                  <p className="font-semibold text-amber-950 text-xs">
                    Confirm route change: Update connecting flight destination from{" "}
                    <span className="font-bold underline">{routeMismatch2.userDestCity} ({routeMismatch2.userDest})</span>{" "}
                    to{" "}
                    <span className="font-bold text-lime-800 underline">{routeMismatch2.apiDestCity} ({routeMismatch2.apiDest})</span>?
                  </p>
                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={handleUseFlightRoute2}
                      className="h-9 px-4 rounded-lg bg-amber-600 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-amber-700 transition cursor-pointer"
                    >
                      Confirm & Update Route
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingRouteUpdate2?.(false)}
                      className="h-9 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 font-mono text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {flightFetchError2 && !routeMismatch2 && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 text-xs text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-bold font-mono uppercase text-amber-800">
                <AlertCircle size={15} className="text-amber-600 shrink-0" />
                Schedule Notice
              </div>
              <p className="leading-relaxed">{flightFetchError2}</p>
              <button
                type="button"
                onClick={() => {
                  setIsManualMode2(true);
                  setManualFlightNum2(flightNumber2);
                }}
                className="font-mono text-xs font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
              >
                Enter connecting flight details manually →
              </button>
            </div>
          )}

          {isFlightVerified2 && verifiedFlight2 && (
            <div className="rounded-2xl border border-lime-300 bg-lime-50/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AirlineLogo
                    iata={verifiedFlight2.carrier.iata}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {verifiedFlight2.flightNum}
                      </span>
                      <span className="rounded-full bg-lime-500/20 text-lime-800 px-2 py-0.5 text-[10px] font-mono font-bold">
                        VERIFIED
                      </span>
                    </div>
                    <span className="text-xs text-slate-600">
                      {verifiedFlight2.carrier.name}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsFlightVerified2(false);
                    setVerifiedFlight2(null);
                  }}
                  className="text-xs font-mono text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-lime-200/80 text-xs">
                <div>
                  <span className="font-mono text-[9px] uppercase text-slate-400 font-bold block">Departs</span>
                  <span className="font-mono font-bold text-slate-900">{airportCode}</span>
                  {verifiedFlight2.departure.scheduledTime && (
                    <span className="block font-mono text-[11px] text-slate-600">
                      {verifiedFlight2.departure.scheduledTime.slice(11, 16)}
                    </span>
                  )}
                  {verifiedFlight2.departure.terminal && (
                    <span className="inline-block mt-0.5 text-[9px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                      T{verifiedFlight2.departure.terminal.replace(/^[Tt]/, "")}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-mono text-[9px] uppercase text-slate-400 font-bold block">Arrives</span>
                  <span className="font-mono font-bold text-slate-900">{destCode || "Dest"}</span>
                  {verifiedFlight2.arrival.scheduledTime && (
                    <span className="block font-mono text-[11px] text-slate-600">
                      {verifiedFlight2.arrival.scheduledTime.slice(11, 16)}
                    </span>
                  )}
                  {verifiedFlight2.arrival.terminal && (
                    <span className="inline-block mt-0.5 text-[9px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                      T{verifiedFlight2.arrival.terminal.replace(/^[Tt]/, "")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MANUAL ENTRY */}
      {isManualMode2 && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Clock size={13} className="text-lime-600" />
              Manual Connecting Flight Entry
            </span>
            <button
              type="button"
              onClick={() => setIsManualMode2(false)}
              className="font-mono text-xs font-bold text-slate-700 hover:text-slate-950 underline cursor-pointer"
            >
              ← Back to automatic fetch
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                Airline <span className="text-red-500">*</span>
              </label>
              <IntelligentAirlineAutocomplete
                value={manualAirline2}
                onChangeText={(txt) => setManualAirline2(txt)}
                onSelect={(airline) => {
                  setManualAirline2(airline.name);
                  setManualAirlineIata2(airline.iata);
                  if (!manualFlightNum2.startsWith(airline.iata)) {
                    setManualFlightNum2(`${airline.iata}${manualFlightNum2.replace(/^[A-Z0-9]{2,3}/, "")}`);
                  }
                }}
                placeholder="Search airline"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                Flight Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={manualFlightNum2}
                onChange={(e) => setManualFlightNum2(e.target.value.toUpperCase())}
                placeholder="e.g. EK504"
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 font-mono text-xs font-bold text-slate-900 uppercase tracking-wider focus:border-lime-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                Connecting Flight Date <span className="text-red-500">*</span>
              </label>
              <Popover open={manualDatePopoverOpen2} onOpenChange={setManualDatePopoverOpen2}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="relative flex h-11 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 text-left text-xs font-semibold text-slate-900 outline-none hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 cursor-pointer shadow-none"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CalendarDays className="h-4 w-4 text-lime-600 shrink-0" />
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {format(dateValue2, "dd MMM yyyy")}
                      </span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-xl rounded-2xl z-50"
                  align="start"
                >
                  <CalendarPicker
                    mode="single"
                    selected={dateValue2}
                    onSelect={handleDateChange2}
                    disabled={{ before: todayStart }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                Outbound Departure (at {airportCode})
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">Time</span>
                  <FlightTimePicker
                    value={manualDepTime2}
                    onChange={(val) => setManualDepTime2(val)}
                    placeholder="Select time"
                    inputClassName="w-full rounded-lg border border-slate-200 pl-8 pr-7 py-1.5 font-mono text-xs font-bold text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">Terminal</span>
                  <input
                    type="text"
                    value={manualDepTerminal2}
                    onChange={(e) => setManualDepTerminal2(e.target.value)}
                    placeholder="Terminal"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-xs font-bold text-slate-900 uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                Outbound Arrival (at {destCode || "Destination"})
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">Time</span>
                  <FlightTimePicker
                    value={manualArrTime2}
                    onChange={(val) => setManualArrTime2(val)}
                    placeholder="Select time"
                    inputClassName="w-full rounded-lg border border-slate-200 pl-8 pr-7 py-1.5 font-mono text-xs font-bold text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">Terminal</span>
                  <input
                    type="text"
                    value={manualArrTerminal2}
                    onChange={(e) => setManualArrTerminal2(e.target.value)}
                    placeholder="Terminal"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-xs font-bold text-slate-900 uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
