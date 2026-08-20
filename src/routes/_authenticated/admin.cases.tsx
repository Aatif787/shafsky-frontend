import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { pageMono, pageDisplay, Panel } from "@/components/site/PageShell";
import {
  Loader2,
  AlertTriangle,
  Search,
  MessageSquare,
  UserCheck,
  CheckCircle,
  Clock,
  Send,
  Lock,
  Bookmark,
  Sparkles,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import {
  listSupportCases,
  getCaseDetails,
  listCaseMessages,
  listCaseAuditLogs,
  updateCaseStatus,
  claimCase,
  assignCase,
  addCaseMessage,
  listSavedReplies,
  getCaseAnalytics,
} from "@/lib/cases.functions";

export const Route = createFileRoute("/_authenticated/admin/cases")({
  component: AdminCasesView,
});

function AdminCasesView() {
  const runListCases = useServerFn(listSupportCases);
  const runGetCaseDetails = useServerFn(getCaseDetails);
  const runListMessages = useServerFn(listCaseMessages);
  const runListAuditLogs = useServerFn(listCaseAuditLogs);
  const runUpdateStatus = useServerFn(updateCaseStatus);
  const runClaim = useServerFn(claimCase);
  const runAssign = useServerFn(assignCase);
  const runAddMessage = useServerFn(addCaseMessage);
  const runListReplies = useServerFn(listSavedReplies);
  const runGetAnalytics = useServerFn(getCaseAnalytics);

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Workspace Detail states
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<
    "conversation" | "booking" | "notes" | "timeline"
  >("conversation");
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [noteCategory, setNoteCategory] = useState("operations");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [assigneeId, setAssigneeId] = useState("");

  // Queries
  const { data: analytics, refetch: refetchAnalytics } = useQuery({
    queryKey: ["admin-case-analytics"],
    queryFn: () => runGetAnalytics(),
  });

  const {
    data: cases = [],
    isLoading: loadingCases,
    refetch: refetchCases,
  } = useQuery({
    queryKey: ["admin-cases"],
    queryFn: () => runListCases({ data: {} }),
  });

  const { data: caseDetail, refetch: refetchDetail } = useQuery({
    queryKey: ["admin-case-detail", selectedCaseId],
    queryFn: () => runGetCaseDetails({ data: { caseId: selectedCaseId || "" } }),
    enabled: Boolean(selectedCaseId),
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["admin-case-messages", selectedCaseId],
    queryFn: () => runListMessages({ data: { caseId: selectedCaseId || "" } }),
    enabled: Boolean(selectedCaseId),
  });

  const { data: auditLogs = [], refetch: refetchAudits } = useQuery({
    queryKey: ["admin-case-audits", selectedCaseId],
    queryFn: () => runListAuditLogs({ data: { caseId: selectedCaseId || "" } }),
    enabled: Boolean(selectedCaseId),
  });

  const { data: savedReplies = [] } = useQuery({
    queryKey: ["admin-saved-replies"],
    queryFn: () => runListReplies(),
  });

  // Action Handlers
  const handleClaim = async (caseId: string) => {
    try {
      await runClaim({ data: { caseId } });
      toast.success("Case claimed successfully!");
      refetchCases();
      refetchDetail();
      refetchMessages();
      refetchAnalytics();
    } catch (e: any) {
      toast.error(e.message || "Failed to claim case");
    }
  };

  const handleStatusChange = async (caseId: string, status: any) => {
    try {
      await runUpdateStatus({ data: { caseId, status } });
      toast.success("Status updated to " + status);
      refetchCases();
      refetchDetail();
      refetchMessages();
      refetchAnalytics();
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    }
  };

  const handleAssign = async (caseId: string, adminId: string | null) => {
    try {
      await runAssign({ data: { caseId, adminId } });
      toast.success(adminId ? "Case assigned to admin" : "Case returned to Unassigned Queue");
      refetchCases();
      refetchDetail();
      refetchMessages();
    } catch (e: any) {
      toast.error(e.message || "Failed to assign case");
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !replyText.trim()) return;
    setSubmittingReply(true);
    try {
      await runAddMessage({
        data: {
          caseId: selectedCaseId,
          message: replyText,
          isInternal: isInternalNote,
          noteCategory: isInternalNote ? noteCategory : undefined,
        },
      });
      setReplyText("");
      refetchMessages();
      refetchCases();
      refetchDetail();
      toast.success("Response dispatched.");
    } catch (e: any) {
      toast.error(e.message || "Failed to send response");
    } finally {
      setSubmittingReply(false);
    }
  };

  // Filters calculation
  const filteredCases = cases.filter((c: any) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      c.case_ref.toLowerCase().includes(query) ||
      c.customer_name?.toLowerCase().includes(query) ||
      c.customer_email?.toLowerCase().includes(query) ||
      (c.booking_id && c.booking_id.toLowerCase().includes(query)) ||
      c.case_type.toLowerCase().includes(query);

    const matchesCategory = categoryFilter === "all" || c.case_type === categoryFilter;
    const matchesPriority = priorityFilter === "all" || c.priority === priorityFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "OPEN" && c.status !== "RESOLVED" && c.status !== "CLOSED") ||
      (statusFilter === "RESOLVED" && c.status === "RESOLVED") ||
      (statusFilter === "CLOSED" && c.status === "CLOSED");

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-6 text-white min-h-screen pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold leading-tight" style={pageDisplay}>
            Case <em className="text-[#5ed3ff]">Management.</em>
          </h1>
          <p className="text-xs text-white/50 uppercase tracking-widest mt-1" style={pageMono}>
            VIP Support Queue & Case Lifecycle Manager
          </p>
        </div>
        <button
          onClick={() => {
            refetchCases();
            refetchAnalytics();
          }}
          className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: "Active Queue", val: analytics?.openCount ?? 0, color: "text-[#5ed3ff]" },
          { label: "Critical SLAs", val: analytics?.criticalCount ?? 0, color: "text-red-400" },
          {
            label: "SLA Overdue",
            val: analytics?.slaViolations ?? 0,
            color: "text-amber-500 font-bold",
          },
          {
            label: "Resolved Today",
            val: analytics?.resolvedCount ?? 0,
            color: "text-emerald-400",
          },
          { label: "Archived/Closed", val: analytics?.closedCount ?? 0, color: "text-white/40" },
          { label: "Average Response", val: "12m", color: "text-[#5fb5ad]" },
        ].map((kpi) => (
          <div
            key={`case-kpi-${kpi.label}`}
            className="p-4 bg-[#0c121b] border border-white/10 rounded-2xl flex flex-col justify-between"
          >
            <span className="text-[9px] uppercase tracking-widest text-white/40 font-mono">
              {kpi.label}
            </span>
            <span className={`text-2xl font-bold mt-2 ${kpi.color}`} style={pageDisplay}>
              {kpi.val}
            </span>
          </div>
        ))}
      </div>

      {/* Search and Filters Toolbar */}
      <div className="grid md:grid-cols-4 gap-4 bg-white/[0.02] border border-white/10 p-5 rounded-2xl">
        <div className="space-y-1.5 md:col-span-1">
          <label className="text-[9px] uppercase tracking-wider text-white/40 font-mono">
            Global Search
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search ref, customer name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#06090f] border border-white/10 px-3 py-2 pl-8 text-xs outline-none focus:border-[#5ed3ff] rounded-xl text-white"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-white/30" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] uppercase tracking-wider text-white/40 font-mono">
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-[#0c121b] border border-white/10 px-3 py-2 text-xs outline-none rounded-xl text-white/70"
          >
            <option value="all">All Categories</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Flight Change">Flight Change</option>
            <option value="Refund Request">Refund Request</option>
            <option value="Payment Issue">Payment Issue</option>
            <option value="VIP Assist">VIP Assist</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] uppercase tracking-wider text-white/40 font-mono">
            Priority
          </label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full bg-[#0c121b] border border-white/10 px-3 py-2 text-xs outline-none rounded-xl text-white/70"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] uppercase tracking-wider text-white/40 font-mono">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#0c121b] border border-white/10 px-3 py-2 text-xs outline-none rounded-xl text-white/70"
          >
            <option value="all">All Statuses</option>
            <option value="OPEN">Open Queue</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed / Archive</option>
          </select>
        </div>
      </div>

      {/* Main List / Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tickets Queue List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-[10px] uppercase tracking-widest text-white/50 font-mono">
              Matching Cases ({filteredCases.length})
            </span>
          </div>

          {loadingCases ? (
            <div className="text-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#5ed3ff] mx-auto" />
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl text-xs font-mono text-white/40">
              No tickets found.
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredCases.map((c: any) => {
                const isSelected = selectedCaseId === c.id;
                const isSlaBreached =
                  new Date(c.sla_deadline) < new Date() && c.status !== "CLOSED";

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCaseId(c.id);
                      setActiveWorkspaceTab("conversation");
                    }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition duration-200 ${
                      isSelected
                        ? "bg-[#0d5a6e]/20 border-[#0d5a6e]"
                        : "bg-[#0c121b] border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold font-mono text-white/80 bg-white/5 px-2 py-0.5 rounded">
                        {c.case_ref}
                      </span>
                      <span className="text-[9px] font-mono text-white/40">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-3">
                      <h4 className="text-xs font-bold text-white leading-snug">{c.case_type}</h4>
                      <p className="text-[10px] text-white/60 mt-1 truncate">
                        By: {c.customer_name}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                      <span
                        className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                          c.priority === "Critical"
                            ? "bg-red-950 text-red-400 border border-red-900"
                            : c.priority === "High"
                              ? "bg-amber-950 text-amber-400 border border-amber-900"
                              : "bg-white/5 text-white/50"
                        }`}
                      >
                        {c.priority}
                      </span>

                      {isSlaBreached && (
                        <span className="text-[8px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded animate-pulse">
                          SLA BREACH
                        </span>
                      )}

                      <span className="text-[9px] font-mono font-bold text-[#5fb5ad]">
                        {c.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Case Workspace Detail Panel */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedCaseId ? (
            <div className="h-[400px] border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-white/40 space-y-4">
              <FolderOpen className="h-12 w-12 text-white/20" />
              <span className="text-xs font-mono">
                Select a support case dossier to load workspace.
              </span>
            </div>
          ) : !caseDetail ? (
            <div className="text-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#5ed3ff] mx-auto" />
            </div>
          ) : (
            <div className="bg-[#0c121b] border border-white/10 rounded-2xl p-6 space-y-6">
              {/* Workspace Header Actions */}
              <div className="flex flex-wrap gap-3 justify-between items-center pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                    {caseDetail.case_ref}
                    <span className="text-xs font-normal text-white/50">
                      | {caseDetail.case_type}
                    </span>
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!caseDetail.assigned_admin_id && (
                    <button
                      onClick={() => handleClaim(caseDetail.id)}
                      className="px-3 py-1.5 bg-[#5fb5ad] text-[#06090f] hover:bg-[#4ea29a] transition rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono cursor-pointer"
                    >
                      Claim Case
                    </button>
                  )}

                  {/* Status update picker */}
                  <select
                    value={caseDetail.status}
                    onChange={(e) => handleStatusChange(caseDetail.id, e.target.value as any)}
                    className="bg-[#06090f] border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-white outline-none"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="WAITING_FOR_CUSTOMER">WAITING_FOR_CUSTOMER</option>
                    <option value="WAITING_FOR_INTERNAL_TEAM">WAITING_FOR_INTERNAL_TEAM</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>

                  {/* Reassign trigger */}
                  <button
                    onClick={() => handleAssign(caseDetail.id, null)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded-lg text-[9px] font-bold uppercase tracking-wider font-mono"
                  >
                    Unassign
                  </button>
                </div>
              </div>

              {/* Tabs Deck */}
              <div className="flex gap-2 border-b border-white/5 pb-2">
                {[
                  { id: "conversation", label: "Conversation Log" },
                  { id: "booking", label: "Linked Booking" },
                  { id: "notes", label: "Private Staff Notes" },
                  { id: "timeline", label: "Audit Logs" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveWorkspaceTab(t.id as any)}
                    className={`px-3 py-2 text-[9px] font-bold uppercase tracking-widest font-mono border-b-2 transition ${
                      activeWorkspaceTab === t.id
                        ? "border-[#5ed3ff] text-[#5ed3ff]"
                        : "border-transparent text-white/50 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: CONVERSATION LOG */}
              {activeWorkspaceTab === "conversation" && (
                <div className="space-y-6">
                  {/* Messages list */}
                  <div className="space-y-4 max-h-[350px] overflow-y-auto p-4 bg-[#06090f]/50 border border-white/5 rounded-xl">
                    {messages.map((m: any) => {
                      const isAgent = m.sender_role === "admin" || m.sender_role === "super_admin";
                      const isInternal = m.is_internal;

                      return (
                        <div
                          key={m.id}
                          className={`p-3.5 rounded-xl text-xs leading-relaxed max-w-[85%] ${
                            isInternal
                              ? "bg-amber-950/20 border border-amber-900/50 mr-auto text-amber-100"
                              : isAgent
                                ? "bg-[#0d5a6e]/10 border border-[#0d5a6e]/20 ml-auto text-white"
                                : "bg-[#0c121b] border border-white/5 mr-auto text-white/90"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1 text-[8px] font-mono text-white/40">
                            <span>
                              {m.sender_role === "customer" ? "Customer" : "Agent"}
                              {isInternal && " (Internal Note)"}
                            </span>
                            <span>{new Date(m.created_at).toLocaleTimeString()}</span>
                          </div>
                          <div>{m.message}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Send response editor */}
                  <form onSubmit={handleSendReply} className="space-y-4 pt-2">
                    <div className="flex gap-4 items-center">
                      <label className="flex items-center gap-2 text-[10px] font-mono text-white/60 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInternalNote}
                          onChange={(e) => setIsInternalNote(e.target.checked)}
                          className="rounded border-white/10 bg-transparent text-[#5ed3ff]"
                        />
                        Send as Private Staff Note
                      </label>

                      {isInternalNote && (
                        <select
                          value={noteCategory}
                          onChange={(e) => setNoteCategory(e.target.value)}
                          className="bg-[#06090f] border border-white/10 rounded px-2 py-1 text-[9px] font-mono text-white outline-none"
                        >
                          <option value="operations">Operations Desk</option>
                          <option value="finance">Finance Desk</option>
                          <option value="private">Private VIP Note</option>
                          <option value="pinned">Pinned Alert</option>
                        </select>
                      )}

                      {/* Saved canned replies helper */}
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setReplyText((prev) => prev + e.target.value);
                            e.target.value = "";
                          }
                        }}
                        className="bg-[#06090f] border border-white/10 rounded px-2 py-1 text-[9px] font-mono text-white outline-none ml-auto"
                      >
                        <option value="">Insert Canned Reply...</option>
                        {savedReplies.map((sr: any) => (
                          <option key={sr.id} value={sr.message}>
                            {sr.shortcut}
                          </option>
                        ))}
                      </select>
                    </div>

                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={
                        isInternalNote
                          ? "Write private staff operations comment here..."
                          : "Type customer reply response (press Send to dispatch)..."
                      }
                      className="w-full h-24 p-3 bg-[#06090f] border border-white/10 rounded-xl text-xs outline-none focus:border-[#5ed3ff] text-white resize-none"
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingReply}
                        className="px-5 py-2.5 bg-[#5ed3ff] hover:bg-[#43c4f0] text-[#06090f] text-[10px] font-bold uppercase tracking-widest rounded-xl transition flex items-center gap-1.5 cursor-pointer font-mono"
                      >
                        {submittingReply ? "Dispatching..." : "Send Response"}
                        <Send size={12} />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: LINKED BOOKING */}
              {activeWorkspaceTab === "booking" && (
                <div className="space-y-4">
                  {caseDetail.booking ? (
                    <div className="p-5 bg-[#06090f]/30 border border-white/5 rounded-xl space-y-4 text-left">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-white/40 font-mono">
                            Booking Reference
                          </span>
                          <span className="font-bold font-mono text-white text-xs">
                            {caseDetail.booking.booking_ref}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-white/40 font-mono">
                            Service Type
                          </span>
                          <span className="font-bold text-white text-xs">
                            {caseDetail.booking.service_type || "Airport Concierge"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-white/40 font-mono">
                            Origin Airport
                          </span>
                          <span className="font-semibold text-white text-xs">
                            {caseDetail.booking.origin}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-white/40 font-mono">
                            Destination
                          </span>
                          <span className="font-semibold text-white text-xs">
                            {caseDetail.booking.destination}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-white/40 font-mono">
                            Departure Date
                          </span>
                          <span className="font-semibold text-white text-xs font-mono">
                            {caseDetail.booking.depart_date}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-white/40 font-mono">
                            Passengers
                          </span>
                          <span className="font-semibold text-white text-xs font-mono">
                            {caseDetail.booking.pax_adults} Adults
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex gap-2">
                        <Link
                          to={`/admin/bookings/${caseDetail.booking.id}` as any}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-wider font-mono text-center flex-1"
                        >
                          Open Booking Record
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-xs font-mono text-white/40">
                      No airport booking associated with this case file.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PRIVATE STAFF NOTES */}
              {activeWorkspaceTab === "notes" && (
                <div className="space-y-4 text-left">
                  <div className="p-4 bg-amber-950/10 border border-amber-900/20 rounded-xl">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-400 font-mono mb-2">
                      Pinned Cases Directives
                    </h4>
                    <p className="text-[11px] text-amber-200/70 leading-relaxed">
                      SLA Warning: Critical VIP complaints must be resolved in 15 minutes. Contact
                      Delhi airfield hosts immediately for boarding pass validation issues.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {messages.filter((m: any) => m.is_internal).length === 0 ? (
                      <div className="text-center py-10 text-xs font-mono text-white/40">
                        No private operations notes recorded yet.
                      </div>
                    ) : (
                      messages
                        .filter((m: any) => m.is_internal)
                        .map((m: any) => (
                          <div
                            key={m.id}
                            className="p-3 bg-[#06090f]/40 border border-white/5 rounded-lg space-y-1"
                          >
                            <div className="flex justify-between items-center text-[8px] font-mono text-amber-400">
                              <span>Desk: {m.note_category || "Operations"}</span>
                              <span>{new Date(m.created_at).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-xs text-white/90">"{m.message}"</p>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: AUDIT LOGS */}
              {activeWorkspaceTab === "timeline" && (
                <div className="space-y-4 text-left">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 font-mono">
                    Immutable Case Audit History
                  </h4>

                  <div className="space-y-3">
                    {auditLogs.length === 0 ? (
                      <div className="text-center py-10 text-xs font-mono text-white/40">
                        Loading audit trails...
                      </div>
                    ) : (
                      auditLogs.map((log: any) => (
                        <div
                          key={log.id}
                          className="p-3 bg-[#06090f]/20 border border-white/5 rounded-lg flex justify-between items-start text-[11px]"
                        >
                          <div>
                            <span className="font-bold text-white font-mono uppercase tracking-wider block">
                              Action: {log.action}
                            </span>
                            {log.metadata && (
                              <span className="text-[9px] text-white/50 block font-mono mt-0.5">
                                {JSON.stringify(log.metadata)}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-mono text-white/40 shrink-0">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
