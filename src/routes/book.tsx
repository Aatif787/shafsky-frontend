import React from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { z } from "zod";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/home/sections/Footer";
import { AirportBookingFlow } from "@/components/booking/AirportBookingFlow";

const bookSearchSchema = z.object({
  service: z.string().optional().catch("meet-greet"),
  service_id: z.string().optional().catch(""),
  sub: z.string().optional().catch(""),
  sub_service: z.string().optional().catch(""),
  package_id: z.string().optional().catch(""),
  package_name: z.string().optional().catch(""),
  package_price: z.string().optional().catch(""),
  airport: z.string().optional().catch(""),
  airport_name: z.string().optional().catch(""),
  origin: z.string().optional().catch(""),
  destination: z.string().optional().catch(""),
  transit: z.string().optional().catch(""),
  direction: z.string().optional().catch(""),
  journey_type: z.string().optional().catch(""),
  travel_type: z.string().optional().catch(""),
  flight_type: z.string().optional().catch(""),
  depart_date: z.string().optional().catch(""),
  service_date: z.string().optional().catch(""),
  pax_adults: z.union([z.number(), z.string()]).optional().catch(1),
  pax_children: z.union([z.number(), z.string()]).optional().catch(0),
  pax_infants: z.union([z.number(), z.string()]).optional().catch(0),
  flight_number: z.string().optional().catch(""),
  booking_mode: z.string().optional().catch("package"),
  from_hero: z.string().optional().catch(""),
  source: z.string().optional().catch(""),
});

export const Route = createFileRoute("/book")({
  validateSearch: (search) => bookSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Book Airport Meet & Greet — Shafsky Aviation" },
      {
        name: "description",
        content:
          "Reserve airport meet & greet and passenger assistance services across 20+ Indian airports and global hubs.",
      },
    ],
  }),
  component: BookRoutePage,
});

function BookRoutePage() {
  const search = Route.useSearch();

  // If explicitly Air Charter requested
  const s = (search.service || search.service_id || "").toLowerCase();
  if (s.includes("charter") || s.includes("aviation") || s.includes("jet")) {
    return <Navigate to="/solutions/aviation" />;
  }

  // DEFAULT & AIRPORT CONCIERGE FLOW:
  // Directly opens AirportBookingFlow (Flight -> Passenger -> Confirm Booking)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navigation visible={true} />
      <main className="flex-1 pt-16 sm:pt-20">
        <AirportBookingFlow searchParams={search} />
      </main>
      <Footer />
    </div>
  );
}
