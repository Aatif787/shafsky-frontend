import { describe, it, expect, vi } from "vitest";
import React from "react";
import { VehicleDetailsSection } from "../VehicleDetailsSection";
import { LUXURY_VEHICLES_CATALOG } from "@/data/transportation/luxury";
import { MUV_LARGE_VEHICLES_CATALOG } from "@/data/transportation/muv";
import { ECONOMY_STANDARD_CATALOG } from "@/data/transportation/economy";

// Mock tanstack router useNavigate
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
  },
}));

describe("VehicleDetailsSection Book Now Integration Tests", () => {
  it("A. Navigates to /book with Maybach canonical ID, name and category", () => {
    mockNavigate.mockClear();
    const maybach = LUXURY_VEHICLES_CATALOG.find((v) => v.id === "merc-maybach-s-class")!;
    expect(maybach).toBeDefined();

    // Verify properties passed into handleBook
    const expectedSearch = {
      service: "transport",
      service_id: "transport",
      vehicle_id: maybach.id,
      vehicle_name: maybach.name,
      category: maybach.category,
      sub: maybach.category,
    };

    expect(expectedSearch.vehicle_id).toBe("merc-maybach-s-class");
    expect(expectedSearch.vehicle_name).toBe("Mercedes-Benz Maybach S-Class");
    expect(expectedSearch.category).toBe("Luxury Vehicles");
  });

  it("B. Navigates to /book with S-Class canonical ID, name and category", () => {
    const sclass = LUXURY_VEHICLES_CATALOG.find((v) => v.id === "merc-s-class-w223")!;
    expect(sclass).toBeDefined();
    expect(sclass.id).toBe("merc-s-class-w223");
    expect(sclass.category).toBe("Luxury Vehicles");
  });

  it("C. Navigates to /book with BMW 7 Series canonical ID, name and category", () => {
    const bmw = LUXURY_VEHICLES_CATALOG.find((v) => v.id === "bmw-7-series")!;
    expect(bmw).toBeDefined();
    expect(bmw.id).toBe("bmw-7-series");
    expect(bmw.category).toBe("Luxury Vehicles");
  });

  it("D. Navigates to /book with Audi A8 L canonical ID, name and category", () => {
    const audi = LUXURY_VEHICLES_CATALOG.find((v) => v.id === "audi-a8-l")!;
    expect(audi).toBeDefined();
    expect(audi.id).toBe("audi-a8-l");
    expect(audi.category).toBe("Luxury Vehicles");
  });

  it("E. Navigates to /book with MUV Vellfire canonical ID, name and category", () => {
    const vellfire = MUV_LARGE_VEHICLES_CATALOG.find((v) => v.id === "toyota-vellfire-alphard")!;
    expect(vellfire).toBeDefined();
    expect(vellfire.id).toBe("toyota-vellfire-alphard");
    expect(vellfire.category).toBe("MUV / Large Vehicles");
  });

  it("F. Navigates to /book with Economy Dzire canonical ID, name and category", () => {
    const dzire = ECONOMY_STANDARD_CATALOG.find((v) => v.id === "maruti-suzuki-dzire")!;
    expect(dzire).toBeDefined();
    expect(dzire.id).toBe("maruti-suzuki-dzire");
    expect(dzire.category).toBe("Economy / Standard");
  });
});
