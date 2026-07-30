import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { getAirport, type Airport } from "@/data/airports";
import { getAirportRegistryEntry } from "@/data/airportRegistry";
import { PageJourneyWrapper } from "@/components/site/PageJourneyWrapper";
import { DestinationHero } from "@/components/airports/DestinationHero";
import { DestinationBody } from "@/components/airports/DestinationBody";

export const Route = createFileRoute("/airports/$code")({
  head: ({ params }) => {
    const registryEntry = getAirportRegistryEntry(params.code);
    const a = getAirport(params.code);
    const url = `https://aero-launch-sequence.lovable.app/airports/${params.code}`;
    const title = registryEntry
      ? registryEntry.seo.title
      : a
      ? `${a.city} (${a.code}) — Shafsky Aviation Experience`
      : "Destination — Shafsky Aviation";
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

  useEffect(() => {
    if (a) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [a]);

  if (!a) {
    return null;
  }

  return (
    <PageJourneyWrapper
      category="Coverage"
      categoryHref="/airports"
      current={`${a.city} (${a.code})`}
    >
      {/* 1. AIRPORT HERO */}
      <DestinationHero a={a} />

      {/* 2. DYNAMIC AIRPORT BODY */}
      <DestinationBody a={a} />
    </PageJourneyWrapper>
  );
}
