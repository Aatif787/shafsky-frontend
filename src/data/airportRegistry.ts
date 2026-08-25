// Centralized Airport Registry for Shafsky Aviation Platform
// Single source of truth for all airport pages, search, cards, service catalogs, and booking integrations.

import dekAmdAir from "@/assets/airports/amd/Dek-Amd-air.png";
import mobAmdAir from "@/assets/airports/amd/Mob-Amd-air.png";
import dekDelAir from "@/assets/airports/del/Dek-Del-air.png";
import mobDelAir from "@/assets/airports/del/Mob-Del-air.png";
import dekMumAir from "@/assets/airports/bom/Dek-mum-air.png";
import dekHydAir from "@/assets/airports/hyd/Dek-Hyd-air.png";
import mobHydAir from "@/assets/airports/hyd/Mob-Hyd-air.png";
import dekLkoAir from "@/assets/airports/lko/Dek-lko-air.png";
import mobLkoAir from "@/assets/airports/lko/Mob-lko-air.png";
import dekJaiAir from "@/assets/airports/jai/Dek-Jai_air.png";
import mobJaiAir from "@/assets/airports/jai/Mob-Jai-air.png";
import dekAtqAir from "@/assets/airports/atq/Dek-Atq-air.jpg";
import mobAtqAir from "@/assets/airports/atq/Mob-Atq-air.jpg";
import dekGauAir from "@/assets/airports/gau/Dek-Gau-air.jpg";
import mobGauAir from "@/assets/airports/gau/Mob-Gau-air.jpg";
import dekVtzAir from "@/assets/airports/vtz/Dek-Vtz-air.jpg";
import mobVtzAir from "@/assets/airports/vtz/Mob-Vtz-air.jpg";
import dekIxeAir from "@/assets/airports/ixe/Dek-Ixe-air.jpg";
import mobIxeAir from "@/assets/airports/ixe/Mob-Ixe-air.jpg";
import dekCokAir from "@/assets/airports/cok/Dek-Cok-air.jpg";
import mobCokAir from "@/assets/airports/cok/Mob-Cok-air.jpg";
import dekMaaAir from "@/assets/airports/maa/Dek-Maa-air.jpg";
import mobMaaAir from "@/assets/airports/maa/Mob-Maa-air.jpg";
import dekGoiAir from "@/assets/airports/goi/Dek-Goi-air.jpg";
import mobGoiAir from "@/assets/airports/goi/Mob-Goi-air.jpg";
import dekGoxAir from "@/assets/airports/gox/Dek-Gox-air.jpg";
import mobGoxAir from "@/assets/airports/gox/Mob-Gox-air.jpg";
import dekBbiAir from "@/assets/airports/bbi/Dek-Bbi-air.jpg";
import mobBbiAir from "@/assets/airports/bbi/Mob-Bbi-air.jpg";

export interface MeetGreetPackage {
  id: string;
  title: string;
  tagline: string;
  price: string;
  isRecommended?: boolean;
  duration: string;
  features: string[];
}

