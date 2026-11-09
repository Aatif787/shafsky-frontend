import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  useExpressFeeCalculation,
  UseExpressFeeCalculationOptions,
  UseExpressFeeCalculationReturn,
} from "../hooks/useExpressFeeCalculation";

function testHook(options: UseExpressFeeCalculationOptions): UseExpressFeeCalculationReturn {
  let hookResult: UseExpressFeeCalculationReturn | undefined;
  const TestComponent: React.FC = () => {
    hookResult = useExpressFeeCalculation(options);
    return null;
  };
  renderToString(<TestComponent />);
  return hookResult!;
}

describe("useExpressFeeCalculation - Short Notice Express Fees", () => {
  const MOCK_NOW = new Date("2026-10-15T12:00:00+05:30").getTime();

  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(MOCK_NOW);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createBaseOptions = (overrides?: Partial<UseExpressFeeCalculationOptions>): UseExpressFeeCalculationOptions => ({
    selectedServices: [],
    cleanOrigin: "",
    originCode: "",
    direction: "departure",
    airportCode: "DEL",
    cleanDest: "",
    destCode: "",
    cleanTransit: "",
    transitCode: "",
    searchParams: {},
    travelType: "domestic",
    serviceDate: "2026-10-15",
    flightVerification: {
      isFlightVerified: true,
      verifiedFlight: {
        departure: { scheduledTime: "2026-10-15T18:00:00+05:30" }, // in 6 hours (< 24h)
        arrival: { scheduledTime: "2026-10-15T20:00:00+05:30" },
      },
      manualDepTime: "",
      manualArrTime: "",
    },
    baseInrTotalPrice: 3000,
    multiServiceAvailability: [],
    isArrangementOnly: false,
    multiServiceResponse: null,
    selectedCurrency: "INR",
    ...overrides,
  });

  it("applies 50% express fee for Mumbai (BOM) under 24 hours", () => {
    const result = testHook(
      createBaseOptions({
        airportCode: "BOM",
        direction: "departure",
        baseInrTotalPrice: 4000,
      })
    );

    expect(result.isExpressFeeApplicable).toBe(true);
    expect(result.expressFeeInr).toBe(2000); // 50% of 4000
    expect(result.totalPrice).toBe(6000);
    expect(result.expressFeeLabel).toBe("(50% Express Fee)");
    expect(result.expressFeeNotice).toContain("Mumbai Airport booking under 24 hours");
  });

  it.each([
    ["HYD", "Hyderabad"],
    ["GOX", "Goa (Mopa)"],
    ["DEL", "Delhi"],
    ["VTZ", "Visakhapatnam"],
  ])("applies flat ₹500 express fee for %s (%s) under 24 hours", (iataCode, cityName) => {
    const result = testHook(
      createBaseOptions({
        airportCode: iataCode,
        direction: "departure",
        baseInrTotalPrice: 3500,
      })
    );

    expect(result.isExpressFeeApplicable).toBe(true);
    expect(result.expressFeeInr).toBe(500); // Flat 500
    expect(result.totalPrice).toBe(4000); // 3500 + 500
    expect(result.expressFeeLabel).toBe("(₹500 Express Fee)");
    expect(result.expressFeeNotice).toContain(cityName);
    expect(result.expressFeeNotice).toContain("₹500");
  });

  it.each(["BLR", "MAA", "GOI", "AMD", "CCU", "JAI"])(
    "charges ₹0 express fee for unaffected airport %s under 24 hours",
    (unaffectedAirport) => {
      const result = testHook(
        createBaseOptions({
          airportCode: unaffectedAirport,
          direction: "departure",
          baseInrTotalPrice: 3500,
        })
      );

      expect(result.isExpressFeeApplicable).toBe(false);
      expect(result.expressFeeInr).toBe(0);
      expect(result.totalPrice).toBe(3500);
    }
  );

  it("charges ₹0 express fee when booking is more than 24 hours in advance", () => {
    // Flight in 48 hours
    const result = testHook(
      createBaseOptions({
        airportCode: "DEL",
        direction: "departure",
        flightVerification: {
          isFlightVerified: true,
          verifiedFlight: {
            departure: { scheduledTime: "2026-10-17T18:00:00+05:30" },
            arrival: { scheduledTime: "2026-10-17T20:00:00+05:30" },
          },
          manualDepTime: "",
          manualArrTime: "",
        },
        baseInrTotalPrice: 3500,
      })
    );

    expect(result.isExpressFeeApplicable).toBe(false);
    expect(result.expressFeeInr).toBe(0);
    expect(result.totalPrice).toBe(3500);
  });

  describe("Multi-service booking express fees", () => {
    it("applies BOM (50%) + DEL (₹500) independently in a 2-service booking under 24h", () => {
      const result = testHook(
        createBaseOptions({
          selectedServices: ["DEPARTURE", "ARRIVAL"],
          cleanOrigin: "BOM",
          cleanDest: "DEL",
          baseInrTotalPrice: 6000,
          multiServiceAvailability: [
            {
              service_type: "DEPARTURE",
              airport_code: "BOM",
              total_price: 3000,
              is_airport_supported: true,
              status: "AVAILABLE",
            } as any,
            {
              service_type: "ARRIVAL",
              airport_code: "DEL",
              total_price: 3000,
              is_airport_supported: true,
              status: "AVAILABLE",
            } as any,
          ],
          multiServiceResponse: {
            total_payable: 6000,
            services: [],
          } as any,
        })
      );

      expect(result.isExpressFeeApplicable).toBe(true);
      // BOM: 50% of 3000 = 1500
      // DEL: flat 500
      // Total express fee = 2000
      expect(result.expressFeeInr).toBe(2000);
      expect(result.totalPrice).toBe(8000);
      expect(result.expressFeeLabel).toBe("(Express Fee)");
      expect(result.expressFeeNotice).toContain("50% fee for Mumbai");
      expect(result.expressFeeNotice).toContain("Delhi");
    });

    it("applies HYD (₹500) + VTZ (₹500) = ₹1000 in a 2-service booking under 24h", () => {
      const result = testHook(
        createBaseOptions({
          selectedServices: ["DEPARTURE", "ARRIVAL"],
          cleanOrigin: "HYD",
          cleanDest: "VTZ",
          baseInrTotalPrice: 5000,
          multiServiceAvailability: [
            {
              service_type: "DEPARTURE",
              airport_code: "HYD",
              total_price: 2500,
              is_airport_supported: true,
              status: "AVAILABLE",
            } as any,
            {
              service_type: "ARRIVAL",
              airport_code: "VTZ",
              total_price: 2500,
              is_airport_supported: true,
              status: "AVAILABLE",
            } as any,
          ],
          multiServiceResponse: {
            total_payable: 5000,
            services: [],
          } as any,
        })
      );

      expect(result.isExpressFeeApplicable).toBe(true);
      // HYD: flat 500
      // VTZ: flat 500
      // Total express fee = 1000
      expect(result.expressFeeInr).toBe(1000);
      expect(result.totalPrice).toBe(6000);
      expect(result.expressFeeLabel).toBe("(₹500 / service Express Fee)");
      expect(result.expressFeeNotice).toContain("Hyderabad, Visakhapatnam");
    });

    it("applies flat ₹500 on Transit at Goa Mopa (GOX) under 24h", () => {
      const result = testHook(
        createBaseOptions({
          selectedServices: ["TRANSIT"],
          direction: "transit",
          cleanTransit: "GOX",
          transitCode: "GOX",
          airportCode: "GOX",
          baseInrTotalPrice: 4500,
          multiServiceAvailability: [
            {
              service_type: "TRANSIT",
              airport_code: "GOX",
              total_price: 4500,
              is_airport_supported: true,
              status: "AVAILABLE",
            } as any,
          ],
        })
      );

      expect(result.isExpressFeeApplicable).toBe(true);
      expect(result.expressFeeInr).toBe(500);
      expect(result.totalPrice).toBe(5000);
      expect(result.expressFeeLabel).toBe("(₹500 Express Fee)");
      expect(result.expressFeeNotice).toContain("Goa (Mopa)");
    });

    it("applies ₹0 fee when multi-service has BOM > 24h and BLR (unaffected)", () => {
      const result = testHook(
        createBaseOptions({
          selectedServices: ["DEPARTURE", "ARRIVAL"],
          cleanOrigin: "BOM",
          cleanDest: "BLR",
          flightVerification: {
            isFlightVerified: true,
            verifiedFlight: {
              departure: { scheduledTime: "2026-10-17T18:00:00+05:30" }, // 48h away
              arrival: { scheduledTime: "2026-10-17T20:00:00+05:30" },
            },
            manualDepTime: "",
            manualArrTime: "",
          },
          baseInrTotalPrice: 5000,
          multiServiceAvailability: [
            {
              service_type: "DEPARTURE",
              airport_code: "BOM",
              total_price: 2500,
              is_airport_supported: true,
              status: "AVAILABLE",
            } as any,
            {
              service_type: "ARRIVAL",
              airport_code: "BLR",
              total_price: 2500,
              is_airport_supported: true,
              status: "AVAILABLE",
            } as any,
          ],
        })
      );

      expect(result.isExpressFeeApplicable).toBe(false);
      expect(result.expressFeeInr).toBe(0);
      expect(result.totalPrice).toBe(5000);
    });
  });
});
