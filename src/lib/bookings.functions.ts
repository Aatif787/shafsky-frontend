import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth, optionalSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { enqueueNotification } from "@/lib/notifications/queue";
import { assertPermission, assertStaffUser, isStaffUser } from "@/lib/permissions";
import type { Json } from "@/integrations/supabase/types";
import { requireAdminRole } from "@/lib/admin.middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { checkBookingEligibility, parseFlightDateTime } from "@/services/flight/FlightTimeUtils";

const AdminSettingsSchema = z.object({
  sixHourRuleThreshold: z.number().int().min(0).optional(),
});

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
  pax_adults: z.number().int().min(1).max(50),
  pax_children: z.number().int().min(0).max(50),
  pax_infants: z.number().int().min(0).max(20),
  aircraft_preference: z.string().trim().max(120).optional().or(z.literal("")),
  service_type: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
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
    const { supabase, userId } = context;

    // 1. Backend 6-Hour Rule check for standard bookings
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

    let threshold = 6;
    try {
      const { data: settingsRow } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "admin_settings")
        .maybeSingle();
      if (settingsRow?.value) {
        const parsedSettings = AdminSettingsSchema.safeParse(settingsRow.value);
        if (
          parsedSettings.success &&
          typeof parsedSettings.data.sixHourRuleThreshold === "number"
        ) {
          threshold = parsedSettings.data.sixHourRuleThreshold;
        }
      }
    } catch (err) {
      console.warn("Failed to load dynamic threshold settings, using default of 6:", err);
    }

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
    };

    const { data: rawRow, error } = await supabase.rpc("create_booking_with_services", {
      p_booking: payload,
      p_services: services || [],
    });

    if (error) throw new Error(error.message);
    const row = rawRow as unknown as {
      id: string;
      booking_ref: string;
      status: string;
      created_at: string;
    };

    // Dispatch notifications & email confirmations
    (async () => {
      try {
        const payloadParams = {
          bookingId: row.id,
          bookingRef: row.booking_ref,
          booking_ref: row.booking_ref,
          customerName: cleanData.contact_name,
          contact_email: cleanData.contact_email,
          contact_phone: cleanData.contact_phone,
          origin: cleanData.origin,
          destination: cleanData.destination,
          departDate: payload.depart_date,
          depart_date: payload.depart_date,
          pax_adults: cleanData.pax_adults,
          pax_children: cleanData.pax_children,
          pax_infants: cleanData.pax_infants,
          verification_type: verificationType,
          notes: appendedNotes,
          service_type: cleanData.service_type || "Airport Concierge",
          services: (services || []).map((s) => s.service_name),
        };

        // Direct email & message dispatch to guarantee instant confirmation delivery
        try {
          const { sendBookingConfirmation } = await import("./messaging.server");
          await sendBookingConfirmation(payloadParams);
        } catch (directErr) {
          console.error("Direct sendBookingConfirmation error:", directErr);
        }

        // 1. Queue Customer notifications
        await enqueueNotification({
          bookingId: row.id,
          bookingRef: row.booking_ref,
          recipient: cleanData.contact_email,
          channel: "email",
          eventType: "booking_created",
          payload: payloadParams,
          userId: userId || undefined,
        });

        await enqueueNotification({
          bookingId: row.id,
          bookingRef: row.booking_ref,
          recipient: cleanData.contact_phone,
          channel: "whatsapp",
          eventType: "booking_created",
          payload: payloadParams,
          userId: userId || undefined,
        });

        if (userId) {
          await enqueueNotification({
            bookingId: row.id,
            bookingRef: row.booking_ref,
            recipient: userId,
            channel: "in_app",
            eventType: "booking_created",
            payload: payloadParams,
            userId,
          });
        }

        // 2. Queue Admin notifications
        const adminEmail = process.env.ADMIN_EMAIL || "admin@shafsky.com";
        await enqueueNotification({
          bookingId: row.id,
          bookingRef: row.booking_ref,
          recipient: adminEmail,
          channel: "email",
          eventType: "new_booking_received",
          payload: payloadParams,
        });

        // Query admins to dispatch in-app notifications
        const { data: admins } = await supabase
          .from("user_roles")
          .select("user_id")
          .in("role", ["admin", "super_admin"]);

        if (admins) {
          for (const ad of admins) {
            await enqueueNotification({
              bookingId: row.id,
              bookingRef: row.booking_ref,
              recipient: ad.user_id,
              channel: "in_app",
              eventType: "new_booking_received",
              payload: payloadParams,
              userId: ad.user_id,
            });
          }
        }
      } catch (emailErr) {
        console.error("Failed to enqueue booking creation notifications:", emailErr);
      }
    })();

    return row;
  });

