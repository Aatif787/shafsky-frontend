import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertStaffUser } from "@/lib/permissions";
import { CONTACT } from "./constants";
import { apiGet, apiPost, apiDelete, getTokenFromRequest } from "@/lib/FastApiClient";

const GenInput = z.object({
  id: z.string().uuid(),
  kind: z.enum(["quotation", "invoice", "receipt"]),
  amount: z.number().nonnegative().optional(),
});

export async function buildPdf(opts: {
  kind: "quotation" | "invoice" | "receipt";
  ref: string;
  customer: string;
  email: string;
  phone: string;
  origin: string;
  destination: string;
  depart: string;
  ret: string | null;
  pax: string;
  amount: number;
  currency: string;
  service_type?: string | null;
}): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const teal = rgb(0.05, 0.35, 0.43);
  const ink = rgb(0.08, 0.1, 0.13);
  const muted = rgb(0.4, 0.45, 0.5);

  // Header bar
  page.drawRectangle({ x: 0, y: height - 96, width, height: 96, color: teal });
  page.drawText("SHAFSKY AVIATION SERVICES", {
    x: 40,
    y: height - 50,
    size: 18,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText("Private Aviation · Meet & Greet · Ground Services", {
    x: 40,
    y: height - 72,
    size: 9,
    font,
    color: rgb(0.85, 0.95, 0.95),
  });

  let headerTitle = "QUOTATION";
  if (opts.kind === "invoice") headerTitle = "TAX INVOICE";
  if (opts.kind === "receipt") headerTitle = "PAYMENT RECEIPT";

  page.drawText(headerTitle, {
    x: width - 180,
    y: height - 50,
    size: 18,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText(`Ref: ${opts.ref}`, {
    x: width - 180,
    y: height - 72,
    size: 9,
    font,
    color: rgb(0.85, 0.95, 0.95),
  });

  // Meta
  let y = height - 130;
  const issued = new Date().toISOString().slice(0, 10);
  page.drawText(`Issued: ${issued}`, { x: 40, y, size: 10, font, color: muted });
  page.drawText(`Document ID: ${opts.ref}-${opts.kind.toUpperCase()}`, {
    x: width - 240,
    y,
    size: 10,
    font,
    color: muted,
  });

  // Bill To
  y -= 36;
  page.drawText("BILL TO", { x: 40, y, size: 9, font: bold, color: muted });
  y -= 16;
  page.drawText(opts.customer, { x: 40, y, size: 12, font: bold, color: ink });
  y -= 14;
  page.drawText(opts.email, { x: 40, y, size: 10, font, color: ink });
  y -= 12;
  page.drawText(opts.phone, { x: 40, y, size: 10, font, color: ink });

  // Trip block
  y -= 32;
  page.drawRectangle({
    x: 40,
    y: y - 90,
    width: width - 80,
    height: 100,
    borderColor: rgb(0.85, 0.87, 0.9),
    borderWidth: 1,
  });
  page.drawText("TRIP DETAILS", { x: 52, y: y - 6, size: 9, font: bold, color: muted });
  page.drawText(`${opts.origin}  →  ${opts.destination}`, {
    x: 52,
    y: y - 28,
    size: 14,
    font: bold,
    color: ink,
  });
  page.drawText(`Depart: ${opts.depart}${opts.ret ? `   Return: ${opts.ret}` : ""}`, {
    x: 52,
    y: y - 48,
    size: 10,
    font,
    color: ink,
  });
  page.drawText(`Passengers: ${opts.pax}`, { x: 52, y: y - 64, size: 10, font, color: ink });

  // Line items
  y -= 120;
  page.drawText("DESCRIPTION", { x: 40, y, size: 9, font: bold, color: muted });
  page.drawText("AMOUNT", { x: width - 120, y, size: 9, font: bold, color: muted });
  y -= 10;
  page.drawLine({
    start: { x: 40, y },
    end: { x: width - 40, y },
    color: rgb(0.85, 0.87, 0.9),
    thickness: 1,
  });
  y -= 22;

  let descText = "Airport concierge services - Meet & Greet, fast-track, lounge and transfers";
  if (opts.service_type === "Private Charter") {
    descText = "Charter quotation — aircraft + crew + handling";
  }
  if (opts.kind === "invoice") {
    descText =
      opts.service_type === "Private Charter"
        ? "Charter services rendered"
        : "Concierge services rendered";
  }
  if (opts.kind === "receipt") {
    descText =
      opts.service_type === "Private Charter"
        ? "Payment received — thank you for flying with us"
        : "Payment received — thank you for choosing Shafsky Airport Services";
  }

  page.drawText(descText, {
    x: 40,
    y,
    size: 11,
    font,
    color: ink,
  });
  const amountText = `${opts.currency} ${Number(opts.amount || 0).toLocaleString("en-IN")}`;
  page.drawText(amountText, {
    x: width - 40 - bold.widthOfTextAtSize(amountText, 11),
    y,
    size: 11,
    font: bold,
    color: ink,
  });

  // Total
  y -= 40;
  page.drawLine({
    start: { x: 40, y: y + 14 },
    end: { x: width - 40, y: y + 14 },
    color: rgb(0.85, 0.87, 0.9),
    thickness: 1,
  });
  page.drawText("TOTAL", { x: 40, y, size: 12, font: bold, color: ink });
  page.drawText(amountText, {
    x: width - 40 - bold.widthOfTextAtSize(amountText, 14),
    y,
    size: 14,
    font: bold,
    color: teal,
  });

  // Footer
  page.drawRectangle({ x: 0, y: 0, width, height: 70, color: rgb(0.97, 0.98, 0.99) });
  page.drawText(`Shafsky Aviation Services Pvt Ltd  ·  ${CONTACT.PHONE}  ·  ${CONTACT.EMAIL}`, {
    x: 40,
    y: 42,
    size: 9,
    font,
    color: muted,
  });
  page.drawText(
    opts.kind === "quotation"
      ? opts.service_type === "Private Charter"
        ? "Quotation valid for 7 days. Subject to slot, parking, and clearance approvals."
        : "Quotation valid for 7 days. Subject to airport terminal approvals."
      : opts.service_type === "Private Charter"
        ? "Thank you for flying with Shafsky Aviation Services."
        : "Thank you for choosing Shafsky Airport Services.",
    { x: 40, y: 26, size: 9, font, color: muted },
  );

  return await pdf.save();
}

export async function generateBookingDocumentInternal(
  _supabase: unknown,
  userId: string,
  data: { id: string; kind: "quotation" | "invoice" | "receipt"; amount?: number },
) {
  const token = getTokenFromRequest();
  const b = await apiGet<any>(`/api/airport/bookings/${data.id}`, token);
  if (!b) throw new Error("Booking not found");

  const amount = data.amount ?? Number(b.quote_amount ?? b.price ?? 0);
  const bytes = await buildPdf({
    kind: data.kind,
    ref: b.booking_ref || b.booking_reference,
    customer: b.contact_name || b.passenger_name || "Guest Passenger",
    email: b.contact_email || b.passenger_email || "guest@shafsky.com",
    phone: b.contact_phone || b.passenger_phone || "",
    origin: b.origin || b.origin_code || "DEL",
    destination: b.destination || b.dest_code || "DXB",
    depart: b.depart_date || b.flight_date || "",
    ret: b.return_date || null,
    pax: `${b.pax_adults || b.num_passengers || 1} adult · ${b.pax_children || 0} child · ${b.pax_infants || 0} infant`,
    amount,
    currency: b.quote_currency ?? b.currency ?? "INR",
    service_type: b.service_type || b.service_package,
  });

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  try {
    await supabaseAdmin.storage.createBucket("booking-docs", { public: false });
  } catch (err) {}
  const path = `${b.id}/${data.kind}-${Date.now()}.pdf`;
  const { error: upErr } = await supabaseAdmin.storage
    .from("booking-docs")
    .upload(path, bytes, { contentType: "application/pdf", upsert: false });
  if (upErr) throw new Error(upErr.message);

  const row = await apiPost<any>(
    "/api/shared/attachments/register",
    {
      entity_type: "AIRPORT_BOOKING",
      entity_id: b.id,
      filename: `${data.kind}.pdf`,
      storage_path: path,
      category: "DOCUMENT",
      access_level: "STAFF",
    },
    token,
  );

  await apiPost(
    "/api/audit-logs",
    {
      actor_id: userId,
      action: `booking.${data.kind}.generated`,
      entity: "booking",
      entity_id: b.id,
      details: { document_id: row.id, amount },
    },
    token,
  );

  return row;
}

export const generateBookingDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => GenInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertStaffUser(supabase, userId);

    const { getClientIp } = await import("@/lib/request-utils.server");
    const ipAddress = getClientIp();

    // Auto-assign to current user if unassigned
    const { autoAssignBookingIfNeeded } = await import("@/lib/bookings.functions");
    await autoAssignBookingIfNeeded(supabase, data.id, userId, ipAddress);

    return generateBookingDocumentInternal(supabase, userId, data);
  });

export const listBookingDocuments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const token = getTokenFromRequest();
    const rows = await apiGet<any[]>(`/api/shared/attachments/AIRPORT_BOOKING/${data.id}`, token);

    if (!rows || rows.length === 0) return [];

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const paths = rows.map((r: any) => r.storage_path);
    const { data: signedUrls } = await supabaseAdmin.storage
      .from("booking-docs")
      .createSignedUrls(paths, 60 * 60);

    const urlMap = new Map((signedUrls ?? []).map((item: any) => [item.path, item.signedUrl]));

    return rows.map((r: any) => ({
      id: r.id,
      kind: r.category?.toLowerCase() || r.kind || "document",
      amount: r.amount as number | null,
      currency: r.currency as string | null,
      created_at: r.created_at as string,
      url: urlMap.get(r.storage_path) || r.storage_path || "",
      document_type: r.category || r.document_type || r.kind,
      filename: r.filename || `${r.kind || "document"}.pdf`,
      version: r.version || 1,
      checksum: r.checksum || "legacy",
    }));
  });

