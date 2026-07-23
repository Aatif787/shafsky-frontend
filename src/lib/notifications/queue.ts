/**
 * Background Notification Queue Client - Server Only
 * Handles enqueuing, atomic pop, processing, retry backoffs, and logs.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { renderTemplate } from "./templates";
import { getActiveBrandingServer } from "../branding/branding.server";
import { sendEmail } from "./channels/email";
import { sendWhatsApp } from "./channels/whatsapp";
import { sendInApp } from "./channels/in-app";
import type { SupabaseClient } from "@supabase/supabase-js";
import { generateAllBookingPdfsInternal } from "@/lib/booking-documents.functions";

// Cast to SupabaseClient<Record<string, unknown>> to allow dynamic access to custom tables
const clientAdmin = supabaseAdmin as unknown as SupabaseClient;

async function getEmailAttachments(bookingId: string, eventType: string): Promise<any[]> {
  try {
    // 1. Ensure PDFs are generated and up-to-date
    await generateAllBookingPdfsInternal(clientAdmin, null, bookingId);

    // 2. Fetch the latest documents for this booking
    const { data: docs, error: fetchErr } = await clientAdmin
      .from("booking_documents")
      .select("storage_path, document_type, filename, version, kind")
      .eq("booking_id", bookingId)
      .order("version", { ascending: false });

    if (fetchErr || !docs || docs.length === 0) return [];

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
    const isCustomer = !eventType.startsWith("admin_") && !eventType.startsWith("new_") && !eventType.startsWith("superadmin_") && !eventType.startsWith("daily_");

    if (isCustomer) {
      if (eventType === "booking_created" || eventType === "booking_confirmed" || eventType === "booking_rescheduled") {
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
      if (eventType === "new_booking_received" || eventType === "admin_payment_received" || eventType === "admin_refund_requested" || eventType === "admin_booking_cancelled") {
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
            console.error(`[Queue Attach] Failed to download storage path ${doc.storage_path}:`, dlErr?.message);
          }
        } catch (dlException) {
          console.error(`[Queue Attach] Exception downloading storage path ${doc.storage_path}:`, dlException);
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
  userId?: string; // Optional user association for checking preferences
}

/**
 * Enqueue a notification to the background processing queue.
 * Does NOT block execution.
 */
export async function enqueueNotification(
  params: EnqueueParams,
): Promise<{ success: boolean; queueId?: string; error?: string }> {
  try {
    console.log(
      `[Queue] Enqueuing ${params.channel} job for event "${params.eventType}" to: ${params.recipient}`,
    );

    const { data, error } = await clientAdmin
      .from("notification_queue")
      .insert({
        booking_id: params.bookingId || null,
        booking_ref: params.bookingRef || null,
        recipient: params.recipient,
        channel: params.channel,
        event_type: params.eventType,
        payload: {
          ...params.payload,
          userId: params.userId || null,
        },
        status: "pending",
        run_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("[Queue] Failed to write enqueue job to database:", error.message);
      console.log(
        `[Queue] Falling back to direct synchronous dispatch for channel "${params.channel}"...`,
      );
      try {
        const branding = await getActiveBrandingServer();
        const rendered = renderTemplate(params.channel, params.eventType, params.payload, branding);

        let dispatchResult: { success: boolean; messageId?: string; error?: string } = {
          success: false,
        };

        if (params.channel === "email") {
          const attachments = params.bookingId ? await getEmailAttachments(params.bookingId, params.eventType) : [];
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
          } else {
            dispatchResult = {
              success: false,
              error: "No userId provided for In-App notification",
            };
          }
        }

        if (dispatchResult.success) {
          const isSimulated = (dispatchResult as { simulated?: boolean }).simulated === true;
          try {
            const { error: logInsertErr } = await clientAdmin.from("notification_logs").insert({
              booking_id: params.bookingId || null,
              booking_ref: params.bookingRef || null,
              recipient: params.recipient,
              channel: params.channel,
              template: params.eventType,
              subject: rendered.subject,
              body: rendered.body,
              status: isSimulated ? "simulated" : "sent",
            });
            if (logInsertErr) {
              console.error("[Queue Fallback] Failed to write log:", logInsertErr.message);
            }
          } catch (logErr: any) {
            console.error(
              "[Queue Fallback] Failed to write log exception:",
              logErr.message || logErr,
            );
          }

          return { success: true, error: `Fallback triggered successfully: ${error.message}` };
        } else {
          try {
            await clientAdmin.from("notification_logs").insert({
              booking_id: params.bookingId || null,
              booking_ref: params.bookingRef || null,
              recipient: params.recipient,
              channel: params.channel,
              template: params.eventType,
              subject: rendered.subject,
              body: rendered.body,
              status: "failed",
              error_message: dispatchResult.error || "Direct dispatch failed",
            });
          } catch (logErr: any) {
            // Ignore log failure on dispatch error
          }

          return { success: false, error: `Fallback failed to send: ${dispatchResult.error}` };
        }
      } catch (fallbackErr: any) {
        console.error("[Queue Fallback] Exception during fallback dispatch:", fallbackErr);
        return {
          success: false,
          error: `Fallback exception: ${fallbackErr.message || String(fallbackErr)}`,
        };
      }
    }

    // Trigger queue processing asynchronously in the background (fire-and-forget)
    processQueue().catch((err) => {
      console.error("[Queue] Error triggered in background processing:", err);
    });

    return { success: true, queueId: data.id };
  } catch (err: any) {
    console.error("[Queue] Exception during enqueue:", err);
    return { success: false, error: err.message || String(err) };
  }
}

