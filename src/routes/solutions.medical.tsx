import React, { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link, useLocation } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Send,
  CheckCircle2,
  MessageSquare,
  Plane
} from "lucide-react";
import { display } from "@/components/home/theme";
import { enquiryApi } from "@/lib/api/enquiryApi";
import { ASSETS } from "@/lib/assets";
import spaWellnessImg from "@/assets/others/spa-wellness.jpg";
import tajMahalImg from "@/assets/homepage/widescreen/home3.jpeg";
import psoSecurityImg from "@/assets/others/pso-security.jpg";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/solutions/medical")({
  head: () =>
    pageHead({
      title: "VIP Special Services, Medevac, HUM, Visa, Cargo & Protocol | Shafsky",
      description:
        "Luxury spa and wellness, couples travel, PSO close protection, 24/7 air and train ambulance, HUM repatriation, visa assistance, cargo pet logistics, and commercial air ticketing.",
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
  | "PSO (Personal Security Officer / VIP Shopping)"
  | "Air Ambulance (Airborne ICU Jet)"
  | "Train Ambulance (Train ICU Escort)"
  | "Dignified Human Remains (HUM)"
  | "Visa Assistance Services"
  | "Cargo & AVI Pet Freight"
  | "Air Ticketing Services";

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
    photo: tajMahalImg,
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
  {
    id: "Air Ambulance (Airborne ICU Jet)",
    label: "Air Ambulance (Airborne ICU)",
    badge: "24/7 AIRBORNE ICU & BED-TO-BED MEDICAL EVACUATION",
    tagline: "Dedicated ICU aircraft, certified aero-medical doctors, and seamless bed-to-bed hospital transfer across India and worldwide.",
    photo: ASSETS.medical,
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
    label: "Train Ambulance (ICU Escort)",
    badge: "RAILWAY ICU TRANSFER & MEDICAL ESCORT",
    tagline: "Cost-effective long-distance patient rail transfer in 1AC/2AC medical coupes equipped with doctors, continuous oxygen, and monitoring.",
    photo: ASSETS.medicalAssist,
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
    label: "HUM (Human Remains Transport)",
    badge: "DIGNIFIED REPATRIATION & MORTUARY DISPATCH",
    tagline: "Compassionate, fully documented repatriation of mortal remains across domestic and international aviation sectors.",
    photo: ASSETS.interior,
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
    label: "Visa Assistance",
    badge: "FAST-TRACK DIPLOMATIC & CORPORATE VISA ASSIST",
    tagline: "Expedited visa processing, VIP doorstep biometrics, document vetting, and priority embassy liaison for international travel.",
    photo: ASSETS.fastTrack,
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
    label: "Cargo & AVI Pet Booking",
    badge: "AIR FREIGHT & IATA LIVE ANIMAL (AVI) LOGISTICS",
    tagline: "Specialized aviation freight handling, IATA-compliant live animal & pet booking, and airside customs documentation clearance.",
    photo: ASSETS.cargo,
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
    label: "Air Ticketing (Domestic & Intl)",
    badge: "DOMESTIC & INTERNATIONAL AIRLINE TICKETING",
    tagline: "Instant domestic and international airline bookings across 500+ commercial carriers, flexible corporate fares, and VIP seat assignments.",
    photo: ASSETS.plane,
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
  const [selectedOptionId, setSelectedOptionId] = useState<SpecialServiceOptionId>("Spa & Wellness");
  const [heroSlideIndex, setHeroSlideIndex] = useState<number>(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

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
      const idx = SPECIAL_SERVICES_OPTIONS.findIndex((o) => o.id === targetId);
      if (idx !== -1) setHeroSlideIndex(idx);
    }
  }, [location.search]);

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
          const next = (prev + 1) % SPECIAL_SERVICES_OPTIONS.length;
          setSelectedOptionId(SPECIAL_SERVICES_OPTIONS[next].id);
          return next;
        });
      } else if (dragOffset > 45) {
        setHeroSlideIndex((prev) => {
          const next = (prev - 1 + SPECIAL_SERVICES_OPTIONS.length) % SPECIAL_SERVICES_OPTIONS.length;
          setSelectedOptionId(SPECIAL_SERVICES_OPTIONS[next].id);
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
          const next = (prev + 1) % SPECIAL_SERVICES_OPTIONS.length;
          setSelectedOptionId(SPECIAL_SERVICES_OPTIONS[next].id);
          return next;
        });
      } else if (dragOffset > 45) {
        setHeroSlideIndex((prev) => {
          const next = (prev - 1 + SPECIAL_SERVICES_OPTIONS.length) % SPECIAL_SERVICES_OPTIONS.length;
          setSelectedOptionId(SPECIAL_SERVICES_OPTIONS[next].id);
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
    const idx = SPECIAL_SERVICES_OPTIONS.findIndex((o) => o.id === optId);
    if (idx !== -1) setHeroSlideIndex(idx);
  };

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

  // 4. Air Ambulance states
  const [airAmbPickup, setAirAmbPickup] = useState("");
  const [airAmbDest, setAirAmbDest] = useState("");
  const [airAmbDate, setAirAmbDate] = useState("");
  const [airAmbAircraft, setAirAmbAircraft] = useState("Dedicated Airborne ICU Jet (Learjet / Hawker)");
  const [airAmbCondition, setAirAmbCondition] = useState("Critical Care / Ventilator Required");
  const [airAmbNotes, setAirAmbNotes] = useState("");

  // 5. Train Ambulance states
  const [trainAmbOrigin, setTrainAmbOrigin] = useState("");
  const [trainAmbDest, setTrainAmbDest] = useState("");
  const [trainAmbDate, setTrainAmbDate] = useState("");
  const [trainAmbCoach, setTrainAmbCoach] = useState("1AC Air-Conditioned Reserved Medical Coupe");
  const [trainAmbCondition, setTrainAmbCondition] = useState("Stable with Oxygen & Doctor Escort");
  const [trainAmbNotes, setTrainAmbNotes] = useState("");

  // 6. HUM (Human Remains Transport) states
  const [humOrigin, setHumOrigin] = useState("");
  const [humDest, setHumDest] = useState("");
  const [humDate, setHumDate] = useState("");
  const [humScope, setHumScope] = useState("Domestic Repatriation (Airport to Airport)");
  const [humNotes, setHumNotes] = useState("");

  // 7. Visa Assistance states
  const [visaCountry, setVisaCountry] = useState("");
  const [visaCategory, setVisaCategory] = useState("Tourist / Visitor Visa");
  const [visaTravelDate, setVisaTravelDate] = useState("");
  const [visaApplicants, setVisaApplicants] = useState(1);
  const [visaNotes, setVisaNotes] = useState("");

  // 8. Cargo & AVI Pet Freight states
  const [cargoOrigin, setCargoOrigin] = useState("");
  const [cargoDest, setCargoDest] = useState("");
  const [cargoDate, setCargoDate] = useState("");
  const [cargoCategory, setCargoCategory] = useState("Live Animal / Pet Relocation (AVI)");
  const [cargoWeight, setCargoWeight] = useState("");
  const [cargoNotes, setCargoNotes] = useState("");

  // 9. Air Ticketing states
  const [ticketOrigin, setTicketOrigin] = useState("");
  const [ticketDest, setTicketDest] = useState("");
  const [ticketDate, setTicketDate] = useState("");
  const [ticketTripType, setTicketTripType] = useState("One Way");
  const [ticketClass, setTicketClass] = useState("Economy Class");
  const [ticketPassengers, setTicketPassengers] = useState(1);
  const [ticketNotes, setTicketNotes] = useState("");

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
    } else if (selectedOptionId === "Air Ambulance (Airborne ICU Jet)") {
      origin = airAmbPickup;
      destination = airAmbDest;
      serviceDate = airAmbDate || undefined;
      details = {
        service: selectedOptionId,
        pickup_city: airAmbPickup,
        destination_hospital: airAmbDest,
        date: airAmbDate,
        aircraft_type: airAmbAircraft,
        patient_condition: airAmbCondition,
        clinical_notes: airAmbNotes,
      };
      notes = `${airAmbAircraft} | Condition: ${airAmbCondition} — ${airAmbNotes || "None"}`;
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
        coach_class: trainAmbCoach,
        patient_condition: trainAmbCondition,
        clinical_notes: trainAmbNotes,
      };
      notes = `${trainAmbCoach} | Condition: ${trainAmbCondition} — ${trainAmbNotes || "None"}`;
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
        repatriation_scope: humScope,
        documentation_notes: humNotes,
      };
      notes = `${humScope} — ${humNotes || "None"}`;
      serviceType = "Human Remains Repatriation";
    } else if (selectedOptionId === "Visa Assistance Services") {
      origin = "India";
      destination = visaCountry;
      serviceDate = visaTravelDate || undefined;
      details = {
        service: selectedOptionId,
        destination_country: visaCountry,
        visa_category: visaCategory,
        travel_date: visaTravelDate,
        applicants_count: visaApplicants,
        requirements: visaNotes,
      };
      notes = `${visaCategory} for ${visaCountry} (${visaApplicants} Pax) — ${visaNotes || "None"}`;
      serviceType = "Visa Assistance";
    } else if (selectedOptionId === "Cargo & AVI Pet Freight") {
      origin = cargoOrigin;
      destination = cargoDest;
      serviceDate = cargoDate || undefined;
      serviceCategory = "Cargo & Logistics";
      details = {
        service: selectedOptionId,
        origin_airport: cargoOrigin,
        destination_airport: cargoDest,
        date: cargoDate,
        cargo_category: cargoCategory,
        weight_volume: cargoWeight,
        manifest_notes: cargoNotes,
      };
      notes = `${cargoCategory} | Wt: ${cargoWeight || "TBD"} — ${cargoNotes || "None"}`;
      serviceType = "Cargo Assistance";
    } else if (selectedOptionId === "Air Ticketing Services") {
      origin = ticketOrigin;
      destination = ticketDest;
      serviceDate = ticketDate || undefined;
      details = {
        service: selectedOptionId,
        origin_airport: ticketOrigin,
        destination_airport: ticketDest,
        travel_date: ticketDate,
        trip_type: ticketTripType,
        cabin_class: ticketClass,
        passenger_count: ticketPassengers,
        passenger_notes: ticketNotes,
      };
      notes = `${ticketTripType} ${ticketClass} (${ticketPassengers} Pax) from ${ticketOrigin} to ${ticketDest} — ${ticketNotes || "None"}`;
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
    } else if (selectedOptionId === "Air Ambulance (Airborne ICU Jet)") {
      details = `Pickup Hospital/City: ${airAmbPickup}%0ADestination: ${airAmbDest}%0ADate: ${airAmbDate}%0AAircraft: ${airAmbAircraft}%0APatient Condition: ${airAmbCondition}%0ANotes: ${airAmbNotes || "None"}`;
    } else if (selectedOptionId === "Train Ambulance (Train ICU Escort)") {
      details = `Origin Station: ${trainAmbOrigin}%0ADestination Station: ${trainAmbDest}%0ADate: ${trainAmbDate}%0ACoach: ${trainAmbCoach}%0APatient Condition: ${trainAmbCondition}%0ANotes: ${trainAmbNotes || "None"}`;
    } else if (selectedOptionId === "Dignified Human Remains (HUM)") {
      details = `Origin: ${humOrigin}%0ADestination: ${humDest}%0ADate: ${humDate}%0AScope: ${humScope}%0ANotes: ${humNotes || "None"}`;
    } else if (selectedOptionId === "Visa Assistance Services") {
      details = `Country: ${visaCountry}%0ACategory: ${visaCategory}%0ATravel Date: ${visaTravelDate}%0AApplicants: ${visaApplicants}%0ANotes: ${visaNotes || "None"}`;
    } else if (selectedOptionId === "Cargo & AVI Pet Freight") {
      details = `Origin Airport: ${cargoOrigin}%0ADestination Airport: ${cargoDest}%0ADate: ${cargoDate}%0ACargo Type: ${cargoCategory}%0AWeight/Volume: ${cargoWeight}%0ANotes: ${cargoNotes || "None"}`;
    } else if (selectedOptionId === "Air Ticketing Services") {
      details = `Sector: ${ticketOrigin} to ${ticketDest}%0ADate: ${ticketDate}%0ATrip Type: ${ticketTripType}%0ACabin: ${ticketClass}%0APassengers: ${ticketPassengers}%0ANotes: ${ticketNotes || "None"}`;
    }

    const text = `Hello Shafsky Special Services Desk,%0A%0AI would like to request assistance for:%0A- Service: ${selectedOptionId}%0A${details}%0A- Client Name: ${clientName}%0A- Phone: ${phone}%0A- Email: ${email || "N/A"}`;
    return `https://wa.me/919599087959?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-lime-200">
      {/* ─────────────────────────────────────────────────────────────
          1. CLASSICAL FRAMED CINEMATIC HERO MEDIA STAGE (100% RATIO, WHITE BACKGROUND)
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
            {/* Swipeable Track */}
            <div
              className={`flex w-full h-full absolute inset-0 ${isDragging ? "transition-none" : "transition-transform duration-500 ease-out"}`}
              style={{
                transform: `translateX(calc(-${heroSlideIndex * 100}% + ${dragOffset}px))`,
              }}
            >
              {SPECIAL_SERVICES_OPTIONS.map((opt, idx) => (
                <div
                  key={opt.id}
                  className="w-full h-full shrink-0 relative flex items-center justify-center overflow-hidden bg-white"
                >
                  <img
                    src={opt.photo}
                    alt={opt.label}
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
                    const next = (prev - 1 + SPECIAL_SERVICES_OPTIONS.length) % SPECIAL_SERVICES_OPTIONS.length;
                    setSelectedOptionId(SPECIAL_SERVICES_OPTIONS[next].id);
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
                    const next = (prev + 1) % SPECIAL_SERVICES_OPTIONS.length;
                    setSelectedOptionId(SPECIAL_SERVICES_OPTIONS[next].id);
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

          {/* Slide Pagination Indicator Dots Below the Frame */}
          <div className="mt-3 sm:mt-4 flex items-center justify-center">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
              {SPECIAL_SERVICES_OPTIONS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHeroSlideIndex(idx);
                    setSelectedOptionId(SPECIAL_SERVICES_OPTIONS[idx].id);
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
                onClick={() => handleSelectOption(opt.id)}
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

                {/* 4. Air Ambulance (Airborne ICU Jet) Form */}
                {selectedOptionId === "Air Ambulance (Airborne ICU Jet)" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Pickup City / Transferring Hospital
                        </label>
                        <input
                          type="text"
                          value={airAmbPickup}
                          onChange={(e) => setAirAmbPickup(e.target.value)}
                          placeholder="e.g. Apollo Hospital, Chennai / Fortis, Delhi"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Destination City / Receiving Hospital
                        </label>
                        <input
                          type="text"
                          value={airAmbDest}
                          onChange={(e) => setAirAmbDest(e.target.value)}
                          placeholder="e.g. AIIMS Delhi / Mount Elizabeth Singapore"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Preferred Flight Date / Timing
                        </label>
                        <input
                          type="text"
                          value={airAmbDate}
                          onChange={(e) => setAirAmbDate(e.target.value)}
                          placeholder="e.g. Urgent / Today / 24 Oct"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Aircraft Fleet Type
                        </label>
                        <select
                          value={airAmbAircraft}
                          onChange={(e) => setAirAmbAircraft(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                        >
                          <option value="Dedicated Airborne ICU Jet (Learjet / Hawker)">Dedicated Airborne ICU Jet (Learjet / Hawker)</option>
                          <option value="Turboprop ICU (King Air B200 / C90)">Turboprop ICU (King Air B200 / C90)</option>
                          <option value="Commercial Airline Stretcher Clearance">Commercial Airline Stretcher Clearance</option>
                          <option value="Helicopter Emergency Medical Service (HEMS)">Helicopter Emergency Medical Service (HEMS)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Patient Clinical Status
                        </label>
                        <select
                          value={airAmbCondition}
                          onChange={(e) => setAirAmbCondition(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                        >
                          <option value="Critical Care / Ventilator Required">Critical Care / Ventilator Required</option>
                          <option value="ICU Monitored / High Flow Oxygen">ICU Monitored / High Flow Oxygen</option>
                          <option value="Stable Stretcher Patient with Medical Escort">Stable Stretcher Patient with Medical Escort</option>
                          <option value="Wheelchair / Non-Critical Medical Escort">Wheelchair / Non-Critical Medical Escort</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Clinical Summary, Diagnosis & Accompanying Family
                      </label>
                      <textarea
                        rows={2}
                        value={airAmbNotes}
                        onChange={(e) => setAirAmbNotes(e.target.value)}
                        placeholder="e.g. Diagnosis, oxygen flow rate (L/min), treating doctor contact, 1-2 attendants traveling..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  </>
                )}

                {/* 5. Train Ambulance (Train ICU Escort) Form */}
                {selectedOptionId === "Train Ambulance (Train ICU Escort)" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Departure Railway Station & City
                        </label>
                        <input
                          type="text"
                          value={trainAmbOrigin}
                          onChange={(e) => setTrainAmbOrigin(e.target.value)}
                          placeholder="e.g. Patna Junction / Guwahati / Lucknow"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Destination Railway Station & Hospital
                        </label>
                        <input
                          type="text"
                          value={trainAmbDest}
                          onChange={(e) => setTrainAmbDest(e.target.value)}
                          placeholder="e.g. New Delhi Railway Station / AIIMS"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Travel Date
                        </label>
                        <input
                          type="date"
                          value={trainAmbDate}
                          onChange={(e) => setTrainAmbDate(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Coach Compartment Preference
                        </label>
                        <select
                          value={trainAmbCoach}
                          onChange={(e) => setTrainAmbCoach(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                        >
                          <option value="1AC Air-Conditioned Reserved Medical Coupe">1AC Air-Conditioned Reserved Medical Coupe</option>
                          <option value="2AC Reserved Medical Berth with Escort">2AC Reserved Medical Berth with Escort</option>
                          <option value="Express Stretcher Station-to-Platform Transit">Express Stretcher Station-to-Platform Transit</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Patient Medical Condition
                        </label>
                        <select
                          value={trainAmbCondition}
                          onChange={(e) => setTrainAmbCondition(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                        >
                          <option value="Stable with Oxygen & Doctor Escort">Stable with Oxygen & Doctor Escort</option>
                          <option value="Bedridden Stretcher Transit with Nurse">Bedridden Stretcher Transit with Nurse</option>
                          <option value="Post-Operative Orthopedic / Cardiac Patient">Post-Operative Orthopedic / Cardiac Patient</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Oxygen Requirement & Medical Equipment Details
                      </label>
                      <textarea
                        rows={2}
                        value={trainAmbNotes}
                        onChange={(e) => setTrainAmbNotes(e.target.value)}
                        placeholder="e.g. Continuous O2 cylinder required, cardiac monitor, wheelchair/stretcher platform boarding..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  </>
                )}

                {/* 6. Dignified Human Remains (HUM) Form */}
                {selectedOptionId === "Dignified Human Remains (HUM)" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Departure City / Hospital Mortuary
                        </label>
                        <input
                          type="text"
                          value={humOrigin}
                          onChange={(e) => setHumOrigin(e.target.value)}
                          placeholder="e.g. Dubai / London / Mumbai / Delhi"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Destination Airport / City
                        </label>
                        <input
                          type="text"
                          value={humDest}
                          onChange={(e) => setHumDest(e.target.value)}
                          placeholder="e.g. Cochin / Hyderabad / Lucknow / Srinagar"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Preferred Repatriation Date
                        </label>
                        <input
                          type="text"
                          value={humDate}
                          onChange={(e) => setHumDate(e.target.value)}
                          placeholder="e.g. Urgent / Earliest Available Cargo Flight"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Repatriation Protocol Scope
                        </label>
                        <select
                          value={humScope}
                          onChange={(e) => setHumScope(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                        >
                          <option value="Domestic Repatriation (Airport to Airport)">Domestic Repatriation (Airport to Airport)</option>
                          <option value="International Repatriation (Embalming, Consular & Air Cargo)">International Repatriation (Embalming, Consular & Air Cargo)</option>
                          <option value="Full Mortuary Van Transit & Airside Tarmac Receiving">Full Mortuary Van Transit & Airside Tarmac Receiving</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Documentation Status & Special Family Requests
                      </label>
                      <textarea
                        rows={2}
                        value={humNotes}
                        onChange={(e) => setHumNotes(e.target.value)}
                        placeholder="e.g. Death certificate obtained, embalming NOC required, number of accompanying family passengers..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  </>
                )}

                {/* 7. Visa Assistance Services Form */}
                {selectedOptionId === "Visa Assistance Services" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Destination Country / Region
                        </label>
                        <input
                          type="text"
                          value={visaCountry}
                          onChange={(e) => setVisaCountry(e.target.value)}
                          placeholder="e.g. Schengen Area (France/Germany) / United Kingdom / USA / UAE / Singapore"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Visa Category
                        </label>
                        <select
                          value={visaCategory}
                          onChange={(e) => setVisaCategory(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                        >
                          <option value="Tourist / Visitor Visa">Tourist / Visitor Visa</option>
                          <option value="Business & Corporate Delegation Visa">Business & Corporate Delegation Visa</option>
                          <option value="Medical Treatment Visa">Medical Treatment Visa</option>
                          <option value="Diplomatic / Official Delegation Visa">Diplomatic / Official Delegation Visa</option>
                          <option value="Student / Academic Visa">Student / Academic Visa</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Intended Date of Travel
                        </label>
                        <input
                          type="date"
                          value={visaTravelDate}
                          onChange={(e) => setVisaTravelDate(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Number of Applicants
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={visaApplicants}
                          onChange={(e) => setVisaApplicants(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Passport Nationality & Fast-Track Doorstep Biometric Requests
                      </label>
                      <textarea
                        rows={2}
                        value={visaNotes}
                        onChange={(e) => setVisaNotes(e.target.value)}
                        placeholder="e.g. Indian passport holder, urgent 48-hour business meeting, require VIP doorstep biometrics appointment..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  </>
                )}

                {/* 8. Cargo & AVI Pet Freight Form */}
                {selectedOptionId === "Cargo & AVI Pet Freight" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Departure Airport / Station
                        </label>
                        <input
                          type="text"
                          value={cargoOrigin}
                          onChange={(e) => setCargoOrigin(e.target.value)}
                          placeholder="e.g. Delhi (DEL) / Mumbai (BOM) / Bangalore (BLR)"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Destination Airport / Country
                        </label>
                        <input
                          type="text"
                          value={cargoDest}
                          onChange={(e) => setCargoDest(e.target.value)}
                          placeholder="e.g. Dubai (DXB) / London Heathrow (LHR) / Singapore (SIN)"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Dispatch Date
                        </label>
                        <input
                          type="date"
                          value={cargoDate}
                          onChange={(e) => setCargoDate(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Cargo / Freight Classification
                        </label>
                        <select
                          value={cargoCategory}
                          onChange={(e) => setCargoCategory(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                        >
                          <option value="Live Animal / Pet Relocation (AVI)">Live Animal / Pet Relocation (AVI)</option>
                          <option value="High-Value Express Aviation Cargo">High-Value Express Aviation Cargo</option>
                          <option value="Temperature-Sensitive Pharma Freight">Temperature-Sensitive Pharma Freight</option>
                          <option value="Dangerous Goods (DGR) Clearance">Dangerous Goods (DGR) Clearance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Weight / Pet Breed / Crate Size
                        </label>
                        <input
                          type="text"
                          value={cargoWeight}
                          onChange={(e) => setCargoWeight(e.target.value)}
                          placeholder="e.g. Golden Retriever (32 kg) / 120 kg Air Cargo"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Cargo Manifest Details & Special Instructions
                      </label>
                      <textarea
                        rows={2}
                        value={cargoNotes}
                        onChange={(e) => setCargoNotes(e.target.value)}
                        placeholder="e.g. IATA crate dimensions, vaccination record status, custom temperature range, airside photo escort..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  </>
                )}

                {/* 9. Air Ticketing Services Form */}
                {selectedOptionId === "Air Ticketing Services" && (
                  <>
                    {/* Instant booking shortcut banner */}
                    <div className="bg-lime-50 border border-lime-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-lime-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                          <Plane size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            Instant Commercial Flight Engine
                          </h4>
                          <p className="text-xs text-slate-600">
                            Search live availability & compare 500+ airlines in real-time.
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/book"
                        search={{ service_id: "air_ticketing" } as any}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950 hover:bg-slate-900 text-white text-xs font-mono font-bold tracking-wider shadow-sm transition-all whitespace-nowrap cursor-pointer"
                      >
                        <span>Launch Flight Booking Engine</span>
                        <ArrowRight size={13} className="text-lime-400" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Departure Airport / City
                        </label>
                        <input
                          type="text"
                          value={ticketOrigin}
                          onChange={(e) => setTicketOrigin(e.target.value)}
                          placeholder="e.g. New Delhi (DEL) / Mumbai (BOM)"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Arrival Destination Airport / City
                        </label>
                        <input
                          type="text"
                          value={ticketDest}
                          onChange={(e) => setTicketDest(e.target.value)}
                          placeholder="e.g. London Heathrow (LHR) / Dubai (DXB) / Goa (GOI)"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Travel Date
                        </label>
                        <input
                          type="date"
                          value={ticketDate}
                          onChange={(e) => setTicketDate(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Trip Type
                        </label>
                        <select
                          value={ticketTripType}
                          onChange={(e) => setTicketTripType(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                        >
                          <option value="One Way">One Way</option>
                          <option value="Round Trip">Round Trip</option>
                          <option value="Multi-City">Multi-City</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Cabin Class
                        </label>
                        <select
                          value={ticketClass}
                          onChange={(e) => setTicketClass(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                        >
                          <option value="Economy Class">Economy Class</option>
                          <option value="Premium Economy">Premium Economy</option>
                          <option value="Business Class">Business Class</option>
                          <option value="First Class">First Class</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Passengers
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={ticketPassengers}
                          onChange={(e) => setTicketPassengers(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Airline Preference, Meal & Special Passenger Requests
                      </label>
                      <textarea
                        rows={2}
                        value={ticketNotes}
                        onChange={(e) => setTicketNotes(e.target.value)}
                        placeholder="e.g. Air India / Emirates / Singapore Airlines preferred, aisle seats, extra 10kg baggage, wheelchair assist..."
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
              Luxury wellness, curated romantic escapes, close protection, 24/7 medevac & rail ICU, dignified HUM repatriation, visa assistance, cargo pet logistics, and commercial air ticketing.
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
                    <img loading="lazy" decoding="async"
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
