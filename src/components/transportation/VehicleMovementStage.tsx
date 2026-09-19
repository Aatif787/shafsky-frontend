import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { Car } from "lucide-react";
import type { TransportationVehicleItem } from "@/data/transportation";

export interface VehicleMovementStageProps {
  vehicle: TransportationVehicleItem;
  direction?: number;
}

/**
 * Directional crossfade/slide variants when user toggles between vehicles.
 */
const vehicleSwitchVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "14vw" : dir < 0 ? "-14vw" : "0vw",
    opacity: dir === 0 ? 1 : 0,
    scale: 1,
  }),
  center: {
    x: "0vw",
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 160, damping: 24, mass: 0.8 },
      opacity: { duration: 0.22 },
    },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-14vw" : "14vw",
    opacity: 0,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 160, damping: 24, mass: 0.8 },
      opacity: { duration: 0.18 },
    },
  }),
};

/**
 * Dedicated visual cinematic vehicle scroll-animated stage.
 * Features:
 * - True scroll-linked automotive entrance (Scroll down -> vehicle drives in, Scroll up -> smoothly reverses).
 * - Focus is 100% on the vehicle with ZERO text overlays.
 * - Respects prefers-reduced-motion.
 * - Standardized 2:1 geometry grounded on VIP tarmac runway.
 * - Does not hijack page scroll.
 */
export const VehicleMovementStage: React.FC<VehicleMovementStageProps> = ({
  vehicle,
  direction = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [imgError, setImgError] = useState(false);

  // Reset image error whenever the active vehicle changes
  useEffect(() => {
    setImgError(false);
  }, [vehicle.id]);

  // True scroll-linked animation as the stage moves from entering the viewport to centered
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"],
  });

  // Smooth transform-based entrance from right to center
  // 0% -> starts outside/partially outside (40vw)
  // 50% -> smoothly drives into scene (15vw)
  // 100% -> arrives at final presentation center (0vw)
  const scrollX = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["40vw", "15vw", "0vw"]
  );

  const scrollOpacity = useTransform(
    scrollYProgress,
    [0, 0.25, 1],
    [0.15, 0.7, 1]
  );

  const hasValidImage = Boolean(vehicle.image && !imgError);

  return (
    <div
      ref={containerRef}
      aria-label={`${vehicle.name} Cinematic Presentation`}
      className="relative w-full max-w-full overflow-hidden bg-gradient-to-b from-slate-100/90 via-slate-50/70 to-white border-b border-slate-200/80 py-10 sm:py-14 lg:py-18 px-4 sm:px-6 select-none"
    >
      {/* Background VIP Tarmac Runway & Horizon Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Horizon Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(241,245,249,0.95)_0%,rgba(255,255,255,0)_72%)]" />

        {/* Tarmac Ground Plane: Aligned with the 82% baseline of the 2:1 vehicle image */}
        <div className="absolute bottom-0 left-0 right-0 h-[24%] sm:h-[26%] bg-gradient-to-t from-slate-200/50 via-slate-100/30 to-transparent border-t border-slate-200/70">
          {/* VIP Runway Guidance Line */}
          <div className="absolute top-0 left-0 right-0 h-px border-t border-dashed border-slate-300/60" />

          {/* Synchronized Ground Ambient Reflection / Contact Glow */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4/5 max-w-2xl h-12 bg-slate-950/[0.04] blur-xl rounded-full pointer-events-none" />
        </div>
      </div>

      {/* Cinematic Vehicle Stage Area (Zero text overlays, pure vehicle focus) */}
      <div className="relative mx-auto w-full max-w-5xl aspect-[2/1] flex items-center justify-center">
        {/* Scroll-driven motion wrapper (Reverses naturally on scroll-up) */}
        <motion.div
          style={{
            x: reduceMotion ? "0vw" : scrollX,
            opacity: reduceMotion ? 1 : scrollOpacity,
          }}
          className="w-full h-full flex items-center justify-center will-change-transform"
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={vehicle.id}
              custom={direction}
              variants={
                reduceMotion
                  ? { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } }
                  : vehicleSwitchVariants
              }
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full h-full flex items-center justify-center select-none"
            >
              {hasValidImage ? (
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-contain block pointer-events-none drop-shadow-xs"
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-slate-400 max-w-md mx-auto text-center px-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/95 border border-slate-200/90 shadow-2xs flex items-center justify-center mb-3">
                    <Car size={34} className="text-slate-400 stroke-[1.5]" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100/90 border border-slate-200 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10.5px] font-mono font-semibold uppercase tracking-wider text-slate-600">
                      Vehicle Imagery In Preparation
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight mb-1">
                    {vehicle.name}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    Verified canonical fleet specifications and tariff schedule available below.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
