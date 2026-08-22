import React, { useRef } from "react";
import { motion } from "framer-motion";
import { C, display, mono } from "../theme";
import { SectionLabel } from "./SectionLabel";
import heroJet from "@/assets/hero-jet.png";
import jetTarmac from "@/assets/jet-tarmac.jpg";
import interior from "@/assets/interior.jpg";
import ctaBg from "@/assets/cta-bg.jpg";

export function Fleet() {
  const fleet = [
    {
      name: "Delhi · IGI Airport",
      cat: "Flagship Hub",
      img: heroJet,
      pax: "Domestic + Intl",
      range: "24×7",
      speed: "All Airlines",
    },
    {
      name: "Mumbai · CSMIA",
      cat: "Western Gateway",
      img: jetTarmac,
      pax: "Full Airport Coverage",
      range: "24×7",
      speed: "All Airlines",
    },
    {
      name: "Bengaluru · Kempegowda",
      cat: "Southern Hub",
      img: interior,
      pax: "Full Airport Coverage",
      range: "24×7",
      speed: "All Airlines",
    },
    {
      name: "Hyderabad · RGIA",
      cat: "Deccan Gateway",
      img: ctaBg,
      pax: "Integrated",
      range: "24×7",
      speed: "All Airlines",
    },
  ];
  const ref = useRef<HTMLDivElement>(null);
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 md:py-36" style={{ background: C.bg }}>
      <div className="mx-auto max-w-[1480px] px-4 sm:px-8 md:px-14">
        <div className="flex items-end justify-between gap-8">
          <div>
            <SectionLabel index="06" label="Flagship Airports" />
            <h2 className="mt-5 sm:mt-8 text-[clamp(2.1rem,5vw,4.4rem)] leading-[1.02]" style={display}>
              Our{" "}
              <span className="italic" style={{ color: C.teal }}>
                signature
              </span>{" "}
              terminals.
            </h2>
          </div>
          <div className="hidden gap-2 md:flex" style={mono}>
            <button
              aria-label="Previous"
              onClick={() => ref.current?.scrollBy({ left: -480, behavior: "smooth" })}
              className="h-12 w-12 transition cursor-pointer"
              style={{ border: `1px solid ${C.line}`, color: C.ink }}
            >
              ←
            </button>
            <button
              aria-label="Next"
              onClick={() => ref.current?.scrollBy({ left: 480, behavior: "smooth" })}
              className="h-12 w-12 transition cursor-pointer"
              style={{ border: `1px solid ${C.line}`, color: C.ink }}
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div
        ref={ref}
        className="mt-8 sm:mt-10 flex snap-x snap-mandatory gap-4 sm:gap-5 overflow-x-auto px-4 pb-6 sm:px-8 md:px-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-0"
      >
        {fleet.map((f, i) => (
          <motion.article
            key={f.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.08 }}
            className="group relative w-[85vw] max-w-[340px] sm:max-w-none sm:w-[460px] shrink-0 snap-start overflow-hidden rounded-2xl"
            style={{ background: C.paper, border: `1px solid ${C.line}` }}
          >

            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={f.img}
                alt={f.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1600ms] group-hover:scale-110"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(13,42,54,0.6), transparent)" }}
              />
              <div
                className="absolute left-5 top-5 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.3em]"
                style={{ ...mono, background: C.mint, color: C.ink }}
              >
                {f.cat}
              </div>
            </div>
            <div className="p-7">
              <h3 className="text-[24px] leading-tight" style={display}>
                {f.name}
              </h3>
              <div
                className="mt-6 grid grid-cols-3 gap-4 pt-6"
                style={{ ...mono, borderTop: `1px solid ${C.line}` }}
              >
                <Spec label="Terminals" value={f.pax} />
                <Spec label="Hours" value={f.range} />
                <Spec label="Coverage" value={f.speed} />
              </div>
              <div
                className="mt-6 flex items-center justify-between text-[10px] uppercase tracking-[0.3em]"
                style={{ ...mono, color: C.mute }}
              >
                <span>Available</span>
                <span className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full"
                    style={{ background: C.mint }}
                  />
                  Live
                </span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.3em]" style={{ color: C.mute }}>
        {label}
      </div>
      <div className="mt-1 text-[13px]" style={{ color: C.ink }}>
        {value}
      </div>
    </div>
  );
}

