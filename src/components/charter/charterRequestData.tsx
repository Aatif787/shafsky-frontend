import React from "react";
import {
  CheckCircle2,
  MessageCircle,
  Copy,
  Check,
  Shield,
  Utensils,
  Car,
  Dog,
  HeartHandshake,
  Wifi,
  Bed,
  Briefcase,
  Gift,
  Luggage,
  Info,
} from "lucide-react";
import { type CharterLeg } from "@/lib/api/charterApi";

export const AIRCRAFT_OPTIONS = [
  {
    id: "NO_PREFERENCE",
    title: "No Preference — Recommend for Me",
    subtitle: "Our advisors will calculate the optimal aircraft based on runway, payload & range",
    capacity: "Optimized",
    range: "Any",
    highlight: "Advisor Recommended",
  },
  {
    id: "LIGHT_JET",
    title: "Light Jet",
    subtitle: "Citation XLS / Phenom 300 / Premier 1A",
    capacity: "4 – 7 Pax",
    range: "Up to 3.5 hrs",
    highlight: "Regional Trips",
  },
  {
    id: "MIDSIZE_JET",
    title: "Midsize Jet",
    subtitle: "Hawker 850XP / Learjet 60XR / Citation Sovereign",
    capacity: "7 – 9 Pax",
    range: "Up to 5 hrs",
    highlight: "Coast to Coast",
  },
  {
    id: "SUPER_MIDSIZE_JET",
    title: "Super Midsize Jet",
    subtitle: "Challenger 350 / Gulfstream G280 / Citation Latitude",
    capacity: "8 – 10 Pax",
    range: "Up to 6.5 hrs",
    highlight: "Transcontinental",
  },
  {
    id: "HEAVY_JET",
    title: "Heavy Jet",
    subtitle: "Challenger 605 / Falcon 900LX / Legacy 650",
    capacity: "10 – 16 Pax",
    range: "Up to 9 hrs",
    highlight: "Stand-up Cabin",
  },
  {
    id: "ULTRA_LONG_RANGE",
    title: "Ultra Long Range",
    subtitle: "Global 6000 / Gulfstream G650ER / Falcon 8X",
    capacity: "12 – 19 Pax",
    range: "Up to 14 hrs",
    highlight: "Intercontinental",
  },
  {
    id: "VIP_AIRLINER",
    title: "VIP Airliner",
    subtitle: "Airbus ACJ319 / Boeing BBJ / Embraer Lineage 1000",
    capacity: "19 – 50+ Pax",
    range: "Global",
    highlight: "Master Bedroom Suite",
  },
  {
    id: "HELICOPTER",
    title: "Twin-Engine Helicopter",
    subtitle: "AgustaWestland AW109 / Bell 429 / Airbus H145",
    capacity: "4 – 6 Pax",
    range: "Direct Helipad",
    highlight: "Point-to-Point",
  },
];

export const TRAVEL_REQUIREMENTS_LIST = [
  { id: "Catering & Fine Dining", label: "Catering & Fine Dining", icon: Utensils, desc: "Gourmet inflight dining menus & fine refreshments" },
  { id: "Tarmac Maybach / Chauffeur", label: "Tarmac Maybach Transfer", icon: Car, desc: "Direct airside vehicle pickup at aircraft steps" },
  { id: "Pet in Cabin (AVI)", label: "Pet in Cabin (AVI)", icon: Dog, desc: "Fly alongside your pets in total comfort without crates" },
  { id: "Special Assistance / Medical", label: "Special Assistance / Medical", icon: HeartHandshake, desc: "Airside wheelchair, medical escort, or priority escort" },
  { id: "High-Speed Inflight Wi-Fi", label: "High-Speed Satellite Wi-Fi", icon: Wifi, desc: "Stream, work, and video conference seamlessly" },
  { id: "Lie-Flat Sleeping Arrangements", label: "Lie-Flat Sleeping Suite", icon: Bed, desc: "Bedding configured with luxury linens for overnight flights" },
  { id: "Business Meeting Suite", label: "Inflight Meeting Suite", icon: Briefcase, desc: "Conference table setup with presentation displays" },
  { id: "Special Occasion & Celebration", label: "Special Occasion Styling", icon: Gift, desc: "Birthday, anniversary or VIP custom celebration touches" },
  { id: "Oversized Baggage Capacity", label: "Oversized Baggage Support", icon: Luggage, desc: "Golf bags, art pieces, or extensive luggage cargo" },
];

