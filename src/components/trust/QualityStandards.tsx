import React from "react";
import { motion } from "framer-motion";
import { Headphones, ShieldCheck, Award, Sparkles, Globe, Compass, CheckCircle2 } from "lucide-react";
import { TiltCard, FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/interactions";

export interface QualityPillar {
  title: string;
  description: string;
  icon: any;
  badge?: string;
}

interface QualityStandardsProps {
  pillars?: QualityPillar[];
  title?: string;
  className?: string;
}

export function QualityStandards({
  pillars,
  title = "Uncompromising Quality & Operational Standards",
  className = "",
}: QualityStandardsProps) {
  const defaultPillars: QualityPillar[] = [
    {
      title: "Professional Airside Coordination",
      description: "Direct liaison with airport security, immigration desks, and ground handlers for seamless guest transition.",
      icon: Compass,
      badge: "Seamless Flow",
    },
    {
      title: "24/7 Real-Time Radar Telemetry",
      description: "Flight radar tracking guarantees host staging at aerobridges regardless of flight delays or early landings.",
      icon: Headphones,
      badge: "24/7 Staged",
    },
    {
      title: "Experienced Officer Team",
      description: "Uniformed Guest Relations Officers trained under diplomatic protocol and VIP hospitality benchmarks.",
      icon: Award,
      badge: "Trained Escort",
    },
    {
      title: "Premium Service Quality",
      description: "White-glove luggage handling, private Maybach tarmac transfers, and private lounge suite access.",
      icon: Sparkles,
      badge: "White-Glove",
    },
    {
      title: "International Diplomatic Standards",
      description: "100% confidentiality, diplomatic clearance compliance, and non-disclosure privacy protocols.",
      icon: Globe,
      badge: "Diplomatic",
    },
  ];

  const items = pillars || defaultPillars;

  return (
    <section className={`my-20 relative ${className}`}>
      <FadeInView>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#5fb5ad]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Service Integrity</span>
            </div>
            <h2
              className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-white"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-white/60 font-sans max-w-xl">
            Built on strict operational SOPs, diplomatic discretion, and round-the-clock telemetry monitoring.
          </p>
        </div>
      </FadeInView>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => {
          const Icon = item.icon || ShieldCheck;
          return (
            <StaggerItem key={idx}>
              <TiltCard maxTilt={8} scale={1.02} className="rounded-3xl h-full">
                <div className="p-7 rounded-3xl bg-[#0e131d]/90 border border-white/10 hover:border-[#5fb5ad]/50 transition-all duration-300 shadow-xl relative overflow-hidden h-full flex flex-col justify-between group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#5fb5ad]/5 rounded-full blur-xl group-hover:bg-[#5fb5ad]/15 transition-all pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-[#5fb5ad]/10 border border-[#5fb5ad]/30 flex items-center justify-center text-[#5fb5ad] group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-[#5fb5ad] border border-[#5fb5ad]/20">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <h3
                      className="text-xl font-serif text-white font-medium group-hover:text-[#5fb5ad] transition-colors leading-snug"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {item.title}
                    </h3>

                    <p className="mt-2.5 text-xs text-white/65 leading-relaxed font-sans">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-[10px] font-mono text-white/50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5fb5ad]" />
                    <span>Verified Compliance</span>
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
