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
import jaiDesktop from "../assets/airports/jai/Dek-Jai_air.png";
import jaiMobile from "../assets/airports/jai/Mob-Jai-air.png";
import atqDesktop from "../assets/airports/atq/Dek-Atq-air.png";
import atqMobile from "../assets/airports/atq/Mob-Atq-air.png";
import gauDesktop from "../assets/airports/gau/Dek-Gau-air.jpg";
import gauMobile from "../assets/airports/gau/Mob-Gau-air.jpg";
import vtzDesktop from "../assets/airports/vtz/Dek-Vtz-air.jpg";
import vtzMobile from "../assets/airports/vtz/Mob-Vtz-air.jpg";
import ccuDesktop from "../assets/airports/ccu/Dek-Ccu-air.jpg";
import ccuMobile from "../assets/airports/ccu/Mob-Ccu-air.jpg";
import cokDesktop from "../assets/airports/cok/Dek-Cok-air.jpg";
import cokMobile from "../assets/airports/cok/Mob-Cok-air.jpg";
import maaDesktop from "../assets/airports/maa/Dek-Maa-air.jpg";
import maaMobile from "../assets/airports/maa/Mob-Maa-air.jpg";
import ixeDesktop from "../assets/airports/ixe/Dek-Ixe-air.jpg";
import ixeMobile from "../assets/airports/ixe/Mob-Ixe-air.jpg";
import goiDesktop from "../assets/airports/goi/Dek-Goi-air.jpg";
import goiMobile from "../assets/airports/goi/Mob-Goi-air.jpg";
import goxDesktop from "../assets/airports/gox/Dek-Gox-air.jpg";
import goxMobile from "../assets/airports/gox/Mob-Gox-air.jpg";
import bbiDesktop from "../assets/airports/bbi/Dek-Bbi-air.jpg";
import bbiMobile from "../assets/airports/bbi/Mob-Bbi-air.jpg";

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
  jai: {
    desktop: jaiDesktop,
    mobile: jaiMobile,
  },
  atq: {
    desktop: atqDesktop,
    mobile: atqMobile,
  },
  gau: {
    desktop: gauDesktop,
    mobile: gauMobile,
  },
  vtz: {
    desktop: vtzDesktop,
    mobile: vtzMobile,
  },
  ccu: {
    desktop: ccuDesktop,
    mobile: ccuMobile,
    tablet: ccuDesktop,
  },
  cok: {
    desktop: cokDesktop,
    mobile: cokMobile,
    tablet: cokDesktop,
  },
  maa: {
    desktop: maaDesktop,
    mobile: maaMobile,
    tablet: maaDesktop,
  },
  ixe: {
    desktop: ixeDesktop,
    mobile: ixeMobile,
    tablet: ixeDesktop,
  },
  goi: {
    desktop: goiDesktop,
    mobile: goiMobile,
    tablet: goiDesktop,
  },
  gox: {
    desktop: goxDesktop,
    mobile: goxMobile,
    tablet: goxDesktop,
  },
  bbi: {
    desktop: bbiDesktop,
    mobile: bbiMobile,
    tablet: bbiDesktop,
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
    return airportAssets.tablet || airportAssets.desktop;
  }

  return undefined;
}
