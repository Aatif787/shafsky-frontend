import type { UrgencyLevel, VisaProcessingSLA } from "../types";
import { determineDestinationType } from "./countryRules";

/**
 * Pure frontend timing and SLA helper functions.
 */

/**
 * Calculates number of calendar days between today and intended travel date.
 */
export function calculateDaysUntilTravel(travelDate: string): number {
  if (!travelDate) return 30;
  const travel = new Date(travelDate);
  const today = new Date();
  if (isNaN(travel.getTime())) return 30;

  const diffTime = travel.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Derives urgency level based on days remaining until travel.
 */
export function calculateUrgency(travelDate: string): UrgencyLevel {
  const days = calculateDaysUntilTravel(travelDate);
  if (days <= 3) return "critical_timeline";
  if (days <= 7) return "urgent_express";
  if (days <= 14) return "priority";
  return "normal";
}

/**
 * Checks if intended travel date is dangerously close based on threshold days.
 */
export function isTravelDateClose(travelDate: string, thresholdDays: number = 7): boolean {
  return calculateDaysUntilTravel(travelDate) <= thresholdDays;
}

/**
 * Generates frontend processing SLA windows and warnings.
 */
export function evaluateProcessingSLA(
  travelDate: string,
  destinationCountry?: string
): VisaProcessingSLA {
  const daysRemaining = calculateDaysUntilTravel(travelDate);
  const level = calculateUrgency(travelDate);

  const profile = determineDestinationType(destinationCountry || "");
  const minDays = Math.max(1, Math.floor(profile.defaultProcessingDays * 0.5));
  const maxDays = profile.defaultProcessingDays;

  const today = new Date();
  const deliveryDate = new Date(today.setDate(today.getDate() + maxDays));
  const estimatedDeliveryDate = deliveryDate.toISOString().split("T")[0];

  const isExtremeUrgent = daysRemaining < minDays;

  let warningMessage: string | undefined;
  if (isExtremeUrgent) {
    warningMessage = `Departure is in ${daysRemaining} days. Processing standard embassy visas requires at least ${minDays} business days. Express handling will be assigned.`;
  } else if (level === "urgent_express") {
    warningMessage = `Express SLA assigned. Departure is within 7 days.`;
  }

  return {
    level,
    minBusinessDays: minDays,
    maxBusinessDays: maxDays,
    estimatedDeliveryDate,
    isExtremeUrgent,
    warningMessage,
  };
}
