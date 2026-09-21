import { createMiddleware } from "@tanstack/react-start";
import { supabaseAdmin } from "./client.server";

// Valid UUID v4 regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getUserIdFromCookie(cookieHeader: string | null, defaultVal: string): string {
  if (!cookieHeader) return defaultVal;
  const match = cookieHeader.match(/shafsky_user_id=([^;]+)/);
  if (match && match[1]) {
    const val = decodeURIComponent(match[1]).trim();
    if (UUID_REGEX.test(val)) {
      return val;
    }
  }
  return defaultVal;
}

export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    const cookieHeader = request ? request.headers.get("cookie") : null;
    let userId = getUserIdFromCookie(cookieHeader, "");

    const authHeader = request ? request.headers.get("authorization") : null;
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      const token = authHeader.slice(7).trim();
      if (token) {
        try {
          const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
          if (user && !error) {
            userId = user.id;
          }
        } catch {
          // ignore error and proceed with validated cookie check
        }
      }
    }

    if (
      !userId ||
      userId === "guest_user" ||
      userId === "super_admin_user" ||
      userId === "admin_user" ||
      !UUID_REGEX.test(userId)
    ) {
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
    const cookieHeader = request ? request.headers.get("cookie") : null;
    const userId = getUserIdFromCookie(cookieHeader, "guest_user");

    return next({
      context: {
        supabase: supabaseAdmin,
        userId: userId,
        claims: { sub: userId },
      },
    });
  },
);

