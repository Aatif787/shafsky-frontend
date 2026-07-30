import React from "react";
import { Plane, Sparkles, Compass } from "lucide-react";

interface AirportPhase1HeaderProps {
  airportName?: string;
  airportCode?: string;
  direction: "arrival" | "departure" | "transit";
  onDirectionChange: (dir: "arrival" | "departure" | "transit") => void;
  bookingMode?: "individual" | "package";
  onBookingModeChange?: (mode: "individual" | "package") => void;
  selectedTitle?: string;
}

export function AirportPhase1Header({
  airportName = "Delhi Indira Gandhi International Airport",
  airportCode = "DEL",
  direction,
  onDirectionChange,
  bookingMode = "individual",
  selectedTitle,
}: AirportPhase1HeaderProps) {
  return (
    <div className="space-y-6 pb-6 border-b border-slate-100">
      {/* 1. COMPACT PRE-SELECTED AIRPORT BADGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-slate-900 text-white shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold font-serif text-lg shrink-0">
            {airportCode}
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pre-Selected Airport Context</span>
            </span>
            <h3 className="text-base sm:text-lg font-serif font-bold text-white leading-snug">
              {airportName}
            </h3>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-mono text-slate-300 font-medium">
          <Plane className="w-3.5 h-3.5 text-emerald-400" />
          <span>Airside Hub Verified</span>
        </div>
      </div>

      {/* 2. DIRECTION TOGGLE & INHERITED SELECTION SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Direction Toggle */}
        <div className="p-1.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-1">
          {[
            { id: "arrival", label: "Arrival" },
            { id: "departure", label: "Departure" },
            { id: "transit", label: "Transit" },
          ].map((dir) => (
            <button
              key={dir.id}
              type="button"
              onClick={() => onDirectionChange(dir.id as any)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
                direction === dir.id
                  ? "bg-white text-emerald-800 shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {dir.label}
            </button>
          ))}
        </div>

        {/* Inherited Selection Summary Badge */}
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-emerald-900 uppercase tracking-wide">
              {bookingMode === "package" ? "VIP Package Selected" : "Individual Service Selected"}
            </span>
          </div>
          {selectedTitle && (
            <span className="text-xs font-serif font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200/80 shadow-2xs">
              {selectedTitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
