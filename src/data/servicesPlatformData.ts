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

export type ServiceCategoryId =
  | "all"
  | "airport_assistance"
  | "ground_transport"
  | "private_aviation"
  | "cargo_logistics"
  | "medical_assistance"
  | "travel_support";

export interface ServiceCategoryDef {
  id: ServiceCategoryId;
  name: string;
  shortName: string;
  icon: LucideIcon;
  description: string;
}

export interface PlatformService {
  id: string;
  name: string;
  categoryId: ServiceCategoryId;
  categoryName: string;
  icon: LucideIcon;
  oneLiner: string;
  estTime: string;
  startingPrice: string;
  badge?: string;
  bookingServiceId: string; // Maps to existing engine booking ID (meet_greet, lounge, fast_track, transport, etc.)
  overview: string;
  includedFeatures: string[];
  whoIsThisFor: string;
  requirements: string[];
}

export const SERVICE_CATEGORIES: ServiceCategoryDef[] = [
  {
    id: "all",
    name: "All Services",
    shortName: "All",
    icon: Sparkles,
    description: "Explore all 28 luxury airport, ground, charter & travel assistance services.",
  },
  {
    id: "airport_assistance",
    name: "Airport Assistance",
    shortName: "Airport",
    icon: Crown,
    description: "Personal hosts, priority lanes, lounges & smooth terminal escort.",
  },
  {
    id: "ground_transport",
    name: "Ground Transport",
    shortName: "Transport",
    icon: Car,
    description: "Chauffeured luxury cars, executive vans & tarmac pickups.",
  },
  {
    id: "private_aviation",
    name: "Private Aviation",
    shortName: "Charter",
    icon: Plane,
    description: "On-demand private jets, empty legs & helicopter transfers.",
  },
  {
    id: "cargo_logistics",
    name: "Cargo & Logistics",
    shortName: "Cargo",
    icon: Package,
    description: "Urgent air freight, customs support & white-glove baggage care.",
  },
  {
    id: "medical_assistance",
    name: "Medical Assistance",
    shortName: "Medical",
    icon: HeartPulse,
    description: "Airport medical teams, oxygen support & ICU medevac.",
  },
  {
    id: "travel_support",
    name: "Travel Support",
    shortName: "Travel",
    icon: Compass,
    description: "Visa assistance, curated hotel stays & airport concierge.",
  },
];

