import React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
} from "lucide-react";
import { display } from "@/components/home/theme";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { Footer } from "@/components/home/sections/Footer";
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
      <section className="relative w-full overflow-hidden bg-white border-b border-slate-200 py-6 sm:py-8">
        <div className="relative z-10 mx-auto w-full max-w-[1040px] xl:max-w-[1100px] 2xl:max-w-[1140px] px-4 sm:px-6 md:px-8">
          {/* Header Row: Back Button */}
          <div className="w-full flex items-center justify-between gap-3 mb-3 sm:mb-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/90 text-xs font-semibold shadow-xs hover:border-lime-500 transition-all cursor-pointer"
            >
              <ArrowLeft size={14} className="text-lime-600" />
              <span>Back</span>
            </button>
          </div>

          <div className="text-center max-w-3xl mx-auto mb-2 sm:mb-4">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight"
              style={display}
            >
              Infant Care Services
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Compassionate airport concierge assistance for parents travelling with infants, pram escort, and seamless airside coordination.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
       * 2. DEDICATED INFANT CARE ENQUIRY FORM SECTION
       * ─────────────────────────────────────────────────────────── */}
      <section id="enquiry" className="py-12 sm:py-20 bg-slate-50/80 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950" style={display}>
              Infant Care Enquiry Form
            </h2>
          </div>

          <InfantCareEnquiryForm />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
