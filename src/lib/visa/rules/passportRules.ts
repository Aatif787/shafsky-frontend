import type { PassportStatus, VisaRequirementType } from "../types";

/**
 * Pure frontend helper functions for passport validation and visibility logic.
 */

/**
 * Calculates months remaining between passport expiry and travel date.
 */
export function getPassportMonthsRemaining(expiryDate: string, travelDate: string): number {
  if (!expiryDate || !travelDate) return 12;

  const expiry = new Date(expiryDate);
  const travel = new Date(travelDate);

  if (isNaN(expiry.getTime()) || isNaN(travel.getTime())) return 12;

  const diffTime = expiry.getTime() - travel.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 30.44);
}

/**
 * Checks if passport has at least 6 months validity from travel date.
 */
export function isPassportExpiryValid(expiryDate: string, travelDate: string): boolean {
  return getPassportMonthsRemaining(expiryDate, travelDate) >= 6;
}

/**
 * Checks if passport expires within 6 months and requires renewal guidance.
 */
export function requiresPassportRenewalWarning(expiryDate: string, travelDate: string): boolean {
  const months = getPassportMonthsRemaining(expiryDate, travelDate);
  return months < 6 && months >= 0;
}

/**
 * Evaluates passport validity status object based on expiry and travel dates.
 */
export function evaluatePassportStatus(
  expiryDate?: string,
  travelDate?: string
): PassportStatus {
  if (!expiryDate || !travelDate) {
    return {
      isValid: true,
      monthsUntilExpiry: 12,
      isExpiringSoon: false,
      requiresRenewal: false,
    };
  }

  const months = getPassportMonthsRemaining(expiryDate, travelDate);
  const isValid = months >= 6;
  const isExpiringSoon = months < 9 && months >= 6;
  const requiresRenewal = months < 6;

  let warningMessage: string | undefined;
  if (requiresRenewal) {
    warningMessage = "Passport expires within 6 months of travel. Embassy regulations require renewing your passport first.";
  } else if (isExpiringSoon) {
    warningMessage = "Passport has less than 9 months validity. Consider renewing soon for seamless travel.";
  }

  return {
    isValid,
    monthsUntilExpiry: months,
    isExpiringSoon,
    requiresRenewal,
    warningMessage,
  };
}

/**
 * Determines whether passport entry fields are required for the given visa type.
 */
export function shouldShowPassportFields(visaType: VisaRequirementType): boolean {
  return visaType !== "visa_free";
}
