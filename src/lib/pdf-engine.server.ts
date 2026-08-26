import { PDFDocument, rgb, degrees } from "pdf-lib";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fontkit from "@pdf-lib/fontkit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import qrcode from "qrcode-generator";
import { getActiveBrandingServer } from "./branding/branding.server";

// ============ CODE128 BARCODE UTILITY ============
// Code128 widths for Set B (values 0-106)
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", // 0-9
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", // 10-19
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", // 20-29
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211133", // 30-39
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", // 40-49
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", // 50-59
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", // 60-69
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", // 70-79
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", // 80-89
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", // 90-99
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112" // 100-106 (106 is Stop)
];

function drawBarcode(page: any, text: string, x: number, y: number, height = 40, moduleWidth = 1) {
  // Code128 Set B Start code is 104
  let checksum = 104;
  const chars: number[] = [104];
  
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32;
    chars.push(code);
    checksum += code * (i + 1);
  }
  
  const checkDigit = checksum % 103;
  chars.push(checkDigit);
  chars.push(106); // Stop code
  
  let currentX = x;
  const darkColor = rgb(0.08, 0.1, 0.13);
  
  for (const charVal of chars) {
    const pattern = CODE128_PATTERNS[charVal];
    if (!pattern) continue;
    
    for (let j = 0; j < pattern.length; j++) {
      const width = parseInt(pattern[j], 10) * moduleWidth;
      const isBar = j % 2 === 0;
      
      if (isBar) {
        page.drawRectangle({
          x: currentX,
          y,
          width,
          height,
          color: darkColor,
        });
      }
      currentX += width;
    }
  }
}

// ============ QR CODE UTILITY ============
function drawQRCode(page: any, data: string, x: number, y: number, size = 80) {
  const qr = qrcode(0, "M");
  qr.addData(data);
  qr.make();
  
  const moduleCount = qr.getModuleCount();
  const moduleSize = size / moduleCount;
  const darkColor = rgb(0.08, 0.1, 0.13);
  
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (qr.isDark(r, c)) {
        page.drawRectangle({
          x: x + c * moduleSize,
          y: y + (moduleCount - 1 - r) * moduleSize,
          width: moduleSize,
          height: moduleSize,
          color: darkColor,
        });
      }
    }
  }
}

// ============ SHA256 CHECKSUM UTILITY ============
export function generateChecksum(data: Uint8Array): string {
  // A simple, fast hash function for files (FNV-1a or similar) since crypto is async in Node
  let hval = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    hval ^= data[i];
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return (hval >>> 0).toString(16).padStart(8, "0");
}

// ============ REQUIRED DOCUMENTS DECISION MAKER ============
export function getRequiredPdfTypes(booking: any, services: any[] = []): string[] {
  const types: string[] = [];
  
  if (booking.status === "cancelled") {
    types.push("cancellation_confirmation");
    if (booking.quote_amount && Number(booking.quote_amount) > 0) {
      types.push("refund_receipt");
    }
  } else {
    // Every active booking gets confirmation and invoice
    types.push("booking_confirmation");
    
    if (booking.company) {
      types.push("corporate_invoice");
    } else {
      types.push("customer_invoice");
    }
    
    // Conditionally add vouchers based on services
    if (booking.status === "confirmed" || booking.status === "completed") {
      types.push("payment_receipt");
      
      const hasMeetAssist = services.some(s => 
        s.category === "meet_assist" || 
        s.service_code?.includes("meet_greet") || 
        s.service_code?.includes("fast_track") ||
        s.service_code?.includes("MA-")
      );
      const hasChauffeur = services.some(s => 
        s.category === "chauffeur" || 
        s.service_code?.includes("chauffeur") ||
        s.service_code?.includes("CH-")
      );
      const hasLounge = services.some(s => 
        s.category === "lounge" || 
        s.service_code?.includes("lounge") ||
        s.service_code?.includes("L-")
      );
      
      if (hasMeetAssist) types.push("meet_assist_voucher");
      if (hasChauffeur) types.push("chauffeur_voucher");
      if (hasLounge) types.push("lounge_pass");
      if (services.length > 0) types.push("service_voucher");
    }
  }
  
  // Admins always get operations sheets
  types.push("booking_summary");
  types.push("internal_ops_sheet");
  
  return [...new Set(types)];
}

// ============ LUXURY THEME & LAYOUT BUILDER ============
interface PdfContext {
  pdf: PDFDocument;
  page: any;
  width: number;
  height: number;
  font: any;
  bold: any;
  mono: any;
  arabic: any;
  devanagari: any;
  colors: {
    navy: any;
    gold: any;
    silver: any;
    white: any;
    ink: any;
    muted: any;
  };
}

