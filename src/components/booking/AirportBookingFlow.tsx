import React, { useState, useEffect, useMemo } from "react";
import { format, parseISO, isValid } from "date-fns";
import {
  getAirportRegistryEntry,
  getRouteFlightCategory,
} from "@/data/airportRegistry";
import { formatPrice } from "@/lib/currency";

// Modular Airport Domain Components & Types
import { AirportBookingFlowProps } from "./airport/types";
import { extractIata } from "./airport/utils";
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
import { usePassengerDetails } from "./airport/hooks/usePassengerDetails";
import { useTerminalSelection } from "./airport/hooks/useTerminalSelection";
import { useMultiServicePackages } from "./airport/hooks/useMultiServicePackages";
import { useExpressFeeCalculation } from "./airport/hooks/useExpressFeeCalculation";

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
      ? rawOrigin && rawOrigin !== airportCode
        ? rawOrigin
        : ""
      : rawOrigin || (direction === "departure" ? airportCode : "");

  const initialDestination =
    direction === "departure"
      ? rawDest && rawDest !== airportCode
        ? rawDest
        : ""
      : rawDest || (direction === "arrival" ? airportCode : "");

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

  // 3. Passenger Details Hook
  const passengerDetails = usePassengerDetails({ searchParams });
  const {
    passengers,
    paxAdults,
    paxChildren,
    paxInfants,
    totalPax,
    handlePaxChange,
    updatePassenger,
    copyFromPassenger1,
    fullName,
    age,
    phone,
    email,
  } = passengerDetails;

  // 4. Multi-Service Packages & Catalog Availability Hook
  const multiServicePkg = useMultiServicePackages({
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
    selectedTerminal: "", // placeholder, updated via sync below
    serviceDate,
    flightNumber: flightVerification.flightNumber,
    paxAdults,
  });

  const {
    initialPkgId,
    selectedPackageId,
    setSelectedPackageId,
    selectedPackageName,
    setSelectedPackageName,
    selectedPackagePrice,
    setSelectedPackagePrice,
    availablePackages,
    isPackagesLoading,
    selectedServices,
    packageByService,
    setPackageByService,
    multiServiceAvailability,
    multiServiceResponse,
    selectedCurrency,
    setSelectedCurrency,
    numericUnitPrice,
    billablePax,
    baseInrTotalPrice,
    convertedUnitPrice,
    isArrangementOnly,
  } = multiServicePkg;

  // 5. Terminal Selection & Dynamic Upgrade Engine Hook
  const terminalSelection = useTerminalSelection({
    rawAirportCode,
    initialTravelType,
    searchParams,
    airportCode,
    cleanOrigin,
    originCode,
    cleanDest,
    destCode,
    direction,
    travelType,
    flightVerification,
    selectedPackageId,
    setSelectedPackageId,
    setSelectedPackageName,
    setSelectedPackagePrice,
    setPackageByService,
  });

  const {
    selectedTerminal,
    terminalNoticeDismissed,
    setTerminalNoticeDismissed,
    terminalMismatch,
    handleApplyTerminalSwitch,
  } = terminalSelection;

  // 6. Mumbai Airport Express Fee Hook
  const expressFeeHook = useExpressFeeCalculation({
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
  });

  const {
    expressFeeInr,
    isExpressFeeApplicable,
    expressFeeLabel,
    expressFeeNotice,
    totalPrice,
    convertedExpressFee,
    convertedTotalPrice,
  } = expressFeeHook;

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

  // 7. Payment & Security Lifecycle Hook
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
    const activeFlight =
      flightVerification.isFlightVerified && flightVerification.verifiedFlight
        ? `${flightVerification.verifiedFlight.flightNum} (${flightVerification.verifiedFlight.carrier.name || "Verified Flight"})`
        : flightVerification.isManualMode
        ? `${flightVerification.manualFlightNum} (${flightVerification.manualAirline || flightVerification.manualAirlineIata || "Airline"})`
        : flightVerification.flightNumber;

    const activeFlight1 = activeFlight;
    const activeFlight2 =
      flightVerification.isFlightVerified2 && flightVerification.verifiedFlight2
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
        selectedTerminal={selectedTerminal}
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
        <form
          onSubmit={isArrangementOnly ? paymentHook.handleRequestServiceArrangement : paymentHook.handleProceedToPayment}
          className="space-y-6"
        >
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
            />
          ) : (
            <DirectFlightDetailsSection
              direction={direction}
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
              routeMismatch={flightVerification.routeMismatch}
              setRouteMismatch={flightVerification.setRouteMismatch}
              confirmingRouteUpdate={flightVerification.confirmingRouteUpdate}
              setConfirmingRouteUpdate={flightVerification.setConfirmingRouteUpdate}
              handleKeepSelectedRoute={flightVerification.handleKeepSelectedRoute}
              handleUseFlightRoute={flightVerification.handleUseFlightRoute}
              terminalMismatch={terminalMismatch}
              handleApplyTerminalSwitch={handleApplyTerminalSwitch}
              terminalNoticeDismissed={terminalNoticeDismissed}
              setTerminalNoticeDismissed={setTerminalNoticeDismissed}
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
            expressFeeLabel={expressFeeLabel}
            expressFeeNotice={expressFeeNotice}
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
