import { BookingService } from "./service.types";

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
