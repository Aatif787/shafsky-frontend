import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSingleBooking,
  executeBookingWorkflowAction,
  getBookingInternalStatus,
  listAssignableStaff,
  listBookingHistory,
  listBookingAudit,
  updateBookingDetails,
  listBookingNotifications,
  retryNotificationLog,
} from "@/lib/bookings.functions";
import {
  generateBookingDocument,
  listBookingDocuments,
  generateAllBookingPdfs,
  deleteOldDocumentVersions,
  resendDocumentEmail,
} from "@/lib/booking-documents.functions";
import { listBookingPassengers } from "@/lib/passengers.functions";
import { pageMono, pageDisplay, Panel } from "@/components/site/PageShell";
import { Loader2, AlertTriangle, ArrowLeft, Plane } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { QuoteBuilderModal } from "@/components/admin/QuoteBuilderModal";
import {
  WORKFLOW_STATUSES,
  getStatusBadgeClass,
  parseFlightSnapshots,
  type ParsedFlight,
  BookingMealArrangementSection,
  BookingPassengerManifestPanel,
  BookingSelectedServicesPanel,
  BookingSuperAdminOverrideModal,
} from "@/components/admin/bookings/BookingDetailHelpers";
import {
  BookingTabbedInfoDeck,
  BookingRightColumnPanels,
  type BookingDetailTab,
} from "@/components/admin/bookings/BookingDetailParts";

export { WORKFLOW_STATUSES, getStatusBadgeClass, parseFlightSnapshots, type ParsedFlight };

export const Route = createFileRoute("/_authenticated/admin/bookings/$id")({
  component: BookingDetailsView,
});

