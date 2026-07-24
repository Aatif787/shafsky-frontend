import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { enqueueNotification } from "@/lib/notifications/queue";
import { apiPost, getTokenFromRequest } from "@/lib/FastApiClient";

export const CreateCheckoutInput = z.object({
  bookingId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default("INR"),
  provider: z.enum(["stripe", "razorpay"]),
});

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => CreateCheckoutInput.parse(d))
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    return await apiPost("/api/payments/checkout", data, token);
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
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const result = await apiPost<any>("/api/payments/confirm", data, token);

    // Queue payment confirmation notifications asynchronously (fire-and-forget, non-blocking)
    (async () => {
      try {
        const payloadParams = {
          bookingId: data.bookingId,
          amount: data.amount,
          transactionId: data.transactionId,
        };

        const adminEmail = process.env.ADMIN_EMAIL || "admin@shafsky.com";
        await enqueueNotification({
          bookingId: data.bookingId,
          recipient: adminEmail,
          channel: "email",
          eventType: "payment_received",
          payload: payloadParams,
        });
      } catch (err) {
        console.error("Failed to enqueue payment confirmation notifications:", err);
      }
    })();

    return result;
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
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    return await apiPost<any[]>("/api/payments/ledger", data || {}, token);
  });

export const getCustomerPaymentHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const token = getTokenFromRequest();
    return await apiPost<any[]>("/api/payments/customer-history", { userId: context.userId }, token);
  });
