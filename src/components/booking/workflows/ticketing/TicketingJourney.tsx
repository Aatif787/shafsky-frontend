import React from "react";
import { ArrowRight, Plane, Calendar, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { TicketingJourneyData } from "../../hooks/useTicketingWorkflow";

interface TicketingJourneyProps {
  data: TicketingJourneyData;
  onChange: (fields: Partial<TicketingJourneyData>) => void;
  onNext: () => void;
}

export function TicketingJourney({ data, onChange, onNext }: TicketingJourneyProps) {
  const handleContinue = () => {
    if (!data.fromAirport || !data.toAirport) {
      toast.error("Please enter departure and arrival airports.");
      return;
    }
    if (!data.departDate) {
      toast.error("Please select departure date.");
      return;
    }
    if (data.tripType === "round_trip" && !data.returnDate) {
      toast.error("Please select return date.");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono uppercase tracking-[0.25em] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Executive Flight Reservation</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
          Select Your Flight Itinerary
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
          First & Business class commercial seats with priority airside staging.
        </p>
      </div>

      {/* Trip Type Selector */}
      <div className="flex flex-wrap gap-3 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/60">
        {[
          { id: "round_trip", label: "Round Trip" },
          { id: "one_way", label: "One Way" },
          { id: "multi_city", label: "Multi-City" },
        ].map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange({ tripType: type.id as any })}
            className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
              data.tripType === type.id
                ? "bg-white text-emerald-800 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            From Airport *
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.fromAirport}
              onChange={(e) => onChange({ fromAirport: e.target.value })}
              placeholder="e.g. London Heathrow (LHR) / New Delhi (DEL)"
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            To Airport *
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.toAirport}
              onChange={(e) => onChange({ toAirport: e.target.value })}
              placeholder="e.g. Dubai International (DXB) / Singapore (SIN)"
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            Departure Date *
          </label>
          <input
            type="date"
            value={data.departDate}
            onChange={(e) => onChange({ departDate: e.target.value })}
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
          />
        </div>

        {data.tripType === "round_trip" && (
          <div>
            <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
              Return Date *
            </label>
            <input
              type="date"
              value={data.returnDate}
              onChange={(e) => onChange({ returnDate: e.target.value })}
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            Cabin Class *
          </label>
          <select
            value={data.cabinClass}
            onChange={(e) => onChange({ cabinClass: e.target.value })}
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
          >
            <option value="First Class Suite">First Class Suite</option>
            <option value="Business Class Lie-Flat">Business Class Lie-Flat</option>
            <option value="Premium Economy">Premium Economy</option>
            <option value="Economy Class">Economy Class</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            Passengers *
          </label>
          <input
            type="number"
            min={1}
            max={9}
            value={data.passengers}
            onChange={(e) => onChange({ passengers: Math.max(1, parseInt(e.target.value) || 1) })}
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
        >
          <span>Continue to Passenger Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
