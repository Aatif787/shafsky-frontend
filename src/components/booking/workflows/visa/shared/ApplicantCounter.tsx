import React from "react";
import { Plus, Minus } from "lucide-react";

interface ApplicantCounterProps {
  label: string;
  sublabel?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
}

export function ApplicantCounter({
  label,
  sublabel,
  value,
  min = 0,
  max = 10,
  onChange,
}: ApplicantCounterProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
      <div>
        <div className="text-xs font-semibold text-white">{label}</div>
        {sublabel && <div className="text-[11px] text-slate-400">{sublabel}</div>}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <span className="w-6 text-center text-sm font-bold text-amber-400">{value}</span>

        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
