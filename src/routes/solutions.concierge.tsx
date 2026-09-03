import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Plane,
  Calendar,
  Users,
  Luggage,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  Check,
  Clock,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { display, mono } from "@/components/home/theme";
import meetGreetImg from "@/assets/others/meetgreet.jpeg";
import buggyImg from "@/assets/homepage/buggy.jpeg";
import vvipImg from "@/assets/homepage/vvip.jpeg";
import transitImg from "@/assets/homepage/transit.jpeg";
import loungeImg from "@/assets/homepage/lounge.jpeg";
import dutyImg from "@/assets/homepage/duty.jpeg";
import wheelImg from "@/assets/homepage/wheel.jpeg";
import greetImg from "@/assets/homepage/greet.jpeg";
import home2Img from "@/assets/homepage/home2.jpeg";
import home3Img from "@/assets/homepage/home3.jpeg";
import home5Img from "@/assets/homepage/home5.jpeg";

import { BookingPanel } from "@/components/home/booking/BookingPanel";

export const Route = createFileRoute("/solutions/concierge")({
  head: () => ({
    meta: [
      { title: "Meet & Greet and Lounge Service — Shafsky Aviation" },
      {
        name: "description",
        content:
          "Official Shafsky Aviation Meet & Greet and Lounge Service catalog and booking for Domestic and International Departure, Arrival, and Transit across global airports.",
      },
    ],
  }),
  component: MeetGreetDedicatedPage,
});

export type MeetGreetOptionKey =
  | "Domestic Departure"
  | "Domestic Arrival"
  | "International Departure"
  | "International Arrival"
  | "Transit Service";

interface CatalogItem {
  id: MeetGreetOptionKey;
  title: string;
  badge: string;
  tagline?: string;
  heroBanner?: string;
  inclusions: string[];
  transitTypes?: string[];
  topImages: { src: string; alt: string }[];
  bottomImages?: { src: string; alt: string }[];
}

const CATALOG_DATA: CatalogItem[] = [
  {
    id: "Domestic Departure",
    title: "DOMESTIC DEPARTURE",
    badge: "Departure Concierge",
    inclusions: [
      "Welcome Guest from the Curbside Area",
      "Porter Service with Dedicated Staff",
      "Wheelchair Service Available",
      "Assist From Seperate Entry Gate.",
      "Assist to Baggage Wrapping Facilities",
      "Assist at Airline Baggage Check-In Counter",
      "Assist in S.H.A.(Security Hold Area)",
      "Lounge Service Available",
      "Assist in Retail Shopping Area.",
      "Buggy Service Available Till The Boarding Gate",
      "Assist Guest Till The Boarding Gate.",
    ],
    topImages: [
      { src: vvipImg, alt: "VVIP Terminal Curbside Welcome & Dedicated Staff" },
      { src: home2Img, alt: "Airline Baggage Check-in Counter Assistance" },
      { src: loungeImg, alt: "VVIP Lounge Service & Premium Refreshments" },
      { src: buggyImg, alt: "Airside Buggy Service Till Boarding Gate" },
    ],
  },
  {
    id: "Domestic Arrival",
    title: "DOMESTIC ARRIVALS",
    badge: "Arrival Concierge",
    inclusions: [
      "Welcome Guest from End of the Aerobridge",
      "Dedicated Staff with Placard",
      "Porter Service with Dedicated Staff",
      "Buggy Service Available",
      "Wheelchair Service Available with Dedicated Staff.",
      "Assist in Baggage Belt Area",
      "Assist Guest Till The Car Parking Area",
    ],
    topImages: [
      { src: greetImg, alt: "Welcome Guest from End of the Aerobridge with Placard" },
      { src: home3Img, alt: "Dedicated Baggage Belt Area Assistance" },
      { src: wheelImg, alt: "Wheelchair Service Available with Dedicated Staff" },
    ],
    bottomImages: [
      { src: transitImg, alt: "Family Airport Escort & Assistance" },
      { src: home5Img, alt: "Luggage Escort Till Car Parking Area" },
    ],
  },
  {
    id: "International Departure",
    title: "INTERNATIONAL DEPARTURE",
    badge: "International Departure",
    inclusions: [
      "Welcome Guest from the Curb Side Area",
      "Porter Service with Dedicated Staff",
      "Wheelchair Service Available",
      "Assist from Separate Entry Gate",
      "Assist in Money Exchange Counter",
      "Assist to Baggage Wrapping Facilities",
      "Assist in Airline Baggage Check-in Counter.",
      "Assist in Immigration",
      "Assist in Customs",
      "Assist in S.H.A.(Security Hold Area)",
      "Lounge Service Available",
      "Assist in Retail Shopping Area.",
      "Buggy Service Available Till the Boarding Gate",
      "Assist Guest Till the Boarding Gate",
    ],
    topImages: [
      { src: vvipImg, alt: "Welcome Guest from Curb Side Area" },
      { src: home2Img, alt: "Assist in Money Exchange Counter & Baggage Wrapping" },
      { src: dutyImg, alt: "Assist in Immigration & Customs Verification" },
      { src: loungeImg, alt: "Assist in S.H.A. & VIP Lounge Sanctuary" },
      { src: buggyImg, alt: "Buggy Escort & Boarding Gate A12 Assistance" },
    ],
  },
  {
    id: "International Arrival",
    title: "INTERNATIONAL ARRIVALS",
    badge: "International Arrival",
    inclusions: [
      "Welcome Guest from the Aerobridge",
      "Dedicated Staff with Placard",
      "Porter Service with Dedicated Staff",
      "Buggy Service Available from the Aerobridge",
      "Wheelchair Service Available with Dedicated Staff.",
      "Assist in Immigration",
      "Assist in Duty Free Shop",
      "Assist in Baggage Belt Area",
      "Assist in Custom",
      "Assist Guest Till the Car Parking Area",
    ],
    topImages: [
      { src: greetImg, alt: "Welcome Guest from the Aerobridge with Dedicated Host" },
      { src: dutyImg, alt: "Assist in Immigration & Duty Free Shop" },
      { src: home2Img, alt: "Customs Clearance & Priority Escort" },
    ],
    bottomImages: [
      { src: home5Img, alt: "Dedicated Porter & Luggage Trolley Escort" },
      { src: home3Img, alt: "Assist in Baggage Belt Area & Car Parking" },
    ],
  },
  {
    id: "Transit Service",
    title: "TRANSIT SERVICE",
    badge: "Transit Protocol",
    tagline: "Experience a seamless, stress-free transfer between flights with our dedicated airport transit team.",
    heroBanner: transitImg,
    transitTypes: [
      "DOMESTIC TO DOMESTIC",
      "INTERNATIONAL TO INTERNATIONAL",
      "DOMESTIC TO INTERNATIONAL",
    ],
    inclusions: [
      "Welcome Guest from End of the Aerobridge",
      "Dedicated Staff with Placard",
      "Porter Service with Dedicated Staff at Arrivals",
      "Buggy Services Available",
      "Guidance to the Immigration Counter",
      "Assist in Duty Free Shop",
      "Assist in Baggage Belt Area",
      "Re-Collect Baggage After Customs",
      "Assist in Domestic Transfer",
      "Assist in Airline Check-in Counter",
      "Assist in S.H.A.(Security Hold Area)",
      "Lounge Access",
      "Buggy Service Available",
      "Assist Guest Till the Boarding Gate",
    ],
    topImages: [
      { src: meetGreetImg, alt: "Dedicated Airport Transit Team Escort" },
      { src: home2Img, alt: "Transfer Desk & Immigration Counter Guidance" },
      { src: dutyImg, alt: "Duty Free Shopping & Boarding Gate Assistance" },
    ],
  },
];

