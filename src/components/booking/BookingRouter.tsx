import React from "react";
import BookingView from "@/components/views/BookingView";

interface BookingRouterProps {
  searchParams?: any;
}

export function BookingRouter({ searchParams }: BookingRouterProps) {
  return <BookingView searchParams={searchParams} />;
}

export default BookingRouter;
