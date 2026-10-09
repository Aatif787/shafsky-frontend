import { describe, it, expect, beforeEach } from "vitest";
import {
  resolveOrderedJourneyTargets,
  getNextJourneyStep,
  getStoredBookingIntent,
  saveStoredBookingIntent,
  recordPackageSelection,
} from "../multiServiceJourney";
import { type ServiceItemAvailability } from "@/lib/api/multiServiceApi";

describe("Multi-Service Journey Traversal & State Engine", () => {
  const storageMock: Record<string, string> = {};
  beforeEach(() => {
    for (const k in storageMock) delete storageMock[k];
    (globalThis as any).window = globalThis;
    (globalThis as any).sessionStorage = {
      getItem: (k: string) => storageMock[k] || null,
      setItem: (k: string, v: string) => { storageMock[k] = v; },
      removeItem: (k: string) => { delete storageMock[k]; },
      clear: () => { for (const k in storageMock) delete storageMock[k]; },
      length: 0,
      key: () => null,
    };
  });

  describe("1. Canonical Journey Target Ordering", () => {
    it("orders Departure only correctly", () => {
      const targets = resolveOrderedJourneyTargets(["DEPARTURE"], "BOM", "DEL");
      expect(targets).toHaveLength(1);
      expect(targets[0]).toEqual({
        serviceType: "DEPARTURE",
        airportCode: "BOM",
        direction: "departure",
        isSupported: true,
      });
    });

    it("orders Arrival only correctly", () => {
      const targets = resolveOrderedJourneyTargets(["ARRIVAL"], "BOM", "DEL");
      expect(targets).toHaveLength(1);
      expect(targets[0]).toEqual({
        serviceType: "ARRIVAL",
        airportCode: "DEL",
        direction: "arrival",
        isSupported: true,
      });
    });

    it("orders Transit only correctly", () => {
      const targets = resolveOrderedJourneyTargets(["TRANSIT"], "BOM", "DXB", "DEL");
      expect(targets).toHaveLength(1);
      expect(targets[0]).toEqual({
        serviceType: "TRANSIT",
        airportCode: "DEL",
        direction: "transit",
        isSupported: true,
      });
    });

    it("orders Departure + Arrival in journey sequence", () => {
      const targets = resolveOrderedJourneyTargets(["ARRIVAL", "DEPARTURE"], "BOM", "DEL");
      expect(targets).toHaveLength(2);
      expect(targets[0].serviceType).toBe("DEPARTURE");
      expect(targets[0].airportCode).toBe("BOM");
      expect(targets[1].serviceType).toBe("ARRIVAL");
      expect(targets[1].airportCode).toBe("DEL");
    });

    it("orders Departure + Transit in journey sequence", () => {
      const targets = resolveOrderedJourneyTargets(["TRANSIT", "DEPARTURE"], "BOM", "DXB", "DEL");
      expect(targets).toHaveLength(2);
      expect(targets[0].serviceType).toBe("DEPARTURE");
      expect(targets[0].airportCode).toBe("BOM");
      expect(targets[1].serviceType).toBe("TRANSIT");
      expect(targets[1].airportCode).toBe("DEL");
    });

    it("orders Arrival + Transit in journey sequence", () => {
      const targets = resolveOrderedJourneyTargets(["ARRIVAL", "TRANSIT"], "BOM", "DXB", "DEL");
      expect(targets).toHaveLength(2);
      expect(targets[0].serviceType).toBe("TRANSIT");
      expect(targets[0].airportCode).toBe("DEL");
      expect(targets[1].serviceType).toBe("ARRIVAL");
      expect(targets[1].airportCode).toBe("DXB");
    });

    it("orders all three services (Departure + Transit + Arrival) in canonical sequence", () => {
      const targets = resolveOrderedJourneyTargets(["ARRIVAL", "DEPARTURE", "TRANSIT"], "BOM", "DXB", "DEL");
      expect(targets).toHaveLength(3);
      expect(targets[0].serviceType).toBe("DEPARTURE");
      expect(targets[0].airportCode).toBe("BOM");
      expect(targets[1].serviceType).toBe("TRANSIT");
      expect(targets[1].airportCode).toBe("DEL");
      expect(targets[2].serviceType).toBe("ARRIVAL");
      expect(targets[2].airportCode).toBe("DXB");
    });
  });

  describe("2. Step-by-Step Traversal Across Available Airports", () => {
    const allAvailableMock: ServiceItemAvailability[] = [
      {
        service_type: "DEPARTURE",
        airport_code: "BOM",
        is_airport_supported: true,
        status: "AVAILABLE",
        currency: "INR",
        is_bookable_online: true,
        available_packages: [],
      },
      {
        service_type: "TRANSIT",
        airport_code: "DEL",
        is_airport_supported: true,
        status: "AVAILABLE",
        currency: "INR",
        is_bookable_online: true,
        available_packages: [],
      },
      {
        service_type: "ARRIVAL",
        airport_code: "BLR",
        is_airport_supported: true,
        status: "AVAILABLE",
        currency: "INR",
        is_bookable_online: true,
        available_packages: [],
      },
    ];

    it("transitions from Departure (BOM) to Transit (DEL) when both are available", () => {
      const step = getNextJourneyStep(
        "DEPARTURE",
        "platinum",
        ["DEPARTURE", "TRANSIT", "ARRIVAL"],
        "BOM",
        "BLR",
        "DEL",
        allAvailableMock
      );

      expect(step.type).toBe("AIRPORT_PAGE");
      expect(step.targetAirport).toBe("DEL");
      expect(step.targetDirection).toBe("transit");
      expect(step.packagesByService.DEPARTURE).toBe("platinum");
      expect(step.searchParams.pkg_departure).toBe("platinum");
    });

    it("transitions from Transit (DEL) to Arrival (BLR) when Arrival is available", () => {
      const existing = { DEPARTURE: "platinum" };
      const step = getNextJourneyStep(
        "TRANSIT",
        "domestic_domestic",
        ["DEPARTURE", "TRANSIT", "ARRIVAL"],
        "BOM",
        "BLR",
        "DEL",
        allAvailableMock,
        existing
      );

      expect(step.type).toBe("AIRPORT_PAGE");
      expect(step.targetAirport).toBe("BLR");
      expect(step.targetDirection).toBe("arrival");
      expect(step.packagesByService.DEPARTURE).toBe("platinum");
      expect(step.packagesByService.TRANSIT).toBe("domestic_domestic");
      expect(step.searchParams.pkg_transit).toBe("domestic_domestic");
    });

    it("transitions to CHECKOUT when final service (Arrival) is configured", () => {
      const existing = { DEPARTURE: "platinum", TRANSIT: "domestic_domestic" };
      const step = getNextJourneyStep(
        "ARRIVAL",
        "gold",
        ["DEPARTURE", "TRANSIT", "ARRIVAL"],
        "BOM",
        "BLR",
        "DEL",
        allAvailableMock,
        existing
      );

      expect(step.type).toBe("CHECKOUT");
      expect(step.packagesByService.DEPARTURE).toBe("platinum");
      expect(step.packagesByService.TRANSIT).toBe("domestic_domestic");
      expect(step.packagesByService.ARRIVAL).toBe("gold");
      expect(step.searchParams.pkg_arrival).toBe("gold");
    });
  });

  describe("3. Partial Availability & Skipped Airports", () => {
    it("handles First Available (BOM), Middle Unavailable (DEL), Final Available (BLR)", () => {
      const partialAvail: ServiceItemAvailability[] = [
        {
          service_type: "DEPARTURE",
          airport_code: "BOM",
          is_airport_supported: true,
          status: "AVAILABLE",
          currency: "INR",
          is_bookable_online: true,
          available_packages: [],
        },
        {
          service_type: "TRANSIT",
          airport_code: "DEL",
          is_airport_supported: false,
          status: "REQUEST_REQUIRED",
          currency: "INR",
          is_bookable_online: false,
          available_packages: [],
        },
        {
          service_type: "ARRIVAL",
          airport_code: "BLR",
          is_airport_supported: true,
          status: "AVAILABLE",
          currency: "INR",
          is_bookable_online: true,
          available_packages: [],
        },
      ];

      // After selecting BOM Departure, should skip DEL Transit and proceed to BLR Arrival!
      const step = getNextJourneyStep(
        "DEPARTURE",
        "platinum",
        ["DEPARTURE", "TRANSIT", "ARRIVAL"],
        "BOM",
        "BLR",
        "DEL",
        partialAvail
      );

      expect(step.type).toBe("AIRPORT_PAGE");
      expect(step.targetAirport).toBe("BLR");
      expect(step.targetDirection).toBe("arrival");
    });

    it("handles First Available (BOM) and Final Unsupported (DXB) by proceeding to CHECKOUT", () => {
      const bomAvailDxbUnavail: ServiceItemAvailability[] = [
        {
          service_type: "DEPARTURE",
          airport_code: "BOM",
          is_airport_supported: true,
          status: "AVAILABLE",
          currency: "INR",
          is_bookable_online: true,
          available_packages: [],
        },
        {
          service_type: "ARRIVAL",
          airport_code: "DXB",
          is_airport_supported: false,
          status: "REQUEST_REQUIRED",
          currency: "INR",
          is_bookable_online: false,
          available_packages: [],
        },
      ];

      const step = getNextJourneyStep(
        "DEPARTURE",
        "platinum",
        ["DEPARTURE", "ARRIVAL"],
        "BOM",
        "DXB",
        undefined,
        bomAvailDxbUnavail
      );

      // DXB is unavailable, so no more available airport pages exist; navigate to CHECKOUT
      expect(step.type).toBe("CHECKOUT");
      expect(step.packagesByService.DEPARTURE).toBe("platinum");
    });
  });

  describe("4. Category & Parameter Persistence", () => {
    it("preserves travel_type, flight_type and transit_type without mutation", () => {
      const base = {
        travel_type: "international",
        flight_type: "DOMESTIC_INTERNATIONAL",
        transit_type: "DOMESTIC_INTERNATIONAL",
        pax_adults: 2,
        depart_date: "2026-11-15",
      };

      const step = getNextJourneyStep(
        "DEPARTURE",
        "platinum",
        ["DEPARTURE", "TRANSIT"],
        "BOM",
        "DXB",
        "DEL",
        [],
        {},
        base
      );

      expect(step.searchParams.travel_type).toBe("international");
      expect(step.searchParams.flight_type).toBe("DOMESTIC_INTERNATIONAL");
      expect(step.searchParams.transit_type).toBe("DOMESTIC_INTERNATIONAL");
      expect(step.searchParams.pax_adults).toBe(2);
      expect(step.searchParams.depart_date).toBe("2026-11-15");
    });
  });

  describe("5. Session Storage Intent Persistence", () => {
    it("records package selection into sessionStorage accurately", () => {
      saveStoredBookingIntent({
        services: "DEPARTURE,ARRIVAL",
        origin: "BOM",
        destination: "DEL",
      });

      recordPackageSelection("DEPARTURE", "platinum");
      recordPackageSelection("ARRIVAL", "silver");

      const stored = getStoredBookingIntent();
      expect(stored.pkg_departure).toBe("platinum");
      expect(stored.pkg_arrival).toBe("silver");
      expect(stored.packages_by_service?.DEPARTURE).toBe("platinum");
      expect(stored.packages_by_service?.ARRIVAL).toBe("silver");
    });
  });
});
