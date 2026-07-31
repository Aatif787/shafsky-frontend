import React from "react";
import { Package, MapPin, Scale, Box, ArrowRight, Check, AlertCircle } from "lucide-react";
import { ShipmentCard } from "../cards/ShipmentCard";

export interface ShipmentInformationStepProps {
  origin: string;
  setOrigin: (val: string) => void;
  destination: string;
  setDestination: (val: string) => void;
  shipmentType: string;
  setShipmentType: (val: string) => void;
  commodityDescription: string;
  setCommodityDescription: (val: string) => void;
  packageCount: number;
  setPackageCount: (val: number) => void;
  estimatedWeight: string;
  setEstimatedWeight: (val: string) => void;
  weightUnit: "kg" | "lbs";
  setWeightUnit: (val: "kg" | "lbs") => void;
  dimensionsKnown: boolean;
  setDimensionsKnown: (val: boolean) => void;
  length: string;
  setLength: (val: string) => void;
  width: string;
  setWidth: (val: string) => void;
  height: string;
  setHeight: (val: string) => void;
  dimensionUnit: "cm" | "in";
  setDimensionUnit: (val: "cm" | "in") => void;
  onNext: () => void;
}

const SHIPMENT_TYPES = [
  { id: "Documents", label: "Documents", desc: "High-priority legal / corporate papers" },
  { id: "Parcel", label: "Parcel", desc: "Standard boxed or packaged goods" },
  { id: "Commercial Goods", label: "Commercial Goods", desc: "Finished products & general export" },
  { id: "Machinery", label: "Machinery", desc: "Industrial equipment & spare parts" },
  { id: "Medical", label: "Medical", desc: "Pharmaceuticals, biotech & samples" },
  { id: "Dangerous Goods", label: "Dangerous Goods", desc: "Batteries, chemicals & HAZMAT" },
  { id: "Perishable", label: "Perishable", desc: "Cold chain food, flowers & produce" },
  { id: "Live Animals", label: "Live Animals", desc: "Pets & livestock (IATA LAR)" },
  { id: "Oversized", label: "Oversized", desc: "Heavy or out-of-gauge payload" },
];

export function ShipmentInformationStep({
  origin,
  setOrigin,
  destination,
  setDestination,
  shipmentType,
  setShipmentType,
  commodityDescription,
  setCommodityDescription,
  packageCount,
  setPackageCount,
  estimatedWeight,
  setEstimatedWeight,
  weightUnit,
  setWeightUnit,
  dimensionsKnown,
  setDimensionsKnown,
  length,
  setLength,
  width,
  setWidth,
  height,
  setHeight,
  dimensionUnit,
  setDimensionUnit,
  onNext,
}: ShipmentInformationStepProps) {

  const canProceed = origin.trim() !== "" && destination.trim() !== "" && commodityDescription.trim() !== "" && estimatedWeight.trim() !== "";

  return (
    <div className="space-y-8">
      {/* Conversational Header */}
      <div className="border-b border-slate-100 pb-5">
        <span className="text-[10px] font-mono text-amber-800 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
          Step 1 · Air Cargo Specs
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
          What are you shipping?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
          Enter your cargo origin, destination, commodity classification, and estimated metrics for your concierge specialist.
        </p>
      </div>

      {/* Origin & Destination Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            Origin (City or Departure Hub) *
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Mumbai (BOM) or Factory Dock"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-500 shadow-xs font-sans font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            Destination (City or Arrival Hub) *
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Frankfurt (FRA) or Client Warehouse"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-500 shadow-xs font-sans font-medium"
            />
          </div>
        </div>
      </div>

      {/* Shipment Type Chips Grid */}
      <div>
        <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-2.5">
          Select Shipment Category *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SHIPMENT_TYPES.map((type) => {
            const isSelected = shipmentType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setShipmentType(type.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 text-amber-950"
                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-slate-900">{type.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                </div>
                <span className="text-[10px] text-slate-500 font-sans mt-1 line-clamp-1">
                  {type.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversational Commodity Description */}
      <div>
        <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
          What are you shipping? (Commodity Description) *
        </label>
        <textarea
          rows={3}
          value={commodityDescription}
          onChange={(e) => setCommodityDescription(e.target.value)}
          placeholder="e.g., High-precision CNC machine parts packaged in wooden crates, requires dry handling..."
          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-500 shadow-xs font-sans font-medium"
        />
      </div>

      {/* Package Count & Estimated Weight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            Number of Packages *
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPackageCount(Math.max(1, packageCount - 1))}
              className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-lg flex items-center justify-center cursor-pointer"
            >
              -
            </button>
            <input
              type="number"
              min={1}
              value={packageCount}
              onChange={(e) => setPackageCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full text-center py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm font-mono font-bold focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={() => setPackageCount(packageCount + 1)}
              className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-lg flex items-center justify-center cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold">
              Estimated shipment weight *
            </label>
            {/* Weight Unit Switch */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full border border-slate-200">
              <button
                type="button"
                onClick={() => setWeightUnit("kg")}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  weightUnit === "kg" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                KG
              </button>
              <button
                type="button"
                onClick={() => setWeightUnit("lbs")}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  weightUnit === "lbs" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                LBS
              </button>
            </div>
          </div>
          <div className="relative">
            <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={estimatedWeight}
              onChange={(e) => setEstimatedWeight(e.target.value)}
              placeholder={`e.g. 450 ${weightUnit}`}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-500 shadow-xs font-sans font-medium"
            />
          </div>
        </div>
      </div>

      {/* Dimensions Known Toggle */}
      <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-serif font-bold text-slate-900 block">Do you know exact package dimensions?</span>
            <span className="text-[11px] text-slate-500 font-sans">Helps compute volumetric chargeable weight accurately.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDimensionsKnown(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                !dimensionsKnown ? "bg-slate-900 text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200"
              }`}
            >
              No / Approx
            </button>
            <button
              type="button"
              onClick={() => setDimensionsKnown(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                dimensionsKnown ? "bg-amber-600 text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200"
              }`}
            >
              Yes
            </button>
          </div>
        </div>

        {/* Dimension Inputs if Known */}
        {dimensionsKnown && (
          <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-600 uppercase font-bold mb-1">
                Length ({dimensionUnit})
              </label>
              <input
                type="text"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="120"
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-600 uppercase font-bold mb-1">
                Width ({dimensionUnit})
              </label>
              <input
                type="text"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="80"
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-600 uppercase font-bold mb-1">
                Height ({dimensionUnit})
              </label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="160"
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-600 uppercase font-bold mb-1">
                Unit
              </label>
              <select
                value={dimensionUnit}
                onChange={(e) => setDimensionUnit(e.target.value as "cm" | "in")}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="cm">cm (Centimeters)</option>
                <option value="in">in (Inches)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Live Preview Card */}
      <ShipmentCard
        origin={origin}
        destination={destination}
        shipmentType={shipmentType}
        commodityDescription={commodityDescription}
        packageCount={packageCount}
        estimatedWeight={estimatedWeight}
        weightUnit={weightUnit}
        dimensionsKnown={dimensionsKnown}
        length={length}
        width={width}
        height={height}
        dimensionUnit={dimensionUnit}
      />

      {/* Action Next */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm transition-all ${
            canProceed
              ? "bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] hover:scale-105 cursor-pointer"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span>Continue to Cargo Requirements</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
