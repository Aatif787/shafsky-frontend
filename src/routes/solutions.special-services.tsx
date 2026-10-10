import React, { useState, useEffect } from "react";
import { createFileRoute, useNavigate, useLocation } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Send,
  CheckCircle2,
  MessageSquare,
  Plane,
  Train,
  HeartHandshake,
  FileCheck,
  PawPrint,
  Ticket,
  ShieldCheck,
  PhoneCall,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { display } from "@/components/home/theme";
import { enquiryApi } from "@/lib/api/enquiryApi";
import { IntelligentAirportAutocomplete } from "@/components/booking/shared/IntelligentAirportAutocomplete";
import { formatAirportOption } from "@/lib/api/airportApi";
import spaWellnessImg from "@/assets/others/spa-wellness.jpg";
import toursTravelImg from "@/assets/others/tours-travel.jpg";
import psoSecurityImg from "@/assets/others/pso-security.jpg";
import specialserImg from "@/assets/others/specialser.png";
import { Footer } from "@/components/home/sections/Footer";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/solutions/special-services")({
  head: () =>
    pageHead({
      title: "VIP Special Services, Medevac, HUM, Visa, Cargo & Protocol | Shafsky",
      description:
        "Luxury spa and wellness, couples travel, PSO close protection, 24/7 air and train ambulance, HUM repatriation, visa assistance, cargo pet logistics, and commercial air ticketing.",
      path: "/solutions/special-services",
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Special Services", path: "/solutions/special-services" },
        ]),
      ],
    }),
  component: DedicatedSpecialServicesPage,
});

export type SpecialServiceOptionId =
  | "Spa & Wellness"
  | "Tours & Travel (Honeymoon/Couples)"
  | "PSO (Personal Security Officer / VIP Shopping)"
  | "Air Ambulance (Airborne ICU Jet)"
  | "Train Ambulance (Train ICU Escort)"
  | "Dignified Human Remains (HUM)"
  | "Visa Assistance Services"
  | "Cargo & AVI Pet Freight"
  | "Air Ticketing Services";

interface SpecialHeroSlide {
  id: string;
  label: string;
  photo: string;
  badge: string;
  linkedOptionId: SpecialServiceOptionId;
}

interface SpecialServiceOptionDef {
  id: SpecialServiceOptionId;
  label: string;
  shortLabel: string;
  badge: string;
  tagline: string;
  photo?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  inclusions: string[];
}

// Authentic photos that exist in Shafsky assets (100% full uncropped 16:9 ratio)
const SPECIAL_HERO_SLIDES: SpecialHeroSlide[] = [
  {
    id: "taj-mahal-tours",
    label: "Tours & Travel (Taj Mahal & Curated Getaways)",
    photo: specialserImg,
    badge: "BESPOKE TOURS, HONEYMOONS & TAJ MAHAL CONCIERGE",
    linkedOptionId: "Tours & Travel (Honeymoon/Couples)",
  },
  {
    id: "spa-wellness",
    label: "Spa & Wellness",
    photo: spaWellnessImg,
    badge: "LUXURY SPA, HYDROTHERAPY & REJUVENATION",
    linkedOptionId: "Spa & Wellness",
  },
  {
    id: "tours-travel",
    label: "Tours & Travel (Honeymoon/Couples)",
    photo: toursTravelImg,
    badge: "CURATED ROMANTIC GETAWAYS & HONEYMOONS",
    linkedOptionId: "Tours & Travel (Honeymoon/Couples)",
  },
  {
    id: "pso-security",
    label: "PSO (Personal Security / VIP Shopping)",
    photo: psoSecurityImg,
    badge: "CLOSE PROTECTION & LUXURY RETAIL ESCORT",
    linkedOptionId: "PSO (Personal Security Officer / VIP Shopping)",
  },
];

