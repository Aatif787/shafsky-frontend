// Premium destination dataset for Shafsky Aviation Airport Explorer.
// Images sourced from Unsplash featured (stable redirect) — keyed by landmark queries.

import chaarminar from "@/assets/chaarminar.jpg";
import golkunda from "@/assets/golkunda.jpg";
import imambada from "@/assets/imambada.jpg";
import indiagate from "@/assets/indiagate.png";
import redfort from "@/assets/redfort.png";
import clouds from "@/assets/clouds.jpg";
import interior from "@/assets/interior.jpg";
import jetTarmac from "@/assets/jet-tarmac.jpg";
import lounge from "@/assets/lounge.png";
import hotel from "@/assets/hotel.png";
import cargo from "@/assets/cargo.jpg";
import medical from "@/assets/medical.jpg";
import world from "@/assets/world.png";
import vipConcierge from "@/assets/vip-concierge.png";
import vipTransport1 from "@/assets/vip-transport-1.png";
import vipTransport2 from "@/assets/vip-transport-2.png";
import vipTransport3 from "@/assets/vip-transport-3.png";
import vipTransport4 from "@/assets/vip-transport-4.png";
import vipTransport5 from "@/assets/vip-transport-5.png";

// Airport custom desktop & mobile images provided by user
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
import dekAtqAir from "@/assets/airports/atq/Dek-Atq-air.png";
import mobAtqAir from "@/assets/airports/atq/Mob-Atq-air.png";
import dekGauAir from "@/assets/airports/gau/Dek-Gau-air.jpg";
import mobGauAir from "@/assets/airports/gau/Mob-Gau-air.jpg";
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

import { AIRPORT_REGISTRY, getAirportRegistryEntry } from "./airportRegistry";

export type Facility = { name: string; status: "live" | "24x7" | "limited" };
export type Attraction = {
  name: string;
  img: string;
  desc: string;
  distance: string;
  travel: string;
  hours: string;
  fee: string;
  photo: string;
  maps: string;
};
export type Hotel = { name: string; stars: number; distance: string; price: string; img: string };
export type Transport = { mode: string; fare: string; time: string; availability: string };
export type Experience = { kind: string; title: string; img: string; note: string };

export type Airport = {
  code: string; // IATA
  icao: string;
  city: string;
  country: string;
  countryCode: string; // ISO-2 for flag
  landmark: string;
  tagline: string;
  timezone: string; // IANA
  cover: string;
  mobCover?: string;
  slideshow: string[];
  gallery: string[];
  videoId: string; // YouTube id
  about: string;
  bestTime: string;
  languages: string;
  currency: string;
  business: string;
  tourism: string;
  climate: string;
  safety: string;
  emergency: string;
  visa: string;
  airport: {
    name: string;
    elevation: string;
    runways: string;
    operator: string;
    type: string;
    domestic: string;
    intl: string;
    terminals: string;
    capacity: string;
    annual: string;
    cargo: string;
    website: string;
    contact: string;
  };
  attractions: Attraction[];
  facilities: Facility[];
  weather: {
    temp: string;
    humidity: string;
    visibility: string;
    wind: string;
    aqi: string;
    sunrise: string;
    sunset: string;
    flying: string;
  };
  transport: Transport[];
  hotels: Hotel[];
  experiences: Experience[];
  faqs: [string, string][];
  related: string[]; // codes
};

const PHOTO_MAP: Record<string, string> = {
  // Lucknow
  "rumi darwaza lucknow": imambada,
  "rumi darwaza": imambada,
  "bara imambara": imambada,
  "bada imam bada": imambada,
  imambada: imambada,
  "lucknow clock tower": "photo-1508849789987-4e5333c12b78",
  "clock tower": "photo-1508849789987-4e5333c12b78",
  "lucknow airport": "photo-1436491865332-7a61a109cc05",
  "chota imambara": "photo-1605649487212-47bdab064df7",
  lucknow: "photo-1596176530529-78163a4f7af2",
  // Delhi
  "india gate": indiagate,
  "red fort": redfort,
  "qutub minar": "photo-1585135497273-1a86b09fe70e",
  "lotus temple": "photo-1595841696660-1e5f8f8ed97d",
  delhi: "photo-1587474260584-136574528ed5",
  // Mumbai
  "gateway of india": "photo-1566552881560-0be862a7c445",
  "marine drive": "photo-1570168007204-dfb528c6958f",
  mumbai: "photo-1566552881560-0be862a7c445",
  // Hyderabad
  "charminar hyderabad": "photo-1572445271230-a78b5944a659",
  charminar: "photo-1572445271230-a78b5944a659",
  hyderabad: "photo-1616422285623-13ff0162193c",
  hydrabad: "photo-1572445271230-a78b5944a659",
  "golconda fort": "photo-1603262110263-fb0112e7cc33",
  // Jaipur
  "hawa mahal": "photo-1599661046289-e31897846e41",
  "amber fort": "photo-1603262110263-fb0112e7cc33",
  jaipur: "photo-1599661046289-e31897846e41",
  // Amritsar
  "golden temple": "photo-1514222134-b57cbb8ce073",
  amritsar: "photo-1514222134-b57cbb8ce073",
  // Ahmedabad
  "adalaj stepwell": "photo-1603262110263-fb0112e7cc33",
  ahmedabad: "photo-1603262110263-fb0112e7cc33",
  // Goa
  "goa beach": "photo-1512343879784-a960bf40e7f2",
  goa: "photo-1512343879784-a960bf40e7f2",
  // Kolkata
  "howrah bridge": "photo-1558431382-27e303142255",
  "victoria memorial": "photo-1602737637829-9e8c07621c5b",
  kolkata: "photo-1558431382-27e303142255",
  // Chennai
  "marina beach": "photo-1582510003544-4d00b7f74220",
  chennai: "photo-1582510003544-4d00b7f74220",
  // Bengaluru
  "vidhana soudha": "photo-1596176530529-78163a4f7af2",
  bengaluru: "photo-1596176530529-78163a4f7af2",
  bangalore: "photo-1596176530529-78163a4f7af2",
  // Kochi
  "chinese fishing nets kochi": "photo-1560179707-f14e90ef3623",
  "chinese fishing nets": "photo-1560179707-f14e90ef3623",
  "fort kochi": "photo-1542856391-010fb87dcfed",
  "kerala backwaters": "photo-1542856391-010fb87dcfed",
  kochi: "photo-1560179707-f14e90ef3623",
  cochin: "photo-1560179707-f14e90ef3623",
  // Thiruvananthapuram / Trivandrum
  thiruvananthapuram: "photo-1602216056096-3b40cc0c9944",
  trivandrum: "photo-1602216056096-3b40cc0c9944",
  padmanabhaswamy: "photo-1602216056096-3b40cc0c9944",
  // Mangaluru
  mangaluru: "photo-1590523741831-ab7e8b8f9c7f",
  mangalore: "photo-1590523741831-ab7e8b8f9c7f",
  // Ranchi
  ranchi: "photo-1546182990-dffeafbe841d",
  dassam: "photo-1546182990-dffeafbe841d",
  // Pune
  pune: "photo-1609137144813-7d9921338f24",
  shaniwar: "photo-1609137144813-7d9921338f24",
  // Guwahati
  guwahati: "photo-1622396481328-9b1b78cdd9fd",
  assam: "photo-1622396481328-9b1b78cdd9fd",
  // Srinagar
  srinagar: "photo-1595815771614-ade9d652a65d",
  kashmir: "photo-1595815771614-ade9d652a65d",
  // Varanasi
  varanasi: "photo-1561361513-2d000a50f0dc",
  kashi: "photo-1561361513-2d000a50f0dc",
  // Visakhapatnam
  "rk beach visakhapatnam": "photo-1505118380757-91f5f5632de0",
  "rk beach": "photo-1505118380757-91f5f5632de0",
  visakhapatnam: "photo-1505118380757-91f5f5632de0",
  vizag: "photo-1520250497591-112f2f40a3f4",
  "vizag port": "photo-1546548970-71785318a17b",
  "araku valley": "photo-1507525428034-b723cf961d3e",
};

