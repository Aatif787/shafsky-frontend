import { useState, useEffect } from "react";
import { getAirportBusinessPrice } from "@/data/airportRegistry";
import { FlightData } from "@/services/flight/FlightTypes";
import { ApiClient } from "@/lib/ApiClient";
import { toast } from "sonner";
import { useJourneyEngine } from "@/hooks/useJourneyEngine";

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
}

/**
 * Formats flight validation errors into user-friendly messages.
 * Never exposes raw backend codes (e.g. FLIGHT_NOT_FOUND) or technical stack traces.
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

  const rawOrigin = searchParams?.origin || "";
  const extractedCode = rawOrigin.match(/\(([A-Z]{3})\)/)?.[1] || (rawOrigin.length === 3 ? rawOrigin.toUpperCase() : "");

  const initialBookingMode: "individual" | "package" =
    searchParams?.booking_mode === "package" || searchParams?.package_id || searchParams?.mode === "package"
      ? "package"
      : "individual";

  // SSR-safe: compute only URL-derived values during render. Browser-only state (sessionStorage, Date) is deferred to useEffect.
  const isFromHero = Boolean(searchParams?.from_hero || searchParams?.validated);
  const initialFlightNumber = searchParams?.flight_number || "";
  const initialDirection: "arrival" | "departure" | "transit" =
    (searchParams?.direction as any) ||
    (searchParams?.origin ? "departure" : searchParams?.destination ? "arrival" : "arrival");

  // Always start at step 1 during SSR; useEffect will advance to step 2 if cached flight data exists
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [busy, setBusy] = useState<boolean>(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  const [state, setState] = useState<AirportWorkflowState>({
    airportCode: extractedCode,
    airportName: rawOrigin || "Selected Airport",
    direction: initialDirection,
    bookingMode: initialBookingMode,
    selectedService: searchParams?.service_id || searchParams?.package_id || "",
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
  });

  // Hydrate browser-only state after mount (sessionStorage + Date fallback)
  useEffect(() => {
    // Fill in today's date as fallback if no depart_date was provided via URL
    if (!searchParams?.depart_date) {
      const today = new Date().toISOString().split("T")[0];
      setState((prev) => (prev.serviceDate ? prev : { ...prev, serviceDate: today }));
    }

    // Restore cached flight data from sessionStorage
    if (isFromHero || Boolean(searchParams?.flight_number)) {
      try {
        const stored = sessionStorage.getItem("shafsky_validated_flight");
        if (stored) {
          const cachedFlightData: FlightData = JSON.parse(stored);
          const cachedFlightNum = cachedFlightData?.flightNum || "";
          const cachedDate = cachedFlightData?.departure?.scheduledTime?.split(" ")[0];
          const rawTerm = initialDirection === "arrival" ? cachedFlightData?.arrival?.terminal : cachedFlightData?.departure?.terminal;
          let inferredTerm: string | undefined = undefined;
          if (rawTerm) {
            const tStr = String(rawTerm).trim();
            if (tStr.includes("3") || tStr.toUpperCase().includes("T3")) {
              inferredTerm = "Terminal 3";
            } else if (tStr.includes("1") || tStr.includes("2") || tStr.toUpperCase().includes("T1") || tStr.toUpperCase().includes("T2")) {
              inferredTerm = "Terminal 1 & 2";
            }
          }
          setState((prev) => ({
            ...prev,
            flightNumber: prev.flightNumber || cachedFlightNum,
            serviceDate: prev.serviceDate || cachedDate || prev.serviceDate,
            isFlightValidated: true,
            validatedFlightData: cachedFlightData,
            selectedTerminal: prev.selectedTerminal || inferredTerm || prev.selectedTerminal,
          }));
          // Advance directly to Service Selection (Step 3) - NO DUPLICATE STEP 2 CARD!
          setCurrentStep(3);
        } else if (searchParams?.flight_number) {
          // URL has flight_number but no cached data — stay at step 1 for validation
        }
      } catch {
        // Ignore parse error
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateState = (fields: Partial<AirportWorkflowState>) => {
    setState((prev) => ({ ...prev, ...fields }));
  };

  const validateAndSearchFlight = async (): Promise<boolean> => {
    const flightNum = state.flightNumber.trim().toUpperCase().replace(/\s+/g, "");
    const departDate = state.serviceDate.trim();

    if (!flightNum || flightNum.length < 3) {
      toast.error("Please enter a valid flight number (e.g. AI302, EK504).");
      return false;
    }

    if (!departDate) {
      toast.error("Please select a travel date.");
      return false;
    }

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
        updateState({ isManualMode: true });
        setBusy(false);
        return false;
      }

      const rawData = resJson.data;
      const targetObj = rawData?.flightData || rawData?.flight_data || (Array.isArray(rawData) ? rawData[0] : rawData);

      if (!targetObj) {
        updateState({ isManualMode: true });
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

      // Automatically determine relevant airport & terminal from validated flight data
      const targetAirport = state.direction === "arrival" ? flightInfo.destination : flightInfo.origin;
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
          // ignore cache write error
        }
      }

      updateState({
        isFlightValidated: true,
        validatedFlightData: flightInfo,
        flightNumber: flightInfo.flightNum || flightNum,
        airportCode: targetAirport?.code || state.airportCode,
        airportName: targetAirport?.name || targetAirport?.city || state.airportName,
        selectedTerminal: inferredTerminal || state.selectedTerminal,
      });

      toast.success(`Flight ${flightInfo.flightNum} validated successfully!`);
      setBusy(false);
      return true;
    } catch (err: any) {
      console.error("[useAirportWorkflow] Flight validation error:", err);
      updateState({ isManualMode: true });
      setBusy(false);
      return false;
    }
  };

  const setManualFlightData = (flightInfo: FlightData) => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("shafsky_validated_flight", JSON.stringify(flightInfo));
      } catch {
        // ignore cache write error
      }
    }
    const targetAirport = state.direction === "arrival" ? flightInfo.destination : flightInfo.origin;
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
      airportCode: targetAirport?.code || state.airportCode,
      airportName: targetAirport?.name || targetAirport?.city || state.airportName,
      selectedTerminal: inferredTerminal || state.selectedTerminal,
      isManualMode: true,
    });
  };

  const depCode = (state.direction === "departure" ? state.airportCode : state.validatedFlightData?.origin?.code) || undefined;
  const arrCode = (state.direction === "arrival" ? state.airportCode : state.validatedFlightData?.destination?.code) || undefined;

  const journeyEngine = useJourneyEngine({
    departureCode: depCode,
    arrivalCode: arrCode,
    journeyType: state.direction,
    serviceDate: state.serviceDate,
    serviceTime: state.serviceTime,
    requestedServiceSlug: state.selectedService || undefined,
    terminal: state.selectedTerminal || undefined,
    enabled: true,
  });

  const getBasePrice = () => {
    const serviceKey = state.bookingMode === "package" ? state.selectedPackage : state.selectedService;
    if (!serviceKey) return 0;
    if (state.bookingMode === "individual" && journeyEngine.availableServices.length > 0) {
      const match = journeyEngine.availableServices.find((s) => s.slug.toLowerCase() === serviceKey.toLowerCase());
      if (match && typeof match.price === "number") {
        return match.price;
      }
    }
    return getAirportBusinessPrice(state.airportCode, state.bookingMode, serviceKey);
  };

  const totalPrice = getBasePrice() * state.guestCount;

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
    totalPrice,
    journeyEngine,
  };
}

