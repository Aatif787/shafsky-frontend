import React, { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Plane,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  Loader2,
  Copy,
  ChevronDown,
  ChevronUp,
  Lock,
  RefreshCw,
  PhoneCall,
  MessageSquare, Building2,
  Minus,
  Plus,
  CalendarDays,
  Send
} from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { format, parseISO, isValid } from "date-fns";
import { ApiClient } from "@/lib/ApiClient";
import { resolveApiUrl } from "@/lib/api/config";
import { getAirportRegistryEntry, isIndianAirportCode, getTransitCategory, getRouteFlightCategory, AIRPORT_REGISTRY } from "@/data/airportRegistry";
import { AirlineLogo } from "./shared/AirlineLogo";
import { IntelligentAirlineAutocomplete } from "./shared/IntelligentAirlineAutocomplete";
import { FlightTimePicker } from "./shared/FlightTimePicker";
import { AirportSuggestionPicker } from "./shared/AirportSuggestionPicker";
import { FlightData } from "@/services/flight/FlightTypes";
import { formatFlightLookupError } from "./hooks/useAirportWorkflow";
import { loadRazorpayScript } from "@/lib/razorpay";
import { toRazorpayContact, normalizePhoneForStorage } from "./validation/sharedValidation";
import { PhoneInput } from "@/components/ui/PhoneInput";
import {
  SUPPORTED_CURRENCIES,
  convertFromINR,
  formatPrice,
  detectDefaultCurrency,
} from "@/lib/currency";
import {
  MultiServiceApi,
  AirportServiceType,
  ServiceItemAvailability,
  MultiServiceAvailabilityResponse,
} from "@/lib/api/multiServiceApi";

interface AirportBookingFlowProps {
  searchParams?: Record<string, any>;
}

const ICAO_TO_IATA_MAP: Record<string, string> = {
  AIC: "AI", IGO: "6E", SEJ: "SG", VTI: "UK", AXB: "IX",
  FLG: "9I", GOW: "G8", AKJ: "QP", UAE: "EK", QTR: "QR",
  ETD: "EY", BAW: "BA", SIA: "SQ", DLH: "LH", AFR: "AF",
  KLM: "KL", THA: "TG", MAS: "MH", CXA: "CX", FDB: "FZ",
};

/**
 * Safely anchors a flight time-of-day onto the intended calendar service date.
 * Avoids submitting past dates from provider timetables or cached entries.
 */
function buildAnchoredServiceClock(
  targetDate: string,
  rawTimeVal: string | null | undefined,
  fallbackTime: string,
  isArrivalNextDay = false
): string {
  let timeStr = fallbackTime;
  if (rawTimeVal && typeof rawTimeVal === "string") {
    const match = rawTimeVal.trim().match(/(?:T|\s)?(\d{1,2}:\d{2}(?::\d{2})?)/);
    if (match && match[1]) {
      timeStr = match[1];
    }
  }
  const parts = timeStr.split(":");
  const hh = (parts[0] || "10").padStart(2, "0");
  const mm = (parts[1] || "00").padStart(2, "0");
  const ss = (parts[2] || "00").padStart(2, "0");
  const formattedTime = `${hh}:${mm}:${ss}`;

  let finalDate = targetDate;
  if (isArrivalNextDay) {
    try {
      const d = new Date(`${targetDate}T00:00:00`);
      d.setDate(d.getDate() + 1);
      finalDate = d.toISOString().split("T")[0];
    } catch {
      finalDate = targetDate;
    }
  }
  return `${finalDate}T${formattedTime}`;
}

