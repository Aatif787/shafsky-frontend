import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { airportApi, formatAirportOption } from "@/lib/api/airportApi";
import { IntelligentAirportAutocomplete } from "@/components/booking/shared/IntelligentAirportAutocomplete";
import {
  PlaneLanding,
  PlaneTakeoff,
  ChevronDown,
  CalendarDays,
  Users,
  Package,
  Crown,
  X,
  ArrowRight,
} from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { format, parseISO, isValid } from "date-fns";
import { C, mono, display } from "../theme";
import { DoublePlaneIcon } from "./DoublePlaneIcon";

const FIELD =
  "flex h-12 w-full items-center justify-between rounded-2xl border border-slate-300 bg-transparent px-4 text-xs font-semibold text-slate-900 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-none";
const DATE_BTN =
  "relative flex h-12 w-full items-center rounded-2xl border border-slate-300 bg-transparent pl-10 pr-4 text-left text-xs font-semibold text-slate-900 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-none";
const AIRPORT_INPUT =
  "h-12 w-full rounded-2xl border border-slate-300 bg-transparent pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-none";
const LABEL = "h-4 text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5";

export function BookingPanel() {
  const navigate = useNavigate();
  const [originCode, setOriginCode] = useState<string>("");
  const [destCode, setDestCode] = useState<string>("");
  const [transitCode, setTransitCode] = useState<string>("");
  const [originLabel, setOriginLabel] = useState<string>("");
  const [destLabel, setDestLabel] = useState<string>("");
  const [transitLabel, setTransitLabel] = useState<string>("");
  const [travelType, setTravelType] = useState<"domestic" | "international">("domestic");
  const [tab, setTab] = useState<"arrival" | "departure" | "connection">("departure");
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);
  const [bags, setBags] = useState(1);
  const [departDate, setDepartDate] = useState("");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [departDate2, setDepartDate2] = useState("");
  const [datePopoverOpen2, setDatePopoverOpen2] = useState(false);

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Field validation touched states
  const [touched, setTouched] = useState({
    flightNumber: false,
    departDate: false,
    flightNumber2: false,
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

  // Reset touched validation markers when tab changes
  useEffect(() => {
    setTouched({
      flightNumber: false,
      departDate: false,
      flightNumber2: false,
      departDate2: false,
    });
  }, [tab]);

  const dateValue = departDate && isValid(new Date(departDate)) ? parseISO(departDate) : undefined;
  const dateValue2 =
    departDate2 && isValid(new Date(departDate2)) ? parseISO(departDate2) : undefined;

  const isArrivalDepartureValid =
    originCode.trim().length === 3 &&
    destCode.trim().length === 3 &&
    departDate !== "";
  const isConnectionValid =
    originCode.trim().length === 3 &&
    destCode.trim().length === 3 &&
    transitCode.trim().length === 3 &&
    departDate !== "";

  const isFormValid = tab === "connection" ? isConnectionValid : isArrivalDepartureValid;

  const resolveAndNavigate = async (extra: Record<string, unknown> = {}) => {
    const journeyType = tab === "connection" ? "TRANSIT" : tab.toUpperCase();
    const res = await airportApi.resolveServiceAirport({
      journey_type: journeyType,
      origin: originCode,
      destination: destCode,
      transit: transitCode,
      flight_type: travelType,
    });
    if (!res.valid || !res.service_airport) {
      toast.error(res.error || "This airport is currently not supported for online booking.");
      return false;
    }
    const serviceAirport = String(res.service_airport).trim().toUpperCase();
    const derivedTravel = String(res.flight_type || travelType || "").toLowerCase();
    const travelForIntent =
      derivedTravel === "international" || derivedTravel === "domestic"
        ? derivedTravel
        : travelType;
    const intent = {
      airport: serviceAirport,
      airport_id: res.airport?.id,
      airport_name: res.airport?.name,
      origin: originCode,
      destination: destCode,
      transit: transitCode || undefined,
      booking_mode: "package",
      depart_date: departDate,
      direction: tab === "connection" ? "transit" : tab,
      travel_type: travelForIntent,
      flight_type: travelForIntent,
      pax_adults: adults,
      pax_children: childrenCount,
      pax_infants: infants,
      from_hero: "true",
      ...extra,
    };
    try {
      sessionStorage.setItem("shafsky_booking_intent", JSON.stringify(intent));
    } catch {
      // ignore quota / private mode
    }
    navigate({
      to: "/airports/$code",
      params: { code: serviceAirport },
      hash: "available-services",
      search: intent as any,
    });
    return true;
  };

  const handleContinueToPackages = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setTouched({
        flightNumber: true,
        departDate: true,
        flightNumber2: true,
        departDate2: true,
      });
      toast.error("Please select origin, destination, and travel date.");
      return;
    }
    await resolveAndNavigate();
  };

  const tabs: [typeof tab, string, React.ComponentType<{ className?: string }>][] = [
    ["departure", "Departure", PlaneTakeoff],
    ["arrival", "Arrival", PlaneLanding],
    ["connection", "Transit", DoublePlaneIcon],
  ];

  const totalPax = adults + childrenCount + infants;

  return (
    <section id="book" className="relative mt-6 sm:mt-10 mb-16 sm:mb-24 md:mb-28 px-4 sm:px-8 md:px-14">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-[960px] rounded-[2rem] bg-transparent border-2 border-slate-200 shadow-sm z-20 overflow-hidden"
      >
        {/* Header Title */}
        <div className="px-6 pt-6 pb-4 md:px-10 md:pt-8 md:pb-5 bg-transparent text-center border-b border-slate-200">
          <h2
            className="text-center text-lg sm:text-xl font-bold text-slate-950 tracking-tight"
            style={display}
          >
            Book your seamless VIP airport experience.
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Top Control Bar: Direction Tabs + Domestic/International */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            {/* Direction Tabs */}
            <div className="flex items-center p-1 rounded-2xl bg-transparent border border-slate-200">
              {tabs.map(([k, label, Icon]) => {
                const active = tab === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setTab(k)}
                    className={`relative z-10 flex flex-1 sm:flex-initial h-9 sm:px-4 items-center justify-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] outline-none transition-all duration-200 cursor-pointer rounded-xl ${
                      active
                        ? "text-slate-950 bg-[#84cc16] font-bold shadow-xs"
                        : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/50"
                    }`}
                    style={mono}
                  >
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-slate-950" : "text-slate-500"}`} />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Domestic / International Toggle */}
            <div className="flex items-center p-1 rounded-2xl bg-transparent border border-slate-200 self-start sm:self-auto w-full sm:w-auto">
              {(["domestic", "international"] as const).map((kind) => {
                const active = travelType === kind;
                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => setTravelType(kind)}
                    className={`relative z-10 flex-1 sm:flex-initial h-9 sm:px-4 text-[10.5px] font-bold uppercase tracking-[0.14em] outline-none transition-all duration-200 cursor-pointer rounded-xl ${
                      active
                        ? "text-white bg-slate-950 shadow-xs"
                        : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/50"
                    }`}
                    style={mono}
                  >
                    <span>{kind}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Inputs Grid */}
          <motion.div
            key={`booking-form-grid-${tab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`grid gap-4 sm:gap-5 ${
              tab === "connection"
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
                key={`origin-${tab}`}
                mode={tab === "departure" ? "supported" : "global"}
                journeyType={tab === "departure" ? "DEPARTURE" : undefined}
                value={originLabel || originCode}
                inputClassName={AIRPORT_INPUT}
                onSelect={(ap) => {
                  setOriginCode(ap.code);
                  setOriginLabel(formatAirportOption(ap));
                }}
                placeholder={tab === "departure" ? "Search departure hub" : "Search origin airport"}
              />
            </div>

            {/* Transit Hub (Only if connection) */}
            {tab === "connection" && (
              <div className="flex flex-col gap-1.5">
                <label className={LABEL}>
                  <span>Transit Hub</span>
                  <span className="text-lime-600 font-bold">*</span>
                </label>
                <IntelligentAirportAutocomplete
                  key="transit-supported"
                  mode="supported"
                  journeyType="TRANSIT"
                  value={transitLabel || transitCode}
                  inputClassName={AIRPORT_INPUT}
                  onSelect={(ap) => {
                    setTransitCode(ap.code);
                    setTransitLabel(formatAirportOption(ap));
                  }}
                  placeholder="Search transit hub"
                />
              </div>
            )}

            {/* Destination Airport */}
            <div className="flex flex-col gap-1.5">
              <label className={LABEL}>
                <span>Destination Airport</span>
                <span className="text-lime-600 font-bold">*</span>
              </label>
              <IntelligentAirportAutocomplete
                key={`dest-${tab}`}
                mode={tab === "arrival" ? "supported" : "global"}
                journeyType={tab === "arrival" ? "ARRIVAL" : undefined}
                value={destLabel || destCode}
                inputClassName={AIRPORT_INPUT}
                onSelect={(ap) => {
                  setDestCode(ap.code);
                  setDestLabel(formatAirportOption(ap));
                }}
                placeholder={tab === "arrival" ? "Search arrival hub" : "Search destination airport"}
              />
            </div>

            {/* Flight Date (or Inbound Date for connection) */}
            <div className="flex flex-col gap-1.5">
              <label className={LABEL}>
                <span>{tab === "connection" ? "Inbound Date" : "Flight Date"}</span>
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
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Outbound Date (Only if connection) */}
            {tab === "connection" && (
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
                <span>Party & Luggage</span>
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
                        {totalPax} {totalPax === 1 ? "Guest" : "Guests"}
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
                        Party & Luggage Details
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

          {/* Bottom Bar: Trust Indicators & Central Super CTA */}
          <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-[11px] text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="text-lime-600 font-bold">✓</span>
                <span>Dedicated Airside Officer</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-lime-600 font-bold">✓</span>
                <span>Verified DGCA Clearance</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-lime-600 font-bold">✓</span>
                <span>Priority Fast-Track</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleContinueToPackages}
              className="group/btn relative overflow-hidden w-full sm:w-auto min-w-[220px] inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#84cc16] via-[#9ee838] to-[#84cc16] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-950 shadow-[0_10px_30px_rgba(132,204,22,0.45),inset_0_1px_2px_rgba(255,255,255,0.75)] transition-all duration-300 hover:shadow-[0_15px_40px_rgba(132,204,22,0.6),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-0.5 cursor-pointer"
              style={mono}
            >
              <div className="absolute inset-0 w-[200%] -translate-x-[150%] bg-gradient-to-r from-transparent via-white/60 to-transparent group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 font-extrabold drop-shadow-2xs">Book Now</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
