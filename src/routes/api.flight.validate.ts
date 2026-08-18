import { createFileRoute } from "@tanstack/react-router";

/**
 * Flight Validation API Proxy Route
 * 
 * This route proxies flight validation requests to the backend FastAPI service.
 * The backend is the authoritative source for flight data and validation logic.
 * 
 * Request forwarding: POST /api/flight/validate → POST http://127.0.0.1:8003/api/flight/validate
 * Response passthrough: Backend response is returned as-is to the client.
 */

function getBackendUrl(): string {
  return process.env.VITE_BACKEND_API_URL || "http://127.0.0.1:8003";
}

export const Route = createFileRoute("/api/flight/validate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const startTime = Date.now();
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
          request.headers.get("x-real-ip")?.trim() ||
          "127.0.0.1";

        try {
          // 1. Read request body
          const body = await request.json();
          console.log(
            `[Flight Validation] Received request from IP ${ip}: flight=${body.flightNum || body.flight_num}, date=${body.departDate || body.date}`,
          );

          // 2. Forward request to backend
          const backendUrl = getBackendUrl();
          const primaryEndpoint = `${backendUrl}/api/flight/validate`;

          console.log(
            `[Flight Validation] Forwarding to backend: POST ${primaryEndpoint}`,
          );

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 35000);
          let backendResponse: Response;
          try {
            backendResponse = await fetch(primaryEndpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-Forwarded-For": ip,
                ...(request.headers.get("authorization")
                  ? { "Authorization": request.headers.get("authorization")! }
                  : {}),
              },
              body: JSON.stringify(body),
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
          } catch (err) {
            clearTimeout(timeoutId);
            throw err;
          }

          // 3. Parse backend response
          let backendData: any;
          const contentType = backendResponse.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            backendData = await backendResponse.json();
          } else {
            backendData = await backendResponse.text();
          }

          const elapsed = Date.now() - startTime;
          console.log(
            `[Flight Validation] Backend response: status=${backendResponse.status}, elapsed=${elapsed}ms`,
          );

          // 4. Return backend response as-is
          return new Response(JSON.stringify(backendData), {
            status: backendResponse.status,
            headers: {
              "Content-Type": "application/json",
              "X-Backend-Status": `${backendResponse.status}`,
              "X-Response-Time-Ms": `${elapsed}`,
            },
          });
        } catch (error: unknown) {
          const elapsed = Date.now() - startTime;
          const errorMessage = error instanceof Error ? error.message : String(error);

          // Check if it's a network/connection error
          const isConnectionError =
            errorMessage.includes("Failed to fetch") ||
            errorMessage.includes("ERR_CONNECTION_REFUSED") ||
            errorMessage.includes("ECONNREFUSED") ||
            errorMessage.includes("timeout") ||
            errorMessage.includes("abort");

          console.error(
            `[Flight Validation Error] IP ${ip}, elapsed=${elapsed}ms. Error: ${errorMessage}`,
            error,
          );

          // Return appropriate error response
          if (isConnectionError) {
            return new Response(
              JSON.stringify({
                success: false,
                error: {
                  code: "BACKEND_UNAVAILABLE",
                  message: "Cannot connect to flight validation service. Backend server may be unavailable.",
                },
                data: { valid: false, flightData: null },
              }),
              {
                status: 503,
                headers: {
                  "Content-Type": "application/json",
                  "X-Response-Time-Ms": `${elapsed}`,
                },
              },
            );
          }

          // Generic server error
          return new Response(
            JSON.stringify({
              success: false,
              error: {
                code: "SERVICE_ERROR",
                message: "An unexpected error occurred during flight validation.",
              },
              data: { valid: false, flightData: null },
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                "X-Response-Time-Ms": `${elapsed}`,
              },
            },
          );
        }
      },
    },
  },
});
