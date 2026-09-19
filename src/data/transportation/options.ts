import type { TransportOptionDef } from "./types";
import { LUXURY_VEHICLES_CATALOG } from "./luxury";
import { MUV_LARGE_VEHICLES_CATALOG } from "./muv";
import { ECONOMY_STANDARD_CATALOG } from "./economy";

/**
 * Canonical fleet category options and specifications.
 * Preserves all existing vehicle models, taglines, badges, and inclusions verbatim.
 */
export const TRANSPORT_OPTIONS: TransportOptionDef[] = [
  {
    id: "Luxury Vehicles",
    label: "Luxury Vehicles",
    badge: "FLAGSHIP LUXURY SEDANS",
    tagline:
      "Chauffeured Mercedes-Maybach, Mercedes S-Class, BMW 7-Series, and direct tarmac sedan transfer to the aircraft.",
    vehicleModels: [
      "Mercedes-Benz Maybach S-Class",
      "Mercedes-Benz S-Class (W223)",
      "BMW 7 Series (Executive Lounge)",
      "Audi A8 L Quattro",
    ],
    inclusions: [
      "Direct Tarmac Curbside to Aircraft Apron Chauffeur Transfer",
      "Uniformed, Security-Cleared Professional Executive Chauffeur",
      "Complimentary High-Speed Onboard Wi-Fi, Water & Amenities",
      "Flight Radar Live Tracking for Dynamic Landing Adjustments",
      "60 Minutes Complimentary Waiting Time at Airport Arrivals",
      "Sanitized Leather Cabin with Dual Rear Reclining Seats",
    ],
    vehicles: LUXURY_VEHICLES_CATALOG,
  },
  {
    id: "MUV / Large Vehicles",
    label: "MUV / Large Vehicles",
    badge: "EXECUTIVE MPV & GROUP FLEET",
    tagline:
      "Spacious Toyota Vellfire, Mercedes V-Class, and executive vans with business class captain seating.",
    vehicleModels: [
      "Toyota Vellfire / Alphard (Ottoman Recliners)",
      "Mercedes-Benz V-Class / EQV",
      "Toyota Innova HyCross (Captain Seats)",
      "Luxury 12-Seater Executive Cruiser",
    ],
    inclusions: [
      "First-Class Ottoman Lounge Recliners & Ambient Lighting",
      "Generous Oversized Luggage Capacity (Up to 8 Large Suitcases)",
      "Private Tinted Acoustic Glass & Dual Sunroofs for Ultimate Privacy",
      "Seamless Group Transfers for Families, Entourages & Flight Crews",
      "Onboard 220V AC Power & USB-C High-Speed Fast Charging",
      "Dedicated Airport Ground Host Coordination at Arrivals Gate",
    ],
    vehicles: MUV_LARGE_VEHICLES_CATALOG,
  },
  {
    id: "Economy / Standard",
    label: "Economy / Standard",
    badge: "AIRPORT TRANSIT & CITY SEDANS",
    tagline:
      "Punctual, clean, and reliable executive airport transfers, day disposal, and inter-city connectivity.",
    vehicleModels: [
      "Executive Sedan (Honda City / Maruti Ciaz)",
      "Standard Compact Sedan (Clean Air-Conditioned)",
      "Airport Transit Shuttles",
      "Hourly Disposal City Sedan",
    ],
    inclusions: [
      "Punctual Curbside Airport Drop-off and Terminal Pickup",
      "Fixed Transparent Pricing with Zero Surge Surcharges",
      "Modern Air-Conditioned Fleet with Experienced Route Drivers",
      "24/7 Dispatch Control Room & GPS Real-Time Monitoring",
      "Ample Boot Space for Standard Travel Bags and Carry-ons",
      "Flexible Hourly City Disposal & Airport Transfer Packages",
    ],
    vehicles: ECONOMY_STANDARD_CATALOG,
  },
];

