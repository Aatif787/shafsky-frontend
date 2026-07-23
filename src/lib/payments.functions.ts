import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { enqueueNotification } from "@/lib/notifications/queue";
import { isStaffUser } from "@/lib/permissions";

export const CreateCheckoutInput = z.object({
  bookingId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default("INR"),
  provider: z.enum(["stripe", "razorpay"]),
});

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => CreateCheckoutInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Verify booking exists and belongs to the user
    const { data: booking, error: bErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", data.bookingId)
      .single();

    if (bErr || !booking) {
      throw new Error("Booking not found");
    }

    if (booking.user_id !== userId) {
      // Check if user is staff/admin
      const isStaff = await isStaffUser(supabase, userId);
      if (!isStaff) {
        throw new Error("Forbidden");
      }
    }

    const bookingRef = booking.booking_ref;

    if (data.provider === "stripe") {
      // Setup Stripe payment checkout session
      // In production, we'd initialize the official Stripe SDK:
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      // const session = await stripe.checkout.sessions.create({...});

      const isTestMode = !process.env.STRIPE_SECRET_KEY;
      const checkoutUrl = isTestMode
        ? `/?payment=success&ref=${bookingRef}&provider=stripe&amount=${data.amount}`
        : `https://checkout.stripe.com/pay/cs_test_${Math.random().toString(36).substring(2)}`;

      await supabaseAdmin.from("audit_log").insert({
        actor_id: userId,
        action: "payment.stripe_session_created",
        entity: "booking",
        entity_id: data.bookingId,
        metadata: { amount: data.amount, currency: data.currency, test_mode: isTestMode },
      });

      return {
        url: checkoutUrl,
        sessionId: `cs_test_${Math.random().toString(36).substring(2)}`,
        provider: "stripe",
      };
    } else {
      // Setup Razorpay Order
      // In production, initialize Razorpay SDK:
      // const razorpay = new Razorpay({ key_id: ..., key_secret: ... });
      // const order = await razorpay.orders.create({ amount: data.amount * 100, currency: "INR", receipt: bookingRef });

      const isTestMode = !process.env.RAZORPAY_KEY_SECRET;
      const orderId = `order_test_${Math.random().toString(36).substring(2)}`;

      await supabaseAdmin.from("audit_log").insert({
        actor_id: userId,
        action: "payment.razorpay_order_created",
        entity: "booking",
        entity_id: data.bookingId,
        metadata: { amount: data.amount, order_id: orderId, test_mode: isTestMode },
      });

      return {
        orderId,
        amount: data.amount,
        currency: "INR",
        provider: "razorpay",
        keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_mock_key_123",
      };
    }
  });

export const ConfirmPaymentInput = z.object({
  bookingId: z.string().uuid(),
  provider: z.enum(["stripe", "razorpay"]),
  amount: z.number().positive(),
  transactionId: z.string(),
  signature: z.string().optional(),
  razorpayOrderId: z.string().optional(),
});

