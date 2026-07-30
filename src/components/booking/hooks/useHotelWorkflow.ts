import { useState, useEffect } from "react";
import {
  calculateStayNights,
  recommendRoomCategory,
  detectGroupBooking,
  detectVipStay,
  calculateHotelEstimate,
} from "@/lib/hotel/hotelIntelligence";

export interface HotelStayData {
  destination: string;
  checkIn: string;
  checkOut: string;
  dateFlexibility: boolean;
  paxAdults: number;
  paxChildren: number;
  paxInfants: number;
  roomCount: number;
  roomType: string;
  purposeOfStay: "Business" | "Family" | "Honeymoon" | "Anniversary" | "Wellness" | "Leisure";
  brandPreference?: string;
  budgetGuidance?: string;
  mealPlan: string;
  loyaltyProgram?: string;
  loyaltyNumber?: string;
}

export interface IndividualGuest {
  id: string;
  type: "Adult" | "Child" | "Infant";
  guestNumber: number;
  roomAssignment: number;
  firstName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other" | "";
  dateOfBirth?: string;
  specialRequests?: string;
}

export interface HotelGuestData {
  fullName: string;
  phone: string;
  email: string;
  isCorporateBooking?: boolean;
  companyName?: string;
  travellerRelationship?: string;
  specialRequests: string;
  accessibilityNeeds?: string;
  guestsList?: IndividualGuest[];
}

export interface HotelPersonalizationData {
  airportTransfer: boolean;
  spaInterest: boolean;
  experiencesInterest: boolean;
  earlyCheckin: boolean;
  lateCheckout: boolean;
  romanticSetup: boolean;
  highFloor: boolean;
}

const DRAFT_KEY = "shafsky_hotel_draft";

export function useHotelWorkflow(initialDest = "Dubai, UAE") {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [busy, setBusy] = useState<boolean>(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  const [stay, setStay] = useState<HotelStayData>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.stay) return parsed.stay;
      }
    } catch (_) {}
    return {
      destination: initialDest,
      checkIn: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      checkOut: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
      dateFlexibility: false,
      paxAdults: 2,
      paxChildren: 0,
      paxInfants: 0,
      roomCount: 1,
      roomType: "deluxe_suite",
      purposeOfStay: "Leisure",
      brandPreference: "Any Preferred Hotel",
      budgetGuidance: "",
      mealPlan: "breakfast",
      loyaltyProgram: "Marriott Bonvoy",
      loyaltyNumber: "",
    };
  });

  const [guest, setGuest] = useState<HotelGuestData>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.guest) return parsed.guest;
      }
    } catch (_) {}
    return {
      fullName: "",
      phone: "",
      email: "",
      isCorporateBooking: false,
      companyName: "",
      travellerRelationship: "Self",
      specialRequests: "",
      accessibilityNeeds: "",
    };
  });

  const [personalization, setPersonalization] = useState<HotelPersonalizationData>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.personalization) return parsed.personalization;
      }
    } catch (_) {}
    return {
      airportTransfer: false,
      spaInterest: false,
      experiencesInterest: false,
      earlyCheckin: false,
      lateCheckout: false,
      romanticSetup: false,
      highFloor: false,
    };
  });

  // Save draft state
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ stay, guest, personalization }));
    } catch (_) {}
  }, [stay, guest, personalization]);

  const updateStay = (fields: Partial<HotelStayData>) => {
    setStay((prev) => ({ ...prev, ...fields }));
  };

  const updateGuest = (fields: Partial<HotelGuestData>) => {
    setGuest((prev) => ({ ...prev, ...fields }));
  };

  const updatePersonalization = (fields: Partial<HotelPersonalizationData>) => {
    setPersonalization((prev) => ({ ...prev, ...fields }));
  };

  // Delegated Intelligence Calculations
  const totalGuests = stay.paxAdults + stay.paxChildren + stay.paxInfants;
  const nights = calculateStayNights(stay.checkIn, stay.checkOut);
  const isExtendedStay = nights >= 30;
  const isGroupBooking = detectGroupBooking(stay.roomCount);
  const isVipStay = detectVipStay(stay.roomType, nights, stay.roomCount, guest.isCorporateBooking);
  const recommendedRoom = recommendRoomCategory(
    stay.paxAdults,
    stay.paxChildren,
    stay.paxInfants,
    stay.roomType
  );
  const estimatedTotal = calculateHotelEstimate(
    stay.roomType,
    stay.roomCount,
    nights,
    personalization
  );

  return {
    currentStep,
    setCurrentStep,
    busy,
    setBusy,
    bookingRef,
    setBookingRef,
    stay,
    updateStay,
    guest,
    updateGuest,
    personalization,
    updatePersonalization,
    nights,
    totalGuests,
    isExtendedStay,
    isGroupBooking,
    isVipStay,
    recommendedRoom,
    estimatedTotal,
  };
}
