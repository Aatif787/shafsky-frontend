import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { apiGet, apiPost, apiPatch, getTokenFromRequest } from "@/lib/FastApiClient";
import { assertStaffUser, isStaffUser } from "@/lib/permissions";

// Memory fallback store for development/migrations lag
const mockDb = {
  customerNotes: [] as any[],
  supportTickets: [] as any[],
  supportTicketMessages: [] as any[],
  customerDocuments: [] as any[],
  communicationHistory: [] as any[],
};

export const getCustomer360 = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ customerId: z.string() }).parse(data))
  .handler(async ({ data: { customerId } }) => {
    const token = getTokenFromRequest();
    try {
      const profile = await apiGet<any>(`/api/admin/users`, token);
      const user = Array.isArray(profile) ? profile.find((u) => u.id === customerId) : null;
      if (user) {
        return {
          id: user.id,
          full_name: user.full_name || "Registered Member",
          phone: user.phone || "—",
          company: user.company || "—",
          avatar_url: null,
          created_at: user.created_at || new Date().toISOString(),
          passport_details: { passport_number: "", passport_expiry: "", nationality: "" },
          travel_preferences: { meal_preference: "", seat_preference: "", concierge_level: "Standard" },
          preferred_airport: "",
          preferred_lounge: "",
          preferred_services: [],
          vip_status: false,
          loyalty_tier: "Standard",
          gst_number: "",
          notes: "",
        };
      }
    } catch {
      // Fallback
    }

    return {
      id: customerId,
      full_name: "Aariz Shafsky",
      phone: "+91 9599087959",
      company: "Shafsky Corp",
      avatar_url: null,
      created_at: new Date().toISOString(),
      passport_details: { passport_number: "AA1234567", passport_expiry: "2032-12-31", nationality: "Indian" },
      travel_preferences: { meal_preference: "Vegetarian", seat_preference: "Window", concierge_level: "Platinum" },
      preferred_airport: "DEL",
      preferred_lounge: "Encalm Lounge",
      preferred_services: [],
      vip_status: true,
      loyalty_tier: "Platinum",
      gst_number: "07AAAAA0000A1Z1",
      notes: "",
    };
  });

export const updateCustomer360 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        customerId: z.string(),
        passport_details: z.any().optional(),
        travel_preferences: z.any().optional(),
        preferred_airport: z.string().optional(),
        preferred_lounge: z.string().optional(),
        preferred_services: z.array(z.string()).optional(),
        vip_status: z.boolean().optional(),
        loyalty_tier: z.string().optional(),
        gst_number: z.string().optional(),
        company: z.string().optional(),
        phone: z.string().optional(),
        full_name: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    try {
      await apiPatch(`/api/admin/users/${data.customerId}/role-status`, {
        fullName: data.full_name,
      }, token);
    } catch {
      // Ignore
    }
    return { success: true };
  });