let cachedLatinBuf: Uint8Array | null = null;
let cachedLatinBoldBuf: Uint8Array | null = null;
let cachedArabicBuf: Uint8Array | null = null;
let cachedDevBuf: Uint8Array | null = null;

async function createBasePdf(title: string, ref: string): Promise<PdfContext> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setCreationDate(new Date(2026, 0, 1));
  pdf.setModificationDate(new Date(2026, 0, 1));
  
  const page = pdf.addPage([595.28, 841.89]); // A4 Size
  const { width, height } = page.getSize();
  
  // Load fonts (cached in memory)
  if (!cachedLatinBuf || !cachedLatinBoldBuf || !cachedArabicBuf || !cachedDevBuf) {
    const fontDir = path.resolve(__dirname, "../assets/fonts");
    const [l, lb, a, d] = await Promise.all([
      fs.readFile(path.join(fontDir, "NotoSans-Regular.ttf")),
      fs.readFile(path.join(fontDir, "NotoSans-Bold.ttf")),
      fs.readFile(path.join(fontDir, "NotoSansArabic-Regular.ttf")),
      fs.readFile(path.join(fontDir, "NotoSansDevanagari-Regular.ttf")),
    ]);
    cachedLatinBuf = l;
    cachedLatinBoldBuf = lb;
    cachedArabicBuf = a;
    cachedDevBuf = d;
  }

  const font = await pdf.embedFont(cachedLatinBuf);
  const bold = await pdf.embedFont(cachedLatinBoldBuf);
  const arabic = await pdf.embedFont(cachedArabicBuf);
  const devanagari = await pdf.embedFont(cachedDevBuf);
  const mono = await pdf.embedFont(cachedLatinBuf); // use Latin regular for mono fallback
  
  const branding = await getActiveBrandingServer();

  const hexToRgbColor = (hex: string, defaultColor: any) => {
    try {
      const cleanHex = hex.replace("#", "");
      if (cleanHex.length === 6) {
        const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
        const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
        const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
        return rgb(r, g, b);
      }
    } catch (err) {}
    return defaultColor;
  };

  const navy = hexToRgbColor(branding.primary_color, rgb(13/255, 42/255, 54/255));
  const gold = hexToRgbColor(branding.secondary_color, rgb(197/255, 160/255, 89/255));
  const silver = rgb(226/255, 232/255, 240/255);
  const white = rgb(1, 1, 1);
  const ink = rgb(15/255, 23/255, 42/255);
  const muted = rgb(100/255, 116/255, 139/255);
  
  // 1. Watermark background using company name
  page.drawText(branding.company_name.toUpperCase(), {
    x: width / 2 - 200,
    y: height / 2 - 20,
    size: 30,
    font: bold,
    color: rgb(240/255, 235/255, 220/255),
    opacity: 0.12,
    rotate: degrees(35),
  });
  
  // 2. Luxury Header Banner (Navy with Gold borders)
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width,
    height: 100,
    color: navy,
  });
  // Gold bottom line
  page.drawRectangle({
    x: 0,
    y: height - 104,
    width,
    height: 4,
    color: gold,
  });
  
  // Try to load and embed logo image
  let logoImage = null;
  if (branding.logo_url) {
    try {
      if (branding.logo_url.includes("logo.png") && !branding.logo_url.startsWith("http")) {
        // Load default logo locally from public folder
        const localLogoPath = path.resolve(process.cwd(), "public/logo.png");
        const bytes = await fs.readFile(localLogoPath);
        try {
          logoImage = await pdf.embedPng(bytes);
        } catch {
          logoImage = await pdf.embedJpg(bytes);
        }
      } else {
        // Download custom logo from Supabase
        const clientServer = await import("@/integrations/supabase/client.server");
        const sbAdmin = clientServer.supabaseAdmin as any;
        const { data: fileData, error } = await sbAdmin.storage
          .from("branding")
          .download("logo.png");
        if (!error && fileData) {
          const arrayBuffer = await fileData.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          try {
            logoImage = await pdf.embedPng(bytes);
          } catch {
            logoImage = await pdf.embedJpg(bytes);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load branding logo, using text crest:", err);
    }
  }

  if (logoImage) {
    const dims = logoImage.scaleToFit(140, 48);
    page.drawImage(logoImage, {
      x: 46,
      y: height - 50 - dims.height / 2,
      width: dims.width,
      height: dims.height,
    });
  } else {
    // Styled crest (Luxury vector diamond)
    page.drawRectangle({
      x: 46,
      y: height - 64,
      width: 28,
      height: 28,
      borderColor: gold,
      borderWidth: 1.5,
      rotate: degrees(45),
    });
    
    // Dynamic initials
    const initials = branding.company_name
      .split(" ")
      .map(w => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    if (initials.length === 2) {
      page.drawText(initials[0], { x: 54, y: height - 58, size: 22, font: bold, color: gold });
      page.drawText(initials[1], { x: 63, y: height - 54, size: 12, font: bold, color: white });
    } else {
      page.drawText(initials || "S", { x: 55, y: height - 56, size: 18, font: bold, color: gold });
    }
    
    // Logo Title
    const nameParts = branding.company_name.split(" ");
    const firstPart = nameParts[0]?.toUpperCase() || "SHAFSKY";
    const restPart = nameParts.slice(1).join(" ")?.toUpperCase() || "AVIATION";
    
    page.drawText(firstPart, {
      x: 100,
      y: height - 46,
      size: 20,
      font: bold,
      color: white,
    });
    const spacedRest = restPart.split("").join(" ");
    page.drawText(spacedRest, {
      x: 100,
      y: height - 64,
      size: 9,
      font: bold,
      color: gold,
    });
  }
  
  // Document Type / Ref
  const docTitle = title.toUpperCase();
  page.drawText(docTitle, {
    x: width - 240,
    y: height - 46,
    size: 14,
    font: bold,
    color: gold,
  });
  page.drawText(`REF: ${ref}`, {
    x: width - 240,
    y: height - 66,
    size: 11,
    font: mono,
    color: white,
  });
  
  // 3. Footer
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: 50,
    color: navy,
  });
  // Gold top line
  page.drawRectangle({
    x: 0,
    y: 46,
    width,
    height: 4,
    color: gold,
  });
  
  const footerText = `${branding.company_name}  ·  ${branding.support_email}  ·  ${branding.support_phone}`;
  page.drawText(footerText, {
    x: 40,
    y: 20,
    size: 8,
    font,
    color: silver,
  });
  
  const timestamp = new Date().toLocaleString("en-IN");
  page.drawText(`Page 1 of 1  |  Generated: ${timestamp}`, {
    x: width - 240,
    y: 20,
    size: 8,
    font: mono,
    color: silver,
  });
  
  return {
    pdf,
    page,
    width,
    height,
    font,
    bold,
    mono,
    arabic,
    devanagari,
    colors: { navy, gold, silver, white, ink, muted },
  };
}

// Draw a beautiful styled content box
function drawContentBox(
  ctx: PdfContext,
  title: string,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const { page, bold, colors } = ctx;
  
  // Shaded background
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    color: rgb(0.97, 0.98, 0.99),
    borderColor: colors.silver,
    borderWidth: 1,
  });
  
  // Header strip
  page.drawRectangle({
    x,
    y: y + h - 22,
    width: w,
    height: 22,
    color: colors.navy,
  });
  
  page.drawText(title.toUpperCase(), {
    x: x + 12,
    y: y + h - 15,
    size: 9,
    font: bold,
    color: colors.gold,
    letterSpacing: 1,
  });
}

