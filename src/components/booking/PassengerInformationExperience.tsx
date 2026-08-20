import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Globe,
  FileText,
  CheckCircle2,
  AlertCircle,
  Info,
  HeartPulse,
  Crown,
  Baby,
  Users,
  ShieldCheck,
  Briefcase,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { FloatingInput, FloatingTextArea } from "@/components/ui/interactions";

/* ═══════════════════════════════════════════════════════════════════════════════
 * COUNTRY CODES DATABASE
 * ═══════════════════════════════════════════════════════════════════════════ */

export const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+1", flag: "🇺🇸", name: "USA / Canada" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+41", flag: "🇨🇭", name: "Switzerland" },
  { code: "+852", flag: "🇭🇰", name: "Hong Kong" },
];

export const SPECIAL_ASSISTANCE_OPTIONS = [
  {
    id: "wheelchair",
    title: "Wheelchair & Mobility Escort",
    desc: "Aerobridge wheelchair & dedicated station attendant staged upon landing.",
    icon: HeartPulse,
  },
  {
    id: "infant",
    title: "Infant & Family Care Protocol",
    desc: "Stroller handling, baby care lounge access & priority family escort.",
    icon: Baby,
  },
  {
    id: "senior",
    title: "Senior Citizen Protocol",
    desc: "Gentle pacing, comfortable seating & step-free terminal transit.",
    icon: Users,
  },
  {
    id: "medical",
    title: "Medical & Nurse Escort",
    desc: "Qualified flight nurse or paramedic escort for medical transit.",
    icon: ShieldCheck,
  },
  {
    id: "vip",
    title: "VIP & Diplomatic Security",
    desc: "Discreet VVIP clearance, diplomatic protocol officer & motorcade support.",
    icon: Crown,
  },
  {
    id: "baggage",
    title: "Executive Baggage Porterage",
    desc: "Dedicated porters claim, tag & transfer all check-in & transit bags.",
    icon: Briefcase,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════════
 * PROPS INTERFACE
 * ═══════════════════════════════════════════════════════════════════════════ */

interface PassengerInformationExperienceProps {
  leadPassengerName: string;
  setLeadPassengerName: (val: string) => void;
  passengerEmail: string;
  setPassengerEmail: (val: string) => void;
  passengerPhone: string;
  setPassengerPhone: (val: string) => void;
  countryCode?: string;
  setCountryCode?: (val: string) => void;
  paxAdults: number;
  setPaxAdults: (val: number) => void;
  paxChildren?: number;
  setPaxChildren?: (val: number) => void;
  paxInfants?: number;
  setPaxInfants?: (val: number) => void;
  passportNumber?: string;
  setPassportNumber?: (val: string) => void;
  passportNationality?: string;
  setPassportNationality?: (val: string) => void;
  specialRequests: string;
  setSpecialRequests: (val: string) => void;
  selectedAssistanceOptions?: string[];
  setSelectedAssistanceOptions?: React.Dispatch<React.SetStateAction<string[]>>;
  isInternationalRoute?: boolean;
  subtitle?: string;
}

export function PassengerInformationExperience({
  leadPassengerName,
  setLeadPassengerName,
  passengerEmail,
  setPassengerEmail,
  passengerPhone,
  setPassengerPhone,
  countryCode = "+91",
  setCountryCode,
  paxAdults,
  setPaxAdults,
  paxChildren = 0,
  setPaxChildren,
  paxInfants = 0,
  setPaxInfants,
  passportNumber = "",
  setPassportNumber,
  passportNationality = "Indian",
  setPassportNationality,
  specialRequests,
  setSpecialRequests,
  selectedAssistanceOptions = [],
  setSelectedAssistanceOptions,
  isInternationalRoute = false,
  subtitle = "Enter lead guest details, contact information, and special airside protocols.",
}: PassengerInformationExperienceProps) {
  // Collapsible section controls
  const [openSection, setOpenSection] = useState<"passengers" | "contact" | "requests">("passengers");
  const [showPassport, setShowPassport] = useState(isInternationalRoute);
  const [internalCountryCode, setInternalCountryCode] = useState(countryCode);
  const [internalAssistance, setInternalAssistance] = useState<string[]>(selectedAssistanceOptions);

  // Validation States
  const isNameValid = leadPassengerName.trim().length >= 3;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passengerEmail.trim());
  const isPhoneValid = passengerPhone.trim().replace(/[^0-9]/g, "").length >= 7;

  // Auto-Save Notification
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>("Draft Synced");

  useEffect(() => {
    const timer = setTimeout(() => setAutoSaveStatus("Draft Synced"), 1000);
    return () => clearTimeout(timer);
  }, [leadPassengerName, passengerEmail, passengerPhone, specialRequests]);

  const handleAssistanceToggle = (id: string) => {
    const updated = internalAssistance.includes(id)
      ? internalAssistance.filter((item) => item !== id)
      : [...internalAssistance, id];

    setInternalAssistance(updated);
    if (setSelectedAssistanceOptions) {
      setSelectedAssistanceOptions(updated);
    }

    // Auto append text description to specialRequests if applicable
    const selectedOption = SPECIAL_ASSISTANCE_OPTIONS.find((o) => o.id === id);
    if (selectedOption && !specialRequests.includes(selectedOption.title)) {
      setSpecialRequests(
        specialRequests ? `${specialRequests}\n• ${selectedOption.title}` : `• ${selectedOption.title}`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & AUTO-SAVE INDICATOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <p className="text-xs sm:text-sm text-slate-600 font-sans">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-700 font-bold shrink-0">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>{autoSaveStatus}</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
       * SECTION 1: PASSENGER DETAILS
       * ═══════════════════════════════════════════════════════════════════════ */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md transition-all duration-300">
        <div
          onClick={() => setOpenSection(openSection === "passengers" ? "contact" : "passengers")}
          className="flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center text-[#7c3aed]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7c3aed] font-bold">
                Section 1 of 3
              </div>
              <h3 className="text-xl font-serif text-slate-900 font-medium group-hover:text-[#7c3aed] transition-colors">
                Passenger Details & Headcount
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isNameValid ? (
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Validated
              </span>
            ) : (
              <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-bold">
                Required
              </span>
            )}
            {openSection === "passengers" ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {openSection === "passengers" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 pt-6 border-t border-slate-100 space-y-6 overflow-hidden"
            >
              {/* LEAD PASSENGER NAME WITH FLOATING LABEL & VALIDATION */}
              <div>
                <FloatingInput
                  id="lead_guest_name"
                  label="Lead Guest Full Name (as on Passport / Photo ID) *"
                  value={leadPassengerName}
                  onChange={(e) => setLeadPassengerName(e.target.value)}
                  success={isNameValid}
                  required
                />
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500 font-sans">
                  <Info className="w-3.5 h-3.5 text-[#7c3aed] shrink-0" />
                  <span>Required for station manifest clearance and aerobridge sign board greeting.</span>
                </div>
              </div>

              {/* HEADCOUNT CONTROLS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60">
                {/* ADULTS */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm">
                  <div>
                    <div className="text-xs font-serif text-slate-900 font-medium">Adults (12+ yrs)</div>
                    <div className="text-[10px] font-mono text-slate-500">Primary guests</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPaxAdults(Math.max(1, paxAdults - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition-all"
                    >
                      -
                    </button>
                    <span className="text-sm font-mono font-bold text-[#7c3aed] px-2">{paxAdults}</span>
                    <button
                      type="button"
                      onClick={() => setPaxAdults(paxAdults + 1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* CHILDREN */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm">
                  <div>
                    <div className="text-xs font-serif text-slate-900 font-medium">Children (2–11)</div>
                    <div className="text-[10px] font-mono text-slate-500">Young travelers</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPaxChildren && setPaxChildren(Math.max(0, paxChildren - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition-all"
                    >
                      -
                    </button>
                    <span className="text-sm font-mono font-bold text-[#7c3aed] px-2">{paxChildren}</span>
                    <button
                      type="button"
                      onClick={() => setPaxChildren && setPaxChildren(paxChildren + 1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* INFANTS */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm">
                  <div>
                    <div className="text-xs font-serif text-slate-900 font-medium">Infants (Under 2)</div>
                    <div className="text-[10px] font-mono text-slate-500">Lap infants</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPaxInfants && setPaxInfants(Math.max(0, paxInfants - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition-all"
                    >
                      -
                    </button>
                    <span className="text-sm font-mono font-bold text-[#7c3aed] px-2">{paxInfants}</span>
                    <button
                      type="button"
                      onClick={() => setPaxInfants && setPaxInfants(paxInfants + 1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* PASSPORT DETAILS (Conditional toggle or automatic for intl) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#7c3aed]" />
                    <span className="text-xs font-mono text-slate-700 uppercase tracking-widest font-bold">
                      Passport Information
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassport(!showPassport)}
                    className="text-[11px] font-mono text-[#7c3aed] font-bold hover:underline"
                  >
                    {showPassport ? "Hide Passport Fields" : "+ Add Passport Details (Required for International)"}
                  </button>
                </div>

                <AnimatePresence>
                  {showPassport && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden"
                    >
                      <div>
                        <FloatingInput
                          id="passport_no"
                          label="Passport Number"
                          value={passportNumber}
                          onChange={(e) => setPassportNumber && setPassportNumber(e.target.value.toUpperCase())}
                          placeholder="Z1234567"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">
                          Passport Nationality
                        </label>
                        <input
                          type="text"
                          value={passportNationality}
                          onChange={(e) => setPassportNationality && setPassportNationality(e.target.value)}
                          placeholder="e.g. Indian, Emirati, British..."
                          className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#7c3aed] font-sans"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
       * SECTION 2: CONTACT DETAILS
       * ═══════════════════════════════════════════════════════════════════════ */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md transition-all duration-300">
        <div
          onClick={() => setOpenSection(openSection === "contact" ? "requests" : "contact")}
          className="flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center text-[#7c3aed]">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7c3aed] font-bold">
                Section 2 of 3
              </div>
              <h3 className="text-xl font-serif text-slate-900 font-medium group-hover:text-[#7c3aed] transition-colors">
                Contact Information & Dispatch Desk
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEmailValid && isPhoneValid ? (
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Validated
              </span>
            ) : (
              <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-bold">
                Required
              </span>
            )}
            {openSection === "contact" ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {openSection === "contact" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 pt-6 border-t border-slate-100 space-y-6 overflow-hidden"
            >
              {/* EMAIL ADDRESS WITH ANIMATED VALIDATION */}
              <div>
                <FloatingInput
                  id="passenger_email"
                  label="Primary Email Address *"
                  type="email"
                  value={passengerEmail}
                  onChange={(e) => setPassengerEmail(e.target.value)}
                  success={isEmailValid}
                  error={passengerEmail && !isEmailValid ? "Please enter a valid email address" : undefined}
                  required
                />
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500 font-sans">
                  <Mail className="w-3.5 h-3.5 text-[#7c3aed] shrink-0" />
                  <span>Airside pass QR voucher and digital receipt will be sent to this email.</span>
                </div>
              </div>

              {/* COUNTRY CODE SELECTOR & PHONE / WHATSAPP NUMBER */}
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">
                  Phone / WhatsApp Dispatch Number *
                </label>
                <div className="flex gap-2">
                  {/* COUNTRY CODE SELECTOR */}
                  <div className="relative shrink-0">
                    <select
                      value={internalCountryCode}
                      onChange={(e) => {
                        setInternalCountryCode(e.target.value);
                        if (setCountryCode) setCountryCode(e.target.value);
                      }}
                      className="h-full px-3 py-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#7c3aed] font-mono appearance-none pr-8 cursor-pointer shadow-xs"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code} className="bg-white text-slate-900">
                          {c.flag} {c.code} ({c.name})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* PHONE INPUT */}
                  <div className="flex-1">
                    <input
                      type="tel"
                      value={passengerPhone}
                      onChange={(e) => setPassengerPhone(e.target.value)}
                      placeholder="9599087959"
                      className={`w-full px-4 py-3.5 rounded-2xl bg-white border text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-mono ${
                        isPhoneValid ? "border-emerald-500" : "border-slate-200 focus:border-[#7c3aed]"
                      }`}
                    />
                  </div>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500 font-sans">
                  <Info className="w-3.5 h-3.5 text-[#7c3aed] shrink-0" />
                  <span>Our airside officer will send real-time WhatsApp updates 30 mins prior to arrival.</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
       * SECTION 3: SPECIAL REQUESTS & ASSISTANCE
       * ═══════════════════════════════════════════════════════════════════════ */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md transition-all duration-300">
        <div
          onClick={() => setOpenSection(openSection === "requests" ? "passengers" : "requests")}
          className="flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center text-[#7c3aed]">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7c3aed] font-bold">
                Section 3 of 3
              </div>
              <h3 className="text-xl font-serif text-slate-900 font-medium group-hover:text-[#7c3aed] transition-colors">
                Special Protocols & Assist Requests
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#7c3aed] bg-[#7c3aed]/10 border border-[#7c3aed]/20 px-2.5 py-1 rounded-full font-bold">
              {internalAssistance.length} Selected
            </span>
            {openSection === "requests" ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {openSection === "requests" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 pt-6 border-t border-slate-100 space-y-6 overflow-hidden"
            >
              {/* SPECIAL ASSISTANCE SELECTION CARDS */}
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3 font-bold">
                  Select Airside Assist Requirements:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SPECIAL_ASSISTANCE_OPTIONS.map((opt) => {
                    const isSelected = internalAssistance.includes(opt.id);
                    const Icon = opt.icon;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleAssistanceToggle(opt.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-3 ${
                          isSelected
                            ? "bg-[#7c3aed]/10 border-[#7c3aed] shadow-md shadow-[#7c3aed]/5"
                            : "bg-slate-50/60 border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/60"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? "bg-[#7c3aed] text-white" : "bg-white text-[#7c3aed] border border-slate-200"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-serif text-slate-900 font-medium">{opt.title}</span>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isSelected ? "bg-[#7c3aed] border-[#7c3aed] text-white" : "border-slate-300"
                            }`}>
                              {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 font-sans mt-0.5 leading-relaxed">{opt.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ADDITIONAL NOTES / TEXTAREA */}
              <div>
                <FloatingTextArea
                  id="special_requests_notes"
                  label="Dietary Preferences, Security Protocols, or Custom Instructions"
                  rows={4}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Specify dietary preferences, wheelchair needs, diplomatic security protocols, or custom instructions..."
                />
              </div>

              {/* INFO CALLOUT */}
              <div className="p-4 rounded-2xl bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#7c3aed] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-800 font-sans leading-relaxed">
                  <span className="font-bold text-[#7c3aed]">Shafsky Concierge Assurance:</span> All special requests and diplomatic protocols are logged directly into our command desk manifest 4 hours before flight departure.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
