import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { apiGet, apiPost, getTokenFromRequest } from "@/lib/FastApiClient";

const ContactInput = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(4000),
  // honeypot — must be empty
  website: z.string().max(0).optional().or(z.literal("")),
});

export const submitContact = createServerFn({ method: "POST" })
  .validator((data: unknown) => ContactInput.parse(data))
  .handler(async ({ data }) => {
    if (data.website && data.website.length > 0) {
      return { ok: true, id: null as string | null };
    }

    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      message: data.message,
    };

    const row = await apiPost<any>("/api/contact", payload);

    // Dispatch notifications asynchronously in the background (non-blocking)
    (async () => {
      // 1. Customer Email acknowledgement
      try {
        const { sendContactResponse } = await import("./messaging.server");
        await sendContactResponse({
          name: row.name || data.name,
          email: row.email || data.email,
          subject: row.subject || data.subject,
          message: row.message || data.message,
        });
      } catch (e) {
        console.error("Failed to send contact message email:", e);
      }

      // 2. Customer WhatsApp acknowledgement
      if (row.phone || data.phone) {
        try {
          const { sendContactAcknowledgement } = await import("./whatsapp.server");
          await sendContactAcknowledgement({
            name: row.name || data.name,
            phone: row.phone || data.phone,
            subject: row.subject || data.subject,
            message: row.message || data.message,
          });
        } catch (e) {
          console.error("Failed to send contact customer WhatsApp acknowledgement:", e);
        }
      }

      // 3. Admin WhatsApp notification
      try {
        const { sendContactAdminNotification } = await import("./whatsapp.server");
        await sendContactAdminNotification({
          name: row.name || data.name,
          email: row.email || data.email,
          phone: row.phone || data.phone,
          subject: row.subject || data.subject,
          message: row.message || data.message,
        });
      } catch (e) {
        console.error("Failed to send contact admin WhatsApp notification:", e);
      }
    })().catch((err) => {
      console.error("Error in contact notifications background handler:", err);
    });

    return { ok: true, id: row.id };
  });

export const listContactMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const token = getTokenFromRequest();
    const metrics = await apiGet<any>("/api/admin/dashboard-metrics", token);
    return metrics?.messages ?? [];
  });
