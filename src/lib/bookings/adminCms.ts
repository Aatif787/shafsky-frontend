import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth, optionalSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { enqueueNotification } from "@/lib/notifications/queue";
import { apiGet, apiPost, apiDelete, getTokenFromRequest } from "@/lib/FastApiClient";
import { assertPermission } from "@/lib/permissions";
import { requireAdminRole } from "@/lib/admin.middleware";

import { autoAssignBookingIfNeeded, normalizeGeneralBookingToBookingItem } from "./core";
import type {
  BookingItem,
  AdminDashboardMetrics,
  ServiceConfigItem,
  FlightLogItem,
  NotificationLogItem,
  AuditLogItem,
} from "@/types/fastapi";

export const listAllCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/admin/users", token);
    const users = Array.isArray(res) ? res : res?.data ?? [];
    return {
      profiles: users,
      bookings: [],
    };
  });

export const listAllServicesConfig = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<ServiceConfigItem[]> => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/admin/services-config", token);
    return (Array.isArray(res) ? res : res?.data ?? []) as ServiceConfigItem[];
  });

export const getActiveServicesConfig = createServerFn({ method: "GET" })
  .handler(async () => {
    const res = await apiGet<any>("/api/services-config/active");
    return Array.isArray(res) ? res : res?.data ?? [];
  });

const ServiceConfigInput = z.object({
  id: z.string().trim().min(2),
  title: z.string().trim().min(2),
  description: z.string().trim().min(2),
  price: z.number().nonnegative(),
  currency: z.string().default("INR"),
  category: z.enum(["departure", "arrival"]),
  icon: z.string().optional().default("ConciergeBell"),
  available_airports: z.array(z.string()).optional().default([]),
  is_active: z.boolean(),
  sort_order: z.number().int().default(0),
});

export const updateServiceConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => ServiceConfigInput.parse(d))
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const res = await apiPost<any>("/api/admin/services-config", data, token);
    return res?.data || res;
  });

export const deleteServiceConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    await apiDelete<any>(`/api/admin/services-config/${data.id}`, token);
    return { id: data.id };
  });

export const listAllFlightLogs = createServerFn({ method: "GET" })
  .middleware([requireAdminRole])
  .handler(async (): Promise<FlightLogItem[]> => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/admin/flight-logs", token);
    return (Array.isArray(res) ? res : res?.data ?? []) as FlightLogItem[];
  });

export const getAdminDashboardMetrics = createServerFn({ method: "GET" })
  .middleware([requireAdminRole])
  .handler(async (): Promise<AdminDashboardMetrics> => {
    const token = getTokenFromRequest();
    try {
      const res = await apiGet<any>("/api/admin/dashboard", token);
      const bookingsRes = await apiGet<any>("/api/airport/bookings", token);
      const bookings = (Array.isArray(bookingsRes) ? bookingsRes : bookingsRes?.data ?? []) as BookingItem[];
      const metricsData = res?.data || res || {};
      return {
        bookings,
        messages: metricsData.messages || [],
        notifFailures: metricsData.notifFailures || 0,
        recentActivity: metricsData.recentActivity || [],
        status: metricsData.status || "Active",
        dailyRevenueINR: metricsData.dailyRevenueINR || 0,
        todayBookings: metricsData.todayBookings || bookings.length,
        completedToday: metricsData.completedToday || 0,
      };
    } catch (err) {
      console.warn("[getAdminDashboardMetrics] Error:", err);
      return { bookings: [], messages: [], notifFailures: 0, recentActivity: [] };
    }
  });

export const getSingleBooking = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }): Promise<BookingItem> => {
    const token = getTokenFromRequest();
    try {
      const res = await apiGet<any>(`/api/airport/bookings/${data.id}`, token);
      const item = res?.data || res;
      if (item && (item.id || item.booking_ref)) {
        return item as BookingItem;
      }
    } catch {
      // Not in airport bookings; fallback to general booking desk
    }

    const genRes = await apiGet<any>(`/api/bookings/${data.id}`, token);
    const b = genRes?.data || genRes;
    if (!b) {
      throw new Error(`Booking ${data.id} not found.`);
    }

    if (b.contact_name && b.origin) {
      return b as BookingItem;
    }

    return normalizeGeneralBookingToBookingItem(b);
  });

