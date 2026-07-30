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
  Luggage,
  Sparkles,
} from "lucide-react";

export type ServiceCategory = "concierge" | "travel" | "cargo" | "medical" | "aviation" | "security";

export interface ServiceSEO {
  title: string;
  description: string;
  keywords: string[];
}

export interface ServiceEntry {
  id: string;
  name: string;
  category: ServiceCategory;
  categoryName: string;
  categoryHref: string;
  icon: any;
  shortDescription: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  route: string;
  requiresAirport: boolean;
  supportsPackages: boolean;
  relatedServiceIds: string[];
  accentColor: string; // Brand palette: Lime Green "#84cc16", Violet "#7c3aed", Soft Orange "#f97316"
  seo: ServiceSEO;
  bookingConfigId: string;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CENTRALIZED SERVICE REGISTRY — SINGLE SOURCE OF TRUTH
 * Defines all platform service metadata, routes, icons, CTAs, SEO, and relationships.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const SERVICE_REGISTRY: Record<string, ServiceEntry> = {
  // ── 1. MEET & GREET CONCIERGE ──
  meet_greet: {
    id: "meet_greet",
    name: "Meet & Greet Concierge",
    category: "concierge",
    categoryName: "Airport Services",
    categoryHref: "/solutions/concierge",
    icon: Crown,
    shortDescription: "Aerobridge placard greeting, dedicated luggage porters, and priority airside escort.",
    tagline: "Aerobridge Placard Greeting & Escort",
    heroTitle: "Flagship Airport Meet & Greet",
    heroSubtitle: "A uniformed Guest Relations Officer greets you at the aerobridge exit with discrete name placarding.",
    ctaText: "Book Airport Assistance",
    route: "/solutions/concierge?sub=meet_greet",
    requiresAirport: true,
    supportsPackages: true,
    relatedServiceIds: ["lounge", "fast_track", "transport"],
    accentColor: "#7c3aed",
    bookingConfigId: "meet_greet",
    seo: {
      title: "Meet & Greet Airport Concierge — Shafsky Aviation",
      description: "VIP aerobridge greeting, baggage handling, and fast-track arrival escort at 500+ global hubs.",
      keywords: ["meet and greet airport", "vip airport escort", "airside concierge", "aerobridge welcome"],
    },
  },

  // ── 2. VIP AIRPORT LOUNGE ──
  lounge: {
    id: "lounge",
    name: "VIP Airport Lounge",
    category: "concierge",
    categoryName: "Airport Services",
    categoryHref: "/solutions/concierge",
    icon: Hotel,
    shortDescription: "Private VIP lounge suites, gourmet dining, quiet workspaces, and shower facilities.",
    tagline: "VIP Sanctuary & Quiet Workspaces",
    heroTitle: "Exclusive VIP Airport Lounge Access",
    heroSubtitle: "Enjoy private lounge suites, hot buffet dining, high-speed Wi-Fi, and luxury shower facilities.",
    ctaText: "Reserve Lounge Pass",
    route: "/solutions/concierge?sub=lounge",
    requiresAirport: true,
    supportsPackages: true,
    relatedServiceIds: ["meet_greet", "fast_track", "transport"],
    accentColor: "#7c3aed",
    bookingConfigId: "lounge",
    seo: {
      title: "VIP Airport Lounge Access — Shafsky Aviation",
      description: "Private VIP suites, gourmet buffets, and quiet business sanctuaries at premier international terminals.",
      keywords: ["vip airport lounge", "lounge access booking", "private airport suite"],
    },
  },

  // ── 3. FAST TRACK IMMIGRATION ──
  fast_track: {
    id: "fast_track",
    name: "Fast Track Immigration",
    category: "concierge",
    categoryName: "Airport Services",
    categoryHref: "/solutions/concierge",
    icon: Ticket,
    shortDescription: "Bypass main security and customs queues via diplomatic priority clearance desks.",
    tagline: "Diplomatic Queue Clearance",
    heroTitle: "Diplomatic Fast Track Clearance",
    heroSubtitle: "Bypass main terminal lines via diplomatic priority desks, saving up to 90 minutes during peak transit.",
    ctaText: "Request Fast Track Pass",
    route: "/solutions/concierge?sub=fast_track",
    requiresAirport: true,
    supportsPackages: true,
    relatedServiceIds: ["meet_greet", "lounge", "transport"],
    accentColor: "#7c3aed",
    bookingConfigId: "fast_track",
    seo: {
      title: "Fast Track Immigration Clearance — Shafsky Aviation",
      description: "Bypass arrival and departure queues via diplomatic fast-track lanes worldwide.",
      keywords: ["fast track immigration", "priority airport security", "diplomatic lane clearance"],
    },
  },

  // ── 4. GROUND TRANSPORTATION ──
  transport: {
    id: "transport",
    name: "Chauffeured Ground Transfer",
    category: "concierge",
    categoryName: "Airport Services",
    categoryHref: "/solutions/concierge",
    icon: Car,
    shortDescription: "Private executive Mercedes-Maybach sedan tarmac transfers and city drop-offs.",
    tagline: "Chauffeured Airside Maybach Limousines",
    heroTitle: "Chauffeured Executive Transfers",
    heroSubtitle: "Private sedan transfers across the tarmac directly between VIP lounge sanctuaries and aircraft steps.",
    ctaText: "Book Chauffeur Transfer",
    route: "/solutions/concierge?sub=transport",
    requiresAirport: true,
    supportsPackages: true,
    relatedServiceIds: ["meet_greet", "lounge", "fast_track"],
    accentColor: "#84cc16",
    bookingConfigId: "transport",
    seo: {
      title: "Chauffeured Tarmac & City Transfers — Shafsky Aviation",
      description: "Executive Mercedes-Maybach tarmac transfers and city transfers with personal chauffeurs.",
      keywords: ["tarmac transfer", "chauffeured airport limousine", "maybach airport transfer"],
    },
  },

  // ── 5. AIR TICKETING ──
  air_ticketing: {
    id: "air_ticketing",
    name: "Air Ticketing",
    category: "travel",
    categoryName: "Travel Services",
    categoryHref: "/solutions/travel",
    icon: Ticket,
    shortDescription: "First & Business Class seat allocations, priority seat holds, and instant flight reissuance.",
    tagline: "First & Business Class Seat Allocations",
    heroTitle: "Air Ticketing",
    heroSubtitle: "Priority seat blocking, preferred commercial airline booking, and last-minute flight reissuance with zero cancellation stress.",
    ctaText: "Book Air Ticketing",
    route: "/solutions/travel?sub=air_ticketing",
    requiresAirport: false,
    supportsPackages: false,
    relatedServiceIds: ["hotel", "visa", "onboard_meals"],
    accentColor: "#7c3aed",
    bookingConfigId: "air_ticketing",
    seo: {
      title: "Air Ticketing & Seat Holds — Shafsky Aviation",
      description: "First and Business class flight reservations, priority seat holdings, and executive ticket issuance.",
      keywords: ["air ticketing", "flight ticketing", "vip flight reservation", "business class seat hold"],
    },
  },

  // ── 6. HOTEL BOOKING ──
  hotel: {
    id: "hotel",
    name: "Hotel Booking",
    category: "travel",
    categoryName: "Travel Services",
    categoryHref: "/solutions/travel",
    icon: Hotel,
    shortDescription: "Bespoke 5-star hotel suite bookings with exclusive room upgrades, complimentary breakfast, and butler service.",
    tagline: "5-Star Partner Check-in & Suite Guarantee",
    heroTitle: "Hotel Booking",
    heroSubtitle: "Direct check-in coordination with luxury partner hotels with complimentary room upgrades and late checkout.",
    ctaText: "Request Hotel Booking",
    route: "/solutions/travel?sub=hotel",
    requiresAirport: false,
    supportsPackages: false,
    relatedServiceIds: ["visa", "air_ticketing", "onboard_meals"],
    accentColor: "#7c3aed",
    bookingConfigId: "hotel",
    seo: {
      title: "Hotel Booking & Resort Suite Reservations — Shafsky Aviation",
      description: "Curated 5-star palace suites, room upgrades, and private butler services worldwide.",
      keywords: ["hotel booking", "vip hotel booking", "luxury palace suites", "concierge hotel reservation"],
    },
  },

  // ── 7. VISA ASSISTANCE ──
  visa: {
    id: "visa",
    name: "Visa Assistance",
    category: "travel",
    categoryName: "Travel Services",
    categoryHref: "/solutions/travel",
    icon: Building2,
    shortDescription: "Expedited diplomatic visa processing, doorstep biometric collection, and VIP documentation.",
    tagline: "Diplomatic Priority Visa Clearance",
    heroTitle: "Visa Assistance",
    heroSubtitle: "Priority document processing and embassy diplomatic desk liaison for fast-track visa processing upon arrival or pre-flight.",
    ctaText: "Request Visa Assistance",
    route: "/solutions/travel?sub=visa",
    requiresAirport: false,
    supportsPackages: false,
    relatedServiceIds: ["hotel", "air_ticketing", "onboard_meals"],
    accentColor: "#7c3aed",
    bookingConfigId: "visa",
    seo: {
      title: "Visa Assistance — Shafsky Aviation",
      description: "Expedited diplomatic visa processing, VIP doorstep biometrics, and business travel visas.",
      keywords: ["visa assistance", "fast track visa", "expedited business visa", "diplomatic visa assistance"],
    },
  },

  // ── 8. ON-BOARD MEALS ──
  onboard_meals: {
    id: "onboard_meals",
    name: "On-board Meals",
    category: "travel",
    categoryName: "Travel Services",
    categoryHref: "/solutions/travel",
    icon: Sparkles,
    shortDescription: "Custom Michelin-grade inflight gourmet catering, specialized dietary curation, and fine dining.",
    tagline: "Bespoke Inflight Dining & Culinary Curation",
    heroTitle: "On-board Meals",
    heroSubtitle: "Custom Michelin-grade inflight catering, specialized dietary curation, and fine dining for commercial and charter flights.",
    ctaText: "Reserve On-board Meals",
    route: "/solutions/travel?sub=onboard_meals",
    requiresAirport: false,
    supportsPackages: false,
    relatedServiceIds: ["air_ticketing", "hotel", "visa"],
    accentColor: "#7c3aed",
    bookingConfigId: "onboard_meals",
    seo: {
      title: "In-Flight Gourmet Catering & Bespoke Dining — Shafsky Aviation",
      description: "Michelin-grade inflight culinary curation and luxury catering for commercial and private aviation.",
      keywords: ["inflight gourmet catering", "michelin inflight dining", "private jet catering"],
    },
  },

  // ── 7. AVIATION CARGO & PET FREIGHT ──
  cargo: {
    id: "cargo",
    name: "Cargo & Live AVI Pet Transport",
    category: "cargo",
    categoryName: "Cargo & Logistics",
    categoryHref: "/solutions/cargo",
    icon: Package,
    shortDescription: "Supervised tarmac cargo clearance, climate-controlled animal transport, and express customs.",
    tagline: "Supervised Tarmac Clearance & Live Animal Transport",
    heroTitle: "Aviation Cargo & AVI Pet Transport",
    heroSubtitle: "Specialized aviation freight handling, climate-controlled animal transport, and express customs clearance.",
    ctaText: "Request Cargo Service",
    route: "/solutions/cargo",
    requiresAirport: false,
    supportsPackages: false,
    relatedServiceIds: ["transport", "meet_greet"],
    accentColor: "#f97316",
    bookingConfigId: "cargo",
    seo: {
      title: "Aviation Cargo & Live Pet Transport — Shafsky Aviation",
      description: "Express aviation freight, tarmac supervised cargo clearance, and temperature-controlled pet transport.",
      keywords: ["avi pet transport", "aviation cargo clearance", "express freight concierge"],
    },
  },

  // ── 8. 24/7 AIRBORNE ICU MEDICAL AMBULANCE ──
  air_ambulance: {
    id: "air_ambulance",
    name: "Airborne ICU Medical Ambulance",
    category: "medical",
    categoryName: "Medical Assistance",
    categoryHref: "/solutions/medical",
    icon: HeartPulse,
    shortDescription: "Dedicated airborne ICU jets, specialized flight doctors, and bed-to-bed ground escort.",
    tagline: "Dedicated ICU Aircraft & Bed-to-Bed Medical Transit",
    heroTitle: "24/7 Airborne ICU Medical Evacuation",
    heroSubtitle: "Fully equipped airborne ICU jets, flight doctor teams, and synchronized ground ambulance escorts.",
    ctaText: "Request Emergency Assistance",
    route: "/solutions/medical",
    requiresAirport: false,
    supportsPackages: false,
    relatedServiceIds: ["transport", "jet_charter"],
    accentColor: "#f97316",
    bookingConfigId: "air_ambulance",
    seo: {
      title: "24/7 Air ICU Medical Evacuation — Shafsky Aviation",
      description: "Dedicated airborne ICU jet charters, flight doctor teams, and bed-to-bed patient transfer.",
      keywords: ["air ambulance charter", "airborne icu jet", "medical evacuation flight"],
    },
  },

  // ── 9. ON-DEMAND PRIVATE JET CHARTER ──
  jet_charter: {
    id: "jet_charter",
    name: "On-Demand Private Jet Charter",
    category: "aviation",
    categoryName: "Private Aviation",
    categoryHref: "/solutions/aviation",
    icon: Plane,
    shortDescription: "Direct private jet scheduling, FBO general aviation suites, and ultimate flight privacy.",
    tagline: "Private Executive Jet Charter & FBO Terminal Suite",
    heroTitle: "On-Demand Private Jet Charter",
    heroSubtitle: "Direct flight scheduling across 5,000+ airports with private FBO lounge access and in-flight catering.",
    ctaText: "Request Charter Quote",
    route: "/solutions/aviation",
    requiresAirport: false,
    supportsPackages: false,
    relatedServiceIds: ["meet_greet", "transport", "hotel"],
    accentColor: "#84cc16",
    bookingConfigId: "jet_charter",
    seo: {
      title: "Private Jet Charter & FBO Suites — Shafsky Aviation",
      description: "On-demand executive private jet charters, heavy jets, and private FBO lounge access worldwide.",
      keywords: ["private jet charter", "executive jet booking", "fbo private terminal"],
    },
  },

  // ── 10. DIPLOMATIC VIP SECURITY DETAIL ──
  vip_security: {
    id: "vip_security",
    name: "Diplomatic VIP Security Escort",
    category: "security",
    categoryName: "Security Detail",
    categoryHref: "/solutions/security",
    icon: ShieldCheck,
    shortDescription: "Close protection bodyguards, armored vehicle convoys, and airside security handoffs.",
    tagline: "Armed Bodyguard Escort & Armored Convoy",
    heroTitle: "Diplomatic VIP Security & Close Protection",
    heroSubtitle: "Armed close protection officers, armored vehicle convoys, and confidential airside escort details.",
    ctaText: "Request Security Escort",
    route: "/solutions/security",
    requiresAirport: false,
    supportsPackages: false,
    relatedServiceIds: ["transport", "meet_greet", "jet_charter"],
    accentColor: "#7c3aed",
    bookingConfigId: "vip_security",
    seo: {
      title: "VIP Security & Armored Convoy — Shafsky Aviation",
      description: "Close protection security officers, armored vehicle escorts, and airside diplomatic security.",
      keywords: ["vip security detail", "armored convoy escort", "close protection bodyguards"],
    },
  },
};

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPER FUNCTIONS FOR CONSUMING THE REGISTRY
 * ═══════════════════════════════════════════════════════════════════════════ */

export function getService(id: string): ServiceEntry {
  return SERVICE_REGISTRY[id] || SERVICE_REGISTRY.meet_greet;
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
