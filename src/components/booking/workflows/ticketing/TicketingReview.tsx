import React from "react";
import { ReviewSummary } from "../../shared/ReviewSummary";
import { TicketingJourneyData, TicketingPassengerData } from "../../hooks/useTicketingWorkflow";

interface TicketingReviewProps {
  journey: TicketingJourneyData;
  passenger: TicketingPassengerData;
  estimatedFare: number;
  busy: boolean;
  onEdit: () => void;
  onSubmit: () => void;
}

export function TicketingReview({ journey, passenger, estimatedFare, busy, onEdit, onSubmit }: TicketingReviewProps) {
  const routeString = `${journey.fromAirport} → ${journey.toAirport}`;
  const dateString = journey.tripType === "round_trip"
    ? `${journey.departDate} to ${journey.returnDate}`
    : journey.departDate;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
          Step 3 of 3 — Final Review
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
          Verify Flight Quotation Request
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
          Confirm your flight itinerary and passenger details before submission to our ticketing desk.
        </p>
      </div>

      <ReviewSummary
        serviceTitle={`Commercial Flight Reservation (${journey.cabinClass})`}
        badgeLabel="Passengers"
        badgeValue={`${journey.passengers} Passenger(s)`}
        items={[
          { label: "Flight Route", value: routeString },
          { label: "Travel Dates", value: dateString },
          { label: "Cabin Class", value: journey.cabinClass },
          { label: "Lead Passenger", value: passenger.fullName },
          { label: "Contact Phone", value: passenger.phone },
          { label: "Contact Email", value: passenger.email },
        ]}
        totalPrice={estimatedFare}
        submitLabel="Request Flight Ticket Quote"
        busy={busy}
        onEdit={onEdit}
        onSubmit={onSubmit}
      />
    </div>
  );
}
