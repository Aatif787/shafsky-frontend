import React from "react";
import { motion } from "framer-motion";
import { Calendar, ShieldCheck, Crown, Sparkles, Car, Headphones, Plane } from "lucide-react";
import { C, display } from "../theme";
import { SectionLabel } from "./SectionLabel";

export function Journey() {
  const steps = [
    ["Booking", "Tell us your flight — arrival, departure or connection — in just a few clicks."],
    [
      "Confirmation",
      "Instant quote and confirmation, with your dedicated guest relations officer assigned.",
    ],
    ["Welcome", "Meet your escort the moment you arrive — kerbside or aerobridge, your choice."],
    ["Fast-Track", "Immigration, security and baggage handled while you relax in the lounge."],
    [
      "Premium Transport",
      "Step into your chauffeured car or onward flight — no queue, no friction.",
    ],
    [
      "After-care",
      "We stay on watch until your journey is complete. Feedback shapes every next flight.",
    ],
  ];

  const getStepIcon = (t: string) => {
    const iconProps = { className: "h-5 w-5 text-[#0d5a6e]" };
    switch (t) {
      case "Booking":
        return <Calendar {...iconProps} />;
      case "Confirmation":
        return <ShieldCheck {...iconProps} />;
      case "Welcome":
        return <Crown {...iconProps} />;
      case "Fast-Track":
        return <Sparkles {...iconProps} />;
      case "Premium Transport":
        return <Car {...iconProps} />;
      case "After-care":
        return <Headphones {...iconProps} />;
      default:
        return <Plane {...iconProps} />;
    }
  };

  return (
    <section className="relative px-6 py-16 md:px-14 md:py-36" style={{ background: C.paper }}>
      <div className="mx-auto max-w-[1480px]">
        <SectionLabel index="07" label="Your Journey" />
        <h2 className="mt-8 max-w-3xl text-[clamp(2rem,5vw,4.4rem)] leading-[1.02]" style={display}>
          Six steps.{" "}
          <span className="italic" style={{ color: C.teal }}>
            One signature welcome.
          </span>
        </h2>

        <div className="relative mt-20">
          {/* Vertical center timeline line */}
          <div
            className="absolute left-[22px] top-0 h-full w-px md:left-1/2"
            style={{ background: `linear-gradient(to bottom, ${C.mint}, ${C.line}, transparent)` }}
          />

          {steps.map(([t, d], i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10px" }}
              transition={{ duration: 0.7, delay: 0.05 * i }}
              className={`relative mb-14 grid grid-cols-[44px_1fr] gap-6 md:grid-cols-2 md:gap-16 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""
                }`}
            >
              {/* Timeline Indicator Dot */}
              <div className="relative flex items-start">
                <div
                  className="absolute left-[16px] top-11 h-3 w-3 rounded-full md:left-1/2 md:-translate-x-1/2 z-10"
                  style={{ background: C.teal, boxShadow: `0 0 18px ${C.mint}` }}
                />
              </div>

              {/* Neumorphic Step Card */}
              <motion.div
                whileHover={{
                  scale: 1.02,
                  y: -8,
                  boxShadow: "12px 12px 30px #dcd3c0, -12px -12px 30px #ffffff",
                }}
                className="p-8 rounded-[28px] transition-all duration-300 flex flex-col justify-between"
                style={{
                  background: C.paper,
                  boxShadow: "6px 6px 16px #e8e0d0, -6px -6px 16px #ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                }}
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    {/* Neumorphic icon wrapper */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300"
                      style={{
                        background: C.paper,
                        boxShadow: "inset 3px 3px 6px #e8e0d0, inset -3px -3px 6px #ffffff",
                      }}
                    >
                      {getStepIcon(t)}
                    </div>
                    <h3 className="text-xl font-bold" style={{ ...display, color: C.ink }}>
                      {t}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: C.mute }}>
                    {d}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