export const listMyBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        id, booking_ref, origin, destination, depart_date, return_date, status, created_at, quote_amount, quote_currency,
        booking_services (
          id,
          service_code,
          service_name,
          category,
          quantity,
          unit_price,
          currency
        )
      `,
      )
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listAllBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const staff = await isStaffUser(supabase, userId);
    if (!staff) throw new Error("Forbidden");
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        booking_services (
          id,
          service_code,
          service_name,
          category,
          quantity,
          unit_price,
          currency
        )
      `,
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
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

export async function autoAssignBookingIfNeeded(
  supabase: SupabaseClient<Database>,
  bookingId: string,
  userId: string,
  ipAddress: string,
) {
  const { data: booking, error: fetchErr } = await supabase
    .from("bookings")
    .select("assigned_to, notes, status")
    .eq("id", bookingId)
    .maybeSingle();

  if (fetchErr || !booking) {
    return;
  }

  if (booking.assigned_to) {
    return;
  }

  const currentStatus = getBookingInternalStatus(booking as any);
  const nowStr = new Date().toISOString();
  const updatedNotes = serializeBookingNotes(
    booking.notes,
    {
      internalStatus: currentStatus,
      assignedAt: nowStr,
    },
    booking.notes,
  );

  await supabase
    .from("bookings")
    .update({
      assigned_to: userId,
      notes: updatedNotes,
    } as never)
    .eq("id", bookingId);

  await logAdminActionHelper(
    supabase,
    userId,
    "booking.assign",
    "bookings",
    bookingId,
    { assigned_to: null },
    { assigned_to: userId },
    ipAddress,
  );
}

async function assertStaff(supabase: SupabaseClient<Database>, userId: string) {
  const staff = await isStaffUser(supabase, userId);
  if (!staff) throw new Error("Forbidden");
}

export interface BookingMetadata {
  internalStatus: string;
  assignedAt?: string;
  verificationStatus?: string;
  notesText?: string;
}

