/**
 * Background Notification Queue Client - Server Only
 * Handles enqueuing, atomic pop, processing, retry backoffs, and logs via FastAPI backend.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { renderTemplate } from "./templates";
import { getActiveBrandingServer } from "../branding/branding.server";
import { sendEmail } from "./channels/email";
import { sendWhatsApp } from "./channels/whatsapp";
import { sendInApp } from "./channels/in-app";
import type { SupabaseClient } from "@supabase/supabase-js";
import { generateAllBookingPdfsInternal } from "@/lib/booking-documents.functions";
import { apiGet, apiPost, getTokenFromRequest } from "@/lib/FastApiClient";

// Cast to SupabaseClient<Record<string, unknown>> to allow dynamic access to custom tables / storage
const clientAdmin = supabaseAdmin as unknown as SupabaseClient;

async function getEmailAttachments(bookingId: string, eventType: string): Promise<any[]> {
  try {
    // 1. Ensure PDFs are generated and up-to-date
    await generateAllBookingPdfsInternal(clientAdmin, null, bookingId);

    // 2. Fetch the latest documents for this booking from FastAPI backend
    const token = getTokenFromRequest();
    const docs = await apiGet<any[]>(`/api/bookings/${bookingId}/documents`, token);

    if (!docs || docs.length === 0) return [];

    // Filter to keep only the latest version of each document type
    const latestDocsMap = new Map();
    for (const doc of docs) {
      const type = (doc as any).document_type || doc.kind;
      if (!latestDocsMap.has(type)) {
        latestDocsMap.set(type, doc);
      }
    }

    // Determine which types we need to attach based on event type
    const targetTypes: string[] = [];
    const isCustomer =
      !eventType.startsWith("admin_") &&
      !eventType.startsWith("new_") &&
      !eventType.startsWith("superadmin_") &&
      !eventType.startsWith("daily_");

    if (isCustomer) {
      if (
        eventType === "booking_created" ||
        eventType === "booking_confirmed" ||
        eventType === "booking_rescheduled"
      ) {
        targetTypes.push("booking_confirmation");
        targetTypes.push("customer_invoice");
        targetTypes.push("corporate_invoice");
        targetTypes.push("meet_assist_voucher");
        targetTypes.push("chauffeur_voucher");
        targetTypes.push("lounge_pass");
        targetTypes.push("service_voucher");
      } else if (eventType === "booking_cancelled") {
        targetTypes.push("cancellation_confirmation");
        targetTypes.push("refund_receipt");
      } else if (eventType === "payment_successful") {
        targetTypes.push("payment_receipt");
      } else if (eventType === "refund_processed") {
        targetTypes.push("refund_receipt");
      }
    } else {
      // Admin events
      if (
        eventType === "new_booking_received" ||
        eventType === "admin_payment_received" ||
        eventType === "admin_refund_requested" ||
        eventType === "admin_booking_cancelled"
      ) {
        targetTypes.push("booking_summary");
        targetTypes.push("internal_ops_sheet");
      }
    }

    const attachments: any[] = [];

    for (const type of targetTypes) {
      const doc = latestDocsMap.get(type);
      if (doc) {
        try {
          const { data: fileData, error: dlErr } = await clientAdmin.storage
            .from("booking-docs")
            .download(doc.storage_path);

          if (!dlErr && fileData) {
            const buffer = Buffer.from(await fileData.arrayBuffer());
            attachments.push({
              content: buffer.toString("base64"),
              filename: (doc as any).filename || `${type}.pdf`,
            });
          } else {
            console.error(
              `[Queue Attach] Failed to download storage path ${doc.storage_path}:`,
              dlErr?.message,
            );
          }
        } catch (dlException) {
          console.error(
            `[Queue Attach] Exception downloading storage path ${doc.storage_path}:`,
            dlException,
          );
        }
      }
    }

    return attachments;
  } catch (err) {
    console.error("[Queue Attach] Error compiling email attachments:", err);
    return [];
  }
}

export interface EnqueueParams {
  bookingId?: string;
  bookingRef?: string;
  recipient: string;
  channel: "email" | "whatsapp" | "in_app";
  eventType: string;
  payload: Record<string, unknown>;
  userId?: string;
}

/**
 * Enqueue a notification to the background processing queue via FastAPI backend.
 * Does NOT block execution.
 */
export async function enqueueNotification(
  params: EnqueueParams,
): Promise<{ success: boolean; queueId?: string; error?: string }> {
  try {
    console.log(
      `[Queue] Enqueuing ${params.channel} job for event "${params.eventType}" to: ${params.recipient}`,
    );

    const token = getTokenFromRequest();
    const res = await apiPost<{ id?: string; success: boolean }>(
      "/api/notifications/enqueue",
      params,
      token,
    );

    // Also attempt direct synchronous dispatch for maximum reliability
    try {
      const branding = await getActiveBrandingServer();
      const rendered = renderTemplate(params.channel, params.eventType, params.payload, branding);

      let dispatchResult: { success: boolean; messageId?: string; error?: string } = {
        success: false,
      };

      if (params.channel === "email") {
        const attachments = params.bookingId
          ? await getEmailAttachments(params.bookingId, params.eventType)
          : [];
        dispatchResult = await sendEmail({
          recipient: params.recipient,
          subject: rendered.subject,
          html: rendered.html || "",
          text: rendered.body,
          attachments,
        });
      } else if (params.channel === "whatsapp") {
        dispatchResult = await sendWhatsApp({
          recipient: params.recipient,
          body: rendered.body,
        });
      } else if (params.channel === "in_app") {
        if (params.userId) {
          dispatchResult = await sendInApp(clientAdmin, {
            userId: params.userId,
            kind: params.eventType,
            title: rendered.subject,
            body: rendered.body,
            link: params.eventType.startsWith("admin_") ? "/admin" : "/dashboard",
            entity: "booking",
            entityId: params.bookingId || undefined,
          });
        }
      }

      if (dispatchResult.success) {
        const isSimulated = (dispatchResult as { simulated?: boolean }).simulated === true;
        await apiPost(
          "/api/notifications/log",
          {
            booking_id: params.bookingId || null,
            booking_ref: params.bookingRef || null,
            recipient: params.recipient,
            channel: params.channel,
            template: params.eventType,
            subject: rendered.subject,
            body: rendered.body,
            status: isSimulated ? "simulated" : "sent",
          },
          token,
        );
      }
    } catch (fallbackErr: any) {
      console.warn("[Queue Direct Dispatch] Non-blocking warning:", fallbackErr.message);
    }

    return { success: true, queueId: res.id };
  } catch (err: any) {
    console.error("[Queue] Exception during enqueue:", err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Process pending notification jobs.
 */
export async function processQueue(_limit = 5): Promise<{ processed: number; succeeded: number }> {
  // Processing is managed automatically by FastAPI backend background tasks
  return { processed: 0, succeeded: 0 };
}