export const PLATFORM_SERVICES: PlatformService[] = [
  // ── 1. AIRPORT ASSISTANCE ──
  {
    id: "meet_greet",
    name: "Meet & Greet",
    categoryId: "airport_assistance",
    categoryName: "Airport Assistance",
    icon: Users,
    oneLiner: "Our staff welcomes you inside the airport and assists you until your destination.",
    estTime: "30 sec booking",
    startingPrice: "Starting ₹2,499",
    badge: "Most Popular",
    bookingServiceId: "meet_greet",
    overview:
      "A dedicated personal host meets you right at the aircraft gate or curbside, carries your luggage, and guides you through security and immigration without waiting.",
    includedFeatures: [
      "Aerobridge welcome with personalized name sign",
      "Dedicated porter for all checked & hand luggage",
      "Priority fast-track through immigration & security",
      "Escort to your lounge, connecting gate, or luxury vehicle",
    ],
    whoIsThisFor: "First-time travelers, families, senior citizens, business executives & VIPs.",
    requirements: ["Flight Number", "Travel Date", "Passenger Count"],
  },
  {
    id: "fast_track",
    name: "Fast Track",
    categoryId: "airport_assistance",
    categoryName: "Airport Assistance",
    icon: Ticket,
    oneLiner: "Bypass long lines at security and passport control counters.",
    estTime: "1 min booking",
    startingPrice: "Starting ₹1,899",
    badge: "Express",
    bookingServiceId: "fast_track",
    overview:
      "Skip standard airport queues using priority diplomatic lanes at passport control, security checks, and custom counters for a stress-free transition.",
    includedFeatures: [
      "Priority diplomatic lane clearance",
      "Expedited immigration counter processing",
      "Dedicated airport security screening lane",
      "Fast-track assistance for both arrivals & departures",
    ],
    whoIsThisFor: "Busy travelers, tight flight connections & frequent flyers.",
    requirements: ["Flight Number", "Passport Name", "Travel Date"],
  },
  {
    id: "vip_lounge",
    name: "VIP Lounge Access",
    categoryId: "airport_assistance",
    categoryName: "Airport Assistance",
    icon: Hotel,
    oneLiner: "Relax in quiet private suites with hot food, drinks, and fast Wi-Fi.",
    estTime: "1 min booking",
    startingPrice: "Starting ₹1,999",
    bookingServiceId: "lounge",
    overview:
      "Escape noisy public terminals in premium lounge sanctuaries equipped with hot buffets, private sleeping pods, high-speed internet, and fresh shower facilities.",
    includedFeatures: [
      "Unlimited premium food buffet & beverages",
      "Private resting zones & quiet workspaces",
      "High-speed Wi-Fi & device charging stations",
      "Clean shower suites with luxury toiletries",
    ],
    whoIsThisFor: "Transit passengers, remote workers, & travelers seeking comfort before departure.",
    requirements: ["Terminal Name", "Travel Date", "Guest Count"],
  },
  {
    id: "wheelchair_assistance",
    name: "Wheelchair Assistance",
    categoryId: "airport_assistance",
    categoryName: "Airport Assistance",
    icon: Stethoscope,
    oneLiner: "Dedicated attendant and comfortable wheelchair escort through the entire airport.",
    estTime: "1 min booking",
    startingPrice: "Starting ₹1,499",
    bookingServiceId: "meet_greet",
    overview:
      "Trained mobility attendants provide smooth, comfortable wheelchair assistance from your vehicle entry point directly to your aircraft seat.",
    includedFeatures: [
      "Personal mobility assistant dedicated throughout your stay",
      "Seamless door-to-seat transfer support",
      "Ambulift and ramp assistance for stairless boarding",
      "Priority elevator and gate access",
    ],
    whoIsThisFor: "Senior citizens, injured passengers, and travelers requiring mobility support.",
    requirements: ["Mobility Details", "Flight Number", "Travel Date"],
  },
  {
    id: "porter_service",
    name: "Porter Service",
    categoryId: "airport_assistance",
    categoryName: "Airport Assistance",
    icon: Luggage,
    oneLiner: "Professional luggage handlers carry your bags from car to check-in counter.",
    estTime: "45 sec booking",
    startingPrice: "Starting ₹999",
    bookingServiceId: "meet_greet",
    overview:
      "Uniformed porters handle all heavy suitcases, bags, and boxes so you walk effortlessly from your curbside drop-off to the check-in desk.",
    includedFeatures: [
      "Immediate greeting at curbside drop-off",
      "Heavy luggage loading & trolley transport",
      "Escort to airline baggage drop counters",
      "Safe handling of fragile & valuable luggage",
    ],
    whoIsThisFor: "Travelers with heavy bags, families with strollers, and group tours.",
    requirements: ["Bag Count", "Curbside Drop-off Time"],
  },
  {
    id: "baggage_assistance",
    name: "Baggage Assistance",
    categoryId: "airport_assistance",
    categoryName: "Airport Assistance",
    icon: Package,
    oneLiner: "Priority baggage claim pickup and delivery straight to your car.",
    estTime: "1 min booking",
    startingPrice: "Starting ₹1,299",
    bookingServiceId: "meet_greet",
    overview:
      "Our team collects your luggage directly off the baggage carousel and safely moves it to your waiting chauffeur vehicle.",
    includedFeatures: [
      "Carousel monitoring & immediate bag retrieval",
      "Verification of baggage tags against claim tickets",
      "Escort through customs inspection lines",
      "Loading into your destination vehicle",
    ],
    whoIsThisFor: "Arriving passengers with multiple bags or sports equipment.",
    requirements: ["Flight Number", "Baggage Claim Tag Count"],
  },

  // ── 2. GROUND TRANSPORT ──
  {
    id: "airport_transfer",
    name: "Airport Transfer",
    categoryId: "ground_transport",
    categoryName: "Ground Transport",
    icon: Car,
    oneLiner: "Reliable private pickup and drop-off between airport and your hotel or home.",
    estTime: "1 min booking",
    startingPrice: "Starting ₹1,999",
    badge: "Direct Ride",
    bookingServiceId: "transport",
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
  },
  {
    id: "luxury_sedan",
    name: "Luxury Sedan",
    categoryId: "ground_transport",
    categoryName: "Ground Transport",
    icon: Crown,
    oneLiner: "Executive Mercedes-Benz, BMW, or Audi sedans with professional chauffeurs.",
    estTime: "1 min booking",
    startingPrice: "Starting ₹4,999",
    bookingServiceId: "transport",
    overview:
      "Travel in executive comfort in top-tier luxury sedans equipped with leather seating, bottled water, high-speed Wi-Fi, and climate control.",
    includedFeatures: [
      "Mercedes E-Class/S-Class or BMW 5/7 Series",
      "Professional English-speaking chauffeur",
      "In-cabin Wi-Fi, water, and charging cables",
      "Airside tarmac pickup option available",
    ],
    whoIsThisFor: "Business executives, VIP guests, and luxury seekers.",
    requirements: ["Destination Address", "Flight Details"],
  },
  {
    id: "suv_transfer",
    name: "Executive SUV",
    categoryId: "ground_transport",
    categoryName: "Ground Transport",
    icon: Truck,
    oneLiner: "Spacious luxury SUVs for extra legroom and large family luggage.",
    estTime: "1 min booking",
    startingPrice: "Starting ₹5,999",
    bookingServiceId: "transport",
    overview:
      "Premium full-size SUVs (Audi Q7, BMW X5, Toyota Vellfire) offering expansive legroom and extra luggage capacity for comfortable group travel.",
    includedFeatures: [
      "Seating for up to 6 passengers comfortably",
      "Massive luggage capacity for 6+ large suitcases",
      "All-wheel drive stability and high comfort",
      "Child safety seats available upon request",
    ],
    whoIsThisFor: "Families, small executive teams, and travelers with heavy luggage.",
    requirements: ["Passenger Count", "Luggage Volume", "Destination"],
  },
  {
    id: "executive_van",
    name: "Executive Van",
    categoryId: "ground_transport",
    categoryName: "Ground Transport",
    icon: Users,
    oneLiner: "Luxury Mercedes V-Class or Sprinter for group travel with recliner seats.",
    estTime: "1 min booking",
    startingPrice: "Starting ₹7,999",
    bookingServiceId: "transport",
    overview:
      "Ultra-luxurious van charter featuring captain recliners, privacy screens, conference seating, and ample room for delegational travel.",
    includedFeatures: [
      "Captain recliners with leg rests & massage options",
      "Privacy partition glass and ambient lighting",
      "Large cargo area for high luggage counts",
      "Dedicated chauffeur for multi-stop charters",
    ],
    whoIsThisFor: "Delegations, corporate groups, large families, and wedding parties.",
    requirements: ["Group Size", "Itinerary"],
  },
  {
    id: "chauffeur_service",
    name: "Chauffeur Service",
    categoryId: "ground_transport",
    categoryName: "Ground Transport",
    icon: Award,
    oneLiner: "Dedicated private driver available on hourly or full-day charter.",
    estTime: "1 min booking",
    startingPrice: "Starting ₹3,499",
    bookingServiceId: "transport",
    overview:
      "Hire an elite personal chauffeur for your entire stay. Perfect for multiple business meetings, city tours, and flexible airport schedules.",
    includedFeatures: [
      "Hourly or 12/24-hour full-day chauffeur availability",
      "Unlimited city stops within package radius",
      "Vetted, security-cleared chauffeurs",
      "Flexible schedule adjustments on demand",
    ],
    whoIsThisFor: "Executives with back-to-back city meetings or VIP itineraries.",
    requirements: ["Hours Needed", "City Location"],
  },

  // ── 3. PRIVATE AVIATION ──
  {
    id: "private_charter",
    name: "Private Charter",
    categoryId: "private_aviation",
    categoryName: "Private Aviation",
    icon: Plane,
    oneLiner: "Fly on your own schedule with custom flight routes and zero public lines.",
    estTime: "2 min inquiry",
    startingPrice: "On Request",
    badge: "VVIP Charter",
    bookingServiceId: "charter",
    overview:
      "Charter private aircraft tailored to your exact departure times, destination cities, and privacy requirements with private FBO terminal access.",
    includedFeatures: [
      "Access to private FBO terminal lounges",
      "Custom flight schedules & direct point-to-point routes",
      "Bespoke inflight gourmet dining & beverages",
      "Zero public security queues or public waiting",
    ],
    whoIsThisFor: "High-net-worth individuals, CEOs, celebrities, and VIP delegations.",
    requirements: ["Origin & Destination", "Travel Date", "Passenger Count"],
  },
  {
    id: "empty_leg",
    name: "Empty Leg Charter",
    categoryId: "private_aviation",
    categoryName: "Private Aviation",
    icon: Sparkles,
    oneLiner: "Enjoy private jet luxury at up to 75% off standard charter prices.",
    estTime: "1 min booking",
    startingPrice: "Starting ₹1,50,000",
    badge: "75% Off",
    bookingServiceId: "charter",
    overview:
      "Book repositioning private jet flights flying one-way routes at significantly reduced rates while enjoying full private cabin amenities.",
    includedFeatures: [
      "Up to 75% savings compared to standard private charters",
      "Full private jet cabin experience & amenities",
      "Fast-track FBO terminal departure & arrival",
      "Guaranteed luxury aircraft comfort",
    ],
    whoIsThisFor: "Flexible travelers wanting private jet luxury at accessible rates.",
    requirements: ["Preferred Route", "Date Range Flexibility"],
  },
  {
    id: "helicopter_charter",
    name: "Helicopter Charter",
    categoryId: "private_aviation",
    categoryName: "Private Aviation",
    icon: PlaneTakeoff,
    oneLiner: "Fast point-to-point heli transfers bypassing city traffic.",
    estTime: "1 min booking",
    startingPrice: "Starting ₹65,000",
    bookingServiceId: "charter",
    overview:
      "Skip highway congestion with twin-engine helicopter flights between airport helipads, city rooftops, and remote resort locations.",
    includedFeatures: [
      "Direct airport-to-city or resort transfer flights",
      "Twin-engine safety-certified helicopters",
      "Bypass 2-3 hours of highway traffic in 15 minutes",
      "Scenic aerial views with noise-canceling headsets",
    ],
    whoIsThisFor: "Urgent business transfers, luxury resort travel, and wedding entries.",
    requirements: ["Passenger Count", "Helipad Location"],
  },
  {
    id: "business_jet",
    name: "Business Jet Charter",
    categoryId: "private_aviation",
    categoryName: "Private Aviation",
    icon: Crown,
    oneLiner: "Long-range heavy jets with bedrooms, boardrooms, and global range.",
    estTime: "2 min inquiry",
    startingPrice: "On Request",
    bookingServiceId: "charter",
    overview:
      "Gulfstream G650, Bombardier Global, and Falcon business jets featuring private bedrooms, satellite Wi-Fi, conference tables, and 12+ hour non-stop range.",
    includedFeatures: [
      "Non-stop intercontinental flight range",
      "Private bedroom & ensuite lavatory options",
      "High-speed satellite Ka-band internet & inflight office",
      "Flight attendant service & Michelin-starred catering",
    ],
    whoIsThisFor: "Intercontinental travelers, corporate boards, and diplomatic delegations.",
    requirements: ["Flight Route", "Passenger Count"],
  },

  // ── 4. CARGO & LOGISTICS ──
  {
    id: "air_cargo",
    name: "Air Cargo",
    categoryId: "cargo_logistics",
    categoryName: "Cargo & Logistics",
    icon: Package,
    oneLiner: "Express commercial air freight for valuable, fragile, or heavy shipments.",
    estTime: "1 min inquiry",
    startingPrice: "Starting ₹4,999",
    bookingServiceId: "porter",
    overview:
      "Comprehensive air freight solutions with priority airline cargo space allocation, temperature tracking, and door-to-door delivery.",
    includedFeatures: [
      "Priority cargo space allocation on commercial & freighter flights",
      "End-to-end real-time GPS shipment tracking",
      "Specialized packaging for fragile & high-value goods",
      "Airport cargo terminal handling & pickup",
    ],
    whoIsThisFor: "Businesses, art collectors, and high-value cargo shippers.",
    requirements: ["Cargo Weight & Volume", "Origin & Destination"],
  },
  {
    id: "urgent_cargo",
    name: "Urgent Cargo",
    categoryId: "cargo_logistics",
    categoryName: "Cargo & Logistics",
    icon: Clock,
    oneLiner: "Same-day onboard courier delivering mission-critical items by hand.",
    estTime: "1 min inquiry",
    startingPrice: "Starting ₹9,999",
    badge: "Same-Day",
    bookingServiceId: "porter",
    overview:
      "An onboard courier personally hand-carries your urgent documents, spare parts, or medical samples on the next available commercial flight.",
    includedFeatures: [
      "Hand-carried onboard courier service",
      "First-available flight booking & immediate dispatch",
      "Zero cargo terminal delays — baggage desk handoff",
      "Direct recipient hand-delivery proof",
    ],
    whoIsThisFor: "Critical document handoffs, urgent medical samples, & prototype parts.",
    requirements: ["Package Weight", "Pickup & Delivery Location"],
  },
  {
    id: "customs_support",
    name: "Customs Support",
    categoryId: "cargo_logistics",
    categoryName: "Cargo & Logistics",
    icon: ShieldCheck,
    oneLiner: "Faster customs duty clearance and paperwork management for imports.",
    estTime: "1 min inquiry",
    startingPrice: "Starting ₹3,499",
    bookingServiceId: "porter",
    overview:
      "Experienced airport customs brokers clear duty paperwork, carnets, and import/export declarations rapidly to prevent warehouse delays.",
    includedFeatures: [
      "Pre-arrival document verification & duty filing",
      "Liaison with airport customs officers",
      "Temporary import ATA Carnet management",
      "Warehousing and release clearance coordination",
    ],
    whoIsThisFor: "Exporters, trade show exhibitors, and luxury goods importers.",
    requirements: ["Customs Documentation", "Air Waybill Number"],
  },
  {
    id: "freight_handling",
    name: "Freight Handling",
    categoryId: "cargo_logistics",
    categoryName: "Cargo & Logistics",
    icon: Truck,
    oneLiner: "White-glove loading, unloading, and warehouse airport logistics.",
    estTime: "1 min inquiry",
    startingPrice: "Starting ₹2,999",
    bookingServiceId: "porter",
    overview:
      "Ground logistics team equipped with forklifts, pallets, and climate trucks for safe airport freight transfers.",
    includedFeatures: [
      "Palletized freight loading & forklift operations",
      "Climate-controlled airport transit trucks",
      "Bonded warehouse storage assistance",
      "Complete inventory verification reporting",
    ],
    whoIsThisFor: "Logistics companies, event organizers, and heavy equipment shippers.",
    requirements: ["Freight Specifications", "Airport Terminal"],
  },

  // ── 5. MEDICAL ASSISTANCE ──
  {
    id: "medical_escort",
    name: "Medical Escort",
    categoryId: "medical_assistance",
    categoryName: "Medical Assistance",
    icon: Stethoscope,
    oneLiner: "Registered nurse or doctor accompanies patient on commercial flights.",
    estTime: "2 min booking",
    startingPrice: "Starting ₹14,999",
    badge: "Clinical Care",
    bookingServiceId: "wheelchair",
    overview:
      "A qualified flight nurse or physician accompanies your patient throughout commercial transit with portable medical monitoring equipment and medication support.",
    includedFeatures: [
      "Licensed medical professional assigned for entire flight",
      "Portable vitals monitoring & oxygen administration",
      "Pre-flight medical clearance (MEDIF) documentation",
      "Bed-to-bed coordination with hospital teams",
    ],
    whoIsThisFor: "Elderly patients, post-surgery travelers, and stable medical transfers.",
    requirements: ["Patient Medical Summary", "Flight Route"],
  },
  {
    id: "airport_medical_team",
    name: "Airport Medical Team",
    categoryId: "medical_assistance",
    categoryName: "Medical Assistance",
    icon: HeartPulse,
    oneLiner: "Immediate paramedic response and airport clinic coordination on site.",
    estTime: "1 min booking",
    startingPrice: "Starting ₹2,499",
    bookingServiceId: "wheelchair",
    overview:
      "On-site airport paramedic team ready at aircraft gate exit with emergency vitals support, stretcher transport, and clinic transfers.",
    includedFeatures: [
      "Gate-side paramedic meeting with emergency kit",
      "Stretcher and wheelchair tarmac escort",
      "Direct coordination with airport doctor & clinic",
      "Priority ramp ambulance dispatch if required",
    ],
    whoIsThisFor: "Passengers experiencing sudden illness or requiring ramp medical reception.",
    requirements: ["Flight Arrival Details", "Patient Condition"],
  },
  {
    id: "wheelchair_medical",
    name: "Wheelchair Medical Support",
    categoryId: "medical_assistance",
    categoryName: "Medical Assistance",
    icon: Stethoscope,
    oneLiner: "Specialized reclining wheelchair and trained paramedic escort.",
    estTime: "1 min booking",
    startingPrice: "Starting ₹3,499",
    bookingServiceId: "wheelchair",
    overview:
      "Orthopedic reclining wheelchairs with trained paramedic assistance for patients unable to sit upright during long terminal transit.",
    includedFeatures: [
      "Reclining orthopedic wheelchair equipment",
      "Paramedic assistant for vitals checks & comfort",
      "Priority elevator, ramp & ambulift transfer",
      "Direct handoff to hospital ambulance vehicle",
    ],
    whoIsThisFor: "Spinal injury recovery, orthopedic patients, and frail seniors.",
    requirements: ["Patient Mobility Level", "Flight Details"],
  },
  {
    id: "oxygen_support",
    name: "Oxygen Support",
    categoryId: "medical_assistance",
    categoryName: "Medical Assistance",
    icon: Sparkles,
    oneLiner: "Approved aviation oxygen cylinders provided inside the airport terminal.",
    estTime: "1 min booking",
    startingPrice: "Starting ₹4,999",
    bookingServiceId: "wheelchair",
    overview:
      "IATA-approved supplemental medical oxygen cylinders and portable concentrators delivered for terminal transit and boarding.",
    includedFeatures: [
      "Aviation-certified medical oxygen supply",
      "Pulse oximeter monitoring by medical attendant",
      "Airline inflight oxygen clearance coordination",
      "Seamless replacement at layover points",
    ],
    whoIsThisFor: "Patients with respiratory conditions or high-altitude oxygen needs.",
    requirements: ["Oxygen Flow Rate (LPM)", "Doctor Certificate"],
  },
  {
    id: "ambulance_coordination",
    name: "Ambulance Coordination",
    categoryId: "medical_assistance",
    categoryName: "Medical Assistance",
    icon: Car,
    oneLiner: "Advanced life support (ALS) ground ambulance waiting directly at tarmac step.",
    estTime: "1 min booking",
    startingPrice: "Starting ₹8,999",
    badge: "Ramp Access",
    bookingServiceId: "wheelchair",
    overview:
      "Airside-permitted ALS/BLS ground ambulance positioned at the aircraft stairs for direct patient transfer to destination hospitals.",
    includedFeatures: [
      "Advanced Life Support (ALS) equipped ambulance",
      "Permitted direct airside tarmac access",
      "Emergency doctor and paramedic crew on board",
      "Green corridor city transit liaison",
    ],
    whoIsThisFor: "Critical patient transfers requiring immediate hospital admission.",
    requirements: ["Destination Hospital", "Medical Status"],
  },

  // ── 6. TRAVEL SUPPORT ──
  {
    id: "visa_assistance",
    name: "Visa Assistance",
    categoryId: "travel_support",
    categoryName: "Travel Support",
    icon: FileCheck,
    oneLiner: "Fast-track visa processing, document review, and embassy appointment scheduling.",
    estTime: "1 min booking",
    startingPrice: "Starting ₹2,999",
    badge: "Express Visa",
    bookingServiceId: "visa",
    overview:
      "Expert visa concierge team handles document auditing, photo specs, embassy appointment booking, and express visa processing.",
    includedFeatures: [
      "Document pre-audit to eliminate rejection risks",
      "Doorstep biometric collection coordination",
      "Priority embassy & VFS appointment booking",
      "Real-time passport tracking updates",
    ],
    whoIsThisFor: "Business travelers, tourists, & international conference delegates.",
    requirements: ["Destination Country", "Travel Date"],
  },
  {
    id: "hotel_booking",
    name: "Hotel Booking",
    categoryId: "travel_support",
    categoryName: "Travel Support",
    icon: Hotel,
    oneLiner: "Curated 5-star airport and luxury city hotel reservations with VIP perks.",
    estTime: "1 min booking",
    startingPrice: "Starting ₹6,999",
    bookingServiceId: "hotel",
    overview:
      "Handpicked luxury hotel stays with guaranteed early check-in, late check-out, room upgrades, and direct airport shuttle liaison.",
    includedFeatures: [
      "Handpicked 5-star & airport precinct hotels",
      "Guaranteed early check-in & late check-out privileges",
      "Complimentary room upgrade upon availability",
      "Direct driver handoff from terminal to reception",
    ],
    whoIsThisFor: "Transit travelers, corporate guests, and luxury vacationers.",
    requirements: ["Check-in Date", "Guest Count", "Location"],
  },
  {
    id: "airport_concierge",
    name: "Airport Concierge",
    categoryId: "travel_support",
    categoryName: "Travel Support",
    icon: Compass,
    oneLiner: "Personal travel desk arranging flight rebookings, currency, and tax refunds.",
    estTime: "1 min booking",
    startingPrice: "Starting ₹1,999",
    bookingServiceId: "meet_greet",
    overview:
      "Your dedicated on-ground assistant handling VAT tax refund processing, local SIM cards, currency exchange, and emergency flight rebookings.",
    includedFeatures: [
      "VAT/Tax refund line fast-track support",
      "Emergency flight rebooking & seat upgrades",
      "Local SIM card & mobile data setup",
      "Duty-free personal shopping escort",
    ],
    whoIsThisFor: "International shoppers, business travelers, & international arrivals.",
    requirements: ["Service Needs", "Terminal Location"],
  },
  {
    id: "travel_documentation",
    name: "Travel Documentation",
    categoryId: "travel_support",
    categoryName: "Travel Support",
    icon: Briefcase,
    oneLiner: "Pre-flight check of health forms, transit permits, and passport validity.",
    estTime: "45 sec booking",
    startingPrice: "Starting ₹999",
    bookingServiceId: "meet_greet",
    overview:
      "Comprehensive digital audit of all mandatory travel documents, health declarations, transit visas, and passport validity rules before departure.",
    includedFeatures: [
      "Complete pre-flight document verification check",
      "Destination immigration entry rule confirmation",
      "Customs declaration form pre-filling",
      "Digital document backup vault creation",
    ],
    whoIsThisFor: "Multi-country transit travelers and international first-timers.",
    requirements: ["Destination Countries", "Passport Nationality"],
  },
];