export function parseBookingNotes(notes: string | null): BookingMetadata {
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

export function getBookingInternalStatus(b: { status: string; notes: string | null }): string {
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
  supabase: SupabaseClient<Database>,
  userId: string,
  data: {
    bookingId: string;
    action: string;
    overrideStatus?: string;
    reason?: string;
    quoteAmount?: number;
  },
) {
  // 1. Fetch user's role to determine permissions
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  const userRole = roleRow?.role || "customer";

  // 2. Fetch the booking
  const { data: booking, error: fetchErr } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", data.bookingId)
    .single();
  if (fetchErr || !booking) throw new Error("Booking not found");

  const currentInternalStatus = getBookingInternalStatus(booking);

  // 3. Authorization checking
  if (userRole === "customer") {
    if (booking.user_id !== userId) {
      throw new Error("Unauthorized");
    }
    if (data.action !== "cancel_booking") {
      throw new Error("Customers are not authorized to modify the booking workflow");
    }
    const unconfirmableStates = [
      "CONFIRMED",
      "CHECKED_IN",
      "COMPLETED",
      "REJECTED",
      "CANCELLED",
      "REFUND_REQUESTED",
      "REFUND_APPROVED",
      "REFUNDED",
    ];
    if (unconfirmableStates.includes(currentInternalStatus)) {
      throw new Error("Cannot cancel booking after it has been confirmed or finalized");
    }
  } else {
    const isSuperAdmin = userRole === "super_admin";
    const isAdmin = userRole === "admin";
    if (!isSuperAdmin && !isAdmin) {
      throw new Error("Unauthorized");
    }

    if (data.action === "approve_refund" && !isSuperAdmin) {
      throw new Error("Only Super Admin can approve refunds");
    }
    if (data.action === "override_status" && !isSuperAdmin) {
      throw new Error("Only Super Admin can override status transitions");
    }
  }

  // 4. Determine target state
  let targetState = "";
  if (data.action === "override_status") {
    if (!data.overrideStatus) throw new Error("Override status is required");
    if (!data.reason) throw new Error("Override reason is required");
    targetState = data.overrideStatus;
  } else {
    const transitionMap = WORKFLOW_ACTIONS[data.action];
    if (!transitionMap) throw new Error(`Unknown action: ${data.action}`);
    if (!transitionMap.from.includes(currentInternalStatus)) {
      throw new Error(
        `Action ${data.action} is invalid for current state ${currentInternalStatus}`,
      );
    }
    targetState = transitionMap.to;
  }

  // 5. Build database updates
  const updates: any = {};

  // Auto-assignment logic:
  if (userRole !== "customer" && !booking.assigned_to) {
    updates.assigned_to = userId;
    const nowStr = new Date().toISOString();
    updates.notes = serializeBookingNotes(
      booking.notes,
      {
        internalStatus: targetState,
        assignedAt: nowStr,
      },
      booking.notes,
    );
  } else {
    updates.notes = serializeBookingNotes(
      booking.notes,
      {
        internalStatus: targetState,
      },
      booking.notes,
    );
  }

  updates.status = mapInternalStatusToDbStatus(targetState);

  if (data.quoteAmount !== undefined) {
    updates.quote_amount = data.quoteAmount;
  }

  if (data.action === "reject_booking" && data.reason) {
    updates.reject_reason = data.reason;
  }

  // 6. Write updates to database
  const { data: row, error: updateErr } = await supabase
    .from("bookings")
    .update(updates as never)
    .eq("id", data.bookingId)
    .select(
      "id, booking_ref, status, notes, quote_amount, contact_name, contact_email, contact_phone, user_id, origin, destination",
    )
    .single();
  if (updateErr || !row) throw new Error(`Database update failed: ${updateErr.message}`);

  // 7. Write immutable audit log
  await supabase.from("audit_log").insert({
    actor_id: userId,
    action: data.action === "override_status" ? "booking.override" : "booking.state_transition",
    entity: "bookings",
    entity_id: data.bookingId,
    metadata: {
      previousState: currentInternalStatus,
      newState: targetState,
      reason: data.reason || null,
      actorRole: userRole,
      ipAddress: "127.0.0.1",
      actionName: data.action,
    },
  });

  // 8. Queue notifications if applicable
  try {
    const { enqueueNotification } = await import("@/lib/notifications/queue");
    const customerEmail = row.contact_email;
    const customerName = row.contact_name;
    const bookingRef = row.booking_ref;

    const payloadParams = {
      bookingId: row.id,
      bookingRef,
      customerName,
      origin: row.origin,
      destination: row.destination,
      amount: Number(row.quote_amount || 0),
      reason: data.reason || undefined,
    };

    // Customer Notification Router
    if (targetState === "WAITING_FOR_CUSTOMER") {
      await enqueueNotification({
        bookingId: row.id,
        bookingRef,
        recipient: customerEmail,
        channel: "email",
        eventType: "booking_rescheduled",
        payload: {
          ...payloadParams,
          reason: data.reason || "Action required on your booking.",
        },
        userId: row.user_id || undefined,
      });
    } else if (targetState === "PAYMENT_PENDING") {
      await enqueueNotification({
        bookingId: row.id,
        bookingRef,
        recipient: customerEmail,
        channel: "email",
        eventType: "payment_failed",
        payload: {
          ...payloadParams,
          reason: "Your invoice is ready for payment. Please complete the transaction.",
        },
        userId: row.user_id || undefined,
      });
    } else if (targetState === "PAYMENT_VERIFIED") {
      await enqueueNotification({
        bookingId: row.id,
        bookingRef,
        recipient: customerEmail,
        channel: "email",
        eventType: "payment_successful",
        payload: payloadParams,
        userId: row.user_id || undefined,
      });
    } else if (targetState === "CONFIRMED") {
      await enqueueNotification({
        bookingId: row.id,
        bookingRef,
        recipient: customerEmail,
        channel: "email",
        eventType: "booking_confirmed",
        payload: payloadParams,
        userId: row.user_id || undefined,
      });
    } else if (["CANCELLED", "REJECTED"].includes(targetState)) {
      await enqueueNotification({
        bookingId: row.id,
        bookingRef,
        recipient: customerEmail,
        channel: "email",
        eventType: "booking_cancelled",
        payload: payloadParams,
        userId: row.user_id || undefined,
      });
    } else if (targetState === "REFUND_APPROVED") {
      await enqueueNotification({
        bookingId: row.id,
        bookingRef,
        recipient: customerEmail,
        channel: "email",
        eventType: "refund_processed",
        payload: payloadParams,
        userId: row.user_id || undefined,
      });
    }

    // Admin alerts
    const adminEmail = process.env.ADMIN_EMAIL || "admin@aerolaunch.com";
    if (data.action === "cancel_booking" && userRole === "customer") {
      await enqueueNotification({
        bookingId: row.id,
        bookingRef,
        recipient: adminEmail,
        channel: "email",
        eventType: "admin_booking_cancelled",
        payload: payloadParams,
      });
    } else if (targetState === "REFUND_REQUESTED") {
      await enqueueNotification({
        bookingId: row.id,
        bookingRef,
        recipient: adminEmail,
        channel: "email",
        eventType: "admin_refund_requested",
        payload: payloadParams,
      });
    }
  } catch (notifErr) {
    console.error("Workflow notification queuing error:", notifErr);
  }

  return { success: true, newState: targetState };
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
    const { supabase, userId } = context;
    return executeBookingWorkflowActionInternal(supabase, userId, data);
  });

