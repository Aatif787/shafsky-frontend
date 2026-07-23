import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth, optionalSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getUserRoles } from "@/lib/permissions";

export const checkSuperAdminAccess = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const roles = await getUserRoles(supabase, userId);
    return { roles, userId };
  });

// Helper: assert super_admin role
async function assertSuperAdmin(supabase: any, userId: string) {
  const roles = await getUserRoles(supabase, userId);
  if (!roles.includes("super_admin")) {
    throw new Error("Forbidden: Super admin access required");
  }
}

// ─── Global KPIs ───
export const getSuperAdminKPIs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const [
      { count: userCount },
      { count: bookingCount },
      { data: revenueData },
      { count: adminCount },
      { count: airportCount },
      { count: loungeCount },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("quote_amount").in("status", ["confirmed", "completed"]),
      supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .in("role", ["admin", "super_admin"]),
      supabase.from("airports").select("*", { count: "exact", head: true }),
      supabase.from("lounges").select("*", { count: "exact", head: true }),
    ]);

    const revenue = (revenueData || []).reduce(
      (sum: number, b: Record<string, unknown>) => sum + (Number(b.quote_amount) || 0),
      0,
    );

    // Recent bookings for chart (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentBookings } = await supabase
      .from("bookings")
      .select("created_at, status, quote_amount")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: true });

    // Recent audit activity
    const { data: recentActivity } = await supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    return {
      totalUsers: userCount || 0,
      totalBookings: bookingCount || 0,
      totalRevenue: revenue,
      adminCount: adminCount || 0,
      airportCount: airportCount || 0,
      loungeCount: loungeCount || 0,
      recentBookings: recentBookings || [],
      recentActivity: recentActivity || [],
    };
  });

// ─── Users ───
export const listAllUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const { data: roles } = await supabase.from("user_roles").select("user_id, role");

    const roleMap = new Map<string, string[]>();
    (roles || []).forEach((r) => {
      const existing = roleMap.get(r.user_id) || [];
      existing.push(r.role);
      roleMap.set(r.user_id, existing);
    });

    return (profiles || []).map((p) => ({
      ...p,
      roles: roleMap.get(p.id) || ["customer"],
      is_active: true,
    }));
  });

export const updateUserStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: any) => data as { targetUserId: string; action: "suspend" | "activate" | "delete" },
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    if (data.action === "delete") {
      await supabase.from("user_roles").delete().eq("user_id", data.targetUserId);
      await supabase.from("profiles").delete().eq("id", data.targetUserId);
    } else {
      const isActive = data.action === "activate";
      await supabase
        .from("user_roles")
        .update({ is_active: isActive } as never)
        .eq("user_id", data.targetUserId);
    }

    await supabase.from("audit_log").insert({
      actor_id: userId,
      action: `user.${data.action}`,
      entity: "profiles",
      entity_id: data.targetUserId,
    } as never);

    return { success: true };
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
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    if ((data.role as string) === "super_admin") {
      throw new Error("Super Admin accounts cannot be created via the User Management portal.");
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.fullName.trim();

    // Check existing profile
    const { data: existing } = await (supabase.from("profiles") as any)
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    const newUserId = "usr_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();

    // Insert profile
    const { error: profileErr } = await (supabase.from("profiles") as any).insert({
      id: newUserId,
      full_name: cleanName,
      email: cleanEmail,
      phone: data.phone?.trim() || null,
      status: "active",
      created_at: new Date().toISOString(),
    });

    if (profileErr) {
      console.error("Error creating user profile in super-admin:", profileErr);
    }

    // Insert role into user_roles
    await supabase.from("user_roles").insert({
      user_id: newUserId,
      role: data.role as any,
    });

    // Record audit log entry
    await supabase.from("audit_log").insert({
      actor_id: userId,
      action: "user.create",
      entity: "profiles",
      entity_id: newUserId,
      metadata: { email: cleanEmail, role: data.role, fullName: cleanName },
    } as never);

    return { success: true, userId: newUserId, email: cleanEmail };
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
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    if (data.targetUserId === userId && data.status === "disabled") {
      throw new Error("Self-lockout guard: You cannot disable your own active Super Admin account.");
    }

    if (data.targetUserId === userId && data.role && (data.role as string) !== "super_admin") {
      throw new Error("Self-lockout guard: You cannot demote your own active Super Admin account.");
    }

    if (data.role && (data.role as string) === "super_admin") {
      throw new Error("Role cannot be elevated to super_admin via UI.");
    }

    const updateObj: Record<string, any> = {};
    if (data.fullName) updateObj.full_name = data.fullName.trim();
    if (data.status) updateObj.status = data.status;

    if (Object.keys(updateObj).length > 0) {
      await (supabase.from("profiles") as any)
        .update(updateObj)
        .eq("id", data.targetUserId);
    }

    if (data.role) {
      await supabase.from("user_roles").delete().eq("user_id", data.targetUserId);
      await supabase.from("user_roles").insert({
        user_id: data.targetUserId,
        role: data.role as any,
      });
    }

    await supabase.from("audit_log").insert({
      actor_id: userId,
      action:
        data.status === "disabled"
          ? "user.disable"
          : data.status === "active"
            ? "user.enable"
            : "user.update",
      entity: "profiles",
      entity_id: data.targetUserId,
      metadata: { role: data.role, status: data.status, fullName: data.fullName },
    } as never);

    return { success: true };
  });

export const requestUserPasswordResetBySuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { targetUserId: string; email: string })
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    await supabase.from("audit_log").insert({
      actor_id: userId,
      action: "user.password_reset_requested",
      entity: "profiles",
      entity_id: data.targetUserId,
      metadata: { recipientEmail: data.email },
    } as never);

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
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const { error } = await supabase.from("user_roles").insert({
      user_id: data.targetUserId,
      role: data.role as any,
    });

    if (error) throw new Error(error.message);

    await supabase.from("audit_log").insert({
      actor_id: userId,
      action: `admin.role.assigned`,
      entity: "user_roles",
      entity_id: data.targetUserId,
      metadata: { role: data.role },
    } as never);

    return { success: true };
  });

export const removeAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { targetUserId: string; role: string })
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", data.targetUserId)
      .eq("role", data.role as any);

    await supabase.from("audit_log").insert({
      actor_id: userId,
      action: `admin.role.removed`,
      entity: "user_roles",
      entity_id: data.targetUserId,
      metadata: { role: data.role },
    } as never);

    return { success: true };
  });

// ─── Roles & Permissions ───
export const listRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const roles = [
      {
        name: "super_admin",
        description: "Root-level system administrator with absolute authorization.",
      },
      {
        name: "admin",
        description:
          "Operations administrator with access to bookings, customers, airports, lounges, payments, and staff shifts.",
      },
      { name: "customer", description: "End-user travel customer." },
    ];

    const permissions = [
      { id: "bookings:read", description: "Read all bookings and status history" },
      { id: "bookings:write", description: "Create, update status, and modify bookings" },
      { id: "bookings:assign", description: "Assign concierge and staff to bookings" },
      { id: "customers:read", description: "Read customer profiles and booking history" },
      { id: "customers:write", description: "Create and update customer profiles" },
      { id: "services:read", description: "Read lounge and airport services catalog" },
      { id: "services:write", description: "Modify service specifications and pricing" },
      { id: "flights:read", description: "Read flight tracking logs and data" },
      { id: "flights:write", description: "Update flight status and logistics" },
      { id: "notifications:read", description: "View system notifications logs" },
      { id: "notifications:retry", description: "Re-trigger failed notification templates" },
      { id: "staff:read", description: "View staff list and roles" },
      { id: "staff:write", description: "Modify staff roles and status" },
      { id: "audit:read", description: "Read security audit timeline logs" },
      { id: "settings:read", description: "Read business settings and profile configuration" },
      { id: "settings:write", description: "Update business settings and configurations" },
      { id: "reports:read", description: "Generate and download financial and operations reports" },
    ];

    const matrix: Record<string, string[]> = {
      super_admin: permissions.map((p) => p.id),
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

    return {
      roles,
      permissions,
      matrix,
    };
  });

export const toggleRolePermission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { roleName: string; permissionId: string; grant: boolean })
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);
    throw new Error(
      "Roles and permissions are statically configured in this simplified deployment.",
    );
  });

// ─── Airports ───
export const listAirports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const { data, error } = await supabase
      .from("airports")
      .select("*")
      .order("code", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  });

import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getActiveAirports = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await (supabaseAdmin as any)
      .from("airports")
      .select("*")
      .eq("is_active", true)
      .order("code", { ascending: true });

    if (error) return [];
    return data || [];
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
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const payload = {
      code: data.code.toUpperCase(),
      name: data.name,
      city: data.city,
      country: data.country || "India",
      image_url: data.image_url || null,
      supported_services: data.supported_services || [],
      terminals: data.terminals || [],
      is_active: data.is_active !== undefined ? data.is_active : true,
    };

    let result;
    if (data.id) {
      result = await (supabase as any).from("airports").update(payload).eq("id", data.id);
    } else {
      result = await (supabase as any).from("airports").insert(payload);
    }

    if (result.error) throw new Error(result.error.message);

    await supabase.from("audit_log").insert({
      actor_id: userId,
      action: data.id ? "airport.updated" : "airport.created",
      entity: "airports",
      entity_id: data.id || data.code,
      metadata: payload,
    });

    return { success: true };
  });

