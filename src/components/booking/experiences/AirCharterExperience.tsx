import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Plane,
  Calendar,
  Clock,
  Users,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  PhoneCall,
  MessageSquare,
  Building2,
  HeartPulse,
  Send,
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
import { charterApi, CharterRequestPayload } from "@/lib/api/charterApi";

export type AirCharterSubService =
  | "Domestic and International Charter"
  | "Corporate Charter"
  | "Private Charter"
  | "Helicopter Charter"
  | "Tourism Charter"
  | "Pilgrim Charter"
  | "Celebrities Charter"
  | "Adventure Sport Charter"
  | "Wedding Charter"
  | "Air Ambulance Charter";

const CHARTER_SUB_SERVICES: { id: AirCharterSubService; label: string; desc: string }[] = [
  {
    id: "Domestic and International Charter",
    label: "Domestic & International",
    desc: "Long-range private heavy jets and executive airliners for cross-border and regional routes.",
  },
  {
    id: "Corporate Charter",
    label: "Corporate Charter",
    desc: "Bespoke executive aircraft itineraries for business leadership teams and roadshows.",
  },
  {
    id: "Private Charter",
    label: "Private Charter",
    desc: "Exclusive point-to-point flights on light, midsize, and heavy luxury business jets.",
  },
  {
    id: "Helicopter Charter",
    label: "Helicopter Charter",
    desc: "Twin-turbine helicopters for city transfers, rooftop helipads, and remote destinations.",
  },
  {
    id: "Tourism Charter",
    label: "Tourism Charter",
    desc: "Scenic leisure flights, island hopping, and private family safari air itineraries.",
  },
  {
    id: "Pilgrim Charter",
    label: "Pilgrim Charter",
    desc: "Dedicated charters to holy shrines, Chardham, Kedarnath, and special pilgrimage sectors.",
  },
  {
    id: "Celebrities Charter",
    label: "Celebrities Charter",
    desc: "High-privacy discreet charters with tarmac limousine boarding and confidential manifests.",
  },
  {
    id: "Adventure Sport Charter",
    label: "Adventure Sport Charter",
    desc: "Air transport for sports teams, specialized gear, and mountain/remote sports locations.",
  },
  {
    id: "Wedding Charter",
    label: "Wedding Charter",
    desc: "Group charter flights for destination weddings, guest entourages, and VIP family transfers.",
  },
  {
    id: "Air Ambulance Charter",
    label: "Air Ambulance Charter",
    desc: "Dedicated ICU-equipped aircraft with specialized aero-medical doctor and bedside transfer.",
  },
];

const AIRCRAFT_PREFERENCES = [
  "No Preference (Best Matching Aircraft)",
  "Light Executive Jet (4 - 6 Seats)",
  "Super Midsize Jet (7 - 9 Seats)",
  "Heavy Long-Range Jet (10 - 16 Seats)",
  "Twin-Engine Helicopter (4 - 6 Seats)",
  "Air Ambulance ICU Aircraft (Patient + Medical Team)",
  "VIP Turboprop Aircraft (6 - 9 Seats)",
];

interface AirCharterExperienceProps {
  initialSubService?: string;
}

