import React from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
  Compass,
  Building2,
  Headphones,
  Search,
  CheckCircle2,
  Plane,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { AIRPORTS, getAirport, type Airport } from "@/data/airports";

/* ─────────────────────────────────────────────────────────────────────────────
 * 1. LUXURY ANIMATED SHIMMER SKELETON LOADERS
 * ─────────────────────────────────────────────────────────────────────────── */
interface LuxurySkeletonProps {
  variant?: "card" | "text" | "hero" | "table" | "circle";
  count?: number;
  className?: string;
}

export function LuxurySkeleton({
  variant = "card",
  count = 1,
  className = "",
}: LuxurySkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === "text") {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="animate-shimmer h-4 rounded-xl bg-white/10 border border-white/5"
            style={{ width: `${85 - i * 15}%` }}
          />
        ))}
      </div>
    );
  }

  if (variant === "circle") {
    return (
      <div className={`flex gap-3 ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="animate-shimmer w-12 h-12 rounded-full bg-white/10 border border-white/5"
          />
        ))}
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div
        className={`animate-shimmer h-[70vh] w-full rounded-[36px] bg-[#0c131e] border border-white/10 p-10 flex flex-col justify-end space-y-4 ${className}`}
      >
        <div className="h-6 w-36 rounded-full bg-white/10" />
        <div className="h-12 w-2/3 rounded-2xl bg-white/15" />
        <div className="h-4 w-1/2 rounded-xl bg-white/10" />
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {items.map((_, i) => (
        <div
          key={i}
          className="animate-shimmer h-72 rounded-3xl bg-[#0c131e] border border-white/10 p-6 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="h-8 w-8 rounded-xl bg-white/10" />
            <div className="h-6 w-3/4 rounded-xl bg-white/15" />
            <div className="h-4 w-full rounded-lg bg-white/10" />
          </div>
          <div className="h-10 w-full rounded-2xl bg-white/10" />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 2. NO SERVICES AVAILABLE EMPTY STATE
 * ─────────────────────────────────────────────────────────────────────────── */
interface NoServicesStateProps {
  title?: string;
  message?: string;
  locationName?: string;
  onContactClick?: () => void;
}

export function NoServicesState({
  title = "Bespoke Airside Staging Available",
  message = "Standard automated packages for this hub are undergoing seasonal updates. Our 24/7 command desk can stage bespoke guest handling, tarmac limousines, and fast-track escorts immediately.",
  locationName = "Selected Location",
  onContactClick,
}: NoServicesStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 sm:p-12 rounded-[36px] bg-gradient-to-br from-[#0d1622] via-[#09101a] to-[#05080f] border border-[#c5a059]/40 shadow-2xl text-center max-w-2xl mx-auto my-10 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Gold Icon Illustration Aura */}
      <div className="relative z-10 w-16 h-16 rounded-3xl bg-[#c5a059]/15 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] mx-auto mb-6 shadow-xl shadow-[#c5a059]/10">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>

      <span className="relative z-10 px-3.5 py-1 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#c5a059] text-[10px] font-mono uppercase tracking-[0.3em]">
        Custom Staging Staged
      </span>

      <h3
        className="relative z-10 mt-4 text-2xl sm:text-3xl font-serif text-white font-light"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        {title}
      </h3>

      <p className="relative z-10 mt-3 text-xs sm:text-sm text-white/70 leading-relaxed font-sans max-w-lg mx-auto">
        {message}
      </p>

      {/* Recommended Alternative CTAs */}
      <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4">
        <a
          href="tel:+919599087959"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#c5a059] to-[#d4c09d] text-[#081119] font-mono text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:scale-105 transition-all"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call 24/7 Desk (+91 9599087959)</span>
        </a>

        <Link
          to="/book"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white font-mono text-xs font-semibold uppercase tracking-[0.2em] hover:bg-white/20 transition-all"
        >
          <span>Request Custom Booking</span>
          <ArrowRight className="w-4 h-4 text-[#c5a059]" />
        </Link>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 3. FLIGHT NOT FOUND / RADAR LOOKUP FALLBACK STATE (NEVER SHOW RAW ERROR)
 * ─────────────────────────────────────────────────────────────────────────── */
interface FlightNotFoundStateProps {
  flightNumber?: string;
  onContinueManual: () => void;
}

export function FlightNotFoundState({
  flightNumber,
  onContinueManual,
}: FlightNotFoundStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-7 rounded-3xl bg-[#0e1624]/90 border border-[#c5a059]/40 text-left my-6 relative overflow-hidden shadow-2xl"
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-[#c5a059]/15 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] shrink-0 mt-0.5">
          <Plane className="w-5.5 h-5.5" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#c5a059] font-bold">
              Radar Auto-Detect Pending
            </span>
            <span className="text-[9px] font-mono text-white/50 px-2 py-0.5 rounded bg-white/5">
              Flight: {flightNumber || "Submitted"}
            </span>
          </div>

          <h4
            className="text-lg font-serif text-white font-medium mt-1"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Flight radar auto-detect pending for {flightNumber || "this flight"}.
          </h4>

          <p className="mt-1.5 text-xs text-white/70 leading-relaxed font-sans">
            Our live telemetry radar is fetching schedule updates. You can seamlessly continue your reservation manually with zero delay — our 24/7 command desk will confirm flight telemetry before staging.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button
              onClick={onContinueManual}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#d4c09d] text-[#081119] font-mono text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all"
            >
              <span>Continue Manually</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 4. NO PACKAGE AVAILABLE STATE
 * ─────────────────────────────────────────────────────────────────────────── */
export function NoPackagesState({ onSelectDirectService }: { onSelectDirectService?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-3xl bg-[#0e1624] border border-white/10 text-center my-6 shadow-xl"
    >
      <ShieldCheck className="w-10 h-10 text-[#c5a059] mx-auto mb-3 opacity-80" />
      <h4
        className="text-xl font-serif text-white font-medium"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        Direct Concierge Reservation
      </h4>
      <p className="mt-2 text-xs text-white/65 max-w-md mx-auto leading-relaxed">
        Pre-bundled multi-tier packages for this specific selection are undergoing seasonal updates. You can reserve direct airside concierge options below or request a custom package.
      </p>

      {onSelectDirectService && (
        <button
          onClick={onSelectDirectService}
          type="button"
          className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-mono text-xs uppercase tracking-wider hover:bg-white/20 transition-all"
        >
          <span>View Available Direct Services</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#c5a059]" />
        </button>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 5. NEAREST AIRPORT SUGGESTION (FOR UNMATCHED LOOKUPS)
 * ─────────────────────────────────────────────────────────────────────────── */
const MAJOR_HUB_CODES = ["DEL", "BOM", "BLR", "HYD", "MAA", "CCU", "DXB", "LHR"];

interface NearestAirportSuggestionProps {
  searchQuery: string;
  onSelectAirport?: (code: string) => void;
}

export function NearestAirportSuggestion({
  searchQuery,
  onSelectAirport,
}: NearestAirportSuggestionProps) {
  const suggestedAirports = MAJOR_HUB_CODES.map((code) => getAirport(code)).filter(
    (a): a is Airport => !!a
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-[36px] bg-[#0a1019] border border-[#c5a059]/30 text-left my-8 shadow-2xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#c5a059]">
            <Search className="w-3.5 h-3.5" />
            <span>Intelligent Hub Matcher</span>
          </div>
          <h3
            className="mt-1 text-2xl font-serif text-white font-light"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            No exact code for "{searchQuery}". Suggested flagship hubs:
          </h3>
          <p className="mt-1 text-xs text-white/60 font-sans">
            Showing nearest major international hubs with 24/7 airside host staging and tarmac Maybach transfers.
          </p>
        </div>
      </div>

      {/* SUGGESTED AIRPORT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {suggestedAirports.slice(0, 4).map((a) => (
          <div
            key={a.code}
            onClick={() => onSelectAirport?.(a.code)}
            className="group p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#c5a059] cursor-pointer transition-all duration-300 shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#c5a059] text-[#081119] text-[10px] font-mono font-bold">
                {a.code}
              </span>
              <span className="text-[9px] font-mono text-white/50">{a.icao}</span>
            </div>
            <div className="text-sm font-serif font-medium text-white group-hover:text-[#c5a059] transition-colors truncate">
              {a.city}
            </div>
            <div className="text-[10px] text-white/50 font-sans truncate mt-0.5">
              {a.airport?.name || a.country}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
