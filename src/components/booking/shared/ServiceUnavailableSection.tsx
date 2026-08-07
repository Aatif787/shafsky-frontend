import React from "react";
import { AlertCircle, Phone, MessageSquare, ArrowRight, ShieldAlert } from "lucide-react";

interface ServiceUnavailableSectionProps {
  requestedServiceName?: string;
  airportCode?: string;
  journeyType?: string;
  onViewAvailableServices: () => void;
}

export function ServiceUnavailableSection({
  requestedServiceName = "Selected service",
  airportCode = "Airport",
  journeyType = "arrival",
  onViewAvailableServices,
}: ServiceUnavailableSectionProps) {
  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-2xl space-y-6 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start gap-4 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-800 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest border border-slate-700">
            <ShieldAlert className="w-3 h-3" />
            <span>Service Selection Notice</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
            This service is currently unavailable for your selected journey.
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed pt-1">
            <strong className="text-white font-mono">{requestedServiceName}</strong> is not active for <strong className="text-white font-mono">{journeyType.toUpperCase()}</strong> at <strong className="text-white font-mono">{airportCode}</strong>. You can view all available services for this airport or contact our 24/7 VIP Command Desk for bespoke assistance.
          </p>
        </div>
      </div>

      {/* Action Buttons: View Available Services, Contact via WhatsApp, Call Operations */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 relative z-10">
        <button
          type="button"
          onClick={onViewAvailableServices}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg transition-all cursor-pointer"
        >
          <span>View Available Services</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <a
          href="https://wa.me/919876543210?text=Hi%20Shafsky%20Concierge,%20I%20need%20assistance%20for%20an%20unavailable%20service"
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Contact via WhatsApp</span>
        </a>

        <a
          href="tel:+919876543210"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 font-mono text-xs font-bold uppercase tracking-wider border border-white/10 transition-all"
        >
          <Phone className="w-4 h-4" />
          <span>Call Operations</span>
        </a>
      </div>
    </div>
  );
}
