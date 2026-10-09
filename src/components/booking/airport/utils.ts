import { ICAO_TO_IATA_MAP } from "./types";

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
