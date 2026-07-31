import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Crown,
} from "lucide-react";
import { AIRPORTS } from "@/data/airports";
import { getAirportAsset } from "@/lib/airport-assets";

export function AirportShowcase() {
  const allAirports = AIRPORTS;
  const total = allAirports.length;
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#FAF9F5] py-16 sm:py-24 select-none border-y border-slate-200/80">
      {/* SECTION HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-[#7c3aed] text-[10px] font-mono font-bold uppercase tracking-widest mb-3">
          <Crown className="w-3.5 h-3.5" />
          <span>Curated Global Concierge Hubs</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-slate-900 font-bold tracking-tight">
          Featured Aviation <span className="italic text-[#7c3aed]">Destinations</span>
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-slate-600 font-sans max-w-xl mx-auto">
          Explore signature airport sanctuaries arranged across our international VVIP service arc.
        </p>
      </div>

      {/* CURVED STAGE CONTAINER (DESKTOP) & HORIZONTAL SNAP SCROLL (MOBILE) */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SVG BACKGROUND ARC GUIDELINE (DESKTOP ONLY) */}
        <div className="hidden lg:block absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none z-0">
          <svg className="w-full h-40 overflow-visible" viewBox="0 0 1000 160">
            <path
              d="M 50 140 Q 500 10 950 140"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="2"
              strokeDasharray="6 6"
              className="opacity-25"
            />
          </svg>
        </div>

        {/* NAVIGATION CHEVRON BUTTONS */}
        <div className="flex items-center justify-between absolute inset-x-2 sm:inset-x-6 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <button
            onClick={handlePrev}
            aria-label="Previous featured airport"
            className="pointer-events-auto w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-800 flex items-center justify-center shadow-md hover:bg-slate-50 hover:text-[#7c3aed] hover:border-[#7c3aed]/40 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next featured airport"
            className="pointer-events-auto w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-800 flex items-center justify-center shadow-md hover:bg-slate-50 hover:text-[#7c3aed] hover:border-[#7c3aed]/40 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* DESKTOP CURVED ALIGNMENT STAGE (lg+) */}
        <div className="hidden lg:flex relative h-[380px] items-center justify-center z-10">
          {allAirports.map((airport, index) => {
            // Shortest signed modular distance from activeIndex
            let diff = index - activeIndex;
            if (diff > total / 2) diff -= total;
            if (diff < -total / 2) diff += total;

            const absDiff = Math.abs(diff);

            // Hide cards beyond visible arc window
            if (absDiff > 3) return null;

            // Parabolic curve vertical offset: y = a * diff^2
            const translateY = Math.pow(diff, 2) * 18;
            // Subtle rotation tilt along the arc path tangent
            const rotateZ = diff * 3.5;
            // Horizontal position offset centered at 0
            const translateX = diff * 215;
            // Scale center card prominent
            const scale = diff === 0 ? 1.06 : Math.max(0.78, 1 - absDiff * 0.09);
            // Opacity decay for far elements
            const opacity = absDiff > 2 ? (absDiff === 3 ? 0.25 : 0) : Math.max(0.4, 1 - absDiff * 0.2);
            const isCenter = diff === 0;

            const cardImage = getAirportAsset(airport.code, "hero-mobile.webp") || airport.mobCover || airport.cover;

            return (
              <motion.div
                key={airport.code}
                onClick={() => setActiveIndex(index)}
                animate={{
                  x: translateX,
                  y: translateY,
                  rotateZ: rotateZ,
                  scale: scale,
                  opacity: opacity,
                }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: "absolute",
                  zIndex: 20 - absDiff,
                }}
                className={`w-[260px] rounded-3xl bg-white border transition-all duration-300 cursor-pointer overflow-hidden ${
                  isCenter
                    ? "border-2 border-[#7c3aed] shadow-xl shadow-[#7c3aed]/15 ring-4 ring-[#7c3aed]/10"
                    : "border-slate-200/90 shadow-sm hover:border-slate-300"
                }`}
              >
                <Link to="/airports/$code" params={{ code: airport.code }} className="block p-3">
                  {/* Thumbnail Image */}
                  <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={cardImage}
                      alt={airport.city}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#7c3aed] text-white font-mono text-[10px] font-bold tracking-widest shadow-xs">
                        {airport.code}
                      </span>
                    </div>

                    {isCenter && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#84cc16] text-[#0f172a] font-mono text-[9px] font-bold uppercase tracking-wider shadow-xs">
                        ✦ Selected Hub
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="pt-3 pb-1 px-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-serif font-bold text-slate-900 truncate">
                        {airport.city}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">
                        {airport.countryCode}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-sans truncate mt-0.5">
                      {airport.airport?.name || airport.country}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                      <span className="text-[11px] text-slate-500 font-medium">
                        4 Airside Services
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-[#7c3aed]">
                        <span>Explore</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* MOBILE & TABLET HORIZONTAL SNAP SCROLL (< lg) */}
        <div className="lg:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 py-4 px-2">
          {allAirports.map((airport, index) => {
            const isSelected = index === activeIndex;
            const cardImage = getAirportAsset(airport.code, "hero-mobile.webp") || airport.mobCover || airport.cover;

            return (
              <div
                key={airport.code}
                onClick={() => setActiveIndex(index)}
                className={`snap-center shrink-0 w-[240px] rounded-2xl bg-white border p-3 transition-all ${
                  isSelected ? "border-2 border-[#7c3aed] shadow-md" : "border-slate-200 shadow-xs"
                }`}
              >
                <Link to="/airports/$code" params={{ code: airport.code }} className="block">
                  <div className="relative h-32 w-full rounded-xl overflow-hidden bg-slate-100">
                    <img src={cardImage} alt={airport.city} className="h-full w-full object-cover" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#7c3aed] text-white font-mono text-[10px] font-bold">
                      {airport.code}
                    </span>
                  </div>
                  <div className="pt-2.5">
                    <h3 className="text-base font-serif font-bold text-slate-900">{airport.city}</h3>
                    <p className="text-xs text-slate-500 truncate">{airport.airport?.name}</p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* INDICATOR DOTS */}
        <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap max-w-md mx-auto">
          {allAirports.map((airport, idx) => (
            <button
              key={`dot-${airport.code}`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Go to ${airport.city}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeIndex ? "w-8 bg-[#7c3aed]" : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
