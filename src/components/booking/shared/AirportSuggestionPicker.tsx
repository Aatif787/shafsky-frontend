import React, { useState, useMemo, useEffect } from "react";
import {
  Plane,
  Search,
  Check,
  ChevronDown,
  X,
  Globe,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { isIndianAirportCode, AIRPORT_REGISTRY } from "@/data/airportRegistry";

export interface SuggestedAirport {
  code: string;
  city: string;
  name: string;
  country: string;
  region?: string;
  popular?: boolean;
}

export const DOMESTIC_AIRPORTS: SuggestedAirport[] = [
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj International Airport", country: "India", region: "Maharashtra", popular: true },
  { code: "DEL", city: "New Delhi", name: "Indira Gandhi International Airport", country: "India", region: "Delhi NCR", popular: true },
  { code: "BLR", city: "Bengaluru", name: "Kempegowda International Airport", country: "India", region: "Karnataka", popular: true },
  { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi International Airport", country: "India", region: "Telangana", popular: true },
  { code: "MAA", city: "Chennai", name: "Chennai International Airport", country: "India", region: "Tamil Nadu", popular: true },
  { code: "CCU", city: "Kolkata", name: "Netaji Subhash Chandra Bose International Airport", country: "India", region: "West Bengal", popular: true },
  { code: "AMD", city: "Ahmedabad", name: "Sardar Vallabhbhai Patel International Airport", country: "India", region: "Gujarat", popular: true },
  { code: "GOX", city: "Goa (Mopa)", name: "Manohar International Airport", country: "India", region: "Goa", popular: true },
  { code: "GOI", city: "Goa (Dabolim)", name: "Dabolim Airport", country: "India", region: "Goa", popular: true },
  { code: "COK", city: "Kochi", name: "Cochin International Airport", country: "India", region: "Kerala", popular: true },
  { code: "PNQ", city: "Pune", name: "Pune Airport", country: "India", region: "Maharashtra", popular: true },
  { code: "JAI", city: "Jaipur", name: "Jaipur International Airport", country: "India", region: "Rajasthan", popular: true },
  { code: "LKO", city: "Lucknow", name: "Chaudhary Charan Singh International Airport", country: "India", region: "Uttar Pradesh", popular: true },
  { code: "IXC", city: "Chandigarh", name: "Shaheed Bhagat Singh International Airport", country: "India", region: "Punjab / Haryana", popular: true },
  { code: "ATQ", city: "Amritsar", name: "Sri Guru Ram Dass Jee International Airport", country: "India", region: "Punjab", popular: true },
  { code: "GAU", city: "Guwahati", name: "Lokpriya Gopinath Bordoloi International Airport", country: "India", region: "Assam", popular: true },
  { code: "BBI", city: "Bhubaneswar", name: "Biju Patnaik International Airport", country: "India", region: "Odisha", popular: true },
  { code: "PAT", city: "Patna", name: "Jayprakash Narayan Airport", country: "India", region: "Bihar", popular: true },
  { code: "VTZ", city: "Visakhapatnam", name: "Visakhapatnam International Airport", country: "India", region: "Andhra Pradesh", popular: true },
  { code: "SXR", city: "Srinagar", name: "Sheikh ul-Alam International Airport", country: "India", region: "Jammu & Kashmir", popular: true },
  { code: "VNS", city: "Varanasi", name: "Lal Bahadur Shastri International Airport", country: "India", region: "Uttar Pradesh", popular: true },
  { code: "IDR", city: "Indore", name: "Devi Ahilyabai Holkar Airport", country: "India", region: "Madhya Pradesh", popular: true },
  { code: "CJB", city: "Coimbatore", name: "Coimbatore International Airport", country: "India", region: "Tamil Nadu", popular: true },
  { code: "IXB", city: "Bagdogra", name: "Bagdogra Airport", country: "India", region: "West Bengal" },
  { code: "TRV", city: "Thiruvananthapuram", name: "Trivandrum International Airport", country: "Kerala", region: "Kerala" },
  { code: "IXE", city: "Mangaluru", name: "Mangaluru International Airport", country: "India", region: "Karnataka" },
  { code: "STV", city: "Surat", name: "Surat International Airport", country: "India", region: "Gujarat" },
  { code: "BDQ", city: "Vadodara", name: "Vadodara Airport", country: "India", region: "Gujarat" },
  { code: "BHO", city: "Bhopal", name: "Raja Bhoj Airport", country: "India", region: "Madhya Pradesh" },
  { code: "IXR", city: "Ranchi", name: "Birsa Munda Airport", country: "India", region: "Jharkhand" },
  { code: "RPR", city: "Raipur", name: "Swami Vivekananda Airport", country: "India", region: "Chhattisgarh" },
  { code: "DED", city: "Dehradun", name: "Jolly Grant Airport", country: "India", region: "Uttarakhand" },
  { code: "IXM", city: "Madurai", name: "Madurai Airport", country: "India", region: "Tamil Nadu" },
  { code: "TRZ", city: "Tiruchirappalli", name: "Tiruchirappalli International Airport", country: "India", region: "Tamil Nadu" },
  { code: "VGA", city: "Vijayawada", name: "Vijayawada International Airport", country: "India", region: "Andhra Pradesh" },
  { code: "UDR", city: "Udaipur", name: "Maharana Pratap Airport", country: "India", region: "Rajasthan" },
  { code: "JDH", city: "Jodhpur", name: "Jodhpur Airport", country: "India", region: "Rajasthan" },
  { code: "IXA", city: "Agartala", name: "Maharaja Bir Bikram Airport", country: "India", region: "Tripura" },
  { code: "IXZ", city: "Port Blair", name: "Veer Savarkar International Airport", country: "India", region: "Andaman & Nicobar" },
  { code: "IMF", city: "Imphal", name: "Bir Tikendrajit International Airport", country: "India", region: "Manipur" },
  { code: "AYJ", city: "Ayodhya", name: "Maharishi Valmiki International Airport", country: "India", region: "Uttar Pradesh" },
];

export const INTERNATIONAL_AIRPORTS: SuggestedAirport[] = [
  { code: "DXB", city: "Dubai", name: "Dubai International Airport", country: "United Arab Emirates", popular: true },
  { code: "AUH", city: "Abu Dhabi", name: "Zayed International Airport", country: "United Arab Emirates", popular: true },
  { code: "DOH", city: "Doha", name: "Hamad International Airport", country: "Qatar", popular: true },
  { code: "SHJ", city: "Sharjah", name: "Sharjah International Airport", country: "United Arab Emirates", popular: true },
  { code: "LHR", city: "London", name: "Heathrow Airport", country: "United Kingdom", popular: true },
  { code: "LGW", city: "London", name: "Gatwick Airport", country: "United Kingdom", popular: true },
  { code: "SIN", city: "Singapore", name: "Singapore Changi Airport", country: "Singapore", popular: true },
  { code: "BKK", city: "Bangkok", name: "Suvarnabhumi Airport", country: "Thailand", popular: true },
  { code: "DMK", city: "Bangkok", name: "Don Mueang International Airport", country: "Thailand" },
  { code: "KUL", city: "Kuala Lumpur", name: "Kuala Lumpur International Airport", country: "Malaysia", popular: true },
  { code: "JFK", city: "New York", name: "John F. Kennedy International Airport", country: "United States", popular: true },
  { code: "EWR", city: "Newark", name: "Newark Liberty International Airport", country: "United States", popular: true },
  { code: "SFO", city: "San Francisco", name: "San Francisco International Airport", country: "United States", popular: true },
  { code: "ORD", city: "Chicago", name: "O'Hare International Airport", country: "United States", popular: true },
  { code: "FRA", city: "Frankfurt", name: "Frankfurt Airport", country: "Germany", popular: true },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle Airport", country: "France", popular: true },
  { code: "AMS", city: "Amsterdam", name: "Amsterdam Airport Schiphol", country: "Netherlands", popular: true },
  { code: "IST", city: "Istanbul", name: "Istanbul Airport", country: "Turkey", popular: true },
  { code: "MCT", city: "Muscat", name: "Muscat International Airport", country: "Oman", popular: true },
  { code: "KWI", city: "Kuwait City", name: "Kuwait International Airport", country: "Kuwait", popular: true },
  { code: "BAH", city: "Bahrain", name: "Bahrain International Airport", country: "Bahrain", popular: true },
  { code: "JED", city: "Jeddah", name: "King Abdulaziz International Airport", country: "Saudi Arabia", popular: true },
  { code: "RUH", city: "Riyadh", name: "King Khalid International Airport", country: "Saudi Arabia", popular: true },
  { code: "DMM", city: "Dammam", name: "King Fahd International Airport", country: "Saudi Arabia" },
  { code: "CMB", city: "Colombo", name: "Bandaranaike International Airport", country: "Sri Lanka", popular: true },
  { code: "MLE", city: "Malé", name: "Velana International Airport", country: "Maldives", popular: true },
  { code: "KTM", city: "Kathmandu", name: "Tribhuvan International Airport", country: "Nepal", popular: true },
  { code: "DAC", city: "Dhaka", name: "Hazrat Shahjalal International Airport", country: "Bangladesh", popular: true },
  { code: "SYD", city: "Sydney", name: "Sydney Kingsford Smith Airport", country: "Australia" },
  { code: "MEL", city: "Melbourne", name: "Melbourne Airport", country: "Australia" },
  { code: "YYZ", city: "Toronto", name: "Toronto Pearson International Airport", country: "Canada" },
  { code: "YVR", city: "Vancouver", name: "Vancouver International Airport", country: "Canada" },
  { code: "HND", city: "Tokyo", name: "Tokyo Haneda Airport", country: "Japan" },
  { code: "NRT", city: "Tokyo", name: "Narita International Airport", country: "Japan" },
  { code: "HKG", city: "Hong Kong", name: "Hong Kong International Airport", country: "Hong Kong" },
  { code: "ZRH", city: "Zurich", name: "Zurich Airport", country: "Switzerland" },
  { code: "MUC", city: "Munich", name: "Munich Airport", country: "Germany" },
  { code: "FCO", city: "Rome", name: "Leonardo da Vinci–Fiumicino Airport", country: "Italy" },
  { code: "MXP", city: "Milan", name: "Milan Malpensa Airport", country: "Italy" },
];

/**
 * Finds airport details by 3-letter IATA code.
 */
export function lookupAirport(code?: string): SuggestedAirport | null {
  if (!code) return null;
  const clean = code.trim().toUpperCase();
  if (!clean) return null;

  // 1. Check Domestic Catalog
  const dom = DOMESTIC_AIRPORTS.find((a) => a.code === clean);
  if (dom) return dom;

  // 2. Check International Catalog
  const intl = INTERNATIONAL_AIRPORTS.find((a) => a.code === clean);
  if (intl) return intl;

  // 3. Check Centralized AIRPORT_REGISTRY
  const reg = AIRPORT_REGISTRY[clean];
  if (reg) {
    return {
      code: reg.code,
      city: reg.city,
      name: reg.name,
      country: reg.country,
      region: reg.city,
      popular: reg.featured,
    };
  }

  return null;
}

export interface AirportSuggestionPickerProps {
  value: string;
  onChange: (code: string, airport?: SuggestedAirport) => void;
  travelType: "domestic" | "international";
  onTravelTypeChange?: (travelType: "domestic" | "international") => void;
  direction?: "arrival" | "departure" | "transit";
  serviceAirportCode?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export function AirportSuggestionPicker({
  value,
  onChange,
  travelType,
  onTravelTypeChange,
  direction = "arrival",
  serviceAirportCode = "",
  placeholder = "Select or search airport...",
  required = false,
  className = "",
  id,
  disabled = false,
}: AirportSuggestionPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Active tab defaults to the current travelType, but user can freely toggle tabs
  const [activeTab, setActiveTab] = useState<"domestic" | "international">(
    travelType === "international" ? "international" : "domestic"
  );

  // Sync tab with external travelType changes when popover opens or travelType changes
  useEffect(() => {
    setActiveTab(travelType === "international" ? "international" : "domestic");
  }, [travelType, open]);

  // Exclude the current service airport so user doesn't pick DEL if already at DEL
  const cleanServiceCode = (serviceAirportCode || "").trim().toUpperCase();

  const currentAirport = useMemo(() => lookupAirport(value), [value]);

  const activeCatalog = useMemo(() => {
    const list = activeTab === "domestic" ? DOMESTIC_AIRPORTS : INTERNATIONAL_AIRPORTS;
    return list.filter((a) => a.code !== cleanServiceCode);
  }, [activeTab, cleanServiceCode]);

  const quickPicks = useMemo(() => {
    return activeCatalog.filter((a) => a.popular).slice(0, 8);
  }, [activeCatalog]);

  const filteredAirports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return activeCatalog;

    // Search active catalog first
    const matches = activeCatalog.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q) ||
        (a.region && a.region.toLowerCase().includes(q))
    );

    // If query has results in active tab, return them
    if (matches.length > 0) return matches;

    // Fallback: search the opposite catalog in case user typed an international airport while on domestic tab or vice versa
    const otherList = (activeTab === "domestic" ? INTERNATIONAL_AIRPORTS : DOMESTIC_AIRPORTS).filter(
      (a) => a.code !== cleanServiceCode
    );
    return otherList.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
    );
  }, [activeCatalog, activeTab, searchQuery, cleanServiceCode]);

  const handleSelectAirport = (airport: SuggestedAirport) => {
    onChange(airport.code, airport);

    // Auto switch travelType if an international airport was picked on domestic or vice versa
    const isDomesticAirport = isIndianAirportCode(airport.code);
    if (!isDomesticAirport && travelType !== "international") {
      onTravelTypeChange?.("international");
    } else if (isDomesticAirport && cleanServiceCode && isIndianAirportCode(cleanServiceCode) && travelType !== "domestic") {
      onTravelTypeChange?.("domestic");
    }

    setSearchQuery("");
    setOpen(false);
  };

  const handleSelectCustomCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;
    const resolved = lookupAirport(cleanCode);
    onChange(cleanCode, resolved || undefined);

    const isDomesticAirport = isIndianAirportCode(cleanCode);
    if (!isDomesticAirport && travelType !== "international") {
      onTravelTypeChange?.("international");
    } else if (isDomesticAirport && cleanServiceCode && isIndianAirportCode(cleanServiceCode) && travelType !== "domestic") {
      onTravelTypeChange?.("domestic");
    }

    setSearchQuery("");
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchQuery("");
  };

  const cleanQuery = searchQuery.trim().toUpperCase();
  const isCustomCodeCandidate = cleanQuery.length >= 3 && /^[A-Z0-9]{3}$/.test(cleanQuery);

  return (
    <div className={`relative ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <button
            type="button"
            id={id}
            aria-expanded={open}
            className={`h-11 w-full rounded-xl border transition-all text-left px-3.5 flex items-center justify-between gap-2 outline-none group ${
              open
                ? "border-lime-500 ring-2 ring-lime-500/20 bg-white"
                : "border-slate-300 bg-white hover:border-slate-400"
            } ${disabled ? "opacity-60 cursor-not-allowed bg-slate-50" : "cursor-pointer"}`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="flex-shrink-0 h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-lime-100 group-hover:text-lime-800 transition-colors">
                <Plane size={14} className="transform rotate-45" />
              </div>

              {value ? (
                <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded tracking-wide">
                    {value}
                  </span>
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {currentAirport ? currentAirport.city : value}
                  </span>
                  {currentAirport?.name && (
                    <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
                      — {currentAirport.name}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs font-normal text-slate-400 truncate">
                  {placeholder}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {value && !disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleClear(e);
                    }
                  }}
                  title="Clear selection"
                  className="h-6 w-6 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={13} />
                </span>
              )}
              <ChevronDown
                size={15}
                className={`text-slate-400 transition-transform duration-200 ${
                  open ? "transform rotate-180 text-lime-700" : ""
                }`}
              />
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[calc(100vw-32px)] sm:w-[460px] max-w-[95vw] p-0 bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-2xl rounded-2xl z-50 overflow-hidden"
          align="start"
          sideOffset={6}
        >
          {/* Header & Search Bar */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, airport name or IATA (e.g. BOM, Dubai)..."
                autoFocus
                className="h-10 w-full pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 focus:outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (filteredAirports.length > 0) {
                      handleSelectAirport(filteredAirports[0]);
                    } else if (cleanQuery) {
                      handleSelectCustomCode(cleanQuery);
                    }
                  }
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Service Tabs */}
            <div className="mt-2.5 grid grid-cols-2 gap-1.5 p-1 bg-slate-200/60 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab("domestic")}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "domestic"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <span>🇮🇳 Domestic (India)</span>
                {travelType === "domestic" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-500" title="Selected Service" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("international")}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "international"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <span>🌐 International Hubs</span>
                {travelType === "international" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-500" title="Selected Service" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Picks / Popular Chips (shown when no search query) */}
          {!searchQuery && quickPicks.length > 0 && (
            <div className="p-3 border-b border-slate-100 bg-white">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1">
                  <Sparkles size={11} className="text-lime-600" />
                  Popular Suggestions
                </span>
                <span className="text-[10px] text-slate-400 font-sans">1-click pick</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickPicks.map((airport) => {
                  const isSelected = value === airport.code;
                  return (
                    <button
                      key={airport.code}
                      type="button"
                      onClick={() => handleSelectAirport(airport)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                        isSelected
                          ? "bg-lime-600 text-white font-bold shadow-xs"
                          : "bg-slate-100 hover:bg-lime-50 text-slate-800 hover:text-lime-900 hover:border-lime-300 border border-transparent font-medium"
                      }`}
                    >
                      <span className="font-bold">{airport.code}</span>
                      <span className="text-[11px] opacity-80 font-sans">{airport.city}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Airport List */}
          <div className="max-h-64 sm:max-h-72 overflow-y-auto divide-y divide-slate-100 overscroll-contain">
            {filteredAirports.length > 0 ? (
              filteredAirports.map((airport) => {
                const isSelected = value === airport.code;
                return (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={() => handleSelectAirport(airport)}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                      isSelected
                        ? "bg-lime-50/70 text-slate-900"
                        : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`flex-shrink-0 h-9 w-12 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                          isSelected
                            ? "bg-lime-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-800 border border-slate-200"
                        }`}
                      >
                        {airport.code}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {airport.city}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider bg-slate-100 px-1 py-0.2 rounded">
                            {airport.country}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {airport.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <div className="h-5 w-5 rounded-full bg-lime-600 text-white flex items-center justify-center">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="text-[11px] font-mono text-slate-400 group-hover:text-slate-600">
                          Select
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center">
                <p className="text-xs font-medium text-slate-600">
                  No predefined airports matching "{searchQuery}".
                </p>
                {cleanQuery && (
                  <button
                    type="button"
                    onClick={() => handleSelectCustomCode(cleanQuery)}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-600 hover:bg-lime-700 text-white text-xs font-mono font-bold shadow-xs transition-all"
                  >
                    <Check size={13} />
                    <span>Use "{cleanQuery}" as airport code</span>
                  </button>
                )}
              </div>
            )}

            {/* Direct Custom IATA Code Option when user types a 3-letter query not currently selected */}
            {searchQuery &&
              cleanQuery.length === 3 &&
              !filteredAirports.some((a) => a.code === cleanQuery) && (
                <div className="p-2.5 bg-lime-50/60 border-t border-lime-200/60 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-slate-700">
                    Custom airport code: <strong className="text-slate-900">{cleanQuery}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectCustomCode(cleanQuery)}
                    className="px-2.5 py-1 rounded-lg bg-lime-600 hover:bg-lime-700 text-white text-[11px] font-mono font-bold transition-colors"
                  >
                    Select {cleanQuery}
                  </button>
                </div>
              )}
          </div>

          {/* Footer note */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>
              Service mode: <strong className="text-slate-800 capitalize">{travelType}</strong>
            </span>
            <span>
              {direction === "arrival"
                ? "Arrival Service"
                : direction === "departure"
                ? "Departure Service"
                : "Transit Service"}
            </span>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
