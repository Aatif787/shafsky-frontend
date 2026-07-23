import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listSecurityEvents, addIpRestriction } from "@/lib/super-admin.functions";
import {
  SAPageHeader,
  SADataTable,
  SAStatusBadge,
  saMono,
  saTheme,
} from "@/components/super-admin/SAComponents";
import { ShieldAlert, Plus, Lock, Globe } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/super-admin/security")({
  component: SecurityPage,
});

function SecurityPage() {
  const queryClient = useQueryClient();
  const fetchEvents = useServerFn(listSecurityEvents);
  const execAddIp = useServerFn(addIpRestriction);

  const [ipAddress, setIpAddress] = useState("");
  const [restrictionType, setRestrictionType] = useState("whitelist");
  const [reason, setReason] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["sa-security-info"],
    queryFn: () => fetchEvents(),
    staleTime: 15000,
  });

  const handleAddIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipAddress) return;
    try {
      await execAddIp({ data: { ip_address: ipAddress, type: restrictionType, reason } });
      toast.success(`IP ${ipAddress} added to ${restrictionType}`);
      setIpAddress("");
      setReason("");
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["sa-security-info"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to add IP restriction");
    }
  };

  const securityEvents = data?.events || [];
  const ipRestrictions = data?.ipRestrictions || [];

  return (
    <div className="space-y-6">
      <SAPageHeader
        title="Security & Platform Whitelist"
        subtitle="IP Restrictions, access control logs, and authentication attempts"
        breadcrumbs={[{ label: "Super Admin", href: "/super-admin" }, { label: "Security" }]}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* IP Restrictions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center">
            <h3
              className="text-[10px] uppercase tracking-[0.25em] text-[#a78bfa]/60"
              style={saMono}
            >
              IP Whitelist & Blacklist
            </h3>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#a78bfa]/10 hover:bg-[#a78bfa]/20 text-[#a78bfa] text-[9px] font-bold uppercase tracking-wider rounded transition cursor-pointer"
              style={saMono}
            >
              <Plus className="h-3 w-3" />
              Configure IP
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleAddIp}
              className="border border-[#a78bfa]/20 rounded-lg p-4 space-y-3"
              style={{ background: saTheme.panel }}
            >
              <div>
                <label
                  className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block"
                  style={saMono}
                >
                  IP Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 192.168.1.1"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className="w-full h-8 px-3 bg-white/[0.03] border border-white/[0.08] rounded text-xs text-white/80 placeholder:text-white/20 outline-none focus:border-[#a78bfa]/30"
                />
              </div>
              <div>
                <label
                  className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block"
                  style={saMono}
                >
                  Type
                </label>
                <select
                  value={restrictionType}
                  onChange={(e) => setRestrictionType(e.target.value)}
                  className="w-full h-8 px-2 bg-[#0c121b] border border-white/[0.08] rounded text-xs text-white/80 outline-none"
                >
                  <option value="whitelist" className="bg-[#0c121b] text-white">
                    Whitelist (Access Allowed)
                  </option>
                  <option value="blacklist" className="bg-[#0c121b] text-white">
                    Blacklist (Access Blocked)
                  </option>
                </select>
              </div>
              <div>
                <label
                  className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block"
                  style={saMono}
                >
                  Reason
                </label>
                <input
                  type="text"
                  placeholder="Office network, suspicious activity etc."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-8 px-3 bg-white/[0.03] border border-white/[0.08] rounded text-xs text-white/80 placeholder:text-white/20 outline-none focus:border-[#a78bfa]/30"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#a78bfa] hover:bg-[#9672f5] text-white text-[9px] font-bold uppercase tracking-wider rounded transition cursor-pointer"
                style={saMono}
              >
                Save Restriction
              </button>
            </form>
          )}

          <div className="space-y-2.5">
            {isLoading ? (
              <div className="text-xs text-white/30" style={saMono}>
                Loading...
              </div>
            ) : ipRestrictions.length === 0 ? (
              <div
                className="text-xs text-white/25 p-4 border border-white/[0.03] rounded-md text-center bg-white/[0.01]"
                style={saMono}
              >
                No IP restrictions configured.
              </div>
            ) : (
              ipRestrictions.map((ip: any) => (
                <div
                  key={ip.id}
                  className="p-3 border border-white/[0.03] rounded-md flex items-center justify-between"
                  style={{ background: saTheme.panel }}
                >
                  <div>
                    <div
                      className="text-xs font-semibold text-white/85 flex items-center gap-1.5"
                      style={saMono}
                    >
                      <Globe className="h-3 w-3 text-white/30" />
                      {ip.ip_address}
                    </div>
                    {ip.reason && <p className="text-[9px] text-white/30 mt-0.5">{ip.reason}</p>}
                  </div>
                  <SAStatusBadge status={ip.type} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security Logs / Attempts */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#a78bfa]/60" style={saMono}>
            Security Checkpoint Logs
          </h3>
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
                key: "action",
                label: "Action / Event",
                render: (row) => (
                  <span className="text-xs font-bold text-white/80" style={saMono}>
                    {String(row.action)}
                  </span>
                ),
              },
              {
                key: "actor_id",
                label: "Actor",
                render: (row) => (
                  <span className="text-white/50 text-[11px]" style={saMono}>
                    {row.actor_id ? String(row.actor_id).slice(0, 12) + "..." : "System"}
                  </span>
                ),
              },
              {
                key: "entity",
                label: "Scope",
                render: (row) => (
                  <span
                    className="text-[10px] uppercase tracking-wide text-white/45 bg-white/[0.03] px-1.5 py-0.5 rounded"
                    style={saMono}
                  >
                    {String(row.entity)}
                  </span>
                ),
              },
            ]}
            data={securityEvents}
            isLoading={isLoading}
            emptyIcon={ShieldAlert}
            emptyMessage="No checkpoint activities logged."
          />
        </div>
      </div>
    </div>
  );
}
