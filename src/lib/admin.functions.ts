import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth, optionalSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertPermission, getUserRoles, isStaffUser } from "@/lib/permissions";

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
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "services:read");

    const { data: lounges, error } = await supabase
      .from("lounges")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    // Get queue counts per lounge
    const loungeIds = (lounges || []).map((l) => l.id);
    let queueData: Record<string, unknown>[] = [];
    if (loungeIds.length > 0) {
      const { data: q } = await supabase
        .from("lounge_queue")
        .select("*")
        .in("lounge_id", loungeIds)
        .eq("status", "waiting");
      queueData = (q || []) as any;
    }

    // Get airport info
    const { data: airports } = await supabase.from("airports").select("id, code, name, city");

    const airportMap = new Map<string, Record<string, unknown>>();
    (airports || []).forEach((a) => airportMap.set(a.id, a as any));

    return (lounges || []).map((lounge) => ({
      ...lounge,
      airport: airportMap.get(lounge.airport_id as string) || null,
      queue_count: queueData.filter((q: any) => q.lounge_id === lounge.id).length,
    })) as any;
  });

export const updateLoungeStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { loungeId: string; status: string })
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "services:write");

    const { error } = await supabase
      .from("lounges")
      .update({ status: data.status })
      .eq("id", data.loungeId);

    if (error) throw new Error(error.message);

    // Audit log
    await supabase.from("audit_log").insert({
      actor_id: userId,
      action: `lounge.status.${data.status}`,
      entity: "lounges",
      entity_id: data.loungeId,
    });

    return { success: true };
  });

// ─── Staff Shifts ───
export const getStaffShifts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "staff:read");

    const today = new Date().toISOString().slice(0, 10);
    const { data: shifts, error } = await supabase
      .from("staff_shifts")
      .select("*")
      .gte("shift_date", today)
      .order("shift_date", { ascending: true })
      .order("shift_start", { ascending: true })
      .limit(50);

    if (error) throw new Error(error.message);

    // Get staff profiles
    const staffIds: string[] = Array.from(new Set((shifts || []).map((s) => s.staff_id)));
    let profiles: Record<string, unknown>[] = [];
    if (staffIds.length > 0) {
      const { data: p } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", staffIds);
      profiles = (p || []) as any;
    }

    const profileMap = new Map<string, Record<string, unknown>>();
    profiles.forEach((p) => profileMap.set(p.id as string, p));

    return (shifts || []).map((shift) => ({
      ...shift,
      staff_profile: profileMap.get(shift.staff_id) || null,
    })) as any;
  });

// ─── Admin Profile ───
export const getAdminProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    // Get recent activity
    const { data: activity } = await supabase
      .from("audit_log")
      .select("*")
      .eq("actor_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    // Get roles
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);

    return {
      profile: profile || {
        id: userId,
        full_name: "Admin",
        phone: null,
        company: null,
        avatar_url: null,
        created_at: "",
        updated_at: "",
        notes: null,
      },
      activity: activity || [],
      roles: (roles || []).map((r) => r.role),
    };
  });

export const updateAdminProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => data as { full_name?: string; phone?: string; company?: string })
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        phone: data.phone,
        company: data.company,
      } as never)
      .eq("id", userId);

    if (error) throw new Error(error.message);

    await supabase.from("audit_log").insert({
      actor_id: userId,
      action: "profile.updated",
      entity: "profiles",
      entity_id: userId,
    } as never);

    return { success: true };
  });
