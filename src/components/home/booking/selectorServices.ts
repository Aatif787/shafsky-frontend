import { Users, Hotel, Ticket, Car, Package, Sparkles, Building2, HeartPulse } from "lucide-react";
import { ICICI_REVIEW_MODE } from "@/lib/config/reviewMode";

const ALL_SELECTOR_SERVICES = [
  { id: "meet_greet", t: "Meet & Greet", Icon: Users },
  { id: "lounge", t: "VIP Lounge", Icon: Hotel },
  { id: "fast_track", t: "Fast Track", Icon: Ticket },
  { id: "transport", t: "Airport Transfer", Icon: Car },
  { id: "porter", t: "Porter Service", Icon: Package },
  { id: "baggage", t: "Baggage Assist", Icon: Package },
  { id: "visa", t: "Visa Assist", Icon: Sparkles },
  { id: "hotel", t: "Hotel Booking", Icon: Building2 },
  { id: "wheelchair", t: "Wheelchair Assist", Icon: HeartPulse },
];

const REVIEW_SELECTOR_IDS = new Set(["meet_greet", "lounge", "fast_track", "porter", "baggage", "wheelchair"]);

export const SELECTOR_SERVICES = ICICI_REVIEW_MODE
  ? ALL_SELECTOR_SERVICES.filter((s) => REVIEW_SELECTOR_IDS.has(s.id))
  : ALL_SELECTOR_SERVICES;
