export interface FlightRequest {
  flightNum: string;
  departDate: string; // YYYY-MM-DD format
  tripType?: "one_way" | "round_trip" | "multi_city";
}

export interface FlightAirport {
  code?: string | null; // IATA (e.g. BOM, LHR)
  name?: string | null; // Full airport name
  city?: string | null; // City name
  country?: string | null;
}

export interface FlightSchedule {
  scheduledTime?: string | null; // ISO or local HH:MM format
  terminal?: string | null; // Terminal details (if known)
  gate?: string | null;
}

export interface FlightData {
  flightNum: string;
  carrier: {
    iata: string; // e.g. AI, EK, UA
    name?: string | null; // e.g. Air India, Emirates
    logo?: string | null;
  };
  origin: FlightAirport;
  destination: FlightAirport;
  departure: FlightSchedule;
  arrival: FlightSchedule;
  duration?: string | null; // e.g. 2h 10m
  status?: string | null; // e.g. Scheduled, Active
  aircraft?: {
    model?: string | null; // e.g. Boeing 777, Gulfstream G650
    reg?: string | null;
  };
  eligibility?: {
    isBookable: boolean;
    remainingTimeHours: number;
    blockingMessage?: string;
  };
}

export interface FlightResponse {
  success: boolean;
  error?: {
    code: string; // e.g. INVALID_FORMAT, FLIGHT_NOT_FOUND, SERVICE_ERROR
    message: string;
  };
  data?: FlightData | FlightData[];
}

// Raw payload structure placeholder representing future AeroDataBox API responses
export interface AeroDataBoxFlightRaw {
  number: string;
  status: string;
  movement: {
    airport: {
      iata: string;
      name: string;
    };
    scheduledTimeLocal: string;
    terminal?: string;
  };
  aircraft?: {
    model?: string;
    reg?: string;
  };
}
