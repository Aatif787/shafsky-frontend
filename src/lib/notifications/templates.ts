import { FALLBACK_BRANDING } from "../branding/branding.constants";
import type { BrandingSettings } from "../branding/branding.types";

let currentBranding: BrandingSettings = FALLBACK_BRANDING;

export interface NotificationPayload {
  bookingId?: string;
  bookingRef?: string;
  customerName?: string;
  origin?: string;
  destination?: string;
  departDate?: string;
  amount?: number;
  reason?: string;
  errorMessage?: string;
  date?: string;
  details?: Record<string, any>;
}

export interface RenderedTemplate {
  subject: string;
  body: string;
  html?: string;
}

// Helper to wrap content in a responsive, premium HTML email layout
function wrapHtmlLayout(title: string, bodyContent: string): string {
  const companyName = currentBranding.company_name;
  const logoUrl = currentBranding.logo_url;
  
  const nameParts = companyName.split(" ");
  const firstPart = nameParts[0]?.toUpperCase() || "SHAFSKY";
  const restPart = nameParts.slice(1).join(" ")?.toUpperCase() || "AVIATION";

  // Resolve relative logo URL to absolute URL
  let resolvedLogoUrl = logoUrl;
  if (logoUrl) {
    if (!logoUrl.startsWith("http") && !logoUrl.startsWith("data:")) {
      // Remove leading slash if present
      const cleanPath = logoUrl.startsWith("/") ? logoUrl.slice(1) : logoUrl;
      resolvedLogoUrl = `https://shafskyaviation.com/${cleanPath}`;
    }
  }

  // Render logo image if present, fallback to styled text crest
  const logoHtml = resolvedLogoUrl
    ? `<img src="${resolvedLogoUrl}" alt="${companyName}" style="max-height: 48px; max-width: 180px; display: inline-block; vertical-align: middle;">`
    : `<h1>${firstPart}</h1><p>${restPart.split("").join(" ")}</p>`;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Outfit', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            color: #1e293b;
            -webkit-font-smoothing: antialiased;
          }
          .wrapper {
            background-color: #f8fafc;
            width: 100%;
            padding: 40px 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
          }
          .header {
            background-color: #06090f;
            padding: 35px 40px;
            text-align: center;
            border-bottom: 3px solid #0d5a6e;
          }
          .header h1 {
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 4px;
            margin: 0;
          }
          .header p {
            color: #5fb5ad;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 5px;
            margin: 6px 0 0 0;
          }
          .content {
            padding: 40px;
            line-height: 1.7;
          }
          .content h2 {
            font-size: 22px;
            font-weight: 600;
            color: #06090f;
            margin-top: 0;
            margin-bottom: 20px;
            border-left: 4px solid #0d5a6e;
            padding-left: 12px;
          }
          .content p {
            font-size: 15px;
            color: #475569;
            margin-bottom: 20px;
          }
          .grid-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            background-color: #f8fafc;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          .grid-table td {
            padding: 14px 16px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
          }
          .grid-table tr:last-child td {
            border-bottom: none;
          }
          .grid-table td.label {
            font-weight: 600;
            color: #475569;
            width: 35%;
          }
          .grid-table td.value {
            color: #0f172a;
            font-weight: 500;
          }
          .btn-container {
            text-align: center;
            margin: 35px 0 15px 0;
          }
          .btn {
            background-color: #0d5a6e;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 35px;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2px;
            border-radius: 8px;
            display: inline-block;
            box-shadow: 0 4px 6px -1px rgba(13, 90, 110, 0.2);
            transition: all 0.2s ease;
          }
          .support-info {
            margin-top: 30px;
            padding-top: 25px;
            border-top: 1px dashed #e2e8f0;
            font-size: 13px;
            color: #64748b;
          }
          .support-info strong {
            color: #475569;
          }
          .footer {
            background-color: #06090f;
            padding: 30px 40px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            line-height: 1.6;
          }
          .footer a {
            color: #5fb5ad;
            text-decoration: none;
            font-weight: 500;
          }
          @media only screen and (max-width: 600px) {
            .wrapper {
              padding: 20px 0;
            }
            .container {
              border-radius: 0;
              border-left: none;
              border-right: none;
            }
            .header {
              padding: 25px 20px;
            }
            .content {
              padding: 30px 20px;
            }
            .footer {
              padding: 25px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              ${logoHtml}
            </div>
            <div class="content">
              ${bodyContent}
              <div class="support-info">
                <strong>Need Assistance?</strong> Our 24/7 Premium Concierge desk is available at <a href="mailto:${currentBranding.support_email}" style="color: #0d5a6e; text-decoration: none; font-weight: 500;">${currentBranding.support_email}</a> or via phone at <strong>${currentBranding.support_phone}</strong>.
              </div>
            </div>
            <div class="footer">
              © 2026 ${companyName}. | ${currentBranding.business_address}, ${currentBranding.city}, ${currentBranding.state}, ${currentBranding.country} - ${currentBranding.postal_code}.<br>
              You are receiving this operational email per your account settings.<br>
              Manage your <a href="${currentBranding.website}/dashboard?tab=settings">notification preferences</a> at any time.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Render templates based on channel and event type
export function renderTemplate(
  channel: "email" | "whatsapp" | "in_app",
  eventType: string,
  payload: NotificationPayload,
  branding: BrandingSettings = FALLBACK_BRANDING,
): RenderedTemplate {
  currentBranding = branding;
  const name = payload.customerName || "Valued Client";
  const ref = payload.bookingRef || "SH-PENDING";
  const route = `${payload.origin || "Origin"} → ${payload.destination || "Destination"}`;

  const renderRaw = (): RenderedTemplate => {
    switch (channel) {
    case "email": {
      switch (eventType) {
        // --- Customer Events ---
        case "booking_created": {
          const body = `
            <h2>Booking Request Logged</h2>
            <p>Dear ${name},</p>
            <p>Thank you for choosing Shafsky Aviation Services. Your private concierge and lounge sequence request has been logged under reference <strong>${ref}</strong>.</p>
            <p>Our operations dispatch center is currently reviewing your flight profile. An operational quote and confirmation details will be provided shortly.</p>
            <table class="grid-table">
              <tr><td class="label">Passenger Name</td><td class="value">${name}</td></tr>
              <tr><td class="label">Reference</td><td class="value">${ref}</td></tr>
              <tr><td class="label">Route</td><td class="value">${route}</td></tr>
              <tr><td class="label">Depart Date</td><td class="value">${payload.departDate || "N/A"}</td></tr>
            </table>
            <div class="btn-container">
              <a href="https://shafsky.com/dashboard" class="btn">View Flight Status</a>
            </div>
          `;
          return {
            subject: `Shafsky Aviation Services — Booking Request logged: ${ref}`,
            body: body.replace(/<[^>]*>/g, ""), // text fallback
            html: wrapHtmlLayout("Booking Request logged", body),
          };
        }
        case "booking_confirmed": {
          const body = `
            <h2>Your Journey is Confirmed</h2>
            <p>Dear ${name},</p>
            <p>We are pleased to inform you that your concierge sequence under reference <strong>${ref}</strong> has been fully confirmed by operations.</p>
            <table class="grid-table">
              <tr><td class="label">Passenger Name</td><td class="value">${name}</td></tr>
              <tr><td class="label">Reference</td><td class="value">${ref}</td></tr>
              <tr><td class="label">Route</td><td class="value">${route}</td></tr>
              <tr><td class="label">Confirmed Price</td><td class="value">₹${payload.amount?.toLocaleString() || "N/A"}</td></tr>
            </table>
            <div class="btn-container">
              <a href="https://shafsky.com/dashboard" class="btn">Access Lounge Credentials</a>
            </div>
          `;
          return {
            subject: `Shafsky Aviation Services — Booking Confirmed: ${ref}`,
            body: body.replace(/<[^>]*>/g, ""),
            html: wrapHtmlLayout("Booking Confirmed", body),
          };
        }
        case "booking_rejected": {
          const body = `
            <h2>Booking Request Unsuccessful</h2>
            <p>Dear ${name},</p>
            <p>We regret to inform you that your request under reference <strong>${ref}</strong> could not be accommodated due to operational slot limitations.</p>
            <p><strong>Reason:</strong> ${payload.reason || "Lounge slot unavailability."}</p>
            <p>If you have already paid, a full refund has been initiated to your original payment method.</p>
            <table class="grid-table">
              <tr><td class="label">Passenger Name</td><td class="value">${name}</td></tr>
              <tr><td class="label">Reference</td><td class="value">${ref}</td></tr>
              <tr><td class="label">Status</td><td class="value">Rejected</td></tr>
            </table>
          `;
          return {
            subject: `Shafsky Aviation Services — Booking Rejected: ${ref}`,
            body: body.replace(/<[^>]*>/g, ""),
            html: wrapHtmlLayout("Booking Request Unsuccessful", body),
          };
        }
        case "booking_cancelled": {
          const body = `
            <h2>Booking Cancelled</h2>
            <p>Dear ${name},</p>
            <p>Your booking with reference <strong>${ref}</strong> has been cancelled.</p>
            ${payload.reason ? `<p><strong>Reason:</strong> ${payload.reason}</p>` : ""}
            <p>If applicable, refund transactions will process to your card in 3-5 business days.</p>
            <table class="grid-table">
              <tr><td class="label">Passenger Name</td><td class="value">${name}</td></tr>
              <tr><td class="label">Reference</td><td class="value">${ref}</td></tr>
              <tr><td class="label">Status</td><td class="value">Cancelled</td></tr>
            </table>
          `;
          return {
            subject: `Shafsky Aviation Services — Booking Cancelled: ${ref}`,
            body: body.replace(/<[^>]*>/g, ""),
            html: wrapHtmlLayout("Booking Cancelled", body),
          };
        }
        case "booking_rescheduled": {
          const body = `
            <h2>Flight Rescheduled</h2>
            <p>Dear ${name},</p>
            <p>Your concierge sequence with reference <strong>${ref}</strong> has been rescheduled to a new departure date.</p>
            <table class="grid-table">
              <tr><td class="label">Passenger Name</td><td class="value">${name}</td></tr>
              <tr><td class="label">Reference</td><td class="value">${ref}</td></tr>
              <tr><td class="label">New Depart Date</td><td class="value">${payload.departDate || "N/A"}</td></tr>
            </table>
          `;
          return {
            subject: `Shafsky Aviation Services — Booking Rescheduled: ${ref}`,
            body: body.replace(/<[^>]*>/g, ""),
            html: wrapHtmlLayout("Booking Rescheduled", body),
          };
        }
        case "payment_successful": {
          const body = `
            <h2>Payment Successful</h2>
            <p>Dear ${name},</p>
            <p>We have successfully processed your payment of <strong>₹${payload.amount?.toLocaleString() || "0"}</strong> for booking <strong>${ref}</strong>.</p>
            <p>Your invoice receipt has been compiled and is now downloadable from your secure locker.</p>
            <table class="grid-table">
              <tr><td class="label">Customer Name</td><td class="value">${name}</td></tr>
              <tr><td class="label">Reference</td><td class="value">${ref}</td></tr>
              <tr><td class="label">Amount Paid</td><td class="value">₹${payload.amount?.toLocaleString() || "0"}</td></tr>
            </table>
          `;
          return {
            subject: `Shafsky Aviation Services — Payment Receipt: ${ref}`,
            body: body.replace(/<[^>]*>/g, ""),
            html: wrapHtmlLayout("Payment Successful", body),
          };
        }
        case "payment_failed": {
          const body = `
            <h2>Payment Action Required</h2>
            <p>Dear ${name},</p>
            <p>The card payment attempt of <strong>₹${payload.amount?.toLocaleString() || "0"}</strong> for booking <strong>${ref}</strong> was declined.</p>
            <p><strong>Decline message:</strong> ${payload.errorMessage || "Insufficient funds or security block."}</p>
            <p>Please update your billing credentials on your dashboard to preserve your lounge sequence reservation.</p>
            <table class="grid-table">
              <tr><td class="label">Customer Name</td><td class="value">${name}</td></tr>
              <tr><td class="label">Reference</td><td class="value">${ref}</td></tr>
              <tr><td class="label">Failed Amount</td><td class="value">₹${payload.amount?.toLocaleString() || "0"}</td></tr>
              <tr><td class="label">Decline Reason</td><td class="value">${payload.errorMessage || "Insufficient funds or security block."}</td></tr>
            </table>
          `;
          return {
            subject: `Shafsky Aviation Services — Payment Failed: ${ref}`,
            body: body.replace(/<[^>]*>/g, ""),
            html: wrapHtmlLayout("Payment Action Required", body),
          };
        }
        case "refund_processed": {
          const body = `
            <h2>Refund Processed Successfully</h2>
            <p>Dear ${name},</p>
            <p>A refund of <strong>₹${payload.amount?.toLocaleString() || "0"}</strong> has been credited to your payment method for booking <strong>${ref}</strong>.</p>
            <p>It may take up to 5 business days for this credit to post on your bank statement.</p>
            <table class="grid-table">
              <tr><td class="label">Customer Name</td><td class="value">${name}</td></tr>
              <tr><td class="label">Reference</td><td class="value">${ref}</td></tr>
              <tr><td class="label">Amount Refunded</td><td class="value">₹${payload.amount?.toLocaleString() || "0"}</td></tr>
            </table>
          `;
          return {
            subject: `Shafsky Aviation Services — Refund Confirmation: ${ref}`,
            body: body.replace(/<[^>]*>/g, ""),
            html: wrapHtmlLayout("Refund Processed", body),
          };
        }

        // --- Admin Events ---
        case "new_booking_received": {
          const body = `
            <h2>New Booking Operational Request</h2>
            <p>Operations Team,</p>
            <p>A new booking request has been logged and requires immediate review.</p>
            <table class="grid-table">
              <tr><td class="label">Reference</td><td class="value">${ref}</td></tr>
              <tr><td class="label">Customer</td><td class="value">${name}</td></tr>
              <tr><td class="label">Route</td><td class="value">${route}</td></tr>
            </table>
            <div class="btn-container">
              <a href="https://shafsky.com/admin/bookings" class="btn">Open Admin Console</a>
            </div>
          `;
          return {
            subject: `[ADMIN] Action Required — New Booking logged: ${ref}`,
            body: body.replace(/<[^>]*>/g, ""),
            html: wrapHtmlLayout("New Booking Request", body),
          };
        }
        case "admin_booking_cancelled": {
          const body = `
            <h2>Booking Cancelled by Passenger</h2>
            <p>Operations Team,</p>
            <p>The booking <strong>${ref}</strong> has been cancelled by passenger ${name}.</p>
            <table class="grid-table">
              <tr><td class="label">Reference</td><td class="value">${ref}</td></tr>
              <tr><td class="label">Customer</td><td class="value">${name}</td></tr>
            </table>
          `;
          return {
            subject: `[ADMIN] Warning — Booking Cancelled: ${ref}`,
            body: body.replace(/<[^>]*>/g, ""),
            html: wrapHtmlLayout("Booking Cancelled", body),
          };
        }
        case "admin_payment_received": {
          const body = `
            <h2>Payment Cleared for Booking</h2>
            <p>Billing Team,</p>
            <p>A payment of <strong>₹${payload.amount?.toLocaleString() || "0"}</strong> has been cleared for booking <strong>${ref}</strong>.</p>
            <table class="grid-table">
              <tr><td class="label">Reference</td><td class="value">${ref}</td></tr>
              <tr><td class="label">Amount</td><td class="value">₹${payload.amount?.toLocaleString() || "0"}</td></tr>
            </table>
          `;
          return {
            subject: `[ADMIN] Payment Received — Booking: ${ref}`,
            body: body.replace(/<[^>]*>/g, ""),
            html: wrapHtmlLayout("Payment Received", body),
          };
        }
        case "admin_refund_requested": {
          const body = `
            <h2>Refund Request Submitted</h2>
            <p>Refunds and Operations Team,</p>
            <p>A refund has been requested for booking <strong>${ref}</strong> by ${name}.</p>
            <table class="grid-table">
              <tr><td class="label">Reference</td><td class="value">${ref}</td></tr>
              <tr><td class="label">Customer</td><td class="value">${name}</td></tr>
            </table>
          `;
          return {
            subject: `[ADMIN] Refund Action Required — Booking: ${ref}`,
            body: body.replace(/<[^>]*>/g, ""),
            html: wrapHtmlLayout("Refund Requested", body),
          };
        }

        // --- Super Admin Events ---
        case "daily_business_summary": {
          const body = `
            <h2>Daily Operations Summary</h2>
            <p>Super Administrator Console,</p>
            <p>Here is your daily transaction and logistics summary for ${payload.date || new Date().toDateString()}:</p>
            <table class="grid-table">
              <tr><td class="label">Total New Signups</td><td class="value">${payload.details?.newSignups || 0}</td></tr>
              <tr><td class="label">Total Bookings Logged</td><td class="value">${payload.details?.newBookings || 0}</td></tr>
              <tr><td class="label">Active Lounges Closed</td><td class="value">${payload.details?.closedLounges || 0}</td></tr>
            </table>
          `;
          return {
            subject: `[SUPER ADMIN] Daily Business Summary — ${payload.date || "Today"}`,
            body: body.replace(/<[^>]*>/g, ""),
            html: wrapHtmlLayout("Daily Summary", body),
          };
        }
        case "superadmin_failed_payment": {
          const body = `
            <h2>Failed Gateway Transaction</h2>
            <p>System Security and Billing,</p>
            <p>A transaction of <strong>₹${payload.amount?.toLocaleString() || "0"}</strong> for booking <strong>${ref}</strong> failed due to a payment gateway drop.</p>
            <p><strong>Error Message:</strong> ${payload.errorMessage || "Unknown connection timeout."}</p>
            <table class="grid-table">
              <tr><td class="label">Reference</td><td class="value">${ref}</td></tr>
              <tr><td class="label">Amount</td><td class="value">₹${payload.amount?.toLocaleString() || "0"}</td></tr>
            </table>
          `;
          return {
            subject: `[ALERT] Failed Payments Alert — Booking: ${ref}`,
            body: body.replace(/<[^>]*>/g, ""),
            html: wrapHtmlLayout("Failed Payments Alert", body),
          };
        }
        case "superadmin_system_error": {
          const body = `
            <h2>Critical Infrastructure Failure</h2>
            <p>Operations Reliability Engineering,</p>
            <p>A system exception occurred during automated workflows.</p>
            <p><strong>Stack Trace Details:</strong> ${payload.errorMessage || "No trace available."}</p>
          `;
          return {
            subject: `[CRITICAL ERROR] Automation Pipeline Failed`,
            body: body.replace(/<[^>]*>/g, ""),
            html: wrapHtmlLayout("System Error Alert", body),
          };
        }
        case "superadmin_security_alert": {
          const body = `
            <h2>Security Breach Prevention Event</h2>
            <p>Security Audit Command,</p>
            <p>A blocked attempt to manipulate administrative resources was intercepted.</p>
            <p><strong>Actor Details:</strong> ${payload.reason || "Unauthorized API query key."}</p>
          `;
          return {
            subject: `[SECURITY ALERT] Blocked System Access Attempt`,
            body: body.replace(/<[^>]*>/g, ""),
            html: wrapHtmlLayout("Security Alert", body),
          };
        }
        default:
          return {
            subject: `Shafsky Aviation Services — Update: ${eventType}`,
            body: `Operational update concerning your aviation profile.`,
            html: wrapHtmlLayout(
              "Aviation Update",
              `<h2>Operational Update</h2><p>An update of type ${eventType} has occurred for booking ${ref}.</p>`,
            ),
          };
      }
    }
    case "whatsapp": {
      switch (eventType) {
        case "booking_created":
          return {
            subject: "WhatsApp",
            body: `✨ *Shafsky Aviation Services VIP Desk*\n\nDear ${name},\n\nYour bespoke journey request has been logged.\n\n*Reference:* ${ref}\n*Route:* ${route}\n\nOur operations team is currently drafting your concierge route sequence. A formal quote will follow shortly.\n\nThank you for choosing Shafsky Aviation Services.`,
          };
        case "booking_confirmed":
          return {
            subject: "WhatsApp",
            body: `✈️ *Shafsky Aviation Services Confirmation*\n\nDear ${name},\n\nWe are delighted to confirm your upcoming journey on *${payload.departDate || "your requested date"}*.\n\n*Reference:* ${ref}\n\nYour lounge credentials and service itinerary are now available. Please access the Shafsky portal to review your bespoke arrangements.`,
          };
        case "booking_rejected":
          return {
            subject: "WhatsApp",
            body: `🛎️ *Shafsky Aviation Services Update*\n\nDear ${name},\n\nWe regret that we are currently unable to accommodate your request (*${ref}*) due to operational slot limitations.\n\nOur concierge team remains at your disposal to assist with alternative dates or arrangements.`,
          };
        case "booking_cancelled":
          return {
            subject: "WhatsApp",
            body: `🛎️ *Shafsky Aviation Services Update*\n\nDear ${name},\n\nYour booking (*${ref}*) has been successfully cancelled per your instructions.\n\nAny applicable refunds will be processed to your original payment method promptly.`,
          };
        case "booking_rescheduled":
          return {
            subject: "WhatsApp",
            body: `📅 *Shafsky Aviation Services Schedule Update*\n\nDear ${name},\n\nYour itinerary (*${ref}*) has been updated.\n\n*New Departure Date:* ${payload.departDate || "TBA"}\n\nOur concierge team will ensure your seamless transit on the new date.`,
          };
        case "payment_successful":
          return {
            subject: "WhatsApp",
            body: `💎 *Shafsky Aviation Services Billing*\n\nDear ${name},\n\nPayment of *₹${payload.amount?.toLocaleString() || "0"}* for your booking (*${ref}*) has been successfully processed.\n\nYour detailed invoice is now available in your secure locker.`,
          };
        case "payment_failed":
          return {
            subject: "WhatsApp",
            body: `⚠️ *Shafsky Aviation Services Billing Alert*\n\nDear ${name},\n\nWe were unable to process the payment of *₹${payload.amount?.toLocaleString() || "0"}* for your booking (*${ref}*).\n\nPlease kindly update your payment credentials via the portal to secure your reservation.`,
          };
        case "refund_processed":
          return {
            subject: "WhatsApp",
            body: `💳 *Shafsky Aviation Services Billing*\n\nDear ${name},\n\nA refund of *₹${payload.amount?.toLocaleString() || "0"}* has been successfully initiated for booking *${ref}*.\n\nPlease allow standard banking times for the credit to reflect.`,
          };
        default:
          return {
            subject: "WhatsApp",
            body: `✨ *Shafsky Aviation Services Update*\n\nDear Client,\n\nThere is an operational update concerning your booking (*${ref}*).\n\nStatus: *${eventType}*`,
          };
      }
    }
    case "in_app": {
      switch (eventType) {
        case "booking_created":
          return {
            subject: "Booking Request Received",
            body: `Your request ${ref} is logged. Operations is currently drafting your concierge route sequence.`,
          };
        case "booking_confirmed":
          return {
            subject: "Booking Confirmed",
            body: `Your sequence ${ref} is confirmed. Download your lounge entry credentials.`,
          };
        case "booking_rejected":
          return {
            subject: "Booking Request Rejected",
            body: `We were unable to secure slots for request ${ref}. Refund initiated.`,
          };
        case "booking_cancelled":
          return {
            subject: "Booking Cancelled",
            body: `Your flight concierge sequence ${ref} has been cancelled.`,
          };
        case "booking_rescheduled":
          return {
            subject: "Journey Rescheduled",
            body: `Your route sequence ${ref} has been updated to depart on ${payload.departDate}.`,
          };
        case "payment_successful":
          return {
            subject: "Payment Cleared",
            body: `Transaction of ₹${payload.amount?.toLocaleString()} for booking ${ref} completed successfully.`,
          };
        case "payment_failed":
          return {
            subject: "Payment Failed",
            body: `Transaction decline for booking ${ref}. Click to update payment credentials.`,
          };
        case "refund_processed":
          return {
            subject: "Refund Processed",
            body: `Credit of ₹${payload.amount?.toLocaleString()} for booking ${ref} returned to card.`,
          };
        // Admins
        case "new_booking_received":
          return {
            subject: "Action Required: New Booking",
            body: `New request ${ref} requires coordinator assignment and review.`,
          };
        case "admin_booking_cancelled":
          return {
            subject: "Alert: Customer Cancellation",
            body: `Booking ${ref} has been cancelled by the customer.`,
          };
        case "admin_payment_received":
          return {
            subject: "Payment Confirmed",
            body: `Received ₹${payload.amount?.toLocaleString()} for booking ${ref}.`,
          };
        case "admin_refund_requested":
          return {
            subject: "Refund Claim Logged",
            body: `Refund of ₹${payload.amount?.toLocaleString()} requested for booking ${ref}.`,
          };
        default:
          return {
            subject: "System Update",
            body: `Operational event: ${eventType} concerning ${ref}.`,
          };
      }
    }
  }
};

  const rawResult = renderRaw();
  const company = branding.company_name;
  const web = branding.website;

  const replaceBranding = (text: string): string => {
    if (!text) return text;
    return text
      .replace(/Shafsky Aviation Services/g, company)
      .replace(/Shafsky/g, company)
      .replace(/https:\/\/shafsky\.com/g, web)
      .replace(/support@shafskyaviation.com/g, branding.support_email)
      .replace(/\+91 22 5555 0199/g, branding.support_phone)
      .replace(/bookings@shafskyaviation.com/g, branding.booking_email);
  };

  return {
    subject: replaceBranding(rawResult.subject),
    body: replaceBranding(rawResult.body),
    html: rawResult.html ? replaceBranding(rawResult.html!) : undefined
  };
}
