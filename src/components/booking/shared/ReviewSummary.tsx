import React from "react";
import { Check } from "lucide-react";

interface ReviewSummaryProps {
  serviceTitle: string;
  badgeLabel: string;
  badgeValue: string;
  items: { label: string; value: string }[];
  totalPrice?: number;
  currencySymbol?: string;
  submitLabel: string;
  busy: boolean;
  onEdit: () => void;
  onSubmit: () => void;
}

export function ReviewSummary({
  serviceTitle,
  badgeLabel,
  badgeValue,
  items,
  totalPrice,
  currencySymbol = "₹",
  submitLabel,
  busy,
  onEdit,
  onSubmit,
}: ReviewSummaryProps) {
  const isIntlSymbol = currencySymbol === "$" || currencySymbol === "£" || currencySymbol === "€";
  const showPrice = typeof totalPrice === "number" && Number.isFinite(totalPrice);
  const formattedPrice = showPrice ? totalPrice.toLocaleString(isIntlSymbol ? "en-US" : "en-IN") : "";

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-bold">Selected Service</span>
          <div className="text-xl font-serif font-bold text-slate-900">{serviceTitle}</div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">{badgeLabel}</span>
          <div className="text-sm font-mono font-bold text-emerald-700">{badgeValue}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        {items.map((item, idx) => (
          <div key={idx}>
            <span className="text-slate-500 font-medium">{item.label}</span>
            <div className="text-slate-900 font-bold">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="pt-5 border-t border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-slate-500 font-bold uppercase">
            {showPrice ? "Total Estimate" : "Pricing"}
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700">
            {showPrice ? `${currencySymbol}${formattedPrice}` : "On request"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={busy}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all cursor-pointer"
          >
            <span>{busy ? "Processing..." : submitLabel}</span>
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
