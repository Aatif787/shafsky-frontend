import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

export function useWorkflowNavigation(maxSteps = 3) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false);
  const navigate = useNavigate();

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, maxSteps + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const jumpToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCancelModal = () => setShowCancelDialog(true);
  const closeCancelModal = () => setShowCancelDialog(false);
  const exitBooking = () => navigate({ to: "/" });

  return {
    currentStep,
    nextStep,
    prevStep,
    jumpToStep,
    showCancelDialog,
    openCancelModal,
    closeCancelModal,
    exitBooking,
  };
}
