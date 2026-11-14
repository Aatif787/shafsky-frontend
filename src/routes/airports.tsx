import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { PageJourneyWrapper } from "@/components/site/PageJourneyWrapper";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { ICICI_REVIEW_MODE } from "@/lib/config/reviewMode";
import {
  ServiceableAirportsSection,
  type AirportListingItem,
} from "@/components/airports/ServiceableAirportsSection";

export type { AirportListingItem };

export const Route = createFileRoute("/airports")({
  head: () =>
    pageHead({
      title: "Airport Meet & Greet Coverage Across India | Shafsky Aviation",
      description: ICICI_REVIEW_MODE
        ? "Book VIP Meet & Greet, airside escort, and VIP lounge access at 20+ Indian airports including Delhi, Mumbai, Bengaluru, Hyderabad, Goa, and Jaipur."
        : "Book VIP Meet & Greet, airside escort, lounge access, and luxury transfers at 20+ Indian airports including Delhi, Mumbai, Bengaluru, Hyderabad, Goa, and Jaipur.",
      path: "/airports",
      keywords: [
        "airport meet and greet India",
        "VIP airport concierge",
        "Delhi airport meet and greet",
        "Mumbai airport assistance",
      ],
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Airports", path: "/airports" },
        ]),
      ],
    }),
  component: AirportsIndexPage,
});

function AirportsIndexPage() {
  const location = useLocation();

  if (location.pathname !== "/airports" && location.pathname !== "/airports/") {
    return <Outlet />;
  }

  return (
    <PageJourneyWrapper category="Coverage" categoryHref="/airports" className="bg-[#FAF9F5]">
      <ServiceableAirportsSection
        headingTag="h1"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-12"
      />
    </PageJourneyWrapper>
  );
}
