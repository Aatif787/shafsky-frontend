import React, { useRef } from "react";
import { motion } from "framer-motion";
import { SELECTOR_SERVICES } from "./selectorServices";
import { mono } from "@/components/home/theme";

export function ServicesSelectorBar({
  selectedService,
  onSelectService,
}: {
  selectedService: string | null;
  onSelectService: (serviceTitle: string) => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (serviceTitle: string) => {
    onSelectService(serviceTitle);
    const bookingElem = document.getElementById("book");
    if (bookingElem) {
      const rect = bookingElem.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        bookingElem.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="w-full relative flex items-center justify-center py-2">
      {/* Luxury Gold & Ivory Service Selector Tabs */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3 sm:gap-5 md:gap-6 overflow-x-auto snap-x snap-mandatory py-2 px-3 scrollbar-none w-full justify-start md:justify-center"
      >
        {SELECTOR_SERVICES.map((s) => {
          const Icon = s.Icon;
          const isSelected = selectedService === s.t || selectedService === s.id;

          return (
            <motion.button
              key={`circ-selector-${s.t}`}
              type="button"
              onClick={() => handleSelect(s.t)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="group relative flex flex-col items-center gap-1.5 shrink-0 snap-center focus:outline-none cursor-pointer"
            >
              {/* Luxury Circle Icon Container */}
              <div
                className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl transition-all duration-300 ${
                  isSelected
                    ? "bg-[#c5a869] border-2 border-white text-[#050b14] shadow-[0_6px_20px_rgba(197,168,105,0.45)] ring-4 ring-[#c5a869]/20 scale-105"
                    : "bg-white/95 border border-[#e8dfc8] text-slate-700 shadow-sm hover:border-[#c5a869] hover:text-[#050b14] hover:bg-[#fbf9f5]"
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 sm:h-5 sm:w-5 transition-transform duration-300 ${
                    isSelected ? "text-[#050b14] scale-110" : "text-slate-700 group-hover:text-[#050b14]"
                  }`}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[10px] sm:text-[11px] font-semibold tracking-tight transition-all whitespace-nowrap px-2 py-0.5 rounded-full ${
                  isSelected
                    ? "text-[#050b14] font-bold bg-[#c5a869]/20 border border-[#c5a869]/40"
                    : "text-slate-700 group-hover:text-[#050b14]"
                }`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {s.t}
              </span>

              {/* Active Golden Bar */}
              {isSelected && (
                <motion.div
                  layoutId="activeServiceBar"
                  className="absolute -bottom-1 h-0.5 w-7 rounded-full bg-[#c5a869] shadow-[0_0_8px_#c5a869]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
