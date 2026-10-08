import React, { useEffect, useState, useContext, useRef, useCallback, useLayoutEffect } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { getSessionInfo } from "@/lib/session";
import { AuthContext } from "@/auth-system/AuthProvider";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

import {
  Menu,
  X,
  Plane,
  ChevronDown,
  Crown,
  Hotel, Car,
  PhoneCall,
  ArrowRight,
  ArrowLeft,
  User,
  LogIn,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { useBranding } from "@/lib/branding/branding.context";
import { mono, display } from "@/components/home/theme";
import { motion, AnimatePresence } from "framer-motion";
import { ICICI_REVIEW_MODE } from "@/lib/config/reviewMode";

interface ServiceMenuItem {
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
    title: "Meet & Greet and Lounge Service",
    href: "/solutions/concierge",
    descriptor: "Airport assistance • Domestic • International • Transit",
    icon: Crown,
    badge: "Signature Concierge",
    image: "/images/services-gallery/aerobridge-welcome.webp",
    features: ["Aerobridge Meet", "Baggage Porter", "Fast-Track Security", "VIP Lounge Access"],
  },
  {
    title: "Private Charter",
    href: "/solutions/aviation",
    descriptor: "Private • Corporate • Helicopter • Charter services",
    icon: Plane,
    badge: "Executive Fleet",
    image: "/images/charter/luxury-cabin.webp",
    features: ["Private Jet Charter", "Helicopter Transfers", "Empty Leg Flights", "Air Ambulance"],
  },
  {
    title: "Transport Service",
    href: "/solutions/cargo",
    descriptor: "Luxury • MUV / Large • Standard",
    icon: Car,
    badge: "Chauffeur & Fleet",
    image: "/images/transport/tarmac-chauffeur.webp",
    features: ["Mercedes Maybach & S-Class", "Large MUV & Coach", "Tarmac Escort", "24/7 Curbside Meet"],
  },
  {
    title: "Luxury Hotels",
    href: "/solutions/travel",
    descriptor: "7 Star • 5 Star • 3 Star",
    icon: Hotel,
    badge: "Curated Stays",
    image: "/images/hotels/de-pavilion.jpg",
    features: ["7 Star & 5 Star Suites", "Transit Airport Hotels", "Day-Use Rooms", "Express Check-In"],
  },
  {
    title: "Special Services",
    href: "/solutions/medical",
    descriptor: "Air & Train Ambulance • HUM • Visa • Cargo & AVI • Ticketing • Spa • PSO",
    icon: ShieldCheck,
    badge: "Protocol & Medevac",
    image: "/images/services-gallery/family-arrival.webp",
    features: [
      "Air & Train Ambulance",
      "HUM Remains Repatriation",
      "Visa & Air Ticketing Assist",
      "Cargo & AVI Pet Freight",
    ],
  },
];

