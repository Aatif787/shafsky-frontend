import os

base_dir = r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\booking"
types_dir = os.path.join(base_dir, "types")
config_dir = os.path.join(base_dir, "config")

os.makedirs(types_dir, exist_ok=True)
os.makedirs(config_dir, exist_ok=True)

# 1. types/service.types.ts
service_types = '''export enum BookingService {
  MEET_GREET = "meet_greet",
  LOUNGE = "lounge",
  FAST_TRACK = "fast_track",
  TRANSFER = "transport",
  HOTEL = "hotel",
  VISA = "visa",
  TICKETING = "air_ticketing",
  MEALS = "onboard_meals",
  CARGO = "cargo",
  AVI = "avi",
  AIR_AMBULANCE = "air_ambulance",
  TRAIN_AMBULANCE = "train_ambulance",
  HUM = "hum",
  CHARTER = "jet_charter",
}

export enum ServiceCategory {
  AIRPORT = "Airport Services",
  TRAVEL = "Travel Services",
  LOGISTICS = "Cargo & Logistics",
  MEDICAL = "Medical Assistance",
  CHARTER = "Private Aviation",
}

export interface ServiceDescriptor {
  id: BookingService;
  displayName: string;
  category: ServiceCategory;
  requiresFlight: boolean;
  requiresPassengers: boolean;
  requiresMedical: boolean;
  requiresCargo: boolean;
  requiresHotel: boolean;
  requiresVisa: boolean;
  requiresTransfer: boolean;
}
'''

with open(os.path.join(types_dir, "service.types.ts"), "w", encoding="utf-8") as f:
    f.write(service_types)

# 2. types/workflow.types.ts
workflow_types = '''import { BookingService } from "./service.types";

export interface WorkflowStep {
  stepNumber: number;
  title: string;
  sub: string;
  estTime: string;
  progress: number;
}

export interface WorkflowMetadata {
  serviceId: BookingService;
  totalSteps: number;
  steps: WorkflowStep[];
  successTitle: string;
  confirmationSubtitle: string;
  badgeLabel: string;
}
'''

with open(os.path.join(types_dir, "workflow.types.ts"), "w", encoding="utf-8") as f:
    f.write(workflow_types)

# 3. types/airport.types.ts
airport_types = '''export interface AirportMetadata {
  code: string;
  name: string;
  city: string;
  country: string;
  terminals: string[];
}
'''

with open(os.path.join(types_dir, "airport.types.ts"), "w", encoding="utf-8") as f:
    f.write(airport_types)

# 4. types/pricing.types.ts
pricing_types = '''import { BookingService } from "./service.types";

export interface ServicePricingRule {
  serviceId: BookingService | string;
  basePrice: number;
  currency: string;
}
'''

with open(os.path.join(types_dir, "pricing.types.ts"), "w", encoding="utf-8") as f:
    f.write(pricing_types)

# 5. types/booking.types.ts (Enhanced)
booking_types = '''import { BookingService } from "./service.types";

export interface BookingContact {
  leadPassengerName: string;
  passengerEmail: string;
  passengerPhone: string;
}

export interface BookingPassenger {
  adultCount: number;
  childCount?: number;
  infantCount?: number;
}

export interface BookingFlight {
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departDate: string;
  flightTime?: string;
}

export interface BookingRoute {
  pickupLocation: string;
  destinationLocation: string;
  travelDate: string;
}

export interface BookingMedical {
  patientName?: string;
  patientCondition: string;
  patientCount: number;
  assistanceType?: string;
}

export interface BookingCargo {
  cargoType: string;
  cargoWeight?: string;
  cargoPackages?: string;
  cargoDescription: string;
  companyName?: string;
}

export interface BookingPet {
  animalType: string;
  breed?: string;
  weight?: string;
  count: number;
}

export interface BookingHotel {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  roomPreference: string;
}

export interface BookingVisa {
  destinationCountry: string;
  visaType: string;
  passportNationality: string;
}

export interface BookingTicket {
  tripType: "one_way" | "round_trip" | "multi_city";
  departureCity: string;
  arrivalCity: string;
  travelClass: string;
}

export interface BookingMeals {
  airline?: string;
  mealPreference: string;
  dietaryNotes?: string;
}

export interface BookingTransfer {
  pickupLocation: string;
  dropLocation: string;
  needsFlightCoordination: boolean;
}

export interface BookingCharter {
  departureCity: string;
  destinationCity: string;
  departureDate: string;
  departureTime: string;
  aircraftCategory: string;
  passengerCount: number;
}

export interface BookingSummary {
  serviceId: BookingService;
  serviceTitle: string;
  totalPrice: number;
  referenceCode: string;
  contact: BookingContact;
}

export interface BookingPayload {
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  depart_date: string;
  lead_passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  total_price: number;
  special_requests?: string;
  service_type: string;
}
'''

