import { createMiddleware } from "@tanstack/react-start";
import { supabaseAdmin } from "./client.server";

function getUserIdFromCookie(cookieHeader: string | null, defaultVal: string): string {
  if (!cookieHeader) return defaultVal;
  const match = cookieHeader.match(/shafsky_user_id=([^;]+)/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]).trim();
  }
  return defaultVal;
}

export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    const cookieHeader = request ? request.headers.get("cookie") : null;
    const userId = getUserIdFromCookie(cookieHeader, "");

    if (
      !userId ||
      userId === "guest_user" ||
      userId === "super_admin_user" ||
      userId === "admin_user"
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
