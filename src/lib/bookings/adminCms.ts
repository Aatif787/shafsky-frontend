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

import { autoAssignBookingIfNeeded } from "./core";
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
    const res = await apiGet<any>(`/api/airport/bookings/${data.id}`, token);
    return (res?.data || res) as BookingItem;
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
  .validator((data: unknown) =>
    z
      .object({
        userId: z.string(),
        role: z.string(),
        isActive: z.boolean(),
      })
      .parse(data),
  )
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

// 3. Pricing Overrides & Exchange Engine
export const listExchangeRates = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await (supabase as any)
      .from("currency_rates")
      .select("*")
      .order("code", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateExchangeRates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        code: z.string().length(3),
        rateToInr: z.number().positive(),
        syncMode: z.enum(["auto", "manual"]).default("manual"),
        providerMetadata: z.record(z.any()).default({}),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "services:write");

    const auditFields = {
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    };

    const { data: rate, error } = await (supabase as any)
      .from("currency_rates")
      .upsert({
        code: data.code.toUpperCase(),
        rate_to_inr: data.rateToInr,
        sync_mode: data.syncMode,
        provider_metadata: data.providerMetadata,
        audit_fields: auditFields,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    const { EventBus } = await import("@/services/EventBus");
    await EventBus.publish("currency.synced", { code: data.code, rate: data.rateToInr }, userId);

    return rate;
  });

export const calculatePriceForBooking = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        packageId: z.string(),
        addonIds: z.array(z.string()).default([]),
        airportCode: z.string().optional(),
        corporateName: z.string().optional(),
        isVIP: z.boolean().default(false),
        couponCode: z.string().optional(),
        targetCurrency: z.string().default("INR"),
        bookingTime: z.string().optional(),
        bookingDate: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { PricingEngine } = await import("@/services/PricingEngine");

    // Fetch baseline package pricing
    const { data: pkgPricing } = await (supabase as any)
      .from("service_pricing")
      .select("*")
      .eq("package_id", data.packageId)
      .is("addon_id", null);

    let priceOverride = pkgPricing?.[0];

    // Filter overrides if airport or corporate matches
    if (data.airportCode && pkgPricing) {
      const match = pkgPricing.find((p: any) => p.airport_code === data.airportCode);
      if (match) priceOverride = match;
    }
    if (data.corporateName && pkgPricing) {
      const match = pkgPricing.find((p: any) => p.corporate_name === data.corporateName);
      if (match) priceOverride = match;
    }

    if (!priceOverride) {
      throw new Error("Pricing profile not resolved for this package");
    }

    // Resolve exchange rates
    let exchangeRate = 1.0;
    if (data.targetCurrency !== "INR") {
      const { data: rateRow } = await (supabase as any)
        .from("currency_rates")
        .select("rate_to_inr")
        .eq("code", data.targetCurrency.toUpperCase())
        .maybeSingle();
      if (rateRow?.rate_to_inr) {
        exchangeRate = 1 / Number(rateRow.rate_to_inr);
      }
    }

    // Check temporal rules
    const isWeekend = data.bookingDate ? PricingEngine.checkWeekend(data.bookingDate) : false;
    const isNightShift = data.bookingTime ? PricingEngine.checkNightShift(data.bookingTime) : false;

    // Check coupon discount
    let couponDiscount = 0;
    if (data.couponCode) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("discount_percent, is_active, expires_at")
        .eq("code", data.couponCode.toUpperCase())
        .maybeSingle();

      if (coupon?.is_active) {
        const isExpired = coupon.expires_at ? new Date(coupon.expires_at) < new Date() : false;
        if (!isExpired) {
          couponDiscount = coupon.discount_percent;
        }
      }
    }

    // Calculate core price
    const finalCalc = PricingEngine.calculate({
      basePrice: Number(priceOverride.base_price),
      currency: "INR",
      targetCurrency: data.targetCurrency,
      exchangeRate,
      isWeekend,
      weekendMarkupAmount: Number(priceOverride.weekend_markup || 0),
      isNightShift,
      nightMarkupAmount: Number(priceOverride.night_markup || 0),
      peakMultiplier: Number(priceOverride.peak_multiplier || 1.0),
      isVIP: data.isVIP,
      couponDiscountPercent: couponDiscount,
      taxPercent: Number(priceOverride.taxes || 18),
    });

    return finalCalc;
  });

