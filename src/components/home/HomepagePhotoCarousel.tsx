import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { HOMEPAGE_PHOTOS } from "@/lib/homepage-photos";
import { EditorialPhoto } from "./EditorialPhoto";
import { ICICI_REVIEW_MODE } from "@/lib/config/reviewMode";

// All 13 authentic Shafsky Aviation photos in deliberate order with GREET photo in the middle
const ALL_HOMEPAGE_PHOTOS = [
  {
    id: "jet",
    photo: HOMEPAGE_PHOTOS.heroJet,
  },
  {
    id: "greet",
    photo: HOMEPAGE_PHOTOS.suswagatamHostess,
  },
  {
    id: "charter",
    photo: HOMEPAGE_PHOTOS.privateCharter,
  },
  {
    id: "transport",
    photo: HOMEPAGE_PHOTOS.luxuryFleet,
  },
  {
    id: "transit",
    photo: HOMEPAGE_PHOTOS.transitComfort,
  },
  {
    id: "vvip",
    photo: HOMEPAGE_PHOTOS.vvipTerminal,
  },
  {
    id: "meet",
    photo: HOMEPAGE_PHOTOS.meetGreetEscort,
  },
  {
    id: "lounge",
    photo: HOMEPAGE_PHOTOS.vvipLounge,
  },
  {
    id: "buggy",
    photo: HOMEPAGE_PHOTOS.airsideBuggy,
  },
  {
    id: "wheelchair",
    photo: HOMEPAGE_PHOTOS.specialAssistance,
  },
  {
    id: "dutyfree",
    photo: HOMEPAGE_PHOTOS.dutyFreeShopping,
  },
  {
    id: "hotel",
    photo: HOMEPAGE_PHOTOS.luxuryHotel,
  },
  {
    id: "wedding",
    photo: HOMEPAGE_PHOTOS.destinationCelebration,
  },
];

const REVIEW_MODE_PHOTO_IDS = new Set([
  "greet",
  "transit",
  "vvip",
  "meet",
  "lounge",
  "buggy",
  "wheelchair",
  "dutyfree",
]);

const ACTIVE_HOMEPAGE_PHOTOS = ICICI_REVIEW_MODE
  ? ALL_HOMEPAGE_PHOTOS.filter((p) => REVIEW_MODE_PHOTO_IDS.has(p.id))
  : ALL_HOMEPAGE_PHOTOS;

export function HomepagePhotoCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth Auto-scroll mechanism
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let isHovered = false;

    const handleMouseEnter = () => {
      isHovered = true;
    };
    const handleMouseLeave = () => {
      isHovered = false;
    };

    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);

    const autoScrollTimer = setInterval(() => {
      if (isHovered || !el) return;

      // If we've scrolled past the first set of photos, instantly jump back to the exact
      // same visual position in the first set to create an infinite loop.
      // Since we triplicated the array, dividing scrollWidth by 3 gives one set's width.
      const singleSetWidth = el.scrollWidth / 3;

      if (el.scrollLeft > singleSetWidth * 1.5) {
        // Instantly jump back without smooth scrolling
        el.scrollTo({ left: el.scrollLeft - singleSetWidth, behavior: "instant" as any });

        // Wait a tiny bit for the jump to register, then do the smooth scroll step
        setTimeout(() => {
          el.scrollBy({ left: 450, behavior: "smooth" });
        }, 50);
      } else {
        // Normal smooth scroll forward
        el.scrollBy({ left: 450, behavior: "smooth" });
      }
    }, 3600);

    return () => {
      clearInterval(autoScrollTimer);
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Triplicate the photos array to create a massive runway for the infinite loop
  const INFINITE_PHOTOS = [...ACTIVE_HOMEPAGE_PHOTOS, ...ACTIVE_HOMEPAGE_PHOTOS, ...ACTIVE_HOMEPAGE_PHOTOS];

  return (
    <div className="w-full relative">
      {/* 3 Photos Align Horizontally in a Row with Strict ZERO CROP / Complete Composition */}
      <div
        ref={containerRef}
        // Removed scroll-smooth from here so we can control instant jumps in JS
        className="flex items-center gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory py-4 px-4 sm:px-8 md:px-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: "x mandatory",
        }}
      >
        {INFINITE_PHOTOS.map((item, idx) => (
          <motion.div
            key={`${item.id}-${idx}`}
            className="homepage-carousel-card shine-card snap-center shrink-0 rounded-2xl sm:rounded-3xl border-2 border-[#84cc16]/30 bg-transparent overflow-hidden shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] hover:border-[#84cc16] hover:shadow-[0_14px_40px_-5px_rgba(132,204,22,0.25)] transition-shadow duration-300"
            style={{
              aspectRatio: "16 / 9",
            }}
            initial={idx < 8 ? { opacity: 0, y: 18 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: Math.min(idx, 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -8, scale: 1.025 }}
          >
            {/* Pure Uncropped Authentic Photograph — 16:9 Widescreen Harmony */}
            <div className="w-full h-full bg-slate-950/20">
              <EditorialPhoto
                src={item.photo.src}
                alt={item.photo.alt}
                width={item.photo.width}
                height={item.photo.height}
                aspectRatio="16 / 9"
                priority={idx < 4} // Eager load first visible images
                objectFit="cover" // 100% flush fit with matching 16:9 aspect ratio
                containerBg="bg-transparent"
                className="w-full h-full"
                imageClassName="w-full h-full object-cover transition-transform duration-700"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default HomepagePhotoCarousel;
