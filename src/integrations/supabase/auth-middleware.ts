import { createMiddleware } from "@tanstack/react-start";
import { supabaseAdmin } from "./client.server";
import { verifyAccessToken, getBearerFromRequest } from "@/auth/verifyRequest.server";

// Valid UUID v4 regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Resolve the verified caller identity for the current request.
 *
 * Identity comes ONLY from the Authorization header, verified against FastAPI.
 * Cookies are never consulted for identity: the browser can write them, so a
 * cookie value is not a trustworthy identity source.
 *
 * Returns "" when the caller is unauthenticated, preserving the previous
 * behaviour of optionalSupabaseAuth.
 */
async function resolveVerifiedUserId(request: Request | null): Promise<string> {
  const token = getBearerFromRequest(request);
  if (!token) return "";
  const verified = await verifyAccessToken(token);
  const id = verified?.id ? String(verified.id).trim() : "";
  return UUID_REGEX.test(id) ? id : "";
}

export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    const userId = await resolveVerifiedUserId(request);

    if (!userId) {
      throw new Error("Unauthorized: Valid authenticated session is required.");
    }

    return next({
      context: {
        supabase: supabaseAdmin,
        userId: userId,
        claims: { sub: userId },
      },
    });
  },
);

export const optionalSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    const userId = await resolveVerifiedUserId(request);

    return next({
      context: {
        supabase: supabaseAdmin,
        userId: userId,
        claims: { sub: userId },
      },
    });
  },
);
