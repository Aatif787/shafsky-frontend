import { isIndianAirportCode } from "@/data/airportRegistry";
import { FlightData } from "@/services/flight/FlightTypes";
import {
  PackageCatalogItem,
  ServiceCatalogItem,
} from "../utils/serviceAirportResolver";

export type FlightValidationMode = "IDLE" | "LOADING" | "VERIFIED" | "ERROR" | "MANUAL";

export interface AirportWorkflowState {
  airportCode: string;
  airportName: string;
  direction: "arrival" | "departure" | "transit";
  bookingMode: "individual" | "package";
  selectedService: string;
  selectedPackage: string;
  serviceDate: string;
  serviceTime: string;
  guestCount: number;
  fullName: string;
  phone: string;
  email: string;
  flightNumber: string;
  specialRequests: string;
  isFlightValidated: boolean;
  validatedFlightData: FlightData | null;
  selectedTerminal?: string;
  isManualMode?: boolean;
  flightStateMode?: FlightValidationMode;
  flightErrorMessage?: string;
  routeMatchError?: string;
  isLoadingServices?: boolean;
  serviceFetchError?: string | null;
  isAirportCovered?: boolean;
  catalogCurrency?: string;
  availablePackagesList?: PackageCatalogItem[];
  availableServicesList?: ServiceCatalogItem[];
  selectedPackageId?: string | null;
  selectedServiceIds?: string[];
  isValidatingBooking?: boolean;
  validationErrors?: string[];
  authoritativeValidationResult?: any;
  hasPriceChanged?: boolean;
  isSavingDraft?: boolean;
  draftFieldErrors?: Record<string, string>;
  bookingRef?: string;
  originCode?: string;
  destCode?: string;
  transitCode?: string;
  travelType?: "domestic" | "international";
  flightType?: string;
  isResolvingAirport?: boolean;
  resolvedAirport?: any;
  isFlightLocked?: boolean;
  bookingSource?: "airport_page" | "generic";
  travelTypeAutoSwitchedReason?: string;
}

/**
 * Formats flight validation errors into user-friendly messages.
 * Properly exposes actual backend error messages instead of masking them as generic "Backend unavailable".
 */
