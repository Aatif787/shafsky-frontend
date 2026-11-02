import React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Sparkles,
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
       * 2. DEDICATED INFANT CARE ENQUIRY FORM SECTION
       * ─────────────────────────────────────────────────────────── */}
      <section id="enquiry" className="py-12 sm:py-20 bg-slate-50/80 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-lime-700 mb-2" style={mono}>
              <Sparkles size={13} className="text-lime-600" />
              <span>QUICK ENQUIRY • PERSONAL COORDINATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950" style={display}>
              Arrange Infant Care Assistance
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Submit your flight details below and our operations desk will promptly confirm your dedicated family escort.
            </p>
          </div>

          <InfantCareEnquiryForm />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
