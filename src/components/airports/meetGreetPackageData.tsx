import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Pencil,
  X,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  getRouteFlightCategory,
  getTransitCategory,
  isIndianAirportCode,
} from "@/data/airportRegistry";
import { IntelligentAirportAutocomplete } from "@/components/booking/shared/IntelligentAirportAutocomplete";
import { formatAirportOption } from "@/lib/api/airportApi";
import { toast } from "sonner";

export const TRANSIT_TITLE_MAP: Record<string, string> = {
  DOMESTIC_DOMESTIC: "Domestic → Domestic",
  DOMESTIC_INTERNATIONAL: "Domestic → International",
  INTERNATIONAL_DOMESTIC: "International → Domestic",
  INTERNATIONAL_INTERNATIONAL: "International → International",
};

export interface MeetGreetPackageComparisonProps {
  airportCode: string;
  selectedPackageId?: string;
  onSelectPackage?: (pkg: any) => void;
  showBookButton?: boolean;
  bookingSearch?: Record<string, unknown>;
}

export function journeyFromSearch(
  search?: Record<string, unknown>,
  currentAirportCode?: string
): "ARRIVAL" | "DEPARTURE" | "TRANSIT" {
  const raw = String(search?.direction || search?.journey_type || "").toUpperCase();
  if (raw === "DEPARTURE" || raw === "DEP") return "DEPARTURE";
  if (raw === "TRANSIT" || raw === "CONNECTION") return "TRANSIT";
  if (raw === "ARRIVAL" || raw === "ARR") return "ARRIVAL";

  const code = (currentAirportCode || String(search?.airport || "")).trim().toUpperCase();
  const orig = String(search?.origin || "").trim().toUpperCase();
  const dest = String(search?.destination || "").trim().toUpperCase();
  const trans = String(search?.transit || "").trim().toUpperCase();

  if (code && code === orig) return "DEPARTURE";
  if (code && code === trans) return "TRANSIT";
  if (code && code === dest) return "ARRIVAL";

  const services = String(search?.services || "");
  if (services.includes("DEPARTURE")) return "DEPARTURE";
  if (services.includes("TRANSIT")) return "TRANSIT";
  return "ARRIVAL";
}

export function flightFromSearch(search?: Record<string, unknown>): "DOMESTIC" | "INTERNATIONAL" {
  const o = String(search?.origin || "").trim().toUpperCase();
  const d = String(search?.destination || "").trim().toUpperCase();
  if (o.length === 3 && d.length === 3) {
    return getRouteFlightCategory(o, d).toUpperCase() as "DOMESTIC" | "INTERNATIONAL";
  }
  if ((o.length === 3 && !isIndianAirportCode(o)) || (d.length === 3 && !isIndianAirportCode(d))) {
    return "INTERNATIONAL";
  }
  const raw = String(search?.travel_type || search?.flight_type || "").toUpperCase();
  if (raw === "INTERNATIONAL" || raw === "INTL" || raw === "INT") return "INTERNATIONAL";
  return "DOMESTIC";
}