export function AirportBookingFlow({ searchParams }: AirportBookingFlowProps) {
  // 1. Initial State from Search Params & Intent
  const extractIata = (raw?: string) => {
    if (!raw) return "";
    const match = String(raw).match(/\(([A-Z]{3})\)/);
    if (match) return match[1].toUpperCase();
    const cleaned = String(raw).trim().toUpperCase();
    return cleaned.length === 3 ? cleaned : "";
  };

  const initialDirection: "arrival" | "departure" | "transit" = useMemo(() => {
    const raw = String(searchParams?.direction || searchParams?.journey_type || "").toLowerCase();
    if (raw === "departure" || raw === "dep") return "departure";
    if (raw === "transit" || raw === "connection") return "transit";
    return "arrival";
  }, [searchParams]);

  const isCategoryLocked = useMemo(() => {
    if (searchParams?.from_hero === "true") return true;
    const orig = extractIata(searchParams?.origin);
    const dest = extractIata(searchParams?.destination);
    if (orig && dest) return true;
    if (searchParams?.travel_type || searchParams?.flight_type) return true;
    return false;
  }, [searchParams]);

  const initialTravelType: "domestic" | "international" = useMemo(() => {
    const orig = extractIata(searchParams?.origin);
    const dest = extractIata(searchParams?.destination);
    if (orig && dest) {
      return getRouteFlightCategory(orig, dest);
    }
    const raw = String(searchParams?.travel_type || searchParams?.flight_type || "").toLowerCase();
    return raw === "international" || raw === "intl" || raw.includes("international") ? "international" : "domestic";
  }, [searchParams]);

  const rawAirportCode =
    extractIata(searchParams?.airport) ||
    extractIata(searchParams?.airport_id) ||
    (initialDirection === "departure"
      ? extractIata(searchParams?.origin)
      : initialDirection === "arrival"
      ? extractIata(searchParams?.destination)
      : extractIata(searchParams?.transit)) ||
    "";

  const [airportCode] = useState<string>(rawAirportCode);
  const [direction] = useState<"arrival" | "departure" | "transit">(initialDirection);
  const [travelType, setTravelType] = useState<"domestic" | "international">(initialTravelType);

  const handleTravelTypeChange = (newType: "domestic" | "international") => {
    if (isCategoryLocked) {
      // Category is locked by the homepage booking flow route
      return;
    }
    setTravelType(newType);
  };

  useEffect(() => {
    if (isCategoryLocked && travelType !== initialTravelType) {
      setTravelType(initialTravelType);
    }
  }, [isCategoryLocked, initialTravelType, travelType]);

  const registryEntry = getAirportRegistryEntry(airportCode);
  const airportCityName = searchParams?.airport_name || registryEntry?.city || registryEntry?.name || airportCode;

  const rawOrigin = extractIata(searchParams?.origin);
  const rawDest = extractIata(searchParams?.destination);

  const initialOrigin =
    direction === "arrival"
      ? (rawOrigin && rawOrigin !== airportCode ? rawOrigin : "")
      : (rawOrigin || (direction === "departure" ? airportCode : ""));

  const initialDestination =
    direction === "departure"
      ? (rawDest && rawDest !== airportCode ? rawDest : "")
      : (rawDest || (direction === "arrival" ? airportCode : ""));

  const [originCode, setOriginCode] = useState<string>(initialOrigin);
  const [destCode, setDestCode] = useState<string>(initialDestination);
  const rawTransit = extractIata(searchParams?.transit);
  const [transitCode, setTransitCode] = useState<string>(rawTransit || (direction === "transit" ? airportCode : ""));
  const cleanOrigin = (originCode || "").trim().toUpperCase();
  const cleanDest = (destCode || "").trim().toUpperCase();
  const cleanTransit = (transitCode || rawTransit || "").trim().toUpperCase();

  const [serviceDate, setServiceDate] = useState<string>(() => {
    const rawParam = String(searchParams?.depart_date || searchParams?.service_date || "").trim();
    if (rawParam && /^\d{4}-\d{2}-\d{2}$/.test(rawParam) && isValid(parseISO(rawParam))) {
      return rawParam;
    }
    return format(new Date(), "yyyy-MM-dd");
  });
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [manualDatePopoverOpen, setManualDatePopoverOpen] = useState(false);

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const dateValue = useMemo(() => {
    if (serviceDate && isValid(parseISO(serviceDate))) {
      return parseISO(serviceDate);
    }
    return todayStart;
  }, [serviceDate, todayStart]);

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return;
    const formatted = format(newDate, "yyyy-MM-dd");
    setServiceDate(formatted);
    setIsFlightVerified(false);
    setVerifiedFlight(null);
    setFlightFetchError(null);
    setIsCutoffUrgent(false);
    setDatePopoverOpen(false);
    setManualDatePopoverOpen(false);
  };

  // Connecting Flight (Leg 2) Date State for Transit
  const [serviceDate2, setServiceDate2] = useState<string>(() => {
    const rawParam2 = String(searchParams?.depart_date_2 || searchParams?.service_date_2 || searchParams?.departDate2 || "").trim();
    if (rawParam2 && /^\d{4}-\d{2}-\d{2}$/.test(rawParam2) && isValid(parseISO(rawParam2))) {
      return rawParam2;
    }
    const rawParam1 = String(searchParams?.depart_date || searchParams?.service_date || "").trim();
    if (rawParam1 && /^\d{4}-\d{2}-\d{2}$/.test(rawParam1) && isValid(parseISO(rawParam1))) {
      return rawParam1;
    }
    return format(new Date(), "yyyy-MM-dd");
  });
  const [datePopoverOpen2, setDatePopoverOpen2] = useState(false);
  const [manualDatePopoverOpen2, setManualDatePopoverOpen2] = useState(false);

  const dateValue2 = useMemo(() => {
    if (serviceDate2 && isValid(parseISO(serviceDate2))) {
      return parseISO(serviceDate2);
    }
    return todayStart;
  }, [serviceDate2, todayStart]);

  const handleDateChange2 = (newDate: Date | undefined) => {
    if (!newDate) return;
    const formatted = format(newDate, "yyyy-MM-dd");
    setServiceDate2(formatted);
    setIsFlightVerified2(false);
    setVerifiedFlight2(null);
    setFlightFetchError2(null);
    setIsCutoffUrgent2(false);
    setDatePopoverOpen2(false);
    setManualDatePopoverOpen2(false);
  };

  const [paxAdults, setPaxAdults] = useState<number>(() => Math.min(10, Math.max(1, Number(searchParams?.pax_adults) || 1)));
  const paxChildren = Math.max(0, Number(searchParams?.pax_children) || 0);
  const paxInfants = Math.max(0, Number(searchParams?.pax_infants) || 0);
  const totalPax = paxAdults + paxChildren + paxInfants;

  // Selected Service Package & Authoritative Unit Price
  const initialPkgId = searchParams?.package_id || searchParams?.service_id || "gold";
  const [selectedPackageId, setSelectedPackageId] = useState<string>(initialPkgId);
  const [selectedPackageName, setSelectedPackageName] = useState<string>(
    searchParams?.package_name || (initialPkgId ? `${initialPkgId.charAt(0).toUpperCase() + initialPkgId.slice(1)} Service` : "VIP Concierge Service")
  );
  const [selectedPackagePrice, setSelectedPackagePrice] = useState<string>(searchParams?.package_price || "");

  // Dynamic Database-Driven Packages
  const [availablePackages, setAvailablePackages] = useState<Array<{
    id: string;
    title: string;
    tagline?: string;
    basePrice: number;
    currency: string;
    features?: string[];
  }>>([]);
  const [isPackagesLoading, setIsPackagesLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!airportCode) return;
    let active = true;
    setIsPackagesLoading(true);
    const jt = (direction || "departure").toUpperCase();
    const transitCat = direction === "transit" && originCode && destCode ? getTransitCategory(originCode, destCode) : null;
    const ft = (transitCat || travelType || "domestic").toUpperCase();
    const routeParams = originCode && destCode ? `&origin=${encodeURIComponent(originCode)}&destination=${encodeURIComponent(destCode)}` : "";
    const url = resolveApiUrl(`/api/airport/services?airport=${airportCode}&journey_type=${jt}&flight_type=${ft}${routeParams}`);

    fetch(url, { headers: { "Accept": "application/json" } })
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
  }, [airportCode, direction, travelType, originCode, destCode]);

  // Multi-Service Selection & Dynamic Availability State (Configured from Homepage Booking Panel)
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
  const [isArrangementSubmitting, setIsArrangementSubmitting] = useState<boolean>(false);
  const [arrangementSubmitted, setArrangementSubmitted] = useState<boolean>(false);
  const [serviceQuerySuccessRef, setServiceQuerySuccessRef] = useState<string | null>(null);

  const handleToggleService = (st: AirportServiceType) => {
    setSelectedServices((prev) => {
      if (prev.includes(st)) {
        if (prev.length === 1) {
          toast.info("At least one service must remain selected.");
          return prev;
        }
        return prev.filter((s) => s !== st);
      }
      return [...prev, st];
    });
  };

  const handleSelectPackageForService = (st: AirportServiceType, pkgSlug: string) => {
    setPackageByService((prev) => ({
      ...prev,
      [st]: pkgSlug,
    }));
  };

  // Multi-Currency State & Live Conversion
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

  // 2. Flight Verification State & Fuzzy Parsing
  const [flightNumber, setFlightNumber] = useState<string>(searchParams?.flight_number || "");
  const [isFlightFetching, setIsFlightFetching] = useState<boolean>(false);
  const [isFlightVerified, setIsFlightVerified] = useState<boolean>(false);
  const [verifiedFlight, setVerifiedFlight] = useState<FlightData | null>(null);
  const [flightFetchError, setFlightFetchError] = useState<string | null>(null);
  const [isCutoffUrgent, setIsCutoffUrgent] = useState<boolean>(false);

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

  // Sync multi-service availability whenever route, date, passengers, or selections change
  useEffect(() => {
    let active = true;
    const effOrigin = cleanOrigin || originCode || (direction === "departure" ? airportCode : "");
    const effDest = cleanDest || destCode || (direction === "arrival" ? airportCode : "");
    const effTransit = cleanTransit || transitCode || searchParams?.transit || (direction === "transit" ? airportCode : "");

    if (!effOrigin && !effDest && !airportCode) return;

    setIsMultiServiceLoading(true);

    MultiServiceApi.checkAvailability({
      origin_code: effOrigin || airportCode || "DEL",
      dest_code: effDest || airportCode || "BOM",
      transit_codes: effTransit ? [effTransit] : undefined,
      flight_num: flightNumber || undefined,
      service_date: serviceDate || undefined,
      guest_count: billablePax,
      selected_services: selectedServices.map((st) => ({
        service_type: st,
        package_slug: packageByService[st] || (st === (direction || "departure").toUpperCase() ? (selectedPackageId || initialPkgId) : undefined),
        airport_code: st === "DEPARTURE" ? effOrigin : st === "ARRIVAL" ? effDest : effTransit,
      })),
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
  ]);

  // Only true when an itinerary contains strictly unsupported airports NOT covered in our database
  const isArrangementOnly = useMemo(() => {
    if (!multiServiceResponse?.none_available) return false;
    return selectedServices.some((st) => {
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
      if (avail) {
        return !avail.is_airport_supported;
      }
      return Boolean(sAptClean && !AIRPORT_REGISTRY[sAptClean] && sAptClean !== airportCode.toUpperCase());
    });
  }, [multiServiceResponse?.none_available, selectedServices, cleanOrigin, originCode, direction, airportCode, cleanDest, destCode, cleanTransit, transitCode, searchParams?.transit, multiServiceAvailability]);

  // Mumbai Airport Express Fee rule:
  // For Mumbai Airport (BOM), if booking is created less than 24 hours before actual service start time:
  // - Domestic departure: service start = scheduled departure - 1 hour 30 minutes
  // - International departure: service start = scheduled departure - 3 hours
  // - Domestic arrival: service start = scheduled arrival
  // - International arrival: service start = scheduled arrival
  // If advance time < 24 hours (strictly less): add Express Fee = 50% of applicable service fee.
  // Exactly 24 hours does NOT trigger the fee.
  const expressFeeDetails = useMemo(() => {
    const isBom = (airportCode || "").toUpperCase() === "BOM";
    if (!isBom) return { feeInr: 0, isApplicable: false, advanceHours: null };

    const rawDep = isFlightVerified && verifiedFlight?.departure?.scheduledTime
      ? verifiedFlight.departure.scheduledTime
      : manualDepTime
      ? buildAnchoredServiceClock(serviceDate, manualDepTime, "10:00")
      : null;

    const rawArr = isFlightVerified && verifiedFlight?.arrival?.scheduledTime
      ? verifiedFlight.arrival.scheduledTime
      : manualArrTime
      ? buildAnchoredServiceClock(serviceDate, manualArrTime, "12:30")
      : null;

    const dir = (direction || "departure").toLowerCase();
    const isInternational = (travelType || "domestic").toLowerCase() === "international";

    let targetTimeStr: string | null = null;
    let offsetMs = 0;

    if (dir === "departure") {
      targetTimeStr = rawDep;
      if (!targetTimeStr) return { feeInr: 0, isApplicable: false, advanceHours: null };
      offsetMs = isInternational ? 3 * 60 * 60 * 1000 : (1 * 60 + 30) * 60 * 1000;
    } else {
      // arrival or transit
      targetTimeStr = rawArr || rawDep;
      if (!targetTimeStr) return { feeInr: 0, isApplicable: false, advanceHours: null };
      offsetMs = 0;
    }

    try {
      // Parse strictly in Indian Standard Time (IST / UTC+05:30)
      const hasOffset = /[Zz]|[+-]\d{2}:?\d{2}$/.test(targetTimeStr);
      const normalizedStr = hasOffset ? targetTimeStr : `${targetTimeStr}+05:30`;
      const flightTimestamp = new Date(normalizedStr).getTime();
      if (isNaN(flightTimestamp)) return { feeInr: 0, isApplicable: false, advanceHours: null };

      const serviceStartMs = flightTimestamp - offsetMs;
      const advanceMs = serviceStartMs - Date.now();
      const advanceHours = advanceMs / (1000 * 60 * 60);

      // Advance time strictly less than 24 hours, and service is in future
      if (advanceMs > 0 && advanceMs < 24 * 60 * 60 * 1000) {
        const fee = Math.round(baseInrTotalPrice * 0.50 * 100) / 100;
        return { feeInr: fee, isApplicable: true, advanceHours };
      }
      return { feeInr: 0, isApplicable: false, advanceHours };
    } catch {
      return { feeInr: 0, isApplicable: false, advanceHours: null };
    }
  }, [
    airportCode,
    direction,
    travelType,
    serviceDate,
    isFlightVerified,
    verifiedFlight,
    manualDepTime,
    manualArrTime,
    baseInrTotalPrice,
  ]);

  const expressFeeInr = expressFeeDetails.feeInr;
  const isExpressFeeApplicable = expressFeeDetails.isApplicable;
  const isMultiService = selectedServices.length > 1;
  const effectiveBaseInrTotalPrice =
    isMultiService && multiServiceResponse
      ? multiServiceResponse.total_payable
      : baseInrTotalPrice;
  const totalPrice = effectiveBaseInrTotalPrice + expressFeeInr;
  const convertedExpressFee = useMemo(() => convertFromINR(expressFeeInr, selectedCurrency), [expressFeeInr, selectedCurrency]);
  const convertedTotalPrice = useMemo(() => convertFromINR(totalPrice, selectedCurrency), [totalPrice, selectedCurrency]);

  // Dynamic Multi-Passenger State
  interface PassengerDetail {
    fullName: string;
    age: string;
    phone: string;
    email: string;
  }

  const [passengers, setPassengers] = useState<PassengerDetail[]>(() => {
    const count = Math.min(10, Math.max(1, Number(searchParams?.pax_adults) || 1));
    return Array.from({ length: count }, () => ({
      fullName: "",
      age: "",
      phone: "",
      email: "",
    }));
  });

  const handlePaxChange = (newCount: number) => {
    if (newCount > 10) {
      toast.info("Maximum 10 passengers allowed per booking. For larger groups, please contact our VIP desk.");
      return;
    }
    const count = Math.min(10, Math.max(1, newCount));
    setPaxAdults(count);
    setPassengers((prev) => {
      if (prev.length === count) return prev;
      if (prev.length < count) {
        const added = Array.from({ length: count - prev.length }, () => ({
          fullName: "",
          age: "",
          phone: "",
          email: "",
        }));
        return [...prev, ...added];
      }
      return prev.slice(0, count);
    });
  };

  const updatePassenger = (index: number, field: keyof PassengerDetail, value: string) => {
    setPassengers((prev) => {
      const updated = [...prev];
      if (!updated[index]) {
        updated[index] = { fullName: "", age: "", phone: "", email: "" };
      }
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const copyFromPassenger1 = (index: number) => {
    setPassengers((prev) => {
      const p1 = prev[0] || { phone: "", email: "" };
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          phone: p1.phone || "",
          email: p1.email || "",
        };
      }
      return updated;
    });
  };

  const primaryPassenger = passengers[0] || { fullName: "", age: "", phone: "", email: "" };
  const fullName = primaryPassenger.fullName;
  const age = primaryPassenger.age;
  const phone = primaryPassenger.phone;
  const email = primaryPassenger.email;
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [showNotes, setShowNotes] = useState<boolean>(false);

  // Corporate Invoicing & GST State (Optional)
  const [showGst, setShowGst] = useState<boolean>(false);
  const [gstCompanyName, setGstCompanyName] = useState<string>("");
  const [gstNumber, setGstNumber] = useState<string>("");
  const [gstBillingAddress, setGstBillingAddress] = useState<string>("");

  // Share Quote / Itinerary on WhatsApp
  const handleShareQuoteWhatsApp = () => {
    const flightDisplay =
      isFlightVerified && verifiedFlight
        ? `${verifiedFlight.carrier.name} ${verifiedFlight.flightNum}`
        : manualFlightNum || flightNumber || "Flight Pending";

    const msg = [
      `*Shafsky Aviation Services — VIP Booking Quote*`,
      `📍 *Airport:* ${airportCityName} (${airportCode}) — ${direction.toUpperCase()}`,
      `✨ *Package:* ${selectedPackageName}`,
      `✈️ *Flight:* ${flightDisplay} (${serviceDate || "Date TBD"})`,
      `👥 *Passengers:* ${totalPax} Pax (${paxAdults} Adults${paxChildren > 0 ? `, ${paxChildren} Children` : ""})`,
      `💳 *Total Amount:* ${formatPrice(convertedTotalPrice, selectedCurrency)} (All Taxes Incl.)`,
      ``,
      `Direct Review & Pay: ${typeof window !== "undefined" ? window.location.href : ""}`,
      `24/7 Aviation Desk: +91 9599087959`,
    ].join("\n");

    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  };

  // 3. Payment & Security Lifecycle (Backend-Verified Only)
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeBookingRef, setActiveBookingRef] = useState<string | null>(null);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"IDLE" | "OPEN" | "VERIFYING" | "PAID" | "FAILED" | "DISMISSED">("IDLE");
  const [isPaymentVerified, setIsPaymentVerified] = useState<boolean>(false);
  const [paymentTransactionId, setPaymentTransactionId] = useState<string | null>(null);
  const [confirmedBookingRef, setConfirmedBookingRef] = useState<string | null>(null);

  // Normalize flight input with fuzzy & ICAO handling
  const sanitizeFlightInput = (input: string): string => {
    let clean = input.trim().toUpperCase().replace(/[\s\-_]+/g, "");
    const match = clean.match(/^([A-Z0-9]{2,3})(\d+[A-Z]?)$/);
    if (match) {
      let carrier = match[1];
      const digits = match[2];
      if (ICAO_TO_IATA_MAP[carrier]) {
        carrier = ICAO_TO_IATA_MAP[carrier];
      }
      return `${carrier}${digits}`;
    }
    return clean;
  };

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

          // Strict Airport Mismatch Verification
          const selectedServiceAirport = (airportCode || "").trim().toUpperCase();
          const flOrigin = (flightData.origin?.code || "").trim().toUpperCase();
          const flDest = (flightData.destination?.code || "").trim().toUpperCase();

          if (flOrigin && flDest && flOrigin === flDest) {
            const sameErr = `Flight route origin and destination cannot be the same airport (${flOrigin}). Please verify your flight number.`;
            setFlightFetchError(sameErr);
            setIsFlightVerified(false);
            setVerifiedFlight(null);
            setManualFlightNum(cleaned);
            return;
          }

          if (direction === "departure") {
            if (flOrigin && selectedServiceAirport && flOrigin !== selectedServiceAirport) {
              const mismatch = `This flight departs from ${flOrigin} (${flightData.origin?.city || flightData.origin?.name || "Departure"}), but departure services were selected for ${selectedServiceAirport}. Please verify your flight or enter details manually.`;
              setFlightFetchError(mismatch);
              setIsFlightVerified(false);
              setVerifiedFlight(null);
              setManualFlightNum(cleaned);
              return;
            }
          } else if (direction === "arrival") {
            if (flDest && selectedServiceAirport && flDest !== selectedServiceAirport) {
              const mismatch = `This flight arrives at ${flDest} (${flightData.destination?.city || flightData.destination?.name || "Arrival"}), but arrival services were selected for ${selectedServiceAirport}. Please verify your flight or enter details manually.`;
              setFlightFetchError(mismatch);
              setIsFlightVerified(false);
              setVerifiedFlight(null);
              setManualFlightNum(cleaned);
              return;
            }
          }

          // Accurate Route Classification:
          // Check if either origin or destination is outside India
          const depCountry = (flightData.origin?.country || "").trim().toUpperCase();
          const arrCountry = (flightData.destination?.country || "").trim().toUpperCase();
          const depReg = getAirportRegistryEntry(flOrigin);
          const arrReg = getAirportRegistryEntry(flDest);

          const isOriginIndia =
            depCountry === "IN" ||
            depCountry === "INDIA" ||
            depCountry === "IND" ||
            Boolean(depReg) ||
            isIndianAirportCode(flOrigin);
          const isDestIndia =
            arrCountry === "IN" ||
            arrCountry === "INDIA" ||
            arrCountry === "IND" ||
            Boolean(arrReg) ||
            isIndianAirportCode(flDest);

          const isFlightTypeIntl = String(flightObj?.flight_type || flightObj?.travel_type || "").toUpperCase() === "INTERNATIONAL";
          const isActuallyIntl = isFlightTypeIntl || (!isOriginIndia || !isDestIndia);

          if (isActuallyIntl) {
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
          if (selectedServiceAirport === "DEL" && isActuallyIntl) {
            if (flightData.departure && (flOrigin === "DEL" || direction === "departure")) {
              flightData.departure.terminal = "3";
            }
            if (flightData.arrival && (flDest === "DEL" || direction === "arrival")) {
              flightData.arrival.terminal = "3";
            }
            setManualDepTerminal("3");
            setManualArrTerminal("3");
          }

          // Keep origin and destination state synchronized with verified flight
          if (flOrigin) {
            setOriginCode(flOrigin);
          }
          if (flDest) {
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
      console.warn("[AirportBookingFlow] Flight verification network exception:", err);
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

          const flOrigin = (flightData.origin?.code || "").trim().toUpperCase();
          const flDest = (flightData.destination?.code || "").trim().toUpperCase();

          if (flOrigin && flDest && flOrigin === flDest) {
            setFlightFetchError2(`Connecting flight route origin and destination cannot be the same (${flOrigin}).`);
            setIsFlightVerified2(false);
            setVerifiedFlight2(null);
            setManualFlightNum2(cleaned);
            return;
          }

          if (flOrigin && airportCode && flOrigin !== airportCode.toUpperCase()) {
            setFlightFetchError2(`This connecting flight departs from ${flOrigin}, but your transit hub is ${airportCode}. Please verify or enter manually.`);
            setIsFlightVerified2(false);
            setVerifiedFlight2(null);
            setManualFlightNum2(cleaned);
            return;
          }

          if (flDest && destCode && flDest !== destCode.toUpperCase()) {
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
      console.warn("[AirportBookingFlow] Connecting flight verification exception:", err);
      setFlightFetchError2("Flight verification service could not be reached. You can enter details manually below.");
      setIsFlightVerified2(false);
      setVerifiedFlight2(null);
      setManualFlightNum2(cleaned);
    } finally {
      setIsFlightFetching2(false);
    }
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

  // Direct Service Arrangement Submission (when services require offline concierge arrangement)
  const handleRequestServiceArrangement = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 1. Validate All Passenger Details
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      const pName = (p.fullName || "").trim();
      if (!pName || pName.length < 2) {
        toast.error(`Please enter the full name for Passenger ${i + 1}.`);
        return;
      }
    }

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailPattern.test(cleanEmail)) {
      toast.error("Please enter a valid email address for Passenger 1.");
      return;
    }

    const cleanPhone = normalizePhoneForStorage(phone);
    const phoneDigits = cleanPhone.replace(/\D/g, "");
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      toast.error("Please enter a valid mobile number, including your country code.");
      return;
    }

    const effFlightNum1 = (
      isFlightVerified && verifiedFlight
        ? verifiedFlight.flightNum
        : isManualMode
        ? sanitizeFlightInput(manualFlightNum)
        : sanitizeFlightInput(flightNumber)
    ).trim().toUpperCase();

    const effFlightNum2 = (
      isFlightVerified2 && verifiedFlight2
        ? verifiedFlight2.flightNum
        : isManualMode2
        ? sanitizeFlightInput(manualFlightNum2)
        : sanitizeFlightInput(flightNumber2)
    ).trim().toUpperCase();

    const effFlightNum = direction === "transit"
      ? (effFlightNum1 && effFlightNum2 ? `${effFlightNum1} / ${effFlightNum2}` : effFlightNum1 || effFlightNum2)
      : effFlightNum1 || manualFlightNum || flightNumber || "";

    if (!effFlightNum || effFlightNum.length < 3) {
      toast.error("Please enter your flight number.");
      return;
    }

    const reqOrigin = (
      (isFlightVerified && verifiedFlight?.origin?.code) ||
      originCode ||
      (direction === "departure" ? airportCode : "")
    ).trim().toUpperCase();

    const reqDest = (
      (isFlightVerified && verifiedFlight?.destination?.code) ||
      destCode ||
      (direction === "arrival" ? airportCode : "")
    ).trim().toUpperCase();

    const reqTransit = (transitCode || searchParams?.transit || (direction === "transit" ? airportCode : "")).trim().toUpperCase();

    setIsArrangementSubmitting(true);
    try {
      const qRes = await MultiServiceApi.createQuery({
        passenger_name: cleanName,
        passenger_email: cleanEmail,
        passenger_phone: cleanPhone,
        flight_num: effFlightNum,
        service_date: serviceDate || format(new Date(), "yyyy-MM-dd"),
        booking_ref: undefined,
        itinerary: multiServiceResponse?.itinerary || {
          origin: reqOrigin,
          destination: reqDest,
          transit: reqTransit || undefined,
        },
        requested_services: (multiServiceResponse?.services || selectedServices.map((st) => ({
          service_type: st,
          airport_code: st === "DEPARTURE" ? reqOrigin : st === "ARRIVAL" ? reqDest : (reqTransit || airportCode),
          status: "REQUEST_REQUIRED",
          package: packageByService[st] || "silver",
        }))) as any,
        unavailable_services: (
          multiServiceResponse?.services?.filter((s) => s.status === "REQUEST_REQUIRED")?.length
            ? multiServiceResponse.services.filter((s) => s.status === "REQUEST_REQUIRED")
            : selectedServices.map((st) => ({
                service_type: st,
                airport_code: st === "DEPARTURE" ? reqOrigin : st === "ARRIVAL" ? reqDest : (reqTransit || airportCode),
                status: "REQUEST_REQUIRED",
                package: packageByService[st] || "silver",
              }))
        ) as any,
        notes: "Customer requested airport concierge arrangement.",
      });

      setServiceQuerySuccessRef(qRes.query_ref);
      setArrangementSubmitted(true);
      toast.success("Service arrangement requested successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit service arrangement. Please try again.");
    } finally {
      setIsArrangementSubmitting(false);
    }
  };

  // Launch Razorpay Payment & Confirm Booking ONLY upon Backend Signature Verification
  const handleProceedToPayment = async (e?: React.SubmitEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();

    // 1. Validate All Passenger Details
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      const pName = (p.fullName || "").trim();
      if (!pName || pName.length < 2) {
        toast.error(`Please enter the full name for Passenger ${i + 1}.`);
        return;
      }
      if (p.age && (Number(p.age) < 1 || Number(p.age) > 120)) {
        toast.error(`Please enter a valid age for Passenger ${i + 1}.`);
        return;
      }
    }

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailPattern.test(cleanEmail)) {
      toast.error("Please enter a valid email address for Passenger 1.");
      return;
    }

    // Accept any country: an international number keeps its leading "+" so it
    // stays routable for WhatsApp/SMS. Previously the dial code was stripped
    // and a 10-digit minimum applied, which rejected and mangled foreign
    // numbers even though the backend accepts them.
    const cleanPhone = normalizePhoneForStorage(phone);
    const phoneDigits = cleanPhone.replace(/\D/g, "");
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      toast.error("Please enter a valid mobile number, including your country code.");
      return;
    }

    // 2. Validate Flight Numbers (Separate validation for Transit legs)
    const activeFlightNum1 = (
      isFlightVerified && verifiedFlight
        ? verifiedFlight.flightNum
        : isManualMode
        ? sanitizeFlightInput(manualFlightNum)
        : sanitizeFlightInput(flightNumber)
    ).trim().toUpperCase();

    const activeFlightNum2 = (
      isFlightVerified2 && verifiedFlight2
        ? verifiedFlight2.flightNum
        : isManualMode2
        ? sanitizeFlightInput(manualFlightNum2)
        : sanitizeFlightInput(flightNumber2)
    ).trim().toUpperCase();

    if (direction === "transit") {
      if (!activeFlightNum1 || activeFlightNum1.length < 3) {
        toast.error("Incoming flight number is required (Leg 1: Origin → Transit Hub).");
        return;
      }
      if (!activeFlightNum2 || activeFlightNum2.length < 3) {
        toast.error("Connecting flight number is required (Leg 2: Transit Hub → Final Destination).");
        return;
      }
    } else {
      if (!activeFlightNum1 || activeFlightNum1.length < 3) {
        toast.error("Flight number is required. Please enter or verify your flight.");
        return;
      }
    }

    const packageSlug = (selectedPackageId || "gold").toLowerCase();
    let cleanOrigin = (
      (isFlightVerified && verifiedFlight?.origin?.code) ||
      (originCode && originCode !== airportCode ? originCode : "") ||
      (direction === "departure" ? airportCode : "")
    ).trim().toUpperCase();

    let cleanDest = (
      (isFlightVerified && verifiedFlight?.destination?.code) ||
      (destCode && destCode !== airportCode ? destCode : "") ||
      (direction === "arrival" ? airportCode : "")
    ).trim().toUpperCase();

    if (direction !== "transit") {
      if (direction === "arrival") {
        if (!cleanDest) cleanDest = airportCode;
        if (cleanOrigin === cleanDest) cleanOrigin = "";
      } else if (direction === "departure") {
        if (!cleanOrigin) cleanOrigin = airportCode;
        if (cleanOrigin === cleanDest) cleanDest = "";
      }
    }

    if (direction === "arrival" && !cleanOrigin) {
      toast.error("Please select or enter your departure airport (where your flight is departing from).");
      return;
    }

    if (direction === "departure" && !cleanDest) {
      toast.error("Please select or enter your destination airport (where your flight is flying to).");
      return;
    }

    if (direction === "transit") {
      if (!cleanOrigin) {
        toast.error("Please select the inbound departure airport (where your flight is arriving from).");
        return;
      }
      if (!cleanDest) {
        toast.error("Please select the outbound destination airport (where your flight is connecting to).");
        return;
      }
      if (cleanOrigin === cleanDest) {
        toast.error("Inbound departure and outbound destination airports cannot be the same.");
        return;
      }
    }

    if (
      direction !== "transit" &&
      cleanOrigin &&
      cleanDest &&
      cleanOrigin === cleanDest
    ) {
      toast.error("Departure and arrival airports cannot be the same. Please verify your flight or select a valid route.");
      return;
    }

    // Clocks for Leg 1 (or single flight)
    const depClock1 = buildAnchoredServiceClock(
      serviceDate,
      isFlightVerified ? verifiedFlight?.departure?.scheduledTime : null,
      manualDepTime || "10:00"
    );

    const arrClock1 = buildAnchoredServiceClock(
      serviceDate,
      isFlightVerified ? verifiedFlight?.arrival?.scheduledTime : null,
      manualArrTime || "12:30"
    );

    let terminalVal1 = isFlightVerified
      ? direction === "arrival"
        ? verifiedFlight?.arrival?.terminal
        : verifiedFlight?.departure?.terminal
      : direction === "arrival"
      ? manualArrTerminal
      : manualDepTerminal;

    if ((airportCode || "").toUpperCase() === "DEL" && travelType === "international") {
      terminalVal1 = "Terminal 3";
    }

    // Clocks for Leg 2 (Connecting Flight in Transit)
    const depClock2 = buildAnchoredServiceClock(
      serviceDate2,
      isFlightVerified2 ? verifiedFlight2?.departure?.scheduledTime : null,
      manualDepTime2 || "14:00"
    );

    const arrClock2 = buildAnchoredServiceClock(
      serviceDate2,
      isFlightVerified2 ? verifiedFlight2?.arrival?.scheduledTime : null,
      manualArrTime2 || "17:30"
    );

    let terminalVal2 = isFlightVerified2
      ? verifiedFlight2?.departure?.terminal
      : manualDepTerminal2;

    if ((destCode || "").toUpperCase() === "DEL" && travelType === "international") {
      terminalVal2 = "Terminal 3";
    }

    if (multiServiceResponse && multiServiceResponse.none_available) {
      await handleRequestServiceArrangement();
      return;
    }

    setSubmitting(true);
    setPaymentStatus("OPEN");

    try {
      // 3. Create initial PENDING booking and generate server-side Razorpay Order
      let bookingRefToUse = activeBookingRef;
      let orderId: string | null = null;
      let keyId: string | null = null;
      let amountPaise: number = selectedCurrency === "INR" ? convertedTotalPrice * 100 : Math.round(convertedTotalPrice * 100);

      const submissionFlightNum = direction === "transit"
        ? `${activeFlightNum1} / ${activeFlightNum2}`
        : activeFlightNum1;

      const transitCategory = direction === "transit" && cleanOrigin && cleanDest
        ? getTransitCategory(cleanOrigin, cleanDest)
        : travelType.toUpperCase();

      const createRes = await ApiClient.fetchWithAuth("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          passengerName: cleanName,
          passengerEmail: cleanEmail,
          passengerPhone: cleanPhone,
          serviceCategory: "Airport Assistance",
          serviceType: selectedServices.length > 1 ? "multi_service" : packageSlug,
          selectedServices: {
            multi_service: selectedServices.length > 1,
            services: selectedServices.map((st) => ({
              service_type: st,
              airport_code: st === "DEPARTURE" ? cleanOrigin : st === "ARRIVAL" ? cleanDest : (cleanTransit || transitCode || airportCode),
              package: packageByService[st] || (st === (direction || "departure").toUpperCase() ? packageSlug : undefined),
            })),
          },
          flightNum: submissionFlightNum,
          originCode: cleanOrigin,
          destCode: cleanDest,
          metadataJson: {
            multi_service: selectedServices.length > 1,
            selected_services: {
              multi_service: selectedServices.length > 1,
              services: selectedServices.map((st) => ({
                service_type: st,
                airport_code: st === "DEPARTURE" ? cleanOrigin : st === "ARRIVAL" ? cleanDest : (cleanTransit || transitCode || airportCode),
                package: packageByService[st] || (st === (direction || "departure").toUpperCase() ? packageSlug : undefined),
              })),
            },
            service_breakdown: multiServiceResponse?.services || [],
            available_services: multiServiceResponse?.services.filter((s) => s.status === "AVAILABLE") || [],
            unavailable_services: multiServiceResponse?.services.filter((s) => s.status === "REQUEST_REQUIRED") || [],
            itinerary: multiServiceResponse?.itinerary || {},
            journey_type: direction.toUpperCase(),
            direction,
            service_date: serviceDate,
            depart_date: serviceDate,
            travel_date: serviceDate,
            flight_date: serviceDate,
            flight_type: transitCategory,
            travel_type: transitCategory,
            transit_type: direction === "transit" ? transitCategory : undefined,
            transit_hub: direction === "transit" ? airportCode.toUpperCase() : undefined,
            transit_code: direction === "transit" ? airportCode.toUpperCase() : undefined,
            origin_iata: cleanOrigin,
            destination_iata: cleanDest,
            service_airport: airportCode.toUpperCase(),
            terminal: terminalVal1 || undefined,
            pax_adults: paxAdults,
            pax_children: paxChildren,
            pax_infants: paxInfants,
            guest_count: totalPax,
            passenger_age: age ? Number(age) : undefined,
            passengers: passengers.map((p, idx) => ({
              passenger_number: idx + 1,
              name: p.fullName.trim(),
              age: p.age ? Number(p.age) : undefined,
              phone: p.phone.trim() || cleanPhone,
              email: p.email.trim() || cleanEmail,
            })),
            // Two-leg details for Transit bookings
            ...(direction === "transit"
              ? {
                  incoming_flight_number: activeFlightNum1,
                  incoming_flight_date: serviceDate,
                  incoming_flight: {
                    flight_number: activeFlightNum1,
                    airline: isManualMode ? manualAirline : (verifiedFlight?.carrier?.name || "Verified Airline"),
                    airline_iata: isManualMode ? manualAirlineIata : (verifiedFlight?.carrier?.iata || activeFlightNum1.slice(0, 2)),
                    origin: cleanOrigin,
                    destination: airportCode,
                    date: serviceDate,
                    departure_time: depClock1,
                    arrival_time: arrClock1,
                    terminal: terminalVal1 || undefined,
                    verified: isFlightVerified,
                  },
                  connecting_flight_number: activeFlightNum2,
                  connecting_flight_date: serviceDate2,
                  connecting_flight: {
                    flight_number: activeFlightNum2,
                    airline: isManualMode2 ? manualAirline2 : (verifiedFlight2?.carrier?.name || "Verified Airline"),
                    airline_iata: isManualMode2 ? manualAirlineIata2 : (verifiedFlight2?.carrier?.iata || activeFlightNum2.slice(0, 2)),
                    origin: airportCode,
                    destination: cleanDest,
                    date: serviceDate2,
                    departure_time: depClock2,
                    arrival_time: arrClock2,
                    terminal: terminalVal2 || undefined,
                    verified: isFlightVerified2,
                  },
                  legs: [
                    {
                      leg: "incoming",
                      flight_number: activeFlightNum1,
                      airline: isManualMode ? manualAirline : (verifiedFlight?.carrier?.name || "Verified Airline"),
                      origin: cleanOrigin,
                      destination: airportCode,
                      date: serviceDate,
                      time: arrClock1,
                      terminal: terminalVal1 || undefined,
                    },
                    {
                      leg: "connecting",
                      flight_number: activeFlightNum2,
                      airline: isManualMode2 ? manualAirline2 : (verifiedFlight2?.carrier?.name || "Verified Airline"),
                      origin: airportCode,
                      destination: cleanDest,
                      date: serviceDate2,
                      time: depClock2,
                      terminal: terminalVal2 || undefined,
                    },
                  ],
                }
              : {}),
            package: packageSlug,
            unit_price: convertedUnitPrice,
            currency: selectedCurrency,
            base_inr_price: baseInrTotalPrice,
            express_fee: convertedExpressFee,
            gst_company_name: showGst && gstCompanyName.trim() ? gstCompanyName.trim() : undefined,
            gst_number: showGst && gstNumber.trim() ? gstNumber.trim().toUpperCase() : undefined,
            gst_billing_address: showGst && gstBillingAddress.trim() ? gstBillingAddress.trim() : undefined,
          },
          departureTime: direction === "transit" ? depClock1 : depClock1,
          arrivalTime: direction === "transit" ? arrClock2 : arrClock1,
          totalAmount: convertedTotalPrice,
          currency: selectedCurrency,
          notes: direction === "transit"
            ? (specialRequests
                ? `${specialRequests} | Transit at ${airportCode}: Incoming ${activeFlightNum1} (${cleanOrigin} -> ${airportCode}, ${serviceDate}), Connecting ${activeFlightNum2} (${airportCode} -> ${cleanDest}, ${serviceDate2}) | Passengers: ${passengers.map((p, idx) => `P${idx + 1}: ${p.fullName.trim()}${p.age ? ` (${p.age}y)` : ""}`).join(", ")}`
                : `Transit at ${airportCode}: Incoming ${activeFlightNum1} (${cleanOrigin} -> ${airportCode}, ${serviceDate}), Connecting ${activeFlightNum2} (${airportCode} -> ${cleanDest}, ${serviceDate2}) | Passengers: ${passengers.map((p, idx) => `P${idx + 1}: ${p.fullName.trim()}${p.age ? ` (${p.age}y)` : ""}`).join(", ")}`)
            : (specialRequests
                ? `${specialRequests} | Passengers: ${passengers.map((p, idx) => `P${idx + 1}: ${p.fullName.trim()}${p.age ? ` (${p.age}y)` : ""}`).join(", ")}`
                : `Airport: ${airportCode}, Direction: ${direction} | Passengers: ${passengers.map((p, idx) => `P${idx + 1}: ${p.fullName.trim()}${p.age ? ` (${p.age}y)` : ""}`).join(", ")}`),
        }),
      });

      const createData = await createRes.json().catch(() => null);

      if (!createRes.ok || !createData || !createData.success) {
        const errDetail = createData?.detail || createData?.error || "Error initializing booking.";
        if (
          errDetail.toLowerCase().includes("cutoff") ||
          errDetail.toLowerCase().includes("12 hours") ||
          errDetail.toLowerCase().includes("24 hours")
        ) {
          setIsCutoffUrgent(true);
        }
        toast.error(errDetail);
        setSubmitting(false);
        setPaymentStatus("FAILED");
        return;
      }

      bookingRefToUse = createData.data?.bookingRef || createData.data?.booking_ref;
      const iciciRedirect = createData.data?.icici_redirect_url as string | undefined;
      const paymentGateway = String(createData.data?.payment_gateway || "").toUpperCase();
      orderId = createData.data?.razorpay_order_id;
      keyId = createData.data?.razorpay_key_id;
      amountPaise = createData.data?.razorpay_amount_paise || (selectedCurrency === "INR" ? convertedTotalPrice * 100 : Math.round(convertedTotalPrice * 100));

      if (bookingRefToUse) {
        setActiveBookingRef(bookingRefToUse);
      }
      const issuedToken = createData.data?.payment_token as string | undefined;
      if (issuedToken) {
        setPaymentToken(issuedToken);
      }

      if (paymentGateway === "ICICI" || iciciRedirect) {
        if (!iciciRedirect) {
          toast.error("Payment gateway could not be initialized. Please retry.");
          setSubmitting(false);
          setPaymentStatus("FAILED");
          return;
        }
        toast.loading("Redirecting to ICICI Bank secure payment…", { id: "icici-redirect" });
        window.location.assign(iciciRedirect);
        return;
      }

      if (!orderId || !keyId || String(orderId).startsWith("order_sim_")) {
        toast.error("Payment gateway could not be initialized. Please retry.");
        setSubmitting(false);
        setPaymentStatus("FAILED");
        return;
      }

      // 4. Load Razorpay Checkout Script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load Razorpay Checkout SDK. Please check your internet connection.");
        setSubmitting(false);
        setPaymentStatus("FAILED");
        return;
      }

      const formattedContact = toRazorpayContact(cleanPhone);

      // 5. Open Official Razorpay Checkout Modal (Multi-Currency, UPI, Google Pay & Cards)
      const rzpOptions: Record<string, unknown> = {
        key: keyId,
        amount: amountPaise,
        currency: selectedCurrency,
        name: "Shafsky Aviation Services Concierge",
        description: `${selectedPackageName} (${airportCode}) — ${bookingRefToUse}`,
        order_id: orderId,
        prefill: {
          name: cleanName,
          email: cleanEmail,
          ...(formattedContact ? { contact: formattedContact } : {}),
        },
        remember_customer: false,
        retry: { enabled: false },
        theme: {
          color: "#84cc16",
        },
        handler: async (payResponse: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setSubmitting(true);
          setPaymentStatus("VERIFYING");
          toast.loading("Verifying payment with bank...", { id: "payment-verify" });

          try {
            // 6. SERVER-SIDE PAYMENT VERIFICATION (MANDATORY GATEKEEPER)
            const verifyRes = await ApiClient.fetchWithAuth("/api/payments/verify", {
              method: "POST",
              body: JSON.stringify({
                razorpay_order_id: payResponse.razorpay_order_id || orderId,
                razorpay_payment_id: payResponse.razorpay_payment_id,
                razorpay_signature: payResponse.razorpay_signature,
                booking_ref: bookingRefToUse,
              }),
            });
            const verifyData = await verifyRes.json().catch(() => null);
            toast.dismiss("payment-verify");

            if (verifyRes.ok && verifyData?.success) {
              // ONLY NOW IS THE BOOKING CONFIRMED
              setIsPaymentVerified(true);
              setConfirmedBookingRef(bookingRefToUse);
              setPaymentTransactionId(payResponse.razorpay_payment_id);
              setPaymentStatus("PAID");
              toast.success("Payment verified! Your booking is confirmed.");

              // Link any pending unavailable services as a concierge request under this confirmed booking
              if (multiServiceResponse?.services?.some((s) => s.status === "REQUEST_REQUIRED")) {
                const unavail = multiServiceResponse.services.filter((s) => s.status === "REQUEST_REQUIRED");
                MultiServiceApi.createQuery({
                  passenger_name: cleanName,
                  passenger_email: cleanEmail,
                  passenger_phone: cleanPhone,
                  flight_num: submissionFlightNum,
                  service_date: serviceDate,
                  booking_ref: bookingRefToUse || undefined,
                  requested_services: selectedServices.map((st) => ({
                    service_type: st,
                    airport_code: st === "DEPARTURE" ? cleanOrigin : st === "ARRIVAL" ? cleanDest : (cleanTransit || transitCode || airportCode),
                  })),
                  unavailable_services: unavail,
                  notes: `Linked concierge arrangement for paid booking ${bookingRefToUse}`,
                }).catch((qErr) => {
                  console.warn("[AirportBookingFlow] Failed to create linked service query:", qErr);
                });
              }
            } else {
              const reason = verifyData?.detail || verifyData?.error || "Payment signature verification failed.";
              toast.error(`Verification failed: ${reason}`);
              setIsPaymentVerified(false);
              setPaymentStatus("FAILED");
            }
          } catch (vErr) {
            toast.dismiss("payment-verify");
            console.error("[AirportBookingFlow] Payment verification error:", vErr);
            toast.error("Failed to verify payment with server. Please retry.");
            setIsPaymentVerified(false);
            setPaymentStatus("FAILED");
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setPaymentStatus("DISMISSED");
            setIsPaymentVerified(false);
            toast.info("Payment window closed. You can retry payment anytime.");
          },
        },
      };

      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.on("payment.failed", (failRes: any) => {
        setSubmitting(false);
        setPaymentStatus("FAILED");
        setIsPaymentVerified(false);
        toast.error(`Payment failed: ${failRes.error?.description || "Transaction failed"}`);
      });
      rzp.open();
    } catch (err: any) {
      console.error("[AirportBookingFlow] Payment error:", err);
      setSubmitting(false);
      setPaymentStatus("FAILED");
      setIsPaymentVerified(false);
      toast.error(err?.message || "Unable to start payment. Please try again.");
    }
  };

  // Retry payment for an existing pending booking
  const handleRetryPayment = async () => {
    if (!activeBookingRef) {
      handleProceedToPayment();
      return;
    }

    setSubmitting(true);
    setPaymentStatus("OPEN");

    try {
      const retryRes = await ApiClient.fetchWithAuth("/api/payments/retry", {
        method: "POST",
        body: JSON.stringify({
          booking_ref: activeBookingRef,
          payment_token: paymentToken,
        }),
      });
      const retryData = await retryRes.json().catch(() => null);

      if (!retryRes.ok || !retryData || !retryData.success) {
        toast.error(retryData?.detail || retryData?.error || "Unable to retry payment. Re-initializing booking...");
        handleProceedToPayment();
        return;
      }

      if (retryData.data?.payment_token) {
        setPaymentToken(String(retryData.data.payment_token));
      }

      const orderId = retryData.data?.razorpay_order_id;
      const keyId = retryData.data?.razorpay_key_id;
      const iciciRedirect = retryData.data?.icici_redirect_url as string | undefined;
      const paymentGateway = String(
        retryData.data?.gateway || retryData.data?.payment_gateway || "",
      ).toUpperCase();
      const amountPaise =
        retryData.data?.razorpay_amount_paise ||
        (selectedCurrency === "INR" ? convertedTotalPrice * 100 : Math.round(convertedTotalPrice * 100));

      if (paymentGateway === "ICICI" || iciciRedirect) {
        if (!iciciRedirect) {
          toast.error("Unable to start ICICI payment. Please try again.");
          setSubmitting(false);
          setPaymentStatus("FAILED");
          return;
        }
        toast.loading("Redirecting to ICICI Bank secure payment…", { id: "icici-redirect" });
        window.location.assign(iciciRedirect);
        return;
      }

      if (!orderId || !keyId || String(orderId).startsWith("order_sim_")) {
        toast.error("Payment gateway could not be initialized. Please retry.");
        setSubmitting(false);
        setPaymentStatus("FAILED");
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load Razorpay SDK. Please check internet connection.");
        setSubmitting(false);
        setPaymentStatus("FAILED");
        return;
      }

      const formattedContact = toRazorpayContact(phone);

      const rzpOptions: Record<string, unknown> = {
        key: keyId,
        amount: amountPaise,
        currency: selectedCurrency,
        name: "Shafsky Aviation Services",
        description: `${selectedPackageName} (${airportCode}) — ${activeBookingRef}`,
        order_id: orderId,
        prefill: {
          name: fullName,
          email: email,
          ...(formattedContact ? { contact: formattedContact } : {}),
        },
        remember_customer: false,
        retry: { enabled: false },
        theme: {
          color: "#84cc16",
        },
        handler: async (payResponse: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setSubmitting(true);
          setPaymentStatus("VERIFYING");
          toast.loading("Verifying payment with bank...", { id: "payment-verify" });

          try {
            const verifyRes = await ApiClient.fetchWithAuth("/api/payments/verify", {
              method: "POST",
              body: JSON.stringify({
                razorpay_order_id: payResponse.razorpay_order_id || orderId,
                razorpay_payment_id: payResponse.razorpay_payment_id,
                razorpay_signature: payResponse.razorpay_signature,
                booking_ref: activeBookingRef,
              }),
            });
            const verifyData = await verifyRes.json().catch(() => null);
            toast.dismiss("payment-verify");

            if (verifyRes.ok && verifyData?.success) {
              setIsPaymentVerified(true);
              setConfirmedBookingRef(activeBookingRef);
              setPaymentTransactionId(payResponse.razorpay_payment_id);
              setPaymentStatus("PAID");
              toast.success("Payment verified! Your booking is confirmed.");
            } else {
              toast.error(verifyData?.detail || verifyData?.error || "Payment signature verification failed.");
              setIsPaymentVerified(false);
              setPaymentStatus("FAILED");
            }
          } catch (vErr) {
            toast.dismiss("payment-verify");
            toast.error("Failed to verify payment with server. Please retry.");
            setIsPaymentVerified(false);
            setPaymentStatus("FAILED");
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setPaymentStatus("DISMISSED");
            setIsPaymentVerified(false);
            toast.info("Payment window closed. You can retry payment anytime.");
          },
        },
      };

      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.on("payment.failed", (failRes: any) => {
        setSubmitting(false);
        setPaymentStatus("FAILED");
        setIsPaymentVerified(false);
        toast.error(`Payment failed: ${failRes.error?.description || "Transaction failed"}`);
      });
      rzp.open();
    } catch (err: any) {
      console.error("[AirportBookingFlow] Retry error:", err);
      setSubmitting(false);
      setPaymentStatus("FAILED");
      setIsPaymentVerified(false);
      toast.error("Unable to reopen payment checkout. Please try again.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SUCCESS SCREEN: BOOKING CONFIRMED ONLY UPON SERVER-SIDE PAYMENT VERIFICATION
  // ─────────────────────────────────────────────────────────────────────────────
  if (confirmedBookingRef && isPaymentVerified && paymentStatus === "PAID") {
    const activeFlight = isFlightVerified && verifiedFlight
      ? `${verifiedFlight.flightNum} (${verifiedFlight.carrier.name || "Verified Flight"})`
      : isManualMode
      ? `${manualFlightNum} (${manualAirline || manualAirlineIata || "Airline"})`
      : flightNumber;

    const activeFlight1 = activeFlight;
    const activeFlight2 = isFlightVerified2 && verifiedFlight2
      ? `${verifiedFlight2.flightNum} (${verifiedFlight2.carrier.name || "Verified Flight"})`
      : isManualMode2
      ? `${manualFlightNum2} (${manualAirline2 || manualAirlineIata2 || "Airline"})`
      : flightNumber2;

    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <div className="overflow-hidden rounded-3xl border border-lime-400 bg-white shadow-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-8 text-center text-white sm:px-10">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-500 text-slate-950 shadow-md">
              <CheckCircle2 size={32} />
            </div>
            <span className="rounded-full bg-lime-500/20 px-3 py-1 font-mono text-[10.5px] font-extrabold uppercase tracking-widest text-lime-400 border border-lime-400/30">
              Payment Successful • Booking Confirmed
            </span>
            <h2 className="mt-3 font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome Begins Before You Land.
            </h2>
            <p className="mt-1.5 text-xs text-slate-300 font-medium">
              Your VIP concierge reservation at {airportCityName} has been confirmed.
            </p>
          </div>

          {/* Booking Ref & Payment ID Card */}
          <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4 sm:px-10 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Booking Reference
              </span>
              <div className="font-mono text-xl sm:text-2xl font-black text-slate-950 tracking-wider">
                {confirmedBookingRef}
              </div>
              {paymentTransactionId && (
                <span className="font-mono text-[10.5px] text-lime-800 font-bold block mt-0.5">
                  Razorpay Payment ID: {paymentTransactionId}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-lime-500 px-3 py-1 text-xs font-mono font-bold text-slate-950">
                {formatPrice(convertedTotalPrice, selectedCurrency)} PAID
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(confirmedBookingRef);
                  toast.success("Booking reference copied to clipboard.");
                }}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer transition"
              >
                <Copy size={13} />
                <span>Copy</span>
              </button>
            </div>
          </div>

          {/* Details Summary Table */}
          <div className="px-6 py-6 sm:px-10 space-y-4">
            {direction === "transit" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                    Transit Hub & Service
                  </span>
                  <span className="font-bold text-slate-900 block font-sans">
                    {airportCityName} ({airportCode})
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium font-sans">
                    {selectedPackageName}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                    Route & Category
                  </span>
                  <span className="font-mono font-bold text-slate-900 block">
                    {originCode} ➔ {airportCode} ➔ {destCode}
                  </span>
                  <span className="font-mono text-[11px] text-slate-600 font-medium capitalize">
                    {travelType} Transit
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                    Incoming Flight (Leg 1)
                  </span>
                  <span className="font-mono font-bold text-slate-900 block text-xs">
                    {activeFlight1}
                  </span>
                  <span className="font-mono text-[11px] text-slate-600 font-medium">
                    {format(dateValue, "dd MMM yyyy")}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                    Connecting Flight (Leg 2)
                  </span>
                  <span className="font-mono font-bold text-slate-900 block text-xs">
                    {activeFlight2}
                  </span>
                  <span className="font-mono text-[11px] text-slate-600 font-medium">
                    {format(dateValue2, "dd MMM yyyy")}
                  </span>
                </div>

                <div className="sm:col-span-2 rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                    Lead Guest & Passengers
                  </span>
                  <span className="font-bold text-slate-900 block truncate font-sans">
                    {fullName}
                  </span>
                  <span className="font-mono text-[11px] text-slate-600 font-medium">
                    {totalPax} Passenger{totalPax > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                    Airport & Service
                  </span>
                  <span className="font-bold text-slate-900 block font-sans">
                    {airportCityName} ({airportCode})
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium font-sans">
                    {selectedPackageName}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                    Journey & Date
                  </span>
                  <span className="font-bold text-slate-900 block capitalize font-sans">
                    {travelType} {direction}
                  </span>
                  <span className="font-mono text-[11px] text-slate-600 font-medium">
                    {format(dateValue, "dd MMM yyyy")}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                    Flight
                  </span>
                  <span className="font-mono font-bold text-slate-900 block text-xs">
                    {activeFlight}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                    Lead Guest & Passengers
                  </span>
                  <span className="font-bold text-slate-900 block truncate font-sans">
                    {fullName}
                  </span>
                  <span className="font-mono text-[11px] text-slate-600 font-medium">
                    {totalPax} Passenger{totalPax > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )}

            {multiServiceResponse && multiServiceResponse.unavailable_services_count > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertCircle size={16} className="text-amber-700 shrink-0" />
                  <span>Pending Service Arrangement (Not Confirmed)</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {multiServiceResponse.services.filter((s) => s.status === "REQUEST_REQUIRED").map((us) => (
                    <div key={`${us.service_type}-${us.airport_code}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-white/90 border border-amber-200 gap-1">
                      <span className="font-bold text-amber-950">
                        {us.service_type === "DEPARTURE" ? "Departure" : us.service_type === "ARRIVAL" ? "Arrival" : "Transit"} Service ({us.airport_code})
                      </span>
                      <span className="text-[11px] text-amber-900 font-semibold">
                        “We will arrange your service at this airport and inform you shortly.”
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11.5px] text-amber-800 leading-relaxed font-sans pt-1">
                  Your available airport services are confirmed and paid. The unavailable service(s) above have been saved as a pending arrangement request linked to booking <strong>{confirmedBookingRef}</strong>. Our operations team will contact you shortly.
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-lime-200 bg-lime-50/50 p-4 text-xs text-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-lime-900">
                <ShieldCheck size={16} className="text-lime-700" />
                <span>Next Steps</span>
              </div>
              <p className="text-[11.5px] text-slate-600 leading-relaxed font-sans">
                Our airport concierge team will reach out on your contact number (<strong>{phone}</strong>) and email (<strong>{email}</strong>) prior to flight departure or arrival to coordinate your meeting point.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition"
              >
                <span>Return to Home</span>
              </Link>

              <a
                href={`https://wa.me/919599087959?text=${encodeURIComponent(
                  `Hi Shafsky Team, I just confirmed and paid booking ${confirmedBookingRef} for ${selectedPackageName} at ${airportCode}. Payment ID: ${paymentTransactionId}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-800 hover:bg-slate-50 transition"
              >
                <span>WhatsApp Support Desk</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DIRECT BOOKING DETAILS (FLIGHT + PASSENGER + SUMMARY + PAYMENT GATEWAY)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      {/* Trip Context Banner */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-500 text-slate-950 font-bold font-mono text-xs">
              ✓
            </span>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                Selected Airport Service
              </span>
              <span className="font-serif text-base sm:text-lg font-bold text-slate-900">
                {airportCityName} ({airportCode})
              </span>
            </div>
          </div>

          <Link
            to="/airports/$code"
            params={{ code: airportCode }}
            hash="available-services"
            className="text-[11px] font-mono font-bold text-slate-600 hover:text-slate-950 underline cursor-pointer"
          >
            Change Service
          </Link>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-mono font-medium text-slate-600">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-800">
            {selectedPackageName}
          </span>
          <span>•</span>
          <span className="capitalize">
            {travelType} {direction}
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1.5 bg-lime-50 text-slate-900 border border-lime-300/80 px-2 py-0.5 rounded-md font-bold">
            <CalendarDays size={12} className="text-lime-700" />
            <span>{format(dateValue, "dd MMM yyyy")}</span>
          </span>
          <span>•</span>
          <span>
            <strong>{totalPax}</strong> Pax ({paxAdults}A{paxChildren ? `, ${paxChildren}C` : ""}
            {paxInfants ? `, ${paxInfants}I` : ""})
          </span>
          <span>•</span>
          <span className="text-lime-700 font-bold">
            {formatPrice(convertedTotalPrice, selectedCurrency)} total
          </span>
        </div>

        {isPackagesLoading ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-200/80 animate-pulse">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Loading packages:
            </span>
            <div className="h-7 w-28 rounded-full bg-slate-200" />
            <div className="h-7 w-32 rounded-full bg-slate-200" />
            <div className="h-7 w-28 rounded-full bg-slate-200" />
          </div>
        ) : availablePackages.length > 1 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-200/80">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              Available Packages:
            </span>
            {availablePackages.map((pkg) => {
              const isSelected = pkg.id.toLowerCase() === (selectedPackageId || "").toLowerCase();
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => {
                    setSelectedPackageId(pkg.id);
                    setSelectedPackageName(pkg.title);
                    setSelectedPackagePrice(String(pkg.basePrice));
                    setPackageByService((prev) => ({
                      ...prev,
                      [(direction || "departure").toUpperCase()]: pkg.id,
                    }));
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-lime-400 font-bold shadow-sm ring-1 ring-lime-400/40"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{pkg.title}</span>
                  <span className={isSelected ? "text-lime-300 font-semibold" : "text-slate-500"}>
                    • ₹{pkg.basePrice.toLocaleString("en-IN")}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {arrangementSubmitted ? (
        <div className="rounded-3xl border border-amber-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
                  Service Arrangement Requested
                </h2>
                <span className="text-xs text-slate-500 font-mono">
                  Reference: <strong>{serviceQuerySuccessRef}</strong>
                </span>
              </div>
            </div>
            <div className="rounded-full bg-amber-100 px-3.5 py-1 text-xs font-mono font-bold text-amber-900 self-start sm:self-auto">
              Pending Arrangement • ₹0 Payable Now
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
              <AlertCircle size={16} className="text-amber-700" />
              <span>“We will arrange your service at this airport and inform you shortly.”</span>
            </div>
            <p className="text-amber-800 leading-relaxed font-sans">
              Our 24/7 VIP Concierge team has received your travel request. A dedicated journey manager will contact you at <strong>{phone}</strong> and <strong>{email}</strong> shortly to coordinate your arrangements.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="font-mono text-xs uppercase font-bold text-slate-600">
              Requested Airport Services
            </h3>
            <div className="space-y-2">
              {selectedServices.map((st) => {
                const sApt =
                  st === "DEPARTURE"
                    ? cleanOrigin || originCode
                    : st === "ARRIVAL"
                      ? cleanDest || destCode
                      : cleanTransit || transitCode || airportCode;
                return (
                  <div key={st} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs">
                    <span className="font-bold text-slate-900">
                      {st === "DEPARTURE" ? "Departure" : st === "ARRIVAL" ? "Arrival" : "Transit"} Service ({sApt || "Airport"})
                    </span>
                    <span className="font-mono text-amber-700 font-bold">Pending Arrangement</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition"
            >
              <span>Return to Home</span>
            </Link>
            <a
              href={`https://wa.me/919599087959?text=${encodeURIComponent(
                `Hi Shafsky Team, I requested service arrangement ${serviceQuerySuccessRef} for ${cleanOrigin} to ${cleanDest}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-800 hover:bg-slate-50 transition"
            >
              <span>WhatsApp Concierge Desk</span>
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleProceedToPayment} className="space-y-6">
        {/* ========================================================================= */}
        {/* 1. FLIGHT DETAILS (TRANSIT: TWO-LEG SPLIT | NON-TRANSIT: SINGLE FLIGHT)  */}
        {/* ========================================================================= */}
        {direction === "transit" ? (
          <div className="space-y-6">
            {/* 1A. JOURNEY ROUTE OVERVIEW CARD */}
            <div className="rounded-3xl border border-lime-300 bg-gradient-to-br from-lime-50/60 via-white to-slate-50 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lime-200/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-lime-400">
                    <Plane size={16} />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-slate-900">Transit Journey Overview</h2>
                    <p className="text-[11px] text-slate-500 font-mono">
                      VIP transit concierge at {airportCityName} ({airportCode}).
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-lime-500/20 text-lime-900 border border-lime-400/40 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider">
                  {getTransitCategory(originCode, destCode)}
                </span>
              </div>

              {/* Visual Route Flow */}
              <div className="rounded-2xl border border-lime-200 bg-white/80 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                  {/* Origin */}
                  <div className="text-left min-w-[70px] sm:min-w-[100px]">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                      1. Inbound Origin
                    </span>
                    <span className="font-mono text-base sm:text-xl font-black text-slate-950 block">
                      {originCode || "TBD"}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium block truncate max-w-[120px]">
                      {getAirportRegistryEntry(originCode)?.city || "Origin Airport"}
                    </span>
                  </div>

                  {/* Flight 1 Arrow */}
                  <div className="flex-1 flex flex-col items-center justify-center px-1">
                    <span className="text-[9px] font-mono font-bold text-slate-500 mb-1">
                      {isFlightVerified && verifiedFlight ? verifiedFlight.flightNum : flightNumber || "Leg 1"}
                    </span>
                    <div className="relative w-full flex items-center justify-center">
                      <div className="w-full border-t-2 border-dashed border-lime-400" />
                      <div className="absolute flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-lime-400 text-[10px]">
                        ✈
                      </div>
                    </div>
                  </div>

                  {/* Transit Hub (Highlight) */}
                  <div className="text-center px-3 py-1.5 rounded-xl bg-lime-100/80 border border-lime-300 min-w-[90px] sm:min-w-[130px]">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-lime-800 font-bold block">
                      Transit Hub
                    </span>
                    <span className="font-mono text-base sm:text-xl font-black text-slate-950 block">
                      {airportCode}
                    </span>
                    <span className="text-[11px] text-slate-800 font-semibold block truncate max-w-[130px]">
                      {airportCityName}
                    </span>
                  </div>

                  {/* Flight 2 Arrow */}
                  <div className="flex-1 flex flex-col items-center justify-center px-1">
                    <span className="text-[9px] font-mono font-bold text-slate-500 mb-1">
                      {isFlightVerified2 && verifiedFlight2 ? verifiedFlight2.flightNum : flightNumber2 || "Leg 2"}
                    </span>
                    <div className="relative w-full flex items-center justify-center">
                      <div className="w-full border-t-2 border-dashed border-lime-400" />
                      <div className="absolute flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-lime-400 text-[10px]">
                        ✈
                      </div>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="text-right min-w-[70px] sm:min-w-[100px]">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                      2. Connecting To
                    </span>
                    <span className="font-mono text-base sm:text-xl font-black text-slate-950 block">
                      {destCode || "TBD"}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium block truncate max-w-[120px] ml-auto">
                      {getAirportRegistryEntry(destCode)?.city || "Destination"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Route Endpoints Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Flying From (Inbound Origin) <span className="text-red-500">*</span>
                  </label>
                  <AirportSuggestionPicker
                    value={originCode}
                    onChange={(code) => setOriginCode(code)}
                    travelType={travelType}
                    onTravelTypeChange={(newType) => handleTravelTypeChange(newType)}
                    direction="transit"
                    serviceAirportCode={airportCode}
                    placeholder="Select inbound departure airport"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Flying To (Connecting Destination) <span className="text-red-500">*</span>
                  </label>
                  <AirportSuggestionPicker
                    value={destCode}
                    onChange={(code) => setDestCode(code)}
                    travelType={travelType}
                    onTravelTypeChange={(newType) => handleTravelTypeChange(newType)}
                    direction="transit"
                    serviceAirportCode={airportCode}
                    placeholder="Select connecting destination airport"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 1B. INCOMING FLIGHT (LEG 1: INBOUND ORIGIN -> TRANSIT HUB) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-lime-400 font-mono text-xs font-bold">
                    1
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900">
                        Incoming Flight (Leg 1)
                      </h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                        {originCode || "Origin"} ➔ {airportCode}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Flight arriving at {airportCityName} ({airportCode}).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsManualMode(!isManualMode);
                    if (!isManualMode) {
                      setManualFlightNum(flightNumber);
                    }
                  }}
                  className="text-xs font-mono font-bold text-slate-600 hover:text-slate-950 underline cursor-pointer"
                >
                  {isManualMode ? "Use automatic fetch" : "Enter manually"}
                </button>
              </div>

              {/* AUTOMATIC FETCH */}
              {!isManualMode && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-7">
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Incoming Flight Number <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2.5">
                        <input
                          type="text"
                          value={flightNumber}
                          onChange={(e) => {
                            setFlightNumber(e.target.value.toUpperCase());
                            setIsFlightVerified(false);
                            setVerifiedFlight(null);
                            setFlightFetchError(null);
                            setIsCutoffUrgent(false);
                          }}
                          placeholder="e.g. AI101, 6E202"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleVerifyFlight();
                            }
                          }}
                          className="h-12 flex-1 rounded-2xl border border-slate-300 bg-transparent px-4 font-mono text-sm font-bold text-slate-900 uppercase tracking-wider focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyFlight}
                          disabled={isFlightFetching || !flightNumber.trim()}
                          className="h-12 px-5 rounded-2xl bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer flex items-center gap-2 shrink-0"
                        >
                          {isFlightFetching ? (
                            <>
                              <Loader2 size={14} className="animate-spin text-lime-400" />
                              <span>Fetching...</span>
                            </>
                          ) : (
                            <span>Fetch Flight</span>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-5">
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Incoming Flight Date <span className="text-red-500">*</span>
                      </label>
                      <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="relative flex h-12 w-full items-center justify-between rounded-2xl border border-slate-300 bg-transparent px-4 text-left text-xs font-semibold text-slate-900 outline-none hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 cursor-pointer shadow-none"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <CalendarDays className="h-4 w-4 text-lime-600 shrink-0" />
                              <span className="font-mono text-xs font-bold text-slate-900">
                                {format(dateValue, "dd MMMM yyyy")}
                              </span>
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-xl rounded-3xl z-50"
                          align="start"
                        >
                          <CalendarPicker
                            mode="single"
                            selected={dateValue}
                            onSelect={handleDateChange}
                            disabled={{ before: todayStart }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {isCutoffUrgent && (
                    <div className="rounded-2xl border border-rose-300 bg-rose-50/80 p-4 text-xs text-rose-950 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
                        <PhoneCall size={16} className="text-rose-600" />
                        <span>Urgent Airport Notice</span>
                      </div>
                      <p className="text-xs text-rose-900 leading-relaxed font-sans">
                        Flight is scheduled within standard notice. Our 24/7 team can assist on WhatsApp.
                      </p>
                    </div>
                  )}

                  {flightFetchError && !isCutoffUrgent && (
                    <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
                      <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold">{flightFetchError}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsManualMode(true);
                            setManualFlightNum(flightNumber);
                          }}
                          className="mt-1 font-mono font-bold text-amber-950 underline block cursor-pointer"
                        >
                          → Enter incoming flight details manually
                        </button>
                      </div>
                    </div>
                  )}

                  {isFlightFetching && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 animate-pulse">
                      <div className="h-8 w-48 bg-slate-200 rounded" />
                    </div>
                  )}

                  {isFlightVerified && verifiedFlight && (
                    <div className="rounded-2xl border border-lime-400 bg-lime-50/40 p-4 sm:p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200 p-1">
                            <AirlineLogo iata={verifiedFlight.carrier.iata} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-950 text-sm block">
                              {verifiedFlight.carrier.name} ({verifiedFlight.carrier.iata})
                            </span>
                            <span className="font-mono text-xs font-black text-slate-900">
                              {verifiedFlight.flightNum}
                            </span>
                          </div>
                        </div>
                        <span className="rounded-full bg-lime-500 px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase text-slate-950 flex items-center gap-1">
                          <Check size={12} /> Verified
                        </span>
                      </div>
                      <div className="rounded-xl bg-white/90 border border-lime-200/80 p-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono text-[9px] uppercase text-slate-400 font-bold block">Departs</span>
                          <span className="font-mono font-bold text-slate-900">{verifiedFlight.origin.code || originCode}</span>
                          {verifiedFlight.departure.scheduledTime && (
                            <span className="block font-mono text-[11px] text-slate-600">
                              {verifiedFlight.departure.scheduledTime.slice(11, 16)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col items-center px-2">
                          <span className="text-[9px] font-mono text-slate-400">Arrives at Transit Hub</span>
                          <div className="w-full border-t border-dashed border-lime-400 my-1" />
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-[9px] uppercase text-slate-400 font-bold block">Arrives</span>
                          <span className="font-mono font-bold text-slate-900">{airportCode}</span>
                          {verifiedFlight.arrival.scheduledTime && (
                            <span className="block font-mono text-[11px] text-slate-600">
                              {verifiedFlight.arrival.scheduledTime.slice(11, 16)}
                            </span>
                          )}
                          {verifiedFlight.arrival.terminal && (
                            <span className="inline-block mt-0.5 text-[9px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                              T{verifiedFlight.arrival.terminal.replace(/^[Tt]/, "")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MANUAL ENTRY */}
              {isManualMode && (
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Clock size={13} className="text-lime-600" />
                      Manual Incoming Flight Entry
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsManualMode(false)}
                      className="font-mono text-xs font-bold text-slate-700 hover:text-slate-950 underline cursor-pointer"
                    >
                      ← Back to automatic fetch
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Airline <span className="text-red-500">*</span>
                      </label>
                      <IntelligentAirlineAutocomplete
                        value={manualAirline}
                        onChangeText={(txt) => setManualAirline(txt)}
                        onSelect={(airline) => {
                          setManualAirline(airline.name);
                          setManualAirlineIata(airline.iata);
                          if (!manualFlightNum.startsWith(airline.iata)) {
                            setManualFlightNum(`${airline.iata}${manualFlightNum.replace(/^[A-Z0-9]{2,3}/, "")}`);
                          }
                        }}
                        placeholder="Search airline"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Flight Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={manualFlightNum}
                        onChange={(e) => setManualFlightNum(e.target.value.toUpperCase())}
                        placeholder="e.g. AI101"
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 font-mono text-xs font-bold text-slate-900 uppercase tracking-wider focus:border-lime-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Flight Date <span className="text-red-500">*</span>
                      </label>
                      <Popover open={manualDatePopoverOpen} onOpenChange={setManualDatePopoverOpen}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="relative flex h-11 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 text-left text-xs font-semibold text-slate-900 outline-none hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 cursor-pointer shadow-none"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <CalendarDays className="h-4 w-4 text-lime-600 shrink-0" />
                              <span className="font-mono text-xs font-bold text-slate-900">
                                {format(dateValue, "dd MMM yyyy")}
                              </span>
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-xl rounded-2xl z-50"
                          align="start"
                        >
                          <CalendarPicker
                            mode="single"
                            selected={dateValue}
                            onSelect={handleDateChange}
                            disabled={{ before: todayStart }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                        Inbound Departure (at {originCode || "Origin"})
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">Time</span>
                          <FlightTimePicker
                            value={manualDepTime}
                            onChange={(val) => setManualDepTime(val)}
                            placeholder="Select time"
                            inputClassName="w-full rounded-lg border border-slate-200 pl-8 pr-7 py-1.5 font-mono text-xs font-bold text-slate-900 bg-white"
                          />
                        </div>
                        <div>
                          <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">Terminal</span>
                          <input
                            type="text"
                            value={manualDepTerminal}
                            onChange={(e) => setManualDepTerminal(e.target.value)}
                            placeholder="Terminal"
                            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-xs font-bold text-slate-900 uppercase"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                        Inbound Arrival (at {airportCode})
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">Time</span>
                          <FlightTimePicker
                            value={manualArrTime}
                            onChange={(val) => setManualArrTime(val)}
                            placeholder="Select time"
                            inputClassName="w-full rounded-lg border border-slate-200 pl-8 pr-7 py-1.5 font-mono text-xs font-bold text-slate-900 bg-white"
                          />
                        </div>
                        <div>
                          <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">Terminal</span>
                          <input
                            type="text"
                            value={manualArrTerminal}
                            onChange={(e) => setManualArrTerminal(e.target.value)}
                            placeholder="Terminal"
                            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-xs font-bold text-slate-900 uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 1C. CONNECTING FLIGHT (LEG 2: TRANSIT HUB -> CONNECTING DESTINATION) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-500 text-slate-950 font-mono text-xs font-bold">
                    2
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900">
                        Connecting Flight (Leg 2)
                      </h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                        {airportCode} ➔ {destCode || "Destination"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Outbound flight departing from {airportCityName} ({airportCode}).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsManualMode2(!isManualMode2);
                    if (!isManualMode2) {
                      setManualFlightNum2(flightNumber2);
                    }
                  }}
                  className="text-xs font-mono font-bold text-slate-600 hover:text-slate-950 underline cursor-pointer"
                >
                  {isManualMode2 ? "Use automatic fetch" : "Enter manually"}
                </button>
              </div>

              {/* AUTOMATIC FETCH */}
              {!isManualMode2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-7">
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Connecting Flight Number <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2.5">
                        <input
                          type="text"
                          value={flightNumber2}
                          onChange={(e) => {
                            setFlightNumber2(e.target.value.toUpperCase());
                            setIsFlightVerified2(false);
                            setVerifiedFlight2(null);
                            setFlightFetchError2(null);
                            setIsCutoffUrgent2(false);
                          }}
                          placeholder="e.g. EK504, 6E224"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleVerifyFlight2();
                            }
                          }}
                          className="h-12 flex-1 rounded-2xl border border-slate-300 bg-transparent px-4 font-mono text-sm font-bold text-slate-900 uppercase tracking-wider focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyFlight2}
                          disabled={isFlightFetching2 || !flightNumber2.trim()}
                          className="h-12 px-5 rounded-2xl bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer flex items-center gap-2 shrink-0"
                        >
                          {isFlightFetching2 ? (
                            <>
                              <Loader2 size={14} className="animate-spin text-lime-400" />
                              <span>Fetching...</span>
                            </>
                          ) : (
                            <span>Fetch Flight</span>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-5">
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Connecting Flight Date <span className="text-red-500">*</span>
                      </label>
                      <Popover open={datePopoverOpen2} onOpenChange={setDatePopoverOpen2}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="relative flex h-12 w-full items-center justify-between rounded-2xl border border-slate-300 bg-transparent px-4 text-left text-xs font-semibold text-slate-900 outline-none hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 cursor-pointer shadow-none"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <CalendarDays className="h-4 w-4 text-lime-600 shrink-0" />
                              <span className="font-mono text-xs font-bold text-slate-900">
                                {format(dateValue2, "dd MMMM yyyy")}
                              </span>
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-xl rounded-3xl z-50"
                          align="start"
                        >
                          <CalendarPicker
                            mode="single"
                            selected={dateValue2}
                            onSelect={handleDateChange2}
                            disabled={{ before: todayStart }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {isCutoffUrgent2 && (
                    <div className="rounded-2xl border border-rose-300 bg-rose-50/80 p-4 text-xs text-rose-950 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
                        <PhoneCall size={16} className="text-rose-600" />
                        <span>Urgent Airport Notice</span>
                      </div>
                      <p className="text-xs text-rose-900 leading-relaxed font-sans">
                        Flight is scheduled within standard notice. Our 24/7 team can assist on WhatsApp.
                      </p>
                    </div>
                  )}

                  {flightFetchError2 && !isCutoffUrgent2 && (
                    <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
                      <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold">{flightFetchError2}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsManualMode2(true);
                            setManualFlightNum2(flightNumber2);
                          }}
                          className="mt-1 font-mono font-bold text-amber-950 underline block cursor-pointer"
                        >
                          → Enter connecting flight details manually
                        </button>
                      </div>
                    </div>
                  )}

                  {isFlightFetching2 && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 animate-pulse">
                      <div className="h-8 w-48 bg-slate-200 rounded" />
                    </div>
                  )}

                  {isFlightVerified2 && verifiedFlight2 && (
                    <div className="rounded-2xl border border-lime-400 bg-lime-50/40 p-4 sm:p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200 p-1">
                            <AirlineLogo iata={verifiedFlight2.carrier.iata} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-950 text-sm block">
                              {verifiedFlight2.carrier.name} ({verifiedFlight2.carrier.iata})
                            </span>
                            <span className="font-mono text-xs font-black text-slate-900">
                              {verifiedFlight2.flightNum}
                            </span>
                          </div>
                        </div>
                        <span className="rounded-full bg-lime-500 px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase text-slate-950 flex items-center gap-1">
                          <Check size={12} /> Verified
                        </span>
                      </div>
                      <div className="rounded-xl bg-white/90 border border-lime-200/80 p-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono text-[9px] uppercase text-slate-400 font-bold block">Departs Transit Hub</span>
                          <span className="font-mono font-bold text-slate-900">{airportCode}</span>
                          {verifiedFlight2.departure.scheduledTime && (
                            <span className="block font-mono text-[11px] text-slate-600">
                              {verifiedFlight2.departure.scheduledTime.slice(11, 16)}
                            </span>
                          )}
                          {verifiedFlight2.departure.terminal && (
                            <span className="inline-block mt-0.5 text-[9px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                              T{verifiedFlight2.departure.terminal.replace(/^[Tt]/, "")}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col items-center px-2">
                          <span className="text-[9px] font-mono text-slate-400">Connecting Flight</span>
                          <div className="w-full border-t border-dashed border-lime-400 my-1" />
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-[9px] uppercase text-slate-400 font-bold block">Final Destination</span>
                          <span className="font-mono font-bold text-slate-900">{verifiedFlight2.destination.code || destCode}</span>
                          {verifiedFlight2.arrival.scheduledTime && (
                            <span className="block font-mono text-[11px] text-slate-600">
                              {verifiedFlight2.arrival.scheduledTime.slice(11, 16)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MANUAL ENTRY */}
              {isManualMode2 && (
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Clock size={13} className="text-lime-600" />
                      Manual Connecting Flight Entry
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsManualMode2(false)}
                      className="font-mono text-xs font-bold text-slate-700 hover:text-slate-950 underline cursor-pointer"
                    >
                      ← Back to automatic fetch
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Airline <span className="text-red-500">*</span>
                      </label>
                      <IntelligentAirlineAutocomplete
                        value={manualAirline2}
                        onChangeText={(txt) => setManualAirline2(txt)}
                        onSelect={(airline) => {
                          setManualAirline2(airline.name);
                          setManualAirlineIata2(airline.iata);
                          if (!manualFlightNum2.startsWith(airline.iata)) {
                            setManualFlightNum2(`${airline.iata}${manualFlightNum2.replace(/^[A-Z0-9]{2,3}/, "")}`);
                          }
                        }}
                        placeholder="Search airline"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Flight Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={manualFlightNum2}
                        onChange={(e) => setManualFlightNum2(e.target.value.toUpperCase())}
                        placeholder="e.g. EK504"
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 font-mono text-xs font-bold text-slate-900 uppercase tracking-wider focus:border-lime-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Connecting Flight Date <span className="text-red-500">*</span>
                      </label>
                      <Popover open={manualDatePopoverOpen2} onOpenChange={setManualDatePopoverOpen2}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="relative flex h-11 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 text-left text-xs font-semibold text-slate-900 outline-none hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 cursor-pointer shadow-none"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <CalendarDays className="h-4 w-4 text-lime-600 shrink-0" />
                              <span className="font-mono text-xs font-bold text-slate-900">
                                {format(dateValue2, "dd MMM yyyy")}
                              </span>
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-xl rounded-2xl z-50"
                          align="start"
                        >
                          <CalendarPicker
                            mode="single"
                            selected={dateValue2}
                            onSelect={handleDateChange2}
                            disabled={{ before: todayStart }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                        Outbound Departure (at {airportCode})
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">Time</span>
                          <FlightTimePicker
                            value={manualDepTime2}
                            onChange={(val) => setManualDepTime2(val)}
                            placeholder="Select time"
                            inputClassName="w-full rounded-lg border border-slate-200 pl-8 pr-7 py-1.5 font-mono text-xs font-bold text-slate-900 bg-white"
                          />
                        </div>
                        <div>
                          <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">Terminal</span>
                          <input
                            type="text"
                            value={manualDepTerminal2}
                            onChange={(e) => setManualDepTerminal2(e.target.value)}
                            placeholder="Terminal"
                            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-xs font-bold text-slate-900 uppercase"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                        Outbound Arrival (at {destCode || "Destination"})
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">Time</span>
                          <FlightTimePicker
                            value={manualArrTime2}
                            onChange={(val) => setManualArrTime2(val)}
                            placeholder="Select time"
                            inputClassName="w-full rounded-lg border border-slate-200 pl-8 pr-7 py-1.5 font-mono text-xs font-bold text-slate-900 bg-white"
                          />
                        </div>
                        <div>
                          <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">Terminal</span>
                          <input
                            type="text"
                            value={manualArrTerminal2}
                            onChange={(e) => setManualArrTerminal2(e.target.value)}
                            placeholder="Terminal"
                            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-xs font-bold text-slate-900 uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-lime-400">
                <Plane size={16} />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-slate-900">Flight Details</h2>
                <p className="text-[11px] text-slate-500 font-mono">
                  Enter flight number to fetch verified schedule or provide details manually.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsManualMode(!isManualMode);
                if (!isManualMode) {
                  setManualFlightNum(flightNumber);
                }
              }}
              className="text-xs font-mono font-bold text-slate-600 hover:text-slate-950 underline cursor-pointer"
            >
              {isManualMode ? "Use automatic fetch" : "Enter manually"}
            </button>
          </div>

          {/* PATH A: AUTOMATIC FLIGHT FETCH */}
          {!isManualMode && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Flight Number */}
                <div className="md:col-span-7">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Flight Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={flightNumber}
                        onChange={(e) => {
                          setFlightNumber(e.target.value.toUpperCase());
                          setIsFlightVerified(false);
                          setVerifiedFlight(null);
                          setFlightFetchError(null);
                          setIsCutoffUrgent(false);
                        }}
                        placeholder="Flight number"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleVerifyFlight();
                          }
                        }}
                        className="h-12 w-full rounded-2xl border border-slate-300 bg-transparent px-4 font-mono text-sm font-bold text-slate-900 uppercase tracking-wider placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyFlight}
                      disabled={isFlightFetching || !flightNumber.trim()}
                      className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer flex items-center gap-2 shrink-0"
                    >
                      {isFlightFetching ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-lime-400" />
                          <span>Fetching...</span>
                        </>
                      ) : (
                        <span>Fetch Flight</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Service / Travel Date Selection */}
                <div className="md:col-span-5">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Flight / Service Date <span className="text-red-500">*</span>
                  </label>
                  <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="relative flex h-12 w-full items-center justify-between rounded-2xl border border-slate-300 bg-transparent px-4 text-left text-xs font-semibold text-slate-900 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 cursor-pointer shadow-none"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <CalendarDays className="h-4 w-4 text-lime-600 shrink-0" />
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {format(dateValue, "dd MMMM yyyy")}
                          </span>
                        </div>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.12),0_0_30px_rgba(132,204,22,0.15)] rounded-3xl z-50"
                      align="start"
                    >
                      <CalendarPicker
                        mode="single"
                        selected={dateValue}
                        onSelect={handleDateChange}
                        disabled={{ before: todayStart }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Route Endpoints: Origin & Destination (Shown when not auto-verified) */}
              {!isFlightVerified && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                        {direction === "arrival"
                          ? "Flying From (Departure Airport)"
                          : "Departure Airport"}
                        {direction === "arrival" && <span className="text-red-500"> *</span>}
                      </label>
                      {direction === "departure" ? (
                        <div className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 flex items-center text-xs font-mono font-bold text-slate-800">
                          {airportCode} ({airportCityName})
                        </div>
                      ) : (
                        <AirportSuggestionPicker
                          value={originCode}
                          onChange={(code) => setOriginCode(code)}
                          travelType={travelType}
                          onTravelTypeChange={(newType) => handleTravelTypeChange(newType)}
                          direction={direction}
                          serviceAirportCode={airportCode}
                          placeholder="Select departure airport"
                          required={direction === "arrival"}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                        {direction === "departure"
                          ? "Flying To (Destination Airport)"
                          : "Arrival Service Airport"}
                        {direction === "departure" && <span className="text-red-500"> *</span>}
                      </label>
                      {direction === "arrival" ? (
                        <div className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 flex items-center text-xs font-mono font-bold text-slate-800">
                          {airportCode} ({airportCityName})
                        </div>
                      ) : (
                        <AirportSuggestionPicker
                          value={destCode}
                          onChange={(code) => setDestCode(code)}
                          travelType={travelType}
                          onTravelTypeChange={(newType) => handleTravelTypeChange(newType)}
                          direction={direction}
                          serviceAirportCode={airportCode}
                          placeholder="Select destination airport"
                          required={direction === "departure"}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* URGENT CUTOFF VIP FAST-TRACK BANNER */}
              {isCutoffUrgent && (
                <div className="rounded-2xl border border-rose-300 bg-rose-50/80 p-4 sm:p-5 text-xs text-rose-950 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
                    <PhoneCall size={18} className="text-rose-600" />
                    <span>Urgent VIP Airport Clearance Available</span>
                  </div>
                  <p className="text-xs text-rose-900 font-sans leading-relaxed">
                    This flight is scheduled within our standard advance notice window (less than 12h for domestic or 24h for international). Our 24/7 team can assist with short-notice bookings.
                  </p>
                  <a
                    href={`https://wa.me/919599087959?text=${encodeURIComponent(
                      `🚨 URGENT VIP REQUEST: I need urgent airport clearance for flight ${flightNumber || "TBD"} at ${airportCode} (${direction}) on ${serviceDate}. Passenger: ${fullName || "Guest"}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-sm transition"
                  >
                    <MessageSquare size={14} />
                    <span>Connect with Support on WhatsApp</span>
                  </a>
                </div>
              )}

              {/* Automatic Fetch / Airport Mismatch Warning (Never blocks - offers manual entry immediately) */}
              {flightFetchError && !isCutoffUrgent && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
                  <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">{flightFetchError}</p>
                    <p className="text-[11px] text-amber-800">
                      Automatic flight verification failure never blocks your booking. Click below to enter your flight times manually.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualMode(true);
                        setManualFlightNum(flightNumber);
                      }}
                      className="mt-1 font-mono font-bold text-amber-950 underline block cursor-pointer"
                    >
                      → Continue with manual flight entry
                    </button>
                  </div>
                </div>
              )}

              {/* Fetching Flight Skeleton Placeholder */}
              {isFlightFetching && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-3 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-slate-200" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-28 bg-slate-200 rounded" />
                        <div className="h-3 w-16 bg-slate-200 rounded" />
                      </div>
                    </div>
                    <div className="h-6 w-20 bg-slate-200 rounded-full" />
                  </div>
                  <div className="rounded-xl bg-white/60 p-3 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="h-2.5 w-12 bg-slate-200 rounded" />
                      <div className="h-5 w-16 bg-slate-200 rounded" />
                    </div>
                    <div className="h-1 flex-1 bg-slate-200 rounded" />
                    <div className="space-y-1 text-right">
                      <div className="h-2.5 w-12 bg-slate-200 rounded ml-auto" />
                      <div className="h-5 w-16 bg-slate-200 rounded ml-auto" />
                    </div>
                  </div>
                </div>
              )}

              {/* Verified Flight Card with Visual Flight Trajectory Strip */}
              {isFlightVerified && verifiedFlight && (
                <div className="rounded-2xl border border-lime-400 bg-lime-50/40 p-4 sm:p-5 space-y-4 shadow-xs">
                  {/* Carrier & Verification Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 p-1 shadow-2xs">
                        <AirlineLogo iata={verifiedFlight.carrier.iata} />
                      </div>
                      <div>
                        <span className="font-bold text-slate-950 font-sans block text-sm leading-tight">
                          {verifiedFlight.carrier.name} ({verifiedFlight.carrier.iata})
                        </span>
                        <span className="font-mono text-xs font-extrabold text-slate-900">
                          {verifiedFlight.flightNum}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 font-mono text-[9.5px] font-bold flex items-center gap-1">
                        <CalendarDays size={10} className="text-lime-600" />
                        {format(dateValue, "dd MMM yyyy")}
                      </span>
                      <span className="rounded-full bg-slate-900 text-lime-400 px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider">
                        {travelType === "international" ? "International" : "Domestic"}
                      </span>
                      <span className="rounded-full bg-lime-500 px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider text-slate-950 flex items-center gap-1">
                        <Check size={12} />
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* VISUAL FLIGHT TRAJECTORY STRIP (Origin ─── ✈️ ───▶ Destination) */}
                  <div className="relative rounded-xl bg-white/90 border border-lime-200/80 p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                      {/* Origin Airport */}
                      <div className="text-left min-w-[75px] sm:min-w-[110px]">
                        <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                          DEPARTURE
                        </span>
                        <span className="font-mono text-base sm:text-lg font-black text-slate-950 block">
                          {verifiedFlight.origin.code || originCode}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-700 truncate block">
                          {verifiedFlight.origin.city || "Origin"}
                        </span>
                        {verifiedFlight.departure.scheduledTime && (
                          <span className="text-[11px] text-slate-600 block font-mono font-bold mt-0.5">
                            {verifiedFlight.departure.scheduledTime.slice(11, 16) || verifiedFlight.departure.scheduledTime}
                          </span>
                        )}
                        {verifiedFlight.departure.terminal && (
                          <span className="inline-block mt-1 text-[9.5px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            T{verifiedFlight.departure.terminal.replace(/^[Tt]/, "")}
                          </span>
                        )}
                      </div>

                      {/* Flight Path Graphic with Center Plane Icon */}
                      <div className="flex-1 flex flex-col items-center justify-center px-1 sm:px-2">
                        <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">
                          Live Tracked
                        </span>
                        <div className="relative w-full flex items-center justify-center">
                          <div className="w-full border-t-2 border-dashed border-lime-400" />
                          <div className="absolute flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-lime-400 shadow-sm">
                            <Plane size={12} className="rotate-45" />
                          </div>
                        </div>
                        <span className="text-[9.5px] font-mono text-slate-400 mt-1">
                          Direct Schedule
                        </span>
                      </div>

                      {/* Destination Airport */}
                      <div className="text-right min-w-[75px] sm:min-w-[110px]">
                        <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                          ARRIVAL
                        </span>
                        <span className="font-mono text-base sm:text-lg font-black text-slate-950 block">
                          {verifiedFlight.destination.code || destCode}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-700 truncate block">
                          {verifiedFlight.destination.city || "Destination"}
                        </span>
                        {verifiedFlight.arrival.scheduledTime && (
                          <span className="text-[11px] text-slate-600 block font-mono font-bold mt-0.5">
                            {verifiedFlight.arrival.scheduledTime.slice(11, 16) || verifiedFlight.arrival.scheduledTime}
                          </span>
                        )}
                        {verifiedFlight.arrival.terminal && (
                          <span className="inline-block mt-1 text-[9.5px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            T{verifiedFlight.arrival.terminal.replace(/^[Tt]/, "")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PATH B: MANUAL FLIGHT ENTRY FORM */}
          {isManualMode && (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Clock size={13} className="text-lime-600" />
                  Manual Flight & Schedule Entry
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-bold">
                  Worldwide Airlines Supported
                </span>
              </div>

              {/* Automatic Fetch / Airport Mismatch Warning (Never hidden - stays visible in manual mode) */}
              {flightFetchError && !isCutoffUrgent && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
                  <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">{flightFetchError}</p>
                    <p className="text-[11px] text-amber-800">
                      Automatic flight verification was bypassed or mismatched. You can complete your flight times and terminal details manually below.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsManualMode(false)}
                      className="mt-1 font-mono font-bold text-amber-950 underline block cursor-pointer"
                    >
                      ← Return to automatic flight fetch
                    </button>
                  </div>
                </div>
              )}

              {/* Row: Airline, Flight Number & Service Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Airline <span className="text-red-500">*</span>
                  </label>
                  <IntelligentAirlineAutocomplete
                    value={manualAirline}
                    onChangeText={(txt) => setManualAirline(txt)}
                    onSelect={(airline) => {
                      setManualAirline(airline.name);
                      setManualAirlineIata(airline.iata);
                      if (!manualFlightNum.startsWith(airline.iata)) {
                        setManualFlightNum(`${airline.iata}${manualFlightNum.replace(/^[A-Z0-9]{2,3}/, "")}`);
                      }
                    }}
                    placeholder="Search any airline worldwide"
                  />
                  {manualAirlineIata && (
                    <div className="mt-1.5 flex items-center gap-2 text-[10.5px] font-mono text-slate-600">
                      <div className="h-4 w-4 shrink-0 flex items-center justify-center">
                        <AirlineLogo iata={manualAirlineIata} />
                      </div>
                      <span>
                        Code: <strong>{manualAirlineIata}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Flight Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualFlightNum}
                    onChange={(e) => setManualFlightNum(e.target.value.toUpperCase())}
                    placeholder="Flight number"
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 font-mono text-xs font-bold text-slate-900 uppercase tracking-wider focus:border-lime-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Flight / Service Date <span className="text-red-500">*</span>
                  </label>
                  <Popover open={manualDatePopoverOpen} onOpenChange={setManualDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="relative flex h-11 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 text-left text-xs font-semibold text-slate-900 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 cursor-pointer shadow-none"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <CalendarDays className="h-4 w-4 text-lime-600 shrink-0" />
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {format(dateValue, "dd MMM yyyy")}
                          </span>
                        </div>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-xl rounded-2xl z-50"
                      align="start"
                    >
                      <CalendarPicker
                        mode="single"
                        selected={dateValue}
                        onSelect={handleDateChange}
                        disabled={{ before: todayStart }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Row: Flight Route (Origin & Destination) */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                      {direction === "arrival"
                        ? "Flying From (Departure Airport)"
                        : "Departure Airport"}
                      {direction === "arrival" && <span className="text-red-500"> *</span>}
                    </label>
                    {direction === "departure" ? (
                      <div className="h-11 rounded-xl border border-slate-200 bg-slate-100/70 px-3.5 flex items-center text-xs font-mono font-bold text-slate-800">
                        {airportCode} ({airportCityName})
                      </div>
                    ) : (
                      <AirportSuggestionPicker
                        value={originCode}
                        onChange={(code) => setOriginCode(code)}
                        travelType={travelType}
                        onTravelTypeChange={(newType) => handleTravelTypeChange(newType)}
                        direction={direction}
                        serviceAirportCode={airportCode}
                        placeholder="Select departure airport"
                        required={direction === "arrival"}
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                      {direction === "departure"
                        ? "Flying To (Destination Airport)"
                        : "Arrival Service Airport"}
                      {direction === "departure" && <span className="text-red-500"> *</span>}
                    </label>
                    {direction === "arrival" ? (
                      <div className="h-11 rounded-xl border border-slate-200 bg-slate-100/70 px-3.5 flex items-center text-xs font-mono font-bold text-slate-800">
                        {airportCode} ({airportCityName})
                      </div>
                    ) : (
                      <AirportSuggestionPicker
                        value={destCode}
                        onChange={(code) => setDestCode(code)}
                        travelType={travelType}
                        onTravelTypeChange={(newType) => handleTravelTypeChange(newType)}
                        direction={direction}
                        serviceAirportCode={airportCode}
                        placeholder="Select destination airport"
                        required={direction === "departure"}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Row: Departure Time & Arrival Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                    Departure Schedule
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">Time</span>
                      <FlightTimePicker
                        value={manualDepTime}
                        onChange={(val) => setManualDepTime(val)}
                        placeholder="Select time"
                        inputClassName="w-full rounded-lg border border-slate-200 pl-8 pr-7 py-1.5 font-mono text-xs font-bold text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">Terminal</span>
                      <input
                        type="text"
                        value={manualDepTerminal}
                        onChange={(e) => setManualDepTerminal(e.target.value)}
                        placeholder="Terminal number"
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-xs font-bold text-slate-900 uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                    Arrival Schedule
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">Time</span>
                      <FlightTimePicker
                        value={manualArrTime}
                        onChange={(val) => setManualArrTime(val)}
                        placeholder="Select time"
                        inputClassName="w-full rounded-lg border border-slate-200 pl-8 pr-7 py-1.5 font-mono text-xs font-bold text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[9.5px] font-mono text-slate-500 block mb-0.5">Terminal</span>
                      <input
                        type="text"
                        value={manualArrTerminal}
                        onChange={(e) => setManualArrTerminal(e.target.value)}
                        placeholder="Terminal number"
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-xs font-bold text-slate-900 uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

        {/* ========================================================================= */}
        {/* 2. BASIC PASSENGER DETAILS                                                */}
        {/* ========================================================================= */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900">Passenger Information</h2>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                Enter name as per government ID.
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => handlePaxChange(paxAdults - 1)}
                disabled={paxAdults <= 1}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Decrease passenger count"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="font-mono text-[11px] font-bold text-slate-800 min-w-[76px] text-center select-none px-1">
                {paxAdults} {paxAdults === 1 ? "Passenger" : "Passengers"}
              </span>
              <button
                type="button"
                onClick={() => handlePaxChange(paxAdults + 1)}
                disabled={paxAdults >= 10}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Increase passenger count"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {passengers.map((p, idx) => (
              <div
                key={idx}
                className={idx > 0 ? "pt-5 border-t border-slate-100 space-y-3" : "space-y-3"}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lime-100 text-[10px] font-bold text-lime-800">
                      {idx + 1}
                    </span>
                    Passenger {idx + 1}
                  </span>

                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => copyFromPassenger1(idx)}
                      className="text-[11px] font-mono text-lime-700 hover:text-lime-800 hover:underline flex items-center gap-1 cursor-pointer font-semibold bg-lime-50 hover:bg-lime-100/70 px-2.5 py-1 rounded-lg border border-lime-200/60 transition"
                      title="Copy phone and email from Passenger 1"
                    >
                      <Copy className="h-3 w-3" />
                      Same contact as Passenger 1
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 sm:gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-8 md:col-span-9">
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={p.fullName}
                      onChange={(e) => updatePassenger(idx, "fullName", e.target.value)}
                      placeholder="Name as per government ID"
                      className="h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none transition"
                    />
                  </div>

                  {/* Age */}
                  <div className="sm:col-span-4 md:col-span-3">
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
                      Age
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={p.age}
                      onChange={(e) => updatePassenger(idx, "age", e.target.value)}
                      placeholder="Age (Years)"
                      className="h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3.5 font-mono text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none transition"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
                      Phone {idx === 0 ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(optional)</span>}
                    </label>
                    <PhoneInput
                      required={idx === 0}
                      value={p.phone}
                      onChange={(v) => updatePassenger(idx, "phone", v)}
                      placeholder={idx === 0 ? "Phone number" : "Phone (or same as P1)"}
                      className="h-11 w-full rounded-r-xl border border-slate-300 bg-transparent px-3.5 font-mono text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none transition"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
                      Email {idx === 0 ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(optional)</span>}
                    </label>
                    <input
                      type="email"
                      required={idx === 0}
                      value={p.email}
                      onChange={(e) => updatePassenger(idx, "email", e.target.value)}
                      placeholder={idx === 0 ? "Email address" : "Email (or same as P1)"}
                      className="h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Optional Special Requests */}
          <div>
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 hover:text-slate-950 transition cursor-pointer"
            >
              {showNotes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>{showNotes ? "Hide special requests" : "+ Special requests (optional)"}</span>
            </button>

            {showNotes && (
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Wheelchair assistance, baggage wrapping, senior citizen assistance, or special requests..."
                rows={2}
                className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none"
              />
            )}
          </div>

          {/* Corporate Invoicing & GST Toggle (Optional) */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowGst(!showGst)}
              className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 hover:text-slate-950 transition cursor-pointer"
            >
              <div
                className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                  showGst
                    ? "bg-slate-900 border-slate-900 text-lime-400"
                    : "border-slate-300 bg-white"
                }`}
              >
                {showGst && <Check size={11} strokeWidth={3} />}
              </div>
              <Building2 size={13} className="text-slate-500" />
              <span>Add Corporate Details & GSTIN for Tax Invoicing (Optional)</span>
            </button>

            {showGst && (
              <div className="mt-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                      Company Legal Name
                    </label>
                    <input
                      type="text"
                      value={gstCompanyName}
                      onChange={(e) => setGstCompanyName(e.target.value)}
                      placeholder="Company legal name"
                      className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 font-sans text-xs font-medium text-slate-900 focus:border-lime-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                      GSTIN (15 Characters)
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase().trim())}
                      placeholder="15-digit GSTIN"
                      className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 font-mono text-xs font-bold text-slate-900 uppercase focus:border-lime-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                    Registered Company Billing Address
                  </label>
                  <input
                    type="text"
                    value={gstBillingAddress}
                    onChange={(e) => setGstBillingAddress(e.target.value)}
                    placeholder="Registered company billing address"
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 font-sans text-xs text-slate-900 focus:border-lime-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. BOOKING SUMMARY & PAYMENT ACTION (RAZORPAY MULTI-CURRENCY INTEGRATION) */}
        {/* ========================================================================= */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">

          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                <ShieldCheck size={18} />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900">Booking Summary</h3>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-lime-700 font-bold bg-lime-50 border border-lime-200 px-2 py-0.5 rounded-full">
                <Lock size={10} /> Secure
              </span>
            </div>

            {/* Currency switcher */}
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:border-sky-400 focus:outline-none cursor-pointer"
            >
              {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} ({c.symbol.trim()})
                </option>
              ))}
            </select>
          </div>

          {/* Itemized Services Breakdown */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
              Selected Airport Services
            </span>
            <div className="space-y-2">
              {selectedServices.map((st) => {
                const sApt =
                  st === "DEPARTURE"
                    ? cleanOrigin || originCode || (direction === "departure" ? airportCode : "")
                    : st === "ARRIVAL"
                      ? cleanDest || destCode || (direction === "arrival" ? airportCode : "")
                      : cleanTransit || transitCode || searchParams?.transit || (direction === "transit" ? airportCode : "");
                const sTypeLabel =
                  st === "DEPARTURE"
                    ? "Departure Service"
                    : st === "ARRIVAL"
                      ? "Arrival Service"
                      : "Transit Service";
                const sAptClean = (sApt || "").trim().toUpperCase();
                const availItem = multiServiceAvailability.find(
                  (a) => a.service_type === st && (!sAptClean || a.airport_code.toUpperCase() === sAptClean)
                );
                // Check whether this airport is covered in our database or registry
                const isAirportCoveredInDb = availItem
                  ? availItem.is_airport_supported
                  : Boolean(sAptClean && (AIRPORT_REGISTRY[sAptClean] || sAptClean === airportCode.toUpperCase()));

                const isAvailable = availItem
                  ? availItem.status === "AVAILABLE" && availItem.is_airport_supported
                  : isAirportCoveredInDb;
                const itemPriceInr = availItem?.total_price && availItem.total_price > 0
                  ? availItem.total_price
                  : (isAvailable ? numericUnitPrice * billablePax : 0);

                const formatPkgName = (pkgRaw?: string) => {
                  if (!pkgRaw) return selectedPackageName;
                  const l = pkgRaw.toLowerCase();
                  if (l.includes("platinum")) return "Platinum Service";
                  if (l.includes("gold")) return "Gold Service";
                  if (l.includes("silver")) return "Silver Service";
                  if (l.includes("elite")) return "Elite Service";
                  if (l.includes("domestic_international")) return "Domestic → International";
                  if (l.includes("domestic_domestic")) return "Domestic → Domestic";
                  if (l.includes("international_international")) return "International → International";
                  if (l.includes("international_domestic")) return "International → Domestic";
                  return pkgRaw.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                };

                const itemPkg = isAvailable
                  ? (availItem?.package_name || formatPkgName(packageByService[st]))
                  : "Concierge Arrangement";

                return (
                  <div
                    key={`itemized-service-${st}`}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border text-xs gap-2 transition-all ${
                      isAvailable
                        ? "bg-slate-50/70 border-slate-200/80 text-slate-800"
                        : "bg-amber-50/60 border-amber-200 text-amber-950"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {sTypeLabel} • {sApt || "Airport"}
                        </span>
                        <span
                          className={`font-mono text-[9px] uppercase px-2 py-0.5 rounded-full font-bold ${
                            isAvailable
                              ? "bg-lime-100 text-lime-800"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {isAvailable ? "Available" : "Arrangement Request"}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Package: {itemPkg} • {billablePax} Guest{billablePax > 1 ? "s" : ""}
                      </span>
                      {!isAvailable && (
                        <span className="text-[11px] font-medium text-amber-800 mt-0.5">
                          “We will arrange your service at this airport and inform you shortly.”
                        </span>
                      )}
                    </div>

                    <div className="text-right sm:self-center font-mono font-bold text-sm">
                      {isAvailable ? (
                        <span className="text-slate-900">
                          {formatPrice(convertFromINR(itemPriceInr, selectedCurrency), selectedCurrency)}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium text-xs">
                          ₹0 (Payable later)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compact booking details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-sky-500 font-bold block">Package</span>
              <span className="font-bold text-slate-900 block truncate mt-0.5">{selectedPackageName}</span>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-sky-500 font-bold block">Airport</span>
              <span className="font-bold text-slate-900 block truncate mt-0.5">{airportCode} • <span className="capitalize font-normal text-slate-600">{direction}</span></span>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-sky-500 font-bold block">Flight</span>
              <span className="font-mono font-bold text-slate-900 block truncate mt-0.5">
                {isFlightVerified && verifiedFlight ? verifiedFlight.flightNum : manualFlightNum || flightNumber || "—"}
              </span>
              <span className="font-mono text-[10px] text-slate-400">{format(dateValue, "dd MMM yyyy")}</span>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-sky-500 font-bold block">Guest</span>
              <span className="font-bold text-slate-900 block truncate mt-0.5">
                {passengers.map((p) => p.fullName.trim()).filter(Boolean).join(", ") || fullName || "—"}
                {passengers.length === 1 && age ? ` (${age} yrs)` : ""}
              </span>
              <span className="text-[10px] text-slate-400">{totalPax} pax</span>
            </div>
          </div>

          {/* Price + payment row */}
          <div className="rounded-2xl bg-sky-50/60 border border-sky-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-sky-600 font-bold block">Total Payable</span>
              <div className="font-mono text-2xl sm:text-3xl font-black text-slate-950 mt-0.5">
                {formatPrice(convertedTotalPrice, selectedCurrency)}
              </div>
              <span className="text-[11px] text-slate-500">
                {isArrangementOnly
                  ? "₹0 payable now — Our concierge team will arrange your requested services."
                  : `${formatPrice(convertedTotalPrice, selectedCurrency)} payable today for confirmed services`}
                {isExpressFeeApplicable && (
                  <span className="text-amber-700 font-bold ml-1">
                    + {formatPrice(convertedExpressFee, selectedCurrency)} (50% Express Fee)
                  </span>
                )}
                {paxChildren + paxInfants > 0 && (
                  <span className="text-emerald-600 font-medium ml-1">
                    ({[
                      paxChildren > 0 ? `${paxChildren} child${paxChildren > 1 ? "ren" : ""} free` : "",
                      paxInfants > 0 ? `${paxInfants} infant${paxInfants > 1 ? "s" : ""} free` : "",
                    ].filter(Boolean).join(", ")})
                  </span>
                )}
                , taxes included
              </span>
              {isExpressFeeApplicable && (
                <div className="mt-2 flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] text-amber-900 font-medium">
                  <span>⚡ <strong>50% Express Fee Applied:</strong> Mumbai Airport booking under 24 hours before service start time.</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {["UPI", "Google Pay", "Cards", "NetBanking"].map((m) => (
                <span key={m} className="rounded-lg border border-sky-200 bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-sky-700">
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-lime-500" />
              <span>Encrypted payment via Razorpay</span>
            </div>

            <div className="w-full sm:w-auto flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleShareQuoteWhatsApp}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <MessageSquare size={14} className="text-emerald-500" />
                Share
              </button>

              {isArrangementOnly ? (
                <button
                  type="button"
                  onClick={handleRequestServiceArrangement}
                  disabled={isArrangementSubmitting}
                  className="flex-1 sm:flex-none min-w-[240px] inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 px-6 py-3.5 text-xs font-mono font-extrabold uppercase tracking-widest text-slate-950 shadow-md shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isArrangementSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Request Service Arrangement</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              ) : paymentStatus === "DISMISSED" || paymentStatus === "FAILED" ? (
                <button
                  type="button"
                  onClick={handleRetryPayment}
                  disabled={submitting}
                  className="flex-1 sm:flex-none min-w-[200px] inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-400 px-6 py-3 text-xs font-mono font-extrabold uppercase tracking-widest text-white shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={14} />
                      <span>Retry {formatPrice(convertedTotalPrice, selectedCurrency)}</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 sm:flex-none min-w-[200px] inline-flex items-center justify-center gap-2 rounded-2xl bg-lime-500 hover:bg-lime-400 px-6 py-3 text-xs font-mono font-extrabold uppercase tracking-widest text-slate-950 shadow-md shadow-lime-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={14} />
                      <span>Pay {formatPrice(convertedTotalPrice, selectedCurrency)}</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
      )}
    </div>
  );
}

export default AirportBookingFlow;
