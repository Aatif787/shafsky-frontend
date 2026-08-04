import React, { useState } from "react";
import {
  Check,
  Crown,
  Users,
  Hotel,
  Ticket,
  Package,
  Car,
  HeartPulse,
  Sparkles,
  Plus,
  Minus,
  ShieldCheck,
  Star,
  Info,
} from "lucide-react";
import { AirportWorkflowState } from "../../hooks/useAirportWorkflow";
import { getAirportBusinessPrice, getAirportCurrencySymbol } from "@/data/airportRegistry";

interface AirportServiceSelectionProps {
  state: AirportWorkflowState;
  onChange: (fields: Partial<AirportWorkflowState>) => void;
}

export function AirportServiceSelection({ state, onChange }: AirportServiceSelectionProps) {
  const currencySymbol = getAirportCurrencySymbol(state.airportCode);

  // Packages array
  const packages = [
    {
      id: "essential",
      name: "Essential Escort",
      tagline: "Standard terminal guidance & luggage porterage",
      price: getAirportBusinessPrice(state.airportCode, "package", "essential") || 3499,
      badge: "Best Value",
      features: ["Personal terminal host", "Porter for checked luggage", "Fast-track security line"],
      includedServices: ["meet_greet", "porter"],
    },
    {
      id: "premium",
      name: "Premium VIP Sanctuary",
      tagline: "Full aerobridge greeting, lounge pass & priority clearance",
      price: getAirportBusinessPrice(state.airportCode, "package", "premium") || 6999,
      badge: "Most Popular",
      features: [
        "Aerobridge placard greeting",
        "Dedicated porterage for all bags",
        "Priority diplomatic immigration lane",
        "VIP lounge suite access",
      ],
      includedServices: ["meet_greet", "fast_track", "lounge", "porter"],
    },
    {
      id: "vip",
      name: "VIP Executive Tarmac",
      tagline: "Private luxury tarmac transfer & dedicated diplomat escort",
      price: getAirportBusinessPrice(state.airportCode, "package", "vip") || 12999,
      badge: "Flagship Luxury",
      features: [
        "Private luxury tarmac car transfer",
        "Diplomatic fast-track clearance",
        "Private lounge suite & buffet",
        "Dedicated VIP host & team",
        "Chauffeured sedan transfer",
      ],
      includedServices: ["meet_greet", "fast_track", "lounge", "buggy", "porter", "transport"],
    },
  ];

  // Individual add-on services list
  const individualServices = [
    {
      id: "meet_greet",
      name: "Meet & Greet Escort",
      desc: "Personal gate welcome, placard greeting & host escort.",
      price: 2499,
      estTime: "30 sec",
      icon: Users,
      badge: "Flagship",
    },
    {
      id: "lounge",
      name: "VIP Lounge Pass",
      desc: "Private lounge suite access with hot buffet, Wi-Fi & showers.",
      price: 1999,
      estTime: "1 min",
      icon: Hotel,
      badge: "Sanctuary",
    },
    {
      id: "fast_track",
      name: "Fast-Track Clearance",
      desc: "Diplomatic priority lane passport control and security skip.",
      price: 1899,
      estTime: "1 min",
      icon: Ticket,
      badge: "Express",
    },
    {
      id: "porter",
      name: "Baggage Porter Service",
      desc: "Dedicated porter service for all checked and hand luggage.",
      price: 999,
      estTime: "Instant",
      icon: Package,
      badge: "Luggage",
    },
    {
      id: "buggy",
      name: "Electric Buggy Ride",
      desc: "Airside golf cart transit between gates and lounge suites.",
      price: 1299,
      estTime: "Instant",
      icon: Car,
      badge: "Airside",
    },
    {
      id: "wheelchair",
      name: "Wheelchair Assistance",
      desc: "Dedicated mobility ramp escort & assistance.",
      price: 1499,
      estTime: "Instant",
      icon: HeartPulse,
      badge: "Care",
    },
    {
      id: "transport",
      name: "Airport Chauffeur Transfer",
      desc: "Chauffeured executive sedan or SUV airport pickup & dropoff.",
      price: 2999,
      estTime: "Scheduled",
      icon: Car,
      badge: "Transfer",
    },
  ];

  // Smart Recommendations Engine
  const isArrival = state.direction === "arrival";
  const isTransit = state.direction === "transit";
  const passengerCount = state.guestCount || 1;

  const recommendations = [
    {
      condition: isArrival,
      title: "Recommended for Arrival",
      text: "Fast-Track Immigration & Baggage Porter for zero queue delays at customs.",
      serviceId: "fast_track",
    },
    {
      condition: passengerCount >= 3,
      title: "Group Porter Recommended",
      text: "Dedicated luggage porter handles multiple bags for groups effortlessly.",
      serviceId: "porter",
    },
    {
      condition: isTransit,
      title: "Transit Buggy & Lounge Pass",
      text: "Transfer quickly between gates with gate-to-gate buggy transport.",
      serviceId: "buggy",
    },
  ].filter((r) => r.condition);

  // Active selected extra services (multiselect array stored in state)
  const selectedExtras: string[] = (state as any).selectedExtras || [];

  const toggleExtraService = (id: string) => {
    let updated: string[];
    if (selectedExtras.includes(id)) {
      updated = selectedExtras.filter((item) => item !== id);
    } else {
      updated = [...selectedExtras, id];
    }
    onChange({ selectedExtras: updated, selectedService: id } as any);
  };

  return (
    <div className="space-y-8">
      {/* ── 1. SMART RECOMMENDATIONS BANNER ── */}
      {recommendations.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/80 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              <Sparkles className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-900">
                {recommendations[0].title}
              </div>
              <div className="text-xs text-amber-800 font-sans mt-0.5 font-medium">
                {recommendations[0].text}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-amber-200/60 font-bold text-amber-900 shrink-0">
            Smart Choice
          </span>
        </div>
      )}

      {/* ── 2. PACKAGES SECTION (Show Packages First) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-mono text-slate-900 uppercase tracking-widest font-bold flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-600" />
              <span>Select VIP Package Tier</span>
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Bundled experiences offering highest assistance level and savings for {state.airportCode}.
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-[10px] font-mono uppercase tracking-widest font-bold">
            <button
              type="button"
              onClick={() => onChange({ bookingMode: "package" })}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                state.bookingMode === "package"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Packages
            </button>
            <button
              type="button"
              onClick={() => onChange({ bookingMode: "individual" })}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                state.bookingMode === "individual"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Individual
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {packages.map((pkg) => {
            const isSelected = state.bookingMode === "package" && state.selectedPackage === pkg.id;

            return (
              <div
                key={pkg.id}
                onClick={() =>
                  onChange({
                    bookingMode: "package",
                    selectedPackage: pkg.id,
                    selectedService: pkg.id,
                  })
                }
                className={`relative p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-gradient-to-b from-amber-50/90 via-white to-amber-50/40 border-amber-500 shadow-xl ring-2 ring-amber-400/30"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {pkg.badge && (
                  <div
                    className={`absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest ${
                      isSelected
                        ? "bg-amber-700 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {pkg.badge}
                  </div>
                )}

                <div>
                  <h4 className="text-lg font-heading font-bold text-slate-900">{pkg.name}</h4>
                  <p className="text-xs text-slate-500 font-sans mt-1 leading-snug font-medium">
                    {pkg.tagline}
                  </p>

                  <div className="mt-4 mb-5">
                    <span className="text-2xl font-mono font-bold text-amber-800">
                      {currencySymbol}
                      {pkg.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 ml-1">/ booking</span>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-slate-100">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                      Includes:
                    </div>
                    {pkg.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                        <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    className={`w-full py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white shadow-md shadow-amber-700/20"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    <span>{isSelected ? "PACKAGE SELECTED" : "SELECT PACKAGE"}</span>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. CUSTOMIZE EXPERIENCE SECTION (Individual Add-ons) ── */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h3 className="text-sm font-mono text-slate-900 uppercase tracking-widest font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Customize Experience (Individual Add-Ons)</span>
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Add standalone services or combine custom options with your package selection.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {individualServices.map((service) => {
            const Icon = service.icon;
            const isSelected =
              state.selectedService === service.id || selectedExtras.includes(service.id);

            return (
              <div
                key={service.id}
                className={`p-4.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? "bg-amber-50/70 border-amber-400 shadow-xs"
                    : "bg-white border-slate-200/90 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-8 w-8 rounded-xl bg-amber-100/70 border border-amber-300/50 text-amber-800 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                      {service.badge}
                    </span>
                  </div>

                  <h4 className="text-sm font-heading font-bold text-slate-900">{service.name}</h4>
                  <p className="text-xs text-slate-500 font-sans mt-1 leading-snug font-medium line-clamp-2">
                    {service.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-mono font-bold text-amber-800">
                    {currencySymbol}
                    {service.price.toLocaleString()}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        bookingMode: "individual",
                        selectedService: service.id,
                      });
                      toggleExtraService(service.id);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-700 text-white shadow-xs"
                        : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>ADDED</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-slate-500" />
                        <span>ADD</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