const LOCAL_ASSETS_LIST = [
  imambada,
  indiagate,
  redfort,
  chaarminar,
  golkunda,
  jetTarmac,
  lounge,
  interior,
  hotel,
  cargo,
  medical,
  clouds,
  vipConcierge,
  vipTransport1,
  vipTransport2,
  vipTransport3,
  vipTransport4,
  vipTransport5,
];

const getPhotoUrl = (q: string, size: string) => {
  const query = q.toLowerCase().trim();

  // Specific keyword/landmark mappings for imported local assets
  if (query.includes("charminar")) return chaarminar;
  if (query.includes("imambara") || query.includes("imambada") || query.includes("rumi darwaza")) return imambada;
  if (query.includes("india gate")) return indiagate;
  if (query.includes("red fort")) return redfort;

  // Check PHOTO_MAP keys for exact match
  let id = "";
  for (const [key, val] of Object.entries(PHOTO_MAP)) {
    if (query.includes(key)) {
      id = val;
      break;
    }
  }

  // If PHOTO_MAP matched an asset
  if (id) {
    if (!id.startsWith("photo-")) return id;
    return `https://images.unsplash.com/${id}?auto=format&fit=crop&${size}&q=95`;
  }

  // Fallback to deterministic local asset based on query string hash
  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    hash = query.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % LOCAL_ASSETS_LIST.length;
  return LOCAL_ASSETS_LIST[index];
};

const u = (q: string) => getPhotoUrl(q, "w=3840&h=2160");
const us = (q: string) => getPhotoUrl(q, "w=1920&h=1080");

const baseFacilities: Facility[] = [
  { name: "WiFi", status: "live" },
  { name: "VIP Lounge", status: "24x7" },
  { name: "Business Lounge", status: "24x7" },
  { name: "Meet & Greet", status: "24x7" },
  { name: "Fast Track", status: "live" },
  { name: "Medical", status: "24x7" },
  { name: "Prayer Room", status: "live" },
  { name: "Restaurants", status: "live" },
  { name: "Duty Free", status: "live" },
  { name: "ATM", status: "24x7" },
  { name: "Currency Exchange", status: "live" },
  { name: "Smoking Zone", status: "limited" },
  { name: "Baby Care", status: "live" },
  { name: "Wheelchair", status: "24x7" },
  { name: "Lost & Found", status: "live" },
  { name: "Charging Points", status: "live" },
  { name: "Hotel", status: "live" },
  { name: "Parking", status: "24x7" },
  { name: "Car Rental", status: "live" },
];

const baseFAQ: [string, string][] = [
  [
    "What is Suswagatam Meet & Greet?",
    "Shafsky's signature welcome — porter, fast-track immigration, lounge access and chauffeur, handled end-to-end.",
  ],
  [
    "Can I book for a family?",
    "Yes. Our concierge tailors group escorts for up to 12 passengers including unaccompanied minors and elderly assistance.",
  ],
  [
    "How far in advance should I book?",
    "Ideally 24 hours. For VVIP arrivals and ad-hoc charter we operate a 4-hour express desk.",
  ],
  [
    "Do you handle international transit?",
    "Yes. We coordinate transit, baggage retag and lounge connectivity across all major terminals.",
  ],
];

