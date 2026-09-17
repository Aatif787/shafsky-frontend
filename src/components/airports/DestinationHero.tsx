import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Airport } from "@/data/airports";
import { DARK, mono } from "./Atoms";
import { getAirportAsset, getAirportHeroImages } from "@/lib/airport-assets";
import { ResponsiveAirportHero } from "./ResponsiveAirportHero";

export function DestinationHero({ a }: { a: Airport }) {
  const [slide, setSlide] = useState(0);
  const [motionReady, setMotionReady] = useState(false);
  const lastWheelTime = useRef(0);

  // Resolved list of images for this airport hero (terminal-only, excluding city attractions)
  const hubImages = getAirportHeroImages(a.code);
  const images = hubImages.length > 0 ? hubImages : a.slideshow?.length ? a.slideshow : [a.cover];

  useEffect(() => {
    setMotionReady(true);
  }, []);

  const handleNext = useCallback(() => {
    setSlide((s) => (s + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setSlide((s) => (s - 1 + images.length) % images.length);
  }, [images.length]);

  // Auto-advance if multiple images exist
  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(handleNext, 6000);
    return () => clearInterval(id);
  }, [images.length, handleNext]);

  // Scroll / Wheel navigation across multiple images
  const handleWheel = (e: React.WheelEvent) => {
    if (images.length <= 1) return;
    const now = Date.now();
    if (now - lastWheelTime.current < 400) return;

    if (Math.abs(e.deltaX) > 25) {
      lastWheelTime.current = now;
      if (e.deltaX > 0) handleNext();
      else handlePrev();
    }
  };


  const hasDynamicHero =
    !!getAirportAsset(a.code, "hero-desktop.webp") ||
    !!getAirportAsset(a.code, "hero-mobile.webp") ||
    !!getAirportAsset(a.code, "hero-tablet.webp");

  const heroZoom = motionReady ? { opacity: 0 } : false;
  const fadeUp = motionReady ? { opacity: 0, y: 20 } : false;

  return (
    <section
      onWheel={handleWheel}
      className="relative flex h-auto min-h-0 w-full flex-col overflow-hidden p-2 sm:p-4 lg:h-[100svh] lg:min-h-[560px] lg:p-6 select-none"
      style={{ backgroundColor: DARK.bg }}
    >
      {/* Top Header Bar */}
      <div className="relative z-20 mb-3 shrink-0 sm:mb-4 flex items-center justify-between">
        <Link
          to="/airports"
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:text-[#7c3aed] hover:border-[#7c3aed]/40 hover:bg-purple-50/40 shadow-xs hover:shadow-md transition-all duration-300 text-xs sm:text-sm font-medium group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-slate-500 group-hover:text-[#7c3aed]" />
          <span>Back to All Airports</span>
        </Link>

        {/* Multi-Image Indicator Counter */}
        {images.length > 1 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/90 text-slate-800 shadow-xs text-xs font-mono font-bold">
            <span>
              {slide + 1} / {images.length}
            </span>
          </div>
        )}
      </div>

      <div className="relative aspect-[16/9] w-full flex-none overflow-hidden rounded-[1.5rem] border border-white/10 shadow-2xl sm:rounded-[2.5rem] bg-slate-900 lg:aspect-auto lg:min-h-0 lg:flex-1 lg:hero-kenburns">
        {/* PURE CRYSTAL-CLEAR IMAGE (ZERO DARK SHADOWS OR HEAVY BLACK GRADIENTS) */}
        <AnimatePresence mode="sync">
          {hasDynamicHero && slide === 0 ? (
            <motion.div
              key="dynamic-hero-0"
              initial={heroZoom}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <ResponsiveAirportHero
                code={a.code}
                alt={`${a.city} Airport Cover`}
                className="h-full w-full object-cover"
                fallbackImage={images[0]}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`slide-${slide}`}
              initial={heroZoom}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <img
                src={images[slide] || images[0]}
                alt={`${a.city} Airport View ${slide + 1}`}
                className="h-full w-full object-cover object-center"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* MULTI-IMAGE PREVIOUS / NEXT ARROWS */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous airport image"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next airport image"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Content Rendered Directly OVER the Image with Discrete Frosted Backdrops */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-10 md:p-14 text-white pointer-events-none">
          {/* Top Info & Airport Name */}
          <div className="max-w-4xl pt-safe pointer-events-auto">
            <motion.div
              initial={fadeUp}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex flex-wrap items-center gap-2 sm:gap-3 px-3.5 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-[9.5px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] font-bold text-amber-300 shadow-md"
              style={mono}
            >
              <span className="text-xl sm:text-2xl leading-none">🇮🇳</span>
              <span>{a.country}</span>
              <span className="h-px w-6 sm:w-10 bg-amber-400/40" />
              <span>IATA: {a.code} · ICAO: {a.icao}</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Slide Indicator Bar for Multiple Images */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 bg-black/60 px-3.5 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-lg">
          {images.map((img, i) => (
            <button
              type="button"
              key={`dest-hero-slide-${img}-${i}`}
              onClick={() => setSlide(i)}
              className="h-2 rounded-full transition-all duration-500 cursor-pointer"
              style={{
                width: i === slide ? 32 : 10,
                backgroundColor: i === slide ? "#a3e635" : "rgba(255,255,255,0.45)",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={false}
        animate={motionReady ? { y: [0, 6, 0] } : { y: 0 }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-6 right-8 z-10 hidden flex-col items-center gap-2 text-[9px] uppercase tracking-[0.4em] text-slate-500 font-bold lg:flex"
        style={mono}
      >
        Scroll
        <ArrowDown className="h-3 w-3 text-[#7c3aed]" />
      </motion.div>
    </section>
  );
}

