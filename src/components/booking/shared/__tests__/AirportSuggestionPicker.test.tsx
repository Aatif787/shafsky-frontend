import { describe, it, expect } from "vitest";
import {
  lookupAirport,
  DOMESTIC_AIRPORTS,
  INTERNATIONAL_AIRPORTS,
} from "../AirportSuggestionPicker";

describe("AirportSuggestionPicker Catalog and Lookup Suite", () => {
  describe("lookupAirport helper", () => {
    it("resolves domestic airport code BOM to Mumbai", () => {
      const airport = lookupAirport("BOM");
      expect(airport).not.toBeNull();
      expect(airport?.city).toBe("Mumbai");
      expect(airport?.country).toBe("India");
    });

    it("resolves domestic airport code BLR to Bengaluru", () => {
      const airport = lookupAirport("BLR");
      expect(airport).not.toBeNull();
      expect(airport?.city).toBe("Bengaluru");
      expect(airport?.country).toBe("India");
    });

    it("resolves international airport code DXB to Dubai", () => {
      const airport = lookupAirport("DXB");
      expect(airport).not.toBeNull();
      expect(airport?.city).toBe("Dubai");
      expect(airport?.country).toBe("United Arab Emirates");
    });

    it("resolves international airport code LHR to London", () => {
      const airport = lookupAirport("LHR");
      expect(airport).not.toBeNull();
      expect(airport?.city).toBe("London");
      expect(airport?.country).toBe("United Kingdom");
    });

    it("returns null for non-existent code", () => {
      expect(lookupAirport("")).toBeNull();
      expect(lookupAirport("ZZZ")).toBeNull();
    });
  });

  describe("Airport Catalogs Data Integrity", () => {
    it("has comprehensive domestic airports with valid 3-letter IATA codes", () => {
      expect(DOMESTIC_AIRPORTS.length).toBeGreaterThan(30);
      DOMESTIC_AIRPORTS.forEach((a) => {
        expect(a.code).toMatch(/^[A-Z]{3}$/);
        expect(a.city.length).toBeGreaterThan(0);
        expect(a.name.length).toBeGreaterThan(0);
      });
    });

    it("has major international hubs with valid 3-letter IATA codes", () => {
      expect(INTERNATIONAL_AIRPORTS.length).toBeGreaterThan(30);
      INTERNATIONAL_AIRPORTS.forEach((a) => {
        expect(a.code).toMatch(/^[A-Z]{3}$/);
        expect(a.city.length).toBeGreaterThan(0);
        expect(a.country.length).toBeGreaterThan(0);
      });
    });

    it("contains key domestic hubs like BOM, BLR, HYD, MAA, CCU, AMD, GOX, COK", () => {
      const domesticCodes = DOMESTIC_AIRPORTS.map((a) => a.code);
      expect(domesticCodes).toContain("BOM");
      expect(domesticCodes).toContain("BLR");
      expect(domesticCodes).toContain("HYD");
      expect(domesticCodes).toContain("MAA");
      expect(domesticCodes).toContain("CCU");
      expect(domesticCodes).toContain("AMD");
      expect(domesticCodes).toContain("GOX");
      expect(domesticCodes).toContain("COK");
    });

    it("contains key international hubs like DXB, DOH, AUH, LHR, SIN, BKK, JFK", () => {
      const intlCodes = INTERNATIONAL_AIRPORTS.map((a) => a.code);
      expect(intlCodes).toContain("DXB");
      expect(intlCodes).toContain("DOH");
      expect(intlCodes).toContain("AUH");
      expect(intlCodes).toContain("LHR");
      expect(intlCodes).toContain("SIN");
      expect(intlCodes).toContain("BKK");
      expect(intlCodes).toContain("JFK");
    });
  });

  describe("AirportSuggestionPicker Markup & No Nested Button Invariant", () => {
    it("renders valid markup without nested <button> elements when value is selected", async () => {
      const { renderToString } = await import("react-dom/server");
      const React = await import("react");
      const { AirportSuggestionPicker } = await import("../AirportSuggestionPicker");

      const html = renderToString(
        React.createElement(AirportSuggestionPicker, {
          value: "BOM",
          onChange: () => {},
          travelType: "domestic",
        })
      );

      // Verify no nested <button> tag exists inside the trigger button
      const buttonMatches = html.match(/<button[^>]*>[\s\S]*?<\/button>/gi) || [];
      for (const btn of buttonMatches) {
        const innerContent = btn.replace(/^<button[^>]*>/i, "").replace(/<\/button>$/i, "");
        expect(innerContent).not.toMatch(/<button/i);
      }

      // Verify clear control is accessible and rendered with role="button"
      expect(html).toContain('title="Clear selection"');
      expect(html).toContain('role="button"');
    });

    it("renders placeholder and no clear control when value is empty", async () => {
      const { renderToString } = await import("react-dom/server");
      const React = await import("react");
      const { AirportSuggestionPicker } = await import("../AirportSuggestionPicker");

      const html = renderToString(
        React.createElement(AirportSuggestionPicker, {
          value: "",
          onChange: () => {},
          travelType: "domestic",
          placeholder: "Select airport...",
        })
      );

      expect(html).toContain("Select airport...");
      expect(html).not.toContain('title="Clear selection"');
    });
  });
});
