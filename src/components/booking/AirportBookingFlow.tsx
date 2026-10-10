import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { format, parseISO, isValid } from "date-fns";
import { resolveApiUrl } from "@/lib/api/config";
import {
  getAirportRegistryEntry,
  getTransitCategory,
  getRouteFlightCategory,
  AIRPORT_REGISTRY,
} from "@/data/airportRegistry";
import {
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

// Modular Airport Domain Components & Types
import { AirportBookingFlowProps, PassengerDetail, AirportPackageItem } from "./airport/types";
import { extractIata, buildAnchoredServiceClock } from "./airport/utils";
import { BookingConfirmationView } from "./airport/BookingConfirmationView";
import { ServiceArrangementConfirmationView } from "./airport/ServiceArrangementConfirmationView";
import { TripContextBanner } from "./airport/TripContextBanner";
import { PassengerInformationSection } from "./airport/PassengerInformationSection";
import { BookingSummarySection } from "./airport/BookingSummarySection";
import { DirectFlightDetailsSection } from "./airport/DirectFlightDetailsSection";
import { TransitFlightDetailsSection } from "./airport/TransitFlightDetailsSection";

// Custom Domain Hooks
import { useFlightVerification } from "./airport/hooks/useFlightVerification";
import { useAirportPayment } from "./airport/hooks/useAirportPayment";

export function AirportBookingFlow({ searchParams }: AirportBookingFlowProps) {
  // 1. Initial State from Search Params & Intent
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

  const [airportCode, setAirportCode] = useState<string>(rawAirportCode);
  const [explicitlyAcceptedRoute, setExplicitlyAcceptedRoute] = useState<{ origin: string; dest: string } | null>(null);
  const [direction] = useState<"arrival" | "departure" | "transit">(initialDirection);
  const [travelType, setTravelType] = useState<"domestic" | "international">(initialTravelType);

  const handleTravelTypeChange = (newType: "domestic" | "international") => {
    if (isCategoryLocked && !explicitlyAcceptedRoute) {
      // Category is locked by the homepage booking flow route unless explicitly accepted
      return;
    }
    setTravelType(newType);
  };

  useEffect(() => {
    if (explicitlyAcceptedRoute) return;
    if (isCategoryLocked && travelType !== initialTravelType) {
      setTravelType(initialTravelType);
    }
  }, [isCategoryLocked, initialTravelType, travelType, explicitlyAcceptedRoute]);

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

  // 2. Flight Verification Hook
  const flightVerification = useFlightVerification({
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
    onExplicitRouteAccepted: (orig, dest) => setExplicitlyAcceptedRoute({ origin: orig, dest }),
  });

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return;
    const formatted = format(newDate, "yyyy-MM-dd");
    setServiceDate(formatted);
    flightVerification.setIsFlightVerified(false);
    flightVerification.setVerifiedFlight(null);
    flightVerification.setFlightFetchError(null);
    flightVerification.setIsCutoffUrgent(false);
    setDatePopoverOpen(false);
    setManualDatePopoverOpen(false);
  };

  const handleDateChange2 = (newDate: Date | undefined) => {
    if (!newDate) return;
    const formatted = format(newDate, "yyyy-MM-dd");
    setServiceDate2(formatted);
    flightVerification.setIsFlightVerified2(false);
    flightVerification.setVerifiedFlight2(null);
    flightVerification.setFlightFetchError2(null);
    flightVerification.setIsCutoffUrgent2(false);
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

  // Multi-Service Selection & Dynamic Availability State
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
  const [, setIsMultiServiceLoading] = useState<boolean>(false);

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
      flight_num: flightVerification.flightNumber || undefined,
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
    flightVerification.flightNumber,
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

  // Mumbai Airport Express Fee rule
  const expressFeeDetails = useMemo(() => {
    const isBom = (airportCode || "").toUpperCase() === "BOM";
    if (!isBom) return { feeInr: 0, isApplicable: false, advanceHours: null };

    const rawDep = flightVerification.isFlightVerified && flightVerification.verifiedFlight?.departure?.scheduledTime
      ? flightVerification.verifiedFlight.departure.scheduledTime
      : flightVerification.manualDepTime
      ? buildAnchoredServiceClock(serviceDate, flightVerification.manualDepTime, "10:00")
      : null;

    const rawArr = flightVerification.isFlightVerified && flightVerification.verifiedFlight?.arrival?.scheduledTime
      ? flightVerification.verifiedFlight.arrival.scheduledTime
      : flightVerification.manualArrTime
      ? buildAnchoredServiceClock(serviceDate, flightVerification.manualArrTime, "12:30")
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
      targetTimeStr = rawArr || rawDep;
      if (!targetTimeStr) return { feeInr: 0, isApplicable: false, advanceHours: null };
      offsetMs = 0;
    }

    try {
      const hasOffset = /[Zz]|[+-]\d{2}:?\d{2}$/.test(targetTimeStr);
      const normalizedStr = hasOffset ? targetTimeStr : `${targetTimeStr}+05:30`;
      const flightTimestamp = new Date(normalizedStr).getTime();
      if (isNaN(flightTimestamp)) return { feeInr: 0, isApplicable: false, advanceHours: null };

      const serviceStartMs = flightTimestamp - offsetMs;
      const advanceMs = serviceStartMs - Date.now();
      const advanceHours = advanceMs / (1000 * 60 * 60);

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
    flightVerification.isFlightVerified,
    flightVerification.verifiedFlight,
    flightVerification.manualDepTime,
    flightVerification.manualArrTime,
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

  // Corporate Invoicing & GST State
  const [showGst, setShowGst] = useState<boolean>(false);
  const [gstCompanyName, setGstCompanyName] = useState<string>("");
  const [gstNumber, setGstNumber] = useState<string>("");
  const [gstBillingAddress, setGstBillingAddress] = useState<string>("");

  // Share Quote / Itinerary on WhatsApp
  const handleShareQuoteWhatsApp = () => {
    const flightDisplay =
      flightVerification.isFlightVerified && flightVerification.verifiedFlight
        ? `${flightVerification.verifiedFlight.carrier.name} ${flightVerification.verifiedFlight.flightNum}`
        : flightVerification.manualFlightNum || flightVerification.flightNumber || "Flight Pending";

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

  // 3. Payment & Security Lifecycle Hook
  const paymentHook = useAirportPayment({
    passengers,
    fullName,
    age,
    phone,
    email,
    specialRequests,
    direction,
    airportCode,
    originCode,
    destCode,
    transitCode,
    serviceDate,
    serviceDate2,
    selectedPackageId,
    selectedPackageName,
    travelType,
    selectedServices,
    packageByService,
    multiServiceResponse,
    selectedCurrency,
    convertedUnitPrice,
    convertedTotalPrice,
    baseInrTotalPrice,
    convertedExpressFee,
    paxAdults,
    paxChildren,
    paxInfants,
    totalPax,
    showGst,
    gstCompanyName,
    gstNumber,
    gstBillingAddress,
    searchParams,

    isFlightVerified: flightVerification.isFlightVerified,
    verifiedFlight: flightVerification.verifiedFlight,
    isManualMode: flightVerification.isManualMode,
    manualFlightNum: flightVerification.manualFlightNum,
    manualAirline: flightVerification.manualAirline,
    manualAirlineIata: flightVerification.manualAirlineIata,
    flightNumber: flightVerification.flightNumber,
    manualDepTime: flightVerification.manualDepTime,
    manualArrTime: flightVerification.manualArrTime,
    manualDepTerminal: flightVerification.manualDepTerminal,
    manualArrTerminal: flightVerification.manualArrTerminal,

    isFlightVerified2: flightVerification.isFlightVerified2,
    verifiedFlight2: flightVerification.verifiedFlight2,
    isManualMode2: flightVerification.isManualMode2,
    manualFlightNum2: flightVerification.manualFlightNum2,
    manualAirline2: flightVerification.manualAirline2,
    manualAirlineIata2: flightVerification.manualAirlineIata2,
    flightNumber2: flightVerification.flightNumber2,
    manualDepTime2: flightVerification.manualDepTime2,
    manualArrTime2: flightVerification.manualArrTime2,
    manualDepTerminal2: flightVerification.manualDepTerminal2,
    manualArrTerminal2: flightVerification.manualArrTerminal2,

    setIsCutoffUrgent: flightVerification.setIsCutoffUrgent,
  });

  // SUCCESS SCREEN: BOOKING CONFIRMED ONLY UPON SERVER-SIDE PAYMENT VERIFICATION
  if (paymentHook.confirmedBookingRef && paymentHook.isPaymentVerified && paymentHook.paymentStatus === "PAID") {
    const activeFlight = flightVerification.isFlightVerified && flightVerification.verifiedFlight
      ? `${flightVerification.verifiedFlight.flightNum} (${flightVerification.verifiedFlight.carrier.name || "Verified Flight"})`
      : flightVerification.isManualMode
      ? `${flightVerification.manualFlightNum} (${flightVerification.manualAirline || flightVerification.manualAirlineIata || "Airline"})`
      : flightVerification.flightNumber;

    const activeFlight1 = activeFlight;
    const activeFlight2 = flightVerification.isFlightVerified2 && flightVerification.verifiedFlight2
      ? `${flightVerification.verifiedFlight2.flightNum} (${flightVerification.verifiedFlight2.carrier.name || "Verified Flight"})`
      : flightVerification.isManualMode2
      ? `${flightVerification.manualFlightNum2} (${flightVerification.manualAirline2 || flightVerification.manualAirlineIata2 || "Airline"})`
      : flightVerification.flightNumber2;

    return (
      <BookingConfirmationView
        confirmedBookingRef={paymentHook.confirmedBookingRef}
        paymentTransactionId={paymentHook.paymentTransactionId}
        convertedTotalPrice={convertedTotalPrice}
        selectedCurrency={selectedCurrency}
        airportCityName={airportCityName}
        airportCode={airportCode}
        selectedPackageName={selectedPackageName}
        direction={direction}
        travelType={travelType}
        originCode={originCode}
        destCode={destCode}
        dateValue={dateValue}
        dateValue2={dateValue2}
        activeFlight={activeFlight}
        activeFlight1={activeFlight1}
        activeFlight2={activeFlight2}
        fullName={fullName}
        totalPax={totalPax}
        phone={phone}
        email={email}
        multiServiceResponse={multiServiceResponse}
      />
    );
  }

  // DIRECT BOOKING DETAILS (FLIGHT + PASSENGER + SUMMARY + PAYMENT GATEWAY)
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <TripContextBanner
        airportCityName={airportCityName}
        airportCode={airportCode}
        selectedPackageName={selectedPackageName}
        travelType={travelType}
        direction={direction}
        dateValue={dateValue}
        totalPax={totalPax}
        paxAdults={paxAdults}
        paxChildren={paxChildren}
        paxInfants={paxInfants}
        convertedTotalPrice={convertedTotalPrice}
        selectedCurrency={selectedCurrency}
        isPackagesLoading={isPackagesLoading}
        availablePackages={availablePackages}
        selectedPackageId={selectedPackageId}
        setSelectedPackageId={setSelectedPackageId}
        setSelectedPackageName={setSelectedPackageName}
        setSelectedPackagePrice={setSelectedPackagePrice}
        setPackageByService={setPackageByService}
      />

      {paymentHook.arrangementSubmitted ? (
        <ServiceArrangementConfirmationView
          serviceQuerySuccessRef={paymentHook.serviceQuerySuccessRef}
          phone={phone}
          email={email}
          selectedServices={selectedServices}
          cleanOrigin={cleanOrigin}
          originCode={originCode}
          cleanDest={cleanDest}
          destCode={destCode}
          cleanTransit={cleanTransit}
          transitCode={transitCode}
          airportCode={airportCode}
        />
      ) : (
        <form onSubmit={paymentHook.handleProceedToPayment} className="space-y-6">
          {direction === "transit" ? (
            <TransitFlightDetailsSection
              airportCityName={airportCityName}
              airportCode={airportCode}
              originCode={originCode}
              setOriginCode={setOriginCode}
              destCode={destCode}
              setDestCode={setDestCode}
              travelType={travelType}
              handleTravelTypeChange={handleTravelTypeChange}
              isFlightVerified={flightVerification.isFlightVerified}
              verifiedFlight={flightVerification.verifiedFlight}
              flightNumber={flightVerification.flightNumber}
              setFlightNumber={flightVerification.setFlightNumber}
              isFlightVerified2={flightVerification.isFlightVerified2}
              verifiedFlight2={flightVerification.verifiedFlight2}
              flightNumber2={flightVerification.flightNumber2}
              setFlightNumber2={flightVerification.setFlightNumber2}
              isManualMode={flightVerification.isManualMode}
              setIsManualMode={flightVerification.setIsManualMode}
              setIsFlightVerified={flightVerification.setIsFlightVerified}
              setVerifiedFlight={flightVerification.setVerifiedFlight}
              flightFetchError={flightVerification.flightFetchError}
              setFlightFetchError={flightVerification.setFlightFetchError}
              isCutoffUrgent={flightVerification.isCutoffUrgent}
              setIsCutoffUrgent={flightVerification.setIsCutoffUrgent}
              handleVerifyFlight={flightVerification.handleVerifyFlight}
              isFlightFetching={flightVerification.isFlightFetching}
              datePopoverOpen={datePopoverOpen}
              setDatePopoverOpen={setDatePopoverOpen}
              dateValue={dateValue}
              handleDateChange={handleDateChange}
              todayStart={todayStart}
              serviceDate={serviceDate}
              fullName={fullName}
              manualAirline={flightVerification.manualAirline}
              setManualAirline={flightVerification.setManualAirline}
              manualAirlineIata={flightVerification.manualAirlineIata}
              setManualAirlineIata={flightVerification.setManualAirlineIata}
              manualFlightNum={flightVerification.manualFlightNum}
              setManualFlightNum={flightVerification.setManualFlightNum}
              manualDatePopoverOpen={manualDatePopoverOpen}
              setManualDatePopoverOpen={setManualDatePopoverOpen}
              manualDepTime={flightVerification.manualDepTime}
              setManualDepTime={flightVerification.setManualDepTime}
              manualDepTerminal={flightVerification.manualDepTerminal}
              setManualDepTerminal={flightVerification.setManualDepTerminal}
              manualArrTime={flightVerification.manualArrTime}
              setManualArrTime={flightVerification.setManualArrTime}
              manualArrTerminal={flightVerification.manualArrTerminal}
              setManualArrTerminal={flightVerification.setManualArrTerminal}
              isManualMode2={flightVerification.isManualMode2}
              setIsManualMode2={flightVerification.setIsManualMode2}
              setIsFlightVerified2={flightVerification.setIsFlightVerified2}
              setVerifiedFlight2={flightVerification.setVerifiedFlight2}
              flightFetchError2={flightVerification.flightFetchError2}
              setFlightFetchError2={flightVerification.setFlightFetchError2}
              isCutoffUrgent2={flightVerification.isCutoffUrgent2}
              setIsCutoffUrgent2={flightVerification.setIsCutoffUrgent2}
              handleVerifyFlight2={flightVerification.handleVerifyFlight2}
              isFlightFetching2={flightVerification.isFlightFetching2}
              datePopoverOpen2={datePopoverOpen2}
              setDatePopoverOpen2={setDatePopoverOpen2}
              dateValue2={dateValue2}
              handleDateChange2={handleDateChange2}
              serviceDate2={serviceDate2}
              manualAirline2={flightVerification.manualAirline2}
              setManualAirline2={flightVerification.setManualAirline2}
              manualAirlineIata2={flightVerification.manualAirlineIata2}
              setManualAirlineIata2={flightVerification.setManualAirlineIata2}
              manualFlightNum2={flightVerification.manualFlightNum2}
              setManualFlightNum2={flightVerification.setManualFlightNum2}
              manualDatePopoverOpen2={manualDatePopoverOpen2}
              setManualDatePopoverOpen2={setManualDatePopoverOpen2}
              manualDepTime2={flightVerification.manualDepTime2}
              setManualDepTime2={flightVerification.setManualDepTime2}
              manualDepTerminal2={flightVerification.manualDepTerminal2}
              setManualDepTerminal2={flightVerification.setManualDepTerminal2}
              manualArrTime2={flightVerification.manualArrTime2}
              setManualArrTime2={flightVerification.setManualArrTime2}
              manualArrTerminal2={flightVerification.manualArrTerminal2}
              setManualArrTerminal2={flightVerification.setManualArrTerminal2}
              routeMismatch={flightVerification.routeMismatch}
              setRouteMismatch={flightVerification.setRouteMismatch}
              confirmingRouteUpdate={flightVerification.confirmingRouteUpdate}
              setConfirmingRouteUpdate={flightVerification.setConfirmingRouteUpdate}
              handleKeepSelectedRoute={flightVerification.handleKeepSelectedRoute}
              handleUseFlightRoute={flightVerification.handleUseFlightRoute}
              routeMismatch2={flightVerification.routeMismatch2}
              setRouteMismatch2={flightVerification.setRouteMismatch2}
              confirmingRouteUpdate2={flightVerification.confirmingRouteUpdate2}
              setConfirmingRouteUpdate2={flightVerification.setConfirmingRouteUpdate2}
              handleKeepSelectedRoute2={flightVerification.handleKeepSelectedRoute2}
              handleUseFlightRoute2={flightVerification.handleUseFlightRoute2}
            />
          ) : (
            <DirectFlightDetailsSection
              isManualMode={flightVerification.isManualMode}
              setIsManualMode={flightVerification.setIsManualMode}
              flightNumber={flightVerification.flightNumber}
              setFlightNumber={flightVerification.setFlightNumber}
              setIsFlightVerified={flightVerification.setIsFlightVerified}
              setVerifiedFlight={flightVerification.setVerifiedFlight}
              flightFetchError={flightVerification.flightFetchError}
              setFlightFetchError={flightVerification.setFlightFetchError}
              isCutoffUrgent={flightVerification.isCutoffUrgent}
              setIsCutoffUrgent={flightVerification.setIsCutoffUrgent}
              handleVerifyFlight={flightVerification.handleVerifyFlight}
              isFlightFetching={flightVerification.isFlightFetching}
              datePopoverOpen={datePopoverOpen}
              setDatePopoverOpen={setDatePopoverOpen}
              dateValue={dateValue}
              handleDateChange={handleDateChange}
              todayStart={todayStart}
              isFlightVerified={flightVerification.isFlightVerified}
              direction={direction}
              airportCode={airportCode}
              airportCityName={airportCityName}
              originCode={originCode}
              setOriginCode={setOriginCode}
              destCode={destCode}
              setDestCode={setDestCode}
              travelType={travelType}
              handleTravelTypeChange={handleTravelTypeChange}
              serviceDate={serviceDate}
              fullName={fullName}
              verifiedFlight={flightVerification.verifiedFlight}
              manualAirline={flightVerification.manualAirline}
              setManualAirline={flightVerification.setManualAirline}
              manualAirlineIata={flightVerification.manualAirlineIata}
              setManualAirlineIata={flightVerification.setManualAirlineIata}
              manualFlightNum={flightVerification.manualFlightNum}
              setManualFlightNum={flightVerification.setManualFlightNum}
              manualDatePopoverOpen={manualDatePopoverOpen}
              setManualDatePopoverOpen={setManualDatePopoverOpen}
              manualDepTime={flightVerification.manualDepTime}
              setManualDepTime={flightVerification.setManualDepTime}
              manualDepTerminal={flightVerification.manualDepTerminal}
              setManualDepTerminal={flightVerification.setManualDepTerminal}
              manualArrTime={flightVerification.manualArrTime}
              setManualArrTime={flightVerification.setManualArrTime}
              manualArrTerminal={flightVerification.manualArrTerminal}
              setManualArrTerminal={flightVerification.setManualArrTerminal}
              routeMismatch={flightVerification.routeMismatch}
              setRouteMismatch={flightVerification.setRouteMismatch}
              confirmingRouteUpdate={flightVerification.confirmingRouteUpdate}
              setConfirmingRouteUpdate={flightVerification.setConfirmingRouteUpdate}
              handleKeepSelectedRoute={flightVerification.handleKeepSelectedRoute}
              handleUseFlightRoute={flightVerification.handleUseFlightRoute}
            />
          )}

          <PassengerInformationSection
            passengers={passengers}
            paxAdults={paxAdults}
            handlePaxChange={handlePaxChange}
            updatePassenger={updatePassenger}
            copyFromPassenger1={copyFromPassenger1}
            specialRequests={specialRequests}
            setSpecialRequests={setSpecialRequests}
            showNotes={showNotes}
            setShowNotes={setShowNotes}
            showGst={showGst}
            setShowGst={setShowGst}
            gstCompanyName={gstCompanyName}
            setGstCompanyName={setGstCompanyName}
            gstNumber={gstNumber}
            setGstNumber={setGstNumber}
            gstBillingAddress={gstBillingAddress}
            setGstBillingAddress={setGstBillingAddress}
          />

          <BookingSummarySection
            selectedCurrency={selectedCurrency}
            setSelectedCurrency={setSelectedCurrency}
            selectedServices={selectedServices}
            cleanOrigin={cleanOrigin}
            originCode={originCode}
            direction={direction}
            airportCode={airportCode}
            cleanDest={cleanDest}
            destCode={destCode}
            cleanTransit={cleanTransit}
            transitCode={transitCode}
            searchParams={searchParams}
            multiServiceAvailability={multiServiceAvailability}
            numericUnitPrice={numericUnitPrice}
            billablePax={billablePax}
            selectedPackageName={selectedPackageName}
            packageByService={packageByService}
            isFlightVerified={flightVerification.isFlightVerified}
            verifiedFlight={flightVerification.verifiedFlight}
            manualFlightNum={flightVerification.manualFlightNum}
            flightNumber={flightVerification.flightNumber}
            dateValue={dateValue}
            passengers={passengers}
            fullName={fullName}
            age={age}
            totalPax={totalPax}
            convertedTotalPrice={convertedTotalPrice}
            isArrangementOnly={isArrangementOnly}
            isExpressFeeApplicable={isExpressFeeApplicable}
            convertedExpressFee={convertedExpressFee}
            paxChildren={paxChildren}
            paxInfants={paxInfants}
            handleShareQuoteWhatsApp={handleShareQuoteWhatsApp}
            handleRequestServiceArrangement={paymentHook.handleRequestServiceArrangement}
            isArrangementSubmitting={paymentHook.isArrangementSubmitting}
            paymentStatus={paymentHook.paymentStatus}
            handleRetryPayment={paymentHook.handleRetryPayment}
            submitting={paymentHook.submitting}
          />
        </form>
      )}
    </div>
  );
}

export default AirportBookingFlow;
