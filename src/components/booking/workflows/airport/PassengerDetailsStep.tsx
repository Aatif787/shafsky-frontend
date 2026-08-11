import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Users,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ArrowRight,
  Plane,
  Sparkles,
  AlertCircle,
  FileText,
  Globe,
} from "lucide-react";
import { AirportWorkflowState } from "../../hooks/useAirportWorkflow";
import { PriceBreakdown } from "../../utils/serviceAirportResolver";

interface PassengerDetailsStepProps {
  state: AirportWorkflowState;
  onChange: (fields: Partial<AirportWorkflowState>) => void;
  onBack: () => void;
  onSaveDraft: () => Promise<boolean>;
  priceBreakdown?: PriceBreakdown;
}

export function PassengerDetailsStep({
  state,
  onChange,
  onBack,
  onSaveDraft,
  priceBreakdown,
}: PassengerDetailsStepProps) {
  const [showSpecialRequests, setShowSpecialRequests] = useState<boolean>(
    Boolean(state.specialRequests)
  );
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const currencySymbol =
    state.catalogCurrency === "USD" ? "$" : state.catalogCurrency === "AED" ? "AED " : "₹";
  const guestCount = state.guestCount || 1;

  const backendFieldErrors = state.draftFieldErrors || {};

  const getFieldError = (field: string) => {
    return localErrors[field] || backendFieldErrors[field] || "";
  };

  const validateLocalForm = (): boolean => {
    const errs: Record<string, string> = {};

    const nameVal = state.fullName.trim();
    if (!nameVal || nameVal.length < 2) {
      errs.full_name = "Please enter a valid lead passenger name (min 2 characters).";
    }

    const emailVal = state.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      errs.email = "Please enter a valid email address (e.g. name@domain.com).";
    }

    const phoneVal = state.phone.trim().replace(/[^\d+]/g, "");
    if (!phoneVal || phoneVal.length < 7) {
      errs.phone = "Please enter a valid phone number (min 7 digits).";
    }

    if (state.guestCount < 1) {
      errs.guest_count = "Passenger count must be at least 1.";
    }

    setLocalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLocalForm()) return;

    await onSaveDraft();
  };

  return (
    <div className="space-y-8">
      {/* ── 1. HEADER BANNER ── */}
      <div className="border-b border-slate-100 pb-4">
        <span className="text-[10px] font-mono text-amber-800 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
          Step 3 of 5 — Passenger & Contact Details
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
          Lead Guest & Passenger Details
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium leading-relaxed">
          Provide lead passenger information for airside concierge officer assignment and live flight monitoring.
        </p>
      </div>

      {/* ── 2. GENERAL BACKEND ERROR ALERT BANNER ── */}
      {state.validationErrors && state.validationErrors.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs font-sans">
            <strong className="font-bold text-rose-950 font-mono uppercase tracking-wider block">
              Validation Alert
            </strong>
            {state.validationErrors.map((msg, i) => (
              <p key={i}>• {msg}</p>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. MAIN FORM & SIDEBAR GRID (Desktop 2-column, Mobile 1-column) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 text-slate-900 font-serif font-bold text-lg border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-amber-600" />
              <span>Lead Guest Contact Details</span>
            </div>

            {/* Field A: Full Name */}
            <div>
              <label
                htmlFor="full_name"
                className="block text-xs font-mono text-slate-900 uppercase tracking-wider font-bold mb-1.5"
              >
                Lead Guest Full Name <span className="text-amber-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="full_name"
                  type="text"
                  required
                  value={state.fullName}
                  onChange={(e) => {
                    onChange({ fullName: e.target.value });
                    if (localErrors.full_name) setLocalErrors((p) => ({ ...p, full_name: "" }));
                  }}
                  placeholder="e.g. Lord Henry Sterling"
                  aria-invalid={Boolean(getFieldError("full_name"))}
                  aria-describedby="full_name_error"
                  className={`w-full px-4 py-3.5 rounded-2xl bg-slate-50 text-slate-900 text-sm font-sans font-medium transition-all outline-none border ${
                    getFieldError("full_name")
                      ? "border-rose-500 bg-rose-50/30 focus:ring-2 focus:ring-rose-500"
                      : "border-slate-200 hover:border-slate-300 focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                  }`}
                />
              </div>
              {getFieldError("full_name") && (
                <p id="full_name_error" className="text-xs text-rose-600 font-sans mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{getFieldError("full_name")}</span>
                </p>
              )}
            </div>

            {/* Field B: Email & Phone (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-mono text-slate-900 uppercase tracking-wider font-bold mb-1.5"
                >
                  Email Address <span className="text-amber-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={state.email}
                    onChange={(e) => {
                      onChange({ email: e.target.value });
                      if (localErrors.email) setLocalErrors((p) => ({ ...p, email: "" }));
                    }}
                    placeholder="e.g. henry@sterling.com"
                    aria-invalid={Boolean(getFieldError("email"))}
                    aria-describedby="email_error"
                    className={`w-full px-4 py-3.5 rounded-2xl bg-slate-50 text-slate-900 text-sm font-sans font-medium transition-all outline-none border ${
                      getFieldError("email")
                        ? "border-rose-500 bg-rose-50/30 focus:ring-2 focus:ring-rose-500"
                        : "border-slate-200 hover:border-slate-300 focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    }`}
                  />
                </div>
                {getFieldError("email") && (
                  <p id="email_error" className="text-xs text-rose-600 font-sans mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{getFieldError("email")}</span>
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs font-mono text-slate-900 uppercase tracking-wider font-bold mb-1.5"
                >
                  Mobile / WhatsApp Number <span className="text-amber-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={state.phone}
                    onChange={(e) => {
                      onChange({ phone: e.target.value });
                      if (localErrors.phone) setLocalErrors((p) => ({ ...p, phone: "" }));
                    }}
                    placeholder="e.g. +91 98765 43210"
                    aria-invalid={Boolean(getFieldError("phone"))}
                    aria-describedby="phone_error"
                    className={`w-full px-4 py-3.5 rounded-2xl bg-slate-50 text-slate-900 text-sm font-sans font-medium transition-all outline-none border ${
                      getFieldError("phone")
                        ? "border-rose-500 bg-rose-50/30 focus:ring-2 focus:ring-rose-500"
                        : "border-slate-200 hover:border-slate-300 focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    }`}
                  />
                </div>
                {getFieldError("phone") && (
                  <p id="phone_error" className="text-xs text-rose-600 font-sans mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{getFieldError("phone")}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Field C: Passenger Count Stepper */}
            <div>
              <label className="block text-xs font-mono text-slate-900 uppercase tracking-wider font-bold mb-2">
                Number of Passengers <span className="text-amber-600">*</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onChange({ guestCount: Math.max(1, guestCount - 1) })}
                  className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-lg flex items-center justify-center transition cursor-pointer"
                >
                  -
                </button>

                <div className="px-6 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 font-mono font-extrabold text-base min-w-[80px] text-center">
                  {guestCount} Pax
                </div>

                <button
                  type="button"
                  onClick={() => onChange({ guestCount: Math.min(20, guestCount + 1) })}
                  className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-lg flex items-center justify-center transition cursor-pointer"
                >
                  +
                </button>

                <span className="text-xs text-slate-500 font-sans ml-2">
                  (Includes lead guest + travelling companions)
                </span>
              </div>
            </div>

            {/* Field D: Collapsible Special Assistance Requirements */}
            <div className="border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowSpecialRequests(!showSpecialRequests)}
                className="flex items-center justify-between w-full text-xs font-mono font-bold text-slate-800 uppercase tracking-wider hover:text-amber-700 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Special Requirements & Assistance (Optional)</span>
                </span>
                {showSpecialRequests ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showSpecialRequests && (
                <div className="pt-3 space-y-3">
                  <textarea
                    value={state.specialRequests}
                    onChange={(e) => onChange({ specialRequests: e.target.value })}
                    rows={3}
                    placeholder="e.g. Wheelchair ramp assistance required, 4 heavy luggage bags, extra legroom buggy requested..."
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-sans focus:outline-none focus:border-amber-600 focus:bg-white transition"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Back to Services
            </button>

            <button
              type="submit"
              disabled={state.isSavingDraft}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white font-mono text-xs font-extrabold uppercase tracking-widest shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
            >
              {state.isSavingDraft ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Saving your details...</span>
                </span>
              ) : (
                <>
                  <span>Continue to Summary & Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Preserved Journey & Service Summary Sidebar */}
        <div className="lg:col-span-4 space-y-4 sticky top-24">
          <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Selected Journey</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                {state.direction}
              </span>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Flight Number:</span>
                <span className="font-mono font-bold text-white">{state.flightNumber || "Manual Entry"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Airport:</span>
                <span className="font-bold text-white text-right">
                  {state.resolvedAirport?.name || state.airportName} ({state.resolvedAirport?.code || state.airportCode})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Date & Time:</span>
                <span className="font-bold text-white">
                  {state.serviceDate} @ {state.serviceTime}
                </span>
              </div>

              {/* Package or Services breakdown */}
              {priceBreakdown?.packageItem && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">Package: {priceBreakdown.packageItem.title}</span>
                  <span className="font-mono font-bold text-amber-400">
                    {currencySymbol}{priceBreakdown.packageItem.price.toLocaleString()}
                  </span>
                </div>
              )}

              {priceBreakdown?.additionalServices && priceBreakdown.additionalServices.length > 0 && (
                <div className="space-y-1">
                  {priceBreakdown.additionalServices.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-300">
                      <span>• {s.title}</span>
                      <span className="font-mono font-bold text-white">
                        +{currencySymbol}{s.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between font-mono">
                <span className="text-[11px] text-slate-400 uppercase font-bold">Total ({guestCount} Pax)</span>
                <span className="text-xl font-extrabold text-amber-400">
                  {currencySymbol}{(priceBreakdown?.grandTotal || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
