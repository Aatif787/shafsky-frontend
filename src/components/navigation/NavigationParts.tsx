import React from "react";
import { Link } from "@tanstack/react-router";
import {
  Plane,
  Crown,
  Hotel,
  Car,
  Ticket,
  PhoneCall,
  ArrowRight,
  User,
  LogIn,
  MapPin,
  Image as ImageIcon,
  Armchair,
  MessageSquare,
  ChevronDown,
  UtensilsCrossed,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  Train,
  FileCheck,
  PawPrint,
  Baby,
  Package,
} from "lucide-react";
import { mono } from "@/components/home/theme";
import { motion, AnimatePresence } from "framer-motion";
import { CONTACT_DETAILS } from "@/lib/constants";

export interface ServiceMenuItem {
  title: string;
  href: string;
  descriptor: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge: string;
  image: string;
  features: string[];
}

export const PRIMARY_SERVICES: ServiceMenuItem[] = [
  {
    title: "Meet & Greet Lounge",
    href: "/solutions/concierge",
    descriptor: "Airport assistance • Domestic • International • Transit",
    icon: Crown,
    badge: "Signature Concierge",
    image: "/images/services-gallery/aerobridge-welcome.webp",
    features: ["Aerobridge Meet", "Baggage Porter", "Fast-Track Security", "VIP Lounge Access"],
  },
  {
    title: "Transport",
    href: "/solutions/transport",
    descriptor: "Luxury • MUV / Large • Standard • Chauffeur",
    icon: Car,
    badge: "Chauffeur & Fleet",
    image: "/images/transport/tarmac-chauffeur.webp",
    features: ["Mercedes Maybach & S-Class", "Large MUV & Coach", "Tarmac Escort", "24/7 Curbside Meet"],
  },
  {
    title: "Hotel",
    href: "/solutions/hotels",
    descriptor: "7 Star • 5 Star • 3 Star • Transit Day-Use",
    icon: Hotel,
    badge: "Curated Stays",
    image: "/images/hotels/de-pavilion.jpg",
    features: ["7 Star & 5 Star Suites", "Transit Airport Hotels", "Day-Use Rooms", "Express Check-In"],
  },
  {
    title: "Private Charter",
    href: "/solutions/aviation",
    descriptor: "Private Jet • Helicopter • Air Ambulance • Corporate Fleet",
    icon: Plane,
    badge: "Executive Fleet",
    image: "/images/charter/luxury-cabin.webp",
    features: ["Private Jet Charter", "Helicopter Transfers", "Empty Leg Flights", "Air Ambulance"],
  },
  {
    title: "Ticketing",
    href: "/solutions/special-services?sub=ticketing",
    descriptor: "Domestic & International • Instant Fares • 24/7 Desk",
    icon: Ticket,
    badge: "Airline Ticketing",
    image: "/images/services-gallery/family-arrival.webp",
    features: [
      "Instant Domestic & International Flights",
      "Corporate & Flexible Fares",
      "24/7 Urgent Rebooking & Changes",
      "Special Passenger Assistance",
    ],
  },
];

