import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { TransportBookingModal } from "../TransportBookingModal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { TransportationVehicleItem } from "@/data/transportation/types";

const mockVehicle: TransportationVehicleItem = {
  id: "merc-maybach-s-class",
  name: "Mercedes-Benz Maybach S-Class",
  category: "Luxury Vehicles",
  passengerCapacity: 3,
  luggageCapacity: 3,
  image: "/images/maybach.webp",
};

describe("TransportBookingModal SSR & Field Rendering Tests", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  it("renders all 10 requested fields and initial vehicle details", () => {
    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <TransportBookingModal
          isOpen={true}
          onClose={vi.fn()}
          initialVehicle={mockVehicle}
        />
      </QueryClientProvider>
    );

    // 1. Name
    expect(html).toContain("Full Name");
    expect(html).toContain('placeholder="Full name"');
    // 2. Email
    expect(html).toContain("Email Address");
    expect(html).toContain('placeholder="Email address"');
    // 3. Mobile Number
    expect(html).toContain("Mobile Number");
    expect(html).toContain('placeholder="Mobile number"');
    // 4. Vehicle Type / Categories
    expect(html).toContain("Luxury Vehicles");
    expect(html).toContain("MUV / Large Vehicles");
    expect(html).toContain("Economy / Standard");
    expect(html).toContain("Mercedes-Benz Maybach S-Class");
    // 5. Passengers counter
    expect(html).toContain("Number of Passengers");
    // 6. Number of vehicles counter
    expect(html).toContain("Number of Vehicles");
    // 7. Date
    expect(html).toContain("Travel Date");
    expect(html).not.toContain("Pickup Time");
    // 8. Pickup Location
    expect(html).toContain("Pickup Location");
    // 9. Drop Location
    expect(html).toContain("Drop Location");
    // 10. Special Requests
    expect(html).toContain("Special Requests");
    expect(html).toContain("Passenger Details");
    // Submit Button and Header
    expect(html).toContain("Enquiry");
    expect(html).toContain("Submit");
  });

  it("renders properly in callback mode", () => {
    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <TransportBookingModal
          isOpen={true}
          onClose={vi.fn()}
          initialVehicle={mockVehicle}
          mode="callback"
        />
      </QueryClientProvider>
    );

    expect(html).toContain("Request Chauffeur Callback");
    expect(html).toContain("Request Call");
  });

  it("returns null when isOpen is false", () => {
    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <TransportBookingModal
          isOpen={false}
          onClose={vi.fn()}
          initialVehicle={mockVehicle}
        />
      </QueryClientProvider>
    );

    expect(html).toBe("");
  });
});