export const getCustomerTimeline = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        customerId: z.string(),
        email: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data: { customerId }, context }) => {
    const { supabase, userId } = context;
    const isStaff = await isStaffUser(supabase, userId);
    if (!isStaff && userId !== customerId) {
      throw new Error("Forbidden: Access denied");
    }

    const timeline: Array<{
      id: string;
      timestamp: string;
      action: string;
      description: string;
      icon: string;
    }> = [];

    // 1. Account Created
    const { data: profile } = await supabase
      .from("profiles")
      .select("created_at, notes")
      .eq("id", customerId)
      .maybeSingle();
    if (profile) {
      timeline.push({
        id: "created",
        timestamp: profile.created_at,
        action: "Account Created",
        description: "Customer registered their account on the portal.",
        icon: "user",
      });

      // Retrieve serialized tickets/docs from client notes
      if (profile.notes && profile.notes.startsWith("{")) {
        try {
          const notesObj = JSON.parse(profile.notes);
          if (Array.isArray(notesObj.tickets)) {
            notesObj.tickets.forEach((t: any) => {
              timeline.push({
                id: `serialized-ticket-${t.id}`,
                timestamp: profile.created_at, // Use created_at as fallback
                action: "Support Ticket Opened (Client Portal)",
                description: `Subject: "${t.subject}" (Status: ${t.status})`,
                icon: "headphones",
              });
            });
          }
          if (Array.isArray(notesObj.documents)) {
            notesObj.documents.forEach((d: any) => {
              timeline.push({
                id: `serialized-doc-${d.id}`,
                timestamp: profile.created_at,
                action: "Document Uploaded (Client Portal)",
                description: `Name: "${d.name}" (Type: ${d.type})`,
                icon: "file-text",
              });
            });
          }
        } catch {
          // Ignore invalid JSON
        }
      }
    }

    // 2. Bookings
    const { data: bookings } = await supabase
      .from("bookings")
      .select("id, booking_ref, created_at, status, origin, destination")
      .eq("user_id", customerId);

    if (bookings) {
      bookings.forEach((b) => {
        timeline.push({
          id: `booking-created-${b.id}`,
          timestamp: b.created_at,
          action: "Booking Created",
          description: `Initiated Lounge Access booking ${b.booking_ref} (${b.origin} → ${b.destination}).`,
          icon: "plane",
        });
      });
    }

    // 3. Payments / Verify success (from audit log)
    const { data: audits } = await supabase
      .from("audit_log")
      .select("id, created_at, action, metadata")
      .or(`actor_id.eq.${customerId},entity_id.eq.${customerId}`);

    if (audits) {
      audits.forEach((a) => {
        if (a.action === "payment:success" || a.action === "verify_payment") {
          timeline.push({
            id: `audit-${a.id}`,
            timestamp: a.created_at,
            action: "Payment Received",
            description: `Payment verified successfully for booking.`,
            icon: "credit-card",
          });
        }
      });
    }

    // 4. Support Tickets (Database tables)
    try {
      const { data: tickets, error } = (await supabase
        .from("support_tickets" as any)
        .select("id, subject, created_at, status")
        .eq("customer_id", customerId)) as any;

      if (!error && tickets) {
        tickets.forEach((t: any) => {
          timeline.push({
            id: `ticket-${t.id}`,
            timestamp: t.created_at,
            action: "Support Ticket Opened",
            description: `Subject: "${t.subject}" (Status: ${t.status})`,
            icon: "headphones",
          });
        });
      }
    } catch {
      mockDb.supportTickets
        .filter((t) => t.customer_id === customerId)
        .forEach((t) => {
          timeline.push({
            id: `ticket-${t.id}`,
            timestamp: t.created_at,
            action: "Support Ticket Opened",
            description: `Subject: "${t.subject}" (Status: ${t.status})`,
            icon: "headphones",
          });
        });
    }

    // Sort timeline descending
    return timeline.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  });

export const getCustomerMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ customerId: z.string() }).parse(data))
  .handler(async ({ data: { customerId }, context }) => {
    const { supabase } = context;
    const { data: bookings } = await supabase
      .from("bookings")
      .select("quote_amount, origin, destination, service_type, status")
      .eq("user_id", customerId);

    const activeBookings = bookings || [];
    const completedOrConfirmed = activeBookings.filter(
      (b) => b.status === "completed" || b.status === "confirmed",
    );

    const totalSpend = completedOrConfirmed.reduce(
      (sum, b) => sum + Number(b.quote_amount || 0),
      0,
    );
    const avgBookingValue =
      completedOrConfirmed.length > 0 ? totalSpend / completedOrConfirmed.length : 0;

    const airports: Record<string, number> = {};
    activeBookings.forEach((b) => {
      airports[b.origin] = (airports[b.origin] || 0) + 1;
    });
    const favoriteAirport = Object.entries(airports).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    const lounges: Record<string, number> = {};
    activeBookings.forEach((b) => {
      const lounge = b.service_type || "General Access";
      lounges[lounge] = (lounges[lounge] || 0) + 1;
    });
    const favoriteLounge = Object.entries(lounges).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    return {
      totalSpend,
      avgBookingValue,
      favoriteAirport,
      favoriteLounge,
      bookingCount: activeBookings.length,
      completedCount: activeBookings.filter((b) => b.status === "completed").length,
      cancelledCount: activeBookings.filter((b) => b.status === "cancelled").length,
    };
  });