// ============ SPECIFIC PDF DOCUMENT GENERATORS ============

export async function generateBookingConfirmationPdf(booking: any): Promise<Uint8Array> {
  const branding = await getActiveBrandingServer();
  const ctx = await createBasePdf("Booking Confirmation", booking.booking_ref);
  const { page, font, bold, mono, colors, width, height } = ctx;
  
  let y = height - 140;
  
  // QR and Barcode top right
  drawQRCode(page, `${booking.id}|${booking.booking_ref}|${branding.website}/verify/${booking.id}`, width - 120, y - 40, 80);
  drawBarcode(page, booking.booking_ref, width - 200, y - 90, 30, 0.9);
  page.drawText("SCANNABLE BOOKING VERIFICATION", { x: width - 200, y: y - 105, size: 7, font: mono, color: colors.muted });

  // Booking Summary box
  y -= 100;
  drawContentBox(ctx, "Passenger & Journey Info", 40, y - 140, 320, 140);
  let by = y - 30;
  page.drawText(`Customer: ${booking.contact_name}`, { x: 52, y: by, size: 10, font: bold, color: colors.ink });
  page.drawText(`Email: ${booking.contact_email}`, { x: 52, y: by - 16, size: 9, font, color: colors.ink });
  page.drawText(`Phone: ${booking.contact_phone}`, { x: 52, y: by - 32, size: 9, font, color: colors.ink });
  page.drawText(`Route: ${booking.origin} -> ${booking.destination}`, { x: 52, y: by - 55, size: 11, font: bold, color: colors.navy });
  page.drawText(`Depart Date: ${booking.depart_date}`, { x: 52, y: by - 72, size: 9, font, color: colors.ink });
  if (booking.return_date) {
    page.drawText(`Return Date: ${booking.return_date}`, { x: 52, y: by - 88, size: 9, font, color: colors.ink });
  }
  page.drawText(`Passengers: ${booking.pax_adults} Adults, ${booking.pax_children} Children`, { x: 52, y: by - 108, size: 9, font, color: colors.ink });

  // Status and Financials Box
  y -= 170;
  drawContentBox(ctx, "Booking Status & Fees", 40, y - 90, 515, 90);
  page.drawText(`Flight Class: ${booking.service_type || "VVIP First Class"}`, { x: 52, y: y - 30, size: 10, font: bold, color: colors.ink });
  page.drawText(`Booking Status: ${booking.status.toUpperCase()}`, { x: 52, y: y - 48, size: 9, font: bold, color: colors.navy });
  page.drawText(`Payment Status: ${booking.status === "confirmed" ? "PAID" : "QUOTE OUTSTANDING"}`, { x: 52, y: y - 64, size: 9, font, color: colors.ink });
  
  const amtText = `${booking.quote_currency || "INR"} ${Number(booking.quote_amount || 0).toLocaleString("en-IN")}`;
  page.drawText("TOTAL PRICE", { x: width - 180, y: y - 36, size: 9, font: bold, color: colors.muted });
  page.drawText(amtText, { x: width - 180, y: y - 60, size: 18, font: bold, color: colors.navy });

  // Terms & Conditions
  y -= 130;
  drawContentBox(ctx, "Terms & Conditions", 40, y - 200, 515, 200);
  const terms = [
    "1. Quotations are subject to slots, parking permissions, and atmospheric flight plans.",
    "2. Cancellations within 24 hours of flight departure are subject to 100% cancellation penalty fee.",
    "3. Concierge, tarmac transfers, and fast-track clearance are provided by authorized airport partners.",
    "4. Passengers must carry valid travel documents including passports and visas where required.",
    `5. For emergency coordination, contact our 24/7 Dispatch Desk at ${branding.support_email}.`,
    "6. Please check terminals in your flight profile as local clearances can vary airport-to-airport."
  ];
  let ty = y - 30;
  for (const line of terms) {
    page.drawText(line, { x: 52, y: ty, size: 8, font, color: colors.muted });
    ty -= 16;
  }
  
  return await ctx.pdf.save();
}

