import React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Clock,
  ShieldCheck,
  ConciergeBell,
  MapPin,
  Plane,
  Layers,
  Users,
  Compass,
  FileCheck,
} from "lucide-react";
import { getAirportServices, type Airport } from "@/data/airports";

interface AirportQuickFactsProps {
  a: Airport;
}

export function AirportQuickFacts({ a }: AirportQuickFactsProps) {
  const availableServices = getAirportServices(a.code);

  const facts = [
    {
      title: "Airport Services Available",
      value: `${availableServices.length} Staged Services`,
      desc: "Meet & Greet, VIP Lounge, Fast Track & Chauffeured Transfers",
      icon: ConciergeBell,
      color: "#c5a059",
    },
    {
      title: "Terminal Information",
      value: a.airport.terminals || "Multi-Terminal Hub",
      desc: `Capacity: ${a.airport.capacity || "50M+ passengers/yr"}`,
      icon: Building2,
      color: "#5fb5ad",
    },
    {
      title: "Working Hours",
      value: "24/7 Live Operations",
      desc: "Round-the-clock airside host staging & flight dispatch",
      icon: Clock,
      color: "#c5a059",
    },
    {
      title: "Premium Assistance Available",
      value: "VVIP Airside Escort",
      desc: "Aerobridge placard welcome & tarmac limousine handoff",
      icon: ShieldCheck,
      color: "#5fb5ad",
    },
  ];

  const specs = [
    { label: "Airport Code", value: `${a.code} / ${a.icao}` },
    { label: "Elevation", value: a.airport.elevation || "Elevated Hub" },
    { label: "Runways", value: a.airport.runways || "Multi-Runway Operations" },
    { label: "Operator", value: a.airport.operator || "Civil Aviation Authority" },
    { label: "Airport Type", value: a.airport.type || "International Gateway" },
    { label: "Annual Traffic", value: a.airport.annual || "High Capacity" },
    { label: "Domestic Operations", value: a.airport.domestic || "Domestic Concourse & Gates" },
    { label: "International Gateways", value: a.airport.intl || "International Concourse & Gates" },
  ];

  return (
    <section className="my-14 space-y-10">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#c5a059]">
            <Compass className="w-3.5 h-3.5" />
            <span>Hub Overview & Operations</span>
          </div>
          <h2
            className="mt-2 text-3xl sm:text-4xl font-serif font-light text-white"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Quick Facts & <span className="italic text-[#c5a059]">Intelligence.</span>
          </h2>
        </div>

        <div className="text-xs text-white/60 font-mono tracking-wider">
          Hub Code: <span className="text-[#c5a059] font-bold">{a.code}</span> · {a.city}, {a.country}
        </div>
      </div>

      {/* 1. TOP 4 QUICK FACTS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {facts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 rounded-3xl bg-[#0e131d]/90 border border-white/10 hover:border-[#c5a059]/50 transition-all duration-300 shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#c5a059]/5 rounded-full blur-xl group-hover:bg-[#c5a059]/15 transition-all pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center border"
                  style={{
                    backgroundColor: `${item.color}15`,
                    borderColor: `${item.color}35`,
                    color: item.color,
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">
                  Verified Spec
                </span>
              </div>

              <div className="text-[10px] font-mono uppercase tracking-widest text-white/50">
                {item.title}
              </div>

              <div
                className="mt-1 text-xl font-serif font-semibold text-white group-hover:text-[#c5a059] transition-colors"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {item.value}
              </div>

              <p className="mt-2 text-xs text-white/60 leading-relaxed font-sans">
                {item.desc}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* 2. AIRPORT SPECIFICATION GRID */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[#5fb5ad] mb-6">
          <FileCheck className="w-3.5 h-3.5" />
          <span>Technical Airport Data & Capabilities</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {specs.map((spec, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-[9px] font-mono uppercase tracking-widest text-white/40">
                {spec.label}
              </div>
              <div className="mt-1.5 text-sm font-semibold text-white font-mono tracking-wide">
                {spec.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
