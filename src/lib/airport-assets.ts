import { ASSETS } from "./assets";

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
  atq: { desktop: ASSETS.atq, mobile: ASSETS.atq, tablet: ASSETS.atq },
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
