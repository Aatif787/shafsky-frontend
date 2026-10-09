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
import { getAirportRegistryEntry, getTransitCategory } from "@/data/airportRegistry";
import { AirlineLogo } from "../shared/AirlineLogo";
import { IntelligentAirlineAutocomplete } from "../shared/IntelligentAirlineAutocomplete";
import { FlightTimePicker } from "../shared/FlightTimePicker";
import { AirportSuggestionPicker } from "../shared/AirportSuggestionPicker";
import { FlightData } from "@/services/flight/FlightTypes";
import { TransitConnectingLegSection } from "./TransitConnectingLegSection";

export interface TransitFlightDetailsSectionProps {
  airportCityName: string;
  airportCode: string;
  originCode: string;
  setOriginCode: (c: string) => void;
  destCode: string;
  setDestCode: (c: string) => void;
  travelType: "domestic" | "international";
  handleTravelTypeChange: (t: "domestic" | "international") => void;
  isFlightVerified: boolean;
  verifiedFlight: FlightData | null;
  flightNumber: string;
  setFlightNumber: (fn: string) => void;
  isFlightVerified2: boolean;
  verifiedFlight2: FlightData | null;
  flightNumber2: string;
  setFlightNumber2: (fn: string) => void;
  isManualMode: boolean;
  setIsManualMode: (m: boolean) => void;
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
  serviceDate: string;
  fullName: string;
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
  // Leg 2 props
  isManualMode2: boolean;
  setIsManualMode2: (m: boolean) => void;
  setIsFlightVerified2: (v: boolean) => void;
  setVerifiedFlight2: (f: FlightData | null) => void;
  flightFetchError2: string | null;
  setFlightFetchError2: (err: string | null) => void;
  isCutoffUrgent2: boolean;
  setIsCutoffUrgent2: (u: boolean) => void;
  handleVerifyFlight2: () => void;
  isFlightFetching2: boolean;
  datePopoverOpen2: boolean;
  setDatePopoverOpen2: (open: boolean) => void;
  dateValue2: Date;
  handleDateChange2: (d: Date | undefined) => void;
  serviceDate2: string;
  manualAirline2: string;
  setManualAirline2: (a: string) => void;
  manualAirlineIata2: string;
  setManualAirlineIata2: (iata: string) => void;
  manualFlightNum2: string;
  setManualFlightNum2: (fn: string) => void;
  manualDatePopoverOpen2: boolean;
  setManualDatePopoverOpen2: (open: boolean) => void;
  manualDepTime2: string;
  setManualDepTime2: (t: string) => void;
  manualDepTerminal2: string;
  setManualDepTerminal2: (t: string) => void;
  manualArrTime2: string;
  setManualArrTime2: (t: string) => void;
  manualArrTerminal2: string;
  setManualArrTerminal2: (t: string) => void;
}

