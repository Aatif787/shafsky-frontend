import { apiFetch, ApiResponse } from "./client";

export type LoungeCategory = "Domestic" | "International";

export interface AirportOptionItem {
  code: string;
  name: string;
  city: string;
  country: string;
  timezone?: string;
}

export interface CutoffRule {
  notice_hours: number;
  grace_period_hours: number;
  notice_text: string;
}

export interface LoungeOptionsResponse {
  airports: AirportOptionItem[];
  lounge_types: string[];
  domestic_lounge_types: string[];
  international_lounge_types: string[];
  preferred_times: string[];
  server_time: string;
  cutoff_rules: Record<string, CutoffRule>;
}

export interface LoungeEligibilityCheckPayload {
  lounge_category: LoungeCategory;
  travel_date: string;
  preferred_time: string;
  airport?: string;
}

export interface LoungeEligibilityResult {
  eligible: boolean;
  is_grace_period: boolean;
  lead_time_hours: number;
  required_notice_hours: number;
  grace_period_hours: number;
  min_required_hours: number;
  airport_timezone: string;
  server_time: string;
  scheduled_time: string;
  message: string;
}

export interface LoungeEnquirySubmission {
  full_name: string;
  mobile_number: string;
  email_address: string;
  whatsapp_number?: string;
  airport: string;
  lounge_category: LoungeCategory;
  lounge_type: string;
  travel_date: string;
  preferred_time: string;
  number_of_passengers: number;
  flight_number?: string;
  additional_requirements?: string;
}

export interface LoungeEnquiryResponseData {
  id: string;
  enquiry_reference: string;
  airport: string;
  lounge_category?: string;
  lounge_type: string;
  travel_date: string;
  preferred_time: string;
  number_of_passengers: number;
  flight_number?: string | null;
  full_name: string;
  mobile_number: string;
  email_address: string;
  whatsapp_number?: string | null;
  additional_requirements?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const loungeApi = {
  async getOptions(): Promise<ApiResponse<LoungeOptionsResponse>> {
    return apiFetch<LoungeOptionsResponse>("/api/v1/lounges/options", {
      method: "GET",
    });
  },

  async checkEligibility(
    payload: LoungeEligibilityCheckPayload
  ): Promise<ApiResponse<LoungeEligibilityResult>> {
    return apiFetch<LoungeEligibilityResult>("/api/v1/lounges/check-eligibility", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async submit(
    payload: LoungeEnquirySubmission
  ): Promise<ApiResponse<LoungeEnquiryResponseData>> {
    return apiFetch<LoungeEnquiryResponseData>("/api/v1/lounges/enquiries", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
