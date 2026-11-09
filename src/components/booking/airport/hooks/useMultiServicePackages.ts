import { useState, useEffect, useMemo } from "react";
import { resolveApiUrl } from "@/lib/api/config";
import { getTransitCategory } from "@/data/airportRegistry";
import { convertFromINR, detectDefaultCurrency } from "@/lib/currency";
import {
  MultiServiceApi,
  AirportServiceType,
  ServiceItemAvailability,
  MultiServiceAvailabilityResponse,
} from "@/lib/api/multiServiceApi";
import { AirportPackageItem } from "../types";

export interface UseMultiServicePackagesOptions {
  searchParams?: Record<string, any>;
  airportCode: string;
  direction: "arrival" | "departure" | "transit";
  initialDirection: "arrival" | "departure" | "transit";
  travelType: "domestic" | "international";
  originCode: string;
  destCode: string;
  cleanOrigin: string;
  cleanDest: string;
  cleanTransit: string;
  transitCode: string;
  selectedTerminal: string;
  serviceDate: string;
  flightNumber: string;
  paxAdults: number;
}

export interface UseMultiServicePackagesReturn {
  initialPkgId: string;
  selectedPackageId: string;
  setSelectedPackageId: React.Dispatch<React.SetStateAction<string>>;
  selectedPackageName: string;
  setSelectedPackageName: React.Dispatch<React.SetStateAction<string>>;
  selectedPackagePrice: string;
  setSelectedPackagePrice: React.Dispatch<React.SetStateAction<string>>;
  availablePackages: AirportPackageItem[];
  setAvailablePackages: React.Dispatch<React.SetStateAction<AirportPackageItem[]>>;
  isPackagesLoading: boolean;
  selectedServices: AirportServiceType[];
  setSelectedServices: React.Dispatch<React.SetStateAction<AirportServiceType[]>>;
  packageByService: Record<AirportServiceType, string>;
  setPackageByService: React.Dispatch<React.SetStateAction<Record<AirportServiceType, string>>>;
  multiServiceAvailability: ServiceItemAvailability[];
  multiServiceResponse: MultiServiceAvailabilityResponse | null;
  isMultiServiceLoading: boolean;
  selectedCurrency: string;
  setSelectedCurrency: React.Dispatch<React.SetStateAction<string>>;
  numericUnitPrice: number;
  billablePax: number;
  baseInrTotalPrice: number;
  convertedUnitPrice: number;
  isArrangementOnly: boolean;
}

