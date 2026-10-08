import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Crown, Check, ArrowRight, ChevronDown, ChevronUp, Sparkles, AlertCircle, RefreshCw, Pencil } from "lucide-react";
import { getAirportRegistryEntry, getTransitCategory } from "@/data/airportRegistry";
import { IntelligentAirportAutocomplete } from "@/components/booking/shared/IntelligentAirportAutocomplete";
import { formatAirportOption } from "@/lib/api/airportApi";
import { ApiClient } from "@/lib/ApiClient";

const TRANSIT_TITLE_MAP: Record<string, string> = {
  DOMESTIC_DOMESTIC: "Domestic → Domestic",
  DOMESTIC_INTERNATIONAL: "Domestic → International",
  INTERNATIONAL_DOMESTIC: "International → Domestic",
  INTERNATIONAL_INTERNATIONAL: "International → International",
};

interface MeetGreetPackageComparisonProps {
  airportCode: string;
  selectedPackageId?: string;
  onSelectPackage?: (pkg: any) => void;
  showBookButton?: boolean;
  bookingSearch?: Record<string, unknown>;
}

function journeyFromSearch(search?: Record<string, unknown>): "ARRIVAL" | "DEPARTURE" | "TRANSIT" {
  const raw = String(search?.direction || search?.journey_type || "").toUpperCase();
  if (raw === "DEPARTURE" || raw === "DEP") return "DEPARTURE";
  if (raw === "TRANSIT" || raw === "CONNECTION") return "TRANSIT";
  return "ARRIVAL";
}

function flightFromSearch(search?: Record<string, unknown>): "DOMESTIC" | "INTERNATIONAL" {
  const raw = String(search?.travel_type || search?.flight_type || "").toUpperCase();
  if (raw === "INTERNATIONAL" || raw === "INTL" || raw === "INT") return "INTERNATIONAL";
  return "DOMESTIC";
}

