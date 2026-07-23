import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  listAllServicesConfig,
  updateServiceConfig,
  deleteServiceConfig,
} from "@/lib/bookings.functions";
import { pageMono, pageDisplay, Panel } from "@/components/site/PageShell";
import { Loader2, AlertTriangle, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/services")({
  component: ServicesManagerView,
});

function ServicesManagerView() {
  const fetchServices = useServerFn(listAllServicesConfig);
  const triggerUpdate = useServerFn(updateServiceConfig);
  const triggerDelete = useServerFn(deleteServiceConfig);
  const qc = useQueryClient();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    id: "",
    title: "",
    description: "",
    price: 0,
    currency: "INR",
    category: "departure" as "departure" | "arrival",
    icon: "ConciergeBell",
    is_active: true,
    sort_order: 0,
  });

  const {
    data: services,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-services-config"],
    queryFn: () => fetchServices(),
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5ed3ff]" />
      </div>
    );
  }

  if (error || !services) {
    return (
      <Panel tone="dark" className="p-6 border border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <span className="text-sm font-semibold">
            Failed to load airport services database schema. Make sure you applied migrations.
          </span>
        </div>
      </Panel>
    );
  }

  const handleEditClick = (svc: any) => {
    setEditingId(svc.id);
    setFormState({
      id: svc.id,
      title: svc.title,
      description: svc.description,
      price: Number(svc.price),
      currency: svc.currency || "INR",
      category: svc.category as any,
      icon: svc.icon || "ConciergeBell",
      is_active: svc.is_active !== undefined ? svc.is_active : true,
      sort_order: Number(svc.sort_order || 0),
    });
  };

  const handleCreateNewClick = () => {
    setEditingId("new");
    setFormState({
      id: "dep_" + Math.random().toString(36).substring(2, 8),
      title: "",
      description: "",
      price: 0,
      currency: "INR",
      category: "departure",
      icon: "ConciergeBell",
      is_active: true,
      sort_order: 0,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await triggerUpdate({
        data: {
          id: formState.id,
          title: formState.title,
          description: formState.description,
          price: formState.price,
          currency: formState.currency,
          category: formState.category,
          icon: formState.icon,
          is_active: formState.is_active,
          sort_order: formState.sort_order,
        },
      });
      toast.success("Service configuration updated successfully");
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ["admin-services-config"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update service config");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this service?")) return;
    try {
      await triggerDelete({ data: { id } });
      toast.success("Service config deleted successfully");
      qc.invalidateQueries({ queryKey: ["admin-services-config"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold leading-tight" style={pageDisplay}>
            Airport <em className="text-[#5ed3ff]">Services.</em>
          </h1>
          <p className="text-xs text-white/50 uppercase tracking-widest mt-1" style={pageMono}>
            Configure concierge add-on catalog
          </p>
        </div>
        <button
          onClick={handleCreateNewClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5ed3ff]/10 border border-[#5ed3ff]/20 text-[#5ed3ff] hover:bg-[#5ed3ff]/15 transition-colors text-xs font-semibold uppercase tracking-wider"
          style={pageMono}
        >
          <Plus className="h-4 w-4" /> Add Service
        </button>
      </div>

      {/* Editor Overlay / Form */}
      {editingId && (
        <Panel tone="dark" className="p-6 border border-white/10 max-w-xl">
          <h2
            className="text-sm font-semibold uppercase tracking-widest text-[#5ed3ff] mb-4"
            style={pageMono}
          >
            {editingId === "new" ? "Add New Concierge Service" : `Edit Service: ${formState.id}`}
          </h2>
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-white/40 font-mono">
                  Service Unique Code
                </label>
                <input
                  type="text"
                  required
                  disabled={editingId !== "new"}
                  value={formState.id}
                  onChange={(e) => setFormState({ ...formState, id: e.target.value })}
                  placeholder="e.g. dep_meet_greet"
                  className="w-full bg-transparent border border-white/10 px-3 py-2 outline-none focus:border-[#5ed3ff] disabled:opacity-40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-white/40 font-mono">Category</label>
                <select
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value as any })}
                  className="w-full bg-[#0c121b] border border-white/10 px-3 py-2 outline-none focus:border-[#5ed3ff] text-white"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="departure" className="bg-[#0c121b] text-white">
                    DEPARTURE
                  </option>
                  <option value="arrival" className="bg-[#0c121b] text-white">
                    ARRIVAL
                  </option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-white/40 font-mono">Display Title</label>
              <input
                type="text"
                required
                value={formState.title}
                onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                placeholder="e.g. Uniformed Escort & Lounge"
                className="w-full bg-transparent border border-white/10 px-3 py-2 outline-none focus:border-[#5ed3ff]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-white/40 font-mono">
                Service Description
              </label>
              <textarea
                required
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                placeholder="Bespoke benefits and escorts included..."
                rows={3}
                className="w-full bg-transparent border border-white/10 p-2.5 outline-none focus:border-[#5ed3ff]"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-white/40 font-mono">
                  Unit Price (INR)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formState.price}
                  onChange={(e) => setFormState({ ...formState, price: Number(e.target.value) })}
                  className="w-full bg-transparent border border-white/10 px-3 py-2 outline-none focus:border-[#5ed3ff]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-white/40 font-mono">Sort Order</label>
                <input
                  type="number"
                  required
                  value={formState.sort_order}
                  onChange={(e) =>
                    setFormState({ ...formState, sort_order: Number(e.target.value) })
                  }
                  className="w-full bg-transparent border border-white/10 px-3 py-2 outline-none focus:border-[#5ed3ff]"
                />
              </div>

              <div className="space-y-1.5 flex items-center justify-between border border-white/10 px-3 py-2">
                <span className="text-[10px] uppercase text-white/40 font-mono">Active State</span>
                <input
                  type="checkbox"
                  checked={formState.is_active}
                  onChange={(e) => setFormState({ ...formState, is_active: e.target.checked })}
                  className="h-4 w-4 bg-transparent outline-none accent-[#5ed3ff]"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 transition-colors font-semibold uppercase tracking-wider text-[10px]"
                style={pageMono}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#5ed3ff]/10 border border-[#5ed3ff]/20 text-[#5ed3ff] hover:bg-[#5ed3ff]/15 transition-colors font-semibold uppercase tracking-wider text-[10px]"
                style={pageMono}
              >
                Save Config
              </button>
            </div>
          </form>
        </Panel>
      )}

      {/* Services Grid List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((svc) => (
          <Panel
            key={svc.id}
            tone="dark"
            className={`p-5 flex flex-col justify-between border ${svc.is_active ? "border-white/10" : "border-white/5 opacity-50"}`}
          >
            <div>
              <div
                className="flex justify-between items-center text-[10px] text-white/45"
                style={pageMono}
              >
                <span>
                  Code: {svc.id} · Order: {svc.sort_order || 0}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-bold rounded ${
                      svc.is_active
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {svc.is_active ? "Active" : "Disabled"}
                  </span>
                  <span className="uppercase tracking-wider font-semibold text-[#5ed3ff]">
                    {svc.category}
                  </span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white/95 mt-2">{svc.title}</h3>
              <p className="text-xs text-white/50 mt-1.5 leading-relaxed">{svc.description}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-white/5 flex justify-between items-center text-xs">
              <div className="font-mono text-white/90 font-bold">
                ₹ {Number(svc.price).toLocaleString()}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(svc)}
                  className="p-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(svc.id)}
                  className="p-1.5 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 rounded transition-colors text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
