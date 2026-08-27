import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Plane,
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MessageCircle,
  Edit2,
  X,
  Check,
  Loader2,
  Shield,
  FileText,
  UserCheck,
} from "lucide-react";
import { charterApi, CharterRequestData } from "@/lib/api/charterApi";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/charter")({
  component: AdminCharterView,
});

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  REQUESTED: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
  CONTACTED: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" },
  UNDER_REVIEW: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
  AIRCRAFT_SEARCH: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  OPTIONS_PREPARED: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/30" },
  QUOTE_PREPARED: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
  QUOTE_SENT: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  CUSTOMER_REVIEW: { bg: "bg-teal-500/10", text: "text-teal-400", border: "border-teal-500/30" },
  CONFIRMED: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/40" },
  CLOSED: { bg: "bg-white/5", text: "text-white/40", border: "border-white/10" },
  CANCELLED: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
};

const ALL_STATUSES = [
  "ALL",
  "REQUESTED",
  "CONTACTED",
  "UNDER_REVIEW",
  "AIRCRAFT_SEARCH",
  "OPTIONS_PREPARED",
  "QUOTE_PREPARED",
  "QUOTE_SENT",
  "CUSTOMER_REVIEW",
  "CONFIRMED",
  "CLOSED",
  "CANCELLED",
];

