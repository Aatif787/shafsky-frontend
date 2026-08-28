import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Ticket,
  Hotel,
  HeartPulse,
  Package,
  Luggage,
  Car,
  Plane,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  Award,
  Crown,
  PlaneTakeoff,
  Stethoscope,
  Compass,
  FileCheck,
  Truck,
  Briefcase,
  LucideIcon,
} from "lucide-react";

import meetGreetImg from "@/assets/meet-greet.png";
import meetVideo from "@/assets/meet.mp4";
import lounge from "@/assets/lounge.png";
import fastTrackImg from "@/assets/fast-track.png";
import vipTransport1 from "@/assets/vip-transport-1.png";
import hotelImg from "@/assets/hotel.png";
import cargoAssistImg from "@/assets/cargo-assist.png";
import medicalAssistImg from "@/assets/medical-assist.png";
import vipConciergeImg from "@/assets/vip-concierge.png";
import interior from "@/assets/interior.jpg";
import jetTarmac from "@/assets/jet-tarmac.jpg";
import cargo from "@/assets/cargo.jpg";
import medical from "@/assets/medical.jpg";
import concierge from "@/assets/concierge.jpg";
import heroJet from "@/assets/hero-jet.png";

export type ServiceCategoryId =
  | "all"
  | "airport_assistance"
  | "air_ticketing"
  | "private_charter"
  | "ground_transport"
  | "cargo_logistics"
  | "medical_assistance";

