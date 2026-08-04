import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Plane,
  Clock,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Building2,
  DoorOpen,
  Radio,
} from "lucide-react";
import { FlightData } from "@/services/flight/FlightTypes";

interface ValidatedFlightExperienceProps {
  flightData: FlightData | null;
  serviceDate?: string;
  airportCode?: string;
  direction?: "arrival" | "departure" | "transit";
  onContinue: () => void;
  onChangeFlight: () => void;
}

/**
 * Pure Time Formatter: Converts raw timestamp into "07:00 AM" format.
 * Returns null if invalid or missing (gracefully omitted from UI).
 */
function formatFlightTime(timeStr?: string | null): string | null {
  if (!timeStr || typeof timeStr !== "string") return null;
  const cleaned = timeStr.trim();
  if (!cleaned) return null;

  if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(cleaned)) {
    const [time, period] = cleaned.split(/\s+/);
    const [h, m] = time.split(":");
    const hour2Digit = h.padStart(2, "0");
    return `${hour2Digit}:${m} ${period.toUpperCase()}`;
  }

  try {
    const dateObj = new Date(cleaned);
    if (!isNaN(dateObj.getTime())) {
      const hours = dateObj.getHours();
      const minutes = dateObj.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHour = (hours % 12 || 12).toString().padStart(2, "0");
      const displayMinutes = minutes.toString().padStart(2, "0");
      return `${displayHour}:${displayMinutes} ${ampm}`;
    }
  } catch {
    // Ignore invalid date strings
  }

  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(cleaned)) {
    const [h, m] = cleaned.split(":");
    const hourNum = parseInt(h, 10);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const displayHour = (hourNum % 12 || 12).toString().padStart(2, "0");
    const displayMinutes = m.padStart(2, "0");
    return `${displayHour}:${displayMinutes} ${ampm}`;
  }

  return null;
}

/**
 * Pure Date Formatter: Converts raw timestamp into "Tue, 05 Aug 2026" format.
 * Returns null if invalid or missing (gracefully omitted from UI).
 */
function formatFlightDate(dateStr?: string | null): string | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const cleaned = dateStr.trim();
  if (!cleaned) return null;

  try {
    const dateObj = new Date(cleaned);
    if (!isNaN(dateObj.getTime())) {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dayName = days[dateObj.getDay()];
      const dayNum = dateObj.getDate().toString().padStart(2, "0");
      const monthName = months[dateObj.getMonth()];
      const year = dateObj.getFullYear();
      return `${dayName}, ${dayNum} ${monthName} ${year}`;
    }
  } catch {
    // Ignore invalid date strings
  }

  return null;
}

/**
 * Pure Terminal Formatter: Returns "Terminal T3" or raw string.
 * Returns null if missing.
 */
function formatTerminalChip(termRaw?: string | null): string | null {
  if (!termRaw || typeof termRaw !== "string") return null;
  const cleaned = termRaw.trim();
  if (!cleaned) return null;

  if (/^terminal\s*t?\d+$/i.test(cleaned)) {
    const num = cleaned.replace(/\D/g, "");
    return `Terminal T${num}`;
  }
  if (/^t\d+$/i.test(cleaned)) {
    return `Terminal T${cleaned.slice(1)}`;
  }
  if (/\bT(\d+)\b/i.test(cleaned)) {
    const match = cleaned.match(/\bT(\d+)\b/i);
    if (match) return `Terminal T${match[1]}`;
  }
  if (/\bTerminal\s*(\d+)\b/i.test(cleaned)) {
    const match = cleaned.match(/\bTerminal\s*(\d+)\b/i);
    if (match) return `Terminal T${match[1]}`;
  }
  return cleaned.startsWith("Terminal") ? cleaned : `Terminal ${cleaned}`;
}

/**
 * Status Badge Component with Subtle Glow
 */
