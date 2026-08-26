import { useState } from "react";
import { createFileRoute, useNavigate, useLocation } from "@tanstack/react-router";
import { ServiceLayout } from "@/components/services/ServiceLayout";

import heroJet from "@/assets/hero-jet.png";
import vipTransport1 from "@/assets/vip-transport-1.png";

export const Route = createFileRoute("/charter")({
  head: () => ({
    meta: [
      { title: "Private Jet Charter & VIP Aviation — Shafsky Aviation Services" },
      {
        name: "description",
        content:
          "Experience the pinnacle of private aviation. On-demand private jet charter, FBO terminal suites, and custom flight itineraries.",
      },
    ],
  }),
  component: PrivateCharterPage,
});

function PrivateCharterPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchObj: any = location.search || {};
  const activeSub = typeof searchObj === "object" && searchObj.sub ? searchObj.sub : "jet_charter";

  const subServices = [
    {
      id: "jet_charter",
      label: "Private Jet Charter",
      tagline: "On-Demand Heavy & Light Jet Charters",
      description: "Direct point-to-point private aircraft charters (Global 6000, Gulfstream G650, Falcon 8X, Citation XLS) with bespoke flight schedules.",
      image: heroJet,
      badge: "Flagship Charter",
    },
    {
      id: "fbo_lounge",
      label: "FBO Terminal Suites",
      tagline: "Private General Aviation Terminal Access",
      description: "Bypass main airport concourses completely via private FBO general aviation terminals with direct tarmac Maybach transfers.",
      image: vipTransport1,
      badge: "FBO Privilege",
    },
  ];

  const handleSelectSubService = (subId: string) => {
    navigate({ to: "/charter", search: { sub: subId } as any });
  };

  const currentSub = subServices.find((s) => s.id === activeSub) || subServices[0];

  return (
    <ServiceLayout
      category="Private Aviation"
      categoryHref="/charter"
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
          title: "Complete Schedule Freedom",
          description: "Fly on your exact schedule with zero commercial flight delays or connecting gate layovers.",
          icon: undefined,
          highlight: "On-Demand",
        },
        {
          title: "Direct FBO Terminal Access",
          description: "Board directly from private general aviation terminals in under 15 minutes from curbside arrival.",
          icon: undefined,
          highlight: "15-Min Boarding",
        },
        {
          title: "Michelin Inflight Catering",
          description: "Customized culinary menus prepared by top chefs paired with fine wines and champagne.",
          icon: undefined,
          highlight: "Gourmet Dining",
        },
        {
          title: "100% Confidentiality",
          description: "Strict passenger manifest privacy and non-disclosure protocols for high-net-worth individuals and executives.",
          icon: undefined,
          highlight: "Confidential",
        },
      ]}
      timelineSteps={[
        {
          number: "01",
          title: "Flight Itinerary & Aircraft Selection",
          description: "Specify your origin, destination, passenger count, and preferred aircraft category.",
          badge: "Step 1: Consultation",
        },
        {
          number: "02",
          title: "Flight Dispatch & FBO Confirmation",
          description: "Our flight command dispatches aircraft specs, landing permits, and custom catering menus.",
          badge: "Step 2: Dispatch",
        },
        {
          number: "03",
          title: "FBO Lounge Greeting & Tarmac Maybach",
          description: "Arrive at the private FBO lounge where your captain greets you for direct tarmac boarding.",
          badge: "Step 3: Boarding",
        },
        {
          number: "04",
          title: "Airborne Flight & Destination Handoff",
          description: "Enjoy luxurious inflight dining followed by immediate chauffeured pickup upon landing.",
          badge: "Step 4: Completion",
        },
      ]}
      faqs={[
        {
          q: "How fast can a private jet charter be dispatched?",
          a: "For emergency or short-notice travel, we can dispatch aircraft in as little as 2 to 4 hours, subject to landing permits and crew positioning.",
        },
        {
          q: "What is included in the private charter pricing?",
          a: "All quotes include complete aircraft charter cost, captain and flight crew fees, FBO terminal handling, gourmet inflight catering, and fuel surcharges.",
        },
        {
          q: "Can I bring pets on the private jet flight?",
          a: "Yes. Pets travel in the main cabin alongside you in complete comfort without crates or compartment segregation.",
        },
      ]}
    />
  );
}
