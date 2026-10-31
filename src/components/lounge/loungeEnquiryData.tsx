import React from "react";
import {
  User,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  type LoungeCategory,
  type AirportOptionItem,
} from "@/lib/api/loungeApi";
import {
  sanitizeName,
  sanitizePhone,
  preventDigitsKeyDown,
  preventLettersKeyDown,
} from "@/lib/inputValidation";

export interface LoungeEnquiryFormProps {
  initialAirport?: string;
  initialDate?: string;
  initialPax?: number;
  initialCategory?: LoungeCategory;
  onBackToAirport?: () => void;
  className?: string;
  hideHeader?: boolean;
}

export const DEFAULT_AIRPORTS: string[] = [
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

export const DOMESTIC_LOUNGE_TYPES = [
  "Domestic Departure Lounge",
  "Executive / Plaza Premium Lounge",
  "Business Class Lounge",
  "VIP / First Class Lounge",
  "Arrival Lounge",
];

export const INTERNATIONAL_LOUNGE_TYPES = [
  "International Departure Lounge",
  "VIP / First Class Lounge",
  "Business Class Lounge",
  "Executive / Plaza Premium Lounge",
  "Arrival Lounge",
];

export const ALL_LOUNGE_TYPES = [
  "VIP / First Class Lounge",
  "Business Class Lounge",
  "Executive / Plaza Premium Lounge",
  "Arrival Lounge",
  "Domestic Departure Lounge",
  "International Departure Lounge",
];

export const PREFERRED_TIMES = [
  "Morning (06:00 – 12:00)",
  "Afternoon (12:00 – 18:00)",
  "Evening (18:00 – 22:00)",
  "Night / Early Morning (22:00 – 06:00)",
];

export const PASSENGER_OPTIONS = [
  "1 Passenger",
  "2 Passengers",
  "3 Passengers",
  "4 Passengers",
  "5 Passengers",
  "6+ Passengers (Group)",
];

export const AIRPORT_TIMEZONES: Record<string, string> = {
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
export function resolveTimezoneForAirport(
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
export function computeFrontendCutoff(params: {
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
      message: `Standard notice period met (${leadTimeHours.toFixed(1)}h advance notice).`,
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
      message: `${category} lounge enquiries require at least ${noticeHours} hours' advance notice.`,
    };
  }

  return {
    eligible: false,
    isGracePeriod: false,
    leadTimeHours: Math.round(leadTimeHours * 10) / 10,
    noticeHours,
    gracePeriodHours,
    minRequiredHours,
    message: `Selected time is outside the allowed enquiry window. ${category} lounge enquiries require at least ${noticeHours} hours' advance notice. Current lead time is ${Math.max(0, leadTimeHours).toFixed(1)} hours.`,
  };
}

export interface LoungeEnquirySuccessViewProps {
  enquirySuccess: {
    bookingRef: string;
    passengerName: string;
  };
  className?: string;
  onReset: () => void;
}

export const LoungeEnquirySuccessView: React.FC<LoungeEnquirySuccessViewProps> = ({
  enquirySuccess,
  className = "",
  onReset,
}) => {
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
          href={`https://wa.me/919599087959?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Connect on WhatsApp</span>
        </a>
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs"
        >
          <span>Submit Another Enquiry</span>
        </button>
      </div>
    </div>
  );
};

export interface LoungePassengerDetailsSectionProps {
  fullName: string;
  setFullName: (val: string) => void;
  mobileNumber: string;
  setMobileNumber: (val: string) => void;
  emailAddress: string;
  setEmailAddress: (val: string) => void;
  whatsappNumber: string;
  setWhatsappNumber: (val: string) => void;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const LoungePassengerDetailsSection: React.FC<LoungePassengerDetailsSectionProps> = ({
  fullName,
  setFullName,
  mobileNumber,
  setMobileNumber,
  emailAddress,
  setEmailAddress,
  whatsappNumber,
  setWhatsappNumber,
  errors,
  setErrors,
}) => {
  return (
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
              onKeyDown={preventDigitsKeyDown}
              onChange={(e) => {
                const val = sanitizeName(e.target.value);
                setFullName(val);
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
              onKeyDown={preventLettersKeyDown}
              onChange={(e) => {
                const val = sanitizePhone(e.target.value);
                setMobileNumber(val);
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
              onKeyDown={preventLettersKeyDown}
              onChange={(e) => setWhatsappNumber(sanitizePhone(e.target.value))}
              placeholder="Enter whatsapp number"
              className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 bg-white outline-none transition-all duration-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export interface LoungeCutoffFeedbackProps {
  travelDate: string;
  preferredTime: string;
  activeEligibility: {
    eligible: boolean;
    isGracePeriod: boolean;
    leadTimeHours: number;
    noticeHours: number;
    gracePeriodHours: number;
    minRequiredHours: number;
    message: string;
  };
  currentAirportTimezone: string;
  checkingEligibility: boolean;
}

export const LoungeCutoffFeedback: React.FC<LoungeCutoffFeedbackProps> = ({
  travelDate,
  preferredTime,
  activeEligibility,
  currentAirportTimezone,
  checkingEligibility,
}) => {
  if (!travelDate || !preferredTime) return null;

  return (
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

      {/* 2. Grace period eligible — show standard confirmation (grace period text removed from UI) */}

      {/* 3. Standard Eligibility Met (Inline Confirmation) */}
      {activeEligibility.eligible && (
        <div
          id="lounge-cutoff-eligible-notice"
          className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Notice window met ({activeEligibility.leadTimeHours.toFixed(0)}h advance notice).
            </span>
          </div>
          {checkingEligibility && (
            <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0" />
          )}
        </div>
      )}
    </div>
  );
};
