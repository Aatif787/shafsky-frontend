import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, MapPin } from "lucide-react";
import type { Airport } from "@/data/airports";
import { DARK, display, mono, MagneticButton } from "./Atoms";
import { getAirportAsset } from "@/lib/airport-assets";
import { ResponsiveAirportHero } from "./ResponsiveAirportHero";

export function DestinationHero({ a }: { a: Airport }) {
  const [slide, setSlide] = useState(0);
  const [time, setTime] = useState("");

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % a.slideshow.length), 5000);
    return () => clearInterval(id);
  }, [a.slideshow.length]);

  useEffect(() => {
    const tick = () => {
      try {
        setTime(
          new Intl.DateTimeFormat("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            timeZone: a.timezone,
          }).format(new Date()),
        );
      } catch {
        setTime("");
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [a.timezone]);

  const hasDynamicHero =
    !!getAirportAsset(a.code, "hero-desktop.webp") ||
    !!getAirportAsset(a.code, "hero-mobile.webp") ||
    !!getAirportAsset(a.code, "hero-tablet.webp");

  return (
    <section className="relative h-[100svh] w-full overflow-hidden p-2 sm:p-4 md:p-6" style={{ background: DARK.bg }}>
      <div className="relative h-full w-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
        <AnimatePresence mode="sync">
          {hasDynamicHero ? (
            <motion.div
              key="dynamic-hero"
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <ResponsiveAirportHero
                code={a.code}
                alt={`${a.city} Airport Cover`}
                className="h-full w-full object-cover"
                fallbackImage={a.slideshow[0]}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(11,26,36,0.35) 0%, rgba(250,248,245,0.6) 60%, rgba(250,248,245,1) 100%)",
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key={slide}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <img
                src={a.slideshow[slide]}
                alt=""
                className="h-full w-full object-cover"
                style={{
                  objectPosition: a.slideshow[slide]?.includes("chaarminar")
                    ? "center 30%"
                    : a.slideshow[slide]?.includes("golkunda")
                      ? "center 40%"
                      : "center",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(11,26,36,0.35) 0%, rgba(250,248,245,0.6) 60%, rgba(250,248,245,1) 100%)",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* fog */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(180deg, transparent, rgba(94,211,255,0.04))" }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* content */}
      <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-20 sm:px-8 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex min-w-0 flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-slate-700 font-bold sm:tracking-[0.45em]"
          style={mono}
        >
          <span className="text-2xl leading-none">🇮🇳</span>
          <span>{a.country}</span>
          <span className="h-px w-12 bg-slate-400/40" />
          <span className="text-[#7c3aed]">
            {a.code} · {a.icao}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-6 max-w-2xl text-slate-800 font-serif"
          style={{ ...display, fontSize: "clamp(1.1rem, 1.6vw, 1.5rem)", fontStyle: "italic" }}
        >
          {a.tagline}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
        >
          <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-8" style={mono}>
            <Stat label="Local Time" value={time || "—"} />
            <Stat label="Weather" value={a.weather.temp + " · clear"} />
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <MagneticButton href="#book">Book Concierge</MagneticButton>
            <a
              href="#guide"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl px-5 py-4 text-[10px] uppercase tracking-[0.24em] font-bold text-slate-800 bg-white/80 border border-[#e5dfd5] shadow-xs backdrop-blur-md transition hover:bg-white hover:border-[#7c3aed]/40 sm:text-[11px] sm:tracking-[0.3em]"
              style={mono}
            >
              <MapPin className="h-3.5 w-3.5 text-[#7c3aed]" /> Explore
            </a>
          </div>
        </motion.div>
      </div>

      {/* slide indicator */}
      {!hasDynamicHero && (
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {a.slideshow.map((img, i) => (
            <span
              key={`dest-hero-slide-${img}-${i}`}
              className="h-px transition-all duration-500"
              style={{
                width: i === slide ? 40 : 14,
                background: i === slide ? "#7c3aed" : "rgba(0,0,0,0.2)",
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-6 right-8 z-10 flex flex-col items-center gap-2 text-[9px] uppercase tracking-[0.4em] text-slate-500 font-bold"
        style={mono}
      >
        Scroll
        <ArrowDown className="h-3 w-3 text-[#7c3aed]" />
      </motion.div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 bg-white/80 border border-[#e5dfd5] px-4 py-2.5 rounded-2xl shadow-xs backdrop-blur-md">
      <div className="truncate text-[9px] uppercase tracking-[0.28em] text-slate-500 font-bold sm:tracking-[0.35em]">
        {label}
      </div>
      <div className="mt-0.5 truncate text-sm font-extrabold text-slate-900">{value}</div>
    </div>
  );
}
