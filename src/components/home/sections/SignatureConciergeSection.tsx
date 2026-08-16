import React from "react";
import { Link } from "@tanstack/react-router";
import { PlaneLanding, PlaneTakeoff, Shuffle, ArrowRight, Crown } from "lucide-react";
import { display, mono } from "../theme";
import meetGreetImg from "@/assets/meet-greet.png";

export function SignatureConciergeSection() {
  const highlights = [
    {
      title: "Arrival Concierge",
      desc: "Aerobridge greeting with personalized placard, priority passport clearance & luggage retrieval.",
      icon: PlaneLanding,
      tag: "Arrival",
    },
    {
      title: "Departure Concierge",
      desc: "Curbside porter greeting, expedited check-in desk clearance & premium lounge escort.",
      icon: PlaneTakeoff,
      tag: "Departure",
    },
    {
      title: "Transit Concierge",
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
    <section id="airport-concierge" className="relative px-6 py-20 md:px-14 md:py-28 bg-[#faf8f5] text-slate-900 overflow-hidden border-y border-amber-200/50">
      {/* Soft Ambient Radial Glows - Pure Cream & Warm Ivory Theme */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-100/60 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-stone-200/50 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-50/50 blur-[150px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[1480px]">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.45em]"
            style={{ ...mono, color: "#92400e" }}
          >
            <span className="h-px w-10 bg-amber-400/60" />
            FLAGSHIP AIRPORT OFFERING
            <span className="h-px w-10 bg-amber-400/60" />
          </div>
          <h2
            className="mt-5 text-[clamp(2.2rem,5vw,4.2rem)] leading-[1.05] font-serif text-slate-900 tracking-tight"
            style={display}
          >
            Signature Airport <span className="italic bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 bg-clip-text text-transparent">Concierge Experience.</span>
          </h2>
          <p className="mt-4 text-sm md:text-base text-slate-600 font-body-luxury max-w-2xl mx-auto leading-relaxed">
            Meet & Greet is our company's flagship airport experience — engineered to eliminate every queue, counter, and uncertainty across 20+ international airport hubs.
          </p>
        </div>

        {/* Flagship Hero Card Layout */}
        <div className="mt-14 relative rounded-[36px] border border-white/90 bg-gradient-to-br from-white/80 via-white/50 to-amber-50/30 shadow-[inset_0_1px_3px_0_rgba(255,255,255,1),0_25px_60px_-15px_rgba(217,119,6,0.12)] p-6 sm:p-10 lg:p-12 backdrop-blur-2xl backdrop-saturate-150 overflow-hidden">
          {/* Specular Liquid Light Rays */}
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-white/90 via-white/40 to-transparent blur-2xl pointer-events-none opacity-80" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-gradient-to-tl from-amber-300/30 via-white/20 to-transparent blur-2xl pointer-events-none opacity-60" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Visual Media Showcase */}
            <div className="lg:col-span-5 relative h-72 sm:h-96 rounded-2xl overflow-hidden group shadow-xl border border-white/90">
              <img
                src={meetGreetImg}
                alt="Signature Airport Concierge Escort"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />
              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-amber-300 border border-amber-400/40" style={mono}>
                ★ Flagship Experience
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="text-xl font-bold font-serif text-white">Suswagatam Escort</div>
                <div className="text-xs text-amber-100 mt-1 font-body-luxury">One dedicated officer for your entire airport journey.</div>
              </div>
            </div>

            {/* Highlights Grid */}
            <div className="lg:col-span-7 flex flex-col justify-between h-full gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {highlights.map((h) => {
                  const HIcon = h.icon;
                  return (
                    <div
                      key={h.title}
                      className="relative p-6 rounded-2xl bg-gradient-to-br from-white/80 via-white/40 to-amber-50/20 backdrop-blur-2xl backdrop-saturate-200 border border-white/90 shadow-[inset_0_1px_2px_0_rgba(255,255,255,0.9),0_12px_36px_rgba(217,119,6,0.08)] hover:shadow-[inset_0_1px_3px_0_rgba(255,255,255,1),0_22px_50px_rgba(217,119,6,0.18)] hover:border-amber-400/90 hover:bg-white/90 hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-500 ease-out group/h overflow-hidden"
                    >
                      {/* Pure Liquid Specular Reflection */}
                      <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-white/90 via-white/30 to-transparent rounded-full blur-xl pointer-events-none opacity-70 group-hover/h:scale-125 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-amber-500/10 opacity-50 group-hover/h:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="h-11 w-11 rounded-2xl bg-gradient-to-b from-white/90 via-amber-100/60 to-amber-200/30 backdrop-blur-md text-amber-900 border border-white/90 shadow-[inset_0_1px_2px_rgba(255,255,255,1),0_4px_14px_rgba(217,119,6,0.12)] flex items-center justify-center group-hover/h:rotate-6 group-hover/h:scale-110 transition-all duration-300">
                            <HIcon size={20} />
                          </div>
                          <span className="text-[9px] font-mono uppercase tracking-wider text-amber-950 bg-white/80 backdrop-blur-xl px-3.5 py-1 rounded-full border border-white/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(217,119,6,0.08)]" style={mono}>
                            {h.tag}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 font-body-luxury group-hover/h:text-amber-800 transition-colors">
                          {h.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-body-luxury">
                          {h.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action CTA */}
              <div className="pt-4 border-t border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-600 font-body-luxury text-center sm:text-left">
                  Packages & pricing appear dynamically after selecting your airport hub.
                </div>
                <Link
                  to="/airports"
                  className="group/cta inline-flex items-center gap-3 rounded-xl bg-amber-600 hover:bg-amber-700 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.25em] text-white shadow-lg shadow-amber-600/20 transition-all duration-300 active:scale-98 cursor-pointer shrink-0"
                  style={mono}
                >
                  <span>Explore Airport Services</span>
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover/cta:translate-x-1.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── ENTERPRISE SOLUTIONS — PREMIUM GSAP SHOWCASE ─────────────────── */

