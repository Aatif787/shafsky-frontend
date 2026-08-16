import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  checkSuperAdminAccess,
  listAllUsers,
  createUserBySuperAdmin,
  updateUserRoleAndStatus,
  requestUserPasswordResetBySuperAdmin,
} from "@/lib/super-admin.functions";
import { pageMono, pageDisplay, Panel } from "@/components/site/PageShell";
import {
  Loader2,
  AlertTriangle,
  UserCheck2,
  ShieldCheck,
  UserPlus,
  ShieldAlert,
  Search,
  Filter,
  KeyRound,
  UserX,
  UserCheck,
  Edit2,
  X,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/staff")({
  component: EnterpriseUserManagementView,
});

function EnterpriseUserManagementView() {
  const checkAccess = useServerFn(checkSuperAdminAccess);
  const fetchUsers = useServerFn(listAllUsers);
  const createUser = useServerFn(createUserBySuperAdmin);
  const updateUser = useServerFn(updateUserRoleAndStatus);
  const resetPassword = useServerFn(requestUserPasswordResetBySuperAdmin);
  const qc = useQueryClient();

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Add User Form State
  const [addEmail, setAddEmail] = useState("");
  const [addName, setAddName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addRole, setAddRole] = useState<"admin" | "customer">("admin");

  // Edit User Form State
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "customer">("admin");
  const [editStatus, setEditStatus] = useState<"active" | "disabled">("active");

  // Security authorization check
  const { data: access, isLoading: accessLoading } = useQuery({
    queryKey: ["super-admin-access-check"],
    queryFn: () => checkAccess(),
  });

  // Load all system profiles & roles
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["enterprise-user-management"],
    queryFn: () => fetchUsers(),
    enabled: !!access?.roles?.includes("super_admin"),
  });

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return users.filter((u: any) => {
      const emailStr = (u.email || "").toLowerCase();
      const nameStr = (u.full_name || "").toLowerCase();
      const roleStr = (u.roles?.[0] || "customer").toLowerCase();

      const matchesSearch =
        !searchTerm.trim() ||
        emailStr.includes(searchTerm.toLowerCase().trim()) ||
        nameStr.includes(searchTerm.toLowerCase().trim()) ||
        roleStr.includes(searchTerm.toLowerCase().trim());

      const matchesRole = roleFilter === "all" || roleStr === roleFilter;

      const userStatus = u.status || (u.is_active ? "active" : "disabled");
      const matchesStatus = statusFilter === "all" || userStatus === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Handle Add User
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addEmail.trim() || !addName.trim()) {
      toast.error("Please enter email address and full name.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createUser({
        data: {
          email: addEmail.trim(),
          fullName: addName.trim(),
          phone: addPhone.trim() || undefined,
          role: addRole,
        },
      });
      toast.success(`User ${res.email || addEmail.trim()} successfully created!`);
      qc.invalidateQueries({ queryKey: ["enterprise-user-management"] });

      // Reset form
      setAddEmail("");
      setAddName("");
      setAddPhone("");
      setAddRole("admin");
      setShowAddModal(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit User
  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSubmitting(true);
    try {
      await updateUser({
        data: {
          targetUserId: editingUser.id,
          fullName: editName.trim() || undefined,
          role: editRole,
          status: editStatus,
        },
      });
      toast.success("User account updated successfully");
      qc.invalidateQueries({ queryKey: ["enterprise-user-management"] });
      setEditingUser(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update user.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Toggle Status (Disable / Enable)
  const handleToggleStatus = async (user: any) => {
    if (user.id === access?.userId) {
      toast.error("Self-lockout guard: You cannot disable your own active Super Admin account.");
      return;
    }

    const currentStatus = user.status || (user.is_active ? "active" : "disabled");
    const nextStatus = currentStatus === "active" ? "disabled" : "active";

    if (nextStatus === "disabled") {
      const confirmed = window.confirm(
        `Are you sure you want to DISABLE access for ${user.full_name || user.email}? The user will be unable to log in until re-enabled.`,
      );
      if (!confirmed) return;
    }

    try {
      await updateUser({
        data: {
          targetUserId: user.id,
          status: nextStatus,
        },
      });
      toast.success(
        `User ${user.full_name || user.email} is now ${nextStatus.toUpperCase()}`,
      );
      qc.invalidateQueries({ queryKey: ["enterprise-user-management"] });
    } catch (err: any) {
      toast.error(err?.message || "Failed to update user status.");
    }
  };

  // Handle Password Reset Request
  const handlePasswordReset = async (user: any) => {
    const email = user.email;
    if (!email) {
      toast.error("User does not have a registered email address.");
      return;
    }

    const confirmed = window.confirm(`Dispatch password reset email to ${email}?`);
    if (!confirmed) return;

    try {
      const res = await resetPassword({
        data: {
          targetUserId: user.id,
          email,
        },
      });
      toast.success(res.message || "Password reset email dispatched.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to request password reset.");
    }
  };

  if (accessLoading || usersLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5ed3ff]" />
      </div>
    );
  }

  // 403 Security Guard: Non-super_admin users are blocked
  if (!access?.roles?.includes("super_admin")) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <Panel
          tone="dark"
          className="max-w-md w-full p-8 border border-red-500/20 bg-red-500/5 text-center space-y-6"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
            <AlertTriangle className="h-8 w-8 text-red-500 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold uppercase tracking-wider text-red-400" style={pageDisplay}>
              403 Forbidden
            </h2>
            <p className="text-xs text-white/60 leading-relaxed">
              User Management requires Root Super Admin privileges. Your account role does not have authorization to view or manage system users.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <Link
              to="/admin"
              className="inline-block w-full py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold uppercase tracking-widest transition text-center"
              style={pageMono}
            >
              Return to Operations Command
            </Link>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold leading-tight" style={pageDisplay}>
            User <em className="text-[#5ed3ff]">Management.</em>
          </h1>
          <p className="text-xs text-white/50 uppercase tracking-widest mt-1" style={pageMono}>
            Enterprise Account Provisioning, Role Delegation, and Access Control
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#5ed3ff] hover:bg-[#4bc0ed] text-slate-950 font-bold px-4 py-2.5 rounded text-xs uppercase tracking-wider transition shadow-lg shadow-[#5ed3ff]/20 shrink-0"
          style={pageMono}
        >
          <UserPlus className="h-4 w-4" />
          Provision New User
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Panel tone="dark" className="p-4 border border-white/10">
          <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Total Users</div>
          <div className="text-2xl font-bold text-white mt-1">{users.length}</div>
        </Panel>
        <Panel tone="dark" className="p-4 border border-white/10">
          <div className="text-[10px] uppercase tracking-widest text-[#5ed3ff] font-mono">Admins</div>
          <div className="text-2xl font-bold text-[#5ed3ff] mt-1">
            {users.filter((u: any) => u.roles?.includes("admin") || u.roles?.includes("super_admin")).length}
          </div>
        </Panel>
        <Panel tone="dark" className="p-4 border border-white/10">
          <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-mono">Customers</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {users.filter((u: any) => !u.roles?.includes("admin") && !u.roles?.includes("super_admin")).length}
          </div>
        </Panel>
        <Panel tone="dark" className="p-4 border border-white/10">
          <div className="text-[10px] uppercase tracking-widest text-red-400 font-mono">Disabled</div>
          <div className="text-2xl font-bold text-red-400 mt-1">
            {users.filter((u: any) => u.status === "disabled" || u.is_active === false).length}
          </div>
        </Panel>
      </div>

      {/* Search & Filter Bar */}
      <Panel tone="dark" className="p-4 border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0c121b] border border-white/10 rounded pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#5ed3ff]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-white/50 font-mono">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#0c121b] border border-white/10 rounded px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-[#5ed3ff]"
            style={{ colorScheme: "dark" }}
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0c121b] border border-white/10 rounded px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-[#5ed3ff]"
            style={{ colorScheme: "dark" }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </Panel>

      {/* Users Table */}
      <div className="border border-white/10 bg-[#090d16]/40 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] uppercase tracking-[0.2em] text-white/40 border-b border-white/10 bg-white/[0.02]">
              <tr>
                <th className="p-4">User Dossier</th>
                <th className="p-4">Email / Contact</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Created Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/40 italic">
                    No matching user accounts found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user: any) => {
                  const role = user.roles?.[0] || "customer";
                  const status = user.status || (user.is_active !== false ? "active" : "disabled");
                  const isDisabled = status === "disabled";

                  return (
                    <tr key={user.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-white text-sm">{user.full_name || "Valued User"}</div>
                        <div className="text-[10px] text-white/30 font-mono mt-0.5">{user.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-white/80 font-mono">
                          <Mail className="h-3.5 w-3.5 text-white/30 shrink-0" />
                          {user.email || "N/A"}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-mono mt-1">
                            <Phone className="h-3 w-3 shrink-0" />
                            {user.phone}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded border ${
                            role === "super_admin"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                              : role === "admin"
                                ? "bg-[#5ed3ff]/10 text-[#5ed3ff] border-[#5ed3ff]/30"
                                : "bg-white/5 text-white/60 border-white/10"
                          }`}
                        >
                          {role}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold rounded border ${
                            !isDisabled
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-red-500/10 text-red-400 border-red-500/30"
                          }`}
                        >
                          {!isDisabled ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="p-4 text-center text-white/40 font-mono text-[11px]">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit User Button */}
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setEditName(user.full_name || "");
                              setEditRole(role === "admin" ? "admin" : "customer");
                              setEditStatus(isDisabled ? "disabled" : "active");
                            }}
                            title="Edit User Role & Details"
                            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {/* Toggle Disable / Enable Button */}
                          <button
                            onClick={() => handleToggleStatus(user)}
                            title={isDisabled ? "Enable User" : "Disable User"}
                            className={`p-1.5 rounded border transition ${
                              isDisabled
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                            }`}
                          >
                            {isDisabled ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                          </button>

                          {/* Password Reset Request */}
                          <button
                            onClick={() => handlePasswordReset(user)}
                            title="Dispatch Password Reset Email"
                            className="p-1.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20 transition"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0c121b] border border-white/15 rounded-xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-white" style={pageDisplay}>
                Provision <em className="text-[#5ed3ff]">New User</em>
              </h2>
              <p className="text-xs text-white/50 mt-1" style={pageMono}>
                Provision an Admin or Customer account with role privileges
              </p>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/50 font-mono mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alexander Vance"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full bg-[#06090f] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5ed3ff]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/50 font-mono mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@shafsky.com"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full bg-[#06090f] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5ed3ff]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/50 font-mono mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                  className="w-full bg-[#06090f] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5ed3ff]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/50 font-mono mb-1">
                  Assigned Role *
                </label>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as any)}
                  className="w-full bg-[#06090f] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5ed3ff]"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="admin">Admin (Operations Manager)</option>
                  <option value="customer">Customer (Passenger)</option>
                </select>
                <p className="text-[10px] text-white/30 mt-1 italic">
                  Note: Super Admin role delegation is restricted from the UI for security compliance.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2 bg-white/5 hover:bg-white/10 text-xs text-white/70 uppercase tracking-widest rounded"
                  style={pageMono}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2 bg-[#5ed3ff] hover:bg-[#4bc0ed] text-xs font-bold text-slate-950 uppercase tracking-widest rounded transition flex items-center justify-center gap-2"
                  style={pageMono}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0c121b] border border-white/15 rounded-xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-white" style={pageDisplay}>
                Edit <em className="text-[#5ed3ff]">User Profile</em>
              </h2>
              <p className="text-xs text-white/50 font-mono mt-1">{editingUser.email}</p>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/50 font-mono mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#06090f] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5ed3ff]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/50 font-mono mb-1">
                  Assigned Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full bg-[#06090f] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5ed3ff]"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="admin">Admin</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/50 font-mono mb-1">
                  Account Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full bg-[#06090f] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5ed3ff]"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="active">Active (Access Granted)</option>
                  <option value="disabled">Disabled (Access Revoked)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="w-1/2 py-2 bg-white/5 hover:bg-white/10 text-xs text-white/70 uppercase tracking-widest rounded"
                  style={pageMono}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2 bg-[#5ed3ff] hover:bg-[#4bc0ed] text-xs font-bold text-slate-950 uppercase tracking-widest rounded transition flex items-center justify-center gap-2"
                  style={pageMono}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
