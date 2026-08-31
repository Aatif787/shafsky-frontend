import React, { useRef } from "react";
import { motion } from "framer-motion";
import { C, display, mono } from "../theme";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Plane, ShieldCheck, Compass, Sparkles } from "lucide-react";

export function Fleet() {
  const fleet = [
    {
      name: "Ultra-Long Range Heavy Jets",
      cat: "Gulfstream G650 / Global 6000",
      pax: "14 – 16 Pax",
      range: "7,000+ nm",
      speed: "Mach 0.90",
      desc: "Intercontinental non-stop flight capability with private master stateroom and bespoke Michelin dining.",
    },
    {
      name: "Super Midsize Executive Jets",
      cat: "Challenger 350 / Falcon 2000",
      pax: "8 – 10 Pax",
      range: "3,200 nm",
      speed: "Mach 0.82",
      desc: "Optimal balance of transcontinental speed, generous stand-up cabin, and short runway access.",
    },
    {
      name: "Light Executive Jets",
      cat: "Phenom 300 / Citation XLS",
      pax: "6 – 8 Pax",
      range: "1,900 nm",
      speed: "Mach 0.78",
      desc: "Agile domestic and regional private charter for rapid business day-trips with minimal notice.",
    },
    {
      name: "Twin-Engine Helicopters",
      cat: "Leonardo AW139 / Bell 429",
      pax: "6 – 8 Pax",
      range: "500 nm",
      speed: "160 kts",
      desc: "Point-to-point transfers connecting metropolitan hubs directly to private estates and helipads.",
    },
  ];

  const ref = useRef<HTMLDivElement>(null);

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 md:py-36 bg-[#050b14] border-b border-[#c5a869]/20">
      <div className="mx-auto max-w-[1480px] px-4 sm:px-8 md:px-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div
              className="inline-flex items-center gap-3 text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.35em] sm:tracking-[0.45em] text-[#d9c18b] font-bold"
              style={mono}
            >
              <span className="h-px w-8 bg-[#c5a869]/50" />
              <span>PRIVATE AVIATION FLEET</span>
            </div>
            <h2 className="mt-4 sm:mt-5 text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.05] text-white font-normal" style={display}>
              Executive Aircraft{" "}
              <span
                className="italic font-normal"
                style={{
                  background: "linear-gradient(135deg, #d9c18b 0%, #c5a869 50%, #fef3e2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Categories.
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/charter"
              className="hidden sm:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d9c18b] hover:text-white transition-colors"
              style={mono}
            >
              <span>View Full Fleet Guide</span>
              <ArrowRight size={14} />
            </Link>

            <div className="flex gap-2" style={mono}>
              <button
                aria-label="Previous"
                onClick={() => ref.current?.scrollBy({ left: -480, behavior: "smooth" })}
                className="h-11 w-11 rounded-xl bg-[#0a1424] border border-[#c5a869]/30 text-[#d9c18b] hover:border-[#c5a869] hover:bg-[#11223b] flex items-center justify-center transition cursor-pointer"
              >
                ←
              </button>
              <button
                aria-label="Next"
                onClick={() => ref.current?.scrollBy({ left: 480, behavior: "smooth" })}
                className="h-11 w-11 rounded-xl bg-[#0a1424] border border-[#c5a869]/30 text-[#d9c18b] hover:border-[#c5a869] hover:bg-[#11223b] flex items-center justify-center transition cursor-pointer"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={ref}
        className="mt-10 sm:mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-6 sm:px-8 md:px-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {fleet.map((f, i) => (
          <motion.article
            key={f.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="group relative w-[85vw] max-w-[340px] sm:max-w-none sm:w-[420px] shrink-0 snap-start overflow-hidden rounded-2xl bg-[#0a1424] border border-[#c5a869]/25 p-7 shadow-xl hover:border-[#c5a869]/60 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="h-11 w-11 rounded-xl bg-[#11223b] border border-[#c5a869]/30 text-[#d9c18b] flex items-center justify-center">
                  <Plane size={20} />
                </div>
                <div
                  className="rounded-full px-3 py-1 text-[9px] uppercase tracking-[0.25em] bg-[#050b14] text-[#d9c18b] border border-[#c5a869]/40 font-bold"
                  style={mono}
                >
                  {f.cat}
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl leading-tight text-white font-normal" style={display}>
                {f.name}
              </h3>
              <p className="mt-3 text-xs text-slate-300 leading-relaxed font-light">
                {f.desc}
              </p>

              <div
                className="mt-6 grid grid-cols-3 gap-3 pt-5 border-t border-white/10"
                style={mono}
              >
                <div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[#a88b4a]">Capacity</div>
                  <div className="mt-1 text-xs font-bold text-white">{f.pax}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[#a88b4a]">Range</div>
                  <div className="mt-1 text-xs font-bold text-white">{f.range}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[#a88b4a]">Speed</div>
                  <div className="mt-1 text-xs font-bold text-white">{f.speed}</div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between">
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#d9c18b]" style={mono}>
                <span className="h-1.5 w-1.5 rounded-full bg-[#c5a869] animate-pulse" />
                24/7 Dispatch
              </span>
              <Link
                to="/charter"
                className="text-xs font-bold text-white hover:text-[#d9c18b] flex items-center gap-1 group/link"
                style={mono}
              >
                <span>Request Quote</span>
                <ArrowRight size={12} className="transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
