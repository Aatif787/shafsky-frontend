/**
 * Centralized TypeScript definitions for the Visa Assistance Frontend Intelligence Layer.
 * All types are pure, decoupled from React/UI, and client-side safe.
 */

export type VisaRequirementType =
  | "evisa"
  | "sticker"
  | "visa_free"
  | "visa_on_arrival"
  | "unknown";

export type TravelPurpose =
  | "tourism"
  | "business"
  | "family_visit"
  | "student"
  | "medical"
  | "transit"
  | "diplomatic";

export type UrgencyLevel =
  | "normal"
  | "priority"
  | "urgent_express"
  | "critical_timeline";

export type ApplicantType =
  | "individual"
  | "family"
  | "corporate_delegation";

export interface PassportStatus {
  isValid: boolean;
  monthsUntilExpiry: number;
  isExpiringSoon: boolean;
  requiresRenewal: boolean;
  warningMessage?: string;
}

export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  category: "identity" | "financial" | "travel" | "supporting";
  isRequired: boolean;
}

export interface VisaProcessingSLA {
  level: UrgencyLevel;
  minBusinessDays: number;
  maxBusinessDays: number;
  estimatedDeliveryDate: string;
  isExtremeUrgent: boolean;
  warningMessage?: string;
}

export interface DestinationProfile {
  region: string;
  requiresBiometrics: boolean;
  supportsEVisa: boolean;
  defaultProcessingDays: number;
}

export interface VisaEvaluationContext {
  passportCountry: string;
  destinationCountry: string;
  travelPurpose: TravelPurpose;
  travelDate: string;
  passportExpiryDate?: string;
  applicantType?: ApplicantType;
  previousRefusal?: boolean;
}

export interface VisaEvaluationResult {
  requirementType: VisaRequirementType;
  derivedCategory: string;
  isVisaRequired: boolean;
  shouldSkipWorkflow: boolean;
  passportStatus: PassportStatus;
  documents: DocumentRequirement[];
  sla: VisaProcessingSLA;
  destinationProfile: DestinationProfile;
}