export function formatFlightLookupError(error: unknown, status?: number): string {
  try {
    // Extract the best available error message from various possible formats
    let rawString: string = "";
    let errorCode: string = "";

    if (typeof error === "string") {
      rawString = error;
    } else if (typeof (error as any)?.error === "string") {
      rawString = (error as any).error;
      if (typeof (error as any)?.code === "string") {
        errorCode = (error as any).code;
      }
    } else if (typeof (error as any)?.message === "string") {
      rawString = (error as any).message;
      if (typeof (error as any)?.code === "string") {
        errorCode = (error as any).code;
      }
    } else if (typeof (error as any)?.code === "string") {
      errorCode = (error as any).code;
      rawString = (error as any).code;
    } else if (error && typeof error === "object") {
      if ((error as any)?.code) {
        errorCode = (error as any).code;
      }
      if (typeof (error as any)?.error?.message === "string") {
        rawString = (error as any).error.message;
      } else if (typeof (error as any)?.error?.error === "string") {
        rawString = (error as any).error.error;
      } else {
        rawString = JSON.stringify(error || "");
      }
    }

    const upper = rawString.toUpperCase();

    // ===== TIMEOUT ERRORS =====
    if (
      upper.includes("TIMEOUT") ||
      upper.includes("TIMED OUT") ||
      upper.includes("REQUEST_TIMEOUT") ||
      upper.includes("ABORT") ||
      status === 408
    ) {
      return `Flight validation request timed out. The server took too long to respond. Please try again or enter flight details manually.`;
    }

    // ===== PROVIDER HAS NO SCHEDULE PUBLISHED FOR THIS DATE (422) =====
    // The flight number may be valid; our data provider simply does not publish
    // schedules this far out. Manual entry is the expected path, not a retry.
    if (errorCode === "FLIGHT_SCHEDULE_UNAVAILABLE") {
      if (rawString.length > 5 && !rawString.startsWith("{")) {
        return rawString;
      }
      return `Flight schedules for this date are not published by our data provider yet. Please enter the flight times and airports manually to continue.`;
    }

    // ===== FLIGHT NOT FOUND / INVALID DATE (404) =====
    if (
      status === 404 ||
      errorCode === "FLIGHT_NOT_FOUND" ||
      upper.includes("FLIGHT_NOT_FOUND") ||
      upper.includes("NO SCHEDULE") ||
      upper.includes("COULD NOT BE FOUND") ||
      upper.includes("NOT FOUND")
    ) {
      if (rawString.length < 200 && rawString.length > 5 && !rawString.startsWith("{") && !rawString.includes("FLIGHT_NOT_FOUND")) {
        return rawString;
      }
      return `No flight schedule found for this flight number on the selected date. Please check the flight number and travel date, or enter flight details manually.`;
    }

    // ===== INVALID FLIGHT NUMBER / FORMAT (400 / 422) =====
    if (
      upper.includes("INVALID_FLIGHT") ||
      upper.includes("INVALID FORMAT") ||
      upper.includes("INVALID_FLIGHT_NUMBER") ||
      upper.includes("MALFORMED") ||
      errorCode === "INVALID_FORMAT" ||
      errorCode === "INVALID_DATE"
    ) {
      if (rawString.length < 200 && rawString.length > 5 && !rawString.startsWith("{")) {
        return rawString;
      }
      return `The flight number format is invalid. Please check the airline code and flight number format (e.g., AI302, EK504, BA127).`;
    }

    // ===== RATE LIMITING =====
    if (
      upper.includes("RATE_LIMIT") ||
      upper.includes("RATE LIMIT") ||
      upper.includes("TOO_MANY_REQUESTS") ||
      status === 429
    ) {
      return `Too many requests. Please wait a moment and try again, or enter flight details manually.`;
    }

    // ===== ADVANCE NOTICE / BOOKING WINDOW RESTRICTIONS =====
    if (
      upper.includes("ADVANCE_NOTICE") ||
      upper.includes("6_HOUR") ||
      upper.includes("MINIMUM_LEAD_TIME") ||
      upper.includes("BOOKING_WINDOW")
    ) {
      return `This flight departs too soon for standard online booking. Please contact our 24/7 VIP support desk at +91 9599087959 for short-notice assistance.`;
    }

    // ===== FLIGHT DATA PROVIDER ERRORS (External API failures) =====
    if (
      upper.includes("PROVIDER_ERROR") ||
      upper.includes("AVIATION_EDGE") ||
      upper.includes("PROVIDER_FAILURE") ||
      upper.includes("AERODATABOX") ||
      errorCode === "SERVICE_ERROR" ||
      errorCode === "PROVIDER_ERROR"
    ) {
      return `Flight data provider temporarily unavailable. Our data service is experiencing issues. Please try again or enter flight details manually.`;
    }

    // ===== VALIDATION ERRORS (400 / 422) =====
    if (status === 400 || status === 422) {
      if (rawString.length < 200 && rawString.length > 5 && !rawString.startsWith("{")) {
        return rawString;
      }
      return `Flight validation failed. Please check your flight number, date, and airport selection or enter flight details manually.`;
    }

    // ===== NETWORK-LEVEL ERRORS (Actual connection failures) =====
    if (
      upper.includes("FAILED TO FETCH") ||
      upper.includes("ERR_CONNECTION_REFUSED") ||
      upper.includes("NETWORKERROR") ||
      upper.includes("ECONNREFUSED") ||
      status === 502 ||
      status === 503 ||
      status === 504
    ) {
      return `Backend service is currently unavailable. The flight validation server cannot be reached. Please check backend server status or enter flight details manually.`;
    }

    // ===== SERVER ERRORS (500) =====
    if (status === 500) {
      if (rawString.length < 200 && rawString.length > 5 && !rawString.startsWith("{")) {
        return rawString;
      }
      return `Server error during flight validation. Please try again in a moment or enter flight details manually.`;
    }

    // ===== UNEXPECTED / FALLBACK =====
    if (rawString.length < 200 && rawString.length > 5 && !rawString.startsWith("{")) {
      return rawString;
    }

    return `Unable to validate flight details. Please verify your flight information or enter flight details manually.`;
  } catch {
    return `Unable to process flight validation response. Please enter flight details manually.`;
  }
}

