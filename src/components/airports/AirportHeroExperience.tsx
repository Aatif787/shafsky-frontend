import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, MapPin, Clock, Globe, ShieldCheck, Sparkles, Plane, ArrowRight } from "lucide-react";
import type { Airport } from "@/data/airports";
import { getAirportAsset } from "@/lib/airport-assets";
import { ResponsiveAirportHero } from "./ResponsiveAirportHero";
import { Link } from "@tanstack/react-router";

interface AirportHeroExperienceProps {
  a: Airport;
}

export function AirportHeroExperience({ a }: AirportHeroExperienceProps) {
  const [slide, setSlide] = useState(0);
  const [time, setTime] = useState("");

  useEffect(() => {
    if (!a.slideshow || a.slideshow.length === 0) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % a.slideshow.length), 5000);
    return () => clearInterval(id);
  }, [a.slideshow]);

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
          }).format(new Date())
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
    <section className="relative min-h-[90vh] lg:min-h-screen w-full overflow-hidden rounded-[40px] bg-[#06090f] text-white border border-white/10 shadow-2xl my-4">
      {/* 1. HERO BACKGROUND IMAGE WITH LUXURY OVERLAY */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="sync">
          {hasDynamicHero ? (
            <motion.div
              key="dynamic-hero"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <ResponsiveAirportHero
                code={a.code}
                alt={`${a.city} Airport Cover`}
                className="h-full w-full object-cover"
                fallbackImage={a.slideshow?.[0] || a.cover}
              />
            </motion.div>
          ) : (
            <motion.img
              key={slide}
              src={a.slideshow?.[slide] || a.cover}
              alt={a.airport.name}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </AnimatePresence>

        {/* Multi-layered luxury overlays: Ambient gradients & glass contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06090f] via-[#06090f]/60 to-[#06090f]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06090f]/90 via-[#06090f]/40 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c5a059]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. HERO CONTENT CONTAINER */}
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[90vh] lg:min-h-screen p-6 sm:p-10 lg:p-16">
        
        {/* Top Badges Row */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap items-center justify-between gap-4 pt-12"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none">🇮🇳</span>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] font-mono uppercase tracking-[0.25em] text-[#c5a059]">
              <Globe className="w-3.5 h-3.5" />
              <span>{a.country} ({a.countryCode || "IN"})</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#c5a059] text-[10px] font-mono uppercase tracking-[0.25em] font-bold">
              {a.code} · {a.icao}
            </div>
          </div>

          {/* Staged Support Badge */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5fb5ad]/15 border border-[#5fb5ad]/30 text-[#5fb5ad] text-[10px] font-mono uppercase tracking-[0.2em]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>24/7 Airside Staging Active</span>
          </div>
        </motion.div>

        {/* Center / Main Heading & Tagline */}
        <div className="my-auto max-w-4xl py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.3em] text-[#c5a059] mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Flagship Destination Hub</span>
            </div>

            <h1
              className="text-4xl sm:text-6xl lg:text-7xl font-serif font-light text-white leading-[1.02] tracking-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {a.airport.name || `${a.city} Airport`}
            </h1>

            <p className="mt-4 text-lg sm:text-xl text-[#c5a059] font-serif italic max-w-2xl">
              "{a.tagline || `Luxury airport concierge and VIP transit in ${a.city}.`}"
            </p>

            <p className="mt-4 text-xs sm:text-sm text-white/75 font-sans leading-relaxed max-w-2xl line-clamp-3">
              {a.about}
            </p>
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/book"
              search={{ origin: a.code } as any}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#c5a059] to-[#d4c09d] text-[#081119] font-mono text-xs font-bold uppercase tracking-[0.25em] shadow-2xl hover:scale-[1.02] transition-all duration-300"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <span>Book Concierge at {a.code}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href="#services-available"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/20 backdrop-blur-md transition-all duration-300"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <Plane className="w-4 h-4 text-[#c5a059]" />
              <span>Explore Staged Services</span>
            </a>
          </motion.div>
        </div>

        {/* Bottom Bar: Live Time, Weather & Scroll Trigger */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10"
        >
          {/* Local Time Widget */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
            <div className="w-9 h-9 rounded-xl bg-[#c5a059]/15 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059]">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-white/50">Local Time ({a.city})</div>
              <div className="text-xs font-mono font-bold text-white tracking-wider">{time || "24/7 Staged"}</div>
            </div>
          </div>

          {/* Weather Widget */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
            <div className="w-9 h-9 rounded-xl bg-[#5fb5ad]/15 border border-[#5fb5ad]/30 flex items-center justify-center text-[#5fb5ad]">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-white/50">Hub Climate</div>
              <div className="text-xs font-mono font-bold text-white tracking-wider">{a.weather?.temp || "28°C"} · Clear</div>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div className="flex items-center justify-between sm:justify-end gap-3 p-3.5 text-white/60 font-mono text-[10px] uppercase tracking-[0.25em]">
            <span>Scroll for Quick Facts</span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#c5a059] animate-bounce">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