const StatusBadge = React.memo(function StatusBadge({
  status,
}: {
  status?: string | null;
}) {
  if (!status || typeof status !== "string" || !status.trim()) return null;
  const normalized = status.trim().toUpperCase();

  let badgeStyle =
    "bg-emerald-500/10 text-emerald-900 border-emerald-300/80 shadow-xs";
  let dotStyle = "bg-emerald-500 animate-pulse";
  let label = normalized;

  if (normalized.includes("DELAY")) {
    badgeStyle =
      "bg-amber-500/10 text-amber-900 border-amber-300/80 shadow-xs";
    dotStyle = "bg-amber-500 animate-ping";
  } else if (normalized.includes("CANCEL")) {
    badgeStyle =
      "bg-rose-500/10 text-rose-900 border-rose-300/80 shadow-xs";
    dotStyle = "bg-rose-500";
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-['Inter',sans-serif] font-semibold uppercase tracking-wider transition-all ${badgeStyle}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotStyle}`} />
      <span>{label}</span>
    </div>
  );
});

/**
 * Skeleton Loader for Instant Perceived Performance
 */
export function ValidatedFlightSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto py-8 space-y-8 font-['Plus_Jakarta_Sans',sans-serif] animate-pulse">
      <div className="h-8 bg-slate-200/60 rounded-xl w-1/4" />
      <div className="h-12 bg-slate-200/50 rounded-2xl w-1/2" />
      <div className="h-44 bg-slate-200/30 rounded-3xl w-full" />
    </div>
  );
}

export function ValidatedFlightExperience({
  flightData,
  serviceDate,
  airportCode,
  onContinue,
  onChangeFlight,
}: ValidatedFlightExperienceProps) {
  const shouldReduceMotion = useReducedMotion();

  // 100% Dynamic Backend Attributes Extraction
  const carrierName = typeof flightData?.carrier?.name === "string" ? flightData.carrier.name.trim() : null;
  const flightNum = typeof flightData?.flightNum === "string" ? flightData.flightNum.trim() : null;
  const status = typeof flightData?.status === "string" ? flightData.status.trim() : null;
  const aircraftModel = typeof flightData?.aircraft?.model === "string" ? flightData.aircraft.model.trim() : null;

  // Extract raw backend duration string
  const rawDuration =
    (flightData as any)?.duration_text ||
    flightData?.duration ||
    (flightData as any)?.flight_duration;

  const duration =
    typeof rawDuration === "string" && rawDuration.trim().length > 0
      ? rawDuration.trim()
      : typeof rawDuration === "number"
      ? `${rawDuration} mins`
      : null;

  // Airport details (100% Backend-Driven)
  const originCode = typeof flightData?.origin?.code === "string" ? flightData.origin.code.trim() : "DEL";
  const originCity = typeof flightData?.origin?.city === "string" ? flightData.origin.city.trim() : null;
  const originName = typeof flightData?.origin?.name === "string" ? flightData.origin.name.trim() : null;
  const originSchedTime = typeof flightData?.departure?.scheduledTime === "string"
    ? flightData.departure.scheduledTime
    : (flightData as any)?.departure_time || null;

  const destCode = typeof flightData?.destination?.code === "string"
    ? flightData.destination.code.trim()
    : (typeof airportCode === "string" ? airportCode.trim() : "BOM");
  const destCity = typeof flightData?.destination?.city === "string" ? flightData.destination.city.trim() : null;
  const destName = typeof flightData?.destination?.name === "string" ? flightData.destination.name.trim() : null;
  const destSchedTime = typeof flightData?.arrival?.scheduledTime === "string"
    ? flightData.arrival.scheduledTime
    : (flightData as any)?.arrival_time || null;

  // Dynamic Terminal & Gate Chips
  const originTerminalRaw = typeof flightData?.departure?.terminal === "string" ? flightData.departure.terminal : null;
  const destTerminalRaw = typeof flightData?.arrival?.terminal === "string" ? flightData.arrival.terminal : null;
  const originGate = typeof (flightData?.departure as any)?.gate === "string"
    ? (flightData?.departure as any).gate
    : (flightData as any)?.departure_gate || null;
  const destGate = typeof (flightData?.arrival as any)?.gate === "string"
    ? (flightData?.arrival as any).gate
    : (flightData as any)?.arrival_gate || null;

  const depTerminalChip = formatTerminalChip(originTerminalRaw);
  const arrTerminalChip = formatTerminalChip(destTerminalRaw);

  const formattedDepTime = formatFlightTime(originSchedTime);
  const formattedArrTime = formatFlightTime(destSchedTime);
  const formattedDepDate = formatFlightDate(originSchedTime || serviceDate);
  const formattedArrDate = formatFlightDate(destSchedTime || serviceDate);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 font-['Plus_Jakarta_Sans',sans-serif] text-[#1C1917]">
      {/* 1. HEADING & FLIGHT STATUS (INDEPENDENT UNBOXED SECTION) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E7E0D3]/80">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#78350F] text-[11px] font-['Inter',sans-serif] font-semibold uppercase tracking-wider">
            <Radio className="w-3 h-3 text-[#D97706] animate-pulse" />
            <span>Verified Airside Schedule</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#1C1917] tracking-tight">
            Flight Verification
          </h1>
          <p className="text-xs sm:text-sm font-['Inter',sans-serif] font-normal text-[#78716C]">
            Live route timeline & airport details verified with airline system.
          </p>
        </div>

        {/* Flight Status & Carrier Tag */}
        {(status || carrierName || flightNum) && (
          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
            {status && <StatusBadge status={status} />}
            {(carrierName || flightNum) && (
              <span className="text-xs font-['Inter',sans-serif] font-semibold text-[#57534E] uppercase tracking-wider bg-white/90 backdrop-blur-xs border border-[#E7E0D3] px-3.5 py-1.5 rounded-full shadow-2xs">
                {[carrierName, flightNum].filter(Boolean).join(" • ")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 2. ROUTE TIMELINE (35% WIDER HORIZONTAL TRACK, DURATION ABOVE CENTER, LINEAR ANIMATION) */}
      <div className="w-full py-2 sm:py-4 space-y-4">
        {/* DURATION DISPLAYED DIRECTLY ABOVE THE CENTER OF THE ROUTE */}
        {duration && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] border border-[#FDE68A] text-[#78350F] text-xs font-['Inter',sans-serif] font-medium shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Duration {duration}</span>
            </div>
          </div>
        )}

        {/* DESKTOP / TABLET ROUTE TIMELINE */}
        <div className="hidden md:block w-full">
          <div className="flex items-center justify-between gap-6 lg:gap-10">
            {/* DEPARTURE AIRPORT (LEFT ALIGNED) */}
            <div className="w-64 lg:w-80 shrink-0 space-y-2 text-left">
              {/* Large Airport Code */}
              <span className="text-5xl lg:text-6xl xl:text-7xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#1C1917] tracking-tight block">
                {originCode}
              </span>
              {/* Medium Airport Name */}
              {originCity && (
                <h2 className="text-lg lg:text-xl font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[#292524] leading-snug">
                  {originCity}
                </h2>
              )}
              {originName && (
                <p className="text-xs font-['Inter',sans-serif] font-normal text-[#78716C]">
                  {originName}
                </p>
              )}
              {/* Departure Time & Date */}
              {(formattedDepTime || formattedDepDate) && (
                <div className="pt-1.5 space-y-0.5">
                  {formattedDepTime && (
                    <div className="text-lg lg:text-xl font-['Inter',sans-serif] font-medium text-[#1C1917]">
                      {formattedDepTime}
                    </div>
                  )}
                  {formattedDepDate && (
                    <div className="text-xs font-['Inter',sans-serif] font-normal text-[#78716C]">
                      {formattedDepDate}
                    </div>
                  )}
                </div>
              )}
              {/* Terminal & Gate Small Chips */}
              {(depTerminalChip || originGate) && (
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {depTerminalChip && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FEF3C7]/80 border border-[#FDE68A] text-[#78350F] text-xs font-['Inter',sans-serif] font-normal shadow-2xs">
                      <Building2 className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>Departure {depTerminalChip}</span>
                    </span>
                  )}
                  {originGate && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FEF3C7]/80 border border-[#FDE68A] text-[#78350F] text-xs font-['Inter',sans-serif] font-normal shadow-2xs">
                      <DoorOpen className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>Gate {originGate}</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* CENTER TRACK & ANIMATED PLANE (35% LONGER HORIZONTAL TRACK) */}
            <div className="flex-1 relative flex items-center justify-center py-8 px-2 lg:px-6">
              {/* Horizontal Line with subtle gradient */}
              <div className="w-full relative flex items-center justify-between">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 border-b-2 border-dashed border-[#CBD5E1] z-0" />

                {/* Left Node Dot (Departure) */}
                <div className="relative z-10 w-4 h-4 rounded-full bg-[#1C1917] ring-4 ring-[#84cc16]/20 shadow-xs flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16]" />
                </div>

                {/* Uni-directional Moving Airplane (Departure → Arrival ONLY, Linear 5s Loop) */}
                <motion.div
                  initial={shouldReduceMotion ? { left: "50%" } : { left: "2%", opacity: 1 }}
                  animate={
                    shouldReduceMotion
                      ? {}
                      : {
                          left: ["2%", "94%"],
                          opacity: [0, 1, 1, 0.2],
                        }
                  }
                  transition={
                    shouldReduceMotion
                      ? {}
                      : {
                          duration: 5,
                          ease: "linear",
                          repeat: Infinity,
                          repeatDelay: 0.2,
                        }
                  }
                  className="absolute top-1/2 -translate-y-1/2 z-20 -ml-4 p-2.5 rounded-full bg-[#1C1917] text-[#84cc16] shadow-md border border-[#84cc16]/40 flex items-center justify-center"
                  aria-label="Plane in transit animation"
                >
                  <Plane className="w-4 h-4 rotate-45 transform-gpu" />
                </motion.div>

                {/* Right Node Dot (Arrival) */}
                <div className="relative z-10 w-4 h-4 rounded-full bg-[#1C1917] ring-4 ring-[#84cc16]/20 shadow-xs flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16]" />
                </div>
              </div>
            </div>

            {/* ARRIVAL AIRPORT (RIGHT ALIGNED) */}
            <div className="w-64 lg:w-80 shrink-0 space-y-2 text-right">
              {/* Large Airport Code */}
              <span className="text-5xl lg:text-6xl xl:text-7xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#1C1917] tracking-tight block">
                {destCode}
              </span>
              {/* Medium Airport Name */}
              {destCity && (
                <h2 className="text-lg lg:text-xl font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[#292524] leading-snug">
                  {destCity}
                </h2>
              )}
              {destName && (
                <p className="text-xs font-['Inter',sans-serif] font-normal text-[#78716C]">
                  {destName}
                </p>
              )}
              {/* Arrival Time & Date */}
              {(formattedArrTime || formattedArrDate) && (
                <div className="pt-1.5 space-y-0.5">
                  {formattedArrTime && (
                    <div className="text-lg lg:text-xl font-['Inter',sans-serif] font-medium text-[#1C1917]">
                      {formattedArrTime}
                    </div>
                  )}
                  {formattedArrDate && (
                    <div className="text-xs font-['Inter',sans-serif] font-normal text-[#78716C]">
                      {formattedArrDate}
                    </div>
                  )}
                </div>
              )}
              {/* Terminal & Gate Small Chips */}
              {(arrTerminalChip || destGate) && (
                <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                  {arrTerminalChip && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FEF3C7]/80 border border-[#FDE68A] text-[#78350F] text-xs font-['Inter',sans-serif] font-normal shadow-2xs">
                      <Building2 className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>Arrival {arrTerminalChip}</span>
                    </span>
                  )}
                  {destGate && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FEF3C7]/80 border border-[#FDE68A] text-[#78350F] text-xs font-['Inter',sans-serif] font-normal shadow-2xs">
                      <DoorOpen className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>Gate {destGate}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE ROUTE TIMELINE (< md VERTICAL STACKING, 100% RESPONSIVE) */}
        <div className="md:hidden space-y-5 py-3 p-5 rounded-2xl bg-white/70 backdrop-blur-xs border border-[#E7E0D3]">
          {/* Mobile Departure */}
          <div className="space-y-1">
            <span className="text-4xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#1C1917] block">
              {originCode}
            </span>
            {(originCity || originName) && (
              <h2 className="text-lg font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[#1C1917]">
                {[originCity, originName].filter(Boolean).join(" — ")}
              </h2>
            )}
            {formattedDepTime && (
              <div className="text-base font-['Inter',sans-serif] font-medium text-[#1C1917] pt-0.5">
                {formattedDepTime}
              </div>
            )}
            {formattedDepDate && (
              <div className="text-xs font-['Inter',sans-serif] font-normal text-[#78716C]">
                {formattedDepDate}
              </div>
            )}
            {depTerminalChip && (
              <span className="inline-inline-flex items-center gap-1.5 px-3 py-1 mt-1.5 rounded-lg bg-[#FEF3C7]/80 border border-[#FDE68A] text-[#78350F] text-xs font-['Inter',sans-serif] font-normal">
                <Building2 className="w-3 h-3 text-[#D97706] inline mr-1" />
                Departure {depTerminalChip}
              </span>
            )}
          </div>

          {/* Mobile Vertical Track (Top -> Bottom Only) */}
          <div className="flex items-center justify-center py-1 relative h-14">
            <div className="h-full w-0.5 border-l-2 border-dashed border-[#CBD5E1]" />
            <motion.div
              initial={shouldReduceMotion ? { top: "50%" } : { top: "0%", opacity: 1 }}
              animate={shouldReduceMotion ? {} : { top: ["0%", "70%"], opacity: [0, 1, 0] }}
              transition={shouldReduceMotion ? {} : { duration: 4, ease: "linear", repeat: Infinity }}
              className="absolute p-2 rounded-full bg-[#1C1917] text-[#84cc16] border border-[#84cc16]/40 shadow-xs"
            >
              <Plane className="w-3.5 h-3.5 rotate-[135deg]" />
            </motion.div>
          </div>

          {/* Mobile Arrival */}
          <div className="space-y-1">
            <span className="text-4xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#1C1917] block">
              {destCode}
            </span>
            {(destCity || destName) && (
              <h2 className="text-lg font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[#1C1917]">
                {[destCity, destName].filter(Boolean).join(" — ")}
              </h2>
            )}
            {formattedArrTime && (
              <div className="text-base font-['Inter',sans-serif] font-medium text-[#1C1917] pt-0.5">
                {formattedArrTime}
              </div>
            )}
            {formattedArrDate && (
              <div className="text-xs font-['Inter',sans-serif] font-normal text-[#78716C]">
                {formattedArrDate}
              </div>
            )}
            {arrTerminalChip && (
              <span className="inline-inline-flex items-center gap-1.5 px-3 py-1 mt-1.5 rounded-lg bg-[#FEF3C7]/80 border border-[#FDE68A] text-[#78350F] text-xs font-['Inter',sans-serif] font-normal">
                <Building2 className="w-3 h-3 text-[#D97706] inline mr-1" />
                Arrival {arrTerminalChip}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. FLIGHT DETAILS (MODERN 2-COLUMN GRID ON DESKTOP & TABLET) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
        {/* Card 1: Aircraft & Airline Information */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white/85 backdrop-blur-md border border-[#E7E0D3] shadow-xs hover:shadow-md transition-all duration-300 space-y-4">
          <div className="flex items-center gap-3 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-sm">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-200/80 flex items-center justify-center text-[#854D0E]">
              <Plane className="w-4 h-4" />
            </div>
            <span>Aircraft & Operating Carrier</span>
          </div>
          <div className="space-y-2 text-xs font-['Inter',sans-serif] font-normal text-[#57534E]">
            {aircraftModel && (
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Aircraft Model</span>
                <strong className="font-semibold text-[#1C1917]">{aircraftModel}</strong>
              </div>
            )}
            {(carrierName || flightNum) && (
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Operating Carrier</span>
                <strong className="font-semibold text-[#1C1917]">
                  {[carrierName, flightNum ? `(${flightNum})` : null].filter(Boolean).join(" ")}
                </strong>
              </div>
            )}
            <div className="flex justify-between py-1.5">
              <span>Radar Synchronization</span>
              <strong className="font-semibold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live ADS-B Active</span>
              </strong>
            </div>
          </div>
        </div>

        {/* Card 2: Airside Protocol & Concierge Status */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white/85 backdrop-blur-md border border-[#E7E0D3] shadow-xs hover:shadow-md transition-all duration-300 space-y-4">
          <div className="flex items-center gap-3 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-200/80 flex items-center justify-center text-emerald-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span>Airside Concierge Readiness</span>
          </div>
          <div className="space-y-2 text-xs font-['Inter',sans-serif] font-normal text-[#57534E]">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span>Meet & Assist Officer</span>
              <strong className="font-semibold text-emerald-800">Ready for Dispatch</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span>Airside Protocol</span>
              <strong className="font-semibold text-[#1C1917]">Tarmac & Terminal Escort</strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span>Assistance Clearance</span>
              <strong className="font-semibold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified</span>
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CONTINUE ACTION BUTTON (UNBOXED RESPONSIVE ROW) */}
      <div className="pt-6 border-t border-[#E7E0D3]/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onChangeFlight}
          className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-full bg-white hover:bg-slate-50 text-[#44403C] hover:text-[#1C1917] border border-[#E7E0D3] shadow-2xs hover:shadow-xs font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#854D0E]" />
          <span>Change Flight Details</span>
        </button>

        <motion.button
          type="button"
          whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -1 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
          onClick={onContinue}
          className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-full bg-gradient-to-r from-[#84cc16] via-[#76bd13] to-[#65a30d] hover:from-[#65a30d] hover:to-[#4d7c0f] text-[#0f172a] font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xs uppercase tracking-wider shadow-md shadow-[#84cc16]/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          <span>Continue to Airport Services</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
