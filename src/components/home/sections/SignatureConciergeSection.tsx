import React from "react";
import { Link } from "@tanstack/react-router";
import { PlaneLanding, PlaneTakeoff, Shuffle, ArrowRight, Crown, Sparkles, ShieldCheck, Clock } from "lucide-react";
import { display, mono } from "../theme";
import { HOMEPAGE_PHOTOS } from "@/lib/homepage-photos";
import { EditorialPhoto } from "../EditorialPhoto";

export function SignatureConciergeSection() {
  const highlights = [
    {
      title: "Arrival Service",
      desc: "Aerobridge greeting with personalized placard, priority passport clearance & luggage retrieval.",
      icon: PlaneLanding,
      tag: "Arrival",
    },
    {
      title: "Departure Service",
      desc: "Curbside porter greeting, expedited check-in desk clearance & premier lounge escort.",
      icon: PlaneTakeoff,
      tag: "Departure",
    },
    {
      title: "Transit Service",
      desc: "Gate-to-gate buggy transport, terminal transit navigation & luggage re-check liaison.",
      icon: Shuffle,
      tag: "Transit",
    },
    {
      title: "Meet & Greet VVIP",
      desc: "Private luxury tarmac transfer sedan directly to the aircraft gate steps.",
      icon: Crown,
      tag: "VVIP Tarmac",
    },
  ];

  return (
    <section
      id="airport-concierge"
      className="relative px-4 py-16 sm:px-8 sm:py-24 md:px-14 md:py-32 bg-white text-slate-900 overflow-hidden border-y border-slate-200"
    >
      <div className="relative z-10 mx-auto max-w-[1480px]">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">

          <h2
            className="mt-4 sm:mt-5 text-[clamp(2.2rem,4.5vw,4.2rem)] leading-[1.06] text-slate-950 tracking-tight font-bold"
            style={display}
          >
            Meet & Greet and{" "}
            <span className="text-lime-600 font-bold">
              Lounge Service.
            </span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Shafsky Aviation's flagship airside hospitality experience — engineered to eliminate every queue, counter, and uncertainty across 20+ airport hubs.
          </p>
        </div>

        {/* 1. PRIMARY DUAL-PHOTOGRAPHY SHOWCASE (Complete Uncropped Images with zero text on image) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12 lg:mb-16">
          {/* Left Feature: VVIP Terminal Arrival */}
          <div className="lg:col-span-7 flex flex-col rounded-3xl border-2 border-lime-500/30 bg-white overflow-hidden shadow-md hover:shadow-xl hover:border-lime-500 transition-all duration-300">
            <div className="w-full bg-transparent p-1 sm:p-1.5">
              <EditorialPhoto
                src={HOMEPAGE_PHOTOS.vvipTerminal.src}
                alt={HOMEPAGE_PHOTOS.vvipTerminal.alt}
                width={HOMEPAGE_PHOTOS.vvipTerminal.width}
                height={HOMEPAGE_PHOTOS.vvipTerminal.height}
                aspectRatio={HOMEPAGE_PHOTOS.vvipTerminal.aspectRatio}
                objectFit="contain" // ZERO CROP
                containerBg="bg-transparent"
                className="w-full rounded-2xl"
              />
            </div>
            {/* Descriptive Content Below Photo */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-lime-700 uppercase" style={mono}>
                  <Crown size={13} className="text-lime-600" />
                  <span>Curbside Red Carpet Reception</span>
                </div>
                <h3 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900" style={display}>
                  VVIP Terminal Access & Chauffeur Handover
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Direct curbside reception with dedicated luggage porter, private security clearance, and discreet executive lounge access before boarding.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono" style={mono}>STANDARD OF EXCELLENCE</span>
                <Link
                  to="/solutions/concierge"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-lime-700 hover:text-lime-800 transition-colors"
                >
                  <span>Explore Terminal Services</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Feature: Airside Concierge Concourse Escort */}
          <div className="lg:col-span-5 flex flex-col rounded-3xl border-2 border-lime-500/30 bg-white overflow-hidden shadow-md hover:shadow-xl hover:border-lime-500 transition-all duration-300">
            <div className="w-full bg-transparent p-1 sm:p-1.5">
              <EditorialPhoto
                src={HOMEPAGE_PHOTOS.meetGreetEscort.src}
                alt={HOMEPAGE_PHOTOS.meetGreetEscort.alt}
                width={HOMEPAGE_PHOTOS.meetGreetEscort.width}
                height={HOMEPAGE_PHOTOS.meetGreetEscort.height}
                aspectRatio={HOMEPAGE_PHOTOS.meetGreetEscort.aspectRatio}
                objectFit="contain" // ZERO CROP
                containerBg="bg-transparent"
                className="w-full rounded-2xl"
              />
            </div>
            {/* Descriptive Content Below Photo */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-lime-700 uppercase" style={mono}>
                  <Sparkles size={13} className="text-lime-600" />
                  <span>Personal Officer Escort</span>
                </div>
                <h3 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900" style={display}>
                  Concourse & Tarmac Liaison
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Personal guest relations officer walking alongside you from the aerobridge through expedited passport control to baggage claim.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono" style={mono}>20+ HUBS ACTIVE</span>
                <Link
                  to="/airports"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-lime-700 hover:text-lime-800 transition-colors"
                >
                  <span>View Airport Network</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 2. THIRD FEATURE: VVIP LOUNGE SANCTUARY (Complete Uncropped Image) */}
        <div className="rounded-3xl border-2 border-lime-500/30 bg-white overflow-hidden shadow-md mb-12 lg:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 w-full bg-transparent p-1 sm:p-1.5">
              <EditorialPhoto
                src={HOMEPAGE_PHOTOS.vvipLounge.src}
                alt={HOMEPAGE_PHOTOS.vvipLounge.alt}
                width={HOMEPAGE_PHOTOS.vvipLounge.width}
                height={HOMEPAGE_PHOTOS.vvipLounge.height}
                aspectRatio={HOMEPAGE_PHOTOS.vvipLounge.aspectRatio}
                objectFit="contain" // ZERO CROP
                containerBg="bg-transparent"
                className="w-full rounded-2xl"
                imageClassName="w-full h-auto object-contain mx-auto"
              />
            </div>
            <div className="lg:col-span-6 p-6 sm:p-10 md:p-12 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-lime-700 uppercase" style={mono}>
                  <ShieldCheck size={14} className="text-lime-600" />
                  <span>Exclusive Lounge Sanctuary</span>
                </div>
                <h3 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900" style={display}>
                  Private Tarmac-View Lounges
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  High-speed private Wi-Fi, à la carte dining, private rest suites, and real-time boarding alerts while our team monitors your flight dispatch.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-lime-50 border border-lime-200">
                    <span className="font-bold text-slate-900 block">Flight Radar Monitored</span>
                    <span className="text-slate-600 text-[11px]">Direct gate alert updates</span>
                  </div>
                  <div className="p-3 rounded-xl bg-lime-50 border border-lime-200">
                    <span className="font-bold text-slate-900 block">Private Dining & Bar</span>
                    <span className="text-slate-600 text-[11px]">Curated chef menus</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono" style={mono}>LOUNGE ACCESS INCLUDED</span>
                <a
                  href="/#book"
                  onClick={(e) => {
                    const el = document.getElementById("book");
                    if (el) {
                      e.preventDefault();
                      el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }}
                  className="group/btn relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-[#84cc16] px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-950 shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-lime-500/40 hover:-translate-y-0.5 cursor-pointer"
                >
                  <div className="absolute inset-0 w-[200%] -translate-x-[150%] bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
                  <div className="absolute inset-0 bg-[#a3e635] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative z-10">Book Now</span>
                  <ArrowRight size={14} className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 4-SERVICE PROTOCOL HIGHLIGHTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-lime-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-lime-700 font-bold uppercase tracking-wider" style={mono}>
                      {item.tag}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-lime-100 flex items-center justify-center text-lime-700">
                      <Icon size={16} />
                    </div>
                  </div>
                  <h4 className="mt-3 text-base font-bold text-slate-900" style={display}>
                    {item.title}
                  </h4>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-mono text-slate-500" style={mono}>
                  GUARANTEED PROTOCOL
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default SignatureConciergeSection;
