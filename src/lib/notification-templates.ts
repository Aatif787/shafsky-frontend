import { CONTACT } from "./constants";

export interface BookingEmailPayload {
  booking_ref: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  origin: string;
  destination: string;
  depart_date: string;
  pax_adults: number;
  pax_children?: number;
  pax_infants?: number;
  verification_type?: "AUTO_VERIFIED" | "MANUAL_ENTRY";
  notes?: string | null;
  services?: string[];
  service_type?: string | null;
  quote_amount?: number | null;
  reject_reason?: string | null;
}

export interface SettingsPayload {
  businessName: string;
  supportEmail: string;
  contactPhone: string;
  operatingHours: string;
}

/**
 * Extracts Flight Number and Airline from the booking snapshot notes
 */
export function parseFlightInfo(notes: string | null | undefined) {
  let flightNum = "—";
  let airline = "—";

  if (!notes) return { flightNum, airline };

  const flightNumMatch = notes.match(/- Flight Number:\s*([^\n\r]+)/i);
  if (flightNumMatch) {
    flightNum = flightNumMatch[1].trim();
  }

  const airlineMatch = notes.match(/- Airline Name:\s*([^\n\r]+)/i);
  if (airlineMatch) {
    airline = airlineMatch[1].trim();
  }

  return { flightNum, airline };
}

/**
 * Centralized email generator for all system notification templates
 */
