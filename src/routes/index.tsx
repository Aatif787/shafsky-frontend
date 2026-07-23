import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/Hero";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shafsky Aviation — Engineering the Edge of Flight" },
      {
        name: "description",
        content:
          "Shafsky Aviation: private charter, cargo, medical evacuation and Suswagatam airport concierge across 19 Indian hubs and global destinations.",
      },
      { property: "og:title", content: "Shafsky Aviation — Engineering the Edge of Flight" },
      {
        property: "og:description",
        content:
          "Precision engineered. Mission ready. Private aviation and Suswagatam concierge across India.",
      },
      { property: "og:url", content: "https://aero-launch-sequence.lovable.app/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://aero-launch-sequence.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Shafsky Aviation",
          url: "https://aero-launch-sequence.lovable.app/",
          description:
            "Private charter, cargo, medical evacuation, aircraft management and Suswagatam airport concierge.",
          telephone: "+91 9599087959",
          areaServed: "IN",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Shafsky Aviation",
          url: "https://aero-launch-sequence.lovable.app/",
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <Hero visible={true} />;
}
