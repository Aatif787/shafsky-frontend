import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Check,
  Crown,
  Users,
  Car,
  Plane,
  Package,
  HeartPulse,
  Compass,
  Clock,
  Award,
  Ticket,
  Hotel,
  ShieldCheck,
  Search,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  useServiceCatalog,
  OFFICIAL_SHAFSKY_CATEGORIES,
  ServiceCategoryId,
  ServiceCatalogItem,
} from "@/services/catalog";

interface EnterpriseServicesPlatformProps {
  initialCategoryId?: ServiceCategoryId;
  className?: string;
}

export const EnterpriseServicesPlatform: React.FC<EnterpriseServicesPlatformProps> = ({
  initialCategoryId = "all",
  className = "",
}) => {
  const { data: services = [], isLoading } = useServiceCatalog();
  const [activeCategory, setActiveCategory] = useState<ServiceCategoryId>(initialCategoryId);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("gold");

  // Active categories from catalog (sorted by sortOrder)
  const categories = useMemo(() => {
    return OFFICIAL_SHAFSKY_CATEGORIES.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  }, []);

  // Filtered active services by category and search query
  const filteredServices = useMemo(() => {
    return services
      .filter((s) => s.isActive && !s.isHidden)
      .filter((s) => {
        const matchesCat = activeCategory === "all" || s.categoryId === activeCategory;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.oneLiner.toLowerCase().includes(q) ||
          s.categoryName.toLowerCase().includes(q) ||
          s.overview.toLowerCase().includes(q);

        return matchesCat && matchesSearch;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [services, activeCategory, searchQuery]);

  // Currently selected active service
  const activeService = useMemo(() => {
    const found = filteredServices.find((s) => s.id === selectedServiceId);
    return found || filteredServices[0] || services[0];
  }, [filteredServices, selectedServiceId, services]);

  // Booking action handler: passes service details to existing booking engine
  const handleBookThisService = useCallback((service: ServiceCatalogItem) => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("shafsky_selected_service", service.bookingServiceId);
        sessionStorage.setItem("shafsky_selected_service_name", service.name);
        sessionStorage.setItem("shafsky_selected_category", service.categoryId);
      }

      toast.success(`${service.name} selected`, {
        description: "Pre-configured into booking engine. Complete your flight details to proceed.",
      });

      const bookEl = document.getElementById("book");
      if (bookEl) {
        bookEl.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.hash = "book";
      }
    } catch {
      window.location.hash = "book";
    }
  }, []);

  if (!activeService) return null;

  return (
    <section
      id="services"
      className={`relative px-4 py-16 sm:px-6 md:px-14 md:py-28 bg-[#faf9f5] text-slate-900 overflow-hidden ${className}`}
    >
      {/* Soft Ambient Glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-amber-100/60 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-stone-200/50 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-[1480px]">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/70 border border-amber-300/60 text-amber-900 text-[10px] font-mono uppercase tracking-[0.35em] font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>OFFICIAL SHAFSKY AVIATION SERVICES</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-slate-900 tracking-tight">
              Signature Airport & <span className="text-amber-700">Flight Services.</span>
            </h2>

            <p className="mt-3 text-xs sm:text-sm text-slate-600 font-sans max-w-xl font-medium leading-relaxed">
              Explore official Shafsky Aviation services across 6 business areas — understandable in 1 second, pre-configured, and bookable instantly.
            </p>
          </div>

          {/* Instant Search Bar */}
          <div className="relative w-full md:w-80">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search services (e.g. Lounge, Ticket, Transfer)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 rounded-2xl border border-[#e7e0d3] bg-white/90 backdrop-blur-md pl-11 pr-4 text-xs font-semibold placeholder:text-slate-400 outline-none transition focus:border-amber-600 focus:ring-4 focus:ring-amber-100 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-xs font-mono font-bold text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── 1. UNIFIED HORIZONTAL SELECTOR (Scrollable/Swipeable) ── */}
        <div className="space-y-4 mb-12">
          {/* Category Bar */}
          <div className="w-full overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center gap-2 min-w-max px-1 justify-start md:justify-center">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                const Icon = cat.icon;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id);
                      const catServices = cat.id === "all" ? services : services.filter((s) => s.categoryId === cat.id);
                      if (catServices.length > 0) {
                        setSelectedServiceId(catServices[0].id);
                      }
                    }}
                    className={`relative inline-flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all outline-none cursor-pointer ${
                      isActive
                        ? "text-white shadow-md shadow-amber-700/20"
                        : "text-slate-700 bg-white/80 hover:bg-white border border-[#e7e0d3] hover:text-slate-900"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryTabPill"
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    <Icon className={`h-4 w-4 relative z-10 ${isActive ? "text-white" : "text-amber-700"}`} />
                    <span className="relative z-10">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-Services Pill Selector */}
          <div className="w-full overflow-x-auto no-scrollbar py-1 border-t border-amber-200/50 pt-4">
            <div className="flex items-center gap-2 min-w-max px-1 justify-start md:justify-center">
              {filteredServices.map((service) => {
                const isSelected = activeService.id === service.id;
                const SIcon = service.icon || Users;

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedServiceId(service.id)}
                    className={`relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all outline-none cursor-pointer ${
                      isSelected
                        ? "text-amber-950 bg-amber-100 border border-amber-300 font-bold shadow-xs"
                        : "text-slate-600 bg-white/60 hover:bg-white border border-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeServiceTabPill"
                        className="absolute inset-0 rounded-xl bg-amber-200/60 border border-amber-400/80"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    <SIcon className={`h-3.5 w-3.5 relative z-10 ${isSelected ? "text-amber-800" : "text-slate-500"}`} />
                    <span className="relative z-10">{service.name}</span>

                    {service.badge && (
                      <span className="relative z-10 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-600/15 text-amber-900">
                        {service.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 2. SINGLE REUSABLE SERVICE SHOWCASE CONTAINER ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeService.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative rounded-[36px] border border-white/90 bg-gradient-to-br from-white/95 via-white/70 to-amber-50/40 shadow-[inset_0_1px_3px_0_rgba(255,255,255,1),0_25px_60px_-15px_rgba(217,119,6,0.12)] p-6 sm:p-10 lg:p-12 backdrop-blur-2xl overflow-hidden"
          >
            {/* Specular Ambient Glow */}
            <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-white/90 via-white/40 to-transparent blur-2xl pointer-events-none opacity-80" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-gradient-to-tl from-amber-300/30 via-white/20 to-transparent blur-2xl pointer-events-none opacity-60" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Media Showcase */}
              <div className="lg:col-span-5 relative h-72 sm:h-96 rounded-3xl overflow-hidden group shadow-xl border border-white/90 bg-slate-900">
                {activeService.videoUrl ? (
                  <video
                    src={activeService.videoUrl}
                    poster={activeService.imageUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={activeService.imageUrl}
                    alt={activeService.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/20 to-transparent" />

                <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest text-amber-300 border border-amber-400/40">
                  {activeService.badge || "Official Shafsky Service"}
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-2xl font-bold font-heading text-white">
                    {activeService.name}
                  </div>
                  <div className="text-xs text-amber-100 mt-1 font-sans line-clamp-2 font-medium">
                    {activeService.oneLiner}
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-[10px] font-mono text-white/80">
                    <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20">
                      {activeService.estTime}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold">
                      {activeService.startingPrice}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Detail Showcase */}
              <div className="lg:col-span-7 flex flex-col justify-between h-full gap-6">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-amber-800 font-bold mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{activeService.categoryName} Protocol</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-slate-900 leading-tight">
                    {activeService.name}
                  </h3>

                  <p className="mt-3 text-xs sm:text-sm text-slate-600 font-sans leading-relaxed font-medium">
                    {activeService.overview}
                  </p>
                </div>

                {/* Key Benefits Grid */}
                <div>
                  <div className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider mb-3">
                    Included Features & Benefits
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeService.includedFeatures.map((feat, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs flex items-start gap-3 hover:border-amber-300 transition-colors"
                      >
                        <div className="h-6 w-6 rounded-lg bg-amber-100/80 border border-amber-300/60 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs text-slate-700 font-medium font-sans leading-snug">
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Audience Banner */}
                {activeService.whoIsThisFor && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 font-sans flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
                    <div>
                      <strong className="font-bold">Recommended For: </strong>
                      <span>{activeService.whoIsThisFor}</span>
                    </div>
                  </div>
                )}

                {/* Action CTA Bar */}
                <div className="pt-4 border-t border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-600 font-sans font-medium text-center sm:text-left">
                    <span className="font-mono text-amber-800 font-bold">{activeService.startingPrice}</span> • Direct booking dispatch
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleBookThisService(activeService)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 px-7 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-lg shadow-amber-700/20 transition-all duration-300 active:scale-98 cursor-pointer"
                    >
                      <span>BOOK THIS SERVICE</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <Link
                      to="/airports"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 px-5 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition cursor-pointer shrink-0"
                    >
                      <span>AIRPORTS</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
