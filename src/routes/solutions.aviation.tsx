import { createFileRoute } from "@tanstack/react-router";
import { PrivateJetHero } from "@/components/charter/PrivateJetHero";

export const Route = createFileRoute("/solutions/aviation")({
  head: () => ({
    meta: [
      { title: "SkyElite — Premium Accessible Private Jets" },
      {
        name: "description",
        content:
          "Experience the pinnacle of private aviation with SkyElite. Premium and accessible private jet charters tailored to your schedule.",
      },
    ],
  }),
  component: PrivateAviationPage,
});

function PrivateAviationPage() {
  return <PrivateJetHero />;
}
