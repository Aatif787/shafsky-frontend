import React from "react";
import { motion } from "framer-motion";
import { Clock, Save } from "lucide-react";

interface BookingProgressHeaderProps {
  currentStep: number;
  maxSteps: number;
  progress: number;
  title: string;
  estTime: string;
  onSaveDraft: () => void;
}

export function BookingProgressHeader({
  currentStep,
  maxSteps,
  progress,
  title,
  estTime,
  onSaveDraft,
}: BookingProgressHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center font-serif text-emerald-800 font-bold text-lg">
            0{currentStep}
          </span>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-800 font-bold">
              Step {currentStep} of {maxSteps} — {progress}% Complete
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-600 px-3 py-1 rounded-full bg-white border border-slate-200 flex items-center gap-1.5 font-bold shadow-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{estTime}</span>
          </span>

          {currentStep < maxSteps && (
            <button
              onClick={onSaveDraft}
              type="button"
              className="text-xs font-mono text-slate-600 hover:text-emerald-700 flex items-center gap-1 transition-colors px-3 py-1 rounded-full bg-white border border-slate-200 font-bold shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
          )}
        </div>
      </div>

      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <motion.div
          className="h-full bg-emerald-600"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}
