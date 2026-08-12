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
  Edit2,
  Sparkles,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { FlightData } from "@/services/flight/FlightTypes";
import { format } from "date-fns";
import { IntelligentAirlineAutocomplete } from "@/components/booking/shared/IntelligentAirlineAutocomplete";
import { IntelligentAirportAutocomplete } from "@/components/booking/shared/IntelligentAirportAutocomplete";
import { IntelligentFlightNumberAutocomplete } from "@/components/booking/shared/IntelligentFlightNumberAutocomplete";

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
  flightData: initialFlightData,
  searchParams,
}: FlightVerificationResultViewProps) {
  const navigate = useNavigate();

  const [activeFlightData, setActiveFlightData] = useState<FlightData | null>(initialFlightData);
  const [isEditing, setIsEditing] = useState(false);
  const [backgroundUpdate, setBackgroundUpdate] = useState<FlightData | null>(null);

  // Edit form temporary state
  const [editAirline, setEditAirline] = useState(initialFlightData?.carrier?.name || "");
  const [editFlightNum, setEditFlightNum] = useState(
    initialFlightData?.flightNum || searchParams.flight_number?.toUpperCase() || ""
  );
  const [editDepCode, setEditDepCode] = useState(initialFlightData?.origin?.code || "DEL");
  const [editArrCode, setEditArrCode] = useState(initialFlightData?.destination?.code || "BOM");

  // Information Source Indicator State: 'Live Data' | 'Provided Information' | 'Updating'
  const isManual = Boolean(activeFlightData?.isManual);
  const sourceIndicator = isManual
    ? { label: "Provided Information", bg: "bg-slate-100 text-slate-700 border-slate-300", icon: "pencil" }
    : { label: "Live Data", bg: "bg-emerald-50 text-emerald-800 border-emerald-300", icon: "live" };

  // 100% Dynamic attributes from activeFlightData
  const flightNum = activeFlightData?.flightNum || searchParams.flight_number?.toUpperCase() || "";
  const carrierName = activeFlightData?.carrier?.name || null;
  const carrierIata = activeFlightData?.carrier?.iata || null;
  const airlineLogo = activeFlightData?.carrier?.logo || null;

  const statusRaw = activeFlightData?.status || "Scheduled";
  const isDelay = statusRaw.toLowerCase().includes("delay");
  const isCancelled = statusRaw.toLowerCase().includes("cancel");

  // Route Origin
  const originCode = activeFlightData?.origin?.code || "";
  const originName = activeFlightData?.origin?.name || activeFlightData?.origin?.city || originCode;
  const originCityCountry = [activeFlightData?.origin?.city, activeFlightData?.origin?.country]
    .filter(Boolean)
    .join(", ");
  const originFullLocation = originCityCountry ? `${originName}, ${originCityCountry}` : originName;

  // Route Destination
  const destCode = activeFlightData?.destination?.code || "";
  const destName = activeFlightData?.destination?.name || activeFlightData?.destination?.city || destCode;
  const destCityCountry = [activeFlightData?.destination?.city, activeFlightData?.destination?.country]
    .filter(Boolean)
    .join(", ");
  const destFullLocation = destCityCountry ? `${destName}, ${destCityCountry}` : destName;

  // Timings with Airport Timezone conversion
  const depTimezone = activeFlightData?.departure?.timezone || activeFlightData?.origin?.timezone || null;
  const arrTimezone = activeFlightData?.arrival?.timezone || activeFlightData?.destination?.timezone || null;

  const departureSchedTimeRaw =
    activeFlightData?.departure?.scheduledTime || (activeFlightData as any)?.departure_time || searchParams.depart_date;
  const arrivalSchedTimeRaw =
    activeFlightData?.arrival?.scheduledTime || (activeFlightData as any)?.arrival_time;

  const depTime = formatDisplayTime(departureSchedTimeRaw, depTimezone);
  const depDate = formatDisplayDate(departureSchedTimeRaw || searchParams.depart_date, depTimezone);
  const depTerminal = activeFlightData?.departure?.terminal ? `Terminal ${activeFlightData.departure.terminal}` : null;
  const depGate = activeFlightData?.departure?.gate ? `Gate ${activeFlightData.departure.gate}` : null;
  const depTerminalGate = [depTerminal, depGate].filter(Boolean).join(", ");

  const arrTime = formatDisplayTime(arrivalSchedTimeRaw, arrTimezone);
  const arrDate = formatDisplayDate(arrivalSchedTimeRaw || searchParams.depart_date, arrTimezone);
  const arrTerminal = activeFlightData?.arrival?.terminal ? `Terminal ${activeFlightData.arrival.terminal}` : null;
  const arrGate = activeFlightData?.arrival?.gate ? `Gate ${activeFlightData.arrival.gate}` : null;
  const arrTerminalGate = [arrTerminal, arrGate].filter(Boolean).join(", ");

  const durationText =
    activeFlightData?.duration ||
    (activeFlightData as any)?.duration_text ||
    (activeFlightData as any)?.flight_duration ||
    null;
  const distanceText = (activeFlightData as any)?.distance || null;
  const aircraftModel = activeFlightData?.aircraft?.model || (activeFlightData as any)?.aircraft_type || null;
  const cabinClass = (activeFlightData as any)?.cabin_class || (activeFlightData as any)?.class || null;
  const mealService = (activeFlightData as any)?.meal_service || (activeFlightData as any)?.meal || null;
  const baggageAllowance = (activeFlightData as any)?.baggage_allowance || (activeFlightData as any)?.baggage || null;
  const icaoCode = (activeFlightData as any)?.icao || null;
  const registration = (activeFlightData as any)?.registration || null;

  const searchTimestamp = useMemo(() => {
    return format(new Date(), "dd MMM yyyy, hh:mm a");
  }, []);

  const handleSaveInPlaceEdits = () => {
    const cleanNum = editFlightNum.trim().toUpperCase();
    const carrier = cleanNum.slice(0, 2).toUpperCase();
    const updated: FlightData = {
      ...activeFlightData,
      flightNum: cleanNum,
      carrier: {
        iata: carrier,
        name: editAirline || `${carrier} Airways`,
        logo: `https://images.aviation-edge.com/airline-logos/${carrier}.png`,
      },
      origin: {
        code: editDepCode,
        name: `${editDepCode} Airport`,
        city: editDepCode,
      },
      destination: {
        code: editArrCode,
        name: `${editArrCode} Airport`,
        city: editArrCode,
      },
      isManual: true,
    };
    setActiveFlightData(updated);
    setIsEditing(false);
  };

  const handleProceedToBooking = () => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("shafsky_validated_flight", JSON.stringify(activeFlightData));
      } catch {
        // ignore cache write error
      }
    }

    // Determine the correct target airport based on direction
    const direction = searchParams.direction || "arrival";
    const targetAirportCode =
      direction === "arrival"
        ? activeFlightData?.destination?.code || ""
        : direction === "departure"
          ? activeFlightData?.origin?.code || ""
          : (activeFlightData as any)?.transit?.code || "";

    navigate({
      to: "/book",
      search: {
        origin: targetAirportCode,
        service_id: searchParams.service_id,
        flight_number: flightNum,
        depart_date: searchParams.depart_date,
        direction,
        pax_adults: searchParams.pax_adults || 1,
        pax_children: searchParams.pax_children || 0,
        pax_infants: searchParams.pax_infants || 0,
        notes: searchParams.notes,
        from_hero: "true",
        validated: "true",
      } as any,
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-900 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1100px] mx-auto space-y-6">

        {/* ── 1. HEADER BANNER WITH SOURCE INDICATOR ── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                  Review Your Journey
                </h1>
                {/* Subtle Information Source Indicator */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${sourceIndicator.bg}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isManual ? "bg-slate-500" : "bg-emerald-500 animate-pulse"
                    }`}
                  />
                  <span>{sourceIndicator.label}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Confirm your journey itinerary and select your VIP airport concierge options.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-bold text-xs transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-purple-700" />
              <span>{isEditing ? "Close Editor" : "Edit Journey Details"}</span>
            </button>
          </div>
        </div>

        {/* Lightweight Non-Interruptive Inline Notification for Background Updates */}
        {backgroundUpdate && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-xs font-bold text-slate-900">
                We found updated flight information.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveFlightData(backgroundUpdate);
                  setBackgroundUpdate(null);
                }}
                className="px-3 py-1 rounded-lg bg-purple-700 text-white text-[10px] font-bold uppercase tracking-wider"
              >
                Review Changes
              </button>
              <button
                type="button"
                onClick={() => setBackgroundUpdate(null)}
                className="px-3 py-1 rounded-lg bg-slate-200 text-slate-800 text-[10px] font-bold uppercase tracking-wider"
              >
                Keep Current Details
              </button>
            </div>
          </motion.div>
        )}

        {/* Inline Direct Editor Card */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-3xl border border-purple-200 p-6 shadow-lg space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900">
                Edit Journey Details In-Place
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">No need to start over</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Airline
                </label>
                <IntelligentAirlineAutocomplete
                  value={editAirline}
                  onChangeText={setEditAirline}
                  onSelect={(a) => setEditAirline(a.name)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Flight Number
                </label>
                <IntelligentFlightNumberAutocomplete
                  value={editFlightNum}
                  onChangeText={setEditFlightNum}
                  onSelect={(f) => setEditFlightNum(f.flightNum)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Departure Airport
                </label>
                <IntelligentAirportAutocomplete
                  value={editDepCode}
                  onChangeText={setEditDepCode}
                  onSelect={(ap) => setEditDepCode(ap.code)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Arrival Airport
                </label>
                <IntelligentAirportAutocomplete
                  value={editArrCode}
                  onChangeText={setEditArrCode}
                  onSelect={(ap) => setEditArrCode(ap.code)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveInPlaceEdits}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-purple-900 text-white font-mono text-xs font-bold uppercase tracking-widest transition shadow-md"
              >
                Save & Update Journey
              </button>
            </div>
          </motion.div>
        )}

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

        {/* ── 4. FLIGHT DETAILS & LIVE STATUS GRID (2 Columns or 1 Full Column for Manual) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Card: Flight Details */}
          <div className={`${isManual ? "lg:col-span-12" : "lg:col-span-8"} bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6`}>
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

              {/* Information Source */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Information Source</span>
                </div>
                <div className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isManual ? "bg-slate-400" : "bg-emerald-500 animate-pulse"}`} />
                  <span>{isManual ? "Provided Information" : "Live Flight Radar"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Live Flight Status (Only rendered when NOT manual entry) */}
          {!isManual && (
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
          )}
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
