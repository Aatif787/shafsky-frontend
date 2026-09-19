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
  Plus
} from "lucide-react";
import { ApiClient } from "@/lib/ApiClient";
import { resolveApiUrl } from "@/lib/api/config";
import { getAirportRegistryEntry, isIndianAirportCode } from "@/data/airportRegistry";
import { AirlineLogo } from "./shared/AirlineLogo";
import { IntelligentAirlineAutocomplete } from "./shared/IntelligentAirlineAutocomplete";
import { FlightTimePicker } from "./shared/FlightTimePicker";
import { FlightData } from "@/services/flight/FlightTypes";
import { formatFlightLookupError } from "./hooks/useAirportWorkflow";
import { loadRazorpayScript } from "@/lib/razorpay";
import { toRazorpayContact } from "./validation/sharedValidation";
import {
  SUPPORTED_CURRENCIES,
  convertFromINR,
  formatPrice,
  detectDefaultCurrency,
} from "@/lib/currency";

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

  const initialTravelType: "domestic" | "international" = useMemo(() => {
    const raw = String(searchParams?.travel_type || searchParams?.flight_type || "").toLowerCase();
    return raw === "international" || raw === "intl" ? "international" : "domestic";
  }, [searchParams]);

  const rawAirportCode =
    extractIata(searchParams?.airport) ||
    extractIata(searchParams?.airport_id) ||
    (initialDirection === "departure"
      ? extractIata(searchParams?.origin)
      : initialDirection === "arrival"
      ? extractIata(searchParams?.destination)
      : extractIata(searchParams?.transit)) ||
    "DEL";

  const [airportCode] = useState<string>(rawAirportCode);
  const [direction] = useState<"arrival" | "departure" | "transit">(initialDirection);
  const [travelType, setTravelType] = useState<"domestic" | "international">(initialTravelType);

  const registryEntry = getAirportRegistryEntry(airportCode);
  const airportCityName = searchParams?.airport_name || registryEntry?.city || registryEntry?.name || airportCode;

  const initialOrigin = extractIata(searchParams?.origin) || (direction === "departure" ? airportCode : "");
  const initialDestination = extractIata(searchParams?.destination) || (direction === "arrival" ? airportCode : "");

  const [originCode, setOriginCode] = useState<string>(initialOrigin);
  const [destCode, setDestCode] = useState<string>(initialDestination);

  const serviceDate = searchParams?.depart_date || searchParams?.service_date || new Date().toISOString().split("T")[0];

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
    const ft = (travelType || "domestic").toUpperCase();
    const url = resolveApiUrl(`/api/airport/services?airport=${airportCode}&journey_type=${jt}&flight_type=${ft}`);

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
  }, [airportCode, direction, travelType]);

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
  const totalPrice = numericUnitPrice * billablePax;
  const baseInrTotalPrice = totalPrice;
  const convertedUnitPrice = useMemo(() => convertFromINR(numericUnitPrice, selectedCurrency), [numericUnitPrice, selectedCurrency]);
  const convertedTotalPrice = useMemo(() => convertFromINR(totalPrice, selectedCurrency), [totalPrice, selectedCurrency]);

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
          originCode: originCode || airportCode,
          destCode: destCode || airportCode,
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
              code: (flightObj?.departure?.airport || flightObj?.origin?.code || originCode || "").toUpperCase(),
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

  // Auto-verify if flight_number is passed in URL query params so mismatch is immediately visible on screen
  useEffect(() => {
    if (searchParams?.flight_number?.trim() && !isFlightVerified) {
      handleVerifyFlight();
    }
  }, []);

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

    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("Please enter a valid contact mobile number for Passenger 1.");
      return;
    }

    // 2. Validate Flight Number
    const activeFlightNum = isFlightVerified && verifiedFlight
      ? verifiedFlight.flightNum
      : isManualMode
      ? sanitizeFlightInput(manualFlightNum)
      : sanitizeFlightInput(flightNumber);

    if (!activeFlightNum || activeFlightNum.length < 3) {
      toast.error("Flight number is required. Please enter or verify your flight.");
      return;
    }

    const packageSlug = (selectedPackageId || "gold").toLowerCase();
    const cleanOrigin = (
      (isFlightVerified && verifiedFlight?.origin?.code) ||
      originCode ||
      (direction === "departure" ? airportCode : "")
    ).trim().toUpperCase();

    const cleanDest = (
      (isFlightVerified && verifiedFlight?.destination?.code) ||
      destCode ||
      (direction === "arrival" ? airportCode : "")
    ).trim().toUpperCase();

    if (
      direction !== "transit" &&
      cleanOrigin &&
      cleanDest &&
      cleanOrigin === cleanDest
    ) {
      toast.error("Departure and arrival airports cannot be the same. Please verify your flight or select a valid route.");
      return;
    }

    const rawDepForGap = isFlightVerified && verifiedFlight?.departure?.scheduledTime
      ? verifiedFlight.departure.scheduledTime
      : manualDepTime;
    const rawArrForGap = isFlightVerified && verifiedFlight?.arrival?.scheduledTime
      ? verifiedFlight.arrival.scheduledTime
      : manualArrTime;

    let isArrivalOvernight = false;
    if (rawDepForGap && rawArrForGap) {
      const depDateM = String(rawDepForGap).match(/^(\d{4}-\d{2}-\d{2})/);
      const arrDateM = String(rawArrForGap).match(/^(\d{4}-\d{2}-\d{2})/);
      if (depDateM && arrDateM && arrDateM[1] > depDateM[1]) {
        isArrivalOvernight = true;
      } else {
        const depH = String(rawDepForGap).match(/(\d{1,2}:\d{2})/)?.[1] || "";
        const arrH = String(rawArrForGap).match(/(\d{1,2}:\d{2})/)?.[1] || "";
        if (depH && arrH && arrH < depH) {
          isArrivalOvernight = true;
        }
      }
    }

    const depClock = buildAnchoredServiceClock(
      serviceDate,
      isFlightVerified ? verifiedFlight?.departure?.scheduledTime : null,
      manualDepTime || "10:00"
    );

    const arrClock = buildAnchoredServiceClock(
      serviceDate,
      isFlightVerified ? verifiedFlight?.arrival?.scheduledTime : null,
      manualArrTime || "12:30",
      isArrivalOvernight
    );

    let terminalVal = isFlightVerified
      ? direction === "arrival"
        ? verifiedFlight?.arrival?.terminal
        : verifiedFlight?.departure?.terminal
      : direction === "arrival"
      ? manualArrTerminal
      : manualDepTerminal;

    // Strict Rule: For Delhi (DEL) International services, always Terminal 3
    if ((airportCode || "").toUpperCase() === "DEL" && travelType === "international") {
      terminalVal = "Terminal 3";
    }

    setSubmitting(true);
    setPaymentStatus("OPEN");

    try {
      // 3. Create initial PENDING booking and generate server-side Razorpay Order
      let bookingRefToUse = activeBookingRef;
      let orderId: string | null = null;
      let keyId: string | null = null;
      let amountPaise: number = selectedCurrency === "INR" ? convertedTotalPrice * 100 : Math.round(convertedTotalPrice * 100);

      const createRes = await ApiClient.fetchWithAuth("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          passengerName: cleanName,
          passengerEmail: cleanEmail,
          passengerPhone: cleanPhone,
          serviceCategory: "Airport Assistance",
          serviceType: packageSlug,
          flightNum: activeFlightNum,
          originCode: cleanOrigin,
          destCode: cleanDest,
          metadataJson: {
            journey_type: direction.toUpperCase(),
            direction,
            service_date: serviceDate,
            depart_date: serviceDate,
            travel_date: serviceDate,
            flight_date: serviceDate,
            flight_type: travelType.toUpperCase(),
            travel_type: travelType.toUpperCase(),
            origin_iata: cleanOrigin,
            destination_iata: cleanDest,
            service_airport: airportCode.toUpperCase(),
            terminal: terminalVal || undefined,
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
            package: packageSlug,
            unit_price: convertedUnitPrice,
            currency: selectedCurrency,
            base_inr_price: baseInrTotalPrice,
            gst_company_name: showGst && gstCompanyName.trim() ? gstCompanyName.trim() : undefined,
            gst_number: showGst && gstNumber.trim() ? gstNumber.trim().toUpperCase() : undefined,
            gst_billing_address: showGst && gstBillingAddress.trim() ? gstBillingAddress.trim() : undefined,
          },
          departureTime: depClock,
          arrivalTime: arrClock,
          totalAmount: convertedTotalPrice,
          currency: selectedCurrency,
          notes: specialRequests
            ? `${specialRequests} | Passengers: ${passengers.map((p, idx) => `P${idx + 1}: ${p.fullName.trim()}${p.age ? ` (${p.age}y)` : ""}`).join(", ")}`
            : `Airport: ${airportCode}, Direction: ${direction} | Passengers: ${passengers.map((p, idx) => `P${idx + 1}: ${p.fullName.trim()}${p.age ? ` (${p.age}y)` : ""}`).join(", ")}`,
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
      orderId = createData.data?.razorpay_order_id;
      keyId = createData.data?.razorpay_key_id;
      amountPaise = createData.data?.razorpay_amount_paise || (selectedCurrency === "INR" ? convertedTotalPrice * 100 : Math.round(convertedTotalPrice * 100));

      if (bookingRefToUse) {
        setActiveBookingRef(bookingRefToUse);
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
        body: JSON.stringify({ booking_ref: activeBookingRef }),
      });
      const retryData = await retryRes.json().catch(() => null);

      if (!retryRes.ok || !retryData || !retryData.success) {
        toast.error(retryData?.detail || retryData?.error || "Unable to retry payment. Re-initializing booking...");
        handleProceedToPayment();
        return;
      }

      const orderId = retryData.data?.razorpay_order_id;
      const keyId = retryData.data?.razorpay_key_id;
      const amountPaise = retryData.data?.razorpay_amount_paise || (selectedCurrency === "INR" ? convertedTotalPrice * 100 : Math.round(convertedTotalPrice * 100));

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
                  {serviceDate}
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

            <div className="rounded-2xl border border-lime-200 bg-lime-50/50 p-4 text-xs text-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-lime-900">
                <ShieldCheck size={16} className="text-lime-700" />
                <span>Next Protocol Steps</span>
              </div>
              <p className="text-[11.5px] text-slate-600 leading-relaxed font-sans">
                Our airport concierge duty officer will reach out on your contact number (<strong>{phone}</strong>) and email (<strong>{email}</strong>) prior to flight departure/arrival to coordinate curbside or aerobridge meet.
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
                <span>WhatsApp Command Desk</span>
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
          <span>
            Date: <strong>{serviceDate}</strong>
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

      <form onSubmit={handleProceedToPayment} className="space-y-6">
        {/* ========================================================================= */}
        {/* 1. FLIGHT DETAILS (AUTOMATIC FETCH + STRICT AIRPORT CONSISTENCY + MANUAL) */}
        {/* ========================================================================= */}
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
              <div>
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
                      placeholder="e.g. AI101, 6E202, EK504, BA142, AIC101"
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
                      <>
                        <span>Fetch Flight</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* URGENT CUTOFF VIP FAST-TRACK BANNER */}
              {isCutoffUrgent && (
                <div className="rounded-2xl border border-rose-300 bg-rose-50/80 p-4 sm:p-5 text-xs text-rose-950 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
                    <PhoneCall size={18} className="text-rose-600" />
                    <span>Urgent VIP Airport Clearance Available</span>
                  </div>
                  <p className="text-xs text-rose-900 font-sans leading-relaxed">
                    This flight is scheduled within our standard advance notice window (less than 12h for domestic or 24h for international). Our 24/7 Airport Command Desk provides direct manual authorization for urgent flights.
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
                    <span>Connect VIP Duty Officer on WhatsApp</span>
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

              {/* Row: Airline & Flight Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    placeholder="e.g. AI101, 6E202, EK504"
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 font-mono text-xs font-bold text-slate-900 uppercase tracking-wider focus:border-lime-500 focus:outline-none"
                    required
                  />
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
                        placeholder="e.g. T3, T2, T1"
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
                        placeholder="e.g. T3, T2, T1"
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-xs font-bold text-slate-900 uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={p.fullName}
                      onChange={(e) => updatePassenger(idx, "fullName", e.target.value)}
                      placeholder="Name as per government ID"
                      className="h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none"
                    />
                  </div>

                  {/* Age */}
                  <div>
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
                      className="h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3.5 font-mono text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
                      Phone {idx === 0 ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(optional)</span>}
                    </label>
                    <input
                      type="tel"
                      required={idx === 0}
                      value={p.phone}
                      onChange={(e) => updatePassenger(idx, "phone", e.target.value)}
                      placeholder={idx === 0 ? "Phone" : "Phone (or same as P1)"}
                      className="h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3.5 font-mono text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
                      Email {idx === 0 ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(optional)</span>}
                    </label>
                    <input
                      type="email"
                      required={idx === 0}
                      value={p.email}
                      onChange={(e) => updatePassenger(idx, "email", e.target.value)}
                      placeholder={idx === 0 ? "Email" : "Email (or same as P1)"}
                      className="h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none"
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
                placeholder="E.g. Wheelchair assistance required from aerobridge, baggage wrapping, or senior citizen assistance."
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
                      placeholder="e.g. Acme Corp Private Limited"
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
                      placeholder="e.g. 07AAAAA0000A1Z5"
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
                    placeholder="e.g. 402 Business Tower, Sector 44, Gurugram, Haryana"
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
              <span className="font-mono text-[10px] text-slate-400">{serviceDate}</span>
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
                {formatPrice(convertedUnitPrice, selectedCurrency)} × {paxAdults} adult{paxAdults > 1 ? "s" : ""}
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

              {paymentStatus === "DISMISSED" || paymentStatus === "FAILED" ? (
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
    </div>
  );
}

export default AirportBookingFlow;
