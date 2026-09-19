import { createFileRoute, Navigate } from "@tanstack/react-router";
import { z } from "zod";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/home/sections/Footer";
import { AirportBookingFlow } from "@/components/booking/AirportBookingFlow";
import { TransportExperience } from "@/components/booking/experiences/TransportExperience";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";

const bookSearchSchema = z.object({
  service: z.string().optional().catch("meet-greet"),
  service_id: z.string().optional().catch(""),
  sub: z.string().optional().catch(""),
  sub_service: z.string().optional().catch(""),
  vehicle_id: z.string().optional().catch(""),
  vehicle_name: z.string().optional().catch(""),
  category: z.string().optional().catch(""),
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
  head: () =>
    pageHead({
      title: "Book Airport Meet & Greet Online | Shafsky Aviation",
      description:
        "Reserve airport Meet & Greet and passenger assistance across 20+ Indian airports. Fast-track, lounge, and luxury transfer booking with Shafsky Aviation.",
      path: "/book",
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Book Meet & Greet", path: "/book" },
        ]),
      ],
    }),
  component: BookRoutePage,
});

function BookRoutePage() {
  const search = Route.useSearch();

  // If explicitly Private Charter requested
  const s = (search.service || search.service_id || "").toLowerCase();
  if (s.includes("charter") || s.includes("aviation") || s.includes("jet")) {
    return <Navigate to="/solutions/aviation" />;
  }

  // If Transport / Chauffeured Ground Fleet requested:
  if (s.includes("transport") || s.includes("vehicle") || search.vehicle_id) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
        <Navigation visible={true} />
        <main id="main-content" className="flex-1 pt-16 sm:pt-20 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <TransportExperience
              initialSubService={search.sub || search.sub_service || search.category}
              initialVehicleId={search.vehicle_id}
              initialVehicleName={search.vehicle_name}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // DEFAULT & AIRPORT CONCIERGE FLOW:
  // Directly opens AirportBookingFlow (Flight -> Passenger -> Confirm Booking)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navigation visible={true} />
      <main id="main-content" className="flex-1 pt-16 sm:pt-20">
        <AirportBookingFlow searchParams={search} />
      </main>
      <Footer />
    </div>
  );
}
