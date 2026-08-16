import React from "react";
import { getAirportAsset } from "@/lib/airport-assets";

interface ResponsiveAirportHeroProps {
  code: string;
  alt?: string;
  className?: string;
  lazy?: boolean;
  fallbackImage?: string;
}

/**
 * ResponsiveAirportHero Component
 * Uses the HTML <picture> element to serve device-specific optimized images.
 * - Desktop: hero-desktop.webp (maps to Dek-*)
 * - Tablet: hero-tablet.webp (maps to *-tab-*, falling back to fallbackImage)
 * - Mobile: hero-mobile.webp (maps to Mob-*)
 *
 * Ensures that desktop assets are never downloaded on mobile devices.
 */
export function ResponsiveAirportHero({
  code,
  alt = "Premium Airport Tarmac & Terminal View",
  className = "h-full w-full object-cover",
  lazy = false,
  fallbackImage,
}: ResponsiveAirportHeroProps) {
  // Resolve image versions from assets folders
  const webpDesktop = getAirportAsset(code, "hero-desktop.webp");
  const webpTablet = getAirportAsset(code, "hero-tablet.webp");
  const webpMobile = getAirportAsset(code, "hero-mobile.webp");

  // If no dynamic hero assets are uploaded yet, return null so the parent can fall back
  if (!webpDesktop && !webpMobile && !webpTablet) {
    return null;
  }

  return (
    <picture className="w-full h-full block">
      {/* Mobile source (only active under 640px) */}
      <source media="(max-width: 639px)" srcSet={webpMobile || fallbackImage} />
      {/* Tablet source (only active between 640px and 1023px) */}
      <source
        media="(min-width: 640px) and (max-width: 1023px)"
        srcSet={webpTablet || webpDesktop || fallbackImage}
      />
      {/* Desktop source (only active above 1024px) */}
      <source media="(min-width: 1024px)" srcSet={webpDesktop || fallbackImage} />

      {/* Default fallback img */}
      <img
        src={webpDesktop || fallbackImage}
        alt={alt}
        className={className}
        loading={lazy ? "lazy" : "eager"}
        decoding="async"
      />
    </picture>
  );
}