export const AIRPORTS: Airport[] = [
  {
    code: "LKO",
    icao: "VILK",
    city: "Lucknow",
    country: "India",
    countryCode: "IN",
    landmark: "Bara Imambara",
    tagline: "The City of Nawabs",
    timezone: "Asia/Kolkata",
    cover: dekLkoAir,
    mobCover: mobLkoAir,
    slideshow: [imambada, u("Lucknow Clock Tower"), u("Lucknow Airport")],
    gallery: [
      imambada,
      us("Lucknow Clock Tower"),
      us("Lucknow Airport"),
      us("Lucknow market"),
      us("Awadhi food"),
      us("Lucknow chikankari"),
    ],
    videoId: "5qap5aO4i9A",
    about:
      "Lucknow, the cultural capital of Uttar Pradesh, fuses Mughal grandeur with refined Awadhi etiquette — known the world over as the City of Nawabs.",
    bestTime: "October – March",
    languages: "Hindi, Urdu, English",
    currency: "INR (₹)",
    business: "Government, IT, manufacturing, defense",
    tourism: "Heritage monuments, Awadhi cuisine, Chikankari embroidery",
    climate: "Humid subtropical — warm summers, cool winters",
    safety: "Very safe for travelers. Tourist police active in old city.",
    emergency: "Police 100 · Ambulance 102 · Fire 101",
    visa: "e-Visa available for 160+ nationalities",
    airport: {
      name: "Chaudhary Charan Singh International Airport",
      elevation: "410 ft",
      runways: "1 (4,275 m)",
      operator: "Adani Airport Holdings",
      type: "International",
      domestic: "120+ daily",
      intl: "18+ weekly",
      terminals: "2",
      capacity: "8M pax/yr",
      annual: "5.2M",
      cargo: "35,000 MT",
      website: "lucknowairport.com",
      contact: "+91 522 243 6132",
    },
    attractions: [
      {
        name: "Bara Imambara",
        img: us("Bara Imambara"),
        desc: "18th-century Asafi mosque complex with the labyrinthine Bhulbhulaiya.",
        distance: "16 km",
        travel: "35 min",
        hours: "06:00 – 17:00",
        fee: "₹50",
        photo: "Inner courtyard, golden hour",
        maps: "https://maps.google.com/?q=Bara+Imambara+Lucknow",
      },
      {
        name: "Rumi Darwaza",
        img: us("Rumi Darwaza"),
        desc: "60-foot Awadhi gateway modelled on Istanbul's Bab-i-Hümayun.",
        distance: "16 km",
        travel: "35 min",
        hours: "Open 24h",
        fee: "Free",
        photo: "Wide angle from Hussainabad road",
        maps: "https://maps.google.com/?q=Rumi+Darwaza",
      },
      {
        name: "Chota Imambara",
        img: us("Chota Imambara Lucknow"),
        desc: "Chandelier-lit mausoleum often called the Palace of Lights.",
        distance: "17 km",
        travel: "40 min",
        hours: "06:00 – 17:00",
        fee: "₹25",
        photo: "Interior chandeliers",
        maps: "https://maps.google.com/?q=Chota+Imambara",
      },
    ],
    facilities: baseFacilities,
    weather: {
      temp: "28°C",
      humidity: "62%",
      visibility: "8 km",
      wind: "12 km/h NW",
      aqi: "Moderate (96)",
      sunrise: "05:42",
      sunset: "18:34",
      flying: "Excellent",
    },
    transport: [
      { mode: "Metro", fare: "₹10–60", time: "25 min to centre", availability: "06:00 – 22:00" },
      { mode: "Taxi", fare: "₹400", time: "30 min", availability: "24×7" },
      { mode: "Uber / Ola", fare: "₹320", time: "30 min", availability: "24×7" },
      { mode: "Car Rental", fare: "₹2,200/day", time: "On demand", availability: "24×7" },
      { mode: "Bus", fare: "₹40", time: "55 min", availability: "05:00 – 23:00" },
      { mode: "Parking", fare: "₹120/hr", time: "—", availability: "24×7" },
    ],
    hotels: [
      {
        name: "Taj Mahal Lucknow",
        stars: 5,
        distance: "14 km",
        price: "₹14,000+",
        img: us("luxury hotel suite"),
      },
      {
        name: "Hyatt Regency",
        stars: 5,
        distance: "10 km",
        price: "₹12,500+",
        img: us("hyatt hotel lobby"),
      },
      {
        name: "Renaissance",
        stars: 5,
        distance: "12 km",
        price: "₹11,800+",
        img: us("renaissance hotel"),
      },
      {
        name: "Lebua Lucknow",
        stars: 5,
        distance: "13 km",
        price: "₹16,200+",
        img: us("heritage hotel india"),
      },
    ],
    experiences: [
      {
        kind: "Food",
        title: "Tunday Kababi",
        img: us("kebab lucknow"),
        note: "Iconic galouti, 1905",
      },
      {
        kind: "Shopping",
        title: "Hazratganj",
        img: us("hazratganj market"),
        note: "Colonial avenue",
      },
      { kind: "Culture", title: "Kathak Kendra", img: us("kathak dance"), note: "Classical dance" },
      {
        kind: "Nightlife",
        title: "Skybar 1090",
        img: us("skybar lounge"),
        note: "Rooftop cocktails",
      },
      { kind: "Museums", title: "State Museum", img: us("museum"), note: "Awadhi artefacts" },
    ],
    faqs: baseFAQ,
    related: ["DEL", "JAI", "BBI"],
  },
  {
    code: "DEL",
    icao: "VIDP",
    city: "Delhi",
    country: "India",
    countryCode: "IN",
    landmark: "India Gate",
    tagline: "Capital of a Thousand Empires",
    timezone: "Asia/Kolkata",
    cover: dekDelAir,
    mobCover: mobDelAir,
    slideshow: [u("India Gate"), u("Rashtrapati Bhavan"), u("Qutub Minar"), u("Humayun Tomb")],
    gallery: [
      us("Delhi street"),
      us("Red Fort"),
      us("Lotus Temple"),
      us("Chandni Chowk"),
      us("Delhi metro"),
      us("India Gate night"),
    ],
    videoId: "jfKfPfyJRdk",
    about:
      "Delhi is India's capital and the diplomatic, political and culinary capital of South Asia — eight cities layered into one.",
    bestTime: "October – March",
    languages: "Hindi, English, Urdu, Punjabi",
    currency: "INR (₹)",
    business: "Government, finance, technology, diplomacy",
    tourism: "World Heritage monuments, Mughal cuisine, designer boutiques",
    climate: "Semi-arid — hot summers, chilly winters",
    safety: "Generally safe. Stay in registered taxis after midnight.",
    emergency: "Police 100 · Ambulance 102 · Tourist Helpline 1363",
    visa: "e-Visa, visa-on-arrival for select nationalities",
    airport: {
      name: "Indira Gandhi International Airport",
      elevation: "777 ft",
      runways: "4 (parallel + cross)",
      operator: "GMR Group / DIAL",
      type: "International hub",
      domestic: "1,100+ daily",
      intl: "350+ daily",
      terminals: "Terminal 1, Terminal 2 & Terminal 3",
      capacity: "100M pax/yr",
      annual: "73M",
      cargo: "1.1M MT",
      website: "newdelhiairport.in",
      contact: "+91 124 337 6000",
    },
    attractions: [
      {
        name: "India Gate",
        img: us("India Gate"),
        desc: "42-m war memorial arch on Rajpath honouring 84,000 soldiers.",
        distance: "16 km",
        travel: "30 min",
        hours: "Open 24h",
        fee: "Free",
        photo: "Twilight, long exposure",
        maps: "https://maps.google.com/?q=India+Gate",
      },
      {
        name: "Qutub Minar",
        img: us("Qutub Minar"),
        desc: "73-m UNESCO minaret, tallest brick tower in the world.",
        distance: "12 km",
        travel: "25 min",
        hours: "07:00 – 17:00",
        fee: "₹40",
        photo: "Looking up from base",
        maps: "https://maps.google.com/?q=Qutub+Minar",
      },
      {
        name: "Humayun's Tomb",
        img: us("Humayun Tomb"),
        desc: "Garden tomb that inspired the Taj Mahal — Mughal architecture peak.",
        distance: "20 km",
        travel: "40 min",
        hours: "06:00 – 18:00",
        fee: "₹40",
        photo: "Charbagh symmetry",
        maps: "https://maps.google.com/?q=Humayun+Tomb",
      },
    ],
    facilities: baseFacilities,
    weather: {
      temp: "31°C",
      humidity: "55%",
      visibility: "6 km",
      wind: "14 km/h W",
      aqi: "Unhealthy (158)",
      sunrise: "05:28",
      sunset: "18:48",
      flying: "Good",
    },
    transport: [
      {
        mode: "Airport Metro",
        fare: "₹60",
        time: "20 min to centre",
        availability: "04:45 – 23:30",
      },
      { mode: "Prepaid Taxi", fare: "₹500", time: "35 min", availability: "24×7" },
      { mode: "Uber Premier", fare: "₹650", time: "35 min", availability: "24×7" },
      { mode: "Car Rental", fare: "₹3,200/day", time: "On demand", availability: "24×7" },
      { mode: "DTC Bus", fare: "₹50", time: "60 min", availability: "05:00 – 23:00" },
      { mode: "Multi-level Parking", fare: "₹150/hr", time: "—", availability: "24×7" },
    ],
    hotels: [
      {
        name: "The Leela Palace",
        stars: 5,
        distance: "14 km",
        price: "₹28,000+",
        img: us("leela palace"),
      },
      {
        name: "The Oberoi",
        stars: 5,
        distance: "16 km",
        price: "₹32,000+",
        img: us("oberoi hotel"),
      },
      {
        name: "Taj Mahal Hotel",
        stars: 5,
        distance: "18 km",
        price: "₹25,500+",
        img: us("taj mahal hotel delhi"),
      },
      {
        name: "Andaz Aerocity",
        stars: 5,
        distance: "3 km",
        price: "₹18,000+",
        img: us("andaz hotel"),
      },
    ],
    experiences: [
      { kind: "Food", title: "Karim's Jama Masjid", img: us("mughlai food"), note: "Since 1913" },
      {
        kind: "Shopping",
        title: "DLF Emporio",
        img: us("luxury mall delhi"),
        note: "Luxury flagship",
      },
      {
        kind: "Culture",
        title: "Kingdom of Dreams",
        img: us("theatre delhi"),
        note: "Bollywood theatre",
      },
      {
        kind: "Nightlife",
        title: "Hauz Khas Village",
        img: us("hauz khas"),
        note: "Boutique bars",
      },
      {
        kind: "Business District",
        title: "Connaught Place",
        img: us("connaught place"),
        note: "CBD",
      },
    ],
    faqs: baseFAQ,
    related: ["BOM", "LKO", "JAI"],
  },
  {
    code: "BOM",
    icao: "VABB",
    city: "Mumbai",
    country: "India",
    countryCode: "IN",
    landmark: "Gateway of India",
    tagline: "The City that Never Sleeps",
    timezone: "Asia/Kolkata",
    cover: dekMumAir,
    mobCover: dekMumAir,
    slideshow: [
      u("Gateway of India"),
      u("Marine Drive Mumbai"),
      u("Bandra Worli Sea Link"),
      u("Mumbai skyline"),
    ],
    gallery: [
      us("Mumbai skyline"),
      us("Marine Drive night"),
      us("Taj Hotel Mumbai"),
      us("Mumbai local train"),
      us("Bollywood"),
      us("Mumbai street food"),
    ],
    videoId: "5qap5aO4i9A",
    about:
      "Mumbai is India's financial heart, Bollywood capital and Arabian-Sea metropolis — a city of contrast and constant motion.",
    bestTime: "November – February",
    languages: "Marathi, Hindi, English",
    currency: "INR (₹)",
    business: "Finance, entertainment, shipping, diamonds",
    tourism: "Colonial architecture, beaches, Bollywood",
    climate: "Tropical — monsoon Jun–Sep, mild winters",
    safety: "Very safe. Crowded transit — mind belongings.",
    emergency: "Police 100 · Ambulance 108 · Coastal 1554",
    visa: "e-Visa for 160+ nationalities",
    airport: {
      name: "Chhatrapati Shivaji Maharaj International Airport",
      elevation: "39 ft",
      runways: "2 (intersecting)",
      operator: "Adani Airport Holdings",
      type: "International hub",
      domestic: "750+ daily",
      intl: "220+ daily",
      terminals: "Full Airport Passenger Hubs",
      capacity: "55M pax/yr",
      annual: "52M",
      cargo: "0.9M MT",
      website: "csia.in",
      contact: "+91 22 6685 1010",
    },
    attractions: [
      {
        name: "Gateway of India",
        img: us("Gateway of India"),
        desc: "26-m basalt arch built for King George V's 1911 visit.",
        distance: "25 km",
        travel: "55 min",
        hours: "Open 24h",
        fee: "Free",
        photo: "From harbour cruise",
        maps: "https://maps.google.com/?q=Gateway+of+India",
      },
      {
        name: "Marine Drive",
        img: us("Marine Drive Mumbai"),
        desc: "Queen's Necklace promenade — Art Deco crescent.",
        distance: "22 km",
        travel: "50 min",
        hours: "Open 24h",
        fee: "Free",
        photo: "Blue hour from Nariman Point",
        maps: "https://maps.google.com/?q=Marine+Drive",
      },
      {
        name: "Elephanta Caves",
        img: us("Elephanta Caves"),
        desc: "UNESCO 5th-century rock-cut Shiva temples.",
        distance: "30 km + ferry",
        travel: "1.5 hrs",
        hours: "09:00 – 17:00",
        fee: "₹40",
        photo: "Trimurti sculpture",
        maps: "https://maps.google.com/?q=Elephanta+Caves",
      },
    ],
    facilities: baseFacilities,
    weather: {
      temp: "30°C",
      humidity: "78%",
      visibility: "9 km",
      wind: "18 km/h SW",
      aqi: "Moderate (88)",
      sunrise: "06:12",
      sunset: "18:54",
      flying: "Excellent",
    },
    transport: [
      {
        mode: "Metro Line 3",
        fare: "₹50",
        time: "30 min to centre",
        availability: "06:00 – 22:30",
      },
      { mode: "Cool Cab", fare: "₹600", time: "60 min", availability: "24×7" },
      { mode: "Uber Black", fare: "₹850", time: "55 min", availability: "24×7" },
      { mode: "Car Rental", fare: "₹3,500/day", time: "On demand", availability: "24×7" },
      { mode: "BEST Bus", fare: "₹45", time: "90 min", availability: "05:00 – 24:00" },
      { mode: "Valet Parking", fare: "₹200/hr", time: "—", availability: "24×7" },
    ],
    hotels: [
      {
        name: "Taj Mahal Palace",
        stars: 5,
        distance: "23 km",
        price: "₹35,000+",
        img: us("taj palace mumbai"),
      },
      {
        name: "The Oberoi Mumbai",
        stars: 5,
        distance: "22 km",
        price: "₹38,000+",
        img: us("oberoi mumbai"),
      },
      {
        name: "Trident BKC",
        stars: 5,
        distance: "8 km",
        price: "₹22,000+",
        img: us("trident hotel"),
      },
      {
        name: "JW Marriott Juhu",
        stars: 5,
        distance: "6 km",
        price: "₹26,000+",
        img: us("marriott juhu"),
      },
    ],
    experiences: [
      { kind: "Food", title: "Bademiya Colaba", img: us("kebab roll mumbai"), note: "Since 1946" },
      {
        kind: "Shopping",
        title: "Colaba Causeway",
        img: us("colaba market"),
        note: "Boutique + street",
      },
      { kind: "Culture", title: "NCPA", img: us("opera house"), note: "Performing arts" },
      {
        kind: "Nightlife",
        title: "Aer Four Seasons",
        img: us("rooftop bar mumbai"),
        note: "34th-floor bar",
      },
      { kind: "Business District", title: "BKC", img: us("bkc mumbai"), note: "Financial CBD" },
    ],
    faqs: baseFAQ,
    related: ["DEL", "GOI", "BLR"],
  },
  // Compact entries for remaining cities — same shape, tailored content
  ...buildCity({
    code: "HYD",
    icao: "VOHS",
    city: "Hyderabad",
    landmark: "Charminar",
    tagline: "City of Pearls",
    q1: "Charminar Hyderabad",
    q2: "Hyderabad skyline",
    q3: "Golconda Fort",
    airportName: "Rajiv Gandhi International Airport",
    terminals: "1 (integrated)",
    annual: "21M",
    attr: [
      ["Charminar", "Charminar Hyderabad", "16th-c granite arch, four 56-m minarets."],
      ["Golconda Fort", "Golconda Fort", "Acoustic citadel of the Qutb Shahis."],
      ["Ramoji Film City", "Ramoji Film City", "World's largest studio complex."],
    ],
  }).map((a) => ({
    ...a,
    cover: dekHydAir,
    mobCover: mobHydAir,
    slideshow: [chaarminar, golkunda],
    gallery: [chaarminar, golkunda, chaarminar, golkunda, a.gallery[4], a.gallery[5]],
    attractions: a.attractions.map((att) => {
      if (att.name === "Charminar") return { ...att, img: chaarminar };
      if (att.name === "Golconda Fort") return { ...att, img: golkunda };
      return att;
    }),
  })),
  ...buildCity({
    code: "JAI",
    icao: "VIJP",
    city: "Jaipur",
    landmark: "Hawa Mahal",
    tagline: "The Pink City",
    q1: "Hawa Mahal",
    q2: "City Palace Jaipur",
    q3: "Jal Mahal",
    airportName: "Jaipur International Airport",
    terminals: "2",
    annual: "5.5M",
    attr: [
      ["Hawa Mahal", "Hawa Mahal", "953-jharokha façade in pink sandstone."],
      ["City Palace", "City Palace Jaipur", "Living royal residence."],
    ],
  }).map((a) => ({
    ...a,
    cover: dekJaiAir,
    mobCover: mobJaiAir,
    slideshow: [dekJaiAir],
    gallery: [dekJaiAir, a.gallery[0]],
  })),
  ...buildCity({
    code: "ATQ",
    icao: "VIAR",
    city: "Amritsar",
    landmark: "Golden Temple",
    tagline: "The City of Gold",
    q1: "Golden Temple",
    q2: "Wagah Border",
    q3: "Jallianwala Bagh",
    airportName: "Sri Guru Ram Dass Jee International Airport",
    terminals: "1",
    annual: "2.5M",
    attr: [
      ["Golden Temple", "Golden Temple Amritsar", "Holiest Sikh gurdwara, gold-leaf sanctum."],
      ["Wagah Border", "Wagah Border ceremony", "Daily flag-lowering parade."],
      ["Jallianwala Bagh", "Jallianwala Bagh", "1919 memorial garden."],
    ],
  }).map((a) => ({
    ...a,
    cover: dekAtqAir,
    mobCover: mobAtqAir,
    slideshow: [dekAtqAir],
    gallery: [dekAtqAir, a.gallery[0]],
  })),
  ...buildCity({
    code: "AMD",
    icao: "VAAH",
    city: "Ahmedabad",
    landmark: "Sabarmati Riverfront",
    tagline: "UNESCO Heritage City",
    q1: "Sabarmati Riverfront",
    q2: "Adalaj Stepwell",
    q3: "Sabarmati Ashram",
    airportName: "Sardar Vallabhbhai Patel International Airport",
    terminals: "2",
    annual: "11M",
    attr: [
      ["Sabarmati Riverfront", "Sabarmati Riverfront", "11-km landscaped promenade."],
      ["Adalaj Stepwell", "Adalaj Stepwell", "Five-storey Indo-Islamic vav."],
      ["Sabarmati Ashram", "Sabarmati Ashram", "Gandhi's residence 1917–1930."],
    ],
  }).map((a) => ({
    ...a,
    cover: dekAmdAir,
    mobCover: mobAmdAir,
  })),
  ...buildCity({
    code: "GOI",
    icao: "VOGO",
    city: "Goa",
    landmark: "Calangute Beach",
    tagline: "Pearl of the Orient",
    q1: "Goa beach",
    q2: "Basilica Bom Jesus",
    q3: "Goa sunset",
    airportName: "Dabolim International Airport",
    terminals: "1",
    annual: "8M",
    attr: [
      ["Calangute Beach", "Calangute Beach Goa", "Queen of beaches, 7 km of sand."],
      ["Basilica of Bom Jesus", "Basilica Bom Jesus", "UNESCO baroque church, 1605."],
      ["Dudhsagar Falls", "Dudhsagar Falls", "310-m four-tier cascade."],
    ],
  }).map((a) => ({
    ...a,
    cover: dekGoiAir,
    mobCover: mobGoiAir,
    slideshow: [dekGoiAir],
    gallery: [dekGoiAir, a.gallery[0]],
  })),
  ...buildCity({
    code: "CCU",
    icao: "VECC",
    city: "Kolkata",
    landmark: "Howrah Bridge",
    tagline: "City of Joy",
    q1: "Howrah Bridge",
    q2: "Victoria Memorial",
    q3: "Kolkata tram",
    airportName: "Netaji Subhas Chandra Bose International Airport",
    terminals: "1 (integrated)",
    annual: "22M",
    attr: [
      ["Howrah Bridge", "Howrah Bridge", "705-m cantilever icon, 1943."],
      ["Victoria Memorial", "Victoria Memorial Kolkata", "Marble museum, 1921."],
      ["Dakshineswar Temple", "Dakshineswar Kali Temple", "Bhavatarini riverside shrine."],
    ],
  }),
  ...buildCity({
    code: "MAA",
    icao: "VOMM",
    city: "Chennai",
    landmark: "Marina Beach",
    tagline: "Gateway of South India",
    q1: "Marina Beach Chennai",
    q2: "Kapaleeshwarar Temple",
    q3: "Chennai skyline",
    airportName: "Chennai International Airport",
    terminals: "4",
    annual: "22M",
    attr: [
      ["Marina Beach", "Marina Beach", "13-km urban beach, world's 2nd longest."],
      ["Kapaleeshwarar Temple", "Kapaleeshwarar Temple", "Dravidian Shiva temple, Mylapore."],
      ["Fort St. George", "Fort St George Chennai", "First English fortress in India, 1644."],
    ],
  }).map((a) => ({
    ...a,
    cover: dekMaaAir,
    mobCover: mobMaaAir,
    slideshow: [dekMaaAir],
    gallery: [dekMaaAir, a.gallery[0]],
  })),
  ...buildCity({
    code: "BLR",
    icao: "VOBL",
    city: "Bengaluru",
    landmark: "Vidhana Soudha",
    tagline: "Silicon Valley of India",
    q1: "Vidhana Soudha",
    q2: "Lalbagh Garden",
    q3: "Bengaluru tech park",
    airportName: "Kempegowda International Airport",
    terminals: "2",
    annual: "37M",
    attr: [
      ["Vidhana Soudha", "Vidhana Soudha", "Neo-Dravidian granite legislature."],
      ["Lalbagh Botanical", "Lalbagh Bengaluru", "240-acre Tipu Sultan garden."],
      ["Bangalore Palace", "Bangalore Palace", "Tudor-style royal residence."],
    ],
  }),
  ...buildCity({
    code: "COK",
    icao: "VOCI",
    city: "Kochi",
    landmark: "Chinese Fishing Nets",
    tagline: "Queen of the Arabian Sea",
    q1: "Chinese Fishing Nets Kochi",
    q2: "Fort Kochi",
    q3: "Kerala backwaters",
    airportName: "Cochin International Airport",
    terminals: "3",
    annual: "10M",
    attr: [
      ["Chinese Fishing Nets", "Chinese Fishing Nets", "14th-c cantilever nets at Fort Kochi."],
      ["Mattancherry Palace", "Mattancherry Palace", "Kerala-Portuguese mural museum."],
      ["Backwaters Cruise", "Kerala backwaters houseboat", "Kettuvallam through canals."],
    ],
  }).map((a) => ({
    ...a,
    cover: dekCokAir,
    mobCover: mobCokAir,
    slideshow: [dekCokAir],
    gallery: [dekCokAir, a.gallery[0]],
  })),
  ...buildCity({
    code: "TRV",
    icao: "VOTV",
    city: "Thiruvananthapuram",
    landmark: "Padmanabhaswamy Temple",
    tagline: "Evergreen City of India",
    q1: "Padmanabhaswamy Temple",
    q2: "Kovalam Beach",
    q3: "Kerala temple",
    airportName: "Trivandrum International Airport",
    terminals: "2",
    annual: "4.5M",
    attr: [
      ["Padmanabhaswamy Temple", "Padmanabhaswamy Temple", "Dravidian-Kerala gold-vaulted shrine."],
      ["Kovalam Beach", "Kovalam Beach", "Crescent cove with lighthouse."],
      ["Napier Museum", "Napier Museum Trivandrum", "Indo-Saracenic 1855 gallery."],
    ],
  }),
  ...buildCity({
    code: "VTZ",
    icao: "VOVZ",
    city: "Visakhapatnam",
    landmark: "RK Beach",
    tagline: "Jewel of the East Coast",
    q1: "RK Beach Visakhapatnam",
    q2: "Araku Valley",
    q3: "Vizag port",
    airportName: "Visakhapatnam International Airport",
    terminals: "1",
    annual: "2.5M",
    attr: [
      ["RK Beach", "RK Beach Visakhapatnam", "8-km Ramakrishna seafront promenade."],
      ["Submarine Museum", "INS Kursura submarine", "Real Soviet sub on the beach."],
      ["Araku Valley", "Araku Valley", "Eastern Ghats coffee plateau."],
    ],
  }),
  ...buildCity({
    code: "BBI",
    icao: "VEBS",
    city: "Bhubaneswar",
    landmark: "Lingaraj Temple",
    tagline: "The Temple City of India",
    q1: "Lingaraj Temple",
    q2: "Udayagiri Caves",
    q3: "Dhauli Shanti Stupa",
    airportName: "Biju Patnaik International Airport",
    terminals: "2",
    annual: "4.5M",
    attr: [
      ["Lingaraj Temple", "Lingaraj Temple Bhubaneswar", "11th-century monument dedicated to Lord Shiva."],
      ["Udayagiri Caves", "Udayagiri & Khandagiri Caves", "Ancient rock-cut caves with historical inscriptions."],
      ["Dhauli Shanti Stupa", "Dhauli Stupa", "Peace pagoda marking the Kalinga war transformation."]
    ]
  }).map((a) => ({
    ...a,
    cover: dekBbiAir,
    mobCover: mobBbiAir,
    slideshow: [dekBbiAir],
    gallery: [dekBbiAir, a.gallery[0]],
  })),
  ...buildCity({
    code: "IXC",
    icao: "VICG",
    city: "Chandigarh",
    landmark: "Rock Garden",
    tagline: "The City Beautiful",
    q1: "Rock Garden Chandigarh",
    q2: "Sukhna Lake",
    q3: "Rose Garden Chandigarh",
    airportName: "Shaheed Bhagat Singh International Airport",
    terminals: "1",
    annual: "3.6M",
    attr: [
      ["Rock Garden", "Rock Garden", "Sculpture garden built entirely from industrial & home waste."],
      ["Sukhna Lake", "Sukhna Lake", "Reservoir at the foothills of the Himalayas (Shivalik Hills)."],
      ["Rose Garden", "Rose Garden Chandigarh", "Largest botanical rose garden in Asia."]
    ]
  }),
  ...buildCity({
    code: "GOX",
    icao: "VOMY",
    city: "Goa Mopa",
    landmark: "Vagator Beach",
    tagline: "Gateway to North Goa",
    q1: "Vagator Beach Goa",
    q2: "Chapora Fort",
    q3: "Arambol Beach Goa",
    airportName: "Manohar International Airport",
    terminals: "1",
    annual: "5.0M",
    attr: [
      ["Vagator Beach", "Vagator Beach", "Dramatic red cliffs and white sands of North Goa."],
      ["Chapora Fort", "Chapora Fort", "Historic hilltop fortification with panoramic coast views."],
      ["Arambol Beach", "Arambol Beach", "Bohemian beach haven known for its freshwater lake."]
    ]
  }).map((a) => ({
    ...a,
    cover: dekGoxAir,
    mobCover: mobGoxAir,
    slideshow: [dekGoxAir],
    gallery: [dekGoxAir, a.gallery[0]],
  })),
  ...buildCity({
    code: "GAU",
    icao: "VEGT",
    city: "Guwahati",
    landmark: "Kamakhya Temple",
    tagline: "Gateway to Northeast India",
    q1: "Kamakhya Temple Guwahati",
    q2: "Brahmaputra Cruise",
    q3: "Umananda Temple",
    airportName: "Lokpriya Gopinath Bordoloi International Airport",
    terminals: "2",
    annual: "5.5M",
    attr: [
      ["Kamakhya Temple", "Kamakhya Temple", "Ancient Hindu temple dedicated to the mother goddess Kamakhya."],
      ["Brahmaputra Cruise", "Brahmaputra river cruise", "Scenic river cruise offering sunset views across the Brahmaputra."],
      ["Umananda Island", "Umananda Island", "The smallest inhabited river island in the world."]
    ]
  }),
  ...buildCity({
    code: "IXE",
    icao: "VOML",
    city: "Mangaluru",
    landmark: "Panambur Beach",
    tagline: "The Gateway to Karnataka",
    q1: "Panambur Beach Mangalore",
    q2: "Kadri Manjunath Temple",
    q3: "St. Aloysius Chapel",
    airportName: "Mangaluru International Airport",
    terminals: "1",
    annual: "2.3M",
    attr: [
      ["Panambur Beach", "Panambur Beach", "Pristine golden beach known for sunsets and water sports."],
      ["Kadri Manjunath Temple", "Kadri Manjunath Temple", "Historic 10th-century temple complex at the base of Kadri hills."],
      ["St. Aloysius Chapel", "St Aloysius Chapel Mangalore", "Sistine Chapel-style frescos painted in 1899."]
    ]
  }),
  ...buildCity({
    code: "IXR",
    icao: "VERC",
    city: "Ranchi",
    landmark: "Hundru Falls",
    tagline: "The City of Waterfalls",
    q1: "Hundru Falls Ranchi",
    q2: "Jagannath Temple Ranchi",
    q3: "Dassam Falls",
    airportName: "Birsa Munda Airport",
    terminals: "1",
    annual: "2.4M",
    attr: [
      ["Hundru Falls", "Hundru Falls", "Stunning 98-meter waterfall formed by the Subarnarekha River."],
      ["Jagannath Temple", "Jagannath Temple Ranchi", "Hilltop 17th-century temple styled after Puri's temple."],
      ["Dassam Falls", "Dassam Falls", "Scenic cascade where the Kanchi River plunges 44 meters."]
    ]
  }),
];

