import { FlightData } from "@/services/flight/FlightTypes";

export interface AirportBookingFlowProps {
  searchParams?: Record<string, any>;
}

export interface RouteMismatchInfo {
  flightNum: string;
  flightData: FlightData;
  apiOrigin: string;
  apiOriginCity: string;
  apiDest: string;
  apiDestCity: string;
  userOrigin: string;
  userOriginCity: string;
  userDest: string;
  userDestCity: string;
  message: string;
  leg?: 1 | 2;
}

export interface PassengerDetail {
  fullName: string;
  age: string;
  phone: string;
  email: string;
}

export interface AirportPackageItem {
  id: string;
  title: string;
  tagline?: string;
  basePrice: number;
  currency: string;
  features?: string[];
}

export type PaymentStatus = "IDLE" | "OPEN" | "VERIFYING" | "PAID" | "FAILED" | "DISMISSED";

export const ICAO_TO_IATA_MAP: Record<string, string> = {
  AIC: "AI", IGO: "6E", SEJ: "SG", VTI: "UK", AXB: "IX",
  FLG: "9I", GOW: "G8", AKJ: "QP", UAE: "EK", QTR: "QR",
  ETD: "EY", BAW: "BA", SIA: "SQ", DLH: "LH", AFR: "AF",
  KLM: "KL", THA: "TG", MAS: "MH", CXA: "CX", FDB: "FZ",
};
