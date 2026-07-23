import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Plane, ShieldCheck, Sparkles } from "lucide-react";
import type { Airport } from "@/data/airports";
import { display, mono } from "./Atoms";
import { getAirportAsset } from "@/lib/airport-assets";

export function ShowcaseCard({ a, idx }: { a: Airport; idx: number }) {
  const cleanTerminal = a.airport.terminals
    ? `Terminal ${a.airport.terminals.split(" ")[0].replace(/[^0-9]/g, "") || "1"}`
    : "Terminal 1";

  const statusText =
    a.code === "DEL"
      ? "ACTIVE DISPATCH"
      : a.code === "BOM"
        ? "24/7 OPERATIONS"
        : "LIVE OPERATIONS";

  const cardImage = getAirportAsset(a.code, "hero-mobile.webp") || a.mobCover || a.cover;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8, delay: Math.min(idx, 4) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group relative h-[520px] w-full max-w-[320px] mx-auto shrink-0 overflow-hidden rounded-[28px] bg-[#141C21] border border-white/12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
    >
      <Link to="/airports/$code" params={{ code: a.code }} className="relative block h-full w-full">
        {/* Top Half Image Container */}
        <div className="relative h-[235px] w-full overflow-hidden">
          <img
            src={cardImage}
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
              className={`font-normal leading-tight text-white tracking-wide font-serif truncate ${a.city.length > 15
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
