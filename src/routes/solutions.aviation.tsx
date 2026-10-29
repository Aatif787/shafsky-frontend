import React, { useState, useRef, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Send,
  CheckCircle2,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { display } from "@/components/home/theme";
import { charterApi, CharterRequestPayload } from "@/lib/api/charterApi";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { Footer } from "@/components/home/sections/Footer";
import {
  sanitizeName,
  sanitizePhone,
  preventDigitsKeyDown,
  preventLettersKeyDown,
  validateNameNoDigits,
  validatePhoneNoLetters,
} from "@/lib/inputValidation";
import {
  CHARTER_OPTIONS,
  CHARTER_HERO_SLIDES,
  AviationHeroStage,
  AviationCategorySelector,
  AviationOptionSpecificFields,
  AviationSpecificationsSection,
  type CharterOptionId,
  type CharterOptionDef,
  type CharterHeroSlide,
} from "@/components/aviation/AviationSolutionsParts";

export {
  CHARTER_OPTIONS,
  CHARTER_HERO_SLIDES,
  type CharterOptionId,
  type CharterOptionDef,
  type CharterHeroSlide,
};

export const Route = createFileRoute("/solutions/aviation")({
  head: () =>
    pageHead({
      title: "Private Jet & Helicopter Charter in India | Shafsky Aviation",
      description:
        "On-demand private jets, helicopters, and mission aircraft across India. Corporate, tourism, pilgrim, and celebrity charter with rapid flight clearance.",
      path: "/solutions/aviation",
      keywords: ["private jet charter India", "helicopter charter", "air charter booking"],
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Private Charter", path: "/solutions/aviation" },
        ]),
      ],
    }),
  component: DedicatedAirCharterPage,
});

