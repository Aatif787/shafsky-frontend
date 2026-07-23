import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  listAllBookings,
  listAssignableStaff,
  executeBookingWorkflowAction,
  getBookingInternalStatus,
} from "@/lib/bookings.functions";
import { supabase } from "@/integrations/supabase/client";
import { pageMono, pageDisplay, Panel } from "@/components/site/PageShell";
import { Loader2, AlertTriangle, Search, Eye, Calendar, MapPin, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

export const Route = createFileRoute("/_authenticated/admin/bookings")({
  component: BookingsManagerView,
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

function getBookingPriority(departDateStr: string): { label: string; color: string } {
  try {
    const departDate = new Date(departDateStr);
    const now = new Date();
    const diffHours = (departDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours < 0)
      return { label: "PAST", color: "bg-white/5 text-white/30 border border-white/5" };
    if (diffHours <= 24)
      return {
        label: "CRITICAL",
        color: "bg-red-500/20 text-red-400 border border-red-500/30 font-semibold",
      };
    if (diffHours <= 72)
      return {
        label: "HIGH",
        color: "bg-orange-500/15 text-orange-400 border border-orange-500/25",
      };
    return { label: "STANDARD", color: "bg-blue-500/10 text-blue-400 border border-blue-500/20" };
  } catch {
    return { label: "STANDARD", color: "bg-blue-500/10 text-blue-400 border border-blue-500/20" };
  }
}

function getPaymentStatus(internalStatus: string): { label: string; color: string } {
  switch (internalStatus) {
    case "PAYMENT_VERIFIED":
    case "CONFIRMED":
    case "CHECKED_IN":
    case "COMPLETED":
      return {
        label: "PAID",
        color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      };
    case "PAYMENT_PENDING":
      return {
        label: "PENDING",
        color: "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse",
      };
    case "REFUND_REQUESTED":
    case "REFUND_APPROVED":
      return {
        label: "REFUND PEND",
        color: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
      };
    case "REFUNDED":
      return { label: "REFUNDED", color: "bg-white/10 text-white/40 border border-white/10" };
    default:
      return { label: "UNPAID", color: "bg-red-500/10 text-red-400 border border-red-500/20" };
  }
}

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

function BookingsManagerView() {
  const fetchBookings = useServerFn(listAllBookings);
  const fetchStaff = useServerFn(listAssignableStaff);
  const runWorkflow = useServerFn(executeBookingWorkflowAction);
  const qc = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [checkoutFilter, setCheckoutFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [confirmModal, setConfirmModal] = useState<{
    bookingId: string;
    action: string;
    label: string;
  } | null>(null);

  const {
    data: bookings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-bookings-list"],
    queryFn: () => fetchBookings(),
  });

  const { data: staff } = useQuery({
    queryKey: ["admin-staff-list"],
    queryFn: () => fetchStaff(),
  });

  const { data: userRole } = useQuery({
    queryKey: ["current-user-role"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return "customer";
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      return data?.role || "customer";
    },
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, statusFilter, verificationFilter, checkoutFilter]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5ed3ff]" />
      </div>
    );
  }

  if (error || !bookings) {
    return (
      <Panel tone="dark" className="p-6 border border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <span className="text-sm font-semibold">Failed to load bookings list.</span>
        </div>
      </Panel>
    );
  }

  // Filtering
  const filtered = bookings.filter((b) => {
    const internalStatus = getBookingInternalStatus(b);
    const matchesSearch =
      b.contact_name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      b.contact_email.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      b.booking_ref.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      b.origin.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      b.destination.toLowerCase().includes(debouncedQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || internalStatus === statusFilter;

    const matchesVerification =
      verificationFilter === "all" || b.verification_type === verificationFilter;

    const matchesCheckout =
      checkoutFilter === "all" ||
      (checkoutFilter === "guest" && !b.user_id) ||
      (checkoutFilter === "member" && b.user_id);

    return matchesSearch && matchesStatus && matchesVerification && matchesCheckout;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getAssigneeRoleDisplay = (assignedToId: string | null) => {
    if (!assignedToId) return "Unassigned";
    const member = (staff ?? []).find((s) => s.id === assignedToId);
    if (!member) return "Admin";
    return member.roles.includes("super_admin") ? "Super Admin" : "Admin";
  };

  const handleWorkflowAction = async (bookingId: string, action: string) => {
    try {
      await runWorkflow({ data: { bookingId, action } });
      toast.success("Workflow action executed successfully");
      qc.invalidateQueries({ queryKey: ["admin-bookings-list"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Workflow action failed");
    }
  };

  const triggerWorkflowWithVerify = (bookingId: string, action: string, label: string) => {
    const isCritical = [
      "cancel_booking",
      "reject_booking",
      "approve_refund",
      "reject_refund",
    ].includes(action);
    if (isCritical) {
      setConfirmModal({ bookingId, action, label });
    } else {
      handleWorkflowAction(bookingId, action);
    }
  };

  const getRowPrimaryAction = (b: any) => {
    const internalStatus = getBookingInternalStatus(b);
    switch (internalStatus) {
      case "NEW_BOOKING":
        return {
          label: "Start Review",
          action: "start_review",
          style: "bg-[#5ed3ff]/10 text-[#5ed3ff] border border-[#5ed3ff]/20 hover:bg-[#5ed3ff]/20",
        };
      case "PAYMENT_PENDING":
        return {
          label: "Verify Payment",
          action: "verify_payment",
          style:
            "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20",
        };
      case "PAYMENT_VERIFIED":
        return {
          label: "Confirm",
          action: "confirm_booking",
          style:
            "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20",
        };
      case "CONFIRMED":
        return {
          label: "Check In",
          action: "check_in",
          style: "bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20",
        };
      case "CHECKED_IN":
        return {
          label: "Complete",
          action: "complete_booking",
          style:
            "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20",
        };
      case "REFUND_REQUESTED":
        if (userRole === "super_admin") {
          return {
            label: "Approve Refund",
            action: "approve_refund",
            style:
              "bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30",
          };
        }
        return null;
      case "REFUND_APPROVED":
        return {
          label: "Complete Refund",
          action: "complete_refund",
          style:
            "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20",
        };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold leading-tight" style={pageDisplay}>
          Bookings <em className="text-[#5ed3ff]">Management.</em>
        </h1>
        <p className="text-xs text-white/50 uppercase tracking-widest mt-1" style={pageMono}>
          Enterprise aviation booking workflow engine
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="grid md:grid-cols-4 gap-4 bg-white/[0.02] border border-white/10 p-5">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ref, route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border border-white/10 px-3 py-2 pl-8 text-xs outline-none focus:border-[#5ed3ff] text-white"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-white/30" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
            Operational Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#0c121b] border border-white/10 px-3 py-2 text-xs outline-none focus:border-[#5ed3ff] text-white/70"
            style={{ colorScheme: "dark" }}
          >
            <option value="all" className="bg-[#0c121b] text-white">
              All Statuses
            </option>
            {WORKFLOW_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-[#0c121b] text-white">
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
            Verification
          </label>
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="w-full bg-[#0c121b] border border-white/10 px-3 py-2 text-xs outline-none focus:border-[#5ed3ff] text-white/70"
            style={{ colorScheme: "dark" }}
          >
            <option value="all" className="bg-[#0c121b] text-white">
              All Verification
            </option>
            <option value="AUTO_VERIFIED" className="bg-[#0c121b] text-white">
              AUTO VERIFIED
            </option>
            <option value="MANUAL_ENTRY" className="bg-[#0c121b] text-white">
              MANUAL FALLBACK
            </option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
            Checkout Type
          </label>
          <select
            value={checkoutFilter}
            onChange={(e) => setCheckoutFilter(e.target.value)}
            className="w-full bg-[#0c121b] border border-white/10 px-3 py-2 text-xs outline-none focus:border-[#5ed3ff] text-white/70"
            style={{ colorScheme: "dark" }}
          >
            <option value="all" className="bg-[#0c121b] text-white">
              All Checkouts
            </option>
            <option value="guest" className="bg-[#0c121b] text-white">
              GUEST CHECKOUT
            </option>
            <option value="member" className="bg-[#0c121b] text-white">
              MEMBER ACCOUNTS
            </option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="border border-white/10 overflow-x-auto bg-[#090d16]/30">
        <table className="w-full text-xs text-left min-w-[1200px]">
          <thead className="text-[10px] uppercase tracking-[0.2em] text-white/40 border-b border-white/10 bg-white/[0.01]">
            <tr>
              <th className="p-4">Reference</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Airport</th>
              <th className="p-4">Lounge</th>
              <th className="p-4">Date</th>
              <th className="p-4">Operational Status</th>
              <th className="p-4">Assigned To</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Payment</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginated.map((b) => {
              const internalStatus = getBookingInternalStatus(b);
              const loungeService = b.booking_services?.find(
                (s: any) =>
                  s.category === "lounge" || s.service_name.toLowerCase().includes("lounge"),
              );
              const loungeName = loungeService ? loungeService.service_name : "General Access";
              const priority = getBookingPriority(b.depart_date);
              const payment = getPaymentStatus(internalStatus);
              const primaryAction = getRowPrimaryAction(b);

              return (
                <tr key={b.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-4 font-mono font-semibold text-[#5ed3ff]">{b.booking_ref}</td>
                  <td className="p-4">
                    <div className="font-semibold text-white">
                      {b.user_id ? "Member Account" : "Guest Checkout"}
                    </div>
                    <div className="text-[10px] text-white/40 mt-0.5 font-mono">
                      {b.company || "VIP Traveler"}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-white/80">
                      <MapPin className="h-3 w-3 text-white/30" />
                      <span>{b.origin}</span>
                    </div>
                  </td>
                  <td className="p-4 text-white/80 max-w-[150px] truncate">{loungeName}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-white/80">
                      <Calendar className="h-3 w-3 text-white/30" />
                      <span>{b.depart_date.slice(0, 16)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[9px] uppercase font-mono tracking-wider ${getStatusBadgeClass(internalStatus)}`}
                    >
                      {internalStatus.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-medium text-white/80">
                    {getAssigneeRoleDisplay(b.assigned_to)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono tracking-wider uppercase ${priority.color}`}
                    >
                      {priority.label}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono tracking-wider uppercase ${payment.color}`}
                    >
                      {payment.label}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {primaryAction && (
                        <button
                          onClick={() =>
                            triggerWorkflowWithVerify(
                              b.id,
                              primaryAction.action,
                              primaryAction.label,
                            )
                          }
                          className={`px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors duration-150 cursor-pointer ${primaryAction.style}`}
                        >
                          {primaryAction.label}
                        </button>
                      )}
                      <Link
                        to="/admin/bookings/$id"
                        params={{ id: b.id }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors uppercase tracking-wider text-[10px] text-white/70"
                        style={pageMono}
                      >
                        <Eye className="h-3 w-3" /> Details
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="p-8 text-center text-white/30">
                  No bookings matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 text-xs">
          <span className="text-white/40">
            Showing {Math.min(filtered.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
            {Math.min(filtered.length, currentPage * itemsPerPage)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-white/5 border border-white/10 text-white rounded hover:bg-white/10 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-white font-mono px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 bg-white/5 border border-white/10 text-white rounded hover:bg-white/10 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c121b] border border-white/15 p-6 max-w-sm w-full rounded shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertCircle className="h-5 w-5" />
              <h4 className="text-sm font-semibold font-mono uppercase tracking-wider">
                Confirm Critical Action
              </h4>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Are you sure you want to perform the action{" "}
              <strong className="text-white font-mono">"{confirmModal.label}"</strong>? This will
              transition the booking state and trigger immutable audit events.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-3 py-1.5 border border-white/10 text-xs font-mono text-white/60 hover:text-white hover:bg-white/5 uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const { bookingId, action } = confirmModal;
                  setConfirmModal(null);
                  await handleWorkflowAction(bookingId, action);
                }}
                className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400 hover:bg-red-500/20 uppercase tracking-wider cursor-pointer"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
