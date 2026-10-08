import { createMiddleware } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isStaffUser } from "@/lib/permissions";
import { verifyAccessToken, getBearerFromRequest } from "@/auth/verifyRequest.server";

export const requireAdminRole = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { getRequest } = await import("@tanstack/react-start/server");
  const request = getRequest();

  // Identity comes ONLY from the Authorization header, verified against FastAPI.
  // Cookies are never trusted for identity: the browser can write them.
  const token = getBearerFromRequest(request);
  const verified = await verifyAccessToken(token);
  const userId = verified?.id ? String(verified.id).trim() : "";
  if (!userId) {
    throw new Error("Forbidden: Admin role required");
  }

  const supabase = supabaseAdmin;
  const staff = await isStaffUser(supabase, userId);
  if (!staff) {
    throw new Error("Forbidden: Admin role required");
  }
  return next({ context: { supabase, userId } });
});
