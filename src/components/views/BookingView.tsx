import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Plane,
  User,
  FileText,
  CheckCircle2,
  ChevronDown,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Building2,
  Upload,
  Loader2,
  ShieldCheck,
  Search,
  ArrowRight,
  Check,
  AlertCircle,
  Users,
  Package,
  Sparkles,
  Crown,
  Ticket,
  Car,
  HeartPulse,
  Hotel,
  Plus,
  Minus,
  PlaneTakeoff,
  PlaneLanding,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createBooking } from "@/lib/bookings.functions";
import { checkBookingEligibility } from "@/services/flight/FlightTimeUtils";
import { FlightDurationResolver, type DurationSource } from "@/services/flight/FlightDurationResolver";
import { toast } from "sonner";
import {
  creamTheme,
  PageContainer,
  RouteTopbar,
  pageDisplay,
  pageMono,
  Eyebrow,
} from "@/components/site/PageShell";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { format, parseISO, isValid } from "date-fns";
import { z } from "zod";
import { AIRPORTS } from "@/data/airports";
import { parsePhoneNumberFromString, AsYouType, type CountryCode } from "libphonenumber-js";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

// Service images
import lounge from "@/assets/lounge.png";
import vipTransport1 from "@/assets/vip-transport-1.png";
import vipTransport2 from "@/assets/vip-transport-2.png";
import hotelImg from "@/assets/hotel.png";
import fastTrackImg from "@/assets/fast-track.png";
import meetGreetImg from "@/assets/meet-greet.png";
import cargoAssistImg from "@/assets/cargo-assist.png";

/* ───────────────────── Route Definition ───────────────────── */

/* ───────────────────── Types ───────────────────── */

interface FlightDetails {
  flightNum: string;
  originCode: string;
  originCity: string;
  destCode: string;
  destCity: string;
  depTime: string;
  arrTime: string;
  depDate: string;
  arrDate: string;
  duration: string;
  durationSource?: DurationSource;
  depTerminal: string;
  arrTerminal: string;
  rawDepTime?: string;
  rawArrTime?: string;
  eligibility?: {
    isBookable: boolean;
    remainingTimeHours: number;
    blockingMessage?: string;
  };
  carrierName?: string;
  carrierIata?: string;
  aircraftModel?: string;
  status?: string;
  isManual?: boolean;
  originTimezone?: string;
  destTimezone?: string;
  lastUpdated?: string;
}

interface ServiceItem {
  id: string;
  title: string;
  desc: string;
  price: number;
  img: string;
}

/* ───────────────────── Catalog Services ───────────────────── */

const DEPARTURE_SERVICES: ServiceItem[] = [
  {
    id: "dep_meet_greet",
    title: "Meet & Greet Concierge",
    desc: "Uniformed host greets you at terminal entrance and escorts you through security.",
    price: 12000,
    img: meetGreetImg,
  },
  {
    id: "dep_porter",
    title: "Baggage Porter Service",
    desc: "Personal porter collects luggage from curbside to check-in counter.",
    price: 4800,
    img: cargoAssistImg,
  },
  {
    id: "dep_fast_track",
    title: "Fast-Track Security",
    desc: "Bypass airport queues with priority security and immigration clearances.",
    price: 7500,
    img: fastTrackImg,
  },
  {
    id: "dep_chauffeur",
    title: "Luxury Tarmac Transfer",
    desc: "Private transfer directly to aircraft steps in a premium sedan.",
    price: 14000,
    img: vipTransport1,
  },
  {
    id: "dep_lounge",
    title: "First Class Lounge Access",
    desc: "Enjoy private rest suites, premium dining, and showers pre-flight.",
    price: 9500,
    img: lounge,
  },
  {
    id: "dep_hotel",
    title: "Luxury Hotel Handoff",
    desc: "Direct hotel-to-tarmac coordination and check-in assistance.",
    price: 18000,
    img: hotelImg,
  },
];

const ARRIVAL_SERVICES: ServiceItem[] = [
  {
    id: "arr_meet_greet",
    title: "Gate Escort & Assistance",
    desc: "Dedicated host meets you at flight bridge and guides you through arrival.",
    price: 12000,
    img: meetGreetImg,
  },
  {
    id: "arr_porter",
    title: "Baggage Porter Service",
    desc: "Personal porter collects luggage from carousel to chauffeur vehicles.",
    price: 4800,
    img: cargoAssistImg,
  },
  {
    id: "arr_fast_track",
    title: "Immigration Priority Lane",
    desc: "Expedited arrival customs and immigration priority credentials.",
    price: 7500,
    img: fastTrackImg,
  },
  {
    id: "arr_chauffeur",
    title: "Curbside Chauffeur Transfer",
    desc: "Private Mercedes S-Class transfer from terminal to your destination.",
    price: 14000,
    img: vipTransport2,
  },
  {
    id: "arr_lounge",
    title: "Arrival Suite Access",
    desc: "Refresh upon landing in a private suite with bespoke catering.",
    price: 9500,
    img: lounge,
  },
  {
    id: "arr_hotel",
    title: "Luxury Hotel Handoff",
    desc: "Direct tarmac-to-hotel check-in and transport coordination.",
    price: 18000,
    img: hotelImg,
  },
];

interface Country {
  code: string;
  dial: string;
  name: string;
}

const COUNTRIES: Country[] = [
  { code: "AF", dial: "+93", name: "Afghanistan" },
  { code: "AL", dial: "+355", name: "Albania" },
  { code: "DZ", dial: "+213", name: "Algeria" },
  { code: "AS", dial: "+1-684", name: "American Samoa" },
  { code: "AD", dial: "+376", name: "Andorra" },
  { code: "AO", dial: "+244", name: "Angola" },
  { code: "AI", dial: "+1-264", name: "Anguilla" },
  { code: "AG", dial: "+1-268", name: "Antigua and Barbuda" },
  { code: "AR", dial: "+54", name: "Argentina" },
  { code: "AM", dial: "+374", name: "Armenia" },
  { code: "AW", dial: "+297", name: "Aruba" },
  { code: "AU", dial: "+61", name: "Australia" },
  { code: "AT", dial: "+43", name: "Austria" },
  { code: "AZ", dial: "+994", name: "Azerbaijan" },
  { code: "BS", dial: "+1-242", name: "Bahamas" },
  { code: "BH", dial: "+973", name: "Bahrain" },
  { code: "BD", dial: "+880", name: "Bangladesh" },
  { code: "BB", dial: "+1-246", name: "Barbados" },
  { code: "BY", dial: "+375", name: "Belarus" },
  { code: "BE", dial: "+32", name: "Belgium" },
  { code: "BZ", dial: "+501", name: "Belize" },
  { code: "BJ", dial: "+229", name: "Benin" },
  { code: "BM", dial: "+1-441", name: "Bermuda" },
  { code: "BT", dial: "+975", name: "Bhutan" },
  { code: "BO", dial: "+591", name: "Bolivia" },
  { code: "BA", dial: "+387", name: "Bosnia and Herzegovina" },
  { code: "BW", dial: "+267", name: "Botswana" },
  { code: "BR", dial: "+55", name: "Brazil" },
  { code: "IO", dial: "+246", name: "British Indian Ocean Territory" },
  { code: "VG", dial: "+1-284", name: "British Virgin Islands" },
  { code: "BN", dial: "+673", name: "Brunei" },
  { code: "BG", dial: "+359", name: "Bulgaria" },
  { code: "BF", dial: "+226", name: "Burkina Faso" },
  { code: "BI", dial: "+257", name: "Burundi" },
  { code: "KH", dial: "+855", name: "Cambodia" },
  { code: "CM", dial: "+237", name: "Cameroon" },
  { code: "CA", dial: "+1", name: "Canada" },
  { code: "CV", dial: "+238", name: "Cape Verde" },
  { code: "KY", dial: "+1-345", name: "Cayman Islands" },
  { code: "CF", dial: "+236", name: "Central African Republic" },
  { code: "TD", dial: "+235", name: "Chad" },
  { code: "CL", dial: "+56", name: "Chile" },
  { code: "CN", dial: "+86", name: "China" },
  { code: "CX", dial: "+61", name: "Christmas Island" },
  { code: "CC", dial: "+61", name: "Cocos Islands" },
  { code: "CO", dial: "+57", name: "Colombia" },
  { code: "KM", dial: "+269", name: "Comoros" },
  { code: "CK", dial: "+682", name: "Cook Islands" },
  { code: "CR", dial: "+506", name: "Costa Rica" },
  { code: "HR", dial: "+385", name: "Croatia" },
  { code: "CU", dial: "+53", name: "Cuba" },
  { code: "CW", dial: "+599", name: "Curaçao" },
  { code: "CY", dial: "+357", name: "Cyprus" },
  { code: "CZ", dial: "+420", name: "Czech Republic" },
  { code: "CD", dial: "+243", name: "Democratic Republic of the Congo" },
  { code: "DK", dial: "+45", name: "Denmark" },
  { code: "DJ", dial: "+253", name: "Djibouti" },
  { code: "DM", dial: "+1-767", name: "Dominica" },
  { code: "DO", dial: "+1-809", name: "Dominican Republic" },
  { code: "EC", dial: "+593", name: "Ecuador" },
  { code: "EG", dial: "+20", name: "Egypt" },
  { code: "SV", dial: "+503", name: "El Salvador" },
  { code: "GQ", dial: "+240", name: "Equatorial Guinea" },
  { code: "ER", dial: "+291", name: "Eritrea" },
  { code: "EE", dial: "+372", name: "Estonia" },
  { code: "SZ", dial: "+268", name: "Eswatini" },
  { code: "ET", dial: "+251", name: "Ethiopia" },
  { code: "FK", dial: "+500", name: "Falkland Islands" },
  { code: "FO", dial: "+298", name: "Faroe Islands" },
  { code: "FJ", dial: "+679", name: "Fiji" },
  { code: "FI", dial: "+358", name: "Finland" },
  { code: "FR", dial: "+33", name: "France" },
  { code: "GF", dial: "+594", name: "French Guiana" },
  { code: "PF", dial: "+689", name: "French Polynesia" },
  { code: "GA", dial: "+241", name: "Gabon" },
  { code: "GM", dial: "+220", name: "Gambia" },
  { code: "GE", dial: "+995", name: "Georgia" },
  { code: "DE", dial: "+49", name: "Germany" },
  { code: "GH", dial: "+233", name: "Ghana" },
  { code: "GI", dial: "+350", name: "Gibraltar" },
  { code: "GR", dial: "+30", name: "Greece" },
  { code: "GL", dial: "+299", name: "Greenland" },
  { code: "GD", dial: "+1-473", name: "Grenada" },
  { code: "GP", dial: "+590", name: "Guadeloupe" },
  { code: "GU", dial: "+1-671", name: "Guam" },
  { code: "GT", dial: "+502", name: "Guatemala" },
  { code: "GG", dial: "+44", name: "Guernsey" },
  { code: "GN", dial: "+224", name: "Guinea" },
  { code: "GW", dial: "+245", name: "Guinea-Bissau" },
  { code: "GY", dial: "+592", name: "Guyana" },
  { code: "HT", dial: "+509", name: "Haiti" },
  { code: "HN", dial: "+504", name: "Honduras" },
  { code: "HK", dial: "+852", name: "Hong Kong" },
  { code: "HU", dial: "+36", name: "Hungary" },
  { code: "IS", dial: "+354", name: "Iceland" },
  { code: "IN", dial: "+91", name: "India" },
  { code: "ID", dial: "+62", name: "Indonesia" },
  { code: "IR", dial: "+98", name: "Iran" },
  { code: "IQ", dial: "+964", name: "Iraq" },
  { code: "IE", dial: "+353", name: "Ireland" },
  { code: "IM", dial: "+44", name: "Isle of Man" },
  { code: "IL", dial: "+972", name: "Israel" },
  { code: "IT", dial: "+39", name: "Italy" },
  { code: "JM", dial: "+1-876", name: "Jamaica" },
  { code: "JP", dial: "+81", name: "Japan" },
  { code: "JE", dial: "+44", name: "Jersey" },
  { code: "JO", dial: "+962", name: "Jordan" },
  { code: "KZ", dial: "+7", name: "Kazakhstan" },
  { code: "KE", dial: "+254", name: "Kenya" },
  { code: "KI", dial: "+686", name: "Kiribati" },
  { code: "KP", dial: "+850", name: "North Korea" },
  { code: "KR", dial: "+82", name: "South Korea" },
  { code: "KW", dial: "+965", name: "Kuwait" },
  { code: "KG", dial: "+996", name: "Kyrgyzstan" },
  { code: "LA", dial: "+856", name: "Laos" },
  { code: "LV", dial: "+371", name: "Latvia" },
  { code: "LB", dial: "+961", name: "Lebanon" },
  { code: "LS", dial: "+266", name: "Lesotho" },
  { code: "LR", dial: "+231", name: "Liberia" },
  { code: "LY", dial: "+218", name: "Libya" },
  { code: "LI", dial: "+423", name: "Liechtenstein" },
  { code: "LT", dial: "+370", name: "Lithuania" },
  { code: "LU", dial: "+352", name: "Luxembourg" },
  { code: "MO", dial: "+853", name: "Macau" },
  { code: "MG", dial: "+261", name: "Madagascar" },
  { code: "MW", dial: "+265", name: "Malawi" },
  { code: "MY", dial: "+60", name: "Malaysia" },
  { code: "MV", dial: "+960", name: "Maldives" },
  { code: "ML", dial: "+223", name: "Mali" },
  { code: "MT", dial: "+356", name: "Malta" },
  { code: "MH", dial: "+692", name: "Marshall Islands" },
  { code: "MQ", dial: "+596", name: "Martinique" },
  { code: "MR", dial: "+222", name: "Mauritania" },
  { code: "MU", dial: "+230", name: "Mauritius" },
  { code: "YT", dial: "+262", name: "Mayotte" },
  { code: "MX", dial: "+52", name: "Mexico" },
  { code: "FM", dial: "+691", name: "Micronesia" },
  { code: "MD", dial: "+373", name: "Moldova" },
  { code: "MC", dial: "+377", name: "Monaco" },
  { code: "MN", dial: "+976", name: "Mongolia" },
  { code: "ME", dial: "+382", name: "Montenegro" },
  { code: "MS", dial: "+1-664", name: "Montserrat" },
  { code: "MA", dial: "+212", name: "Morocco" },
  { code: "MZ", dial: "+258", name: "Mozambique" },
  { code: "MM", dial: "+95", name: "Myanmar" },
  { code: "NA", dial: "+264", name: "Namibia" },
  { code: "NR", dial: "+674", name: "Nauru" },
  { code: "NP", dial: "+977", name: "Nepal" },
  { code: "NL", dial: "+31", name: "Netherlands" },
  { code: "NC", dial: "+687", name: "New Caledonia" },
  { code: "NZ", dial: "+64", name: "New Zealand" },
  { code: "NI", dial: "+505", name: "Nicaragua" },
  { code: "NE", dial: "+227", name: "Niger" },
  { code: "NG", dial: "+234", name: "Nigeria" },
  { code: "NU", dial: "+683", name: "Niue" },
  { code: "NF", dial: "+672", name: "Norfolk Island" },
  { code: "MP", dial: "+1-670", name: "Northern Mariana Islands" },
  { code: "NO", dial: "+47", name: "Norway" },
  { code: "OM", dial: "+968", name: "Oman" },
  { code: "PK", dial: "+92", name: "Pakistan" },
  { code: "PW", dial: "+680", name: "Palau" },
  { code: "PS", dial: "+970", name: "Palestine" },
  { code: "PA", dial: "+507", name: "Panama" },
  { code: "PG", dial: "+675", name: "Papua New Guinea" },
  { code: "PY", dial: "+595", name: "Paraguay" },
  { code: "PE", dial: "+51", name: "Peru" },
  { code: "PH", dial: "+63", name: "Philippines" },
  { code: "PN", dial: "+64", name: "Pitcairn" },
  { code: "PL", dial: "+48", name: "Poland" },
  { code: "PT", dial: "+351", name: "Portugal" },
  { code: "PR", dial: "+1-787", name: "Puerto Rico" },
  { code: "QA", dial: "+974", name: "Qatar" },
  { code: "CG", dial: "+242", name: "Republic of the Congo" },
  { code: "RE", dial: "+262", name: "Réunion" },
  { code: "RO", dial: "+40", name: "Romania" },
  { code: "RU", dial: "+7", name: "Russia" },
  { code: "RW", dial: "+250", name: "Rwanda" },
  { code: "WS", dial: "+685", name: "Samoa" },
  { code: "SM", dial: "+378", name: "San Marino" },
  { code: "ST", dial: "+239", name: "Sao Tome and Principe" },
  { code: "SA", dial: "+966", name: "Saudi Arabia" },
  { code: "SN", dial: "+221", name: "Senegal" },
  { code: "RS", dial: "+381", name: "Serbia" },
  { code: "SC", dial: "+248", name: "Seychelles" },
  { code: "SL", dial: "+232", name: "Sierra Leone" },
  { code: "SG", dial: "+65", name: "Singapore" },
  { code: "SX", dial: "+1-721", name: "Sint Maarten" },
  { code: "SK", dial: "+421", name: "Slovakia" },
  { code: "SI", dial: "+386", name: "Slovenia" },
  { code: "SB", dial: "+677", name: "Solomon Islands" },
  { code: "SO", dial: "+252", name: "Somalia" },
  { code: "ZA", dial: "+27", name: "South Africa" },
  { code: "SS", dial: "+211", name: "South Sudan" },
  { code: "ES", dial: "+34", name: "Spain" },
  { code: "LK", dial: "+94", name: "Sri Lanka" },
  { code: "SD", dial: "+249", name: "Sudan" },
  { code: "SR", dial: "+597", name: "Suriname" },
  { code: "SE", dial: "+46", name: "Sweden" },
  { code: "CH", dial: "+41", name: "Switzerland" },
  { code: "SY", dial: "+963", name: "Syria" },
  { code: "TW", dial: "+886", name: "Taiwan" },
  { code: "TJ", dial: "+992", name: "Tajikistan" },
  { code: "TZ", dial: "+255", name: "Tanzania" },
  { code: "TH", dial: "+66", name: "Thailand" },
  { code: "TG", dial: "+228", name: "Togo" },
  { code: "TK", dial: "+690", name: "Tokelau" },
  { code: "TO", dial: "+676", name: "Tonga" },
  { code: "TT", dial: "+1-868", name: "Trinidad and Tobago" },
  { code: "TN", dial: "+216", name: "Tunisia" },
  { code: "TR", dial: "+90", name: "Turkey" },
  { code: "TM", dial: "+993", name: "Turkmenistan" },
  { code: "TC", dial: "+1-649", name: "Turks and Caicos Islands" },
  { code: "TV", dial: "+688", name: "Tuvalu" },
  { code: "UG", dial: "+256", name: "Uganda" },
  { code: "UA", dial: "+380", name: "Ukraine" },
  { code: "AE", dial: "+971", name: "United Arab Emirates" },
  { code: "GB", dial: "+44", name: "United Kingdom" },
  { code: "US", dial: "+1", name: "United States" },
  { code: "UY", dial: "+598", name: "Uruguay" },
  { code: "UZ", dial: "+998", name: "Uzbekistan" },
  { code: "VU", dial: "+678", name: "Vanuatu" },
  { code: "VE", dial: "+58", name: "Venezuela" },
  { code: "VN", dial: "+84", name: "Vietnam" },
  { code: "WF", dial: "+681", name: "Wallis and Futuna" },
  { code: "YE", dial: "+967", name: "Yemen" },
  { code: "ZM", dial: "+260", name: "Zambia" },
  { code: "ZW", dial: "+263", name: "Zimbabwe" },
];

