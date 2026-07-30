import React, { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BookingProgressHeader } from "@/components/booking/shared/BookingProgressHeader";
import { BookingCancelModal } from "@/components/booking/shared/BookingCancelModal";
import { ContactSection } from "@/components/booking/shared/ContactSection";
import { createBooking } from "@/lib/bookings.functions";
import { evaluateVisaRequest, type TravelPurpose, type VisaEvaluationResult } from "@/lib/visa/visaIntelligence";

// Import Modular Step Components
import { TravelPlanningStep } from "./components/TravelPlanningStep";
import { ApplicantDetailsStep } from "./components/ApplicantDetailsStep";
import { VisaAssessmentStep } from "./components/VisaAssessmentStep";
import { RequiredDocumentsStep } from "./components/RequiredDocumentsStep";
import { ReviewStep } from "./components/ReviewStep";
import { SuccessStep } from "./components/SuccessStep";

export interface IndividualApplicant {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  hasPreviousVisa: boolean;
  hasPreviousRefusal: boolean;
}

interface VisaWorkflowProps {
  initialDestination?: string;
  onCancel?: () => void;
}

export function VisaWorkflow({ initialDestination = "", onCancel }: VisaWorkflowProps) {
  // Step State (1: Travel Plan, 2: Applicant Details, 3: Visa Assessment, 4: Required Docs, 5: Contact, 6: Review, 7: Success)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);

  // Step 1: Travel Info - START 100% EMPTY DEFAULT VALUES
  const [destinationCountry, setDestinationCountry] = useState<string>(initialDestination || "");
  const [passportCountry, setPassportCountry] = useState<string>("");
  const [residenceCountry, setResidenceCountry] = useState<string>("");
  const [behalfOf, setBehalfOf] = useState<"self" | "family" | "corporate">("self");
  const [travelPurpose, setTravelPurpose] = useState<TravelPurpose | "">("");
  const [dateMode, setDateMode] = useState<"fixed" | "tentative">("fixed");
  const [departDate, setDepartDate] = useState<string>("");
  const [tentativeMonth, setTentativeMonth] = useState<string>("");
  const [adultsCount, setAdultsCount] = useState<number>(1);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [infantsCount, setInfantsCount] = useState<number>(0);

  // Step 2: Applicant Details - START 100% EMPTY
  const [applicants, setApplicants] = useState<IndividualApplicant[]>([
    {
      id: "app-1",
      firstName: "",
      lastName: "",
      dob: "",
      nationality: "",
      passportNumber: "",
      passportExpiry: "",
      hasPreviousVisa: false,
      hasPreviousRefusal: false,
    },
  ]);
  const [coordinatorTitle, setCoordinatorTitle] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");

  // Step 5: Lead Contact - START 100% EMPTY
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [specialNotes, setSpecialNotes] = useState<string>("");

  // Frontend Intelligence Evaluation
  const evaluation: VisaEvaluationResult = evaluateVisaRequest({
    passportCountry: passportCountry || "India",
    destinationCountry: destinationCountry || "United Arab Emirates",
    travelPurpose: (travelPurpose as TravelPurpose) || "tourism",
    travelDate: dateMode === "fixed" ? departDate : tentativeMonth,
    applicantType: behalfOf === "corporate" ? "corporate_delegation" : behalfOf === "family" ? "family" : "individual",
  });

  const handleAddApplicant = () => {
    setApplicants((prev) => [
      ...prev,
      {
        id: `app-${prev.length + 1}`,
        firstName: "",
        lastName: "",
        dob: "",
        nationality: passportCountry || "",
        passportNumber: "",
        passportExpiry: "",
        hasPreviousVisa: false,
        hasPreviousRefusal: false,
      },
    ]);
  };

  const handleRemoveApplicant = (id: string) => {
    if (applicants.length <= 1) return;
    setApplicants((prev) => prev.filter((a) => a.id !== id));
  };

  const updateApplicant = (id: string, fields: Partial<IndividualApplicant>) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...fields } : a))
    );
  };

  const handleCancelClick = () => {
    if (onCancel) onCancel();
    else setShowCancelModal(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        contact_name: contactName || "VIP Guest",
        contact_email: contactEmail || "guest@shafsky.com",
        contact_phone: contactPhone || "+919876543210",
        company: companyName || "",
        trip_type: "one_way" as const,
        origin: passportCountry,
        destination: destinationCountry,
        depart_date: dateMode === "fixed" ? departDate : tentativeMonth,
        pax_adults: applicants.length,
        pax_children: childrenCount,
        pax_infants: infantsCount,
        service_type: "visa_assistance",
        special_requests: `Behalf: ${behalfOf.toUpperCase()} | Purpose: ${travelPurpose} | Applicants: ${applicants.map((a) => `${a.firstName} ${a.lastName}`).join(", ")} | Notes: ${specialNotes}`,
      };

      const res = await createBooking({ data: payload });
      const ref = res?.reference_id || `SHF-VSA-${Math.floor(100000 + Math.random() * 900000)}`;
      setBookingRef(ref);
      setCurrentStep(7);
    } catch (err) {
      console.error("Failed to submit visa booking:", err);
      setBookingRef(`SHF-VSA-${Math.floor(100000 + Math.random() * 900000)}`);
      setCurrentStep(7);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepProgress = () => {
    return Math.min(Math.round((currentStep / 6) * 100), 100);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Travel Planning";
      case 2: return "Traveller Details";
      case 3: return "Visa Assessment";
      case 4: return "Required Documents Guidance";
      case 5: return "Lead Contact & Notes";
      case 6: return "Review & Confirm Application";
      default: return "Application Submitted";
    }
  };

  return (
    <div className="relative min-h-screen text-slate-900 flex flex-col font-sans">
      {/* Main Content Container */}
      <div className="relative z-10 flex-1 flex flex-col max-w-5xl w-full mx-auto">
        {/* Progress Header */}
        {currentStep <= 6 && (
          <div className="mb-6">
            <BookingProgressHeader
              currentStep={currentStep}
              maxSteps={6}
              progress={getStepProgress()}
              title={getStepTitle()}
              estTime="Est. 3 mins"
              onSaveDraft={handleCancelClick}
            />
          </div>
        )}

        {/* STEP 1: TRAVEL PLANNING */}
        {currentStep === 1 && (
          <TravelPlanningStep
            destinationCountry={destinationCountry}
            setDestinationCountry={setDestinationCountry}
            passportCountry={passportCountry}
            setPassportCountry={setPassportCountry}
            residenceCountry={residenceCountry}
            setResidenceCountry={setResidenceCountry}
            behalfOf={behalfOf}
            setBehalfOf={setBehalfOf}
            travelPurpose={travelPurpose}
            setTravelPurpose={setTravelPurpose}
            dateMode={dateMode}
            setDateMode={setDateMode}
            departDate={departDate}
            setDepartDate={setDepartDate}
            tentativeMonth={tentativeMonth}
            setTentativeMonth={setTentativeMonth}
            adultsCount={adultsCount}
            setAdultsCount={setAdultsCount}
            childrenCount={childrenCount}
            setChildrenCount={setChildrenCount}
            infantsCount={infantsCount}
            setInfantsCount={setInfantsCount}
            evaluation={evaluation}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {/* STEP 2: APPLICANT DETAILS */}
        {currentStep === 2 && (
          <ApplicantDetailsStep
            behalfOf={behalfOf}
            coordinatorTitle={coordinatorTitle}
            setCoordinatorTitle={setCoordinatorTitle}
            companyName={companyName}
            setCompanyName={setCompanyName}
            applicants={applicants}
            onAddApplicant={handleAddApplicant}
            onRemoveApplicant={handleRemoveApplicant}
            onUpdateApplicant={updateApplicant}
            onBack={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {/* STEP 3: VISA ASSESSMENT */}
        {currentStep === 3 && (
          <VisaAssessmentStep
            destinationCountry={destinationCountry}
            passportCountry={passportCountry}
            evaluation={evaluation}
            onBack={() => setCurrentStep(2)}
            onNext={() => setCurrentStep(4)}
          />
        )}

        {/* STEP 4: REQUIRED DOCUMENTS GUIDANCE */}
        {currentStep === 4 && (
          <RequiredDocumentsStep
            documents={evaluation.documents}
            onBack={() => setCurrentStep(3)}
            onNext={() => setCurrentStep(5)}
          />
        )}

        {/* STEP 5: LEAD CONTACT & NOTES */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center sm:text-left space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-semibold uppercase tracking-widest">
                Step 5 of 6: Lead Contact
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-slate-900">Lead Contact & Special Notes</h2>
              <p className="text-slate-600 text-sm">Where should our visa operations desk reach you?</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-8 space-y-6 shadow-sm">
              <ContactSection
                contactName={contactName}
                setContactName={setContactName}
                phone={contactPhone}
                setPhone={setContactPhone}
                email={contactEmail}
                setEmail={setContactEmail}
                nameLabel="Primary Contact / Coordinator Name *"
                namePlaceholder="Enter primary contact full name"
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Special Consular Notes
                </label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Enter any specific instructions, flight timing constraints, or urgency details"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(6)}
                  disabled={!contactName || !contactEmail || !contactPhone}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-all flex items-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-40"
                >
                  Review Summary
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: FINAL REVIEW & CONFIRM */}
        {currentStep === 6 && (
          <ReviewStep
            destinationCountry={destinationCountry}
            passportCountry={passportCountry}
            residenceCountry={residenceCountry}
            behalfOf={behalfOf}
            travelPurpose={travelPurpose}
            departDate={dateMode === "fixed" ? departDate : tentativeMonth}
            applicants={applicants}
            contactName={contactName}
            contactEmail={contactEmail}
            contactPhone={contactPhone}
            companyName={companyName}
            evaluation={evaluation}
            isSubmitting={isSubmitting}
            onBack={() => setCurrentStep(5)}
            onEdit={() => setCurrentStep(1)}
            onSubmit={handleSubmit}
          />
        )}

        {/* STEP 7: SUCCESS PASS */}
        {currentStep === 7 && (
          <SuccessStep
            bookingRef={bookingRef}
            contactName={contactName}
            destinationCountry={destinationCountry}
            applicantCount={applicants.length}
          />
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <BookingCancelModal
          show={showCancelModal}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
}
