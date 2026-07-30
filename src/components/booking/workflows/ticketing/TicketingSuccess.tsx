import React from "react";
import { BookingSuccessPass } from "../../shared/BookingSuccessPass";

interface TicketingSuccessProps {
  bookingRef: string;
  routeSummary: string;
  guestSummary: string;
}

export function TicketingSuccess({ bookingRef, routeSummary, guestSummary }: TicketingSuccessProps) {
  return (
    <BookingSuccessPass
      badge="Flight Reservation Staged"
      title="Commercial Flight Ticket Request Submitted"
      subtitle={`Our airline ticketing desk is holding preferred seat inventory for ${routeSummary}.`}
      bookingRef={bookingRef}
      guestSummary={guestSummary}
    />
  );
}
