import React, { useState } from "react";
import {
  ShieldCheck,
  Edit2,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowRight,
  Plane,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Receipt,
  Sparkles,
  Lock,
} from "lucide-react";
import { AirportWorkflowState } from "../../hooks/useAirportWorkflow";

interface ServicePriceItem {
  slug: string;
  name: string;
  unit_price: number;
  quantity: number;
  item_subtotal: number;
}

interface PriceBreakdown {
  items: ServicePriceItem[];
  subtotal: number;
  tax_percent: number;
  tax_amount: number;
  total: number;
  currency: string;
}

interface BookingSummaryReviewStepProps {
  state: AirportWorkflowState;
  bookingRef: string;
  priceBreakdown?: PriceBreakdown | null;
  onEditJourney: () => void;
  onEditServices: () => void;
  onEditPassengers: () => void;
  onProceedToPayment: () => void;
  validationMessages?: string[];
  isValid?: boolean;
}

export function BookingSummaryReviewStep({
  state,
  bookingRef,
  priceBreakdown,
  onEditJourney,
  onEditServices,
  onEditPassengers,
  onProceedToPayment,
  validationMessages = [],
  isValid = true,
}: BookingSummaryReviewStepProps) {
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

  const guestCount = state.guestCount || 1;
  const currencySymbol = priceBreakdown?.currency === "USD" ? "$" : "₹";

  // Fallback calculation if priceBreakdown from API is loading/offline
  const calculatedItems =
    priceBreakdown?.items && priceBreakdown.items.length > 0
      ? priceBreakdown.items
      : [
          {
            slug: state.selectedService || "meet_greet",
            name: (state.selectedService || "Meet & Greet").replace(/_/g, " ").toUpperCase(),
            unit_price: 2499,
            quantity: guestCount,
            item_subtotal: 2499 * guestCount,
          },
        ];

  const subtotal = priceBreakdown?.subtotal ?? calculatedItems.reduce((sum, item) => sum + item.item_subtotal, 0);
  const taxAmount = priceBreakdown?.tax_amount ?? Math.round(subtotal * 0.18);
  const grandTotal = priceBreakdown?.total ?? subtotal + taxAmount;

  return (
    <div className="space-y-8">
      {/* ── 1. HEADER & BOOKING REFERENCE BADGE ── */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-mono font-bold uppercase tracking-widest border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pre-Payment Verification Passed</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Review Your Journey Details
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-sans">
            Please verify your journey, passenger details, and price breakdown before completing reservation.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-right shrink-0 relative z-10">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
            Temporary Reference
          </div>
          <div className="text-lg sm:text-xl font-mono font-bold text-amber-400 mt-0.5">
            {bookingRef}
          </div>
        </div>
      </div>

      {/* ── 2. INLINE VALIDATION MESSAGES ── */}
      {validationMessages.length > 0 && (
        <div className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 ${
          isValid
            ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
            : "bg-amber-950/40 border-amber-500/30 text-amber-200"
        }`}>
          {isValid ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1 text-xs font-sans">
            {validationMessages.map((msg, i) => (
              <p key={i}>{msg}</p>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. EDITABLE SECTIONS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card A: Journey Details */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-serif font-bold text-lg">
                <Plane className="w-5 h-5 text-[#7c3aed]" />
                <span>Journey Summary</span>
              </div>
              <button
                type="button"
                onClick={onEditJourney}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7c3aed] text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="space-y-2 text-xs font-sans text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Flight Number:</span>
                <span className="font-mono font-bold text-slate-900">{state.flightNumber || "Manual Entry"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Route:</span>
                <span className="font-bold text-slate-900">
                  {state.airportCode} ({state.direction.toUpperCase()})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Travel Date:</span>
                <span className="font-bold text-slate-900">{state.serviceDate || "Not specified"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Scheduled Time:</span>
                <span className="font-bold text-slate-900">{state.serviceTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card B: Selected Services */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-serif font-bold text-lg">
                <Sparkles className="w-5 h-5 text-[#84cc16]" />
                <span>Selected Services</span>
              </div>
              <button
                type="button"
                onClick={onEditServices}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7c3aed] text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="space-y-2 text-xs font-sans text-slate-700">
              {calculatedItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{item.name}</span>
                  <span className="font-mono font-bold text-slate-900">
                    {currencySymbol}{item.unit_price.toLocaleString()} × {item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card C: Passenger Information */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-serif font-bold text-lg">
                <User className="w-5 h-5 text-blue-600" />
                <span>Passenger Details</span>
              </div>
              <button
                type="button"
                onClick={onEditPassengers}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7c3aed] text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
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
                <Phone className="w-5 h-5 text-emerald-600" />
                <span>Contact Info</span>
              </div>
              <button
                type="button"
                onClick={onEditPassengers}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7c3aed] text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="space-y-2 text-xs font-sans text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Phone:</span>
                <span className="font-mono font-bold text-slate-900">{state.phone || "Not provided"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Email:</span>
                <span className="font-mono font-bold text-slate-900">{state.email || "Not provided"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. TRANSPARENT PRICE BREAKDOWN TABLE ── */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <Receipt className="w-6 h-6 text-amber-400" />
          <h3 className="text-xl font-serif font-bold text-white">Transparent Price Breakdown</h3>
        </div>

        <div className="space-y-3 text-xs font-sans">
          {calculatedItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-800/60">
              <div>
                <span className="text-slate-200 font-medium">{item.name}</span>
                <span className="text-slate-500 font-mono text-[11px] block">
                  {currencySymbol}{item.unit_price.toLocaleString()} × {item.quantity} Pax
                </span>
              </div>
              <span className="font-mono font-bold text-white">
                {currencySymbol}{item.item_subtotal.toLocaleString()}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2 text-slate-300">
            <span>Subtotal</span>
            <span className="font-mono font-bold">{currencySymbol}{subtotal.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Taxes & Airport Surcharges ({priceBreakdown?.tax_percent || 18}%)</span>
            <span className="font-mono font-bold">{currencySymbol}{taxAmount.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-700 text-base sm:text-lg font-bold text-amber-400 font-mono">
            <span>Total Payable Amount</span>
            <span>{currencySymbol}{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ── 5. TERMS ACCEPTANCE & ACTION ── */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <label className="flex items-start gap-3.5 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-[#7c3aed] focus:ring-[#7c3aed] mt-0.5 shrink-0 cursor-pointer"
          />
          <span className="text-xs text-slate-600 font-sans leading-relaxed">
            I agree to the <strong className="text-slate-900">Shafsky Aviation VIP Concierge Terms of Service</strong> and <strong className="text-slate-900">Cancellation Policy</strong>. I understand that real-time airside dispatch is subject to airport security authority clearance.
          </span>
        </label>

        <button
          type="button"
          disabled={!agreedToTerms || !isValid}
          onClick={onProceedToPayment}
          className={`w-full py-4 rounded-2xl font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 ${
            agreedToTerms && isValid
              ? "bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] shadow-lg cursor-pointer hover:scale-[1.01]"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Proceed to Reservation Confirmation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
