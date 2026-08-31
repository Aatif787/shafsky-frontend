import React, { useState, useEffect } from "react";
import {
  Plane,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Phone,
  MessageCircle,
  Mail,
  Copy,
  Check,
  Loader2,
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
import { airportApi, AirportInfo } from "@/lib/api/airportApi";
import { charterApi, CharterRequestPayload, CharterLeg } from "@/lib/api/charterApi";
import { toast } from "sonner";

interface Props {
  onClose?: () => void;
  initialOrigin?: string;
  initialDestination?: string;
}

const AIRCRAFT_OPTIONS = [
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

const TRAVEL_REQUIREMENTS_LIST = [
  { id: "Catering & Fine Dining", label: "Catering & Fine Dining", icon: Utensils, desc: "Michelin-inspired custom culinary menus & fine wines" },
  { id: "Tarmac Maybach / Chauffeur", label: "Tarmac Maybach Transfer", icon: Car, desc: "Direct airside vehicle pickup at aircraft steps" },
  { id: "Pet in Cabin (AVI)", label: "Pet in Cabin (AVI)", icon: Dog, desc: "Fly alongside your pets in total comfort without crates" },
  { id: "Special Assistance / Medical", label: "Special Assistance / Medical", icon: HeartHandshake, desc: "Airside wheelchair, medical escort, or priority escort" },
  { id: "High-Speed Inflight Wi-Fi", label: "High-Speed Satellite Wi-Fi", icon: Wifi, desc: "Stream, work, and video conference seamlessly" },
  { id: "Lie-Flat Sleeping Arrangements", label: "Lie-Flat Sleeping Suite", icon: Bed, desc: "Bedding configured with luxury linens for overnight flights" },
  { id: "Business Meeting Suite", label: "Inflight Meeting Suite", icon: Briefcase, desc: "Conference table setup with presentation displays" },
  { id: "Special Occasion & Celebration", label: "Special Occasion Styling", icon: Gift, desc: "Birthday, anniversary or VIP custom celebration touches" },
  { id: "Oversized Baggage Capacity", label: "Oversized Baggage Support", icon: Luggage, desc: "Golf bags, art pieces, or extensive luggage cargo" },
];

const TIME_PREFERENCES = [
  "Flexible / Any Time",
  "Morning (06:00 – 12:00)",
  "Afternoon (12:00 – 18:00)",
  "Evening (18:00 – 24:00)",
  "Night / Red-eye (00:00 – 06:00)",
];

const COUNTRY_CODES = [
  { code: "+91", country: "India" },
  { code: "+971", country: "UAE" },
  { code: "+44", country: "United Kingdom" },
  { code: "+1", country: "United States / Canada" },
  { code: "+65", country: "Singapore" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+41", country: "Switzerland" },
];

export function PrivateCharterRequestFlow({ onClose, initialOrigin = "", initialDestination = "" }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  // Form State
  const [tripType, setTripType] = useState<"ONE_WAY" | "ROUND_TRIP" | "MULTI_CITY">("ONE_WAY");
  
  // Legs
  const [legs, setLegs] = useState<CharterLeg[]>([
    {
      origin: initialOrigin || "Indira Gandhi International Airport, Delhi (DEL)",
      destination: initialDestination || "Dubai International Airport, Dubai (DXB)",
      departure_date: getTomorrowDateStr(),
      departure_time: "Morning (06:00 – 12:00)",
    },
  ]);

  // Round Trip specific return
  const [returnDate, setReturnDate] = useState<string>(getDefaultReturnDateStr());
  const [returnTime, setReturnTime] = useState<string>("Afternoon (12:00 – 18:00)");

  // Passengers
  const [passengers, setPassengers] = useState({
    adults: 2,
    children: 0,
    infants: 0,
  });

  // Aircraft
  const [aircraftPreference, setAircraftPreference] = useState<string>("NO_PREFERENCE");

  // Requirements
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([
    "Catering & Fine Dining",
    "Tarmac Maybach / Chauffeur",
  ]);
  const [specialRequests, setSpecialRequests] = useState<string>("");

  // Contact
  const [customerName, setCustomerName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [preferredContact, setPreferredContact] = useState<string>("PHONE_WHATSAPP");

  // Submission & Result
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    reference: string;
    customerName: string;
    origin: string;
    destination: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Airport Autocomplete State
  const [activeSearchField, setActiveSearchField] = useState<{ legIndex: number; field: "origin" | "destination" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AirportInfo[]>([]);

  // Debounced Airport Search
  useEffect(() => {
    if (!activeSearchField || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await airportApi.search(searchQuery, "global");
        if (res.success && res.data) {
          setSearchResults(res.data.slice(0, 7));
        }
      } catch {
        setSearchResults([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, activeSearchField]);

  function getTomorrowDateStr() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }

  function getDefaultReturnDateStr() {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split("T")[0];
  }

  const handleSelectAirport = (airport: AirportInfo) => {
    if (!activeSearchField) return;
    const formatted = `${airport.name}, ${airport.city} (${airport.code})`;
    const updatedLegs = [...legs];
    updatedLegs[activeSearchField.legIndex][activeSearchField.field] = formatted;
    setLegs(updatedLegs);
    setActiveSearchField(null);
    setSearchQuery("");
  };

  const addLeg = () => {
    const lastLeg = legs[legs.length - 1];
    const newLegDate = lastLeg?.departure_date || getTomorrowDateStr();
    setLegs([
      ...legs,
      {
        origin: lastLeg?.destination || "",
        destination: "",
        departure_date: newLegDate,
        departure_time: "Morning (06:00 – 12:00)",
      },
    ]);
  };

  const removeLeg = (index: number) => {
    if (legs.length <= 1) return;
    setLegs(legs.filter((_, idx) => idx !== index));
  };

  const toggleRequirement = (reqId: string) => {
    if (selectedRequirements.includes(reqId)) {
      setSelectedRequirements(selectedRequirements.filter((r) => r !== reqId));
    } else {
      setSelectedRequirements([...selectedRequirements, reqId]);
    }
  };

  const validateStep1 = (): boolean => {
    for (let i = 0; i < legs.length; i++) {
      if (!legs[i].origin.trim()) {
        toast.error(`Please enter departure origin for Flight Leg ${i + 1}.`);
        return false;
      }
      if (!legs[i].destination.trim()) {
        toast.error(`Please enter arrival destination for Flight Leg ${i + 1}.`);
        return false;
      }
      if (!legs[i].departure_date) {
        toast.error(`Please select departure date for Flight Leg ${i + 1}.`);
        return false;
      }
    }
    if (tripType === "ROUND_TRIP") {
      if (!returnDate) {
        toast.error("Please select a return date for Round Trip charter.");
        return false;
      }
      if (new Date(returnDate) < new Date(legs[0].departure_date)) {
        toast.error("Return date cannot be earlier than departure date.");
        return false;
      }
    }
    return true;
  };

  const validateStep5 = (): boolean => {
    if (!customerName.trim()) {
      toast.error("Please enter your full name.");
      return false;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 7) {
      toast.error("Please enter a valid phone number (at least 7 digits).");
      return false;
    }
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 5 && !validateStep5()) return;
    setStep((prev) => (Math.min(prev + 1, 6) as any));
  };

  const handleBack = () => {
    setStep((prev) => (Math.max(prev - 1, 1) as any));
  };

  const handleSubmitRequest = async () => {
    if (!validateStep5()) return;
    setIsSubmitting(true);

    const payload: CharterRequestPayload = {
      customer_name: customerName.trim(),
      country_code: countryCode,
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      company: company.trim() || undefined,
      preferred_contact_method: preferredContact,
      trip_type: tripType,
      origin: legs[0].origin,
      destination: tripType === "ROUND_TRIP" ? legs[0].destination : legs[legs.length - 1].destination,
      departure_date: legs[0].departure_date,
      departure_time: legs[0].departure_time,
      return_date: tripType === "ROUND_TRIP" ? returnDate : undefined,
      return_time: tripType === "ROUND_TRIP" ? returnTime : undefined,
      itinerary: legs,
      passengers: {
        adults: passengers.adults,
        children: passengers.children,
        infants: passengers.infants,
        total: passengers.adults + passengers.children + passengers.infants,
      },
      aircraft_preference: aircraftPreference,
      travel_requirements: selectedRequirements,
      special_requests: specialRequests.trim() || undefined,
    };

    try {
      const res = await charterApi.submitRequest(payload);
      if (res.success) {
        if (res.data) {
          setSubmissionResult({
            reference: res.data.request_reference,
            customerName: res.data.customer_name,
            origin: res.data.origin,
            destination: res.data.destination,
          });
          setStep(7);
          toast.success(`Charter request ${res.data.request_reference} received.`);
        }
      } else {
        toast.error(res.error || "Failed to submit charter request. Please check backend connection.");
      }
    } catch {
      toast.error("Something went wrong while submitting your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReference = () => {
    if (!submissionResult?.reference) return;
    navigator.clipboard.writeText(submissionResult.reference);
    setCopied(true);
    toast.success("Request Reference copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  const openWhatsAppSpecialist = () => {
    const ref = submissionResult?.reference || "";
    const msg = encodeURIComponent(
      `Hello Shafsky Charter Specialist, I would like to follow up on my Private Charter Request (Reference: ${ref}).`
    );
    window.open(`https://wa.me/919599087959?text=${msg}`, "_blank");
  };

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-[#FAF8F5] text-[#1A1715] border border-[#E5DFD5] shadow-2xl overflow-hidden font-['Inter',sans-serif]">
      {/* Header Progress Bar (Light Cream & Lime Green) */}
      {step < 7 && (
        <div className="border-b border-[#E5DFD5] bg-[#F4EFE6]/90 backdrop-blur-md px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest text-[#4D7C0F] uppercase">
                Private Aviation Request
              </span>
              <span className="text-xs text-[#78716C]">• Step {step} of 6</span>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-[#78716C] hover:text-[#1A1715] transition-colors font-medium"
              >
                Close
              </button>
            )}
          </div>
          {/* Progress Indicators */}
          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= step ? "bg-[#84CC16]" : "bg-[#E5DFD5]"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* STEP 1: JOURNEY */}
      {step === 1 && (
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#1A1715]">Your Itinerary</h2>
            <p className="text-sm text-[#78716C]">
              Specify your departure hubs, destination points, and preferred schedule window.
            </p>
          </div>

          {/* Trip Type Selector */}
          <div className="flex rounded-full bg-[#EFE9DF] p-1 border border-[#E5DFD5] max-w-md">
            {(["ONE_WAY", "ROUND_TRIP", "MULTI_CITY"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTripType(t)}
                className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all ${
                  tripType === t
                    ? "bg-[#84CC16] text-[#0D1F03] shadow-md"
                    : "text-[#78716C] hover:text-[#1A1715]"
                }`}
              >
                {t === "ONE_WAY" && "One Way"}
                {t === "ROUND_TRIP" && "Round Trip"}
                {t === "MULTI_CITY" && "Multi-City"}
              </button>
            ))}
          </div>

          {/* Flight Legs */}
          <div className="space-y-4">
            {legs.map((leg, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm space-y-4 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#4D7C0F] font-bold flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-[#65A30D]" /> Flight Leg {index + 1}
                  </span>
                  {tripType === "MULTI_CITY" && legs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLeg(index)}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Origin Search */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-[#44403C] mb-1.5">Departure Origin</label>
                    <input
                      type="text"
                      value={
                        activeSearchField?.legIndex === index && activeSearchField?.field === "origin"
                          ? searchQuery
                          : leg.origin
                      }
                      onFocus={() => {
                        setActiveSearchField({ legIndex: index, field: "origin" });
                        setSearchQuery(leg.origin);
                      }}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Airport name, city, or IATA (e.g. DEL, London)"
                      className="w-full bg-[#FAF8F5] border border-[#DCD5C9] rounded-xl px-4 py-2.5 text-sm text-[#1A1715] placeholder-[#A8A29E] focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] focus:outline-none transition-colors"
                    />

                    {/* Autocomplete Dropdown */}
                    {activeSearchField?.legIndex === index &&
                      activeSearchField?.field === "origin" &&
                      searchResults.length > 0 && (
                        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#DCD5C9] rounded-xl shadow-2xl max-h-56 overflow-y-auto p-1.5">
                          {searchResults.map((airport) => (
                            <button
                              key={airport.code}
                              type="button"
                              onClick={() => handleSelectAirport(airport)}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F4FCE3] transition flex items-center justify-between text-xs"
                            >
                              <span className="font-medium text-[#1A1715]">
                                {airport.name} ({airport.city})
                              </span>
                              <span className="font-mono text-[#4D7C0F] font-bold">
                                {airport.code}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* Destination Search */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-[#44403C] mb-1.5">Arrival Destination</label>
                    <input
                      type="text"
                      value={
                        activeSearchField?.legIndex === index && activeSearchField?.field === "destination"
                          ? searchQuery
                          : leg.destination
                      }
                      onFocus={() => {
                        setActiveSearchField({ legIndex: index, field: "destination" });
                        setSearchQuery(leg.destination);
                      }}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Airport name, city, or IATA (e.g. DXB, Paris)"
                      className="w-full bg-[#FAF8F5] border border-[#DCD5C9] rounded-xl px-4 py-2.5 text-sm text-[#1A1715] placeholder-[#A8A29E] focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] focus:outline-none transition-colors"
                    />

                    {/* Autocomplete Dropdown */}
                    {activeSearchField?.legIndex === index &&
                      activeSearchField?.field === "destination" &&
                      searchResults.length > 0 && (
                        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#DCD5C9] rounded-xl shadow-2xl max-h-56 overflow-y-auto p-1.5">
                          {searchResults.map((airport) => (
                            <button
                              key={airport.code}
                              type="button"
                              onClick={() => handleSelectAirport(airport)}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F4FCE3] transition flex items-center justify-between text-xs"
                            >
                              <span className="font-medium text-[#1A1715]">
                                {airport.name} ({airport.city})
                              </span>
                              <span className="font-mono text-[#4D7C0F] font-bold">
                                {airport.code}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-[#44403C] mb-1.5">Departure Date</label>
                    <input
                      type="date"
                      min={getTomorrowDateStr()}
                      value={leg.departure_date}
                      onChange={(e) => {
                        const updated = [...legs];
                        updated[index].departure_date = e.target.value;
                        setLegs(updated);
                      }}
                      className="w-full bg-[#FAF8F5] border border-[#DCD5C9] rounded-xl px-4 py-2.5 text-sm text-[#1A1715] focus:border-[#84CC16] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#44403C] mb-1.5">Preferred Time Window</label>
                    <select
                      value={leg.departure_time || TIME_PREFERENCES[0]}
                      onChange={(e) => {
                        const updated = [...legs];
                        updated[index].departure_time = e.target.value;
                        setLegs(updated);
                      }}
                      className="w-full bg-[#FAF8F5] border border-[#DCD5C9] rounded-xl px-4 py-2.5 text-sm text-[#1A1715] focus:border-[#84CC16] focus:outline-none transition-colors"
                    >
                      {TIME_PREFERENCES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {/* Round Trip Return Inputs */}
            {tripType === "ROUND_TRIP" && (
              <div className="p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#4D7C0F] font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#65A30D]" /> Return Leg
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#44403C] mb-1.5">Return Date</label>
                    <input
                      type="date"
                      min={legs[0]?.departure_date || getTomorrowDateStr()}
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#DCD5C9] rounded-xl px-4 py-2.5 text-sm text-[#1A1715] focus:border-[#84CC16] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#44403C] mb-1.5">Preferred Return Time</label>
                    <select
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#DCD5C9] rounded-xl px-4 py-2.5 text-sm text-[#1A1715] focus:border-[#84CC16] focus:outline-none transition-colors"
                    >
                      {TIME_PREFERENCES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Multi City Add Leg Button */}
            {tripType === "MULTI_CITY" && (
              <button
                type="button"
                onClick={addLeg}
                className="w-full py-3 rounded-2xl border border-dashed border-[#84CC16]/60 bg-[#F4FCE3]/40 hover:bg-[#F4FCE3] text-[#4D7C0F] text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Plus className="w-4 h-4 text-[#65A30D]" /> Add Flight Leg
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: PASSENGERS */}
      {step === 2 && (
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#1A1715]">Passenger Manifest</h2>
            <p className="text-sm text-[#78716C]">
              Tell us the number of guests in your party. Aircraft recommendations will match your cabin space requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Adults */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm space-y-3 text-center">
              <span className="text-xs text-[#78716C] uppercase font-bold tracking-wider block">Adults (12+ yrs)</span>
              <div className="text-3xl font-bold text-[#1A1715]">{passengers.adults}</div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPassengers({ ...passengers, adults: Math.max(1, passengers.adults - 1) })}
                  className="w-9 h-9 rounded-full bg-[#EFE9DF] hover:bg-[#E5DFD5] text-[#1A1715] flex items-center justify-center text-lg font-bold transition"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setPassengers({ ...passengers, adults: passengers.adults + 1 })}
                  className="w-9 h-9 rounded-full bg-[#84CC16] hover:bg-[#65A30D] text-[#0D1F03] flex items-center justify-center text-lg font-bold transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm space-y-3 text-center">
              <span className="text-xs text-[#78716C] uppercase font-bold tracking-wider block">Children (2–12 yrs)</span>
              <div className="text-3xl font-bold text-[#1A1715]">{passengers.children}</div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPassengers({ ...passengers, children: Math.max(0, passengers.children - 1) })}
                  className="w-9 h-9 rounded-full bg-[#EFE9DF] hover:bg-[#E5DFD5] text-[#1A1715] flex items-center justify-center text-lg font-bold transition"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setPassengers({ ...passengers, children: passengers.children + 1 })}
                  className="w-9 h-9 rounded-full bg-[#84CC16] hover:bg-[#65A30D] text-[#0D1F03] flex items-center justify-center text-lg font-bold transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Infants */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm space-y-3 text-center">
              <span className="text-xs text-[#78716C] uppercase font-bold tracking-wider block">Infants (&lt;2 yrs)</span>
              <div className="text-3xl font-bold text-[#1A1715]">{passengers.infants}</div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPassengers({ ...passengers, infants: Math.max(0, passengers.infants - 1) })}
                  className="w-9 h-9 rounded-full bg-[#EFE9DF] hover:bg-[#E5DFD5] text-[#1A1715] flex items-center justify-center text-lg font-bold transition"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setPassengers({ ...passengers, infants: passengers.infants + 1 })}
                  className="w-9 h-9 rounded-full bg-[#84CC16] hover:bg-[#65A30D] text-[#0D1F03] flex items-center justify-center text-lg font-bold transition"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F4FCE3] border border-[#84CC16]/30 flex items-center justify-between text-xs">
            <span className="text-[#365314] font-medium">Total Passenger Manifest:</span>
            <span className="font-bold text-[#1A1715] bg-white px-3 py-1 rounded-full border border-[#84CC16]/40">
              {totalPassengers} Passenger{totalPassengers > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}

      {/* STEP 3: AIRCRAFT PREFERENCE */}
      {step === 3 && (
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
                    <span className={`text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                      isSelected ? "bg-[#84CC16] text-[#0D1F03]" : "bg-[#EFE9DF] text-[#4D7C0F]"
                    }`}>
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
      )}

      {/* STEP 4: TRAVEL REQUIREMENTS */}
      {step === 4 && (
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#1A1715]">Travel Requirements</h2>
            <p className="text-sm text-[#78716C]">
              Customize your private aviation experience with bespoke concierge and inflight amenities.
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
              placeholder="Tell us anything that would help us tailor your charter (e.g. dietary preferences, diplomatic protocol, connection timeline, security details)..."
              className="w-full bg-white border border-[#DCD5C9] rounded-xl p-3.5 text-xs text-[#1A1715] placeholder-[#A8A29E] focus:border-[#84CC16] focus:outline-none transition-colors"
            />
          </div>
        </div>
      )}

      {/* STEP 5: CONTACT DETAILS */}
      {step === 5 && (
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#1A1715]">Contact & Communication</h2>
            <p className="text-sm text-[#78716C]">
              Where should our charter flight desk send your aircraft options and itinerary quote?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Lord Sterling / Sarah Jenkins"
                className="w-full bg-white border border-[#DCD5C9] rounded-xl px-4 py-2.5 text-sm text-[#1A1715] placeholder-[#A8A29E] focus:border-[#84CC16] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vip@domain.com"
                className="w-full bg-white border border-[#DCD5C9] rounded-xl px-4 py-2.5 text-sm text-[#1A1715] placeholder-[#A8A29E] focus:border-[#84CC16] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-white border border-[#DCD5C9] rounded-xl px-3 py-2.5 text-xs text-[#1A1715] focus:border-[#84CC16] focus:outline-none"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.country} ({c.code})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="flex-1 bg-white border border-[#DCD5C9] rounded-xl px-4 py-2.5 text-sm text-[#1A1715] placeholder-[#A8A29E] focus:border-[#84CC16] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1.5">Company / Family Office (Optional)</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Apex Holdings"
                className="w-full bg-white border border-[#DCD5C9] rounded-xl px-4 py-2.5 text-sm text-[#1A1715] placeholder-[#A8A29E] focus:border-[#84CC16] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#44403C] mb-2">Preferred Communication Channel</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {[
                { id: "PHONE_WHATSAPP", label: "Phone & WhatsApp", icon: MessageCircle },
                { id: "WHATSAPP", label: "WhatsApp Only", icon: MessageCircle },
                { id: "EMAIL", label: "Email Only", icon: Mail },
                { id: "PHONE", label: "Phone Call", icon: Phone },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPreferredContact(opt.id)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    preferredContact === opt.id
                      ? "bg-[#84CC16] border-[#84CC16] text-[#0D1F03] shadow-sm"
                      : "bg-white border-[#E5DFD5] text-[#57534E] hover:bg-[#FAF8F5]"
                  }`}
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: FINAL REVIEW & SUBMIT */}
      {step === 6 && (
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#1A1715]">Review Your Charter Request</h2>
            <p className="text-sm text-[#78716C]">
              Please verify your flight parameters before our operations desk dispatches your options.
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
                onClick={() => setStep(1)}
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
                <span className="text-[#78716C] font-semibold block mb-1">Contact Dispatch</span>
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
      )}

      {/* STEP 7: SUCCESS SCREEN */}
      {step === 7 && submissionResult && (
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
                onClick={copyReference}
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
              onClick={openWhatsAppSpecialist}
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
                onClick={() => {
                  setStep(1);
                  setSubmissionResult(null);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#EFE9DF] hover:bg-[#E5DFD5] text-[#1A1715] font-semibold text-xs transition"
              >
                Submit Another Request
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Footer Controls */}
      {step < 7 && (
        <div className="border-t border-[#E5DFD5] bg-[#F4EFE6]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full border border-[#DCD5C9] bg-white text-xs font-semibold text-[#57534E] hover:text-[#1A1715] hover:bg-[#FAF8F5] transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-full bg-[#84CC16] hover:bg-[#65A30D] text-[#0D1F03] font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-[#84CC16]/20"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitRequest}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-full bg-[#84CC16] hover:bg-[#65A30D] text-[#0D1F03] font-bold text-xs transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#84CC16]/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
                </>
              ) : (
                <>Submit Charter Request</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default PrivateCharterRequestFlow;
