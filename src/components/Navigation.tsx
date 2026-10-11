import React, { useEffect, useState, useContext } from "react";
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
} from "lucide-react";
import { useBranding } from "@/lib/branding/branding.context";
import { mono } from "@/components/home/theme";
import { motion, AnimatePresence } from "framer-motion";
import { ICICI_REVIEW_MODE } from "@/lib/config/reviewMode";

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
    title: "Meet & Greet & Lounge",
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
 * 8 Navbar Navigation Items in exact specified order:
 * Meet & Greet & Lounge | Transport | Hotel | Private Charter | Ticketing | Airports | Gallery | Contact
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "Meet & Greet & Lounge", href: "/solutions/concierge" },
  { label: "Transport", href: "/solutions/transport" },
  { label: "Hotel", href: "/solutions/hotels" },
  { label: "Private Charter", href: "/solutions/aviation" },
  { label: "Ticketing", href: "/solutions/special-services?sub=ticketing" },
  { label: "Airports", href: "/airports" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export function Navigation({ visible = true }: { visible?: boolean }) {
  const { branding } = useBranding();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);

  const auth = useContext(AuthContext);
  const authUser = auth?.user;
  const authRole = auth?.profile?.role;
  const isLoggedIn = Boolean(authUser || auth?.profile || roles.length > 0);

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

  if (!visible) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "apple-glass-navbar-scrolled py-2 sm:py-2.5"
          : "apple-glass-navbar py-2 sm:py-3"
      }`}
    >
      <div className="mx-auto max-w-[1560px] px-4 sm:px-6 md:px-8 xl:px-10">
        <div className="flex items-center justify-between gap-2">
          {/* Brand Logo & Back Button */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
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
                className="apple-glass-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-800 text-xs font-mono font-bold transition-all cursor-pointer active:scale-95"
                title="Go back"
              >
                <ArrowLeft size={13} className="text-lime-700" />
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
                  className="h-12 sm:h-14 md:h-16 lg:h-[66px] xl:h-[72px] w-auto object-contain transition-transform duration-300 select-none"
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

          {/* Desktop Navigation Links (Individual direct links, no mega-menu or dropdown) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 2xl:gap-2">
            {activeNavItems.map((item) => {
              const isActive = isItemActive(item.href);
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`inline-flex items-center px-2 lg:px-2.5 xl:px-3 py-1.5 rounded-full text-[11.5px] xl:text-[12.5px] 2xl:text-[13px] font-semibold transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "apple-glass-nav-item-active"
                      : "apple-glass-nav-item"
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden sm:flex items-center gap-2 xl:gap-3 shrink-0">
            <a
              href="tel:+919599087959"
              className="hidden 2xl:flex apple-glass-pill items-center gap-2 px-3 py-1.5 rounded-full text-[11px] text-slate-800 hover:text-slate-950 font-semibold cursor-pointer whitespace-nowrap"
              style={mono}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-600" />
              </span>
              <span className="tracking-wide">24/7: +91 9599087959</span>
            </a>

            {isLoggedIn ? (
              <Link
                to={getDashboardPath()}
                className="apple-glass-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-900 cursor-pointer whitespace-nowrap"
                style={mono}
              >
                <User size={13} className="text-lime-700" />
                <span>{getDashboardLabel()}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="apple-glass-pill inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-slate-950 px-3 py-1.5 rounded-full cursor-pointer whitespace-nowrap"
                style={mono}
              >
                <LogIn size={13} className="text-slate-600" />
                <span>Sign In</span>
              </Link>
            )}

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
              className="group/btn relative overflow-hidden inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-lime-500 to-lime-400 px-4 xl:px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-[0_4px_16px_rgba(132,204,22,0.35),inset_0_1px_0_0_rgba(255,255,255,0.6)] hover:shadow-[0_6px_22px_rgba(132,204,22,0.5),inset_0_1px_0_0_rgba(255,255,255,0.8)] border border-lime-300/60 transition-all duration-300 cursor-pointer whitespace-nowrap"
              style={mono}
            >
              <div className="absolute inset-0 w-[200%] -translate-x-[150%] bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
              <span className="relative z-10">Book Now</span>
              <ArrowRight
                size={13}
                className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-0.5"
              />
            </motion.a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden apple-glass-pill p-2 rounded-xl text-slate-900 cursor-pointer active:scale-95"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (No mega-menu, direct responsive links) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden apple-glass-drawer fixed inset-x-0 top-full h-[calc(100vh-70px)] p-6 flex flex-col justify-between overflow-y-auto z-50 shadow-2xl"
          >
            <div className="space-y-4">
              <div
                className="text-[10px] uppercase tracking-[0.3em] text-[#0a196f] font-bold pb-2 border-b border-slate-200"
                style={mono}
              >
                Navigation Menu
              </div>

              <div className="flex flex-col gap-1">
                {activeNavItems.map((item) => {
                  const isActive = isItemActive(item.href);
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
                      <span>{item.label}</span>
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

              <a
                href="tel:+919599087959"
                className="apple-glass-pill w-full flex items-center justify-center gap-2.5 py-3 rounded-full text-xs font-bold text-slate-900 tracking-wider uppercase"
                style={mono}
              >
                <PhoneCall size={14} className="text-[#0a196f]" />
                <span>Call 24/7 Desk (+91 9599087959)</span>
              </a>

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
