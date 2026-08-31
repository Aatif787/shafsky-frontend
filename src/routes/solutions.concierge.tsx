import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, useLocation } from "@tanstack/react-router";
import { ServiceLayout } from "@/components/services/ServiceLayout";

import { ASSETS } from "@/lib/assets";

const meetGreetImg = ASSETS.meetGreet;
const loungeImg = ASSETS.lounge;
const fastTrackImg = ASSETS.fastTrack;
const vipTransport1 = ASSETS.vipTransport;

export const Route = createFileRoute("/solutions/concierge")({
  head: () => ({
    meta: [
      { title: "Airport Services — Shafsky Aviation Services" },
      {
        name: "description",
        content:
          "Everything you need for a smooth airport journey: Meet & Greet, Airport Lounge, Fast Track, and Airport Transfers across global hubs.",
      },
    ],
  }),
  component: AirportConciergePage,
});

function AirportConciergePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchObj: any = location.search || {};
  const activeSub = typeof searchObj === "object" && searchObj.sub ? searchObj.sub : "meet_greet";

  const subServices = [
    {
      id: "meet_greet",
      label: "Meet & Greet Concierge",
      tagline: "Dedicated Airside Guest Relations & Aerobridge Welcome",
      description:
        "Personal Guest Relations Officer escorts you from aerobridge or curbside, handling security lines, priority check-in, and baggage retrieval.",
      image: meetGreetImg,
      badge: "Flagship",
    },
    {
      id: "vip_lounge",
      label: "Airport VIP Lounge",
      tagline: "Premium Relaxation Suites & Gourmet Dining",
      description:
        "Guaranteed access to premium airside departure and transit lounges with hot buffets, high-speed Wi-Fi, shower suites, and private work pods.",
      image: loungeImg,
      badge: "Comfort",
    },
    {
      id: "fast_track",
      label: "Fast Track Immigration",
      tagline: "Expedited Diplomatic & Priority Clearance Lanes",
      description:
        "Bypass standard passenger queues with dedicated priority lane escorts through security checks, passport control, and customs checkpoints.",
      image: fastTrackImg,
      badge: "Priority",
    },
    {
      id: "airport_transfer",
      label: "Airport Chauffeur Transfer",
      tagline: "Luxury Executive Sedan & Maybach Fleet",
      description:
        "Seamless city-to-airport and tarmac executive transfers with sanitized premium vehicles, flight-tracked pickup, and professional chauffeurs.",
      image: vipTransport1,
      badge: "Mobility",
    },
  ];

  const handleSelectSubService = (subId: string) => {
    navigate({ to: "/solutions/concierge", search: { sub: subId } as any });
  };

  const currentSub = subServices.find((s) => s.id === activeSub) || subServices[0];

  return (
    <ServiceLayout
      category="Airport Services"
      categoryHref="/solutions/concierge"
      categoryId="airport_assistance"
      serviceName={currentSub?.label || "Meet & Greet Concierge"}
      tagline={currentSub?.tagline || "Dedicated Airside Guest Relations"}
      description={currentSub?.description || "Personal Guest Relations Officer escorts you seamlessly."}
      heroImage={currentSub?.image || meetGreetImg}
      serviceId={currentSub?.id || "meet_greet"}
      activeSubService={activeSub}
      subServices={subServices}
      onSelectSubService={handleSelectSubService}
      benefits={[
        {
          title: "Zero Queue Delays",
          description: "Fast-track diplomatic lanes bypass terminal lines, saving up to 90 minutes of transit time.",
          icon: undefined,
          highlight: "90 Mins Saved",
        },
        {
          title: "Aerobridge Escort",
          description: "Dedicated Guest Relations Officers welcome you at the aerobridge exit with discrete name placarding.",
          icon: undefined,
          highlight: "Personal Host",
        },
        {
          title: "100% Confidential",
          description: "Strict privacy protocol and diplomatic handling for VIPs, celebrities, and corporate executives.",
          icon: undefined,
          highlight: "VIP Privacy",
        },
        {
          title: "24/7 Staging Desk",
          description: "Real-time telemetry and flight radar tracking ensures host staging even during unscheduled delays.",
          icon: undefined,
          highlight: "Flight Tracking",
        },
      ]}
      timelineSteps={[
        {
          number: "01",
          title: "Flight Manifest & Staging Liaison",
          description: "Submit flight details online or via 24/7 command. Our operations team coordinates directly with airport security.",
          badge: "Step 1: Staging",
        },
        {
          number: "02",
          title: "Aerobridge / Curbside Welcome",
          description: "Upon arrival or terminal drop-off, your officer greets you with a discrete placard.",
          badge: "Step 2: Greeting",
        },
        {
          number: "03",
          title: "Fast-Track Clearance & Porter Handling",
          description: "Bypass main immigration and security queues via priority diplomatic lanes while porters claim check-in bags.",
          badge: "Step 3: Expedite",
        },
        {
          number: "04",
          title: "VIP Lounge or Maybach Handoff",
          description: "Relax in a private lounge suite or proceed directly to your chauffeured tarmac Maybach transfer.",
          badge: "Step 4: Completion",
        },
      ]}
      faqs={[
        {
          q: "How early should I reserve Meet & Greet or Lounge access?",
          a: "We recommend reserving at least 12–24 hours prior to flight departure or arrival to guarantee host staging. Emergency requests within 4 hours can be accommodated via our 24/7 command hotline.",
        },
        {
          q: "Where will my Guest Relations Officer meet me?",
          a: "For flight arrivals, your officer meets you directly at the aerobridge jet-bridge exit holding a discrete name placard. For flight departures, your host greets you at terminal curbside drop-off.",
        },
        {
          q: "What happens if my flight is delayed?",
          a: "Our operational command desk monitors real-time flight telemetry. Your officer's staging time automatically adjusts to your actual flight arrival, ensuring seamless greeting regardless of flight delays.",
        },
        {
          q: "Can I book for my entire family or corporate delegation?",
          a: "Yes. Single or multi-host teams can be assigned to manage large family groups, corporate delegations, or VIP entourages with synchronized baggage handling.",
        },
      ]}
    />
  );
}
