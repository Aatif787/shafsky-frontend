/**
 * Centralized site content constants
 *
 * All public-facing text is defined here so it can be updated in one place.
 * The admin settings panel can override the "editable" subset (hero headline,
 * subtitle, banner CTA, footer tagline) via the `site_content` key in
 * system_settings.
 */

import type { LucideIcon } from "lucide-react";
import { ShieldCheck, Headphones, Globe2, Sparkles, Clock, Award } from "lucide-react";

/* ─────────────────── HERO ─────────────────── */

export const HERO_CONTENT = {
  eyebrow: "Suswagatam · Premium Airport Concierge",
  headline: "Welcome Begins Before You Land.",
  subtitle:
    "Shafsky Aviation's Suswagatam concierge service meets you at the aerobridge, fast-tracks every checkpoint and delivers you to your destination — door to door, every flight.",
  ctaPrimary: "Book Services",
  ctaSecondary: "Private Charter",
  ctaWhatsApp: "WhatsApp Us",
} as const;

/* ─────────────────── WHY CHOOSE US ─────────────────── */

export interface WhyItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export const WHY_CHOOSE_US: WhyItem[] = [
  {
    icon: ShieldCheck,
    title: "Airport-Authorized",
    desc: "We hold direct permissions at 20+ Indian airports — no middlemen, no delays.",
  },
  {
    icon: Headphones,
    title: "24 × 7 Live Dispatch",
    desc: "Our operations desk is always staffed. Call, WhatsApp, or email — response under 12 minutes.",
  },
  {
    icon: Globe2,
    title: "Pan-India + Global",
    desc: "Delhi, Mumbai, Bengaluru, Hyderabad to Dubai, London, Singapore and beyond.",
  },
  {
    icon: Sparkles,
    title: "End-to-End Service",
    desc: "Meet & Greet, fast-track, lounge, transport, hotel, cargo — one team handles everything.",
  },
  {
    icon: Clock,
    title: "6-Hour Guarantee",
    desc: "Book up to 6 hours before departure. For urgent requests, our hotline is always open.",
  },
  {
    icon: Award,
    title: "Trusted by Leaders",
    desc: "Sports legends, filmmakers, diplomats and Fortune 500 executives trust Shafsky Aviation.",
  },
];

/* ─────────────────── TESTIMONIALS ─────────────────── */

export interface TestimonialItem {
  name: string;
  role: string;
  quote: string;
  initials: string;
  color: string;
  image?: string;
}

export const TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Sachin Tendulkar",
    role: "Cricketing Legend",
    quote:
      "Excellent customer services! Whenever I needed something they were there for me. Shafsky Aviation understands what premium travel means.",
    initials: "ST",
    color: "#0d5a6e",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=220&h=220&fit=crop",
  },
  {
    name: "Anuradha Prasad",
    role: "Media Executive",
    quote:
      "One good thing with Shafsky — no hold time when you call. Instant response, every single time. That's rare in this industry.",
    initials: "AP",
    color: "#2d6a4f",
  },
  {
    name: "Madhur Bhandarkar",
    role: "Film Director",
    quote:
      "Thank you for always being on hand to offer help. I especially appreciate you coming up with new ways of working in the aviation field.",
    initials: "MB",
    color: "#6b21a8",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=220&h=220&fit=crop",
  },
  {
    name: "Rajeev Shukla",
    role: "Sports Administrator",
    quote:
      "Great service, efficient communication and a really easy way to manage travel with lots of help and support to get the right deal.",
    initials: "RS",
    color: "#b45309",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=220&h=220&fit=crop",
  },
  {
    name: "Gautam Gambhir",
    role: "Cricketer & Public Servant",
    quote:
      "Excellent service from their team — they helped clarify all my questions and Shafsky deals with very professional manners.",
    initials: "GG",
    color: "#0369a1",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=220&h=220&fit=crop",
  },
  {
    name: "Mohd Azharuddin",
    role: "Former Indian Captain",
    quote:
      "You are a great team player and you constantly help others meet their demands. Well done, Shafsky Aviation!",
    initials: "MA",
    color: "#059669",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=220&h=220&fit=crop",
  },
  {
    name: "Hemant Sharma",
    role: "Business Leader",
    quote:
      "The top-notch friendly and very professional customer service I've received from Shafsky Aviation is second to none.",
    initials: "HS",
    color: "#dc2626",
  },
  {
    name: "Barun Das",
    role: "Media Industry Veteran",
    quote:
      "I chatted with their team. Very helpful and answered all my questions. They found the best coverage for me at a great price.",
    initials: "BD",
    color: "#7c3aed",
    image: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=220&h=220&fit=crop",
  },
  {
    name: "Ram Gopal Varma",
    role: "Filmmaker",
    quote:
      "Fantastic company! Best service, efficient communication, and an unmatched level of personal attention to every detail.",
    initials: "RV",
    color: "#ea580c",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=220&h=220&fit=crop",
  },
];

