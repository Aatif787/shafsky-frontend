import React, { Suspense } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { BookingEngineSkeleton } from "@/components/ui/SkeletonLoader";
import { AppErrorBoundary } from "@/components/ui/AppErrorBoundary";

const BookingView = React.lazy(() => import("@/components/views/BookingView"));

const bookSearchSchema = z.object({
  origin: z.string().optional().catch(""),
  destination: z.string().optional().catch(""),
  depart_date: z.string().optional().catch(""),
  pax_adults: z.number().optional().catch(1),
  pax_children: z.number().optional().catch(0),
  pax_infants: z.number().optional().catch(0),
  notes: z.string().optional().catch(""),
  service_id: z.string().optional().catch(""),
  package_id: z.string().optional().catch(""),
  booking_mode: z.string().optional().catch(""),
  mode: z.string().optional().catch(""),
  sub: z.string().optional().catch(""),
  flight_number: z.string().optional().catch(""),
});

export const Route = createFileRoute("/book")({
  validateSearch: (search) => bookSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Book Airport Services — Shafsky Aviation" },
      {
        name: "description",
        content:
          "Validate your flight details and book premium airport concierge services with Shafsky Aviation.",
      },
    ],
  }),
  errorComponent: ({ error }: { error: Error }) => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center bg-[#06090f] text-white">
      <h2 className="text-xl font-bold font-mono text-red-400">Booking Engine Unavailable</h2>
      <p className="mt-2 text-xs text-white/60 max-w-md">
        Unable to load the booking engine: {error.message}
      </p>
      <Link to="/" className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-mono uppercase tracking-widest text-white transition">
        Return to Homepage
      </Link>
    </div>
  ),
  component: BookRouteComponent,
});

import { PageJourneyWrapper } from "@/components/site/PageJourneyWrapper";

function BookRouteComponent() {
  const searchParams = Route.useSearch();
  return (
    <PageJourneyWrapper category="Book Now" categoryHref="/book" showCTA={false} showRelated={false}>
      <AppErrorBoundary name="BookingView">
        <Suspense fallback={<BookingEngineSkeleton />}>
          <BookingView searchParams={searchParams} />
        </Suspense>
      </AppErrorBoundary>
    </PageJourneyWrapper>
  );
}