export async function generateInvoicePdf(booking: any, isCorporate = false): Promise<Uint8Array> {
  const ctx = await createBasePdf(isCorporate ? "Corporate Invoice" : "Customer Invoice", booking.booking_ref);
  const { page, font, bold, mono, colors, width, height } = ctx;
  
  let y = height - 140;
  
  // Metadata & QR Code
  drawQRCode(page, `${booking.id}|Invoice|${booking.booking_ref}`, width - 120, y - 40, 80);
  
  // Invoice Details
  page.drawText(`INVOICE NO: INV-${booking.booking_ref.slice(3)}`, { x: 40, y, size: 10, font: bold, color: colors.ink });
  page.drawText(`DATE: ${new Date().toLocaleDateString("en-IN")}`, { x: 40, y: y - 16, size: 9, font, color: colors.ink });
  page.drawText(`PAYMENT METHOD: Credit Card / Corporate Account`, { x: 40, y: y - 32, size: 9, font, color: colors.ink });
  
  // Client info
  y -= 70;
  drawContentBox(ctx, "Bill To", 40, y - 80, 240, 80);
  page.drawText(booking.contact_name, { x: 52, y: y - 32, size: 10, font: bold, color: colors.ink });
  if (isCorporate && booking.company) {
    page.drawText(booking.company, { x: 52, y: y - 46, size: 9, font: bold, color: colors.muted });
    page.drawText("GSTIN: 27AAAAA1111A1Z1 (Assumed Corporate Client)", { x: 52, y: y - 60, size: 8, font: mono, color: colors.muted });
  } else {
    page.drawText(booking.contact_email, { x: 52, y: y - 46, size: 9, font, color: colors.ink });
    page.drawText(booking.contact_phone, { x: 52, y: y - 60, size: 8, font, color: colors.ink });
  }
  
  // Company details
  drawContentBox(ctx, "Issuer", 300, y - 80, 255, 80);
  page.drawText("Shafsky Aviation Services Pvt. Ltd.", { x: 312, y: y - 32, size: 10, font: bold, color: colors.ink });
  page.drawText("PAN: AADCS8888P", { x: 312, y: y - 46, size: 8, font: mono, color: colors.muted });
  page.drawText("GSTIN: 27AADCS8888P1ZX", { x: 312, y: y - 60, size: 8, font: mono, color: colors.muted });
  
  // Line Items
  y -= 110;
  drawContentBox(ctx, "Line Items & Fee Breakdown", 40, y - 200, 515, 200);
  
  let ly = y - 36;
  page.drawText("DESCRIPTION", { x: 52, y: ly, size: 9, font: bold, color: colors.muted });
  page.drawText("QTY", { x: 340, y: ly, size: 9, font: bold, color: colors.muted });
  page.drawText("UNIT PRICE", { x: 390, y: ly, size: 9, font: bold, color: colors.muted });
  page.drawText("TOTAL", { x: 480, y: ly, size: 9, font: bold, color: colors.muted });
  
  page.drawLine({ start: { x: 52, y: ly - 8 }, end: { x: 540, y: ly - 8 }, color: colors.silver, thickness: 1 });
  
  ly -= 26;
  // Main booking fee
  const basePrice = Number(booking.quote_amount || 0);
  page.drawText(`VVIP Airside Concierge - ${booking.origin} to ${booking.destination}`, { x: 52, y: ly, size: 9, font, color: colors.ink });
  page.drawText("1", { x: 345, y: ly, size: 9, font, color: colors.ink });
  page.drawText(basePrice.toLocaleString("en-IN"), { x: 390, y: ly, size: 9, font, color: colors.ink });
  page.drawText(basePrice.toLocaleString("en-IN"), { x: 480, y: ly, size: 9, font: bold, color: colors.ink });
  
  // Tax breakdown (18% GST)
  const gstRate = 0.18;
  const taxableVal = basePrice / (1 + gstRate);
  const gstAmt = basePrice - taxableVal;
  
  ly -= 50;
  page.drawLine({ start: { x: 300, y: ly + 14 }, end: { x: 540, y: ly + 14 }, color: colors.silver, thickness: 1 });
  
  page.drawText("Taxable Value:", { x: 300, y: ly, size: 9, font, color: colors.muted });
  page.drawText(taxableVal.toLocaleString("en-IN"), { x: 480, y: ly, size: 9, font, color: colors.ink });
  
  ly -= 16;
  page.drawText("CGST (9%):", { x: 300, y: ly, size: 9, font, color: colors.muted });
  page.drawText((gstAmt / 2).toLocaleString("en-IN"), { x: 480, y: ly, size: 9, font, color: colors.ink });
  
  ly -= 16;
  page.drawText("SGST (9%):", { x: 300, y: ly, size: 9, font, color: colors.muted });
  page.drawText((gstAmt / 2).toLocaleString("en-IN"), { x: 480, y: ly, size: 9, font, color: colors.ink });
  
  ly -= 22;
  page.drawLine({ start: { x: 300, y: ly + 8 }, end: { x: 540, y: ly + 8 }, color: colors.navy, thickness: 1.5 });
  page.drawText("GRAND TOTAL:", { x: 300, y: ly - 8, size: 10, font: bold, color: colors.navy });
  
  const totalText = `${booking.quote_currency || "INR"} ${basePrice.toLocaleString("en-IN")}`;
  page.drawText(totalText, { x: 460, y: ly - 8, size: 12, font: bold, color: colors.navy });
  
  return await ctx.pdf.save();
}

