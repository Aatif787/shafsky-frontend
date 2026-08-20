import { Users, Hotel, Ticket, Car, Package, Sparkles, Building2, HeartPulse } from "lucide-react";

export const SELECTOR_SERVICES = [
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
