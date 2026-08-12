import { useState, useEffect, useCallback } from "react";
import { getAirportBusinessPrice, getAirportRegistryEntry } from "@/data/airportRegistry";
import { FlightData } from "@/services/flight/FlightTypes";
import { ApiClient } from "@/lib/ApiClient";
import { toast } from "sonner";
import {
  fetchAirportServices,
  computePriceBreakdown,
  PackageCatalogItem,
  ServiceCatalogItem,
  PriceBreakdown,
} from "../utils/serviceAirportResolver";
import { getRequiredBookingFields } from "../config/services.config";

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
  flightType?: string;
  isResolvingAirport?: boolean;
  resolvedAirport?: any;
  isFlightLocked?: boolean;
}

/**
 * Formats flight validation errors into user-friendly messages.
 */
export function formatFlightLookupError(error: unknown, status?: number): string {
  const rawString =
    typeof error === "string"
      ? error
      : typeof (error as any)?.message === "string"
        ? (error as any).message
        : typeof (error as any)?.code === "string"
          ? (error as any).code
          : typeof (error as any)?.error === "string"
            ? (error as any).error
            : JSON.stringify(error || "");

  const upper = rawString.toUpperCase();

  if (
    upper.includes("FLIGHT_NOT_FOUND") ||
    upper.includes("NOT_FOUND") ||
    upper.includes("NO SCHEDULE") ||
    upper.includes("INVALID_FLIGHT") ||
    status === 404
  ) {
    return "No flight schedule was found for the selected flight number and travel date. Try another date or verify the flight number.";
  }

  if (upper.includes("ADVANCE_NOTICE") || upper.includes("6_HOUR") || upper.includes("MINIMUM_LEAD_TIME")) {
    return "This flight departs too soon for online concierge booking. Please contact our 24/7 VIP Command Desk for instant manual dispatch.";
  }

  return "No flight schedule was found for the selected flight number and travel date. Try another date or verify the flight number.";
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

  const rawOrigin = searchParams?.origin || searchParams?.airport || "";
  const extractedCode = rawOrigin.match(/\(([A-Z]{3})\)/)?.[1] || (rawOrigin.length === 3 ? rawOrigin.toUpperCase() : searchParams?.airport || "DEL");

  const initialBookingMode: "individual" | "package" =
    searchParams?.booking_mode === "package" || searchParams?.package_id || searchParams?.mode === "package"
      ? "package"
      : "individual";

  const isFromHero = Boolean(searchParams?.from_hero || searchParams?.validated);
  const initialFlightNumber = searchParams?.flight_number || "";
  const initialDirection: "arrival" | "departure" | "transit" =
    (searchParams?.direction as any) ||
    (searchParams?.origin ? "departure" : searchParams?.destination ? "arrival" : "arrival");

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [busy, setBusy] = useState<boolean>(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  // Look up initial airport name from airportRegistry
  const initialRegistryEntry = getAirportRegistryEntry(extractedCode);
  const initialAirportName = initialRegistryEntry?.name || rawOrigin || `${extractedCode.toUpperCase()} Airport`;

  const [state, setState] = useState<AirportWorkflowState>({
    airportCode: extractedCode.toUpperCase(),
    airportName: initialAirportName,
    direction: initialDirection,
    bookingMode: "package",
    selectedService: searchParams?.package_id || searchParams?.service_id || "",
    selectedPackage: searchParams?.package_id || searchParams?.service_id || "",
    serviceDate: searchParams?.depart_date || "",
    serviceTime: "14:30",
    guestCount: searchParams?.pax_adults || 1,
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
    selectedPackageId: searchParams?.package_id || searchParams?.service_id || null,
  });

  // Hydrate browser-only state after mount
  useEffect(() => {
    if (!searchParams?.depart_date) {
      const today = new Date().toISOString().split("T")[0];
      setState((prev) => (prev.serviceDate ? prev : { ...prev, serviceDate: today }));
    }

    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("shafsky_validated_flight");
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
              isFlightLocked: isFromHero,
            }));

            const reqFields = getRequiredBookingFields(searchParams?.service_id || searchParams?.sub);
            if (isFromHero && reqFields.requiresFlight) {
              setCurrentStep(2);
            }
          }
        }
      } catch {
        // ignore cache error
      }
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
            origin: state.validatedFlightData?.origin?.code || undefined,
            destination: state.validatedFlightData?.destination?.code || undefined,
            terminal: state.selectedTerminal,
          }
        );

        if (controller.signal.aborted) return;

        if (fetchRes.success) {
          setState((prev) => ({
            ...prev,
            isLoadingServices: false,
            isAirportCovered: fetchRes.isCovered,
            catalogCurrency: fetchRes.currency || "INR",
            availableServicesList: fetchRes.services,
            availablePackagesList: fetchRes.packages,
            flightType: fetchRes.flightType,
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
  }, [state.airportCode, state.direction, state.validatedFlightData, state.selectedTerminal]);

  // ─── FLIGHT VERIFICATION & ROUTE MATCH VALIDATION ───
  const validateAndSearchFlight = async (): Promise<boolean> => {
    const flightNum = (state.flightNumber || "").trim().toUpperCase().replace(/\s+/g, "");
    const departDate = (state.serviceDate || "").trim();

    if (!state.airportCode) {
      toast.error("Please select a covered airport.");
      return false;
    }

    const requiredFields = getRequiredBookingFields(state.selectedService);

    if (requiredFields.requiresFlight) {
      if (!flightNum || flightNum.length < 3) {
        toast.error("Please enter a valid flight number (e.g. AI302, EK504).");
        return false;
      }
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
          tripType: state.direction === "arrival" ? "one_way" : "round_trip",
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
          isManualMode: false,
        });
        setBusy(false);
        return false;
      }

      const rawData = resJson.data;
      const targetObj = rawData?.flightData || rawData?.flight_data || (Array.isArray(rawData) ? rawData[0] : rawData);

      if (!targetObj) {
        const errMsg = `Flight ${flightNum} could not be found for ${departDate}. Please check your flight number, try again, or enter flight details manually.`;
        updateState({
          flightStateMode: "ERROR",
          flightErrorMessage: errMsg,
          isFlightValidated: false,
          validatedFlightData: null,
          isManualMode: false,
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
        },
        destination: {
          code: targetObj?.arrival?.airport || targetObj?.destination?.code || targetObj?.destination_code || null,
          name: targetObj?.arrival?.airport_name || targetObj?.destination?.name || targetObj?.destination_name || null,
          city: targetObj?.arrival?.city || targetObj?.destination?.city || targetObj?.destination_city || null,
          country: targetObj?.arrival?.country || targetObj?.destination?.country || null,
        },
        departure: {
          scheduledTime: targetObj?.departure?.scheduled || targetObj?.departure?.scheduledTime || targetObj?.scheduled_departure || null,
          terminal: targetObj?.departure?.terminal || null,
          gate: targetObj?.departure?.gate || null,
        },
        arrival: {
          scheduledTime: targetObj?.arrival?.scheduled || targetObj?.arrival?.scheduledTime || targetObj?.scheduled_arrival || null,
          terminal: targetObj?.arrival?.terminal || null,
          gate: targetObj?.arrival?.gate || null,
        },
        duration: targetObj?.duration?.formatted || targetObj?.duration_text || targetObj?.duration || targetObj?.flight_duration || null,
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

      if (state.direction === "arrival") {
        targetAirportCode = destCode;
        targetAirportName = flightInfo.destination?.name || destCode;
      } else if (state.direction === "departure") {
        targetAirportCode = originCode;
        targetAirportName = flightInfo.origin?.name || originCode;
      } else if (state.direction === "transit") {
        targetAirportCode = transitCodes[0] || "";
        targetAirportName = (targetObj as any)?.transit?.name || (targetObj as any)?.connectingAirport?.name || targetAirportCode;
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

      // 2. Look up (airport code + service type) in our supported airports/services table
      const { checkAirportCoverage } = await import("../utils/serviceAirportResolver");
      const coverage = checkAirportCoverage(targetAirportCode);

      // 4. If not matched: return a clear "not available" response — do NOT fall back
      if (!coverage.isCovered) {
        const notAvailableMsg = `Services are currently not available at ${targetAirportName} (${targetAirportCode}) for ${state.direction}.`;
        updateState({
          airportCode: targetAirportCode,
          airportName: coverage.entry?.name || targetAirportName || `${targetAirportCode} Airport`,
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

      // 3. If matched: return ONLY that matched service's locked result
      const matchedAirportName = coverage.entry?.name || targetAirportName || `${targetAirportCode} Airport`;

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
        airportCode: targetAirportCode,
        airportName: matchedAirportName,
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
        isManualMode: false,
      });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const setManualFlightData = (flightInfo: FlightData) => {
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
      isManualMode: true,
      isFlightLocked: true,
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
    const phoneClean = (state.phone || "").replace(/\D/g, "");
    if (!state.phone || phoneClean.length < 7) {
      fieldErrors.phone = "Please enter a valid phone/WhatsApp number (at least 7 digits).";
    }

    if (Object.keys(fieldErrors).length > 0) {
      updateState({ draftFieldErrors: fieldErrors });
      toast.error("Please resolve the required contact information errors.");
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
