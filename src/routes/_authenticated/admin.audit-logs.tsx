import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { listAllAuditLogs } from "@/lib/bookings.functions";
import { pageMono, pageDisplay, Panel } from "@/components/site/PageShell";
import { Loader2, AlertTriangle, Search, History } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export const Route = createFileRoute("/_authenticated/admin/audit-logs")({
  component: AuditLogsView,
});

function AuditLogsView() {
  const fetchAudits = useServerFn(listAllAuditLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const {
    data: audits,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-audit-timeline-logs"],
    queryFn: () => fetchAudits(),
  });

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5ed3ff]" />
      </div>
    );
  }

  if (error || !audits) {
    return (
      <Panel tone="dark" className="p-6 border border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <span className="text-sm font-semibold">Failed to load system audit timeline logs.</span>
        </div>
      </Panel>
    );
  }

  // Filtering
  const filtered = audits.filter((a) => {
    const q = debouncedQuery.toLowerCase();
    return (
      a.action.toLowerCase().includes(q) ||
      (a.admin || "").toLowerCase().includes(q) ||
      (a.entity_id || "").toLowerCase().includes(q) ||
      (a.table || "").toLowerCase().includes(q) ||
      (a.ip || "").toLowerCase().includes(q)
    );
  });

  const selectedAudit = audits.find((a) => a.id === selectedAuditId);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold leading-tight" style={pageDisplay}>
          Operational <em className="text-[#5ed3ff]">Ledger.</em>
        </h1>
        <p className="text-xs text-white/50 uppercase tracking-widest mt-1" style={pageMono}>
          System-wide operational tracking, changes audit, and IP verification ledger
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Table List (Left, 2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Filter */}
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Filter by action, table name, operator ID, IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border border-white/10 px-3 py-2 pl-8 text-xs outline-none focus:border-[#5ed3ff] text-white"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-white/30" />
          </div>

          {/* Audit Logs Table */}
          <div className="border border-white/10 bg-[#090d16]/30 overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[700px]">
              <thead className="text-[10px] uppercase tracking-[0.2em] text-white/40 border-b border-white/10 bg-white/[0.01]">
                <tr>
                  <th className="p-4">Action</th>
                  <th className="p-4">Table</th>
                  <th className="p-4">Operator</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginated.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedAuditId(log.id)}
                    className={`hover:bg-white/[0.02] cursor-pointer transition-colors ${
                      selectedAuditId === log.id ? "bg-white/[0.03]" : ""
                    }`}
                  >
                    <td className="p-4 font-mono font-semibold text-[#5ed3ff]">{log.action}</td>
                    <td
                      className="p-4 uppercase font-semibold text-white/70 tracking-wider text-[10px]"
                      style={pageMono}
                    >
                      {log.table}
                    </td>
                    <td className="p-4 font-mono text-white/50 truncate max-w-[120px]">
                      {log.admin}
                    </td>
                    <td className="p-4 font-mono text-white/60">{log.ip || "System"}</td>
                    <td className="p-4 text-white/50">
                      {new Date(log.timestamp || log.created_at || Date.now()).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-white/30">
                      No matching audit records.
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
        </div>

        {/* Side Details Pane (Right, 1/3 width) */}
        <div className="lg:col-span-1 space-y-4">
          {selectedAudit ? (
            <Panel tone="dark" className="p-5 space-y-5 border border-white/10 text-xs">
              <h3 className="text-xs uppercase tracking-widest text-[#5ed3ff] font-mono flex items-center gap-2">
                <History className="h-4 w-4" /> Entry Parameters
              </h3>
              <div className="space-y-3 text-white/80">
                <div>
                  <span className="text-white/40 block text-[9px] uppercase tracking-wider font-mono">
                    Action ID
                  </span>
                  <span className="font-mono text-white/90 break-all">{selectedAudit.id}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[9px] uppercase tracking-wider font-mono">
                    Target Resource ID (entity_id)
                  </span>
                  <span className="font-mono text-white/90 break-all">
                    {selectedAudit.entity_id || "None"}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block text-[9px] uppercase tracking-wider font-mono">
                    Client IP Location
                  </span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {selectedAudit.ip || "127.0.0.1"}
                  </span>
                </div>
              </div>

              {/* State Diffs */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div>
                  <span className="text-white/40 block text-[9px] uppercase tracking-wider font-mono mb-2">
                    State Before Change
                  </span>
                  <pre className="bg-black/35 border border-white/5 p-3 rounded text-[10px] font-mono text-red-400 max-h-[160px] overflow-y-auto whitespace-pre-wrap">
                    {selectedAudit.before ? JSON.stringify(selectedAudit.before, null, 2) : "NULL"}
                  </pre>
                </div>
                <div>
                  <span className="text-white/40 block text-[9px] uppercase tracking-wider font-mono mb-2">
                    State After Change
                  </span>
                  <pre className="bg-black/35 border border-white/5 p-3 rounded text-[10px] font-mono text-emerald-400 max-h-[160px] overflow-y-auto whitespace-pre-wrap">
                    {selectedAudit.after ? JSON.stringify(selectedAudit.after, null, 2) : "NULL"}
                  </pre>
                </div>
              </div>
            </Panel>
          ) : (
            <div className="text-center py-16 text-white/30 border border-dashed border-white/10 rounded-lg text-xs">
              Select an audit row from the ledger to view the before/after state diff.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
