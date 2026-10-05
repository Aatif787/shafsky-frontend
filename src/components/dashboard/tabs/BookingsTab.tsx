import { QRCodeSVG } from "qrcode.react";
import { Calendar, Plus, Download } from "lucide-react";
import { toast } from "sonner";
import { display, mono } from "@/components/dashboard/theme";
import type { Booking } from "@/components/dashboard/types";

/** Dashboard "bookings" tab. Shared state and handlers come from DashboardView via `ctx`. */
export default function BookingsTab({ ctx }: { ctx: any }) {
  const { setActiveTab, selectedBooking, setSelectedBooking, reschedulingId, setReschedulingId, rescheduleDate, setRescheduleDate, rescheduleSubmitting, bookings, bookingDocs, convertQuote, handleCancelBooking, handleReschedule, handleRepeatBooking } = ctx;
  return (
              <div className="space-y-6 animate-in fade-in duration-300 text-left">
                <div className="flex justify-between items-center">
                  <h2
                    className="text-xl font-bold uppercase tracking-wider text-[#0d2a36]"
                    style={display}
                  >
                    My Flights & Bookings
                  </h2>
                  <button
                    onClick={() => setActiveTab("new-booking")}
                    className="flex items-center gap-1.5 bg-[#0d5a6e] hover:bg-[#0a4252] text-white rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition"
                    style={mono}
                  >
                    <Plus size={14} /> New Request
                  </button>
                </div>

                {bookings.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl border border-dashed border-black/10">
                    <Calendar className="h-10 w-10 text-[#5b6b75] mx-auto opacity-45" />
                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#5b6b75] font-mono">
                      No Flights Cataloged
                    </p>
                    <p className="text-[11px] text-[#5b6b75]/80 mt-1 max-w-xs mx-auto leading-relaxed">
                      You haven't requested any flight concierge services yet. Open a request today.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((b: any) => (
                      <div
                        key={b.id}
                        className="p-6 rounded-2xl bg-[#faf5ea] border border-white/50 transition duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        style={{ boxShadow: "4px 4px 12px #e8e0d0, -4px -4px 12px #ffffff" }}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold font-mono text-[#0d5a6e] bg-[#0d5a6e]/5 px-2 py-0.5 rounded">
                              {b.booking_ref}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded font-mono ${b.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : b.status === "pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : b.status === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                                }`}
                            >
                              {b.status}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-[#0d2a36]" style={display}>
                            {b.origin} → {b.destination}
                          </div>
                          <div className="text-[10px] text-[#5b6b75] font-mono">
                            Date: {b.depart_date} | Guests: {b.pax_adults} Adult(s)
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="px-3.5 py-2 border border-black/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black/[0.02] cursor-pointer"
                            style={mono}
                          >
                            Details
                          </button>
                          {b.status === "pending" && (
                            <button
                              onClick={() => handleCancelBooking(b.id)}
                              className="px-3.5 py-2 border border-red-200 text-red-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 cursor-pointer"
                              style={mono}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Booking details modal */}
                {selectedBooking && (
                  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#faf5ea] rounded-3xl p-6 lg:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl relative">
                      <button
                        onClick={() => setSelectedBooking(null)}
                        className="absolute right-6 top-6 text-[#5b6b75] hover:text-[#0d2a36] font-bold text-xs"
                      >
                        Close [x]
                      </button>

                      <h3
                        className="text-xl font-bold uppercase tracking-wider mb-6"
                        style={display}
                      >
                        Flight Concierge Ticket
                      </h3>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-black/[0.06]">
                          <div>
                            <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono">
                              Reference ID
                            </div>
                            <div className="text-xs font-bold font-mono text-[#0d2a36]">
                              {selectedBooking.booking_ref}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono">
                              Status
                            </div>
                            <div className="text-xs font-bold uppercase tracking-widest text-right text-[#0d5a6e]">
                              {selectedBooking.status}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono">
                              Origin
                            </div>
                            <div className="text-xs font-semibold text-[#0d2a36]">
                              {selectedBooking.origin}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono">
                              Destination
                            </div>
                            <div className="text-xs font-semibold text-[#0d2a36]">
                              {selectedBooking.destination}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono">
                              Departure Date
                            </div>
                            <div className="text-xs font-semibold text-[#0d2a36]">
                              {selectedBooking.depart_date}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono">
                              Passengers
                            </div>
                            <div className="text-xs font-semibold text-[#0d2a36]">
                              {selectedBooking.pax_adults} Adult(s)
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono">
                              Service Quote
                            </div>
                            <div className="text-xs font-semibold text-[#0d5a6e]">
                              {selectedBooking.quote_amount
                                ? convertQuote(
                                  selectedBooking.quote_amount,
                                  selectedBooking.quote_currency || "INR",
                                )
                                : "Reviewing"}
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-black/[0.02] border border-black/[0.04] space-y-2">
                          <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono">
                            Assigned Service
                          </div>
                          <div className="text-xs font-semibold text-[#0d2a36]">
                            {selectedBooking.service_type || "Standard Assistance"}
                          </div>
                          {selectedBooking.notes && (
                            <div className="pt-2">
                              <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono">
                                Special Requests
                              </div>
                              <div className="text-xs text-[#5b6b75] mt-0.5 italic">
                                "{selectedBooking.notes}"
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Real QR Code with booking data */}
                        <div className="flex flex-col items-center justify-center p-5 border border-dashed border-black/10 rounded-2xl bg-white/60">
                          <div className="p-3 bg-white rounded-xl shadow-sm">
                            <QRCodeSVG
                              value={JSON.stringify({
                                ref: selectedBooking.booking_ref,
                                name: selectedBooking.contact_name,
                                from: selectedBooking.origin,
                                to: selectedBooking.destination,
                                date: selectedBooking.depart_date,
                                pax: selectedBooking.pax_adults + selectedBooking.pax_children + selectedBooking.pax_infants,
                                service: selectedBooking.service_type || "Standard",
                                status: selectedBooking.status,
                                issued: new Date().toISOString().split("T")[0],
                                verify: `https://shafskyaviation.com/verify/${selectedBooking.booking_ref}`,
                              })}
                              size={140}
                              level="M"
                              bgColor="#ffffff"
                              fgColor="#0d2a36"
                              marginSize={0}
                            />
                          </div>
                          <span className="text-[8px] font-mono text-[#5b6b75] uppercase mt-3 tracking-widest">
                            Scan boarding credentials at Shafsky counter
                          </span>
                          <span className="text-[7px] font-mono text-[#5b6b75]/50 mt-0.5">
                            Ref: {selectedBooking.booking_ref}
                          </span>
                        </div>

                        {/* CUSTOMER QUOTE ACTION BAR */}
                        {Boolean(selectedBooking.quote_amount) && (
                          <div className="p-4 rounded-xl bg-[#0d5a6e]/5 border border-[#0d5a6e]/20 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold tracking-widest text-[#0d5a6e]" style={mono}>
                                Official Quotation Available
                              </span>
                              <span className="text-xs font-bold text-[#0d2a36]" style={mono}>
                                {selectedBooking.quote_currency || "INR"} {Number(selectedBooking.quote_amount).toLocaleString()}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <button
                                onClick={() => {
                                  toast.info(`Viewing Quotation for Ref: ${selectedBooking.booking_ref}`);
                                }}
                                className="py-2 bg-white border border-black/10 rounded-lg text-[9px] font-bold uppercase tracking-wider text-[#0d2a36] hover:bg-black/5 transition cursor-pointer"
                                style={mono}
                              >
                                View Quote
                              </button>

                              <button
                                onClick={() => {
                                  toast.success(`Redirecting to Secure Payment Gateway for Ref: ${selectedBooking.booking_ref}`);
                                }}
                                className="py-2 bg-[#0d5a6e] hover:bg-[#0a4252] text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition cursor-pointer"
                                style={mono}
                              >
                                Accept & Pay
                              </button>

                              <button
                                onClick={() => {
                                  const reason = prompt("Enter revision instructions for our ops team:");
                                  if (reason) {
                                    toast.success("Revision request submitted to Ops Desk.");
                                  }
                                }}
                                className="py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-amber-100 transition cursor-pointer"
                                style={mono}
                              >
                                Request Revision
                              </button>
                            </div>
                          </div>
                        )}

                        {reschedulingId === selectedBooking.id ? (
                          <form
                            onSubmit={handleReschedule}
                            className="p-4 rounded-xl bg-amber-50 border border-amber-200/50 space-y-3"
                          >
                            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-800 font-mono">
                              Request New Departure Date
                            </div>
                            <input
                              type="date"
                              required
                              value={rescheduleDate}
                              onChange={(e) => setRescheduleDate(e.target.value)}
                              className="w-full h-9 px-3 rounded-lg border border-black/10 bg-white text-xs outline-none"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setReschedulingId(null)}
                                className="flex-1 py-1.5 border border-black/10 rounded-lg text-[9px] font-bold uppercase font-mono bg-white cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={rescheduleSubmitting}
                                className="flex-1 py-1.5 bg-[#0d5a6e] hover:bg-[#0a4252] text-white rounded-lg text-[9px] font-bold uppercase font-mono cursor-pointer"
                              >
                                {rescheduleSubmitting ? "Submitting..." : "Confirm"}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => {
                                setReschedulingId(selectedBooking.id);
                                setRescheduleDate(selectedBooking.depart_date);
                              }}
                              className="flex-1 py-2 border border-black/10 rounded-xl text-[9px] font-bold uppercase tracking-wider hover:bg-black/5 cursor-pointer"
                              style={mono}
                            >
                              Request Reschedule
                            </button>
                            <button
                              onClick={() => handleRepeatBooking(selectedBooking)}
                              className="flex-1 py-2 border border-[#0d5a6e]/20 text-[#0d5a6e] rounded-xl text-[9px] font-bold uppercase tracking-wider hover:bg-[#0d5a6e]/5 cursor-pointer"
                              style={mono}
                            >
                              Repeat Booking
                            </button>
                          </div>
                        )}

                        {(() => {
                          const customerDocs = (bookingDocs || []).filter(
                            (d: any) =>
                              d.document_type !== "booking_summary" &&
                              d.document_type !== "internal_ops_sheet"
                          );
                          const latestCustomerDocsMap = new Map();
                          for (const d of customerDocs) {
                            const type = d.document_type || d.kind;
                            if (!latestCustomerDocsMap.has(type)) {
                              latestCustomerDocsMap.set(type, d);
                            }
                          }
                          const latestCustomerDocs = Array.from(latestCustomerDocsMap.values());

                          if (latestCustomerDocs.length === 0) return null;

                          return (
                            <div className="space-y-2.5 pt-3 border-t border-black/[0.06] text-left">
                              <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono">
                                Official Journey Documents
                              </div>
                              <div className="grid gap-2">
                                {latestCustomerDocs.map((d: any) => {
                                  const docLabel = (d.document_type || d.kind)
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (c: string) => c.toUpperCase());
                                  return (
                                    <div
                                      key={d.id}
                                      className="flex justify-between items-center px-4 py-3 bg-white/80 border border-black/[0.04] rounded-xl hover:shadow-sm transition-all"
                                    >
                                      <div className="min-w-0">
                                        <div className="text-xs font-bold text-[#0d2a36]">
                                          {docLabel}
                                        </div>
                                        <div className="text-[9px] text-[#5b6b75] font-mono mt-0.5">
                                          Version v{d.version || 1} · {d.filename || `${d.kind}.pdf`}
                                        </div>
                                      </div>
                                      <a
                                        href={d.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="shrink-0 px-3 py-1.5 bg-[#0d5a6e]/5 hover:bg-[#0d5a6e]/10 text-[#0d5a6e] border border-[#0d5a6e]/10 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1"
                                        style={mono}
                                      >
                                        <Download size={10} /> Get
                                      </a>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => {
                              window.print();
                            }}
                            className="flex-1 py-2.5 bg-[#0d5a6e] hover:bg-[#0a4252] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                            style={mono}
                          >
                            <Download size={13} /> Print Confirmation
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
  );
}
