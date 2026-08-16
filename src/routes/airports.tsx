import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Star,
  MapPin,
  Map,
  Phone,
  Globe,
  Shield,
  Headphones,
  Zap,
  ChevronRight,
  ChevronLeft,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { AIRPORTS, type Airport } from "@/data/airports";
import { AIRPORT_REGISTRY } from "@/data/airportRegistry";
import { getAirportAsset } from "@/lib/airport-assets";
import { PageJourneyWrapper } from "@/components/site/PageJourneyWrapper";

export const Route = createFileRoute("/airports")({
  head: () => ({
    meta: [
      { title: "Airports Around the World — Shafsky Aviation" },
      {
        name: "description",
        content: "Explore our global network of major airports and book premium concierge services.",
      },
    ],
    links: [{ rel: "canonical", href: "https://aero-launch-sequence.lovable.app/airports" }],
  }),
  component: AirportsIndexPage,
});

// Canonical dynamic airport listing derived from canonical datasets
const GLOBAL_AIRPORTS_DATA: Array<{
  code: string;
  city: string;
  country: string;
  stateCountry: string;
  servicesCount: number;
  featured?: boolean;
  cover?: string;
}> = AIRPORTS.map((a) => {
  const reg = AIRPORT_REGISTRY[a.code];
  return {
    code: a.code,
    city: a.city,
    country: a.country,
    stateCountry: `${a.city}, ${a.country}`,
    servicesCount: reg?.availableServiceIds?.length || 4,
    featured: reg?.featured || ["DEL", "BOM", "HYD", "BLR", "AMD", "MAA"].includes(a.code),
    cover: a.cover,
  };
});

const ALPHABET = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

function AirportsIndexPage() {
  const location = useLocation();

  if (location.pathname !== "/airports" && location.pathname !== "/airports/") {
    return <Outlet />;
  }

  return <AirportsListingView />;
}

