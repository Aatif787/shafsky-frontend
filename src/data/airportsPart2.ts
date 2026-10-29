import { ASSETS } from "@/lib/assets";
import type { Airport, Facility } from "./airports";

const chaarminar = ASSETS.charminar;
const golkunda = ASSETS.golkunda;
const imambada = ASSETS.imambada;
const indiagate = ASSETS.indiagate;
const redfort = ASSETS.redfort;
const clouds = ASSETS.clouds;
const interior = ASSETS.interior;
const jetTarmac = ASSETS.jetTarmac;
const lounge = ASSETS.lounge;
const hotel = ASSETS.hotel;
const vipTransport1 = ASSETS.vipTransport;
const cargo = ASSETS.cargo;
const medical = ASSETS.medical;
const vipConcierge = ASSETS.concierge;
const vipTransport2 = ASSETS.vipTransport2;
const vipTransport3 = ASSETS.vipTransport3;
const vipTransport4 = ASSETS.vipTransport4;
const vipTransport5 = ASSETS.vipTransport5;

// Airport cloud imagery
const dekAmdAir = ASSETS.amd;
const mobAmdAir = ASSETS.amd;
const dekHydAir = ASSETS.hyd;
const mobHydAir = ASSETS.hyd;
const dekJaiAir = ASSETS.jai;
const mobJaiAir = ASSETS.jai;
const dekAtqAir = ASSETS.atq;
const mobAtqAir = "/images/airports/atq/clean-2.webp";
const dekGauAir = ASSETS.gau;
const mobGauAir = ASSETS.gau;
const dekCokAir = ASSETS.cok;
const mobCokAir = ASSETS.cok;
const dekMaaAir = ASSETS.maa;
const mobMaaAir = ASSETS.maa;
const dekGoiAir = ASSETS.goi;
const mobGoiAir = ASSETS.goi;
const dekGoxAir = ASSETS.gox;
const mobGoxAir = ASSETS.gox;
const dekBbiAir = ASSETS.bbi;
const mobBbiAir = ASSETS.bbi;
const dekBlrAir = ASSETS.blr;
const mobBlrAir = ASSETS.blr;
const dekIxcAir = ASSETS.ixc;
const mobIxcAir = ASSETS.ixc;

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
  if (query.includes("charminar")) return "/images/airports/hyd/charminar.webp";
  if (query.includes("imambara") || query.includes("imambada") || query.includes("rumi darwaza")) {
    if (query.includes("rumi darwaza")) return "/images/airports/lko/rumi-darwaza.webp";
    if (query.includes("chota imambara")) return "/images/airports/lko/chota-imambara.webp";
    return "/images/airports/lko/bara-imambara.webp";
  }
  if (query.includes("india gate")) return "/images/airports/del/india-gate.webp";
  if (query.includes("red fort")) return "/images/airports/del/red-fort.webp";
  if (query.includes("golden temple")) return "/images/airports/atq/golden-temple.webp";
  if (query.includes("ram bagh") || query.includes("ranjit singh")) return "/images/airports/atq/ram-bagh-palace.webp";
  if (query.includes("gobindgarh")) return "/images/airports/atq/gobindgarh-fort.webp";
  if (query.includes("durgiana")) return "/images/airports/atq/durgiana-temple.webp";
  if (query.includes("wagah")) return "/images/airports/atq/wagah-border.webp";
  if (query.includes("parliament")) return "/images/airports/del/parliament-house.webp";
  if (query.includes("lal kila") || query.includes("lal qila")) return "/images/airports/del/red-fort.webp";
  if (query.includes("jama masjid")) return "/images/airports/del/jama-masjid.webp";
  if (query.includes("ananta vasudeva") || query.includes("ananta basudev")) return "/images/airports/bbi/ananta-vasudeva-temple.webp";
  if (query.includes("gateway of india")) return "/images/airports/bom/gateway-of-india.webp";
  if (query.includes("haji ali")) return "/images/airports/bom/haji-ali-dargah.webp";
  if (query.includes("cst") || query.includes("terminus")) return "/images/airports/bom/chhatrapati-shivaji-terminus.webp";
  if (query.includes("kursura") || query.includes("submarine")) return "/images/airports/vtz/ins-kursura-submarine-museum.webp";
  if (query.includes("kailasagiri")) return "/images/airports/vtz/kailasagiri-hill.webp";
  if (query.includes("yarada")) return "/images/airports/vtz/yarada-beach.webp";
  if (query.includes("rk beach")) return "/images/airports/vtz/rk-beach-promenade.webp";

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

