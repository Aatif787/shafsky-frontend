import React from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { display } from "@/components/home/theme";
import { HOMEPAGE_PHOTOS } from "@/lib/homepage-photos";
import jetTarmac from "@/assets/homepage/home2.jpeg";

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

export interface CharterOptionDef {
  id: CharterOptionId;
  label: string;
  badge: string;
  tagline: string;
  inclusions: string[];
  aircraftTypes: string[];
}

export const CHARTER_OPTIONS: CharterOptionDef[] = [
  {
    id: "Domestic and International Charter",
    label: "Domestic & International",
    badge: "GLOBAL FLIGHTS",
    tagline: "",
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
    tagline: "Executive travel for leadership teams, corporate boards, and multi-city business tours.",
    aircraftTypes: [
      "Super Midsize Jet (8 - 10 Seats)",
      "Heavy Executive Jet (12 - 14 Seats)",
      "Corporate Shuttle Turboprop (19 - 30 Seats)",
    ],
    inclusions: [
      "Executive Business Travel for Leadership Teams, C-Suite & Delegations",
      "Multi-City Business Tour Flight Management & On-Demand Route Flexibility",
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
      "Pet-Friendly Aircraft Cabins & Flexible Luggage Allowances",
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
      "Ultra-Discreet VVIP Aviation with Complete Privacy",
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

export interface CharterHeroSlide {
  type: "video" | "image";
  src: string;
  alt: string;
  badge: string;
  label: string;
}

export const CHARTER_HERO_SLIDES: CharterHeroSlide[] = [
  {
    type: "video",
    src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_091828_e240eb17-6edc-4129-ad9d-98678e3fd238.mp4",
    alt: "Shafsky Private Jet In-Flight Aerial Cinematic Video Animation",
    badge: "1/4 • Private Jet In-Flight Video Animation",
    label: "In-Flight Video",
  },
  {
    type: "image",
    src: HOMEPAGE_PHOTOS.privateCharter.src,
    alt: "Shafsky Private Jet and Helicopter Private Charter Fleet",
    badge: "2/4 • Shafsky Private Charter Fleet",
    label: "Private Charter Fleet",
  },
  {
    type: "image",
    src: jetTarmac,
    alt: "Shafsky Executive Private Jet on Tarmac at Sunset",
    badge: "3/4 • Executive Private Jet on Tarmac at Sunset",
    label: "Private Jet Tarmac",
  },
  {
    type: "image",
    src: "/images/charter/luxury-cabin.webp",
    alt: "Shafsky Ultra-Luxury Private Jet Executive VIP Cabin",
    badge: "4/4 • Ultra-Luxury Executive VIP Cabin",
    label: "VIP Luxury Cabin",
  },
];

export function AviationHeroStage({
  onBack,
  videoRef,
  heroSlideIndex,
  setHeroSlideIndex,
  isDragging,
  dragOffset,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
}: {
  onBack: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  heroSlideIndex: number;
  setHeroSlideIndex: React.Dispatch<React.SetStateAction<number>>;
  isDragging: boolean;
  dragOffset: number;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
}) {
  return (
    <section className="relative w-full overflow-hidden bg-white border-b border-slate-200 py-6 sm:py-8 md:py-10">
      <div className="relative z-10 mx-auto w-full max-w-[1040px] xl:max-w-[1100px] 2xl:max-w-[1140px] px-4 sm:px-6 md:px-8">
        {/* Top Header Row: Back Button & VIP Aviation Desk Status Badge */}
        <div className="w-full mb-3.5 sm:mb-5 flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/90 text-xs font-semibold shadow-xs hover:border-lime-500 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} className="text-lime-600" />
            <span>Back</span>
          </button>

          <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-mono font-bold text-lime-800 uppercase tracking-widest bg-lime-50 px-3.5 sm:px-4 py-1.5 rounded-full border border-lime-300 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-lime-500 inline-block animate-pulse" />
            <span>VIP AVIATION & PRIVATE FLIGHT DESK</span>
          </div>
        </div>

        {/* Framed Media Container with Strict 16:9 Aspect Ratio (100% Full Ratio, ZERO CROP) */}
        <div
          className="relative w-full aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 ring-1 ring-slate-100 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.08)] bg-white flex items-center justify-center select-none cursor-grab active:cursor-grabbing touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Swipeable Track */}
          <div
            className={`flex w-full h-full absolute inset-0 ${isDragging ? "transition-none" : "transition-transform duration-500 ease-out"}`}
            style={{
              transform: `translateX(calc(-${heroSlideIndex * 100}% + ${dragOffset}px))`,
            }}
          >
            {CHARTER_HERO_SLIDES.map((slide, idx) => (
              <div
                key={idx}
                className="w-full h-full shrink-0 relative flex items-center justify-center overflow-hidden bg-white"
              >
                {slide.type === "video" ? (
                  <>
                    <video
                      ref={videoRef}
                      src={slide.src}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-contain object-center select-none pointer-events-none bg-white"
                      aria-label={slide.alt}
                    />

                    {/* Atmospheric Cloud Density Reducer */}
                    <div
                      className="absolute inset-0 pointer-events-none select-none mix-blend-multiply opacity-45"
                      style={{
                        background:
                          "radial-gradient(ellipse at 46% 26%, rgba(135, 175, 215, 0.8) 0%, rgba(175, 205, 235, 0.4) 45%, transparent 75%)",
                      }}
                    />
                  </>
                ) : (
                  <img
                    width={1600}
                    height={900}
                    src={slide.src}
                    alt={slide.alt}
                    className="w-full h-full object-contain object-center select-none block pointer-events-none bg-white"
                    loading={idx <= 1 ? "eager" : "lazy"}
                    draggable={false}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Slide Navigation Overlay Buttons */}
          <div className="absolute inset-y-0 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between pointer-events-none z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setHeroSlideIndex((prev) => (prev - 1 + CHARTER_HERO_SLIDES.length) % CHARTER_HERO_SLIDES.length);
              }}
              className="pointer-events-auto p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 backdrop-blur-md transition shadow-md cursor-pointer border border-slate-200 hover:border-lime-500 hover:text-lime-700"
              aria-label="Previous slide"
            >
              <ArrowLeft size={16} className="sm:hidden text-slate-800" />
              <ArrowLeft size={18} className="hidden sm:block text-slate-800" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setHeroSlideIndex((prev) => (prev + 1) % CHARTER_HERO_SLIDES.length);
              }}
              className="pointer-events-auto p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 backdrop-blur-md transition shadow-md cursor-pointer border border-slate-200 hover:border-lime-500 hover:text-lime-700"
              aria-label="Next slide"
            >
              <ArrowRight size={16} className="sm:hidden text-slate-800" />
              <ArrowRight size={18} className="hidden sm:block text-slate-800" />
            </button>
          </div>
        </div>

        {/* Slide Pagination Indicator Dots Below the Frame */}
        <div className="mt-3 sm:mt-4 flex items-center justify-center">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
            {CHARTER_HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHeroSlideIndex(idx);
                }}
                className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                  heroSlideIndex === idx ? "w-5 sm:w-7 bg-lime-500" : "w-1.5 sm:w-2 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function AviationCategorySelector({
  selectedOptionId,
  handleSelectOption,
}: {
  selectedOptionId: CharterOptionId;
  handleSelectOption: (optId: CharterOptionId) => void;
}) {
  return (
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
  );
}

export function AviationOptionSpecificFields({
  selectedOptionId,
  helipadLocation,
  setHelipadLocation,
  companyName,
  setCompanyName,
  patientCondition,
  setPatientCondition,
  stretcherNeeded,
  setStretcherNeeded,
  weddingDestination,
  setWeddingDestination,
  pilgrimageSector,
  setPilgrimageSector,
  specialRequests,
  setSpecialRequests,
}: {
  selectedOptionId: CharterOptionId;
  helipadLocation: string;
  setHelipadLocation: (v: string) => void;
  companyName: string;
  setCompanyName: (v: string) => void;
  patientCondition: string;
  setPatientCondition: (v: string) => void;
  stretcherNeeded: "Yes" | "No";
  setStretcherNeeded: (v: "Yes" | "No") => void;
  weddingDestination: string;
  setWeddingDestination: (v: string) => void;
  pilgrimageSector: string;
  setPilgrimageSector: (v: string) => void;
  specialRequests: string;
  setSpecialRequests: (v: string) => void;
}) {
  return (
    <>
      {selectedOptionId === "Helicopter Charter" && (
        <div>
          <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Helipad / Rooftop Landing Zone Name or Coordinates
          </label>
          <input
            type="text"
            value={helipadLocation}
            onChange={(e) => setHelipadLocation(e.target.value)}
            placeholder="Helipad name, resort, or landing coordinates"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
          />
        </div>
      )}

      {selectedOptionId === "Corporate Charter" && (
        <div>
          <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Company Name & Purpose of Travel
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company name, corporate event, or meeting itinerary"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
          />
        </div>
      )}

      {selectedOptionId === "Air Ambulance Charter" && (
        <div className="space-y-4 p-4 rounded-xl bg-red-50/50 border border-red-200">
          {/* Air Ambulance Dedicated Info Header */}
          <div className="p-3 bg-red-900/90 rounded-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono shadow-xs">
            <span className="font-bold flex items-center gap-1.5">
              <span>🚑</span>
              <span>Aero-Medical Critical Care ICU Aircraft</span>
            </span>
            <span className="text-red-200">Certified Stretcher & Aviation Doctor</span>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-red-900 uppercase tracking-wider mb-1.5">
              Patient Medical Condition / Diagnosis
            </label>
            <input
              type="text"
              value={patientCondition}
              onChange={(e) => setPatientCondition(e.target.value)}
              placeholder="Patient medical diagnosis and ICU equipment requirements"
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
            placeholder="Wedding venue and entourage luggage details"
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
            placeholder="Pilgrimage shrines and sector details"
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
          placeholder="Inflight catering preferences, pet travel, armed security escort, or tarmac requests..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
        />
      </div>
    </>
  );
}

export function AviationSpecificationsSection({
  activeOption,
}: {
  activeOption: CharterOptionDef;
}) {
  return (
    <section className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.4em] text-lime-700 font-bold font-mono bg-lime-50 px-3.5 py-1 rounded-full border border-lime-200">
            <span>FLEET & SERVICE SPECIFICATIONS</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-950 tracking-tight" style={display}>
            Private Charter Inclusions.
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Comprehensive aircraft capabilities, ground handling, and flight details.
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

          {activeOption.id === "Private Charter" && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-amber-200/80 shadow-sm bg-slate-900">
              <img
                width={1600}
                height={900}
                loading="lazy"
                decoding="async"
                src="/images/charter/luxury-cabin.webp"
                alt="Shafsky Ultra-Luxury Private Jet Executive VIP Cabin"
                className="w-full h-56 sm:h-72 object-cover object-center"
              />
            </div>
          )}

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
  );
}
