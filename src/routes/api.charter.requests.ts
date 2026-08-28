import { createFileRoute } from "@tanstack/react-router";
import { resolveApiUrl } from "@/lib/api/config";

/**
 * Same-origin charter submit proxy.
 * Browser POST /api/charter/requests → FastAPI /api/charter/requests
 * (TanStack Start intercepts /api/* before Vite's proxy, which caused a raw "Not Found".)
 */
export const Route = createFileRoute("/api/charter/requests")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bodyText = await request.text();
        const endpoints = [
          resolveApiUrl("/api/charter/requests"),
          resolveApiUrl("/api/v1/charter/requests"),
          resolveApiUrl("/api/charter/enquiry"),
        ];

        let lastStatus = 502;
        let lastBody: unknown = { success: false, error: "Charter service unavailable." };

        for (const url of endpoints) {
          try {
            const backendResponse = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "ngrok-skip-browser-warning": "true",
              },
              body: bodyText,
            });
            const contentType = backendResponse.headers.get("content-type") || "";
            const payload = contentType.includes("application/json")
              ? await backendResponse.json()
              : await backendResponse.text();
            lastStatus = backendResponse.status;
            lastBody = payload;
            if (backendResponse.status !== 404) {
              return new Response(JSON.stringify(payload), {
                status: backendResponse.status,
                headers: { "Content-Type": "application/json" },
              });
            }
          } catch (err) {
            lastStatus = 503;
            lastBody = {
              success: false,
              error: err instanceof Error ? err.message : "Cannot reach charter backend.",
            };
          }
        }

        return new Response(JSON.stringify(lastBody), {
          status: lastStatus,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
