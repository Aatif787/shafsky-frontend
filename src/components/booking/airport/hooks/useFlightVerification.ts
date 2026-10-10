import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ApiClient } from "@/lib/ApiClient";
import { FlightData } from "@/services/flight/FlightTypes";
import { getAirportRegistryEntry, isIndianAirportCode } from "@/data/airportRegistry";
import { formatFlightLookupError } from "../../hooks/useAirportWorkflow";
import {
  sanitizeFlightInput,
  buildAnchoredServiceClock,
  getAirportDisplayName,
  buildRouteMismatchWarning,
  evaluateFlightRouteMatch,
  evaluateConnectingLegRouteMatch,
} from "../utils";
import { RouteMismatchInfo } from "../types";

interface UseFlightVerificationProps {
  searchParams?: Record<string, any>;
  rawAirportCode: string;
  airportCode: string;
  setAirportCode?: (val: string) => void;
  direction: "arrival" | "departure" | "transit";
  travelType: "domestic" | "international";
  setTravelType: (type: "domestic" | "international") => void;
  initialTravelType: "domestic" | "international";
  serviceDate: string;
  serviceDate2: string;
  originCode: string;
  setOriginCode: (val: string) => void;
  destCode: string;
  setDestCode: (val: string) => void;
  transitCode?: string;
  setTransitCode?: (val: string) => void;
  onExplicitRouteAccepted?: (newOrigin: string, newDest: string) => void;
}