export function MeetGreetPackageComparison({
  airportCode,
  selectedPackageId,
  onSelectPackage,
  showBookButton = true,
  bookingSearch,
}: MeetGreetPackageComparisonProps) {
  const airportEntry = getAirportRegistryEntry(airportCode);
  const cityName = airportEntry?.city || airportCode;

  const isDel = airportCode.toUpperCase() === "DEL";

  const originParam = String(bookingSearch?.origin || "").trim().toUpperCase();
  const destParam = String(bookingSearch?.destination || "").trim().toUpperCase();
  const transitParam = String(bookingSearch?.transit || airportCode).trim().toUpperCase();

  const [journeyOrigin, setJourneyOrigin] = useState<string>(() => originParam);
  const [journeyDest, setJourneyDest] = useState<string>(() => destParam);
  const [journeyTransit, setJourneyTransit] = useState<string>(() => transitParam || airportCode);
  const [isEditingJourney, setIsEditingJourney] = useState<boolean>(false);

  const originEntry = getAirportRegistryEntry(journeyOrigin);
  const destEntry = getAirportRegistryEntry(journeyDest);
  const transitEntry = getAirportRegistryEntry(journeyTransit || airportCode);

  const [originLabel, setOriginLabel] = useState<string>(() => originEntry ? formatAirportOption(originEntry) : journeyOrigin);
  const [destLabel, setDestLabel] = useState<string>(() => destEntry ? formatAirportOption(destEntry) : journeyDest);
  const [transitLabel, setTransitLabel] = useState<string>(() => transitEntry ? formatAirportOption(transitEntry) : (journeyTransit || airportCode));

  const originCity = originEntry?.city || journeyOrigin;
  const destCity = destEntry?.city || journeyDest;
  const transitCity = transitEntry?.city || journeyTransit || airportCode;

  const [flightType, setFlightType] = useState<"DOMESTIC" | "INTERNATIONAL">(
    () => flightFromSearch(bookingSearch)
  );
  const [journeyType, setJourneyType] = useState<"ARRIVAL" | "DEPARTURE" | "TRANSIT">(
    () => journeyFromSearch(bookingSearch)
  );

  const effectiveTransitType = useMemo(() => {
    if (journeyOrigin && journeyDest) {
      return getTransitCategory(journeyOrigin, journeyDest);
    }
    const tt = String(bookingSearch?.transit_type || "").trim().toUpperCase();
    if (
      tt === "DOMESTIC_DOMESTIC" ||
      tt === "DOMESTIC_INTERNATIONAL" ||
      tt === "INTERNATIONAL_DOMESTIC" ||
      tt === "INTERNATIONAL_INTERNATIONAL"
    ) {
      return tt;
    }
    return "DOMESTIC_DOMESTIC";
  }, [journeyOrigin, journeyDest, bookingSearch?.transit_type]);

  const [terminal, setTerminal] = useState<string>(() => {
    if (isDel && flightFromSearch(bookingSearch) === "INTERNATIONAL") {
      return "Terminal 3";
    }
    return "Terminal 1 & 2";
  });

  useEffect(() => {
    if (!bookingSearch?.from_hero && !bookingSearch?.direction) return;
    setJourneyType(journeyFromSearch(bookingSearch));
    const flType = flightFromSearch(bookingSearch);
    setFlightType(flType);
    const o = String(bookingSearch?.origin || "").trim().toUpperCase();
    const d = String(bookingSearch?.destination || "").trim().toUpperCase();
    const t = String(bookingSearch?.transit || airportCode).trim().toUpperCase();
    if (o && o !== journeyOrigin) {
      setJourneyOrigin(o);
      const oe = getAirportRegistryEntry(o);
      setOriginLabel(oe ? formatAirportOption(oe) : o);
    }
    if (d && d !== journeyDest) {
      setJourneyDest(d);
      const de = getAirportRegistryEntry(d);
      setDestLabel(de ? formatAirportOption(de) : d);
    }
    if (t && t !== journeyTransit) {
      setJourneyTransit(t);
      const te = getAirportRegistryEntry(t);
      setTransitLabel(te ? formatAirportOption(te) : t);
    }
    if (isDel && flType === "INTERNATIONAL") {
      setTerminal("Terminal 3");
    }
  }, [
    bookingSearch?.from_hero,
    bookingSearch?.direction,
    bookingSearch?.travel_type,
    bookingSearch?.flight_type,
    bookingSearch?.transit_type,
    bookingSearch?.origin,
    bookingSearch?.destination,
    bookingSearch?.transit,
    isDel,
    airportCode,
  ]);

  // Whenever flightType switches to INTERNATIONAL at DEL, redirect terminal to Terminal 3
  useEffect(() => {
    if (isDel && flightType === "INTERNATIONAL") {
      setTerminal("Terminal 3");
    }
  }, [isDel, flightType]);

  // Dynamic packages loaded authoritatively from backend DB API
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<boolean>(false);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);
  const [expandedPackages, setExpandedPackages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setFetchError(false);

    const activeTerminal = isDel && flightType === "INTERNATIONAL" ? "Terminal 3" : terminal;
    const flightTypeParam = journeyType === "TRANSIT" ? effectiveTransitType : flightType;
    const terminalParam = journeyType !== "TRANSIT" && isDel && activeTerminal ? `&terminal=${encodeURIComponent(activeTerminal)}` : "";
    const effOrigin = journeyType === "TRANSIT" ? journeyOrigin : originParam;
    const effDest = journeyType === "TRANSIT" ? journeyDest : destParam;
    const effHub = journeyType === "TRANSIT" ? (journeyTransit || airportCode) : airportCode;
    const routeParam =
      effOrigin && effDest
        ? `&origin=${encodeURIComponent(effOrigin)}&destination=${encodeURIComponent(effDest)}`
        : "";

    ApiClient.fetchWithAuth(
      `/api/journey/airports/${effHub}/services?journey_type=${journeyType}&flight_type=${flightTypeParam}${terminalParam}${routeParam}`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          if (data && data.success !== false && Array.isArray(data.data)) {
            if (data.data.length > 0) {
              const titleMap: Record<string, string> = {
                DOMESTIC_DOMESTIC: "Domestic → Domestic",
                DOMESTIC_INTERNATIONAL: "Domestic → International",
                INTERNATIONAL_DOMESTIC: "International → Domestic",
                INTERNATIONAL_INTERNATIONAL: "International → International",
              };

              const mapped = data.data.map((item: any) => {
                const slug = item.service?.slug || item.id;
                let itemFeatures = item.features || [];
                if (!itemFeatures || itemFeatures.length === 0) {
                  if (slug === "platinum") {
                    itemFeatures = [
                      "Welcome at the Aerobridge",
                      "Dedicated Staff with Placard",
                      "Baggage Assist (Up to 3 Pieces)",
                      "Assist at the Baggage Belt Area",
                      "Coordination with the Receiving Party",
                      "Escort to the Car Parking Area",
                    ];
                  } else if (slug === "elite") {
                    itemFeatures = [
                      "Welcome at the Aerobridge",
                      "Dedicated Staff with Placard",
                      "Baggage Assist",
                      "Assist at the Baggage Belt Area",
                      "Coordination with the Receiving Party",
                      "Escort to the Car Parking Area",
                    ];
                  }
                }

                let title = item.service?.name || "Service Package";
                if (item.journey_type === "TRANSIT" && item.flight_type && titleMap[item.flight_type]) {
                  title = titleMap[item.flight_type];
                } else if (airportCode.toUpperCase() === "ATQ") {
                  title = title.replace(/\bEscort\b/gi, "").trim();
                }

                const cleanPackageText = (txt: string) => {
                  if (typeof txt !== "string") return txt;
                  let cleaned = txt
                    .replace(/\bAssistance\b/g, "Assist")
                    .replace(/\bassistance\b/g, "assist")
                    .replace(/\bPersonalized Placard\b/gi, "Placard")
                    .replace(/\bPersonalized Name Badge\b/gi, "Name Badge")
                    .replace(/\bPersonalized Name Placard\b/gi, "Name Placard")
                    .replace(/\bPersonalized\s+/gi, "")
                    .replace(/\s+personalized\b/gi, "")
                    .replace(/\bpersonalized\b/gi, "");

                  if (airportCode.toUpperCase() === "ATQ") {
                    cleaned = cleaned.replace(/Meet\s*&\s*Greet\s+Escort/gi, "Meet & Greet");
                    cleaned = cleaned.replace(/\bEscort\b/gi, "").replace(/\s{2,}/g, " ").trim();
                  }
                  return cleaned;
                };

                return {
                  id: slug,
                  title: cleanPackageText(title),
                  desc: cleanPackageText(item.short_description || item.service?.description || "VIP Airport Service Package."),
                  price: `${item.currency === "USD" ? "$" : "₹"}${item.price?.toLocaleString()}`,
                  rawPrice: item.price,
                  features: itemFeatures.map(cleanPackageText),
                  additionalBenefits: (item.additional_benefits || []).map(cleanPackageText),
                  isRecommended: !!item.is_recommended,
                };
              });
              setPackages(mapped);
              setFetchError(false);
              const derivedFt = String(data.flight_type || "").toUpperCase();
              if (derivedFt === "DOMESTIC" || derivedFt === "INTERNATIONAL") {
                setFlightType(derivedFt);
              }
            } else {
              // Authoritative backend returned 0 active packages for this configuration
              setPackages([]);
              setFetchError(false);
            }
          } else {
            setPackages([]);
            setFetchError(true);
          }
        }
      })
      .catch((_err) => {
        if (isMounted) {
          // Backend unreachable / offline — show unavailable state, never fabricate fake packages
          setPackages([]);
          setFetchError(true);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [airportCode, flightType, journeyType, effectiveTransitType, terminal, retryTrigger, journeyOrigin, journeyDest, journeyTransit]);

  return (
    <div className="space-y-8 my-10">
      {/* SECTION TITLE & HIERARCHY FILTERS */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-[#7c3aed] text-[10px] font-mono font-bold uppercase tracking-widest">
          <Crown className="w-3.5 h-3.5" />
          <span>Official Service Packages</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold">
          Dynamic Concierge Packages for <span className="italic">{cityName}</span>
        </h3>

        {/* Hierarchy Filters: Airport -> Journey Type -> Flight Type / Transit Type -> Terminal (DEL) -> Packages */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {/* Flight Type Segmented Control (Arrival & Departure) */}
          {journeyType !== "TRANSIT" && (
            <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 inline-flex items-center gap-1 text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setFlightType("DOMESTIC")}
                className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${flightType === "DOMESTIC"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Domestic
              </button>
              <button
                type="button"
                onClick={() => {
                  setFlightType("INTERNATIONAL");
                  if (airportCode.toUpperCase() === "DEL") {
                    setTerminal("Terminal 3");
                  }
                }}
                className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                  flightType === "INTERNATIONAL"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                International
              </button>
            </div>
          )}

          {/* Journey Type Segmented Control */}
          <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 inline-flex items-center gap-1 text-xs font-mono font-bold">
            <button
              type="button"
              onClick={() => setJourneyType("ARRIVAL")}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${journeyType === "ARRIVAL"
                  ? "bg-[#7c3aed] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Arrival
            </button>
            <button
              type="button"
              onClick={() => setJourneyType("DEPARTURE")}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${journeyType === "DEPARTURE"
                  ? "bg-[#7c3aed] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Departure
            </button>
            <button
              type="button"
              onClick={() => setJourneyType("TRANSIT")}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${journeyType === "TRANSIT"
                  ? "bg-[#7c3aed] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Transit
            </button>
          </div>

          {/* Terminal Segmented Control (Only displayed for Delhi Airport Arrival/Departure) */}
          {airportCode.toUpperCase() === "DEL" && journeyType !== "TRANSIT" && (
            flightType === "DOMESTIC" ? (
              <div className="p-1 rounded-2xl bg-amber-50 border border-amber-200 inline-flex items-center gap-1 text-xs font-mono font-bold">
                <button
                  type="button"
                  onClick={() => setTerminal("Terminal 1 & 2")}
                  className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${terminal === "Terminal 1 & 2"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-amber-900 hover:bg-amber-100/60"
                    }`}
                >
                  Terminal 1 & 2
                </button>
                <button
                  type="button"
                  onClick={() => setTerminal("Terminal 3")}
                  className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${terminal === "Terminal 3"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-amber-900 hover:bg-amber-100/60"
                    }`}
                >
                  Terminal 3
                </button>
              </div>
            ) : (
              <div className="px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-950 inline-flex items-center gap-2 text-xs font-mono font-bold">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                <span>Terminal 3 (International services operate exclusively from T3)</span>
              </div>
            )
          )}

        </div>

        {/* TRANSIT JOURNEY SUMMARY & SYSTEM-SELECTED SERVICE */}
        {journeyType === "TRANSIT" && (
          <div className="w-full max-w-xl mx-auto rounded-3xl bg-purple-50/70 border border-purple-200/80 p-5 sm:p-6 text-center shadow-xs space-y-4">
            {journeyOrigin && journeyDest ? (
              <>
                {/* Visual Journey Route: Origin -> Connecting Hub -> Final Destination */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xs font-mono">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 bg-white px-3.5 py-1.5 rounded-xl border border-purple-100 shadow-2xs">
                    <span>{originCity}</span>
                    <span className="text-slate-400 font-normal">({journeyOrigin})</span>
                  </div>

                  <span className="text-purple-600 font-bold max-sm:rotate-0 sm:-rotate-90">↓</span>

                  <div className="flex items-center gap-1.5 font-bold text-purple-900 bg-purple-100/90 px-3.5 py-1.5 rounded-xl border border-purple-200 shadow-2xs">
                    <span>{transitCity}</span>
                    <span className="text-purple-600 font-normal">({journeyTransit || airportCode})</span>
                    <span className="text-[10px] text-purple-700 font-sans font-medium uppercase tracking-wider ml-1 bg-white/80 px-1.5 py-0.5 rounded-md">
                      Connecting Airport
                    </span>
                  </div>

                  <span className="text-purple-600 font-bold max-sm:rotate-0 sm:-rotate-90">↓</span>

                  <div className="flex items-center gap-1.5 font-bold text-slate-900 bg-white px-3.5 py-1.5 rounded-xl border border-purple-100 shadow-2xs">
                    <span>{destCity}</span>
                    <span className="text-slate-400 font-normal">({journeyDest})</span>
                  </div>
                </div>

                {/* System-Determined Service Category */}
                <div className="pt-2 border-t border-purple-100/80 flex flex-col items-center justify-center gap-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-purple-700 font-bold">
                    Transit Service
                  </span>
                  <span className="text-lg sm:text-xl font-serif font-bold text-[#7c3aed]">
                    {TRANSIT_TITLE_MAP[effectiveTransitType] || "Transit Assistance"}
                  </span>
                  <span className="text-xs font-sans text-slate-500 font-medium">
                    Based on your journey
                  </span>
                </div>

                {/* Change Journey Action */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingJourney((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#7c3aed] hover:text-[#6d28d9] hover:underline px-3 py-1.5 rounded-xl hover:bg-purple-100/60 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>{isEditingJourney ? "Close Editor" : "Change Journey"}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="text-sm sm:text-base font-serif font-bold text-slate-900">
                  Select your journey to view available Transit services
                </div>
                <p className="text-xs text-slate-600 font-sans max-w-sm mx-auto leading-relaxed">
                  Provide your origin, connecting hub, and final destination to automatically determine your official transit package.
                </p>
                <button
                  type="button"
                  onClick={() => setIsEditingJourney(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-mono font-bold hover:bg-[#6d28d9] transition-colors cursor-pointer shadow-xs"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Select Journey</span>
                </button>
              </div>
            )}

            {/* Inline Journey Editor (Allows changing Origin, Transit Hub, and Final Destination) */}
            {isEditingJourney && (
              <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-white border border-purple-200/80 shadow-sm space-y-4 text-left">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                    Change Journey Airports
                  </span>
                  {journeyOrigin && journeyDest && (
                    <button
                      type="button"
                      onClick={() => setIsEditingJourney(false)}
                      className="text-xs font-mono font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Done
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Origin Airport */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">
                      Origin Airport *
                    </label>
                    <IntelligentAirportAutocomplete
                      mode="global"
                      value={originLabel || journeyOrigin}
                      onSelect={(ap) => {
                        setJourneyOrigin(ap.code);
                        setOriginLabel(formatAirportOption(ap));
                      }}
                      placeholder="Search origin airport"
                      inputClassName="h-10 text-xs rounded-xl"
                    />
                  </div>

                  {/* Transit Hub (Connecting) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">
                      Transit Hub *
                    </label>
                    <IntelligentAirportAutocomplete
                      mode="supported"
                      journeyType="TRANSIT"
                      value={transitLabel || journeyTransit}
                      onSelect={(ap) => {
                        setJourneyTransit(ap.code);
                        setTransitLabel(formatAirportOption(ap));
                      }}
                      placeholder="Search transit hub"
                      inputClassName="h-10 text-xs rounded-xl"
                    />
                  </div>

                  {/* Final Destination Airport */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">
                      Destination Airport *
                    </label>
                    <IntelligentAirportAutocomplete
                      mode="global"
                      value={destLabel || journeyDest}
                      onSelect={(ap) => {
                        setJourneyDest(ap.code);
                        setDestLabel(formatAirportOption(ap));
                      }}
                      placeholder="Search destination airport"
                      inputClassName="h-10 text-xs rounded-xl"
                    />
                  </div>
                </div>

                {journeyOrigin && journeyDest && (
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100 text-[11px] font-mono text-purple-700">
                    <span>
                      Recalculated Service: <strong>{TRANSIT_TITLE_MAP[getTransitCategory(journeyOrigin, journeyDest)] || "Transit"}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingJourney(false)}
                      className="px-4 py-1.5 rounded-xl bg-[#7c3aed] text-white font-bold hover:bg-[#6d28d9] transition-colors cursor-pointer text-xs"
                    >
                      Apply Changes
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* DYNAMIC CARDS GRID */}
      {loading ? (
        <div className="py-12 text-center text-xs font-mono text-slate-400">
          Loading production packages for {cityName}...
        </div>
      ) : fetchError ? (
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-base sm:text-lg font-serif font-bold text-slate-900">
              Airport services are temporarily unavailable.
            </h4>
            <p className="text-xs text-slate-600 font-sans max-w-md mx-auto leading-relaxed">
              We were unable to connect to the live service catalog for {cityName} ({airportCode}). Please retry or contact our 24/7 VIP Concierge directly.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRetryTrigger((c) => c + 1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <a
              href="https://wa.me/919599087959?text=Hello%20Shafsky%20Aviation,%20I%20need%20assistance%20with%20airport%20services"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#20bd5a] transition-all shadow-sm"
            >
              <span>WhatsApp Concierge</span>
            </a>
          </div>
        </div>
      ) : packages.length === 0 ? (
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7c3aed] flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-base sm:text-lg font-serif font-bold text-slate-900">
              No Active Packages for this Selection
            </h4>
            <p className="text-xs text-slate-600 font-sans max-w-md mx-auto leading-relaxed">
              No concierge packages are currently active for {journeyType.toLowerCase()} {flightType.toLowerCase()} flights at {cityName} ({airportCode}). Custom reservations can be arranged directly through our 24/7 concierge team.
            </p>
          </div>
          <div className="pt-2">
            <a
              href="https://wa.me/919599087959?text=Hello%20Shafsky%20Aviation,%20I%20would%20like%20to%20inquire%20about%20custom%20concierge%20services"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7c3aed] text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#6d28d9] transition-all shadow-sm"
            >
              <span>Contact Concierge Desk</span>
            </a>
          </div>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 ${packages.length === 1
              ? "max-w-md mx-auto"
              : packages.length === 2
                ? "md:grid-cols-2 max-w-4xl mx-auto"
                : "md:grid-cols-3"
            } gap-6 lg:gap-8`}
        >
          {packages.map((pkg: any, index: number) => {
            const isRec = !!pkg.isRecommended;
            const isSelected = selectedPackageId === pkg.id;
            const isExpanded = !!expandedPackages[pkg.id];
            const maxInitialFeatures = 5;
            const allFeatures: string[] = pkg.features || [];
            const hasMoreFeatures = allFeatures.length > maxInitialFeatures;
            const displayedFeatures = hasMoreFeatures && !isExpanded ? allFeatures.slice(0, maxInitialFeatures) : allFeatures;

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 transition-all duration-300 overflow-hidden ${isRec
                    ? "bg-white border-2 border-[#7c3aed] shadow-lg shadow-[#7c3aed]/10 z-10"
                    : isSelected
                      ? "bg-white border-2 border-[#7c3aed]"
                      : "bg-white border border-slate-200 shadow-sm hover:border-slate-300"
                  }`}
              >
                {/* RECOMMENDED BADGE */}
                {isRec && (
                  <div className="absolute top-0 right-0 left-0 py-1 bg-[#7c3aed] text-white text-center text-[10px] font-mono uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 shadow-sm">
                    <Crown className="w-3.5 h-3.5 fill-white" />
                    <span>✦ RECOMMENDED CHOICE ✦</span>
                  </div>
                )}

                <div className={isRec ? "pt-4" : ""}>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-2xl font-serif text-slate-900 font-bold">{pkg.title}</h4>
                  </div>

                  {/* SHORT DESCRIPTION */}
                  <p className="text-xs text-slate-600 font-sans mt-2.5 leading-relaxed font-medium">
                    {pkg.desc}
                  </p>

                  {/* PRICE HIGHLIGHT */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline justify-between gap-2">
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-[#7c3aed]">
                      {pkg.price}
                    </span>
                  </div>

                  {/* WHAT'S INCLUDED SECTION */}
                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                      What's Included:
                    </div>
                    <div className="space-y-2">
                      {displayedFeatures.map((feat: string, i: number) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium leading-normal">
                          <Check className="w-4 h-4 text-[#84cc16] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                    {hasMoreFeatures && (
                      <button
                        type="button"
                        onClick={() => setExpandedPackages((prev) => ({ ...prev, [pkg.id]: !prev[pkg.id] }))}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#7c3aed] hover:text-[#6d28d9] mt-2 cursor-pointer transition-colors"
                      >
                        <span>{isExpanded ? "Show Less" : "View All Benefits"}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {/* ADDITIONAL BENEFITS SECTION (Only if present) */}
                  {pkg.additionalBenefits && pkg.additionalBenefits.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
                      <div className="text-[10px] font-mono text-[#7c3aed] uppercase tracking-widest font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#7c3aed]" />
                        <span>Additional Benefits:</span>
                      </div>
                      <div className="space-y-2">
                        {pkg.additionalBenefits.map((benefit: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium leading-normal">
                            <span className="text-[#7c3aed] font-bold">•</span>
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* SELECT PACKAGE ACTION BUTTON */}
                {showBookButton && (
                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <Link
                      to="/book"
                      search={
                        {
                          ...(bookingSearch || {}),
                          source: "airport_page",
                          airport: journeyType === "TRANSIT" ? (journeyTransit || airportCode) : airportCode,
                          airport_name: journeyType === "TRANSIT" ? transitCity : cityName,
                          origin:
                            journeyType === "DEPARTURE"
                              ? airportCode
                              : journeyType === "TRANSIT"
                                ? journeyOrigin
                                : (bookingSearch?.origin as string) && (bookingSearch?.origin as string).toUpperCase() !== airportCode.toUpperCase()
                                  ? (bookingSearch?.origin as string)
                                  : "",
                          destination:
                            journeyType === "ARRIVAL"
                              ? airportCode
                              : journeyType === "TRANSIT"
                                ? journeyDest
                                : (bookingSearch?.destination as string) && (bookingSearch?.destination as string).toUpperCase() !== airportCode.toUpperCase()
                                  ? (bookingSearch?.destination as string)
                                  : "",
                          transit:
                            journeyType === "TRANSIT"
                              ? (journeyTransit || airportCode)
                              : undefined,
                          direction:
                            journeyType === "TRANSIT"
                              ? "transit"
                              : journeyType === "DEPARTURE"
                                ? "departure"
                                : "arrival",
                          travel_type:
                            journeyType === "TRANSIT"
                              ? effectiveTransitType.toLowerCase()
                              : flightType.toLowerCase(),
                          flight_type:
                            journeyType === "TRANSIT"
                              ? effectiveTransitType
                              : flightType.toLowerCase(),
                          transit_type:
                            journeyType === "TRANSIT"
                              ? effectiveTransitType
                              : undefined,
                          terminal: (isDel && flightType === "INTERNATIONAL") ? "Terminal 3" : terminal,
                          service_id: pkg.id,
                          booking_mode: "package",
                          package_id: pkg.id,
                          package_name: pkg.title || pkg.name || pkg.id,
                          package_price: pkg.price || "",
                          from_hero: "true",
                        } as any
                      }
                      onClick={() => onSelectPackage && onSelectPackage(pkg)}
                      className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer ${isRec
                          ? "bg-[#84cc16] text-[#0f172a] hover:bg-[#65a30d] shadow-sm"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                        }`}
                    >
                      <span>Continue with this Package</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
