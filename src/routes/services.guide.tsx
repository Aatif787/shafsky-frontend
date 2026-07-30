import { createFileRoute } from "@tanstack/react-router";
import { ServiceLayout } from "@/components/services/ServiceLayout";
import { EnterpriseFAQ } from "@/components/faq/EnterpriseFAQ";
import { PageJourneyWrapper } from "@/components/site/PageJourneyWrapper";

import meetGreetImg from "@/assets/meet-greet.png";

export const Route = createFileRoute("/services/guide")({
  head: () => ({
    meta: [
      { title: "The Complete Guide to Airport Concierge Services — Shafsky Aviation" },
      {
        name: "description",
        content:
          "Learn how airport concierge services work: Meet & Greet, fast-track immigration, porter assistance, lounge access and chauffeur transfers — what's included and when to book.",
      },
    ],
  }),
  component: ServiceGuidePage,
});

function ServiceGuidePage() {
  return (
    <PageJourneyWrapper
      category="About & Guide"
      categoryHref="/services/guide"
      current="The Shafsky Service Standard"
    >
      <ServiceLayout
        category="About & Guide"
        categoryHref="/services/guide"
        serviceName="The Shafsky Service Standard"
        tagline="Engineering the Pinnacle of Airside Hospitality"
        description="A definitive architectural guide to how Shafsky Aviation orchestrates Meet & Greet escorts, diplomatic fast-track clearance, VIP lounge sanctuaries, and chauffeured tarmac transfers."
        heroImage={meetGreetImg}
        serviceId="meet_greet"
        benefits={[
          {
            title: "Aerobridge Placard Welcome",
            description: "A uniformed officer meets you immediately upon exiting the aircraft door holding a discrete name placard.",
            icon: undefined,
            highlight: "Jet-Bridge Escort",
          },
          {
            title: "Diplomatic Fast-Track",
            description: "Bypass main immigration and security lines via priority diplomatic desks, saving up to 90 minutes.",
            icon: undefined,
            highlight: "90 Mins Saved",
          },
          {
            title: "Insured Baggage Porterage",
            description: "Dedicated baggage porters claim arrival luggage from the carousel and load it into your waiting limousine.",
            icon: undefined,
            highlight: "Luggage Care",
          },
          {
            title: "Tarmac Maybach Limousine",
            description: "Private executive sedan transfers across the tarmac directly between the VIP lounge and your aircraft steps.",
            icon: undefined,
            highlight: "Tarmac Transfer",
          },
        ]}
        timelineSteps={[
          {
            number: "01",
            title: "24/7 Telemetry & Flight Tracking",
            description: "Our flight radar system tracks your aircraft to ensure officer staging even during unscheduled flight delays.",
            badge: "Step 1: Telemetry",
          },
          {
            number: "02",
            title: "Airside Host Greeting & Escort",
            description: "Your Guest Relations Officer meets you at the aerobridge jet-bridge exit or terminal drop-off point.",
            badge: "Step 2: Greeting",
          },
          {
            number: "03",
            title: "Priority Queue Bypass & Porterage",
            description: "Escort through priority immigration desks while porters manage all check-in or arrival luggage.",
            badge: "Step 3: Expedite",
          },
          {
            number: "04",
            title: "VIP Lounge or Maybach Departure",
            description: "Relax in a private lounge suite or proceed directly to your chauffeured luxury ground transfer.",
            badge: "Step 4: Completion",
          },
        ]}
      />

      {/* ENTERPRISE FAQ KNOWLEDGE CENTER */}
      <EnterpriseFAQ />
    </PageJourneyWrapper>
  );
}
