import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/home/sections/Footer";
import { LoungeEnquiryForm } from "@/components/lounge/LoungeEnquiryForm";
import {
  LoungeHeroCarousel,
  LoungeGalleryGrid,
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

export function LoungePage() {
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
        {/* Hero Section: Mobile-first stacked on small screens, 2-column side-by-side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          {/* Prominent Lounge Showcase Carousel (Left Column on Desktop, Top on Mobile) */}
          <div className="flex flex-col justify-center">
            <LoungeHeroCarousel onOpenLightbox={(idx) => setLightboxIndex(idx)} />
          </div>

          {/* Enquiry Form Card (Right Column on Desktop, Bottom on Mobile) */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-8 lg:p-10 shadow-[0_4px_24px_rgba(15,23,42,0.06)] flex flex-col justify-center">
            <LoungeEnquiryForm />
          </div>
        </div>

        {/* 100% Mobile-first Visual Gallery Showcase Section */}
        <LoungeGalleryGrid onOpenLightbox={(idx) => setLightboxIndex(idx)} />
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
