import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { display } from "@/components/home/theme";
import home5Img from "@/assets/homepage/home5.jpeg";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/solutions/cargo")({
  head: () =>
    pageHead({
      title: "Airport Luxury Transfers & Chauffeured Fleet | Shafsky",
      description:
        "Chauffeured airport transfers in Mercedes-Maybach, Toyota Vellfire, and executive sedans across India. Book tarmac and curbside passenger transport with Shafsky.",
      path: "/solutions/cargo",
      keywords: ["airport transfer India", "chauffeured luxury car", "Maybach airport pickup"],
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Airport Transfers", path: "/solutions/cargo" },
        ]),
      ],
    }),
  component: DedicatedTransportServicePage,
});
import {
  TRANSPORT_OPTIONS,
  TRANSPORTATION_VEHICLE_CATALOG,
  type TransportOptionId,
  type TransportOptionDef,
} from "@/data/transportation";
import { VehicleShowcaseSection } from "@/components/transportation/VehicleShowcaseSection";
import { Footer } from "@/components/home/sections/Footer";

export type { TransportOptionId, TransportOptionDef };

const TRANSPORT_HERO_SLIDES = [
  {
    src: "/images/transport/tarmac-chauffeur.webp",
    alt: "Shafsky Airside Tarmac Mercedes-Benz S-Class Chauffeur Transfer",
    badge: "1/3 • Tarmac Chauffeur Transfer",
    label: "Tarmac Transfer",
  },
  {
    src: "/images/transport/fleet-skyline.webp",
    alt: "Shafsky Chauffeured Executive Sedans and Passenger Vans",
    badge: "2/3 • Chauffeured Executive Fleet",
    label: "Executive Fleet",
  },
  {
    src: "/images/transport/curbside-chauffeur.webp",
    alt: "Shafsky Curbside Executive Chauffeur Reception & City Transfer",
    badge: "3/3 • Curbside Arrival",
    label: "Curbside Arrival",
  },
];

