import React, { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { getSessionInfo } from "@/lib/session";
import {
  Menu,
  X,
  Plane,
  ChevronDown,
  Crown,
  Hotel,
  Package,
  HeartPulse,
  Sparkles,
  ArrowRight,
  User,
} from "lucide-react";
import { useBranding } from "@/lib/branding/branding.context";

const mono = { fontFamily: "'JetBrains Mono', monospace" };
const displayFont = { fontFamily: "'Fraunces', serif" };

/* ─────────────────────────────────────────────────────────────────────────────
 * PROMINENT LOGO CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────── */
const LOGO_CONFIG = {
  height: "72px",
  width: "auto",
  maxWidth: "360px",
  scale: "2.3",
  offsetX: "0px",
  offsetY: "0px",
};

interface MegaMenuItem {
  title: string;
  href: string;
  icon: any;
  desc: string;
  tag?: string;
}

interface NavCategory {
  label: string;
  href: string;
  megaMenu?: {
    eyebrow: string;
    description: string;
    items: MegaMenuItem[];
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * STREAMLINED 5-SERVICE MEGA MENU NAVIGATION STRUCTURE
 * ─────────────────────────────────────────────────────────────────────────── */
const NAV_STRUCTURE: NavCategory[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Services",
    href: "/solutions/concierge",
    megaMenu: {
      eyebrow: "Our Concierge Ecosystem",
      description: "Explore our flagship airside, travel, cargo, medical, and private aviation solutions.",
      items: [
        {
          title: "Airport Services",
          href: "/solutions/concierge",
          icon: Crown,
          desc: "Everything you need for a smooth airport journey: Meet & Greet, Airport Lounge, Fast Track & Airport Transfer.",
          tag: "Airport Services",
        },
        {
          title: "Travel Services",
          href: "/solutions/travel",
          icon: Hotel,
          desc: "5-Star luxury palace hotel reservations, consular visa clearance & executive flight booking.",
          tag: "Bespoke Hospitality",
        },
        {
          title: "Cargo & Logistics",
          href: "/solutions/cargo",
          icon: Package,
          desc: "Express airside freight clearance & climate-controlled live animal pet AVI travel escort.",
          tag: "White-Glove Freight",
        },
        {
          title: "Medical Assist",
          href: "/solutions/medical",
          icon: HeartPulse,
          desc: "24/7 Airborne ICU medevac flights, mobile rail ICU ambulance & dignified repatriation.",
          tag: "Emergency ICU",
        },
        {
          title: "Private Aviation",
          href: "/charter",
          icon: Plane,
          desc: "On-demand executive private jet charters & private FBO general aviation suites.",
          tag: "VIP Charter",
        },
      ],
    },
  },
  {
    label: "Airports",
    href: "/airports",
  },
  {
    label: "About",
    href: "/services/guide",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

export function Navigation({ visible = true }: { visible?: boolean }) {
  const { branding } = useBranding();
  const location = useLocation();

  const [roles, setRoles] = useState<string[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);

  const getDashboardPath = () => {
    if (roles.includes("super_admin")) return "/super-admin";
    if (roles.includes("admin")) return "/admin";
    return "/dashboard";
  };

  const getDashboardLabel = () => {
    if (roles.includes("super_admin")) return "Super Admin";
    if (roles.includes("admin")) return "Admin Console";
    return userName || "My Account";
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await getSessionInfo();
        if (s?.roles && mounted) {
          setRoles(s.roles);
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

  // Close mobile & hover menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setHoveredCategory(null);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
          ? "bg-[#faf9f5]/95 backdrop-blur-xl border-b border-slate-200/80 shadow-md py-3.5"
          : "bg-gradient-to-b from-[#faf9f5] via-[#faf9f5]/90 to-transparent py-4.5"
        } ${!visible ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="relative max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-8 flex items-center justify-between min-h-[52px]">
        {/* ── 1. LOGO SECTION (Left - Prominent, Adaptive & Balanced) ── */}
        <div className="relative shrink-0 z-20 overflow-visible transition-transform duration-300 origin-left scale-[1.25] sm:scale-[1.55] md:scale-[1.9] lg:scale-[2.3]">
          <Link to="/" className="inline-flex items-center gap-3 group">
            {branding.logo_url ? (
              <img
                src={branding.logo_dark_url || branding.logo_url}
                alt={branding.company_name}
                style={{
                  height: LOGO_CONFIG.height,
                  width: LOGO_CONFIG.width,
                  maxWidth: "min(320px, 45vw)",
                  objectFit: "contain",
                  display: "block",
                }}
                className="transition-all duration-300 transform-gpu hover:scale-105"
              />
            ) : (
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#84cc16] flex items-center justify-center text-[#0f172a] shadow-md group-hover:scale-105 transition-transform duration-300">
                  <Plane className="w-4 h-4 sm:w-5 sm:h-5 transform -rotate-45" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold uppercase tracking-[0.25em] text-slate-900 leading-none">
                    {branding.company_name.split(" ")[0]?.toUpperCase() || "SHAFSKY"}
                  </div>
                  <div className="text-[8px] sm:text-[9px] tracking-[0.45em] text-slate-600 uppercase mt-1 leading-none font-bold">
                    {(branding.company_name.split(" ").slice(1).join(" ") || "AVIATION").toUpperCase()}
                  </div>
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* ── 2. CENTER NAVIGATION LINKS WITH UNIFIED "SERVICES" MEGA MENU ── */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center justify-center flex-1 mx-8 z-20">
          <ul className="flex items-center gap-7 xl:gap-9">
            {NAV_STRUCTURE.map((item) => {
              const isActive =
                item.href === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.href);

              const hasMegaMenu = Boolean(item.megaMenu);

              return (
                <li
                  key={item.label}
                  className="relative py-2"
                  onMouseEnter={() => setHoveredCategory(item.label)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    to={item.href}
                    className={`text-[12px] font-bold uppercase tracking-[0.18em] transition-colors duration-200 flex items-center gap-1.5 py-1 ${isActive ? "text-emerald-700 font-extrabold" : "text-slate-700 hover:text-slate-900"
                      }`}
                  >
                    <span>{item.label}</span>
                    {hasMegaMenu && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-emerald-700 transition-transform duration-300 ${hoveredCategory === item.label ? "rotate-180 text-emerald-700" : "opacity-70"
                          }`}
                      />
                    )}
                  </Link>
                  <span
                    className={`absolute bottom-0 left-0 w-full h-[2.5px] bg-emerald-600 rounded-full transition-transform duration-300 ${isActive || hoveredCategory === item.label ? "scale-x-100" : "scale-x-0"
                      }`}
                  />

                  {/* UNIFIED 5-SERVICES MEGA MENU DROPDOWN */}
                  {hasMegaMenu && item.megaMenu && (
                    <div
                      className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[680px] transition-all duration-250 pointer-events-none ${hoveredCategory === item.label
                          ? "opacity-100 translate-y-0 pointer-events-auto"
                          : "opacity-0 -translate-y-2 pointer-events-none"
                        }`}
                    >
                      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden relative">
                        {/* Mega Header */}
                        <div className="mb-4 pb-3 border-b border-slate-100">
                          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-700 flex items-center gap-2 font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{item.megaMenu.eyebrow}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600 font-sans font-medium">
                            {item.megaMenu.description}
                          </p>
                        </div>

                        {/* Mega Items Grid (5 Services) */}
                        <div className="grid grid-cols-1 gap-2.5">
                          {item.megaMenu.items.map((subItem, sIdx) => {
                            const SubIcon = subItem.icon || Crown;
                            return (
                              <Link
                                key={sIdx}
                                to={subItem.href}
                                className="group/item p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/60 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200 flex items-start gap-3.5"
                              >
                                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                                  <SubIcon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <span
                                      className="text-xs font-bold text-slate-900 group-hover/item:text-emerald-700 transition-colors truncate"
                                      style={displayFont}
                                    >
                                      {subItem.title}
                                    </span>
                                    {subItem.tag && (
                                      <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0">
                                        {subItem.tag}
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-1 text-[11px] text-slate-600 font-medium leading-relaxed">
                                    {subItem.desc}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── 3. RIGHT ACTIONS: SIGN IN & SINGLE "BOOK NOW" LIME GREEN CTA ── */}
        <div className="hidden lg:flex items-center gap-4 shrink-0 z-20">
          {roles.length > 0 ? (
            <Link
              to={getDashboardPath() as any}
              className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-800 hover:text-emerald-700 px-2 py-2 transition flex items-center gap-1.5"
              style={mono}
            >
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>{getDashboardLabel()}</span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 hover:text-slate-900 px-2.5 py-2 transition"
              style={mono}
            >
              Sign In
            </Link>
          )}

          {/* SINGLE PRIMARY CTA: LIME GREEN "BOOK NOW" */}
          <Link
            to="/book"
            className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#0f172a] bg-[#84cc16] hover:bg-[#65a30d] hover:text-[#0f172a] rounded-full px-6 py-2.5 transition duration-200 shadow-sm hover:shadow-md flex items-center gap-2 transform hover:scale-[1.03]"
            style={mono}
          >
            <span>BOOK NOW</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* MOBILE MENU TOGGLE BUTTON */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden text-slate-800 hover:text-slate-900 p-2.5 rounded-xl bg-slate-100/90 active:bg-slate-200 border border-slate-200/80 ml-auto z-30 touch-manipulation min-w-[42px] min-h-[42px] flex items-center justify-center"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X size={22} className="text-emerald-700" /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE MENU DRAWER */}
      <div
        className={`fixed inset-0 w-full h-[100dvh] bg-[#faf9f5]/98 backdrop-blur-2xl px-5 sm:px-8 pt-24 pb-8 flex flex-col justify-between transition-all duration-300 ease-in-out lg:hidden z-20 overflow-y-auto ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      >
        <div className="flex flex-col gap-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-700 font-bold mb-1">
            Navigation Menu
          </div>

          <ul className="flex flex-col gap-1.5">
            {NAV_STRUCTURE.map((item) => {
              const hasMega = Boolean(item.megaMenu);
              const isExpanded = expandedMobileCategory === item.label;

              return (
                <li key={item.label} className="border-b border-slate-200/60 pb-2">
                  <div className="flex items-center justify-between">
                    <Link
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-base sm:text-lg font-bold uppercase tracking-[0.12em] text-slate-800 hover:text-emerald-700 py-1.5 touch-manipulation"
                    >
                      {item.label}
                    </Link>

                    {hasMega && (
                      <button
                        onClick={() => setExpandedMobileCategory(isExpanded ? null : item.label)}
                        className="p-2.5 text-slate-500 hover:text-emerald-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label={`Expand ${item.label} submenu`}
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180 text-emerald-700" : ""}`} />
                      </button>
                    )}
                  </div>

                  {/* Sub-items accordion for Services */}
                  {hasMega && isExpanded && item.megaMenu && (
                    <div className="mt-2 pl-3 flex flex-col gap-2 border-l-2 border-emerald-500/40 my-2">
                      {item.megaMenu.items.map((sub, sIdx) => {
                        const SubIcon = sub.icon || Crown;
                        return (
                          <Link
                            key={sIdx}
                            to={sub.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/80 text-slate-800 hover:text-slate-900 active:bg-emerald-50/50"
                          >
                            <SubIcon className="w-4 h-4 text-emerald-700 shrink-0" />
                            <div className="text-xs min-w-0">
                              <div className="font-bold text-slate-900 truncate">{sub.title}</div>
                              <div className="text-[10px] text-slate-600 line-clamp-1">{sub.desc}</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Mobile Action Bar */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col gap-3 pb-safe">
          {roles.length > 0 ? (
            <Link
              to={getDashboardPath() as any}
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 font-mono text-xs font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2"
              style={mono}
            >
              <User className="w-4 h-4 text-emerald-700" />
              <span>{getDashboardLabel()}</span>
            </Link>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 font-mono text-xs font-bold uppercase tracking-[0.15em]"
              style={mono}
            >
              Sign In
            </Link>
          )}

          <Link
            to="/book"
            onClick={() => setMobileOpen(false)}
            className="w-full text-center py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-[0.2em] shadow-sm flex items-center justify-center gap-2"
            style={mono}
          >
            <span>BOOK NOW</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

