import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  WhatsAppOperationsAlertCard,
  formatAlertDateTime,
} from "../WhatsAppOperationsAlertCard";

describe("WhatsAppOperationsAlertCard", () => {
  it("renders user Ground Transport sample booking with exact details and styling", () => {
    const sampleBooking = {
      booking_ref: "SHF-20261031-342205",
      service_name: "Ground Transport",
      passenger_name: "Test Customer",
      passenger_phone: "+91 77058 81139",
      passenger_email: "test@gmail.com",
      passenger_count: 2,
      origin: "Village East Mehram Nagar Road",
      destination: "Lucknow BKT",
      departure_time: "2026-10-01T10:01:00",
      notes:
        "TEST - department delivery verification, please ignore. Please action this booking from the operations dashboard.",
      status: "PENDING",
      dashboard_url: "https://shafsky.com/admin/bookings/SHF-20261031-342205",
      details: {
        vehicle_name: "Mercedes-Benz E-Class",
        vehicle_id: "merc-e-class",
        vehicle_category: "Luxury Vehicles",
      },
    };

    const html = renderToString(
      React.createElement(WhatsAppOperationsAlertCard, { booking: sampleBooking })
    );

    // Header elements
    expect(html).toContain("New Operations Alert");
    expect(html).toContain("Booking / Enquiry Received");
    expect(html).toContain("PENDING");

    // Exact Fields in Table
    expect(html).toContain("Reference No.");
    expect(html).toContain("SHF-20261031-342205");

    expect(html).toContain("Service");
    expect(html).toContain("Ground Transport");

    expect(html).toContain("Customer");
    expect(html).toContain("Test Customer");

    expect(html).toContain("Contact");
    expect(html).toContain("+91 77058 81139");

    expect(html).toContain("Email");
    expect(html).toContain("test@gmail.com");

    expect(html).toContain("Passengers");
    expect(html).toContain("2");

    expect(html).toContain("Vehicle");
    expect(html).toContain("Mercedes-Benz E-Class (ID: merc-e-class)");

    expect(html).toContain("Category");
    expect(html).toContain("Luxury Vehicles");

    expect(html).toContain("Route");
    expect(html).toContain("Village East Mehram Nagar Road → Lucknow BKT");

    expect(html).toContain("Date &amp; Time");
    expect(html).toContain("01 Oct 2026 at 10:01");

    // Notes Panel
    expect(html).toContain("Special Notes &amp; Instructions");
    expect(html).toContain(
      "TEST - department delivery verification, please ignore. Please action this booking from the operations dashboard."
    );

    // Dashboard Action Button
    expect(html).toContain("View in Dashboard");
    expect(html).toContain("https://shafsky.com/admin/bookings/SHF-20261031-342205");
  });

  it("dynamically adapts for Meet & Greet bookings and cleanly omits vehicle rows", () => {
    const meetAndGreet = {
      booking_ref: "SHF-MG-88902",
      service_name: "Airport Meet & Greet",
      passenger_name: "Dr. A. Sharma",
      passenger_phone: "+91 98765 43210",
      passenger_email: "asharma@example.com",
      passenger_count: 1,
      origin: "DEL T3 Arrival",
      destination: "Delhi Aerocity",
      departure_time: "2026-11-15T14:30:00Z",
      notes: "VIP guest, flower bouquet upon tarmac arrival.",
      status: "CONFIRMED",
    };

    const html = renderToString(
      React.createElement(WhatsAppOperationsAlertCard, { booking: meetAndGreet })
    );

    expect(html).toContain("SHF-MG-88902");
    expect(html).toContain("Airport Meet &amp; Greet");
    expect(html).toContain("Dr. A. Sharma");
    expect(html).toContain("DEL T3 Arrival → Delhi Aerocity");
    expect(html).toContain("CONFIRMED");
    // Ensure Vehicle and Category rows are omitted when not applicable
    expect(html).not.toContain(">Vehicle<");
    expect(html).not.toContain(">Category<");
  });

  it("handles empty and missing fields with clean fallbacks without crashing", () => {
    const emptyBooking = {};

    const html = renderToString(
      React.createElement(WhatsAppOperationsAlertCard, { booking: emptyBooking })
    );

    expect(html).toContain("New Operations Alert");
    expect(html).toContain("Not provided");
    expect(html).toContain("PENDING");
    expect(html).toContain("Please action this booking from the operations dashboard.");
    expect(html).toContain("/admin/bookings");
  });

  it("renders a button element when onViewInDashboard handler is provided", () => {
    const html = renderToString(
      React.createElement(WhatsAppOperationsAlertCard, {
        booking: { booking_ref: "SHF-001" },
        onViewInDashboard: () => {},
      })
    );

    expect(html).toContain("<button");
    expect(html).toContain("View in Dashboard");
  });

  it("formatAlertDateTime accurately formats ISO timestamps and falls back cleanly", () => {
    expect(formatAlertDateTime("2026-10-01T10:01:00")).toBe("01 Oct 2026 at 10:01");
    expect(formatAlertDateTime("2026-10-01")).toBe("01 Oct 2026");
    expect(formatAlertDateTime("")).toBe("Not provided");
    expect(formatAlertDateTime(undefined)).toBe("Not provided");
  });
});
