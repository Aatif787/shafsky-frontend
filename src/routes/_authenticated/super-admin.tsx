import { createFileRoute, Link, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/auth-system/useAuth";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  KeyRound,
  Lock,
  Plane,
  Armchair,
  CreditCard,
  Percent,
  Settings,
  Cpu,
  ShieldAlert,
  FileText,
  Menu,
  X,
  ChevronDown,
  LogOut,
  AlertTriangle,
  Palette,
} from "lucide-react";
import { saTheme, saMono, saDisplay } from "@/components/super-admin/SAComponents";
import { checkSuperAdminAccess } from "@/lib/super-admin.functions";

export const Route = createFileRoute("/_authenticated/super-admin")({
  beforeLoad: async () => {
    const res = await checkSuperAdminAccess().catch(() => null);
    const { roles, userId } = res || { roles: [], userId: null };
    if (!userId || userId === "guest_user") {
      throw redirect({ to: `/auth?mode=signin` } as any);
    }
    if (!roles || !roles.includes("super_admin")) {
      if (roles && roles.includes("admin")) throw redirect({ to: `/admin` } as any);
      throw redirect({ to: `/dashboard` } as any);
    }
    return { roles, userId };
  },
  loader: async () => {
    const res = await checkSuperAdminAccess().catch(() => null);
    const { roles, userId } = res || { roles: [], userId: null };
    if (!userId || userId === "guest_user") {
      throw redirect({ to: `/auth?mode=signin` } as any);
    }
    if (!roles || !roles.includes("super_admin")) {
      if (roles && roles.includes("admin")) throw redirect({ to: `/admin` } as any);
      throw redirect({ to: `/dashboard` } as any);
    }
    return { roles, userId };
  },
  ssr: true,
  errorComponent: ({ error }: { error: Error }) => (
    <div className="flex min-h-screen items-center justify-center bg-[#06090f] p-6 text-white text-center">
      <div className="max-w-md w-full p-8 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-4">
        <h2 className="text-xl font-bold font-mono text-red-400">Super Admin Exception</h2>
        <p className="text-xs text-white/60">
          An error occurred loading the super admin panel: {error.message}
        </p>
        <Link to="/" className="inline-block mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-mono uppercase tracking-widest text-white transition">
          Return to Homepage
        </Link>
      </div>
    </div>
  ),
  component: SuperAdminLayout,
});

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", path: "/super-admin", icon: LayoutDashboard }],
  },
  {
    title: "Identity & Access",
    items: [
      { label: "Users", path: "/super-admin/users", icon: Users },
      { label: "Admins", path: "/super-admin/admins", icon: ShieldCheck },
      { label: "Roles", path: "/super-admin/roles", icon: KeyRound },
      { label: "Permissions", path: "/super-admin/permissions", icon: Lock },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { label: "Airports", path: "/super-admin/airports", icon: Plane },
      { label: "Lounges", path: "/super-admin/lounges", icon: Armchair },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Payments", path: "/super-admin/payments", icon: CreditCard },
      { label: "Coupons", path: "/super-admin/coupons", icon: Percent },
    ],
  },
  {
    title: "Platform",
    items: [
      { label: "System", path: "/super-admin/system", icon: Cpu },
      { label: "Security", path: "/super-admin/security", icon: ShieldAlert },
      { label: "Audit Logs", path: "/super-admin/audit-logs", icon: FileText },
      { label: "Branding", path: "/super-admin/branding", icon: Palette },
      { label: "Settings", path: "/super-admin/settings", icon: Settings },
    ],
  },
];

function SuperAdminLayout() {
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const location = useLocation();
  const { userId } = Route.useLoaderData();

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const isActive = (path: string) => {
    if (path === "/super-admin") return location.pathname === "/super-admin";
    return location.pathname.startsWith(path);
  };

  if (!userId || userId === "guest_user") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: saTheme.bg, color: saTheme.ink }}
      >
        <div className="max-w-md w-full p-8 border border-red-500/20 bg-red-500/5 rounded-lg text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
            <AlertTriangle className="h-8 w-8 text-red-500 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2
              className="text-xl font-bold uppercase tracking-wider text-red-400"
              style={saDisplay}
            >
              403 Access Denied
            </h2>
            <p className="text-xs text-white/50 leading-relaxed">
              Super Administrator clearance required to access this section.
            </p>
          </div>
          <Link
            to="/"
            className="inline-block w-full py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold uppercase tracking-widest transition text-center rounded"
            style={saMono}
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#a78bfa]/15 flex items-center justify-center border border-[#a78bfa]/20">
            <ShieldCheck className="h-4.5 w-4.5 text-[#a78bfa]" />
          </div>
          <div>
            <div
              className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#a78bfa]"
              style={saMono}
            >
              Shafsky Aviation Services
            </div>
            <div
              className="text-[8px] uppercase tracking-[0.3em] text-white/30 mt-0.5"
              style={saMono}
            >
              Super Admin Console
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto space-y-1">
        {NAV_SECTIONS.map((section) => {
          const isCollapsed = collapsedSections.has(section.title);
          return (
            <div key={section.title}>
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-3 py-2 text-[9px] uppercase tracking-[0.25em] text-white/25 hover:text-white/40 transition-colors cursor-pointer"
                style={saMono}
              >
                {section.title}
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                />
              </button>
              {!isCollapsed && (
                <div className="space-y-0.5 mb-2">
                  {section.items.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-[11px] font-medium transition-all ${
                          active
                            ? "bg-[#a78bfa]/10 text-[#a78bfa] border-l-2 border-[#a78bfa]"
                            : "text-white/50 hover:text-white/80 hover:bg-white/[0.02]"
                        }`}
                        style={saMono}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/[0.04] space-y-1">
        <Link
          to="/admin"
          className="flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-white/30 hover:text-[#a78bfa] transition-colors rounded-md"
          style={saMono}
        >
          ← Admin Console
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-white/30 hover:text-white/50 transition-colors rounded-md"
          style={saMono}
        >
          ← Public Website
        </Link>
        <a
          href="/auth"
          onClick={async (e) => {
            e.preventDefault();
            await signOut();
          }}
          className="flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-red-400/60 hover:text-red-400 transition-colors rounded-md cursor-pointer"
          style={saMono}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </a>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex" style={{ background: saTheme.bg, color: saTheme.ink }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/[0.04] shrink-0 bg-[#0a0e18]">
        {sidebarContent}
      </aside>

      {/* Mobile Header + Drawer */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="lg:hidden flex items-center justify-between border-b border-white/[0.04] bg-[#0a0e18] px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#a78bfa]/15 flex items-center justify-center border border-[#a78bfa]/20">
              <ShieldCheck className="h-3.5 w-3.5 text-[#a78bfa]" />
            </div>
            <div>
              <div
                className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#a78bfa]"
                style={saMono}
              >
                Super Admin
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white/60 hover:text-white p-1"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Nav Overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="w-72 bg-[#0a0e18] border-r border-white/[0.04] flex flex-col h-full overflow-y-auto">
              <div className="flex items-center justify-end p-4">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {sidebarContent}
            </div>
            <div className="flex-1 bg-black/60" onClick={() => setMobileOpen(false)} />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-5 sm:p-6 md:p-8 lg:p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