function DedicatedTransportServicePage() {
  const navigate = useNavigate();
  const [selectedOptionId, setSelectedOptionId] = useState<TransportOptionId>("Luxury Vehicles");
  const [activeVehicleId, setActiveVehicleId] = useState<string>("merc-maybach-s-class");
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  const activeOption =
    TRANSPORT_OPTIONS.find((o) => o.id === selectedOptionId) || TRANSPORT_OPTIONS[0];

  const handleSelectOption = (optId: TransportOptionId) => {
    setSelectedOptionId(optId);
    if (optId === "Luxury Vehicles") {
      setHeroSlideIndex(0);
    } else if (optId === "MUV / Large Vehicles") {
      setHeroSlideIndex(1);
    } else if (optId === "Economy / Standard") {
      setHeroSlideIndex(2);
    }

    // Automatically select first valid canonical vehicle of the new category
    const targetOpt = TRANSPORT_OPTIONS.find((o) => o.id === optId) || TRANSPORT_OPTIONS[0];
    if (targetOpt.vehicles && targetOpt.vehicles.length > 0) {
      setActiveVehicleId(targetOpt.vehicles[0].id);
    }
  };

  // Vehicles directly from active canonical category (Luxury: 12, MUV: 15, Economy: 11)
  const displayVehicles = activeOption.vehicles || [];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-lime-200">
      {/* ─────────────────────────────────────────────────────────────
          1. COMPLETE HERO PHOTO & TRANSPORT SERVICE TITLE
          ───────────────────────────────────────────────────────────── */}
      <section className="relative px-4 pt-4 pb-8 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="mx-auto max-w-6xl">
          {/* Header Bar with Back Button & Breadcrumbs */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  navigate({ to: "/" });
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-lime-500 hover:text-lime-700 hover:bg-lime-50/50 shadow-sm transition-all cursor-pointer"
            >
              <ArrowLeft size={14} className="text-lime-600" />
              <span>Back</span>
            </button>

            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-lime-700 uppercase tracking-widest bg-lime-50 px-3.5 py-1.5 rounded-full border border-lime-200">
              <span className="w-2 h-2 rounded-full bg-lime-500 inline-block" />
              <span>CHAUFFEURED FLEET & TARMAC SEDANS</span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="text-center max-w-3xl mx-auto mb-6">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight"
              style={display}
            >
              Transport <span className="text-lime-600">Service</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Immaculate chauffeured tarmac sedans, Mercedes-Benz Maybach, Toyota Vellfire, and luxury passenger coaches.
            </p>
          </div>

          {/* Uncropped Responsive Hero Image Slider */}
          <div className="space-y-3">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-md bg-slate-900 border border-slate-100 flex items-center justify-center min-h-[260px] sm:min-h-[400px]">
              <img
                src={TRANSPORT_HERO_SLIDES[heroSlideIndex]?.src || TRANSPORT_HERO_SLIDES[0].src}
                alt={TRANSPORT_HERO_SLIDES[heroSlideIndex]?.alt || "Shafsky Luxury Transport Fleet"}
                className="w-full h-auto object-contain object-center select-none block transition-opacity duration-300"
                loading="eager"
              />

              {/* Slide Navigation Overlay Buttons */}
              <div className="absolute inset-y-0 left-3 right-3 flex items-center justify-between pointer-events-none">
                <button
                  type="button"
                  onClick={() =>
                    setHeroSlideIndex((prev) => (prev - 1 + TRANSPORT_HERO_SLIDES.length) % TRANSPORT_HERO_SLIDES.length)
                  }
                  className="pointer-events-auto p-2 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md transition shadow-md cursor-pointer"
                  aria-label="Previous photo"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setHeroSlideIndex((prev) => (prev + 1) % TRANSPORT_HERO_SLIDES.length)}
                  className="pointer-events-auto p-2 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md transition shadow-md cursor-pointer"
                  aria-label="Next photo"
                >
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Photo Caption Badge */}
              <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1 rounded-full border border-white/10 shadow-sm">
                {TRANSPORT_HERO_SLIDES[heroSlideIndex]?.badge}
              </div>
            </div>

            {/* 3-Slide Thumbnail / Pill Selectors */}
            <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
              {TRANSPORT_HERO_SLIDES.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setHeroSlideIndex(idx)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-mono font-bold transition cursor-pointer ${
                    heroSlideIndex === idx
                      ? "bg-lime-500 text-slate-950 border-lime-600 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-lime-400 hover:bg-lime-50/50"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${heroSlideIndex === idx ? "bg-slate-950" : "bg-slate-300"}`} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. VEHICLE SHOWROOM: CINEMATIC STAGE, CIRCULAR SELECTOR & DETAILS
          ───────────────────────────────────────────────────────────── */}
      <VehicleShowcaseSection
        vehicles={displayVehicles}
        categoryTitle={activeOption.label}
        categories={TRANSPORT_OPTIONS.map((o) => o.id)}
        selectedCategory={selectedOptionId}
        onSelectCategory={handleSelectOption}
        selectedVehicleId={activeVehicleId}
        onSelectVehicle={setActiveVehicleId}
      />

      {/* ─────────────────────────────────────────────────────────────
          5. COMPANY CATALOG CONTENT & UNCOPPED GALLERY
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.35em] text-lime-700 font-bold font-mono bg-lime-50 px-3.5 py-1 rounded-full border border-lime-200 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500 inline-block" />
              <span>FLEET CATEGORIES & DETAILS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-950 tracking-tight" style={display}>
              Transport Inclusions & Fleet.
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Chauffeured tarmac transfers, executive MPVs, and luxury inter-city transport.
            </p>
          </div>

          {/* 2-Column Balanced Editorial Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* Left Column: Option Title & Exact Inclusions List */}
            <div className="lg:col-span-6 flex flex-col justify-start">
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-lime-700 font-mono font-bold mb-3">
                <span className="w-2 h-2 rounded-full bg-lime-500 inline-block" />
                <span>{activeOption.badge}</span>
              </div>

              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0a196f] tracking-tight mb-6" style={display}>
                {activeOption.id}
              </h3>

              <div className="space-y-3">
                {activeOption.inclusions.map((inc, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-slate-300 hover:bg-white hover:shadow-xs transition-all duration-200"
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-900 text-lime-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={12} className="stroke-[2.5]" />
                    </div>
                    <span className="text-sm font-medium text-slate-900 leading-snug">
                      {inc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Original Aspect Ratio Uncropped Gallery */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    src: "/images/transport/tarmac-chauffeur.webp",
                    alt: "Tarmac Sedan Arrival Reception",
                  },
                  {
                    src: "/images/transport/fleet-skyline.webp",
                    alt: "Chauffeured Executive Fleet & Sedans",
                  },
                  {
                    src: "/images/transport/curbside-chauffeur.webp",
                    alt: "Curbside Executive Arrival",
                  },
                  {
                    src: home5Img,
                    alt: "Dedicated Airport Porterage & Fleet Apron",
                  },
                ].map((img, idx) => (
                  <div
                    key={idx}
                    className="w-full rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 bg-white group hover:border-lime-400 hover:shadow-md transition-all duration-300 flex flex-col"
                  >
                    <div className="relative aspect-[16/10] w-full bg-slate-50 overflow-hidden flex items-center justify-center">
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-full object-cover object-center select-none block group-hover:scale-103 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3.5 bg-white border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-900 tracking-tight font-sans block group-hover:text-[#0a196f] transition-colors">
                        {img.alt}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. FOOTER
          ───────────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
