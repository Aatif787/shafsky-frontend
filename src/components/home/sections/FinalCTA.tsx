import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Plane } from "lucide-react";

const MotionLink = motion.create(Link);
const MotionA = motion.a;

const VIDEOS = [
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260629_030107_874273ea-684a-4e90-bb96-8fdfde48d53d.mp4",
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260629_032424_3c9c2a9d-807b-4482-80e6-dd6d9dfd4545.mp4",
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260627_094019_4214ea73-b963-46a4-8327-61489192de99.mp4",
];

export function FinalCTA() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoSources, setVideoSources] = useState<string[]>(VIDEOS);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Preload videos into object URLs for instant, smooth playback
  useEffect(() => {
    let isMounted = true;
    const objectUrls: string[] = [];

    const preloadVideos = async () => {
      const resolved = await Promise.all(
        VIDEOS.map(async (url) => {
          try {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Fetch failed");
            const blob = await res.blob();
            const objUrl = URL.createObjectURL(blob);
            objectUrls.push(objUrl);
            return objUrl;
          } catch {
            return url;
          }
        })
      );
      if (isMounted) {
        setVideoSources(resolved);
      }
    };

    preloadVideos();

    return () => {
      isMounted = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Ensure active video is playing
  useEffect(() => {
    const currVideo = videoRefs.current[activeIndex];
    if (currVideo) {
      currVideo.play().catch(() => { });
    }
  }, [activeIndex, videoSources]);

  return (
    <section className="relative min-h-[540px] sm:min-h-[640px] md:min-h-[740px] lg:min-h-[840px] w-full overflow-hidden flex items-center justify-center select-none bg-black">
      {/* 100% Super Clear Crystal 4K Video Background Engine */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* 3 Animated Looping Crossfade Videos in Ultra Sharp 4K Clarity */}
        {videoSources.map((src, idx) => (
          <video
            key={src + idx}
            ref={(el) => {
              videoRefs.current[idx] = el;
            }}
            src={src}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[1200ms] ease-in-out will-change-transform ${activeIndex === idx ? "opacity-100" : "opacity-0"
              }`}
            style={{
              imageRendering: "crisp-edges",
              transform: "translateZ(0)",
            }}
          />
        ))}

        {/* Minimal Crystal Clear Tint Overlay (Zero Blur, Preserves 100% Video Sharpness) */}
        <div className="absolute inset-0 z-[1] bg-black/25" />
      </div>

      {/* Main Crisp High-Definition Content */}
      <div className="relative z-[2] mx-auto w-full max-w-5xl px-4 py-16 text-center sm:px-8 sm:py-24 md:py-32 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          {/* Top Line Tagline */}
          <div className="inline-flex items-center justify-center gap-2.5 sm:gap-3 text-[9.5px] sm:text-[11px] uppercase tracking-[0.35em] sm:tracking-[0.45em] text-[#C084FC] font-semibold drop-shadow">
            <span className="h-[1.5px] w-6 sm:w-8 md:w-12 bg-[#C084FC]" />
            <span>Ready when you are</span>
            <span className="h-[1.5px] w-6 sm:w-8 md:w-12 bg-[#C084FC]" />
          </div>

          {/* Heading - Razor Sharp 4K Typography */}
          <h2
            className="mt-5 sm:mt-6 md:mt-8 max-w-4xl text-[clamp(2.1rem,5.8vw,5.2rem)] leading-[1.08] tracking-[-0.02em] text-white font-normal drop-shadow-md"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Let us plan your{" "}
            <span
              className="italic font-normal"
              style={{
                background: "linear-gradient(135deg, #A78BFA 0%, #C084FC 50%, #F472B6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              next
            </span>
            <br />
            <span
              className="italic font-normal"
              style={{
                background: "linear-gradient(135deg, #A78BFA 0%, #C084FC 50%, #F472B6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              welcome.
            </span>
          </h2>

          {/* Subtitle - Sharp High Contrast */}
          <p className="mt-4 sm:mt-5 md:mt-6 max-w-xl text-[13.5px] sm:text-[15px] md:text-[16px] leading-relaxed text-[#E2E8F0] font-medium drop-shadow">
            A guest relations officer will reply within minutes. Tell us only where, and when.
          </p>

          {/* 3 Crisp Solid Action Buttons */}
          <div className="mt-7 sm:mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-5">
            {/* 1. Purple Book Services Button */}
            <MotionA
              href="#book"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7C3AED] px-6 sm:px-8 py-3.5 sm:py-4 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white transition-colors hover:bg-[#6D28D9] touch-manipulation"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <span>Book Services</span>
              <span className="text-sm font-bold leading-none">›</span>
            </MotionA>

            {/* 2. Vibrant Lime Green Private Charter Button */}
            <MotionLink
              to="/charter"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 sm:gap-2.5 rounded-full bg-[#84CC16] px-6 sm:px-8 py-3.5 sm:py-4 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#090a0f] transition-colors hover:bg-[#65A30D] hover:text-white touch-manipulation"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <Plane className="h-3.5 sm:h-4 w-3.5 sm:w-4 -rotate-45" />
              <span>Private Charter</span>
            </MotionLink>

            {/* 3. Pure Crystal White / Glass WhatsApp Button */}
            <MotionA
              href="https://wa.me/919599087959"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center rounded-full border-2 border-white/60 bg-white/10 px-6 sm:px-8 py-3.5 sm:py-4 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white transition-colors hover:border-white hover:bg-white hover:text-[#090a0f] touch-manipulation"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              WhatsApp Us
            </MotionA>
          </div>


          {/* Interactive Video Switcher Dots */}
          <div className="mt-8 flex items-center justify-center gap-2.5" aria-label="Video switcher">
            {VIDEOS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? "w-8 bg-[#C084FC]" : "w-2 bg-white/40 hover:bg-white/80"
                  }`}
                aria-label={`Switch to video background ${idx + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
