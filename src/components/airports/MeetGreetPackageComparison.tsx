import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Crown, Check, ArrowRight, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { getAirportRegistryEntry } from "@/data/airportRegistry";
import { ApiClient } from "@/lib/ApiClient";

interface MeetGreetPackageComparisonProps {
  airportCode: string;
  selectedPackageId?: string;
  onSelectPackage?: (pkg: any) => void;
  showBookButton?: boolean;
}

export function MeetGreetPackageComparison({
  airportCode,
  selectedPackageId,
  onSelectPackage,
  showBookButton = true,
}: MeetGreetPackageComparisonProps) {
  const airportEntry = getAirportRegistryEntry(airportCode);
  const cityName = airportEntry?.city || airportCode;

  // Hierarchy filter state: Flight Type, Journey Type, Transit Type & Terminal (DEL only)
  const [flightType, setFlightType] = useState<"DOMESTIC" | "INTERNATIONAL">("DOMESTIC");
  const [journeyType, setJourneyType] = useState<"ARRIVAL" | "DEPARTURE" | "TRANSIT">("ARRIVAL");
  const [transitType, setTransitType] = useState<string>("DOMESTIC_DOMESTIC");
  const [terminal, setTerminal] = useState<string>("Terminal 1 & 2");

  // Dynamic packages loaded from backend DB API
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedPackages, setExpandedPackages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const isDel = airportCode.toUpperCase() === "DEL";
    const flightTypeParam = journeyType === "TRANSIT" ? transitType : flightType;
    const terminalParam = journeyType !== "TRANSIT" && isDel && terminal ? `&terminal=${encodeURIComponent(terminal)}` : "";

    ApiClient.fetchWithAuth(
      `/api/journey/airports/${airportCode}/services?journey_type=${journeyType}&flight_type=${flightTypeParam}${terminalParam}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data && data.success !== false && Array.isArray(data.data)) {
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
                    "Dedicated Staff with Personalized Placard",
                    "Baggage Assistance (Up to 3 Pieces)",
                    "Assistance at the Baggage Belt Area",
                    "Coordination with the Receiving Party",
                    "Escort to the Car Parking Area",
                  ];
                } else if (slug === "elite") {
                  itemFeatures = [
                    "Welcome at the Aerobridge",
                    "Dedicated Staff with Personalized Placard",
                    "Baggage Assistance",
                    "Assistance at the Baggage Belt Area",
                    "Coordination with the Receiving Party",
                    "Escort to the Car Parking Area",
                  ];
                }
              }

              let title = item.service?.name || "Service Package";
              if (item.journey_type === "TRANSIT" && item.flight_type && titleMap[item.flight_type]) {
                title = titleMap[item.flight_type];
              }

              return {
                id: slug,
                title: title,
                desc: item.short_description || item.service?.description || "VIP Airport Service Package.",
                price: `${item.currency === "USD" ? "$" : "₹"}${item.price?.toLocaleString()}`,
                rawPrice: item.price,
                features: itemFeatures,
                additionalBenefits: item.additional_benefits || [],
                isRecommended: !!item.is_recommended,
              };
            });
            setPackages(mapped);
          } else {
            // API returned empty list for this filter combination (e.g., International)
            setPackages([]);
          }
        } else if (isMounted) {
          // Fall back to static registry ONLY if Domestic filter
          if (flightType === "DOMESTIC") {
            const fallback = (airportEntry?.meetGreetPackages || []).map((pkg: any) => ({
              ...pkg,
              desc: pkg.tagline || pkg.desc || "VIP Airport Concierge Package.",
            }));
            setPackages(fallback);
          } else {
            setPackages([]);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          if (flightType === "DOMESTIC") {
            const fallback = (airportEntry?.meetGreetPackages || []).map((pkg: any) => ({
              ...pkg,
              desc: pkg.tagline || pkg.desc || "VIP Airport Concierge Package.",
            }));
            setPackages(fallback);
          } else {
            setPackages([]);
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [airportCode, flightType, journeyType, transitType, terminal, airportEntry]);

  return (
    <div className="space-y-8 my-10">
      {/* SECTION TITLE & HIERARCHY FILTERS */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-[#7c3aed] text-[10px] font-mono font-bold uppercase tracking-widest">
          <Crown className="w-3.5 h-3.5" />
          <span>Official Service Packages</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold">
          Dynamic Concierge Packages for <span className="italic text-[#7c3aed]">{cityName}</span>
        </h3>

        {/* Hierarchy Filters: Airport -> Journey Type -> Flight Type / Transit Type -> Terminal (DEL) -> Packages */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {/* Flight Type Segmented Control (Arrival & Departure) */}
          {journeyType !== "TRANSIT" && (
            <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 inline-flex items-center gap-1 text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setFlightType("DOMESTIC")}
                className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                  flightType === "DOMESTIC"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Domestic
              </button>
              <button
                type="button"
                onClick={() => setFlightType("INTERNATIONAL")}
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
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                journeyType === "ARRIVAL"
                  ? "bg-[#7c3aed] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Arrival
            </button>
            <button
              type="button"
              onClick={() => setJourneyType("DEPARTURE")}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                journeyType === "DEPARTURE"
                  ? "bg-[#7c3aed] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Departure
            </button>
            <button
              type="button"
              onClick={() => setJourneyType("TRANSIT")}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                journeyType === "TRANSIT"
                  ? "bg-[#7c3aed] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Transit
            </button>
          </div>

          {/* Terminal Segmented Control (Only displayed for Delhi Airport Arrival/Departure) */}
          {airportCode.toUpperCase() === "DEL" && journeyType !== "TRANSIT" && (
            <div className="p-1 rounded-2xl bg-amber-50 border border-amber-200 inline-flex items-center gap-1 text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setTerminal("Terminal 1 & 2")}
                className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                  terminal === "Terminal 1 & 2"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-amber-900 hover:bg-amber-100/60"
                }`}
              >
                Terminal 1 & 2
              </button>
              <button
                type="button"
                onClick={() => setTerminal("Terminal 3")}
                className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                  terminal === "Terminal 3"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-amber-900 hover:bg-amber-100/60"
                }`}
              >
                Terminal 3
              </button>
            </div>
          )}

          {/* Transit Type Segmented Control (Only displayed when Transit is selected) */}
          {journeyType === "TRANSIT" && (
            <div className="p-1 rounded-2xl bg-purple-50 border border-purple-200 flex flex-wrap items-center justify-center gap-1 text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setTransitType("DOMESTIC_DOMESTIC")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  transitType === "DOMESTIC_DOMESTIC"
                    ? "bg-[#7c3aed] text-white shadow-xs"
                    : "text-purple-900 hover:bg-purple-100"
                }`}
              >
                Domestic → Domestic
              </button>
              <button
                type="button"
                onClick={() => setTransitType("DOMESTIC_INTERNATIONAL")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  transitType === "DOMESTIC_INTERNATIONAL"
                    ? "bg-[#7c3aed] text-white shadow-xs"
                    : "text-purple-900 hover:bg-purple-100"
                }`}
              >
                Domestic → International
              </button>
              <button
                type="button"
                onClick={() => setTransitType("INTERNATIONAL_DOMESTIC")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  transitType === "INTERNATIONAL_DOMESTIC"
                    ? "bg-[#7c3aed] text-white shadow-xs"
                    : "text-purple-900 hover:bg-purple-100"
                }`}
              >
                International → Domestic
              </button>
              <button
                type="button"
                onClick={() => setTransitType("INTERNATIONAL_INTERNATIONAL")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  transitType === "INTERNATIONAL_INTERNATIONAL"
                    ? "bg-[#7c3aed] text-white shadow-xs"
                    : "text-purple-900 hover:bg-purple-100"
                }`}
              >
                International → International
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DYNAMIC CARDS GRID */}
      {loading ? (
        <div className="py-12 text-center text-xs font-mono text-slate-400">
          Loading production packages for {cityName}...
        </div>
      ) : packages.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center max-w-xl mx-auto space-y-2">
          <Sparkles className="w-6 h-6 text-slate-400 mx-auto" />
          <h4 className="text-sm font-serif font-bold text-slate-800">
            {flightType} {journeyType} Packages Coming Soon
          </h4>
          <p className="text-xs text-slate-500 font-sans">
            Packages for this flight category will be added shortly. You can contact our 24/7 command desk for direct reservation.
          </p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 ${
            packages.length === 1
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
                          origin: airportCode,
                          service_id: pkg.id,
                          booking_mode: "package",
                          package_id: pkg.id,
                        } as any
                      }
                      onClick={() => onSelectPackage && onSelectPackage(pkg)}
                      className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer ${
                        isRec
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
