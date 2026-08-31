import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/home/sections/Footer";
import { UniversalBookingHub, BookingServiceType } from "@/components/booking/UniversalBookingHub";

const bookSearchSchema = z.object({
  service: z.string().optional().catch("meet-greet"),
  service_id: z.string().optional().catch(""),
});

export const Route = createFileRoute("/book")({
  validateSearch: (search) => bookSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Book Luxury Aviation & Concierge Services — Shafsky Aviation" },
      {
        name: "description",
        content:
          "Reserve airport meet & greet, private jet charter, luxury transport, 5-star hotels and special services across 20+ Indian airports and global hubs.",
      },
    ],
  }),
  component: BookRoutePage,
});

function BookRoutePage() {
  const search = Route.useSearch();
  
  // Normalize search service to valid booking tab
  let initialTab: BookingServiceType = "meet-greet";
  const s = (search.service || search.service_id || "").toLowerCase();
  if (s.includes("charter") || s.includes("aviation") || s.includes("jet")) {
    initialTab = "charter";
  } else if (s.includes("transport") || s.includes("car") || s.includes("vehicle")) {
    initialTab = "transport";
  } else if (s.includes("hotel") || s.includes("stay")) {
    initialTab = "hotel";
  } else if (s.includes("special") || s.includes("pso") || s.includes("visa")) {
    initialTab = "special";
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navigation visible={true} />
      <main className="flex-1 pt-16 sm:pt-20">
        <UniversalBookingHub initialService={initialTab} />
      </main>
      <Footer />
    </div>
  );
}

export default BookRoutePage;
