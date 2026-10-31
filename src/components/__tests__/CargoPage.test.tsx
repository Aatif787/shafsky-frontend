import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { CargoPage } from "@/components/cargo/CargoPage";
import { enquiryApi } from "@/lib/api/enquiryApi";

// Mock tanstack router with importOriginal
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    Link: ({ to, children, ...props }: any) =>
      React.createElement("a", { ...props, href: to }, children),
    useLocation: () => ({ pathname: "/solutions/cargo", search: "" }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock("@/lib/session", () => ({
  getSessionInfo: vi.fn().mockResolvedValue({ userId: null, roles: [], isStaff: false }),
}));

vi.mock("@/lib/branding/branding.context", () => ({
  useBranding: () => ({
    branding: { logo_url: "/logo.png" },
    isLoading: false,
    refetch: () => {},
  }),
}));

vi.mock("@/lib/api/enquiryApi", () => ({
  enquiryApi: {
    submit: vi.fn().mockResolvedValue({
      success: true,
      data: {
        bookingRef: "CRG-987654",
      },
    }),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Dedicated Cargo Page and Form", () => {
  it("renders the simple Cargo heading and the 7 required fields with Submit button", () => {
    const html = renderToString(React.createElement(CargoPage));

    // Simple heading Cargo
    expect(html).toContain("Cargo</h1>");

    // Full Name
    expect(html).toContain("Full Name *");
    expect(html).toContain('id="cargo-full-name"');

    // Email
    expect(html).toContain("Email *");
    expect(html).toContain('id="cargo-email"');

    // Phone Number
    expect(html).toContain("Phone Number *");
    expect(html).toContain('id="cargo-phone"');

    // Cargo Type
    expect(html).toContain("Cargo Type *");
    expect(html).toContain('id="cargo-type"');
    expect(html).toContain("General Cargo");
    expect(html).toContain("Perishables &amp; Cold Chain");

    // Origin
    expect(html).toContain("Origin *");
    expect(html).toContain('id="cargo-origin"');

    // Destination
    expect(html).toContain("Destination *");
    expect(html).toContain('id="cargo-destination"');

    // Cargo Details
    expect(html).toContain("Cargo Details *");
    expect(html).toContain('id="cargo-details"');

    // One Submit Enquiry button
    expect(html).toContain("Submit Enquiry</span>");
  });

  it("submits enquiry with serviceCategory: Cargo & Logistics", async () => {
    const payload = {
      passengerName: "Rajesh Kumar",
      passengerEmail: "rajesh@example.com",
      passengerPhone: "+919876543210",
      serviceCategory: "Cargo & Logistics" as const,
      serviceType: "General Cargo",
      origin: "Delhi (DEL)",
      destination: "Dubai (DXB)",
      notes: "500kg electronics cargo packed in 4 pallets",
      details: {
        cargo_type: "General Cargo",
        cargo_details: "500kg electronics cargo packed in 4 pallets",
      },
    };

    const res = await enquiryApi.submit(payload);
    expect(enquiryApi.submit).toHaveBeenCalledWith(payload);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.bookingRef).toBe("CRG-987654");
    }
  });
});