export async function generateServiceVoucherPdf(booking: any, title = "Service Voucher", desc = "VVIP Ground Handling Services"): Promise<Uint8Array> {
  const branding = await getActiveBrandingServer();
  const ctx = await createBasePdf(title, booking.booking_ref);
  const { page, font, bold, mono, colors, width, height } = ctx;
  
  let y = height - 140;
  
  // Barcode & QR Code
  drawQRCode(page, `${booking.id}|Voucher|${title}`, width - 120, y - 40, 80);
  drawBarcode(page, booking.booking_ref, width - 200, y - 90, 30, 0.9);
  
  // Main details
  drawContentBox(ctx, "Credential Details", 40, y - 160, 320, 160);
  let vy = y - 30;
  page.drawText(`PASSENGER: ${booking.contact_name}`, { x: 52, y: vy, size: 10, font: bold, color: colors.ink });
  page.drawText(`VOUCHER TYPE: ${title}`, { x: 52, y: vy - 16, size: 9, font: bold, color: colors.gold });
  page.drawText(`ROUTE: ${booking.origin} -> ${booking.destination}`, { x: 52, y: vy - 32, size: 9, font, color: colors.ink });
  page.drawText(`DEPARTURE DATE: ${booking.depart_date}`, { x: 52, y: vy - 48, size: 9, font, color: colors.ink });
  page.drawText(`FLIGHT / AIRCRAFT: ${booking.aircraft_preference || "VVIP flight"}`, { x: 52, y: vy - 64, size: 9, font, color: colors.ink });
  page.drawText("VALIDITY: Only on date of scheduled flight.", { x: 52, y: vy - 84, size: 8, font: mono, color: colors.muted });
  
  // Descriptions
  y -= 190;
  drawContentBox(ctx, "Services Rendered", 40, y - 250, 515, 250);
  
  let sy = y - 30;
  page.drawText(desc, { x: 52, y: sy, size: 12, font: bold, color: colors.navy });
  sy -= 24;
  page.drawText("Instruction for Airport Authorities & Staff:", { x: 52, y: sy, size: 9, font: bold, color: colors.ink });
  sy -= 16;
  
  const instructions = [
    "- Please scan the QR code above to verify booking status online.",
    "- Escort client through dedicated VVIP corridors.",
    "- Assist client with all luggage transfers to/from chauffeur vehicles.",
    "- If meet & assist: Greeter must await passenger with custom name placard at gates.",
    "- If tarmac transfer: Driver must verify flight code before passenger boarding.",
    "- If lounge pass: Grant entry to the primary lounge area and private suites.",
    `- Direct any queries to Dispatch Operations at ${branding.booking_email}.`
  ];
  
  for (const line of instructions) {
    page.drawText(line, { x: 52, y: sy, size: 9, font, color: colors.muted });
    sy -= 20;
  }
  
  return await ctx.pdf.save();
}

