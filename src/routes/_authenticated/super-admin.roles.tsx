import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listRoles, toggleRolePermission } from "@/lib/super-admin.functions";
import {
  SAPageHeader,
  SAPermissionMatrix,
  saMono,
  saTheme,
} from "@/components/super-admin/SAComponents";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/super-admin/roles")({
  component: RolesPage,
});

function RolesPage() {
  const queryClient = useQueryClient();
  const fetchRoles = useServerFn(listRoles);
  const execToggle = useServerFn(toggleRolePermission);

  const { data, isLoading } = useQuery({
    queryKey: ["sa-roles"],
    queryFn: () => fetchRoles(),
    staleTime: 15000,
  });

  const handleToggle = async (roleName: string, permissionId: string) => {
    if (!data) return;
    const isCurrentlyGranted = data.matrix[roleName]?.includes(permissionId);
    try {
      await execToggle({ data: { roleName, permissionId, grant: !isCurrentlyGranted } });
      toast.success(isCurrentlyGranted ? "Permission revoked" : "Permission granted");
      queryClient.invalidateQueries({ queryKey: ["sa-roles"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update permission");
    }
  };

  const roleNames = (data?.roles || []).map((r) => r.name);
  const permissionIds = (data?.permissions || []).map((p) => p.id);

  return (
    <div className="space-y-6">
      <SAPageHeader
        title="Roles & Permissions"
        subtitle="Dynamic RBAC permission matrix"
        breadcrumbs={[{ label: "Super Admin", href: "/super-admin" }, { label: "Roles" }]}
      />

      {/* Role Summary */}
      {!isLoading && data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(data.roles || []).map((role) => {
            const permCount = data.matrix[String(role.name)]?.length || 0;
            return (
              <div
                key={String(role.name)}
                className="border border-white/[0.04] rounded-lg p-4"
                style={{ background: saTheme.panel }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <KeyRound className="h-4 w-4 text-[#a78bfa]/60" />
                  <span className="text-xs font-bold text-white/80 uppercase" style={saMono}>
                    {String(role.name).replace(/_/g, " ")}
                  </span>
                </div>
                <div className="text-[10px] text-white/35" style={saMono}>
                  {permCount} permission{permCount !== 1 ? "s" : ""} granted
                </div>
                {!!role.description && (
                  <div className="text-[10px] text-white/25 mt-1">{String(role.description)}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Permission Matrix */}
      <div>
        <h3
          className="text-[10px] uppercase tracking-[0.25em] text-[#a78bfa]/60 mb-4"
          style={saMono}
        >
          Permission Matrix
        </h3>
        <SAPermissionMatrix
          roles={roleNames}
          permissions={permissionIds}
          matrix={data?.matrix ?? {}}
          onToggle={handleToggle}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
