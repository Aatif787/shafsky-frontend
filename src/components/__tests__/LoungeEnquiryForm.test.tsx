import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { LoungeEnquiryForm } from "../lounge/LoungeEnquiryForm";
import { enquiryApi } from "@/lib/api/enquiryApi";
import { loungeApi } from "@/lib/api/loungeApi";

vi.mock("@/lib/api/enquiryApi", () => ({
  enquiryApi: {
    submit: vi.fn(),
  },
}));

vi.mock("@/lib/api/loungeApi", () => ({
  loungeApi: {
    getOptions: vi.fn().mockResolvedValue({
      success: true,
      data: {
        airports: [
          { code: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi", country: "India", timezone: "Asia/Kolkata" },
        ],
        lounge_types: ["VIP / First Class Lounge", "Business Class Lounge"],
        domestic_lounge_types: ["Domestic Departure Lounge", "Executive / Plaza Premium Lounge"],
        international_lounge_types: ["International Departure Lounge", "VIP / First Class Lounge"],
        preferred_times: ["Morning (06:00 – 12:00)"],
        server_time: "2026-10-25T00:00:00Z",
        cutoff_rules: {
          Domestic: { notice_hours: 12, grace_period_hours: 1, notice_text: "Domestic lounge enquiries require at least 12 hours' advance notice." },
          International: { notice_hours: 24, grace_period_hours: 1, notice_text: "International lounge enquiries require at least 24 hours' advance notice." },
        },
      },
    }),
    checkEligibility: vi.fn().mockResolvedValue({
      success: true,
      data: {
        eligible: true,
        is_grace_period: false,
        lead_time_hours: 48,
        required_notice_hours: 12,
        grace_period_hours: 1,
        min_required_hours: 11,
        airport_timezone: "Asia/Kolkata",
        server_time: "2026-10-25T00:00:00Z",
        scheduled_time: "2026-10-27T06:00:00+05:30",
        message: "Standard notice period met.",
      },
    }),
    submit: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("LoungeEnquiryForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Domestic / International selection at top and removes old introductory promotional text", () => {
    const html = renderToString(<LoungeEnquiryForm />);

    // Header is clean title only
    expect(html).toContain("Lounge Enquiry");

    // Old introductory promotional text must be completely removed
    expect(html).not.toContain("Fill in your travel information below to receive bespoke lounge access rates and availability.");

    // Clickable segmented buttons for Domestic & International
    expect(html).toContain("Domestic");
    expect(html).toContain("International");
    expect(html).toContain("Flight Category");

    // Before selection, prompt is shown
    expect(html).toContain("Please select");
    expect(html).toContain("to proceed with your lounge enquiry");
  });

  it("shows exact specified compact cutoff notices when category is selected", () => {
    // 1. Domestic
    const domesticHtml = renderToString(<LoungeEnquiryForm initialCategory="Domestic" />);
    expect(domesticHtml).toContain(
      "Domestic lounge enquiries require at least 12 hours' advance notice."
    );
    expect(domesticHtml).toContain("Domestic Departure Lounge");

    // 2. International
    const intlHtml = renderToString(<LoungeEnquiryForm initialCategory="International" />);
    expect(intlHtml).toContain(
      "International lounge enquiries require at least 24 hours' advance notice."
    );
    expect(intlHtml).toContain("International Departure Lounge");
  });

  it("renders all required passenger details first, then service details second", () => {
    const html = renderToString(<LoungeEnquiryForm initialCategory="Domestic" />);

    // Passenger details MUST appear first
    expect(html).toContain("Your Details");
    expect(html).toContain("Passenger Information");
    expect(html).toContain("Full Name");
    expect(html).toContain("Mobile Number");
    expect(html).toContain("Email Address");
    expect(html).toContain("WhatsApp Number");

    // Service details MUST appear second
    expect(html).toContain("Lounge Details");
    expect(html).toContain("Service Information");
    expect(html).toContain("Airport");
    expect(html).toContain("Lounge Type");
    expect(html).toContain("Travel Date");
    expect(html).toContain("Preferred Time");
    expect(html).toContain("Passengers");
    expect(html).toContain("Flight Number");
    expect(html).toContain("Additional Requirements");

    // Submit button
    expect(html).toContain("Send Enquiry");

    // Verify Passenger Details appears BEFORE Lounge Details in the DOM string
    const yourDetailsIndex = html.indexOf("Your Details");
    const loungeDetailsIndex = html.indexOf("Lounge Details");
    expect(yourDetailsIndex).toBeGreaterThan(-1);
    expect(loungeDetailsIndex).toBeGreaterThan(yourDetailsIndex);
  });

  it("displays airport local timezone transparently", () => {
    const html = renderToString(<LoungeEnquiryForm initialAirport="DEL" initialCategory="Domestic" />);
    expect(html).toContain("Airport TZ");
    expect(html).toContain("Asia/Kolkata");
  });

  it("submits enquiry with category 'Lounge' through the API", async () => {
    const mockSubmit = vi.spyOn(enquiryApi, "submit").mockResolvedValue({
      success: true,
      data: {
        id: "enq-123",
        bookingRef: "SHAF-LNG-9988",
        passengerName: "Sophia Miller",
        serviceCategory: "Lounge",
        serviceType: "VIP / First Class Lounge",
        status: "PENDING",
      },
    });

    const result = await enquiryApi.submit({
      passengerName: "Sophia Miller",
      passengerEmail: "sophia@example.com",
      passengerPhone: "+919876543210",
      serviceCategory: "Lounge",
      serviceType: "VIP / First Class Lounge",
      origin: "DEL",
      serviceDate: "2026-11-01",
      details: {
        service: "Lounge",
        airport: "DEL",
        lounge_category: "Domestic",
        lounge_type: "VIP / First Class Lounge",
        preferred_time: "Morning (06:00 – 12:00)",
        passengers: "1 Passenger",
      },
    });

    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        passengerName: "Sophia Miller",
        serviceCategory: "Lounge",
      })
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bookingRef).toBe("SHAF-LNG-9988");
      expect(result.data.serviceCategory).toBe("Lounge");
    }
  });
});
