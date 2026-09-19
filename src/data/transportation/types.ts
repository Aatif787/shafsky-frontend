/**
 * Transportation Fleet Data Model, Canonical Vehicle Catalog & Verified Provider Rates
 * Sourced from Shafsky Aviation and Verified Delhi/NCR Provider Rate Sheets:
 * - Victoria Car Rental Pvt. Ltd.
 * - Traveller Punia (Traveleez Punia)
 * - Sidhant (Sedhant)
 * - RWTI (Royal World Travel, India)
 * - Mega Cab
 */

/**
 * Category identifiers for the transport fleet options.
 */
export type TransportOptionId =
  | "Luxury Vehicles"
  | "MUV / Large Vehicles"
  | "Economy / Standard";

/**
 * Recognized fleet providers explicitly identified in the rate documentation.
 */
export type TransportProviderName =
  | "Victoria Car Rental"
  | "Traveller Punia"
  | "Sidhant"
  | "RWTI"
  | "Mega Cab";

/**
 * Explicit rate package details from a provider's tariff sheet.
 * All fields are optional to strictly reflect only the rates explicitly printed.
 */
export interface ProviderRateDetails {
  local4h40km?: number; // 4 Hours & 40 KM / Arrival Departure transfer package (INR)
  local8h80km?: number; // 8 Hours & 80 KM / Full Day Local city run (INR)
  local12h120km?: number; // 12 Hours & 120 KM package (e.g. Sidhant) (INR)
  extraKmRate?: number; // Rate per extra kilometer (INR / km)
  extraHrRate?: number; // Rate per extra hour (INR / hr)
  nightCharges?: number; // Local Night Charge (e.g. 22:00-06:00) (INR)
  outstationPerKm?: number; // Outstation rate per kilometer (INR / km)
  outstationMinKmPerDay?: number; // Minimum average outstation km per day (typically 250 km)
  outstationDayAllowance?: number; // Driver DA / TA or day allowance (INR / day)
  currency?: string; // Currency code, default "INR"
  notes?: string;
}

/**
 * Record linking a vehicle to an explicit provider rate card from the source document.
 */
export interface VehicleProviderEntry {
  provider: TransportProviderName;
  rawVehicleName?: string;
  rates?: ProviderRateDetails;
  pricing?: ProviderRateDetails; // Backwards-compatible alias
  notes?: string;
}

/**
 * Future-ready general pricing structure definition.
 */
export interface VehiclePricing {
  airportTransfer?: number | string;
  hourlyDisposal?: number | string;
  perKmRate?: number | string;
  currency?: string;
  minimumHours?: number;
  notes?: string;
}

/**
 * Canonical data model interface for an individual transportation vehicle item.
 * Supports upcoming vehicle showcase, specifications, and booking flags.
 */
export interface TransportationVehicleItem {
  id: string;
  name: string;
  category: TransportOptionId;
  image?: string;
  shortDescription?: string;
  description?: string;
  passengerCapacity?: number;
  passengers?: number;
  luggageCapacity?: number;
  luggage?: number;
  features?: string[];
  pricing?: VehiclePricing;
  bookable?: boolean;
  enquiryAvailable?: boolean;
  source?: TransportProviderName | string;
  providers?: VehicleProviderEntry[];
}

/**
 * Definition for top-level transport fleet category options.
 */
export interface TransportOptionDef {
  id: TransportOptionId;
  label: string;
  badge: string;
  tagline: string;
  vehicleModels: string[];
  inclusions: string[];
  vehicles?: TransportationVehicleItem[];
}
