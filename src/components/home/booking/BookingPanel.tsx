import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { airportApi, formatAirportOption } from "@/lib/api/airportApi";
import { getTransitCategory, getRouteFlightCategory, isIndianAirportCode, AIRPORT_REGISTRY } from "@/data/airportRegistry";
import { MultiServiceApi, type AirportServiceType } from "@/lib/api/multiServiceApi";
import { resolveOrderedJourneyTargets, type JourneyServiceTarget } from "@/lib/journey/multiServiceJourney";
import { IntelligentAirportAutocomplete } from "@/components/booking/shared/IntelligentAirportAutocomplete";
import {
  PlaneLanding,
  PlaneTakeoff,
  ChevronDown,
  CalendarDays,
  Users,
  Package, X,
  ArrowRight,
  Car,
  Ticket,
  ArrowRightLeft,
  Plane,
  Sparkles,
} from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { format, parseISO, isValid } from "date-fns";
import { mono, display } from "../theme";
import { DoublePlaneIcon } from "./DoublePlaneIcon";
import { OtherServicesEnquiryFlow, type OtherServiceType } from "./enquiry/OtherServicesEnquiryFlow";

const FIELD =
  "flex h-12 w-full items-center justify-between rounded-2xl border border-slate-300 bg-transparent px-4 text-xs font-semibold text-slate-900 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-none";
const DATE_BTN =
  "relative flex h-12 w-full items-center rounded-2xl border border-slate-300 bg-transparent pl-10 pr-4 text-left text-xs font-semibold text-slate-900 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-none";
const AIRPORT_INPUT =
  "h-12 w-full rounded-2xl border border-slate-300 bg-transparent pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-none";
const LABEL = "h-4 text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5";

export type BookingServiceMode = "airport" | "other";

