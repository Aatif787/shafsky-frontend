import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowLeft, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Airport } from "@/data/airports";
import { DARK, mono, MagneticButton } from "./Atoms";
import { getAirportAsset } from "@/lib/airport-assets";
import { ResponsiveAirportHero } from "./ResponsiveAirportHero";

export function DestinationHero({ a }: { a: Airport }) {
  const [slide, setSlide] = useState(0);
  const [time, setTime] = useState("");
  // Defer Framer Motion entrance styles until after hydration so SSR HTML matches the first client paint.
  const [motionReady, setMotionReady] = useState(false);

  useEffect(() => {
    setMotionReady(true);
  }, []);

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

  const heroZoom = motionReady ? { opacity: 0, scale: 1.08 } : false;
  const fadeUp = motionReady ? { opacity: 0, y: 20 } : false;
  const fadeUpSm = motionReady ? { opacity: 0, y: 15 } : false;
  const overlayGradient =
    "linear-gradient(180deg, rgba(11,26,36,0.75) 0%, rgba(11,26,36,0.3) 45%, rgba(11,26,36,0.85) 100%)";

  return (
    <section
      className="relative flex h-[100svh] min-h-[560px] w-full flex-col overflow-hidden p-2 sm:p-4 md:p-6"
      style={{ backgroundColor: DARK.bg }}
    >
      {/* Outside the hero image, still inside the same <section> so SSR and client trees match */}
      <div className="relative z-20 mb-3 shrink-0 sm:mb-4">
        <Link
          to="/airports"
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:text-[#7c3aed] hover:border-[#7c3aed]/40 hover:bg-purple-50/40 shadow-xs hover:shadow-md transition-all duration-300 text-xs sm:text-sm font-medium group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-slate-500 group-hover:text-[#7c3aed]" />
          <span>Back to All Airports</span>
        </Link>
      </div>

      <div className="relative min-h-0 w-full flex-1 overflow-hidden rounded-[1.5rem] border border-white/10 shadow-2xl sm:rounded-[2.5rem]">
        <AnimatePresence mode="sync">
          {hasDynamicHero ? (
            <motion.div
              key="dynamic-hero"
              initial={heroZoom}
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
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: overlayGradient }}
              />
            </motion.div>
          ) : (
            <motion.div
              key={slide}
              initial={heroZoom}
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
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: overlayGradient }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Rendered Directly OVER the Image Inside the Card */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-10 md:p-14 text-white">
          {/* Top Info & Airport Name */}
          <div className="max-w-4xl pt-safe">
            <motion.div
              initial={fadeUp}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-wrap items-center gap-2 sm:gap-3 text-[9.5px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] font-bold text-amber-300/90"
              style={mono}
            >
              <span className="text-xl sm:text-2xl leading-none">🇮🇳</span>
              <span>{a.country}</span>
              <span className="h-px w-6 sm:w-10 bg-amber-400/40" />
              <span>IATA: {a.code} · ICAO: {a.icao}</span>
            </motion.div>

            {/* Official Airport Name Rendered on Hero Section for GAU and IXC */}
            {(a.code === "GAU" || a.code === "IXC") && (
              <>
                <motion.h1
                  initial={fadeUp}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="mt-3 text-3xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-white drop-shadow-xl leading-tight"
                  style={{
                    fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                    textShadow: "0 4px 20px rgba(0,0,0,0.8)",
                  }}
                >
                  {a.airport?.name || `${a.city} International Airport`}
                </motion.h1>

                {/* Tagline */}
                <motion.p
                  initial={fadeUpSm}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="mt-2 text-lg sm:text-xl font-serif italic text-amber-200/90 drop-shadow-md"
                >
                  "{a.tagline}"
                </motion.p>

                {/* Basic Key Details Badges */}
                <motion.div
                  initial={fadeUpSm}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="mt-4 flex flex-wrap items-center gap-2.5 text-xs font-semibold"
                >
                  {a.landmark && (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 font-mono text-[11px] tracking-wider uppercase backdrop-blur-md shadow-lg">
                      📍 Gateway to {a.landmark}
                    </span>
                  )}
                  {a.airport?.terminals && (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 border border-white/20 text-slate-100 font-mono text-[11px] tracking-wider backdrop-blur-md shadow-lg">
                      🏛️ Terminals: {a.airport.terminals}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 font-mono text-[11px] tracking-wider uppercase backdrop-blur-md shadow-lg">
                    ✨ 24x7 VIP Concierge Active
                  </span>
                </motion.div>
              </>
            )}
          </div>

          {/* Bottom Area: Local Time, Weather & Actions */}
          <motion.div
            initial={fadeUp}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end pt-6"
          >
            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6" style={mono}>
              <div className="bg-black/50 border border-white/20 px-4 py-3 rounded-2xl backdrop-blur-md shadow-xl text-white">
                <div className="truncate text-[9px] uppercase tracking-[0.3em] text-amber-300/80 font-bold">Local Time</div>
                <div className="mt-1 text-lg sm:text-xl font-bold tracking-wider">{time || "—"}</div>
              </div>
              <div className="bg-black/50 border border-white/20 px-4 py-3 rounded-2xl backdrop-blur-md shadow-xl text-white">
                <div className="truncate text-[9px] uppercase tracking-[0.3em] text-amber-300/80 font-bold">Weather</div>
                <div className="mt-1 text-lg sm:text-xl font-bold tracking-wider">{a.weather.temp + " · Clear"}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <MagneticButton href="#book">Book Concierge</MagneticButton>
              <a
                href="#guide"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl px-5 py-3.5 text-[10px] uppercase tracking-[0.24em] font-bold text-white bg-black/50 border border-white/30 shadow-lg backdrop-blur-md transition hover:bg-black/70 hover:border-amber-400/60 sm:text-[11px] sm:tracking-[0.3em]"
                style={mono}
              >
                <MapPin className="h-3.5 w-3.5 text-amber-400" /> Explore
              </a>
            </div>
          </motion.div>
        </div>
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
                backgroundColor: i === slide ? "#7c3aed" : "rgba(0,0,0,0.2)",
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={false}
        animate={motionReady ? { y: [0, 6, 0] } : { y: 0 }}
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