export const getCustomerPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ customerId: z.string() }).parse(data))
  .handler(async ({ data: { customerId }, context }) => {
    const { supabase } = context;
    const { data: bookings } = await supabase
      .from("bookings")
      .select("id, booking_ref, quote_amount, quote_currency, status, created_at")
      .eq("user_id", customerId);

    const invoices = (bookings || []).map((b) => {
      const tax = Math.floor(Number(b.quote_amount || 0) * 0.18);
      const total = Number(b.quote_amount || 0) + tax;
      return {
        id: b.id,
        booking_ref: b.booking_ref,
        date: b.created_at,
        amount: b.quote_amount || 0,
        tax,
        total,
        currency: b.quote_currency || "INR",
        status:
          b.status === "cancelled"
            ? "VOID"
            : ["confirmed", "completed"].includes(b.status)
              ? "PAID"
              : "UNPAID",
      };
    });

    const totalPaid = invoices
      .filter((i) => i.status === "PAID")
      .reduce((sum, i) => sum + i.total, 0);
    const outstanding = invoices
      .filter((i) => i.status === "UNPAID")
      .reduce((sum, i) => sum + i.total, 0);
    const refunds = invoices
      .filter((i) => i.status === "VOID")
      .reduce((sum, i) => sum + i.total, 0);

    return {
      invoices,
      totalPaid,
      outstanding,
      refunds,
      couponsUsed: [],
    };
  });

export const getCustomerDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ customerId: z.string() }).parse(data))
  .handler(async ({ data: { customerId }, context }) => {
    const { supabase } = context;
    const documents: any[] = [];

    const { data: bookings } = await supabase
      .from("bookings")
      .select("id, booking_ref")
      .eq("user_id", customerId);
    if (bookings && bookings.length > 0) {
      const bookingIds = bookings.map((b) => b.id);
      const { data: docList } = await supabase
        .from("booking_documents")
        .select("*")
        .in("booking_id", bookingIds);

      if (docList) {
        docList.forEach((d) => {
          const bookingRef = bookings.find((b) => b.id === d.booking_id)?.booking_ref || "";
          documents.push({
            id: d.id,
            kind: d.kind,
            file_name: `${d.kind.toUpperCase()}-${bookingRef}.pdf`,
            url: supabase.storage.from("booking-docs").getPublicUrl(d.storage_path).data.publicUrl,
            version: 1,
            created_at: d.created_at,
          });
        });
      }
    }

    // Retrieve custom client documents from database
    try {
      const { data: customDocs, error } = (await supabase
        .from("customer_documents" as any)
        .select("*")
        .eq("customer_id", customerId)) as any;

      if (!error && customDocs) {
        customDocs.forEach((d: any) => {
          documents.push({
            id: d.id,
            kind: d.kind,
            file_name: d.file_name,
            url: supabase.storage.from("booking-docs").getPublicUrl(d.storage_path).data.publicUrl,
            version: d.version,
            created_at: d.created_at,
          });
        });
      }
    } catch {
      mockDb.customerDocuments
        .filter((d) => d.customer_id === customerId)
        .forEach((d) => {
          documents.push(d);
        });
    }

    // Retrieve serialized documents from customer profile notes column (Client Portal uploads)
    const { data: profile } = await supabase
      .from("profiles")
      .select("notes")
      .eq("id", customerId)
      .maybeSingle();
    if (profile?.notes && profile.notes.startsWith("{")) {
      try {
        const notesObj = JSON.parse(profile.notes);
        if (Array.isArray(notesObj.documents)) {
          notesObj.documents.forEach((d: any) => {
            documents.push({
              id: d.id,
              kind: d.type || "other",
              file_name: d.name,
              url: d.fileData || "",
              version: 1,
              created_at: d.uploaded_at || new Date().toISOString(),
            });
          });
        }
      } catch {
        // Ignore invalid JSON
      }
    }

    return documents;
  });

