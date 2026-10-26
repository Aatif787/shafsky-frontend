import { describe, it, expect } from "vitest";
import { AIRPORTS } from "@/data/airports";
import { AIRPORT_REGISTRY } from "@/data/airportRegistry";

describe("Airport Listing — Database Supported Hubs", () => {
  it("contains exactly 20 database-configured operating airports", () => {
    expect(AIRPORTS.length).toBe(20);
    const codes = AIRPORTS.map((a) => a.code);
    expect(codes).toEqual([
      "LKO", "DEL", "BOM", "HYD", "JAI", "ATQ", "AMD", "GOI", "CCU", "MAA",
      "BLR", "COK", "TRV", "VTZ", "BBI", "IXC", "GOX", "GAU", "IXE", "IXR",
    ]);
  });

  it("does not contain external CSV airports in the primary airport dataset", () => {
    const codes = new Set(AIRPORTS.map((a) => a.code));
    const foreignCodes = ["DXB", "LHR", "JFK", "CDG", "SIN", "FRA", "HND", "SYD"];
    for (const code of foreignCodes) {
      expect(codes.has(code)).toBe(false);
    }
  });

  it("verifies all 20 airports exist in AIRPORT_REGISTRY with active services", () => {
    for (const a of AIRPORTS) {
      const reg = AIRPORT_REGISTRY[a.code];
      expect(reg).toBeDefined();
      expect(reg.city).toBeTruthy();
      expect(reg.name).toBeTruthy();
      expect(reg.availableServiceIds.length).toBeGreaterThan(0);
    }
  });

  it("filters accurately by alphabet across the 20 database airports", () => {
    const dAirports = AIRPORTS.filter(
      (a) => a.city.toUpperCase().startsWith("D") || (a.airport?.name || "").toUpperCase().startsWith("D")
    );
    // DEL (Delhi)
    expect(dAirports.some((a) => a.code === "DEL")).toBe(true);
    expect(dAirports.every((a) => a.code !== "DXB")).toBe(true);
  });
});
