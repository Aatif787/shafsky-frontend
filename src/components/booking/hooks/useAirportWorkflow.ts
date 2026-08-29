import { useState, useEffect, useCallback } from "react";
import { getAirportRegistryEntry } from "@/data/airportRegistry";
import { FlightData } from "@/services/flight/FlightTypes";
import { ApiClient } from "@/lib/ApiClient";
import { airportApi } from "@/lib/api/airportApi";
import { toast } from "sonner";
import {
  fetchAirportServices,
  computePriceBreakdown,
  PackageCatalogItem,
  ServiceCatalogItem,
  PriceBreakdown,
} from "../utils/serviceAirportResolver";
import { indianMobileDigits } from "../validation/sharedValidation";

export type FlightValidationMode = "IDLE" | "LOADING" | "VERIFIED" | "ERROR" | "MANUAL";

export interface AirportWorkflowState {
  airportCode: string;
  airportName: string;
  direction: "arrival" | "departure" | "transit";
  bookingMode: "individual" | "package";
  selectedService: string;
  selectedPackage: string;
  serviceDate: string;
  serviceTime: string;
  guestCount: number;
  fullName: string;
  phone: string;
  email: string;
  flightNumber: string;
  specialRequests: string;
  isFlightValidated: boolean;
  validatedFlightData: FlightData | null;
  selectedTerminal?: string;
  isManualMode?: boolean;
  flightStateMode?: FlightValidationMode;
  flightErrorMessage?: string;
  routeMatchError?: string;
  isLoadingServices?: boolean;
  serviceFetchError?: string | null;
  isAirportCovered?: boolean;
  catalogCurrency?: string;
  availablePackagesList?: PackageCatalogItem[];
  availableServicesList?: ServiceCatalogItem[];
  selectedPackageId?: string | null;
  selectedServiceIds?: string[];
  isValidatingBooking?: boolean;
  validationErrors?: string[];
  authoritativeValidationResult?: any;
  hasPriceChanged?: boolean;
  isSavingDraft?: boolean;
  draftFieldErrors?: Record<string, string>;
  bookingRef?: string;
  originCode?: string;
  destCode?: string;
  transitCode?: string;
  travelType?: "domestic" | "international";
  flightType?: string;
  isResolvingAirport?: boolean;
  resolvedAirport?: any;
  isFlightLocked?: boolean;
  bookingSource?: "airport_page" | "generic";
}

/**
 * Formats flight validation errors into user-friendly messages.
 * Properly exposes actual backend error messages instead of masking them as generic "Backend unavailable".
 */