with open(os.path.join(types_dir, "booking.types.ts"), "w", encoding="utf-8") as f:
    f.write(booking_types)

# 6. config/pricing.config.ts
pricing_config = '''import { BookingService, ServicePricingRule } from "../types";

export const SERVICE_PRICING_CONFIG: Record<string, number> = {
  [BookingService.CHARTER]: 450000,
  charter: 450000,
  private_jet: 450000,
  [BookingService.AIR_AMBULANCE]: 185000,
  medical: 185000,
  [BookingService.TRAIN_AMBULANCE]: 45000,
  [BookingService.HUM]: 65000,
  repatriation: 65000,
  human_remains: 65000,
  [BookingService.CARGO]: 45000,
  air_cargo: 45000,
  freight: 45000,
  [BookingService.AVI]: 28000,
  pet_transport: 28000,
  live_animal: 28000,
  [BookingService.HOTEL]: 32000,
  hotel_booking: 32000,
  [BookingService.VISA]: 8500,
  visa_assistance: 8500,
  [BookingService.TICKETING]: 85000,
  ticketing: 85000,
  [BookingService.MEALS]: 4500,
  meals: 4500,
  [BookingService.TRANSFER]: 14000,
  [BookingService.FAST_TRACK]: 7500,
  [BookingService.LOUNGE]: 9500,
  [BookingService.MEET_GREET]: 12500,
};
'''

with open(os.path.join(config_dir, "pricing.config.ts"), "w", encoding="utf-8") as f:
    f.write(pricing_config)

# 7. config/steps.config.ts
steps_config = '''import { WorkflowStep } from "../types/workflow.types";

export const DEFAULT_WORKFLOW_STEPS: WorkflowStep[] = [
  { stepNumber: 1, title: "Service Selection & Details", sub: "Specify origin/destination, schedule, and options.", estTime: "Est. 30 sec", progress: 33 },
  { stepNumber: 2, title: "Contact Info & Review", sub: "Enter lead guest details and review request.", estTime: "Est. 30 sec", progress: 66 },
  { stepNumber: 3, title: "Booking Confirmed", sub: "Your booking request is submitted to our VIP desk.", estTime: "Completed", progress: 100 },
];
'''

with open(os.path.join(config_dir, "steps.config.ts"), "w", encoding="utf-8") as f:
    f.write(steps_config)

# 8. config/airports.config.ts
airports_config = '''import { AirportMetadata } from "../types/airport.types";

export const MAJOR_AIRPORTS_CONFIG: AirportMetadata[] = [
  { code: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi", country: "India", terminals: ["T1", "T2", "T3"] },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India", terminals: ["T1", "T2"] },
  { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "UAE", terminals: ["T1", "T2", "T3"] },
  { code: "LHR", name: "London Heathrow Airport", city: "London", country: "United Kingdom", terminals: ["T2", "T3", "T4", "T5"] },
  { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", terminals: ["T1", "T2", "T3", "T4"] },
];
'''

with open(os.path.join(config_dir, "airports.config.ts"), "w", encoding="utf-8") as f:
    f.write(airports_config)

