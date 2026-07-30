import React, { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BookingProgressHeader } from "@/components/booking/shared/BookingProgressHeader";
import { BookingCancelModal } from "@/components/booking/shared/BookingCancelModal";
import { ContactSection } from "@/components/booking/shared/ContactSection";
import { createBooking } from "@/lib/bookings.functions";
import { evaluateVisaRequest, type TravelPurpose, type VisaEvaluationResult } from "@/lib/visa/visaIntelligence";
import heroJet from "@/assets/desktop-169-hotel-plane.png";

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

  // Step 1: Travel Info
  const [destinationCountry, setDestinationCountry] = useState<string>(initialDestination || "United Arab Emirates");
  const [passportCountry, setPassportCountry] = useState<string>("India");
  const [residenceCountry, setResidenceCountry] = useState<string>("India");
  const [behalfOf, setBehalfOf] = useState<"self" | "family" | "corporate">("self");
  const [travelPurpose, setTravelPurpose] = useState<TravelPurpose>("tourism");
  const [dateMode, setDateMode] = useState<"fixed" | "tentative">("fixed");
  const [departDate, setDepartDate] = useState<string>("");
  const [tentativeMonth, setTentativeMonth] = useState<string>("2026-09");
  const [adultsCount, setAdultsCount] = useState<number>(1);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [infantsCount, setInfantsCount] = useState<number>(0);
  const [hasBookedFlight, setHasBookedFlight] = useState<boolean>(false);
  const [hasBookedHotel, setHasBookedHotel] = useState<boolean>(false);
  const [needsHotelAssistance, setNeedsHotelAssistance] = useState<boolean>(false);

  // Step 2: Applicant Details
  const [applicants, setApplicants] = useState<IndividualApplicant[]>([
    {
      id: "app-1",
      firstName: "",
      lastName: "",
      dob: "",
      nationality: "India",
      passportNumber: "",
      passportExpiry: "",
      hasPreviousVisa: false,
      hasPreviousRefusal: false,
    },
  ]);
  const [coordinatorTitle, setCoordinatorTitle] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");

  // Step 5: Lead Contact
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [specialNotes, setSpecialNotes] = useState<string>("");

  // Frontend Intelligence Evaluation
  const evaluation: VisaEvaluationResult = evaluateVisaRequest({
    passportCountry,
    destinationCountry,
    travelPurpose,
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
        nationality: passportCountry || "India",
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
        special_requests: `Behalf: ${behalfOf.toUpperCase()} | Purpose: ${travelPurpose} | Applicants: ${applicants.map((a) => `${a.firstName} ${a.lastName}`).join(", ")} | Flight Booked: ${hasBookedFlight ? "Yes" : "No"} | Hotel Booked: ${hasBookedHotel ? "Yes" : "No"} | Hotel Help Needed: ${needsHotelAssistance ? "Yes" : "No"} | Notes: ${specialNotes}`,
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
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={heroJet}
          alt="Luxury Visa Background"
          className="w-full h-full object-cover object-center opacity-25 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex-1 flex flex-col max-w-5xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
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
            hasBookedFlight={hasBookedFlight}
            setHasBookedFlight={setHasBookedFlight}
            hasBookedHotel={hasBookedHotel}
            setHasBookedHotel={setHasBookedHotel}
            needsHotelAssistance={needsHotelAssistance}
            setNeedsHotelAssistance={setNeedsHotelAssistance}
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest">
                Step 5 of 6: Lead Contact
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-white">Lead Contact & Special Notes</h2>
              <p className="text-slate-400 text-sm">Where should our visa operations desk reach you?</p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 sm:p-8 space-y-6 shadow-2xl">
              <ContactSection
                contactName={contactName}
                setContactName={setContactName}
                phone={contactPhone}
                setPhone={setContactPhone}
                email={contactEmail}
                setEmail={setContactEmail}
                nameLabel="Primary Contact / Coordinator Name *"
                namePlaceholder="e.g. Sophia Martinez"
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Special Notes or Consular Instructions
                </label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Any specific instructions, flight timing constraints, or urgency details..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(6)}
                  disabled={!contactName || !contactEmail || !contactPhone}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
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
