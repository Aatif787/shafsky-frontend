import React from "react";
import { ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import type { VisaEvaluationResult } from "@/lib/visa/visaIntelligence";

interface VisaAssessmentStepProps {
  destinationCountry: string;
  passportCountry: string;
  evaluation: VisaEvaluationResult;
  onBack: () => void;
  onNext: () => void;
}

export function VisaAssessmentStep({
  destinationCountry,
  passportCountry,
  evaluation,
  onBack,
  onNext,
}: VisaAssessmentStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="text-center sm:text-left space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-semibold uppercase tracking-widest">
          Step 3 of 6: Automated Intelligence Assessment
        </div>
        <h2 className="text-xl sm:text-3xl font-bold text-slate-900">Consular Category & Clearance Assessment</h2>
        <p className="text-slate-600 text-sm">Derived automatically based on your destination and passport credentials.</p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-8 space-y-6 shadow-sm">
        {/* Derived Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold uppercase text-slate-500">Destination</span>
            <div className="text-sm font-bold text-slate-900">{destinationCountry || "Not Specified"}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold uppercase text-slate-500">Passport Used</span>
            <div className="text-sm font-bold text-slate-900">{passportCountry || "Not Specified"}</div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
            <span className="text-[11px] font-bold uppercase text-amber-800">Derived Visa Category</span>
            <div className="text-sm font-bold text-amber-900">{evaluation.derivedCategory.toUpperCase()}</div>
          </div>
        </div>

        {/* Detailed Assessment Card */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            Clearance Profile: {evaluation.requirementType.toUpperCase()}
          </div>

          <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
            <p>
              Based on your <strong>{passportCountry}</strong> passport traveling to <strong>{destinationCountry}</strong>, our intelligence layer has derived the exact consular requirements.
            </p>
            <div className="flex items-center gap-2 text-emerald-700 pt-1 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Assigned SLA Window: {evaluation.sla.minBusinessDays} to {evaluation.sla.maxBusinessDays} Business Days.</span>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-all flex items-center gap-2 shadow-md shadow-amber-500/20"
          >
            View Required Documents
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
