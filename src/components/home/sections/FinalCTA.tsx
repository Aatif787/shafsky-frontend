import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, PhoneCall, ShieldCheck, Sparkles } from "lucide-react";
import { mono, display } from "../theme";

const CTA_VIDEOS = [
  {
    id: 0,
    label: "01 / WATER WAVE",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260629_030107_874273ea-684a-4e90-bb96-8fdfde48d53d.mp4",
  },
  {
    id: 1,
    label: "02 / GRIDWAVE",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260629_032424_3c9c2a9d-807b-4482-80e6-dd6d9dfd4545.mp4",
  },
  {
    id: 2,
    label: "03 / LIGHT TUNNEL",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260627_094019_4214ea73-b963-46a4-8327-61489192de99.mp4",
  },
];

export function FinalCTA() {
  const [activeVideo, setActiveVideo] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Ensure active video is playing with full hardware acceleration
  useEffect(() => {
    const el = videoRefs.current[activeVideo];
    if (el) {
      el.play().catch(() => {});
    }
  }, [activeVideo]);

  return (
    <section className="relative min-h-[620px] md:min-h-[720px] w-full overflow-hidden flex items-center justify-center bg-black text-white border-b border-slate-800">
      {/* 4K Ultra-Sharp Native Resolution Direct Video Stream (Zero Blur, Zero Dark Tint) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {CTA_VIDEOS.map((vid, idx) => (
          <video
            key={vid.id}
            ref={(el) => {
              videoRefs.current[idx] = el;
            }}
            src={vid.url}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              activeVideo === idx ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            style={{
              imageRendering: "-webkit-optimize-contrast",
              transform: "translate3d(0, 0, 0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          />
        ))}
      </div>

      {/* Main Crisp Editorial Content */}
      <div className="relative z-30 mx-auto w-full max-w-5xl px-4 py-20 text-center sm:px-8 sm:py-28 md:py-32 flex flex-col items-center">
        {/* Video Switcher Buttons with Clean Frosted Glass */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap mb-8 pb-4 border-b border-white/20 bg-black/30 px-6 py-2.5 rounded-full backdrop-blur-xs">
          {CTA_VIDEOS.map((vid) => {
            const isActive = activeVideo === vid.id;
            return (
              <button
                key={vid.id}
                type="button"
                onClick={() => setActiveVideo(vid.id)}
                className={`group relative text-[11px] tracking-wider uppercase font-mono font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "text-lime-400 opacity-100 scale-105"
                    : "text-white/80 opacity-70 hover:opacity-100 hover:translate-x-1"
                }`}
                style={mono}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    isActive ? "bg-lime-400" : "bg-white/60 group-hover:bg-lime-400"
                  }`}
                />
                <span>{vid.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-cta-video-indicator"
                    className="absolute -bottom-1.5 inset-x-0 h-0.5 bg-lime-400"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="inline-flex items-center gap-3 text-[9.5px] sm:text-[11px] uppercase tracking-[0.35em] sm:tracking-[0.45em] text-lime-400 font-bold mb-6"
          style={mono}
        >
          <span className="h-px w-8 bg-lime-400" />
          <Sparkles size={12} className="text-lime-400 animate-pulse" />
          <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">ENGINEERING THE EDGE OF FLIGHT</span>
          <span className="h-px w-8 bg-lime-400" />
        </motion.div>

        {/* Main Headline — crystal transparent text, no container */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(2.4rem,5.5vw,4.8rem)] leading-[1.05] font-bold tracking-tight"
          style={display}
        >
          <motion.span
            animate={{ opacity: [0.92, 1, 0.92] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
            style={{ WebkitTextStroke: "0.3px rgba(255,255,255,0.15)" }}
          >
            Your Journey Deserves{" "}
          </motion.span>
          <motion.span
            animate={{
              textShadow: [
                "0 0 20px rgba(163,230,53,0.3), 0 0 40px rgba(163,230,53,0.15), 0 2px 10px rgba(0,0,0,0.8)",
                "0 0 35px rgba(163,230,53,0.6), 0 0 70px rgba(163,230,53,0.3), 0 2px 10px rgba(0,0,0,0.8)",
                "0 0 20px rgba(163,230,53,0.3), 0 0 40px rgba(163,230,53,0.15), 0 2px 10px rgba(0,0,0,0.8)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block text-lime-400"
          >
            Flawless Execution.
          </motion.span>
        </motion.h2>

        {/* Description — clean transparent text, no container */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-sm sm:text-base md:text-lg text-white font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]"
        >
          Experience personal airside escorts, priority customs clearance, and bespoke private jet charter across 20+ Indian hubs and global destinations.
        </motion.p>

        {/* Dual Luxury Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <a
            href="/#book"
            onClick={(e) => {
              const el = document.getElementById("book");
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
            className="group/btn relative overflow-hidden w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-[#84cc16] px-8 py-4 text-xs font-bold uppercase tracking-[0.22em] text-slate-950 transition-all duration-300 hover:bg-[#a3e635] hover:-translate-y-0.5 cursor-pointer font-mono"
            style={mono}
          >
            <span className="relative z-10">Book Now</span>
            <ArrowRight size={15} className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </a>

          <a
            href="tel:+919599087959"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-black/60 hover:bg-black/80 border-2 border-white/60 px-8 py-4 text-xs font-bold uppercase tracking-[0.22em] text-white transition-all hover:border-lime-400 cursor-pointer font-mono"
            style={mono}
          >
            <PhoneCall size={15} className="text-lime-400" />
            <span>24/7 Desk (+91 9599087959)</span>
          </a>
        </div>

        {/* Verification Guarantee */}
        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-white/95 font-mono drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]" style={mono}>
          <ShieldCheck size={14} className="text-lime-400" />
          <span>Official Airside Compliance · DGCA Protocol Authorized</span>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
