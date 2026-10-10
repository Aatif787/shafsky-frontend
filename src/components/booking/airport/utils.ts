import { ICAO_TO_IATA_MAP } from "./types";
import { lookupAirport } from "../shared/AirportSuggestionPicker";
import { getAirportRegistryEntry, isIndianAirportCode } from "@/data/airportRegistry";

/**
 * Resolves a human-friendly city/airport name for display (e.g. BOM -> Mumbai, DEL -> Delhi, DXB -> Dubai).
 */
export function getAirportDisplayName(code?: string, fallback?: string): string {
  if (!code) return fallback || "";
  const clean = code.trim().toUpperCase();
  if (clean === "DEL") return "Delhi";
  if (clean === "BOM") return "Mumbai";
  if (clean === "DXB") return "Dubai";
  
  const found = lookupAirport(clean);
  if (found?.city) {
    if (found.city.toLowerCase() === "new delhi") return "Delhi";
    return found.city;
  }
  const reg = getAirportRegistryEntry(clean);
  if (reg?.city) {
    if (reg.city.toLowerCase() === "new delhi") return "Delhi";
    return reg.city;
  }
  return fallback || clean;
}

/**
 * Builds the canonical warning message for flight route mismatch.
 */
export function buildRouteMismatchWarning(
  apiOrigin: string,
  apiDest: string,
  userOrigin: string,
  userDest: string
): string {
  const apiOrigCity = getAirportDisplayName(apiOrigin);
  const apiDestCity = getAirportDisplayName(apiDest);
  const userOrigCity = getAirportDisplayName(userOrigin);
  const userDestCity = getAirportDisplayName(userDest);
  return `The flight number you entered is for ${apiOrigCity} (${apiOrigin}) → ${apiDestCity} (${apiDest}), but your selected journey is ${userOrigCity} (${userOrigin}) → ${userDestCity} (${userDest}). Please check your flight number or selected airports.`;
}

export interface FlightRouteEvaluationParams {
  direction: "arrival" | "departure" | "transit";
  flOrigin: string;
  flDest: string;
  userOrigin?: string;
  userDest?: string;
  selectedServiceAirport?: string;
  transitHub?: string;
  flightType?: string;
}

export interface RouteEvaluationResult {
  hasMismatch: boolean;
  isSameAirport: boolean;
  sameAirportError?: string;
  mismatchWarning?: string;
  isActuallyIntl: boolean;
  suggestedCategory: "domestic" | "international";
  flOrigin: string;
  flDest: string;
  userOrigin: string;
  userDest: string;
}

/**
 * Pure evaluation function for comparing flight API route against user selected journey.
 */
export function evaluateFlightRouteMatch(params: FlightRouteEvaluationParams): RouteEvaluationResult {
  const flOrigin = (params.flOrigin || "").trim().toUpperCase();
  const flDest = (params.flDest || "").trim().toUpperCase();
  const selectedServiceAirport = (params.selectedServiceAirport || "").trim().toUpperCase();
  const transitHub = (params.transitHub || selectedServiceAirport).trim().toUpperCase();

  // Same airport check
  if (flOrigin && flDest && flOrigin === flDest) {
    return {
      hasMismatch: true,
      isSameAirport: true,
      sameAirportError: `Flight route origin and destination cannot be the same airport (${flOrigin}). Please verify your flight number.`,
      isActuallyIntl: false,
      suggestedCategory: "domestic",
      flOrigin,
      flDest,
      userOrigin: params.userOrigin || flOrigin,
      userDest: params.userDest || flDest,
    };
  }

  // Resolve user's expected endpoints
  const userOrigin = (
    params.userOrigin ||
    (params.direction === "departure" ? selectedServiceAirport : "")
  ).trim().toUpperCase();

  const userDest = (
    params.userDest ||
    (params.direction === "arrival" ? selectedServiceAirport : "")
  ).trim().toUpperCase();

  const effectiveUserOrigin = userOrigin || flOrigin;
  const effectiveUserDest = userDest || flDest;

  let hasMismatch = false;
  if (params.direction === "departure") {
    if (selectedServiceAirport && flOrigin && flOrigin !== selectedServiceAirport) {
      hasMismatch = true;
    } else if (userOrigin && flOrigin && flOrigin !== userOrigin) {
      hasMismatch = true;
    }
    if (userDest && flDest && flDest !== userDest) {
      hasMismatch = true;
    }
  } else if (params.direction === "arrival") {
    if (selectedServiceAirport && flDest && flDest !== selectedServiceAirport) {
      hasMismatch = true;
    } else if (userDest && flDest && flDest !== userDest) {
      hasMismatch = true;
    }
    if (userOrigin && flOrigin && flOrigin !== userOrigin) {
      hasMismatch = true;
    }
  } else if (params.direction === "transit") {
    if (userOrigin && flOrigin && flOrigin !== userOrigin) {
      hasMismatch = true;
    }
    if (transitHub && flDest && flDest !== transitHub) {
      hasMismatch = true;
    }
  }

  // International vs Domestic classification of the flight
  const isOriginIndia = isIndianAirportCode(flOrigin);
  const isDestIndia = isIndianAirportCode(flDest);
  const isFlightTypeIntl = String(params.flightType || "").toUpperCase() === "INTERNATIONAL";
  const isActuallyIntl = isFlightTypeIntl || (!isOriginIndia || !isDestIndia);
  const suggestedCategory: "domestic" | "international" = isActuallyIntl ? "international" : "domestic";

  const mismatchWarning = hasMismatch
    ? buildRouteMismatchWarning(flOrigin, flDest, effectiveUserOrigin, effectiveUserDest)
    : undefined;

  return {
    hasMismatch,
    isSameAirport: false,
    mismatchWarning,
    isActuallyIntl,
    suggestedCategory,
    flOrigin,
    flDest,
    userOrigin: effectiveUserOrigin,
    userDest: effectiveUserDest,
  };
}

