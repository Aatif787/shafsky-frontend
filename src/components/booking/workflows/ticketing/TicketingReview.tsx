import React from "react";
import { ReviewSummary } from "../../shared/ReviewSummary";
import { TicketingJourneyData, TicketingPassengerData, AncillarySelection } from "../../hooks/useTicketingWorkflow";
import { Utensils, Armchair, Briefcase, Crown, Car, Hotel } from "lucide-react";

interface TicketingReviewProps {
  journey: TicketingJourneyData;
  passenger: TicketingPassengerData;
  ancillaries?: AncillarySelection;
  onUpdateAncillaries?: (fields: Partial<AncillarySelection>) => void;
  busy: boolean;
  onEdit: () => void;
  onSubmit: () => void;
}

export function TicketingReview({
  journey,
  passenger,
  ancillaries,
  onUpdateAncillaries,
  busy,
  onEdit,
  onSubmit,
}: TicketingReviewProps) {
  const routeString = `${journey.fromAirport} → ${journey.toAirport}`;
  const dateString =
    journey.tripType === "round_trip"
      ? `${journey.departDate} to ${journey.returnDate}`
      : journey.departDate;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
          Step 3 of 3 — Personalize & Review
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
          Personalize & Review Quotation Request
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
          Select optional white-glove ancillary add-ons before submission to our ticketing desk.
        </p>
      </div>

      {/* Ancillary Add-on Personalization Layer */}
      {ancillaries && onUpdateAncillaries && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider">
              Personalize Your Flight Journey (Optional Add-ons)
            </h3>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Recommended for {journey.cabinClass.includes("First") || journey.cabinClass.includes("Business") ? "First/Business Class" : "Economy Class"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              ancillaries.seatSelection ? "bg-emerald-50/60 border-emerald-300" : "bg-slate-50/60 border-slate-200"
            }`}>
              <div className="flex items-center gap-2.5">
                <Armchair className="w-4 h-4 text-emerald-700" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 block">Extra Legroom / Preferred Seat</span>
                    {journey.cabinClass.includes("Economy") && (
                      <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded">Recommended</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Quoted on request</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={ancillaries.seatSelection}
                onChange={(e) => onUpdateAncillaries({ seatSelection: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              ancillaries.specialMeal ? "bg-emerald-50/60 border-emerald-300" : "bg-slate-50/60 border-slate-200"
            }`}>
              <div className="flex items-center gap-2.5">
                <Utensils className="w-4 h-4 text-emerald-700" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 block">Michelin Gourmet Inflight Meal</span>
                    {(journey.cabinClass.includes("First") || journey.cabinClass.includes("Business")) && (
                      <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded">Recommended</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Complimentary Pre-select</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={ancillaries.specialMeal}
                onChange={(e) => onUpdateAncillaries({ specialMeal: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              ancillaries.extraBaggage ? "bg-emerald-50/60 border-emerald-300" : "bg-slate-50/60 border-slate-200"
            }`}>
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-emerald-700" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 block">Additional Checked Luggage</span>
                    {journey.cabinClass.includes("Economy") && (
                      <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded">Recommended</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Quoted on request</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={ancillaries.extraBaggage}
                onChange={(e) => onUpdateAncillaries({ extraBaggage: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              ancillaries.meetAndAssist ? "bg-emerald-50/60 border-emerald-300" : "bg-slate-50/60 border-slate-200"
            }`}>
              <div className="flex items-center gap-2.5">
                <Crown className="w-4 h-4 text-emerald-700" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 block">VIP Meet & Assist Airside</span>
                    {(journey.cabinClass.includes("First") || journey.cabinClass.includes("Business")) && (
                      <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded">Recommended</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Quoted on request</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={ancillaries.meetAndAssist}
                onChange={(e) => onUpdateAncillaries({ meetAndAssist: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>
      )}

      <ReviewSummary
        serviceTitle={`Air Ticketing — ${journey.cabinClass}`}
        badgeLabel="Passengers"
        badgeValue={`${journey.passengers} Passenger(s)`}
        items={[
          { label: "Flight Route", value: routeString },
          { label: "Travel Dates", value: dateString },
          { label: "Date Flexibility", value: journey.dateFlexibility ? "Yes (±1–3 Days)" : "Exact Date Only" },
          { label: "Cabin Class", value: journey.cabinClass },
          { label: "Preferred Alliance", value: journey.preferredAlliance || "Any Alliance" },
          { label: "Lead Passenger", value: passenger.fullName },
          { label: "Contact Phone", value: passenger.phone },
          { label: "Contact Email", value: passenger.email },
        ]}
        submitLabel="Request Flight Ticket Quote"
        busy={busy}
        onEdit={onEdit}
        onSubmit={onSubmit}
      />
    </div>
  );
}
