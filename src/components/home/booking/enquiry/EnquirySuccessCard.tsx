import React from "react";
import { CheckCircle2, ArrowLeft, ShieldCheck, Clock } from "lucide-react";
import { mono, display } from "../../theme";

interface EnquirySuccessCardProps {
  bookingRef: string;
  serviceTitle: string;
  passengerName: string;
  onReset: () => void;
}

export const EnquirySuccessCard: React.FC<EnquirySuccessCardProps> = ({
  bookingRef,
  serviceTitle,
  passengerName,
  onReset,
}) => {
  return (
    <div className="py-8 px-4 text-center max-w-lg mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="w-16 h-16 rounded-full bg-lime-500/10 border-2 border-lime-500/30 flex items-center justify-center mx-auto text-lime-600 shadow-sm">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div className="space-y-2">
        <span
          className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200"
          style={mono}
        >
          Enquiry Registered
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight" style={display}>
          Thank you, {passengerName || "Valued Guest"}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Your <span className="font-semibold text-slate-900">{serviceTitle}</span> quotation enquiry has been registered with our operations desk.
        </p>
      </div>

      {bookingRef && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 max-w-xs mx-auto">
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500" style={mono}>
            Enquiry Reference
          </p>
          <p className="text-lg font-mono font-bold text-slate-900 tracking-wider mt-0.5" style={mono}>
            {bookingRef}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-md mx-auto">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <Clock className="w-4 h-4 text-lime-600 shrink-0 mt-0.5" />
          <span>Our 24/7 VIP concierge team will reach out promptly via WhatsApp & Email.</span>
        </div>
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <ShieldCheck className="w-4 h-4 text-lime-600 shrink-0 mt-0.5" />
          <span>Bespoke quote request. No upfront payment has been initiated.</span>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Submit Another Request</span>
        </button>
      </div>
    </div>
  );
};
