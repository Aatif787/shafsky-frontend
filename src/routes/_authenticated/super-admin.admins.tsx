import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listAllUsers, createAdminRole, removeAdminRole } from "@/lib/super-admin.functions";
import {
  SAPageHeader,
  SASearchBar,
  SADataTable,
  SAStatusBadge,
  saMono,
  saTheme,
} from "@/components/super-admin/SAComponents";
import { ShieldCheck, Plus, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/super-admin/admins")({
  component: AdminsPage,
});

function AdminsPage() {
  const queryClient = useQueryClient();
  const fetchUsers = useServerFn(listAllUsers);
  const execCreateRole = useServerFn(createAdminRole);
  const execRemoveRole = useServerFn(removeAdminRole);
  const [search, setSearch] = useState("");
  const [showPromote, setShowPromote] = useState(false);
  const [promoteUserId, setPromoteUserId] = useState("");
  const [promoteRole, setPromoteRole] = useState("admin");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["sa-users"],
    queryFn: () => fetchUsers(),
    staleTime: 10000,
  });

  const admins = users.filter((u) =>
    (u.roles || [u.role || ""]).some((r) => ["admin", "super_admin"].includes(r || "")),
  );

  const nonAdmins = users.filter(
    (u) => !(u.roles || [u.role || ""]).some((r) => ["admin", "super_admin"].includes(r || "")),
  );

  const filtered = admins.filter((u) => {
    const q = search.toLowerCase();
    return (
      String(u.full_name || "")
        .toLowerCase()
        .includes(q) ||
      String(u.id || "")
        .toLowerCase()
        .includes(q)
    );
  });

  const handlePromote = async () => {
    if (!promoteUserId) return;
    try {
      await execCreateRole({ data: { targetUserId: promoteUserId, role: promoteRole } });
      toast.success("Admin role assigned successfully");
      setShowPromote(false);
      setPromoteUserId("");
      queryClient.invalidateQueries({ queryKey: ["sa-users"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to assign role");
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    if (!confirm(`Remove ${role} role from this user?`)) return;
    try {
      await execRemoveRole({ data: { targetUserId: userId, role } });
      toast.success("Role removed successfully");
      queryClient.invalidateQueries({ queryKey: ["sa-users"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to remove role");
    }
  };

  return (
    <div className="space-y-6">
      <SAPageHeader
        title="Admin Management"
        subtitle={`${admins.length} administrators`}
        breadcrumbs={[{ label: "Super Admin", href: "/super-admin" }, { label: "Admins" }]}
        action={
          <button
            onClick={() => setShowPromote(!showPromote)}
            className="flex items-center gap-2 px-4 py-2 bg-[#a78bfa] hover:bg-[#9672f5] text-white text-[10px] font-bold uppercase tracking-wider rounded-md transition cursor-pointer"
            style={saMono}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Create Admin
          </button>
        }
      />

      {/* Promote Dialog */}
      {showPromote && (
        <div
          className="border border-[#a78bfa]/20 rounded-lg p-5 space-y-4"
          style={{ background: saTheme.panel }}
        >
          <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider" style={saMono}>
            Assign Admin Role
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label
                className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block"
                style={saMono}
              >
                Select User
              </label>
              <select
                value={promoteUserId}
                onChange={(e) => setPromoteUserId(e.target.value)}
                className="w-full h-10 px-3 bg-[#0c121b] border border-white/[0.08] rounded-md text-xs text-white/80 outline-none"
              >
                <option value="" className="bg-[#0c121b] text-white">
                  Choose a user...
                </option>
                {nonAdmins.map((u) => (
                  <option
                    key={String(u.id)}
                    value={String(u.id)}
                    className="bg-[#0c121b] text-white"
                  >
                    {String(u.full_name || "Unnamed")} ({String(u.id).slice(0, 8)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="text-[9px] uppercase tracking-widest text-white/30 mb-1 block"
                style={saMono}
              >
                Role
              </label>
              <select
                value={promoteRole}
                onChange={(e) => setPromoteRole(e.target.value)}
                className="w-full h-10 px-3 bg-[#0c121b] border border-white/[0.08] rounded-md text-xs text-white/80 outline-none"
              >
                <option value="admin" className="bg-[#0c121b] text-white">
                  Admin
                </option>
                <option value="super_admin" className="bg-[#0c121b] text-white">
                  Super Admin
                </option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handlePromote}
                disabled={!promoteUserId}
                className="h-10 px-6 bg-[#a78bfa] hover:bg-[#9672f5] disabled:opacity-40 text-white text-[10px] font-bold uppercase tracking-wider rounded-md transition cursor-pointer"
                style={saMono}
              >
                Assign Role
              </button>
            </div>
          </div>
        </div>
      )}

      <SASearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search admins..."
        className="max-w-md"
      />

      <SADataTable
        columns={[
          {
            key: "full_name",
            label: "Name",
            render: (row) => (
              <div>
                <div className="text-xs font-semibold text-white/85">
                  {String(row.full_name || "Unnamed")}
                </div>
                <div className="text-[10px] text-white/30 mt-0.5" style={saMono}>
                  {String(row.id).slice(0, 16)}...
                </div>
              </div>
            ),
          },
          {
            key: "roles",
            label: "Roles",
            render: (row) => (
              <div className="flex flex-wrap gap-1">
                {((row.roles as string[]) || []).map((role: string) => (
                  <SAStatusBadge key={role} status={role} />
                ))}
              </div>
            ),
          },
          {
            key: "created_at",
            label: "Since",
            render: (row) => (
              <span className="text-white/40" style={saMono}>
                {new Date(String(row.created_at)).toLocaleDateString()}
              </span>
            ),
          },
          {
            key: "actions",
            label: "Actions",
            className: "text-right",
            render: (row) => (
              <div className="flex items-center justify-end gap-1">
                {((row.roles as string[]) || [])
                  .filter((r: string) => r !== "customer")
                  .map((role: string) => (
                    <button
                      key={role}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveRole(String(row.id), role);
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-[9px] rounded border border-red-500/20 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      style={saMono}
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove {role.replace(/_/g, " ")}
                    </button>
                  ))}
              </div>
            ),
          },
        ]}
        data={filtered}
        isLoading={isLoading}
        emptyIcon={ShieldCheck}
        emptyMessage="No administrators found"
      />
    </div>
  );
}
