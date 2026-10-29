// Premium destination dataset for Shafsky Aviation Services Airport Explorer.
// Images sourced from Unsplash featured (stable redirect) — keyed by landmark queries.

import { ASSETS } from "@/lib/assets";
import { getAirportHeroImages, getAirportImages } from "@/lib/airport-assets";
import { AIRPORT_REGISTRY } from "./airportRegistry";
import { getCsvAirport } from "@/lib/airportsCsv";
import { u, us, baseFacilities, baseFAQ, AIRPORTS_PART2 } from "./airportsPart2";

const imambada = ASSETS.imambada;
const dekDelAir = ASSETS.del;
const mobDelAir = ASSETS.del;
const dekMumAir = ASSETS.bom;
const dekLkoAir = ASSETS.lko;
const mobLkoAir = ASSETS.lko;

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
    slideshow: [dekLkoAir, imambada],
    gallery: [
      dekLkoAir,
      imambada,
      us("Lucknow Clock Tower"),
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
        img: imambada,
        desc: "18th-century Asafi mosque complex with the labyrinthine Bhulbhulaiya.",
        distance: "16 km",
        travel: "35 min",
        hours: "06:00 – 17:00",
        fee: "Standard Entry Fee",
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
        fee: "Standard Entry Fee",
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
      { mode: "Metro", fare: "Standard Transit Fare", time: "25 min to centre", availability: "06:00 – 22:00" },
      { mode: "Taxi", fare: "Metered / App Rate", time: "30 min", availability: "24×7" },
      { mode: "Uber / Ola", fare: "App-Based Fare", time: "30 min", availability: "24×7" },
      { mode: "Car Rental", fare: "Daily Rate on Request", time: "On demand", availability: "24×7" },
      { mode: "Bus", fare: "Standard Transit Fare", time: "55 min", availability: "05:00 – 23:00" },
      { mode: "Parking", fare: "Standard Airport Rate", time: "—", availability: "24×7" },
    ],
    hotels: [
      {
        name: "Taj Mahal Lucknow",
        stars: 5,
        distance: "14 km",
        price: "Live Rates on Request",
        img: us("luxury hotel suite"),
      },
      {
        name: "Hyatt Regency",
        stars: 5,
        distance: "10 km",
        price: "Live Rates on Request",
        img: us("hyatt hotel lobby"),
      },
      {
        name: "Renaissance",
        stars: 5,
        distance: "12 km",
        price: "Live Rates on Request",
        img: us("renaissance hotel"),
      },
      {
        name: "Lebua Lucknow",
        stars: 5,
        distance: "13 km",
        price: "Live Rates on Request",
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
    slideshow: [
      "/images/airports/del/clean-8.webp",
      "/images/airports/del/clean-3.webp",
      "/images/airports/del/clean-4.webp",
      "/images/airports/del/clean-7.webp",
    ],
    gallery: [
      "/images/airports/del/clean-8.webp",
      "/images/airports/del/clean-3.webp",
      "/images/airports/del/clean-4.webp",
      "/images/airports/del/clean-7.webp",
      "/images/airports/del/clean-1.webp",
      "/images/airports/del/clean-2.webp",
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
        name: "Parliament House (Samvidhan Sadan)",
        img: "/images/airports/del/clean-8.webp",
        desc: "The monumental architectural seat of Indian democracy and national heritage.",
        distance: "14 km",
        travel: "25 min",
        hours: "09:00 – 17:00",
        fee: "Guided Tour",
        photo: "Illuminated colonnade & facade",
        maps: "https://maps.google.com/?q=Parliament+House+New+Delhi",
      },
      {
        name: "India Gate",
        img: "/images/airports/del/clean-3.webp",
        desc: "42-m war memorial arch on Kartavya Path honouring soldiers of the Indian Army.",
        distance: "16 km",
        travel: "30 min",
        hours: "Open 24h",
        fee: "Free",
        photo: "Twilight, long exposure",
        maps: "https://maps.google.com/?q=India+Gate",
      },
      {
        name: "Red Fort (Lal Qila)",
        img: "/images/airports/del/clean-4.webp",
        desc: "Historic 17th-century Mughal red sandstone citadel and imperial palace complex.",
        distance: "20 km",
        travel: "35 min",
        hours: "09:30 – 16:30",
        fee: "Standard Entry Fee",
        photo: "Lahori Gate & red sandstone ramparts",
        maps: "https://maps.google.com/?q=Red+Fort+Delhi",
      },
      {
        name: "Jama Masjid",
        img: "/images/airports/del/clean-7.webp",
        desc: "Magnificent 17th-century Mughal congregational mosque with vast courtyard and marble minarets.",
        distance: "19 km",
        travel: "35 min",
        hours: "07:00 – 18:30",
        fee: "Free",
        photo: "Grand courtyard & sandstone domes",
        maps: "https://maps.google.com/?q=Jama+Masjid+Delhi",
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
        fare: "Standard Transit Fare",
        time: "20 min to centre",
        availability: "04:45 – 23:30",
      },
      { mode: "Prepaid Taxi", fare: "Fixed Terminal Rate", time: "35 min", availability: "24×7" },
      { mode: "Uber Premier", fare: "App-Based Fare", time: "35 min", availability: "24×7" },
      { mode: "Car Rental", fare: "Daily Rate on Request", time: "On demand", availability: "24×7" },
      { mode: "DTC Bus", fare: "Standard Transit Fare", time: "60 min", availability: "05:00 – 23:00" },
      { mode: "Multi-level Parking", fare: "Standard Airport Rate", time: "—", availability: "24×7" },
    ],
    hotels: [
      {
        name: "The Leela Palace",
        stars: 5,
        distance: "14 km",
        price: "Live Rates on Request",
        img: us("leela palace"),
      },
      {
        name: "The Oberoi",
        stars: 5,
        distance: "16 km",
        price: "Live Rates on Request",
        img: us("oberoi hotel"),
      },
      {
        name: "Taj Mahal Hotel",
        stars: 5,
        distance: "18 km",
        price: "Live Rates on Request",
        img: us("taj mahal hotel delhi"),
      },
      {
        name: "Andaz Aerocity",
        stars: 5,
        distance: "3 km",
        price: "Live Rates on Request",
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
        name: "Haji Ali Dargah",
        img: "/images/airports/bom/clean-4.webp",
        desc: "Historic 15th-century Indo-Islamic shrine and mosque set on an islet in the Arabian Sea.",
        distance: "18 km",
        travel: "40 min",
        hours: "05:30 – 22:00",
        fee: "Free",
        photo: "Causeway islet view",
        maps: "https://maps.google.com/?q=Haji+Ali+Dargah+Mumbai",
      },
      {
        name: "Elephanta Caves",
        img: us("Elephanta Caves"),
        desc: "UNESCO 5th-century rock-cut Shiva temples.",
        distance: "30 km + ferry",
        travel: "1.5 hrs",
        hours: "09:00 – 17:00",
        fee: "Standard Entry Fee",
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
        fare: "Standard Transit Fare",
        time: "30 min to centre",
        availability: "06:00 – 22:30",
      },
      { mode: "Cool Cab", fare: "Metered Rate", time: "60 min", availability: "24×7" },
      { mode: "Uber Black", fare: "App-Based Rate", time: "55 min", availability: "24×7" },
      { mode: "Car Rental", fare: "Daily Rate on Request", time: "On demand", availability: "24×7" },
      { mode: "BEST Bus", fare: "Standard Transit Fare", time: "90 min", availability: "05:00 – 24:00" },
      { mode: "Valet Parking", fare: "Standard Valet Rate", time: "—", availability: "24×7" },
    ],
    hotels: [
      {
        name: "Taj Mahal Palace",
        stars: 5,
        distance: "23 km",
        price: "Live Rates on Request",
        img: us("taj palace mumbai"),
      },
      {
        name: "The Oberoi Mumbai",
        stars: 5,
        distance: "22 km",
        price: "Live Rates on Request",
        img: us("oberoi mumbai"),
      },
      {
        name: "Trident BKC",
        stars: 5,
        distance: "8 km",
        price: "Live Rates on Request",
        img: us("trident hotel"),
      },
      {
        name: "JW Marriott Juhu",
        stars: 5,
        distance: "6 km",
        price: "Live Rates on Request",
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
  ...AIRPORTS_PART2,
];

export function getAirport(code: string): Airport {
  const upperCode = (code || "").toUpperCase().trim();
  const found = AIRPORTS.find((a) => a.code.toUpperCase() === upperCode);
  if (found) {
    const hubImgs = getAirportImages(found.code);
    const heroImgs = getAirportHeroImages(found.code);
    if (hubImgs && hubImgs.length > 0) {
      const homeImgs = heroImgs.length > 0 ? heroImgs : hubImgs;
      return {
        ...found,
        cover: homeImgs[0],
        mobCover: homeImgs[0],
        slideshow: homeImgs,
        gallery: [...hubImgs, ...found.gallery.filter((g) => !hubImgs.includes(g))],
      };
    }
    return found;
  }

  // Check CSV dataset loaded from airports.csv first
  const csvItem = getCsvAirport(upperCode);

  // Check AIRPORT_REGISTRY or fallback lookup for all global airports
  const reg = AIRPORT_REGISTRY[upperCode];
  const cityName = csvItem?.city || reg?.city || upperCode;
  const countryName = csvItem?.country || reg?.country || "International";
  const airportName = csvItem?.name || reg?.name || `${cityName} International Airport`;

  const hubImgs = getAirportImages(upperCode);
  const fallbackCover =
    csvItem?.cover ||
    hubImgs[0] ||
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=95";
  const effectiveSlideshow =
    hubImgs.length > 0
      ? hubImgs
      : [
          fallbackCover,
          "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=95",
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=95",
        ];

  return {
    code: upperCode,
    icao: reg?.icao || `V${upperCode}`,
    city: cityName,
    country: countryName,
    countryCode: csvItem?.countryCode || reg?.countryCode || (countryName === "India" ? "IN" : "US"),
    landmark: "VIP Airport Terminal",
    tagline: `Premier Gateway to ${cityName}`,
    timezone: csvItem?.timezone || reg?.timezone || "Asia/Kolkata",
    cover: fallbackCover,
    mobCover: fallbackCover,
    slideshow: effectiveSlideshow,
    gallery: effectiveSlideshow,
    videoId: "5qap5aO4i9A",
    about: `${airportName} (${upperCode}) serves as a primary aviation hub connecting ${cityName}, ${countryName} with major domestic and international destinations. Shafsky Aviation Services provides full VVIP airside escorts, Meet & Greet, fast-track customs clearance, and chauffeured transit at this hub.`,
    bestTime: "Year-Round",
    languages: "English, Local Official Languages",
    currency: countryName === "India" ? "INR (₹)" : "USD ($)",
    business: "Aviation, Commerce, International Travel",
    tourism: "Cultural Landmarks, Heritage Sites, Business Centers",
    climate: "Subtropical / Temperate",
    safety: "Strict Airport Security Standards",
    emergency: "24/7 Operations Desk Active",
    visa: "Standard International Entry & Visa Rules",
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
        price: "Live Rates on Request",
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

export function getAirportServices(_airportCode: string): AirportService[] {
  // Authoritative airport services and packages are loaded dynamically from the live database API (/api/journey/airports/:code/services or /api/airport/services).
  return [];
}