export function useMultiServicePackages({
  searchParams,
  airportCode,
  direction,
  initialDirection,
  travelType,
  originCode,
  destCode,
  cleanOrigin,
  cleanDest,
  cleanTransit,
  transitCode,
  selectedTerminal,
  serviceDate,
  flightNumber,
  paxAdults,
}: UseMultiServicePackagesOptions): UseMultiServicePackagesReturn {
  const initialPkgId = searchParams?.package_id || searchParams?.service_id || "gold";
  const [selectedPackageId, setSelectedPackageId] = useState<string>(initialPkgId);
  const [selectedPackageName, setSelectedPackageName] = useState<string>(
    searchParams?.package_name ||
      (initialPkgId
        ? `${initialPkgId.charAt(0).toUpperCase() + initialPkgId.slice(1)} Service`
        : "VIP Airport Service")
  );
  const [selectedPackagePrice, setSelectedPackagePrice] = useState<string>(searchParams?.package_price || "");

  const [availablePackages, setAvailablePackages] = useState<AirportPackageItem[]>([]);
  const [isPackagesLoading, setIsPackagesLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!airportCode) return;
    let active = true;
    setIsPackagesLoading(true);
    const jt = (direction || "departure").toUpperCase();
    const transitCat = direction === "transit" && originCode && destCode ? getTransitCategory(originCode, destCode) : null;
    const ft = (transitCat || travelType || "domestic").toUpperCase();
    const routeParams = originCode && destCode ? `&origin=${encodeURIComponent(originCode)}&destination=${encodeURIComponent(destCode)}` : "";
    const isDel = (airportCode || "").toUpperCase() === "DEL" || (destCode || "").toUpperCase() === "DEL" || (originCode || "").toUpperCase() === "DEL";
    const terminalParam = isDel && selectedTerminal ? `&terminal=${encodeURIComponent(selectedTerminal)}` : "";
    const url = resolveApiUrl(`/api/airport/services?airport=${airportCode}&journey_type=${jt}&flight_type=${ft}${routeParams}${terminalParam}`);

    fetch(url, { headers: { Accept: "application/json" } })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data?.packages && Array.isArray(data.packages) && data.packages.length > 0) {
          setAvailablePackages(data.packages);
          const current = data.packages.find((p: any) => p.id.toLowerCase() === (selectedPackageId || "").toLowerCase());
          if (current) {
            setSelectedPackagePrice(String(current.basePrice));
            setSelectedPackageName(current.title);
          } else {
            setSelectedPackageId(data.packages[0].id);
            setSelectedPackageName(data.packages[0].title);
            setSelectedPackagePrice(String(data.packages[0].basePrice));
          }
        }
      })
      .catch((err) => console.warn("[AirportBookingFlow] Failed to fetch catalog packages:", err))
      .finally(() => {
        if (active) setIsPackagesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [airportCode, direction, travelType, originCode, destCode, selectedTerminal]);

  const [selectedServices, setSelectedServices] = useState<AirportServiceType[]>(() => {
    const sParam = typeof searchParams?.services === "string" ? searchParams.services : "";
    if (sParam.trim()) {
      const tokens = sParam.split(",").map((s: string) => s.trim().toUpperCase());
      const mapped: AirportServiceType[] = [];
      for (const t of tokens) {
        if (t === "DEPARTURE" && !mapped.includes("DEPARTURE")) mapped.push("DEPARTURE");
        if (t === "ARRIVAL" && !mapped.includes("ARRIVAL")) mapped.push("ARRIVAL");
        if ((t === "TRANSIT" || t === "CONNECTION") && !mapped.includes("TRANSIT")) mapped.push("TRANSIT");
      }
      if (mapped.length > 0) return mapped;
    }
    const rawDir = (initialDirection || "departure").toUpperCase();
    if (rawDir === "TRANSIT") return ["TRANSIT"];
    if (rawDir === "ARRIVAL") return ["ARRIVAL"];
    return ["DEPARTURE"];
  });

  const [packageByService, setPackageByService] = useState<Record<AirportServiceType, string>>(() => {
    let sessionPkgs: Record<string, string> = {};
    try {
      const s = typeof window !== "undefined" ? window.sessionStorage?.getItem("shafsky_booking_intent") : null;
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed.packages_by_service) sessionPkgs = parsed.packages_by_service;
      }
    } catch {}

    const pkg = searchParams?.package_id || searchParams?.service_id || "";
    const primaryDir = (initialDirection || "departure").toUpperCase();
    return {
      DEPARTURE: (searchParams?.pkg_departure as string) || sessionPkgs.DEPARTURE || (primaryDir === "DEPARTURE" && pkg ? pkg : ""),
      ARRIVAL: (searchParams?.pkg_arrival as string) || sessionPkgs.ARRIVAL || (primaryDir === "ARRIVAL" && pkg ? pkg : ""),
      TRANSIT: (searchParams?.pkg_transit as string) || sessionPkgs.TRANSIT || (primaryDir === "TRANSIT" && pkg ? pkg : ""),
    };
  });

  const [multiServiceAvailability, setMultiServiceAvailability] = useState<ServiceItemAvailability[]>([]);
  const [multiServiceResponse, setMultiServiceResponse] = useState<MultiServiceAvailabilityResponse | null>(null);
  const [isMultiServiceLoading, setIsMultiServiceLoading] = useState<boolean>(false);

  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => detectDefaultCurrency());

  const numericUnitPrice = useMemo(() => {
    const p = Number(String(selectedPackagePrice).replace(/[^0-9.]/g, ""));
    if (p > 0) return p;
    const pkg = availablePackages.find((item) => item.id.toLowerCase() === (selectedPackageId || "").toLowerCase());
    if (pkg && pkg.basePrice > 0) return pkg.basePrice;
    const id = (selectedPackageId || "").toLowerCase();
    if (id.includes("platinum") || id.includes("elite")) return 9500;
    if (id.includes("gold") || id.includes("meet")) return 5500;
    if (id.includes("silver") || id.includes("basic")) return 3500;
    return 5500;
  }, [selectedPackagePrice, selectedPackageId, availablePackages]);

  // Policy: Children & Infants are complimentary / free. Only Adults are billable.
  const billablePax = paxAdults;
  const baseInrTotalPrice = numericUnitPrice * billablePax;
  const convertedUnitPrice = useMemo(() => convertFromINR(numericUnitPrice, selectedCurrency), [numericUnitPrice, selectedCurrency]);

  useEffect(() => {
    let active = true;
    const effOrigin = cleanOrigin || originCode || (direction === "departure" ? airportCode : "");
    const effDest = cleanDest || destCode || (direction === "arrival" ? airportCode : "");
    const effTransit = cleanTransit || transitCode || searchParams?.transit || (direction === "transit" ? airportCode : "");

    if (!effOrigin && !effDest && !airportCode) return;
    if (!selectedServices || selectedServices.length === 0) return;
    if (!billablePax || billablePax < 1) return;

    setIsMultiServiceLoading(true);

    MultiServiceApi.checkAvailability({
      origin_code: effOrigin || airportCode || "DEL",
      dest_code: effDest || airportCode || "BOM",
      transit_codes: effTransit ? [effTransit] : undefined,
      flight_num: flightNumber || undefined,
      service_date: serviceDate || undefined,
      guest_count: billablePax,
      selected_services: selectedServices.map((st) => {
        const sApt = (st === "DEPARTURE" ? effOrigin : st === "ARRIVAL" ? effDest : effTransit || "").toUpperCase();
        return {
          service_type: st,
          package_slug: packageByService[st] || (st === (direction || "departure").toUpperCase() ? selectedPackageId || initialPkgId : undefined),
          airport_code: st === "DEPARTURE" ? effOrigin : st === "ARRIVAL" ? effDest : effTransit,
          terminal: sApt === "DEL" ? selectedTerminal || undefined : undefined,
        };
      }),
    })
      .then((res) => {
        if (!active) return;
        setMultiServiceResponse(res);
        setMultiServiceAvailability(res.services || []);
      })
      .catch((err) => {
        console.warn("[AirportBookingFlow] Multi-service availability error:", err);
      })
      .finally(() => {
        if (active) setIsMultiServiceLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    originCode,
    destCode,
    airportCode,
    direction,
    flightNumber,
    serviceDate,
    billablePax,
    selectedServices,
    packageByService,
    selectedTerminal,
    initialPkgId,
    selectedPackageId,
    cleanOrigin,
    cleanDest,
    cleanTransit,
    transitCode,
    searchParams?.transit,
  ]);

  const isArrangementOnly = useMemo(() => {
    if (multiServiceResponse) {
      if (multiServiceResponse.none_available) return true;
      const hasUnsupported = selectedServices.some((st) => {
        const sApt =
          st === "DEPARTURE"
            ? cleanOrigin || originCode || (direction === "departure" ? airportCode : "")
            : st === "ARRIVAL"
            ? cleanDest || destCode || (direction === "arrival" ? airportCode : "")
            : cleanTransit || transitCode || searchParams?.transit || (direction === "transit" ? airportCode : "");
        const sAptClean = (sApt || "").trim().toUpperCase();
        const avail = multiServiceAvailability.find(
          (a) => a.service_type === st && (!sAptClean || a.airport_code.toUpperCase() === sAptClean)
        );
        return avail ? !avail.is_airport_supported : false;
      });
      if (hasUnsupported && !multiServiceResponse.any_available) return true;
    }
    if (!isPackagesLoading && availablePackages.length === 0 && airportCode) {
      return true;
    }
    return false;
  }, [
    multiServiceResponse,
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
    multiServiceAvailability,
    isPackagesLoading,
    availablePackages.length,
  ]);

  return {
    initialPkgId,
    selectedPackageId,
    setSelectedPackageId,
    selectedPackageName,
    setSelectedPackageName,
    selectedPackagePrice,
    setSelectedPackagePrice,
    availablePackages,
    setAvailablePackages,
    isPackagesLoading,
    selectedServices,
    setSelectedServices,
    packageByService,
    setPackageByService,
    multiServiceAvailability,
    multiServiceResponse,
    isMultiServiceLoading,
    selectedCurrency,
    setSelectedCurrency,
    numericUnitPrice,
    billablePax,
    baseInrTotalPrice,
    convertedUnitPrice,
    isArrangementOnly,
  };
}