export async function generateMeetAssistVoucherPdf(booking: any): Promise<Uint8Array> {
  return generateServiceVoucherPdf(booking, "Meet & Assist Voucher", "Airport Greeter & Fast-Track Customs Escort");
}

export async function generateChauffeurVoucherPdf(booking: any): Promise<Uint8Array> {
  return generateServiceVoucherPdf(booking, "Chauffeur Voucher", "Luxury Tarmac / Curbside Chauffeur Transfer");
}

export async function generateLoungePassPdf(booking: any): Promise<Uint8Array> {
  return generateServiceVoucherPdf(booking, "Lounge Access Pass", "VVIP First Class Airport Lounge Access");
}

export async function generatePaymentReceiptPdf(booking: any): Promise<Uint8Array> {
  const ctx = await createBasePdf("Payment Receipt", booking.booking_ref);
  const { page, font, bold, mono, colors, width, height } = ctx;
  
  let y = height - 140;
  
  drawQRCode(page, `${booking.id}|Receipt|${booking.quote_amount}`, width - 120, y - 40, 80);
  
  page.drawText("RECEIPT OF PAYMENT", { x: 40, y, size: 16, font: bold, color: colors.navy });
  page.drawText(`Receipt ID: REC-${booking.booking_ref.slice(3)}`, { x: 40, y: y - 24, size: 9, font: mono, color: colors.muted });
  page.drawText(`Date: ${new Date().toLocaleDateString("en-IN")}`, { x: 40, y: y - 40, size: 9, font, color: colors.ink });
  
  y -= 80;
  drawContentBox(ctx, "Transaction Details", 40, y - 100, 515, 100);
  page.drawText("Paid By:", { x: 52, y: y - 36, size: 9, font, color: colors.muted });
  page.drawText(booking.contact_name, { x: 120, y: y - 36, size: 9, font: bold, color: colors.ink });
  
  page.drawText("Amount Paid:", { x: 52, y: y - 56, size: 9, font, color: colors.muted });
  const amt = `${booking.quote_currency || "INR"} ${Number(booking.quote_amount || 0).toLocaleString("en-IN")}`;
  page.drawText(amt, { x: 120, y: y - 56, size: 12, font: bold, color: colors.navy });
  
  page.drawText("Transaction Status:", { x: 52, y: y - 76, size: 9, font, color: colors.muted });
  page.drawText("CLEARED / SUCCESSFUL", { x: 120, y: y - 76, size: 9, font: bold, color: rgb(0.1, 0.6, 0.2) });
  
  return await ctx.pdf.save();
}

export async function generateCancellationConfirmationPdf(booking: any): Promise<Uint8Array> {
  const ctx = await createBasePdf("Cancellation Confirmation", booking.booking_ref);
  const { page, font, bold, mono, colors, width, height } = ctx;
  
  let y = height - 140;
  
  drawQRCode(page, `${booking.id}|Cancelled|${booking.booking_ref}`, width - 120, y - 40, 80);
  
  page.drawText("BOOKING CANCELLATION", { x: 40, y, size: 16, font: bold, color: colors.navy });
  page.drawText(`Reference: ${booking.booking_ref}`, { x: 40, y: y - 24, size: 9, font: mono, color: colors.muted });
  
  y -= 70;
  drawContentBox(ctx, "Status Update", 40, y - 120, 515, 120);
  page.drawText("Passenger:", { x: 52, y: y - 36, size: 9, font, color: colors.muted });
  page.drawText(booking.contact_name, { x: 140, y: y - 36, size: 9, font: bold, color: colors.ink });
  
  page.drawText("Cancellation Date:", { x: 52, y: y - 56, size: 9, font, color: colors.muted });
  page.drawText(new Date().toLocaleDateString("en-IN"), { x: 140, y: y - 56, size: 9, font, color: colors.ink });
  
  page.drawText("Booking Status:", { x: 52, y: y - 76, size: 9, font, color: colors.muted });
  page.drawText("CANCELLED / VOID", { x: 140, y: y - 76, size: 10, font: bold, color: rgb(0.8, 0.1, 0.1) });
  
  page.drawText("Refund Amount:", { x: 52, y: y - 96, size: 9, font, color: colors.muted });
  const refAmt = `${booking.quote_currency || "INR"} ${Number(booking.quote_amount || 0).toLocaleString("en-IN")}`;
  page.drawText(`${refAmt} (Initiated back to source)`, { x: 140, y: y - 96, size: 9, font: bold, color: colors.ink });
  
  return await ctx.pdf.save();
}

