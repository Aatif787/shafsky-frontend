import { createMiddleware } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isStaffUser } from "@/lib/permissions";

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
  const userId = getUserIdFromCookie(cookieHeader, "guest_user");
  const supabase = supabaseAdmin;
  const staff = await isStaffUser(supabase, userId);
  if (!staff) {
    throw new Error("Forbidden: Admin role required");
  }
  return next({ context: { supabase, userId } });
});
