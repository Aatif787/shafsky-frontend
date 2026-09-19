import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from "lucide-react";
import { getAirportImages } from "@/lib/airport-assets";

interface AirportMediaGalleryProps {
  airportCode: string;
  airportCity: string;
  airportName?: string;
}

export function AirportMediaGallery({
  airportCode,
  airportCity,
}: AirportMediaGalleryProps) {
  const images = getAirportImages(airportCode);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Only render dedicated gallery if the airport has multiple photos to scroll through
  if (!images || images.length <= 1) {
    return null;
  }

  // Triplicate images array to provide an uninterrupted runway for seamless infinite scrolling
  const infiniteImages = images.length > 1 ? [...images, ...images, ...images] : images;

  // Initialize scroll position to the start of the middle set (card 01)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || images.length <= 1) return;

    const timer = setTimeout(() => {
      if (scrollRef.current) {
        const singleSetWidth = scrollRef.current.scrollWidth / 3;
        scrollRef.current.scrollTo({ left: singleSetWidth, behavior: "instant" as any });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [airportCode, images.length]);

  // Handle manual swipe/drag scroll wrapping
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || images.length <= 1) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;
    const handleManualScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!scrollRef.current) return;
        const target = scrollRef.current;
        const singleSetWidth = target.scrollWidth / 3;

        if (target.scrollLeft >= singleSetWidth * 2) {
          target.scrollTo({ left: target.scrollLeft - singleSetWidth, behavior: "instant" as any });
        } else if (target.scrollLeft <= 50) {
          target.scrollTo({ left: target.scrollLeft + singleSetWidth, behavior: "instant" as any });
        }
      }, 150);
    };

    el.addEventListener("scroll", handleManualScroll, { passive: true });
    return () => {
      clearTimeout(scrollTimeout);
      el.removeEventListener("scroll", handleManualScroll);
    };
  }, [airportCode, images.length]);

  // Infinite scroll click navigation: when at the last card, the first one starts seamlessly
  const handleScroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const singleSetWidth = el.scrollWidth / 3;
    const scrollAmount = 500;

    if (direction === "right") {
      // If advancing past the middle set, silently reset before smooth scrolling
      if (el.scrollLeft >= singleSetWidth * 2 - scrollAmount) {
        el.scrollTo({ left: el.scrollLeft - singleSetWidth, behavior: "instant" as any });
        requestAnimationFrame(() => {
          el.scrollBy({ left: scrollAmount, behavior: "smooth" });
        });
      } else {
        el.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    } else {
      // If scrolling back past the start of the middle set, silently jump forward before scrolling
      if (el.scrollLeft <= singleSetWidth) {
        el.scrollTo({ left: el.scrollLeft + singleSetWidth, behavior: "instant" as any });
        requestAnimationFrame(() => {
          el.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        });
      } else {
        el.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    }
  };

  return (
    <section className="relative px-4 py-8 sm:px-8 md:px-16 max-w-[1600px] mx-auto">
      {/* Clean Scroll Controls — Infinite Loop Navigation */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <button
          type="button"
          onClick={() => handleScroll("left")}
          aria-label="Previous image"
          className="w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer bg-white border-slate-200 text-slate-800 shadow-xs hover:border-[#7c3aed] hover:text-[#7c3aed] active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleScroll("right")}
          aria-label="Next image"
          className="w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer bg-white border-slate-200 text-slate-800 shadow-xs hover:border-[#7c3aed] hover:text-[#7c3aed] active:scale-95"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Pure Crystal-Clear Scroll Snap Rail with Infinite Looping */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {infiniteImages.map((imgSrc, idx) => {
          const itemNumber = (idx % images.length) + 1;
          const formattedIndex = itemNumber < 10 ? `0${itemNumber}` : `${itemNumber}`;

          return (
            <motion.div
              key={`hub-gallery-${airportCode}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: (idx % images.length) * 0.05 }}
              className="group relative snap-start shrink-0 rounded-2xl overflow-hidden bg-white border border-slate-200/90 transition-all duration-300 hover:border-[#7c3aed]/50 hover:shadow-md w-[85vw] sm:w-[480px] lg:w-[540px] aspect-[16/10] cursor-pointer"
              onClick={() => setSelectedImage(imgSrc)}
            >
              <div className="relative w-full h-full overflow-hidden bg-slate-100">
                <img
                  src={imgSrc}
                  alt={`${airportCity} view ${formattedIndex}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />

                {/* Minimal Clean Index Pill */}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white font-mono text-[10px] font-bold tracking-wider">
                  {airportCode} · {formattedIndex}
                </span>

                {/* Minimal Expand Icon */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-75 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm cursor-pointer"
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              aria-label="Close image modal"
              className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div
              className="relative max-w-6xl max-h-[90vh] w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt={`${airportCity} preview`}
                className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/15"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