export function BookingPanel() {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<BookingServiceMode>("airport");
  const [originCode, setOriginCode] = useState<string>("");
  const [destCode, setDestCode] = useState<string>("");
  const [transitCode, setTransitCode] = useState<string>("");
  const [originLabel, setOriginLabel] = useState<string>("");
  const [destLabel, setDestLabel] = useState<string>("");
  const [transitLabel, setTransitLabel] = useState<string>("");
  const [travelType, setTravelType] = useState<"domestic" | "international">("domestic");
  type BookingPanelService = "departure" | "arrival" | "connection";
  const [selectedServices, setSelectedServices] = useState<BookingPanelService[]>(["departure"]);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);
  const [bags, setBags] = useState(1);
  const [departDate, setDepartDate] = useState("");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [departDate2, setDepartDate2] = useState("");
  const [datePopoverOpen2, setDatePopoverOpen2] = useState(false);

  // Authoritative route classification derived dynamically from origin and destination
  const routeDeterminedCategory = useMemo<"domestic" | "international" | null>(() => {
    const o = originCode.trim().toUpperCase();
    const d = destCode.trim().toUpperCase();
    if (o.length === 3 && d.length === 3) {
      return getRouteFlightCategory(o, d);
    }
    if ((o.length === 3 && !isIndianAirportCode(o)) || (d.length === 3 && !isIndianAirportCode(d))) {
      return "international";
    }
    return null;
  }, [originCode, destCode]);

  // Restore Automatic Category Selection: recalculate whenever airports are selected or changed
  const prevRouteCatRef = useRef<string | null>(null);
  useEffect(() => {
    if (routeDeterminedCategory) {
      if (prevRouteCatRef.current && prevRouteCatRef.current !== routeDeterminedCategory) {
        const isIntl = routeDeterminedCategory === "international";
        toast.info(
          isIntl
            ? `International airport detected (${originCode || destCode}). Service category updated to International.`
            : `Domestic route detected (${originCode} → ${destCode}). Service category updated to Domestic.`
        );
      }
      prevRouteCatRef.current = routeDeterminedCategory;
      setTravelType(routeDeterminedCategory);
    }
  }, [routeDeterminedCategory, originCode, destCode]);

  const handleCategoryToggle = (kind: "domestic" | "international") => {
    if (routeDeterminedCategory && kind !== routeDeterminedCategory) {
      toast.info(
        `Category is automatically determined as ${routeDeterminedCategory} for your selected route (${originCode} → ${destCode}).`
      );
      return;
    }
    setTravelType(kind);
  };

  const toggleService = (srv: BookingPanelService) => {
    setSelectedServices((prev) => {
      if (prev.includes(srv)) {
        if (prev.length === 1) {
          toast.info("Please keep at least one airport service selected.");
          return prev;
        }
        return prev.filter((s) => s !== srv);
      }
      return [...prev, srv];
    });
  };

  const hasTransit = selectedServices.includes("connection");
  const hasDeparture = selectedServices.includes("departure");
  const hasArrival = selectedServices.includes("arrival");

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Field validation touched states
  const [, setTouched] = useState({
    departDate: false,
    departDate2: false,
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowPassengerModal(false);
        setDatePopoverOpen(false);
        setDatePopoverOpen2(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Reset touched validation markers when services change
  useEffect(() => {
    setTouched({
      departDate: false,
      departDate2: false,
    });
  }, [selectedServices]);

  const dateValue = departDate && isValid(new Date(departDate)) ? parseISO(departDate) : undefined;
  const dateValue2 =
    departDate2 && isValid(new Date(departDate2)) ? parseISO(departDate2) : undefined;

  const isSameOriginDest =
    originCode.trim().length === 3 &&
    destCode.trim().length === 3 &&
    originCode.trim().toUpperCase() === destCode.trim().toUpperCase();

  const isSameTransit =
    hasTransit &&
    transitCode.trim().length === 3 &&
    (transitCode.trim().toUpperCase() === originCode.trim().toUpperCase() ||
      transitCode.trim().toUpperCase() === destCode.trim().toUpperCase());

  const isFormValid =
    selectedServices.length > 0 &&
    originCode.trim().length === 3 &&
    destCode.trim().length === 3 &&
    !isSameOriginDest &&
    (!hasTransit || (transitCode.trim().length === 3 && !isSameTransit)) &&
    departDate !== "";

  const resolveAndNavigate = async (extra: Record<string, unknown> = {}) => {
    if (selectedServices.length === 0) {
      toast.error("Please select at least one airport service.");
      return false;
    }
    if (isSameOriginDest) {
      toast.error("Origin and destination airports cannot be the same. Please select distinct airports.");
      return false;
    }
    if (isSameTransit) {
      toast.error("Transit hub cannot match your origin or destination airport.");
      return false;
    }

    const transitCategory =
      hasTransit ? getTransitCategory(originCode, destCode) : undefined;
    const mappedServiceTypes: AirportServiceType[] = selectedServices.map((s) =>
      s === "departure" ? "DEPARTURE" : s === "arrival" ? "ARRIVAL" : "TRANSIT"
    );
    const servicesParam = mappedServiceTypes.join(",");

    // Resolve service targets in canonical order: DEPARTURE -> TRANSIT -> ARRIVAL
    const orderedTargets = resolveOrderedJourneyTargets(
      mappedServiceTypes,
      originCode,
      destCode,
      transitCode
    );

    const existingFlightNumber = (extra?.flight_number || extra?.flight_num || extra?.flightNumber) as string | undefined;
    const existingFlightNumber2 = (extra?.flight_number_2 || extra?.flight_num_2 || extra?.flightNumber2) as string | undefined;

    // Call MultiServiceApi to check availability across the complete itinerary
    let availResponse: any = null;
    let apiError: any = null;
    try {
      availResponse = await MultiServiceApi.checkAvailability({
        origin_code: originCode,
        dest_code: destCode,
        transit_codes: transitCode ? [transitCode] : undefined,
        flight_num: existingFlightNumber || undefined,
        flight_date: departDate || undefined,
        service_date: departDate || undefined,
        guest_count: adults,
        flight_type: travelType.toUpperCase(),
        selected_services: mappedServiceTypes.map((st) => ({
          service_type: st,
          airport_code: st === "DEPARTURE" ? originCode : st === "ARRIVAL" ? destCode : transitCode,
        })),
      });
    } catch (err: any) {
      console.warn("[BookingPanel] MultiServiceApi check error:", err);
      apiError = err;
    }

    if (apiError) {
      console.warn("[BookingPanel] MultiServiceApi check failed, falling back to service coverage registry:", apiError);
    }

    // Determine available targets (status === "AVAILABLE" and is_airport_supported, or present in AIRPORT_REGISTRY)
    const availableTargets: Array<{ target: JourneyServiceTarget; item?: any }> = [];
    for (const target of orderedTargets) {
      if (availResponse && availResponse.services && availResponse.services.length > 0) {
        const item = availResponse.services.find(
          (s: any) =>
            s.service_type === target.serviceType &&
            s.airport_code.toUpperCase() === target.airportCode.toUpperCase()
        );
        if (item) {
          if (item.status === "AVAILABLE" && item.is_airport_supported) {
            availableTargets.push({ target, item });
          }
          // If status === "REQUEST_REQUIRED", skip package selection for this target
          continue;
        }
      }
      // Fallback: check database and service coverage configuration
      if (AIRPORT_REGISTRY[target.airportCode]) {
        availableTargets.push({ target });
      }
    }

    const firstAvailable = availableTargets[0]?.target;
    const isAnyAvailable = Boolean(firstAvailable);

    const intent = {
      services: servicesParam,
      airport: firstAvailable ? firstAvailable.airportCode : (hasDeparture ? originCode : hasArrival ? destCode : transitCode),
      origin: originCode,
      destination: destCode,
      transit: transitCode || undefined,
      booking_mode: "package",
      depart_date: departDate,
      depart_date_2: departDate2 || undefined,
      flight_number: existingFlightNumber || undefined,
      flight_number_2: existingFlightNumber2 || undefined,
      direction: firstAvailable ? firstAvailable.direction : (hasDeparture ? "departure" : hasArrival ? "arrival" : "transit"),
      travel_type: travelType,
      flight_type: travelType,
      transit_type: transitCategory,
      pax_adults: adults,
      pax_children: childrenCount,
      pax_infants: infants,
      from_hero: "true",
      source: "booking_panel",
      packages_by_service: {},
      services_availability: availResponse?.services || [],
      ...extra,
    };

    try {
      sessionStorage.setItem("shafsky_booking_intent", JSON.stringify(intent));
    } catch {
      // ignore quota / private mode
    }

    if (isAnyAvailable && firstAvailable) {
      // Redirect to the first available service's airport catalog page
      navigate({
        to: "/airports/$code",
        params: { code: firstAvailable.airportCode },
        hash: "available-services",
        search: intent as any,
      });
    } else {
      // None of the selected airports are supported for instant online booking:
      // Navigate directly to /book for concierge service arrangement request
      navigate({
        to: "/book",
        search: intent as any,
      });
    }
    return true;
  };

  const handleContinueToPackages = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setTouched({
        departDate: true,
        departDate2: true,
      });
      if (selectedServices.length === 0) {
        toast.error("Please select at least one airport service.");
        return;
      }
      if (!originCode || originCode.trim().length !== 3) {
        toast.error("Please select a departure airport.");
        return;
      }
      if (!destCode || destCode.trim().length !== 3) {
        toast.error("Please select an arrival airport.");
        return;
      }
      if (isSameOriginDest) {
        toast.error("Origin and destination airports cannot be the same.");
        return;
      }
      if (hasTransit && (!transitCode || transitCode.trim().length !== 3)) {
        toast.error("Please select a transit airport.");
        return;
      }
      if (isSameTransit) {
        toast.error("Transit hub cannot match your origin or destination airport.");
        return;
      }
      if (!departDate) {
        toast.error("Please select your travel date.");
        return;
      }
      toast.error("Please complete all required booking details.");
      return;
    }
    try {
      await resolveAndNavigate();
    } catch (err: any) {
      console.error("[BookingPanel] Navigation error:", err);
      toast.error(err?.message || "Failed to proceed with booking. Please try again.");
    }
  };

  const serviceOptions: [BookingPanelService, string, React.ComponentType<{ className?: string }>][] = [
    ["departure", "Departure", PlaneTakeoff],
    ["arrival", "Arrival", PlaneLanding],
    ["connection", "Transit", DoublePlaneIcon],
  ];

  const totalPax = adults + childrenCount + infants;

  return (
    <section id="book" className="relative mt-6 sm:mt-10 mb-16 sm:mb-24 md:mb-28 px-4 sm:px-8 md:px-14">
      <motion.div
        initial={{ opacity: 0, y: 35, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-[960px] rounded-[2rem] bg-transparent border-2 border-slate-200 shadow-sm z-20 overflow-hidden"
      >
        {/* Header Title */}
        <div className="px-6 pt-6 pb-4 md:px-10 md:pt-8 md:pb-5 bg-transparent text-center border-b border-slate-200">
          <motion.h2
            key={activeMode}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-center text-lg sm:text-xl font-bold text-slate-950 tracking-tight"
            style={display}
          >
            {activeMode === "airport" ? "Book Airport Service" : "Other Services Enquiry"}
          </motion.h2>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Top Control Bar: Domestic/International (Upper) + Direction & Service Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            {/* Domestic / International Toggle (Upper on Mobile) */}
            <div className="flex items-center p-1 rounded-2xl bg-transparent border border-slate-200 self-start sm:self-auto w-full sm:w-auto">
              {(["domestic", "international"] as const).map((kind) => {
                const active = travelType === kind;
                const isLockedOut = Boolean(routeDeterminedCategory && kind !== routeDeterminedCategory);
                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => {
                      if (activeMode !== "airport") setActiveMode("airport");
                      handleCategoryToggle(kind);
                    }}
                    className={`relative z-10 flex-1 sm:flex-initial h-9 sm:px-4 text-[10.5px] font-bold uppercase tracking-[0.14em] outline-none transition-all duration-200 rounded-xl ${
                      active && activeMode === "airport"
                        ? "text-white bg-slate-950 shadow-xs cursor-default"
                        : isLockedOut
                          ? "text-slate-400 opacity-60 cursor-not-allowed hover:bg-slate-100/30"
                          : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/50 cursor-pointer"
                    }`}
                    style={mono}
                  >
                    <span>{kind}</span>
                  </button>
                );
              })}
            </div>

            {/* Service Selection: Departure, Transit, Arrival + Other Services */}
            <div className="flex items-center p-1 rounded-2xl bg-transparent border border-slate-200 overflow-x-auto no-scrollbar">
              {serviceOptions.map(([k, label, Icon]) => {
                const active = activeMode === "airport" && selectedServices.includes(k);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      if (activeMode !== "airport") {
                        setActiveMode("airport");
                        setSelectedServices([k]);
                      } else {
                        toggleService(k);
                      }
                    }}
                    className={`relative z-10 flex flex-1 sm:flex-initial h-9 sm:px-4 items-center justify-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] outline-none transition-all duration-200 cursor-pointer rounded-xl ${
                      active
                        ? "text-white max-md:bg-[#6e22db] md:text-slate-950 md:bg-[#84cc16] font-bold shadow-xs"
                        : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/50"
                    }`}
                    style={mono}
                  >
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-white md:text-slate-950" : "text-slate-500"}`} />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}

              {/* Other Services Option alongside Departure, Transit, Arrival */}
              <button
                type="button"
                onClick={() => setActiveMode("other")}
                className={`relative z-10 flex flex-1 sm:flex-initial h-9 sm:px-4 items-center justify-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] outline-none transition-all duration-200 cursor-pointer rounded-xl ${
                  activeMode === "other"
                    ? "text-white max-md:bg-[#6e22db] md:text-slate-950 md:bg-[#84cc16] font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/50"
                }`}
                style={mono}
              >
                <Sparkles className={`h-3.5 w-3.5 shrink-0 ${activeMode === "other" ? "text-white md:text-slate-950" : "text-lime-600"}`} />
                <span className="truncate">Other Services</span>
              </button>
            </div>
          </div>

          {activeMode === "other" ? (
            <OtherServicesEnquiryFlow
              initialOrigin={originLabel || originCode}
              initialDestination={destLabel || destCode}
              initialDate={departDate}
              initialPax={totalPax}
              onBackToAirport={() => setActiveMode("airport")}
            />
          ) : (
            <>

          {/* Form Inputs Grid */}
          <motion.div
            key={`booking-form-grid-${selectedServices.join("-")}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`grid gap-4 sm:gap-5 ${
              hasTransit
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2"
            }`}
          >
            {/* Origin Airport */}
            <div className="flex flex-col gap-1.5">
              <label className={LABEL}>
                <span>Origin Airport</span>
                <span className="text-lime-600 font-bold">*</span>
              </label>
              <IntelligentAirportAutocomplete
                key="origin-global"
                mode="global"
                value={originLabel || originCode}
                inputClassName={AIRPORT_INPUT}
                onSelect={(ap) => {
                  setOriginCode(ap.code);
                  setOriginLabel(formatAirportOption(ap));
                }}
                placeholder={hasDeparture ? "Search departure origin" : "Search origin airport"}
              />
            </div>

            {/* Transit Hub (Only if transit/connection selected) */}
            {hasTransit && (
              <div className="flex flex-col gap-1.5">
                <label className={LABEL}>
                  <span>Transit Hub</span>
                  <span className="text-lime-600 font-bold">*</span>
                </label>
                <IntelligentAirportAutocomplete
                  key="transit-global"
                  mode="global"
                  journeyType="TRANSIT"
                  value={transitLabel || transitCode}
                  inputClassName={AIRPORT_INPUT}
                  onSelect={(ap) => {
                    setTransitCode(ap.code);
                    setTransitLabel(formatAirportOption(ap));
                  }}
                  placeholder="Search transit hub"
                />
                {isSameTransit && (
                  <span className="text-[11px] font-mono text-rose-500 font-medium">
                    Transit hub cannot match origin or destination.
                  </span>
                )}
              </div>
            )}

            {/* Destination Airport */}
            <div className="flex flex-col gap-1.5">
              <label className={LABEL}>
                <span>Destination Airport</span>
                <span className="text-lime-600 font-bold">*</span>
              </label>
              <IntelligentAirportAutocomplete
                key="dest-global"
                mode="global"
                value={destLabel || destCode}
                inputClassName={AIRPORT_INPUT}
                onSelect={(ap) => {
                  setDestCode(ap.code);
                  setDestLabel(formatAirportOption(ap));
                }}
                placeholder={hasArrival ? "Search arrival destination" : "Search destination airport"}
              />
              {isSameOriginDest && (
                <span className="text-[11px] font-mono text-rose-500 font-medium">
                  Destination cannot be the same as departure airport.
                </span>
              )}
            </div>

            {/* Flight Date (or Inbound Date for connection) */}
            <div className="flex flex-col gap-1.5">
              <label className={LABEL}>
                <span>{hasTransit ? "Inbound Date" : "Flight Date"}</span>
                <span className="text-lime-600 font-bold">*</span>
              </label>
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <button type="button" className={`${DATE_BTN} cursor-pointer`}>
                    <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-lime-600" />
                    <span className="truncate">
                      {dateValue ? format(dateValue, "dd MMMM yyyy") : "Select travel date"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.12),0_0_30px_rgba(132,204,22,0.15)] rounded-3xl" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={dateValue}
                    onSelect={(d) => {
                      if (d) {
                        setDepartDate(format(d, "yyyy-MM-dd"));
                        setDatePopoverOpen(false);
                      }
                    }}
                    disabled={{ before: todayStart }}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Outbound Date (Only if connection) */}
            {hasTransit && (
              <div className="flex flex-col gap-1.5">
                <label className={LABEL}>
                  <span>Outbound Date</span>
                </label>
                <Popover open={datePopoverOpen2} onOpenChange={setDatePopoverOpen2}>
                  <PopoverTrigger asChild>
                    <button type="button" className={`${DATE_BTN} cursor-pointer`}>
                      <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-lime-600" />
                      <span className="truncate">
                        {dateValue2 ? format(dateValue2, "dd MMMM yyyy") : "Same / Next Day"}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.12),0_0_30px_rgba(132,204,22,0.15)] rounded-3xl" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={dateValue2}
                      onSelect={(d) => {
                        if (d) {
                          setDepartDate2(format(d, "yyyy-MM-dd"));
                          setDatePopoverOpen2(false);
                        }
                      }}
                      disabled={{ before: dateValue || todayStart }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Passengers & Luggage */}
            <div className="flex flex-col gap-1.5">
              <label className={LABEL}>
                <span>Passengers & Luggage</span>
              </label>
              <Popover open={showPassengerModal} onOpenChange={setShowPassengerModal}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`${FIELD} cursor-pointer normal-case`}
                  >
                    <span className="truncate flex items-center gap-2">
                      <Users size={15} className="text-lime-600" />
                      <span>
                        {totalPax} {totalPax === 1 ? "Passenger" : "Passengers"}
                      </span>
                      <span className="text-slate-300">•</span>
                      <Package size={15} className="text-lime-600" />
                      <span>
                        {bags} {bags === 1 ? "Bag" : "Bags"}
                      </span>
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${showPassengerModal ? "rotate-180" : ""}`}
                    />
                  </button>
                </PopoverTrigger>

                <PopoverContent className="w-80 p-5 bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.12),0_0_30px_rgba(132,204,22,0.15)] rounded-3xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900" style={mono}>
                        Passengers & Luggage Details
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPassengerModal(false)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Adult */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-900">Adult</span>
                        <span className="text-[10px] text-slate-500">12+ years</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          disabled={adults <= 1}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 text-sm font-semibold transition hover:bg-white disabled:opacity-30 cursor-pointer shadow-2xs"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-slate-900">
                          {adults}
                        </span>
                        <button
                          type="button"
                          onClick={() => setAdults(adults + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 text-sm font-semibold transition hover:bg-white cursor-pointer shadow-2xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Child */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-900">Child</span>
                        <span className="text-[10px] text-slate-500">2 - 12 years</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                          disabled={childrenCount <= 0}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 text-sm font-semibold transition hover:bg-white disabled:opacity-30 cursor-pointer shadow-2xs"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-slate-900">
                          {childrenCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setChildrenCount(childrenCount + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 text-sm font-semibold transition hover:bg-white cursor-pointer shadow-2xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Infant */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-900">Infant</span>
                        <span className="text-[10px] text-slate-500">Under 2 years</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setInfants(Math.max(0, infants - 1))}
                          disabled={infants <= 0}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 text-sm font-semibold transition hover:bg-white disabled:opacity-30 cursor-pointer shadow-2xs"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-slate-900">
                          {infants}
                        </span>
                        <button
                          type="button"
                          onClick={() => setInfants(infants + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 text-sm font-semibold transition hover:bg-white cursor-pointer shadow-2xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Luggage */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-900">Luggage Bags</span>
                        <span className="text-[10px] text-slate-500">Checked luggage</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setBags(Math.max(0, bags - 1))}
                          disabled={bags <= 0}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 text-sm font-semibold transition hover:bg-white disabled:opacity-30 cursor-pointer shadow-2xs"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-slate-900">
                          {bags}
                        </span>
                        <button
                          type="button"
                          onClick={() => setBags(bags + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 text-sm font-semibold transition hover:bg-white cursor-pointer shadow-2xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </motion.div>

          {/* Bottom Bar: Central Super CTA */}
          <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-4">

            <button
              type="button"
              onClick={handleContinueToPackages}
              className="group/btn relative overflow-hidden w-full sm:w-auto min-w-[220px] inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r max-sm:from-[#6e22db] max-sm:via-[#7c3aed] max-sm:to-[#6e22db] max-sm:text-white max-sm:shadow-[0_10px_30px_rgba(110,34,219,0.35)] sm:from-[#84cc16] sm:via-[#9ee838] sm:to-[#84cc16] sm:text-slate-950 sm:shadow-[0_10px_30px_rgba(132,204,22,0.45),inset_0_1px_2px_rgba(255,255,255,0.75)] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-[0_15px_40px_rgba(110,34,219,0.45)] hover:-translate-y-0.5 cursor-pointer"
              style={mono}
            >
              <div className="absolute inset-0 w-[200%] -translate-x-[150%] bg-gradient-to-r from-transparent via-white/60 to-transparent group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 font-extrabold drop-shadow-2xs">Book Now</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </button>
          </div>
            </>
          )}
        </div>
      </motion.div>
    </section>
  );
}
