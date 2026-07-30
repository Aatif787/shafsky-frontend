import React from "react";
import { ArrowLeft, ArrowRight, FileText, ShieldCheck } from "lucide-react";
import type { DocumentRequirement } from "@/lib/visa/types";
import { DocumentCard } from "../cards/DocumentCard";

interface RequiredDocumentsStepProps {
  documents: DocumentRequirement[];
  onBack: () => void;
  onNext: () => void;
}

export function RequiredDocumentsStep({
  documents,
  onBack,
  onNext,
}: RequiredDocumentsStepProps) {
  const groupedDocuments = documents.reduce((acc, doc) => {
    const key = doc.category || "supporting";
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {} as Record<string, DocumentRequirement[]>);

  const categoryLabels: Record<string, string> = {
    identity: "Identity & Passport Proof",
    travel: "Flight & Travel Itinerary",
    financial: "Financial Solvency Proof",
    employment: "Employment & Sponsorship",
    invitation: "Host Business Invitation",
    accommodation: "Hotel & Stay Proof",
    insurance: "Travel Health Insurance",
    supporting: "Supporting Documentation",
  };

  const totalDocs = documents.length;
  const sourcedDocs = documents.filter((d) => d.status === "already_available").length;
  const pendingDocs = totalDocs - sourcedDocs;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="text-center sm:text-left space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-semibold uppercase tracking-widest">
          Step 4 of 6: Consular Document Guidance
        </div>
        <h2 className="text-xl sm:text-3xl font-bold text-slate-900">Required Documents Guidance</h2>
        <p className="text-slate-600 text-sm">Review required documentation. Our specialists handle collection after request staging.</p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-8 space-y-6 shadow-sm">
        {/* Progress Header */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-800 font-bold uppercase tracking-wider">
              <FileText className="w-4 h-4 text-amber-600" />
              Document Preparation Overview
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <span>Total Required: <strong className="text-slate-900">{totalDocs}</strong></span>
              <span className="text-emerald-700 font-semibold">Auto-Sourced: <strong>{sourcedDocs}</strong></span>
              <span className="text-amber-800 font-semibold">Pending Checklist: <strong>{pendingDocs}</strong></span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${Math.round((sourcedDocs / totalDocs) * 100)}%` }}
            />
          </div>
        </div>

        {/* Grouped Document Cards */}
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([categoryKey, docs]) => (
            <div key={categoryKey} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">
                {categoryLabels[categoryKey] || categoryKey.toUpperCase()}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {docs.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Concierge Guidance Banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-700">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            No uploads required now. After submitting your request, our visa specialist will review your file and assist with document preparation or doorstep pickup.
          </span>
        </div>

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
            Continue to Lead Contact
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