# 9. config/services.config.ts
services_config = '''import { BookingService, ServiceCategory, ServiceDescriptor } from "../types/service.types";

export const SERVICES_CONFIG: Record<BookingService, ServiceDescriptor> = {
  [BookingService.MEET_GREET]: {
    id: BookingService.MEET_GREET,
    displayName: "Airport Meet & Greet",
    category: ServiceCategory.AIRPORT,
    requiresFlight: true,
    requiresPassengers: true,
    requiresMedical: false,
    requiresCargo: false,
    requiresHotel: false,
    requiresVisa: false,
    requiresTransfer: false,
  },
  [BookingService.LOUNGE]: {
    id: BookingService.LOUNGE,
    displayName: "VIP Airport Lounge",
    category: ServiceCategory.AIRPORT,
    requiresFlight: false,
    requiresPassengers: true,
    requiresMedical: false,
    requiresCargo: false,
    requiresHotel: false,
    requiresVisa: false,
    requiresTransfer: false,
  },
  [BookingService.FAST_TRACK]: {
    id: BookingService.FAST_TRACK,
    displayName: "Immigration Fast Track",
    category: ServiceCategory.AIRPORT,
    requiresFlight: true,
    requiresPassengers: true,
    requiresMedical: false,
    requiresCargo: false,
    requiresHotel: false,
    requiresVisa: false,
    requiresTransfer: false,
  },
  [BookingService.TRANSFER]: {
    id: BookingService.TRANSFER,
    displayName: "Chauffeur Airport Transfer",
    category: ServiceCategory.AIRPORT,
    requiresFlight: false,
    requiresPassengers: true,
    requiresMedical: false,
    requiresCargo: false,
    requiresHotel: false,
    requiresVisa: false,
    requiresTransfer: true,
  },
  [BookingService.HOTEL]: {
    id: BookingService.HOTEL,
    displayName: "Luxury Hotel Suite Booking",
    category: ServiceCategory.TRAVEL,
    requiresFlight: false,
    requiresPassengers: true,
    requiresMedical: false,
    requiresCargo: false,
    requiresHotel: true,
    requiresVisa: false,
    requiresTransfer: false,
  },
  [BookingService.VISA]: {
    id: BookingService.VISA,
    displayName: "Diplomatic Visa Assistance",
    category: ServiceCategory.TRAVEL,
    requiresFlight: false,
    requiresPassengers: true,
    requiresMedical: false,
    requiresCargo: false,
    requiresHotel: false,
    requiresVisa: true,
    requiresTransfer: false,
  },
  [BookingService.TICKETING]: {
    id: BookingService.TICKETING,
    displayName: "Commercial Air Ticketing",
    category: ServiceCategory.TRAVEL,
    requiresFlight: true,
    requiresPassengers: true,
    requiresMedical: false,
    requiresCargo: false,
    requiresHotel: false,
    requiresVisa: false,
    requiresTransfer: false,
  },
  [BookingService.MEALS]: {
    id: BookingService.MEALS,
    displayName: "Gourmet Inflight Meals",
    category: ServiceCategory.TRAVEL,
    requiresFlight: false,
    requiresPassengers: true,
    requiresMedical: false,
    requiresCargo: false,
    requiresHotel: false,
    requiresVisa: false,
    requiresTransfer: false,
  },
  [BookingService.CARGO]: {
    id: BookingService.CARGO,
    displayName: "General Air Cargo Freight",
    category: ServiceCategory.LOGISTICS,
    requiresFlight: false,
    requiresPassengers: false,
    requiresMedical: false,
    requiresCargo: true,
    requiresHotel: false,
    requiresVisa: false,
    requiresTransfer: false,
  },
  [BookingService.AVI]: {
    id: BookingService.AVI,
    displayName: "Live Animal Pet Transport",
    category: ServiceCategory.LOGISTICS,
    requiresFlight: false,
    requiresPassengers: false,
    requiresMedical: false,
    requiresCargo: true,
    requiresHotel: false,
    requiresVisa: false,
    requiresTransfer: false,
  },
  [BookingService.AIR_AMBULANCE]: {
    id: BookingService.AIR_AMBULANCE,
    displayName: "Airborne ICU Air Ambulance",
    category: ServiceCategory.MEDICAL,
    requiresFlight: false,
    requiresPassengers: false,
    requiresMedical: true,
    requiresCargo: false,
    requiresHotel: false,
    requiresVisa: false,
    requiresTransfer: false,
  },
  [BookingService.TRAIN_AMBULANCE]: {
    id: BookingService.TRAIN_AMBULANCE,
    displayName: "Medical Train Compartment Transfer",
    category: ServiceCategory.MEDICAL,
    requiresFlight: false,
    requiresPassengers: false,
    requiresMedical: true,
    requiresCargo: false,
    requiresHotel: false,
    requiresVisa: false,
    requiresTransfer: false,
  },
  [BookingService.HUM]: {
    id: BookingService.HUM,
    displayName: "Dignified Mortal Remains Repatriation",
    category: ServiceCategory.MEDICAL,
    requiresFlight: false,
    requiresPassengers: false,
    requiresMedical: true,
    requiresCargo: false,
    requiresHotel: false,
    requiresVisa: false,
    requiresTransfer: false,
  },
  [BookingService.CHARTER]: {
    id: BookingService.CHARTER,
    displayName: "Private Jet Charter Flight",
    category: ServiceCategory.CHARTER,
    requiresFlight: true,
    requiresPassengers: true,
    requiresMedical: false,
    requiresCargo: false,
    requiresHotel: false,
    requiresVisa: false,
    requiresTransfer: false,
  },
};
'''

