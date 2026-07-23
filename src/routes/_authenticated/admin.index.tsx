import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardMetrics } from "@/lib/bookings.functions";
import { pageDisplay, pageMono, Panel } from "@/components/site/PageShell";
import { Loader2, AlertTriangle, ArrowUpRight, TrendingUp, Inbox, UserCheck2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardView,
});

function DashboardView() {
  const fetchMetrics = useServerFn(getAdminDashboardMetrics);
  const {
    data: metrics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-dashboard-metrics"],
    queryFn: () => fetchMetrics(),
    refetchInterval: 10000, // Live updates every 10s
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5ed3ff]" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <Panel tone="dark" className="p-6 border border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <span className="text-sm font-semibold">Failed to load dashboard metrics.</span>
        </div>
      </Panel>
    );
  }

  // Calculate status counters
  const total = metrics.bookings.length;
  const pending = metrics.bookings.filter((b) => b.status === "pending").length;
  const reviewing = metrics.bookings.filter((b) => b.status === "reviewing").length;
  const quoted = metrics.bookings.filter((b) => b.status === "quoted").length;
  const approved = metrics.bookings.filter((b) => b.status === "approved").length;
  const confirmed = metrics.bookings.filter((b) => b.status === "confirmed").length;
  const completed = metrics.bookings.filter((b) => b.status === "completed").length;
  const cancelled = metrics.bookings.filter((b) => b.status === "cancelled").length;

  // Flight eligibility breakdowns
  const manual = metrics.bookings.filter((b) => b.verification_type === "MANUAL_ENTRY").length;
  const autoVerified = metrics.bookings.filter(
    (b) => b.verification_type === "AUTO_VERIFIED",
  ).length;

  // Guest vs Clerk
  const guest = metrics.bookings.filter((b) => !b.user_id).length;
  const member = metrics.bookings.filter((b) => b.user_id).length;

  // Dates (Today and Upcoming)
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayBookings = metrics.bookings.filter((b) => b.depart_date.startsWith(todayStr)).length;
  const upcomingBookings = metrics.bookings.filter((b) => b.depart_date > todayStr).length;

  // Recent contact inquiries
  const activeInquiries = metrics.messages.filter((m) => m.status === "new");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold leading-tight" style={pageDisplay}>
          Live Operational <em className="text-[#5ed3ff]">Overview.</em>
        </h1>
        <p className="text-xs text-white/50 uppercase tracking-widest mt-1" style={pageMono}>
          Updated in real-time
        </p>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Bookings" value={total} trend="Total requested" />
        <KpiCard label="Concierge Queue" value={pending} accent trend="Awaiting review" />
        <KpiCard
          label="Inbound Inquiries"
          value={activeInquiries.length}
          accent={activeInquiries.length > 0}
          trend="New messages"
        />
        <KpiCard
          label="Notification Failures"
          value={metrics.notifFailures}
          accent={metrics.notifFailures > 0}
          trend="Delivery errors"
        />
      </div>

      {/* Detailed Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Status Breakdown Panel */}
        <Panel tone="dark" className="p-6 space-y-6">
          <h3
            className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5ed3ff]"
            style={pageMono}
          >
            Bookings Status Breakdown
          </h3>
          <div className="space-y-3.5 text-xs">
            <StatusRow label="Pending Verification" value={pending} color="text-yellow-400" />
            <StatusRow label="Under Review" value={reviewing} color="text-blue-400" />
            <StatusRow label="Quotation Sent" value={quoted} color="text-[#5ed3ff]" />
            <StatusRow label="Approved by Client" value={approved} color="text-emerald-400" />
            <StatusRow label="Confirmed & Assigned" value={confirmed} color="text-purple-400" />
            <StatusRow label="Completed Journeys" value={completed} color="text-white/60" />
            <StatusRow label="Cancelled" value={cancelled} color="text-red-400" />
          </div>
        </Panel>

        {/* Verification & Guest Splits */}
        <Panel tone="dark" className="p-6 space-y-6">
          <h3
            className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5ed3ff]"
            style={pageMono}
          >
            Flight Ops Metrics
          </h3>
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between text-white/50">
                <span>Guest Checkout</span>
                <span>{guest}</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#5ed3ff] h-full"
                  style={{ width: `${total ? (guest / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-white/50">
                <span>Auto-Verified Flights</span>
                <span>{autoVerified}</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full"
                  style={{ width: `${total ? (autoVerified / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-white/50">
                <span>Manual Verification Fallback</span>
                <span>{manual}</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-yellow-400 h-full"
                  style={{ width: `${total ? (manual / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
              <div className="text-center bg-white/[0.02] border border-white/5 py-2.5">
                <div className="text-lg font-bold">{todayBookings}</div>
                <div
                  className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5"
                  style={pageMono}
                >
                  Today
                </div>
              </div>
              <div className="text-center bg-white/[0.02] border border-white/5 py-2.5">
                <div className="text-lg font-bold">{upcomingBookings}</div>
                <div
                  className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5"
                  style={pageMono}
                >
                  Upcoming
                </div>
              </div>
            </div>
          </div>
        </Panel>

        {/* Recent Activity Log */}
        <Panel tone="dark" className="p-6 space-y-6">
          <h3
            className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5ed3ff]"
            style={pageMono}
          >
            Recent Activity
          </h3>
          <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1 text-xs">
            {metrics.recentActivity.map((a) => (
              <div key={a.id} className="border-l border-white/10 pl-3.5 space-y-1 py-0.5">
                <div className="flex justify-between text-[10px] text-white/30" style={pageMono}>
                  <span>{a.action}</span>
                  <span>{new Date(a.created_at).toLocaleTimeString()}</span>
                </div>
                <div className="text-white/80 truncate">
                  Entity ID:{" "}
                  <Link to={`/admin/bookings`} className="hover:text-[#5ed3ff] underline">
                    {a.entity_id?.slice(0, 8)}...
                  </Link>
                </div>
              </div>
            ))}
            {metrics.recentActivity.length === 0 && (
              <div className="text-center text-white/30 py-10">No recent actions logged.</div>
            )}
          </div>
        </Panel>
      </div>

      {/* Customer Inquiries Feed */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold uppercase tracking-wider" style={pageMono}>
          Active Customer Inquiries
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {activeInquiries.slice(0, 4).map((inq) => (
            <Panel key={inq.id} tone="dark" className="p-5 flex flex-col justify-between">
              <div>
                <div
                  className="flex justify-between items-center text-[10px] text-white/40 uppercase tracking-wider"
                  style={pageMono}
                >
                  <span>{inq.name}</span>
                  <span>{new Date(inq.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-sm font-semibold text-white/90 mt-2">
                  {inq.subject || "No Subject"}
                </div>
                <p className="text-xs text-white/60 mt-1 line-clamp-2">{inq.message}</p>
              </div>
              <div className="flex justify-between items-center pt-4 mt-4 border-t border-white/5">
                <span className="text-[10px] text-white/40 font-mono">{inq.email}</span>
                <Link
                  to="/admin/customers"
                  className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-[#5ed3ff] hover:underline"
                  style={pageMono}
                >
                  Respond <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </Panel>
          ))}
          {activeInquiries.length === 0 && (
            <div className="md:col-span-2 text-center text-white/30 border border-dashed border-white/10 rounded-lg py-12">
              <Inbox className="h-6 w-6 mx-auto mb-2 text-white/20" />
              <div className="text-xs">No active customer inquiries.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  accent,
  trend,
}: {
  label: string;
  value: number;
  accent?: boolean;
  trend: string;
}) {
  return (
    <Panel tone="dark" className="p-5">
      <div className="text-[10px] uppercase tracking-widest text-white/40" style={pageMono}>
        {label}
      </div>
      <div
        className="text-3xl font-semibold mt-1"
        style={{ ...pageDisplay, color: accent ? "#5ed3ff" : "#fff" }}
      >
        {value}
      </div>
      <div className="text-[10px] text-white/30 mt-2 flex items-center gap-1.5" style={pageMono}>
        <TrendingUp className="h-3 w-3 text-white/20" />
        {trend}
      </div>
    </Panel>
  );
}

function StatusRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${color.split(" ")[0]} bg-current`} />
        <span className="text-white/70">{label}</span>
      </div>
      <span className="font-semibold text-white/95">{value}</span>
    </div>
  );
}
