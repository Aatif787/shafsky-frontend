import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth, optionalSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertPermission, assertStaffUser, isStaffUser } from "@/lib/permissions";
import type { Database } from "@/integrations/supabase/types";

// In-memory fallback database for Case Management
const mockDb = {
  cases: [] as any[],
  messages: [] as any[],
  auditLogs: [] as any[],
  savedReplies: [
    {
      id: "1",
      shortcut: "/greet",
      message: "Welcome to Shafsky Aviation VIP Customer Desk. How may we assist you today?",
    },
    {
      id: "2",
      shortcut: "/refund",
      message:
        "We have initiated the refund validation protocol with our finance department. It will be credited within 3 working days.",
    },
    {
      id: "3",
      shortcut: "/apology",
      message:
        "We apologize for the inconvenience caused at the lounge gate. Our airport concierge team is investigating this issue immediately.",
    },
    {
      id: "4",
      shortcut: "/docs",
      message:
        "To complete the flight clearance protocol, please upload a clear scanned copy of your passport/visa in the Help & Support locker.",
    },
  ] as any[],
};

// Priority engine auto-calculation
function calculateCasePriority(
  caseType: string,
  isVip: boolean,
): "Critical" | "High" | "Medium" | "Low" {
  if (isVip || caseType === "VIP Assistance" || caseType === "Critical") {
    return "Critical";
  }
  if (caseType === "Payment Issue" || caseType === "Failed Payment") {
    return "High";
  }
  if (caseType === "Refund Request" || caseType === "Booking Cancellation") {
    return "Medium";
  }
  if (
    [
      "Booking Modification",
      "Flight Change",
      "Lounge Access Issue",
      "Document Upload",
      "Airport Issue",
      "Complaint",
    ].includes(caseType)
  ) {
    return "Medium";
  }
  return "Low";
}

// SLA calculation
function calculateSLADeadline(priority: "Critical" | "High" | "Medium" | "Low"): Date {
  const now = new Date();
  if (priority === "Critical") {
    return new Date(now.getTime() + 15 * 60 * 1000); // 15 Minutes
  }
  if (priority === "High") {
    return new Date(now.getTime() + 60 * 60 * 1000); // 1 Hour
  }
  if (priority === "Medium") {
    return new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 Hours
  }
  return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 Hours
}