export function generateBookingEmailHtml(
  type:
    | "received"
    | "confirmed"
    | "rejected"
    | "quoted"
    | "completed"
    | "cancelled"
    | "fallback"
    | "admin_alert",
  booking: BookingEmailPayload,
  settings: SettingsPayload,
): string {
  const { flightNum, airline } = parseFlightInfo(booking.notes);

  const parts = (booking.depart_date || "").split(" ");
  const dateStr = parts[0] || booking.depart_date || "—";
  const timeStr = parts[1] || "—";

  const totalPax =
    (booking.pax_adults || 0) + (booking.pax_children || 0) + (booking.pax_infants || 0);
  const statusText =
    booking.verification_type === "MANUAL_ENTRY" ? "Manual Fallback" : "Auto Verified";

  const isCharter = booking.service_type === "Private Charter";
  const serviceLabel = isCharter ? "Private Jet Charter" : "Airport Concierge Services";

  const servicesHtml =
    booking.services && booking.services.length > 0
      ? booking.services.map((s) => `• ${s}`).join("<br />")
      : "No add-on services selected";

  // Wording and colors based on status type
  let heading = "Operational Update";
  let subHeading = "Your booking request status has changed.";
  let statusThemeColor = "#0d5a6e"; // Teal
  let statusDetailsHtml = "";

  switch (type) {
    case "received":
      heading = isCharter ? "Charter Consultation Received" : "Concierge Request Received";
      subHeading = `Thank you for choosing ${settings.businessName}. We have successfully logged your ${serviceLabel.toLowerCase()} request. Our teams are verifying your flight coordinates.`;
      break;
    case "confirmed":
      heading = isCharter ? "Charter Flight Confirmed" : "Airport Concierge Confirmed";
      subHeading = `We are pleased to inform you that your journey has been officially confirmed. All coordinators, tarmac chauffeurs, and lounge permissions are pre-staged.`;
      statusThemeColor = "#10b981"; // Green
      break;
    case "rejected":
      heading = "Request Update";
      subHeading = `We regret to inform you that we are unable to accommodate your request at this time due to operational constraints.`;
      statusThemeColor = "#ef4444"; // Red
      if (booking.reject_reason) {
        statusDetailsHtml = `
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 12px; margin: 15px 0; font-size: 13px;">
            <strong>Reason:</strong> ${booking.reject_reason}
          </div>
        `;
      }
      break;
    case "quoted":
      heading = "Itinerary Quotation Ready";
      subHeading = `A customized quotation has been generated for your flight itinerary. Please review the details below.`;
      statusDetailsHtml = `
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 15px; margin: 15px 0; font-size: 14px; text-align: center;">
          <strong>Quote Amount:</strong> INR ${Number(booking.quote_amount || 0).toLocaleString()}
        </div>
      `;
      break;
    case "completed":
      heading = "Thank You for Flying With Us";
      subHeading = `Your concierge journey has been marked as completed. We hope you had a seamless meet-and-assist airport experience.`;
      statusThemeColor = "#3b82f6"; // Blue
      break;
    case "cancelled":
      heading = "Booking Cancelled";
      subHeading = `This email confirms that your booking request reference ${booking.booking_ref} has been cancelled.`;
      statusThemeColor = "#6b7280"; // Gray
      break;
    case "fallback":
      heading = "Manual Verification Initiated";
      subHeading = `Automatic coordinate validation failed or was bypassed. Our operations center has initiated manual flight clearance verification.`;
      statusThemeColor = "#f59e0b"; // Orange
      statusDetailsHtml = `
        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; color: #92400e; padding: 12px; margin: 15px 0; font-size: 12px;">
          <strong>Security Notice:</strong> Manual fallback review has been requested for this flight validation.
        </div>
      `;
      break;
    case "admin_alert":
      heading = "Internal Operational Alert";
      subHeading = `Attention Ops Desk: A new transaction require immediate attention. Details are attached below.`;
      statusThemeColor = "#7c3aed"; // Purple
      break;
  }

  return `
    <div style="font-family: sans-serif; max-width: 600px; color: #0d2a36; line-height: 1.6; border: 1px solid rgba(13,42,54,0.06); padding: 25px; background-color: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid ${statusThemeColor}; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: ${statusThemeColor}; margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 0.05em;">${heading}</h2>
      </div>
      
      <p style="font-size: 14px; color: #374151;">Dear ${booking.contact_name || "Client"},</p>
      <p style="font-size: 14px; color: #374151; margin-bottom: 20px;">${subHeading}</p>

      ${statusDetailsHtml}

      <div style="background-color: #faf5ea; padding: 20px; border: 1px solid rgba(13,42,54,0.06); margin: 20px 0;">
        <h4 style="margin-top: 0; color: #0d5a6e; letter-spacing: 0.1em; text-transform: uppercase; font-size: 12px; border-bottom: 1px solid rgba(13,42,54,0.1); padding-bottom: 6px;">Itinerary Summary</h4>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid rgba(0,0,0,0.04);">
            <td style="padding: 8px 0; font-weight: bold; width: 45%;">Booking Reference:</td>
            <td style="padding: 8px 0; font-family: monospace; font-weight: bold; color: ${statusThemeColor};">${booking.booking_ref}</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(0,0,0,0.04);">
            <td style="padding: 8px 0; font-weight: bold;">Flight Number:</td>
            <td style="padding: 8px 0;">${flightNum}</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(0,0,0,0.04);">
            <td style="padding: 8px 0; font-weight: bold;">Airline Carrier:</td>
            <td style="padding: 8px 0;">${airline}</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(0,0,0,0.04);">
            <td style="padding: 8px 0; font-weight: bold;">Sector Route:</td>
            <td style="padding: 8px 0;">${booking.origin} to ${booking.destination}</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(0,0,0,0.04);">
            <td style="padding: 8px 0; font-weight: bold;">Departure Date:</td>
            <td style="padding: 8px 0;">${dateStr}</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(0,0,0,0.04);">
            <td style="padding: 8px 0; font-weight: bold;">Departure Time:</td>
            <td style="padding: 8px 0;">${timeStr}</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(0,0,0,0.04);">
            <td style="padding: 8px 0; font-weight: bold;">Passenger Count:</td>
            <td style="padding: 8px 0;">${totalPax} traveler(s)</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(0,0,0,0.04);">
            <td style="padding: 8px 0; font-weight: bold;">Verification Type:</td>
            <td style="padding: 8px 0; font-weight: bold;">${statusText}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0 0 0; font-weight: bold; vertical-align: top;">Selected Services:</td>
            <td style="padding: 10px 0 0 0; line-height: 1.4; color: #4b5563;">${servicesHtml}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 13px; color: #4b5563;">
        If you have any questions or require custom concierge upgrades, please reach our 24/7 Ops Desk.
      </p>
      
      <p style="font-size: 13px; color: #4b5563; margin-top: 25px;">
        Thank you,<br />
        <strong>${settings.businessName} Ops Desk</strong>
      </p>

      <hr style="border: 0; border-top: 1px solid rgba(13,42,54,0.08); margin: 25px 0;" />
      
      <table style="width: 100%; font-size: 11px; color: #6b7280; line-height: 1.4;">
        <tr>
          <td style="font-weight: bold; padding-bottom: 4px;">${settings.businessName}</td>
        </tr>
        <tr>
          <td>Support Email: ${settings.supportEmail} | Contact Phone: ${settings.contactPhone}</td>
        </tr>
        <tr>
          <td>Operating Hours: ${settings.operatingHours}</td>
        </tr>
      </table>
    </div>
  `;
}

