import type { TravelPurpose, VisaRequirementType } from "../types";
import { determineDestinationType } from "./countryRules";

/**
 * Pure helper functions for visa category derivation and requirement type detection.
 */

/**
 * Derives the official visa category code from user's travel purpose.
 * Ensures users never have to choose complex visa categories manually.
 */
export function deriveVisaCategory(travelPurpose: TravelPurpose): string {
  switch (travelPurpose) {
    case "business":
      return "business";
    case "tourism":
    case "family_visit":
      return "tourist";
    case "diplomatic":
      return "diplomatic";
    case "student":
    case "medical":
      return "student";
    case "transit":
      return "transit";
    default:
      return "tourist";
  }
}

/**
 * Determines visa requirement type based on passport country and destination country.
 */
export function determineVisaRequirementType(
  passportCountry: string,
  destinationCountry: string
): VisaRequirementType {
  const pClean = (passportCountry || "").toLowerCase().trim();
  const dClean = (destinationCountry || "").toLowerCase().trim();

  if (!dClean) return "unknown";

  // Same country -> Visa free
  if (pClean && pClean === dClean) return "visa_free";

  const profile = determineDestinationType(destinationCountry);

  if (profile.supportsEVisa) return "evisa";
  if (profile.requiresBiometrics) return "sticker";

  return "evisa";
}

/**
 * Checks if a visa is required for the specified passport + destination combination.
 */
export function isVisaRequiredForRoute(
  passportCountry: string,
  destinationCountry: string
): boolean {
  const reqType = determineVisaRequirementType(passportCountry, destinationCountry);
  return reqType !== "visa_free";
}

/**
 * Determines whether to skip full visa application workflow and offer arrival advisory instead.
 */
export function shouldSkipVisaWorkflow(
  passportCountry: string,
  destinationCountry: string
): boolean {
  const reqType = determineVisaRequirementType(passportCountry, destinationCountry);
  return reqType === "visa_free";
}
