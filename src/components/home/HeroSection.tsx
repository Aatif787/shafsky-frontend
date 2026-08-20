import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { C, mono } from "./theme";
import lounge from "@/assets/lounge.png";
import interior from "@/assets/interior.jpg";
import slide2 from "@/assets/image2.png";
import slide3 from "@/assets/image3.png";
import world from "@/assets/world.png";

const SLIDESHOW_IMAGES = [world, slide2, slide3, lounge, interior];

export function HeroSection({ visible }: { visible: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % SLIDESHOW_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const next = SLIDESHOW_IMAGES[(currentIdx + 1) % SLIDESHOW_IMAGES.length];
    const img = new Image();
    img.decoding = "async";
    img.src = next;
  }, [currentIdx]);

  return (
    <section
      ref={ref}
      style={{ position: "relative" }}
      className="relative md:h-screen md:min-h-[760px] h-auto min-h-0 w-full overflow-hidden"
    >
      <motion.div style={{ y, opacity: 1, position: "absolute" }} className="absolute inset-0">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentIdx}
            src={SLIDESHOW_IMAGES[currentIdx]}
            alt="Shafsky Aviation services slideshow"
            fetchPriority={currentIdx === 0 ? "high" : "low"}
            loading={currentIdx === 0 ? "eager" : "lazy"}
            decoding="async"
            width={1920}
            height={1080}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full object-cover scale-110"
          />
        </AnimatePresence>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(250,245,234,0.55) 0%, rgba(250,245,234,0.2) 35%, rgba(250,245,234,0.95) 100%)",
          }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto flex h-full max-w-[1480px] flex-col justify-center px-6 pt-28 pb-32 md:px-14 md:pt-28 md:pb-28 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 14 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="flex items-center gap-3 text-[9px] md:text-[10px] uppercase tracking-[0.45em]"
          style={{ ...mono, color: "#ffffff" }}
        >
          <span className="h-px w-8 md:w-12 bg-white" />
          Shafsky Aviation Services Pvt. Ltd. · India & Global
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 40 }}
          transition={{ duration: 1.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 md:mt-8 max-w-[850px] text-[clamp(1.85rem,5.5vw,4.25rem)] leading-[1.12] font-extrabold tracking-tight"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}
        >
          <motion.span
            className="inline-block cursor-default origin-left"
            whileHover={{ scale: 1.02, color: "#f5efe1" }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            Welcome aboard
          </motion.span>
          <br />
          <motion.span
            className="inline-block cursor-default italic origin-left"
            style={{ color: "#ff6b00", display: "inline-block" }}
            whileHover={{
              scale: 1.08,
              rotate: -1.5,
              color: "#ff8533",
            }}
            transition={{ type: "spring", stiffness: 450, damping: 12 }}
          >
            Suswagatam
          </motion.span>{" "}
          <motion.span
            className="inline-block cursor-default origin-left"
            whileHover={{ scale: 1.02, color: "#f5efe1" }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            from
          </motion.span>
          <br />
          <motion.span
            className="inline-block cursor-default origin-left"
            whileHover={{ scale: 1.02, color: "#f5efe1" }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            Shafsky Aviation
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
          transition={{ duration: 0.9, delay: 0.95 }}
          className="mt-6 md:mt-8 max-w-xl text-[14px] md:text-[16px] leading-relaxed"
          style={{ color: "rgba(255, 255, 255, 0.85)" }}
        >
          Meet & Greet, private lounge access, premium ground transport, and concierge —
          orchestrated across India's busiest airports and global hubs since 2022.
        </motion.p>
      </div>

      {/* scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[9px] uppercase tracking-[0.5em]"
        style={{ ...mono, color: C.mute }}
        animate={{ y: [0, 6, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      >
        Book Below ↓
      </motion.div>
    </section>
  );
}