/** Wall-clock HH:MM from an ISO/local scheduled string (not a hardcoded default). */
export function hhmmFromScheduled(value?: string | null): string {
  if (!value) return "";
  const cleaned = String(value).trim();
  const iso = cleaned.match(/T(\d{2}):(\d{2})/);
  if (iso) return `${iso[1]}:${iso[2]}`;
  const hm = cleaned.match(/^(\d{1,2}):(\d{2})/);
  if (hm) return `${String(hm[1]).padStart(2, "0")}:${hm[2]}`;
  return "";
}

/** Arrival bookings use flight arrival; departure uses flight departure. Empty until a real time exists. */
export function resolveBookingServiceTime(state: {
  direction: AirportWorkflowState["direction"];
  serviceTime?: string;
  validatedFlightData?: AirportWorkflowState["validatedFlightData"];
}): string {
  const flight = state.validatedFlightData;
  if (flight) {
    const raw =
      state.direction === "departure"
        ? flight.departure?.scheduledTime
        : flight.arrival?.scheduledTime;
    const clock = hhmmFromScheduled(raw);
    if (clock) return clock;
  }
  const stored = (state.serviceTime || "").trim();
  if (stored && stored !== "14:30" && stored !== "12:00") return stored;
  return "";
}

export function formatBookingServiceDateTime(state: {
  direction: AirportWorkflowState["direction"];
  serviceDate?: string;
  serviceTime?: string;
  validatedFlightData?: AirportWorkflowState["validatedFlightData"];
}): string {
  const date = (state.serviceDate || "").trim();
  const time = resolveBookingServiceTime(state);
  if (date && time) return `${date} @ ${time}`;
  if (date) return date;
  if (time) return time;
  return "—";
}

export function extractIata(raw?: string): string {
  if (!raw) return "";
  const match = String(raw).match(/\(([A-Z]{3})\)/);
  if (match) return match[1];
  const cleaned = String(raw).trim().toUpperCase();
  return cleaned.length === 3 ? cleaned : "";
}

export function inferTerminalFromRaw(
  rawTerm?: string | null,
  effectiveAirportCode?: string,
  isIntl?: boolean
): string | undefined {
  if ((effectiveAirportCode || "").trim().toUpperCase() === "DEL" && isIntl) {
    return "Terminal 3";
  }
  if (!rawTerm) return undefined;
  const tStr = String(rawTerm).trim();
  if (tStr.includes("3") || tStr.toUpperCase().includes("T3")) {
    return "Terminal 3";
  }
  if (
    tStr.includes("1") ||
    tStr.includes("2") ||
    tStr.toUpperCase().includes("T1") ||
    tStr.toUpperCase().includes("T2")
  ) {
    return "Terminal 1 & 2";
  }
  return undefined;
}

