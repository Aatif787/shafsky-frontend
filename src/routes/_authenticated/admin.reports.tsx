import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listAllBookings, listNotificationLogs } from "@/lib/bookings.functions";
import { parseFlightInfo } from "@/lib/notification-templates";
import { pageMono, pageDisplay, Panel } from "@/components/site/PageShell";
import {
  Loader2,
  AlertTriangle,
  TrendingUp,
  BarChart,
  PieChart,
  TrendingDown,
  Plane,
  ShieldCheck,
  User,
  BellRing,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: ReportsView,
});

const COLORS = ["#5ed3ff", "#5fb5ad", "#a78bfa", "#f472b6", "#fb7185", "#38bdf8", "#34d399"];

function ReportsView() {
  const fetchBookings = useServerFn(listAllBookings);
  const fetchLogs = useServerFn(listNotificationLogs);

  const {
    data: bookings,
    isLoading: bookingsLoading,
    error: bookingsErr,
  } = useQuery({
    queryKey: ["admin-bookings-analytics"],
    queryFn: () => fetchBookings(),
  });

  const {
    data: logs,
    isLoading: logsLoading,
    error: logsErr,
  } = useQuery({
    queryKey: ["admin-logs-analytics"],
    queryFn: () => fetchLogs(),
  });

  if (bookingsLoading || logsLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5ed3ff]" />
      </div>
    );
  }

  if (bookingsErr || logsErr || !bookings) {
    return (
      <Panel tone="dark" className="p-6 border border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <span className="text-sm font-semibold">Failed to load analytical reports.</span>
        </div>
      </Panel>
    );
  }

  // Calculate stats
  const getMonthlyRevenueData = () => {
    const dataMap: Record<string, number> = {};
    bookings.forEach((b) => {
      if (b.quote_amount) {
        const dateKey = new Date(b.created_at).toISOString().slice(0, 7); // YYYY-MM
        dataMap[dateKey] = (dataMap[dateKey] || 0) + Number(b.quote_amount);
      }
    });
    return Object.entries(dataMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const getMonthlyVolumeData = () => {
    const dataMap: Record<string, number> = {};
    bookings.forEach((b) => {
      const dateKey = new Date(b.created_at).toISOString().slice(0, 7); // YYYY-MM
      dataMap[dateKey] = (dataMap[dateKey] || 0) + 1;
    });
    return Object.entries(dataMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const getRouteVolumeData = () => {
    const routeMap: Record<string, number> = {};
    bookings.forEach((b) => {
      const key = `${b.origin} - ${b.destination}`;
      routeMap[key] = (routeMap[key] || 0) + 1;
    });
    return Object.entries(routeMap)
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getAirlineVolumeData = () => {
    const airlineMap: Record<string, number> = {};
    bookings.forEach((b) => {
      const info = parseFlightInfo(b.notes);
      const carrier = info.airline && info.airline !== "—" ? info.airline : "Other Carriers";
      airlineMap[carrier] = (airlineMap[carrier] || 0) + 1;
    });
    return Object.entries(airlineMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const getVerificationSplit = () => {
    const manual = bookings.filter((b) => b.verification_type === "MANUAL_ENTRY").length;
    const auto = bookings.filter((b) => b.verification_type !== "MANUAL_ENTRY").length;
    return [
      { name: "Auto Verified", value: auto },
      { name: "Manual Fallback", value: manual },
    ];
  };

  const getCheckoutSplit = () => {
    const guests = bookings.filter((b) => !b.user_id).length;
    const members = bookings.filter((b) => b.user_id).length;
    return [
      { name: "Guest Checkout", value: guests },
      { name: "Registered Member", value: members },
    ];
  };

  const getNotificationStats = () => {
    const total = (logs ?? []).length;
    const failures = (logs ?? []).filter((l) => l.status === "failed").length;
    const sent = total - failures;
    return { total, sent, failures };
  };

  const getFunnelData = () => {
    const total = bookings.length;
    const reviewed = bookings.filter((b) => b.status !== "pending").length;
    const quoted = bookings.filter((b) =>
      ["quoted", "approved", "confirmed", "completed"].includes(b.status),
    ).length;
    const confirmed = bookings.filter((b) => ["confirmed", "completed"].includes(b.status)).length;

    return [
      { step: "Requested", count: total },
      { step: "Reviewed", count: reviewed },
      { step: "Quoted", count: quoted },
      { step: "Confirmed", count: confirmed },
    ];
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold leading-tight" style={pageDisplay}>
          Analytical <em className="text-[#5ed3ff]">Dossiers.</em>
        </h1>
        <p className="text-xs text-white/50 uppercase tracking-widest mt-1" style={pageMono}>
          Operational and financial analytics summaries
        </p>
      </div>

      {/* Primary Graphs */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel tone="dark" className="p-6 space-y-4">
          <h3
            className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5ed3ff]"
            style={pageMono}
          >
            Quoted Revenue Stream (INR)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={getMonthlyRevenueData()}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5ed3ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#5ed3ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.4)"
                  style={{ fontSize: 10, fontFamily: "monospace" }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.4)"
                  style={{ fontSize: 10, fontFamily: "monospace" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0c121b",
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#5ed3ff"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel tone="dark" className="p-6 space-y-4">
          <h3
            className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5ed3ff]"
            style={pageMono}
          >
            Trip Request Volume over Time
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={getMonthlyVolumeData()}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.4)"
                  style={{ fontSize: 10, fontFamily: "monospace" }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.4)"
                  style={{ fontSize: 10, fontFamily: "monospace" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0c121b",
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="count" fill="#5ed3ff" opacity={0.8} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Routes */}
        <Panel tone="dark" className="p-6 space-y-6">
          <h3
            className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5ed3ff]"
            style={pageMono}
          >
            Top Flight Route Volumes
          </h3>
          <div className="space-y-4 text-xs">
            {getRouteVolumeData().map((item, idx) => (
              <div key={item.route} className="space-y-1">
                <div className="flex justify-between text-white/70">
                  <span>
                    {idx + 1}. {item.route}
                  </span>
                  <span className="font-semibold">{item.count} requested</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#5ed3ff] h-full"
                    style={{
                      width: `${bookings.length ? (item.count / bookings.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Funnel chart */}
        <Panel tone="dark" className="p-6 space-y-6">
          <h3
            className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5ed3ff]"
            style={pageMono}
          >
            Ops Conversion Funnel
          </h3>
          <div className="space-y-4 text-xs">
            {getFunnelData().map((item, idx, arr) => {
              const prevCount = idx > 0 ? arr[idx - 1].count : item.count;
              const dropPercent = prevCount ? Math.round((item.count / prevCount) * 100) : 100;
              const totalPercent = arr[0].count
                ? Math.round((item.count / arr[0].count) * 100)
                : 100;

              return (
                <div key={item.step} className="flex items-center gap-4">
                  <div className="w-20 font-mono text-white/50">{item.step}</div>
                  <div className="flex-1 bg-white/5 h-6 rounded relative overflow-hidden flex items-center px-3">
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-[#5ed3ff]/10 border-r border-[#5ed3ff]/20"
                      style={{ width: `${totalPercent}%` }}
                    />
                    <span className="relative font-bold font-mono">{item.count}</span>
                  </div>
                  <div className="w-16 text-right font-mono text-white/45">
                    {idx > 0 ? `${dropPercent}%` : "100%"}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Airline Carrier Share */}
        <Panel tone="dark" className="p-6 space-y-4 lg:col-span-2">
          <h3
            className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5ed3ff]"
            style={pageMono}
          >
            Airline Share Breakdown
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="h-48 w-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={getAirlineVolumeData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {getAirlineVolumeData().map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0c121b",
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "#fff",
                      fontSize: 11,
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full space-y-2 text-xs">
              {getAirlineVolumeData()
                .slice(0, 5)
                .map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="text-white/70">{item.name}</span>
                    </div>
                    <span className="font-mono text-white/45 font-bold">
                      {item.value} (
                      {Math.round(bookings.length ? (item.value / bookings.length) * 100 : 0)}%)
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </Panel>

        {/* Verification and Member Splits */}
        <Panel tone="dark" className="p-6 space-y-6">
          <h3
            className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5ed3ff]"
            style={pageMono}
          >
            Checkout Metrics
          </h3>
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <div className="text-[10px] text-white/45 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3" /> Verification Split
              </div>
              {getVerificationSplit().map((item) => (
                <div
                  key={item.name}
                  className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-2 rounded"
                >
                  <span className="text-white/70">{item.name}</span>
                  <span className="font-bold font-mono text-[#5ed3ff]">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="text-[10px] text-white/45 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <User className="h-3 w-3" /> Customer Tier
              </div>
              {getCheckoutSplit().map((item) => (
                <div
                  key={item.name}
                  className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-2 rounded"
                >
                  <span className="text-white/70">{item.name}</span>
                  <span className="font-bold font-mono text-[#5ed3ff]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* Messaging Deliverability Summary */}
      <Panel tone="dark" className="p-6 space-y-4">
        <h3
          className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5ed3ff]"
          style={pageMono}
        >
          <BellRing className="h-4 w-4 inline mr-1 text-[#5ed3ff] relative -top-0.5" /> Messaging
          Deliverability & Alerts
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="border border-white/10 bg-[#090d16]/30 p-4 rounded-xl">
            <span className="text-[10px] uppercase text-white/40 block font-mono">
              Total Logged Notifications
            </span>
            <span className="text-2xl font-bold text-white font-mono">
              {getNotificationStats().total}
            </span>
          </div>
          <div className="border border-white/10 bg-emerald-500/5 border-emerald-500/10 p-4 rounded-xl">
            <span className="text-[10px] uppercase text-emerald-400/40 block font-mono">
              Successfully Sent
            </span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              {getNotificationStats().sent}
            </span>
          </div>
          <div className="border border-white/10 bg-red-500/5 border-red-500/10 p-4 rounded-xl">
            <span className="text-[10px] uppercase text-red-400/40 block font-mono">
              Delivery Failures
            </span>
            <span className="text-2xl font-bold text-red-400 font-mono">
              {getNotificationStats().failures}
            </span>
          </div>
        </div>
      </Panel>
    </div>
  );
}