export function useFlightVerification({
  searchParams,
  rawAirportCode,
  airportCode,
  setAirportCode,
  direction,
  travelType,
  setTravelType,
  initialTravelType,
  serviceDate,
  serviceDate2,
  originCode,
  setOriginCode,
  destCode,
  setDestCode,
  transitCode,
  setTransitCode,
  onExplicitRouteAccepted,
}: UseFlightVerificationProps) {
  // 1. Primary Flight State (Leg 1 or Direct Journey)
  const [flightNumber, setFlightNumber] = useState<string>(searchParams?.flight_number || "");
  const [isFlightFetching, setIsFlightFetching] = useState<boolean>(false);
  const [isFlightVerified, setIsFlightVerified] = useState<boolean>(false);
  const [verifiedFlight, setVerifiedFlight] = useState<FlightData | null>(null);
  const [flightFetchError, setFlightFetchError] = useState<string | null>(null);
  const [isCutoffUrgent, setIsCutoffUrgent] = useState<boolean>(false);

  // Route Mismatch State for Leg 1 / Direct Flights
  const [routeMismatch, setRouteMismatch] = useState<RouteMismatchInfo | null>(null);
  const [confirmingRouteUpdate, setConfirmingRouteUpdate] = useState<boolean>(false);

  // Route Mismatch State for Leg 2 (Connecting Flight in Transit)
  const [routeMismatch2, setRouteMismatch2] = useState<RouteMismatchInfo | null>(null);
  const [confirmingRouteUpdate2, setConfirmingRouteUpdate2] = useState<boolean>(false);

  // Manual Flight State
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [manualAirline, setManualAirline] = useState<string>("");
  const [manualAirlineIata, setManualAirlineIata] = useState<string>("");
  const [manualFlightNum, setManualFlightNum] = useState<string>(searchParams?.flight_number || "");
  const [manualDepTime, setManualDepTime] = useState<string>("");
  const [manualDepTerminal, setManualDepTerminal] = useState<string>(() => {
    if ((rawAirportCode || "").toUpperCase() === "DEL" && initialTravelType === "international") {
      return "3";
    }
    return searchParams?.terminal || "";
  });
  const [manualArrTime, setManualArrTime] = useState<string>("");
  const [manualArrTerminal, setManualArrTerminal] = useState<string>(() => {
    if ((rawAirportCode || "").toUpperCase() === "DEL" && initialTravelType === "international") {
      return "3";
    }
    return searchParams?.terminal || "";
  });

  // Connecting Flight (Leg 2) State for Transit Journeys
  const [flightNumber2, setFlightNumber2] = useState<string>(
    searchParams?.flight_number_2 || searchParams?.flightNumber2 || searchParams?.connecting_flight_number || ""
  );
  const [isFlightFetching2, setIsFlightFetching2] = useState<boolean>(false);
  const [isFlightVerified2, setIsFlightVerified2] = useState<boolean>(false);
  const [verifiedFlight2, setVerifiedFlight2] = useState<FlightData | null>(null);
  const [flightFetchError2, setFlightFetchError2] = useState<string | null>(null);
  const [isCutoffUrgent2, setIsCutoffUrgent2] = useState<boolean>(false);

  // Manual Connecting Flight State
  const [isManualMode2, setIsManualMode2] = useState<boolean>(false);
  const [manualAirline2, setManualAirline2] = useState<string>("");
  const [manualAirlineIata2, setManualAirlineIata2] = useState<string>("");
  const [manualFlightNum2, setManualFlightNum2] = useState<string>(
    searchParams?.flight_number_2 || searchParams?.flightNumber2 || searchParams?.connecting_flight_number || ""
  );
  const [manualDepTime2, setManualDepTime2] = useState<string>("");
  const [manualDepTerminal2, setManualDepTerminal2] = useState<string>("");
  const [manualArrTime2, setManualArrTime2] = useState<string>("");
  const [manualArrTerminal2, setManualArrTerminal2] = useState<string>("");

  // Handle Automatic Flight Verification with Airport Mismatch & Cutoff Detection
  const handleVerifyFlight = async () => {
    const cleaned = sanitizeFlightInput(flightNumber);
    if (!cleaned || cleaned.length < 3) {
      toast.error("Please enter a valid flight number (e.g. AI101, 6E202, EK504).");
      return;
    }

    setIsFlightFetching(true);
    setFlightFetchError(null);
    setIsCutoffUrgent(false);

    try {
      const res = await ApiClient.fetchWithAuth("/api/flight/validate", {
        method: "POST",
        body: JSON.stringify({
          flightNum: cleaned,
          departDate: serviceDate,
          tripType: direction === "transit" ? "multi_city" : "one_way",
          originCode:
            direction === "arrival"
              ? (originCode && originCode !== airportCode ? originCode : "")
              : (originCode || airportCode),
          destCode:
            direction === "departure"
              ? (destCode && destCode !== airportCode ? destCode : "")
              : (destCode || airportCode),
          airportCode,
          direction,
        }),
      });

      const resJson = await res.json().catch(() => null);

      if (res.ok && resJson && resJson.success) {
        const raw = resJson.data?.flightData || resJson.data?.flight_data || resJson.data;
        const flightObj = Array.isArray(raw) ? raw[0] : raw;

        if (flightObj) {
          const depRawSched = flightObj?.departure?.scheduled || flightObj?.departure?.scheduledTime || null;
          const arrRawSched = flightObj?.arrival?.scheduled || flightObj?.arrival?.scheduledTime || null;

          let isArrNextDay = false;
          if (depRawSched && arrRawSched) {
            const depDateMatch = String(depRawSched).match(/^(\d{4}-\d{2}-\d{2})/);
            const arrDateMatch = String(arrRawSched).match(/^(\d{4}-\d{2}-\d{2})/);
            if (depDateMatch && arrDateMatch && arrDateMatch[1] > depDateMatch[1]) {
              isArrNextDay = true;
            } else {
              const depT = String(depRawSched).match(/(\d{1,2}:\d{2})/)?.[1] || "";
              const arrT = String(arrRawSched).match(/(\d{1,2}:\d{2})/)?.[1] || "";
              if (depT && arrT && arrT < depT) {
                isArrNextDay = true;
              }
            }
          }

          const anchoredDepSched = depRawSched
            ? buildAnchoredServiceClock(serviceDate, depRawSched, "10:00")
            : null;
          const anchoredArrSched = arrRawSched
            ? buildAnchoredServiceClock(serviceDate, arrRawSched, "12:30", isArrNextDay)
            : null;

          const flightData: FlightData = {
            flightNum: (flightObj?.flight?.iata || flightObj?.flightNum || cleaned).toUpperCase(),
            carrier: {
              iata: flightObj?.airline?.iata || flightObj?.carrier?.iata || cleaned.slice(0, 2),
              name: flightObj?.airline?.name || flightObj?.carrier?.name || "Verified Airline",
              logo: flightObj?.airline?.logo || null,
            },
            origin: {
              code: (
                flightObj?.departure?.airport ||
                flightObj?.origin?.code ||
                (direction === "departure" ? airportCode : (originCode !== airportCode ? originCode : "")) ||
                ""
              ).toUpperCase(),
              name: flightObj?.departure?.airport_name || flightObj?.origin?.name || null,
              city: flightObj?.departure?.city || flightObj?.origin?.city || null,
              country: flightObj?.departure?.country || null,
              timezone: flightObj?.departure?.timezone || null,
            },
            destination: {
              code: (
                flightObj?.arrival?.airport ||
                flightObj?.destination?.code ||
                (direction === "arrival" ? airportCode : (destCode !== airportCode ? destCode : "")) ||
                ""
              ).toUpperCase(),
              name: flightObj?.arrival?.airport_name || flightObj?.destination?.name || null,
              city: flightObj?.arrival?.city || flightObj?.destination?.city || null,
              country: flightObj?.arrival?.country || null,
              timezone: flightObj?.arrival?.timezone || null,
            },
            departure: {
              scheduledTime: anchoredDepSched,
              terminal: flightObj?.departure?.terminal || null,
              gate: flightObj?.departure?.gate || null,
              timezone: flightObj?.departure?.timezone || null,
            },
            arrival: {
              scheduledTime: anchoredArrSched,
              terminal: flightObj?.arrival?.terminal || null,
              gate: flightObj?.arrival?.gate || null,
              timezone: flightObj?.arrival?.timezone || null,
            },
          };

          // Strict Airport Route Evaluation
          const selectedServiceAirport = (airportCode || "").trim().toUpperCase();
          const flOrigin = (flightData.origin?.code || "").trim().toUpperCase();
          const flDest = (flightData.destination?.code || "").trim().toUpperCase();

          const evalResult = evaluateFlightRouteMatch({
            direction,
            flOrigin,
            flDest,
            userOrigin: originCode,
            userDest: destCode,
            selectedServiceAirport,
            transitHub: transitCode,
            flightType: flightObj?.flight_type || flightObj?.travel_type,
          });

          if (evalResult.isSameAirport) {
            setFlightFetchError(evalResult.sameAirportError || `Flight route origin and destination cannot be the same airport (${flOrigin}). Please verify your flight number.`);
            setIsFlightVerified(false);
            setVerifiedFlight(null);
            setManualFlightNum(cleaned);
            setRouteMismatch(null);
            return;
          }

          if (evalResult.hasMismatch) {
            setRouteMismatch({
              flightNum: cleaned,
              flightData,
              apiOrigin: evalResult.flOrigin,
              apiOriginCity: getAirportDisplayName(evalResult.flOrigin),
              apiDest: evalResult.flDest,
              apiDestCity: getAirportDisplayName(evalResult.flDest),
              userOrigin: evalResult.userOrigin,
              userOriginCity: getAirportDisplayName(evalResult.userOrigin),
              userDest: evalResult.userDest,
              userDestCity: getAirportDisplayName(evalResult.userDest),
              message: evalResult.mismatchWarning || "",
              leg: 1,
            });

            // DO NOT automatically change destination, travelType, origin, package, pricing, or booking state!
            setIsFlightVerified(false);
            setVerifiedFlight(null);
            setFlightFetchError(null);
            setManualFlightNum(cleaned);
            return;
          }

          // Routes match! Proceed normally with verified flight details
          setRouteMismatch(null);
          setConfirmingRouteUpdate(false);

          if (evalResult.isActuallyIntl) {
            if (travelType !== "international") {
              setTravelType("international");
              toast.info(`International route detected (${flOrigin} → ${flDest}). Switched to International service.`);
            }
          } else {
            if (travelType !== "domestic") {
              setTravelType("domestic");
              toast.info(`Domestic route detected (${flOrigin} → ${flDest}). Switched to Domestic service.`);
            }
          }

          // Rule: If Delhi (DEL) and International, ALWAYS Terminal 3
          if (selectedServiceAirport === "DEL" && evalResult.isActuallyIntl) {
            if (flightData.departure && (flOrigin === "DEL" || direction === "departure")) {
              flightData.departure.terminal = "3";
            }
            if (flightData.arrival && (flDest === "DEL" || direction === "arrival")) {
              flightData.arrival.terminal = "3";
            }
            setManualDepTerminal("3");
            setManualArrTerminal("3");
          }

          // Auto-fill origin/destination only if previously unset
          if (!originCode && flOrigin) {
            setOriginCode(flOrigin);
          }
          if (!destCode && flDest) {
            setDestCode(flDest);
          }

          setVerifiedFlight(flightData);
          setIsFlightVerified(true);
          setIsManualMode(false);
          setFlightFetchError(null);
          toast.success(`Flight ${flightData.flightNum} verified successfully.`);
          return;
        }
      }

      // Check for cutoff violation in error message
      const errorMsg = formatFlightLookupError(resJson?.error || resJson?.message || resJson, res?.status);
      if (
        errorMsg.toLowerCase().includes("cutoff") ||
        errorMsg.toLowerCase().includes("12 hours") ||
        errorMsg.toLowerCase().includes("24 hours")
      ) {
        setIsCutoffUrgent(true);
      }

      setFlightFetchError(errorMsg || "Live flight schedule not found. Please provide details manually below.");
      setIsFlightVerified(false);
      setVerifiedFlight(null);
      setManualFlightNum(cleaned);
      if (!manualAirlineIata && cleaned.length >= 2) {
        setManualAirlineIata(cleaned.slice(0, 2));
      }
    } catch (err) {
      console.warn("[useFlightVerification] Flight verification network exception:", err);
      setFlightFetchError("Flight verification service could not be reached. You can enter details manually below.");
      setIsFlightVerified(false);
      setVerifiedFlight(null);
      setManualFlightNum(cleaned);
    } finally {
      setIsFlightFetching(false);
    }
  };

  // Handle Automatic Connecting Flight Verification for Transit (Leg 2: Transit Hub -> Destination)
  const handleVerifyFlight2 = async () => {
    const cleaned = sanitizeFlightInput(flightNumber2);
    if (!cleaned || cleaned.length < 3) {
      toast.error("Please enter a valid connecting flight number (e.g. EK504, 6E224).");
      return;
    }

    setIsFlightFetching2(true);
    setFlightFetchError2(null);
    setIsCutoffUrgent2(false);

    try {
      const res = await ApiClient.fetchWithAuth("/api/flight/validate", {
        method: "POST",
        body: JSON.stringify({
          flightNum: cleaned,
          departDate: serviceDate2,
          tripType: "one_way",
          originCode: airportCode,
          destCode: destCode || "",
          airportCode,
          direction: "departure",
        }),
      });

      const resJson = await res.json().catch(() => null);

      if (res.ok && resJson && resJson.success) {
        const raw = resJson.data?.flightData || resJson.data?.flight_data || resJson.data;
        const flightObj = Array.isArray(raw) ? raw[0] : raw;

        if (flightObj) {
          const depRawSched = flightObj?.departure?.scheduled || flightObj?.departure?.scheduledTime || null;
          const arrRawSched = flightObj?.arrival?.scheduled || flightObj?.arrival?.scheduledTime || null;

          let isArrNextDay = false;
          if (depRawSched && arrRawSched) {
            const depDateMatch = String(depRawSched).match(/^(\d{4}-\d{2}-\d{2})/);
            const arrDateMatch = String(arrRawSched).match(/^(\d{4}-\d{2}-\d{2})/);
            if (depDateMatch && arrDateMatch && arrDateMatch[1] > depDateMatch[1]) {
              isArrNextDay = true;
            } else {
              const depT = String(depRawSched).match(/(\d{1,2}:\d{2})/)?.[1] || "";
              const arrT = String(arrRawSched).match(/(\d{1,2}:\d{2})/)?.[1] || "";
              if (depT && arrT && arrT < depT) {
                isArrNextDay = true;
              }
            }
          }

          const anchoredDepSched = depRawSched
            ? buildAnchoredServiceClock(serviceDate2, depRawSched, "14:00")
            : null;
          const anchoredArrSched = arrRawSched
            ? buildAnchoredServiceClock(serviceDate2, arrRawSched, "17:30", isArrNextDay)
            : null;

          const flightData: FlightData = {
            flightNum: (flightObj?.flight?.iata || flightObj?.flightNum || cleaned).toUpperCase(),
            carrier: {
              iata: flightObj?.airline?.iata || flightObj?.carrier?.iata || cleaned.slice(0, 2),
              name: flightObj?.airline?.name || flightObj?.carrier?.name || "Verified Airline",
              logo: flightObj?.airline?.logo || null,
            },
            origin: {
              code: (flightObj?.departure?.airport || flightObj?.origin?.code || airportCode).toUpperCase(),
              name: flightObj?.departure?.airport_name || flightObj?.origin?.name || null,
              city: flightObj?.departure?.city || flightObj?.origin?.city || null,
              country: flightObj?.departure?.country || null,
              timezone: flightObj?.departure?.timezone || null,
            },
            destination: {
              code: (flightObj?.arrival?.airport || flightObj?.destination?.code || destCode || "").toUpperCase(),
              name: flightObj?.arrival?.airport_name || flightObj?.destination?.name || null,
              city: flightObj?.arrival?.city || flightObj?.destination?.city || null,
              country: flightObj?.arrival?.country || null,
              timezone: flightObj?.arrival?.timezone || null,
            },
            departure: {
              scheduledTime: anchoredDepSched,
              terminal: flightObj?.departure?.terminal || null,
              gate: flightObj?.departure?.gate || null,
              timezone: flightObj?.departure?.timezone || null,
            },
            arrival: {
              scheduledTime: anchoredArrSched,
              terminal: flightObj?.arrival?.terminal || null,
              gate: flightObj?.arrival?.gate || null,
              timezone: flightObj?.arrival?.timezone || null,
            },
          };

          // Connecting Flight Leg 2: Transit Hub -> Final Destination
          const transitHub = (transitCode || airportCode || "").trim().toUpperCase();
          const flOrigin = (flightData.origin?.code || "").trim().toUpperCase();
          const flDest = (flightData.destination?.code || "").trim().toUpperCase();
          const userDest = (destCode || "").trim().toUpperCase();

          const leg2Eval = evaluateConnectingLegRouteMatch({
            transitHub,
            flOrigin,
            flDest,
            userDest,
          });

          if (leg2Eval.isSameAirport) {
            setFlightFetchError2(leg2Eval.sameAirportError || `Connecting flight route origin and destination cannot be the same (${flOrigin}).`);
            setIsFlightVerified2(false);
            setVerifiedFlight2(null);
            setManualFlightNum2(cleaned);
            setRouteMismatch2(null);
            return;
          }

          if (leg2Eval.hasMismatch) {
            setRouteMismatch2({
              flightNum: cleaned,
              flightData,
              apiOrigin: flOrigin,
              apiOriginCity: getAirportDisplayName(flOrigin),
              apiDest: flDest,
              apiDestCity: getAirportDisplayName(flDest),
              userOrigin: transitHub || flOrigin,
              userOriginCity: getAirportDisplayName(transitHub || flOrigin),
              userDest: userDest || flDest,
              userDestCity: getAirportDisplayName(userDest || flDest),
              message: leg2Eval.mismatchWarning || "",
              leg: 2,
            });

            setIsFlightVerified2(false);
            setVerifiedFlight2(null);
            setFlightFetchError2(null);
            setManualFlightNum2(cleaned);
            return;
          }

          setRouteMismatch2(null);
          setConfirmingRouteUpdate2(false);

          if (!userDest && flDest) {
            setDestCode(flDest);
          }

          setVerifiedFlight2(flightData);
          setIsFlightVerified2(true);
          setIsManualMode2(false);
          setFlightFetchError2(null);
          toast.success(`Connecting flight ${flightData.flightNum} verified successfully.`);
          return;
        }
      }

      const errorMsg = formatFlightLookupError(resJson?.error || resJson?.message || resJson, res?.status);
      setFlightFetchError2(errorMsg || "Live schedule not found for connecting flight. Please provide details manually below.");
      setIsFlightVerified2(false);
      setVerifiedFlight2(null);
      setManualFlightNum2(cleaned);
      if (!manualAirlineIata2 && cleaned.length >= 2) {
        setManualAirlineIata2(cleaned.slice(0, 2));
      }
    } catch (err) {
      console.warn("[useFlightVerification] Connecting flight verification exception:", err);
      setFlightFetchError2("Flight verification service could not be reached. You can enter details manually below.");
      setIsFlightVerified2(false);
      setVerifiedFlight2(null);
      setManualFlightNum2(cleaned);
    } finally {
      setIsFlightFetching2(false);
    }
  };

  // User Actions for Route Mismatch Resolution
  const handleKeepSelectedRoute = () => {
    const currentMismatch = routeMismatch;
    setRouteMismatch(null);
    setConfirmingRouteUpdate(false);
    setIsFlightVerified(false);
    setVerifiedFlight(null);
    toast.info(
      `Retained your selected route (${currentMismatch?.userOriginCity || originCode} → ${currentMismatch?.userDestCity || destCode}). You can correct your flight number or enter flight details manually.`
    );
  };

  const handleUseFlightRoute = () => {
    if (!routeMismatch) return;
    const { apiOrigin, apiDest, flightData } = routeMismatch;

    setOriginCode(apiOrigin);
    setDestCode(apiDest);
    if (setAirportCode) {
      if (direction === "departure") {
        setAirportCode(apiOrigin);
      } else if (direction === "arrival") {
        setAirportCode(apiDest);
      }
    }

    const isOriginIndia = isIndianAirportCode(apiOrigin);
    const isDestIndia = isIndianAirportCode(apiDest);
    const isActuallyIntl = !isOriginIndia || !isDestIndia;
    const targetCategory = isActuallyIntl ? "international" : "domestic";
    setTravelType(targetCategory);

    onExplicitRouteAccepted?.(apiOrigin, apiDest);

    setVerifiedFlight(flightData);
    setIsFlightVerified(true);
    setIsManualMode(false);
    setRouteMismatch(null);
    setConfirmingRouteUpdate(false);
    setFlightFetchError(null);
    toast.success(`Journey updated to ${apiOrigin} → ${apiDest} and flight ${flightData.flightNum} verified.`);
  };

  const handleKeepSelectedRoute2 = () => {
    setRouteMismatch2(null);
    setConfirmingRouteUpdate2(false);
    setIsFlightVerified2(false);
    setVerifiedFlight2(null);
    toast.info(
      `Retained your selected connecting route. You can correct your flight number or enter flight details manually.`
    );
  };

  const handleUseFlightRoute2 = () => {
    if (!routeMismatch2) return;
    const { apiDest, flightData } = routeMismatch2;

    setDestCode(apiDest);

    setVerifiedFlight2(flightData);
    setIsFlightVerified2(true);
    setIsManualMode2(false);
    setRouteMismatch2(null);
    setConfirmingRouteUpdate2(false);
    setFlightFetchError2(null);
    toast.success(`Connecting flight ${flightData.flightNum} to ${apiDest} verified.`);
  };

  // Auto-verify if flight_number is passed in URL query params so mismatch is immediately visible on screen
  useEffect(() => {
    if (searchParams?.flight_number?.trim() && !isFlightVerified) {
      handleVerifyFlight();
    }
    if (searchParams?.flight_number_2?.trim() && !isFlightVerified2) {
      handleVerifyFlight2();
    }
  }, []);

  return {
    flightNumber,
    setFlightNumber,
    isFlightFetching,
    setIsFlightFetching,
    isFlightVerified,
    setIsFlightVerified,
    verifiedFlight,
    setVerifiedFlight,
    flightFetchError,
    setFlightFetchError,
    routeMismatch,
    setRouteMismatch,
    confirmingRouteUpdate,
    setConfirmingRouteUpdate,
    handleKeepSelectedRoute,
    handleUseFlightRoute,
    isCutoffUrgent,
    setIsCutoffUrgent,
    isManualMode,
    setIsManualMode,
    manualAirline,
    setManualAirline,
    manualAirlineIata,
    setManualAirlineIata,
    manualFlightNum,
    setManualFlightNum,
    manualDepTime,
    setManualDepTime,
    manualDepTerminal,
    setManualDepTerminal,
    manualArrTime,
    setManualArrTime,
    manualArrTerminal,
    setManualArrTerminal,
    handleVerifyFlight,

    flightNumber2,
    setFlightNumber2,
    isFlightFetching2,
    setIsFlightFetching2,
    isFlightVerified2,
    setIsFlightVerified2,
    verifiedFlight2,
    setVerifiedFlight2,
    flightFetchError2,
    setFlightFetchError2,
    routeMismatch2,
    setRouteMismatch2,
    confirmingRouteUpdate2,
    setConfirmingRouteUpdate2,
    handleKeepSelectedRoute2,
    handleUseFlightRoute2,
    isCutoffUrgent2,
    setIsCutoffUrgent2,
    isManualMode2,
    setIsManualMode2,
    manualAirline2,
    setManualAirline2,
    manualAirlineIata2,
    setManualAirlineIata2,
    manualFlightNum2,
    setManualFlightNum2,
    manualDepTime2,
    setManualDepTime2,
    manualDepTerminal2,
    setManualDepTerminal2,
    manualArrTime2,
    setManualArrTime2,
    manualArrTerminal2,
    setManualArrTerminal2,
    handleVerifyFlight2,
  };
}