export async function generateAllBookingPdfsInternal(
  _supabase: any,
  userId: string | null,
  bookingId: string,
) {
  const token = getTokenFromRequest();
  const booking = await apiGet<any>(`/api/airport/bookings/${bookingId}`, token);
  if (!booking) throw new Error("Booking not found");

  const services = booking.services || [];
  const { getRequiredPdfTypes, generatePdfByType, generateChecksum } = await import(
    "@/lib/pdf-engine.server"
  );
  const requiredTypes = getRequiredPdfTypes(booking, services);
  const results = [];

  const existingDocs = await apiGet<any[]>(`/api/shared/attachments/AIRPORT_BOOKING/${bookingId}`, token);

  for (const type of requiredTypes) {
    try {
      const bytes = await generatePdfByType(type, booking, services);
      const checksum = generateChecksum(bytes);

      const existingDoc = (existingDocs || []).find(
        (d: any) =>
          (d.document_type === type || d.category === type) && d.checksum === checksum,
      );

      if (existingDoc) {
        results.push({ type, status: "up_to_date", id: existingDoc.id });
        continue;
      }

      const matchingVersions = (existingDocs || [])
        .filter((d: any) => d.document_type === type || d.category === type)
        .map((d: any) => d.version || 1);

      const latestVersion = matchingVersions.length > 0 ? Math.max(...matchingVersions) : 0;
      const newVersion = latestVersion + 1;
      const filename = `${type}_v${newVersion}.pdf`;
      const path = `${bookingId}/${filename}`;

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      try {
        await supabaseAdmin.storage.createBucket("booking-docs", { public: false });
      } catch (err) {}
      const { error: upErr } = await supabaseAdmin.storage
        .from("booking-docs")
        .upload(path, bytes, { contentType: "application/pdf", upsert: true });

      if (upErr) {
        console.error(`[PDF Engine] Storage upload failed for ${filename}:`, upErr.message);
        continue;
      }

      const row = await apiPost<any>(
        "/api/shared/attachments/register",
        {
          entity_type: "AIRPORT_BOOKING",
          entity_id: bookingId,
          filename,
          storage_path: path,
          category: type.toUpperCase(),
          access_level: "STAFF",
        },
        token,
      );

      results.push({ type, status: "generated", id: row.id });

      await apiPost(
        "/api/audit-logs",
        {
          actor_id: userId || null,
          action: `booking.${type}.generated`,
          entity: "booking",
          entity_id: bookingId,
          details: { version: newVersion, checksum },
        },
        token,
      );
    } catch (err: any) {
      console.error(
        `[PDF Engine] Error generating PDF of type ${type} for booking ${bookingId}:`,
        err,
      );
    }
  }

  return results;
}

