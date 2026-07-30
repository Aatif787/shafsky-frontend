import os

base_dir = r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\booking\domain"
os.makedirs(base_dir, exist_ok=True)

# 1. bookingPricing.ts
pricing_code = '''export function getServicePrice(serviceId: string): number {
  switch (serviceId) {
    case "jet_charter":
    case "charter":
    case "private_jet":
      return 450000;
    case "air_ambulance":
    case "medical":
      return 185000;
    case "train_ambulance":
      return 45000;
    case "hum":
    case "repatriation":
    case "human_remains":
      return 65000;
    case "cargo":
    case "air_cargo":
    case "freight":
      return 45000;
    case "avi":
    case "pet_transport":
    case "live_animal":
      return 28000;
    case "hotel":
    case "hotel_booking":
      return 32000;
    case "visa":
    case "visa_assistance":
      return 8500;
    case "air_ticketing":
    case "ticketing":
      return 85000;
    case "onboard_meals":
    case "meals":
      return 4500;
    case "transport":
      return 14000;
    case "fast_track":
      return 7500;
    case "lounge":
      return 9500;
    case "meet_greet":
    default:
      return 12500;
  }
}
'''

with open(os.path.join(base_dir, "bookingPricing.ts"), "w", encoding="utf-8") as f:
    f.write(pricing_code)

# 2. bookingReference.ts
ref_code = '''export function generateBookingReference(serviceType: string): string {
  const prefixMap: Record<string, string> = {
    jet_charter: "SHF-JTS-",
    air_ambulance: "SHF-MED-",
    train_ambulance: "SHF-TRN-",
    hum: "SHF-HUM-",
    cargo: "SHF-CGO-",
    avi: "SHF-AVI-",
    hotel: "SHF-HTL-",
    visa: "SHF-VSA-",
    air_ticketing: "SHF-TCK-",
    onboard_meals: "SHF-MEL-",
    transport: "SHF-TRP-",
    fast_track: "SHF-FT-",
    lounge: "SHF-[#LOUNGE]-",
    meet_greet: "SHF-[#MEET]-",
  };

  const prefix = prefixMap[serviceType] || "SHF-";
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${num}`;
}
'''

with open(os.path.join(base_dir, "bookingReference.ts"), "w", encoding="utf-8") as f:
    f.write(ref_code)

# 3. bookingPayload.ts
payload_code = '''import { BookingPayload } from "../types/booking.types";

export interface BuildPayloadParams {
  flightNumber?: string;
  departureAirport: string;
  arrivalAirport: string;
  departDate: string;
  leadPassengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  totalPrice: number;
  specialRequests?: string;
  serviceType: string;
}

export function buildBookingPayload(params: BuildPayloadParams): BookingPayload {
  return {
    flight_number: params.flightNumber || `SHF-[#${params.serviceType.toUpperCase()}]`,
    departure_airport: params.departureAirport,
    arrival_airport: params.arrivalAirport,
    depart_date: params.departDate,
    lead_passenger_name: params.leadPassengerName,
    passenger_email: params.passengerEmail,
    passenger_phone: params.passengerPhone,
    total_price: params.totalPrice,
    special_requests: params.specialRequests,
    service_type: params.serviceType,
  };
}
'''

with open(os.path.join(base_dir, "bookingPayload.ts"), "w", encoding="utf-8") as f:
    f.write(payload_code)

# 4. bookingDraft.ts
draft_code = '''const DRAFT_KEY = "shafsky_booking_draft";

export function saveBookingDraft(serviceId: string, data: Record<string, any>): void {
  try {
    const draft = {
      initialServiceId: serviceId,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore save error
  }
}

export function loadBookingDraft(): Record<string, any> | null {
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore load error
  }
  return null;
}

export function clearBookingDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore clear error
  }
}
'''

with open(os.path.join(base_dir, "bookingDraft.ts"), "w", encoding="utf-8") as f:
    f.write(draft_code)

