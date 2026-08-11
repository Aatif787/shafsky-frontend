import React, { useState } from "react";
import {
  Check,
  Crown,
  Users,
  Hotel,
  Ticket,
  Package,
  Car,
  HeartPulse,
  Sparkles,
  Zap,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";
import { AirportWorkflowState } from "../../hooks/useAirportWorkflow";
import {
  PackageCatalogItem,
  ServiceCatalogItem,
  PriceBreakdown,
} from "../../utils/serviceAirportResolver";

interface AirportServiceSelectionProps {
  state: AirportWorkflowState;
  onChange: (fields: Partial<AirportWorkflowState>) => void;
  availablePackages?: PackageCatalogItem[];
  availableServices?: ServiceCatalogItem[];
  catalogCurrency?: string;
  priceBreakdown?: PriceBreakdown;
  onSelectPackage?: (id: string | null) => void;
  onToggleIndividualService?: (id: string) => void;
  availableTerminals?: string[];
  selectedTerminal?: string | null;
}

export function AirportServiceSelection({
  state,
  onChange,
  availablePackages = [],
  availableServices = [],
  catalogCurrency = "INR",
  priceBreakdown,
  onSelectPackage,
  onToggleIndividualService,
  availableTerminals,
  selectedTerminal,
}: AirportServiceSelectionProps) {
  const currencySymbol =
    catalogCurrency === "USD" ? "$" : catalogCurrency === "AED" ? "AED " : "₹";
  const [isEditingTerminal, setIsEditingTerminal] = useState(false);
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});

  const availableTerminalsList = availableTerminals || [];
  const hasMultipleTerminals = availableTerminalsList.length > 1;
  const currentTerminal = state.selectedTerminal || selectedTerminal || (availableTerminalsList.length > 0 ? availableTerminalsList[0] : "");

  const activeMode = state.bookingMode || "package";

  const packagesList: PackageCatalogItem[] =
    availablePackages.length > 0
      ? availablePackages
      : (state.availablePackagesList || []);

  const individualServicesList: ServiceCatalogItem[] =
    availableServices.length > 0
      ? availableServices
      : (state.availableServicesList || []);

  const selectedPackageId = state.selectedPackageId || null;
  const selectedServiceIds = state.selectedServiceIds || [];

  // Currently selected package object to resolve included service IDs
  const activeSelectedPackage = packagesList.find((p) => p.id === selectedPackageId) || null;
  const packageIncludedServiceIds = new Set<string>(
    activeSelectedPackage?.serviceIds || activeSelectedPackage?.includedServiceIds || []
  );

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCardIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getIconComponent = (iconName?: string, id?: string) => {
    const term = (iconName || id || "").toLowerCase();
    if (term.includes("user") || term.includes("meet")) return Users;
    if (term.includes("zap") || term.includes("fast")) return Zap;
    if (term.includes("crown") || term.includes("vip")) return Crown;
    if (term.includes("package") || term.includes("porter") || term.includes("baggage")) return Package;
    if (term.includes("car") || term.includes("buggy") || term.includes("transport")) return Car;
    if (term.includes("heart") || term.includes("wheelchair")) return HeartPulse;
    if (term.includes("hotel") || term.includes("lounge")) return Hotel;
    if (term.includes("ticket")) return Ticket;
    return Sparkles;
  };

  const handlePackageClick = (pkgId: string) => {
    if (onSelectPackage) {
      onSelectPackage(pkgId);
    } else {
      const isSelected = selectedPackageId === pkgId;
      const nextPkgId = isSelected ? null : pkgId;
      onChange({
        selectedPackageId: nextPkgId,
        selectedPackage: nextPkgId || "",
        bookingMode: nextPkgId ? "package" : state.bookingMode,
      });
    }
  };

  const handleIndividualServiceClick = (svcId: string) => {
    if (onToggleIndividualService) {
      onToggleIndividualService(svcId);
    } else {
      const currentIds = selectedServiceIds;
      const exists = currentIds.includes(svcId);
      const nextIds = exists ? currentIds.filter((id) => id !== svcId) : [...currentIds, svcId];
      onChange({
        selectedServiceIds: nextIds,
        selectedService: nextIds.length > 0 ? nextIds[0] : "",
      });
    }
  };

  // ── 1. LOADING STATE ──
  if (state.isLoadingServices || state.isResolvingAirport) {
    return (
      <div className="p-12 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-4 my-6">
        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
        <p className="text-sm font-mono font-bold text-slate-800 uppercase tracking-wider">
          Loading available services...
        </p>
      </div>
    );
  }

  // ── 2. UNCOVERED AIRPORT STATE ──
  if (state.isAirportCovered === false) {
    return (
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white border border-slate-800 text-center space-y-6 shadow-xl my-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Uncovered Location
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
            Services unavailable at this airport
          </h3>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            We currently do not offer standard automated online packages for {state.resolvedAirport?.name || state.airportName} ({state.resolvedAirport?.code || state.airportCode}).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            window.open(
              "https://wa.me/919876543210?text=" +
                encodeURIComponent(
                  `VIP Assistance Request for ${state.resolvedAirport?.name || state.airportName} (${state.resolvedAirport?.code || state.airportCode}) ${state.direction} journey`
                ),
              "_blank"
            );
          }}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition cursor-pointer"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Contact Team for VIP Assistance</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── 3. DYNAMIC AIRPORT HEADER ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 inline-block">
              Your Service Airport
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
              {state.resolvedAirport?.name || state.airportName || `${state.airportCode} Airport`}
            </h2>
            <p className="text-xs text-slate-300 font-sans">
              {state.resolvedAirport?.city || state.airportName} ({state.resolvedAirport?.code || state.airportCode})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider border border-amber-500/30">
              {state.direction} Services
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-mono text-xs font-bold uppercase tracking-wider border border-slate-700">
              {state.flightType || (state.direction === "transit" ? "International" : "Domestic")}
            </span>
            {currentTerminal && (
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider border border-slate-700">
                {currentTerminal}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. TERMINAL SELECTION DROPDOWN (IF APPLICABLE) ── */}
      {hasMultipleTerminals && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                Terminal:
              </span>
              <span className="text-sm font-bold text-slate-900 bg-amber-100 text-amber-900 px-3 py-1 rounded-lg border border-amber-300 font-mono">
                {currentTerminal}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingTerminal(!isEditingTerminal)}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 underline transition cursor-pointer"
            >
              {isEditingTerminal ? "Done" : "Change Terminal"}
            </button>
          </div>

          {isEditingTerminal && (
            <div className="flex flex-wrap gap-3 pt-2">
              {availableTerminalsList.map((term) => {
                const isSelected = currentTerminal === term;
                return (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      onChange({ selectedTerminal: term });
                      setIsEditingTerminal(false);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                      isSelected
                        ? "bg-slate-900 text-amber-400 border border-slate-900 shadow-sm"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {term}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 5. MODE SWITCHER TABS (Packages vs Individual Services) ── */}
      <div className="flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200 max-w-md">
        <button
          type="button"
          onClick={() => onChange({ bookingMode: "package" })}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            activeMode === "package"
              ? "bg-slate-900 text-amber-400 shadow-md"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Packages ({packagesList.length})
        </button>
        <button
          type="button"
          onClick={() => onChange({ bookingMode: "individual" })}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            activeMode === "individual"
              ? "bg-slate-900 text-amber-400 shadow-md"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Individual Services ({individualServicesList.length})
        </button>
      </div>

      {/* ── 6. PACKAGES VIEW ── */}
      {activeMode === "package" && (
        <div className="space-y-6">
          {packagesList.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <p className="text-sm font-serif font-bold text-slate-800">
                No packages are currently available for this journey.
              </p>
              <p className="text-xs text-slate-500 font-sans">
                Please switch to Individual Services tab to select specific services.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packagesList.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                const priceVal = pkg.basePrice ?? pkg.price ?? 0;
                const pkgBadge = pkg.recommendedBadge || (pkg as any).badge || null;

                return (
                  <div
                    key={pkg.id}
                    onClick={() => handlePackageClick(pkg.id)}
                    className={`rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? "bg-slate-900 border-amber-500 text-white shadow-xl scale-[1.02]"
                        : "bg-white border-slate-200/80 hover:border-amber-400/60 text-slate-900 hover:shadow-lg"
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          {pkgBadge && (
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border inline-block ${
                              isSelected
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}>
                              {pkgBadge}
                            </span>
                          )}
                          <h3 className={`text-lg font-serif font-bold ${isSelected ? "text-white" : "text-slate-900"}`}>
                            {pkg.title}
                          </h3>
                        </div>

                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? "bg-amber-500 border-amber-500 text-slate-950 font-bold"
                            : "border-slate-300 bg-slate-50"
                        }`}>
                          {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                      </div>

                      {pkg.tagline && (
                        <p className={`text-xs font-sans leading-relaxed ${isSelected ? "text-slate-300" : "text-slate-600"}`}>
                          {pkg.tagline}
                        </p>
                      )}

                      {pkg.features && pkg.features.length > 0 && (
                        <ul className="space-y-2 pt-2 border-t border-slate-100/20">
                          {pkg.features.map((feat, idx) => (
                            <li key={idx} className={`text-xs flex items-start gap-2 ${isSelected ? "text-slate-200" : "text-slate-700"}`}>
                              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? "text-amber-400" : "text-amber-600"}`} />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100/20 flex items-baseline justify-between font-mono">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? "text-slate-400" : "text-slate-500"}`}>
                        Base Price
                      </span>
                      <div className="text-xl font-extrabold text-amber-500">
                        {currencySymbol}{priceVal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 7. INDIVIDUAL SERVICES VIEW ── */}
      {(activeMode === "individual" || selectedPackageId) && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-lg font-serif font-bold text-slate-900">
              Individual Airport Services
            </h3>
            {selectedPackageId && (
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold">
                ✓ Overlapping package services automatically included
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {individualServicesList.map((svc) => {
              const isIncludedInPkg = packageIncludedServiceIds.has(svc.id);
              const isSelected = selectedServiceIds.includes(svc.id);
              const IconComp = getIconComponent(svc.icon, svc.id);

              return (
                <div
                  key={svc.id}
                  onClick={() => {
                    if (!isIncludedInPkg) handleIndividualServiceClick(svc.id);
                  }}
                  className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                    isIncludedInPkg
                      ? "bg-emerald-50/60 border-emerald-200 text-slate-800 opacity-90 cursor-default"
                      : isSelected
                      ? "bg-slate-900 border-amber-500 text-white shadow-md cursor-pointer"
                      : "bg-white border-slate-200/80 hover:border-amber-300 text-slate-900 cursor-pointer"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl ${
                        isIncludedInPkg
                          ? "bg-emerald-100 text-emerald-800"
                          : isSelected
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        <IconComp className="w-5 h-5" />
                      </div>

                      {isIncludedInPkg ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 uppercase">
                          Included in Package
                        </span>
                      ) : (
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                          isSelected ? "bg-amber-500 border-amber-500 text-slate-950 font-bold" : "border-slate-300 bg-slate-50"
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className={`font-serif font-bold text-sm ${isSelected ? "text-white" : "text-slate-900"}`}>
                        {svc.title}
                      </h4>
                      {svc.description && (
                        <p className={`text-xs font-sans leading-relaxed ${isSelected ? "text-slate-300" : "text-slate-600"}`}>
                          {svc.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100/20 flex items-center justify-between font-mono">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Rate</span>
                    <span className={`text-sm font-bold ${isIncludedInPkg ? "text-emerald-700 line-through" : isSelected ? "text-amber-400" : "text-slate-900"}`}>
                      {isIncludedInPkg ? "Included" : `${currencySymbol}${svc.price.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