export async function generateRefundReceiptPdf(booking: any): Promise<Uint8Array> {
  const ctx = await createBasePdf("Refund Receipt", booking.booking_ref);
  const { page, font, bold, mono, colors, width, height } = ctx;
  
  let y = height - 140;
  
  drawQRCode(page, `${booking.id}|Refund|${booking.quote_amount}`, width - 120, y - 40, 80);
  
  page.drawText("CREDIT NOTE / REFUND", { x: 40, y, size: 16, font: bold, color: colors.navy });
  page.drawText(`Date: ${new Date().toLocaleDateString("en-IN")}`, { x: 40, y: y - 24, size: 9, font, color: colors.ink });
  
  y -= 70;
  drawContentBox(ctx, "Refund Transaction", 40, y - 100, 515, 100);
  page.drawText("Recipient:", { x: 52, y: y - 36, size: 9, font, color: colors.muted });
  page.drawText(booking.contact_name, { x: 140, y: y - 36, size: 9, font: bold, color: colors.ink });
  
  page.drawText("Amount Refunded:", { x: 52, y: y - 56, size: 9, font, color: colors.muted });
  const refAmt = `${booking.quote_currency || "INR"} ${Number(booking.quote_amount || 0).toLocaleString("en-IN")}`;
  page.drawText(refAmt, { x: 140, y: y - 56, size: 10, font: bold, color: colors.navy });
  
  page.drawText("Status:", { x: 52, y: y - 76, size: 9, font, color: colors.muted });
  page.drawText("PROCESSED successfully", { x: 140, y: y - 76, size: 9, font: bold, color: rgb(0.1, 0.6, 0.2) });
  
  return await ctx.pdf.save();
}

export async function generateBookingSummaryPdf(booking: any): Promise<Uint8Array> {
  const ctx = await createBasePdf("Booking Summary", booking.booking_ref);
  const { page, font, bold, colors, width, height } = ctx;
  
  let y = height - 140;
  
  page.drawText("INTERNAL USE ONLY", { x: 40, y, size: 11, font: bold, color: colors.gold });
  
  y -= 30;
  drawContentBox(ctx, "Administrative Details", 40, y - 140, 515, 140);
  let sy = y - 30;
  page.drawText(`Booking Ref: ${booking.booking_ref}`, { x: 52, y: sy, size: 10, font: bold, color: colors.ink });
  page.drawText(`Assigned Coordinator: ${booking.assigned_to || "Unassigned"}`, { x: 52, y: sy - 16, size: 9, font, color: colors.ink });
  page.drawText(`Customer Contact: ${booking.contact_name} (${booking.contact_email})`, { x: 52, y: sy - 32, size: 9, font, color: colors.ink });
  page.drawText(`Booking Status: ${booking.status.toUpperCase()}`, { x: 52, y: sy - 48, size: 9, font: bold, color: colors.navy });
  
  page.drawText(`Origin: ${booking.origin}  ->  Destination: ${booking.destination}`, { x: 52, y: sy - 68, size: 10, font: bold, color: colors.ink });
  page.drawText(`Departure: ${booking.depart_date}`, { x: 52, y: sy - 84, size: 9, font, color: colors.ink });
  page.drawText(`Vessel/Charter Option: ${booking.aircraft_preference || "VVIP Class"}`, { x: 52, y: sy - 100, size: 9, font, color: colors.ink });
  
  y -= 180;
  drawContentBox(ctx, "Operational Notes", 40, y - 100, 515, 100);
  page.drawText(booking.notes || "No special requests or customer notes provided.", {
    x: 52,
    y: y - 30,
    size: 9,
    font,
    color: colors.ink,
    lineHeight: 14,
  });
  
  return await ctx.pdf.save();
}

