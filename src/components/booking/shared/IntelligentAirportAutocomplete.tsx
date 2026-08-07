import React, { useState, useEffect, useRef } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import { AIRPORT_REGISTRY, AirportRegistryEntry } from "@/data/airportRegistry";

export interface SelectedAirportDetails {
  code: string;
  name: string;
  city: string;
  country: string;
  timezone?: string;
}

interface IntelligentAirportAutocompleteProps {
  value: string;
  onSelect: (airport: SelectedAirportDetails) => void;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  className?: string;
}

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };
const sansFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export function searchAirports(query: string): SelectedAirportDetails[] {
  if (!query || !query.trim()) {
    return Object.values(AIRPORT_REGISTRY).slice(0, 10).map((entry) => ({
      code: entry.code,
      name: entry.name,
      city: entry.city,
      country: entry.country,
      timezone: entry.timezone,
    }));
  }

  const q = query.trim().toUpperCase();

  // Search in AIRPORT_REGISTRY
  const matchesFromRegistry = Object.values(AIRPORT_REGISTRY).filter((entry) => {
    const codeMatch = entry.code.toUpperCase() === q || entry.code.toUpperCase().startsWith(q);
    const nameMatch = entry.name.toUpperCase().includes(q);
    const cityMatch = entry.city.toUpperCase().includes(q);
    const countryMatch = entry.country.toUpperCase().includes(q);
    return codeMatch || nameMatch || cityMatch || countryMatch;
  }).map((entry) => ({
    code: entry.code,
    name: entry.name,
    city: entry.city,
    country: entry.country,
    timezone: entry.timezone,
  }));

  if (matchesFromRegistry.length > 0) {
    return matchesFromRegistry.slice(0, 15);
  }

  // Fallback: If 3-letter IATA code is typed directly
  if (/^[A-Z]{3}$/.test(q)) {
    return [
      {
        code: q,
        name: `${q} International Airport`,
        city: q,
        country: "International",
        timezone: "UTC",
      },
    ];
  }

  return [];
}

export function IntelligentAirportAutocomplete({
  value,
  onSelect,
  onChangeText,
  placeholder = "Search by Code, Airport Name, City, or Country",
  className = "",
}: IntelligentAirportAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SelectedAirportDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    if (onChangeText) onChangeText(text);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setLoading(true);
    setIsOpen(true);

    searchTimeoutRef.current = setTimeout(() => {
      const matches = searchAirports(text);
      setResults(matches);
      setLoading(false);
      setSelectedIndex(-1);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        e.preventDefault();
        handleSelection(results[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelection = (airport: SelectedAirportDetails) => {
    setInputValue(`${airport.city} (${airport.code})`);
    onSelect(airport);
    setIsOpen(false);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query || !query.trim()) return text;
    const q = query.trim();
    const parts = text.split(new RegExp(`(${q})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <mark key={i} className="bg-amber-200 text-slate-900 font-bold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            setIsOpen(true);
            setResults(searchAirports(inputValue));
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-300 bg-white/90 pl-9 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder-gray-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          style={sansFont}
        />
        {loading && <Loader2 className="absolute right-3 top-3 h-3.5 w-3.5 animate-spin text-purple-600" />}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl backdrop-blur-xl">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-4 text-xs text-slate-500 font-mono" style={monoFont}>
              <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
              <span>Searching Airports...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 font-mono" style={monoFont}>
              No matching airports found
            </div>
          ) : (
            <ul className="py-1">
              {results.map((airport, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <li
                    key={`${airport.code}-${idx}`}
                    onClick={() => handleSelection(airport)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer text-xs transition-colors ${
                      isSelected ? "bg-purple-50 text-purple-900 font-bold" : "hover:bg-gray-50 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 border border-amber-200 shrink-0">
                        <MapPin className="h-3.5 w-3.5 text-amber-700" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900" style={sansFont}>
                          {highlightMatch(airport.name, inputValue)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono" style={monoFont}>
                          {highlightMatch(`${airport.city}, ${airport.country}`, inputValue)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-extrabold text-amber-400 shadow-xs"
                        style={monoFont}
                      >
                        {airport.code}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
