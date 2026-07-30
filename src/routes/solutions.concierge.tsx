import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, useLocation } from "@tanstack/react-router";
import { ServiceLayout } from "@/components/services/ServiceLayout";

import meetGreetImg from "@/assets/meet-greet.png";
import loungeImg from "@/assets/lounge.png";
import fastTrackImg from "@/assets/fast-track.png";
import vipTransport1 from "@/assets/vip-transport-1.png";

export const Route = createFileRoute("/solutions/concierge")({
  head: () => ({
    meta: [
      { title: "Airport Services — Shafsky Aviation" },
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
      label: "Meet & Greet",
      tagline: "Aerobridge Placard Greeting & Escort",
      description: "A uniformed Guest Relations Officer meets you immediately upon aircraft exit or terminal drop-off with discrete placard identification, managing luggage and queues.",
      image: meetGreetImg,
      badge: "Flagship",
    },
    {
      id: "lounge",
      label: "Airport Lounge",
      tagline: "VIP Sanctuary & Quiet Workspaces",
      description: "Enjoy private lounge suites, hot buffet dining, high-speed Wi-Fi, and luxury shower facilities away from commercial terminal crowds.",
      image: loungeImg,
      badge: "Sanctuary",
    },
    {
      id: "fast_track",
      label: "Fast Track",
      tagline: "Diplomatic Queue Clearance",
      description: "Bypass main security and immigration lines via diplomatic priority desks, saving up to 90 minutes during peak transit hours.",
      image: fastTrackImg,
      badge: "Priority",
    },
    {
      id: "transport",
      label: "Airport Transfer",
      tagline: "Chauffeured Airside & City Limousines",
      description: "Private executive sedan transfers across the tarmac directly between the airport sanctuary and your hotel.",
      image: vipTransport1,
      badge: "Executive Fleet",
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
          description: "Upon arrival or terminal drop-off, your officer greets you with a discrete personalized placard.",
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
