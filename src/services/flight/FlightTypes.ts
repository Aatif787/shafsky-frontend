export interface FlightRequest {
  flightNum: string;
  departDate: string; // YYYY-MM-DD format
  tripType?: "one_way" | "round_trip" | "multi_city";
}

export interface FlightAirport {
  code: string; // IATA (e.g. BOM, LHR)
  name: string; // Full airport name
  city: string; // City name
}

export interface FlightSchedule {
  scheduledTime: string; // ISO or local HH:MM format
  terminal: string; // Terminal details (if known)
}

export interface FlightData {
  flightNum: string;
  carrier: {
    iata: string; // e.g. AI, EK, UA
    name: string; // e.g. Air India, Emirates
  };
  origin: FlightAirport;
  destination: FlightAirport;
  departure: FlightSchedule;
  arrival: FlightSchedule;
  duration: string; // e.g. 2h 10m
  status: string; // e.g. Scheduled, Active
  aircraft: {
    model: string; // e.g. Boeing 777, Gulfstream G650
    reg?: string;
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
