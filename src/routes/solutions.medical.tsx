import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  Sparkles,
  Send,
  CheckCircle2,
  MessageSquare,
  FileText,
  Compass,
  Baby,
  HeartHandshake,
  Clock,
} from "lucide-react";
import { display, mono } from "@/components/home/theme";
import { HOMEPAGE_PHOTOS } from "@/lib/homepage-photos";
import home3Img from "@/assets/homepage/home3.jpeg";
import specialSerImg from "@/assets/others/specialser.png";
import dutyImg from "@/assets/homepage/duty.jpeg";
import wheelImg from "@/assets/homepage/wheel.jpeg";
import vvipImg from "@/assets/homepage/vvip.jpeg";
import greetImg from "@/assets/homepage/greet.jpeg";

export const Route = createFileRoute("/solutions/medical")({
  head: () => ({
    meta: [
      { title: "Special Services & Bespoke Concierge — Shafsky Aviation" },
      {
        name: "description",
        content:
          "Specialized passenger care, armed close protection officers, visa facilitation, sightseeing guides, infant care, and dignified cargo repatriation.",
      },
    ],
  }),
  component: DedicatedSpecialServicesPage,
});

export type SpecialServiceOptionId =
  | "Tours & Travel"
  | "Passport & VISA"
  | "PSO (Personal Security Officer)"
  | "Sightseeing & Guide"
  | "Infant Care"
  | "Human Remains by Cargo";

interface SpecialServiceOptionDef {
  id: SpecialServiceOptionId;
  label: string;
  badge: string;
  tagline: string;
  inclusions: string[];
}

const SPECIAL_SERVICES_OPTIONS: SpecialServiceOptionDef[] = [
  {
    id: "Tours & Travel",
    label: "Tours & Travel",
    badge: "CURATED EXPEDITIONS & VACATIONS",
    tagline: "Curated luxury vacations, bespoke holiday circuits, and private destination itineraries.",
    inclusions: [
      "Tailored Luxury Tour Circuits & Private Itinerary Curation",
      "Dedicated Destination Concierge & On-Ground Support",
      "Private Aircraft & Luxury Ground Fleet Harmonization",
      "Exclusive Access to Heritage Sites, Private Islands & Reserves",
      "5-Star & Heritage Palace Accommodations Coordination",
      "24/7 Global Travel Concierge Desk Assistance",
    ],
  },
  {
    id: "Passport & VISA",
    label: "Passport & VISA",
    badge: "EMBASSY CLEARANCE & DOCUMENTATION",
    tagline: "Expedited visa facilitation, diplomatic consular liaison, and emergency passport assistance.",
    inclusions: [
      "Priority Diplomatic & Commercial Visa Application Processing",
      "Consular Liaison & Embassy Clearance Assistance",
      "Expedited Tourist, Business, and Medical Visa Filings",
      "Comprehensive Documentation Audit & Biometric Appointment Scheduling",
      "Fast-Track International Passport Services & Renewal Support",
      "Confidential Document Handling & Direct Courier Dispatch",
    ],
  },
  {
    id: "PSO (Personal Security Officer)",
    label: "PSO (Personal Security Officer)",
    badge: "CLOSE PROTECTION & ARMED ESCORT",
    tagline: "Armed and unarmed close protection security details for high-profile VIPs, dignitaries, and families.",
    inclusions: [
      "Ex-Military & Special Forces Certified Security Personnel",
      "Armed and Unarmed Close Protection Officers (PSO)",
      "Discreet VIP Route Reconnaissance & Threat Assessment",
      "Secure Airport Tarmac & Hotel Convoy Coordination",
      "Crowd Management & Confidential Manifest Protection",
      "24/7 Command Control Center Monitoring",
    ],
  },
  {
    id: "Sightseeing & Guide",
    label: "Sightseeing & Guide",
    badge: "HERITAGE & MULTI-LINGUAL EXPERTS",
    tagline: "Private licensed heritage guides, multi-lingual interpreters, and VIP cultural experiences.",
    inclusions: [
      "Licensed National Heritage & Monument Tour Experts",
      "Multi-Lingual Guides (English, French, German, Russian, Arabic, Japanese, Spanish)",
      "Priority Queue Skipping & VIP Entry to World Heritage Sites",
      "Private Chauffeured Sightseeing Fleet with Knowledgeable Driver",
      "Customized Educational & Cultural Immersion Programs",
      "Curated Culinary & Artisan City Walks",
    ],
  },
  {
    id: "Infant Care",
    label: "Infant Care",
    badge: "MOTHER & INFANT TRANSIT CARE",
    tagline: "Dedicated infant transit care, stroller management, and specialized assistance for traveling mothers.",
    inclusions: [
      "Dedicated Airside Assistant for Traveling Mothers with Infants",
      "Complimentary Airport Stroller & Pram Coordination",
      "Priority Family Security Screening & Boarding Assistance",
      "Access to Airport Baby Care Rooms & Nursing Sanctuaries",
      "Infant Luggage, Diaper Bag & Stroller Porterage Service",
      "Direct Aerobridge and Curbside Seamless Escort",
    ],
  },
  {
    id: "Human Remains by Cargo",
    label: "Human Remains by Cargo",
    badge: "DIGNIFIED REPATRIATION LOGISTICS",
    tagline: "Dignified, discreet repatriation logistics, embalming certification, embassy clearances, and air cargo transit.",
    inclusions: [
      "Complete Repatriation Logistics & Coordination with Airlines",
      "Embalming Certification & Hermetically Sealed Zinc Casket Management",
      "Embassy NOC, Municipal Death Certificate & Police Clearance Support",
      "Air Cargo Space Booking on Priority International & Domestic Flights",
      "Dignified Airside Transfer & Ground Ambulance Escort",
      "Compassionate 24/7 Family Liaison & Customs Clearance Desk",
    ],
  },
];