{
  const gau = AIRPORTS.find((a) => a.code === "GAU");
  if (gau) {
    gau.cover = dekGauAir;
    gau.mobCover = mobGauAir;
    gau.slideshow = [dekGauAir, mobGauAir, ...gau.slideshow.slice(2)];
  }
}

type CityArgs = {
  code: string;
  icao: string;
  city: string;
  landmark: string;
  tagline: string;
  q1: string;
  q2: string;
  q3: string;
  airportName: string;
  terminals: string;
  annual: string;
  attr: [string, string, string][];
};

function buildCity(a: CityArgs): Airport[] {
  const country = "India";
  const countryCode = "IN";
  const timezone = "Asia/Kolkata";
  const currency = "INR (₹)";

  return [
    {
      code: a.code,
      icao: a.icao,
      city: a.city,
      country,
      countryCode,
      landmark: a.landmark,
      tagline: a.tagline,
      timezone,
      cover: u(a.q1),
      slideshow: [u(a.q1), u(a.q2), u(a.q3), u(a.city + " skyline")],
      gallery: [
        us(a.q1),
        us(a.q2),
        us(a.q3),
        us(a.city + " street"),
        us(a.city + " food"),
        us(a.city + " market"),
      ],
      videoId: "jfKfPfyJRdk",
      about: `${a.city} blends heritage, commerce and modern aviation infrastructure — a signature stop on the Shafsky network.`,
      bestTime: "October – March",
      languages: "Regional + Hindi + English",
      currency,
      business: "Trade, services, manufacturing",
      tourism: a.landmark + " and surrounding heritage",
      climate: "Tropical to subtropical",
      safety: "Safe for travellers with standard precautions.",
      emergency: "Police 100 · Ambulance 102",
      visa: "e-Visa available",
      airport: {
        name: a.airportName,
        elevation: "—",
        runways: "1",
        operator: "Airports Authority of India / Concessionaire",
        type: "International",
        domestic: "60+ daily",
        intl: "10+ weekly",
        terminals: a.terminals,
        capacity: "—",
        annual: a.annual,
        cargo: "—",
        website: "aai.aero",
        contact: "+91 124 337 6000",
      },
      attractions: a.attr.map(([n, q, d]) => ({
        name: n,
        img: us(q),
        desc: d,
        distance: "12 km",
        travel: "30 min",
        hours: "06:00 – 18:00",
        fee: "Standard",
        photo: "Golden hour exterior",
        maps: `https://maps.google.com/?q=${encodeURIComponent(n + " " + a.city)}`,
      })),
      facilities: baseFacilities,
      weather: {
        temp: "29°C",
        humidity: "60%",
        visibility: "8 km",
        wind: "12 km/h",
        aqi: "Moderate",
        sunrise: "05:55",
        sunset: "18:40",
        flying: "Excellent",
      },
      transport: [
        { mode: "Taxi", fare: "₹450", time: "30 min", availability: "24×7" },
        { mode: "Uber / Ola", fare: "₹360", time: "30 min", availability: "24×7" },
        { mode: "Car Rental", fare: "₹2,500/day", time: "On demand", availability: "24×7" },
        { mode: "Bus", fare: "₹40", time: "60 min", availability: "05:00 – 23:00" },
        { mode: "Parking", fare: "₹120/hr", time: "—", availability: "24×7" },
        { mode: "Metro / Rail", fare: "₹40", time: "—", availability: "06:00 – 22:00" },
      ],
      hotels: [
        {
          name: "Taj " + a.city,
          stars: 5,
          distance: "10 km",
          price: "₹14,000+",
          img: us("taj hotel " + a.city),
        },
        {
          name: "ITC " + a.city,
          stars: 5,
          distance: "12 km",
          price: "₹13,500+",
          img: us("itc hotel"),
        },
      ],
      experiences: [
        {
          kind: "Luxury",
          title: "Sky Lounge",
          img: us(a.city + " rooftop"),
          note: "Panoramic skyline views",
        },
      ],
      faqs: baseFAQ,
      related: ["DEL", "BOM", "LKO"],
    },
  ];
}

