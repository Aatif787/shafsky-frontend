/**
 * Airport search client.
 * supported → existing /api/journey/airports (Neon supported_airports)
 * global → /api/airports/search?scope=global (airports.csv only)
 * These sources are never mixed.
 */

import { apiFetch, ApiResponse } from "./client";

export interface AirportInfo {
  id?: string;
  code: string;
  name: string;
  city: string;
  country: string;
  timezone?: string;
  terminals?: string[];
  is_supported?: boolean;
}

export interface ServiceAirportResolution {
  success: boolean;
  valid: boolean;
  is_supported: boolean;
  journey_type?: string;
  flight_type?: string | null;
  service_airport?: string | null;
  airport?: AirportInfo;
  error?: string;
}

function extractList(res: any): any[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.airports)) return res.airports;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  if (res.data && Array.isArray(res.data.airports)) return res.data.airports;
  return [];
}

function normalizeAirport(a: any): AirportInfo | null {
  const code = String(a?.code || a?.iata_code || a?.iata || "").trim().toUpperCase();
  if (!code || code.length !== 3) return null;
  return {
    id: a?.id ? String(a.id) : undefined,
    code,
    name: a?.name || a?.airport_name || `${code} Airport`,
    city: a?.city || "",
    country: a?.country || "",
    timezone: a?.timezone,
    is_supported: a?.is_supported !== false,
  };
}

export function formatAirportOption(airport: Pick<AirportInfo, "name" | "city" | "code">): string {
  const name = airport.name || "Airport";
  const city = airport.city || "";
  const code = airport.code || "";
  if (city && code) return `${name} — ${city} (${code})`;
  if (code) return `${name} (${code})`;
  return name;
}

let supportedAirportCache: { key: string; rows: AirportInfo[]; at: number } | null = null;

export const airportApi = {
  async search(
    query: string,
    scope: "global" | "supported" = "global",
    journeyType?: string
  ): Promise<ApiResponse<AirportInfo[]>> {
    if (scope === "supported") {
      return this.listSupported(query, journeyType);
    }

    const params = new URLSearchParams({ q: query || "" });
    let res = await apiFetch(`/api/global-airports?${params.toString()}`, {
      method: "GET",
      timeoutMs: 15000,
    });
    let rows = extractList(res).map(normalizeAirport).filter(Boolean) as AirportInfo[];
    if (!rows.length) {
      const fallback = await apiFetch(`/api/airports/search?scope=global&${params.toString()}`, {
        method: "GET",
        timeoutMs: 15000,
      });
      rows = extractList(fallback).map(normalizeAirport).filter(Boolean) as AirportInfo[];
    }
    return { success: true, data: rows };
  },

  async listSupported(query?: string, journeyType?: string): Promise<ApiResponse<AirportInfo[]>> {
    const cacheKey = (journeyType || "ALL").toUpperCase();
    const now = Date.now();
    let allRows = supportedAirportCache && supportedAirportCache.key === cacheKey && now - supportedAirportCache.at < 60_000
      ? supportedAirportCache.rows
      : null;

    if (!allRows) {
      const params = new URLSearchParams();
      if (journeyType) params.set("journey_type", journeyType);
      const qs = params.toString();
      const path = qs ? `/api/journey/airports?${qs}` : `/api/journey/airports`;
      const res = await apiFetch(path, { method: "GET", timeoutMs: 60000 });
      allRows = extractList(res).map(normalizeAirport).filter(Boolean) as AirportInfo[];

      if (!allRows.length) {
        const fallbackParams = new URLSearchParams({ scope: "supported", q: "" });
        if (journeyType) fallbackParams.set("journey_type", journeyType);
        const fallback = await apiFetch(`/api/airports/search?${fallbackParams.toString()}`, {
          method: "GET",
          timeoutMs: 60000,
        });
        allRows = extractList(fallback).map(normalizeAirport).filter(Boolean) as AirportInfo[];
      }

      if (!allRows.length && (!res || (res.success === false && !extractList(res).length))) {
        return { success: false, error: res?.error || "Unable to load supported airports.", data: [] } as any;
      }
      if (allRows.length) {
        supportedAirportCache = { key: cacheKey, rows: allRows, at: now };
      }
    }

    const q = (query || "").trim().toUpperCase();
    const rows = !q
      ? allRows
      : allRows.filter((a) =>
          a.code.toUpperCase().includes(q) ||
          (a.name || "").toUpperCase().includes(q) ||
          (a.city || "").toUpperCase().includes(q) ||
          (a.country || "").toUpperCase().includes(q)
        );
    return { success: true, data: rows };
  },

  async resolveServiceAirport(payload: {
    journey_type: string;
    origin?: string;
    destination?: string;
    transit?: string;
    flight_type?: string;
  }): Promise<ServiceAirportResolution> {
    const res = await apiFetch<ServiceAirportResolution>(`/api/journey/resolve-service-airport`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res || (res as any).success === false) {
      return {
        success: false,
        valid: false,
        is_supported: false,
        error:
          (res as any)?.error ||
          "This airport is currently not supported for online booking.",
      };
    }
    const data = (res as any).data || res;
    return data as ServiceAirportResolution;
  },

  async getPackages(airportCode: string, journeyType?: string): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams({ airport: airportCode });
    if (journeyType) params.set("journey_type", journeyType);

    return apiFetch<any[]>(`/api/airport/services?${params.toString()}`, {
      method: "GET",
    });
  },
};