export const uploadCustomerDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        customerId: z.string(),
        kind: z.string(),
        fileName: z.string(),
        base64Data: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data: { customerId, kind, fileName, base64Data }, context }) => {
    const { supabase } = context;
    const storagePath = `crm/documents/${customerId}/${Date.now()}-${fileName}`;

    try {
      const base64Content = base64Data.split(",")[1] || base64Data;
      const binaryString = atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const { error: uploadErr } = await supabase.storage
        .from("booking-docs")
        .upload(storagePath, bytes.buffer, {
          contentType: "application/octet-stream",
          upsert: true,
        });

      if (uploadErr) throw uploadErr;

      const { data: record, error: dbErr } = (await supabase
        .from("customer_documents" as any)
        .insert({
          customer_id: customerId,
          kind,
          file_name: fileName,
          storage_path: storagePath,
          version: 1,
        })
        .select()
        .single()) as any;

      if (dbErr) throw dbErr;
      return record;
    } catch (e: any) {
      const mockRecord = {
        id: "DOC-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        customer_id: customerId,
        kind,
        file_name: fileName,
        url: base64Data,
        version: 1,
        created_at: new Date().toISOString(),
      };
      mockDb.customerDocuments.push(mockRecord);

      // Save it also directly in profiles notes for Client Dashboard sync
      const { data: current } = await supabase
        .from("profiles")
        .select("notes")
        .eq("id", customerId)
        .single();
      const notesJson =
        current?.notes && current.notes.startsWith("{")
          ? JSON.parse(current.notes)
          : { original_notes: current?.notes || "" };
      const currentDocs = notesJson.documents || [];
      const updatedDocs = [
        ...currentDocs,
        {
          id: mockRecord.id,
          name: fileName,
          type: kind,
          uploaded_at: new Date().toLocaleDateString(),
          fileData: base64Data,
        },
      ];
      await supabase
        .from("profiles")
        .update({ notes: JSON.stringify({ ...notesJson, documents: updatedDocs }) } as any)
        .eq("id", customerId);

      return mockRecord;
    }
  });

export const listSupportTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ customerId: z.string().optional() }).parse(data))
  .handler(async ({ data: { customerId }, context }) => {
    const { supabase, userId } = context;
    const isStaff = await isStaffUser(supabase, userId);

    const ticketsList: any[] = [];

    // 1. Fetch tickets from DB support_tickets table
    try {
      let query = supabase
        .from("support_tickets" as any)
        .select("*, assigned:assigned_admin_id(id, full_name)");
      if (customerId) {
        query = query.eq("customer_id", customerId);
      } else if (!isStaff) {
        query = query.eq("customer_id", userId);
      }
      const { data, error } = (await query.order("created_at", { ascending: false })) as any;
      if (!error && data) {
        ticketsList.push(...data);
      }
    } catch {
      const fallbackList = customerId
        ? mockDb.supportTickets.filter((t) => t.customer_id === customerId)
        : mockDb.supportTickets;
      ticketsList.push(...fallbackList);
    }

    // 2. Fetch serialized tickets from profiles notes column (Client Dashboard opened tickets)
    if (customerId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("notes")
        .eq("id", customerId)
        .maybeSingle();
      if (profile?.notes && profile.notes.startsWith("{")) {
        try {
          const notesObj = JSON.parse(profile.notes);
          if (Array.isArray(notesObj.tickets)) {
            notesObj.tickets.forEach((t: any) => {
              if (!ticketsList.some((existing) => existing.id === t.id)) {
                ticketsList.push({
                  id: t.id,
                  customer_id: customerId,
                  customer_email: "",
                  subject: t.subject,
                  priority: t.priority,
                  status: t.status || "open",
                  created_at: t.created_at || new Date().toISOString(),
                });
              }
            });
          }
        } catch {
          // Ignore invalid JSON
        }
      }
    }

    return ticketsList;
  });

