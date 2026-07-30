export enum BookingService {
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
