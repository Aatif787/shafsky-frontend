import { useState } from "react";

export interface AncillarySelection {
  seatSelection: boolean;
  seatType: "EXTRA_LEG_ROOM" | "AISLE" | "WINDOW" | "STANDARD";
  specialMeal: boolean;
  mealType: "VEGETARIAN" | "VEGAN" | "HALAL" | "KOSHER" | "DIABETIC" | "CHEF_SELECTION";
  extraBaggage: boolean;
  loungeAccess: boolean;
  meetAndAssist: boolean;
  airportTransfer: boolean;
}

export interface TicketingJourneyData {
  tripType: "round_trip" | "one_way" | "multi_city";
  fromAirport: string;
  toAirport: string;
  departDate: string;
  returnDate: string;
  dateFlexibility: boolean; // ±1–3 days toggle
  passengers: number;
  paxAdults: number;
  paxChildren: number;
  paxInfants: number;
  cabinClass: string;
  preferredAlliance?: string;
  nonStopOnly?: boolean;
  budgetGuidance?: string;
}

export interface TicketingPassengerData {
  fullName: string;
  phone: string;
  email: string;
  companyName?: string;
  vipNotes?: string;
  specialRequests: string;
  wheelchairAssistance?: boolean;
  medicalAssistance?: boolean;
  dietaryRestrictions?: string;
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
    dateFlexibility: false,
    passengers: 1,
    paxAdults: 1,
    paxChildren: 0,
    paxInfants: 0,
    cabinClass: "First / Business Class",
    preferredAlliance: "Any Alliance",
    nonStopOnly: false,
    budgetGuidance: "",
  });

  const [passenger, setPassenger] = useState<TicketingPassengerData>({
    fullName: "",
    phone: "",
    email: "",
    companyName: "",
    vipNotes: "",
    specialRequests: "",
    wheelchairAssistance: false,
    medicalAssistance: false,
    dietaryRestrictions: "",
  });

  const [ancillaries, setAncillaries] = useState<AncillarySelection>({
    seatSelection: false,
    seatType: "EXTRA_LEG_ROOM",
    specialMeal: false,
    mealType: "VEGETARIAN",
    extraBaggage: false,
    loungeAccess: false,
    meetAndAssist: false,
    airportTransfer: false,
  });

  const updateJourney = (fields: Partial<TicketingJourneyData>) => {
    setJourney((prev) => {
      const updated = { ...prev, ...fields };
      const totalPax = (updated.paxAdults || 1) + (updated.paxChildren || 0) + (updated.paxInfants || 0);
      return { ...updated, passengers: totalPax };
    });
  };

  const updatePassenger = (fields: Partial<TicketingPassengerData>) => {
    setPassenger((prev) => ({ ...prev, ...fields }));
  };

  const updateAncillaries = (fields: Partial<AncillarySelection>) => {
    setAncillaries((prev) => ({ ...prev, ...fields }));
  };

  // Base estimate calculation
  let basePrice = 85000;
  if (journey.cabinClass.includes("First")) basePrice = 165000;
  else if (journey.cabinClass.includes("Business")) basePrice = 115000;
  else if (journey.cabinClass.includes("Premium Economy")) basePrice = 45000;
  else if (journey.cabinClass.includes("Economy")) basePrice = 28000;

  let ancillaryPrice = 0;
  if (ancillaries.seatSelection) ancillaryPrice += 4500;
  if (ancillaries.extraBaggage) ancillaryPrice += 5500;
  if (ancillaries.loungeAccess) ancillaryPrice += 6500;
  if (ancillaries.meetAndAssist) ancillaryPrice += 12500;
  if (ancillaries.airportTransfer) ancillaryPrice += 14000;

  const estimatedFare = (basePrice * journey.passengers) + ancillaryPrice;

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
    ancillaries,
    updateAncillaries,
    estimatedFare,
  };
}
