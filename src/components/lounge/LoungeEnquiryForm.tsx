import React, { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { enquiryApi, type ServiceEnquiryPayload } from "@/lib/api/enquiryApi";

export interface LoungeEnquiryFormProps {
  initialAirport?: string;
  initialDate?: string;
  initialPax?: number;
  onBackToAirport?: () => void;
  className?: string;
  hideHeader?: boolean;
}

const POPULAR_AIRPORTS = [
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

const LOUNGE_TYPES = [
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

export const LoungeEnquiryForm: React.FC<LoungeEnquiryFormProps> = ({
  initialAirport = "",
  initialDate = "",
  initialPax = 1,
  onBackToAirport,
  className = "",
  hideHeader = false,
}) => {
  // Passenger Details (Ordered First per requirement)
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Service Details (Ordered Second per requirement)
  const [airport, setAirport] = useState(initialAirport || "");
  const [customAirport, setCustomAirport] = useState("");
  const [isOtherAirport, setIsOtherAirport] = useState(false);
  const [loungeType, setLoungeType] = useState("");
  const [travelDate, setTravelDate] = useState(initialDate || "");
  const [preferredTime, setPreferredTime] = useState("");
  const [passengerCount, setPassengerCount] = useState(
    initialPax && initialPax > 1
      ? `${initialPax} Passengers`
      : "1 Passenger"
  );
  const [flightNumber, setFlightNumber] = useState("");
  const [additionalRequirements, setAdditionalRequirements] = useState("");

  // Form State
  const [submitting, setSubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState<{
    bookingRef: string;
    passengerName: string;
  } | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // 1. Passenger details validation
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

    // 2. Service details validation
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fill in all required fields accurately.");
      return;
    }

    const finalAirport = (isOtherAirport ? customAirport : airport).trim();

    setSubmitting(true);
    try {
      const payload: ServiceEnquiryPayload = {
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

      const response = await enquiryApi.submit(payload);

      if (response && response.success && response.data) {
        setEnquirySuccess({
          bookingRef: response.data.bookingRef,
          passengerName: fullName.trim(),
        });
        toast.success("Lounge enquiry received. Our desk will contact you shortly.");
      } else {
        const errorMsg = response && !response.success ? response.error : "Failed to submit enquiry. Please try again.";
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error("[LoungeEnquiryForm] Submit error:", err);
      toast.error(err?.message || "Failed to send enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setEnquirySuccess(null);
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
    setErrors({});
  };

  // Min date today in YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // Success view
  if (enquirySuccess) {
    const waText = encodeURIComponent(
      `Hello Shafsky Aviation! I have submitted a Lounge enquiry (Ref: ${enquirySuccess.bookingRef}) for ${enquirySuccess.passengerName}. Please share lounge availability and pricing.`
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
            Your <span className="font-semibold text-slate-900">Lounge</span> enquiry has been registered with our operations desk.
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
            <span>Our 24/7 VIP concierge team will reach out promptly via WhatsApp &amp; Email with lounge pricing and access details.</span>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Bespoke enquiry request only. No payment or confirmed booking has been processed yet.</span>
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
      {!hideHeader && (
        <div className="border-b border-slate-200/80 pb-4">
          <h2 className="text-2xl sm:text-[26px] font-bold text-slate-950 tracking-tight">
            Lounge Enquiry
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Fill in your travel information below to receive bespoke lounge access rates and availability.
          </p>
        </div>
      )}

      {/* SECTION 1: PASSENGER DETAILS (Ordered First per requirement) */}
      <div className="space-y-3">
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
          <span className="text-[11px] text-slate-500 font-medium">Service Information</span>
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
                  {POPULAR_AIRPORTS.map((ap) => (
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
                  className="h-11 px-3 text-[11px] font-mono text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  List
                </button>
              </div>
            )}
            {errors.airport && (
              <span className="text-[11px] text-rose-500 font-medium">{errors.airport}</span>
            )}
          </div>

          {/* Lounge Type */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
              <span>Lounge Type</span>
              <span className="text-emerald-600 font-bold">*</span>
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
                <option value="" disabled>Select lounge type</option>
                {LOUNGE_TYPES.map((lt) => (
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
            <label className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
              <span>Travel Date</span>
              <span className="text-emerald-600 font-bold">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                min={today}
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
            <label className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
              <span>Preferred Time</span>
              <span className="text-emerald-600 font-bold">*</span>
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
                <option value="" disabled>Select time</option>
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
              placeholder="Any special requirements?"
              className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 pt-2.5 pb-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 bg-white outline-none resize-none transition-all duration-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-xl bg-[#15803d] hover:bg-[#166534] active:bg-[#14532d] disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-sm cursor-pointer"
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
