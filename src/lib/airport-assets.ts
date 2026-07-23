import delDesktop from "../assets/airports/del/Dek-Del-air.png";
import delMobile from "../assets/airports/del/Mob-Del-air.png";
import hydDesktop from "../assets/airports/hyd/Dek-Hyd-air.png";
import hydMobile from "../assets/airports/hyd/Mob-Hyd-air.png";
import lkoDesktop from "../assets/airports/lko/Dek-lko-air.png";
import lkoMobile from "../assets/airports/lko/Mob-lko-air.png";
import lkoTablet from "../assets/airports/lko/lko-tab-air.jpg";
import amdDesktop from "../assets/airports/amd/Dek-Amd-air.png";
import amdMobile from "../assets/airports/amd/Mob-Amd-air.png";
import bomDesktop from "../assets/airports/bom/Dek-mum-air.png";
import bomMobile from "../assets/airports/bom/Dek-mum-air.png";
import ixrDesktop from "../assets/airports/ixr/Dek-Ran-air.png";
import ixrMobile from "../assets/airports/ixr/Mob-Ran-air.png";

const ASSETS_MAP: Record<string, { desktop?: string; mobile?: string; tablet?: string }> = {
  del: {
    desktop: delDesktop,
    mobile: delMobile,
  },
  hyd: {
    desktop: hydDesktop,
    mobile: hydMobile,
  },
  lko: {
    desktop: lkoDesktop,
    mobile: lkoMobile,
    tablet: lkoTablet,
  },
  amd: {
    desktop: amdDesktop,
    mobile: amdMobile,
  },
  bom: {
    desktop: bomDesktop,
    mobile: bomMobile,
  },
  ixr: {
    desktop: ixrDesktop,
    mobile: ixrMobile,
  },
};

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
    return airportAssets.tablet;
  }

  return undefined;
}
