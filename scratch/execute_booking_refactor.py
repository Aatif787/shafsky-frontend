import os

os.makedirs(r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\booking\shared", exist_ok=True)
os.makedirs(r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\booking\workflows", exist_ok=True)

# 1. BookingProgressHeader.tsx
header_code = '''import React from "react";
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
'''

with open(r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\booking\shared\BookingProgressHeader.tsx", "w", encoding="utf-8") as f:
    f.write(header_code)

# 2. BookingCancelModal.tsx
modal_code = '''import React from "react";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface BookingCancelModalProps {
  show: boolean;
  onClose: () => void;
}

export function BookingCancelModal({ show, onClose }: BookingCancelModalProps) {
  const navigate = useNavigate();
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-sm w-full text-center space-y-4 shadow-lg">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-xl font-serif text-slate-900 font-bold">Exit Request Process?</h3>
        <p className="text-xs text-slate-600 font-sans">Your draft details are saved locally.</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono font-bold uppercase cursor-pointer"
          >
            Keep Form
          </button>
          <button
            onClick={() => navigate({ to: "/" })}
            type="button"
            className="px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-mono font-bold uppercase cursor-pointer"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
'''

with open(r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\booking\shared\BookingCancelModal.tsx", "w", encoding="utf-8") as f:
    f.write(modal_code)

# 3. BookingSuccessPass.tsx
pass_code = '''import React from "react";
import { Link } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2 } from "lucide-react";

interface BookingSuccessPassProps {
  title: string;
  subtitle: string;
  badge: string;
  bookingRef: string | null;
  guestSummary: string;
}

export function BookingSuccessPass({
  title,
  subtitle,
  badge,
  bookingRef,
  guestSummary,
}: BookingSuccessPassProps) {
  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto shadow-sm">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-widest">
          {badge}
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-bold mt-2">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed font-sans mt-1">
          {subtitle}
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm flex flex-col items-center">
        <div className="p-3 bg-white border border-slate-100 rounded-2xl mb-4 shadow-sm">
          <QRCodeSVG value={`https://shafskyaviation.com/pass/${bookingRef}`} size={140} />
        </div>
        <div className="text-sm font-mono font-bold text-emerald-800 tracking-widest">
          REF: {bookingRef || "SHF-849201"}
        </div>
        {guestSummary && (
          <div className="text-xs text-slate-600 font-sans mt-1 font-medium">
            {guestSummary}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link
          to="/"
          className="px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-800 font-mono text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xs"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
'''

with open(r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\booking\shared\BookingSuccessPass.tsx", "w", encoding="utf-8") as f:
    f.write(pass_code)

print("Created shared sub-components.")
