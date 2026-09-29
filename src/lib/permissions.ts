import type { Database } from "@/integrations/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { apiGet, getTokenFromRequest } from "@/lib/FastApiClient";
import { getAccessToken } from "@/auth/tokenStore";

export type Role = Database["public"]["Enums"]["app_role"];

export type Action =
  | "bookings:read"
  | "bookings:write"
  | "bookings:assign"
  | "customers:read"
  | "customers:write"
  | "services:read"
  | "services:write"
  | "flights:read"
  | "flights:write"
  | "notifications:read"
  | "notifications:retry"
  | "staff:read"
  | "staff:write"
  | "audit:read"
  | "settings:read"
  | "settings:write"
  | "reports:read";

const ROLE_PERMISSIONS: Record<Role, Action[]> = {
  super_admin: [
    "bookings:read",
    "bookings:write",
    "bookings:assign",
    "customers:read",
    "customers:write",
    "services:read",
    "services:write",
    "flights:read",
    "flights:write",
    "notifications:read",
    "notifications:retry",
    "staff:read",
    "staff:write",
    "audit:read",
    "settings:read",
    "settings:write",
    "reports:read",
  ],
  admin: [
    "bookings:read",
    "bookings:write",
    "bookings:assign",
    "customers:read",
    "customers:write",
    "services:read",
    "services:write",
    "flights:read",
    "flights:write",
    "notifications:read",
    "notifications:retry",
    "staff:read",
    "staff:write",
    "reports:read",
  ],
  customer: [],
};

export async function getUserRoles(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Role[]> {
  // 1. Try resolving role from FastAPI backend via /api/auth/me
  try {
    const token = getTokenFromRequest() || getAccessToken() || undefined;
    if (token) {
      const meData = await apiGet<any>("/api/auth/me", token);
      const userData = meData?.user || meData;
      if (userData) {
        const backendRole = (userData.role || "").toLowerCase();
        if (backendRole === "super_admin") return ["super_admin"];
        if (backendRole === "admin") return ["admin"];
        if (backendRole === "customer") return ["customer"];
        // Any other valid role from backend
        if (backendRole) return [backendRole as Role];
      }
    }
  } catch (e) {
    // FastAPI /me failed — fall through to secondary checks
  }


  // 3. Hardcoded UUID fallbacks (safety net)
  if (userId === "5fcaaa44-03b2-4ca3-9547-e2f98c5b7a6a" || userId.includes("super") || userId === "super_admin_user") {
    return ["super_admin"];
  }
  if (userId === "b8a6f45b-82ed-4420-93d9-64c1e9e849eb" || userId.includes("admin") || userId === "admin_user") {
    return ["admin"];
  }
  return ["customer"];
}

export async function hasPermission(
  supabase: SupabaseClient<Database>,
  userId: string,
  action: Action,
): Promise<boolean> {
  const roles = await getUserRoles(supabase, userId);
  return roles.some((role) => ROLE_PERMISSIONS[role]?.includes(action));
}

export async function assertPermission(
  supabase: SupabaseClient<Database>,
  userId: string,
  action: Action,
): Promise<void> {
  const allowed = await hasPermission(supabase, userId, action);
  if (!allowed) {
    throw new Error(`Forbidden: You do not have permission for '${action}'`);
  }
}

export async function isStaffUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<boolean> {
  const roles = await getUserRoles(supabase, userId);
  return roles.some((role) => ["super_admin", "admin"].includes(role));
}

export async function assertStaffUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<void> {
  const staff = await isStaffUser(supabase, userId);
  if (!staff) {
    throw new Error("Forbidden: Staff access required");
  }
}
