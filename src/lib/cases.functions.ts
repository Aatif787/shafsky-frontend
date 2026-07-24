import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth, optionalSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { apiGet, apiPost, apiPatch, getTokenFromRequest } from "@/lib/FastApiClient";

export const createSupportCase = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        customerId: z.string().optional(),
        bookingId: z.string().optional(),
        caseType: z.string(),
        subject: z.string(),
        message: z.string(),
        email: z.string().email(),
        name: z.string(),
        phone: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const res = await apiPost<any>("/api/cases", data, token);
    return res?.data || res;
  });

export const updateCaseStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        caseId: z.string(),
        status: z.enum([
          "OPEN",
          "ASSIGNED",
          "IN_PROGRESS",
          "WAITING_FOR_CUSTOMER",
          "WAITING_FOR_INTERNAL_TEAM",
          "RESOLVED",
          "CUSTOMER_CONFIRMED",
          "CLOSED",
        ]),
      })
      .parse(data),
  )
  .handler(async ({ data: { caseId, status } }) => {
    const token = getTokenFromRequest();
    const res = await apiPatch<any>(`/api/cases/${caseId}/status`, { status }, token);
    return res?.data || res || { success: true };
  });

export const claimCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ caseId: z.string() }).parse(data))
  .handler(async ({ data: { caseId } }) => {
    const token = getTokenFromRequest();
    const res = await apiPost<any>(`/api/cases/${caseId}/claim`, {}, token);
    return res?.data || res || { success: true };
  });

export const assignCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        caseId: z.string(),
        adminId: z.string().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data: { caseId, adminId } }) => {
    const token = getTokenFromRequest();
    const res = await apiPost<any>(`/api/cases/${caseId}/assign`, { adminId }, token);
    return res?.data || res || { success: true };
  });

export const addCaseMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        caseId: z.string(),
        message: z.string(),
        attachments: z.array(z.any()).optional(),
        isInternal: z.boolean().default(false),
        noteCategory: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const res = await apiPost<any>(`/api/cases/${data.caseId}/messages`, data, token);
    return res?.data || res;
  });

export const submitCSATRating = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        caseId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const res = await apiPost<any>(`/api/cases/${data.caseId}/csat`, data, token);
    return res?.data || res || { success: true };
  });

export const listSupportCases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        customerId: z.string().optional(),
        status: z.string().optional(),
        priority: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data: { customerId, status, priority } }) => {
    const token = getTokenFromRequest();
    const params = new URLSearchParams();
    if (customerId) params.set("customerId", customerId);
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const res = await apiGet<any>(`/api/cases${queryStr}`, token);
    return Array.isArray(res) ? res : res?.data ?? [];
  });

export const getCaseDetails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ caseId: z.string() }).parse(data))
  .handler(async ({ data: { caseId } }) => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>(`/api/cases/${caseId}`, token);
    return res?.data || res;
  });

export const listCaseMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ caseId: z.string() }).parse(data))
  .handler(async ({ data: { caseId } }) => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>(`/api/cases/${caseId}/messages`, token);
    return Array.isArray(res) ? res : res?.data ?? [];
  });

export const listCaseAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ caseId: z.string() }).parse(data))
  .handler(async ({ data: { caseId } }) => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>(`/api/cases/${caseId}/audit-logs`, token);
    return Array.isArray(res) ? res : res?.data ?? [];
  });

export const listSavedReplies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/cases/saved-replies", token);
    return Array.isArray(res) ? res : res?.data ?? [];
  });

export const getCaseAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/cases/analytics", token);
    return res?.data || res || {
      openCount: 0,
      resolvedCount: 0,
      closedCount: 0,
      criticalCount: 0,
      slaViolations: 0,
      avgResolutionTimeMins: 45,
      csatRating: 4.8,
    };
  });
