/**
 * Transportation Fleet Data Model, Canonical Vehicle Catalog & Verified Provider Rates
 * Central barrel file maintaining 100% backward compatibility for all imports.
 * Sourced from Shafsky Aviation and Verified Delhi/NCR Provider Rate Sheets:
 * - Victoria Car Rental Pvt. Ltd.
 * - Traveller Punia (Traveleez Punia)
 * - Sidhant (Sedhant)
 * - RWTI (Royal World Travel, India)
 * - Mega Cab
 */

export * from "./transportation/types";
export * from "./transportation/tariffs";
export * from "./transportation/luxury";
export * from "./transportation/muv";
export * from "./transportation/economy";
export * from "./transportation/options";

import type { TransportationVehicleItem } from "./transportation/types";
import { LUXURY_VEHICLES_CATALOG } from "./transportation/luxury";
import { MUV_LARGE_VEHICLES_CATALOG } from "./transportation/muv";
import { ECONOMY_STANDARD_CATALOG } from "./transportation/economy";

/**
 * Complete unified transportation vehicle catalog across all categories (38 canonical vehicles).
 */
export const TRANSPORTATION_VEHICLE_CATALOG: TransportationVehicleItem[] = [
  ...LUXURY_VEHICLES_CATALOG,
  ...MUV_LARGE_VEHICLES_CATALOG,
  ...ECONOMY_STANDARD_CATALOG,
];

/**
 * Backwards-compatible alias for the canonical vehicle catalog.
 */
export const TRANSPORT_VEHICLE_CATALOG = TRANSPORTATION_VEHICLE_CATALOG;
