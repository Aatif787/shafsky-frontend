import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, useLocation } from "@tanstack/react-router";
import { ServiceLayout } from "@/components/services/ServiceLayout";
import { getServicesByCategory } from "@/data/serviceRegistry";

import hotelImg from "@/assets/hotel.png";
import fastTrackImg from "@/assets/fast-track.png";
import vipTransport1 from "@/assets/vip-transport-1.png";

export const Route = createFileRoute("/solutions/travel")({
  head: () => ({
    meta: [
      { title: "Bespoke Travel & Hospitality Services — Shafsky Aviation" },
      {
        name: "description",
        content:
          "Bespoke hotel check-ins, priority diplomatic visa processing, First & Business class ticketing, and gourmet inflight catering.",
      },
    ],
  }),
  component: TravelServicesPage,
});

function TravelServicesPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchObj: any = location.search || {};
  const activeSub = typeof searchObj === "object" && searchObj.sub ? searchObj.sub : "air_ticketing";

  const travelServices = getServicesByCategory("travel");

  const subServices = travelServices.map((s) => ({
    id: s.id,
    label: s.name,
    tagline: s.tagline,
    description: s.shortDescription,
    image: s.id === "hotel" ? hotelImg : s.id === "visa" ? fastTrackImg : vipTransport1,
    badge: s.id === "hotel" ? "Hospitality" : s.id === "visa" ? "Documentation" : s.id === "air_ticketing" ? "Commercial" : "Catering",
  }));

  const handleSelectSubService = (subId: string) => {
    navigate({ to: "/solutions/travel", search: { sub: subId } as any });
  };

  const currentSub = subServices.find((s) => s.id === activeSub) || subServices[0];

  return (
    <ServiceLayout
      category="Travel Services"
      categoryHref="/solutions/travel"
      categoryId="air_ticketing"
      serviceName={currentSub.label}
      tagline={currentSub.tagline}
      description={currentSub.description}
      heroImage={currentSub.image}
      serviceId={currentSub.id}
      activeSubService={activeSub}
      subServices={subServices}
      onSelectSubService={handleSelectSubService}
      benefits={[
        {
          title: "Seamless Handoff",
          description: "From terminal exit to hotel check-in, your transition is managed by one dedicated team.",
          icon: undefined,
          highlight: "Zero Friction",
        },
        {
          title: "Diplomatic Processing",
          description: "Direct liaison with embassy and airport visa clearance desks for rapid document validation.",
          icon: undefined,
          highlight: "Fast-Track Visa",
        },
        {
          title: "First Class Allocations",
          description: "Access to private airline seat inventories and last-minute premium commercial seat holds.",
          icon: undefined,
          highlight: "Preferred Seating",
        },
        {
          title: "24/7 Desk Liaison",
          description: "Round-the-clock flight desk support for itinerary changes, re-bookings, and hotel extensions.",
          icon: undefined,
          highlight: "24/7 Staged",
        },
      ]}
      timelineSteps={[
        {
          number: "01",
          title: "Itinerary & Documentation Review",
          description: "Submit hotel preferences, visa requirements, or flight flight specs to our travel desk.",
          badge: "Step 1: Planning",
        },
        {
          number: "02",
          title: "Partner Coordination & Seat Hold",
          description: "Our team coordinates check-in holds with 5-star hotel partners and blocks premium airline seats.",
          badge: "Step 2: Reservation",
        },
        {
          number: "03",
          title: "Airside & Terminal Handoff",
          description: "Your host meets you at arrival and escorts you directly to your luxury hotel transfer.",
          badge: "Step 3: Transfer",
        },
        {
          number: "04",
          title: "Suite Arrival & VIP Welcome",
          description: "Direct check-in completion at hotel reception with suite keys handed over immediately.",
          badge: "Step 4: Completion",
        },
      ]}
      faqs={[
        {
          q: "Which hotel partners are covered by the Hotel Booking service?",
          a: "We maintain direct partnerships with premier hotel chains including Taj Hotels, Oberoi, Four Seasons, Marriott, and boutique heritage properties across 20+ cities.",
        },
        {
          q: "How does Visa Assist work upon landing?",
          a: "For eligible destinations offering visa-on-arrival or e-visas, our host meets you at the aerobridge and guides you through dedicated diplomatic visa desks for expedited processing.",
        },
        {
          q: "Can I combine commercial flight booking with private jet charter?",
          a: "Yes. Our hybrid booking service allows seamless connections between commercial First Class long-haul flights and domestic private jet charters.",
        },
      ]}
    />
  );
}
