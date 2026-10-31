/**
 * Centralized Department Contact Configuration
 *
 * Stores all department contacts, normalized phone numbers for WhatsApp integration,
 * emails, and verification statuses strictly matching the 5 official Support Directory departments.
 */

import {
  SUPPORT_DEPARTMENTS,
  type SupportDepartment,
} from "@/components/navigation/supportData";

export interface DepartmentContact {
  id: string;
  name: string;
  departmentNumber?: number;
  categoryBadge?: string;
  email: string;
  emails?: string[];
  phoneDisplay: string;
  phoneDisplays?: string[];
  normalizedPhone: string; // E.164 digits without +, spaces or brackets
  isWhatsAppVerified: boolean;
}

/**
 * Normalizes any phone number into international format without spaces, brackets, or + sign.
 * e.g. "+91-9599087959" -> "919599087959"
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Verified 24/7 Central Operations / Guest Relations Desk WhatsApp & Phone Number
 * Meet & Greet and Lounge (Department 01)
 */
export const VERIFIED_CENTRAL_OPS_PHONE = "+91-9599087959";
export const VERIFIED_CENTRAL_OPS_WHATSAPP = "919599087959";

/**
 * 5 Canonical Official Support Departments from Support Directory
 */
export const OFFICIAL_SUPPORT_DEPARTMENTS: DepartmentContact[] = SUPPORT_DEPARTMENTS.map((dept: SupportDepartment) => ({
  id: dept.id,
  departmentNumber: dept.departmentNumber,
  name: dept.title,
  categoryBadge: dept.categoryBadge,
  email: dept.emails[0]?.display || "",
  emails: dept.emails.map((e) => e.display),
  phoneDisplay: dept.phones[0]?.display || "",
  phoneDisplays: dept.phones.map((p) => p.display),
  normalizedPhone: normalizePhoneNumber(dept.phones[0]?.display || ""),
  isWhatsAppVerified: true,
}));

/**
 * Centralized Department Contact Registry
 * Strictly derived from the official Support Directory departments.
 */
export const DEPARTMENT_CONTACTS: Record<string, DepartmentContact> = {
  // ─────────────────────────────────────────────────────────────
  // Department 01: Meet & Greet and Lounge
  // Phones: +91-9599087959, +91 95996 15459 | Email: Gro.shafskyaviation@gmail.com
  // ─────────────────────────────────────────────────────────────
  meet_greet: {
    ...OFFICIAL_SUPPORT_DEPARTMENTS[0],
    id: "meet_greet",
    name: "Meet & Greet Concierge",
  },
  meetgreet: {
    ...OFFICIAL_SUPPORT_DEPARTMENTS[0],
    id: "meetgreet",
    name: "Meet & Greet Concierge",
  },
  doortodoor: {
    ...OFFICIAL_SUPPORT_DEPARTMENTS[0],
    id: "doortodoor",
    name: "Door to Door Assistance",
  },
  gro: {
    ...OFFICIAL_SUPPORT_DEPARTMENTS[0],
    id: "gro",
    name: "Meet & Greet and Lounge",
  },

  // ─────────────────────────────────────────────────────────────
  // Department 02: Air Ticketing, Event Management, Transportation & Hotels
  // Phone: +91-9599087957 | Email: shafskyaviation.social@gmail.com
  // ─────────────────────────────────────────────────────────────
  flight: {
    ...OFFICIAL_SUPPORT_DEPARTMENTS[1],
    id: "flight",
    name: "Air Ticketing & Flight Support",
  },
  transport: {
    ...OFFICIAL_SUPPORT_DEPARTMENTS[1],
    id: "transport",
    name: "Transportation & Luxury Fleet",
  },
  events: {
    ...OFFICIAL_SUPPORT_DEPARTMENTS[1],
    id: "events",
    name: "Event Management & Logistics",
  },

  // ─────────────────────────────────────────────────────────────
  // Department 03: Visa Assistance, Air Ticketing, Hotels & General Inquiry
  // Phone: +91 92175 22660 | Email: commercialshafskyaviation@gmail.com
  // ─────────────────────────────────────────────────────────────
  visa: {
    ...OFFICIAL_SUPPORT_DEPARTMENTS[2],
    id: "visa",
    name: "Visa Assistance Services",
  },
  hotel: {
    ...OFFICIAL_SUPPORT_DEPARTMENTS[2],
    id: "hotel",
    name: "Hotels & Stays",
  },
  holidays: {
    ...OFFICIAL_SUPPORT_DEPARTMENTS[2],
    id: "holidays",
    name: "Travel, Tour & Holidays",
  },

  // ─────────────────────────────────────────────────────────────
  // Department 04: Escalation (Management & HR Escalation)
  // Phones: +91 98188 50755, +91 95992 24680 | Emails: gm.shafskyaviation@gmail.com, hr.shafskyaviation@gmail.com
  // ─────────────────────────────────────────────────────────────
  escalations: {
    ...OFFICIAL_SUPPORT_DEPARTMENTS[3],
    id: "escalations",
    name: "Management & HR Escalation",
  },
  escalation: {
    ...OFFICIAL_SUPPORT_DEPARTMENTS[3],
    id: "escalation",
    name: "Management & HR Escalation",
  },

  // ─────────────────────────────────────────────────────────────
  // Department 05: Finance (Billing & Accounts)
  // Phone: +91 88006 98554 | Email: financeshafskyaviation@gmail.com
  // ─────────────────────────────────────────────────────────────
  finance: {
    ...OFFICIAL_SUPPORT_DEPARTMENTS[4],
    id: "finance",
    name: "Finance & Accounts",
  },
};

/**
 * Builds an official WhatsApp click-to-chat URL with optional pre-filled message
 */
export function buildWhatsAppUrl(phoneNumber: string, message?: string): string {
  const normalized = normalizePhoneNumber(phoneNumber);
  const base = `https://wa.me/${normalized}`;
  if (!message || message.trim() === "") {
    return base;
  }
  return `${base}?text=${encodeURIComponent(message)}`;
}
