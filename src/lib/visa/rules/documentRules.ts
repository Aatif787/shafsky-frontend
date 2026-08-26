import type { DocumentRequirement, TravelPurpose, VisaRequirementType } from "../types";

/**
 * Pure generator of dynamic frontend document requirements for presentation in Phase 4.
 * Returns structured arrays for UI display with status badges, why required notes, and tooltips.
 * Does NOT handle file uploads, camera access, or OCR.
 */

export function generateDocumentChecklist(
  purpose: TravelPurpose,
  visaType: VisaRequirementType,
  isCorporate: boolean = false
): DocumentRequirement[] {
  if (visaType === "visa_free") {
    return [
      {
        id: "doc_passport_free",
        name: "Valid Passport",
        description: "Valid passport required for entry checkpoint upon arrival.",
        whyRequired: "Immigration requirement for international entry clearance.",
        category: "identity",
        isRequired: true,
        status: "already_available",
        tooltipInfo: "Ensure passport has at least 1 blank entry stamp page.",
      },
    ];
  }

  const documents: DocumentRequirement[] = [
    {
      id: "doc_passport",
      name: "Original Passport Bio Page",
      description: "Color scan of front & back bio pages including signature line.",
      whyRequired: "Mandatory for embassy identity verification and border entry.",
      category: "identity",
      isRequired: true,
      status: "required",
      tooltipInfo: "Must have at least 6 months validity beyond your departure date.",
    },
    {
      id: "doc_photo",
      name: "Passport Size Photographs",
      description: "Recent 35x45mm or 2x2 inch photograph with light/white background.",
      whyRequired: "Required for digital visa issuance and physical passport sticker.",
      category: "identity",
      isRequired: true,
      status: "required",
      tooltipInfo: "No spectacles or headgear unless for religious purposes.",
    },
  ];

  // Purpose & Corporate additions
  if (purpose === "business" || isCorporate) {
    documents.push(
      {
        id: "doc_invitation_letter",
        name: "Host Business Invitation Letter",
        description: "Official letter from host company stating trip purpose and visit duration.",
        whyRequired: "Proves commercial purpose of visit to consular officers.",
        category: "invitation",
        isRequired: true,
        status: "pending",
        tooltipInfo: "Must be on host company letterhead with official seal or stamp.",
      },
      {
        id: "doc_company_cover_letter",
        name: "Employer Guarantee & Employment Proof",
        description: "Covering letter from current employer confirming position and trip sponsorship.",
        whyRequired: "Establishes employment status and financial backing.",
        category: "employment",
        isRequired: true,
        status: "required",
        tooltipInfo: "Includes employee designation, salary, and authorized leave approval.",
      }
    );
  }

  if (purpose === "tourism" || purpose === "family_visit") {
    documents.push(
      {
        id: "doc_bank_statement",
        name: "Stamped 6-Month Bank Statements",
        description: "Original or bank-certified statement showing sufficient liquid funds.",
        whyRequired: "Consular proof of financial solvency for travel duration.",
        category: "financial",
        isRequired: true,
        status: "required",
        tooltipInfo: "Ensure bank seal or digital validation QR code is visible.",
      },
      {
        id: "doc_accommodation",
        name: "Confirmed Hotel Booking Vouchers",
        description: "Confirmed reservation vouchers covering your stay in destination cities.",
        whyRequired: "Proves accommodation arrangements for entire duration.",
        category: "accommodation",
        isRequired: true,
        status: "already_available",
        tooltipInfo: "If booked through Shafsky Hotels, vouchers are automatically attached.",
      },
      {
        id: "doc_flight_itinerary",
        name: "Round-Trip Flight Itinerary",
        description: "Confirmed air tickets showing onward or return travel flight numbers.",
        whyRequired: "Mandatory return ticket proof for border authority clearance.",
        category: "travel",
        isRequired: true,
        status: "already_available",
        tooltipInfo: "Presents flight dates and reservation PNR code.",
      }
    );
  }

  if (purpose === "student") {
    documents.push({
      id: "doc_admission_letter",
      name: "Official University Acceptance Letter",
      description: "Letter of enrollment from accredited educational institute.",
      whyRequired: "Validates academic status for student visa issuance.",
      category: "supporting",
      isRequired: true,
      status: "required",
      tooltipInfo: "Must state course start date and tuition fee payment status.",
    });
  }

  if (purpose === "medical") {
    documents.push({
      id: "doc_hospital_referral",
      name: "Hospital Referral & Doctor Appointment",
      description: "Medical referral letter and appointment confirmation from treating hospital.",
      whyRequired: "Verifies medical treatment intent and hospital booking.",
      category: "supporting",
      isRequired: true,
      status: "required",
      tooltipInfo: "Must contain hospital contact number and attending doctor name.",
    });
  }

  // Insurance requirement for sticker visas
  if (visaType === "sticker") {
    documents.push({
      id: "doc_travel_insurance",
      name: "International Travel Medical Insurance",
      description: "Comprehensive health policy with minimum €30,000 / $50,000 medical emergency cover.",
      whyRequired: "Mandatory requirement for Schengen, UK, and US entry clearance.",
      category: "insurance",
      isRequired: true,
      status: "recommended",
      tooltipInfo: "Can be issued directly by Shafsky Aviation Services Concierge Desk.",
    });
  }

  return documents;
}
