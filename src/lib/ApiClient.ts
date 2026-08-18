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
  return "http://127.0.0.1:8003";
};

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
   */
  public static async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const authHeaders = await ApiClient.getAuthHeaders();
    const primaryBase = getApiBaseUrl().replace(/\/+$/, "");
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
      timeoutId = setTimeout(() => controller?.abort(), 35000);
    }

    try {
      const res = await fetch(primaryUrl, { ...options, headers, signal });
      if (timeoutId) clearTimeout(timeoutId);
      return res;
    } catch (err: any) {
      if (timeoutId) clearTimeout(timeoutId);

      if (err?.name === "AbortError") {
        console.warn(`[ApiClient] Request to ${primaryUrl} timed out after 35s.`);
        const timeoutErr: any = new Error("REQUEST_TIMEOUT: The server took too long to respond. Please try again.");
        timeoutErr.name = "TimeoutError";
        timeoutErr.code = "REQUEST_TIMEOUT";
        throw timeoutErr;
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
