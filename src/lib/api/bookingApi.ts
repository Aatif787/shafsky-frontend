/**
 * Canonical Booking API Client
 * (Shafsky Aviation Architecture - Phase 1 Foundation)
 */

import { apiFetch, ApiResponse } from "./client";
import { BookingItem } from "@/types/fastapi";

export interface CreateBookingPayload {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  origin: string;
  destination: string;
  depart_date: string;
  return_date?: string;
  trip_type?: "one_way" | "round_trip" | "multi_city";
  pax_adults: number;
  pax_children?: number;
  pax_infants?: number;
  package_id?: string;
  service_type?: string;
  services?: any[];
  notes?: string;
  flight_info?: any;
}

export interface CalculatePricePayload {
  package_id: string;
  origin: string;
  destination: string;
  pax_adults: number;
  pax_children?: number;
  pax_infants?: number;
  add_ons?: string[];
}

export interface PriceEstimateResponse {
  base_price: number;
  passengers_total: number;
  add_ons_total: number;
  subtotal: number;
  taxes: number;
  total_amount: number;
  currency: string;
}

export const bookingApi = {
  /**
   * Submit authoritative booking request to FastAPI backend
   */
  async create(payload: CreateBookingPayload, token?: string): Promise<ApiResponse<BookingItem>> {
    return apiFetch<BookingItem>("/api/bookings/", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    });
  },

  /**
   * Calculate authoritative price estimate from backend calculation engine
   */
  async calculatePrice(payload: CalculatePricePayload, token?: string): Promise<ApiResponse<PriceEstimateResponse>> {
    return apiFetch<PriceEstimateResponse>("/api/bookings/estimate-price", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    });
  },

  /**
   * Retrieve a single booking by reference or ID
   */
  async getByRef(reference: string, token?: string): Promise<ApiResponse<BookingItem>> {
    return apiFetch<BookingItem>(`/api/bookings/${reference}`, {
      method: "GET",
      token,
    });
  },

  /**
   * Cancel an existing booking
   */
  async cancel(bookingId: string, reason?: string, token?: string): Promise<ApiResponse<{ status: string }>> {
    return apiFetch<{ status: string }>(`/api/bookings/${bookingId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
      token,
    });
  },
};
