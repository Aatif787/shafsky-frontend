import type { ReactNode } from "react";
import { pageMono, pageDisplay } from "@/components/site/PageShell";

/* ─── KPI Card ─── */
export function AdminKpiCard({
  label,
  value,
  icon: Icon,
  accent = false,
  trend,
  className = "",
}: {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: boolean;
  trend?: string;
  className?: string;
}) {
  return (
    <div className={`border border-white/[0.06] bg-[#0c121b] p-5 rounded-sm ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-white/40" style={pageMono}>
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-white/20" />}
      </div>
      <div
        className="text-3xl font-semibold mt-2"
        style={{ ...pageDisplay, color: accent ? "#5ed3ff" : "#fff" }}
      >
        {value}
      </div>
      {trend && (
        <div className="text-[10px] text-white/30 mt-2" style={pageMono}>
          {trend}
        </div>
      )}
    </div>
  );
}

/* ─── Page Header ─── */
export function AdminPageHeader({
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
        <nav className="flex items-center gap-1.5 text-[10px] text-white/30" style={pageMono}>
          {breadcrumbs.map((crumb, i) => (
            <span key={`crumb-${crumb.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-white/15">/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-white/60 transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-white/50">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={pageDisplay}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-white/40 mt-1 uppercase tracking-widest" style={pageMono}>
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

/* ─── Status Badge ─── */
const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  inactive: "bg-red-500/10 text-red-400 border-red-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  maintenance: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  closed: "bg-red-500/10 text-red-400 border-red-500/20",
  completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  scheduled: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  confirmed: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  waiting: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  admitted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  reviewing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  quoted: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  absent: "bg-red-500/10 text-red-400 border-red-500/20",
  sent: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  super_admin: "bg-red-500/10 text-red-400 border-red-500/20",
  admin: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  customer: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  officer: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ops_manager: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export function AdminStatusBadge({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  const colors = STATUS_COLORS[status] || "bg-white/5 text-white/60 border-white/10";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border rounded ${colors} ${className}`}
      style={pageMono}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

/* ─── Search Bar ─── */
export function AdminSearchBar({
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
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25"
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
        className="w-full h-10 pl-10 pr-4 bg-white/[0.03] border border-white/[0.06] text-sm text-white/80 placeholder:text-white/25 outline-none focus:border-white/15 transition-colors"
        style={pageMono}
      />
    </div>
  );
}

/* ─── Empty State ─── */
export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-white/20" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-white/70">{title}</h3>
      {description && <p className="text-xs text-white/35 mt-1.5 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ─── Data Table ─── */
export interface DataTableColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export function AdminDataTable<T extends { id?: string }>({
  columns,
  data,
  isLoading,
  emptyMessage = "No data found",
  onRowClick,
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}) {
  if (isLoading) {
    return (
      <div className="border border-white/[0.06] bg-[#0c121b] rounded-sm overflow-hidden">
        <div className="animate-pulse space-y-0">
          <div className="h-10 bg-white/[0.02] border-b border-white/[0.04]" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`skel-row-${i}`} className="h-12 border-b border-white/[0.03]">
              <div className="flex items-center gap-4 px-4 h-full">
                {columns.map((_, ci) => (
                  <div key={ci} className="flex-1 h-3 bg-white/[0.04] rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-white/[0.06] bg-[#0c121b] rounded-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-[9px] uppercase tracking-[0.2em] text-white/40 font-semibold ${col.className || ""}`}
                  style={pageMono}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-xs text-white/25"
                  style={pageMono}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={((row as Record<string, unknown>).id as string) || rowIdx}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-white/[0.03] last:border-0 ${
                    onRowClick ? "cursor-pointer hover:bg-white/[0.02]" : ""
                  } transition-colors`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-xs text-white/70 ${col.className || ""}`}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? "—")}
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