interface NotificationQueueRow {
  id: string;
  booking_id: string | null;
  booking_ref: string | null;
  recipient: string;
  channel: "email" | "whatsapp" | "in_app";
  event_type: string;
  payload: Record<string, unknown>;
  status: "pending" | "processing" | "completed" | "failed";
  retry_count: number;
  max_retries: number;
  last_error: string | null;
  run_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Process pending notification jobs in the queue.
 * Locks records atomically, dispatches messages, logs results, and handles retries.
 */
export async function processQueue(limit = 5): Promise<{ processed: number; succeeded: number }> {
  let processed = 0;
  let succeeded = 0;

  try {
    // 1. Atomically pop pending jobs using SELECT FOR UPDATE SKIP LOCKED via RPC
    const { data: jobs, error: popError } = await clientAdmin.rpc("pop_notification_queue", {
      limit_val: limit,
    });

    if (popError) {
      // If RPC is missing, fallback to standard update
      if (popError.message.includes("does not exist") || popError.message.includes("undefined")) {
        console.warn(
          "[Queue] RPC pop_notification_queue missing. Running fallback queue selector...",
        );
        return await fallbackProcessQueue(limit);
      }
      console.error("[Queue] Error popping jobs from queue:", popError.message);
      return { processed, succeeded };
    }

    if (!jobs || jobs.length === 0) {
      return { processed, succeeded };
    }

    console.log(`[Queue] Popped ${jobs.length} jobs to process.`);

    for (const job of jobs as NotificationQueueRow[]) {
      processed++;
      const payload = job.payload || {};
      const userId = payload.userId as string | undefined;

      try {
        let isEnabled = true;

        // 2. Check channel preferences if a user ID is linked
        if (userId) {
          const { data: pref } = await clientAdmin
            .from("notification_preferences")
            .select("email_enabled, whatsapp_enabled, in_app_enabled")
            .eq("user_id", userId)
            .maybeSingle();

          if (pref) {
            if (job.channel === "email" && !pref.email_enabled) isEnabled = false;
            if (job.channel === "whatsapp" && !pref.whatsapp_enabled) isEnabled = false;
            if (job.channel === "in_app" && !pref.in_app_enabled) isEnabled = false;
          }
        }

        if (!isEnabled) {
          console.log(`[Queue] Job ${job.id} bypassed. Recipient disabled this channel.`);

          // Log bypassed event
          await clientAdmin.from("notification_logs").insert({
            booking_id: job.booking_id,
            booking_ref: job.booking_ref,
            recipient: job.recipient,
            channel: job.channel,
            template: job.event_type,
            subject: "Bypassed",
            body: "Channel disabled by user preferences",
            status: "bypassed",
            error_message: "Bypassed: channel disabled in user preferences",
          });

          // Mark completed/bypassed in queue
          await clientAdmin
            .from("notification_queue")
            .update({
              status: "completed",
              updated_at: new Date().toISOString(),
            } as never)
            .eq("id", job.id);
          continue;
        }

        // 3. Render template
        const branding = await getActiveBrandingServer();
        const rendered = renderTemplate(job.channel, job.event_type, payload, branding);

        // 4. Dispatch based on channel
        let dispatchResult: { success: boolean; messageId?: string; error?: string } = {
          success: false,
        };

        if (job.channel === "email") {
          const attachments = job.booking_id ? await getEmailAttachments(job.booking_id, job.event_type) : [];
          dispatchResult = await sendEmail({
            recipient: job.recipient,
            subject: rendered.subject,
            html: rendered.html || "",
            text: rendered.body,
            attachments,
          });
        } else if (job.channel === "whatsapp") {
          dispatchResult = await sendWhatsApp({
            recipient: job.recipient,
            body: rendered.body,
          });
        } else if (job.channel === "in_app") {
          if (userId) {
            dispatchResult = await sendInApp(clientAdmin, {
              userId,
              kind: job.event_type,
              title: rendered.subject,
              body: rendered.body,
              link: job.event_type.startsWith("admin_") ? "/admin" : "/dashboard",
              entity: "booking",
              entityId: job.booking_id || undefined,
            });
          } else {
            dispatchResult = {
              success: false,
              error: "No userId provided for In-App notification",
            };
          }
        }

        if (dispatchResult.success) {
          succeeded++;
          console.log(`[Queue] Job ${job.id} sent successfully.`);

          const isSimulated = (dispatchResult as { simulated?: boolean }).simulated === true;

          // Write delivery log
          await clientAdmin.from("notification_logs").insert({
            booking_id: job.booking_id,
            booking_ref: job.booking_ref,
            recipient: job.recipient,
            channel: job.channel,
            template: job.event_type,
            subject: rendered.subject,
            body: rendered.body,
            status: isSimulated ? "simulated" : "sent",
          });

          // Update status to completed
          await clientAdmin
            .from("notification_queue")
            .update({
              status: "completed",
              updated_at: new Date().toISOString(),
            } as never)
            .eq("id", job.id);
        } else {
          console.error(`[Queue] Job ${job.id} dispatch failed:`, dispatchResult.error);
          const retryCount = job.retry_count + 1;

          if (retryCount <= job.max_retries) {
            const runAt = new Date(Date.now() + retryCount * 2 * 60 * 1000).toISOString();
            await clientAdmin
              .from("notification_queue")
              .update({
                status: "pending",
                retry_count: retryCount,
                run_at: runAt,
                last_error: dispatchResult.error || "Unknown dispatch failure",
                updated_at: new Date().toISOString(),
              } as never)
              .eq("id", job.id);

            console.log(
              `[Queue] Job ${job.id} requeued for run at ${runAt} (retry ${retryCount}/${job.max_retries}).`,
            );
          } else {
            console.error(`[Queue] Job ${job.id} exhausted all retries. Marking failed.`);

            // Write failure delivery log
            await clientAdmin.from("notification_logs").insert({
              booking_id: job.booking_id,
              booking_ref: job.booking_ref,
              recipient: job.recipient,
              channel: job.channel,
              template: job.event_type,
              subject: rendered.subject,
              body: rendered.body,
              status: "failed",
              error_message: dispatchResult.error || "Max retries reached",
            });

            // Mark status failed in queue
            await clientAdmin
              .from("notification_queue")
              .update({
                status: "failed",
                last_error: dispatchResult.error || "Max retries reached",
                updated_at: new Date().toISOString(),
              } as never)
              .eq("id", job.id);
          }
        }
      } catch (jobErr: any) {
        console.error(`[Queue] Unexpected exception while processing job ${job.id}:`, jobErr);
        try {
          const retryCount = job.retry_count + 1;
          const errMsg = jobErr.message || String(jobErr);
          if (retryCount <= job.max_retries) {
            const runAt = new Date(Date.now() + retryCount * 2 * 60 * 1000).toISOString();
            await clientAdmin
              .from("notification_queue")
              .update({
                status: "pending",
                retry_count: retryCount,
                run_at: runAt,
                last_error: errMsg,
                updated_at: new Date().toISOString(),
              } as never)
              .eq("id", job.id);
          } else {
            await clientAdmin.from("notification_logs").insert({
              booking_id: job.booking_id,
              booking_ref: job.booking_ref,
              recipient: job.recipient,
              channel: job.channel,
              template: job.event_type,
              subject: "Failed",
              body: "Unexpected error: " + errMsg,
              status: "failed",
              error_message: errMsg,
            });

            await clientAdmin
              .from("notification_queue")
              .update({
                status: "failed",
                last_error: errMsg,
                updated_at: new Date().toISOString(),
              } as never)
              .eq("id", job.id);
          }
        } catch (updateErr) {
          console.error(`[Queue] Failed to update job status for failed job ${job.id}:`, updateErr);
        }
      }
    }
  } catch (err: any) {
    console.error("[Queue] Queue processor loop exception:", err);
  }

  return { processed, succeeded };
}

/**
 * Fallback queue processor using standard client select/update (no select for update).
 * Used only if database migration for pop_notification_queue RPC hasn't completed yet.
 */
async function fallbackProcessQueue(
  limit: number,
): Promise<{ processed: number; succeeded: number }> {
  let processed = 0;
  let succeeded = 0;

  try {
    // Select pending jobs
    const { data: jobs, error: fetchError } = await clientAdmin
      .from("notification_queue")
      .select("id")
      .eq("status", "pending")
      .lte("run_at", new Date().toISOString())
      .order("run_at", { ascending: true })
      .limit(limit);

    if (fetchError || !jobs || jobs.length === 0) return { processed, succeeded };

    // Update status to processing atomically only for pending jobs
    const jobIds = jobs.map((j: any) => j.id);
    const { data: updatedJobs, error: updateError } = await clientAdmin
      .from("notification_queue")
      .update({ status: "processing", updated_at: new Date().toISOString() } as never)
      .in("id", jobIds)
      .eq("status", "pending")
      .select();

    if (updateError || !updatedJobs || updatedJobs.length === 0) {
      return { processed, succeeded };
    }

    // Proceed to process normal loop
    for (const job of updatedJobs as NotificationQueueRow[]) {
      processed++;
      const payload = job.payload || {};
      const userId = payload.userId as string | undefined;

      try {
        let isEnabled = true;

        if (userId) {
          const { data: pref } = await clientAdmin
            .from("notification_preferences")
            .select("email_enabled, whatsapp_enabled, in_app_enabled")
            .eq("user_id", userId)
            .maybeSingle();

          if (pref) {
            if (job.channel === "email" && !pref.email_enabled) isEnabled = false;
            if (job.channel === "whatsapp" && !pref.whatsapp_enabled) isEnabled = false;
            if (job.channel === "in_app" && !pref.in_app_enabled) isEnabled = false;
          }
        }

        if (!isEnabled) {
          await clientAdmin.from("notification_logs").insert({
            booking_id: job.booking_id,
            booking_ref: job.booking_ref,
            recipient: job.recipient,
            channel: job.channel,
            template: job.event_type,
            subject: "Bypassed",
            body: "Channel disabled by user preferences",
            status: "bypassed",
            error_message: "Bypassed: channel disabled in preferences",
          });
          await clientAdmin
            .from("notification_queue")
            .update({
              status: "completed",
              updated_at: new Date().toISOString(),
            } as never)
            .eq("id", job.id);
          continue;
        }

        const branding = await getActiveBrandingServer();
        const rendered = renderTemplate(job.channel, job.event_type, payload, branding);
        let dispatchResult: { success: boolean; messageId?: string; error?: string } = {
          success: false,
        };

        if (job.channel === "email") {
          const attachments = job.booking_id ? await getEmailAttachments(job.booking_id, job.event_type) : [];
          dispatchResult = await sendEmail({
            recipient: job.recipient,
            subject: rendered.subject,
            html: rendered.html || "",
            text: rendered.body,
            attachments,
          });
        } else if (job.channel === "whatsapp") {
          dispatchResult = await sendWhatsApp({
            recipient: job.recipient,
            body: rendered.body,
          });
        } else if (job.channel === "in_app") {
          if (userId) {
            dispatchResult = await sendInApp(clientAdmin, {
              userId,
              kind: job.event_type,
              title: rendered.subject,
              body: rendered.body,
              link: job.event_type.startsWith("admin_") ? "/admin" : "/dashboard",
              entity: "booking",
              entityId: job.booking_id || undefined,
            });
          } else {
            dispatchResult = {
              success: false,
              error: "No userId provided for In-App notification",
            };
          }
        }

        if (dispatchResult.success) {
          succeeded++;
          const isSimulated = (dispatchResult as { simulated?: boolean }).simulated === true;
          await clientAdmin.from("notification_logs").insert({
            booking_id: job.booking_id,
            booking_ref: job.booking_ref,
            recipient: job.recipient,
            channel: job.channel,
            template: job.event_type,
            subject: rendered.subject,
            body: rendered.body,
            status: isSimulated ? "simulated" : "sent",
          });
          await clientAdmin
            .from("notification_queue")
            .update({
              status: "completed",
              updated_at: new Date().toISOString(),
            } as never)
            .eq("id", job.id);
        } else {
          const retryCount = job.retry_count + 1;
          if (retryCount <= job.max_retries) {
            const runAt = new Date(Date.now() + retryCount * 2 * 60 * 1000).toISOString();
            await clientAdmin
              .from("notification_queue")
              .update({
                status: "pending",
                retry_count: retryCount,
                run_at: runAt,
                last_error: dispatchResult.error || "Failure",
                updated_at: new Date().toISOString(),
              } as never)
              .eq("id", job.id);
          } else {
            await clientAdmin.from("notification_logs").insert({
              booking_id: job.booking_id,
              booking_ref: job.booking_ref,
              recipient: job.recipient,
              channel: job.channel,
              template: job.event_type,
              subject: rendered.subject,
              body: rendered.body,
              status: "failed",
              error_message: dispatchResult.error || "Max retries",
            });
            await clientAdmin
              .from("notification_queue")
              .update({
                status: "failed",
                last_error: dispatchResult.error || "Max retries",
                updated_at: new Date().toISOString(),
              } as never)
              .eq("id", job.id);
          }
        }
      } catch (jobErr: any) {
        console.error(
          `[Queue Fallback] Unexpected exception while processing job ${job.id}:`,
          jobErr,
        );
        try {
          const retryCount = job.retry_count + 1;
          const errMsg = jobErr.message || String(jobErr);
          if (retryCount <= job.max_retries) {
            const runAt = new Date(Date.now() + retryCount * 2 * 60 * 1000).toISOString();
            await clientAdmin
              .from("notification_queue")
              .update({
                status: "pending",
                retry_count: retryCount,
                run_at: runAt,
                last_error: errMsg,
                updated_at: new Date().toISOString(),
              } as never)
              .eq("id", job.id);
          } else {
            await clientAdmin.from("notification_logs").insert({
              booking_id: job.booking_id,
              booking_ref: job.booking_ref,
              recipient: job.recipient,
              channel: job.channel,
              template: job.event_type,
              subject: "Failed",
              body: "Unexpected error: " + errMsg,
              status: "failed",
              error_message: errMsg,
            });
            await clientAdmin
              .from("notification_queue")
              .update({
                status: "failed",
                last_error: errMsg,
                updated_at: new Date().toISOString(),
              } as never)
              .eq("id", job.id);
          }
        } catch (updateErr) {
          console.error(
            `[Queue Fallback] Failed to update job status for failed job ${job.id}:`,
            updateErr,
          );
        }
      }
    }
  } catch (err: any) {
    console.error("[Queue Fallback] Exception in loop:", err);
  }

  return { processed, succeeded };
}
