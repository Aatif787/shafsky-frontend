import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Car } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import type { TransportationVehicleItem, TransportOptionId } from "@/data/transportation";

export interface CircularVehicleSelectorProps {
  vehicles: TransportationVehicleItem[];
  selectedVehicleId: string;
  onSelectVehicle: (vehicleId: string) => void;
  categoryTitle?: string;
  categories?: TransportOptionId[];
  selectedCategory?: TransportOptionId;
  onSelectCategory?: (category: TransportOptionId) => void;
}

/**
 * Format clean, concise display name for the circular thumbnail label
 * covering all 38 canonical vehicles across Luxury, MUV, and Economy.
 */
function getShortVehicleName(name: string): string {
  // Luxury Fleet (12)
  if (name.includes("Maybach")) return "Maybach S-Class";
  if (name.includes("W223") || name.includes("S-Class")) return "S-Class (W223)";
  if (name.includes("BMW 7")) return "BMW 7 Series";
  if (name.includes("Audi A8")) return "Audi A8 L";
  if (name.includes("E-Class")) return "Mercedes E-Class";
  if (name.includes("BMW 5")) return "BMW 5 Series";
  if (name.includes("Audi A6")) return "Audi A6";
  if (name.includes("GLS")) return "Mercedes GLS";
  if (name.includes("GLE")) return "Mercedes GLE";
  if (name.includes("Q7")) return "Audi Q7";
  if (name.includes("Land Cruiser")) return "Land Cruiser LC300";
  if (name.includes("C-Class")) return "Mercedes C-Class";
  if (name.includes("BMW 3")) return "BMW 3 Series";
  if (name.includes("Lexus ES")) return "Lexus ES 300h";
  if (name.includes("Phantom")) return "Rolls-Royce Phantom";
  if (name.includes("Flying Spur")) return "Bentley Flying Spur";

  // MUV / Large Fleet (15)
  if (name.includes("Vellfire") || name.includes("Alphard")) return "Toyota Vellfire";
  if (name.includes("Lexus LM")) return "Lexus LM 350h";
  if (name.includes("V-Class") || name.includes("EQV")) return "Mercedes V-Class";
  if (name.includes("HyCross")) return "Innova HyCross";
  if (name.includes("Crysta")) return "Innova Crysta";
  if (name.includes("Invicto")) return "Maruti Invicto";
  if (name.includes("Carnival")) return "Kia Carnival";
  if (name.includes("Fortuner")) return "Toyota Fortuner";
  if (name.includes("Maharaja") || name.includes("Urbania 10")) return "Urbania Maharaja";
  if (name.includes("Urbania 17") || name.includes("Urbania")) return "Force Urbania";
  if (name.includes("Sprinter")) return "Mercedes Sprinter";
  if (name.includes("HiAce") || name.includes("Commuter")) return "Toyota Commuter";
  if (name.includes("Coaster")) return "Toyota Coaster";
  if (name.includes("12-Seater")) return "12-Seater Cruiser";
  if (name.includes("18-Seater")) return "18-Seater Coach";
  if (name.includes("26-Seater")) return "26-Seater Coach";
  if (name.includes("Volvo")) return "Volvo Luxury Coach";
  if (name.includes("Tata")) return "Tata Executive Coach";

  // Economy / Standard Fleet (11)
  if (name.includes("Disposal")) return "Hourly Disposal";
  if (name.includes("Transit")) return "Airport Shuttle";
  if (name.includes("Honda City") || name.includes("Ciaz") || (name.includes("City") && !name.includes("Disposal"))) return "City / Ciaz";
  if (name.includes("Compact Sedan")) return "Compact Sedan";
  if (name.includes("Camry")) return "Toyota Camry";
  if (name.includes("Verna")) return "Hyundai Verna";
  if (name.includes("Slavia") || name.includes("Octavia")) return "Skoda Slavia";
  if (name.includes("Virtus")) return "VW Virtus";
  if (name.includes("Dzire")) return "Maruti Dzire";
  if (name.includes("Aura")) return "Hyundai Aura";
  if (name.includes("Etios")) return "Toyota Etios";
  if (name.includes("Altis") || name.includes("Corolla")) return "Toyota Altis";
  if (name.includes("Ertiga")) return "Maruti Ertiga";
  if (name.includes("Carens")) return "Kia Carens";
  if (name.includes("Rumion") || name.includes("Marazzo")) return "Rumion / Marazzo";
  if (name.includes("Tigor")) return "Tata Tigor EV";

  return name
    .replace(/^(Mercedes-Benz|Toyota|Audi|BMW|Kia|Hyundai|Lexus|Maruti Suzuki|Tata|Skoda|Volkswagen)\s+/i, "")
    .replace(/\s*\([^)]*\)/g, "")
    .trim();
}

