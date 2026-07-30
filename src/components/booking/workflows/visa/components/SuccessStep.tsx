import React from "react";
import { Sparkles } from "lucide-react";
import { BookingSuccessPass } from "@/components/booking/shared/BookingSuccessPass";

interface SuccessStepProps {
  bookingRef: string | null;
  contactName: string;
  destinationCountry: string;
  applicantCount: number;
}

export function SuccessStep({
  bookingRef,
  contactName,
  destinationCountry,
  applicantCount,
}: SuccessStepProps) {
  const conciergeTimelineSteps = [
    { title: "Request Staged", desc: "Visa assistance inquiry logged" },
    { title: "Specialist Assigned", desc: "Contact within 15 minutes" },
    { title: "Document Audit", desc: "Credentials & scans verified" },
    { title: "Application Preparation", desc: "Forms & consular fees staged" },
    { title: "Embassy Filing Support", desc: "Biometric slot & submission" },
    { title: "Visa Handover", desc: "Passport delivery / eVisa PDF" },
  ];

  return (
    <div className="space-y-6 py-6 animate-in fade-in duration-300">
      {/* Reused Shared BookingSuccessPass Component */}
      <BookingSuccessPass
        title="Visa Assistance Request Received"
        subtitle="Your dedicated travel specialist has been assigned and will contact you via WhatsApp within 15 minutes to coordinate document verification."
        badge="Request Staged"
        bookingRef={bookingRef}
        guestSummary={`${contactName || "VIP Guest"} — ${destinationCountry} (${applicantCount} Traveller(s))`}
      />

      {/* Informational Concierge Timeline Journey */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 sm:p-8 space-y-5 max-w-3xl mx-auto shadow-2xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Your VIP Concierge Journey
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {conciergeTimelineSteps.map((step, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
              <div className="text-[11px] font-bold uppercase text-amber-400">Step {idx + 1}</div>
              <div className="text-xs font-bold text-white">{step.title}</div>
              <div className="text-[11px] text-slate-400">{step.desc}</div>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] text-slate-400 text-center leading-relaxed">
          Note: Your request is staged for concierge fulfillment. Shafsky coordinates document verification and embassy liaison. Final visa grant decisions rest solely with sovereign embassy and consular authorities.
        </div>
      </div>
    </div>
  );
}
