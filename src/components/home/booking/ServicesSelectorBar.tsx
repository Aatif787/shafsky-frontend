import React, { useRef } from "react";
import { motion } from "framer-motion";
import { SELECTOR_SERVICES } from "./selectorServices";

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
    <div className="w-full relative flex items-center justify-center py-1">
      {/* Icon Tabs Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-4 sm:gap-6 md:gap-7 overflow-x-auto snap-x snap-mandatory py-2 px-2 scrollbar-none w-full justify-start md:justify-center"
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
              {/* Round Circle Container */}
              <div
                className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all duration-300 ${isSelected
                  ? "bg-gradient-to-tr from-[#7c3aed] to-[#9333ea] border-2 border-white text-white shadow-[0_6px_20px_rgba(124,58,237,0.45)] ring-4 ring-[#7c3aed]/25 scale-105"
                  : "bg-white/95 border border-gray-200/80 text-gray-600 shadow-sm hover:border-[#7c3aed]/50 hover:text-[#7c3aed] hover:scale-102"
                  }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 sm:h-5 sm:w-5 transition-transform duration-300 ${isSelected ? "text-white scale-110" : "text-gray-600 group-hover:text-[#7c3aed]"
                    }`}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[10px] sm:text-[11px] font-semibold tracking-tight transition-all whitespace-nowrap px-1.5 py-0.5 rounded-full ${isSelected
                  ? "text-[#7c3aed] font-extrabold bg-[#7c3aed]/10 border border-[#7c3aed]/20 shadow-xs"
                  : "text-gray-700 group-hover:text-[#7c3aed]"
                  }`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {s.t}
              </span>

              {/* Active Underline Bar */}
              {isSelected && (
                <motion.div
                  layoutId="activeServiceBar"
                  className="absolute -bottom-1 h-0.5 w-8 rounded-full bg-[#7c3aed] shadow-[0_0_8px_#7c3aed]"
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