export interface AirportRegistryEntry {
  code: string; // IATA (e.g. DEL)
  icao: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  timezone: string;
  heroTitle: string;
  heroSubtitle: string;
  shortDescription: string;
  coverImage: string;
  mobCoverImage?: string;
  galleryImages: string[];
  coordinates: { lat: number; lng: number };
  airportType: "International Hub" | "Domestic Airport" | "Executive FBO";
  terminals: string;
  operator: string;
  status: "Active" | "Coming Soon";
  featured: boolean;
  availableServiceIds: string[]; // ["meet_greet", "lounge", "fast_track", "transport"]
  meetGreetPackages?: MeetGreetPackage[];
  faqs: Array<[string, string]>;
  relatedAirportCodes: string[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CENTRALIZED AIRPORT REGISTRY
 * ═══════════════════════════════════════════════════════════════════════════ */

export const AIRPORT_REGISTRY: Record<string, AirportRegistryEntry> = {
  // ── 1. DELHI (DEL) ──
  DEL: {
    code: "DEL",
    icao: "VIDP",
    name: "Indira Gandhi International Airport",
    city: "New Delhi",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Delhi Airport Concierge",
    heroSubtitle: "Indira Gandhi International Airport (DEL) — Airside Escort & Airport Services",
    shortDescription: "India's premier international gateway. Enjoy dedicated aerobridge placard greeting, VIP lounge sanctuary, diplomatic fast-track clearance, and luxury Maybach tarmac transfers.",
    coverImage: dekDelAir,
    mobCoverImage: mobDelAir,
    galleryImages: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    ],
    coordinates: { lat: 28.5562, lng: 77.1000 },
    airportType: "International Hub",
    terminals: "Terminal 1, Terminal 2 & Terminal 3",
    operator: "Delhi International Airport Limited (DIAL)",
    status: "Active",
    featured: true,
    availableServiceIds: ["meet_greet", "lounge", "fast_track", "transport"],
    meetGreetPackages: [],
    faqs: [
      ["Where does the Guest Relations Officer meet me at Delhi Airport?", "Your dedicated escort officer meets you immediately upon aircraft exit at the aerobridge entrance holding a discrete name placard."],
      ["Is fast-track available for both international arrivals and departures at Delhi Airport?", "Yes, diplomatic fast-track immigration and security lane clearance is available across both arrival and departure flows at Delhi Airport."],
      ["Can I book ground chauffeur transfer directly to my New Delhi hotel?", "Absolutely. Private Mercedes-Maybach sedans and luxury SUVs are available for tarmac-to-hotel handoffs."],
    ],
    relatedAirportCodes: ["BOM", "AMD", "BLR"],
    seo: {
      title: "Delhi Airport Concierge & Meet & Greet (DEL) — Shafsky Aviation",
      description: "Book VIP Meet & Greet escort, lounge suites, fast track, and tarmac transfers at Delhi Indira Gandhi International Airport (DEL).",
      keywords: ["delhi airport meet and greet", "delhi airport lounge booking", "delhi airport fast track"],
    },
  },

  // ── 2. MUMBAI (BOM) ──
  BOM: {
    code: "BOM",
    icao: "VABB",
    name: "Chhatrapati Shivaji Maharaj International Airport",
    city: "Mumbai",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Mumbai Airport Concierge",
    heroSubtitle: "Chhatrapati Shivaji Maharaj International Airport (BOM) — Concierge Sanctuary",
    shortDescription: "Financial capital gateway of India. Experience seamless aerobridge escorts, luxury lounge suites, expedited customs, and private chauffeur transfers.",
    coverImage: dekMumAir,
    galleryImages: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    ],
    coordinates: { lat: 19.0896, lng: 72.8656 },
    airportType: "International Hub",
    terminals: "All Passenger Hubs & Airside Gates",
    operator: "Mumbai International Airport Limited (MIAL)",
    status: "Active",
    featured: true,
    availableServiceIds: ["meet_greet", "lounge", "fast_track", "transport"],
    meetGreetPackages: [],
    faqs: [
      ["Does Mumbai Airport support fast-track customs clearance?", "Yes, our Guest Relations Officers guide VIP passengers through priority diplomatic queues at Mumbai Airport (BOM)."],
    ],
    relatedAirportCodes: ["DEL", "BLR", "HYD"],
    seo: {
      title: "Mumbai Airport Concierge & Meet & Greet (BOM) — Shafsky Aviation",
      description: "Reserve VIP Meet & Greet, fast-track customs, and Maybach chauffeur transfers at Mumbai Airport (BOM).",
      keywords: ["mumbai airport meet and greet", "mumbai lounge suite", "mumbai airport fast track"],
    },
  },