export function AirCharterExperience({ initialSubService }: AirCharterExperienceProps) {
  const defaultSub: AirCharterSubService = (
    CHARTER_SUB_SERVICES.find((s) => s.id.toLowerCase() === (initialSubService || "").toLowerCase())?.id ||
    "Private Charter"
  );

  const [subService, setSubService] = useState<AirCharterSubService>(defaultSub);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Routing & Dates
  const [tripType, setTripType] = useState<"One Way" | "Round Trip" | "Multi-City">("One Way");
  const [origin, setOrigin] = useState("Delhi (DEL)");
  const [destination, setDestination] = useState("Mumbai (BOM)");
  const [departDate, setDepartDate] = useState("");
  const [departTime, setDepartTime] = useState("10:00");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("18:00");

  // Step 2: Passenger & Aircraft Specs
  const [paxCount, setPaxCount] = useState(4);
  const [aircraftPref, setAircraftPref] = useState("No Preference (Best Matching Aircraft)");
  const [specialRequirements, setSpecialRequirements] = useState("");

  // Step 3: Contact & Company Info
  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Success Modal
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    if (initialSubService) {
      const match = CHARTER_SUB_SERVICES.find(
        (s) => s.id.toLowerCase() === initialSubService.toLowerCase()
      );
      if (match) setSubService(match.id);
    }
  }, [initialSubService]);

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      alert("Please enter both origin and destination.");
      return;
    }
    if (!departDate) {
      alert("Please select your departure date.");
      return;
    }
    if (tripType === "Round Trip" && !returnDate) {
      alert("Please select your return date.");
      return;
    }
    setStep(2);
  };

  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      alert("Please provide your name and contact phone number.");
      return;
    }

    setIsSubmitting(true);

    const generatedRef = `SC-${Math.floor(100000 + Math.random() * 900000)}`;

    const payload: CharterRequestPayload = {
      customer_name: customerName,
      country_code: "+91",
      phone: phone,
      email: email || `${phone.replace(/\D/g, "")}@shafsky.quote`,
      company: companyName || undefined,
      preferred_contact_method: "WHATSAPP",
      trip_type: tripType === "Round Trip" ? "ROUND_TRIP" : tripType === "Multi-City" ? "MULTI_CITY" : "ONE_WAY",
      origin: origin,
      destination: destination,
      departure_date: departDate,
      departure_time: departTime,
      return_date: tripType === "Round Trip" ? returnDate : undefined,
      return_time: tripType === "Round Trip" ? returnTime : undefined,
      itinerary: [
        {
          origin: origin,
          destination: destination,
          departure_date: departDate,
          departure_time: departTime,
        },
      ],
      passengers: {
        adults: paxCount,
        children: 0,
        infants: 0,
        total: paxCount,
      },
      aircraft_preference: `${subService} — ${aircraftPref}`,
      travel_requirements: [subService],
      special_requests: specialRequirements || undefined,
    };

    try {
      await charterApi.submitRequest(payload);
    } catch (err) {
      console.warn("Backend submit fallback:", err);
    } finally {
      setIsSubmitting(false);
      setSubmittedRef(generatedRef);
    }
  };

  const getWhatsAppLink = () => {
    const summary = `Service: Air Charter Quotation%0ACharter Type: ${subService}%0AJourney: ${tripType} (${origin} -> ${destination})%0ADeparture: ${departDate} at ${departTime}${tripType === "Round Trip" ? `%0AReturn: ${returnDate} at ${returnTime}` : ""}%0APassengers: ${paxCount} Pax%0AAircraft Preference: ${aircraftPref}%0A%0AClient: ${customerName}%0ACompany: ${companyName || "Private"}%0APhone: ${phone}%0AEmail: ${email || "N/A"}%0ARequests: ${specialRequirements || "None"}`;
    return `https://wa.me/919599087959?text=Hello%20Shafsky%20Charter%20Desk,%20I%20would%20like%20a%20quotation%20for%20private%20charter:%0A%0A${summary}`;
  };

  return (
    <div className="w-full">
      {/* Introduction Header & Authentic Photography */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10 pb-8 border-b border-slate-200">
        {/* Left Intro Text */}
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fcf8ed] border border-[#d4af37]/40 text-[#b38a2e] text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Crown size={13} className="text-[#d4af37]" />
            <span>Private Jet & Helicopter Quotation Desk</span>
          </div>

          <h1
            className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold text-slate-950 tracking-tight leading-tight"
            style={display}
          >
            Air <span className="text-[#b38a2e]">Charter.</span>
          </h1>

          <p className="mt-3 text-sm text-slate-600 max-w-xl leading-relaxed">
            On-demand executive private jets, twin helicopters, and medical evacuation aircraft on your schedule. Receive a customized quotation directly from our flight command desk.
          </p>

          {/* Sub-Service Tabs INSIDE Air Charter Parent Experience */}
          <div className="mt-6">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Choose Charter Mission:
            </div>
            <div className="flex flex-wrap gap-2">
              {CHARTER_SUB_SERVICES.map((sub) => {
                const isActive = subService === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setSubService(sub.id);
                      setStep(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs ${
                      isActive
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
            src={HOMEPAGE_PHOTOS.privateCharter.src}
            alt="Shafsky Private Jet and Helicopter Air Charter"
            badge="VIP Aviation"
            caption="Executive fleet ready for 2-hour dispatch"
            aspectRatio="16 / 10"
          />
        </div>
      </div>

      {/* Progress Step Indicator */}
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-8 px-2">
        {[
          { num: 1, label: "Flight Route & Dates" },
          { num: 2, label: "Aircraft & Passengers" },
          { num: 3, label: "Contact & Quote Request" },
        ].map((s) => {
          const isDone = step > s.num;
          const isCurrent = step === s.num;
          return (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-colors ${
                  isDone
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                    ? "bg-slate-950 text-white border-2 border-[#d4af37]"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                {isDone ? <CheckCircle2 size={15} /> : s.num}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  isCurrent ? "font-bold text-slate-900" : "text-slate-500"
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
        {/* STEP 1: Flight Route & Dates */}
        {step === 1 && (
          <form onSubmit={handleNextFromStep1} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#b38a2e] font-bold">
                Step 1 of 3
              </div>
              <h2 className="text-xl font-bold text-slate-950 mt-1" style={display}>
                Flight Itinerary & Schedule
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Charter Mission: <strong className="text-slate-800">{subService}</strong>
              </p>
            </div>

            {/* Trip Type Selector */}
            <div>
              <FieldLabel required>Flight Journey Type</FieldLabel>
              <div className="grid grid-cols-3 gap-2.5">
                {(["One Way", "Round Trip", "Multi-City"] as const).map((t) => {
                  const isSel = tripType === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTripType(t)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSel
                          ? "bg-slate-950 text-white border-[#d4af37]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Origin & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Flying From (Origin)</FieldLabel>
                <input
                  type="text"
                  placeholder="e.g. Delhi (DEL) / London (LHR)"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className={INPUT_CLASSES}
                  required
                />
              </div>
              <div>
                <FieldLabel required>Flying To (Destination)</FieldLabel>
                <input
                  type="text"
                  placeholder="e.g. Mumbai (BOM) / Dubai (DXB)"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className={INPUT_CLASSES}
                  required
                />
              </div>
            </div>

            {/* Departure Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Departure Date</FieldLabel>
                <input
                  type="date"
                  value={departDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className={INPUT_CLASSES}
                  required
                />
              </div>
              <div>
                <FieldLabel required>Preferred Departure Time</FieldLabel>
                <input
                  type="time"
                  value={departTime}
                  onChange={(e) => setDepartTime(e.target.value)}
                  className={INPUT_CLASSES}
                  required
                />
              </div>
            </div>

            {/* Return Date & Time if Round Trip */}
            {tripType === "Round Trip" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <FieldLabel required>Return Date</FieldLabel>
                  <input
                    type="date"
                    value={returnDate}
                    min={departDate || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className={INPUT_CLASSES}
                    required
                  />
                </div>
                <div>
                  <FieldLabel required>Return Departure Time</FieldLabel>
                  <input
                    type="time"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className={INPUT_CLASSES}
                    required
                  />
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-md transition font-mono cursor-pointer"
              >
                <span>Continue to Aircraft Details</span>
                <ArrowRight size={14} className="text-[#d4af37]" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Passengers & Aircraft Specs */}
        {step === 2 && (
          <form onSubmit={handleNextFromStep2} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#b38a2e] font-bold">
                Step 2 of 3
              </div>
              <h2 className="text-xl font-bold text-slate-950 mt-1" style={display}>
                Passengers & Aircraft Preferences
              </h2>
            </div>

            {/* Passenger Count */}
            <div>
              <CounterField
                label="Number of Flying Passengers"
                sublabel="Total guests traveling on the aircraft"
                value={paxCount}
                onChange={setPaxCount}
                min={1}
                max={50}
              />
            </div>

            {/* Aircraft Category Preference */}
            <div>
              <FieldLabel optional>Aircraft Preference</FieldLabel>
              <select
                value={aircraftPref}
                onChange={(e) => setAircraftPref(e.target.value)}
                className={SELECT_CLASSES}
              >
                {AIRCRAFT_PREFERENCES.map((pref) => (
                  <option key={pref} value={pref}>
                    {pref}
                  </option>
                ))}
              </select>
            </div>

            {/* Inflight Preferences & Special Requests */}
            <div>
              <FieldLabel optional>Special Requests / Inflight Preferences</FieldLabel>
              <textarea
                placeholder="e.g. Michelin-grade gourmet catering, VIP tarmac limousine transfer, medical ICU doctor on board, strict non-disclosure protocol..."
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                className={TEXTAREA_CLASSES}
              />
            </div>

            {/* Navigation Buttons */}
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
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-md transition font-mono cursor-pointer"
              >
                <span>Continue to Quote Request</span>
                <ArrowRight size={14} className="text-[#d4af37]" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Contact & Request Quote (NOT Instant Checkout) */}
        {step === 3 && (
          <form onSubmit={handleSubmitQuote} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#b38a2e] font-bold">
                Step 3 of 3
              </div>
              <h2 className="text-xl font-bold text-slate-950 mt-1" style={display}>
                Lead Contact for Charter Quotation
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your request is dispatched directly to our flight command officers. You will receive an all-inclusive bespoke charter quote within 30 minutes.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <FieldLabel required>Lead Passenger / Organizer Name</FieldLabel>
                <input
                  type="text"
                  placeholder="e.g. Vikramaditya Singhania"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={INPUT_CLASSES}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Contact Phone / WhatsApp</FieldLabel>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={INPUT_CLASSES}
                    required
                  />
                </div>
                <div>
                  <FieldLabel optional>Email Address</FieldLabel>
                  <input
                    type="email"
                    placeholder="e.g. v.singhania@corp.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={INPUT_CLASSES}
                  />
                </div>
              </div>

              <div>
                <FieldLabel optional>Company / Organization</FieldLabel>
                <input
                  type="text"
                  placeholder="e.g. Singhania Global Enterprises / Private Family Office"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={INPUT_CLASSES}
                />
              </div>
            </div>

            {/* Quotation Review Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 mb-2 font-mono uppercase tracking-wider text-[11px]">
                Charter Request Summary:
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Mission:</span>
                <span className="font-semibold text-slate-900">{subService}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Route:</span>
                <span className="font-semibold text-slate-900">{origin} → {destination}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Schedule:</span>
                <span className="font-semibold text-slate-900">
                  {departDate} at {departTime} {tripType === "Round Trip" ? `(Return: ${returnDate})` : ""}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Passengers & Aircraft:</span>
                <span className="font-semibold text-slate-900">{paxCount} Pax • {aircraftPref}</span>
              </div>
            </div>

            {/* Navigation & Final Action: REQUEST A QUOTE (Not Instant Payment) */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-600 hover:text-slate-900 transition"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all font-mono cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Dispatching Request...</span>
                ) : (
                  <>
                    <Send size={15} className="text-[#d4af37]" />
                    <span>Request a Quote</span>
                  </>
                )}
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
        serviceTitle="Air Charter Request"
        subServiceTitle={subService}
        customerName={customerName}
        customerPhone={phone}
        whatsAppUrl={getWhatsAppLink()}
        isQuoteRequest={true}
        summaryItems={[
          { label: "Mission Type", value: subService },
          { label: "Route", value: `${origin} → ${destination}` },
          { label: "Departure", value: `${departDate} at ${departTime}` },
          { label: "Passengers", value: `${paxCount} Guests` },
          { label: "Aircraft", value: aircraftPref },
        ]}
      />
    </div>
  );
}
