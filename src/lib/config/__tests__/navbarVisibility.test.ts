import { describe, it, expect } from "vitest";
import { PRIMARY_SERVICES } from "@/components/Navigation";
import {
  NAVBAR_SERVICE_VISIBILITY,
  isNavbarServiceVisible,
} from "../navbarVisibility";

describe("navbarVisibility config", () => {
  it("hides the requested navbar services from the dropdown (Meet & Greet, Transport, Luxury Hotels, Ticketing/Special Services)", () => {
    expect(isNavbarServiceVisible("/solutions/concierge")).toBe(false);
    expect(isNavbarServiceVisible("/solutions/transport")).toBe(false);
    expect(isNavbarServiceVisible("/solutions/hotels")).toBe(false);
    expect(isNavbarServiceVisible("/solutions/special-services")).toBe(false);
  });

  it("filters the dropdown service list to empty when all dropdown services are removed", () => {
    const visible = PRIMARY_SERVICES.filter((srv) => isNavbarServiceVisible(srv.href));
    expect(visible).toEqual([]);
  });

  it("keeps PRIMARY_SERVICES intact so routes, booking flows and Review Mode are unaffected", () => {
    expect(PRIMARY_SERVICES).toHaveLength(5);
    expect(PRIMARY_SERVICES.map((s) => s.href)).toEqual([
      "/solutions/concierge",
      "/solutions/transport",
      "/solutions/hotels",
      "/solutions/aviation",
      "/solutions/special-services?sub=ticketing",
    ]);
  });

  it("is reversible: flipping the flag restores a link into the dropdown without breaking code", () => {
    const restored: Record<string, boolean> = { ...NAVBAR_SERVICE_VISIBILITY, "/solutions/hotels": true };
    const visible = PRIMARY_SERVICES.filter((srv) => restored[srv.href] === true);
    expect(visible.map((s) => s.href)).toContain("/solutions/hotels");
  });

  it("includes Ticketing in the PRIMARY_SERVICES entry", () => {
    const ticketing = PRIMARY_SERVICES.find((s) => s.href.startsWith("/solutions/special-services"));
    expect(ticketing).toBeDefined();
    expect(ticketing?.title).toBe("Ticketing");
  });
});

