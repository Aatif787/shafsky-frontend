import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { ApiClient } from "@/lib/ApiClient";
import { toast } from "sonner";
import { FlightData } from "@/services/flight/FlightTypes";
import { ManualFlightEntryForm } from "@/components/booking/shared/ManualFlightEntryForm";
import { AIRPORT_REGISTRY } from "@/data/airportRegistry";
import { IntelligentAirportAutocomplete } from "@/components/booking/shared/IntelligentAirportAutocomplete";
import { getRequiredBookingFields } from "@/components/booking/config/services.config";
import { formatFlightLookupError } from "@/components/booking/hooks/useAirportWorkflow";
import {
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Calendar,
  ChevronDown,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Users,
  Package,
  Crown,
  HelpCircle,
  X,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { format, parseISO, isValid } from "date-fns";
import { HeroAircraft } from "@/components/hero/HeroAircraft";
import { C, mono } from "../theme";
import { DoublePlaneIcon } from "./DoublePlaneIcon";
import { ServicesSelectorBar } from "./ServicesSelectorBar";
import { SELECTOR_SERVICES } from "./selectorServices";

export function BookingPanel() {
  const navigate = useNavigate();
  const [validatingFlight, setValidatingFlight] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>("Meet & Greet");
  const [selectedAirportCode, setSelectedAirportCode] = useState<string>("DEL");
  const [tab, setTab] = useState<"arrival" | "departure" | "connection">("arrival");
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);
  const [bags, setBags] = useState(1);
  const [flightNumber, setFlightNumber] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // Connection Mode Extra Flight Inputs
  const [flightNumber2, setFlightNumber2] = useState("");
  const [departDate2, setDepartDate2] = useState("");
  const [datePopoverOpen2, setDatePopoverOpen2] = useState(false);

  // Flight state machine & manual entry mode state
  const [heroFlightStateMode, setHeroFlightStateMode] = useState<"IDLE" | "LOADING" | "VERIFIED" | "ERROR" | "MANUAL">("IDLE");
  const [heroFlightError, setHeroFlightError] = useState<string | null>(null);
  const [verifiedHeroFlight, setVerifiedHeroFlight] = useState<FlightData | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [pendingVerifiedFlight, setPendingVerifiedFlight] = useState<FlightData | null>(null);

  const selectedServiceObj = useMemo(
    () => SELECTOR_SERVICES.find((s) => s.t === selectedService || s.id === selectedService) || SELECTOR_SERVICES[0],
    [selectedService]
  );

  const requiredFields = useMemo(
    () => getRequiredBookingFields(selectedServiceObj?.id || selectedService),
    [selectedServiceObj, selectedService]
  );

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
    (!requiredFields.requiresFlight || flightNumber.trim() !== "") && departDate !== "";
  const isConnectionValid =
    (!requiredFields.requiresFlight || (flightNumber.trim() !== "" && flightNumber2.trim() !== "")) &&
    departDate !== "" &&
    departDate2 !== "";

  const isFormValid = !requiredFields.requiresJourneyType
    ? true
    : tab === "connection"
      ? isConnectionValid
      : isArrivalDepartureValid;

  const handleHomepageSearchFlight = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!requiredFields.requiresFlight) {
      navigate({
        to: "/book",
        search: {
          origin: selectedAirportCode || "DEL",
          service_id: selectedServiceObj?.id || selectedService || undefined,
          depart_date: departDate,
          direction: tab === "connection" ? "transit" : tab,
          pax_adults: adults,
          pax_children: childrenCount,
          pax_infants: infants,
          from_hero: "true",
        } as any,
      });
      return;
    }

    if (!isFormValid) {
      setTouched({
        flightNumber: true,
        departDate: true,
        flightNumber2: true,
        departDate2: true,
      });
      toast.error("Please fill in flight number and travel date.");
      return;
    }

    const cleanFlightNum = flightNumber.trim().toUpperCase().replace(/\s+/g, "");
    if (!cleanFlightNum || cleanFlightNum.length < 3) {
      toast.error("Please enter a valid flight number (e.g. AI302, EK504).");
      return;
    }

    setValidatingFlight(true);
    setHeroFlightStateMode("LOADING");
    setHeroFlightError(null);

    try {
      const response = await ApiClient.fetchWithAuth("/api/flight/validate", {
        method: "POST",
        body: JSON.stringify({
          flightNum: cleanFlightNum,
          flightNumber: cleanFlightNum,
          departDate,
          depart_date: departDate,
          originCode: selectedAirportCode || undefined,
          direction: tab === "connection" ? "transit" : tab,
          tripType: tab === "connection" ? "multi_city" : "one_way",
        }),
      });

      const resJson = await response.json();
      const rawData = resJson?.data;

      if (!response.ok || !resJson?.success || rawData?.valid === false) {
        const errMsg = formatFlightLookupError(
          resJson?.error || resJson?.message || rawData?.blockingMessage || resJson,
          response.status
        );
        setHeroFlightError(errMsg);
        setHeroFlightStateMode("ERROR");
        setValidatingFlight(false);
        return;
      }

      const targetObj = rawData?.flightData || rawData?.flight_data || (Array.isArray(rawData) ? rawData[0] : rawData);

      if (!targetObj || (!targetObj.flight && !targetObj.flightNum && !targetObj.airline)) {
        const errMsg = formatFlightLookupError(
          `FLIGHT_NOT_FOUND: Flight ${cleanFlightNum} could not be found for ${departDate}.`,
          404
        );
        setHeroFlightError(errMsg);
        setHeroFlightStateMode("ERROR");
        setValidatingFlight(false);
        return;
      }

      const flightInfo: FlightData = {
        flightNum: (targetObj?.flight?.iata || targetObj?.flightNum || targetObj?.flight_num || cleanFlightNum).toUpperCase(),
        carrier: {
          iata: targetObj?.airline?.iata || targetObj?.carrier?.iata || targetObj?.carrier_iata || cleanFlightNum.slice(0, 2).toUpperCase(),
          name: targetObj?.airline?.name || targetObj?.carrier?.name || targetObj?.carrier_name || null,
          logo: targetObj?.airline?.logo || null,
        },
        origin: {
          code: targetObj?.departure?.airport || targetObj?.origin?.code || targetObj?.origin_code || null,
          name: targetObj?.departure?.airport_name || targetObj?.origin?.name || targetObj?.origin_name || null,
          city: targetObj?.departure?.city || targetObj?.origin?.city || targetObj?.origin_city || null,
          country: targetObj?.departure?.country || targetObj?.origin?.country || null,
        },
        destination: {
          code: targetObj?.arrival?.airport || targetObj?.destination?.code || targetObj?.destination_code || null,
          name: targetObj?.arrival?.airport_name || targetObj?.destination?.name || targetObj?.destination_name || null,
          city: targetObj?.arrival?.city || targetObj?.destination?.city || targetObj?.destination_city || null,
          country: targetObj?.arrival?.country || targetObj?.destination?.country || null,
        },
        departure: {
          scheduledTime: targetObj?.departure?.scheduled || targetObj?.departure?.scheduledTime || targetObj?.scheduled_departure || null,
          terminal: targetObj?.departure?.terminal || null,
          gate: targetObj?.departure?.gate || null,
        },
        arrival: {
          scheduledTime: targetObj?.arrival?.scheduled || targetObj?.arrival?.scheduledTime || targetObj?.scheduled_arrival || null,
          terminal: targetObj?.arrival?.terminal || null,
          gate: targetObj?.arrival?.gate || null,
        },
        duration: targetObj?.duration?.formatted || targetObj?.duration_text || targetObj?.duration || targetObj?.flight_duration || null,
        status: targetObj?.status || "Scheduled",
        aircraft: {
          model: targetObj?.aircraft?.model || null,
        },
      };

      setVerifiedHeroFlight(flightInfo);
      setHeroFlightStateMode("VERIFIED");
      toast.success(`Flight ${flightInfo.flightNum} verified successfully!`);
    } catch (err: any) {
      console.error("[Hero] Validation error:", err);
      const errMsg = formatFlightLookupError(err);
      setHeroFlightError(errMsg);
      setHeroFlightStateMode("ERROR");
    } finally {
      setValidatingFlight(false);
    }
  };

  const proceedWithFlightData = (flightInfo: FlightData) => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("shafsky_validated_flight", JSON.stringify(flightInfo));
      } catch {
        // ignore cache write error
      }
    }

    toast.success(`Flight ${flightInfo.flightNum} configured!`);
    setValidatingFlight(false);

    const targetCode =
      tab === "arrival"
        ? flightInfo.destination?.code || selectedAirportCode || "DEL"
        : tab === "departure"
          ? flightInfo.origin?.code || selectedAirportCode || "DEL"
          : (flightInfo as any).transit?.code || selectedAirportCode || "DEL";

    navigate({
      to: "/book",
      search: {
        origin: targetCode,
        service_id: selectedServiceObj?.id || selectedService || undefined,
        flight_number: flightInfo.flightNum,
        depart_date: departDate,
        direction: tab === "connection" ? "transit" : tab,
        pax_adults: adults,
        pax_children: childrenCount,
        pax_infants: infants,
        notes:
          tab === "connection"
            ? `Transit Flight 1: ${flightNumber} on ${departDate} | Flight 2: ${flightNumber2} on ${departDate2}`
            : `Flight Number: ${flightNumber} (${tab})`,
        from_hero: "true",
        validated: "true",
      } as any,
    });
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
        className="relative mx-auto max-w-[1280px] rounded-3xl shadow-[0_32px_120px_-16px_rgba(13,42,54,0.18)] border z-20 overflow-hidden"
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
          key={`booking-form-grid-${selectedService || "none"}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="grid gap-8 p-6 md:grid-cols-12 md:gap-10 md:p-10 transition-all duration-300 opacity-100"
        >
          {/* LEFT — Tabs + Flight Info (7 cols on desktop) */}
          <div className="md:col-span-7 flex flex-col gap-6">
            {/* Tabs (Segmented Control) */}
            {requiredFields.requiresJourneyType && (
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

            {/* Intelligent Searchable Airport Autocomplete */}
            {requiredFields.requiresAirport && (
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>Service Airport *</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedAirportCode) {
                        navigate({ to: "/airports/$code", params: { code: selectedAirportCode } });
                      }
                    }}
                    className="text-[9px] text-[#7c3aed] hover:underline font-semibold font-sans flex items-center gap-1 cursor-pointer"
                  >
                    <span>Explore {selectedAirportCode} Hub Page</span>
                    <span>→</span>
                  </button>
                </label>
                <IntelligentAirportAutocomplete
                  value={selectedAirportCode ? `${AIRPORT_REGISTRY[selectedAirportCode]?.city || selectedAirportCode} (${selectedAirportCode})` : ""}
                  onSelect={(ap) => {
                    setSelectedAirportCode(ap.code);
                  }}
                  placeholder="Type Airport Code (e.g. DEL, BOM), City or Name..."
                />
              </div>
            )}

            {/* Inputs */}
            {tab === "connection" ? (
              <div className="flex flex-col gap-5">
                {/* Row 1 */}
                <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[1.5fr_1.2fr_auto] sm:items-start">
                  <div className="flex gap-2 w-full items-start">
                    <div className="relative flex flex-col gap-1 flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Enter Your Flight Number e.g. AERO77"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                        onBlur={() => setTouched((t) => ({ ...t, flightNumber: true }))}
                        className={`w-full h-12 rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold uppercase outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 focus:bg-white/20 focus:ring-4 focus:ring-teal/5 ${touched.flightNumber && !flightNumber.trim()
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : ""
                          }`}
                        style={{
                          borderColor:
                            touched.flightNumber && !flightNumber.trim()
                              ? undefined
                              : "rgba(255,255,255,0.25)",
                          color: C.ink,
                          boxShadow:
                            "inset 0 1.5px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(255,255,255,0.1)",
                        }}
                      />
                      {touched.flightNumber && !flightNumber.trim() && (
                        <span className="text-[9px] text-red-500 font-medium ml-1 mt-0.5">
                          Flight number required
                        </span>
                      )}
                    </div>
                  </div>

                  <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold uppercase outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 cursor-pointer ${touched.departDate && !departDate
                          ? "border-red-400 focus:border-red-500"
                          : ""
                          }`}
                        style={{
                          borderColor:
                            touched.departDate && !departDate
                              ? undefined
                              : "rgba(255,255,255,0.25)",
                          color: C.ink,
                          boxShadow:
                            "inset 0 1.5px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(255,255,255,0.1)",
                        }}
                      >
                        <span className="truncate">
                          {departDate ? format(parseISO(departDate), "MMM dd, yyyy") : "Arrival Date"}
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

                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="Help"
                        className="hidden sm:grid h-12 w-12 shrink-0 place-items-center rounded-xl transition hover:bg-white/20 active:scale-95 border cursor-pointer"
                        style={{
                          borderColor: "rgba(255,255,255,0.25)",
                          background: "rgba(255,255,255,0.08)",
                          backdropFilter: "blur(8px)",
                          color: C.teal,
                          boxShadow:
                            "inset 0 1px 1px rgba(255,255,255,0.2), 0 1.5px 3px rgba(0,0,0,0.02)",
                        }}
                      >
                        <HelpCircle className="h-5 w-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-4 text-xs space-y-2 bg-slate-900/95 text-slate-100 border-slate-800 backdrop-blur-xl">
                      <p className="font-semibold text-teal-400">Where can I find my Flight Number?</p>
                      <p className="text-slate-300 leading-relaxed">
                        Your flight number is a 2 to 4 digit code preceded by your airline's 2-letter IATA designator (e.g. <strong>EK505</strong>, <strong>BA117</strong>, <strong>AI101</strong>). You can find it on your booking confirmation email, e-ticket, or boarding pass.
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Row 2 (Connection Flight 2) */}
                <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[1.5fr_1.2fr_auto] sm:items-start">
                  <div className="flex gap-2 w-full items-start">
                    <div className="relative flex flex-col gap-1 flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Connecting Flight e.g. AERO88"
                        value={flightNumber2}
                        onChange={(e) => setFlightNumber2(e.target.value.toUpperCase())}
                        onBlur={() => setTouched((t) => ({ ...t, flightNumber2: true }))}
                        className={`w-full h-12 rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold uppercase outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 focus:bg-white/20 focus:ring-4 focus:ring-teal/5 ${touched.flightNumber2 && !flightNumber2.trim()
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : ""
                          }`}
                        style={{
                          borderColor:
                            touched.flightNumber2 && !flightNumber2.trim()
                              ? undefined
                              : "rgba(255,255,255,0.25)",
                          color: C.ink,
                          boxShadow:
                            "inset 0 1.5px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(255,255,255,0.1)",
                        }}
                      />
                      {touched.flightNumber2 && !flightNumber2.trim() && (
                        <span className="text-[9px] text-red-500 font-medium ml-1 mt-0.5">
                          Connecting flight required
                        </span>
                      )}
                    </div>
                  </div>

                  <Popover open={datePopoverOpen2} onOpenChange={setDatePopoverOpen2}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold uppercase outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 cursor-pointer ${touched.departDate2 && !departDate2
                          ? "border-red-400 focus:border-red-500"
                          : ""
                          }`}
                        style={{
                          borderColor:
                            touched.departDate2 && !departDate2
                              ? undefined
                              : "rgba(255,255,255,0.25)",
                          color: C.ink,
                          boxShadow:
                            "inset 0 1.5px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(255,255,255,0.1)",
                        }}
                      >
                        <span className="truncate">
                          {departDate2 ? format(parseISO(departDate2), "MMM dd, yyyy") : "Departure Date"}
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

                  <div className="h-12 w-12 shrink-0 hidden sm:block" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[1.5fr_1.2fr_auto] sm:items-start">
                <div className="flex gap-2 w-full items-start">
                  <div className="relative flex flex-col gap-1 flex-1 w-full">
                    <input
                      type="text"
                      placeholder={requiredFields.requiresFlight ? "Enter Your Flight Number e.g. AERO77" : "Flight Number (Optional)"}
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                      onBlur={() => setTouched((t) => ({ ...t, flightNumber: true }))}
                      className={`w-full h-12 rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold uppercase outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 focus:bg-white/20 focus:ring-4 focus:ring-teal/5 ${touched.flightNumber && requiredFields.requiresFlight && !flightNumber.trim()
                        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                        : ""
                        }`}
                      style={{
                        borderColor:
                          touched.flightNumber && requiredFields.requiresFlight && !flightNumber.trim()
                            ? undefined
                            : "rgba(255,255,255,0.25)",
                        color: C.ink,
                        boxShadow:
                          "inset 0 1.5px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(255,255,255,0.1)",
                      }}
                    />
                    {touched.flightNumber && requiredFields.requiresFlight && !flightNumber.trim() && (
                      <span className="text-[9px] text-red-500 font-medium ml-1 mt-0.5">
                        Flight number required
                      </span>
                    )}
                  </div>
                </div>

                <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold uppercase outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 cursor-pointer ${touched.departDate && !departDate
                        ? "border-red-400 focus:border-red-500"
                        : ""
                        }`}
                      style={{
                        borderColor:
                          touched.departDate && !departDate
                            ? undefined
                            : "rgba(255,255,255,0.25)",
                        color: C.ink,
                        boxShadow:
                          "inset 0 1.5px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(255,255,255,0.1)",
                      }}
                    >
                      <span className="truncate">
                        {departDate
                          ? format(parseISO(departDate), "MMM dd, yyyy")
                          : tab === "arrival"
                            ? "Arrival Date"
                            : "Departure Date"}
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

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Help"
                      className="hidden sm:grid h-12 w-12 shrink-0 place-items-center rounded-xl transition hover:bg-white/20 active:scale-95 border cursor-pointer"
                      style={{
                        borderColor: "rgba(255,255,255,0.25)",
                        background: "rgba(255,255,255,0.08)",
                        backdropFilter: "blur(8px)",
                        color: C.teal,
                        boxShadow:
                          "inset 0 1px 1px rgba(255,255,255,0.2), 0 1.5px 3px rgba(0,0,0,0.02)",
                      }}
                    >
                      <HelpCircle className="h-5 w-5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4 text-xs space-y-2 bg-slate-900/95 text-slate-100 border-slate-800 backdrop-blur-xl">
                    <p className="font-semibold text-teal-400">Where can I find my Flight Number?</p>
                    <p className="text-slate-300 leading-relaxed">
                      Your flight number is a 2 to 4 digit code preceded by your airline's 2-letter IATA designator (e.g. <strong>EK505</strong>, <strong>BA117</strong>, <strong>AI101</strong>). You can find it on your booking confirmation email, e-ticket, or boarding pass.
                    </p>
                  </PopoverContent>
                </Popover>
              </div>
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

            {/* ERROR STATE BANNER */}
            {heroFlightStateMode === "ERROR" && heroFlightError && (
              <div className="mt-4 p-4 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs font-sans space-y-3">
                <div className="flex items-start gap-2.5 font-semibold">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{heroFlightError}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleHomepageSearchFlight}
                    className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] uppercase tracking-wider font-bold transition shadow-sm cursor-pointer"
                    style={mono}
                  >
                    Try Again / Fetch Flight
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeroFlightStateMode("MANUAL");
                      setIsManualMode(true);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
                    style={mono}
                  >
                    Enter Flight Details Manually
                  </button>
                </div>
              </div>
            )}

            {/* VERIFIED FLIGHT RESULT CARD */}
            {heroFlightStateMode === "VERIFIED" && verifiedHeroFlight ? (
              <div className="mt-5 p-5 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono uppercase font-bold tracking-wider">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>✓ Verified Flight Schedule</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300/90 font-bold uppercase">
                    {verifiedHeroFlight.status || "Scheduled"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-white border-y border-white/10 py-3 font-mono">
                  <div>
                    <div className="text-xl font-extrabold text-amber-300">{verifiedHeroFlight.origin.code || "DEP"}</div>
                    <div className="text-[10px] text-slate-300 font-sans">{verifiedHeroFlight.origin.city || verifiedHeroFlight.origin.name || "Origin"}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <Plane className="h-4 w-4 text-amber-400" />
                    <div className="text-[9px] text-slate-300 mt-0.5 font-bold">{verifiedHeroFlight.carrier.name || verifiedHeroFlight.flightNum}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-amber-300">{verifiedHeroFlight.destination.code || "ARR"}</div>
                    <div className="text-[10px] text-slate-300 font-sans">{verifiedHeroFlight.destination.city || verifiedHeroFlight.destination.name || "Destination"}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => proceedWithFlightData(verifiedHeroFlight)}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-mono text-xs font-extrabold uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    style={mono}
                  >
                    <span>Proceed to Book Concierge</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeroFlightStateMode("IDLE");
                      setVerifiedHeroFlight(null);
                    }}
                    className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
                    style={mono}
                  >
                    Change Flight
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  disabled={validatingFlight}
                  onClick={handleHomepageSearchFlight}
                  className={`mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-[11px] font-semibold uppercase tracking-[0.24em] transition ${isFormValid && !validatingFlight
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
                  {validatingFlight ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-amber-300" />
                      <span>Fetching Flight...</span>
                    </>
                  ) : requiredFields.requiresFlight ? (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Fetch Flight</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      <span>Proceed to Booking</span>
                    </>
                  )}
                </button>

                {/* Secondary Option: Explicit Manual Flight Entry Toggle */}
                <div className="mt-3.5 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setHeroFlightStateMode(isManualMode ? "IDLE" : "MANUAL");
                      setIsManualMode((prev) => !prev);
                    }}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-purple-700 transition underline underline-offset-4 cursor-pointer"
                    style={mono}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                    <span>{isManualMode ? "Hide Manual Flight Form" : "Or Enter Flight Details Manually"}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Prompt User Before Overwriting Manual Entry with API Verified Data */}
        <AnimatePresence>
          {pendingVerifiedFlight && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mx-6 mb-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 z-30"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-amber-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Verified Official Flight Schedule Found for {pendingVerifiedFlight.flightNum}
                  </h4>
                  <p className="text-[11px] text-slate-600 font-mono" style={mono}>
                    Route: {pendingVerifiedFlight.origin.code} → {pendingVerifiedFlight.destination.code} | Carrier: {pendingVerifiedFlight.carrier.name}. Replace custom manual entries with official schedule?
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const info = pendingVerifiedFlight;
                    setPendingVerifiedFlight(null);
                    proceedWithFlightData(info);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-[10px] font-bold uppercase tracking-wider shadow-md transition"
                  style={mono}
                >
                  Use Verified Schedule
                </button>
                <button
                  type="button"
                  onClick={() => setPendingVerifiedFlight(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold uppercase tracking-wider transition"
                  style={mono}
                >
                  Keep Custom Details
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Smooth Expandable Manual Flight Entry Form */}
        <AnimatePresence>
          {isManualMode && (
            <div className="px-6 pb-8 md:px-10">
              <ManualFlightEntryForm
                direction={tab === "connection" ? "transit" : tab}
                initialValues={{
                  flightNum: flightNumber,
                  depDate: departDate,
                }}
                onClose={() => setIsManualMode(false)}
                onSubmit={(manualFlightData) => {
                  proceedWithFlightData(manualFlightData);
                }}
              />
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