function AdminCharterView() {
  const [requests, setRequests] = useState<CharterRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState<CharterRequestData | null>(null);

  // Edit / Status Update State
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [assignedStaff, setAssignedStaff] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const res = await charterApi.listAdminRequests({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: search.trim() || undefined,
      });
      if (res.success && res.data) {
        setRequests(res.data);
      } else {
        setRequests([]);
      }
    } catch {
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadRequests();
  };

  const openDetails = (req: CharterRequestData) => {
    setSelectedRequest(req);
    setNewStatus(req.status);
    setAssignedStaff(req.assigned_staff_name || "");
    setInternalNotes(req.internal_notes || "");
  };

  const handleUpdate = async () => {
    if (!selectedRequest?.id) return;
    setIsUpdating(true);
    try {
      const res = await charterApi.updateAdminRequest(selectedRequest.id, {
        status: newStatus,
        assigned_staff_name: assignedStaff.trim() || undefined,
        internal_notes: internalNotes.trim() || undefined,
      });
      if (res.success && res.data) {
        toast.success(`Request ${selectedRequest.request_reference} updated successfully.`);
        setSelectedRequest({
          ...selectedRequest,
          status: newStatus,
          assigned_staff_name: assignedStaff,
          internal_notes: internalNotes,
        });
        loadRequests();
      } else {
        toast.error("Failed to update charter request.");
      }
    } catch {
      toast.error("Failed to update charter request.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 text-white font-['Inter',sans-serif]">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#5ed3ff] flex items-center gap-1.5">
            <Plane className="w-3.5 h-3.5" /> Private Aviation Desk
          </span>
          <h1 className="text-2xl md:text-3xl font-semibold text-white mt-1">
            Private Charter Enquiries
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Manage bespoke aircraft quote requests, itinerary reviews, and staff dispatch assignments.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, name, email, route..."
              className="bg-[#0e1624] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:border-[#5ed3ff] focus:outline-none w-64 md:w-80"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#5ed3ff] text-[#0a101a] font-semibold text-xs transition hover:bg-[#4bc2ee]"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-white/10">
        {ALL_STATUSES.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              statusFilter === st
                ? "bg-[#5ed3ff] text-[#0a101a] font-semibold shadow-md"
                : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            {st === "ALL" ? "All Enquiries" : st.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Enquiries Table / List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#5ed3ff]" />
        </div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
          <Plane className="w-10 h-10 text-white/20 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Charter Requests Found</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            No private charter requests match the current search or status filter parameters.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a101a] border-b border-white/10 text-white/50 uppercase tracking-wider font-mono">
                <tr>
                  <th className="px-5 py-3.5">Reference</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Route</th>
                  <th className="px-5 py-3.5">Departure</th>
                  <th className="px-5 py-3.5">Pax / Aircraft</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {requests.map((req) => {
                  const style = STATUS_COLORS[req.status] || {
                    bg: "bg-white/5",
                    text: "text-white",
                    border: "border-white/10",
                  };
                  return (
                    <tr key={req.id || req.request_reference} className="hover:bg-white/[0.02] transition">
                      <td className="px-5 py-4 font-mono font-bold text-[#5ed3ff]">
                        {req.request_reference}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">{req.customer_name}</div>
                        <div className="text-[11px] text-white/40">
                          {req.country_code} {req.phone} • {req.email}
                        </div>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <div className="font-medium text-white truncate">
                          {req.origin} → {req.destination}
                        </div>
                        <div className="text-[11px] font-mono text-white/40">
                          {req.trip_type.replace("_", " ")}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div>{req.departure_date}</div>
                        <div className="text-[11px] text-white/40">{req.departure_time || "Any Time"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div>{req.passengers?.total || req.passengers?.adults || 1} Guests</div>
                        <div className="text-[11px] text-[#5ed3ff] truncate max-w-[120px]">
                          {req.aircraft_preference.replace("_", " ")}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}
                        >
                          {req.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openDetails(req)}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details & Status Update Modal Drawer */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0e1624] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#5ed3ff]">
                  Charter Enquiry Details
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-white font-mono mt-0.5">
                  {selectedRequest.request_reference}
                </h2>
                <div className="text-xs text-white/50">
                  Received: {new Date(selectedRequest.created_at).toLocaleString()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Route Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5">
                <span className="text-white/40 uppercase font-mono tracking-wider block">Customer Details</span>
                <div className="text-sm font-semibold text-white">{selectedRequest.customer_name}</div>
                <div className="text-white/70">
                  {selectedRequest.country_code} {selectedRequest.phone}
                </div>
                <div className="text-white/70">{selectedRequest.email}</div>
                {selectedRequest.company && (
                  <div className="text-[#5ed3ff]">{selectedRequest.company}</div>
                )}
                <div className="text-white/40 pt-1">
                  Preferred Contact: {selectedRequest.preferred_contact_method}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5">
                <span className="text-white/40 uppercase font-mono tracking-wider block">Route & Schedule</span>
                <div className="text-sm font-semibold text-white">
                  {selectedRequest.origin} → {selectedRequest.destination}
                </div>
                <div className="text-white/70">
                  Trip Type: {selectedRequest.trip_type.replace("_", " ")}
                </div>
                <div className="text-white/70">
                  Departure: {selectedRequest.departure_date} ({selectedRequest.departure_time || "Any Time"})
                </div>
                {selectedRequest.return_date && (
                  <div className="text-white/70">
                    Return: {selectedRequest.return_date} ({selectedRequest.return_time || "Any Time"})
                  </div>
                )}
              </div>
            </div>

            {/* Requirements & Special Requests */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 text-xs">
              <span className="text-white/40 uppercase font-mono tracking-wider block">
                Travel Requirements & Amenities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedRequest.travel_requirements?.length > 0 ? (
                  selectedRequest.travel_requirements.map((req) => (
                    <span
                      key={req}
                      className="px-2.5 py-1 rounded-full bg-white/10 text-white/80 text-[11px]"
                    >
                      {req}
                    </span>
                  ))
                ) : (
                  <span className="text-white/40">Standard VIP FBO Handling</span>
                )}
              </div>
              {selectedRequest.special_requests && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-white/40 block mb-1 font-mono">Special Requests:</span>
                  <p className="text-white/80 italic">{selectedRequest.special_requests}</p>
                </div>
              )}
            </div>

            {/* Admin Management Actions */}
            <div className="p-5 rounded-2xl bg-[#0a101a] border border-white/10 space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#5ed3ff] block">
                Operational Lifecycle Control
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-white/70 mb-1.5">Lifecycle Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-[#070b12] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#5ed3ff] focus:outline-none"
                  >
                    {ALL_STATUSES.filter((s) => s !== "ALL").map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 mb-1.5">Assign Lead / Staff</label>
                  <input
                    type="text"
                    value={assignedStaff}
                    onChange={(e) => setAssignedStaff(e.target.value)}
                    placeholder="e.g. Captain Vikram Sharma"
                    className="w-full bg-[#070b12] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-[#5ed3ff] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-1.5">Internal Operational Notes</label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add internal aircraft sourcing, airport slot, or quotation notes..."
                  className="w-full bg-[#070b12] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-white/30 focus:border-[#5ed3ff] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="px-6 py-2 rounded-xl bg-[#5ed3ff] hover:bg-[#4bc2ee] text-[#0a101a] text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save Updates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

