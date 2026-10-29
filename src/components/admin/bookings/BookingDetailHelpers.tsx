import { pageMono, Panel } from "@/components/site/PageShell";
import { Loader2, UtensilsCrossed, AlertCircle } from "lucide-react";

export const WORKFLOW_STATUSES = [
  "NEW_BOOKING",
  "UNDER_REVIEW",
  "WAITING_FOR_CUSTOMER",
  "PAYMENT_PENDING",
  "PAYMENT_VERIFIED",
  "CONFIRMED",
  "CHECKED_IN",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
  "REFUND_REQUESTED",
  "REFUND_APPROVED",
  "REFUNDED",
] as const;

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "NEW_BOOKING":
      return "bg-[#5ed3ff]/10 text-[#5ed3ff] border border-[#5ed3ff]/20";
    case "UNDER_REVIEW":
      return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
    case "WAITING_FOR_CUSTOMER":
      return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
    case "PAYMENT_PENDING":
      return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    case "PAYMENT_VERIFIED":
      return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    case "CONFIRMED":
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25";
    case "CHECKED_IN":
      return "bg-teal-500/10 text-teal-400 border border-teal-500/20";
    case "COMPLETED":
      return "bg-emerald-500/5 text-white/50 border border-white/10";
    case "REJECTED":
    case "CANCELLED":
      return "bg-red-500/10 text-red-400 border border-red-500/20";
    case "REFUND_REQUESTED":
    case "REFUND_APPROVED":
      return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
    case "REFUNDED":
      return "bg-white/5 text-white/30 border border-white/5";
    default:
      return "bg-white/5 text-white/60 border border-white/10";
  }
}

export interface ParsedFlight {
  segment: string;
  isManual: boolean;
  flightNum: string;
  airline: string;
  origin: string;
  destination: string;
  departDate: string;
  departTime: string;
  arrivalDateTime: string;
  terminals: string;
}

