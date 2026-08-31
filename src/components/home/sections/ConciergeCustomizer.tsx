import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  Crown,
  PlaneLanding,
  PlaneTakeoff,
  Shuffle,
  Car,
  Coffee,
  ShieldCheck,
  Check,
  ArrowRight,
  Plus,
  Minus,
  Sparkles,
  Luggage,
  Users,
} from "lucide-react";
import { display, mono, C } from "../theme";

type FlowType = "arrival" | "departure" | "transit";

interface OptionItem {
  id: string;
  name: string;
  desc: string;
  icon: any;
  tagline: string;
}

const SERVICE_OPTIONS: OptionItem[] = [
  {
    id: "fast_track",
    name: "Expedited Passport & Security Fast-Track",
    desc: "Bypass general queues with priority diplomatic & VIP lane access.",
    icon: ShieldCheck,
    tagline: "VIP Priority",
  },
  {
    id: "lounge_access",
    name: "Executive VIP Lounge & Shower Suite",
    desc: "Full private lounge hospitality, hot buffet dining, and relaxation suite.",
    icon: Coffee,
    tagline: "Lounge Access",
  },
  {
    id: "tarmac_sedan",
    name: "Airside Mercedes-Benz Tarmac Sedan",
    desc: "Private chauffeured transfer directly between aircraft steps and terminal.",
    icon: Car,
    tagline: "Tarmac Transfer",
  },
  {
    id: "porterage",
    name: "Dedicated Luggage Porterage & Retrieval",
    desc: "Hands-free baggage handling from carousel to curbside vehicle.",
    icon: Luggage,
    tagline: "Porterage Included",
  },
];

