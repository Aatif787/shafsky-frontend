import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { getAirport, type Airport } from "@/data/airports";
import { getAirportRegistryEntry } from "@/data/airportRegistry";
import { PageJourneyWrapper } from "@/components/site/PageJourneyWrapper";
import { DestinationHero } from "@/components/airports/DestinationHero";
import { DestinationBody } from "@/components/airports/DestinationBody";

const airportPageSearchSchema = z.object({
  origin: z.string().optional().catch(""),
  destination: z.string().optional().catch(""),
  transit: z.string().optional().catch(""),
  airport: z.string().optional().catch(""),
  airport_id: z.string().optional().catch(""),
  airport_name: z.string().optional().catch(""),
  depart_date: z.string().optional().catch(""),
  pax_adults: z.union([z.number(), z.string()]).optional().catch(1),
  pax_children: z.union([z.number(), z.string()]).optional().catch(0),
  pax_infants: z.union([z.number(), z.string()]).optional().catch(0),
  direction: z.string().optional().catch(""),
  travel_type: z.string().optional().catch(""),
  flight_type: z.string().optional().catch(""),
  from_hero: z.string().optional().catch(""),
  booking_mode: z.string().optional().catch(""),
  package_id: z.string().optional().catch(""),
});

export const Route = createFileRoute("/airports/$code")({
  validateSearch: (search) => airportPageSearchSchema.parse(search),
  head: ({ params }) => {
    const registryEntry = getAirportRegistryEntry(params.code);
    const a = getAirport(params.code);
    const url = `https://aero-launch-sequence.lovable.app/airports/${params.code}`;
    const title = registryEntry
      ? registryEntry.seo.title
      : a
      ? `${a.city} (${a.code}) — Shafsky Aviation Services Experience`
      : "Destination — Shafsky Aviation Services";
    const desc = registryEntry
      ? registryEntry.seo.description
      : a
      ? `${a.tagline}. Premium concierge experience for ${a.city}.`
      : "Shafsky destination";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  loader: ({ params }) => {
    const a = getAirport(params.code);
    if (!a) throw notFound();
    return a;
  },
  component: DestinationPage,
});

function DestinationPage() {
  const a = Route.useLoaderData() as Airport;
  const search = Route.useSearch();

  useEffect(() => {
    if (!a) return;
    const fromHero = Boolean(search.from_hero);
    if (fromHero) {
      const el = document.getElementById("available-services");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [a, search.from_hero]);

  if (!a) {
    return null;
  }

  return (
    <PageJourneyWrapper
      category="Coverage"
      categoryHref="/airports"
      current={`${a.city} (${a.code})`}
    >
      {/* 1. AIRPORT HERO (back bar lives inside DestinationHero so SSR/client trees match) */}
      <DestinationHero a={a} />

      {/* 2. DYNAMIC AIRPORT BODY */}
      <DestinationBody a={a} bookingSearch={search} />
    </PageJourneyWrapper>
  );
}
