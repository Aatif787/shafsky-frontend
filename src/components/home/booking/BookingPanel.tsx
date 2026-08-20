import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { airportApi, formatAirportOption } from "@/lib/api/airportApi";
import { IntelligentAirportAutocomplete } from "@/components/booking/shared/IntelligentAirportAutocomplete";
import {
  PlaneLanding,
  PlaneTakeoff,
  ChevronDown,
  Users,
  Package,
  Crown,
  X,
  ArrowRight,
} from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { format, parseISO, isValid } from "date-fns";
import { HeroAircraft } from "@/components/hero/HeroAircraft";
import { C, mono } from "../theme";
import { DoublePlaneIcon } from "./DoublePlaneIcon";

export function BookingPanel() {
  const navigate = useNavigate();
  const [originCode, setOriginCode] = useState<string>("");
  const [destCode, setDestCode] = useState<string>("");
  const [transitCode, setTransitCode] = useState<string>("");
  const [originLabel, setOriginLabel] = useState<string>("");
  const [destLabel, setDestLabel] = useState<string>("");
  const [transitLabel, setTransitLabel] = useState<string>("");
  const [travelType, setTravelType] = useState<"domestic" | "international">("international");
  const [tab, setTab] = useState<"arrival" | "departure" | "connection">("arrival");
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
      travel_type: travelType,
      flight_type: travelType,
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
    ["arrival", "Arrival", PlaneLanding],
    ["departure", "Departure", PlaneTakeoff],
    ["connection", "Transit", DoublePlaneIcon],
  ];

  return (
    <section id="book" className="relative -mt-20 md:-mt-32 px-4 pb-16 md:px-14 md:pb-32">
      <HeroAircraft />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-[1280px] rounded-3xl shadow-[0_32px_120px_-16px_rgba(13,42,54,0.18)] border z-20 overflow-visible"
        style={{
          borderColor: "rgba(255, 255, 255, 0.4)",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.03) 50%, rgba(95, 181, 173, 0.06) 100%)",
          backdropFilter: "blur(45px) saturate(160%)",
          boxShadow:
            "0 32px 120px -16px rgba(13, 42, 54, 0.18), inset 0 1px 3px rgba(255, 255, 255, 0.65), inset 0 -1px 3px rgba(13, 90, 110, 0.15)",
        }}
      >
        {/* Decorative Specular Glare / Rainbow Sheen Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/12 pointer-events-none rounded-[22px]" />
        <div
          className="absolute inset-0 pointer-events-none rounded-[22px] opacity-[0.03]"
          style={{
            background:
              "radial-gradient(circle at 80% 20%, rgba(255, 107, 0, 0.4) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(95, 181, 173, 0.4) 0%, transparent 60%)",
          }}
        />

        {/* Header Strip */}
        <div
          className="px-6 py-4 md:px-10 border-b border-white/15 rounded-t-[22px] relative z-10 flex flex-col gap-3 items-center text-center"
          style={{
            background:
              "linear-gradient(90deg, rgba(95, 181, 173, 0.08) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 107, 0, 0.04) 100%)",
          }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/20 text-[#7c3aed] text-[10px] font-mono uppercase font-extrabold tracking-widest">
            <Crown className="w-3.5 h-3.5" />
            <span>Master Airport VIP Packages</span>
          </div>
          <h2
            className="text-center text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-slate-900 flex items-center justify-center gap-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Choose Your Airport & Select VIP Package
          </h2>
          <p className="text-[11px] text-slate-600 font-sans max-w-md">
            All-inclusive airside escort, fast-track customs clearance, VIP lounge sanctuary, and chauffeured tarmac transfers.
          </p>
        </div>

        <motion.div
          key={`booking-form-grid-${tab}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="grid gap-8 p-6 md:grid-cols-12 md:gap-10 md:p-10 transition-all duration-300 opacity-100"
        >
          {/* LEFT — Tabs + Flight Info (7 cols on desktop) */}
          <div className="md:col-span-7 flex flex-col gap-6">
            {/* Tabs (Segmented Control) */}
            {(
              <div className="relative flex rounded-xl bg-white/10 border border-white/15 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] p-1 max-w-md">
                {tabs.map(([k, label, Icon]) => {
                  const active = tab === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setTab(k)}
                      className="relative flex-1 py-2.5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] outline-none transition-colors z-10"
                      style={{
                        ...mono,
                        color: active ? "#ffffff" : C.mute,
                      }}
                    >
                      {active && (
                        <motion.div
                          layoutId="activeBookingTabPill"
                          className="absolute inset-0 rounded-lg"
                          style={{
                            backgroundColor: C.teal,
                            boxShadow:
                              "0 4px 12px rgba(13,90,110,0.35), inset 0 1px 1px rgba(255,255,255,0.25)",
                          }}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <Icon className="h-3.5 w-3.5 relative z-20" />
                      <span className="relative z-20">{label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Travel type */}
            <div className="flex rounded-xl bg-white/10 border border-white/15 p-1 max-w-md">
              {(["domestic", "international"] as const).map((kind) => {
                const active = travelType === kind;
                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => setTravelType(kind)}
                    className="relative flex-1 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] z-10"
                    style={{ ...mono, color: active ? "#0d5a6e" : C.mute }}
                  >
                    {active && (
                      <span className="absolute inset-0 rounded-lg bg-white shadow-sm" />
                    )}
                    <span className="relative z-20">{kind}</span>
                  </button>
                );
              })}
            </div>

            {/* Origin / Destination / Transit */}
            {(
              <div className="flex flex-col gap-3 w-full">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700">
                    Origin Airport *
                  </label>
                  <IntelligentAirportAutocomplete
                    key={`origin-${tab}`}
                    mode={tab === "departure" ? "supported" : "global"}
                    journeyType={tab === "departure" ? "DEPARTURE" : undefined}
                    value={originLabel || originCode}
                    onSelect={(ap) => {
                      setOriginCode(ap.code);
                      setOriginLabel(formatAirportOption(ap));
                    }}
                    placeholder={tab === "departure" ? "Search supported origin airport" : "Search origin airport"}
                  />
                </div>
                {tab === "connection" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700">
                      Transit Airport *
                    </label>
                    <IntelligentAirportAutocomplete
                      key="transit-supported"
                      mode="supported"
                      journeyType="TRANSIT"
                      value={transitLabel || transitCode}
                      onSelect={(ap) => {
                        setTransitCode(ap.code);
                        setTransitLabel(formatAirportOption(ap));
                      }}
                      placeholder="Search supported transit airport"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700">
                    Destination Airport *
                  </label>
                  <IntelligentAirportAutocomplete
                    key={`dest-${tab}`}
                    mode={tab === "arrival" ? "supported" : "global"}
                    journeyType={tab === "arrival" ? "ARRIVAL" : undefined}
                    value={destLabel || destCode}
                    onSelect={(ap) => {
                      setDestCode(ap.code);
                      setDestLabel(formatAirportOption(ap));
                    }}
                    placeholder={tab === "arrival" ? "Search supported destination airport" : "Search destination airport"}
                  />
                </div>
              </div>
            )}

            {/* Travel date */}
            {tab === "connection" ? (
              <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2">
                <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold uppercase outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 cursor-pointer ${touched.departDate && !departDate ? "border-red-400" : ""}`}
                      style={{
                        borderColor: touched.departDate && !departDate ? undefined : "rgba(255,255,255,0.25)",
                        color: C.ink,
                      }}
                    >
                      <span className="truncate">
                        {departDate ? format(parseISO(departDate), "MMM dd, yyyy") : "Travel date"}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-60" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={dateValue}
                      onSelect={(d) => {
                        if (d) setDepartDate(format(d, "yyyy-MM-dd"));
                        setDatePopoverOpen(false);
                      }}
                      disabled={{ before: todayStart }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover open={datePopoverOpen2} onOpenChange={setDatePopoverOpen2}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-12 w-full items-center justify-between rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold uppercase outline-none transition-all hover:bg-white/15 cursor-pointer"
                      style={{ borderColor: "rgba(255,255,255,0.25)", color: C.ink }}
                    >
                      <span className="truncate">
                        {departDate2 ? format(parseISO(departDate2), "MMM dd, yyyy") : "Connecting date (optional)"}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-60" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={dateValue2}
                      onSelect={(d) => {
                        if (d) setDepartDate2(format(d, "yyyy-MM-dd"));
                        setDatePopoverOpen2(false);
                      }}
                      disabled={{ before: dateValue || todayStart }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`flex h-12 w-full max-w-sm items-center justify-between rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold uppercase outline-none transition-all hover:bg-white/15 cursor-pointer ${touched.departDate && !departDate ? "border-red-400" : ""}`}
                    style={{
                      borderColor: touched.departDate && !departDate ? undefined : "rgba(255,255,255,0.25)",
                      color: C.ink,
                    }}
                  >
                    <span className="truncate">
                      {departDate ? format(parseISO(departDate), "MMM dd, yyyy") : "Travel date"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={dateValue}
                    onSelect={(d) => {
                      if (d) setDepartDate(format(d, "yyyy-MM-dd"));
                      setDatePopoverOpen(false);
                    }}
                    disabled={{ before: todayStart }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* RIGHT — Pax/Bags + Search Button (5 cols on desktop) */}
          <div
            className="md:col-span-5 relative flex flex-col justify-between gap-6 border-t border-white/10 pt-8 mt-4 md:border-t-0 md:pt-0 md:mt-0 md:border-l md:pl-10"
            style={{ borderColor: "rgba(255,255,255,0.2)" }}
          >
            <div>
              <div
                className="flex items-center gap-2.5 text-xs font-semibold"
                style={{ color: C.ink }}
              >
                <span style={mono}>Need more than one service type?</span>
                <button
                  type="button"
                  aria-label="More information"
                  className="grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold border hover:bg-white/20 active:scale-95 transition"
                  style={{
                    borderColor: "rgba(255,255,255,0.25)",
                    background: "rgba(255,255,255,0.08)",
                    color: C.teal,
                  }}
                >
                  ?
                </button>
              </div>

              {/* Custom Interactive Passenger / Bag Selectors */}
              <div className="relative mt-4">
                <Popover open={showPassengerModal} onOpenChange={setShowPassengerModal}>
                  <PopoverTrigger asChild>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        className="flex h-12 w-full items-center justify-between rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 cursor-pointer"
                        style={{
                          borderColor: "rgba(255,255,255,0.25)",
                          color: C.ink,
                          boxShadow:
                            "inset 0 1.5px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(255,255,255,0.1)",
                        }}
                      >
                        <span className="truncate flex items-center gap-2">
                          <Users size={14} style={{ color: C.teal }} />
                          {adults + childrenCount + infants} Pax ({adults} Ad)
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 opacity-60 transition-transform duration-200 ${showPassengerModal ? "rotate-180" : ""}`}
                        />
                      </button>

                      <button
                        type="button"
                        className="flex h-12 w-full items-center justify-between rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 cursor-pointer"
                        style={{
                          borderColor: "rgba(255,255,255,0.25)",
                          color: C.ink,
                          boxShadow:
                            "inset 0 1.5px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(255,255,255,0.1)",
                        }}
                      >
                        <span className="truncate flex items-center gap-2">
                          <Package size={14} style={{ color: C.teal }} />
                          {bags} Bag{bags !== 1 ? "s" : ""}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 opacity-60 transition-transform duration-200 ${showPassengerModal ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>
                  </PopoverTrigger>

                  <PopoverContent className="w-80 p-5 bg-white/95 backdrop-blur-xl border border-black/10 shadow-2xl rounded-2xl">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-black/5 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                          Passengers & Luggage
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPassengerModal(false)}
                          className="text-gray-400 hover:text-gray-700"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Adult */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-800">Adult</span>
                          <span className="text-[10px] text-gray-500 font-medium">12+ years</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            disabled={adults <= 1}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-lg font-semibold transition hover:bg-black/5 active:scale-95 disabled:opacity-30 outline-none"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-gray-800">
                            {adults}
                          </span>
                          <button
                            type="button"
                            onClick={() => setAdults(adults + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-lg font-semibold transition hover:bg-black/5 active:scale-95 outline-none"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Child */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-800">Child</span>
                          <span className="text-[10px] text-gray-500 font-medium">
                            2 - 12 years
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                            disabled={childrenCount <= 0}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-lg font-semibold transition hover:bg-black/5 active:scale-95 disabled:opacity-30 outline-none"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-gray-800">
                            {childrenCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => setChildrenCount(childrenCount + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-lg font-semibold transition hover:bg-black/5 active:scale-95 outline-none"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Infant */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-800">Infant</span>
                          <span className="text-[10px] text-gray-500 font-medium">
                            Under 2 years
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setInfants(Math.max(0, infants - 1))}
                            disabled={infants <= 0}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-lg font-semibold transition hover:bg-black/5 active:scale-95 disabled:opacity-30 outline-none"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-gray-800">
                            {infants}
                          </span>
                          <button
                            type="button"
                            onClick={() => setInfants(infants + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-lg font-semibold transition hover:bg-black/5 active:scale-95 outline-none"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Bags */}
                      <div className="flex items-center justify-between border-t border-black/5 pt-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-800">Check-in Bags</span>
                          <span className="text-[10px] text-gray-500 font-medium">Luggage items</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setBags(Math.max(0, bags - 1))}
                            disabled={bags <= 0}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-lg font-semibold transition hover:bg-black/5 active:scale-95 disabled:opacity-30 outline-none"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-gray-800">
                            {bags}
                          </span>
                          <button
                            type="button"
                            onClick={() => setBags(bags + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-lg font-semibold transition hover:bg-black/5 active:scale-95 outline-none"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <button
              type="button"
              disabled={!isFormValid}
              onClick={handleContinueToPackages}
              className={`mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-[11px] font-semibold uppercase tracking-[0.24em] transition ${isFormValid
                  ? "hover:brightness-110 shadow-lg cursor-pointer"
                  : "opacity-45 cursor-not-allowed"
                }`}
              style={{
                ...mono,
                background: "linear-gradient(135deg, #0d5a6e 0%, #083c4b 100%)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: isFormValid
                  ? "0 12px 28px -6px rgba(13,90,110,0.55), inset 0 1px 1px rgba(255,255,255,0.3)"
                  : "none",
              }}
            >
              <ArrowRight className="h-4 w-4" />
              <span>Select package</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
