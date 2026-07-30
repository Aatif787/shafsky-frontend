/* eslint-disable react-refresh/only-export-components */
/**
 * PageShell — Shared design system primitives.
 *
 * Design tokens are defined as CSS custom properties in src/styles.css
 * under the `--shaf-*` namespace. The `creamTheme` and `darkTheme`
 * objects below mirror those tokens for use in inline styles.
 *
 * Utility classes available globally:
 *   .panel-luxury      — Card / surface with backdrop blur
 *   .shadow-luxury-sm  — Subtle elevation
 *   .shadow-luxury-md  — Medium elevation
 *   .shadow-luxury-lg  — Hero elevation
 *   .input-luxury      — Consistent text input
 *   .textarea-luxury   — Consistent textarea
 *   .btn-primary-luxury — Primary CTA button
 *   .btn-secondary-luxury — Secondary / outlined button
 *   .font-display-luxury — Fraunces display headings
 *   .font-body-luxury  — Plus Jakarta Sans body text
 *   .font-mono-luxury  — JetBrains Mono labels / codes
 *   .animate-fadeIn    — Smooth fade-in entrance
 */
import type { CSSProperties, ReactNode } from "react";

export const pageDisplay: CSSProperties = {
  fontFamily: "Fraunces, serif",
  fontWeight: 300,
  letterSpacing: "0",
};

export const pageMono: CSSProperties = {
  fontFamily: "JetBrains Mono, monospace",
};

export const creamTheme = {
  bg: "#faf8f5",
  paper: "#f5f0e6",
  ink: "#0b1a24",
  muted: "#576875",
  teal: "#0c3b46",
  tealDeep: "#06222a",
  mint: "#c5a059",
  line: "rgba(11, 26, 36, 0.08)",
};

export const darkTheme = {
  bg: "#0a0c10",
  panel: "#11141b",
  ink: "#f3f4f6",
  muted: "#8f9fa9",
  blue: "#d4c09d",
  blueDeep: "#c5a059",
  line: "rgba(255, 255, 255, 0.08)",
};

export function PageContainer({
  children,
  className = "",
  tone = "cream",
}: {
  children: ReactNode;
  className?: string;
  tone?: "cream" | "dark";
}) {
  return (
    <main
      className={`min-h-screen px-4 py-20 sm:px-6 md:px-10 lg:px-14 font-body-luxury bg-[#faf8f5] text-[#0b1a24] ${className}`}
    >
      <div className="mx-auto w-full max-w-[1280px]">{children}</div>
    </main>
  );
}

export function RouteTopbar({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
      <div className="min-w-0">{children}</div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Eyebrow({
  children,
  tone = "cream",
}: {
  children: ReactNode;
  tone?: "cream" | "dark";
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-3 font-mono-luxury ${tone === "cream" ? "text-[#576875]" : "text-[#8f9fa9]"
        }`}
    >
      <span
        className={`h-px w-8 shrink-0 sm:w-12 ${tone === "cream" ? "bg-[#0c3b46]" : "bg-[#d4c09d]"
          }`}
      />
      <span className="truncate">{children}</span>
    </div>
  );
}

export function Panel({
  children,
  className = "",
  tone = "cream",
}: {
  children: ReactNode;
  className?: string;
  tone?: "cream" | "dark";
}) {
  return (
    <div
      className={`panel-luxury p-5 sm:p-6 shadow-luxury-sm ${tone === "cream" ? "" : "dark"
        } ${className}`}
    >
      {children}
    </div>
  );
}

export function FormField({
  label,
  value,
  onChange,
  type = "text",
  required,
  min,
  minLength,
  tone = "cream",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  min?: number;
  minLength?: number;
  tone?: "cream" | "dark";
}) {
  return (
    <label className="block min-w-0">
      <span
        className={`block truncate font-mono-luxury ${tone === "cream" ? "text-[#576875]" : "text-[#8f9fa9]"
          }`}
      >
        {label}
      </span>
      <input
        type={type}
        required={required}
        min={min}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-2 input-luxury ${tone === "cream" ? "text-[#0b1a24]" : "dark text-[#f3f4f6]"
          }`}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  required,
  tone = "cream",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  tone?: "cream" | "dark";
}) {
  return (
    <label className="block min-w-0">
      <span
        className={`block truncate font-mono-luxury ${tone === "cream" ? "text-[#576875]" : "text-[#8f9fa9]"
          }`}
      >
        {label}
      </span>
      <textarea
        rows={5}
        required={required}
        minLength={required ? 10 : undefined}
        maxLength={4000}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-2 textarea-luxury ${tone === "cream" ? "text-[#0b1a24]" : "dark text-[#f3f4f6]"
          }`}
      />
    </label>
  );
}

export function PrimaryButton({
  children,
  disabled,
  tone = "cream",
  className = "",
}: {
  children: ReactNode;
  disabled?: boolean;
  tone?: "cream" | "dark";
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`btn-primary-luxury ${tone === "cream" ? "" : "dark"} ${className}`}
    >
      {children}
    </button>
  );
}
