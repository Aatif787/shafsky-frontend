import React from "react";
import { Package, ArrowRight, Scale, Box, MapPin } from "lucide-react";

interface ShipmentCardProps {
  origin: string;
  destination: string;
  shipmentType: string;
  commodityDescription: string;
  packageCount: number;
  estimatedWeight: string;
  weightUnit: string;
  dimensionsKnown?: boolean;
  length?: string;
  width?: string;
  height?: string;
  dimensionUnit?: string;
}

export function ShipmentCard({
  origin,
  destination,
  shipmentType,
  commodityDescription,
  packageCount,
  estimatedWeight,
  weightUnit,
  dimensionsKnown,
  length,
  width,
  height,
  dimensionUnit = "cm",
}: ShipmentCardProps) {
  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white via-slate-50/50 to-amber-50/30 border border-slate-200/90 shadow-sm relative overflow-hidden space-y-4">
      {/* Specular Ambient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Route Line */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-900 border border-amber-300/60 flex items-center justify-center font-bold text-xs">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block">
              Shipment Route
            </span>
            <div className="text-sm font-serif font-bold text-slate-900 flex items-center gap-2">
              <span>{origin || "Origin City"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{destination || "Destination City"}</span>
            </div>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-mono text-[10px] font-bold uppercase tracking-wider">
          {shipmentType || "General Cargo"}
        </span>
      </div>

      {/* Commodity & Package Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
            What is being shipped
          </span>
          <p className="text-xs font-sans font-bold text-slate-900 line-clamp-2">
            {commodityDescription || "Not specified"}
          </p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
            Packages & Weight
          </span>
          <p className="text-xs font-mono font-bold text-slate-900 flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-amber-600" />
            <span>{packageCount} Pkgs · {estimatedWeight || "0"} {weightUnit}</span>
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 space-y-0.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
            Dimensions
          </span>
          <p className="text-xs font-mono font-bold text-slate-900 flex items-center gap-1">
            <Box className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {dimensionsKnown && length && width && height
                ? `${length}×${width}×${height} ${dimensionUnit}`
                : "To be measured by Ops"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