export function parseFlightInfoFromValidationResponse(
  targetObj: any,
  flightNum: string
): { flightInfo: FlightData; transitCodes: string[] } {
  const flightInfo: FlightData = {
    flightNum: (
      targetObj?.flight?.iata ||
      targetObj?.flightNum ||
      targetObj?.flight_num ||
      flightNum
    ).toUpperCase(),
    carrier: {
      iata:
        targetObj?.airline?.iata ||
        targetObj?.carrier?.iata ||
        targetObj?.carrier_iata ||
        flightNum.slice(0, 2).toUpperCase(),
      name:
        targetObj?.airline?.name ||
        targetObj?.carrier?.name ||
        targetObj?.carrier_name ||
        null,
      logo: targetObj?.airline?.logo || null,
    },
    origin: {
      code:
        targetObj?.departure?.airport ||
        targetObj?.origin?.code ||
        targetObj?.origin_code ||
        null,
      name:
        targetObj?.departure?.airport_name ||
        targetObj?.origin?.name ||
        targetObj?.origin_name ||
        null,
      city:
        targetObj?.departure?.city ||
        targetObj?.origin?.city ||
        targetObj?.origin_city ||
        null,
      country: targetObj?.departure?.country || targetObj?.origin?.country || null,
      timezone:
        targetObj?.departure?.timezone || targetObj?.origin?.timezone || null,
    },
    destination: {
      code:
        targetObj?.arrival?.airport ||
        targetObj?.destination?.code ||
        targetObj?.destination_code ||
        null,
      name:
        targetObj?.arrival?.airport_name ||
        targetObj?.destination?.name ||
        targetObj?.destination_name ||
        null,
      city:
        targetObj?.arrival?.city ||
        targetObj?.destination?.city ||
        targetObj?.destination_city ||
        null,
      country:
        targetObj?.arrival?.country || targetObj?.destination?.country || null,
      timezone:
        targetObj?.arrival?.timezone || targetObj?.destination?.timezone || null,
    },
    departure: {
      scheduledTime:
        targetObj?.departure?.scheduled ||
        targetObj?.departure?.scheduledTime ||
        targetObj?.scheduled_departure ||
        null,
      terminal: targetObj?.departure?.terminal || null,
      gate: targetObj?.departure?.gate || null,
      timezone:
        targetObj?.departure?.timezone || targetObj?.origin?.timezone || null,
    },
    arrival: {
      scheduledTime:
        targetObj?.arrival?.scheduled ||
        targetObj?.arrival?.scheduledTime ||
        targetObj?.scheduled_arrival ||
        null,
      terminal: targetObj?.arrival?.terminal || null,
      gate: targetObj?.arrival?.gate || null,
      timezone:
        targetObj?.arrival?.timezone || targetObj?.destination?.timezone || null,
    },
    duration:
      targetObj?.duration?.formatted ||
      targetObj?.duration_text ||
      (typeof targetObj?.duration?.minutes === "number" &&
      targetObj.duration.minutes > 0
        ? `${Math.floor(targetObj.duration.minutes / 60)}h ${targetObj.duration.minutes % 60}m`
        : null) ||
      (typeof targetObj?.duration_minutes === "number" &&
      targetObj.duration_minutes > 0
        ? `${Math.floor(targetObj.duration_minutes / 60)}h ${targetObj.duration_minutes % 60}m`
        : null) ||
      (typeof targetObj?.duration === "string" ? targetObj.duration : null) ||
      targetObj?.flight_duration ||
      null,
    status: targetObj?.status || "Scheduled",
    aircraft: {
      model: targetObj?.aircraft?.model || null,
    },
  };

  const transitCodes: string[] = [
    (targetObj as any)?.transit?.code,
    (targetObj as any)?.connectingAirport?.code,
    (targetObj as any)?.layover?.code,
    ...(Array.isArray(targetObj?.segments)
      ? targetObj.segments.map(
          (s: any) => s?.destination?.code || s?.arrival?.airport
        )
      : []),
  ]
    .filter(Boolean)
    .map((c: string) => String(c).trim().toUpperCase());

  return { flightInfo, transitCodes };
}

