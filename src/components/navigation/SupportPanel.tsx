import React, { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  PhoneCall,
  Mail,
  Headphones,
  Ticket,
  Globe,
  HeartHandshake,
  ShieldAlert,
  Coins,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { mono, display } from "@/components/home/theme";
import { SUPPORT_DEPARTMENTS, SupportDepartment } from "./supportData";

interface SupportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export function getDepartmentIcon(iconType: SupportDepartment["iconType"]) {
  switch (iconType) {
    case "ticketing":
      return Ticket;
    case "visa":
      return Globe;
    case "gro":
      return HeartHandshake;
    case "escalation":
      return ShieldAlert;
    case "finance":
      return Coins;
    default:
      return Headphones;
  }
}

export function DepartmentCard({
  dept,
  onActionClick,
  compact = false,
}: {
  dept: SupportDepartment;
  onActionClick?: () => void;
  compact?: boolean;
}) {
  const Icon = getDepartmentIcon(dept.iconType);
  const isEscalation = dept.id === "dept-4";

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
        isEscalation
          ? "bg-gradient-to-br from-amber-500/[0.04] via-white to-slate-50 border-amber-300/60 shadow-[0_4px_20px_rgba(245,158,11,0.06)]"
          : "bg-white border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:border-lime-500/50 hover:shadow-md"
      } ${compact ? "p-3.5 space-y-3" : "p-4 sm:p-5 space-y-4"}`}
    >
      {/* Department Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isEscalation
                ? "bg-amber-100 text-amber-900 border border-amber-300/60"
                : "bg-slate-100 text-slate-700 border border-slate-200"
            }`}
            style={mono}
          >
            <span>DEPARTMENT {dept.departmentNumber}</span>
          </span>

          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isEscalation
                ? "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                : "bg-lime-500/10 text-lime-700 border border-lime-500/20"
            }`}
          >
            <Icon size={14} />
          </div>
        </div>

        <div>
          <h3
            className="text-xs sm:text-[13px] font-bold text-slate-900 tracking-tight leading-snug"
            style={display}
          >
            {dept.title}
          </h3>
          <span className="text-[10.5px] font-medium text-slate-600 block mt-0.5">
            {dept.categoryBadge}
          </span>
        </div>
      </div>

      {/* Contact Entries: Phones & Emails */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        {/* Phone list */}
        {dept.phones.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9.5px] uppercase font-bold tracking-widest text-slate-500 block" style={mono}>
              {dept.phones.length > 1 ? "Telephone Lines" : "Telephone Line"}
            </span>
            <div className="space-y-1.5">
              {dept.phones.map((phone, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-1.5 sm:p-2 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <PhoneCall size={12} className="text-lime-700 shrink-0" />
                    <span className="font-mono text-[11px] sm:text-xs font-semibold text-slate-900 truncate">
                      {phone.display}
                    </span>
                  </div>
                  <a
                    href={phone.tel}
                    onClick={onActionClick}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 text-[11px] font-bold transition-all shrink-0 active:scale-95 shadow-sm border border-lime-300"
                    style={mono}
                    aria-label={`Call ${phone.display} (${dept.title})`}
                  >
                    <span>Call</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email list */}
        {dept.emails.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9.5px] uppercase font-bold tracking-widest text-slate-500 block" style={mono}>
              {dept.emails.length > 1 ? "Email Desks" : "Email Desk"}
            </span>
            <div className="space-y-1.5">
              {dept.emails.map((email, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-1.5 sm:p-2 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Mail size={12} className="text-slate-600 shrink-0" />
                    <span className="font-mono text-[10.5px] sm:text-[11px] font-medium text-slate-800 truncate" title={email.display}>
                      {email.display}
                    </span>
                  </div>
                  <a
                    href={email.email}
                    onClick={onActionClick}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-all shrink-0 active:scale-95 shadow-sm"
                    style={mono}
                    aria-label={`Email ${email.display} (${dept.title})`}
                  >
                    <span>Email</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SupportPanel({
  isOpen,
  onClose,
  className = "",
  triggerRef,
}: SupportPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        triggerRef?.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, triggerRef]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        (!triggerRef?.current || !triggerRef.current.contains(target))
      ) {
        onClose();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, onClose, triggerRef]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Shafsky Support Directory"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={`apple-glass-dropdown rounded-3xl p-4 sm:p-6 lg:p-7 text-slate-900 border border-slate-200/90 shadow-[0_25px_60px_-12px_rgba(15,23,42,0.22)] bg-[#FAF9F5]/98 backdrop-blur-2xl max-h-[calc(100vh-90px)] overflow-y-auto ${className}`}
        >
          {/* Panel Top Header Bar */}
          <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-200">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-100 text-lime-900 text-[10.5px] font-mono font-bold tracking-wider uppercase border border-lime-300">
                <Sparkles size={12} className="text-lime-700" />
                <span>Shafsky Aviation Support Directory</span>
              </div>
              <h2
                className="text-lg sm:text-xl lg:text-2xl font-black text-slate-950 tracking-tight"
                style={display}
              >
                Departmental Contact Directory
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed">
                Connect directly with our 5 specialized aviation operations, ticketing, guest care, escalation, and finance desks.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="apple-glass-pill p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-200/80 transition-all cursor-pointer shrink-0 active:scale-95"
              aria-label="Close Support Directory"
              title="Close Support Directory (Esc)"
            >
              <X size={18} />
            </button>
          </div>

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 pt-5">
            {/* Dept 1 */}
            <DepartmentCard dept={SUPPORT_DEPARTMENTS[0]} onActionClick={onClose} />
            {/* Dept 2 */}
            <DepartmentCard dept={SUPPORT_DEPARTMENTS[1]} onActionClick={onClose} />
            {/* Dept 3 */}
            <DepartmentCard dept={SUPPORT_DEPARTMENTS[2]} onActionClick={onClose} />
            {/* Dept 4: Escalation (Spans 2 columns on lg screens for balanced symmetry) */}
            <div className="lg:col-span-2">
              <DepartmentCard dept={SUPPORT_DEPARTMENTS[3]} onActionClick={onClose} />
            </div>
            {/* Dept 5 */}
            <DepartmentCard dept={SUPPORT_DEPARTMENTS[4]} onActionClick={onClose} />
          </div>

          {/* Panel Footer Bar */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-600" />
              </span>
              <span className="font-mono text-[11px] text-slate-700">
                24/7 Operations Desk • Real-time Ground &amp; Airside Dispatch
              </span>
            </div>

            <Link
              to="/contact"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 font-bold text-slate-900 hover:text-[#0a196f] transition-colors py-1 px-3 rounded-full hover:bg-slate-100"
              style={mono}
            >
              <span>Visit Full Contact &amp; Inquiry Page</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Mobile Drawer Support Section (Accordion or Collapsible List)
 * Displays all 5 departments cleanly inside the mobile navigation menu.
 */
export function SupportMobileAccordion({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="space-y-3 pt-2">
      <div className="space-y-3">
        {SUPPORT_DEPARTMENTS.map((dept) => (
          <DepartmentCard
            key={dept.id}
            dept={dept}
            onActionClick={onClose}
            compact={true}
          />
        ))}
      </div>

      <div className="pt-2">
        <Link
          to="/contact"
          onClick={onClose}
          className="apple-glass-pill w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-slate-900 tracking-wider transition-colors"
          style={mono}
        >
          <span>Open Full Contact Form</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
