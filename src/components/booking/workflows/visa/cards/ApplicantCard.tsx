import React from "react";
import { Trash2 } from "lucide-react";
import type { IndividualApplicant } from "../VisaWorkflow";
import { CountrySelector } from "../shared/CountrySelector";

interface ApplicantCardProps {
  applicant: IndividualApplicant;
  index: number;
  totalCount: number;
  onUpdate: (id: string, fields: Partial<IndividualApplicant>) => void;
  onRemove: (id: string) => void;
}

export function ApplicantCard({
  applicant,
  index,
  totalCount,
  onUpdate,
  onRemove,
}: ApplicantCardProps) {
  return (
    <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
          Traveller #{index + 1}
        </span>
        {totalCount > 1 && (
          <button
            type="button"
            onClick={() => onRemove(applicant.id)}
            className="text-slate-500 hover:text-rose-600 text-xs flex items-center gap-1 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase text-slate-700 mb-1">First Name *</label>
          <input
            type="text"
            value={applicant.firstName}
            onChange={(e) => onUpdate(applicant.id, { firstName: e.target.value })}
            placeholder="Enter traveller first name"
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase text-slate-700 mb-1">Last Name *</label>
          <input
            type="text"
            value={applicant.lastName}
            onChange={(e) => onUpdate(applicant.id, { lastName: e.target.value })}
            placeholder="Enter traveller last name"
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase text-slate-700 mb-1">Date of Birth</label>
          <input
            type="date"
            value={applicant.dob}
            onChange={(e) => onUpdate(applicant.id, { dob: e.target.value })}
            placeholder="Select date of birth"
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-sans"
          />
        </div>

        <div>
          <CountrySelector
            label="Nationality"
            value={applicant.nationality}
            placeholder="Search nationality"
            onChange={(countryName) => onUpdate(applicant.id, { nationality: countryName })}
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase text-slate-700 mb-1">Passport Number</label>
          <input
            type="text"
            value={applicant.passportNumber}
            onChange={(e) => onUpdate(applicant.id, { passportNumber: e.target.value })}
            placeholder="Enter passport number"
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase text-slate-700 mb-1">Passport Expiry Date</label>
          <input
            type="date"
            value={applicant.passportExpiry}
            onChange={(e) => onUpdate(applicant.id, { passportExpiry: e.target.value })}
            placeholder="Select passport expiry date"
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-sans"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-5 pt-2 text-xs">
        <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
          <input
            type="checkbox"
            checked={applicant.hasPreviousVisa}
            onChange={(e) => onUpdate(applicant.id, { hasPreviousVisa: e.target.checked })}
            className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          Holds previous visa for destination
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
          <input
            type="checkbox"
            checked={applicant.hasPreviousRefusal}
            onChange={(e) => onUpdate(applicant.id, { hasPreviousRefusal: e.target.checked })}
            className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          Prior visa refusal history
        </label>
      </div>
    </div>
  );
}
