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
    <section className="relative h-[100svh] w-full overflow-hidden" style={{ background: DARK.bg }}>
      <AnimatePresence mode="sync">
        {hasDynamicHero ? (
          <motion.div
            key="dynamic-hero"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 bottom-0 top-[53px] md:top-[68px]"
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
                  "linear-gradient(180deg, rgba(6,9,15,0.45) 0%, rgba(6,9,15,0.25) 40%, rgba(6,9,15,0.95) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(60% 60% at 50% 60%, transparent, rgba(6,9,15,0.6))",
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
            className="absolute inset-x-0 bottom-0 top-[53px] md:top-[68px]"
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
                  "linear-gradient(180deg, rgba(6,9,15,0.45) 0%, rgba(6,9,15,0.25) 40%, rgba(6,9,15,0.95) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(60% 60% at 50% 60%, transparent, rgba(6,9,15,0.6))",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
          className="flex min-w-0 flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-white/70 sm:tracking-[0.45em]"
          style={mono}
        >
          <span className="text-2xl leading-none">🇮🇳</span>
          <span>{a.country}</span>
          <span className="h-px w-12 bg-white/40" />
          <span style={{ color: DARK.blue }}>
            {a.code} · {a.icao}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-6 max-w-2xl text-white/80"
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
            <MagneticButton href="#book">Book Charter</MagneticButton>
            <a
              href="#guide"
              className="inline-flex min-h-12 items-center gap-2 px-5 py-4 text-[10px] uppercase tracking-[0.24em] text-white/80 transition hover:text-white sm:text-[11px] sm:tracking-[0.3em]"
              style={{ ...mono, border: `1px solid ${DARK.lineStrong}` }}
            >
              <MapPin className="h-3 w-3" /> Explore
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
                background: i === slide ? DARK.blue : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-6 right-8 z-10 flex flex-col items-center gap-2 text-[9px] uppercase tracking-[0.4em] text-white/50"
        style={mono}
      >
        Scroll
        <ArrowDown className="h-3 w-3" />
      </motion.div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="truncate text-[9px] uppercase tracking-[0.28em] text-white/45 sm:tracking-[0.35em]">
        {label}
      </div>
      <div className="mt-1 truncate text-sm text-white">{value}</div>
    </div>
  );
}
