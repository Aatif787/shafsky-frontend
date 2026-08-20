import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { airportApi, formatAirportOption } from "@/lib/api/airportApi";

export interface SelectedAirportDetails {
  id?: string;
  code: string;
  name: string;
  city: string;
  country: string;
  timezone?: string;
  is_supported?: boolean;
}

interface IntelligentAirportAutocompleteProps {
  value: string;
  onSelect: (airport: SelectedAirportDetails) => void;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  className?: string;
  /** supported = Neon supported_airports; global = airports.csv */
  mode?: "global" | "supported";
  journeyType?: "ARRIVAL" | "DEPARTURE" | "TRANSIT";
}

const UNSUPPORTED_MESSAGE = "This airport is currently not supported for online booking.";
const monoFont = { fontFamily: "'JetBrains Mono', monospace" };
const sansFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

function extractIata(value: string): string {
  const match = String(value || "").match(/\(([A-Z]{3})\)/i);
  if (match) return match[1].toUpperCase();
  const cleaned = String(value || "").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(cleaned) ? cleaned : "";
}

export async function searchAirports(
  query: string,
  mode: "global" | "supported" = "global",
  journeyType?: "ARRIVAL" | "DEPARTURE" | "TRANSIT"
): Promise<SelectedAirportDetails[]> {
  const q = (query || "").trim();
  const iata = extractIata(q);
  const searchTerm = iata && q.length <= 5 ? iata : q;

  const res = await airportApi.search(searchTerm, mode, journeyType);
  const rows = (res as any)?.data || [];
  return Array.isArray(rows) ? rows : [];
}

export function IntelligentAirportAutocomplete({
  value,
  onSelect,
  onChangeText,
  placeholder = "Search airport",
  className = "",
  mode = "global",
  journeyType,
}: IntelligentAirportAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SelectedAirportDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const raw = value || "";
    const code = extractIata(raw) || (/^[A-Z]{3}$/i.test(raw.trim()) ? raw.trim().toUpperCase() : "");
    if (mode === "supported" && code && !raw.includes("—")) {
      airportApi.listSupported().then((res) => {
        const match = ((res as any).data || []).find((a: SelectedAirportDetails) => a.code === code);
        setInputValue(match ? formatAirportOption(match) : raw);
      });
      return;
    }
    setInputValue(raw);
  }, [value, mode]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const runSearch = (text: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const matches = await searchAirports(text, mode, journeyType);
        setResults(matches);
        setSelectedIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    if (onChangeText) onChangeText(text);
    setIsOpen(true);
    runSearch(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
        runSearch(inputValue);
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
    setInputValue(formatAirportOption(airport));
    onSelect(airport);
    setIsOpen(false);
  };

  const highlightMatch = (text: string, query: string) => {
    const q = extractIata(query) || query.trim();
    if (!q) return text;
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

  const emptyMessage =
    mode === "supported"
      ? (inputValue || "").trim()
        ? UNSUPPORTED_MESSAGE
        : "No configured airports found."
      : (inputValue || "").trim()
        ? "No matching airports found"
        : "Loading global airports...";

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
            runSearch(inputValue);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-xl border border-gray-300 bg-white/90 pl-9 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder-gray-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          style={sansFont}
        />
        {loading && <Loader2 className="absolute right-3 top-3 h-3.5 w-3.5 animate-spin text-purple-600" />}
      </div>

      {isOpen && (
        <div className="absolute z-[300] mt-1 max-h-72 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-4 text-xs text-slate-500 font-mono" style={monoFont}>
              <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
              <span>Loading airports...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-600 font-sans">
              {emptyMessage}
            </div>
          ) : (
            <ul className="py-1">
              {results.map((airport, idx) => {
                const isSelected = idx === selectedIndex;
                const label = formatAirportOption(airport);
                return (
                  <li
                    key={`${airport.code}-${idx}`}
                    onClick={() => handleSelection(airport)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer text-xs transition-colors ${
                      isSelected ? "bg-purple-50 text-purple-900 font-bold" : "hover:bg-gray-50 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 border border-amber-200 shrink-0">
                        <MapPin className="h-3.5 w-3.5 text-amber-700" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-900 truncate" style={sansFont}>
                          {highlightMatch(label, inputValue)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono" style={monoFont}>
                          {highlightMatch(`${airport.city}, ${airport.country}`, inputValue)}
                        </span>
                      </div>
                    </div>
                    <span
                      className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-extrabold text-amber-400 shadow-xs shrink-0 ml-2"
                      style={monoFont}
                    >
                      {airport.code}
                    </span>
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