const AIRPORTS = [
  { code: "DEL", name: "Delhi — Indira Gandhi Intl (IGI)", city: "New Delhi" },
  { code: "BOM", name: "Mumbai — Chhatrapati Shivaji Maharaj (CSMIA)", city: "Mumbai" },
  { code: "BLR", name: "Bengaluru — Kempegowda Intl Airport", city: "Bengaluru" },
  { code: "HYD", name: "Hyderabad — Rajiv Gandhi Intl Airport", city: "Hyderabad" },
  { code: "CCU", name: "Kolkata — Netaji Subhash Chandra Bose", city: "Kolkata" },
  { code: "MAA", name: "Chennai — International Airport", city: "Chennai" },
  { code: "GOI", name: "Goa — Dabolim / Manohar Intl Airport (GOX)", city: "Goa" },
  { code: "COK", name: "Kochi — Cochin International Airport", city: "Kochi" },
  { code: "AMD", name: "Ahmedabad — Sardar Vallabhbhai Patel", city: "Ahmedabad" },
  { code: "JAI", name: "Jaipur — International Airport", city: "Jaipur" },
  { code: "LKO", name: "Lucknow — Chaudhary Charan Singh", city: "Lucknow" },
  { code: "ATQ", name: "Amritsar — Sri Guru Ram Dass Jee", city: "Amritsar" },
  { code: "DXB", name: "Dubai — International Airport (DXB)", city: "Dubai" },
  { code: "LHR", name: "London — Heathrow Airport (LHR)", city: "London" },
  { code: "SIN", name: "Singapore — Changi Airport (SIN)", city: "Singapore" },
];