function BookingDetailsView() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const fetchSingle = useServerFn(getSingleBooking);
  const runWorkflow = useServerFn(executeBookingWorkflowAction);
  const fetchStaff = useServerFn(listAssignableStaff);
  const fetchHistory = useServerFn(listBookingHistory);
  const fetchAudit = useServerFn(listBookingAudit);
  const fetchNotifications = useServerFn(listBookingNotifications);
  const triggerRetry = useServerFn(retryNotificationLog);
  const genDoc = useServerFn(generateBookingDocument);
  const fetchDocs = useServerFn(listBookingDocuments);
  const runGenerateAllPdfs = useServerFn(generateAllBookingPdfs);
  const runDeleteOldVersions = useServerFn(deleteOldDocumentVersions);
  const runResendDocEmail = useServerFn(resendDocumentEmail);

  const [noteText, setNoteText] = useState("");
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideStatusSelect, setOverrideStatusSelect] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<BookingDetailTab>("history");
  const [isRetrying, setIsRetrying] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isResending, setIsResending] = useState<string | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isQuoteSubmitting, setIsQuoteSubmitting] = useState(false);
  const triggerEditDetails = useServerFn(updateBookingDetails);

  const [editForm, setEditForm] = useState({
    origin: "",
    destination: "",
    depart_date: "",
    return_date: "",
    pax_adults: 1,
    pax_children: 0,
    pax_infants: 0,
    aircraft_preference: "",
    notes: "",
  });

  const openEdit = () => {
    if (!booking) return;
    setEditForm({
      origin: booking.origin,
      destination: booking.destination,
      depart_date: booking.depart_date,
      return_date: booking.return_date || "",
      pax_adults: booking.pax_adults,
      pax_children: booking.pax_children,
      pax_infants: booking.pax_infants,
      aircraft_preference: booking.aircraft_preference || "",
      notes: booking.notes || "",
    });
    setIsEditing(true);
  };

  const handleEditSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await triggerEditDetails({
        data: {
          id: booking!.id,
          origin: editForm.origin,
          destination: editForm.destination,
          depart_date: editForm.depart_date,
          return_date: editForm.return_date || null,
          pax_adults: editForm.pax_adults,
          pax_children: editForm.pax_children,
          pax_infants: editForm.pax_infants,
          aircraft_preference: editForm.aircraft_preference || null,
          notes: editForm.notes || null,
        },
      });
      toast.success("Booking details updated successfully");
      setIsEditing(false);
      qc.invalidateQueries({ queryKey: ["admin-booking-detail", id] });
      qc.invalidateQueries({ queryKey: ["booking-audit", id] });
      qc.invalidateQueries({ queryKey: ["booking-history", id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update booking details");
    }
  };

  const {
    data: booking,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-booking-detail", id],
    queryFn: () => fetchSingle({ data: { id } }),
  });

  const { data: staff } = useQuery({
    queryKey: ["admin-staff-list"],
    queryFn: () => fetchStaff(),
  });

  const { data: userRole } = useQuery({
    queryKey: ["current-user-role"],
    queryFn: async () => {
      try {
        const { getCurrentUserProfileServer } = await import("@/lib/user.functions");
        const me = await getCurrentUserProfileServer();
        return me?.role || "customer";
      } catch {
        return "customer";
      }
    },
  });

  const { data: history = [] } = useQuery({
    queryKey: ["booking-history", id],
    queryFn: () => fetchHistory({ data: { id } }),
  });

  const { data: audits = [] } = useQuery({
    queryKey: ["booking-audit", id],
    queryFn: () => fetchAudit({ data: { id } }),
  });

  const { data: docs } = useQuery({
    queryKey: ["booking-docs", id],
    queryFn: () => fetchDocs({ data: { id } }),
  });

  const { data: notifications, refetch: refetchNotifications } = useQuery({
    queryKey: ["booking-notifications", id],
    queryFn: () => fetchNotifications({ data: { id } }),
  });

  const { data: bookingServices } = useQuery({
    queryKey: ["booking-services", id],
    queryFn: async () => {
      try {
        const { getBookingFullDetailsServer } = await import("@/lib/bookings.functions");
        const detail = await getBookingFullDetailsServer({ data: { bookingId: id } });
        return detail?.services || [];
      } catch {
        return [];
      }
    },
  });

  const fetchManifest = useServerFn(listBookingPassengers);
  const { data: manifest = [], isLoading: loadingManifest } = useQuery({
    queryKey: ["booking-manifest", id],
    queryFn: () => fetchManifest({ data: { bookingId: id } }),
    enabled: !!id,
  });

  const handleRetryNotification = async (logId: string) => {
    setIsRetrying(logId);
    try {
      await triggerRetry({ data: { id: logId } });
      toast.success("Notification queued for resend successfully");
      refetchNotifications();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to resend notification");
    } finally {
      setIsRetrying(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5ed3ff]" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <Panel tone="dark" className="p-6 border border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <span className="text-sm font-semibold">Booking not found or failed to load.</span>
        </div>
      </Panel>
    );
  }

  const handleWorkflowAction = async (
    action: string,
    overrideStatus?: string,
    reason?: string,
    quoteAmount?: number,
  ) => {
    try {
      await runWorkflow({
        data: {
          bookingId: booking.id,
          action,
          overrideStatus,
          reason,
          quoteAmount,
        },
      });
      toast.success("Workflow action executed successfully");
      setNoteText("");
      setOverrideReason("");
      setOverrideStatusSelect("");
      setOverrideModalOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-booking-detail", id] });
      qc.invalidateQueries({ queryKey: ["booking-history", id] });
      qc.invalidateQueries({ queryKey: ["booking-audit", id] });
      qc.invalidateQueries({ queryKey: ["admin-bookings-list"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Workflow action failed");
    }
  };

  const handleSaveDraftQuote = async (
    quoteAmount: number,
    currency: string,
    _notes?: string,
    services?: Array<{ service_name: string; quantity: number; unit_price: number; currency: string }>,
  ) => {
    setIsQuoteSubmitting(true);
    try {
      const { updateBookingDetailsServer } = await import("@/lib/bookings.functions");
      await updateBookingDetailsServer({
        data: {
          bookingId: booking.id,
          updateData: {
            quote_amount: quoteAmount,
            quote_currency: currency,
            services: services || undefined,
          },
        },
      });

      toast.success("Quote draft saved successfully");
      qc.invalidateQueries({ queryKey: ["admin-booking-detail", id] });
      qc.invalidateQueries({ queryKey: ["booking-services", id] });
      setIsQuoteModalOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save draft");
    } finally {
      setIsQuoteSubmitting(false);
    }
  };

  const handleSendQuote = async (quoteAmount: number, currency: string, notes?: string) => {
    setIsQuoteSubmitting(true);
    try {
      const { updateBookingDetailsServer } = await import("@/lib/bookings.functions");
      await updateBookingDetailsServer({
        data: {
          bookingId: booking.id,
          updateData: {
            quote_amount: quoteAmount,
            quote_currency: currency,
          },
        },
      });

      const internalStatus = getBookingInternalStatus(booking);
      const targetAction = internalStatus === "NEW_BOOKING" ? "request_documents" : "request_payment";
      await handleWorkflowAction(targetAction, undefined, notes || noteText || undefined, quoteAmount);

      toast.success("Quotation generated & dispatched successfully");
      setIsQuoteModalOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send quote");
    } finally {
      setIsQuoteSubmitting(false);
    }
  };

  const handleDocGenerate = async (kind: "quotation" | "invoice" | "receipt") => {
    try {
      const amount = booking.quote_amount ? Number(booking.quote_amount) : undefined;
      await genDoc({ data: { id: booking.id, kind, amount } });
      toast.success(`${kind.toUpperCase()} generated successfully`);
      qc.invalidateQueries({ queryKey: ["booking-docs", id] });
      qc.invalidateQueries({ queryKey: ["booking-audit", id] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Document generation failed");
    }
  };

  const handleRegeneratePdfs = async () => {
    setIsRegenerating(true);
    try {
      await runGenerateAllPdfs({ data: { id } });
      toast.success("Successfully generated/updated all required PDFs.");
      qc.invalidateQueries({ queryKey: ["booking-docs", id] });
      qc.invalidateQueries({ queryKey: ["booking-audit", id] });
    } catch (e: any) {
      toast.error(e.message || "Failed to regenerate PDFs");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDeleteOldVersions = async (docType: string) => {
    setIsDeleting(docType);
    try {
      await runDeleteOldVersions({ data: { bookingId: id, documentType: docType } });
      toast.success(`Cleared old versions of ${docType}.`);
      qc.invalidateQueries({ queryKey: ["booking-docs", id] });
      qc.invalidateQueries({ queryKey: ["booking-audit", id] });
    } catch (e: any) {
      toast.error(e.message || "Failed to delete old versions");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleResendDocEmail = async (docType: string) => {
    setIsResending(docType);
    try {
      await runResendDocEmail({ data: { id, type: docType } });
      toast.success(`Re-queued email notification containing ${docType}.`);
      qc.invalidateQueries({ queryKey: ["booking-notifications", id] });
    } catch (e: any) {
      toast.error(e.message || "Failed to send email");
    } finally {
      setIsResending(null);
    }
  };

  const parsedFlights = parseFlightSnapshots(booking?.notes ?? null, booking);
  const cleanNotes = booking?.notes
    ? booking.notes
        .replace(
          /\[Flight \d Snapshot - (AUTO_VERIFIED|MANUAL_ENTRY)\][\s\S]*?(?=\[Flight \d Snapshot|$|Selected Services:|Total Service Price:)/g,
          "",
        )
        .replace(/Selected Services:[\s\S]*?(?=\r?\n\r?\n|\n\n|$)/, "")
        .replace(/Total Service Price:[\s\S]*?(?=\r?\n\r?\n|\n\n|$)/, "")
        .trim()
    : "";

  const transitHubCode =
    booking?.transit_hub ||
    booking?.metadataJson?.transit_hub ||
    booking?.metadataJson?.transit_code ||
    null;

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        to="/admin/bookings"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-white/50 hover:text-white transition-colors"
        style={pageMono}
      >
        <ArrowLeft className="h-4 w-4" /> Back to bookings
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#5ed3ff]" style={pageMono}>
            Booking Ref: {booking.booking_ref}
          </span>
          <h1 className="text-3xl font-bold mt-1" style={pageDisplay}>
            {transitHubCode ? (
              <span>
                {booking.origin} → <span className="text-[#5ed3ff]">{transitHubCode}</span> → {booking.destination}
              </span>
            ) : (
              <span>
                {booking.origin} → {booking.destination}
              </span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center px-3 py-1 text-xs uppercase tracking-wider font-semibold ${getStatusBadgeClass(getBookingInternalStatus(booking))}`}
          >
            {getBookingInternalStatus(booking).replace(/_/g, " ")}
          </span>
          <span
            className={`inline-flex items-center px-3 py-1 text-xs uppercase tracking-wider font-semibold ${
              booking.verification_type === "AUTO_VERIFIED"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
            }`}
          >
            {booking.verification_type === "AUTO_VERIFIED" ? "Auto Verified" : "Manual Fallback"}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Flight & Travel Info */}
          <Panel tone="dark" className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-xs uppercase tracking-widest text-white/40 font-mono">
                Travel Details
              </h3>
              {!isEditing && (
                <button
                  onClick={openEdit}
                  className="text-[#5ed3ff] hover:underline text-[10px] uppercase font-semibold tracking-wider"
                  style={pageMono}
                >
                  + Edit Booking Details
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/45 font-mono block">
                      Origin
                    </label>
                    <input
                      type="text"
                      value={editForm.origin}
                      onChange={(e) => setEditForm({ ...editForm, origin: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none text-white focus:border-[#5ed3ff]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/45 font-mono block">
                      Destination
                    </label>
                    <input
                      type="text"
                      value={editForm.destination}
                      onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none text-white focus:border-[#5ed3ff]"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/45 font-mono block">
                      Departure Date & Time
                    </label>
                    <input
                      type="text"
                      value={editForm.depart_date}
                      onChange={(e) => setEditForm({ ...editForm, depart_date: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none text-white focus:border-[#5ed3ff]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/45 font-mono block">
                      Return Date & Time (Optional)
                    </label>
                    <input
                      type="text"
                      value={editForm.return_date}
                      onChange={(e) => setEditForm({ ...editForm, return_date: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none text-white focus:border-[#5ed3ff]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/45 font-mono block">
                      Adults
                    </label>
                    <input
                      type="number"
                      value={editForm.pax_adults}
                      onChange={(e) =>
                        setEditForm({ ...editForm, pax_adults: Number(e.target.value) })
                      }
                      className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none text-white focus:border-[#5ed3ff]"
                      min={1}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/45 font-mono block">
                      Children
                    </label>
                    <input
                      type="number"
                      value={editForm.pax_children}
                      onChange={(e) =>
                        setEditForm({ ...editForm, pax_children: Number(e.target.value) })
                      }
                      className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none text-white focus:border-[#5ed3ff]"
                      min={0}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/45 font-mono block">
                      Infants
                    </label>
                    <input
                      type="number"
                      value={editForm.pax_infants}
                      onChange={(e) =>
                        setEditForm({ ...editForm, pax_infants: Number(e.target.value) })
                      }
                      className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none text-white focus:border-[#5ed3ff]"
                      min={0}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-white/45 font-mono block">
                    Aircraft Preference (Optional)
                  </label>
                  <input
                    type="text"
                    value={editForm.aircraft_preference}
                    onChange={(e) =>
                      setEditForm({ ...editForm, aircraft_preference: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs outline-none text-white focus:border-[#5ed3ff]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-white/45 font-mono block">
                    Special Requests & Flight Snapshot
                  </label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={4}
                    className="w-full bg-black/40 border border-white/10 p-2.5 text-xs outline-none text-white focus:border-[#5ed3ff]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-white/10 hover:bg-white/5 uppercase text-[10px] font-semibold tracking-wider text-white/60"
                    style={pageMono}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#5ed3ff] hover:bg-[#5ed3ff]/90 text-black uppercase text-[10px] font-semibold tracking-wider font-bold"
                    style={pageMono}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="grid md:grid-cols-3 gap-6 text-xs">
                  <div className="space-y-1">
                    <span className="text-white/40 block">Departure Date & Time</span>
                    <span className="font-semibold text-white/90">{booking.depart_date}</span>
                  </div>
                  {booking.return_date && (
                    <div className="space-y-1">
                      <span className="text-white/40 block">Return Date & Time</span>
                      <span className="font-semibold text-white/90">{booking.return_date}</span>
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="text-white/40 block">Trip Type</span>
                    <span className="font-semibold text-white/90 uppercase">
                      {booking.trip_type}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-white/40 block">Passengers Breakdown</span>
                    <span className="font-semibold text-white/90">
                      {booking.pax_adults} Adult(s) · {booking.pax_children} Child ·{" "}
                      {booking.pax_infants} Infant
                    </span>
                  </div>
                  {booking.aircraft_preference && (
                    <div className="space-y-1">
                      <span className="text-white/40 block">Aircraft Preference</span>
                      <span className="font-semibold text-white/90">
                        {booking.aircraft_preference}
                      </span>
                    </div>
                  )}
                  {booking.service_type && (
                    <div className="space-y-1">
                      <span className="text-white/40 block">Service Category</span>
                      <span className="font-semibold text-[#5ed3ff]">{booking.service_type}</span>
                    </div>
                  )}
                </div>

                {/* On-board Meal Arrangement Details (Admin Portal) */}
                <BookingMealArrangementSection booking={booking} />

                {parsedFlights.length > 0 && (
                  <div className="pt-4 border-t border-white/5 space-y-3.5">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono block">
                      Flight Verification Details
                    </span>
                    <div className="grid md:grid-cols-2 gap-4">
                      {parsedFlights.map((f) => (
                        <div
                          key={f.segment}
                          className="border border-white/10 bg-[#090d16]/30 p-4 rounded-xl space-y-3.5 relative overflow-hidden"
                        >
                          <div className="absolute top-2 right-2">
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-semibold rounded ${
                                f.isManual
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              }`}
                              style={pageMono}
                            >
                              {f.isManual ? "Manual Fallback" : "Auto Verified"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Plane className="h-4 w-4 text-[#5ed3ff]" />
                            <span className="font-mono text-xs font-bold text-white tracking-widest">
                              {f.flightNum}
                            </span>
                            <span className="text-[10px] text-white/40">({f.airline})</span>
                          </div>

                          <div className="flex justify-between items-center text-xs pt-1">
                            <div>
                              <span className="text-white/40 text-[9px] block">Departure</span>
                              <span className="font-semibold text-white/90">{f.origin}</span>
                              <span className="text-[10px] text-white/50 block font-mono mt-0.5">
                                {f.departDate} · {f.departTime}
                              </span>
                            </div>
                            <div className="text-center text-white/30 text-[10px] px-2 font-mono">
                              →
                            </div>
                            <div className="text-right">
                              <span className="text-white/40 text-[9px] block">Arrival</span>
                              <span className="font-semibold text-white/90">{f.destination}</span>
                              {f.arrivalDateTime && (
                                <span className="text-[10px] text-white/50 block font-mono mt-0.5">
                                  {f.arrivalDateTime}
                                </span>
                              )}
                            </div>
                          </div>

                          {(f.terminals || f.arrivalDateTime) && (
                            <div className="text-[9px] text-white/40 font-mono border-t border-white/5 pt-2 flex justify-between">
                              <span>{f.terminals || "Terminal Details: N/A"}</span>
                              {f.arrivalDateTime && (
                                <span>Scheduled Arrival: {f.arrivalDateTime}</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cleanNotes && (
                  <div className="pt-4 border-t border-white/5 space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono block">
                      Special Requests
                    </span>
                    <pre className="bg-black/30 border border-white/5 p-4 rounded text-[11px] font-mono text-white/70 whitespace-pre-wrap leading-relaxed">
                      {cleanNotes}
                    </pre>
                  </div>
                )}
              </>
            )}
          </Panel>

          {/* Passenger Manifest Section */}
          <BookingPassengerManifestPanel
            manifest={manifest}
            loadingManifest={loadingManifest}
          />

          {/* Selected Relational Airport Services */}
          <BookingSelectedServicesPanel booking={booking} />

          {/* Tabbed Info Deck */}
          <BookingTabbedInfoDeck
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            history={history ?? []}
            notifications={notifications ?? []}
            isRetrying={isRetrying}
            handleRetryNotification={handleRetryNotification}
            audits={audits ?? []}
            docs={docs ?? []}
            isRegenerating={isRegenerating}
            handleRegeneratePdfs={handleRegeneratePdfs}
            isResending={isResending}
            handleResendDocEmail={handleResendDocEmail}
            isDeleting={isDeleting}
            handleDeleteOldVersions={handleDeleteOldVersions}
          />
        </div>

        {/* RIGHT COLUMN (1/3 width) */}
        <BookingRightColumnPanels
          booking={booking}
          staff={staff}
          noteText={noteText}
          setNoteText={setNoteText}
          setIsQuoteModalOpen={setIsQuoteModalOpen}
          userRole={userRole}
          handleWorkflowAction={handleWorkflowAction}
          setOverrideModalOpen={setOverrideModalOpen}
          docs={docs}
          handleDocGenerate={handleDocGenerate}
        />
      </div>

      {/* Super Admin Override Modal */}
      <BookingSuperAdminOverrideModal
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        overrideStatusSelect={overrideStatusSelect}
        setOverrideStatusSelect={setOverrideStatusSelect}
        overrideReason={overrideReason}
        setOverrideReason={setOverrideReason}
        onApplyOverride={async () => {
          await handleWorkflowAction(
            "override_status",
            overrideStatusSelect,
            overrideReason,
          );
        }}
      />

      {/* Enterprise Quote Builder Modal */}
      {booking && (
        <QuoteBuilderModal
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
          booking={booking}
          existingServices={bookingServices || []}
          onSaveDraft={handleSaveDraftQuote}
          onSendQuote={handleSendQuote}
          isSubmitting={isQuoteSubmitting}
        />
      )}
    </div>
  );
}
