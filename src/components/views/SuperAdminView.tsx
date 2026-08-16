import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { supabase } from "@/integrations/supabase/client";
import { getSessionInfo } from "@/lib/session";
import { useAuth } from "@/auth-system/useAuth";
import {
  getSuperAdminKPIs,
  listAllUsers,
  updateUserRoleAndStatus,
  listCoupons,
  createCoupon,
  toggleCoupon,
  deleteCoupon,
  getAuditLogs,
} from "@/lib/super-admin.functions";
import {
  LayoutDashboard,
  ShieldAlert,
  Users,
  Percent,
  Activity,
  History,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  RefreshCw,
  LogOut,
  UserCheck,
  Zap,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

const display = { fontFamily: "'Fraunces', serif", fontWeight: 300 };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_uses?: number | null;
  uses_count: number;
  is_active: boolean;
  expires_at?: string | null;
}

interface AuditLog {
  id: string;
  action: string;
  actor_id?: string | null;
  actor_email?: string | null;
  ip_address?: string | null;
  created_at: string;
  details?: any | null;
}

interface ProfileWithRole {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  company?: string | null;
  created_at?: string | null;
  roles?: string[];
}

export default function SuperAdminView({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const { profile: authProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "coupons" | "audit" | "users">(
    "overview",
  );

  // Coupon Form state
  const [cpCode, setCpCode] = useState("");
  const [cpDiscount, setCpDiscount] = useState(10);
  const [cpMaxUses, setCpMaxUses] = useState(100);
  const [couponSubmitting, setCouponSubmitting] = useState(false);

  // TanStack Query: Stats Overview
  const { data: stats = { users: 0, bookings: 0, revenue: 0 }, isLoading: isStatsLoading } =
    useQuery({
      queryKey: queryKeys.superAdmin.kpis(),
      queryFn: async () => {
        try {
          const res = await getSuperAdminKPIs();
          return {
            users: res.totalUsers || 0,
            bookings: res.totalBookings || 0,
            revenue: res.totalRevenue || 0,
          };
        } catch {
          return { users: 0, bookings: 0, revenue: 0 };
        }
      },
      staleTime: 20000,
    });

  const [isCouponsMigrationRequired] = useState(false);

  // TanStack Query: Coupons
  const {
    data: coupons = [],
    isLoading: isCouponsLoading,
    refetch: fetchCoupons,
  } = useQuery<Coupon[]>({
    queryKey: queryKeys.superAdmin.coupons(),
    queryFn: async () => {
      try {
        const res = await listCoupons();
        return (res || []) as unknown as Coupon[];
      } catch {
        return [];
      }
    },
    staleTime: 30000,
  });

  // TanStack Query: Audit Logs
  const {
    data: auditLogs = [],
    isLoading: isAuditLoading,
    refetch: fetchAuditLogs,
  } = useQuery<any[]>({
    queryKey: queryKeys.superAdmin.audits(),
    queryFn: async () => {
      try {
        const res = await getAuditLogs();
        return (res || []).map((l: any) => ({
          id: l.id,
          action: l.action,
          actor_id: l.actor || l.actor_id,
          entity_type: l.entity_type || l.entity,
          created_at: l.created_at || l.timestamp,
        }));
      } catch {
        return [];
      }
    },
    staleTime: 10000,
  });

  // TanStack Query: All Users
  const {
    data: systemUsers = [],
    isLoading: isUsersLoading,
    refetch: fetchUsers,
  } = useQuery<any[]>({
    queryKey: queryKeys.superAdmin.users(),
    queryFn: async () => {
      try {
        const res = await listAllUsers();
        return (res || []).map((u: any) => ({
          id: u.id,
          full_name: u.full_name || u.email?.split("@")[0] || "User",
          email: u.email,
          created_at: u.created_at || "",
          updated_at: u.updated_at || "",
          roles: u.role ? [u.role.toLowerCase()] : ["customer"],
        }));
      } catch {
        return [];
      }
    },
    staleTime: 15000,
  });

  const loading = isStatsLoading || isCouponsLoading || isAuditLoading || isUsersLoading;

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponSubmitting(true);
    try {
      await createCoupon({
        data: {
          code: cpCode.toUpperCase().trim(),
          discount_percent: cpDiscount,
          max_uses: cpMaxUses,
        },
      });
      toast.success("Coupon code successfully initialized.");
      setCpCode("");
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize coupon.");
    } finally {
      setCouponSubmitting(false);
    }
  };

  const handleToggleCoupon = async (couponId: string, currentStatus: boolean) => {
    try {
      await toggleCoupon({
        data: {
          id: couponId,
          is_active: !currentStatus,
        },
      });
      toast.success("Coupon status modified.");
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle coupon.");
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      await deleteCoupon({
        data: {
          id: couponId,
        },
      });
      toast.success("Coupon successfully deleted.");
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete coupon.");
    }
  };

  const handleUpdateRole = async (targetUserId: string, newRole: string) => {
    try {
      await updateUserRoleAndStatus({
        data: {
          targetUserId,
          role: newRole as any,
        },
      });
      toast.success("User credentials / role updated successfully.");
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || "Failed to update role permissions.");
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf5ea] flex flex-col items-center justify-center p-6">
        <Loader2 className="h-8 w-8 text-[#0d5a6e] animate-spin" />
        <span className="mt-4 text-xs font-mono tracking-widest text-[#5b6b75] uppercase">
          Loading Systems Console...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf5ea] text-[#0d2a36] flex flex-col">
      {/* Top Banner */}
      <div className="h-24 bg-[#0d2a36]" />

      <div className="flex-1 flex flex-col lg:flex-row max-w-[1480px] w-full mx-auto p-4 lg:p-8 gap-6">
        {/* Sidebar */}
        <aside
          className="w-full lg:w-72 bg-[#faf5ea] rounded-3xl border border-black/[0.06] p-6 shrink-0 flex flex-col justify-between"
          style={{ boxShadow: "8px 8px 24px #e8e0d0, -8px -8px 24px #ffffff" }}
        >
          <div>
            <div className="flex items-center gap-3.5 mb-8 pb-6 border-b border-black/[0.06]">
              <div className="h-12 w-12 rounded-full bg-red-950/10 border border-red-950/20 flex items-center justify-center text-xl font-bold text-red-950">
                SA
              </div>
              <div className="truncate">
                <div className="text-[13px] font-bold text-[#0d2a36] truncate">
                  {authProfile?.name || "Super Admin"}
                </div>
                <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono mt-0.5">
                  Root Administrator
                </div>
              </div>
            </div>

            <nav className="space-y-1.5">
              {[
                { id: "overview", label: "Operations Panel", icon: Activity },
                { id: "coupons", label: "Promos & Coupons", icon: Percent },
                { id: "audit", label: "Security Logs", icon: History },
                { id: "users", label: "RBAC Accounts", icon: Users },
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${isActive
                        ? "bg-[#0d5a6e] text-white shadow-md shadow-[#0d5a6e]/15 translate-x-1"
                        : "text-[#5b6b75] hover:text-[#0d2a36] hover:bg-black/[0.02]"
                      }`}
                    style={mono}
                  >
                    <item.icon className="h-4.5 w-4.5 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-8 pt-6 border-t border-black/[0.06] space-y-2">
            <Link
              to="/"
              className="w-full flex items-center gap-3 px-4.5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wider text-[#0d5a6e] hover:bg-[#0d5a6e]/5 transition cursor-pointer"
              style={mono}
            >
              Main Website
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4.5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-500/5 transition cursor-pointer"
              style={mono}
            >
              <LogOut className="h-4.5 w-4.5 shrink-0" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Active Tab Panel */}
          <div
            className="p-6 rounded-3xl bg-[#faf5ea] border border-white/50 space-y-6"
            style={{ boxShadow: "12px 12px 36px #e8e0d0, -12px -12px 36px #ffffff" }}
          >
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2
                    className="text-base font-bold text-[#0d5a6e] uppercase tracking-wider"
                    style={mono}
                  >
                    Systems Operations Center
                  </h2>
                  <p className="text-[10px] uppercase tracking-wider text-[#5b6b75] mt-1 font-mono">
                    Realtime database health, network metrics, and key operations
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  <div
                    className="bg-[#faf5ea] rounded-3xl p-6 border border-black/[0.04]"
                    style={{ boxShadow: "4px 4px 12px #e8e0d0, -4px -4px 12px #ffffff" }}
                  >
                    <div
                      className="text-[9px] uppercase font-bold tracking-widest text-[#5b6b75]"
                      style={mono}
                    >
                      Total Registered Users
                    </div>
                    <div className="text-2xl font-light text-[#0d2a36] mt-2">{stats.users}</div>
                  </div>
                  <div
                    className="bg-[#faf5ea] rounded-3xl p-6 border border-black/[0.04]"
                    style={{ boxShadow: "4px 4px 12px #e8e0d0, -4px -4px 12px #ffffff" }}
                  >
                    <div
                      className="text-[9px] uppercase font-bold tracking-widest text-[#5b6b75]"
                      style={mono}
                    >
                      Total Operational Flights
                    </div>
                    <div className="text-2xl font-light text-[#0d2a36] mt-2">{stats.bookings}</div>
                  </div>
                  <div
                    className="bg-[#faf5ea] rounded-3xl p-6 border border-black/[0.04]"
                    style={{ boxShadow: "4px 4px 12px #e8e0d0, -4px -4px 12px #ffffff" }}
                  >
                    <div
                      className="text-[9px] uppercase font-bold tracking-widest text-[#5b6b75]"
                      style={mono}
                    >
                      Tarmac Invoiced Revenue
                    </div>
                    <div className="text-2xl font-light text-[#0d2a36] mt-2">
                      ₹ {stats.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-black/[0.04]">
                  <h3 className="text-xs font-bold text-[#0d2a36] uppercase tracking-wider">
                    Infrastructure Health Logs
                  </h3>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-4 bg-white border border-black/[0.04] rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="text-xs font-bold text-[#0d2a36]">Database Engine</div>
                          <div className="text-[9px] text-[#5b6b75] font-mono">
                            SUPABASE POSTGRESQL
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold uppercase text-green-700 bg-green-50 px-2 py-0.5 rounded">
                        ONLINE
                      </span>
                    </div>

                    <div className="p-4 bg-white border border-black/[0.04] rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="text-xs font-bold text-[#0d2a36]">
                            API Gateway Latency
                          </div>
                          <div className="text-[9px] text-[#5b6b75] font-mono">
                            REST EDGE NETWORK
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        12 MS
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "coupons" && (
              <div className="space-y-6">
                <div>
                  <h2
                    className="text-base font-bold text-[#0d5a6e] uppercase tracking-wider"
                    style={mono}
                  >
                    Promotion & Discount Codes
                  </h2>
                  <p className="text-[10px] uppercase tracking-wider text-[#5b6b75] mt-1 font-mono">
                    Define operational coupon codes and calculate travel discount parameters
                  </p>
                </div>

                {isCouponsMigrationRequired && (
                  <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-700" />
                    <div className="text-xs">
                      <div className="font-bold">Database Migration Required</div>
                      <div className="mt-1 text-[11px] leading-relaxed">
                        The `coupons` table is missing from your Supabase schema. Showing local
                        cache coupons. Please apply the migration SQL
                        `20260710000000_lounge_platform_enhancements.sql` using the Supabase
                        Dashboard SQL Editor to activate full database capabilities.
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-1 bg-white border border-black/[0.04] p-5 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold text-[#0d2a36] uppercase tracking-wider">
                      Initialize Coupon
                    </h3>
                    <form onSubmit={handleCreateCoupon} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                          Promo Code
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. MONSOON20"
                          value={cpCode}
                          onChange={(e) => setCpCode(e.target.value)}
                          className="w-full h-9 px-3 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none uppercase"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                          Discount Percent
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="100"
                          value={cpDiscount}
                          onChange={(e) => setCpDiscount(parseInt(e.target.value))}
                          className="w-full h-9 px-3 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                          Max Allocations
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={cpMaxUses}
                          onChange={(e) => setCpMaxUses(parseInt(e.target.value))}
                          className="w-full h-9 px-3 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={couponSubmitting || isCouponsMigrationRequired}
                        className="w-full h-9 bg-[#0d5a6e] hover:bg-[#0a4252] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition disabled:opacity-50 cursor-pointer mt-2"
                        style={mono}
                      >
                        {couponSubmitting ? "Initializing..." : "Create Coupon"}
                      </button>
                    </form>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <h3 className="text-xs font-bold text-[#0d2a36] uppercase tracking-wider">
                      Active Coupons List
                    </h3>

                    <div className="space-y-2">
                      {coupons.map((coupon) => (
                        <div
                          key={coupon.id}
                          className="p-4 bg-white border border-black/[0.04] rounded-2xl flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#0d2a36] uppercase font-mono">
                                {coupon.code}
                              </span>
                              <span className="text-[9px] font-bold uppercase text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                                {coupon.discount_percent}% OFF
                              </span>
                            </div>
                            <div className="text-[9px] text-[#5b6b75] font-mono mt-1">
                              Uses: {coupon.uses_count} / {coupon.max_uses || "∞"}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleCoupon(coupon.id, coupon.is_active)}
                              className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg border transition ${coupon.is_active
                                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                  : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                }`}
                              style={mono}
                              disabled={isCouponsMigrationRequired}
                            >
                              {coupon.is_active ? "Active" : "Inactive"}
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              className="p-2 border border-red-100 hover:border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
                              disabled={isCouponsMigrationRequired}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "audit" && (
              <div className="space-y-6">
                <div>
                  <h2
                    className="text-base font-bold text-[#0d5a6e] uppercase tracking-wider"
                    style={mono}
                  >
                    Security Audit Trail
                  </h2>
                  <p className="text-[10px] uppercase tracking-wider text-[#5b6b75] mt-1 font-mono">
                    Monitor authorization checkpoints, state transitions, and user actions
                  </p>
                </div>

                <div className="bg-white border border-black/[0.04] rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#faf5ea] text-[#0d2a36] font-bold uppercase tracking-wider text-[9px] border-b border-black/[0.04]">
                        <tr>
                          <th className="p-4">Timestamp</th>
                          <th className="p-4">Action</th>
                          <th className="p-4">Actor Email</th>
                          <th className="p-4">IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/[0.04] text-[#5b6b75]">
                        {auditLogs.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="p-8 text-center text-[10px] uppercase text-[#5b6b75]"
                            >
                              No security audit logs recorded yet
                            </td>
                          </tr>
                        ) : (
                          auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-black/[0.01]">
                              <td className="p-4 whitespace-nowrap">
                                {new Date(log.created_at).toLocaleString()}
                              </td>
                              <td className="p-4 font-bold text-[#0d2a36]">{log.action}</td>
                              <td className="p-4">{log.actor_email || "system@shafsky.com"}</td>
                              <td className="p-4">{log.ip_address || "0.0.0.0"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-6">
                <div>
                  <h2
                    className="text-base font-bold text-[#0d5a6e] uppercase tracking-wider"
                    style={mono}
                  >
                    Role Based Access Control
                  </h2>
                  <p className="text-[10px] uppercase tracking-wider text-[#5b6b75] mt-1 font-mono">
                    Manage system access credentials and promote user permissions
                  </p>
                </div>

                <div className="space-y-3">
                  {systemUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-5 bg-white border border-black/[0.04] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#0d2a36]">
                          {user.full_name || "Aviation Client"}
                        </div>
                        <div className="text-[9px] text-[#5b6b75] font-mono mt-1">
                          ID: {user.id}
                        </div>
                        <div className="flex gap-1 mt-2">
                          {(user.roles || []).map((role: string) => (
                            <span
                              key={role}
                              className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${role === "super_admin"
                                  ? "bg-red-100 text-red-800"
                                  : role === "admin"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <select
                          value={user.roles?.[0] || "customer"}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          className="h-9 px-3 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin Console</option>
                          <option value="super_admin">Super Admin (Root)</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
