import React, { useState, useRef, useEffect, useId } from "react";
import { Search, ChevronDown, Check, Globe, Loader2 } from "lucide-react";
import { type Country, fetchAllCountries, fetchCountriesByKeyword, getFlagEmoji } from "@/data/countries";

interface CountrySelectorProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (countryName: string) => void;
  required?: boolean;
}

export function CountrySelector({
  label,
  value,
  placeholder,
  onChange,
  required = false,
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [countriesList, setCountriesList] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  // Load all countries dynamically from API on initial mount
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

  // Find currently selected country object from dynamically loaded list
  const selectedCountry = countriesList.find(
    (c) => c.name.toLowerCase() === value.toLowerCase()
  );

  // Dynamic Keyword Fetching when user types in search query
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
    setHighlightedIndex(0);
  }, [searchQuery, countriesList]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard Navigation: ArrowUp, ArrowDown, Enter, Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < countriesList.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : countriesList.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (countriesList[highlightedIndex]) {
          onChange(countriesList[highlightedIndex].name);
          setIsOpen(false);
          setSearchQuery("");
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Ensure highlighted element stays visible inside scroll container
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div className="relative space-y-1.5" ref={containerRef} onKeyDown={handleKeyDown}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>

      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => searchInputRef.current?.focus(), 50);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
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
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-150 max-h-64 flex flex-col"
        >
          {/* Search Input */}
          <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
              {isLoading && (
                <Loader2 className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-amber-500 animate-spin" />
              )}
            </div>
          </div>

          {/* Country Options List */}
          <div ref={listRef} className="overflow-y-auto p-1.5 space-y-0.5 max-h-48">
            {countriesList.length > 0 ? (
              countriesList.map((c, index) => {
                const isSelected = value.toLowerCase() === c.name.toLowerCase();
                const isHighlighted = index === highlightedIndex;
                return (
                  <div
                    key={`${c.code}-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(c.name);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-all ${
                      isHighlighted
                        ? "bg-amber-500/10 text-amber-900 font-semibold"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base leading-none">{c.flag}</span>
                      <span>{c.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                {isLoading ? "Loading countries..." : "No matching country found"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
