import type { Database } from "@/integrations/supabase/types";
import {
  generateBookingEmailHtml,
  generateWhatsAppText,
  generateAdminNotificationText,
  type BookingEmailPayload,
} from "./notification-templates";
import { CONTACT, NOTIFICATION } from "./constants";

interface MailPayload {
  to: string;
  subject: string;
  html: string;
}

interface AdminSettings {
  businessName: string;
  supportEmail: string;
  contactPhone: string;
  operatingHours: string;
  enableWhatsAppOtp: boolean;
  enableEmailReceipts: boolean;
  twilioSmsSender: string;
  resendSenderEmail: string;
}

/**
 * Loads dynamic settings configuration from database
 */
export async function loadAdminSettings(): Promise<AdminSettings> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("system_settings")
      .select("value")
      .eq("key", "admin_settings")
      .maybeSingle();
    if (data && data.value) {
      return data.value as unknown as AdminSettings;
    }
  } catch (err) {
    // Fail silently, use defaults
  }
  return {
    businessName: "Shafsky Aviation Services Pvt. Ltd.",
    supportEmail: String(CONTACT.EMAIL),
    contactPhone: String(CONTACT.PHONE),
    operatingHours: "24/7 Ops Desk",
    enableWhatsAppOtp: true,
    enableEmailReceipts: true,
    twilioSmsSender: "+18778481232",
    resendSenderEmail: String(NOTIFICATION.FROM_EMAIL),
  };
}

/**
 * Resolves complete relational booking info from database prior to generating templates
 */
async function resolveBookingDetails(bookingRef: string): Promise<BookingEmailPayload | null> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select(
        `
        *,
        booking_services (
          service_name
        )
      `,
      )
      .eq("booking_ref", bookingRef)
      .maybeSingle();

    if (error || !booking) return null;

    const services = (booking.booking_services || [])
      .map((s: any) => s.service_name)
      .filter(Boolean);

    return {
      booking_ref: booking.booking_ref,
      contact_name: booking.contact_name,
      contact_email: booking.contact_email,
      contact_phone: booking.contact_phone || undefined,
      origin: booking.origin,
      destination: booking.destination,
      depart_date: booking.depart_date,
      pax_adults: booking.pax_adults || 1,
      pax_children: booking.pax_children || 0,
      pax_infants: booking.pax_infants || 0,
      verification_type: (booking.verification_type === "MANUAL_ENTRY"
        ? "MANUAL_ENTRY"
        : "AUTO_VERIFIED") as "AUTO_VERIFIED" | "MANUAL_ENTRY",
      notes: booking.notes,
      service_type: booking.service_type || "Airport Concierge",
      quote_amount: booking.quote_amount,
      reject_reason: (booking as any).reject_reason || null,
      services,
    };
  } catch (err) {
    return null;
  }
}

export async function logNotification({
  booking_ref,
  recipient,
  channel,
  template,
  subject,
  body,
  status,
  error_message,
}: {
  booking_ref?: string | null;
  recipient: string;
  channel: string;
  template: string;
  subject?: string | null;
  body: string;
  status: string;
  error_message?: string | null;
}) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let booking_id = null;
    if (booking_ref) {
      const { data } = await supabaseAdmin
        .from("bookings")
        .select("id")
        .eq("booking_ref", booking_ref)
        .maybeSingle();
      booking_id = data?.id || null;
    }
    await supabaseAdmin.from("notification_logs").insert({
      booking_id,
      booking_ref,
      recipient,
      channel,
      template,
      subject,
      body,
      status,
      error_message,
    } as never);
  } catch (e) {
    // Failed to log notification in database
  }
}