# 5. bookingWorkflow.ts
workflow_code = '''export type KnownWorkflow =
  | "isCharterWorkflow"
  | "isAirAmbulanceWorkflow"
  | "isTrainAmbulanceWorkflow"
  | "isHumWorkflow"
  | "isCargoWorkflow"
  | "isAviWorkflow"
  | "isHotelWorkflow"
  | "isVisaWorkflow"
  | "isTicketingWorkflow"
  | "isMealsWorkflow"
  | "isTransportWorkflow"
  | "isFastTrackWorkflow"
  | "isLoungeWorkflow"
  | "isMeetGreetWorkflow";

export function detectWorkflow(initialServiceId: string): KnownWorkflow {
  if (initialServiceId === "jet_charter" || initialServiceId === "charter" || initialServiceId === "private_jet") {
    return "isCharterWorkflow";
  }
  if (initialServiceId === "air_ambulance" || initialServiceId === "medical") {
    return "isAirAmbulanceWorkflow";
  }
  if (initialServiceId === "train_ambulance") {
    return "isTrainAmbulanceWorkflow";
  }
  if (initialServiceId === "hum" || initialServiceId === "repatriation" || initialServiceId === "human_remains") {
    return "isHumWorkflow";
  }
  if (initialServiceId === "cargo" || initialServiceId === "air_cargo" || initialServiceId === "freight") {
    return "isCargoWorkflow";
  }
  if (initialServiceId === "avi" || initialServiceId === "pet_transport" || initialServiceId === "live_animal") {
    return "isAviWorkflow";
  }
  if (initialServiceId === "hotel" || initialServiceId === "hotel_booking") {
    return "isHotelWorkflow";
  }
  if (initialServiceId === "visa" || initialServiceId === "visa_assistance") {
    return "isVisaWorkflow";
  }
  if (initialServiceId === "air_ticketing" || initialServiceId === "ticketing") {
    return "isTicketingWorkflow";
  }
  if (initialServiceId === "onboard_meals" || initialServiceId === "meals") {
    return "isMealsWorkflow";
  }
  if (initialServiceId === "transport") {
    return "isTransportWorkflow";
  }
  if (initialServiceId === "fast_track") {
    return "isFastTrackWorkflow";
  }
  if (initialServiceId === "lounge") {
    return "isLoungeWorkflow";
  }
  return "isMeetGreetWorkflow";
}

export interface StepConfig {
  title: string;
  sub: string;
  estTime: string;
  progress: number;
}

export function getWorkflowStepConfigs(workflow: KnownWorkflow): StepConfig[] {
  switch (workflow) {
    case "isCharterWorkflow":
      return [
        { title: "Flight Itinerary & Aircraft Category", sub: "Specify origin/destination airports, departure date/time, and aircraft preference.", estTime: "Est. 30 sec", progress: 33 },
        { title: "Charterer Contact & Review", sub: "Enter lead charterer details and review your private jet quotation request.", estTime: "Est. 30 sec", progress: 66 },
        { title: "Charter Request Staged", sub: "Your private jet charter quote request is assigned to our flight dispatch team.", estTime: "Completed", progress: 100 },
      ];
    case "isAirAmbulanceWorkflow":
      return [
        { title: "Patient Details", sub: "Provide patient condition and count for airborne ICU flight staging.", estTime: "Est. 20 sec", progress: 33 },
        { title: "Transport Route", sub: "Specify origin hospital/city, receiving facility, and preferred date.", estTime: "Est. 20 sec", progress: 66 },
        { title: "Contact Details & Review", sub: "Enter emergency contact details and review your air ambulance dispatch request.", estTime: "Completed", progress: 100 },
      ];
    case "isTrainAmbulanceWorkflow":
      return [
        { title: "Patient Details", sub: "Provide patient condition and count for mobile train ICU compartment staging.", estTime: "Est. 20 sec", progress: 33 },
        { title: "Transport Route", sub: "Specify origin railway station/city, destination station, and preferred date.", estTime: "Est. 20 sec", progress: 66 },
        { title: "Contact Details & Review", sub: "Enter emergency contact details and review your train ambulance dispatch request.", estTime: "Completed", progress: 100 },
      ];
    case "isHumWorkflow":
      return [
        { title: "Repatriation Details", sub: "Specify assistance type, origin city, and destination city.", estTime: "Est. 20 sec", progress: 50 },
        { title: "Contact Details & Review", sub: "Enter family/liaison contact details and review repatriation assistance request.", estTime: "Completed", progress: 100 },
      ];
    case "isCargoWorkflow":
      return [
        { title: "Cargo Specifications", sub: "Specify commodity type, approximate weight, package count, and description.", estTime: "Est. 30 sec", progress: 33 },
        { title: "Freight Route & Schedule", sub: "Specify pickup city, destination city, and preferred shipping date.", estTime: "Est. 30 sec", progress: 66 },
        { title: "Contact Info & Review", sub: "Enter logistics contact details and verify your air freight quotation request.", estTime: "Completed", progress: 100 },
      ];
    case "isAviWorkflow":
      return [
        { title: "Pet & Animal Specifications", sub: "Specify animal species, breed, approximate weight, and count.", estTime: "Est. 30 sec", progress: 33 },
        { title: "Transit Route & Date", sub: "Specify pickup city, destination city, and preferred travel date.", estTime: "Est. 30 sec", progress: 66 },
        { title: "Owner Contact & Review", sub: "Enter owner contact details and verify your live pet air transit request.", estTime: "Completed", progress: 100 },
      ];
    case "isHotelWorkflow":
      return [
        { title: "Hotel Destination & Schedule", sub: "Select destination, check-in/out dates, headcount, and room preferences.", estTime: "Est. 30 sec", progress: 33 },
        { title: "Contact Info & Review", sub: "Enter lead guest details and verify your 5-star hotel suite request.", estTime: "Est. 30 sec", progress: 66 },
        { title: "Hotel Request Confirmed", sub: "Your luxury hotel reservation request is submitted to our VIP concierge desk.", estTime: "Completed", progress: 100 },
      ];
    case "isVisaWorkflow":
      return [
        { title: "Visa & Country Selection", sub: "Specify destination country, visa type, expected travel date, and applicant nationality.", estTime: "Est. 30 sec", progress: 33 },
        { title: "Applicant Contact & Review", sub: "Provide applicant contact info and verify visa document processing requirements.", estTime: "Est. 30 sec", progress: 66 },
        { title: "Visa Request Submitted", sub: "Your diplomatic visa processing request is assigned to our embassy liaison officer.", estTime: "Completed", progress: 100 },
      ];
    case "isTicketingWorkflow":
      return [
        { title: "Flight Routing & Class", sub: "Select trip type, departure/destination cities, travel date, and preferred cabin class.", estTime: "Est. 30 sec", progress: 33 },
        { title: "Passenger Contact & Review", sub: "Enter lead passenger contact details and review your commercial flight booking request.", estTime: "Est. 30 sec", progress: 66 },
        { title: "Flight Request Reserved", sub: "Your commercial flight seat request is staged with our airline ticketing desk.", estTime: "Completed", progress: 100 },
      ];
    case "isMealsWorkflow":
      return [
        { title: "In-Flight Catering Preferences", sub: "Choose gourmet meal options, passenger count, travel date, and dietary requirements.", estTime: "Est. 30 sec", progress: 33 },
        { title: "Contact Info & Review", sub: "Enter guest contact details and confirm your gourmet inflight menu selection.", estTime: "Est. 30 sec", progress: 66 },
        { title: "Meal Request Staged", sub: "Your inflight gourmet meal order is sent to our executive culinary team.", estTime: "Completed", progress: 100 },
      ];
    default:
      return [
        { title: "Service Selection & Details", sub: "Specify origin/destination, schedule, and guest options.", estTime: "Est. 30 sec", progress: 33 },
        { title: "Contact Info & Review", sub: "Enter lead guest details and review your booking request.", estTime: "Est. 30 sec", progress: 66 },
        { title: "Booking Confirmed", sub: "Your booking request is submitted to our VIP concierge team.", estTime: "Completed", progress: 100 },
      ];
  }
}
'''

with open(os.path.join(base_dir, "bookingWorkflow.ts"), "w", encoding="utf-8") as f:
    f.write(workflow_code)

# 6. bookingHelpers.ts
helpers_code = '''export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatPassengerCount(count: number, label = "Passenger"): string {
  return `${count} ${label}${count > 1 ? "s" : ""}`;
}

export function formatDateString(dateStr: string): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
'''

with open(os.path.join(base_dir, "bookingHelpers.ts"), "w", encoding="utf-8") as f:
    f.write(helpers_code)

print("Created Phase 3 domain layer files cleanly.")
