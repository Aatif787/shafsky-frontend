import { useState, useEffect } from "react";
import {
  evaluateVisaRequest,
  type TravelPurpose,
  type ApplicantType,
  type VisaEvaluationResult,
} from "@/lib/visa/visaIntelligence";

export interface VisaFormData {
  destinationCountry: string;
  passportCountry: string;
  travelPurpose: TravelPurpose;
  departDate: string;
  passportNumber: string;
  passportExpiryDate: string;
  applicantType: ApplicantType;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  specialRequests: string;
  doorstepBiometrics: boolean;
}

export function useVisaWorkflow(initialDestination: string = "") {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingReference, setBookingReference] = useState<string>("");

  const [formData, setFormData] = useState<VisaFormData>({
    destinationCountry: initialDestination || "United Arab Emirates",
    passportCountry: "India",
    travelPurpose: "tourism",
    departDate: "",
    passportNumber: "",
    passportExpiryDate: "",
    applicantType: "individual",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    specialRequests: "",
    doorstepBiometrics: false,
  });

  // Sync initial destination if provided
  useEffect(() => {
    if (initialDestination) {
      setFormData((prev) => ({ ...prev, destinationCountry: initialDestination }));
    }
  }, [initialDestination]);

  const updateFormData = (fields: Partial<VisaFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  // Evaluate visa request via Phase 2 intelligence layer
  const evaluation: VisaEvaluationResult = evaluateVisaRequest({
    passportCountry: formData.passportCountry,
    destinationCountry: formData.destinationCountry,
    travelPurpose: formData.travelPurpose,
    travelDate: formData.departDate,
    passportExpiryDate: formData.passportExpiryDate,
    applicantType: formData.applicantType,
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const goToStep = (step: number) => setCurrentStep(step);

  return {
    currentStep,
    formData,
    evaluation,
    isSubmitting,
    bookingReference,
    setIsSubmitting,
    setBookingReference,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
  };
}
