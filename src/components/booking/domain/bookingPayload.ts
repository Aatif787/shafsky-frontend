import { BookingPayload } from "../types/booking.types";

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
