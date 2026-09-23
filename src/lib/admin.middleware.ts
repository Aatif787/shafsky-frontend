import { createMiddleware } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isStaffUser } from "@/lib/permissions";
import { verifyAccessToken } from "@/auth/verifyRequest.server";

function getUserIdFromCookie(cookieHeader: string | null, defaultVal = "guest_user") {
  if (!cookieHeader) return defaultVal;
  const match = cookieHeader.match(/shafsky_user_id=([^;]+)/);
  if (match && match[1]) return decodeURIComponent(match[1]).trim();
  return defaultVal;
}

export const requireAdminRole = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { getRequest } = await import("@tanstack/react-start/server");
  const request = getRequest();
  const cookieHeader = request ? request.headers.get("cookie") : null;
  let userId = getUserIdFromCookie(cookieHeader, "guest_user");

  const authHeader = request ? request.headers.get("authorization") : null;
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      try {
        const verified = await verifyAccessToken(token);
        if (verified?.id) {
          userId = verified.id;
        }
      } catch {
        // continue
      }
    }
  }

  const supabase = supabaseAdmin;
  const staff = await isStaffUser(supabase, userId);
  if (!staff) {
    throw new Error("Forbidden: Admin role required");
  }
  return next({ context: { supabase, userId } });
});
