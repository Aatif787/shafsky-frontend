import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Check, Crown, ShieldCheck, Zap, Layers, Globe } from "lucide-react";
import { TiltCard, FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/interactions";

export interface FeatureItem {
  title: string;
  desc: string;
  icon?: any;
  tag?: string;
}

interface ServiceFeaturesProps {
  serviceName: string;
  features?: FeatureItem[];
}

export function ServiceFeatures({ serviceName, features }: ServiceFeaturesProps) {
  const defaultFeatures: FeatureItem[] = [
    {
      title: "Aerobridge Placard Welcome",
      desc: "Uniformed officer greets you at the jet-bridge door holding a discrete personalized name badge.",
      icon: Crown,
      tag: "Signature",
    },
    {
      title: "Diplomatic Fast-Track",
      desc: "Priority diplomatic desk clearance bypassing commercial queues for immigration & security.",
      icon: Zap,
      tag: "Priority Queue",
    },
    {
      title: "Baggage Porterage & Escort",
      desc: "Dedicated porter claims check-in luggage directly from the carousel and loads it into your limousine.",
      icon: ShieldCheck,
      tag: "Baggage Care",
    },
    {
      title: "Tarmac Maybach Limousine",
      desc: "Private luxury sedan transport directly across the airside tarmac between aircraft and terminal.",
      icon: Layers,
      tag: "Airside Mobility",
    },
    {
      title: "VIP Lounge Sanctuary",
      desc: "Complimentary access to private lounge suites with hot dining, quiet workspaces, and shower facilities.",
      icon: Globe,
      tag: "Hospitality",
    },
    {
      title: "Flight Telemetry Tracking",
      desc: "Automatic flight tracking guarantees officer staging even if your flight lands early or experiences delays.",
      icon: Sparkles,
      tag: "Real-Time Radar",
    },
  ];

  const items = features || defaultFeatures;

  return (
    <section className="my-20 relative">
      <FadeInView>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#5fb5ad]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Technical Capabilities</span>
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white">
              Signature Features & <span className="text-[#c5a059]">Inclusions.</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-white/60 font-sans max-w-xl">
            Comprehensive white-glove features included in every {serviceName} reservation.
          </p>
        </div>
      </FadeInView>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((feat, idx) => {
          const Icon = feat.icon || Check;
          return (
            <StaggerItem key={idx}>
              <TiltCard maxTilt={8} scale={1.02} className="rounded-3xl h-full">
                <div className="p-7 rounded-3xl bg-[#0e131d]/90 border border-white/10 hover:border-[#c5a059]/50 transition-all duration-300 shadow-xl relative overflow-hidden h-full flex flex-col justify-between group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#c5a059]/5 rounded-full blur-xl group-hover:bg-[#c5a059]/15 transition-all pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-11 h-11 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059] group-hover:scale-110 transition-transform">
                        <Icon className="w-5.5 h-5.5" />
                      </div>
                      {feat.tag && (
                        <span className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 text-[#5fb5ad] border border-[#5fb5ad]/20">
                          {feat.tag}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-heading text-white font-bold group-hover:text-[#c5a059] transition-colors">
                      {feat.title}
                    </h3>

                    <p className="mt-2.5 text-xs text-white/65 leading-relaxed font-sans">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-white/10 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#c5a059]">
                    <Check className="w-3.5 h-3.5" />
                    <span>Included in Standard Package</span>
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
