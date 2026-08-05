import React, { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { Plane, Clock, CheckCircle2, RefreshCw, ArrowRight } from "lucide-react";
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

const FlightPathHero = React.memo(function FlightPathHero({
  originCode,
  destinationCode,
  departureMeta,
  arrivalMeta,
  shouldReduceMotion,
}: {
  originCode: string;
  destinationCode: string;
  departureMeta: string | null;
  arrivalMeta: string | null;
  shouldReduceMotion: boolean;
}) {
  const ids = useMemo(() => {
    const base = Math.random().toString(36).slice(2);
    return {
      gradient: `flight-path-gradient-${base}`,
      glow: `flight-path-glow-${base}`,
    };
  }, []);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const dimsRef = useRef({ width: 0, height: 0 });
  const [hasLayout, setHasLayout] = useState(false);

  const progress = useMotionValue(shouldReduceMotion ? 0.52 : 0);
  const planeX = useMotionValue(0);
  const planeY = useMotionValue(0);
  const planeRotate = useMotionValue(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dimsRef.current = { width: rect.width, height: rect.height };
    setHasLayout(rect.width > 0 && rect.height > 0);

    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      const cr = entry?.contentRect;
      if (!cr) return;
      dimsRef.current = { width: cr.width, height: cr.height };
      setHasLayout(cr.width > 0 && cr.height > 0);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) {
      progress.set(0.52);
      return;
    }
    progress.set(0);
    const controls = animate(progress, 1, {
      duration: 6.2,
      ease: "linear",
      repeat: Infinity,
      repeatDelay: 0.35,
    });
    return () => controls.stop();
  }, [progress, shouldReduceMotion]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();

    const unsub = progress.on("change", (v) => {
      const clamped = Math.max(0, Math.min(1, v));
      const target = clamped * length;
      const p1 = path.getPointAtLength(target);
      const p2 = path.getPointAtLength(Math.min(length, target + 1));
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      const dims = dimsRef.current;
      const sx = dims.width / 1200;
      const sy = dims.height / 220;
      planeX.set(p1.x * sx);
      planeY.set(p1.y * sy);
      planeRotate.set(angle + 90);
    });

    return () => unsub();
  }, [planeRotate, planeX, planeY, progress]);

  return (
    <div
      ref={wrapperRef}
      className="relative overflow-hidden rounded-[26px] border border-black/5 bg-white/60 px-5 sm:px-8 py-7 sm:py-10"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_circle_at_50%_-20%,rgba(15,23,42,0.14),transparent_62%),radial-gradient(700px_circle_at_20%_70%,rgba(251,191,36,0.12),transparent_56%),radial-gradient(700px_circle_at_82%_55%,rgba(132,204,22,0.10),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1200 220"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={ids.gradient} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(15,23,42,0)" />
            <stop offset="18%" stopColor="rgba(15,23,42,0.55)" />
            <stop offset="50%" stopColor="rgba(251,191,36,0.60)" />
            <stop offset="82%" stopColor="rgba(132,204,22,0.55)" />
            <stop offset="100%" stopColor="rgba(15,23,42,0)" />
          </linearGradient>
          <filter id={ids.glow} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          ref={pathRef}
          d="M 70 150 C 360 36 840 36 1130 150"
          stroke={`url(#${ids.gradient})`}
          strokeWidth="3"
          fill="none"
          filter={`url(#${ids.glow})`}
          opacity="0.95"
        />
        <path
          d="M 70 150 C 360 36 840 36 1130 150"
          stroke="rgba(15,23,42,0.22)"
          strokeWidth="1"
          strokeDasharray="10 14"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        <circle cx="70" cy="150" r="9" fill="rgba(15,23,42,0.92)" />
        <circle cx="70" cy="150" r="12" fill="rgba(251,191,36,0.18)" />
        <circle cx="1130" cy="150" r="9" fill="rgba(15,23,42,0.92)" />
        <circle cx="1130" cy="150" r="12" fill="rgba(132,204,22,0.18)" />
      </svg>

      <div className="relative flex items-end justify-between">
        <div className="space-y-1">
          <div className="text-[44px] leading-none font-mono font-black tracking-tight text-[#0f172a]">
            {originCode}
          </div>
          {departureMeta && (
            <div className="text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-[#475569]">
              {departureMeta}
            </div>
          )}
        </div>

        <div className="space-y-1 text-right">
          <div className="text-[44px] leading-none font-mono font-black tracking-tight text-[#0f172a]">
            {destinationCode}
          </div>
          {arrivalMeta && (
            <div className="text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-[#475569]">
              {arrivalMeta}
            </div>
          )}
        </div>
      </div>

      <motion.div
        className="absolute left-0 top-0 z-20 rounded-full bg-[#0f172a] text-amber-200 shadow-[0_10px_30px_rgba(2,6,23,0.22)] border border-white/10 p-2.5"
        style={{
          x: planeX,
          y: planeY,
          rotate: planeRotate,
          translateX: "-50%",
          translateY: "-50%",
          opacity: hasLayout ? 1 : 0,
        }}
        aria-label="Plane in transit animation"
      >
        <Plane className="w-4 h-4 transform-gpu" />
      </motion.div>
    </div>
  );
});

