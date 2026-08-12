import React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Crown,
  Hotel,
  Ticket,
  Car,
  Plane,
  HeartPulse,
  Package,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { TiltCard, StaggerContainer, StaggerItem } from "@/components/ui/interactions";

export interface RelatedServiceItem {
  id: string;
  title: string;
  link: string;
  icon: any;
  desc: string;
  tag?: string;
  serviceId?: string;
}

interface RelatedServicesProps {
  services?: RelatedServiceItem[];
  title?: string;
  className?: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * CENTRALIZED SERVICE CATALOG FOR INTELLIGENT CROSS-RECOMMENDATIONS
 * ─────────────────────────────────────────────────────────────────────────── */
const SERVICE_CATALOG: Record<string, RelatedServiceItem> = {
  // Concierge Packages
  silver: {
    id: "silver",
    title: "Silver Escort Package",
    link: "/solutions/concierge?sub=silver",
    icon: Crown,
    desc: "Aerobridge placard greeting, dedicated porterage, and terminal guidance.",
    tag: "Standard Escort",
    serviceId: "silver",
  },
  gold: {
    id: "gold",
    title: "Gold VIP Sanctuary Package",
    link: "/solutions/concierge?sub=gold",
    icon: Hotel,
    desc: "Aerobridge host welcome, VIP lounge access, fast-track clearance & porter.",
    tag: "Most Popular",
    serviceId: "gold",
  },
  elite: {
    id: "elite",
    title: "Elite Presidential Package",
    link: "/solutions/concierge?sub=elite",
    icon: Crown,
    desc: "Private VIP terminal suite, tarmac Maybach transfer, and in-suite customs.",
    tag: "VVIP Presidential",
    serviceId: "elite",
  },

  // Travel
  air_ticketing: {
    id: "air_ticketing",
    title: "Commercial Air Ticketing",
    link: "/solutions/travel?sub=air_ticketing",
    icon: Ticket,
    desc: "Commercial first-class and business-class flight reservations with priority seat blocking.",
    tag: "VIP Ticketing",
    serviceId: "air_ticketing",
  },
  hotel: {
    id: "hotel",
    title: "5-Star Hotel & Palace Suites",
    link: "/solutions/travel?sub=hotel",
    icon: Hotel,
    desc: "Luxury palace suite reservations with complimentary room upgrades & butler service.",
    tag: "Luxury Stay",
    serviceId: "hotel",
  },
  visa: {
    id: "visa",
    title: "Fast-Track Visa Services",
    link: "/solutions/travel?sub=visa",
    icon: Building2,
    desc: "Expedited diplomatic visa processing, e-Visa dispatch, and embassy liaison.",
    tag: "Fast-Track Visa",
    serviceId: "visa",
  },
  onboard_meals: {
    id: "onboard_meals",
    title: "In-Flight Gourmet Catering",
    link: "/solutions/travel?sub=onboard_meals",
    icon: Sparkles,
    desc: "Custom Michelin-grade inflight catering & specialized dietary curation.",
    tag: "Bespoke Dining",
    serviceId: "onboard_meals",
  },

  // Cargo
  cargo: {
    id: "cargo",
    title: "Air Cargo Clearance",
    link: "/solutions/cargo?sub=cargo",
    icon: Package,
    desc: "Express airside freight handling, customs bonding, and high-value cargo escort.",
    tag: "Freight Clearance",
    serviceId: "cargo",
  },
  avi: {
    id: "avi",
    title: "Live Pet AVI Transit",
    link: "/solutions/cargo?sub=avi",
    icon: Package,
    desc: "Climate-controlled live animal air transit with dedicated veterinary care.",
    tag: "Live Pet Transit",
    serviceId: "avi",
  },

  // Medical
  air_ambulance: {
    id: "air_ambulance",
    title: "Air Ambulance Medevac",
    link: "/solutions/medical?sub=air_ambulance",
    icon: HeartPulse,
    desc: "24/7 Airborne ICU jets with specialized flight doctor critical care teams.",
    tag: "Airborne ICU",
    serviceId: "air_ambulance",
  },
  train_ambulance: {
    id: "train_ambulance",
    title: "Train Ambulance Escort",
    link: "/solutions/medical?sub=train_ambulance",
    icon: Car,
    desc: "Mobile rail life-support medevac units with doctor escorts.",
    tag: "Rail ICU",
    serviceId: "train_ambulance",
  },
  hum: {
    id: "hum",
    title: "HUM Repatriation",
    link: "/solutions/medical?sub=hum",
    icon: ShieldCheck,
    desc: "Dignified human remains repatriation & international embassy clearance.",
    tag: "Repatriation",
    serviceId: "hum",
  },

  // Charter
  charter: {
    id: "charter",
    title: "Private Jet Charter",
    link: "/charter",
    icon: Plane,
    desc: "On-demand private jet charter & FBO general aviation suites.",
    tag: "VIP Charter",
    serviceId: "jet_charter",
  },
};

function resolveIntelligentSuggestions(pathname: string, searchLocation: any): RelatedServiceItem[] {
  let sub = "";
  try {
    if (typeof searchLocation === "string") {
      const searchParams = new URLSearchParams(searchLocation);
      sub = searchParams.get("sub") || "";
    } else if (searchLocation && typeof searchLocation === "object") {
      sub = searchLocation.sub || "";
    }
  } catch (e) {
    // fallback
  }

  // 1. Airport Concierge Route
  if (pathname.includes("/solutions/concierge")) {
    if (sub === "lounge") {
      return [SERVICE_CATALOG.meet_greet, SERVICE_CATALOG.transport, SERVICE_CATALOG.fast_track];
    }
    if (sub === "transport") {
      return [SERVICE_CATALOG.meet_greet, SERVICE_CATALOG.lounge, SERVICE_CATALOG.fast_track];
    }
    if (sub === "fast_track") {
      return [SERVICE_CATALOG.meet_greet, SERVICE_CATALOG.lounge, SERVICE_CATALOG.transport];
    }
    return [SERVICE_CATALOG.meet_greet, SERVICE_CATALOG.lounge, SERVICE_CATALOG.transport];
  }

  // 2. Travel Services Route
  if (pathname.includes("/solutions/travel")) {
    return [SERVICE_CATALOG.meet_greet, SERVICE_CATALOG.visa, SERVICE_CATALOG.hotel];
  }

  // 3. Cargo Route
  if (pathname.includes("/solutions/cargo")) {
    return [SERVICE_CATALOG.cargo, SERVICE_CATALOG.avi, SERVICE_CATALOG.transport];
  }

  // 4. Medical Route
  if (pathname.includes("/solutions/medical")) {
    return [SERVICE_CATALOG.air_ambulance, SERVICE_CATALOG.train_ambulance, SERVICE_CATALOG.hum];
  }

  // 5. Charter Route
  if (pathname.includes("/charter") || pathname.includes("/solutions/aviation")) {
    return [SERVICE_CATALOG.meet_greet, SERVICE_CATALOG.lounge, SERVICE_CATALOG.transport];
  }

  // Fallback
  return [SERVICE_CATALOG.meet_greet, SERVICE_CATALOG.lounge, SERVICE_CATALOG.transport];
}

export function RelatedServices({
  services,
  title = "Logically Related Services & Ecosystem",
  className = "",
}: RelatedServicesProps) {
  const location = useLocation();

  const activeItems = (
    services && services.length > 0
      ? services
      : resolveIntelligentSuggestions(location.pathname, location.search)
  ).filter(Boolean);

  return (
    <section className={`my-16 relative ${className}`}>
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-600 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Intelligent Ecosystem Suggestions</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif text-emerald-800 font-bold mt-1">
            {title}
          </h3>
        </div>
      </div>

      {/* SUGGESTION CARDS GRID */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeItems.map((item, idx) => {
          if (!item) return null;
          const Icon = item.icon || Sparkles;

          return (
            <StaggerItem key={item.id || idx}>
              <TiltCard maxTilt={8} scale={1.02} className="rounded-3xl h-full">
                <div className="group relative flex flex-col justify-between p-7 rounded-3xl bg-[#0e131d]/90 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 shadow-xl overflow-hidden h-full">
                  <div>
                    {/* Icon & Tag Header */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      {item.tag && (
                        <span className="text-[9px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-emerald-400 border border-emerald-500/30 font-bold">
                          {item.tag}
                        </span>
                      )}
                    </div>

                    {/* Title & Short Description */}
                    <h4 className="text-xl font-serif font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h4>

                    <p className="mt-2.5 text-xs text-white/70 leading-relaxed font-sans font-medium line-clamp-2">
                      {item.desc}
                    </p>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    <Link
                      to={item.link}
                      className="text-[10px] font-mono uppercase tracking-widest text-white/60 hover:text-emerald-400 font-bold transition-colors"
                    >
                      Learn More
                    </Link>

                    <Link
                      to="/book"
                      search={{ service_id: item.serviceId || item.id } as any}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] uppercase font-bold tracking-wider transition-all duration-200 shadow-sm"
                    >
                      <span>Book Service</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </TiltCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </section>
  );
}
