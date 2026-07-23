import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertStaffUser, isStaffUser } from "@/lib/permissions";
import { CONTACT } from "./constants";

const GenInput = z.object({
  id: z.string().uuid(),
  kind: z.enum(["quotation", "invoice", "receipt"]),
  amount: z.number().nonnegative().optional(),
});

async function buildPdf(opts: {
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
  page.drawText("SHAFSKY AVIATION", {
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
  page.drawText(`Shafsky Aviation Pvt Ltd  ·  ${CONTACT.PHONE}  ·  ${CONTACT.EMAIL}`, {
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
        ? "Thank you for flying with Shafsky Aviation."
        : "Thank you for choosing Shafsky Airport Services.",
    { x: 40, y: 26, size: 9, font, color: muted },
  );

  return await pdf.save();
}

export async function generateBookingDocumentInternal(
  supabase: unknown,
  userId: string,
  data: { id: string; kind: "quotation" | "invoice" | "receipt"; amount?: number },
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: b, error } = await sb
    .from("bookings")
    .select(
      "id, booking_ref, contact_name, contact_email, contact_phone, origin, destination, depart_date, return_date, pax_adults, pax_children, pax_infants, quote_amount, quote_currency, service_type",
    )
    .eq("id", data.id)
    .single();
  if (error || !b) throw new Error("Booking not found");

  const amount = data.amount ?? Number(b.quote_amount ?? 0);
  const bytes = await buildPdf({
    kind: data.kind,
    ref: b.booking_ref,
    customer: b.contact_name,
    email: b.contact_email,
    phone: b.contact_phone,
    origin: b.origin,
    destination: b.destination,
    depart: b.depart_date,
    ret: b.return_date,
    pax: `${b.pax_adults} adult · ${b.pax_children} child · ${b.pax_infants} infant`,
    amount,
    currency: b.quote_currency ?? "INR",
    service_type: b.service_type,
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

  const { data: row, error: insErr } = await supabaseAdmin
    .from("booking_documents")
    .insert({
      booking_id: b.id,
      kind: data.kind,
      storage_path: path,
      amount,
      currency: b.quote_currency ?? "INR",
      generated_by: userId,
    } as never)
    .select("id, kind, storage_path, amount, currency, created_at")
    .single();
  if (insErr) throw new Error(insErr.message);

  await sb.from("audit_log").insert({
    actor_id: userId,
    action: `booking.${data.kind}.generated`,
    entity: "booking",
    entity_id: b.id,
    metadata: { document_id: row.id, amount },
  });

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
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const sb = supabase as any;

    // Verify ownership or staff permissions
    const { data: booking, error: bErr } = await sb
      .from("bookings")
      .select("user_id")
      .eq("id", data.id)
      .maybeSingle();

    if (bErr || !booking) {
      throw new Error("Booking not found");
    }

    if (booking.user_id !== userId) {
      const isStaff = await isStaffUser(sb, userId);
      if (!isStaff) {
        throw new Error(
          "Forbidden: You do not have permission to view documents for this booking.",
        );
      }
    }

    let queryFields = "id, kind, storage_path, amount, currency, created_at, document_type, filename, version, checksum";
    let { data: rows, error } = await sb
      .from("booking_documents")
      .select(queryFields)
      .eq("booking_id", data.id)
      .order("created_at", { ascending: false });

    // Fallback if columns are not migrated yet
    if (error && error.message.includes("column")) {
      const legacyResult = await sb
        .from("booking_documents")
        .select("id, kind, storage_path, amount, currency, created_at")
        .eq("booking_id", data.id)
        .order("created_at", { ascending: false });
      rows = legacyResult.data;
      error = legacyResult.error;
    }

    if (error) throw new Error(error.message);

    if (!rows || rows.length === 0) return [];
    const paths = rows.map((r: any) => r.storage_path);
    const { data: signedUrls } = await sb.storage
      .from("booking-docs")
      .createSignedUrls(paths, 60 * 60);

    const urlMap = new Map((signedUrls ?? []).map((item: any) => [item.path, item.signedUrl]));

    return rows.map((r: any) => ({
      id: r.id,
      kind: r.kind,
      amount: r.amount as number | null,
      currency: r.currency as string | null,
      created_at: r.created_at as string,
      url: urlMap.get(r.storage_path) || "",
      document_type: r.document_type || r.kind,
      filename: r.filename || `${r.kind}.pdf`,
      version: r.version || 1,
      checksum: r.checksum || "legacy",
    }));
  });

export async function generateAllBookingPdfsInternal(
  supabase: any,
  userId: string | null,
  bookingId: string
) {
  // 1. Fetch booking
  const { data: booking, error: bErr } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();
  if (bErr || !booking) throw new Error("Booking not found");

  // 2. Fetch booking services
  const { data: services } = await supabase
    .from("booking_services")
    .select("*")
    .eq("booking_id", bookingId);
  
  // 3. Determine required PDFs
  const { getRequiredPdfTypes, generatePdfByType, generateChecksum } = await import("@/lib/pdf-engine.server");
  const requiredTypes = getRequiredPdfTypes(booking, services || []);
  const results = [];
  
  for (const type of requiredTypes) {
    try {
      // Generate PDF bytes
      const bytes = await generatePdfByType(type, booking, services || []);
      const checksum = generateChecksum(bytes);
      
      // Check if this version already exists (by checksum)
      let existingDoc = null;
      try {
        const { data } = await supabase
          .from("booking_documents")
          .select("id, storage_path, version")
          .eq("booking_id", bookingId)
          .eq("document_type", type)
          .eq("checksum", checksum)
          .maybeSingle();
        existingDoc = data;
      } catch (err) {
        // Fallback for legacy DB structure
      }
        
      if (existingDoc) {
        results.push({ type, status: "up_to_date", id: existingDoc.id });
        continue;
      }
      
      // Get highest version
      let latestVersion = 0;
      try {
        const { data: versions } = await supabase
          .from("booking_documents")
          .select("version")
          .eq("booking_id", bookingId)
          .eq("document_type", type)
          .order("version", { ascending: false })
          .limit(1);
        if (versions && versions.length > 0) {
          latestVersion = versions[0].version || 1;
        }
      } catch (err) {
        // Fallback for legacy DB structure
      }
      
      const newVersion = latestVersion + 1;
      const filename = `${type}_v${newVersion}.pdf`;
      const path = `${bookingId}/${filename}`;
      
      // Upload to storage
      try {
        await supabase.storage.createBucket("booking-docs", { public: false });
      } catch (err) {}
      const { error: upErr } = await supabase.storage
        .from("booking-docs")
        .upload(path, bytes, { contentType: "application/pdf", upsert: true });
        
      if (upErr) {
        console.error(`[PDF Engine] Storage upload failed for ${filename}:`, upErr.message);
        continue;
      }
      
      // Map kind for DB constraint compatibility
      let mappedKind = "quotation";
      if (type.includes("invoice")) mappedKind = "invoice";
      else if (type.includes("receipt")) mappedKind = "receipt";
      
      // Insert row with defensive fallback for column existence
      const dbPayload: any = {
        booking_id: bookingId,
        kind: mappedKind,
        storage_path: path,
        amount: booking.quote_amount || null,
        currency: booking.quote_currency || "INR",
        generated_by: userId,
      };
      
      try {
        const { data: row, error: insErr } = await supabase
          .from("booking_documents")
          .insert({
            ...dbPayload,
            document_type: type,
            filename: filename,
            checksum: checksum,
            version: newVersion,
          })
          .select("id")
          .single();
          
        if (insErr) {
          if (insErr.message.includes("column")) {
            // Fallback insert without new columns
            const { data: fbRow, error: fbErr } = await supabase
              .from("booking_documents")
              .insert(dbPayload)
              .select("id")
              .single();
            if (fbErr) throw fbErr;
            results.push({ type, status: "generated_legacy", id: fbRow.id });
          } else {
            throw insErr;
          }
        } else {
          results.push({ type, status: "generated", id: row.id });
        }
      } catch (insErr: any) {
        // Double fallback
        const { data: fbRow, error: fbErr } = await supabase
          .from("booking_documents")
          .insert(dbPayload)
          .select("id")
          .single();
        if (fbErr) throw fbErr;
        results.push({ type, status: "generated_legacy", id: fbRow.id });
      }
      
      // Audit Log
      await supabase.from("audit_log").insert({
        actor_id: userId || null,
        action: `booking.${type}.generated`,
        entity: "booking",
        entity_id: bookingId,
        metadata: { version: newVersion, checksum },
      });
      
    } catch (err: any) {
      console.error(`[PDF Engine] Error generating PDF of type ${type} for booking ${bookingId}:`, err);
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
    const sb = supabase as any;
    await assertStaffUser(sb, userId);
    
    // Find all rows of this documentType for this booking where version < max(version)
    const { data: currentDocs, error: fetchErr } = await sb
      .from("booking_documents")
      .select("id, version, storage_path")
      .eq("booking_id", data.bookingId)
      .eq("document_type", data.documentType)
      .order("version", { ascending: false });
      
    if (fetchErr || !currentDocs || currentDocs.length <= 1) {
      return { success: true, message: "No old versions to delete." };
    }
    
    const oldDocs = currentDocs.slice(1);
    const oldIds = oldDocs.map((d: any) => d.id);
    const oldPaths = oldDocs.map((d: any) => d.storage_path);
    
    // Delete from storage
    const { error: storageErr } = await sb.storage
      .from("booking-docs")
      .remove(oldPaths);
      
    // Delete from DB
    const { error: dbErr } = await sb
      .from("booking_documents")
      .delete()
      .in("id", oldIds);
      
    if (dbErr) throw new Error(dbErr.message);
    
    return { success: true, deletedCount: oldIds.length };
  });

export const resendDocumentEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid(), type: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const sb = supabase as any;
    await assertStaffUser(sb, userId);
    
    // Get booking details
    const { data: booking } = await sb.from("bookings").select("*").eq("id", data.id).single();
    if (!booking) throw new Error("Booking not found");
    
    // Queue a notification of type based on the document
    let eventType = "booking_confirmed";
    let recipient = booking.contact_email;
    
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
      bookingRef: booking.booking_ref,
      recipient,
      channel: "email",
      eventType,
      payload: {
        bookingId: booking.id,
        bookingRef: booking.booking_ref,
        customerName: booking.contact_name,
        origin: booking.origin,
        destination: booking.destination,
        departDate: booking.depart_date,
        amount: Number(booking.quote_amount || 0),
      },
    });
    
    return { success: true };
  });


