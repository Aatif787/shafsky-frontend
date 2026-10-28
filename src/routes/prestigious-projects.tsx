import { createFileRoute } from "@tanstack/react-router";
import { PrestigiousProjectsPage } from "@/components/views/PrestigiousProjectsView";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/prestigious-projects")({
  head: () =>
    pageHead({
      title: "Prestigious Projects Handled | Shafsky Aviation Services",
      description:
        "Our portfolio reflects our involvement in major sporting events, institutional engagements, national conferences, entertainment movements and distinguished guest arrangements.",
      path: "/prestigious-projects",
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Prestigious Projects Handled", path: "/prestigious-projects" },
        ]),
      ],
    }),
  component: PrestigiousProjectsPage,
});
