import React from "react";
import { ChevronDown, Plus, Minus, Check } from "lucide-react";

export const INPUT_CLASSES =
  "w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium placeholder-slate-400 outline-none transition-all duration-200 hover:border-lime-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-xs";

export const SELECT_CLASSES =
  "w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium outline-none transition-all duration-200 hover:border-lime-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 appearance-none cursor-pointer shadow-xs";

export const TEXTAREA_CLASSES =
  "w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium placeholder-slate-400 outline-none transition-all duration-200 hover:border-lime-400 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-xs resize-y min-h-[90px]";

export function FieldLabel({
  children,
  required,
  optional,
}: {
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 font-mono">
      {children}
      {required && <span className="text-lime-600 ml-1 font-bold">*</span>}
      {optional && <span className="text-slate-400 text-[10px] lowercase ml-1.5 font-normal">(optional)</span>}
    </label>
  );
}

export function CounterField({
  label,
  value,
  onChange,
  min = 0,
  max = 50,
  sublabel,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  sublabel?: string;
}) {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-lime-400 transition-colors shadow-xs">
      <div>
        <div className="text-xs font-bold text-slate-900">{label}</div>
        {sublabel && <div className="text-[11px] text-slate-500 mt-0.5">{sublabel}</div>}
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-lime-50 hover:border-lime-400 hover:text-lime-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer shadow-xs"
        >
          <Minus size={13} />
        </button>
        <span className="w-6 text-center font-mono font-bold text-sm text-slate-900">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-lime-50 hover:border-lime-400 hover:text-lime-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer shadow-xs"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

export function OptionPill<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { id: T; label: string; description?: string }[];
  selected: T;
  onSelect: (id: T) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
      {options.map((opt) => {
        const isSelected = selected === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={`flex flex-col text-left p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer shadow-xs ${
              isSelected
                ? "bg-slate-950 border-[#d4af37] text-white shadow-md shadow-slate-950/10"
                : "bg-white border-slate-200 hover:border-amber-400/80 hover:bg-amber-50/20 text-slate-800"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs sm:text-sm font-bold tracking-tight">{opt.label}</span>
              {isSelected ? (
                <span className="w-4 h-4 rounded-full bg-[#d4af37] text-slate-950 flex items-center justify-center shrink-0 ml-2">
                  <Check size={11} strokeWidth={3} />
                </span>
              ) : (
                <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0 ml-2" />
              )}
            </div>
            {opt.description && (
              <p
                className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                  isSelected ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {opt.description}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
