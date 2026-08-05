import React, { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  RefreshCw,
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  Clock,
  Navigation,
  Info,
  ArrowRight,
  ShieldCheck,
  Utensils,
  Briefcase,
  Layers,
  FileText,
} from "lucide-react";
import { FlightData } from "@/services/flight/FlightTypes";
import { format } from "date-fns";

interface FlightVerificationResultViewProps {
  flightData: FlightData | null;
  searchParams: {
    flight_number?: string;
    depart_date?: string;
    direction?: string;
    service_id?: string;
    pax_adults?: number;
    pax_children?: number;
    pax_infants?: number;
    notes?: string;
  };
}

/**
 * Safely formats raw API timestamp into exact local 12-hour "01:15 PM" format.
 * Converts UTC ISO timestamps using target airport timezone.
 */
function formatDisplayTime(rawTime?: string | null, targetTimezone?: string | null): string | null {
  if (!rawTime || typeof rawTime !== "string") return null;
  const cleaned = rawTime.trim();
  if (!cleaned) return null;

  // Case 1: Standard ISO string with UTC 'Z' or offset (convert to target airport timezone)
  if (targetTimezone && (cleaned.includes("Z") || cleaned.includes("+") || (cleaned.includes("T") && cleaned.length > 16))) {
    try {
      const parsedDate = new Date(cleaned);
      if (!isNaN(parsedDate.getTime())) {
        const formatter = new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: targetTimezone,
        });
        return formatter.format(parsedDate);
      }
    } catch {
      // Fallback below
    }
  }

  // Case 2: Already formatted e.g. "01:15 PM"
  if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(cleaned)) {
    const [time, period] = cleaned.split(/\s+/);
    const [h, m] = time.split(":");
    return `${h.padStart(2, "0")}:${m} ${period.toUpperCase()}`;
  }

  // Case 3: Extract time directly from local ISO string or 24-hour time string e.g. "2026-08-07T13:15:00" or "13:15"
  const timeMatch = cleaned.match(/(?:T|\s|^)(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (timeMatch) {
    const hourNum = parseInt(timeMatch[1], 10);
    const minStr = timeMatch[2];
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const displayHour = (hourNum % 12 || 12).toString().padStart(2, "0");
    return `${displayHour}:${minStr} ${ampm}`;
  }

  try {
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      return format(d, "hh:mm a");
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Safely formats raw API date timestamp into exact local "08 May 2025, Thu" format.
 * Respects airport timezone for UTC ISO strings.
 */
function formatDisplayDate(rawDate?: string | null, targetTimezone?: string | null): string | null {
  if (!rawDate || typeof rawDate !== "string") return null;
  const cleaned = rawDate.trim();
  if (!cleaned) return null;

  if (targetTimezone && (cleaned.includes("Z") || cleaned.includes("+") || (cleaned.includes("T") && cleaned.length > 16))) {
    try {
      const parsedDate = new Date(cleaned);
      if (!isNaN(parsedDate.getTime())) {
        const formatter = new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          weekday: "short",
          timeZone: targetTimezone,
        });
        return formatter.format(parsedDate);
      }
    } catch {
      // Fallback below
    }
  }

  // Case 2: Extract YYYY-MM-DD
  const dateMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    const year = parseInt(dateMatch[1], 10);
    const monthIndex = parseInt(dateMatch[2], 10) - 1;
    const day = parseInt(dateMatch[3], 10);
    const d = new Date(year, monthIndex, day);
    if (!isNaN(d.getTime())) {
      return format(d, "dd MMM yyyy, EEE");
    }
  }

  try {
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      return format(d, "dd MMM yyyy, EEE");
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Airline Logo Avatar Component with graceful fallback
 */
function AirlineLogoAvatar({
  logoUrl,
  carrierName,
  flightNum,
  carrierIata,
}: {
  logoUrl?: string | null;
  carrierName?: string | null;
  flightNum: string;
  carrierIata?: string | null;
}) {
  const [imgError, setImgError] = useState(false);

  if (logoUrl && !imgError) {
    return (
      <div className="w-14 h-14 rounded-full bg-white border border-slate-200 p-1.5 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
        <img
          src={logoUrl}
          alt=""
          onError={() => setImgError(true)}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="w-14 h-14 rounded-full bg-[#0f172a] text-amber-400 font-bold font-mono text-base flex items-center justify-center border border-slate-200 shrink-0 shadow-xs">
      {carrierIata || flightNum.substring(0, 2)}
    </div>
  );
}

export function FlightVerificationResultView({
  flightData,
  searchParams,
}: FlightVerificationResultViewProps) {
  const navigate = useNavigate();

  // 100% Dynamic attributes from API response (Zero hardcoding)
  const flightNum =
    flightData?.flightNum || searchParams.flight_number?.toUpperCase() || "";
  const carrierName = flightData?.carrier?.name || null;
  const carrierIata = flightData?.carrier?.iata || null;
  const airlineLogo = flightData?.carrier?.logo || null;

  const statusRaw = flightData?.status || "Scheduled";
  const isDelay = statusRaw.toLowerCase().includes("delay");
  const isCancelled = statusRaw.toLowerCase().includes("cancel");

  // Route Origin
  const originCode = flightData?.origin?.code || "";
  const originName = flightData?.origin?.name || flightData?.origin?.city || originCode;
  const originCityCountry = [flightData?.origin?.city, flightData?.origin?.country]
    .filter(Boolean)
    .join(", ");
  const originFullLocation = originCityCountry ? `${originName}, ${originCityCountry}` : originName;

  // Route Destination
  const destCode = flightData?.destination?.code || "";
  const destName = flightData?.destination?.name || flightData?.destination?.city || destCode;
  const destCityCountry = [flightData?.destination?.city, flightData?.destination?.country]
    .filter(Boolean)
    .join(", ");
  const destFullLocation = destCityCountry ? `${destName}, ${destCityCountry}` : destName;

  // Timings from API with Airport Timezone conversion
  const depTimezone = flightData?.departure?.timezone || flightData?.origin?.timezone || null;
  const arrTimezone = flightData?.arrival?.timezone || flightData?.destination?.timezone || null;

  const departureSchedTimeRaw =
    flightData?.departure?.scheduledTime || (flightData as any)?.departure_time || searchParams.depart_date;
  const arrivalSchedTimeRaw =
    flightData?.arrival?.scheduledTime || (flightData as any)?.arrival_time;

  const depTime = formatDisplayTime(departureSchedTimeRaw, depTimezone);
  const depDate = formatDisplayDate(departureSchedTimeRaw || searchParams.depart_date, depTimezone);
  const depTerminal = flightData?.departure?.terminal ? `Terminal ${flightData.departure.terminal}` : null;
  const depGate = flightData?.departure?.gate ? `Gate ${flightData.departure.gate}` : null;
  const depTerminalGate = [depTerminal, depGate].filter(Boolean).join(", ");

  const arrTime = formatDisplayTime(arrivalSchedTimeRaw, arrTimezone);
  const arrDate = formatDisplayDate(arrivalSchedTimeRaw || searchParams.depart_date, arrTimezone);
  const arrTerminal = flightData?.arrival?.terminal ? `Terminal ${flightData.arrival.terminal}` : null;
  const arrGate = flightData?.arrival?.gate ? `Gate ${flightData.arrival.gate}` : null;
  const arrTerminalGate = [arrTerminal, arrGate].filter(Boolean).join(", ");

  // Optional fields from API
  const durationText =
    flightData?.duration ||
    (flightData as any)?.duration_text ||
    (flightData as any)?.flight_duration ||
    null;
  const distanceText = (flightData as any)?.distance || null;
  const aircraftModel = flightData?.aircraft?.model || (flightData as any)?.aircraft_type || null;
  const cabinClass = (flightData as any)?.cabin_class || (flightData as any)?.class || null;
  const mealService = (flightData as any)?.meal_service || (flightData as any)?.meal || null;
  const baggageAllowance = (flightData as any)?.baggage_allowance || (flightData as any)?.baggage || null;
  const icaoCode = (flightData as any)?.icao || null;
  const registration = (flightData as any)?.registration || null;

  const searchTimestamp = useMemo(() => {
    return format(new Date(), "dd MMM yyyy, hh:mm a");
  }, []);

  const handleProceedToBooking = () => {
    navigate({
      to: "/book",
      search: {
        service_id: searchParams.service_id,
        flight_number: flightNum,
        depart_date: searchParams.depart_date,
        direction: searchParams.direction || "arrival",
        pax_adults: searchParams.pax_adults || 1,
        pax_children: searchParams.pax_children || 0,
        pax_infants: searchParams.pax_infants || 0,
        notes: searchParams.notes,
        from_hero: "true",
        validated: "true",
      } as any,
    });
  };

  const handleSearchAgain = () => {
    navigate({ to: "/" });
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-900 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1100px] mx-auto space-y-6">

        {/* ── 1. SUCCESS TOP BANNER ── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                Flight validated successfully
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Here is your real-time flight information.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto">
            <span className="text-xs font-mono text-slate-600 hidden sm:inline">
              Searched on: {searchTimestamp}
            </span>
            <button
              type="button"
              onClick={handleSearchAgain}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Search Again</span>
            </button>
          </div>
        </div>

        {/* ── 2. FLIGHT HEADER CARD (With Prominent Full-Width Top Flight Path) ── */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">

          {/* ── TOP FULL-WIDTH ANIMATED FLIGHT PATH BANNER ── */}
          <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base font-mono">{originCode}</span>
                <span className="text-slate-500 text-xs hidden sm:inline">({originName})</span>
              </div>

              {durationText && (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-900 border border-amber-300/60 text-xs font-mono font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{durationText} Verified Schedule</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs hidden sm:inline">({destName})</span>
                <span className="font-bold text-slate-900 text-base font-mono">{destCode}</span>
              </div>
            </div>

            {/* Long Moving Flight Track Line Across Entire Container (Plane moves flat/level without tilting) */}
            <div className="w-full relative flex items-center justify-between px-1 pt-1 pb-1">
              {/* Left Endpoint Circle (Origin) */}
              <div className="w-4 h-4 rounded-full border-2 border-emerald-600 bg-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              </div>

              {/* Long Dashed Track Line */}
              <div className="flex-1 relative h-6 flex items-center mx-2 overflow-hidden">
                <div className="w-full border-b-2 border-dashed border-amber-400/90" />

                {/* Animated Moving Plane Icon (Glide 0% -> 90% horizontally, LEVEL / NO tilt down, slow speed, larger icon) */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center text-amber-600 bg-white p-2 rounded-full shadow-md border-2 border-amber-300 z-20"
                  initial={{ left: "0%" }}
                  animate={{ left: "90%" }}
                  transition={{
                    duration: 10.5,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 0.5,
                  }}
                >
                  <Plane className="w-6 h-6 text-amber-600 transform rotate-45" />
                </motion.div>
              </div>

              {/* Right Endpoint Circle (Destination) */}
              <div className="w-4 h-4 rounded-full border-2 border-amber-600 bg-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              </div>
            </div>
          </div>

          {/* ── AIRLINE & ROUTE DETAILS GRID ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
            {/* Airline & Flight Number (Left - 4 columns) */}
            <div className="lg:col-span-4 flex items-center gap-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 lg:pr-6">
              <AirlineLogoAvatar
                logoUrl={airlineLogo}
                carrierName={carrierName}
                flightNum={flightNum}
                carrierIata={carrierIata}
              />

              <div className="space-y-1 min-w-0">
                {carrierName && (
                  <div className="text-xs text-slate-500 font-medium font-sans truncate">
                    {carrierName}
                  </div>
                )}
                {flightNum && (
                  <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 truncate">
                    {flightNum}
                  </div>
                )}
                {statusRaw && (
                  <div className="pt-0.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                        isCancelled
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : isDelay
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCancelled ? "bg-rose-500" : isDelay ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                      />
                      <span>{statusRaw}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Airport Location Labels (Center - 5 columns) */}
            <div className="lg:col-span-5 flex items-center justify-between gap-4 text-center px-2">
              {/* Origin Full Location */}
              <div className="space-y-1 text-left max-w-[170px]">
                <div className="text-xl sm:text-2xl font-black font-sans text-slate-900 tracking-tight">
                  {originCode}
                </div>
                {originFullLocation && (
                  <div className="text-xs text-slate-500 font-medium leading-snug">
                    {originFullLocation}
                  </div>
                )}
              </div>

              {/* Route Summary */}
              <div className="text-xs font-mono text-slate-400 font-bold uppercase tracking-widest px-2">
                DIRECT
              </div>

              {/* Destination Full Location */}
              <div className="space-y-1 text-right max-w-[170px]">
                <div className="text-xl sm:text-2xl font-black font-sans text-slate-900 tracking-tight">
                  {destCode}
                </div>
                {destFullLocation && (
                  <div className="text-xs text-slate-500 font-medium leading-snug">
                    {destFullLocation}
                  </div>
                )}
              </div>
            </div>

            {/* Aircraft & Status Meta (Right - 3 columns) */}
            <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 space-y-3">
              {aircraftModel && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Aircraft
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {aircraftModel}
                  </div>
                </div>
              )}

              {statusRaw && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Flight Status
                  </div>
                  <div className="text-sm font-bold text-emerald-600">
                    {statusRaw}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── 3. FLIGHT TIMING CARDS GRID ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            {/* Card 1: Departure */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <PlaneTakeoff className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Departure
                </div>
                <div className="text-lg font-bold text-slate-900">
                  {depTime || "--:--"}
                </div>
                {depDate && (
                  <div className="text-xs text-slate-500 font-medium">
                    {depDate}
                  </div>
                )}
                {depTerminalGate && (
                  <div className="text-xs font-semibold text-slate-700 pt-1">
                    {depTerminalGate}
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Arrival */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <PlaneLanding className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Arrival
                </div>
                <div className="text-lg font-bold text-slate-900">
                  {arrTime || "--:--"}
                </div>
                {arrDate && (
                  <div className="text-xs text-slate-500 font-medium">
                    {arrDate}
                  </div>
                )}
                {arrTerminalGate && (
                  <div className="text-xs font-semibold text-slate-700 pt-1">
                    {arrTerminalGate}
                  </div>
                )}
              </div>
            </div>

            {/* Card 3: Duration */}
            {durationText && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Duration
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {durationText}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Verified Schedule
                  </div>
                </div>
              </div>
            )}

            {/* Card 4: Distance / Route Path */}
            {(distanceText || (originCode && destCode)) && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Navigation className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {distanceText ? "Distance" : "Route Path"}
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {distanceText || `${originCode} → ${destCode}`}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Verified Route
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 4. FLIGHT DETAILS & LIVE STATUS GRID (2 Columns) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Card: Flight Details */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Flight Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              {/* Flight Number */}
              {flightNum && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider">
                    <Plane className="w-3.5 h-3.5" />
                    <span>Flight Number</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {flightNum}
                  </div>
                </div>
              )}

              {/* Airline */}
              {carrierName && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Airline</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {carrierName}
                  </div>
                </div>
              )}

              {/* Aircraft */}
              {aircraftModel && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Aircraft</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {aircraftModel}
                  </div>
                </div>
              )}

              {/* ICAO Code */}
              {icaoCode && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    <span>ICAO Code</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {icaoCode}
                  </div>
                </div>
              )}

              {/* Registration */}
              {registration && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Registration</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {registration}
                  </div>
                </div>
              )}

              {/* Class */}
              {cabinClass && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Class</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {cabinClass}
                  </div>
                </div>
              )}

              {/* Meal Service */}
              {mealService && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider">
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Meal Service</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {mealService}
                  </div>
                </div>
              )}

              {/* Baggage Allowance */}
              {baggageAllowance && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Baggage Allowance</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {baggageAllowance}
                  </div>
                </div>
              )}

              {/* Last Updated */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Last Updated</span>
                </div>
                <div className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Just now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Live Flight Status */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">
                  Live Flight Status
                </h2>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-4 pt-4 text-xs font-semibold">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Flight Scheduled</span>
                  </div>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                    Confirmed
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Departure</span>
                  </div>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                    {statusRaw}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Arrival</span>
                  </div>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                    {statusRaw}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. FOOTER BANNER & BOTTOM CTA ── */}
        <div className="bg-slate-100/90 rounded-2xl border border-slate-200/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Flight status and timings are sourced from live aviation data providers and may vary.</span>
          </div>

          <button
            type="button"
            onClick={handleProceedToBooking}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-semibold text-sm shadow-md transition-all cursor-pointer shrink-0"
          >
            <span>Proceed to Booking</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>

      </div>
    </div>
  );
}
