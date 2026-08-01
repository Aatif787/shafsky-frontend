import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth, optionalSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { apiGet, apiPatch, apiPost, getTokenFromRequest } from "@/lib/FastApiClient";

// ─── Customer Profile ───
export const getCustomerProfileServer = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .handler(async () => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any>("/api/auth/profile", token);
      return res?.data || res || null;
    } catch (error) {
      console.warn("[getCustomerProfileServer] Warning:", error);
      return null;
    }
  });

export const updateCustomerProfileServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z.object({
      full_name: z.string().optional(),
      phone_number: z.string().optional(),
      avatar_url: z.string().optional(),
      company: z.string().optional(),
      passport_number: z.string().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    try {
      const token = getTokenFromRequest();
      const res = await apiPatch<any>("/api/auth/profile", data, token);
      return { success: true, data: res?.data || res };
    } catch (error) {
      console.error("[updateCustomerProfileServer] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to update profile" };
    }
  });

// ─── Customer Bookings ───
export const getCustomerBookingsServer = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any>("/api/airport/bookings/me", token);
      const data = res?.data || res;
      if (Array.isArray(data)) return data;
      const fallback = await apiGet<any>("/api/airport/bookings", token);
      return Array.isArray(fallback) ? fallback : fallback?.data ?? [];
    } catch (error) {
      console.warn("[getCustomerBookingsServer] Warning:", error);
      return [];
    }
  });

// ─── Customer Notifications ───
export const getCustomerNotificationsServer = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any>("/api/notifications", token);
      const data = res?.data || res;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn("[getCustomerNotificationsServer] Warning:", error);
      return [];
    }
  });

export const markCustomerNotificationsReadServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    try {
      const token = getTokenFromRequest();
      await apiPost("/api/notifications/read-all", {}, token);
      return { success: true };
    } catch (error) {
      console.error("[markCustomerNotificationsReadServer] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to mark notifications read" };
    }
  });

// ─── Change Password / Security ───
export const changeCustomerPasswordServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z.object({
      current_password: z.string().optional(),
      new_password: z.string().min(8),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    try {
      const token = getTokenFromRequest();
      await apiPost("/api/auth/change-password", data, token);
      return { success: true, message: "Password updated successfully" };
    } catch (error) {
      console.error("[changeCustomerPasswordServer] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Password change failed" };
    }
  });

// ─── Single Booking & Timeline ───
export const getCustomerBookingByIdServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any>(`/api/airport/bookings/${data.id}`, token);
      return res?.data || res || null;
    } catch (error) {
      console.warn("[getCustomerBookingByIdServer] Warning:", error);
      return null;
    }
  });

export const getCustomerBookingTimelineServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ booking_id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any>(`/api/airport/bookings/${data.booking_id}/timeline`, token);
      return Array.isArray(res) ? res : res?.data ?? [];
    } catch (error) {
      console.warn("[getCustomerBookingTimelineServer] Warning:", error);
      return [];
    }
  });

// ─── Attachments / Documents ───
export const getCustomerAttachmentsServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ entity_type: z.string(), entity_id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any>(`/api/shared/attachments/${data.entity_type}/${data.entity_id}`, token);
      return Array.isArray(res) ? res : res?.data ?? [];
    } catch (error) {
      console.warn("[getCustomerAttachmentsServer] Warning:", error);
      return [];
    }
  });

// ─── Single Notification Read ───
export const markSingleNotificationReadServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const token = getTokenFromRequest();
      await apiPost(`/api/notifications/${data.id}/read`, {}, token);
      return { success: true };
    } catch (error) {
      console.error("[markSingleNotificationReadServer] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to mark notification read" };
    }
  });
