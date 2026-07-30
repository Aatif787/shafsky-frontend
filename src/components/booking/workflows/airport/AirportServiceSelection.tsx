import React from "react";
import { Check } from "lucide-react";
import { AirportWorkflowState } from "../../hooks/useAirportWorkflow";
import { getAirportBusinessPrice, getAirportCurrencySymbol } from "@/data/airportRegistry";

interface AirportServiceSelectionProps {
  state: AirportWorkflowState;
  onChange: (fields: Partial<AirportWorkflowState>) => void;
}

export function AirportServiceSelection({ state, onChange }: AirportServiceSelectionProps) {
  const individualServices = [
    { id: "meet_greet", name: "Meet & Greet", desc: "Airside gate escort, luggage porter & express assistance." },
    { id: "lounge", name: "VIP Lounge Access", desc: "Executive tarmac sanctuary, premium dining & private quiet pods." },
    { id: "fast_track", name: "Fast Track Clearance", desc: "Priority diplomatic immigration desk clearance & security skip." },
    { id: "transport", name: "Chauffeur Transfer", desc: "Private executive sedan tarmac-to-hotel limousines." },
  ];

  const packages = [
    { id: "silver", name: "Silver VIP", desc: "Gate escort, porter & executive airport lounge." },
    { id: "gold", name: "Gold VIP Bundle", desc: "Gate escort, fast-track, lounge & electric buggy." },
    { id: "elite", name: "Elite All-Inclusive", desc: "Tarmac escort, fast-track, lounge, buggy & chauffeur sedan." },
  ];

  const isPackage = state.bookingMode === "package";
  const items = isPackage ? packages : individualServices;
  const currencySymbol = getAirportCurrencySymbol(state.airportCode);

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">
        {isPackage ? "Select VIP Package Tier" : "Select Standalone Service"}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => {
          const isSelected = isPackage ? state.selectedPackage === item.id : state.selectedService === item.id;
          const numericPrice = getAirportBusinessPrice(state.airportCode, isPackage ? "package" : "individual", item.id);
          const priceDisplay = `${currencySymbol}${numericPrice.toLocaleString()}`;

          return (
            <div
              key={item.id}
              onClick={() => onChange(isPackage ? { selectedPackage: item.id } : { selectedService: item.id })}
              className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-emerald-50/80 border-emerald-500 shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-serif font-bold text-slate-900">{item.name}</h4>
                  <span className="text-xs font-mono font-extrabold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-full">
                    {priceDisplay}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-sans leading-relaxed">{item.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest font-bold text-emerald-700">
                <span>{isSelected ? "Selected" : "Choose Option"}</span>
                <Check className={`w-4 h-4 ${isSelected ? "opacity-100" : "opacity-0"}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
