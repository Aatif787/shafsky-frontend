/**
 * Booking Workflow Resolver Component
 * (Shafsky Aviation Architecture - Phase 1 Foundation)
 *
 * Decouples workflow selection from main BookingPage composition.
 */

import React from "react";
import { normalizeCatalogId, WorkflowType } from "@/lib/catalog/catalog.types";
import { AirportWorkflow } from "@/components/booking/workflows/airport/AirportWorkflow";
import { TicketingWorkflow } from "@/components/booking/workflows/ticketing/TicketingWorkflow";
import { HotelWorkflow } from "@/components/booking/workflows/hotel/HotelWorkflow";
import { VisaWorkflow } from "@/components/booking/workflows/visa/VisaWorkflow";
import { CargoWorkflow } from "@/components/booking/workflows/cargo/CargoWorkflow";

interface BookingWorkflowResolverProps {
  searchParams?: any;
}

export function resolveWorkflowType(searchParams?: any): WorkflowType {
  const rawServiceId = searchParams?.service_id || searchParams?.sub || "";
  const normalized = String(normalizeCatalogId(rawServiceId)).toUpperCase();

  if (["TICKETING", "AIR_TICKETING"].includes(normalized)) {
    return WorkflowType.TICKETING;
  }
  if (["VISA", "VISA_ASSISTANCE"].includes(normalized)) {
    return WorkflowType.VISA;
  }
  if (["HOTEL", "HOTEL_BOOKING"].includes(normalized)) {
    return WorkflowType.TRAVEL;
  }
  if (["CARGO", "AIR_CARGO", "FREIGHT"].includes(normalized)) {
    return WorkflowType.TRAVEL;
  }
  if (["JET_CHARTER", "CHARTER", "PRIVATE_JET"].includes(normalized)) {
    return WorkflowType.CHARTER;
  }

  // Default to AIRPORT workflow for airport concierge & packages
  return WorkflowType.AIRPORT;
}

export const BookingWorkflowResolver: React.FC<BookingWorkflowResolverProps> = ({ searchParams }) => {
  const workflowType = resolveWorkflowType(searchParams);

  switch (workflowType) {
    case WorkflowType.TICKETING:
      return <TicketingWorkflow searchParams={searchParams} />;
    case WorkflowType.VISA:
      return <VisaWorkflow initialDestination={searchParams?.destination || searchParams?.origin || ""} />;
    case WorkflowType.TRAVEL:
      if (searchParams?.service_id === "hotel") {
        return <HotelWorkflow searchParams={searchParams} />;
      }
      if (searchParams?.service_id === "cargo") {
        return <CargoWorkflow searchParams={searchParams} />;
      }
      return <AirportWorkflow searchParams={searchParams} />;
    case WorkflowType.AIRPORT:
    default:
      return <AirportWorkflow searchParams={searchParams} />;
  }
};
