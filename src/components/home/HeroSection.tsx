import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { C, mono } from "./theme";
import world from "@/assets/world.png";

const EXTRA_SLIDES = [
  () => import("@/assets/image2.png"),
  () => import("@/assets/image3.png"),
  () => import("@/assets/lounge.png"),
  () => import("@/assets/interior.jpg"),
];

export function HeroSection({ visible }: { visible: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [slides, setSlides] = useState<string[]>([world]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      Promise.all(EXTRA_SLIDES.map((loadSlide) => loadSlide())).then((mods) => {
        if (cancelled) return;
        setSlides([world, ...mods.map((m) => m.default)]);
      });
    };
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof win.requestIdleCallback === "function") {
      const id = win.requestIdleCallback(load, { timeout: 2500 });
      return () => {
        cancelled = true;
        win.cancelIdleCallback?.(id);
      };
    }
    const t = window.setTimeout(load, 600);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section
      ref={ref}
      style={{ position: "relative" }}
      className="relative md:h-screen md:min-h-[760px] h-auto min-h-0 w-full overflow-hidden"
    >
      <div className="absolute inset-0">
        {slides.map((src, idx) => (
          <img
            key={src}
            src={src}
            alt=""
            fetchPriority={idx === 0 ? "high" : "low"}
            loading={idx === 0 ? "eager" : "lazy"}
            decoding="async"
            width={1920}
            height={1080}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              idx === currentIdx ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(250,245,234,0.55) 0%, rgba(250,245,234,0.2) 35%, rgba(250,245,234,0.95) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-[1480px] flex-col justify-center px-6 pt-28 pb-32 md:px-14 md:pt-28 md:pb-28 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }}
          transition={{ duration: 0.45 }}
          className="flex items-center gap-3 text-[9px] md:text-[10px] uppercase tracking-[0.45em]"
          style={{ ...mono, color: "#ffffff" }}
        >
          <span className="h-px w-8 md:w-12 bg-white" />
          Shafsky Aviation Services Pvt. Ltd. · India & Global
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 16 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mt-6 md:mt-8 max-w-[850px] text-[clamp(1.85rem,5.5vw,4.25rem)] leading-[1.12] font-extrabold tracking-tight"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}
        >
          Welcome aboard
          <br />
          <span className="italic" style={{ color: "#ff6b00" }}>
            Suswagatam
          </span>{" "}
          from
          <br />
          Shafsky Aviation
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }}
          transition={{ duration: 0.45, delay: 0.14 }}
          className="mt-6 md:mt-8 max-w-xl text-[14px] md:text-[16px] leading-relaxed"
          style={{ color: "rgba(255, 255, 255, 0.85)" }}
        >
          Meet & Greet, private lounge access, premium ground transport, and concierge —
          orchestrated across India's busiest airports and global hubs since 2022.
        </motion.p>
      </div>

      <div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[9px] uppercase tracking-[0.5em]"
        style={{ ...mono, color: C.mute }}
      >
        Book Below ↓
      </div>
    </section>
  );
}
