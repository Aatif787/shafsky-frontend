import React from "react";
import { ArrowLeft } from "lucide-react";
import { ContactSection } from "@/components/booking/shared/ContactSection";
import { ReviewSummary } from "@/components/booking/shared/ReviewSummary";
import { SummaryCard } from "../cards/SummaryCard";

export interface ReviewStepProps {
  // Contact props
  contactName: string;
  setContactName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;

  // Shipment & Requirement Summary Props
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
  pickupRequired: boolean;
  doorDeliveryRequired: boolean;
  temperatureControlled: boolean;
  temperatureRange?: string;
  insuranceRequired: boolean;
  fragile: boolean;
  dangerousGoods: boolean;
  specialHandlingNotes?: string;

  // Action Handlers
  busy: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export function ReviewStep({
  contactName,
  setContactName,
  phone,
  setPhone,
  email,
  setEmail,
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
  dimensionUnit,
  preferredShippingDate,
  isFlexibleShipping,
  isUrgentShipment,
  entityType,
  companyName,
  gstVatNumber,
  pickupRequired,
  doorDeliveryRequired,
  temperatureControlled,
  temperatureRange,
  insuranceRequired,
  fragile,
  dangerousGoods,
  specialHandlingNotes,
  busy,
  onBack,
  onSubmit,
}: ReviewStepProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
          Steps 5 & 6 · Contact & Final Review
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
          Lead Contact & Request Summary
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
          Verify your air cargo concierge request parameters before dispatching to our 24/7 air operations desk.
        </p>
      </div>

      {/* Step 5 Lead Contact Section Integration */}
      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
        <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-slate-800 mb-4">
          Step 5 · Primary Cargo Lead Contact
        </h3>
        <ContactSection
          contactName={contactName}
          setContactName={setContactName}
          phone={phone}
          setPhone={setPhone}
          email={email}
          setEmail={setEmail}
          nameLabel="Cargo Specialist Contact Person *"
          namePlaceholder="Full Name (e.g. Marcus Vance)"
        />
      </div>

      {/* Comprehensive Summary Card */}
      <SummaryCard
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
        preferredShippingDate={preferredShippingDate}
        isFlexibleShipping={isFlexibleShipping}
        isUrgentShipment={isUrgentShipment}
        entityType={entityType}
        companyName={companyName}
        gstVatNumber={gstVatNumber}
        contactName={contactName}
        phone={phone}
        email={email}
        pickupRequired={pickupRequired}
        doorDeliveryRequired={doorDeliveryRequired}
        temperatureControlled={temperatureControlled}
        temperatureRange={temperatureRange}
        insuranceRequired={insuranceRequired}
        fragile={fragile}
        dangerousGoods={dangerousGoods}
        specialHandlingNotes={specialHandlingNotes}
      />

      {/* Step 6 ReviewSummary Integration */}
      <ReviewSummary
        serviceTitle="Air Cargo Concierge Request"
        badgeLabel="Assigned Concierge"
        badgeValue="24/7 Desk Review"
        items={[
          { label: "Route", value: `${origin || "Origin"} ➔ ${destination || "Destination"}` },
          { label: "Weight", value: `${estimatedWeight || "0"} ${weightUnit} (${packageCount} Pkgs)` },
          { label: "Category", value: shipmentType || "General Cargo" },
          { label: "Dispatch Date", value: preferredShippingDate || "Asap" },
        ]}
        totalPrice={0}
        currencySymbol="₹"
        submitLabel="Dispatch Request to Cargo Operations"
        busy={busy}
        onEdit={onBack}
        onSubmit={onSubmit}
      />

      {/* Back Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Cargo Parameters</span>
        </button>
      </div>
    </div>
  );
}
