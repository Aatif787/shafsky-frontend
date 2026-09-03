import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
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
  CreditCard,
  Lock,
  RefreshCw,
  PhoneCall,
  MessageSquare,
} from "lucide-react";
import { ApiClient } from "@/lib/ApiClient";
import { getAirportRegistryEntry } from "@/data/airportRegistry";
import { AirlineLogo } from "./shared/AirlineLogo";
import { IntelligentAirlineAutocomplete } from "./shared/IntelligentAirlineAutocomplete";
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

export function AirportBookingFlow({ searchParams }: AirportBookingFlowProps) {
  const navigate = useNavigate();

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

  const [airportCode, setAirportCode] = useState<string>(rawAirportCode);
  const [direction, setDirection] = useState<"arrival" | "departure" | "transit">(initialDirection);
  const [travelType, setTravelType] = useState<"domestic" | "international">(initialTravelType);

  const registryEntry = getAirportRegistryEntry(airportCode);
  const airportCityName = searchParams?.airport_name || registryEntry?.city || registryEntry?.name || airportCode;

  const initialOrigin = extractIata(searchParams?.origin) || (direction === "departure" ? airportCode : "");
  const initialDestination = extractIata(searchParams?.destination) || (direction === "arrival" ? airportCode : "");

  const [originCode, setOriginCode] = useState<string>(initialOrigin);
  const [destCode, setDestCode] = useState<string>(initialDestination);

  const serviceDate = searchParams?.depart_date || searchParams?.service_date || new Date().toISOString().split("T")[0];

  const paxAdults = Math.max(1, Number(searchParams?.pax_adults) || 1);
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

  // Multi-Currency State & Live Conversion
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => detectDefaultCurrency());

  const numericUnitPrice = useMemo(() => {
    const p = Number(String(selectedPackagePrice).replace(/[^0-9.]/g, ""));
    if (p > 0) return p;
    const id = (selectedPackageId || "").toLowerCase();
    if (id.includes("platinum") || id.includes("elite")) return 9500;
    if (id.includes("gold") || id.includes("meet")) return 5500;
    if (id.includes("silver") || id.includes("basic")) return 3500;
    return 5500;
  }, [selectedPackagePrice, selectedPackageId]);

  const totalPrice = numericUnitPrice * totalPax;
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

  // Passenger & Contact State
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [showNotes, setShowNotes] = useState<boolean>(false);

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
              scheduledTime: flightObj?.departure?.scheduled || flightObj?.departure?.scheduledTime || null,
              terminal: flightObj?.departure?.terminal || null,
              gate: flightObj?.departure?.gate || null,
              timezone: flightObj?.departure?.timezone || null,
            },
            arrival: {
              scheduledTime: flightObj?.arrival?.scheduled || flightObj?.arrival?.scheduledTime || null,
              terminal: flightObj?.arrival?.terminal || null,
              gate: flightObj?.arrival?.gate || null,
              timezone: flightObj?.arrival?.timezone || null,
            },
          };

          // Strict Airport Mismatch Verification
          const selectedServiceAirport = (airportCode || "").trim().toUpperCase();
          const flOrigin = (flightData.origin?.code || "").trim().toUpperCase();
          const flDest = (flightData.destination?.code || "").trim().toUpperCase();

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

          // Check if flight is International:
          // 1. Origin or destination country is not IN
          // 2. Or flight type is INTERNATIONAL
          // 3. Or travelType was already selected as international
          const depCountry = (flightData.origin?.country || "").toUpperCase();
          const arrCountry = (flightData.destination?.country || "").toUpperCase();
          const isOriginIntl = Boolean(depCountry && depCountry !== "IN" && depCountry !== "INDIA");
          const isDestIntl = Boolean(arrCountry && arrCountry !== "IN" && arrCountry !== "INDIA");
          const isFlightTypeIntl = String(flightObj?.flight_type || flightObj?.travel_type || "").toUpperCase() === "INTERNATIONAL";
          const isDetectedIntl = isOriginIntl || isDestIntl || isFlightTypeIntl || travelType === "international";

          if (isDetectedIntl) {
            setTravelType("international");
          }

          // Rule: If Delhi (DEL) and International, ALWAYS Terminal 3
          if (selectedServiceAirport === "DEL" && isDetectedIntl) {
            if (flightData.departure && (flOrigin === "DEL" || direction === "departure")) {
              flightData.departure.terminal = "3";
            }
            if (flightData.arrival && (flDest === "DEL" || direction === "arrival")) {
              flightData.arrival.terminal = "3";
            }
            setManualDepTerminal("3");
            setManualArrTerminal("3");
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
  const handleProceedToPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 1. Validate Passenger Info
    const cleanName = fullName.trim();
    if (!cleanName || cleanName.length < 2) {
      toast.error("Please enter the lead passenger's full name.");
      return;
    }

    const cleanEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailPattern.test(cleanEmail)) {
      toast.error("Please enter a valid email address for booking confirmation.");
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("Please enter a valid contact mobile number.");
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
    const cleanOrigin = originCode || airportCode;
    const cleanDest = destCode || airportCode;

    const depClock = isFlightVerified && verifiedFlight?.departure?.scheduledTime
      ? verifiedFlight.departure.scheduledTime
      : `${serviceDate}T${manualDepTime || "10:00"}:00`;

    const arrClock = isFlightVerified && verifiedFlight?.arrival?.scheduledTime
      ? verifiedFlight.arrival.scheduledTime
      : `${serviceDate}T${manualArrTime || "12:30"}:00`;

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
            flight_type: travelType.toUpperCase(),
            travel_type: travelType.toUpperCase(),
            service_airport: airportCode.toUpperCase(),
            terminal: terminalVal || undefined,
            pax_adults: paxAdults,
            pax_children: paxChildren,
            pax_infants: paxInfants,
            guest_count: totalPax,
            package: packageSlug,
            unit_price: convertedUnitPrice,
            currency: selectedCurrency,
            base_inr_price: baseInrTotalPrice,
          },
          departureTime: depClock,
          arrivalTime: arrClock,
          totalAmount: convertedTotalPrice,
          currency: selectedCurrency,
          notes: specialRequests || `Airport: ${airportCode}, Direction: ${direction}`,
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

      // 5. Open Official Razorpay Checkout Modal (Multi-Currency & Global Cards / Apple Pay)
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

              {/* Verified Flight Card */}
              {isFlightVerified && verifiedFlight && (
                <div className="rounded-2xl border border-lime-400 bg-lime-50/40 p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 p-1">
                        <AirlineLogo iata={verifiedFlight.carrier.iata} />
                      </div>
                      <div>
                        <span className="font-bold text-slate-950 font-sans block text-sm">
                          {verifiedFlight.carrier.name} ({verifiedFlight.carrier.iata})
                        </span>
                        <span className="font-mono text-xs font-extrabold text-slate-900">
                          {verifiedFlight.flightNum}
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full bg-lime-500 px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider text-slate-950 flex items-center gap-1">
                      <Check size={12} />
                      Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-lime-200/80 pt-3 text-xs">
                    <div>
                      <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block">
                        Departure
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {verifiedFlight.origin.code || originCode}
                      </span>
                      {verifiedFlight.departure.scheduledTime && (
                        <span className="text-[11px] text-slate-600 block font-mono">
                          {verifiedFlight.departure.scheduledTime.slice(11, 16) || verifiedFlight.departure.scheduledTime}
                        </span>
                      )}
                      {verifiedFlight.departure.terminal && (
                        <span className="text-[10px] text-slate-500 block font-mono">
                          Terminal {verifiedFlight.departure.terminal}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block">
                        Arrival
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {verifiedFlight.destination.code || destCode}
                      </span>
                      {verifiedFlight.arrival.scheduledTime && (
                        <span className="text-[11px] text-slate-600 block font-mono">
                          {verifiedFlight.arrival.scheduledTime.slice(11, 16) || verifiedFlight.arrival.scheduledTime}
                        </span>
                      )}
                      {verifiedFlight.arrival.terminal && (
                        <span className="text-[10px] text-slate-500 block font-mono">
                          Terminal {verifiedFlight.arrival.terminal}
                        </span>
                      )}
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
                      <input
                        type="time"
                        value={manualDepTime}
                        onChange={(e) => setManualDepTime(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-xs font-bold text-slate-900"
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
                      <input
                        type="time"
                        value={manualArrTime}
                        onChange={(e) => setManualArrTime(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-xs font-bold text-slate-900"
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
            <h2 className="font-serif text-lg font-bold text-slate-900">Passenger Information</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-[10px] font-bold text-slate-700">
              {totalPax} Passenger{totalPax > 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className="h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3.5 font-mono text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none"
              />
            </div>
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
        </div>

        {/* ========================================================================= */}
        {/* 3. BOOKING SUMMARY & PAYMENT ACTION (RAZORPAY MULTI-CURRENCY INTEGRATION) */}
        {/* ========================================================================= */}
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-bold text-slate-900">Booking & Price Summary</h3>
              <span className="font-mono text-[10px] uppercase tracking-wider text-lime-700 font-bold bg-lime-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <Lock size={11} />
                Secure Checkout
              </span>
            </div>

            {/* Luxury Multi-Currency Switcher */}
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Currency:
              </span>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-2.5 py-1 text-xs font-mono font-bold text-slate-900 focus:border-lime-500 focus:outline-none cursor-pointer shadow-2xs"
              >
                {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.symbol.trim()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block">
                Service Package
              </span>
              <span className="font-bold text-slate-900 block truncate">
                {selectedPackageName}
              </span>
            </div>

            <div>
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block">
                Airport & Type
              </span>
              <span className="font-bold text-slate-900 block truncate">
                {airportCode} • {direction}
              </span>
            </div>

            <div>
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block">
                Flight & Date
              </span>
              <span className="font-mono font-bold text-slate-900 block truncate">
                {isFlightVerified && verifiedFlight
                  ? verifiedFlight.flightNum
                  : manualFlightNum || flightNumber || "—"}
              </span>
              <span className="font-mono text-[10px] text-slate-500 block">
                {serviceDate}
              </span>
            </div>

            <div>
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block">
                Name
              </span>
              <span className="font-bold text-slate-900 block truncate">
                {fullName || "—"}
              </span>
              <span className="text-[10px] font-mono text-slate-500 block">
                {totalPax} Passenger{totalPax > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                Payable Amount
              </span>
              <div className="font-mono text-xl sm:text-2xl font-black text-slate-950">
                {formatPrice(convertedTotalPrice, selectedCurrency)}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                ({formatPrice(convertedUnitPrice, selectedCurrency)} × {totalPax} Passenger{totalPax > 1 ? "s" : ""}, all taxes included)
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-600 text-xs font-mono">
              <CreditCard size={16} className="text-lime-700" />
              <span>UPI • Global Cards • Apple Pay</span>
            </div>
          </div>

          {/* Payment CTA Banner & Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-lime-600 shrink-0" />
              <span>Instant confirmation & 256-bit encrypted payment via Razorpay.</span>
            </div>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2.5">
              {paymentStatus === "DISMISSED" || paymentStatus === "FAILED" ? (
                <button
                  type="button"
                  onClick={handleRetryPayment}
                  disabled={submitting}
                  className="w-full sm:w-auto min-w-[220px] inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 px-8 py-3.5 text-xs font-mono font-extrabold uppercase tracking-widest text-slate-950 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-slate-950" />
                      <span>Opening Payment...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={15} />
                      <span>Retry Payment ({formatPrice(convertedTotalPrice, selectedCurrency)})</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto min-w-[220px] inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-lime-500 via-lime-400 to-lime-500 px-8 py-3.5 text-xs font-mono font-extrabold uppercase tracking-widest text-slate-950 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-slate-950" />
                      <span>Opening Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      <span>Pay {formatPrice(convertedTotalPrice, selectedCurrency)} & Confirm</span>
                      <ArrowRight size={16} />
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
