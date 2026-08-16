import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getSuperAdminKPIs } from "@/lib/super-admin.functions";
import {
  SAPageHeader,
  SAKpiCard,
  saTheme,
  saMono,
  saDisplay,
} from "@/components/super-admin/SAComponents";
import {
  Users,
  Plane,
  CreditCard,
  BarChart3,
  Activity,
  Armchair,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/_authenticated/super-admin/")({
  component: SuperAdminDashboard,
});

function SuperAdminDashboard() {
  const fetchKPIs = useServerFn(getSuperAdminKPIs);
  const { data: kpis, isLoading } = useQuery({
    queryKey: ["super-admin-kpis"],
    queryFn: () => fetchKPIs(),
    refetchInterval: 15000,
  });

  if (isLoading || !kpis) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#a78bfa]" />
      </div>
    );
  }

  // Aggregate bookings by day for chart
  const dailyBookings = new Map<string, { date: string; count: number; revenue: number }>();
  (kpis.recentBookings || []).forEach((b) => {
    const day = String(b.created_at).slice(0, 10);
    const existing = dailyBookings.get(day) || { date: day, count: 0, revenue: 0 };
    existing.count++;
    existing.revenue += Number(b.quote_amount) || 0;
    dailyBookings.set(day, existing);
  });
  const chartData = Array.from(dailyBookings.values()).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-8">
      <SAPageHeader
        title="Platform Overview"
        subtitle="Global KPIs and real-time platform analytics"
        breadcrumbs={[{ label: "Super Admin" }, { label: "Dashboard" }]}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <SAKpiCard
          label="Total Users"
          value={kpis.totalUsers}
          icon={Users}
          trend="All registered accounts"
        />
        <SAKpiCard
          label="Total Bookings"
          value={kpis.totalBookings}
          icon={BarChart3}
          trend="Lifetime bookings"
        />
        <SAKpiCard
          label="Revenue"
          value={`₹${kpis.totalRevenue.toLocaleString()}`}
          icon={CreditCard}
          trend="Confirmed + completed"
        />
        <SAKpiCard
          label="Admin Count"
          value={kpis.adminCount ?? 0}
          icon={ShieldCheck}
          trend="Admin & super admin"
        />
        <SAKpiCard
          label="Airports"
          value={kpis.airportCount ?? 0}
          icon={Plane}
          trend="Active airports"
        />
        <SAKpiCard label="Lounges" value={kpis.loungeCount ?? kpis.activeLounges} icon={Armchair} trend="All lounges" />
      </div>

      {/* Chart + Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Booking Trend Chart */}
        <div
          className="lg:col-span-2 border border-white/[0.04] rounded-lg p-6"
          style={{ background: saTheme.panel }}
        >
          <h3
            className="text-[10px] uppercase tracking-[0.25em] text-[#a78bfa]/60 mb-6"
            style={saMono}
          >
            Booking Trend — Last 30 Days
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="saGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(5)}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: saTheme.panel,
                    border: "1px solid rgba(167,139,250,0.2)",
                    borderRadius: "6px",
                    fontSize: 11,
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#a78bfa"
                  fill="url(#saGrad)"
                  strokeWidth={2}
                  name="Bookings"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="flex items-center justify-center h-[260px] text-white/20 text-xs"
              style={saMono}
            >
              No booking data in the last 30 days
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div
          className="border border-white/[0.04] rounded-lg p-6"
          style={{ background: saTheme.panel }}
        >
          <h3
            className="text-[10px] uppercase tracking-[0.25em] text-[#a78bfa]/60 mb-4"
            style={saMono}
          >
            Recent Platform Activity
          </h3>
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {(kpis.recentActivity || []).length === 0 ? (
              <div className="text-center text-white/20 py-10 text-xs" style={saMono}>
                No recent activity
              </div>
            ) : (
              (kpis.recentActivity || []).map((a, i) => (
                <div
                  key={String(a.id || i)}
                  className="border-l-2 border-[#a78bfa]/20 pl-3 py-1 space-y-0.5"
                >
                  <div className="flex justify-between text-[10px] text-white/25" style={saMono}>
                    <span className="font-semibold text-white/50">{String(a.action)}</span>
                    <span>{new Date(String(a.created_at)).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[10px] text-white/35" style={saMono}>
                    {String(a.entity)} {a.entity_id ? `#${String(a.entity_id).slice(0, 8)}` : ""}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div
        className="border border-white/[0.04] rounded-lg p-6"
        style={{ background: saTheme.panel }}
      >
        <h3
          className="text-[10px] uppercase tracking-[0.25em] text-[#a78bfa]/60 mb-4"
          style={saMono}
        >
          System Health
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Database", status: "online", detail: "Supabase PostgreSQL" },
            { name: "Authentication", status: "online", detail: "Supabase Auth" },
            { name: "Edge Functions", status: "online", detail: "TanStack Server Fns" },
            { name: "Storage", status: "online", detail: "Supabase Storage" },
          ].map((sys) => (
            <div
              key={sys.name}
              className="flex items-center justify-between p-4 border border-white/[0.04] rounded-md bg-white/[0.01]"
            >
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-white/80">{sys.name}</div>
                  <div className="text-[9px] text-white/30" style={saMono}>
                    {sys.detail}
                  </div>
                </div>
              </div>
              <span
                className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                style={saMono}
              >
                {sys.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
