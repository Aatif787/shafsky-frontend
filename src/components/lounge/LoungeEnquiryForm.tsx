import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  User,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Armchair,
  Calendar,
  Clock,
  Users,
  Plane,
  FileText,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  AlertCircle,
  AlertTriangle,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import {
  loungeApi,
  type LoungeCategory,
  type LoungeEligibilityResult,
  type AirportOptionItem,
} from "@/lib/api/loungeApi";

export interface LoungeEnquiryFormProps {
  initialAirport?: string;
  initialDate?: string;
  initialPax?: number;
  initialCategory?: LoungeCategory;
  onBackToAirport?: () => void;
  className?: string;
  hideHeader?: boolean;
}

const DEFAULT_AIRPORTS: string[] = [
  "Indira Gandhi International Airport (DEL) — New Delhi",
  "Chhatrapati Shivaji Maharaj International Airport (BOM) — Mumbai",
  "Kempegowda International Airport (BLR) — Bengaluru",
  "Rajiv Gandhi International Airport (HYD) — Hyderabad",
  "Goa International Airport (GOI / Dabolim) — Goa",
  "Manohar International Airport (GOX / Mopa) — Goa",
  "Chennai International Airport (MAA) — Chennai",
  "Netaji Subhash Chandra Bose International Airport (CCU) — Kolkata",
  "Cochin International Airport (COK) — Kochi",
  "Sardar Vallabhbhai Patel International Airport (AMD) — Ahmedabad",
  "Dubai International Airport (DXB) — Dubai, UAE",
  "Heathrow Airport (LHR) — London, UK",
  "Singapore Changi Airport (SIN) — Singapore",
  "Hamad International Airport (DOH) — Doha, Qatar",
  "Suvarnabhumi Airport (BKK) — Bangkok, Thailand",
];

const DOMESTIC_LOUNGE_TYPES = [
  "Domestic Departure Lounge",
  "Executive / Plaza Premium Lounge",
  "Business Class Lounge",
  "VIP / First Class Lounge",
  "Arrival Lounge",
];

const INTERNATIONAL_LOUNGE_TYPES = [
  "International Departure Lounge",
  "VIP / First Class Lounge",
  "Business Class Lounge",
  "Executive / Plaza Premium Lounge",
  "Arrival Lounge",
];

const ALL_LOUNGE_TYPES = [
  "VIP / First Class Lounge",
  "Business Class Lounge",
  "Executive / Plaza Premium Lounge",
  "Arrival Lounge",
  "Domestic Departure Lounge",
  "International Departure Lounge",
];

const PREFERRED_TIMES = [
  "Morning (06:00 – 12:00)",
  "Afternoon (12:00 – 18:00)",
  "Evening (18:00 – 22:00)",
  "Night / Early Morning (22:00 – 06:00)",
];

const PASSENGER_OPTIONS = [
  "1 Passenger",
  "2 Passengers",
  "3 Passengers",
  "4 Passengers",
  "5 Passengers",
  "6+ Passengers (Group)",
];

const AIRPORT_TIMEZONES: Record<string, string> = {
  DEL: "Asia/Kolkata",
  BOM: "Asia/Kolkata",
  BLR: "Asia/Kolkata",
  HYD: "Asia/Kolkata",
  GOI: "Asia/Kolkata",
  GOX: "Asia/Kolkata",
  MAA: "Asia/Kolkata",
  CCU: "Asia/Kolkata",
  COK: "Asia/Kolkata",
  AMD: "Asia/Kolkata",
  DXB: "Asia/Dubai",
  LHR: "Europe/London",
  SIN: "Asia/Singapore",
  DOH: "Asia/Qatar",
  BKK: "Asia/Bangkok",
};

/**
 * Resolves IANA timezone from airport label or code. Defaults to Asia/Kolkata.
 */
function resolveTimezoneForAirport(
  airportStr: string,
  airportsMeta?: AirportOptionItem[]
): string {
  if (!airportStr) return "Asia/Kolkata";
  const match = airportStr.toUpperCase().match(/\b([A-Z]{3})\b/);
  const code = match ? match[1] : airportStr.substring(0, 3).toUpperCase();

  if (airportsMeta) {
    const found = airportsMeta.find((a) => a.code.toUpperCase() === code);
    if (found && found.timezone) return found.timezone;
  }

  return AIRPORT_TIMEZONES[code] || "Asia/Kolkata";
}

/**
 * Real-time frontend calculation helper for immediate user feedback.
 * Authoritative evaluation is returned by backend loungeApi.checkEligibility.
 */
