/**
 * Resend Email Channel Connector - Server Only
 */
console.log("===== ENV DEBUG =====");
console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY);
console.log("EMAIL_FROM:", process.env.EMAIL_FROM);
console.log("EMAIL_REPLY_TO:", process.env.EMAIL_REPLY_TO);
console.log("=====================");
export interface EmailParams {
  recipient: string;
  subject: string;
  html: string;
  text: string;
  attachments?: {
    content: string; // Base64 encoded content
    filename: string;
  }[];
}

export async function sendEmail(
  params: EmailParams,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL;
  const replyTo = process.env.EMAIL_REPLY_TO;

  // Fail fast with clear logging if configuration is missing
  if (!apiKey) {
    const errorMsg =
      "[Email Channel] Critical Error: RESEND_API_KEY is not defined in the server environment.";
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }

  if (!fromEmail) {
    const errorMsg =
      "[Email Channel] Critical Error: Neither EMAIL_FROM nor RESEND_FROM_EMAIL is defined in the server environment.";
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }

  const toRecipient = params.recipient.trim();

  try {
    const { getActiveBrandingServer } = await import("@/lib/branding/branding.server");
    const branding = await getActiveBrandingServer();
    
    // Safety check: Use branding.booking_email if it shares the same domain as verified fromEmail
    let finalFrom = fromEmail;
    const brandingDomain = branding.booking_email?.split("@")[1];
    const envDomain = fromEmail?.split("@")[1];
    if (brandingDomain && envDomain && brandingDomain.toLowerCase() === envDomain.toLowerCase()) {
      finalFrom = branding.booking_email;
    }
    
    const fromName = branding.company_name;
    const replyToAddress = branding.reply_email || replyTo;

    console.log(`[Email Channel] Dispatching email to ${toRecipient} via Resend...`);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${finalFrom}>`,
        to: [toRecipient],
        subject: params.subject,
        html: params.html,
        text: params.text,
        reply_to: replyToAddress || undefined,
        attachments: params.attachments,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("[Email Channel] Resend API error:", data);
      return { success: false, error: data.message || `HTTP ${res.status}` };
    }

    console.log("[Email Channel] Email sent successfully. Message ID:", data.id);
    return { success: true, messageId: data.id };
  } catch (err: any) {
    console.error("[Email Channel] Network or unexpected exception:", err);
    return { success: false, error: err.message || String(err) };
  }
}