export const generateAllBookingPdfs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertStaffUser(supabase, userId);
    return generateAllBookingPdfsInternal(supabase, userId, data.id);
  });

export const deleteOldDocumentVersions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ bookingId: z.string().uuid(), documentType: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertStaffUser(supabase as any, userId);

    const token = getTokenFromRequest();
    const currentDocs = await apiGet<any[]>(`/api/shared/attachments/AIRPORT_BOOKING/${data.bookingId}`, token);
    const matching = (currentDocs || []).filter(
      (d: any) => (d.category || d.document_type || d.kind) === data.documentType,
    );

    if (matching.length <= 1) {
      return { success: true, message: "No old versions to delete." };
    }

    matching.sort((a, b) => (b.version || 1) - (a.version || 1));
    const oldDocs = matching.slice(1);
    const oldIds = oldDocs.map((d: any) => d.id);
    const oldPaths = oldDocs.map((d: any) => d.storage_path);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.storage.from("booking-docs").remove(oldPaths);

    for (const oldId of oldIds) {
      try {
        await apiDelete(`/api/shared/attachments/${oldId}`, undefined, token);
      } catch (err) {
        console.warn("Failed to delete attachment record:", oldId, err);
      }
    }

    return { success: true, deletedCount: oldIds.length };
  });

