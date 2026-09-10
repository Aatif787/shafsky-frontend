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
  Heart,
} from "lucide-react";
import { display, mono } from "@/components/home/theme";
import { ExperiencePhoto } from "../shared/ExperiencePhoto";
import {
  INPUT_CLASSES,
  SELECT_CLASSES,
  TEXTAREA_CLASSES,
  FieldLabel,
  CounterField,
} from "../shared/SharedUi";
import { BookingSuccessModal } from "../shared/BookingSuccessModal";
import { enquiryApi } from "@/lib/api/enquiryApi";
import spaWellnessImg from "@/assets/others/spa-wellness.jpg";
import toursTravelImg from "@/assets/others/tours-travel.jpg";
import psoSecurityImg from "@/assets/others/pso-security.jpg";

export type SpecialSubService =
  | "Spa & Wellness"
  | "Tours & Travel (Honeymoon/Couples)"
  | "PSO (Personal Security Officer / VIP Shopping)";

const SPECIAL_SUB_SERVICES: {
  id: SpecialSubService;
  label: string;
  desc: string;
  photo: string;
  icon: any;
}[] = [
  {
    id: "Spa & Wellness",
    label: "Spa & Wellness",
    desc: "Bespoke couple spa sanctuaries, therapeutic hot stone rituals, and 5-star wellness retreats.",
    photo: spaWellnessImg,
    icon: Sparkles,
  },
  {
    id: "Tours & Travel (Honeymoon/Couples)",
    label: "Tours & Travel (Honeymoon)",
    desc: "Bespoke romantic itineraries, Paris honeymoons, private yacht charters, and luxury circuits.",
    photo: toursTravelImg,
    icon: Globe,
  },
  {
    id: "PSO (Personal Security Officer / VIP Shopping)",
    label: "PSO & VIP Shopping Escort",
    desc: "Armed close protection officers for VIPs, executive security, and private luxury boutique shopping.",
    photo: psoSecurityImg,
    icon: Shield,
  },
];

interface SpecialServicesExperienceProps {
  initialSubService?: string;
}

