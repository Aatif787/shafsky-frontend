import React from "react";
import { motion } from "framer-motion";
import { Award, Building2, Users, ShieldCheck, Sparkles } from "lucide-react";
import { TiltCard, FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/interactions";

export interface StatItem {
  number: string;
  label: string;
  description: string;
  icon: any;
  highlight?: string;
}

interface TrustStatsProps {
  stats?: StatItem[];
  title?: string;
  className?: string;
}

export function TrustStats({
  stats,
  title = "Aviation Excellence by the Numbers",
  className = "",
}: TrustStatsProps) {
  const defaultStats: StatItem[] = [
    {
      number: "12+",
      label: "Years Excellence",
      description: "Over a decade of orchestrating flagship airside concierge services and private aviation logistics.",
      icon: Award,
      highlight: "Established 2014",
    },
    {
      number: "20",
      label: "Flagship Hubs",
      description: "24/7 dedicated airside host staging across major Indian airports.",
      icon: Building2,
      highlight: "India Network",
    },
    {
      number: "45,000+",
      label: "Guests Escorted",
      description: "Seamless transit provided for VIPs, corporate delegations, diplomats, and traveling families.",
      icon: Users,
      highlight: "100% Satisfaction",
    },
    {
      number: "150+",
      label: "Airside Officers",
      description: "Uniformed Guest Relations Officers staged round-the-clock for flight arrivals and departures.",
      icon: ShieldCheck,
      highlight: "24/7 Staged",
    },
  ];

  const items = stats || defaultStats;

  return (
    <section className={`my-20 relative ${className}`}>
      <FadeInView>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#c5a059]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Track Record & Experience</span>
            </div>
            <h2
              className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-white"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-white/60 font-sans max-w-xl">
            Empirical proof of our operational scale, safety compliance, and guest relations excellence.
          </p>
        </div>
      </FadeInView>

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, idx) => {
          const Icon = item.icon || Award;
          return (
            <StaggerItem key={idx}>
              <TiltCard maxTilt={8} scale={1.02} className="rounded-3xl h-full">
                <div className="p-7 rounded-3xl bg-[#0e131d]/90 border border-white/10 hover:border-[#c5a059]/50 transition-all duration-300 shadow-xl relative overflow-hidden h-full flex flex-col justify-between group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#c5a059]/5 rounded-full blur-xl group-hover:bg-[#c5a059]/20 transition-all pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059] group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      {item.highlight && (
                        <span className="text-[9px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-[#c5a059] border border-[#c5a059]/20">
                          {item.highlight}
                        </span>
                      )}
                    </div>

                    <div
                      className="text-4xl sm:text-5xl font-serif font-bold text-white group-hover:text-[#c5a059] transition-colors tracking-tight"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {item.number}
                    </div>

                    <h3 className="mt-2 text-base font-serif font-medium text-white/90">
                      {item.label}
                    </h3>

                    <p className="mt-2 text-xs text-white/60 leading-relaxed font-sans">
                      {item.description}
                    </p>
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
