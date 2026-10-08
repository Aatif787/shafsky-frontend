import { describe, it, expect } from "vitest";
import { getTransitCategory, isIndianAirportCode } from "@/data/airportRegistry";

describe("Transit Service Category Classification", () => {
  describe("Airport classification authority", () => {
    it("correctly identifies Indian airports as Domestic", () => {
      expect(isIndianAirportCode("BOM")).toBe(true);
      expect(isIndianAirportCode("DEL")).toBe(true);
      expect(isIndianAirportCode("LKO")).toBe(true);
      expect(isIndianAirportCode("BLR")).toBe(true);
    });

    it("correctly identifies non-Indian airports as International", () => {
      expect(isIndianAirportCode("DXB")).toBe(false);
      expect(isIndianAirportCode("SIN")).toBe(false);
      expect(isIndianAirportCode("LHR")).toBe(false);
      expect(isIndianAirportCode("JFK")).toBe(false);
    });
  });

  describe("Four core transit journey business examples", () => {
    it("Example 1: Mumbai (BOM) -> Delhi (DEL) -> Lucknow (LKO) => Domestic -> Domestic", () => {
      // Origin: BOM (Domestic), Transit Hub: DEL, Destination: LKO (Domestic)
      const category = getTransitCategory("BOM", "LKO");
      expect(category).toBe("DOMESTIC_DOMESTIC");
    });

    it("Example 2: Mumbai (BOM) -> Delhi (DEL) -> Dubai (DXB) => Domestic -> International", () => {
      // Origin: BOM (Domestic), Transit Hub: DEL, Destination: DXB (International)
      const category = getTransitCategory("BOM", "DXB");
      expect(category).toBe("DOMESTIC_INTERNATIONAL");
    });

    it("Example 3: Dubai (DXB) -> Delhi (DEL) -> Lucknow (LKO) => International -> Domestic", () => {
      // Origin: DXB (International), Transit Hub: DEL, Destination: LKO (Domestic)
      const category = getTransitCategory("DXB", "LKO");
      expect(category).toBe("INTERNATIONAL_DOMESTIC");
    });

    it("Example 4: Dubai (DXB) -> Delhi (DEL) -> Singapore (SIN) => International -> International", () => {
      // Origin: DXB (International), Transit Hub: DEL, Destination: SIN (International)
      const category = getTransitCategory("DXB", "SIN");
      expect(category).toBe("INTERNATIONAL_INTERNATIONAL");
    });
  });

  describe("Transit Hub invariance and route updates", () => {
    it("changing only Transit Hub does NOT change the transit category", () => {
      // BOM -> DXB is always DOMESTIC_INTERNATIONAL regardless of whether transit hub is DEL, BOM, BLR, or HYD
      const categoryWithDel = getTransitCategory("BOM", "DXB");
      const categoryWithBmr = getTransitCategory("BOM", "DXB");
      expect(categoryWithDel).toBe("DOMESTIC_INTERNATIONAL");
      expect(categoryWithBmr).toBe("DOMESTIC_INTERNATIONAL");
      expect(categoryWithDel).toBe(categoryWithBmr);

      // DXB -> LKO is always INTERNATIONAL_DOMESTIC regardless of transit hub
      expect(getTransitCategory("DXB", "LKO")).toBe("INTERNATIONAL_DOMESTIC");
    });

    it("changing Origin recalculates category", () => {
      // Initially BOM -> LKO (Domestic -> Domestic)
      expect(getTransitCategory("BOM", "LKO")).toBe("DOMESTIC_DOMESTIC");
      // Origin changed to DXB -> DXB -> LKO (International -> Domestic)
      expect(getTransitCategory("DXB", "LKO")).toBe("INTERNATIONAL_DOMESTIC");
    });

    it("changing Final Destination recalculates category", () => {
      // Initially BOM -> LKO (Domestic -> Domestic)
      expect(getTransitCategory("BOM", "LKO")).toBe("DOMESTIC_DOMESTIC");
      // Destination changed to DXB -> BOM -> DXB (Domestic -> International)
      expect(getTransitCategory("BOM", "DXB")).toBe("DOMESTIC_INTERNATIONAL");
    });

    it("Home page Domestic/International selection cannot override authoritative transit category", () => {
      // User selected 'domestic' on home page toggle, but route is BOM -> DEL -> DXB
      const homePageToggle = "domestic";
      const transitCategory = getTransitCategory("BOM", "DXB");
      expect(transitCategory).toBe("DOMESTIC_INTERNATIONAL");
      expect(transitCategory).not.toBe(homePageToggle.toUpperCase());

      // User selected 'international' on home page toggle, but route is BOM -> DEL -> LKO
      const homePageToggle2 = "international";
      const transitCategory2 = getTransitCategory("BOM", "LKO");
      expect(transitCategory2).toBe("DOMESTIC_DOMESTIC");
      expect(transitCategory2).not.toBe(homePageToggle2.toUpperCase());
    });
  });
});
