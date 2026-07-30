import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, Sparkles } from "lucide-react";
import type { Airport } from "@/data/airports";

interface AirportFAQProps {
  a: Airport;
}

export function AirportFAQ({ a }: AirportFAQProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const defaultFaqs: [string, string][] = [
    [
      `How early should I book Meet & Greet at ${a.code}?`,
      `We recommend reserving at least 12–24 hours prior to flight departure or arrival to ensure host staging at ${a.airport.name || a.city}. Emergency requests within 4 hours can be accommodated via our 24/7 hotline.`
    ],
    [
      `Where will my guest relations officer meet me at ${a.city}?`,
      `For arrivals, your officer holding a discrete placard meets you directly at the aerobridge exit or tarmac steps. For departures, your host meets you at curbside drop-off.`
    ],
    [
      `Are fast-track immigration and lounge access included at ${a.code}?`,
      `Yes, Meet & Greet packages at ${a.code} include priority fast-track immigration desk clearance and complimentary access to premium VIP lounges.`
    ],
    [
      `Can families or VIP delegations book together at ${a.city}?`,
      `Absolutely. One dedicated officer coordinates your entire family or executive delegation with dedicated luggage porters and group escort.`
    ]
  ];

  const faqsList = a.faqs && a.faqs.length > 0 ? a.faqs : defaultFaqs;

  return (
    <section className="my-20 relative max-w-4xl mx-auto">
      {/* SECTION HEADER */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#c5a059] text-[10px] font-mono uppercase tracking-[0.3em]">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Airport Intelligence</span>
        </div>
        <h2
          className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-white"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Frequently Asked Questions at <span className="italic text-[#c5a059]">{a.city}</span>.
        </h2>
      </div>

      {/* ACCORDION FAQ CARDS */}
      <div className="space-y-4">
        {faqsList.map(([q, ans], idx) => {
          const isOpen = openIdx === idx;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="rounded-3xl bg-[#0e131d]/90 border border-white/10 overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <span
                  className="text-base sm:text-lg font-serif font-medium text-white flex items-center gap-3"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  <Sparkles className="w-4 h-4 text-[#c5a059] shrink-0" />
                  {q}
                </span>
                <div
                  className={`w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#c5a059] shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180 bg-[#c5a059]/20" : ""
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-white/70 leading-relaxed font-sans border-t border-white/5">
                      {ans}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
