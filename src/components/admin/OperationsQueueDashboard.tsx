import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Clock,
  User,
  Phone,
  Mail,
  Plane,
  RefreshCw,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  FileText,
  UserCheck,
  Zap,
  Search,
  Calendar,
  X,
  History,
} from "lucide-react";
import { ApiClient } from "@/lib/ApiClient";
import { toast } from "sonner";

export interface OperationsQueueItem {
  id: string;
  booking_reference: string;
  airport_code: string;
  journey_type: string;
  service_date: str;
  service_time: str;
  status: string;
  assigned_staff_id?: string | null;
  assigned_staff_name?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  guest_count: number;
  flight_number?: string | null;
  selected_services: any[];
  special_requests?: string | null;
  email_notification_sent: boolean;
  whatsapp_notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

const WORKFLOW_STATES = [
  "NEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "CUSTOMER_CONTACTED",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

export function OperationsQueueDashboard() {
  const [items, setItems] = useState<OperationsQueueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [airportFilter, setAirportFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Drawer & Modal state
  const [selectedItemRef, setSelectedItemRef] = useState<string | null>(null);
  const [itemDetails, setItemDetails] = useState<any>(null);
  const [noteModalOpen, setNoteModalOpen] = useState<boolean>(false);
  const [newNoteContent, setNewNoteContent] = useState<string>("");

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/operations/queue";
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (airportFilter !== "ALL") params.append("airport", airportFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await ApiClient.fetchWithAuth(url);
      const data = await res.json();
      if (data && data.success !== false) {
        setItems(data.data || []);
      }
    } catch (err: any) {
      console.warn("[OperationsQueue] Failed to load operations queue:", err);
      toast.error("Failed to load operations queue.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, airportFilter]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const fetchItemDetails = async (ref: string) => {
    setSelectedItemRef(ref);
    try {
      const res = await ApiClient.fetchWithAuth(`/api/operations/queue/${ref}`);
      const data = await res.json();
      if (data && data.success !== false) {
        setItemDetails(data);
      }
    } catch (err) {
      toast.error("Failed to load item timeline and notes.");
    }
  };

  const handleUpdateStatus = async (ref: string, newStatus: string) => {
    try {
      const res = await ApiClient.fetchWithAuth(`/api/operations/queue/${ref}/status`, {
        method: "POST",
        body: JSON.stringify({ status: newStatus, reason: `Manual update to ${newStatus}` }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        toast.success(`Booking ${ref} status updated to ${newStatus}`);
        fetchQueue();
        if (selectedItemRef === ref) fetchItemDetails(ref);
      } else {
        toast.error(data.detail || "Failed to update status.");
      }
    } catch (err: any) {
      toast.error("Failed to update workflow status.");
    }
  };

  const handleAutoAssign = async (ref: string) => {
    try {
      const res = await ApiClient.fetchWithAuth(`/api/operations/queue/${ref}/assign`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok && data.assigned_staff_name) {
        toast.success(`Assigned to ${data.assigned_staff_name}`);
        fetchQueue();
        if (selectedItemRef === ref) fetchItemDetails(ref);
      } else {
        toast.error("Auto-assignment failed.");
      }
    } catch (err) {
      toast.error("Failed to execute auto-assignment.");
    }
  };

  const handleAddNote = async () => {
    if (!selectedItemRef || !newNoteContent.trim()) return;

    try {
      const res = await ApiClient.fetchWithAuth(`/api/operations/queue/${selectedItemRef}/notes`, {
        method: "POST",
        body: JSON.stringify({ content: newNoteContent.trim(), author_id: "DUTY_MANAGER" }),
      });
      if (res.ok) {
        toast.success("Internal note added successfully.");
        setNewNoteContent("");
        setNoteModalOpen(false);
        fetchItemDetails(selectedItemRef);
      }
    } catch (err) {
      toast.error("Failed to add note.");
    }
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.booking_reference.toLowerCase().includes(q) ||
      item.customer_name.toLowerCase().includes(q) ||
      item.airport_code.toLowerCase().includes(q) ||
      (item.flight_number && item.flight_number.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ASSIGNED":
        return "bg-[#84cc16]/20 text-[#84cc16] border-[#84cc16]/40";
      case "IN_PROGRESS":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "CUSTOMER_CONTACTED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "READY":
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "COMPLETED":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-[1600px] mx-auto">
      {/* ── 1. DASHBOARD HEADER & METRIC CARDS ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>24/7 Aviation Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-2">
            Operations & Dispatch Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-sans mt-0.5">
            Real-time synchronization of confirmed bookings, duty officer assignments, and customer notifications.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchQueue}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Total Active Queue</div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">{items.length}</div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-xs space-y-1">
          <div className="text-[10px] font-mono text-amber-900 uppercase tracking-widest font-bold">Unassigned New</div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-950">
            {items.filter((i) => i.status === "NEW").length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 shadow-xs space-y-1">
          <div className="text-[10px] font-mono text-blue-900 uppercase tracking-widest font-bold">In Progress</div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-blue-950">
            {items.filter((i) => i.status === "IN_PROGRESS" || i.status === "ASSIGNED").length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 shadow-xs space-y-1">
          <div className="text-[10px] font-mono text-emerald-900 uppercase tracking-widest font-bold">Completed Today</div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950">
            {items.filter((i) => i.status === "COMPLETED").length}
          </div>
        </div>
      </div>

      {/* ── 2. FILTERS & SEARCH BAR ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ref #, customer name, flight..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-sans text-slate-900 focus:outline-none focus:border-amber-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              {WORKFLOW_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Airport Filter */}
          <select
            value={airportFilter}
            onChange={(e) => setAirportFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Airports</option>
            <option value="DEL">DEL (Delhi)</option>
            <option value="BOM">BOM (Mumbai)</option>
            <option value="HYD">HYD (Hyderabad)</option>
            <option value="AMD">AMD (Ahmedabad)</option>
            <option value="LKO">LKO (Lucknow)</option>
          </select>
        </div>
      </div>

      {/* ── 3. LIVE OPERATIONS QUEUE TABLE ── */}
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Booking Ref</th>
                <th className="px-6 py-4">Airport / Type</th>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Flight & Schedule</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Duty Officer</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-mono">
                    No active operations queue items match the filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {item.booking_reference}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 font-mono">{item.airport_code}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.journey_type}</div>
                    </td>

                    <td className="px-6 py-4 space-y-0.5">
                      <div className="font-bold text-slate-900">{item.customer_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{item.customer_phone}</div>
                    </td>

                    <td className="px-6 py-4 space-y-0.5">
                      <div className="font-mono font-bold text-slate-800">{item.flight_number || "VIP Direct"}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.service_date} @ {item.service_time}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold uppercase ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {item.assigned_staff_name ? (
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{item.assigned_staff_name}</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAutoAssign(item.booking_reference)}
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-700 hover:text-amber-900 font-bold uppercase underline"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Auto-Assign</span>
                        </button>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item.booking_reference, e.target.value)}
                        className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-mono font-bold text-slate-700 focus:outline-none"
                      >
                        {WORKFLOW_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => fetchItemDetails(item.booking_reference)}
                        className="px-3 py-1 rounded-lg bg-slate-900 text-white font-mono text-[11px] font-bold hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        Timeline & Notes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. TIMELINE & NOTES DRAWER ── */}
      {selectedItemRef && itemDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                  Operational Audit Trail
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-900">
                  {selectedItemRef}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemRef(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNoteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 text-[#7c3aed] border border-purple-200 font-mono text-xs font-bold uppercase transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Internal Staff Note</span>
              </button>
            </div>

            {/* Internal Staff Notes */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Staff-Only Internal Notes ({itemDetails.internal_notes?.length || 0})
              </h4>
              {itemDetails.internal_notes?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No staff notes added yet.</p>
              ) : (
                itemDetails.internal_notes?.map((n: any) => (
                  <div key={n.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                      <span>Author: {n.author_id}</span>
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-800 font-medium leading-relaxed">{n.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Timestamped Timeline */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                <span>Timestamped Event Audit History</span>
              </h4>

              <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pl-5">
                {itemDetails.timeline?.map((evt: any, idx: number) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[27px] top-0.5 w-3 h-3 rounded-full bg-[#7c3aed] ring-4 ring-white" />
                    <div className="text-xs font-bold text-slate-900">{evt.title}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {new Date(evt.created_at).toLocaleString()} • Actor: {evt.actor_id || "SYSTEM"}
                    </div>
                    {evt.details && Object.keys(evt.details).length > 0 && (
                      <pre className="mt-1.5 p-2 rounded-lg bg-slate-900 text-slate-200 text-[10px] font-mono overflow-x-auto">
                        {JSON.stringify(evt.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. ADD STAFF NOTE MODAL ── */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-serif font-bold text-slate-900">Add Staff-Only Internal Note</h3>
              <button type="button" onClick={() => setNoteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              rows={4}
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Enter internal operational notes, baggage details, duty officer updates..."
              className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-sans text-slate-900 focus:outline-none focus:border-amber-600"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNoteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNote}
                className="px-5 py-2 rounded-xl bg-[#7c3aed] text-white font-mono text-xs font-bold hover:bg-[#6d28d9]"
              >
                Save Internal Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
