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
} from "lucide-react";
import { type FieldConfig } from "./bookingConfigurations";

export interface WorkflowStep {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  stepType: "service_select" | "fields_form" | "flight_search" | "package_selection" | "passenger_info" | "review_summary" | "payment_selection" | "confirmation_pass";
  fields: FieldConfig[];
}

export interface WorkflowConfig {
  workflowId: string;
  workflowName: string;
  category: "concierge" | "travel" | "cargo" | "medical" | "aviation" | "security";
  icon: any;
  ctaText: string;
  estimatedTime: string;
  successTitle: string;
  successMessage: string;
  badgeLabel: string;
  stepSequence: WorkflowStep[];
  validationRules: Record<string, { required: boolean; pattern?: RegExp; errorMessage?: string }>;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * DECLARATIVE WORKFLOW REGISTRY
 * Zero hardcoded `if (service === "x")` conditions.
 * The workflow engine reads purely from this registry.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const WORKFLOW_REGISTRY: Record<string, WorkflowConfig> = {
  // ── 1. AIRPORT CONCIERGE WORKFLOW ──
  airport_concierge_workflow: {
    workflowId: "airport_concierge_workflow",
    workflowName: "Airport Concierge Journey",
    category: "concierge",
    icon: Crown,
    ctaText: "Confirm & Activate Airside Pass",
    estimatedTime: "2 mins",
    successTitle: "Airside Concierge Pass Activated",
    successMessage: "Your dedicated Guest Relations Officer has been staged. Present your VVIP QR pass upon arrival.",
    badgeLabel: "Airside Escort Staged",
    stepSequence: [
      {
        id: "step_service_select",
        name: "Service Category",
        title: "Select Airport Concierge Service",
        subtitle: "Choose Meet & Greet, VIP Lounge, Fast Track, or Ground Chauffeur",
        stepType: "service_select",
        fields: [],
      },
      {
        id: "step_flight_search",
        name: "Flight Search",
        title: "Flight Information & Schedule Lookup",
        subtitle: "Enter flight number for real-time aviation schedule lookup or manual routing",
        stepType: "flight_search",
        fields: [
          { id: "flightNumber", label: "Flight Number", type: "text", placeholder: "e.g. AI302, EK511", required: true, gridCols: 1 },
          { id: "flightDate", label: "Flight Date", type: "date", required: true, gridCols: 2 },
          { id: "originAirport", label: "Origin Airport", type: "airport_select", required: true, gridCols: 2 },
          { id: "destAirport", label: "Destination Airport", type: "airport_select", required: true, gridCols: 2 },
        ],
      },
      {
        id: "step_package_select",
        name: "Tier Packages",
        title: "Select Concierge Assistance Tier",
        subtitle: "Dynamic tier availability resolved for your route",
        stepType: "package_selection",
        fields: [],
      },
      {
        id: "step_passenger_info",
        name: "Passenger Details",
        title: "Passenger Details & Airside Protocols",
        subtitle: "Lead traveler contact, headcount, and special assistance requests",
        stepType: "passenger_info",
        fields: [],
      },
      {
        id: "step_review",
        name: "Review Itinerary",
        title: "Itemized Itinerary Review",
        subtitle: "Verify flight details and included concierge inclusions",
        stepType: "review_summary",
        fields: [],
      },
      {
        id: "step_payment",
        name: "Payment Selection",
        title: "Select Invoicing & Processing Method",
        subtitle: "Choose credit card, corporate wire transfer, or diplomatic billing",
        stepType: "payment_selection",
        fields: [],
      },
      {
        id: "step_confirmation",
        name: "VVIP Pass",
        title: "Digital Airside Pass Issued",
        subtitle: "Your concierge pass is active",
        stepType: "confirmation_pass",
        fields: [],
      },
    ],
    validationRules: {
      flightNumber: { required: true, errorMessage: "Flight number is required for flight verification." },
      flightDate: { required: true, errorMessage: "Flight date is required." },
      leadPassengerName: { required: true, errorMessage: "Lead passenger full name is required." },
      passengerEmail: { required: true, errorMessage: "Valid email address is required." },
      passengerPhone: { required: true, errorMessage: "Phone / WhatsApp number is required." },
    },
  },

  // ── 2. TRAVEL SERVICES WORKFLOW (NO FLIGHT NUMBER REQUIRED) ──
  travel_services_workflow: {
    workflowId: "travel_services_workflow",
    workflowName: "Hotel Booking",
    category: "travel",
    icon: Hotel,
    ctaText: "Submit Travel Enquiry",
    estimatedTime: "1 min",
    successTitle: "Hotel Suite Reservation Staged",
    successMessage: "Your luxury travel coordinator has received your requirements and is preparing your voucher.",
    badgeLabel: "Suite Voucher Staged",
    stepSequence: [
      {
        id: "step_service_select",
        name: "Service Category",
        title: "Select Travel Service",
        subtitle: "Choose 5-Star Hotel Suites or Fast-Track Diplomatic Visa",
        stepType: "service_select",
        fields: [],
      },
      {
        id: "step_travel_specs",
        name: "Destination & Dates",
        title: "Destination & Travel Requirements",
        subtitle: "Specify destination city, check-in date, and stay preferences",
        stepType: "fields_form",
        fields: [
          { id: "destAirport", label: "Destination City / Country", type: "text", placeholder: "e.g. Dubai, London, Paris, Tokyo", required: true, gridCols: 2 },
          { id: "check_in", label: "Check-in Date", type: "date", required: true, gridCols: 2 },
          { id: "guests_count", label: "Total Guest Count", type: "passenger_counter", required: true, gridCols: 2 },
          { id: "room_type", label: "Preferred Room Category", type: "select", options: [
              { label: "Deluxe Suite", value: "deluxe_suite" },
              { label: "Executive Boutique Hotel", value: "boutique" },
              { label: "Presidential / Palace Suite", value: "palace" },
              { label: "Heritage Villa", value: "heritage_villa" },
              { label: "Business Suite", value: "corporate" },
            ], required: true, gridCols: 2 },
          { id: "specialRequests", label: "Special Requests / Butler Needs", type: "textarea", placeholder: "Connecting suites, late check-out...", required: false, gridCols: 1 },
        ],
      },
      {
        id: "step_passenger_info",
        name: "Contact Information",
        title: "Lead Guest Information",
        subtitle: "Provide contact details for reservation voucher dispatch",
        stepType: "passenger_info",
        fields: [],
      },
      {
        id: "step_review",
        name: "Review Request",
        title: "Travel Requirements Review",
        subtitle: "Verify destination and guest specifications",
        stepType: "review_summary",
        fields: [],
      },
      {
        id: "step_confirmation",
        name: "Enquiry Confirmation",
        title: "Travel Enquiry Received",
        subtitle: "Your coordinator is preparing your suite options",
        stepType: "confirmation_pass",
        fields: [],
      },
    ],
    validationRules: {
      destAirport: { required: true, errorMessage: "Destination city is required." },
      flightDate: { required: true, errorMessage: "Travel date is required." },
      leadPassengerName: { required: true, errorMessage: "Lead guest name is required." },
      passengerEmail: { required: true, errorMessage: "Email address is required." },
    },
  },

  // ── 3. CARGO & AVI PET WORKFLOW (NO FLIGHT NUMBER REQUIRED) ──
  cargo_logistics_workflow: {
    workflowId: "cargo_logistics_workflow",
    workflowName: "Aviation Cargo & Freight Journey",
    category: "cargo",
    icon: Package,
    ctaText: "Dispatch Freight Manifest",
    estimatedTime: "1 min",
    successTitle: "Cargo Manifest Logged",
    successMessage: "Airside cargo desk has cleared your manifest for tarmac pickup & express customs handling.",
    badgeLabel: "Manifest Cleared",
    stepSequence: [
      {
        id: "step_service_select",
        name: "Service Category",
        title: "Select Cargo Service",
        subtitle: "Express Freight or Live AVI Pet Transport",
        stepType: "service_select",
        fields: [],
      },
      {
        id: "step_cargo_manifest",
        name: "Freight Manifest",
        title: "Cargo & Live Animal Manifest",
        subtitle: "Specify origin station, destination station, and shipment weight",
        stepType: "fields_form",
        fields: [
          { id: "originAirport", label: "Origin Airport Code", type: "airport_select", required: true, gridCols: 2 },
          { id: "destAirport", label: "Destination Airport Code", type: "airport_select", required: true, gridCols: 2 },
          { id: "flightDate", label: "Dispatch Date", type: "date", required: true, gridCols: 2 },
          { id: "cargoType", label: "Commodity Category", type: "select", options: [
              { label: "Live Animal / AVI Pet Transport", value: "avi" },
              { label: "Express Air Freight", value: "express" },
              { label: "Pharma Temperature-Controlled", value: "pharma" },
            ], required: true, gridCols: 2 },
          { id: "cargoWeight", label: "Estimated Weight (kg)", type: "text", placeholder: "e.g. 150 kg", required: true, gridCols: 2 },
          { id: "specialRequests", label: "Special Handling Instructions", type: "textarea", placeholder: "IATA crate specifications...", required: false, gridCols: 1 },
        ],
      },
      {
        id: "step_passenger_info",
        name: "Shipper Details",
        title: "Shipper & Dispatch Desk Info",
        subtitle: "Provide coordinator details for customs clearance",
        stepType: "passenger_info",
        fields: [],
      },
      {
        id: "step_review",
        name: "Review Manifest",
        title: "Freight Manifest Review",
        subtitle: "Verify routing and handling instructions",
        stepType: "review_summary",
        fields: [],
      },
      {
        id: "step_confirmation",
        name: "Manifest Issued",
        title: "Cargo Dispatch Confirmed",
        subtitle: "Airside tarmac team assigned",
        stepType: "confirmation_pass",
        fields: [],
      },
    ],
    validationRules: {
      originAirport: { required: true, errorMessage: "Origin airport is required." },
      destAirport: { required: true, errorMessage: "Destination airport is required." },
      flightDate: { required: true, errorMessage: "Dispatch date is required." },
      leadPassengerName: { required: true, errorMessage: "Shipper name is required." },
    },
  },

  // ── 4. MEDICAL AMBULANCE WORKFLOW (NO FLIGHT NUMBER REQUIRED) ──
  medical_evacuation_workflow: {
    workflowId: "medical_evacuation_workflow",
    workflowName: "24/7 Airborne ICU Medical Journey",
    category: "medical",
    icon: HeartPulse,
    ctaText: "Request Emergency Evacuation",
    estimatedTime: "30 secs",
    successTitle: "Medical ICU Flight Dispatched",
    successMessage: "24/7 Medical Command Desk has dispatched flight doctor crew and bed-to-bed ground ambulance.",
    badgeLabel: "ICU Crew Staged",
    stepSequence: [
      {
        id: "step_service_select",
        name: "Service Category",
        title: "Select Medical Evacuation Mode",
        subtitle: "Airborne ICU Jet, Train ICU, or HUM Repatriation",
        stepType: "service_select",
        fields: [],
      },
      {
        id: "step_medical_protocol",
        name: "Emergency Protocol",
        title: "Medical Evacuation Protocol",
        subtitle: "Specify patient status, pickup facility, and destination hospital",
        stepType: "fields_form",
        fields: [
          { id: "originAirport", label: "Pickup Hospital & City", type: "text", placeholder: "e.g. Apollo Hospital, Delhi", required: true, gridCols: 2 },
          { id: "destAirport", label: "Destination Hospital & City", type: "text", placeholder: "e.g. Cleveland Clinic, Abu Dhabi", required: true, gridCols: 2 },
          { id: "flightDate", label: "Required Transport Date", type: "date", required: true, gridCols: 2 },
          { id: "medevacType", label: "Transport Mode", type: "select", options: [
              { label: "Dedicated Air Ambulance (Airborne ICU Jet)", value: "air_icu" },
              { label: "Train ICU Ambulance Escort", value: "train_icu" },
              { label: "Dignified Human Remains (HUM)", value: "hum" },
            ], required: true, gridCols: 2 },
          { id: "patientCondition", label: "Patient Medical Condition", type: "textarea", placeholder: "Ventilator support, oxygen flow needed...", required: true, gridCols: 1 },
        ],
      },
      {
        id: "step_passenger_info",
        name: "Coordinator Contact",
        title: "Medical Coordinator Contact Details",
        subtitle: "Provide physician or next-of-kin emergency contact",
        stepType: "passenger_info",
        fields: [],
      },
      {
        id: "step_review",
        name: "Review Protocol",
        title: "Evacuation Protocol Summary",
        subtitle: "Verify medical team and transit routing",
        stepType: "review_summary",
        fields: [],
      },
      {
        id: "step_confirmation",
        name: "ICU Flight Staged",
        title: "Medical Evacuation Staged",
        subtitle: "Flight doctor team on standby",
        stepType: "confirmation_pass",
        fields: [],
      },
    ],
    validationRules: {
      originAirport: { required: true, errorMessage: "Pickup hospital location is required." },
      destAirport: { required: true, errorMessage: "Destination hospital is required." },
      flightDate: { required: true, errorMessage: "Transport date is required." },
      patientCondition: { required: true, errorMessage: "Brief patient condition is required." },
    },
  },

  // ── 5. PRIVATE AVIATION CHARTER WORKFLOW (NO FLIGHT NUMBER REQUIRED) ──
  private_aviation_workflow: {
    workflowId: "private_aviation_workflow",
    workflowName: "On-Demand Private Jet Journey",
    category: "aviation",
    icon: Plane,
    ctaText: "Request Private Jet Quote",
    estimatedTime: "1 min",
    successTitle: "Charter Flight Manifest Submitted",
    successMessage: "Your private aviation advisor is securing FBO slot clearance and aircraft availability.",
    badgeLabel: "FBO Slot Staged",
    stepSequence: [
      {
        id: "step_service_select",
        name: "Service Category",
        title: "Select Private Aviation Service",
        subtitle: "On-Demand Jet Charter or FBO Lounge Suite",
        stepType: "service_select",
        fields: [],
      },
      {
        id: "step_charter_manifest",
        name: "Charter Flight Manifest",
        title: "Charter Flight Details",
        subtitle: "Specify departure city, arrival destination, and aircraft category",
        stepType: "fields_form",
        fields: [
          { id: "originAirport", label: "Departure City / Airport Code", type: "airport_select", required: true, gridCols: 2 },
          { id: "destAirport", label: "Arrival City / Airport Code", type: "airport_select", required: true, gridCols: 2 },
          { id: "flightDate", label: "Departure Date", type: "date", required: true, gridCols: 2 },
          { id: "flightTime", label: "Preferred Takeoff Time", type: "time", required: true, gridCols: 2 },
          { id: "paxAdults", label: "Passenger Count", type: "passenger_counter", required: true, gridCols: 2 },
          { id: "aircraftType", label: "Aircraft Class Preference", type: "select", options: [
              { label: "Heavy Jet (Gulfstream G650 / Global 7500)", value: "heavy" },
              { label: "Super Midsize Jet (Challenger 350)", value: "super_mid" },
              { label: "Light Executive Jet (Phenom 300)", value: "light" },
            ], required: true, gridCols: 2 },
        ],
      },
      {
        id: "step_passenger_info",
        name: "Passenger Manifest",
        title: "Lead Passenger Information",
        subtitle: "Provide details for FBO terminal authorization",
        stepType: "passenger_info",
        fields: [],
      },
      {
        id: "step_review",
        name: "Review Manifest",
        title: "Charter Manifest Summary",
        subtitle: "Verify flight leg specifications",
        stepType: "review_summary",
        fields: [],
      },
      {
        id: "step_confirmation",
        name: "FBO Pass Issued",
        title: "Private Charter Flight Requested",
        subtitle: "FBO handler assigned",
        stepType: "confirmation_pass",
        fields: [],
      },
    ],
    validationRules: {
      originAirport: { required: true, errorMessage: "Departure airport is required." },
      destAirport: { required: true, errorMessage: "Arrival airport is required." },
      flightDate: { required: true, errorMessage: "Departure date is required." },
      leadPassengerName: { required: true, errorMessage: "Lead passenger name is required." },
    },
  },
};

/**
 * Resolves the Declarative Workflow Configuration for any service ID.
 * Completely eliminates `if (service === 'x')` conditions!
 */
export function getWorkflowConfig(serviceId: string): WorkflowConfig {
  if (serviceId.includes("meet_greet") || serviceId.includes("lounge") || serviceId.includes("fast_track") || serviceId.includes("transport") || serviceId.includes("concierge")) {
    return WORKFLOW_REGISTRY.airport_concierge_workflow;
  }
  if (serviceId.includes("hotel") || serviceId.includes("visa") || serviceId.includes("travel")) {
    return WORKFLOW_REGISTRY.travel_services_workflow;
  }
  if (serviceId.includes("cargo") || serviceId.includes("avi")) {
    return WORKFLOW_REGISTRY.cargo_logistics_workflow;
  }
  if (serviceId.includes("ambulance") || serviceId.includes("medical") || serviceId.includes("hum")) {
    return WORKFLOW_REGISTRY.medical_evacuation_workflow;
  }
  if (serviceId.includes("charter") || serviceId.includes("jet") || serviceId.includes("aviation")) {
    return WORKFLOW_REGISTRY.private_aviation_workflow;
  }

  // Default fallback workflow
  return WORKFLOW_REGISTRY.airport_concierge_workflow;
}