export async function sendEmail({
  to,
  subject,
  html,
  bookingRef,
  template = "generic",
}: MailPayload & { bookingRef?: string; template?: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  let status = "sent";
  let error_message = null;

  if (!apiKey) {
    status = "simulated";
  } else {
    try {
      const settings = await loadAdminSettings();
      const fromEmail =
        process.env.EMAIL_FROM ||
        process.env.RESEND_FROM_EMAIL ||
        settings.resendSenderEmail ||
        NOTIFICATION.FROM_EMAIL;
      const fromName = settings.businessName || NOTIFICATION.FROM_NAME;

      console.log(`[Messaging Server] Dispatching email to ${to} from <${fromEmail}>...`);

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [to],
          subject,
          html,
          reply_to: process.env.EMAIL_REPLY_TO || undefined,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        const errorMsg = `Resend API HTTP ${res.status}: ${resData.message || JSON.stringify(resData)}`;
        console.error(`[Messaging Server] Error sending email to ${to}:`, errorMsg);
        throw new Error(errorMsg);
      }
      console.log(`[Messaging Server] Email sent successfully to ${to}. Message ID:`, resData.id);
    } catch (error: any) {
      status = "failed";
      error_message = error?.message || String(error);
    }
  }

  logNotification({
    booking_ref: bookingRef || null,
    recipient: to,
    channel: "email",
    template,
    subject,
    body: html,
    status,
    error_message,
  }).catch(() => {});

  return { success: status !== "failed", simulated: status === "simulated", error: error_message };
}

export async function sendTwilioMessage({
  to,
  body,
  channel = "sms",
  bookingRef,
  template = "generic",
}: {
  to: string;
  body: string;
  channel?: "sms" | "whatsapp";
  bookingRef?: string;
  template?: string;
}) {
  if (channel === "whatsapp") {
    try {
      const { sendWhatsAppMessage } = await import("./whatsapp.server");
      return await sendWhatsAppMessage(to, body, bookingRef);
    } catch (err: any) {
      return { success: false, error: err.message || String(err) };
    }
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  let status = "sent";
  let error_message = null;

  if (!accountSid || !authToken) {
    status = "simulated";
  } else {
    try {
      const settings = await loadAdminSettings();
      const fromNumber = settings.twilioSmsSender;
      const toNumber = to;

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: toNumber,
            From: fromNumber,
            Body: body,
          }).toString(),
        },
      );
      if (!res.ok) {
        throw new Error(`Twilio API returned status ${res.status}`);
      }
    } catch (error) {
      status = "failed";
      error_message = String(error);
    }
  }

  logNotification({
    booking_ref: bookingRef || null,
    recipient: to,
    channel,
    template,
    subject: "SMS Alert",
    body,
    status,
    error_message,
  }).catch(() => {});

  return { success: status !== "failed", simulated: status === "simulated", error: error_message };
}

