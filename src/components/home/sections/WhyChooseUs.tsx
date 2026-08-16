import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Headphones, Award, Globe2, Clock, Sparkles, Plane, Users } from "lucide-react";
import { C, display, mono } from "../theme";

export function WhyChooseUs() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Established 2022",
      body: "Built for modern private aviation, putting safety, luxury, and absolute discretion at the core of every operation.",
    },
    {
      icon: Headphones,
      title: "24×7 Concierge",
      body: "Round-the-clock support across every time zone — one call, one signature experience.",
    },
    {
      icon: Globe2,
      title: "Pan-India + Global Network",
      body: "Live operations at 20 Indian airports with standing slot agreements.",
    },
    {
      icon: Sparkles,
      title: "Suswagatam Hospitality",
      body: "Warm Indian welcome paired with world-class professionalism — every guest, every flight.",
    },
    {
      icon: Clock,
      title: "Fast-Track Everything",
      body: "Skip the queues. Immigration, security and baggage handled before you even arrive.",
    },
    {
      icon: Award,
      title: "Elite Standards",
      body: "Vetted by family offices, diplomatic delegations, and Fortune 500 boards for seamless flight operations.",
    },
    {
      icon: Users,
      title: "Dedicated Personal Escort",
      body: "A single point of accountability from kerbside to cabin — never a handoff, never a wait.",
    },
    {
      icon: Plane,
      title: "End-to-end Travel",
      body: "Meet & Greet, lounge access, premium transport and hotel booking services — one team.",
    },
  ];
  return (
    <section
      id="why"
      className="relative px-6 py-16 md:px-14 md:py-36"
      style={{ background: C.paper }}
    >
      <div className="mx-auto max-w-[1480px]">
        <div className="text-center">
          <div
            className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.45em]"
            style={{ ...mono, color: C.teal }}
          >
            <span className="h-px w-10" style={{ background: C.teal }} />
            Why Choose Shafsky
            <span className="h-px w-10" style={{ background: C.teal }} />
          </div>
          <h2
            className="mx-auto mt-6 max-w-3xl text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.05]"
            style={display}
          >
            The standard the rest{" "}
            <span className="italic" style={{ color: C.teal }}>
              measure
            </span>{" "}
            against.
          </h2>
          <div className="mx-auto mt-6 flex items-center justify-center gap-4">
            <span className="h-px w-16" style={{ background: C.mint }} />
            <Plane className="h-4 w-4 -rotate-45" style={{ color: C.teal }} />
            <span className="h-px w-16" style={{ background: C.mint }} />
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: (i % 4) * 0.06 }}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] bg-[#f5f0e6] border border-white/60 p-7 shadow-[8px_8px_16px_rgba(200,188,170,0.65),-8px_-8px_16px_rgba(255,255,255,0.95)] transition-all duration-300 hover:shadow-[14px_14px_28px_rgba(190,178,160,0.75),-14px_-14px_28px_rgba(255,255,255,1)]"
              >
                <div>
                  <div
                    className="grid h-12 w-12 place-items-center rounded-xl bg-[#f5f0e6] border border-white/80 shadow-[4px_4px_8px_rgba(200,188,170,0.6),-4px_-4px_8px_rgba(255,255,255,0.9)] transition-all duration-300 group-hover:shadow-[inset_3px_3px_6px_rgba(200,188,170,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]"
                    style={{ color: C.teal }}
                  >
                    <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold leading-tight text-[#0b1a24]" style={display}>
                    {it.title}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-[#576875]">
                    {it.body}
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
