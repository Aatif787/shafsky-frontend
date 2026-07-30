import React from "react";
import { ArrowLeft, Users } from "lucide-react";
import { ReviewSummary } from "@/components/booking/shared/ReviewSummary";
import type { VisaEvaluationResult } from "@/lib/visa/visaIntelligence";
import type { IndividualApplicant } from "../VisaWorkflow";

interface ReviewStepProps {
  destinationCountry: string;
  passportCountry: string;
  residenceCountry: string;
  behalfOf: "self" | "family" | "corporate";
  travelPurpose: string;
  departDate: string;
  applicants: IndividualApplicant[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  companyName: string;
  evaluation: VisaEvaluationResult;
  isSubmitting: boolean;
  onBack: () => void;
  onEdit: () => void;
  onSubmit: () => void;
}

export function ReviewStep({
  destinationCountry,
  passportCountry,
  residenceCountry,
  behalfOf,
  travelPurpose,
  departDate,
  applicants,
  contactName,
  contactEmail,
  contactPhone,
  companyName,
  evaluation,
  isSubmitting,
  onBack,
  onEdit,
  onSubmit,
}: ReviewStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="text-center sm:text-left space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-semibold uppercase tracking-widest">
          Step 5 of 6: Final Review
        </div>
        <h2 className="text-xl sm:text-3xl font-bold text-slate-900">Review & Confirm Visa Application</h2>
        <p className="text-slate-600 text-sm">Verify all details before submitting to our visa operations desk.</p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-8 space-y-6 shadow-sm">
        {/* Structured Applicants List Breakdown */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" /> Applicants Breakdown ({applicants.length})
          </h3>
          <div className="space-y-2">
            {applicants.map((a, i) => (
              <div key={a.id} className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="font-semibold text-slate-900">
                  {i + 1}. {a.firstName || "Applicant"} {a.lastName} ({a.nationality || passportCountry || "Unspecified"})
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <span>Passport: {a.passportNumber || "Provided Later"}</span>
                  {a.hasPreviousVisa && <span className="text-emerald-700 font-semibold">Prior Visa Held</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reused Shared ReviewSummary Component */}
        <ReviewSummary
          serviceTitle="Visa Assistance Request"
          badgeLabel="SLA Category"
          badgeValue={evaluation.requirementType.toUpperCase()}
          items={[
            { label: "Destination Country", value: destinationCountry || "Not Specified" },
            { label: "Passport Country", value: passportCountry || "Not Specified" },
            { label: "Country of Residence", value: residenceCountry || "Not Specified" },
            { label: "Booking Mode", value: behalfOf.toUpperCase() },
            { label: "Travel Purpose", value: travelPurpose ? travelPurpose.toUpperCase() : "Not Specified" },
            { label: "Intended Travel Date", value: departDate || "Tentative Month" },
            { label: "Total Applicants", value: `${applicants.length} Traveller(s)` },
            { label: "Primary Contact", value: contactName },
            { label: "Contact Email", value: contactEmail },
            { label: "Contact Phone", value: contactPhone },
            { label: "Company / Organization", value: companyName || "N/A" },
            { label: "Estimated SLA", value: `${evaluation.sla.minBusinessDays}–${evaluation.sla.maxBusinessDays} Business Days` },
          ]}
          totalPrice={8500 * applicants.length}
          submitLabel="Submit VIP Visa Application"
          busy={isSubmitting}
          onEdit={onEdit}
          onSubmit={onSubmit}
        />

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>
    </div>
  );
}
