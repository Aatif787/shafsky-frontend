import React from "react";
import { Calendar, Clock, Zap, ArrowRight, ArrowLeft } from "lucide-react";

export interface TimelineStepProps {
  preferredShippingDate: string;
  setPreferredShippingDate: (val: string) => void;
  isFlexibleShipping: boolean;
  setIsFlexibleShipping: (val: boolean) => void;
  isUrgentShipment: boolean;
  setIsUrgentShipment: (val: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

export function TimelineStep({
  preferredShippingDate,
  setPreferredShippingDate,
  isFlexibleShipping,
  setIsFlexibleShipping,
  isUrgentShipment,
  setIsUrgentShipment,
  onNext,
  onBack,
}: TimelineStepProps) {
  const canProceed = preferredShippingDate.trim() !== "";

  return (
    <div className="space-y-8">
      {/* Conversational Header */}
      <div className="border-b border-slate-100 pb-5">
        <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
          Step 3 · Shipping Schedule
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
          When should your cargo move?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
          Select your target dispatch date and urgency priority so our operations desk can stage optimal flight capacity.
        </p>
      </div>

      {/* Target Shipping Date */}
      <div>
        <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
          Preferred Dispatch Date *
        </label>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={preferredShippingDate}
            onChange={(e) => setPreferredShippingDate(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-500 shadow-xs font-sans font-medium cursor-pointer"
          />
        </div>
      </div>

      {/* Urgency & Flexibility Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Flexible Option */}
        <button
          type="button"
          onClick={() => {
            setIsFlexibleShipping(!isFlexibleShipping);
            if (!isFlexibleShipping) setIsUrgentShipment(false);
          }}
          className={`p-5 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
            isFlexibleShipping
              ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20"
              : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-serif font-bold text-slate-900">Flexible Shipping Window</span>
            </div>
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center font-bold text-xs ${
              isFlexibleShipping ? "bg-amber-600 border-amber-600 text-white" : "border-slate-300"
            }`}>
              {isFlexibleShipping && "✓"}
            </div>
          </div>
          <p className="text-xs text-slate-600 font-sans leading-relaxed">
            My dispatch timeline is flexible by ±3 days for lower air freight rates or optimal direct flights.
          </p>
        </button>

        {/* Emergency / AOG Urgent Option */}
        <button
          type="button"
          onClick={() => {
            setIsUrgentShipment(!isUrgentShipment);
            if (!isUrgentShipment) setIsFlexibleShipping(false);
          }}
          className={`p-5 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
            isUrgentShipment
              ? "bg-red-500/10 border-red-500 ring-2 ring-red-500/20"
              : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-red-600" />
              <span className="text-sm font-serif font-bold text-slate-900">Emergency / Next Flight Out (NFO)</span>
            </div>
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center font-bold text-xs ${
              isUrgentShipment ? "bg-red-600 border-red-600 text-white" : "border-slate-300"
            }`}>
              {isUrgentShipment && "✓"}
            </div>
          </div>
          <p className="text-xs text-slate-600 font-sans leading-relaxed">
            Time-critical AOG, medical supply, or urgent production line recovery — priority dispatch desk.
          </p>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm transition-all ${
            canProceed
              ? "bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] hover:scale-105 cursor-pointer"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span>Continue to Business Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
