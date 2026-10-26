import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Sparkles,
  Armchair,
  Coffee,
  Wifi,
  Moon,
} from "lucide-react";

export interface LoungeImageItem {
  id: string;
  src: string;
  title: string;
  subtitle: string;
  category: string;
  tag: string;
  description: string;
  icon: React.ReactNode;
}

export const LOUNGE_IMAGES: LoungeImageItem[] = [
  {
    id: "lounge-1",
    src: "/images/lounge/lounge1.png",
    title: "Executive First Class Lounge",
    subtitle: "Panoramic Tarmac Views & Plush Recliners",
    category: "VIP & First Class",
    tag: "Signature Space",
    description:
      "Expansive relaxation zones with bespoke designer seating, sweeping apron vistas, and attentive concierge service before your flight.",
    icon: <Armchair className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: "lounge-2",
    src: "/images/lounge/lounge2.png",
    title: "Private Rest & Wellness Pods",
    subtitle: "Secluded Comfort Between Connecting Flights",
    category: "Transit Rest Suites",
    tag: "Quiet Zone",
    description:
      "Acoustically insulated private relaxation sanctuaries featuring ambient mood lighting, fresh luxury linens, and restful climate control.",
    icon: <Moon className="w-4 h-4 text-indigo-400" />,
  },
  {
    id: "lounge-3",
    src: "/images/lounge/lounge3.png",
    title: "Executive Business Sanctuaries",
    subtitle: "High-Speed Connectivity & Meeting Alcoves",
    category: "Business Suite",
    tag: "Work & Connect",
    description:
      "Enterprise gigabit Wi-Fi, wireless charging pads, private conference pods, and ergonomic workstations tailored for executive productivity.",
    icon: <Wifi className="w-4 h-4 text-amber-400" />,
  },
  {
    id: "lounge-4",
    src: "/images/lounge/lounge4.png",
    title: "Artisanal Gourmet Dining & Bar",
    subtitle: "Chef-Curated Menus & Premium Refreshments",
    category: "Gourmet Hospitality",
    tag: "Chef Curated",
    description:
      "Continuous hot gourmet buffet, made-to-order international cuisine, specialty barista coffee, and premium beverage selections.",
    icon: <Coffee className="w-4 h-4 text-emerald-400" />,
  },
];

/**
 * 1. HERO CAROUSEL: Upper section showcase banner (Clean imagery, NO text on images)
 */
