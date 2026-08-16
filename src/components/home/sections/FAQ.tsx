import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { C, display, mono } from "../theme";
import { SectionLabel } from "./SectionLabel";

export function FAQ() {
  const faqs = [
    [
      "What is Suswagatam Meet & Greet?",
      "Suswagatam is Shafsky Aviation's signature welcome and assist service for domestic and international passengers across Indian airports — escort, fast-track, lounge, transport and more.",
    ],
    [
      "Which airports do you cover?",
      "We operate at 20 Indian airports including Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Goa, Kochi and Jaipur.",
    ],
    [
      "How do I book?",
      "Use the booking panel above. Choose Arrival, Departure or Connection, enter your flight number and date, and we'll confirm in minutes.",
    ],
    [
      "Do you accept last-minute bookings?",
      "Yes. We accept bookings up to 6 hours before departure (except 23:00–06:00 hrs). For urgent assistance, contact our 24×7 support.",
    ],
    [
      "Is the service available for groups?",
      "Absolutely — families, corporate teams and tour groups are welcome. Tell us your party size in the booking form.",
    ],
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative px-6 py-16 md:px-14 md:py-36" style={{ background: C.paper }}>
      <div className="mx-auto grid max-w-[1480px] gap-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <SectionLabel index="09" label="FAQ" />
          <h2 className="mt-8 text-[clamp(2rem,4vw,3.5rem)] leading-[1.02]" style={display}>
            Frequently{" "}
            <span className="italic" style={{ color: C.teal }}>
              asked.
            </span>
          </h2>
          <p className="mt-6 max-w-xs text-[14px]" style={{ color: C.mute }}>
            Or chat with us on WhatsApp at <strong style={{ color: C.ink }}>+91 9599087959</strong>.
          </p>
        </div>
        <div className="md:col-span-8">
          {faqs.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={q} style={{ borderBottom: `1px solid ${C.line}` }}>
                <button
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="flex items-baseline gap-6">
                    <span
                      className="text-[10px] tracking-[0.3em]"
                      style={{ ...mono, color: C.teal }}
                    >
                      0{i + 1}
                    </span>
                    <span
                      className="text-[clamp(1.05rem,1.5vw,1.35rem)]"
                      style={{ ...display, color: C.ink }}
                    >
                      {q}
                    </span>
                  </span>
                  <span
                    className={`transition-transform duration-500 ${isOpen ? "rotate-45" : ""}`}
                    style={{ color: C.teal }}
                  >
                    +
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-7 pl-14 text-[14px] leading-relaxed" style={{ color: C.mute }}>
                    {a}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