export const resendDocumentEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid(), type: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertStaffUser(supabase as any, userId);

    const token = getTokenFromRequest();
    const booking = await apiGet<any>(`/api/airport/bookings/${data.id}`, token);
    if (!booking) throw new Error("Booking not found");

    let eventType = "booking_confirmed";
    let recipient = booking.contact_email || booking.passenger_email;

    if (data.type.includes("ops") || data.type.includes("summary")) {
      eventType = "new_booking_received";
      recipient = process.env.EMAIL_FROM || "admin@shafskyaviation.com";
    } else if (data.type.includes("receipt")) {
      eventType = "payment_successful";
    } else if (data.type.includes("cancel")) {
      eventType = "booking_cancelled";
    } else if (data.type.includes("refund")) {
      eventType = "refund_processed";
    }

    const { enqueueNotification } = await import("@/lib/notifications/queue");
    await enqueueNotification({
      bookingId: booking.id,
      bookingRef: booking.booking_ref || booking.booking_reference,
      recipient,
      channel: "email",
      eventType,
      payload: {
        bookingId: booking.id,
        bookingRef: booking.booking_ref || booking.booking_reference,
        customerName: booking.contact_name || booking.passenger_name,
        origin: booking.origin || booking.origin_code,
        destination: booking.destination || booking.dest_code,
        departDate: booking.depart_date || booking.flight_date,
        amount: Number(booking.quote_amount || booking.price || 0),
      },
    });

    return { success: true };
  });

export const fetchDocs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const token = getTokenFromRequest();
      const rows = await apiGet<any[]>(`/api/shared/attachments/AIRPORT_BOOKING/${data.id}`, token);
      return rows ?? [];
    } catch {
      return [];
    }
  });


