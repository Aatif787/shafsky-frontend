import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { invalidateServerBrandingCache } from "./branding.server";
import { apiGet, apiPost, getTokenFromRequest } from "@/lib/FastApiClient";

export const getActiveBranding = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const res = await apiGet<any>("/api/branding/active");
      return res;
    } catch (err) {
      console.warn("[Branding Service] Exception fetching branding:", err);
      return null;
    }
  });

export const updateBrandingSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: any) => d as Record<string, any>)
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const result = await apiPost<any>("/api/admin/branding", data, token);
    
    // Invalidate server-side cache
    invalidateServerBrandingCache();

    return result;
  });
