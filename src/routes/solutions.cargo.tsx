import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, useLocation } from "@tanstack/react-router";
import { ServiceLayout } from "@/components/services/ServiceLayout";

import cargoAssistImg from "@/assets/cargo-assist.png";
import vipTransport1 from "@/assets/vip-transport-1.png";
import { BUSINESS } from "@/lib/constants";

export const Route = createFileRoute("/solutions/cargo")({
  head: () => ({
    meta: [
      { title: "Cargo & Live Animal AVI Logistics — Shafsky Aviation Services" },
      {
        name: "description",
        content:
          "White-glove air cargo customs clearance, high-value freight escort, and climate-controlled live pet AVI transit across India.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Cargo & Live Animal AVI Logistics — Shafsky Aviation Services" },
      { property: "og:description", content: "White-glove air cargo customs clearance, high-value freight escort, and live pet AVI transit." },
      { property: "og:url", content: `${BUSINESS.BASE_URL}/solutions/cargo` },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${BUSINESS.BASE_URL}/og-image.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Cargo & Live Animal AVI Logistics — Shafsky Aviation Services" },
      { name: "twitter:description", content: "White-glove air cargo customs clearance, high-value freight escort, and live pet AVI transit." },
      { name: "twitter:image", content: `${BUSINESS.BASE_URL}/og-image.jpg` },
    ],
    links: [{ rel: "canonical", href: `${BUSINESS.BASE_URL}/solutions/cargo` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Air Cargo & Live Animal Logistics",
          provider: { "@type": "Organization", name: BUSINESS.NAME },
          url: `${BUSINESS.BASE_URL}/solutions/cargo`,
          description: "White-glove air cargo customs clearance, high-value freight escort, and climate-controlled live pet AVI transit.",
          areaServed: "IN",
        }),
      },
    ],
  }),
  component: CargoLogisticsPage,
});

function CargoLogisticsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchObj: any = location.search || {};
  const activeSub = typeof searchObj === "object" && searchObj.sub ? searchObj.sub : "cargo";

  const subServices = [
    {
      id: "cargo",
      label: "Air Cargo Clearance",
      tagline: "White-Glove Freight & Customs Bonding",
      description: "Priority airside freight handling, customs liaison, customs bond processing, and high-value cargo escort from tarmac to warehouse.",
      image: cargoAssistImg,
      badge: "Freight",
    },
    {
      id: "avi",
      label: "Live Pet AVI Transport",
      tagline: "Climate-Controlled Live Animal Air Transit",
      description: "Specialized humane live animal transit in pressurized cargo compartments with veterinary clearance and airside tarmac escort.",
      image: vipTransport1,
      badge: "Live Animal",
    },
  ];

  const handleSelectSubService = (subId: string) => {
    navigate({ to: "/solutions/cargo", search: { sub: subId } as any });
  };

  const currentSub = subServices.find((s) => s.id === activeSub) || subServices[0];

  return (
    <ServiceLayout
      category="Cargo & Logistics"
      categoryHref="/solutions/cargo"
      categoryId="cargo_logistics"
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
          title: "Customs Bond Processing",
          description: "Rapid diplomatic customs desk liaison ensuring instant freight release and zero warehouse demurrage fees.",
          icon: undefined,
          highlight: "Rapid Customs",
        },
        {
          title: "High-Value Escort",
          description: "Armed or insured security escort for precious metals, fine art, diplomatic pouches, and luxury goods.",
          icon: undefined,
          highlight: "White-Glove",
        },
        {
          title: "Veterinary AVI Staging",
          description: "Airside pet staging with veterinary health checks, climate-controlled transport, and owner reunion.",
          icon: undefined,
          highlight: "Pet Care",
        },
        {
          title: "24/7 Cargo Tracking",
          description: "Real-time telemetry tracking from air cargo pallet loading to destination warehouse delivery.",
          icon: undefined,
          highlight: "Telemetry",
        },
      ]}
      timelineSteps={[
        {
          number: "01",
          title: "Cargo Manifest & Air Waybill Filing",
          description: "Submit cargo dimensions, commodity specs, and Air Waybill details to our logistics command desk.",
          badge: "Step 1: Manifest",
        },
        {
          number: "02",
          title: "Airside Flight Landing & Offloading",
          description: "Our cargo officers meet the aircraft on the tarmac for immediate ULD container offloading.",
          badge: "Step 2: Offload",
        },
        {
          number: "03",
          title: "Customs Inspection & Bond Release",
          description: "Priority customs desk clearance and quarantine inspection for instant release.",
          badge: "Step 3: Clearance",
        },
        {
          number: "04",
          title: "Destination Trucking or Pet Handoff",
          description: "Direct handover of cargo to your secure transport vehicle or pet reunion with the owner.",
          badge: "Step 4: Completion",
        },
      ]}
      faqs={[
        {
          q: "What types of cargo can be handled under white-glove clearance?",
          a: "We specialize in high-value commercial freight, diplomatic pouches, luxury retail inventory, artwork, pharmaceutical cold-chain shipments, and live animal AVI.",
        },
        {
          q: "How are live pets (AVI) cared for during airport transit?",
          a: "Live pets travel in climate-controlled, pressurized holds. Our cargo officer takes immediate airside delivery, provides fresh water, conducts a veterinary check, and facilitates customs inspection.",
        },
        {
          q: "Do you handle customs documentation for international shipments?",
          a: "Yes. Our team acts as customs liaison to prepare customs bonds, bill of entry documentation, and quarantine certificates.",
        },
      ]}
    />
  );
}
