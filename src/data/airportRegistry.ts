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
    meetGreetPackages: [
      {
        id: "silver",
        title: "Silver Escort",
        tagline: "Standard Aerobridge Escort & Buggy Transit",
        price: "₹4,500 / pax",
        duration: "Up to 2 Hours",
        features: ["Aerobridge exit welcome with placard", "Dedicated porter for up to 3 bags", "Priority queue assistance"],
      },
      {
        id: "gold",
        title: "Gold VIP Sanctuary",
        tagline: "Fast Track Immigration & Lounge Access",
        price: "₹8,500 / pax",
        isRecommended: true,
        duration: "Up to 4 Hours",
        features: ["Personal Guest Relations Officer", "Fast-track security & immigration bypass", "3-Hour VIP Lounge Sanctuary pass", "Unlimited baggage porter support"],
      },
      {
        id: "elite",
        title: "Elite Presidential",
        tagline: "Airside Maybach Tarmac & Diplomatic Gate",
        price: "₹18,000 / pax",
        duration: "Full Transit",
        features: ["Direct tarmac limousine transfer", "Private VIP lounge suite suite reservation", "Diplomatic customs clearance desk", "Curbside executive chauffeur handoff"],
      },
    ],
    faqs: [
      ["Where does the Guest Relations Officer meet me at Delhi Airport?", "Your dedicated escort officer meets you immediately upon aircraft exit at the aerobridge entrance holding a discrete name placard."],
      ["Is fast-track available for both international arrivals and departures at Delhi Airport?", "Yes, diplomatic fast-track immigration and security lane clearance is available across both arrival and departure flows at Delhi Airport."],
      ["Can I book ground chauffeur transfer directly to my New Delhi hotel?", "Absolutely. Private Mercedes-Maybach sedans and luxury SUVs are available for tarmac-to-hotel handoffs."],
    ],
    relatedAirportCodes: ["BOM", "DXB", "AMD", "BLR"],
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
    meetGreetPackages: [
      {
        id: "platinum",
        title: "Platinum Service",
        tagline: "Premium domestic arrival & departure assistance from curbside/aerobridge to gate/parking area.",
        price: "₹3,850 / pax",
        duration: "Full Escort",
        features: [
          "Welcome at the Curbside Area / End of Aerobridge",
          "Dedicated Staff with Personalized Placard",
          "Dedicated Porter Service",
          "Wheelchair Assistance (through the airline)",
          "Assistance through Separate Entry Gate / Baggage Belt",
          "Buggy Service (Sharing Basis, subject to availability)",
          "Escort to Boarding Gate / Car Parking Area",
        ],
      },
      {
        id: "elite",
        title: "Elite Service",
        tagline: "Enhanced domestic arrival & departure assistance with dedicated airport support.",
        price: "₹4,950 / pax",
        duration: "Full Escort",
        features: [
          "Welcome at the Curbside Area / End of Aerobridge",
          "Dedicated Staff with Personalized Placard",
          "Dedicated Porter Service",
          "Wheelchair Assistance (through the airline)",
          "Assistance through Separate Entry Gate / Baggage Belt",
          "Lounge Service Facility",
          "Buggy Service to Boarding Gate (subject to availability)",
          "Escort to Boarding Gate / Car Parking Area",
        ],
      },
      {
        id: "elite_plus",
        title: "Elite Plus Service",
        tagline: "Complete premium domestic departure & arrival assistance with flexible booking benefits.",
        price: "₹7,040 / pax",
        duration: "Full Escort",
        features: [
          "Welcome at the Curbside Area / End of Aerobridge",
          "Dedicated Staff with Personalized Placard",
          "Dedicated Porter Service",
          "Wheelchair Assistance (through the airline)",
          "Assistance through Separate Entry Gate / Baggage Belt",
          "Lounge Service Facility",
          "Buggy Service to Boarding Gate (subject to availability)",
          "Escort to Boarding Gate / Car Parking Area",
        ],
      },
    ],
    faqs: [
      ["Does Mumbai Airport support fast-track customs clearance?", "Yes, our Guest Relations Officers guide VIP passengers through priority diplomatic queues at Mumbai Airport (BOM)."],
    ],
    relatedAirportCodes: ["DEL", "DXB", "BLR", "HYD"],
    seo: {
      title: "Mumbai Airport Concierge & Meet & Greet (BOM) — Shafsky Aviation",
      description: "Reserve VIP Meet & Greet, fast-track customs, and Maybach chauffeur transfers at Mumbai Airport (BOM).",
      keywords: ["mumbai airport meet and greet", "mumbai lounge suite", "mumbai airport fast track"],
    },
  },

  // ── 3. DUBAI (DXB) ──
  DXB: {
    code: "DXB",
    icao: "OMDB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    timezone: "Asia/Dubai",
    heroTitle: "Dubai Airport Concierge",
    heroSubtitle: "Dubai International Airport (DXB) — Ahlan & Al Majlis VIP Services",
    shortDescription: "The world's busier international airport. Experience Al Majlis private terminal suites, luxury buggy tarmac escort, fast-track immigration, and VIP chauffeur service.",
    coverImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
    ],
    coordinates: { lat: 25.2532, lng: 55.3657 },
    airportType: "International Hub",
    terminals: "All Passenger Hubs & Al Majlis VIP Gateway",
    operator: "Dubai Airports Company",
    status: "Active",
    featured: true,
    availableServiceIds: ["meet_greet", "lounge", "fast_track", "transport"],
    meetGreetPackages: [
      {
        id: "silver",
        title: "Ahlan Standard Escort",
        tagline: "Gate Greeting & Buggy Transit",
        price: "₹15,000 / pax",
        duration: "2 Hours",
        features: ["Gate arrival greeting", "Electric buggy transfer to immigration", "Priority passport control desk"],
      },
      {
        id: "gold",
        title: "Ahlan Premium Lounge",
        tagline: "VIP Lounge Access & Priority Customs",
        price: "₹26,800 / pax",
        isRecommended: true,
        duration: "4 Hours",
        features: ["Personal concierge officer", "Electric buggy transit", "Ahlan VIP lounge buffet access", "Dedicated luggage porter"],
      },
      {
        id: "majlis",
        title: "Al Majlis Private VIP Terminal",
        tagline: "Separate VIP Terminal & Private Limousine Tarmac",
        price: "₹62,500 / pax",
        duration: "Full Transit",
        features: ["Private Al Majlis VIP terminal building", "BMW 7-Series tarmac transfer to aircraft", "In-house private customs & immigration", "Gourmet dining & luxury private suite"],
      },
    ],
    faqs: [
      ["What is the difference between Ahlan and Al Majlis at DXB?", "Ahlan operates across all passenger concourses, whereas Al Majlis is a dedicated private VIP complex with separate tarmac access."],
    ],
    relatedAirportCodes: ["DEL", "BOM", "LHR", "SIN"],
    seo: {
      title: "Dubai Airport Concierge & Al Majlis VIP Terminal (DXB) — Shafsky Aviation",
      description: "Book Ahlan Meet & Greet, Al Majlis private VIP terminal, and buggy transfers at Dubai International Airport (DXB).",
      keywords: ["dubai airport meet and greet", "al majlis dxb", "dubai airport fast track"],
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
    meetGreetPackages: [
      {
        id: "platinum",
        title: "Platinum Service",
        tagline: "Premium airport arrival assistance with baggage support and personalized meet & greet.",
        price: "₹2,420 / pax",
        isRecommended: false,
        duration: "Arrival Escort",
        features: [
          "Welcome at the Aerobridge",
          "Dedicated Staff with Personalized Placard",
          "Baggage Assistance (Up to 3 Pieces)",
          "Assistance at the Baggage Belt Area",
          "Coordination with the Receiving Party",
          "Escort to the Car Parking Area",
        ],
      },
      {
        id: "elite",
        title: "Elite Service",
        tagline: "Premium personalized airport arrival assistance with dedicated baggage support and complete arrival coordination.",
        price: "₹4,400 / pax",
        isRecommended: true,
        duration: "Full Arrival Escort",
        features: [
          "Welcome at the Aerobridge",
          "Dedicated Staff with Personalized Placard",
          "Baggage Assistance",
          "Assistance at the Baggage Belt Area",
          "Coordination with the Receiving Party",
          "Escort to the Car Parking Area",
        ],
      },
    ],
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
    meetGreetPackages: [
      {
        id: "gold",
        title: "BLR VIP Gold",
        tagline: "Aerobridge Escort & Fast Track",
        price: "₹7,500 / pax",
        isRecommended: true,
        duration: "3 Hours",
        features: ["Aerobridge exit welcome with placard", "Fast-track security clearance", "Luggage porter support"],
      },
    ],
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
      ["Is Meet & Greet available at Lucknow Airport?", "Yes, personalized aerobridge escort is active at Lucknow Airport."],
    ],
    relatedAirportCodes: ["DEL", "BOM"],
    seo: {
      title: "Lucknow Airport Concierge & Meet & Greet (LKO) — Shafsky Aviation",
      description: "Book VIP Meet & Greet and chauffeur transfers at Lucknow Airport (LKO).",
      keywords: ["lucknow airport meet and greet", "lko concierge"],
    },
  },

  // ── 8. SINGAPORE (SIN) ──
  SIN: {
    code: "SIN",
    icao: "WSSS",
    name: "Singapore Changi Airport",
    city: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    timezone: "Asia/Singapore",
    heroTitle: "Singapore Airport Concierge",
    heroSubtitle: "Singapore Changi Airport (SIN) — JetQuay VIP Gateway & Airside Escort",
    shortDescription: "Consistently rated the world's best airport. Experience JetQuay VIP CIP Terminal, canopy buggy transit, fast-track immigration, and private luxury chauffeur transfers.",
    coverImage: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
    ],
    coordinates: { lat: 1.3644, lng: 103.9915 },
    airportType: "International Hub",
    terminals: "All Passenger Hubs & JetQuay VIP Gateway",
    operator: "Changi Airport Group",
    status: "Active",
    featured: true,
    availableServiceIds: ["meet_greet", "lounge", "fast_track", "transport"],
    meetGreetPackages: [
      {
        id: "silver",
        title: "Changi Standard Escort",
        tagline: "Gate Greeting & Buggy Transit",
        price: "₹15,800 / pax",
        duration: "2 Hours",
        features: ["Gate arrival greeting with placard", "Electric buggy transit across concourse", "Express baggage belt guidance"],
      },
      {
        id: "gold",
        title: "Changi VIP Sanctuary",
        tagline: "Fast Track & Blossom VIP Lounge Access",
        price: "₹28,500 / pax",
        isRecommended: true,
        duration: "4 Hours",
        features: ["Personal Guest Relations Officer", "Electric buggy transfer", "Blossom VIP Lounge access & gourmet dining", "Dedicated porter support"],
      },
      {
        id: "jetquay",
        title: "JetQuay CIP VVIP Terminal",
        tagline: "Private Terminal Suite & Tarmac Buggy",
        price: "₹68,500 / pax",
        duration: "Full Transit",
        features: ["Private JetQuay CIP Terminal suite", "Tarmac luxury buggy / limousine transfer", "In-suite immigration & customs clearance", "Personal protocol officer & butler"],
      },
    ],
    faqs: [
      ["Where does the Guest Relations Officer meet me at Singapore Changi?", "Your escort officer greets you directly at the aircraft aerobridge exit with a discrete name placard."],
      ["Does Singapore Changi support private CIP terminal clearance?", "Yes, our JetQuay CIP Terminal package provides full private terminal check-in, customs, and private lounge suites."],
    ],
    relatedAirportCodes: ["DXB", "DEL", "BOM", "LHR"],
    seo: {
      title: "Singapore Changi Airport Concierge & VIP Escort (SIN) — Shafsky Aviation",
      description: "Book VIP Meet & Greet, JetQuay CIP terminal suites, fast-track customs, and chauffeur transfers at Singapore Changi (SIN).",
      keywords: ["singapore changi airport meet and greet", "jetquay cip terminal changi", "changi vip lounge booking"],
    },
  },

  // ── 9. LONDON HEATHROW (LHR) ──
  LHR: {
    code: "LHR",
    icao: "EGLL",
    name: "London Heathrow Airport",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    timezone: "Europe/London",
    heroTitle: "London Heathrow Airport Concierge",
    heroSubtitle: "London Heathrow Airport (LHR) — VIP Windsor Suite & Airside Escort",
    shortDescription: "Europe's premier international hub. Experience Heathrow VIP Windsor Suite access, airside buggy escort, fast-track passport clearance, and private chauffeur sedan transfers.",
    coverImage: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
    ],
    coordinates: { lat: 51.4700, lng: -0.4543 },
    airportType: "International Hub",
    terminals: "All Passenger Hubs & Airside Gates",
    operator: "Heathrow Airport Holdings",
    status: "Active",
    featured: true,
    availableServiceIds: ["meet_greet", "lounge", "fast_track", "transport"],
    meetGreetPackages: [
      {
        id: "silver",
        title: "Heathrow Standard Escort",
        tagline: "Aerobridge Greeting & Fast Track",
        price: "₹19,500 / pax",
        duration: "2 Hours",
        features: ["Aerobridge exit welcome", "Fast-track passport control queue bypass", "Porter assistance"],
      },
      {
        id: "gold",
        title: "Heathrow VIP Sanctuary",
        tagline: "Fast Track & Executive Lounge Access",
        price: "₹34,500 / pax",
        isRecommended: true,
        duration: "4 Hours",
        features: ["Personal Guest Relations Officer", "Fast-track security & border control", "Plaza Premium VIP Lounge access", "Unlimited baggage porterage"],
      },
      {
        id: "windsor",
        title: "Heathrow Windsor Suite VVIP",
        tagline: "Private Royal Suite & BMW Tarmac Transfer",
        price: "₹135,000 / pax",
        duration: "Full Transit",
        features: ["Private Heathrow Windsor Suite reservation", "Direct tarmac BMW 7-Series transfer", "Private security & customs clearance", "Personal protocol officer"],
      },
    ],
    faqs: [
      ["Where does the escort officer meet me at Heathrow?", "Your escort meets you at the aerobridge gate exit for arrivals or curbside for departures."],
    ],
    relatedAirportCodes: ["DXB", "JFK", "DEL", "SIN"],
    seo: {
      title: "London Heathrow Airport Concierge & VIP Escort (LHR) — Shafsky Aviation",
      description: "Reserve VIP Meet & Greet, Windsor Suite private terminal access, fast-track border control, and chauffeur rides at London Heathrow (LHR).",
      keywords: ["heathrow airport meet and greet", "heathrow windsor suite", "london heathrow fast track"],
    },
  },

  // ── 10. NEW YORK JFK (JFK) ──
  JFK: {
    code: "JFK",
    icao: "KJFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "United States",
    countryCode: "US",
    timezone: "America/New_York",
    heroTitle: "New York JFK Airport Concierge",
    heroSubtitle: "John F. Kennedy International Airport (JFK) — Airside Escort & VIP Lounge",
    shortDescription: "North America's premier international gateway. Experience expedited TSA PreCheck & customs escort, VIP lounge sanctuaries, and private Manhattan SUV transfers.",
    coverImage: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
    ],
    coordinates: { lat: 40.6413, lng: -73.7781 },
    airportType: "International Hub",
    terminals: "All Passenger Hubs & Airside Gates",
    operator: "Port Authority of NY & NJ",
    status: "Active",
    featured: true,
    availableServiceIds: ["meet_greet", "lounge", "fast_track", "transport"],
    meetGreetPackages: [
      {
        id: "silver",
        title: "JFK Standard Escort",
        tagline: "Gate Greeting & Baggage Porter",
        price: "₹17,500 / pax",
        duration: "2 Hours",
        features: ["Gate arrival welcome with placard", "Baggage claim porter assistance", "Curbside vehicle handoff"],
      },
      {
        id: "gold",
        title: "JFK VIP Sanctuary",
        tagline: "Fast Track TSA & Prime Lounge Access",
        price: "₹31,800 / pax",
        isRecommended: true,
        duration: "4 Hours",
        features: ["Personal Guest Relations Officer", "Expedited TSA security & customs escort", "Virgin Atlantic / Prime Lounge pass", "Unlimited porterage"],
      },
      {
        id: "presidential",
        title: "JFK Presidential VVIP",
        tagline: "Private Tarmac SUV & Helipad Handoff",
        price: "₹79,500 / pax",
        duration: "Full Transit",
        features: ["Direct tarmac Cadillac Escalade transfer", "Private VIP lounge suite access", "Personal protocol officer", "BLADE Manhattan helipad coordination"],
      },
    ],
    faqs: [
      ["Does JFK support fast-track customs escort?", "Yes, our officers escort VIP passengers through priority processing lanes across all airport concourses."],
    ],
    relatedAirportCodes: ["LHR", "DXB", "DEL", "SIN"],
    seo: {
      title: "New York JFK Airport Concierge & VIP Escort — Shafsky Aviation",
      description: "Book VIP Meet & Greet, fast-track TSA clearance, lounge passes, and luxury SUV transfers at New York JFK Airport.",
      keywords: ["jfk airport meet and greet", "jfk fast track customs", "jfk vip lounge booking"],
    },
  },

  // ── 11. PUNE (PNQ) ──
  PNQ: {
    code: "PNQ",
    icao: "VAPO",
    name: "Pune International Airport",
    city: "Pune",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    heroTitle: "Pune Airport Concierge",
    heroSubtitle: "Pune International Airport (PNQ) — VIP Airside Escort & Lounge",
    shortDescription: "IT and automotive hub gateway. Experience aerobridge escorts, Earth Lounge access, express security, and private executive chauffeur handoffs.",
    coverImage: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
    ],
    coordinates: { lat: 18.5822, lng: 73.9197 },
    airportType: "International Hub",
    terminals: "All Passenger Hubs & Airside Gates",
    operator: "Airports Authority of India (AAI)",
    status: "Active",
    featured: false,
    availableServiceIds: ["meet_greet", "lounge", "fast_track", "transport"],
    meetGreetPackages: [
      {
        id: "gold",
        title: "Pune Executive Gold",
        tagline: "Aerobridge Escort & Earth Lounge",
        price: "₹6,000 / pax",
        isRecommended: true,
        duration: "Up to 3 Hours",
        features: ["Aerobridge exit welcome with placard", "Earth Lounge access with hot dining", "Dedicated baggage porter", "Curbside chauffeur handoff"],
      },
    ],
    faqs: [
      ["Where does the officer meet me at Pune Airport?", "Your dedicated officer greets you at the aerobridge gate holding a discrete name placard."],
    ],
    relatedAirportCodes: ["BOM", "DEL", "BLR", "AMD"],
    seo: {
      title: "Pune Airport Concierge & Meet & Greet (PNQ) — Shafsky Aviation",
      description: "Book VIP Meet & Greet, Earth Lounge passes, and chauffeur transfers at Pune Airport (PNQ).",
      keywords: ["pune airport meet and greet", "pune lounge booking", "pune airport fast track"],
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
    coverImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    ],
    coordinates: { lat: 12.9941, lng: 80.1709 },
    airportType: "International Hub",
    terminals: "Terminals 1, 2, 3 & 4",
    operator: "Airports Authority of India (AAI)",
    status: "Active",
    featured: false,
    availableServiceIds: ["meet_greet", "transport"],
    faqs: [
      ["Where does the officer meet me at Chennai Airport?", "Your escort officer greets you at the aerobridge gate exit with a personalized name placard."],
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
    coverImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    ],
    coordinates: { lat: 15.3808, lng: 73.8314 },
    airportType: "International Hub",
    terminals: "Terminal 1",
    operator: "Airports Authority of India (AAI)",
    status: "Active",
    featured: false,
    availableServiceIds: ["meet_greet", "transport"],
    meetGreetPackages: [
      {
        id: "silver",
        title: "Silver Service",
        tagline: "Domestic & International departure/arrival assistance from curbside/aerobridge.",
        price: "₹2,500 / pax",
        duration: "Full Escort",
        features: [
          "Welcome at Departure Curbside / Aerobridge",
          "Dedicated Porter Service",
          "Wheelchair Assistance (through the airline)",
          "Assistance at Departure Area / Baggage Belt",
          "Assistance with Baggage Check-in",
          "Escort to Boarding Gate / Car Parking Area",
        ],
      },
      {
        id: "gold",
        title: "Gold Service",
        tagline: "Enhanced domestic departure assistance with lounge service and airport support.",
        price: "₹4,000 / pax",
        duration: "Full Escort",
        features: [
          "Welcome at Departure Curbside",
          "Dedicated Porter Service",
          "Wheelchair Assistance (through the airline)",
          "Assistance at Departure Area",
          "Assistance with Baggage Check-in",
          "Assistance inside Security Hold Area (SHA)",
          "Lounge Service Facility",
          "Escort to Boarding Gate",
        ],
      },
    ],
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
    meetGreetPackages: [
      {
        id: "platinum",
        title: "Platinum Service",
        tagline: "Premium domestic departure/arrival assistance from curbside to gate.",
        price: "₹2,420 / pax",
        duration: "Full Escort",
        features: [
          "Welcome at Curbside / Aerobridge",
          "Dedicated Porter Service",
          "Wheelchair Assistance (through the airline)",
          "Assistance at Departure Area / Baggage Belt",
          "Assistance with Baggage Check-in",
          "Escort to Boarding Gate / Car Parking Area",
        ],
      },
      {
        id: "elite",
        title: "Elite Service",
        tagline: "Complete domestic departure/arrival assistance with lounge service.",
        price: "₹4,400 / pax",
        duration: "Full Escort",
        features: [
          "Welcome at Curbside / Aerobridge",
          "Dedicated Porter Service",
          "Wheelchair Assistance (through the airline)",
          "Assistance through Separate Entry Gate",
          "Assistance at Baggage Belt Area",
          "Lounge Service Facility (Departure)",
          "Escort to Boarding Gate / Car Parking Area",
        ],
      },
    ],
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
    coverImage: dekJaiAir,
    mobCoverImage: mobJaiAir,
    galleryImages: [
      dekJaiAir,
    ],
    coordinates: { lat: 31.7096, lng: 74.7973 },
    airportType: "International Hub",
    terminals: "Terminal 1",
    operator: "Airports Authority of India (AAI)",
    status: "Active",
    featured: false,
    availableServiceIds: ["meet_greet", "transport"],
    meetGreetPackages: [
      {
        id: "meet_greet",
        title: "Meet & Assist Service",
        tagline: "Dedicated airport arrival/departure escort.",
        price: "₹2,500 / pax",
        duration: "Full Escort",
        features: [
          "Welcome Guest from Curbside / Aerobridge Area",
          "Dedicated Porter Service",
          "Wheelchair Assistance (Through Airlines)",
          "Assistance at Separate Entry Gate / Immigration",
          "Assistance in Security Hold / Baggage Area",
          "Escort to Boarding Gate / Parking Area",
        ],
      },
    ],
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
    coverImage: dekDelAir,
    galleryImages: [dekDelAir],
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
    coverImage: dekDelAir,
    galleryImages: [dekDelAir],
    coordinates: { lat: 10.1520, lng: 76.4019 },
    airportType: "International Hub",
    terminals: "Terminals 1 & 3",
    operator: "Cochin International Airport Limited (CIAL)",
    status: "Active",
    featured: true,
    availableServiceIds: ["meet_greet", "lounge", "transport"],
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
    coverImage: dekDelAir,
    galleryImages: [dekDelAir],
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
    faqs: [["Where does the officer meet me at Chandigarh Airport?", "Your officer greets you at the arrival exit or departure curbside with a personalized placard."]],
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
    coverImage: dekDelAir,
    galleryImages: [dekDelAir],
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
    shortDescription: "Coastal Karnataka hub. Personalized aerobridge welcome, baggage assistance, and executive car handoff.",
    coverImage: dekDelAir,
    galleryImages: [dekDelAir],
    coordinates: { lat: 12.9613, lng: 74.8901 },
    airportType: "International Hub",
    terminals: "Integrated Terminal",
    operator: "Mangaluru International Airport Limited (Adani)",
    status: "Active",
    featured: false,
    availableServiceIds: ["meet_greet", "transport"],
    faqs: [["Is Meet & Greet available at Mangaluru Airport?", "Yes, personalized VIP escort is active at Mangaluru Airport (IXE)."]],
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
    coverImage: dekDelAir,
    galleryImages: [dekDelAir],
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

