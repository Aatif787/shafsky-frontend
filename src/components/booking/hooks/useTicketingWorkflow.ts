import { useState } from "react";

export interface TicketingJourneyData {
  tripType: "round_trip" | "one_way" | "multi_city";
  fromAirport: string;
  toAirport: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  cabinClass: string;
}

export interface TicketingPassengerData {
  fullName: string;
  phone: string;
  email: string;
  specialRequests: string;
}

export function useTicketingWorkflow(initialOrigin = "London Heathrow (LHR)", initialDest = "Delhi Indira Gandhi (DEL)") {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [busy, setBusy] = useState<boolean>(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  const [journey, setJourney] = useState<TicketingJourneyData>({
    tripType: "round_trip",
    fromAirport: initialOrigin,
    toAirport: initialDest,
    departDate: new Date().toISOString().split("T")[0],
    returnDate: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
    passengers: 1,
    cabinClass: "First / Business Class",
  });

  const [passenger, setPassenger] = useState<TicketingPassengerData>({
    fullName: "",
    phone: "",
    email: "",
    specialRequests: "",
  });

  const updateJourney = (fields: Partial<TicketingJourneyData>) => {
    setJourney((prev) => ({ ...prev, ...fields }));
  };

  const updatePassenger = (fields: Partial<TicketingPassengerData>) => {
    setPassenger((prev) => ({ ...prev, ...fields }));
  };

  const estimatedFare = 85000 * journey.passengers;

  return {
    currentStep,
    setCurrentStep,
    busy,
    setBusy,
    bookingRef,
    setBookingRef,
    journey,
    updateJourney,
    passenger,
    updatePassenger,
    estimatedFare,
  };
}
