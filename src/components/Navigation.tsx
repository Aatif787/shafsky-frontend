import React, { useEffect, useState, useContext, useRef } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { getSessionInfo } from "@/lib/session";
import { AuthContext } from "@/auth-system/AuthProvider";
import {
  Menu,
  X,
  Plane,
  Crown,
  Hotel,
  Car,
  Ticket,
  PhoneCall,
  ArrowRight,
  ArrowLeft,
  User,
  LogIn,
  MapPin,
  Image as ImageIcon,
  Armchair,
  MessageSquare,
} from "lucide-react";
import { useBranding } from "@/lib/branding/branding.context";
import { mono } from "@/components/home/theme";
import { motion, AnimatePresence } from "framer-motion";
import { ICICI_REVIEW_MODE } from "@/lib/config/reviewMode";
import { useWebsiteContacts } from "@/hooks/useWebsiteContacts";
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

export interface NavItem {
  label: string;
  href: string;
}

/**
 * 7 Navbar Navigation Items in exact specified order:
 * Meet & Greet Lounge | Airports | Transport | Hotel | Private Charter | Ticketing | Support
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "Meet & Greet", href: "/solutions/concierge" },
  { label: "Lounge", href: "/lounge" },
  { label: "Airports", href: "/airports" },
  { label: "Transport", href: "/solutions/transport" },
  { label: "Hotel", href: "/solutions/hotels" },
  { label: "Private Charter", href: "/solutions/aviation" },
  { label: "Ticketing", href: "/solutions/special-services?sub=ticketing" },
  { label: "Support", href: "/support" },
];

export function Navigation({ visible = true }: { visible?: boolean }) {
  const { branding } = useBranding();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(64);

  const auth = useContext(AuthContext);
  const authUser = auth?.user;
  const authRole = auth?.profile?.role;
  const isLoggedIn = Boolean(authUser || auth?.profile || roles.length > 0);

  const { getContacts, getPrimaryContact } = useWebsiteContacts();
  const contactNumbers = getContacts("contact");
  const primaryContact = getPrimaryContact("contact");

  const activeNavItems = ICICI_REVIEW_MODE
    ? NAV_ITEMS.filter(
        (item) => !["Transport", "Hotel", "Private Charter", "Ticketing"].includes(item.label)
      )
    : NAV_ITEMS;

  const isItemActive = (href: string) => {
    const [basePath, query] = href.split("?");
    if (query) {
      const searchObj = (location.search || {}) as Record<string, string | undefined>;
      const [key, val] = query.split("=");
      if (key && val) {
        return location.pathname === basePath && searchObj[key] === val;
      }
      return location.pathname === basePath;
    }
    if (basePath === "/") {
      return location.pathname === "/";
    }
    if (basePath === "/lounge") {
      return location.pathname === "/lounge" || location.pathname === "/solutions/lounge";
    }
    return location.pathname === basePath || location.pathname.startsWith(`${basePath}/`);
  };

  const getDashboardPath = (): any => {
    if (authRole === "super_admin" || roles.includes("super_admin")) return "/super-admin/dashboard";
    if (authRole === "staff" || roles.includes("staff")) return "/staff/dashboard";
    if (authRole === "admin" || roles.includes("admin")) return "/admin/dashboard";
    return "/dashboard";
  };

  const getDashboardLabel = () => {
    if (authRole === "super_admin" || roles.includes("super_admin")) return "Super Admin";
    if (authRole === "staff" || roles.includes("staff")) return "Operations";
    if (authRole === "admin" || roles.includes("admin")) return "Admin Portal";
    const meta = authUser?.user_metadata || {};
    const name = String(auth?.profile?.name || meta.full_name || meta.name || "").trim();
    return name && !name.includes("@") && name.toLowerCase() !== "user" ? name : "My Account";
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await getSessionInfo();
        if (mounted && s?.userId && s.roles) {
          setRoles(s.roles as string[]);
        }
      } catch (e) {
        // ignore guest state
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Dynamically update header height for mobile drawer positioning
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, [scrolled, mobileOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const getItemIcon = (label: string) => {
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
      case "Ticketing":
        return Ticket;
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

  if (!visible) return null;

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "apple-glass-navbar-scrolled py-2 sm:py-2.5"
          : "apple-glass-navbar py-2 sm:py-3"
      }`}
    >
      <div className="mx-auto max-w-[1560px] px-3 sm:px-4 md:px-6 lg:px-4 xl:px-8 2xl:px-10">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 lg:gap-3 min-w-0">
          {/* Brand Logo & Back Button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0">
            {location.pathname !== "/" && (
              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    navigate({ to: "/" });
                  }
                }}
                className="apple-glass-pill inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 lg:px-3 py-1 sm:py-1.5 rounded-full text-slate-800 text-[11px] sm:text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 shrink-0"
                title="Go back"
              >
                <ArrowLeft size={12} className="text-lime-700 shrink-0" />
                <span>Back</span>
              </button>
            )}

            <Link to="/" className="flex items-center shrink-0">
              <motion.div
                className="relative flex items-center justify-center shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 18 }}
              >
                <img
                  src={branding.logo_url || "/logo.png"}
                  alt="Shafsky Aviation Services"
                  className="h-9 sm:h-10 md:h-11 lg:h-11 xl:h-13 2xl:h-14 w-auto object-contain transition-transform duration-300 select-none"
                  style={{
                    imageRendering: "auto",
                    WebkitFontSmoothing: "antialiased",
                    filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.06)) contrast(1.05) saturate(1.08)",
                    transform: "translateZ(0)",
                  }}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </motion.div>
            </Link>
          </div>

          {/* Desktop Navigation Links (Direct individual links) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 2xl:gap-2 shrink min-w-0">
            {activeNavItems.map((item) => {
              const isActive = isItemActive(item.href);

              return (
                <motion.div
                  key={item.label}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                >
                  <Link
                    to={item.href}
                    className={`inline-flex items-center px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 py-1 lg:py-1.5 rounded-full text-[11px] xl:text-[12px] 2xl:text-[13px] font-semibold transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? "apple-glass-nav-item-active"
                        : "apple-glass-nav-item"
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 xl:gap-2.5 shrink-0">
            {/* 24x7 WhatsApp Booking Link (Desktop & Tablet Pill) */}
            <a
              href={CONTACT_DETAILS.WHATSAPP_BOOKING_LINK}
              target="_blank"
              rel="noopener noreferrer"
              title={`24/7 WhatsApp Booking (${CONTACT_DETAILS.WHATSAPP_BOOKING})`}
              aria-label={`24/7 WhatsApp Booking (${CONTACT_DETAILS.WHATSAPP_BOOKING})`}
              className="apple-glass-pill hidden md:inline-flex items-center gap-1.5 px-2 lg:px-2.5 xl:px-3 py-1 lg:py-1.5 rounded-full text-[11px] xl:text-xs text-slate-800 hover:text-emerald-700 hover:border-emerald-300 transition-all cursor-pointer whitespace-nowrap group/wa shrink-0"
              style={mono}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <svg
                className="h-3.5 w-3.5 fill-emerald-600 shrink-0 transition-transform group-hover/wa:scale-110"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="tracking-wide font-semibold">
                <span>24x7</span>
                <span className="hidden 2xl:inline">: +91 9599087959</span>
              </span>
            </a>

            {/* Mobile Quick WhatsApp Icon (shown on mobile < md where pill is hidden) */}
            <a
              href={CONTACT_DETAILS.WHATSAPP_BOOKING_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="apple-glass-pill md:hidden p-1.5 sm:p-2 rounded-full text-emerald-600 hover:text-emerald-700 cursor-pointer active:scale-95 shrink-0"
              title={`24/7 WhatsApp Booking (${CONTACT_DETAILS.WHATSAPP_BOOKING})`}
              aria-label={`24/7 WhatsApp Booking (${CONTACT_DETAILS.WHATSAPP_BOOKING})`}
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5 fill-emerald-600" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>

            {/* Sign In / User Profile Button (visible across all screens, responsive label) */}
            {isLoggedIn ? (
              <Link
                to={getDashboardPath()}
                className="apple-glass-pill inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-full text-[11px] xl:text-xs font-semibold text-slate-900 cursor-pointer whitespace-nowrap shrink-0"
                style={mono}
              >
                <User size={13} className="text-lime-700 shrink-0" />
                <span className="hidden sm:inline">{getDashboardLabel()}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="apple-glass-pill inline-flex items-center gap-1 sm:gap-1.5 text-[11px] xl:text-xs font-semibold text-slate-800 hover:text-slate-950 px-2 sm:px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-full cursor-pointer whitespace-nowrap shrink-0"
                style={mono}
              >
                <LogIn size={13} className="text-slate-600 shrink-0" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Book Now Button (Prominently visible across ALL screen widths!) */}
            <motion.a
              href="/#book"
              onClick={(e) => {
                const el = document.getElementById("book");
                if (el) {
                  e.preventDefault();
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="group/btn relative overflow-hidden inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-gradient-to-r from-lime-500 to-lime-400 px-2.5 sm:px-3.5 xl:px-4 py-1.5 text-[11px] xl:text-xs font-bold uppercase tracking-wider text-slate-950 shadow-[0_4px_16px_rgba(132,204,22,0.35),inset_0_1px_0_0_rgba(255,255,255,0.6)] hover:shadow-[0_6px_22px_rgba(132,204,22,0.5),inset_0_1px_0_0_rgba(255,255,255,0.8)] border border-lime-300/60 transition-all duration-300 cursor-pointer whitespace-nowrap shrink-0"
              style={mono}
            >
              <div className="absolute inset-0 w-[200%] -translate-x-[150%] bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
              <span className="relative z-10">Book Now</span>
              <ArrowRight
                size={12}
                className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-0.5 shrink-0"
              />
            </motion.a>

            {/* Mobile / Tablet Menu Toggle (visible when desktop nav is hidden, i.e. < lg) */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="apple-glass-pill lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-900 cursor-pointer active:scale-95 shrink-0"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Direct responsive links) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            style={{ top: `${headerHeight}px` }}
            className="lg:hidden apple-glass-drawer fixed inset-x-0 top-16 sm:top-[72px] bottom-0 p-6 flex flex-col justify-between overflow-y-auto z-50 shadow-2xl"
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
    </header>
  );
}

export default Navigation;