function DedicatedSpecialServicesPage() {
  const navigate = useNavigate();
  const [selectedOptionId, setSelectedOptionId] = useState<SpecialServiceOptionId>("Tours & Travel");

  const activeOption =
    SPECIAL_SERVICES_OPTIONS.find((o) => o.id === selectedOptionId) ||
    SPECIAL_SERVICES_OPTIONS[0];

  // Option-specific form states
  // Tours & Travel
  const [tourDestination, setTourDestination] = useState("Rajasthan Heritage Circuit");
  const [tourStartDate, setTourStartDate] = useState("");
  const [tourEndDate, setTourEndDate] = useState("");
  const [tourGuests, setTourGuests] = useState(2);
  const [tourRequirements, setTourRequirements] = useState("");

  // Passport & VISA
  const [visaCountry, setVisaCountry] = useState("United States (US B1/B2) / UK / Schengen");
  const [visaType, setVisaType] = useState("Tourist / Business Visa");
  const [visaApplicants, setVisaApplicants] = useState(1);
  const [visaUrgency, setVisaUrgency] = useState<"Standard" | "Express (3 - 5 Days)" | "Emergency (24 - 48 Hours)">("Standard");

  // PSO
  const [psoDates, setPsoDates] = useState("");
  const [psoLocation, setPsoLocation] = useState("New Delhi / Mumbai");
  const [psoVipCount, setPsoVipCount] = useState(1);
  const [psoRequirements, setPsoRequirements] = useState("Armed Close Protection Officer (Ex-Special Forces)");

  // Sightseeing & Guide
  const [guideDestination, setGuideDestination] = useState("Agra (Taj Mahal) / Delhi / Jaipur");
  const [guideDate, setGuideDate] = useState("");
  const [guidePartySize, setGuidePartySize] = useState(2);
  const [guideLanguage, setGuideLanguage] = useState("English");

  // Infant Care
  const [infantAge, setInfantAge] = useState("6 Months");
  const [infantTravelDate, setInfantTravelDate] = useState("");
  const [infantAirport, setInfantAirport] = useState("Delhi Airport (DEL) T3");
  const [infantAssistance, setInfantAssistance] = useState("Stroller + Aerobridge Escort + Boarding Priority");

  // Human Remains by Cargo
  const [humOrigin, setHumOrigin] = useState("Mumbai (BOM)");
  const [humDestination, setHumDestination] = useState("London (LHR) / Dubai (DXB)");
  const [humTimeline, setHumTimeline] = useState("Immediate Next Available Flight");
  const [humPermits, setHumPermits] = useState("Complete documentation required (Embalming, Embassy NOC, Cargo booking)");

  // Contact details
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !phone.trim()) {
      alert("Please provide your name and contact phone number.");
      return;
    }

    setIsSubmitting(true);
    const quoteRef = `SS-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch (err) {
      console.warn("Special service inquiry submission:", err);
    } finally {
      setIsSubmitting(false);
      setSubmittedRef(quoteRef);
    }
  };

  const getWhatsAppDirectLink = () => {
    let details = "";
    if (selectedOptionId === "Tours & Travel") {
      details = `Destination: ${tourDestination}%0ADates: ${tourStartDate} to ${tourEndDate}%0AGuests: ${tourGuests}%0ARequirements: ${tourRequirements || "None"}`;
    } else if (selectedOptionId === "Passport & VISA") {
      details = `Country: ${visaCountry}%0AVisa Type: ${visaType}%0AApplicants: ${visaApplicants}%0AUrgency: ${visaUrgency}`;
    } else if (selectedOptionId === "PSO (Personal Security Officer)") {
      details = `Duration/Dates: ${psoDates}%0ALocation: ${psoLocation}%0AVIPs: ${psoVipCount}%0ARequirements: ${psoRequirements}`;
    } else if (selectedOptionId === "Sightseeing & Guide") {
      details = `Destination: ${guideDestination}%0ADate: ${guideDate}%0AParty Size: ${guidePartySize}%0ALanguage: ${guideLanguage}`;
    } else if (selectedOptionId === "Infant Care") {
      details = `Child Age: ${infantAge}%0ATravel Date: ${infantTravelDate}%0AAirport: ${infantAirport}%0AAssistance: ${infantAssistance}`;
    } else if (selectedOptionId === "Human Remains by Cargo") {
      details = `Origin: ${humOrigin}%0ADestination: ${humDestination}%0ATimeline: ${humTimeline}%0APermits: ${humPermits}`;
    }

    const text = `Hello Shafsky Special Services Desk,%0A%0AI would like to request assistance for:%0A- Service: ${selectedOptionId}%0A${details}%0A- Client Name: ${clientName}%0A- Phone: ${phone}%0A- Email: ${email || "N/A"}`;
    return `https://wa.me/919599087959?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-lime-200">
      {/* ─────────────────────────────────────────────────────────────
          1. COMPLETE HERO PHOTO & SPECIAL SERVICES TITLE
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
              <span>SPECIAL CONCIERGE & SECURITY MISSIONS</span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="text-center max-w-3xl mx-auto mb-6">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight"
              style={display}
            >
              Special <span className="text-lime-600">Services</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Specialized passenger care, armed close protection officers, bespoke destination planning, and cargo repatriation.
            </p>
          </div>

          {/* Full Original Special Services Photo (16:9 Landscape - Zero Cropping) */}
          <div className="relative w-full overflow-hidden rounded-2xl shadow-md bg-white border border-slate-100">
            <img
              src={specialSerImg}
              alt="Shafsky Special Services Destination & Milestone Celebration"
              className="w-full h-auto object-contain object-center select-none block"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. 6 SPECIAL SERVICES OPTIONS SELECTOR
          ───────────────────────────────────────────────────────────── */}
      <section className="py-8 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-lime-700 bg-lime-50 px-3 py-1 rounded-full border border-lime-200">
              SELECT SPECIALIZED SERVICE
            </span>
          </div>

          {/* 6 Option Buttons */}
          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            {SPECIAL_SERVICES_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
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
          3. OPTION-SPECIFIC REQUEST PANEL
          ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-slate-50/60 border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Active Option Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-lime-700 mb-2">
              <Sparkles size={13} className="text-lime-600" />
              <span>{activeOption.badge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950" style={display}>
              {activeOption.id} Request
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              {activeOption.tagline}
            </p>
          </div>

          {/* Success State / Reference Card */}
          {submittedRef ? (
            <div className="bg-white rounded-3xl border border-lime-400 p-8 sm:p-12 text-center shadow-lg">
              <div className="w-16 h-16 rounded-full bg-lime-100 border border-lime-300 flex items-center justify-center mx-auto mb-4 text-lime-700">
                <CheckCircle2 size={32} />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-lime-700">
                SPECIAL SERVICE REQUEST DISPATCHED
              </span>
              <h3 className="text-3xl font-extrabold text-slate-950 mt-1 mb-2" style={display}>
                Reference #{submittedRef}
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                Your request for <strong className="text-slate-900">{selectedOptionId}</strong> has been received by the Shafsky Special Missions Desk.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={getWhatsAppDirectLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs font-mono tracking-wider shadow-md transition-all"
                >
                  <MessageSquare size={15} />
                  <span>Open WhatsApp Missions Desk</span>
                </a>
                <button
                  onClick={() => setSubmittedRef(null)}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs font-mono tracking-wider transition-all"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-md">
              <form onSubmit={handleSubmitRequest} className="space-y-6">
                {/* 1. Tours & Travel Form */}
                {selectedOptionId === "Tours & Travel" && (
                  <>
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Destination / Desired Vacation Circuit
                      </label>
                      <input
                        type="text"
                        value={tourDestination}
                        onChange={(e) => setTourDestination(e.target.value)}
                        placeholder="e.g. Rajasthan Heritage Palaces / Kashmir Mountain Circuit / Kerala Backwaters"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={tourStartDate}
                          onChange={(e) => setTourStartDate(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={tourEndDate}
                          onChange={(e) => setTourEndDate(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Number of Guests
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={tourGuests}
                          onChange={(e) => setTourGuests(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Tour Requirements & Preferences
                      </label>
                      <textarea
                        rows={2}
                        value={tourRequirements}
                        onChange={(e) => setTourRequirements(e.target.value)}
                        placeholder="e.g. Private jet connections, palace villa bookings, private chef, licensed multi-lingual guide..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  </>
                )}

                {/* 2. Passport & VISA Form */}
                {selectedOptionId === "Passport & VISA" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Destination Country
                        </label>
                        <input
                          type="text"
                          value={visaCountry}
                          onChange={(e) => setVisaCountry(e.target.value)}
                          placeholder="e.g. USA / United Kingdom / Schengen (France, Germany) / UAE"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Visa Category
                        </label>
                        <input
                          type="text"
                          value={visaType}
                          onChange={(e) => setVisaType(e.target.value)}
                          placeholder="e.g. Tourist Visa / Business Visa / Diplomatic / Medical Visa"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Number of Applicants
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={visaApplicants}
                          onChange={(e) => setVisaApplicants(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Processing Urgency
                        </label>
                        <select
                          value={visaUrgency}
                          onChange={(e: any) => setVisaUrgency(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                        >
                          <option value="Standard">Standard Submission</option>
                          <option value="Express (3 - 5 Days)">Express Facilitation (3 - 5 Days)</option>
                          <option value="Emergency (24 - 48 Hours)">Emergency Expedited (24 - 48 Hours)</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* 3. PSO (Personal Security Officer) Form */}
                {selectedOptionId === "PSO (Personal Security Officer)" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Required Dates / Duration
                        </label>
                        <input
                          type="text"
                          value={psoDates}
                          onChange={(e) => setPsoDates(e.target.value)}
                          placeholder="e.g. 15 Oct to 20 Oct (5 Days continuous 24/7)"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Deployment Location & City
                        </label>
                        <input
                          type="text"
                          value={psoLocation}
                          onChange={(e) => setPsoLocation(e.target.value)}
                          placeholder="e.g. New Delhi & Airport Escort / Mumbai / International"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Number of Protected VIPs / Family
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={psoVipCount}
                          onChange={(e) => setPsoVipCount(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Security Escort Requirement
                        </label>
                        <input
                          type="text"
                          value={psoRequirements}
                          onChange={(e) => setPsoRequirements(e.target.value)}
                          placeholder="e.g. Armed PSO (Ex-Special Forces), Armored Convoy, Airport Airside Escort"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* 4. Sightseeing & Guide Form */}
                {selectedOptionId === "Sightseeing & Guide" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Sightseeing Destination / Monuments
                        </label>
                        <input
                          type="text"
                          value={guideDestination}
                          onChange={(e) => setGuideDestination(e.target.value)}
                          placeholder="e.g. Agra (Taj Mahal & Agra Fort) / Delhi Heritage Sites / Jaipur"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Sightseeing Date
                        </label>
                        <input
                          type="date"
                          value={guideDate}
                          onChange={(e) => setGuideDate(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Party Size (Guests)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={40}
                          value={guidePartySize}
                          onChange={(e) => setGuidePartySize(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Guide Language Preference
                        </label>
                        <input
                          type="text"
                          value={guideLanguage}
                          onChange={(e) => setGuideLanguage(e.target.value)}
                          placeholder="e.g. English / French / German / Russian / Arabic / Spanish"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* 5. Infant Care Form */}
                {selectedOptionId === "Infant Care" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Child Age / Details
                        </label>
                        <input
                          type="text"
                          value={infantAge}
                          onChange={(e) => setInfantAge(e.target.value)}
                          placeholder="e.g. 6 Months (Infant) / 2 Years (Toddler)"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Date of Travel
                        </label>
                        <input
                          type="date"
                          value={infantTravelDate}
                          onChange={(e) => setInfantTravelDate(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Airport & Terminal
                        </label>
                        <input
                          type="text"
                          value={infantAirport}
                          onChange={(e) => setInfantAirport(e.target.value)}
                          placeholder="e.g. Delhi (DEL) T3 / Mumbai (BOM) T2"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Required Care Assistance
                        </label>
                        <input
                          type="text"
                          value={infantAssistance}
                          onChange={(e) => setInfantAssistance(e.target.value)}
                          placeholder="e.g. Stroller loan, airside porter, baby lounge access, aerobridge escort"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* 6. Human Remains by Cargo Form */}
                {selectedOptionId === "Human Remains by Cargo" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Departure City & Airport (Origin)
                        </label>
                        <input
                          type="text"
                          value={humOrigin}
                          onChange={(e) => setHumOrigin(e.target.value)}
                          placeholder="e.g. Mumbai (BOM) / New Delhi (DEL)"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Destination City & Country
                        </label>
                        <input
                          type="text"
                          value={humDestination}
                          onChange={(e) => setHumDestination(e.target.value)}
                          placeholder="e.g. London (LHR), UK / Dubai (DXB), UAE"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Required Timeline
                        </label>
                        <input
                          type="text"
                          value={humTimeline}
                          onChange={(e) => setHumTimeline(e.target.value)}
                          placeholder="e.g. Immediate next available flight / Within 24-48 hours"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Permits & Documentation Status
                        </label>
                        <input
                          type="text"
                          value={humPermits}
                          onChange={(e) => setHumPermits(e.target.value)}
                          placeholder="e.g. Embalming required, Embassy NOC assistance needed"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Contact Information */}
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-lime-700 block mb-3">
                    Contact Details for Service Confirmation
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Sameer Verma"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Phone / WhatsApp</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. guest@domain.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs font-mono tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send size={14} />
                    <span>{isSubmitting ? "Dispatching..." : `Request ${selectedOptionId}`}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. COMPANY CATALOG CONTENT & UNCOPPED GALLERY
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.4em] text-lime-700 font-bold font-mono bg-lime-50 px-3.5 py-1 rounded-full border border-lime-200">
              <span>COMPANY CATALOG SPECIFICATIONS</span>
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-950 tracking-tight" style={display}>
              Mission Specifications & Inclusions.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Authoritative close protection, visa facilitation, curated tours, and cargo repatriation protocols.
            </p>
          </div>

          {/* 2-Column Balanced Editorial Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* Left Column: Option Title & Exact Inclusions List */}
            <div className="lg:col-span-6 flex flex-col justify-start">
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-lime-700 font-mono font-bold mb-3">
                <span className="w-2 h-2 rounded-full bg-lime-500 inline-block" />
                {activeOption.badge}
              </div>

              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0a196f] tracking-tight mb-6" style={display}>
                {activeOption.id}
              </h3>

              <div className="space-y-4">
                {activeOption.inclusions.map((inc, i) => (
                  <div key={i} className="flex items-start gap-3.5 text-sm sm:text-[15px] text-slate-900 leading-snug">
                    <span className="text-slate-900 font-bold text-xl leading-none mt-0.5">•</span>
                    <span className="font-semibold text-slate-900">{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Original Aspect Ratio Uncropped Gallery */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { src: home3Img, alt: "Destination & Occasion VIP Concierge" },
                  { src: dutyImg, alt: "Personal Duty Free & Shopping Assistant" },
                  { src: wheelImg, alt: "Special Care & Infant Assistance Escort" },
                  { src: vvipImg, alt: "VVIP Protocol & Armed Escort Reception" },
                ].map((img, idx) => (
                  <div
                    key={idx}
                    className="w-full rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 bg-white group hover:border-lime-400 transition-all"
                  >
                    <div className="w-full bg-slate-50 overflow-hidden flex items-center justify-center">
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-auto object-contain object-center select-none block group-hover:scale-102 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-3 bg-white border-t border-slate-100">
                      <span className="text-[11px] font-mono font-bold text-slate-800 tracking-wide block">
                        {img.alt}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
