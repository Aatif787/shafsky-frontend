import React from "react";
import { Link } from "@tanstack/react-router";
import { PhoneCall, Sparkles, ArrowRight, ShieldCheck, Headphones } from "lucide-react";
import { Magnetic, FadeInView } from "@/components/ui/interactions";

interface AssistanceCTAProps {
  heading?: string;
  subheading?: string;
  className?: string;
  airportCode?: string;
  airportName?: string;
}

export function AssistanceCTA({
  heading = "Need VIP Concierge Assistance?",
  subheading = "Reserve custom airside escort, lounge, or private transport.",
  className = "",
  airportCode,
  airportName,
}: AssistanceCTAProps) {
  const lockedCode = (airportCode || "").trim().toUpperCase();
  const reservationSearch = lockedCode
    ? {
        source: "airport_page",
        airport: lockedCode,
        airport_name: airportName || "",
      }
    : undefined;
  return (
    <FadeInView>
      <section className={`relative my-16 rounded-3xl bg-white p-8 sm:p-12 border border-slate-200/80 shadow-md ${className}`}>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-100 text-[#7c3aed] text-[10px] font-mono font-bold uppercase tracking-widest">
              <Headphones className="w-3.5 h-3.5" />
              <span>24/7 Global Aviation Command Desk</span>
            </div>

            <h2
              className="mt-4 text-3xl sm:text-4xl font-serif font-bold text-slate-900 leading-tight"
            >
              {heading} <br className="hidden sm:inline" />
              <span className="italic text-[#7c3aed] font-normal">{subheading}</span>
            </h2>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed font-sans max-w-xl">
              Our operational command is staged 24 hours a day to orchestrate your flight, meet & greet escort, medevac, or cargo clearance with zero delays.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-mono tracking-wider font-bold">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#7c3aed]" />
                <span>Guaranteed Confidentiality</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#84cc16]" />
                <span>Immediate Staging</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
            <Magnetic strength={0.25}>
              <Link
                to="/book"
                {...(reservationSearch ? { search: reservationSearch as any } : {})}
                className="group relative inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-2xl bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-bold uppercase tracking-widest shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 w-full"
              >
                <span>Proceed to Reservation</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Magnetic>

            <Magnetic strength={0.2}>
              <a
                href="tel:+919599087959"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 font-mono text-xs font-semibold uppercase tracking-widest hover:border-[#7c3aed] transition-all duration-300 w-full"
              >
                <PhoneCall className="w-4 h-4 text-[#7c3aed]" />
                <span>+91 9599087959</span>
              </a>
            </Magnetic>
          </div>
        </div>
      </section>
    </FadeInView>
  );
}
