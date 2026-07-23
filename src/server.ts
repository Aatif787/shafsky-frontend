import "dotenv/config";
import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL;
const emailReplyTo = process.env.EMAIL_REPLY_TO;

console.log("===== Environment Validation =====");
console.log(`RESEND_API_KEY: ${resendApiKey ? "✓ Loaded" : "✗ Missing"}`);
console.log(`EMAIL_FROM: ${emailFrom ? "✓ Loaded" : "✗ Missing"}`);
console.log(`EMAIL_REPLY_TO: ${emailReplyTo ? "✓ Loaded" : "✗ Missing"}`);
console.log("==================================");

const isProd = process.env.NODE_ENV === "production";
if (!emailFrom || (!resendApiKey && isProd)) {
  const missing = [];
  if (!resendApiKey) missing.push("RESEND_API_KEY");
  if (!emailFrom) missing.push("EMAIL_FROM/RESEND_FROM_EMAIL");
  const errorMsg = `[Startup Validation] WARNING: Missing environment variable(s): ${missing.join(", ")}. Email notification dispatch will fall back to simulation mode.`;
  console.warn(errorMsg);
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;

function pruneStaleRateLimitEntries(): void {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

function isRateLimited(ip: string): boolean {
  pruneStaleRateLimitEntries();
  const now = Date.now();
  const limitData = rateLimitMap.get(ip);

  if (!limitData || now > limitData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + LIMIT_WINDOW_MS });
    return false;
  }

  limitData.count += 1;
  if (limitData.count > MAX_REQUESTS) {
    return true;
  }
  return false;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const clientIp =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      "127.0.0.1";

    const url = new URL(request.url);
    const isFlightValidate = url.pathname === "/api/flight/validate";

    if (process.env.NODE_ENV === "production" && !isFlightValidate && isRateLimited(clientIp)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
        },
      });
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const res = await normalizeCatastrophicSsrResponse(response);

      const secureHeaders = new Headers(res.headers);
      secureHeaders.set("X-Frame-Options", "DENY");
      secureHeaders.set("X-Content-Type-Options", "nosniff");
      secureHeaders.set("X-XSS-Protection", "1; mode=block");
      secureHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
      secureHeaders.set(
        "Content-Security-Policy",
        "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; img-src 'self' https: data: blob:; media-src 'self' https: data: blob:; connect-src 'self' https: wss:; font-src 'self' https: data:;",
      );

      return new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers: secureHeaders,
      });
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
