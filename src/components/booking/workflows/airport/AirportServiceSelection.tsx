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
  Info,
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
  const currentTerminal = state.selectedTerminal || selectedTerminal || availableTerminalsList[0] || "";

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
  const packageIncludedServiceIds = new Set<string>(activeSelectedPackage?.serviceIds || []);

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

  // Rule 13: Empty State when airport is covered but no bookable services exist
  if (packagesList.length === 0 && individualServicesList.length === 0) {
    return (
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h3 className="text-lg font-serif font-extrabold text-slate-900">
            No services are currently available
          </h3>
          <p className="text-xs text-slate-600 font-sans leading-relaxed">
            We currently don't have bookable services for {state.direction.toUpperCase()} journeys at {state.airportName || state.airportCode}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            window.open(
              "https://wa.me/919876543210?text=" +
                encodeURIComponent(
                  `Inquiry for ${state.airportName} (${state.airportCode}) ${state.direction} services`
                ),
              "_blank"
            );
          }}
          className="px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer"
        >
          Contact Team for VIP Assistance
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── TERMINAL SELECTION SECTION ── */}
      {hasMultipleTerminals && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          {state.isFlightValidated && !state.isManualMode && !isEditingTerminal ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                  Terminal:
                </span>
                <span className="text-sm font-bold text-slate-900 bg-amber-100 text-amber-900 px-3 py-1 rounded-lg border border-amber-300">
                  {currentTerminal}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingTerminal(true)}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 underline transition-all cursor-pointer"
              >
                Change
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                  Select Terminal
                </label>
                {state.isFlightValidated && !state.isManualMode && (
                  <button
                    type="button"
                    onClick={() => setIsEditingTerminal(false)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
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
            </div>
          )}
        </div>
      )}

      {/* ── MODE SWITCHER TABS (Packages vs Individual Services) ── */}
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

      {/* ── PACKAGES TAB CONTENT (Rule 5) ── */}
      {activeMode === "package" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packagesList.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;
            const price = pkg.basePrice || pkg.price || 0;
            const features = pkg.features || [];

            return (
              <div
                key={pkg.id}
                onClick={() => handlePackageClick(pkg.id)}
                className={`relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between cursor-pointer border ${
                  isSelected
                    ? "bg-slate-900 text-white border-amber-500 shadow-xl ring-2 ring-amber-500/30 scale-[1.02]"
                    : "bg-white text-slate-900 border-slate-200/90 hover:border-amber-400 hover:shadow-md"
                }`}
              >
                {/* Optional Badge from backend ONLY (Rule 5) */}
                {pkg.recommendedBadge && (
                  <div className="absolute -top-3 left-6">
                    <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-mono font-extrabold uppercase tracking-widest shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{pkg.recommendedBadge}</span>
                    </span>
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3
                        className={`text-xl font-serif font-extrabold ${
                          isSelected ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {pkg.title}
                      </h3>
                      {pkg.tagline && (
                        <p
                          className={`text-xs font-sans mt-1 ${
                            isSelected ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {pkg.tagline}
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0 transition-all ${
                        isSelected
                          ? "bg-amber-400 border-amber-400 text-slate-950"
                          : "border-slate-300 bg-slate-50"
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="border-t border-b py-3 my-2 font-mono">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-amber-500">
                        {currencySymbol}
                        {price.toLocaleString()}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold ${
                          isSelected ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        / pax
                      </span>
                    </div>
                  </div>

                  {/* Included Services & Features List */}
                  {features.length > 0 && (
                    <ul className="space-y-2 text-xs font-sans">
                      {features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isSelected ? "text-amber-400" : "text-amber-600"
                            }`}
                          />
                          <span
                            className={
                              isSelected ? "text-slate-200" : "text-slate-700"
                            }
                          >
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    className={`w-full py-3 rounded-2xl text-xs font-mono font-extrabold uppercase tracking-wider transition-all ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                    }`}
                  >
                    {isSelected ? "✓ Selected Package" : "Select Package"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── INDIVIDUAL SERVICES TAB CONTENT (Rule 6 & 9) ── */}
      {activeMode === "individual" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {individualServicesList.map((svc) => {
            const isSelected = selectedServiceIds.includes(svc.id);
            const isIncludedInPackage = packageIncludedServiceIds.has(svc.id);
            const isAvailable = svc.isAvailable !== false;
            const Icon = getIconComponent(svc.icon, svc.id);

            return (
              <div
                key={svc.id}
                onClick={() => isAvailable && handleIndividualServiceClick(svc.id)}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  !isAvailable
                    ? "bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed"
                    : isIncludedInPackage
                    ? "bg-emerald-50/70 border-emerald-300 cursor-pointer shadow-xs"
                    : isSelected
                    ? "bg-slate-900 text-white border-amber-500 shadow-md cursor-pointer"
                    : "bg-white text-slate-900 border-slate-200 hover:border-slate-300 cursor-pointer"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-amber-400 text-slate-950"
                          : isIncludedInPackage
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4
                          className={`font-serif font-extrabold text-sm ${
                            isSelected ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {svc.title}
                        </h4>
                        {svc.badge && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[9px] font-mono font-bold text-slate-600 uppercase">
                            {svc.badge}
                          </span>
                        )}
                      </div>
                      {svc.description && (
                        <p
                          className={`text-xs font-sans mt-1 leading-relaxed ${
                            isSelected ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {svc.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    {/* Overlap Badge (Rule 9) */}
                    {isIncludedInPackage ? (
                      <span className="text-[10px] font-bold font-mono text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        ✓ Included in Package
                      </span>
                    ) : (
                      <div
                        className={`text-base font-extrabold ${
                          isSelected ? "text-amber-400" : "text-slate-900"
                        }`}
                      >
                        {currencySymbol}
                        {svc.price.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100/20 mt-3">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase ${
                      isSelected ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {!isAvailable ? "Unavailable" : isIncludedInPackage ? "Included Free" : "Selectable"}
                  </span>

                  <button
                    type="button"
                    disabled={!isAvailable}
                    className={`px-4 py-1.5 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wider transition ${
                      !isAvailable
                        ? "bg-slate-200 text-slate-500"
                        : isIncludedInPackage
                        ? "bg-emerald-600 text-white cursor-pointer"
                        : isSelected
                        ? "bg-amber-400 text-slate-950 font-extrabold cursor-pointer"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer"
                    }`}
                  >
                    {!isAvailable
                      ? "Disabled"
                      : isIncludedInPackage
                      ? "Included"
                      : isSelected
                      ? "Selected"
                      : "+ Add Service"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── LIVE BOOKING SUMMARY CARD (Rule 10) ── */}
      {priceBreakdown && (priceBreakdown.packageItem || priceBreakdown.additionalServices.length > 0) && (
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Live Booking Summary</span>
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">
              {state.guestCount} Guest{state.guestCount > 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Selected Package */}
            {priceBreakdown.packageItem && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">
                  Package: {priceBreakdown.packageItem.title}
                </span>
                <span className="font-bold text-amber-400">
                  {currencySymbol}{priceBreakdown.packageItem.price.toLocaleString()}
                </span>
              </div>
            )}

            {/* Additional Non-Overlapping Services */}
            {priceBreakdown.additionalServices.map((svc) => (
              <div key={svc.id} className="flex items-center justify-between pl-3 border-l-2 border-amber-500/40">
                <span className="text-slate-300">{svc.title}</span>
                <span className="font-bold text-white">
                  +{currencySymbol}{svc.price.toLocaleString()}
                </span>
              </div>
            ))}

            {/* Overlapping Ignored Services Notice (Rule 9) */}
            {priceBreakdown.overlappingIgnoredServiceIds.length > 0 && (
              <div className="text-[10px] text-emerald-400 font-sans italic pt-1">
                Note: {priceBreakdown.overlappingIgnoredServiceIds.length} service(s) already included free in selected package.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Total Price ({state.guestCount} pax)
              </div>
              <div className="text-[9px] text-amber-400/80 font-sans">
                Authoritative calculation validated by backend
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-400">
              {currencySymbol}{priceBreakdown.grandTotal.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
