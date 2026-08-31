import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  Plane,
  Gauge,
  Compass,
  ArrowRight,
  Clock,
  ShieldCheck,
  Users,
  Luggage,
  Sparkles,
  Zap,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { display, mono, C } from "../theme";

interface AircraftModel {
  id: string;
  name: string;
  category: string;
  rangeNm: number;
  speedKts: number;
  mach: string;
  pax: number;
  baggageCuFt: number;
  altitudeFt: string;
  hourlyRateEstimate: string;
  features: string[];
}

const AIRCRAFT_FLEET: AircraftModel[] = [
  {
    id: "g650er",
    name: "Gulfstream G650ER",
    category: "Ultra-Long Range Heavy Jet",
    rangeNm: 7500,
    speedKts: 516,
    mach: "Mach 0.90",
    pax: 16,
    baggageCuFt: 195,
    altitudeFt: "51,000 ft (FL510)",
    hourlyRateEstimate: "Bespoke Quote on Request",
    features: [
      "Master private stateroom with double bed",
      "Bespoke Michelin-curated in-flight galley",
      "Ultra-quiet cabin with 100% fresh air replenishment every 2 mins",
      "Intercontinental non-stop capability (Delhi to London/Tokyo)",
    ],
  },
  {
    id: "challenger350",
    name: "Bombardier Challenger 350",
    category: "Super Midsize Executive Jet",
    rangeNm: 3200,
    speedKts: 470,
    mach: "Mach 0.82",
    pax: 9,
    baggageCuFt: 106,
    altitudeFt: "45,000 ft (FL450)",
    hourlyRateEstimate: "Bespoke Quote on Request",
    features: [
      "Flat-floor stand-up cabin with hand-stitched leather club seating",
      "High-speed Ka-band satellite Wi-Fi & entertainment",
      "Direct transcontinental non-stop (Mumbai to Dubai/Singapore)",
      "Unmatched short-runway high-altitude airfield performance",
    ],
  },
  {
    id: "phenom300",
    name: "Embraer Phenom 300E",
    category: "Light Executive Jet",
    rangeNm: 2010,
    speedKts: 453,
    mach: "Mach 0.78",
    pax: 7,
    baggageCuFt: 84,
    altitudeFt: "45,000 ft (FL450)",
    hourlyRateEstimate: "Bespoke Quote on Request",
    features: [
      "Best-in-class light jet speed and cabin pressurization",
      "Ideal for rapid domestic city pairs & same-day return trips",
      "Largest baggage compartment in its category",
      "2-hour rapid charter dispatch readiness",
    ],
  },
  {
    id: "aw139",
    name: "Leonardo AW139",
    category: "Twin-Turbine VIP Helicopter",
    rangeNm: 570,
    speedKts: 165,
    mach: "165 kts",
    pax: 6,
    baggageCuFt: 45,
    altitudeFt: "15,000 ft",
    hourlyRateEstimate: "Bespoke Quote on Request",
    features: [
      "Point-to-point urban & remote helipad access",
      "Full VIP soundproofing & leather captain chairs",
      "All-weather IFR instrument flight clearance",
      "Direct resort & palace estate rooftop landing capability",
    ],
  },
];

interface RoutePreset {
  from: string;
  to: string;
  fromCode: string;
  toCode: string;
  distanceNm: number;
}

const POPULAR_ROUTES: RoutePreset[] = [
  { from: "New Delhi (DEL)", to: "Mumbai (BOM)", fromCode: "DEL", toCode: "BOM", distanceNm: 615 },
  { from: "New Delhi (DEL)", to: "Dubai (DXB)", fromCode: "DEL", toCode: "DXB", distanceNm: 1180 },
  { from: "Mumbai (BOM)", to: "London (LHR)", fromCode: "BOM", toCode: "LHR", distanceNm: 3880 },
  { from: "Bengaluru (BLR)", to: "Singapore (SIN)", fromCode: "BLR", toCode: "SIN", distanceNm: 1720 },
  { from: "New Delhi (DEL)", to: "Goa (GOX)", fromCode: "DEL", toCode: "GOX", distanceNm: 810 },
  { from: "Mumbai (BOM)", to: "Maldives (MLE)", fromCode: "BOM", toCode: "MLE", distanceNm: 900 },
];

