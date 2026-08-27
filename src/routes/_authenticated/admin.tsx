import { createFileRoute, Link, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  PlaneTakeoff,
  Plane,
  Users,
  ConciergeBell,
  BellRing,
  ShieldCheck,
  BarChart3,
  Settings,
  History,
  Menu,
  X,
  UserCheck,
  AlertTriangle,
  Headphones,
} from "lucide-react";
import { darkTheme, pageDisplay, pageMono, Panel } from "@/components/site/PageShell";
import { checkStaffAccess } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  loader: async () => {
    const res = await checkStaffAccess().catch((err) => {
      console.error("checkStaffAccess CLIENT ERROR:", err);
      return null;
    });
    const { isStaff, roles, userId } = res || { isStaff: false, roles: [], userId: null };
    // Unauthenticated -> redirect to sign-in
    if (!userId || userId === "guest_user") {
      // `redirect` has complex generic types; use a minimal object form and cast to any
      throw redirect({ to: `/auth?mode=signin` } as any);
    }
    // Guard: Only allow admin and super_admin in /admin
    if (!roles || (!roles.includes("admin") && !roles.includes("super_admin"))) {
      throw redirect({ to: `/dashboard` } as any);
    }
    return { isStaff, roles, userId };
  },
  ssr: true,
  errorComponent: ({ error }: { error: Error }) => (
    <div className="flex min-h-screen items-center justify-center bg-[#06090f] p-6 text-white text-center">
      <div className="max-w-md w-full p-8 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-4">
        <h2 className="text-xl font-bold font-mono text-red-400">Admin System Error</h2>
        <p className="text-xs text-white/60">
          An error occurred loading the admin panel: {error.message}
        </p>
        <Link to="/" className="inline-block mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-mono uppercase tracking-widest text-white transition">
          Return to Homepage
        </Link>
      </div>
    </div>
  ),
  component: AdminLayout,
});

const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: [
    "bookings:read",
    "bookings:write",
    "bookings:assign",
    "customers:read",
    "customers:write",
    "services:read",
    "services:write",
    "flights:read",
    "flights:write",
    "notifications:read",
    "notifications:retry",
    "staff:read",
    "staff:write",
    "audit:read",
    "settings:read",
    "settings:write",
    "reports:read",
  ],
  admin: [
    "bookings:read",
    "bookings:write",
    "bookings:assign",
    "customers:read",
    "customers:write",
    "services:read",
    "services:write",
    "flights:read",
    "flights:write",
    "notifications:read",
    "notifications:retry",
    "staff:read",
    "staff:write",
    "reports:read",
  ],
  customer: [],
};

