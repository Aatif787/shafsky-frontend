import { AirportMetadata } from "../types/airport.types";

export const MAJOR_AIRPORTS_CONFIG: AirportMetadata[] = [
  { code: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi", country: "India", terminals: ["Terminal 1", "Terminal 2", "Terminal 3"] },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India", terminals: ["All Concourses"] },
  { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "UAE", terminals: ["All Concourses"] },
  { code: "LHR", name: "London Heathrow Airport", city: "London", country: "United Kingdom", terminals: ["All Concourses"] },
  { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", terminals: ["All Concourses"] },
];
