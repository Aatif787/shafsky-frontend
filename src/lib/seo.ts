import { BUSINESS, CONTACT } from "@/lib/constants";
import { SOCIAL_LINKS } from "@/lib/site-content";
import type { AirportRegistryEntry } from "@/data/airportRegistry";
import { ICICI_REVIEW_MODE } from "@/lib/config/reviewMode";

export const SEO = {
  siteName: BUSINESS.NAME,
  defaultTitle: ICICI_REVIEW_MODE
    ? "Airport Meet & Greet & VIP Lounge Services in India | Shafsky Aviation"
    : "Airport Meet & Greet, VIP Concierge & Private Charter in India | Shafsky Aviation",
  defaultDescription: ICICI_REVIEW_MODE
    ? "Book airport Meet & Greet, VIP airside escort, dedicated buggy, fast-track clearance, and executive lounge access with Shafsky Aviation Services across 20+ Indian airports."
    : "Book airport Meet & Greet, VIP airside escort, lounge access, luxury transfers, and private charter with Shafsky Aviation Services across 20+ Indian airports.",
  locale: "en_IN",
  ogImagePath: "/og-image.jpg",
  language: "en-IN",
} as const;

export const HQ_ADDRESS = {
  streetAddress: "8/5, Ground Floor, West Mehram Nagar Gate No.1, Opp. IGI Airport Terminal 1",
  addressLocality: "New Delhi",
  addressRegion: "DL",
  postalCode: "110010",
  addressCountry: "IN",
} as const;

export const HQ_GEO = { latitude: 28.5562, longitude: 77.1 } as const;

export function joinOrigin(origin: string, path = "/"): string {
  if (!path) return origin;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalized}`;
}

export function absoluteUrl(path = "/"): string {
  return joinOrigin(BUSINESS.BASE_URL, path);
}

export function inAbsoluteUrl(path = "/"): string {
  return joinOrigin(BUSINESS.IN_URL, path);
}

export function jsonLdScript(data: unknown) {
  return {
    type: "application/ld+json" as const,
    children: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}

type PageHeadOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  robots?: string;
  keywords?: string[];
  jsonLd?: unknown[];
};

export function pageHead({
  title,
  description,
  path,
  image,
  type = "website",
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  keywords,
  jsonLd = [],
}: PageHeadOptions) {
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(image || SEO.ogImagePath);
  const fullTitle = title.includes("Shafsky") ? title : `${title} | ${SEO.siteName}`;

  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      { name: "robots", content: robots },
      { name: "googlebot", content: robots },
      ...(keywords?.length ? [{ name: "keywords", content: keywords.join(", ") }] : []),
      { property: "og:site_name", content: SEO.siteName },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: type },
      { property: "og:image", content: ogImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: fullTitle },
      { property: "og:locale", content: SEO.locale },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "alternate", hrefLang: "en-IN", href: inAbsoluteUrl(path) },
      { rel: "alternate", hrefLang: "x-default", href: url },
    ],
    scripts: jsonLd.map(jsonLdScript),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BUSINESS.BASE_URL}/#organization`,
    name: BUSINESS.NAME,
    legalName: BUSINESS.NAME,
    url: BUSINESS.BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logo.png"),
    },
    image: absoluteUrl(SEO.ogImagePath),
    description: BUSINESS.DESCRIPTION,
    telephone: CONTACT.PHONE,
    email: CONTACT.EMAIL,
    areaServed: { "@type": "Country", name: "India" },
    address: { "@type": "PostalAddress", ...HQ_ADDRESS },
    sameAs: [...SOCIAL_LINKS.map((s) => s.href).filter(Boolean), BUSINESS.IN_URL],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: CONTACT.PHONE,
        contactType: "customer service",
        email: CONTACT.EMAIL,
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
        hoursAvailable: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "00:00",
          closes: "23:59",
        },
      },
    ],
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "TravelAgency"],
    "@id": `${BUSINESS.BASE_URL}/#localbusiness`,
    name: BUSINESS.NAME,
    url: BUSINESS.BASE_URL,
    telephone: CONTACT.PHONE,
    email: CONTACT.EMAIL,
    image: absoluteUrl(SEO.ogImagePath),
    logo: absoluteUrl("/logo.png"),
    priceRange: "₹₹₹",
    address: { "@type": "PostalAddress", ...HQ_ADDRESS },
    geo: { "@type": "GeoCoordinates", ...HQ_GEO },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
    sameAs: [...SOCIAL_LINKS.map((s) => s.href).filter(Boolean), BUSINESS.IN_URL],
    parentOrganization: { "@id": `${BUSINESS.BASE_URL}/#organization` },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BUSINESS.BASE_URL}/#website`,
    name: BUSINESS.NAME,
    url: BUSINESS.BASE_URL,
    inLanguage: "en-IN",
    publisher: { "@id": `${BUSINESS.BASE_URL}/#organization` },
    sameAs: [BUSINESS.IN_URL],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BUSINESS.BASE_URL}/airports?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

export function serviceCatalogJsonLd() {
  const fullList = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Airport Meet & Greet",
      url: absoluteUrl("/solutions/concierge"),
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Private Charter",
      url: absoluteUrl("/solutions/aviation"),
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Airport Transfers",
      url: absoluteUrl("/solutions/cargo"),
    },
    {
      "@type": "ListItem",
      position: 4,
      name: "Luxury Hotels",
      url: absoluteUrl("/solutions/travel"),
    },
    {
      "@type": "ListItem",
      position: 5,
      name: "Special Services",
      url: absoluteUrl("/solutions/medical"),
    },
  ];

  const reviewList = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Airport Meet & Greet & Lounge Services",
      url: absoluteUrl("/solutions/concierge"),
    },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Shafsky Aviation Services",
    itemListElement: ICICI_REVIEW_MODE ? reviewList : fullList,
  };
}

export function airportPageJsonLd(entry: AirportRegistryEntry) {
  const pageUrl = absoluteUrl(`/airports/${entry.code}`);
  const image = absoluteUrl(entry.coverImage || SEO.ogImagePath);

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: `${entry.city} Airport Meet & Greet (${entry.code})`,
    serviceType: "Airport Meet and Greet",
    description: entry.seo.description,
    url: pageUrl,
    image,
    provider: { "@id": `${BUSINESS.BASE_URL}/#organization` },
    areaServed: {
      "@type": "Airport",
      name: entry.name,
      iataCode: entry.code,
      icaoCode: entry.icao,
      address: {
        "@type": "PostalAddress",
        addressLocality: entry.city,
        addressCountry: entry.countryCode || "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: entry.coordinates.lat,
        longitude: entry.coordinates.lng,
      },
    },
    offers: {
      "@type": "Offer",
      url: absoluteUrl("/book"),
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };
}
