import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MessageSquare, PhoneCall, Tag, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { TransportationVehicleItem } from "@/data/transportation";

interface VehicleDetailsSectionProps {
  vehicle: TransportationVehicleItem;
}

/**
 * Format numerical currency in Indian numbering format (e.g. ₹40,000).
 */
function formatCurrency(amount?: number): string {
  if (amount === undefined || amount === null) return "";
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Dedicated vehicle details and verified provider rate card section.
 * Positioned below the vehicle selector in a clean, vertical layout.
 */
export const VehicleDetailsSection: React.FC<VehicleDetailsSectionProps> = ({ vehicle }) => {
  const reduceMotion = useReducedMotion();

  if (!vehicle) return null;

  const handleEnquire = () => {
    toast.success(
      `Concierge enquiry for ${vehicle.name} registered. A Shafsky specialist will contact you shortly.`
    );
  };

  const handleRequestCall = () => {
    toast.success(
      `Callback requested for ${vehicle.name}. Our dispatch coordinator will call you within 15 minutes.`
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={vehicle.id}
          className="space-y-8"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* 1. Category Badge & Vehicle Title & Short Description & Enquiry Actions */}
          <div className="space-y-4 border-b border-slate-200/80 pb-8">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-lime-700 bg-lime-50 px-3 py-1 rounded-full border border-lime-200">
              <Tag size={12} className="text-lime-600" />
              <span>{vehicle.category}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">
              {vehicle.name}
            </h2>

            {/* Canonical Description */}
            {(vehicle.description || vehicle.shortDescription) && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                {vehicle.description || vehicle.shortDescription}
              </p>
            )}

            {/* Action Buttons: [ ENQUIRE ] [ REQUEST A CALL ] */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleEnquire}
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-lime-500 hover:bg-lime-400 active:bg-lime-600 text-slate-950 font-bold text-xs sm:text-sm font-mono uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2"
              >
                <MessageSquare size={16} className="stroke-[2.5]" />
                <span>ENQUIRE</span>
              </button>

              <button
                type="button"
                onClick={handleRequestCall}
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs sm:text-sm font-mono uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                <PhoneCall size={16} className="stroke-[2.5]" />
                <span>REQUEST A CALL</span>
              </button>
            </div>
          </div>

          {/* 2. Provider Pricing: Verified Tariff Cards */}
          {vehicle.providers && vehicle.providers.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-500 inline-block" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                  PROVIDER PRICING & TARIFF DETAILS
                </span>
              </div>

              {vehicle.providers.map((entry, idx) => {
                const rates = entry.rates;
                if (!rates) return null;

                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6 space-y-4 shadow-2xs"
                  >
                    {/* Provider Header Identification */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-base sm:text-lg font-extrabold text-slate-950">
                          {entry.provider}
                        </span>
                        {entry.rawVehicleName && (
                          <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                            {entry.rawVehicleName}
                          </span>
                        )}
                      </div>

                      <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-lime-800 bg-lime-100/70 px-2.5 py-0.5 rounded-full border border-lime-300 font-semibold self-start sm:self-center">
                        <ShieldCheck size={12} className="text-lime-700" />
                        <span>Verified Tariff</span>
                      </div>
                    </div>

                    {/* Stored Tariff Grid (Only populated fields) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {rates.local4h40km !== undefined && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                          <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">
                            4 Hours / 40 KM
                          </span>
                          <span className="text-sm sm:text-base font-bold text-slate-950 font-mono">
                            {formatCurrency(rates.local4h40km)}
                          </span>
                        </div>
                      )}

                      {rates.local8h80km !== undefined && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                          <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">
                            8 Hours / 80 KM
                          </span>
                          <span className="text-sm sm:text-base font-bold text-slate-950 font-mono">
                            {formatCurrency(rates.local8h80km)}
                          </span>
                        </div>
                      )}

                      {rates.local12h120km !== undefined && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                          <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">
                            12 Hours / 120 KM
                          </span>
                          <span className="text-sm sm:text-base font-bold text-slate-950 font-mono">
                            {formatCurrency(rates.local12h120km)}
                          </span>
                        </div>
                      )}

                      {rates.extraKmRate !== undefined && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                          <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">
                            Extra KM
                          </span>
                          <span className="text-sm sm:text-base font-bold text-slate-950 font-mono">
                            {formatCurrency(rates.extraKmRate)} / km
                          </span>
                        </div>
                      )}

                      {rates.extraHrRate !== undefined && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                          <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">
                            Extra Hour
                          </span>
                          <span className="text-sm sm:text-base font-bold text-slate-950 font-mono">
                            {formatCurrency(rates.extraHrRate)} / hr
                          </span>
                        </div>
                      )}

                      {rates.nightCharges !== undefined && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                          <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">
                            Night Charge
                          </span>
                          <span className="text-sm sm:text-base font-bold text-slate-950 font-mono">
                            {formatCurrency(rates.nightCharges)}
                          </span>
                        </div>
                      )}

                      {rates.outstationMinKmPerDay !== undefined && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                          <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">
                            Outstation Min
                          </span>
                          <span className="text-sm sm:text-base font-bold text-slate-950 font-mono">
                            {rates.outstationMinKmPerDay} km / day
                          </span>
                        </div>
                      )}

                      {rates.outstationDayAllowance !== undefined && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                          <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">
                            Driver Allowance
                          </span>
                          <span className="text-sm sm:text-base font-bold text-slate-950 font-mono">
                            {formatCurrency(rates.outstationDayAllowance)} / day
                          </span>
                        </div>
                      )}

                      {rates.outstationPerKm !== undefined && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                          <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">
                            Outstation Rate
                          </span>
                          <span className="text-sm sm:text-base font-bold text-slate-950 font-mono">
                            {formatCurrency(rates.outstationPerKm)} / km
                          </span>
                        </div>
                      )}
                    </div>

                    {entry.notes && (
                      <p className="text-xs text-slate-500 italic pt-1">
                        Note: {entry.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Fallback Notice for Concierge Custom Tariffs */
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block font-semibold">
                Custom Tariff Available on Request • Dedicated Airport Chauffeur
              </span>
              <p className="mt-1 text-xs text-slate-400">
                Contact our concierge desk via Enquire or Request a Call for personalized route quotation.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
