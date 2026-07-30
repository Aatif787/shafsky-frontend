import { AirportMetadata } from "../types/airport.types";

export const MAJOR_AIRPORTS_CONFIG: AirportMetadata[] = [
  { code: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi", country: "India", terminals: ["T1", "T2", "T3"] },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India", terminals: ["T1", "T2"] },
  { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "UAE", terminals: ["T1", "T2", "T3"] },
  { code: "LHR", name: "London Heathrow Airport", city: "London", country: "United Kingdom", terminals: ["T2", "T3", "T4", "T5"] },
  { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", terminals: ["T1", "T2", "T3", "T4"] },
];