export function SpecialServicesExperience({ initialSubService }: SpecialServicesExperienceProps) {
  const defaultSub: SpecialSubService = (
    SPECIAL_SUB_SERVICES.find((s) => s.id.toLowerCase() === (initialSubService || "").toLowerCase())?.id ||
    "Spa & Wellness"
  );

  const [subService, setSubService] = useState<SpecialSubService>(defaultSub);
  const [step, setStep] = useState<1 | 2>(1);

  // 1. Spa & Wellness fields
  const [spaLocation, setSpaLocation] = useState("");
  const [spaDate, setSpaDate] = useState("");
  const [spaGuests, setSpaGuests] = useState(2);
  const [spaTreatment, setSpaTreatment] = useState("Couple Hot Stone Therapy & Aromatherapy");

  // 2. Tours & Travel fields
  const [tourDest, setTourDest] = useState("");
  const [tourStartDate, setTourStartDate] = useState("");
  const [tourEndDate, setTourEndDate] = useState("");
  const [tourTravellers, setTourTravellers] = useState(2);
  const [tourStyle, setTourStyle] = useState("Romantic Luxury Honeymoon Circuit");

  // 3. PSO Security fields
  const [psoType, setPsoType] = useState("VIP Luxury Shopping Escort & Close Protection");
  const [psoLocation, setPsoLocation] = useState("");
  const [psoStartDate, setPsoStartDate] = useState("");
  const [psoDurationDays, setPsoDurationDays] = useState(3);
  const [psoCount, setPsoCount] = useState(2);
  const [psoVipCount, setPsoVipCount] = useState(1);

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

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) {
      alert("Please provide your name and contact phone number.");
      return;
    }
    if (!guestEmail.trim() || !guestEmail.includes("@")) {
      alert("Please provide a valid email so our desk can send your quotation.");
      return;
    }

    let origin: string | undefined;
    let destination: string | undefined;
    let serviceDate: string | undefined;
    let details: Record<string, unknown> = { service: subService };
    const notes = specialNotes.trim() || undefined;
    const serviceCategory: "Travel Support" | "Cargo & Logistics" = "Travel Support";
    let serviceType = "Travel Support";

    if (subService === "Spa & Wellness") {
      origin = spaLocation;
      destination = spaLocation;
      serviceDate = spaDate || undefined;
      serviceType = "Spa & Wellness";
      details = {
        service: subService,
        location: spaLocation,
        date: spaDate,
        guests: spaGuests,
        treatment: spaTreatment,
      };
    } else if (subService === "Tours & Travel (Honeymoon/Couples)") {
      origin = tourDest;
      destination = tourDest;
      serviceDate = `${tourStartDate || "TBD"} to ${tourEndDate || "TBD"}`;
      serviceType = "Travel Support";
      details = {
        service: subService,
        destination: tourDest,
        start_date: tourStartDate,
        end_date: tourEndDate,
        guests: tourTravellers,
        style: tourStyle,
      };
    } else if (subService === "PSO (Personal Security Officer / VIP Shopping)") {
      origin = psoLocation;
      destination = psoLocation;
      serviceDate = psoStartDate || undefined;
      serviceType = "VIP Escort";
      details = {
        service: subService,
        scope: psoType,
        location: psoLocation,
        duration_days: psoDurationDays,
        officers_count: psoCount,
        vip_count: psoVipCount,
      };
    }

    try {
      const res = await enquiryApi.submit({
        passengerName: guestName.trim(),
        passengerEmail: guestEmail.trim().toLowerCase(),
        passengerPhone: guestPhone.trim(),
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
        alert(
          !res.success && "error" in res
            ? String(res.error)
            : "Failed to submit enquiry. Please try again.",
        );
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while submitting your request. Please try again.");
    }
  };

  const getWhatsAppLink = () => {
    let serviceDetails = "";
    if (subService === "Spa & Wellness") {
      serviceDetails = `Location: ${spaLocation}%0ADate: ${spaDate}%0AGuests: ${spaGuests}%0ATreatment: ${spaTreatment}`;
    } else if (subService === "Tours & Travel (Honeymoon/Couples)") {
      serviceDetails = `Destination: ${tourDest}%0ADates: ${tourStartDate} to ${tourEndDate}%0AGuests: ${tourTravellers}%0AStyle: ${tourStyle}`;
    } else if (subService === "PSO (Personal Security Officer / VIP Shopping)") {
      serviceDetails = `Scope: ${psoType}%0ALocation: ${psoLocation}%0AStart Date: ${psoStartDate}%0ADuration: ${psoDurationDays} Days%0AOfficers: ${psoCount}%0AVIPs: ${psoVipCount}`;
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
            src={activeSubObj.photo}
            alt={activeSubObj.label}
            badge="12K Ultra-HD"
            caption={activeSubObj.desc}
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

            {/* 1. SPA & WELLNESS SPECIFIC FIELDS */}
            {subService === "Spa & Wellness" && (
              <div className="space-y-4">
                <div>
                  <FieldLabel required>Location / Hotel & City</FieldLabel>
                  <input
                    type="text"
                    placeholder="e.g. The Oberoi Udaivilas, Udaipur / Taj Palace, Delhi / Dubai"
                    value={spaLocation}
                    onChange={(e) => setSpaLocation(e.target.value)}
                    className={INPUT_CLASSES}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Preferred Date & Time</FieldLabel>
                    <input
                      type="text"
                      placeholder="e.g. 25 Oct 2026, 4:00 PM"
                      value={spaDate}
                      onChange={(e) => setSpaDate(e.target.value)}
                      className={INPUT_CLASSES}
                      required
                    />
                  </div>
                  <div>
                    <FieldLabel required>Treatment Ritual</FieldLabel>
                    <select
                      value={spaTreatment}
                      onChange={(e) => setSpaTreatment(e.target.value)}
                      className={SELECT_CLASSES}
                    >
                      <option value="Couple Hot Stone Therapy & Aromatherapy">Couple Hot Stone Therapy & Aromatherapy</option>
                      <option value="Deep Tissue & Herbal Body Wrap">Deep Tissue & Herbal Body Wrap</option>
                      <option value="Signature Ayurvedic Shirodhara & Healing">Signature Ayurvedic Shirodhara & Healing</option>
                      <option value="VIP Airport Transit Express Rejuvenation">VIP Airport Transit Express Rejuvenation</option>
                      <option value="Full Day Couple Sanctuary Retreat">Full Day Couple Sanctuary Retreat</option>
                    </select>
                  </div>
                </div>
                <CounterField
                  label="Number of Guests"
                  sublabel="Spa suite participants"
                  value={spaGuests}
                  onChange={setSpaGuests}
                  min={1}
                  max={10}
                />
              </div>
            )}

            {/* 2. TOURS & TRAVEL (HONEYMOON/COUPLES) SPECIFIC FIELDS */}
            {subService === "Tours & Travel (Honeymoon/Couples)" && (
              <div className="space-y-4">
                <div>
                  <FieldLabel required>Destination / Honeymoon Circuit</FieldLabel>
                  <input
                    type="text"
                    placeholder="e.g. Paris & Swiss Alps / Venice & Amalfi Coast / Maldives / Udaipur"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CounterField
                    label="Number of Travellers"
                    sublabel="Guests travelling"
                    value={tourTravellers}
                    onChange={setTourTravellers}
                    min={1}
                    max={20}
                  />
                  <div>
                    <FieldLabel required>Travel & Honeymoon Style</FieldLabel>
                    <select
                      value={tourStyle}
                      onChange={(e) => setTourStyle(e.target.value)}
                      className={SELECT_CLASSES}
                    >
                      <option value="Romantic Luxury Honeymoon Circuit">Romantic Luxury Honeymoon Circuit</option>
                      <option value="Couples Milestone & Anniversary Tour">Couples Milestone & Anniversary Tour</option>
                      <option value="Private Jet & Luxury Villa Expedition">Private Jet & Luxury Villa Expedition</option>
                      <option value="Curated Heritage & Cultural Journey">Curated Heritage & Cultural Journey</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 3. PSO (PERSONAL SECURITY OFFICER / VIP SHOPPING) SPECIFIC FIELDS */}
            {subService === "PSO (Personal Security Officer / VIP Shopping)" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Security Scope & Service</FieldLabel>
                    <select
                      value={psoType}
                      onChange={(e) => setPsoType(e.target.value)}
                      className={SELECT_CLASSES}
                    >
                      <option value="VIP Luxury Shopping Escort & Close Protection">VIP Luxury Shopping Escort & Close Protection</option>
                      <option value="Armed Close Protection Officer (Ex-Special Forces)">Armed Close Protection Officer (Ex-Special Forces)</option>
                      <option value="Armored Convoy & Airport Tarmac Motorcade">Armored Convoy & Airport Tarmac Motorcade</option>
                      <option value="Celebrity & High-Profile Event Security Detail">Celebrity & High-Profile Event Security Detail</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel required>Deployment City / Location</FieldLabel>
                    <input
                      type="text"
                      placeholder="e.g. Beverly Hills / Paris / Dubai / London / Delhi / Mumbai"
                      value={psoLocation}
                      onChange={(e) => setPsoLocation(e.target.value)}
                      className={INPUT_CLASSES}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <FieldLabel required>Start Date</FieldLabel>
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
                  <CounterField
                    label="Officers (PSOs)"
                    sublabel="Guards assigned"
                    value={psoCount}
                    onChange={setPsoCount}
                    min={1}
                    max={10}
                  />
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
              {subService === "Spa & Wellness" && (
                <div className="flex justify-between text-slate-600">
                  <span>Spa Details:</span>
                  <span className="font-semibold text-slate-900">{spaLocation} ({spaGuests} Guests) • {spaTreatment}</span>
                </div>
              )}
              {subService === "Tours & Travel (Honeymoon/Couples)" && (
                <div className="flex justify-between text-slate-600">
                  <span>Destination:</span>
                  <span className="font-semibold text-slate-900">{tourDest} ({tourTravellers} Travellers) • {tourStyle}</span>
                </div>
              )}
              {subService === "PSO (Personal Security Officer / VIP Shopping)" && (
                <div className="flex justify-between text-slate-600">
                  <span>Protection:</span>
                  <span className="font-semibold text-slate-900">{psoCount} PSOs in {psoLocation} • {psoType}</span>
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
