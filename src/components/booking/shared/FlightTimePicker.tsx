import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { Clock, ChevronDown, Check } from "lucide-react";

export interface TimeSlotOption {
  value24: string; // "00:00" - "23:55"
  label12: string; // "12:00 AM" - "11:55 PM"
}

/**
 * Generates all 288 5-minute time intervals across the full 24-hour day (12:00 AM to 11:55 PM).
 */
export function generateFullDayTimeSlots(stepMinutes: number = 5): TimeSlotOption[] {
  const slots: TimeSlotOption[] = [];
  for (let h = 0; h < 24; h++) {
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    for (let m = 0; m < 60; m += stepMinutes) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      slots.push({
        value24: `${hh}:${mm}`,
        label12: `${displayHour}:${mm} ${period}`,
      });
    }
  }
  return slots;
}

export const ALL_TIME_SLOTS = generateFullDayTimeSlots(5);

/**
 * Converts standard 24h string ("HH:mm" e.g. "23:30") to 12h label ("11:30 PM").
 */
export function format24To12(time24?: string | null): string {
  if (!time24 || typeof time24 !== "string") return "";
  const trimmed = time24.trim();
  if (!trimmed) return "";

  // If already in 12h format (contains AM/PM), normalize and return
  if (/am|pm/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  const parts = trimmed.split(":");
  if (parts.length < 2) return trimmed;

  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return trimmed;

  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const displayMin = String(m).padStart(2, "0");
  return `${displayHour}:${displayMin} ${period}`;
}

/**
 * Converts 12h label ("11:30 PM") or raw string to standard 24h string ("23:30").
 */
export function parse12To24(timeStr?: string | null): string {
  if (!timeStr || typeof timeStr !== "string") return "";
  const trimmed = timeStr.trim();
  if (!trimmed) return "";

  // If already pure 24h format (e.g. "14:30", "09:00", "23:45")
  if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
    const [h, m] = trimmed.split(":");
    return `${String(parseInt(h, 10)).padStart(2, "0")}:${m}`;
  }

  // Handle 12h AM/PM strings like "11:30 PM", "9:05 AM", "12:00 AM"
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = match[2];
    const period = (match[3] || "").toUpperCase();

    if (period === "PM" && h < 12) h += 12;
    if (period === "AM" && h === 12) h = 0;

    return `${String(h).padStart(2, "0")}:${m}`;
  }

  return trimmed;
}

export interface FlightTimePickerProps {
  id?: string;
  value?: string; // Expects "HH:mm" (e.g. "23:30") or "11:30 PM"
  onChange: (value24: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  ariaLabel?: string;
}

const sansFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export function FlightTimePicker({
  id,
  value = "",
  onChange,
  placeholder = "Select time (e.g. 11:30 PM)",
  className = "",
  inputClassName = "",
  disabled = false,
  required = false,
  error,
  ariaLabel = "Flight Time Picker",
}: FlightTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0, openUpward: false });

  // Compute canonical values
  const current24 = useMemo(() => parse12To24(value), [value]);
  const current12 = useMemo(() => format24To12(current24), [current24]);

  // Keep search text in sync when not open
  useEffect(() => {
    if (!isOpen) {
      setQuery(current12);
    }
  }, [current12, isOpen]);

  // Update dropdown portal position
  const updateMenuPos = () => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dropdownHeight = 280; // approximate max dropdown height
    const spaceBelow = window.innerHeight - r.bottom;
    const openUpward = spaceBelow < dropdownHeight && r.top > dropdownHeight;

    setMenuPos({
      top: openUpward ? r.top - 4 : r.bottom + 4,
      left: r.left,
      width: Math.max(r.width, 180),
      openUpward,
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    updateMenuPos();

    const handleScrollOrResize = () => updateMenuPos();
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    // Auto-scroll to selected time on open
    const scrollTimer = setTimeout(() => {
      if (selectedItemRef.current) {
        selectedItemRef.current.scrollIntoView({ block: "center" });
      }
    }, 40);

    return () => {
      clearTimeout(scrollTimer);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (containerRef.current?.contains(target) || dropdownRef.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
      setQuery(current12);
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, current12]);

  // Filter slots based on query
  const filteredSlots = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q === current12.toLowerCase()) {
      return ALL_TIME_SLOTS;
    }
    return ALL_TIME_SLOTS.filter(
      (s) =>
        s.label12.toLowerCase().includes(q) ||
        s.value24.toLowerCase().includes(q) ||
        s.label12.replace(/\s+/g, "").toLowerCase().includes(q.replace(/\s+/g, ""))
    );
  }, [query, current12]);

  const handleSelect = (slot: TimeSlotOption) => {
    onChange(slot.value24);
    setQuery(slot.label12);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (!isOpen) setIsOpen(true);

    // If user types a full match like "11:30 PM" or "23:30", auto-commit
    const matched = ALL_TIME_SLOTS.find(
      (s) =>
        s.label12.toLowerCase() === val.trim().toLowerCase() ||
        s.value24 === val.trim()
    );
    if (matched) {
      onChange(matched.value24);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredSlots.length > 0) {
        handleSelect(filteredSlots[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setQuery(current12);
    } else if (e.key === "ArrowDown" && !isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div
        className="relative cursor-pointer"
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            updateMenuPos();
          }
        }}
      >
        <Clock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          id={id}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true);
              updateMenuPos();
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          aria-label={ariaLabel}
          className={
            inputClassName ||
            `w-full rounded-xl border bg-white/90 pl-9 pr-8 py-2 text-xs font-semibold text-slate-900 placeholder-gray-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
              error ? "border-red-400 focus:border-red-500" : "border-gray-300"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`
          }
          style={sansFont}
        />
        <ChevronDown
          className={`pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-purple-600" : ""
          }`}
        />
      </div>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
            style={{
              top: menuPos.openUpward ? "auto" : menuPos.top,
              bottom: menuPos.openUpward ? window.innerHeight - menuPos.top : "auto",
              left: menuPos.left,
              width: menuPos.width,
              ...sansFont,
            }}
          >
            {filteredSlots.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 text-center">
                No matching time found
              </div>
            ) : (
              filteredSlots.map((slot) => {
                const isSelected = slot.value24 === current24;
                return (
                  <button
                    key={slot.value24}
                    ref={isSelected ? selectedItemRef : null}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(slot);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-slate-100 text-slate-950 font-semibold"
                        : "text-slate-800 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <span>{slot.label12}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-purple-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