export async function generateInternalOpsSheetPdf(booking: any, services: any[] = []): Promise<Uint8Array> {
  const ctx = await createBasePdf("Internal Operation Sheet", booking.booking_ref);
  const { page, font, bold, colors, width, height } = ctx;
  
  let y = height - 140;
  
  page.drawText("CONFIDENTIAL - FIELD LOGISTICS COORDINATOR SHEET", { x: 40, y, size: 10, font: bold, color: colors.navy });
  
  y -= 30;
  drawContentBox(ctx, "Airport Flight Operations", 40, y - 100, 515, 100);
  let oy = y - 30;
  page.drawText(`Reference: ${booking.booking_ref}`, { x: 52, y: oy, size: 10, font: bold, color: colors.ink });
  page.drawText(`Routing: ${booking.origin} to ${booking.destination}`, { x: 52, y: oy - 16, size: 9, font, color: colors.ink });
  page.drawText(`Passenger Count: ${booking.pax_adults} Adults, ${booking.pax_children} Children`, { x: 52, y: oy - 32, size: 9, font, color: colors.ink });
  page.drawText(`Departure Slot: ${booking.depart_date}`, { x: 52, y: oy - 48, size: 9, font, color: colors.ink });
  
  y -= 130;
  drawContentBox(ctx, "Airport VVIP Services Checklist", 40, y - 220, 515, 220);
  let cy = y - 30;
  
  page.drawText("SERVICES ORDERED:", { x: 52, y: cy, size: 10, font: bold, color: colors.navy });
  cy -= 20;
  
  if (services.length === 0) {
    page.drawText("No special ground services configured for this segment.", { x: 52, y: cy, size: 9, font, color: colors.muted });
    cy -= 16;
  } else {
    for (const service of services) {
      page.drawText(`[ ] ${service.service_name} (Qty: ${service.quantity})`, { x: 52, y: cy, size: 9, font: bold, color: colors.ink });
      cy -= 16;
    }
  }
  
  cy -= 10;
  page.drawText("OPERATOR CHECKLIST PROCEDURES:", { x: 52, y: cy, size: 9, font: bold, color: colors.muted });
  cy -= 16;
  
  const checkpoints = [
    "[ ] 1. Confirm flight landing/departure coordinates at dispatcher console.",
    "[ ] 2. Direct airport host to boarding gate 30 minutes before arrival.",
    "[ ] 3. Verify passenger passport & visa clearances are uploaded in secure vault.",
    "[ ] 4. Direct chauffeur vehicle to airside tarmac entrance or terminal gate.",
    "[ ] 5. Confirm lounge occupancy and reserve VVIP dining tables.",
    "[ ] 6. Log all step times in central coordinator terminal."
  ];
  
  for (const check of checkpoints) {
    page.drawText(check, { x: 52, y: cy, size: 8, font, color: colors.muted });
    cy -= 14;
  }
  
  return await ctx.pdf.save();
}

// Map document_type string to generator function
export async function generatePdfByType(type: string, booking: any, services: any[] = []): Promise<Uint8Array> {
  switch (type) {
    case "booking_confirmation":
      return generateBookingConfirmationPdf(booking);
    case "customer_invoice":
      const { buildPdf } = await import("./booking-documents.functions");
      return buildPdf({
        kind: "invoice",
        ref: booking.booking_ref || booking.booking_reference,
        customer: booking.contact_name || booking.passenger_name || "Guest Passenger",
        email: booking.contact_email || booking.passenger_email || "guest@shafsky.com",
        phone: booking.contact_phone || booking.passenger_phone || "",
        origin: booking.origin || booking.origin_code || "DEL",
        destination: booking.destination || booking.dest_code || "DXB",
        depart: booking.depart_date || booking.flight_date || "",
        ret: booking.return_date || null,
        pax: `${booking.pax_adults || booking.num_passengers || 1} adult · ${booking.pax_children || 0} child · ${booking.pax_infants || 0} infant`,
        amount: Number(booking.quote_amount || booking.price || 0),
        currency: booking.quote_currency ?? booking.currency ?? "INR",
        service_type: booking.service_type || booking.service_package,
      });
    case "corporate_invoice":
      return generateInvoicePdf(booking, true);
    case "service_voucher":
      return generateServiceVoucherPdf(booking);
    case "meet_assist_voucher":
      return generateMeetAssistVoucherPdf(booking);
    case "chauffeur_voucher":
      return generateChauffeurVoucherPdf(booking);
    case "lounge_pass":
      return generateLoungePassPdf(booking);
    case "payment_receipt":
      return generatePaymentReceiptPdf(booking);
    case "cancellation_confirmation":
      return generateCancellationConfirmationPdf(booking);
    case "refund_receipt":
      return generateRefundReceiptPdf(booking);
    case "booking_summary":
      return generateBookingSummaryPdf(booking);
    case "internal_ops_sheet":
      return generateInternalOpsSheetPdf(booking, services);
    default:
      throw new Error(`Unsupported PDF document type: ${type}`);
  }
}
