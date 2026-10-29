import { Link } from "@tanstack/react-router";
import { getBookingInternalStatus, WORKFLOW_ACTIONS } from "@/lib/bookings.functions";
import { pageMono, Panel } from "@/components/site/PageShell";
import { Eye, RefreshCw, Send, Trash2, Calculator } from "lucide-react";

export type BookingDetailTab = "history" | "notifications" | "audits" | "documents";

export function BookingTabbedInfoDeck({
  activeTab,
  setActiveTab,
  history,
  notifications,
  isRetrying,
  handleRetryNotification,
  audits,
  docs,
  isRegenerating,
  handleRegeneratePdfs,
  isResending,
  handleResendDocEmail,
  isDeleting,
  handleDeleteOldVersions,
}: {
  activeTab: BookingDetailTab;
  setActiveTab: (tab: BookingDetailTab) => void;
  history: any[];
  notifications: any[];
  isRetrying: string | null;
  handleRetryNotification: (logId: string) => Promise<void>;
  audits: any[];
  docs: any[];
  isRegenerating: boolean;
  handleRegeneratePdfs: () => Promise<void>;
  isResending: string | null;
  handleResendDocEmail: (docType: string) => Promise<void>;
  isDeleting: string | null;
  handleDeleteOldVersions: (docType: string) => Promise<void>;
}) {
  return (
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
  );
}

export function BookingRightColumnPanels({
  booking,
  staff,
  noteText,
  setNoteText,
  setIsQuoteModalOpen,
  userRole,
  handleWorkflowAction,
  setOverrideModalOpen,
  docs,
  handleDocGenerate,
}: {
  booking: any;
  staff: any[] | undefined;
  noteText: string;
  setNoteText: (val: string) => void;
  setIsQuoteModalOpen: (val: boolean) => void;
  userRole: string | undefined;
  handleWorkflowAction: (
    action: string,
    overrideStatus?: string,
    reason?: string,
    quoteAmount?: number,
  ) => Promise<void>;
  setOverrideModalOpen: (val: boolean) => void;
  docs: any[] | undefined;
  handleDocGenerate: (kind: "quotation" | "invoice" | "receipt") => Promise<void>;
}) {
  return (
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
  );
}
