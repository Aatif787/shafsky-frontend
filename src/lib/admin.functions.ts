import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth, optionalSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getUserRoles, isStaffUser } from "@/lib/permissions";
import { apiGet, apiPatch, getTokenFromRequest } from "@/lib/FastApiClient";

export const checkStaffAccess = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const roles = await getUserRoles(supabase, userId);
    const staff = await isStaffUser(supabase, userId);
    return { isStaff: staff, roles, userId };
  });

// ─── Admin Lounges ───
export const getAdminLounges = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    try {
      const token = getTokenFromRequest();
      const lounges = await apiGet<any[]>("/api/super-admin/lounges", token);
      return (lounges || []).map((lounge) => ({
        ...lounge,
        airport: null,
        queue_count: 0,
      }));
    } catch {
      return [];
    }
  });

export const updateLoungeStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { loungeId: string; status: string })
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    await apiPatch(`/api/super-admin/lounges/${data.loungeId}`, { status: data.status }, token);
    return { success: true };
  });

// ─── Staff Shifts ───
export const getStaffShifts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    try {
      const token = getTokenFromRequest();
      const shifts = await apiGet<any[]>("/api/super-admin/staff-shifts", token);
      return shifts || [];
    } catch {
      return [];
    }
  });

// ─── Admin Profile ───
export const getAdminProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    try {
      const token = getTokenFromRequest();
      const meRes = await apiGet<any>("/api/auth/profile", token);
      const me = meRes?.data || meRes;
      return {
        profile: {
          id: userId,
          full_name: me?.full_name || me?.email?.split("@")[0] || "Admin",
          phone: me?.phone_number || me?.phone || null,
          company: me?.company || null,
          avatar_url: me?.avatar_url || null,
          created_at: me?.created_at || "",
          updated_at: me?.updated_at || "",
          notes: null,
        },
        activity: [],
        roles: me?.role ? [me.role] : ["admin"],
      };
    } catch {
      return {
        profile: {
          id: userId,
          full_name: "Admin",
          phone: null,
          company: null,
          avatar_url: null,
          created_at: "",
          updated_at: "",
          notes: null,
        },
        activity: [],
        roles: ["admin"],
      };
    }
  });

export const updateAdminProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { full_name?: string; phone?: string; company?: string })
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    await apiPatch("/api/auth/profile", data, token);
    return { success: true };
  });
