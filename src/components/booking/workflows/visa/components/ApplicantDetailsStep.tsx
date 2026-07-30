import React from "react";
import { ArrowLeft, ArrowRight, Briefcase, Plus } from "lucide-react";
import type { IndividualApplicant } from "../VisaWorkflow";
import { ApplicantCard } from "../cards/ApplicantCard";

interface ApplicantDetailsStepProps {
  behalfOf: "self" | "family" | "corporate";
  coordinatorTitle: string;
  setCoordinatorTitle: (val: string) => void;
  companyName: string;
  setCompanyName: (val: string) => void;
  applicants: IndividualApplicant[];
  onAddApplicant: () => void;
  onRemoveApplicant: (id: string) => void;
  onUpdateApplicant: (id: string, fields: Partial<IndividualApplicant>) => void;
  onBack: () => void;
  onNext: () => void;
}

export function ApplicantDetailsStep({
  behalfOf,
  coordinatorTitle,
  setCoordinatorTitle,
  companyName,
  setCompanyName,
  applicants,
  onAddApplicant,
  onRemoveApplicant,
  onUpdateApplicant,
  onBack,
  onNext,
}: ApplicantDetailsStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="text-center sm:text-left space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-semibold uppercase tracking-widest">
          Step 2 of 6: Traveller Details
        </div>
        <h2 className="text-xl sm:text-3xl font-bold text-slate-900">Applicant & Passport Profiles</h2>
        <p className="text-slate-600 text-sm">Provide details for each traveling guest to verify visa eligibility.</p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-8 space-y-6 shadow-sm">
        {/* Corporate Mode Coordinator Bar */}
        {behalfOf === "corporate" && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-600" /> Corporate Delegation Coordinator Desk
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={coordinatorTitle}
                onChange={(e) => setCoordinatorTitle(e.target.value)}
                placeholder="Enter coordinator title (e.g. Travel Manager)"
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company / organization name"
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* Dynamic Applicant Cards List */}
        <div className="space-y-6">
          {applicants.map((app, index) => (
            <ApplicantCard
              key={app.id}
              applicant={app}
              index={index}
              totalCount={applicants.length}
              onUpdate={onUpdateApplicant}
              onRemove={onRemoveApplicant}
            />
          ))}
        </div>

        {/* Add Applicant Button */}
        {behalfOf !== "self" && (
          <button
            type="button"
            onClick={onAddApplicant}
            className="w-full py-3 rounded-xl border border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-500/5 text-slate-700 hover:text-amber-800 text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Another Traveller
          </button>
        )}

        {/* Navigation Action Bar */}
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
            View Visa Assessment
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
