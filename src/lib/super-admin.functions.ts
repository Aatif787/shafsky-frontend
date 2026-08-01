import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth, optionalSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getUserRoles } from "@/lib/permissions";
import { apiGet, apiPost, apiPatch, apiDelete, getTokenFromRequest } from "@/lib/FastApiClient";
import type {
  SuperAdminKPIs,
  UserProfile,
  LoungeItem,
  CouponItem,
  SystemSettingItem,
} from "@/types/fastapi";

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
  .handler(async (): Promise<SuperAdminKPIs> => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<SuperAdminKPIs>("/api/admin/super/kpis", token);
      return (
        res || {
          totalUsers: 0,
          totalBookings: 0,
          totalRevenue: 0,
          activeLounges: 0,
          activeCoupons: 0,
          pendingCases: 0,
        }
      );
    } catch (error) {
      console.warn("[getSuperAdminKPIs] Warning:", error);
      return {
        totalUsers: 0,
        totalBookings: 0,
        totalRevenue: 0,
        activeLounges: 0,
        activeCoupons: 0,
        pendingCases: 0,
      };
    }
  });

// ─── Users ───
export const listAllUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<UserProfile[]> => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<UserProfile[]>("/api/admin/users", token);
      return Array.isArray(res) ? res : [];
    } catch (error) {
      console.warn("[listAllUsers] Warning:", error);
      return [];
    }
  });

export const updateUserStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => data as { targetUserId: string; action: "suspend" | "activate" | "delete" })
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = getTokenFromRequest();
      await apiPatch(`/api/admin/users/${data.targetUserId}/status`, data, token);
      return { success: true };
    } catch (error) {
      console.error("[updateUserStatus] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to update status" };
    }
  });

export const updateUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => data as { targetUserId: string; role: string })
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = getTokenFromRequest();
      await apiPatch(`/api/admin/users/${data.targetUserId}/role`, data, token);
      return { success: true };
    } catch (error) {
      console.error("[updateUserRole] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to update role" };
    }
  });

export const updateUserRoleAndStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => data as { targetUserId: string; role?: string; is_suspended?: boolean })
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = getTokenFromRequest();
      await apiPatch(`/api/admin/users/${data.targetUserId}/role`, data, token);
      return { success: true };
    } catch (error) {
      console.error("[updateUserRoleAndStatus] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to update user profile" };
    }
  });

// ─── Roles & Permissions ───
export const listRoleMatrix = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<Record<string, string[]>> => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any>("/api/admin/roles", token);
      return res?.data || res || {};
    } catch (error) {
      console.warn("[listRoleMatrix] Warning:", error);
      return {};
    }
  });

export const updateRolePermissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => data as { role: string; permissions: string[] })
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = getTokenFromRequest();
      await apiPatch("/api/admin/roles/permissions", data, token);
      return { success: true };
    } catch (error) {
      console.error("[updateRolePermissions] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to update permissions" };
    }
  });

// ─── Airports ───
export const listAirports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<any[]> => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any[]>("/api/admin/airports", token);
      return Array.isArray(res) ? res : [];
    } catch (error) {
      console.warn("[listAirports] Warning:", error);
      return [];
    }
  });

export const createAirport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => data as Record<string, unknown>)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = getTokenFromRequest();
      await apiPost("/api/admin/airports", data, token);
      return { success: true };
    } catch (error) {
      console.error("[createAirport] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to create airport" };
    }
  });

export const updateAirport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => data as { id: string; updateData: Record<string, unknown> })
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = getTokenFromRequest();
      await apiPatch(`/api/admin/airports/${data.id}`, data.updateData, token);
      return { success: true };
    } catch (error) {
      console.error("[updateAirport] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to update airport" };
    }
  });

export const deleteAirport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = getTokenFromRequest();
      await apiDelete(`/api/admin/airports/${data.id}`, undefined, token);
      return { success: true };
    } catch (error) {
      console.error("[deleteAirport] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to delete airport" };
    }
  });

// ─── Lounges (Super Admin) ───
export const listSALounges = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<LoungeItem[]> => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<LoungeItem[]>("/api/admin/lounges", token);
      return Array.isArray(res) ? res : [];
    } catch (error) {
      console.warn("[listSALounges] Warning:", error);
      return [];
    }
  });

export const upsertLounge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => data as Record<string, unknown>)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = getTokenFromRequest();
      await apiPost("/api/admin/lounges", data, token);
      return { success: true };
    } catch (error) {
      console.error("[upsertLounge] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to save lounge" };
    }
  });

