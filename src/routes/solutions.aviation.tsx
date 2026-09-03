import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Plane,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Users,
  MapPin,
  Building2,
  HeartPulse,
  Crown,
  ShieldCheck,
  Send,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  MessageSquare,
} from "lucide-react";
import { display, mono } from "@/components/home/theme";
import { HOMEPAGE_PHOTOS } from "@/lib/homepage-photos";
import { charterApi, CharterRequestPayload } from "@/lib/api/charterApi";

import jetTarmac from "@/assets/homepage/home2.jpeg";

export const Route = createFileRoute("/solutions/aviation")({
  head: () => ({
    meta: [
      { title: "Air Charter Services — Shafsky Aviation" },
      {
        name: "description",
        content:
          "On-demand private jets, twin helicopters, and specialized mission aircraft on your schedule. 10 specialized charter options with rapid flight clearance.",
      },
    ],
  }),
  component: DedicatedAirCharterPage,
});

export type CharterOptionId =
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

interface CharterOptionDef {
  id: CharterOptionId;
  label: string;
  badge: string;
  tagline: string;
  inclusions: string[];
  aircraftTypes: string[];
}

const CHARTER_OPTIONS: CharterOptionDef[] = [
  {
    id: "Domestic and International Charter",
    label: "Domestic & International",
    badge: "GLOBAL FLIGHTS",
    tagline: "Point-to-point long-range flight itineraries across domestic and international airspace.",
    aircraftTypes: [
      "Heavy Long-Range Jet (12 - 16 Seats)",
      "Super Midsize Jet (8 - 10 Seats)",
      "Light Executive Jet (4 - 6 Seats)",
      "VIP Airliner (20 - 50 Seats)",
    ],
    inclusions: [
      "Point-to-Point Long-Range Flight Itineraries Across Domestic & International Airspace",
      "Dedicated Private Jet Selection (Light, Super Midsize & Heavy Aircraft)",
      "Private FBO Terminal Boarding & Direct Tarmac Gate Access",
      "Priority Flight Permits, Slots & Overflight Clearances",
      "Custom Inflight Dining & Premium Beverage Selection",
      "Dedicated Flight Operations Specialist 24/7",
    ],
  },
  {
    id: "Corporate Charter",
    label: "Corporate Charter",
    badge: "EXECUTIVE SUITE",
    tagline: "Executive travel for leadership teams, corporate boards, and roadshows.",
    aircraftTypes: [
      "Super Midsize Jet (8 - 10 Seats)",
      "Heavy Executive Jet (12 - 14 Seats)",
      "Corporate Shuttle Turboprop (19 - 30 Seats)",
    ],
    inclusions: [
      "Executive Business Travel for Leadership Teams, C-Suite & Delegations",
      "Multi-City Roadshow Flight Management & On-Demand Route Flexibility",
      "High-Speed Inflight Connectivity & Private Airborne Meeting Environment",
      "Custom Airport Check-in Fast-Track & Ground Logistics",
      "Confidential Passenger Manifests & Corporate Account Management",
      "Flexible Manifest Changes up to 2 Hours Prior to Departure",
    ],
  },
  {
    id: "Private Charter",
    label: "Private Charter",
    badge: "VVIP PRIVACY",
    tagline: "Exclusive point-to-point luxury jet flights on your personal schedule.",
    aircraftTypes: [
      "Light Jet (4 - 6 Seats)",
      "Midsize Luxury Jet (7 - 9 Seats)",
      "Heavy Long-Range Jet (10 - 16 Seats)",
    ],
    inclusions: [
      "Exclusive Private Aircraft for Individual & Family Travel",
      "Depart on Your Own Exact Schedule Without Commercial Terminal Queues",
      "Pet-Friendly Aircraft Cabins & Bespoke Luggage Allowances",
      "VIP Ground Chauffeur Coordination from Curbside to Aircraft Steps",
      "Tailored Inflight Catering & Personalized Cabin Ambience",
      "Complete Anonymity & Discreet Security Handling",
    ],
  },
  {
    id: "Helicopter Charter",
    label: "Helicopter Charter",
    badge: "URBAN & HELIPAD",
    tagline: "Twin-turbine helicopters for city transfers, rooftop helipads, and remote destinations.",
    aircraftTypes: [
      "Twin-Engine Executive Helicopter (4 - 6 Seats)",
      "Single-Engine Turbine Helicopter (4 Seats)",
      "Heavy Multi-Role Helicopter (8 - 12 Seats)",
    ],
    inclusions: [
      "Point-to-Point Rooftop Helipad, City Centre & Remote Location Landings",
      "Twin-Turbine Executive Helicopters for Maximum Safety & Comfort",
      "Rapid Airport-to-City Inter-Terminal Transfers",
      "Aerial Surveys, Industrial Site Visits & Scenic Flyovers",
      "Direct Access to Mountainous & Non-Airport Terrains",
      "Zero Runway Congestion with Direct Liftoff Approvals",
    ],
  },
  {
    id: "Tourism Charter",
    label: "Tourism Charter",
    badge: "LEISURE & SAFARI",
    tagline: "Scenic leisure flights, island hopping, and private safari air circuits.",
    aircraftTypes: [
      "Turboprop Safari Aircraft (6 - 9 Seats)",
      "Light Executive Jet (4 - 6 Seats)",
      "Scenic Helicopter (4 - 6 Seats)",
    ],
    inclusions: [
      "Customized Holiday Circuits, Island Hopping & Safari Destinations",
      "Low-Altitude Panoramic Scenic Viewing Flights",
      "Flexible Itinerary Timelines Tailored to Your Leisure Schedule",
      "Direct Flights to Remote Airstrips & Exclusive Private Resorts",
      "Family-Friendly Luxury Cabins with Generous Baggage Capacity",
      "Seamless Baggage & Luxury Villa Transfer Integration",
    ],
  },
  {
    id: "Pilgrim Charter",
    label: "Pilgrim Charter",
    badge: "SACRED SECTORS",
    tagline: "Dedicated charters to holy shrines and revered pilgrimage circuits.",
    aircraftTypes: [
      "Helicopter Shuttle (Chardham / Kedarnath)",
      "Turboprop Pilgrim Aircraft (9 - 19 Seats)",
      "Executive Midsize Jet (8 - 10 Seats)",
    ],
    inclusions: [
      "Direct Charter Flights to Sacred Shrines, Temples & Pilgrimage Circuits",
      "Chardham, Kedarnath, Badrinath, Tirupati, Shirdi & Varanasi Sectors",
      "Elderly & Special Mobility Passenger Care at Helipads and Terminals",
      "VIP Darshan Assistance & Local Ground Transport Integration",
      "Sanitized, Calm Cabin Environment for Peaceful Journey",
      "Dedicated Shafsky Pilgrim Coordinator at Destination Helipads",
    ],
  },
  {
    id: "Celebrities Charter",
    label: "Celebrities Charter",
    badge: "CONFIDENTIAL VIP",
    tagline: "Discreet charters with confidential manifests and airside security.",
    aircraftTypes: [
      "Ultra Long-Range Heavy Jet (14 - 18 Seats)",
      "Super Midsize Luxury Jet (8 - 10 Seats)",
      "Executive Helicopter (5 - 6 Seats)",
    ],
    inclusions: [
      "Ultra-Discreet VVIP Aviation with Maximum Privacy Protocols",
      "Private Hangar / Airside Apron Limousine Boarding",
      "Redacted Confidential Manifests & NDAs for Flight Crew",
      "Dedicated Armed PSO & Close Protection Coordination",
      "Paparazzi-Shielded Departure & Arrival Pathways",
      "Luxury Customized Inflight Service & Security Escort",
    ],
  },
  {
    id: "Adventure Sport Charter",
    label: "Adventure Sport Charter",
    badge: "EXPEDITION & SPORTS",
    tagline: "Air transport for sports teams, specialized gear, and mountainous terrains.",
    aircraftTypes: [
      "High-Payload Turboprop (9 - 20 Seats)",
      "High-Altitude Twin Helicopter (4 - 6 Seats)",
      "Midsize Aircraft with Oversized Cargo Hold",
    ],
    inclusions: [
      "Fast Air Transfer to Remote Ski Resorts, Mountain Peaks & Coastlines",
      "Specialized Cargo Capacity for Sports Gear, Ski Equipment & Diving Kits",
      "High-Altitude & Tough Terrain Landing Capabilities",
      "Rapid Response Dispatch for Time-Sensitive Sports Expeditions",
      "Team Entourage & Equipment Bulk Travel Coordination",
      "Emergency Standby & Return Flight Flexibility",
    ],
  },
  {
    id: "Wedding Charter",
    label: "Wedding Charter",
    badge: "DESTINATION WEDDINGS",
    tagline: "Group aircraft charters for destination weddings and family entourages.",
    aircraftTypes: [
      "Regional VIP Airliner (30 - 70 Seats)",
      "Commercial Group Charter (100 - 180 Seats)",
      "Super Midsize Jet (Bride & Groom Family)",
    ],
    inclusions: [
      "Dedicated Aircraft for Destination Weddings & Entourage Groups",
      "Custom Onboard Branding, Headrest Covers & Welcome Announcements",
      "Coordinated Group Luggage Handling & Traditional Welcome Gifts",
      "Multi-Tier Aircraft Options for VIP Bride/Groom Family & Guests",
      "Tarmac Group Transfers & Luxury Airport Hotel Coordination",
      "Flexible Schedules Matching Wedding Ceremonies & Muhurat Timings",
    ],
  },
  {
    id: "Air Ambulance Charter",
    label: "Air Ambulance Charter",
    badge: "AERO-MEDICAL ICU",
    tagline: "Dedicated ICU-equipped aircraft with specialized aero-medical doctors.",
    aircraftTypes: [
      "Critical Care ICU Jet (Stretcher + 2 Doctors + 2 Family)",
      "Pressurized Turboprop Air Ambulance (Stretcher + Medical Team)",
      "Aero-Medical Helicopter (Point-to-Hospital Transfer)",
    ],
    inclusions: [
      "Fully Certified ICU-Equipped Aircraft (Stretcher, Ventilator, Defibrillator, Oxygen)",
      "Critical Care Aviation Doctor & Specialized Paramedic Team Onboard",
      "Bedside-to-Bedside Medical Transport with Ground Ambulance Escort",
      "Rapid 2-Hour Medical Flight Clearance & Priority Air Traffic Handling",
      "Comprehensive Patient Pre-Flight Assessment & Hospital Handover",
      "Accommodating Family Escort & Medical Baggage in Cabin",
    ],
  },
];

