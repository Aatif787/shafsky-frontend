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

export interface PackageCatalogItem {
  id: string;
  title: string;
  tagline?: string;
  basePrice: number;
  price?: number;
  currency?: string;
  recommendedBadge?: string | null;
  features?: string[];
  serviceIds?: string[];
  includedServiceIds?: string[];
}

export interface ServiceCatalogItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  isAvailable?: boolean;
  badge?: string;
  icon?: string;
  restrictions?: string;
}

export interface AirportServicesFetchResult {
  success: boolean;
  isCovered: boolean;
  currency: string;
  services: ServiceCatalogItem[];
  packages: PackageCatalogItem[];
  flightType?: string;
  airport?: { code?: string; name?: string; city?: string; country?: string };
  error?: string;
}

export interface PriceBreakdown {
  packageItem: { id: string; title: string; price: number } | null;
  additionalServices: Array<{ id: string; title: string; price: number }>;
  overlappingIgnoredServiceIds: string[];
  unitTotal: number;
  grandTotal: number;
  guestCount: number;
  currencySymbol: string;
}

/**
 * Core Rule 1, 2, 3 & 10: Automatic Service Airport Resolution
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
    targetCode = destCode || (fallbackAirportCode && fallbackAirportCode !== "BOM" ? fallbackAirportCode : destCode) || fallbackAirportCode || "";
    targetName = activeFlight?.destination?.name || destCity || "Destination Airport";
    targetCity = activeFlight?.destination?.city || targetName;
    targetCountry = activeFlight?.destination?.country || "India";
  } else if (direction === "departure") {
    targetCode = originCode || (fallbackAirportCode && fallbackAirportCode !== "DEL" ? fallbackAirportCode : originCode) || fallbackAirportCode || "";
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
      targetCode = fallbackAirportCode || "";
      targetName = "Transit Airport";
      targetCity = targetCode;
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

  const isCovered = Boolean(entry && entry.status === "Active");
  return { isCovered, entry: entry || null };
}

/**
 * Core Rule 11, 12, 15: Dynamic Service Fetching with Backend Query & AbortController Signal
 */
export async function fetchAirportServices(
  airportCode: string,
  journeyType: "arrival" | "departure" | "transit",
  signal?: AbortSignal,
  extraParams?: { origin?: string; destination?: string; terminal?: string; flightType?: string; transit?: string }
): Promise<AirportServicesFetchResult> {
  const cleanCode = (airportCode || "").trim().toUpperCase();

  if (!cleanCode) {
    return {
      success: false,
      isCovered: false,
      currency: "INR",
      services: [],
      packages: [],
      error: "Invalid or missing airport code.",
    };
  }

  let url = `/api/airport/services?airport=${cleanCode}&journey_type=${journeyType}`;
  if (extraParams?.origin) url += `&origin=${extraParams.origin}`;
  if (extraParams?.destination) url += `&destination=${extraParams.destination}`;
  if (extraParams?.terminal) url += `&terminal=${extraParams.terminal}`;
  if (extraParams?.flightType) url += `&flight_type=${extraParams.flightType}`;
  if (extraParams?.transit) url += `&transit=${extraParams.transit}`;

  try {
    const res = await ApiClient.fetchWithAuth(url, {
      method: "GET",
      signal,
    });

    if (res.ok) {
      const data = await res.json();
      if (data) {
        if (data.covered === false || data.is_covered === false) {
          return {
            success: true,
            isCovered: false,
            currency: data.currency || "INR",
            services: [],
            packages: [],
            airport: data.airport,
            flightType: data.flightType || data.flight_type,
          };
        }

        const addonIds = ["meet_greet", "fast_track", "lounge", "porter", "buggy", "wheelchair", "transport", "chauffeur"];
        const packages = (data.packages || [])
          .map((pkg: any) => {
            const id = String(pkg?.id || pkg?.slug || "").toLowerCase();
            if (!id || addonIds.includes(id)) return null;
            return {
              id,
              title: pkg.title || pkg.name || id.replace(/_/g, " "),
              tagline: pkg.tagline || pkg.short_description || pkg.description || "",
              basePrice: Number(pkg.basePrice ?? pkg.base_price ?? pkg.price ?? 0),
              price: Number(pkg.price ?? pkg.basePrice ?? pkg.base_price ?? 0),
              currency: pkg.currency,
              recommendedBadge: pkg.recommendedBadge || pkg.recommended_badge || null,
              features: Array.isArray(pkg.features) ? pkg.features : [],
              serviceIds: pkg.serviceIds || pkg.includedServiceIds || [],
              includedServiceIds: pkg.includedServiceIds || pkg.serviceIds || [],
            } as PackageCatalogItem;
          })
          .filter(Boolean) as PackageCatalogItem[];

        return {
          success: true,
          isCovered: true,
          currency: data.currency || "INR",
          services: [],
          packages,
          airport: data.airport,
          flightType: data.flightType || data.flight_type,
        };
      }
    }
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw err;
    }
  }

  return {
    success: false,
    isCovered: false,
    currency: "INR",
    services: [],
    packages: [],
    error: "Unable to retrieve master catalog from server.",
  };
}

/**
 * Core Rule 9 & 10: Prevents Double Charging when Individual Services Overlap with Package Included Services
 */
export function computePriceBreakdown(params: {
  packages: PackageCatalogItem[];
  individualServices: ServiceCatalogItem[];
  selectedPackageId: string | null;
  selectedServiceIds: string[];
  guestCount: number;
  currencySymbol?: string;
}): PriceBreakdown {
  const { packages, individualServices, selectedPackageId, selectedServiceIds, guestCount, currencySymbol = "₹" } = params;

  let pkgObj: PackageCatalogItem | null = null;
  let pkgPrice = 0;
  let includedServiceIds = new Set<string>();

  if (selectedPackageId) {
    pkgObj = packages.find((p) => p.id === selectedPackageId) || null;
    if (pkgObj) {
      pkgPrice = pkgObj.basePrice || pkgObj.price || 0;
      includedServiceIds = new Set(pkgObj.serviceIds || []);
    }
  }

  const additionalServicesList: Array<{ id: string; title: string; price: number }> = [];
  let additionalServicesPrice = 0;
  const overlappingIgnoredServiceIds: string[] = [];

  for (const svcId of selectedServiceIds) {
    // Rule 9: Prevent double charging if service is already included in selected package!
    if (includedServiceIds.has(svcId)) {
      overlappingIgnoredServiceIds.push(svcId);
      continue;
    }

    const svcObj = individualServices.find((s) => s.id === svcId);
    if (svcObj && svcObj.isAvailable !== false) {
      const p = svcObj.price || 0;
      additionalServicesList.push({ id: svcObj.id, title: svcObj.title, price: p });
      additionalServicesPrice += p;
    }
  }

  const unitTotal = pkgPrice + additionalServicesPrice;
  const grandTotal = unitTotal * Math.max(1, guestCount);

  return {
    packageItem: pkgObj ? { id: pkgObj.id, title: pkgObj.title, price: pkgPrice } : null,
    additionalServices: additionalServicesList,
    overlappingIgnoredServiceIds,
    unitTotal,
    grandTotal,
    guestCount,
    currencySymbol,
  };
}
