import { describe, it, expect } from "vitest";
import { validateFlightEvent, parseFlightDateTime } from "../FlightTimeUtils";

describe("Past Flight & Event Verification - validateFlightEvent", () => {
  // Reference time: 2026-11-01 11:40:00 IST (06:10:00 UTC)
  // BOM local time is UTC+05:30
  const mockNow = new Date("2026-11-01T06:10:00.000Z");

  it("1. Future flight beyond cutoff is bookable and allowed", () => {
    // Flight departs tomorrow 2026-11-02 at 14:00 BOM (over 24 hours away)
    const res = validateFlightEvent({
      scheduledTime: "2026-11-02T14:00:00",
      airportIata: "BOM",
      direction: "departure",
      serviceDate: "2026-11-02",
      travelType: "domestic",
      referenceNow: mockNow,
    });

    expect(res.isBookable).toBe(true);
    expect(res.isPast).toBe(false);
    expect(res.isCutoffViolated).toBe(false);
    expect(res.blockingMessage).toBeUndefined();
    expect(res.remainingHours).toBeGreaterThan(20);
  });

  it("2. Same-day flight with departure time in the past is strictly BLOCKED for Departure", () => {
    // Current time: 11:40 AM IST. AI2424 was scheduled at 07:00 AM IST on same day.
    const res = validateFlightEvent({
      scheduledTime: "2026-11-01T07:00:00",
      airportIata: "BOM",
      direction: "departure",
      serviceDate: "2026-11-01",
      travelType: "domestic",
      referenceNow: mockNow,
    });

    expect(res.isBookable).toBe(false);
    expect(res.isPast).toBe(true);
    expect(res.isCutoffViolated).toBe(false);
    expect(res.blockingMessage).toBe("This flight has already departed. Please select a future flight.");
  });

  it("3. Same-day flight with arrival time in the past is strictly BLOCKED for Arrival", () => {
    // Current time: 11:40 AM IST. AI2424 arrived at 09:15 AM IST at DEL on same day.
    const res = validateFlightEvent({
      scheduledTime: "2026-11-01T09:15:00",
      airportIata: "DEL",
      direction: "arrival",
      serviceDate: "2026-11-01",
      travelType: "domestic",
      referenceNow: mockNow,
    });

    expect(res.isBookable).toBe(false);
    expect(res.isPast).toBe(true);
    expect(res.isCutoffViolated).toBe(false);
    expect(res.blockingMessage).toBe("This flight has already arrived. Please select a future flight.");
  });

  it("4. Flight on a previous date is strictly BLOCKED", () => {
    // Flight on yesterday 2026-10-31
    const res = validateFlightEvent({
      scheduledTime: "2026-10-31T20:00:00",
      airportIata: "BOM",
      direction: "departure",
      serviceDate: "2026-10-31",
      travelType: "domestic",
      referenceNow: mockNow,
    });

    expect(res.isBookable).toBe(false);
    expect(res.isPast).toBe(true);
    expect(res.blockingMessage).toBe("This flight has already departed. Please select a future flight.");
  });

  it("5. Live flight status Landed blocks Arrival and Departure", () => {
    // Flight is nominally scheduled in future, but live status indicates Landed
    const resDep = validateFlightEvent({
      scheduledTime: "2026-11-01T15:00:00",
      airportIata: "BOM",
      direction: "departure",
      serviceDate: "2026-11-01",
      travelType: "domestic",
      flightStatus: "Landed",
      referenceNow: mockNow,
    });

    expect(resDep.isBookable).toBe(false);
    expect(resDep.isPast).toBe(true);
    expect(resDep.blockingMessage).toBe("This flight has already departed. Please select a future flight.");

    const resArr = validateFlightEvent({
      scheduledTime: "2026-11-01T15:00:00",
      airportIata: "DEL",
      direction: "arrival",
      serviceDate: "2026-11-01",
      travelType: "domestic",
      flightStatus: "Landed",
      referenceNow: mockNow,
    });

    expect(resArr.isBookable).toBe(false);
    expect(resArr.isPast).toBe(true);
    expect(resArr.blockingMessage).toBe("This flight has already arrived. Please select a future flight.");
  });

  it("6. Live flight status Departed or In-Air blocks Departure", () => {
    const res = validateFlightEvent({
      scheduledTime: "2026-11-01T12:00:00",
      airportIata: "BOM",
      direction: "departure",
      serviceDate: "2026-11-01",
      travelType: "domestic",
      flightStatus: "Active",
      referenceNow: mockNow,
    });

    expect(res.isBookable).toBe(false);
    expect(res.isPast).toBe(true);
    expect(res.blockingMessage).toBe("This flight has already departed. Please select a future flight.");
  });

  it("7. Overnight flight crossing midnight correctly handles date rollover", () => {
    // Flight departs 2026-11-01 23:00 IST and arrives next day 2026-11-02 02:30 IST
    // Current time: 2026-11-01 11:40 IST
    const resArr = validateFlightEvent({
      scheduledTime: "02:30:00",
      airportIata: "DEL",
      direction: "arrival",
      serviceDate: "2026-11-01",
      travelType: "domestic",
      isArrivalNextDay: true,
      referenceNow: mockNow,
    });

    expect(resArr.isPast).toBe(false);
    expect(resArr.isBookable).toBe(true);
    expect(resArr.eventDate?.toISOString()).toContain("2026-11-01T21:00:00"); // 02:30 IST next day is 21:00 UTC same day
  });

  it("8. Timezone boundary: DXB (UTC+4) vs IST (UTC+5:30)", () => {
    // DXB departure at 09:30 AM GST (UTC+4).
    // In UTC, 09:30 GST is 05:30 UTC.
    // Our mockNow is 06:10 UTC (which is 10:10 GST).
    // So 09:30 GST has already departed!
    const resDxb = validateFlightEvent({
      scheduledTime: "2026-11-01T09:30:00",
      airportIata: "DXB",
      direction: "departure",
      serviceDate: "2026-11-01",
      travelType: "international",
      referenceNow: mockNow,
    });

    expect(resDxb.isBookable).toBe(false);
    expect(resDxb.isPast).toBe(true);
    expect(resDxb.blockingMessage).toBe("This flight has already departed. Please select a future flight.");

    // However, DXB departure at 11:30 AM GST (UTC+4) is 07:30 UTC (in future by 1.33h, but violates 12h cutoff).
    const resDxbFuture = validateFlightEvent({
      scheduledTime: "2026-11-01T11:30:00",
      airportIata: "DXB",
      direction: "departure",
      serviceDate: "2026-11-01",
      travelType: "international",
      referenceNow: mockNow,
    });

    expect(resDxbFuture.isPast).toBe(false);
    expect(resDxbFuture.isCutoffViolated).toBe(true);
    expect(resDxbFuture.isBookable).toBe(false);
    expect(resDxbFuture.blockingMessage).toContain("Airport services need at least 12 hours before departure (international)");
  });

  it("9. Transit booking is blocked if incoming arrival or connecting departure is past", () => {
    const resTransit = validateFlightEvent({
      scheduledTime: "2026-11-01T08:00:00",
      airportIata: "BOM",
      direction: "transit",
      serviceDate: "2026-11-01",
      travelType: "domestic",
      referenceNow: mockNow,
    });

    expect(resTransit.isBookable).toBe(false);
    expect(resTransit.isPast).toBe(true);
    expect(resTransit.blockingMessage).toBe("This flight has already arrived/departed. Please select a future flight.");
  });

  it("10. Missing schedule time returns clear rejection", () => {
    const res = validateFlightEvent({
      scheduledTime: "",
      airportIata: "BOM",
      direction: "departure",
      referenceNow: mockNow,
    });

    expect(res.isBookable).toBe(false);
    expect(res.blockingMessage).toContain("Flight schedule time is required");
  });
});
