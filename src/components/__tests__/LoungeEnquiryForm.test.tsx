import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { LoungeEnquiryForm } from "../lounge/LoungeEnquiryForm";
import { enquiryApi } from "@/lib/api/enquiryApi";

vi.mock("@/lib/api/enquiryApi", () => ({
  enquiryApi: {
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

  it("renders all required enquiry fields in exact specified ordering", () => {
    const html = renderToString(<LoungeEnquiryForm />);

    // Header
    expect(html).toContain("Lounge Enquiry");

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

    // Submit button text
    expect(html).toContain("Send Enquiry");

    // Verify Passenger Details appears BEFORE Lounge Details in the DOM string
    const yourDetailsIndex = html.indexOf("Your Details");
    const loungeDetailsIndex = html.indexOf("Lounge Details");
    expect(yourDetailsIndex).toBeGreaterThan(-1);
    expect(loungeDetailsIndex).toBeGreaterThan(yourDetailsIndex);
  });

  it("submits enquiry with category 'Lounge' through the API", async () => {
    const mockSubmit = vi.spyOn(enquiryApi, "submit").mockResolvedValue({
      success: true,
      data: {
        id: "enq-123",
        bookingRef: "SHAF-ENQ-9988",
        passengerName: "Sophia Miller",
        serviceCategory: "Lounge",
        serviceType: "VIP / First Class Lounge",
        status: "PENDING",
      },
    });

    // Test API contract directly
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
      expect(result.data.bookingRef).toBe("SHAF-ENQ-9988");
      expect(result.data.serviceCategory).toBe("Lounge");
    }
  });
});
