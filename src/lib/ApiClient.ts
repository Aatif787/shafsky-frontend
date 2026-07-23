/**
 * Enterprise REST API Client for Shafsky Aviation Frontend
 * Replaces direct Supabase client access with custom JWT Auth & Backend Microservices
 */

const getApiBaseUrl = (): string => {
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_BACKEND_API_URL) {
    return import.meta.env.VITE_BACKEND_API_URL;
  }
  if (typeof process !== "undefined" && process.env && process.env.VITE_BACKEND_API_URL) {
    return process.env.VITE_BACKEND_API_URL;
  }
  return "http://localhost:8001";
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

export interface AuthLoginResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      role: string;
      fullName?: string;
    };
  };
  error?: string;
}

export class ApiClient {
  /**
   * Custom Enterprise JWT Login
   */
  public static async login(email: string, password: string): Promise<AuthLoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      return (await response.json()) as AuthLoginResponse;
    } catch {
      return { success: false, error: "Network error connecting to backend authentication engine." };
    }
  }

  /**
   * Resolves flight duration via backend microservice API
   */
  public static async resolveFlightDuration(payload: FlightDurationApiRequest): Promise<FlightDurationApiResponse["data"]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/flight/duration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
   * Validates booking advance notice rules via backend microservice API
   */
  public static async validateFlightEligibility(departureTime: string, arrivalTime: string): Promise<FlightValidationApiResponse["data"]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/flight/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
