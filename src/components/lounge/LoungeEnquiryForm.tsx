import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Armchair,
  Calendar,
  Clock,
  Users,
  Plane,
  FileText,
  ArrowRight,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  loungeApi,
  type LoungeCategory,
  type LoungeEligibilityResult,
  type AirportOptionItem,
} from "@/lib/api/loungeApi";
import { IntelligentAirportAutocomplete } from "@/components/booking/shared/IntelligentAirportAutocomplete";
import { formatAirportOption } from "@/lib/api/airportApi";
import { enquiryApi, type ServiceEnquiryPayload } from "@/lib/api/enquiryApi";
import {
  type LoungeEnquiryFormProps,
  DEFAULT_AIRPORTS,
  DOMESTIC_LOUNGE_TYPES,
  INTERNATIONAL_LOUNGE_TYPES,
  ALL_LOUNGE_TYPES,
  PREFERRED_TIMES,
  PASSENGER_OPTIONS,
  AIRPORT_TIMEZONES,
  resolveTimezoneForAirport,
  computeFrontendCutoff,
  LoungeEnquirySuccessView,
  LoungePassengerDetailsSection,
  LoungeCutoffFeedback,
} from "./loungeEnquiryData";

export {
  type LoungeEnquiryFormProps,
  DEFAULT_AIRPORTS,
  DOMESTIC_LOUNGE_TYPES,
  INTERNATIONAL_LOUNGE_TYPES,
  ALL_LOUNGE_TYPES,
  PREFERRED_TIMES,
  PASSENGER_OPTIONS,
  AIRPORT_TIMEZONES,
  resolveTimezoneForAirport,
  computeFrontendCutoff,
  LoungeEnquirySuccessView,
  LoungePassengerDetailsSection,
  LoungeCutoffFeedback,
};

