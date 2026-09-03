import React, { useState, useEffect } from "react";
import {
  Shield,
  Calendar,
  Users,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  Globe,
  FileCheck,
  Compass,
  Baby,
  Package,
} from "lucide-react";
import { display, mono } from "@/components/home/theme";
import { HOMEPAGE_PHOTOS } from "@/lib/homepage-photos";
import { ExperiencePhoto } from "../shared/ExperiencePhoto";
import {
  INPUT_CLASSES,
  SELECT_CLASSES,
  TEXTAREA_CLASSES,
  FieldLabel,
  CounterField,
} from "../shared/SharedUi";
import { BookingSuccessModal } from "../shared/BookingSuccessModal";

export type SpecialSubService =
  | "Tours & Travel"
  | "Passport & VISA"
  | "PSO (Personal Security Officer)"
  | "Sightseeing & Guide"
  | "Infant Care"
  | "Human Remains by Cargo";

const SPECIAL_SUB_SERVICES: {
  id: SpecialSubService;
  label: string;
  desc: string;
  icon: any;
}[] = [
    {
      id: "Tours & Travel",
      label: "Tours & Travel",
      desc: "Curated luxury vacations, bespoke family holiday itineraries, and VIP travel circuits.",
      icon: Globe,
    },
    {
      id: "Passport & VISA",
      label: "Passport & VISA",
      desc: "Expedited diplomatic visa facilitation, passport renewal support & embassy clearance.",
      icon: FileCheck,
    },
    {
      id: "PSO (Personal Security Officer)",
      label: "PSO (Personal Security)",
      desc: "Armed and unarmed close protection security officers for executives, celebrities & VIPs.",
      icon: Shield,
    },
    {
      id: "Sightseeing & Guide",
      label: "Sightseeing & Guide",
      desc: "Private licensed heritage guides, multi-lingual historical experts & city excursions.",
      icon: Compass,
    },
    {
      id: "Infant Care",
      label: "Infant Care",
      desc: "Dedicated child and mother airport assistance, stroller handling & priority transit care.",
      icon: Baby,
    },
    {
      id: "Human Remains by Cargo",
      label: "Human Remains by Cargo",
      desc: "Dignified, discreet repatriation logistics, embassy documentation & airport cargo clearance.",
      icon: Package,
    },
  ];

interface SpecialServicesExperienceProps {
  initialSubService?: string;
}

