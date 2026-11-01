import { getAirport } from "@/data/airports";
import { getAirportRegistryEntry } from "@/data/airportRegistry";

/**
 * Gets the timezone offset of a given IANA timezone at a specific Date
 */
export function getOffsetMinutes(timeZone: string, date: Date): number {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const getVal = (type: string) => parseInt(parts.find((p) => p.type === type)!.value, 10);

    const year = getVal("year");
    const month = getVal("month") - 1;
    const day = getVal("day");
    let hour = getVal("hour");
    if (hour === 24) hour = 0; // Handle 24-hour hour value formatters
    const minute = getVal("minute");
    const second = getVal("second");

    const tzUtc = Date.UTC(year, month, day, hour, minute, second);
    const dateUtc = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
    );

    return (tzUtc - dateUtc) / 60000;
  } catch (e) {
    // Failed to compute offset, using Asia/Kolkata fallback
    return 330; // fallback to Asia/Kolkata (+05:30)
  }
}

/**
 * Resolves the IANA timezone for a given airport code
 */
export function getAirportTimezone(airportIata: string): string {
  const clean = (airportIata || "").trim().toUpperCase();
  const airport = getAirport(clean);
  if (airport?.timezone) return airport.timezone;
  const reg = getAirportRegistryEntry(clean);
  if (reg?.timezone) return reg.timezone;
  return "Asia/Kolkata";
}

/**
 * Parses a flight local or offset date-time string into a JS Date object securely
 */
export function parseFlightDateTime(scheduledTime: string, airportIata: string): Date {
  let cleanTime = scheduledTime.trim().replace(" ", "T");

  // Format validation and seconds padding: "YYYY-MM-DDTHH:MM" -> "YYYY-MM-DDTHH:MM:00"
  const parts = cleanTime.split("T");
  if (parts.length === 2) {
    const timePart = parts[1];
    if (/^\d{2}:\d{2}$/.test(timePart)) {
      cleanTime = `${parts[0]}T${timePart}:00`;
    }
  }

  const hasOffset = /[+-]\d{2}:?\d{2}$|Z$/.test(cleanTime);
  if (hasOffset) {
    const parsed = new Date(cleanTime);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // Find timezone for airport
  const timeZone = getAirportTimezone(airportIata);

  // Parse as UTC ISO format first to calculate offset securely
  const utcDate = new Date(cleanTime + "Z");
  if (isNaN(utcDate.getTime())) {
    // Invalid scheduledTime, defaulting to +24h safe fallback
    return new Date(Date.now() + 86400000); // 24-hour safe fallback (in future)
  }

  const offsetMin = getOffsetMinutes(timeZone, utcDate);
  return new Date(utcDate.getTime() - offsetMin * 60000);
}

export interface FlightEligibility {
  isBookable: boolean;
  remainingTimeHours: number;
  blockingMessage?: string;
  isPast?: boolean;
}

/**
 * Live flight status values that indicate a flight has already departed or arrived
 */
const DEPARTED_STATUSES = new Set([
  "DEPARTED",
  "ACTIVE",
  "EN ROUTE",
  "IN-AIR",
  "IN FLIGHT",
  "LANDED",
  "ARRIVED",
]);

const ARRIVED_STATUSES = new Set([
  "LANDED",
  "ARRIVED",
]);

const CANCELLED_STATUSES = new Set([
  "CANCELLED",
  "CANCELED",
  "DIVERTED",
]);

export interface FlightEventValidationParams {
  scheduledTime?: string | null;
  scheduledTimeStr?: string | null;
  airportIata?: string;
  airportCode?: string;
  direction: "arrival" | "departure" | "transit";
  serviceDate?: string;
  travelType?: "domestic" | "international";
  flightStatus?: string | null;
  liveStatus?: string | null;
  cutoffHours?: number; // 6 for domestic, 12 for international
  isArrivalNextDay?: boolean;
  referenceNow?: Date; // For deterministic testing
}

export interface FlightEventValidationResult {
  isBookable: boolean;
  isPast: boolean;
  isCutoffViolated: boolean;
  blockingMessage?: string;
  eventDate?: Date;
  remainingHours: number;
}

export function addDaysToYmd(ymd: string, days: number): string {
  try {
    const parts = ymd.split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const utc = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + days));
      const y = utc.getUTCFullYear();
      const m = String(utc.getUTCMonth() + 1).padStart(2, "0");
      const d = String(utc.getUTCDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  } catch {
    /* fallback to original */
  }
  return ymd;
}

/**
 * Authoritative validator for past flights and advance cutoff notice across all booking touchpoints.
 */