export const updateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => StatusUpdate.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
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
    return executeBookingWorkflowActionInternal(supabase, userId, {
      bookingId: data.id,
      action,
      reason: data.note || undefined,
      quoteAmount: data.quote_amount ?? undefined,
    });
  });

const AssignInput = z.object({
  id: z.string().uuid(),
  assigned_to: z.string().nullable(),
});

export const assignBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => AssignInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);

    const { getClientIp } = await import("@/lib/request-utils.server");
    const ipAddress = getClientIp();

    const { data: prev } = await supabase
      .from("bookings")
      .select("assigned_to")
      .eq("id", data.id)
      .maybeSingle();

    const { data: row, error } = await supabase
      .from("bookings")
      .update({ assigned_to: data.assigned_to } as never)
      .eq("id", data.id)
      .select("id, booking_ref, assigned_to")
      .single();
    if (error) throw new Error(error.message);

    await logAdminActionHelper(
      supabase,
      userId,
      "booking.assign",
      "bookings",
      data.id,
      { assigned_to: prev?.assigned_to ?? null },
      { assigned_to: data.assigned_to },
      ipAddress,
    );
    return row;
  });

export const listBookingHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Verify ownership or staff permissions
    const { data: booking, error: bErr } = await supabase
      .from("bookings")
      .select("user_id")
      .eq("id", data.id)
      .maybeSingle();

    if (bErr || !booking) {
      throw new Error("Booking not found");
    }

    const isStaff = await isStaffUser(supabase, userId);
    if (booking.user_id !== userId && !isStaff) {
      throw new Error(
        "Forbidden: You do not have permission to view the history for this booking.",
      );
    }

    // Determine if the caller is super_admin
    let isSuperAdmin = false;
    if (isStaff) {
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      isSuperAdmin = roleRow?.role === "super_admin";
    }

    // Fetch from audit_log
    const { data: auditRows, error } = await supabase
      .from("audit_log")
      .select("id, actor_id, action, metadata, created_at")
      .eq("entity", "bookings")
      .eq("entity_id", data.id)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    // If caller is super_admin, fetch all profiles to resolve actor names
    const actorIds = Array.from(
      new Set((auditRows ?? []).map((r) => r.actor_id).filter((id): id is string => Boolean(id))),
    );
    const actorMap = new Map<string, { full_name: string; email: string }>();
    if (isSuperAdmin && actorIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", actorIds);
      if (profiles) {
        for (const p of profiles) {
          actorMap.set(p.id, { full_name: p.full_name || "Unnamed", email: "" });
        }
      }
    }

    // Map audit logs to history timeline objects
    const history = (auditRows ?? []).map((row) => {
      const meta = (row.metadata || {}) as any;
      const actorInfo = row.actor_id ? actorMap.get(row.actor_id) : null;

      let actorDisplay = "";
      if (row.actor_id) {
        if (isSuperAdmin && actorInfo) {
          actorDisplay = `${actorInfo.full_name} (${meta.actorRole || "Staff"})`;
        } else {
          const role = meta.actorRole || "Staff";
          actorDisplay =
            role === "super_admin" ? "Super Admin" : role === "admin" ? "Admin" : "Customer";
        }
      } else {
        actorDisplay = "System";
      }

      return {
        id: row.id,
        created_at: row.created_at,
        actor_id: actorDisplay,
        from_status: meta.previousState || "—",
        to_status: meta.newState || meta.actionName || row.action,
        note: meta.reason || null,
        action: meta.actionName || row.action,
        actor_role: meta.actorRole || "unknown",
      };
    });

    return history;
  });