with open(os.path.join(config_dir, "services.config.ts"), "w", encoding="utf-8") as f:
    f.write(services_config)

# 10. config/workflow.config.ts
workflow_config = '''import { BookingService } from "../types/service.types";
import { WorkflowMetadata } from "../types/workflow.types";

export const WORKFLOW_CONFIG: Record<BookingService, WorkflowMetadata> = {
  [BookingService.CHARTER]: {
    serviceId: BookingService.CHARTER,
    totalSteps: 3,
    steps: [
      { stepNumber: 1, title: "Flight Itinerary & Aircraft Category", sub: "Specify origin/destination airports, departure date/time, and aircraft preference.", estTime: "Est. 30 sec", progress: 33 },
      { stepNumber: 2, title: "Charterer Contact & Review", sub: "Enter lead charterer details and review your private jet quotation request.", estTime: "Est. 30 sec", progress: 66 },
      { stepNumber: 3, title: "Charter Request Staged", sub: "Your private jet charter quote request is assigned to our flight dispatch team.", estTime: "Completed", progress: 100 },
    ],
    successTitle: "Private Jet Quote Request Logged",
    confirmationSubtitle: "Our flight dispatch desk is staging tail options for your route.",
    badgeLabel: "Charter Quote Staged",
  },
  [BookingService.AIR_AMBULANCE]: {
    serviceId: BookingService.AIR_AMBULANCE,
    totalSteps: 3,
    steps: [
      { stepNumber: 1, title: "Patient Details", sub: "Provide patient condition and count for airborne ICU flight staging.", estTime: "Est. 20 sec", progress: 33 },
      { stepNumber: 2, title: "Transport Route", sub: "Specify origin hospital/city, receiving facility, and preferred date.", estTime: "Est. 20 sec", progress: 66 },
      { stepNumber: 3, title: "Contact Details & Review", sub: "Enter emergency contact details and review your air ambulance dispatch request.", estTime: "Completed", progress: 100 },
    ],
    successTitle: "Air Ambulance Request Logged",
    confirmationSubtitle: "Our 24/7 medical flight physician is evaluating fit-to-fly assessment.",
    badgeLabel: "Medevac Flight Desk Notified",
  },
  [BookingService.TRAIN_AMBULANCE]: {
    serviceId: BookingService.TRAIN_AMBULANCE,
    totalSteps: 3,
    steps: [
      { stepNumber: 1, title: "Patient Details", sub: "Provide patient condition and count for mobile train ICU compartment staging.", estTime: "Est. 20 sec", progress: 33 },
      { stepNumber: 2, title: "Transport Route", sub: "Specify origin railway station/city, destination station, and preferred date.", estTime: "Est. 20 sec", progress: 66 },
      { stepNumber: 3, title: "Contact Details & Review", sub: "Enter emergency contact details and review your train ambulance dispatch request.", estTime: "Completed", progress: 100 },
    ],
    successTitle: "Train Ambulance Reserved",
    confirmationSubtitle: "Your train ambulance request is logged with our medical rail desk.",
    badgeLabel: "Train ICU Request Submitted",
  },
  [BookingService.HUM]: {
    serviceId: BookingService.HUM,
    totalSteps: 2,
    steps: [
      { stepNumber: 1, title: "Repatriation Details", sub: "Specify assistance type, origin city, and destination city.", estTime: "Est. 20 sec", progress: 50 },
      { stepNumber: 2, title: "Contact Details & Review", sub: "Enter family/liaison contact details and review repatriation assistance request.", estTime: "Completed", progress: 100 },
    ],
    successTitle: "Repatriation Assistance Active",
    confirmationSubtitle: "Our repatriation desk is coordinating embassy clearance and airside transport.",
    badgeLabel: "Repatriation Request Assigned",
  },
  [BookingService.CARGO]: {
    serviceId: BookingService.CARGO,
    totalSteps: 3,
    steps: [
      { stepNumber: 1, title: "Cargo Specifications", sub: "Specify commodity type, approximate weight, package count, and description.", estTime: "Est. 30 sec", progress: 33 },
      { stepNumber: 2, title: "Freight Route & Schedule", sub: "Specify pickup city, destination city, and preferred shipping date.", estTime: "Est. 30 sec", progress: 66 },
      { stepNumber: 3, title: "Contact Info & Review", sub: "Enter logistics contact details and verify your air freight quotation request.", estTime: "Completed", progress: 100 },
    ],
    successTitle: "Air Cargo Request Submitted",
    confirmationSubtitle: "Your freight quote request is assigned to our air cargo logistics team.",
    badgeLabel: "Air Cargo Desk Notified",
  },
  [BookingService.AVI]: {
    serviceId: BookingService.AVI,
    totalSteps: 3,
    steps: [
      { stepNumber: 1, title: "Pet & Animal Specifications", sub: "Specify animal species, breed, approximate weight, and count.", estTime: "Est. 30 sec", progress: 33 },
      { stepNumber: 2, title: "Transit Route & Date", sub: "Specify pickup city, destination city, and preferred travel date.", estTime: "Est. 30 sec", progress: 66 },
      { stepNumber: 3, title: "Owner Contact & Review", sub: "Enter owner contact details and verify your live pet air transit request.", estTime: "Completed", progress: 100 },
    ],
    successTitle: "Pet Transport Request Logged",
    confirmationSubtitle: "Our live animal care specialists are preparing climate-controlled transit arrangements.",
    badgeLabel: "Pet Transport Desk Assigned",
  },
  [BookingService.HOTEL]: {
    serviceId: BookingService.HOTEL,
    totalSteps: 3,
    steps: [
      { stepNumber: 1, title: "Hotel Destination & Schedule", sub: "Select destination, check-in/out dates, headcount, and room preferences.", estTime: "Est. 30 sec", progress: 33 },
      { stepNumber: 2, title: "Contact Info & Review", sub: "Enter lead guest details and verify your 5-star hotel suite request.", estTime: "Est. 30 sec", progress: 66 },
      { stepNumber: 3, title: "Hotel Request Confirmed", sub: "Your luxury hotel reservation request is submitted to our VIP concierge desk.", estTime: "Completed", progress: 100 },
    ],
    successTitle: "Hotel Suite Request Logged",
    confirmationSubtitle: "Our travel concierge is confirming room availability with luxury hotel partners.",
    badgeLabel: "Hotel Concierge Notified",
  },
  [BookingService.VISA]: {
    serviceId: BookingService.VISA,
    totalSteps: 3,
    steps: [
      { stepNumber: 1, title: "Visa & Country Selection", sub: "Specify destination country, visa type, expected travel date, and applicant nationality.", estTime: "Est. 30 sec", progress: 33 },
      { stepNumber: 2, title: "Applicant Contact & Review", sub: "Provide applicant contact info and verify visa document processing requirements.", estTime: "Est. 30 sec", progress: 66 },
      { stepNumber: 3, title: "Visa Request Submitted", sub: "Your diplomatic visa processing request is assigned to our embassy liaison officer.", estTime: "Completed", progress: 100 },
    ],
    successTitle: "Visa Assistance Request Logged",
    confirmationSubtitle: "Our embassy liaison team is reviewing your visa application documentation.",
    badgeLabel: "Visa Desk Assigned",
  },
  [BookingService.TICKETING]: {
    serviceId: BookingService.TICKETING,
    totalSteps: 3,
    steps: [
      { stepNumber: 1, title: "Flight Routing & Class", sub: "Select trip type, departure/destination cities, travel date, and preferred cabin class.", estTime: "Est. 30 sec", progress: 33 },
      { stepNumber: 2, title: "Passenger Contact & Review", sub: "Enter lead passenger contact details and review your commercial flight booking request.", estTime: "Est. 30 sec", progress: 66 },
      { stepNumber: 3, title: "Flight Request Reserved", sub: "Your commercial flight seat request is staged with our airline ticketing desk.", estTime: "Completed", progress: 100 },
    ],
    successTitle: "Air Ticketing Request Reserved",
    confirmationSubtitle: "Our ticketing desk is securing seat inventory for your requested flight itinerary.",
    badgeLabel: "Airline Ticketing Staged",
  },
  [BookingService.MEALS]: {
    serviceId: BookingService.MEALS,
    totalSteps: 3,
    steps: [
      { stepNumber: 1, title: "In-Flight Catering Preferences", sub: "Choose gourmet meal options, passenger count, travel date, and dietary requirements.", estTime: "Est. 30 sec", progress: 33 },
      { stepNumber: 2, title: "Contact Info & Review", sub: "Enter guest contact details and confirm your gourmet inflight menu selection.", estTime: "Est. 30 sec", progress: 66 },
      { stepNumber: 3, title: "Meal Request Staged", sub: "Your inflight gourmet meal order is sent to our executive culinary team.", estTime: "Completed", progress: 100 },
    ],
    successTitle: "Gourmet Catering Order Staged",
    confirmationSubtitle: "Our executive chef team is preparing custom inflight menus for your travel date.",
    badgeLabel: "Culinary Desk Notified",
  },
  [BookingService.TRANSFER]: {
    serviceId: BookingService.TRANSFER,
    totalSteps: 3,
    steps: [
      { stepNumber: 1, title: "Pickup & Drop Locations", sub: "Specify pickup location, destination address, and travel schedule.", estTime: "Est. 30 sec", progress: 33 },
      { stepNumber: 2, title: "Contact Info & Review", sub: "Enter passenger contact details and review chauffeur transfer request.", estTime: "Est. 30 sec", progress: 66 },
      { stepNumber: 3, title: "Transfer Booked", sub: "Your luxury chauffeur transfer is assigned to our ground transport fleet.", estTime: "Completed", progress: 100 },
    ],
    successTitle: "Chauffeur Transfer Reserved",
    confirmationSubtitle: "Our ground dispatch desk is assigning a luxury vehicle and executive chauffeur.",
    badgeLabel: "Chauffeur Fleet Assigned",
  },
  [BookingService.FAST_TRACK]: {
    serviceId: BookingService.FAST_TRACK,
    totalSteps: 3,
    steps: [
      { stepNumber: 1, title: "Fast Track Type & Airport", sub: "Select clearance type, airport, and flight schedule.", estTime: "Est. 30 sec", progress: 33 },
      { stepNumber: 2, title: "Passenger Contact & Review", sub: "Enter passenger contact details and review fast track booking.", estTime: "Est. 30 sec", progress: 66 },
      { stepNumber: 3, title: "Fast Track Reserved", sub: "Your expedited immigration clearance pass is generated.", estTime: "Completed", progress: 100 },
    ],
    successTitle: "Fast Track Clearance Reserved",
    confirmationSubtitle: "Our airport agent is assigned to meet you at the immigration queue.",
    badgeLabel: "Fast Track Confirmed",
  },
  [BookingService.LOUNGE]: {
    serviceId: BookingService.LOUNGE,
    totalSteps: 3,
    steps: [
      { stepNumber: 1, title: "Lounge Selection & Schedule", sub: "Select airport lounge, access date, entry time, and guest count.", estTime: "Est. 30 sec", progress: 33 },
      { stepNumber: 2, title: "Guest Contact & Review", sub: "Enter guest contact details and confirm lounge access reservation.", estTime: "Est. 30 sec", progress: 66 },
      { stepNumber: 3, title: "Lounge Access Reserved", sub: "Your VIP lounge pass is generated.", estTime: "Completed", progress: 100 },
    ],
    successTitle: "VIP Lounge Access Reserved",
    confirmationSubtitle: "Your digital lounge pass is active for your scheduled travel date.",
    badgeLabel: "Lounge Pass Active",
  },
  [BookingService.MEET_GREET]: {
    serviceId: BookingService.MEET_GREET,
    totalSteps: 3,
    steps: [
      { stepNumber: 1, title: "Service Package Selection", sub: "Select airport concierge tier and flight details.", estTime: "Est. 30 sec", progress: 33 },
      { stepNumber: 2, title: "Passenger Contact & Review", sub: "Enter passenger contact details and verify package selection.", estTime: "Est. 30 sec", progress: 66 },
      { stepNumber: 3, title: "Concierge Booking Confirmed", sub: "Your airport meet & greet agent is assigned.", estTime: "Completed", progress: 100 },
    ],
    successTitle: "Meet & Greet Concierge Reserved",
    confirmationSubtitle: "Our airport greeter is assigned to assist your arrival or departure.",
    badgeLabel: "Concierge Agent Assigned",
  },
};
'''

with open(os.path.join(config_dir, "workflow.config.ts"), "w", encoding="utf-8") as f:
    f.write(workflow_config)

# 11. Create types index exporter
index_types = '''export * from "./service.types";
export * from "./workflow.types";
export * from "./airport.types";
export * from "./pricing.types";
export * from "./booking.types";
'''

with open(os.path.join(types_dir, "index.ts"), "w", encoding="utf-8") as f:
    f.write(index_types)

print("Created Phase 4 Domain Model & Configuration-Driven Architecture files.")