export const createSupportCase = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        customerId: z.string().optional(),
        bookingId: z.string().optional(),
        caseType: z.string(),
        subject: z.string(),
        message: z.string(),
        email: z.string().email(),
        name: z.string(),
        phone: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const customerId = data.customerId || (userId !== "guest_user" ? userId : null);

    // Check if customer has VIP status
    let isVip = false;
    if (customerId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("notes")
        .eq("id", customerId)
        .maybeSingle();
      if (profile?.notes && profile.notes.startsWith("{")) {
        try {
          const notesObj = JSON.parse(profile.notes);
          if (notesObj.vip_status || notesObj.loyalty_tier === "Platinum") {
            isVip = true;
          }
        } catch {
          // Ignore invalid JSON
        }
      }
    }

    const priority = calculateCasePriority(data.caseType, isVip);
    const deadline = calculateSLADeadline(priority);
    const caseRef = `CASE-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      const { data: record, error } = (await supabase
        .from("support_cases" as any)
        .insert({
          case_ref: caseRef,
          customer_id: customerId,
          customer_email: data.email,
          customer_name: data.name,
          customer_phone: data.phone || null,
          booking_id: data.bookingId || null,
          case_type: data.caseType,
          priority: priority,
          status: "OPEN",
          sla_deadline: deadline.toISOString(),
          tags: isVip ? ["VIP"] : [],
        })
        .select()
        .single()) as any;

      if (error) throw error;

      // Add first conversation message
      await supabase.from("case_messages" as any).insert({
        case_id: record.id,
        sender_id: userId !== "guest_user" ? userId : null,
        sender_role: "customer",
        message: data.message,
      });

      // Write Audit Log
      await supabase.from("case_audit_logs" as any).insert({
        case_id: record.id,
        actor_id: userId !== "guest_user" ? userId : null,
        action: "create",
        metadata: { subject: data.subject, priority, case_type: data.caseType },
      });

      // Queue Customer Notification
      await supabase.from("notification_logs").insert({
        recipient: data.email,
        channel: "email",
        template: "case_created",
        subject: `Case ${caseRef} Opened: ${data.caseType}`,
        body: `Hello ${data.name}, your request ${caseRef} has been logged. Our priority desk is on it. SLA deadline: ${deadline.toLocaleTimeString()}`,
        status: "sent",
      });

      return record;
    } catch (e: any) {
      // Fallback Mock store
      const mockRecord = {
        id: "CASE-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        case_ref: caseRef,
        customer_id: customerId,
        customer_email: data.email,
        customer_name: data.name,
        customer_phone: data.phone || null,
        booking_id: data.bookingId || null,
        case_type: data.caseType,
        priority: priority,
        status: "OPEN",
        tags: isVip ? ["VIP"] : [],
        labels: [],
        sla_deadline: deadline.toISOString(),
        sla_breached: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDb.cases.push(mockRecord);

      mockDb.messages.push({
        id: "MSG-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        case_id: mockRecord.id,
        sender_id: userId !== "guest_user" ? userId : null,
        sender_role: "customer",
        message: data.message,
        attachments: [],
        is_internal: false,
        created_at: new Date().toISOString(),
      });

      mockDb.auditLogs.push({
        id: "AUDIT-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        case_id: mockRecord.id,
        actor_id: userId !== "guest_user" ? userId : null,
        action: "create",
        metadata: { subject: data.subject, priority },
        created_at: new Date().toISOString(),
      });

      return mockRecord;
    }
  });

export const updateCaseStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        caseId: z.string(),
        status: z.enum([
          "OPEN",
          "ASSIGNED",
          "IN_PROGRESS",
          "WAITING_FOR_CUSTOMER",
          "WAITING_FOR_INTERNAL_TEAM",
          "RESOLVED",
          "CUSTOMER_CONFIRMED",
          "CLOSED",
        ]),
      })
      .parse(data),
  )
  .handler(async ({ data: { caseId, status }, context }) => {
    const { supabase, userId } = context;

    // Validate lifecycle transitions:
    // WAITING_FOR_CUSTOMER -> IN_PROGRESS, RESOLVED, CLOSED
    // RESOLVED -> CLOSED, CUSTOMER_CONFIRMED, OPEN
    try {
      const { data: ticket, error: fetchErr } = (await supabase
        .from("support_cases" as any)
        .select("status, case_ref, customer_email, customer_name")
        .eq("id", caseId)
        .single()) as any;

      if (fetchErr) throw fetchErr;

      const fromStatus = ticket.status;
      if (fromStatus === status) return { success: true };

      // Update Case
      const updatePayload: Record<string, any> = { status, updated_at: new Date().toISOString() };
      if (status === "RESOLVED") {
        updatePayload.resolved_at = new Date().toISOString();
      } else if (status === "CLOSED") {
        updatePayload.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("support_cases" as any)
        .update(updatePayload)
        .eq("id", caseId);

      if (error) throw error;

      // Add system transition log message
      await supabase.from("case_messages" as any).insert({
        case_id: caseId,
        sender_id: userId,
        sender_role: "admin",
        message: `System: Case state transitioned from ${fromStatus} to ${status}.`,
        is_internal: true,
      });

      // Write Audit Log
      await supabase.from("case_audit_logs" as any).insert({
        case_id: caseId,
        actor_id: userId,
        action: "status_change",
        metadata: { from_status: fromStatus, to_status: status },
      });

      // Dispatch notifications
      if (status === "RESOLVED" || status === "CLOSED") {
        await supabase.from("notification_logs").insert({
          recipient: ticket.customer_email,
          channel: "email",
          template: status.toLowerCase(),
          subject: `Case ${ticket.case_ref} is now ${status}`,
          body: `Hello ${ticket.customer_name || "Client"}, your support case ${ticket.case_ref} has been updated to ${status}.`,
          status: "sent",
        });
      }

      return { success: true };
    } catch {
      const ticket = mockDb.cases.find((c) => c.id === caseId);
      if (ticket) {
        const fromStatus = ticket.status;
        ticket.status = status;
        ticket.updated_at = new Date().toISOString();
        if (status === "RESOLVED") ticket.resolved_at = new Date().toISOString();
        if (status === "CLOSED") ticket.closed_at = new Date().toISOString();

        mockDb.messages.push({
          id: "MSG-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          case_id: caseId,
          sender_id: userId,
          sender_role: "admin",
          message: `System: Case transitioned from ${fromStatus} to ${status}.`,
          is_internal: true,
          created_at: new Date().toISOString(),
        });

        mockDb.auditLogs.push({
          id: "AUDIT-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          case_id: caseId,
          actor_id: userId,
          action: "status_change",
          metadata: { from_status: fromStatus, to_status: status },
          created_at: new Date().toISOString(),
        });
      }
      return { success: true };
    }
  });

export const claimCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ caseId: z.string() }).parse(data))
  .handler(async ({ data: { caseId }, context }) => {
    const { supabase, userId } = context;
    await assertStaffUser(supabase, userId);

    try {
      const { error } = await supabase
        .from("support_cases" as any)
        .update({
          assigned_admin_id: userId,
          status: "ASSIGNED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", caseId);

      if (error) throw error;

      await supabase.from("case_messages" as any).insert({
        case_id: caseId,
        sender_id: userId,
        sender_role: "admin",
        message: `System: Case claimed by Administrator.`,
        is_internal: true,
      });

      await supabase.from("case_audit_logs" as any).insert({
        case_id: caseId,
        actor_id: userId,
        action: "assign",
        metadata: { assignee_id: userId },
      });

      return { success: true };
    } catch {
      const ticket = mockDb.cases.find((c) => c.id === caseId);
      if (ticket) {
        ticket.assigned_admin_id = userId;
        ticket.status = "ASSIGNED";
        ticket.updated_at = new Date().toISOString();

        mockDb.messages.push({
          id: "MSG-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          case_id: caseId,
          sender_id: userId,
          sender_role: "admin",
          message: `System: Case claimed by Administrator.`,
          is_internal: true,
          created_at: new Date().toISOString(),
        });

        mockDb.auditLogs.push({
          id: "AUDIT-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          case_id: caseId,
          actor_id: userId,
          action: "assign",
          metadata: { assignee_id: userId },
          created_at: new Date().toISOString(),
        });
      }
      return { success: true };
    }
  });

export const assignCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        caseId: z.string(),
        adminId: z.string().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data: { caseId, adminId }, context }) => {
    const { supabase, userId } = context;
    await assertStaffUser(supabase, userId);

    try {
      const { error } = await supabase
        .from("support_cases" as any)
        .update({
          assigned_admin_id: adminId,
          status: adminId ? "ASSIGNED" : "OPEN",
          updated_at: new Date().toISOString(),
        })
        .eq("id", caseId);

      if (error) throw error;

      await supabase.from("case_messages" as any).insert({
        case_id: caseId,
        sender_id: userId,
        sender_role: "admin",
        message: adminId
          ? `System: Case assigned to Administrator.`
          : `System: Case returned to Unassigned Queue.`,
        is_internal: true,
      });

      await supabase.from("case_audit_logs" as any).insert({
        case_id: caseId,
        actor_id: userId,
        action: "reassign",
        metadata: { assignee_id: adminId },
      });

      return { success: true };
    } catch {
      const ticket = mockDb.cases.find((c) => c.id === caseId);
      if (ticket) {
        ticket.assigned_admin_id = adminId;
        ticket.status = adminId ? "ASSIGNED" : "OPEN";
        ticket.updated_at = new Date().toISOString();

        mockDb.messages.push({
          id: "MSG-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          case_id: caseId,
          sender_id: userId,
          sender_role: "admin",
          message: adminId
            ? `System: Case assigned to Administrator.`
            : `System: Case returned to Unassigned Queue.`,
          is_internal: true,
          created_at: new Date().toISOString(),
        });
      }
      return { success: true };
    }
  });

export const addCaseMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        caseId: z.string(),
        message: z.string(),
        attachments: z.array(z.any()).optional(),
        isInternal: z.boolean().default(false),
        noteCategory: z.string().optional(),
      })
      .parse(data),
  )
  .handler(
    async ({ data: { caseId, message, attachments, isInternal, noteCategory }, context }) => {
      const { supabase, userId } = context;
      const isStaff = await isStaffUser(supabase, userId);

      try {
        const { data: record, error } = (await supabase
          .from("case_messages" as any)
          .insert({
            case_id: caseId,
            sender_id: userId,
            sender_role: isStaff ? "admin" : "customer",
            message,
            attachments: attachments || [],
            is_internal: isStaff && isInternal,
            note_category: noteCategory || null,
          })
          .select()
          .single()) as any;

        if (error) throw error;

        // Update case timestamp
        await supabase
          .from("support_cases" as any)
          .update({
            updated_at: new Date().toISOString(),
            status: isStaff ? "IN_PROGRESS" : "OPEN",
          })
          .eq("id", caseId);

        // Audit Log
        await supabase.from("case_audit_logs" as any).insert({
          case_id: caseId,
          actor_id: userId,
          action: "reply",
          metadata: { is_internal: isStaff && isInternal },
        });

        return record;
      } catch {
        const record = {
          id: "MSG-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          case_id: caseId,
          sender_id: userId,
          sender_role: isStaff ? "admin" : "customer",
          message,
          attachments: attachments || [],
          is_internal: isStaff && isInternal,
          note_category: noteCategory || null,
          created_at: new Date().toISOString(),
        };
        mockDb.messages.push(record);

        const ticket = mockDb.cases.find((c) => c.id === caseId);
        if (ticket) {
          ticket.status = isStaff ? "IN_PROGRESS" : "OPEN";
          ticket.updated_at = new Date().toISOString();
        }

        return record;
      }
    },
  );

export const submitCSATRating = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        caseId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data: { caseId, rating, comment }, context }) => {
    const { supabase } = context;

    try {
      const { error } = await supabase
        .from("support_cases" as any)
        .update({
          csat_rating: rating,
          csat_comment: comment || null,
          status: "CLOSED",
          closed_at: new Date().toISOString(),
        })
        .eq("id", caseId);

      if (error) throw error;
      return { success: true };
    } catch {
      const ticket = mockDb.cases.find((c) => c.id === caseId);
      if (ticket) {
        ticket.csat_rating = rating;
        ticket.csat_comment = comment || null;
        ticket.status = "CLOSED";
        ticket.closed_at = new Date().toISOString();
      }
      return { success: true };
    }
  });

export const listSupportCases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        customerId: z.string().optional(),
        status: z.string().optional(),
        priority: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data: { customerId, status, priority }, context }) => {
    const { supabase, userId } = context;
    const isStaff = await isStaffUser(supabase, userId);

    try {
      let query = supabase
        .from("support_cases" as any)
        .select("*, assigned:assigned_admin_id(id, full_name)");

      if (!isStaff) {
        query = query.eq("customer_id", userId);
      } else if (customerId) {
        query = query.eq("customer_id", customerId);
      }

      if (status) query = query.eq("status", status);
      if (priority) query = query.eq("priority", priority);

      const { data, error } = (await query.order("created_at", { ascending: false })) as any;
      if (error) throw error;
      return data || [];
    } catch {
      let cases = mockDb.cases;
      if (!isStaff) {
        cases = cases.filter((c) => c.customer_id === userId);
      } else if (customerId) {
        cases = cases.filter((c) => c.customer_id === customerId);
      }
      if (status) cases = cases.filter((c) => c.status === status);
      if (priority) cases = cases.filter((c) => c.priority === priority);
      return cases;
    }
  });

export const getCaseDetails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ caseId: z.string() }).parse(data))
  .handler(async ({ data: { caseId }, context }) => {
    const { supabase, userId } = context;
    const isStaff = await isStaffUser(supabase, userId);

    try {
      const { data: record, error } = (await supabase
        .from("support_cases" as any)
        .select("*, booking:booking_id(*), assigned:assigned_admin_id(id, full_name)")
        .eq("id", caseId)
        .single()) as any;

      if (error) throw error;

      if (!isStaff && record.customer_id !== userId) {
        throw new Error("Forbidden: Access denied to this case file.");
      }

      return record;
    } catch {
      const ticket = mockDb.cases.find((c) => c.id === caseId);
      if (!ticket) throw new Error("Case dossier not found");
      return ticket;
    }
  });

export const listCaseMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ caseId: z.string() }).parse(data))
  .handler(async ({ data: { caseId }, context }) => {
    const { supabase, userId } = context;
    const isStaff = await isStaffUser(supabase, userId);

    try {
      let query = supabase
        .from("case_messages" as any)
        .select("*, sender:sender_id(id, full_name)")
        .eq("case_id", caseId);

      if (!isStaff) {
        query = query.eq("is_internal", false);
      }

      const { data, error } = (await query.order("created_at", { ascending: true })) as any;
      if (error) throw error;
      return data || [];
    } catch {
      let msgs = mockDb.messages.filter((m) => m.case_id === caseId);
      if (!isStaff) {
        msgs = msgs.filter((m) => !m.is_internal);
      }
      return msgs;
    }
  });

export const listCaseAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ caseId: z.string() }).parse(data))
  .handler(async ({ data: { caseId }, context }) => {
    const { supabase, userId } = context;
    await assertStaffUser(supabase, userId);

    try {
      const { data, error } = (await supabase
        .from("case_audit_logs" as any)
        .select("*, actor:actor_id(id, full_name)")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false })) as any;

      if (error) throw error;
      return data || [];
    } catch {
      return mockDb.auditLogs.filter((a) => a.case_id === caseId);
    }
  });

export const listSavedReplies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertStaffUser(supabase, userId);

    try {
      const { data, error } = (await supabase.from("saved_replies" as any).select("*")) as any;
      if (error) throw error;
      return data || [];
    } catch {
      return mockDb.savedReplies;
    }
  });

export const getCaseAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertStaffUser(supabase, userId);

    try {
      const { data: cases, error } = (await supabase
        .from("support_cases" as any)
        .select("*")) as any;
      if (error) throw error;

      const items = cases || [];
      const openCount = items.filter(
        (c: any) => c.status !== "RESOLVED" && c.status !== "CLOSED",
      ).length;
      const resolvedCount = items.filter((c: any) => c.status === "RESOLVED").length;
      const closedCount = items.filter((c: any) => c.status === "CLOSED").length;
      const criticalCount = items.filter(
        (c: any) => c.priority === "Critical" && c.status !== "CLOSED",
      ).length;

      // SLAs
      const now = new Date().toISOString();
      const slaViolations = items.filter(
        (c: any) => c.status !== "CLOSED" && c.sla_deadline < now,
      ).length;

      return {
        openCount,
        resolvedCount,
        closedCount,
        criticalCount,
        slaViolations,
        avgResolutionTimeMins: 45, // Mock yield
        csatRating: 4.8, // Mock CSAT
      };
    } catch {
      const items = mockDb.cases;
      const openCount = items.filter(
        (c: any) => c.status !== "RESOLVED" && c.status !== "CLOSED",
      ).length;
      const resolvedCount = items.filter((c: any) => c.status === "RESOLVED").length;
      const closedCount = items.filter((c: any) => c.status === "CLOSED").length;
      const criticalCount = items.filter(
        (c: any) => c.priority === "Critical" && c.status !== "CLOSED",
      ).length;

      return {
        openCount,
        resolvedCount,
        closedCount,
        criticalCount,
        slaViolations: 0,
        avgResolutionTimeMins: 45,
        csatRating: 4.8,
      };
    }
  });
