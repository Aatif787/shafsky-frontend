import type { DestinationProfile, VisaRequirementType } from "../types";

/**
 * Pure destination-based frontend rule logic.
 * Extensible structure for future country metadata without hardcoding UI logic.
 */

/**
 * Determines regional profile and biometric requirements for a destination country.
 */
export function determineDestinationType(destinationCountry: string): DestinationProfile {
  const destClean = (destinationCountry || "").toLowerCase().trim();

  // Known Schengen / European destinations requiring biometrics
  const schengenKeywords = [
    "france", "germany", "italy", "spain", "switzerland", "netherlands",
    "austria", "belgium", "greece", "portugal", "sweden", "norway", "schengen",
  ];

  const isSchengen = schengenKeywords.some((kw) => destClean.includes(kw));

  if (isSchengen) {
    return {
      region: "Schengen Zone",
      requiresBiometrics: true,
      supportsEVisa: false,
      defaultProcessingDays: 15,
    };
  }

  // Gulf / Middle East destinations
  const gccKeywords = ["uae", "dubai", "abu dhabi", "saudi", "qatar", "oman", "bahrain", "kuwait"];
  const isGCC = gccKeywords.some((kw) => destClean.includes(kw));

  if (isGCC) {
    return {
      region: "GCC / Middle East",
      requiresBiometrics: false,
      supportsEVisa: true,
      defaultProcessingDays: 3,
    };
  }

  // North America
  if (destClean.includes("usa") || destClean.includes("united states") || destClean.includes("canada")) {
    return {
      region: "North America",
      requiresBiometrics: true,
      supportsEVisa: false,
      defaultProcessingDays: 20,
    };
  }

  // Default fallback for international destinations
  return {
    region: "International",
    requiresBiometrics: false,
    supportsEVisa: true,
    defaultProcessingDays: 7,
  };
}

/**
 * Checks if residence country questions should be shown when passport differs from current residence.
 */
export function shouldShowResidenceQuestion(passportCountry: string, destinationCountry: string): boolean {
  if (!passportCountry || !destinationCountry) return false;
  return passportCountry.toLowerCase() !== destinationCountry.toLowerCase();
}

/**
 * Checks if the destination country requires connecting transit visa analysis.
 */
export function supportsTransitRoute(destinationCountry: string): boolean {
  const profile = determineDestinationType(destinationCountry);
  return profile.region === "Schengen Zone" || profile.region === "North America";
}

/**
 * Determines whether biometric appointment city selection should be presented to user.
 */
export function shouldShowBiometricCity(
  destinationCountry: string,
  visaType: VisaRequirementType
): boolean {
  if (visaType !== "sticker") return false;
  const profile = determineDestinationType(destinationCountry);
  return profile.requiresBiometrics;
}