export interface CategoryCatalogItem {
  id: ServiceCategoryId;
  name: string;
  shortName: string;
  icon: LucideIcon;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ServiceCatalogItem {
  id: string;
  slug: string;
  name: string;
  categoryId: ServiceCategoryId;
  categoryName: string;
  bookingServiceId: string;
  icon: LucideIcon;
  oneLiner: string;
  estTime: string;
  startingPrice: string;
  badge?: string;
  overview: string;
  includedFeatures: string[];
  whoIsThisFor: string;
  requirements: string[];
  imageUrl: string;
  videoUrl?: string;
  sortOrder: number;
  isActive: boolean;
  isHidden: boolean;
}

export const OFFICIAL_SHAFSKY_CATEGORIES: CategoryCatalogItem[] = [
  {
    id: "all",
    name: "All Services",
    shortName: "All",
    icon: Sparkles,
    description: "Explore all official Shafsky Aviation Services concierge & travel assistance services.",
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "airport_assistance",
    name: "Airport Assist",
    shortName: "Airport",
    icon: Crown,
    description: "Personal hosts, fast-track, lounge access & baggage assistance.",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "air_ticketing",
    name: "Air Ticketing",
    shortName: "Ticketing",
    icon: Ticket,
    description: "Domestic & international seat holds, rebooking, rescheduling & cancellation support.",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "private_charter",
    name: "Private Charter",
    shortName: "Charter",
    icon: Plane,
    description: "On-demand private aircraft charters and group flight charters.",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "ground_transport",
    name: "Ground Transport",
    shortName: "Transport",
    icon: Car,
    description: "Chauffeured private transfers between airport and your destination.",
    sortOrder: 4,
    isActive: true,
  },
  {
    id: "cargo_logistics",
    name: "Cargo & Logistics",
    shortName: "Cargo",
    icon: Package,
    description: "Air cargo customs clearance liaison & priority baggage handling.",
    sortOrder: 5,
    isActive: true,
  },
  {
    id: "medical_assistance",
    name: "Medical Assist",
    shortName: "Medical",
    icon: HeartPulse,
    description: "Trained airport mobility attendants and passenger medical escorts.",
    sortOrder: 6,
    isActive: true,
  },
];

export const OFFICIAL_SHAFSKY_SERVICES: ServiceCatalogItem[] = [
  // ── 1. AIRPORT ASSISTANCE (MASTER PACKAGES ONLY) ──
  // Demo service entries removed

  // ── 2. AIR TICKETING ──
  {
    id: "domestic_air_ticketing",
    slug: "domestic-air-ticketing",
    name: "Domestic Air Ticketing",
    categoryId: "air_ticketing",
    categoryName: "Air Ticketing",
    bookingServiceId: "air_ticketing",
    icon: Ticket,
    oneLiner: "Instant domestic flight bookings across 20+ Indian hubs with preferred seat holds.",
    estTime: "1 min booking",
    startingPrice: "On Request",
    badge: "Domestic Flight",
    overview:
      "Official domestic flight seat reservations across all Indian commercial airlines with preferred seat allocation, meal holds, and schedule verification.",
    includedFeatures: [
      "Preferred seat allocation & baggage entitlement",
      "24/7 ticket issuance & schedule confirmation",
      "Direct airline GDS booking integration",
      "Instant booking receipt & PNR generation",
    ],
    whoIsThisFor: "Business & leisure travelers booking domestic flights across India.",
    requirements: ["Origin & Destination", "Travel Date", "Passenger Name"],
    imageUrl: fastTrackImg,
    sortOrder: 10,
    isActive: true,
    isHidden: false,
  },
  {
    id: "international_air_ticketing",
    slug: "international-air-ticketing",
    name: "International Air Ticketing",
    categoryId: "air_ticketing",
    categoryName: "Air Ticketing",
    bookingServiceId: "air_ticketing",
    icon: PlaneTakeoff,
    oneLiner: "Global international flight ticketing with flexible fares and priority seating.",
    estTime: "2 min booking",
    startingPrice: "On Request",
    badge: "Global Flight",
    overview:
      "Global international flight reservations in First, Business, and Premium Economy Class with flexible cancellation options and multi-city routing.",
    includedFeatures: [
      "First & Business class seat holds and upgrades",
      "Multi-destination & complex itinerary ticketing",
      "Flexible cancellation & modification options",
      "Dedicated flight desk support",
    ],
    whoIsThisFor: "Overseas travelers, corporate executives, and international delegates.",
    requirements: ["Passport Details", "Route", "Travel Dates"],
    imageUrl: jetTarmac,
    sortOrder: 11,
    isActive: true,
    isHidden: false,
  },
  {
    id: "flight_rebooking",
    slug: "flight-rebooking",
    name: "Flight Rebooking",
    categoryId: "air_ticketing",
    categoryName: "Air Ticketing",
    bookingServiceId: "air_ticketing",
    icon: Clock,
    oneLiner: "Urgent flight rebooking for missed connections and schedule changes.",
    estTime: "2 min dispatch",
    startingPrice: "On Request",
    badge: "Urgent Support",
    overview:
      "Express flight rebooking assistance when connections are missed or flights are delayed, securing next-available seats across partner carriers.",
    includedFeatures: [
      "Next-available flight seat protection",
      "Airline fee waiver negotiations",
      "Connecting flight re-routing",
      "24/7 ticketing desk dispatch",
    ],
    whoIsThisFor: "Passengers with missed connections or urgent itinerary changes.",
    requirements: ["Original PNR", "New Date/Flight Request"],
    imageUrl: fastTrackImg,
    sortOrder: 12,
    isActive: true,
    isHidden: false,
  },
  {
    id: "flight_rescheduling",
    slug: "flight-rescheduling",
    name: "Flight Rescheduling",
    categoryId: "air_ticketing",
    categoryName: "Air Ticketing",
    bookingServiceId: "air_ticketing",
    icon: Clock,
    oneLiner: "Flexible date and time modification for confirmed flight tickets.",
    estTime: "1 min request",
    startingPrice: "On Request",
    badge: "Schedule Flexibility",
    overview:
      "Seamless travel date or time adjustment assistance on existing bookings with fare difference optimization and instant seat re-assignment.",
    includedFeatures: [
      "Date & time change assistance",
      "Fare difference calculation & seat re-assignment",
      "PNR update & new ticket confirmation",
      "Airline policy compliance verification",
    ],
    whoIsThisFor: "Travelers needing to modify their travel plans.",
    requirements: ["PNR Number", "New Travel Date"],
    imageUrl: hotelImg,
    sortOrder: 13,
    isActive: true,
    isHidden: false,
  },
  {
    id: "flight_cancellation_assistance",
    slug: "flight-cancellation-assistance",
    name: "Flight Cancellation Assist",
    categoryId: "air_ticketing",
    categoryName: "Air Ticketing",
    bookingServiceId: "air_ticketing",
    icon: ShieldCheck,
    oneLiner: "Express ticket cancellation and maximum refund recovery support.",
    estTime: "1 min request",
    startingPrice: "On Request",
    badge: "Refund Recovery",
    overview:
      "Fast ticket cancellation processing and maximum refund claim tracking directly with airlines to minimize cancellation penalties.",
    includedFeatures: [
      "Immediate booking cancellation with airline",
      "Full refund claim processing & follow-up",
      "Cancellation fee minimization support",
      "Credit shell tracking & re-use management",
    ],
    whoIsThisFor: "Travelers needing to cancel confirmed flight bookings.",
    requirements: ["Booking PNR", "Passenger Name"],
    imageUrl: vipConciergeImg,
    sortOrder: 14,
    isActive: true,
    isHidden: false,
  },

  // ── 3. PRIVATE CHARTER ──
  {
    id: "private_aircraft_charter",
    slug: "private-charter",
    name: "Private Aircraft Charter",
    categoryId: "private_charter",
    categoryName: "Private Charter",
    bookingServiceId: "charter",
    icon: Plane,
    oneLiner: "Fly on your own schedule with direct point-to-point routes and private FBO terminal access.",
    estTime: "2 min inquiry",
    startingPrice: "On Request",
    badge: "VVIP Charter",
    overview:
      "Charter private aircraft tailored to your exact departure times, destination cities, and privacy requirements with private FBO terminal access.",
    includedFeatures: [
      "Private FBO terminal lounge access",
      "Custom departure times & direct flight routes",
      "Bespoke inflight gourmet dining & beverages",
      "Zero public security queues or public waiting",
    ],
    whoIsThisFor: "High-net-worth individuals, CEOs, celebrities, and VIP delegations.",
    requirements: ["Origin & Destination", "Travel Date", "Passenger Count"],
    imageUrl: jetTarmac,
    sortOrder: 20,
    isActive: true,
    isHidden: false,
  },
  {
    id: "group_charter",
    slug: "group-charter",
    name: "Group Charter",
    categoryId: "private_charter",
    categoryName: "Private Charter",
    bookingServiceId: "charter",
    icon: Users,
    oneLiner: "Custom aircraft charter for corporate teams, sports groups, and wedding parties.",
    estTime: "2 min inquiry",
    startingPrice: "On Request",
    badge: "Group Travel",
    overview:
      "Dedicated aircraft charter for corporate delegations, sports teams, and large events with custom check-in desks and tailored onboard service.",
    includedFeatures: [
      "Dedicated aircraft for 20 to 180 passengers",
      "Custom airport check-in branding & luggage allocation",
      "Custom inflight menu & group itinerary coordination",
      "Direct charter flight desk dispatch",
    ],
    whoIsThisFor: "Corporate groups, wedding delegations, and sports teams.",
    requirements: ["Group Size", "Itinerary Details"],
    imageUrl: heroJet,
    sortOrder: 21,
    isActive: true,
    isHidden: false,
  },

  // ── 4. GROUND TRANSPORT ──
  {
    id: "airport_transfer",
    slug: "airport-transfer",
    name: "Airport Transfer",
    categoryId: "ground_transport",
    categoryName: "Ground Transport",
    bookingServiceId: "transport",
    icon: Car,
    oneLiner: "Reliable private pickup and drop-off between airport and your destination.",
    estTime: "1 min booking",
    startingPrice: "On Request",
    badge: "Airport Ride",
    overview:
      "Pre-booked private transfers ensuring your chauffeur is waiting for you outside arrivals with a clean, air-conditioned vehicle.",
    includedFeatures: [
      "Flight tracking with automatic waiting time adjustment",
      "Uniformed chauffeur with name sign welcome",
      "Clean, sanitized, luxury vehicle",
      "Fixed pricing with zero surge fees",
    ],
    whoIsThisFor: "Every traveler seeking stress-free airport commuting.",
    requirements: ["Pickup Address", "Flight Arrival Time", "Luggage Count"],
    imageUrl: vipTransport1,
    sortOrder: 30,
    isActive: true,
    isHidden: false,
  },

  // ── 5. CARGO & LOGISTICS ──
  {
    id: "cargo_clearance",
    slug: "cargo-clearance",
    name: "Cargo Clearance & Handling",
    categoryId: "cargo_logistics",
    categoryName: "Cargo & Logistics",
    bookingServiceId: "porter",
    icon: Package,
    oneLiner: "Express air cargo clearance, customs documentation, and priority baggage handling.",
    estTime: "1 min inquiry",
    startingPrice: "Starting ₹4,999",
    badge: "Customs Escort",
    overview:
      "Comprehensive air freight solutions with priority airline cargo space allocation, temperature tracking, and door-to-door delivery.",
    includedFeatures: [
      "Express customs documentation liaison",
      "Priority air cargo space allocation",
      "Valuable freight & baggage escort",
      "End-to-end status tracking",
    ],
    whoIsThisFor: "Commercial air cargo shippers and travelers with high baggage volumes.",
    requirements: ["Cargo Description", "Weight & Dimensions"],
    imageUrl: cargo,
    sortOrder: 40,
    isActive: true,
    isHidden: false,
  },

  // ── 6. MEDICAL ASSISTANCE ──
  {
    id: "medical_escort",
    slug: "medical-escort",
    name: "Airport Wheelchair & Medical Escort",
    categoryId: "medical_assistance",
    categoryName: "Medical Assist",
    bookingServiceId: "wheelchair",
    icon: HeartPulse,
    oneLiner: "Trained airport attendant and medical escort for safe passenger travel.",
    estTime: "1 min booking",
    startingPrice: "Starting ₹3,499",
    badge: "Medical Support",
    overview:
      "Wheelchair assistance, ambulift, nursing escort, and medical coordination across our network of airports.",
    includedFeatures: [
      "Dedicated mobility attendant through terminal",
      "Ramp & elevator assistance",
      "Priority boarding and seating escort",
      "Emergency medical coordination",
    ],
    whoIsThisFor: "Senior citizens, unwell passengers, and travelers needing medical support.",
    requirements: ["Medical Details", "Flight Number"],
    imageUrl: medical,
    sortOrder: 50,
    isActive: true,
    isHidden: false,
  },
];



import { resolveApiUrl } from "@/lib/api/config";

export async function fetchServiceCatalog(): Promise<ServiceCatalogItem[]> {
  try {
    const url = resolveApiUrl("/api/services/catalog");
    const res = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });
    if (!res.ok) {
      return OFFICIAL_SHAFSKY_SERVICES;
    }
    const json = await res.json();
    if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
      // Map API payload to ServiceCatalogItem
      return json.data.map((item: any, idx: number) => ({
        id: item.id || `service_${idx}`,
        slug: item.slug || item.id?.replace(/_/g, "-") || "service",
        name: item.title || item.name || "Shafsky Service",
        categoryId: (item.category_id || item.categoryId || "airport_assistance") as ServiceCategoryId,
        categoryName: item.category || item.categoryName || "Airport Assist",
        bookingServiceId: item.booking_service_id || item.bookingServiceId || "meet_greet",
        icon: Users,
        oneLiner: item.one_liner || item.description || "Official Shafsky Aviation Services Service",
        estTime: item.est_time || "1 min booking",
        startingPrice: item.base_price ? `Starting ₹${item.base_price}` : "On Request",
        badge: item.badge || "Official Service",
        overview: item.description || "Official Shafsky Aviation Services Service.",
        includedFeatures: Array.isArray(item.features) ? item.features : ["Official Shafsky Service"],
        whoIsThisFor: item.who_is_this_for || "All Shafsky passengers.",
        requirements: ["Flight Number", "Date"],
        imageUrl: item.image_url || meetGreetImg,
        sortOrder: item.sort_order || idx,
        isActive: item.is_active !== false,
        isHidden: item.is_hidden === true,
      }));
    }
  } catch {
    // Fallback to static official catalog
  }

  return OFFICIAL_SHAFSKY_SERVICES;
}

export function useServiceCatalog() {
  return useQuery({
    queryKey: ["services-catalog"],
    queryFn: fetchServiceCatalog,
    staleTime: 1000 * 60 * 15, // 15 minutes cache
    initialData: OFFICIAL_SHAFSKY_SERVICES,
  });
}
