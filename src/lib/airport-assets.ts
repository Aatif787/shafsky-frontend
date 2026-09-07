import { ASSETS } from "./assets";

/**
 * Curated high-resolution image galleries for all serviceable airports.
 * Airports with multiple images have all views listed in display order.
 */
export const AIRPORT_IMAGES_MAP: Record<string, string[]> = {
  amd: ["/images/airports/amd/clean-1.webp"],
  atq: ["/images/airports/atq/clean-1.webp", "/images/airports/atq/clean-2.webp"],
  bbi: ["/images/airports/bbi/clean-1.webp", "/images/airports/bbi/clean-2.webp"],
  blr: [
    "/images/airports/blr/clean-1.webp",
    "/images/airports/blr/clean-2.webp",
    "/images/airports/blr/clean-3.webp",
    "/images/airports/blr/clean-4.webp",
  ],
  bom: ["/images/airports/bom/clean-1.webp"],
  ccu: ["/images/airports/ccu/clean-1.webp"],
  cok: ["/images/airports/cok/clean-1.webp"],
  del: [
    "/images/airports/del/clean-2.webp",
    "/images/airports/del/clean-1.webp",
    "/images/airports/del/clean-3.webp",
    "/images/airports/del/clean-4.webp",
    "/images/airports/del/clean-5.webp",
    "/images/airports/del/clean-6.webp",
    "/images/airports/del/clean-7.webp",
  ],
  gau: ["/images/airports/gau/clean-1.webp"],
  goi: ["/images/airports/goi/clean-1.webp"],
  gox: [
    "/images/airports/gox/clean-1.webp",
    "/images/airports/gox/clean-3.webp",
    "/images/airports/gox/clean-2.webp",
  ],
  hyd: ["/images/airports/hyd/clean-1.webp"],
  ixc: ["/images/airports/ixc/clean-2.webp", "/images/airports/ixc/clean-1.webp"],
  ixe: ["/images/airports/ixe/clean-1.webp"],
  ixr: ["/images/airports/ixr/clean-1.webp"],
  jai: [
    "/images/airports/jai/clean-2.webp",
    "/images/airports/jai/clean-1.webp",
    "/images/airports/jai/clean-3.webp",
  ],
  lko: ["/images/airports/lko/clean-1.webp"],
  maa: ["/images/airports/maa/clean-1.webp"],
  trv: ["/images/airports/trv/clean-1.webp"],
  vtz: ["/images/airports/vtz/clean-1.webp"],
};

const ASSETS_MAP: Record<string, { desktop?: string; mobile?: string; tablet?: string }> = {
  ixc: { desktop: ASSETS.ixc, mobile: ASSETS.ixc, tablet: ASSETS.ixc },
  blr: { desktop: ASSETS.blr, mobile: ASSETS.blr, tablet: ASSETS.blr },
  del: { desktop: ASSETS.del, mobile: ASSETS.del, tablet: ASSETS.del },
  hyd: { desktop: ASSETS.hyd, mobile: ASSETS.hyd, tablet: ASSETS.hyd },
  lko: { desktop: ASSETS.lko, mobile: ASSETS.lko, tablet: ASSETS.lko },
  amd: { desktop: ASSETS.amd, mobile: ASSETS.amd, tablet: ASSETS.amd },
  bom: { desktop: ASSETS.bom, mobile: ASSETS.bom, tablet: ASSETS.bom },
  ixr: { desktop: ASSETS.ixr, mobile: ASSETS.ixr, tablet: ASSETS.ixr },
  jai: { desktop: ASSETS.jai, mobile: ASSETS.jai, tablet: ASSETS.jai },
  atq: {
    desktop: "/images/airports/atq/hero-desktop.webp",
    mobile: "/images/airports/atq/hero-mobile.webp",
    tablet: "/images/airports/atq/hero-tablet.webp",
  },
  gau: { desktop: ASSETS.gau, mobile: ASSETS.gau, tablet: ASSETS.gau },
  vtz: { desktop: ASSETS.vtz, mobile: ASSETS.vtz, tablet: ASSETS.vtz },
  ccu: { desktop: ASSETS.ccu, mobile: ASSETS.ccu, tablet: ASSETS.ccu },
  cok: { desktop: ASSETS.cok, mobile: ASSETS.cok, tablet: ASSETS.cok },
  maa: { desktop: ASSETS.maa, mobile: ASSETS.maa, tablet: ASSETS.maa },
  ixe: { desktop: ASSETS.ixe, mobile: ASSETS.ixe, tablet: ASSETS.ixe },
  goi: { desktop: ASSETS.goi, mobile: ASSETS.goi, tablet: ASSETS.goi },
  gox: { desktop: ASSETS.gox, mobile: ASSETS.gox, tablet: ASSETS.gox },
  bbi: { desktop: ASSETS.bbi, mobile: ASSETS.bbi, tablet: ASSETS.bbi },
  trv: { desktop: ASSETS.trv, mobile: ASSETS.trv, tablet: ASSETS.trv },
};

