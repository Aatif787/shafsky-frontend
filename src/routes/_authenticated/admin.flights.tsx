import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listAllFlightLogs } from "@/lib/bookings.functions";
import { pageMono, pageDisplay, Panel } from "@/components/site/PageShell";
import { Loader2, AlertTriangle, Search, Plane, ShieldCheck, Calendar, Eye } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/flights")({
  component: FlightsLogView,
});

function FlightsLogView() {
  const fetchLogs = useServerFn(listAllFlightLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const {
    data: logs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-flight-logs"],
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
          <span className="text-sm font-semibold">Failed to load flight logs.</span>
        </div>
      </Panel>
    );
  }

  // Filtering
  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.booking_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.destination.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "auto" && log.verification_type === "AUTO_VERIFIED") ||
      (typeFilter === "manual" && log.verification_type === "MANUAL_ENTRY");

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold leading-tight" style={pageDisplay}>
          Flight <em className="text-[#5ed3ff]">Ops Log.</em>
        </h1>
        <p className="text-xs text-white/50 uppercase tracking-widest mt-1" style={pageMono}>
          Monitor flight validation status and eligibility
        </p>
      </div>

      {/* Toolbar */}
      <div className="grid md:grid-cols-3 gap-4 bg-white/[0.02] border border-white/10 p-5">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
            Search Logs
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by ref, airport code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border border-white/10 px-3 py-2 pl-8 text-xs outline-none focus:border-[#5ed3ff]"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-white/30" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
            Verification Mode
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-[#0c121b] border border-white/10 px-3 py-2 text-xs outline-none focus:border-[#5ed3ff] text-white/70"
            style={{ colorScheme: "dark" }}
          >
            <option value="all" className="bg-[#0c121b] text-white">
              All Entries
            </option>
            <option value="auto" className="bg-[#0c121b] text-white">
              Auto-Verified (AeroData API)
            </option>
            <option value="manual" className="bg-[#0c121b] text-white">
              Manual Fallback (Staff Entry)
            </option>
          </select>
        </div>
      </div>

      {/* Flight Log Timeline Grid */}
      <div className="border border-white/10 bg-[#090d16]/30 overflow-x-auto">
        <table className="w-full text-xs text-left min-w-[900px]">
          <thead className="text-[10px] uppercase tracking-[0.2em] text-white/40 border-b border-white/10 bg-white/[0.01]">
            <tr>
              <th className="p-4">Reference</th>
              <th className="p-4">Flight Route</th>
              <th className="p-4">Departure</th>
              <th className="p-4">Verification Type</th>
              <th className="p-4">6-Hour Eligibility Check</th>
              <th className="p-4 text-right">Dossier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((log) => {
              // Parse eligibility details from notes if any
              const hasRuleWarning =
                log.notes?.toLowerCase().includes("hours before") ||
                log.notes?.toLowerCase().includes("rule");

              return (
                <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-4 font-mono font-semibold text-white/95">{log.booking_ref}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Plane className="h-3.5 w-3.5 text-white/40 shrink-0" />
                      <span className="font-semibold text-white/95">
                        {log.origin} → {log.destination}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-white/30 shrink-0" />
                      <span>{log.depart_date}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold ${
                        log.verification_type === "AUTO_VERIFIED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      }`}
                    >
                      {log.verification_type === "AUTO_VERIFIED" ? "Auto Verified" : "Manual entry"}
                    </span>
                  </td>
                  <td className="p-4">
                    {hasRuleWarning ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-yellow-400 font-medium">
                        <AlertTriangle className="h-3.5 w-3.5" /> Checked (6h rule bypass requested)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                        <ShieldCheck className="h-3.5 w-3.5" /> Checked (Eligible)
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      to="/admin/bookings/$id"
                      params={{ id: log.id }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors uppercase tracking-wider text-[9px]"
                      style={pageMono}
                    >
                      <Eye className="h-3 w-3" /> View
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-white/30">
                  No flight log records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
