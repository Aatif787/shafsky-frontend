import React from "react";
import {
  ArrowLeft,
  Sparkles,
  Plane,
  Train,
  HeartHandshake,
  FileCheck,
  PawPrint,
  Ticket,
  ShieldCheck,
  UtensilsCrossed,
  Baby,
} from "lucide-react";
import { display } from "@/components/home/theme";
import spaWellnessImg from "@/assets/others/spa-wellness.jpg";
import psoSecurityImg from "@/assets/others/pso-security.jpg";
import specialserImg from "@/assets/others/specialser.png";
import infantCareImg from "@/assets/others/infant-care.jpg";
import trainAmbulanceImg from "@/assets/others/train-ambulance.jpg";
import petCargoImg from "@/assets/others/pet-cargo.jpg";
import visaAssistanceImg from "@/assets/others/visa-assistance.jpg";
import humanRemainsImg from "@/assets/others/human-remains.jpg";

export type SpecialServiceOptionId =
  | "Air Ticketing Services"
  | "Travel & Tour (Honeymoon/Couples)"
  | "Tours & Travel (Honeymoon/Couples)"
  | "Visa Assistance Services"
  | "On-board Meal Arrangements for Group Meet & Greet Bookings"
  | "Spa & Wellness"
  | "PSO (Personal Security Officer / VIP Shopping)"
  | "Air Ambulance (Airborne ICU Jet)"
  | "Train Ambulance"
  | "Train Ambulance (Train ICU Escort)"
  | "Human Remains (HUM)"
  | "Dignified Human Remains (HUM)"
  | "Cargo & AVI Pet Freight"
  | "Infant Care Services";

export interface SpecialServiceOptionDef {
  id: SpecialServiceOptionId;
  label: string;
  shortLabel: string;
  badge: string;
  tagline: string;
  photo?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  inclusions: string[];
}

