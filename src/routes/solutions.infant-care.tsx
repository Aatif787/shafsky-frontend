import React from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  Baby,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Heart,
  PhoneCall,
  MessageSquare,
} from "lucide-react";
import { display, mono } from "@/components/home/theme";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { Footer } from "@/components/home/sections/Footer";
import infantCareBanner from "@/assets/others/infant-care.jpg";
import { InfantCareEnquiryForm } from "@/components/special-services/InfantCareEnquiryForm";

export const Route = createFileRoute("/solutions/infant-care")({
  head: () =>
    pageHead({
      title: "Airport Infant Care & Family Concierge Services | Shafsky Aviation",
      description:
        "Dedicated airport assistance for parents and families travelling with infants. Aerobridge greeting, pram escort, priority check-in assistance, and terminal coordination.",
      path: "/solutions/infant-care",
      keywords: [
        "airport infant care",
        "travelling with baby assistance",
        "airport family concierge India",
        "stroller airport escort",
      ],
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Solutions", path: "/solutions/concierge" },
          { name: "Infant Care", path: "/solutions/infant-care" },
        ]),
      ],
    }),
  component: DedicatedInfantCarePage,
});

const INFANT_CARE_INCLUSIONS = [
  {
    title: "Curbside Greeting & Pram Escort",
    desc: "Dedicated concierge officer meets you at the airport terminal entry, assisting with luggage, pram assembly, and personal belongings.",
  },
  {
    title: "Check-in & Gate-Check Support",
    desc: "Guidance through airline check-in counters with pram tag coordination for gate-delivery or cabin stowage.",
  },
  {
    title: "Priority Terminal Escort",
    desc: "Smooth, attentive navigation through security hold areas and crowded concourses with family-friendly pacing.",
  },
  {
    title: "Arrival Aerobridge Welcome",
    desc: "Greeted right at the aircraft exit gate upon deboarding, with prompt stroller retrieval and luggage belt escort.",
  },
  {
    title: "Transit & Layover Coordination",
    desc: "Gate-to-gate escort during connecting flights, coordinating infant-friendly rest stops and boarding queues.",
  },
  {
    title: "24/7 Dedicated Family Desk",
    desc: "Continuous flight monitoring and instant coordination on WhatsApp for delays, gate changes, or special requests.",
  },
];

function DedicatedInfantCarePage() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      navigate({ to: "/" });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-lime-200">
      {/* ─────────────────────────────────────────────────────────────
       * 1. HERO SECTION & BANNER
       * ─────────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-white border-b border-slate-200 py-6 sm:py-8 md:py-10">
        <div className="relative z-10 mx-auto w-full max-w-[1040px] xl:max-w-[1100px] 2xl:max-w-[1140px] px-4 sm:px-6 md:px-8">
          {/* Header Row: Back Button & Status Badge */}
          <div className="w-full mb-4 sm:mb-6 flex items-center justify-between gap-3">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/90 text-xs font-semibold shadow-xs hover:border-lime-500 transition-all cursor-pointer"
            >
              <ArrowLeft size={14} className="text-lime-600" />
              <span>Back</span>
            </button>

            <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-mono font-bold text-lime-800 uppercase tracking-widest bg-lime-50 px-3.5 sm:px-4 py-1.5 rounded-full border border-lime-300 shadow-xs" style={mono}>
              <span className="w-2 h-2 rounded-full bg-lime-500 inline-block animate-pulse" />
              <span>DEDICATED AIRPORT INFANT & FAMILY CARE</span>
            </div>
          </div>

          {/* Banner Photo */}
          <div className="relative w-full aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 ring-1 ring-slate-100 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.08)] bg-slate-100 flex items-center justify-center select-none">
            <img
              width={1600}
              height={900}
              src={infantCareBanner}
              alt="Shafsky Aviation Infant Care and Family Airport Concierge Service"
              className="w-full h-full object-cover object-center select-none block pointer-events-none"
              loading="eager"
              draggable={false}
            />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
       * 2. SERVICE DETAILS & DESCRIPTION
       * ─────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-white px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.4em] text-lime-700 font-bold font-mono bg-lime-50 px-3.5 py-1 rounded-full border border-lime-200" style={mono}>
            <Baby size={13} className="text-lime-600" />
            <span>SPECIALIZED PASSENGER CARE</span>
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-950 tracking-tight" style={display}>
            Infant Care
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Professional airport assistance designed to support parents and families travelling with babies and young infants. Our compassionate concierge team coordinates with you from curbside to aerobridge, managing stroller handling, priority terminal escort, and boarding assistance for a comfortable, worry-free flight experience.
          </p>

          {/* Inclusions Grid */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {INFANT_CARE_INCLUSIONS.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 shadow-xs hover:border-lime-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2 text-lime-700 mb-2">
                  <CheckCircle2 size={16} className="text-lime-600 shrink-0" />
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900" style={display}>
                    {item.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
       * 3. DEDICATED INFANT CARE ENQUIRY FORM SECTION
       * ─────────────────────────────────────────────────────────── */}
      <section id="enquiry" className="py-12 sm:py-20 bg-slate-50/80 border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-lime-700 mb-2" style={mono}>
              <Sparkles size={13} className="text-lime-600" />
              <span>QUICK ENQUIRY • PERSONAL COORDINATION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950" style={display}>
              Arrange Infant Care Assistance
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Submit your flight details below and our operations desk will promptly confirm your dedicated family escort.
            </p>
          </div>

          <InfantCareEnquiryForm />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
       * 4. VIP OPERATIONS DESK CONTACT
       * ─────────────────────────────────────────────────────────── */}
      <section className="py-10 bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl p-6 sm:p-8 rounded-3xl bg-slate-950 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-lime-400 mb-2" style={mono}>
              <Clock size={12} />
              <span>24/7 PRIORITY FAMILY DESK</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold" style={display}>
              Travelling within 24 Hours or Need Immediate Assistance?
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Our airport duty managers are available 24/7 to coordinate emergency baby travel requirements, urgent layovers, and airport meet-and-greets.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
            <a
              href="https://wa.me/919599087959?text=Hello%20Shafsky%20Desk%2C%20I%20need%20urgent%20Infant%20Care%20airport%20assistance."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md"
              style={mono}
            >
              <MessageSquare size={15} />
              <span>WhatsApp Us</span>
            </a>
            <a
              href="tel:+919599087959"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-mono text-xs font-bold uppercase tracking-wider transition-all"
              style={mono}
            >
              <PhoneCall size={14} className="text-lime-400" />
              <span>Call Operations</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

