import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft, Sparkles,
  Send,
  CheckCircle2,
  MessageSquare
} from "lucide-react";
import { display } from "@/components/home/theme";
import { enquiryApi } from "@/lib/api/enquiryApi";
import spaWellnessImg from "@/assets/others/spa-wellness.jpg";
import toursTravelImg from "@/assets/others/tours-travel.jpg";
import psoSecurityImg from "@/assets/others/pso-security.jpg";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/solutions/medical")({
  head: () =>
    pageHead({
      title: "VIP Special Services, Spa & Close Protection | Shafsky",
      description:
        "Luxury spa and wellness, custom couples travel, and professional PSO close protection with shopping escorts. Special services by Shafsky Aviation.",
      path: "/solutions/medical",
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Special Services", path: "/solutions/medical" },
        ]),
      ],
    }),
  component: DedicatedSpecialServicesPage,
});

export type SpecialServiceOptionId =
  | "Spa & Wellness"
  | "Tours & Travel (Honeymoon/Couples)"
  | "PSO (Personal Security Officer / VIP Shopping)";

interface SpecialServiceOptionDef {
  id: SpecialServiceOptionId;
  label: string;
  badge: string;
  tagline: string;
  photo: string;
  inclusions: string[];
}

const SPECIAL_SERVICES_OPTIONS: SpecialServiceOptionDef[] = [
  {
    id: "Spa & Wellness",
    label: "Spa & Wellness",
    badge: "LUXURY SPA, HYDROTHERAPY & REJUVENATION",
    tagline: "Private couples spa suites, therapeutic hot stone treatments, and 5-star wellness retreats.",
    photo: spaWellnessImg,
    inclusions: [
      "Private Couple Spa Suites with Jacuzzi & Aromatherapy Steam Rooms",
      "Certified Ayurvedic Doctors & International Holistic Wellness Therapists",
      "Signature Volcanic Hot Stone Therapy & Deep Tissue Rejuvenation",
      "Cold-Pressed Organic Essential Oils & Customized Herbal Infusions",
      "VIP Airport Layover Express Rejuvenation & Hydro-Massage Access",
      "24/7 Dedicated Wellness Concierge Booking & Private Suite Reservations",
    ],
  },
  {
    id: "Tours & Travel (Honeymoon/Couples)",
    label: "Tours & Travel (Honeymoon/Couples)",
    badge: "CURATED ROMANTIC GETAWAYS & HONEYMOONS",
    tagline: "Curated romantic itineraries, European honeymoons, private yacht charters, and luxury stays.",
    photo: toursTravelImg,
    inclusions: [
      "Tailored Luxury Honeymoon Circuits & Private Romantic Escapes (Paris, Venice, Amalfi, Switzerland)",
      "Private Aircraft Charter & Chauffeured Luxury Ground Fleet Synchronization",
      "5-Star Heritage Palace & Signature Eiffel / Presidential Suite Reservations",
      "VIP Fast-Track Monument Access, Private Seine Dinner Cruises & Curated Moments",
      "Dedicated On-Ground Destination Concierge & Local Cultural Experts",
      "24/7 Global Travel Concierge Desk & Flexible Schedule Coordination",
    ],
  },
  {
    id: "PSO (Personal Security Officer / VIP Shopping)",
    label: "PSO (Personal Security / VIP Shopping)",
    badge: "CLOSE PROTECTION & LUXURY RETAIL ESCORT",
    tagline: "Armed and unarmed close protection officers for high-profile VIPs, executive escorts, and private luxury boutique shopping.",
    photo: psoSecurityImg,
    inclusions: [
      "Ex-Military & Special Forces Certified Close Protection Officers (Armed / Unarmed)",
      "Private Luxury Shopping Escorts across Premier Fashion Districts (Chanel, LV, Gucci, Rolex)",
      "Armored Luxury Convoy Fleet, Tarmac-to-Boutique Secure Transit & Motorcade",
      "Discreet High-Net-Worth Crowd Management & Confidential Route Reconnaissance",
      "Personal Luggage & High-Value Asset Security Handling from Airside to Hotel",
      "24/7 Operations Desk Coordination & Dedicated Executive Security Detail",
    ],
  },
];