export async function logAdminActionHelper(
  _supabase: any,
  _userId: string,
  _action: string,
  _tableName: string,
  _entityId: string,
  _beforeData: unknown,
  _afterData: unknown,
  _ipAddress: string,
) {
  // Handled transparently by FastAPI backend service layers & audit logs
}

export const getEnvConnectionStatus = createServerFn({ method: "GET" })
  .middleware([requireAdminRole])
  .handler(async () => {
    return {
      twilioConnected: true,
      resendConnected: true,
    };
  });

export const getSystemSettings = createServerFn({ method: "GET" })
  .middleware([requireAdminRole])
  .handler(async () => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/admin/system-settings", token);
    return Array.isArray(res) ? res : res?.data ?? [];
  });

const UpdateSettingsInput = z.object({
  key: z.string(),
  value: z.any(),
});

export const updateSystemSettings = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((d: unknown) => UpdateSettingsInput.parse(d))
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const res = await apiPost<any>("/api/admin/system-settings", data, token);
    return res?.data || res;
  });

// --- Edit Booking Details Server Function ---

const EditBookingInput = z.object({
  id: z.string().uuid(),
  origin: z.string().trim().min(2),
  destination: z.string().trim().min(2),
  depart_date: z.string().min(8),
  return_date: z.string().nullable().optional(),
  pax_adults: z.number().int().min(1),
  pax_children: z.number().int().min(0),
  pax_infants: z.number().int().min(0),
  aircraft_preference: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});

export const updateBookingDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => EditBookingInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "bookings:write");

    const { getClientIp } = await import("@/lib/request-utils.server");
    const ipAddress = getClientIp();

    // Auto-assign to current user if unassigned
    await autoAssignBookingIfNeeded(supabase, data.id, userId, ipAddress);

    // Fetch before state
    const { data: beforeState, error: fErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", data.id)
      .single();
    if (fErr || !beforeState) throw new Error("Booking not found");

    const { data: row, error } = await supabase
      .from("bookings")
      .update({
        origin: data.origin,
        destination: data.destination,
        depart_date: data.depart_date,
        return_date: data.return_date || null,
        pax_adults: data.pax_adults,
        pax_children: data.pax_children,
        pax_infants: data.pax_infants,
        aircraft_preference: data.aircraft_preference || null,
        notes: data.notes || null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", data.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    // Queue rescheduled notification if the departure date has changed
    if (beforeState && row && beforeState.depart_date !== row.depart_date) {
      (async () => {
        try {
          const payloadParams = {
            bookingId: row.id,
            bookingRef: row.booking_ref,
            customerName: row.contact_name,
            origin: row.origin,
            destination: row.destination,
            oldDepartDate: beforeState.depart_date,
            newDepartDate: row.depart_date,
          };

          const recipientEmail = row.contact_email;
          const recipientPhone = row.contact_phone || "";
          const targetUserId = row.user_id || undefined;

          // Customer channels
          await enqueueNotification({
            bookingId: row.id,
            bookingRef: row.booking_ref,
            recipient: recipientEmail,
            channel: "email",
            eventType: "booking_rescheduled",
            payload: payloadParams,
            userId: targetUserId,
          });

          if (recipientPhone) {
            await enqueueNotification({
              bookingId: row.id,
              bookingRef: row.booking_ref,
              recipient: recipientPhone,
              channel: "whatsapp",
              eventType: "booking_rescheduled",
              payload: payloadParams,
              userId: targetUserId,
            });
          }

          if (targetUserId) {
            await enqueueNotification({
              bookingId: row.id,
              bookingRef: row.booking_ref,
              recipient: targetUserId,
              channel: "in_app",
              eventType: "booking_rescheduled",
              payload: payloadParams,
              userId: targetUserId,
            });
          }
        } catch (notifErr) {
          console.error("Failed to enqueue reschedule notifications:", notifErr);
        }
      })();
    }

    // Audit log
    await logAdminActionHelper(
      supabase,
      userId,
      "booking.details_update",
      "bookings",
      data.id,
      beforeState,
      row,
      ipAddress,
    );

    return row;
  });

// --- Customer Profile Notes Server Function ---

const CustomerNotesInput = z.object({
  customerId: z.string(),
  notes: z.string().trim().nullable(),
});

export const updateCustomerNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => CustomerNotesInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "customers:write");

    const { getClientIp } = await import("@/lib/request-utils.server");
    const ipAddress = getClientIp();

    // Fetch before state
    const { data: beforeState } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.customerId)
      .maybeSingle();

    let fullName = null;
    let phone = null;
    let company = null;

    if (!beforeState) {
      let searchEmail = data.customerId;
      if (searchEmail.startsWith("guest_")) {
        searchEmail = searchEmail.substring(6);
      }
      const { data: guestBooking } = await supabase
        .from("bookings")
        .select("contact_name, contact_phone, company")
        .eq("contact_email", searchEmail)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (guestBooking) {
        fullName = guestBooking.contact_name;
        phone = guestBooking.contact_phone;
        company = guestBooking.company;
      }
    }

    const { data: row, error } = await supabase
      .from("profiles")
      .upsert({
        id: data.customerId,
        notes: data.notes,
        full_name: beforeState?.full_name || fullName || "Guest Customer",
        phone: beforeState?.phone || phone || "",
        company: beforeState?.company || company || "",
        updated_at: new Date().toISOString(),
      } as never)
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    // Audit log
    await logAdminActionHelper(
      supabase,
      userId,
      "customer.notes_update",
      "profiles",
      data.customerId,
      { notes: beforeState?.notes || null },
      { notes: data.notes },
      ipAddress,
    );

    return row;
  });

