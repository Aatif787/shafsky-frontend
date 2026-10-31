import { createFileRoute } from "@tanstack/react-router";
import { CargoPage } from "@/components/cargo/CargoPage";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/solutions/cargo")({
  head: () =>
    pageHead({
      title: "Cargo | Shafsky Aviation",
      description: "Dedicated air cargo logistics, freight charter, and global shipment assistance with Shafsky Aviation.",
      path: "/solutions/cargo",
      keywords: ["air cargo", "aviation cargo enquiry", "cargo logistics India", "freight charter"],
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Cargo", path: "/solutions/cargo" },
        ]),
      ],
    }),
  component: CargoPage,
});