export function SpecialServicesExperience({ initialSubService }: SpecialServicesExperienceProps) {
  const defaultSub: SpecialSubService = (
    SPECIAL_SUB_SERVICES.find((s) => s.id.toLowerCase() === (initialSubService || "").toLowerCase())?.id ||
    "Tours & Travel"
  );

  const [subService, setSubService] = useState<SpecialSubService>(defaultSub);
  const [step, setStep] = useState<1 | 2>(1);

  // Tours & Travel fields
  const [tourDest, setTourDest] = useState("Rajasthan Royal Palace Circuit");
  const [tourStartDate, setTourStartDate] = useState("");
  const [tourEndDate, setTourEndDate] = useState("");
  const [tourTravellers, setTourTravellers] = useState(2);

  // Passport & VISA fields
  const [visaCountry, setVisaCountry] = useState("United Arab Emirates (UAE)");
  const [visaType, setVisaType] = useState("Tourist / Business Expedited");
  const [visaApplicants, setVisaApplicants] = useState(1);
  const [visaUrgent, setVisaUrgent] = useState(false);

  // PSO Security fields
  const [psoType, setPsoType] = useState("Armed Close Protection Officer");
  const [psoLocation, setPsoLocation] = useState("Delhi NCR & Inter-State Movement");
  const [psoStartDate, setPsoStartDate] = useState("");
  const [psoDurationDays, setPsoDurationDays] = useState(3);
  const [psoCount, setPsoCount] = useState(1);

  // Sightseeing & Guide fields
  const [guideCity, setGuideCity] = useState("Agra & Taj Mahal Circuit");
  const [guideDate, setGuideDate] = useState("");
  const [guideLanguage, setGuideLanguage] = useState("English");
  const [guideGuests, setGuideGuests] = useState(2);

  // Infant Care fields
  const [infantAge, setInfantAge] = useState("8 Months");
  const [infantDate, setInfantDate] = useState("");
  const [infantAirport, setInfantAirport] = useState("Delhi Airport (DEL)");

  // Human Remains by Cargo fields
  const [cargoOrigin, setCargoOrigin] = useState("New Delhi (DEL)");
  const [cargoDest, setCargoDest] = useState("London (LHR)");
  const [cargoDate, setCargoDate] = useState("");
  const [cargoUrgency, setCargoUrgency] = useState("Immediate Next-Flight Repatriation");

  // Common Contact Info
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  // Success Modal
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    if (initialSubService) {
      const match = SPECIAL_SUB_SERVICES.find(
        (s) => s.id.toLowerCase() === initialSubService.toLowerCase()
      );
      if (match) setSubService(match.id);
    }
  }, [initialSubService]);

  const activeSubObj = SPECIAL_SUB_SERVICES.find((s) => s.id === subService) || SPECIAL_SUB_SERVICES[0];

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmitFinal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) {
      alert("Please provide your name and contact phone number.");
      return;
    }
    const ref = `SS-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedRef(ref);
  };

  const getWhatsAppLink = () => {
    let serviceDetails = "";
    if (subService === "Tours & Travel") {
      serviceDetails = `Destination: ${tourDest}%0ADates: ${tourStartDate} to ${tourEndDate}%0ATravellers: ${tourTravellers}`;
    } else if (subService === "Passport & VISA") {
      serviceDetails = `Country: ${visaCountry}%0AType: ${visaType}%0AApplicants: ${visaApplicants}%0AUrgent: ${visaUrgent ? "YES" : "Standard"}`;
    } else if (subService === "PSO (Personal Security Officer)") {
      serviceDetails = `Security Type: ${psoType}%0ALocation: ${psoLocation}%0AStart Date: ${psoStartDate}%0ADuration: ${psoDurationDays} Days%0APSOs Required: ${psoCount}`;
    } else if (subService === "Sightseeing & Guide") {
      serviceDetails = `Location: ${guideCity}%0ADate: ${guideDate}%0ALanguage: ${guideLanguage}%0AGuests: ${guideGuests}`;
    } else if (subService === "Infant Care") {
      serviceDetails = `Child Age: ${infantAge}%0ATravel Date: ${infantDate}%0AAirport: ${infantAirport}`;
    } else if (subService === "Human Remains by Cargo") {
      serviceDetails = `Origin: ${cargoOrigin}%0ADestination: ${cargoDest}%0ATimeline: ${cargoDate}%0AUrgency: ${cargoUrgency}`;
    }

    const summary = `Service: Special Services%0ASub-Service: ${subService}%0A${serviceDetails}%0A%0AContact: ${guestName}%0APhone: ${guestPhone}%0AEmail: ${guestEmail || "N/A"}%0ANotes: ${specialNotes || "None"}`;
    return `https://wa.me/919599087959?text=Hello%20Shafsky%20Special%20Services%20Desk,%20I%20would%20like%20to%20request%20assistance:%0A%0A${summary}`;
  };

  return (
    <div className="w-full">
      {/* Introduction Header & Authentic Photography */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10 pb-8 border-b border-slate-200">
        {/* Left Intro Text */}
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fcf8ed] border border-[#d4af37]/40 text-[#b38a2e] text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Shield size={13} className="text-[#d4af37]" />
            <span>Specialized Mission Logistics & VIP Care</span>
          </div>

          <h1
            className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold text-slate-950 tracking-tight leading-tight"
            style={display}
          >
            Special <span className="text-[#b38a2e]">Services.</span>
          </h1>

          <p className="mt-3 text-sm text-slate-600 max-w-xl leading-relaxed">
            Tailored travel solutions including armed PSO security, visa facilitation, bespoke tours, infant care, and dignified repatriation cargo handling.
          </p>

          {/* Sub-Service Option Tabs INSIDE Special Services Experience */}
          <div className="mt-6">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Choose Specialized Service:
            </div>
            <div className="flex flex-wrap gap-2">
              {SPECIAL_SUB_SERVICES.map((sub) => {
                const isActive = subService === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setSubService(sub.id);
                      setStep(1);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs ${isActive
                        ? "bg-slate-950 text-white border-2 border-[#d4af37]"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30"
                      }`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Authentic Photography - Zero Cropping / Zero Text Over Photo */}
        <div className="lg:col-span-5">
          <ExperiencePhoto
            src={HOMEPAGE_PHOTOS.destinationCelebration.src}
            alt="Specialized Tours, Armed PSO, Medical and Destination Services"
            badge="Bespoke Concierge"
            caption="Customized itineraries and mission logistics"
            aspectRatio="16 / 10"
          />
        </div>
      </div>

      {/* Progress Step Indicator */}
      <div className="flex items-center justify-between max-w-xl mx-auto mb-8 px-2">
        {[
          { num: 1, label: "Service Details" },
          { num: 2, label: "Contact & Submission" },
        ].map((s) => {
          const isDone = step > s.num;
          const isCurrent = step === s.num;
          return (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-colors ${isDone
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                      ? "bg-slate-950 text-white border-2 border-[#d4af37]"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
              >
                {isDone ? <CheckCircle2 size={15} /> : s.num}
              </div>
              <span
                className={`text-xs font-medium ${isCurrent ? "font-bold text-slate-900" : "text-slate-500"
                  }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Form Container */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 md:p-10 shadow-sm">
        {/* STEP 1: Dynamically Render ONLY the fields needed for the selected sub-service */}
        {step === 1 && (
          <form onSubmit={handleNextFromStep1} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#b38a2e] font-bold">
                Step 1 of 2
              </div>
              <h2 className="text-xl font-bold text-slate-950 mt-1" style={display}>
                {subService} Specifications
              </h2>
              <p className="text-xs text-slate-500 mt-1">{activeSubObj.desc}</p>
            </div>

            {/* 1. TOURS & TRAVEL SPECIFIC FIELDS */}
            {subService === "Tours & Travel" && (
              <div className="space-y-4">
                <div>
                  <FieldLabel required>Tour Destination / Itinerary Idea</FieldLabel>
                  <input
                    type="text"
                    placeholder="e.g. Golden Triangle (Delhi, Agra, Jaipur) / Kashmir Valley / Kerala Backwaters"
                    value={tourDest}
                    onChange={(e) => setTourDest(e.target.value)}
                    className={INPUT_CLASSES}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Approximate Start Date</FieldLabel>
                    <input
                      type="date"
                      value={tourStartDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setTourStartDate(e.target.value)}
                      className={INPUT_CLASSES}
                      required
                    />
                  </div>
                  <div>
                    <FieldLabel optional>Approximate End Date</FieldLabel>
                    <input
                      type="date"
                      value={tourEndDate}
                      min={tourStartDate || new Date().toISOString().split("T")[0]}
                      onChange={(e) => setTourEndDate(e.target.value)}
                      className={INPUT_CLASSES}
                    />
                  </div>
                </div>
                <CounterField
                  label="Number of Travellers"
                  sublabel="Adults and children"
                  value={tourTravellers}
                  onChange={setTourTravellers}
                  min={1}
                />
              </div>
            )}

            {/* 2. PASSPORT & VISA SPECIFIC FIELDS */}
            {subService === "Passport & VISA" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Destination Country</FieldLabel>
                    <input
                      type="text"
                      placeholder="e.g. United Kingdom, USA, UAE, Schengen Zone, Saudi Arabia"
                      value={visaCountry}
                      onChange={(e) => setVisaCountry(e.target.value)}
                      className={INPUT_CLASSES}
                      required
                    />
                  </div>
                  <div>
                    <FieldLabel required>Visa Category</FieldLabel>
                    <select
                      value={visaType}
                      onChange={(e) => setVisaType(e.target.value)}
                      className={SELECT_CLASSES}
                    >
                      <option value="Tourist Visa">Tourist Visa (Express Processing)</option>
                      <option value="Business / Executive Visa">Business / Executive Visa</option>
                      <option value="Diplomatic / Official Visa">Diplomatic / Official Visa</option>
                      <option value="Emergency Transit Visa">Emergency Transit Visa</option>
                      <option value="Passport Renewal Assistance">Passport Renewal Assistance</option>
                    </select>
                  </div>
                </div>
                <CounterField
                  label="Number of Applicants"
                  sublabel="Passports requiring processing"
                  value={visaApplicants}
                  onChange={setVisaApplicants}
                  min={1}
                />
                <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-amber-50/30">
                  <input
                    type="checkbox"
                    id="urgentVisa"
                    checked={visaUrgent}
                    onChange={(e) => setVisaUrgent(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="urgentVisa" className="text-xs font-semibold text-slate-800 cursor-pointer">
                    Urgent / Express Diplomatic Dispatch Required (Travel within 72 hours)
                  </label>
                </div>
              </div>
            )}

            {/* 3. PSO (PERSONAL SECURITY OFFICER) SPECIFIC FIELDS */}
            {subService === "PSO (Personal Security Officer)" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Security Level Required</FieldLabel>
                    <select
                      value={psoType}
                      onChange={(e) => setPsoType(e.target.value)}
                      className={SELECT_CLASSES}
                    >
                      <option value="Armed Close Protection Officer">Armed Close Protection Officer (PSO)</option>
                      <option value="Unarmed Executive Security Escort">Unarmed Executive Security Escort</option>
                      <option value="Armed Motorcade & Convoy Security">Armed Motorcade & Convoy Security</option>
                      <option value="VIP Event Close Protection Team">VIP Event Close Protection Team</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel required>Deployment Location / Route</FieldLabel>
                    <input
                      type="text"
                      placeholder="e.g. Delhi NCR, Mumbai, Inter-State Movement"
                      value={psoLocation}
                      onChange={(e) => setPsoLocation(e.target.value)}
                      className={INPUT_CLASSES}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Protection Start Date</FieldLabel>
                    <input
                      type="date"
                      value={psoStartDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setPsoStartDate(e.target.value)}
                      className={INPUT_CLASSES}
                      required
                    />
                  </div>
                  <CounterField
                    label="Duration (Days)"
                    sublabel="Days of coverage"
                    value={psoDurationDays}
                    onChange={setPsoDurationDays}
                    min={1}
                    max={60}
                  />
                </div>
                <CounterField
                  label="Number of Security Officers (PSOs)"
                  sublabel="Officers assigned to detail"
                  value={psoCount}
                  onChange={setPsoCount}
                  min={1}
                  max={10}
                />
              </div>
            )}

            {/* 4. SIGHTSEEING & GUIDE SPECIFIC FIELDS */}
            {subService === "Sightseeing & Guide" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>City / Historical Site</FieldLabel>
                    <input
                      type="text"
                      placeholder="e.g. Delhi Old City & Red Fort / Taj Mahal Agra / Jaipur Forts"
                      value={guideCity}
                      onChange={(e) => setGuideCity(e.target.value)}
                      className={INPUT_CLASSES}
                      required
                    />
                  </div>
                  <div>
                    <FieldLabel required>Guide Date</FieldLabel>
                    <input
                      type="date"
                      value={guideDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setGuideDate(e.target.value)}
                      className={INPUT_CLASSES}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Preferred Language</FieldLabel>
                    <select
                      value={guideLanguage}
                      onChange={(e) => setGuideLanguage(e.target.value)}
                      className={SELECT_CLASSES}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Spanish">Spanish</option>
                      <option value="Arabic">Arabic</option>
                      <option value="Russian">Russian</option>
                      <option value="Japanese">Japanese</option>
                    </select>
                  </div>
                  <CounterField
                    label="Number of Guests"
                    sublabel="Party size for tour"
                    value={guideGuests}
                    onChange={setGuideGuests}
                    min={1}
                    max={30}
                  />
                </div>
              </div>
            )}

            {/* 5. INFANT CARE SPECIFIC FIELDS */}
            {subService === "Infant Care" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <FieldLabel required>Child Age</FieldLabel>
                    <input
                      type="text"
                      placeholder="e.g. 6 Months / 2 Years"
                      value={infantAge}
                      onChange={(e) => setInfantAge(e.target.value)}
                      className={INPUT_CLASSES}
                      required
                    />
                  </div>
                  <div>
                    <FieldLabel required>Travel Date</FieldLabel>
                    <input
                      type="date"
                      value={infantDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setInfantDate(e.target.value)}
                      className={INPUT_CLASSES}
                      required
                    />
                  </div>
                  <div>
                    <FieldLabel required>Airport</FieldLabel>
                    <input
                      type="text"
                      placeholder="e.g. Delhi (DEL)"
                      value={infantAirport}
                      onChange={(e) => setInfantAirport(e.target.value)}
                      className={INPUT_CLASSES}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 6. HUMAN REMAINS BY CARGO SPECIFIC FIELDS */}
            {subService === "Human Remains by Cargo" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Departure Origin (Airport/City)</FieldLabel>
                    <input
                      type="text"
                      placeholder="e.g. New Delhi (DEL) / Dubai (DXB)"
                      value={cargoOrigin}
                      onChange={(e) => setCargoOrigin(e.target.value)}
                      className={INPUT_CLASSES}
                      required
                    />
                  </div>
                  <div>
                    <FieldLabel required>Final Destination (Airport/City)</FieldLabel>
                    <input
                      type="text"
                      placeholder="e.g. London (LHR) / Toronto (YYZ)"
                      value={cargoDest}
                      onChange={(e) => setCargoDest(e.target.value)}
                      className={INPUT_CLASSES}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Required Repatriation Timeline</FieldLabel>
                    <input
                      type="date"
                      value={cargoDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setCargoDate(e.target.value)}
                      className={INPUT_CLASSES}
                      required
                    />
                  </div>
                  <div>
                    <FieldLabel required>Urgency Protocol</FieldLabel>
                    <select
                      value={cargoUrgency}
                      onChange={(e) => setCargoUrgency(e.target.value)}
                      className={SELECT_CLASSES}
                    >
                      <option value="Immediate Next-Flight Repatriation">Immediate Next-Flight Repatriation</option>
                      <option value="Standard Scheduled Air Cargo">Standard Scheduled Air Cargo</option>
                      <option value="Direct Private Aircraft Repatriation">Direct Private Aircraft Repatriation</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-md transition font-mono cursor-pointer"
              >
                <span>Continue to Contact Details</span>
                <ArrowRight size={14} className="text-[#d4af37]" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Contact & Final Submission */}
        {step === 2 && (
          <form onSubmit={handleSubmitFinal} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#b38a2e] font-bold">
                Step 2 of 2
              </div>
              <h2 className="text-xl font-bold text-slate-950 mt-1" style={display}>
                Primary Contact Information
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <FieldLabel required>Contact Full Name</FieldLabel>
                <input
                  type="text"
                  placeholder="e.g. Major General K. S. Verma / S. Kapoor"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className={INPUT_CLASSES}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Phone / WhatsApp Number</FieldLabel>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className={INPUT_CLASSES}
                    required
                  />
                </div>
                <div>
                  <FieldLabel optional>Email Address</FieldLabel>
                  <input
                    type="email"
                    placeholder="e.g. contact@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className={INPUT_CLASSES}
                  />
                </div>
              </div>

              <div>
                <FieldLabel optional>Additional Mission / Protocol Notes</FieldLabel>
                <textarea
                  placeholder="e.g. Specific security threat level, consular clearance status, or preferred airport meeting point..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className={TEXTAREA_CLASSES}
                />
              </div>
            </div>

            {/* Summary Review Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 mb-2 font-mono uppercase tracking-wider text-[11px]">
                Request Summary:
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Specialized Service:</span>
                <span className="font-semibold text-slate-900">{subService}</span>
              </div>
              {subService === "Tours & Travel" && (
                <div className="flex justify-between text-slate-600">
                  <span>Destination:</span>
                  <span className="font-semibold text-slate-900">{tourDest} ({tourTravellers} Travellers)</span>
                </div>
              )}
              {subService === "Passport & VISA" && (
                <div className="flex justify-between text-slate-600">
                  <span>Visa Country & Type:</span>
                  <span className="font-semibold text-slate-900">{visaCountry} • {visaType}</span>
                </div>
              )}
              {subService === "PSO (Personal Security Officer)" && (
                <div className="flex justify-between text-slate-600">
                  <span>Protection:</span>
                  <span className="font-semibold text-slate-900">{psoCount} PSO ({psoType}) in {psoLocation}</span>
                </div>
              )}
              {subService === "Sightseeing & Guide" && (
                <div className="flex justify-between text-slate-600">
                  <span>Guide Tour:</span>
                  <span className="font-semibold text-slate-900">{guideCity} ({guideLanguage} Language)</span>
                </div>
              )}
              {subService === "Infant Care" && (
                <div className="flex justify-between text-slate-600">
                  <span>Assistance:</span>
                  <span className="font-semibold text-slate-900">Child ({infantAge}) at {infantAirport}</span>
                </div>
              )}
              {subService === "Human Remains by Cargo" && (
                <div className="flex justify-between text-slate-600">
                  <span>Repatriation:</span>
                  <span className="font-semibold text-slate-900">{cargoOrigin} → {cargoDest}</span>
                </div>
              )}
            </div>

            {/* Navigation & Submit */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-600 hover:text-slate-900 transition"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all font-mono cursor-pointer"
              >
                <CheckCircle2 size={16} className="text-[#d4af37]" />
                <span>Submit Special Service Request</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Success Modal */}
      <BookingSuccessModal
        isOpen={!!submittedRef}
        onClose={() => {
          setSubmittedRef(null);
          setStep(1);
        }}
        referenceId={submittedRef || ""}
        serviceTitle="Special Services Request"
        subServiceTitle={subService}
        customerName={guestName}
        customerPhone={guestPhone}
        whatsAppUrl={getWhatsAppLink()}
        isQuoteRequest={false}
        summaryItems={[
          { label: "Specialized Service", value: subService },
          { label: "Lead Contact", value: guestName },
          { label: "Phone", value: guestPhone },
        ]}
      />
    </div>
  );
}