const getFlagEmoji = (countryCode: string) => {
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return "🌐";
  }
};

/* ───────────────────── Helpers ───────────────────── */

const validateFlightFormat = (num: string) => {
  const cleaned = num.trim().toUpperCase().replace(/\s+/g, "");
  if (!cleaned) return "Flight number is required.";
  if (cleaned.length < 3) return "Flight number must be at least 3 characters.";
  const pattern = /^[A-Z0-9]{2,4}\d{1,4}$/;
  if (!pattern.test(cleaned)) {
    return "Invalid format. Use standard patterns (e.g. AI9811, 6E205, EK501).";
  }
  return "";
};

const extractTime24h = (isoString: string | undefined): string => {
  if (!isoString) return "";
  try {
    const tIndex = isoString.indexOf("T");
    if (tIndex !== -1) {
      return isoString.substring(tIndex + 1, tIndex + 6);
    }
  } catch (e) {
    console.error("Failed to extract time from ISO string:", e);
  }
  return "";
};

const formatDateString = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    if (!isNaN(d.getTime())) {
      return format(d, "MMMM d, yyyy");
    }
  } catch (e) {
    console.error(e);
  }
  return isoString;
};

const calculateDuration = (depTimeStr?: string, arrTimeStr?: string): string => {
  if (!depTimeStr || !arrTimeStr) return "Flight duration unavailable";
  try {
    const dep = new Date(depTimeStr);
    const arr = new Date(arrTimeStr);
    if (!isNaN(dep.getTime()) && !isNaN(arr.getTime())) {
      const diffMs = arr.getTime() - dep.getTime();
      if (diffMs > 0) {
        const totalMins = Math.floor(diffMs / 60000);
        const hrs = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        if (hrs > 0 && mins > 0) {
          return `${hrs}h ${mins}m`;
        }
        if (hrs > 0) {
          return `${hrs}h`;
        }
        return `${mins}m`;
      }
    }
  } catch (e) {
    console.error("Error calculating flight duration:", e);
  }
  return "Flight duration unavailable";
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapFlightDataToDetails = (data: any): FlightDetails => {
  const depAirport = AIRPORTS.find((a) => a.code.toUpperCase() === data.origin?.code?.toUpperCase());
  const destAirport = AIRPORTS.find((a) => a.code.toUpperCase() === data.destination?.code?.toUpperCase());

  const durationResult = FlightDurationResolver.resolveSync({
    duration: data.duration,
    scheduledDuration: data.scheduledDuration,
    estimatedDuration: data.estimatedDuration,
    blockTime: data.blockTime,
    flightTime: data.flightTime,
    depTimeIso: data.departure?.scheduledTime,
    arrTimeIso: data.arrival?.scheduledTime,
    originCode: data.origin?.code,
    destCode: data.destination?.code,
  });

  return {
    flightNum: data.flightNum,
    originCode: data.origin.code,
    originCity: data.origin.city,
    destCode: data.destination.code,
    destCity: data.destination.city,
    depTime: formatTime(data.departure.scheduledTime),
    arrTime: formatTime(data.arrival.scheduledTime),
    depDate: formatDateString(data.departure.scheduledTime),
    arrDate: formatDateString(data.arrival.scheduledTime),
    duration: durationResult.duration,
    durationSource: durationResult.source,
    depTerminal: data.departure.terminal || "",
    arrTerminal: data.arrival.terminal || "",
    rawDepTime: data.departure.scheduledTime,
    rawArrTime: data.arrival.scheduledTime,
    eligibility: data.eligibility,
    carrierName: data.carrier?.name || "",
    carrierIata: data.carrier?.iata || "",
    aircraftModel: data.aircraft?.model || "",
    status: data.status || "Scheduled",
    isManual: !!data.isManual,
    originTimezone: depAirport?.timezone || "Asia/Kolkata",
    destTimezone: destAirport?.timezone || "Asia/Kolkata",
    lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
};

const formatTime = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    if (!isNaN(d.getTime())) {
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minStr = minutes < 10 ? "0" + minutes : minutes;
      return `${hours}:${minStr} ${ampm}`;
    }
  } catch (e) {
    console.error(e);
  }
  return isoString;
};

const getAirportName = (code: string, cityFallback: string): string => {
  const cleanCode = code.trim().toUpperCase();
  const found = AIRPORTS.find((a) => a.code.toUpperCase() === cleanCode);
  if (found && found.airport?.name) {
    return found.airport.name;
  }
  if (cityFallback) {
    return `${cityFallback} Airport`;
  }
  return `${cleanCode} Airport`;
};

const getNextValidTimeSlot = (dateStr: string) => {
  const now = new Date();
  const todayStr = format(now, "yyyy-MM-dd");

  if (dateStr !== todayStr) {
    return "12:00";
  }

  const hour = now.getHours();
  const min = now.getMinutes();

  if (min < 30) {
    return `${hour.toString().padStart(2, "0")}:30`;
  }

  const nextHour = (hour + 1) % 24;
  return `${nextHour.toString().padStart(2, "0")}:00`;
};

const isPastDateTime = (dateStr: string, timeStr: string) => {
  if (!dateStr || !timeStr) return false;
  const now = new Date();
  const select = new Date(`${dateStr}T${timeStr}:00`);
  return select < now;
};

