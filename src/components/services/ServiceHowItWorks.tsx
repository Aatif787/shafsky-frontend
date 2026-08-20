import React from "react";
import { motion } from "framer-motion";
import { Compass, Sparkles } from "lucide-react";
import { FadeInView } from "@/components/ui/interactions";

export interface TimelineStep {
  number: string;
  title: string;
  description: string;
  badge?: string;
}

interface ServiceHowItWorksProps {
  serviceName: string;
  steps?: TimelineStep[];
}

export function ServiceHowItWorks({ serviceName, steps }: ServiceHowItWorksProps) {
  const defaultSteps: TimelineStep[] = [
    {
      number: "01",
      title: "Reservation & Flight Manifest Liaison",
      description: "Submit flight details online or via 24/7 desk. Our operations team coordinates directly with airport security and ground handlers.",
      badge: "Step 1: Staging",
    },
    {
      number: "02",
      title: "Host Greeting & Aerobridge Placard Welcome",
      description: "Upon arrival or terminal curbside drop-off, your dedicated Guest Relations Officer welcomes you with placard identification.",
      badge: "Step 2: Welcome",
    },
    {
      number: "03",
      title: "Fast-Track Clearance & Porter Handling",
      description: "Bypass main immigration and security lines via diplomatic lanes while dedicated porters deliver check-in/arrival luggage.",
      badge: "Step 3: Expedite",
    },
    {
      number: "04",
      title: "Lounge Sanctuary or Limousine Handoff",
      description: "Relax in a private VIP lounge or proceed directly to your chauffeured tarmac Maybach transfer for destination arrival.",
      badge: "Step 4: Completion",
    },
  ];

  const timeline = steps || defaultSteps;

  return (
    <section id="how-it-works" className="my-24 relative">
      <FadeInView>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono uppercase tracking-[0.3em] font-bold">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>End-to-End Execution Protocol</span>
          </div>

          <h2 className="mt-4 text-3xl sm:text-5xl font-heading font-bold text-slate-900">
            How <span className="text-emerald-700">{serviceName}</span> Works.
          </h2>

          <p className="mt-3 text-xs sm:text-sm text-slate-600 font-sans font-medium">
            A seamless 4-step concierge journey designed for absolute precision and zero effort.
          </p>
        </div>
      </FadeInView>

      {/* TIMELINE STEPS GRID */}
      <div className="relative max-w-5xl mx-auto">
        {/* Connecting Vertical Line (Desktop) */}
        <div className="hidden lg:block absolute left-1/2 top-10 bottom-10 w-0.5 -translate-x-1/2 bg-emerald-300 opacity-60" />

        <div className="space-y-10 lg:space-y-16">
          {timeline.map((step, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`flex flex-col lg:flex-row items-center gap-8 ${
                  isEven ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Content Box */}
                <div className="w-full lg:w-1/2">
                  <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 transition-all duration-300 shadow-xs hover:shadow-md relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-heading font-bold text-emerald-700">
                        {step.number}
                      </span>
                      {step.badge && (
                        <span className="text-[9px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                          {step.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-heading font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed font-sans">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Center Node Badge */}
                <div className="relative z-10 shrink-0 w-12 h-12 rounded-full bg-emerald-600 text-white font-mono font-bold text-sm flex items-center justify-center shadow-sm">
                  {step.number}
                </div>

                <div className="hidden lg:block w-1/2" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
