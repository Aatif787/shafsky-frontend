import React from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, ShieldCheck, Headphones, CheckCircle2 } from "lucide-react";
import { Magnetic } from "@/components/ui/interactions";

export interface SubServiceOption {
  id: string;
  label: string;
  tagline: string;
  description: string;
  image: string;
  badge?: string;
}

interface ServiceHeroProps {
  category: string;
  title: string;
  tagline: string;
  description: string;
  heroImage: string;
  activeSubService?: string;
  subServices?: SubServiceOption[];
  onSelectSubService?: (id: string) => void;
  serviceId?: string;
}

export function ServiceHero({
  category,
  title,
  tagline,
  description,
  heroImage,
  activeSubService,
  subServices = [],
  onSelectSubService,
  serviceId = "meet_greet",
}: ServiceHeroProps) {
  const currentSub = subServices.find((s) => s.id === activeSubService) || subServices[0];
  const activeImage = currentSub?.image || heroImage;
  const activeTitle = currentSub?.label || title;
  const activeTagline = currentSub?.tagline || tagline;
  const activeDescription = currentSub?.description || description;

  return (
    <section className="relative min-h-[75vh] lg:min-h-[80vh] w-full overflow-hidden rounded-[36px] bg-gradient-to-b from-[#FAF9F5] via-white to-[#FAF9F5] text-slate-900 border border-slate-200 shadow-sm my-6">
      {/* 1. SOFT LIGHT LUXURY DECORATIVE BACKGROUND ACCENTS */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* 2. HERO CONTENT CONTAINER */}
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[75vh] lg:min-h-[80vh] p-6 sm:p-10 lg:p-14">
        
        {/* Top Sub-Service Selector Tabs (If applicable) */}
        {subServices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center gap-2 pt-4"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold mr-2">
              Select Variant:
            </span>
            {subServices.map((sub) => {
              const isActive = sub.id === (activeSubService || subServices[0]?.id);
              return (
                <button
                  key={sub.id}
                  onClick={() => onSelectSubService?.(sub.id)}
                  className={`px-4 py-2 rounded-2xl text-[10px] font-mono uppercase tracking-[0.2em] transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-600 text-white font-extrabold shadow-sm"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Center Main Content */}
        <div className="my-auto max-w-4xl py-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono uppercase tracking-[0.25em] font-bold mb-4">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{category} Flagship Solution</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-slate-900 leading-[1.08] tracking-tight">
              {activeTitle}
            </h1>

            <p className="mt-4 text-lg sm:text-xl text-emerald-700 font-heading max-w-2xl font-semibold">
              "{activeTagline}"
            </p>

            <p className="mt-4 text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-2xl font-medium">
              {activeDescription}
            </p>
          </motion.div>

          {/* Action Triggers */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Magnetic strength={0.25}>
              <Link
                to="/book"
                search={{ service_id: activeSubService || serviceId } as any}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-[0.2em] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                <span>Book This Service</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Magnetic>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-white border border-slate-200 text-slate-800 font-mono text-xs uppercase font-bold tracking-[0.2em] hover:bg-slate-50 transition-all duration-200 shadow-xs"
            >
              <span>See How It Works</span>
            </a>
          </motion.div>
        </div>

        {/* Bottom Trust Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-xs font-mono text-slate-600 font-medium"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Guaranteed White-Glove Escort</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#7c3aed]" />
            <span>Flight Radar Precision Tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-amber-600" />
            <span>24/7 Staged Command Desk</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