function MeetGreetDedicatedPage() {
  const navigate = useNavigate();
  const [selectedSubService, setSelectedSubService] = useState<MeetGreetOptionKey>("Domestic Departure");
  const [selectedTransitType, setSelectedTransitType] = useState<string>("Domestic to Domestic");

  const activeCatalog = CATALOG_DATA.find((c) => c.id === selectedSubService) || CATALOG_DATA[0];

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-24 selection:bg-lime-200 selection:text-lime-950">
      {/* ─────────────────────────────────────────────────────────────
          1. COMPLETE HERO PHOTO (Pure White Canvas, Full Uncropped Photo)
          ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full bg-white overflow-hidden border-b border-slate-200">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header Bar with Back Button & Breadcrumbs */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  navigate({ to: "/" });
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-lime-50 text-slate-800 hover:text-lime-800 border border-slate-300 hover:border-lime-400 text-xs font-mono font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              title="Go back"
            >
              <ArrowLeft size={14} className="text-lime-600" />
              <span>Back</span>
            </button>

            <div
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-lime-700 font-bold bg-lime-50 px-3.5 py-1.5 rounded-full border border-lime-200"
              style={mono}
            >
              <Sparkles size={13} className="text-lime-600" />
              <span>PRIMARY AVIATION SERVICES</span>
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto mb-8">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight text-center"
              style={display}
            >
              Meet & Greet and Lounge <span className="text-lime-600">Service</span>
            </h1>
          </div>

          {/* Perfectly Fit Uncropped Hero Image Container */}
          <div className="max-w-6xl mx-auto">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-md bg-slate-900 border border-slate-100 flex items-center justify-center">
              <img
                src={meetGreetImg}
                alt="Shafsky Meet & Greet and Lounge Service Airport Team"
                className="w-full h-auto object-contain object-center select-none block max-h-[580px]"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-slate-200 py-6 sm:py-8">
        <BookingPanel />
      </section>

      <section className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div
              className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.4em] text-lime-700 font-bold font-mono bg-lime-50 px-3.5 py-1 rounded-full border border-lime-200"
              style={mono}
            >
              <span>COMPANY CATALOG SPECIFICATIONS</span>
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-950 tracking-tight" style={display}>
              Service Inclusions & Workflow.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Authoritative step-by-step airside protocol and operational visual catalog.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap mb-12 sm:mb-16">
            {CATALOG_DATA.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedSubService(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  selectedSubService === cat.id
                    ? "bg-lime-500 text-slate-950 shadow-md ring-2 ring-lime-400 border border-lime-600"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-lime-400 hover:bg-lime-50/50"
                }`}
              >
                {cat.id}
              </button>
            ))}
          </div>

          {/* Active Catalog Showcase (Seamless Pure Editorial Layout without Boxed Card Container) */}
          <div className="w-full">
            {/* Optional Full Width Hero Banner (e.g. for Transit Service - Zero Cropping) */}
            {activeCatalog.heroBanner && (
              <div className="mb-10 rounded-2xl overflow-hidden shadow-sm bg-slate-50 border border-slate-100">
                <img
                  src={activeCatalog.heroBanner}
                  alt="Transit Service Waiting Lounge & Apron View"
                  className="w-full h-auto object-contain object-center select-none block"
                />
              </div>
            )}

            {/* Optional Transit Header & Tagline */}
            {activeCatalog.tagline && (
              <div className="text-center mb-10 pb-6 border-b border-slate-100">
                <h3
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-lime-600 tracking-wide mb-2"
                  style={display}
                >
                  {activeCatalog.id}
                </h3>
                <p className="text-sm sm:text-base text-slate-700 italic max-w-2xl mx-auto">
                  "{activeCatalog.tagline}"
                </p>
              </div>
            )}

            {/* 2-Column Balanced Editorial Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
              {/* Left Column: Authentic Inclusions & Transit Types */}
              <div className="lg:col-span-6 flex flex-col justify-start">
                {!activeCatalog.tagline && (
                  <>
                    <div
                      className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-lime-700 font-mono font-bold mb-3"
                      style={mono}
                    >
                      <span className="w-2 h-2 rounded-full bg-lime-500 inline-block" />
                      AIRSIDE EXCELLENCE SPECIFICATIONS
                    </div>

                    <h3
                      className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0a196f] tracking-tight mb-6"
                      style={display}
                    >
                      {activeCatalog.id}
                    </h3>
                  </>
                )}

                {activeCatalog.transitTypes && !activeCatalog.tagline && (
                  <div className="mb-6 p-4 rounded-2xl bg-lime-50/80 border border-lime-300 text-xs font-mono">
                    <span className="font-bold text-lime-900 block mb-1">Supported transit types:</span>
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                      {activeCatalog.transitTypes.map((tt) => (
                        <li key={tt}>{tt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-4 sm:space-y-4.5">
                  {activeCatalog.inclusions.map((inc, i) => (
                    <div key={i} className="flex items-start gap-3.5 text-sm sm:text-[15px] text-slate-900 leading-snug">
                      <span className="text-slate-900 font-bold text-xl leading-none mt-0.5">•</span>
                      <span className="font-semibold text-slate-900">{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Original Aspect Ratio Uncropped Gallery */}
              <div className="lg:col-span-6">
                {(() => {
                  const allImages = [
                    ...activeCatalog.topImages,
                    ...(activeCatalog.bottomImages || []),
                  ];

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {allImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="w-full rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 bg-white group hover:border-lime-400 transition-all"
                        >
                          <div className="w-full bg-slate-50 overflow-hidden flex items-center justify-center">
                            <img
                              src={img.src}
                              alt={img.alt}
                              className="w-full h-auto object-contain object-center select-none block group-hover:scale-102 transition-transform duration-500"
                            />
                          </div>
                          <div className="p-3 bg-white border-t border-slate-100">
                            <span className="text-[11px] font-mono font-bold text-slate-800 tracking-wide block">
                              {img.alt}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