// ─── Coupons ───
export const listCoupons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<CouponItem[]> => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any>("/api/admin/coupons", token);
      const data = res?.data || res;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn("[listCoupons] Warning:", error);
      return [];
    }
  });

export const createCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => data as { code: string; discount_percent: number; max_uses?: number; expires_at?: string })
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = getTokenFromRequest();
      await apiPost("/api/admin/coupons", data, token);
      return { success: true };
    } catch (error) {
      console.error("[createCoupon] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to create coupon" };
    }
  });

export const toggleCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => data as { id: string; is_active: boolean })
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = getTokenFromRequest();
      await apiPatch(`/api/admin/coupons/${data.id}/toggle`, data, token);
      return { success: true };
    } catch (error) {
      console.error("[toggleCoupon] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to toggle coupon" };
    }
  });

export const deleteCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = getTokenFromRequest();
      await apiDelete(`/api/admin/coupons/${data.id}`, undefined, token);
      return { success: true };
    } catch (error) {
      console.error("[deleteCoupon] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to delete coupon" };
    }
  });

// ─── Feature Flags ───
export const listFeatureFlags = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<any[]> => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any>("/api/admin/feature-flags", token);
      const data = res?.data || res;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn("[listFeatureFlags] Warning:", error);
      return [];
    }
  });

export const toggleFeatureFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => data as { id: string; is_enabled: boolean })
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = getTokenFromRequest();
      await apiPatch(`/api/admin/feature-flags/${data.id}`, data, token);
      return { success: true };
    } catch (error) {
      console.error("[toggleFeatureFlag] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to toggle feature flag" };
    }
  });

// ─── Security ───
export const listSecurityEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<{ events: any[]; ipRestrictions: any[] }> => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<{ events?: any[]; ipRestrictions?: any[] }>("/api/admin/security-events", token);
      return { events: res?.events || [], ipRestrictions: res?.ipRestrictions || [] };
    } catch (error) {
      console.warn("[listSecurityEvents] Warning:", error);
      return { events: [], ipRestrictions: [] };
    }
  });

export const addIpRestriction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => data as { ip_address: string; type: string; reason?: string })
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = getTokenFromRequest();
      await apiPost("/api/admin/ip-restrictions", data, token);
      return { success: true };
    } catch (error) {
      console.error("[addIpRestriction] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to add IP restriction" };
    }
  });

// ─── Audit Logs ───
export const getAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<any[]> => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any>("/api/admin/audit-logs", token);
      return Array.isArray(res) ? res : res?.data ?? [];
    } catch (error) {
      console.warn("[getAuditLogs] Warning:", error);
      return [];
    }
  });

// ─── System Settings ───
export const listSystemSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<SystemSettingItem[]> => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<SystemSettingItem[]>("/api/admin/system-settings", token);
      return Array.isArray(res) ? res : [];
    } catch (error) {
      console.warn("[listSystemSettings] Warning:", error);
      return [];
    }
  });

export const upsertSystemSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => data as { key: string; value: unknown })
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = getTokenFromRequest();
      await apiPost("/api/admin/system-settings", data, token);
      return { success: true };
    } catch (error) {
      console.error("[upsertSystemSetting] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to save setting" };
    }
  });

// ─── Payments / Transactions ───
export const listTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<any[]> => {
    try {
      const token = getTokenFromRequest();
      const res = await apiGet<any[]>("/api/admin/transactions", token);
      return Array.isArray(res) ? res : [];
    } catch (error) {
      console.warn("[listTransactions] Warning:", error);
      return [];
    }
  });

export const bootstrapFirstSuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = getTokenFromRequest();
      await apiPost("/api/admin/users", { role: "super_admin" }, token);
      return { success: true };
    } catch (error) {
      console.error("[bootstrapFirstSuperAdmin] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to bootstrap super admin" };
    }
  });

// Aliases for route imports
export const listRoles = listRoleMatrix;
export const toggleRolePermission = updateRolePermissions;
export const upsertAirport = createAirport;
export const createAdminRole = updateUserRole;
export const removeAdminRole = updateUserRole;

export const createUserBySuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => data as Record<string, unknown>)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = getTokenFromRequest();
      await apiPost("/api/admin/users", data, token);
      return { success: true };
    } catch (error) {
      console.error("[createUserBySuperAdmin] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to create user" };
    }
  });

export const requestUserPasswordResetBySuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => data as { email?: string; userId?: string })
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = getTokenFromRequest();
      await apiPost("/api/admin/users/password-reset", data, token);
      return { success: true };
    } catch (error) {
      console.error("[requestUserPasswordResetBySuperAdmin] Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to trigger password reset" };
    }
  });