export function verifyFlightRouteMatch(params: {
  state: AirportWorkflowState;
  flightInfo: FlightData;
  transitCodes: string[];
  targetObj: any;
}):
  | {
      ok: true;
      targetAirportCode: string;
      targetAirportName: string;
      originCode: string;
      destCode: string;
    }
  | {
      ok: false;
      errorMsg: string;
      forceManualModeFalse?: boolean;
    } {
  const { state, flightInfo, transitCodes, targetObj } = params;
  const originCode = (flightInfo.origin?.code || "").trim().toUpperCase();
  const destCode = (flightInfo.destination?.code || "").trim().toUpperCase();

  let targetAirportCode = "";
  let targetAirportName = "";

  // Never silently change the selected service airport.
  const selectedServiceAirport = (state.airportCode || "").trim().toUpperCase();
  if (state.direction === "arrival") {
    if (destCode && selectedServiceAirport && destCode !== selectedServiceAirport) {
      const mismatch = `This flight arrives at ${destCode}, but arrival services were selected for ${selectedServiceAirport}. Please verify the flight number or enter the correct itinerary manually.`;
      return { ok: false, errorMsg: mismatch };
    }
    if (originCode && state.originCode && originCode !== state.originCode.trim().toUpperCase()) {
      const mismatch = `The flight departs from ${originCode}, but your selected origin is ${state.originCode}. Please check your flight number or selected airports.`;
      return { ok: false, errorMsg: mismatch };
    }
    targetAirportCode = selectedServiceAirport || destCode;
    targetAirportName = flightInfo.destination?.name || destCode;
  } else if (state.direction === "departure") {
    if (originCode && selectedServiceAirport && originCode !== selectedServiceAirport) {
      const mismatch = `This flight departs from ${originCode}, but departure services were selected for ${selectedServiceAirport}. Please verify the flight number or enter the correct itinerary manually.`;
      return { ok: false, errorMsg: mismatch };
    }
    if (destCode && state.destCode && destCode !== state.destCode.trim().toUpperCase()) {
      const mismatch = `The flight arrives at ${destCode}, but your selected destination is ${state.destCode}. Please check your flight number or selected airports.`;
      return { ok: false, errorMsg: mismatch };
    }
    targetAirportCode = selectedServiceAirport || originCode;
    targetAirportName = flightInfo.origin?.name || originCode;
  } else if (state.direction === "transit") {
    const selectedTransit = (state.transitCode || selectedServiceAirport).toUpperCase();
    const via = transitCodes[0] || "";
    if (via && selectedTransit && via !== selectedTransit) {
      const mismatch = `This itinerary connects via ${via}, but transit services were selected for ${selectedTransit}. Please verify the flight number or enter the correct itinerary manually.`;
      return { ok: false, errorMsg: mismatch };
    }
    targetAirportCode = selectedTransit;
    targetAirportName = (targetObj as any)?.transit?.name || targetAirportCode;
  }

  if (!targetAirportCode) {
    const noAirportMsg = `Unable to determine ${state.direction} airport from flight ${flightInfo.flightNum}.`;
    return { ok: false, errorMsg: noAirportMsg, forceManualModeFalse: true };
  }

  return {
    ok: true,
    targetAirportCode,
    targetAirportName,
    originCode,
    destCode,
  };
}

export function detectFlightTravelCategory(flightInfo: FlightData): {
  isDetectedIntl: boolean;
  targetTravelType: "domestic" | "international";
} {
  const depCountry = (flightInfo.origin?.country || "").toUpperCase();
  const arrCountry = (flightInfo.destination?.country || "").toUpperCase();
  const isOriginIndia =
    depCountry === "IN" ||
    depCountry === "INDIA" ||
    isIndianAirportCode(flightInfo.origin?.code);
  const isDestIndia =
    arrCountry === "IN" ||
    arrCountry === "INDIA" ||
    isIndianAirportCode(flightInfo.destination?.code);
  const isDetectedIntl = !isOriginIndia || !isDestIndia;
  const targetTravelType: "domestic" | "international" = isDetectedIntl
    ? "international"
    : "domestic";
  return { isDetectedIntl, targetTravelType };
}
