import {
  Crown,
  Hotel,
  Car,
  Ticket,
  HeartPulse,
  Plane,
  Package,
  ShieldCheck,
  Building2,
  Calendar,
  Users,
  FileText,
  MapPin,
  Stethoscope,
  ShieldAlert,
  Luggage,
} from "lucide-react";

export type FieldType =
  | "text"
  | "date"
  | "time"
  | "airport_select"
  | "country_select"
  | "package_select"
  | "passenger_counter"
  | "textarea"
  | "phone_input"
  | "checkbox"
  | "select";

export interface FieldOption {
  label: string;
  value: string;
  description?: string;
}

export interface FieldConfig {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
  defaultValue?: any;
  helpText?: string;
  gridCols?: 1 | 2 | 3;
}

export interface BookingStepConfig {
  id: string;
  title: string;
  subtitle: string;
  fields: FieldConfig[];
  customComponent?: "flight_search" | "meet_greet_packages" | "passenger_experience";
}

export interface ServiceBookingConfig {
  id: string;
  serviceName: string;
  category: "concierge" | "travel" | "cargo" | "medical" | "charter" | "security";
  icon: any;
  tagline: string;
  description: string;
  ctaText: string;
  steps: BookingStepConfig[];
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * DECLARATIVE SERVICE BOOKING CONFIGURATIONS
 * Single source of truth for all booking journeys on the platform.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const BOOKING_CONFIGURATIONS: Record<string, ServiceBookingConfig> = {
  // ── 1. AIRPORT CONCIERGE: MEET & GREET ──
  meet_greet: {
    id: "meet_greet",
    serviceName: "Meet & Greet Escort",
    category: "concierge",
    icon: Crown,
    tagline: "Aerobridge Placard Greeting & Priority Clearance",
    description: "Dedicated Guest Relations Officer welcomes you upon aircraft exit with discrete placard identification, luggage management, and fast-track clearance.",
    ctaText: "Book Airport Assistance",
    steps: [
      {
        id: "service_selection",
        title: "Select Concierge Service",
        subtitle: "Choose your required airside escort experience",
        fields: [],
      },
      {
        id: "flight_info",
        title: "Flight Information",
        subtitle: "Search flight number or enter routing manually",
        fields: [
          { id: "flightNumber", label: "Flight Number", type: "text", placeholder: "e.g. AI302, EK511, QR578", required: true, gridCols: 1 },
          { id: "flightDate", label: "Flight Date", type: "date", required: true, gridCols: 2 },
          { id: "flightTime", label: "Estimated Time", type: "time", required: false, gridCols: 2 },
          { id: "originAirport", label: "Origin Airport", type: "airport_select", required: true, gridCols: 2 },
          { id: "destAirport", label: "Destination Airport", type: "airport_select", required: true, gridCols: 2 },
          { id: "airline", label: "Airline Carrier", type: "text", placeholder: "e.g. Air India, Emirates", required: false, gridCols: 2 },
          { id: "departureTerminal", label: "Departure Terminal", type: "text", placeholder: "Terminal 3", required: false, gridCols: 2 },
        ],
        customComponent: "flight_search",
      },
      {
        id: "packages",
        title: "Select Assistance Tier",
        subtitle: "Dynamic tier availability resolved for your airport route",
        fields: [],
        customComponent: "meet_greet_packages",
      },
      {
        id: "passenger",
        title: "Passenger Details & Protocols",
        subtitle: "Lead contact info, headcount, and airside assistance requests",
        fields: [],
        customComponent: "passenger_experience",
      },
    ],
  },

  // ── 2. AIRPORT CONCIERGE: VIP LOUNGE ──
  lounge: {
    id: "lounge",
    serviceName: "VIP Airport Lounge",
    category: "concierge",
    icon: Hotel,
    tagline: "Private Sanctuary & Gourmet Buffets",
    description: "Enjoy private lounge suites, hot buffet dining, high-speed Wi-Fi, and luxury shower facilities away from commercial terminal crowds.",
    ctaText: "Reserve Lounge Pass",
    steps: [
      {
        id: "service_selection",
        title: "Select Concierge Service",
        subtitle: "Choose your required airside escort experience",
        fields: [],
      },
      {
        id: "flight_info",
        title: "Flight Information",
        subtitle: "Search flight number or enter lounge transit airport",
        fields: [
          { id: "originAirport", label: "Transit Airport Code", type: "airport_select", required: true, gridCols: 2 },
          { id: "flightDate", label: "Lounge Access Date", type: "date", required: true, gridCols: 2 },
          { id: "flightNumber", label: "Connecting Flight Number", type: "text", placeholder: "e.g. EK511", required: false, gridCols: 2 },
          { id: "paxAdults", label: "Total Lounge Guests", type: "passenger_counter", required: true, gridCols: 2 },
        ],
        customComponent: "flight_search",
      },
      {
        id: "packages",
        title: "Lounge Suite Tier",
        subtitle: "Select private suite, buffet access, or conference suite options",
        fields: [],
        customComponent: "meet_greet_packages",
      },
      {
        id: "passenger",
        title: "Guest Information",
        subtitle: "Lead guest details and VIP access passes",
        fields: [],
        customComponent: "passenger_experience",
      },
    ],
  },

  // ── 3. AIRPORT CONCIERGE: GROUND TRANSPORTATION ──
  transport: {
    id: "transport",
    serviceName: "Ground Transportation",
    category: "concierge",
    icon: Car,
    tagline: "Chauffeured Mercedes-Maybach Tarmac & City Transfers",
    description: "Private executive sedan transfers across the tarmac directly between the VIP lounge sanctuary and your aircraft steps.",
    ctaText: "Book Chauffeur Transfer",
    steps: [
      {
        id: "service_selection",
        title: "Select Concierge Service",
        subtitle: "Choose your required airside escort experience",
        fields: [],
      },
      {
        id: "flight_info",
        title: "Flight & Route Details",
        subtitle: "Specify pickup airport and destination drop-off location",
        fields: [
          { id: "originAirport", label: "Pickup Airport Code", type: "airport_select", required: true, gridCols: 2 },
          { id: "destAirport", label: "Drop-off Destination Address", type: "text", placeholder: "e.g. The Taj Mahal Palace, Mumbai", required: true, gridCols: 2 },
          { id: "flightDate", label: "Transfer Date", type: "date", required: true, gridCols: 2 },
          { id: "flightTime", label: "Pickup Time", type: "time", required: true, gridCols: 2 },
        ],
        customComponent: "flight_search",
      },
      {
        id: "packages",
        title: "Executive Vehicle Fleet",
        subtitle: "Choose Mercedes Maybach S-Class, V-Class Luxury Van, or Armor SUV",
        fields: [],
        customComponent: "meet_greet_packages",
      },
      {
        id: "passenger",
        title: "Passenger Details",
        subtitle: "Lead passenger contact and luggage headcount",
        fields: [],
        customComponent: "passenger_experience",
      },
    ],
  },

  // ── 4. AIRPORT CONCIERGE: FAST TRACK IMMIGRATION ──
  fast_track: {
    id: "fast_track",
    serviceName: "Fast Track Immigration",
    category: "concierge",
    icon: Ticket,
    tagline: "Diplomatic Priority Queue Clearance",
    description: "Bypass main security and immigration lines via diplomatic priority desks, saving up to 90 minutes during peak transit hours.",
    ctaText: "Request Fast Track Pass",
    steps: [
      {
        id: "service_selection",
        title: "Select Concierge Service",
        subtitle: "Choose your required airside escort experience",
        fields: [],
      },
      {
        id: "flight_info",
        title: "Flight & Terminal Information",
        subtitle: "Provide arrival or departure flight details for priority clearance",
        fields: [
          { id: "flightNumber", label: "Flight Number", type: "text", placeholder: "e.g. AI302", required: true, gridCols: 1 },
          { id: "flightDate", label: "Flight Date", type: "date", required: true, gridCols: 2 },
          { id: "originAirport", label: "Airport", type: "airport_select", required: true, gridCols: 2 },
        ],
        customComponent: "flight_search",
      },
      {
        id: "packages",
        title: "Fast Track Priority Pass",
        subtitle: "Diplomatic lane clearance options",
        fields: [],
        customComponent: "meet_greet_packages",
      },
      {
        id: "passenger",
        title: "Passenger Passport Info",
        subtitle: "Lead traveler contact details and security clearance",
        fields: [],
        customComponent: "passenger_experience",
      },
    ],
  },

  // ── 5. TRAVEL SERVICES: HOTEL BOOKING ──
  hotel: {
    id: "hotel",
    serviceName: "VIP Hotel & Resort Booking",
    category: "travel",
    icon: Hotel,
    tagline: "Curated 5-Star Suites & Exclusive Concierge Perks",
    description: "Bespoke hotel reservations with room upgrades, complimentary breakfast, flexible late check-out, and private butler service.",
    ctaText: "Request Hotel Reservation",
    steps: [
      {
        id: "destination",
        title: "Destination & Travel Dates",
        subtitle: "Specify destination city, check-in date, and stay duration",
        fields: [
          { id: "destAirport", label: "Destination City / Region", type: "text", placeholder: "e.g. Dubai, London, Paris, Tokyo, Goa", required: true, gridCols: 2 },
          { id: "flightDate", label: "Check-in Date", type: "date", required: true, gridCols: 2 },
          { id: "checkoutDate", label: "Check-out Date", type: "date", required: true, gridCols: 2 },
          { id: "hotelCategory", label: "Preferred Hotel Category", type: "select", options: [
              { label: "Ultra Luxury 5-Star / Palace Suite", value: "palace" },
              { label: "Executive Boutique Hotel", value: "boutique" },
              { label: "Business Corporate Suite", value: "corporate" },
            ], required: true, gridCols: 2 },
        ],
      },
      {
        id: "travellers",
        title: "Guests & Suite Preferences",
        subtitle: "Specify number of guests and special room requests",
        fields: [
          { id: "paxAdults", label: "Total Adult Guests", type: "passenger_counter", required: true, gridCols: 2 },
          { id: "specialRequests", label: "Room Preferences / Butler Requests", type: "textarea", placeholder: "e.g. Connecting suites, ocean view, late check-out", required: false, gridCols: 1 },
        ],
      },
      {
        id: "contact",
        title: "Lead Guest & Contact Info",
        subtitle: "Provide details for reservation voucher dispatch",
        fields: [
          { id: "leadPassengerName", label: "Lead Guest Full Name", type: "text", placeholder: "e.g. Alexander Wright", required: true, gridCols: 2 },
          { id: "passengerEmail", label: "Email Address", type: "text", placeholder: "alexander@corporate.com", required: true, gridCols: 2 },
          { id: "passengerPhone", label: "Phone / WhatsApp", type: "phone_input", placeholder: "+91 98765 43210", required: true, gridCols: 2 },
        ],
      },
    ],
  },

  // ── 6. TRAVEL SERVICES: VISA ASSISTANCE ──
  visa: {
    id: "visa",
    serviceName: "Fast-Track Visa Assistance",
    category: "travel",
    icon: Building2,
    tagline: "Diplomatic Expedited Processing & Document Curation",
    description: "End-to-end diplomatic visa handling, VIP doorstep biometric collection, and priority approval for corporate travelers.",
    ctaText: "Request Visa Assistance",
    steps: [
      {
        id: "visa_details",
        title: "Visa Requirements",
        subtitle: "Specify destination country and visa processing type",
        fields: [
          { id: "destAirport", label: "Destination Country", type: "country_select", required: true, gridCols: 2 },
          { id: "visaType", label: "Visa Processing Category", type: "select", options: [
              { label: "Fast-Track Business Visa", value: "business" },
              { label: "Tourist / Family VIP Visa", value: "tourist" },
              { label: "Diplomatic / Official Delegation", value: "diplomatic" },
            ], required: true, gridCols: 2 },
          { id: "flightDate", label: "Intended Travel Date", type: "date", required: true, gridCols: 2 },
        ],
      },
      {
        id: "applicant_info",
        title: "Applicant Information",
        subtitle: "Provide applicant contact and passport details",
        fields: [
          { id: "leadPassengerName", label: "Applicant Full Name", type: "text", placeholder: "e.g. Sophia Martinez", required: true, gridCols: 2 },
          { id: "passengerEmail", label: "Email Address", type: "text", placeholder: "sophia@venture.com", required: true, gridCols: 2 },
          { id: "passengerPhone", label: "Phone Number", type: "phone_input", placeholder: "+91 98765 43210", required: true, gridCols: 2 },
          { id: "passportNumber", label: "Passport Number (Optional)", type: "text", placeholder: "Z1234567", required: false, gridCols: 2 },
        ],
      },
    ],
  },

  // ── 7. CARGO & AVI PET TRANSPORT ──
  cargo: {
    id: "cargo",
    serviceName: "Aviation Cargo & Pet Freight",
    category: "cargo",
    icon: Package,
    tagline: "Supervised Tarmac Clearance & Live Animal Transport",
    description: "Specialized aviation freight handling, climate-controlled animal transport, and express customs clearance at major global hubs.",
    ctaText: "Request Cargo Dispatch",
    steps: [
      {
        id: "cargo_info",
        title: "Cargo & Freight Specifications",
        subtitle: "Specify freight origin, destination, and commodity manifest",
        fields: [
          { id: "originAirport", label: "Origin Airport / Station", type: "airport_select", required: true, gridCols: 2 },
          { id: "destAirport", label: "Destination Airport / Station", type: "airport_select", required: true, gridCols: 2 },
          { id: "flightDate", label: "Preferred Dispatch Date", type: "date", required: true, gridCols: 2 },
          { id: "cargoType", label: "Shipment Commodity Category", type: "select", options: [
              { label: "Live Animal / AVI Pet Transport", value: "avi" },
              { label: "High-Value Express Freight", value: "express" },
              { label: "Temperature-Controlled Pharmaceuticals", value: "pharma" },
              { label: "Diplomatic Cargo Bags", value: "diplomatic" },
            ], required: true, gridCols: 2 },
          { id: "cargoWeight", label: "Estimated Weight (kg)", type: "text", placeholder: "e.g. 150 kg", required: true, gridCols: 2 },
        ],
      },
      {
        id: "shipper_contact",
        title: "Shipper & Dispatch Desk",
        subtitle: "Provide coordinator details for customs manifest",
        fields: [
          { id: "leadPassengerName", label: "Shipper / Coordinator Name", type: "text", placeholder: "e.g. David Sterling", required: true, gridCols: 2 },
          { id: "passengerEmail", label: "Email Address", type: "text", placeholder: "david@logistics.com", required: true, gridCols: 2 },
          { id: "passengerPhone", label: "Phone / WhatsApp", type: "phone_input", placeholder: "+91 98765 43210", required: true, gridCols: 2 },
          { id: "specialRequests", label: "Special Handling Instructions", type: "textarea", placeholder: "e.g. IATA crate required, tarmac photo verification", required: false, gridCols: 1 },
        ],
      },
    ],
  },

  // ── 8. MEDICAL AMBULANCE SERVICES ──
  air_ambulance: {
    id: "air_ambulance",
    serviceName: "24/7 Airborne ICU Medical Evacuation",
    category: "medical",
    icon: HeartPulse,
    tagline: "Dedicated ICU Aircraft & Bed-to-Bed Medical Transit",
    description: "Fully equipped airborne ICU jets, specialized flight doctors, and synchronized ground ambulance escorts for critical patient transfer.",
    ctaText: "Request Emergency Evacuation",
    steps: [
      {
        id: "medical_protocol",
        title: "Emergency Evacuation Protocol",
        subtitle: "Specify patient status, pickup hospital, and destination facility",
        fields: [
          { id: "originAirport", label: "Pickup Hospital & City", type: "text", placeholder: "e.g. Apollo Hospital, Delhi", required: true, gridCols: 2 },
          { id: "destAirport", label: "Destination Hospital & City", type: "text", placeholder: "e.g. Cleveland Clinic, Abu Dhabi", required: true, gridCols: 2 },
          { id: "flightDate", label: "Required Transfer Date", type: "date", required: true, gridCols: 2 },
          { id: "medevacType", label: "Evacuation Transport Mode", type: "select", options: [
              { label: "Dedicated Air Ambulance (Airborne ICU Jet)", value: "air_icu" },
              { label: "Train ICU Medical Ambulance", value: "train_icu" },
              { label: "Dignified Human Remains (HUM) Repatriation", value: "hum" },
            ], required: true, gridCols: 2 },
          { id: "patientCondition", label: "Patient Condition Briefing", type: "textarea", placeholder: "e.g. Ventilator support required, cardiac patient", required: true, gridCols: 1 },
        ],
      },
      {
        id: "medical_contact",
        title: "Medical Coordinator Details",
        subtitle: "Provide next of kin or physician contact for dispatch",
        fields: [
          { id: "leadPassengerName", label: "Coordinator / Next of Kin Name", type: "text", placeholder: "e.g. Dr. Robert Chen", required: true, gridCols: 2 },
          { id: "passengerPhone", label: "Emergency Phone / WhatsApp", type: "phone_input", placeholder: "+91 98765 43210", required: true, gridCols: 2 },
          { id: "passengerEmail", label: "Email Address", type: "text", placeholder: "robert@medical.org", required: true, gridCols: 2 },
        ],
      },
    ],
  },

  // ── 9. PRIVATE JET CHARTER ──
  jet_charter: {
    id: "jet_charter",
    serviceName: "On-Demand Private Jet Charter",
    category: "charter",
    icon: Plane,
    tagline: "Private Executive Jet Charter & FBO Terminal Suite",
    description: "Direct flight scheduling across 5,000+ airports with private FBO lounge access, custom in-flight catering, and maximum schedule privacy.",
    ctaText: "Request Private Jet Quote",
    steps: [
      {
        id: "flight_request",
        title: "Charter Flight Manifest",
        subtitle: "Specify departure city, arrival destination, and flight schedule",
        fields: [
          { id: "originAirport", label: "Departure City / Airport", type: "airport_select", required: true, gridCols: 2 },
          { id: "destAirport", label: "Destination City / Airport", type: "airport_select", required: true, gridCols: 2 },
          { id: "flightDate", label: "Departure Date", type: "date", required: true, gridCols: 2 },
          { id: "flightTime", label: "Preferred Departure Time", type: "time", required: true, gridCols: 2 },
          { id: "paxAdults", label: "Passenger Count", type: "passenger_counter", required: true, gridCols: 2 },
          { id: "aircraftType", label: "Aircraft Class Preference", type: "select", options: [
              { label: "Heavy Jet (Gulfstream G650 / Bombardier Global)", value: "heavy" },
              { label: "Super Midsize Jet (Challenger 350 / Citation Latitude)", value: "super_mid" },
              { label: "Light Executive Jet (Phenom 300 / CJ4)", value: "light" },
              { label: "Turboprop Executive (King Air 350)", value: "turboprop" },
            ], required: true, gridCols: 2 },
        ],
      },
      {
        id: "charter_contact",
        title: "Passenger Manifest & Contact",
        subtitle: "Lead passenger contact details for FBO flight authorization",
        fields: [
          { id: "leadPassengerName", label: "Lead Passenger Full Name", type: "text", placeholder: "e.g. Marcus Vance", required: true, gridCols: 2 },
          { id: "passengerEmail", label: "Email Address", type: "text", placeholder: "marcus@vancecapital.com", required: true, gridCols: 2 },
          { id: "passengerPhone", label: "Phone / WhatsApp", type: "phone_input", placeholder: "+91 98765 43210", required: true, gridCols: 2 },
          { id: "specialRequests", label: "In-Flight Catering & Special Protocol", type: "textarea", placeholder: "e.g. Specific wine pairing, tarmac security detail", required: false, gridCols: 1 },
        ],
      },
    ],
  },

  // ── 10. EXTENSIBLE FUTURE SERVICE EXAMPLE: VIP SECURITY ──
  vip_security: {
    id: "vip_security",
    serviceName: "Diplomatic VIP Security Detail",
    category: "security",
    icon: ShieldCheck,
    tagline: "Armed Bodyguard Escort & Armored Convoy",
    description: "Close protection security officers, armored vehicle convoys, and route risk assessment for high-net-worth individuals and diplomats.",
    ctaText: "Request Security Escort",
    steps: [
      {
        id: "security_needs",
        title: "Security & Convoy Protocol",
        subtitle: "Specify location, transit route, and threat level assessment",
        fields: [
          { id: "destAirport", label: "Location / City of Escort", type: "text", placeholder: "e.g. New Delhi, London, Dubai", required: true, gridCols: 2 },
          { id: "flightDate", label: "Service Commencement Date", type: "date", required: true, gridCols: 2 },
          { id: "securityType", label: "Security Escort Category", type: "select", options: [
              { label: "Close Protection Bodyguards (Armed)", value: "close_protection" },
              { label: "Armored Vehicle Convoy (B6/B7 Level)", value: "convoy" },
              { label: "Airside VIP Security Handoff", value: "airside_security" },
            ], required: true, gridCols: 2 },
        ],
      },
      {
        id: "client_contact",
        title: "Principal Contact Information",
        subtitle: "Provide lead details for confidential dispatch clearance",
        fields: [
          { id: "leadPassengerName", label: "Principal / Delegate Name", type: "text", placeholder: "e.g. Ambassador Harrison", required: true, gridCols: 2 },
          { id: "passengerEmail", label: "Official Email Address", type: "text", placeholder: "harrison@embassy.gov", required: true, gridCols: 2 },
          { id: "passengerPhone", label: "Phone / WhatsApp", type: "phone_input", placeholder: "+91 98765 43210", required: true, gridCols: 2 },
        ],
      },
    ],
  },
};

/**
 * Resolves the configuration for a given service ID.
 * Defaults to `meet_greet` if the ID is missing or unrecognized.
 */
export function getServiceBookingConfig(subServiceId: string): ServiceBookingConfig {
  if (BOOKING_CONFIGURATIONS[subServiceId]) {
    return BOOKING_CONFIGURATIONS[subServiceId];
  }
  // Fallbacks for category matches
  if (subServiceId.includes("hotel") || subServiceId.includes("travel")) return BOOKING_CONFIGURATIONS.hotel;
  if (subServiceId.includes("visa")) return BOOKING_CONFIGURATIONS.visa;
  if (subServiceId.includes("cargo") || subServiceId.includes("avi")) return BOOKING_CONFIGURATIONS.cargo;
  if (subServiceId.includes("ambulance") || subServiceId.includes("medical")) return BOOKING_CONFIGURATIONS.air_ambulance;
  if (subServiceId.includes("charter") || subServiceId.includes("jet")) return BOOKING_CONFIGURATIONS.jet_charter;
  if (subServiceId.includes("security")) return BOOKING_CONFIGURATIONS.vip_security;

  return BOOKING_CONFIGURATIONS.meet_greet;
}