export const SPECIAL_SERVICES_OPTIONS: SpecialServiceOptionDef[] = [
  {
    id: "Air Ticketing Services",
    label: "Air Ticketing Services",
    shortLabel: "Air Ticketing",
    badge: "DOMESTIC & INTERNATIONAL AIRLINE TICKETING",
    tagline: "",
    icon: Ticket,
    inclusions: [],
  },
  {
    id: "Travel & Tour (Honeymoon/Couples)",
    label: "Travel & Tour (Honeymoon/Couples)",
    shortLabel: "Travel & Tour",
    badge: "CURATED ROMANTIC GETAWAYS & HONEYMOONS",
    tagline:
      "Curated romantic itineraries, European honeymoons, private yacht charters, and luxury stays.",
    photo: specialserImg,
    icon: HeartHandshake,
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
    id: "Visa Assistance Services",
    label: "Visa Assistance Services",
    shortLabel: "Visa Assistance",
    badge: "FAST-TRACK DIPLOMATIC & CORPORATE VISA ASSIST",
    tagline:
      "Expedited visa processing, VIP doorstep biometrics, document vetting, and priority embassy liaison for international travel.",
    photo: visaAssistanceImg,
    icon: FileCheck,
    inclusions: [
      "Expedited Business, Tourist, Diplomatic, Student & Medical Visa Processing",
      "Doorstep Biometric Coordination & Priority VIP Appointment Scheduling",
      "Comprehensive Document Verification, Cover Letter Drafting & Embassy File Review",
      "Fast-Track Processing for Schengen, UK, US, UAE, Singapore & 50+ Global Hubs",
      "Official Corporate Delegation & Diplomatic Mission Priority File Submission",
      "24/7 Visa Helpdesk Status Tracking & Secure Courier Passport Delivery",
    ],
  },
  {
    id: "On-board Meal Arrangements for Group Meet & Greet Bookings",
    label: "On-board Meal Arrangements",
    shortLabel: "On-board Meals",
    badge: "GOURMET IN-FLIGHT DINING & GROUP MEET & GREET CATERING",
    tagline:
      "Bespoke in-flight catering, customized dietary curation, and synchronized airside meal delivery for group and VIP Meet & Greet journeys.",
    icon: UtensilsCrossed,
    inclusions: [],
  },
  {
    id: "Spa & Wellness",
    label: "Spa & Wellness",
    shortLabel: "Spa & Wellness",
    badge: "LUXURY SPA, HYDROTHERAPY & REJUVENATION",
    tagline:
      "Private couples spa suites, therapeutic hot stone treatments, and 5-star wellness retreats.",
    photo: spaWellnessImg,
    icon: Sparkles,
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
    id: "PSO (Personal Security Officer / VIP Shopping)",
    label: "PSO (Personal Security / VIP Shopping)",
    shortLabel: "PSO Close Protection",
    badge: "CLOSE PROTECTION & LUXURY RETAIL ESCORT",
    tagline:
      "Armed and unarmed close protection officers for high-profile VIPs, executive escorts, and private luxury boutique shopping.",
    photo: psoSecurityImg,
    icon: ShieldCheck,
    inclusions: [
      "Ex-Military & Special Forces Certified Close Protection Officers (Armed / Unarmed)",
      "Private Luxury Shopping Escorts across Premier Fashion Districts (Chanel, LV, Gucci, Rolex)",
      "Armored Luxury Convoy Fleet, Tarmac-to-Boutique Secure Transit & Motorcade",
      "Discreet High-Net-Worth Crowd Management & Confidential Route Reconnaissance",
      "Personal Luggage & High-Value Asset Security Handling from Airside to Hotel",
      "24/7 Operations Desk Coordination & Dedicated Executive Security Detail",
    ],
  },
  {
    id: "Air Ambulance (Airborne ICU Jet)",
    label: "Air Ambulance",
    shortLabel: "Air Ambulance",
    badge: "24/7 AIRBORNE ICU & BED-TO-BED MEDICAL EVACUATION",
    tagline:
      "Dedicated ICU aircraft, certified aero-medical doctors, and seamless bed-to-bed hospital transfer across India and worldwide.",
    icon: Plane,
    inclusions: [
      "Dedicated Airborne ICU Jet (Learjet / Hawker / King Air) on 2-Hour Rapid Standby",
      "Board-Certified Aero-Medical Flight Physicians & Critical Care ICU Nurses Onboard",
      "Full Advanced Life Support Suite: Transport Ventilator, Defibrillator, Multipara Monitors",
      "Ramp Surface Ambulance Synchronized at Both Origin & Destination Airport Tarmacs",
      "Direct Airport Authority / DGCA Priority Clearance for Airside Medical Flights",
      "24/7 Hospital-to-Hospital Coordination Desk & Continuous Bedside Handover",
    ],
  },
  {
    id: "Train Ambulance",
    label: "Train Ambulance",
    shortLabel: "Train Ambulance",
    badge: "RAILWAY ICU TRANSFER & MEDICAL ESCORT",
    tagline:
      "Cost-effective long-distance patient rail transfer in 1AC/2AC medical coupes equipped with doctors, continuous oxygen, and monitoring.",
    photo: trainAmbulanceImg,
    icon: Train,
    inclusions: [
      "Comfortable Rail Patient Transit in Air-Conditioned 1AC / 2AC Reserved Medical Coupe",
      "Accompanied by Experienced Critical Care Physician & Emergency Nursing Staff",
      "Continuous Medical Grade Oxygen Cylinders & Emergency Life-Support Medicine Kit",
      "Bed-to-Bed Surface Ambulance at Departure Station and Arrival Platform",
      "Priority Stretcher & Station Master Wheelchair Transit onto Train Compartment",
      "24/7 Rail Operations Control Room Standby & Continuous Family Tracking",
    ],
  },
  {
    id: "Human Remains (HUM)",
    label: "Human Remains (HUM)",
    shortLabel: "HUM Repatriation",
    badge: "REPATRIATION & MORTUARY DISPATCH",
    tagline:
      "Compassionate, fully documented repatriation of mortal remains across domestic and international aviation sectors.",
    photo: humanRemainsImg,
    icon: HeartHandshake,
    inclusions: [
      "Full Domestic & International Air Repatriation Clearance by Dedicated Case Managers",
      "Hospital NOC, Death Certificate Clearance, Embalming Certificate & Police Clearances",
      "Certified Embalming Procedure & International Zinc-Lined Coffin Hermetic Sealing",
      "Embassy / Consular Clearance, Quarantine / Health Officer Approvals & NOCs",
      "Priority Air Cargo Space Allocation & Direct Airside Tarmac Dignified Receiving",
      "Complete Compassionate Guidance with Real-Time Family Progress Updates",
    ],
  },
  {
    id: "Cargo & AVI Pet Freight",
    label: "Cargo & AVI Pet Freight",
    shortLabel: "Cargo & AVI Pet",
    badge: "AIR FREIGHT & IATA LIVE ANIMAL (AVI) LOGISTICS",
    tagline:
      "Specialized aviation freight handling, IATA-compliant live animal & pet booking, and airside customs documentation clearance.",
    photo: petCargoImg,
    icon: PawPrint,
    inclusions: [
      "IATA Live Animal (AVI) Pet Transport with Climate-Controlled Cargo Hold Allocation",
      "Pet Relocation Documentation, Veterinary Fit-to-Fly Verification & IATA Crates",
      "High-Value Express Air Freight, Temperature-Sensitive Pharma & Valuables Escort",
      "Customs Documentation Liaison, Air Waybill (AWB) Generation & Express Tarmac Clearance",
      "Airside Supervised Loading with Real-Time Departure WhatsApp Photo Updates",
      "24/7 Air Cargo Operations Desk Liaison across All Major Commercial Airline Carriers",
    ],
  },
  {
    id: "Infant Care Services",
    label: "Infant Care Services",
    shortLabel: "Infant Care",
    badge: "DEDICATED AIRPORT INFANT & FAMILY CARE",
    tagline:
      "Compassionate airport concierge assistance for parents travelling with infants, pram escort, and seamless airside coordination.",
    photo: infantCareImg,
    icon: Baby,
    inclusions: [
      "Dedicated Airside Concierge Officer Assisting from Curbside to Aerobridge",
      "Stroller & Baby Pram Airside Handling and Gate-Check Coordination",
      "Priority Terminal Navigation & Smooth Security Fast-Track Liaison",
      "Arrival Gate Reception & Luggage Claim Assistance for Parents",
      "Transit Gate-to-Gate Transfer Assistance with Infant Feeding Layover Support",
      "24/7 Dedicated Family Concierge Desk Standby on WhatsApp",
    ],
  },
];

