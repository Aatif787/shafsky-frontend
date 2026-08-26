/**
 * Canonical Domain Types for Services, Packages, and Workflows
 * (Shafsky Aviation Services Architecture - Phase 1 Foundation)
 */

export enum ServiceId {
  MEET_GREET = "MEET_GREET",
  LOUNGE = "LOUNGE",
  FAST_TRACK = "FAST_TRACK",
  TRANSFER = "TRANSFER",
  HOTEL = "HOTEL",
  VISA = "VISA",
  TICKETING = "TICKETING",
  MEALS = "MEALS",
  CARGO = "CARGO",
  MEDICAL = "MEDICAL",
}

export enum AirportPackageId {
  BRONZE = "BRONZE",
  SILVER = "SILVER",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM",
}

export enum WorkflowType {
  AIRPORT = "AIRPORT",
  CHARTER = "CHARTER",
  TICKETING = "TICKETING",
  VISA = "VISA",
  TRAVEL = "TRAVEL",
}

export interface CanonicalServiceDescriptor {
  id: ServiceId;
  code: string;
  name: string;
  category: "airport" | "travel" | "cargo" | "medical" | "aviation";
  requiresFlight: boolean;
  requiresPassengers: boolean;
  requiresTransfer: boolean;
  requiresHotel: boolean;
  requiresVisa: boolean;
}

export interface CanonicalAirportPackage {
  id: AirportPackageId;
  code: string;
  name: string;
  tagline: string;
  description: string;
  badge?: string;
  estPriceINR: number;
  includedServices: ServiceId[];
  features: string[];
  sortOrder: number;
}

/**
 * Explicit Normalization Dictionary for Legacy Identifiers
 * Prevents fuzzy string matching (e.g. contains("meet"), contains("greet")) across components.
 */
export const LEGACY_ID_NORMALIZATION_MAP: Record<string, ServiceId | AirportPackageId> = {
  // Master Packages
  bronze: AirportPackageId.BRONZE,
  bronze_package: AirportPackageId.BRONZE,
  silver: AirportPackageId.SILVER,
  silver_escort: AirportPackageId.SILVER,
  silver_escort_package: AirportPackageId.SILVER,
  gold: AirportPackageId.GOLD,
  gold_vip: AirportPackageId.GOLD,
  gold_vip_sanctuary: AirportPackageId.GOLD,
  platinum: AirportPackageId.PLATINUM,
  platinum_royal: AirportPackageId.PLATINUM,
  platinum_royal_suite: AirportPackageId.PLATINUM,

  // Services
  meet: ServiceId.MEET_GREET,
  greet: ServiceId.MEET_GREET,
  meet_greet: ServiceId.MEET_GREET,
  meet_and_greet: ServiceId.MEET_GREET,
  lounge: ServiceId.LOUNGE,
  vip_lounge: ServiceId.LOUNGE,
  lounge_access: ServiceId.LOUNGE,
  fast_track: ServiceId.FAST_TRACK,
  immigration: ServiceId.FAST_TRACK,
  transfer: ServiceId.TRANSFER,
  airport_transfer: ServiceId.TRANSFER,
  chauffeur: ServiceId.TRANSFER,
  hotel: ServiceId.HOTEL,
  visa: ServiceId.VISA,
  ticketing: ServiceId.TICKETING,
  air_ticketing: ServiceId.TICKETING,
  cargo: ServiceId.CARGO,
  medical: ServiceId.MEDICAL,
};

/**
 * Normalizes any string ID or alias to a canonical ServiceId or AirportPackageId
 */
export function normalizeCatalogId(rawId: string): ServiceId | AirportPackageId | string {
  if (!rawId) return rawId;
  const key = rawId.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return LEGACY_ID_NORMALIZATION_MAP[key] || rawId;
}
