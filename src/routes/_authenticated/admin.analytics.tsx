import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listAllBookings, listAssignableStaff } from "@/lib/bookings.functions";
import { pageMono, pageDisplay, Panel } from "@/components/site/PageShell";
import {
  Loader2,
  AlertTriangle,
  PieChart as PieIcon,
  Users as UsersIcon,
  PlaneTakeoff,
  TrendingUp,
} from "lucide-react";
import { getCustomerAnalytics } from "@/lib/crm.functions";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from "recharts";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AnalyticsDashboardView,
});

const COLORS = ["#5ed3ff", "#5fb5ad", "#a78bfa", "#f472b6", "#fb7185", "#38bdf8", "#34d399"];

function AnalyticsDashboardView() {
  const fetchBookings = useServerFn(listAllBookings);
  const fetchStaff = useServerFn(listAssignableStaff);
  const fetchCRMAnalytics = useServerFn(getCustomerAnalytics);

  const { data: crmAnalytics } = useQuery({
    queryKey: ["admin-analytics-crm"],
    queryFn: () => fetchCRMAnalytics(),
  });

  const {
    data: bookings,
    isLoading: bookingsLoading,
    error: bookingsErr,
  } = useQuery({
    queryKey: ["admin-analytics-bookings"],
    queryFn: () => fetchBookings(),
  });

  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ["admin-analytics-staff"],
    queryFn: () => fetchStaff(),
  });

  if (bookingsLoading || staffLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5ed3ff]" />
      </div>
    );
  }

  if (bookingsErr || !bookings) {
    return (
      <Panel tone="dark" className="p-6 border border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <span className="text-sm font-semibold">Failed to load analytics dossiers.</span>
        </div>
      </Panel>
    );
  }

  // 1. Popular Services Breakdown
  const getPopularServicesData = () => {
    const servicesMap: Record<string, { name: string; value: number }> = {};
    bookings.forEach((b) => {
      const svcs = (b as any).booking_services || [];
      svcs.forEach((s: any) => {
        const key = s.service_name;
        if (!servicesMap[key]) {
          servicesMap[key] = { name: key, value: 0 };
        }
        servicesMap[key].value += s.quantity || 1;
      });
    });
    return Object.values(servicesMap)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  // 2. Staff Workload & Performance
  const getStaffWorkloadData = () => {
    const workloadMap: Record<string, number> = {};
    bookings.forEach((b) => {
      if (b.assigned_to) {
        workloadMap[b.assigned_to] = (workloadMap[b.assigned_to] || 0) + 1;
      }
    });

    return (staff ?? [])
      .map((s) => {
        return {
          name: s.full_name || "Agent",
          count: workloadMap[s.id] || 0,
        };
      })
      .sort((a, b) => b.count - a.count);
  };

  // 3. Popular Origin Airports
  const getAirportVolumeData = () => {
    const airportsMap: Record<string, number> = {};
    bookings.forEach((b) => {
      airportsMap[b.origin] = (airportsMap[b.origin] || 0) + 1;
      airportsMap[b.destination] = (airportsMap[b.destination] || 0) + 1;
    });
    return Object.entries(airportsMap)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  };

  // 4. Conversion Analysis
  const totalRequests = bookings.length;
  const quotedRequests = bookings.filter((b) =>
    ["quoted", "approved", "confirmed", "completed"].includes(b.status),
  ).length;
  const confirmedRequests = bookings.filter((b) =>
    ["confirmed", "completed"].includes(b.status),
  ).length;
  const completedRequests = bookings.filter((b) => b.status === "completed").length;

  const conversionRate = totalRequests ? Math.round((confirmedRequests / totalRequests) * 100) : 0;
  const quoteAcceptanceRate = quotedRequests
    ? Math.round((confirmedRequests / quotedRequests) * 100)
    : 0;

  return (
    <div className="space-y-10 text-xs">
      <div>
        <h1 className="text-4xl font-bold leading-tight" style={pageDisplay}>
          Operations <em className="text-[#5ed3ff]">Analytics.</em>
        </h1>
        <p className="text-xs text-white/50 uppercase tracking-widest mt-1" style={pageMono}>
          Granular statistics, service demand, and agent workloads
        </p>
      </div>

      {/* KPI Overviews */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Panel tone="dark" className="p-5">
          <div className="text-white/40 uppercase tracking-wider font-mono text-[9px]">
            Conversion Rate
          </div>
          <div className="text-3xl font-semibold mt-1 text-[#5ed3ff] font-mono">
            {conversionRate}%
          </div>
          <div className="text-[10px] text-white/35 mt-2 font-mono">Requests to bookings</div>
        </Panel>
        <Panel tone="dark" className="p-5">
          <div className="text-white/40 uppercase tracking-wider font-mono text-[9px]">
            Quote Acceptance
          </div>
          <div className="text-3xl font-semibold mt-1 text-emerald-400 font-mono">
            {quoteAcceptanceRate}%
          </div>
          <div className="text-[10px] text-white/35 mt-2 font-mono">Quotes approved by clients</div>
        </Panel>
        <Panel tone="dark" className="p-5">
          <div className="text-white/40 uppercase tracking-wider font-mono text-[9px]">
            Completed Trips
          </div>
          <div className="text-3xl font-semibold mt-1 text-white font-mono">
            {completedRequests}
          </div>
          <div className="text-[10px] text-white/35 mt-2 font-mono">VVIP Journeys completed</div>
        </Panel>
        <Panel tone="dark" className="p-5">
          <div className="text-white/40 uppercase tracking-wider font-mono text-[9px]">
            Active Staff
          </div>
          <div className="text-3xl font-semibold mt-1 text-purple-400 font-mono">
            {(staff ?? []).length}
          </div>
          <div className="text-[10px] text-white/35 mt-2 font-mono">Administrative team size</div>
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Popular Services Demand (Pie Chart) */}
        <Panel tone="dark" className="p-6 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5ed3ff] font-mono flex items-center gap-2">
            <PieIcon className="h-4 w-4" /> Popular Concierge Services Demand
          </h3>
          <div className="h-72 w-full flex flex-col md:flex-row items-center justify-around gap-4">
            <div className="h-56 w-56 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={getPopularServicesData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {getPopularServicesData().map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0c121b",
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "#fff",
                      fontSize: 11,
                      fontFamily: "monospace",
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-mono">
                  TOTAL
                </span>
                <span className="text-xl font-bold font-mono text-white/90">
                  {getPopularServicesData().reduce((acc, curr) => acc + curr.value, 0)}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-2 text-xs font-mono max-h-56 overflow-y-auto pr-2">
              {getPopularServicesData().map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-white/60 truncate max-w-[150px]">{item.name}</span>
                  <span className="font-bold text-white/90">({item.value})</span>
                </div>
              ))}
              {getPopularServicesData().length === 0 && (
                <div className="text-white/30 italic">No services booked yet.</div>
              )}
            </div>
          </div>
        </Panel>

        {/* Staff Workloads (Bar Chart) */}
        <Panel tone="dark" className="p-6 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5ed3ff] font-mono flex items-center gap-2">
            <UsersIcon className="h-4 w-4" /> Staff Workload & Performance
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={getStaffWorkloadData()}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
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
                <Bar dataKey="count" fill="#5fb5ad" radius={[4, 4, 0, 0]} opacity={0.85}>
                  {getStaffWorkloadData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Airport Demand & Volumes */}
      <Panel tone="dark" className="p-6 space-y-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5ed3ff] font-mono flex items-center gap-2">
          <PlaneTakeoff className="h-4 w-4" /> High-Density Airport Traffic Splits
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 font-mono">
          {getAirportVolumeData().map((item, idx) => (
            <div
              key={item.code}
              className="p-4 border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all text-center flex flex-col justify-between"
            >
              <div className="text-[10px] text-white/30 uppercase tracking-widest">
                RANK {idx + 1}
              </div>
              <div className="text-2xl font-bold text-white/90 mt-2">{item.code}</div>
              <div className="text-[10px] text-emerald-400 mt-2 font-semibold">
                {item.count} Movements
              </div>
            </div>
          ))}
          {getAirportVolumeData().length === 0 && (
            <div className="col-span-6 text-center text-white/30 py-6">
              No airport bookings logged.
            </div>
          )}
        </div>
      </Panel>

      {/* CRM Lifetime Value & Loyalty Splits */}
      {crmAnalytics && (
        <Panel tone="dark" className="p-6 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5ed3ff] font-mono flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Customer Relationship Analytics (CRM)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-white/80">
            <div className="bg-[#0c121b] border border-white/5 p-5 rounded-2xl space-y-2">
              <span className="text-white/40 block text-[9px] uppercase tracking-wider font-mono">
                Customer Lifetime Value (CLV)
              </span>
              <strong className="text-2xl font-bold font-mono text-[#5ed3ff]">
                INR {crmAnalytics.totalRevenue.toLocaleString()}
              </strong>
              <p className="text-[10px] text-white/35 font-mono">
                Sum total of all completed & confirmed concierge contracts.
              </p>
            </div>

            <div className="bg-[#0c121b] border border-white/5 p-5 rounded-2xl space-y-2">
              <span className="text-white/40 block text-[9px] uppercase tracking-wider font-mono">
                Repeat Customer Rate
              </span>
              <strong className="text-2xl font-bold font-mono text-emerald-400">
                {crmAnalytics.repeatCustomerRate.toFixed(1)}%
              </strong>
              <p className="text-[10px] text-white/35 font-mono">
                Percentage of registered clients who booked more than once.
              </p>
            </div>

            <div className="bg-[#0c121b] border border-white/5 p-5 rounded-2xl space-y-2">
              <span className="text-white/40 block text-[9px] uppercase tracking-wider font-mono">
                Average Spend Per Booking
              </span>
              <strong className="text-2xl font-bold font-mono text-purple-400">
                INR {crmAnalytics.avgSpend.toLocaleString()}
              </strong>
              <p className="text-[10px] text-white/35 font-mono">
                Average pricing yield calculated across VVIP customer profiles.
              </p>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
