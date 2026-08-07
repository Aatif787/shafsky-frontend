import React from "react";
import { Clock, Phone, MessageSquare, AlertTriangle, ShieldCheck } from "lucide-react";
import { UrgentAssistanceInfo } from "@/hooks/useJourneyEngine";

interface UrgentAssistanceSectionProps {
  urgentInfo?: UrgentAssistanceInfo | null;
  serviceName?: string;
  minNoticeHours?: number;
}

export function UrgentAssistanceSection({
  urgentInfo,
  serviceName = "this service",
  minNoticeHours = 6,
}: UrgentAssistanceSectionProps) {
  const message =
    urgentInfo?.message ||
    `Online booking requires at least ${minNoticeHours} hours advance notice. Please contact our 24/7 VIP Command Desk for instant manual dispatch.`;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 border border-amber-500/30 p-6 sm:p-8 text-white shadow-2xl space-y-6 relative overflow-hidden">
      {/* Accent Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start gap-4 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>Short Advance Lead Time</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
            Urgent Dispatch Required for {serviceName}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed pt-1">
            {message}
          </p>
        </div>
      </div>

      {/* Guarantee Badge */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 relative z-10">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <p className="text-xs text-slate-300 font-sans">
          Our command desk can dispatch on-ground officers in under 45 minutes for urgent flights upon manual confirmation.
        </p>
      </div>

      {/* Action Buttons: Call, WhatsApp, Request Callback */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 relative z-10">
        <a
          href={`tel:${urgentInfo?.contact_phone || "+919876543210"}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
        >
          <Phone className="w-4 h-4" />
          <span>Call Desk ({urgentInfo?.contact_phone || "+91-9876543210"})</span>
        </a>

        <a
          href={`https://wa.me/${(urgentInfo?.contact_whatsapp || "919876543210").replace(/[^0-9]/g, "")}?text=Urgent%20Booking%20Notice%20for%20${encodeURIComponent(serviceName)}`}
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp Command Desk</span>
        </a>

        <button
          type="button"
          onClick={() => alert("Callback request sent! An agent will call you back within 5 minutes.")}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 font-mono text-xs font-bold uppercase tracking-wider border border-white/10 transition-all cursor-pointer"
        >
          <span>Request Callback</span>
        </button>
      </div>
    </div>
  );
}
