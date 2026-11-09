import { useMemo } from "react";
import { convertFromINR } from "@/lib/currency";
import { AirportServiceType, ServiceItemAvailability, MultiServiceAvailabilityResponse } from "@/lib/api/multiServiceApi";
import { buildAnchoredServiceClock } from "../utils";

export const MUMBAI_IATA = "BOM";
export const FLAT_500_AIRPORTS = ["HYD", "GOX", "DEL", "VTZ"] as const;
export type Flat500Airport = typeof FLAT_500_AIRPORTS[number];
export const EXPRESS_FEE_AIRPORTS = [MUMBAI_IATA, ...FLAT_500_AIRPORTS];
export const FLAT_EXPRESS_FEE_AMOUNT = 500;

export const AIRPORT_NAMES: Record<string, string> = {
  BOM: "Mumbai",
  HYD: "Hyderabad",
  GOX: "Goa (Mopa)",
  DEL: "Delhi",
  VTZ: "Visakhapatnam",
};

export interface ExpressFeeTriggeredItem {
  airport: string;
  fee: number;
  serviceType: AirportServiceType;
}

export interface UseExpressFeeCalculationOptions {
  selectedServices: AirportServiceType[];
  cleanOrigin: string;
  originCode: string;
  direction: "arrival" | "departure" | "transit";
  airportCode: string;
  cleanDest: string;
  destCode: string;
  cleanTransit: string;
  transitCode: string;
  searchParams?: Record<string, any>;
  travelType: "domestic" | "international";
  serviceDate: string;
  flightVerification: {
    isFlightVerified: boolean;
    verifiedFlight: any;
    manualDepTime: string;
    manualArrTime: string;
  };
  baseInrTotalPrice: number;
  multiServiceAvailability: ServiceItemAvailability[];
  isArrangementOnly: boolean;
  multiServiceResponse: MultiServiceAvailabilityResponse | null;
  selectedCurrency: string;
}

export interface UseExpressFeeCalculationReturn {
  expressFeeDetails: {
    feeInr: number;
    isApplicable: boolean;
    advanceHours: number | null;
    expressFeeLabel: string;
    expressFeeNotice: string;
    breakdown: ExpressFeeTriggeredItem[];
  };
  expressFeeInr: number;
  isExpressFeeApplicable: boolean;
  expressFeeLabel: string;
  expressFeeNotice: string;
  isMultiService: boolean;
  effectiveBaseInrTotalPrice: number;
  totalPrice: number;
  convertedExpressFee: number;
  convertedTotalPrice: number;
}