function computeFrontendCutoff(params: {
  category: LoungeCategory | null;
  travelDate: string;
  preferredTime: string;
  airportTimezone: string;
  serverTimeIso?: string;
}): {
  eligible: boolean;
  isGracePeriod: boolean;
  leadTimeHours: number;
  noticeHours: number;
  gracePeriodHours: number;
  minRequiredHours: number;
  message: string;
} {
  const category = params.category || "Domestic";
  const tz = params.airportTimezone || "Asia/Kolkata";
  const noticeHours = category === "Domestic" ? 12 : 24;
  const gracePeriodHours = 1;
  const minRequiredHours = noticeHours - gracePeriodHours; // 11 or 23

  if (!params.travelDate || !params.preferredTime) {
    return {
      eligible: true,
      isGracePeriod: false,
      leadTimeHours: 0,
      noticeHours,
      gracePeriodHours,
      minRequiredHours,
      message: "",
    };
  }

  let hour = 6;
  let minute = 0;
  if (params.preferredTime.includes("Morning")) hour = 6;
  else if (params.preferredTime.includes("Afternoon")) hour = 12;
  else if (params.preferredTime.includes("Evening")) hour = 18;
  else if (params.preferredTime.includes("Night")) hour = 22;
  else {
    const m = params.preferredTime.match(/(\d{1,2}):(\d{2})/);
    if (m) {
      hour = parseInt(m[1], 10);
      minute = parseInt(m[2], 10);
    }
  }

  let scheduledUtcMs: number;
  try {
    const [y, mon, d] = params.travelDate.split("-").map(Number);
    const naiveUtc = Date.UTC(y, mon - 1, d, hour, minute, 0);

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date(naiveUtc));
    const p: Record<string, number> = {};
    for (const part of parts) {
      if (part.type !== "literal") p[part.type] = Number(part.value);
    }
    const localAtNaive = Date.UTC(
      p.year,
      p.month - 1,
      p.day,
      (p.hour || 0) % 24,
      p.minute,
      p.second
    );
    const offsetMs = localAtNaive - naiveUtc;
    scheduledUtcMs = naiveUtc - offsetMs;
  } catch {
    const [y, mon, d] = params.travelDate.split("-").map(Number);
    const naiveUtc = Date.UTC(y, mon - 1, d, hour, minute, 0);
    scheduledUtcMs = naiveUtc - 5.5 * 3600 * 1000;
  }

  const currentUtcMs = params.serverTimeIso
    ? new Date(params.serverTimeIso).getTime()
    : Date.now();

  const leadTimeHours = (scheduledUtcMs - currentUtcMs) / (3600 * 1000);

  if (leadTimeHours <= 0) {
    return {
      eligible: false,
      isGracePeriod: false,
      leadTimeHours: 0,
      noticeHours,
      gracePeriodHours,
      minRequiredHours,
      message:
        "The selected travel date and time is in the past. Please select an upcoming date and time.",
    };
  }

  if (leadTimeHours >= noticeHours) {
    return {
      eligible: true,
      isGracePeriod: false,
      leadTimeHours: Math.round(leadTimeHours * 10) / 10,
      noticeHours,
      gracePeriodHours,
      minRequiredHours,
      message: `Standard notice period met (${leadTimeHours.toFixed(1)}h notice in ${tz}).`,
    };
  }

  if (leadTimeHours >= minRequiredHours) {
    return {
      eligible: true,
      isGracePeriod: true,
      leadTimeHours: Math.round(leadTimeHours * 10) / 10,
      noticeHours,
      gracePeriodHours,
      minRequiredHours,
      message: `Within 1-hour grace period (${leadTimeHours.toFixed(1)}h notice). Subject to lounge availability.`,
    };
  }

  return {
    eligible: false,
    isGracePeriod: false,
    leadTimeHours: Math.round(leadTimeHours * 10) / 10,
    noticeHours,
    gracePeriodHours,
    minRequiredHours,
    message: `Selected time is outside the allowed enquiry window. ${category} lounge enquiries require at least ${noticeHours} hours' notice (minimum ${minRequiredHours} hours with grace period). Current lead time is ${Math.max(0, leadTimeHours).toFixed(1)} hours.`,
  };
}

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
  const [customAirport, setCustomAirport] = useState("");
  const [isOtherAirport, setIsOtherAirport] = useState(false);
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

  // Airport timezone
  const selectedAirportStr = isOtherAirport ? customAirport : airport;
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
    const finalAirport = (isOtherAirport ? customAirport : airport).trim();
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

    const finalAirport = (isOtherAirport ? customAirport : airport).trim();
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
    setCustomAirport("");
    setIsOtherAirport(false);
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
    const waText = encodeURIComponent(
      `Hello Shafsky Aviation! I have submitted a Lounge enquiry (Ref: ${enquirySuccess.bookingRef}) for ${enquirySuccess.passengerName}. Please share lounge availability and access rates.`
    );

    return (
      <div className={`p-6 sm:p-8 text-center space-y-6 ${className}`}>
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-600 shadow-sm animate-in zoom-in-75 duration-300">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            Enquiry Received
          </span>
          <h3 className="text-2xl font-bold text-slate-950 tracking-tight">
            Thank you, {enquirySuccess.passengerName}
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Your <span className="font-semibold text-slate-900">Lounge</span> enquiry has been registered with our VIP concierge desk.
          </p>
        </div>

        {enquirySuccess.bookingRef && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 max-w-xs mx-auto shadow-2xs">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Enquiry Reference
            </p>
            <p className="text-lg font-mono font-bold text-slate-900 tracking-wider mt-0.5">
              {enquirySuccess.bookingRef}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-md mx-auto">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Our 24/7 VIP concierge team will reach out promptly via WhatsApp &amp; Email with verified lounge availability and rates.</span>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Enquiry request only. No payment, charge, or automatic confirmed booking has been created.</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`https://wa.me/917428300207?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Connect on WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs"
          >
            <span>Submit Another Enquiry</span>
          </button>
        </div>
      </div>
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
            <span
              className="leading-snug"
              dangerouslySetInnerHTML={{
                __html:
                  "Domestic lounge enquiries require at least 12 hours' notice. A 1-hour grace period may apply, subject to availability.",
              }}
            />
          </div>
        )}

        {loungeCategory === "International" && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs text-slate-700 flex items-start gap-2 animate-in fade-in duration-200">
            <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span
              className="leading-snug"
              dangerouslySetInnerHTML={{
                __html:
                  "International lounge enquiries require at least 24 hours' notice. A 1-hour grace period may apply, subject to availability.",
              }}
            />
          </div>
        )}

        {!loungeCategory && (
          <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-800 flex items-start gap-2 animate-in fade-in duration-200">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span
              className="leading-snug"
              dangerouslySetInnerHTML={{
                __html:
                  "Please select <strong class='font-semibold text-amber-950'>Domestic</strong> or <strong class='font-semibold text-amber-950'>International</strong> to proceed with your lounge enquiry.",
              }}
            />
          </div>
        )}
      </div>

      {/* SECTION 1: PASSENGER DETAILS (Ordered First per requirement) */}
      <div className="space-y-3 pt-1 border-t border-slate-200/70">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
            Your Details
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">Passenger Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Full Name */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
              <span>Full Name</span>
              <span className="text-emerald-600 font-bold">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
                }}
                placeholder="Enter full name"
                className={`h-11 w-full rounded-xl border pl-10 pr-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 bg-white outline-none transition-all duration-200 ${
                  errors.fullName
                    ? "border-rose-400 ring-2 ring-rose-200/50"
                    : "border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                }`}
              />
            </div>
            {errors.fullName && (
              <span className="text-[11px] text-rose-500 font-medium">{errors.fullName}</span>
            )}
          </div>

          {/* Mobile Number */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
              <span>Mobile Number</span>
              <span className="text-emerald-600 font-bold">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => {
                  setMobileNumber(e.target.value);
                  if (errors.mobileNumber) setErrors((prev) => ({ ...prev, mobileNumber: "" }));
                }}
                placeholder="Enter mobile number"
                className={`h-11 w-full rounded-xl border pl-10 pr-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 bg-white outline-none transition-all duration-200 ${
                  errors.mobileNumber
                    ? "border-rose-400 ring-2 ring-rose-200/50"
                    : "border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                }`}
              />
            </div>
            {errors.mobileNumber && (
              <span className="text-[11px] text-rose-500 font-medium">{errors.mobileNumber}</span>
            )}
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
              <span>Email Address</span>
              <span className="text-emerald-600 font-bold">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => {
                  setEmailAddress(e.target.value);
                  if (errors.emailAddress) setErrors((prev) => ({ ...prev, emailAddress: "" }));
                }}
                placeholder="Enter email address"
                className={`h-11 w-full rounded-xl border pl-10 pr-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 bg-white outline-none transition-all duration-200 ${
                  errors.emailAddress
                    ? "border-rose-400 ring-2 ring-rose-200/50"
                    : "border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                }`}
              />
            </div>
            {errors.emailAddress && (
              <span className="text-[11px] text-rose-500 font-medium">{errors.emailAddress}</span>
            )}
          </div>

          {/* WhatsApp Number (Optional) */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
              <span>WhatsApp Number</span>
              <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="Enter whatsapp number"
                className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 bg-white outline-none transition-all duration-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: SERVICE DETAILS (Ordered Second per requirement) */}
      <div className="space-y-3 pt-2 border-t border-slate-200/70">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
            Lounge Details
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Service Information</span>
            <span className="hidden sm:inline-flex font-mono text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
              Airport TZ: {currentAirportTimezone} {airportLocalTimeDisplay && `(${airportLocalTimeDisplay})`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Airport */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
              <span>Airport</span>
              <span className="text-emerald-600 font-bold">*</span>
            </label>
            {!isOtherAirport ? (
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={airport}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "__OTHER__") {
                      setIsOtherAirport(true);
                      setAirport("");
                    } else {
                      setAirport(val);
                      if (errors.airport) setErrors((prev) => ({ ...prev, airport: "" }));
                    }
                  }}
                  className={`h-11 w-full rounded-xl border pl-10 pr-9 text-xs font-medium text-slate-900 bg-white outline-none appearance-none transition-all duration-200 cursor-pointer ${
                    errors.airport
                      ? "border-rose-400 ring-2 ring-rose-200/50"
                      : "border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                  }`}
                >
                  <option value="" disabled>Select airport</option>
                  {(serverAirports.length > 0
                    ? serverAirports.map((ap) => `${ap.name} (${ap.code}) — ${ap.city}`)
                    : DEFAULT_AIRPORTS
                  ).map((ap) => (
                    <option key={ap} value={ap}>
                      {ap}
                    </option>
                  ))}
                  <option value="__OTHER__">+ Specify Other Airport...</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={customAirport}
                    onChange={(e) => {
                      setCustomAirport(e.target.value);
                      if (errors.airport) setErrors((prev) => ({ ...prev, airport: "" }));
                    }}
                    placeholder="Enter airport code or city name"
                    autoFocus
                    className={`h-11 w-full rounded-xl border pl-10 pr-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 bg-white outline-none transition-all duration-200 ${
                      errors.airport
                        ? "border-rose-400 ring-2 ring-rose-200/50"
                        : "border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                    }`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOtherAirport(false);
                    setCustomAirport("");
                  }}
                  className="h-11 px-3 text-[11px] font-mono text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  List
                </button>
              </div>
            )}
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
        {travelDate && preferredTime && (
          <div className="pt-1">
            {/* 1. Outside Allowed Enquiry Window (Inline Error) */}
            {!activeEligibility.eligible && (
              <div
                id="lounge-cutoff-ineligible-notice"
                className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5 animate-in fade-in duration-200"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-rose-950">Outside Allowed Enquiry Window</p>
                  <p className="text-rose-800 leading-relaxed">{activeEligibility.message}</p>
                  <p className="text-[11px] text-rose-600 pt-0.5 font-medium">
                    Please select a date or time further ahead to fulfill the required notice window.
                  </p>
                </div>
              </div>
            )}

            {/* 2. Within 1-Hour Grace Period (Inline Notice) */}
            {activeEligibility.eligible && activeEligibility.isGracePeriod && (
              <div
                id="lounge-cutoff-grace-notice"
                className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 animate-in fade-in duration-200"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-amber-950">1-Hour Grace Period Window</p>
                  <p className="text-amber-800 leading-relaxed">
                    This enquiry is within the 1-hour grace period ({activeEligibility.leadTimeHours.toFixed(1)}h before service in {currentAirportTimezone}). Submission is accepted, but access is strictly subject to lounge operational availability.
                  </p>
                </div>
              </div>
            )}

            {/* 3. Standard Eligibility Met (Inline Confirmation) */}
            {activeEligibility.eligible && !activeEligibility.isGracePeriod && (
              <div
                id="lounge-cutoff-eligible-notice"
                className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in duration-200"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Notice window met ({activeEligibility.leadTimeHours.toFixed(0)}h notice in airport local time: {currentAirportTimezone}).
                  </span>
                </div>
                {checkingEligibility && (
                  <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0" />
                )}
              </div>
            )}
          </div>
        )}

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