function AirportsListingView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [selectedService, setSelectedService] = useState("All Services");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState("All");
  const [sortOption, setSortOption] = useState("A - Z");
  const [displayCount, setDisplayCount] = useState(20);

  // Featured Arc Carousel Index
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Filtered dataset
  const filteredAirports = useMemo(() => {
    return GLOBAL_AIRPORTS_DATA.filter((item) => {
      // Search text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          item.city.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          item.country.toLowerCase().includes(q) ||
          item.stateCountry.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Featured toggle
      if (featuredOnly && !item.featured) return false;

      // Country filter
      if (selectedCountry !== "All Countries") {
        if (selectedCountry === "India" && item.country !== "India") return false;
        if (selectedCountry === "International" && item.country === "India") return false;
      }

      // Alphabet filter
      if (selectedLetter !== "All") {
        if (!item.city.toUpperCase().startsWith(selectedLetter)) return false;
      }

      return true;
    });
  }, [searchQuery, featuredOnly, selectedCountry, selectedLetter]);

  // Featured list of airports
  const featuredList = useMemo(() => {
    return GLOBAL_AIRPORTS_DATA.filter((a) => a.featured);
  }, []);

  // 6 visible items sliced dynamically based on featuredIndex for a single 6-column row
  const visibleFeatured = useMemo(() => {
    if (featuredList.length <= 6) return featuredList;
    const list: typeof featuredList = [];
    for (let i = 0; i < 6; i++) {
      const idx = (featuredIndex + i) % featuredList.length;
      list.push(featuredList[idx]);
    }
    return list;
  }, [featuredList, featuredIndex]);

  return (
    <PageJourneyWrapper category="Coverage" categoryHref="/airports" className="bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-12">
        {/* 1. HEADER TITLE SECTION */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <span>✈</span>
            <span className="font-semibold uppercase tracking-wider text-[11px]">GLOBAL AIRPORT NETWORK</span>
            <span>✈</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading text-slate-900 font-bold tracking-tight">
            Airports Around the World
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-sans">
            Explore our global network of major airports and book premium services
          </p>
        </div>

        {/* 2. SEARCH & FILTER CONTROLS BAR (PILL BUTTONS) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-3xl sm:rounded-full border border-slate-200 shadow-sm">
          {/* Search Pill Input */}
          <div className="relative flex-1 min-w-[240px] sm:min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search airport by name, city or code..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none border border-transparent focus:border-[#7c3aed]/30 focus:bg-white transition-all"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Country Select */}
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-slate-300 outline-none cursor-pointer"
              >
                <option value="All Countries">🌐 All Countries</option>
                <option value="India">🇮🇳 India</option>
                <option value="International">🌐 International</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>



            {/* Featured Only Toggle Switch */}
            <label className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer hover:border-slate-300">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Featured Only</span>
              <button
                type="button"
                onClick={() => setFeaturedOnly(!featuredOnly)}
                className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${featuredOnly ? "bg-[#7c3aed]" : "bg-slate-300"
                  }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${featuredOnly ? "translate-x-4" : "translate-x-0"
                    }`}
                />
              </button>
            </label>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none pl-8 pr-8 py-2 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-slate-300 outline-none cursor-pointer"
              >
                <option value="A - Z">⇅ A - Z</option>
                <option value="Z - A">⇅ Z - A</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 3. FEATURED AIRPORTS CURVED ARC SECTION */}
        <div className="relative bg-gradient-to-b from-white/70 to-white/95 rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Star className="w-4 h-4 text-purple-600 fill-purple-600" />
              <span>Featured Airports</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Top airports with premium services</p>
          </div>

          {/* CURVED ARC STAGE */}
          <div className="relative max-w-5xl mx-auto py-2 px-2 sm:px-6">
            {/* SVG Curved Line */}
            <svg
              className="absolute left-0 right-0 top-12 w-full h-16 pointer-events-none hidden sm:block"
              viewBox="0 0 800 60"
              fill="none"
            >
              <path
                d="M 60 42 Q 400 6 740 42"
                stroke="#84cc16"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="opacity-70"
              />
            </svg>

            {/* Navigation Buttons Aligned to Center Axis */}
            <button
              onClick={() => setFeaturedIndex((prev) => (prev > 0 ? prev - 1 : featuredList.length - 1))}
              aria-label="Previous featured airport"
              className="absolute -left-2 sm:left-0 top-10 sm:top-12 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-md hover:border-[#7c3aed] hover:text-[#7c3aed] hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFeaturedIndex((prev) => (prev < featuredList.length - 1 ? prev + 1 : 0))}
              aria-label="Next featured airport"
              className="absolute -right-2 sm:right-0 top-10 sm:top-12 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-md hover:border-[#7c3aed] hover:text-[#7c3aed] hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* 6 Circular Nodes Single Row Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 relative z-10 px-4 sm:px-8">
              {visibleFeatured.map((item, idx) => {
                const img = getAirportAsset(item.code, "hero-mobile.webp") || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80";

                // Curve Y offset matching the arc
                const yOffset = idx === 0 || idx === 5 ? "sm:translate-y-4" : idx === 1 || idx === 4 ? "sm:translate-y-1" : "sm:translate-y-0";

                return (
                  <Link
                    key={`${item.code}-${idx}`}
                    to="/airports/$code"
                    params={{ code: item.code }}
                    className={`flex flex-col items-center text-center group cursor-pointer w-full transition-transform duration-300 ${yOffset}`}
                  >
                    {/* Circle Image Thumbnail with Code Badge */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:border-[#7c3aed] group-hover:scale-105 group-hover:shadow-lg transition-all duration-300 shrink-0 bg-slate-100">
                      <img src={img} alt={item.city} className="w-full h-full object-cover" />
                      <span className="absolute top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#7c3aed] text-white text-[9px] font-mono font-bold shadow-xs">
                        {item.code}
                      </span>
                    </div>

                    {/* Node Text Below with Strict Pixel-Perfect Height Baselines */}
                    <div className="mt-3 flex flex-col items-center justify-between w-full min-h-[92px]">
                      {/* City Name Container */}
                      <div className="h-9 flex items-center justify-center px-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight group-hover:text-[#7c3aed] transition-colors line-clamp-2">
                          {item.city}
                        </h4>
                      </div>

                      {/* Country Name Container */}
                      <div className="h-7 flex items-center justify-center px-1">
                        <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight line-clamp-2">
                          {item.country}
                        </p>
                      </div>

                      {/* Services Count Badge */}
                      <div className="h-5 flex items-center justify-center">
                        <p className="text-[10px] font-bold text-emerald-600 tracking-wide">
                          {item.servicesCount} Services
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. "ALL AIRPORTS" SECTION HEADER & ALPHABET FILTER BAR */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-[#7c3aed] flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">All Airports</h3>
                <p className="text-xs text-slate-500">Browse all 200+ airports in our global network</p>
              </div>
            </div>

            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-purple-200 text-xs font-semibold text-[#7c3aed] hover:bg-purple-50 transition cursor-pointer self-start sm:self-auto">
              <Map className="w-3.5 h-3.5" />
              <span>View on Map</span>
            </button>
          </div>

          {/* ALPHABET FILTER PILLS ROW */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
            {ALPHABET.map((letter) => {
              const isSelected = selectedLetter === letter;
              return (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer shrink-0 ${isSelected
                      ? "bg-[#7c3aed] text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. ALL AIRPORTS COMPACT CARDS GRID (MATCHING REFERENCE IMAGE) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredAirports.slice(0, displayCount).map((item) => {
            const img = getAirportAsset(item.code, "hero-mobile.webp") || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80";

            return (
              <Link
                key={item.code}
                to="/airports/$code"
                params={{ code: item.code }}
                className="group flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
              >
                {/* Left Avatar Thumbnail */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-slate-100 bg-slate-100">
                    <img src={img} alt={item.city} className="w-full h-full object-cover" />
                    <span className="absolute top-0 left-0 px-1 rounded-full bg-[#7c3aed] text-white text-[8px] font-mono font-bold">
                      {item.code}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-[#7c3aed] transition-colors">
                      {item.city}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate">{item.stateCountry}</p>
                  </div>
                </div>

                {/* Right Services & Arrow */}
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-[10px] font-bold text-emerald-600">{item.servicesCount} Services</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#7c3aed] group-hover:translate-x-0.5 transition" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* LOAD MORE AIRPORTS BUTTON */}
        {filteredAirports.length > displayCount && (
          <div className="text-center pt-4">
            <button
              onClick={() => setDisplayCount((prev) => prev + 12)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-xs transition cursor-pointer"
            >
              <span>Load More Airports</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        )}

        {/* 6. "CAN'T FIND YOUR AIRPORT?" BANNER */}
        <div className="rounded-3xl bg-emerald-50/70 border border-emerald-200/80 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Can't find your airport?</h4>
              <p className="text-xs text-slate-600">We cover 200+ airports worldwide. Contact our team for any assistance.</p>
            </div>
          </div>

          <Link
            to="/book"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-emerald-300 text-emerald-800 font-semibold text-xs hover:bg-emerald-100 transition shadow-xs shrink-0"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-700" />
            <span>Contact Us</span>
          </Link>
        </div>

        {/* 7. FOOTER FEATURE BADGES BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900">200+ Airports</h5>
              <p className="text-[10px] text-slate-500">Worldwide Coverage</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900">Premium Services</h5>
              <p className="text-[10px] text-slate-500">Quality Assured</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900">24/7 Support</h5>
              <p className="text-[10px] text-slate-500">Always Available</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900">Instant Booking</h5>
              <p className="text-[10px] text-slate-500">Quick & Easy</p>
            </div>
          </div>
        </div>
      </div>
    </PageJourneyWrapper>
  );
}
