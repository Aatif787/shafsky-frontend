import { describe, it, expect, beforeEach } from "vitest";
import {
  resolveOrderedJourneyTargets,
  getNextJourneyStep,
  recordPackageSelection,
  getStoredBookingIntent,
  saveStoredBookingIntent,
} from "../multiServiceJourney";
import { type ServiceItemAvailability } from "@/lib/api/multiServiceApi";

describe("Booking Flow End-to-End Orchestration Tests", () => {
  const storageMock: Record<string, string> = {};

  beforeEach(() => {
    for (const k in storageMock) delete storageMock[k];
    (globalThis as any).window = globalThis;
    (globalThis as any).sessionStorage = {
      getItem: (k: string) => storageMock[k] || null,
      setItem: (k: string, v: string) => {
        storageMock[k] = v;
      },
      removeItem: (k: string) => {
        delete storageMock[k];
      },
      clear: () => {
        for (const k in storageMock) delete storageMock[k];
      },
      length: 0,
      key: () => null,
    };
  });

  const availabilityBothAvailable: ServiceItemAvailability[] = [
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
      airport_code: "DEL",
      is_airport_supported: true,
      status: "AVAILABLE",
      currency: "INR",
      is_bookable_online: true,
      available_packages: [],
    },
  ];

  it("Two-Airport Journey (BOM Departure + DEL Arrival): processes both airports sequentially before checkout", () => {
    // 1. Initial homepage intent: customer selects BOM Departure + DEL Arrival
    saveStoredBookingIntent({
      services: "DEPARTURE,ARRIVAL",
      origin: "BOM",
      destination: "DEL",
      travel_type: "domestic",
      packages_by_service: {},
      services_availability: availabilityBothAvailable,
    });

    const initialTargets = resolveOrderedJourneyTargets(["DEPARTURE", "ARRIVAL"], "BOM", "DEL");
    expect(initialTargets).toHaveLength(2);
    expect(initialTargets[0].airportCode).toBe("BOM");
    expect(initialTargets[0].serviceType).toBe("DEPARTURE");
    expect(initialTargets[1].airportCode).toBe("DEL");
    expect(initialTargets[1].serviceType).toBe("ARRIVAL");

    // 2. Step 1: Customer opens BOM Departure airport page and chooses a package
    recordPackageSelection("DEPARTURE", "gold");

    const step1 = getNextJourneyStep(
      "DEPARTURE",
      "gold",
      ["DEPARTURE", "ARRIVAL"],
      "BOM",
      "DEL",
      undefined,
      availabilityBothAvailable,
      getStoredBookingIntent().packages_by_service || {}
    );

    // Must NOT jump to checkout after first airport; must open Arrival airport page (DEL)
    expect(step1.type).toBe("AIRPORT_PAGE");
    expect(step1.targetAirport).toBe("DEL");
    expect(step1.targetDirection).toBe("arrival");
    // Must NOT leak preselected package to the next airport page
    expect(step1.searchParams.package_id).toBeUndefined();
    expect(step1.searchParams.package_name).toBeUndefined();
    expect(step1.searchParams.package_price).toBeUndefined();
    // Must retain Departure package
    expect(step1.searchParams.pkg_departure).toBe("gold");

    // 3. Step 2: Customer opens DEL Arrival airport page and chooses a package
    recordPackageSelection("ARRIVAL", "platinum");

    const step2 = getNextJourneyStep(
      "ARRIVAL",
      "platinum",
      ["DEPARTURE", "ARRIVAL"],
      "BOM",
      "DEL",
      undefined,
      availabilityBothAvailable,
      getStoredBookingIntent().packages_by_service || {}
    );

    // Only after processing all airports does it navigate to checkout
    expect(step2.type).toBe("CHECKOUT");
    expect(step2.packagesByService.DEPARTURE).toBe("gold");
    expect(step2.packagesByService.ARRIVAL).toBe("platinum");
    expect(step2.searchParams.pkg_departure).toBe("gold");
    expect(step2.searchParams.pkg_arrival).toBe("platinum");
  });

  it("Three-Airport Connecting Journey (BOM Dep + DEL Transit + BLR Arr): processes each connecting hub in order", () => {
    const availabilityThreeLegs: ServiceItemAvailability[] = [
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

    saveStoredBookingIntent({
      services: "DEPARTURE,TRANSIT,ARRIVAL",
      origin: "BOM",
      destination: "BLR",
      transit: "DEL",
    });

    // Step 1: BOM Departure
    recordPackageSelection("DEPARTURE", "silver");
    const step1 = getNextJourneyStep(
      "DEPARTURE",
      "silver",
      ["DEPARTURE", "TRANSIT", "ARRIVAL"],
      "BOM",
      "BLR",
      "DEL",
      availabilityThreeLegs,
      getStoredBookingIntent().packages_by_service || {}
    );
    expect(step1.type).toBe("AIRPORT_PAGE");
    expect(step1.targetAirport).toBe("DEL");
    expect(step1.targetDirection).toBe("transit");

    // Step 2: DEL Transit
    recordPackageSelection("TRANSIT", "domestic_domestic");
    const step2 = getNextJourneyStep(
      "TRANSIT",
      "domestic_domestic",
      ["DEPARTURE", "TRANSIT", "ARRIVAL"],
      "BOM",
      "BLR",
      "DEL",
      availabilityThreeLegs,
      getStoredBookingIntent().packages_by_service || {}
    );
    expect(step2.type).toBe("AIRPORT_PAGE");
    expect(step2.targetAirport).toBe("BLR");
    expect(step2.targetDirection).toBe("arrival");

    // Step 3: BLR Arrival
    recordPackageSelection("ARRIVAL", "gold");
    const step3 = getNextJourneyStep(
      "ARRIVAL",
      "gold",
      ["DEPARTURE", "TRANSIT", "ARRIVAL"],
      "BOM",
      "BLR",
      "DEL",
      availabilityThreeLegs,
      getStoredBookingIntent().packages_by_service || {}
    );
    expect(step3.type).toBe("CHECKOUT");
    expect(step3.packagesByService.DEPARTURE).toBe("silver");
    expect(step3.packagesByService.TRANSIT).toBe("domestic_domestic");
    expect(step3.packagesByService.ARRIVAL).toBe("gold");
  });

  it("Unavailable Airport Handling: skips package selection for unsupported airport and records it as arrangement request", () => {
    const partialAvailability: ServiceItemAvailability[] = [
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
        airport_code: "XYZ",
        is_airport_supported: false,
        status: "REQUEST_REQUIRED",
        status_reason: "Airport XYZ is not supported for online booking.",
        currency: "INR",
        is_bookable_online: false,
        available_packages: [],
      },
    ];

    saveStoredBookingIntent({
      services: "DEPARTURE,ARRIVAL",
      origin: "BOM",
      destination: "XYZ",
      services_availability: partialAvailability,
    });

    // Step 1: Customer selects BOM Departure package
    recordPackageSelection("DEPARTURE", "platinum");
    const step1 = getNextJourneyStep(
      "DEPARTURE",
      "platinum",
      ["DEPARTURE", "ARRIVAL"],
      "BOM",
      "XYZ",
      undefined,
      partialAvailability,
      getStoredBookingIntent().packages_by_service || {}
    );

    // XYZ Arrival is unavailable, so it skips XYZ's package selection page and navigates directly to final checkout!
    expect(step1.type).toBe("CHECKOUT");
    expect(step1.packagesByService.DEPARTURE).toBe("platinum");
    // XYZ does not have an online package slug
    expect(step1.packagesByService.ARRIVAL).toBeUndefined();
  });
});
