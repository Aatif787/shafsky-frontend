/**
 * Meta WhatsApp Cloud API Server Module
 *
 * Handles client validation, request timeouts, full jitter retry backoffs,
 * persistent idempotency checks (Supabase logs), masked credentials, and Supabase logging.
 */
import { createHash } from "crypto";
import { generateWhatsAppText, generateAdminNotificationText } from "./notification-templates";
import type { BookingEmailPayload } from "./notification-templates";
import { apiGet, apiPost } from "./FastApiClient";

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeoutMs?: number;
  maxRetries?: number;
}

/**
 * Normalizes phone numbers to digits-only with country code (e.g. +91 98765-43210 -> 919876543210)
 */
export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.trim().replace(/[\s\-()]/g, "");

  if (!/^\+?\d{10,15}$/.test(cleaned)) {
    throw new Error(
      `Invalid phone number format: "${phone}". Cleaned length must be between 10 and 15 digits including country code.`,
    );
  }

  // Remove leading plus for Meta API compatibility
  return cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;
}

/**
 * Masks phone number for security in logs
 */
function maskPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length <= 6) return cleaned;
  return `${cleaned.slice(0, 3)}******${cleaned.slice(-3)}`;
}

/**
 * Computes sha256 hash of a string
 */
function computeMessageHash(body: string): string {
  return createHash("sha256").update(body).digest("hex");
}

/**
 * Persistent idempotency check using FastAPI notification_logs endpoint
 */
async function isDuplicateRequest(
  recipient: string,
  body: string,
  templateName: string,
  bookingRef?: string | null,
): Promise<boolean> {
  try {
    const logs = await apiGet<any[]>(
      `/api/notifications/logs?recipient=${encodeURIComponent(recipient)}&channel=whatsapp&status=sent&since_seconds=60`,
    );

    if (!logs || !Array.isArray(logs) || logs.length === 0) return false;

    const currentHash = computeMessageHash(body);

    for (const log of logs) {
      if (!log.error_message) continue;
      try {
        const parsed = JSON.parse(log.error_message);
        if (parsed.message_hash === currentHash) {
          return true;
        }
        if (bookingRef && parsed.booking_ref === bookingRef && parsed.template === templateName) {
          return true;
        }
      } catch {
        // Not a JSON log or older format log, skip
      }
    }
  } catch (err) {
    console.error("[Meta WhatsApp Idempotency] Error querying persistent duplicate check:", err);
  }
  return false;
}

/**
 * Implements exponential backoff with full jitter delay calculation
 */
function getBackoffDelay(attempt: number, retryAfterSeconds?: number): number {
  if (retryAfterSeconds !== undefined && retryAfterSeconds > 0) {
    return retryAfterSeconds * 1000;
  }
  const base = 1000; // 1 second base delay
  const maxDelay = 8000; // 8 seconds maximum delay
  const exponential = Math.min(maxDelay, base * Math.pow(2, attempt - 1));
  const jitter = Math.random() * 200; // Add 0 to 200ms jitter
  return exponential + jitter;
}

/**
 * Fetch wrapper with timeout aborting and exponential backoff retry.
 * Only retries on transient errors: 429, 500, 502, 503, 504.
 */