  // ── 4. AHMEDABAD (AMD) ──
  AMD: {
    code: "AMD",
    icao: "VAAH",
    name: "Sardar Vallabhbhai Patel International Airport",
    city: "Ahmedabad",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Ahmedabad Airport Concierge",
    heroSubtitle: "Sardar Vallabhbhai Patel International Airport (AMD) — VIP Escort",
    shortDescription: "Premier commercial hub of Gujarat. Dedicated aerobridge welcoming, priority baggage retrieval, and chauffeured executive transfers.",
    coverImage: dekAmdAir,
    mobCoverImage: mobAmdAir,
    galleryImages: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    ],
    coordinates: { lat: 23.0772, lng: 72.6347 },
    airportType: "International Hub",
    terminals: "All Passenger Hubs & Airside Gates",
    operator: "Adani Airport Holdings Limited (AAHL)",
    status: "Active",
    featured: true,
    availableServiceIds: ["meet_greet", "transport"],
    meetGreetPackages: [],
    faqs: [
      ["Which services are available at AMD Airport?", "Ahmedabad Airport supports Meet & Greet escort and Ground Transportation chauffeured transfers."],
    ],
    relatedAirportCodes: ["DEL", "BOM", "BLR"],
    seo: {
      title: "Ahmedabad Airport Concierge & Meet & Greet (AMD) — Shafsky Aviation",
      description: "Book VIP Meet & Greet escort and chauffeured transfers at Sardar Vallabhbhai Patel International Airport (AMD).",
      keywords: ["ahmedabad airport meet and greet", "amd airport concierge"],
    },
  },

  // ── 5. BENGALURU (BLR) ──
  BLR: {
    code: "BLR",
    icao: "VOBL",
    name: "Kempegowda International Airport",
    city: "Bengaluru",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Bengaluru Airport Concierge",
    heroSubtitle: "Kempegowda International Airport (BLR) — VIP Escort & Lounge Sanctuary",
    shortDescription: "Tech capital hub of Asia. Award-winning garden sanctuary with fast-track immigration and private lounge suites.",
    coverImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    ],
    coordinates: { lat: 13.1986, lng: 77.7066 },
    airportType: "International Hub",
    terminals: "All Passenger Hubs & Airside Gates",
    operator: "Bangalore International Airport Limited (BIAL)",
    status: "Active",
    featured: true,
    availableServiceIds: ["meet_greet", "lounge", "fast_track", "transport"],
    meetGreetPackages: [],
    faqs: [
      ["Does BLR Airport support VIP escort services?", "Yes, full Meet & Greet and lounge sanctuary access is available at Bengaluru Airport."],
    ],
    relatedAirportCodes: ["DEL", "BOM", "HYD"],
    seo: {
      title: "Bengaluru Airport Concierge (BLR) — Shafsky Aviation",
      description: "Book VIP Meet & Greet, lounge suites, and transfers at Kempegowda International Airport (BLR).",
      keywords: ["bengaluru airport meet and greet", "blr lounge"],
    },
  },

  // ── 6. HYDERABAD (HYD) ──
  HYD: {
    code: "HYD",
    icao: "VOHS",
    name: "Rajiv Gandhi International Airport",
    city: "Hyderabad",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Hyderabad Airport Concierge",
    heroSubtitle: "Rajiv Gandhi International Airport (HYD) — Executive VIP Escort",
    shortDescription: "Pharma and tech hub gateway. Dedicated airside escort, plaza premium lounge suites, and chauffeured city transit.",
    coverImage: dekHydAir,
    mobCoverImage: mobHydAir,
    galleryImages: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    ],
    coordinates: { lat: 17.2403, lng: 78.4294 },
    airportType: "International Hub",
    terminals: "Integrated Passenger Terminal",
    operator: "GMR Hyderabad International Airport Limited (GHIAL)",
    status: "Active",
    featured: false,
    availableServiceIds: ["meet_greet", "lounge", "transport"],
    faqs: [
      ["Where does the officer greet passengers at HYD Airport?", "Officers meet passengers directly at the aerobridge entrance or curbside drop-off."],
    ],
    relatedAirportCodes: ["BLR", "BOM", "DEL"],
    seo: {
      title: "Hyderabad Airport Concierge & Meet & Greet (HYD) — Shafsky Aviation",
      description: "Book VIP Meet & Greet and lounge suites at Hyderabad Rajiv Gandhi International Airport (HYD).",
      keywords: ["hyderabad airport meet and greet", "hyd lounge access"],
    },
  },

  // ── 7. LUCKNOW (LKO) ──
  LKO: {
    code: "LKO",
    icao: "VILK",
    name: "Chaudhary Charan Singh International Airport",
    city: "Lucknow",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Lucknow Airport Concierge",
    heroSubtitle: "Chaudhary Charan Singh International Airport (LKO) — VIP Airside Escort",
    shortDescription: "Gateway to Uttar Pradesh. Premium aerobridge placard greeting, luggage assistance, and executive vehicle handoff.",
    coverImage: dekLkoAir,
    mobCoverImage: mobLkoAir,
    galleryImages: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    ],
    coordinates: { lat: 26.7606, lng: 80.8893 },
    airportType: "International Hub",
    terminals: "All Passenger Hubs & Airside Gates",
    operator: "Lucknow International Airport Limited (LIAL)",
    status: "Active",
    featured: false,
    availableServiceIds: ["meet_greet", "transport"],
    faqs: [
      ["Is Meet & Greet available at Lucknow Airport?", "Yes, dedicated aerobridge escort is active at Lucknow Airport."],
    ],
    relatedAirportCodes: ["DEL", "BOM"],
    seo: {
      title: "Lucknow Airport Concierge & Meet & Greet (LKO) — Shafsky Aviation",
      description: "Book VIP Meet & Greet and chauffeur transfers at Lucknow Airport (LKO).",
      keywords: ["lucknow airport meet and greet", "lko concierge"],
    },
  },


  // ── 12. KOLKATA (CCU) ──
  CCU: {
    code: "CCU",
    icao: "VECC",
    name: "Netaji Subhas Chandra Bose International Airport",
    city: "Kolkata",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Kolkata Airport Concierge",
    heroSubtitle: "Netaji Subhas Chandra Bose International Airport (CCU) — Airside Escort & Airport Services",
    shortDescription: "Gateway to Eastern India. Experience dedicated aerobridge greetings, luggage assistance, fast-track support, and executive car parking escort.",
    coverImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    ],
    coordinates: { lat: 22.6520, lng: 88.4463 },
    airportType: "International Hub",
    terminals: "Terminal 1 (Integrated)",
    operator: "Airports Authority of India (AAI)",
    status: "Active",
    featured: true,
    availableServiceIds: ["meet_greet", "transport"],
    faqs: [
      ["Where does the Guest Relations Officer meet me at Kolkata Airport?", "Your dedicated escort officer meets you near the baggage belt or post-customs/curbside area based on your service package."],
      ["Are both Domestic and International services available at Kolkata Airport?", "Yes, Silver and Gold packages are available across Domestic and International departure and arrival flows."],
    ],
    relatedAirportCodes: ["DEL", "BOM", "HYD", "LKO"],
    seo: {
      title: "Kolkata Airport Concierge & Meet & Greet (CCU) — Shafsky Aviation",
      description: "Book VIP Meet & Greet escort and concierge services at Netaji Subhas Chandra Bose International Airport (CCU).",
      keywords: ["kolkata airport meet and greet", "ccu airport concierge", "kolkata airport fast track"],
    },
  },

  // ── 13. CHENNAI (MAA) ──
  MAA: {
    code: "MAA",
    icao: "VOMM",
    name: "Chennai International Airport",
    city: "Chennai",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Chennai Airport Concierge",
    heroSubtitle: "Chennai International Airport (MAA) — Airside Escort & Airport Services",
    shortDescription: "Gateway of South India. Enjoy aerobridge placard greeting, luggage assistance, lounge access, and executive car transfers.",
    coverImage: dekMaaAir,
    mobCoverImage: mobMaaAir,
    galleryImages: [dekMaaAir],
    coordinates: { lat: 12.9941, lng: 80.1709 },
    airportType: "International Hub",
    terminals: "Terminals 1, 2, 3 & 4",
    operator: "Airports Authority of India (AAI)",
    status: "Active",
    featured: false,
    availableServiceIds: ["meet_greet", "transport"],
    meetGreetPackages: [],
    faqs: [
      ["Where does the officer meet me at Chennai Airport?", "Your escort officer greets you at the aerobridge gate exit with a name placard."],
    ],
    relatedAirportCodes: ["BLR", "HYD", "DEL", "BOM"],
    seo: {
      title: "Chennai Airport Concierge & Meet & Greet (MAA) — Shafsky Aviation",
      description: "Book VIP Meet & Greet escort and chauffeur transfers at Chennai International Airport (MAA).",
      keywords: ["chennai airport meet and greet", "maa airport concierge"],
    },
  },

  // ── 14. GOA (GOI) ──
  GOI: {
    code: "GOI",
    icao: "VOGO",
    name: "Dabolim International Airport",
    city: "Goa",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Goa Airport Concierge",
    heroSubtitle: "Dabolim International Airport (GOI) — VIP Escort & Chauffeur",
    shortDescription: "Premier coastal destination gateway. Dedicated arrival greeting, luggage porterage, and luxury resort transfers.",
    coverImage: dekGoiAir,
    galleryImages: [dekGoiAir, mobGoiAir],
    coordinates: { lat: 15.3808, lng: 73.8314 },
    airportType: "International Hub",
    terminals: "Terminal 1",
    operator: "Airports Authority of India (AAI)",
    status: "Active",
    featured: false,
    availableServiceIds: ["meet_greet", "transport"],
    meetGreetPackages: [],
    faqs: [
      ["Where does the officer meet me at Goa Airport?", "Your officer greets you at the exit gate or departure curbside holding a discrete name placard."],
    ],
    relatedAirportCodes: ["BOM", "DEL", "BLR"],
    seo: {
      title: "Goa Airport Concierge & Meet & Greet (GOI) — Shafsky Aviation",
      description: "Book VIP Meet & Greet escort and resort transfers at Goa Dabolim Airport (GOI).",
      keywords: ["goa airport meet and greet", "goi airport concierge"],
    },
  },

  // ── 15. JAIPUR (JAI) ──
  JAI: {
    code: "JAI",
    icao: "VIJP",
    name: "Jaipur International Airport",
    city: "Jaipur",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Jaipur Airport Concierge",
    heroSubtitle: "Jaipur International Airport (JAI) — VIP Escort & Airport Concierge",
    shortDescription: "Gateway to Rajasthan. Enjoy aerobridge placard greeting, luggage assistance, lounge access, and executive transfers.",
    coverImage: dekJaiAir,
    mobCoverImage: mobJaiAir,
    galleryImages: [
      dekJaiAir,
    ],
    coordinates: { lat: 26.8242, lng: 75.8122 },
    airportType: "International Hub",
    terminals: "Terminal 2",
    operator: "Adani Airports",
    status: "Active",
    featured: false,
    availableServiceIds: ["meet_greet", "transport"],
    meetGreetPackages: [],
    faqs: [
      ["Where does the officer meet me at Jaipur Airport?", "Your officer greets you at the exit gate or departure curbside holding a discrete name placard."],
    ],
    relatedAirportCodes: ["DEL", "BOM", "AMD"],
    seo: {
      title: "Jaipur Airport Concierge & Meet & Greet (JAI) — Shafsky Aviation",
      description: "Book VIP Meet & Greet escort and luxury transfers at Jaipur International Airport (JAI).",
      keywords: ["jaipur airport meet and greet", "jai airport concierge"],
    },
  },

  // ── 16. AMRITSAR (ATQ) ──
  ATQ: {
    code: "ATQ",
    icao: "VIAR",
    name: "Sri Guru Ram Dass Jee International Airport",
    city: "Amritsar",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Amritsar Airport Concierge",
    heroSubtitle: "Sri Guru Ram Dass Jee International Airport (ATQ) — Airport Concierge & Meet & Assist",
    shortDescription: "Gateway to the Golden Temple city. Enjoy dedicated airside escort, luggage assistance, and executive transfers.",
    coverImage: dekAtqAir,
    mobCoverImage: mobAtqAir,
    galleryImages: [
      dekAtqAir,
    ],
    coordinates: { lat: 31.7096, lng: 74.7973 },
    airportType: "International Hub",
    terminals: "Terminal 1",
    operator: "Airports Authority of India (AAI)",
    status: "Active",
    featured: false,
    availableServiceIds: ["meet_greet", "transport"],
    meetGreetPackages: [],
    faqs: [
      ["Where does the officer meet me at Amritsar Airport?", "Your officer greets you at the arrival exit or departure curbside holding a discrete name placard."],
    ],
    relatedAirportCodes: ["DEL", "JAI", "IXC"],
    seo: {
      title: "Amritsar Airport Concierge & Meet & Greet (ATQ) — Shafsky Aviation",
      description: "Book VIP Meet & Greet escort and luxury transfers at Sri Guru Ram Dass Jee International Airport (ATQ).",
      keywords: ["amritsar airport meet and greet", "atq airport concierge"],
    },
  },

  // ── 17. BHUBANESWAR (BBI) ──
  BBI: {
    code: "BBI",
    icao: "VEBS",
    name: "Biju Patnaik International Airport",
    city: "Bhubaneswar",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Bhubaneswar Airport Concierge",
    heroSubtitle: "Biju Patnaik International Airport (BBI) — VIP Escort & Concierge",
    shortDescription: "Gateway to Odisha. Aerobridge greeting, porter assistance, and private chauffeur handoffs.",
    coverImage: dekBbiAir,
    mobCoverImage: mobBbiAir,
    galleryImages: [dekBbiAir],
    coordinates: { lat: 20.2444, lng: 85.8178 },
    airportType: "International Hub",
    terminals: "Terminal 1 & 2",
    operator: "Airports Authority of India (AAI)",
    status: "Active",
    featured: false,
    availableServiceIds: ["meet_greet", "transport"],
    faqs: [["Is Meet & Greet available at Bhubaneswar Airport?", "Yes, aerobridge and curbside VIP escort services are active at Bhubaneswar Airport."]],
    relatedAirportCodes: ["CCU", "DEL", "HYD"],
    seo: {
      title: "Bhubaneswar Airport Concierge (BBI) — Shafsky Aviation",
      description: "Book VIP Meet & Greet escort at Biju Patnaik International Airport (BBI).",
      keywords: ["bhubaneswar airport meet and greet", "bbi airport concierge"],
    },
  },

  // ── 18. COCHIN (COK) ──
  COK: {
    code: "COK",
    icao: "VOCI",
    name: "Cochin International Airport",
    city: "Cochin",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Cochin Airport Concierge",
    heroSubtitle: "Cochin International Airport (COK) — VIP Escort & Lounge Access",
    shortDescription: "World's first solar-powered airport. Premium airside greeting, Earth lounge pass, and chauffeured transfers.",
    coverImage: dekCokAir,
    mobCoverImage: mobCokAir,
    galleryImages: [dekCokAir],
    coordinates: { lat: 10.1520, lng: 76.4019 },
    airportType: "International Hub",
    terminals: "Terminals 1 & 3",
    operator: "Cochin International Airport Limited (CIAL)",
    status: "Active",
    featured: true,
    availableServiceIds: ["meet_greet", "lounge", "transport"],
    meetGreetPackages: [],
    faqs: [["Is lounge access available at Cochin Airport?", "Yes, VIP Meet & Greet with lounge access is available at Cochin Airport (COK)."]],
    relatedAirportCodes: ["BLR", "MAA", "TRV"],
    seo: {
      title: "Cochin Airport Concierge & Meet & Greet (COK) — Shafsky Aviation",
      description: "Book VIP Meet & Greet escort and lounge sanctuary at Cochin Airport (COK).",
      keywords: ["cochin airport meet and greet", "cok lounge access"],
    },
  },

  // ── 19. GOA MOPA (GOX) ──
  GOX: {
    code: "GOX",
    icao: "VOGO",
    name: "Manohar International Airport (Mopa)",
    city: "Goa (Mopa)",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Goa Mopa Airport Concierge",
    heroSubtitle: "Manohar International Airport (GOX) — Premium VIP Escort",
    shortDescription: "North Goa's new international hub. Aerobridge greeting, priority baggage handling, and North Goa resort transfers.",
    coverImage: dekGoxAir,
    galleryImages: [dekGoxAir, mobGoxAir],
    coordinates: { lat: 15.7711, lng: 73.8644 },
    airportType: "International Hub",
    terminals: "Integrated Terminal",
    operator: "GMR Goa International Airport Limited",
    status: "Active",
    featured: false,
    availableServiceIds: ["meet_greet", "transport"],
    faqs: [["Is VIP escort available at Goa Mopa Airport?", "Yes, VIP Meet & Greet is active across North Goa Mopa Airport (GOX)."]],
    relatedAirportCodes: ["GOI", "BOM", "DEL"],
    seo: {
      title: "Goa Mopa Airport Concierge (GOX) — Shafsky Aviation",
      description: "Book VIP Meet & Greet escort at Manohar International Airport Mopa (GOX).",
      keywords: ["goa mopa airport meet and greet", "gox concierge"],
    },
  },

  // ── 20. CHANDIGARH (IXC) ──
  IXC: {
    code: "IXC",
    icao: "VICG",
    name: "Shaheed Bhagat Singh International Airport",
    city: "Chandigarh",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Chandigarh Airport Concierge",
    heroSubtitle: "Shaheed Bhagat Singh International Airport (IXC) — VIP Escort",
    shortDescription: "Tri-city gateway. Dedicated aerobridge welcoming, porter service, and luxury ground transport.",
    coverImage: dekDelAir,
    galleryImages: [dekDelAir],
    coordinates: { lat: 30.6735, lng: 76.7885 },
    airportType: "International Hub",
    terminals: "Integrated Terminal",
    operator: "Chandigarh International Airport Limited",
    status: "Active",
    featured: false,
    availableServiceIds: ["meet_greet", "transport"],
    faqs: [["Where does the officer meet me at Chandigarh Airport?", "Your officer greets you at the arrival exit or departure curbside with a placard."]],
    relatedAirportCodes: ["DEL", "ATQ"],
    seo: {
      title: "Chandigarh Airport Concierge (IXC) — Shafsky Aviation",
      description: "Book VIP Meet & Greet escort at Chandigarh Airport (IXC).",
      keywords: ["chandigarh airport meet and greet", "ixc concierge"],
    },
  },

  // ── 21. GUWAHATI (GAU) ──
  GAU: {
    code: "GAU",
    icao: "VEGT",
    name: "Lokpriya Gopinath Bordoloi International Airport",
    city: "Guwahati",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Guwahati Airport Concierge",
    heroSubtitle: "Lokpriya Gopinath Bordoloi International Airport (GAU) — VIP Escort",
    shortDescription: "Gateway to North East India. Personal escort, luggage assistance, and executive car transfers.",
    coverImage: dekGauAir,
    mobCoverImage: mobGauAir,
    galleryImages: [dekGauAir, mobGauAir],
    coordinates: { lat: 26.1061, lng: 91.5859 },
    airportType: "International Hub",
    terminals: "Terminal 1",
    operator: "Guwahati International Airport Limited (Adani)",
    status: "Active",
    featured: false,
    availableServiceIds: ["meet_greet", "transport"],
    faqs: [["Is Meet & Greet available at Guwahati Airport?", "Yes, VIP Meet & Greet escort is available at Guwahati Airport (GAU)."]],
    relatedAirportCodes: ["CCU", "DEL"],
    seo: {
      title: "Guwahati Airport Concierge (GAU) — Shafsky Aviation",
      description: "Book VIP Meet & Greet escort at Guwahati Airport (GAU).",
      keywords: ["guwahati airport meet and greet", "gau concierge"],
    },
  },

  // ── 22. MANGALURU (IXE) ──
  IXE: {
    code: "IXE",
    icao: "VOML",
    name: "Mangaluru International Airport",
    city: "Mangaluru",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Mangaluru Airport Concierge",
    heroSubtitle: "Mangaluru International Airport (IXE) — VIP Escort",
    shortDescription: "Coastal Karnataka hub. Aerobridge welcome, baggage assist, and executive car handoff.",
    coverImage: dekIxeAir,
    mobCoverImage: mobIxeAir,
    galleryImages: [dekIxeAir, mobIxeAir],
    coordinates: { lat: 12.9613, lng: 74.8901 },
    airportType: "International Hub",
    terminals: "Integrated Terminal",
    operator: "Mangaluru International Airport Limited (Adani)",
    status: "Active",
    featured: false,
    availableServiceIds: ["meet_greet", "transport"],
    faqs: [["Is Meet & Greet available at Mangaluru Airport?", "Yes, dedicated VIP escort is active at Mangaluru Airport (IXE)."]],
    relatedAirportCodes: ["BLR", "BOM"],
    seo: {
      title: "Mangaluru Airport Concierge (IXE) — Shafsky Aviation",
      description: "Book VIP Meet & Greet escort at Mangaluru Airport (IXE).",
      keywords: ["mangaluru airport meet and greet", "ixe concierge"],
    },
  },

  // ── 23. RANCHI (IXR) ──
  IXR: {
    code: "IXR",
    icao: "VERC",
    name: "Birsa Munda Airport",
    city: "Ranchi",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Ranchi Airport Concierge",
    heroSubtitle: "Birsa Munda Airport (IXR) — VIP Escort",
    shortDescription: "Jharkhand capital gateway. Dedicated guest relations escort, luggage assistance, and airport transfers.",
    coverImage: dekDelAir,
    galleryImages: [dekDelAir],
    coordinates: { lat: 23.3143, lng: 85.3219 },
    airportType: "Domestic Airport",
    terminals: "Integrated Terminal",
    operator: "Airports Authority of India (AAI)",
    status: "Active",
    featured: false,
    availableServiceIds: ["meet_greet", "transport"],
    faqs: [["Is Meet & Greet available at Ranchi Airport?", "Yes, VIP Meet & Greet escort is available at Birsa Munda Airport Ranchi (IXR)."]],
    relatedAirportCodes: ["CCU", "DEL"],
    seo: {
      title: "Ranchi Airport Concierge (IXR) — Shafsky Aviation",
      description: "Book VIP Meet & Greet escort at Ranchi Airport (IXR).",
      keywords: ["ranchi airport meet and greet", "ixr concierge"],
    },
  },

  // ── 24. THIRUVANANTHAPURAM (TRV) ──
  TRV: {
    code: "TRV",
    icao: "VOTV",
    name: "Thiruvananthapuram International Airport",
    city: "Thiruvananthapuram",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Thiruvananthapuram Airport Concierge",
    heroSubtitle: "Thiruvananthapuram International Airport (TRV) — VIP Escort & Lounge Access",
    shortDescription: "Southern Kerala international hub. Aerobridge placard welcome, lounge access, and resort transfers.",
    coverImage: dekDelAir,
    galleryImages: [dekDelAir],
    coordinates: { lat: 8.4821, lng: 76.9200 },
    airportType: "International Hub",
    terminals: "Terminals 1 & 2",
    operator: "Trivandrum International Airport Limited (Adani)",
    status: "Active",
    featured: false,
    availableServiceIds: ["meet_greet", "lounge", "transport"],
    faqs: [["Is lounge access available at TRV Airport?", "Yes, Meet & Greet with lounge access is available at Thiruvananthapuram Airport."]],
    relatedAirportCodes: ["COK", "BLR", "MAA"],
    seo: {
      title: "Thiruvananthapuram Airport Concierge (TRV) — Shafsky Aviation",
      description: "Book VIP Meet & Greet escort and lounge access at Trivandrum Airport (TRV).",
      keywords: ["trivandrum airport meet and greet", "trv lounge access"],
    },
  },

  // ── 25. VISAKHAPATNAM (VTZ) ──
  VTZ: {
    code: "VTZ",
    icao: "VOVZ",
    name: "Visakhapatnam International Airport",
    city: "Visakhapatnam",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Visakhapatnam Airport Concierge",
    heroSubtitle: "Visakhapatnam International Airport (VTZ) — VIP Escort & Executive Transfers",
    shortDescription: "Coastal Andhra Pradesh hub. Aerobridge welcome, baggage assistance, and executive chauffeur handoffs.",
    coverImage: dekVtzAir,
    mobCoverImage: mobVtzAir,
    galleryImages: [dekVtzAir, mobVtzAir],
    coordinates: { lat: 17.7211, lng: 83.2245 },
    airportType: "International Hub",
    terminals: "Integrated Terminal",
    operator: "Airports Authority of India (AAI)",
    status: "Active",
    featured: false,
    availableServiceIds: ["meet_greet", "transport"],
    faqs: [["Is Meet & Greet available at Visakhapatnam Airport?", "Yes, VIP Meet & Greet escort is available at Visakhapatnam Airport (VTZ)."]],
    relatedAirportCodes: ["HYD", "MAA", "CCU"],
    seo: {
      title: "Visakhapatnam Airport Concierge (VTZ) — Shafsky Aviation",
      description: "Book VIP Meet & Greet escort at Visakhapatnam Airport (VTZ).",
      keywords: ["visakhapatnam airport meet and greet", "vtz concierge"],
    },
  },
};

