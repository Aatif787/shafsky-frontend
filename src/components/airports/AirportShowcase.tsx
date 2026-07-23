import { useRef, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowUpRight,
  Plane,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  X,
} from "lucide-react";
import { AIRPORTS, Airport } from "@/data/airports";
import { display, mono } from "./Atoms";
import { getAirportAsset } from "@/lib/airport-assets";

export function AirportShowcase() {
  // Use ALL airports available in the website dataset
  const showcaseAirports = AIRPORTS;
  const N = showcaseAirports.length;

  // Find index of DEL (Delhi) as default center card
  const initialIndex =
    showcaseAirports.findIndex((a) => a.code === "DEL") !== -1
      ? showcaseAirports.findIndex((a) => a.code === "DEL")
      : Math.floor(N / 2);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [showConcierge, setShowConcierge] = useState(true);

  // Continuous motion value for infinite 360-degree cycle
  const indexMotion = useMotionValue(initialIndex);
  const smoothIndex = useSpring(indexMotion, { stiffness: 110, damping: 20 });

  // Update motion value on activeIndex change
  useEffect(() => {
    indexMotion.set(activeIndex);
  }, [activeIndex, indexMotion]);

  // Infinite continuous keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveIndex((prev) => prev - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setActiveIndex((prev) => prev + 1);
    }
  };

  // Drag interaction with infinite continuous scrolling
  const dragRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startIndexRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startIndexRef.current = activeIndex;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    // Map drag distance (in px) to continuous index shift
    const indexShift = -deltaX / 160;
    const newIndex = startIndexRef.current + indexShift;
    indexMotion.set(newIndex);
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const currentVal = indexMotion.get();
    const rounded = Math.round(currentVal);
    setActiveIndex(rounded);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].clientX;
    startIndexRef.current = activeIndex;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    const indexShift = -deltaX / 140;
    const newIndex = startIndexRef.current + indexShift;
    indexMotion.set(newIndex);
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const currentVal = indexMotion.get();
    const rounded = Math.round(currentVal);
    setActiveIndex(rounded);
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#FAF5EB] py-14 select-none">
      {/* Main Cover Flow Stage */}
      <div
        ref={dragRef}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        tabIndex={0}
        className="relative w-full h-[580px] flex items-center justify-center focus:outline-none cursor-grab active:cursor-grabbing"
        style={{ perspective: "1600px", transformStyle: "preserve-3d" }}
      >
        {/* Navigation Chevron Left */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveIndex((prev) => prev - 1);
          }}
          aria-label="Previous destination"
          className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-[#182025]/90 border border-white/15 text-white flex items-center justify-center shadow-2xl backdrop-blur-md hover:bg-[#202B32] hover:scale-105 active:scale-95 transition-all"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Navigation Chevron Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveIndex((prev) => prev + 1);
          }}
          aria-label="Next destination"
          className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-[#182025]/90 border border-white/15 text-white flex items-center justify-center shadow-2xl backdrop-blur-md hover:bg-[#202B32] hover:scale-105 active:scale-95 transition-all"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Render All Airport Cards in Infinite 3D 360 Loop */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {showcaseAirports.map((a, i) => {
            return (
              <CoverFlowCard
                key={a.code}
                a={a}
                index={i}
                total={N}
                smoothIndex={smoothIndex}
                onClick={() => setActiveIndex(i)}
              />
            );
          })}
        </div>
      </div>

      {/* Subtext below carousel */}
      <div
        className="mt-6 flex flex-col items-center gap-1 text-center text-[#58646E] select-none"
        style={mono}
      >
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em]">
          DRAG / SWIPE OR ARROW KEYS TO SCROLL
        </div>
        <div className="text-[9px] uppercase tracking-[0.22em] opacity-70">
          ∞ INFINITE 360° LOOP · {N} INDIAN DESTINATIONS
        </div>
      </div>

      {/* Suswagatam Concierge Widget (Bottom Right) */}
      {showConcierge && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 rounded-[20px] border border-white/15 bg-[#121A1F]/95 p-4 pr-10 shadow-2xl backdrop-blur-xl max-w-[340px] text-white"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2BB3A3] shadow-[0_0_12px_rgba(43,179,163,0.5)]">
            <MessageSquare className="h-5 w-5 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-[#2BB3A3] tracking-wide">
              Suswagatam Concierge
            </div>
            <div className="mt-0.5 text-[11px] leading-snug text-white/80">
              Need slot check or quick booking assistance? Chat with us now.
            </div>
          </div>
          <button
            onClick={() => setShowConcierge(false)}
            className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
            aria-label="Close widget"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}

function CoverFlowCard({
  a,
  index,
  total,
  smoothIndex,
  onClick,
}: {
  a: Airport;
  index: number;
  total: number;
  smoothIndex: any;
  onClick: () => void;
}) {
  // Direct motion transforms for seamless infinite 360-degree cylindrical arc
  const transform = useTransform(smoothIndex, (latestVal: number) => {
    let diff = (index - (latestVal % total) + total) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    // Smooth progressive 360 cylindrical arc rotation & 3D depth
    const rotateY = -diff * 24; // Left cards face right (+), Right cards face left (-)
    const x = diff * 155; // Smooth continuous horizontal stepping
    const z = -Math.pow(Math.abs(diff), 1.2) * 50; // Smooth 3D depth curvature into background
    const scale = Math.max(0.68, 1.15 / (1 + Math.abs(diff) * 0.1));

    return `translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg) scale(${scale})`;
  });

  const zIndex = useTransform(smoothIndex, (latestVal: number) => {
    let diff = (index - (latestVal % total) + total) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return Math.round(100 - Math.abs(diff) * 10);
  });

  const opacity = useTransform(smoothIndex, (latestVal: number) => {
    let diff = (index - (latestVal % total) + total) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    const absDiff = Math.abs(diff);
    // Hide far offscreen cards beyond 3.5 positions to keep 360 clean & fast
    if (absDiff > 3.5) return 0;
    return Math.max(0.35, 1 - absDiff * 0.18);
  });

  const cleanTerminal = a.airport.terminals
    ? `Terminal ${a.airport.terminals.split(" ")[0].replace(/[^0-9]/g, "") || "1"}`
    : "Terminal 1";

  const statusText =
    a.code === "DEL"
      ? "ACTIVE DISPATCH"
      : a.code === "BOM"
        ? "24/7 OPERATIONS"
        : "LIVE OPERATIONS";

  return (
    <motion.div
      onClick={onClick}
      suppressHydrationWarning
      style={{
        position: "absolute",
        transform,
        zIndex,
        opacity,
        transformStyle: "preserve-3d",
      }}
      className="w-[320px] h-[520px] shrink-0 rounded-[28px] bg-[#141C21] border border-white/12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden cursor-pointer group transition-shadow duration-300"
    >
      <Link to="/airports/$code" params={{ code: a.code }} className="relative block h-full w-full">
        {/* Top Half Image Container */}
        <div className="relative h-[235px] w-full overflow-hidden">
          <img
            src={getAirportAsset(a.code, "hero-mobile.webp") || a.mobCover || a.cover}
            alt={`${a.city} — ${a.landmark}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-108"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141C21] via-transparent to-black/40" />

          {/* Top Pill Badges Row */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 z-10">
            {/* Code Badge Pill */}
            <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-[#182127]/80 px-3 py-1 backdrop-blur-md">
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold tracking-widest text-white">
                {a.code}
              </span>
              <span className="text-[10px] font-bold tracking-wider text-white/80 font-mono">
                {a.icao}
              </span>
            </div>

            {/* Flight Circle Icon Button */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#182127]/80 text-[#38BDAD] backdrop-blur-md shadow-md">
              <Plane className="h-4 w-4 rotate-45" />
            </div>
          </div>
        </div>

        {/* Lower Glass Panel */}
        <div className="mx-3 mt-[-20px] relative z-20 flex h-[240px] flex-col justify-between rounded-[22px] border border-white/10 bg-[#1C252B]/95 p-5 backdrop-blur-xl shadow-xl">
          {/* Header Row: Country & Live Status */}
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#38BDAD]"
              style={mono}
            >
              {a.country}
            </span>
            <span
              className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#38BDAD]"
              style={mono}
            >
              <span className="h-2 w-2 rounded-full bg-[#38BDAD] animate-pulse shadow-[0_0_8px_#38BDAD]" />
              {statusText}
            </span>
          </div>

          {/* City Heading & Airport Name */}
          <div className="mt-1">
            <h3
              className={`font-normal leading-tight text-white tracking-wide font-serif truncate ${
                a.city.length > 15
                  ? "text-[20px]"
                  : a.city.length > 11
                    ? "text-[24px]"
                    : a.city.length > 8
                      ? "text-[27px]"
                      : "text-[32px]"
              }`}
              style={display}
              title={a.city}
            >
              {a.city}
            </h3>
            <div className="mt-0.5 line-clamp-1 text-[11px] font-medium text-white/75">
              {a.airport.name}
            </div>
          </div>

          {/* Facility & Terminal Two-Column Grid */}
          <div className="mt-2 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
            <div>
              <div
                className="text-[8px] font-bold uppercase tracking-widest text-white/40"
                style={mono}
              >
                FACILITY
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-white">
                <ShieldCheck className="h-3.5 w-3.5 text-[#38BDAD] shrink-0" />
                <span>Secure Airside</span>
              </div>
            </div>
            <div>
              <div
                className="text-[8px] font-bold uppercase tracking-widest text-white/40"
                style={mono}
              >
                TERMINAL
              </div>
              <div className="mt-0.5 text-[11px] font-medium text-white">{cleanTerminal}</div>
            </div>
          </div>

          {/* Tagline / City Highlight */}
          <div className="mt-2 flex items-center gap-1.5 text-[11px] italic text-[#38BDAD] font-medium line-clamp-1">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#38BDAD]" />
            <span>{a.tagline}</span>
          </div>
        </div>

        {/* Bottom CTA Button Container */}
        <div
          className="mt-2 flex w-full items-center justify-center gap-2 border-t border-white/10 py-3.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/80 group-hover:text-[#38BDAD] transition-colors"
          style={mono}
        >
          <span>EXPLORE DESTINATION</span>
          <ArrowUpRight className="h-4 w-4 text-[#38BDAD] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </Link>
    </motion.div>
  );
}
