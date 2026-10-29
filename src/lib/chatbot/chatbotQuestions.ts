import {
  DepartmentContact,
  DEPARTMENT_CONTACTS,
} from "./departmentContacts";
import {
  SUPPORT_DEPARTMENTS,
  SupportDepartment,
} from "@/components/navigation/supportData";

export interface ChatbotServiceOption {
  id: string;
  label: string;
  departmentId: string;
  description: string;
  iconName: string;
  isOtherCategory?: boolean;
}

export interface QuickServiceRoute {
  id: string;
  label: string;
  departmentNumber: number;
  iconName: string;
}

/**
 * 5 Canonical Shafsky Aviation Support Departments
 * Directly matching the official Support Directory cards.
 */
export const CHATBOT_DEPARTMENTS: SupportDepartment[] = SUPPORT_DEPARTMENTS;

/**
 * Quick Service Shortcuts mapped directly to the 5 Canonical Departments
 */
export const QUICK_SERVICE_ROUTING: QuickServiceRoute[] = [
  { id: "meet_greet", label: "Meet & Greet", departmentNumber: 3, iconName: "Crown" },
  { id: "flight", label: "Air Ticketing", departmentNumber: 1, iconName: "Ticket" },
  { id: "visa", label: "Visa Assistance", departmentNumber: 2, iconName: "FileCheck" },
  { id: "hotel", label: "Hotels & Stays", departmentNumber: 2, iconName: "Hotel" },
  { id: "transport", label: "Transportation", departmentNumber: 1, iconName: "Car" },
  { id: "infant", label: "Infant Care", departmentNumber: 3, iconName: "Baby" },
  { id: "escalation", label: "Escalation", departmentNumber: 4, iconName: "ShieldAlert" },
  { id: "finance", label: "Finance & Accounts", departmentNumber: 5, iconName: "Ticket" },
];

/**
 * 1. Top-Level Services in Required Order (for backward compatibility & service search)
 */
export const CHATBOT_MAIN_SERVICES: ChatbotServiceOption[] = [
  {
    id: "meet_greet",
    label: "Meet & Greet",
    departmentId: "meet_greet",
    description: "Airport arrival, departure & transit VIP aerobridge greeting.",
    iconName: "Crown",
  },
  {
    id: "lounge",
    label: "Lounge Services",
    departmentId: "meet_greet",
    description: "Airport lounge passes, comfort layover & VIP hospitality.",
    iconName: "Armchair",
  },
  {
    id: "flight",
    label: "Flight Support / Air Ticketing",
    departmentId: "flight",
    description: "Commercial airline ticketing, rebooking, & schedule support.",
    iconName: "Ticket",
  },
  {
    id: "hotel",
    label: "Hotel Booking",
    departmentId: "hotel",
    description: "Curated 5-star & 7-star palace suites and airport transit stays.",
    iconName: "Hotel",
  },
  {
    id: "holidays",
    label: "Holidays / Tour & Travel",
    departmentId: "holidays",
    description: "Bespoke romantic tours, honeymoons & luxury holiday circuits.",
    iconName: "HeartHandshake",
  },
  {
    id: "visa",
    label: "Visa Assistance",
    departmentId: "visa",
    description: "Fast-track Schengen, US, UK, UAE & worldwide visa support.",
    iconName: "FileCheck",
  },
  {
    id: "transport",
    label: "Transportation",
    departmentId: "transport",
    description: "Chauffeured luxury cars, Mercedes-Maybach, and airport vans.",
    iconName: "Car",
  },
  {
    id: "doortodoor",
    label: "Door-to-Door Assistance",
    departmentId: "doortodoor",
    description: "Seamless transfer from your doorstep to airport aerobridge.",
    iconName: "MapPin",
  },
  {
    id: "events",
    label: "Event Support",
    departmentId: "events",
    description: "Group charters, VIP delegations, and destination wedding transport.",
    iconName: "Sparkles",
  },
  {
    id: "other_services",
    label: "Other Services",
    departmentId: "escalations",
    description: "Infant Care, Spa & Wellness, Medevac, Cargo & Pet Logistics.",
    iconName: "PlusCircle",
  },
];

/**
 * Sub-services available under "Other Services"
 * Corresponds directly to existing verified services on the website.
 */
export const CHATBOT_OTHER_SERVICES: ChatbotServiceOption[] = [
  {
    id: "infant_care",
    label: "Infant Care",
    departmentId: "doortodoor",
    description: "Pram escort, priority boarding & family airport assistance.",
    iconName: "Baby",
    isOtherCategory: true,
  },
  {
    id: "spa_wellness",
    label: "Spa & Wellness",
    departmentId: "holidays",
    description: "Couples spa suites, hydrotherapy & layover rejuvenation.",
    iconName: "Sparkles",
    isOtherCategory: true,
  },
  {
    id: "cargo_pet",
    label: "Pet Transfer (Cargo & Avi Pet)",
    departmentId: "transport",
    description: "IATA-compliant live animal transit & climate-controlled cargo.",
    iconName: "PawPrint",
    isOtherCategory: true,
  },
  {
    id: "cargo_general",
    label: "Cargo Services",
    departmentId: "transport",
    description: "Express airside cargo handling, customs liaison & freight.",
    iconName: "Package",
    isOtherCategory: true,
  },
  {
    id: "air_ambulance",
    label: "Air Ambulance",
    departmentId: "escalations",
    description: "24/7 dedicated airborne ICU jets with aero-medical doctors.",
    iconName: "Plane",
    isOtherCategory: true,
  },
  {
    id: "train_ambulance",
    label: "Train Ambulance",
    departmentId: "escalations",
    description: "Long-distance rail patient transfer with ICU coupe & oxygen.",
    iconName: "Train",
    isOtherCategory: true,
  },
  {
    id: "hum_remains",
    label: "Human Remains Transfer (HUM)",
    departmentId: "escalations",
    description: "Compassionate, fully documented repatriation of mortal remains.",
    iconName: "HeartHandshake",
    isOtherCategory: true,
  },
  {
    id: "pso_security",
    label: "PSO & Security Services",
    departmentId: "events",
    description: "Personal security officers and luxury retail escort.",
    iconName: "ShieldCheck",
    isOtherCategory: true,
  },
  {
    id: "onboard_meals",
    label: "Onboard Meals",
    departmentId: "flight",
    description: "Gourmet in-flight catering & dietary curation for groups.",
    iconName: "UtensilsCrossed",
    isOtherCategory: true,
  },
];

/**
 * Builds a direct, professional, pre-filled WhatsApp message for any selected department or service.
 * User does not need to answer intermediate questions; simply tap to open WhatsApp with the department.
 */
export function buildDepartmentDirectWhatsAppMessage(
  target: { title?: string; name?: string; label?: string; departmentNumber?: number }
): string {
  let title = "";
  if ("label" in target && target.label) {
    title = target.label;
  } else if ("title" in target && target.title) {
    title = target.title;
  } else if ("name" in target && target.name) {
    title = target.name;
  } else {
    title = "Customer Support";
  }

  return [
    `Hello Shafsky Aviation Team,`,
    ``,
    `I would like to inquire about *${title}* services.`,
    `Please assist me with availability, procedure, and pricing details.`,
    ``,
    `Thank you.`,
  ].join("\n");
}

/**
 * Resolves a service's department contact from the centralized DEPARTMENT_CONTACTS.
 */
export function resolveServiceDepartment(service: ChatbotServiceOption): DepartmentContact {
  return DEPARTMENT_CONTACTS[service.departmentId] || DEPARTMENT_CONTACTS.meet_greet;
}
