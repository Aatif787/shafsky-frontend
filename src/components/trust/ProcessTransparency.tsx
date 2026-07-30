import React from "react";
import { motion } from "framer-motion";
import { CalendarCheck, ShieldCheck, Radio, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { TiltCard, FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/interactions";

export interface TimelineStep {
  step: string;
  title: string;
  description: string;
  icon: any;
  badge: string;
}

export function ProcessTransparency() {
  const steps: TimelineStep[] = [
    {
      step: "01",
      title: "Instant Reservation & Itinerary Filing",
      description: "Submit your flight number, date, passenger headcount, and specific airside requirements in under 60 seconds.",
      icon: CalendarCheck,
      badge: "Step 1: Reservation",
    },
    {
      step: "02",
      title: "Command Desk Confirmation",
      description: "Our 24/7 command desk verifies Air Waybills, flight schedule details, and issues digital guest credentials.",
      icon: ShieldCheck,
      badge: "Step 2: Confirmation",
    },
    {
      step: "03",
      title: "Flight Radar & Telemetry Coordination",
      description: "Live radar tracking monitors your aircraft in real time to stage uniformed officers at the exact gate or terminal drop-off.",
      icon: Radio,
      badge: "Step 3: Coordination",
    },
    {
      step: "04",
      title: "White-Glove Service Delivery",
      description: "Aerobridge placard greeting, fast-track diplomatic queue bypass, baggage handling, and Maybach tarmac departure.",
      icon: CheckCircle2,
      badge: "Step 4: Delivery",
    },
  ];

  return (
    <section className="my-20 relative">
      <FadeInView>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#c5a059]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Operational Clarity</span>
            </div>
            <h2
              className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-white"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              How Shafsky Aviation Works
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-white/60 font-sans max-w-xl">
            A transparent 4-step operational process guaranteeing seamless airside handling from initial request to destination arrival.
          </p>
        </div>
      </FadeInView>

      {/* TIMELINE CARDS GRID */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {/* Connecting Gradient Accent Line for Desktop */}
        <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-gradient-to-r from-[#c5a059]/10 via-[#c5a059]/40 to-[#c5a059]/10 -translate-y-12 pointer-events-none" />

        {steps.map((item, idx) => {
          const Icon = item.icon || CheckCircle2;
          return (
            <StaggerItem key={idx}>
              <TiltCard maxTilt={8} scale={1.02} className="rounded-3xl h-full">
                <div className="p-7 rounded-3xl bg-[#0e131d]/90 border border-white/10 hover:border-[#c5a059]/50 transition-all duration-300 shadow-xl relative overflow-hidden h-full flex flex-col justify-between group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#c5a059]/5 rounded-full blur-xl group-hover:bg-[#c5a059]/15 transition-all pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span
                        className="text-3xl font-serif font-bold text-[#c5a059]"
                        style={{ fontFamily: "'Fraunces', serif" }}
                      >
                        {item.step}
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 text-[#c5a059] border border-[#c5a059]/20">
                        {item.badge}
                      </span>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059] mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3
                      className="text-lg font-serif text-white font-medium group-hover:text-[#c5a059] transition-colors leading-snug"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {item.title}
                    </h3>

                    <p className="mt-2.5 text-xs text-white/65 leading-relaxed font-sans">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/40 group-hover:text-[#c5a059] transition-colors">
                    <span>Verified Protocol</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </TiltCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </section>
  );
}
