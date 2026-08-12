import { BookingService, ServiceCategory, ServiceDescriptor } from "../types/service.types";

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

export interface RequiredBookingFields {
  requiresAirport: boolean;
  requiresJourneyType: boolean;
  requiresDate: boolean;
  requiresFlight: boolean;
  requiresFlightVerification: boolean;
}

export function getServiceDescriptor(serviceIdOrName?: string | null): ServiceDescriptor | null {
  if (!serviceIdOrName) return SERVICES_CONFIG[BookingService.MEET_GREET];

  const clean = serviceIdOrName.toLowerCase().trim().replace(/[\s-&]+/g, "_");

  for (const key of Object.keys(SERVICES_CONFIG) as BookingService[]) {
    const config = SERVICES_CONFIG[key];
    if (
      key === clean ||
      config.id === clean ||
      config.displayName.toLowerCase().replace(/[\s-&]+/g, "_") === clean
    ) {
      return config;
    }
  }

  if (clean.includes("meet") || clean.includes("greet")) {
    return SERVICES_CONFIG[BookingService.MEET_GREET];
  }
  if (clean.includes("lounge")) {
    return SERVICES_CONFIG[BookingService.LOUNGE];
  }
  if (clean.includes("fast") || clean.includes("track")) {
    return SERVICES_CONFIG[BookingService.FAST_TRACK];
  }
  if (clean.includes("transfer") || clean.includes("transport") || clean.includes("chauffeur")) {
    return SERVICES_CONFIG[BookingService.TRANSFER];
  }
  if (clean.includes("porter") || clean.includes("baggage")) {
    return SERVICES_CONFIG[BookingService.MEET_GREET];
  }
  if (clean.includes("hotel")) {
    return SERVICES_CONFIG[BookingService.HOTEL];
  }
  if (clean.includes("visa")) {
    return SERVICES_CONFIG[BookingService.VISA];
  }
  if (clean.includes("wheelchair")) {
    return SERVICES_CONFIG[BookingService.MEET_GREET];
  }

  return SERVICES_CONFIG[BookingService.MEET_GREET];
}

export function getRequiredBookingFields(serviceIdOrName?: string | null): RequiredBookingFields {
  const descriptor = getServiceDescriptor(serviceIdOrName);
  const requiresFlight = descriptor ? descriptor.requiresFlight : true;
  const isVisa = descriptor?.id === BookingService.VISA || descriptor?.requiresVisa || false;
  const isHotel = descriptor?.id === BookingService.HOTEL || descriptor?.requiresHotel || false;
  const isLounge = descriptor?.id === BookingService.LOUNGE || false;

  const isAirportOptional = isVisa || isHotel;
  const isJourneyIndependent = isVisa || isHotel || isLounge;

  return {
    requiresAirport: !isAirportOptional,
    requiresJourneyType: !isJourneyIndependent,
    requiresDate: true,
    requiresFlight: requiresFlight,
    requiresFlightVerification: requiresFlight,
  };
}