export async function sendWhatsAppMessage({
  to,
  body,
  bookingRef,
  template = "generic",
}: {
  to: string;
  body: string;
  bookingRef?: string | null;
  template?: string;
}) {
  try {
    const { sendWhatsAppMessage: sendMetaWhatsApp } = await import("./whatsapp.server");
    return await sendMetaWhatsApp(to, body, bookingRef, template);
  } catch (err: any) {
    console.error("[messaging.server] sendWhatsAppMessage exception:", err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Dispatches Booking Confirmation via Email and WhatsApp/SMS.
 * If manual verification fallback is required, dispatches corresponding notice.
 * Dispatches internal admin operational notice to ops email.
 */
export async function sendBookingConfirmation(payload: any) {
  const bookingRef = payload.booking_ref;
  const settings = await loadAdminSettings();

  // Load complete relational details
  const details = (await resolveBookingDetails(bookingRef)) || (payload as BookingEmailPayload);

  // 1. Email Client Confirmation
  const emailHtml = generateBookingEmailHtml("received", details, settings);
  await sendEmail({
    to: details.contact_email,
    subject: `Booking Request Received — ${bookingRef}`,
    html: emailHtml,
    bookingRef,
    template: "booking_confirmation",
  });

  // 2. WhatsApp Client Confirmation
  if (details.contact_phone) {
    const waText = generateWhatsAppText("received", details, settings);
    await sendWhatsAppMessage({
      to: details.contact_phone,
      body: waText,
      bookingRef,
      template: "booking_confirmation_whatsapp",
    });
  }

  // 3. Fallback Notice if MANUAL_ENTRY
  if (details.verification_type === "MANUAL_ENTRY") {
    const fallbackHtml = generateBookingEmailHtml("fallback", details, settings);
    await sendEmail({
      to: details.contact_email,
      subject: `Manual Flight Verification Initiated — ${bookingRef}`,
      html: fallbackHtml,
      bookingRef,
      template: "manual_fallback_notice",
    });

    if (details.contact_phone) {
      const fallbackWa = generateWhatsAppText("fallback", details, settings);
      await sendWhatsAppMessage({
        to: details.contact_phone,
        body: fallbackWa,
        bookingRef,
        template: "manual_fallback_whatsapp",
      });
    }
  }

  // 4. Internal Admin Notification Alert
  const adminHtml = generateBookingEmailHtml("admin_alert", details, settings);
  await sendEmail({
    to: settings.supportEmail,
    subject: `[ALERT] New Booking Request Received — Ref ${bookingRef}`,
    html: adminHtml,
    bookingRef,
    template: "internal_admin_alert",
  });
}

export async function sendPaymentReceipt(
  booking: any,
  amount: number,
  currency: string,
  transactionId: string,
) {
  const settings = await loadAdminSettings();
  const details =
    (await resolveBookingDetails(booking.booking_ref)) || (booking as BookingEmailPayload);

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; color: #0d2a36; line-height: 1.6;">
      <h2 style="color: #0d5a6e;">Payment Confirmed</h2>
      <p>Dear ${details.contact_name},</p>
      <p>We are pleased to confirm receipt of your payment of <strong>${currency} ${amount.toLocaleString()}</strong> for booking reference <strong>${details.booking_ref}</strong>.</p>
      
      <div style="background-color: #faf5ea; padding: 15px; border: 1px solid rgba(13,42,54,0.08); margin: 20px 0;">
        <h4 style="margin-top: 0; color: #0d5a6e;">TRANSACTION DETAILS</h4>
        <strong>Booking Reference:</strong> ${details.booking_ref}<br />
        <strong>Transaction ID:</strong> ${transactionId}<br />
        <strong>Amount Paid:</strong> ${currency} ${amount.toLocaleString()}<br />
        <strong>Sector Route:</strong> ${details.origin} to ${details.destination}<br />
      </div>

      <p>Your receipt is available for download in your Account Dashboard.</p>
      <p>Thank you for choosing ${settings.businessName}.</p>
      <hr style="border: 0; border-top: 1px solid rgba(13,42,54,0.08); margin-top: 30px;" />
      <p style="font-size: 11px; color: #5b6b75;">${settings.businessName} · ${settings.supportEmail} · ${settings.contactPhone}</p>
    </div>
  `;

  await sendEmail({
    to: details.contact_email,
    subject: `Payment Confirmed — Booking ${details.booking_ref}`,
    html,
    bookingRef: details.booking_ref,
    template: "payment_receipt",
  });

  if (details.contact_phone) {
    const waText = `*${settings.businessName}*:\n\nPayment Confirmed for booking *${details.booking_ref}*.\nAmount Paid: ${currency} ${amount.toLocaleString()}\n\nThank you for choosing us!`;
    await sendWhatsAppMessage({
      to: details.contact_phone,
      body: waText,
      bookingRef: details.booking_ref,
      template: "payment_receipt_whatsapp",
    });
  }
}

export async function sendCancellation(booking: any) {
  const settings = await loadAdminSettings();
  const details =
    (await resolveBookingDetails(booking.booking_ref)) || (booking as BookingEmailPayload);

  const emailHtml = generateBookingEmailHtml("cancelled", details, settings);
  await sendEmail({
    to: details.contact_email,
    subject: `Booking Cancelled — ${details.booking_ref}`,
    html: emailHtml,
    bookingRef: details.booking_ref,
    template: "booking_cancellation",
  });

  if (details.contact_phone) {
    const waText = generateWhatsAppText("cancelled", details, settings);
    await sendWhatsAppMessage({
      to: details.contact_phone,
      body: waText,
      bookingRef: details.booking_ref,
      template: "booking_cancellation_whatsapp",
    });
  }
}

export async function sendQuoteNotification(booking: any) {
  const settings = await loadAdminSettings();
  const details =
    (await resolveBookingDetails(booking.booking_ref)) || (booking as BookingEmailPayload);

  const emailHtml = generateBookingEmailHtml("quoted", details, settings);
  await sendEmail({
    to: details.contact_email,
    subject: `Quotation Ready — ${details.booking_ref}`,
    html: emailHtml,
    bookingRef: details.booking_ref,
    template: "booking_quote",
  });

  if (details.contact_phone) {
    const waText = generateWhatsAppText("quoted", details, settings);
    await sendWhatsAppMessage({
      to: details.contact_phone,
      body: waText,
      bookingRef: details.booking_ref,
      template: "booking_quote_whatsapp",
    });
  }
}

export async function sendConfirmedNotification(booking: any) {
  const settings = await loadAdminSettings();
  const details =
    (await resolveBookingDetails(booking.booking_ref)) || (booking as BookingEmailPayload);

  const emailHtml = generateBookingEmailHtml("confirmed", details, settings);
  await sendEmail({
    to: details.contact_email,
    subject: `Booking Confirmed — ${details.booking_ref}`,
    html: emailHtml,
    bookingRef: details.booking_ref,
    template: "booking_confirmed",
  });

  if (details.contact_phone) {
    const waText = generateWhatsAppText("confirmed", details, settings);
    await sendWhatsAppMessage({
      to: details.contact_phone,
      body: waText,
      bookingRef: details.booking_ref,
      template: "booking_confirmed_whatsapp",
    });
  }
}

export async function sendCompletedNotification(booking: any) {
  const settings = await loadAdminSettings();
  const details =
    (await resolveBookingDetails(booking.booking_ref)) || (booking as BookingEmailPayload);

  const emailHtml = generateBookingEmailHtml("completed", details, settings);
  await sendEmail({
    to: details.contact_email,
    subject: `Thank you for choosing Shafsky — ${details.booking_ref}`,
    html: emailHtml,
    bookingRef: details.booking_ref,
    template: "booking_completed",
  });

  if (details.contact_phone) {
    const waText = generateWhatsAppText("completed", details, settings);
    await sendWhatsAppMessage({
      to: details.contact_phone,
      body: waText,
      bookingRef: details.booking_ref,
      template: "booking_completed_whatsapp",
    });
  }
}

export async function sendBookingRejected(booking: any) {
  const settings = await loadAdminSettings();
  const details =
    (await resolveBookingDetails(booking.booking_ref)) || (booking as BookingEmailPayload);

  const emailHtml = generateBookingEmailHtml("rejected", details, settings);
  await sendEmail({
    to: details.contact_email,
    subject: `Booking Request Update — ${details.booking_ref}`,
    html: emailHtml,
    bookingRef: details.booking_ref,
    template: "booking_rejected",
  });

  if (details.contact_phone) {
    const waText = generateWhatsAppText("rejected", details, settings);
    await sendWhatsAppMessage({
      to: details.contact_phone,
      body: waText,
      bookingRef: details.booking_ref,
      template: "booking_rejected_whatsapp",
    });
  }
}

export async function sendContactResponse(message: {
  name: string;
  email: string;
  subject: string | null;
  message: string;
}) {
  const settings = await loadAdminSettings();
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; color: #0d2a36; line-height: 1.6;">
      <h2 style="color: #0d5a6e;">Thank you for contacting us</h2>
      <p>Dear ${message.name},</p>
      <p>Your message has been received by our airport concierge desk.</p>
      
      <div style="background-color: #faf5ea; padding: 15px; border: 1px solid rgba(13,42,54,0.08); margin: 20px 0; font-style: italic;">
        "${message.message}"
      </div>

      <p>A member of our airport services team will review your inquiry and respond shortly.</p>
      <hr style="border: 0; border-top: 1px solid rgba(13,42,54,0.08); margin-top: 30px;" />
      <p style="font-size: 11px; color: #5b6b75;">${settings.businessName} · ${settings.supportEmail} · ${settings.contactPhone}</p>
    </div>
  `;
  return sendEmail({
    to: message.email,
    subject: `Contact Request Logged — ${message.subject || "Airport Concierge"}`,
    html,
    template: "contact_response",
  });
}

export async function sendSmsOtp(phone: string, code: string, bookingRef?: string) {
  const settings = await loadAdminSettings();
  const bodyText = `Your ${settings.businessName} verification code is ${code}. Valid for 5 minutes.`;

  return sendTwilioMessage({
    to: phone,
    body: bodyText,
    channel: "sms",
    bookingRef,
    template: "otp",
  });
}