export function formatFlightLookupError(error: unknown, status?: number): string {
  try {
    // Extract the best available error message from various possible formats
    let rawString: string = "";
    let errorCode: string = "";

    if (typeof error === "string") {
      rawString = error;
    } else if (typeof (error as any)?.error === "string") {
      rawString = (error as any).error;
      if (typeof (error as any)?.code === "string") {
        errorCode = (error as any).code;
      }
    } else if (typeof (error as any)?.message === "string") {
      rawString = (error as any).message;
      if (typeof (error as any)?.code === "string") {
        errorCode = (error as any).code;
      }
    } else if (typeof (error as any)?.code === "string") {
      errorCode = (error as any).code;
      rawString = (error as any).code;
    } else if (error && typeof error === "object") {
      if ((error as any)?.code) {
        errorCode = (error as any).code;
      }
      if (typeof (error as any)?.error?.message === "string") {
        rawString = (error as any).error.message;
      } else if (typeof (error as any)?.error?.error === "string") {
        rawString = (error as any).error.error;
      } else {
        rawString = JSON.stringify(error || "");
      }
    }

    const upper = rawString.toUpperCase();

    // ===== TIMEOUT ERRORS =====
    if (
      upper.includes("TIMEOUT") ||
      upper.includes("TIMED OUT") ||
      upper.includes("REQUEST_TIMEOUT") ||
      upper.includes("ABORT") ||
      status === 408
    ) {
      return `Flight validation request timed out. The server took too long to respond. Please try again or enter flight details manually.`;
    }

    // ===== PROVIDER HAS NO SCHEDULE PUBLISHED FOR THIS DATE (422) =====
    // The flight number may be valid; our data provider simply does not publish
    // schedules this far out. Manual entry is the expected path, not a retry.
    if (errorCode === "FLIGHT_SCHEDULE_UNAVAILABLE") {
      if (rawString.length > 5 && !rawString.startsWith("{")) {
        return rawString;
      }
      return `Flight schedules for this date are not published by our data provider yet. Please enter the flight times and airports manually to continue.`;
    }

    // ===== FLIGHT NOT FOUND / INVALID DATE (404) =====
    if (
      status === 404 ||
      errorCode === "FLIGHT_NOT_FOUND" ||
      upper.includes("FLIGHT_NOT_FOUND") ||
      upper.includes("NO SCHEDULE") ||
      upper.includes("COULD NOT BE FOUND") ||
      upper.includes("NOT FOUND")
    ) {
      if (rawString.length < 200 && rawString.length > 5 && !rawString.startsWith("{") && !rawString.includes("FLIGHT_NOT_FOUND")) {
        return rawString;
      }
      return `No flight schedule found for this flight number on the selected date. Please check the flight number and travel date, or enter flight details manually.`;
    }

    // ===== INVALID FLIGHT NUMBER / FORMAT (400 / 422) =====
    if (
      upper.includes("INVALID_FLIGHT") ||
      upper.includes("INVALID FORMAT") ||
      upper.includes("INVALID_FLIGHT_NUMBER") ||
      upper.includes("MALFORMED") ||
      errorCode === "INVALID_FORMAT" ||
      errorCode === "INVALID_DATE"
    ) {
      if (rawString.length < 200 && rawString.length > 5 && !rawString.startsWith("{")) {
        return rawString;
      }
      return `The flight number format is invalid. Please check the airline code and flight number format (e.g., AI302, EK504, BA127).`;
    }

    // ===== RATE LIMITING =====
    if (
      upper.includes("RATE_LIMIT") ||
      upper.includes("RATE LIMIT") ||
      upper.includes("TOO_MANY_REQUESTS") ||
      status === 429
    ) {
      return `Too many requests. Please wait a moment and try again, or enter flight details manually.`;
    }

    // ===== ADVANCE NOTICE / BOOKING WINDOW RESTRICTIONS =====
    if (
      upper.includes("ADVANCE_NOTICE") ||
      upper.includes("6_HOUR") ||
      upper.includes("MINIMUM_LEAD_TIME") ||
      upper.includes("BOOKING_WINDOW")
    ) {
      return `This flight departs too soon for online service booking. Please contact our 24/7 VIP Command Desk at +1-800-VIP-DESK for instant manual dispatch.`;
    }

    // ===== FLIGHT DATA PROVIDER ERRORS (External API failures) =====
    if (
      upper.includes("PROVIDER_ERROR") ||
      upper.includes("AVIATION_EDGE") ||
      upper.includes("PROVIDER_FAILURE") ||
      upper.includes("AERODATABOX") ||
      errorCode === "SERVICE_ERROR" ||
      errorCode === "PROVIDER_ERROR"
    ) {
      return `Flight data provider temporarily unavailable. Our data service is experiencing issues. Please try again or enter flight details manually.`;
    }

    // ===== VALIDATION ERRORS (400 / 422) =====
    if (status === 400 || status === 422) {
      if (rawString.length < 200 && rawString.length > 5 && !rawString.startsWith("{")) {
        return rawString;
      }
      return `Flight validation failed. Please check your flight number, date, and airport selection or enter flight details manually.`;
    }

    // ===== NETWORK-LEVEL ERRORS (Actual connection failures) =====
    if (
      upper.includes("FAILED TO FETCH") ||
      upper.includes("ERR_CONNECTION_REFUSED") ||
      upper.includes("NETWORKERROR") ||
      upper.includes("ECONNREFUSED") ||
      status === 502 ||
      status === 503 ||
      status === 504
    ) {
      return `Backend service is currently unavailable. The flight validation server cannot be reached. Please check backend server status or enter flight details manually.`;
    }

    // ===== SERVER ERRORS (500) =====
    if (status === 500) {
      if (rawString.length < 200 && rawString.length > 5 && !rawString.startsWith("{")) {
        return rawString;
      }
      return `Server error during flight validation. Please try again in a moment or enter flight details manually.`;
    }

    // ===== UNEXPECTED / FALLBACK =====
    if (rawString.length < 200 && rawString.length > 5 && !rawString.startsWith("{")) {
      return rawString;
    }

    return `Unable to validate flight details. Please verify your flight information or enter flight details manually.`;
  } catch {
    return `Unable to process flight validation response. Please enter flight details manually.`;
  }
}

/** Wall-clock HH:MM from an ISO/local scheduled string (not a hardcoded default). */
export function hhmmFromScheduled(value?: string | null): string {
  if (!value) return "";
  const cleaned = String(value).trim();
  const iso = cleaned.match(/T(\d{2}):(\d{2})/);
  if (iso) return `${iso[1]}:${iso[2]}`;
  const hm = cleaned.match(/^(\d{1,2}):(\d{2})/);
  if (hm) return `${String(hm[1]).padStart(2, "0")}:${hm[2]}`;
  return "";
}

/** Arrival bookings use flight arrival; departure uses flight departure. Empty until a real time exists. */
export function resolveBookingServiceTime(state: {
  direction: AirportWorkflowState["direction"];
  serviceTime?: string;
  validatedFlightData?: AirportWorkflowState["validatedFlightData"];
}): string {
  const flight = state.validatedFlightData;
  if (flight) {
    const raw =
      state.direction === "departure"
        ? flight.departure?.scheduledTime
        : flight.arrival?.scheduledTime;
    const clock = hhmmFromScheduled(raw);
    if (clock) return clock;
  }
  const stored = (state.serviceTime || "").trim();
  if (stored && stored !== "14:30" && stored !== "12:00") return stored;
  return "";
}