/**
 * Returns all verified, high-resolution imagery for a specific airport code.
 */
export function getAirportImages(airportCode: string): string[] {
  if (!airportCode) return [];
  const normalized = airportCode.trim().toLowerCase();
  const images = AIRPORT_IMAGES_MAP[normalized];
  if (images && images.length > 0) {
    return images;
  }
  const fallback = ASSETS_MAP[normalized]?.desktop;
  return fallback ? [fallback] : [];
}

/**
 * Returns terminal-specific imagery for the airport top hero / landing banner,
 * ensuring city landmarks (like Bangalore Palace) are excluded from the airport hero.
 */
export function getAirportHeroImages(airportCode: string): string[] {
  if (!airportCode) return [];
  const normalized = airportCode.trim().toLowerCase();
  const allImages = getAirportImages(airportCode);
  if (normalized === "blr") {
    // Exclude tourist landmarks (clean-3 Bangalore Palace, clean-4 Vidhana Soudha) from BLR airport hero banner
    return allImages.filter((img) => !img.includes("clean-3") && !img.includes("clean-4"));
  }
  if (normalized === "del") {
    // Exclude tourist landmarks (clean-3 India Gate, clean-4 Red Fort, clean-5 Qutub Minar, clean-6 Lotus Temple, clean-7 Jama Masjid) from DEL airport hero banner
    return allImages.filter(
      (img) =>
        !img.includes("clean-3") &&
        !img.includes("clean-4") &&
        !img.includes("clean-5") &&
        !img.includes("clean-6") &&
        !img.includes("clean-7")
    );
  }
  return allImages;
}

/**
 * Returns the primary high-resolution cover image for an airport code.
 */
export function getAirportPrimaryImage(airportCode: string): string {
  const images = getAirportImages(airportCode);
  return images[0] || ASSETS.del;
}

/**
 * Dynamically resolves the URL of an airport asset based on the airport code and filename.
 * Supports any naming convention (e.g. Dek-*, Mob-*, etc.).
 *
 * @param airportCode - The 3-letter airport code (e.g., 'del', 'bom')
 * @param filename - The exact name of the file (e.g., 'hero-desktop.webp')
 * @returns The resolved assets URL or undefined if not found
 */
export function getAirportAsset(airportCode: string, filename: string): string | undefined {
  if (!airportCode || !filename) return undefined;

  const normalizedCode = airportCode.trim().toLowerCase();
  const normalizedFile = filename.trim().toLowerCase();

  const airportAssets = ASSETS_MAP[normalizedCode];
  if (!airportAssets) return undefined;

  if (normalizedFile.includes("desktop")) {
    return airportAssets.desktop;
  }
  if (normalizedFile.includes("mobile")) {
    return airportAssets.mobile;
  }
  if (normalizedFile.includes("tablet")) {
    return airportAssets.tablet || airportAssets.desktop;
  }

  return airportAssets.desktop;
}

