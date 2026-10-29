import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  getAirportRegistryEntry,
  getTransitCategory,
  isAirportClassifiable,
  isIndianAirportCode,
} from "@/data/airportRegistry";
import { formatAirportOption } from "@/lib/api/airportApi";
import { ApiClient } from "@/lib/ApiClient";
import { toast } from "sonner";
import { type AirportServiceType } from "@/lib/api/multiServiceApi";
import {
  getNextJourneyStep,
  recordPackageSelection,
  getStoredBookingIntent,
} from "@/lib/journey/multiServiceJourney";
import {
  TRANSIT_TITLE_MAP,
  type MeetGreetPackageComparisonProps,
  journeyFromSearch,
  flightFromSearch,
  mapRawAirportPackages,
  MeetGreetTransitSection,
  MeetGreetPackagesGrid,
  MeetGreetTransitValidationModal,
} from "./meetGreetPackageData";

export {
  TRANSIT_TITLE_MAP,
  type MeetGreetPackageComparisonProps,
  journeyFromSearch,
  flightFromSearch,
  mapRawAirportPackages,
  MeetGreetTransitSection,
  MeetGreetPackagesGrid,
  MeetGreetTransitValidationModal,
};

export function MeetGreetPackageComparison({
  airportCode,
  selectedPackageId,
  onSelectPackage,
  showBookButton = true,
  bookingSearch,
}: MeetGreetPackageComparisonProps) {
  const navigate = useNavigate();
  const airportEntry = getAirportRegistryEntry(airportCode);
  const cityName = airportEntry?.city || airportCode;

  const isDel = airportCode.toUpperCase() === "DEL";

  // Distinguish home booking panel journey flow vs direct airport page access
  const isHomeTransitFlow = Boolean(
    bookingSearch?.from_hero === "true" &&
    (String(bookingSearch?.direction || "").toLowerCase() === "transit" ||
     String(bookingSearch?.direction || "").toLowerCase() === "connection") &&
    bookingSearch?.origin &&
    bookingSearch?.destination
  );

  const originParam = String(bookingSearch?.origin || "").trim().toUpperCase();
  const destParam = String(bookingSearch?.destination || "").trim().toUpperCase();
  const transitParam = String(bookingSearch?.transit || airportCode).trim().toUpperCase();

  const isFromHomepage = bookingSearch?.from_hero === "true";
  const hasRouteEndpoints = originParam.length === 3 && destParam.length === 3;
  const isCategoryLocked = Boolean(
    isFromHomepage || hasRouteEndpoints || bookingSearch?.travel_type || bookingSearch?.flight_type
  );

  const lockedFlightType = useMemo<"DOMESTIC" | "INTERNATIONAL">(() => {
    return flightFromSearch(bookingSearch);
  }, [bookingSearch]);

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
    () => (isCategoryLocked ? lockedFlightType : flightFromSearch(bookingSearch))
  );
  const [journeyType, setJourneyType] = useState<"ARRIVAL" | "DEPARTURE" | "TRANSIT">(
    () => journeyFromSearch(bookingSearch, airportCode)
  );

  const isDirectTransitAccess = journeyType === "TRANSIT" && !isHomeTransitFlow;

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
    return isHomeTransitFlow ? "DOMESTIC_DOMESTIC" : "";
  }, [journeyOrigin, journeyDest, bookingSearch?.transit_type, isHomeTransitFlow]);

  const [terminal, setTerminal] = useState<string>(() => {
    if (isDel && flightFromSearch(bookingSearch) === "INTERNATIONAL") {
      return "Terminal 3";
    }
    return "Terminal 1 & 2";
  });

  useEffect(() => {
    if (!bookingSearch?.from_hero && !bookingSearch?.direction && !bookingSearch?.origin && !bookingSearch?.destination) return;
    setJourneyType(journeyFromSearch(bookingSearch, airportCode));
    const flType = isCategoryLocked ? lockedFlightType : flightFromSearch(bookingSearch);
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
    isCategoryLocked,
    lockedFlightType,
  ]);

  // Keep category strictly locked for route-determined journeys
  useEffect(() => {
    if (isCategoryLocked && flightType !== lockedFlightType) {
      setFlightType(lockedFlightType);
    }
  }, [isCategoryLocked, lockedFlightType, flightType]);

  // Whenever flightType switches to INTERNATIONAL at DEL, redirect terminal to Terminal 3
  useEffect(() => {
    const activeFt = isCategoryLocked ? lockedFlightType : flightType;
    if (isDel && activeFt === "INTERNATIONAL") {
      setTerminal("Terminal 3");
    }
  }, [isDel, flightType, isCategoryLocked, lockedFlightType]);

  const handleFlightTypeChange = (newType: "DOMESTIC" | "INTERNATIONAL") => {
    if (isCategoryLocked) {
      toast.info(
        `Category is fixed to ${lockedFlightType.toLowerCase()} for this route (${originParam || journeyOrigin} → ${destParam || journeyDest}). Return to the homepage booking panel to change your journey.`
      );
      return;
    }

    const o = (journeyOrigin || "").trim().toUpperCase();
    const d = (journeyDest || "").trim().toUpperCase();
    const hasIntlAirport = (o && !isIndianAirportCode(o)) || (d && !isIndianAirportCode(d));
    const isBothDomestic = o && d && isIndianAirportCode(o) && isIndianAirportCode(d);

    if (newType === "DOMESTIC" && hasIntlAirport) {
      const intlCode = o && !isIndianAirportCode(o) ? o : d;
      toast.warning(`Your route includes an international airport (${intlCode}). Domestic packages cannot be selected.`);
      return;
    }
    if (newType === "INTERNATIONAL" && isBothDomestic) {
      toast.info(`Both airports (${o} and ${d}) are domestic in India.`);
    }

    setFlightType(newType);
    if (newType === "INTERNATIONAL" && airportCode.toUpperCase() === "DEL") {
      setTerminal("Terminal 3");
    }
  };

  // Direct access Transit category filter state (show one category at a time, never all 4 at once)
  const [directCategoryFilter, setDirectCategoryFilter] = useState<string>("DOMESTIC_DOMESTIC");

  // Direct access Transit journey validation modal state (pre-filled with any previous selections)
  const initialModalOrigin = String(bookingSearch?.origin || journeyOrigin || "").trim().toUpperCase();
  const initialModalDest = String(bookingSearch?.destination || journeyDest || "").trim().toUpperCase();
  const [isValidationModalOpen, setIsValidationModalOpen] = useState<boolean>(false);
  const [validatingPackage, setValidatingPackage] = useState<any | null>(null);
  const [valOrigin, setValOrigin] = useState<string>(initialModalOrigin);
  const [valOriginLabel, setValOriginLabel] = useState<string>(() => {
    if (!initialModalOrigin) return "";
    const oe = getAirportRegistryEntry(initialModalOrigin);
    return oe ? formatAirportOption(oe) : initialModalOrigin;
  });
  const [valDest, setValDest] = useState<string>(initialModalDest);
  const [valDestLabel, setValDestLabel] = useState<string>(() => {
    if (!initialModalDest) return "";
    const de = getAirportRegistryEntry(initialModalDest);
    return de ? formatAirportOption(de) : initialModalDest;
  });
  const [valTransit, setValTransit] = useState<string>(airportCode);
  const [valTransitLabel, setValTransitLabel] = useState<string>(() =>
    airportEntry ? formatAirportOption(airportEntry) : airportCode
  );

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

    const effFlightType = isCategoryLocked ? lockedFlightType : flightType;
    const activeTerminal = isDel && effFlightType === "INTERNATIONAL" ? "Terminal 3" : terminal;
    const terminalParam = journeyType !== "TRANSIT" && isDel && activeTerminal ? `&terminal=${encodeURIComponent(activeTerminal)}` : "";
    const effOrigin = journeyType === "TRANSIT" ? journeyOrigin : originParam;
    const effDest = journeyType === "TRANSIT" ? journeyDest : destParam;
    const effHub = journeyType === "TRANSIT" ? (journeyTransit || airportCode) : airportCode;

    let fetchUrl: string;
    if (journeyType === "TRANSIT") {
      if (isHomeTransitFlow && effectiveTransitType) {
        // Home booking flow: filter by authoritative route-determined transit category
        const routeParam =
          effOrigin && effDest
            ? `&origin=${encodeURIComponent(effOrigin)}&destination=${encodeURIComponent(effDest)}`
            : "";
        fetchUrl = `/api/journey/airports/${effHub}/services?journey_type=TRANSIT&flight_type=${effectiveTransitType}${routeParam}`;
      } else {
        // Direct airport-page transit access: load all configured transit services for this airport without assuming defaults
        fetchUrl = `/api/journey/airports/${effHub}/services?journey_type=TRANSIT`;
      }
    } else {
      fetchUrl = `/api/journey/airports/${effHub}/services?journey_type=${journeyType}&flight_type=${effFlightType}${terminalParam}`;
    }

    ApiClient.fetchWithAuth(fetchUrl)
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
              const mapped = mapRawAirportPackages(data.data, journeyType, airportCode);
              setPackages(mapped);
              setFetchError(false);
              if (!isCategoryLocked) {
                const derivedFt = String(data.flight_type || "").toUpperCase();
                if (derivedFt === "DOMESTIC" || derivedFt === "INTERNATIONAL") {
                  setFlightType(derivedFt);
                }
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
  }, [
    airportCode,
    flightType,
    journeyType,
    effectiveTransitType,
    terminal,
    retryTrigger,
    journeyOrigin,
    journeyDest,
    journeyTransit,
    isHomeTransitFlow,
    isDirectTransitAccess,
    isCategoryLocked,
    lockedFlightType,
  ]);

  const configuredCategories = useMemo(() => {
    const cats = packages.map((p: any) => p.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [packages]);

  useEffect(() => {
    if (configuredCategories.length > 0 && !configuredCategories.includes(directCategoryFilter)) {
      setDirectCategoryFilter(configuredCategories[0]);
    }
  }, [configuredCategories, directCategoryFilter]);

  const displayedPackages = useMemo(() => {
    if (!isDirectTransitAccess) return packages;
    return packages.filter((p: any) => p.category === directCategoryFilter);
  }, [isDirectTransitAccess, directCategoryFilter, packages]);

  const handleSelectPackageAndContinue = (pkg: any) => {
    if (onSelectPackage) onSelectPackage(pkg);

    // Identify current service
    const currentService: AirportServiceType = journeyType;

    // Persist this package selection
    recordPackageSelection(currentService, pkg.id);

    // Check all services in the itinerary
    const storedIntent = getStoredBookingIntent();
    const servicesParam = String(bookingSearch?.services || storedIntent.services || "").trim();
    const allSelectedServices: AirportServiceType[] = servicesParam
      ? (servicesParam.split(",").map((s) => s.trim().toUpperCase() as AirportServiceType).filter(Boolean))
      : [currentService];

    const effOrigin = journeyType === "TRANSIT" ? journeyOrigin : ((bookingSearch?.origin as string) || journeyOrigin || (journeyType === "DEPARTURE" ? airportCode : ""));
    const effDest = journeyType === "TRANSIT" ? journeyDest : ((bookingSearch?.destination as string) || journeyDest || (journeyType === "ARRIVAL" ? airportCode : ""));
    const effTransit = (bookingSearch?.transit as string) || journeyTransit || airportCode;

    const existingPkgs: Record<string, string> = {
      ...(storedIntent.packages_by_service || {}),
      ...(bookingSearch?.pkg_departure ? { DEPARTURE: bookingSearch.pkg_departure as string } : {}),
      ...(bookingSearch?.pkg_transit ? { TRANSIT: bookingSearch.pkg_transit as string } : {}),
      ...(bookingSearch?.pkg_arrival ? { ARRIVAL: bookingSearch.pkg_arrival as string } : {}),
      [currentService]: pkg.id,
    };

    const nextDecision = getNextJourneyStep(
      currentService,
      pkg.id,
      allSelectedServices,
      effOrigin,
      effDest,
      effTransit,
      storedIntent.services_availability,
      existingPkgs,
      {
        ...(bookingSearch || {}),
        source: "airport_page",
        package_name: pkg.title || pkg.name || pkg.id,
        package_price: pkg.price || "",
        terminal: (isDel && (isCategoryLocked ? lockedFlightType : flightType) === "INTERNATIONAL") ? "Terminal 3" : terminal,
        travel_type: journeyType === "TRANSIT"
          ? effectiveTransitType.toLowerCase()
          : (isCategoryLocked ? lockedFlightType.toLowerCase() : flightType.toLowerCase()),
        flight_type: journeyType === "TRANSIT"
          ? effectiveTransitType
          : (isCategoryLocked ? lockedFlightType : flightType),
        transit_type: journeyType === "TRANSIT" ? effectiveTransitType : (bookingSearch?.transit_type || undefined),
      }
    );

    if (nextDecision.type === "AIRPORT_PAGE" && nextDecision.targetAirport) {
      navigate({
        to: "/airports/$code",
        params: { code: nextDecision.targetAirport },
        hash: "available-services",
        search: nextDecision.searchParams as any,
      });
    } else {
      navigate({
        to: "/book",
        search: nextDecision.searchParams as any,
      });
    }
  };

  const proceedToBooking = (
    pkg: any,
    origin: string,
    dest: string,
    hub: string,
    category: string
  ) => {
    recordPackageSelection("TRANSIT", pkg.id);
    const storedIntent = getStoredBookingIntent();
    const servicesParam = String(bookingSearch?.services || storedIntent.services || "").trim();
    const allSelectedServices: AirportServiceType[] = servicesParam
      ? (servicesParam.split(",").map((s) => s.trim().toUpperCase() as AirportServiceType).filter(Boolean))
      : ["TRANSIT"];

    const existingPkgs: Record<string, string> = {
      ...(storedIntent.packages_by_service || {}),
      ...(bookingSearch?.pkg_departure ? { DEPARTURE: bookingSearch.pkg_departure as string } : {}),
      ...(bookingSearch?.pkg_transit ? { TRANSIT: bookingSearch.pkg_transit as string } : {}),
      ...(bookingSearch?.pkg_arrival ? { ARRIVAL: bookingSearch.pkg_arrival as string } : {}),
      TRANSIT: pkg.id,
    };

    const nextDecision = getNextJourneyStep(
      "TRANSIT",
      pkg.id,
      allSelectedServices,
      origin,
      dest,
      hub,
      storedIntent.services_availability,
      existingPkgs,
      {
        ...(bookingSearch || {}),
        source: "airport_page",
        origin,
        destination: dest,
        transit: hub,
        package_id: pkg.id,
        package_name: pkg.title || pkg.name || pkg.id,
        package_price: pkg.price || "",
        travel_type: category.toLowerCase(),
        flight_type: category,
        transit_type: category,
        terminal: isDel && category.includes("INTERNATIONAL") ? "Terminal 3" : terminal,
      }
    );

    if (nextDecision.type === "AIRPORT_PAGE" && nextDecision.targetAirport) {
      navigate({
        to: "/airports/$code",
        params: { code: nextDecision.targetAirport },
        hash: "available-services",
        search: nextDecision.searchParams as any,
      });
    } else {
      navigate({
        to: "/book",
        search: nextDecision.searchParams as any,
      });
    }
  };

  const handleDirectTransitPackageClick = (pkg: any) => {
    if (onSelectPackage) onSelectPackage(pkg);
    setValidatingPackage(pkg);

    // Reuse any previously selected airports (from modal state, journey state, or URL search)
    const effectiveOrigin = (valOrigin || journeyOrigin || (bookingSearch?.origin as string) || "").trim().toUpperCase();
    const effectiveDest = (valDest || journeyDest || (bookingSearch?.destination as string) || "").trim().toUpperCase();
    const effectiveTransit = (valTransit || journeyTransit || (bookingSearch?.transit as string) || airportCode).trim().toUpperCase();

    if (effectiveOrigin) {
      setValOrigin(effectiveOrigin);
      const oe = getAirportRegistryEntry(effectiveOrigin);
      setValOriginLabel(valOriginLabel || originLabel || (oe ? formatAirportOption(oe) : effectiveOrigin));
    }
    if (effectiveDest) {
      setValDest(effectiveDest);
      const de = getAirportRegistryEntry(effectiveDest);
      setValDestLabel(valDestLabel || destLabel || (de ? formatAirportOption(de) : effectiveDest));
    }
    setValTransit(effectiveTransit);
    const te = getAirportRegistryEntry(effectiveTransit);
    setValTransitLabel(valTransitLabel || transitLabel || (te ? formatAirportOption(te) : effectiveTransit));

    setIsValidationModalOpen(true);
  };

  const validationState = useMemo(() => {
    if (!validatingPackage) return null;
    const orig = valOrigin.trim().toUpperCase();
    const dst = valDest.trim().toUpperCase();
    const hub = (valTransit || airportCode).trim().toUpperCase();

    if (!orig || !dst) {
      return {
        status: "INCOMPLETE" as const,
        message: "Please select both Origin and Final Destination airports to validate your transit package.",
      };
    }

    if (orig === dst) {
      return {
        status: "INVALID_ROUTE" as const,
        message: "Origin and Final Destination cannot be the same airport.",
      };
    }

    if (orig === hub || dst === hub) {
      return {
        status: "INVALID_ROUTE" as const,
        message: "Connecting transit airport cannot be the same as origin or final destination.",
      };
    }

    if (!isAirportClassifiable(orig) || !isAirportClassifiable(dst)) {
      return {
        status: "UNCLASSIFIABLE" as const,
        message: "Airport classification is unavailable for the selected route. Please select valid 3-letter IATA airports from the search list.",
      };
    }

    const calculatedCategory = getTransitCategory(orig, dst);
    const selectedCategory = validatingPackage.category;

    if (calculatedCategory === selectedCategory) {
      return {
        status: "MATCH" as const,
        calculatedCategory,
        selectedCategory,
        message: `Your route is verified as ${TRANSIT_TITLE_MAP[calculatedCategory] || calculatedCategory}. This matches the selected package.`,
      };
    }

    const matchingAlternativePkg = packages.find(
      (p) => p.category === calculatedCategory
    );

    return {
      status: "MISMATCH" as const,
      calculatedCategory,
      selectedCategory,
      matchingAlternativePkg,
      message: `Category Mismatch: Your route from ${orig} to ${dst} is classified as ${TRANSIT_TITLE_MAP[calculatedCategory] || calculatedCategory}, which does not match the selected ${TRANSIT_TITLE_MAP[selectedCategory] || selectedCategory} package.`,
    };
  }, [validatingPackage, valOrigin, valDest, valTransit, airportCode, packages]);

  const handleConfirmAndBook = () => {
    if (!validatingPackage || !validationState || validationState.status !== "MATCH") return;
    const orig = valOrigin.trim().toUpperCase();
    const dst = valDest.trim().toUpperCase();
    const hub = (valTransit || airportCode).trim().toUpperCase();
    const cat = validationState.calculatedCategory!;

    setJourneyOrigin(orig);
    setJourneyDest(dst);
    setJourneyTransit(hub);
    setOriginLabel(valOriginLabel || orig);
    setDestLabel(valDestLabel || dst);
    setTransitLabel(valTransitLabel || hub);
    setIsValidationModalOpen(false);

    proceedToBooking(validatingPackage, orig, dst, hub, cat);
  };

  const handleSwitchToMatchingPackage = (matchingPkg: any) => {
    setValidatingPackage(matchingPkg);
    if (onSelectPackage) onSelectPackage(matchingPkg);
  };

  return (
    <div className="space-y-8 my-10">
      {/* HIERARCHY FILTERS: Airport -> Journey Type -> Flight Type / Transit Type -> Terminal (DEL) -> Packages */}
      <div className="text-center max-w-2xl mx-auto space-y-4">

        {/* Hierarchy Filters: Airport -> Journey Type -> Flight Type / Transit Type -> Terminal (DEL) -> Packages */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {/* Flight Type Segmented Control (Arrival & Departure) */}
          {journeyType !== "TRANSIT" && (
            <div className="flex flex-col items-center gap-1.5">
              <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 inline-flex items-center gap-1 text-xs font-mono font-bold">
                <button
                  type="button"
                  onClick={() => handleFlightTypeChange("DOMESTIC")}
                  className={`px-4 py-1.5 rounded-xl transition-all ${
                    flightType === "DOMESTIC"
                      ? "bg-slate-900 text-white shadow-xs cursor-default"
                      : isCategoryLocked
                        ? "text-slate-400 opacity-60 cursor-not-allowed hover:bg-slate-200/50"
                        : "text-slate-600 hover:text-slate-900 cursor-pointer"
                  }`}
                  title={
                    isCategoryLocked && flightType !== "DOMESTIC"
                      ? "Category is locked to your selected route. Return to the homepage to change journey."
                      : undefined
                  }
                >
                  Domestic
                </button>
                <button
                  type="button"
                  onClick={() => handleFlightTypeChange("INTERNATIONAL")}
                  className={`px-4 py-1.5 rounded-xl transition-all ${
                    flightType === "INTERNATIONAL"
                      ? "bg-slate-900 text-white shadow-xs cursor-default"
                      : isCategoryLocked
                        ? "text-slate-400 opacity-60 cursor-not-allowed hover:bg-slate-200/50"
                        : "text-slate-600 hover:text-slate-900 cursor-pointer"
                  }`}
                  title={
                    isCategoryLocked && flightType !== "INTERNATIONAL"
                      ? "Category is locked to your selected route. Return to the homepage to change journey."
                      : undefined
                  }
                >
                  International
                </button>
              </div>
              {isCategoryLocked && (
                <div className="flex items-center gap-1 text-[10.5px] font-mono text-slate-500">
                  <span>Locked for journey: {originParam || journeyOrigin} → {destParam || journeyDest} ({flightType.toLowerCase()}).</span>
                  <Link
                    to="/"
                    hash="book"
                    className="text-[#7c3aed] hover:underline font-semibold ml-1"
                  >
                    Change on homepage
                  </Link>
                </div>
              )}
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

        {/* TRANSIT DISPLAY: DIRECT AIRPORT-PAGE ACCESS VS PRESERVED HOME BOOKING FLOW */}
        <MeetGreetTransitSection
          journeyType={journeyType}
          isDirectTransitAccess={isDirectTransitAccess}
          configuredCategories={configuredCategories}
          directCategoryFilter={directCategoryFilter}
          setDirectCategoryFilter={setDirectCategoryFilter}
          journeyOrigin={journeyOrigin}
          setJourneyOrigin={setJourneyOrigin}
          originLabel={originLabel}
          setOriginLabel={setOriginLabel}
          originCity={originCity}
          journeyDest={journeyDest}
          setJourneyDest={setJourneyDest}
          destLabel={destLabel}
          setDestLabel={setDestLabel}
          destCity={destCity}
          journeyTransit={journeyTransit}
          setJourneyTransit={setJourneyTransit}
          transitLabel={transitLabel}
          setTransitLabel={setTransitLabel}
          transitCity={transitCity}
          airportCode={airportCode}
          effectiveTransitType={effectiveTransitType}
          isEditingJourney={isEditingJourney}
          setIsEditingJourney={setIsEditingJourney}
          flightType={flightType}
          setFlightType={setFlightType}
        />
      </div>

      {/* DYNAMIC CARDS GRID */}
      <MeetGreetPackagesGrid
        loading={loading}
        fetchError={fetchError}
        cityName={cityName}
        airportCode={airportCode}
        journeyType={journeyType}
        flightType={flightType}
        packages={packages}
        displayedPackages={displayedPackages}
        selectedPackageId={selectedPackageId}
        expandedPackages={expandedPackages}
        setExpandedPackages={setExpandedPackages}
        isDirectTransitAccess={isDirectTransitAccess}
        showBookButton={showBookButton}
        onRetry={() => setRetryTrigger((c) => c + 1)}
        onDirectTransitPackageClick={handleDirectTransitPackageClick}
        onSelectPackageAndContinue={handleSelectPackageAndContinue}
      />

      {/* JOURNEY VALIDATION MODAL FOR DIRECT AIRPORT-PAGE TRANSIT ACCESS */}
      <MeetGreetTransitValidationModal
        isOpen={isValidationModalOpen}
        validatingPackage={validatingPackage}
        onClose={() => setIsValidationModalOpen(false)}
        cityName={cityName}
        airportCode={airportCode}
        valOrigin={valOrigin}
        valOriginLabel={valOriginLabel}
        onSelectOrigin={(ap) => {
          setValOrigin(ap.code);
          const lbl = formatAirportOption(ap);
          setValOriginLabel(lbl);
          setJourneyOrigin(ap.code);
          setOriginLabel(lbl);
        }}
        valDest={valDest}
        valDestLabel={valDestLabel}
        onSelectDest={(ap) => {
          setValDest(ap.code);
          const lbl = formatAirportOption(ap);
          setValDestLabel(lbl);
          setJourneyDest(ap.code);
          setDestLabel(lbl);
        }}
        validationState={validationState}
        onSwitchToMatchingPackage={handleSwitchToMatchingPackage}
        onConfirmAndBook={handleConfirmAndBook}
      />
    </div>
  );
}
