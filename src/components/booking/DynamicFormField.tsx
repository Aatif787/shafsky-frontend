import React from "react";
import { type FieldConfig } from "@/data/bookingConfigurations";
import { AIRPORTS } from "@/data/airports";
import { Plus, Minus, Check } from "lucide-react";

interface DynamicFormFieldProps {
  field: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function DynamicFormField({ field, value, onChange, error }: DynamicFormFieldProps) {
  const { id, label, type, placeholder, required, options, helpText } = field;

  // 1. TEXT INPUT
  if (type === "text") {
    return (
      <div>
        <label htmlFor={id} className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          id={id}
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3.5 rounded-2xl bg-white border text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
            error ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-[#7c3aed]"
          }`}
        />
        {helpText && <p className="mt-1 text-[11px] text-slate-500">{helpText}</p>}
        {error && <p className="mt-1 text-[11px] text-red-500 font-mono">{error}</p>}
      </div>
    );
  }

  // 2. DATE PICKER
  if (type === "date") {
    return (
      <div>
        <label htmlFor={id} className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          id={id}
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-3.5 rounded-2xl bg-white border text-sm text-slate-900 focus:outline-none transition-all font-mono ${
            error ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-[#7c3aed]"
          }`}
        />
        {error && <p className="mt-1 text-[11px] text-red-500 font-mono">{error}</p>}
      </div>
    );
  }

  // 3. TIME PICKER
  if (type === "time") {
    return (
      <div>
        <label htmlFor={id} className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          id={id}
          type="time"
          value={value || "14:30"}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-3.5 rounded-2xl bg-white border text-sm text-slate-900 focus:outline-none transition-all font-mono ${
            error ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-[#7c3aed]"
          }`}
        />
        {error && <p className="mt-1 text-[11px] text-red-500 font-mono">{error}</p>}
      </div>
    );
  }

  // 4. AIRPORT SELECTOR
  if (type === "airport_select") {
    return (
      <div>
        <label htmlFor={id} className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id={id}
          value={value || "DEL"}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-3.5 rounded-2xl bg-white border text-sm text-slate-900 focus:outline-none transition-all ${
            error ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-[#7c3aed]"
          }`}
        >
          {Object.values(AIRPORTS).map((a) => (
            <option key={a.code} value={a.code}>
              {a.code} — {a.city} ({a.airport.name || a.country})
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-[11px] text-red-500 font-mono">{error}</p>}
      </div>
    );
  }

  // 5. COUNTRY SELECTOR
  if (type === "country_select") {
    const popularCountries = [
      "United Arab Emirates",
      "United Kingdom",
      "United States",
      "India",
      "Singapore",
      "France",
      "Germany",
      "Japan",
      "Switzerland",
    ];
    return (
      <div>
        <label htmlFor={id} className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id={id}
          value={value || "United Arab Emirates"}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#7c3aed]"
        >
          {popularCountries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // 6. PASSENGER COUNTER
  if (type === "passenger_counter") {
    const count = Number(value) || 1;
    return (
      <div>
        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200">
          <span className="text-sm font-medium text-slate-900 font-sans">Total Passengers / Guests</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChange(Math.max(1, count - 1))}
              className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-200"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center font-mono font-bold text-slate-900 text-base">{count}</span>
            <button
              type="button"
              onClick={() => onChange(count + 1)}
              className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-200"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 7. TEXTAREA
  if (type === "textarea") {
    return (
      <div className="col-span-full">
        <label htmlFor={id} className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          id={id}
          rows={3}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#7c3aed]"
        />
      </div>
    );
  }

  // 8. SELECT DROPDOWN
  if (type === "select" && options) {
    return (
      <div>
        <label htmlFor={id} className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id={id}
          value={value || (options[0] ? options[0].value : "")}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#7c3aed]"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // 9. PHONE INPUT
  if (type === "phone_input") {
    return (
      <div>
        <label htmlFor={id} className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex gap-2">
          <select className="px-3 py-3.5 rounded-2xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none">
            <option value="+91">🇮🇳 +91</option>
            <option value="+971">🇦🇪 +971</option>
            <option value="+1">🇺🇸 +1</option>
            <option value="+44">🇬🇧 +44</option>
            <option value="+65">🇸🇬 +65</option>
          </select>
          <input
            id={id}
            type="tel"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "98765 43210"}
            className="flex-1 px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#7c3aed]"
          />
        </div>
      </div>
    );
  }

  return null;
}
