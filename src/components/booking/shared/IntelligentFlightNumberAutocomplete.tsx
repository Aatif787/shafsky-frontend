import React, { useState, useEffect, useRef } from "react";
import { Plane, Loader2 } from "lucide-react";
import { ApiClient } from "@/lib/ApiClient";

export interface FlightSuggestion {
  flightNum: string;
  origin?: string;
  destination?: string;
  airlineName?: string;
}

interface IntelligentFlightNumberAutocompleteProps {
  value: string;
  airlineIata?: string;
  onSelect: (flight: FlightSuggestion) => void;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };
const sansFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export function IntelligentFlightNumberAutocomplete({
  value,
  airlineIata,
  onSelect,
  onChangeText,
  placeholder = "e.g. AI101, 6E224, QP1301",
  className = "",
  error,
}: IntelligentFlightNumberAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<FlightSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, FlightSuggestion[]>>(new Map());

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

  const fetchSuggestions = async (query: string) => {
    const cleanQuery = query.trim().toUpperCase();
    if (!cleanQuery || cleanQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    if (cacheRef.current.has(cleanQuery)) {
      setResults(cacheRef.current.get(cleanQuery) || []);
      setLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await ApiClient.fetchWithAuth(`/api/flights/search?query=${encodeURIComponent(cleanQuery)}`, {
        signal: abortControllerRef.current.signal,
      });

      if (response.ok) {
        const resJson = await response.json();
        const rawItems = Array.isArray(resJson?.data) ? resJson.data : Array.isArray(resJson) ? resJson : [];
        const suggestions: FlightSuggestion[] = rawItems.map((item: any) => ({
          flightNum: item?.flight?.iata || item?.flightNum || cleanQuery,
          origin: item?.departure?.airport || item?.origin?.code || undefined,
          destination: item?.arrival?.airport || item?.destination?.code || undefined,
          airlineName: item?.airline?.name || item?.carrier?.name,
        }));

        cacheRef.current.set(cleanQuery, suggestions);
        setResults(suggestions);
      } else {
        setResults([]);
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value.toUpperCase();
    setInputValue(text);
    if (onChangeText) onChangeText(text);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setLoading(true);
    setIsOpen(true);

    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(text);
      setSelectedIndex(-1);
    }, 350);
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

  const handleSelection = (flight: FlightSuggestion) => {
    setInputValue(flight.flightNum);
    onSelect(flight);
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
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (inputValue.length >= 2) {
              setIsOpen(true);
              fetchSuggestions(inputValue);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full rounded-xl border ${
            error ? "border-red-500 ring-2 ring-red-500/20" : "border-gray-300"
          } bg-white/90 px-3.5 py-2.5 text-xs font-semibold text-slate-900 uppercase placeholder-gray-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
          style={monoFont}
        />
        {loading && <Loader2 className="absolute right-3 top-3 h-3.5 w-3.5 animate-spin text-purple-600" />}
      </div>
      {error && <p className="mt-1 text-[10px] font-medium text-red-500">{error}</p>}

      {isOpen && inputValue.length >= 2 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl backdrop-blur-xl">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-4 text-xs text-slate-500 font-mono" style={monoFont}>
              <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
              <span>Fetching Flight Schedules...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 font-mono" style={monoFont}>
              Custom flight number accepted ({inputValue})
            </div>
          ) : (
            <ul className="py-1">
              {results.map((flight, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <li
                    key={`${flight.flightNum}-${idx}`}
                    onClick={() => handleSelection(flight)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer text-xs transition-colors ${
                      isSelected ? "bg-purple-50 text-purple-900 font-bold" : "hover:bg-gray-50 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-amber-400 shrink-0">
                        <Plane className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold uppercase" style={monoFont}>
                          {highlightMatch(flight.flightNum, inputValue)}
                        </span>
                        {flight.airlineName && (
                          <span className="text-[10px] text-slate-500" style={sansFont}>
                            {flight.airlineName}
                          </span>
                        )}
                      </div>
                    </div>
                    {flight.origin && flight.destination && (
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-mono font-bold text-slate-700" style={monoFont}>
                        {flight.origin} → {flight.destination}
                      </span>
                    )}
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
