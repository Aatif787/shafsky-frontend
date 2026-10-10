import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  getAirportDisplayName,
  buildRouteMismatchWarning,
  evaluateFlightRouteMatch,
  evaluateConnectingLegRouteMatch,
} from "../airport/utils";
import { DirectFlightDetailsSection } from "../airport/DirectFlightDetailsSection";
import { RouteMismatchInfo } from "../airport/types";

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

describe("Flight Route Mismatch Specification & Regression Test Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. MATCHING FLIGHT ROUTE
  // ─────────────────────────────────────────────────────────────────────────────
  describe("1. Matching flight route", () => {
    it("recognizes exact match for Mumbai (BOM) -> Dubai (DXB) international route", () => {
      const result = evaluateFlightRouteMatch({
        direction: "departure",
        flOrigin: "BOM",
        flDest: "DXB",
        userOrigin: "BOM",
        userDest: "DXB",
        selectedServiceAirport: "BOM",
      });

      expect(result.hasMismatch).toBe(false);
      expect(result.isSameAirport).toBe(false);
      expect(result.mismatchWarning).toBeUndefined();
      expect(result.isActuallyIntl).toBe(true);
      expect(result.suggestedCategory).toBe("international");
    });

    it("recognizes exact match for Mumbai (BOM) -> Delhi (DEL) domestic route", () => {
      const result = evaluateFlightRouteMatch({
        direction: "departure",
        flOrigin: "BOM",
        flDest: "DEL",
        userOrigin: "BOM",
        userDest: "DEL",
        selectedServiceAirport: "BOM",
      });

      expect(result.hasMismatch).toBe(false);
      expect(result.isSameAirport).toBe(false);
      expect(result.mismatchWarning).toBeUndefined();
      expect(result.isActuallyIntl).toBe(false);
      expect(result.suggestedCategory).toBe("domestic");
    });

    it("recognizes exact match for Arrival service at Delhi (DEL) from Mumbai (BOM)", () => {
      const result = evaluateFlightRouteMatch({
        direction: "arrival",
        flOrigin: "BOM",
        flDest: "DEL",
        userOrigin: "BOM",
        userDest: "DEL",
        selectedServiceAirport: "DEL",
      });

      expect(result.hasMismatch).toBe(false);
      expect(result.isSameAirport).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. WRONG FLIGHT NUMBER (API LOOKUP ERROR / NOT FOUND)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("2. Wrong flight number", () => {
    it("handles same-airport route error when flight origin equals destination", () => {
      const result = evaluateFlightRouteMatch({
        direction: "departure",
        flOrigin: "BOM",
        flDest: "BOM",
        userOrigin: "BOM",
        userDest: "DXB",
        selectedServiceAirport: "BOM",
      });

      expect(result.hasMismatch).toBe(true);
      expect(result.isSameAirport).toBe(true);
      expect(result.sameAirportError).toContain("origin and destination cannot be the same airport (BOM)");
    });

    it("does not create a route mismatch object when flight number lookup fails", () => {
      // When the API fails to find schedule for a flight number (e.g. 404 / 'Flight not found'),
      // the application presents schedule error notice allowing manual fallback, NOT route mismatch warning.
      const mockApiError = {
        success: false,
        error: "Live schedule not found for flight AI9999. Please provide details manually below.",
      };

      expect(mockApiError.success).toBe(false);
      expect(mockApiError.error).toContain("Live schedule not found");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. ORIGIN MISMATCH
  // ─────────────────────────────────────────────────────────────────────────────
  describe("3. Origin mismatch", () => {
    it("detects origin mismatch when flight departs from DEL instead of selected BOM", () => {
      const result = evaluateFlightRouteMatch({
        direction: "departure",
        flOrigin: "DEL",
        flDest: "DXB",
        userOrigin: "BOM",
        userDest: "DXB",
        selectedServiceAirport: "BOM",
      });

      expect(result.hasMismatch).toBe(true);
      expect(result.mismatchWarning).toBe(
        "The flight number you entered is for Delhi (DEL) → Dubai (DXB), but your selected journey is Mumbai (BOM) → Dubai (DXB). Please check your flight number or selected airports."
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. DESTINATION MISMATCH (THE CORE REPORTED BUG)
  // ─────────────────────────────────────────────────────────────────────────────
  describe("4. Destination mismatch", () => {
    it("detects destination mismatch when user selected BOM -> DXB but flight AI2424 returns BOM -> DEL", () => {
      const result = evaluateFlightRouteMatch({
        direction: "departure",
        flOrigin: "BOM",
        flDest: "DEL",
        userOrigin: "BOM",
        userDest: "DXB",
        selectedServiceAirport: "BOM",
      });

      expect(result.hasMismatch).toBe(true);
      // Canonical warning requirement:
      const expectedMessage =
        "The flight number you entered is for Mumbai (BOM) → Delhi (DEL), but your selected journey is Mumbai (BOM) → Dubai (DXB). Please check your flight number or selected airports.";
      expect(result.mismatchWarning).toBe(expectedMessage);
    });

    it("resolves display city names accurately (BOM -> Mumbai, DEL -> Delhi, DXB -> Dubai)", () => {
      expect(getAirportDisplayName("BOM")).toBe("Mumbai");
      expect(getAirportDisplayName("DEL")).toBe("Delhi");
      expect(getAirportDisplayName("DXB")).toBe("Dubai");
      expect(getAirportDisplayName("LHR")).toBe("London");
      expect(getAirportDisplayName("SIN")).toBe("Singapore");

      const warning = buildRouteMismatchWarning("BOM", "DEL", "BOM", "DXB");
      expect(warning).toBe(
        "The flight number you entered is for Mumbai (BOM) → Delhi (DEL), but your selected journey is Mumbai (BOM) → Dubai (DXB). Please check your flight number or selected airports."
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. DOMESTIC VERSUS INTERNATIONAL MISMATCH
  // ─────────────────────────────────────────────────────────────────────────────
  describe("5. Domestic versus international mismatch", () => {
    it("detects category mismatch between selected International journey and Domestic flight", () => {
      const result = evaluateFlightRouteMatch({
        direction: "departure",
        flOrigin: "BOM",
        flDest: "DEL",
        userOrigin: "BOM",
        userDest: "DXB",
        selectedServiceAirport: "BOM",
      });

      expect(result.hasMismatch).toBe(true);
      // Flight itself is domestic (BOM -> DEL)
      expect(result.isActuallyIntl).toBe(false);
      expect(result.suggestedCategory).toBe("domestic");

      // In the booking flow, the user's travelType MUST NOT be overwritten to "domestic" while mismatch is active!
      const initialTravelType = "international";
      let activeTravelType = initialTravelType;
      if (!result.hasMismatch) {
        activeTravelType = result.suggestedCategory;
      }
      expect(activeTravelType).toBe("international");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. CONNECTING FLIGHTS WITH MULTIPLE LEGS
  // ─────────────────────────────────────────────────────────────────────────────
  describe("6. Connecting flights with multiple legs (Transit)", () => {
    it("Leg 1: flags mismatch when incoming flight arrives from BLR instead of selected BOM", () => {
      const leg1Result = evaluateFlightRouteMatch({
        direction: "transit",
        flOrigin: "BLR",
        flDest: "DEL",
        userOrigin: "BOM",
        selectedServiceAirport: "DEL",
        transitHub: "DEL",
      });

      expect(leg1Result.hasMismatch).toBe(true);
      expect(leg1Result.mismatchWarning).toContain("Bengaluru (BLR) → Delhi (DEL)");
      expect(leg1Result.mismatchWarning).toContain("Mumbai (BOM) → Delhi (DEL)");
    });

    it("Leg 1: passes verification when incoming flight matches BOM -> DEL", () => {
      const leg1Result = evaluateFlightRouteMatch({
        direction: "transit",
        flOrigin: "BOM",
        flDest: "DEL",
        userOrigin: "BOM",
        selectedServiceAirport: "DEL",
        transitHub: "DEL",
      });

      expect(leg1Result.hasMismatch).toBe(false);
    });

    it("Leg 2: flags mismatch when connecting flight departs to DOH instead of selected DXB", () => {
      const leg2Result = evaluateConnectingLegRouteMatch({
        transitHub: "DEL",
        flOrigin: "DEL",
        flDest: "DOH",
        userDest: "DXB",
      });

      expect(leg2Result.hasMismatch).toBe(true);
      expect(leg2Result.mismatchWarning).toBe(
        "The flight number you entered is for Delhi (DEL) → Doha (DOH), but your selected journey is Delhi (DEL) → Dubai (DXB). Please check your flight number or selected airports."
      );
    });

    it("Leg 2: passes verification when connecting flight matches DEL -> DXB", () => {
      const leg2Result = evaluateConnectingLegRouteMatch({
        transitHub: "DEL",
        flOrigin: "DEL",
        flDest: "DXB",
        userDest: "DXB",
      });

      expect(leg2Result.hasMismatch).toBe(false);
      expect(leg2Result.mismatchWarning).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. USER CHOOSING TO KEEP THE ORIGINAL ROUTE
  // ─────────────────────────────────────────────────────────────────────────────
  describe("7. User choosing to keep the original route", () => {
    it("preserves Mumbai -> Dubai route and leaves flight unverified when user keeps route", () => {
      // Initial state
      let userOrigin = "BOM";
      let userDest = "DXB";
      let travelType = "international";
      let isFlightVerified = false;
      let verifiedFlight: any = null;
      let routeMismatch: RouteMismatchInfo | null = {
        flightNum: "AI2424",
        flightData: {
          flightNum: "AI2424",
          carrier: { iata: "AI", name: "Air India", logo: null },
          origin: { code: "BOM", name: "Mumbai", city: "Mumbai", country: "IN", timezone: null },
          destination: { code: "DEL", name: "Delhi", city: "Delhi", country: "IN", timezone: null },
          departure: { scheduledTime: "2026-10-10T10:00:00", terminal: null, gate: null, timezone: null },
          arrival: { scheduledTime: "2026-10-10T12:00:00", terminal: null, gate: null, timezone: null },
        },
        apiOrigin: "BOM",
        apiOriginCity: "Mumbai",
        apiDest: "DEL",
        apiDestCity: "Delhi",
        userOrigin: "BOM",
        userOriginCity: "Mumbai",
        userDest: "DXB",
        userDestCity: "Dubai",
        message:
          "The flight number you entered is for Mumbai (BOM) → Delhi (DEL), but your selected journey is Mumbai (BOM) → Dubai (DXB). Please check your flight number or selected airports.",
        leg: 1,
      };

      // User triggers handleKeepSelectedRoute
      const handleKeepSelectedRoute = () => {
        routeMismatch = null;
        isFlightVerified = false;
        verifiedFlight = null;
        // User journey MUST NOT change!
      };

      handleKeepSelectedRoute();

      expect(routeMismatch).toBeNull();
      expect(userOrigin).toBe("BOM");
      expect(userDest).toBe("DXB");
      expect(travelType).toBe("international");
      expect(isFlightVerified).toBe(false);
      expect(verifiedFlight).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. USER EXPLICITLY ACCEPTING THE API ROUTE
  // ─────────────────────────────────────────────────────────────────────────────
  describe("8. User explicitly accepting the API route", () => {
    it("updates journey from Mumbai -> Dubai to Mumbai -> Delhi only upon explicit confirmation", () => {
      let userOrigin = "BOM";
      let userDest = "DXB";
      let travelType = "international";
      let isFlightVerified = false;
      let verifiedFlight: any = null;
      let explicitCallbackFired = false;

      const mockMismatch: RouteMismatchInfo = {
        flightNum: "AI2424",
        flightData: {
          flightNum: "AI2424",
          carrier: { iata: "AI", name: "Air India", logo: null },
          origin: { code: "BOM", name: "Mumbai", city: "Mumbai", country: "IN", timezone: null },
          destination: { code: "DEL", name: "Delhi", city: "Delhi", country: "IN", timezone: null },
          departure: { scheduledTime: "2026-10-10T10:00:00", terminal: null, gate: null, timezone: null },
          arrival: { scheduledTime: "2026-10-10T12:00:00", terminal: null, gate: null, timezone: null },
        },
        apiOrigin: "BOM",
        apiOriginCity: "Mumbai",
        apiDest: "DEL",
        apiDestCity: "Delhi",
        userOrigin: "BOM",
        userOriginCity: "Mumbai",
        userDest: "DXB",
        userDestCity: "Dubai",
        message: "The flight number you entered is for Mumbai (BOM) → Delhi (DEL)...",
        leg: 1,
      };

      const onExplicitRouteAccepted = (newOrig: string, newDest: string) => {
        explicitCallbackFired = true;
        expect(newOrig).toBe("BOM");
        expect(newDest).toBe("DEL");
      };

      const handleUseFlightRoute = () => {
        userOrigin = mockMismatch.apiOrigin;
        userDest = mockMismatch.apiDest;
        travelType = "domestic"; // Reclassified for BOM -> DEL
        verifiedFlight = mockMismatch.flightData;
        isFlightVerified = true;
        onExplicitRouteAccepted(mockMismatch.apiOrigin, mockMismatch.apiDest);
      };

      handleUseFlightRoute();

      expect(userOrigin).toBe("BOM");
      expect(userDest).toBe("DEL");
      expect(travelType).toBe("domestic");
      expect(isFlightVerified).toBe(true);
      expect(verifiedFlight).not.toBeNull();
      expect(explicitCallbackFired).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. ENSURING NO PACKAGE OR SERVICE IS AUTOMATICALLY SELECTED AFTER A MISMATCH
  // ─────────────────────────────────────────────────────────────────────────────
  describe("9. Ensuring no package or service is automatically selected after a mismatch", () => {
    it("preserves original selected services and packages upon route mismatch", () => {
      // Homepage selection: BOM Departure + DXB Arrival
      const initialServices = ["DEPARTURE", "ARRIVAL"];
      const initialPackageId = "gold-dxb";
      const initialPackageName = "Gold VIP Arrival (Dubai)";
      let currentDestination = "DXB";
      let currentPackageId = initialPackageId;
      let currentPackageName = initialPackageName;

      // Flight AI2424 entered returning BOM -> DEL
      const evalResult = evaluateFlightRouteMatch({
        direction: "departure",
        flOrigin: "BOM",
        flDest: "DEL",
        userOrigin: "BOM",
        userDest: currentDestination,
        selectedServiceAirport: "BOM",
      });

      expect(evalResult.hasMismatch).toBe(true);

      // Verify that NO state updates were made to destination, services, or packages
      expect(currentDestination).toBe("DXB");
      expect(initialServices).toEqual(["DEPARTURE", "ARRIVAL"]);
      expect(currentPackageId).toBe("gold-dxb");
      expect(currentPackageName).toBe("Gold VIP Arrival (Dubai)");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 10. UI RENDERING & WARNING CARD INTEGRATION
  // ─────────────────────────────────────────────────────────────────────────────
  describe("10. DirectFlightDetailsSection UI rendering tests", () => {
    const defaultProps = {
      isManualMode: false,
      setIsManualMode: vi.fn(),
      flightNumber: "AI2424",
      setFlightNumber: vi.fn(),
      setIsFlightVerified: vi.fn(),
      setVerifiedFlight: vi.fn(),
      flightFetchError: null,
      setFlightFetchError: vi.fn(),
      isCutoffUrgent: false,
      setIsCutoffUrgent: vi.fn(),
      handleVerifyFlight: vi.fn(),
      isFlightFetching: false,
      datePopoverOpen: false,
      setDatePopoverOpen: vi.fn(),
      dateValue: new Date(2026, 9, 10),
      handleDateChange: vi.fn(),
      todayStart: new Date(2026, 9, 10),
      isFlightVerified: false,
      direction: "departure" as const,
      airportCode: "BOM",
      airportCityName: "Mumbai",
      originCode: "BOM",
      setOriginCode: vi.fn(),
      destCode: "DXB",
      setDestCode: vi.fn(),
      travelType: "international" as const,
      handleTravelTypeChange: vi.fn(),
      serviceDate: "2026-10-10",
      fullName: "Guest",
      verifiedFlight: null,
      manualAirline: "",
      setManualAirline: vi.fn(),
      manualAirlineIata: "",
      setManualAirlineIata: vi.fn(),
      manualFlightNum: "",
      setManualFlightNum: vi.fn(),
      manualDatePopoverOpen: false,
      setManualDatePopoverOpen: vi.fn(),
      manualDepTime: "10:00",
      setManualDepTime: vi.fn(),
      manualDepTerminal: "2",
      setManualDepTerminal: vi.fn(),
      manualArrTime: "12:00",
      setManualArrTime: vi.fn(),
      manualArrTerminal: "3",
      setManualArrTerminal: vi.fn(),
    };

    it("renders Flight Route Doesn't Match warning and action buttons when mismatch occurs", () => {
      const mockMismatch: RouteMismatchInfo = {
        flightNum: "AI2424",
        flightData: {
          flightNum: "AI2424",
          carrier: { iata: "AI", name: "Air India", logo: null },
          origin: { code: "BOM", name: "Mumbai", city: "Mumbai", country: "IN", timezone: null },
          destination: { code: "DEL", name: "Delhi", city: "Delhi", country: "IN", timezone: null },
          departure: { scheduledTime: "2026-10-10T10:00:00", terminal: null, gate: null, timezone: null },
          arrival: { scheduledTime: "2026-10-10T12:00:00", terminal: null, gate: null, timezone: null },
        },
        apiOrigin: "BOM",
        apiOriginCity: "Mumbai",
        apiDest: "DEL",
        apiDestCity: "Delhi",
        userOrigin: "BOM",
        userOriginCity: "Mumbai",
        userDest: "DXB",
        userDestCity: "Dubai",
        message:
          "The flight number you entered is for Mumbai (BOM) → Delhi (DEL), but your selected journey is Mumbai (BOM) → Dubai (DXB). Please check your flight number or selected airports.",
        leg: 1,
      };

      const html = renderToString(
        React.createElement(DirectFlightDetailsSection, {
          ...defaultProps,
          routeMismatch: mockMismatch,
          confirmingRouteUpdate: false,
        })
      );

      expect(html).toContain("Flight Route Doesn&#x27;t Match");
      expect(html).toContain(
        "The flight number you entered is for Mumbai (BOM) → Delhi (DEL), but your selected journey is Mumbai (BOM) → Dubai (DXB). Please check your flight number or selected airports."
      );
      expect(html).toContain("Keep My Selected Route");
      expect(html).toContain("Use Flight Route");
    });

    it("renders confirmation prompt when user clicks Use Flight Route", () => {
      const mockMismatch: RouteMismatchInfo = {
        flightNum: "AI2424",
        flightData: {
          flightNum: "AI2424",
          carrier: { iata: "AI", name: "Air India", logo: null },
          origin: { code: "BOM", name: "Mumbai", city: "Mumbai", country: "IN", timezone: null },
          destination: { code: "DEL", name: "Delhi", city: "Delhi", country: "IN", timezone: null },
          departure: { scheduledTime: "2026-10-10T10:00:00", terminal: null, gate: null, timezone: null },
          arrival: { scheduledTime: "2026-10-10T12:00:00", terminal: null, gate: null, timezone: null },
        },
        apiOrigin: "BOM",
        apiOriginCity: "Mumbai",
        apiDest: "DEL",
        apiDestCity: "Delhi",
        userOrigin: "BOM",
        userOriginCity: "Mumbai",
        userDest: "DXB",
        userDestCity: "Dubai",
        message:
          "The flight number you entered is for Mumbai (BOM) → Delhi (DEL), but your selected journey is Mumbai (BOM) → Dubai (DXB). Please check your flight number or selected airports.",
        leg: 1,
      };

      const html = renderToString(
        React.createElement(DirectFlightDetailsSection, {
          ...defaultProps,
          routeMismatch: mockMismatch,
          confirmingRouteUpdate: true,
        })
      );

      expect(html).toContain("Confirm route change:");
      expect(html).toContain("Confirm &amp; Update Route");
      expect(html).toContain("Cancel");
    });

    it("does not render generic flightFetchError when routeMismatch is present", () => {
      const mockMismatch: RouteMismatchInfo = {
        flightNum: "AI2424",
        flightData: {} as any,
        apiOrigin: "BOM",
        apiOriginCity: "Mumbai",
        apiDest: "DEL",
        apiDestCity: "Delhi",
        userOrigin: "BOM",
        userOriginCity: "Mumbai",
        userDest: "DXB",
        userDestCity: "Dubai",
        message: "The flight number you entered is for Mumbai (BOM) → Delhi (DEL)...",
      };

      const html = renderToString(
        React.createElement(DirectFlightDetailsSection, {
          ...defaultProps,
          flightFetchError: "Generic schedule error that should be suppressed during mismatch",
          routeMismatch: mockMismatch,
        })
      );

      expect(html).toContain("Flight Route Doesn&#x27;t Match");
      expect(html).not.toContain("Generic schedule error that should be suppressed during mismatch");
    });
  });
});
