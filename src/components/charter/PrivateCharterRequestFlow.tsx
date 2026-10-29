import { CountryCodeSelect } from "@/components/ui/PhoneInput";
import { useState, useEffect } from "react";
import {
  sanitizeName,
  sanitizePhone,
  preventDigitsKeyDown,
  preventLettersKeyDown,
  validateNameNoDigits,
  validatePhoneNoLetters,
} from "@/lib/inputValidation";
import {
  Plane,
  Clock,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Phone,
  MessageCircle,
  Mail,
  Loader2,
} from "lucide-react";
import { airportApi, AirportInfo } from "@/lib/api/airportApi";
import { charterApi, CharterRequestPayload, CharterLeg } from "@/lib/api/charterApi";
import { toast } from "sonner";
import {
  AIRCRAFT_OPTIONS,
  TRAVEL_REQUIREMENTS_LIST,
  TIME_PREFERENCES,
  getTomorrowDateStr,
  getDefaultReturnDateStr,
  CharterStepAircraft,
  CharterStepRequirements,
  CharterStepReview,
  CharterStepSuccess,
} from "./charterRequestData";

export {
  AIRCRAFT_OPTIONS,
  TRAVEL_REQUIREMENTS_LIST,
  TIME_PREFERENCES,
  getTomorrowDateStr,
  getDefaultReturnDateStr,
  CharterStepAircraft,
  CharterStepRequirements,
  CharterStepReview,
  CharterStepSuccess,
};

interface Props {
  onClose?: () => void;
  initialOrigin?: string;
  initialDestination?: string;
}

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
    if (!customerName.trim() || !validateNameNoDigits(customerName)) {
      toast.error("Please enter a valid full name without numbers.");
      return false;
    }
    if (!phone.trim() || !validatePhoneNoLetters(phone) || phone.replace(/\D/g, "").length < 7) {
      toast.error("Please enter a valid phone number (digits only, at least 7 digits).");
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
                      placeholder="Airport name, city, or IATA code"
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
                      placeholder="Airport name, city, or IATA code"
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
        <CharterStepAircraft
          aircraftPreference={aircraftPreference}
          setAircraftPreference={setAircraftPreference}
        />
      )}

      {/* STEP 4: TRAVEL REQUIREMENTS */}
      {step === 4 && (
        <CharterStepRequirements
          selectedRequirements={selectedRequirements}
          toggleRequirement={toggleRequirement}
          specialRequests={specialRequests}
          setSpecialRequests={setSpecialRequests}
        />
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
                onKeyDown={preventDigitsKeyDown}
                onChange={(e) => setCustomerName(sanitizeName(e.target.value))}
                placeholder="Full name"
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
                placeholder="Email address"
                className="w-full bg-white border border-[#DCD5C9] rounded-xl px-4 py-2.5 text-sm text-[#1A1715] placeholder-[#A8A29E] focus:border-[#84CC16] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <CountryCodeSelect
                  value={countryCode}
                  onChange={setCountryCode}
                  className="bg-white border border-[#DCD5C9] rounded-xl px-3 py-2.5 text-xs text-[#1A1715] focus:border-[#84CC16] focus:outline-none"
                />
                <input
                  type="tel"
                  value={phone}
                  onKeyDown={preventLettersKeyDown}
                  onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                  placeholder="Mobile number"
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
                placeholder="Company or family office name"
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
        <CharterStepReview
          tripType={tripType}
          legs={legs}
          returnDate={returnDate}
          returnTime={returnTime}
          passengers={passengers}
          totalPassengers={totalPassengers}
          aircraftPreference={aircraftPreference}
          selectedRequirements={selectedRequirements}
          customerName={customerName}
          countryCode={countryCode}
          phone={phone}
          email={email}
          onEditItinerary={() => setStep(1)}
        />
      )}

      {/* STEP 7: SUCCESS SCREEN */}
      {step === 7 && submissionResult && (
        <CharterStepSuccess
          submissionResult={submissionResult}
          copied={copied}
          onCopyReference={copyReference}
          onOpenWhatsAppSpecialist={openWhatsAppSpecialist}
          onClose={onClose}
          onReset={() => {
            setStep(1);
            setSubmissionResult(null);
          }}
        />
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
