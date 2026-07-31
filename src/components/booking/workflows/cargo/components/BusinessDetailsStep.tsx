import React from "react";
import { Building2, User, FileText, ArrowRight, ArrowLeft, Check } from "lucide-react";

export interface BusinessDetailsStepProps {
  entityType: "Individual" | "Company" | "Importer" | "Exporter" | "Freight Forwarder";
  setEntityType: (val: "Individual" | "Company" | "Importer" | "Exporter" | "Freight Forwarder") => void;
  companyName: string;
  setCompanyName: (val: string) => void;
  gstVatNumber: string;
  setGstVatNumber: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const ENTITY_TYPES: Array<"Individual" | "Company" | "Importer" | "Exporter" | "Freight Forwarder"> = [
  "Individual",
  "Company",
  "Importer",
  "Exporter",
  "Freight Forwarder",
];

export function BusinessDetailsStep({
  entityType,
  setEntityType,
  companyName,
  setCompanyName,
  gstVatNumber,
  setGstVatNumber,
  onNext,
  onBack,
}: BusinessDetailsStepProps) {
  return (
    <div className="space-y-8">
      {/* Conversational Header */}
      <div className="border-b border-slate-100 pb-5">
        <span className="text-[10px] font-mono text-purple-800 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-purple-50 border border-purple-200">
          Step 4 · Entity & Compliance
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
          Business & Shipper Identification
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
          Identify your shipping profile for commercial invoicing, customs clearance, and corporate routing.
        </p>
      </div>

      {/* Entity Type Chips */}
      <div>
        <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-2.5">
          Select Entity Role *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {ENTITY_TYPES.map((type) => {
            const isSelected = entityType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setEntityType(type)}
                className={`p-3.5 rounded-2xl border text-center font-mono text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 text-amber-950 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-2xs"
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Company Name & GST/VAT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            Company / Organization Name {entityType !== "Individual" ? "*" : "(Optional)"}
          </label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={entityType === "Individual" ? "e.g. Private Residence or Personal" : "e.g. Acme Logistics Pvt Ltd"}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-500 shadow-xs font-sans font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            GST / VAT Registration Number (Optional)
          </label>
          <div className="relative">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={gstVatNumber}
              onChange={(e) => setGstVatNumber(e.target.value)}
              placeholder="e.g. 07AAAAA0000A1Z5 / GB123456789"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-500 shadow-xs font-sans font-medium"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all cursor-pointer"
        >
          <span>Continue to Lead Contact</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