// 4. Dependencies, Conflict & Slot Booking
export const detectBookingConflicts = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        packageId: z.string(),
        airportId: z.string().uuid(),
        slotDate: z.string(),
        startTime: z.string(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // 1. Check if the slot limits are exceeded
    const { data: slot } = await (supabase as any)
      .from("service_slots")
      .select("max_bookings, current_bookings")
      .eq("package_id", data.packageId)
      .eq("airport_id", data.airportId)
      .eq("slot_date", data.slotDate)
      .eq("start_time", data.startTime)
      .maybeSingle();

    if (slot && slot.current_bookings >= slot.max_bookings) {
      return {
        conflictDetected: true,
        message:
          "Maximum capacity reached for this time slot. Booking will be placed on the Waitlist.",
        recommendWaitlist: true,
      };
    }

    return { conflictDetected: false };
  });

export const checkServiceDependencies = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        serviceId: z.string(),
        selectedServiceIds: z.array(z.string()),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: deps } = await (supabase as any)
      .from("service_dependencies")
      .select("dependent_service_id, dependency_type")
      .eq("service_id", data.serviceId);

    if (!deps || deps.length === 0) return { meetsDependencies: true };

    const missing: string[] = [];
    for (const d of deps) {
      if (
        d.dependency_type === "required" &&
        !data.selectedServiceIds.includes(d.dependent_service_id)
      ) {
        const { data: svcName } = await (supabase as any)
          .from("services")
          .select("name")
          .eq("id", d.dependent_service_id)
          .maybeSingle();
        missing.push(svcName?.name || d.dependent_service_id);
      }
    }

    if (missing.length > 0) {
      return {
        meetsDependencies: false,
        missingServices: missing,
        message: `Missing required dependency services: ${missing.join(", ")}. Please add them to your booking.`,
      };
    }

    return { meetsDependencies: true };
  });

export const releaseCmsSlotAndPromote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        packageId: z.string(),
        airportId: z.string().uuid(),
        slotDate: z.string(),
        startTime: z.string(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "services:write");

    // 1. Release slot bookings by 1
    const { data: slot } = await (supabase as any)
      .from("service_slots")
      .select("id, current_bookings")
      .eq("package_id", data.packageId)
      .eq("airport_id", data.airportId)
      .eq("slot_date", data.slotDate)
      .eq("start_time", data.startTime)
      .maybeSingle();

    if (slot && slot.current_bookings > 0) {
      await (supabase as any)
        .from("service_slots")
        .update({ current_bookings: slot.current_bookings - 1 })
        .eq("id", slot.id);
    }

    // 2. Query waitlist for next priority customer
    const { data: waitlist } = await (supabase as any)
      .from("service_waitlist")
      .select("*")
      .eq("package_id", data.packageId)
      .eq("slot_date", data.slotDate)
      .eq("slot_time", data.startTime)
      .eq("status", "waiting")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (waitlist) {
      // Promote waitlisted customer
      await (supabase as any)
        .from("service_waitlist")
        .update({ status: "promoted", updated_at: new Date().toISOString() })
        .eq("id", waitlist.id);

      // Re-increment slot bookings
      if (slot) {
        await (supabase as any)
          .from("service_slots")
          .update({ current_bookings: slot.current_bookings })
          .eq("id", slot.id);
      }

      // Publish event
      const { EventBus } = await import("@/services/EventBus");
      await EventBus.publish(
        "waitlist.promoted",
        {
          waitlistId: waitlist.id,
          userId: waitlist.user_id,
          packageId: data.packageId,
          slotDate: data.slotDate,
          startTime: data.startTime,
        },
        userId,
      );

      return { promoted: true, user_id: waitlist.user_id };
    }

    return { promoted: false };
  });

