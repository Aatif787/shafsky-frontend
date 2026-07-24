import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth, optionalSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getUserRoles } from "@/lib/permissions";
import { apiGet, apiPost, apiPatch, apiDelete, getTokenFromRequest } from "@/lib/FastApiClient";

export const checkSuperAdminAccess = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const roles = await getUserRoles(supabase, userId);
    return { roles, userId };
  });

// ─── Global KPIs ───
export const getSuperAdminKPIs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/admin/super/kpis", token);
    return res?.data || res || {
      totalUsers: 0,
      totalBookings: 0,
      totalRevenue: 0,
      adminCount: 0,
      airportCount: 0,
      loungeCount: 0,
      recentBookings: [],
      recentActivity: [],
    };
  });

// ─── Users ───
export const listAllUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/admin/users", token);
    return Array.isArray(res) ? res : res?.data ?? [];
  });

export const updateUserStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: any) => data as { targetUserId: string; action: "suspend" | "activate" | "delete" },
  )
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const res = await apiPatch<any>(`/api/admin/users/${data.targetUserId}/status`, data, token);
    return res?.data || res || { success: true };
  });

// ─── Enterprise User Management ───
export const createUserBySuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: any) =>
      data as {
        email: string;
        fullName: string;
        phone?: string;
        role: "admin" | "customer";
      },
  )
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const res = await apiPost<any>("/api/admin/users", data, token);
    return res?.data || res || { success: true, userId: res?.userId, email: data.email };
  });

export const updateUserRoleAndStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: any) =>
      data as {
        targetUserId: string;
        fullName?: string;
        role?: "admin" | "customer";
        status?: "active" | "disabled";
      },
  )
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const res = await apiPatch<any>(`/api/admin/users/${data.targetUserId}/role-status`, data, token);
    return res?.data || res || { success: true };
  });

export const requestUserPasswordResetBySuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { targetUserId: string; email: string })
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    try {
      await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${process.env.PUBLIC_URL || "https://shafsky.com"}/auth?mode=reset`,
      });
    } catch (_) {
      /* ignore */
    }
    return { success: true, message: `Password reset email dispatched to ${data.email}` };
  });

// ─── Admins ───
export const createAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { targetUserId: string; role: string })
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const res = await apiPost<any>(`/api/admin/staff/${data.targetUserId}/toggle-active`, { role: data.role, isActive: true }, token);
    return res?.data || res || { success: true };
  });

export const removeAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { targetUserId: string; role: string })
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const res = await apiPost<any>(`/api/admin/staff/${data.targetUserId}/toggle-active`, { role: data.role, isActive: false }, token);
    return res?.data || res || { success: true };
  });

// ─── Roles & Permissions ───
export const listRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/admin/roles", token);
    return res?.data || res || {
      roles: [],
      permissions: [],
      matrix: {},
    };
  });

export const toggleRolePermission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { roleName: string; permissionId: string; grant: boolean })
  .handler(async () => {
    throw new Error(
      "Roles and permissions are statically configured in this simplified deployment.",
    );
  });

// ─── Airports ───
export const listAirports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/admin/airports", token);
    return Array.isArray(res) ? res : res?.data ?? [];
  });

export const getActiveAirports = createServerFn({ method: "GET" })
  .handler(async () => {
    const res = await apiGet<any>("/api/services-config/active");
    return Array.isArray(res) ? res : res?.data ?? [];
  });

export const upsertAirport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: any) =>
      data as {
        id?: string;
        code: string;
        name: string;
        city: string;
        country?: string;
        image_url?: string;
        supported_services?: string[];
        terminals?: string[];
        is_active?: boolean;
      },
  )
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const res = await apiPost<any>("/api/admin/airports", data, token);
    return res?.data || res || { success: true };
  });

export const deleteAirport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { id: string })
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    await apiDelete<any>(`/api/admin/airports/${data.id}`, token);
    return { success: true };
  });

// ─── Lounges (Super Admin) ───
export const listSALounges = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/admin/lounges", token);
    return Array.isArray(res) ? res : res?.data ?? [];
  });

export const upsertLounge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as Record<string, unknown>)
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const res = await apiPost<any>("/api/admin/lounges", data, token);
    return res?.data || res || { success: true };
  });

// ─── Coupons ───
export const listCoupons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/admin/coupons", token);
    return Array.isArray(res) ? res : res?.data ?? [];
  });

export const createCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: any) =>
      data as { code: string; discount_percent: number; max_uses?: number; expires_at?: string },
  )
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const res = await apiPost<any>("/api/admin/coupons", data, token);
    return res?.data || res || { success: true };
  });

export const toggleCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { id: string; is_active: boolean })
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const res = await apiPatch<any>(`/api/admin/coupons/${data.id}/toggle`, data, token);
    return res?.data || res || { success: true };
  });

export const deleteCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { id: string })
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    await apiDelete<any>(`/api/admin/coupons/${data.id}`, token);
    return { success: true };
  });

// ─── Feature Flags ───
export const listFeatureFlags = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/admin/feature-flags", token);
    return Array.isArray(res) ? res : res?.data ?? [];
  });

export const toggleFeatureFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { id: string; is_enabled: boolean })
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const res = await apiPatch<any>(`/api/admin/feature-flags/${data.id}`, data, token);
    return res?.data || res || { success: true };
  });

// ─── Security ───
export const listSecurityEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/admin/security-events", token);
    return res?.data || res || { events: [], ipRestrictions: [] };
  });

export const addIpRestriction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { ip_address: string; type: string; reason?: string })
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const res = await apiPost<any>("/api/admin/ip-restrictions", data, token);
    return res?.data || res || { success: true };
  });

// ─── Audit Logs ───
export const getAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/admin/security-events", token);
    return Array.isArray(res) ? res : res?.data?.events ?? [];
  });

// ─── System Settings ───
export const listSystemSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/admin/system-settings", token);
    return Array.isArray(res) ? res : res?.data ?? [];
  });

export const upsertSystemSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { key: string; value: unknown })
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const res = await apiPost<any>("/api/admin/system-settings", data, token);
    return res?.data || res || { success: true };
  });

// ─── Payments / Transactions ───
export const listTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/admin/transactions", token);
    return Array.isArray(res) ? res : res?.data ?? [];
  });

export const bootstrapFirstSuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const token = getTokenFromRequest();
    const res = await apiPost<any>("/api/admin/users", { role: "super_admin" }, token);
    return res?.data || res || { success: true };
  });
