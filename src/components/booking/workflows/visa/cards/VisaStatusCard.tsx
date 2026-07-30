import React from "react";
import { ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import type { VisaEvaluationResult } from "@/lib/visa/visaIntelligence";

interface VisaStatusCardProps {
  evaluation: VisaEvaluationResult;
}

export function VisaStatusCard({ evaluation }: VisaStatusCardProps) {
  const { requirementType, sla, destinationProfile } = evaluation;

  const getTypeLabel = () => {
    switch (requirementType) {
      case "visa_free":
        return "Visa-Free Destination (Arrival Advisory)";
      case "evisa":
        return "Official eVisa Clearance Available";
      case "sticker":
        return "Sticker Visa Required (Biometric Escort)";
      case "visa_on_arrival":
        return "Visa on Arrival Available";
      default:
        return "Diplomatic Processing";
    }
  };

  return (
    <div className="p-4.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          {getTypeLabel()}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-amber-900 font-medium">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Est. Processing: {sla.minBusinessDays}–{sla.maxBusinessDays} Business Days
        </div>
      </div>

      <div className="text-xs text-slate-700 flex items-center justify-between">
        <span>Region: <strong className="text-slate-900">{destinationProfile.region}</strong></span>
        <span>Biometrics Required: <strong className="text-amber-800">{destinationProfile.requiresBiometrics ? "Yes (VFS/TLS)" : "No"}</strong></span>
      </div>

      {sla.warningMessage && (
        <div className="flex items-start gap-2 pt-2.5 text-xs text-amber-900 border-t border-amber-500/20">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <span>{sla.warningMessage}</span>
        </div>
      )}
    </div>
  );
}
