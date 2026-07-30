import React from "react";
import { TrustStats } from "./TrustStats";
import { QualityStandards } from "./QualityStandards";
import { CustomerConfidence } from "./CustomerConfidence";
import { ProcessTransparency } from "./ProcessTransparency";
import { SafetyReliability } from "./SafetyReliability";
import { GlobalPresenceMap } from "./GlobalPresenceMap";

interface TrustMasterSectionProps {
  showStats?: boolean;
  showQuality?: boolean;
  showReviews?: boolean;
  showProcess?: boolean;
  showSafety?: boolean;
  showMap?: boolean;
  className?: string;
}

export function TrustMasterSection({
  showStats = true,
  showQuality = true,
  showReviews = false, // Permanently disabled testimonials
  showProcess = true,
  showSafety = true,
  showMap = true,
  className = "",
}: TrustMasterSectionProps) {
  return (
    <div className={`space-y-16 ${className}`}>
      {showStats && <TrustStats />}
      {showQuality && <QualityStandards />}
      {showProcess && <ProcessTransparency />}
      {showSafety && <SafetyReliability />}
      {/* Testimonials section permanently unmounted */}
      {showMap && <GlobalPresenceMap />}
    </div>
  );
}

export {
  TrustStats,
  QualityStandards,
  CustomerConfidence,
  ProcessTransparency,
  SafetyReliability,
  GlobalPresenceMap,
};
