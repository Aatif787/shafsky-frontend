import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, Sparkles } from "lucide-react";
import { FadeInView } from "@/components/ui/interactions";

export interface FAQPair {
  q: string;
  a: string;
}

interface ServiceFAQProps {
  serviceName: string;
  faqs?: FAQPair[];
}

export function ServiceFAQ({ serviceName, faqs }: ServiceFAQProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const defaultFaqs: FAQPair[] = [
    {
      q: `How far in advance should I book ${serviceName}?`,
      a: `We recommend booking at least 12–24 hours prior to flight departure or arrival to guarantee host staging. For emergency requests within 4 hours, contact our 24/7 command hotline directly.`,
    },
    {
      q: `Where will my Guest Relations Officer meet me?`,
      a: `For flight arrivals, your officer meets you directly at the aerobridge jet-bridge exit holding a discrete name placard. For flight departures, your host greets you at airport curbside drop-off.`,
    },
    {
      q: `What happens if my flight is delayed or arrives early?`,
      a: `Our operations desk actively monitors real-time flight telemetry radar. Your officer's staging time automatically adjusts to your actual flight arrival, ensuring seamless greeting regardless of flight schedule changes.`,
    },
    {
      q: `Can I book for multiple family members or a VIP delegation?`,
      a: `Yes. Single or multi-host teams can be assigned to manage large family groups, corporate delegations, or VIP entourages with synchronized luggage porterage and priority clearance.`,
    },
  ];

  const items = faqs || defaultFaqs;

  return (
    <section className="my-24 relative max-w-4xl mx-auto">
      <FadeInView>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono uppercase tracking-[0.3em] font-bold">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Service Intelligence</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900">
            Frequently Asked Questions about <span className="italic text-emerald-700">{serviceName}</span>.
          </h2>
        </div>
      </FadeInView>

      <div className="space-y-3.5">
        {items.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="rounded-3xl bg-white border border-slate-200 overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <span className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  {item.q}
                </span>
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 bg-emerald-600 border-emerald-600 text-white" : "bg-slate-100 border-slate-200 text-slate-700"
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
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed font-sans border-t border-slate-100">
                      {item.a}
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
