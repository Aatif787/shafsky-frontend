import React from "react";
import { Sparkles, Shield, Clock, Award, Star, Compass } from "lucide-react";
import { TiltCard, FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/interactions";

export interface BenefitCard {
  title: string;
  description: string;
  icon: any;
  highlight?: string;
}

interface ServiceWhyChooseProps {
  serviceName: string;
  benefits?: BenefitCard[];
}

export function ServiceWhyChoose({ serviceName, benefits }: ServiceWhyChooseProps) {
  const defaultBenefits: BenefitCard[] = [
    {
      title: "Zero Queue Delays",
      description: "Fast-track diplomatic lanes bypass terminal lines, saving up to 90 minutes of transit time.",
      icon: Clock,
      highlight: "90 Mins Saved",
    },
    {
      title: "White-Glove Staging",
      description: "Dedicated Guest Relations Officers welcome you at the aerobridge exit with discrete name placarding.",
      icon: Award,
      highlight: "Personal Officer",
    },
    {
      title: "Confidentiality Guaranteed",
      description: "Strict privacy protocol and diplomatic handling for VIPs, celebrities, and corporate executives.",
      icon: Shield,
      highlight: "100% Private",
    },
    {
      title: "24/7 Command Support",
      description: "Real-time telemetry and flight radar tracking ensures host staging even during unscheduled delays.",
      icon: Compass,
      highlight: "24/7 Staged",
    },
  ];

  const items = benefits || defaultBenefits;

  return (
    <section className="my-20 relative">
      <FadeInView>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-700 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>The Shafsky Distinction</span>
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900">
              Why Choose <span className="italic text-emerald-700">{serviceName}</span>.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-sans font-medium max-w-xl">
            Engineered to deliver seamless luxury, absolute privacy, and total peace of mind at every stage of your flight.
          </p>
        </div>
      </FadeInView>

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, idx) => {
          const Icon = item.icon || Star;
          return (
            <StaggerItem key={idx}>
              <TiltCard maxTilt={8} scale={1.02} className="rounded-3xl h-full">
                <div className="p-7 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 transition-all duration-300 shadow-xs hover:shadow-md relative overflow-hidden h-full flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      {item.highlight && (
                        <span className="text-[9px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                          {item.highlight}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-serif text-slate-900 font-bold group-hover:text-emerald-700 transition-colors leading-snug">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-xs text-slate-600 font-medium leading-relaxed font-sans">
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