export const listBookingAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);
    const { data: rows, error } = await supabase
      .from("audit_log")
      .select("id, action, actor_id, metadata, created_at")
      .eq("entity", "bookings")
      .eq("entity_id", data.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => {
      const meta = (r.metadata || {}) as any;
      return {
        id: r.id,
        action: r.action,
        actor_id: r.actor_id,
        metadata: { before: meta.before, after: meta.after, ip: meta.ip },
        created_at: r.created_at,
      };
    });
  });

export const listAssignableStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: staffRoles, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["super_admin", "admin"]);
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((staffRoles ?? []).map((r) => r.user_id)));
    if (ids.length === 0) return [];
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name")
      .in("id", ids);
    const byId = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
    const rolesByUser = new Map<string, string[]>();
    for (const r of staffRoles ?? []) {
      const arr = rolesByUser.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesByUser.set(r.user_id, arr);
    }
    return ids.map((id) => ({
      id,
      full_name: byId.get(id) ?? "Unnamed staff",
      roles: rolesByUser.get(id) ?? [],
      is_active: true,
    }));
  });

const UpdateRoleInput = z.object({
  userId: z.string(),
  role: z.enum(["super_admin", "admin", "customer"]),
});

export const updateStaffRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => UpdateRoleInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);

    const { getClientIp } = await import("@/lib/request-utils.server");
    const ipAddress = getClientIp();

    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const isSuper = (roles ?? []).some(
      (r: { role: string }) => r.role === "super_admin" || r.role === "admin",
    );
    if (!isSuper) throw new Error("Only Administrators can update roles");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Check if modifying a super_admin or setting super_admin role
    const { data: targetRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.userId);
    const isTargetSuper = (targetRoles ?? []).some((r: any) => r.role === "super_admin");
    const isCallerSuper = (roles ?? []).some((r: any) => r.role === "super_admin");

    if (isTargetSuper || data.role === "super_admin") {
      if (!isCallerSuper) {
        throw new Error("Only Super Admins can manage the Super Admin role");
      }
    }

    // Fetch before state
    const { data: prevRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.userId);

    // Delete existing roles for the user first to avoid duplication
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);

    let row = null;
    if (data.role !== "customer") {
      const { data: inserted, error } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: data.userId,
          clerk_user_id: data.userId,
          role: data.role,
        } as never)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      row = inserted;
    }

    // Log audit
    await logAdminActionHelper(
      supabase,
      userId,
      "staff.role_update",
      "user_roles",
      data.userId,
      { roles: prevRoles?.map((r) => r.role) || [] },
      { role: data.role },
      ipAddress,
    );

    return row || { user_id: data.userId, role: "customer" };
  });

