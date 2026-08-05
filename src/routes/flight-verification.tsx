import { useEffect, useState } from "react";
import { createFileRoute, useLocation } from "@tanstack/react-router";
import { z } from "zod";
import { FlightVerificationResultView } from "@/components/views/FlightVerificationResultView";
import { FlightData } from "@/services/flight/FlightTypes";
import { Navigation } from "@/components/Navigation";

const flightVerificationSearchSchema = z.object({
  flight_number: z.string().optional().catch(""),
  depart_date: z.string().optional().catch(""),
  direction: z.string().optional().catch("arrival"),
  service_id: z.string().optional().catch(""),
  pax_adults: z.number().optional().catch(1),
  pax_children: z.number().optional().catch(0),
  pax_infants: z.number().optional().catch(0),
  notes: z.string().optional().catch(""),
});

export const Route = createFileRoute("/flight-verification")({
  validateSearch: (search) => flightVerificationSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Flight Verification Result — Shafsky Aviation" },
      {
        name: "description",
        content:
          "Real-time flight schedule and status verification result powered by live aviation database providers.",
      },
    ],
  }),
  component: FlightVerificationPage,
});

function FlightVerificationPage() {
  const searchParams = Route.useSearch();
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Hydrate verified flight data from sessionStorage
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("shafsky_validated_flight");
        if (stored) {
          const parsed = JSON.parse(stored);
          setFlightData(parsed);
        }
      } catch (err) {
        console.error("[FlightVerification] Error parsing cached flight data:", err);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navigation />
      <div className="pt-20">
        {loading ? (
          <div className="w-full max-w-[1100px] mx-auto p-12 text-center animate-pulse space-y-4">
            <div className="h-16 bg-slate-200 rounded-2xl w-full" />
            <div className="h-64 bg-slate-200 rounded-3xl w-full" />
          </div>
        ) : (
          <FlightVerificationResultView
            flightData={flightData}
            searchParams={searchParams}
          />
        )}
      </div>
    </div>
  );
}
