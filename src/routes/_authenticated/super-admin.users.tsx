import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listAllUsers, updateUserStatus } from "@/lib/super-admin.functions";
import {
  SAPageHeader,
  SASearchBar,
  SADataTable,
  SAStatusBadge,
  saMono,
  saTheme,
} from "@/components/super-admin/SAComponents";
import { Users, UserX, UserCheck, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/super-admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const queryClient = useQueryClient();
  const fetchUsers = useServerFn(listAllUsers);
  const execUpdateStatus = useServerFn(updateUserStatus);
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["sa-users"],
    queryFn: () => fetchUsers(),
    staleTime: 10000,
  });

  const filtered = users.filter((u: Record<string, unknown>) => {
    const q = search.toLowerCase();
    return (
      String(u.full_name || "")
        .toLowerCase()
        .includes(q) ||
      String(u.id || "")
        .toLowerCase()
        .includes(q) ||
      String(u.phone || "")
        .toLowerCase()
        .includes(q) ||
      String(u.company || "")
        .toLowerCase()
        .includes(q)
    );
  });

  const handleAction = async (userId: string, action: "suspend" | "activate" | "delete") => {
    if (
      action === "delete" &&
      !confirm("Are you sure you want to delete this user? This action cannot be undone.")
    )
      return;
    try {
      await execUpdateStatus({ data: { targetUserId: userId, action } });
      toast.success(
        `User ${action === "delete" ? "deleted" : action === "suspend" ? "suspended" : "activated"} successfully`,
      );
      queryClient.invalidateQueries({ queryKey: ["sa-users"] });
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} user`);
    }
  };

  return (
    <div className="space-y-6">
      <SAPageHeader
        title="User Management"
        subtitle={`${users.length} registered users`}
        breadcrumbs={[{ label: "Super Admin", href: "/super-admin" }, { label: "Users" }]}
      />

      <SASearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by name, ID, phone, or company..."
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
                  {String(row.full_name || "Unnamed User")}
                </div>
                <div className="text-[10px] text-white/30 mt-0.5" style={saMono}>
                  {String(row.id).slice(0, 12)}...
                </div>
              </div>
            ),
          },
          {
            key: "company",
            label: "Company",
            render: (row) => <span className="text-white/50">{String(row.company || "—")}</span>,
          },
          {
            key: "phone",
            label: "Phone",
            render: (row) => (
              <span className="text-white/50" style={saMono}>
                {String(row.phone || "—")}
              </span>
            ),
          },
          {
            key: "roles",
            label: "Roles",
            render: (row) => (
              <div className="flex flex-wrap gap-1">
                {((row.roles as string[]) || ["customer"]).map((role: string) => (
                  <SAStatusBadge key={role} status={role} />
                ))}
              </div>
            ),
          },
          {
            key: "created_at",
            label: "Joined",
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
                {row.is_active !== false ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(String(row.id), "suspend");
                    }}
                    className="p-1.5 rounded hover:bg-yellow-500/10 text-yellow-500/60 hover:text-yellow-400 transition cursor-pointer"
                    title="Suspend user"
                  >
                    <UserX className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(String(row.id), "activate");
                    }}
                    className="p-1.5 rounded hover:bg-emerald-500/10 text-emerald-500/60 hover:text-emerald-400 transition cursor-pointer"
                    title="Activate user"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(String(row.id), "delete");
                  }}
                  className="p-1.5 rounded hover:bg-red-500/10 text-red-500/40 hover:text-red-400 transition cursor-pointer"
                  title="Delete user"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ),
          },
        ]}
        data={filtered as Record<string, unknown>[]}
        isLoading={isLoading}
        emptyIcon={Users}
        emptyMessage="No users found"
      />
    </div>
  );
}