export function FleetRangeCalculator() {
  const [selectedAircraft, setSelectedAircraft] = useState<AircraftModel>(AIRCRAFT_FLEET[0]);
  const [selectedRoute, setSelectedRoute] = useState<RoutePreset>(POPULAR_ROUTES[0]);

  // Telemetry Calculations
  const telemetry = useMemo(() => {
    const distNm = selectedRoute.distanceNm;
    const distKm = Math.round(distNm * 1.852);
    const speed = selectedAircraft.speedKts;
    
    // Add 25 mins for climb/descent/taxi
    const flightTimeHours = (distNm / speed) + (25 / 60);
    const hours = Math.floor(flightTimeHours);
    const minutes = Math.round((flightTimeHours - hours) * 60);

    const isNonStop = distNm <= selectedAircraft.rangeNm;
    const rangeUtilizationPercent = Math.min(100, Math.round((distNm / selectedAircraft.rangeNm) * 100));

    return {
      distNm,
      distKm,
      flightTime: `${hours}h ${minutes < 10 ? "0" + minutes : minutes}m`,
      isNonStop,
      rangeUtilizationPercent,
    };
  }, [selectedAircraft, selectedRoute]);

  return (
    <section
      id="fleet-calculator"
      className="relative px-4 py-20 sm:px-8 sm:py-28 md:px-14 md:py-36 bg-[#050b14] text-white overflow-hidden border-t border-[#c5a869]/20"
    >
      <div className="relative z-10 mx-auto max-w-[1480px]">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div
            className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.45em] text-[#d9c18b] font-bold"
            style={mono}
          >
            <span className="h-px w-8 bg-[#c5a869]/50" />
            <span>INTERACTIVE PRIVATE CHARTER TELEMETRY</span>
            <span className="h-px w-8 bg-[#c5a869]/50" />
          </div>
          <h2
            className="mt-4 text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.05] text-white font-normal tracking-tight"
            style={display}
          >
            Aircraft Range &{" "}
            <span
              className="italic font-normal"
              style={{
                background: "linear-gradient(135deg, #d9c18b 0%, #c5a869 50%, #fef3e2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Flight Estimator.
            </span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Simulate executive flight times, non-stop range capabilities, and seating capacities across our private jet and helicopter charter fleet.
          </p>
        </div>

        {/* 4 Aircraft Category Selector Tabs */}
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden justify-start lg:justify-center">
          {AIRCRAFT_FLEET.map((ac) => {
            const isSelected = ac.id === selectedAircraft.id;
            return (
              <button
                key={ac.id}
                type="button"
                onClick={() => setSelectedAircraft(ac)}
                className={`px-5 py-3.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-[#11223b] border-[#c5a869] shadow-[0_0_20px_rgba(197,168,105,0.2)]"
                    : "bg-[#0a1424] border-white/10 hover:border-[#c5a869]/40 hover:bg-[#0e1b2f]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Plane size={15} className={isSelected ? "text-[#c5a869]" : "text-slate-400"} />
                  <span className="text-xs font-bold text-white tracking-wide">{ac.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1" style={mono}>
                  {ac.category}
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Main Simulator Box */}
        <div className="mt-10 rounded-3xl bg-[#0a1424] border border-[#c5a869]/35 p-6 sm:p-10 lg:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Route Selector & Live Calculation */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-[#d9c18b] font-mono font-bold mb-3" style={mono}>
                  Select Mission Route
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {POPULAR_ROUTES.map((route) => {
                    const isSelected = route.fromCode === selectedRoute.fromCode && route.toCode === selectedRoute.toCode;
                    return (
                      <button
                        key={`${route.fromCode}-${route.toCode}`}
                        type="button"
                        onClick={() => setSelectedRoute(route)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#11223b] border-[#c5a869] text-white"
                            : "bg-[#050b14] border-white/10 hover:border-white/25 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>{route.fromCode} → {route.toCode}</span>
                          <span className="text-[10px] text-[#d9c18b] font-mono" style={mono}>{route.distanceNm} nm</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 truncate">
                          {route.from.split(" ")[0]} to {route.to.split(" ")[0]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Flight Telemetry Calculation Card */}
              <div className="p-6 rounded-2xl bg-[#050b14] border border-[#c5a869]/30">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <div className="text-[9.5px] uppercase tracking-wider text-slate-400 font-mono" style={mono}>
                      Estimated Flight Time
                    </div>
                    <div className="text-3xl font-bold font-mono text-[#d9c18b] mt-1" style={mono}>
                      {telemetry.flightTime}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[9.5px] uppercase tracking-wider text-slate-400 font-mono" style={mono}>
                      Distance
                    </div>
                    <div className="text-lg font-bold text-white font-mono mt-1" style={mono}>
                      {telemetry.distNm.toLocaleString()} nm ({telemetry.distKm.toLocaleString()} km)
                    </div>
                  </div>
                </div>

                {/* Range Bar Indicator */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5" style={mono}>
                    <span>Aircraft Range Utilization</span>
                    <span className="text-white font-bold">{telemetry.rangeUtilizationPercent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        telemetry.isNonStop ? "bg-gradient-to-r from-[#c5a869] to-[#d9c18b]" : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.min(100, telemetry.rangeUtilizationPercent)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono" style={mono}>
                    <span>Max Aircraft Range: {selectedAircraft.rangeNm.toLocaleString()} nm</span>
                    <span className={telemetry.isNonStop ? "text-emerald-400" : "text-amber-400"}>
                      {telemetry.isNonStop ? "✓ Non-Stop Direct Flight" : "⚠ Technical Fuel Stop Required"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Selected Aircraft Technical Specifications */}
            <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-2xl font-bold font-serif text-white" style={display}>
                      {selectedAircraft.name}
                    </h3>
                    <div className="text-xs text-[#d9c18b] font-mono mt-0.5" style={mono}>
                      {selectedAircraft.category}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono" style={mono}>Estimated Charter</div>
                    <div className="text-xs font-bold text-white font-mono" style={mono}>{selectedAircraft.hourlyRateEstimate}</div>
                  </div>
                </div>

                {/* 4 Technical Badges */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3" style={mono}>
                  <div className="p-3 rounded-xl bg-[#050b14] border border-white/10">
                    <div className="text-[9px] uppercase text-slate-400">Max Pax</div>
                    <div className="text-base font-bold text-white mt-0.5">{selectedAircraft.pax} Guests</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#050b14] border border-white/10">
                    <div className="text-[9px] uppercase text-slate-400">Speed</div>
                    <div className="text-base font-bold text-white mt-0.5">{selectedAircraft.mach}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#050b14] border border-white/10">
                    <div className="text-[9px] uppercase text-slate-400">Luggage</div>
                    <div className="text-base font-bold text-white mt-0.5">{selectedAircraft.baggageCuFt} cu ft</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#050b14] border border-white/10">
                    <div className="text-[9px] uppercase text-slate-400">Ceiling</div>
                    <div className="text-base font-bold text-white mt-0.5">{selectedAircraft.altitudeFt.split(" ")[0]}</div>
                  </div>
                </div>

                {/* Aircraft Key Luxuries */}
                <div className="mt-6 space-y-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono" style={mono}>
                    In-Flight Inclusions & Amenities
                  </div>
                  {selectedAircraft.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#c5a869] mt-1.5 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Booking CTA */}
              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-300 font-light">
                  2-hour rapid dispatch from Indira Gandhi Intl Airport (DEL).
                </div>
                <Link
                  to="/charter"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-xl bg-[#c5a869] hover:bg-[#d9c18b] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-[#050b14] shadow-md transition-all hover:scale-[1.02] active:scale-98 cursor-pointer shrink-0"
                  style={mono}
                >
                  <span>Request Bespoke Quote</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