/**
 * Self-contained circular vehicle thumbnail with image error handling.
 * Consistent circular geometry with subtle luxury active scale, border, and indicator pip.
 */
const VehicleThumbnailItem: React.FC<{
  image?: string;
  name: string;
  isSelected: boolean;
}> = ({ image, name, isSelected }) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [image]);

  return (
    <div
      className={`relative w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 lg:w-26 lg:h-26 aspect-square rounded-full flex items-center justify-center p-1.5 transition-all duration-300 ${
        isSelected
          ? "scale-105 bg-white border-2 border-slate-950 ring-2 ring-lime-400/90 shadow-md opacity-100"
          : "bg-white/95 border border-slate-200/90 hover:border-slate-400/80 hover:scale-102 opacity-85 group-hover:opacity-100 shadow-2xs"
      }`}
    >
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center p-1">
        {image && !imgFailed ? (
          <img
            src={image}
            alt={name}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-contain object-center pointer-events-none transition-transform duration-300 group-hover:scale-105 select-none"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400">
            <Car size={24} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
        )}
      </div>

      {/* Active Indicator Pip */}
      {isSelected && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 right-0.5 w-3.5 h-3.5 rounded-full bg-lime-500 border-2 border-white shadow-xs z-10"
        />
      )}
    </div>
  );
};

/**
 * Polished Circular Vehicle Selector Carousel.
 * Automatically generated from existing canonical transportation data.
 */
