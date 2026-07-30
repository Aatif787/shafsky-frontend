import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookingProgressHeader } from "./BookingProgressHeader";
import { BookingCancelModal } from "./BookingCancelModal";

interface BookingLayoutProps {
  currentStep: number;
  maxSteps: number;
  progress: number;
  title: string;
  estTime: string;
  showCancelDialog: boolean;
  onSaveDraft: () => void;
  onCloseCancelDialog: () => void;
  children: React.ReactNode;
}

export function BookingLayout({
  currentStep,
  maxSteps,
  progress,
  title,
  estTime,
  showCancelDialog,
  onSaveDraft,
  onCloseCancelDialog,
  children,
}: BookingLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 py-8 sm:py-12 px-4 sm:px-8 max-w-5xl mx-auto">
      <BookingProgressHeader
        currentStep={currentStep}
        maxSteps={maxSteps}
        progress={progress}
        title={title}
        estTime={estTime}
        onSaveDraft={onSaveDraft}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="p-6 sm:p-10 rounded-[36px] bg-white border border-slate-200 shadow-sm relative overflow-hidden text-slate-900"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <BookingCancelModal show={showCancelDialog} onClose={onCloseCancelDialog} />
    </div>
  );
}
