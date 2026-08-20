import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { AirlineEntry, searchAirlines } from "@/data/airlineRegistry";
import { AirlineLogo } from "./AirlineLogo";

interface IntelligentAirlineAutocompleteProps {
  value: string;
  onSelect: (airline: AirlineEntry) => void;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  className?: string;
}

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };
const sansFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export function IntelligentAirlineAutocomplete({
  value,
  onSelect,
  onChangeText,
  placeholder = "e.g. Air India, IndiGo, Emirates",
  className = "",
}: IntelligentAirlineAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<AirlineEntry[]>([]);
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
      const matches = searchAirlines(text);
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

  const handleSelection = (airline: AirlineEntry) => {
    setInputValue(airline.name);
    onSelect(airline);
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
            setIsOpen(true);
            setResults(searchAirlines(inputValue));
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-300 bg-white/90 px-3.5 py-2.5 text-xs text-slate-900 placeholder-gray-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-semibold"
          style={sansFont}
        />
        {loading && <Loader2 className="absolute right-3 top-3 h-3.5 w-3.5 animate-spin text-purple-600" />}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl backdrop-blur-xl">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-4 text-xs text-slate-500 font-mono" style={monoFont}>
              <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
              <span>Searching Airlines...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 font-mono" style={monoFont}>
              No matching airlines found
            </div>
          ) : (
            <ul className="py-1">
              {results.map((airline, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <li
                    key={`${airline.iata}-${idx}`}
                    onClick={() => handleSelection(airline)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer text-xs transition-colors ${
                      isSelected ? "bg-purple-50 text-purple-900 font-bold" : "hover:bg-gray-50 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded bg-white p-0.5 border border-gray-200 shrink-0 overflow-hidden">
                        <AirlineLogo iata={airline.iata} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold" style={sansFont}>
                          {highlightMatch(airline.name, inputValue)}
                        </span>
                        <span className="text-[10px] text-slate-500" style={monoFont}>
                          {airline.country}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-amber-400"
                        style={monoFont}
                      >
                        {airline.iata}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400" style={monoFont}>
                        {airline.icao}
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