export interface OtherServiceDropdownItem {
  label: string;
  sub: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const OTHER_SERVICES_ITEMS: OtherServiceDropdownItem[] = [
  {
    label: "Cargo",
    sub: "cargo",
    href: "/solutions/cargo",
    icon: Package,
  },
  {
    label: "Air Ticketing",
    sub: "ticketing",
    href: "/solutions/special-services?sub=ticketing",
    icon: Ticket,
  },
  {
    label: "Travel & Tour",
    sub: "tours-travel",
    href: "/solutions/special-services?sub=tours-travel",
    icon: HeartHandshake,
  },
  {
    label: "Visa Assistance",
    sub: "visa",
    href: "/solutions/special-services?sub=visa",
    icon: FileCheck,
  },
  {
    label: "On-Board Meals",
    sub: "onboard_meals",
    href: "/solutions/special-services?sub=onboard_meals",
    icon: UtensilsCrossed,
  },
  {
    label: "Spa & Wellness",
    sub: "spa-wellness",
    href: "/solutions/special-services?sub=spa-wellness",
    icon: Sparkles,
  },
  {
    label: "PSO Close Protection",
    sub: "pso",
    href: "/solutions/special-services?sub=pso",
    icon: ShieldCheck,
  },
  {
    label: "Air Ambulance",
    sub: "air_ambulance",
    href: "/solutions/special-services?sub=air_ambulance",
    icon: Plane,
  },
  {
    label: "Train Ambulance",
    sub: "train_ambulance",
    href: "/solutions/special-services?sub=train_ambulance",
    icon: Train,
  },
  {
    label: "HUM Repatriation",
    sub: "hum",
    href: "/solutions/special-services?sub=hum",
    icon: HeartHandshake,
  },
  {
    label: "AVI & Animal Pet",
    sub: "cargo_avi_pet",
    href: "/solutions/special-services?sub=cargo_avi_pet",
    icon: PawPrint,
  },
  {
    label: "Infant Care",
    sub: "infant-care",
    href: "/solutions/infant-care",
    icon: Baby,
  },
];

export interface NavItem {
  label: string;
  href: string;
}

/**
 * Navbar Navigation Items in exact specified order:
 * Meet & Greet | Lounge | Airports | Transport | Hotel | Private Charter | Other Services | Support
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "Meet & Greet", href: "/solutions/concierge" },
  { label: "Lounge", href: "/lounge" },
  { label: "Airports", href: "/airports" },
  { label: "Transport", href: "/solutions/transport" },
  { label: "Hotel", href: "/solutions/hotels" },
  { label: "Private Charter", href: "/solutions/aviation" },
  { label: "Cargo", href: "/solutions/cargo" },
  { label: "Other Services", href: "/solutions/special-services" },
  { label: "Support", href: "/support" },
];

export const getItemIcon = (label: string) => {
  switch (label) {
    case "Meet & Greet":
    case "Meet & Greet Lounge":
    case "Meet & Greet & Lounge":
      return Crown;
    case "Lounge":
      return Armchair;
    case "Transport":
      return Car;
    case "Hotel":
      return Hotel;
    case "Private Charter":
      return Plane;
    case "Cargo":
      return Package;
    case "Ticketing":
      return Ticket;
    case "Other Services":
      return Sparkles;
    case "Airports":
      return MapPin;
    case "Gallery":
      return ImageIcon;
    case "Support":
    case "Contact":
      return PhoneCall;
    default:
      return null;
  }
};

export const checkSpecialServiceActive = (
  pathname: string,
  search: Record<string, unknown>,
  serviceSub: string
) => {
  if (serviceSub === "cargo") {
    return pathname === "/solutions/cargo";
  }
  if (serviceSub === "infant-care") {
    return pathname === "/solutions/infant-care";
  }
  if (pathname !== "/solutions/special-services") return false;
  const rawSub = typeof search.sub === "string" ? search.sub.toLowerCase() : "";
  if (!rawSub) return false;
  if (rawSub === serviceSub.toLowerCase()) return true;
  switch (serviceSub) {
    case "onboard_meals":
      return (
        rawSub.includes("meal") ||
        rawSub.includes("catering") ||
        rawSub.includes("onboard") ||
        rawSub.includes("dining")
      );
    case "spa-wellness":
      return rawSub.includes("spa") || rawSub.includes("wellness");
    case "tours-travel":
      return rawSub.includes("tour") || rawSub.includes("honeymoon");
    case "pso":
      return rawSub.includes("pso") || rawSub.includes("security");
    case "air_ambulance":
      return (
        rawSub.includes("air_amb") ||
        rawSub.includes("air-amb") ||
        rawSub === "medevac" ||
        rawSub === "ambulance"
      );
    case "train_ambulance":
      return rawSub.includes("train");
    case "hum":
      return rawSub === "hum" || rawSub.includes("remains");
    case "visa":
      return rawSub.includes("visa");
    case "cargo_avi_pet":
      return rawSub.includes("cargo") || rawSub.includes("avi") || rawSub.includes("pet");
    case "ticketing":
      return rawSub.includes("ticket") || rawSub.includes("flight");
    default:
      return false;
  }
};

interface NavigationMobileDrawerProps {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOtherServicesOpen: boolean;
  setMobileOtherServicesOpen: React.Dispatch<React.SetStateAction<boolean>>;
  headerHeight: number;
  activeNavItems: NavItem[];
  isItemActive: (href: string) => boolean;
  isSpecialServiceActive: (serviceSub: string) => boolean;
  isLoggedIn: boolean;
  getDashboardPath: () => any;
  getDashboardLabel: () => string;
  contactNumbers: Array<{ tel_link: string; formatted: string }>;
}

export const NavigationMobileDrawer: React.FC<NavigationMobileDrawerProps> = ({
  mobileOpen,
  setMobileOpen,
  mobileOtherServicesOpen,
  setMobileOtherServicesOpen,
  headerHeight,
  activeNavItems,
  isItemActive,
  isSpecialServiceActive,
  isLoggedIn,
  getDashboardPath,
  getDashboardLabel,
  contactNumbers,
}) => {
  return (
    <AnimatePresence>
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          style={{ top: `${headerHeight}px` }}
          className="lg:hidden apple-glass-drawer fixed inset-x-0 top-16 sm:top-[72px] bottom-0 p-6 flex flex-col justify-between overflow-y-auto overflow-x-hidden z-50 shadow-2xl"
        >
          <div className="space-y-4">
            <div
              className="text-[10px] uppercase tracking-[0.3em] text-[#0a196f] font-bold pb-2 border-b border-slate-200"
              style={mono}
            >
              Services &amp; Navigation
            </div>

            <div className="flex flex-col gap-1">
              {activeNavItems.map((item) => {
                const isActive = isItemActive(item.href);
                const Icon = getItemIcon(item.label);

                if (item.label === "Other Services") {
                  return (
                    <div key={item.label} className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => setMobileOtherServicesOpen((prev) => !prev)}
                        aria-expanded={mobileOtherServicesOpen}
                        aria-controls="mobile-other-services-panel"
                        className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                          isActive || mobileOtherServicesOpen
                            ? "bg-[#0a196f]/10 text-[#0a196f] font-bold"
                            : "text-slate-800 hover:text-[#0a196f] hover:bg-slate-100/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {Icon && (
                            <Icon
                              size={16}
                              className={
                                isActive || mobileOtherServicesOpen
                                  ? "text-[#0a196f]"
                                  : "text-slate-500"
                              }
                            />
                          )}
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown
                          size={15}
                          className={`text-slate-500 shrink-0 transition-transform duration-200 ${
                            mobileOtherServicesOpen ? "rotate-180 text-[#0a196f]" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {mobileOtherServicesOpen && (
                          <motion.div
                            id="mobile-other-services-panel"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="mt-1.5 mb-2 p-3 rounded-2xl bg-white/95 border border-slate-200/90 shadow-sm">
                              <div className="text-center mb-2.5">
                                <span className="inline-block text-[9px] font-mono font-bold uppercase tracking-[0.22em] text-lime-700 bg-lime-50 px-2.5 py-0.5 rounded-full border border-lime-200">
                                  SELECT YOUR SPECIAL SERVICE
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center justify-center gap-2">
                                {OTHER_SERVICES_ITEMS.map((service) => {
                                  const ServiceIcon = service.icon;
                                  const isServiceActive = isSpecialServiceActive(service.sub);

                                  return (
                                    <Link
                                      key={service.label}
                                      to={
                                        service.href.startsWith("/solutions/special-services")
                                          ? "/solutions/special-services"
                                          : (service.href.split("?")[0] as any)
                                      }
                                      search={
                                        service.href.includes("?")
                                          ? ({ sub: service.sub } as any)
                                          : undefined
                                      }
                                      onClick={() => {
                                        setMobileOtherServicesOpen(false);
                                        setMobileOpen(false);
                                      }}
                                      className={`group/pill inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-bold font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer max-w-full ${
                                        isServiceActive
                                          ? "bg-lime-500 text-slate-950 shadow-sm ring-2 ring-lime-400 border border-lime-600"
                                          : "bg-white text-slate-700 border border-slate-200 hover:bg-lime-500 hover:text-slate-950 hover:border-lime-600 active:bg-lime-500 active:text-slate-950"
                                      }`}
                                    >
                                      <ServiceIcon
                                        size={12}
                                        className={`shrink-0 transition-colors ${
                                          isServiceActive
                                            ? "text-slate-950"
                                            : "text-lime-600 group-hover/pill:text-slate-950"
                                        }`}
                                      />
                                      <span className="truncate">{service.label}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-[#0a196f]/10 text-[#0a196f] font-bold"
                        : "text-slate-800 hover:text-[#0a196f] hover:bg-slate-100/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {Icon && (
                        <Icon
                          size={16}
                          className={isActive ? "text-[#0a196f]" : "text-slate-500"}
                        />
                      )}
                      <span>{item.label}</span>
                    </div>
                    <ArrowRight size={13} className="text-slate-400 shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile Bottom Quick Actions */}
          <div className="pt-6 border-t border-slate-200/60 space-y-3">
            {isLoggedIn ? (
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileOpen(false)}
                className="apple-glass-pill w-full flex items-center justify-center gap-2 py-3 rounded-full text-xs font-bold text-slate-900 tracking-wider uppercase transition-colors"
                style={mono}
              >
                <User size={14} className="text-[#0a196f]" />
                <span>{getDashboardLabel()}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="apple-glass-pill w-full flex items-center justify-center gap-2 py-3 rounded-full text-xs font-bold text-slate-900 tracking-wider uppercase transition-colors"
                style={mono}
              >
                <LogIn size={14} className="text-slate-600" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile 24/7 WhatsApp Quick Action */}
            <a
              href={CONTACT_DETAILS.WHATSAPP_BOOKING_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="apple-glass-pill w-full flex items-center justify-center gap-2.5 py-3 rounded-full text-xs font-bold text-emerald-800 tracking-wider uppercase border border-emerald-300/60 bg-emerald-50/50"
              style={mono}
            >
              <MessageSquare size={14} className="text-emerald-600" />
              <span>24/7 WhatsApp ({CONTACT_DETAILS.WHATSAPP_BOOKING})</span>
            </a>

            {contactNumbers.length > 0 && (
              <div className="w-full flex flex-col gap-2">
                {contactNumbers.map((c, idx) => (
                  <a
                    key={idx}
                    href={c.tel_link}
                    className="apple-glass-pill w-full flex items-center justify-center gap-2.5 py-3 rounded-full text-xs font-bold text-slate-900 tracking-wider uppercase"
                    style={mono}
                  >
                    <PhoneCall size={14} className="text-[#0a196f]" />
                    <span>Call 24/7 Desk ({c.formatted})</span>
                  </a>
                ))}
              </div>
            )}

            <a
              href="/#book"
              onClick={(e) => {
                setMobileOpen(false);
                const el = document.getElementById("book");
                if (el) {
                  e.preventDefault();
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
              className="group/btn relative overflow-hidden w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-gradient-to-r from-lime-500 to-lime-400 text-slate-950 text-xs font-bold tracking-wider uppercase shadow-[0_4px_16px_rgba(132,204,22,0.35),inset_0_1px_0_0_rgba(255,255,255,0.6)] border border-lime-300/60 transition-all duration-300 cursor-pointer"
              style={mono}
            >
              <div className="absolute inset-0 w-[200%] -translate-x-[150%] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
              <span className="relative z-10">Book Now</span>
              <ArrowRight
                size={14}
                className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1"
              />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
