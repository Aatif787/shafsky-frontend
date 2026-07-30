import React from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Ticket,
  Car,
  Hotel,
  ShieldCheck,
  Sparkles,
  Clock,
  CheckCircle2,
  Award,
} from "lucide-react";
import type { Airport } from "@/data/airports";

interface AirportHighlightsProps {
  a: Airport;
}

export function AirportHighlights({ a }: AirportHighlightsProps) {
  const highlights = [
    {
      step: "01",
      title: "Aerobridge / Curbside Placard Welcome",
      desc: "A uniformed Guest Relations Officer meets you immediately upon aircraft exit or terminal drop-off holding a discrete personalized placard.",
      icon: Crown,
      badge: "Flagship Escort",
    },
    {
      step: "02",
      title: "Diplomatic Fast-Track Clearance",
      desc: "Bypass main immigration and security queues via priority diplomatic lanes, reducing terminal wait times by up to 90 minutes.",
      icon: Ticket,
      badge: "Express Priority",
    },
    {
      step: "03",
      title: "Insured Baggage Porterage",
      desc: "Dedicated luggage porters take immediate delivery of all check-in or arrival bags, managing transfer to limousine or lounge.",
      icon: ShieldCheck,
      badge: "White-Glove Care",
    },
    {
      step: "04",
      title: "Tarmac Limousine & VIP Suite Handoff",
      desc: "Private airside sedan transfer across the tarmac directly between the VIP lounge sanctuary and your aircraft steps.",
      icon: Car,
      badge: "Tarmac Maybach",
    },
  ];

  return (
    <section className="my-20 relative">
      {/* SECTION HEADER */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#5fb5ad]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Shafsky Standard at {a.code}</span>
        </div>
        <h2
          className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-white"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Service Highlights & <span className="italic text-[#c5a059]">Excellence.</span>
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-white/60 font-sans max-w-2xl">
          Four signature pillars of our airside guest relations protocol at {a.airport.name || a.city}.
        </p>
      </div>

      {/* HIGHLIGHTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {highlights.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="p-7 rounded-3xl bg-[#0e131d]/90 border border-white/10 hover:border-[#c5a059]/50 transition-all duration-300 shadow-2xl relative overflow-hidden flex flex-col justify-between group"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-[#c5a059]/5 rounded-full blur-xl group-hover:bg-[#c5a059]/15 transition-all pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <span
                    className="text-3xl font-serif font-bold text-[#c5a059]"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059]">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3
                  className="text-lg font-serif text-white font-medium group-hover:text-[#c5a059] transition-colors leading-snug"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {item.title}
                </h3>

                <p className="mt-3 text-xs text-white/60 leading-relaxed font-sans">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#5fb5ad]">
                  {item.badge}
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#c5a059]" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
