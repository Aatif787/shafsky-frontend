/* eslint-disable react-refresh/only-export-components */
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export const display = { fontFamily: "Fraunces, serif", fontWeight: 300 } as const;
export const mono = { fontFamily: "JetBrains Mono, monospace" } as const;

export const DARK = {
  bg: "#06090f",
  panel: "#0c121b",
  panel2: "#0f1622",
  line: "rgba(255,255,255,0.08)",
  lineStrong: "rgba(255,255,255,0.16)",
  ink: "#eef2f7",
  mute: "rgba(238,242,247,0.55)",
  blue: "#5ed3ff",
  blueDeep: "#0a84ff",
};

export function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div
      className="flex min-w-0 items-center gap-3 text-[10px] uppercase tracking-[0.26em] sm:gap-4 sm:tracking-[0.4em]"
      style={{ ...mono, color: DARK.mute }}
    >
      <span className="h-px w-8 shrink-0 sm:w-12" style={{ background: DARK.lineStrong }} />
      <span className="truncate">{label}</span>
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
      className={`relative overflow-hidden rounded-[2px] p-5 sm:p-7 ${className}`}
      style={{ background: DARK.panel, border: `1px solid ${DARK.line}` }}
    >
      {children}
    </motion.div>
  );
}

export function StatusDot({ status }: { status: "live" | "24x7" | "limited" }) {
  const c = status === "live" ? "#5fe39a" : status === "24x7" ? DARK.blue : "#f4c54a";
  return (
    <span
      className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.3em]"
      style={{ ...mono, color: DARK.mute }}
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: c }} />
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
      className="relative inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden px-5 py-4 text-center text-[10px] uppercase tracking-[0.24em] transition-all sm:px-7 sm:text-[11px] sm:tracking-[0.3em]"
      style={{
        ...mono,
        color: DARK.ink,
        background: DARK.blueDeep,
        border: `1px solid ${DARK.blue}`,
      }}
    >
      <span className="relative z-10">{children}</span>
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-700 hover:translate-x-full"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
        }}
      />
    </span>
  );
  if (href) return <a href={href}>{inner}</a>;
  return <button onClick={onClick}>{inner}</button>;
}
