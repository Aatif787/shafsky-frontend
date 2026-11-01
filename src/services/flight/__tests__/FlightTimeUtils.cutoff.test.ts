import { describe, it, expect } from "vitest";
import { checkBookingEligibility } from "../FlightTimeUtils";

describe("Meet & Greet Cutoff Times - FlightTimeUtils", () => {
  it("allows domestic booking with 6 hours or more notice", () => {
    const futureDate = new Date(Date.now() + 6.5 * 3600 * 1000).toISOString();
    const result = checkBookingEligibility(futureDate, "DEL", "one_way", 6, false);
    expect(result.isBookable).toBe(true);
    expect(result.blockingMessage).toBeUndefined();
  });

  it("blocks domestic booking with less than 6 hours notice and displays exact cutoff wording", () => {
    const soonDate = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString();
    const result = checkBookingEligibility(soonDate, "DEL", "one_way", 6, false);
    expect(result.isBookable).toBe(false);
    expect(result.blockingMessage).toContain("Airport services need at least 6 hours before departure (domestic)");
  });

  it("allows international booking with 12 hours or more notice", () => {
    const futureDate = new Date(Date.now() + 12.5 * 3600 * 1000).toISOString();
    const result = checkBookingEligibility(futureDate, "DEL", "one_way", 12, false);
    expect(result.isBookable).toBe(true);
    expect(result.blockingMessage).toBeUndefined();
  });

  it("blocks international booking with less than 12 hours notice and displays exact cutoff wording", () => {
    const soonDate = new Date(Date.now() + 11.5 * 3600 * 1000).toISOString();
    const result = checkBookingEligibility(soonDate, "DEL", "one_way", 12, false);
    expect(result.isBookable).toBe(false);
    expect(result.blockingMessage).toContain("Airport services need at least 12 hours before departure (international)");
  });

  it("defaults threshold to 6 hours when threshold is omitted", () => {
    const soonDate = new Date(Date.now() + 5 * 3600 * 1000).toISOString();
    const result = checkBookingEligibility(soonDate, "DEL", "one_way");
    expect(result.isBookable).toBe(false);
    expect(result.blockingMessage).toContain("at least 6 hours");
  });
});
