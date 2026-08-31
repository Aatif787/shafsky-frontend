import { createFileRoute } from "@tanstack/react-router";
import { ServiceLayout } from "@/components/services/ServiceLayout";
import { EnterpriseFAQ } from "@/components/faq/EnterpriseFAQ";
import { BUSINESS } from "@/lib/constants";
import { FAQ_ITEMS } from "@/lib/site-content";

import { ASSETS } from "@/lib/assets";

const meetGreetImg = ASSETS.meetGreet;

export const Route = createFileRoute("/services/guide")({
  head: () => ({
    meta: [
      { title: "The Complete Guide to Airport Concierge Services — Shafsky Aviation Services" },
      {
        name: "description",
        content:
          "Learn how airport concierge services work: Meet & Greet, fast-track immigration, porter assistance, lounge access and chauffeur transfers — what's included and when to book.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "The Complete Guide to Airport Concierge Services — Shafsky Aviation Services" },
      { property: "og:description", content: "Meet & Greet, fast-track immigration, lounge access and chauffeur transfers — what's included and when to book." },
      { property: "og:url", content: `${BUSINESS.BASE_URL}/services/guide` },
      { property: "og:type", content: "article" },
      { property: "og:image", content: `${BUSINESS.BASE_URL}/og-image.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "The Complete Guide to Airport Concierge Services" },
      { name: "twitter:description", content: "Meet & Greet, fast-track immigration, lounge access and chauffeur transfers." },
      { name: "twitter:image", content: `${BUSINESS.BASE_URL}/og-image.jpg` },
    ],
    links: [{ rel: "canonical", href: `${BUSINESS.BASE_URL}/services/guide` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_ITEMS.map(([q, a]) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }),
      },
    ],
  }),
  component: ServiceGuidePage,
});

function ServiceGuidePage() {
  return (
    <ServiceLayout
      category="About & Guide"
      categoryHref="/services/guide"
      serviceName="The Shafsky Service Standard"
      tagline="Engineering the Pinnacle of Airside Hospitality"
      description="A definitive architectural guide to how Shafsky Aviation Services orchestrates Meet & Greet escorts, diplomatic fast-track clearance, VIP lounge sanctuaries, and chauffeured tarmac transfers."
      heroImage={meetGreetImg}
      serviceId="meet_greet"
      showFAQ={false}
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
    >
      {/* ENTERPRISE FAQ KNOWLEDGE CENTER */}
      <EnterpriseFAQ />
    </ServiceLayout>
  );
}
