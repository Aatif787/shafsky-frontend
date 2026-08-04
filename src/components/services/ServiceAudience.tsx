import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Users, Crown, Building2, HeartPulse, Globe2, Sparkles, Check } from "lucide-react";
import { TiltCard, FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/interactions";

export interface PersonaItem {
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  perks: string[];
}

interface ServiceAudienceProps {
  serviceName: string;
  audiences?: PersonaItem[];
}

export function ServiceAudience({ serviceName, audiences }: ServiceAudienceProps) {
  const defaultAudiences: PersonaItem[] = [
    {
      title: "Business Executives",
      subtitle: "Maximizing Productive Transit",
      description: "Fast-track queue bypass and quiet VIP lounge workstations ensure uninterrupted work between flights.",
      icon: Briefcase,
      perks: ["Zero queue delays", "Private lounge Wi-Fi", "Dedicated escort"],
    },
    {
      title: "Traveling Families",
      subtitle: "Effortless Group Transit",
      description: "Dedicated baggage porters and single-host escort keep multi-generational families organized and comfortable.",
      icon: Users,
      perks: ["Group baggage handling", "Child/elderly priority", "Direct gate guidance"],
    },
    {
      title: "VIP & Diplomatic Guests",
      subtitle: "Absolute Privacy & Security",
      description: "Discreet aerobridge welcoming, tarmac limousine handoffs, and confidential diplomatic desk handling.",
      icon: Crown,
      perks: ["Discreet name placarding", "Tarmac Maybach transfer", "100% Privacy"],
    },
    {
      title: "Corporate Delegations",
      subtitle: "Seamless Group Logistics",
      description: "Multi-host coordination for corporate retreats, trade delegations, and executive summits.",
      icon: Building2,
      perks: ["Synchronized arrival", "Coordinated luxury vans", "Billing accounts"],
    },
    {
      title: "Medical & Elderly Travelers",
      subtitle: "Special Care & Mobility Support",
      description: "Airside wheelchair assistance, medical companion liaison, and priority terminal buggy transit.",
      icon: HeartPulse,
      perks: ["Wheelchair staging", "Tarmac ramp assistance", "Caregiver support"],
    },
    {
      title: "International Passengers",
      subtitle: "Language & Visa Assistance",
      description: "Multilingual host support for smooth visa-on-arrival processing and international transit.",
      icon: Globe2,
      perks: ["Multilingual hosts", "Visa desk clearance", "Currency exchange guide"],
    },
  ];

  const items = audiences || defaultAudiences;

  return (
    <section className="my-24 relative">
      <FadeInView>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#c5a059]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tailored Personas</span>
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white">
              Who Is <span className="text-[#c5a059]">{serviceName}</span> For?
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-white/60 font-sans max-w-xl">
            Bespoke concierge protocols engineered specifically for distinct travel requirements.
          </p>
        </div>
      </FadeInView>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((persona, idx) => {
          const Icon = persona.icon || Crown;
          return (
            <StaggerItem key={idx}>
              <TiltCard maxTilt={8} scale={1.02} className="rounded-3xl h-full">
                <div className="p-7 rounded-3xl bg-[#0e131d]/90 border border-white/10 hover:border-[#c5a059]/50 transition-all duration-300 shadow-xl relative overflow-hidden h-full flex flex-col justify-between group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#c5a059]/5 rounded-full blur-xl group-hover:bg-[#c5a059]/15 transition-all pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059] group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[9px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">
                        {persona.subtitle}
                      </span>
                    </div>

                    <h3 className="text-xl font-heading text-white font-bold group-hover:text-[#c5a059] transition-colors">
                      {persona.title}
                    </h3>

                    <p className="mt-2.5 text-xs text-white/65 leading-relaxed font-sans">
                      {persona.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 space-y-1.5">
                    {persona.perks.map((perk, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2 text-[10px] font-mono text-white/70">
                        <Check className="w-3 h-3 text-[#c5a059]" />
                        <span>{perk}</span>
                      </div>
                    ))}
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