/**
 * Generates centralized confirmation WhatsApp / SMS message body
 */
export function generateWhatsAppText(
  type: "received" | "confirmed" | "rejected" | "quoted" | "completed" | "cancelled" | "fallback",
  booking: BookingEmailPayload,
  settings: SettingsPayload,
): string {
  const { flightNum } = parseFlightInfo(booking.notes);
  const totalPax =
    (booking.pax_adults || 0) + (booking.pax_children || 0) + (booking.pax_infants || 0);

  const isCharter = booking.service_type === "Private Charter";
  const serviceLabel = isCharter ? "Private Charter" : "Airport Concierge Service";

  const header = `*${settings.businessName}*`;
  let body = "";

  switch (type) {
    case "received":
      body = `We have received your ${serviceLabel} request.\n\n*Reference:* ${booking.booking_ref}\n*Flight:* ${flightNum}\n*Route:* ${booking.origin} to ${booking.destination}\n*Date/Time:* ${booking.depart_date}\n*Travelers:* ${totalPax} Pax\n\nOur team is currently reviewing your flight details.`;
      break;
    case "confirmed":
      body = `Your ${serviceLabel} booking *${booking.booking_ref}* has been confirmed!\n\nAll meet-and-assist coordinators, tarmac chauffeurs, and lounge accesses are being pre-staged.`;
      break;
    case "rejected":
      body = `Notice: We regret that we are unable to accommodate your ${serviceLabel} request *${booking.booking_ref}* at this time.\n\nReason: ${booking.reject_reason || "Administrative limitations"}`;
      break;
    case "quoted":
      body = `A quote is ready for your ${serviceLabel} request *${booking.booking_ref}*.\n\n*Amount:* INR ${Number(booking.quote_amount || 0).toLocaleString()}\n\nPlease log in to approve your itinerary.`;
      break;
    case "completed":
      body = `Thank you for traveling with us! Your ${serviceLabel} journey *${booking.booking_ref}* has been completed successfully.\n\nWe look forward to serving you on your next trip.`;
      break;
    case "cancelled":
      body = `This message confirms that your ${serviceLabel} booking *${booking.booking_ref}* has been cancelled.`;
      break;
    case "fallback":
      body = `Notice: Automatic flight validation failed for *${booking.booking_ref}*.\n\nAn administrator has initiated manual clearance coordinates check. We will notify you shortly.`;
      break;
  }

  return `${header}\n\n${body}\n\nSupport Phone: ${settings.contactPhone}\nEmail: ${settings.supportEmail}`;
}

/**
 * Generates admin notification alerts text
 */
export function generateAdminNotificationText(booking: BookingEmailPayload): string {
  return `New Airport Services Request received: Ref ${booking.booking_ref} (${booking.origin} to ${booking.destination}) for ${booking.contact_name}. Verification status: ${booking.verification_type || "AUTO_VERIFIED"}.`;
}
