/**
 * Enterprise REST API Client for Shafsky Aviation Frontend
 * Forwards Supabase Auth JWT Access Tokens to FastAPI Backend Services
 */

import { supabase } from "@/integrations/supabase/client";

export const getApiBaseUrl = (): string => {
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_BACKEND_API_URL) {
    return import.meta.env.VITE_BACKEND_API_URL;
  }
  if (typeof process !== "undefined" && process.env && process.env.VITE_BACKEND_API_URL) {
    return process.env.VITE_BACKEND_API_URL;
  }
  return "http://127.0.0.1:8001";
};

const API_BASE_URL = getApiBaseUrl();

export interface FlightDurationApiRequest {
  duration?: string;
  scheduledDuration?: string;
  estimatedDuration?: string;
  blockTime?: string;
  flightTime?: string;
  depTimeIso?: string;
  arrTimeIso?: string;
  flightNum?: string;
  departDate?: string;
  originCode?: string;
  destCode?: string;
}

export interface FlightDurationApiResponse {
  success: boolean;
  data?: {
    duration: string;
    source: "Live" | "Calculated" | "Verified" | "Unavailable";
  };
  error?: string;
}

export interface FlightValidationApiResponse {
  success: boolean;
  data?: {
    isBookable: boolean;
    remainingTimeHours: number;
    blockingMessage?: string;
  };
  error?: string;
}

export class ApiClient {
  /**
   * Helper to retrieve active Supabase JWT Access Token header.
   */
  public static async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` };
      }
    } catch (err) {
      console.warn("[ApiClient] Failed to retrieve session access token:", err);
    }
    return {};
  }

  /**
   * Wrapper for making authenticated fetch requests to FastAPI backend.
   * Features automatic fallback between ports 8001 and 8003 if backend runs on alternate port.
   */
  public static async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const authHeaders = await ApiClient.getAuthHeaders();
    const primaryBase = API_BASE_URL.replace(/\/+$/, "");
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const primaryUrl = endpoint.startsWith("http") ? endpoint : `${primaryBase}${path}`;
    
    const headers = {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options.headers,
    };

    let controller: AbortController | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let signal = options.signal;

    if (!signal) {
      controller = new AbortController();
      signal = controller.signal;
      timeoutId = setTimeout(() => controller?.abort(), 12000);
    }

    try {
      const res = await fetch(primaryUrl, { ...options, headers, signal });
      if (timeoutId) clearTimeout(timeoutId);
      return res;
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      if (!endpoint.startsWith("http")) {
        const altBase = primaryBase.includes(":8001")
          ? primaryBase.replace(":8001", ":8003")
          : primaryBase.includes(":8003")
          ? primaryBase.replace(":8003", ":8001")
          : null;
        if (altBase) {
          try {
            const altController = new AbortController();
            const altTimeout = setTimeout(() => altController.abort(), 8000);
            const resAlt = await fetch(`${altBase}${path}`, { ...options, headers, signal: altController.signal });
            clearTimeout(altTimeout);
            return resAlt;
          } catch {
            // Fallthrough to throw primary error
          }
        }
      }
      throw err;
    }
  }

  /**
   * Resolves live/calculated flight duration via backend microservice API (/api/flight/duration).
   */
  public static async resolveFlightDuration(payload: FlightDurationApiRequest): Promise<FlightDurationApiResponse["data"]> {
    try {
      const response = await ApiClient.fetchWithAuth("/api/flight/duration", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return { duration: "Flight Duration Unavailable", source: "Unavailable" };
      }

      const resJson = (await response.json()) as FlightDurationApiResponse;
      if (resJson.success && resJson.data) {
        return resJson.data;
      }
    } catch (err) {
      console.warn("[ApiClient] Failed to contact backend API, returning fallback:", err);
    }

    return { duration: "Flight Duration Unavailable", source: "Unavailable" };
  }

  /**
   * Validates booking advance notice rules (6-hour rule) via backend microservice API (/api/flight/validate).
   */
  public static async validateFlightEligibility(departureTime: string, arrivalTime: string): Promise<FlightValidationApiResponse["data"]> {
    try {
      const response = await ApiClient.fetchWithAuth("/api/flight/validate", {
        method: "POST",
        body: JSON.stringify({ departureTime, arrivalTime }),
      });

      if (!response.ok) {
        return { isBookable: false, remainingTimeHours: 0, blockingMessage: "Failed to validate flight eligibility." };
      }

      const resJson = (await response.json()) as FlightValidationApiResponse;
      if (resJson.success && resJson.data) {
        return resJson.data;
      }
    } catch (err) {
      console.error("[ApiClient] Validation request failed:", err);
    }

    return { isBookable: false, remainingTimeHours: 0, blockingMessage: "Backend validation unavailable." };
  }
}
