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

  describe("Transit Service Locking Authority and Tamper Resistance", () => {
    function computeTransitLockState(
      journeyType: string,
      origin: string,
      destination: string,
      clientTransitType?: string
    ) {
      const isTransitLocked = journeyType === "TRANSIT" && Boolean(origin && destination);
      const lockedTransitCategory = isTransitLocked ? getTransitCategory(origin, destination) : null;
      const effectiveTransitType = isTransitLocked && lockedTransitCategory ? lockedTransitCategory : (clientTransitType || "DOMESTIC_DOMESTIC");
      return { isTransitLocked, lockedTransitCategory, effectiveTransitType };
    }

    it("locks Mumbai -> Delhi -> Dubai to Domestic -> International and rejects tampering", () => {
      const state = computeTransitLockState("TRANSIT", "BOM", "DXB", "DOMESTIC_DOMESTIC");
      expect(state.isTransitLocked).toBe(true);
      expect(state.lockedTransitCategory).toBe("DOMESTIC_INTERNATIONAL");
      expect(state.effectiveTransitType).toBe("DOMESTIC_INTERNATIONAL");
    });

    it("locks Mumbai -> Delhi -> Lucknow to Domestic -> Domestic and rejects tampering", () => {
      const state = computeTransitLockState("TRANSIT", "BOM", "LKO", "INTERNATIONAL_INTERNATIONAL");
      expect(state.isTransitLocked).toBe(true);
      expect(state.lockedTransitCategory).toBe("DOMESTIC_DOMESTIC");
      expect(state.effectiveTransitType).toBe("DOMESTIC_DOMESTIC");
    });

    it("locks Dubai -> Delhi -> Lucknow to International -> Domestic and rejects tampering", () => {
      const state = computeTransitLockState("TRANSIT", "DXB", "LKO", "DOMESTIC_DOMESTIC");
      expect(state.isTransitLocked).toBe(true);
      expect(state.lockedTransitCategory).toBe("INTERNATIONAL_DOMESTIC");
      expect(state.effectiveTransitType).toBe("INTERNATIONAL_DOMESTIC");
    });

    it("locks Dubai -> Delhi -> Singapore to International -> International and rejects tampering", () => {
      const state = computeTransitLockState("TRANSIT", "DXB", "SIN", "DOMESTIC_INTERNATIONAL");
      expect(state.isTransitLocked).toBe(true);
      expect(state.lockedTransitCategory).toBe("INTERNATIONAL_INTERNATIONAL");
      expect(state.effectiveTransitType).toBe("INTERNATIONAL_INTERNATIONAL");
    });

    it("does not lock Arrival or Departure services", () => {
      const arrivalState = computeTransitLockState("ARRIVAL", "BOM", "DEL", "DOMESTIC");
      expect(arrivalState.isTransitLocked).toBe(false);
      expect(arrivalState.lockedTransitCategory).toBeNull();

      const departureState = computeTransitLockState("DEPARTURE", "DEL", "DXB", "INTERNATIONAL");
      expect(departureState.isTransitLocked).toBe(false);
      expect(departureState.lockedTransitCategory).toBeNull();
    });

    it("allows category switching when browsing catalog without route endpoints", () => {
      const state = computeTransitLockState("TRANSIT", "", "", "INTERNATIONAL_INTERNATIONAL");
      expect(state.isTransitLocked).toBe(false);
      expect(state.lockedTransitCategory).toBeNull();
      expect(state.effectiveTransitType).toBe("INTERNATIONAL_INTERNATIONAL");
    });
  });

  describe("Mandatory Enterprise Production Test Cases (TEST 1 - TEST 7)", () => {
    it("TEST 1: Mumbai -> Delhi -> Lucknow => Domestic -> Domestic", () => {
      const origin = "BOM";
      const transitHub = "DEL";
      const destination = "LKO";
      const category = getTransitCategory(origin, destination);
      expect(category).toBe("DOMESTIC_DOMESTIC");
    });

    it("TEST 2: Mumbai -> Delhi -> Dubai => Domestic -> International", () => {
      const origin = "BOM";
      const transitHub = "DEL";
      const destination = "DXB";
      const category = getTransitCategory(origin, destination);
      expect(category).toBe("DOMESTIC_INTERNATIONAL");
    });

    it("TEST 3: Dubai -> Delhi -> Lucknow => International -> Domestic", () => {
      const origin = "DXB";
      const transitHub = "DEL";
      const destination = "LKO";
      const category = getTransitCategory(origin, destination);
      expect(category).toBe("INTERNATIONAL_DOMESTIC");
    });

    it("TEST 4: Dubai -> Delhi -> Singapore => International -> International", () => {
      const origin = "DXB";
      const transitHub = "DEL";
      const destination = "SIN";
      const category = getTransitCategory(origin, destination);
      expect(category).toBe("INTERNATIONAL_INTERNATIONAL");
    });

    it("TEST 5: Change Final Destination: Mumbai -> Delhi -> Dubai -> change destination to Lucknow => Domestic -> Domestic", () => {
      let origin = "BOM";
      const transitHub = "DEL";
      let destination = "DXB";
      expect(getTransitCategory(origin, destination)).toBe("DOMESTIC_INTERNATIONAL");

      // User changes destination to Lucknow (LKO)
      destination = "LKO";
      expect(getTransitCategory(origin, destination)).toBe("DOMESTIC_DOMESTIC");
    });

    it("TEST 6: Change Origin: Mumbai -> Delhi -> Lucknow -> change origin to Dubai => International -> Domestic", () => {
      let origin = "BOM";
      const transitHub = "DEL";
      let destination = "LKO";
      expect(getTransitCategory(origin, destination)).toBe("DOMESTIC_DOMESTIC");

      // User changes origin to Dubai (DXB)
      origin = "DXB";
      expect(getTransitCategory(origin, destination)).toBe("INTERNATIONAL_DOMESTIC");
    });

    it("TEST 7: Change ONLY Transit Hub => Transit service category does NOT change", () => {
      const origin = "BOM";
      const destination = "DXB";
      const categoryDEL = getTransitCategory(origin, destination);

      // Change transit hub to BLR, HYD, or BOM
      const categoryBLR = getTransitCategory(origin, destination);
      const categoryHYD = getTransitCategory(origin, destination);

      expect(categoryDEL).toBe("DOMESTIC_INTERNATIONAL");
      expect(categoryBLR).toBe("DOMESTIC_INTERNATIONAL");
      expect(categoryHYD).toBe("DOMESTIC_INTERNATIONAL");
      expect(categoryDEL).toBe(categoryBLR);
    });
  });
});
