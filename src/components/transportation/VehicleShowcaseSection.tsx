import React, { useState, useEffect } from "react";
import { Car } from "lucide-react";
import type { TransportationVehicleItem, TransportOptionId } from "@/data/transportation";
import { CircularVehicleSelector } from "./CircularVehicleSelector";
import { VehicleMovementStage } from "./VehicleMovementStage";
import { VehicleDetailsSection } from "./VehicleDetailsSection";

export interface VehicleShowcaseSectionProps {
  vehicles?: TransportationVehicleItem[];
  vehicle?: TransportationVehicleItem;
  defaultVehicleId?: string;
  selectedVehicleId?: string;
  onSelectVehicle?: (vehicleId: string) => void;
  categoryTitle?: string;
  categories?: TransportOptionId[];
  selectedCategory?: TransportOptionId;
  onSelectCategory?: (category: TransportOptionId) => void;
}

/**
 * Reusable, data-driven Vehicle Showcase Section.
 * Unifies:
 * 1. Responsive Circular Vehicle Selector Carousel (with integrated category filtering).
 * 2. Controlled-height single vehicle drive-in movement stage.
 * 3. Verified provider rate cards & booking actions.
 */
export const VehicleShowcaseSection: React.FC<VehicleShowcaseSectionProps> = ({
  vehicles,
  vehicle,
  defaultVehicleId,
  selectedVehicleId: controlledSelectedId,
  onSelectVehicle: controlledOnSelect,
  categoryTitle,
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const vehicleList =
    vehicles && vehicles.length > 0
      ? vehicles
      : vehicle
      ? [vehicle]
      : [];

  const [internalSelectedId, setInternalSelectedId] = useState<string>(() => {
    return defaultVehicleId || vehicleList[0]?.id || "";
  });

  const [direction, setDirection] = useState<number>(0);

  const activeId =
    controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;

  // Resolve current active vehicle
  const effectiveActiveVehicle =
    vehicleList.find((v) => v.id === activeId) || vehicleList[0];

  // Auto-sync if vehicle list changes (e.g. category switch)
  useEffect(() => {
    if (vehicleList.length > 0 && !vehicleList.some((v) => v.id === activeId)) {
      const fallbackId = vehicleList[0].id;
      if (controlledOnSelect) {
        controlledOnSelect(fallbackId);
      } else {
        setInternalSelectedId(fallbackId);
      }
    }
  }, [vehicleList, activeId, controlledOnSelect]);

  const handleSelectVehicle = (targetId: string) => {
    if (targetId === activeId) return;

    const currentIndex = vehicleList.findIndex((v) => v.id === activeId);
    const targetIndex = vehicleList.findIndex((v) => v.id === targetId);
    setDirection(targetIndex > currentIndex ? 1 : -1);

    if (controlledOnSelect) {
      controlledOnSelect(targetId);
    } else {
      setInternalSelectedId(targetId);
    }
  };

  const handleSelectCategory = (cat: TransportOptionId) => {
    setDirection(0);
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
  };

  if (vehicleList.length === 0) {
    return (
      <section className="py-16 bg-slate-50 border-b border-slate-200 text-center px-4">
        <div className="mx-auto max-w-md p-8 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Car size={36} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Vehicles in Category</h3>
          <p className="mt-1 text-xs text-slate-500">
            Vehicles for this category will be available shortly. Please select another fleet category above.
          </p>
        </div>
      </section>
    );
  }

  if (!effectiveActiveVehicle) return null;

  return (
    <section
      id={`vehicle-showcase-${effectiveActiveVehicle.id}`}
      aria-label="Active Vehicle Fleet Showcase"
      className="relative w-full max-w-full overflow-hidden bg-white"
      data-vehicle-id={effectiveActiveVehicle.id}
    >
      {/* 1. Responsive Circular Vehicle Selector Carousel with Integrated Category Tabs */}
      {vehicleList.length > 1 && (
        <CircularVehicleSelector
          vehicles={vehicleList}
          selectedVehicleId={effectiveActiveVehicle.id}
          onSelectVehicle={handleSelectVehicle}
          categoryTitle={categoryTitle}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* 2. Dedicated Cinematic Vehicle Scroll Animation Stage (Full width, pure vehicle focus) */}
      <VehicleMovementStage
        vehicle={effectiveActiveVehicle}
        direction={direction}
      />

      {/* 3. Dedicated Vehicle Information + Provider Pricing + Enquiry Actions (Below selector) */}
      <div className="border-b border-slate-200/80">
        <VehicleDetailsSection vehicle={effectiveActiveVehicle} />
      </div>
    </section>
  );
};