export function formatBookingServiceDateTime(state: {
  direction: AirportWorkflowState["direction"];
  serviceDate?: string;
  serviceTime?: string;
  validatedFlightData?: AirportWorkflowState["validatedFlightData"];
}): string {
  const date = (state.serviceDate || "").trim();
  const time = resolveBookingServiceTime(state);
  if (date && time) return `${date} @ ${time}`;
  if (date) return date;
  if (time) return time;
  return "—";
}

export function useAirportWorkflow(searchParamsOrService?: any, initialOriginArg?: string) {
  let searchParams: any = {};
  if (typeof searchParamsOrService === "object" && searchParamsOrService !== null) {
    searchParams = searchParamsOrService;
  } else {
    searchParams = {
      service_id: searchParamsOrService,
      origin: initialOriginArg,
    };
  }

  const extractIata = (raw?: string) => {
    if (!raw) return "";
    const match = String(raw).match(/\(([A-Z]{3})\)/);
    if (match) return match[1];
    const cleaned = String(raw).trim().toUpperCase();
    return cleaned.length === 3 ? cleaned : "";
  };

  const isAirportPageBooking =
    String(searchParams?.source || searchParams?.booking_source || "").toLowerCase() === "airport_page";

  const initialDirection: "arrival" | "departure" | "transit" =
    (searchParams?.direction as any) || "arrival";

  const initialOrigin = extractIata(searchParams?.origin);
  const initialDest = extractIata(searchParams?.destination);
  const initialTransit = extractIata(searchParams?.transit);
  const pageAirport =
    extractIata(searchParams?.airport) ||
    extractIata(searchParams?.airport_id);
  const initialServiceAirport =
    pageAirport ||
    (initialDirection === "arrival"
      ? initialDest
      : initialDirection === "departure"
        ? initialOrigin
        : initialTransit);

  const extractedCode = initialServiceAirport;

  const initialTravelType: "domestic" | "international" =
    String(searchParams?.travel_type || searchParams?.flight_type || "international").toLowerCase() === "domestic"
      ? "domestic"
      : "international";

  const isFromHero = Boolean(searchParams?.from_hero || searchParams?.validated);
  const initialFlightNumber = searchParams?.flight_number || "";

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [busy, setBusy] = useState<boolean>(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  // Look up initial airport name from airportRegistry
  const initialRegistryEntry = getAirportRegistryEntry(extractedCode);
  const initialAirportName =
    searchParams?.airport_name ||
    initialRegistryEntry?.name ||
    (extractedCode ? `${extractedCode} Airport` : "Select airport");

  const [state, setState] = useState<AirportWorkflowState>({
    airportCode: extractedCode,
    airportName: initialAirportName,
    bookingSource: isAirportPageBooking ? "airport_page" : "generic",
    direction: initialDirection,
    originCode: isAirportPageBooking && initialDirection === "departure" ? extractedCode : initialOrigin,
    destCode: isAirportPageBooking && initialDirection === "arrival" ? extractedCode : initialDest,
    transitCode: isAirportPageBooking && initialDirection === "transit" ? extractedCode : initialTransit,
    travelType: initialTravelType,
    bookingMode: "package",
    selectedService: searchParams?.package_id || "",
    selectedPackage: searchParams?.package_id || "",
    serviceDate: searchParams?.depart_date || "",
    serviceTime: searchParams?.service_time || "",
    guestCount: Math.max(1, Number(searchParams?.pax_adults) || 1),
    fullName: "",
    phone: "",
    email: "",
    flightNumber: initialFlightNumber,
    specialRequests: searchParams?.notes || "",
    isFlightValidated: false,
    validatedFlightData: null,
    selectedTerminal: searchParams?.terminal || "",
    flightStateMode: "IDLE",
    isManualMode: false,
    isAirportCovered: true,
    selectedPackageId: searchParams?.package_id || null,
    resolvedAirport: extractedCode
      ? {
          code: extractedCode,
          name: initialAirportName,
          city: initialRegistryEntry?.city || "",
          country: initialRegistryEntry?.country || "",
        }
      : undefined,
  });

  // Hydrate browser-only state after mount
  useEffect(() => {
    if (!searchParams?.depart_date) {
      const today = new Date().toISOString().split("T")[0];
      setState((prev) => (prev.serviceDate ? prev : { ...prev, serviceDate: today }));
    }

    if (typeof window !== "undefined") {
      try {
        const cached = isFromHero ? null : sessionStorage.getItem("shafsky_validated_flight");
        if (cached) {
          const parsed = JSON.parse(cached) as FlightData;
          if (parsed && parsed.flightNum) {
            const rawTerm = initialDirection === "arrival" ? parsed.arrival?.terminal : parsed.departure?.terminal;
            let inferredTerminal: string | undefined = undefined;
            if (rawTerm) {
              const tStr = String(rawTerm).trim();
              if (tStr.includes("3") || tStr.toUpperCase().includes("T3")) {
                inferredTerminal = "Terminal 3";
              } else if (tStr.includes("1") || tStr.includes("2") || tStr.toUpperCase().includes("T1") || tStr.toUpperCase().includes("T2")) {
                inferredTerminal = "Terminal 1 & 2";
              }
            }

            setState((prev) => ({
              ...prev,
              isFlightValidated: true,
              validatedFlightData: parsed,
              flightNumber: parsed.flightNum || prev.flightNumber,
              selectedTerminal: inferredTerminal || prev.selectedTerminal,
              flightStateMode: "VERIFIED",
              isFlightLocked: false,
            }));
          }
        }
      } catch {
        // ignore cache error
      }
    }

    if (isFromHero && extractedCode) {
      setCurrentStep(searchParams?.package_id ? 3 : 2);
    }
  }, []);

  const updateState = (fields: Partial<AirportWorkflowState>) => {
    setState((prev) => ({ ...prev, ...fields }));
  };

  // ─── CANONICAL MASTER CATALOG FETCHING EFFECT ───
  // Reads ONLY from selected state.airportCode and state.direction.
  // ZERO automatic airport replacement!
  useEffect(() => {
    if (!state.airportCode) return;
    const controller = new AbortController();

    const loadCatalog = async () => {
      setState((prev) => ({
        ...prev,
        isLoadingServices: true,
        serviceFetchError: null,
      }));

      try {
        const fetchRes = await fetchAirportServices(
          state.airportCode,
          state.direction,
          controller.signal,
          {
            origin: state.originCode || state.validatedFlightData?.origin?.code || undefined,
            destination: state.destCode || state.validatedFlightData?.destination?.code || undefined,
            terminal: state.selectedTerminal,
            flightType: state.travelType,
            transit: state.transitCode,
          }
        );

        if (controller.signal.aborted) return;

        if (fetchRes.success) {
          const derivedFt = String(fetchRes.flightType || "").toLowerCase();
          setState((prev) => ({
            ...prev,
            isLoadingServices: false,
            isAirportCovered: fetchRes.isCovered,
            catalogCurrency: fetchRes.currency || "INR",
            availableServicesList: fetchRes.services,
            availablePackagesList: fetchRes.packages,
            flightType: fetchRes.flightType,
            travelType:
              derivedFt === "international" || derivedFt === "domestic"
                ? (derivedFt as "domestic" | "international")
                : prev.travelType,
            airportName: fetchRes.airport?.name || prev.airportName,
            resolvedAirport: fetchRes.airport
              ? {
                  code: fetchRes.airport.code || prev.airportCode,
                  name: fetchRes.airport.name || prev.airportName,
                  city: fetchRes.airport.city || "",
                  country: fetchRes.airport.country || "",
                }
              : prev.resolvedAirport,
            serviceFetchError: null,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            isLoadingServices: false,
            isAirportCovered: fetchRes.isCovered,
            availableServicesList: [],
            availablePackagesList: [],
            serviceFetchError: fetchRes.error || `Unable to load service catalog for ${state.airportName}.`,
          }));
        }
      } catch (err: any) {
        if (err.name === "AbortError" || controller.signal.aborted) return;
        setState((prev) => ({
          ...prev,
          isLoadingServices: false,
          serviceFetchError: `Network connection issue while loading services. Please retry.`,
        }));
      }
    };

    loadCatalog();

    return () => {
      controller.abort();
    };
  }, [state.airportCode, state.direction, state.validatedFlightData, state.selectedTerminal, state.travelType, state.originCode, state.destCode, state.transitCode]);

  // ─── FLIGHT VERIFICATION & ROUTE MATCH VALIDATION ───
  const validateAndSearchFlight = async (): Promise<boolean> => {
    const flightNum = (state.flightNumber || "").trim().toUpperCase().replace(/\s+/g, "");
    const departDate = (state.serviceDate || "").trim();

    if (!state.airportCode) {
      toast.error("Please complete origin and destination selection.");
      return false;
    }

    if (!flightNum || flightNum.length < 3) {
      toast.error("Please enter a valid flight number (e.g. AI302, EK504).");
      return false;
    }

    if (!departDate) {
      toast.error("Please select a travel date.");
      return false;
    }

    updateState({
      flightStateMode: "LOADING",
      flightErrorMessage: undefined,
      routeMatchError: undefined,
    });
    setBusy(true);

    try {
      const response = await ApiClient.fetchWithAuth("/api/flight/validate", {
        method: "POST",
        body: JSON.stringify({
          flightNum,
          departDate,
          tripType: state.direction === "transit" ? "multi_city" : "one_way",
          originCode: state.originCode || undefined,
          destCode: state.destCode || undefined,
          airportCode: state.airportCode || undefined,
          direction: state.direction,
        }),
      });

      const resJson = await response.json();

      if (!response.ok || !resJson.success) {
        const errMsg = formatFlightLookupError(resJson?.error || resJson?.message || resJson, response.status);
        updateState({
          flightStateMode: "ERROR",
          flightErrorMessage: errMsg,
          isFlightValidated: false,
          validatedFlightData: null,
          isManualMode: true,
        });
        setBusy(false);
        return false;
      }

      const rawData = resJson.data;
      const targetObj = rawData?.flightData || rawData?.flight_data || (Array.isArray(rawData) ? rawData[0] : rawData);

      if (!targetObj) {
        const errMsg = `Flight ${flightNum} could not be found for ${departDate}. Enter times and airports below to continue.`;
        updateState({
          flightStateMode: "ERROR",
          flightErrorMessage: errMsg,
          isFlightValidated: false,
          validatedFlightData: null,
          isManualMode: true,
        });
        setBusy(false);
        return false;
      }

      const flightInfo: FlightData = {
        flightNum: (targetObj?.flight?.iata || targetObj?.flightNum || targetObj?.flight_num || flightNum).toUpperCase(),
        carrier: {
          iata: targetObj?.airline?.iata || targetObj?.carrier?.iata || targetObj?.carrier_iata || flightNum.slice(0, 2).toUpperCase(),
          name: targetObj?.airline?.name || targetObj?.carrier?.name || targetObj?.carrier_name || null,
          logo: targetObj?.airline?.logo || null,
        },
        origin: {
          code: targetObj?.departure?.airport || targetObj?.origin?.code || targetObj?.origin_code || null,
          name: targetObj?.departure?.airport_name || targetObj?.origin?.name || targetObj?.origin_name || null,
          city: targetObj?.departure?.city || targetObj?.origin?.city || targetObj?.origin_city || null,
          country: targetObj?.departure?.country || targetObj?.origin?.country || null,
          timezone: targetObj?.departure?.timezone || targetObj?.origin?.timezone || null,
        },
        destination: {
          code: targetObj?.arrival?.airport || targetObj?.destination?.code || targetObj?.destination_code || null,
          name: targetObj?.arrival?.airport_name || targetObj?.destination?.name || targetObj?.destination_name || null,
          city: targetObj?.arrival?.city || targetObj?.destination?.city || targetObj?.destination_city || null,
          country: targetObj?.arrival?.country || targetObj?.destination?.country || null,
          timezone: targetObj?.arrival?.timezone || targetObj?.destination?.timezone || null,
        },
        departure: {
          scheduledTime: targetObj?.departure?.scheduled || targetObj?.departure?.scheduledTime || targetObj?.scheduled_departure || null,
          terminal: targetObj?.departure?.terminal || null,
          gate: targetObj?.departure?.gate || null,
          timezone: targetObj?.departure?.timezone || targetObj?.origin?.timezone || null,
        },
        arrival: {
          scheduledTime: targetObj?.arrival?.scheduled || targetObj?.arrival?.scheduledTime || targetObj?.scheduled_arrival || null,
          terminal: targetObj?.arrival?.terminal || null,
          gate: targetObj?.arrival?.gate || null,
          timezone: targetObj?.arrival?.timezone || targetObj?.destination?.timezone || null,
        },
        duration:
          targetObj?.duration?.formatted ||
          targetObj?.duration_text ||
          (typeof targetObj?.duration?.minutes === "number" && targetObj.duration.minutes > 0
            ? `${Math.floor(targetObj.duration.minutes / 60)}h ${targetObj.duration.minutes % 60}m`
            : null) ||
          (typeof targetObj?.duration_minutes === "number" && targetObj.duration_minutes > 0
            ? `${Math.floor(targetObj.duration_minutes / 60)}h ${targetObj.duration_minutes % 60}m`
            : null) ||
          (typeof targetObj?.duration === "string" ? targetObj.duration : null) ||
          targetObj?.flight_duration ||
          null,
        status: targetObj?.status || "Scheduled",
        aircraft: {
          model: targetObj?.aircraft?.model || null,
        },
      };

      // ─── ROUTE MATCH & SUPPORTED AIRPORT SERVICE VALIDATION ───
      const originCode = (flightInfo.origin?.code || "").trim().toUpperCase();
      const destCode = (flightInfo.destination?.code || "").trim().toUpperCase();

      const transitCodes: string[] = [
        (targetObj as any)?.transit?.code,
        (targetObj as any)?.connectingAirport?.code,
        (targetObj as any)?.layover?.code,
        ...(Array.isArray(targetObj?.segments) ? targetObj.segments.map((s: any) => s?.destination?.code || s?.arrival?.airport) : []),
      ].filter(Boolean).map((c: string) => String(c).trim().toUpperCase());

      // 1. Based on selected service type, pick correct airport from flight status response
      let targetAirportCode = "";
      let targetAirportName = "";

      // Never silently change the selected service airport.
      const selectedServiceAirport = (state.airportCode || "").trim().toUpperCase();
      if (state.direction === "arrival") {
        if (destCode && selectedServiceAirport && destCode !== selectedServiceAirport) {
          const mismatch = `This flight arrives at ${destCode}, but arrival services were selected for ${selectedServiceAirport}. Please verify the flight number or enter the correct itinerary manually.`;
          updateState({
            flightStateMode: "ERROR",
            flightErrorMessage: mismatch,
            routeMatchError: mismatch,
            isFlightValidated: false,
            validatedFlightData: flightInfo,
            isManualMode: true,
          });
          setBusy(false);
          return false;
        }
        targetAirportCode = selectedServiceAirport || destCode;
        targetAirportName = flightInfo.destination?.name || destCode;
      } else if (state.direction === "departure") {
        if (originCode && selectedServiceAirport && originCode !== selectedServiceAirport) {
          const mismatch = `This flight departs from ${originCode}, but departure services were selected for ${selectedServiceAirport}. Please verify the flight number or enter the correct itinerary manually.`;
          updateState({
            flightStateMode: "ERROR",
            flightErrorMessage: mismatch,
            routeMatchError: mismatch,
            isFlightValidated: false,
            validatedFlightData: flightInfo,
            isManualMode: true,
          });
          setBusy(false);
          return false;
        }
        targetAirportCode = selectedServiceAirport || originCode;
        targetAirportName = flightInfo.origin?.name || originCode;
      } else if (state.direction === "transit") {
        const selectedTransit = (state.transitCode || selectedServiceAirport).toUpperCase();
        const via = transitCodes[0] || "";
        if (via && selectedTransit && via !== selectedTransit) {
          const mismatch = `This itinerary connects via ${via}, but transit services were selected for ${selectedTransit}. Please verify the flight number or enter the correct itinerary manually.`;
          updateState({
            flightStateMode: "ERROR",
            flightErrorMessage: mismatch,
            routeMatchError: mismatch,
            isFlightValidated: false,
            validatedFlightData: flightInfo,
            isManualMode: true,
          });
          setBusy(false);
          return false;
        }
        targetAirportCode = selectedTransit;
        targetAirportName = (targetObj as any)?.transit?.name || targetAirportCode;
      }

      if (!targetAirportCode) {
        const noAirportMsg = `Unable to determine ${state.direction} airport from flight ${flightInfo.flightNum}.`;
        updateState({
          flightStateMode: "ERROR",
          flightErrorMessage: noAirportMsg,
          routeMatchError: noAirportMsg,
          isFlightValidated: false,
          validatedFlightData: flightInfo,
          isManualMode: false,
        });
        setBusy(false);
        return false;
      }

      const resolution = await airportApi.resolveServiceAirport({
        journey_type: state.direction,
        origin: state.originCode || originCode,
        destination: state.destCode || destCode,
        transit: state.transitCode || (state.direction === "transit" ? targetAirportCode : undefined),
        flight_type: state.travelType,
      });

      if (!resolution.valid || !resolution.is_supported) {
        const notAvailableMsg =
          resolution.error ||
          `Services are currently not available at ${targetAirportName} (${targetAirportCode}) for ${state.direction}.`;
        updateState({
          isAirportCovered: false,
          flightStateMode: "ERROR",
          flightErrorMessage: notAvailableMsg,
          routeMatchError: notAvailableMsg,
          isFlightValidated: false,
          validatedFlightData: flightInfo,
          isManualMode: false,
          availableServicesList: [],
          availablePackagesList: [],
        });
        setBusy(false);
        return false;
      }

      const matchedAirportName = resolution.airport?.name || targetAirportName || `${targetAirportCode} Airport`;

      const rawTerm = state.direction === "arrival" ? flightInfo.arrival?.terminal : flightInfo.departure?.terminal;
      let inferredTerminal: string | undefined = undefined;
      if (rawTerm) {
        const tStr = String(rawTerm).trim();
        if (tStr.includes("3") || tStr.toUpperCase().includes("T3")) {
          inferredTerminal = "Terminal 3";
        } else if (tStr.includes("1") || tStr.includes("2") || tStr.toUpperCase().includes("T1") || tStr.toUpperCase().includes("T2")) {
          inferredTerminal = "Terminal 1 & 2";
        }
      }

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("shafsky_validated_flight", JSON.stringify(flightInfo));
        } catch {
          // ignore cache error
        }
      }

      updateState({
        airportCode: state.bookingSource === "airport_page"
          ? selectedServiceAirport
          : (resolution.service_airport || selectedServiceAirport),
        airportName: state.bookingSource === "airport_page"
          ? (state.airportName || matchedAirportName)
          : matchedAirportName,
        originCode: state.bookingSource === "airport_page" ? (originCode || state.originCode) : state.originCode,
        destCode: state.bookingSource === "airport_page" ? (destCode || state.destCode) : state.destCode,
        isAirportCovered: true,
        flightStateMode: "VERIFIED",
        flightErrorMessage: undefined,
        routeMatchError: undefined,
        isFlightValidated: true,
        validatedFlightData: flightInfo,
        flightNumber: flightInfo.flightNum || flightNum,
        selectedTerminal: inferredTerminal || state.selectedTerminal,
        isManualMode: false,
        isFlightLocked: true,
        serviceTime: resolveBookingServiceTime({
          direction: state.direction,
          validatedFlightData: flightInfo,
        }),
      });

      toast.success(`Flight ${flightInfo.flightNum} verified for ${matchedAirportName}!`);
      return true;
    } catch (err: any) {
      console.error("[useAirportWorkflow] Flight validation error:", err);
      const errMsg = formatFlightLookupError(err);
        updateState({
          flightStateMode: "ERROR",
          flightErrorMessage: errMsg,
          isFlightValidated: false,
          validatedFlightData: null,
          isManualMode: true,
        });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const setManualFlightData = (flightInfo: FlightData) => {
    const selectedServiceAirport = (state.airportCode || "").trim().toUpperCase();
    const originCode = (flightInfo.origin?.code || "").trim().toUpperCase();
    const destCode = (flightInfo.destination?.code || "").trim().toUpperCase();

    if (state.direction === "arrival" && destCode && selectedServiceAirport && destCode !== selectedServiceAirport) {
      toast.error(`Arrival services are booked for ${selectedServiceAirport}. The itinerary must arrive there (currently ${destCode}).`);
      return;
    }
    if (state.direction === "departure" && originCode && selectedServiceAirport && originCode !== selectedServiceAirport) {
      toast.error(`Departure services are booked for ${selectedServiceAirport}. The itinerary must depart from there (currently ${originCode}).`);
      return;
    }
    if (state.direction === "transit") {
      const selectedTransit = (state.transitCode || selectedServiceAirport).toUpperCase();
      if (selectedTransit && originCode !== selectedTransit && destCode !== selectedTransit) {
        toast.error(`Transit services are booked for ${selectedTransit}. Origin or destination must include that airport.`);
        return;
      }
    }

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("shafsky_validated_flight", JSON.stringify(flightInfo));
      } catch {
        // ignore cache error
      }
    }

    const rawTerm = state.direction === "arrival" ? flightInfo.arrival?.terminal : flightInfo.departure?.terminal;
    let inferredTerminal: string | undefined = undefined;
    if (rawTerm) {
      const tStr = String(rawTerm).trim();
      if (tStr.includes("3") || tStr.toUpperCase().includes("T3")) {
        inferredTerminal = "Terminal 3";
      } else if (tStr.includes("1") || tStr.includes("2") || tStr.toUpperCase().includes("T1") || tStr.toUpperCase().includes("T2")) {
        inferredTerminal = "Terminal 1 & 2";
      }
    }

    updateState({
      isFlightValidated: true,
      validatedFlightData: flightInfo,
      flightNumber: flightInfo.flightNum,
      selectedTerminal: inferredTerminal || state.selectedTerminal,
      isManualMode: false,
      isFlightLocked: true,
      flightStateMode: "MANUAL",
      flightErrorMessage: undefined,
      routeMatchError: undefined,
      serviceTime: resolveBookingServiceTime({
        direction: state.direction,
        validatedFlightData: flightInfo,
      }),
    });
  };

  const selectPackage = useCallback((packageId: string | null) => {
    setState((prev) => {
      const isAlreadySelected = prev.selectedPackageId === packageId;
      const nextPkgId = isAlreadySelected ? null : packageId;
      return {
        ...prev,
        selectedPackageId: nextPkgId,
        selectedPackage: nextPkgId || "",
        bookingMode: nextPkgId ? "package" : prev.bookingMode,
      };
    });
  }, []);

  const toggleIndividualService = useCallback((serviceId: string) => {
    setState((prev) => {
      const currentIds = prev.selectedServiceIds || [];
      const exists = currentIds.includes(serviceId);
      const nextIds = exists ? currentIds.filter((id) => id !== serviceId) : [...currentIds, serviceId];
      return {
        ...prev,
        selectedServiceIds: nextIds,
        selectedService: nextIds.length > 0 ? nextIds[0] : "",
      };
    });
  }, []);

  const priceBreakdown: PriceBreakdown = computePriceBreakdown({
    packages: state.availablePackagesList || [],
    individualServices: state.availableServicesList || [],
    selectedPackageId: state.selectedPackageId || null,
    selectedServiceIds: state.selectedServiceIds || [],
    guestCount: state.guestCount,
    currencySymbol: state.catalogCurrency === "USD" ? "$" : state.catalogCurrency === "AED" ? "AED " : "₹",
  });

  const validateWithBackend = useCallback(async (): Promise<boolean> => {
    const payload = {
      flight_number: state.flightNumber,
      journey_type: state.direction.toUpperCase(),
      airport_code: state.airportCode,
      selected_package_id: state.selectedPackageId || null,
      selected_service_ids: state.selectedServiceIds || [],
      guest_count: state.guestCount,
      service_date: state.serviceDate,
      service_time: state.serviceTime,
    };

    updateState({ isValidatingBooking: true, validationErrors: [], hasPriceChanged: false });

    try {
      const res = await ApiClient.fetchWithAuth("/api/airport/bookings/validate", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        updateState({
          isValidatingBooking: false,
          authoritativeValidationResult: data,
          validationErrors: [],
        });
        return true;
      } else {
        const errors = data.issues || [data.detail || data.error || "Booking validation failed. Please check your selections."];
        const priceChanged = data.issues?.some((i: string) => i.toLowerCase().includes("price") || i.toLowerCase().includes("rate"));
        updateState({
          isValidatingBooking: false,
          validationErrors: errors,
          hasPriceChanged: priceChanged,
        });
        return false;
      }
    } catch (err: any) {
      updateState({
        isValidatingBooking: false,
        validationErrors: ["Unable to connect to validation service. Please check your connection."],
      });
      return false;
    }
  }, [
    state.flightNumber,
    state.direction,
    state.airportCode,
    state.selectedPackageId,
    state.selectedServiceIds,
    state.guestCount,
    state.serviceDate,
    state.serviceTime,
  ]);

  const saveDraftWithBackend = useCallback(async (): Promise<boolean> => {
    const fieldErrors: Record<string, string> = {};
    if (!state.fullName || state.fullName.trim().length < 2) {
      fieldErrors.fullName = "Please enter full name (at least 2 characters).";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!state.email || !emailRegex.test(state.email.trim())) {
      fieldErrors.email = "Please enter a valid email address.";
    }
    const phoneClean = indianMobileDigits(state.phone || "");
    if (!phoneClean) {
      fieldErrors.phone = "Please enter a valid 10-digit Indian mobile number.";
    }

    if (!state.isFlightValidated || !(state.flightNumber || "").trim()) {
      fieldErrors.flight_number = "Enter a flight number and verify it, or complete manual flight details.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      updateState({ draftFieldErrors: fieldErrors });
      toast.error("Please resolve the required contact and flight details before continuing.");
      return false;
    }

    updateState({ isSavingDraft: true, draftFieldErrors: {} });

    const draftPayload = {
      booking_ref: state.bookingRef || undefined,
      passenger_name: state.fullName.trim(),
      passenger_email: state.email.trim(),
      passenger_phone: state.phone.trim(),
      passenger_count: state.guestCount,
      flight_num: state.flightNumber,
      journey_type: state.direction.toUpperCase(),
      airport_code: state.airportCode,
      selected_package_id: state.selectedPackageId || null,
      selected_service_ids: state.selectedServiceIds || [],
      service_date: state.serviceDate,
      service_time: state.serviceTime,
      special_requests: state.specialRequests || undefined,
    };

    try {
      const res = await ApiClient.fetchWithAuth("/api/airport/bookings/draft", {
        method: "POST",
        body: JSON.stringify(draftPayload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        updateState({
          isSavingDraft: false,
          bookingRef: data.draft?.booking_ref || state.bookingRef,
        });
        toast.success("Passenger details saved successfully.");
        return true;
      } else {
        updateState({
          isSavingDraft: false,
          draftFieldErrors: { global: data.detail || data.error || "Failed to save passenger details." },
        });
        toast.error(data.detail || "Failed to save passenger details.");
        return false;
      }
    } catch (err: any) {
      updateState({
        isSavingDraft: false,
        draftFieldErrors: { global: "Network connection error. Please try again." },
      });
      toast.error("Network connection error. Please try again.");
      return false;
    }
  }, [
    state.fullName,
    state.email,
    state.phone,
    state.guestCount,
    state.flightNumber,
    state.direction,
    state.airportCode,
    state.selectedPackageId,
    state.selectedServiceIds,
    state.serviceDate,
    state.serviceTime,
    state.specialRequests,
    state.bookingRef,
    state.isFlightValidated,
  ]);

  return {
    currentStep,
    setCurrentStep,
    busy,
    setBusy,
    bookingRef,
    setBookingRef,
    state,
    updateState,
    validateAndSearchFlight,
    setManualFlightData,
    selectPackage,
    toggleIndividualService,
    validateWithBackend,
    saveDraftWithBackend,
    priceBreakdown,
    totalPrice: priceBreakdown.grandTotal,
  };
}
