import React from "react";
import {
  Hash,
  Briefcase,
  User,
  Phone,
  Mail,
  Users,
  Car,
  Layers,
  MapPin,
  Calendar,
  Info,
  ExternalLink,
} from "lucide-react";
import { mono } from "@/components/home/theme";

export interface OperationsAlertBookingData {
  booking_ref?: string;
  bookingRef?: string;
  service_name?: string;
  serviceName?: string;
  service_type?: string;
  serviceType?: string;
  package?: string;
  service_category?: string;
  passenger_name?: string;
  passengerName?: string;
  customer_name?: string;
  passenger_phone?: string;
  passengerPhone?: string;
  phone?: string;
  passenger_email?: string;
  passengerEmail?: string;
  email?: string;
  passenger_count?: number | string;
  passengerCount?: number | string;
  passengers?: number | string;
  pax_adults?: number;
  origin_code?: string;
  originCode?: string;
  origin?: string;
  dest_code?: string;
  destCode?: string;
  destination?: string;
  departure_time?: string;
  departureTime?: string;
  service_date?: string;
  serviceDate?: string;
  travel_date?: string;
  notes?: string;
  status?: string;
  dashboard_url?: string;
  details?: {
    vehicle_name?: string;
    vehicleName?: string;
    vehicle_preference?: string;
    vehicle_id?: string;
    vehicleId?: string;
    vehicle_category?: string;
    vehicleCategory?: string;
    origin?: string;
    destination?: string;
    notes?: string;
    additional_requirements?: string;
    passenger_count?: number | string;
    passengers?: number | string;
    date?: string;
  };
  service_options?: {
    vehicle_name?: string;
    vehicle_id?: string;
    vehicle_category?: string;
  };
}

export interface WhatsAppOperationsAlertCardProps {
  booking: OperationsAlertBookingData;
  className?: string;
  onViewInDashboard?: () => void;
}

export function formatAlertDateTime(raw?: string): string {
  if (!raw || !raw.trim()) return "Not provided";
  const str = raw.trim();
  try {
    const clean = str.replace("Z", "+00:00");
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      const day = d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      if (str.length > 10 && (str.includes("T") || str.includes(":") || str.includes(" "))) {
        const time = d.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        return `${day} at ${time}`;
      }
      return day;
    }
  } catch {
    // Fall back to clean string
  }
  return str;
}