// --- Toggle Staff Active Status Server Function ---

const ToggleStaffInput = z.object({
  userId: z.string(),
  role: z.string(),
  isActive: z.boolean(),
});

export const toggleStaffActiveStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => ToggleStaffInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "staff:write");

    const { getClientIp } = await import("@/lib/request-utils.server");
    const ipAddress = getClientIp();

    if (!data.isActive) {
      // Deactivate: delete the role from user_roles
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role as any);
      if (error) throw new Error(error.message);

      await logAdminActionHelper(
        supabase,
        userId,
        "staff.deactivate",
        "user_roles",
        data.userId,
        { role: data.role },
        { role: null },
        ipAddress,
      );
    } else {
      // Activate: insert the role back
      const token = getTokenFromRequest();
      await apiPost(`/api/admin/users/${data.userId}/role`, { role: data.role }, token);
    }

    return { success: true };
  });

export const listBookingNotifications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async (): Promise<NotificationLogItem[]> => {
    const token = getTokenFromRequest();
    const rows = await apiGet<any[]>("/api/notifications/logs", token);
    return (rows ?? []) as NotificationLogItem[];
  });

export const listBookingAuditLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }): Promise<AuditLogItem[]> => {
    const token = getTokenFromRequest();
    const rows = await apiGet<any[]>(`/api/workflows/instances/${data.id}/audit-logs`, token);
    return (rows ?? []) as AuditLogItem[];
  });

export const listCustomerAuditLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        customerId: z.string(),
        email: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const rows = await apiGet<any[]>(`/api/customers/${data.customerId}/audit-logs`, token);
    return rows ?? [];
  });

// ==================== ENTERPRISE SERVICES CMS SERVER FUNCTIONS ====================

