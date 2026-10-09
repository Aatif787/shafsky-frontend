import React from "react";
import { ShieldCheck, Lock, MessageSquare, Loader2, Send, ArrowRight, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { SUPPORTED_CURRENCIES, formatPrice, convertFromINR } from "@/lib/currency";
import { AIRPORT_REGISTRY } from "@/data/airportRegistry";
import { AirportServiceType, ServiceItemAvailability } from "@/lib/api/multiServiceApi";
import { FlightData } from "@/services/flight/FlightTypes";
import { PassengerDetail, PaymentStatus } from "./types";

export interface BookingSummarySectionProps {
  selectedCurrency: string;
  setSelectedCurrency: (c: string) => void;
  selectedServices: AirportServiceType[];
  cleanOrigin: string;
  originCode: string;
  direction: "arrival" | "departure" | "transit";
  airportCode: string;
  cleanDest: string;
  destCode: string;
  cleanTransit: string;
  transitCode: string;
  searchParams?: Record<string, any>;
  multiServiceAvailability: ServiceItemAvailability[];
  numericUnitPrice: number;
  billablePax: number;
  selectedPackageName: string;
  packageByService: Record<AirportServiceType, string>;
  isFlightVerified: boolean;
  verifiedFlight: FlightData | null;
  manualFlightNum: string;
  flightNumber: string;
  dateValue: Date;
  passengers: PassengerDetail[];
  fullName: string;
  age: string;
  totalPax: number;
  convertedTotalPrice: number;
  isArrangementOnly: boolean;
  isExpressFeeApplicable: boolean;
  convertedExpressFee: number;
  paxChildren: number;
  paxInfants: number;
  handleShareQuoteWhatsApp: () => void;
  handleRequestServiceArrangement: () => void;
  isArrangementSubmitting: boolean;
  paymentStatus: PaymentStatus;
  handleRetryPayment: () => void;
  submitting: boolean;
}

export const BookingSummarySection: React.FC<BookingSummarySectionProps> = ({
  selectedCurrency,
  setSelectedCurrency,
  selectedServices,
  cleanOrigin,
  originCode,
  direction,
  airportCode,
  cleanDest,
  destCode,
  cleanTransit,
  transitCode,
  searchParams,
  multiServiceAvailability,
  numericUnitPrice,
  billablePax,
  selectedPackageName,
  packageByService,
  isFlightVerified,
  verifiedFlight,
  manualFlightNum,
  flightNumber,
  dateValue,
  passengers,
  fullName,
  age,
  totalPax,
  convertedTotalPrice,
  isArrangementOnly,
  isExpressFeeApplicable,
  convertedExpressFee,
  paxChildren,
  paxInfants,
  handleShareQuoteWhatsApp,
  handleRequestServiceArrangement,
  isArrangementSubmitting,
  paymentStatus,
  handleRetryPayment,
  submitting,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
            <ShieldCheck size={18} />
          </div>
          <h3 className="font-serif text-lg font-bold text-slate-900">Booking Summary</h3>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-lime-700 font-bold bg-lime-50 border border-lime-200 px-2 py-0.5 rounded-full">
            <Lock size={10} /> Secure
          </span>
        </div>

        {/* Currency switcher */}
        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:border-sky-400 focus:outline-none cursor-pointer"
        >
          {Object.values(SUPPORTED_CURRENCIES).map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code} ({c.symbol.trim()})
            </option>
          ))}
        </select>
      </div>

      {/* Itemized Services Breakdown */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
          Selected Airport Services
        </span>
        <div className="space-y-2">
          {selectedServices.map((st) => {
            const sApt =
              st === "DEPARTURE"
                ? cleanOrigin || originCode || (direction === "departure" ? airportCode : "")
                : st === "ARRIVAL"
                  ? cleanDest || destCode || (direction === "arrival" ? airportCode : "")
                  : cleanTransit || transitCode || searchParams?.transit || (direction === "transit" ? airportCode : "");
            const sTypeLabel =
              st === "DEPARTURE"
                ? "Departure Service"
                : st === "ARRIVAL"
                  ? "Arrival Service"
                  : "Transit Service";
            const sAptClean = (sApt || "").trim().toUpperCase();
            const availItem = multiServiceAvailability.find(
              (a) => a.service_type === st && (!sAptClean || a.airport_code.toUpperCase() === sAptClean)
            );
            // Check whether this airport is covered in our database or registry
            const isAirportCoveredInDb = availItem
              ? availItem.is_airport_supported
              : Boolean(sAptClean && (AIRPORT_REGISTRY[sAptClean] || sAptClean === airportCode.toUpperCase()));

            const isAvailable = availItem
              ? availItem.status === "AVAILABLE" && availItem.is_airport_supported
              : isAirportCoveredInDb;
            const itemPriceInr = availItem?.total_price && availItem.total_price > 0
              ? availItem.total_price
              : (isAvailable ? numericUnitPrice * billablePax : 0);

            const formatPkgName = (pkgRaw?: string) => {
              if (!pkgRaw) return selectedPackageName;
              const l = pkgRaw.toLowerCase();
              if (l.includes("platinum")) return "Platinum Service";
              if (l.includes("gold")) return "Gold Service";
              if (l.includes("silver")) return "Silver Service";
              if (l.includes("elite")) return "Elite Service";
              if (l.includes("domestic_international")) return "Domestic → International";
              if (l.includes("domestic_domestic")) return "Domestic → Domestic";
              if (l.includes("international_international")) return "International → International";
              if (l.includes("international_domestic")) return "International → Domestic";
              return pkgRaw.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            };

            const itemPkg = isAvailable
              ? (availItem?.package_name || formatPkgName(packageByService[st]))
              : "Concierge Arrangement";

            return (
              <div
                key={`itemized-service-${st}`}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border text-xs gap-2 transition-all ${
                  isAvailable
                    ? "bg-slate-50/70 border-slate-200/80 text-slate-800"
                    : "bg-amber-50/60 border-amber-200 text-amber-950"
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {sTypeLabel} • {sApt || "Airport"}
                    </span>
                    <span
                      className={`font-mono text-[9px] uppercase px-2 py-0.5 rounded-full font-bold ${
                        isAvailable
                          ? "bg-lime-100 text-lime-800"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {isAvailable ? "Available" : "Arrangement Request"}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Package: {itemPkg} • {billablePax} Guest{billablePax > 1 ? "s" : ""}
                  </span>
                  {!isAvailable && (
                    <span className="text-[11px] font-medium text-amber-800 mt-0.5">
                      “We will arrange your service at this airport and inform you shortly.”
                    </span>
                  )}
                </div>

                <div className="text-right sm:self-center font-mono font-bold text-sm">
                  {isAvailable ? (
                    <span className="text-slate-900">
                      {formatPrice(convertFromINR(itemPriceInr, selectedCurrency), selectedCurrency)}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium text-xs">
                      ₹0 (Payable later)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compact booking details grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-sky-500 font-bold block">Package</span>
          <span className="font-bold text-slate-900 block truncate mt-0.5">{selectedPackageName}</span>
        </div>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-sky-500 font-bold block">Airport</span>
          <span className="font-bold text-slate-900 block truncate mt-0.5">{airportCode} • <span className="capitalize font-normal text-slate-600">{direction}</span></span>
        </div>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-sky-500 font-bold block">Flight</span>
          <span className="font-mono font-bold text-slate-900 block truncate mt-0.5">
            {isFlightVerified && verifiedFlight ? verifiedFlight.flightNum : manualFlightNum || flightNumber || "—"}
          </span>
          <span className="font-mono text-[10px] text-slate-400">{format(dateValue, "dd MMM yyyy")}</span>
        </div>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-sky-500 font-bold block">Guest</span>
          <span className="font-bold text-slate-900 block truncate mt-0.5">
            {passengers.map((p) => p.fullName.trim()).filter(Boolean).join(", ") || fullName || "—"}
            {passengers.length === 1 && age ? ` (${age} yrs)` : ""}
          </span>
          <span className="text-[10px] text-slate-400">{totalPax} pax</span>
        </div>
      </div>

      {/* Price + payment row */}
      <div className="rounded-2xl bg-sky-50/60 border border-sky-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-sky-600 font-bold block">Total Payable</span>
          <div className="font-mono text-2xl sm:text-3xl font-black text-slate-950 mt-0.5">
            {formatPrice(convertedTotalPrice, selectedCurrency)}
          </div>
          <span className="text-[11px] text-slate-500">
            {isArrangementOnly
              ? "₹0 payable now — Our concierge team will arrange your requested services."
              : `${formatPrice(convertedTotalPrice, selectedCurrency)} payable today for confirmed services`}
            {isExpressFeeApplicable && (
              <span className="text-amber-700 font-bold ml-1">
                + {formatPrice(convertedExpressFee, selectedCurrency)} (50% Express Fee)
              </span>
            )}
            {paxChildren + paxInfants > 0 && (
              <span className="text-emerald-600 font-medium ml-1">
                ({[
                  paxChildren > 0 ? `${paxChildren} child${paxChildren > 1 ? "ren" : ""} free` : "",
                  paxInfants > 0 ? `${paxInfants} infant${paxInfants > 1 ? "s" : ""} free` : "",
                ].filter(Boolean).join(", ")})
              </span>
            )}
            , taxes included
          </span>
          {isExpressFeeApplicable && (
            <div className="mt-2 flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] text-amber-900 font-medium">
              <span>⚡ <strong>50% Express Fee Applied:</strong> Mumbai Airport booking under 24 hours before service start time.</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {["UPI", "Google Pay", "Cards", "NetBanking"].map((m) => (
            <span key={m} className="rounded-lg border border-sky-200 bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-sky-700">
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-lime-500" />
          <span>Encrypted payment via Razorpay</span>
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleShareQuoteWhatsApp}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <MessageSquare size={14} className="text-emerald-500" />
            Share
          </button>

          {isArrangementOnly ? (
            <button
              type="button"
              onClick={handleRequestServiceArrangement}
              disabled={isArrangementSubmitting}
              className="flex-1 sm:flex-none min-w-[240px] inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 px-6 py-3.5 text-xs font-mono font-extrabold uppercase tracking-widest text-slate-950 shadow-md shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isArrangementSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Request Service Arrangement</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          ) : paymentStatus === "DISMISSED" || paymentStatus === "FAILED" ? (
            <button
              type="button"
              onClick={handleRetryPayment}
              disabled={submitting}
              className="flex-1 sm:flex-none min-w-[200px] inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-400 px-6 py-3 text-xs font-mono font-extrabold uppercase tracking-widest text-white shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={14} />
                  <span>Retry {formatPrice(convertedTotalPrice, selectedCurrency)}</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 sm:flex-none min-w-[200px] inline-flex items-center justify-center gap-2 rounded-2xl bg-lime-500 hover:bg-lime-400 px-6 py-3 text-xs font-mono font-extrabold uppercase tracking-widest text-slate-950 shadow-md shadow-lime-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>Pay {formatPrice(convertedTotalPrice, selectedCurrency)}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
