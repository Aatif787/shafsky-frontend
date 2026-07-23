import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getAdminLounges, updateLoungeStatus } from "@/lib/admin.functions";
import {
  AdminPageHeader,
  AdminDataTable,
  AdminStatusBadge,
  AdminSearchBar,
} from "@/components/admin/AdminComponents";
import { Armchair, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/lounges")({
  component: AdminLoungesPage,
});

function AdminLoungesPage() {
  const queryClient = useQueryClient();
  const fetchLounges = useServerFn(getAdminLounges);
  const execUpdateStatus = useServerFn(updateLoungeStatus);
  const [search, setSearch] = useState("");

  const { data: lounges = [], isLoading } = useQuery({
    queryKey: ["admin-lounges"],
    queryFn: () => fetchLounges(),
    staleTime: 10000,
  });

  const filtered = (lounges as any[]).filter((l: any) => {
    return (
      String(l.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      String(l.terminal || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      String(l.airport?.code || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  });

  const handleStatusChange = async (loungeId: string, status: string) => {
    try {
      await execUpdateStatus({ data: { loungeId, status } });
      toast.success(`Lounge status updated to ${status}`);
      queryClient.invalidateQueries({ queryKey: ["admin-lounges"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update lounge status");
    }
  };

  return (
    <div className="space-y-6 text-left">
      <AdminPageHeader
        title="Lounge Monitoring & Capacity"
        subtitle="Manage real-time occupancy, queue, and operational statuses"
        breadcrumbs={[{ label: "Operations Panel", href: "/admin" }, { label: "Lounges" }]}
      />

      <div className="flex gap-4">
        <AdminSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by lounge name, terminal, or airport..."
          className="max-w-md flex-1"
        />
      </div>

      <AdminDataTable
        columns={[
          {
            key: "name",
            label: "Lounge Name",
            render: (row: any) => (
              <div>
                <span className="font-semibold text-white/95">{row.name}</span>
                {row.airport && (
                  <div className="text-[10px] text-white/30 font-mono mt-0.5">
                    {row.airport.code} — {row.airport.name}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "terminal",
            label: "Terminal",
            render: (row: any) => (
              <span className="font-mono text-white/50">{row.terminal || "—"}</span>
            ),
          },
          {
            key: "capacity",
            label: "Capacity & Queue",
            render: (row: any) => {
              const occ = Number(row.current_occupancy) || 0;
              const cap = Number(row.capacity) || 50;
              const pct = Math.round((occ / cap) * 100);
              return (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-white/40 font-mono">
                    <span>
                      Occupancy: {occ}/{cap} ({pct}%)
                    </span>
                    {row.queue_count > 0 && (
                      <span className="text-yellow-400">Queue: {row.queue_count} waiting</span>
                    )}
                  </div>
                  <div className="w-24 bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct > 85 ? "bg-red-400" : pct > 60 ? "bg-yellow-400" : "bg-emerald-400"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            },
          },
          {
            key: "status",
            label: "Operational Status",
            render: (row: any) => <AdminStatusBadge status={row.status} />,
          },
          {
            key: "actions",
            label: "Action Clearances",
            className: "text-right",
            render: (row: any) => (
              <div className="flex items-center justify-end gap-1.5">
                <select
                  value={row.status}
                  onChange={(e) => handleStatusChange(row.id, e.target.value)}
                  className="h-8 px-2 bg-[#0c121b] border border-white/10 rounded text-[11px] text-white/70 outline-none"
                >
                  <option value="active" className="bg-[#0c121b] text-white">
                    Active
                  </option>
                  <option value="maintenance" className="bg-[#0c121b] text-white">
                    Maintenance
                  </option>
                  <option value="closed" className="bg-[#0c121b] text-white">
                    Closed
                  </option>
                </select>
              </div>
            ),
          },
        ]}
        data={filtered}
        isLoading={isLoading}
        emptyMessage="No lounges found."
      />
    </div>
  );
}
