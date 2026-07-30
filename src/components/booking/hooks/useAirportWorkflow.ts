import { useState } from "react";
import { getAirportBusinessPrice } from "@/data/airportRegistry";

export interface AirportWorkflowState {
  airportCode: string;
  airportName: string;
  direction: "arrival" | "departure" | "transit";
  bookingMode: "individual" | "package";
  selectedService: string;
  selectedPackage: string;
  serviceDate: string;
  serviceTime: string;
  guestCount: number;
  fullName: string;
  phone: string;
  email: string;
  flightNumber: string;
  specialRequests: string;
}

export function useAirportWorkflow(searchParamsOrService?: any, initialOriginArg?: string) {
  let searchParams: any = {};
  if (typeof searchParamsOrService === "object" && searchParamsOrService !== null) {
    searchParams = searchParamsOrService;
  } else {
    searchParams = {
      service_id: searchParamsOrService,
      origin: initialOriginArg,
    };
  }

  const initialService = searchParams?.service_id || searchParams?.sub || "meet_greet";
  const rawOrigin = searchParams?.origin || "Delhi (DEL)";
  const extractedCode = rawOrigin.match(/\(([A-Z]{3})\)/)?.[1] || (rawOrigin.length === 3 ? rawOrigin.toUpperCase() : "DEL");

  const initialBookingMode: "individual" | "package" =
    searchParams?.booking_mode === "package" || searchParams?.package_id || searchParams?.mode === "package"
      ? "package"
      : "individual";

  const initialPackageId = searchParams?.package_id || "gold";

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [busy, setBusy] = useState<boolean>(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  const [state, setState] = useState<AirportWorkflowState>({
    airportCode: extractedCode,
    airportName: rawOrigin || "Delhi Indira Gandhi International Airport",
    direction: "arrival",
    bookingMode: initialBookingMode,
    selectedService: initialService,
    selectedPackage: initialPackageId,
    serviceDate: searchParams?.depart_date || new Date().toISOString().split("T")[0],
    serviceTime: "14:30",
    guestCount: searchParams?.pax_adults || 1,
    fullName: "",
    phone: "",
    email: "",
    flightNumber: searchParams?.flight_number || "AI302",
    specialRequests: searchParams?.notes || "",
  });

  const updateState = (fields: Partial<AirportWorkflowState>) => {
    setState((prev) => ({ ...prev, ...fields }));
  };

  const getBasePrice = () => {
    return getAirportBusinessPrice(
      state.airportCode,
      state.bookingMode,
      state.bookingMode === "package" ? state.selectedPackage : state.selectedService
    );
  };

  const totalPrice = getBasePrice() * state.guestCount;

  return {
    currentStep,
    setCurrentStep,
    busy,
    setBusy,
    bookingRef,
    setBookingRef,
    state,
    updateState,
    totalPrice,
  };
}