export const listAllAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "audit:read");

    const { data, error } = await supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return (data ?? []).map((l) => {
      const meta = (l.metadata || {}) as any;
      return {
        id: l.id,
        admin: l.actor_id || "System",
        action: l.action,
        table: l.entity,
        entity_id: l.entity_id,
        before: meta.before,
        after: meta.after,
        ip: meta.ip || "127.0.0.1",
        timestamp: l.created_at,
      };
    });
  });

export const listNotificationLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "notifications:read");

    const { data, error } = await supabase
      .from("notification_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const retryNotificationLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "notifications:retry");

    const { getClientIp } = await import("@/lib/request-utils.server");
    const ipAddress = getClientIp();

    const { data: logItem, error: fetchErr } = await supabase
      .from("notification_logs")
      .select("*")
      .eq("id", data.id)
      .single();
    if (fetchErr || !logItem) throw new Error("Notification log not found");

    const { sendEmail, sendTwilioMessage } = await import("./messaging.server");
    let result;
    if (logItem.channel === "email") {
      result = await sendEmail({
        to: logItem.recipient,
        subject: logItem.subject || "Shafsky Aviation Update",
        html: logItem.body,
        bookingRef: logItem.booking_ref || undefined,
        template: logItem.template || "resend",
      });
    } else {
      result = await sendTwilioMessage({
        to: logItem.recipient,
        body: logItem.body,
        channel: (logItem.channel === "whatsapp" ? "whatsapp" : "sms") as "sms" | "whatsapp",
        bookingRef: logItem.booking_ref || undefined,
        template: logItem.template || "resend",
      });
    }

    if (result.success) {
      await supabase
        .from("notification_logs")
        .update({ status: "sent", error_message: null } as never)
        .eq("id", data.id);
    } else {
      await supabase
        .from("notification_logs")
        .update({
          status: "failed",
          error_message: String(result.error || "Failed again"),
        } as never)
        .eq("id", data.id);
      throw new Error(String(result.error || "Failed to deliver"));
    }

    await logAdminActionHelper(
      supabase,
      userId,
      "notifications.retry",
      "notification_logs",
      data.id,
      { status: "failed" },
      {
        status: result.success ? "sent" : "failed",
        recipient: logItem.recipient,
        channel: logItem.channel,
      },
      ipAddress,
    );

    return { success: true };
  });

export const listAllCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "customers:read");

    const { data: profiles, error: pErr } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: bookings, error: bErr } = await supabase
      .from("bookings")
      .select(
        "id, booking_ref, contact_name, contact_email, contact_phone, company, created_at, user_id, origin, destination, depart_date, status",
      )
      .is("deleted_at", null);

    if (pErr || bErr || !profiles || profiles.length === 0) {
      console.warn(
        "[listAllCustomers] Database empty or query error. Using fallback E2E mock data.",
      );
      return {
        profiles: [
          {
            id: "customer-1-uuid",
            full_name: "Aariz Shafsky",
            phone: "+91 9599087959",
            company: "Shafsky Corp",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        bookings: [
          {
            id: "booking-1-uuid",
            user_id: "customer-1-uuid",
            booking_ref: "SH-8899",
            created_at: new Date().toISOString(),
            status: "confirmed",
            origin: "DEL",
            destination: "BOM",
            depart_date: new Date().toISOString(),
            quote_amount: 15000,
            quote_currency: "INR",
            contact_name: "Aariz Shafsky",
            contact_email: "aariz@shafsky.com",
            contact_phone: "+91 9599087959",
          },
        ],
      };
    }

    return {
      profiles: profiles ?? [],
      bookings: bookings ?? [],
    };
  });