export function resolveSpecialServiceFromSearch(search: unknown): SpecialServiceOptionId {
  const searchObj = (search || {}) as Record<string, unknown>;
  const subParam = typeof searchObj.sub === "string" ? searchObj.sub : undefined;
  if (!subParam) return "Air Ticketing Services";
  const sub = subParam.toLowerCase();
  if (sub.includes("infant") || sub.includes("baby")) {
    return "Infant Care Services";
  }
  if (sub.includes("ticket") || sub.includes("flight")) {
    return "Air Ticketing Services";
  }
  if (sub.includes("travel") || sub.includes("tour") || sub.includes("honeymoon")) {
    return "Travel & Tour (Honeymoon/Couples)";
  }
  if (sub.includes("visa")) {
    return "Visa Assistance Services";
  }
  if (sub.includes("meal") || sub.includes("catering") || sub.includes("onboard") || sub.includes("dining")) {
    return "On-board Meal Arrangements for Group Meet & Greet Bookings";
  }
  if (sub.includes("spa") || sub.includes("wellness")) {
    return "Spa & Wellness";
  }
  if (sub.includes("pso") || sub.includes("security")) {
    return "PSO (Personal Security Officer / VIP Shopping)";
  }
  if (sub.includes("air_amb") || sub.includes("air-amb") || sub === "medevac" || sub === "ambulance") {
    return "Air Ambulance (Airborne ICU Jet)";
  }
  if (sub.includes("train")) {
    return "Train Ambulance";
  }
  if (sub === "hum" || sub.includes("remains")) {
    return "Human Remains (HUM)";
  }
  if (sub.includes("cargo") || sub.includes("avi") || sub.includes("pet")) {
    return "Cargo & AVI Pet Freight";
  }
  return "Air Ticketing Services";
}

