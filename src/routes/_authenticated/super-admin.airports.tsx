import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listAirports, upsertAirport, deleteAirport } from "@/lib/super-admin.functions";
import {
  SAPageHeader,
  SASearchBar,
  SADataTable,
  SAStatusBadge,
  saMono,
  saTheme,
} from "@/components/super-admin/SAComponents";
import { Plane, Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/super-admin/airports")({
  component: AirportsPage,
});

function AirportsPage() {
  const queryClient = useQueryClient();
  const fetchAirports = useServerFn(listAirports);
  const execUpsert = useServerFn(upsertAirport);
  const execDelete = useServerFn(deleteAirport);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    name: "",
    city: "",
    country: "India",
    image_url: "",
    supported_services: "dep_meet_greet, dep_fast_track, dep_lounge, arr_meet_greet, arr_fast_track",
    terminals: "",
    is_active: true,
  });

  const { data: airports = [], isLoading } = useQuery({
    queryKey: ["sa-airports"],
    queryFn: () => fetchAirports(),
    staleTime: 15000,
  });

  const filtered = (airports as Record<string, unknown>[]).filter((a) => {
    const q = search.toLowerCase();
    return (
      String(a.code || "")
        .toLowerCase()
        .includes(q) ||
      String(a.name || "")
        .toLowerCase()
        .includes(q) ||
      String(a.city || "")
        .toLowerCase()
        .includes(q)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await execUpsert({
        data: {
          id: editingId || undefined,
          code: form.code,
          name: form.name,
          city: form.city,
          country: form.country,
          image_url: form.image_url || undefined,
          supported_services: form.supported_services
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          terminals: form.terminals
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          is_active: form.is_active,
        },
      });
      toast.success(editingId ? "Airport updated" : "Airport saved successfully");
      setForm({
        code: "",
        name: "",
        city: "",
        country: "India",
        image_url: "",
        supported_services: "dep_meet_greet, dep_fast_track, dep_lounge, arr_meet_greet, arr_fast_track",
        terminals: "",
        is_active: true,
      });
      setEditingId(null);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["sa-airports"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to save airport");
    }
  };

  const handleEdit = (a: any) => {
    setEditingId(a.id);
    setForm({
      code: a.code || "",
      name: a.name || "",
      city: a.city || "",
      country: a.country || "India",
      image_url: a.image_url || "",
      supported_services: Array.isArray(a.supported_services) ? a.supported_services.join(", ") : "",
      terminals: Array.isArray(a.terminals) ? a.terminals.join(", ") : "",
      is_active: a.is_active !== undefined ? a.is_active : true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this airport? Associated lounges will also be deleted.")) return;
    try {
      await execDelete({ data: { id } });
      toast.success("Airport deleted");
      queryClient.invalidateQueries({ queryKey: ["sa-airports"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete airport");
    }
  };

  return (
    <div className="space-y-6">
      <SAPageHeader
        title="Airport Management"
        subtitle={`${airports.length} airports registered`}
        breadcrumbs={[{ label: "Super Admin", href: "/super-admin" }, { label: "Airports" }]}
        action={
          <button
            onClick={() => {
              setEditingId(null);
              setForm({
                code: "",
                name: "",
                city: "",
                country: "India",
                image_url: "",
                supported_services: "dep_meet_greet, dep_fast_track, dep_lounge, arr_meet_greet, arr_fast_track",
                terminals: "",
                is_active: true,
              });
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#a78bfa] hover:bg-[#9672f5] text-white text-[10px] font-bold uppercase tracking-wider rounded-md transition cursor-pointer"
            style={saMono}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Airport
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
            {editingId ? "Edit Airport" : "New Airport"}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block" style={saMono}>
                IATA Code *
              </label>
              <input
                type="text"
                required
                placeholder="DEL"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-md text-xs text-white/80 placeholder:text-white/20 outline-none focus:border-[#a78bfa]/30 transition"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block" style={saMono}>
                Airport Name *
              </label>
              <input
                type="text"
                required
                placeholder="Indira Gandhi International"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-md text-xs text-white/80 placeholder:text-white/20 outline-none focus:border-[#a78bfa]/30 transition"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block" style={saMono}>
                City *
              </label>
              <input
                type="text"
                required
                placeholder="New Delhi"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-md text-xs text-white/80 placeholder:text-white/20 outline-none focus:border-[#a78bfa]/30 transition"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block" style={saMono}>
                Country *
              </label>
              <input
                type="text"
                required
                placeholder="India"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-md text-xs text-white/80 placeholder:text-white/20 outline-none focus:border-[#a78bfa]/30 transition"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block" style={saMono}>
                Airport Image URL
              </label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/photo-..."
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-md text-xs text-white/80 placeholder:text-white/20 outline-none focus:border-[#a78bfa]/30 transition"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block" style={saMono}>
                Supported Services (comma-separated IDs)
              </label>
              <input
                type="text"
                placeholder="dep_meet_greet, dep_fast_track, arr_meet_greet"
                value={form.supported_services}
                onChange={(e) => setForm({ ...form, supported_services: e.target.value })}
                className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-md text-xs text-white/80 placeholder:text-white/20 outline-none focus:border-[#a78bfa]/30 transition"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block" style={saMono}>
                Terminals (comma-separated)
              </label>
              <input
                type="text"
                placeholder="T1, T2, T3"
                value={form.terminals}
                onChange={(e) => setForm({ ...form, terminals: e.target.value })}
                className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-md text-xs text-white/80 placeholder:text-white/20 outline-none focus:border-[#a78bfa]/30 transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="rounded border-white/20 text-[#a78bfa]"
              />
              Airport Active in Customer Booking Engine
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-[10px] font-bold uppercase tracking-wider rounded-md transition"
                style={saMono}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#a78bfa] hover:bg-[#9672f5] text-white text-[10px] font-bold uppercase tracking-wider rounded-md transition cursor-pointer"
                style={saMono}
              >
                Save Airport
              </button>
            </div>
          </div>
        </form>
      )}

      <SASearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search airports..."
        className="max-w-md"
      />

      <SADataTable
        columns={[
          {
            key: "code",
            label: "Code",
            render: (row: any) => (
              <span className="text-xs font-bold text-[#a78bfa]" style={saMono}>
                {String(row.code)}
              </span>
            ),
          },
          {
            key: "name",
            label: "Airport Name",
            render: (row: any) => <span className="text-white/80">{String(row.name)}</span>,
          },
          {
            key: "city",
            label: "City / Country",
            render: (row: any) => (
              <span className="text-white/60 text-xs">{row.city}, {row.country}</span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (row: any) => (
              <span
                className={`px-2 py-0.5 text-[8px] font-mono uppercase font-bold rounded ${
                  row.is_active !== false
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                }`}
              >
                {row.is_active !== false ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            key: "actions",
            label: "Actions",
            render: (row: any) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(row)}
                  className="p-1 text-[#a78bfa] hover:text-white transition cursor-pointer"
                  title="Edit Airport"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="p-1 text-red-400 hover:text-red-300 transition cursor-pointer"
                  title="Delete Airport"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ),
          },
        ]}
        data={filtered}
        isLoading={isLoading}
        emptyIcon={Plane}
        emptyMessage="No airports registered"
      />
    </div>
  );
}
