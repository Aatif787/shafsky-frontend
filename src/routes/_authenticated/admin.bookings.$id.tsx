import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSingleBooking,
  executeBookingWorkflowAction,
  getBookingInternalStatus,
  WORKFLOW_ACTIONS,
  listAssignableStaff,
  listBookingHistory,
  listBookingAudit,
  updateBookingDetails,
  listBookingNotifications,
  retryNotificationLog,
} from "@/lib/bookings.functions";
import { generateBookingDocument, listBookingDocuments, generateAllBookingPdfs, deleteOldDocumentVersions, resendDocumentEmail } from "@/lib/booking-documents.functions";
import { listBookingPassengers } from "@/lib/passengers.functions";
import { pageMono, pageDisplay, Panel } from "@/components/site/PageShell";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];
import {
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  User,
  Plus,
  History,
  ShieldCheck,
  Plane,
  AlertCircle,
  Eye,
  Download,
  RefreshCw,
  Send,
  Trash2,
  Calculator,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { QuoteBuilderModal } from "@/components/admin/QuoteBuilderModal";

export const Route = createFileRoute("/_authenticated/admin/bookings/$id")({
  component: BookingDetailsView,
});

const WORKFLOW_STATUSES = [
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

function getStatusBadgeClass(status: string): string {
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

interface ParsedFlight {
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

function parseFlightSnapshots(notes: string | null): ParsedFlight[] {
  if (!notes) return [];
  const segments: ParsedFlight[] = [];

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

  return segments;
}

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
  const [activeTab, setActiveTab] = useState<"history" | "notifications" | "audits" | "documents">("history");
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

  const handleEditSubmit = async (e: React.FormEvent) => {
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

  const { data: docs, refetch: refetchDocs } = useQuery({
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

  const parsedFlights = parseFlightSnapshots(booking.notes ?? null);
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
            {booking.origin} → {booking.destination}
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

          {/* Selected Relational Airport Services */}
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

          {/* Tabbed Info Deck */}
          <Panel tone="dark" className="p-6 space-y-6">
            {/* Tab Header Selector */}
            <div className="flex border-b border-white/10 gap-6">
              <button
                onClick={() => setActiveTab("history")}
                className={`pb-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 outline-none ${
                  activeTab === "history"
                    ? "border-[#5ed3ff] text-[#5ed3ff]"
                    : "border-transparent text-white/40 hover:text-white"
                }`}
                style={pageMono}
              >
                Journey Timeline
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`pb-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 outline-none ${
                  activeTab === "notifications"
                    ? "border-[#5ed3ff] text-[#5ed3ff]"
                    : "border-transparent text-white/40 hover:text-white"
                }`}
                style={pageMono}
              >
                Notification History
              </button>
              <button
                onClick={() => setActiveTab("audits")}
                className={`pb-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 outline-none ${
                  activeTab === "audits"
                    ? "border-[#5ed3ff] text-[#5ed3ff]"
                    : "border-transparent text-white/40 hover:text-white"
                }`}
                style={pageMono}
              >
                System Audit Logs
              </button>
              <button
                onClick={() => setActiveTab("documents")}
                className={`pb-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 outline-none ${
                  activeTab === "documents"
                    ? "border-[#5ed3ff] text-[#5ed3ff]"
                    : "border-transparent text-white/40 hover:text-white"
                }`}
                style={pageMono}
              >
                Document Engine
              </button>
            </div>

            {/* Tab content */}
            {activeTab === "history" && (
              <div className="space-y-4">
                <ol className="space-y-4 text-xs">
                  {(history ?? []).map((h) => (
                    <li
                      key={h.id}
                      className="flex gap-4 border-l border-white/10 pl-4 py-1 relative"
                    >
                      <div className="absolute left-[-4.5px] top-2 h-2 w-2 rounded-full bg-[#5ed3ff]" />
                      <div className="min-w-0 flex-1">
                        <div
                          className="flex justify-between items-center text-[10px] text-white/40"
                          style={pageMono}
                        >
                          <span>{new Date(h.created_at || Date.now()).toLocaleString()}</span>
                          <span>By: {h.actor_id || "System"}</span>
                        </div>
                        <div className="mt-1 text-white/80">
                          Changed status from{" "}
                          <span className="text-white/45">{h.from_status || "—"}</span> to{" "}
                          <span className="text-[#5ed3ff] font-semibold">{h.to_status}</span>
                        </div>
                        {h.note && (
                          <p className="mt-1.5 text-xs text-white/60 bg-white/[0.02] border border-white/5 p-2 rounded italic">
                            "{h.note}"
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                  {(history ?? []).length === 0 && (
                    <div className="text-center py-6 text-white/30 text-xs">
                      No status logs recorded.
                    </div>
                  )}
                </ol>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {(notifications ?? []).map((n) => (
                    <div
                      key={n.id}
                      className="border border-white/5 bg-white/[0.01] p-4 rounded text-xs space-y-3"
                    >
                      <div
                        className="flex justify-between items-center text-[10px] text-white/40"
                        style={pageMono}
                      >
                        <span>{new Date(n.created_at || Date.now()).toLocaleString()}</span>
                        <span
                          className={`uppercase font-semibold tracking-wider ${
                            n.status === "failed"
                              ? "text-red-400"
                              : n.status === "sent"
                                ? "text-emerald-400"
                                : "text-amber-400"
                          }`}
                        >
                          {n.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div
                            className="font-semibold text-white uppercase text-[10px] tracking-wider"
                            style={pageMono}
                          >
                            {n.channel} · {n.template}
                          </div>
                          <div className="text-white/60 font-mono text-[10px] mt-0.5">
                            {n.recipient}
                          </div>
                          {n.subject && (
                            <div className="text-xs font-semibold text-white/80 mt-1.5">
                              {n.subject}
                            </div>
                          )}
                          <p className="text-xs text-white/50 mt-1 line-clamp-3 leading-relaxed max-w-xl whitespace-pre-wrap">
                            {n.body}
                          </p>
                          {n.error_message && (
                            <p className="text-[10px] text-red-400 mt-2 bg-red-500/5 p-2 rounded border border-red-500/10 font-mono">
                              Error: {n.error_message}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRetryNotification(n.id)}
                          disabled={isRetrying === n.id}
                          className="shrink-0 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-[9px] uppercase tracking-wider font-semibold border border-white/10 transition-colors disabled:opacity-40"
                          style={pageMono}
                        >
                          {isRetrying === n.id ? "Queuing..." : "Resend"}
                        </button>
                      </div>
                    </div>
                  ))}
                  {(notifications ?? []).length === 0 && (
                    <div className="text-center py-6 text-white/30 text-xs">
                      No notifications sent or logged for this booking.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "audits" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {(audits ?? []).map((a) => (
                    <div
                      key={a.id}
                      className="border border-white/5 bg-white/[0.01] p-4 rounded text-xs space-y-2"
                    >
                      <div
                        className="flex justify-between items-center text-[10px] text-white/40"
                        style={pageMono}
                      >
                        <span>{new Date(a.created_at || Date.now()).toLocaleString()}</span>
                        <span>IP: {a.metadata?.ip || "System"}</span>
                      </div>
                      <div className="text-white/80">
                        Action <span className="text-[#5ed3ff] font-mono">{a.action}</span> executed
                        by <span className="font-mono text-white/50">{a.actor_id || "System"}</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[10px] font-mono">
                        <div>
                          <span className="text-white/30 block text-[8px] uppercase tracking-wider mb-1">
                            State Before
                          </span>
                          <pre className="bg-black/25 p-2 rounded max-h-24 overflow-y-auto text-red-400/90 whitespace-pre-wrap">
                            {a.metadata?.before
                              ? JSON.stringify(a.metadata.before, null, 2)
                              : "NULL"}
                          </pre>
                        </div>
                        <div>
                          <span className="text-white/30 block text-[8px] uppercase tracking-wider mb-1">
                            State After
                          </span>
                          <pre className="bg-black/25 p-2 rounded max-h-24 overflow-y-auto text-emerald-400/90 whitespace-pre-wrap">
                            {a.metadata?.after ? JSON.stringify(a.metadata.after, null, 2) : "NULL"}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(audits ?? []).length === 0 && (
                    <div className="text-center py-6 text-white/30 text-xs">
                      No system audit ledger entries found.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 p-4 border border-white/10 rounded gap-4">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                      Enterprise PDF Generation Engine
                    </h4>
                    <p className="text-xs text-white/50 mt-1 max-w-xl">
                      Shafsky Aviation Services's luxury document engine generates print-ready PDFs with Code128 barcodes and security verification QR codes.
                    </p>
                  </div>
                  <button
                    onClick={handleRegeneratePdfs}
                    disabled={isRegenerating}
                    className="flex items-center gap-2 px-3 py-2 bg-[#5ed3ff]/10 hover:bg-[#5ed3ff]/20 text-[#5ed3ff] border border-[#5ed3ff]/30 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-40"
                    style={pageMono}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
                    {isRegenerating ? "Regenerating..." : "Regenerate All"}
                  </button>
                </div>

                <div className="space-y-4">
                  {(() => {
                    const latestDocsMap = new Map();
                    const docVersionCounts: Record<string, number> = {};
                    for (const d of docs || []) {
                      const type = d.document_type || d.kind;
                      docVersionCounts[type] = (docVersionCounts[type] || 0) + 1;
                      if (!latestDocsMap.has(type)) {
                        latestDocsMap.set(type, d);
                      }
                    }
                    const latestDocs = Array.from(latestDocsMap.values());

                    if (latestDocs.length === 0) {
                      return (
                        <div className="text-center py-10 border border-dashed border-white/10 rounded">
                          <p className="text-sm text-white/30">No documents generated yet.</p>
                          <p className="text-xs text-white/20 mt-1">Click the Regenerate button to trigger automated generation.</p>
                        </div>
                      );
                    }

                    const formatDocTypeLabel = (type: string) => {
                      return type
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase());
                    };

                    return (
                      <div className="border border-white/10 rounded overflow-hidden">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-white/5 text-white/40 uppercase tracking-widest text-[9px] font-mono border-b border-white/10">
                              <th className="p-4">Document Type</th>
                              <th className="p-4">Filename</th>
                              <th className="p-4">Version</th>
                              <th className="p-4">Checksum</th>
                              <th className="p-4">Created At</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 bg-white/[0.01]">
                            {latestDocs.map((d: any) => {
                              const typeKey = d.document_type || d.kind;
                              const versionCount = docVersionCounts[typeKey] || 1;
                              const displayChecksum = d.checksum ? d.checksum.substring(0, 8) : "N/A";
                              return (
                                <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="p-4 font-semibold text-white/95">
                                    {formatDocTypeLabel(typeKey)}
                                  </td>
                                  <td className="p-4 text-white/60 font-mono text-[11px] truncate max-w-[200px]">
                                    {d.filename || `${d.kind}.pdf`}
                                  </td>
                                  <td className="p-4 font-mono text-teal-400">
                                    v{d.version || 1}
                                  </td>
                                  <td className="p-4 text-white/40 font-mono text-[11px]">
                                    {displayChecksum}
                                  </td>
                                  <td className="p-4 text-white/45">
                                    {new Date(d.created_at).toLocaleString()}
                                  </td>
                                  <td className="p-4 text-right space-x-2">
                                    <a
                                      href={d.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded transition-colors text-[10px]"
                                    >
                                      <Eye className="w-3 h-3" />
                                      View
                                    </a>
                                    <button
                                      onClick={() => handleResendDocEmail(typeKey)}
                                      disabled={isResending === typeKey}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded transition-colors text-[10px] disabled:opacity-40"
                                    >
                                      <Send className={`w-3 h-3 ${isResending === typeKey ? "animate-pulse" : ""}`} />
                                      {isResending === typeKey ? "Sending..." : "Send Email"}
                                    </button>
                                    {versionCount > 1 && (
                                      <button
                                        onClick={() => handleDeleteOldVersions(typeKey)}
                                        disabled={isDeleting === typeKey}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded transition-colors text-[10px] disabled:opacity-40"
                                      >
                                        <Trash2 className={`w-3 h-3 ${isDeleting === typeKey ? "animate-spin" : ""}`} />
                                        Clear History
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </Panel>
        </div>

        {/* RIGHT COLUMN (1/3 width) */}
        <div className="space-y-6">
          {/* Actions & Assignments */}
          <Panel tone="dark" className="p-6 space-y-6">
            <h3 className="text-xs uppercase tracking-widest text-white/40 font-mono">
              Operations Deck
            </h3>

            {/* Assignment */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono block">
                Assigned Coordinator
              </span>
              <div className="text-xs font-mono font-medium text-white/80 bg-[#0c121b] border border-white/10 px-3 py-2">
                {(() => {
                  const assignedToId = booking.assigned_to;
                  if (!assignedToId) return "Unassigned";
                  const member = (staff ?? []).find((s) => s.id === assignedToId);
                  if (!member) return "Admin";
                  return member.roles?.includes("super_admin") ? "Super Admin" : "Admin";
                })()}
              </div>
            </div>

            {/* Operations Deck Workflow Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono block">
                Workflow Control Center
              </span>
              <textarea
                placeholder="Internal transition log note / reason (optional)..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={2}
                className="w-full bg-transparent border border-white/10 p-2 text-xs outline-none focus:border-[#5ed3ff] text-white"
              />

              <div className="flex flex-col gap-2">
                {/* Contextual Action Buttons */}
                {/* Enterprise Quote Builder Action Button */}
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="w-full py-2.5 px-3 bg-[#5ed3ff]/15 hover:bg-[#5ed3ff]/25 text-[#5ed3ff] border border-[#5ed3ff]/30 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer mb-2 flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4" /> Enterprise Quote Builder
                </button>

                {(() => {
                  const internalStatus = getBookingInternalStatus(booking);
                  const actions = [];

                  // Filter valid actions for current state
                  for (const [actionName, config] of Object.entries(WORKFLOW_ACTIONS)) {
                    if (config.from.includes(internalStatus)) {
                      if (actionName === "approve_refund" && userRole !== "super_admin") {
                        continue;
                      }
                      actions.push({ name: actionName, ...config });
                    }
                  }

                  if (actions.length === 0) {
                    return (
                      <div className="text-[10px] text-white/30 italic">
                        No standard actions available for this terminal status.
                      </div>
                    );
                  }

                  return actions.map((act) => {
                    const isCritical = [
                      "cancel_booking",
                      "reject_booking",
                      "approve_refund",
                      "reject_refund",
                    ].includes(act.name);
                    const btnClass = isCritical
                      ? "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                      : "bg-[#5ed3ff]/10 border border-[#5ed3ff]/20 text-[#5ed3ff] hover:bg-[#5ed3ff]/20";

                    return (
                      <button
                        key={act.name}
                        onClick={async () => {
                          if (act.name === "request_payment") {
                            setIsQuoteModalOpen(true);
                            return;
                          }

                          if (isCritical) {
                            if (
                              confirm(
                                `Are you sure you want to perform critical action: ${act.label}?`,
                              )
                            ) {
                              await handleWorkflowAction(
                                act.name,
                                undefined,
                                noteText || undefined,
                              );
                            }
                          } else {
                            await handleWorkflowAction(
                              act.name,
                              undefined,
                              noteText || undefined,
                            );
                          }
                        }}
                        className={`w-full py-2 px-3 text-xs uppercase font-mono font-semibold tracking-wider transition-colors duration-150 cursor-pointer ${btnClass}`}
                      >
                        {act.label}
                      </button>
                    );
                  });
                })()}

                {/* Super Admin Override Button */}
                {userRole === "super_admin" && (
                  <button
                    onClick={() => setOverrideModalOpen(true)}
                    className="w-full py-2 px-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer mt-2"
                  >
                    ⚠ Super Admin Override
                  </button>
                )}
              </div>
            </div>
          </Panel>

          {/* Contact Details / Customer Dossier */}
          {booking.customer_profile ? (
            <Panel tone="dark" className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs uppercase tracking-widest text-white/40 font-mono">
                  Customer Dossier
                </h3>
                <span
                  className="inline-flex items-center gap-1 text-[8px] uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
                  style={pageMono}
                >
                  Registered User
                </span>
              </div>
              <div className="text-xs space-y-3.5">
                <div>
                  <span className="text-white/40 block">Account Name</span>
                  <span className="font-semibold text-white/90">
                    {booking.customer_profile.full_name || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block">Email / Username</span>
                  <span className="font-semibold text-white/90 font-mono">
                    {booking.customer_profile.id}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block">Phone Contact</span>
                  <span className="font-semibold text-white/90 font-mono">
                    {booking.customer_profile.phone || booking.contact_phone}
                  </span>
                </div>
                {(booking.customer_profile?.company || booking.company) && (
                  <div>
                    <span className="text-white/40 block">Company Affiliate</span>
                    <span className="font-semibold text-white/90">
                      {booking.customer_profile?.company || booking.company}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/5">
                  <Link
                    to="/admin/customers"
                    search={{
                      search: booking.contact_email,
                      selectedId: booking.user_id || undefined,
                    }}
                    className="text-[#5ed3ff] hover:underline uppercase text-[9px] tracking-wider font-semibold font-mono flex items-center justify-between"
                  >
                    <span>View CRM dossier</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </Panel>
          ) : (
            <Panel tone="dark" className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs uppercase tracking-widest text-white/40 font-mono">
                  Contact Information
                </h3>
                <span
                  className="inline-flex items-center gap-1 text-[8px] uppercase px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/10 font-semibold"
                  style={pageMono}
                >
                  Guest Checkout
                </span>
              </div>
              <div className="text-xs space-y-3.5">
                <div>
                  <span className="text-white/40 block">Primary Contact</span>
                  <span className="font-semibold text-white/90">{booking.contact_name}</span>
                </div>
                <div>
                  <span className="text-white/40 block">Email Address</span>
                  <span className="font-semibold text-white/90 font-mono">
                    {booking.contact_email}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block">Phone Number</span>
                  <span className="font-semibold text-[#5ed3ff] font-mono">
                    {booking.contact_phone}
                  </span>
                </div>
                {booking.company && (
                  <div>
                    <span className="text-white/40 block">Company / Agency</span>
                    <span className="font-semibold text-white/90">{booking.company}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/5">
                  <Link
                    to="/admin/customers"
                    search={{
                      search: booking.contact_email,
                      selectedId: `guest_${booking.contact_email}`,
                    }}
                    className="text-[#5ed3ff] hover:underline uppercase text-[9px] tracking-wider font-semibold font-mono flex items-center justify-between"
                  >
                    <span>View CRM dossier</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </Panel>
          )}

          {/* Documents generated */}
          <Panel tone="dark" className="p-6 space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-white/40 font-mono">
              Document Deck
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => handleDocGenerate("quotation")}
                className="flex-1 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] uppercase tracking-wider font-semibold"
                style={pageMono}
              >
                + Quote
              </button>
              <button
                onClick={() => handleDocGenerate("invoice")}
                className="flex-1 py-1.5 bg-[#5ed3ff]/10 border border-[#5ed3ff]/20 hover:bg-[#5ed3ff]/15 text-[9px] uppercase tracking-wider font-semibold text-[#5ed3ff]"
                style={pageMono}
              >
                + Invoice
              </button>
              <button
                onClick={() => handleDocGenerate("receipt")}
                className="flex-1 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] uppercase tracking-wider font-semibold"
                style={pageMono}
              >
                + Receipt
              </button>
            </div>

            <ul className="space-y-2 text-xs">
              {(docs ?? []).map((d: any) => (
                <li
                  key={d.id}
                  className="border border-white/15 px-3 py-2 flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold uppercase text-white/90">{d.kind}</div>
                    <div className="text-[10px] text-white/45 mt-0.5">
                      {d.amount
                        ? `${d.currency} ${Number(d.amount).toLocaleString()}`
                        : "No Amount"}
                    </div>
                  </div>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#5ed3ff] text-[10px] uppercase font-semibold hover:underline"
                    style={pageMono}
                  >
                    Get ↓
                  </a>
                </li>
              ))}
              {(docs ?? []).length === 0 && (
                <div className="text-center py-4 text-white/30 text-[11px]">
                  No official documents generated yet.
                </div>
              )}
            </ul>
          </Panel>
        </div>
      </div>

      {/* Super Admin Override Modal */}
      {overrideModalOpen && (
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
                onClick={() => setOverrideModalOpen(false)}
                className="px-3 py-1.5 border border-white/10 text-xs font-mono text-white/60 hover:text-white hover:bg-white/5 uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!overrideStatusSelect || !overrideReason.trim()}
                onClick={async () => {
                  await handleWorkflowAction(
                    "override_status",
                    overrideStatusSelect,
                    overrideReason,
                  );
                }}
                className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-400 hover:bg-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider cursor-pointer"
              >
                Apply Override
              </button>
            </div>
          </div>
        </div>
      )}

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
