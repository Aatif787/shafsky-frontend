import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/Hero";
import { BUSINESS, CONTACT } from "@/lib/constants";
import { SOCIAL_LINKS } from "@/lib/site-content";

const BASE = BUSINESS.BASE_URL;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shafsky Aviation Services — Engineering the Edge of Flight" },
      {
        name: "description",
        content:
          "Shafsky Aviation Services: private charter, cargo, medical evacuation and Suswagatam airport concierge across 19 Indian hubs and global destinations.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Shafsky Aviation Services — Engineering the Edge of Flight" },
      {
        property: "og:description",
        content:
          "Precision engineered. Mission ready. Private aviation and Suswagatam concierge across India.",
      },
      { property: "og:url", content: BASE },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${BASE}/og-image.jpg` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Shafsky Aviation Services — Engineering the Edge of Flight" },
      {
        name: "twitter:description",
        content: "Private charter, cargo, medical and Suswagatam concierge across India and beyond.",
      },
      { name: "twitter:image", content: `${BASE}/og-image.jpg` },
    ],
    links: [{ rel: "canonical", href: BASE }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: BUSINESS.NAME,
          url: BASE,
          logo: `${BASE}/logo.png`,
          description: BUSINESS.DESCRIPTION,
          telephone: CONTACT.PHONE,
          email: CONTACT.EMAIL,
          areaServed: "IN",
          address: {
            "@type": "PostalAddress",
            streetAddress: "8/5, Ground Floor, West Mehram Nagar Gate No.1, Opp. IGI Airport Terminal 1",
            addressLocality: "New Delhi",
            addressRegion: "DL",
            postalCode: "110010",
            addressCountry: "IN",
          },
          sameAs: SOCIAL_LINKS.map((s) => s.href),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: BUSINESS.NAME,
          url: BASE,
          potentialAction: {
            "@type": "SearchAction",
            target: `${BASE}/airports?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: BUSINESS.NAME,
          url: BASE,
          telephone: CONTACT.PHONE,
          email: CONTACT.EMAIL,
          image: `${BASE}/logo.png`,
          priceRange: "₹₹₹",
          address: {
            "@type": "PostalAddress",
            streetAddress: "8/5, Ground Floor, West Mehram Nagar Gate No.1, Opp. IGI Airport Terminal 1",
            addressLocality: "New Delhi",
            addressRegion: "DL",
            postalCode: "110010",
            addressCountry: "IN",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 28.5562,
            longitude: 77.1000,
          },
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            opens: "00:00",
            closes: "23:59",
          },
          sameAs: SOCIAL_LINKS.map((s) => s.href),
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <Hero visible={true} />;
}
