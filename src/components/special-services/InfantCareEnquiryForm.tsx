import React, { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Calendar,
  Plane,
  MapPin,
  User,
  Phone,
  MessageSquare,
  Send,
  Baby,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { enquiryApi } from "@/lib/api/enquiryApi";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { display, mono } from "@/components/home/theme";
import {
  sanitizeName,
  sanitizePhone,
  preventDigitsKeyDown,
  preventLettersKeyDown,
  validateNameNoDigits,
  validatePhoneNoLetters,
} from "@/lib/inputValidation";

export interface InfantCareEnquiryFormProps {
  onSuccess?: (bookingRef: string) => void;
  className?: string;
  initialAirport?: string;
}

export type AssistanceRequiredType = "Arrival" | "Departure" | "Transit";

const ASSISTANCE_OPTIONS: { id: AssistanceRequiredType; label: string; desc: string }[] = [
  { id: "Arrival", label: "Arrival", desc: "Aerobridge meet, stroller retrieval & exit escort" },
  { id: "Departure", label: "Departure", desc: "Curbside greeting, security fast-track & gate escort" },
  { id: "Transit", label: "Transit", desc: "Inter-terminal transfer & feeding layover assistance" },
];

const INFANT_AGE_SUGGESTIONS = [
  "Under 6 Months",
  "6 – 12 Months",
  "1 – 2 Years",
  "2+ Years (Toddler)",
];

export const InfantCareEnquiryForm: React.FC<InfantCareEnquiryFormProps> = ({
  onSuccess,
  className = "",
  initialAirport = "",
}) => {
  // Form State
  const [parentName, setParentName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [airport, setAirport] = useState(initialAirport);
  const [flightNumber, setFlightNumber] = useState("");
  const [flightDate, setFlightDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [infantAge, setInfantAge] = useState("");
  const [assistanceRequired, setAssistanceRequired] = useState<AssistanceRequiredType>("Departure");
  const [additionalRequirements, setAdditionalRequirements] = useState("");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{
    bookingRef: string;
    parentName: string;
  } | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate Parent Name
    const trimmedParentName = parentName.trim();
    if (!trimmedParentName || !validateNameNoDigits(trimmedParentName)) {
      toast.error("Please enter a valid parent name using letters only.");
      return;
    }

    // 2. Validate WhatsApp Number
    const cleanPhone = whatsappNumber.replace(/\D/g, "");
    if (!whatsappNumber.trim() || cleanPhone.length < 8 || !validatePhoneNoLetters(whatsappNumber)) {
      toast.error("Please enter a valid WhatsApp phone number with area/country code.");
      return;
    }

    // 3. Validate Airport
    if (!airport.trim()) {
      toast.error("Please specify the airport (e.g. DEL, BOM, BLR).");
      return;
    }

    // 4. Validate Flight Number
    if (!flightNumber.trim()) {
      toast.error("Please provide the flight number (e.g. 6E 2134, AI 804).");
      return;
    }

    // 5. Validate Flight Date
    if (!flightDate) {
      toast.error("Please select your flight date.");
      return;
    }

    // 6. Validate Infant Age
    if (!infantAge.trim()) {
      toast.error("Please specify your infant's age (e.g. 8 Months, 1 Year).");
      return;
    }

    // 7. Validate Assistance Required
    if (!assistanceRequired) {
      toast.error("Please select the assistance required (Arrival, Departure, or Transit).");
      return;
    }

    setIsSubmitting(true);

    const notesSummary = [
      `[INFANT CARE ASSISTANCE ENQUIRY]`,
      `Parent: ${trimmedParentName}`,
      `WhatsApp: ${cleanPhone}`,
      `Airport: ${airport.trim()}`,
      `Flight: ${flightNumber.trim().toUpperCase()} on ${flightDate}`,
      `Infant Age: ${infantAge.trim()}`,
      `Assistance Required: ${assistanceRequired}`,
      `Additional Requirements: ${additionalRequirements.trim() || "None"}`,
    ].join("\n");

    const payloadDetails = {
      service: "Infant Care Services",
      parent_name: trimmedParentName,
      whatsapp_number: cleanPhone,
      airport: airport.trim(),
      flight_number: flightNumber.trim().toUpperCase(),
      flight_date: flightDate,
      service_date: flightDate,
      infant_age: infantAge.trim(),
      assistance_required: assistanceRequired,
      additional_requirements: additionalRequirements.trim() || undefined,
    };

    try {
      const res = await enquiryApi.submit({
        passengerName: trimmedParentName,
        passengerPhone: cleanPhone,
        passengerEmail: `${cleanPhone}@whatsapp.shafsky.internal`,
        serviceCategory: "Travel Support",
        serviceType: "Infant Care Services",
        origin: airport.trim(),
        destination: airport.trim(),
        serviceDate: flightDate,
        notes: notesSummary,
        details: payloadDetails,
      });

      if (res.success && res.data?.bookingRef) {
        setSubmittedResult({
          bookingRef: res.data.bookingRef,
          parentName: trimmedParentName,
        });
        toast.success(`Enquiry submitted! Reference: ${res.data.bookingRef}`);
        if (onSuccess) {
          onSuccess(res.data.bookingRef);
        }
      } else {
        const errorMsg =
          !res.success && "error" in res && res.error
            ? String(res.error)
            : "Failed to submit enquiry. Please try again or contact our WhatsApp concierge.";
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error("[InfantCareEnquiryForm] submission error:", err);
      toast.error(err?.message || "Something went wrong while submitting your enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppDirectLink = () => {
    const text = encodeURIComponent(
      `Hello Shafsky Concierge Desk,\n\nI would like to inquire about *Infant Care Services*:\n\n*Parent Name:* ${parentName.trim() || "Valued Guest"}\n*Airport:* ${airport.trim() || "Airport"}\n*Flight:* ${flightNumber.trim().toUpperCase() || "Flight"} on ${flightDate}\n*Infant Age:* ${infantAge.trim() || "Not specified"}\n*Assistance Required:* ${assistanceRequired}\n*Additional Requirements:* ${additionalRequirements.trim() || "None"}\n*WhatsApp:* ${whatsappNumber.trim()}`
    );
    return `https://wa.me/919599225778?text=${text}`;
  };

  // ─────────────────────────────────────────────────────────────
  // SUBMISSION SUCCESS STATE
  // ─────────────────────────────────────────────────────────────
  if (submittedResult) {
    return (
      <div className={`bg-white rounded-3xl border border-lime-400 p-8 sm:p-12 text-center shadow-xl ${className}`}>
        <div className="w-16 h-16 rounded-full bg-lime-100 border border-lime-300 flex items-center justify-center mx-auto mb-4 text-lime-700 shadow-sm">
          <CheckCircle2 size={32} />
        </div>
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-lime-700" style={mono}>
          INFANT CARE ENQUIRY REGISTERED
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1 mb-2" style={display}>
          Thank You, {submittedResult.parentName}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6">
          Your Infant Care assistance enquiry has been assigned to our dedicated Airport Family Care Coordinator.
        </p>

        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm font-bold mb-8">
          <span className="text-slate-500 font-normal">Reference:</span>
          <span className="text-lime-700">{submittedResult.bookingRef}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={getWhatsAppDirectLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md"
            style={mono}
          >
            <MessageSquare size={16} />
            <span>Chat on WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={() => {
              setSubmittedResult(null);
              setParentName("");
              setWhatsappNumber("");
              setFlightNumber("");
              setInfantAge("");
              setAdditionalRequirements("");
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-xs font-bold uppercase tracking-wider transition-all"
            style={mono}
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MAIN FORM STATE
  // ─────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10 space-y-6 ${className}`}
    >
      {/* Form Header */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-lime-700 mb-1" style={mono}>
          <Baby size={16} className="text-lime-600" />
          <span>AIRPORT INFANT & PARENT ASSISTANCE</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight" style={display}>
          Infant Care Enquiry Form
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Complete the details below to arrange dedicated airport assistance for you and your baby.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* 1. Parent Name */}
        <div>
          <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5" style={mono}>
            Parent Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              required
              value={parentName}
              onChange={(e) => setParentName(sanitizeName(e.target.value))}
              onKeyDown={preventDigitsKeyDown}
              placeholder="e.g. Priya Sharma"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-500 transition-all"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Letters only, as on travel ID</span>
        </div>

        {/* 2. WhatsApp Number */}
        <div>
          <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5" style={mono}>
            WhatsApp Number <span className="text-rose-500">*</span>
          </label>
          <PhoneInput
            required
            value={whatsappNumber}
            onChange={setWhatsappNumber}
            placeholder="WhatsApp number"
            wrapperClassName="h-11"
            className="h-11 border-slate-200 focus:ring-lime-400/50 focus:border-lime-500 text-xs sm:text-sm"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">Coordinator will message updates to this WhatsApp</span>
        </div>

        {/* 3. Airport */}
        <div>
          <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5" style={mono}>
            Airport <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              required
              value={airport}
              onChange={(e) => setAirport(e.target.value)}
              placeholder="e.g. New Delhi (DEL) / Mumbai (BOM)"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-500 transition-all"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Airport name or 3-letter IATA code</span>
        </div>

        {/* 4. Flight Number */}
        <div>
          <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5" style={mono}>
            Flight Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Plane size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              required
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
              placeholder="e.g. 6E 2134 / AI 804 / EK 512"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-500 transition-all font-mono uppercase"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">For terminal and gate synchronization</span>
        </div>

        {/* 5. Flight Date */}
        <div>
          <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5" style={mono}>
            Flight Date <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="date"
              required
              min={today}
              value={flightDate}
              onChange={(e) => setFlightDate(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-500 transition-all cursor-pointer"
            />
          </div>
        </div>

        {/* 6. Infant Age */}
        <div>
          <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5" style={mono}>
            Infant Age <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Baby size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              required
              value={infantAge}
              onChange={(e) => setInfantAge(e.target.value)}
              placeholder="e.g. 6 Months / 1 Year"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-500 transition-all"
            />
          </div>
          {/* Quick selection pills */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {INFANT_AGE_SUGGESTIONS.map((age) => (
              <button
                key={age}
                type="button"
                onClick={() => setInfantAge(age)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  infantAge === age
                    ? "bg-lime-100 text-lime-800 border-lime-400 font-bold"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
                style={mono}
              >
                {age}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Assistance Required (Arrival, Departure, Transit) */}
      <div>
        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-2" style={mono}>
          Assistance Required <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ASSISTANCE_OPTIONS.map((opt) => {
            const isSelected = assistanceRequired === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAssistanceRequired(opt.id)}
                className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-lime-50 to-lime-100/70 border-lime-400 shadow-sm ring-1 ring-lime-400/40"
                    : "bg-slate-50/70 hover:bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? "text-slate-950" : "text-slate-700"}`} style={mono}>
                    {opt.label}
                  </span>
                  {/* Circular Select Icon: Filled when selected, blank outline when not */}
                  <span
                    aria-hidden="true"
                    className={`relative inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                      isSelected
                        ? "border-[1.5px] border-slate-950 bg-slate-950"
                        : "border-[1.5px] border-slate-400/80 bg-transparent"
                    }`}
                  >
                    {isSelected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {opt.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 8. Additional Requirements (Optional) */}
      <div>
        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5" style={mono}>
          Additional Requirements <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <textarea
          rows={3}
          value={additionalRequirements}
          onChange={(e) => setAdditionalRequirements(e.target.value)}
          placeholder="e.g. Baby pram/stroller escort, hot water warming request for infant milk, luggage porter assistance, twin baby seating..."
          className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-500 transition-all resize-none"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
        <a
          href={getWhatsAppDirectLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-600 hover:text-emerald-700 transition"
          style={mono}
        >
          <MessageSquare size={14} className="text-emerald-600" />
          <span>Need Instant Assistance? Chat on WhatsApp</span>
        </a>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          style={mono}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Submitting Enquiry...</span>
            </>
          ) : (
            <>
              <span>Submit Enquiry</span>
              <Send size={15} />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

