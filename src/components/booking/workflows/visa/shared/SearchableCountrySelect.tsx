import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, Globe, Loader2 } from "lucide-react";
import { type Country, fetchAllCountries, fetchCountriesByKeyword } from "@/data/countries";

interface SearchableCountrySelectProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (countryName: string) => void;
  required?: boolean;
}

export function SearchableCountrySelect({
  label,
  value,
  placeholder,
  onChange,
  required = false,
}: SearchableCountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [countriesList, setCountriesList] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load all countries dynamically from API on mount
  useEffect(() => {
    let isSubscribed = true;
    setIsLoading(true);
    fetchAllCountries()
      .then((data) => {
        if (isSubscribed) {
          setCountriesList(data);
        }
      })
      .finally(() => {
        if (isSubscribed) {
          setIsLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

  const selectedCountry = countriesList.find(
    (c) => c.name.toLowerCase() === value.toLowerCase()
  );

  // Dynamic Keyword Search on User Input
  useEffect(() => {
    let isSubscribed = true;
    const q = searchQuery.trim();

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await fetchCountriesByKeyword(q);
        if (isSubscribed) {
          setCountriesList(results);
        }
      } catch {
        if (isSubscribed && !q) {
          setCountriesList([]);
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative space-y-1.5" ref={containerRef}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>

      {/* Select Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl text-sm text-left flex items-center justify-between transition-all focus:outline-none focus:ring-1 focus:ring-amber-500/40"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          {selectedCountry ? (
            <>
              <span className="text-lg leading-none">{selectedCountry.flag}</span>
              <span className="font-semibold text-slate-900 truncate">{selectedCountry.name}</span>
            </>
          ) : value ? (
            <>
              <Globe className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-slate-900 truncate">{value}</span>
            </>
          ) : (
            <span className="text-slate-400 truncate">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-amber-600" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-150 max-h-64 flex flex-col">
          {/* Search Bar */}
          <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                autoFocus
                className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
              {isLoading && (
                <Loader2 className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-amber-500 animate-spin" />
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto p-1.5 space-y-0.5 max-h-48">
            {countriesList.length > 0 ? (
              countriesList.map((c, index) => {
                const isSelected = value.toLowerCase() === c.name.toLowerCase();
                return (
                  <button
                    key={`${c.code}-${index}`}
                    type="button"
                    onClick={() => {
                      onChange(c.name);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-amber-500/10 text-amber-900 font-semibold"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base leading-none">{c.flag}</span>
                      <span>{c.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                {isLoading ? "Fetching matching countries..." : "No matching country found"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
