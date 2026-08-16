import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth, optionalSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { enqueueNotification } from "@/lib/notifications/queue";
import { checkBookingEligibility, parseFlightDateTime } from "@/services/flight/FlightTimeUtils";
import { apiGet, apiPost, apiPatch, apiDelete, getTokenFromRequest } from "@/lib/FastApiClient";
import { assertPermission, assertStaffUser, isStaffUser } from "@/lib/permissions";
import { requireAdminRole } from "@/lib/admin.middleware";
import type { Json, Database } from "@/integrations/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export const updateBookingDetailsServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { bookingId: string; updateData: Record<string, unknown> })
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const res = await apiPatch<any>(`/api/airport/bookings/${data.bookingId}`, data.updateData, token);
    return res?.data || res || { success: true };
  });

export const getBookingFullDetailsServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { bookingId: string })
  .handler(async ({ data }) => {
    try {
      const token = getTokenFromRequest();
      const detail = await apiGet<any>(`/api/airport/bookings/${data.bookingId}`, token);
      return detail?.data || detail || null;
    } catch {
      return null;
    }
  });

export const getPublicBookingVerificationServer = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: bookingId }) => {
    try {
      const bookingData = await apiGet<any>(`/api/airport/bookings/${bookingId}`);
      return bookingData?.data || bookingData || null;
    } catch {
      return null;
    }
  });

export const listUserBookingsServer = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any>("/api/airport/bookings/me", token);
      const data = res?.data || res;
      if (Array.isArray(data)) return data;
      const fallback = await apiGet<any>("/api/airport/bookings", token);
      return Array.isArray(fallback) ? fallback : fallback?.data ?? [];
    } catch {
      return [];
    }
  });

export const cancelMyBookingServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ bookingId: z.string().min(1), reason: z.string().optional() }).parse(data))
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const reason = data.reason ? `?reason=${encodeURIComponent(data.reason)}` : "";
    const res = await apiPost<any>(`/api/airport/bookings/${data.bookingId}/cancel${reason}`, {}, token);
    return res?.data || res || { success: true };
  });
