import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { OnboardMealArrangementForm } from "../OnboardMealArrangementForm";

// Mock Query Client
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock website contacts hook
vi.mock("@/hooks/useWebsiteContacts", () => ({
  useWebsiteContacts: () => ({
    getPrimaryContact: () => ({
      full_phone_number: "+91-9599087959",
      formatted: "+91 95990 87959",
      tel_link: "tel:+919599087959",
      display_email: "support@shafsky.com",
      mail_link: "mailto:support@shafsky.com",
    }),
    getContacts: () => [],
  }),
}));

// Mock enquiryApi
vi.mock("@/lib/api/enquiryApi", () => ({
  enquiryApi: {
    submit: vi.fn().mockResolvedValue({
      success: true,
      data: {
        bookingRef: "SHAF-ONBD-TEST-001",
      },
    }),
  },
}));

describe("OnboardMealArrangementForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a clean streamlined form without bulky upper banner", () => {
    const html = renderToString(<OnboardMealArrangementForm />);
    expect(html).toContain("Zero charge • Official enquiry for custom quotation");
    expect(html).toContain("Submit Enquiry");
  });

  it("renders all four structured form sections in streamlined order", () => {
    const html = renderToString(<OnboardMealArrangementForm />);

    // Section 1: Passenger Details
    expect(html).toContain("1. Passenger Details");
    expect(html).toContain("Passenger Name");
    expect(html).toContain("Flight Number");
    expect(html).toContain("Date of Travel");
    expect(html).toContain("Sector / Route");

    // Section 2: Valid ID Details (Shifted immediately after Passenger Details)
    expect(html).toContain("2. Valid ID Details");
    expect(html).toContain("ID Type");
    expect(html).toContain("ID Number");

    // Section 3: Meal Arrangement Details (Optimized Food Selection)
    expect(html).toContain("3. Meal Arrangement Details");
    expect(html).toContain("A. Meal Type");
    expect(html).toContain("B. Meal Preference");
    expect(html).toContain("C. Number of Meals and Allergies");
    expect(html).toContain("D. Additional Instructions");

    // Section 4: Declaration
    expect(html).toContain("4. Declaration");
    expect(html).toContain(
      "I confirm that the information provided above is accurate and that the identification document submitted, where required, is valid."
    );

    // Submit button
    expect(html).toContain("Submit Enquiry");
  });

  it("provides clean placeholders without demo text", () => {
    const html = renderToString(<OnboardMealArrangementForm />);
    expect(html).toContain('placeholder="Passenger full name"');
    expect(html).toContain('placeholder="Flight number"');
    expect(html).toContain('placeholder="Email address"');
    expect(html).toContain('placeholder="Phone or WhatsApp number"');
    expect(html).toContain('placeholder="ID or passport number"');

    // Ensure dummy/demo values are removed
    expect(html).not.toContain("Rahul Sharma");
    expect(html).not.toContain("passenger@shafsky.test");
    expect(html).not.toContain("+91 98765 43210");
  });

  it("renders all required Meal Types in Section 3A as interactive chips", () => {
    const html = renderToString(<OnboardMealArrangementForm />);
    const expectedTypes = [
      "Breakfast",
      "Lunch",
      "Dinner",
      "Snacks",
      "Beverages",
      "Special Meal",
    ];
    for (const t of expectedTypes) {
      expect(html).toContain(t);
    }
  });

  it("renders all required Meal Preferences in Section 3B as interactive chips", () => {
    const html = renderToString(<OnboardMealArrangementForm />);
    const expectedPreferences = [
      "Vegetarian",
      "Non-Vegetarian",
      "Jain",
      "Vegan",
      "Halal",
      "Gluten-Free",
      "Other",
    ];
    for (const p of expectedPreferences) {
      expect(html).toContain(p);
    }
  });

  it("renders all Allergies and Special Requirements in Section 3C", () => {
    const html = renderToString(<OnboardMealArrangementForm />);
    const expectedAllergies = ["None", "Dairy", "Gluten", "Seafood", "Other"];
    for (const a of expectedAllergies) {
      expect(html).toContain(a);
    }
  });

  it("renders ID Types dropdown in Section 2", () => {
    const html = renderToString(<OnboardMealArrangementForm />);
    expect(html).toContain("Passport");
    expect(html).toContain("Government-issued ID");
  });

  it("renders submission action and confirmation controls", () => {
    const html = renderToString(<OnboardMealArrangementForm />);
    expect(html).toContain("Submit Enquiry");
    expect(html).toContain("Zero charge • Official enquiry for custom quotation");
  });
});
