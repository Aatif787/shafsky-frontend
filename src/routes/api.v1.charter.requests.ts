import { createFileRoute } from "@tanstack/react-router";
import { resolveApiUrl } from "@/lib/api/config";

export const Route = createFileRoute("/api/v1/charter/requests")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bodyText = await request.text();
        const url = resolveApiUrl("/api/charter/requests");
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
          return new Response(JSON.stringify(payload), {
            status: backendResponse.status,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          return new Response(
            JSON.stringify({
              success: false,
              error: err instanceof Error ? err.message : "Cannot reach charter backend.",
            }),
            { status: 503, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
