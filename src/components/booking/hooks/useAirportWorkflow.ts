import { useState, useEffect, useCallback } from "react";
import { getAirportRegistryEntry, isIndianAirportCode } from "@/data/airportRegistry";
import { FlightData } from "@/services/flight/FlightTypes";
import { ApiClient } from "@/lib/ApiClient";
import { airportApi } from "@/lib/api/airportApi";
import { toast } from "sonner";
import {
  fetchAirportServices,
  computePriceBreakdown,
  PriceBreakdown,
} from "../utils/serviceAirportResolver";
import { indianMobileDigits } from "../validation/sharedValidation";
import {
  type FlightValidationMode,
  type AirportWorkflowState,
  formatFlightLookupError,
  hhmmFromScheduled,
  resolveBookingServiceTime,
  formatBookingServiceDateTime,
  extractIata,
  inferTerminalFromRaw,
  parseFlightInfoFromValidationResponse,
  verifyFlightRouteMatch,
  detectFlightTravelCategory,
} from "./airportWorkflowHelpers";

export {
  type FlightValidationMode,
  type AirportWorkflowState,
  formatFlightLookupError,
  hhmmFromScheduled,
  resolveBookingServiceTime,
  formatBookingServiceDateTime,
  extractIata,
  inferTerminalFromRaw,
  parseFlightInfoFromValidationResponse,
  verifyFlightRouteMatch,
  detectFlightTravelCategory,
};

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
            const inferredTerminal = inferTerminalFromRaw(rawTerm);

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
            origin: state.validatedFlightData?.origin?.code || state.originCode || undefined,
            destination: state.validatedFlightData?.destination?.code || state.destCode || undefined,
            terminal: state.selectedTerminal,
            flightType: state.travelType,
            transit: state.transitCode,
          }
        );

        if (controller.signal.aborted) return;

        if (fetchRes.success) {
          const derivedFt = String(fetchRes.flightType || "").toLowerCase();
          const targetTravelType: ("domestic" | "international" | undefined) =
            derivedFt === "international" || derivedFt === "domestic"
              ? (derivedFt as "domestic" | "international")
              : undefined;

          let autoSwitchReason: string | undefined = undefined;
          if (targetTravelType && targetTravelType !== state.travelType) {
            if (targetTravelType === "international") {
              autoSwitchReason = "International route detected. Showing International concierge packages.";
            } else {
              autoSwitchReason = "Domestic route detected. Showing Domestic concierge packages.";
            }
            toast.info(autoSwitchReason);
          }

          setState((prev) => ({
            ...prev,
            isLoadingServices: false,
            isAirportCovered: fetchRes.isCovered,
            catalogCurrency: fetchRes.currency || "INR",
            availableServicesList: fetchRes.services,
            availablePackagesList: fetchRes.packages,
            flightType: fetchRes.flightType,
            travelType: targetTravelType || prev.travelType,
            travelTypeAutoSwitchedReason: autoSwitchReason || prev.travelTypeAutoSwitchedReason,
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

      const { flightInfo, transitCodes } = parseFlightInfoFromValidationResponse(targetObj, flightNum);

      // ─── ROUTE MATCH & SUPPORTED AIRPORT SERVICE VALIDATION ───
      const routeCheck = verifyFlightRouteMatch({
        state,
        flightInfo,
        transitCodes,
        targetObj,
      });

      if (!routeCheck.ok) {
        updateState({
          flightStateMode: "ERROR",
          flightErrorMessage: routeCheck.errorMsg,
          routeMatchError: routeCheck.errorMsg,
          isFlightValidated: false,
          validatedFlightData: flightInfo,
          ...(routeCheck.forceManualModeFalse ? { isManualMode: false } : {}),
        });
        setBusy(false);
        return false;
      }

      const { targetAirportCode, targetAirportName, originCode, destCode } = routeCheck;
      const selectedServiceAirport = (state.airportCode || "").trim().toUpperCase();

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
      const effectiveAirportCode = (state.airportCode || targetAirportCode || "").trim().toUpperCase();
      const { isDetectedIntl, targetTravelType } = detectFlightTravelCategory(flightInfo);

      let flightSwitchReason: string | undefined = state.travelTypeAutoSwitchedReason;
      if (state.travelType !== targetTravelType) {
        if (targetTravelType === "international") {
          flightSwitchReason = `International flight route detected (${flightInfo.origin?.code || "Origin"} → ${flightInfo.destination?.code || "Destination"}). Service category updated to International.`;
          toast.info(flightSwitchReason);
        } else {
          flightSwitchReason = `Domestic flight route detected (${flightInfo.origin?.code || "Origin"} → ${flightInfo.destination?.code || "Destination"}). Service category updated to Domestic.`;
          toast.info(flightSwitchReason);
        }
      }

      const inferredTerminal = inferTerminalFromRaw(rawTerm, effectiveAirportCode, isDetectedIntl);

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
        originCode: flightInfo.origin?.code || (state.bookingSource === "airport_page" ? (originCode || state.originCode) : state.originCode),
        destCode: flightInfo.destination?.code || (state.bookingSource === "airport_page" ? (destCode || state.destCode) : state.destCode),
        travelType: targetTravelType,
        travelTypeAutoSwitchedReason: flightSwitchReason,
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

    const isOriginIndia = isIndianAirportCode(originCode);
    const isDestIndia = isIndianAirportCode(destCode);
    const isActuallyIntl = !isOriginIndia || !isDestIndia;
    const targetTravelType: "domestic" | "international" = isActuallyIntl ? "international" : "domestic";

    let manualSwitchReason: string | undefined = state.travelTypeAutoSwitchedReason;
    if (state.travelType !== targetTravelType) {
      if (targetTravelType === "international") {
        manualSwitchReason = `International route entered (${originCode} → ${destCode}). Service category updated to International.`;
        toast.info(manualSwitchReason);
      } else {
        manualSwitchReason = `Domestic route entered (${originCode} → ${destCode}). Service category updated to Domestic.`;
        toast.info(manualSwitchReason);
      }
    }

    const rawTerm = state.direction === "arrival" ? flightInfo.arrival?.terminal : flightInfo.departure?.terminal;
    const effectiveAirportCode = (selectedServiceAirport || "").trim().toUpperCase();
    const inferredTerminal = inferTerminalFromRaw(rawTerm, effectiveAirportCode, isActuallyIntl);

    updateState({
      isFlightValidated: true,
      validatedFlightData: flightInfo,
      flightNumber: flightInfo.flightNum,
      selectedTerminal: inferredTerminal || state.selectedTerminal,
      travelType: targetTravelType,
      travelTypeAutoSwitchedReason: manualSwitchReason,
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
      origin: state.originCode || state.validatedFlightData?.origin?.code || undefined,
      destination: state.destCode || state.validatedFlightData?.destination?.code || undefined,
      transit: state.transitCode || undefined,
      flight_type: (state.travelType || state.flightType || "").toUpperCase() || undefined,
      terminal: state.selectedTerminal || undefined,
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
    state.originCode,
    state.destCode,
    state.transitCode,
    state.travelType,
    state.flightType,
    state.selectedTerminal,
    state.validatedFlightData,
    state.selectedPackageId,
    state.selectedServiceIds,
    state.guestCount,
    state.serviceDate,
    state.serviceTime,
  ]);

  const saveDraftWithBackend = useCallback(async (): Promise<boolean> => {
    const fieldErrors: Record<string, string> = {};
    const trimmedFullName = (state.fullName || "").trim();
    if (!trimmedFullName || trimmedFullName.length < 2 || !/^[A-Za-z\s]+$/.test(trimmedFullName)) {
      fieldErrors.fullName = "Please enter a valid passenger name using letters only.";
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