import { getAirportServices } from "./airports";

/**
 * Single Source of Truth for Airport Concierge & VIP Package Pricing.
 * Resolves pricing directly from AIRPORT_REGISTRY and getAirportServices.
 */
export function getAirportBusinessPrice(
  airportCode: string,
  mode: "individual" | "package",
  serviceOrPackageId: string
): number {
  const registryEntry = getAirportRegistryEntry(airportCode);

  if (mode === "package") {
    const pkgId = (serviceOrPackageId || "").toLowerCase();
    const pkgs = registryEntry?.meetGreetPackages || [
      { id: "silver", title: "Silver Concierge", price: "₹4,500 / pax", tagline: "", duration: "", features: [] },
      { id: "gold", title: "Gold VIP Sanctuary", price: "₹8,500 / pax", tagline: "", duration: "", features: [] },
      { id: "elite", title: "Elite Presidential", price: "₹18,000 / pax", tagline: "", duration: "", features: [] },
    ];

    const match = pkgs.find(
      (p) =>
        p.id.toLowerCase() === pkgId ||
        pkgId.includes(p.id.toLowerCase()) ||
        p.id.toLowerCase().includes(pkgId)
    );

    if (match && match.price) {
      const numMatch = match.price.match(/\d[\d,.]*/);
      if (numMatch) {
        return parseFloat(numMatch[0].replace(/,/g, ""));
      }
    }

    if (pkgId.includes("silver")) return 4500;
    if (pkgId.includes("gold")) return 8500;
    if (pkgId.includes("elite") || pkgId.includes("platinum") || pkgId.includes("majlis")) return 18000;
    return 8500;
  }

  // Individual Service Mode
  const svcId = (serviceOrPackageId || "").toLowerCase();
  const availableServices = getAirportServices(airportCode);
  const foundSvc = availableServices.find(
    (s) => s.id.toLowerCase() === svcId || svcId.includes(s.id.toLowerCase())
  );
  if (foundSvc && typeof foundSvc.price === "number") {
    return foundSvc.price;
  }

  if (svcId.includes("lounge")) return 4500;
  if (svcId.includes("fast_track")) return 3200;
  if (svcId.includes("transport") || svcId.includes("transfer")) return 3500;

  return 5000;
}

/**
 * Returns the canonical currency symbol for an airport.
 */
export function getAirportCurrencySymbol(_airportCode?: string): string {
  return "₹";
}