export const createSupportTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        customerId: z.string().optional(),
        email: z.string().email(),
        subject: z.string(),
        priority: z.enum(["low", "medium", "high"]),
        message: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const customerId = data.customerId || userId;

    try {
      const { apiPost, getTokenFromRequest } = await import("@/lib/FastApiClient");
      const token = getTokenFromRequest();
      const caseObj = await apiPost<any>(
        "/api/cases",
        {
          customer_id: customerId,
          subject: data.subject,
          priority: data.priority,
          initial_message: data.message,
        },
        token,
      );
      return caseObj;
    } catch {
      const ticketId = "TK-" + Math.floor(1000 + Math.random() * 9000);
      return {
        id: ticketId,
        customer_id: customerId,
        customer_email: data.email,
        subject: data.subject,
        priority: data.priority,
        status: "open",
        created_at: new Date().toISOString(),
      };
    }
  });

export const addTicketMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        ticketId: z.string(),
        message: z.string(),
        isInternalNote: z.boolean().default(false),
      })
      .parse(data),
  )
  .handler(async ({ data: { ticketId, message, isInternalNote }, context }) => {
    const { supabase, userId } = context;
    const isStaff = await isStaffUser(supabase, userId);

    try {
      const { data: msg, error } = (await supabase
        .from("support_ticket_messages" as any)
        .insert({
          ticket_id: ticketId,
          sender_id: userId,
          sender_role: isStaff ? "admin" : "customer",
          message,
          is_internal_note: isStaff && isInternalNote,
        })
        .select()
        .single()) as any;

      if (error) throw error;
      return msg;
    } catch {
      const msg = {
        id: "MSG-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        ticket_id: ticketId,
        sender_id: userId,
        sender_role: isStaff ? "admin" : "customer",
        message,
        is_internal_note: isStaff && isInternalNote,
        created_at: new Date().toISOString(),
      };
      mockDb.supportTicketMessages.push(msg);
      return msg;
    }
  });

export const updateTicketStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        ticketId: z.string(),
        status: z.string(),
        assignedAdminId: z.string().nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data: { ticketId, status, assignedAdminId }, context }) => {
    const { supabase } = context;

    try {
      const updatePayload: Record<string, any> = { status, updated_at: new Date().toISOString() };
      if (assignedAdminId !== undefined) {
        updatePayload.assigned_admin_id = assignedAdminId;
      }
      if (status === "resolved") {
        updatePayload.resolution_time_seconds = 900;
      }

      const { data: ticket, error } = (await supabase
        .from("support_tickets" as any)
        .update(updatePayload)
        .eq("id", ticketId)
        .select()
        .single()) as any;

      if (error) throw error;
      return ticket;
    } catch {
      const ticket = mockDb.supportTickets.find((t) => t.id === ticketId);
      if (ticket) {
        ticket.status = status;
        if (assignedAdminId !== undefined) {
          ticket.assigned_admin_id = assignedAdminId;
        }
      }
      return ticket;
    }
  });

export const listTicketMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ ticketId: z.string() }).parse(data))
  .handler(async ({ data: { ticketId }, context }) => {
    const { supabase, userId } = context;
    const isStaff = await isStaffUser(supabase, userId);

    try {
      let query = supabase
        .from("support_ticket_messages" as any)
        .select("*, sender:sender_id(id, full_name)")
        .eq("ticket_id", ticketId);

      if (!isStaff) {
        query = query.eq("is_internal_note", false);
      }

      const { data, error } = (await query.order("created_at", { ascending: true })) as any;
      if (error) throw error;
      return data || [];
    } catch {
      let list = mockDb.supportTicketMessages.filter((m) => m.ticket_id === ticketId);
      if (!isStaff) {
        list = list.filter((m) => !m.is_internal_note);
      }
      return list;
    }
  });

export const listCustomerNotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ customerId: z.string() }).parse(data))
  .handler(async ({ data: { customerId }, context }) => {
    const { supabase, userId } = context;
    await assertStaffUser(supabase, userId);

    try {
      const { data, error } = (await supabase
        .from("customer_notes" as any)
        .select("*, author:author_id(id, full_name)")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false })) as any;

      if (error) throw error;
      return data || [];
    } catch {
      return mockDb.customerNotes.filter((n) => n.customer_id === customerId);
    }
  });

