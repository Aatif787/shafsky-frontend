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
  Car,
  PhoneCall,
  ArrowRight,
  User,
  ShieldCheck,
} from "lucide-react";
import { useBranding } from "@/lib/branding/branding.context";
import { C, mono, display } from "@/components/home/theme";

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
 * SHAFSKY CATALOG-ALIGNED 5-SERVICE MEGA MENU NAVIGATION STRUCTURE
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
      eyebrow: "Services Ecosystem",
      description: "Explore our authoritative suite of airside hospitality, private aviation, and specialized mission logistics.",
      items: [
        {
          title: "Meet & Greet and Lounge",
          href: "/solutions/concierge",
          icon: Crown,
          desc: "Dedicated personal escort, aerobridge greeting, baggage porterage, priority clearance & premier lounge access.",
          tag: "Flagship Airside",
        },
        {
          title: "Private Aviation & Air Charter",
          href: "/charter",
          icon: Plane,
          desc: "Heavy jets, super midsize, and twin helicopter charters on demand with 2-hour rapid dispatch.",
          tag: "VIP Aviation",
        },
        {
          title: "Luxury Ground Transport",
          href: "/solutions/travel",
          icon: Car,
          desc: "Chauffeured Maybach, Mercedes S-Class, and direct tarmac sedan transfer to the aircraft.",
          tag: "Ground Luxury",
        },
        {
          title: "Transit Hotel & VIP Hospitality",
          href: "/solutions/travel",
          icon: Hotel,
          desc: "Palace estate bookings, 5-star transit hotel rooms, and private flight crew accommodations.",
          tag: "5-Star Stay",
        },
        {
          title: "Medical & Critical Evacuation",
          href: "/solutions/medical",
          icon: HeartPulse,
          desc: "ICU-equipped air ambulance, bedside-to-bedside transfer, and specialized wheelchair care.",
          tag: "Critical Care",
        },
        {
          title: "Secure Cargo & Express Courier",
          href: "/solutions/cargo",
          icon: Package,
          desc: "Airside secure courier, high-value art/diplomatic pouch handling, and urgent airfreight.",
          tag: "Secure Logistics",
        },
      ],
    },
  },
  {
    label: "Airports",
    href: "/airports",
  },
  {
    label: "Private Charter",
    href: "/charter",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

export function Navigation({ visible = true }: { visible?: boolean }) {
  const { branding } = useBranding();
  const location = useLocation();
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
          {/* Brand Logo & Emblem */}
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

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {NAV_STRUCTURE.map((item) => {
              const isMega = !!item.megaMenu;
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
                        ? "text-slate-950 bg-lime-100 border border-lime-300"
                        : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isMega && (
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-300 text-lime-700 ${
                          isHovered ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>

                  {/* Mega Menu Dropdown */}
                  {isMega && item.megaMenu && isHovered && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-[720px] rounded-2xl bg-white border-2 border-lime-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-6 backdrop-blur-2xl transition-all duration-300">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
                        <div>

                          <p className="text-xs text-slate-600 mt-1 max-w-md">
                            {item.megaMenu.description}
                          </p>
                        </div>
                        <Link
                          to="/solutions/concierge"
                          className="text-[11px] font-mono text-lime-700 hover:text-lime-800 flex items-center gap-1 uppercase tracking-wider group/view font-bold"
                          style={mono}
                        >
                          <span>Full Ecosystem</span>
                          <ArrowRight
                            size={12}
                            className="transition-transform group-hover/view:translate-x-1"
                          />
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {item.megaMenu.items.map((sub) => {
                          const SubIcon = sub.icon;
                          return (
                            <Link
                              key={sub.title}
                              to={sub.href}
                              className="group/item flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 hover:bg-lime-50/80 border border-slate-200 hover:border-lime-400 transition-all duration-200"
                            >
                              <div className="h-9 w-9 rounded-lg bg-lime-100 border border-lime-300 flex items-center justify-center text-lime-700 group-hover/item:bg-lime-500 group-hover/item:text-slate-950 transition-all shrink-0 mt-0.5">
                                <SubIcon size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-[13px] font-bold text-slate-900 group-hover/item:text-lime-800 transition-colors">
                                    {sub.title}
                                  </span>
                                  {sub.tag && (
                                    <span
                                      className="text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-lime-100 text-lime-800 border border-lime-300 font-bold"
                                      style={mono}
                                    >
                                      {sub.tag}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11.5px] text-slate-600 mt-1 leading-snug line-clamp-2">
                                  {sub.desc}
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

            <Link
              to="/book"
              className="group/btn relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-[#84cc16] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-md shadow-lime-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-lime-500/40 hover:-translate-y-0.5"
              style={mono}
            >
              <div className="absolute inset-0 w-[200%] -translate-x-[150%] bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
              <div className="absolute inset-0 bg-[#a3e635] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10">Book Now</span>
              <ArrowRight size={14} className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
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
              className="text-[10px] uppercase tracking-[0.3em] text-lime-700 font-bold pb-2 border-b border-slate-200"
              style={mono}
            >
              Navigation Menu
            </div>

            <div className="flex flex-col gap-2">
              {NAV_STRUCTURE.map((item) => {
                const isMega = !!item.megaMenu;
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
                            className={`text-lime-700 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isExpanded && item.megaMenu && (
                          <div className="pl-3 mt-2 space-y-2.5 border-l-2 border-lime-400">
                            {item.megaMenu.items.map((sub) => {
                              const SIcon = sub.icon;
                              return (
                                <Link
                                  key={sub.title}
                                  to={sub.href}
                                  className="flex items-center gap-2.5 py-1.5 text-sm font-medium text-slate-700 hover:text-lime-700"
                                >
                                  <SIcon size={16} className="text-lime-600" />
                                  <span>{sub.title}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        className="block py-2.5 text-base font-semibold text-slate-900 hover:text-lime-700"
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

            <Link
              to="/book"
              className="group/btn relative overflow-hidden w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#84cc16] text-slate-950 text-xs font-bold tracking-wider uppercase shadow-md shadow-lime-500/25 transition-all duration-300 hover:shadow-lg hover:shadow-lime-500/40 hover:-translate-y-0.5"
              style={mono}
            >
              <div className="absolute inset-0 w-[200%] -translate-x-[150%] bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
              <div className="absolute inset-0 bg-[#a3e635] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10">Book Now</span>
              <ArrowRight size={14} className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navigation;
