import React from "react";
import { Minus, Plus, Copy, ChevronUp, ChevronDown, Check, Building2 } from "lucide-react";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { PassengerDetail } from "./types";

export interface PassengerInformationSectionProps {
  passengers: PassengerDetail[];
  paxAdults: number;
  handlePaxChange: (newCount: number) => void;
  updatePassenger: (index: number, field: keyof PassengerDetail, value: string) => void;
  copyFromPassenger1: (index: number) => void;
  specialRequests: string;
  setSpecialRequests: (v: string) => void;
  showNotes: boolean;
  setShowNotes: (v: boolean) => void;
  showGst: boolean;
  setShowGst: (v: boolean) => void;
  gstCompanyName: string;
  setGstCompanyName: (v: string) => void;
  gstNumber: string;
  setGstNumber: (v: string) => void;
  gstBillingAddress: string;
  setGstBillingAddress: (v: string) => void;
}

export const PassengerInformationSection: React.FC<PassengerInformationSectionProps> = ({
  passengers,
  paxAdults,
  handlePaxChange,
  updatePassenger,
  copyFromPassenger1,
  specialRequests,
  setSpecialRequests,
  showNotes,
  setShowNotes,
  showGst,
  setShowGst,
  gstCompanyName,
  setGstCompanyName,
  gstNumber,
  setGstNumber,
  gstBillingAddress,
  setGstBillingAddress,
}) => {
  return (
    <div
      className="rounded-3xl border border-slate-200 bg-white shadow-sm space-y-5"
      style={{ padding: "clamp(1.25rem, 3vw, 2rem)" }}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div>
          <h2 className="font-serif text-lg font-bold text-slate-900">Passenger Information</h2>
          <p className="text-[11px] font-mono text-slate-500 mt-0.5">
            Enter name as per government ID.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => handlePaxChange(paxAdults - 1)}
            disabled={paxAdults <= 1}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Decrease passenger count"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="font-mono text-[11px] font-bold text-slate-800 min-w-[76px] text-center select-none px-1">
            {paxAdults} {paxAdults === 1 ? "Passenger" : "Passengers"}
          </span>
          <button
            type="button"
            onClick={() => handlePaxChange(paxAdults + 1)}
            disabled={paxAdults >= 10}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Increase passenger count"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {passengers.map((p, idx) => (
          <div
            key={idx}
            className={idx > 0 ? "pt-5 border-t border-slate-100 space-y-3" : "space-y-3"}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lime-100 text-[10px] font-bold text-lime-800">
                  {idx + 1}
                </span>
                Passenger {idx + 1}
              </span>

              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => copyFromPassenger1(idx)}
                  className="text-[11px] font-mono text-lime-700 hover:text-lime-800 hover:underline flex items-center gap-1 cursor-pointer font-semibold bg-lime-50 hover:bg-lime-100/70 px-2.5 py-1 rounded-lg border border-lime-200/60 transition"
                  title="Copy phone and email from Passenger 1"
                >
                  <Copy className="h-3 w-3" />
                  Same contact as Passenger 1
                </button>
              )}
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-12"
              style={{ gap: "clamp(0.75rem, 1.5vw, 1rem)" }}
            >
              {/* Full Name */}
              <div className="sm:col-span-8 md:col-span-9">
                <label
                  style={{ fontSize: "clamp(11px, 1vw, 12px)" }}
                  className="block font-mono font-bold text-slate-700 mb-1.5"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={p.fullName}
                  onChange={(e) => updatePassenger(idx, "fullName", e.target.value)}
                  placeholder="Name as per government ID"
                  style={{
                    height: "clamp(42px, 4.2vw, 46px)",
                    fontSize: "clamp(12px, 1.1vw, 13px)",
                    paddingLeft: "clamp(10px, 1.2vw, 14px)",
                    paddingRight: "clamp(10px, 1.2vw, 14px)",
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-transparent font-semibold text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none transition"
                />
              </div>

              {/* Age */}
              <div className="sm:col-span-4 md:col-span-3">
                <label
                  style={{ fontSize: "clamp(11px, 1vw, 12px)" }}
                  className="block font-mono font-bold text-slate-700 mb-1.5"
                >
                  Age
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={p.age}
                  onChange={(e) => updatePassenger(idx, "age", e.target.value)}
                  placeholder="Age (Years)"
                  style={{
                    height: "clamp(42px, 4.2vw, 46px)",
                    fontSize: "clamp(12px, 1.1vw, 13px)",
                    paddingLeft: "clamp(10px, 1.2vw, 14px)",
                    paddingRight: "clamp(10px, 1.2vw, 14px)",
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-transparent font-mono font-semibold text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none transition"
                />
              </div>

              {/* Mobile Number */}
              <div className="sm:col-span-6">
                <label
                  style={{ fontSize: "clamp(11px, 1vw, 12px)" }}
                  className="block font-mono font-bold text-slate-700 mb-1.5"
                >
                  Phone {idx === 0 ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(optional)</span>}
                </label>
                <PhoneInput
                  required={idx === 0}
                  value={p.phone}
                  onChange={(v) => updatePassenger(idx, "phone", v)}
                  placeholder={idx === 0 ? "Phone number" : "Phone (or same as P1)"}
                  style={{
                    height: "clamp(42px, 4.2vw, 46px)",
                    fontSize: "clamp(12px, 1.1vw, 13px)",
                    paddingLeft: "clamp(10px, 1.2vw, 14px)",
                    paddingRight: "clamp(10px, 1.2vw, 14px)",
                  }}
                  className="w-full rounded-r-xl border border-slate-300 bg-transparent font-mono font-semibold text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none transition"
                />
              </div>

              {/* Email Address */}
              <div className="sm:col-span-6">
                <label
                  style={{ fontSize: "clamp(11px, 1vw, 12px)" }}
                  className="block font-mono font-bold text-slate-700 mb-1.5"
                >
                  Email {idx === 0 ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(optional)</span>}
                </label>
                <input
                  type="email"
                  required={idx === 0}
                  value={p.email}
                  onChange={(e) => updatePassenger(idx, "email", e.target.value)}
                  placeholder={idx === 0 ? "Email address" : "Email (or same as P1)"}
                  style={{
                    height: "clamp(42px, 4.2vw, 46px)",
                    fontSize: "clamp(12px, 1.1vw, 13px)",
                    paddingLeft: "clamp(10px, 1.2vw, 14px)",
                    paddingRight: "clamp(10px, 1.2vw, 14px)",
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-transparent font-semibold text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none transition"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Optional Special Requests */}
      <div>
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 hover:text-slate-950 transition cursor-pointer"
        >
          {showNotes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>{showNotes ? "Hide special requests" : "+ Special requests (optional)"}</span>
        </button>

        {showNotes && (
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Wheelchair assistance, baggage wrapping, senior citizen assistance, or special requests..."
            rows={2}
            className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none"
          />
        )}
      </div>

      {/* Corporate Invoicing & GST Toggle (Optional) */}
      <div className="pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowGst(!showGst)}
          className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 hover:text-slate-950 transition cursor-pointer"
        >
          <div
            className={`flex h-4 w-4 items-center justify-center rounded border transition ${
              showGst
                ? "bg-slate-900 border-slate-900 text-lime-400"
                : "border-slate-300 bg-white"
            }`}
          >
            {showGst && <Check size={11} strokeWidth={3} />}
          </div>
          <Building2 size={13} className="text-slate-500" />
          <span>Add Corporate Details & GSTIN for Tax Invoicing (Optional)</span>
        </button>

        {showGst && (
          <div className="mt-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  Company Legal Name
                </label>
                <input
                  type="text"
                  value={gstCompanyName}
                  onChange={(e) => setGstCompanyName(e.target.value)}
                  placeholder="Company legal name"
                  className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 font-sans text-xs font-medium text-slate-900 focus:border-lime-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                  GSTIN (15 Characters)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase().trim())}
                  placeholder="15-digit GSTIN"
                  className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 font-mono text-xs font-bold text-slate-900 uppercase focus:border-lime-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                Registered Company Billing Address
              </label>
              <input
                type="text"
                value={gstBillingAddress}
                onChange={(e) => setGstBillingAddress(e.target.value)}
                placeholder="Registered company billing address"
                className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 font-sans text-xs text-slate-900 focus:border-lime-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
