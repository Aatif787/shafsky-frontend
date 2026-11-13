import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  SPECIAL_SERVICES_OPTIONS,
  SpecialServiceHeroStage,
  resolveSpecialServiceFromSearch,
} from "../SpecialServicesParts";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;");
}

describe("SpecialServiceHeroStage - proper headings for special services", () => {
  const cases = [
    { sub: "spa-wellness", id: "Spa & Wellness" },
    { sub: "pso", id: "PSO (Personal Security Officer / VIP Shopping)" },
    { sub: "air_ambulance", id: "Air Ambulance (Airborne ICU Jet)" },
    { sub: "train_ambulance", id: "Train Ambulance" },
    { sub: "hum", id: "Human Remains (HUM)" },
    { sub: "cargo_avi_pet", id: "Cargo & AVI Pet Freight" },
    { sub: "infant-care", id: "Infant Care Services" },
  ] as const;

  it.each(cases)(
    "renders proper h1 heading and tagline at top for ?sub=$sub ($id)",
    ({ sub, id }) => {
      const resolvedId = resolveSpecialServiceFromSearch({ sub });
      expect(resolvedId).toBe(id);

      const option = SPECIAL_SERVICES_OPTIONS.find((opt) => opt.id === id)!;
      expect(option).toBeDefined();

      const html = renderToString(
        <SpecialServiceHeroStage activeOption={option} onBack={() => {}} />
      );

      expect(html).toContain("<h1");
      expect(html).toContain(escapeHtml(option.label));
      if (option.tagline) {
        expect(html).toContain(escapeHtml(option.tagline));
      }
    }
  );

  it("does not alter Air Ticketing or On-board Meal hero headings", () => {
    for (const id of [
      "Air Ticketing Services",
      "On-board Meal Arrangements for Group Meet & Greet Bookings",
    ] as const) {
      const option = SPECIAL_SERVICES_OPTIONS.find((opt) => opt.id === id)!;
      const html = renderToString(
        <SpecialServiceHeroStage activeOption={option} onBack={() => {}} />
      );
      expect(html).not.toContain("<h1");
    }
  });
});