export const CircularVehicleSelector: React.FC<CircularVehicleSelectorProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  categoryTitle,
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Mouse drag-to-scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  // Active vehicle index and boundary status
  const currentIndex = vehicles.findIndex((v) => v.id === selectedVehicleId);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < vehicles.length - 1;

  // Auto-center selected vehicle smoothly in selector
  const centerSelectedVehicle = useCallback(
    (smooth = true) => {
      const el = scrollContainerRef.current;
      if (!el) return;
      const activeEl = el.querySelector<HTMLElement>(
        `[data-vehicle-selector-id="${selectedVehicleId}"]`
      );
      if (activeEl) {
        const containerWidth = el.clientWidth;
        const targetLeft =
          activeEl.offsetLeft - containerWidth / 2 + activeEl.clientWidth / 2;
        el.scrollTo({
          left: Math.max(0, targetLeft),
          behavior: smooth && !prefersReducedMotion ? "smooth" : "auto",
        });
      }
    },
    [selectedVehicleId, prefersReducedMotion]
  );

  useEffect(() => {
    centerSelectedVehicle(true);
  }, [centerSelectedVehicle]);

  // Arrow controls: move to previous / next vehicle
  const handleSelectPrev = () => {
    if (canGoPrev) {
      onSelectVehicle(vehicles[currentIndex - 1].id);
    }
  };

  const handleSelectNext = () => {
    if (canGoNext) {
      onSelectVehicle(vehicles[currentIndex + 1].id);
    }
  };

  // Keyboard navigation across circular vehicles
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handleSelectPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleSelectNext();
    } else if (e.key === "Home") {
      e.preventDefault();
      if (vehicles.length > 0) onSelectVehicle(vehicles[0].id);
    } else if (e.key === "End") {
      e.preventDefault();
      if (vehicles.length > 0) onSelectVehicle(vehicles[vehicles.length - 1].id);
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftState(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const el = scrollContainerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) setHasMoved(true);
    el.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  if (!vehicles || vehicles.length === 0) return null;

  return (
    <section
      aria-label="Fleet Vehicle Showroom Selector"
      className="relative w-full max-w-full overflow-hidden bg-slate-50/80 border-b border-slate-200/70 py-6 sm:py-7 px-4 sm:px-6 lg:px-8 select-none"
    >
      <div className="mx-auto max-w-6xl relative">
        {/* Category Selector Tabs */}
        {categories && categories.length > 0 && onSelectCategory && (
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-6">
            {categories.map((cat) => {
              const isCatSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onSelectCategory(cat)}
                  aria-pressed={isCatSelected}
                  className={`px-5 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                    isCatSelected
                      ? "bg-lime-500 text-slate-950 shadow-md ring-2 ring-lime-400 border border-lime-600"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-lime-400 hover:bg-lime-50/50"
                  }`}
                >
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Header: Label, Live Count & Subtle Browsing Hint */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lime-500 inline-block" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-800">
              {categoryTitle ? `${categoryTitle.toUpperCase()} FLEET` : "FLEET SHOWROOM SELECTOR"}
            </span>
            <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200/80 px-2 py-0.5 rounded-full ml-1 font-semibold">
              {currentIndex + 1} / {vehicles.length}
            </span>
          </div>

          <span className="hidden sm:inline-block text-[10.5px] font-mono text-slate-400 font-medium">
            Use arrows or drag to browse
          </span>
        </div>

        {/* Left Floating Chevron Arrow (Navigates to previous vehicle) */}
        <button
          type="button"
          onClick={handleSelectPrev}
          disabled={!canGoPrev}
          aria-label="Select previous vehicle"
          className="absolute left-0 top-[52px] sm:top-[56px] md:top-[60px] lg:top-[64px] -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 text-slate-900 border border-slate-200 shadow-md backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none cursor-pointer group -ml-2 sm:-ml-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
        >
          <ChevronLeft size={18} className="stroke-[2.5] text-slate-800 group-hover:text-slate-950" />
        </button>

        {/* Right Floating Chevron Arrow (Navigates to next vehicle) */}
        <button
          type="button"
          onClick={handleSelectNext}
          disabled={!canGoNext}
          aria-label="Select next vehicle"
          className="absolute right-0 top-[52px] sm:top-[56px] md:top-[60px] lg:top-[64px] -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 text-slate-900 border border-slate-200 shadow-md backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none cursor-pointer group -mr-2 sm:-mr-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
        >
          <ChevronRight size={18} className="stroke-[2.5] text-slate-800 group-hover:text-slate-950" />
        </button>

        {/* Horizontal Carousel Track */}
        <div
          ref={scrollContainerRef}
          role="tablist"
          aria-label="Vehicles list"
          onKeyDown={handleKeyDown}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex items-start gap-3.5 sm:gap-4 md:gap-5 lg:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          {vehicles.map((veh) => {
            const isSelected = veh.id === selectedVehicleId;
            const shortName = getShortVehicleName(veh.name);

            return (
              <button
                key={veh.id}
                type="button"
                role="tab"
                data-vehicle-selector-id={veh.id}
                onClick={() => {
                  if (!hasMoved) {
                    onSelectVehicle(veh.id);
                  }
                }}
                aria-selected={isSelected}
                aria-label={`Select ${veh.name}`}
                className="flex-none w-[28vw] min-w-[94px] max-w-[108px] sm:w-[22%] sm:min-w-[110px] sm:max-w-[128px] md:w-[18%] md:min-w-[120px] md:max-w-[138px] lg:w-[13.2%] lg:min-w-[130px] lg:max-w-[150px] snap-center flex flex-col items-center group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 rounded-2xl p-1 transition-all"
              >
                {/* 1. Circular Vehicle Image Container */}
                <VehicleThumbnailItem
                  image={veh.image}
                  name={veh.name}
                  isSelected={isSelected}
                />

                {/* 2. Short Vehicle Name Below Circle (Fixed height to guarantee horizontal alignment) */}
                <div className="mt-2 min-h-[32px] sm:min-h-[36px] flex items-center justify-center w-full px-1">
                  <span
                    className={`text-center text-xs sm:text-[13px] font-sans transition-colors leading-tight line-clamp-2 ${
                      isSelected
                        ? "font-extrabold text-slate-950"
                        : "font-medium text-slate-500 group-hover:text-slate-800"
                    }`}
                  >
                    {shortName}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