export function getAirport(code: string): Airport {
  const upperCode = (code || "").toUpperCase().trim();
  const found = AIRPORTS.find((a) => a.code.toUpperCase() === upperCode);
  if (found) return found;

  // Check AIRPORT_REGISTRY or fallback lookup for all 200+ global airports
  const reg = AIRPORT_REGISTRY[upperCode];
  const cityName = reg?.city || upperCode;
  const countryName = reg?.country || "International";
  const airportName = reg?.name || `${cityName} International Airport`;

  const fallbackCover = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=95";

  return {
    code: upperCode,
    icao: reg?.icao || `V${upperCode}`,
    city: cityName,
    country: countryName,
    countryCode: reg?.countryCode || "IN",
    landmark: "Airport Sanctuary",
    tagline: `Premier Gateway to ${cityName}`,
    timezone: reg?.timezone || "Asia/Kolkata",
    cover: fallbackCover,
    mobCover: fallbackCover,
    slideshow: [
      fallbackCover,
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=95",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=95",
    ],
    gallery: [
      fallbackCover,
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=95",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=95",
    ],
    videoId: "5qap5aO4i9A",
    about: `${airportName} (${upperCode}) serves as a primary aviation hub connecting ${cityName}, ${countryName} with major domestic and international destinations. Shafsky Aviation provides full VVIP airside escorts, Meet & Greet, fast-track customs clearance, and chauffeured transit at this hub.`,
    bestTime: "Year-Round",
    languages: "English, Local Official Languages",
    currency: countryName === "India" ? "INR (₹)" : "USD ($)",
    business: "Aviation, Commerce, International Travel",
    tourism: "Cultural Landmarks, Heritage Sites, Business Centers",
    climate: "Subtropical / Temperate",
    safety: "High Security Protocol Standard",
    emergency: "24/7 Operations Desk Active",
    visa: "Standard International Entry / e-Visa Protocols",
    airport: {
      name: airportName,
      elevation: "150 ft",
      runways: "2 Parallel Runways",
      operator: "International Airport Authority",
      type: "International Hub",
      domestic: "100+ daily flights",
      intl: "40+ weekly flights",
      terminals: "2 Terminals",
      capacity: "15M Pax / Year",
      annual: "10M+",
      cargo: "50,000 MT",
      website: `https://${upperCode.toLowerCase()}-airport.com`,
      contact: "+1 800 SHAFSKY",
    },
    attractions: [
      {
        name: `${cityName} City Center`,
        img: fallbackCover,
        desc: `The vibrant cultural and business heart of ${cityName}.`,
        distance: "15 km",
        travel: "25 mins",
        hours: "24/7",
        fee: "Free Access",
        photo: fallbackCover,
        maps: "#",
      },
    ],
    facilities: baseFacilities,
    weather: {
      temp: "26°C",
      humidity: "65%",
      visibility: "10 km",
      wind: "12 km/h",
      aqi: "Good (42)",
      sunrise: "06:15 AM",
      sunset: "06:45 PM",
      flying: "Optimal",
    },
    transport: [
      {
        mode: "VIP Chauffeur Sedan",
        fare: "Included / Custom Rate",
        time: "Direct Curbside Pickup",
        availability: "24/7 On Demand",
      },
    ],
    hotels: [
      {
        name: `Grand Hyatt ${cityName}`,
        stars: 5,
        distance: "5 km",
        price: "₹12,000 / night",
        img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      },
    ],
    experiences: [
      {
        kind: "VIP Concierge",
        title: "Suswagatam Escort",
        img: fallbackCover,
        note: "Aerobridge to curbside dedicated officer",
      },
    ],
    faqs: baseFAQ,
    related: ["DEL", "BOM", "HYD"],
  };
}

