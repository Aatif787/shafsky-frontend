import { createFileRoute } from "@tanstack/react-router";
import { processQueue } from "@/lib/notifications/queue";

export const Route = createFileRoute("/api/process-queue")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return await handleProcessRequest(request);
      },
      POST: async ({ request }) => {
        return await handleProcessRequest(request);
      },
    },
  },
});

async function handleProcessRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const secretParam = url.searchParams.get("secret") || request.headers.get("x-queue-secret");
  const expectedSecret = process.env.PROCESS_QUEUE_SECRET;

  // If a secret key is defined in the server configuration, validate it
  if (expectedSecret && secretParam !== expectedSecret) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Unauthorized: Invalid queue processing secret key.",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const limitParam = parseInt(url.searchParams.get("limit") || "10", 10);
    const limit = isNaN(limitParam) ? 10 : limitParam;

    console.log(`[Queue Endpoint] Initiating queue processor with limit ${limit}...`);
    const result = await processQueue(limit);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          processed_jobs: result.processed,
          succeeded_jobs: result.succeeded,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err: any) {
    console.error("[Queue Endpoint] Exception during queue run:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || String(err),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
