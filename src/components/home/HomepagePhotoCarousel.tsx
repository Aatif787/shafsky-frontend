import React, { useEffect, useRef } from "react";
import { HOMEPAGE_PHOTOS } from "@/lib/homepage-photos";
import { EditorialPhoto } from "./EditorialPhoto";

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
    id: "charter",
    photo: HOMEPAGE_PHOTOS.privateCharter,
  },
  {
    id: "transport",
    photo: HOMEPAGE_PHOTOS.luxuryFleet,
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
    id: "transit",
    photo: HOMEPAGE_PHOTOS.transitComfort,
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

    let lastScrollLeft = -1;

    const autoScrollTimer = setInterval(() => {
      if (isHovered || !el) return;

      const maxScroll = el.scrollWidth - el.clientWidth;

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
  const INFINITE_PHOTOS = [...ALL_HOMEPAGE_PHOTOS, ...ALL_HOMEPAGE_PHOTOS, ...ALL_HOMEPAGE_PHOTOS];

  return (
    <div className="w-full relative">
      {/* 3 Photos Align Horizontally in a Row with Strict ZERO CROP / Complete Composition */}
      <div
        ref={containerRef}
        // Removed scroll-smooth from here so we can control instant jumps in JS
        className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory py-4 px-4 sm:px-8 md:px-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: "x mandatory",
        }}
      >
        {INFINITE_PHOTOS.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="snap-center shrink-0 rounded-2xl sm:rounded-3xl border-2 border-[#84cc16]/30 bg-transparent overflow-hidden shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] hover:border-[#84cc16] hover:shadow-[0_14px_40px_-5px_rgba(132,204,22,0.25)] transition-all duration-300"
            style={{
              // Drive the container strictly by height and exact image aspect ratio.
              // This guarantees ZERO black borders and ZERO cropping.
              // Increasing height automatically increases width proportionally.
              height: "clamp(320px, 42vw, 500px)",
              aspectRatio: item.photo.aspectRatio,
              maxWidth: "85vw", // On small screens, if width is capped, height shrinks proportionally
            }}
          >
            {/* Pure Uncropped Authentic Photograph */}
            <div className="w-full h-full bg-white/5">
              <EditorialPhoto
                src={item.photo.src}
                alt={item.photo.alt}
                width={item.photo.width}
                height={item.photo.height}
                aspectRatio={item.photo.aspectRatio}
                priority={idx < 4} // Eager load first visible images
                objectFit="contain" // Guarantees 100% complete original composition
                containerBg="bg-transparent"
                className="w-full h-full"
                imageClassName="w-full h-full object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomepagePhotoCarousel;
