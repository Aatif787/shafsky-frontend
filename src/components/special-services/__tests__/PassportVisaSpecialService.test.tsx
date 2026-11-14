import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  SPECIAL_SERVICES_OPTIONS,
  SpecialServiceHeroStage,
  resolveSpecialServiceFromSearch,
} from "../SpecialServicesParts";

describe("Passport and Visa - Special Services", () => {
  it("resolves ?sub=visa and ?sub=passport to Visa Assistance Services", () => {
    expect(resolveSpecialServiceFromSearch({ sub: "visa" })).toBe("Visa Assistance Services");
    expect(resolveSpecialServiceFromSearch({ sub: "passport" })).toBe("Visa Assistance Services");
    expect(resolveSpecialServiceFromSearch({ sub: "passport-visa" })).toBe("Visa Assistance Services");
  });

  it("renders proper heading at the top of Passport and Visa hero stage", () => {
    const visaOption = SPECIAL_SERVICES_OPTIONS.find((opt) => opt.id === "Visa Assistance Services")!;
    expect(visaOption).toBeDefined();

    const html = renderToString(
      <SpecialServiceHeroStage activeOption={visaOption} onBack={() => {}} />
    );

    expect(html).toContain("Passport and Visa");
    expect(html).toContain(
      "Expedited visa processing, VIP doorstep biometrics, document vetting, and priority embassy liaison for international travel."
    );
  });

  it("renders proper heading at the top of Travel and Tour hero stage", () => {
    const tourOption = SPECIAL_SERVICES_OPTIONS.find((opt) => opt.id === "Travel & Tour")!;
    expect(tourOption).toBeDefined();

    const html = renderToString(
      <SpecialServiceHeroStage activeOption={tourOption} onBack={() => {}} />
    );

    expect(html).toContain("Travel &amp; Tour");
  });
});

