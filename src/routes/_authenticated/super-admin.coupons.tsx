import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listCoupons, createCoupon, toggleCoupon, deleteCoupon } from "@/lib/super-admin.functions";
import {
  SAPageHeader,
  SASearchBar,
  SADataTable,
  SAStatusBadge,
  saMono,
  saTheme,
} from "@/components/super-admin/SAComponents";
import { Percent, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/super-admin/coupons")({
  component: CouponsPage,
});

function CouponsPage() {
  const queryClient = useQueryClient();
  const fetchCoupons = useServerFn(listCoupons);
  const execCreate = useServerFn(createCoupon);
  const execToggle = useServerFn(toggleCoupon);
  const execDelete = useServerFn(deleteCoupon);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discount_percent: "10",
    max_uses: "100",
    expires_at: "",
  });

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["sa-coupons"],
    queryFn: () => fetchCoupons(),
    staleTime: 15000,
  });

  const filtered = (coupons as Record<string, any>[]).filter((c) => {
    return String(c.code || "")
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await execCreate({
        data: {
          code: form.code,
          discount_percent: parseInt(form.discount_percent) || 10,
          max_uses: form.max_uses ? parseInt(form.max_uses) : undefined,
          expires_at: form.expires_at || undefined,
        },
      });
      toast.success("Coupon created successfully");
      setForm({ code: "", discount_percent: "10", max_uses: "100", expires_at: "" });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["sa-coupons"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to create coupon");
    }
  };

  const handleToggle = async (id: string, is_active: boolean) => {
    try {
      await execToggle({ data: { id, is_active } });
      toast.success("Coupon status updated");
      queryClient.invalidateQueries({ queryKey: ["sa-coupons"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await execDelete({ data: { id } });
      toast.success("Coupon deleted");
      queryClient.invalidateQueries({ queryKey: ["sa-coupons"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete coupon");
    }
  };

  return (
    <div className="space-y-6">
      <SAPageHeader
        title="Coupon & Promotions"
        subtitle="Manage travel discount voucher parameters"
        breadcrumbs={[{ label: "Super Admin", href: "/super-admin" }, { label: "Coupons" }]}
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#a78bfa] hover:bg-[#9672f5] text-white text-[10px] font-bold uppercase tracking-wider rounded-md transition cursor-pointer"
            style={saMono}
          >
            <Plus className="h-3.5 w-3.5" />
            Create Coupon
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
            New Coupon
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label
                className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block"
                style={saMono}
              >
                Promo Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MONSOON20"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-md text-xs text-white/80 outline-none focus:border-[#a78bfa]/30 uppercase"
              />
            </div>
            <div>
              <label
                className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block"
                style={saMono}
              >
                Discount Percent
              </label>
              <input
                type="number"
                required
                min="1"
                max="100"
                value={form.discount_percent}
                onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-md text-xs text-white/80 outline-none focus:border-[#a78bfa]/30"
              />
            </div>
            <div>
              <label
                className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block"
                style={saMono}
              >
                Max Allocations
              </label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-md text-xs text-white/80 outline-none focus:border-[#a78bfa]/30"
              />
            </div>
            <div>
              <label
                className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block"
                style={saMono}
              >
                Expires At (Optional)
              </label>
              <input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] rounded-md text-xs text-white/80 outline-none focus:border-[#a78bfa]/30"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-[#a78bfa] hover:bg-[#9672f5] text-white text-[10px] font-bold uppercase tracking-wider rounded-md transition cursor-pointer"
            style={saMono}
          >
            Save Coupon
          </button>
        </form>
      )}

      <SASearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search coupons..."
        className="max-w-md"
      />

      <SADataTable
        columns={[
          {
            key: "code",
            label: "Code",
            render: (row) => (
              <span className="text-xs font-bold text-[#a78bfa]" style={saMono}>
                {String(row.code)}
              </span>
            ),
          },
          {
            key: "discount_percent",
            label: "Discount",
            render: (row) => (
              <span className="text-white/80 font-semibold" style={saMono}>
                {String(row.discount_percent)}% OFF
              </span>
            ),
          },
          {
            key: "uses_count",
            label: "Uses",
            render: (row) => (
              <span className="text-white/60 font-mono" style={saMono}>
                {String(row.uses_count)} / {row.max_uses ? String(row.max_uses) : "∞"}
              </span>
            ),
          },
          {
            key: "expires_at",
            label: "Expires At",
            render: (row) => (
              <span className="text-white/40" style={saMono}>
                {row.expires_at ? new Date(String(row.expires_at)).toLocaleDateString() : "Never"}
              </span>
            ),
          },
          {
            key: "is_active",
            label: "Status",
            render: (row) => (
              <button
                onClick={() => handleToggle(String(row.id), !row.is_active)}
                className={`px-2.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold cursor-pointer transition ${
                  row.is_active
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
                style={saMono}
              >
                {row.is_active ? "Active" : "Disabled"}
              </button>
            ),
          },
          {
            key: "actions",
            label: "",
            className: "text-right",
            render: (row) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(String(row.id));
                }}
                className="p-1.5 rounded hover:bg-red-500/10 text-red-500/40 hover:text-red-400 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ),
          },
        ]}
        data={filtered}
        isLoading={isLoading}
        emptyIcon={Percent}
        emptyMessage="No coupons active"
      />
    </div>
  );
}