export const deleteAirport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { id: string })
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const { error } = await supabase.from("airports").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    await supabase.from("audit_log").insert({
      actor_id: userId,
      action: "airport.deleted",
      entity: "airports",
      entity_id: data.id,
    } as never);

    return { success: true };
  });

// ─── Lounges (Super Admin) ───
export const listSALounges = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const { data, error } = await supabase
      .from("lounges")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const { data: airports } = await supabase.from("airports").select("id, code, name");
    const airportMap = new Map<string, Record<string, unknown>>();
    (airports || []).forEach((a: Record<string, unknown>) => airportMap.set(a.id as string, a));

    return (data || []).map((l) => ({
      ...l,
      airport: airportMap.get(l.airport_id as string) || null,
    })) as any;
  });

export const upsertLounge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as Record<string, unknown>)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const id = data.id as string | undefined;
    const payload = { ...data } as any;
    delete payload.id;
    delete payload.airport;

    let result;
    if (id) {
      result = await supabase.from("lounges").update(payload).eq("id", id);
    } else {
      result = await supabase.from("lounges").insert(payload);
    }

    if (result.error) throw new Error(result.error.message);

    await supabase.from("audit_log").insert({
      actor_id: userId,
      action: id ? "lounge.updated" : "lounge.created",
      entity: "lounges",
      entity_id: id || "new",
    } as never);

    return { success: true };
  });

// ─── Coupons ───
export const listCoupons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  });

export const createCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: any) =>
      data as { code: string; discount_percent: number; max_uses?: number; expires_at?: string },
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const { error } = await supabase.from("coupons").insert({
      code: data.code.toUpperCase().trim(),
      discount_percent: data.discount_percent,
      max_uses: data.max_uses || null,
      is_active: true,
      expires_at: data.expires_at || null,
    } as never);

    if (error) throw new Error(error.message);

    await supabase.from("audit_log").insert({
      actor_id: userId,
      action: "coupon.created",
      entity: "coupons",
      entity_id: data.code,
    } as never);

    return { success: true };
  });

export const toggleCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { id: string; is_active: boolean })
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const { error } = await (supabase as any)
      .from("coupons")
      .update({ is_active: data.is_active } as never)
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { id: string })
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const { error } = await (supabase as any).from("coupons").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

// ─── Feature Flags ───
export const listFeatureFlags = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const { data, error } = await (supabase as any).from("feature_flags").select("*").order("id");

    if (error) throw new Error(error.message);
    return data || [];
  });

export const toggleFeatureFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { id: string; is_enabled: boolean })
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const { error } = await (supabase as any)
      .from("feature_flags")
      .update({ is_enabled: data.is_enabled } as never)
      .eq("id", data.id);

    if (error) throw new Error(error.message);

    await supabase.from("audit_log").insert({
      actor_id: userId,
      action: `feature_flag.${data.is_enabled ? "enabled" : "disabled"}`,
      entity: "feature_flags",
      entity_id: data.id,
    } as never);

    return { success: true };
  });

// ─── Security ───
export const listSecurityEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const { data: auditEvents } = await supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    const { data: ipRestrictions } = await (supabase as any)
      .from("ip_restrictions")
      .select("*")
      .order("created_at", { ascending: false });

    return {
      events: auditEvents || [],
      ipRestrictions: ipRestrictions || [],
    };
  });

export const addIpRestriction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { ip_address: string; type: string; reason?: string })
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const { error } = await (supabase as any).from("ip_restrictions").insert({
      ip_address: data.ip_address,
      type: data.type,
      reason: data.reason || null,
      created_by: userId,
    } as never);

    if (error) throw new Error(error.message);
    return { success: true };
  });

// ─── Audit Logs ───
export const getAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const { data: logs, error } = await supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw new Error(error.message);
    return logs || [];
  });

// ─── System Settings ───
export const listSystemSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const { data, error } = await (supabase as any)
      .from("system_settings")
      .select("*")
      .order("key");

    if (error) throw new Error(error.message);
    return data || [];
  });

export const upsertSystemSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { key: string; value: unknown })
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const { error } = await (supabase as any)
      .from("system_settings")
      .upsert({ key: data.key, value: data.value } as never, { onConflict: "key" });

    if (error) throw new Error(error.message);

    await supabase.from("audit_log").insert({
      actor_id: userId,
      action: "setting.updated",
      entity: "system_settings",
      entity_id: data.key,
    } as never);

    return { success: true };
  });

// ─── Payments / Transactions ───
export const listTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertSuperAdmin(supabase, userId);

    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, booking_ref, contact_name, contact_email, quote_amount, quote_currency, status, created_at",
      )
      .not("quote_amount", "is", null)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw new Error(error.message);
    return data || [];
  });

export const bootstrapFirstSuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await (supabase as any).rpc("bootstrap_first_super_admin", {
      p_user_id: userId,
    });
    if (error) {
      throw new Error(error.message);
    }
    return { success: data };
  });
