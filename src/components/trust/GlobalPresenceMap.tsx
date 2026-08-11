import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Globe2, MapPin, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { AIRPORTS, getAirport } from "@/data/airports";
import { TiltCard, FadeInView, StaggerContainer, StaggerItem } from "@/components/ui/interactions";

export function GlobalPresenceMap() {
  const [activeRegion, setActiveRegion] = useState<"all" | "north" | "west" | "south" | "east" | "intl">("all");
  const [selectedHub, setSelectedHub] = useState<string>("DEL");

  const regionalHubs = {
    north: ["DEL", "ATQ", "IXC", "JAI"],
    west: ["BOM", "AMD", "GOI", "PNQ"],
    south: ["BLR", "HYD", "MAA", "COK"],
    east: ["CCU", "GAU", "BBI"],
    intl: ["DXB", "LHR", "SIN"],
  };

  const filteredAirports = AIRPORTS.filter((a) => {
    if (activeRegion === "all") return true;
    return regionalHubs[activeRegion]?.includes(a.code);
  });

  const activeAirport = getAirport(selectedHub) || AIRPORTS[0];

  return (
    <section className="my-20 relative">
      <FadeInView>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#c5a059]">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Network Coverage & Destinations</span>
            </div>
            <h2
              className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-white"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              19+ Flagship Airport Hubs Covered
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-white/60 font-sans max-w-xl">
            Round-the-clock airside host staging across all tier-1 international airports in India and strategic global aviation hubs.
          </p>
        </div>
      </FadeInView>

      {/* REGIONAL FILTER TABS */}
      <FadeInView>
        <div className="flex flex-wrap items-center gap-2 mb-8 p-1.5 rounded-2xl bg-white/5 border border-white/10 w-fit">
          {[
            { id: "all", label: "All Hubs (19+)" },
            { id: "north", label: "North India" },
            { id: "west", label: "West India" },
            { id: "south", label: "South India" },
            { id: "east", label: "East India" },
            { id: "intl", label: "Global Gateways" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveRegion(tab.id as any)}
              type="button"
              className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
                activeRegion === tab.id
                  ? "bg-[#c5a059] text-[#081119] font-bold shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </FadeInView>

      {/* MAP & HUB SHOWCASE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* INTERACTIVE HUB CARDS LIST */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredAirports.map((a) => {
            const isSelected = selectedHub === a.code;
            return (
              <div
                key={a.code}
                onClick={() => setSelectedHub(a.code)}
                className={`group p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "bg-[#c5a059]/15 border-[#c5a059] shadow-xl shadow-[#c5a059]/10"
                    : "bg-[#0e131d]/90 border-white/10 hover:border-white/30"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isSelected
                          ? "bg-[#c5a059] text-[#081119]"
                          : "bg-white/10 text-[#c5a059] group-hover:bg-[#c5a059] group-hover:text-[#081119] transition-colors"
                      }`}
                    >
                      {a.code}
                    </span>
                    <span className="text-[10px] font-mono text-white/40">{a.icao}</span>
                  </div>
                  <MapPin
                    className={`w-4 h-4 ${
                      isSelected ? "text-[#c5a059] animate-bounce" : "text-white/30"
                    }`}
                  />
                </div>

                <h3 className="text-base font-serif font-medium text-white group-hover:text-[#c5a059] transition-colors">
                  {a.city}
                </h3>
                <p className="text-xs text-white/50 truncate font-sans mt-0.5">
                  {a.airport?.name || a.country}
                </p>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span>24/7 Staged</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* ACTIVE SELECTED HUB FEATURE PREVIEW */}
        <div className="p-7 rounded-3xl bg-[#0e131d] border border-[#c5a059]/40 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/30 text-[#c5a059] text-[10px] font-mono font-bold uppercase tracking-wider">
                {activeAirport.code} Hub Verified
              </span>
              <Sparkles className="w-4 h-4 text-[#c5a059]" />
            </div>

            <h3
              className="text-2xl font-serif text-white font-medium"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {activeAirport.city} Concierge Desk
            </h3>

            <p className="mt-2 text-xs text-white/70 leading-relaxed font-sans">
              {activeAirport.airport.name || `${activeAirport.city} Airport`} operates with dedicated 24/7 uniformed airside hosts, aerobridge meeting credentials, and tarmac Maybach transfers.
            </p>

            <div className="mt-6 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-white/80">
                <CheckCircle2 className="w-4 h-4 text-[#c5a059]" />
                <span>Aerobridge Jet-Bridge Welcome</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-white/80">
                <CheckCircle2 className="w-4 h-4 text-[#c5a059]" />
                <span>Diplomatic Priority Immigration</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-white/80">
                <CheckCircle2 className="w-4 h-4 text-[#c5a059]" />
                <span>VIP Lounge Suite Access</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-white/80">
                <CheckCircle2 className="w-4 h-4 text-[#c5a059]" />
                <span>Chauffeured Maybach Tarmac Pickups</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-white/10">
            <Link
              to="/airports/$code"
              params={{ code: activeAirport.code }}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#c5a059] to-[#d4c09d] text-[#081119] font-mono text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
            >
              <span>Explore {activeAirport.code} Hub</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