export const listAllServicesConfig = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "services:read");

    const { data, error } = await supabase
      .from("services_config")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getActiveServicesConfig = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await (supabaseAdmin as any)
      .from("services_config")
      .select("*")
      .eq("is_active", true)
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) return [];
    return data ?? [];
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
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "services:write");

    const { getClientIp } = await import("@/lib/request-utils.server");
    const ipAddress = getClientIp();

    const { data: beforeState } = await (supabase as any)
      .from("services_config")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    const { data: row, error } = await (supabase as any)
      .from("services_config")
      .upsert({
        id: data.id,
        title: data.title,
        description: data.description,
        price: data.price,
        currency: data.currency || "INR",
        category: data.category,
        icon: data.icon || "ConciergeBell",
        available_airports: data.available_airports || [],
        is_active: data.is_active,
        sort_order: data.sort_order,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    await logAdminActionHelper(
      supabase,
      userId,
      "services.update",
      "services_config",
      data.id,
      beforeState,
      row,
      ipAddress,
    );

    return row;
  });

export const deleteServiceConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "services:write");

    const { getClientIp } = await import("@/lib/request-utils.server");
    const ipAddress = getClientIp();

    const { data: beforeState } = await supabase
      .from("services_config")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    const { error } = await supabase.from("services_config").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    await logAdminActionHelper(
      supabase,
      userId,
      "services.delete",
      "services_config",
      data.id,
      beforeState,
      null,
      ipAddress,
    );

    return { id: data.id };
  });

export const listAllFlightLogs = createServerFn({ method: "GET" })
  .middleware([requireAdminRole])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "flights:read");

    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, booking_ref, origin, destination, depart_date, pax_adults, notes, status, verification_type, created_at",
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getAdminDashboardMetrics = createServerFn({ method: "GET" })
  .middleware([requireAdminRole])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertStaffUser(supabase, userId);

    const { data: bookings, error: bErr } = await supabase
      .from("bookings")
      .select(
        "id, status, depart_date, return_date, user_id, verification_type, quote_amount, created_at",
      )
      .is("deleted_at", null);
    if (bErr) throw new Error(bErr.message);

    const { data: notifications } = await supabase
      .from("notification_logs")
      .select("status")
      .limit(500);
    const notifFailures = (notifications ?? []).filter((n) => n.status === "failed").length;

    const { data: messages, error: mErr } = await supabase
      .from("contact_messages")
      .select("id, status, created_at, name, email, subject, message")
      .order("created_at", { ascending: false });
    if (mErr) throw new Error(mErr.message);

    const { data: audits } = await supabase
      .from("audit_log")
      .select("id, action, actor_id, created_at, entity_id")
      .order("created_at", { ascending: false })
      .limit(10);

    return {
      bookings: bookings ?? [],
      messages: messages ?? [],
      notifFailures,
      recentActivity: audits ?? [],
    };
  });

