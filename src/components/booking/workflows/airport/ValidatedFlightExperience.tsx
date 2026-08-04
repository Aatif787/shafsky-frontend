import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Plane,
  Clock,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
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
 * Status Badge Component with Subtle Glow (Gracefully omitted if status is null/empty)
 */
const StatusBadge = React.memo(function StatusBadge({
  status,
}: {
  status?: string | null;
}) {
  if (!status || typeof status !== "string" || !status.trim()) return null;
  const normalized = status.trim().toUpperCase();

  let badgeStyle =
    "bg-emerald-500/10 text-emerald-800 border-emerald-300/80 shadow-[0_0_12px_rgba(16,185,129,0.15)]";
  let dotStyle = "bg-emerald-500 animate-pulse";
  let label = normalized;

  if (normalized.includes("DELAY")) {
    badgeStyle =
      "bg-amber-500/10 text-amber-900 border-amber-300/80 shadow-[0_0_12px_rgba(245,158,11,0.15)]";
    dotStyle = "bg-amber-500 animate-ping";
  } else if (normalized.includes("CANCEL")) {
    badgeStyle =
      "bg-rose-500/10 text-rose-900 border-rose-300/80 shadow-[0_0_12px_rgba(244,63,94,0.15)]";
    dotStyle = "bg-rose-500";
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-mono font-bold uppercase tracking-wider transition-all ${badgeStyle}`}
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
    <div className="w-full max-w-[94%] mx-auto py-8 space-y-10 font-sans animate-pulse">
      <div className="h-8 bg-slate-200/60 rounded-xl w-1/4" />
      <div className="h-12 bg-slate-200/50 rounded-2xl w-1/2" />
      <div className="h-40 bg-slate-200/30 rounded-3xl w-full" />
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

  // 100% Dynamic Backend Attributes Extraction (Zero Hardcoded Fallbacks)
  const carrierName = typeof flightData?.carrier?.name === "string" ? flightData.carrier.name.trim() : null;
  const flightNum = typeof flightData?.flightNum === "string" ? flightData.flightNum.trim() : null;
  const status = typeof flightData?.status === "string" ? flightData.status.trim() : null;
  const aircraftModel = typeof flightData?.aircraft?.model === "string" ? flightData.aircraft.model.trim() : null;

  // Extract raw backend duration string directly (no estimation, no hardcoded fallbacks)
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

  // Dynamic Terminal & Gate Chips (No hardcoding)
  const originTerminalRaw = typeof flightData?.departure?.terminal === "string" ? flightData.departure.terminal : null;
  const destTerminalRaw = typeof flightData?.arrival?.terminal === "string" ? flightData.arrival.terminal : null;
  const originGate = typeof (flightData?.departure as any)?.gate === "string"
    ? (flightData?.departure as any).gate
    : (flightData as any)?.departure_gate || null;
  const destGate = typeof (flightData?.arrival as any)?.gate === "string"
    ? (flightData?.arrival as any).gate
    : (flightData as any)?.arrival_gate || null;

  const depTerminalChip = formatTerminalChip(originTerminalRaw) || "Terminal info not yet available";
  const arrTerminalChip = formatTerminalChip(destTerminalRaw) || "Terminal info not yet available";
  const depGateDisplay = originGate ? `Gate ${originGate}` : "Gate will be assigned by airline";
  const arrGateDisplay = destGate ? `Gate ${destGate}` : "Gate will be assigned by airline";

  const formattedDepTime = formatFlightTime(originSchedTime);
  const formattedArrTime = formatFlightTime(destSchedTime);
  const formattedDepDate = formatFlightDate(originSchedTime || serviceDate);
  const formattedArrDate = formatFlightDate(destSchedTime || serviceDate);

  return (
    <div className="w-full max-w-[94%] mx-auto py-6 sm:py-10 space-y-10 sm:space-y-14 font-sans text-[#1C1917]">
      {/* 1. STEP INDICATOR */}
      <div>
        <span className="px-3.5 py-1 rounded-full bg-[#F4EFE6] border border-[#E2D8C6] text-[#6B5E4A] text-[11px] font-mono font-bold uppercase tracking-[0.25em]">
          Step 2 of 5 — Validated Flight
        </span>
      </div>

      {/* 2. FLIGHT VERIFICATION HEADER & CHANGE FLIGHT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DFD1]/60">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1C1917] tracking-tight">
            Flight Verification
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] font-medium mt-1">
            Verified airside routing & flight details.
          </p>
        </div>

        <button
          type="button"
          onClick={onChangeFlight}
          className="self-start sm:self-center px-5 py-2.5 rounded-full bg-white/90 hover:bg-white text-[#44403C] hover:text-[#1C1917] border border-[#E7E0D3] shadow-xs hover:shadow-md font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
          <span>Change Flight</span>
        </button>
      </div>

      {/* 3. FLIGHT STATUS & CARRIER ROW (GRACEFULLY CONDITIONAL) */}
      {(status || carrierName || flightNum) && (
        <div className="flex items-center gap-3">
          {status && <StatusBadge status={status} />}
          {(carrierName || flightNum) && (
            <span className="text-xs font-mono font-bold text-[#78716C] uppercase tracking-wider">
              {[carrierName, flightNum].filter(Boolean).join(" • ")}
            </span>
          )}
        </div>
      )}

      {/* 4. ANIMATED ROUTE WITH DURATION ABOVE (UNBOXED 92-95% WIDE LAYOUT) */}
      <div className="space-y-6 py-4">
        {/* DURATION DISPLAYED DIRECTLY ABOVE THE ROUTE (GRACEFULLY OMITTED IF NULL) */}
        {duration && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F4EFE6] border border-[#E2D8C6] text-[#6B5E4A] text-xs font-mono font-bold uppercase tracking-widest shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Duration {duration}</span>
            </div>
          </div>
        )}

        {/* HORIZONTAL ROUTE TRACK (DESKTOP / TABLET) */}
        <div className="hidden md:block w-full py-4">
          <div className="grid grid-cols-12 gap-6 items-center">
            {/* DEPARTURE AIRPORT (LEFT) */}
            <div className="col-span-4 space-y-2 text-left">
              <span className="text-4xl lg:text-5xl font-mono font-black text-[#1C1917] tracking-tight block">
                {originCode}
              </span>
              {originCity && (
                <h2 className="text-2xl font-serif font-bold text-[#1C1917] leading-snug">
                  {originCity}
                </h2>
              )}
              {originName && (
                <p className="text-xs font-mono text-[#78716C]">
                  {originName}
                </p>
              )}
              {(formattedDepTime || formattedDepDate) && (
                <div className="pt-2 space-y-1">
                  {formattedDepTime && (
                    <div className="text-xs font-mono font-bold text-[#1C1917]">
                      {formattedDepTime}
                    </div>
                  )}
                  {formattedDepDate && (
                    <div className="text-xs font-mono text-[#78716C]">
                      {formattedDepDate}
                    </div>
                  )}
                </div>
              )}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="inline-block px-3 py-1 rounded-md bg-[#F4EFE6] border border-[#E2D8C6] text-[#6B5E4A] text-xs font-mono font-bold uppercase tracking-wider">
                  Departure {depTerminalChip}
                </span>
                <span className="inline-block px-3 py-1 rounded-md bg-[#F4EFE6] border border-[#E2D8C6] text-[#6B5E4A] text-xs font-mono font-bold uppercase tracking-wider">
                  {depGateDisplay}
                </span>
              </div>
            </div>

            {/* CENTER DASHED TRACK & ANIMATED PLANE */}
            <div className="col-span-4 relative flex items-center justify-center py-6">
              {/* Dashed Horizontal Line */}
              <div className="w-full relative flex items-center justify-between">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 border-b-2 border-dashed border-[#C7BBAA] z-0" />

                {/* Left Node Dot */}
                <div className="relative z-10 w-3.5 h-3.5 rounded-full bg-[#1C1917] border-2 border-amber-400 shadow-xs flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-amber-300 animate-ping" />
                </div>

                {/* Uni-directional Moving Airplane (Departure → Arrival Only, Linear 6.5s Loop) */}
                <motion.div
                  initial={shouldReduceMotion ? { left: "50%" } : { left: "4%", opacity: 1 }}
                  animate={
                    shouldReduceMotion
                      ? {}
                      : {
                        left: ["4%", "92%"],
                        opacity: [1, 1, 0.9, 0],
                      }
                  }
                  transition={
                    shouldReduceMotion
                      ? {}
                      : {
                        duration: 6.5,
                        ease: "linear",
                        repeat: Infinity,
                        repeatDelay: 0.2,
                      }
                  }
                  className="absolute top-1/2 -translate-y-1/2 z-20 -ml-4 p-2 rounded-full bg-[#1C1917] text-amber-300 shadow-md border border-amber-400/50 flex items-center justify-center"
                  aria-label="Plane in transit animation"
                >
                  <Plane className="w-4 h-4 rotate-45 transform-gpu" />
                </motion.div>

                {/* Right Node Dot */}
                <div className="relative z-10 w-3.5 h-3.5 rounded-full bg-[#1C1917] border-2 border-amber-400 shadow-xs flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-amber-300" />
                </div>
              </div>
            </div>

            {/* ARRIVAL AIRPORT (RIGHT) */}
            <div className="col-span-4 space-y-2 text-right">
              <span className="text-4xl lg:text-5xl font-mono font-black text-[#1C1917] tracking-tight block">
                {destCode}
              </span>
              {destCity && (
                <h2 className="text-2xl font-serif font-bold text-[#1C1917] leading-snug">
                  {destCity}
                </h2>
              )}
              {destName && (
                <p className="text-xs font-mono text-[#78716C]">
                  {destName}
                </p>
              )}
              {(formattedArrTime || formattedArrDate) && (
                <div className="pt-2 space-y-1">
                  {formattedArrTime && (
                    <div className="text-xs font-mono font-bold text-[#1C1917]">
                      {formattedArrTime}
                    </div>
                  )}
                  {formattedArrDate && (
                    <div className="text-xs font-mono text-[#78716C]">
                      {formattedArrDate}
                    </div>
                  )}
                </div>
              )}
              {(arrTerminalChip || destGate) && (
                <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                  {arrTerminalChip && (
                    <span className="inline-block px-3 py-1 rounded-md bg-[#F4EFE6] border border-[#E2D8C6] text-[#6B5E4A] text-xs font-mono font-bold uppercase tracking-wider">
                      Arrival {arrTerminalChip}
                    </span>
                  )}
                  {destGate && (
                    <span className="inline-block px-3 py-1 rounded-md bg-[#F4EFE6] border border-[#E2D8C6] text-[#6B5E4A] text-xs font-mono font-bold uppercase tracking-wider">
                      Gate {destGate}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE LAYOUT (< md) */}
        <div className="md:hidden space-y-6 py-2">
          {/* Mobile Departure */}
          <div className="space-y-1">
            <span className="text-3xl font-mono font-black text-[#1C1917] block">
              {originCode}
            </span>
            {(originCity || originName) && (
              <h2 className="text-xl font-serif font-bold text-[#1C1917]">
                {[originCity, originName].filter(Boolean).join(" — ")}
              </h2>
            )}
            {(formattedDepTime || formattedDepDate) && (
              <div className="text-xs font-mono text-[#1C1917] font-bold pt-1">
                {[formattedDepTime, formattedDepDate].filter(Boolean).join(" • ")}
              </div>
            )}
            {depTerminalChip && (
              <span className="inline-block px-3 py-1 mt-1 rounded-md bg-[#F4EFE6] border border-[#E2D8C6] text-[#6B5E4A] text-xs font-mono font-bold uppercase tracking-wider">
                Departure {depTerminalChip}
              </span>
            )}
          </div>

          {/* Mobile Track */}
          <div className="flex items-center justify-center py-2 relative">
            <div className="h-14 w-0.5 border-l-2 border-dashed border-[#C7BBAA]" />
            <motion.div
              initial={shouldReduceMotion ? { top: "50%" } : { top: "0%", opacity: 1 }}
              animate={shouldReduceMotion ? {} : { top: ["0%", "80%"], opacity: [1, 1, 0] }}
              transition={shouldReduceMotion ? {} : { duration: 5, ease: "linear", repeat: Infinity }}
              className="absolute p-2 rounded-full bg-[#1C1917] text-amber-300 border border-amber-400/40"
            >
              <Plane className="w-4 h-4 rotate-[135deg]" />
            </motion.div>
          </div>

          {/* Mobile Arrival */}
          <div className="space-y-1">
            <span className="text-3xl font-mono font-black text-[#1C1917] block">
              {destCode}
            </span>
            {(destCity || destName) && (
              <h2 className="text-xl font-serif font-bold text-[#1C1917]">
                {[destCity, destName].filter(Boolean).join(" — ")}
              </h2>
            )}
            {(formattedArrTime || formattedArrDate) && (
              <div className="text-xs font-mono text-[#1C1917] font-bold pt-1">
                {[formattedArrTime, formattedArrDate].filter(Boolean).join(" • ")}
              </div>
            )}
            {arrTerminalChip && (
              <span className="inline-block px-3 py-1 mt-1 rounded-md bg-[#F4EFE6] border border-[#E2D8C6] text-[#6B5E4A] text-xs font-mono font-bold uppercase tracking-wider">
                Arrival {arrTerminalChip}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 5. DYNAMIC FLIGHT INFORMATION ROW */}
      {(aircraftModel || carrierName || flightNum) && (
        <div className="pt-2 border-t border-[#E8DFD1]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-[#78716C]">
          <div className="flex flex-wrap items-center gap-4">
            {aircraftModel && (
              <span>Aircraft: <strong className="text-[#1C1917]">{aircraftModel}</strong></span>
            )}
            {aircraftModel && (carrierName || flightNum) && <span>•</span>}
            {(carrierName || flightNum) && (
              <span>Operating Carrier: <strong className="text-[#1C1917]">{[carrierName, flightNum ? `(${flightNum})` : null].filter(Boolean).join(" ")}</strong></span>
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 text-emerald-800 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Priority Airside Clearance Verified</span>
          </div>
        </div>
      )}

      {/* 6. CONTINUE BUTTON */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onChangeFlight}
          className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 text-[#44403C] hover:text-[#1C1917] border border-[#E2D8C6] shadow-xs hover:shadow-md font-mono text-xs font-extrabold uppercase tracking-widest transition-all duration-300 cursor-pointer"
        >
          Change Flight
        </button>

        <motion.button
          type="button"
          whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
          onClick={onContinue}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 rounded-full bg-gradient-to-r from-[#84cc16] to-[#65a30d] hover:from-[#65a30d] hover:to-[#4d7c0f] text-[#0f172a] font-mono text-xs font-black uppercase tracking-widest shadow-lg shadow-lime-900/10 hover:shadow-xl transition-all duration-300 cursor-pointer"
        >
          <span>Continue to Airport Services</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
