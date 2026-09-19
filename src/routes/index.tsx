import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/Hero";
import { HOMEPAGE_FAQS } from "@/lib/site-content";
import { ICICI_REVIEW_MODE } from "@/lib/config/reviewMode";
import {
  SEO,
  pageHead,
  organizationJsonLd,
  websiteJsonLd,
  localBusinessJsonLd,
  faqJsonLd,
  serviceCatalogJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: SEO.defaultTitle,
      description: SEO.defaultDescription,
      path: "/",
      jsonLd: [
        organizationJsonLd(),
        websiteJsonLd(),
        localBusinessJsonLd(),
        serviceCatalogJsonLd(),
        faqJsonLd(
          ICICI_REVIEW_MODE
            ? HOMEPAGE_FAQS.filter((f) => !f.q.toLowerCase().includes("charter") && !f.a.toLowerCase().includes("charter"))
            : [...HOMEPAGE_FAQS]
        ),
        breadcrumbJsonLd([{ name: "Home", path: "/" }]),
      ],
    }),
  component: Index,
});

function Index() {
  return <Hero visible={true} />;
}
