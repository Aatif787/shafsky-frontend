import React, { useState } from "react";
import { Check, Info, HelpCircle } from "lucide-react";
import type { DocumentRequirement, DocumentStatus } from "@/lib/visa/types";

interface DocumentCardProps {
  doc: DocumentRequirement;
}

export function DocumentCard({ doc }: DocumentCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case "required":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">Required</span>;
      case "already_available":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Auto-Sourced</span>;
      case "recommended":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/10 border border-sky-500/30 text-sky-400">Recommended</span>;
      case "optional":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 border border-slate-700 text-slate-400">Optional</span>;
      case "pending":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-400">Pending Setup</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400">Info Only</span>;
    }
  };

  return (
    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all space-y-2.5 relative">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-xs font-bold text-white leading-snug">{doc.name}</h4>
        {getStatusBadge(doc.status)}
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">{doc.description}</p>

      <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
        <span className="text-slate-500 italic line-clamp-1">{doc.whyRequired}</span>

        {doc.tooltipInfo && (
          <button
            type="button"
            onClick={() => setShowTooltip(!showTooltip)}
            className="text-amber-400/80 hover:text-amber-300 flex items-center gap-1 shrink-0 ml-2"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="underline">Guidance</span>
          </button>
        )}
      </div>

      {showTooltip && doc.tooltipInfo && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mt-2 animate-in fade-in duration-200 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="flex-1">{doc.tooltipInfo}</div>
        </div>
      )}
    </div>
  );
}