function DatePickerField({
  label,
  datePlaceholder,
  dateValue,
  onDateChange,
  disabledBefore = new Date(),
}: {
  label: string;
  datePlaceholder: string;
  dateValue: string;
  onDateChange: (val: string) => void;
  disabledBefore?: Date;
}) {
  const [open, setOpen] = useState(false);
  const selectedDate = dateValue
    ? (() => {
        try {
          const d = new Date(dateValue + "T00:00:00");
          return isValid(d) ? d : undefined;
        } catch {
          return undefined;
        }
      })()
    : undefined;

  const todayStart = new Date(disabledBefore);
  todayStart.setHours(0, 0, 0, 0);

  return (
    <div className="flex flex-col gap-1 w-full animate-fadeIn">
      <span
        className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
        style={pageMono}
      >
        {label}
      </span>
      <div className="flex gap-2 mt-1">
        <div className="flex-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-full input-luxury text-[#0b1a24] dark:text-[#f3f4f6] text-left flex items-center justify-between mt-1 hover:border-[#c5a059]/40"
              >
                <span className={dateValue ? "" : "text-gray-400"}>
                  {dateValue
                    ? format(new Date(dateValue + "T00:00:00"), "MMM d, yyyy")
                    : datePlaceholder}
                </span>
                <Calendar size={13} className="text-gray-400" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <CalendarPicker
                mode="single"
                selected={selectedDate}
                onSelect={(day) => {
                  if (day) {
                    onDateChange(format(day, "yyyy-MM-dd"));
                  }
                  setOpen(false);
                }}
                disabled={{ before: todayStart }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Main Component ───────────────────── */

const clientValidationCache = new Map<string, { data: any; timestamp: number }>();
const CLIENT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL
const activeValidationPromises = new Map<string, Promise<any>>();

function AirportSearchInput({
  label,
  query,
  setQuery,
  selectedCode,
  setSelectedCode,
  suggestions,
  placeholder,
}: {
  label: string;
  query: string;
  setQuery: (q: string) => void;
  selectedCode: string;
  setSelectedCode: (c: string) => void;
  suggestions: typeof AIRPORTS;
  placeholder: string;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  return (
    <div className="relative flex flex-col gap-1 w-full animate-fadeIn">
      <span
        className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
        style={pageMono}
      >
        {label}
      </span>
      <div className="relative mt-1">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedCode(""); // reset selection
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none transition-all focus:border-teal/50 animate-fadeIn"
          style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
        />
        {selectedCode && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
            {selectedCode}
          </span>
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-gray-50">
          {suggestions.map((airport) => (
            <button
              key={airport.code}
              type="button"
              onClick={() => {
                setSelectedCode(airport.code);
                setQuery(`${airport.city} (${airport.code})`);
                setShowSuggestions(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs hover:bg-teal-50/40 transition-colors flex items-center justify-between"
            >
              <div>
                <span className="font-semibold text-gray-800">{airport.city}</span>
                <span className="text-[10px] text-gray-400 ml-1.5">{airport.airport?.name}</span>
              </div>
              <span className="font-bold text-teal-700 text-[10px] bg-teal-50 px-1.5 py-0.5 rounded">
                {airport.code}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AnimatedBookingTimeline({ activeStep }: { activeStep: number }) {
  const steps = [
    { n: 1, label: "Coordinates" },
    { n: 2, label: "Contact Details" },
    { n: 3, label: "Custom Services" },
    { n: 4, label: "Reservation" },
  ];
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6 md:py-8">
      <div className="relative flex items-center justify-between">
        {/* Connection line */}
        <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-[#0b1a24]/10 dark:bg-white/10 -translate-y-1/2 z-0" />

        {/* Active connection line */}
        <motion.div
          className="absolute left-0 top-1/2 h-[2px] bg-[#c5a059] -translate-y-1/2 z-0"
          initial={{ width: "0%" }}
          animate={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {steps.map((s) => {
          const isCompleted = activeStep > s.n;
          const isActive = activeStep === s.n;
          return (
            <div key={s.n} className="relative z-10 flex flex-col items-center gap-2">
              <motion.div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                  isCompleted
                    ? "bg-[#c5a059] border-[#c5a059] text-white"
                    : isActive
                      ? "bg-[#0b1a24] dark:bg-[#f3f4f6] border-[#c5a059] text-white dark:text-[#0b1a24] shadow-luxury-sm"
                      : "bg-[#faf8f5] dark:bg-[#0a0c10] border-[#0b1a24]/10 dark:border-white/10 text-muted-foreground"
                }`}
                animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              >
                {isCompleted ? <Check size={12} strokeWidth={3.5} /> : s.n}
              </motion.div>
              <span className="font-mono-luxury text-[8px] text-[#576875] tracking-widest hidden sm:block">
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BookingView({ searchParams }: { searchParams: any }) {
  const navigate = useNavigate();
  const router = useRouter();
  const submit = useServerFn(createBooking);

  const authed = false;
  const [busy, setBusy] = useState(false);
  const [confirmedBookingRef, setConfirmedBookingRef] = useState<string | null>(null);
  const [confirmedDetails, setConfirmedDetails] = useState<any>(null);

  const [departTime, setDepartTime] = useState("");
  const [returnTime, setReturnTime] = useState("");

  // Manual fallback states
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualAirline, setManualAirline] = useState("");
  const [manualOrigin, setManualOrigin] = useState("");
  const [manualDest, setManualDest] = useState("");
  const [manualTime, setManualTime] = useState("");
  const [manualOriginQuery, setManualOriginQuery] = useState("");
  const [manualDestQuery, setManualDestQuery] = useState("");
  const [manualArrivalDate, setManualArrivalDate] = useState("");
  const [manualArrivalTime, setManualArrivalTime] = useState("");

  const [isManualMode2, setIsManualMode2] = useState(false);
  const [manualAirline2, setManualAirline2] = useState("");
  const [manualOrigin2, setManualOrigin2] = useState("");
  const [manualDest2, setManualDest2] = useState("");
  const [manualTime2, setManualTime2] = useState("");
  const [manualOriginQuery2, setManualOriginQuery2] = useState("");
  const [manualDestQuery2, setManualDestQuery2] = useState("");
  const [manualArrivalDate2, setManualArrivalDate2] = useState("");
  const [manualArrivalTime2, setManualArrivalTime2] = useState("");

  // Collapsible service section toggles — auto-expand based on trip type
  const [depSectionOpen, setDepSectionOpen] = useState(true);
  const [arrSectionOpen, setArrSectionOpen] = useState(false);

  const matchingOrigins = useMemo(() => {
    if (!manualOriginQuery.trim()) return [];
    const q = manualOriginQuery.toLowerCase();
    return AIRPORTS.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.airport?.name?.toLowerCase().includes(q),
    ).slice(0, 5);
  }, [manualOriginQuery]);

  const matchingDests = useMemo(() => {
    if (!manualDestQuery.trim()) return [];
    const q = manualDestQuery.toLowerCase();
    return AIRPORTS.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.airport?.name?.toLowerCase().includes(q),
    ).slice(0, 5);
  }, [manualDestQuery]);

  const matchingOrigins2 = useMemo(() => {
    if (!manualOriginQuery2.trim()) return [];
    const q = manualOriginQuery2.toLowerCase();
    return AIRPORTS.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.airport?.name?.toLowerCase().includes(q),
    ).slice(0, 5);
  }, [manualOriginQuery2]);

  const matchingDests2 = useMemo(() => {
    if (!manualDestQuery2.trim()) return [];
    const q = manualDestQuery2.toLowerCase();
    return AIRPORTS.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.airport?.name?.toLowerCase().includes(q),
    ).slice(0, 5);
  }, [manualDestQuery2]);

  const [form, setForm] = useState({
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    company: "",
    trip_type: "one_way" as "one_way" | "round_trip" | "multi_city",
    origin: "",
    destination: "",
    depart_date: "",
    return_date: "",
    pax_adults: 1,
    pax_children: 0,
    pax_infants: 0,
    aircraft_preference: "",
    service_type: "Airport Services",
    notes: "",
  });

  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [visaFile, setVisaFile] = useState<File | null>(null);

  // Flight validation states
  const [flightNum, setFlightNum] = useState("");
  const [flightNum2, setFlightNum2] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [validationError2, setValidationError2] = useState("");
  const [isFlightValidated, setIsFlightValidated] = useState(false);
  const [flightDetails, setFlightDetails] = useState<FlightDetails | null>(null);
  const [flightDetails2, setFlightDetails2] = useState<FlightDetails | null>(null);
  const handleDateChange = useCallback((isDeparture: boolean, dateVal: string) => {
    setForm((prev) => ({
      ...prev,
      [isDeparture ? "depart_date" : "return_date"]: dateVal,
    }));

    // Adjust time if necessary
    const nextSlot = getNextValidTimeSlot(dateVal);
    if (isDeparture) {
      setDepartTime((prev) => {
        const todayStr = format(new Date(), "yyyy-MM-dd");
        if (dateVal === todayStr) {
          const [h, m] = prev.split(":").map(Number);
          const now = new Date();
          if (h < now.getHours() || (h === now.getHours() && m < now.getMinutes())) {
            return nextSlot;
          }
        }
        return prev || nextSlot;
      });
    } else {
      setReturnTime((prev) => {
        const todayStr = format(new Date(), "yyyy-MM-dd");
        if (dateVal === todayStr) {
          const [h, m] = prev.split(":").map(Number);
          const now = new Date();
          if (h < now.getHours() || (h === now.getHours() && m < now.getMinutes())) {
            return nextSlot;
          }
        }
        return prev || nextSlot;
      });
    }
  }, []);

  // Selected Services state
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [userNotes, setUserNotes] = useState("");

  const isSixHourViolated = useMemo(() => {
    if (isFlightValidated && flightDetails?.eligibility && !flightDetails.eligibility.isBookable) {
      return true;
    }
    if (form.trip_type === "multi_city" && isFlightValidated && flightDetails2?.eligibility && !flightDetails2.eligibility.isBookable) {
      return true;
    }
    if (form.depart_date && departTime) {
      const scheduledIso = `${form.depart_date.trim()}T${departTime.trim()}:00`;
      const originCode = (flightDetails?.originCode || form.origin || "DEL").replace(/.*\(|\).*/g, "").trim();
      const elig = checkBookingEligibility(scheduledIso, originCode, form.trip_type, 6, false);
      if (!elig.isBookable) {
        return true;
      }
    }
    if (form.trip_type === "multi_city" && form.return_date && returnTime) {
      const scheduledIso2 = `${form.return_date.trim()}T${returnTime.trim()}:00`;
      const destCode = (flightDetails2?.originCode || form.destination || "BOM").replace(/.*\(|\).*/g, "").trim();
      const elig2 = checkBookingEligibility(scheduledIso2, destCode, form.trip_type, 6, false);
      if (!elig2.isBookable) {
        return true;
      }
    }
    const hasArrivalServices = selectedServiceIds.some((id) => id.startsWith("arr_"));
    if (hasArrivalServices) {
      const arrTimeStr = flightDetails?.arrTime || returnTime || departTime;
      const arrDateStr = flightDetails?.arrDate || form.return_date || form.depart_date;
      if (arrDateStr && arrTimeStr) {
        const arrivalIso = `${arrDateStr.trim()}T${arrTimeStr.trim()}:00`;
        const destCode = (flightDetails?.destCode || form.destination || "BOM").replace(/.*\(|\).*/g, "").trim();
        const eligArr = checkBookingEligibility(arrivalIso, destCode, form.trip_type, 6, true);
        if (!eligArr.isBookable) {
          return true;
        }
      }
    }
    return false;
  }, [isFlightValidated, flightDetails, flightDetails2, form.depart_date, form.return_date, form.trip_type, form.origin, form.destination, departTime, returnTime, selectedServiceIds]);

  const validationWarning = useMemo(() => {
    if (isSixHourViolated) {
      const msg1 = flightDetails?.eligibility?.blockingMessage;
      const msg2 = flightDetails2?.eligibility?.blockingMessage;
      if (msg1) return msg1;
      if (msg2) return msg2;

      if (form.depart_date && departTime) {
        const scheduledIso = `${form.depart_date.trim()}T${departTime.trim()}:00`;
        const originCode = (flightDetails?.originCode || form.origin || "DEL").replace(/.*\(|\).*/g, "").trim();
        const elig = checkBookingEligibility(scheduledIso, originCode, form.trip_type, 6, false);
        if (!elig.isBookable && elig.blockingMessage) return elig.blockingMessage;
      }

      if (form.trip_type === "multi_city" && form.return_date && returnTime) {
        const scheduledIso2 = `${form.return_date.trim()}T${returnTime.trim()}:00`;
        const destCode = (flightDetails2?.originCode || form.destination || "BOM").replace(/.*\(|\).*/g, "").trim();
        const elig2 = checkBookingEligibility(scheduledIso2, destCode, form.trip_type, 6, false);
        if (!elig2.isBookable && elig2.blockingMessage) return elig2.blockingMessage;
      }

      const hasArrivalServices = selectedServiceIds.some((id) => id.startsWith("arr_"));
      if (hasArrivalServices) {
        const arrTimeStr = flightDetails?.arrTime || returnTime || departTime;
        const arrDateStr = flightDetails?.arrDate || form.return_date || form.depart_date;
        if (arrDateStr && arrTimeStr) {
          const arrivalIso = `${arrDateStr.trim()}T${arrTimeStr.trim()}:00`;
          const destCode = (flightDetails?.destCode || form.destination || "BOM").replace(/.*\(|\).*/g, "").trim();
          const eligArr = checkBookingEligibility(arrivalIso, destCode, form.trip_type, 6, true);
          if (!eligArr.isBookable && eligArr.blockingMessage) return eligArr.blockingMessage;
        }
      }

      return "Bookings must be made at least 6 hours before departure or arrival.";
    }
    return "";
  }, [isSixHourViolated, flightDetails, flightDetails2, form.depart_date, form.return_date, form.trip_type, form.origin, form.destination, departTime, returnTime, selectedServiceIds]);

  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        if (tz.includes("Kolkata") || tz.includes("Calcutta")) {
          return COUNTRIES.find((c) => c.code === "IN") || COUNTRIES[0];
        }
        if (tz.startsWith("America/")) {
          return COUNTRIES.find((c) => c.code === "US") || COUNTRIES[0];
        }
        if (tz.includes("London") || tz.includes("Belfast")) {
          return COUNTRIES.find((c) => c.code === "GB") || COUNTRIES[0];
        }
        if (tz.includes("Dubai")) {
          return COUNTRIES.find((c) => c.code === "AE") || COUNTRIES[0];
        }
        if (tz.includes("Singapore")) {
          return COUNTRIES.find((c) => c.code === "SG") || COUNTRIES[0];
        }
      }
    } catch (e) {
      // Timezone detection failed, using default
    }

    try {
      const lang = navigator.language;
      if (lang) {
        const code = lang.split("-")[1]?.toUpperCase();
        if (code) {
          const match = COUNTRIES.find((c) => c.code === code);
          if (match) return match;
        }
      }
    } catch (e) {
      // Language detection failed, using default
    }

    return COUNTRIES.find((c) => c.code === "IN") || COUNTRIES[0];
  });

  const [phoneBody, setPhoneBody] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  // Validate phone number dynamically when selectedCountry or phoneBody changes
  useEffect(() => {
    if (!phoneBody.trim()) {
      setPhoneError("");
      return;
    }
    try {
      const phoneNumber = parsePhoneNumberFromString(
        phoneBody,
        selectedCountry.code as CountryCode,
      );
      if (!phoneNumber || !phoneNumber.isValid()) {
        setPhoneError(`Invalid phone number format for ${selectedCountry.name}`);
      } else {
        setPhoneError("");
      }
    } catch {
      setPhoneError("Invalid phone number format");
    }
  }, [selectedCountry, phoneBody]);

  // Sync to form.contact_phone
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      contact_phone: `${selectedCountry.dial} ${phoneBody}`.trim(),
    }));
  }, [selectedCountry, phoneBody]);

  /* ──── Extract initial parameters from URL ──── */
  useEffect(() => {
    let detectedTripType: "one_way" | "round_trip" | "multi_city" = "one_way";
    let f1 = "";
    let f2 = "";

    if (searchParams.notes) {
      if (searchParams.notes.toLowerCase().includes("connection")) {
        detectedTripType = "multi_city";
        const m1 = searchParams.notes.match(/Flight 1:\s*([a-zA-Z0-9]+)/i);
        if (m1) f1 = m1[1];
        const m2 = searchParams.notes.match(/Flight 2:\s*([a-zA-Z0-9]+)/i);
        if (m2) f2 = m2[1];
      } else {
        const matchRegular = searchParams.notes.match(/Flight Number:\s*([a-zA-Z0-9]+)/i);
        f1 = matchRegular ? matchRegular[1] : searchParams.notes;

        if (searchParams.notes.toLowerCase().includes("arrival")) {
          detectedTripType = "round_trip";
        }
      }
    }

    if (!f1) {
      if (searchParams.origin && /^[a-zA-Z]{2,4}\d{1,4}$/.test(searchParams.origin)) {
        f1 = searchParams.origin;
      } else if (
        searchParams.destination &&
        /^[a-zA-Z]{2,4}\d{1,4}$/.test(searchParams.destination)
      ) {
        f1 = searchParams.destination;
        detectedTripType = "round_trip";
      }
    }

    setFlightNum(f1);
    setFlightNum2(f2);

    const initialDate = searchParams.depart_date || format(new Date(), "yyyy-MM-dd");
    setDepartTime(getNextValidTimeSlot(initialDate));
    setReturnTime("12:00");

    let defaultServiceType = "Airport Services";
    if (detectedTripType === "one_way") defaultServiceType = "Departure Service";
    else if (detectedTripType === "round_trip") defaultServiceType = "Arrival Service";
    else if (detectedTripType === "multi_city") defaultServiceType = "Connection Service";

    setForm({
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      company: "",
      trip_type: detectedTripType,
      origin: searchParams.origin || "",
      destination: searchParams.destination || "",
      depart_date: initialDate,
      return_date: "",
      pax_adults: searchParams.pax_adults ?? 1,
      pax_children: searchParams.pax_children ?? 0,
      pax_infants: searchParams.pax_infants ?? 0,
      aircraft_preference: "",
      service_type: defaultServiceType,
      notes: searchParams.notes || "",
    });
  }, [searchParams]);

  const hasManualDetailsBeenEntered = useCallback(() => {
    const hasF1 = !!(
      manualAirline.trim() ||
      manualOrigin.trim() ||
      manualDest.trim() ||
      manualTime.trim() ||
      manualArrivalDate ||
      manualArrivalTime
    );
    const hasF2 = !!(
      manualAirline2.trim() ||
      manualOrigin2.trim() ||
      manualDest2.trim() ||
      manualTime2.trim() ||
      manualArrivalDate2 ||
      manualArrivalTime2
    );
    return hasF1 || hasF2;
  }, [
    manualAirline,
    manualOrigin,
    manualDest,
    manualTime,
    manualArrivalDate,
    manualArrivalTime,
    manualAirline2,
    manualOrigin2,
    manualDest2,
    manualTime2,
    manualArrivalDate2,
    manualArrivalTime2,
  ]);

  /* ──── Debounced flight validation ──── */
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeAbortControllerRef = useRef<AbortController | null>(null);

  const executeValidation = useCallback(
    async (
      f1: string,
      f2: string,
      isTriggeredManually: boolean,
      isManualFallbackVerify?: boolean,
      manualFields1?: {
        origin: string;
        dest: string;
        time: string;
        airlineName?: string;
        arrivalDate?: string;
        arrivalTime?: string;
      },
      manualFields2?: {
        origin: string;
        dest: string;
        time: string;
        airlineName?: string;
        arrivalDate?: string;
        arrivalTime?: string;
      },
    ) => {
      const cleanF1 = f1.trim().toUpperCase().replace(/\s+/g, "");
      const cleanF2 = f2.trim().toUpperCase().replace(/\s+/g, "");

      if (!cleanF1) {
        setIsFlightValidated(false);
        setFlightDetails(null);
        setFlightDetails2(null);
        setValidationError("");
        return;
      }

      if (!isManualFallbackVerify) {
        const error1 = validateFlightFormat(cleanF1);
        if (error1) {
          setValidationError(error1);
          setIsFlightValidated(false);
          setFlightDetails(null);
          return;
        }
      }
      setValidationError("");

      if (form.trip_type === "multi_city") {
        if (!cleanF2) {
          setIsFlightValidated(false);
          setFlightDetails2(null);
          setValidationError2("");
          return;
        }
        if (!isManualFallbackVerify) {
          const error2 = validateFlightFormat(cleanF2);
          if (error2) {
            setValidationError2(error2);
            setIsFlightValidated(false);
            setFlightDetails2(null);
            return;
          }
        }
        setValidationError2("");
      }

      if (activeAbortControllerRef.current) {
        activeAbortControllerRef.current.abort();
      }

      const controller = new AbortController();
      activeAbortControllerRef.current = controller;
      setIsValidating(true);

      try {
        let resBody1;
        const cacheKey1 = `AUTO:${cleanF1}:${form.depart_date}:${form.trip_type}`;

        if (isManualFallbackVerify && manualFields1) {
          const response1 = await fetch("/api/flight/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              flightNum: cleanF1,
              departDate: form.depart_date,
              tripType: form.trip_type,
              isManual: true,
              departTime: manualFields1.time,
              originCode: manualFields1.origin,
              destinationCode: manualFields1.dest,
              airlineName: manualFields1.airlineName,
              arrivalDate: manualFields1.arrivalDate,
              arrivalTime: manualFields1.arrivalTime,
            }),
            signal: controller.signal,
          });

          resBody1 = await response1.json();
          if (!response1.ok || !resBody1.success) {
            throw new Error(resBody1.error?.message || "Verification failed.");
          }
        } else {
          const cached = clientValidationCache.get(cacheKey1);
          if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL) {
            resBody1 = cached.data;
          } else {
            let promise1 = activeValidationPromises.get(cacheKey1);
            if (!promise1) {
              promise1 = (async () => {
                const response = await fetch("/api/flight/validate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    flightNum: cleanF1,
                    departDate: form.depart_date,
                    tripType: form.trip_type,
                  }),
                  signal: controller.signal,
                });
                const body = await response.json();
                if (!response.ok || !body.success) {
                  throw new Error(body.error?.message || "Verification failed.");
                }
                return body;
              })();
              activeValidationPromises.set(cacheKey1, promise1);
            }

            try {
              resBody1 = await promise1;
              clientValidationCache.set(cacheKey1, { data: resBody1, timestamp: Date.now() });
            } finally {
              activeValidationPromises.delete(cacheKey1);
            }
          }
        }

        const data1 = resBody1.data;
        const details1 = mapFlightDataToDetails(Array.isArray(data1) ? data1[0] : data1);
        setFlightDetails(details1);

        const isArrival1 = form.trip_type === "round_trip";
        const rawTime1 = Array.isArray(data1) ? data1[0] : data1;
        const extractedTime1 =
          isManualFallbackVerify && manualFields1
            ? manualFields1.time
            : extractTime24h(
                isArrival1 ? rawTime1?.arrival?.scheduledTime : rawTime1?.departure?.scheduledTime,
              );
        setDepartTime(extractedTime1);

        let details2 = null;
        if (form.trip_type === "multi_city") {
          let resBody2;
          const cacheKey2 = `AUTO:${cleanF2}:${form.return_date || form.depart_date}:${form.trip_type}`;

          if (isManualFallbackVerify && manualFields2) {
            const response2 = await fetch("/api/flight/validate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                flightNum: cleanF2,
                departDate: form.return_date || form.depart_date,
                tripType: form.trip_type,
                isManual: true,
                departTime: manualFields2.time,
                originCode: manualFields2.origin,
                destinationCode: manualFields2.dest,
                airlineName: manualFields2.airlineName,
                arrivalDate: manualFields2.arrivalDate,
                arrivalTime: manualFields2.arrivalTime,
              }),
              signal: controller.signal,
            });

            resBody2 = await response2.json();
            if (!response2.ok || !resBody2.success) {
              throw new Error(resBody2.error?.message || "Verification failed.");
            }
          } else {
            const cached = clientValidationCache.get(cacheKey2);
            if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL) {
              resBody2 = cached.data;
            } else {
              let promise2 = activeValidationPromises.get(cacheKey2);
              if (!promise2) {
                promise2 = (async () => {
                  const response = await fetch("/api/flight/validate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      flightNum: cleanF2,
                      departDate: form.return_date || form.depart_date,
                      tripType: form.trip_type,
                    }),
                    signal: controller.signal,
                  });
                  const body = await response.json();
                  if (!response.ok || !body.success) {
                    throw new Error(body.error?.message || "Verification failed.");
                  }
                  return body;
                })();
                activeValidationPromises.set(cacheKey2, promise2);
              }

              try {
                resBody2 = await promise2;
                clientValidationCache.set(cacheKey2, { data: resBody2, timestamp: Date.now() });
              } finally {
                activeValidationPromises.delete(cacheKey2);
              }
            }
          }

          const data2 = resBody2.data;
          const details2Obj = mapFlightDataToDetails(Array.isArray(data2) ? data2[0] : data2);
          details2 = details2Obj;
          setFlightDetails2(details2Obj);

          const rawTime2 = Array.isArray(data2) ? data2[0] : data2;
          const extractedTime2 =
            isManualFallbackVerify && manualFields2
              ? manualFields2.time
              : extractTime24h(rawTime2?.departure?.scheduledTime);
          setReturnTime(extractedTime2);
        }

        // If user had manual details and this is an auto-verify, confirm before replacing
        if (!isManualFallbackVerify && hasManualDetailsBeenEntered()) {
          const confirmReplace = window.confirm(
            "We successfully verified this flight automatically. Would you like to discard your manually entered details and use the verified flight information?",
          );
          if (!confirmReplace) {
            toast.info("Keeping your manually entered details.");
            return;
          }
        }

        setIsFlightValidated(true);
        setValidationError("");
        setValidationError2("");
        setIsManualMode(false);
        setIsManualMode2(false);

        // Clear manual inputs
        setManualAirline("");
        setManualOrigin("");
        setManualDest("");
        setManualTime("");
        setManualOriginQuery("");
        setManualDestQuery("");
        setManualArrivalDate("");
        setManualArrivalTime("");
        setManualAirline2("");
        setManualOrigin2("");
        setManualDest2("");
        setManualTime2("");
        setManualOriginQuery2("");
        setManualDestQuery2("");
        setManualArrivalDate2("");
        setManualArrivalTime2("");

        toast.success("Flight validated successfully!");

        setForm((prev) => ({
          ...prev,
          origin: `${details1.originCity} (${details1.originCode})`,
          destination: details2
            ? `${details2.destCity} (${details2.destCode})`
            : `${details1.destCity} (${details1.destCode})`,
        }));
      } catch (err: any) {
        const isAbort = err instanceof Error && err.name === "AbortError";
        if (!isAbort) {
          const isCutoffViolation =
            err.message?.includes("6 hours") || err.message?.includes("departed");

          if (isCutoffViolation) {
            setValidationError(err.message);
            setIsFlightValidated(false);
          } else {
            // If validation failed because of network/server/provider error,
            // and the user is executing a manual validation, allow them to proceed!
            if (isManualFallbackVerify) {
              toast.warning(
                "Flight validation server is offline or returned an error, but you can still proceed with manual entry.",
              );

              const oAir = AIRPORTS.find(
                (a) => a.code.toUpperCase() === (manualFields1?.origin || "").toUpperCase(),
              );
              const dAir = AIRPORTS.find(
                (a) => a.code.toUpperCase() === (manualFields1?.dest || "").toUpperCase(),
              );
              let dAir2: typeof oAir = undefined;

              const localDetails1: FlightDetails = {
                flightNum: cleanF1,
                originCode: manualFields1?.origin || "UNK",
                originCity: oAir?.city || "Manual Entry Origin",
                destCode: manualFields1?.dest || "UNK",
                destCity: dAir?.city || "Manual Entry Destination",
                depTime: manualFields1?.time || "12:00",
                arrTime: manualFields1?.arrivalTime || manualFields1?.time || "12:00",
                depDate: form.depart_date,
                arrDate: manualFields1?.arrivalDate || form.depart_date,
                duration: "—",
                depTerminal: "",
                arrTerminal: "",
                carrierName: manualFields1?.airlineName || "Manual Airline",
                aircraftModel: "Commercial Flight",
                isManual: true,
              };
              setFlightDetails(localDetails1);

              if (cleanF2 && manualFields2) {
                const oAir2 = AIRPORTS.find(
                  (a) => a.code.toUpperCase() === (manualFields2.origin || "").toUpperCase(),
                );
                dAir2 = AIRPORTS.find(
                  (a) => a.code.toUpperCase() === (manualFields2.dest || "").toUpperCase(),
                );

                const localDetails2: FlightDetails = {
                  flightNum: cleanF2,
                  originCode: manualFields2.origin,
                  originCity: oAir2?.city || "Manual Entry Origin",
                  destCode: manualFields2.dest,
                  destCity: dAir2?.city || "Manual Entry Destination",
                  depTime: manualFields2.time,
                  arrTime: manualFields2.arrivalTime || manualFields2.time,
                  depDate: form.return_date || form.depart_date,
                  arrDate: manualFields2.arrivalDate || form.return_date || form.depart_date,
                  duration: "—",
                  depTerminal: "",
                  arrTerminal: "",
                  carrierName: manualFields2.airlineName || "Manual Airline",
                  aircraftModel: "Commercial Flight",
                  isManual: true,
                };
                setFlightDetails2(localDetails2);
              }

              setIsFlightValidated(true);
              setValidationError("");
              setValidationError2("");

              setForm((prev) => ({
                ...prev,
                origin: oAir ? `${oAir.city} (${oAir.code})` : manualFields1?.origin || "UNK",
                destination:
                  cleanF2 && manualFields2 && dAir2
                    ? `${dAir2.city} (${dAir2.code})`
                    : dAir
                      ? `${dAir.city} (${dAir.code})`
                      : manualFields1?.dest || "UNK",
              }));
            } else {
              setValidationError(
                err.message ||
                  "Unable to verify this flight automatically. Please enter details manually.",
              );
              setIsManualMode(true);
              if (form.trip_type === "multi_city") {
                setIsManualMode2(true);
              }
              setIsFlightValidated(false);
            }
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsValidating(false);
        }
      }
    },
    [form.depart_date, form.return_date, form.trip_type],
  );

  // Background periodic revalidation of 6-hour eligibility
  useEffect(() => {
    if (!isFlightValidated || !flightDetails) return;

    const interval = setInterval(async () => {
      try {
        const checkKey = flightDetails.flightNum;
        const response = await fetch("/api/flight/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            flightNum: checkKey,
            departDate: form.depart_date,
            tripType: form.trip_type,
            isManual: flightDetails.isManual || isManualMode,
            departTime: departTime,
            originCode: flightDetails.originCode,
            destinationCode: flightDetails.destCode,
          }),
        });

        if (response.ok) {
          const body = await response.json();
          if (body.success) {
            const freshData = body.data;
            const mapped = mapFlightDataToDetails(
              Array.isArray(freshData) ? freshData[0] : freshData,
            );

            if (mapped.eligibility && !mapped.eligibility.isBookable) {
              setFlightDetails(mapped);
              toast.error("Booking cutoff exceeded. This flight can no longer be booked.");
            }
          }
        }
      } catch (err) {
        // Periodic validation failed, will retry on next interval
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [
    isFlightValidated,
    flightDetails,
    form.depart_date,
    form.trip_type,
    departTime,
    isManualMode,
  ]);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const cleanF1 = flightNum.trim();
    if (!cleanF1) {
      setIsFlightValidated(false);
      setFlightDetails(null);
      setFlightDetails2(null);
      setValidationError("");
      setValidationError2("");
      return;
    }

    // Reset validated state immediately when flight number changes
    setIsFlightValidated(false);
    setFlightDetails(null);
    setFlightDetails2(null);

    debounceTimeoutRef.current = setTimeout(() => {
      executeValidation(flightNum, flightNum2, false, false);
    }, 600);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [flightNum, flightNum2, form.depart_date, form.return_date, executeValidation]);

  const handleManualValidation = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Validate Flight Number Format
    const f1Err = validateFlightFormat(flightNum);
    if (f1Err) {
      toast.error(`Flight 1 Number error: ${f1Err}`);
      return;
    }

    if (isManualMode) {
      if (!manualAirline.trim()) {
        toast.error("Airline Name is required for Flight 1.");
        return;
      }
      if (!manualOrigin.trim()) {
        toast.error("Departure Airport is required for Flight 1.");
        return;
      }
      if (!manualDest.trim()) {
        toast.error("Arrival Airport is required for Flight 1.");
        return;
      }
      if (!manualTime.trim()) {
        toast.error("Departure Time is required for Flight 1.");
        return;
      }

      // Check airport code length and formats
      const codePattern = /^[A-Z0-9]{3,4}$/i;
      if (!codePattern.test(manualOrigin.trim()) || !codePattern.test(manualDest.trim())) {
        toast.error("Airport codes must be 3-4 alphanumeric characters (e.g. BOM, DEL).");
        return;
      }

      if (manualOrigin.trim().toUpperCase() === manualDest.trim().toUpperCase()) {
        toast.error("Flight 1 Departure and Arrival airports cannot be the same.");
        return;
      }

      const timePattern = /^\d{2}:\d{2}$/;
      if (!timePattern.test(manualTime.trim())) {
        toast.error("Invalid Departure Time format. Use HH:MM (24-hour).");
        return;
      }

      const localDeparture = new Date(`${form.depart_date}T${manualTime.trim()}:00`);
      if (isNaN(localDeparture.getTime())) {
        toast.error("Invalid departure date or time configuration.");
        return;
      }
      // Allow 5 minutes of grace time for client clock discrepancies
      if (localDeparture.getTime() < Date.now() - 300000) {
        toast.error("Flight 1 departure time cannot be in the past.");
        return;
      }
    }

    if (isManualMode2 && form.trip_type === "multi_city") {
      const f2Err = validateFlightFormat(flightNum2);
      if (f2Err) {
        toast.error(`Flight 2 Number error: ${f2Err}`);
        return;
      }
      if (!manualAirline2.trim()) {
        toast.error("Airline Name is required for Flight 2.");
        return;
      }
      if (!manualOrigin2.trim()) {
        toast.error("Departure Airport is required for Flight 2.");
        return;
      }
      if (!manualDest2.trim()) {
        toast.error("Arrival Airport is required for Flight 2.");
        return;
      }
      if (!manualTime2.trim()) {
        toast.error("Departure Time is required for Flight 2.");
        return;
      }

      const codePattern = /^[A-Z0-9]{3,4}$/i;
      if (!codePattern.test(manualOrigin2.trim()) || !codePattern.test(manualDest2.trim())) {
        toast.error("Flight 2 Airport codes must be 3-4 alphanumeric characters.");
        return;
      }

      if (manualOrigin2.trim().toUpperCase() === manualDest2.trim().toUpperCase()) {
        toast.error("Flight 2 Departure and Arrival airports cannot be the same.");
        return;
      }

      const timePattern = /^\d{2}:\d{2}$/;
      if (!timePattern.test(manualTime2.trim())) {
        toast.error("Invalid Flight 2 Departure Time format. Use HH:MM.");
        return;
      }

      const returnDate = form.return_date || form.depart_date;
      const localDeparture2 = new Date(`${returnDate}T${manualTime2.trim()}:00`);
      if (isNaN(localDeparture2.getTime())) {
        toast.error("Invalid Flight 2 departure date or time configuration.");
        return;
      }
      if (localDeparture2.getTime() < Date.now() - 300000) {
        toast.error("Flight 2 departure time cannot be in the past.");
        return;
      }

      // Check sequence: flight 2 must depart after flight 1
      if (isManualMode) {
        const localDeparture1 = new Date(`${form.depart_date}T${manualTime.trim()}:00`);
        if (localDeparture2.getTime() <= localDeparture1.getTime()) {
          toast.error(
            "Connecting flight (Flight 2) departure must be after the first flight's departure.",
          );
          return;
        }
      }
    }

    const manualFields1 = isManualMode
      ? {
          origin: manualOrigin,
          dest: manualDest,
          time: manualTime,
          airlineName: manualAirline,
          arrivalDate: manualArrivalDate,
          arrivalTime: manualArrivalTime,
        }
      : undefined;

    const manualFields2 = isManualMode2
      ? {
          origin: manualOrigin2,
          dest: manualDest2,
          time: manualTime2,
          airlineName: manualAirline2,
          arrivalDate: manualArrivalDate2,
          arrivalTime: manualArrivalTime2,
        }
      : undefined;

    executeValidation(
      flightNum,
      flightNum2,
      true,
      isManualMode || isManualMode2,
      manualFields1,
      manualFields2,
    );
  };

  /* ──── Form Submission ──── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (busy) {
      return;
    }

    if (isSixHourViolated) {
      const msg = validationWarning || "Bookings must be made at least 6 hours before departure or arrival.";
      alert(msg);
      toast.error(msg);
      return;
    }
    if (!isFlightValidated) {
      toast.error("Please validate your flight details first.");
      return;
    }
    if (!form.contact_name) {
      toast.error("Please fill in your Full Name.");
      const el = document.getElementById("contact_name");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    if (!form.contact_email) {
      toast.error("Please fill in your Email Address.");
      const el = document.getElementById("contact_email");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) {
      toast.error("Please enter a valid Email Address.");
      const el = document.getElementById("contact_email");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    if (!phoneBody.trim()) {
      toast.error("Please fill in your Phone Number.");
      const el = document.getElementById("contact_phone");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    if (phoneError) {
      toast.error(phoneError);
      const el = document.getElementById("contact_phone");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setBusy(true);
    try {
      const selectedServiceTitles = selectedServiceIds.map((id) => {
        const svc = [...DEPARTURE_SERVICES, ...ARRIVAL_SERVICES].find((s) => s.id === id);
        return svc ? `${svc.title} (₹${svc.price.toLocaleString("en-IN")})` : id;
      });

      const buildFlightSnapshotString = (
        details: FlightDetails | null,
        isManual: boolean,
        airline: string,
        origin: string,
        dest: string,
        time: string,
        arrDate?: string,
        arrTime?: string,
        isSegment2 = false,
      ) => {
        const segNum = isSegment2 ? "2" : "1";
        if (isManual) {
          return [
            `[Flight ${segNum} Snapshot - MANUAL_ENTRY]`,
            `- Flight Number: ${(isSegment2 ? flightNum2 : flightNum).toUpperCase()}`,
            `- Airline Name: ${airline || "Unknown Airline"}`,
            `- Departure Airport: ${origin || "Unknown"}`,
            `- Arrival Airport: ${dest || "Unknown"}`,
            `- Departure Date: ${isSegment2 ? form.return_date || form.depart_date : form.depart_date}`,
            `- Departure Time: ${time || "—"}`,
            arrDate || arrTime ? `- Arrival Date/Time: ${arrDate || "—"} ${arrTime || "—"}` : "",
          ]
            .filter(Boolean)
            .join("\n");
        } else if (details) {
          return [
            `[Flight ${segNum} Snapshot - AUTO_VERIFIED]`,
            `- Flight Number: ${details.flightNum}`,
            `- Airline Name: ${details.carrierName || details.flightNum.slice(0, 2)}`,
            `- Departure Airport: ${details.originCode} (${details.originCity})`,
            `- Arrival Airport: ${details.destCode} (${details.destCity})`,
            `- Departure Date/Time: ${details.depDate} ${details.depTime}`,
            `- Arrival Date/Time: ${details.arrDate} ${details.arrTime}`,
            details.depTerminal || details.arrTerminal
              ? `- Terminals: ${details.depTerminal || "—"} (Dep) / ${details.arrTerminal || "—"} (Arr)`
              : "",
          ]
            .filter(Boolean)
            .join("\n");
        }
        return "";
      };

      const notesArray = [];

      const f1Snap = buildFlightSnapshotString(
        flightDetails,
        isManualMode,
        manualAirline,
        manualOrigin,
        manualDest,
        manualTime,
        manualArrivalDate,
        manualArrivalTime,
        false,
      );
      if (f1Snap) notesArray.push(f1Snap);

      if (form.trip_type === "multi_city") {
        const f2Snap = buildFlightSnapshotString(
          flightDetails2,
          isManualMode2,
          manualAirline2,
          manualOrigin2,
          manualDest2,
          manualTime2,
          manualArrivalDate2,
          manualArrivalTime2,
          true,
        );
        if (f2Snap) notesArray.push(f2Snap);
      }

      notesArray.push(`Selected Services: ${selectedServiceTitles.join(", ")}`);
      notesArray.push(
        `Total Service Price: ₹${totalPrice.toLocaleString("en-IN")} (Approx. $${Math.round(totalPrice / 83).toLocaleString()} USD)`,
      );
      if (userNotes.trim()) {
        notesArray.push(`Special Requests: ${userNotes}`);
      }

      const selectedServicesPayload = selectedServiceIds.map((id) => {
        const svc = [...DEPARTURE_SERVICES, ...ARRIVAL_SERVICES].find((s) => s.id === id);
        return {
          service_code: id,
          service_name: svc?.title || id,
          category: id.startsWith("dep_") ? "departure" : "arrival",
          quantity: totalPax,
          unit_price: svc?.price || null,
          currency: "INR",
          metadata: null,
        };
      });

      const submissionForm = {
        ...form,
        depart_date: `${form.depart_date} ${departTime}`.trim(),
        return_date: form.return_date ? `${form.return_date} ${returnTime}`.trim() : "",
        notes: notesArray.join("\n"),
        verification_type: (flightDetails?.isManual || flightDetails2?.isManual
          ? "MANUAL_ENTRY"
          : "AUTO_VERIFIED") as "AUTO_VERIFIED" | "MANUAL_ENTRY",
        services: selectedServicesPayload,
      };

      const r = await submit({ data: submissionForm });

      const bookingId = r.id;

      if (passportFile) {
        try {
          const passportPath = `traveler/${bookingId}/passport_${Date.now()}_${passportFile.name}`;
          const { error: pUpErr } = await supabase.storage
            .from("booking-docs")
            .upload(passportPath, passportFile, { upsert: false });
          if (pUpErr) {
            // Passport upload failed
          } else {
            const { error: pInsErr } = await supabase.from("booking_documents").insert({
              booking_id: bookingId,
              kind: "passport",
              storage_path: passportPath,
              amount: null,
              currency: null,
            } as never);
            if (pInsErr) {
              // Passport record insert failed
            }
          }
        } catch (uploadErr) {
          // Passport upload failed
        }
      }

      if (visaFile) {
        try {
          const visaPath = `traveler/${bookingId}/visa_${Date.now()}_${visaFile.name}`;
          const { error: vUpErr } = await supabase.storage
            .from("booking-docs")
            .upload(visaPath, visaFile, { upsert: false });
          if (vUpErr) {
            // Visa upload failed
          } else {
            const { error: vInsErr } = await supabase.from("booking_documents").insert({
              booking_id: bookingId,
              kind: "visa",
              storage_path: visaPath,
              amount: null,
              currency: null,
            } as never);
            if (vInsErr) {
              // Visa record insert failed
            }
          }
        } catch (uploadErr) {
          // Visa upload failed
        }
      }

      toast.success(`Booking confirmed · Ref: ${r.booking_ref}`);

      setConfirmedBookingRef(r.booking_ref);
      setConfirmedDetails({
        bookingId: r.id,
        flightNum,
        flightNum2,
        origin: flightDetails?.originCode || form.origin,
        destination: flightDetails2
          ? flightDetails2.destCode
          : flightDetails?.destCode || form.destination,
        departDate: form.depart_date,
        returnDate: form.return_date,
        tripType: form.trip_type,
        totalPrice,
        travelers: totalPax,
        contactName: form.contact_name,
        contactEmail: form.contact_email,
        contactPhone: `${selectedCountry.dial} ${phoneBody}`,
        serviceIds: selectedServiceIds,
      });
    } catch (err) {
      // TanStack Start server function errors may arrive as Error, Response, or plain objects
      let errorMessage = "Booking could not be completed.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === "object" && "message" in err) {
        errorMessage = String((err as { message: unknown }).message);
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      toast.error(errorMessage);
    } finally {
      setBusy(false);
    }
  }

  const toggleServiceId = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    );
  };

  const handleResetValidation = () => {
    setIsFlightValidated(false);
    setFlightDetails(null);
    setFlightDetails2(null);
    setFlightNum("");
    setFlightNum2("");
    setValidationError("");
    setValidationError2("");
    setSelectedServiceIds([]);
    clientValidationCache.clear();
    activeValidationPromises.clear();
  };

  const totalPax = form.pax_adults + form.pax_children + form.pax_infants;

  const totalPrice =
    selectedServiceIds.reduce((sum, id) => {
      const svc = [...DEPARTURE_SERVICES, ...ARRIVAL_SERVICES].find((s) => s.id === id);
      return sum + (svc?.price || 0);
    }, 0) * totalPax;

  const departureAirportName = flightDetails
    ? getAirportName(flightDetails.originCode, flightDetails.originCity)
    : "Departure Airport";

  const arrivalAirportName = flightDetails2
    ? getAirportName(flightDetails2.destCode, flightDetails2.destCity)
    : flightDetails
      ? getAirportName(flightDetails.destCode, flightDetails.destCity)
      : "Arrival Airport";

  const activeStep = useMemo(() => {
    if (confirmedBookingRef) return 4;
    if (isFlightValidated) {
      if (form.contact_name && form.contact_email && phoneBody) {
        return 3;
      }
      return 2;
    }
    return 1;
  }, [confirmedBookingRef, isFlightValidated, form.contact_name, form.contact_email, phoneBody]);

  /* ───────────────────── Render ───────────────────── */

  if (confirmedBookingRef && confirmedDetails) {
    return (
      <PageContainer tone="cream">
        <RouteTopbar>
          <button
            onClick={() => {
              setConfirmedBookingRef(null);
              setConfirmedDetails(null);
              router.navigate({ to: "/" });
            }}
            className="text-[10px] uppercase tracking-[0.32em] transition hover:opacity-70 flex items-center gap-2 text-[#576875]"
          >
            ← Back to Home
          </button>
        </RouteTopbar>

        <AnimatedBookingTimeline activeStep={4} />

        <div className="mx-auto max-w-xl py-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="panel-luxury rounded-2xl p-8 shadow-luxury-lg text-center flex flex-col items-center gap-6"
          >
            <div className="h-16 w-16 rounded-full bg-[#c5a059]/10 border border-[#c5a059] flex items-center justify-center text-[#c5a059]">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h2 className="text-2xl font-display-luxury text-[#0b1a24] dark:text-[#f3f4f6]">
                Reservation Confirmed
              </h2>
              <p className="text-xs text-[#576875] mt-2 font-mono-luxury tracking-widest">
                REFERENCE: {confirmedBookingRef}
              </p>
            </div>

            <div className="w-full border-t border-b border-[#0b1a24]/10 dark:border-white/10 py-6 my-2 text-left flex flex-col gap-4 text-xs font-body-luxury text-[#576875]">
              <div className="flex justify-between">
                <span>Guest Name</span>
                <span className="font-semibold text-[#0b1a24] dark:text-[#f3f4f6]">
                  {confirmedDetails.contactName}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Flight Number</span>
                <span className="font-semibold text-[#0b1a24] dark:text-[#f3f4f6] font-mono">
                  {confirmedDetails.flightNum}
                  {confirmedDetails.flightNum2 ? ` / ${confirmedDetails.flightNum2}` : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Route</span>
                <span className="font-semibold text-[#0b1a24] dark:text-[#f3f4f6] font-mono">
                  {confirmedDetails.origin} → {confirmedDetails.destination}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Travelers</span>
                <span className="font-semibold text-[#0b1a24] dark:text-[#f3f4f6]">
                  {confirmedDetails.travelers} Guest(s)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Concierge Add-ons</span>
                <span className="font-semibold text-[#0b1a24] dark:text-[#f3f4f6]">
                  {confirmedDetails.serviceIds.length} Service(s)
                </span>
              </div>
              <div className="flex justify-between border-t border-dashed border-[#0b1a24]/10 dark:border-white/10 pt-4 mt-2">
                <span className="font-mono-luxury uppercase text-[9px] tracking-wider">
                  Total Quote Price
                </span>
                <span className="text-lg font-bold text-[#0c3b46] dark:text-[#c5a059]">
                  ₹{confirmedDetails.totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#576875] leading-relaxed max-w-sm font-body-luxury">
              Our flight concierge team has been notified. We will coordinate directly with the
              airport authorities and pre-stage your handlers.
            </p>

            {/* Premium centered QR Code */}
            {confirmedDetails.bookingId && (
              <div className="flex flex-col items-center gap-2 p-4 bg-[#fcfbfa] border border-[#e2e8f0] rounded-2xl shadow-sm">
                <div className="p-2.5 bg-white border border-[#e2e8f0] rounded-xl">
                  <QRCodeSVG
                    value={`${window.location.origin}/verify/${confirmedDetails.bookingId}`}
                    size={110}
                    level="M"
                    fgColor="#0d2a36"
                    includeMargin={false}
                  />
                </div>
                <span className="text-[8px] font-mono-luxury uppercase tracking-widest text-[#576875]">
                  Scan to Verify Reservation
                </span>
              </div>
            )}

            <button
              onClick={() => {
                setConfirmedBookingRef(null);
                setConfirmedDetails(null);
                router.navigate({ to: "/" });
              }}
              className="w-full btn-primary-luxury mt-4"
            >
              Return to Flight Deck
            </button>
          </motion.div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer tone="cream">
      <RouteTopbar>
        <Link
          to="/"
          className="text-[10px] uppercase tracking-[0.32em] transition hover:opacity-70 flex items-center gap-2 text-[#576875]"
        >
          ← Shafsky Aviation
        </Link>
      </RouteTopbar>

      <AnimatedBookingTimeline activeStep={activeStep} />

      <div className="mt-4 flex flex-col gap-8 pb-24">
        {/* ══════════════════════════════════════════════════
            1. FLIGHT VALIDATED SECTION
        ══════════════════════════════════════════════════ */}
        <section className="w-full animate-fadeIn">
          <AnimatePresence mode="wait">
            {!isFlightValidated ? (
              <motion.div
                key="flight-unvalidated"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="rounded-2xl panel-luxury p-6 sm:p-8 shadow-luxury-md"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-[#0c3b46]/5 dark:bg-[#c5a059]/5 border border-[#0c3b46]/10 dark:border-[#c5a059]/10 text-[#0c3b46] dark:text-[#c5a059] flex items-center justify-center">
                    <Search size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[#0b1a24] dark:text-[#f3f4f6]">
                      Verify Flight Coordinates
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Verify your flight details to open concierge options.
                    </p>
                  </div>
                </div>

                {/* Pre-validation parameters config */}
                <div
                  className={`grid gap-5 mb-5 transition-all duration-300 ${
                    form.trip_type === "multi_city" ? "sm:grid-cols-4" : "sm:grid-cols-3"
                  }`}
                >
                  {/* Service Type */}
                  <div className="flex flex-col gap-1 w-full animate-fadeIn">
                    <span
                      className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                      style={pageMono}
                    >
                      Service Type
                    </span>
                    <select
                      value={form.trip_type}
                      onChange={(e) => {
                        const newTripType = e.target.value as
                          "one_way" | "round_trip" | "multi_city";
                        let newServiceType = "Airport Services";
                        if (newTripType === "one_way") {
                          newServiceType = "Departure Service";
                          setDepSectionOpen(true);
                          setArrSectionOpen(false);
                        } else if (newTripType === "round_trip") {
                          newServiceType = "Arrival Service";
                          setDepSectionOpen(false);
                          setArrSectionOpen(true);
                        } else if (newTripType === "multi_city") {
                          newServiceType = "Connection Service";
                          setDepSectionOpen(true);
                          setArrSectionOpen(true);
                        }

                        setForm((prev) => {
                          const updated = {
                            ...prev,
                            trip_type: newTripType,
                            service_type: newServiceType,
                          };
                          // Reset only what no longer matches the service type
                          if (newTripType !== "multi_city") {
                            updated.return_date = "";
                          }
                          return updated;
                        });

                        // Clear second flight validation states if not connection service
                        if (newTripType !== "multi_city") {
                          setFlightNum2("");
                          setValidationError2("");
                          setFlightDetails2(null);
                        }

                        // Re-evaluate validation state immediately based on new target service requirements
                        setIsFlightValidated(
                          newTripType === "multi_city"
                            ? !!flightDetails && !!flightDetails2
                            : !!flightDetails,
                        );
                      }}
                      className="mt-1 w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none transition-all focus:border-teal/50"
                      style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                    >
                      <option value="one_way">Departure Service</option>
                      <option value="round_trip">Arrival Service</option>
                      <option value="multi_city">Connection Service</option>
                    </select>
                  </div>

                  {/* Dynamic Date Fields */}
                  {form.trip_type !== "multi_city" ? (
                    <DatePickerField
                      label={form.trip_type === "round_trip" ? "Arrival Date" : "Departure Date"}
                      datePlaceholder={
                        form.trip_type === "round_trip"
                          ? "Select Arrival Date"
                          : "Select Departure Date"
                      }
                      dateValue={form.depart_date}
                      onDateChange={(val: string) => handleDateChange(true, val)}
                    />
                  ) : (
                    <>
                      <DatePickerField
                        label="Arrival Date"
                        datePlaceholder="Select Arrival Date"
                        dateValue={form.depart_date}
                        onDateChange={(val: string) => handleDateChange(true, val)}
                      />
                      <DatePickerField
                        label="Departure Date"
                        datePlaceholder="Select Departure Date"
                        dateValue={form.return_date || ""}
                        onDateChange={(val: string) => handleDateChange(false, val)}
                      />
                    </>
                  )}

                  {/* Passenger Popover */}
                  <div className="flex flex-col gap-1 w-full">
                    <span
                      className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                      style={pageMono}
                    >
                      Travelers
                    </span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="mt-1 w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none transition-all text-left flex items-center justify-between"
                          style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                        >
                          <span>
                            {totalPax} Traveler{totalPax > 1 ? "s" : ""}
                          </span>
                          <Users size={13} className="text-gray-400" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-4 flex flex-col gap-4">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold">Adults</span>
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  pax_adults: Math.max(1, prev.pax_adults - 1),
                                }))
                              }
                              className="h-7 w-7 rounded bg-black/5 hover:bg-black/10 flex items-center justify-center font-bold"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="font-semibold w-4 text-center">{form.pax_adults}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  pax_adults: Math.min(20, prev.pax_adults + 1),
                                }))
                              }
                              className="h-7 w-7 rounded bg-black/5 hover:bg-black/10 flex items-center justify-center font-bold"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold">Children (2-12)</span>
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  pax_children: Math.max(0, prev.pax_children - 1),
                                }))
                              }
                              className="h-7 w-7 rounded bg-black/5 hover:bg-black/10 flex items-center justify-center font-bold"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="font-semibold w-4 text-center">
                              {form.pax_children}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  pax_children: Math.min(10, prev.pax_children + 1),
                                }))
                              }
                              className="h-7 w-7 rounded bg-black/5 hover:bg-black/10 flex items-center justify-center font-bold"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FlightInput
                    label={
                      form.trip_type === "multi_city"
                        ? "Flight 1 Number (Arrival)"
                        : "Flight Number"
                    }
                    value={flightNum}
                    onChange={setFlightNum}
                    error={validationError}
                    isValidating={isValidating}
                    isValid={!!flightDetails}
                  />
                  {form.trip_type === "multi_city" && (
                    <FlightInput
                      label="Flight 2 Number (Connection)"
                      value={flightNum2}
                      onChange={setFlightNum2}
                      error={validationError2}
                      isValidating={isValidating}
                      isValid={!!flightDetails2}
                    />
                  )}
                </div>

                {/* Verification Loading State */}
                {isValidating && (
                  <div className="mt-4 p-5 rounded-2xl bg-white/40 border border-sky-200/80 flex items-center gap-4 animate-fadeIn">
                    <Loader2 size={20} className="animate-spin text-sky-500 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-sky-800">Verifying flight details...</p>
                      <p className="text-[10px] text-sky-600 mt-0.5">Checking live flight databases for the latest information.</p>
                    </div>
                  </div>
                )}

                {/* Manual Fallback Entry Forms — shown automatically when API verification fails */}
                {isManualMode && !isValidating && (
                  <div className="mt-4 p-5 rounded-2xl bg-white/40 border border-amber-200/80 flex flex-col gap-4 animate-fadeIn">
                    {/* Inline error banner */}
                    {validationError && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 animate-fadeIn">
                        <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Automatic verification failed</p>
                          <p className="text-amber-700 mt-0.5">{validationError}</p>
                        </div>
                      </div>
                    )}
                    <div
                      className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-800 flex items-center gap-1.5"
                      style={pageMono}
                    >
                      <AlertCircle size={14} className="text-amber-600 animate-pulse" />
                      Flight 1 Coordinates (Manual Entry)
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {/* Flight Number (pre-filled, disabled) */}
                      <div className="flex flex-col gap-1 w-full opacity-75">
                        <span
                          className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                          style={pageMono}
                        >
                          Flight Number
                        </span>
                        <input
                          type="text"
                          value={flightNum.toUpperCase()}
                          disabled
                          className="mt-1 w-full h-11 rounded-xl border bg-gray-100/70 px-4 text-xs font-semibold outline-none cursor-not-allowed"
                          style={{ borderColor: creamTheme.line, color: creamTheme.muted }}
                        />
                      </div>

                      {/* Airline Name */}
                      <div className="flex flex-col gap-1 w-full">
                        <span
                          className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                          style={pageMono}
                        >
                          Airline Name
                        </span>
                        <input
                          type="text"
                          value={manualAirline}
                          onChange={(e) => setManualAirline(e.target.value)}
                          placeholder="e.g. Air India"
                          className="mt-1 w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none focus:border-teal/50"
                          style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                        />
                      </div>

                      <AirportSearchInput
                        label="Departure Airport"
                        query={manualOriginQuery}
                        setQuery={setManualOriginQuery}
                        selectedCode={manualOrigin}
                        setSelectedCode={setManualOrigin}
                        suggestions={matchingOrigins}
                        placeholder="Search Airport..."
                      />

                      <AirportSearchInput
                        label="Arrival Airport"
                        query={manualDestQuery}
                        setQuery={setManualDestQuery}
                        selectedCode={manualDest}
                        setSelectedCode={setManualDest}
                        suggestions={matchingDests}
                        placeholder="Search Airport..."
                      />

                      {/* Departure Date (pre-filled, disabled) */}
                      <div className="flex flex-col gap-1 w-full opacity-75">
                        <span
                          className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                          style={pageMono}
                        >
                          Departure Date
                        </span>
                        <input
                          type="text"
                          value={form.depart_date}
                          disabled
                          className="mt-1 w-full h-11 rounded-xl border bg-gray-100/70 px-4 text-xs font-semibold outline-none cursor-not-allowed"
                          style={{ borderColor: creamTheme.line, color: creamTheme.muted }}
                        />
                      </div>

                      {/* Departure Time */}
                      <div className="flex flex-col gap-1 w-full">
                        <span
                          className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                          style={pageMono}
                        >
                          Departure Time
                        </span>
                        <input
                          type="time"
                          value={manualTime}
                          onChange={(e) => setManualTime(e.target.value)}
                          className="mt-1 w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none focus:border-teal/50"
                          style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                        />
                      </div>

                      {/* Optional Arrival Date */}
                      <div className="flex flex-col gap-1 w-full">
                        <span
                          className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                          style={pageMono}
                        >
                          Arrival Date (Optional)
                        </span>
                        <input
                          type="date"
                          value={manualArrivalDate}
                          onChange={(e) => setManualArrivalDate(e.target.value)}
                          className="mt-1 w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none focus:border-teal/50"
                          style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                        />
                      </div>

                      {/* Optional Arrival Time */}
                      <div className="flex flex-col gap-1 w-full">
                        <span
                          className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                          style={pageMono}
                        >
                          Arrival Time (Optional)
                        </span>
                        <input
                          type="time"
                          value={manualArrivalTime}
                          onChange={(e) => setManualArrivalTime(e.target.value)}
                          className="mt-1 w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none focus:border-teal/50"
                          style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {isManualMode2 && !isValidating && form.trip_type === "multi_city" && (
                  <div className="mt-4 p-5 rounded-2xl bg-white/40 border border-amber-200/80 flex flex-col gap-4 animate-fadeIn">
                    <div
                      className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-800 flex items-center gap-1.5"
                      style={pageMono}
                    >
                      <AlertCircle size={14} className="text-amber-600 animate-pulse" />
                      Flight 2 Coordinates (Manual Entry)
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {/* Flight Number (pre-filled, disabled) */}
                      <div className="flex flex-col gap-1 w-full opacity-75">
                        <span
                          className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                          style={pageMono}
                        >
                          Flight 2 Number
                        </span>
                        <input
                          type="text"
                          value={flightNum2.toUpperCase()}
                          disabled
                          className="mt-1 w-full h-11 rounded-xl border bg-gray-100/70 px-4 text-xs font-semibold outline-none cursor-not-allowed"
                          style={{ borderColor: creamTheme.line, color: creamTheme.muted }}
                        />
                      </div>

                      {/* Airline Name */}
                      <div className="flex flex-col gap-1 w-full">
                        <span
                          className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                          style={pageMono}
                        >
                          Airline Name
                        </span>
                        <input
                          type="text"
                          value={manualAirline2}
                          onChange={(e) => setManualAirline2(e.target.value)}
                          placeholder="e.g. Air India"
                          className="mt-1 w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none focus:border-teal/50"
                          style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                        />
                      </div>

                      <AirportSearchInput
                        label="Departure Airport"
                        query={manualOriginQuery2}
                        setQuery={setManualOriginQuery2}
                        selectedCode={manualOrigin2}
                        setSelectedCode={setManualOrigin2}
                        suggestions={matchingOrigins2}
                        placeholder="Search Airport..."
                      />

                      <AirportSearchInput
                        label="Arrival Airport"
                        query={manualDestQuery2}
                        setQuery={setManualDestQuery2}
                        selectedCode={manualDest2}
                        setSelectedCode={setManualDest2}
                        suggestions={matchingDests2}
                        placeholder="Search Airport..."
                      />

                      {/* Departure Date (pre-filled, disabled) */}
                      <div className="flex flex-col gap-1 w-full opacity-75">
                        <span
                          className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                          style={pageMono}
                        >
                          Departure Date
                        </span>
                        <input
                          type="text"
                          value={form.return_date || form.depart_date}
                          disabled
                          className="mt-1 w-full h-11 rounded-xl border bg-gray-100/70 px-4 text-xs font-semibold outline-none cursor-not-allowed"
                          style={{ borderColor: creamTheme.line, color: creamTheme.muted }}
                        />
                      </div>

                      {/* Departure Time */}
                      <div className="flex flex-col gap-1 w-full">
                        <span
                          className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                          style={pageMono}
                        >
                          Departure Time
                        </span>
                        <input
                          type="time"
                          value={manualTime2}
                          onChange={(e) => setManualTime2(e.target.value)}
                          className="mt-1 w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none focus:border-teal/50"
                          style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                        />
                      </div>

                      {/* Optional Arrival Date */}
                      <div className="flex flex-col gap-1 w-full">
                        <span
                          className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                          style={pageMono}
                        >
                          Arrival Date (Optional)
                        </span>
                        <input
                          type="date"
                          value={manualArrivalDate2}
                          onChange={(e) => setManualArrivalDate2(e.target.value)}
                          className="mt-1 w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none focus:border-teal/50"
                          style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                        />
                      </div>

                      {/* Optional Arrival Time */}
                      <div className="flex flex-col gap-1 w-full">
                        <span
                          className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                          style={pageMono}
                        >
                          Arrival Time (Optional)
                        </span>
                        <input
                          type="time"
                          value={manualArrivalTime2}
                          onChange={(e) => setManualArrivalTime2(e.target.value)}
                          className="mt-1 w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none focus:border-teal/50"
                          style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(isManualMode || isManualMode2) && (
                  <div className="flex justify-start">
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualMode(false);
                        setIsManualMode2(false);
                        setManualAirline("");
                        setManualOrigin("");
                        setManualDest("");
                        setManualTime("");
                        setManualOriginQuery("");
                        setManualDestQuery("");
                        setManualArrivalDate("");
                        setManualArrivalTime("");
                        setManualAirline2("");
                        setManualOrigin2("");
                        setManualDest2("");
                        setManualTime2("");
                        setManualOriginQuery2("");
                        setManualDestQuery2("");
                        setManualArrivalDate2("");
                        setManualArrivalTime2("");
                      }}
                      className="mt-3 text-[10px] uppercase tracking-wider font-bold text-gray-400 hover:text-red-500 transition-colors"
                      style={pageMono}
                    >
                      Cancel Manual Entry
                    </button>
                  </div>
                )}

                {validationWarning && (
                  <div className="text-xs text-red-500 font-semibold mt-4 mb-4 animate-fadeIn">
                    {validationWarning}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleManualValidation}
                  disabled={
                    isValidating ||
                    !!validationWarning ||
                    !form.depart_date ||
                    (form.trip_type === "multi_city" && !form.return_date)
                  }
                  className="mt-6 flex items-center gap-2 rounded-xl py-3 px-6 text-[10px] font-semibold uppercase tracking-[0.22em] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-sm text-white"
                  style={{ backgroundColor: creamTheme.teal }}
                >
                  {isValidating ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Verifying clearances...
                    </>
                  ) : (
                    <>
                      <Search size={13} />
                      Verify Flight
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="flight-validated"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="rounded-2xl panel-luxury p-6 sm:p-8 shadow-luxury-md"
              >
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-6"
                  style={{ borderColor: creamTheme.line }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} style={{ color: creamTheme.teal }} />
                    <span
                      className="text-sm font-bold uppercase tracking-wider"
                      style={{ color: creamTheme.teal }}
                    >
                      Flight Clearance Confirmed
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetValidation}
                    className="text-[10px] uppercase tracking-wider font-bold text-gray-400 hover:text-red-500 transition-colors sm:self-center"
                    style={pageMono}
                  >
                    Change Flight Coordinates
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-12 items-center">
                  <div className="md:col-span-8">
                    <div className="space-y-4">
                      {flightDetails && <BoardingPassCard details={flightDetails} />}
                      {flightDetails2 && (
                        <BoardingPassCard details={flightDetails2} label="Connecting Segment" />
                      )}
                    </div>
                  </div>

                  <div
                    className="md:col-span-4 rounded-2xl bg-black/[0.02] border p-5 flex flex-col gap-4"
                    style={{ borderColor: creamTheme.line }}
                  >
                    <h3
                      className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-60"
                      style={pageMono}
                    >
                      Terminal & Airline
                    </h3>
                    <div className="divide-y divide-black/5 text-xs">
                      <div className="flex justify-between py-2">
                        <span className="opacity-60">Airline Carrier</span>
                        <span className="font-semibold text-right">
                          {flightDetails?.carrierName || flightDetails?.flightNum.slice(0, 2)}
                        </span>
                      </div>
                      {flightDetails?.depTerminal && (
                        <div className="flex justify-between py-2">
                          <span className="opacity-60">Departure Terminal</span>
                          <span className="font-semibold">{flightDetails.depTerminal}</span>
                        </div>
                      )}
                      {flightDetails?.arrTerminal && (
                        <div className="flex justify-between py-2">
                          <span className="opacity-60">Arrival Terminal</span>
                          <span className="font-semibold">{flightDetails.arrTerminal}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {isFlightValidated && (
          <>
            {/* ══════════════════════════════════════════════════
                2. TWO-COLUMN ROW BELOW IT
            ══════════════════════════════════════════════════ */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Left Column: Booking Summary */}
              <div className="rounded-2xl panel-luxury p-6 shadow-luxury-md flex flex-col justify-between">
                <div>
                  <div
                    className="flex items-center gap-2 border-b pb-3 mb-4"
                    style={{ borderColor: creamTheme.line }}
                  >
                    <Sparkles size={14} style={{ color: creamTheme.teal }} />
                    <h3
                      className="text-[10px] uppercase tracking-[0.24em] font-bold"
                      style={{ ...pageMono, color: creamTheme.teal }}
                    >
                      Booking Summary
                    </h3>
                  </div>

                  <div className="divide-y divide-black/5 text-xs">
                    <div className="flex justify-between py-2.5">
                      <span className="opacity-60" style={pageMono}>
                        Flight Number
                      </span>
                      <span className="font-mono font-bold tracking-wider">
                        {flightNum.toUpperCase()}
                        {flightNum2 ? ` / ${flightNum2.toUpperCase()}` : ""}
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="opacity-60" style={pageMono}>
                        Route
                      </span>
                      <span className="font-semibold">
                        {flightDetails?.originCode} →{" "}
                        {flightDetails2 ? flightDetails2.destCode : flightDetails?.destCode}
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="opacity-60" style={pageMono}>
                        {form.trip_type === "one_way"
                          ? "Departure Date"
                          : form.trip_type === "round_trip"
                            ? "Arrival Date"
                            : "Travel Dates"}
                      </span>
                      <span className="font-semibold">
                        {form.trip_type === "multi_city"
                          ? `${form.depart_date} ${departTime} / ${form.return_date ? `${form.return_date} ${returnTime}` : "—"}`
                          : `${form.depart_date} ${departTime}`}
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="opacity-60" style={pageMono}>
                        Passenger Count
                      </span>
                      <span className="font-semibold">
                        {totalPax} Traveler{totalPax > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="opacity-60" style={pageMono}>
                        Selected Services
                      </span>
                      <span
                        className="font-semibold text-teal-800"
                        style={{ color: creamTheme.teal }}
                      >
                        {selectedServiceIds.length} Added
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="mt-6 pt-4 border-t flex flex-col gap-1.5"
                  style={{ borderColor: creamTheme.line }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] uppercase tracking-wider font-bold opacity-60"
                      style={pageMono}
                    >
                      Total Summary Price
                    </span>
                    <span
                      className="text-2xl font-black text-teal-900 bg-teal-800/[0.04] border border-teal-800/10 px-3 py-1 rounded-2xl shadow-[inset_0_1px_2px_rgba(13,90,110,0.03)] animate-pulse-subtle"
                      style={{ color: creamTheme.teal }}
                    >
                      ₹{totalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div
                    className="flex justify-end text-[9px] text-gray-400 font-bold tracking-wider"
                    style={pageMono}
                  >
                    (Approx. ${Math.round(totalPrice / 83).toLocaleString()} USD)
                  </div>
                </div>
              </div>

              {/* Right Column: Contact Details */}
              <div className="rounded-2xl panel-luxury p-6 shadow-luxury-md">
                <div
                  className="flex items-center gap-2 border-b pb-3 mb-4"
                  style={{ borderColor: creamTheme.line }}
                >
                  <User size={14} style={{ color: creamTheme.teal }} />
                  <h3
                    className="text-[10px] uppercase tracking-[0.24em] font-bold"
                    style={{ ...pageMono, color: creamTheme.teal }}
                  >
                    Contact Details
                  </h3>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <FormInput
                    id="contact_name"
                    label="Full Name"
                    required
                    value={form.contact_name}
                    onChange={(v) => setForm({ ...form, contact_name: v })}
                    placeholder="e.g. John Doe"
                  />
                  <FormInput
                    id="contact_email"
                    label="Email Address"
                    type="email"
                    required
                    value={form.contact_email}
                    onChange={(v) => setForm({ ...form, contact_email: v })}
                    placeholder="e.g. john@example.com"
                  />
                  <div className="flex flex-col gap-1 w-full">
                    <span
                      className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                      style={pageMono}
                    >
                      Phone Number
                    </span>
                    <div className="flex gap-2 mt-1 relative">
                      <Popover open={countryDropdownOpen} onOpenChange={setCountryDropdownOpen}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="w-28 shrink-0 h-10 rounded-xl border bg-white/60 px-2.5 text-xs font-semibold outline-none focus:border-teal/50 text-gray-800 flex items-center justify-between gap-1 transition-all hover:bg-white/90"
                            style={{ borderColor: creamTheme.line }}
                          >
                            <span className="truncate">
                              {getFlagEmoji(selectedCountry.code)} {selectedCountry.dial}
                            </span>
                            <ChevronDown size={14} className="opacity-50 shrink-0" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-64 p-0 bg-white border border-gray-100 shadow-xl rounded-xl z-50"
                          align="start"
                        >
                          <Command className="bg-white">
                            <CommandInput
                              placeholder="Search country..."
                              className="text-xs h-9 border-none focus:ring-0"
                            />
                            <CommandList className="max-h-60 overflow-y-auto p-1">
                              <CommandEmpty className="text-xs text-gray-500 py-3 px-4">
                                No country found.
                              </CommandEmpty>
                              <CommandGroup>
                                {COUNTRIES.map((c) => (
                                  <CommandItem
                                    key={`${c.code}-${c.dial}`}
                                    value={`${c.name} ${c.dial} ${c.code}`}
                                    onSelect={() => {
                                      setSelectedCountry(c);
                                      setCountryDropdownOpen(false);
                                      // Re-format value with new country rules
                                      const formatted = new AsYouType(c.code as CountryCode).input(
                                        phoneBody,
                                      );
                                      setPhoneBody(formatted);
                                    }}
                                    className="flex items-center justify-between text-xs py-2 px-3 hover:bg-teal-50/50 cursor-pointer rounded-lg aria-selected:bg-teal-50 aria-selected:text-teal-900 transition-colors"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <span>{getFlagEmoji(c.code)}</span>
                                      <span className="font-semibold text-gray-800">{c.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 shrink-0">
                                      {c.dial}
                                    </span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      <input
                        id="contact_phone"
                        type="tel"
                        required
                        value={phoneBody}
                        onChange={(e) => {
                          const val = e.target.value;
                          const formatted = new AsYouType(
                            selectedCountry.code as CountryCode,
                          ).input(val);
                          setPhoneBody(formatted);
                        }}
                        placeholder="e.g. 98765 43210"
                        className={`flex-1 min-w-0 h-10 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none transition-all focus:border-teal/50 text-gray-800 ${
                          phoneError ? "border-red-400 focus:border-red-500" : ""
                        }`}
                        style={{ borderColor: phoneError ? undefined : creamTheme.line }}
                      />
                    </div>
                    {phoneError && (
                      <span className="text-[9px] text-red-500 font-medium ml-1 mt-0.5">
                        {phoneError}
                      </span>
                    )}
                  </div>
                  <FormInput
                    label="Company Name"
                    value={form.company}
                    onChange={(v) => setForm({ ...form, company: v })}
                    placeholder="e.g. Acme Corp"
                  />
                </div>

                {/* Docs uploads */}
                <div
                  className="mt-4 border-t pt-3.5 grid gap-3 grid-cols-2"
                  style={{ borderColor: creamTheme.line }}
                >
                  <FileUploadCard
                    label="Passport Copy (Optional)"
                    file={passportFile}
                    onChange={setPassportFile}
                  />
                  <FileUploadCard
                    label="Visa Copy (Optional)"
                    file={visaFile}
                    onChange={setVisaFile}
                  />
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════════════
                3. DEPARTURE SERVICES SECTION
            ══════════════════════════════════════════════════ */}
            <section className="w-full">
              {/* Custom CSS for animations */}
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                @keyframes glide-cyan {
                  0%, 100% { transform: translateY(0) translateX(0) rotate(12deg); }
                  50% { transform: translateY(-4px) translateX(6px) rotate(15deg); }
                }
                @keyframes glide-amber {
                  0%, 100% { transform: translateY(0) translateX(0) rotate(-12deg); }
                  50% { transform: translateY(-4px) translateX(6px) rotate(-15deg); }
                }
                .animate-glide-cyan {
                  animation: glide-cyan 4s ease-in-out infinite;
                }
                .animate-glide-amber {
                  animation: glide-amber 4s ease-in-out infinite;
                }
              `,
                }}
              />

              {/* Redesigned Departure Section Heading — Collapsible */}
              <button
                type="button"
                onClick={() => setDepSectionOpen((prev) => !prev)}
                className="relative overflow-hidden w-full rounded-2xl p-6 md:py-7 md:px-8 mb-6 border border-[#0b1a24]/10 dark:border-white/10 panel-luxury shadow-luxury-md transition-all duration-400 group cursor-pointer text-left"
              >
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 z-10">
                  {/* Left Side Icon Badge & Title */}
                  <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
                    {/* circular badge with takeoff plane */}
                    <div className="relative flex items-center justify-center h-14 w-14 rounded-full bg-[#0c3b46]/5 dark:bg-[#c5a059]/5 border border-[#0c3b46]/10 dark:border-[#c5a059]/10 text-[#0c3b46] dark:text-[#c5a059] shadow-luxury-sm">
                      <PlaneTakeoff className="h-6 w-6 group-hover:scale-105 transition-transform duration-300" />
                    </div>

                    <div>
                      <h3 className="text-xl md:text-2xl font-bold tracking-wider text-[#0b1a24] dark:text-[#f3f4f6] font-display-luxury">
                        Add <span className="text-[#c5a059] font-extrabold italic">Departure</span>{" "}
                        Services
                      </h3>
                      <p className="text-xs md:text-[13px] text-[#576875] font-mono-luxury tracking-widest mt-2 flex items-center justify-center md:justify-start gap-2">
                        Select and add services to enhance your departure experience at{" "}
                        {departureAirportName}
                      </p>
                    </div>
                  </div>

                  {/* Chevron toggle indicator */}
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#0c3b46]/5 dark:bg-[#c5a059]/5 border border-[#0c3b46]/10 dark:border-[#c5a059]/10 transition-transform duration-300">
                    <ChevronDown
                      className={`h-5 w-5 text-[#0c3b46] dark:text-[#c5a059] transition-transform duration-300 ${
                        depSectionOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </div>
                </div>
              </button>

              {depSectionOpen && (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
                  {DEPARTURE_SERVICES.map((svc) => (
                    <ServiceGridCard
                      key={svc.id}
                      svc={svc}
                      selected={selectedServiceIds.includes(svc.id)}
                      onClick={() => toggleServiceId(svc.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ══════════════════════════════════════════════════
                4. ARRIVAL SERVICES SECTION
            ══════════════════════════════════════════════════ */}
            <section className="w-full">
              {/* Redesigned Arrival Section Heading — Collapsible */}
              <button
                type="button"
                onClick={() => setArrSectionOpen((prev) => !prev)}
                className="relative overflow-hidden w-full rounded-2xl p-6 md:py-7 md:px-8 mb-6 border border-[#0b1a24]/10 dark:border-white/10 panel-luxury shadow-luxury-md transition-all duration-400 group cursor-pointer text-left"
              >
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 z-10">
                  {/* Left Side Icon Badge & Title */}
                  <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
                    {/* circular badge with landing plane */}
                    <div className="relative flex items-center justify-center h-14 w-14 rounded-full bg-[#0c3b46]/5 dark:bg-[#c5a059]/5 border border-[#0c3b46]/10 dark:border-[#c5a059]/10 text-[#0c3b46] dark:text-[#c5a059] shadow-luxury-sm">
                      <PlaneLanding className="h-6 w-6 group-hover:scale-105 transition-transform duration-300" />
                    </div>

                    <div>
                      <h3 className="text-xl md:text-2xl font-bold tracking-wider text-[#0b1a24] dark:text-[#f3f4f6] font-display-luxury">
                        Add <span className="text-[#c5a059] font-extrabold italic">Arrival</span>{" "}
                        Services
                      </h3>
                      <p className="text-xs md:text-[13px] text-[#576875] font-mono-luxury tracking-widest mt-2 flex items-center justify-center md:justify-start gap-2">
                        Select and add services to enhance your arrival experience at{" "}
                        {arrivalAirportName}
                      </p>
                    </div>
                  </div>

                  {/* Chevron toggle indicator */}
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#0c3b46]/5 dark:bg-[#c5a059]/5 border border-[#0c3b46]/10 dark:border-[#c5a059]/10 transition-transform duration-300">
                    <ChevronDown
                      className={`h-5 w-5 text-[#0c3b46] dark:text-[#c5a059] transition-transform duration-300 ${
                        arrSectionOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </div>
                </div>
              </button>

              {arrSectionOpen && (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
                  {ARRIVAL_SERVICES.map((svc) => (
                    <ServiceGridCard
                      key={svc.id}
                      svc={svc}
                      selected={selectedServiceIds.includes(svc.id)}
                      onClick={() => toggleServiceId(svc.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Special handling requests */}
            <div className="panel-luxury p-6 rounded-2xl shadow-luxury-sm">
              <span className="block font-mono-luxury text-gray-400">
                Special Handling / Custom Concierge Requests
              </span>
              <textarea
                rows={3}
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="e.g. Dietary requirements, wheelchair, elderly escort, vehicle plates..."
                className="mt-2 textarea-luxury text-[#0b1a24] dark:text-[#f3f4f6]"
              />
            </div>

            {/* Submit Reservation button */}
            {/* Six hour violation warning banner */}
            {isSixHourViolated && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2.5 mb-4 animate-fadeIn">
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-wider">Booking Limit Exceeded</p>
                  <p className="text-red-700 mt-1 whitespace-pre-line">{validationWarning}</p>
                </div>
              </div>
            )}

            {/* Submit Reservation button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={busy || isSixHourViolated}
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 bg-teal-800 text-white text-[11px] font-bold uppercase tracking-[0.26em] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer shadow-lg animate-fadeIn"
              style={{
                backgroundColor: creamTheme.teal,
                boxShadow: "0 8px 30px -4px rgba(13,90,110,0.3)",
              }}
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting Booking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm & Request Airport Services
                </>
              )}
            </button>
          </>
        )}
      </div>
    </PageContainer>
  );
}

/* ───────────────────── Sub-Components ───────────────────── */

function FlightInput({
  label,
  value,
  onChange,
  error,
  isValidating,
  isValid,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error: string;
  isValidating: boolean;
  isValid: boolean;
  className?: string;
}) {
  return (
    <div className={`relative flex flex-col gap-1 w-full ${className}`}>
      <span
        className="text-[9px] uppercase tracking-[0.26em] font-semibold text-gray-400"
        style={pageMono}
      >
        {label}
      </span>
      <div className="relative mt-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="e.g. AI2424, EK501"
          className={`w-full h-11 rounded-xl border bg-white/60 pl-4 pr-10 text-xs font-semibold uppercase outline-none transition-all focus:border-teal/50 ${
            error ? "border-red-400 focus:border-red-500" : ""
          }`}
          style={{ borderColor: error ? undefined : creamTheme.line }}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          {isValidating ? (
            <Loader2 size={14} className="animate-spin text-teal-600" />
          ) : isValid ? (
            <Check size={14} className="text-teal-600 font-bold" />
          ) : error ? (
            <AlertCircle size={14} className="text-red-500" />
          ) : null}
        </div>
      </div>
      {error && <span className="text-[9px] text-red-500 font-medium ml-1 mt-0.5">{error}</span>}
    </div>
  );
}

const getDayOffsetMarker = (depIso?: string, arrIso?: string): string | null => {
  if (!depIso || !arrIso) return null;
  try {
    const d1 = new Date(depIso);
    const d2 = new Date(arrIso);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

    const day1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
    const day2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
    const dayDiff = Math.round((day2 - day1) / (86400 * 1000));

    if (dayDiff === 1) return "+1 Day";
    if (dayDiff > 1) return `+${dayDiff} Days`;
  } catch (e) {
    // Fail silently
  }
  return null;
};

const getTimeToDepartureLabel = (depIso?: string): string | null => {
  if (!depIso) return null;
  try {
    const dep = new Date(depIso);
    const now = new Date();
    const diffMs = dep.getTime() - now.getTime();
    if (diffMs <= 0) return "Departed";

    const totalMins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const days = Math.floor(hrs / 24);

    if (days >= 1) {
      return `Departs in ${days}d ${hrs % 24}h`;
    }
    if (hrs >= 1) {
      return `Departs in ${hrs}h ${mins}m`;
    }
    return `Departs in ${mins}m`;
  } catch (e) {
    return null;
  }
};

function BoardingPassCard({ details, label }: { details: FlightDetails; label?: string }) {
  const dayMarker = getDayOffsetMarker(details.rawDepTime, details.rawArrTime);
  const timeToDep = getTimeToDepartureLabel(details.rawDepTime);

  const getStatusBadge = (status?: string) => {
    const st = (status || "Scheduled").toLowerCase();
    if (st.includes("cancel")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Cancelled
        </span>
      );
    }
    if (st.includes("delay")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          Delayed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {status || "On Time"}
      </span>
    );
  };

  return (
    <div
      className="relative rounded-3xl bg-[#fafcfc]/90 p-6 sm:p-7 border flex flex-col gap-5 shadow-[0_12px_30px_-8px_rgba(13,42,54,0.04)] backdrop-blur-md overflow-hidden group hover:shadow-md transition-all duration-300"
      style={{ borderColor: creamTheme.line }}
    >
      {/* Boarding ticket notched style */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-7 rounded-r-full bg-[#f4f3f0] border-y border-r -ml-[1px]"
        style={{ borderColor: creamTheme.line }}
      />
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-7 rounded-l-full bg-[#f4f3f0] border-y border-l -mr-[1px]"
        style={{ borderColor: creamTheme.line }}
      />

      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: creamTheme.line }}>
        <div className="flex items-center gap-2">
          {label && (
            <span className="px-2 py-0.5 rounded-md bg-teal-800/10 text-teal-900 text-[10px] font-bold uppercase tracking-wider" style={{ color: creamTheme.teal }}>
              {label}
            </span>
          )}
          <span className="text-xs font-bold text-gray-800 tracking-wider" style={pageMono}>
            {details.carrierName ? `${details.carrierName.toUpperCase()} ` : ""}
            <span className="text-teal-900 font-extrabold">{details.flightNum}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {timeToDep && timeToDep !== "Departed" && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200/80">
              {timeToDep}
            </span>
          )}
          {getStatusBadge(details.status)}
          {details.lastUpdated && (
            <span className="hidden sm:inline-block text-[9px] text-gray-400 font-medium" style={pageMono}>
              Updated {details.lastUpdated}
            </span>
          )}
        </div>
      </div>

      {/* Main Aviation Timeline Layout */}
      <div className="flex flex-col md:flex-row justify-between items-stretch gap-6">
        {/* Left Block (Departure) */}
        <div className="flex-1 flex flex-col justify-between min-h-[90px] pl-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-wider text-gray-900">
                {details.originCode}
              </span>
              {details.depTerminal && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                  {details.depTerminal}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 font-medium block mt-0.5">
              {details.originCity}
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-gray-900 leading-tight">
                {details.depTime}
              </span>
              <span className="text-[10px] text-gray-400 font-bold" style={pageMono}>
                {details.originTimezone || "IST"}
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-medium block mt-0.5" style={pageMono}>
              {details.depDate}
            </span>
          </div>
        </div>

        {/* Middle Block (Track & Duration) */}
        <div className="flex-[3] flex flex-col items-center justify-between min-h-[95px] px-4 py-1">
          {/* Duration Badge */}
          <div className="flex flex-col items-center gap-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 shadow-xs tracking-wide">
              {details.duration}
            </span>
            {details.durationSource && details.durationSource !== "Unavailable" && (
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  details.durationSource === "Live"
                    ? "bg-emerald-100/80 text-emerald-900 border-emerald-300"
                    : details.durationSource === "Calculated"
                    ? "bg-sky-50 text-sky-800 border-sky-200"
                    : "bg-purple-50 text-purple-800 border-purple-200"
                }`}
              >
                {details.durationSource}
              </span>
            )}
          </div>

          {/* Dashed Track Line */}
          <div className="w-full flex items-center justify-between relative h-6 my-2">
            <div className="h-3.5 w-3.5 rounded-full bg-teal-800/10 border border-teal-800/20 flex items-center justify-center shrink-0 z-10">
              <div className="h-1.5 w-1.5 rounded-full bg-teal-800" />
            </div>

            <div className="absolute inset-x-4 top-1/2 h-px border-t border-dashed border-black/25 -translate-y-1/2" />

            <motion.div
              className="absolute top-1/2 -translate-y-1/2 z-10 bg-[#fafcfc] px-1"
              initial={{ left: "5%" }}
              animate={{ left: "90%" }}
              transition={{
                repeat: Infinity,
                duration: 12,
                ease: "linear",
              }}
            >
              <Plane
                size={15}
                className="text-teal-800"
                style={{
                  transform: "rotate(45deg)",
                  color: creamTheme.teal,
                }}
              />
            </motion.div>

            <div className="h-3.5 w-3.5 rounded-full bg-teal-800/10 border border-teal-800/20 flex items-center justify-center shrink-0 z-10">
              <div className="h-1.5 w-1.5 rounded-full bg-teal-800" />
            </div>
          </div>

          {/* Aircraft Model / Extra Meta */}
          {details.aircraftModel ? (
            <span className="text-[10px] text-gray-500 font-semibold tracking-wider" style={pageMono}>
              {details.aircraftModel}
            </span>
          ) : (
            <span className="text-[10px] text-gray-400 font-medium tracking-wider" style={pageMono}>
              Direct Flight
            </span>
          )}
        </div>

        {/* Right Block (Arrival) */}
        <div className="flex-1 flex flex-col justify-between items-start md:items-end text-left md:text-right min-h-[90px] pr-4">
          <div>
            <div className="flex items-baseline gap-2 md:flex-row-reverse">
              <span className="text-2xl font-black tracking-wider text-gray-900">
                {details.destCode}
              </span>
              {details.arrTerminal && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                  {details.arrTerminal}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 font-medium block mt-0.5">
              {details.destCity}
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2 md:flex-row-reverse">
              <span className="text-base font-bold text-gray-900 leading-tight flex items-center gap-1.5">
                {details.arrTime}
                {dayMarker && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-amber-800 bg-amber-100 border border-amber-200">
                    {dayMarker}
                  </span>
                )}
              </span>
              <span className="text-[10px] text-gray-400 font-bold" style={pageMono}>
                {details.destTimezone || "IST"}
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-medium block mt-0.5" style={pageMono}>
              {details.arrDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormInput({
  id,
  label,
  type = "text",
  required,
  value,
  onChange,
  placeholder,
}: {
  id?: string;
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <span className="block font-mono-luxury text-gray-400">
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full input-luxury text-[#0b1a24] dark:text-[#f3f4f6]"
      />
    </div>
  );
}

function ServiceGridCard({
  svc,
  selected,
  onClick,
}: {
  svc: ServiceItem;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col rounded-2xl overflow-hidden text-left panel-luxury transition-all duration-400 shadow-luxury-sm outline-none hover:shadow-luxury-md ${
        selected
          ? "border-[#c5a059] ring-1 ring-[#c5a059]/30 scale-[1.01]"
          : "border-black/5 hover:border-[#c5a059]/20"
      }`}
    >
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={svc.img}
          alt={svc.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 z-10 bg-[#faf8f5]/90 dark:bg-[#0a0c10]/90 backdrop-blur-sm rounded-lg px-2.5 py-1 border border-[#0b1a24]/10 dark:border-white/10 text-[10px] font-bold text-[#c5a059] tracking-wider font-mono-luxury">
          ₹{svc.price.toLocaleString("en-IN")}
        </div>
        {selected && (
          <div className="absolute inset-0 bg-[#c5a059]/10 backdrop-blur-[1px] flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-white dark:bg-[#0a0c10] border border-[#c5a059] text-[#c5a059] flex items-center justify-center shadow-luxury-md">
              <Check size={18} strokeWidth={3.5} />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-semibold text-[#0b1a24] dark:text-[#f3f4f6] leading-snug group-hover:text-[#c5a059] transition-colors font-body-luxury">
            {svc.title}
          </h4>
          <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed font-medium font-body-luxury">
            {svc.desc}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#0b1a24]/5 dark:border-white/5 flex items-center justify-between text-[9px] tracking-widest font-mono-luxury">
          <span className={selected ? "text-[#c5a059]" : "text-[#576875]"}>
            {selected ? "Selected" : "Select Service"}
          </span>
          <ArrowRight
            size={12}
            className={`transition-transform duration-300 ${selected ? "translate-x-0.5 text-[#c5a059]" : "opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 text-[#576875]"}`}
          />
        </div>
      </div>
    </button>
  );
}

function FileUploadCard({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  return (
    <div className="block min-w-0">
      <span
        className="block text-[9px] uppercase tracking-[0.24em] font-semibold"
        style={{ ...pageMono, color: creamTheme.muted }}
      >
        {label}
      </span>
      <div className="relative mt-1.5">
        {file ? (
          <div
            className="flex h-12 items-center justify-between gap-3 rounded-xl border px-3 transition-colors"
            style={{
              borderColor: creamTheme.teal,
              background: "rgba(13,90,110,0.04)",
            }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <FileText size={14} style={{ color: creamTheme.teal }} />
              <div className="min-w-0">
                <div className="truncate text-[10px] font-bold" style={{ color: creamTheme.ink }}>
                  {file.name}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors text-sm"
            >
              &times;
            </button>
          </div>
        ) : (
          <label className="group block cursor-pointer">
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => onChange(e.target.files?.[0] || null)}
              className="hidden"
            />
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-dashed transition-colors"
              style={{
                borderColor: creamTheme.line,
                background: "rgba(255,255,255,0.45)",
              }}
            >
              <Upload
                size={14}
                style={{ color: creamTheme.muted }}
                className="transition-colors group-hover:text-teal"
              />
              <span
                className="truncate px-3 text-center text-[9px] transition-colors group-hover:text-ink font-semibold"
                style={{ color: creamTheme.muted }}
              >
                Upload File
              </span>
            </motion.div>
          </label>
        )}
      </div>
    </div>
  );
}
