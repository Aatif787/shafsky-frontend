import React from "react";
import {
  Plane,
  Clock,
  AlertCircle,
  PhoneCall,
  MessageSquare,
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
import { AirportSuggestionPicker } from "../shared/AirportSuggestionPicker";
import { FlightData } from "@/services/flight/FlightTypes";

export interface DirectFlightDetailsSectionProps {
  isManualMode: boolean;
  setIsManualMode: (m: boolean) => void;
  flightNumber: string;
  setFlightNumber: (fn: string) => void;
  setIsFlightVerified: (v: boolean) => void;
  setVerifiedFlight: (f: FlightData | null) => void;
  flightFetchError: string | null;
  setFlightFetchError: (err: string | null) => void;
  isCutoffUrgent: boolean;
  setIsCutoffUrgent: (u: boolean) => void;
  handleVerifyFlight: () => void;
  isFlightFetching: boolean;
  datePopoverOpen: boolean;
  setDatePopoverOpen: (open: boolean) => void;
  dateValue: Date;
  handleDateChange: (d: Date | undefined) => void;
  todayStart: Date;
  isFlightVerified: boolean;
  direction: "arrival" | "departure" | "transit";
  airportCode: string;
  airportCityName: string;
  originCode: string;
  setOriginCode: (c: string) => void;
  destCode: string;
  setDestCode: (c: string) => void;
  travelType: "domestic" | "international";
  handleTravelTypeChange: (t: "domestic" | "international") => void;
  serviceDate: string;
  fullName: string;
  verifiedFlight: FlightData | null;
  manualAirline: string;
  setManualAirline: (a: string) => void;
  manualAirlineIata: string;
  setManualAirlineIata: (iata: string) => void;
  manualFlightNum: string;
  setManualFlightNum: (fn: string) => void;
  manualDatePopoverOpen: boolean;
  setManualDatePopoverOpen: (open: boolean) => void;
  manualDepTime: string;
  setManualDepTime: (t: string) => void;
  manualDepTerminal: string;
  setManualDepTerminal: (t: string) => void;
  manualArrTime: string;
  setManualArrTime: (t: string) => void;
  manualArrTerminal: string;
  setManualArrTerminal: (t: string) => void;
}

export const DirectFlightDetailsSection: React.FC<DirectFlightDetailsSectionProps> = ({
  isManualMode,
  setIsManualMode,
  flightNumber,
  setFlightNumber,
  setIsFlightVerified,
  setVerifiedFlight,
  flightFetchError,
  setFlightFetchError,
  isCutoffUrgent,
  setIsCutoffUrgent,
  handleVerifyFlight,
  isFlightFetching,
  datePopoverOpen,
  setDatePopoverOpen,
  dateValue,
  handleDateChange,
  todayStart,
  isFlightVerified,
  direction,
  airportCode,
  airportCityName,
  originCode,
  setOriginCode,
  destCode,
  setDestCode,
  travelType,
  handleTravelTypeChange,
  serviceDate,
  fullName,
  verifiedFlight,
  manualAirline,
  setManualAirline,
  manualAirlineIata,
  setManualAirlineIata,
  manualFlightNum,
  setManualFlightNum,
  manualDatePopoverOpen,
  setManualDatePopoverOpen,
  manualDepTime,
  setManualDepTime,
  manualDepTerminal,
  setManualDepTerminal,
  manualArrTime,
  setManualArrTime,
  manualArrTerminal,
  setManualArrTerminal,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-lime-400">
            <Plane size={16} />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-slate-900">Flight Details</h2>
            <p className="text-[11px] text-slate-500 font-mono">
              Enter flight number to fetch verified schedule or provide details manually.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsManualMode(!isManualMode);
            if (!isManualMode) {
              setManualFlightNum(flightNumber);
            }
          }}
          className="text-xs font-mono font-bold text-slate-600 hover:text-slate-950 underline cursor-pointer"
        >
          {isManualMode ? "Use automatic fetch" : "Enter manually"}
        </button>
      </div>

      {/* PATH A: AUTOMATIC FLIGHT FETCH */}
      {!isManualMode && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Flight Number */}
            <div className="md:col-span-7">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Flight Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => {
                      setFlightNumber(e.target.value.toUpperCase());
                      setIsFlightVerified(false);
                      setVerifiedFlight(null);
                      setFlightFetchError(null);
                      setIsCutoffUrgent(false);
                    }}
                    placeholder="Flight number"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleVerifyFlight();
                      }
                    }}
                    className="h-12 w-full rounded-2xl border border-slate-300 bg-transparent px-4 font-mono text-sm font-bold text-slate-900 uppercase tracking-wider placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyFlight}
                  disabled={isFlightFetching || !flightNumber.trim()}
                  className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer flex items-center gap-2 shrink-0"
                >
                  {isFlightFetching ? (
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

            {/* Service / Travel Date Selection */}
            <div className="md:col-span-5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Flight / Service Date <span className="text-red-500">*</span>
              </label>
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="relative flex h-12 w-full items-center justify-between rounded-2xl border border-slate-300 bg-transparent px-4 text-left text-xs font-semibold text-slate-900 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 cursor-pointer shadow-none"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <CalendarDays className="h-4 w-4 text-lime-600 shrink-0" />
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {format(dateValue, "dd MMMM yyyy")}
                      </span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.12),0_0_30px_rgba(132,204,22,0.15)] rounded-3xl z-50"
                  align="start"
                >
                  <CalendarPicker
                    mode="single"
                    selected={dateValue}
                    onSelect={handleDateChange}
                    disabled={{ before: todayStart }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Route Endpoints: Origin & Destination (Shown when not auto-verified) */}
          {!isFlightVerified && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {direction === "arrival"
                      ? "Flying From (Departure Airport)"
                      : "Departure Airport"}
                    {direction === "arrival" && <span className="text-red-500"> *</span>}
                  </label>
                  {direction === "departure" ? (
                    <div className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 flex items-center text-xs font-mono font-bold text-slate-800">
                      {airportCode} ({airportCityName})
                    </div>
                  ) : (
                    <AirportSuggestionPicker
                      value={originCode}
                      onChange={(code) => setOriginCode(code)}
                      travelType={travelType}
                      onTravelTypeChange={(newType) => handleTravelTypeChange(newType)}
                      direction={direction}
                      serviceAirportCode={airportCode}
                      placeholder="Select departure airport"
                      required={direction === "arrival"}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {direction === "departure"
                      ? "Flying To (Destination Airport)"
                      : "Arrival Service Airport"}
                    {direction === "departure" && <span className="text-red-500"> *</span>}
                  </label>
                  {direction === "arrival" ? (
                    <div className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 flex items-center text-xs font-mono font-bold text-slate-800">
                      {airportCode} ({airportCityName})
                    </div>
                  ) : (
                    <AirportSuggestionPicker
                      value={destCode}
                      onChange={(code) => setDestCode(code)}
                      travelType={travelType}
                      onTravelTypeChange={(newType) => handleTravelTypeChange(newType)}
                      direction={direction}
                      serviceAirportCode={airportCode}
                      placeholder="Select destination airport"
                      required={direction === "departure"}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* URGENT CUTOFF VIP FAST-TRACK BANNER */}
          {isCutoffUrgent && (
            <div className="rounded-2xl border border-rose-300 bg-rose-50/80 p-4 sm:p-5 text-xs text-rose-950 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
                <PhoneCall size={18} className="text-rose-600" />
                <span>Urgent VIP Airport Clearance Available</span>
              </div>
              <p className="text-xs text-rose-900 font-sans leading-relaxed">
                This flight is scheduled within our standard advance notice window (less than 12h for domestic or 24h for international). Our 24/7 team can assist with short-notice bookings.
              </p>
              <a
                href={`https://wa.me/919599087959?text=${encodeURIComponent(
                  `🚨 URGENT VIP REQUEST: I need urgent airport clearance for flight ${flightNumber || "TBD"} at ${airportCode} (${direction}) on ${serviceDate}. Passenger: ${fullName || "Guest"}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-sm transition"
              >
                <MessageSquare size={14} />
                <span>Connect with Support on WhatsApp</span>
              </a>
            </div>
          )}

          {/* Automatic Fetch / Airport Mismatch Warning (Never blocks - offers manual entry immediately) */}
          {flightFetchError && !isCutoffUrgent && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-semibold">{flightFetchError}</p>
                <p className="text-[11px] text-amber-800">
                  Automatic flight verification failure never blocks your booking. Click below to enter your flight times manually.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsManualMode(true);
                    setManualFlightNum(flightNumber);
                  }}
                  className="mt-1 font-mono font-bold text-amber-950 underline block cursor-pointer"
                >
                  → Continue with manual flight entry
                </button>
              </div>
            </div>
          )}

          {/* Fetching Flight Skeleton Placeholder */}
          {isFlightFetching && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-3 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-slate-200" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-28 bg-slate-200 rounded" />
                    <div className="h-3 w-16 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-slate-200 rounded-full" />
              </div>
              <div className="rounded-xl bg-white/60 p-3 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="h-2.5 w-12 bg-slate-200 rounded" />
                  <div className="h-5 w-16 bg-slate-200 rounded" />
                </div>
                <div className="h-1 flex-1 bg-slate-200 rounded" />
                <div className="space-y-1 text-right">
                  <div className="h-2.5 w-12 bg-slate-200 rounded ml-auto" />
                  <div className="h-5 w-16 bg-slate-200 rounded ml-auto" />
                </div>
              </div>
            </div>
          )}

          {/* Verified Flight Card with Visual Flight Trajectory Strip */}
          {isFlightVerified && verifiedFlight && (
            <div className="rounded-2xl border border-lime-400 bg-lime-50/40 p-4 sm:p-5 space-y-4 shadow-xs">
              {/* Carrier & Verification Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 p-1 shadow-2xs">
                    <AirlineLogo iata={verifiedFlight.carrier.iata} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-950 font-sans block text-sm leading-tight">
                      {verifiedFlight.carrier.name} ({verifiedFlight.carrier.iata})
                    </span>
                    <span className="font-mono text-xs font-extrabold text-slate-900">
                      {verifiedFlight.flightNum}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 font-mono text-[9.5px] font-bold flex items-center gap-1">
                    <CalendarDays size={10} className="text-lime-600" />
                    {format(dateValue, "dd MMM yyyy")}
                  </span>
                  <span className="rounded-full bg-slate-900 text-lime-400 px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider">
                    {travelType === "international" ? "International" : "Domestic"}
                  </span>
                  <span className="rounded-full bg-lime-500 px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider text-slate-950 flex items-center gap-1">
                    <Check size={12} />
                    Verified
                  </span>
                </div>
              </div>

              {/* VISUAL FLIGHT TRAJECTORY STRIP (Origin ─── ✈️ ───▶ Destination) */}
              <div className="relative rounded-xl bg-white/90 border border-lime-200/80 p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                  {/* Origin Airport */}
                  <div className="text-left min-w-[75px] sm:min-w-[110px]">
                    <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                      DEPARTURE
                    </span>
                    <span className="font-mono text-base sm:text-lg font-black text-slate-950 block">
                      {verifiedFlight.origin.code || originCode}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-700 truncate block">
                      {verifiedFlight.origin.city || "Origin"}
                    </span>
                    {verifiedFlight.departure.scheduledTime && (
                      <span className="text-[11px] text-slate-600 block font-mono font-bold mt-0.5">
                        {verifiedFlight.departure.scheduledTime.slice(11, 16) || verifiedFlight.departure.scheduledTime}
                      </span>
                    )}
                    {verifiedFlight.departure.terminal && (
                      <span className="inline-block mt-1 text-[9.5px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        T{verifiedFlight.departure.terminal.replace(/^[Tt]/, "")}
                      </span>
                    )}
                  </div>

                  {/* Flight Path Graphic with Center Plane Icon */}
                  <div className="flex-1 flex flex-col items-center justify-center px-1 sm:px-2">
                    <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">
                      Live Tracked
                    </span>
                    <div className="relative w-full flex items-center justify-center">
                      <div className="w-full border-t-2 border-dashed border-lime-400" />
                      <div className="absolute flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-lime-400 shadow-sm">
                        <Plane size={12} className="rotate-45" />
                      </div>
                    </div>
                    <span className="text-[9.5px] font-mono text-slate-400 mt-1">
                      Direct Schedule
                    </span>
                  </div>

                  {/* Destination Airport */}
                  <div className="text-right min-w-[75px] sm:min-w-[110px]">
                    <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                      ARRIVAL
                    </span>
                    <span className="font-mono text-base sm:text-lg font-black text-slate-950 block">
                      {verifiedFlight.destination.code || destCode}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-700 truncate block">
                      {verifiedFlight.destination.city || "Destination"}
                    </span>
                    {verifiedFlight.arrival.scheduledTime && (
                      <span className="text-[11px] text-slate-600 block font-mono font-bold mt-0.5">
                        {verifiedFlight.arrival.scheduledTime.slice(11, 16) || verifiedFlight.arrival.scheduledTime}
                      </span>
                    )}
                    {verifiedFlight.arrival.terminal && (
                      <span className="inline-block mt-1 text-[9.5px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        T{verifiedFlight.arrival.terminal.replace(/^[Tt]/, "")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PATH B: MANUAL FLIGHT ENTRY FORM */}
      {isManualMode && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Clock size={13} className="text-lime-600" />
              Manual Flight & Schedule Entry
            </span>
            <span className="text-[10px] font-mono text-slate-500 font-bold">
              Worldwide Airlines Supported
            </span>
          </div>

          {/* Automatic Fetch / Airport Mismatch Warning (Never hidden - stays visible in manual mode) */}
          {flightFetchError && !isCutoffUrgent && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-semibold">{flightFetchError}</p>
                <p className="text-[11px] text-amber-800">
                  Automatic flight verification was bypassed or mismatched. You can complete your flight times and terminal details manually below.
                </p>
                <button
                  type="button"
                  onClick={() => setIsManualMode(false)}
                  className="mt-1 font-mono font-bold text-amber-950 underline block cursor-pointer"
                >
                  ← Return to automatic flight fetch
                </button>
              </div>
            </div>
          )}

          {/* Row: Airline, Flight Number & Service Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                Airline <span className="text-red-500">*</span>
              </label>
              <IntelligentAirlineAutocomplete
                value={manualAirline}
                onChangeText={(txt) => setManualAirline(txt)}
                onSelect={(airline) => {
                  setManualAirline(airline.name);
                  setManualAirlineIata(airline.iata);
                  if (!manualFlightNum.startsWith(airline.iata)) {
                    setManualFlightNum(`${airline.iata}${manualFlightNum.replace(/^[A-Z0-9]{2,3}/, "")}`);
                  }
                }}
                placeholder="Search any airline worldwide"
              />
              {manualAirlineIata && (
                <div className="mt-1.5 flex items-center gap-2 text-[10.5px] font-mono text-slate-600">
                  <div className="h-4 w-4 shrink-0 flex items-center justify-center">
                    <AirlineLogo iata={manualAirlineIata} />
                  </div>
                  <span>
                    Code: <strong>{manualAirlineIata}</strong>
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                Flight Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={manualFlightNum}
                onChange={(e) => setManualFlightNum(e.target.value.toUpperCase())}
                placeholder="Flight number"
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 font-mono text-xs font-bold text-slate-900 uppercase tracking-wider focus:border-lime-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                Flight / Service Date <span className="text-red-500">*</span>
              </label>
              <Popover open={manualDatePopoverOpen} onOpenChange={setManualDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="relative flex h-11 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 text-left text-xs font-semibold text-slate-900 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 cursor-pointer shadow-none"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CalendarDays className="h-4 w-4 text-lime-600 shrink-0" />
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {format(dateValue, "dd MMM yyyy")}
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
                    selected={dateValue}
                    onSelect={handleDateChange}
                    disabled={{ before: todayStart }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Row: Flight Route (Origin & Destination) */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {direction === "arrival"
                    ? "Flying From (Departure Airport)"
                    : "Departure Airport"}
                  {direction === "arrival" && <span className="text-red-500"> *</span>}
                </label>
                {direction === "departure" ? (
                  <div className="h-11 rounded-xl border border-slate-200 bg-slate-100/70 px-3.5 flex items-center text-xs font-mono font-bold text-slate-800">
                    {airportCode} ({airportCityName})
                  </div>
                ) : (
                  <AirportSuggestionPicker
                    value={originCode}
                    onChange={(code) => setOriginCode(code)}
                    travelType={travelType}
                    onTravelTypeChange={(newType) => handleTravelTypeChange(newType)}
                    direction={direction}
                    serviceAirportCode={airportCode}
                    placeholder="Select departure airport"
                    required={direction === "arrival"}
                  />
                )}
              </div>
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {direction === "departure"
                    ? "Flying To (Destination Airport)"
                    : "Arrival Service Airport"}
                  {direction === "departure" && <span className="text-red-500"> *</span>}
                </label>
                {direction === "arrival" ? (
                  <div className="h-11 rounded-xl border border-slate-200 bg-slate-100/70 px-3.5 flex items-center text-xs font-mono font-bold text-slate-800">
                    {airportCode} ({airportCityName})
                  </div>
                ) : (
                  <AirportSuggestionPicker
                    value={destCode}
                    onChange={(code) => setDestCode(code)}
                    travelType={travelType}
                    onTravelTypeChange={(newType) => handleTravelTypeChange(newType)}
                    direction={direction}
                    serviceAirportCode={airportCode}
                    placeholder="Select destination airport"
                    required={direction === "departure"}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Row: Departure Time & Arrival Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                Departure Schedule
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">Time</span>
                  <FlightTimePicker
                    value={manualDepTime}
                    onChange={(val) => setManualDepTime(val)}
                    placeholder="Select time"
                    inputClassName="w-full rounded-lg border border-slate-200 pl-8 pr-7 py-1.5 font-mono text-xs font-bold text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">Terminal</span>
                  <input
                    type="text"
                    value={manualDepTerminal}
                    onChange={(e) => setManualDepTerminal(e.target.value)}
                    placeholder="Terminal number"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-xs font-bold text-slate-900 uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                Arrival Schedule
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">Time</span>
                  <FlightTimePicker
                    value={manualArrTime}
                    onChange={(val) => setManualArrTime(val)}
                    placeholder="Select time"
                    inputClassName="w-full rounded-lg border border-slate-200 pl-8 pr-7 py-1.5 font-mono text-xs font-bold text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">Terminal</span>
                  <input
                    type="text"
                    value={manualArrTerminal}
                    onChange={(e) => setManualArrTerminal(e.target.value)}
                    placeholder="Terminal number"
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
