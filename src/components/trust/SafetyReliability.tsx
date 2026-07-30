import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, UserCheck, Compass, Headphones, Sparkles, CheckCircle2 } from "lucide-react";
import { TiltCard, FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/interactions";

export interface SafetyPillar {
  title: string;
  desc: string;
  icon: any;
  badge: string;
}

export function SafetyReliability() {
  const pillars: SafetyPillar[] = [
    {
      title: "100% Guaranteed Guest Confidentiality",
      desc: "Strict passenger manifest non-disclosure protocols and private tarmac handling for high-net-worth individuals, celebrities, and diplomats.",
      icon: Lock,
      badge: "Absolute Privacy",
    },
    {
      title: "Vetted Uniformed Airside Staff",
      desc: "Every Guest Relations Officer undergoes background verification, airport security credentialing, and diplomatic etiquette training.",
      icon: UserCheck,
      badge: "Verified Staff",
    },
    {
      title: "Airport Aerobridge Expertise",
      desc: "Deep operational familiarity with terminal concourses, aerobridge gate layouts, diplomatic lounges, and customs entry protocols.",
      icon: Compass,
      badge: "Airport Expertise",
    },
    {
      title: "24/7 Command Support & Telemetry",
      desc: "Our centralized command desk maintains continuous flight radar surveillance to ensure immediate host staging.",
      icon: Headphones,
      badge: "24/7 Command",
    },
  ];

  return (
    <section className="my-20 relative">
      <FadeInView>
        <div className="p-8 sm:p-12 rounded-[36px] bg-gradient-to-br from-[#0c1422] via-[#080d16] to-[#04070e] border border-[#c5a059]/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />

          {/* SECTION HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#c5a059]">
                <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
                <span>Safety, Security & Privacy</span>
              </div>
              <h2
                className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-white"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Unwavering Safety & Confidentiality
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/70 font-sans max-w-xl">
              We uphold strict international safety standards, insured luggage handling, and total privacy for every flight.
            </p>
          </div>

          {/* PILLARS GRID */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {pillars.map((p, idx) => {
              const Icon = p.icon || ShieldCheck;
              return (
                <StaggerItem key={idx}>
                  <TiltCard maxTilt={6} scale={1.01} className="rounded-3xl h-full">
                    <div className="p-7 rounded-3xl bg-[#09111c]/90 border border-white/10 hover:border-[#c5a059]/50 transition-all duration-300 shadow-xl flex items-start gap-5 h-full group">
                      <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/15 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <h3
                            className="text-lg font-serif font-medium text-white group-hover:text-[#c5a059] transition-colors"
                            style={{ fontFamily: "'Fraunces', serif" }}
                          >
                            {p.title}
                          </h3>
                          <span className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/5 text-[#c5a059] border border-[#c5a059]/20 shrink-0">
                            {p.badge}
                          </span>
                        </div>

                        <p className="text-xs text-white/65 leading-relaxed font-sans">
                          {p.desc}
                        </p>
                      </div>
                    </div>
                  </TiltCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </FadeInView>
    </section>
  );
}
