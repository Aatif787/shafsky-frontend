import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AviationSpecificationsSection } from "../AviationSolutionsParts";

describe("AviationSpecificationsSection", () => {
  const html = renderToStaticMarkup(<AviationSpecificationsSection />);

  it("uses a centered max-w-4xl responsive container matching the section above it", () => {
    expect(html).toContain("px-4 sm:px-6 lg:px-8");
    expect(html).toContain("mx-auto w-full max-w-4xl");
  });

  it("renders the intro paragraph with justified and responsive typography", () => {
    expect(html).toContain("text-justify");
    expect(html).toContain("hyphens-auto");
    expect(html).toContain("w-full");
    expect(html).toContain(
      "Air Charter Service provide flexible, secure, and premium travel solutions tailored to individual and business needs."
    );
  });

  it("renders all 10 charter services in a responsive grid", () => {
    expect(html).toContain("grid grid-cols-1 sm:grid-cols-2");

    const expectedServices = [
      "Domestic and International Charter",
      "Corporate Charter",
      "Private Charters",
      "Helicopter Charters",
      "Tourism Charter",
      "Pilgrim Charters",
      "Celebrities Charters",
      "Adventure Sport Charters",
      "Wedding Charter",
      "Air Ambulance charter",
    ];

    for (const service of expectedServices) {
      expect(html).toContain(service);
    }
  });
});

