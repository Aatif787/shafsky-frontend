import React from "react";
import {
  Globe,
  Calendar,
  User,
  Users,
  Briefcase,
  ArrowRight,
  Sparkles,
  Plane,
  FileText,
  ShieldCheck,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

import type { TravelPurpose } from "@/lib/visa/types";
import type { VisaEvaluationResult } from "@/lib/visa/visaIntelligence";
import { ApplicantCounter } from "../shared/ApplicantCounter";
import { VisaStatusCard } from "../cards/VisaStatusCard";
import { SearchableCountrySelect } from "../shared/SearchableCountrySelect";

interface TravelPlanningStepProps {
  destinationCountry: string;
  setDestinationCountry: (val: string) => void;
  passportCountry: string;
  setPassportCountry: (val: string) => void;
  residenceCountry: string;
  setResidenceCountry: (val: string) => void;
  behalfOf: "self" | "family" | "corporate";
  setBehalfOf: (val: "self" | "family" | "corporate") => void;
  travelPurpose: TravelPurpose | "";
  setTravelPurpose: (val: TravelPurpose) => void;
  dateMode: "fixed" | "tentative";
  setDateMode: (val: "fixed" | "tentative") => void;
  departDate: string;
  setDepartDate: (val: string) => void;
  tentativeMonth: string;
  setTentativeMonth: (val: string) => void;
  adultsCount: number;
  setAdultsCount: (val: number) => void;
  childrenCount: number;
  setChildrenCount: (val: number) => void;
  infantsCount: number;
  setInfantsCount: (val: number) => void;
  evaluation: VisaEvaluationResult;
  onNext: () => void;
}

export function TravelPlanningStep({
  destinationCountry,
  setDestinationCountry,
  passportCountry,
  setPassportCountry,
  residenceCountry,
  setResidenceCountry,
  behalfOf,
  setBehalfOf,
  travelPurpose,
  setTravelPurpose,
  dateMode,
  setDateMode,
  departDate,
  setDepartDate,
  tentativeMonth,
  setTentativeMonth,
  adultsCount,
  setAdultsCount,
  childrenCount,
  setChildrenCount,
  infantsCount,
  setInfantsCount,
  evaluation,
  onNext,
}: TravelPlanningStepProps) {
  const travelPurposes: { id: TravelPurpose; label: string; desc: string; icon: any }[] = [
    { id: "tourism", label: "Holiday & Tourism", desc: "Vacations, resort stays & sightseeing", icon: Globe },
    { id: "business", label: "Business Meeting", desc: "Executive travel, client visits & deals", icon: Briefcase },
    { id: "family_visit", label: "Family Visit", desc: "Visiting relatives & private events", icon: Users },
    { id: "transit", label: "Transit / Layover", desc: "Short airside connection & city stopover", icon: Plane },
    { id: "student", label: "Study & Course", desc: "University programs & exchange study", icon: FileText },
    { id: "medical", label: "Medical Treatment", desc: "Specialist health care & hospital stay", icon: ShieldCheck },
    { id: "other", label: "Other / Not Sure", desc: "Our specialist will help determine the correct visa.", icon: HelpCircle },
  ];

  const totalApplicants = adultsCount + childrenCount + infantsCount;
  const isDateSelected = dateMode === "fixed" ? Boolean(departDate) : Boolean(tentativeMonth);
  const isValid = Boolean(destinationCountry && passportCountry && travelPurpose && isDateSelected);

  const getModeHelperMessage = () => {
    switch (behalfOf) {
      case "family":
        return "You'll be able to add all family members in the next step.";
      case "corporate":
        return "You'll be able to add employees and company details in the next step.";
      default:
        return "You'll provide your passport and personal details in the next step.";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Conversational Title */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          Step 1 of 6: Travel Planning
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Where are you traveling?
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl">
          Tell us about your trip and passport. Our specialists will determine the exact visa category and handle consular clearance.
        </p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-8 space-y-6 shadow-sm">
        {/* 1. Guided Country Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <SearchableCountrySelect
            label="Destination Country"
            value={destinationCountry}
            placeholder="Search destination country"
            onChange={setDestinationCountry}
            required
          />

          <SearchableCountrySelect
            label="Passport Issuing Country"
            value={passportCountry}
            placeholder="Search passport issuing country"
            onChange={setPassportCountry}
            required
          />

          <SearchableCountrySelect
            label="Country of Residence"
            value={residenceCountry}
            placeholder="Search country of residence"
            onChange={setResidenceCountry}
          />
        </div>

        {/* 2. Booking Mode */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Who are you requesting this visa for?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "self", label: "Myself (Individual)", icon: User },
              { id: "family", label: "Family Group", icon: Users },
              { id: "corporate", label: "Corporate Delegation", icon: Briefcase },
            ].map((mode) => {
              const Icon = mode.icon;
              const isSel = behalfOf === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setBehalfOf(mode.id as any)}
                  aria-pressed={isSel}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                    isSel
                      ? "bg-amber-500/10 border-amber-500 text-amber-900 ring-1 ring-amber-500/30"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {mode.label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 italic pl-1">
            {getModeHelperMessage()}
          </p>
        </div>

        {/* 3. Travel Purpose Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            What is the purpose of your trip? <span className="text-amber-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {travelPurposes.map((p) => {
              const Icon = p.icon;
              const isSel = travelPurpose === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setTravelPurpose(p.id)}
                  aria-pressed={isSel}
                  className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                    isSel
                      ? "bg-amber-500/10 border-amber-500 text-amber-900 ring-1 ring-amber-500/30"
                      : "bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Icon className={`w-4 h-4 ${isSel ? "text-amber-600" : "text-slate-500"}`} />
                    <span className="font-semibold text-sm text-slate-900">{p.label}</span>
                  </div>
                  <p className="text-xs text-slate-600">{p.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Travel Date & Mode */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              When do you plan to travel? <span className="text-amber-500">*</span>
            </label>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setDateMode("fixed")}
                className={`px-3 py-1 rounded-md transition-all ${
                  dateMode === "fixed" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-600"
                }`}
              >
                Fixed Date
              </button>
              <button
                type="button"
                onClick={() => setDateMode("tentative")}
                className={`px-3 py-1 rounded-md transition-all ${
                  dateMode === "tentative" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-600"
                }`}
              >
                Tentative Month
              </button>
            </div>
          </div>

          <div className="max-w-sm">
            {dateMode === "fixed" ? (
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  placeholder="Select your intended travel date"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-sans"
                />
              </div>
            ) : (
              <select
                value={tentativeMonth}
                onChange={(e) => setTentativeMonth(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-sans"
              >
                <option value="">Select your intended travel month</option>
                <option value="2026-08">August 2026</option>
                <option value="2026-09">September 2026</option>
                <option value="2026-10">October 2026</option>
                <option value="2026-11">November 2026</option>
                <option value="2026-12">December 2026</option>
              </select>
            )}
          </div>
        </div>

        {/* 5. Applicants Selector & Live Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Who will be travelling?
              </label>
              <span className="text-[11px] text-slate-500">Choose number of applicants</span>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              Total Applicants: {totalApplicants}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ApplicantCounter
              label="Adults"
              sublabel="Age 12+ years"
              value={adultsCount}
              min={1}
              onChange={setAdultsCount}
            />
            <ApplicantCounter
              label="Children"
              sublabel="Age 2–11 years"
              value={childrenCount}
              min={0}
              onChange={setChildrenCount}
            />
            <ApplicantCounter
              label="Infants"
              sublabel="Under 2 years"
              value={infantsCount}
              min={0}
              onChange={setInfantsCount}
            />
          </div>
        </div>

        {/* Dynamic Visa Status Intelligence Card */}
        {destinationCountry && passportCountry && (
          <VisaStatusCard evaluation={evaluation} />
        )}

        {/* Action Bar & Helper Message */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          {!isValid ? (
            <div className="flex items-center gap-2 text-xs text-amber-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Complete all required fields to continue.</span>
            </div>
          ) : (
            <div className="text-xs text-emerald-700 font-medium">
              ✓ All required fields completed.
            </div>
          )}

          <button
            type="button"
            onClick={onNext}
            disabled={!isValid}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue to Applicant Details
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