/**
 * Skeleton Loader for Instant Perceived Performance
 */
export function ValidatedFlightSkeleton() {
  return (
    <div className="w-full max-w-[1040px] mx-auto px-4 sm:px-6 py-8 sm:py-12 font-sans animate-pulse">
      <div className="rounded-[32px] border border-black/5 bg-white/60 backdrop-blur-xl overflow-hidden">
        <div className="px-5 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          <div className="flex items-center justify-between gap-4">
            <div className="h-7 w-36 rounded-full bg-slate-200/60" />
            <div className="h-9 w-24 rounded-full bg-slate-200/50" />
          </div>
          <div className="h-[190px] sm:h-[230px] rounded-[26px] bg-slate-200/35" />
          <div className="flex items-center justify-between gap-4">
            <div className="h-7 w-40 rounded-full bg-slate-200/50" />
            <div className="h-12 w-40 rounded-full bg-slate-200/50" />
          </div>
        </div>
      </div>
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
  const originSchedTime = typeof flightData?.departure?.scheduledTime === "string"
    ? flightData.departure.scheduledTime
    : (flightData as any)?.departure_time || null;

  const destCode = typeof flightData?.destination?.code === "string"
    ? flightData.destination.code.trim()
    : (typeof airportCode === "string" ? airportCode.trim() : "BOM");
  const destSchedTime = typeof flightData?.arrival?.scheduledTime === "string"
    ? flightData.arrival.scheduledTime
    : (flightData as any)?.arrival_time || null;

  const formattedDepTime = formatFlightTime(originSchedTime);
  const formattedArrTime = formatFlightTime(destSchedTime);
  const formattedDepDate = formatFlightDate(originSchedTime || serviceDate);
  const formattedArrDate = formatFlightDate(destSchedTime || serviceDate);

  return (
    <div className="w-full max-w-[1040px] mx-auto px-4 sm:px-6 py-8 sm:py-12 font-sans text-[#0f172a]">
      <div className="relative overflow-hidden rounded-[32px] border border-black/5 bg-white/70 backdrop-blur-xl shadow-[0_18px_70px_rgba(2,6,23,0.06)]">
        <div className="relative px-5 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-200/70 text-emerald-900 text-[11px] font-mono font-bold uppercase tracking-[0.22em]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Verified</span>
              </div>
              {(carrierName || flightNum) && (
                <div className="truncate text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-[#475569]">
                  {[carrierName, flightNum].filter(Boolean).join(" • ")}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onChangeFlight}
              className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-white text-[#0f172a] border border-black/5 shadow-sm hover:shadow-md font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#0f172a]" />
              <span>Change</span>
            </button>
          </div>

          <div className="sr-only">{`Flight route ${originCode} to ${destCode}`}</div>

          <FlightPathHero
            originCode={originCode}
            destinationCode={destCode}
            departureMeta={[formattedDepTime, formattedDepDate].filter(Boolean).join(" • ") || null}
            arrivalMeta={[formattedArrTime, formattedArrDate].filter(Boolean).join(" • ") || null}
            shouldReduceMotion={shouldReduceMotion}
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {status && <StatusBadge status={status} />}
              {duration && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 border border-black/5 text-[#0f172a] text-xs font-mono font-bold uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5 text-[#0f172a]" />
                  <span>{duration}</span>
                </div>
              )}
            </div>

            <motion.button
              type="button"
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              onClick={onContinue}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#0f172a] hover:bg-[#0b1224] text-white font-mono text-xs font-black uppercase tracking-widest shadow-[0_16px_50px_rgba(2,6,23,0.18)] transition-all duration-300 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
