import React, { createContext, useContext, useState, ReactNode } from "react";

interface BookingContextState {
  leadPassengerName: string;
  setLeadPassengerName: (val: string) => void;
  passengerEmail: string;
  setPassengerEmail: (val: string) => void;
  passengerPhone: string;
  setPassengerPhone: (val: string) => void;
  paxAdults: number;
  setPaxAdults: (val: number) => void;
  busy: boolean;
  setBusy: (val: boolean) => void;
  createdBookingRef: string | null;
  setCreatedBookingRef: (val: string | null) => void;
  currentStep: number;
  setCurrentStep: (val: number) => void;
}

const BookingContext = createContext<BookingContextState | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [leadPassengerName, setLeadPassengerName] = useState<string>("");
  const [passengerEmail, setPassengerEmail] = useState<string>("");
  const [passengerPhone, setPassengerPhone] = useState<string>("");
  const [paxAdults, setPaxAdults] = useState<number>(1);
  const [busy, setBusy] = useState<boolean>(false);
  const [createdBookingRef, setCreatedBookingRef] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);

  return React.createElement(
    BookingContext.Provider,
    {
      value: {
        leadPassengerName,
        setLeadPassengerName,
        passengerEmail,
        setPassengerEmail,
        passengerPhone,
        setPassengerPhone,
        paxAdults,
        setPaxAdults,
        busy,
        setBusy,
        createdBookingRef,
        setCreatedBookingRef,
        currentStep,
        setCurrentStep,
      },
    },
    children
  );
}

export function useBookingContext() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBookingContext must be used within a BookingProvider");
  }
  return context;
}
