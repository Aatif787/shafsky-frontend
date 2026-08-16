import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listNotificationLogs, retryNotificationLog } from "@/lib/bookings.functions";
import { pageMono, pageDisplay, Panel } from "@/components/site/PageShell";
import {
  Loader2,
  AlertTriangle,
  Search,
  RefreshCw,
  Mail,
  MessageSquare,
  AlertOctagon,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/notifications")({
  component: NotificationsLogView,
});

function NotificationsLogView() {
  const fetchLogs = useServerFn(listNotificationLogs);
  const triggerRetry = useServerFn(retryNotificationLog);
  const qc = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const {
    data: logs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-notification-logs"],
    queryFn: () => fetchLogs(),
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5ed3ff]" />
      </div>
    );
  }

  if (error || !logs) {
    return (
      <Panel tone="dark" className="p-6 border border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <span className="text-sm font-semibold">
            Failed to load notification logs. Verify that migrations are complete.
          </span>
        </div>
      </Panel>
    );
  }

  // Filtering
  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.booking_ref || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.template.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesChannel = channelFilter === "all" || log.channel === channelFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;

    return matchesSearch && matchesChannel && matchesStatus;
  });

  const handleRetry = async (logId: string) => {
    setRetryingId(logId);
    try {
      await triggerRetry({ data: { id: logId } });
      toast.success("Notification retried successfully");
      qc.invalidateQueries({ queryKey: ["admin-notification-logs"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Retry failed");
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold leading-tight" style={pageDisplay}>
          Notification <em className="text-[#5ed3ff]">Logs.</em>
        </h1>
        <p className="text-xs text-white/50 uppercase tracking-widest mt-1" style={pageMono}>
          Monitor Resend email and Twilio WhatsApp/SMS delivery logs
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="grid md:grid-cols-4 gap-4 bg-white/[0.02] border border-white/10 p-5 text-xs">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
            Search Recipient or Subject
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Email, phone, template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border border-white/10 px-3 py-2 pl-8 text-xs outline-none focus:border-[#5ed3ff]"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-white/30" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
            Channel
          </label>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="w-full bg-[#0c121b] border border-white/10 px-3 py-2 text-xs outline-none focus:border-[#5ed3ff] text-white/70"
            style={{ colorScheme: "dark" }}
          >
            <option value="all" className="bg-[#0c121b] text-white">
              All Channels
            </option>
            <option value="email" className="bg-[#0c121b] text-white">
              Email (Resend)
            </option>
            <option value="sms" className="bg-[#0c121b] text-white">
              SMS / WhatsApp (Twilio)
            </option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
            Delivery Status
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
            <option value="sent" className="bg-[#0c121b] text-white">
              Sent (Delivered)
            </option>
            <option value="simulated" className="bg-[#0c121b] text-white">
              Simulated (Dev Console)
            </option>
            <option value="failed" className="bg-[#0c121b] text-white">
              Failed
            </option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-white/10 bg-[#090d16]/30 overflow-x-auto">
        <table className="w-full text-xs text-left min-w-[950px]">
          <thead className="text-[10px] uppercase tracking-[0.2em] text-white/40 border-b border-white/10 bg-white/[0.01]">
            <tr>
              <th className="p-4">Recipient</th>
              <th className="p-4">Booking Ref</th>
              <th className="p-4">Template / Channel</th>
              <th className="p-4">Subject</th>
              <th className="p-4">Status</th>
              <th className="p-4">Timestamp</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((log) => {
              const isFailed = log.status === "failed";
              const isSimulated = log.status === "simulated";

              return (
                <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-4 font-mono font-medium text-white/90">{log.recipient}</td>
                  <td className="p-4">
                    {log.booking_ref ? (
                      <span className="font-mono text-[#5ed3ff] font-semibold">
                        {log.booking_ref}
                      </span>
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {log.channel === "email" ? (
                        <Mail className="h-3.5 w-3.5 text-white/40" />
                      ) : (
                        <MessageSquare className="h-3.5 w-3.5 text-[#5ed3ff]" />
                      )}
                      <div>
                        <div className="font-semibold text-white/90">{log.template}</div>
                        <div className="text-[9px] text-white/40 uppercase tracking-widest font-mono mt-0.5">
                          {log.channel}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 truncate max-w-[200px]">
                    {log.subject || <span className="text-white/30">No Subject</span>}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold font-mono ${
                        isFailed
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : isSimulated
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {log.status}
                    </span>
                    {log.error_message && (
                      <div
                        className="text-[9px] text-red-400 mt-1 max-w-[180px] truncate"
                        title={log.error_message}
                      >
                        {log.error_message}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-white/55">{new Date(log.created_at || Date.now()).toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {log.booking_id && (
                        <Link
                          to="/admin/bookings/$id"
                          params={{ id: log.booking_id }}
                          className="p-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded transition-colors text-white/50 hover:text-white"
                          title="View Related Booking"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                      )}
                      <button
                        onClick={() => handleRetry(log.id)}
                        disabled={retryingId === log.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 transition-colors uppercase tracking-wider text-[9px]"
                        style={pageMono}
                      >
                        <RefreshCw
                          className={`h-3 w-3 ${retryingId === log.id ? "animate-spin" : ""}`}
                        />{" "}
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-white/30">
                  No notification logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
