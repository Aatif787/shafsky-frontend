import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getAuditLogs } from "@/lib/super-admin.functions";
import {
  SAPageHeader,
  SASearchBar,
  SADataTable,
  saMono,
  saTheme,
} from "@/components/super-admin/SAComponents";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/super-admin/audit-logs")({
  component: AuditLogsPage,
});

function AuditLogsPage() {
  const fetchLogs = useServerFn(getAuditLogs);
  const [search, setSearch] = useState("");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["sa-audit-logs"],
    queryFn: () => fetchLogs(),
    staleTime: 10000,
  });

  const filtered = (logs as Record<string, any>[]).filter((log) => {
    const q = search.toLowerCase();
    return (
      String(log.action || "")
        .toLowerCase()
        .includes(q) ||
      String(log.entity || "")
        .toLowerCase()
        .includes(q) ||
      String(log.actor_id || "")
        .toLowerCase()
        .includes(q) ||
      String(log.entity_id || "")
        .toLowerCase()
        .includes(q)
    );
  });

  const handleExport = () => {
    try {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        ["Timestamp,Actor,Action,Entity,Entity ID,Metadata"]
          .concat(
            filtered.map(
              (l) =>
                `"${l.created_at}","${l.actor_id || "System"}","${l.action}","${l.entity}","${l.entity_id || ""}","${JSON.stringify(l.metadata || {})?.replace(/"/g, '""')}"`,
            ),
          )
          .join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `shafsky_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Audit log export started");
    } catch (err: any) {
      toast.error("Failed to export logs");
    }
  };

  return (
    <div className="space-y-6">
      <SAPageHeader
        title="Audit Logs"
        subtitle="Immutable database transaction history and admin operations history"
        breadcrumbs={[{ label: "Super Admin", href: "/super-admin" }, { label: "Audit Logs" }]}
        action={
          <button
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white text-[10px] font-bold uppercase tracking-wider rounded-md transition disabled:opacity-40 cursor-pointer"
            style={saMono}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        }
      />

      <div className="flex gap-4">
        <SASearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter by action, actor ID, scope, entity ID..."
          className="max-w-md flex-1"
        />
      </div>

      <SADataTable
        columns={[
          {
            key: "created_at",
            label: "Timestamp",
            render: (row) => (
              <span className="text-white/40" style={saMono}>
                {new Date(String(row.created_at)).toLocaleString()}
              </span>
            ),
          },
          {
            key: "actor_id",
            label: "Actor ID",
            render: (row) => (
              <span className="text-white/60 font-semibold" style={saMono}>
                {row.actor_id ? String(row.actor_id).slice(0, 12) + "..." : "System"}
              </span>
            ),
          },
          {
            key: "action",
            label: "Action",
            render: (row) => (
              <span className="text-xs font-bold text-white/80" style={saMono}>
                {String(row.action)}
              </span>
            ),
          },
          {
            key: "entity",
            label: "Scope",
            render: (row) => (
              <span
                className="text-[10px] uppercase tracking-wide text-[#a78bfa]/60 font-semibold"
                style={saMono}
              >
                {String(row.entity)}
              </span>
            ),
          },
          {
            key: "entity_id",
            label: "Target ID",
            render: (row) => (
              <span className="text-white/35" style={saMono}>
                {row.entity_id ? String(row.entity_id).slice(0, 16) + "..." : "—"}
              </span>
            ),
          },
          {
            key: "metadata",
            label: "Details",
            render: (row) => {
              const meta = row.metadata;
              if (!meta) return <span className="text-white/20">—</span>;
              return (
                <pre
                  className="text-[9px] text-white/30 truncate max-w-xs overflow-hidden"
                  style={saMono}
                >
                  {JSON.stringify(meta)}
                </pre>
              );
            },
          },
        ]}
        data={filtered}
        isLoading={isLoading}
        emptyIcon={FileText}
        emptyMessage="No audit logs matched your query."
      />
    </div>
  );
}
