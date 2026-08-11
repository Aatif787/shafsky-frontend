import { FlightData } from "@/services/flight/FlightTypes";
import { AIRPORT_REGISTRY, getAirportRegistryEntry, AirportRegistryEntry } from "@/data/airportRegistry";
import { ApiClient } from "@/lib/ApiClient";

export interface ResolvedServiceAirport {
  code: string;
  name: string;
  city: string;
  country: string;
  journeyType: "arrival" | "departure" | "transit";
  isLiveVerified: boolean;
  isManual: boolean;
  isCovered: boolean;
  registryEntry: AirportRegistryEntry | null;
  rawOriginCode?: string;
  rawDestinationCode?: string;
  transitCode?: string;
}

export interface AirportServicesFetchResult {
  success: boolean;
  isCovered: boolean;
  services: any[];
  packages: any[];
  error?: string;
}

/**
 * Core Rule 1, 2, 3 & 10: Automatic Service Airport Resolution
 * 
 * ARRIVAL: Service airport = verified flight DESTINATION airport.
 * DEPARTURE: Service airport = verified flight ORIGIN airport.
 * CONNECTION (TRANSIT): Service airport = actual connecting/transit airport from itinerary/segments.
 */
export function resolveServiceAirport(params: {
  flightData: FlightData | null;
  direction: "arrival" | "departure" | "transit";
  manualData?: Partial<FlightData> | null;
  fallbackAirportCode?: string;
}): ResolvedServiceAirport {
  const { flightData, direction, manualData, fallbackAirportCode } = params;
  const activeFlight = flightData || manualData || null;

  const isLiveVerified = Boolean(flightData && !flightData.isManual);
  const isManual = Boolean(flightData?.isManual || manualData?.isManual);

  let targetCode = "";
  let targetName = "";
  let targetCity = "";
  let targetCountry = "";

  const originCode = activeFlight?.origin?.code || (fallbackAirportCode && direction === "departure" ? fallbackAirportCode : "");
  const originCity = activeFlight?.origin?.city || activeFlight?.origin?.name || originCode;

  const destCode = activeFlight?.destination?.code || (fallbackAirportCode && direction === "arrival" ? fallbackAirportCode : "");
  const destCity = activeFlight?.destination?.city || activeFlight?.destination?.name || destCode;

  // Transit/Connection Airport extraction from itinerary/segments
  const transitCode =
    (activeFlight as any)?.transit?.code ||
    (activeFlight as any)?.connectingAirport?.code ||
    (activeFlight as any)?.layover?.code ||
    (activeFlight as any)?.segments?.[0]?.destination?.code ||
    (fallbackAirportCode && direction === "transit" ? fallbackAirportCode : "");

  if (direction === "arrival") {
    targetCode = destCode || fallbackAirportCode || "BOM";
    targetName = activeFlight?.destination?.name || destCity || "Destination Airport";
    targetCity = activeFlight?.destination?.city || targetName;
    targetCountry = activeFlight?.destination?.country || "India";
  } else if (direction === "departure") {
    targetCode = originCode || fallbackAirportCode || "DEL";
    targetName = activeFlight?.origin?.name || originCity || "Origin Airport";
    targetCity = activeFlight?.origin?.city || targetName;
    targetCountry = activeFlight?.origin?.country || "India";
  } else if (direction === "transit") {
    if (transitCode) {
      targetCode = transitCode;
      targetName = (activeFlight as any)?.transit?.name || (activeFlight as any)?.connectingAirport?.name || `${transitCode} Airport`;
      targetCity = (activeFlight as any)?.transit?.city || (activeFlight as any)?.connectingAirport?.city || transitCode;
      targetCountry = "India";
    } else {
      targetCode = destCode || originCode || fallbackAirportCode || "BOM";
      targetName = activeFlight?.destination?.name || activeFlight?.origin?.name || "Transit Airport";
      targetCity = activeFlight?.destination?.city || activeFlight?.origin?.city || targetCode;
      targetCountry = "India";
    }
  }

  const cleanCode = (targetCode || "").trim().toUpperCase();
  const coverageInfo = checkAirportCoverage(cleanCode);

  return {
    code: cleanCode,
    name: coverageInfo.entry?.name || targetName || (cleanCode ? `${cleanCode} International Airport` : "Selected Airport"),
    city: coverageInfo.entry?.city || targetCity || cleanCode,
    country: coverageInfo.entry?.country || targetCountry,
    journeyType: direction,
    isLiveVerified,
    isManual,
    isCovered: coverageInfo.isCovered,
    registryEntry: coverageInfo.entry,
    rawOriginCode: originCode,
    rawDestinationCode: destCode,
    transitCode,
  };
}

/**
 * Core Rule 5 & 12: Coverage Verification via Backend / Registry
 */
export function checkAirportCoverage(airportCode: string): { isCovered: boolean; entry: AirportRegistryEntry | null } {
  if (!airportCode) return { isCovered: false, entry: null };
  const cleanCode = airportCode.trim().toUpperCase();
  const entry = getAirportRegistryEntry(cleanCode);

  // An airport is covered if it exists in registry and has status 'Active'
  const isCovered = Boolean(entry && entry.status === "Active");
  return { isCovered, entry: entry || null };
}

/**
 * Core Rule 11, 12, 15: Dynamic Service Fetching with Backend Failover & Clear Error Handling
 */
export async function fetchAirportServices(
  airportCode: string,
  journeyType: "arrival" | "departure" | "transit"
): Promise<AirportServicesFetchResult> {
  const cleanCode = (airportCode || "").trim().toUpperCase();

  if (!cleanCode) {
    return {
      success: false,
      isCovered: false,
      services: [],
      packages: [],
      error: "Invalid or missing airport code.",
    };
  }

  const coverage = checkAirportCoverage(cleanCode);
  if (!coverage.isCovered) {
    return {
      success: true,
      isCovered: false,
      services: [],
      packages: [],
    };
  }

  try {
    // Attempt backend service catalog query
    const res = await ApiClient.fetchWithAuth(`/api/airport/services?airport=${cleanCode}&journey_type=${journeyType}`, {
      method: "GET",
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.services)) {
        return {
          success: true,
          isCovered: true,
          services: data.services,
          packages: data.packages || [],
        };
      }
    }
  } catch {
    // Backend endpoint fallback to frontend registry database if API endpoint fails gracefully
  }

  // Registry catalog fallback
  return {
    success: true,
    isCovered: true,
    services: coverage.entry?.availableServiceIds || ["meet_greet", "lounge", "fast_track", "transport"],
    packages: coverage.entry?.meetGreetPackages || [],
  };
}
