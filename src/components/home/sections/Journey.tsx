import React from "react";
import { motion } from "framer-motion";
import { Calendar, ShieldCheck, Crown, Sparkles, Car, Headphones } from "lucide-react";
import { C, display, mono } from "../theme";

export function Journey() {
  const steps = [
    {
      title: "Reservation & Flight Details",
      desc: "Tell us your flight number and requirements — arrival, departure, connection or private charter.",
      icon: Calendar,
      tag: "Step 01",
    },
    {
      title: "Officer Assignment",
      desc: "Instant confirmation with your dedicated Guest Relations Officer assigned directly to your mission.",
      icon: ShieldCheck,
      tag: "Step 02",
    },
    {
      title: "Personal Reception",
      desc: "Meet your officer the moment you arrive — at the aircraft aerobridge or curbside VIP terminal gate.",
      icon: Crown,
      tag: "Step 03",
    },
    {
      title: "Fast-Track Clearance",
      desc: "Passport control, customs clearance, and baggage retrieval expedited seamlessly with zero queuing.",
      icon: Sparkles,
      tag: "Step 04",
    },
    {
      title: "Lounge & Chauffeur Transfer",
      desc: "Relax in the executive lounge sanctuary or step directly into your chauffeured luxury tarmac vehicle.",
      icon: Car,
      tag: "Step 05",
    },
    {
      title: "Dedicated After-Care",
      desc: "Our operations desk remains on watch until your onward flight and destination arrival are fully completed.",
      icon: Headphones,
      tag: "Step 06",
    },
  ];

  return (
    <section className="relative px-4 py-20 sm:px-8 sm:py-28 md:px-14 md:py-36 bg-[#fbf9f5] border-b border-[#e8dfc8]">
      <div className="mx-auto max-w-[1480px]">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <div
            className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.45em] text-[#a88b4a] font-bold"
            style={mono}
          >
            <span className="h-px w-10 bg-[#c5a869]/50" />
            THE GUEST JOURNEY
            <span className="h-px w-10 bg-[#c5a869]/50" />
          </div>
          <h2
            className="mt-5 text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.05] text-slate-950 font-normal"
            style={display}
          >
            Six steps.{" "}
            <span
              className="italic font-normal"
              style={{
                background: "linear-gradient(135deg, #a88b4a 0%, #c5a869 50%, #8c733b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              One signature standard.
            </span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-normal">
            From initial itinerary submission to final arrival, experience uninterrupted precision and warm hospitality.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {steps.map((s, idx) => {
            const SIcon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="relative rounded-2xl bg-white border border-[#e8dfc8] p-7 shadow-xs hover:border-[#c5a869] hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-11 w-11 rounded-xl bg-[#fbf9f5] border border-[#e8dfc8] text-[#a88b4a] flex items-center justify-center group-hover:bg-[#050b14] group-hover:text-[#d9c18b] group-hover:border-[#c5a869]/40 transition-all duration-300">
                      <SIcon size={20} />
                    </div>
                    <span
                      className="text-[9.5px] font-mono uppercase tracking-widest text-[#a88b4a] font-bold px-3 py-1 rounded-full bg-[#fbf9f5] border border-[#e8dfc8]"
                      style={mono}
                    >
                      {s.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-normal text-slate-950 leading-snug" style={display}>
                    {s.title}
                  </h3>
                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed font-normal">
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
