/**
 * Client functions and TypeScript contracts for Website Contact Management System.
 * Supports the 6 canonical services with 2 slots each.
 */

import { apiGet, apiPut } from "./FastApiClient";

export type ServiceKey =
  | "meet_greet_lounge"
  | "transport"
  | "hotel"
  | "private_charter"
  | "ticketing"
  | "contact";

export interface ContactSlotItem {
  slot_index: number;
  country_code: string;
  phone_number: string;
  full_phone_number: string;
  is_active: boolean;
}

export interface ServiceContactConfig {
  service_key: ServiceKey;
  service_name: string;
  slots: ContactSlotItem[];
}

export interface ContactSlotInput {
  slot_index: number;
  country_code?: string;
  phone_number?: string;
  is_active?: boolean;
}

export interface ServiceContactUpdateItem {
  service_key: ServiceKey;
  slots: ContactSlotInput[];
}

export interface ContactSettingsUpdateRequest {
  services: ServiceContactUpdateItem[];
}

export interface PublicContactSlot {
  country_code: string;
  phone_number: string;
  full_phone_number: string;
  formatted?: string;
  tel_link?: string;
}

export interface PublicServiceContact {
  service_name: string;
  contacts: PublicContactSlot[];
}

export type PublicContactSettingsData = Record<ServiceKey, PublicServiceContact>;

export const CANONICAL_SERVICES: { key: ServiceKey; name: string; description: string }[] = [
  {
    key: "meet_greet_lounge",
    name: "Meet & Greet Lounge",
    description: "Airport tarmac reception, VIP lounge access, and expedited airside assistance.",
  },
  {
    key: "transport",
    name: "Transport",
    description: "Chauffeured tarmac transfers, executive sedans, and luxury city transfers.",
  },
  {
    key: "hotel",
    name: "Hotel",
    description: "Airport transit hotels and luxury partner hospitality concierge.",
  },
  {
    key: "private_charter",
    name: "Private Charter",
    description: "Private jet and helicopter charter coordinator operations desk.",
  },
  {
    key: "ticketing",
    name: "Ticketing",
    description: "Instant commercial flight ticketing, seat blocks, and flight modifications.",
  },
  {
    key: "contact",
    name: "Contact",
    description: "Central 24/7 hotline and general customer care desk.",
  },
];

/**
 * Fetch public contact settings (cached, no credentials required).
 */
export async function getPublicContactSettings(): Promise<PublicContactSettingsData> {
  return apiGet<PublicContactSettingsData>("/api/public/contact-settings");
}

/**
 * Fetch all six services and both slots for Admin portal.
 */
export async function getAdminContactSettings(): Promise<ServiceContactConfig[]> {
  return apiGet<ServiceContactConfig[]>("/api/admin/contact-settings");
}

/**
 * Persist updated contact slots for Admin portal.
 */
export async function updateAdminContactSettings(
  payload: ContactSettingsUpdateRequest
): Promise<ServiceContactConfig[]> {
  return apiPut<ServiceContactConfig[]>("/api/admin/contact-settings", payload);
}
