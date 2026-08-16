/**
 * Canonical Airport API Client
 * (Shafsky Aviation Architecture - Phase 1 Foundation)
 */

import { apiFetch, ApiResponse } from "./client";

export interface AirportInfo {
  code: string;
  name: string;
  city: string;
  country: string;
  terminals?: string[];
  is_supported?: boolean;
}

export const airportApi = {
  /**
   * Search supported airport registry
   */
  async search(query: string): Promise<ApiResponse<AirportInfo[]>> {
    return apiFetch<AirportInfo[]>(`/api/airports/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
    });
  },

  /**
   * Get airport package catalog availability
   */
  async getPackages(airportCode: string, journeyType?: string): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams({ airport: airportCode });
    if (journeyType) params.set("journey_type", journeyType);

    return apiFetch<any[]>(`/api/airport/services?${params.toString()}`, {
      method: "GET",
    });
  },
};
