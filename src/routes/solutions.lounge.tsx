import { createFileRoute, redirect } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/solutions/lounge")({
  beforeLoad: () => {
    throw redirect({ to: "/lounge" });
  },
  head: () =>
    pageHead({
      title: "Lounge | Shafsky Aviation Services",
      description: "Dedicated airport lounge enquiry and reservations.",
      path: "/lounge",
      robots: "noindex, follow",
    }),
});
