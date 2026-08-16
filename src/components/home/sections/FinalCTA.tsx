import React from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Plane } from "lucide-react";
import { C, display, mono } from "../theme";

const MotionLink = motion.create(Link);
const MotionA = motion.a;
import ctaBg from "@/assets/cta-bg.jpg";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={ctaBg}
          alt="Sunset over the tarmac"
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(245,239,225,0.8), rgba(245,239,225,0.6), rgba(245,239,225,0.95))",
          }}
        />
      </div>
      <div className="relative mx-auto max-w-[1480px] px-6 py-20 text-center md:px-14 md:py-44">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div
            className="mx-auto inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.45em]"
            style={{ ...mono, color: C.teal }}
          >
            <span className="h-px w-10" style={{ background: C.teal }} />
            Ready when you are
            <span className="h-px w-10" style={{ background: C.teal }} />
          </div>
          <h2
            className="mx-auto mt-8 max-w-4xl text-[clamp(2.4rem,6vw,5.6rem)] leading-[1]"
            style={display}
          >
            Let us plan your{" "}
            <span className="italic" style={{ color: C.teal }}>
              next welcome.
            </span>
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-[15px]" style={{ color: C.mute }}>
            A guest relations officer will reply within minutes. Tell us only where, and when.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <MotionA
              href="#book"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-[12px] uppercase tracking-[0.3em] shadow-lg transition hover:brightness-110"
              style={{ ...mono, background: C.teal, color: "#fff" }}
            >
              Book Services →
            </MotionA>
            <MotionLink
              to="/charter"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-[12px] uppercase tracking-[0.3em] shadow-lg transition hover:brightness-110"
              style={{ ...mono, background: C.mint, color: C.ink }}
            >
              <Plane className="h-3.5 w-3.5" /> Private Charter
            </MotionLink>
            <MotionA
              href="https://wa.me/919599087959"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-[12px] uppercase tracking-[0.3em] transition"
              style={{ ...mono, border: `1px solid ${C.teal}`, color: C.teal }}
            >
              WhatsApp Us
            </MotionA>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

