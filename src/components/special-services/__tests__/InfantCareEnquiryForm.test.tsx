import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { InfantCareEnquiryForm } from "../InfantCareEnquiryForm";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/api/enquiryApi", () => ({
  enquiryApi: {
    submit: vi.fn().mockResolvedValue({
      success: true,
      data: {
        bookingRef: "SHAF-INFT-TEST-001",
      },
    }),
  },
}));

describe("InfantCareEnquiryForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders required and optional Infant Care enquiry fields", () => {
    const html = renderToString(<InfantCareEnquiryForm />);
    expect(html).toContain("Parent Name");
    expect(html).toContain("WhatsApp Number");
    expect(html).toContain("Airport");
    expect(html).toContain("Flight Number");
    expect(html).toContain("Flight Date");
    expect(html).toContain("Infant Age");
    expect(html).toContain("Assistance Required");
    expect(html).toContain("Additional Requirements");
  });

  it("renders Instant WhatsApp Enquiry button alongside Submit Enquiry", () => {
    const html = renderToString(<InfantCareEnquiryForm initialAirport="DEL" />);
    expect(html).toContain("Instant WhatsApp Enquiry");
    expect(html).toContain("Submit Enquiry");
    expect(html).toContain("https://wa.me/919599225778?text=");
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});
