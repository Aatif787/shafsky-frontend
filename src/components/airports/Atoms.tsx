/* eslint-disable react-refresh/only-export-components */
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export const display = { fontFamily: "Fraunces, serif", fontWeight: 400 } as const;
export const mono = { fontFamily: "JetBrains Mono, monospace" } as const;

export const LIGHT = {
  bg: "#faf9f5",
  panel: "#ffffff",
  panel2: "#f8fafc",
  line: "#e2e8f0",
  lineStrong: "#cbd5e1",
  ink: "#0f172a",
  mute: "#64748b",
  lime: "#84cc16",
  limeDark: "#65a30d",
  violet: "#7c3aed",
  violetDeep: "#6d28d9",
  orange: "#f97316",
  emerald: "#10b981",
  grey: "#f1f5f9",
};

export const DARK = LIGHT;

export function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div
      className="flex min-w-0 items-center gap-3 text-[10px] uppercase tracking-[0.26em] sm:gap-4 sm:tracking-[0.4em]"
      style={{ ...mono, color: LIGHT.mute }}
    >
      <span className="h-px w-8 shrink-0 sm:w-12 bg-[#7c3aed]/30" />
      <span className="truncate text-[#7c3aed] font-bold">{label}</span>
    </div>
  );
}

export function GridCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-2xl p-5 sm:p-7 bg-white border border-[#e5dfd5] shadow-[0_10px_30px_-6px_rgba(0,0,0,0.05)] ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function StatusDot({ status }: { status: "live" | "24x7" | "limited" }) {
  const c = status === "live" ? "#10b981" : status === "24x7" ? "#7c3aed" : "#ff6b00";
  return (
    <span
      className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] font-semibold"
      style={{ ...mono, color: LIGHT.mute }}
    >
      <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: c }} />
      {status}
    </span>
  );
}

export function MagneticButton({
  children,
  href,
  onClick,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const inner = (
    <span
      className="relative inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden rounded-xl px-6 py-4 text-center text-[10px] uppercase tracking-[0.24em] font-bold transition-all sm:px-8 sm:text-[11px] sm:tracking-[0.3em] bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white shadow-[0_8px_24px_rgba(124,58,237,0.3)] hover:shadow-[0_12px_32px_rgba(124,58,237,0.45)] hover:scale-[1.02] active:scale-[0.98]"
      style={mono}
    >
      <span className="relative z-10">{children}</span>
    </span>
  );
  if (href) return <a href={href}>{inner}</a>;
  return <button onClick={onClick}>{inner}</button>;
}
