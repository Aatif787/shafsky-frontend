import type { DocumentRequirement, TravelPurpose, VisaRequirementType } from "../types";

/**
 * Pure generator of dynamic frontend document requirements.
 * Returns structured arrays for UI display. Does NOT handle files, uploads, or OCR.
 */

/**
 * Generates dynamic document checklist based on travel purpose, visa type, and applicant mode.
 */
export function generateDocumentChecklist(
  purpose: TravelPurpose,
  visaType: VisaRequirementType,
  isCorporate: boolean = false
): DocumentRequirement[] {
  const documents: DocumentRequirement[] = [
    {
      id: "doc_passport",
      name: "Original Passport",
      description: "Minimum 6 months validity remaining with at least 2 blank pages.",
      category: "identity",
      isRequired: true,
    },
    {
      id: "doc_photo",
      name: "Passport Photographs",
      description: "Recent color photograph with light background meeting embassy dimensions.",
      category: "identity",
      isRequired: true,
    },
  ];

  if (visaType === "visa_free") {
    return [
      {
        id: "doc_passport_free",
        name: "Valid Passport",
        description: "Valid passport required for entry checkpoint.",
        category: "identity",
        isRequired: true,
      },
    ];
  }

  // Purpose-specific additions
  if (purpose === "business" || isCorporate) {
    documents.push(
      {
        id: "doc_invitation_letter",
        name: "Host Business Invitation Letter",
        description: "Official invitation from host company stating purpose and duration of visit.",
        category: "supporting",
        isRequired: true,
      },
      {
        id: "doc_company_cover_letter",
        name: "Employer Guarantee Letter",
        description: "Covering letter on company letterhead confirming employment and trip funding.",
        category: "supporting",
        isRequired: true,
      }
    );
  }

  if (purpose === "tourism" || purpose === "family_visit") {
    documents.push(
      {
        id: "doc_bank_statement",
        name: "Bank Statements",
        description: "Last 3 to 6 months bank statement stamped by bank branch.",
        category: "financial",
        isRequired: true,
      },
      {
        id: "doc_hotel_flight",
        name: "Flight & Accommodation Proof",
        description: "Confirmed return flight itinerary and hotel vouchers.",
        category: "travel",
        isRequired: true,
      }
    );
  }

  if (purpose === "student") {
    documents.push({
      id: "doc_admission_letter",
      name: "University Admission Offer",
      description: "Official letter of acceptance from accredited educational institution.",
      category: "supporting",
      isRequired: true,
    });
  }

  if (purpose === "medical") {
    documents.push({
      id: "doc_hospital_referral",
      name: "Hospital Referral & Appointment",
      description: "Medical referral letter and appointment confirmation from treating hospital.",
      category: "supporting",
      isRequired: true,
    });
  }

  // Insurance requirement for sticker visas
  if (visaType === "sticker") {
    documents.push({
      id: "doc_travel_insurance",
      name: "Travel Medical Insurance",
      description: "Comprehensive medical cover policy valid for entire duration of stay.",
      category: "financial",
      isRequired: true,
    });
  }

  return documents;
}
