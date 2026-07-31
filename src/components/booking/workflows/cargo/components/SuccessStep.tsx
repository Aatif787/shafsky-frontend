import React from "react";
import { BookingSuccessPass } from "@/components/booking/shared/BookingSuccessPass";
import { ShieldCheck, User, Clock, PhoneCall } from "lucide-react";

export interface SuccessStepProps {
  bookingRef: string;
  origin: string;
  destination: string;
  shipmentType: string;
  packageCount: number;
  estimatedWeight: string;
  weightUnit: string;
  contactName: string;
}

export function SuccessStep({
  bookingRef,
  origin,
  destination,
  shipmentType,
  packageCount,
  estimatedWeight,
  weightUnit,
  contactName,
}: SuccessStepProps) {
  return (
    <div className="space-y-8">
      {/* Reused BookingSuccessPass */}
      <BookingSuccessPass
        badge="Concierge Triage Active"
        title="Cargo Request Submitted"
        subtitle="Your air freight specifications have been received by Shafsky Cargo Operations Command Desk."
        bookingRef={bookingRef || "SHF-CRG-894201"}
        guestSummary={`${shipmentType || "Cargo"} · ${packageCount} Pkgs (${estimatedWeight} ${weightUnit}) · ${origin || "Origin"} ➔ ${destination || "Destination"}`}
      />

      {/* Specialist Assignment & Next Steps Card */}
      <div className="max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-br from-amber-50/60 via-white to-amber-50/20 border border-amber-200/80 shadow-xs space-y-4 text-left">
        <div className="flex items-center gap-3 border-b border-amber-100 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300/70 text-amber-900 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-amber-900 uppercase tracking-widest font-bold block">
              Assigned Cargo Specialist
            </span>
            <div className="text-sm font-serif font-bold text-slate-900">
              Capt. Alexander Vance
            </div>
            <span className="text-[11px] text-slate-600 font-sans font-medium">
              Senior Air Freight & Logistics Officer
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-white border border-amber-100">
            <span className="text-slate-500 text-[10px] block font-bold uppercase">Estimated Contact</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5" /> Within 30 Mins
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-amber-100">
            <span className="text-slate-500 text-[10px] block font-bold uppercase">Status</span>
            <span className="text-amber-800 font-bold flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Ops Review
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 font-sans leading-relaxed pt-1">
          Our team is currently evaluating airline space availability, export documentation requirements, and customs clearance protocols for your route. We will reach out to <strong>{contactName || "you"}</strong> via phone and email shortly.
        </p>
      </div>
    </div>
  );
}
