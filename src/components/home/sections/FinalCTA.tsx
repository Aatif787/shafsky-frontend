import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, PhoneCall, ShieldCheck, Sparkles } from "lucide-react";
import { mono } from "../theme";

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
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.25 });
  const [isTextVisible, setIsTextVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetFadeTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsTextVisible(true);
    timerRef.current = setTimeout(() => {
      setIsTextVisible(false);
    }, 5000);
  }, []);

  // Ensure active video is playing with full hardware acceleration
  useEffect(() => {
    const el = videoRefs.current[activeVideo];
    if (el) {
      el.play().catch(() => {});
    }
  }, [activeVideo]);

  // Manage 5-second disappearance timer based on viewport visibility and active video
  useEffect(() => {
    if (isInView) {
      resetFadeTimer();
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setIsTextVisible(true);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isInView, activeVideo, resetFadeTimer]);

  return (
    <section
      ref={sectionRef}
      onClick={(e) => {
        // Click anywhere on video / section background wakes up the text for 5s
        if ((e.target as HTMLElement).closest("a, button")) return;
        resetFadeTimer();
      }}
      className="relative min-h-[620px] md:min-h-[720px] w-full overflow-hidden flex flex-col justify-between bg-black text-white border-b border-slate-800"
    >
      {/* 12K Cinema Master Video Stream Container */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
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
              filter: "contrast(1.05) saturate(1.12) brightness(1.04)",
              transform: "scale(1.01) translate3d(0, 0, 0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          />
        ))}
      </div>

      {/* Top Bar: Video Switcher Buttons */}
      <div className="relative z-30 w-full pt-8 sm:pt-10 flex justify-center px-4">
        <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap pb-3 pt-2.5 px-6 rounded-full bg-black/45 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)]">
          {CTA_VIDEOS.map((vid) => {
            const isActive = activeVideo === vid.id;
            return (
              <button
                key={vid.id}
                type="button"
                onClick={() => {
                  setActiveVideo(vid.id);
                  resetFadeTimer();
                }}
                className={`group relative text-[10.5px] sm:text-[11px] tracking-[0.2em] uppercase font-mono font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 py-1 ${
                  isActive
                    ? "text-lime-400 opacity-100 scale-105 drop-shadow-[0_0_8px_rgba(163,230,53,0.5)]"
                    : "text-white/75 opacity-75 hover:opacity-100 hover:text-white"
                }`}
                style={mono}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    isActive ? "bg-lime-400 shadow-[0_0_8px_#a3e635]" : "bg-white/50 group-hover:bg-lime-400"
                  }`}
                />
                <span>{vid.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-cta-video-indicator"
                    className="absolute -bottom-1.5 inset-x-0 h-0.5 bg-lime-400 shadow-[0_0_10px_#a3e635]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Area: Eyebrow + Buttons + Guarantee */}
      <div className="relative z-30 mx-auto w-full max-w-5xl px-4 pb-8 sm:pb-12 md:pb-14 text-center flex flex-col items-center">
        {/* Animated Eyebrow */}
        <motion.div
          animate={{
            opacity: isTextVisible ? 1 : 0,
            y: isTextVisible ? 0 : 10,
            filter: isTextVisible ? "blur(0px)" : "blur(8px)",
          }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={`flex flex-col items-center w-full transition-all ${
            !isTextVisible ? "pointer-events-none select-none" : ""
          }`}
        >
          <div
            className="inline-flex items-center gap-3 text-[9.5px] sm:text-[11px] uppercase tracking-[0.35em] sm:tracking-[0.45em] text-lime-400 font-bold mb-4 sm:mb-5"
            style={mono}
          >
            <span className="h-px w-8 bg-lime-400" />
            <Sparkles size={12} className="text-lime-400 animate-pulse" />
            <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">SEAMLESS AIRPORT ASSISTANCE</span>
            <span className="h-px w-8 bg-lime-400" />
          </div>
        </motion.div>

        {/* Dual Luxury Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
          <a
            href="/#book"
            onClick={(e) => {
              const el = document.getElementById("book");
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
            className="group/btn relative overflow-hidden w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#84cc16] to-[#a3e635] px-7 py-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-950 transition-all duration-300 hover:brightness-110 hover:-translate-y-0.5 cursor-pointer font-mono shadow-[0_0_30px_rgba(163,230,53,0.35),0_10px_25px_rgba(0,0,0,0.6)] hover:shadow-[0_0_45px_rgba(163,230,53,0.6),0_14px_30px_rgba(0,0,0,0.8)]"
            style={mono}
          >
            <span className="relative z-10">Book Now</span>
            <ArrowRight size={15} className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </a>

          <a
            href="tel:+919599087959"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-xl border border-white/30 hover:border-lime-400 px-7 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white transition-all hover:-translate-y-0.5 cursor-pointer font-mono shadow-[0_10px_25px_rgba(0,0,0,0.6)] hover:shadow-[0_0_25px_rgba(163,230,53,0.25)]"
            style={mono}
          >
            <PhoneCall size={15} className="text-lime-400 drop-shadow-[0_0_8px_rgba(163,230,53,0.6)]" />
            <span>24/7 Desk (+91 9599087959)</span>
          </a>
        </div>

        {/* Verification Guarantee */}
        <div className="mt-4 sm:mt-5 inline-flex items-center justify-center gap-2.5 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs text-white/95 font-mono shadow-[0_4px_16px_rgba(0,0,0,0.5)]" style={mono}>
          <ShieldCheck size={14} className="text-lime-400 drop-shadow-[0_0_6px_rgba(163,230,53,0.6)]" />
          <span>Airport-Authorized Team · Dedicated On-Ground Support</span>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
