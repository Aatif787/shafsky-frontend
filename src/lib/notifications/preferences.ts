/**
 * Notification Preferences Manager
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabase } from "@/integrations/supabase/client";

export interface Preferences {
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  in_app_enabled: boolean;
}

// Fetch user notification preferences
export const getUserPreferences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Preferences> => {
    const { supabase: s, userId } = context;
    try {
      const { data, error } = await (s as any)
        .from("notification_preferences")
        .select("email_enabled, whatsapp_enabled, in_app_enabled")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("[Preferences] Error fetching preferences:", error);
      }

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
  .handler(async ({ context, data }) => {
    const { supabase: s, userId } = context;
    try {
      const { error } = await (s as any).from("notification_preferences").upsert(
        {
          user_id: userId,
          email_enabled: data.email_enabled,
          whatsapp_enabled: data.whatsapp_enabled,
          in_app_enabled: data.in_app_enabled,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        } as any,
      );

      if (error) {
        console.error("[Preferences] Error updating preferences:", error);
        throw new Error(error.message);
      }

      return { success: true };
    } catch (e: any) {
      console.error("[Preferences] Exception updating preferences:", e);
      throw new Error(e.message || "Failed to update notification preferences.");
    }
  });
