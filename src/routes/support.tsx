import { createFileRoute } from "@tanstack/react-router";
import { SupportPage } from "@/components/views/SupportPageView";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/support")({
  head: () =>
    pageHead({
      title: "Support & Contact Directory | Shafsky Aviation Services",
      description:
        "Connect directly with the right Shafsky Aviation team for reservations, travel assistance, guest relations, escalations, and finance enquiries.",
      path: "/support",
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Support", path: "/support" },
        ]),
      ],
    }),
  component: SupportPage,
});