const SPECIAL_SERVICES_OPTIONS: SpecialServiceOptionDef[] = [
  {
    id: "Spa & Wellness",
    label: "Spa & Wellness",
    shortLabel: "Spa & Wellness",
    badge: "LUXURY SPA, HYDROTHERAPY & REJUVENATION",
    tagline: "Private couples spa suites, therapeutic hot stone treatments, and 5-star wellness retreats.",
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
    id: "Tours & Travel (Honeymoon/Couples)",
    label: "Tours & Travel (Honeymoon/Couples)",
    shortLabel: "Tours & Travel",
    badge: "CURATED ROMANTIC GETAWAYS & HONEYMOONS",
    tagline: "Curated romantic itineraries, European honeymoons, private yacht charters, and luxury stays.",
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
    id: "PSO (Personal Security Officer / VIP Shopping)",
    label: "PSO (Personal Security / VIP Shopping)",
    shortLabel: "PSO Close Protection",
    badge: "CLOSE PROTECTION & LUXURY RETAIL ESCORT",
    tagline: "Armed and unarmed close protection officers for high-profile VIPs, executive escorts, and private luxury boutique shopping.",
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
    label: "Air Ambulance (Airborne ICU Jet)",
    shortLabel: "Air Ambulance",
    badge: "24/7 AIRBORNE ICU & BED-TO-BED MEDICAL EVACUATION",
    tagline: "Dedicated ICU aircraft, certified aero-medical doctors, and seamless bed-to-bed hospital transfer across India and worldwide.",
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
    id: "Train Ambulance (Train ICU Escort)",
    label: "Train Ambulance (Train ICU Escort)",
    shortLabel: "Train Ambulance",
    badge: "RAILWAY ICU TRANSFER & MEDICAL ESCORT",
    tagline: "Cost-effective long-distance patient rail transfer in 1AC/2AC medical coupes equipped with doctors, continuous oxygen, and monitoring.",
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
    id: "Dignified Human Remains (HUM)",
    label: "Dignified Human Remains (HUM)",
    shortLabel: "HUM Repatriation",
    badge: "DIGNIFIED REPATRIATION & MORTUARY DISPATCH",
    tagline: "Compassionate, fully documented repatriation of mortal remains across domestic and international aviation sectors.",
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
    id: "Visa Assistance Services",
    label: "Visa Assistance Services",
    shortLabel: "Visa Assistance",
    badge: "FAST-TRACK DIPLOMATIC & CORPORATE VISA ASSIST",
    tagline: "Expedited visa processing, VIP doorstep biometrics, document vetting, and priority embassy liaison for international travel.",
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
    id: "Cargo & AVI Pet Freight",
    label: "Cargo & AVI Pet Freight",
    shortLabel: "Cargo & AVI Pet",
    badge: "AIR FREIGHT & IATA LIVE ANIMAL (AVI) LOGISTICS",
    tagline: "Specialized aviation freight handling, IATA-compliant live animal & pet booking, and airside customs documentation clearance.",
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
    id: "Air Ticketing Services",
    label: "Air Ticketing Services",
    shortLabel: "Air Ticketing",
    badge: "DOMESTIC & INTERNATIONAL AIRLINE TICKETING",
    tagline: "Instant domestic and international airline bookings across 500+ commercial carriers, flexible corporate fares, and VIP seat assignments.",
    icon: Ticket,
    inclusions: [
      "Instant Domestic & International Flight Ticketing across 500+ Global Airlines",
      "Special Corporate & Marine/Offshore Fares, Extra Baggage & Flexible Re-booking",
      "Premium Cabin Seat Reservation (Economy, Premium Economy, Business, First Class)",
      "Special Airside Passenger Assistance: Wheelchair, Stretcher, Unaccompanied Minor",
      "Instant PNR Generation, Web Check-in & Boarding Pass Issuance to WhatsApp",
      "24/7 Dedicated Air Ticketing Operations Desk for Flight Changes & Urgent Cancellations",
    ],
  },
];

function DedicatedSpecialServicesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedOptionId, setSelectedOptionId] = useState<SpecialServiceOptionId>("Tours & Travel (Honeymoon/Couples)");
  const [heroSlideIndex, setHeroSlideIndex] = useState<number>(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  // URL search parameter synchronization (e.g. ?sub=medevac or ?sub=air_amb or ?sub=visa)
  useEffect(() => {
    const searchObj = (location.search || {}) as Record<string, unknown>;
    const subParam = typeof searchObj.sub === "string" ? searchObj.sub : undefined;
    if (!subParam) return;
    const sub = subParam.toLowerCase();
    let targetId: SpecialServiceOptionId | null = null;
    if (sub.includes("air_amb") || sub.includes("air-amb") || sub === "medevac" || sub === "ambulance") {
      targetId = "Air Ambulance (Airborne ICU Jet)";
    } else if (sub.includes("train")) {
      targetId = "Train Ambulance (Train ICU Escort)";
    } else if (sub === "hum" || sub.includes("remains")) {
      targetId = "Dignified Human Remains (HUM)";
    } else if (sub.includes("visa")) {
      targetId = "Visa Assistance Services";
    } else if (sub.includes("cargo") || sub.includes("avi") || sub.includes("pet")) {
      targetId = "Cargo & AVI Pet Freight";
    } else if (sub.includes("ticket") || sub.includes("flight")) {
      targetId = "Air Ticketing Services";
    } else if (sub.includes("pso") || sub.includes("security")) {
      targetId = "PSO (Personal Security Officer / VIP Shopping)";
    } else if (sub.includes("tour") || sub.includes("honeymoon")) {
      targetId = "Tours & Travel (Honeymoon/Couples)";
    } else if (sub.includes("spa") || sub.includes("wellness")) {
      targetId = "Spa & Wellness";
    }

    if (targetId) {
      setSelectedOptionId(targetId);
      const slideIdx = SPECIAL_HERO_SLIDES.findIndex((s) => s.linkedOptionId === targetId);
      if (slideIdx !== -1) {
        setHeroSlideIndex(slideIdx);
      }
    }
  }, [location.search]);

  // Touch and Drag handlers for Hero Carousel (3 authentic slides)
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
        setHeroSlideIndex((prev) => {
          const next = (prev + 1) % SPECIAL_HERO_SLIDES.length;
          setSelectedOptionId(SPECIAL_HERO_SLIDES[next].linkedOptionId);
          return next;
        });
      } else if (dragOffset > 45) {
        setHeroSlideIndex((prev) => {
          const next = (prev - 1 + SPECIAL_HERO_SLIDES.length) % SPECIAL_HERO_SLIDES.length;
          setSelectedOptionId(SPECIAL_HERO_SLIDES[next].linkedOptionId);
          return next;
        });
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
        setHeroSlideIndex((prev) => {
          const next = (prev + 1) % SPECIAL_HERO_SLIDES.length;
          setSelectedOptionId(SPECIAL_HERO_SLIDES[next].linkedOptionId);
          return next;
        });
      } else if (dragOffset > 45) {
        setHeroSlideIndex((prev) => {
          const next = (prev - 1 + SPECIAL_HERO_SLIDES.length) % SPECIAL_HERO_SLIDES.length;
          setSelectedOptionId(SPECIAL_HERO_SLIDES[next].linkedOptionId);
          return next;
        });
      }
    }
    setDragStartX(null);
    setDragOffset(0);
    setIsDragging(false);
  };

  const handleSelectOption = (optId: SpecialServiceOptionId) => {
    setSelectedOptionId(optId);
    const heroIdx = SPECIAL_HERO_SLIDES.findIndex((s) => s.linkedOptionId === optId);
    if (heroIdx !== -1) {
      setHeroSlideIndex(heroIdx);
    }
  };

  const activeOption =
    SPECIAL_SERVICES_OPTIONS.find((o) => o.id === selectedOptionId) ||
    SPECIAL_SERVICES_OPTIONS[0];

  // ─────────────────────────────────────────────────────────────
  // STREAMLINED ENQUIRY-BASED FORM STATES (MINIMUM REQUIRED)
  // ─────────────────────────────────────────────────────────────

  // 1. Spa & Wellness (Location, Date/Time, Guests, Optional Preferences)
  const [spaLocation, setSpaLocation] = useState("");
  const [spaDate, setSpaDate] = useState("");
  const [spaGuests, setSpaGuests] = useState(2);
  const [spaNotes, setSpaNotes] = useState("");

  // 2. Tours & Travel (Destination, Dates/Month, Guests, Optional Wishes)
  const [tourDestination, setTourDestination] = useState("");
  const [tourDates, setTourDates] = useState("");
  const [tourGuests, setTourGuests] = useState(2);
  const [tourNotes, setTourNotes] = useState("");

  // 3. PSO Close Protection (Location, Dates/Duration, Scope, Notes)
  const [psoLocation, setPsoLocation] = useState("");
  const [psoDates, setPsoDates] = useState("");
  const [psoScope, setPsoScope] = useState("VIP Luxury Shopping Escort");
  const [psoNotes, setPsoNotes] = useState("");

  // 4. Air Ambulance (From, To, Urgency/Date, Patient Condition)
  const [airAmbPickup, setAirAmbPickup] = useState("");
  const [airAmbDest, setAirAmbDest] = useState("");
  const [airAmbDate, setAirAmbDate] = useState("");
  const [airAmbNotes, setAirAmbNotes] = useState("");

  // 5. Train Ambulance (From Station, To Station, Date, Medical Support)
  const [trainAmbOrigin, setTrainAmbOrigin] = useState("");
  const [trainAmbDest, setTrainAmbDest] = useState("");
  const [trainAmbDate, setTrainAmbDate] = useState("");
  const [trainAmbNotes, setTrainAmbNotes] = useState("");

  // 6. HUM Remains Repatriation (From City, To Destination, Date, Scope)
  const [humOrigin, setHumOrigin] = useState("");
  const [humDest, setHumDest] = useState("");
  const [humDate, setHumDate] = useState("");
  const [humScope, setHumScope] = useState("Domestic Repatriation (Airport to Airport)");

  // 7. Visa Assistance (Country, Category, Date, Applicants)
  const [visaCountry, setVisaCountry] = useState("");
  const [visaCategory, setVisaCategory] = useState("Tourist / Visitor Visa");
  const [visaDate, setVisaDate] = useState("");
  const [visaApplicants, setVisaApplicants] = useState(1);

  // 8. Cargo & AVI Pet Freight (From, To, Pet/Cargo Details, Date)
  const [cargoOrigin, setCargoOrigin] = useState("");
  const [cargoDest, setCargoDest] = useState("");
  const [cargoDetails, setCargoDetails] = useState("");
  const [cargoDate, setCargoDate] = useState("");

  // 9. Air Ticketing (From, To, Travel Date, Class & Pax, Notes)
  const [ticketOrigin, setTicketOrigin] = useState("");
  const [ticketDest, setTicketDest] = useState("");
  const [ticketDate, setTicketDate] = useState("");
  const [ticketClass, setTicketClass] = useState("Economy Class");
  const [ticketPax, setTicketPax] = useState(1);
  const [ticketNotes, setTicketNotes] = useState("");

  // Common Contact Details (Required for desk follow-up)
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
    let serviceCategory: "Travel Support" | "Cargo & Logistics" = "Travel Support";
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
        notes: spaNotes,
      };
      notes = `${spaGuests} Guests — ${spaNotes || "No specific request"}`;
      serviceType = "Spa & Wellness";
    } else if (selectedOptionId === "Tours & Travel (Honeymoon/Couples)") {
      origin = tourDestination;
      destination = tourDestination;
      serviceDate = tourDates || undefined;
      details = {
        service: selectedOptionId,
        destination: tourDestination,
        dates: tourDates,
        guests: tourGuests,
        notes: tourNotes,
      };
      notes = `${tourGuests} Travelers for ${tourDestination} (${tourDates}) — ${tourNotes || "None"}`;
      serviceType = "Travel Support";
    } else if (selectedOptionId === "PSO (Personal Security Officer / VIP Shopping)") {
      origin = psoLocation;
      destination = psoLocation;
      serviceDate = psoDates || undefined;
      details = {
        service: selectedOptionId,
        location: psoLocation,
        dates: psoDates,
        scope: psoScope,
        notes: psoNotes,
      };
      notes = `${psoScope} in ${psoLocation} — ${psoNotes || "None"}`;
      serviceType = "VIP Escort";
    } else if (selectedOptionId === "Air Ambulance (Airborne ICU Jet)") {
      origin = airAmbPickup;
      destination = airAmbDest;
      serviceDate = airAmbDate || undefined;
      details = {
        service: selectedOptionId,
        pickup_hospital: airAmbPickup,
        destination_hospital: airAmbDest,
        date: airAmbDate,
        condition: airAmbNotes,
      };
      notes = `Transfer from ${airAmbPickup} to ${airAmbDest} — Patient Status: ${airAmbNotes || "Urgent Air Ambulance"}`;
      serviceType = "Air Ambulance";
    } else if (selectedOptionId === "Train Ambulance (Train ICU Escort)") {
      origin = trainAmbOrigin;
      destination = trainAmbDest;
      serviceDate = trainAmbDate || undefined;
      details = {
        service: selectedOptionId,
        origin_station: trainAmbOrigin,
        destination_station: trainAmbDest,
        date: trainAmbDate,
        medical_support: trainAmbNotes,
      };
      notes = `Rail Transfer from ${trainAmbOrigin} to ${trainAmbDest} — Needs: ${trainAmbNotes || "Doctor & Oxygen Escort"}`;
      serviceType = "Train Ambulance";
    } else if (selectedOptionId === "Dignified Human Remains (HUM)") {
      origin = humOrigin;
      destination = humDest;
      serviceDate = humDate || undefined;
      details = {
        service: selectedOptionId,
        departure_city: humOrigin,
        arrival_destination: humDest,
        date: humDate,
        scope: humScope,
      };
      notes = `${humScope} from ${humOrigin} to ${humDest} on ${humDate}`;
      serviceType = "Human Remains Repatriation";
    } else if (selectedOptionId === "Visa Assistance Services") {
      origin = "India";
      destination = visaCountry;
      serviceDate = visaDate || undefined;
      details = {
        service: selectedOptionId,
        destination_country: visaCountry,
        visa_category: visaCategory,
        travel_date: visaDate,
        applicants_count: visaApplicants,
      };
      notes = `${visaCategory} for ${visaCountry} (${visaApplicants} Applicants)`;
      serviceType = "Visa Assistance";
    } else if (selectedOptionId === "Cargo & AVI Pet Freight") {
      origin = cargoOrigin;
      destination = cargoDest;
      serviceDate = cargoDate || undefined;
      serviceCategory = "Cargo & Logistics";
      details = {
        service: selectedOptionId,
        origin: cargoOrigin,
        destination: cargoDest,
        cargo_pet_details: cargoDetails,
        date: cargoDate,
      };
      notes = `Cargo/Pet Details: ${cargoDetails} from ${cargoOrigin} to ${cargoDest}`;
      serviceType = "Cargo Assistance";
    } else if (selectedOptionId === "Air Ticketing Services") {
      origin = ticketOrigin;
      destination = ticketDest;
      serviceDate = ticketDate || undefined;
      details = {
        service: selectedOptionId,
        origin: ticketOrigin,
        destination: ticketDest,
        travel_date: ticketDate,
        cabin_class: ticketClass,
        passengers_count: ticketPax,
        class_passengers: `${ticketClass} (${ticketPax} Pax)`,
        notes: ticketNotes,
      };
      notes = `Flight Inquiry: ${ticketOrigin} to ${ticketDest} — ${ticketClass} (${ticketPax} Pax) — Notes: ${ticketNotes || "None"}`;
      serviceType = "Air Ticketing";
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
      alert("Something went wrong while submitting your enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppDirectLink = () => {
    let details = "";
    if (selectedOptionId === "Spa & Wellness") {
      details = `Location: ${spaLocation}%0ADate: ${spaDate}%0AGuests: ${spaGuests}%0APreferences: ${spaNotes || "None"}`;
    } else if (selectedOptionId === "Tours & Travel (Honeymoon/Couples)") {
      details = `Destination: ${tourDestination}%0ATravel Dates: ${tourDates}%0AGuests: ${tourGuests}%0ANotes: ${tourNotes || "None"}`;
    } else if (selectedOptionId === "PSO (Personal Security Officer / VIP Shopping)") {
      details = `Location: ${psoLocation}%0ADates: ${psoDates}%0AScope: ${psoScope}%0ANotes: ${psoNotes || "None"}`;
    } else if (selectedOptionId === "Air Ambulance (Airborne ICU Jet)") {
      details = `From: ${airAmbPickup}%0ATo: ${airAmbDest}%0ADate/Urgency: ${airAmbDate}%0APatient Needs: ${airAmbNotes || "Urgent"}`;
    } else if (selectedOptionId === "Train Ambulance (Train ICU Escort)") {
      details = `From: ${trainAmbOrigin}%0ATo: ${trainAmbDest}%0ADate: ${trainAmbDate}%0AMedical Needs: ${trainAmbNotes || "Oxygen & Escort"}`;
    } else if (selectedOptionId === "Dignified Human Remains (HUM)") {
      details = `From: ${humOrigin}%0ATo: ${humDest}%0ATimeline: ${humDate}%0AScope: ${humScope}`;
    } else if (selectedOptionId === "Visa Assistance Services") {
      details = `Country: ${visaCountry}%0ACategory: ${visaCategory}%0ATravel Date: ${visaDate}%0AApplicants: ${visaApplicants}`;
    } else if (selectedOptionId === "Cargo & AVI Pet Freight") {
      details = `From: ${cargoOrigin}%0ATo: ${cargoDest}%0ACargo/Pet: ${cargoDetails}%0ADate: ${cargoDate}`;
    } else if (selectedOptionId === "Air Ticketing Services") {
      details = `Sector: ${ticketOrigin} to ${ticketDest}%0ADate: ${ticketDate}%0ACabin Class: ${ticketClass}%0APassengers: ${ticketPax}%0ANotes: ${ticketNotes || "None"}`;
    }

    const text = `Hello Shafsky VIP Concierge Desk,%0A%0AI would like to inquire about:%0A*Service:* ${selectedOptionId}%0A${details}%0A%0A*Name:* ${clientName}%0A*Phone:* ${phone}%0A*Email:* ${email || "N/A"}`;
    return `https://wa.me/919599087959?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-lime-200">
      {/* ─────────────────────────────────────────────────────────────
          1. CLASSICAL FRAMED CINEMATIC HERO MEDIA STAGE (100% RATIO, WHITE BACKGROUND)
             Exclusively features the 3 authentic photos (Spa, Tours, PSO).
          ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-white border-b border-slate-200 py-6 sm:py-8 md:py-10">
        <div className="relative z-10 mx-auto w-full max-w-[1040px] xl:max-w-[1100px] 2xl:max-w-[1140px] px-4 sm:px-6 md:px-8">
          {/* Top Header Row: Back Button & Status Badge */}
          <div className="w-full mb-3.5 sm:mb-5 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  navigate({ to: "/" });
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/90 text-xs font-semibold shadow-xs hover:border-lime-500 transition-all cursor-pointer"
            >
              <ArrowLeft size={14} className="text-lime-600" />
              <span>Back</span>
            </button>

            <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-mono font-bold text-lime-800 uppercase tracking-widest bg-lime-50 px-3.5 sm:px-4 py-1.5 rounded-full border border-lime-300 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-lime-500 inline-block animate-pulse" />
              <span>SPECIAL SERVICES & EXECUTIVE CONCIERGE</span>
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
            {/* Swipeable Track mapping ONLY the 3 authentic photos */}
            <div
              className={`flex w-full h-full absolute inset-0 ${isDragging ? "transition-none" : "transition-transform duration-500 ease-out"}`}
              style={{
                transform: `translateX(calc(-${heroSlideIndex * 100}% + ${dragOffset}px))`,
              }}
            >
              {SPECIAL_HERO_SLIDES.map((slide, idx) => (
                <div
                  key={slide.id}
                  className="w-full h-full shrink-0 relative flex items-center justify-center overflow-hidden bg-white"
                >
                  <img width={1600} height={900} src={slide.photo}
                    alt={slide.label}
                    className="w-full h-full object-contain object-center select-none block pointer-events-none bg-white"
                    loading={idx <= 1 ? "eager" : "lazy"}
                    draggable={false}
                  />
                </div>
              ))}
            </div>

            {/* Slide Navigation Overlay Buttons */}
            <div className="absolute inset-y-0 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between pointer-events-none z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHeroSlideIndex((prev) => {
                    const next = (prev - 1 + SPECIAL_HERO_SLIDES.length) % SPECIAL_HERO_SLIDES.length;
                    setSelectedOptionId(SPECIAL_HERO_SLIDES[next].linkedOptionId);
                    return next;
                  });
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
                  setHeroSlideIndex((prev) => {
                    const next = (prev + 1) % SPECIAL_HERO_SLIDES.length;
                    setSelectedOptionId(SPECIAL_HERO_SLIDES[next].linkedOptionId);
                    return next;
                  });
                }}
                className="pointer-events-auto p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 backdrop-blur-md transition shadow-md cursor-pointer border border-slate-200 hover:border-lime-500 hover:text-lime-700"
                aria-label="Next slide"
              >
                <ArrowRight size={16} className="sm:hidden text-slate-800" />
                <ArrowRight size={18} className="hidden sm:block text-slate-800" />
              </button>
            </div>
          </div>

          {/* Slide Pagination Indicator Dots (3 dots for the 3 authentic photos) */}
          <div className="mt-3 sm:mt-4 flex items-center justify-center">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
              {SPECIAL_HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHeroSlideIndex(idx);
                    setSelectedOptionId(slide.linkedOptionId);
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

      {/* ─────────────────────────────────────────────────────────────
          2. ALL 9 SPECIAL SERVICES PILL SELECTOR
          ───────────────────────────────────────────────────────────── */}
      <section className="py-8 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-lime-700 bg-lime-50 px-3.5 py-1 rounded-full border border-lime-200">
              SELECT YOUR SPECIAL SERVICE
            </span>
          </div>

          {/* 9 Option Buttons */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
            {SPECIAL_SERVICES_OPTIONS.map((opt) => {
              const IconComp = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    selectedOptionId === opt.id
                      ? "bg-lime-500 text-slate-950 shadow-md ring-2 ring-lime-400 border border-lime-600 scale-[1.02]"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-lime-400 hover:bg-lime-50/50"
                  }`}
                >
                  <IconComp size={13} className={selectedOptionId === opt.id ? "text-slate-950" : "text-lime-600"} />
                  <span>{opt.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. SUPER SIMPLE ENQUIRY PANEL (MINIMUM REQUIRED FIELDS)
          ───────────────────────────────────────────────────────────── */}
      <section id="request-form" className="py-12 sm:py-16 bg-slate-50/70 border-b border-slate-200 px-4 sm:px-6 lg:px-8 scroll-mt-6">
        <div className="mx-auto max-w-3xl">
          {/* Active Option Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-lime-700 mb-2">
              <Sparkles size={13} className="text-lime-600" />
              <span>QUICK ENQUIRY • CUSTOM QUOTATION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950" style={display}>
              {activeOption.label} Enquiry
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Share your details below to receive a custom quote within 15 minutes, or chat directly with our concierge desk.
            </p>
          </div>

          {/* Success State / Reference Card */}
          {submittedRef ? (
            <div className="bg-white rounded-3xl border border-lime-400 p-8 sm:p-12 text-center shadow-lg">
              <div className="w-16 h-16 rounded-full bg-lime-100 border border-lime-300 flex items-center justify-center mx-auto mb-4 text-lime-700">
                <CheckCircle2 size={32} />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-lime-700">
                ENQUIRY RECEIVED SUCCESSFULLY
              </span>
              <h3 className="text-3xl font-extrabold text-slate-950 mt-1 mb-2" style={display}>
                Reference #{submittedRef}
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                Thank you, <strong className="text-slate-900">{clientName || "Guest"}</strong>. Your enquiry for <strong className="text-slate-900">{selectedOptionId}</strong> has been logged. Our VIP desk will contact you within 15 minutes.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={getWhatsAppDirectLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs font-mono tracking-wider shadow-md transition-all"
                >
                  <MessageSquare size={15} />
                  <span>Chat on WhatsApp Directly</span>
                </a>
                <button
                  onClick={() => setSubmittedRef(null)}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs font-mono tracking-wider transition-all"
                >
                  Submit Another Enquiry
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <form onSubmit={handleSubmitRequest} className="space-y-6">
                {/* User Contact Details (Placed Upper) */}
                <div className="pb-5 border-b border-slate-100">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-lime-700 block mb-3">
                    Your Contact Details (For Fast Response)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 1. Spa & Wellness Minimal Enquiry */}
                {selectedOptionId === "Spa & Wellness" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Preferred City / Hotel *
                        </label>
                        <input
                          type="text"
                          value={spaLocation}
                          onChange={(e) => setSpaLocation(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Preferred Date & Time *
                        </label>
                        <input
                          type="date"
                          value={spaDate}
                          onChange={(e) => setSpaDate(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Guests *
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={spaGuests}
                          onChange={(e) => setSpaGuests(parseInt(e.target.value) || 1)}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Treatment or Preferences (Optional)
                        </label>
                        <input
                          type="text"
                          value={spaNotes}
                          onChange={(e) => setSpaNotes(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Tours & Travel Minimal Enquiry */}
                {selectedOptionId === "Tours & Travel (Honeymoon/Couples)" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Destination / Circuit *
                        </label>
                        <input
                          type="text"
                          value={tourDestination}
                          onChange={(e) => setTourDestination(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Travel Dates or Month *
                        </label>
                        <input
                          type="date"
                          value={tourDates}
                          onChange={(e) => setTourDates(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Travelers *
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={tourGuests}
                          onChange={(e) => setTourGuests(parseInt(e.target.value) || 2)}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Special Wishes & Preferences (Optional)
                        </label>
                        <input
                          type="text"
                          value={tourNotes}
                          onChange={(e) => setTourNotes(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PSO Close Protection Minimal Enquiry */}
                {selectedOptionId === "PSO (Personal Security Officer / VIP Shopping)" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                          City / Deployment Location *
                        </label>
                        <input
                          type="text"
                          value={psoLocation}
                          onChange={(e) => setPsoLocation(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Dates / Duration *
                        </label>
                        <input
                          type="date"
                          value={psoDates}
                          onChange={(e) => setPsoDates(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Scope of Detail *
                        </label>
                        <select
                          value={psoScope}
                          onChange={(e) => setPsoScope(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                        >
                          <option value="VIP Luxury Shopping Escort">VIP Luxury Shopping Escort</option>
                          <option value="24/7 Close Protection Officer">24/7 Close Protection Officer</option>
                          <option value="Armored Convoy & Airport Transit">Armored Convoy & Airport Transit</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Specific Security Notes (Optional)
                        </label>
                        <input
                          type="text"
                          value={psoNotes}
                          onChange={(e) => setPsoNotes(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

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
                {selectedOptionId === "Train Ambulance (Train ICU Escort)" && (
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
                {selectedOptionId === "Dignified Human Remains (HUM)" && (
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
                          value={cargoDate}
                          onChange={(e) => setCargoDate(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. Air Ticketing Minimal Enquiry */}
                {selectedOptionId === "Air Ticketing Services" && (
                  <div className="space-y-4">
                    {/* Airports */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Departure Airport / City *
                        </label>
                        <IntelligentAirportAutocomplete
                          mode="global"
                          value={ticketOrigin}
                          placeholder=""
                          inputClassName="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                          showIcon={false}
                          onSelect={(ap) => setTicketOrigin(formatAirportOption(ap))}
                          onChangeText={(txt) => setTicketOrigin(txt)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Destination Airport / City *
                        </label>
                        <IntelligentAirportAutocomplete
                          mode="global"
                          value={ticketDest}
                          placeholder=""
                          inputClassName="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                          showIcon={false}
                          onSelect={(ap) => setTicketDest(formatAirportOption(ap))}
                          onChangeText={(txt) => setTicketDest(txt)}
                        />
                      </div>
                    </div>

                    {/* Travel Date, Cabin Class & Passengers Count (Separated) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Travel Date(s) *
                        </label>
                        <input
                          type="date"
                          value={ticketDate}
                          onChange={(e) => setTicketDate(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Cabin Class *
                        </label>
                        <select
                          value={ticketClass}
                          onChange={(e) => setTicketClass(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                        >
                          <option value="Economy Class">Economy Class</option>
                          <option value="Premium Economy">Premium Economy</option>
                          <option value="Business Class">Business Class</option>
                          <option value="First Class">First Class</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Passengers Count *
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={ticketPax}
                          onChange={(e) => setTicketPax(Math.max(1, parseInt(e.target.value) || 1))}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                        />
                      </div>
                    </div>

                    {/* Specific Notes / Preferences */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Specific Flight or Airline Preference (Optional)
                      </label>
                      <input
                        type="text"
                        value={ticketNotes}
                        onChange={(e) => setTicketNotes(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons: Fast WhatsApp + Direct Lead Submit */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
                  <a
                    href={getWhatsAppDirectLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs font-mono tracking-wider transition-all"
                  >
                    <MessageSquare size={14} className="text-lime-400" />
                    <span>Instant WhatsApp Enquiry</span>
                  </a>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs font-mono tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send size={14} />
                    <span>{isSubmitting ? "Sending..." : "Submit Enquiry"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. COMPANY CATALOG CONTENT & SPECIFICATIONS
             - Left Column: Active Service inclusions + authentic photo (if Spa/Tours/PSO)
               OR authoritative VIP Protocol / Medevac card (if mission service, ZERO fake stock photos)
             - Right Column: All 9 services overview cards
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
              Luxury couple wellness, curated honeymoon circuits, close protection, 24/7 medevac & rail ICU, dignified HUM repatriation, visa assistance, cargo pet logistics, and commercial air ticketing.
            </p>
          </div>

          {/* Single Column Classical Layout for Active Selection */}
          <div className="max-w-4xl mx-auto flex flex-col justify-start">
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-lime-700 font-mono font-bold mb-3">
                <span className="w-2 h-2 rounded-full bg-lime-500 inline-block" />
                {activeOption.badge}
              </div>

              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0a196f] tracking-tight mb-6" style={display}>
                {activeOption.label}
              </h3>

              {/* Visual Presentation:
                  If active option has an authentic photo (Spa, Tours, PSO) -> show 100% full 16:9 uncropped photo.
                  If active option is one of the 6 specialized mission services -> show an authoritative VIP Protocol card (ZERO fake stock photos).
              */}
              {activeOption.photo ? (
                <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white aspect-[16/9]">
                  <img width={1600} height={900} loading="lazy"
                    decoding="async"
                    src={activeOption.photo}
                    alt={activeOption.label}
                    className="w-full h-full object-contain object-center select-none bg-white"
                  />
                </div>
              ) : (
                <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-900 text-white p-6 sm:p-7 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-lime-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                      {React.createElement(activeOption.icon, { size: 24, className: "text-slate-950" })}
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-lime-400 bg-lime-950/80 border border-lime-500/40 px-3 py-1 rounded-full uppercase tracking-widest">
                      <Clock size={11} className="text-lime-400" />
                      <span>24/7 PRIORITY OPS DESK</span>
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white mb-1.5" style={display}>
                    VIP Protocol & Executive Mission Clearance
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Direct coordinator dispatch, regulatory approvals, and end-to-end mission monitoring by the Shafsky Aviation Operations Room.
                  </p>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="inline-flex items-center gap-2 text-slate-300">
                      <ShieldAlert size={14} className="text-lime-400" />
                      <span className="font-mono text-[11px]">Strict Confidentiality & SLA Guarantee</span>
                    </div>
                    <a
                      href="tel:+919599087959"
                      className="inline-flex items-center gap-1.5 text-lime-400 hover:text-lime-300 font-mono text-[11px] font-bold"
                    >
                      <PhoneCall size={12} />
                      <span>+91 95990 87959</span>
                    </a>
                  </div>
                </div>
              )}

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

      <Footer />
    </div>
  );
}