function DedicatedSpecialServicesPage() {
  const navigate = useNavigate();
  const [selectedOptionId, setSelectedOptionId] = useState<SpecialServiceOptionId>("Spa & Wellness");

  const activeOption =
    SPECIAL_SERVICES_OPTIONS.find((o) => o.id === selectedOptionId) ||
    SPECIAL_SERVICES_OPTIONS[0];

  // 1. Spa & Wellness form states
  const [spaLocation, setSpaLocation] = useState("");
  const [spaDate, setSpaDate] = useState("");
  const [spaGuests, setSpaGuests] = useState(2);
  const [spaTreatment, setSpaTreatment] = useState("Couple Hot Stone Therapy & Aromatherapy");
  const [spaRequirements, setSpaRequirements] = useState("");

  // 2. Tours & Travel (Honeymoon/Couples) states
  const [tourDestination, setTourDestination] = useState("");
  const [tourStartDate, setTourStartDate] = useState("");
  const [tourEndDate, setTourEndDate] = useState("");
  const [tourGuests, setTourGuests] = useState(2);
  const [tourStyle, setTourStyle] = useState("Romantic Luxury Honeymoon Circuit");
  const [tourRequirements, setTourRequirements] = useState("");

  // 3. PSO (Personal Security Officer / VIP Shopping) states
  const [psoDates, setPsoDates] = useState("");
  const [psoLocation, setPsoLocation] = useState("");
  const [psoVipCount, setPsoVipCount] = useState(1);
  const [psoOfficersCount, setPsoOfficersCount] = useState(2);
  const [psoScope, setPsoScope] = useState("VIP Luxury Shopping Escort & Close Protection");
  const [psoRequirements, setPsoRequirements] = useState("");

  // Contact details
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmitRequest = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!clientName.trim() || !phone.trim()) {
      alert("Please provide your name and contact phone number.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      alert("Please provide a valid email so our desk can send your quotation.");
      return;
    }

    setIsSubmitting(true);

    let origin: string | undefined;
    let destination: string | undefined;
    let serviceDate: string | undefined;
    let details: Record<string, unknown> = { service: selectedOptionId };
    let notes: string | undefined;
    const serviceCategory: "Travel Support" | "Cargo & Logistics" = "Travel Support";
    let serviceType: string = selectedOptionId;

    if (selectedOptionId === "Spa & Wellness") {
      origin = spaLocation;
      destination = spaLocation;
      serviceDate = spaDate || undefined;
      details = {
        service: selectedOptionId,
        location: spaLocation,
        date: spaDate,
        guests: spaGuests,
        treatment: spaTreatment,
        requirements: spaRequirements,
      };
      notes = `${spaTreatment} — ${spaRequirements || "None"}`;
      serviceType = "Spa & Wellness";
    } else if (selectedOptionId === "Tours & Travel (Honeymoon/Couples)") {
      origin = tourDestination;
      destination = tourDestination;
      serviceDate = `${tourStartDate || "TBD"} to ${tourEndDate || "TBD"}`;
      details = {
        service: selectedOptionId,
        destination: tourDestination,
        start_date: tourStartDate,
        end_date: tourEndDate,
        guests: tourGuests,
        style: tourStyle,
        requirements: tourRequirements,
      };
      notes = `${tourStyle} — ${tourRequirements || "None"}`;
      serviceType = "Travel Support";
    } else if (selectedOptionId === "PSO (Personal Security Officer / VIP Shopping)") {
      origin = psoLocation;
      destination = psoLocation;
      serviceDate = psoDates || undefined;
      details = {
        service: selectedOptionId,
        dates: psoDates,
        location: psoLocation,
        vip_count: psoVipCount,
        officers_count: psoOfficersCount,
        scope: psoScope,
        requirements: psoRequirements,
      };
      notes = `${psoScope} — ${psoRequirements || "None"}`;
      serviceType = "VIP Escort";
    }

    try {
      const res = await enquiryApi.submit({
        passengerName: clientName.trim(),
        passengerEmail: email.trim().toLowerCase(),
        passengerPhone: phone.trim(),
        serviceCategory,
        serviceType,
        origin,
        destination,
        serviceDate,
        notes,
        details,
      });
      if (res.success && res.data?.bookingRef) {
        setSubmittedRef(res.data.bookingRef);
      } else {
        const errMsg =
          !res.success && "error" in res
            ? String(res.error)
            : "Failed to submit enquiry. Please try again.";
        alert(errMsg);
      }
    } catch (err) {
      console.error("Special service inquiry submission:", err);
      alert("Something went wrong while submitting your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppDirectLink = () => {
    let details = "";
    if (selectedOptionId === "Spa & Wellness") {
      details = `Location: ${spaLocation}%0ADate: ${spaDate}%0AGuests: ${spaGuests}%0ATreatment: ${spaTreatment}%0ANotes: ${spaRequirements || "None"}`;
    } else if (selectedOptionId === "Tours & Travel (Honeymoon/Couples)") {
      details = `Destination: ${tourDestination}%0ADates: ${tourStartDate} to ${tourEndDate}%0AGuests: ${tourGuests}%0AStyle: ${tourStyle}%0ANotes: ${tourRequirements || "None"}`;
    } else if (selectedOptionId === "PSO (Personal Security Officer / VIP Shopping)") {
      details = `Location: ${psoLocation}%0ADates: ${psoDates}%0AVIPs: ${psoVipCount}%0AOfficers: ${psoOfficersCount}%0AScope: ${psoScope}%0ANotes: ${psoRequirements || "None"}`;
    }

    const text = `Hello Shafsky Special Services Desk,%0A%0AI would like to request assistance for:%0A- Service: ${selectedOptionId}%0A${details}%0A- Client Name: ${clientName}%0A- Phone: ${phone}%0A- Email: ${email || "N/A"}`;
    return `https://wa.me/919599087959?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-lime-200">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO HEADER & 3 SEPARATE 12K SERVICE CARDS
          ───────────────────────────────────────────────────────────── */}
      <section className="relative px-4 pt-6 pb-12 sm:px-6 lg:px-8 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white">
        <div className="mx-auto max-w-6xl">
          {/* Header Bar with Back Button & Breadcrumbs */}
          <div className="flex items-center justify-between gap-4 mb-8">
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
              <span>SPECIAL SERVICES & EXECUTIVE CONCIERGE</span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight"
              style={display}
            >
              Special <span className="text-lime-600">Services</span>
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Curated luxury spa retreats, custom romantic honeymoon tours, and certified close protection with private boutique shopping escorts.
            </p>
          </div>

          {/* 3 SEPARATE SERVICE SHOWCASE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {SPECIAL_SERVICES_OPTIONS.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    setSelectedOptionId(opt.id);
                    const el = document.getElementById("request-form");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`group relative rounded-2xl overflow-hidden bg-white border-2 transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 flex flex-col ${
                    isSelected
                      ? "border-lime-500 ring-2 ring-lime-400/50 shadow-lime-500/10"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                    <img
                      src={opt.photo}
                      alt={opt.label}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 select-none"
                      loading="eager"
                    />
                    {/* Gradient Overlay for Crisp Text Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                    {/* Featured Badge */}
                    <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/25 text-[9px] font-mono font-bold tracking-wider text-lime-400">
                      <Sparkles size={10} className="text-lime-400" />
                      <span>FEATURED SERVICE</span>
                    </div>

                    {/* Badge & Title on Image Bottom */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[8.5px] font-mono font-bold tracking-wider uppercase text-lime-300 bg-black/65 backdrop-blur-xs border border-lime-400/40 mb-1">
                        {opt.badge}
                      </span>
                      <h3 className="text-lg font-bold text-white drop-shadow-md leading-snug">
                        {opt.label}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4 font-normal">
                      {opt.tagline}
                    </p>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                        {isSelected ? "Active Service" : "Click to Configure"}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1 rounded-full transition-all ${
                          isSelected
                            ? "bg-lime-500 text-slate-950 font-extrabold shadow-xs"
                            : "bg-slate-100 text-slate-700 group-hover:bg-lime-100 group-hover:text-lime-800"
                        }`}
                      >
                        {isSelected ? "Selected ✓" : "Select"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. 3 SPECIAL SERVICES PILL SELECTOR
          ───────────────────────────────────────────────────────────── */}
      <section className="py-8 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-lime-700 bg-lime-50 px-3.5 py-1 rounded-full border border-lime-200">
              SELECT YOUR SPECIAL SERVICE
            </span>
          </div>

          {/* 3 Option Buttons */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {SPECIAL_SERVICES_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`px-6 py-3 rounded-full text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
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
      <section id="request-form" className="py-12 sm:py-16 bg-slate-50/70 border-b border-slate-200 px-4 sm:px-6 lg:px-8 scroll-mt-6">
        <div className="mx-auto max-w-4xl">
          {/* Active Option Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-lime-700 mb-2">
              <Sparkles size={13} className="text-lime-600" />
              <span>{activeOption.badge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950" style={display}>
              {activeOption.label} Request
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
                SPECIAL SERVICE REQUEST SUBMITTED
              </span>
              <h3 className="text-3xl font-extrabold text-slate-950 mt-1 mb-2" style={display}>
                Reference #{submittedRef}
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                Your request for <strong className="text-slate-900">{selectedOptionId}</strong> has been received by the Shafsky Special Concierge Desk.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={getWhatsAppDirectLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs font-mono tracking-wider shadow-md transition-all"
                >
                  <MessageSquare size={15} />
                  <span>Open WhatsApp Concierge Desk</span>
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
                {/* 1. Spa & Wellness Form */}
                {selectedOptionId === "Spa & Wellness" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Location / Preferred Hotel & City
                        </label>
                        <input
                          type="text"
                          value={spaLocation}
                          onChange={(e) => setSpaLocation(e.target.value)}
                          placeholder="e.g. The Oberoi Udaivilas, Udaipur / Taj Palace, Delhi / Dubai"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Preferred Date & Time
                        </label>
                        <input
                          type="text"
                          value={spaDate}
                          onChange={(e) => setSpaDate(e.target.value)}
                          placeholder="e.g. 24 Oct 2026, 4:00 PM"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Number of Guests
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={spaGuests}
                          onChange={(e) => setSpaGuests(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Treatment Ritual Preference
                        </label>
                        <select
                          value={spaTreatment}
                          onChange={(e) => setSpaTreatment(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                        >
                          <option value="Couple Hot Stone Therapy & Aromatherapy">Couple Hot Stone Therapy & Aromatherapy</option>
                          <option value="Deep Tissue & Herbal Body Wrap">Deep Tissue & Herbal Body Wrap</option>
                          <option value="Signature Ayurvedic Shirodhara & Healing">Signature Ayurvedic Shirodhara & Healing</option>
                          <option value="VIP Airport Transit Express Rejuvenation">VIP Airport Transit Express Rejuvenation</option>
                          <option value="Full Day Couple Luxury Retreat">Full Day Couple Luxury Retreat</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Special Wellness Preferences & Requests
                      </label>
                      <textarea
                        rows={2}
                        value={spaRequirements}
                        onChange={(e) => setSpaRequirements(e.target.value)}
                        placeholder="e.g. Organic essential oil preferences, champagne and floral bath arrangement, specific therapist gender..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  </>
                )}

                {/* 2. Tours & Travel (Honeymoon/Couples) Form */}
                {selectedOptionId === "Tours & Travel (Honeymoon/Couples)" && (
                  <>
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Destination / Honeymoon Circuit
                      </label>
                      <input
                        type="text"
                        value={tourDestination}
                        onChange={(e) => setTourDestination(e.target.value)}
                        placeholder="e.g. Paris & Swiss Alps / Venice & Amalfi Coast / Maldives Private Atoll / Udaipur & Jaipur"
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
                          max={20}
                          value={tourGuests}
                          onChange={(e) => setTourGuests(parseInt(e.target.value) || 2)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Vacation & Travel Style
                        </label>
                        <select
                          value={tourStyle}
                          onChange={(e) => setTourStyle(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                        >
                          <option value="Romantic Luxury Honeymoon Circuit">Romantic Luxury Honeymoon Circuit</option>
                          <option value="Couples Milestone & Anniversary Tour">Couples Milestone & Anniversary Tour</option>
                          <option value="Private Jet & Luxury Villa Expedition">Private Jet & Luxury Villa Expedition</option>
                          <option value="Curated Heritage & Architectural Journey">Curated Heritage & Architectural Journey</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Special Requirements & Requests
                        </label>
                        <input
                          type="text"
                          value={tourRequirements}
                          onChange={(e) => setTourRequirements(e.target.value)}
                          placeholder="e.g. Private Eiffel Tower dinner cruise, private helicopter transfers, photographer..."
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* 3. PSO (Personal Security Officer / VIP Shopping) Form */}
                {selectedOptionId === "PSO (Personal Security Officer / VIP Shopping)" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          City / Deployment Location
                        </label>
                        <input
                          type="text"
                          value={psoLocation}
                          onChange={(e) => setPsoLocation(e.target.value)}
                          placeholder="e.g. Beverly Hills / Paris / Dubai / London / Mumbai / Delhi"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Dates / Duration of Detail
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
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          VIPs Protected
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={15}
                          value={psoVipCount}
                          onChange={(e) => setPsoVipCount(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Security Officers Needed
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={psoOfficersCount}
                          onChange={(e) => setPsoOfficersCount(parseInt(e.target.value) || 2)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Security Scope
                        </label>
                        <select
                          value={psoScope}
                          onChange={(e) => setPsoScope(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                        >
                          <option value="VIP Luxury Shopping Escort & Close Protection">VIP Luxury Shopping Escort</option>
                          <option value="24/7 Armed Close Protection Detail">24/7 Armed Close Protection Detail</option>
                          <option value="Armored Convoy & Airport Tarmac Escort">Armored Convoy & Tarmac Escort</option>
                          <option value="Celebrity & High-Profile Event Security">Celebrity & Event Security</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Confidential Security & Shopping Preferences
                      </label>
                      <textarea
                        rows={2}
                        value={psoRequirements}
                        onChange={(e) => setPsoRequirements(e.target.value)}
                        placeholder="e.g. Chanel & LV private boutique room coordination, armored Rolls Royce transfer, covert surveillance..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
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
                    <span>{isSubmitting ? "Dispatching..." : `Request ${activeOption.label}`}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. COMPANY CATALOG CONTENT & 12K PHOTO SPECIFICATIONS
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.4em] text-lime-700 font-bold font-mono bg-lime-50 px-3.5 py-1 rounded-full border border-lime-200">
              <span>SERVICES & INCLUSIONS</span>
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-950 tracking-tight" style={display}>
              Service Details & Inclusions.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Luxury couple wellness, curated honeymoon circuits, and high-profile armed close protection escorts.
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
                {activeOption.label}
              </h3>

              <div className="space-y-4">
                {activeOption.inclusions.map((inc, i) => (
                  <div key={i} className="flex items-start gap-3.5 text-sm sm:text-[15px] text-slate-900 leading-snug">
                    <span className="text-lime-600 font-bold text-xl leading-none mt-0.5">•</span>
                    <span className="font-semibold text-slate-900">{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Visual Cards */}
            <div className="lg:col-span-6 space-y-4">
              {SPECIAL_SERVICES_OPTIONS.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedOptionId(item.id)}
                  className={`w-full rounded-2xl overflow-hidden shadow-sm border transition-all cursor-pointer flex flex-col sm:flex-row bg-white ${
                    selectedOptionId === item.id
                      ? "border-lime-500 ring-2 ring-lime-400/50 shadow-md"
                      : "border-slate-200/80 hover:border-lime-300"
                  }`}
                >
                  <div className="w-full sm:w-48 h-36 relative overflow-hidden bg-slate-900 shrink-0">
                    <img
                      src={item.photo}
                      alt={item.label}
                      className="w-full h-full object-cover object-center select-none"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[8.5px] font-mono font-bold text-lime-400">
                      PREMIUM
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-center">
                    <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-lime-700 mb-1">
                      {item.badge}
                    </span>
                    <h4 className="text-base font-bold text-slate-950 mb-1">
                      {item.label}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {item.tagline}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