export function ConciergeCustomizer() {
  const navigate = useNavigate();
  const [flow, setFlow] = useState<FlowType>("arrival");
  const [passengers, setPassengers] = useState<number>(2);
  const [luggageBags, setLuggageBags] = useState<number>(3);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([
    "fast_track",
    "porterage",
    "lounge_access",
  ]);

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleProceed = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "shafsky_custom_config",
        JSON.stringify({
          flow,
          passengers,
          luggageBags,
          options: selectedOptions,
        })
      );
    }
    navigate({ to: "/book" });
  };

  return (
    <section
      id="customizer"
      className="relative px-4 py-16 sm:px-8 sm:py-24 md:px-14 md:py-32 bg-white text-slate-900 overflow-hidden border-b border-slate-200"
    >
      <div className="relative z-10 mx-auto max-w-[1480px]">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div
            className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.45em] text-lime-700 font-bold"
            style={mono}
          >
            <span className="h-px w-8 bg-lime-500" />
            <span>INTERACTIVE PROTOCOL BUILDER</span>
            <span className="h-px w-8 bg-lime-500" />
          </div>
          <h2
            className="mt-4 text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.05] text-slate-950 font-bold tracking-tight"
            style={display}
          >
            Design Your Bespoke{" "}
            <span className="text-lime-600 font-bold">
              Airside Experience.
            </span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Customize personal escort officers, curbside tarmac sedans, luggage porters, and executive lounge suites tailored precisely to your flight.
          </p>
        </div>

        {/* Interactive Customizer Box */}
        <div className="rounded-3xl bg-slate-50/70 border-2 border-lime-500/25 p-6 sm:p-10 lg:p-12 shadow-md hover:shadow-xl hover:border-lime-500/40 transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Controls Column */}
            <div className="lg:col-span-7 space-y-8">
              {/* 1. Select Journey Type */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-600 font-mono font-bold block mb-3" style={mono}>
                  1. Select Flight Flow
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "arrival", label: "Arrival Escort", Icon: PlaneLanding },
                    { id: "departure", label: "Departure Escort", Icon: PlaneTakeoff },
                    { id: "transit", label: "Transit Connection", Icon: Shuffle },
                  ].map(({ id, label, Icon }) => {
                    const isSelected = flow === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setFlow(id as FlowType)}
                        className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                          isSelected
                            ? "bg-slate-950 border-lime-500 text-white shadow-md"
                            : "bg-white border-slate-200 text-slate-700 hover:border-lime-400 hover:bg-lime-50/30"
                        }`}
                      >
                        <Icon size={20} className={isSelected ? "text-lime-400" : "text-slate-500"} />
                        <span className="text-xs font-bold">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Passengers & Luggage Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Passenger Counter */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">VIP Guests</div>
                      <div className="text-[10px] text-slate-500 font-mono" style={mono}>
                        Adults & Children
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                        className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 hover:border-lime-500 flex items-center justify-center cursor-pointer transition"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-base font-bold font-mono w-4 text-center" style={mono}>
                        {passengers}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPassengers((p) => Math.min(12, p + 1))}
                        className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 hover:border-lime-500 flex items-center justify-center cursor-pointer transition"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Luggage Counter */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Luggage Pieces</div>
                      <div className="text-[10px] text-slate-500 font-mono" style={mono}>
                        Baggage Porterage
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setLuggageBags((b) => Math.max(0, b - 1))}
                        className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 hover:border-lime-500 flex items-center justify-center cursor-pointer transition"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-base font-bold font-mono w-4 text-center" style={mono}>
                        {luggageBags}
                      </span>
                      <button
                        type="button"
                        onClick={() => setLuggageBags((b) => Math.min(20, b + 1))}
                        className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 hover:border-lime-500 flex items-center justify-center cursor-pointer transition"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Inclusions & Enhancements Checklist */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-600 font-mono font-bold block mb-3" style={mono}>
                  2. Select Airside Amenities
                </label>
                <div className="space-y-3">
                  {SERVICE_OPTIONS.map((opt) => {
                    const isChecked = selectedOptions.includes(opt.id);
                    return (
                      <div
                        key={opt.id}
                        onClick={() => toggleOption(opt.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? "bg-white border-lime-500 shadow-xs ring-1 ring-lime-500/20"
                            : "bg-white border-slate-200 hover:border-lime-400"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`h-6 w-6 rounded-lg flex items-center justify-center border transition-colors ${
                              isChecked
                                ? "bg-[#84cc16] border-lime-500 text-slate-950"
                                : "bg-white border-slate-300 text-transparent"
                            }`}
                          >
                            <Check size={14} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{opt.name}</div>
                            <div className="text-[11px] text-slate-500 font-normal mt-0.5">{opt.desc}</div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-3">
                          <span className="text-[11px] font-bold font-mono text-lime-700" style={mono}>
                            {opt.tagline}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Summary & Quotation Card */}
            <div className="lg:col-span-5 rounded-3xl bg-slate-950 border border-slate-800 p-7 sm:p-9 text-white shadow-xl flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-white/10">
                  <div
                    className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-lime-400 font-mono"
                    style={mono}
                  >
                    <Crown size={13} className="text-lime-400" />
                    <span>Suswagatam Protocol Summary</span>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Flow Selected:</span>
                    <span className="font-bold text-white capitalize font-mono">{flow} Service</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Guest Count:</span>
                    <span className="font-bold text-white font-mono">{passengers} Guests</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Luggage Bags:</span>
                    <span className="font-bold text-white font-mono">{luggageBags} Bags</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Amenities Configured:</span>
                    <span className="font-bold text-lime-400 font-mono">{selectedOptions.length} Selected</span>
                  </div>
                </div>

                <div className="mt-8 p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono" style={mono}>
                    Service Protocol Pricing
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-serif text-white mt-1 tracking-tight" style={display}>
                    Live Quote at Booking
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono" style={mono}>
                    Authoritative airport packages verified upon flight selection
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={handleProceed}
                  className="group/btn relative overflow-hidden w-full inline-flex items-center justify-center gap-3 rounded-xl bg-[#84cc16] px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-950 shadow-md shadow-lime-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-lime-500/40 hover:-translate-y-0.5 cursor-pointer"
                  style={mono}
                >
                  <div className="absolute inset-0 w-[200%] -translate-x-[150%] bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
                  <div className="absolute inset-0 bg-[#a3e635] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative z-10">Book Now</span>
                  <ArrowRight size={15} className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </button>

                <div className="text-[10.5px] text-slate-400 text-center font-mono flex items-center justify-center gap-2" style={mono}>
                  <ShieldCheck size={13} className="text-lime-400" />
                  <span>Free cancellation up to 12 hours before flight</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
