import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import planeImg from "@/assets/assets/plane.png";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function HeroAircraft() {
  const containerRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLImageElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const plane = planeRef.current;
    const container = containerRef.current;
    const aura = auraRef.current;
    if (!plane || !container) return;

    const ctx = gsap.context(() => {
      // 1. Initial State: Ultra-smooth GPU layer promotion
      gsap.set(plane, {
        autoAlpha: 0,
        x: 550,
        y: -40,
        rotation: -4,
        scaleX: -1, // Facing Left
        scaleY: 1,
        force3D: true,
        transformOrigin: "center center",
      });

      if (aura) {
        gsap.set(aura, { autoAlpha: 0, scale: 0.8 });
      }

      // 2. Super Super Smooth Entry Fly-In: 3.4s power2.out silk-smooth deceleration
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: "top+=10px top", // Triggers on scroll start
          once: true,
        },
      });

      scrollTl.to(plane, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        rotation: 0,
        duration: 3.4,
        ease: "power2.out",
        onComplete: () => {
          // 3. Gentle Idle Floating & Subtle Roll
          gsap.to(plane, {
            y: "-=3",
            duration: 3.0,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });

          gsap.to(plane, {
            rotation: -1.5,
            duration: 3.8,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Hover & Cursor Effects triggered when mouse is ON the plane
  const handleMouseEnter = () => {
    setIsHovered(true);
    const plane = planeRef.current;
    const aura = auraRef.current;
    if (!plane) return;

    // Shift plane upward on hover
    gsap.to(plane, {
      y: -14,
      scaleX: -1.05,
      scaleY: 1.05,
      rotationZ: -2,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });

    if (aura) {
      gsap.to(aura, {
        autoAlpha: 0.8,
        scale: 1.15,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const plane = planeRef.current;
    if (!plane) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const normX = x / (rect.width / 2);
    const normY = y / (rect.height / 2);

    gsap.to(plane, {
      rotationY: normX * -12,
      rotationX: -normY * 10,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    const plane = planeRef.current;
    const aura = auraRef.current;
    if (!plane) return;

    gsap.to(plane, {
      y: 0,
      scaleX: -1,
      scaleY: 1,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      duration: 0.8,
      ease: "power2.out",
      overwrite: "auto",
    });

    if (aura) {
      gsap.to(aura, {
        autoAlpha: 0,
        scale: 0.8,
        duration: 0.6,
        ease: "power2.out",
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute right-2 sm:right-6 md:right-10 lg:right-14 top-[-60px] sm:top-[-85px] md:top-[-125px] lg:top-[-155px] z-30 w-[170px] sm:w-[270px] md:w-[390px] lg:w-[490px] max-w-[80vw]"
      style={{ perspective: 1200 }}
    >
      {/* Interactive Aircraft Container (captures cursor when ON the plane) */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-full pointer-events-none cursor-pointer group"
      >
        {/* Glow Aura activated on plane hover */}
        <div
          ref={auraRef}
          className="absolute inset-0 -m-6 rounded-full bg-gradient-to-tr from-[#84cc16]/20 via-[#ff6b00]/15 to-transparent blur-xl pointer-events-none"
          style={{ opacity: 0 }}
        />

        {/* Aircraft Image - Positioned higher, hardware accelerated for 60 FPS */}
        <img
          ref={planeRef}
          src={planeImg}
          alt="Shafsky Aviation Airliner"
          loading="eager"
          decoding="async"
          width={600}
          height={340}
          className="w-full h-auto object-contain will-change-transform drop-shadow-[0_20px_35px_rgba(0,0,0,0.25)]"
          style={{
            opacity: 0,
            visibility: "hidden",
            transform: "scaleX(-1) translate3d(550px, -40px, 0)",
            backfaceVisibility: "hidden",
            transformStyle: "preserve-3d",
          }}
        />
      </div>
    </div>
  );
}
