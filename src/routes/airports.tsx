import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
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
  ChevronLeft
} from "lucide-react";
import { airportApi, type AirportInfo } from "@/lib/api/airportApi";
import { AIRPORTS } from "@/data/airports";
import { AIRPORT_REGISTRY } from "@/data/airportRegistry";
import { getAirportPrimaryImage } from "@/lib/airport-assets";
import { PageJourneyWrapper } from "@/components/site/PageJourneyWrapper";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { ICICI_REVIEW_MODE } from "@/lib/config/reviewMode";

export const Route = createFileRoute("/airports")({
  head: () =>
    pageHead({
      title: "Airport Meet & Greet Coverage Across India | Shafsky Aviation",
      description: ICICI_REVIEW_MODE
        ? "Book VIP Meet & Greet, airside escort, and VIP lounge access at 20+ Indian airports including Delhi, Mumbai, Bengaluru, Hyderabad, Goa, and Jaipur."
        : "Book VIP Meet & Greet, airside escort, lounge access, and luxury transfers at 20+ Indian airports including Delhi, Mumbai, Bengaluru, Hyderabad, Goa, and Jaipur.",
      path: "/airports",
      keywords: [
        "airport meet and greet India",
        "VIP airport concierge",
        "Delhi airport meet and greet",
        "Mumbai airport assistance",
      ],
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Airports", path: "/airports" },
        ]),
      ],
    }),
  component: AirportsIndexPage,
});

export interface AirportListingItem {
  code: string;
  name: string;
  city: string;
  country: string;
  stateCountry: string;
  servicesCount: number;
  featured: boolean;
  cover?: string;
}

// Canonical database-backed airports initialized from Shafsky's 20 operating hubs
const INITIAL_DATABASE_AIRPORTS: AirportListingItem[] = AIRPORTS.map((a) => {
  const reg = AIRPORT_REGISTRY[a.code];
  return {
    code: a.code,
    name: a.airport?.name || reg?.name || `${a.city} Airport`,
    city: a.city,
    country: a.country,
    stateCountry: `${a.city}, ${a.country}`,
    servicesCount: reg?.availableServiceIds?.length || 4,
    featured: reg?.featured ?? ["DEL", "BOM", "HYD", "BLR", "AMD", "MAA"].includes(a.code),
    cover: getAirportPrimaryImage(a.code) || a.cover,
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
  // Database is the single source of truth for the 20 configured airports
  const [airportsData, setAirportsData] = useState<AirportListingItem[]>(INITIAL_DATABASE_AIRPORTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState("All");
  const [sortOption, setSortOption] = useState("A - Z");
  const [displayCount, setDisplayCount] = useState(24);

  // Featured Arc Carousel Index
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Live database fetch from supported airports API
  useEffect(() => {
    airportApi.listSupported().then((res) => {
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const liveItems: AirportListingItem[] = res.data.map((item: AirportInfo) => {
          const reg = AIRPORT_REGISTRY[item.code];
          const localA = AIRPORTS.find((a) => a.code === item.code);
          return {
            code: item.code,
            name: item.name || reg?.name || localA?.airport?.name || `${item.city} Airport`,
            city: item.city || reg?.city || localA?.city || item.code,
            country: item.country || reg?.country || localA?.country || "India",
            stateCountry: `${item.city || reg?.city || localA?.city || item.code}, ${item.country || reg?.country || "India"}`,
            servicesCount: reg?.availableServiceIds?.length || 4,
            featured: reg?.featured ?? ["DEL", "BOM", "HYD", "BLR", "AMD", "MAA"].includes(item.code),
            cover: getAirportPrimaryImage(item.code) || reg?.coverImage || localA?.cover,
          };
        });
        setAirportsData(liveItems);
      }
    });
  }, []);

  // Filtered dataset from database airports
  const filteredAirports = useMemo(() => {
    return airportsData
      .filter((item) => {
        // Search text query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesQuery =
            item.city.toLowerCase().includes(q) ||
            item.code.toLowerCase().includes(q) ||
            item.name.toLowerCase().includes(q) ||
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
          const cityFirst = (item.city || "").trim().toUpperCase()[0];
          const nameFirst = (item.name || "").trim().toUpperCase()[0];
          if (cityFirst !== selectedLetter && nameFirst !== selectedLetter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "Z - A") {
          return b.city.localeCompare(a.city);
        }
        return a.city.localeCompare(b.city);
      });
  }, [airportsData, searchQuery, featuredOnly, selectedCountry, selectedLetter, sortOption]);

  // Featured list of airports from database airports
  const featuredList = useMemo(() => {
    const list = airportsData.filter((a) => a.featured);
    return list.length > 0 ? list : airportsData.slice(0, 12);
  }, [airportsData]);

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-50 border border-lime-200 text-lime-800 text-xs font-medium">
            <span>✈</span>
            <span className="font-semibold uppercase tracking-wider text-[11px] font-mono">AIRPORT NETWORK</span>
            <span className="inline-block w-1 h-1 rounded-full bg-lime-500" />
            <span className="text-[10px] text-lime-700 font-mono">{airportsData.length}+ Network Hubs</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading text-slate-900 font-bold tracking-tight">
            Our Serviceable Airports
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-sans">
            Explore our active airports across India and worldwide.
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

        {/* 4. "ALL AIRPORTS" SECTION HEADER & ALPHABET FILTER BAR */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-[#7c3aed] flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">All Airports</h3>
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
            const img = getAirportPrimaryImage(item.code) || item.cover;

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
                    <img width={1600} height={900} loading="lazy" decoding="async" src={img} alt={item.city} className="w-full h-full object-cover" />
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
              <p className="text-xs text-slate-600">We cover 20+ airports worldwide. Contact our team for any assistance.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 justify-center sm:justify-end">
            <a
              href="https://wa.me/919599087959?text=Hello%20Shafsky%20Aviation,%20I%20need%20assistance%20with%20airport%20services"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs transition shadow-xs shrink-0 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>WhatsApp</span>
            </a>
            <a
              href="tel:+919599087959"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-semibold text-xs transition shadow-xs shrink-0 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>Call: +91 95990 87959</span>
            </a>
          </div>
        </div>

        {/* 7. FOOTER FEATURE BADGES BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900">20+ Airports</h5>
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
