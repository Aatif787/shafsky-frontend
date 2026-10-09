import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ApiClient } from "@/lib/ApiClient";
import { MultiServiceApi, AirportServiceType, MultiServiceAvailabilityResponse } from "@/lib/api/multiServiceApi";
import { loadRazorpayScript } from "@/lib/razorpay";
import { toRazorpayContact, normalizePhoneForStorage } from "../../validation/sharedValidation";
import { getTransitCategory } from "@/data/airportRegistry";
import { FlightData } from "@/services/flight/FlightTypes";
import { PassengerDetail, PaymentStatus } from "../types";
import { sanitizeFlightInput, buildAnchoredServiceClock } from "../utils";

interface UseAirportPaymentProps {
  passengers: PassengerDetail[];
  fullName: string;
  age: string;
  phone: string;
  email: string;
  specialRequests: string;
  direction: "arrival" | "departure" | "transit";
  airportCode: string;
  originCode: string;
  destCode: string;
  transitCode: string;
  serviceDate: string;
  serviceDate2: string;
  selectedPackageId: string;
  selectedPackageName: string;
  travelType: "domestic" | "international";
  selectedServices: AirportServiceType[];
  packageByService: Record<AirportServiceType, string>;
  multiServiceResponse: MultiServiceAvailabilityResponse | null;
  selectedCurrency: string;
  convertedUnitPrice: number;
  convertedTotalPrice: number;
  baseInrTotalPrice: number;
  convertedExpressFee: number;
  paxAdults: number;
  paxChildren: number;
  paxInfants: number;
  totalPax: number;
  showGst: boolean;
  gstCompanyName: string;
  gstNumber: string;
  gstBillingAddress: string;
  searchParams?: Record<string, any>;

  // Flight 1
  isFlightVerified: boolean;
  verifiedFlight: FlightData | null;
  isManualMode: boolean;
  manualFlightNum: string;
  manualAirline: string;
  manualAirlineIata: string;
  flightNumber: string;
  manualDepTime: string;
  manualArrTime: string;
  manualDepTerminal: string;
  manualArrTerminal: string;

  // Flight 2
  isFlightVerified2: boolean;
  verifiedFlight2: FlightData | null;
  isManualMode2: boolean;
  manualFlightNum2: string;
  manualAirline2: string;
  manualAirlineIata2: string;
  flightNumber2: string;
  manualDepTime2: string;
  manualArrTime2: string;
  manualDepTerminal2: string;
  manualArrTerminal2: string;

  setIsCutoffUrgent: (val: boolean) => void;
}

export function useAirportPayment({
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

  isFlightVerified,
  verifiedFlight,
  isManualMode,
  manualFlightNum,
  manualAirline,
  manualAirlineIata,
  flightNumber,
  manualDepTime,
  manualArrTime,
  manualDepTerminal,
  manualArrTerminal,

  isFlightVerified2,
  verifiedFlight2,
  isManualMode2,
  manualFlightNum2,
  manualAirline2,
  manualAirlineIata2,
  flightNumber2,
  manualDepTime2,
  manualArrTime2,
  manualDepTerminal2,
  manualArrTerminal2,

  setIsCutoffUrgent,
}: UseAirportPaymentProps) {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeBookingRef, setActiveBookingRef] = useState<string | null>(null);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("IDLE");
  const [isPaymentVerified, setIsPaymentVerified] = useState<boolean>(false);
  const [paymentTransactionId, setPaymentTransactionId] = useState<string | null>(null);
  const [confirmedBookingRef, setConfirmedBookingRef] = useState<string | null>(null);

  const [isArrangementSubmitting, setIsArrangementSubmitting] = useState<boolean>(false);
  const [arrangementSubmitted, setArrangementSubmitted] = useState<boolean>(false);
  const [serviceQuerySuccessRef, setServiceQuerySuccessRef] = useState<string | null>(null);

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
  const handleProceedToPayment = async (e?: React.FormEvent<HTMLFormElement> | React.FormEvent) => {
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
              airport_code: st === "DEPARTURE" ? cleanOrigin : st === "ARRIVAL" ? cleanDest : (transitCode || airportCode),
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
                airport_code: st === "DEPARTURE" ? cleanOrigin : st === "ARRIVAL" ? cleanDest : (transitCode || airportCode),
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
                    airport_code: st === "DEPARTURE" ? cleanOrigin : st === "ARRIVAL" ? cleanDest : (transitCode || airportCode),
                  })),
                  unavailable_services: unavail,
                  notes: `Linked concierge arrangement for paid booking ${bookingRefToUse}`,
                }).catch((qErr) => {
                  console.warn("[useAirportPayment] Failed to create linked service query:", qErr);
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
            console.error("[useAirportPayment] Payment verification error:", vErr);
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
      console.error("[useAirportPayment] Payment error:", err);
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
      console.error("[useAirportPayment] Retry error:", err);
      setSubmitting(false);
      setPaymentStatus("FAILED");
      setIsPaymentVerified(false);
      toast.error("Unable to reopen payment checkout. Please try again.");
    }
  };

  return {
    submitting,
    activeBookingRef,
    paymentToken,
    paymentStatus,
    isPaymentVerified,
    paymentTransactionId,
    confirmedBookingRef,
    isArrangementSubmitting,
    arrangementSubmitted,
    serviceQuerySuccessRef,
    handleRequestServiceArrangement,
    handleProceedToPayment,
    handleRetryPayment,
  };
}
