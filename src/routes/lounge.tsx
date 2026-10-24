import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/home/sections/Footer";
import { LoungeEnquiryForm } from "@/components/lounge/LoungeEnquiryForm";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import loungeHeroImg from "@/assets/lounge/lounge-hero.jpg";

export const Route = createFileRoute("/lounge")({
  head: () =>
    pageHead({
      title: "Lounge | Shafsky Aviation Services",
      description:
        "Experience bespoke airport lounge comfort, VIP amenities, and seamless hospitality across premier domestic and international airport terminals with Shafsky Aviation.",
      path: "/lounge",
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Lounge", path: "/lounge" },
        ]),
      ],
    }),
  component: LoungePage,
});

export function LoungePage() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 flex flex-col justify-between selection:bg-emerald-200 selection:text-slate-950">
      {/* Top Navigation */}
      <Navigation visible={true} />

      {/* Main Lounge Service Section */}
      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          {/* Prominent Lounge Image (Left Column) */}
          <div className="relative w-full min-h-[380px] sm:min-h-[460px] lg:min-h-[640px] rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(15,23,42,0.06)] border border-slate-200/80 bg-slate-100">
            <img
              src={loungeHeroImg}
              alt="Shafsky Luxury Airport Lounge"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>

          {/* Enquiry Form Card (Right Column) */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 lg:p-10 shadow-[0_4px_24px_rgba(15,23,42,0.06)] flex flex-col justify-center">
            <LoungeEnquiryForm />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