/* ═══════════════════════════════════════════════════════════════════════════════
 * REGISTRY HELPER FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════ */

export function getAirportRegistryEntry(code: string): AirportRegistryEntry {
  const upper = (code || "").toUpperCase().trim();
  if (upper && AIRPORT_REGISTRY[upper]) {
    return AIRPORT_REGISTRY[upper];
  }

  const city = upper || "Selected Airport";
  const name = city !== "Selected Airport" ? `${city} International Airport` : "Selected Airport";

  return {
    code: upper || "—",
    icao: upper ? `V${upper}` : "—",
    name: name,
    city: city,
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: `${city} Airport Concierge`,
    heroSubtitle: `${name} — Airside Escort & Airport Services`,
    shortDescription: `Premium airport concierge experience for ${city}.`,
    coverImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    ],
    coordinates: { lat: 20.5937, lng: 78.9629 },
    airportType: "International Hub",
    terminals: "Integrated Terminal",
    operator: "Airports Authority of India (AAI)",
    status: "Active",
    featured: false,
    availableServiceIds: ["meet_greet", "transport"],
    faqs: [
      [`Where does the officer meet me at ${city}?`, `Your dedicated escort officer meets you at ${name} holding a discrete name placard.`],
    ],
    relatedAirportCodes: ["DEL", "BOM", "HYD"],
    seo: {
      title: `${city} Airport Concierge & Meet & Greet — Shafsky Aviation`,
      description: `Book VIP Meet & Greet escort and concierge services at ${name}.`,
      keywords: [`${city.toLowerCase()} airport meet and greet`, `airport concierge`],
    },
  };
}

export function getAllAirportRegistryEntries(): AirportRegistryEntry[] {
  return Object.values(AIRPORT_REGISTRY);
}

export function searchAirportRegistry(query: string): AirportRegistryEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return getAllAirportRegistryEntries();

  return Object.values(AIRPORT_REGISTRY).filter((a) => {
    return (
      a.code.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q) ||
      a.availableServiceIds.some((s) => s.toLowerCase().includes(q))
    );
  });
}


/**
 * @deprecated Authoritative airport pricing is calculated by the backend API (/api/airport/calculate-price or /api/airport/services).
 */
export function getAirportBusinessPrice(
  _airportCode: string,
  _mode: "individual" | "package",
  _serviceOrPackageId: string
): number {
  return 0;
}

/**
 * Returns the canonical currency symbol for an airport.
 */
export function getAirportCurrencySymbol(_airportCode?: string): string {
  return "₹";
}
