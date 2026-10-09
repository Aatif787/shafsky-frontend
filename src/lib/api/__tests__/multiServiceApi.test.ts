import { describe, it, expect, vi, beforeEach } from "vitest";
import { MultiServiceApi } from "../multiServiceApi";
import { ApiClient } from "@/lib/ApiClient";

describe("MultiServiceApi Unit Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("checkAvailability makes POST request to /api/journey/multi-service/availability", async () => {
    const mockResponse = {
      success: true,
      itinerary: {
        departure_airport: "DEL",
        arrival_airport: "BOM",
        transit_airports: [],
        legs: [],
        is_connecting: false,
        total_legs: 1,
      },
      services: [
        {
          service_type: "DEPARTURE",
          airport_code: "DEL",
          status: "AVAILABLE",
          is_airport_supported: true,
          unit_price: 2500,
          total_price: 2500,
          currency: "INR",
          is_bookable_online: true,
          available_packages: [],
        },
      ],
      all_available: true,
      any_available: true,
      none_available: false,
      guest_count: 1,
      available_subtotal: 2500,
      total_payable: 2500,
      currency: "INR",
      unavailable_services_count: 0,
    };

    vi.spyOn(ApiClient, "fetchWithAuth").mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as any);

    const result = await MultiServiceApi.checkAvailability({
      origin_code: "DEL",
      dest_code: "BOM",
      selected_services: [{ service_type: "DEPARTURE", package_slug: "silver" }],
    });

    expect(ApiClient.fetchWithAuth).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
    expect(result.total_payable).toBe(2500);
    expect(result.all_available).toBe(true);
  });

  it("createQuery makes POST request to /api/journey/multi-service/query", async () => {
    const mockQueryResponse = {
      success: true,
      query_ref: "QRY-20261009-TEST",
      message: "Enquiry registered",
      created_at: "2026-10-09T14:00:00Z",
    };

    vi.spyOn(ApiClient, "fetchWithAuth").mockResolvedValueOnce({
      ok: true,
      json: async () => mockQueryResponse,
    } as any);

    const result = await MultiServiceApi.createQuery({
      passenger_name: "Aariz Khan",
      passenger_email: "aariz@example.com",
      passenger_phone: "+919876543210",
      itinerary: { departure_airport: "DEL", arrival_airport: "DXB" },
      requested_services: [{ service_type: "ARRIVAL", airport: "DXB" }],
      unavailable_services: [{ service_type: "ARRIVAL", airport: "DXB" }],
    });

    expect(ApiClient.fetchWithAuth).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
    expect(result.query_ref).toBe("QRY-20261009-TEST");
  });

  it("throws error when API returns non-ok response", async () => {
    vi.spyOn(ApiClient, "fetchWithAuth").mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ detail: "Origin airport required" }),
    } as any);

    await expect(
      MultiServiceApi.checkAvailability({
        selected_services: [{ service_type: "DEPARTURE" }],
      })
    ).rejects.toThrow("Origin airport required");
  });

  it("handles 401 Unauthorized by clearing stale token and retrying once unauthenticated", async () => {
    const mockSuccessResponse = {
      success: true,
      itinerary: { departure_airport: "BOM", arrival_airport: "DEL", transit_airports: [], legs: [], is_connecting: false, total_legs: 1 },
      services: [],
      all_available: true,
      any_available: true,
      none_available: false,
      guest_count: 1,
      available_subtotal: 0,
      total_payable: 0,
      currency: "INR",
      unavailable_services_count: 0,
    };

    // First call returns 401, second call (retry) returns 200 OK
    const fetchSpy = vi.spyOn(ApiClient, "fetchWithAuth")
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: "Token expired" }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSuccessResponse,
      } as any);

    const result = await MultiServiceApi.checkAvailability({
      origin_code: "BOM",
      dest_code: "DEL",
      selected_services: [{ service_type: "DEPARTURE" }],
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(true);
  });

  it("does not repeatedly loop if 401 persists after retry", async () => {
    const fetchSpy = vi.spyOn(ApiClient, "fetchWithAuth")
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: "Unauthorized" }),
      } as any)
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: "Unauthorized" }),
      } as any);

    await expect(
      MultiServiceApi.checkAvailability({
        origin_code: "BOM",
        dest_code: "DEL",
        selected_services: [{ service_type: "DEPARTURE" }],
      })
    ).rejects.toThrow("Unauthorized");

    // Exactly 2 attempts (1 initial + 1 unauthenticated retry), never loops repeatedly
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("succeeds when optional flight_num is omitted", async () => {
    const mockResponse = {
      success: true,
      itinerary: { departure_airport: "BOM", arrival_airport: "DEL", transit_airports: [], legs: [], is_connecting: false, total_legs: 1 },
      services: [],
      all_available: true,
      any_available: true,
      none_available: false,
      guest_count: 1,
      available_subtotal: 0,
      total_payable: 0,
      currency: "INR",
      unavailable_services_count: 0,
    };

    vi.spyOn(ApiClient, "fetchWithAuth").mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as any);

    const result = await MultiServiceApi.checkAvailability({
      origin_code: "BOM",
      dest_code: "DEL",
      selected_services: [{ service_type: "DEPARTURE" }],
      // flight_num intentionally undefined
    });

    expect(result.success).toBe(true);
  });
});
