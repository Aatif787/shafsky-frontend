import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  Compass,
  Radio,
  Clock,
  ShieldCheck,
  Plane,
  ArrowUpRight,
  Wind,
  Thermometer,
  Eye,
  CheckCircle2,
  ChevronRight,
  Activity,
  Layers,
} from "lucide-react";
import { display, mono, C } from "../theme";

interface HubTelemetry {
  code: string;
  name: string;
  city: string;
  terminals: string[];
  activeOfficers: number;
  fastTrackWait: string;
  weather: {
    temp: string;
    condition: string;
    wind: string;
    vis: string;
  };
  vipLounge: string;
  status: "Operational" | "Optimal" | "High Traffic";
  lat: number;
  lng: number;
}

const HUBS_DATA: HubTelemetry[] = [
  {
    code: "DEL",
    name: "Indira Gandhi International",
    city: "New Delhi",
    terminals: ["T1", "T2", "T3"],
    activeOfficers: 18,
    fastTrackWait: "2 - 4 mins",
    weather: { temp: "24°C", condition: "Clear Sky", wind: "08 kts NW", vis: "10 km" },
    vipLounge: "Encalm Privé & GVK VIP",
    status: "Optimal",
    lat: 28.5562,
    lng: 77.1000,
  },
  {
    code: "BOM",
    name: "Chhatrapati Shivaji Maharaj",
    city: "Mumbai",
    terminals: ["T1", "T2"],
    activeOfficers: 14,
    fastTrackWait: "3 - 5 mins",
    weather: { temp: "29°C", condition: "Haze / Coastal", wind: "12 kts W", vis: "8 km" },
    vipLounge: "Adani VIP Lounge & Oasis",
    status: "Operational",
    lat: 19.0896,
    lng: 72.8656,
  },
  {
    code: "BLR",
    name: "Kempegowda International",
    city: "Bengaluru",
    terminals: ["T1", "T2 Garden"],
    activeOfficers: 11,
    fastTrackWait: "< 3 mins",
    weather: { temp: "22°C", condition: "Partly Cloudy", wind: "06 kts E", vis: "10 km" },
    vipLounge: "080 VIP International",
    status: "Optimal",
    lat: 13.1986,
    lng: 77.7066,
  },
  {
    code: "HYD",
    name: "Rajiv Gandhi International",
    city: "Hyderabad",
    terminals: ["Main Passenger"],
    activeOfficers: 9,
    fastTrackWait: "< 3 mins",
    weather: { temp: "27°C", condition: "Clear Sky", wind: "05 kts NE", vis: "10 km" },
    vipLounge: "Plaza Premium VIP",
    status: "Optimal",
    lat: 17.2403,
    lng: 78.4294,
  },
  {
    code: "GOX",
    name: "Manohar International (Mopa)",
    city: "Goa (North)",
    terminals: ["Integrated Terminal"],
    activeOfficers: 7,
    fastTrackWait: "< 2 mins",
    weather: { temp: "28°C", condition: "Coastal Breeze", wind: "14 kts SW", vis: "10 km" },
    vipLounge: "Mopa Executive Club",
    status: "Optimal",
    lat: 15.7500,
    lng: 73.8667,
  },
  {
    code: "CCU",
    name: "Netaji Subhash Chandra Bose",
    city: "Kolkata",
    terminals: ["Integrated T2"],
    activeOfficers: 8,
    fastTrackWait: "3 - 5 mins",
    weather: { temp: "26°C", condition: "Mild Humid", wind: "04 kts SE", vis: "7 km" },
    vipLounge: "Travel Club Lounge",
    status: "Operational",
    lat: 22.6547,
    lng: 88.4467,
  },
  {
    code: "MAA",
    name: "Chennai International",
    city: "Chennai",
    terminals: ["T1", "T4 International"],
    activeOfficers: 8,
    fastTrackWait: "3 - 4 mins",
    weather: { temp: "30°C", condition: "Sunny", wind: "10 kts E", vis: "9 km" },
    vipLounge: "TFS Executive Lounge",
    status: "Operational",
    lat: 12.9941,
    lng: 80.1709,
  },
  {
    code: "COK",
    name: "Cochin International",
    city: "Kochi",
    terminals: ["T1 Domestic", "T3 Intl"],
    activeOfficers: 6,
    fastTrackWait: "< 3 mins",
    weather: { temp: "28°C", condition: "Clear", wind: "07 kts W", vis: "10 km" },
    vipLounge: "Earth Lounge VIP",
    status: "Optimal",
    lat: 10.1518,
    lng: 76.3930,
  },
];