export interface AirportPackage {
  id: string;
  title: string;
  desc: string;
  price: number;
  duration?: string;
  isRecommended?: boolean;
  includedServices?: string[];
  highlights?: string[];
}

export interface AirportService {
  id: string;
  title: string;
  desc: string;
  type: "package" | "direct";
  price?: number;
  packages?: AirportPackage[];
}

export function getAirportServices(airportCode: string): AirportService[] {
  const code = (airportCode || "DEL").toUpperCase().trim();
  const airport = getAirport(code);

  // 2. Ahmedabad (AMD) Dynamic Service Catalog
  if (code === "AMD") {
    return [
      {
        id: "meet_greet",
        title: "Master Airport VIP Packages",
        desc: "Dedicated host escort, baggage porter assistance, and expedited terminal arrival guidance.",
        type: "package",
        packages: [
          {
            id: "amd_gold",
            title: "Gold Concierge",
            desc: "Uniformed terminal host, baggage porter assistance, and curbside executive chauffeur handoff.",
            price: 6500,
            duration: "Up to 2 Hours",
            isRecommended: false,
            includedServices: [
              "Terminal Host Greeting",
              "Dedicated Baggage Porter",
              "Express Clearance Guidance",
              "Executive Chauffeur Handoff",
            ],
            highlights: ["Dedicated Terminal Escort", "Express Arrival Handoff"],
          },
          {
            id: "amd_elite",
            title: "Elite VIP Sanctuary",
            desc: "VIP Escort Host, Plaza Premium Lounge access with hot buffet, dedicated butler, and executive tarmac sedan.",
            price: 11500,
            duration: "Until Departure",
            isRecommended: true,
            includedServices: [
              "VIP Escort Host",
              "Plaza Premium Lounge Access & Dining",
              "Dedicated Butler Assist",
              "Executive Tarmac Vehicle Transfer",
              "Unlimited Baggage Assist",
            ],
            highlights: ["Most Popular Choice", "VIP Lounge Sanctuary", "Executive Tarmac Transfer"],
          },
        ],
      },
    ];
  }

  // 3. Delhi (DEL) Dynamic Service Catalog
  if (code === "DEL") {
    return [
      {
        id: "meet_greet",
        title: "Master Airport VIP Packages",
        desc: "Dedicated host escort from aerobridge, porter assist, and fast-track clearance.",
        type: "package",
        packages: [
          {
            id: "del_silver",
            title: "Silver Concierge",
            desc: "Aerobridge host welcome, dedicated baggage porterage, and expedited security escort.",
            price: 5500,
            duration: "Up to 2 Hours",
            isRecommended: false,
            includedServices: [
              "Aerobridge Host Welcome",
              "Dedicated Baggage Porterage",
              "Fast Track Security Escort",
              "Curbside Vehicle Handoff",
            ],
            highlights: ["Fast-Track Terminal Escort", "Uniformed Porter Service"],
          },
          {
            id: "del_gold",
            title: "Gold VIP Escort",
            desc: "Aerobridge host welcome, dedicated porter, diplomatic fast-track, Encalm VIP Lounge access, and electric buggy.",
            price: 9800,
            duration: "Up to 3 Hours",
            isRecommended: true,
            includedServices: [
              "Aerobridge Host Welcome",
              "Dedicated Baggage Porterage",
              "Diplomatic Fast Track Clearance",
              "Encalm VIP Lounge Suite Access",
              "Electric Airside Buggy Escort",
            ],
            highlights: ["Most Popular Choice", "Encalm Lounge Sanctuary", "Diplomatic Passport Control", "Airside Buggy"],
          },
          {
            id: "del_elite",
            title: "Elite VVIP Tarmac",
            desc: "Diplomatic protocol officer, unlimited porterage, private Maybach tarmac transfer, Encalm Privé VVIP suite.",
            price: 16500,
            duration: "Until Departure",
            isRecommended: false,
            includedServices: [
              "Personal Diplomatic Protocol Officer",
              "Unlimited Baggage Porterage",
              "Private Maybach Tarmac Sedan Transfer",
              "Encalm Privé VVIP Private Suite",
              "Full Flight Delay Monitoring & Baggage Retagging",
            ],
            highlights: ["VVIP Tarmac Maybach Sedan", "Encalm Privé Private Suite", "Dedicated Protocol Officer"],
          },
        ],
      },
    ];
  }

  // GAU production catalog is backend/database-authoritative. Do not invent frontend prices.
  if (code === "GAU") {
    return [];
  }

  // 4. Dynamic Fallback derived from airport metadata & facilities
  return [
    {
      id: "meet_greet",
      title: "Master Airport VIP Packages",
      desc: "Dedicated host escort, express queues bypass, and baggage porter service.",
      type: "package",
      packages: [
        {
          id: `${code.toLowerCase()}_silver`,
          title: "Silver Concierge",
          desc: "Uniformed host greeting, baggage porter assistance, and fast-track terminal guidance.",
          price: 5000,
          duration: "Up to 2 Hours",
          isRecommended: false,
          includedServices: [
            "Uniformed Host Greeting",
            "Dedicated Baggage Porter",
            "Express Terminal Escort",
            "Curbside Chauffeur Handoff",
          ],
          highlights: ["Terminal Escort", "Porter Service"],
        },
        {
          id: `${code.toLowerCase()}_gold`,
          title: "Gold VIP Escort",
          desc: "Aerobridge host welcome, baggage porter, VIP lounge sanctuary access, and fast-track clearance.",
          price: 9500,
          duration: "Up to 3 Hours",
          isRecommended: true,
          includedServices: [
            "Aerobridge Host Welcome",
            "Dedicated Baggage Porter",
            "VIP Lounge Sanctuary Access",
            "Fast-Track Passport Control",
            "Electric Buggy Assist",
          ],
          highlights: ["Most Popular Choice", "VIP Lounge Sanctuary", "Fast Track Clearance"],
        },
        {
          id: `${code.toLowerCase()}_elite`,
          title: "Elite VVIP Tarmac",
          desc: "Personal protocol officer, unlimited porterage, private tarmac luxury transfer, and private suite access.",
          price: 15500,
          duration: "Until Departure",
          isRecommended: false,
          includedServices: [
            "Personal Protocol Officer",
            "Unlimited Baggage Assist",
            "Private Tarmac Sedan Transfer",
            "VVIP Private Lounge Suite",
            "Flight Delay Monitoring",
          ],
          highlights: ["VVIP Tarmac Transfer", "Private Suite", "Personal Protocol Officer"],
        },
      ],
    },
  ];
}

