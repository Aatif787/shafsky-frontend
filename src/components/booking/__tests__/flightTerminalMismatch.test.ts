import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { normalizeTerminalName } from "../airport/utils";
import { DirectFlightDetailsSection } from "../airport/DirectFlightDetailsSection";
import { TerminalMismatchInfo } from "../airport/types";
import { FlightData } from "@/services/flight/FlightTypes";

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

describe("Terminal Mismatch Detection & Resolution Engine", () => {
  describe("1. normalizeTerminalName utility", () => {
    it("correctly normalizes Terminal 1 & 2 representations", () => {
      expect(normalizeTerminalName("1")).toBe("Terminal 1 & 2");
      expect(normalizeTerminalName("2")).toBe("Terminal 1 & 2");
      expect(normalizeTerminalName("T1")).toBe("Terminal 1 & 2");
      expect(normalizeTerminalName("T2")).toBe("Terminal 1 & 2");
      expect(normalizeTerminalName("Terminal 1")).toBe("Terminal 1 & 2");
      expect(normalizeTerminalName("Terminal 2")).toBe("Terminal 1 & 2");
      expect(normalizeTerminalName("Terminal 1 & 2")).toBe("Terminal 1 & 2");
      expect(normalizeTerminalName("T1 & T2")).toBe("Terminal 1 & 2");
      expect(normalizeTerminalName("T1_T2")).toBe("Terminal 1 & 2");
    });

    it("correctly normalizes Terminal 3 representations", () => {
      expect(normalizeTerminalName("3")).toBe("Terminal 3");
      expect(normalizeTerminalName("T3")).toBe("Terminal 3");
      expect(normalizeTerminalName("Terminal 3")).toBe("Terminal 3");
      expect(normalizeTerminalName("TERMINAL 3")).toBe("Terminal 3");
    });

    it("handles empty or other values safely", () => {
      expect(normalizeTerminalName("")).toBe("");
      expect(normalizeTerminalName(null)).toBe("");
      expect(normalizeTerminalName(undefined)).toBe("");
      expect(normalizeTerminalName("Terminal 4")).toBe("Terminal 4");
    });
  });

  describe("2. Terminal mismatch evaluation scenarios", () => {
    it("flags mismatch when flight is at T3 and selected terminal is T1 & 2", () => {
      const selectedTerminal = "Terminal 1 & 2";
      const flightTerminal = "3"; // e.g. AI2424 BOM -> DEL arriving at T3
      const normSelected = normalizeTerminalName(selectedTerminal);
      const normFlight = normalizeTerminalName(flightTerminal);

      expect(normSelected).toBe("Terminal 1 & 2");
      expect(normFlight).toBe("Terminal 3");
      expect(normSelected !== normFlight).toBe(true);
    });

    it("flags mismatch when flight is at T1/T2 and selected terminal is T3", () => {
      const selectedTerminal = "Terminal 3";
      const flightTerminal = "2"; // e.g. 6E flight at T2
      const normSelected = normalizeTerminalName(selectedTerminal);
      const normFlight = normalizeTerminalName(flightTerminal);

      expect(normSelected).toBe("Terminal 3");
      expect(normFlight).toBe("Terminal 1 & 2");
      expect(normSelected !== normFlight).toBe(true);
    });

    it("does not flag mismatch when terminals match", () => {
      const selectedTerminal = "Terminal 3";
      const flightTerminal = "T3";
      const normSelected = normalizeTerminalName(selectedTerminal);
      const normFlight = normalizeTerminalName(flightTerminal);

      expect(normSelected === normFlight).toBe(true);
    });
  });

  describe("3. DirectFlightDetailsSection Terminal Mismatch UI Rendering", () => {
    const mockVerifiedFlight: FlightData = {
      flightNum: "AI2424",
      carrier: { iata: "AI", name: "Air India", logo: null },
      origin: { code: "BOM", name: "Chhatrapati Shivaji Maharaj", city: "Mumbai", country: "India", timezone: "Asia/Kolkata" },
      destination: { code: "DEL", name: "Indira Gandhi International", city: "New Delhi", country: "India", timezone: "Asia/Kolkata" },
      departure: { scheduledTime: "2026-11-04T07:00:00", actualTime: null, estimatedTime: null, terminal: "2", gate: null, timezone: "Asia/Kolkata", checkinCounter: null },
      arrival: { scheduledTime: "2026-11-04T09:15:00", actualTime: null, estimatedTime: null, terminal: "3", gate: null, timezone: "Asia/Kolkata", baggageBelt: null },
    };

    const mockTerminalMismatch: TerminalMismatchInfo = {
      flightNum: "AI2424",
      airportCode: "DEL",
      airportName: "Delhi Airport (DEL)",
      selectedTerminal: "Terminal 1 & 2",
      detectedTerminal: "Terminal 3",
      rawDetectedTerminal: "3",
      canUpgradeToGold: true,
      priceDifferenceInr: 0,
      actionLabel: "Switch to Terminal 3 (No Extra Charge)",
    };

    const baseProps = {
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
      dateValue: new Date(2026, 10, 4),
      handleDateChange: vi.fn(),
      todayStart: new Date(2026, 10, 1),
      isFlightVerified: true,
      direction: "arrival" as const,
      airportCode: "DEL",
      airportCityName: "New Delhi",
      originCode: "BOM",
      setOriginCode: vi.fn(),
      destCode: "DEL",
      setDestCode: vi.fn(),
      travelType: "domestic" as const,
      handleTravelTypeChange: vi.fn(),
      serviceDate: "2026-11-04",
      fullName: "Test Passenger",
      verifiedFlight: mockVerifiedFlight,
      manualAirline: "",
      setManualAirline: vi.fn(),
      manualAirlineIata: "",
      setManualAirlineIata: vi.fn(),
      manualFlightNum: "",
      setManualFlightNum: vi.fn(),
      manualDatePopoverOpen: false,
      setManualDatePopoverOpen: vi.fn(),
      manualDepTime: "",
      setManualDepTime: vi.fn(),
      manualDepTerminal: "",
      setManualDepTerminal: vi.fn(),
      manualArrTime: "",
      setManualArrTime: vi.fn(),
      manualArrTerminal: "",
      setManualArrTerminal: vi.fn(),
    };

    it("renders terminal mismatch banner with upgrade option when mismatch exists and not dismissed", () => {
      const html = renderToString(
        React.createElement(DirectFlightDetailsSection, {
          ...baseProps,
          terminalMismatch: mockTerminalMismatch,
          terminalNoticeDismissed: false,
        })
      );

      expect(html).toContain("terminal-mismatch-banner");
      expect(html).toMatch(/Flight Operating Terminal Notice:.*Terminal 3.*Detected/);
      expect(html).toContain("Switch to Terminal 3 (No Extra Charge)");
      expect(html).toMatch(/Upgrade to Gold.*3,500/);
      expect(html).toMatch(/Keep.*Terminal 1/);
    });

    it("does not render terminal mismatch banner when dismissed", () => {
      const html = renderToString(
        React.createElement(DirectFlightDetailsSection, {
          ...baseProps,
          terminalMismatch: mockTerminalMismatch,
          terminalNoticeDismissed: true,
        })
      );

      expect(html).not.toContain("terminal-mismatch-banner");
    });

    it("renders cost savings action when switching from T3 to T1/T2", () => {
      const savingsMismatch: TerminalMismatchInfo = {
        flightNum: "6E2045",
        airportCode: "DEL",
        airportName: "Delhi Airport (DEL)",
        selectedTerminal: "Terminal 3",
        detectedTerminal: "Terminal 1 & 2",
        rawDetectedTerminal: "2",
        canUpgradeToGold: false,
        priceDifferenceInr: -500,
        actionLabel: "Switch to Terminal 1 & 2 (Save ₹500 / guest)",
      };

      const html = renderToString(
        React.createElement(DirectFlightDetailsSection, {
          ...baseProps,
          terminalMismatch: savingsMismatch,
          terminalNoticeDismissed: false,
        })
      );

      expect(html).toContain("terminal-mismatch-banner");
      expect(html).toMatch(/Switch to Terminal 1.*Save/);
      expect(html).not.toContain("Upgrade to Gold");
      expect(html).toMatch(/Keep.*Terminal 3/);
    });
  });
});
