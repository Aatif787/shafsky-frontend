import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdminRole } from "@/lib/admin.middleware";
import { apiGet, apiPost, apiPatch, apiDelete, getTokenFromRequest } from "@/lib/FastApiClient";

// ─── Dashboard Metrics ───
export const getAdminDashboardMetricsFn = createServerFn({ method: "GET" })
  .middleware([requireAdminRole])
  .handler(async () => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any>("/api/admin/dashboard", token);
      const bookingsRes = await apiGet<any>("/api/airport/bookings", token);
      const bookings = Array.isArray(bookingsRes) ? bookingsRes : bookingsRes?.data ?? [];
      const metricsData = res?.data || res || {};

      return {
        bookings,
        messages: [],
        notifFailures: 0,
        recentActivity: [],
        status: metricsData.status || "Active",
        dailyRevenueINR: metricsData.dailyRevenueINR || 0,
        todayBookings: metricsData.todayBookings || bookings.length,
        completedToday: metricsData.completedToday || 0,
      };
    } catch (error) {
      console.warn("[getAdminDashboardMetricsFn] Error:", error);
      return { bookings: [], messages: [], notifFailures: 0, recentActivity: [] };
    }
  });

// ─── System Health ───
export const getSystemHealthFn = createServerFn({ method: "GET" })
  .middleware([requireAdminRole])
  .handler(async () => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any>("/api/health", token);
      return res || { status: "healthy", timestamp: new Date().toISOString() };
    } catch (error) {
      console.warn("[getSystemHealthFn] Error:", error);
      return { status: "degraded", error: String(error) };
    }
  });

// ─── Shared Timeline & Activity Feed ───
export const getEntityTimelineFn = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((d: unknown) => z.object({ entity_type: z.string(), entity_id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any>(`/api/shared/timeline/${data.entity_type}/${data.entity_id}`, token);
      return Array.isArray(res) ? res : res?.data ?? [];
    } catch (error) {
      console.warn("[getEntityTimelineFn] Error:", error);
      return [];
    }
  });

export const addTimelineCommentFn = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((d: unknown) => z.object({ entity_type: z.string(), entity_id: z.string(), comment: z.string() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const token = getTokenFromRequest();
      const res = await apiPost<any>("/api/shared/timeline/comment", data, token);
      return res?.data || res || { success: true };
    } catch (error) {
      console.error("[addTimelineCommentFn] Error:", error);
      return { success: false, error: String(error) };
    }
  });

// ─── Workflow History ───
export const getWorkflowHistoryFn = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((d: unknown) => z.object({ instance_id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any>(`/api/workflows/instances/${data.instance_id}/history`, token);
      return Array.isArray(res) ? res : res?.data ?? [];
    } catch (error) {
      console.warn("[getWorkflowHistoryFn] Error:", error);
      return [];
    }
  });

// ─── Staff Assignments & Workload ───
export const assignStaffFn = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((d: unknown) =>
    z.object({
      booking_id: z.string(),
      staff_user_id: z.string(),
      role_type: z.string(),
      notes: z.string().optional(),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    try {
      const token = getTokenFromRequest();
      const res = await apiPost<any>("/api/shared/assignments", data, token);
      return res?.data || res || { success: true };
    } catch (error) {
      console.error("[assignStaffFn] Error:", error);
      return { success: false, error: String(error) };
    }
  });

export const getStaffWorkloadFn = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((d: unknown) => z.object({ staff_user_id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any>(`/api/shared/assignments/workload/${data.staff_user_id}`, token);
      return res?.data || res || { activeAssignments: 0 };
    } catch (error) {
      console.warn("[getStaffWorkloadFn] Error:", error);
      return { activeAssignments: 0 };
    }
  });

// ─── Shared Notes ───
export const getEntityNotesFn = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((d: unknown) => z.object({ entity_type: z.string(), entity_id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any>(`/api/shared/notes/${data.entity_type}/${data.entity_id}`, token);
      return Array.isArray(res) ? res : res?.data ?? [];
    } catch (error) {
      console.warn("[getEntityNotesFn] Error:", error);
      return [];
    }
  });

export const createNoteFn = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((d: unknown) =>
    z.object({
      entity_type: z.string(),
      entity_id: z.string(),
      content: z.string(),
      is_internal: z.boolean().optional(),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    try {
      const token = getTokenFromRequest();
      const res = await apiPost<any>("/api/shared/notes", data, token);
      return res?.data || res || { success: true };
    } catch (error) {
      console.error("[createNoteFn] Error:", error);
      return { success: false, error: String(error) };
    }
  });

// ─── Attachments ───
export const getEntityAttachmentsFn = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((d: unknown) => z.object({ entity_type: z.string(), entity_id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any>(`/api/shared/attachments/${data.entity_type}/${data.entity_id}`, token);
      return Array.isArray(res) ? res : res?.data ?? [];
    } catch (error) {
      console.warn("[getEntityAttachmentsFn] Error:", error);
      return [];
    }
  });

export const registerAttachmentFn = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((d: unknown) =>
    z.object({
      entity_type: z.string(),
      entity_id: z.string(),
      filename: z.string(),
      storage_path: z.string(),
      category: z.string().optional(),
      access_level: z.string().optional(),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    try {
      const token = getTokenFromRequest();
      const res = await apiPost<any>("/api/shared/attachments/register", data, token);
      return res?.data || res || { success: true };
    } catch (error) {
      console.error("[registerAttachmentFn] Error:", error);
      return { success: false, error: String(error) };
    }
  });

// ─── SLA Tracking ───
export const startSLAFn = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((d: unknown) =>
    z.object({
      entity_type: z.string(),
      entity_id: z.string(),
      sla_code: z.string(),
      target_resolution_hours: z.number().optional(),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    try {
      const token = getTokenFromRequest();
      const res = await apiPost<any>("/api/shared/sla/start", data, token);
      return res?.data || res || { success: true };
    } catch (error) {
      console.error("[startSLAFn] Error:", error);
      return { success: false, error: String(error) };
    }
  });

export const resolveSLAFn = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((d: unknown) => z.object({ sla_instance_id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const token = getTokenFromRequest();
      const res = await apiPost<any>(`/api/shared/sla/${data.sla_instance_id}/resolve`, {}, token);
      return res?.data || res || { success: true };
    } catch (error) {
      console.error("[resolveSLAFn] Error:", error);
      return { success: false, error: String(error) };
    }
  });