/* ─────────────────── FAQ ─────────────────── */

export const FAQ_ITEMS: [string, string][] = [
  [
    "What is Suswagatam Meet & Greet?",
    "Suswagatam is Shafsky Aviation's signature welcome and assist service for domestic and international passengers across Indian airports — escort, fast-track, lounge, transport and more.",
  ],
  [
    "Which airports do you cover?",
    "We operate at 20+ Indian airports including Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Goa, Kochi, Jaipur and Srinagar — plus 12+ global hubs.",
  ],
  [
    "How do I book?",
    "Use the booking panel above. Choose Arrival, Departure or Connection, enter your flight number and date, and we'll confirm in minutes.",
  ],
  [
    "Do you accept last-minute bookings?",
    "Yes. We accept bookings up to 6 hours before departure (except 23:00–06:00 hrs). For urgent assistance, contact our 24×7 support.",
  ],
  [
    "Is the service available for groups?",
    "Absolutely — families, corporate teams and tour groups are welcome. Tell us your party size in the booking form.",
  ],
];

/* ─────────────────── CTA ─────────────────── */

export const CTA_CONTENT = {
  eyebrow: "Ready when you are",
  headline: "Let us plan your",
  headlineAccent: "next welcome.",
  subtitle: "A guest relations officer will reply within minutes. Tell us only where, and when.",
} as const;

/* ─────────────────── FOOTER ─────────────────── */

export const FOOTER_CONTENT = {
  brandName: "SHAFSKY",
  brandSub: "AVIATION · SUSWAGATAM",
  tagline: "Welcome & Assist Services since 2022.",
  address:
    "Shafsky Aviation Services Pvt. Ltd. — 8/5, Ground Floor, West Mehram Nagar Gate No.1, Opp. IGI Airport Terminal 1, New Delhi - 110010",
  phone: "+91 9599087959",
  copyright: "Shafsky Aviation Services Pvt. Ltd. All Rights Reserved.",
  services: ["Meet & Greet", "Lounge Access", "Transport", "Hotels", "Concierge"],
  companyLinks: ["About Us", "Our Team", "Contact"],
  legalLinks: ["Privacy Policy", "Terms of Use"],
} as const;

export const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/shafskyaviation/" },
  { label: "Twitter", href: "https://x.com/ShafskyAviation" },
  { label: "Instagram", href: "https://www.instagram.com/aviationshafsky/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/mohammad-shahood-shafsky" },
  { label: "YouTube", href: "https://www.youtube.com/@shafskyaviation" },
] as const;

/* ─────────────────── COVERAGE STATS ─────────────────── */

export const COVERAGE_STATS = [
  ["20+", "Indian Airports"],
  ["12+", "Global Hubs"],
  ["24/7", "Live Dispatch"],
  ["< 12m", "Avg. Response"],
] as const;

/* ─────────────────── JOURNEY STEPS ─────────────────── */

export const JOURNEY_STEPS: [string, string][] = [
  ["Booking", "Tell us your flight — arrival, departure or connection — in just a few clicks."],
  [
    "Confirmation",
    "Instant quote and confirmation, with your dedicated guest relations officer assigned.",
  ],
  ["Welcome", "Meet your escort the moment you arrive — kerbside or aerobridge, your choice."],
  ["Fast-Track", "Immigration, security and baggage handled while you relax in the lounge."],
  ["Premium Transport", "Step into your chauffeured car or onward flight — no queue, no friction."],
  [
    "After-care",
    "We stay on watch until your journey is complete. Feedback shapes every next flight.",
  ],
];

/* ─────────────────── FLEET / HUB AIRPORTS ─────────────────── */

export interface HubAirport {
  name: string;
  cat: string;
  pax: string;
  range: string;
  speed: string;
}

export const HUB_AIRPORTS: HubAirport[] = [
  {
    name: "Delhi · IGI Terminal 3",
    cat: "Flagship Hub",
    pax: "Domestic + Intl",
    range: "24×7",
    speed: "All Airlines",
  },
  {
    name: "Mumbai · CSMIA",
    cat: "Western Gateway",
    pax: "T1 + T2",
    range: "24×7",
    speed: "All Airlines",
  },
  {
    name: "Bengaluru · Kempegowda",
    cat: "Southern Hub",
    pax: "T1 + T2",
    range: "24×7",
    speed: "All Airlines",
  },
  {
    name: "Hyderabad · RGIA",
    cat: "Deccan Gateway",
    pax: "Integrated",
    range: "24×7",
    speed: "All Airlines",
  },
];
