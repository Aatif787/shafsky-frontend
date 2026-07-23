import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getAdminProfile, updateAdminProfile } from "@/lib/admin.functions";
import {
  AdminPageHeader,
  AdminDataTable,
  AdminStatusBadge,
} from "@/components/admin/AdminComponents";
import { User, Activity, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/profile")({
  component: AdminProfilePage,
});

function AdminProfilePage() {
  const queryClient = useQueryClient();
  const fetchProfile = useServerFn(getAdminProfile);
  const execUpdateProfile = useServerFn(updateAdminProfile);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-profile-info"],
    queryFn: () => fetchProfile(),
    staleTime: 15000,
  });

  useEffect(() => {
    if (data?.profile) {
      const p = data.profile as any;
      setFullName(p.full_name || "");
      setPhone(p.phone || "");
      setCompany(p.company || "");
    }
  }, [data]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await execUpdateProfile({ data: { full_name: fullName, phone, company } });
      toast.success("Profile saved successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-profile-info"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const activity = data?.activity || [];
  const roles = data?.roles || [];

  return (
    <div className="space-y-6 text-left">
      <AdminPageHeader
        title="Admin Profile Control"
        subtitle="Manage your personal clearances, information, and active logs"
        breadcrumbs={[{ label: "Operations Panel", href: "/admin" }, { label: "Profile" }]}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Info Form */}
        <div className="lg:col-span-1 border border-white/[0.06] bg-[#0c121b] p-5 rounded-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.04] mb-2">
            <User className="h-4.5 w-4.5 text-[#5ed3ff]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#5ed3ff]">
              Personal Clearance Settings
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="text-[9px] uppercase tracking-widest text-white/35 font-mono mb-1 block">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] text-xs text-white/80 outline-none focus:border-[#5ed3ff]/30 transition"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest text-white/35 font-mono mb-1 block">
                Phone Contact
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] text-xs text-white/80 outline-none focus:border-[#5ed3ff]/30 transition"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest text-white/35 font-mono mb-1 block">
                Aviation Department
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full h-9 px-3 bg-white/[0.03] border border-white/[0.08] text-xs text-white/80 outline-none focus:border-[#5ed3ff]/30 transition"
              />
            </div>

            <div className="pt-2">
              <label className="text-[9px] uppercase tracking-widest text-white/35 font-mono mb-2.5 block">
                Clearance Roles
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {roles.length > 0 ? (
                  roles.map((role: string) => <AdminStatusBadge key={role} status={role} />)
                ) : (
                  <span className="text-[10px] text-white/20">Customer</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving || isLoading}
              className="w-full h-9 mt-4 bg-[#0d5a6e] hover:bg-[#0a4252] disabled:opacity-40 text-white text-[10px] font-bold uppercase tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-1.5 font-mono"
            >
              <Save className="h-3.5 w-3.5" />
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </form>
        </div>

        {/* Profile Activity Logs */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#5ed3ff] font-mono">
            Your Recent Clearances / Activity Logs
          </h3>
          <AdminDataTable
            columns={[
              {
                key: "created_at",
                label: "Timestamp",
                render: (row: any) => (
                  <span className="text-white/40 font-mono">
                    {new Date(String(row.created_at)).toLocaleString()}
                  </span>
                ),
              },
              {
                key: "action",
                label: "Clearance Action",
                render: (row: any) => (
                  <span className="font-mono text-white/80 font-bold">{row.action}</span>
                ),
              },
              {
                key: "entity",
                label: "Context Scope",
                render: (row: any) => (
                  <span className="text-[10px] uppercase tracking-wide text-white/45 bg-white/[0.03] px-1.5 py-0.5 rounded font-mono">
                    {row.entity}
                  </span>
                ),
              },
              {
                key: "entity_id",
                label: "Target Reference ID",
                render: (row: any) => (
                  <span className="text-white/30 font-mono">
                    {row.entity_id ? String(row.entity_id).slice(0, 16) + "..." : "—"}
                  </span>
                ),
              },
            ]}
            data={activity}
            isLoading={isLoading}
            emptyMessage="No operations logged for your account."
          />
        </div>
      </div>
    </div>
  );
}
