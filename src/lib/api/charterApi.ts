import { apiFetch, ApiResponse } from "./client";

export interface CharterLeg {
  origin: string;
  destination: string;
  departure_date: string;
  departure_time?: string;
}

export interface CharterPassengers {
  adults: number;
  children: number;
  infants: number;
  total?: number;
}

export interface CharterRequestPayload {
  customer_name: string;
  country_code: string;
  phone: string;
  email: string;
  company?: string;
  preferred_contact_method: string;
  trip_type: "ONE_WAY" | "ROUND_TRIP" | "MULTI_CITY";
  origin?: string;
  destination?: string;
  departure_date?: string;
  departure_time?: string;
  return_date?: string;
  return_time?: string;
  itinerary: CharterLeg[];
  passengers: CharterPassengers;
  aircraft_preference: string;
  travel_requirements: string[];
  special_requests?: string;
}

export interface CharterRequestData {
  id?: string;
  request_reference: string;
  customer_name: string;
  country_code?: string;
  phone?: string;
  email?: string;
  company?: string;
  preferred_contact_method?: string;
  trip_type: string;
  origin: string;
  destination: string;
  departure_date: string;
  departure_time?: string;
  return_date?: string;
  return_time?: string;
  itinerary: CharterLeg[];
  passengers: CharterPassengers;
  aircraft_preference: string;
  travel_requirements: string[];
  special_requests?: string;
  status: string;
  assigned_staff_id?: string;
  assigned_staff_name?: string;
  internal_notes?: string;
  created_at: string;
  updated_at?: string;
}

export const charterApi = {
  /**
   * Submit a tailored private charter enquiry (100% Free, zero payment).
   */
  async submitRequest(payload: CharterRequestPayload): Promise<ApiResponse<CharterRequestData>> {
    return apiFetch<CharterRequestData>("/api/v1/charter/requests", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  /**
   * Public lookup for request reference (e.g. SC-10482).
   */
  async getByReference(reference: string): Promise<ApiResponse<CharterRequestData>> {
    return apiFetch<CharterRequestData>(`/api/v1/charter/requests/${encodeURIComponent(reference)}`, {
      method: "GET",
    });
  },

  /**
   * Admin: List charter requests with pagination & filters.
   */
  async listAdminRequests(params?: {
    status?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }): Promise<ApiResponse<CharterRequestData[]> & { total?: number }> {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    if (params?.skip !== undefined) query.set("skip", String(params.skip));
    if (params?.limit !== undefined) query.set("limit", String(params.limit));

    const url = `/api/v1/admin/charter/requests?${query.toString()}`;
    return apiFetch<CharterRequestData[]>(url, {
      method: "GET",
    });
  },

  /**
   * Admin: Get full details by ID.
   */
  async getAdminRequestById(id: string): Promise<ApiResponse<CharterRequestData>> {
    return apiFetch<CharterRequestData>(`/api/v1/admin/charter/requests/${id}`, {
      method: "GET",
    });
  },

  /**
   * Admin: Update status, staff assignment, and internal notes.
   */
  async updateAdminRequest(
    id: string,
    payload: {
      status?: string;
      assigned_staff_id?: string;
      assigned_staff_name?: string;
      internal_notes?: string;
    }
  ): Promise<ApiResponse<CharterRequestData>> {
    return apiFetch<CharterRequestData>(`/api/v1/admin/charter/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};
