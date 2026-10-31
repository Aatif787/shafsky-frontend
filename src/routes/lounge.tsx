import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/home/sections/Footer";
import { LoungeEnquiryForm } from "@/components/lounge/LoungeEnquiryForm";
import {
  LoungeHeroCarousel,
  LoungePhotoLightbox,
} from "@/components/lounge/LoungeGalleryShowcase";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";

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

function LoungePage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 flex flex-col justify-between selection:bg-emerald-200 selection:text-slate-950">
      {/* Top Navigation */}
      <Navigation visible={true} />

      {/* Main Lounge Service Section */}
      <main
        id="main-content"
        className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-16 sm:pb-24"
      >
        {/* Upper section image showcase (NOT on the side), followed by Enquiry Form (100% responsive for all devices) */}
        <div className="w-full space-y-8 sm:space-y-10">
          {/* Upper Section Showcase (Clean images, NO text on images, 100% responsive on mobile, 90% on desktop) */}
          <div className="w-full max-w-5xl mx-auto">
            <LoungeHeroCarousel onOpenLightbox={(idx) => setLightboxIndex(idx)} />
          </div>

          {/* Enquiry Form Card */}
          <div className="w-full max-w-4xl mx-auto rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-8 lg:p-10 shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
            <LoungeEnquiryForm />
          </div>
        </div>
      </main>

      {/* Fullscreen Photo Lightbox Modal */}
      <LoungePhotoLightbox
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onSelectIndex={(idx) => setLightboxIndex(idx)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
