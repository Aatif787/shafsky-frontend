import React from "react";
import { ArrowRight, Plane, Calendar, Users, Sparkles, Check, SlidersHorizontal } from "lucide-react";
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold">
              Departure Date *
            </label>
            <button
              type="button"
              onClick={() => onChange({ dateFlexibility: !data.dateFlexibility })}
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full transition-colors ${
                data.dateFlexibility ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
              }`}
            >
              {data.dateFlexibility ? "✓ Flexible ±1-3 days" : "+ Flexible dates?"}
            </button>
          </div>
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
            Preferred Airline / Alliance
          </label>
          <select
            value={data.preferredAlliance || "Any Alliance"}
            onChange={(e) => onChange({ preferredAlliance: e.target.value })}
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
          >
            <option value="Any Alliance">Any Premier Airline</option>
            <option value="Indian Carriers">All Indian Carriers (Air India, IndiGo, Vistara)</option>
            <option value="Air India">Air India / Air India Express</option>
            <option value="IndiGo">IndiGo</option>
            <option value="Vistara">Vistara / Akasa Air</option>
            <option value="Star Alliance">Star Alliance (Air India, Singapore Airlines, Lufthansa)</option>
            <option value="Oneworld">Oneworld (Qatar Airways, British Airways, Cathay)</option>
            <option value="SkyTeam">SkyTeam (Emirates, Air France, Delta)</option>
          </select>
        </div>
      </div>

      {/* Passenger Breakdown & Preferences */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
            Passenger Headcount ({data.passengers || 1} Total)
          </span>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-sans font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={data.nonStopOnly || false}
              onChange={(e) => onChange({ nonStopOnly: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Non-stop flights only</span>
          </label>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-600 font-bold mb-1">
              Adults (12+ yrs)
            </label>
            <input
              type="number"
              min={1}
              max={9}
              value={data.paxAdults || 1}
              onChange={(e) => onChange({ paxAdults: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm text-center font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-600 font-bold mb-1">
              Children (2-11 yrs)
            </label>
            <input
              type="number"
              min={0}
              max={9}
              value={data.paxChildren || 0}
              onChange={(e) => onChange({ paxChildren: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm text-center font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-600 font-bold mb-1">
              Infants (&lt;2 yrs)
            </label>
            <input
              type="number"
              min={0}
              max={4}
              value={data.paxInfants || 0}
              onChange={(e) => onChange({ paxInfants: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm text-center font-mono font-bold"
            />
          </div>
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