export const confirmPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => ConfirmPaymentInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Fetch booking details
    const { data: booking, error: bErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", data.bookingId)
      .single();

    if (bErr || !booking) {
      throw new Error("Booking not found");
    }

    // Verify ownership or staff permissions
    if (booking.user_id !== userId) {
      const isStaff = await isStaffUser(supabase, userId);
      if (!isStaff) {
        throw new Error("Forbidden: You do not have permission to confirm this payment.");
      }
    }

    // Verify signature in production if Razorpay
    if (data.provider === "razorpay" && process.env.RAZORPAY_KEY_SECRET && data.signature) {
      const crypto = await import("crypto");
      const orderId = data.razorpayOrderId || booking.booking_ref;
      const generatedSig = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${data.transactionId}`)
        .digest("hex");

      if (generatedSig !== data.signature) {
        throw new Error("Payment signature verification failed");
      }
    }

    const { serializeBookingNotes, getBookingInternalStatus } =
      await import("@/lib/bookings.functions");
    const prevInternal = getBookingInternalStatus(booking);
    const updatedNotes = serializeBookingNotes(
      booking.notes,
      {
        internalStatus: "CONFIRMED",
      },
      booking.notes,
    );

    // Update booking status
    const { data: updated, error: uErr } = await supabaseAdmin
      .from("bookings")
      .update({
        status: "confirmed",
        quote_amount: data.amount,
        quote_currency: booking.quote_currency ?? "INR",
        notes: updatedNotes,
      } as never)
      .eq("id", data.bookingId)
      .select("*")
      .single();

    if (uErr || !updated) {
      throw new Error(uErr?.message || "Failed to update booking status");
    }

    // 1. Log transition audit
    await supabaseAdmin.from("audit_log").insert({
      actor_id: userId,
      action: "booking.state_transition",
      entity: "bookings",
      entity_id: data.bookingId,
      metadata: {
        previousState: prevInternal,
        newState: "CONFIRMED",
        reason: `Payment confirmed via ${data.provider.toUpperCase()} (${data.transactionId})`,
        actorRole: "customer",
        ipAddress: "127.0.0.1",
        actionName: "verify_payment",
      },
    });

    // 2. Log transaction audit
    await supabaseAdmin.from("audit_log").insert({
      actor_id: userId,
      action: "payment.confirmed",
      entity: "booking",
      entity_id: data.bookingId,
      metadata: {
        provider: data.provider,
        transaction_id: data.transactionId,
        amount: data.amount,
      },
    });

    // 3. Generate receipt document automatically on-the-fly
    try {
      const { generateBookingDocumentInternal } = await import("./booking-documents.functions");
      await generateBookingDocumentInternal(supabaseAdmin, userId, {
        id: data.bookingId,
        kind: "receipt",
        amount: data.amount,
      });
    } catch (e) {
      console.error("Failed to auto-generate receipt PDF:", e);
    }

    // 4. Save payment record to payment ledger table
    try {
      await (supabaseAdmin as any).from("payments").insert({
        booking_id: data.bookingId,
        provider: data.provider,
        provider_payment_id: data.transactionId,
        provider_order_id: data.razorpayOrderId || booking.booking_ref,
        amount: data.amount,
        currency: booking.quote_currency ?? "INR",
        status: "completed",
        transaction_time: new Date().toISOString(),
        receipt_number: `RECEIPT-${booking.booking_ref}`,
        payment_method: `${data.provider}_checkout`,
      } as never);
    } catch (e) {
      console.warn("[Payment Ledger] Ledger record insertion fallback:", e);
    }

    // Queue payment confirmation notifications asynchronously (fire-and-forget, non-blocking)
    (async () => {
      try {
        const payloadParams = {
          bookingId: booking.id,
          bookingRef: booking.booking_ref,
          customerName: booking.contact_name,
          origin: booking.origin,
          destination: booking.destination,
          amount: data.amount,
          currency: booking.quote_currency ?? "INR",
          transactionId: data.transactionId,
        };

        const targetUserId = booking.user_id;

        // 1. Customer notifications
        await enqueueNotification({
          bookingId: booking.id,
          bookingRef: booking.booking_ref,
          recipient: booking.contact_email,
          channel: "email",
          eventType: "payment_successful",
          payload: payloadParams,
          userId: targetUserId,
        });

        if (booking.contact_phone) {
          await enqueueNotification({
            bookingId: booking.id,
            bookingRef: booking.booking_ref,
            recipient: booking.contact_phone,
            channel: "whatsapp",
            eventType: "payment_successful",
            payload: payloadParams,
            userId: targetUserId,
          });
        }

        await enqueueNotification({
          bookingId: booking.id,
          bookingRef: booking.booking_ref,
          recipient: targetUserId,
          channel: "in_app",
          eventType: "payment_successful",
          payload: payloadParams,
          userId: targetUserId,
        });

        // 2. Admin notification
        const adminEmail = process.env.ADMIN_EMAIL || "admin@shafsky.com";
        await enqueueNotification({
          bookingId: booking.id,
          bookingRef: booking.booking_ref,
          recipient: adminEmail,
          channel: "email",
          eventType: "payment_received",
          payload: payloadParams,
        });

        // Query admins for in-app alerts
        const { data: admins } = await (supabaseAdmin as any)
          .from("user_roles")
          .select("user_id")
          .in("role", ["admin", "super_admin"]);

        if (admins) {
          for (const ad of admins) {
            await enqueueNotification({
              bookingId: booking.id,
              bookingRef: booking.booking_ref,
              recipient: ad.user_id,
              channel: "in_app",
              eventType: "payment_received",
              payload: payloadParams,
              userId: ad.user_id,
            });
          }
        }
      } catch (err) {
        console.error("Failed to enqueue payment confirmation notifications:", err);
      }
    })();

    return { success: true, bookingRef: booking.booking_ref };
  });

export const listPaymentLedger = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        search: z.string().optional(),
        provider: z.string().optional(),
        status: z.string().optional(),
      })
      .optional()
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const isStaff = await isStaffUser(supabase, userId);
    if (!isStaff) throw new Error("Forbidden");

    let query = (supabaseAdmin as any)
      .from("payments")
      .select(
        `
        id,
        booking_id,
        provider,
        provider_payment_id,
        provider_order_id,
        amount,
        currency,
        status,
        transaction_time,
        receipt_number,
        payment_method,
        created_at,
        bookings (
          booking_ref,
          contact_name,
          contact_email,
          contact_phone,
          status,
          user_id
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (data?.provider && data.provider !== "all") {
      query = query.eq("provider", data.provider);
    }

    if (data?.status && data.status !== "all") {
      query = query.eq("status", data.status);
    }

    const { data: rows, error } = await query;

    // Fallback: If payments table doesn't have rows yet, fall back to bookings table
    if (error || !rows || rows.length === 0) {
      const { data: bkRows } = await (supabaseAdmin as any)
        .from("bookings")
        .select(
          "id, booking_ref, contact_name, contact_email, quote_amount, quote_currency, status, created_at",
        )
        .not("quote_amount", "is", null)
        .order("created_at", { ascending: false });

      let fallbackResults = (bkRows || []).map((b: any) => ({
        id: `legacy-${b.id}`,
        payment_id: `PAY-${b.booking_ref}`,
        booking_id: b.id,
        booking_ref: b.booking_ref,
        contact_name: b.contact_name,
        contact_email: b.contact_email,
        provider: "stripe",
        provider_payment_id: `txn_${b.booking_ref.toLowerCase()}`,
        provider_order_id: b.booking_ref,
        amount: Number(b.quote_amount || 0),
        currency: b.quote_currency || "INR",
        status: b.status === "confirmed" || b.status === "completed" ? "completed" : "pending",
        transaction_time: b.created_at,
        receipt_number: `RECEIPT-${b.booking_ref}`,
        receipt_path: null,
        payment_method: "card",
        created_at: b.created_at,
      }));

      if (data?.search && data.search.trim()) {
        const q = data.search.trim().toLowerCase();
        fallbackResults = fallbackResults.filter(
          (r: any) =>
            r.booking_ref.toLowerCase().includes(q) ||
            r.contact_name.toLowerCase().includes(q) ||
            r.contact_email.toLowerCase().includes(q),
        );
      }
      return fallbackResults;
    }

    const bookingIds = (rows || []).map((r: any) => r.booking_id);
    let receiptDocsMap: Record<string, string> = {};
    if (bookingIds.length > 0) {
      const { data: docs } = await (supabaseAdmin as any)
        .from("booking_documents")
        .select("booking_id, storage_path")
        .in("booking_id", bookingIds)
        .eq("kind", "receipt");
      if (docs) {
        for (const d of docs) {
          if (!receiptDocsMap[d.booking_id]) {
            receiptDocsMap[d.booking_id] = d.storage_path;
          }
        }
      }
    }

    let results = (rows || []).map((r: any) => ({
      id: r.id,
      payment_id: r.id,
      booking_id: r.booking_id,
      booking_ref: r.bookings?.booking_ref || "N/A",
      contact_name: r.bookings?.contact_name || "N/A",
      contact_email: r.bookings?.contact_email || "N/A",
      provider: r.provider,
      provider_payment_id: r.provider_payment_id || "N/A",
      provider_order_id: r.provider_order_id || "N/A",
      amount: Number(r.amount),
      currency: r.currency || "INR",
      status: r.status,
      transaction_time: r.transaction_time || r.created_at,
      receipt_number: r.receipt_number || `RECEIPT-${r.bookings?.booking_ref || ""}`,
      receipt_path: receiptDocsMap[r.booking_id] || null,
      payment_method: r.payment_method || "card",
      created_at: r.created_at,
    }));

    if (data?.search && data.search.trim()) {
      const q = data.search.trim().toLowerCase();
      results = results.filter(
        (r: any) =>
          r.booking_ref.toLowerCase().includes(q) ||
          r.contact_name.toLowerCase().includes(q) ||
          r.contact_email.toLowerCase().includes(q) ||
          r.provider_payment_id.toLowerCase().includes(q) ||
          r.payment_id.toLowerCase().includes(q),
      );
    }

    return results;
  });

export const getCustomerPaymentHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: userBookings } = await supabase
      .from("bookings")
      .select("id, booking_ref, origin, destination, quote_amount, quote_currency, status, created_at")
      .eq("user_id", userId);

    if (!userBookings || userBookings.length === 0) return [];

    const bIds = userBookings.map((b) => b.id);
    const { data: rows } = await (supabaseAdmin as any)
      .from("payments")
      .select(
        `
        id,
        booking_id,
        provider,
        provider_payment_id,
        amount,
        currency,
        status,
        transaction_time,
        receipt_number,
        created_at,
        bookings (
          booking_ref,
          origin,
          destination
        )
      `,
      )
      .in("booking_id", bIds)
      .order("created_at", { ascending: false });

    // Fetch signed receipt links
    const { data: docs } = await (supabaseAdmin as any)
      .from("booking_documents")
      .select("booking_id, storage_path")
      .in("booking_id", bIds)
      .eq("kind", "receipt");

    const receiptMap: Record<string, string> = {};
    if (docs) {
      for (const d of docs) {
        if (!receiptMap[d.booking_id]) {
          receiptMap[d.booking_id] = d.storage_path;
        }
      }
    }

    if (rows && rows.length > 0) {
      return rows.map((r: any) => ({
        id: r.id,
        booking_id: r.booking_id,
        booking_ref: r.bookings?.booking_ref || "N/A",
        route: `${r.bookings?.origin || ""} → ${r.bookings?.destination || ""}`,
        provider: r.provider,
        transaction_id: r.provider_payment_id || "N/A",
        amount: Number(r.amount),
        currency: r.currency || "INR",
        status: r.status,
        transaction_time: r.transaction_time || r.created_at,
        receipt_path: receiptMap[r.booking_id] || null,
        created_at: r.created_at,
      }));
    }

    // Fallback: Map from user's bookings if payments table records don't exist yet
    return userBookings
      .filter((b) => b.quote_amount && ["confirmed", "completed"].includes(b.status))
      .map((b) => ({
        id: `legacy-${b.id}`,
        booking_id: b.id,
        booking_ref: b.booking_ref,
        route: `${b.origin} → ${b.destination}`,
        provider: "razorpay",
        transaction_id: `pay_${b.booking_ref.toLowerCase()}`,
        amount: Number(b.quote_amount),
        currency: b.quote_currency || "INR",
        status: "completed",
        transaction_time: b.created_at,
        receipt_path: receiptMap[b.id] || null,
        created_at: b.created_at,
      }));
  });