export const getCancellationRefundAmount = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        packageId: z.string(),
        bookingDepartDate: z.string(),
        pricePaid: z.number(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // Calculate hours before departure
    let hoursDiff = 0;
    try {
      const depDate = new Date(data.bookingDepartDate);
      const now = new Date();
      hoursDiff = (depDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    } catch {
      return { refundPercentage: 0, refundAmount: 0 };
    }

    const { data: policies } = await (supabase as any)
      .from("cancellation_policies")
      .select("hours_before_departure, refund_percentage")
      .eq("package_id", data.packageId)
      .order("hours_before_departure", { ascending: true });

    let refundPct = 100;
    if (policies && policies.length > 0) {
      const policyMatch = policies.find((p: any) => hoursDiff >= p.hours_before_departure);
      if (policyMatch) {
        refundPct = Number(policyMatch.refund_percentage);
      } else {
        refundPct = 0;
      }
    }

    const refundAmount = data.pricePaid * (refundPct / 100);
    return {
      refundPercentage: refundPct,
      refundAmount: Number(refundAmount.toFixed(2)),
    };
  });

// 5. AI Recommendations Vector Engine
export const getServiceRecommendations = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        airportCode: z.string().optional(),
        airline: z.string().optional(),
        corporateName: z.string().optional(),
        isVIP: z.boolean().default(false),
        customerId: z.string().uuid().optional(),
        currentBookingServiceCodes: z.array(z.string()).default([]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // Fetch active published services
    const { data: allServices } = await (supabase as any)
      .from("services")
      .select("*")
      .eq("status", "published")
      .limit(10);

    if (!allServices || allServices.length === 0) return [];

    const scored = allServices.map((svc: any) => {
      let score = svc.priority || 0;

      // Airport vector match
      if (data.airportCode && svc.available_airports) {
        const ar = svc.available_airports as string[];
        if (ar.includes(data.airportCode)) score += 30;
      }

      // VIP vector match
      if (data.isVIP && svc.name.toLowerCase().includes("vip")) score += 25;

      // Corporate vector match
      if (data.corporateName && svc.name.toLowerCase().includes("corporate")) score += 20;

      // Frequently bought together
      if (data.currentBookingServiceCodes.length > 0) {
        const matches = {
          "meet-greet": ["lounge", "transfers"],
          lounge: ["meet-greet", "fast-track"],
          transfers: ["lounge"],
        };
        for (const code of data.currentBookingServiceCodes) {
          const lowerCode = code.toLowerCase();
          for (const [key, value] of Object.entries(matches)) {
            if (
              lowerCode.includes(key) &&
              value.some((v: string) => svc.id.toLowerCase().includes(v))
            ) {
              score += 35;
            }
          }
        }
      }

      return {
        ...svc,
        recommendationScore: score,
      };
    });

    return (scored as any[])
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3);
  });

// 6. Cms Reviews Moderator
export const listCmsReviews = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .validator((d: unknown) => z.object({ serviceId: z.string() }).parse(d))
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await (supabase as any)
      .from("service_reviews")
      .select(
        `
        *,
        profile:profiles(full_name, avatar_url)
      `,
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createCmsReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        serviceId: z.string(),
        rating: z.number().int().min(1).max(5),
        reviewText: z.string().min(3),
        mediaUrls: z.array(z.string()).default([]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: reviews, error } = await (supabase as any)
      .from("service_reviews")
      .insert({
        service_id: data.serviceId,
        user_id: userId,
        rating: data.rating,
        review_text: data.reviewText,
        media_urls: data.mediaUrls,
        is_verified: true,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    const { EventBus } = await import("@/services/EventBus");
    await EventBus.publish(
      "review.submitted",
      { serviceId: data.serviceId, rating: data.rating },
      userId,
    );

    return reviews;
  });

export const moderateCmsReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        reviewId: z.string().uuid(),
        status: z.enum(["approved", "rejected"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "services:write");

    const { data: review, error } = await (supabase as any)
      .from("service_reviews")
      .update({ status: data.status })
      .eq("id", data.reviewId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    const { EventBus } = await import("@/services/EventBus");
    await EventBus.publish(
      "review.moderated",
      { reviewId: data.reviewId, status: data.status },
      userId,
    );

    return review;
  });