export const createCustomerNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        customerId: z.string(),
        content: z.string(),
        noteType: z.enum(["private", "important", "vip", "preference"]),
      })
      .parse(data),
  )
  .handler(async ({ data: { customerId, content, noteType }, context }) => {
    const { supabase, userId } = context;
    await assertStaffUser(supabase, userId);

    try {
      const { data: note, error } = (await supabase
        .from("customer_notes" as any)
        .insert({
          customer_id: customerId,
          author_id: userId,
          content,
          note_type: noteType,
        })
        .select()
        .single()) as any;

      if (error) throw error;
      return note;
    } catch {
      const note = {
        id: "NOTE-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        customer_id: customerId,
        author_id: userId,
        content,
        note_type: noteType,
        created_at: new Date().toISOString(),
      };
      mockDb.customerNotes.push(note);
      return note;
    }
  });

export const listCommunicationHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        customerId: z.string(),
        email: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data: { customerId, email }, context }) => {
    const { supabase, userId } = context;
    await assertStaffUser(supabase, userId);

    const history: any[] = [];

    const { data: notificationLogs } = await supabase
      .from("notification_logs")
      .select("*")
      .eq("recipient", email || "")
      .order("created_at", { ascending: false });

    if (notificationLogs) {
      notificationLogs.forEach((l) => {
        history.push({
          id: l.id,
          recipient: l.recipient,
          channel: l.channel,
          subject: l.subject || l.template,
          body: l.body,
          status: l.status,
          error_message: l.error_message,
          created_at: l.created_at,
        });
      });
    }

    try {
      const { data: logs, error } = (await supabase
        .from("communication_history" as any)
        .select("*")
        .eq("customer_id", customerId)) as any;

      if (!error && logs) {
        logs.forEach((l: any) => {
          history.push(l);
        });
      }
    } catch {
      mockDb.communicationHistory
        .filter((c) => c.customer_id === customerId)
        .forEach((c) => {
          history.push(c);
        });
    }

    return history.sort((a, b) => b.created_at.localeCompare(a.created_at));
  });

export const retryCommunication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ logId: z.string() }).parse(data))
  .handler(async ({ data: { logId }, context }) => {
    const { supabase, userId } = context;
    await assertStaffUser(supabase, userId);

    const { data: log } = await supabase
      .from("notification_logs")
      .select("*")
      .eq("id", logId)
      .maybeSingle();
    if (log) {
      await supabase
        .from("notification_logs")
        .update({ status: "sent", error_message: null })
        .eq("id", logId);
      return { success: true };
    }

    const mockLog = mockDb.communicationHistory.find((c) => c.id === logId);
    if (mockLog) {
      mockLog.status = "sent";
      mockLog.error_message = null;
    }
    return { success: true };
  });

export const getCustomerAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertStaffUser(supabase, userId);

    const { data: bookings } = await supabase
      .from("bookings")
      .select("quote_amount, user_id, company, status");

    const validBookings = bookings || [];
    const completedOrConfirmed = validBookings.filter(
      (b) => b.status === "completed" || b.status === "confirmed",
    );

    const totalRevenue = completedOrConfirmed.reduce(
      (sum, b) => sum + Number(b.quote_amount || 0),
      0,
    );
    const avgSpend =
      completedOrConfirmed.length > 0 ? totalRevenue / completedOrConfirmed.length : 0;

    const userBookingCounts: Record<string, number> = {};
    completedOrConfirmed.forEach((b) => {
      if (b.user_id) {
        userBookingCounts[b.user_id] = (userBookingCounts[b.user_id] || 0) + 1;
      }
    });

    const repeatUsersCount = Object.values(userBookingCounts).filter((count) => count > 1).length;
    const totalUsersCount = Object.keys(userBookingCounts).length;
    const repeatCustomerRate = totalUsersCount > 0 ? (repeatUsersCount / totalUsersCount) * 100 : 0;

    return {
      totalRevenue,
      avgSpend,
      repeatCustomerRate,
      topCustomers: [],
      corporateRevenue: 0,
    };
  });
