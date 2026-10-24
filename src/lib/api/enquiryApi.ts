import { apiFetch, ApiResponse } from "./client";

export type EnquiryCategory =
  | "Ground Transport"
  | "Transport"
  | "Round Trip"
  | "Ticketing"
  | "Travel Support"
  | "Medical Assistance"
  | "Cargo & Logistics";

export interface ServiceEnquiryPayload {
  passengerName: string;
  firstName?: string;
  lastName?: string;
  passengerEmail: string;
  passengerPhone: string;
  serviceCategory: EnquiryCategory;
  serviceType: string;
  origin?: string;
  destination?: string;
  serviceDate?: string;
  notes?: string;
  details?: Record<string, unknown>;
}

export interface ServiceEnquiryData {
  id: string;
  bookingRef: string;
  passengerName: string;
  serviceCategory: string;
  serviceType: string;
  status: string;
  createdAt?: string | null;
}

export const enquiryApi = {
  async submit(payload: ServiceEnquiryPayload): Promise<ApiResponse<ServiceEnquiryData>> {
    const trimmedName = (payload.passengerName || "").trim();
    if (!trimmedName || !/^[A-Za-z\s]+$/.test(trimmedName)) {
      throw new Error("Please enter a valid passenger name using letters only.");
    }
    return apiFetch<ServiceEnquiryData>("/api/bookings/enquiries", {
      method: "POST",
      body: JSON.stringify({ ...payload, passengerName: trimmedName }),
      headers: { "Content-Type": "application/json" },
    });
  },
};
