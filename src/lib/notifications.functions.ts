import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { apiGet, apiPost, getTokenFromRequest } from "@/lib/FastApiClient";

export const listMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const token = getTokenFromRequest();
    const res = await apiGet<any>("/api/notifications", token);
    const data = res?.data || res;
    return Array.isArray(data) ? data : [];
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({ id: z.string().optional(), all: z.boolean().optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    if (data.id) {
      await apiPost(`/api/notifications/${data.id}/read`, {}, token);
    } else {
      await apiPost("/api/notifications/read-all", {}, token);
    }
    return { ok: true };
  });

export const sendPasswordResetNotificationEmail = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ email: z.string().email() }).parse(d))
  .handler(async ({ data }) => {
    const { sendEmail } = await import("@/lib/notifications/channels/email");
    const { getActiveBrandingServer } = await import("@/lib/branding/branding.server");
    const branding = await getActiveBrandingServer();

    // The reset link is built from trusted server-side configuration, never from
    // caller input: an attacker-supplied URL would turn this into a phishing relay.
    const rawSiteUrl =
      process.env.PUBLIC_FRONTEND_URL || process.env.VITE_SITE_URL || "https://shafskyaviation.com";
    const siteBase = String(rawSiteUrl).trim().replace(/\/+$/, "");
    const link = `${siteBase}/auth?mode=reset`;
    const subject = `Password Reset Request — ${branding.company_name}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #06090f; color: #ffffff; border-radius: 16px; border: 1px solid #0d5a6e;">
        <div style="text-align: center; border-bottom: 2px solid #0d5a6e; padding-bottom: 20px; margin-bottom: 24px;">
          <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin: 0;">${branding.company_name}</h1>
          <p style="color: #5ed3ff; font-size: 10px; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; margin: 4px 0 0 0;">Security & Authentication</p>
        </div>
        <h2 style="color: #5ed3ff; font-size: 18px; margin-top: 0;">Password Reset Directive</h2>
        <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">We received a password reset request for account: <strong>${data.email}</strong>.</p>
        <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">Click the button below to update your password securely:</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${link}" style="display: inline-block; padding: 12px 28px; background: #5ed3ff; color: #06090f; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; text-decoration: none; border-radius: 8px;">Reset My Password</a>
        </div>
        <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">If you did not request a password reset, please ignore this email or contact our security desk immediately.</p>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 32px 0 20px 0;" />
        <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">${branding.company_name} Security Desk</p>
      </div>
    `;

    const text = `Password Reset Request for ${data.email}\n\nPlease click the link to reset your password: ${link}\n\nIf you did not request this reset, please ignore this message.`;

    return await sendEmail({
      recipient: data.email,
      subject,
      html,
      text,
    });
  });
