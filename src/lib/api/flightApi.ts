/**
 * Canonical Flight API Client
 * (Shafsky Aviation Services Architecture - Phase 1 Foundation)
 */

import { apiFetch, ApiResponse } from "./client";
import { FlightData } from "@/services/flight/FlightTypes";

export interface FlightSearchPayload {
  flightNum: string;
  departDate?: string;
  tripType?: string;
}

export const flightApi = {
  /**
   * Search/Verify flight information from backend provider integrations
   */
  async verify(payload: FlightSearchPayload, token?: string): Promise<ApiResponse<FlightData>> {
    const params = new URLSearchParams();
    params.set("flight_number", payload.flightNum);
    if (payload.departDate) params.set("date", payload.departDate);
    if (payload.tripType) params.set("trip_type", payload.tripType);

    return apiFetch<FlightData>(`/api/flights/verify?${params.toString()}`, {
      method: "GET",
      token,
      timeoutMs: 20000,
    });
  },

  /**
   * Fetch live flight status updates
   */
  async getStatus(flightNum: string, token?: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/api/flights/status/${encodeURIComponent(flightNum)}`, {
      method: "GET",
      token,
    });
  },
};
