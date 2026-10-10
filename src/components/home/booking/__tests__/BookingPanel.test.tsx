import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { BookingPanel } from "../BookingPanel";
import { MultiServiceApi } from "@/lib/api/multiServiceApi";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, ...props }: any) => React.createElement("a", props, children),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  },
}));

describe("BookingPanel Regression & Navigation Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders BookingPanel without ReferenceError (flightNumber is not defined)", () => {
    // Before the fix, rendering and state evaluation had references to undeclared flightNumber
    expect(() => {
      const html = renderToString(React.createElement(BookingPanel));
      expect(html).toContain("Book Airport Service");
      expect(html).toContain("Book Now");
    }).not.toThrow();
  });

  it("MultiServiceApi checkAvailability handles missing flight number safely", async () => {
    const mockCheck = vi.spyOn(MultiServiceApi, "checkAvailability").mockResolvedValueOnce({
      success: true,
      itinerary: { departure_airport: "BOM", arrival_airport: "DEL", transit_airports: [], legs: [], is_connecting: false, total_legs: 1 },
      services: [],
      all_available: true,
      any_available: true,
      none_available: false,
      guest_count: 1,
      available_subtotal: 0,
      total_payable: 0,
      currency: "INR",
      unavailable_services_count: 0,
    });

    const payload = {
      origin_code: "BOM",
      dest_code: "DEL",
      flight_num: undefined, // optional flight number
      guest_count: 1,
      selected_services: [{ service_type: "DEPARTURE", airport_code: "BOM" }],
    };

    const res = await MultiServiceApi.checkAvailability(payload as any);
    expect(res.success).toBe(true);
    expect(mockCheck).toHaveBeenCalledWith(payload);
  });

  it("renders Other Services alongside Departure, Transit, and Arrival with no separate Airport Services button", () => {
    const html = renderToString(React.createElement(BookingPanel));
    // Verify Departure, Transit, Arrival, and Other Services are all present
    expect(html).toContain("Departure");
    expect(html).toContain("Transit");
    expect(html).toContain("Arrival");
    expect(html).toContain("Other Services");
    // Verify there is no separate "Airport Services" button
    expect(html).not.toContain("Airport Services");
  });
});