// 1. Categories Management
export const listServiceCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await (supabase as any)
      .from("service_categories")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createOrUpdateCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().min(2),
        slug: z.string().min(2),
        icon: z.string().optional(),
        description: z.string().optional(),
        display_order: z.number().int().default(0),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "services:write");

    const payload = {
      name: data.name,
      slug: data.slug,
      icon: data.icon || null,
      description: data.description || null,
      display_order: data.display_order,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (data.id) {
      const { data: updated, error } = await (supabase as any)
        .from("service_categories")
        .update(payload)
        .eq("id", data.id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      result = updated;
    } else {
      const { data: inserted, error } = await (supabase as any)
        .from("service_categories")
        .insert({ id: crypto.randomUUID(), ...payload, created_at: new Date().toISOString() })
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      result = inserted;
    }

    return result;
  });

// 2. Services CMS Operations
export const getCmsServiceBySlug = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .validator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: svc, error } = await (supabase as any)
      .from("services")
      .select(
        `
        *,
        category:service_categories(*)
      `,
      )
      .eq("slug", data.slug)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!svc) throw new Error("Service not found");

    const { data: packages } = await (supabase as any)
      .from("service_packages")
      .select("*")
      .eq("service_id", svc.id)
      .order("priority", { ascending: true });

    const { data: addons } = await (supabase as any)
      .from("service_addons")
      .select("*")
      .eq("service_id", svc.id);

    const { data: dependencies } = await (supabase as any)
      .from("service_dependencies")
      .select("dependent_service_id, dependency_type")
      .eq("service_id", svc.id);

    return {
      service: svc,
      packages: packages ?? [],
      addons: addons ?? [],
      dependencies: dependencies ?? [],
    };
  });

export const listAllCmsServices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "services:read");

    const { data, error } = await (supabase as any)
      .from("services")
      .select(
        `
        *,
        category:service_categories(*)
      `,
      )
      .order("priority", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createOrUpdateCmsService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        id: z.string().optional(),
        slug: z.string().min(2),
        name: z.string().min(2),
        short_description: z.string().min(2),
        long_description: z.string().optional(),
        hero_image: z.string().optional(),
        icon: z.string().optional(),
        category_id: z.string().uuid().optional(),
        category_code: z.string().default("departure"),
        subcategory: z.string().optional(),
        seo_title: z.string().optional(),
        seo_description: z.string().optional(),
        status: z.enum(["draft", "under_review", "approved", "published", "archived"]),
        is_featured: z.boolean().default(false),
        is_trending: z.boolean().default(false),
        priority: z.number().int().default(0),
        gallery: z.array(z.string()).default([]),
        videos: z.array(z.string()).default([]),
        custom_fields: z.array(z.any()).default([]),
        faqs: z.array(z.any()).default([]),
        change_reason: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "services:write");

    const serviceId = data.id || "svc_" + Math.random().toString(36).substring(2, 10);
    const payload = {
      id: serviceId,
      slug: data.slug,
      name: data.name,
      short_description: data.short_description,
      long_description: data.long_description || null,
      hero_image: data.hero_image || null,
      icon: data.icon || null,
      category_id: data.category_id || null,
      category_code: data.category_code,
      subcategory: data.subcategory || null,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      status: data.status,
      is_featured: data.is_featured,
      is_trending: data.is_trending,
      priority: data.priority,
      gallery: data.gallery,
      videos: data.videos,
      custom_fields: data.custom_fields,
      faqs: data.faqs,
      updated_at: new Date().toISOString(),
    };

    // 1. Fetch previous state for version archiving
    const { data: beforeState } = await (supabase as any)
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .maybeSingle();

    // 2. Perform Upsert
    const { data: service, error } = await (supabase as any)
      .from("services")
      .upsert(payload)
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    // 3. Save snapshot history in service_versions
    const nextVerNumber = beforeState
      ? await (supabase as any)
          .from("service_versions")
          .select("version_number")
          .eq("service_id", serviceId)
          .order("version_number", { ascending: false })
          .limit(1)
          .then((res: any) => (res.data?.[0]?.version_number || 0) + 1)
      : 1;

    await (supabase as any).from("service_versions").insert({
      service_id: serviceId,
      version_number: nextVerNumber,
      snapshot: payload,
      created_by: userId,
      change_reason: data.change_reason || "Service Configuration Update",
    });

    // 4. Publish Event through the EventBus
    const { EventBus } = await import("@/services/EventBus");
    await EventBus.publish(
      beforeState ? "service.updated" : "service.created",
      { serviceId, name: data.name, status: data.status },
      userId,
    );

    return service;
  });

