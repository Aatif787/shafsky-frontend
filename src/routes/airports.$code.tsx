import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { getAirport, type Airport } from "@/data/airports";
import { getAirportRegistryEntry } from "@/data/airportRegistry";
import { PageJourneyWrapper } from "@/components/site/PageJourneyWrapper";
import { DestinationHero } from "@/components/airports/DestinationHero";
import { DestinationBody } from "@/components/airports/DestinationBody";
import { StickyMobileBookingBar } from "@/components/ui/StickyMobileBookingBar";
import {
  pageHead,
  airportPageJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
} from "@/lib/seo";

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
    const code = (params.code || "").toUpperCase();
    const title = registryEntry.seo.title;
    const desc = registryEntry.seo.description;
    const image = registryEntry.coverImage || a?.cover;
    const faqs = (registryEntry.faqs || []).map(([q, answer]) => ({ q, a: answer }));
    return pageHead({
      title,
      description: desc,
      path: `/airports/${code}`,
      image,
      type: "article",
      keywords: registryEntry.seo.keywords,
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Airports", path: "/airports" },
          { name: `${registryEntry.city} (${registryEntry.code})`, path: `/airports/${code}` },
        ]),
        airportPageJsonLd(registryEntry),
        ...(faqs.length > 0 ? [faqJsonLd(faqs)] : []),
      ],
    });
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

      {/* 3. STICKY MOBILE QUICK-BOOKING BAR */}
      <StickyMobileBookingBar
        title={`${a.city} (${a.code}) Concierge`}
        price="From ₹5,500"
        actionHref="#available-services"
        buttonText="View Packages"
        whatsappMessage={`Hi Shafsky Team, I would like to inquire about VIP airport concierge services at ${a.city} (${a.code}).`}
      />
    </PageJourneyWrapper>
  );
}