export function parseFlightSnapshots(notes: string | null, booking?: any): ParsedFlight[] {
  const segments: ParsedFlight[] = [];

  if (notes) {
    const snapRegex =
      /\[Flight (\d) Snapshot - (AUTO_VERIFIED|MANUAL_ENTRY)\]([\s\S]*?)(?=\[Flight \d Snapshot|$|Selected Services:|Total Service Price:)/g;

    let match;
    while ((match = snapRegex.exec(notes)) !== null) {
      const segment = match[1];
      const mode = match[2];
      const content = match[3];

      const isManual = mode === "MANUAL_ENTRY";

      const flightNumMatch = content.match(/-\s*Flight Number:\s*([^\n\r]+)/i);
      const airlineMatch = content.match(/-\s*Airline Name:\s*([^\n\r]+)/i);
      const originMatch = content.match(/-\s*Departure Airport:\s*([^\n\r]+)/i);
      const destMatch = content.match(/-\s*Arrival Airport:\s*([^\n\r]+)/i);

      const depDateMatch = content.match(/-\s*Departure Date:\s*([^\n\r]+)/i);
      const depTimeMatch = content.match(/-\s*Departure Time:\s*([^\n\r]+)/i);
      const depDateTimeMatch = content.match(/-\s*Departure Date\/Time:\s*([^\n\r]+)/i);

      const arrDateTimeMatch = content.match(/-\s*Arrival Date\/Time:\s*([^\n\r]+)/i);
      const terminalsMatch = content.match(/-\s*Terminals:\s*([^\n\r]+)/i);

      const flightNum = flightNumMatch ? flightNumMatch[1].trim() : "";
      const airline = airlineMatch ? airlineMatch[1].trim() : "";
      const origin = originMatch ? originMatch[1].trim() : "";
      const destination = destMatch ? destMatch[1].trim() : "";

      let departDate = depDateMatch ? depDateMatch[1].trim() : "";
      let departTime = depTimeMatch ? depTimeMatch[1].trim() : "";
      if (depDateTimeMatch) {
        const parts = depDateTimeMatch[1].trim().split(" ");
        departDate = parts[0] || "";
        departTime = parts[1] || "";
      }

      const arrivalDateTime = arrDateTimeMatch ? arrDateTimeMatch[1].trim() : "";
      const terminals = terminalsMatch ? terminalsMatch[1].trim() : "";

      segments.push({
        segment,
        isManual,
        flightNum,
        airline,
        origin,
        destination,
        departDate,
        departTime,
        arrivalDateTime,
        terminals,
      });
    }
  }

  // Fallback: If no snapshot found in notes but metadataJson contains incoming/connecting flight
  if (segments.length === 0 && booking?.metadataJson) {
    const meta = booking.metadataJson;
    if (meta.incoming_flight) {
      const inc = meta.incoming_flight;
      segments.push({
        segment: "1",
        isManual: inc.is_manual ?? !inc.is_verified,
        flightNum: inc.flight_number || booking.flight_num || "",
        airline: inc.airline || "Airline",
        origin: inc.origin || booking.origin || "",
        destination: inc.destination || booking.transit_hub || meta.transit_hub || meta.transit_code || "Transit Hub",
        departDate: inc.depart_date || (inc.depart_time ? String(inc.depart_time).slice(0, 10) : ""),
        departTime: inc.depart_time ? String(inc.depart_time).slice(11, 16) : "",
        arrivalDateTime: inc.arrival_time ? String(inc.arrival_time).slice(0, 16).replace("T", " ") : "",
        terminals: inc.terminal ? `Terminal ${inc.terminal}` : "",
      });
    }
    if (meta.connecting_flight) {
      const conn = meta.connecting_flight;
      segments.push({
        segment: "2",
        isManual: conn.is_manual ?? !conn.is_verified,
        flightNum: conn.flight_number || booking.flight_num_2 || meta.flight_number_2 || "",
        airline: conn.airline || "Airline",
        origin: conn.origin || booking.transit_hub || meta.transit_hub || meta.transit_code || "Transit Hub",
        destination: conn.destination || booking.destination || "",
        departDate: conn.depart_date || (conn.depart_time ? String(conn.depart_time).slice(0, 10) : ""),
        departTime: conn.depart_time ? String(conn.depart_time).slice(11, 16) : "",
        arrivalDateTime: conn.arrival_time ? String(conn.arrival_time).slice(0, 16).replace("T", " ") : "",
        terminals: conn.terminal ? `Terminal ${conn.terminal}` : "",
      });
    }
  }

  return segments;
}

export function BookingMealArrangementSection({ booking }: { booking: any }) {
  const rawMeta = ((booking?.metadataJson || (booking as any)?.metadata || {}) as Record<string, any>);
  const rawDetails = ((rawMeta.details || (booking as any)?.service_options || {}) as Record<string, any>);
  const isMealArrangement =
    booking?.service_type === "On-board Meal Arrangements for Group Meet & Greet Bookings" ||
    rawDetails.service_name?.includes("Meal") ||
    rawMeta.details?.service?.includes("Meal") ||
    rawDetails.meal_types !== undefined;
  if (!isMealArrangement) return null;
  const mealDetails = { ...rawDetails, ...(rawMeta.details || {}) };

  return (
    <div className="pt-4 border-t border-white/5 space-y-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-[#5ed3ff] font-mono font-bold flex items-center gap-1.5">
          <UtensilsCrossed className="w-3.5 h-3.5" />
          On-board Meal Arrangement Specifications
        </span>
        {mealDetails.declaration_confirmed && (
          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Declaration Confirmed
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono bg-black/20 p-4 rounded-xl border border-white/5">
        <div>
          <span className="text-white/40 text-[9px] block">Passenger Name</span>
          <span className="font-semibold text-white/90">{mealDetails.passenger_name || booking.passenger_name || booking.contact_name}</span>
        </div>
        <div>
          <span className="text-white/40 text-[9px] block">Flight Number</span>
          <span className="font-semibold text-white/90">{mealDetails.flight_number || booking.flight_num || "N/A"}</span>
        </div>
        <div>
          <span className="text-white/40 text-[9px] block">Travel Date</span>
          <span className="font-semibold text-white/90">{mealDetails.travel_date || mealDetails.service_date || booking.depart_date}</span>
        </div>
        <div>
          <span className="text-white/40 text-[9px] block">Sector / Route</span>
          <span className="font-semibold text-white/90">{mealDetails.sector || `${booking.origin_code || booking.origin || ""} – ${booking.dest_code || booking.destination || ""}`.trim()}</span>
        </div>
        <div>
          <span className="text-white/40 text-[9px] block">Number of Meals</span>
          <span className="font-bold text-[#5ed3ff]">{mealDetails.meal_count || 1} Meals</span>
        </div>
        <div className="col-span-1 md:col-span-3">
          <span className="text-white/40 text-[9px] block mb-1">Meal Types</span>
          <div className="flex flex-wrap gap-1.5">
            {Array.isArray(mealDetails.meal_types) && mealDetails.meal_types.length > 0 ? (
              mealDetails.meal_types.map((t: string) => (
                <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  {t}
                </span>
              ))
            ) : (
              <span className="text-white/40">Standard</span>
            )}
          </div>
        </div>
        <div className="col-span-2">
          <span className="text-white/40 text-[9px] block mb-1">Meal Preferences</span>
          <div className="flex flex-wrap gap-1.5">
            {Array.isArray(mealDetails.meal_preferences) && mealDetails.meal_preferences.length > 0 ? (
              mealDetails.meal_preferences.map((p: string) => (
                <span key={p} className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {p}
                </span>
              ))
            ) : (
              <span className="text-white/40">None</span>
            )}
          </div>
        </div>
        <div className="col-span-2">
          <span className="text-white/40 text-[9px] block mb-1">Allergies & Special Requirements</span>
          <div className="flex flex-wrap gap-1.5">
            {Array.isArray(mealDetails.allergies) && mealDetails.allergies.length > 0 ? (
              mealDetails.allergies.map((a: string) => (
                <span
                  key={a}
                  className={`px-2 py-0.5 rounded text-[10px] ${
                    a === "None"
                      ? "bg-slate-500/10 text-slate-300 border border-slate-500/20"
                      : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                  }`}
                >
                  {a}
                </span>
              ))
            ) : (
              <span className="text-white/40">None</span>
            )}
          </div>
        </div>
        {mealDetails.additional_instructions && (
          <div className="col-span-2 md:col-span-4 border-t border-white/5 pt-2 mt-1">
            <span className="text-white/40 text-[9px] block mb-0.5">Additional Instructions</span>
            <span className="text-white/80">{mealDetails.additional_instructions}</span>
          </div>
        )}
        {(mealDetails.id_type || mealDetails.id_number || mealDetails.id_proof_attached !== undefined) && (
          <div className="col-span-2 md:col-span-4 border-t border-white/5 pt-2 mt-1 flex flex-wrap gap-4 text-[10px]">
            {mealDetails.id_type && (
              <div>
                <span className="text-white/40">ID Type:</span>{" "}
                <span className="text-white/90">{mealDetails.id_type}</span>
              </div>
            )}
            {mealDetails.id_number && (
              <div>
                <span className="text-white/40">ID Number:</span>{" "}
                <span className="text-white/90">{mealDetails.id_number}</span>
              </div>
            )}
            <div>
              <span className="text-white/40">ID Proof Attached:</span>{" "}
              <span className="text-white/90">{mealDetails.id_proof_attached ? "Yes" : "No"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function BookingPassengerManifestPanel({
  manifest,
  loadingManifest,
}: {
  manifest: any[];
  loadingManifest: boolean;
}) {
  return (
    <Panel tone="dark" className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#5ed3ff] font-mono font-bold">
            Passenger Manifest ({manifest.length} Passengers)
          </h3>
          <p className="text-[10px] text-white/40 font-mono mt-0.5">
            Verified passenger travel credentials, passport/visa clearance, and concierge preferences.
          </p>
        </div>
      </div>

      {loadingManifest ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-[#5ed3ff]" />
        </div>
      ) : manifest.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-white/10 rounded-xl text-xs font-mono text-white/40">
          No normalized passenger manifest records attached to this booking yet.
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {manifest.map((p: any) => (
            <div key={p.manifest_id || p.passenger_id} className="py-4 first:pt-0 last:pb-0 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{p.full_name}</span>
                  {p.is_primary_contact && (
                    <span className="px-2 py-0.5 text-[8px] font-mono uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                      Primary Contact
                    </span>
                  )}
                  <span className="text-xs text-white/50 font-mono">
                    {p.age !== null ? `${p.age} yrs` : "Age N/A"} ({p.gender})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-white/40">Nationality:</span>
                  <span className="text-white font-semibold">{p.nationality}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono bg-black/20 p-3 rounded-lg border border-white/5">
                <div>
                  <span className="text-white/40 text-[10px] block">Passport Number & Expiry</span>
                  <span className="text-white font-bold">{p.passport_number}</span>
                  {p.passport_expiry && (
                    <div className="mt-1">
                      <span
                        className={`inline-block px-1.5 py-0.5 text-[8px] uppercase font-bold rounded ${
                          p.passport_status?.status === "valid"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : p.passport_status?.status === "expiring_soon"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                        }`}
                      >
                        Exp: {p.passport_expiry} ({p.passport_status?.message})
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-white/40 text-[10px] block">Visa Details</span>
                  <span className="text-white font-bold">{p.visa_number || "N/A"}</span>
                  {p.visa_expiry && (
                    <div className="mt-1">
                      <span
                        className={`inline-block px-1.5 py-0.5 text-[8px] uppercase font-bold rounded ${
                          p.visa_status?.status === "valid"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                        }`}
                      >
                        Exp: {p.visa_expiry}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-white/40 text-[10px] block">Concierge Preferences</span>
                  <div className="text-white/80 text-[11px] space-y-0.5 mt-0.5">
                    {p.special_assistance && <div>Assistance: {p.special_assistance}</div>}
                    {p.meal_preference && <div>Meal: {p.meal_preference}</div>}
                    {p.seat_preference && <div>Seat: {p.seat_preference}</div>}
                    {!p.special_assistance && !p.meal_preference && !p.seat_preference && (
                      <div className="text-white/30 italic">No special preferences</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

export function BookingSelectedServicesPanel({ booking }: { booking: any }) {
  return (
    <Panel tone="dark" className="p-6 space-y-6">
      <h3 className="text-xs uppercase tracking-widest text-white/40 font-mono">
        Selected Concierge Services
      </h3>
      {booking.booking_services && booking.booking_services.length > 0 ? (
        <div className="divide-y divide-white/5">
          {booking.booking_services.map((svc: any) => (
            <div
              key={svc.id}
              className="py-4 first:pt-0 last:pb-0 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-semibold text-white">{svc.service_name}</div>
                <div
                  className="text-[10px] text-white/40 uppercase tracking-widest mt-1"
                  style={pageMono}
                >
                  {svc.category} · Code: {svc.service_code}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono">Qty: {svc.quantity} pax</div>
                {svc.unit_price && (
                  <div className="text-[10px] text-white/40 mt-1" style={pageMono}>
                    {svc.currency} {Number(svc.unit_price).toLocaleString()} / pax
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-white/30 text-xs">
          No add-on concierge services selected for this journey.
        </div>
      )}
    </Panel>
  );
}

export function BookingSuperAdminOverrideModal({
  isOpen,
  onClose,
  overrideStatusSelect,
  setOverrideStatusSelect,
  overrideReason,
  setOverrideReason,
  onApplyOverride,
}: {
  isOpen: boolean;
  onClose: () => void;
  overrideStatusSelect: string;
  setOverrideStatusSelect: (val: string) => void;
  overrideReason: string;
  setOverrideReason: (val: string) => void;
  onApplyOverride: () => Promise<void>;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0c121b] border border-white/15 p-6 max-w-sm w-full rounded shadow-2xl space-y-4">
        <div className="flex items-center gap-3 text-amber-400">
          <AlertCircle className="h-5 w-5" />
          <h4 className="text-sm font-semibold font-mono uppercase tracking-wider">
            Super Admin Override
          </h4>
        </div>

        <div className="space-y-3 text-xs text-white/80">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono block">
              Target State
            </label>
            <select
              value={overrideStatusSelect}
              onChange={(e) => setOverrideStatusSelect(e.target.value)}
              className="w-full bg-[#0c121b] border border-white/10 px-2 py-1.5 outline-none text-white text-xs"
            >
              <option value="" className="bg-[#0c121b] text-white">
                Select target status...
              </option>
              {WORKFLOW_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-[#0c121b] text-white">
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono block">
              Reason (Mandatory)
            </label>
            <textarea
              placeholder="Enter mandatory override reason..."
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              rows={3}
              className="w-full bg-transparent border border-white/10 p-2 outline-none text-white text-xs"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-white/10 text-xs font-mono text-white/60 hover:text-white hover:bg-white/5 uppercase tracking-wider cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={!overrideStatusSelect || !overrideReason.trim()}
            onClick={onApplyOverride}
            className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-400 hover:bg-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider cursor-pointer"
          >
            Apply Override
          </button>
        </div>
      </div>
    </div>
  );
}
