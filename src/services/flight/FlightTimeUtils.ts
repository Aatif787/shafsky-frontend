import { AIRPORTS } from "@/data/airports";

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
  const airport = AIRPORTS.find((a) => a.code.toUpperCase() === airportIata.toUpperCase());
  const timeZone = airport?.timezone || "Asia/Kolkata";

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
}

/**
 * Computes the 6-hour booking cutoff rule dynamically for departures and arrivals.
 */
export function checkBookingEligibility(
  scheduledTime: string,
  airportIata: string,
  tripType?: string,
  threshold: number = 6,
  isArrival: boolean = false,
): FlightEligibility {
  const targetDate = parseFlightDateTime(scheduledTime, airportIata);
  const now = new Date();

  const diffMs = targetDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 0) {
    return {
      isBookable: false,
      remainingTimeHours: 0,
      blockingMessage: isArrival
        ? "This flight has already arrived. Past arrivals cannot be booked."
        : "This flight has already departed. Past departures cannot be booked.",
    };
  }

  const isBookable = diffHours >= threshold;
  const remainingTimeHours = diffHours;

  // Format remaining time as X hours Y minutes
  const totalMins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  let timeStr = "";
  if (hrs > 0) {
    timeStr += `${hrs} hour${hrs > 1 ? "s" : ""}`;
  }
  if (mins > 0) {
    timeStr += `${hrs > 0 ? " " : ""}${mins} minute${mins > 1 ? "s" : ""}`;
  }
  if (!timeStr) {
    timeStr = "0 minutes";
  }

  const eventLabel = isArrival ? "arrival" : "departure";
  const blockingMessage = isBookable
    ? undefined
    : `Bookings must be made at least ${threshold} hours before ${eventLabel}. (${isArrival ? "Flight arrives in" : "Flight departs in"} ${timeStr})`;

  return {
    isBookable,
    remainingTimeHours,
    blockingMessage,
  };
}
