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
        guestSummary={`${contactName || "VIP Guest"} — ${destinationCountry || "International Destination"} (${applicantCount} Traveller(s))`}
      />

      {/* Informational Concierge Timeline Journey */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-8 space-y-5 max-w-3xl mx-auto shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" /> Your VIP Concierge Journey
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {conciergeTimelineSteps.map((step, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[11px] font-bold uppercase text-amber-700">Step {idx + 1}</div>
              <div className="text-xs font-bold text-slate-900">{step.title}</div>
              <div className="text-[11px] text-slate-600">{step.desc}</div>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 text-center leading-relaxed">
          Note: Your request is staged for concierge fulfillment. Shafsky coordinates document verification and embassy liaison. Final visa grant decisions rest solely with sovereign embassy and consular authorities.
        </div>
      </div>
    </div>
  );
}
