import React from "react";
import { ShieldAlert, Thermometer, Truck, ShieldCheck, AlertTriangle, FileText } from "lucide-react";

interface CargoRequirementCardProps {
  pickupRequired: boolean;
  doorDeliveryRequired: boolean;
  airportDropoff: boolean;
  airportCollection: boolean;
  temperatureControlled: boolean;
  temperatureRange?: string;
  insuranceRequired: boolean;
  fragile: boolean;
  dangerousGoods: boolean;
  specialHandlingNotes?: string;
}

export function CargoRequirementCard({
  pickupRequired,
  doorDeliveryRequired,
  airportDropoff,
  airportCollection,
  temperatureControlled,
  temperatureRange,
  insuranceRequired,
  fragile,
  dangerousGoods,
  specialHandlingNotes,
}: CargoRequirementCardProps) {
  const serviceBadges = [
    pickupRequired ? "Door Pickup Included" : airportDropoff ? "Airport Drop-off" : null,
    doorDeliveryRequired ? "Door Delivery Included" : airportCollection ? "Airport Station Pickup" : null,
    temperatureControlled ? `Cold Chain (${temperatureRange || "Temperature Controlled"})` : null,
    insuranceRequired ? "All-Risk Cargo Insurance" : null,
    fragile ? "Fragile Airside Protocol" : null,
    dangerousGoods ? "Dangerous Goods (IATA DGR)" : null,
  ].filter(Boolean) as string[];

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-900 border border-purple-200 flex items-center justify-center font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-purple-700" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block">
              Handling & Logistics Protocols
            </span>
            <h4 className="text-sm font-serif font-bold text-slate-900">
              Specialized Care Requirements
            </h4>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="flex flex-wrap gap-2">
        {serviceBadges.length > 0 ? (
          serviceBadges.map((badge, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>{badge}</span>
            </span>
          ))
        ) : (
          <span className="text-xs text-slate-500 font-sans italic">
            Standard airport-to-airport general cargo handling.
          </span>
        )}
      </div>

      {/* Special Handling Notes */}
      {specialHandlingNotes && (
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold block">
            Special Instructions
          </span>
          <p className="text-xs text-slate-700 font-sans mt-0.5 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100 font-medium">
            "{specialHandlingNotes}"
          </p>
        </div>
      )}
    </div>
  );
}
