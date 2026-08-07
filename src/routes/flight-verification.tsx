import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

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
      { title: "Journey Details — Shafsky Aviation" },
    ],
  }),
  component: FlightVerificationPage,
});

function FlightVerificationPage() {
  const searchParams = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    navigate({
      to: "/book",
      search: {
        ...searchParams,
        from_hero: "true",
        validated: "true",
      } as any,
      replace: true,
    });
  }, [navigate, searchParams]);

  return null;
}
