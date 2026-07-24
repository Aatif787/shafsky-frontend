/**
 * Notification Preferences Manager
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { apiGet, apiPost, getTokenFromRequest } from "@/lib/FastApiClient";

export interface Preferences {
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  in_app_enabled: boolean;
}

// Fetch user notification preferences
export const getUserPreferences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<Preferences> => {
    try {
      const token = getTokenFromRequest();
      const data = await apiGet<Preferences>("/api/notifications/preferences", token);
      return {
        email_enabled: data?.email_enabled ?? true,
        whatsapp_enabled: data?.whatsapp_enabled ?? true,
        in_app_enabled: data?.in_app_enabled ?? true,
      };
    } catch (e) {
      console.error("[Preferences] Exception fetching preferences:", e);
      return { email_enabled: true, whatsapp_enabled: true, in_app_enabled: true };
    }
  });

// Update user notification preferences
export const updateUserPreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as Preferences)
  .handler(async ({ data }) => {
    try {
      const token = getTokenFromRequest();
      await apiPost("/api/notifications/preferences", data, token);
      return { success: true };
    } catch (e: any) {
      console.error("[Preferences] Exception updating preferences:", e);
      throw new Error(e.message || "Failed to update notification preferences.");
    }
  });