/**
 * Pure evaluation function for Leg 2 (Transit Hub -> Final Destination).
 */
export function evaluateConnectingLegRouteMatch(params: {
  transitHub: string;
  flOrigin: string;
  flDest: string;
  userDest?: string;
}): {
  hasMismatch: boolean;
  isSameAirport: boolean;
  sameAirportError?: string;
  mismatchWarning?: string;
} {
  const transitHub = (params.transitHub || "").trim().toUpperCase();
  const flOrigin = (params.flOrigin || "").trim().toUpperCase();
  const flDest = (params.flDest || "").trim().toUpperCase();
  const userDest = (params.userDest || "").trim().toUpperCase();

  if (flOrigin && flDest && flOrigin === flDest) {
    return {
      hasMismatch: true,
      isSameAirport: true,
      sameAirportError: `Connecting flight route origin and destination cannot be the same (${flOrigin}).`,
    };
  }

  let hasMismatch = false;
  if (transitHub && flOrigin && flOrigin !== transitHub) {
    hasMismatch = true;
  }
  if (userDest && flDest && flDest !== userDest) {
    hasMismatch = true;
  }

  const effectiveUserOrigin = transitHub || flOrigin;
  const effectiveUserDest = userDest || flDest;

  const mismatchWarning = hasMismatch
    ? buildRouteMismatchWarning(flOrigin, flDest, effectiveUserOrigin, effectiveUserDest)
    : undefined;

  return {
    hasMismatch,
    isSameAirport: false,
    mismatchWarning,
  };
}

/**
 * Safely extracts a 3-letter IATA airport code from raw strings (e.g., "(DEL)", "DEL", "Delhi (DEL)").
 */
export const extractIata = (raw?: string): string => {
  if (!raw) return "";
  const match = String(raw).match(/\(([A-Z]{3})\)/);
  if (match) return match[1].toUpperCase();
  const cleaned = String(raw).trim().toUpperCase();
  return cleaned.length === 3 ? cleaned : "";
};

/**
 * Safely anchors a flight time-of-day onto the intended calendar service date.
 * Avoids submitting past dates from provider timetables or cached entries.
 */
export function buildAnchoredServiceClock(
  targetDate: string,
  rawTimeVal: string | null | undefined,
  fallbackTime: string,
  isArrivalNextDay = false
): string {
  let timeStr = fallbackTime;
  if (rawTimeVal && typeof rawTimeVal === "string") {
    const match = rawTimeVal.trim().match(/(?:T|\s)?(\d{1,2}:\d{2}(?::\d{2})?)/);
    if (match && match[1]) {
      timeStr = match[1];
    }
  }
  const parts = timeStr.split(":");
  const hh = (parts[0] || "10").padStart(2, "0");
  const mm = (parts[1] || "00").padStart(2, "0");
  const ss = (parts[2] || "00").padStart(2, "0");
  const formattedTime = `${hh}:${mm}:${ss}`;

  let finalDate = targetDate;
  if (isArrivalNextDay) {
    try {
      const d = new Date(`${targetDate}T00:00:00`);
      d.setDate(d.getDate() + 1);
      finalDate = d.toISOString().split("T")[0];
    } catch {
      finalDate = targetDate;
    }
  }
  return `${finalDate}T${formattedTime}`;
}

/**
 * Normalize flight input with fuzzy & ICAO handling
 */
export const sanitizeFlightInput = (input: string): string => {
  let clean = input.trim().toUpperCase().replace(/[\s\-_]+/g, "");
  const match = clean.match(/^([A-Z0-9]{2,3})(\d+[A-Z]?)$/);
  if (match) {
    let carrier = match[1];
    const digits = match[2];
    if (ICAO_TO_IATA_MAP[carrier]) {
      carrier = ICAO_TO_IATA_MAP[carrier];
    }
    return `${carrier}${digits}`;
  }
  return clean;
};
