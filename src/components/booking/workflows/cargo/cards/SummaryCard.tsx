import React from "react";
import { Package, MapPin, Calendar, Clock, Building2, User, Scale, Box, ShieldCheck, ArrowRight } from "lucide-react";

interface SummaryCardProps {
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
  preferredShippingDate: string;
  isFlexibleShipping: boolean;
  isUrgentShipment: boolean;
  entityType: string;
  companyName: string;
  gstVatNumber?: string;
  contactName: string;
  phone: string;
  email: string;
  pickupRequired: boolean;
  doorDeliveryRequired: boolean;
  temperatureControlled: boolean;
  temperatureRange?: string;
  insuranceRequired: boolean;
  fragile: boolean;
  dangerousGoods: boolean;
  specialHandlingNotes?: string;
}

export function SummaryCard({
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
  preferredShippingDate,
  isFlexibleShipping,
  isUrgentShipment,
  entityType,
  companyName,
  gstVatNumber,
  contactName,
  phone,
  email,
  pickupRequired,
  doorDeliveryRequired,
  temperatureControlled,
  temperatureRange,
  insuranceRequired,
  fragile,
  dangerousGoods,
  specialHandlingNotes,
}: SummaryCardProps) {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-slate-50/70 to-amber-50/20 border border-slate-200/90 shadow-xs space-y-6">
      {/* Header Route Showcase */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <span className="text-[10px] font-mono text-amber-800 uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
            {shipmentType || "Air Cargo Concierge"}
          </span>
          <h3 className="text-2xl font-serif font-bold text-slate-900 mt-2 flex items-center gap-3">
            <span>{origin || "Origin"}</span>
            <ArrowRight className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{destination || "Destination"}</span>
          </h3>
        </div>

        <div className="sm:text-right">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block">
            Shipping Priority
          </span>
          <div className="text-sm font-mono font-bold text-slate-900 flex items-center gap-1.5 sm:justify-end">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>
              {isUrgentShipment
                ? "AOG / Next Flight Out (Urgent)"
                : isFlexibleShipping
                ? `Flexible (±3 Days of ${preferredShippingDate || "Target Date"})`
                : preferredShippingDate || "Scheduled Date"}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Key Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Shipment Details */}
        <div className="space-y-1 p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold block">
            Commodity & Spec
          </span>
          <div className="text-sm font-bold text-slate-900 line-clamp-1">{commodityDescription || "General Cargo"}</div>
          <div className="text-xs font-mono text-slate-600 font-medium">
            {packageCount} Packages · {estimatedWeight || "0"} {weightUnit}
          </div>
          {dimensionsKnown && length && width && height && (
            <div className="text-[11px] font-mono text-slate-500">
              {length}×{width}×{height} {dimensionUnit}
            </div>
          )}
        </div>

        {/* Business Entity */}
        <div className="space-y-1 p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold block">
            Business Entity
          </span>
          <div className="text-sm font-bold text-slate-900 truncate">
            {companyName || contactName || "Private Client"}
          </div>
          <div className="text-xs font-mono text-slate-600 font-medium">
            Type: {entityType || "Individual"}
          </div>
          {gstVatNumber && (
            <div className="text-[11px] font-mono text-slate-500 truncate">
              Tax ID: {gstVatNumber}
            </div>
          )}
        </div>

        {/* Contact Lead */}
        <div className="space-y-1 p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold block">
            Assigned Lead Contact
          </span>
          <div className="text-sm font-bold text-slate-900 truncate">{contactName || "Client Lead"}</div>
          <div className="text-xs font-mono text-slate-600 truncate">{phone}</div>
          <div className="text-[11px] font-mono text-slate-500 truncate">{email}</div>
        </div>
      </div>

      {/* Special Protocols Summary */}
      <div className="pt-2">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold block mb-2">
          Special Services & Logistics Protocols
        </span>
        <div className="flex flex-wrap gap-2">
          {pickupRequired && (
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold">
              ✓ First-Mile Door Pickup
            </span>
          )}
          {doorDeliveryRequired && (
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold">
              ✓ Last-Mile Door Delivery
            </span>
          )}
          {temperatureControlled && (
            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-mono font-bold">
              ❄ Cold Chain ({temperatureRange || "Regulated"})
            </span>
          )}
          {insuranceRequired && (
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold">
              🛡 All-Risk Insurance
            </span>
          )}
          {fragile && (
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-mono font-bold">
              ⚠ Fragile Airside Escort
            </span>
          )}
          {dangerousGoods && (
            <span className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-800 text-[10px] font-mono font-bold">
              ☣ Dangerous Goods (IATA DGR)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