export function mapRawAirportPackages(
  rawItems: any[],
  journeyType: "ARRIVAL" | "DEPARTURE" | "TRANSIT",
  airportCode: string
): any[] {
  return rawItems.map((item: any) => {
    const slug = item.service?.slug || item.id;
    let itemFeatures = item.features || [];
    const isArrival = item.journey_type === "ARRIVAL" || journeyType === "ARRIVAL";
    if (!itemFeatures || itemFeatures.length === 0) {
      const arrivalWelcome = isArrival
        ? "WELCOME GUEST FROM END OF THE AEROBRIDGE"
        : "WELCOME IN THE END OF THE AEROBRIDGE";
      if (slug === "platinum") {
        itemFeatures = [
          arrivalWelcome,
          "Dedicated Staff with Placard",
          "Baggage Assist (Up to 3 Pieces)",
          "Assist at the Baggage Belt Area",
          "Coordination with the Receiving Party",
          "ASSIST GUEST TILL THE CAR PARKING AREA",
        ];
      } else if (slug === "elite") {
        itemFeatures = [
          arrivalWelcome,
          "Dedicated Staff with Placard",
          "Baggage Assist",
          "Assist at the Baggage Belt Area",
          "Coordination with the Receiving Party",
          "ASSIST GUEST TILL THE CAR PARKING AREA",
        ];
      }
    }

    let title = item.service?.name || "Service Package";
    if (item.journey_type === "TRANSIT" && item.flight_type && TRANSIT_TITLE_MAP[item.flight_type]) {
      title = TRANSIT_TITLE_MAP[item.flight_type];
    } else if (airportCode.toUpperCase() === "ATQ") {
      title = title.replace(/\bEscort\b/gi, "").trim();
    }

    const cleanPackageText = (txt: string) => {
      if (typeof txt !== "string") return txt;
      if (/^(WELCOME GUEST FROM AEROBRIDGE\.?|WELCOME GUEST FROM THE AEROBRIDGE\.?|WELCOME AT THE AEROBRIDGE\.?|WELCOME GUEST FROM AEROBRIDGE \.?|WELCOME AT THE END OF THE AEROBRIDGE\.?|WELCOME IN THE END OF THE AEROBRIDGE\.?|WELCOME GUEST FROM END OF THE AEROBRIDGE\.?|Welcome at the End of the Aerobridge\.?|Welcome in the End of the Aerobridge\.?|Welcome at the Aerobridge)$/i.test(txt.trim())) {
        return isArrival
          ? "WELCOME GUEST FROM END OF THE AEROBRIDGE"
          : "WELCOME IN THE END OF THE AEROBRIDGE";
      }
      if (/^(Escort to the Car Parking Area|Escort to the Parking Area|DROP OFF TILL CAR PARKING AREA\.?|DROP OFF CAR PARKING AREA|DROP OFF TILL CAR PARKING\.?|ASSIST GUEST TILL THE PARKING AREA\.?|ASSIST GUEST TILL THE CAR PARKING AREA\.?)$/i.test(txt.trim())) {
        return "ASSIST GUEST TILL THE CAR PARKING AREA";
      }
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
      category: item.flight_type || "",
      categoryTitle: item.flight_type && TRANSIT_TITLE_MAP[item.flight_type] ? TRANSIT_TITLE_MAP[item.flight_type] : "",
      title: cleanPackageText(title),
      desc: cleanPackageText(item.short_description || item.service?.description || "VIP Airport Service Package."),
      price: `${item.currency === "USD" ? "$" : "₹"}${item.price?.toLocaleString()}`,
      rawPrice: item.price,
      features: itemFeatures.map(cleanPackageText),
      additionalBenefits: (item.additional_benefits || []).map(cleanPackageText),
      isRecommended: !!item.is_recommended,
    };
  });
}

export interface MeetGreetTransitSectionProps {
  journeyType: "ARRIVAL" | "DEPARTURE" | "TRANSIT";
  isDirectTransitAccess: boolean;
  configuredCategories: string[];
  directCategoryFilter: string;
  setDirectCategoryFilter: (cat: string) => void;
  journeyOrigin: string;
  setJourneyOrigin: (val: string) => void;
  originLabel: string;
  setOriginLabel: (val: string) => void;
  originCity: string;
  journeyDest: string;
  setJourneyDest: (val: string) => void;
  destLabel: string;
  setDestLabel: (val: string) => void;
  destCity: string;
  journeyTransit: string;
  setJourneyTransit: (val: string) => void;
  transitLabel: string;
  setTransitLabel: (val: string) => void;
  transitCity: string;
  airportCode: string;
  effectiveTransitType: string;
  isEditingJourney: boolean;
  setIsEditingJourney: React.Dispatch<React.SetStateAction<boolean>>;
  flightType: "DOMESTIC" | "INTERNATIONAL";
  setFlightType: (val: "DOMESTIC" | "INTERNATIONAL") => void;
}