export const TIME_PREFERENCES = [
  "Flexible / Any Time",
  "Morning (06:00 – 12:00)",
  "Afternoon (12:00 – 18:00)",
  "Evening (18:00 – 24:00)",
  "Night / Red-eye (00:00 – 06:00)",
];

export function getTomorrowDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export function getDefaultReturnDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 4);
  return d.toISOString().split("T")[0];
}

export interface CharterStepAircraftProps {
  aircraftPreference: string;
  setAircraftPreference: (id: string) => void;
}

export const CharterStepAircraft: React.FC<CharterStepAircraftProps> = ({
  aircraftPreference,
  setAircraftPreference,
}) => (
  <div className="p-6 md:p-8 space-y-6">
    <div className="space-y-1">
      <h2 className="text-2xl md:text-3xl font-semibold text-[#1A1715]">Aircraft Preference</h2>
      <p className="text-sm text-[#78716C]">
        Select your preferred cabin category or let our advisors recommend the ideal aircraft.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
      {AIRCRAFT_OPTIONS.map((aircraft) => {
        const isSelected = aircraftPreference === aircraft.id;
        return (
          <div
            key={aircraft.id}
            onClick={() => setAircraftPreference(aircraft.id)}
            className={`p-4 rounded-2xl cursor-pointer border transition-all ${
              isSelected
                ? "bg-[#F4FCE3] border-[#84CC16] shadow-md ring-1 ring-[#84CC16]"
                : "bg-white border-[#E5DFD5] hover:bg-[#FAF8F5] hover:border-[#D4CBBF]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-[#1A1715]">{aircraft.title}</span>
              <span
                className={`text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                  isSelected ? "bg-[#84CC16] text-[#0D1F03]" : "bg-[#EFE9DF] text-[#4D7C0F]"
                }`}
              >
                {aircraft.highlight}
              </span>
            </div>
            <p className="text-xs text-[#78716C] mb-2 leading-relaxed">{aircraft.subtitle}</p>
            <div className="flex items-center gap-3 text-[11px] text-[#44403C] font-medium">
              <span>{aircraft.capacity}</span>
              <span>•</span>
              <span>{aircraft.range}</span>
            </div>
          </div>
        );
      })}
    </div>

    <div className="p-3.5 rounded-xl bg-[#F4EFE6] border border-[#E5DFD5] text-xs text-[#57534E] flex items-start gap-2.5">
      <Info className="w-4 h-4 text-[#65A30D] shrink-0 mt-0.5" />
      <span>
        Category selection is an advisory preference. Our operations desk will assess airport runway limits, weather, and verified positioning before presenting flight options.
      </span>
    </div>
  </div>
);

export interface CharterStepRequirementsProps {
  selectedRequirements: string[];
  toggleRequirement: (reqId: string) => void;
  specialRequests: string;
  setSpecialRequests: (val: string) => void;
}

export const CharterStepRequirements: React.FC<CharterStepRequirementsProps> = ({
  selectedRequirements,
  toggleRequirement,
  specialRequests,
  setSpecialRequests,
}) => (
  <div className="p-6 md:p-8 space-y-6">
    <div className="space-y-1">
      <h2 className="text-2xl md:text-3xl font-semibold text-[#1A1715]">Travel Requirements</h2>
      <p className="text-sm text-[#78716C]">
        Customize your flight experience with premium concierge and inflight amenities.
      </p>
    </div>

    {/* Requirement Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {TRAVEL_REQUIREMENTS_LIST.map((item) => {
        const isSelected = selectedRequirements.includes(item.id);
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            onClick={() => toggleRequirement(item.id)}
            className={`p-3.5 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between ${
              isSelected
                ? "bg-[#F4FCE3] border-[#84CC16] shadow-sm ring-1 ring-[#84CC16]"
                : "bg-white border-[#E5DFD5] hover:bg-[#FAF8F5]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-4 h-4 ${isSelected ? "text-[#4D7C0F]" : "text-[#78716C]"}`} />
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  isSelected
                    ? "bg-[#84CC16] border-[#84CC16] text-[#0D1F03]"
                    : "border-[#DCD5C9]"
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-[#1A1715] block">{item.label}</span>
              <span className="text-[10px] text-[#78716C] leading-snug line-clamp-2 mt-0.5">
                {item.desc}
              </span>
            </div>
          </div>
        );
      })}
    </div>

    {/* Special Requests Textarea */}
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#44403C]">
        Special Requests & Itinerary Notes (Optional)
      </label>
      <textarea
        rows={3}
        value={specialRequests}
        onChange={(e) => setSpecialRequests(e.target.value)}
        placeholder="Dietary preferences, VIP requirements, connection timeline, luggage details, or special requests..."
        className="w-full bg-white border border-[#DCD5C9] rounded-xl p-3.5 text-xs text-[#1A1715] placeholder-[#A8A29E] focus:border-[#84CC16] focus:outline-none transition-colors"
      />
    </div>
  </div>
);

export interface CharterStepReviewProps {
  tripType: "ONE_WAY" | "ROUND_TRIP" | "MULTI_CITY";
  legs: CharterLeg[];
  returnDate: string;
  returnTime: string;
  passengers: { adults: number; children: number; infants: number };
  totalPassengers: number;
  aircraftPreference: string;
  selectedRequirements: string[];
  customerName: string;
  countryCode: string;
  phone: string;
  email: string;
  onEditItinerary: () => void;
}

export const CharterStepReview: React.FC<CharterStepReviewProps> = ({
  tripType,
  legs,
  returnDate,
  returnTime,
  passengers,
  totalPassengers,
  aircraftPreference,
  selectedRequirements,
  customerName,
  countryCode,
  phone,
  email,
  onEditItinerary,
}) => (
  <div className="p-6 md:p-8 space-y-6">
    <div className="space-y-1">
      <h2 className="text-2xl md:text-3xl font-semibold text-[#1A1715]">Review Your Charter Request</h2>
      <p className="text-sm text-[#78716C]">
        Please verify your flight details before our operations team prepares your options.
      </p>
    </div>

    <div className="p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm space-y-4">
      {/* Route Summary */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-[#E5DFD5] gap-3">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#4D7C0F] font-bold block mb-1">
            {tripType.replace("_", " ")}
          </span>
          <div className="text-base font-bold text-[#1A1715]">
            {legs[0]?.origin} → {tripType === "ROUND_TRIP" ? legs[0]?.destination : legs[legs.length - 1]?.destination}
          </div>
          <div className="text-xs text-[#78716C] mt-0.5 font-medium">
            Departure: {legs[0]?.departure_date} ({legs[0]?.departure_time})
            {tripType === "ROUND_TRIP" && ` • Return: ${returnDate} (${returnTime})`}
          </div>
        </div>
        <button
          type="button"
          onClick={onEditItinerary}
          className="text-xs font-bold text-[#4D7C0F] hover:underline"
        >
          Edit Itinerary
        </button>
      </div>

      {/* Manifest & Aircraft Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-[#E5DFD5] text-xs">
        <div>
          <span className="text-[#78716C] font-semibold block mb-1">Party Manifest</span>
          <span className="text-[#1A1715] font-bold">
            {passengers.adults} Adults
            {passengers.children > 0 && `, ${passengers.children} Children`}
            {passengers.infants > 0 && `, ${passengers.infants} Infants`} (Total {totalPassengers})
          </span>
        </div>
        <div>
          <span className="text-[#78716C] font-semibold block mb-1">Aircraft Preference</span>
          <span className="text-[#1A1715] font-bold">
            {AIRCRAFT_OPTIONS.find((a) => a.id === aircraftPreference)?.title || "No Preference"}
          </span>
        </div>
      </div>

      {/* Requirements & Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-[#78716C] font-semibold block mb-1">Concierge Amenities</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {selectedRequirements.length > 0 ? (
              selectedRequirements.map((r) => (
                <span
                  key={r}
                  className="px-2.5 py-1 rounded-full bg-[#F4FCE3] text-[#365314] font-medium text-[11px] border border-[#84CC16]/30"
                >
                  {r}
                </span>
              ))
            ) : (
              <span className="text-[#A8A29E]">Standard Private FBO</span>
            )}
          </div>
        </div>
        <div>
          <span className="text-[#78716C] font-semibold block mb-1">Contact Details</span>
          <span className="text-[#1A1715] font-bold block">{customerName}</span>
          <span className="text-[#57534E] block">
            {countryCode} {phone} • {email}
          </span>
        </div>
      </div>
    </div>

    {/* Zero Upfront Reassurance Banner */}
    <div className="p-4 rounded-xl bg-[#ECFCCB] border border-[#84CC16]/40 text-xs text-[#365314] font-medium flex items-center gap-3">
      <Shield className="w-4 h-4 shrink-0 text-[#4D7C0F]" />
      <span>
        100% Free Enquiry. Zero payment or credit card is required. Our advisors will contact you with verified options.
      </span>
    </div>
  </div>
);

export interface CharterStepSuccessProps {
  submissionResult: {
    reference: string;
    customerName: string;
    origin: string;
    destination: string;
  };
  copied: boolean;
  onCopyReference: () => void;
  onOpenWhatsAppSpecialist: () => void;
  onClose?: () => void;
  onReset: () => void;
}

export const CharterStepSuccess: React.FC<CharterStepSuccessProps> = ({
  submissionResult,
  copied,
  onCopyReference,
  onOpenWhatsAppSpecialist,
  onClose,
  onReset,
}) => (
  <div className="p-8 md:p-12 text-center space-y-6">
    <div className="w-16 h-16 rounded-full bg-[#ECFCCB] border border-[#84CC16]/50 text-[#4D7C0F] flex items-center justify-center mx-auto shadow-sm">
      <CheckCircle2 className="w-8 h-8" />
    </div>

    <div className="space-y-2">
      <span className="text-xs font-mono uppercase tracking-widest text-[#4D7C0F] font-bold">
        Private Charter Request Confirmed
      </span>
      <h2 className="text-2xl md:text-4xl font-bold text-[#1A1715]">Request Received</h2>
      <p className="text-sm text-[#78716C] max-w-md mx-auto leading-relaxed">
        Your private charter enquiry has been routed directly to our flight operations team. We are calculating route parameters and will contact you shortly.
      </p>
    </div>

    {/* Reference ID Pill */}
    <div className="p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm max-w-md mx-auto space-y-2">
      <span className="text-[11px] uppercase tracking-wider text-[#78716C] block font-mono font-semibold">
        Your Request Reference
      </span>
      <div className="flex items-center justify-center gap-3">
        <span className="text-2xl font-mono font-bold text-[#1A1715] tracking-wider">
          {submissionResult.reference}
        </span>
        <button
          type="button"
          onClick={onCopyReference}
          className="p-1.5 rounded-lg bg-[#EFE9DF] hover:bg-[#E5DFD5] text-[#1A1715] transition"
          title="Copy Reference"
        >
          {copied ? <Check className="w-4 h-4 text-[#4D7C0F]" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <p className="text-[11px] text-[#78716C]">
        Route: {submissionResult.origin} → {submissionResult.destination}
      </p>
    </div>

    {/* Action Buttons */}
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
      <button
        type="button"
        onClick={onOpenWhatsAppSpecialist}
        className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#84CC16] hover:bg-[#65A30D] text-[#0D1F03] font-bold text-xs transition flex items-center justify-center gap-2 shadow-md"
      >
        <MessageCircle className="w-4 h-4" /> Speak to a Charter Specialist
      </button>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#EFE9DF] hover:bg-[#E5DFD5] text-[#1A1715] font-semibold text-xs transition"
        >
          Return to Private Charter
        </button>
      ) : (
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#EFE9DF] hover:bg-[#E5DFD5] text-[#1A1715] font-semibold text-xs transition"
        >
          Submit Another Request
        </button>
      )}
    </div>
  </div>
);