export function LiveTelemetryRadar() {
  const [selectedHub, setSelectedHub] = useState<HubTelemetry>(HUBS_DATA[0]);
  const [timeUtc, setTimeUtc] = useState<string>("");
  const [timeIst, setTimeIst] = useState<string>("");

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().slice(17, 25) + " UTC");
      setTimeIst(
        now.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " IST"
      );
    };
    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="telemetry"
      className="relative px-4 py-20 sm:px-8 sm:py-28 md:px-14 md:py-36 bg-[#03070e] text-white overflow-hidden border-t border-[#c5a869]/20"
    >
      {/* Background Precision Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: "linear-gradient(#c5a869 1px, transparent 1px), linear-gradient(90deg, #c5a869 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1480px]">
        {/* Top Header & Mission Control Clocks */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-[#c5a869]/20">
          <div>
            <div
              className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.45em] text-[#d9c18b] font-bold"
              style={mono}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c5a869] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c5a869]" />
              </span>
              <span>LIVE AIRSIDE OPERATIONS RADAR</span>
            </div>
            <h2
              className="mt-4 text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.05] text-white font-normal tracking-tight"
              style={display}
            >
              Real-Time Network{" "}
              <span
                className="italic font-normal"
                style={{
                  background: "linear-gradient(135deg, #d9c18b 0%, #c5a869 50%, #fef3e2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Intelligence.
              </span>
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-slate-300 max-w-xl font-light leading-relaxed">
              Continuous telemetry across all 20+ flagship Indian airport hubs. Monitor live protocol readiness, weather METARs, fast-track throughput, and active airside service dispatch.
            </p>
          </div>

          {/* Live Telemetry Clock Badges */}
          <div className="flex flex-wrap items-center gap-3" style={mono}>
            <div className="rounded-xl bg-[#0a1424] border border-[#c5a869]/30 px-4 py-3 flex items-center gap-3 shadow-md">
              <Clock size={16} className="text-[#c5a869]" />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400">Zulu / UTC</div>
                <div className="text-xs font-bold text-white tracking-widest">{timeUtc || "00:00:00 UTC"}</div>
              </div>
            </div>

            <div className="rounded-xl bg-[#0a1424] border border-[#c5a869]/30 px-4 py-3 flex items-center gap-3 shadow-md">
              <Radio size={16} className="text-[#c5a869]" />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400">Indian Standard</div>
                <div className="text-xs font-bold text-[#d9c18b] tracking-widest">{timeIst || "00:00:00 IST"}</div>
              </div>
            </div>

            <div className="rounded-xl bg-[#11223b] border border-[#c5a869]/40 px-4 py-3 flex items-center gap-2">
              <Activity size={16} className="text-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white">100% AIRSIDE DISPATCH READY</span>
            </div>
          </div>
        </div>

        {/* Hub Selector Matrix & Real-Time Panel */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Airport Hubs Quick Grid */}
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#d9c18b] font-mono font-bold mb-1" style={mono}>
              Select Airport Hub (20+ Network)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
              {HUBS_DATA.map((hub) => {
                const isSelected = hub.code === selectedHub.code;
                return (
                  <button
                    key={hub.code}
                    type="button"
                    onClick={() => setSelectedHub(hub)}
                    className={`relative p-4 rounded-2xl text-left border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#11223b] border-[#c5a869] shadow-[0_0_25px_rgba(197,168,105,0.15)]"
                        : "bg-[#0a1424] border-white/10 hover:border-[#c5a869]/40 hover:bg-[#0e1b2f]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold font-mono text-white" style={mono}>
                        {hub.code}
                      </span>
                      <span
                        className={`h-2 w-2 rounded-full ${
                          hub.status === "Optimal" ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                      />
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-medium text-white truncate">{hub.city}</div>
                      <div className="text-[10px] text-slate-400 truncate">{hub.activeOfficers} Officers On-Duty</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Hub Telemetry Monitor */}
          <div className="lg:col-span-7 rounded-3xl bg-[#0a1424] border border-[#c5a869]/35 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Top Hub Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-bold font-serif text-white tracking-tight" style={display}>
                    {selectedHub.name} ({selectedHub.code})
                  </h3>
                </div>
                <div className="text-xs text-[#d9c18b] font-mono mt-1" style={mono}>
                  {selectedHub.city}, India · Coordinates: {selectedHub.lat.toFixed(4)}° N, {selectedHub.lng.toFixed(4)}° E
                </div>
              </div>

              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold shrink-0 self-start sm:self-auto"
                style={mono}
              >
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>ALL CLEARANCES ACTIVE</span>
              </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4" style={mono}>
              <div className="p-4 rounded-2xl bg-[#050b14] border border-white/10">
                <div className="text-[9px] uppercase tracking-wider text-slate-400">Active Officers</div>
                <div className="mt-1 text-2xl font-bold text-[#d9c18b] font-mono">{selectedHub.activeOfficers}</div>
                <div className="text-[9.5px] text-slate-400 mt-1">Curbside & Airside</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#050b14] border border-white/10">
                <div className="text-[9px] uppercase tracking-wider text-slate-400">Fast-Track Wait</div>
                <div className="mt-1 text-2xl font-bold text-white font-mono">{selectedHub.fastTrackWait}</div>
                <div className="text-[9.5px] text-emerald-400 mt-1">Priority Lane Active</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#050b14] border border-white/10">
                <div className="text-[9px] uppercase tracking-wider text-slate-400">Weather / METAR</div>
                <div className="mt-1 text-2xl font-bold text-white font-mono">{selectedHub.weather.temp}</div>
                <div className="text-[9.5px] text-slate-400 mt-1">{selectedHub.weather.condition}</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#050b14] border border-white/10">
                <div className="text-[9px] uppercase tracking-wider text-slate-400">Surface Wind</div>
                <div className="mt-1 text-2xl font-bold text-white font-mono">{selectedHub.weather.wind.split(" ")[0]}</div>
                <div className="text-[9.5px] text-slate-400 mt-1">Vis: {selectedHub.weather.vis}</div>
              </div>
            </div>

            {/* Detailed Terminal & Lounge Inclusions */}
            <div className="mt-6 p-5 rounded-2xl bg-[#11223b]/50 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Covered Terminals:</span>
                <span className="font-bold text-white font-mono">{selectedHub.terminals.join(" · ")}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Partner VIP Lounge:</span>
                <span className="font-bold text-[#d9c18b]">{selectedHub.vipLounge}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Tarmac Vehicle Dispatch:</span>
                <span className="font-bold text-white">Direct Aircraft-Side Mercedes Fleet Available</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-300 font-light text-center sm:text-left">
                Standing slots reserved for immediate guest allocation.
              </div>

              <Link
                to="/airports/$code"
                params={{ code: selectedHub.code }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-xl bg-[#c5a869] hover:bg-[#d9c18b] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-[#050b14] shadow-lg transition-all hover:scale-[1.02] active:scale-98 cursor-pointer shrink-0"
                style={mono}
              >
                <span>Book Service at {selectedHub.code}</span>
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