export function MeetGreetTransitSection({
  journeyType,
  isDirectTransitAccess,
  configuredCategories,
  directCategoryFilter,
  setDirectCategoryFilter,
  journeyOrigin,
  setJourneyOrigin,
  originLabel,
  setOriginLabel,
  originCity,
  journeyDest,
  setJourneyDest,
  destLabel,
  setDestLabel,
  destCity,
  journeyTransit,
  setJourneyTransit,
  transitLabel,
  setTransitLabel,
  transitCity,
  airportCode,
  effectiveTransitType,
  isEditingJourney,
  setIsEditingJourney,
  flightType,
  setFlightType,
}: MeetGreetTransitSectionProps) {
  if (journeyType !== "TRANSIT") return null;

  if (isDirectTransitAccess) {
    /* Direct Airport-Page Access: Category selector (one at a time, never all 4 at once) */
    if (configuredCategories.length <= 1) return null;
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {configuredCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setDirectCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              directCategoryFilter === cat
                ? "bg-[#7c3aed] text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs"
            }`}
          >
            {TRANSIT_TITLE_MAP[cat] || cat}
          </button>
        ))}
      </div>
    );
  }

  /* Preserved Home Booking Flow: Route summary + Authoritative category + Change Journey editor */
  return (
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
      ) : null}

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
                  const nextOrigin = ap.code.trim().toUpperCase();
                  setJourneyOrigin(nextOrigin);
                  setOriginLabel(formatAirportOption(ap));
                  if (!isIndianAirportCode(nextOrigin) && flightType !== "INTERNATIONAL") {
                    setFlightType("INTERNATIONAL");
                    toast.info(`International airport selected (${nextOrigin}). Packages updated to International.`);
                  } else if (
                    isIndianAirportCode(nextOrigin) &&
                    journeyDest &&
                    isIndianAirportCode(journeyDest) &&
                    flightType !== "DOMESTIC"
                  ) {
                    setFlightType("DOMESTIC");
                    toast.info(`Domestic route detected (${nextOrigin} → ${journeyDest}). Packages updated to Domestic.`);
                  }
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
                  const nextDest = ap.code.trim().toUpperCase();
                  setJourneyDest(nextDest);
                  setDestLabel(formatAirportOption(ap));
                  if (!isIndianAirportCode(nextDest) && flightType !== "INTERNATIONAL") {
                    setFlightType("INTERNATIONAL");
                    toast.info(`International airport selected (${nextDest}). Packages updated to International.`);
                  } else if (
                    isIndianAirportCode(nextDest) &&
                    journeyOrigin &&
                    isIndianAirportCode(journeyOrigin) &&
                    flightType !== "DOMESTIC"
                  ) {
                    setFlightType("DOMESTIC");
                    toast.info(`Domestic route detected (${journeyOrigin} → ${nextDest}). Packages updated to Domestic.`);
                  }
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
  );
}

export interface MeetGreetPackagesGridProps {
  loading: boolean;
  fetchError: boolean;
  cityName: string;
  airportCode: string;
  journeyType: "ARRIVAL" | "DEPARTURE" | "TRANSIT";
  flightType: "DOMESTIC" | "INTERNATIONAL";
  packages: any[];
  displayedPackages: any[];
  selectedPackageId?: string;
  expandedPackages: Record<string, boolean>;
  setExpandedPackages: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  isDirectTransitAccess: boolean;
  showBookButton: boolean;
  onRetry: () => void;
  onDirectTransitPackageClick: (pkg: any) => void;
  onSelectPackageAndContinue: (pkg: any) => void;
}

export function MeetGreetPackagesGrid({
  loading,
  fetchError,
  cityName,
  airportCode,
  journeyType,
  flightType,
  packages,
  displayedPackages,
  selectedPackageId,
  expandedPackages,
  setExpandedPackages,
  isDirectTransitAccess,
  showBookButton,
  onRetry,
  onDirectTransitPackageClick,
  onSelectPackageAndContinue,
}: MeetGreetPackagesGridProps) {
  if (loading) {
    return (
      <div className="py-12 text-center text-xs font-mono text-slate-400">
        Loading production packages for {cityName}...
      </div>
    );
  }

  if (fetchError) {
    return (
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
            onClick={onRetry}
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
    );
  }

  if (packages.length === 0) {
    return (
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
    );
  }

  return (
    <div
      className={`grid grid-cols-1 ${
        displayedPackages.length === 1
          ? "max-w-md mx-auto"
          : displayedPackages.length === 2
            ? "md:grid-cols-2 max-w-4xl mx-auto"
            : "md:grid-cols-3"
      } gap-6 lg:gap-8`}
    >
      {displayedPackages.map((pkg: any, index: number) => {
        const isRec = !!pkg.isRecommended;
        const isSelected = selectedPackageId === pkg.id;
        const isExpanded = !!expandedPackages[pkg.id];
        const maxInitialFeatures = 5;
        const allFeatures: string[] = pkg.features || [];
        const hasMoreFeatures = allFeatures.length > maxInitialFeatures;
        const displayedFeatures = hasMoreFeatures && !isExpanded ? allFeatures.slice(0, maxInitialFeatures) : allFeatures;

        return (
          <motion.div
            key={`${pkg.id}-${pkg.category || index}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 transition-all duration-300 overflow-hidden ${
              isRec
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
              {/* DIRECT TRANSIT CATEGORY BADGE */}
              {isDirectTransitAccess && pkg.categoryTitle && (
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-100 text-[#7c3aed] text-[10px] font-mono font-bold uppercase tracking-wider">
                    {pkg.categoryTitle}
                  </span>
                </div>
              )}

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
                {isDirectTransitAccess ? (
                  <button
                    type="button"
                    onClick={() => onDirectTransitPackageClick(pkg)}
                    className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer ${
                      isRec
                        ? "bg-[#84cc16] text-[#0f172a] hover:bg-[#65a30d] shadow-sm"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    <span>Continue with this Package</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectPackageAndContinue(pkg)}
                    className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer ${
                      isRec
                        ? "bg-[#84cc16] text-[#0f172a] hover:bg-[#65a30d] shadow-sm"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    <span>Continue with this Package</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export interface MeetGreetTransitValidationModalProps {
  isOpen: boolean;
  validatingPackage: any | null;
  onClose: () => void;
  cityName: string;
  airportCode: string;
  valOrigin: string;
  valOriginLabel: string;
  onSelectOrigin: (ap: any) => void;
  valDest: string;
  valDestLabel: string;
  onSelectDest: (ap: any) => void;
  validationState: {
    status: "INCOMPLETE" | "INVALID_ROUTE" | "UNCLASSIFIABLE" | "MATCH" | "MISMATCH";
    message: string;
    calculatedCategory?: string;
    selectedCategory?: string;
    matchingAlternativePkg?: any;
  } | null;
  onSwitchToMatchingPackage: (matchingPkg: any) => void;
  onConfirmAndBook: () => void;
}

export function MeetGreetTransitValidationModal({
  isOpen,
  validatingPackage,
  onClose,
  cityName,
  airportCode,
  valOrigin,
  valOriginLabel,
  onSelectOrigin,
  valDest,
  valDestLabel,
  onSelectDest,
  validationState,
  onSwitchToMatchingPackage,
  onConfirmAndBook,
}: MeetGreetTransitValidationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && validatingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-purple-100 p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-lg font-serif font-bold text-slate-900">
                  Confirm Route
                </h4>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Package: <strong className="text-slate-800">{validatingPackage.title}</strong> • <strong className="text-[#7c3aed]">{validatingPackage.price}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 pt-1">
              {/* Departure Airport */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                  Departure Airport
                </label>
                <IntelligentAirportAutocomplete
                  mode="global"
                  value={valOriginLabel || valOrigin}
                  onSelect={onSelectOrigin}
                  placeholder="Search departure airport"
                  inputClassName="w-full h-11 pl-9 pr-3.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 outline-none"
                />
              </div>

              {/* Connecting Transit Hub */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                  Connecting Airport
                </label>
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs font-mono text-purple-950">
                  <span className="font-bold">{cityName} ({airportCode})</span>
                  <span className="text-[10px] text-purple-700 bg-white px-2 py-0.5 rounded-md font-sans font-medium">
                    Transit Hub
                  </span>
                </div>
              </div>

              {/* Final Destination Airport */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                  Destination Airport
                </label>
                <IntelligentAirportAutocomplete
                  mode="global"
                  value={valDestLabel || valDest}
                  onSelect={onSelectDest}
                  placeholder="Search destination airport"
                  inputClassName="w-full h-11 pl-9 pr-3.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 outline-none"
                />
              </div>
            </div>

            {/* Validation Feedback Banner */}
            {validationState && validationState.status !== "INCOMPLETE" && (
              <div className="pt-1">
                {validationState.status === "MATCH" && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-sans flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Route verified for this package ({valOrigin} → {airportCode} → {valDest}).</span>
                  </div>
                )}

                {validationState.status === "MISMATCH" && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-sans space-y-2">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Route Mismatch</span>
                    </div>
                    <p className="leading-relaxed">
                      This route is <strong>{TRANSIT_TITLE_MAP[validationState.calculatedCategory!]}</strong>, but you chose <strong>{TRANSIT_TITLE_MAP[validationState.selectedCategory!]}</strong>.
                    </p>
                    {validationState.matchingAlternativePkg && (
                      <button
                        type="button"
                        onClick={() => onSwitchToMatchingPackage(validationState.matchingAlternativePkg)}
                        className="w-full py-2 px-3 rounded-lg bg-amber-600 text-white font-mono text-xs font-bold hover:bg-amber-700 transition-colors cursor-pointer"
                      >
                        Switch to {TRANSIT_TITLE_MAP[validationState.calculatedCategory!]} ({validationState.matchingAlternativePkg.price})
                      </button>
                    )}
                  </div>
                )}

                {(validationState.status === "INVALID_ROUTE" || validationState.status === "UNCLASSIFIABLE") && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs font-sans flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{validationState.message}</span>
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-mono font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirmAndBook}
                disabled={validationState?.status !== "MATCH"}
                className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  validationState?.status === "MATCH"
                    ? "bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-sm"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <span>Continue to Booking</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
