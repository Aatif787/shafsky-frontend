import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Tag } from "lucide-react";
import type { TransportationVehicleItem } from "@/data/transportation";
import { TransportBookingModal } from "./TransportBookingModal";

interface VehicleDetailsSectionProps {
  vehicle: TransportationVehicleItem;
}

export const VehicleDetailsSection: React.FC<VehicleDetailsSectionProps> = ({ vehicle }) => {
  const reduceMotion = useReducedMotion();

  if (!vehicle) return null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={vehicle.id}
          className="space-y-4 border-b border-slate-200/80 pb-6"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* 1. Category Badge */}
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-lime-700 bg-lime-50 px-3 py-1 rounded-full border border-lime-200">
            <Tag size={12} className="text-lime-600" />
            <span>{vehicle.category}</span>
          </div>

          {/* 2. Vehicle Name */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">
            {vehicle.name}
          </h2>

          {/* 3. Canonical Description */}
          {(vehicle.description || vehicle.shortDescription) && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              {vehicle.description || vehicle.shortDescription}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 4. Existing Enquiry Form (replaces the public pricing section) */}
      <div id="transport-enquiry-form" className="pt-8">
        <TransportBookingModal inline={true} />
      </div>
    </div>
  );
};
