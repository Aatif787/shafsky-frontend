/**
 * Multi-Service Journey Navigation & State Orchestration
 * Manages deterministic sequence traversal for multi-airport bookings:
 * Departure (Origin) -> Transit (Connecting Hub) -> Arrival (Destination) -> Consolidated Checkout
 */

import { type AirportServiceType, type ServiceItemAvailability } from "@/lib/api/multiServiceApi";
import { AIRPORT_REGISTRY } from "@/data/airportRegistry";

export const CANONICAL_SERVICE_ORDER: AirportServiceType[] = ["DEPARTURE", "TRANSIT", "ARRIVAL"];

export interface JourneyServiceTarget {
  serviceType: AirportServiceType;
  airportCode: string;
  direction: "departure" | "transit" | "arrival";
  isSupported?: boolean;
}

export interface BookingIntentState {
  services?: string;
  origin?: string;
  destination?: string;
  transit?: string;
  airport?: string;
  airport_id?: string;
  airport_name?: string;
  direction?: string;
  travel_type?: string;
  flight_type?: string;
  transit_type?: string;
  depart_date?: string;
  depart_date_2?: string;
  flight_number?: string;
  flight_number_2?: string;
  service_date?: string;
  pax_adults?: number | string;
  pax_children?: number | string;
  pax_infants?: number | string;
  booking_mode?: string;
  from_hero?: string;
  source?: string;
  pkg_departure?: string;
  pkg_transit?: string;
  pkg_arrival?: string;
  packages_by_service?: Record<string, string>;
  services_availability?: ServiceItemAvailability[];
  [key: string]: unknown;
}

const INTENT_STORAGE_KEY = "shafsky_booking_intent";

/**
 * Safely reads the booking intent state from sessionStorage.
 */
