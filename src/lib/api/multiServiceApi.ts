/**
 * Multi-Service & Connecting Flights API Client
 * Interfaces with /api/journey/multi-service/availability and /api/journey/multi-service/query
 */

import { ApiClient } from "@/lib/ApiClient";
import { resolveApiUrl } from "@/lib/api/config";
import { clearAccessToken } from "@/auth/tokenStore";

export interface FlightLegInput {
  origin_code: string;
  dest_code: string;
  flight_num?: string;
  service_date?: string;
  terminal?: string;
}

export type AirportServiceType = "DEPARTURE" | "ARRIVAL" | "TRANSIT";

export interface ServiceSelectionInput {
  service_type: AirportServiceType;
  package_slug?: string;
  airport_code?: string;
  terminal?: string;
}

export interface MultiServiceAvailabilityRequest {
  legs?: FlightLegInput[];
  origin_code?: string;
  dest_code?: string;
  transit_codes?: string[];
  flight_num?: string;
  flight_date?: string;
  flight_type?: string;
  selected_services: ServiceSelectionInput[];
  guest_count?: number;
  service_date?: string;
  service_time?: string;
}

export interface PackageItem {
  airport_service_id: string;
  service_id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  currency: string;
  display_priority?: number;
  features?: string[];
}

export interface ServiceItemAvailability {
  service_type: AirportServiceType;
  airport_code: string;
  airport_name?: string | null;
  city?: string | null;
  country?: string | null;
  is_airport_supported: boolean;
  status: "AVAILABLE" | "REQUEST_REQUIRED";
  status_reason?: string | null;
  package_slug?: string | null;
  package_name?: string | null;
  flight_type?: string | null;
  terminal?: string | null;
  unit_price?: number | null;
  total_price?: number | null;
  currency: string;
  is_bookable_online: boolean;
  available_packages: PackageItem[];
  notice_hours_required?: number | null;
  hours_remaining?: number | null;
  urgent_assistance?: {
    message: string;
    contact_phone?: string;
    contact_whatsapp?: string;
    hours_remaining?: number;
  } | null;
}

export interface CanonicalLeg {
  leg_index: number;
  origin_code: string;
  dest_code: string;
  flight_num?: string;
  service_date?: string;
  terminal?: string;
  origin_name?: string;
  dest_name?: string;
  origin_supported?: boolean;
  dest_supported?: boolean;
  is_domestic?: boolean;
}

export interface MultiServiceAvailabilityResponse {
  success: boolean;
  itinerary: {
    departure_airport: string;
    arrival_airport: string;
    transit_airports: string[];
    legs: CanonicalLeg[];
    is_connecting: boolean;
    total_legs: number;
  };
  services: ServiceItemAvailability[];
  all_available: boolean;
  any_available: boolean;
  none_available: boolean;
  guest_count: number;
  available_subtotal: number;
  total_payable: number;
  currency: string;
  unavailable_services_count: number;
  unavailable_message?: string | null;
}

export interface ServiceQueryCreate {
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  flight_num?: string;
  service_date?: string;
  booking_ref?: string;
  session_id?: string;
  itinerary?: Record<string, any>;
  requested_services: any[];
  unavailable_services: any[];
  notes?: string;
}

export interface ServiceQueryResponse {
  success: boolean;
  query_ref: string;
  message: string;
  created_at: string;
}

export const MultiServiceApi = {
  /**
   * Evaluates availability and authoritative pricing across an itinerary for any selected combination of services.
   * Public discovery endpoint (unauthenticated). Sends Bearer token only if an active session exists in memory,
   * and automatically recovers from stale tokens on 401 by clearing the expired token and retrying once unauthenticated.
   */
  async checkAvailability(
    request: MultiServiceAvailabilityRequest
  ): Promise<MultiServiceAvailabilityResponse> {
    const url = resolveApiUrl("/api/journey/multi-service/availability");
    let res = await ApiClient.fetchWithAuth(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(request),
    });

    // If 401 Unauthorized was returned, the in-memory token may be stale/expired.
    // Clear stale access token and retry once as an unauthenticated public request.
    if (res.status === 401) {
      try {
        clearAccessToken();
      } catch {
        // ignore
      }
      res = await ApiClient.fetchWithAuth(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(request),
      });
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message = err.detail || err.error || `Availability check failed (${res.status})`;
      const error: any = new Error(message);
      error.status = res.status;
      error.statusCode = res.status;
      throw error;
    }

    return res.json();
  },

  /**
   * Submits a consolidated service query when one or more services require concierge confirmation.
   */
  async createQuery(payload: ServiceQueryCreate): Promise<ServiceQueryResponse> {
    const url = resolveApiUrl("/api/journey/multi-service/query");
    let res = await ApiClient.fetchWithAuth(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 401) {
      try {
        clearAccessToken();
      } catch {
        // ignore
      }
      res = await ApiClient.fetchWithAuth(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message = err.detail || err.error || `Query submission failed (${res.status})`;
      const error: any = new Error(message);
      error.status = res.status;
      error.statusCode = res.status;
      throw error;
    }

    return res.json();
  },
};
