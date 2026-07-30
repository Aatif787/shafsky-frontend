import React from "react";
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
