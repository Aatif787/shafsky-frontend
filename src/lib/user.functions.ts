import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth, optionalSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { apiGet, apiPatch, apiPost, getTokenFromRequest } from "@/lib/FastApiClient";
import type { UserProfile, NotificationItem } from "@/types/fastapi";

export const getCurrentUserProfileServer = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .handler(async (): Promise<UserProfile | null> => {
    try {
      const token = getTokenFromRequest();
      const me = await apiGet<UserProfile>("/api/me", token);
      return me || null;
    } catch (error) {
      console.warn("[getCurrentUserProfileServer] Profile fetch warning:", error);
      return null;
    }
  });

export const updateMyProfileServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => data as Record<string, unknown>)
  .handler(async ({ data }): Promise<{ success: boolean; data?: UserProfile; error?: string }> => {
    try {
      const token = getTokenFromRequest();
      const res = await apiPatch<UserProfile>("/api/me", data, token);
      return { success: true, data: res };
    } catch (error) {
      console.error("[updateMyProfileServer] Profile update error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to update profile" };
    }
  });

export const markMyNotificationsReadServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = getTokenFromRequest();
      await apiPost("/api/notifications/mark-read", { all: true }, token);
      return { success: true };
    } catch (error) {
      console.error("[markMyNotificationsReadServer] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to mark notifications read" };
    }
  });

export const getMyNotificationsServer = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<NotificationItem[]> => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<NotificationItem[]>("/api/notifications/my", token);
      return res || [];
    } catch (error) {
      console.warn("[getMyNotificationsServer] Warning:", error);
      return [];
    }
  });
