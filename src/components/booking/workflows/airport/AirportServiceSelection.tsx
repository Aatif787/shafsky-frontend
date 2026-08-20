import React, { useState } from "react";
import {
  Check,
  AlertCircle,
  RefreshCw,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";
import { AirportWorkflowState } from "../../hooks/useAirportWorkflow";
import {
  PackageCatalogItem,
  PriceBreakdown,
} from "../../utils/serviceAirportResolver";

interface AirportServiceSelectionProps {
  state: AirportWorkflowState;
  onChange: (fields: Partial<AirportWorkflowState>) => void;
  availablePackages?: PackageCatalogItem[];
  catalogCurrency?: string;
  priceBreakdown?: PriceBreakdown;
  onSelectPackage?: (id: string | null) => void;
  availableTerminals?: string[];
  selectedTerminal?: string | null;
}

export function AirportServiceSelection({
  state,
  onChange,
  availablePackages = [],
  catalogCurrency = "INR",
  priceBreakdown,
  onSelectPackage,
  availableTerminals,
  selectedTerminal,
}: AirportServiceSelectionProps) {
  const currencySymbol =
    catalogCurrency === "USD" ? "$" : catalogCurrency === "AED" ? "AED " : "₹";
  const [isEditingTerminal, setIsEditingTerminal] = useState(false);

  const availableTerminalsList = availableTerminals || [];
  const hasMultipleTerminals = availableTerminalsList.length > 1;
  const currentTerminal =
    state.selectedTerminal ||
    selectedTerminal ||
    (availableTerminalsList.length > 0 ? availableTerminalsList[0] : "");

  const packagesList: PackageCatalogItem[] =
    availablePackages.length > 0
      ? availablePackages
      : state.availablePackagesList || [];

  const selectedPackageId = state.selectedPackageId || null;

  const handlePackageClick = (pkgId: string) => {
    if (onSelectPackage) {
      onSelectPackage(pkgId);
    } else {
      const isSelected = selectedPackageId === pkgId;
      const nextPkgId = isSelected ? null : pkgId;
      onChange({
        selectedPackageId: nextPkgId,
        selectedPackage: nextPkgId || "",
        bookingMode: "package",
      });
    }
  };

  // ── 1. LOADING STATE ──
  if (state.isLoadingServices || state.isResolvingAirport) {
    return (
      <div className="p-12 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-4 my-6">
        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
        <p className="text-sm font-mono font-bold text-slate-800 uppercase tracking-wider">
          Loading airport packages...
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
            Packages unavailable at this airport
          </h3>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            We currently do not offer standard automated online packages for{" "}
            {state.resolvedAirport?.name || state.airportName} (
            {state.resolvedAirport?.code || state.airportCode}).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            window.open(
              "https://wa.me/919876543210?text=" +
                encodeURIComponent(
                  `VIP Package Request for ${state.resolvedAirport?.name || state.airportName} (${state.resolvedAirport?.code || state.airportCode}) ${state.direction} journey`
                ),
              "_blank"
            );
          }}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition cursor-pointer"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Contact Team for VIP Assist</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── 3. DYNAMIC AIRPORT HEADER ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 inline-block">
              Your Service Airport
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
              {state.resolvedAirport?.name || state.airportName || `${state.airportCode} Airport`}
              {state.airportCode ? ` (${state.resolvedAirport?.code || state.airportCode})` : ""}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider border border-amber-500/30">
              {state.direction} Packages
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 font-mono text-xs font-bold uppercase tracking-wider border border-slate-700">
              {state.travelType || state.flightType || "Domestic"}
            </span>
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

      {/* ── 5. PACKAGES-ONLY CATALOG GRID ── */}
      <div className="space-y-6">
        {packagesList.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3 my-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-base font-serif font-bold text-slate-900">
              {state.bookingSource === "airport_page"
                ? "No services are currently available for this airport/service type."
                : "No packages are currently available for this airport and journey."}
            </p>
            <p className="text-xs text-slate-600 font-sans max-w-md mx-auto leading-relaxed">
              We are expanding operations at{" "}
              {state.airportName || state.airportCode}. Please contact our VIP
              Desk for assistance or custom dispatch.
            </p>
            <button
              type="button"
              onClick={() => {
                window.open(
                  "https://wa.me/919876543210?text=" +
                    encodeURIComponent(
                      `VIP Package Request for ${state.airportName || state.airportCode} (${state.direction})`
                    ),
                  "_blank"
                );
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Contact VIP Operations Desk</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packagesList.map((pkg) => {
              const isSelected = selectedPackageId === pkg.id;
              const priceVal = pkg.basePrice ?? pkg.price ?? 0;
              const pkgBadge =
                pkg.recommendedBadge || (pkg as any).badge || null;

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
                          <span
                            className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border inline-block ${
                              isSelected
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            {pkgBadge}
                          </span>
                        )}
                        <h3
                          className={`text-lg font-serif font-bold ${
                            isSelected ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {pkg.title}
                        </h3>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? "bg-amber-500 border-amber-500 text-slate-950 font-bold"
                            : "border-slate-300 bg-slate-50"
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-4 h-4 stroke-[3]" />
                        )}
                      </div>
                    </div>

                    {pkg.tagline && (
                      <p
                        className={`text-xs font-sans leading-relaxed ${
                          isSelected ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        {pkg.tagline}
                      </p>
                    )}

                    {pkg.features && pkg.features.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-slate-100/20">
                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-500 block">
                          Included in Package:
                        </span>
                        <ul className="space-y-2">
                          {pkg.features.map((feat, idx) => (
                            <li
                              key={idx}
                              className={`text-xs flex items-start gap-2 ${
                                isSelected
                                  ? "text-slate-200"
                                  : "text-slate-700"
                              }`}
                            >
                              <CheckCircle2
                                className={`w-4 h-4 shrink-0 mt-0.5 ${
                                  isSelected
                                    ? "text-amber-400"
                                    : "text-amber-600"
                                }`}
                              />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100/20 flex items-baseline justify-between font-mono">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isSelected ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Package Price
                    </span>
                    <div className="text-xl font-extrabold text-amber-500">
                      {currencySymbol}
                      {priceVal.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
