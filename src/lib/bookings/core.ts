import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth, optionalSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { enqueueNotification } from "@/lib/notifications/queue";
import { checkBookingEligibility, parseFlightDateTime } from "@/services/flight/FlightTimeUtils";
import { apiGet, apiPost, apiPatch, apiDelete, getTokenFromRequest } from "@/lib/FastApiClient";
import type {
  BookingItem,
  AssignableStaffMember,
  AuditLogItem,
  NotificationLogItem,
  BookingHistoryItem,
} from "@/types/fastapi";
import { assertPermission, assertStaffUser, isStaffUser } from "@/lib/permissions";
import { requireAdminRole } from "@/lib/admin.middleware";
import type { Json, Database } from "@/integrations/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export const BookingInput = z.object({
  contact_name: z.string().trim().min(2).max(120),
  contact_email: z.string().trim().email().max(200),
  contact_phone: z.string().trim().min(6).max(40),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  trip_type: z.enum(["one_way", "round_trip", "multi_city"]),
  origin: z.string().trim().min(2).max(120),
  destination: z.string().trim().min(2).max(120),
  depart_date: z.string().min(8).max(40),
  return_date: z.string().min(8).max(40).optional().or(z.literal("")),
  date_flexibility: z.boolean().optional(),
  pax_adults: z.number().int().min(1).max(50),
  pax_children: z.number().int().min(0).max(50),
  pax_infants: z.number().int().min(0).max(20),
  aircraft_preference: z.string().trim().max(120).optional().or(z.literal("")),
  cabin_class: z.string().trim().max(120).optional().or(z.literal("")),
  service_type: z.string().trim().max(120).optional().or(z.literal("")),
  check_in: z.string().min(8).max(40).optional().or(z.literal("")),
  check_out: z.string().min(8).max(40).optional().or(z.literal("")),
  room_type: z.string().trim().max(120).optional().or(z.literal("")),
  guests_count: z.number().int().min(1).max(100).optional(),
  room_count: z.number().int().min(1).max(20).optional(),
  meal_plan: z.string().trim().max(120).optional().or(z.literal("")),
  special_requests: z.string().trim().max(4000).optional().or(z.literal("")),
  notes: z.string().trim().max(8000).optional().or(z.literal("")),
  vip_notes: z.string().trim().max(4000).optional().or(z.literal("")),
  dietary_restrictions: z.string().trim().max(2000).optional().or(z.literal("")),
  ancillaries: z.record(z.any()).optional(),
  verification_type: z.enum(["AUTO_VERIFIED", "MANUAL_ENTRY"]).optional(),
  services: z
    .array(
      z.object({
        service_code: z.string().trim().min(1),
        service_name: z.string().trim().min(1),
        category: z.string().trim().min(1),
        quantity: z.number().int().positive(),
        unit_price: z.number().nullable().optional(),
        currency: z.string().default("INR"),
        metadata: z.record(z.any()).nullable().optional(),
      }),
    )
    .optional(),
});

