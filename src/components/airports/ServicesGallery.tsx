import React from "react";
import { motion } from "framer-motion";
import depWheelchair from "@/assets/gallery/dep-wheelchair.jpg";
import depLounge from "@/assets/gallery/dep-lounge.jpg";
import depSpa from "@/assets/gallery/dep-spa.jpg";
import depBuggy from "@/assets/gallery/dep-buggy.jpg";
import arrBaggage from "@/assets/gallery/arr-baggage.jpg";
import arrChauffeur from "@/assets/gallery/arr-chauffeur.jpg";
import arrDutyFree from "@/assets/gallery/arr-dutyfree.jpg";

interface ServicesGalleryProps {
  airportCity?: string;
  airportCode?: string;
}

const DEPARTURE_IMAGES = [
  {
    src: depWheelchair,
    title: "Special Assistance & Wheelchair Escort",
    alt: "Dedicated wheelchair assistance and gate escort",
  },
  {
    src: depLounge,
    title: "VIP Lounge Sanctuary & Recliners",
    alt: "Exclusive VIP lounge comfort and workspaces",
  },
  {
    src: depSpa,
    title: "Lounge Wellness & Relaxation Spa",
    alt: "Airport wellness and rejuvenation services",
  },
  {
    src: depBuggy,
    title: "Airside Buggy & Electric Cart",
    alt: "Dedicated airside electric buggy transfer",
  },
];

const ARRIVAL_IMAGES = [
  {
    src: arrBaggage,
    title: "Baggage Reclaim & Belt Assistance",
    alt: "Baggage claim assist and dedicated porter support",
  },
  {
    src: arrChauffeur,
    title: "Chauffeur & Tarmac Car Transfer",
    alt: "Chauffeured vehicle luggage loading and curb-side escort",
  },
  {
    src: arrDutyFree,
    title: "Duty Free Shopping & Retail Concierge",
    alt: "Airside shopping concierge and duty free assist",
  },
];

export function ServicesGallery({ airportCity, airportCode }: ServicesGalleryProps) {
  return (
    <section className="px-4 py-12 sm:px-8 md:px-16 md:py-16 max-w-[1600px] mx-auto space-y-14">
      {/* ── 1. DEPARTURE SERVICES GALLERY ── */}
      <div>
        <div className="mb-6 sm:mb-8">
          <h3
            className="text-2xl sm:text-3xl font-serif font-bold text-[#1e293b] tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Departure Services Gallery
          </h3>
          <div className="mt-2.5 h-[3px] w-20 rounded-full bg-[#1e293b]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {DEPARTURE_IMAGES.map((img, idx) => (
            <motion.div
              key={`dep-gal-${idx}`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="group overflow-hidden rounded-2xl bg-slate-100 shadow-sm border border-slate-200/80 transition-all duration-300 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── 2. ARRIVAL SERVICES GALLERY ── */}
      <div>
        <div className="mb-6 sm:mb-8">
          <h3
            className="text-2xl sm:text-3xl font-serif font-bold text-[#1e293b] tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Arrival Services Gallery
          </h3>
          <div className="mt-2.5 h-[3px] w-20 rounded-full bg-[#1e293b]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {ARRIVAL_IMAGES.map((img, idx) => (
            <motion.div
              key={`arr-gal-${idx}`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="group overflow-hidden rounded-2xl bg-slate-100 shadow-sm border border-slate-200/80 transition-all duration-300 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