interface NavCategory {
  label: string;
  href: string;
  isMega?: boolean;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * SHAFSKY 5 PRIMARY SERVICES NAVBAR NAVIGATION STRUCTURE
 * ─────────────────────────────────────────────────────────────────────────── */
const NAV_STRUCTURE: NavCategory[] = [
  {
    label: "Services",
    href: "/solutions/concierge",
    isMega: true,
  },
  {
    label: "Airports",
    href: "/airports",
  },
  {
    label: "Private Charter",
    href: "/solutions/aviation",
  },
  {
    label: "Gallery",
    href: "/gallery",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

export function Navigation({ visible = true }: { visible?: boolean }) {
  const { branding } = useBranding();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);

  const auth = useContext(AuthContext);
  const authUser = auth?.user;
  const authRole = auth?.profile?.role;
  const isLoggedIn = Boolean(authUser || auth?.profile || roles.length > 0);

  const activePrimaryServices = ICICI_REVIEW_MODE
    ? PRIMARY_SERVICES.filter((srv) => srv.href === "/solutions/concierge")
    : PRIMARY_SERVICES;

  const activeNavStructure = ICICI_REVIEW_MODE
    ? NAV_STRUCTURE.filter((item) => item.href !== "/solutions/aviation")
    : NAV_STRUCTURE;

  const [previewServiceTitle, setPreviewServiceTitle] = useState<string>(
    "Meet & Greet and Lounge Service"
  );

  const activePreview =
    activePrimaryServices.find((s) => s.title === previewServiceTitle) ||
    activePrimaryServices[0];

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

  const headerContainerRef = useRef<HTMLDivElement | null>(null);
  const megaTriggerRef = useRef<HTMLDivElement | null>(null);
  const megaMenuRef = useRef<HTMLDivElement | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [menuLeftOffset, setMenuLeftOffset] = useState<number | null>(null);

  const updateMenuPosition = useCallback(() => {
    if (typeof window === "undefined" || !megaTriggerRef.current) return;
    const triggerRect = megaTriggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const targetMenuWidth = ICICI_REVIEW_MODE ? 380 : 840;
    const menuWidth = Math.min(targetMenuWidth, Math.max(300, viewportWidth - 32));
    const minMargin = 16;
    const maxRight = viewportWidth - minMargin - menuWidth;

    // Desired center alignment under the Services trigger button
    const triggerCenter = triggerRect.left + triggerRect.width / 2;
    let targetLeft = triggerCenter - menuWidth / 2;

    // If centering would push the left side too close to or off the screen edge
    if (targetLeft < minMargin) {
      let alignedLeft = minMargin;
      if (headerContainerRef.current) {
        const containerRect = headerContainerRef.current.getBoundingClientRect();
        const pad = viewportWidth >= 768 ? 56 : viewportWidth >= 640 ? 32 : 16;
        const contentLeft = containerRect.left + pad;
        if (contentLeft >= minMargin && contentLeft <= maxRight) {
          alignedLeft = contentLeft;
        }
      }
      targetLeft = alignedLeft;
    }

    // Safety checks against screen bounds
    if (targetLeft > maxRight) {
      targetLeft = maxRight;
    }
    if (targetLeft < minMargin) {
      targetLeft = minMargin;
    }

    // Offset relative to the trigger button's own left position
    const offset = Math.round(targetLeft - triggerRect.left);
    setMenuLeftOffset(offset);
  }, []);

  const handleMouseEnter = (label: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (label === "Services") {
      updateMenuPosition();
    }
    setHoveredCategory(label);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 140);
  };

  useIsomorphicLayoutEffect(() => {
    if (hoveredCategory === "Services") {
      updateMenuPosition();
    }
  }, [hoveredCategory, updateMenuPosition]);

  useEffect(() => {
    if (!hoveredCategory) return;
    const handleResizeOrScroll = () => {
      if (window.innerWidth < 1024) {
        setHoveredCategory(null);
      } else {
        updateMenuPosition();
      }
    };
    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll);
    };
  }, [hoveredCategory, updateMenuPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        megaMenuRef.current &&
        !megaMenuRef.current.contains(target) &&
        megaTriggerRef.current &&
        !megaTriggerRef.current.contains(target)
      ) {
        setHoveredCategory(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Close mobile & hover menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setHoveredCategory(null);
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-3"
          : "bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-4"
      }`}
    >
      <div ref={headerContainerRef} className="mx-auto max-w-[1480px] px-4 sm:px-8 md:px-14">
        <div className="flex items-center justify-between">
          {/* Brand Logo & Emblem + Back Button */}
          <div className="flex items-center gap-3 shrink-0">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lime-50 hover:bg-lime-100 text-slate-900 border border-lime-300 text-xs font-mono font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                title="Go back"
              >
                <ArrowLeft size={13} className="text-lime-700" />
                <span>Back</span>
              </button>
            )}

            <Link to="/" className="flex items-center shrink-0">
              <motion.div
                className="relative flex items-center justify-center"
                whileHover={{ scale: 1.08, rotate: -4 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 18 }}
              >
                {/* Height is fixed and width follows the logo natural aspect
                    ratio, so the wordmark inside the image stays legible. */}
                <img
                  src={branding.logo_url || "/logo.png"}
                  alt="Shafsky Aviation Services"
                  className="h-12 sm:h-13 md:h-14 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </motion.div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {activeNavStructure.map((item) => {
              const isMega = !!item.isMega;
              const isHovered = hoveredCategory === item.label;
              const isServiceActive = isMega && location.pathname.startsWith("/solutions/");
              const isActive = isMega
                ? isServiceActive
                : item.href === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.href);

              return (
                <div
                  key={item.label}
                  ref={isMega ? megaTriggerRef : undefined}
                  className="relative py-2"
                  onMouseEnter={() => isMega && handleMouseEnter(item.label)}
                  onMouseLeave={() => isMega && handleMouseLeave()}
                >
                  {isMega ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isHovered) {
                          updateMenuPosition();
                        }
                        setHoveredCategory(isHovered ? null : item.label);
                      }}
                      aria-expanded={isHovered}
                      aria-haspopup="true"
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                        isActive || isHovered
                          ? "text-slate-950 bg-slate-100 border border-slate-300"
                          : "text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 text-slate-500 ${
                          isHovered ? "rotate-180 text-slate-900" : ""
                        }`}
                      />
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 ${
                        isActive
                          ? "text-slate-950 bg-slate-100 border border-slate-300"
                          : "text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <span>{item.label}</span>
                    </Link>
                  )}

                  {/* Enterprise Services Mega Menu Dropdown */}
                  <AnimatePresence>
                    {isMega && isHovered && (
                      <motion.div
                        ref={megaMenuRef}
                        key="services-mega"
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        onMouseEnter={() => handleMouseEnter(item.label)}
                        onMouseLeave={() => handleMouseLeave()}
                        style={{
                          left: menuLeftOffset !== null ? `${menuLeftOffset}px` : undefined,
                        }}
                        className={`absolute top-[calc(100%-2px)] rounded-[22px] bg-white border border-[#c5a059]/25 shadow-[0_24px_65px_-12px_rgba(10,25,111,0.16),0_0_0_1px_rgba(197,160,89,0.12)] p-3.5 z-50 before:absolute before:-top-3 before:left-0 before:w-full before:h-3 before:content-[''] ${
                          menuLeftOffset === null ? "left-0" : ""
                        } ${
                          ICICI_REVIEW_MODE ? "w-[380px]" : "w-[840px] max-w-[calc(100vw-32px)]"
                        }`}
                      >
                        {ICICI_REVIEW_MODE ? (
                          <div className="flex flex-col gap-2">
                            {activePrimaryServices.map((srv) => {
                              const SrvIcon = srv.icon;
                              return (
                                <Link
                                  key={srv.title}
                                  to={srv.href}
                                  onClick={() => setHoveredCategory(null)}
                                  className="group/item flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-[#faf9f5] border border-slate-200/80 hover:border-[#c5a059]/60 transition-all duration-200"
                                >
                                  <div className="h-9 w-9 rounded-lg bg-[#0a196f] text-[#c5a059] flex items-center justify-center shrink-0">
                                    <SrvIcon size={16} />
                                  </div>
                                  <div>
                                    <h4 className="text-[13.5px] font-bold text-slate-900 group-hover/item:text-[#0a196f]">
                                      {srv.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                      {srv.descriptor}
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
                            {/* Left Column: Refined Navigation List */}
                            <div className="md:col-span-7 min-w-0 flex flex-col justify-between pr-1">
                              <div>
                                <div className="flex items-center justify-between pb-2 mb-1 px-2 border-b border-slate-100">
                                  <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#c5a059]" />
                                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#0a196f] font-bold">
                                      Shafsky Aviation Portfolios
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400 font-medium">
                                    5 Core Services
                                  </span>
                                </div>

                                <div className="flex flex-col gap-1">
                                  {activePrimaryServices.map((srv) => {
                                    const SrvIcon = srv.icon;
                                    const isSelected = activePreview?.title === srv.title;

                                    return (
                                      <Link
                                        key={srv.title}
                                        to={srv.href}
                                        onClick={() => setHoveredCategory(null)}
                                        onMouseEnter={() => setPreviewServiceTitle(srv.title)}
                                        className={`group/item relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                                          isSelected
                                            ? "bg-slate-100/90 shadow-xs"
                                            : "hover:bg-slate-50/90 text-slate-700"
                                        }`}
                                      >
                                        {/* Left luxury gold accent indicator */}
                                        <div
                                          className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-200 ${
                                            isSelected
                                              ? "h-6 bg-[#c5a059]"
                                              : "h-0 bg-transparent group-hover/item:h-3 group-hover/item:bg-[#c5a059]/50"
                                          }`}
                                        />

                                        <div
                                          className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                                            isSelected
                                              ? "bg-[#0a196f] text-[#c5a059] shadow-xs"
                                              : "bg-white border border-slate-200/90 text-slate-600 group-hover/item:bg-[#0a196f] group-hover/item:text-white group-hover/item:border-[#0a196f]"
                                          }`}
                                        >
                                          <SrvIcon size={15} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between gap-1">
                                            <span
                                              className={`text-[13px] font-semibold tracking-tight transition-colors ${
                                                isSelected
                                                  ? "text-[#0a196f] font-bold"
                                                  : "text-slate-900 group-hover/item:text-[#0a196f]"
                                              }`}
                                            >
                                              {srv.title}
                                            </span>
                                            <ArrowRight
                                              size={12}
                                              className={`transition-all duration-200 shrink-0 ${
                                                isSelected
                                                  ? "text-[#c5a059] opacity-100 translate-x-0"
                                                  : "text-slate-300 opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0"
                                              }`}
                                            />
                                          </div>
                                          <p className="text-[10.5px] text-slate-500 font-mono mt-0.5 leading-snug group-hover/item:text-slate-700">
                                            {srv.descriptor}
                                          </p>
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Bottom concierge contact hotline strip */}
                              <div className="pt-2 px-2 border-t border-slate-100 flex items-center justify-between text-[10.5px] font-mono text-slate-500">
                                <span className="flex items-center gap-1.5">
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                  </span>
                                  Direct Airside Coordination
                                </span>
                                <a
                                  href="tel:+919599087959"
                                  className="text-[#0a196f] font-bold hover:underline"
                                >
                                  +91 9599087959
                                </a>
                              </div>
                            </div>

                            {/* Right Column: Classical Luxury Showcase Preview */}
                            <div className="md:col-span-5 relative flex flex-col">
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={activePreview.title}
                                  initial={{ opacity: 0, scale: 0.98 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.98 }}
                                  transition={{ duration: 0.18, ease: "easeOut" }}
                                  className="relative flex-1 min-h-[350px] rounded-2xl overflow-hidden border border-[#c5a059]/30 shadow-md flex flex-col justify-end p-4 text-white group/preview bg-[#071328]"
                                >
                                  {/* Background Image with Cinematic Gradient */}
                                  <img width={1600} height={900} src={activePreview.image}
                                    alt={activePreview.title}
                                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover/preview:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-[#071328] via-[#071328]/70 to-[#071328]/25" />
                                  <div className="absolute inset-0 bg-[#0a196f]/15 mix-blend-multiply" />

                                  {/* Top Floating Badge */}
                                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#071328]/85 backdrop-blur-md border border-[#c5a059]/40 text-[9.5px] font-mono font-bold tracking-wider text-[#c5a059] uppercase shadow-sm">
                                      <Sparkles size={11} className="text-[#c5a059]" />
                                      <span>{activePreview.badge || "VIP Showcase"}</span>
                                    </span>
                                    <span className="text-[9px] font-mono tracking-widest text-slate-300 uppercase px-2 py-0.5 rounded bg-black/40 backdrop-blur-xs">
                                      Airside
                                    </span>
                                  </div>

                                  {/* Content */}
                                  <div className="relative z-10 flex flex-col gap-2.5">
                                    <div>
                                      <h4
                                        className="text-[17px] font-bold tracking-tight text-white leading-tight drop-shadow-sm"
                                        style={display}
                                      >
                                        {activePreview.title}
                                      </h4>
                                      <p className="text-[11px] text-slate-200/90 font-mono mt-1 leading-snug line-clamp-2">
                                        {activePreview.descriptor}
                                      </p>
                                    </div>

                                    {/* Feature Tags */}
                                    {activePreview.features && (
                                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                                        {activePreview.features.map((feat) => (
                                          <span
                                            key={feat}
                                            className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-sm border border-white/15 text-[9.5px] font-mono text-slate-200"
                                          >
                                            {feat}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    {/* Action Link Button */}
                                    <Link
                                      to={activePreview.href}
                                      onClick={() => setHoveredCategory(null)}
                                      className="mt-1 w-full inline-flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 text-xs font-bold font-mono tracking-wider uppercase shadow-md shadow-black/30 hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
                                    >
                                      <span>Explore Service & Book</span>
                                      <ArrowRight size={13} className="text-slate-950 transition-transform group-hover/preview:translate-x-1" />
                                    </Link>
                                  </div>
                                </motion.div>
                              </AnimatePresence>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* Right Action Controls: 24/7 Operations Desk & CTA */}
          <div className="hidden sm:flex items-center gap-4">
            <a
              href="tel:+919599087959"
              className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-lime-50 border border-lime-300 text-[11px] text-slate-800 hover:border-lime-500 hover:text-lime-700 transition-all font-semibold"
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
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-900 hover:border-lime-500 transition-colors"
                style={mono}
              >
                <User size={14} className="text-lime-700" />
                <span>{getDashboardLabel()}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                style={mono}
              >
                <LogIn size={13} className="text-slate-500" />
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
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group/btn relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-[#84cc16] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-md shadow-lime-500/20 transition-shadow duration-300 hover:shadow-lg hover:shadow-lime-500/40 cursor-pointer"
              style={mono}
            >
              <div className="absolute inset-0 w-[200%] -translate-x-[150%] bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
              <div className="absolute inset-0 bg-[#a3e635] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10">Book Now</span>
              <ArrowRight size={14} className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </motion.a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-100 border border-slate-300 text-slate-900 hover:border-[#0a196f] active:bg-slate-200 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Full-Screen Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden fixed inset-x-0 top-full h-[calc(100vh-70px)] bg-white border-t border-slate-200 p-6 flex flex-col justify-between overflow-y-auto z-50 shadow-xl"
          >
          <div className="space-y-4">
            <div
              className="text-[10px] uppercase tracking-[0.3em] text-[#0a196f] font-bold pb-2 border-b border-slate-200"
              style={mono}
            >
              Navigation Menu
            </div>

            <div className="flex flex-col gap-1.5">
              {activeNavStructure.map((item) => {
                const isMega = !!item.isMega;
                const isExpanded = expandedMobileCategory === item.label;

                return (
                  <div key={item.label} className="border-b border-slate-100 pb-2">
                    {isMega ? (
                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedMobileCategory(isExpanded ? null : item.label)
                          }
                          className="w-full flex items-center justify-between py-2.5 text-base font-semibold text-slate-900"
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            size={16}
                            className={`text-slate-500 transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-slate-900" : ""
                            }`}
                          />
                        </button>
                        {isExpanded && (
                          <div className="pl-3 mt-2 space-y-2 border-l-2 border-[#0a196f]/40">
                            {activePrimaryServices.map((srv) => {
                              const SIcon = srv.icon;
                              return (
                                <Link
                                  key={srv.title}
                                  to={srv.href}
                                  onClick={() => {
                                    setMobileOpen(false);
                                    setExpandedMobileCategory(null);
                                  }}
                                  className="block py-2 group"
                                >
                                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 group-hover:text-[#0a196f]">
                                    <SIcon size={15} className="text-[#0a196f]" />
                                    <span>{srv.title}</span>
                                  </div>
                                  <p className="text-[10.5px] text-slate-500 font-mono mt-0.5 pl-6 leading-tight">
                                    {srv.descriptor}
                                  </p>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="block py-2.5 text-base font-semibold text-slate-900 hover:text-slate-700"
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Bottom Quick Actions */}
          <div className="pt-6 border-t border-slate-200 space-y-3">
            {isLoggedIn ? (
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 border border-slate-300 text-xs font-bold text-slate-900 tracking-wider uppercase hover:border-[#0a196f] transition-colors"
                style={mono}
              >
                <User size={14} className="text-[#0a196f]" />
                <span>{getDashboardLabel()}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 border border-slate-300 text-xs font-bold text-slate-900 tracking-wider uppercase hover:border-[#0a196f] transition-colors"
                style={mono}
              >
                <LogIn size={14} className="text-slate-600" />
                <span>Sign In</span>
              </Link>
            )}

            <a
              href="tel:+919599087959"
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 tracking-wider uppercase hover:border-slate-300"
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
              className="group/btn relative overflow-hidden w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#84cc16] text-slate-950 text-xs font-bold tracking-wider uppercase shadow-md shadow-lime-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-lime-500/35 hover:-translate-y-0.5 cursor-pointer"
              style={mono}
            >
              <div className="absolute inset-0 w-[200%] -translate-x-[150%] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
              <div className="absolute inset-0 bg-[#a3e635] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10">Book Now</span>
              <ArrowRight size={14} className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </a>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navigation;