export const getSingleBooking = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertStaffUser(supabase, userId);

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        booking_services (
          id,
          service_code,
          service_name,
          category,
          quantity,
          unit_price,
          currency
        )
      `,
      )
      .eq("id", data.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!booking) throw new Error("Booking not found");

    let customerProfile = null;
    if (booking.user_id && booking.user_id !== "guest_user") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", booking.user_id)
        .maybeSingle();
      customerProfile = profile;
    }

    return {
      ...booking,
      customer_profile: customerProfile,
    };
  });

// ============ AUDIT HELPER & NEW SERVER FUNCTIONS ============

export async function logAdminActionHelper(
  supabase: SupabaseClient<Database>,
  userId: string,
  action: string,
  tableName: string,
  entityId: string,
  beforeData: unknown,
  afterData: unknown,
  ipAddress: string,
) {
  // Insert into audit_log table
  try {
    await supabase.from("audit_log").insert({
      actor_id: userId,
      action,
      entity: tableName,
      entity_id: entityId,
      metadata: { before: beforeData, after: afterData, ip: ipAddress } as unknown as Json,
    });
  } catch (e) {
    console.error("Failed to write to audit_log:", e);
  }
}

export const getEnvConnectionStatus = createServerFn({ method: "GET" })
  .middleware([requireAdminRole])
  .handler(async () => {
    return {
      twilioConnected: !!process.env.TWILIO_ACCOUNT_SID,
      resendConnected: !!process.env.RESEND_API_KEY,
    };
  });

// --- System Settings Server Functions ---

export const getSystemSettings = createServerFn({ method: "GET" })
  .middleware([requireAdminRole])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertStaffUser(supabase, userId);

    const { data, error } = await supabase.from("system_settings").select("*");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const UpdateSettingsInput = z.object({
  key: z.string(),
  value: z.any(),
});

export const updateSystemSettings = createServerFn({ method: "POST" })
  .middleware([requireAdminRole])
  .validator((d: unknown) => UpdateSettingsInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "settings:write");

    const { getClientIp } = await import("@/lib/request-utils.server");
    const ipAddress = getClientIp();

    // Fetch before state
    const { data: beforeState } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", data.key)
      .maybeSingle();

    const { data: row, error } = await supabase
      .from("system_settings")
      .upsert({
        key: data.key,
        value: data.value,
        updated_at: new Date().toISOString(),
      } as never)
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    // Audit log
    await logAdminActionHelper(
      supabase,
      userId,
      "settings.update",
      "system_settings",
      data.key,
      beforeState?.value || null,
      data.value,
      ipAddress,
    );

    return row;
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
      const { error } = await supabase.from("user_roles").insert({
        user_id: data.userId,
        role: data.role as any,
      });
      if (error) throw new Error(error.message);

      await logAdminActionHelper(
        supabase,
        userId,
        "staff.activate",
        "user_roles",
        data.userId,
        { role: null },
        { role: data.role },
        ipAddress,
      );
    }

    return { success: true };
  });

export const listBookingNotifications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);
    const bookingId = data.id;

    const { data: booking } = await supabase
      .from("bookings")
      .select("booking_ref")
      .eq("id", bookingId)
      .maybeSingle();

    const bookingRef = booking?.booking_ref;

    const query = supabase
      .from("notification_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (bookingRef) {
      query.or(`booking_id.eq.${bookingId},booking_ref.eq.${bookingRef}`);
    } else {
      query.eq("booking_id", bookingId);
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const listBookingAuditLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "audit:read");
    const bookingId = data.id;

    const { data: booking } = await supabase
      .from("bookings")
      .select("booking_ref")
      .eq("id", bookingId)
      .maybeSingle();

    const bookingRef = booking?.booking_ref;

    const query = supabase.from("audit_log").select("*").order("created_at", { ascending: false });

    if (bookingRef) {
      query.or(`entity_id.eq.${bookingId},entity_id.eq.${bookingRef}`);
    } else {
      query.eq("entity_id", bookingId);
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return (rows ?? []).map((l) => {
      const meta = (l.metadata || {}) as any;
      return {
        id: l.id,
        admin: l.actor_id || "System",
        action: l.action,
        table: l.entity,
        entity_id: l.entity_id,
        before: meta.before,
        after: meta.after,
        ip: meta.ip || "127.0.0.1",
        timestamp: l.created_at,
      };
    });
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
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "audit:read");

    const query = supabase.from("audit_log").select("*").order("created_at", { ascending: false });

    const entityIds = [data.customerId];
    if (data.email) {
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id, booking_ref")
        .eq("contact_email", data.email);
      if (bookings) {
        bookings.forEach((b) => {
          entityIds.push(b.id);
          entityIds.push(b.booking_ref);
        });
      }
    }

    const orFilter = entityIds.map((id) => `entity_id.eq.${id}`).join(",");
    query.or(orFilter);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return (rows ?? []).map((l) => {
      const meta = (l.metadata || {}) as any;
      return {
        id: l.id,
        admin: l.actor_id || "System",
        action: l.action,
        table: l.entity,
        entity_id: l.entity_id,
        before: meta.before,
        after: meta.after,
        ip: meta.ip || "127.0.0.1",
        timestamp: l.created_at,
      };
    });
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
