import { createFileRoute } from "@tanstack/react-router";
import { FlightValidationService } from "@/services/flight/FlightValidationService";
import { FlightRateLimiter } from "@/services/flight/FlightCacheService";
import { checkBookingEligibility } from "@/services/flight/FlightTimeUtils";
import { AIRPORTS } from "@/data/airports";

export const Route = createFileRoute("/api/flight/validate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // 1. IP Rate Limiting to prevent brute-forcing/API spam
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
          request.headers.get("x-real-ip")?.trim() ||
          "127.0.0.1";

        if (FlightRateLimiter.isRateLimited(ip)) {
          console.warn(`[API SECURITY] Rate limit exceeded for IP: ${ip} on /api/flight/validate`);
          return new Response(
            JSON.stringify({
              success: false,
              error: {
                code: "RATE_LIMIT_EXCEEDED",
                message: "Too many flight validation requests. Please try again in a minute.",
              },
            }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }

        // 2. Request payload size check (DDoS mitigation)
        const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
        if (contentLength > 4096) {
          console.error(`[API SECURITY] Oversized payload: ${contentLength} bytes from IP: ${ip}`);
          return new Response(
            JSON.stringify({
              success: false,
              error: {
                code: "BAD_REQUEST",
                message: "Payload size limit exceeded.",
              },
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }

        try {
          // Parse request payload
          const body = await request.json();
          const {
            flightNum,
            departDate,
            tripType,
            isManual,
            departTime,
            originCode,
            destinationCode,
            airlineName,
            arrivalDate,
            arrivalTime,
          } = body;

          // 2.5 Load dynamic threshold settings
          let threshold = 6;
          try {
            const { listSystemSettings } = await import("@/lib/super-admin.functions");
            const settingsData = await listSystemSettings();
            const adminSetting = (settingsData || []).find((s: any) => s.key === "admin_settings");
            if (
              adminSetting &&
              adminSetting.value &&
              typeof adminSetting.value.sixHourRuleThreshold === "number"
            ) {
              threshold = adminSetting.value.sixHourRuleThreshold;
            }
          } catch (err) {
            console.warn("Failed to load dynamic threshold settings, using default of 6:", err);
          }

          // 3. Manual flight entry bypass
          if (isManual) {
            if (
              typeof flightNum !== "string" ||
              typeof departDate !== "string" ||
              typeof departTime !== "string" ||
              typeof originCode !== "string" ||
              typeof destinationCode !== "string"
            ) {
              return new Response(
                JSON.stringify({
                  success: false,
                  error: {
                    code: "INVALID_INPUT",
                    message:
                      "Manual flight entry requires valid flight number, date, time, origin, and destination codes.",
                  },
                }),
                {
                  status: 400,
                  headers: { "Content-Type": "application/json" },
                },
              );
            }

            const cleanFlightNum = flightNum.trim().toUpperCase().replace(/\s+/g, "");
            const cleanOrigin = originCode.trim().toUpperCase();
            const cleanDest = destinationCode.trim().toUpperCase();

            const timePattern = /^\d{2}:\d{2}$/;
            if (!timePattern.test(departTime.trim())) {
              return new Response(
                JSON.stringify({
                  success: false,
                  error: {
                    code: "INVALID_FORMAT",
                    message: "Invalid departure time format. Use HH:MM.",
                  },
                }),
                {
                  status: 400,
                  headers: { "Content-Type": "application/json" },
                },
              );
            }

            const scheduledTime = `${departDate.trim()}T${departTime.trim()}:00`;
            const eligibilityResult = checkBookingEligibility(
              scheduledTime,
              cleanOrigin,
              tripType,
              threshold,
            );

            if (!eligibilityResult.isBookable) {
              return new Response(
                JSON.stringify({
                  success: false,
                  error: {
                    code: "GATE_LIMIT_EXCEEDED",
                    message:
                      eligibilityResult.blockingMessage ||
                      `This service can only be booked at least ${threshold} hours before the flight time.`,
                  },
                }),
                {
                  status: 400,
                  headers: { "Content-Type": "application/json" },
                },
              );
            }

            const originAirport = AIRPORTS.find((a) => a.code.toUpperCase() === cleanOrigin);
            const destAirport = AIRPORTS.find((a) => a.code.toUpperCase() === cleanDest);

            const mockFlightData = {
              flightNum: cleanFlightNum,
              carrier: {
                iata: cleanFlightNum.slice(0, 2),
                name: airlineName || "Manual Carrier",
              },
              origin: {
                code: cleanOrigin,
                name: originAirport?.airport?.name || `${cleanOrigin} Airport`,
                city: originAirport?.city || "Unknown City",
              },
              destination: {
                code: cleanDest,
                name: destAirport?.airport?.name || `${cleanDest} Airport`,
                city: destAirport?.city || "Unknown City",
              },
              departure: {
                scheduledTime: `${departDate.trim()}T${departTime.trim()}:00`,
                terminal: "Manual Terminal",
              },
              arrival: {
                scheduledTime:
                  arrivalDate && arrivalTime
                    ? `${arrivalDate.trim()}T${arrivalTime.trim()}:00`
                    : `${departDate.trim()}T${departTime.trim()}:00`, // fallback
                terminal: "",
              },
              duration: "—",
              status: "Scheduled",
              aircraft: { model: "Commercial Flight" },
              eligibility: eligibilityResult,
              isManual: true,
            };

            return new Response(
              JSON.stringify({
                success: true,
                data: mockFlightData,
              }),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              },
            );
          }

          // 4. Type security checks & sanitization
          if (typeof flightNum !== "string" || typeof departDate !== "string") {
            return new Response(
              JSON.stringify({
                success: false,
                error: {
                  code: "INVALID_INPUT",
                  message: "Flight number and departure date parameters must be strings.",
                },
              }),
              {
                status: 400,
                headers: {
                  "Content-Type": "application/json",
                },
              },
            );
          }

          // Strip scripting characters, trim, and cap length limits
          const sanitizedFlightNum = flightNum
            .trim()
            .slice(0, 15)
            .replace(/[^a-zA-Z0-9]/g, "");
          const sanitizedDepartDate = departDate
            .trim()
            .slice(0, 10)
            .replace(/[^0-9-]/g, "");

          let sanitizedTripType: "one_way" | "round_trip" | "multi_city" = "one_way";
          if (tripType === "round_trip" || tripType === "multi_city") {
            sanitizedTripType = tripType;
          }

          if (sanitizedFlightNum.length < 3) {
            return new Response(
              JSON.stringify({
                success: false,
                error: {
                  code: "INVALID_FORMAT",
                  message: "Flight number must be at least 3 characters.",
                },
              }),
              {
                status: 400,
                headers: {
                  "Content-Type": "application/json",
                },
              },
            );
          }

          // Invoke validation service
          const service = new FlightValidationService();
          const result = await service.validateFlight(
            {
              flightNum: sanitizedFlightNum,
              departDate: sanitizedDepartDate,
              tripType: sanitizedTripType,
            },
            threshold,
          );

          return new Response(
            JSON.stringify({
              success: true,
              data: result,
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : "Internal Validation Failure";
          const code =
            e &&
            typeof e === "object" &&
            "code" in e &&
            typeof (e as Record<string, unknown>).code === "string"
              ? (e as Record<string, unknown>).code
              : "SERVICE_ERROR";

          console.error(
            `[API ERROR] ${new Date().toISOString()} - Validation failed for IP ${ip}. Code: ${code}. Error: ${message}`,
            e,
          );

          const status = code === "INVALID_FORMAT" ? 400 : code === "FLIGHT_NOT_FOUND" ? 404 : 500;

          return new Response(
            JSON.stringify({
              success: false,
              error: {
                code,
                message,
              },
            }),
            {
              status,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }
      },
    },
  },
});
