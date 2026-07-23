import type { ReactNode } from "react";

/* ─── Super Admin Design Tokens ─── */
export const saTheme = {
  bg: "#070b14",
  panel: "#0d1320",
  panelHover: "#111827",
  accent: "#a78bfa",
  accentDeep: "#7c3aed",
  accentMuted: "rgba(167,139,250,0.15)",
  ink: "#e8ecf4",
  muted: "rgba(232,236,244,0.5)",
  line: "rgba(255,255,255,0.06)",
  success: "#34d399",
  warning: "#fbbf24",
  danger: "#f87171",
};

export const saMono: React.CSSProperties = {
  fontFamily: "JetBrains Mono, monospace",
};

export const saDisplay: React.CSSProperties = {
  fontFamily: "Inter, sans-serif",
  fontWeight: 700,
};

/* ─── KPI Card ─── */
export function SAKpiCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  className = "",
}: {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden border border-white/[0.04] rounded-lg p-5 ${className}`}
      style={{
        background: `linear-gradient(135deg, ${saTheme.panel} 0%, rgba(167,139,250,0.03) 100%)`,
      }}
    >
      <div className="flex items-start justify-between">
        <span className="text-[10px] uppercase tracking-widest text-white/35" style={saMono}>
          {label}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-md bg-[#a78bfa]/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-[#a78bfa]" />
          </div>
        )}
      </div>
      <div className="text-3xl font-bold mt-3 text-white" style={saDisplay}>
        {value}
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 mt-2">
          <span
            className={`text-[10px] font-semibold ${
              trendUp === true
                ? "text-emerald-400"
                : trendUp === false
                  ? "text-red-400"
                  : "text-white/30"
            }`}
            style={saMono}
          >
            {trendUp === true ? "↑" : trendUp === false ? "↓" : "—"} {trend}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Page Header ─── */
export function SAPageHeader({
  title,
  subtitle,
  breadcrumbs,
  action,
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  action?: ReactNode;
}) {
  return (
    <div className="space-y-3 mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-[10px] text-white/25" style={saMono}>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-white/10">›</span>}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-[#a78bfa] transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-white/45">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight" style={saDisplay}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-white/35 mt-1" style={saMono}>
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

/* ─── Search Bar ─── */
export function SASearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a78bfa]/40"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-4 bg-white/[0.02] border border-white/[0.05] rounded-md text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-[#a78bfa]/30 transition-colors"
        style={saMono}
      />
    </div>
  );
}

/* ─── Data Table ─── */
export interface SATableColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export function SADataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading,
  emptyIcon: EmptyIcon,
  emptyMessage = "No records found",
  onRowClick,
}: {
  columns: SATableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}) {
  if (isLoading) {
    return (
      <div
        className="border border-white/[0.04] rounded-lg overflow-hidden"
        style={{ background: saTheme.panel }}
      >
        <div className="animate-pulse">
          <div className="h-10 bg-white/[0.02] border-b border-white/[0.03]" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 border-b border-white/[0.02] flex items-center gap-4 px-4">
              {columns.map((_, ci) => (
                <div key={ci} className="flex-1 h-3 bg-white/[0.03] rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="border border-white/[0.04] rounded-lg overflow-hidden"
      style={{ background: saTheme.panel }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-[9px] uppercase tracking-[0.2em] text-[#a78bfa]/50 font-semibold ${col.className || ""}`}
                  style={saMono}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  {EmptyIcon && (
                    <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mx-auto mb-3">
                      <EmptyIcon className="h-5 w-5 text-white/15" />
                    </div>
                  )}
                  <span className="text-xs text-white/25" style={saMono}>
                    {emptyMessage}
                  </span>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={String(row.id ?? idx)}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-white/[0.02] last:border-0 transition-colors ${
                    onRowClick ? "cursor-pointer hover:bg-[#a78bfa]/[0.03]" : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-xs text-white/65 ${col.className || ""}`}
                    >
                      {col.render ? col.render(row) : String(row[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Permission Matrix ─── */
export function SAPermissionMatrix({
  roles,
  permissions,
  matrix,
  onToggle,
  isLoading,
}: {
  roles: string[];
  permissions: string[];
  matrix: Record<string, string[]>;
  onToggle: (role: string, permission: string) => void;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div
        className="border border-white/[0.04] rounded-lg p-8 animate-pulse"
        style={{ background: saTheme.panel }}
      >
        <div className="h-6 bg-white/[0.03] rounded w-48 mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-white/[0.02] rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="border border-white/[0.04] rounded-lg overflow-hidden"
      style={{ background: saTheme.panel }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.05]">
              <th
                className="px-4 py-3 text-[9px] uppercase tracking-[0.2em] text-[#a78bfa]/50 font-semibold sticky left-0 bg-[#0d1320] z-10"
                style={saMono}
              >
                Permission
              </th>
              {roles.map((role) => (
                <th
                  key={role}
                  className="px-3 py-3 text-[9px] uppercase tracking-[0.15em] text-white/40 font-semibold text-center"
                  style={saMono}
                >
                  {role.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm) => (
              <tr key={perm} className="border-b border-white/[0.02] last:border-0">
                <td
                  className="px-4 py-2.5 text-[10px] text-white/60 sticky left-0 bg-[#0d1320] z-10"
                  style={saMono}
                >
                  {perm}
                </td>
                {roles.map((role) => {
                  const isGranted = matrix[role]?.includes(perm);
                  return (
                    <td key={role} className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => onToggle(role, perm)}
                        className={`w-5 h-5 rounded border transition-all ${
                          isGranted
                            ? "bg-[#a78bfa] border-[#a78bfa] text-white"
                            : "bg-transparent border-white/15 hover:border-[#a78bfa]/40"
                        } flex items-center justify-center mx-auto cursor-pointer`}
                      >
                        {isGranted && (
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Status Badge (SA variant) ─── */
const SA_STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  inactive: "bg-red-500/10 text-red-400 border-red-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  enabled: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  disabled: "bg-red-500/10 text-red-400 border-red-500/20",
  super_admin: "bg-[#a78bfa]/10 text-[#a78bfa] border-[#a78bfa]/20",
  admin: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  customer: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  sent: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  whitelist: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  blacklist: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function SAStatusBadge({ status, className = "" }: { status: string; className?: string }) {
  const colors = SA_STATUS_COLORS[status] || "bg-white/5 text-white/50 border-white/10";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border rounded-md ${colors} ${className}`}
      style={saMono}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
