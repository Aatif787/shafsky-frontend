import React, { useEffect, useState, useContext, useRef } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { getSessionInfo } from "@/lib/session";
import { AuthContext } from "@/auth-system/AuthProvider";
import {
  Menu,
  X,
  ArrowRight,
  ArrowLeft,
  User,
  LogIn,
  ChevronDown,
} from "lucide-react";
import { useBranding } from "@/lib/branding/branding.context";
import { mono } from "@/components/home/theme";
import { motion, AnimatePresence } from "framer-motion";
import { ICICI_REVIEW_MODE } from "@/lib/config/reviewMode";
import { useWebsiteContacts } from "@/hooks/useWebsiteContacts";
import { CONTACT_DETAILS } from "@/lib/constants";
import {
  type ServiceMenuItem,
  PRIMARY_SERVICES,
  type OtherServiceDropdownItem,
  OTHER_SERVICES_ITEMS,
  type NavItem,
  NAV_ITEMS,
  checkSpecialServiceActive,
  NavigationMobileDrawer,
} from "./navigation/NavigationParts";

export {
  type ServiceMenuItem,
  PRIMARY_SERVICES,
  type OtherServiceDropdownItem,
  OTHER_SERVICES_ITEMS,
  type NavItem,
  NAV_ITEMS,
};