export const TransitFlightDetailsSection: React.FC<TransitFlightDetailsSectionProps> = ({
  airportCityName,
  airportCode,
  originCode,
  setOriginCode,
  destCode,
  setDestCode,
  travelType,
  handleTravelTypeChange,
  isFlightVerified,
  verifiedFlight,
  flightNumber,
  setFlightNumber,
  isFlightVerified2,
  verifiedFlight2,
  flightNumber2,
  setFlightNumber2,
  isManualMode,
  setIsManualMode,
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
  serviceDate,
  fullName,
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
  // Leg 2 props
  isManualMode2,
  setIsManualMode2,
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
  serviceDate2,
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
}) => {
  return (
    <div className="space-y-6">
      {/* 1A. JOURNEY ROUTE OVERVIEW CARD */}
      <div className="rounded-3xl border border-lime-300 bg-gradient-to-br from-lime-50/60 via-white to-slate-50 p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lime-200/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-lime-400">
              <Plane size={16} />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900">Transit Journey Overview</h2>
              <p className="text-[11px] text-slate-500 font-mono">
                VIP transit concierge at {airportCityName} ({airportCode}).
              </p>
            </div>
          </div>

          <span className="rounded-full bg-lime-500/20 text-lime-900 border border-lime-400/40 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider">
            {getTransitCategory(originCode, destCode)}
          </span>
        </div>

        {/* Visual Route Flow */}
        <div className="rounded-2xl border border-lime-200 bg-white/80 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Origin */}
            <div className="text-left min-w-[70px] sm:min-w-[100px]">
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                1. Inbound Origin
              </span>
              <span className="font-mono text-base sm:text-xl font-black text-slate-950 block">
                {originCode || "TBD"}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block truncate max-w-[120px]">
                {getAirportRegistryEntry(originCode)?.city || "Origin Airport"}
              </span>
            </div>

            {/* Flight 1 Arrow */}
            <div className="flex-1 flex flex-col items-center justify-center px-1">
              <span className="text-[9px] font-mono font-bold text-slate-500 mb-1">
                {isFlightVerified && verifiedFlight ? verifiedFlight.flightNum : flightNumber || "Leg 1"}
              </span>
              <div className="relative w-full flex items-center justify-center">
                <div className="w-full border-t-2 border-dashed border-lime-400" />
                <div className="absolute flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-lime-400 text-[10px]">
                  ✈
                </div>
              </div>
            </div>

            {/* Transit Hub (Highlight) */}
            <div className="text-center px-3 py-1.5 rounded-xl bg-lime-100/80 border border-lime-300 min-w-[90px] sm:min-w-[130px]">
              <span className="font-mono text-[9px] uppercase tracking-wider text-lime-800 font-bold block">
                Transit Hub
              </span>
              <span className="font-mono text-base sm:text-xl font-black text-slate-950 block">
                {airportCode}
              </span>
              <span className="text-[11px] text-slate-800 font-semibold block truncate max-w-[130px]">
                {airportCityName}
              </span>
            </div>

            {/* Flight 2 Arrow */}
            <div className="flex-1 flex flex-col items-center justify-center px-1">
              <span className="text-[9px] font-mono font-bold text-slate-500 mb-1">
                {isFlightVerified2 && verifiedFlight2 ? verifiedFlight2.flightNum : flightNumber2 || "Leg 2"}
              </span>
              <div className="relative w-full flex items-center justify-center">
                <div className="w-full border-t-2 border-dashed border-lime-400" />
                <div className="absolute flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-lime-400 text-[10px]">
                  ✈
                </div>
              </div>
            </div>

            {/* Destination */}
            <div className="text-right min-w-[70px] sm:min-w-[100px]">
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                2. Connecting To
              </span>
              <span className="font-mono text-base sm:text-xl font-black text-slate-950 block">
                {destCode || "TBD"}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block truncate max-w-[120px] ml-auto">
                {getAirportRegistryEntry(destCode)?.city || "Destination"}
              </span>
            </div>
          </div>
        </div>

        {/* Route Endpoints Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
              Flying From (Inbound Origin) <span className="text-red-500">*</span>
            </label>
            <AirportSuggestionPicker
              value={originCode}
              onChange={(code) => setOriginCode(code)}
              travelType={travelType}
              onTravelTypeChange={(newType) => handleTravelTypeChange(newType)}
              direction="transit"
              serviceAirportCode={airportCode}
              placeholder="Select inbound departure airport"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
              Flying To (Connecting Destination) <span className="text-red-500">*</span>
            </label>
            <AirportSuggestionPicker
              value={destCode}
              onChange={(code) => setDestCode(code)}
              travelType={travelType}
              onTravelTypeChange={(newType) => handleTravelTypeChange(newType)}
              direction="transit"
              serviceAirportCode={airportCode}
              placeholder="Select connecting destination airport"
              required
            />
          </div>
        </div>
      </div>

      {/* 1B. INCOMING FLIGHT (LEG 1: INBOUND ORIGIN -> TRANSIT HUB) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-lime-400 font-mono text-xs font-bold">
              1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900">
                  Incoming Flight (Leg 1)
                </h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                  {originCode || "Origin"} ➔ {airportCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Flight arriving at {airportCityName} ({airportCode}).
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

        {/* AUTOMATIC FETCH */}
        {!isManualMode && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-7">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Incoming Flight Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2.5">
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
                    placeholder="e.g. AI101, 6E202"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleVerifyFlight();
                      }
                    }}
                    className="h-12 flex-1 rounded-2xl border border-slate-300 bg-transparent px-4 font-mono text-sm font-bold text-slate-900 uppercase tracking-wider focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyFlight}
                    disabled={isFlightFetching || !flightNumber.trim()}
                    className="h-12 px-5 rounded-2xl bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer flex items-center gap-2 shrink-0"
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

              <div className="md:col-span-5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Incoming Flight Date <span className="text-red-500">*</span>
                </label>
                <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="relative flex h-12 w-full items-center justify-between rounded-2xl border border-slate-300 bg-transparent px-4 text-left text-xs font-semibold text-slate-900 outline-none hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 cursor-pointer shadow-none"
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
                    className="w-auto p-0 bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-xl rounded-3xl z-50"
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

            {isCutoffUrgent && (
              <div className="rounded-2xl border border-rose-300 bg-rose-50/80 p-4 text-xs text-rose-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
                  <PhoneCall size={16} className="text-rose-600" />
                  <span>Urgent Airport Notice</span>
                </div>
                <p className="text-xs text-rose-900 leading-relaxed font-sans">
                  Flight is scheduled within standard notice. Our 24/7 team can assist on WhatsApp.
                </p>
              </div>
            )}

            {flightFetchError && !isCutoffUrgent && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-semibold">{flightFetchError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualMode(true);
                      setManualFlightNum(flightNumber);
                    }}
                    className="mt-1 font-mono font-bold text-amber-950 underline block cursor-pointer"
                  >
                    → Enter incoming flight details manually
                  </button>
                </div>
              </div>
            )}

            {isFlightFetching && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 animate-pulse">
                <div className="h-8 w-48 bg-slate-200 rounded" />
              </div>
            )}

            {isFlightVerified && verifiedFlight && (
              <div className="rounded-2xl border border-lime-400 bg-lime-50/40 p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200 p-1">
                      <AirlineLogo iata={verifiedFlight.carrier.iata} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-950 text-sm block">
                        {verifiedFlight.carrier.name} ({verifiedFlight.carrier.iata})
                      </span>
                      <span className="font-mono text-xs font-black text-slate-900">
                        {verifiedFlight.flightNum}
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-lime-500 px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase text-slate-950 flex items-center gap-1">
                    <Check size={12} /> Verified
                  </span>
                </div>
                <div className="rounded-xl bg-white/90 border border-lime-200/80 p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-[9px] uppercase text-slate-400 font-bold block">Departs</span>
                    <span className="font-mono font-bold text-slate-900">{verifiedFlight.origin.code || originCode}</span>
                    {verifiedFlight.departure.scheduledTime && (
                      <span className="block font-mono text-[11px] text-slate-600">
                        {verifiedFlight.departure.scheduledTime.slice(11, 16)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col items-center px-2">
                    <span className="text-[9px] font-mono text-slate-400">Arrives at Transit Hub</span>
                    <div className="w-full border-t border-dashed border-lime-400 my-1" />
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[9px] uppercase text-slate-400 font-bold block">Arrives</span>
                    <span className="font-mono font-bold text-slate-900">{airportCode}</span>
                    {verifiedFlight.arrival.scheduledTime && (
                      <span className="block font-mono text-[11px] text-slate-600">
                        {verifiedFlight.arrival.scheduledTime.slice(11, 16)}
                      </span>
                    )}
                    {verifiedFlight.arrival.terminal && (
                      <span className="inline-block mt-0.5 text-[9px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                        T{verifiedFlight.arrival.terminal.replace(/^[Tt]/, "")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MANUAL ENTRY */}
        {isManualMode && (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Clock size={13} className="text-lime-600" />
                Manual Incoming Flight Entry
              </span>
              <button
                type="button"
                onClick={() => setIsManualMode(false)}
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
                  value={manualAirline}
                  onChangeText={(txt) => setManualAirline(txt)}
                  onSelect={(airline) => {
                    setManualAirline(airline.name);
                    setManualAirlineIata(airline.iata);
                    if (!manualFlightNum.startsWith(airline.iata)) {
                      setManualFlightNum(`${airline.iata}${manualFlightNum.replace(/^[A-Z0-9]{2,3}/, "")}`);
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
                  value={manualFlightNum}
                  onChange={(e) => setManualFlightNum(e.target.value.toUpperCase())}
                  placeholder="e.g. AI101"
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 font-mono text-xs font-bold text-slate-900 uppercase tracking-wider focus:border-lime-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Flight Date <span className="text-red-500">*</span>
                </label>
                <Popover open={manualDatePopoverOpen} onOpenChange={setManualDatePopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="relative flex h-11 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 text-left text-xs font-semibold text-slate-900 outline-none hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 cursor-pointer shadow-none"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                  Inbound Departure (at {originCode || "Origin"})
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
                      placeholder="Terminal"
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-xs font-bold text-slate-900 uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                  Inbound Arrival (at {airportCode})
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

      {/* 1C. CONNECTING FLIGHT (LEG 2: TRANSIT HUB -> CONNECTING DESTINATION) */}
      <TransitConnectingLegSection
        airportCode={airportCode}
        destCode={destCode}
        airportCityName={airportCityName}
        isManualMode2={isManualMode2}
        setIsManualMode2={setIsManualMode2}
        flightNumber2={flightNumber2}
        setFlightNumber2={setFlightNumber2}
        setIsFlightVerified2={setIsFlightVerified2}
        setVerifiedFlight2={setVerifiedFlight2}
        flightFetchError2={flightFetchError2}
        setFlightFetchError2={setFlightFetchError2}
        isCutoffUrgent2={isCutoffUrgent2}
        setIsCutoffUrgent2={setIsCutoffUrgent2}
        handleVerifyFlight2={handleVerifyFlight2}
        isFlightFetching2={isFlightFetching2}
        datePopoverOpen2={datePopoverOpen2}
        setDatePopoverOpen2={setDatePopoverOpen2}
        dateValue2={dateValue2}
        handleDateChange2={handleDateChange2}
        todayStart={todayStart}
        serviceDate2={serviceDate2}
        fullName={fullName}
        isFlightVerified2={isFlightVerified2}
        verifiedFlight2={verifiedFlight2}
        manualAirline2={manualAirline2}
        setManualAirline2={setManualAirline2}
        manualAirlineIata2={manualAirlineIata2}
        setManualAirlineIata2={setManualAirlineIata2}
        manualFlightNum2={manualFlightNum2}
        setManualFlightNum2={setManualFlightNum2}
        manualDatePopoverOpen2={manualDatePopoverOpen2}
        setManualDatePopoverOpen2={setManualDatePopoverOpen2}
        manualDepTime2={manualDepTime2}
        setManualDepTime2={setManualDepTime2}
        manualDepTerminal2={manualDepTerminal2}
        setManualDepTerminal2={setManualDepTerminal2}
        manualArrTime2={manualArrTime2}
        setManualArrTime2={setManualArrTime2}
        manualArrTerminal2={manualArrTerminal2}
        setManualArrTerminal2={setManualArrTerminal2}
      />
    </div>
  );
};
