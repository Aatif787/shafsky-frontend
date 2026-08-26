/**
 * Booking Draft & State Storage Hook
 * (Shafsky Aviation Services Architecture - Phase 1 Foundation)
 */

import { useState, useEffect } from "react";

export interface BookingDraftState {
  leadPassengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  flightNumber: string;
  specialRequests: string;
}

const STORAGE_KEY = "shafsky_booking_draft_v1";

export function useBookingState(initialParams?: any) {
  const [draft, setDraft] = useState<BookingDraftState>(() => {
    let leadPassengerName = "";
    let passengerEmail = "";
    let passengerPhone = "";
    let flightNumber = initialParams?.flight_number || "";
    let specialRequests = initialParams?.notes || "";

    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          leadPassengerName = parsed.leadPassengerName || leadPassengerName;
          passengerEmail = parsed.passengerEmail || passengerEmail;
          passengerPhone = parsed.passengerPhone || passengerPhone;
          flightNumber = parsed.flightNumber || flightNumber;
          specialRequests = parsed.specialRequests || specialRequests;
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    return {
      leadPassengerName,
      passengerEmail,
      passengerPhone,
      flightNumber,
      specialRequests,
    };
  });

  const updateDraft = (updates: Partial<BookingDraftState>) => {
    setDraft((prev) => {
      const next = { ...prev, ...updates };
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
      } catch {
        // Ignore storage error
      }
      return next;
    });
  };

  const clearDraft = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage error
    }
  };

  return {
    draft,
    updateDraft,
    clearDraft,
  };
}