export const LoungeHeroCarousel: React.FC<{
  onOpenLightbox?: (index: number) => void;
  className?: string;
}> = ({ onOpenLightbox, className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = LOUNGE_IMAGES.length;

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [total]);

  // Auto-advance every 5.5s unless hovered
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, handleNext]);

  return (
    <div
      className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-[0_4px_24px_rgba(15,23,42,0.06)] bg-slate-950 flex flex-col justify-between group ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Lounge Images Showcase"
    >
      {/* Responsive Aspect Ratio Image Container (100% responsive across mobile, tablet, desktop) */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] lg:aspect-[2.5/1] min-h-[220px] sm:min-h-[290px] md:min-h-[360px] overflow-hidden">
        {LOUNGE_IMAGES.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex
                ? "opacity-100 z-10 pointer-events-auto"
                : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <img
              src={item.src}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
              loading={index === 0 ? "eager" : "lazy"}
            />
            {/* Note: STRICTLY NO text overlays and NO heavy dark masks on top of the image */}
          </div>
        ))}

        {/* Top-Right Fullscreen Expand Action (Pure Icon Button, Zero Text) */}
        {onOpenLightbox && (
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20">
            <button
              type="button"
              onClick={() => onOpenLightbox(currentIndex)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950/60 hover:bg-slate-950/85 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 hover:scale-105 active:scale-95 shadow-md"
              title="View Fullscreen Photo"
              aria-label="Expand image"
            >
              <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}

        {/* Navigation Arrows (Touch & Click friendly, Pure Icons, Zero Text) */}
        <div className="absolute inset-y-0 left-2.5 sm:left-4 right-2.5 sm:right-4 z-20 flex items-center justify-between pointer-events-none">
          <button
            type="button"
            onClick={handlePrev}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-950/55 hover:bg-slate-950/85 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 pointer-events-auto cursor-pointer shadow-md hover:scale-105 active:scale-95 opacity-80 sm:opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-950/55 hover:bg-slate-950/85 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 pointer-events-auto cursor-pointer shadow-md hover:scale-105 active:scale-95 opacity-80 sm:opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Next photo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Dot Indicators (Minimalist, Zero Text On Image) */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/15 pointer-events-auto">
          {LOUNGE_IMAGES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? "w-6 bg-emerald-400 shadow-xs"
                  : "w-2 bg-white/55 hover:bg-white/85"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * 2. GALLERY GRID: Mobile-first 4-image showcase below the enquiry form (Clean images, NO text on photos)
 */
export const LoungeGalleryGrid: React.FC<{
  onOpenLightbox?: (index: number) => void;
  className?: string;
}> = ({ onOpenLightbox, className = "" }) => {
  return (
    <section className={`w-full py-12 sm:py-16 ${className}`} aria-labelledby="lounge-gallery-heading">
      {/* Section Header */}
      <div className="max-w-3xl mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/90 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Curated Sanctuary</span>
        </div>
        <h2
          id="lounge-gallery-heading"
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-950 tracking-tight"
        >
          Explore Premier Airport Lounge Spaces
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          Step into serene comfort before departure or during transit. Every partner lounge is
          equipped with state-of-the-art relaxation, business connectivity, and fine dining amenities.
        </p>
      </div>

      {/* 100% Mobile-first Grid: 1 col on mobile, 2 col on tablet, 4 col on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {LOUNGE_IMAGES.map((item, index) => (
          <div
            key={item.id}
            onClick={() => onOpenLightbox && onOpenLightbox(index)}
            className="group rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.1)] transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
          >
            {/* Pure Clean Image Container (No Text Overlaid On Image) */}
            <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-slate-100">
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-106"
                loading="lazy"
              />

              {/* View Overlay Button (Icon Only, Zero Text) */}
              <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="w-8 h-8 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-md">
                  <Maximize2 className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Content Details (Cleanly Rendered Below the Image) */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700">
                    {item.category}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-3 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
                <span>View Space</span>
                <span className="text-xs transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/**
 * 3. FULLSCREEN LIGHTBOX MODAL: Keyboard-accessible (ESC, ArrowLeft, ArrowRight)
 */
export const LoungePhotoLightbox: React.FC<{
  index: number | null;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}> = ({ index, onClose, onSelectIndex }) => {
  const isOpen = index !== null;

  // Keyboard navigation listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index !== null) {
        onSelectIndex(index === 0 ? LOUNGE_IMAGES.length - 1 : index - 1);
      }
      if (e.key === "ArrowRight" && index !== null) {
        onSelectIndex(index === LOUNGE_IMAGES.length - 1 ? 0 : index + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, index, onClose, onSelectIndex]);

  if (!isOpen || index === null) return null;

  const currentItem = LOUNGE_IMAGES[index];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Lounge Image Lightbox"
    >
      {/* Top Controls Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between text-white py-2 z-10">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold tracking-wider">
            {index + 1} / {LOUNGE_IMAGES.length}
          </span>
          <span className="text-sm sm:text-base font-semibold text-white truncate max-w-xs sm:max-w-md">
            {currentItem.title}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close photo preview"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image View */}
      <div className="relative w-full max-w-6xl flex-1 flex items-center justify-center my-2 overflow-hidden">
        <img
          src={currentItem.src}
          alt={currentItem.title}
          className="max-h-[70vh] sm:max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
        />

        {/* Previous & Next Buttons */}
        <button
          type="button"
          onClick={() =>
            onSelectIndex(index === 0 ? LOUNGE_IMAGES.length - 1 : index - 1)
          }
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={() =>
            onSelectIndex(index === LOUNGE_IMAGES.length - 1 ? 0 : index + 1)
          }
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
          aria-label="Next photo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Info & Thumbnails Bar */}
      <div className="w-full max-w-4xl text-center space-y-3 z-10">
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto line-clamp-2">
          {currentItem.description}
        </p>

        {/* Thumbnails */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
          {LOUNGE_IMAGES.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => onSelectIndex(i)}
              className={`relative h-12 w-16 sm:h-14 sm:w-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                i === index
                  ? "border-emerald-400 scale-105 opacity-100 ring-2 ring-emerald-500/50"
                  : "border-white/20 opacity-50 hover:opacity-90 hover:border-white/50"
              }`}
              aria-label={`Select photo ${i + 1}`}
            >
              <img
                src={img.src}
                alt={img.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
