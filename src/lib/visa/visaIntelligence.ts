import type {
  VisaEvaluationContext,
  VisaEvaluationResult,
} from "./types";

import { evaluatePassportStatus } from "./rules/passportRules";
import { determineDestinationType } from "./rules/countryRules";
import {
  deriveVisaCategory,
  determineVisaRequirementType,
  isVisaRequiredForRoute,
  shouldSkipVisaWorkflow,
} from "./rules/visaRules";
import { generateDocumentChecklist } from "./rules/documentRules";
import { evaluateProcessingSLA } from "./rules/slaRules";

/**
 * Public Orchestrator for the Visa Assistance Frontend Intelligence Layer.
 * Combines logic from all modular rule files.
 * Pure, deterministic, stateless, and safe for client-side evaluation.
 */

export function evaluateVisaRequest(context: VisaEvaluationContext): VisaEvaluationResult {
  const {
    passportCountry,
    destinationCountry,
    travelPurpose,
    travelDate,
    passportExpiryDate,
    applicantType = "individual",
  } = context;

  const requirementType = determineVisaRequirementType(passportCountry, destinationCountry);
  const derivedCategory = deriveVisaCategory(travelPurpose);
  const isVisaRequired = isVisaRequiredForRoute(passportCountry, destinationCountry);
  const shouldSkipWorkflow = shouldSkipVisaWorkflow(passportCountry, destinationCountry);

  const passportStatus = evaluatePassportStatus(passportExpiryDate, travelDate);
  const destinationProfile = determineDestinationType(destinationCountry);

  const isCorporate = applicantType === "corporate_delegation";
  const documents = generateDocumentChecklist(travelPurpose, requirementType, isCorporate);
  const sla = evaluateProcessingSLA(travelDate, destinationCountry);

  return {
    requirementType,
    derivedCategory,
    isVisaRequired,
    shouldSkipWorkflow,
    passportStatus,
    documents,
    sla,
    destinationProfile,
  };
}

// Export all underlying modular rules for granular usage
export * from "./types";
export * from "./rules/passportRules";
export * from "./rules/countryRules";
export * from "./rules/visaRules";
export * from "./rules/documentRules";
export * from "./rules/slaRules";
