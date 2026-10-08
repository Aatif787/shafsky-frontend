import React from "react";
import type { TransportationVehicleItem } from "@/data/transportation";
import { TransportBookingModal } from "./TransportBookingModal";

interface VehicleDetailsSectionProps {
  vehicle?: TransportationVehicleItem;
}

export const VehicleDetailsSection: React.FC<VehicleDetailsSectionProps> = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Existing Enquiry Form */}
      <div id="transport-enquiry-form">
        <TransportBookingModal inline={true} />
      </div>
    </div>
  );
};
