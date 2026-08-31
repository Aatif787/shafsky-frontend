import React from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, ShieldCheck, HeartPulse, ShoppingBag, Zap, Users, Compass } from "lucide-react";
import { display, mono } from "../theme";
import { HOMEPAGE_PHOTOS } from "@/lib/homepage-photos";
import { EditorialPhoto } from "../EditorialPhoto";

interface GalleryService {
  title: string;
  category: string;
  desc: string;
  photo: (typeof HOMEPAGE_PHOTOS)[keyof typeof HOMEPAGE_PHOTOS];
  icon: any;
  link: string;
}

const SPECIALIZED_SERVICES: GalleryService[] = [
  {
    title: "Airside Buggy & Electric Cart",
    category: "TERMINAL MOBILITY",
    desc: "Dedicated electric buggy transfer connecting arrival aerobridges, immigration, and departure gates seamlessly.",
    photo: HOMEPAGE_PHOTOS.airsideBuggy,
    icon: Zap,
    link: "/solutions/concierge",
  },
  {
    title: "Special Assistance & Wheelchair Care",
    category: "ACCESSIBLE CARE",
    desc: "Compassionate, dedicated escort officers caring for senior citizens, medical passengers, and unaccompanied minors.",
    photo: HOMEPAGE_PHOTOS.specialAssistance,
    icon: HeartPulse,
    link: "/solutions/medical",
  },
  {
    title: "Duty Free & Luxury Shopping Service",
    category: "AIRPORT LUXURY",
    desc: "Personal shopping assistant and luggage porter managing your purchases across premier airport boutiques.",
    photo: HOMEPAGE_PHOTOS.dutyFreeShopping,
    icon: ShoppingBag,
    link: "/solutions/concierge",
  },
  {
    title: "Transit Lounge & Family Comfort",
    category: "LAYOVER CARE",
    desc: "Supervised gate-to-gate connection care, comfortable transit seating, and luggage re-check liaison.",
    photo: HOMEPAGE_PHOTOS.transitComfort,
    icon: Users,
    link: "/solutions/travel",
  },
  {
    title: "Destination & Celebration Service",
    category: "BESPOKE TRAVEL",
    desc: "Private helicopter transfers and five-star arrangements for destination weddings, VIP retreats, and milestones.",
    photo: HOMEPAGE_PHOTOS.destinationCelebration,
    icon: Compass,
    link: "/charter",
  },
];

export function SpecializedServicesGallery() {
  return (
    <section className="relative px-4 py-16 sm:px-8 sm:py-24 md:px-14 md:py-32 bg-white text-slate-900 overflow-hidden border-b border-slate-200">
      <div className="mx-auto max-w-[1480px]">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">

          <h2
            className="mt-4 sm:mt-5 text-[clamp(2.2rem,4.5vw,4.2rem)] leading-[1.06] text-slate-950 tracking-tight font-bold"
            style={display}
          >
            Specialized Passenger{" "}
            <span className="text-lime-600 font-bold">
              Assistance & Care.
            </span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Every traveler requires tailored attention. From swift airside buggy transfers to compassionate special assistance and bespoke destination services.
          </p>
        </div>

        {/* Gallery Cards (Zero Crop, Complete Composition Preserved, Content Structured Below) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SPECIALIZED_SERVICES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border-2 border-lime-500/25 bg-white overflow-hidden shadow-md hover:shadow-xl hover:border-lime-500 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Complete Uncropped Photo Container (ZERO CROP) */}
                <div className="w-full overflow-hidden bg-transparent p-1 sm:p-1.5">
                  <EditorialPhoto
                    src={item.photo.src}
                    alt={item.photo.alt}
                    width={item.photo.width}
                    height={item.photo.height}
                    aspectRatio={item.photo.aspectRatio}
                    objectFit="contain" // ZERO CROP
                    containerBg="bg-transparent"
                    className="w-full rounded-2xl"
                    imageClassName="w-full h-auto object-contain mx-auto"
                  />
                </div>

                {/* Content Box Strictly Below Image */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono tracking-widest text-lime-700 uppercase font-bold" style={mono}>
                        {item.category}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-lime-100 flex items-center justify-center text-lime-700">
                        <Icon size={16} />
                      </div>
                    </div>

                    <h3 className="mt-3 text-lg sm:text-xl font-bold text-slate-900" style={display}>
                      {item.title}
                    </h3>

                    <p className="mt-2 text-xs text-slate-600 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-mono" style={mono}>STANDARD CARE</span>
                    <Link
                      to={item.link}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-lime-700 hover:text-lime-800 transition-colors"
                    >
                      <span>Explore Service</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default SpecializedServicesGallery;