export function SpecialServiceHeroStage({
  activeOption,
  onBack,
}: {
  activeOption: SpecialServiceOptionDef;
  onBack: () => void;
}) {
  return (
    <section
      className={`relative w-full overflow-hidden bg-white border-b border-slate-200 ${
        activeOption.photo ? "py-6 sm:py-8 md:py-10" : "py-4 sm:py-6"
      }`}
    >
      <div className="relative z-10 mx-auto w-full max-w-[1040px] xl:max-w-[1100px] 2xl:max-w-[1140px] px-4 sm:px-6 md:px-8">
        {/* Top Header Row: Back Button & Selected Service Status Badge */}
        <div
          className={`w-full flex items-center justify-between gap-3 ${
            activeOption.photo ? "mb-3.5 sm:mb-5" : ""
          }`}
        >
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/90 text-xs font-semibold shadow-xs hover:border-lime-500 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} className="text-lime-600" />
            <span>Back</span>
          </button>

          <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-mono font-bold text-lime-800 uppercase tracking-widest bg-lime-50 px-3.5 sm:px-4 py-1.5 rounded-full border border-lime-300 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-lime-500 inline-block animate-pulse" />
            <span>{activeOption.badge}</span>
          </div>
        </div>

        {activeOption.photo && (
          <div className="relative w-full aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 ring-1 ring-slate-100 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.08)] bg-white flex items-center justify-center select-none">
            <img
              width={1600}
              height={900}
              src={activeOption.photo}
              alt={activeOption.label}
              className="w-full h-full object-cover object-center select-none block pointer-events-none bg-white"
              loading="eager"
              draggable={false}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export function SpecialServiceDetailsSection({
  activeOption,
}: {
  activeOption: SpecialServiceOptionDef;
}) {
  if (activeOption.id === "Air Ticketing Services" || !activeOption.inclusions || activeOption.inclusions.length === 0) {
    return null;
  }
  return (
    <section className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.4em] text-lime-700 font-bold font-mono bg-lime-50 px-3.5 py-1 rounded-full border border-lime-200">
            <span>SERVICE DETAILS & INCLUSIONS</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-950 tracking-tight" style={display}>
            {activeOption.label}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            {activeOption.tagline}
          </p>
        </div>

        {/* Single Column Classical Layout for Active Selection */}
        <div className="max-w-4xl mx-auto flex flex-col justify-start">
          <div className="space-y-4">
            {activeOption.inclusions.map((inc, i) => (
              <div key={i} className="flex items-start gap-3.5 text-sm sm:text-[15px] text-slate-900 leading-snug">
                <span className="text-lime-600 font-bold text-xl leading-none mt-0.5">•</span>
                <span className="font-semibold text-slate-900">{inc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SpecialServiceMedicalAndLogisticsFields({
  selectedOptionId,
  today,
  airAmbPickup,
  setAirAmbPickup,
  airAmbDest,
  setAirAmbDest,
  airAmbDate,
  setAirAmbDate,
  airAmbNotes,
  setAirAmbNotes,
  trainAmbOrigin,
  setTrainAmbOrigin,
  trainAmbDest,
  setTrainAmbDest,
  trainAmbDate,
  setTrainAmbDate,
  trainAmbNotes,
  setTrainAmbNotes,
  humOrigin,
  setHumOrigin,
  humDest,
  setHumDest,
  humDate,
  setHumDate,
  humScope,
  setHumScope,
  visaCountry,
  setVisaCountry,
  visaCategory,
  setVisaCategory,
  visaDate,
  setVisaDate,
  visaApplicants,
  setVisaApplicants,
  visaPassport,
  setVisaPassport,
  cargoOrigin,
  setCargoOrigin,
  cargoDest,
  setCargoDest,
  cargoDetails,
  setCargoDetails,
  cargoDate,
  setCargoDate,
}: {
  selectedOptionId: SpecialServiceOptionId;
  today: string;
  airAmbPickup: string;
  setAirAmbPickup: (v: string) => void;
  airAmbDest: string;
  setAirAmbDest: (v: string) => void;
  airAmbDate: string;
  setAirAmbDate: (v: string) => void;
  airAmbNotes: string;
  setAirAmbNotes: (v: string) => void;
  trainAmbOrigin: string;
  setTrainAmbOrigin: (v: string) => void;
  trainAmbDest: string;
  setTrainAmbDest: (v: string) => void;
  trainAmbDate: string;
  setTrainAmbDate: (v: string) => void;
  trainAmbNotes: string;
  setTrainAmbNotes: (v: string) => void;
  humOrigin: string;
  setHumOrigin: (v: string) => void;
  humDest: string;
  setHumDest: (v: string) => void;
  humDate: string;
  setHumDate: (v: string) => void;
  humScope: string;
  setHumScope: (v: string) => void;
  visaCountry: string;
  setVisaCountry: (v: string) => void;
  visaCategory: string;
  setVisaCategory: (v: string) => void;
  visaDate: string;
  setVisaDate: (v: string) => void;
  visaApplicants: number;
  setVisaApplicants: (v: number) => void;
  visaPassport: string;
  setVisaPassport: (v: string) => void;
  cargoOrigin: string;
  setCargoOrigin: (v: string) => void;
  cargoDest: string;
  setCargoDest: (v: string) => void;
  cargoDetails: string;
  setCargoDetails: (v: string) => void;
  cargoDate: string;
  setCargoDate: (v: string) => void;
}) {
  return (
    <>
      {/* 4. Air Ambulance Minimal Enquiry */}
      {selectedOptionId === "Air Ambulance (Airborne ICU Jet)" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Transfer From (Hospital & City) *
              </label>
              <input
                type="text"
                value={airAmbPickup}
                onChange={(e) => setAirAmbPickup(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Transfer To (Hospital & City) *
              </label>
              <input
                type="text"
                value={airAmbDest}
                onChange={(e) => setAirAmbDest(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Transfer Date / Urgency *
              </label>
              <input
                type="date"
                min={today}
                value={airAmbDate}
                onChange={(e) => setAirAmbDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Patient Medical Condition (Optional)
              </label>
              <input
                type="text"
                value={airAmbNotes}
                onChange={(e) => setAirAmbNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Train Ambulance Minimal Enquiry */}
      {(selectedOptionId === "Train Ambulance" || selectedOptionId === "Train Ambulance (Train ICU Escort)") && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Departure Station & City *
              </label>
              <input
                type="text"
                value={trainAmbOrigin}
                onChange={(e) => setTrainAmbOrigin(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Destination Station & City *
              </label>
              <input
                type="text"
                value={trainAmbDest}
                onChange={(e) => setTrainAmbDest(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Journey Date *
              </label>
              <input
                type="date"
                min={today}
                value={trainAmbDate}
                onChange={(e) => setTrainAmbDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Medical Support Needed (Optional)
              </label>
              <input
                type="text"
                value={trainAmbNotes}
                onChange={(e) => setTrainAmbNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. HUM Remains Repatriation Minimal Enquiry */}
      {(selectedOptionId === "Human Remains (HUM)" || (selectedOptionId as any) === "Dignified Human Remains (HUM)") && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Departure City / Country *
              </label>
              <input
                type="text"
                value={humOrigin}
                onChange={(e) => setHumOrigin(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Destination City / Airport *
              </label>
              <input
                type="text"
                value={humDest}
                onChange={(e) => setHumDest(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Timeline / Date *
              </label>
              <input
                type="date"
                min={today}
                value={humDate}
                onChange={(e) => setHumDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Repatriation Scope *
              </label>
              <select
                value={humScope}
                onChange={(e) => setHumScope(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
              >
                <option value="Domestic Repatriation (Airport to Airport)">Domestic Repatriation (Airport to Airport)</option>
                <option value="International Repatriation (Consular & Embalming)">International Repatriation (Consular & Embalming)</option>
                <option value="Full Mortuary Van & Airside Receiving">Full Mortuary Van & Airside Receiving</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 7. Visa Assistance Minimal Enquiry */}
      {selectedOptionId === "Visa Assistance Services" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Destination Country *
              </label>
              <input
                type="text"
                value={visaCountry}
                onChange={(e) => setVisaCountry(e.target.value)}
                placeholder="e.g. United Kingdom, UAE, USA, Schengen"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Visa Category *
              </label>
              <select
                value={visaCategory}
                onChange={(e) => setVisaCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
              >
                <option value="Tourist / Visitor Visa">Tourist / Visitor Visa</option>
                <option value="Business & Corporate Visa">Business & Corporate Visa</option>
                <option value="Medical Treatment Visa">Medical Treatment Visa</option>
                <option value="Diplomatic / Official Visa">Diplomatic / Official Visa</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Intended Travel Date *
              </label>
              <input
                type="date"
                min={today}
                value={visaDate}
                onChange={(e) => setVisaDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Applicants Count *
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={visaApplicants}
                onChange={(e) => setVisaApplicants(parseInt(e.target.value) || 1)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
              Passport Number *
            </label>
            <input
              type="text"
              value={visaPassport}
              onChange={(e) => setVisaPassport(e.target.value.toUpperCase())}
              placeholder="Enter passport number (e.g. A12345678)"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 font-mono uppercase"
            />
          </div>
        </div>
      )}

      {/* 8. Cargo & AVI Pet Freight Minimal Enquiry */}
      {selectedOptionId === "Cargo & AVI Pet Freight" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Departure Airport / City *
              </label>
              <input
                type="text"
                value={cargoOrigin}
                onChange={(e) => setCargoOrigin(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Destination Airport / Country *
              </label>
              <input
                type="text"
                value={cargoDest}
                onChange={(e) => setCargoDest(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cargo / Pet Details *
              </label>
              <input
                type="text"
                value={cargoDetails}
                onChange={(e) => setCargoDetails(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Dispatch Date *
              </label>
              <input
                type="date"
                min={today}
                value={cargoDate}
                onChange={(e) => setCargoDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
