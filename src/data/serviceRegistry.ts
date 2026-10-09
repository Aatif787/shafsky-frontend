import {
  OFFICIAL_SHAFSKY_SERVICES
} from "@/services/catalog";
import {
  LucideIcon
} from "lucide-react";

export type ServiceCategory = "concierge" | "hotels" | "transport" | "special-services" | "aviation" | "security";

export interface ServiceSEO {
  title: string;
  description: string;
  keywords: string[];
}

import { getRequiredBookingFields, getServiceDescriptor } from "@/components/booking/config/services.config";
export { getRequiredBookingFields, getServiceDescriptor };

export interface ServiceEntry {
  id: string;
  name: string;
  category: ServiceCategory;
  categoryName: string;
  categoryHref: string;
  icon: LucideIcon;
  shortDescription: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  route: string;
  requiresAirport: boolean;
  requiresFlight: boolean;
  supportsPackages: boolean;
  relatedServiceIds: string[];
  accentColor: string;
  seo: ServiceSEO;
  bookingConfigId: string;
}

// Convert OFFICIAL_SHAFSKY_SERVICES into ServiceEntry format
export const SERVICE_REGISTRY: Record<string, ServiceEntry> = OFFICIAL_SHAFSKY_SERVICES.reduce(
  (acc, item) => {
    let category: ServiceCategory = "concierge";
    let categoryHref = "/solutions/concierge";

    if (item.categoryId === "ground_transport") {
      category = "transport";
      categoryHref = "/solutions/transport";
    } else if (item.categoryId === "private_charter") {
      category = "aviation";
      categoryHref = "/solutions/aviation";
    } else if (
      item.categoryId === "air_ticketing" || 
      (item.categoryId as string) === "travel_support" ||
      item.categoryId === "cargo_logistics" || 
      item.categoryId === "medical_assistance"
    ) {
      category = "special-services";
      categoryHref = "/solutions/special-services";
    } else if ((item.categoryId as string) === "hotels" || (item.categoryId as string) === "accommodation") {
      category = "hotels";
      categoryHref = "/solutions/hotels";
    }

    const reqFields = getRequiredBookingFields(item.bookingServiceId || item.id);

    acc[item.id] = {
      id: item.id,
      name: item.name,
      category,
      categoryName: item.categoryName,
      categoryHref,
      icon: item.icon,
      shortDescription: item.oneLiner,
      tagline: item.oneLiner,
      heroTitle: item.name,
      heroSubtitle: item.overview,
      ctaText: `Book ${item.name}`,
      route: `${categoryHref}?sub=${item.id}`,
      requiresAirport: reqFields.requiresAirport,
      requiresFlight: reqFields.requiresFlight,
      supportsPackages: true,
      relatedServiceIds: ["meet_greet", "fast_track", "vip_lounge", "airport_transfer"].filter((id) => id !== item.id),
      accentColor: "#7c3aed",
      bookingConfigId: item.bookingServiceId,
      seo: {
        title: `${item.name} — Shafsky Aviation Services`,
        description: item.overview,
        keywords: [item.name.toLowerCase(), item.categoryName.toLowerCase(), "shafsky aviation"],
      },
    };
    return acc;
  },
  {} as Record<string, ServiceEntry>
);

export function getService(id: string): ServiceEntry {
  return SERVICE_REGISTRY[id] || Object.values(SERVICE_REGISTRY)[0];
}

export function getAllServices(): ServiceEntry[] {
  return Object.values(SERVICE_REGISTRY);
}

export function getServicesByCategory(category: ServiceCategory): ServiceEntry[] {
  return Object.values(SERVICE_REGISTRY).filter((s) => s.category === category);
}

export function getRelatedServices(serviceId: string): ServiceEntry[] {
  const current = getService(serviceId);
  return current.relatedServiceIds.map((id) => getService(id)).filter(Boolean);
}