export const u = (q: string) => getPhotoUrl(q, "w=3840&h=2160");
export const us = (q: string) => getPhotoUrl(q, "w=1920&h=1080");

export const baseFacilities: Facility[] = [
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

export const baseFAQ: [string, string][] = [
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
        { mode: "Taxi", fare: "Metered / App Rate", time: "30 min", availability: "24×7" },
        { mode: "Uber / Ola", fare: "App-Based Fare", time: "30 min", availability: "24×7" },
        { mode: "Car Rental", fare: "Daily Rate on Request", time: "On demand", availability: "24×7" },
        { mode: "Bus", fare: "Standard Transit Fare", time: "60 min", availability: "05:00 – 23:00" },
        { mode: "Parking", fare: "Standard Airport Rate", time: "—", availability: "24×7" },
        { mode: "Metro / Rail", fare: "Standard Transit Fare", time: "—", availability: "06:00 – 22:00" },
      ],
      hotels: [
        {
          name: "Taj " + a.city,
          stars: 5,
          distance: "10 km",
          price: "Live Rates on Request",
          img: us("taj hotel " + a.city),
        },
        {
          name: "ITC " + a.city,
          stars: 5,
          distance: "12 km",
          price: "Live Rates on Request",
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

export const AIRPORTS_PART2: Airport[] = [
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
    gallery: [chaarminar, golkunda, a.gallery[1], a.gallery[4], a.gallery[5]],
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
    slideshow: [
      "/images/airports/jai/jaipur.png",
      "/images/airports/jai/jai-airport-home.webp",
    ],
    gallery: [
      "/images/airports/jai/jaipur-airport-terminal.webp",
      "/images/airports/jai/hawa-mahal.webp",
      "/images/airports/jai/amber-fort.webp",
      a.gallery[0],
    ],
  })),
  ...buildCity({
    code: "ATQ",
    icao: "VIAR",
    city: "Amritsar",
    landmark: "Golden Temple",
    tagline: "The City of Gold & Historic Palaces",
    q1: "Golden Temple",
    q2: "Ram Bagh Palace",
    q3: "Gobindgarh Fort",
    airportName: "Sri Guru Ram Dass Jee International Airport",
    terminals: "1",
    annual: "2.5M",
    attr: [
      ["Golden Temple", "Golden Temple Amritsar", "Holiest Sikh gurdwara, 24-karat gold-leaf sanctum in the sacred Amrit Sarovar."],
      ["Ram Bagh Palace", "Maharaja Ranjit Singh Summer Palace", "Historic 19th-century royal Sikh palace set within lush Mughal charbagh gardens."],
      ["Gobindgarh Fort", "Gobindgarh Fort & Toshakhana", "18th-century grand royal citadel and Koh-i-Noor diamond treasury palace."],
      ["Durgiana Temple", "Durgiana Temple Lake Palace", "Silver and gold adorned marble sanctum rising from sacred waters."],
      ["Wagah Border", "Wagah Border ceremony", "Daily flag-lowering parade at the Indo-Pak Swarna Jayanti border."],
    ],
  }).map((a) => ({
    ...a,
    cover: dekAtqAir,
    mobCover: mobAtqAir,
    slideshow: [
      dekAtqAir,
      "/images/airports/atq/clean-2.webp",
      "/images/airports/atq/clean-3.webp",
      "/images/airports/atq/clean-4.webp",
      "/images/airports/atq/clean-5.webp",
      "/images/airports/atq/clean-6.webp",
      "/images/airports/atq/clean-7.webp",
    ],
    gallery: [
      dekAtqAir,
      "/images/airports/atq/clean-2.webp",
      "/images/airports/atq/clean-3.webp",
      "/images/airports/atq/clean-4.webp",
      "/images/airports/atq/clean-5.webp",
      "/images/airports/atq/clean-6.webp",
      "/images/airports/atq/clean-7.webp",
    ],
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
  }).map((a) => ({
    ...a,
    cover: dekBlrAir,
    mobCover: mobBlrAir,
    slideshow: [dekBlrAir],
    gallery: [dekBlrAir, mobBlrAir, a.gallery[0], a.gallery[1]],
  })),
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
      ["Kumbalangi Village", "Kumbalangi Village Kochi", "Acclaimed model ecotourism village with tranquil backwaters, rustic canoes, and Chinese nets."],
      ["Bolgatty Island & Marine Drive", "Bolgatty Island Marine Drive Kochi", "Scenic waterfront promenade and island palace where water meets the city skyline."],
      ["Kerala Folklore Museum", "Kerala Folklore Museum", "Three-floor architectural museum showcasing Kerala heritage and folk art."],
    ],
  }).map((a) => ({
    ...a,
    cover: dekCokAir,
    mobCover: mobCokAir,
    slideshow: [dekCokAir],
    gallery: [dekCokAir, "/images/airports/cok/clean-2.webp", "/images/airports/cok/clean-3.webp", "/images/airports/cok/clean-4.webp"],
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
    q2: "INS Kursura submarine",
    q3: "Kailasagiri Hill",
    airportName: "Visakhapatnam International Airport",
    terminals: "1",
    annual: "2.5M",
    attr: [
      ["Submarine Museum", "INS Kursura submarine", "Preserved Soviet-built Kalvari-class submarine museum on RK Beach."],
      ["Kailasagiri Hill", "Kailasagiri Hill Visakhapatnam", "Scenic hilltop park with 40-foot statues of Shiva and Parvathi overlooking the coast."],
      ["Yarada Beach", "Yarada Beach Visakhapatnam", "Golden sand beach bordered by hills on three sides and the Bay of Bengal."],
      ["RK Beach Promenade", "RK Beach Visakhapatnam", "Iconic coastal promenade with ocean breeze and Dolphin's Nose views."],
    ],
  }).map((a) => ({
    ...a,
    cover: "/images/airports/vtz/visakhapatnam-airport-terminal.webp",
    mobCover: "/images/airports/vtz/visakhapatnam-airport-terminal.webp",
    slideshow: ["/images/airports/vtz/visakhapatnam-airport-terminal.webp"],
    gallery: [
      "/images/airports/vtz/visakhapatnam-airport-terminal.webp",
      "/images/airports/vtz/ins-kursura-submarine-museum.webp",
      "/images/airports/vtz/kailasagiri-hill.webp",
      "/images/airports/vtz/yarada-beach.webp",
      "/images/airports/vtz/rk-beach-promenade.webp",
    ],
  })),
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
      ["Ananta Vasudeva Temple", "Ananta Vasudeva Temple Bhubaneswar", "13th-century Vaishnavite sanctuary dedicated to Krishna and Balarama, built in exquisite Kalinga stone architecture."],
      ["Lingaraj Temple", "Lingaraj Temple Bhubaneswar", "11th-century monument dedicated to Lord Shiva, the pinnacle of Kalinga architecture."],
      ["Mukteswar Temple", "Mukteswar Temple Bhubaneswar", "10th-century gem of Odishan architecture famed for its ornate torana arched gateway."],
      ["Rajarani Temple", "Rajarani Temple Bhubaneswar", "11th-century temple celebrated for its delicate stone sculptures and love-carved spires."],
      ["Udayagiri Caves", "Udayagiri & Khandagiri Caves", "Ancient rock-cut caves with historic Jain monastic chambers and royal inscriptions."],
      ["Dhauli Shanti Stupa", "Dhauli Stupa", "Gleaming white peace pagoda by the Daya River marking Emperor Ashoka's path to Buddhism."],
      ["Nandankanan Zoological Park", "Nandankanan Bhubaneswar", "World-renowned white tiger safari, serene Kanjia lake, and lush botanical sanctuary."]
    ]
  }).map((a) => ({
    ...a,
    cover: dekBbiAir,
    mobCover: mobBbiAir,
    slideshow: ["/images/airports/bbi/bbi-airport-home.webp"],
    gallery: [
      "/images/airports/bbi/bhubaneswar-bpia-terminal.webp",
      "/images/airports/bbi/ananta-vasudeva-temple.webp",
      "/images/airports/bbi/lingaraj-temple.webp",
      "/images/airports/bbi/mukteswar-temple.webp",
      a.gallery[0],
    ],
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
  }).map((a) => ({
    ...a,
    cover: dekIxcAir,
    mobCover: mobIxcAir,
    slideshow: [dekIxcAir],
    gallery: [dekIxcAir, mobIxcAir, a.gallery[0], a.gallery[1]],
  })),
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
  const gau = AIRPORTS_PART2.find((a) => a.code === "GAU");
  if (gau) {
    gau.cover = dekGauAir;
    gau.mobCover = mobGauAir;
    gau.slideshow = [dekGauAir, mobGauAir, ...gau.slideshow.slice(2)];
  }
}
