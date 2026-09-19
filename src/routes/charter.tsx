import { createFileRoute, redirect } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/charter")({
  beforeLoad: () => {
    throw redirect({ to: "/solutions/aviation" });
  },
  head: () =>
    pageHead({
      title: "Private Charter | Shafsky Aviation",
      description: "Private jet and helicopter charter with Shafsky Aviation.",
      path: "/solutions/aviation",
      robots: "noindex, follow",
    }),
});

