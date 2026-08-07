import React from "react";
import { Phone, MessageSquare, Headphones, ShieldAlert, Sparkles, MapPin } from "lucide-react";

interface UnsupportedAirportSectionProps {
  airportCode?: string;
  airportName?: string;
  cityName?: string;
}

export function UnsupportedAirportSection({
  airportCode = "Airport",
  airportName,
  cityName,
}: UnsupportedAirportSectionProps) {
  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 text-white shadow-xl space-y-6 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge & Title */}
      <div className="relative z-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-300 text-[11px] font-mono font-bold uppercase tracking-widest">
          <Headphones className="w-3.5 h-3.5" />
          <span>VIP Concierge Support Available</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
          Custom Assistance for {airportName || airportCode}
        </h3>

        <p className="text-sm text-slate-300 font-sans max-w-2xl leading-relaxed">
          While direct instant online booking for <strong className="text-white font-mono">{airportCode}</strong> ({cityName || "Worldwide"}) is currently undergoing expansion, our 24/7 Global VIP Dispatch team can fulfill bespoke airside escort, private tarmac transfers, and expedited diplomatic clearance upon request.
        </p>
      </div>

      {/* Highlights / Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 relative z-10">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase">
            <Sparkles className="w-4 h-4" />
            <span>On-Demand Dispatch</span>
          </div>
          <p className="text-xs text-slate-400">
            Dedicated officer assignment arranged via local handling partners.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase">
            <MapPin className="w-4 h-4" />
            <span>Global Network</span>
          </div>
          <p className="text-xs text-slate-400">
            Concierge services supported at over 650+ international hubs worldwide.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase">
            <ShieldAlert className="w-4 h-4" />
            <span>Priority Clearance</span>
          </div>
          <p className="text-xs text-slate-400">
            Bespoke protocol assistance for VIPs, delegations, and commercial flights.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3 relative z-10">
        <a
          href="tel:+919876543210"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
        >
          <Phone className="w-4 h-4" />
          <span>Call VIP Desk (+91-9876543210)</span>
        </a>

        <a
          href="https://wa.me/919876543210?text=Hi%20Shafsky%20Concierge,%20I%20need%20assistance%20for%20an%20unsupported%20airport"
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp VIP Concierge</span>
        </a>

        <button
          type="button"
          onClick={() => alert("Request callback initiated. Our team will contact you within 15 minutes.")}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 font-mono text-xs font-bold uppercase tracking-wider border border-white/10 transition-all cursor-pointer"
        >
          <span>Request Callback</span>
        </button>
      </div>
    </div>
  );
}
