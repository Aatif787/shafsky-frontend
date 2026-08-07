import { useState, useEffect, useCallback } from "react";
import { ApiClient } from "@/lib/ApiClient";

export interface AvailableServiceItem {
  airport_service_id: string;
  service_id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  icon?: string;
  journey_type: string;
  flight_type?: string;
  terminal?: string | null;
  features?: string[];
  additional_benefits?: string[];
  min_booking_notice_hours: number;
  display_priority: number;
  price?: number;
  currency?: string;
  is_bookable_online: boolean;
  urgent_assistance?: UrgentAssistanceInfo | null;
}

export interface DetectedAirportInfo {
  iata_code?: string;
  airport_name?: string;
  city?: string;
  country?: string;
  timezone?: string;
  is_supported: boolean;
}

export interface UrgentAssistanceInfo {
  is_urgent: boolean;
  message: string;
  hours_remaining?: number | null;
  min_notice_required_hours?: number | null;
  contact_phone: string;
  contact_whatsapp: string;
  request_callback_available: boolean;
}

export interface JourneyDetectionResult {
  success: boolean;
  departure_airport?: DetectedAirportInfo | null;
  arrival_airport?: DetectedAirportInfo | null;
  transit_airport?: DetectedAirportInfo | null;
  journey_type: string;
  primary_airport?: DetectedAirportInfo | null;
  is_supported: boolean;
  available_terminals?: string[];
  selected_terminal?: string | null;
  available_services: AvailableServiceItem[];
  urgent_assistance?: UrgentAssistanceInfo | null;
  requested_service_slug?: string | null;
  is_requested_service_available?: boolean;
  unavailable_message?: string | null;
}

interface UseJourneyEngineParams {
  departureCode?: string;
  arrivalCode?: string;
  journeyType?: "arrival" | "departure" | "transit";
  serviceDate?: string;
  serviceTime?: string;
  requestedServiceSlug?: string;
  terminal?: string;
  enabled?: boolean;
}

export function useJourneyEngine({
  departureCode,
  arrivalCode,
  journeyType = "arrival",
  serviceDate,
  serviceTime = "12:00",
  requestedServiceSlug,
  terminal,
  enabled = true,
}: UseJourneyEngineParams) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JourneyDetectionResult | null>(null);

  const detectJourney = useCallback(async () => {
    if (!enabled || (!departureCode && !arrivalCode) || !serviceDate) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ApiClient.fetchWithAuth("/api/journey/detect", {
        method: "POST",
        body: JSON.stringify({
          departure_code: departureCode ? departureCode.trim().toUpperCase() : null,
          arrival_code: arrivalCode ? arrivalCode.trim().toUpperCase() : null,
          journey_type: journeyType.toUpperCase(),
          service_date: serviceDate,
          service_time: serviceTime,
          requested_service_slug: requestedServiceSlug || null,
          terminal: terminal || null,
        }),
      });

      const resJson = await response.json();

      if (response.ok && resJson.success !== false) {
        setResult(resJson);
      } else {
        setError(resJson.error || "Failed to detect journey details.");
        // Fallback default result for unsupported or offline backend
        setResult({
          success: false,
          journey_type: journeyType.toUpperCase(),
          is_supported: false,
          available_services: [],
        });
      }
    } catch (err: any) {
      console.warn("[useJourneyEngine] Network or server error, falling back:", err);
      setError(err?.message || "Journey detection service unreachable.");
    } finally {
      setLoading(false);
    }
  }, [departureCode, arrivalCode, journeyType, serviceDate, serviceTime, requestedServiceSlug, enabled]);

  useEffect(() => {
    detectJourney();
  }, [detectJourney]);

  return {
    loading,
    error,
    result,
    refetch: detectJourney,
    isSupported: result?.is_supported ?? true,
    availableServices: result?.available_services || [],
    primaryAirport: result?.primary_airport,
    urgentAssistance: result?.urgent_assistance,
    isRequestedServiceAvailable: result?.is_requested_service_available ?? true,
    unavailableMessage: result?.unavailable_message,
  };
}