export function Navigation({ visible = true }: { visible?: boolean }) {
  const { branding } = useBranding();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [otherServicesOpen, setOtherServicesOpen] = useState(false);
  const [mobileOtherServicesOpen, setMobileOtherServicesOpen] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(64);

  const dropdownContainerRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const serviceItemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const closeTimeoutRef = useRef<number | null>(null);
  const lastTouchTimeRef = useRef<number>(0);
  const openedByHoverAtRef = useRef<number>(0);
  const isPointerDownRef = useRef<boolean>(false);

  const auth = useContext(AuthContext);
  const authUser = auth?.user;
  const authRole = auth?.profile?.role;
  const isLoggedIn = Boolean(authUser || auth?.profile || roles.length > 0);

  const { getContacts } = useWebsiteContacts();
  const contactNumbers = getContacts("contact");

  const activeNavItems = ICICI_REVIEW_MODE
    ? NAV_ITEMS.filter(
        (item) =>
          !["Transport", "Hotel", "Private Charter", "Cargo", "Ticketing", "Other Services"].includes(
            item.label
          )
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

  const isSpecialServiceActive = (serviceSub: string) =>
    checkSpecialServiceActive(
      location.pathname,
      (location.search || {}) as Record<string, unknown>,
      serviceSub
    );

  const clearCloseTimer = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleDesktopMouseEnter = () => {
    if (Date.now() - lastTouchTimeRef.current < 500) return;
    clearCloseTimer();
    if (!otherServicesOpen) {
      openedByHoverAtRef.current = Date.now();
      setOtherServicesOpen(true);
    }
  };

  const handleDesktopMouseLeave = () => {
    if (Date.now() - lastTouchTimeRef.current < 500) return;
    clearCloseTimer();
    closeTimeoutRef.current = window.setTimeout(() => {
      setOtherServicesOpen(false);
    }, 140);
  };

  const handleTriggerClick = () => {
    clearCloseTimer();
    if (otherServicesOpen && Date.now() - openedByHoverAtRef.current < 250) {
      setOtherServicesOpen(true);
    } else {
      setOtherServicesOpen((prev) => !prev);
    }
    isPointerDownRef.current = false;
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      clearCloseTimer();
      setOtherServicesOpen(true);
      window.requestAnimationFrame(() => {
        serviceItemRefs.current[0]?.focus();
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      clearCloseTimer();
      setOtherServicesOpen(true);
      window.requestAnimationFrame(() => {
        serviceItemRefs.current[OTHER_SERVICES_ITEMS.length - 1]?.focus();
      });
    } else if (e.key === "Escape") {
      if (otherServicesOpen) {
        e.preventDefault();
        clearCloseTimer();
        setOtherServicesOpen(false);
        triggerButtonRef.current?.focus();
      }
    }
  };

  const handleServiceItemKeyDown = (
    e: React.KeyboardEvent<HTMLAnchorElement>,
    idx: number
  ) => {
    const total = OTHER_SERVICES_ITEMS.length;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      serviceItemRefs.current[(idx + 1) % total]?.focus();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      serviceItemRefs.current[(idx - 1 + total) % total]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      serviceItemRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      serviceItemRefs.current[total - 1]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      clearCloseTimer();
      setOtherServicesOpen(false);
      triggerButtonRef.current?.focus();
    }
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

  // Close menus on route or search change
  useEffect(() => {
    setMobileOpen(false);
    setOtherServicesOpen(false);
    setMobileOtherServicesOpen(false);
  }, [location.pathname, location.search]);

  // Reset mobile nested dropdown when mobile drawer closes
  useEffect(() => {
    if (!mobileOpen) {
      setMobileOtherServicesOpen(false);
    }
  }, [mobileOpen]);

  // Close dropdown on Escape key or outside pointer down
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (otherServicesOpen) {
          clearCloseTimer();
          const wasInside =
            dropdownContainerRef.current &&
            document.activeElement &&
            dropdownContainerRef.current.contains(document.activeElement);
          setOtherServicesOpen(false);
          if (wasInside) {
            triggerButtonRef.current?.focus();
          }
        }
        if (mobileOtherServicesOpen) {
          setMobileOtherServicesOpen(false);
        }
      }
    };

    const handlePointerDownOutside = (e: MouseEvent | TouchEvent) => {
      if (
        otherServicesOpen &&
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(e.target as Node)
      ) {
        clearCloseTimer();
        setOtherServicesOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDownOutside);
    document.addEventListener("touchstart", handlePointerDownOutside, { passive: true });
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDownOutside);
      document.removeEventListener("touchstart", handlePointerDownOutside);
    };
  }, [otherServicesOpen, mobileOtherServicesOpen]);

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, []);

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
      <div className="mx-auto max-w-[1560px] px-3 sm:px-4 md:px-6 lg:px-2.5 xl:px-8 2xl:px-10">
        <div className="flex items-center justify-between gap-1 sm:gap-2 lg:gap-1.5 xl:gap-3 min-w-0">
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
                  className="h-9 sm:h-10 md:h-11 lg:h-9 xl:h-12 2xl:h-14 w-auto object-contain transition-transform duration-300 select-none"
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

          {/* Desktop Navigation Links (Direct individual links + Other Services dropdown) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 2xl:gap-2 shrink min-w-0">
            {activeNavItems.map((item) => {
              const isActive = isItemActive(item.href);

              if (item.label === "Other Services") {
                return (
                  <div
                    key={item.label}
                    ref={dropdownContainerRef}
                    className="relative"
                    onMouseEnter={handleDesktopMouseEnter}
                    onMouseLeave={handleDesktopMouseLeave}
                    onBlur={(e) => {
                      const nextFocused = e.relatedTarget as Node | null;
                      if (
                        nextFocused &&
                        !dropdownContainerRef.current?.contains(nextFocused)
                      ) {
                        clearCloseTimer();
                        setOtherServicesOpen(false);
                      }
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 450, damping: 25 }}
                    >
                      <button
                        ref={triggerButtonRef}
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={otherServicesOpen}
                        aria-controls="desktop-other-services-dropdown"
                        onTouchStart={() => {
                          lastTouchTimeRef.current = Date.now();
                          isPointerDownRef.current = true;
                        }}
                        onPointerDown={() => {
                          isPointerDownRef.current = true;
                        }}
                        onMouseDown={() => {
                          isPointerDownRef.current = true;
                        }}
                        onFocus={() => {
                          if (!isPointerDownRef.current) {
                            clearCloseTimer();
                            setOtherServicesOpen(true);
                          }
                        }}
                        onClick={handleTriggerClick}
                        onKeyDown={handleTriggerKeyDown}
                        className={`inline-flex items-center gap-0.5 xl:gap-1 px-1.5 lg:px-1.5 xl:px-2.5 2xl:px-3 py-1 lg:py-1 xl:py-1.5 rounded-full text-[11px] lg:text-[10.5px] xl:text-[12px] 2xl:text-[13px] font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                          isActive || otherServicesOpen
                            ? "apple-glass-nav-item-active"
                            : "apple-glass-nav-item"
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          size={12}
                          className={`shrink-0 transition-transform duration-200 ${
                            otherServicesOpen ? "rotate-180 text-lime-600" : " opacity-70"
                          }`}
                        />
                      </button>
                    </motion.div>

                    <AnimatePresence>
                      {otherServicesOpen && (
                        <motion.div
                          id="desktop-other-services-dropdown"
                          initial={{ opacity: 0, y: 6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.98 }}
                          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute left-1/2 -translate-x-1/2 top-full pt-2.5 z-50 w-[min(560px,calc(100vw-2rem))]"
                        >
                          <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_24px_60px_-12px_rgba(15,23,42,0.18),0_8px_20px_-6px_rgba(15,23,42,0.08)] p-4 xl:p-5">
                            <div className="text-center mb-3.5">
                              <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-[0.28em] text-lime-700 bg-lime-50 px-3.5 py-1 rounded-full border border-lime-200">
                                SELECT YOUR SPECIAL SERVICE
                              </span>
                            </div>

                            <div
                              role="menu"
                              aria-label="Other Services"
                              className="flex flex-wrap items-center justify-center gap-2 xl:gap-2.5"
                            >
                              {OTHER_SERVICES_ITEMS.map((service, idx) => {
                                const ServiceIcon = service.icon;
                                const isServiceActive = isSpecialServiceActive(service.sub);

                                return (
                                  <Link
                                    key={service.label}
                                    ref={(el) => {
                                      serviceItemRefs.current[idx] = el;
                                    }}
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
                                    role="menuitem"
                                    onClick={() => {
                                      clearCloseTimer();
                                      setOtherServicesOpen(false);
                                      setMobileOtherServicesOpen(false);
                                      setMobileOpen(false);
                                    }}
                                    onKeyDown={(e) => handleServiceItemKeyDown(e, idx)}
                                    className={`group/pill inline-flex items-center gap-2 px-3.5 xl:px-4 py-2 rounded-full text-[11px] xl:text-xs font-bold font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                                      isServiceActive
                                        ? "bg-lime-500 text-slate-950 shadow-md ring-2 ring-lime-400 border border-lime-600 scale-[1.02]"
                                        : "bg-white text-slate-700 border border-slate-200 hover:bg-lime-500 hover:text-slate-950 hover:border-lime-600 hover:shadow-md hover:ring-2 hover:ring-lime-400 focus-visible:bg-lime-500 focus-visible:text-slate-950 focus-visible:border-lime-600 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none"
                                    }`}
                                  >
                                    <ServiceIcon
                                      size={13}
                                      className={`shrink-0 transition-colors duration-200 ${
                                        isServiceActive
                                          ? "text-slate-950"
                                          : "text-lime-600 group-hover/pill:text-slate-950 group-focus-visible/pill:text-slate-950"
                                      }`}
                                    />
                                    <span>{service.label}</span>
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
                <motion.div
                  key={item.label}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                >
                  <Link
                    to={item.href}
                    className={`inline-flex items-center px-1.5 lg:px-1.5 xl:px-2.5 2xl:px-3 py-1 lg:py-1 xl:py-1.5 rounded-full text-[11px] lg:text-[10.5px] xl:text-[12px] 2xl:text-[13px] font-semibold transition-all duration-200 whitespace-nowrap ${
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
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-1.5 lg:gap-1 xl:gap-2 2xl:gap-2.5 shrink-0">
            {/* 24x7 WhatsApp Booking Link (Desktop & Tablet Pill) */}
            <a
              href={CONTACT_DETAILS.WHATSAPP_BOOKING_LINK}
              target="_blank"
              rel="noopener noreferrer"
              title={`24/7 WhatsApp Booking (${CONTACT_DETAILS.WHATSAPP_BOOKING})`}
              aria-label={`24/7 WhatsApp Booking (${CONTACT_DETAILS.WHATSAPP_BOOKING})`}
              className="apple-glass-pill hidden md:inline-flex items-center gap-1 xl:gap-1.5 px-2 lg:px-1.5 xl:px-3 py-1 lg:py-1 xl:py-1.5 rounded-full text-[10.5px] xl:text-xs text-slate-800 hover:text-emerald-700 hover:border-emerald-300 transition-all cursor-pointer whitespace-nowrap group/wa shrink-0"
              style={mono}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <svg
                className="h-3 w-3 xl:h-3.5 xl:w-3.5 fill-emerald-600 shrink-0 transition-transform group-hover/wa:scale-110"
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
                className="apple-glass-pill inline-flex items-center gap-1 sm:gap-1.5 px-2 lg:px-1.5 xl:px-3 py-1 lg:py-1 xl:py-1.5 rounded-full text-[10.5px] xl:text-xs font-semibold text-slate-900 cursor-pointer whitespace-nowrap shrink-0"
                style={mono}
              >
                <User size={13} className="text-lime-700 shrink-0" />
                <span className="hidden sm:inline">{getDashboardLabel()}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="apple-glass-pill inline-flex items-center gap-1 sm:gap-1.5 text-[10.5px] xl:text-xs font-semibold text-slate-800 hover:text-slate-950 px-2 lg:px-1.5 xl:px-3 py-1 lg:py-1 xl:py-1.5 rounded-full cursor-pointer whitespace-nowrap shrink-0"
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
              className="group/btn relative overflow-hidden inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-gradient-to-r from-lime-500 to-lime-400 px-2.5 lg:px-2.5 xl:px-4 py-1.5 text-[10.5px] xl:text-xs font-bold uppercase tracking-wider text-slate-950 shadow-[0_4px_16px_rgba(132,204,22,0.35),inset_0_1px_0_0_rgba(255,255,255,0.6)] hover:shadow-[0_6px_22px_rgba(132,204,22,0.5),inset_0_1px_0_0_rgba(255,255,255,0.8)] border border-lime-300/60 transition-all duration-300 cursor-pointer whitespace-nowrap shrink-0"
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

      {/* Mobile Drawer (Direct responsive links + Other Services collapsible dropdown) */}
      <NavigationMobileDrawer
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        mobileOtherServicesOpen={mobileOtherServicesOpen}
        setMobileOtherServicesOpen={setMobileOtherServicesOpen}
        headerHeight={headerHeight}
        activeNavItems={activeNavItems}
        isItemActive={isItemActive}
        isSpecialServiceActive={isSpecialServiceActive}
        isLoggedIn={isLoggedIn}
        getDashboardPath={getDashboardPath}
        getDashboardLabel={getDashboardLabel}
        contactNumbers={contactNumbers}
      />
    </header>
  );
}

export default Navigation;
