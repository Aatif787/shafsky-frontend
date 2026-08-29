import React, { useState } from "react";
import {
  ShieldCheck,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Plane,
  User,
  Phone,
  Mail,
  Receipt,
  Sparkles,
  Lock,
  RefreshCw,
  Info,
} from "lucide-react";
import { AirportWorkflowState, formatBookingServiceDateTime } from "../../hooks/useAirportWorkflow";
import { FlightItineraryStrip } from "./FlightItineraryStrip";

interface BookingSummaryReviewStepProps {
  state: AirportWorkflowState;
  bookingRef: string;
  priceBreakdown?: any;
  paymentStatus?: "IDLE" | "OPEN" | "VERIFYING" | "FAILED" | "DISMISSED" | "SUCCESS";
  onRetryPayment?: () => void;
  onEditJourney: () => void;
  onEditServices: () => void;
  onEditPassengers: () => void;
  onBack: () => void;
  onProceedToPayment: () => void;
  validateWithBackend?: () => Promise<boolean>;
}

export function BookingSummaryReviewStep({
  state,
  bookingRef,
  priceBreakdown,
  paymentStatus,
  onRetryPayment,
  onEditJourney,
  onEditServices,
  onEditPassengers,
  onBack,
  onProceedToPayment,
  validateWithBackend,
}: BookingSummaryReviewStepProps) {
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const guestCount = state.guestCount || 1;
  const currencySymbol =
    state.catalogCurrency === "USD" ? "$" : state.catalogCurrency === "AED" ? "AED " : "₹";

  const authResult = state.authoritativeValidationResult;

  // Use authoritative backend totals if validated; fallback to local estimate (all prices are GST-inclusive)
  const subtotal = authResult?.subtotal ?? (priceBreakdown?.unitTotal ? priceBreakdown.unitTotal * guestCount : 0);
  const grandTotal = authResult?.total ?? priceBreakdown?.grandTotal ?? subtotal;
  const taxAmount = authResult?.taxes ?? 0;

  const pkgItem = authResult?.selectedPackage || priceBreakdown?.packageItem;
  const additionalSvcs = authResult?.selectedServices || priceBreakdown?.additionalServices || [];
  const ignoredOverlaps = authResult?.overlappingServicesIgnored || priceBreakdown?.overlappingIgnoredServiceIds || [];

  const handleAction = async () => {
    if (!agreedToTerms) return;

    if (validateWithBackend) {
      setIsValidating(true);
      const isOk = await validateWithBackend();
      setIsValidating(false);
      if (isOk) {
        onProceedToPayment();
      }
    } else {
      onProceedToPayment();
    }
  };

  return (
    <div className="space-y-8">
      {/* ── 1. HEADER & BOOKING REFERENCE BADGE ── */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-mono font-bold uppercase tracking-widest border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Step 4 of 5 — Review</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Review & Authorize Booking
          </h2>

          <p className="text-xs text-slate-300">
            {state.resolvedAirport?.name || state.airportName} ({state.resolvedAirport?.code || state.airportCode})
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-right shrink-0 relative z-10">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
            Temporary Reference
          </div>
          <div className="text-lg sm:text-xl font-mono font-bold text-amber-400 mt-0.5">
            {bookingRef || "SHK-PENDING"}
          </div>
        </div>
      </div>

      {/* ── 2. PRICE CHANGED NOTIFICATION (Rule 7) ── */}
      {state.hasPriceChanged && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-start gap-3.5">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs font-sans space-y-1">
            <strong className="font-bold text-amber-300 font-mono uppercase tracking-wider block">
              Price Updated from Database Catalog
            </strong>
            <p>
              Your booking total has been updated to the current database-authoritative rate:{" "}
              <strong className="text-white font-mono font-bold">{currencySymbol}{grandTotal.toLocaleString()}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ── 3. BACKEND VALIDATION ERRORS BANNER (Rule 6) ── */}
      {state.validationErrors && state.validationErrors.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs font-sans">
            <strong className="font-bold text-rose-300 font-mono uppercase tracking-wider block">
              Backend Validation Issue
            </strong>
            {state.validationErrors.map((err, i) => (
              <p key={i}>• {err}</p>
            ))}
          </div>
        </div>
      )}

      <FlightItineraryStrip flight={state.validatedFlightData} />

      {/* ── 4. SUMMARY SECTIONS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card A: Flight & Airport Journey Details */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-serif font-bold text-lg">
                <Plane className="w-5 h-5 text-amber-600" />
                <span>Flight & Service Airport</span>
              </div>
              <button
                type="button"
                onClick={onEditJourney}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="space-y-2 text-xs font-sans text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Journey Type:</span>
                <span className="font-bold font-mono text-amber-700 uppercase px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-md">
                  {state.direction} Services
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Service Airport:</span>
                <span className="font-bold text-slate-900 text-right">
                  {state.resolvedAirport?.name || state.airportName} ({state.resolvedAirport?.code || state.airportCode})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Travel Date & Time:</span>
                <span className="font-bold text-slate-900">
                  {formatBookingServiceDateTime(state)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card B: Package & Services Summary */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-serif font-bold text-lg">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>Selected Package & Services</span>
              </div>
              <button
                type="button"
                onClick={onEditServices}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="space-y-2 text-xs font-sans text-slate-700">
              {pkgItem && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-mono font-bold text-slate-900">
                    <span>Package: {pkgItem.title || pkgItem.name}</span>
                    <span className="text-amber-700">{currencySymbol}{(pkgItem.price || pkgItem.basePrice || 0).toLocaleString()}</span>
                  </div>
                  {pkgItem.includedServiceIds && pkgItem.includedServiceIds.length > 0 && (
                    <p className="text-[10px] text-slate-500">
                      Includes: {pkgItem.includedServiceIds.join(", ")}
                    </p>
                  )}
                </div>
              )}

              {additionalSvcs.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                    Additional Services:
                  </div>
                  {additionalSvcs.map((svc: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between font-medium text-slate-800">
                      <span>• {svc.title || svc.name}</span>
                      <span className="font-mono font-bold text-slate-900">
                        +{currencySymbol}{(svc.price || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {ignoredOverlaps.length > 0 && (
                <p className="text-[10px] text-emerald-700 font-sans italic pt-1">
                  ✓ {ignoredOverlaps.length} service(s) already included in package (no double charge).
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Card C: Passenger Information */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-serif font-bold text-lg">
                <User className="w-5 h-5 text-slate-700" />
                <span>Passenger Details</span>
              </div>
              <button
                type="button"
                onClick={onEditPassengers}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="space-y-2 text-xs font-sans text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Lead Passenger:</span>
                <span className="font-bold text-slate-900">{state.fullName || "Guest Passenger"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Passenger Count:</span>
                <span className="font-bold text-slate-900">{guestCount} Passenger(s)</span>
              </div>
              {state.specialRequests && (
                <div className="pt-1 text-slate-500 italic text-[11px]">
                  Special Requests: "{state.specialRequests}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card D: Contact Information */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-serif font-bold text-lg">
                <Phone className="w-5 h-5 text-slate-700" />
                <span>Contact Details</span>
              </div>
              <button
                type="button"
                onClick={onEditPassengers}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="space-y-2 text-xs font-sans text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Phone Number:</span>
                <span className="font-mono font-bold text-slate-900">{state.phone || "Not provided"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Email Address:</span>
                <span className="font-mono font-bold text-slate-900">{state.email || "Not provided"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. AUTHORITATIVE PRICE BREAKDOWN TABLE ── */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Receipt className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-xl font-serif font-bold text-white">Authoritative Price Breakdown</h3>
              <p className="text-[10px] text-amber-400/80 font-sans">
                Validated by database authority
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 uppercase">
            {guestCount} Pax
          </span>
        </div>

        <div className="space-y-3 text-xs font-sans">
          {pkgItem && (
            <div className="flex items-center justify-between py-2 border-b border-slate-800/60 font-mono">
              <span>Package: {pkgItem.title || pkgItem.name}</span>
              <span className="font-bold text-amber-400">
                {currencySymbol}{(pkgItem.price || pkgItem.basePrice || 0).toLocaleString()}
              </span>
            </div>
          )}

          {additionalSvcs.map((svc: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-800/60 font-mono">
              <span className="text-slate-300">{svc.title || svc.name}</span>
              <span className="font-bold text-white">
                +{currencySymbol}{(svc.price || 0).toLocaleString()}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2 text-slate-300 font-mono">
            <span>Total ({guestCount} guest{guestCount > 1 ? "s" : ""})</span>
            <span className="font-bold">{currencySymbol}{grandTotal.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
            <span>Taxes & GST</span>
            <span className="text-emerald-400 font-medium">Included (18% GST)</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-700 text-lg sm:text-xl font-bold text-amber-400 font-mono">
            <span>Authoritative Grand Total</span>
            <span>{currencySymbol}{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ── 6. TERMS ACCEPTANCE & AUTHORITATIVE ACTION BUTTON ── */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        {(paymentStatus === "DISMISSED" || paymentStatus === "FAILED") && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">
                {paymentStatus === "DISMISSED"
                  ? "Payment Incomplete — Checkout was dismissed"
                  : "Payment Failed — The gateway transaction was unsuccessful"}
              </p>
              <p className="text-amber-800/80">
                Your booking details ({bookingRef}) are reserved. You can retry payment directly below without re-entering your details.
              </p>
            </div>
          </div>
        )}

        <label className="flex items-start gap-3.5 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-600 mt-0.5 shrink-0 cursor-pointer"
          />
          <span className="text-xs text-slate-600 font-sans leading-relaxed">
            I agree to the <strong className="text-slate-900">Shafsky Aviation Services VIP Concierge Terms of Service</strong> and <strong className="text-slate-900">Cancellation Policy</strong>. I understand that final booking confirmation is verified authoritatively against database availability.
          </span>
        </label>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="sm:w-auto px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-widest inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          {(paymentStatus === "DISMISSED" || paymentStatus === "FAILED") && onRetryPayment ? (
            <button
              type="button"
              disabled={!agreedToTerms || isValidating || state.isValidatingBooking}
              onClick={onRetryPayment}
              className={`flex-1 py-4 rounded-2xl font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 ${
                agreedToTerms && !isValidating && !state.isValidatingBooking
                  ? "bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white shadow-lg cursor-pointer hover:scale-[1.01]"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Secure Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!agreedToTerms || isValidating || state.isValidatingBooking}
              onClick={handleAction}
              className={`flex-1 py-4 rounded-2xl font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 ${
                agreedToTerms && !isValidating && !state.isValidatingBooking
                  ? "bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white shadow-lg cursor-pointer hover:scale-[1.01]"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isValidating || state.isValidatingBooking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Checking your booking...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Validate & Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