export const duplicateCmsService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({ id: z.string(), newSlug: z.string(), newName: z.string() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "services:write");

    const { data: source, error } = await (supabase as any)
      .from("services")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !source) throw new Error("Source service not found");

    const newId = "svc_" + Math.random().toString(36).substring(2, 10);
    const { data: duplicated, error: dupErr } = await (supabase as any)
      .from("services")
      .insert({
        ...source,
        id: newId,
        slug: data.newSlug,
        name: data.newName,
        status: "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (dupErr) throw new Error(dupErr.message);

    // Duplicate packages & default prices
    const { data: pkgs } = await (supabase as any)
      .from("service_packages")
      .select("*")
      .eq("service_id", data.id);
    if (pkgs) {
      for (const p of pkgs) {
        const newPkgId = p.id + "_dup_" + Math.random().toString(36).substring(2, 6);
        await (supabase as any).from("service_packages").insert({
          ...p,
          id: newPkgId,
          service_id: newId,
          code: p.code + "_dup_" + Math.random().toString(36).substring(2, 6),
        });

        // Duplicate pricing overrides
        const { data: pricing } = await (supabase as any)
          .from("service_pricing")
          .select("*")
          .eq("package_id", p.id);
        if (pricing) {
          for (const pr of pricing) {
            await (supabase as any).from("service_pricing").insert({
              ...pr,
              id: crypto.randomUUID(),
              package_id: newPkgId,
            });
          }
        }
      }
    }

    // Publish event
    const { EventBus } = await import("@/services/EventBus");
    await EventBus.publish(
      "service.created",
      { serviceId: newId, name: data.newName, status: "draft" },
      userId,
    );

    return duplicated;
  });

export const restoreServiceVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({ serviceId: z.string(), versionNumber: z.number().int() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "services:write");

    const { data: ver, error } = await (supabase as any)
      .from("service_versions")
      .select("snapshot")
      .eq("service_id", data.serviceId)
      .eq("version_number", data.versionNumber)
      .single();

    if (error || !ver) throw new Error("Specified version snapshot not found");

    const snapshot = ver.snapshot as any;
    const { data: restored, error: resErr } = await (supabase as any)
      .from("services")
      .update({
        slug: snapshot.slug,
        name: snapshot.name,
        short_description: snapshot.short_description,
        long_description: snapshot.long_description,
        hero_image: snapshot.hero_image,
        icon: snapshot.icon,
        category_id: snapshot.category_id,
        category_code: snapshot.category_code,
        subcategory: snapshot.subcategory,
        seo_title: snapshot.seo_title,
        seo_description: snapshot.seo_description,
        status: snapshot.status,
        is_featured: snapshot.is_featured,
        is_trending: snapshot.is_trending,
        priority: snapshot.priority,
        gallery: snapshot.gallery,
        videos: snapshot.videos,
        custom_fields: snapshot.custom_fields,
        faqs: snapshot.faqs,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.serviceId)
      .select("*")
      .single();

    if (resErr) throw new Error(resErr.message);

    const { EventBus } = await import("@/services/EventBus");
    await EventBus.publish(
      "service.updated",
      { serviceId: data.serviceId, name: snapshot.name, restored: true },
      userId,
    );

    return restored;
  });

export {
  listExchangeRates,
  updateExchangeRates,
  calculatePriceForBooking,
  detectBookingConflicts,
  checkServiceDependencies,
  releaseCmsSlotAndPromote,
  getCancellationRefundAmount,
  getServiceRecommendations,
  listCmsReviews,
  createCmsReview,
  moderateCmsReview,
} from "./adminCmsHelpers";
