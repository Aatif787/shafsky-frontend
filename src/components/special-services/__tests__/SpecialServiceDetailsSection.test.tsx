import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  SPECIAL_SERVICES_OPTIONS,
  SpecialServiceDetailsSection,
  resolveSpecialServiceFromSearch,
} from "../SpecialServicesParts";

describe("SpecialServiceDetailsSection - Human Remains (HUM)", () => {
  it("resolves ?sub=hum to Human Remains (HUM) with no inclusions", () => {
    const resolvedId = resolveSpecialServiceFromSearch({ sub: "hum" });
    expect(resolvedId).toBe("Human Remains (HUM)");

    const humOption = SPECIAL_SERVICES_OPTIONS.find((opt) => opt.id === resolvedId);
    expect(humOption).toBeDefined();
    expect(humOption!.inclusions).toEqual([]);
  });

  it("does not render SERVICE DETAILS & INCLUSIONS on Human Remains (HUM)", () => {
    const humOption = SPECIAL_SERVICES_OPTIONS.find(
      (opt) => opt.id === "Human Remains (HUM)"
    )!;

    const html = renderToString(<SpecialServiceDetailsSection activeOption={humOption} />);
    expect(html).toBe("");
    expect(html).not.toContain("SERVICE DETAILS &amp; INCLUSIONS");
    expect(html).not.toContain("SERVICE DETAILS & INCLUSIONS");

    const guardedHtml = renderToString(
      <SpecialServiceDetailsSection
        activeOption={{
          ...humOption,
          inclusions: ["Dummy inclusion"],
        }}
      />
    );
    expect(guardedHtml).toBe("");

    const dignifiedHtml = renderToString(
      <SpecialServiceDetailsSection
        activeOption={{
          ...humOption,
          id: "Dignified Human Remains (HUM)",
          inclusions: ["Dummy inclusion"],
        }}
      />
    );
    expect(dignifiedHtml).toBe("");
  });

  it("does not render SERVICE DETAILS & INCLUSIONS on Spa & Wellness", () => {
    const spaOption = SPECIAL_SERVICES_OPTIONS.find((opt) => opt.id === "Spa & Wellness")!;
    expect(spaOption.inclusions).toEqual([]);
    const html = renderToString(<SpecialServiceDetailsSection activeOption={spaOption} />);
    expect(html).toBe("");
    expect(html).not.toContain("SERVICE DETAILS &amp; INCLUSIONS");
  });
});

