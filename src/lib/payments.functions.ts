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
  bookingId: z.string().optional(),
  bookingRef: z.string().optional(),
  provider: z.enum(["stripe", "razorpay"]).default("razorpay"),
  amount: z.number().positive().optional(),
  transactionId: z.string().optional(),
  signature: z.string().optional(),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
});

export const confirmPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => ConfirmPaymentInput.parse(d))
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    
    // Route to authoritative cryptographic verification
    const orderId = data.razorpayOrderId || data.transactionId;
    const paymentId = data.razorpayPaymentId || data.transactionId;
    const signature = data.razorpaySignature || data.signature;
    const bookingRef = data.bookingRef || data.bookingId;

    if (orderId && paymentId && signature) {
      return await apiPost<any>("/api/payments/verify", {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        booking_ref: bookingRef,
      }, token);
    }

    return await apiPost<any>("/api/payments/verify", data, token);
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
