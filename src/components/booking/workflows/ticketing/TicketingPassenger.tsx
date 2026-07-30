import React from "react";
import { ArrowRight, User, Phone, Mail, FileText } from "lucide-react";
import { toast } from "sonner";
import { TicketingPassengerData } from "../../hooks/useTicketingWorkflow";

interface TicketingPassengerProps {
  data: TicketingPassengerData;
  onChange: (fields: Partial<TicketingPassengerData>) => void;
  onBack: () => void;
  onNext: () => void;
}

export function TicketingPassenger({ data, onChange, onBack, onNext }: TicketingPassengerProps) {
  const handleContinue = () => {
    if (!data.fullName || !data.fullName.trim()) {
      toast.error("Please enter Full Name.");
      return;
    }
    if (!data.phone || !data.phone.trim()) {
      toast.error("Please enter Phone / Mobile Number.");
      return;
    }
    if (!data.email || !data.email.trim()) {
      toast.error("Please enter Email Address.");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
          Step 2 of 3 — Passenger Contact
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
          Passenger & Contact Details
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
          Enter lead passenger information for commercial airline e-ticket issuance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            Lead Passenger Full Name *
          </label>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="e.g. Lord Henry Sterling"
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            Company Name (Optional)
          </label>
          <input
            type="text"
            value={data.companyName || ""}
            onChange={(e) => onChange({ companyName: e.target.value })}
            placeholder="e.g. Sterling Global Enterprises"
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            Mobile Number *
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+44 7700 900077"
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            Email Address *
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="guest@shafskyaviation.com"
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
          />
        </div>

        {/* VIP Assistance & Special Needs Layer */}
        <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider block">
            Special Assistance & VIP Preferences
          </span>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-sans font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={data.wheelchairAssistance || false}
                onChange={(e) => onChange({ wheelchairAssistance: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Wheelchair Ramp Escort</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-sans font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={data.medicalAssistance || false}
                onChange={(e) => onChange({ medicalAssistance: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Medical / Oxygen Assistance</span>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-600 font-bold mb-1">
              Dietary Restrictions / Meal Preferences
            </label>
            <input
              type="text"
              value={data.dietaryRestrictions || ""}
              onChange={(e) => onChange({ dietaryRestrictions: e.target.value })}
              placeholder="e.g. Diabetic meal, Halal, Kosher, Strict Vegan..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-sans font-medium"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            Special Requests / VIP Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={data.specialRequests}
            onChange={(e) => onChange({ specialRequests: e.target.value })}
            placeholder="Frequent flyer numbers, passport expiry, or specific seat requests..."
            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium resize-none"
          />
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
        >
          <span>Review Ticket Request</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
