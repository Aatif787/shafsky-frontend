import React from "react";
import { Plane } from "lucide-react";
import { FlightData, FlightAirport } from "@/services/flight/FlightTypes";
import { AIRPORT_REGISTRY } from "@/data/airportRegistry";

function looksLikeCode(value?: string | null): boolean {
  return !!value && /^[A-Z0-9]{3,4}$/i.test(value.trim());
}

function prettyCity(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) {
    return trimmed.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return trimmed;
}

function resolvePlace(ap?: FlightAirport | null): { city: string; airport: string | null; code: string } {
  const code = (ap?.code || "").trim().toUpperCase() || "—";
  const known = AIRPORT_REGISTRY[code];

  let city = (ap?.city || "").trim();
  let airport = (ap?.name || "").trim();

  if (!city || looksLikeCode(city)) {
    city = (known?.city || "").trim();
  }
  if (!airport || looksLikeCode(airport)) {
    airport = (known?.name || "").trim();
  }

  city = prettyCity(city);
  if (!city) city = prettyCity(airport) || code;

  const airportLooksDistinct =
    Boolean(airport) &&
    prettyCity(airport).toLowerCase() !== city.toLowerCase() &&
    !looksLikeCode(airport);

  return { city, airport: airportLooksDistinct ? airport : null, code };
}