function DedicatedAirCharterPage() {
  const navigate = useNavigate();
  const [selectedOptionId, setSelectedOptionId] = useState<CharterOptionId>(
    "Domestic and International Charter"
  );
  const [heroSlideIndex, setHeroSlideIndex] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Swipe & drag gesture state for hero media carousel
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (heroSlideIndex === 0 && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [heroSlideIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartX(e.touches[0].clientX);
    setDragOffset(0);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartX === null) return;
    const currentX = e.touches[0].clientX;
    setDragOffset(currentX - dragStartX);
  };

  const handleTouchEnd = () => {
    if (dragStartX !== null) {
      if (dragOffset < -45) {
        setHeroSlideIndex((prev) => (prev + 1) % CHARTER_HERO_SLIDES.length);
      } else if (dragOffset > 45) {
        setHeroSlideIndex((prev) => (prev - 1 + CHARTER_HERO_SLIDES.length) % CHARTER_HERO_SLIDES.length);
      }
    }
    setDragStartX(null);
    setDragOffset(0);
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStartX(e.clientX);
    setDragOffset(0);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || dragStartX === null) return;
    setDragOffset(e.clientX - dragStartX);
  };

  const handleMouseUp = () => {
    if (isDragging && dragStartX !== null) {
      if (dragOffset < -45) {
        setHeroSlideIndex((prev) => (prev + 1) % CHARTER_HERO_SLIDES.length);
      } else if (dragOffset > 45) {
        setHeroSlideIndex((prev) => (prev - 1 + CHARTER_HERO_SLIDES.length) % CHARTER_HERO_SLIDES.length);
      }
    }
    setDragStartX(null);
    setDragOffset(0);
    setIsDragging(false);
  };

  const activeOption =
    CHARTER_OPTIONS.find((o) => o.id === selectedOptionId) || CHARTER_OPTIONS[0];

  // Progressive Step state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Step 1: Route & Schedule
  const [tripType, setTripType] = useState<"One Way" | "Round Trip" | "Multi-City">("One Way");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [departTime, setDepartTime] = useState("10:00");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("18:00");

  // Step 2: Option-Specific Requirements
  const [paxCount, setPaxCount] = useState(4);
  const [aircraftPreference, setAircraftPreference] = useState(activeOption.aircraftTypes[0]);
  const [companyName, setCompanyName] = useState("");
  const [helipadLocation, setHelipadLocation] = useState("");
  const [patientCondition, setPatientCondition] = useState("");
  const [stretcherNeeded, setStretcherNeeded] = useState<"Yes" | "No">("Yes");
  const [weddingDestination, setWeddingDestination] = useState("");
  const [pilgrimageSector, setPilgrimageSector] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Step 3: Contact Details
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // When changing option, update aircraft preference to first matching
  const handleSelectOption = (optId: CharterOptionId) => {
    setSelectedOptionId(optId);
    if (optId === "Domestic and International Charter") {
      setHeroSlideIndex(0);
    } else if (optId === "Corporate Charter") {
      setHeroSlideIndex(2);
    } else if (optId === "Private Charter") {
      setHeroSlideIndex(3);
    } else if (optId === "Air Ambulance Charter") {
      setHeroSlideIndex(1);
    }
    const match = CHARTER_OPTIONS.find((o) => o.id === optId);
    if (match) {
      setAircraftPreference(match.aircraftTypes[0]);
    }
  };

  const handleStep1Next = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      alert("Please specify both origin and destination.");
      return;
    }
    if (!departDate) {
      alert("Please select a departure date.");
      return;
    }
    if (tripType === "Round Trip" && !returnDate) {
      alert("Please select a return date.");
      return;
    }
    setCurrentStep(2);
  };

  const handleStep2Next = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const handleSubmitRequest = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!clientName.trim() || !validateNameNoDigits(clientName)) {
      alert("Please provide a valid name without numbers.");
      return;
    }
    if (!phone.trim() || !validatePhoneNoLetters(phone)) {
      alert("Please provide a valid contact phone number without letters.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      alert("Please provide a valid email so our charter desk can send your quotation.");
      return;
    }

    setIsSubmitting(true);

    const detailsSummary = [
      `Charter Option: ${selectedOptionId}`,
      `Aircraft Preference: ${aircraftPreference}`,
      companyName ? `Company: ${companyName}` : null,
      helipadLocation ? `Helipad/Landing Zone: ${helipadLocation}` : null,
      patientCondition ? `Medical Condition: ${patientCondition} (Stretcher: ${stretcherNeeded})` : null,
      weddingDestination ? `Wedding Destination: ${weddingDestination}` : null,
      pilgrimageSector ? `Pilgrim Sector: ${pilgrimageSector}` : null,
      specialRequests ? `Special Requests: ${specialRequests}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const payload: CharterRequestPayload = {
      customer_name: clientName.trim(),
      country_code: "+91",
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      company: companyName.trim() || undefined,
      preferred_contact_method: "WHATSAPP",
      trip_type: tripType === "Round Trip" ? "ROUND_TRIP" : tripType === "Multi-City" ? "MULTI_CITY" : "ONE_WAY",
      origin: origin.trim(),
      destination: destination.trim(),
      departure_date: departDate,
      departure_time: departTime || undefined,
      return_date: tripType === "Round Trip" ? returnDate : undefined,
      return_time: tripType === "Round Trip" ? returnTime || undefined : undefined,
      itinerary: [
        {
          origin: origin.trim(),
          destination: destination.trim(),
          departure_date: departDate,
          departure_time: departTime || undefined,
        },
      ],
      passengers: {
        adults: Math.max(1, paxCount),
        children: 0,
        infants: 0,
        total: Math.max(1, paxCount),
      },
      aircraft_preference: aircraftPreference || "NO_PREFERENCE",
      travel_requirements: [selectedOptionId],
      special_requests: detailsSummary.slice(0, 2000),
    };

    try {
      const res = await charterApi.submitRequest(payload);
      if (res.success && res.data?.request_reference) {
        setSubmittedRef(res.data.request_reference);
      } else {
        const errMsg =
          !res.success && "error" in res
            ? String(res.error)
            : "Failed to submit charter request. Please try again.";
        alert(errMsg);
      }
    } catch (err) {
      console.error("Backend charter quotation submit:", err);
      alert("Something went wrong while submitting your charter request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppDirectLink = () => {
    const text = `Hello Shafsky Aviation Charter Desk,%0A%0AI would like a quotation for Private Charter:%0A- Charter Option: ${selectedOptionId}%0A- Route: ${tripType} (${origin} -> ${destination})%0A- Departure: ${departDate} at ${departTime}${tripType === "Round Trip" ? `%0A- Return: ${returnDate} at ${returnTime}` : ""}%0A- Passengers: ${paxCount} Pax%0A- Aircraft Preference: ${aircraftPreference}%0A- Client Name: ${clientName}%0A- Phone: ${phone}%0A- Email: ${email || "N/A"}`;
    return `https://wa.me/919599087959?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-lime-200">
      {/* 1. CLASSICAL FRAMED CINEMATIC HERO MEDIA STAGE */}
      <AviationHeroStage
        onBack={() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            navigate({ to: "/" });
          }
        }}
        videoRef={videoRef}
        heroSlideIndex={heroSlideIndex}
        setHeroSlideIndex={setHeroSlideIndex}
        isDragging={isDragging}
        dragOffset={dragOffset}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
      />

      {/* 2. 10 PRIVATE CHARTER OPTIONS SELECTOR */}
      <AviationCategorySelector
        selectedOptionId={selectedOptionId}
        handleSelectOption={handleSelectOption}
      />

      {/* 3. SELECTED CHARTER REQUEST PANEL (Tailored Quotation Flow) */}
      <section className="py-12 sm:py-16 bg-slate-50/60 border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Active Option Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-lime-700 mb-2">
              <Sparkles size={13} className="text-lime-600" />
              <span>{activeOption.badge} — REQUEST QUOTATION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950" style={display}>
              {activeOption.id}
            </h2>
            {activeOption.tagline ? (
              <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
                {activeOption.tagline}
              </p>
            ) : null}
          </div>

          {/* Progressive Steps Indicator */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8 text-xs font-mono font-bold">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border ${
                currentStep === 1
                  ? "bg-lime-500 text-slate-950 border-lime-600 shadow-sm"
                  : currentStep > 1
                  ? "bg-white text-slate-800 border-lime-400"
                  : "bg-white text-slate-400 border-slate-200"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-900/10 flex items-center justify-center text-[10px]">1</span>
              <span>Routing & Date</span>
            </div>

            <span className="text-slate-300">→</span>

            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border ${
                currentStep === 2
                  ? "bg-lime-500 text-slate-950 border-lime-600 shadow-sm"
                  : currentStep > 2
                  ? "bg-white text-slate-800 border-lime-400"
                  : "bg-white text-slate-400 border-slate-200"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-900/10 flex items-center justify-center text-[10px]">2</span>
              <span>Aircraft & Specs</span>
            </div>

            <span className="text-slate-300">→</span>

            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border ${
                currentStep === 3
                  ? "bg-lime-500 text-slate-950 border-lime-600 shadow-sm"
                  : "bg-white text-slate-400 border-slate-200"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-900/10 flex items-center justify-center text-[10px]">3</span>
              <span>Contact & Dispatch</span>
            </div>
          </div>

          {/* Success State / Reference Card */}
          {submittedRef ? (
            <div className="bg-white rounded-3xl border border-lime-400 p-8 sm:p-12 text-center shadow-lg">
              <div className="w-16 h-16 rounded-full bg-lime-100 border border-lime-300 flex items-center justify-center mx-auto mb-4 text-lime-700">
                <CheckCircle2 size={32} />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-lime-700">
                CHARTER QUOTATION DISPATCHED
              </span>
              <h3 className="text-3xl font-extrabold text-slate-950 mt-1 mb-2" style={display}>
                Reference #{submittedRef}
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                Your <strong className="text-slate-900">{selectedOptionId}</strong> flight inquiry has been sent to the Shafsky 24/7 Aviation Desk. Our charter flight director is compiling matching aircraft options.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={getWhatsAppDirectLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs font-mono tracking-wider shadow-md transition-all"
                >
                  <MessageSquare size={15} />
                  <span>Open WhatsApp Direct Desk</span>
                </a>
                <button
                  onClick={() => {
                    setSubmittedRef(null);
                    setCurrentStep(1);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs font-mono tracking-wider transition-all"
                >
                  Submit Another Itinerary
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-md">
              {/* STEP 1: ROUTING & SCHEDULE */}
              {currentStep === 1 && (
                <form onSubmit={handleStep1Next} className="space-y-6">
                  {/* Trip Type Selector */}
                  <div className="flex items-center gap-2">
                    {(["One Way", "Round Trip", "Multi-City"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTripType(t)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                          tripType === t
                            ? "bg-slate-900 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Origin & Destination */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Departure Location / Airport
                      </label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={origin}
                          onChange={(e) => setOrigin(e.target.value)}
                          placeholder="Departure airport or city"
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Arrival Destination / Sector
                      </label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          placeholder="Arrival airport or city"
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Departure Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Departure Date
                      </label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          value={departDate}
                          onChange={(e) => setDepartDate(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Preferred Departure Time
                      </label>
                      <div className="relative">
                        <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="time"
                          value={departTime}
                          onChange={(e) => setDepartTime(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Return Date & Time if Round Trip */}
                  {tripType === "Round Trip" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Return Date
                        </label>
                        <div className="relative">
                          <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="date"
                            min={departDate || new Date().toISOString().split("T")[0]}
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Return Time
                        </label>
                        <div className="relative">
                          <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="time"
                            value={returnTime}
                            onChange={(e) => setReturnTime(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs font-mono tracking-wider shadow-md transition-all cursor-pointer"
                    >
                      <span>Proceed to Aircraft & Specs</span>
                      <span>→</span>
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: OPTION-SPECIFIC REQUIREMENTS */}
              {currentStep === 2 && (
                <form onSubmit={handleStep2Next} className="space-y-6">
                  {/* Passenger Count & Aircraft Preference */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Passenger Count
                      </label>
                      <div className="relative">
                        <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="number"
                          min={1}
                          max={200}
                          value={paxCount}
                          onChange={(e) => setPaxCount(parseInt(e.target.value) || 1)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Aircraft Preference
                      </label>
                      <select
                        value={aircraftPreference}
                        onChange={(e) => setAircraftPreference(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 bg-white"
                      >
                        {activeOption.aircraftTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Option-Specific Fields */}
                  <AviationOptionSpecificFields
                    selectedOptionId={selectedOptionId}
                    helipadLocation={helipadLocation}
                    setHelipadLocation={setHelipadLocation}
                    companyName={companyName}
                    setCompanyName={setCompanyName}
                    patientCondition={patientCondition}
                    setPatientCondition={setPatientCondition}
                    stretcherNeeded={stretcherNeeded}
                    setStretcherNeeded={setStretcherNeeded}
                    weddingDestination={weddingDestination}
                    setWeddingDestination={setWeddingDestination}
                    pilgrimageSector={pilgrimageSector}
                    setPilgrimageSector={setPilgrimageSector}
                    specialRequests={specialRequests}
                    setSpecialRequests={setSpecialRequests}
                  />

                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-5 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-xs font-mono tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs font-mono tracking-wider shadow-md transition-all cursor-pointer"
                    >
                      <span>Proceed to Contact Info</span>
                      <span>→</span>
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: CONTACT & DISPATCH */}
              {currentStep === 3 && (
                <form onSubmit={handleSubmitRequest} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Client / Passenger Full Name
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onKeyDown={preventDigitsKeyDown}
                        onChange={(e) => setClientName(sanitizeName(e.target.value))}
                        placeholder="Full name"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Phone / WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onKeyDown={preventLettersKeyDown}
                        onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                        placeholder="Mobile number"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-lime-50/70 border border-lime-200 text-xs font-mono text-slate-700">
                    <span className="font-bold text-lime-900 block mb-1">
                      Direct Quotation Dispatch:
                    </span>
                    Our 24/7 private aviation desk will verify slot permits, check matching tail numbers, and send a comprehensive quotation directly to your WhatsApp/Phone with zero delay.
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-5 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-xs font-mono tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs font-mono tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Send size={14} />
                      <span>{isSubmitting ? "Dispatching..." : "Submit Quotation Request"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 4. COMPANY CATALOG CONTENT & SPECIFICATIONS */}
      <AviationSpecificationsSection activeOption={activeOption} />

      <Footer />
    </div>
  );
}