export function useExpressFeeCalculation({
  selectedServices,
  cleanOrigin,
  originCode,
  direction,
  airportCode,
  cleanDest,
  destCode,
  cleanTransit,
  transitCode,
  searchParams,
  travelType,
  serviceDate,
  flightVerification,
  baseInrTotalPrice,
  multiServiceAvailability,
  isArrangementOnly,
  multiServiceResponse,
  selectedCurrency,
}: UseExpressFeeCalculationOptions): UseExpressFeeCalculationReturn {
  const expressFeeDetails = useMemo(() => {
    const rawDep =
      flightVerification.isFlightVerified && flightVerification.verifiedFlight?.departure?.scheduledTime
        ? flightVerification.verifiedFlight.departure.scheduledTime
        : flightVerification.manualDepTime
        ? buildAnchoredServiceClock(serviceDate, flightVerification.manualDepTime, "10:00")
        : null;

    const rawArr =
      flightVerification.isFlightVerified && flightVerification.verifiedFlight?.arrival?.scheduledTime
        ? flightVerification.verifiedFlight.arrival.scheduledTime
        : flightVerification.manualArrTime
        ? buildAnchoredServiceClock(serviceDate, flightVerification.manualArrTime, "12:30")
        : null;

    const isInternational = (travelType || "domestic").toLowerCase() === "international";

    // Determine services to evaluate independently
    const servicesToCheck: { serviceType: AirportServiceType; airport: string; price: number }[] = [];

    if (selectedServices && selectedServices.length > 0) {
      for (const st of selectedServices) {
        const sApt = (
          st === "DEPARTURE"
            ? cleanOrigin || originCode || (direction === "departure" ? airportCode : "")
            : st === "ARRIVAL"
            ? cleanDest || destCode || (direction === "arrival" ? airportCode : "")
            : cleanTransit || transitCode || searchParams?.transit || (direction === "transit" ? airportCode : "")
        )
          .trim()
          .toUpperCase();

        const availItem = multiServiceAvailability.find(
          (a) => a.service_type === st && (!sApt || a.airport_code.toUpperCase() === sApt)
        );
        let sPrice = 0;
        if (availItem && availItem.total_price != null && typeof availItem.total_price === "number" && availItem.total_price > 0) {
          sPrice = availItem.total_price;
        } else {
          sPrice = baseInrTotalPrice;
        }
        servicesToCheck.push({ serviceType: st, airport: sApt, price: sPrice });
      }
    } else {
      const singleApt = (airportCode || "").trim().toUpperCase();
      const singleSt = (direction || "departure").toUpperCase() as AirportServiceType;
      servicesToCheck.push({ serviceType: singleSt, airport: singleApt, price: baseInrTotalPrice });
    }

    const flat500Set = new Set<string>(FLAT_500_AIRPORTS);
    const expressSet = new Set<string>(EXPRESS_FEE_AIRPORTS);

    let totalFeeInr = 0;
    let minAdvanceHours: number | null = null;
    const triggeredItems: ExpressFeeTriggeredItem[] = [];

    for (const svc of servicesToCheck) {
      if (!expressSet.has(svc.airport)) continue;

      let targetTimeStr: string | null = null;
      let offsetMs = 0;

      if (svc.serviceType === "DEPARTURE") {
        targetTimeStr = rawDep || rawArr;
        if (!targetTimeStr) continue;
        offsetMs = isInternational ? 3 * 60 * 60 * 1000 : (1 * 60 + 30) * 60 * 1000;
      } else {
        // ARRIVAL or TRANSIT
        targetTimeStr = rawArr || rawDep;
        if (!targetTimeStr) continue;
        offsetMs = 0;
      }

      try {
        const hasOffset = /[Zz]|[+-]\d{2}:?\d{2}$/.test(targetTimeStr);
        const normalizedStr = hasOffset ? targetTimeStr : `${targetTimeStr}+05:30`;
        const flightTimestamp = new Date(normalizedStr).getTime();
        if (isNaN(flightTimestamp)) continue;

        const serviceStartMs = flightTimestamp - offsetMs;
        const advanceMs = serviceStartMs - Date.now();
        const advanceHours = advanceMs / (1000 * 60 * 60);

        if (advanceMs > 0 && advanceMs < 24 * 60 * 60 * 1000) {
          let fee = 0;
          if (svc.airport === MUMBAI_IATA) {
            fee = Math.round(svc.price * 0.5 * 100) / 100;
          } else if (flat500Set.has(svc.airport)) {
            fee = FLAT_EXPRESS_FEE_AMOUNT;
          }

          if (fee > 0) {
            totalFeeInr += fee;
            triggeredItems.push({ airport: svc.airport, fee, serviceType: svc.serviceType });
            if (minAdvanceHours === null || advanceHours < minAdvanceHours) {
              minAdvanceHours = advanceHours;
            }
          }
        }
      } catch {
        continue;
      }
    }

    const hasBom = triggeredItems.some((t) => t.airport === MUMBAI_IATA);
    const flatItems = triggeredItems.filter((t) => flat500Set.has(t.airport));
    const flatAirports = Array.from(new Set(flatItems.map((t) => t.airport)));
    const hasFlat = flatAirports.length > 0;

    let expressFeeLabel = "";
    let expressFeeNotice = "";

    if (totalFeeInr > 0) {
      if (hasBom && !hasFlat) {
        expressFeeLabel = "(50% Express Fee)";
        expressFeeNotice = "⚡ 50% Express Fee Applied: Mumbai Airport booking under 24 hours before service start time.";
      } else if (!hasBom && hasFlat) {
        expressFeeLabel = triggeredItems.length > 1 ? "(₹500 / service Express Fee)" : "(₹500 Express Fee)";
        const airportNames = flatAirports.map((code) => AIRPORT_NAMES[code] || code).join(", ");
        expressFeeNotice = `⚡ Express Fee Applied: ₹500 short-notice fee for booking under 24 hours before service start time (${airportNames}).`;
      } else if (hasBom && hasFlat) {
        expressFeeLabel = "(Express Fee)";
        const flatAirportNames = flatAirports.map((code) => AIRPORT_NAMES[code] || code).join(", ");
        expressFeeNotice = `⚡ Express Fee Applied: Short-notice booking under 24 hours (50% fee for Mumbai, ₹500 fee for ${flatAirportNames}).`;
      }
    }

    return {
      feeInr: Math.round(totalFeeInr * 100) / 100,
      isApplicable: totalFeeInr > 0,
      advanceHours: minAdvanceHours,
      expressFeeLabel,
      expressFeeNotice,
      breakdown: triggeredItems,
    };
  }, [
    selectedServices,
    cleanOrigin,
    originCode,
    direction,
    airportCode,
    cleanDest,
    destCode,
    cleanTransit,
    transitCode,
    searchParams?.transit,
    travelType,
    serviceDate,
    flightVerification.isFlightVerified,
    flightVerification.verifiedFlight,
    flightVerification.manualDepTime,
    flightVerification.manualArrTime,
    baseInrTotalPrice,
    multiServiceAvailability,
  ]);

  const expressFeeInr = isArrangementOnly ? 0 : expressFeeDetails.feeInr;
  const isExpressFeeApplicable = isArrangementOnly ? false : expressFeeDetails.isApplicable;
  const expressFeeLabel = isArrangementOnly ? "" : expressFeeDetails.expressFeeLabel;
  const expressFeeNotice = isArrangementOnly ? "" : expressFeeDetails.expressFeeNotice;
  const isMultiService = selectedServices.length > 1;
  const effectiveBaseInrTotalPrice = isArrangementOnly
    ? 0
    : isMultiService && multiServiceResponse
    ? multiServiceResponse.total_payable
    : baseInrTotalPrice;
  const totalPrice = isArrangementOnly ? 0 : effectiveBaseInrTotalPrice + expressFeeInr;
  const convertedExpressFee = useMemo(() => convertFromINR(expressFeeInr, selectedCurrency), [expressFeeInr, selectedCurrency]);
  const convertedTotalPrice = useMemo(
    () => (isArrangementOnly ? 0 : convertFromINR(totalPrice, selectedCurrency)),
    [isArrangementOnly, totalPrice, selectedCurrency]
  );

  return {
    expressFeeDetails,
    expressFeeInr,
    isExpressFeeApplicable,
    expressFeeLabel,
    expressFeeNotice,
    isMultiService,
    effectiveBaseInrTotalPrice,
    totalPrice,
    convertedExpressFee,
    convertedTotalPrice,
  };
}
