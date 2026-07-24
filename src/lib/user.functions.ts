import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth, optionalSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { apiGet, apiPatch, apiPost, getTokenFromRequest } from "@/lib/FastApiClient";

export const getCurrentUserProfileServer = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .handler(async () => {
    try {
      const token = getTokenFromRequest();
      const me = await apiGet<any>("/api/me", token);
      return me || null;
    } catch {
      return null;
    }
  });

export const updateMyProfileServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as Record<string, unknown>)
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const res = await apiPatch<any>("/api/me", data, token);
    return res?.data || res || { success: true };
  });

export const markMyNotificationsReadServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const token = getTokenFromRequest();
    await apiPost("/api/notifications/mark-read", { all: true }, token);
    return { success: true };
  });

export const getMyNotificationsServer = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any[]>("/api/notifications/my", token);
      return res || [];
    } catch {
      return [];
    }
  });
