import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Crown,
  Car,
  Hotel,
  Shield,
  Sparkles,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { display, mono } from "@/components/home/theme";
import { MeetGreetExperience } from "./experiences/MeetGreetExperience";
import { AirCharterExperience } from "./experiences/AirCharterExperience";
import { TransportExperience } from "./experiences/TransportExperience";
import { LuxuryHotelsExperience } from "./experiences/LuxuryHotelsExperience";
import { SpecialServicesExperience } from "./experiences/SpecialServicesExperience";

export type BookingServiceType =
  | "meet-greet"
  | "charter"
  | "transport"
  | "hotel"
  | "special";

interface ServiceCategoryMeta {
  id: BookingServiceType;
  title: string;
  shortTitle: string;
  icon: any;
  subtitle: string;
  badge: string;
}

export const PRIMARY_SERVICES: ServiceCategoryMeta[] = [
  {
    id: "meet-greet",
    title: "Meet & Greet and Lounge Service",
    shortTitle: "Meet & Greet",
    icon: Plane,
    subtitle: "Airport VIP Escort & Lounge",
    badge: "Airside Concierge",
  },
  {
    id: "charter",
    title: "Air Charter",
    shortTitle: "Air Charter",
    icon: Crown,
    subtitle: "Private Jets & Helicopters",
    badge: "VIP Aviation",
  },
  {
    id: "transport",
    title: "Transport Service",
    shortTitle: "Transport Service",
    icon: Car,
    subtitle: "Chauffeured Sedans & Large MUVs",
    badge: "Ground Fleet",
  },
  {
    id: "hotel",
    title: "Luxury Hotels",
    shortTitle: "Luxury Hotels",
    icon: Hotel,
    subtitle: "7-Star, 5-Star & Palace Suites",
    badge: "VIP Accommodations",
  },
  {
    id: "special",
    title: "Special Services",
    shortTitle: "Special Services",
    icon: Shield,
    subtitle: "Armed PSO, Tours & Repatriation",
    badge: "Specialized Missions",
  },
];

interface UniversalBookingHubProps {
  initialService?: BookingServiceType;
  initialSubService?: string;
}

export function UniversalBookingHub({
  initialService = "meet-greet",
  initialSubService,
}: UniversalBookingHubProps) {
  const [activeService, setActiveService] = useState<BookingServiceType>(initialService);

  // Sync state if initialService prop changes
  useEffect(() => {
    if (initialService) {
      setActiveService(initialService);
    }
  }, [initialService]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 lg:px-12 text-slate-900">
      <div className="mx-auto max-w-7xl">
        {/* Top Service Switcher - Five Official Primary Services */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                Select Service Category:
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="tel:+919599087959"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-mono font-bold text-slate-700 hover:border-amber-400 hover:text-amber-800 transition"
              >
                <PhoneCall size={12} className="text-[#d4af37]" />
                <span>24/7 Desk: +91 95990 87959</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
            {PRIMARY_SERVICES.map((srv) => {
              const Icon = srv.icon;
              const isActive = activeService === srv.id;
              return (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => setActiveService(srv.id)}
                  className={`group relative flex flex-col text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer shadow-xs ${
                    isActive
                      ? "bg-slate-950 text-white border-[#d4af37] shadow-lg shadow-slate-950/15 scale-[1.01]"
                      : "bg-white text-slate-700 border-slate-200 hover:border-amber-400/70 hover:bg-amber-50/20"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div
                      className={`p-2 rounded-xl transition-colors ${
                        isActive
                          ? "bg-[#d4af37] text-slate-950"
                          : "bg-slate-100 text-slate-700 group-hover:bg-amber-100"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <span
                      className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isActive ? "bg-slate-800 text-amber-300" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {srv.badge}
                    </span>
                  </div>

                  <span className="text-xs sm:text-sm font-bold tracking-tight mb-0.5" style={display}>
                    {srv.shortTitle}
                  </span>
                  <span
                    className={`text-[10.5px] leading-snug line-clamp-1 ${
                      isActive ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {srv.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dedicated Purpose-Built Experience for the Selected Primary Service */}
        <div className="w-full">
          {activeService === "meet-greet" && (
            <MeetGreetExperience initialSubService={initialSubService} />
          )}

          {activeService === "charter" && (
            <AirCharterExperience initialSubService={initialSubService} />
          )}

          {activeService === "transport" && (
            <TransportExperience initialSubService={initialSubService} />
          )}

          {activeService === "hotel" && (
            <LuxuryHotelsExperience initialSubService={initialSubService} />
          )}

          {activeService === "special" && (
            <SpecialServicesExperience initialSubService={initialSubService} />
          )}
        </div>
      </div>
    </div>
  );
}

export default UniversalBookingHub;
