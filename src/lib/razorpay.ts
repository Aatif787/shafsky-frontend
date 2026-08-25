/**
 * Official Razorpay Standard Web Checkout Integration for Shafsky Aviation.
 * Provides client-side script loader, order creation, checkout modal launcher,
 * and server-side payment signature verification.
 */

import { ApiClient } from "./ApiClient";
import { toRazorpayContact } from "../components/booking/validation/sharedValidation";

export interface RazorpayPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

export interface RazorpayCheckoutOptions {
  amount: number; // in paise (e.g. 50000 = ₹500)
  currency?: string;
  name?: string;
  description?: string;
  order_id?: string;
  receipt?: string;
  prefill?: RazorpayPrefill;
  themeColor?: string;
  onSuccess?: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void | Promise<void>;
  onFailure?: (error: any) => void;
  onDismiss?: () => void;
}

/**
 * Loads the official Razorpay Standard Checkout SDK script asynchronously.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Calls backend to create a Razorpay order.
 * @param amount Amount in paise (minimum 100 paise)
 * @param currency Currency code (default: "INR")
 * @param receipt Optional receipt ID
 */
export async function createRazorpayOrder(
  amount: number,
  currency = "INR",
  receipt?: string,
  notes?: Record<string, any>
): Promise<{ order_id: string; amount: number; currency: string; key_id?: string }> {
  const res = await ApiClient.fetchWithAuth("/api/create-order", {
    method: "POST",
    body: JSON.stringify({
      amount,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.detail || errorData?.error || "Failed to create Razorpay order.");
  }

  return await res.json();
}

/**
 * Calls backend to verify the Razorpay HMAC SHA256 payment signature.
 */
export async function verifyRazorpayPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  booking_ref?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const res = await ApiClient.fetchWithAuth("/api/verify-payment", {
    method: "POST",
    body: JSON.stringify(data),
  });

  const responseData = await res.json().catch(() => ({}));
  if (!res.ok || !responseData.success) {
    throw new Error(responseData?.detail || responseData?.error || "Invalid Razorpay payment signature.");
  }

  return responseData;
}

/**
 * Launches the official Razorpay Standard Web Checkout Modal.
 */
export async function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<void> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error("Failed to load Razorpay Checkout SDK. Please check your internet connection.");
  }

  let orderId = options.order_id;
  let keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

  // If no order_id is provided, create one server-side first
  if (!orderId) {
    const orderData = await createRazorpayOrder(
      options.amount,
      options.currency || "INR",
      options.receipt
    );
    orderId = orderData.order_id;
    if (orderData.key_id) {
      keyId = orderData.key_id;
    }
  }

  if (!keyId) {
    keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "";
  }

  const contact = toRazorpayContact(options.prefill?.contact || "");

  return new Promise((resolve, reject) => {
    const rzpOptions = {
      key: keyId,
      amount: options.amount,
      currency: options.currency || "INR",
      name: options.name || "Shafsky Aviation Concierge",
      description: options.description || "Airport Concierge Services Payment",
      order_id: orderId,
      prefill: {
        ...(options.prefill?.name ? { name: options.prefill.name } : {}),
        ...(options.prefill?.email ? { email: options.prefill.email } : {}),
        ...(contact ? { contact } : {}),
      },
      remember_customer: false,
      retry: { enabled: false },
      theme: {
        color: options.themeColor || "#d97706",
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          // Verify signature on backend
          await verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id || orderId!,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            booking_ref: options.receipt,
          });

          if (options.onSuccess) {
            await options.onSuccess(response);
          }
          resolve();
        } catch (vErr) {
          if (options.onFailure) {
            options.onFailure(vErr);
          }
          reject(vErr);
        }
      },
      modal: {
        ondismiss: () => {
          if (options.onDismiss) {
            options.onDismiss();
          }
          resolve();
        },
      },
    };

    try {
      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.on("payment.failed", (failRes: any) => {
        if (options.onFailure) {
          options.onFailure(failRes?.error || failRes);
        }
      });
      rzp.open();
    } catch (err) {
      reject(err);
    }
  });
}
