import React, { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Calendar,
  Plane,
  MapPin,
  User,
  Mail,
  Phone,
  ShieldCheck,
  MessageSquare,
  Send,
  ExternalLink,
  Check,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWebsiteContacts } from "@/hooks/useWebsiteContacts";
import { enquiryApi } from "@/lib/api/enquiryApi";
import { display } from "@/components/home/theme";
import {
  sanitizeName,
  sanitizePhone,
  preventDigitsKeyDown,
  preventLettersKeyDown,
} from "@/lib/inputValidation";

export interface OnboardMealArrangementFormProps {
  onSuccess?: (bookingRef: string) => void;
  className?: string;
}

const MEAL_TYPES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks",
  "Beverages",
  "Special Meal",
] as const;

const MEAL_PREFERENCES = [
  "Vegetarian",
  "Non-Vegetarian",
  "Jain",
  "Vegan",
  "Halal",
  "Gluten-Free",
  "Other",
] as const;

const ALLERGIES_LIST = [
  "None",
  "Dairy",
  "Gluten",
  "Seafood",
  "Other",
] as const;

export const OnboardMealArrangementForm: React.FC<OnboardMealArrangementFormProps> = ({
  onSuccess,
  className = "",
}) => {
  const queryClient = useQueryClient();
  const { getPrimaryContact } = useWebsiteContacts();
  const primaryContact = getPrimaryContact("meet_greet_lounge");
  const waNumber = primaryContact?.full_phone_number?.replace(/\D/g, "") || "919599087959";

  // Section 1: Passenger & Route Details
  const [passengerName, setPassengerName] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [dateOfTravel, setDateOfTravel] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [sectorRoute, setSectorRoute] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Section 2: Valid ID Details
  const [idType, setIdType] = useState<"Passport" | "Government-issued ID" | "Other">("Passport");
  const [idNumber, setIdNumber] = useState("");

  // Section 3: Meal Arrangement Details
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>(["Breakfast"]);
  const [selectedMealPreferences, setSelectedMealPreferences] = useState<string[]>(["Vegetarian"]);
  const [otherMealPreferenceText, setOtherMealPreferenceText] = useState("");
  const [mealCount, setMealCount] = useState<number>(4);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(["None"]);
  const [otherAllergyText, setOtherAllergyText] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  // Section 4: Declaration
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{
    bookingRef: string;
    passengerName: string;
    sectorRoute: string;
    date: string;
    mealCount: number;
    mealTypes: string[];
    mealPreferences: string[];
  } | null>(null);

  // Toggle Meal Type
  const handleToggleMealType = (type: string) => {
    setSelectedMealTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Toggle Meal Preference
  const handleToggleMealPreference = (pref: string) => {
    setSelectedMealPreferences((prev) => {
      if (prev.includes(pref)) {
        if (pref === "Other") setOtherMealPreferenceText("");
        return prev.filter((p) => p !== pref);
      } else {
        return [...prev, pref];
      }
    });
  };

  // Toggle Allergy with Mutual Exclusivity for "None"
  const handleToggleAllergy = (allergy: string) => {
    setSelectedAllergies((prev) => {
      if (allergy === "None") {
        setOtherAllergyText("");
        return ["None"];
      } else {
        const withoutNone = prev.filter((a) => a !== "None");
        if (withoutNone.includes(allergy)) {
          if (allergy === "Other") setOtherAllergyText("");
          const updated = withoutNone.filter((a) => a !== allergy);
          return updated.length === 0 ? ["None"] : updated;
        } else {
          return [...withoutNone, allergy];
        }
      }
    });
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate Passenger Name
    const trimmedName = passengerName.trim();
    if (!trimmedName || !/^[A-Za-z\s]+$/.test(trimmedName)) {
      toast.error("Please enter a valid passenger name using letters only.");
      return;
    }

    // 2. Validate Contact
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid contact email address.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (!phone.trim() || cleanPhone.length < 7 || /[a-zA-Z]/.test(phone)) {
      toast.error("Please enter a valid phone or WhatsApp number (digits only, no letters).");
      return;
    }

    // 3. Validate Date & Sector
    if (!dateOfTravel) {
      toast.error("Please select a valid date of travel.");
      return;
    }
    if (!sectorRoute.trim()) {
      toast.error("Please specify the flight sector or route.");
      return;
    }

    // 4. Validate Meal Types (At least 1 required)
    if (selectedMealTypes.length === 0) {
      toast.error("Please select at least one meal type (e.g. Breakfast, Lunch, Dinner).");
      return;
    }

    // 5. Validate Meal Count
    if (!mealCount || mealCount < 1 || !Number.isInteger(Number(mealCount))) {
      toast.error("Please enter a valid positive whole number of meals.");
      return;
    }

    // 6. Validate Conditional "Other" fields
    if (selectedMealPreferences.includes("Other") && !otherMealPreferenceText.trim()) {
      toast.error("Please specify your custom meal preference under 'Other'.");
      return;
    }
    if (selectedAllergies.includes("Other") && !otherAllergyText.trim()) {
      toast.error("Please specify your custom allergy or special requirement under 'Other'.");
      return;
    }

    // 7. Validate Declaration
    if (!declarationConfirmed) {
      toast.error("Please check the declaration box before submitting your enquiry.");
      return;
    }

    // Prepare Notes & Details
    const finalPreferences = selectedMealPreferences.map((p) =>
      p === "Other" && otherMealPreferenceText.trim()
        ? `Other: ${otherMealPreferenceText.trim()}`
        : p
    );
    const finalAllergies = selectedAllergies.map((a) =>
      a === "Other" && otherAllergyText.trim() ? `Other: ${otherAllergyText.trim()}` : a
    );

    const notesSummary = [
      `[ON-BOARD MEAL ARRANGEMENT ENQUIRY]`,
      `Sector/Route: ${sectorRoute.trim()}`,
      flightNumber.trim() ? `Flight: ${flightNumber.trim().toUpperCase()}` : null,
      `Date: ${dateOfTravel}`,
      `Total Meals: ${mealCount}`,
      `Meal Types: ${selectedMealTypes.join(", ")}`,
      `Preferences: ${finalPreferences.join(", ")}`,
      `Allergies/Dietary: ${finalAllergies.join(", ")}`,
      idType ? `ID Type: ${idType}` : null,
      idNumber.trim() ? `ID No: ${idNumber.trim()}` : null,
      additionalInstructions.trim()
        ? `Instructions: ${additionalInstructions.trim()}`
        : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const payloadDetails = {
      service: "On-board Meal Arrangements for Group Meet & Greet Bookings",
      service_name: "On-board Meal Arrangement",
      passenger_name: trimmedName,
      flight_number: flightNumber.trim().toUpperCase() || undefined,
      travel_date: dateOfTravel,
      service_date: dateOfTravel,
      sector: sectorRoute.trim(),
      origin: sectorRoute.split(/[–\-]/)[0]?.trim() || sectorRoute.trim(),
      destination: sectorRoute.split(/[–\-]/)[1]?.trim() || sectorRoute.trim(),
      meal_count: mealCount,
      passenger_count: mealCount,
      meal_types: selectedMealTypes,
      meal_preferences: finalPreferences,
      allergies: finalAllergies,
      additional_instructions: additionalInstructions.trim() || undefined,
      id_type: idType,
      id_number: idNumber.trim() || undefined,
      declaration_confirmed: true,
    };

    setIsSubmitting(true);
    try {
      const res = await enquiryApi.submit({
        passengerName: trimmedName,
        passengerEmail: email.trim().toLowerCase(),
        passengerPhone: phone.trim(),
        serviceCategory: "Travel Support",
        serviceType: "On-board Meal Arrangements for Group Meet & Greet Bookings",
        origin: payloadDetails.origin,
        destination: payloadDetails.destination,
        serviceDate: dateOfTravel,
        notes: notesSummary,
        details: payloadDetails,
      });

      if (res.success && res.data?.bookingRef) {
        setSubmittedResult({
          bookingRef: res.data.bookingRef,
          passengerName: trimmedName,
          sectorRoute: sectorRoute.trim(),
          date: dateOfTravel,
          mealCount,
          mealTypes: selectedMealTypes,
          mealPreferences: finalPreferences,
        });

        // Invalidate admin query cache so it reflects immediately in Admin Portal
        queryClient.invalidateQueries({ queryKey: ["admin-bookings-list"] });
        queryClient.invalidateQueries({ queryKey: ["admin-dashboard-metrics"] });

        toast.success(
          `Thank you! Your On-board Meal Arrangement enquiry (${res.data.bookingRef}) has been submitted successfully.`
        );

        if (onSuccess) {
          onSuccess(res.data.bookingRef);
        }
      } else {
        const errorMsg =
          !res.success && "error" in res
            ? String(res.error)
            : "Failed to submit meal arrangement enquiry. Please try again.";
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error("[OnboardMealArrangementForm] Submission error:", err);
      toast.error(
        err?.message ||
          "An unexpected error occurred while submitting your enquiry. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppDeskLink = () => {
    const ref = submittedResult?.bookingRef || "NEW";
    const text = encodeURIComponent(
      `Hello Shafsky Aviation VIP Concierge Desk,\n\n` +
        `I have submitted an On-board Meal Arrangement enquiry.\n` +
        `• Booking Reference: ${ref}\n` +
        `• Passenger Name: ${passengerName || submittedResult?.passengerName}\n` +
        `• Route: ${sectorRoute || submittedResult?.sectorRoute}\n` +
        (flightNumber ? `• Flight: ${flightNumber}\n` : "") +
        `• Travel Date: ${dateOfTravel || submittedResult?.date}\n` +
        `• Meals Count: ${mealCount || submittedResult?.mealCount}\n` +
        `• Meal Types: ${selectedMealTypes.join(", ")}\n` +
        `• Preferences: ${selectedMealPreferences.join(", ")}\n` +
        `• Allergies: ${selectedAllergies.join(", ")}\n` +
        (additionalInstructions ? `• Instructions: ${additionalInstructions}\n\n` : "\n") +
        `Please confirm our in-flight catering coordination.`
    );
    return `https://wa.me/${waNumber}?text=${text}`;
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {submittedResult ? (
        /* ──────────────── SUCCESS CONFIRMATION SCREEN ──────────────── */
        <div className="bg-white rounded-3xl border border-lime-400 p-8 sm:p-12 text-center shadow-xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-lime-100 border border-lime-300 flex items-center justify-center mx-auto mb-4 text-lime-700 shadow-sm">
            <CheckCircle2 size={36} className="stroke-[2.5]" />
          </div>

          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-lime-700 bg-lime-50 px-3.5 py-1 rounded-full border border-lime-200 inline-block">
            ENQUIRY CONFIRMED
          </span>

          <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0a196f] mt-2 mb-1" style={display}>
            Reference #{submittedResult.bookingRef}
          </h3>

          <p className="text-sm text-slate-600 max-w-lg mx-auto mb-6 leading-relaxed">
            Thank you! Your On-board Meal Arrangement enquiry has been submitted successfully. Our VIP catering coordination team will contact you shortly with full menu options.
          </p>

          {/* Summary Dossier Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 sm:p-6 text-left space-y-3 font-sans text-xs max-w-xl mx-auto mb-8 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-slate-500 font-mono uppercase text-[10px] tracking-wider">
                Service Desk
              </span>
              <span className="font-bold text-slate-900 font-mono">
                On-board Meal Arrangement
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block text-[10px] font-mono uppercase tracking-wider">
                  Lead Passenger
                </span>
                <span className="font-semibold text-slate-900">{submittedResult.passengerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-mono uppercase tracking-wider">
                  Sector / Route
                </span>
                <span className="font-semibold text-slate-900">{submittedResult.sectorRoute}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-mono uppercase tracking-wider">
                  Date of Travel
                </span>
                <span className="font-semibold text-slate-900">{submittedResult.date}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-mono uppercase tracking-wider">
                  Meal Units Requested
                </span>
                <span className="font-semibold text-slate-900 font-mono">
                  {submittedResult.mealCount} Meals
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1">
              <span className="text-slate-500 text-[10px] font-mono uppercase tracking-wider block">
                Selected Meal Types & Preferences
              </span>
              <span className="font-medium text-slate-900 block">
                {submittedResult.mealTypes.join(", ")} • {submittedResult.mealPreferences.join(", ")}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={getWhatsAppDeskLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              <MessageSquare size={16} />
              <span>Chat on WhatsApp Directly</span>
              <ExternalLink size={14} />
            </a>

            <button
              type="button"
              onClick={() => setSubmittedResult(null)}
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              Submit Another Enquiry
            </button>
          </div>
        </div>
      ) : (
        /* ──────────────── MAIN ONBOARD MEAL ARRANGEMENT FORM ──────────────── */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden transition-all duration-300">
          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
            {/* ──────────────── SECTION 1: PASSENGER DETAILS ──────────────── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-2 h-2 rounded-full bg-[#0a196f] inline-block" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#0a196f] font-mono">
                  1. Passenger Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Passenger Name */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Passenger Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Passenger full name"
                      value={passengerName}
                      onKeyDown={preventDigitsKeyDown}
                      onChange={(e) => setPassengerName(sanitizeName(e.target.value))}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0a196f] focus:ring-2 focus:ring-[#0a196f]/15 transition font-medium"
                    />
                  </div>
                </div>

                {/* Flight Number (Optional) */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Flight Number <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Plane size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Flight number"
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0a196f] focus:ring-2 focus:ring-[#0a196f]/15 transition font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Date of Travel */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Date of Travel <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={dateOfTravel}
                      onChange={(e) => setDateOfTravel(e.target.value)}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0a196f] focus:ring-2 focus:ring-[#0a196f]/15 transition font-mono cursor-pointer"
                    />
                  </div>
                </div>

                {/* Sector / Route */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Sector / Route <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Departure – Arrival (Sector / Route)"
                      value={sectorRoute}
                      onChange={(e) => setSectorRoute(e.target.value)}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0a196f] focus:ring-2 focus:ring-[#0a196f]/15 transition font-medium"
                    />
                  </div>
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0a196f] focus:ring-2 focus:ring-[#0a196f]/15 transition font-medium"
                    />
                  </div>
                </div>

                {/* Contact Phone / WhatsApp */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Phone / WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="Phone or WhatsApp number"
                      value={phone}
                      onKeyDown={preventLettersKeyDown}
                      onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0a196f] focus:ring-2 focus:ring-[#0a196f]/15 transition font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ──────────────── SECTION 2: VALID ID DETAILS ──────────────── */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-2 h-2 rounded-full bg-[#0a196f] inline-block" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#0a196f] font-mono">
                  2. Valid ID Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* ID Type Dropdown */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    ID Type
                  </label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0a196f] focus:ring-2 focus:ring-[#0a196f]/15 transition cursor-pointer font-medium"
                  >
                    <option value="Passport">Passport</option>
                    <option value="Government-issued ID">Government-issued ID</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* ID Number Input (Optional) */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    ID Number <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ID or passport number"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0a196f] focus:ring-2 focus:ring-[#0a196f]/15 transition font-mono uppercase"
                  />
                </div>

              </div>
            </div>

            {/* ──────────────── SECTION 3: MEAL ARRANGEMENT DETAILS ──────────────── */}
            <div className="space-y-6 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-2 h-2 rounded-full bg-[#0a196f] inline-block" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#0a196f] font-mono">
                  3. Meal Arrangement Details
                </h3>
              </div>

              {/* Sub-section A: Meal Type (Interactive Touch-Friendly Chips) */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-5 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                    A. Meal Type <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Select multiple</span>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  {MEAL_TYPES.map((type) => {
                    const isChecked = selectedMealTypes.includes(type);
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => handleToggleMealType(type)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-all duration-150 cursor-pointer border ${
                          isChecked
                            ? "bg-[#0a196f] text-white border-[#0a196f] shadow-sm font-semibold ring-2 ring-[#0a196f]/15"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70 font-medium"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] transition ${
                            isChecked
                              ? "bg-white/20 border-white/40 text-white"
                              : "border-slate-300 bg-slate-50 text-transparent"
                          }`}
                        >
                          <Check size={11} className={isChecked ? "opacity-100 stroke-[3]" : "opacity-0"} />
                        </span>
                        <span>{type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sub-section B: Meal Preference (Interactive Touch-Friendly Chips) */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-5 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                    B. Meal Preference
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Select multiple</span>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  {MEAL_PREFERENCES.map((pref) => {
                    const isChecked = selectedMealPreferences.includes(pref);
                    return (
                      <button
                        type="button"
                        key={pref}
                        onClick={() => handleToggleMealPreference(pref)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-all duration-150 cursor-pointer border ${
                          isChecked
                            ? "bg-[#0a196f] text-white border-[#0a196f] shadow-sm font-semibold ring-2 ring-[#0a196f]/15"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70 font-medium"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] transition ${
                            isChecked
                              ? "bg-white/20 border-white/40 text-white"
                              : "border-slate-300 bg-slate-50 text-transparent"
                          }`}
                        >
                          <Check size={11} className={isChecked ? "opacity-100 stroke-[3]" : "opacity-0"} />
                        </span>
                        <span>{pref === "Other" ? "Other (specify)" : pref}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Conditional "Other" Meal Preference Field */}
                {selectedMealPreferences.includes("Other") && (
                  <div className="pt-2 max-w-md animate-in fade-in-50 duration-200">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Specify Preference <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Specify custom meal preference"
                      value={otherMealPreferenceText}
                      onChange={(e) => setOtherMealPreferenceText(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0a196f] focus:ring-2 focus:ring-[#0a196f]/15"
                    />
                  </div>
                )}
              </div>

              {/* Sub-section C: Number of Meals & Allergies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Number of Meals Stepper */}
                <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-5 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                        C. Number of Meals and Allergies
                      </span>
                    </div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mt-3 mb-1">
                      Number of Meals <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Total meal portions to coordinate for this flight.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setMealCount((c) => Math.max(1, c - 1))}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 active:bg-slate-200 font-bold text-slate-800 flex items-center justify-center transition cursor-pointer text-lg shadow-sm"
                      aria-label="Decrease meal count"
                    >
                      -
                    </button>
                    <div className="text-center">
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={mealCount}
                        onChange={(e) =>
                          setMealCount(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))
                        }
                        required
                        className="w-24 text-center py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold text-sm text-slate-900 focus:outline-none focus:border-[#0a196f] focus:ring-2 focus:ring-[#0a196f]/15"
                      />
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">
                        {mealCount === 1 ? "1 Meal" : `${mealCount} Meals`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMealCount((c) => Math.min(500, c + 1))}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 active:bg-slate-200 font-bold text-slate-800 flex items-center justify-center transition cursor-pointer text-lg shadow-sm"
                      aria-label="Increase meal count"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Allergies / Special Requirements */}
                <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                      Allergies / Special Requirements
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {ALLERGIES_LIST.map((allergy) => {
                      const isChecked = selectedAllergies.includes(allergy);
                      return (
                        <button
                          type="button"
                          key={allergy}
                          onClick={() => handleToggleAllergy(allergy)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all duration-150 cursor-pointer border ${
                            isChecked
                              ? "bg-[#0a196f] text-white border-[#0a196f] shadow-sm font-semibold ring-2 ring-[#0a196f]/15"
                              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70 font-medium"
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] transition ${
                              isChecked
                                ? "bg-white/20 border-white/40 text-white"
                                : "border-slate-300 bg-slate-50 text-transparent"
                            }`}
                          >
                            <Check size={10} className={isChecked ? "opacity-100 stroke-[3]" : "opacity-0"} />
                          </span>
                          <span>{allergy === "Other" ? "Other (specify)" : allergy}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Conditional "Other" Allergy Field */}
                  {selectedAllergies.includes("Other") && (
                    <div className="pt-2 animate-in fade-in-50 duration-200">
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Specify Allergies <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Specify allergy or requirement"
                        value={otherAllergyText}
                        onChange={(e) => setOtherAllergyText(e.target.value)}
                        required
                        className="w-full px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#0a196f] focus:ring-1 focus:ring-[#0a196f]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-section D: Additional Instructions (Multiline Textarea) */}
              <div className="pt-1">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  D. Additional Instructions{" "}
                  <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="Any specific meal, brand, serving time or other requirements (optional)"
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0a196f] focus:ring-2 focus:ring-[#0a196f]/15 transition resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* ──────────────── SECTION 4: DECLARATION ──────────────── */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-2 h-2 rounded-full bg-[#0a196f] inline-block" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#0a196f] font-mono">
                  4. Declaration
                </h3>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={declarationConfirmed}
                    onChange={(e) => setDeclarationConfirmed(e.target.checked)}
                    required
                    className="w-4 h-4 mt-0.5 rounded border-amber-300 text-[#0a196f] focus:ring-[#0a196f]/20 accent-[#0a196f] cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-slate-800 leading-relaxed font-medium">
                    I confirm that the information provided above is accurate and that the identification document submitted, where required, is valid.
                  </span>
                </label>
              </div>
            </div>

            {/* ──────────────── SUBMIT BUTTON & ACTIONS ──────────────── */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
                <ShieldCheck size={16} className="text-lime-600" />
                <span>Zero charge • Official enquiry for custom quotation</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-3.5 rounded-full bg-[#0a196f] hover:bg-[#071252] active:bg-[#050e40] text-white font-bold text-xs sm:text-sm font-mono uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-lime-400" />
                      <span>Submitting Enquiry...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Enquiry</span>
                      <Send size={15} className="text-lime-400" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>
      )}
    </div>
  );
};
