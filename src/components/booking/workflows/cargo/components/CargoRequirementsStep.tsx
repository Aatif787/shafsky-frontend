import React from "react";
import { Truck, ShieldCheck, Thermometer, ShieldAlert, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";
import { CargoRequirementCard } from "../cards/CargoRequirementCard";

export interface CargoRequirementsStepProps {
  pickupRequired: boolean;
  setPickupRequired: (val: boolean) => void;
  doorDeliveryRequired: boolean;
  setDoorDeliveryRequired: (val: boolean) => void;
  airportDropoff: boolean;
  setAirportDropoff: (val: boolean) => void;
  airportCollection: boolean;
  setAirportCollection: (val: boolean) => void;
  temperatureControlled: boolean;
  setTemperatureControlled: (val: boolean) => void;
  temperatureRange: string;
  setTemperatureRange: (val: string) => void;
  insuranceRequired: boolean;
  setInsuranceRequired: (val: boolean) => void;
  fragile: boolean;
  setFragile: (val: boolean) => void;
  dangerousGoods: boolean;
  setDangerousGoods: (val: boolean) => void;
  specialHandlingNotes: string;
  setSpecialHandlingNotes: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const TEMP_RANGES = [
  "+2°C to +8°C (Cold Chain)",
  "-20°C (Deep Frozen / Dry Ice)",
  "+15°C to +25°C (Controlled Room Temp)",
  "Custom Regulated",
];

export function CargoRequirementsStep({
  pickupRequired,
  setPickupRequired,
  doorDeliveryRequired,
  setDoorDeliveryRequired,
  airportDropoff,
  setAirportDropoff,
  airportCollection,
  setAirportCollection,
  temperatureControlled,
  setTemperatureControlled,
  temperatureRange,
  setTemperatureRange,
  insuranceRequired,
  setInsuranceRequired,
  fragile,
  setFragile,
  dangerousGoods,
  setDangerousGoods,
  specialHandlingNotes,
  setSpecialHandlingNotes,
  onNext,
  onBack,
}: CargoRequirementsStepProps) {
  return (
    <div className="space-y-8">
      {/* Conversational Header */}
      <div className="border-b border-slate-100 pb-5">
        <span className="text-[10px] font-mono text-purple-800 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-purple-50 border border-purple-200">
          Step 2 · Specialized Handling Protocols
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
          Cargo Service & Handling Requirements
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
          Select ground logistics, climate controls, hazard protocols, and insurance for your shipment.
        </p>
      </div>

      {/* 1. Ground Logistics Toggles (Pickup & Delivery) */}
      <div className="space-y-3">
        <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold">
          Ground Logistics & Transfer Protocols
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setPickupRequired(!pickupRequired);
              if (!pickupRequired) setAirportDropoff(false);
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              pickupRequired
                ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20"
                : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
            }`}
          >
            <div>
              <span className="text-xs font-serif font-bold text-slate-900 block">First-Mile Door Pickup</span>
              <span className="text-[10px] text-slate-500 font-sans">Chauffeured freight truck pickup from origin warehouse.</span>
            </div>
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center font-bold text-xs ${
              pickupRequired ? "bg-amber-600 border-amber-600 text-white" : "border-slate-300"
            }`}>
              {pickupRequired && "✓"}
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setDoorDeliveryRequired(!doorDeliveryRequired);
              if (!doorDeliveryRequired) setAirportCollection(false);
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              doorDeliveryRequired
                ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20"
                : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
            }`}
          >
            <div>
              <span className="text-xs font-serif font-bold text-slate-900 block">Last-Mile Door Delivery</span>
              <span className="text-[10px] text-slate-500 font-sans">Direct white-glove transport to destination facility.</span>
            </div>
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center font-bold text-xs ${
              doorDeliveryRequired ? "bg-amber-600 border-amber-600 text-white" : "border-slate-300"
            }`}>
              {doorDeliveryRequired && "✓"}
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setAirportDropoff(!airportDropoff);
              if (!airportDropoff) setPickupRequired(false);
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              airportDropoff
                ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20"
                : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
            }`}
          >
            <div>
              <span className="text-xs font-serif font-bold text-slate-900 block">Airport Terminal Drop-off</span>
              <span className="text-[10px] text-slate-500 font-sans">Shipper delivers directly to cargo terminal gate.</span>
            </div>
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center font-bold text-xs ${
              airportDropoff ? "bg-amber-600 border-amber-600 text-white" : "border-slate-300"
            }`}>
              {airportDropoff && "✓"}
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setAirportCollection(!airportCollection);
              if (!airportCollection) setDoorDeliveryRequired(false);
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              airportCollection
                ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20"
                : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
            }`}
          >
            <div>
              <span className="text-xs font-serif font-bold text-slate-900 block">Airport Station Collection</span>
              <span className="text-[10px] text-slate-500 font-sans">Consignee collects cargo from arrival terminal hub.</span>
            </div>
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center font-bold text-xs ${
              airportCollection ? "bg-amber-600 border-amber-600 text-white" : "border-slate-300"
            }`}>
              {airportCollection && "✓"}
            </div>
          </button>
        </div>
      </div>

      {/* 2. Specialized Care Cards Grid */}
      <div className="space-y-3">
        <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold">
          Special Care & Safety Controls
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Temperature Control */}
          <div className={`p-4 rounded-2xl border transition-all ${
            temperatureControlled ? "bg-blue-50/60 border-blue-300" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-slate-900 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-blue-600" />
                <span>Temperature Controlled?</span>
              </span>
              <button
                type="button"
                onClick={() => setTemperatureControlled(!temperatureControlled)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                  temperatureControlled ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  temperatureControlled ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>

            {temperatureControlled && (
              <div className="mt-3 pt-3 border-t border-blue-200/60 space-y-2">
                <span className="text-[10px] font-mono uppercase text-blue-900 font-bold block">
                  Select Required Temp Range:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {TEMP_RANGES.map((rng) => (
                    <button
                      key={rng}
                      type="button"
                      onClick={() => setTemperatureRange(rng)}
                      className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        temperatureRange === rng
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-white text-blue-900 border border-blue-200 hover:bg-blue-100"
                      }`}
                    >
                      {rng}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* All-Risk Insurance */}
          <div className={`p-4 rounded-2xl border transition-all ${
            insuranceRequired ? "bg-emerald-50/60 border-emerald-300" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Insurance Required?</span>
              </span>
              <button
                type="button"
                onClick={() => setInsuranceRequired(!insuranceRequired)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                  insuranceRequired ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  insuranceRequired ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-sans mt-2">
              Comprehensive All-Risk Aviation Cargo Cover against transit damage or loss.
            </p>
          </div>

          {/* Fragile */}
          <div className={`p-4 rounded-2xl border transition-all ${
            fragile ? "bg-amber-50/60 border-amber-300" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Fragile Handling?</span>
              </span>
              <button
                type="button"
                onClick={() => setFragile(!fragile)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                  fragile ? "bg-amber-600" : "bg-slate-300"
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  fragile ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-sans mt-2">
              Shock-absorbing palletization & priority top-tier loading in cargo hold.
            </p>
          </div>

          {/* Dangerous Goods */}
          <div className={`p-4 rounded-2xl border transition-all ${
            dangerousGoods ? "bg-red-50/60 border-red-300" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Dangerous Goods (HAZMAT)?</span>
              </span>
              <button
                type="button"
                onClick={() => setDangerousGoods(!dangerousGoods)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                  dangerousGoods ? "bg-red-600" : "bg-slate-300"
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  dangerousGoods ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-sans mt-2">
              IATA DGR declaration, UN packaging verification & dangerous goods handling.
            </p>
          </div>
        </div>
      </div>

      {/* Special Handling Notes */}
      <div>
        <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
          Special Handling Notes / Instructions
        </label>
        <textarea
          rows={3}
          value={specialHandlingNotes}
          onChange={(e) => setSpecialHandlingNotes(e.target.value)}
          placeholder="e.g. Tailgate truck required for pickup, fragile glass optics, no stacking permitted on crates..."
          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-500 shadow-xs font-sans font-medium"
        />
      </div>

      {/* Preview Card */}
      <CargoRequirementCard
        pickupRequired={pickupRequired}
        doorDeliveryRequired={doorDeliveryRequired}
        airportDropoff={airportDropoff}
        airportCollection={airportCollection}
        temperatureControlled={temperatureControlled}
        temperatureRange={temperatureRange}
        insuranceRequired={insuranceRequired}
        fragile={fragile}
        dangerousGoods={dangerousGoods}
        specialHandlingNotes={specialHandlingNotes}
      />

      {/* Action Buttons */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all cursor-pointer"
        >
          <span>Continue to Shipping Timeline</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
