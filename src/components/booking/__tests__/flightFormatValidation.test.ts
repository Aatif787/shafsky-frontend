import { describe, it, expect, vi, beforeEach } from "vitest";
import { isValidFlightNumber, sanitizeFlightInput } from "../airport/utils";

describe("Flight Number Format & Pre-Verification Validation", () => {
  describe("isValidFlightNumber", () => {
    it("rejects arbitrary long strings and gibberish (e.g. 0JHHSDSKDSIJD)", () => {
      expect(isValidFlightNumber("0JHHSDSKDSIJD")).toBe(false);
      expect(isValidFlightNumber("RANDOMSTRING")).toBe(false);
      expect(isValidFlightNumber("NOT_A_FLIGHT")).toBe(false);
      expect(isValidFlightNumber("TEST123456789")).toBe(false);
    });

    it("rejects strings without airline codes or without numbers", () => {
      expect(isValidFlightNumber("12345")).toBe(false);
      expect(isValidFlightNumber("AI")).toBe(false);
      expect(isValidFlightNumber("INDIGO")).toBe(false);
      expect(isValidFlightNumber("")).toBe(false);
      expect(isValidFlightNumber("???")).toBe(false);
      expect(isValidFlightNumber("1234")).toBe(false);
    });

    it("accepts valid commercial flight numbers (IATA: 2 chars + 1-4 digits)", () => {
      expect(isValidFlightNumber("AI101")).toBe(true);
      expect(isValidFlightNumber("6E202")).toBe(true);
      expect(isValidFlightNumber("EK504")).toBe(true);
      expect(isValidFlightNumber("BA117")).toBe(true);
      expect(isValidFlightNumber("QP1301")).toBe(true);
      expect(isValidFlightNumber("SG8168")).toBe(true);
      expect(isValidFlightNumber("UK995")).toBe(true);
      expect(isValidFlightNumber("6E1")).toBe(true);
      expect(isValidFlightNumber("AI995A")).toBe(true); // Optional operational suffix
    });

    it("accepts valid commercial flight numbers with spaces or hyphens", () => {
      expect(isValidFlightNumber("AI 101")).toBe(true);
      expect(isValidFlightNumber("6E-202")).toBe(true);
      expect(isValidFlightNumber("ek 504")).toBe(true);
    });

    it("accepts valid commercial flight numbers with 3-letter ICAO codes", () => {
      expect(isValidFlightNumber("AIC101")).toBe(true);
      expect(isValidFlightNumber("IGO202")).toBe(true);
      expect(isValidFlightNumber("UAE504")).toBe(true);
    });
  });

  describe("sanitizeFlightInput", () => {
    it("strips whitespace and hyphens and converts to uppercase", () => {
      expect(sanitizeFlightInput("ai 101")).toBe("AI101");
      expect(sanitizeFlightInput("6e-202")).toBe("6E202");
    });

    it("translates known 3-letter ICAO airline codes to 2-letter IATA codes", () => {
      expect(sanitizeFlightInput("AIC101")).toBe("AI101");
      expect(sanitizeFlightInput("IGO202")).toBe("6E202");
      expect(sanitizeFlightInput("UAE504")).toBe("EK504");
    });
  });
});