export function getStoredBookingIntent(): BookingIntentState {
  if (typeof window === "undefined" || !window.sessionStorage) return {};
  try {
    const raw = window.sessionStorage.getItem(INTENT_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Safely persists booking intent state into sessionStorage.
 */
export function saveStoredBookingIntent(update: Partial<BookingIntentState>): void {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    const current = getStoredBookingIntent();
    const next = { ...current, ...update };
    window.sessionStorage.setItem(INTENT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota/security errors in strict sandbox
  }
}

/**
 * Saves a package selection for a given service type into the stored booking intent.
 */
export function recordPackageSelection(
  serviceType: AirportServiceType,
  packageSlug: string
): void {
  const current = getStoredBookingIntent();
  const pkgs = { ...(current.packages_by_service || {}) };
  pkgs[serviceType] = packageSlug;

  const update: Partial<BookingIntentState> = {
    packages_by_service: pkgs,
  };
  if (serviceType === "DEPARTURE") update.pkg_departure = packageSlug;
  if (serviceType === "TRANSIT") update.pkg_transit = packageSlug;
  if (serviceType === "ARRIVAL") update.pkg_arrival = packageSlug;

  saveStoredBookingIntent(update);
}

/**
 * Resolves the ordered service targets for a journey in canonical order.
 */
export function resolveOrderedJourneyTargets(
  selectedServices: AirportServiceType[],
  origin: string,
  destination: string,
  transit?: string
): JourneyServiceTarget[] {
  const cleanOrigin = (origin || "").trim().toUpperCase();
  const cleanDest = (destination || "").trim().toUpperCase();
  const cleanTransit = (transit || "").trim().toUpperCase();

  const targets: JourneyServiceTarget[] = [];

  for (const st of CANONICAL_SERVICE_ORDER) {
    if (!selectedServices.includes(st)) continue;

    let apt = "";
    let dir: "departure" | "transit" | "arrival" = "departure";

    if (st === "DEPARTURE") {
      apt = cleanOrigin;
      dir = "departure";
    } else if (st === "TRANSIT") {
      apt = cleanTransit;
      dir = "transit";
    } else if (st === "ARRIVAL") {
      apt = cleanDest;
      dir = "arrival";
    }

    if (apt && apt.length === 3) {
      targets.push({
        serviceType: st,
        airportCode: apt,
        direction: dir,
        isSupported: Boolean(AIRPORT_REGISTRY[apt]),
      });
    }
  }

  return targets;
}

export interface NextStepDecision {
  type: "AIRPORT_PAGE" | "CHECKOUT";
  targetAirport?: string;
  targetDirection?: "departure" | "transit" | "arrival";
  packagesByService: Record<string, string>;
  searchParams: Record<string, unknown>;
}

/**
 * Deterministically decides whether the customer should continue to the next available
 * airport page or navigate to the final consolidated checkout page (/book).
 */
export function getNextJourneyStep(
  currentServiceType: AirportServiceType,
  selectedPackageSlug: string,
  allSelectedServices: AirportServiceType[],
  origin: string,
  destination: string,
  transit?: string,
  availabilityList?: ServiceItemAvailability[],
  existingPackages: Record<string, string> = {},
  baseSearch: Record<string, unknown> = {}
): NextStepDecision {
  // 1. Accumulate selected packages
  const updatedPkgs: Record<string, string> = {
    ...existingPackages,
    [currentServiceType]: selectedPackageSlug,
  };

  // 2. Resolve all ordered journey service targets
  const allTargets = resolveOrderedJourneyTargets(allSelectedServices, origin, destination, transit);

  // 3. Find targets strictly subsequent to the current service type
  const currentIndex = CANONICAL_SERVICE_ORDER.indexOf(currentServiceType);
  const subsequentTargets = allTargets.filter(
    (t) => CANONICAL_SERVICE_ORDER.indexOf(t.serviceType) > currentIndex
  );

  // 4. Find the first subsequent service that is AVAILABLE in our database
  // A service is available if either:
  // a) availabilityList lists it as status === "AVAILABLE" and is_airport_supported
  // b) In the absence of an explicit list, it exists in AIRPORT_REGISTRY as a supported hub
  let nextAvailableTarget: JourneyServiceTarget | null = null;

  for (const target of subsequentTargets) {
    if (availabilityList && availabilityList.length > 0) {
      const match = availabilityList.find(
        (a) =>
          a.service_type === target.serviceType &&
          a.airport_code.toUpperCase() === target.airportCode.toUpperCase()
      );
      if (match) {
        if (match.status === "AVAILABLE" && match.is_airport_supported) {
          nextAvailableTarget = target;
          break;
        }
        // If match.status === "REQUEST_REQUIRED", this service requires concierge arrangement; skip package selection
        continue;
      }
    }

    // Fallback: check if the airport is configured in the registry
    if (AIRPORT_REGISTRY[target.airportCode]) {
      nextAvailableTarget = target;
      break;
    }
  }

  // Common search parameters carried forward
  const commonSearch: Record<string, unknown> = {
    ...baseSearch,
    services: allSelectedServices.join(","),
    origin,
    destination,
    transit: transit || undefined,
    pkg_departure: updatedPkgs.DEPARTURE || (baseSearch.pkg_departure as string) || undefined,
    pkg_transit: updatedPkgs.TRANSIT || (baseSearch.pkg_transit as string) || undefined,
    pkg_arrival: updatedPkgs.ARRIVAL || (baseSearch.pkg_arrival as string) || undefined,
    from_hero: "true",
  };

  if (nextAvailableTarget) {
    // When transitioning to the next airport page, do not leak previous package details or pre-select a package
    const { package_id, package_name, package_price, ...cleanBaseSearch } = commonSearch;
    return {
      type: "AIRPORT_PAGE",
      targetAirport: nextAvailableTarget.airportCode,
      targetDirection: nextAvailableTarget.direction,
      packagesByService: updatedPkgs,
      searchParams: {
        ...cleanBaseSearch,
        airport: nextAvailableTarget.airportCode,
        direction: nextAvailableTarget.direction,
      },
    };
  }

  return {
    type: "CHECKOUT",
    packagesByService: updatedPkgs,
    searchParams: {
      ...commonSearch,
      direction: currentServiceType.toLowerCase(),
      airport: currentServiceType === "DEPARTURE" ? origin : currentServiceType === "ARRIVAL" ? destination : (transit || origin),
      package_id: selectedPackageSlug,
    },
  };
}