function DedicatedAirCharterPage() {
  const navigate = useNavigate();
  const [selectedOptionId, setSelectedOptionId] = useState<CharterOptionId>(
    "Domestic and International Charter"
  );
  const [heroSlideIndex, setHeroSlideIndex] = useState<number>(0);

  const activeOption =
    CHARTER_OPTIONS.find((o) => o.id === selectedOptionId) || CHARTER_OPTIONS[0];

  // Progressive Step state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Step 1: Route & Schedule
  const [tripType, setTripType] = useState<"One Way" | "Round Trip" | "Multi-City">("One Way");
  const [origin, setOrigin] = useState("Delhi (DEL)");
  const [destination, setDestination] = useState("Mumbai (BOM)");
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
    if (optId === "Private Charter") {
      setHeroSlideIndex(1);
    }
    const match = CHARTER_OPTIONS.find((o) => o.id === optId);
    if (match) {
      setAircraftPreference(match.aircraftTypes[0]);
    }
  };

  const handleStep1Next = (e: React.FormEvent) => {
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

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !phone.trim()) {
      alert("Please provide your name and contact phone number.");
      return;
    }

    setIsSubmitting(true);
    const quoteRef = `AC-${Math.floor(100000 + Math.random() * 900000)}`;

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
      customer_name: clientName,
      country_code: "+91",
      phone: phone,
      email: email || `${phone.replace(/\D/g, "")}@shafsky.charter`,
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
      aircraft_preference: `${selectedOptionId} — ${aircraftPreference}`,
      travel_requirements: [selectedOptionId],
      special_requests: detailsSummary,
    };

    try {
      await charterApi.submitRequest(payload);
    } catch (err) {
      console.warn("Backend charter quotation submit:", err);
    } finally {
      setIsSubmitting(false);
      setSubmittedRef(quoteRef);
    }
  };

  const getWhatsAppDirectLink = () => {
    const text = `Hello Shafsky Aviation Charter Desk,%0A%0AI would like a quotation for Air Charter:%0A- Charter Option: ${selectedOptionId}%0A- Route: ${tripType} (${origin} -> ${destination})%0A- Departure: ${departDate} at ${departTime}${tripType === "Round Trip" ? `%0A- Return: ${returnDate} at ${returnTime}` : ""}%0A- Passengers: ${paxCount} Pax%0A- Aircraft Preference: ${aircraftPreference}%0A- Client Name: ${clientName}%0A- Phone: ${phone}%0A- Email: ${email || "N/A"}`;
    return `https://wa.me/919599087959?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-lime-200">
      {/* ─────────────────────────────────────────────────────────────
          1. COMPLETE HERO PHOTO & AIR CHARTER TITLE
          ───────────────────────────────────────────────────────────── */}
      <section className="relative px-4 pt-4 pb-8 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="mx-auto max-w-6xl">
          {/* Header Bar with Back Button & Breadcrumbs */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  navigate({ to: "/" });
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-lime-500 hover:text-lime-700 hover:bg-lime-50/50 shadow-sm transition-all cursor-pointer"
            >
              <ArrowLeft size={14} className="text-lime-600" />
              <span>Back</span>
            </button>

            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-lime-700 uppercase tracking-widest bg-lime-50 px-3.5 py-1.5 rounded-full border border-lime-200">
              <span className="w-2 h-2 rounded-full bg-lime-500 inline-block" />
              <span>VIP AVIATION & PRIVATE FLIGHT DESK</span>
            </div>
          </div>

          {/* Title & Short Existing Description */}
          <div className="text-center max-w-3xl mx-auto mb-6">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight"
              style={display}
            >
              Air <span className="text-lime-600">Charter</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
              On-demand executive private jets, twin helicopters, and specialized mission aircraft on your schedule.
            </p>
          </div>

          {/* Uncropped Landscape Hero Image Gallery: Slide 1 (Charter Fleet) & Slide 2 (home2.jpeg) */}
          <div className="space-y-3">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-md bg-slate-900 border border-slate-100 flex items-center justify-center min-h-[260px] sm:min-h-[400px]">
              <img
                src={heroSlideIndex === 0 ? HOMEPAGE_PHOTOS.privateCharter.src : jetTarmac}
                alt={
                  heroSlideIndex === 0
                    ? "Shafsky Private Jet and Helicopter Air Charter Fleet"
                    : "Shafsky Executive Private Jet on Tarmac at Sunset (home2)"
                }
                className="w-full h-auto object-contain object-center select-none block transition-opacity duration-300"
                loading="eager"
              />

              {/* Slide Navigation Overlay Buttons */}
              <div className="absolute inset-y-0 left-3 right-3 flex items-center justify-between pointer-events-none">
                <button
                  type="button"
                  onClick={() => setHeroSlideIndex((prev) => (prev === 0 ? 1 : 0))}
                  className="pointer-events-auto p-2 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md transition shadow-md cursor-pointer"
                  aria-label="Previous photo"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setHeroSlideIndex((prev) => (prev === 1 ? 0 : 1))}
                  className="pointer-events-auto p-2 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md transition shadow-md cursor-pointer"
                  aria-label="Next photo"
                >
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Photo Caption Badge */}
              <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1 rounded-full border border-white/10 shadow-sm">
                {heroSlideIndex === 0 ? "1/2 • Shafsky Air Charter Fleet" : "2/2 • Executive Private Jet on Tarmac at Sunset"}
              </div>
            </div>

            {/* 2-Slide Thumbnail / Pill Selectors */}
            <div className="flex items-center justify-center gap-3 pt-1">
              {[
                { label: "Air Charter Fleet" },
                { label: "Private Jet Tarmac (home2)" },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setHeroSlideIndex(idx)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-mono font-bold transition cursor-pointer ${
                    heroSlideIndex === idx
                      ? "bg-lime-500 text-slate-950 border-lime-600 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-lime-400 hover:bg-lime-50/50"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${heroSlideIndex === idx ? "bg-slate-950" : "bg-slate-300"}`} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. 10 AIR CHARTER OPTIONS SELECTOR
          ───────────────────────────────────────────────────────────── */}
      <section className="py-8 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-lime-700 bg-lime-50 px-3 py-1 rounded-full border border-lime-200">
              SELECT CHARTER CATEGORY
            </span>
          </div>

          {/* 10 Option Buttons */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {CHARTER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  selectedOptionId === opt.id
                    ? "bg-lime-500 text-slate-950 shadow-md ring-2 ring-lime-400 border border-lime-600"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-lime-400 hover:bg-lime-50/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. SELECTED CHARTER REQUEST PANEL (Tailored Quotation Flow)
          ───────────────────────────────────────────────────────────── */}
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
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              {activeOption.tagline}
            </p>
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
                          placeholder="e.g. Delhi (DEL) / Mumbai (BOM)"
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
                          placeholder="e.g. Goa (GOI) / Dubai (DXB)"
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
                  {selectedOptionId === "Helicopter Charter" && (
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Helipad / Rooftop Landing Zone Name or Coordinates
                      </label>
                      <input
                        type="text"
                        value={helipadLocation}
                        onChange={(e) => setHelipadLocation(e.target.value)}
                        placeholder="e.g. Mahalaxmi Racecourse / Private Resort Helipad"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  )}

                  {selectedOptionId === "Corporate Charter" && (
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Company Name & Roadshow Details
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Goldman Sachs India / Multi-City Delegation"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  )}

                  {selectedOptionId === "Air Ambulance Charter" && (
                    <div className="space-y-4 p-4 rounded-xl bg-red-50/50 border border-red-200">
                      <div>
                        <label className="block text-xs font-mono font-bold text-red-900 uppercase tracking-wider mb-1.5">
                          Patient Medical Condition / Diagnosis
                        </label>
                        <input
                          type="text"
                          value={patientCondition}
                          onChange={(e) => setPatientCondition(e.target.value)}
                          placeholder="e.g. Cardiac Monitoring / Trauma / Ventilator Required"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-red-300 text-sm font-medium focus:outline-none focus:border-red-500 bg-white"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono font-bold text-slate-700 uppercase">Stretcher Required:</span>
                        {(["Yes", "No"] as const).map((opt) => (
                          <label key={opt} className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                            <input
                              type="radio"
                              name="stretcher"
                              value={opt}
                              checked={stretcherNeeded === opt}
                              onChange={() => setStretcherNeeded(opt)}
                              className="accent-lime-600"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedOptionId === "Wedding Charter" && (
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Wedding Destination Venue & Entourage Baggage Notes
                      </label>
                      <input
                        type="text"
                        value={weddingDestination}
                        onChange={(e) => setWeddingDestination(e.target.value)}
                        placeholder="e.g. Udaipur Palace / Excess Wedding Gifts & Wardrobe"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  )}

                  {selectedOptionId === "Pilgrim Charter" && (
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Sacred Shrines / Chardham / Kedarnath Sector Details
                      </label>
                      <input
                        type="text"
                        value={pilgrimageSector}
                        onChange={(e) => setPilgrimageSector(e.target.value)}
                        placeholder="e.g. Kedarnath - Badrinath Same Day / Tirupati VIP"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  )}

                  {/* Special Inflight & Catering Requests */}
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Special Inflight, Catering or Tarmac Requests
                    </label>
                    <textarea
                      rows={2}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="e.g. Specific gourmet catering, pet in cabin, armed security escort..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                    />
                  </div>

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
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
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
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
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
                      placeholder="e.g. contact@domain.com"
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

      {/* ─────────────────────────────────────────────────────────────
          4. COMPANY CATALOG CONTENT & SPECIFICATIONS
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.4em] text-lime-700 font-bold font-mono bg-lime-50 px-3.5 py-1 rounded-full border border-lime-200">
              <span>COMPANY CATALOG SPECIFICATIONS</span>
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-950 tracking-tight" style={display}>
              Air Charter Inclusions.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Authoritative aircraft capabilities, airside handling, and flight protocol.
            </p>
          </div>

          {/* Clean Full-Width Inclusions Showcase */}
          <div className="bg-slate-50/60 rounded-3xl border border-slate-200/90 p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-200 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-lime-700 font-mono font-bold mb-1">
                  <span className="w-2 h-2 rounded-full bg-lime-500 inline-block" />
                  {activeOption.badge}
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0a196f] tracking-tight" style={display}>
                  {activeOption.id}
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 self-start sm:self-auto">
                {activeOption.inclusions.length} Inclusions Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeOption.inclusions.map((inc, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3.5 rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs hover:border-lime-400 transition-colors"
                >
                  <CheckCircle2 size={18} className="text-lime-600 shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-[14.5px] font-semibold text-slate-900 leading-snug">
                    {inc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