export function WhatsAppOperationsAlertCard({
  booking,
  className = "",
  onViewInDashboard,
}: WhatsAppOperationsAlertCardProps) {
  const details = booking.details || {};
  const options = booking.service_options || {};

  // 1. Reference No.
  const refNo = booking.booking_ref || booking.bookingRef || "Not provided";

  // 2. Service
  const service =
    booking.service_name ||
    booking.serviceName ||
    booking.service_type ||
    booking.serviceType ||
    booking.package ||
    booking.service_category ||
    "Not provided";

  // 3. Customer
  const customer =
    booking.passenger_name ||
    booking.passengerName ||
    booking.customer_name ||
    "Not provided";

  // 4. Contact
  const contact =
    booking.passenger_phone ||
    booking.passengerPhone ||
    booking.phone ||
    "Not provided";

  // 5. Email
  const email =
    booking.passenger_email ||
    booking.passengerEmail ||
    booking.email ||
    "Not provided";

  // 6. Passengers
  const rawPax =
    details.passenger_count ||
    details.passengers ||
    booking.passenger_count ||
    booking.passengerCount ||
    booking.passengers ||
    booking.pax_adults;
  const passengers = rawPax ? String(rawPax) : "Not provided";

  // 7. Vehicle (optional / conditional)
  const vehicleName =
    details.vehicle_preference ||
    details.vehicle_name ||
    details.vehicleName ||
    options.vehicle_name;
  const vehicleId = details.vehicle_id || details.vehicleId || options.vehicle_id;
  const vehicle = vehicleName
    ? vehicleId && !vehicleName.toLowerCase().includes(vehicleId.toLowerCase())
      ? `${vehicleName} (ID: ${vehicleId})`
      : vehicleName
    : null;

  // 8. Category (optional / conditional)
  const category =
    details.vehicle_category ||
    details.vehicleCategory ||
    options.vehicle_category ||
    booking.service_category ||
    null;

  // 9. Route
  const origin =
    booking.origin_code ||
    booking.originCode ||
    booking.origin ||
    details.origin;
  const dest =
    booking.dest_code ||
    booking.destCode ||
    booking.destination ||
    details.destination;
  let route = "Not provided";
  if (origin && dest && origin !== dest) {
    route = `${origin} → ${dest}`;
  } else if (origin) {
    route = origin;
  } else if (dest) {
    route = dest;
  }

  // 10. Date & Time
  const rawDate =
    booking.departure_time ||
    booking.departureTime ||
    booking.service_date ||
    booking.serviceDate ||
    booking.travel_date ||
    details.date;
  const dateTime = formatAlertDateTime(rawDate);

  // Notes
  const rawNotes =
    booking.notes ||
    details.notes ||
    details.additional_requirements;
  const notes = rawNotes
    ? rawNotes.trim()
    : "Please action this booking from the operations dashboard.";

  // Status
  const status = (booking.status || "PENDING").toUpperCase();

  // Dashboard Target URL
  const dashboardUrl = booking.dashboard_url || "/admin/bookings";

  // Ordered Rows Construction
  const rows: {
    label: string;
    value: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    monoFont?: boolean;
    bold?: boolean;
  }[] = [
    { label: "Reference No.", value: refNo, icon: Hash, monoFont: true, bold: true },
    { label: "Service", value: service, icon: Briefcase, bold: true },
    { label: "Customer", value: customer, icon: User, bold: true },
    { label: "Contact", value: contact, icon: Phone, monoFont: true },
    { label: "Email", value: email, icon: Mail },
    { label: "Passengers", value: passengers, icon: Users },
  ];

  if (vehicle) {
    rows.push({ label: "Vehicle", value: vehicle, icon: Car, bold: true });
  }

  if (category) {
    rows.push({ label: "Category", value: category, icon: Layers });
  }

  rows.push({ label: "Route", value: route, icon: MapPin, bold: true });
  rows.push({ label: "Date & Time", value: dateTime, icon: Calendar, monoFont: true });

  return (
    <div
      className={`w-full max-w-[620px] bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(15,23,42,0.08),0_8px_10px_-6px_rgba(15,23,42,0.04)] p-6 sm:p-7 text-slate-900 transition-all ${className}`}
    >
      {/* ─────────────────────────────────────────────────────────────
       * 1. TOP HEADER: Logo | Divider | Headings | Gold PENDING Badge
       * ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pb-5 border-b border-slate-200/90 flex-wrap sm:flex-nowrap">
        {/* Brand Logo & Alert Title */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="shrink-0 flex items-center">
            <img
              src="/logo.png"
              alt="Shafsky Aviation"
              className="h-9 w-auto object-contain select-none block"
              onError={(e) => {
                // Fallback to inline SVG branding if logo file is unavailable
                const target = e.currentTarget;
                target.style.display = "none";
                const fallback = target.nextElementSibling;
                if (fallback) (fallback as HTMLElement).style.display = "flex";
              }}
            />
            {/* Embedded Logo Fallback */}
            <div className="hidden items-center gap-2" aria-hidden="true">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 via-sky-500 to-emerald-500 flex items-center justify-center text-amber-300 font-bold text-xs shadow-xs">
                ✈
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#0a196f] tracking-tight leading-none">SHAFSKY</span>
                <span className="text-[7.5px] font-bold text-amber-600 tracking-widest uppercase">AVIATION</span>
              </div>
            </div>
          </div>

          <div className="w-[1px] h-9 bg-slate-300/80 shrink-0" aria-hidden="true" />

          <div className="min-w-0">
            <h2 className="text-lg sm:text-[19px] font-extrabold text-[#0a196f] tracking-tight leading-tight">
              New Operations Alert
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Booking / Enquiry Received
            </p>
          </div>
        </div>

        {/* Gold PENDING Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs shrink-0 self-start sm:self-center">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
          <span>{status}</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
       * 2. STRUCTURED DETAILS TABLE (2 Columns, Alternating Rows)
       * ─────────────────────────────────────────────────────────── */}
      <div className="mt-5 border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full border-collapse text-left">
          <tbody>
            {rows.map((row, idx) => {
              const Icon = row.icon;
              const isEven = idx % 2 === 1;
              return (
                <tr
                  key={row.label}
                  className={`border-b last:border-b-0 border-slate-200/80 transition-colors ${
                    isEven ? "bg-[#f8fafc]" : "bg-white"
                  }`}
                >
                  {/* Left Column: Label + Navy Icon */}
                  <td className="py-2.5 px-4 w-[38%] border-r border-slate-100/90 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 text-[#0a196f] shrink-0">
                        <Icon size={12} className="stroke-[2.2]" />
                      </span>
                      <span className="text-xs font-semibold text-slate-800 tracking-tight">
                        {row.label}
                      </span>
                    </div>
                  </td>

                  {/* Right Column: Value */}
                  <td className="py-2.5 px-4 w-[62%] align-middle">
                    <span
                      className={`text-xs text-slate-900 break-words leading-relaxed ${
                        row.monoFont ? "font-mono" : ""
                      } ${row.bold ? "font-bold text-[#0a196f]" : "font-medium"}`}
                      style={row.monoFont ? mono : undefined}
                    >
                      {row.value}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─────────────────────────────────────────────────────────────
       * 3. NOTES PANEL (Bottom with Information Icon)
       * ─────────────────────────────────────────────────────────── */}
      <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-[#f8fafc] border border-slate-200">
        <div className="flex items-center gap-2 mb-1.5">
          <Info size={14} className="text-[#0a196f] shrink-0 stroke-[2.2]" />
          <span
            className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0a196f]"
            style={mono}
          >
            Special Notes & Instructions
          </span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed pl-5 font-normal">
          “{notes}”
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
       * 4. ACTION BUTTON: Dark Navy "View in Dashboard"
       * ─────────────────────────────────────────────────────────── */}
      <div className="mt-5 flex items-center justify-end">
        {onViewInDashboard ? (
          <button
            type="button"
            onClick={onViewInDashboard}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0a196f] hover:bg-[#071355] text-white text-xs font-semibold tracking-wide shadow-sm hover:shadow transition-all cursor-pointer active:scale-98"
          >
            <span>View in Dashboard</span>
            <ExternalLink size={13} className="shrink-0" />
          </button>
        ) : (
          <a
            href={dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0a196f] hover:bg-[#071355] text-white text-xs font-semibold tracking-wide shadow-sm hover:shadow transition-all cursor-pointer active:scale-98"
          >
            <span>View in Dashboard</span>
            <ExternalLink size={13} className="shrink-0" />
          </a>
        )}
      </div>
    </div>
  );
}
