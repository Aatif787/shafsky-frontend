import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { BookingSummarySection, BookingSummarySectionProps } from "../BookingSummarySection";

describe("BookingSummarySection Serviceability Handling", () => {
  const baseProps: BookingSummarySectionProps = {
    selectedCurrency: "INR",
    setSelectedCurrency: vi.fn(),
    selectedServices: ["DEPARTURE"],
    cleanOrigin: "DXB",
    originCode: "DXB",
    direction: "departure",
    airportCode: "DXB",
    cleanDest: "LHR",
    destCode: "LHR",
    cleanTransit: "",
    transitCode: "",
    searchParams: {},
    multiServiceAvailability: [
      {
        service_type: "DEPARTURE",
        airport_code: "DXB",
        airport_name: "Dubai International Airport",
        is_airport_supported: false,
        status: "REQUEST_REQUIRED",
        status_reason: "Airport 'DXB' is currently not supported for instant online booking. A service enquiry is required.",
        flight_type: "INTERNATIONAL",
        is_bookable_online: false,
        currency: "INR",
        available_packages: [],
      } as any,
    ],
    numericUnitPrice: 5500,
    billablePax: 1,
    selectedPackageName: "Gold Service",
    packageByService: { DEPARTURE: "gold", ARRIVAL: "", TRANSIT: "" },
    isFlightVerified: false,
    verifiedFlight: null,
    manualFlightNum: "EK501",
    flightNumber: "EK501",
    dateValue: new Date("2026-10-15T10:00:00Z"),
    passengers: [{ fullName: "John Doe", age: "30", phone: "+971501234567", email: "john@example.com" }],
    fullName: "John Doe",
    age: "30",
    totalPax: 1,
    convertedTotalPrice: 0,
    isArrangementOnly: true,
    isExpressFeeApplicable: false,
    convertedExpressFee: 0,
    paxChildren: 0,
    paxInfants: 0,
    handleShareQuoteWhatsApp: vi.fn(),
    handleRequestServiceArrangement: vi.fn(),
    isArrangementSubmitting: false,
    paymentStatus: "IDLE",
    handleRetryPayment: vi.fn(),
    submitting: false,
  };

  it("non-serviceable airport displays enquiry banner without payable amount or payment options", () => {
    const html = renderToString(<BookingSummarySection {...baseProps} isArrangementOnly={true} convertedTotalPrice={0} />);

    // 1. Should not show payable amount or ₹5,500
    expect(html).not.toContain("₹5,500");
    expect(html).not.toContain("Total Payable");

    // 2. Should not show payment options
    expect(html).not.toContain(">UPI<");
    expect(html).not.toContain(">Google Pay<");
    expect(html).not.toContain(">Cards<");
    expect(html).not.toContain(">NetBanking<");

    // 3. Should not show Razorpay
    expect(html).not.toContain("Encrypted payment via Razorpay");

    // 4. Must display the required exact text
    expect(html).toContain("This airport is not currently serviceable. Submit your request and our team will check availability.");
    expect(html).toContain("Our team will review your request and contact you.");

    // 5. Must NOT contain the word 'concierge' anywhere
    expect(html.toLowerCase()).not.toContain("concierge");

    // 6. Request service arrangement button is present
    expect(html).toContain("Request Service Arrangement");
  });

  it("serviceable airport displays standard pricing and payment options", () => {
    const serviceableProps: BookingSummarySectionProps = {
      ...baseProps,
      airportCode: "BOM",
      cleanOrigin: "BOM",
      originCode: "BOM",
      isArrangementOnly: false,
      convertedTotalPrice: 5500,
      multiServiceAvailability: [
        {
          service_type: "DEPARTURE",
          airport_code: "BOM",
          airport_name: "Chhatrapati Shivaji Maharaj International Airport",
          is_airport_supported: true,
          status: "AVAILABLE",
          flight_type: "DOMESTIC",
          is_bookable_online: true,
          unit_price: 5500,
          total_price: 5500,
          currency: "INR",
          available_packages: [],
        } as any,
      ],
    };

    const html = renderToString(<BookingSummarySection {...serviceableProps} />);

    // 1. Should show Total Payable and price
    expect(html).toContain("Total Payable");
    expect(html).toContain("₹5,500");

    // 2. Should show payment options
    expect(html).toContain("UPI");
    expect(html).toContain("Google Pay");
    expect(html).toContain("Cards");
    expect(html).toContain("NetBanking");

    // 3. Should show Razorpay badge and Pay button
    expect(html).toContain("Encrypted payment via Razorpay");
    expect(html).toContain("Pay ");
    expect(html).toContain("₹5,500");
  });
});