async function fetchWithRetry(url: string, options: RequestOptions = {}): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? 5000;
  const maxRetries = 3;

  let attempt = 0;
  while (true) {
    attempt++;
    const controller = new AbortController();
    const abortTimeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      console.log(`[Meta WhatsApp API] [Request] Attempt ${attempt}/${maxRetries} to: ${url}`);

      const response = await fetch(url, {
        method: options.method || "POST",
        headers: options.headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(abortTimeout);

      // Check for retriable transient status codes
      if ([429, 500, 502, 503, 504].includes(response.status) && attempt < maxRetries) {
        const retryAfter = response.headers.get("Retry-After");
        const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : undefined;
        const delay = getBackoffDelay(attempt, retryAfterSeconds);

        console.warn(
          `[Meta WhatsApp API] [Warning] HTTP ${response.status} transient error. Retrying in ${Math.round(delay)}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (err: any) {
      clearTimeout(abortTimeout);
      const isAbort = err.name === "AbortError";
      const errMsg = isAbort ? `Request timeout after ${timeoutMs}ms` : err.message || String(err);

      console.error(
        `[Meta WhatsApp API] [Error] Attempt ${attempt} failed with exception: ${errMsg}`,
      );

      if (attempt < maxRetries) {
        const delay = getBackoffDelay(attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new Error(`Meta WhatsApp Request failed after ${maxRetries} attempts: ${errMsg}`);
    }
  }
}

/**
 * Resolves Meta Integration status from FastAPI backend.
 */
async function sendViaBackend(
  recipient: string,
  message?: string,
  templateName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const res = await apiPost<any>("/api/whatsapp/test-send", {
      recipient_phone: recipient,
      message: message,
      template_name: templateName,
    });

    if (res && res.success) {
      return { success: true, messageId: res.data?.message_id };
    }
    return { success: false, error: res?.error || "FastAPI backend WhatsApp send failed." };
  } catch (err: any) {
    console.error("[WhatsApp Frontend Client] Error delegating to FastAPI backend:", err.message || err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Logs details to Supabase public.notification_logs with structured JSON metadata inside error_message
 */
async function logToNotificationLogs({
  bookingRef,
  recipient,
  body,
  status,
  messageId,
  errorCode,
  errorMessage,
  httpStatus,
  rawMetaResponse,
  templateName,
}: {
  bookingRef?: string | null;
  recipient: string;
  body: string;
  status: "sent" | "failed" | "simulated" | "bypassed";
  messageId?: string;
  errorCode?: string;
  errorMessage?: string | null;
  httpStatus?: number;
  rawMetaResponse?: any;
  templateName: string;
}) {
  try {
    const { logNotification } = await import("./messaging.server");
    const subjectLabel = messageId
      ? `Meta ID: ${messageId}`
      : status === "simulated"
        ? "Simulated WhatsApp"
        : "WhatsApp Message";

    // Package metadata structured JSON without logging sensitive tokens/headers
    const structuredMeta = JSON.stringify({
      meta_message_id: messageId || null,
      recipient: maskPhoneNumber(recipient),
      booking_ref: bookingRef || null,
      channel: "whatsapp",
      status,
      delivery_status: status,
      error_code: errorCode || null,
      error_message: errorMessage || null,
      http_status: httpStatus || null,
      timestamp: new Date().toISOString(),
      message_hash: computeMessageHash(body),
      template: templateName,
      raw_meta_response: rawMetaResponse || null,
    });

    await logNotification({
      booking_ref: bookingRef || null,
      recipient,
      channel: "whatsapp",
      template: templateName,
      subject: subjectLabel,
      body,
      status:
        status === "bypassed"
          ? "bypassed"
          : status === "simulated"
            ? "simulated"
            : status === "failed"
              ? "failed"
              : "sent",
      error_message: structuredMeta,
    });
  } catch (err: any) {
    console.error("[Meta WhatsApp Logging] Failed to write notification logs:", err.message || err);
  }
}

/**
 * Sends a raw text message via FastAPI Backend WhatsApp Cloud API integration.
 */
export async function sendWhatsAppMessage(
  to: string,
  body: string,
  bookingRef?: string | null,
  templateName = "generic_whatsapp",
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!to || !body) {
      throw new Error("Recipient phone and message body are required.");
    }

    const recipient = normalizePhoneNumber(to);

    // Check for duplicate sends (idempotency)
    if (await isDuplicateRequest(recipient, body, templateName, bookingRef)) {
      console.warn(
        `[Meta WhatsApp Idempotency] Duplicate message to ${maskPhoneNumber(recipient)} blocked.`,
      );
      await logToNotificationLogs({
        bookingRef,
        recipient: to,
        body,
        status: "bypassed",
        errorMessage: "Idempotency Check: Duplicate message bypassed",
        templateName,
      });
      return { success: true, error: "Duplicate request bypassed" };
    }

    return await sendViaBackend(recipient, body, templateName);
  } catch (err: any) {
    console.error("[WhatsApp Client Error]:", err.message || err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Sends a WhatsApp Template message via FastAPI Backend integration.
 */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode = "en_US",
  components: any[] = [],
  bookingRef?: string | null,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const recipient = normalizePhoneNumber(to);

    const uniqueKey = `template:${templateName}:${JSON.stringify(components)}`;
    if (await isDuplicateRequest(recipient, uniqueKey, templateName, bookingRef)) {
      console.warn(
        `[Meta WhatsApp Idempotency] Duplicate template to ${maskPhoneNumber(recipient)} blocked.`,
      );
      return { success: true, error: "Duplicate request bypassed" };
    }

    return await sendViaBackend(recipient, undefined, templateName);
  } catch (err: any) {
    console.error("[Meta WhatsApp API] Template exception:", err.message || err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Renders and sends Booking Confirmation texts to customers.
 */
export async function sendBookingConfirmationMessage(
  booking: BookingEmailPayload,
  type: "received" | "confirmed" | "rejected" | "quoted" | "completed" | "cancelled" | "fallback",
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!booking.contact_phone) {
      return { success: false, error: "No contact phone number provided." };
    }

    const { loadAdminSettings } = await import("./messaging.server");
    const settings = await loadAdminSettings();
    const body = generateWhatsAppText(type, booking, settings);

    return await sendWhatsAppMessage(
      booking.contact_phone,
      body,
      booking.booking_ref,
      `booking_${type}_whatsapp`,
    );
  } catch (err: any) {
    console.error("[Meta WhatsApp API] sendBookingConfirmationMessage error:", err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Sends Admin Alert notifications.
 */
export async function sendAdminAlertMessage(
  booking: BookingEmailPayload,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { loadAdminSettings } = await import("./messaging.server");
    const settings = await loadAdminSettings();
    const body = generateAdminNotificationText(booking);

    return await sendWhatsAppMessage(
      settings.contactPhone,
      body,
      booking.booking_ref,
      "admin_alert_whatsapp",
    );
  } catch (err: any) {
    console.error("[Meta WhatsApp API] sendAdminAlertMessage error:", err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Sends Contact acknowledgement.
 */
export async function sendContactAcknowledgement(message: {
  name: string;
  phone: string;
  subject: string | null;
  message: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { loadAdminSettings } = await import("./messaging.server");
    const settings = await loadAdminSettings();

    const body = `*${settings.businessName}*:\n\nThank you for contacting us, *${message.name}*.\nYour message has been received by our airport concierge desk:\n\n"${message.message}"\n\nOur team will review your inquiry and respond shortly.\n\nSupport Phone: ${settings.contactPhone}\nEmail: ${settings.supportEmail}`;

    return await sendWhatsAppMessage(message.phone, body, null, "contact_acknowledgement_whatsapp");
  } catch (err: any) {
    console.error("[Meta WhatsApp API] sendContactAcknowledgement error:", err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Sends Admin Alert when contact message is received.
 */
export async function sendContactAdminNotification(message: {
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { loadAdminSettings } = await import("./messaging.server");
    const settings = await loadAdminSettings();

    const body = `*${settings.businessName} Admin Alert*:\n\nNew Contact Form Submission:\n*Name:* ${message.name}\n*Email:* ${message.email}\n*Phone:* ${message.phone || "Not provided"}\n*Subject:* ${message.subject || "General Inquiry"}\n\n*Message:*\n"${message.message}"`;

    return await sendWhatsAppMessage(
      settings.contactPhone,
      body,
      null,
      "contact_admin_alert_whatsapp",
    );
  } catch (err: any) {
    console.error("[Meta WhatsApp API] sendContactAdminNotification error:", err);
    return { success: false, error: err.message || String(err) };
  }
}
