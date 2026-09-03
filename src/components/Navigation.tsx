import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
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
  Car,
  PhoneCall,
  ArrowRight,
  ArrowLeft,
  User,
  ShieldCheck,
} from "lucide-react";
import { useBranding } from "@/lib/branding/branding.context";
import { C, mono, display } from "@/components/home/theme";

interface ServiceMenuItem {
  title: string;
  href: string;
  descriptor: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const PRIMARY_SERVICES: ServiceMenuItem[] = [
  {
    title: "Meet & Greet and Lounge Service",
    href: "/solutions/concierge",
    descriptor: "Airport assistance • Domestic • International • Transit",
    icon: Crown,
  },
  {
    title: "Air Charter",
    href: "/solutions/aviation",
    descriptor: "Private • Corporate • Helicopter • Charter services",
    icon: Plane,
  },
  {
    title: "Transport Service",
    href: "/solutions/cargo",
    descriptor: "Luxury • MUV / Large • Standard",
    icon: Car,
  },
  {
    title: "Luxury Hotels",
    href: "/solutions/travel",
    descriptor: "7 Star • 5 Star • 3 Star",
    icon: Hotel,
  },
  {
    title: "Special Services",
    href: "/solutions/medical",
    descriptor: "Tours • Passport & VISA • PSO • Sightseeing • Infant Care • HUM",
    icon: ShieldCheck,
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
    label: "Air Charter",
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

  const getDashboardPath = (): any => {
    if (roles.includes("super_admin")) return "/super-admin/dashboard";
    if (roles.includes("staff")) return "/staff/dashboard";
    if (roles.includes("admin")) return "/admin/dashboard";
    return "/account";
  };

  const getDashboardLabel = () => {
    if (roles.includes("super_admin")) return "Super Admin";
    if (roles.includes("staff")) return "Operations";
    if (roles.includes("admin")) return "Admin Portal";
    return "VIP Account";
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
      <div className="mx-auto max-w-[1480px] px-4 sm:px-8 md:px-14">
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

            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-lime-50 border-2 border-lime-500/40 p-1 shadow-sm group-hover:border-lime-500 transition-all duration-300">
                <img
                  src={branding.logo_url || "/logo.png"}
                  alt="Shafsky Aviation Services"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span
                  className="text-[17px] sm:text-[19px] font-bold tracking-tight text-slate-900 group-hover:text-lime-600 transition-colors"
                  style={display}
                >
                  SHAFSKY
                </span>
                <span
                  className="text-[8.5px] uppercase tracking-[0.35em] text-lime-700 font-mono -mt-1 font-bold"
                  style={mono}
                >
                  Aviation Services
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {NAV_STRUCTURE.map((item) => {
              const isMega = !!item.isMega;
              const isHovered = hoveredCategory === item.label;
              const isActive =
                item.href === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.href);

              return (
                <div
                  key={item.label}
                  className="relative py-2"
                  onMouseEnter={() => isMega && setHoveredCategory(item.label)}
                  onMouseLeave={() => isMega && setHoveredCategory(null)}
                >
                  <Link
                    to={item.href}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 ${
                      isActive
                        ? "text-slate-950 bg-slate-100 border border-slate-300"
                        : "text-slate-700 hover:text-slate-950 hover:bg-slate-50"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isMega && (
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 text-[#0a196f] ${
                          isHovered ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>

                  {/* Enterprise Services Mega Menu Dropdown */}
                  {isMega && isHovered && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-[clamp(560px,46vw,660px)] rounded-2xl bg-white border border-[#0a196f]/15 shadow-[0_16px_40px_rgba(10,25,111,0.08)] p-[clamp(12px,1.2vw,18px)] transition-all duration-200 z-50">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3 px-1">
                        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#c5a059] font-bold">
                          Shafsky Enterprise Services
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-medium">
                          5 Core Portfolios
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[clamp(6px,0.7vw,10px)]">
                        {PRIMARY_SERVICES.map((srv) => {
                          const SrvIcon = srv.icon;
                          return (
                            <Link
                              key={srv.title}
                              to={srv.href}
                              className="group/item flex items-start gap-3 p-[clamp(8px,0.8vw,12px)] rounded-xl bg-slate-50/60 hover:bg-[#faf9f5] border border-slate-200/70 hover:border-[#c5a059]/60 transition-all duration-200"
                            >
                              <div className="h-8 w-8 rounded-lg bg-[#0a196f]/5 border border-[#0a196f]/10 flex items-center justify-center text-[#0a196f] group-hover/item:bg-[#0a196f] group-hover/item:text-[#c5a059] transition-colors shrink-0 mt-0.5">
                                <SrvIcon size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[clamp(12px,0.95vw,13.5px)] font-bold text-slate-900 group-hover/item:text-[#0a196f] transition-colors leading-tight">
                                    {srv.title}
                                  </span>
                                  <ArrowRight
                                    size={12}
                                    className="text-slate-300 group-hover/item:text-[#c5a059] group-hover/item:translate-x-0.5 transition-all shrink-0 opacity-0 group-hover/item:opacity-100"
                                  />
                                </div>
                                <p className="text-[clamp(10px,0.8vw,11px)] text-slate-500 font-mono mt-1 leading-snug group-hover/item:text-slate-700">
                                  {srv.descriptor}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
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

            {roles.length > 0 ? (
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
                className="text-xs font-semibold text-slate-700 hover:text-slate-950 px-2 py-1 transition-colors"
                style={mono}
              >
                VIP Portal
              </Link>
            )}

            <a
              href="/#book"
              onClick={(e) => {
                const el = document.getElementById("book");
                if (el) {
                  e.preventDefault();
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
              className="group/btn relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-[#84cc16] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-md shadow-lime-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-lime-500/40 hover:-translate-y-0.5 cursor-pointer"
              style={mono}
            >
              <div className="absolute inset-0 w-[200%] -translate-x-[150%] bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
              <div className="absolute inset-0 bg-[#a3e635] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10">Book Now</span>
              <ArrowRight size={14} className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-100 border border-slate-300 text-slate-900 hover:border-lime-500 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Full-Screen Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-x-0 top-full h-[calc(100vh-70px)] bg-white border-t border-slate-200 p-6 flex flex-col justify-between overflow-y-auto z-50 shadow-xl">
          <div className="space-y-4">
            <div
              className="text-[10px] uppercase tracking-[0.3em] text-[#c5a059] font-bold pb-2 border-b border-slate-200"
              style={mono}
            >
              Navigation Menu
            </div>

            <div className="flex flex-col gap-2">
              {NAV_STRUCTURE.map((item) => {
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
                            className={`text-[#0a196f] transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isExpanded && (
                          <div className="pl-3 mt-2 space-y-2 border-l-2 border-[#c5a059]/60">
                            {PRIMARY_SERVICES.map((srv) => {
                              const SIcon = srv.icon;
                              return (
                                <Link
                                  key={srv.title}
                                  to={srv.href}
                                  onClick={() => setMobileOpen(false)}
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
            <a
              href="tel:+919599087959"
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-lime-50 border border-lime-300 text-xs font-bold text-slate-900 tracking-wider uppercase"
              style={mono}
            >
              <PhoneCall size={14} className="text-lime-600" />
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
              className="group/btn relative overflow-hidden w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#84cc16] text-slate-950 text-xs font-bold tracking-wider uppercase shadow-md shadow-lime-500/25 transition-all duration-300 hover:shadow-lg hover:shadow-lime-500/40 hover:-translate-y-0.5 cursor-pointer"
              style={mono}
            >
              <div className="absolute inset-0 w-[200%] -translate-x-[150%] bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
              <div className="absolute inset-0 bg-[#a3e635] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10">Book Now</span>
              <ArrowRight size={14} className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navigation;
