import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listSALounges, upsertLounge, listAirports } from "@/lib/super-admin.functions";
import {
  SAPageHeader,
  SASearchBar,
  SADataTable,
  SAStatusBadge,
  saMono,
  saTheme,
} from "@/components/super-admin/SAComponents";
import { Armchair, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/super-admin/lounges")({
  component: LoungesPage,
});

function LoungesPage() {
  const queryClient = useQueryClient();
  const fetchLounges = useServerFn(listSALounges);
  const fetchAirports = useServerFn(listAirports);
  const execUpsert = useServerFn(upsertLounge);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    airport_id: "",
    name: "",
    terminal: "",
    capacity: "50",
    amenities: "",
  });

  const { data: lounges = [], isLoading } = useQuery({
    queryKey: ["sa-lounges"],
    queryFn: () => fetchLounges(),
    staleTime: 15000,
  });
  const { data: airports = [] } = useQuery({
    queryKey: ["sa-airports"],
    queryFn: () => fetchAirports(),
    staleTime: 30000,
  });

  const filtered = lounges.filter((l) => {
    const q = search.toLowerCase();
    return (
      String(l.name || "")
        .toLowerCase()
        .includes(q) ||
      String(l.terminal || "")
        .toLowerCase()
        .includes(q)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await execUpsert({
        data: {
          airport_id: form.airport_id,
          name: form.name,
          terminal: form.terminal,
          capacity: parseInt(form.capacity) || 50,
          amenities: form.amenities
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean),
          status: "active",
          is_active: true,
        },
      });
      toast.success("Lounge created successfully");
      setForm({ airport_id: "", name: "", terminal: "", capacity: "50", amenities: "" });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["sa-lounges"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to create lounge");
    }
  };

  return (
    <div className="space-y-6">
      <SAPageHeader
        title="Lounge Management"
        subtitle={`${lounges.length} lounges across all airports`}
        breadcrumbs={[{ label: "Super Admin", href: "/super-admin" }, { label: "Lounges" }]}
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#a78bfa] hover:bg-[#9672f5] text-white text-[10px] font-bold uppercase tracking-wider rounded-md transition cursor-pointer"
            style={saMono}
          >
            <Plus className="h-3.5 w-3.5" /> Add Lounge
          </button>
        }
      />

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="border border-[#a78bfa]/20 rounded-lg p-5 space-y-4"
          style={{ background: saTheme.panel }}
        >
          <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider" style={saMono}>
            New Lounge
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label
                className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block"
                style={saMono}
              >
                Airport
              </label>
              <select
                value={form.airport_id}
                onChange={(e) => setForm({ ...form, airport_id: e.target.value })}
                required
                className="w-full h-9 px-3 bg-[#0c121b] border border-white/[0.08] rounded-md text-xs text-white/80 outline-none"
              >
                <option value="" className="bg-[#0c121b] text-white">
                  Select airport
                </option>
                {(airports as Record<string, unknown>[]).map((a) => (
                  <option
                    key={String(a.id)}
                    value={String(a.id)}
                    className="bg-[#0c121b] text-white"
                  >
                    {String(a.code)} — {String(a.name)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block"
                style={saMono}
              >
                Lounge Name
              </label>
              <input
                type="text"
                required
                placeholder="First Class Lounge"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-md text-xs text-white/80 outline-none"
              />
            </div>
            <div>
              <label
                className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block"
                style={saMono}
              >
                Terminal
              </label>
              <input
                type="text"
                placeholder="T3"
                value={form.terminal}
                onChange={(e) => setForm({ ...form, terminal: e.target.value })}
                className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-md text-xs text-white/80 outline-none"
              />
            </div>
            <div>
              <label
                className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block"
                style={saMono}
              >
                Capacity
              </label>
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-md text-xs text-white/80 outline-none"
              />
            </div>
            <div>
              <label
                className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block"
                style={saMono}
              >
                Amenities (comma-sep)
              </label>
              <input
                type="text"
                placeholder="WiFi, Showers, Dining"
                value={form.amenities}
                onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-md text-xs text-white/80 outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-[#a78bfa] hover:bg-[#9672f5] text-white text-[10px] font-bold uppercase tracking-wider rounded-md transition cursor-pointer"
            style={saMono}
          >
            Save Lounge
          </button>
        </form>
      )}

      <SASearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search lounges..."
        className="max-w-md"
      />

      <SADataTable
        columns={[
          {
            key: "name",
            label: "Lounge",
            render: (row) => (
              <span className="text-xs font-semibold text-white/85">{String(row.name)}</span>
            ),
          },
          {
            key: "airport",
            label: "Airport",
            render: (row) => {
              const airport = row.airport;
              return (
                <span className="text-[#a78bfa]" style={saMono}>
                  {airport ? String(airport.code || "—") : "—"}
                </span>
              );
            },
          },
          {
            key: "terminal",
            label: "Terminal",
            render: (row) => (
              <span className="text-white/50" style={saMono}>
                {String(row.terminal || "—")}
              </span>
            ),
          },
          {
            key: "capacity",
            label: "Capacity",
            render: (row) => (
              <span className="text-white/60" style={saMono}>
                {String(row.capacity)}
              </span>
            ),
          },
          {
            key: "current_occupancy",
            label: "Occupancy",
            render: (row) => {
              const cap = Number(row.capacity) || 1;
              const occ = Number(row.current_occupancy) || 0;
              const pct = Math.round((occ / cap) * 100);
              return (
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct > 80 ? "bg-red-400" : pct > 50 ? "bg-yellow-400" : "bg-emerald-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-white/40" style={saMono}>
                    {occ}/{cap}
                  </span>
                </div>
              );
            },
          },
          {
            key: "amenities",
            label: "Amenities",
            render: (row) => {
              const amenities = (row.amenities as string[]) || [];
              return amenities.length > 0 ? (
                <div className="flex gap-1 flex-wrap">
                  {amenities.slice(0, 3).map((a, i) => (
                    <span
                      key={`amenity-${a}-${i}`}
                      className="text-[8px] px-1.5 py-0.5 bg-white/[0.04] rounded text-white/40"
                      style={saMono}
                    >
                      {a}
                    </span>
                  ))}
                  {amenities.length > 3 && (
                    <span className="text-[8px] text-white/25">+{amenities.length - 3}</span>
                  )}
                </div>
              ) : (
                <span className="text-white/20">—</span>
              );
            },
          },
          {
            key: "status",
            label: "Status",
            render: (row) => <SAStatusBadge status={String(row.status || "active")} />,
          },
        ]}
        data={filtered}
        isLoading={isLoading}
        emptyIcon={Armchair}
        emptyMessage="No lounges found"
      />
    </div>
  );
}
