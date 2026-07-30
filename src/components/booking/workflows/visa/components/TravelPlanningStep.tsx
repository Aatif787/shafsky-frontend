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
  Hotel,
  FileText,
  ShieldCheck,
} from "lucide-react";

import type { TravelPurpose } from "@/lib/visa/types";
import type { VisaEvaluationResult } from "@/lib/visa/visaIntelligence";
import { ApplicantCounter } from "../shared/ApplicantCounter";
import { VisaStatusCard } from "../cards/VisaStatusCard";

interface TravelPlanningStepProps {
  destinationCountry: string;
  setDestinationCountry: (val: string) => void;
  passportCountry: string;
  setPassportCountry: (val: string) => void;
  residenceCountry: string;
  setResidenceCountry: (val: string) => void;
  behalfOf: "self" | "family" | "corporate";
  setBehalfOf: (val: "self" | "family" | "corporate") => void;
  travelPurpose: TravelPurpose;
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
  hasBookedFlight: boolean;
  setHasBookedFlight: (val: boolean) => void;
  hasBookedHotel: boolean;
  setHasBookedHotel: (val: boolean) => void;
  needsHotelAssistance: boolean;
  setNeedsHotelAssistance: (val: boolean) => void;
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
  hasBookedFlight,
  setHasBookedFlight,
  hasBookedHotel,
  setHasBookedHotel,
  needsHotelAssistance,
  setNeedsHotelAssistance,
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
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          Step 1 of 6: Travel Planning
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
          Where are you traveling?
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
          Tell us about your trip and passport. Our specialists will determine the exact visa category and handle consular clearance.
        </p>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 sm:p-8 space-y-6 shadow-2xl">
        {/* Conversational Location & Passport Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Destination Country *
            </label>
            <input
              type="text"
              value={destinationCountry}
              onChange={(e) => setDestinationCountry(e.target.value)}
              placeholder="e.g. France, UAE, Japan"
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Which passport will you travel with? *
            </label>
            <input
              type="text"
              value={passportCountry}
              onChange={(e) => setPassportCountry(e.target.value)}
              placeholder="e.g. India, United States"
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Country of Residence
            </label>
            <input
              type="text"
              value={residenceCountry}
              onChange={(e) => setResidenceCountry(e.target.value)}
              placeholder="e.g. India, UAE, UK"
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Booking Mode Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Who are you booking for?
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
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                    isSel
                      ? "bg-amber-500/10 border-amber-500/60 text-amber-300"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Why are you travelling? (Travel Purpose Grid) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Why are you travelling?
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
                  className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                    isSel
                      ? "bg-amber-500/10 border-amber-500/60 text-amber-300 ring-1 ring-amber-500/30"
                      : "bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Icon className={`w-4 h-4 ${isSel ? "text-amber-400" : "text-slate-400"}`} />
                    <span className="font-semibold text-sm">{p.label}</span>
                  </div>
                  <p className="text-xs text-slate-400">{p.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Travel Date Mode (Fixed Date vs Tentative Month) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              When do you plan to travel?
            </label>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDateMode("fixed")}
                className={`px-3 py-1 rounded-md transition-all ${
                  dateMode === "fixed" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400"
                }`}
              >
                Fixed Date
              </button>
              <button
                type="button"
                onClick={() => setDateMode("tentative")}
                className={`px-3 py-1 rounded-md transition-all ${
                  dateMode === "tentative" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400"
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            ) : (
              <select
                value={tentativeMonth}
                onChange={(e) => setTentativeMonth(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="2026-08">August 2026</option>
                <option value="2026-09">September 2026</option>
                <option value="2026-10">October 2026</option>
                <option value="2026-11">November 2026</option>
                <option value="2026-12">December 2026</option>
              </select>
            )}
          </div>
        </div>

        {/* Applicant Counters */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Number of Travellers
          </label>
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

        {/* Travel Support Toggles */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
          <span className="font-semibold text-slate-300 uppercase tracking-wider block">Additional Trip Arrangements</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={hasBookedFlight}
                onChange={(e) => setHasBookedFlight(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900"
              />
              Already booked flight tickets
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={hasBookedHotel}
                onChange={(e) => setHasBookedHotel(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900"
              />
              Already booked hotel stay
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={needsHotelAssistance}
                onChange={(e) => setNeedsHotelAssistance(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900"
              />
              Need hotel booking assistance
            </label>
          </div>
        </div>

        {/* Visa Status Intelligence Card */}
        <VisaStatusCard evaluation={evaluation} />

        {/* Action Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onNext}
            disabled={!destinationCountry || !passportCountry}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            Continue to Applicant Details
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