function fmtTime(value?: string | null): string {
  if (!value) return "—";
  const cleaned = String(value).trim();
  const asDate = new Date(cleaned);
  if (!Number.isNaN(asDate.getTime()) && /[T-]/.test(cleaned)) {
    return asDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return cleaned;
}

function formatMinutes(totalMins: number): string {
  const h = Math.floor(totalMins / 60);
  const m = Math.round(totalMins % 60);
  if (h <= 0) return `${m}m`;
  if (m <= 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function parseDurationToMinutes(raw: unknown): number | null {
  if (raw == null || raw === "" || raw === "Calculated") return null;
  if (typeof raw === "number" && raw > 0) {
    return raw > 24 * 60 ? Math.round(raw / 60) : raw;
  }
  if (typeof raw === "object") {
    const obj = raw as { formatted?: string; minutes?: number };
    if (typeof obj.minutes === "number" && obj.minutes > 0) return obj.minutes;
    if (obj.formatted) return parseDurationToMinutes(obj.formatted);
    return null;
  }
  const text = String(raw).trim();
  if (/^\d+$/.test(text)) {
    const n = Number(text);
    return n > 0 ? n : null;
  }
  const hm = text.match(/(\d+)\s*h(?:ours?)?\s*(\d+)?\s*m?/i);
  if (hm) return Number(hm[1]) * 60 + Number(hm[2] || 0);
  const onlyM = text.match(/^(\d+)\s*m(?:in(?:utes?)?)?$/i);
  if (onlyM) return Number(onlyM[1]);
  return null;
}

function splitWallClock(value?: string | null): {
  y: number;
  mo: number;
  d: number;
  h: number;
  mi: number;
  s: number;
} | null {
  if (!value) return null;
  const cleaned = String(value).trim();
  const m = cleaned.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/
  );
  if (m) {
    return {
      y: Number(m[1]),
      mo: Number(m[2]),
      d: Number(m[3]),
      h: Number(m[4]),
      mi: Number(m[5]),
      s: Number(m[6] || 0),
    };
  }
  const hm = cleaned.match(/^(\d{1,2}):(\d{2})/);
  if (!hm) return null;
  const now = new Date();
  return {
    y: now.getFullYear(),
    mo: now.getMonth() + 1,
    d: now.getDate(),
    h: Number(hm[1]),
    mi: Number(hm[2]),
    s: 0,
  };
}

function wallTimeInZoneToUtcMs(
  parts: { y: number; mo: number; d: number; h: number; mi: number; s: number },
  timeZone: string
): number | null {
  try {
    const utcGuess = Date.UTC(parts.y, parts.mo - 1, parts.d, parts.h, parts.mi, parts.s);
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    const asZoneUtc = (ms: number) => {
      const map: Record<string, string> = {};
      for (const p of formatter.formatToParts(new Date(ms))) {
        if (p.type !== "literal") map[p.type] = p.value;
      }
      return Date.UTC(
        Number(map.year),
        Number(map.month) - 1,
        Number(map.day),
        Number(map.hour),
        Number(map.minute),
        Number(map.second)
      );
    };
    return utcGuess - (asZoneUtc(utcGuess) - utcGuess);
  } catch {
    return null;
  }
}

function durationFromAirportLocalTimes(flight: FlightData): number | null {
  const depParts = splitWallClock(flight.departure?.scheduledTime);
  const arrParts = splitWallClock(flight.arrival?.scheduledTime);
  if (!depParts || !arrParts) return null;

  const depTz = flight.departure?.timezone || flight.origin?.timezone;
  const arrTz = flight.arrival?.timezone || flight.destination?.timezone;
  if (!depTz || !arrTz) return null;

  const depUtc = wallTimeInZoneToUtcMs(depParts, depTz);
  const arrUtc = wallTimeInZoneToUtcMs(arrParts, arrTz);
  if (depUtc == null || arrUtc == null) return null;

  let mins = Math.round((arrUtc - depUtc) / 60000);
  if (mins < 0) mins += 24 * 60;
  if (mins <= 0 || mins >= 72 * 60) return null;
  return mins;
}

function displayDuration(flight: FlightData): string | null {
  const fromApi = parseDurationToMinutes(flight.duration);
  const fromZones = durationFromAirportLocalTimes(flight);

  // Prefer timezone-aware block time when the API string is just a naive clock subtraction
  // (e.g. BOM 04:25 and DXB 06:00 looking like 1h 35m).
  if (fromZones != null && fromApi != null && Math.abs(fromZones - fromApi) > 15) {
    return formatMinutes(fromZones);
  }
  if (fromApi != null) return formatMinutes(fromApi);
  if (fromZones != null) return formatMinutes(fromZones);
  return null;
}

export function FlightItineraryStrip({ flight }: { flight: FlightData | null }) {
  if (!flight?.flightNum) return null;

  const origin = resolvePlace(flight.origin);
  const dest = resolvePlace(flight.destination);
  const depTerm = flight.departure?.terminal ? `T${String(flight.departure.terminal).replace(/^T/i, "")}` : null;
  const arrTerm = flight.arrival?.terminal ? `T${String(flight.arrival.terminal).replace(/^T/i, "")}` : null;
  const durationText = displayDuration(flight);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
      <style>{`
        @keyframes shafsky-flight-path {
          0% { left: 0; transform: translateY(-50%); }
          100% { left: 100%; transform: translate(-100%, -50%); }
        }
        .shafsky-flight-icon {
          animation: shafsky-flight-path 10s linear infinite;
        }
      `}</style>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
            {flight.flightNum}
          </span>
          {flight.carrier?.name && (
            <span className="truncate text-xs font-semibold text-slate-700">{flight.carrier.name}</span>
          )}
        </div>
        {durationText && (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            {durationText}
          </span>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
            Departure
          </div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 text-right">
            Arrival
          </div>
        </div>

        <div className="mt-0.5 flex items-center gap-3">
          <div className="min-w-0 max-w-[38%] shrink-0 text-base sm:text-lg font-serif font-bold text-slate-900 leading-tight">
            {origin.city}
          </div>
          <div className="relative min-h-6 flex-1 overflow-hidden">
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-slate-200 via-amber-400 to-slate-200" />
            <div className="shafsky-flight-icon absolute top-1/2 text-amber-600">
              <Plane className="h-3.5 w-3.5 rotate-45" />
            </div>
          </div>
          <div className="min-w-0 max-w-[38%] shrink-0 text-right text-base sm:text-lg font-serif font-bold text-slate-900 leading-tight">
            {dest.city}
          </div>
        </div>

        <div className="mt-0.5 flex items-start justify-between gap-3">
          <div className="min-w-0 max-w-[46%]">
            {origin.airport && (
              <div className="text-[11px] text-slate-600 font-sans leading-snug line-clamp-2">
                {origin.airport}
              </div>
            )}
            <div className="mt-1 text-[10px] text-slate-500 font-mono">
              {origin.code}
              {` · ${fmtTime(flight.departure?.scheduledTime)}`}
              {depTerm ? ` · ${depTerm}` : ""}
            </div>
          </div>
          <div className="min-w-0 max-w-[46%] text-right">
            {dest.airport && (
              <div className="text-[11px] text-slate-600 font-sans leading-snug line-clamp-2">
                {dest.airport}
              </div>
            )}
            <div className="mt-1 text-[10px] text-slate-500 font-mono">
              {dest.code}
              {` · ${fmtTime(flight.arrival?.scheduledTime)}`}
              {arrTerm ? ` · ${arrTerm}` : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