function clientHasPermission(roles: string[], action: string): boolean {
  return roles.some((role) => ROLE_PERMISSIONS[role]?.includes(action));
}

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isStaff, roles = ["customer"], userId = "guest_user" } = Route.useLoaderData();

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-[#06090f] text-white flex flex-col items-center justify-center p-6">
        <Panel
          tone="dark"
          className="max-w-md w-full p-8 border border-red-500/20 bg-red-500/5 text-center space-y-6"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
            <AlertTriangle className="h-8 w-8 text-red-500 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2
              className="text-xl font-bold uppercase tracking-wider text-red-400"
              style={pageDisplay}
            >
              403 Access Denied
            </h2>
            <p className="text-xs text-white/50 leading-relaxed">
              Your account does not possess the administrative clearances required to access the
              operational command center.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
            <Link
              to="/"
              className="w-full py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold uppercase tracking-widest transition text-center"
              style={pageMono}
            >
              Return to Homepage
            </Link>
          </div>
        </Panel>
      </div>
    );
  }

  const menuItems = [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard, show: true },
    {
      label: "Bookings",
      path: "/admin/bookings",
      icon: PlaneTakeoff,
      show: clientHasPermission(roles, "bookings:read"),
    },
    {
      label: "Private Charter",
      path: "/admin/charter",
      icon: Plane,
      show: clientHasPermission(roles, "bookings:read"),
    },
    {
      label: "Case Management",
      path: "/admin/cases",
      icon: Headphones,
      show: clientHasPermission(roles, "customers:read"),
    },
    {
      label: "Customers",
      path: "/admin/customers",
      icon: Users,
      show: clientHasPermission(roles, "customers:read"),
    },
    {
      label: "Lounges",
      path: "/admin/lounges",
      icon: ConciergeBell,
      show: clientHasPermission(roles, "services:read"),
    },
    {
      label: "Operations",
      path: "/admin/operations",
      icon: ShieldCheck,
      show: clientHasPermission(roles, "staff:read"),
    },
    {
      label: "Services",
      path: "/admin/services",
      icon: ConciergeBell,
      show: clientHasPermission(roles, "services:read"),
    },
    {
      label: "Flights",
      path: "/admin/flights",
      icon: ShieldCheck,
      show: clientHasPermission(roles, "flights:read"),
    },
    {
      label: "Notifications",
      path: "/admin/notifications",
      icon: BellRing,
      show: clientHasPermission(roles, "notifications:read"),
    },
    {
      label: "Staff & Roles",
      path: "/admin/staff",
      icon: UserCheck,
      show: clientHasPermission(roles, "staff:write"),
    },
    {
      label: "Reports",
      path: "/admin/reports",
      icon: BarChart3,
      show: clientHasPermission(roles, "reports:read"),
    },
    {
      label: "Analytics",
      path: "/admin/analytics",
      icon: BarChart3,
      show: clientHasPermission(roles, "reports:read"),
    },
    {
      label: "Audit Logs",
      path: "/admin/audit-logs",
      icon: History,
      show: clientHasPermission(roles, "audit:read"),
    },
    {
      label: "Profile",
      path: "/admin/profile",
      icon: UserCheck,
      show: true,
    },
    {
      label: "Settings",
      path: "/admin/settings",
      icon: Settings,
      show: clientHasPermission(roles, "settings:read"),
    },
  ].filter((item) => item.show);

  const currentPath = location.pathname;
  const currentItem = [
    { path: "/admin/bookings", action: "bookings:read" },
    { path: "/admin/customers", action: "customers:read" },
    { path: "/admin/lounges", action: "services:read" },
    { path: "/admin/operations", action: "staff:read" },
    { path: "/admin/services", action: "services:read" },
    { path: "/admin/flights", action: "flights:read" },
    { path: "/admin/notifications", action: "notifications:read" },
    { path: "/admin/staff", action: "staff:write" },
    { path: "/admin/reports", action: "reports:read" },
    { path: "/admin/analytics", action: "reports:read" },
    { path: "/admin/audit-logs", action: "audit:read" },
    { path: "/admin/profile", action: "bookings:read" }, // Profile is accessible to anyone logged in as admin/staff
    { path: "/admin/settings", action: "settings:read" },
  ].find((item) => currentPath.startsWith(item.path));

  const isForbidden = currentItem && !clientHasPermission(roles, currentItem.action);

  return (
    <div className="min-h-screen flex text-white/90" style={{ background: "#06090f" }}>
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/10 shrink-0 bg-[#090d16] p-6 justify-between">
        <div className="space-y-6">
          <div>
            <div
              className="text-[#5ed3ff] font-bold text-xs uppercase tracking-[0.25em]"
              style={pageMono}
            >
              SHAFSKY AVIATION SERVICES
            </div>
            <div
              className="text-[9px] uppercase tracking-[0.3em] text-white/40 mt-1"
              style={pageMono}
            >
              OPERATIONS CONSOLE
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] transition-colors ${
                    isActive
                      ? "bg-white/[0.04] text-[#5ed3ff] border-l-2 border-[#5ed3ff]"
                      : "text-white/60 hover:text-white hover:bg-white/[0.02]"
                  }`}
                  style={pageMono}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-white/5 space-y-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-[#5ed3ff] transition-colors"
            style={pageMono}
          >
            ← Public Website
          </Link>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="lg:hidden flex items-center justify-between border-b border-white/10 bg-[#090d16] px-6 py-4">
          <div>
            <div
              className="text-[#5ed3ff] font-bold text-[10px] uppercase tracking-[0.25em]"
              style={pageMono}
            >
              SHAFSKY AVIATION SERVICES
            </div>
            <div className="text-[8px] uppercase tracking-[0.3em] text-white/40" style={pageMono}>
              OPS PORTAL
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white/80 hover:text-white"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-[#06090f] flex flex-col p-8 pt-20 space-y-6">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 text-white/80 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 text-xs uppercase tracking-[0.15em] transition-colors ${
                      isActive
                        ? "bg-white/[0.04] text-[#5ed3ff] border-l-2 border-[#5ed3ff]"
                        : "text-white/60 hover:text-white"
                    }`}
                    style={pageMono}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-white/10 pt-6">
              <Link
                to="/"
                className="text-[10px] uppercase tracking-[0.2em] text-white/40"
                style={pageMono}
              >
                ← Public Website
              </Link>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl w-full mx-auto">
          {isForbidden ? (
            <div className="flex h-[60vh] items-center justify-center">
              <Panel
                tone="dark"
                className="max-w-md w-full p-8 border border-red-500/20 bg-red-500/5 text-center space-y-6"
              >
                <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <div className="space-y-2">
                  <h2
                    className="text-xl font-bold uppercase tracking-wider text-red-400"
                    style={pageDisplay}
                  >
                    403 Forbidden
                  </h2>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Your active role ({roles.join(", ")}) does not have clearance to view{" "}
                    <code>{currentPath}</code>.
                  </p>
                </div>
              </Panel>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