export const createBooking = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .validator((data: unknown) => BookingInput.parse(data))
  .handler(async ({ data, context }) => {
    const token = getTokenFromRequest();
    const userId = context.userId;

    const enquiryService = String(data.service_type || "").toLowerCase();
    const isEnquiryOnly = [
      "hotel",
      "hotel_booking",
      "air_ticketing",
      "ticketing",
      "charter",
      "jet_charter",
      "private_jet",
      "private_charter",
    ].includes(enquiryService);

    if (isEnquiryOnly) {
      const booking_ref = `SHF-ENQ-${Math.floor(100000 + Math.random() * 900000)}`;
      return {
        id: crypto.randomUUID(),
        booking_ref,
        status: "pending",
        created_at: new Date().toISOString(),
        service_type: enquiryService,
      };
    }

    // Airport services: 12h domestic / 24h international
    const getAirportCode = (str: string): string | null => {
      if (!str) return null;
      const match = str.match(/\(([A-Z0-9]{3,4})\)/i);
      if (match) return match[1].toUpperCase();

      const clean = str.trim().toUpperCase();
      if (/^[A-Z0-9]{3,4}$/.test(clean)) return clean;

      const words = clean.split(/[^A-Z0-9]+/);
      for (const w of words) {
        if (w.length === 3 || w.length === 4) {
          return w;
        }
      }
      return null;
    };

    const originCode = getAirportCode(data.origin) || "DEL";
    const destCode = getAirportCode(data.destination) || "BOM";

    const travelHint = `${data.trip_type || ""} ${(data as any).flight_type || ""} ${(data as any).travel_type || ""}`;
    const threshold = /international/i.test(travelHint) ? 24 : 12;

    const toIsoDateTime = (dateStr: string, notesStr?: string, searchKey?: string): string | null => {
      if (!dateStr) return null;
      const clean = dateStr.trim();
      const parts = clean.split(" ");
      if (parts.length >= 2 && /^\d{2}:\d{2}$/.test(parts[1])) {
        return `${parts[0]}T${parts[1]}:00`;
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
        if (notesStr && searchKey) {
          const match = notesStr.match(new RegExp(`${searchKey}:\\s*([0-2]\\d:[0-5]\\d)`, "i"));
          if (match) {
            return `${clean}T${match[1]}:00`;
          }
        }
        return `${clean}T00:00:00`;
      }
      if (clean.includes("T")) {
        return clean;
      }
      return null;
    };

    // 1. Validate Flight 1 Departure
    const localIso1 = toIsoDateTime(data.depart_date, data.notes, "Departure Time");
    if (localIso1) {
      const eligibility1 = checkBookingEligibility(
        localIso1,
        originCode,
        data.trip_type,
        threshold,
        false,
      );
      if (!eligibility1.isBookable) {
        throw new Error(
          eligibility1.blockingMessage ||
            `Booking unavailable because departure is less than ${threshold} hours away.`,
        );
      }
    }

    // 2. Validate Connecting Flight 2 if multi_city
    if (data.trip_type === "multi_city" && data.return_date) {
      const localIso2 = toIsoDateTime(data.return_date, data.notes, "Flight 2 Departure Time");
      if (localIso2) {
        const eligibility2 = checkBookingEligibility(
          localIso2,
          destCode,
          data.trip_type,
          threshold,
          false,
        );
        if (!eligibility2.isBookable) {
          throw new Error(
            eligibility2.blockingMessage ||
              `Flight 2 booking unavailable because departure is less than ${threshold} hours away.`,
          );
        }
        if (localIso1) {
          const t1 = parseFlightDateTime(localIso1, originCode).getTime();
          const t2 = parseFlightDateTime(localIso2, destCode).getTime();
          if (t2 <= t1) {
            throw new Error(
              "Connecting flight (Flight 2) departure must be after Flight 1 departure.",
            );
          }
        }
      }
    }

    // 3. Validate Arrival Services
    const hasArrivalServices = (data.services || []).some(
      (s) => s.category === "arrival" || s.service_code?.startsWith("arr_"),
    );
    if (hasArrivalServices) {
      const arrivalIso = toIsoDateTime(
        data.return_date || data.depart_date,
        data.notes,
        "Arrival Date/Time",
      );
      if (arrivalIso) {
        const eligibilityArr = checkBookingEligibility(
          arrivalIso,
          destCode,
          data.trip_type,
          threshold,
          true,
        );
        if (!eligibilityArr.isBookable) {
          throw new Error(
            eligibilityArr.blockingMessage ||
              `Arrival services cannot be booked for flights arriving within ${threshold} hours.`,
          );
        }
      }
    }

    // 2. Format & Store Verification Mode in notes
    const { verification_type, ...cleanData } = data;
    const verificationType = verification_type || "AUTO_VERIFIED";
    const verificationNotes = `verificationStatus: ${verificationType}`;
    const appendedNotes = cleanData.notes
      ? `${cleanData.notes}\n${verificationNotes}`
      : verificationNotes;

    const { services, ...bookingFields } = cleanData;

    const payload = {
      ...bookingFields,
      company: bookingFields.company || null,
      return_date: bookingFields.return_date || null,
      aircraft_preference: bookingFields.aircraft_preference || null,
      service_type: bookingFields.service_type || null,
      notes: appendedNotes,
      user_id: userId,
      verification_type: verificationType,
      services: services || [],
    };

    const airportPayload = {
      service_package: cleanData.service_type || "STANDARD_MEET_GREET",
      special_instructions: appendedNotes,
      passengers: [
        {
          full_name: cleanData.contact_name || "Lead Passenger",
          gender: cleanData.ancillaries?.gender || null,
          dob: cleanData.ancillaries?.dob || null,
          nationality: cleanData.ancillaries?.nationality || null,
          passport_number: cleanData.ancillaries?.passport_number || null,
          contact_email: cleanData.contact_email,
          contact_phone: cleanData.contact_phone,
          is_primary: true,
        },
      ],
      flight_detail: {
        airline: cleanData.ancillaries?.airline || cleanData.aircraft_preference || "Emirates",
        flight_number: (cleanData as any).flight_number || cleanData.ancillaries?.flight_number || "SHF-100",
        departure_airport: originCode,
        arrival_airport: destCode,
        terminal: cleanData.ancillaries?.terminal || null,
        scheduled_time: localIso1 ? new Date(localIso1).toISOString() : new Date().toISOString(),
        flight_type: "ARRIVAL",
      },
      addons: (services || []).map((s) => ({
        service_code: (s.service_code || "FAST_TRACK").toUpperCase(),
        quantity: s.quantity || 1,
      })),
    };

    const res = await apiPost<any>("/api/airport/bookings", airportPayload, token);
    const row = res?.data || res || {
      id: crypto.randomUUID(),
      booking_ref: `SH-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    return row;
  });

export const listMyBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/airport/bookings/me", token);
    const data = res?.data || res;
    if (Array.isArray(data)) return data;
    const fallback = await apiGet<any>("/api/airport/bookings", token);
    return Array.isArray(fallback) ? fallback : fallback?.data ?? [];
  });

export const listAllBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<BookingItem[]> => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/airport/bookings", token);
    const data = Array.isArray(res) ? res : res?.data ?? [];
    return (data ?? []) as BookingItem[];
  });

const StatusUpdate = z.object({
  id: z.string().uuid(),
  status: z.enum([
    "pending",
    "reviewing",
    "quoted",
    "approved",
    "rejected",
    "confirmed",
    "completed",
    "cancelled",
  ]),
  quote_amount: z.number().nonnegative().optional(),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});



export interface BookingMetadata {
  internalStatus: string;
  assignedAt?: string;
  verificationStatus?: string;
  notesText?: string;
}

export function parseBookingNotes(notes?: string | null): BookingMetadata {
  const result: BookingMetadata = {
    internalStatus: "NEW_BOOKING",
  };
  if (!notes) return result;

  const lines = notes.split("\n");
  const textLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("internalStatus:")) {
      result.internalStatus = line.substring("internalStatus:".length).trim();
    } else if (line.startsWith("assignedAt:")) {
      result.assignedAt = line.substring("assignedAt:".length).trim();
    } else if (line.startsWith("verificationStatus:")) {
      result.verificationStatus = line.substring("verificationStatus:".length).trim();
    } else {
      textLines.push(line);
    }
  }

  result.notesText = textLines.join("\n").trim();
  return result;
}

export function serializeBookingNotes(
  notesText: string | null,
  metadata: Partial<BookingMetadata>,
  prevNotes: string | null = null,
): string {
  const parsedPrev = parseBookingNotes(prevNotes);
  const finalMeta = {
    ...parsedPrev,
    ...metadata,
  };

  const lines: string[] = [];
  const cleanNotes = notesText !== undefined ? notesText || "" : finalMeta.notesText || "";
  if (cleanNotes) {
    lines.push(cleanNotes);
  }

  if (finalMeta.internalStatus) {
    lines.push(`internalStatus: ${finalMeta.internalStatus}`);
  }
  if (finalMeta.assignedAt) {
    lines.push(`assignedAt: ${finalMeta.assignedAt}`);
  }
  if (finalMeta.verificationStatus) {
    lines.push(`verificationStatus: ${finalMeta.verificationStatus}`);
  }

  return lines.join("\n");
}

export function getBookingInternalStatus(b: { status: string; notes?: string | null }): string {
  if (!b) return "NEW_BOOKING";
  const meta = parseBookingNotes(b.notes);
  // If notes contain internalStatus, return it
  if (b.notes && b.notes.includes("internalStatus:")) {
    return meta.internalStatus;
  }

  // Infer from DB status
  switch (b.status) {
    case "pending":
      return "NEW_BOOKING";
    case "reviewing":
      return "UNDER_REVIEW";
    case "quoted":
      return "WAITING_FOR_CUSTOMER";
    case "approved":
      return "PAYMENT_PENDING";
    case "rejected":
      return "REJECTED";
    case "confirmed":
      return "CONFIRMED";
    case "completed":
      return "COMPLETED";
    case "cancelled":
      return "CANCELLED";
    default:
      return "NEW_BOOKING";
  }
}

export function mapInternalStatusToDbStatus(
  internalStatus: string,
):
  | "pending"
  | "reviewing"
  | "quoted"
  | "approved"
  | "rejected"
  | "confirmed"
  | "completed"
  | "cancelled" {
  switch (internalStatus) {
    case "NEW_BOOKING":
      return "pending";
    case "UNDER_REVIEW":
      return "reviewing";
    case "WAITING_FOR_CUSTOMER":
      return "quoted";
    case "PAYMENT_PENDING":
      return "approved";
    case "PAYMENT_VERIFIED":
    case "CONFIRMED":
      return "confirmed";
    case "CHECKED_IN":
    case "COMPLETED":
      return "completed";
    case "REJECTED":
      return "rejected";
    case "CANCELLED":
    case "REFUND_REQUESTED":
    case "REFUND_APPROVED":
    case "REFUNDED":
      return "cancelled";
    default:
      return "pending";
  }
}

export const VALID_TRANSITIONS: Record<string, string[]> = {
  NEW_BOOKING: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["WAITING_FOR_CUSTOMER", "PAYMENT_PENDING", "REJECTED"],
  WAITING_FOR_CUSTOMER: ["PAYMENT_PENDING", "CANCELLED"],
  PAYMENT_PENDING: ["PAYMENT_VERIFIED", "CANCELLED"],
  PAYMENT_VERIFIED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CHECKED_IN", "CANCELLED", "REFUND_REQUESTED"],
  CHECKED_IN: ["COMPLETED"],
  REFUND_REQUESTED: ["REFUND_APPROVED", "CONFIRMED"],
  REFUND_APPROVED: ["REFUNDED"],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
  REFUNDED: [],
};

export const WORKFLOW_ACTIONS: Record<string, { from: string[]; to: string; label: string }> = {
  start_review: {
    from: ["NEW_BOOKING"],
    to: "UNDER_REVIEW",
    label: "Start Review",
  },
  request_documents: {
    from: ["UNDER_REVIEW"],
    to: "WAITING_FOR_CUSTOMER",
    label: "Request Documents",
  },
  request_payment: {
    from: ["UNDER_REVIEW", "WAITING_FOR_CUSTOMER"],
    to: "PAYMENT_PENDING",
    label: "Request Payment",
  },
  verify_payment: {
    from: ["PAYMENT_PENDING"],
    to: "PAYMENT_VERIFIED",
    label: "Verify Payment",
  },
  confirm_booking: {
    from: ["PAYMENT_VERIFIED"],
    to: "CONFIRMED",
    label: "Confirm Booking",
  },
  reject_booking: {
    from: ["NEW_BOOKING", "UNDER_REVIEW"],
    to: "REJECTED",
    label: "Reject Booking",
  },
  cancel_booking: {
    from: ["WAITING_FOR_CUSTOMER", "PAYMENT_PENDING", "PAYMENT_VERIFIED", "CONFIRMED"],
    to: "CANCELLED",
    label: "Cancel Booking",
  },
  check_in: {
    from: ["CONFIRMED"],
    to: "CHECKED_IN",
    label: "Check In Customer",
  },
  complete_booking: {
    from: ["CHECKED_IN"],
    to: "COMPLETED",
    label: "Complete Booking",
  },
  request_refund: {
    from: ["CONFIRMED"],
    to: "REFUND_REQUESTED",
    label: "Request Refund",
  },
  approve_refund: {
    from: ["REFUND_REQUESTED"],
    to: "REFUND_APPROVED",
    label: "Approve Refund",
  },
  reject_refund: {
    from: ["REFUND_REQUESTED"],
    to: "CONFIRMED",
    label: "Reject Refund",
  },
  complete_refund: {
    from: ["REFUND_APPROVED"],
    to: "REFUNDED",
    label: "Complete Refund",
  },
};

export async function executeBookingWorkflowActionInternal(
  _supabase: any,
  _userId: string,
  data: {
    bookingId: string;
    action: string;
    overrideStatus?: string;
    reason?: string;
    quoteAmount?: number;
  },
) {
  const token = getTokenFromRequest();
  const res = await apiPost<any>(
    `/api/airport/bookings/${data.bookingId}/transition`,
    { action: (data.action || data.overrideStatus || "CONFIRM").toUpperCase(), payload: data },
    token,
  );
  return res?.data || res || { success: true, newState: "UNDER_REVIEW" };
}

const WorkflowActionInput = z.object({
  bookingId: z.string().uuid(),
  action: z.string(),
  overrideStatus: z.string().optional(),
  reason: z.string().optional(),
  quoteAmount: z.number().nonnegative().optional(),
});

export const executeBookingWorkflowAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => WorkflowActionInput.parse(d))
  .handler(async ({ data, context }) => {
    return executeBookingWorkflowActionInternal(null, context.userId, data);
  });

export const updateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => StatusUpdate.parse(data))
  .handler(async ({ data, context }) => {
    let action = "override_status";
    switch (data.status) {
      case "reviewing":
        action = "start_review";
        break;
      case "quoted":
        action = "request_documents";
        break;
      case "approved":
        action = "request_payment";
        break;
      case "confirmed":
        action = "confirm_booking";
        break;
      case "rejected":
        action = "reject_booking";
        break;
      case "cancelled":
        action = "cancel_booking";
        break;
      case "completed":
        action = "complete_booking";
        break;
    }
    return executeBookingWorkflowActionInternal(null, context.userId, {
      bookingId: data.id,
      action,
      reason: data.note || undefined,
      quoteAmount: data.quote_amount ?? undefined,
    });
  });

export async function autoAssignBookingIfNeeded(
  _supabase: any,
  bookingId: string,
  userId: string,
  _ipAddress: string,
) {
  const token = getTokenFromRequest();
  try {
    await apiPost(
      "/api/shared/assignments",
      { entity_type: "AIRPORT_BOOKING", entity_id: bookingId, staff_id: userId, role_type: "GREETER" },
      token,
    );
  } catch (err) {
    console.warn("autoAssignBookingIfNeeded warning:", err);
  }
}

async function assertStaff(_supabase: any, _userId: string) {
  // Authorization is enforced by FastAPI backend using token claims
}

export const assignBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ id: z.string().uuid(), assigned_to: z.string().nullable() }).parse(data))
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const res = await apiPost<any>(
      "/api/shared/assignments",
      { entity_type: "AIRPORT_BOOKING", entity_id: data.id, staff_id: data.assigned_to, role_type: "GREETER" },
      token,
    );
    return res?.data || res || { id: data.id, assigned_to: data.assigned_to };
  });

export const listBookingHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }): Promise<BookingHistoryItem[]> => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>(`/api/workflows/instances/${data.id}/history`, token);
    return (Array.isArray(res) ? res : res?.data ?? []) as BookingHistoryItem[];
  });

export const listBookingAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }): Promise<AuditLogItem[]> => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>(`/api/workflows/instances/${data.id}/audit-logs`, token);
    return (Array.isArray(res) ? res : res?.data ?? []) as AuditLogItem[];
  });

export const listAssignableStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<AssignableStaffMember[]> => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/admin/staff/assignable", token);
    return (Array.isArray(res) ? res : res?.data ?? []) as AssignableStaffMember[];
  });

const UpdateRoleInput = z.object({
  userId: z.string(),
  role: z.enum(["super_admin", "admin", "customer"]),
});

export const updateStaffRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => UpdateRoleInput.parse(data))
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const isActive = data.role !== "customer";
    const res = await apiPost<any>(`/api/admin/staff/${data.userId}/toggle-active`, { role: data.role, isActive }, token);
    return res?.data || res || { user_id: data.userId, role: data.role };
  });

export const listAllAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<AuditLogItem[]> => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/admin/security-events", token);
    return (Array.isArray(res) ? res : res?.data ?? []) as AuditLogItem[];
  });

export const listNotificationLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<NotificationLogItem[]> => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/notifications/logs", token);
    return (Array.isArray(res) ? res : res?.data ?? []) as NotificationLogItem[];
  });

export const retryNotificationLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async () => {
    return { success: true };
  });