export function validateFlightEvent(params: FlightEventValidationParams): FlightEventValidationResult {
  const scheduledTime = params.scheduledTime ?? params.scheduledTimeStr;
  const airportIata = params.airportIata ?? params.airportCode ?? "";
  const flightStatus = params.flightStatus ?? params.liveStatus ?? null;
  const {
    direction,
    serviceDate,
    travelType = "domestic",
    cutoffHours,
    isArrivalNextDay = false,
    referenceNow,
  } = params;

  const now = referenceNow || new Date();
  const effectiveCutoff = typeof cutoffHours === "number"
    ? cutoffHours
    : (travelType === "international" ? 12 : 6);

  // 1. Check live flight status first
  const normalizedStatus = (flightStatus || "").trim().toUpperCase();
  if (CANCELLED_STATUSES.has(normalizedStatus)) {
    return {
      isBookable: false,
      isPast: true,
      isCutoffViolated: false,
      blockingMessage: "This flight has been cancelled. Please select an active future flight.",
      remainingHours: 0,
    };
  }

  if (direction === "departure" && DEPARTED_STATUSES.has(normalizedStatus)) {
    return {
      isBookable: false,
      isPast: true,
      isCutoffViolated: false,
      blockingMessage: "This flight has already departed. Please select a future flight.",
      remainingHours: 0,
    };
  }

  if ((direction === "arrival" || direction === "transit") && ARRIVED_STATUSES.has(normalizedStatus)) {
    return {
      isBookable: false,
      isPast: true,
      isCutoffViolated: false,
      blockingMessage: direction === "transit"
        ? "This flight has already arrived/departed. Please select a future flight."
        : "This flight has already arrived. Please select a future flight.",
      remainingHours: 0,
    };
  }

  // 2. Validate scheduled time presence
  if (!scheduledTime || !scheduledTime.trim()) {
    return {
      isBookable: false,
      isPast: false,
      isCutoffViolated: false,
      blockingMessage: "Flight schedule time is required to verify booking eligibility.",
      remainingHours: 0,
    };
  }

  // 3. Anchor schedule time with serviceDate and date rollover
  let isoTime = scheduledTime.trim();
  if (serviceDate && !isoTime.includes("-")) {
    const timePart = isoTime.includes("T") ? isoTime.split("T")[1] : isoTime;
    let targetD = serviceDate;
    if (isArrivalNextDay) {
      targetD = addDaysToYmd(serviceDate, 1);
    }
    const cleanTime = timePart.length === 5 ? `${timePart}:00` : timePart;
    isoTime = `${targetD}T${cleanTime}`;
  }

  const targetDate = parseFlightDateTime(isoTime, airportIata);
  if (isNaN(targetDate.getTime())) {
    return {
      isBookable: false,
      isPast: false,
      isCutoffViolated: false,
      blockingMessage: "Invalid flight date/time. Please check the schedule.",
      remainingHours: 0,
    };
  }

  const diffMs = targetDate.getTime() - now.getTime();
  const diffHours = diffMs / 3600000;

  // 4. Past flight check (strict event time comparison)
  if (diffHours <= 0) {
    const pastMessage = direction === "arrival"
      ? "This flight has already arrived. Please select a future flight."
      : direction === "transit"
      ? "This flight has already arrived/departed. Please select a future flight."
      : "This flight has already departed. Please select a future flight.";

    return {
      isBookable: false,
      isPast: true,
      isCutoffViolated: false,
      blockingMessage: pastMessage,
      eventDate: targetDate,
      remainingHours: Math.max(0, diffHours),
    };
  }

  // 5. Advance notice cutoff check
  if (diffHours < effectiveCutoff) {
    const totalMins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    let timeStr = "";
    if (hrs > 0) timeStr += `${hrs} hour${hrs > 1 ? "s" : ""}`;
    if (mins > 0) timeStr += `${hrs > 0 ? " " : ""}${mins} minute${mins > 1 ? "s" : ""}`;
    if (!timeStr) timeStr = "0 minutes";

    const eventLabel = direction === "arrival" ? "arrival" : "departure";
    const cutoffMessage = `Airport services need at least ${effectiveCutoff} hours before ${eventLabel} (${effectiveCutoff === 12 ? "international" : "domestic"}). Flight is in ${timeStr}. For urgent help, call our executive on +91 9599087959.`;

    return {
      isBookable: false,
      isPast: false,
      isCutoffViolated: true,
      blockingMessage: cutoffMessage,
      eventDate: targetDate,
      remainingHours: diffHours,
    };
  }

  return {
    isBookable: true,
    isPast: false,
    isCutoffViolated: false,
    eventDate: targetDate,
    remainingHours: diffHours,
  };
}

/**
 * Computes airport-service booking eligibility (legacy interface maintained for compatibility).
 * Domestic: 6 hours. International: 12 hours.
 */
export function checkBookingEligibility(
  scheduledTime: string,
  airportIata: string,
  tripType?: string,
  threshold: number = 6,
  isArrival: boolean = false,
): FlightEligibility {
  const result = validateFlightEvent({
    scheduledTime,
    airportIata,
    direction: isArrival ? "arrival" : "departure",
    cutoffHours: threshold,
    travelType: threshold === 12 ? "international" : "domestic",
  });

  return {
    isBookable: result.isBookable,
    remainingTimeHours: result.remainingHours,
    blockingMessage: result.blockingMessage,
    isPast: result.isPast,
  };
}