export const LoungeEnquiryForm: React.FC<LoungeEnquiryFormProps> = ({
  initialAirport = "",
  initialDate = "",
  initialPax = 1,
  initialCategory,
  onBackToAirport,
  className = "",
  hideHeader = false,
}) => {
  // 1. Domestic / International Selection (Required before proceeding)
  const [loungeCategory, setLoungeCategory] = useState<LoungeCategory | null>(
    initialCategory || null
  );

  // Passenger Details (Ordered First per architectural requirement)
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Service Details (Ordered Second per architectural requirement)
  const [airport, setAirport] = useState(initialAirport || "");
  const [loungeType, setLoungeType] = useState("");
  const [travelDate, setTravelDate] = useState(initialDate || "");
  const [preferredTime, setPreferredTime] = useState("");
  const [passengerCount, setPassengerCount] = useState(
    initialPax && initialPax > 1 ? `${initialPax} Passengers` : "1 Passenger"
  );
  const [flightNumber, setFlightNumber] = useState("");
  const [additionalRequirements, setAdditionalRequirements] = useState("");

  // Server state & options
  const [serverAirports, setServerAirports] = useState<AirportOptionItem[]>([]);
  const [serverTimeIso, setServerTimeIso] = useState<string | undefined>(undefined);
  const [backendEligibility, setBackendEligibility] =
    useState<LoungeEligibilityResult | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Form Submission State
  const [submitting, setSubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState<{
    bookingRef: string;
    passengerName: string;
  } | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const eligibilityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch verified options and server time from backend
  useEffect(() => {
    let isMounted = true;
    loungeApi
      .getOptions()
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          if (res.data.airports && res.data.airports.length > 0) {
            setServerAirports(res.data.airports);
          }
          if (res.data.server_time) {
            setServerTimeIso(res.data.server_time);
          }
        }
      })
      .catch((err) => {
        console.warn("[LoungeEnquiryForm] Could not load backend options, using verified fallbacks:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync initialAirport prop if changed or passed by parent
  useEffect(() => {
    if (initialAirport && (!airport || airport !== initialAirport)) {
      setAirport(initialAirport);
    }
  }, [initialAirport]);

  // Airport timezone
  const selectedAirportStr = airport;
  const currentAirportTimezone = useMemo(() => {
    return resolveTimezoneForAirport(selectedAirportStr, serverAirports);
  }, [selectedAirportStr, serverAirports]);

  // Current airport local time string (for clear timezone transparency)
  const airportLocalTimeDisplay = useMemo(() => {
    try {
      const now = new Date();
      return new Intl.DateTimeFormat("en-US", {
        timeZone: currentAirportTimezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(now);
    } catch {
      return "";
    }
  }, [currentAirportTimezone]);

  // Relevant lounge options based on selected category
  const relevantLoungeTypes = useMemo(() => {
    if (loungeCategory === "Domestic") return DOMESTIC_LOUNGE_TYPES;
    if (loungeCategory === "International") return INTERNATIONAL_LOUNGE_TYPES;
    return ALL_LOUNGE_TYPES;
  }, [loungeCategory]);

  // Real-time immediate local cutoff evaluation
  const localCutoff = useMemo(() => {
    return computeFrontendCutoff({
      category: loungeCategory,
      travelDate,
      preferredTime,
      airportTimezone: currentAirportTimezone,
      serverTimeIso,
    });
  }, [loungeCategory, travelDate, preferredTime, currentAirportTimezone, serverTimeIso]);

  // Authoritative backend eligibility check (debounced)
  useEffect(() => {
    if (!loungeCategory || !travelDate || !preferredTime) {
      setBackendEligibility(null);
      return;
    }

    if (eligibilityTimerRef.current) {
      clearTimeout(eligibilityTimerRef.current);
    }

    setCheckingEligibility(true);
    eligibilityTimerRef.current = setTimeout(async () => {
      try {
        const res = await loungeApi.checkEligibility({
          lounge_category: loungeCategory,
          travel_date: travelDate,
          preferred_time: preferredTime,
          airport: selectedAirportStr || undefined,
        });

        if (res.success && res.data) {
          setBackendEligibility(res.data);
        }
      } catch (err) {
        console.warn("[LoungeEnquiryForm] Backend eligibility check fallback:", err);
      } finally {
        setCheckingEligibility(false);
      }
    }, 280);

    return () => {
      if (eligibilityTimerRef.current) {
        clearTimeout(eligibilityTimerRef.current);
      }
    };
  }, [loungeCategory, travelDate, preferredTime, selectedAirportStr]);

  // Combined authoritative eligibility verdict (Backend takes absolute precedence)
  const activeEligibility = useMemo(() => {
    if (backendEligibility) {
      return {
        eligible: backendEligibility.eligible,
        isGracePeriod: backendEligibility.is_grace_period,
        leadTimeHours: backendEligibility.lead_time_hours,
        noticeHours: backendEligibility.required_notice_hours,
        gracePeriodHours: backendEligibility.grace_period_hours,
        minRequiredHours: backendEligibility.min_required_hours,
        message: backendEligibility.message,
      };
    }
    return localCutoff;
  }, [backendEligibility, localCutoff]);

  // Handle Category selection
  const handleCategorySelect = (category: LoungeCategory) => {
    setLoungeCategory(category);
    if (errors.loungeCategory) {
      setErrors((prev) => ({ ...prev, loungeCategory: "" }));
    }

    // If existing lounge type is incompatible with the newly selected category, reset it
    const newOptions =
      category === "Domestic" ? DOMESTIC_LOUNGE_TYPES : INTERNATIONAL_LOUNGE_TYPES;
    if (loungeType && !newOptions.includes(loungeType)) {
      setLoungeType("");
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // 0. Domestic / International selection validation
    if (!loungeCategory) {
      newErrors.loungeCategory = "Please select Domestic or International flight category";
    }

    // 1. Passenger details validation (Ordered First)
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      newErrors.fullName = "Full name is required";
    } else if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      newErrors.fullName = "Name must contain letters only";
    }

    const trimmedMobile = mobileNumber.trim();
    if (!trimmedMobile) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^[+\d\s-]{8,18}$/.test(trimmedMobile)) {
      newErrors.mobileNumber = "Enter a valid phone number (min 8 digits)";
    }

    const trimmedEmail = emailAddress.trim();
    if (!trimmedEmail) {
      newErrors.emailAddress = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.emailAddress = "Enter a valid email address";
    }

    // 2. Service details validation (Ordered Second)
    const finalAirport = airport.trim();
    if (!finalAirport) {
      newErrors.airport = "Please select or specify an airport";
    }

    if (!loungeType) {
      newErrors.loungeType = "Please select a lounge type";
    }

    if (!travelDate) {
      newErrors.travelDate = "Please select your travel date";
    }

    if (!preferredTime) {
      newErrors.preferredTime = "Please select your preferred time";
    }

    if (!passengerCount) {
      newErrors.passengerCount = "Please select number of passengers";
    }

    // 3. Cutoff eligibility check (Must not submit if outside allowed window)
    if (travelDate && preferredTime && !activeEligibility.eligible) {
      newErrors.cutoff = activeEligibility.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loungeCategory) {
      toast.error("Please select Domestic or International before proceeding.");
      return;
    }

    if (!validate()) {
      if (!activeEligibility.eligible && (travelDate && preferredTime)) {
        toast.error("Selected time is outside the allowed booking cutoff.");
      } else {
        toast.error("Please fill in all required fields accurately.");
      }
      return;
    }

    const finalAirport = airport.trim();
    const paxNumber = parseInt(passengerCount.replace(/\D/g, ""), 10) || 1;

    setSubmitting(true);
    try {
      // 1. Submit through primary loungeApi endpoint
      const loungePayload = {
        full_name: fullName.trim(),
        mobile_number: mobileNumber.trim(),
        email_address: emailAddress.trim(),
        whatsapp_number: whatsappNumber.trim() || undefined,
        airport: finalAirport,
        lounge_category: loungeCategory,
        lounge_type: loungeType,
        travel_date: travelDate,
        preferred_time: preferredTime,
        number_of_passengers: paxNumber,
        flight_number: flightNumber.trim().toUpperCase() || undefined,
        additional_requirements: additionalRequirements.trim() || undefined,
      };

      // Also prepare fallback general ServiceEnquiryPayload for backward compatibility
      const fallbackPayload: ServiceEnquiryPayload = {
        passengerName: fullName.trim(),
        passengerEmail: emailAddress.trim(),
        passengerPhone: mobileNumber.trim(),
        serviceCategory: "Lounge",
        serviceType: loungeType,
        origin: finalAirport,
        serviceDate: travelDate,
        notes: additionalRequirements.trim() || undefined,
        details: {
          service: "Lounge",
          lounge_category: loungeCategory,
          airport: finalAirport,
          lounge_type: loungeType,
          travel_date: travelDate,
          preferred_time: preferredTime,
          passengers: passengerCount,
          flight_number: flightNumber.trim().toUpperCase() || undefined,
          whatsapp_number: whatsappNumber.trim() || undefined,
          additional_requirements: additionalRequirements.trim() || undefined,
        },
      };

      let bookingRef = "";
      let response = await loungeApi.submit(loungePayload);

      if (response && response.success && response.data) {
        bookingRef = response.data.enquiry_reference;
      } else {
        // Fallback to legacy/general enquiryApi
        const fallbackRes = await enquiryApi.submit(fallbackPayload);
        if (fallbackRes && fallbackRes.success && fallbackRes.data) {
          bookingRef = fallbackRes.data.bookingRef;
        } else {
          const errMsg =
            (!response.success && response.error) ||
            (!fallbackRes.success && fallbackRes.error) ||
            "Failed to submit enquiry. Please try again.";
          throw new Error(errMsg);
        }
      }

      setEnquirySuccess({
        bookingRef,
        passengerName: fullName.trim(),
      });
      toast.success("Lounge enquiry received. Our concierge team will contact you shortly.");
    } catch (err: any) {
      console.error("[LoungeEnquiryForm] Submit error:", err);
      toast.error(err?.message || "Failed to send enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setEnquirySuccess(null);
    setLoungeCategory(initialCategory || null);
    setFullName("");
    setMobileNumber("");
    setEmailAddress("");
    setWhatsappNumber("");
    setAirport("");
    setLoungeType("");
    setTravelDate("");
    setPreferredTime("");
    setPassengerCount("1 Passenger");
    setFlightNumber("");
    setAdditionalRequirements("");
    setBackendEligibility(null);
    setErrors({});
  };

  // Min date today in airport local timezone (YYYY-MM-DD)
  const todayInAirport = useMemo(() => {
    try {
      const now = new Date();
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: currentAirportTimezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(now);
      const y = parts.find((p) => p.type === "year")?.value || "";
      const m = parts.find((p) => p.type === "month")?.value || "";
      const d = parts.find((p) => p.type === "day")?.value || "";
      return `${y}-${m}-${d}`;
    } catch {
      return new Date().toISOString().split("T")[0];
    }
  }, [currentAirportTimezone]);

  // Is submission blocked by cutoff rules?
  const isSubmissionBlocked: boolean =
    !loungeCategory ||
    Boolean(travelDate && preferredTime && !activeEligibility.eligible);

  // Success view (Enquiry only - never confirmed booking)
  if (enquirySuccess) {
    return (
      <LoungeEnquirySuccessView
        enquirySuccess={enquirySuccess}
        className={className}
        onReset={handleReset}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`} noValidate>
      {/* HEADER: Clean title without promotional or introductory text */}
      {!hideHeader && (
        <div className="border-b border-slate-200/80 pb-3">
          <h2 className="text-2xl sm:text-[26px] font-bold text-slate-950 tracking-tight">
            Lounge Enquiry
          </h2>
        </div>
      )}

      {/* 1. DOMESTIC / INTERNATIONAL SELECTION & COMPACT CUTOFF NOTICE */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-medium text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <span>Flight Category</span>
            <span className="text-emerald-600 font-bold">*</span>
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
            {loungeCategory ? `${loungeCategory} Lounge` : "Selection Required"}
          </span>
        </label>

        {/* Clickable segmented buttons */}
        <div
          role="group"
          aria-label="Flight Category Selection"
          className={`grid grid-cols-2 p-1 bg-slate-100 rounded-xl border transition-all duration-200 ${
            errors.loungeCategory
              ? "border-rose-400 ring-2 ring-rose-200/50"
              : "border-slate-200/90"
          }`}
        >
          <button
            type="button"
            id="lounge-category-domestic-btn"
            onClick={() => handleCategorySelect("Domestic")}
            className={`h-10 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              loungeCategory === "Domestic"
                ? "bg-white text-emerald-800 shadow-sm border border-slate-200/80 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <span>Domestic</span>
          </button>
          <button
            type="button"
            id="lounge-category-international-btn"
            onClick={() => handleCategorySelect("International")}
            className={`h-10 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              loungeCategory === "International"
                ? "bg-white text-emerald-800 shadow-sm border border-slate-200/80 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <span>International</span>
          </button>
        </div>
        {errors.loungeCategory && (
          <span className="text-[11px] text-rose-500 font-medium">{errors.loungeCategory}</span>
        )}

        {/* Compact Applicable Booking Notice */}
        {loungeCategory === "Domestic" && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs text-slate-700 flex items-start gap-2 animate-in fade-in duration-200">
            <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span className="leading-snug">
              Domestic lounge enquiries require at least 12 hours' advance notice.
            </span>
          </div>
        )}

        {loungeCategory === "International" && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs text-slate-700 flex items-start gap-2 animate-in fade-in duration-200">
            <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span className="leading-snug">
              International lounge enquiries require at least 24 hours' advance notice.
            </span>
          </div>
        )}

        {!loungeCategory && (
          <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-800 flex items-start gap-2 animate-in fade-in duration-200">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-snug">
              Please select <strong className="font-semibold text-amber-950">Domestic</strong> or{" "}
              <strong className="font-semibold text-amber-950">International</strong> to proceed with your lounge enquiry.
            </span>
          </div>
        )}
      </div>

      {/* SECTION 1: PASSENGER DETAILS (Ordered First per requirement) */}
      <LoungePassengerDetailsSection
        fullName={fullName}
        setFullName={setFullName}
        mobileNumber={mobileNumber}
        setMobileNumber={setMobileNumber}
        emailAddress={emailAddress}
        setEmailAddress={setEmailAddress}
        whatsappNumber={whatsappNumber}
        setWhatsappNumber={setWhatsappNumber}
        errors={errors}
        setErrors={setErrors}
      />

      {/* SECTION 2: SERVICE DETAILS (Ordered Second per requirement) */}
      <div className="space-y-3 pt-2 border-t border-slate-200/70">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
            Lounge Details
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">Service Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Airport - Intelligent Autocomplete matching Meet & Greet booking panel */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
              <span>Airport</span>
              <span className="text-emerald-600 font-bold">*</span>
            </label>
            <div className="relative">
              <IntelligentAirportAutocomplete
                value={airport}
                mode="global"
                showIcon={true}
                placeholder="Search airport (city, name, or 3-letter IATA code)"
                inputClassName={`h-11 w-full rounded-xl border pl-9 pr-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 bg-white outline-none transition-all duration-200 ${
                  errors.airport
                    ? "border-rose-400 ring-2 ring-rose-200/50"
                    : "border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                }`}
                onSelect={(ap) => {
                  setAirport(formatAirportOption(ap));
                  if (errors.airport) setErrors((prev) => ({ ...prev, airport: "" }));
                }}
                onChangeText={(text) => {
                  setAirport(text);
                  if (errors.airport) setErrors((prev) => ({ ...prev, airport: "" }));
                }}
              />
            </div>
            {errors.airport && (
              <span className="text-[11px] text-rose-500 font-medium">{errors.airport}</span>
            )}
          </div>

          {/* Lounge Type (Filtered based on Domestic / International selection) */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span>Lounge Type</span>
                <span className="text-emerald-600 font-bold">*</span>
              </span>
              {loungeCategory && (
                <span className="text-[10px] text-emerald-800 font-mono">
                  {loungeCategory} Options
                </span>
              )}
            </label>
            <div className="relative">
              <Armchair className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={loungeType}
                onChange={(e) => {
                  setLoungeType(e.target.value);
                  if (errors.loungeType) setErrors((prev) => ({ ...prev, loungeType: "" }));
                }}
                className={`h-11 w-full rounded-xl border pl-10 pr-9 text-xs font-medium text-slate-900 bg-white outline-none appearance-none transition-all duration-200 cursor-pointer ${
                  errors.loungeType
                    ? "border-rose-400 ring-2 ring-rose-200/50"
                    : "border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                }`}
              >
                <option value="" disabled>
                  {loungeCategory
                    ? `Select ${loungeCategory.toLowerCase()} lounge type`
                    : "Select lounge type"}
                </option>
                {relevantLoungeTypes.map((lt) => (
                  <option key={lt} value={lt}>
                    {lt}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {errors.loungeType && (
              <span className="text-[11px] text-rose-500 font-medium">{errors.loungeType}</span>
            )}
          </div>

          {/* Travel Date */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span>Travel Date</span>
                <span className="text-emerald-600 font-bold">*</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Airport Date</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                min={todayInAirport}
                value={travelDate}
                onChange={(e) => {
                  setTravelDate(e.target.value);
                  if (errors.travelDate) setErrors((prev) => ({ ...prev, travelDate: "" }));
                }}
                className={`h-11 w-full rounded-xl border pl-10 pr-3.5 text-xs font-medium text-slate-900 bg-white outline-none transition-all duration-200 ${
                  errors.travelDate
                    ? "border-rose-400 ring-2 ring-rose-200/50"
                    : "border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                }`}
              />
            </div>
            {errors.travelDate && (
              <span className="text-[11px] text-rose-500 font-medium">{errors.travelDate}</span>
            )}
          </div>

          {/* Preferred Time */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span>Preferred Time</span>
                <span className="text-emerald-600 font-bold">*</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Local Airport Time</span>
            </label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={preferredTime}
                onChange={(e) => {
                  setPreferredTime(e.target.value);
                  if (errors.preferredTime) setErrors((prev) => ({ ...prev, preferredTime: "" }));
                }}
                className={`h-11 w-full rounded-xl border pl-10 pr-9 text-xs font-medium text-slate-900 bg-white outline-none appearance-none transition-all duration-200 cursor-pointer ${
                  errors.preferredTime
                    ? "border-rose-400 ring-2 ring-rose-200/50"
                    : "border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                }`}
              >
                <option value="" disabled>Select time slot</option>
                {PREFERRED_TIMES.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {errors.preferredTime && (
              <span className="text-[11px] text-rose-500 font-medium">{errors.preferredTime}</span>
            )}
          </div>

          {/* Number of Passengers */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
              <span>Passengers</span>
              <span className="text-emerald-600 font-bold">*</span>
            </label>
            <div className="relative">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={passengerCount}
                onChange={(e) => {
                  setPassengerCount(e.target.value);
                  if (errors.passengerCount) setErrors((prev) => ({ ...prev, passengerCount: "" }));
                }}
                className={`h-11 w-full rounded-xl border pl-10 pr-9 text-xs font-medium text-slate-900 bg-white outline-none appearance-none transition-all duration-200 cursor-pointer ${
                  errors.passengerCount
                    ? "border-rose-400 ring-2 ring-rose-200/50"
                    : "border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                }`}
              >
                {PASSENGER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {errors.passengerCount && (
              <span className="text-[11px] text-rose-500 font-medium">{errors.passengerCount}</span>
            )}
          </div>

          {/* Flight Number (Optional) */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
              <span>Flight Number</span>
              <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Plane className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                placeholder="Enter flight number"
                className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3.5 text-xs font-medium uppercase text-slate-900 placeholder:text-slate-400 placeholder:normal-case bg-white outline-none transition-all duration-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
              />
            </div>
          </div>
        </div>

        {/* REAL-TIME CUTOFF CALCULATION INLINE FEEDBACK */}
        <LoungeCutoffFeedback
          travelDate={travelDate}
          preferredTime={preferredTime}
          activeEligibility={activeEligibility}
          currentAirportTimezone={currentAirportTimezone}
          checkingEligibility={checkingEligibility}
        />

        {/* Additional Requirements (Optional) */}
        <div className="flex flex-col gap-1 pt-1">
          <label className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
            <span>Additional Requirements</span>
            <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <textarea
              rows={3}
              value={additionalRequirements}
              onChange={(e) => setAdditionalRequirements(e.target.value)}
              placeholder="Any special dietary requirements, VIP escort, or specific terminal preferences?"
              className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 pt-2.5 pb-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 bg-white outline-none resize-none transition-all duration-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={Boolean(submitting || isSubmissionBlocked)}
          className={`w-full h-12 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-sm ${
            isSubmissionBlocked
              ? "bg-slate-400 cursor-not-allowed opacity-80"
              : "bg-[#15803d] hover:bg-[#166534] active:bg-[#14532d] cursor-pointer"
          }`}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending Enquiry...</span>
            </>
          ) : (
            <>
              <span>Send Enquiry</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {!loungeCategory && (
          <p className="text-[11px] text-amber-700 text-center mt-1.5 font-medium">
            Please select Domestic or International flight category above to enable submission.
          </p>
        )}

        {Boolean(travelDate && preferredTime && !activeEligibility.eligible) && (
          <p className="text-[11px] text-rose-600 text-center mt-1.5 font-medium">
            Submission disabled: Selected travel date and time is outside the allowed booking cutoff.
          </p>
        )}

        {onBackToAirport && (
          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={onBackToAirport}
              className="text-xs text-slate-500 hover:text-slate-800 underline decoration-slate-300 transition-colors cursor-pointer"
            >
              Back to Airport Services
            </button>
          </div>
        )}
      </div>
    </form>
  );
};
