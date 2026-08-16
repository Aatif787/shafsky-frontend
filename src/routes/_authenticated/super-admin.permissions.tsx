import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listRoles } from "@/lib/super-admin.functions";
import { SAPageHeader, saMono, saTheme } from "@/components/super-admin/SAComponents";
import { Lock, Shield, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/super-admin/permissions")({
  component: PermissionsPage,
});

function PermissionsPage() {
  const fetchRoles = useServerFn(listRoles);
  const { data, isLoading } = useQuery({
    queryKey: ["sa-roles"],
    queryFn: () => fetchRoles(),
    staleTime: 15000,
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#a78bfa]" />
      </div>
    );
  }

  const permissions = data?.permissions || [];

  // Group permissions by module (e.g., "bookings:read" -> "bookings")
  const grouped = new Map<string, typeof permissions>();
  permissions.forEach((p) => {
    const id = p.id;
    const module = id.includes(":") ? id.split(":")[0] : "general";
    const existing = grouped.get(module) || [];
    existing.push(p);
    grouped.set(module, existing);
  });

  // Which roles have each permission
  const matrix = data?.matrix || {};

  return (
    <div className="space-y-6">
      <SAPageHeader
        title="Permission Registry"
        subtitle="Module-level and action-level permission definitions"
        breadcrumbs={[{ label: "Super Admin", href: "/super-admin" }, { label: "Permissions" }]}
      />

      {permissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-white/20" />
          </div>
          <h3 className="text-sm font-semibold text-white/70">No permissions defined</h3>
          <p className="text-xs text-white/35 mt-1.5 max-w-sm">
            Permissions will appear here once the `permissions` table is populated in the database.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([module, perms]) => (
            <div
              key={module}
              className="border border-white/[0.04] rounded-lg overflow-hidden"
              style={{ background: saTheme.panel }}
            >
              <div className="px-5 py-3 border-b border-white/[0.04] flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#a78bfa]/60" />
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a78bfa]/70"
                  style={saMono}
                >
                  {module}
                </span>
                <span className="text-[9px] text-white/25 ml-2" style={saMono}>
                  {perms.length} permission{perms.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="divide-y divide-white/[0.02]">
                {perms.map((perm) => {
                  const permId = String(perm.id);
                  const grantedRoles = Object.entries(matrix)
                    .filter(([_, permIds]) => (permIds as string[]).includes(permId))
                    .map(([roleName]) => roleName);

                  return (
                    <div key={permId} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white/70" style={saMono}>
                          {permId}
                        </div>
                        {!!perm.description && (
                          <div className="text-[10px] text-white/30 mt-0.5">
                            {String(perm.description)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-wrap justify-end">
                        {grantedRoles.length > 0 ? (
                          grantedRoles.map((role) => (
                            <span
                              key={role}
                              className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#a78bfa]/10 text-[#a78bfa] border border-[#a78bfa]/20"
                              style={saMono}
                            >
                              {role.replace(/_/g, " ")}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] text-white/20" style={saMono}>
                            No roles assigned
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
