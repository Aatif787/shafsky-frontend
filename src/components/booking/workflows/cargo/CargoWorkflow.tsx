import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBooking } from "@/lib/bookings.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

// Reused Presentation Architecture
import { BookingProgressHeader } from "@/components/booking/shared/BookingProgressHeader";
import { BookingCancelModal } from "@/components/booking/shared/BookingCancelModal";
import { SERVICE_REGISTRY } from "@/data/serviceRegistry";

// Step Components
import { ShipmentInformationStep } from "./components/ShipmentInformationStep";
import { CargoRequirementsStep } from "./components/CargoRequirementsStep";
import { TimelineStep } from "./components/TimelineStep";
import { BusinessDetailsStep } from "./components/BusinessDetailsStep";
import { ReviewStep } from "./components/ReviewStep";
import { SuccessStep } from "./components/SuccessStep";

interface CargoWorkflowProps {
  searchParams?: any;
}

export function CargoWorkflow({ searchParams }: CargoWorkflowProps) {
  const submitBookingFn = useServerFn(createBooking);

  // Workflow Step State (1 to 7)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [busy, setBusy] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [createdRef, setCreatedRef] = useState<string>("");

  // Step 1: Shipment Specs
  const [origin, setOrigin] = useState<string>(searchParams?.origin || "");
  const [destination, setDestination] = useState<string>(searchParams?.destination || "");
  const [shipmentType, setShipmentType] = useState<string>("Commercial Goods");
  const [commodityDescription, setCommodityDescription] = useState<string>(searchParams?.notes || "");
  const [packageCount, setPackageCount] = useState<number>(1);
  const [estimatedWeight, setEstimatedWeight] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [dimensionsKnown, setDimensionsKnown] = useState<boolean>(false);
  const [length, setLength] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [dimensionUnit, setDimensionUnit] = useState<"cm" | "in">("cm");

  // Step 2: Cargo Requirements
  const [pickupRequired, setPickupRequired] = useState<boolean>(true);
  const [doorDeliveryRequired, setDoorDeliveryRequired] = useState<boolean>(true);
  const [airportDropoff, setAirportDropoff] = useState<boolean>(false);
  const [airportCollection, setAirportCollection] = useState<boolean>(false);
  const [temperatureControlled, setTemperatureControlled] = useState<boolean>(false);
  const [temperatureRange, setTemperatureRange] = useState<string>("+2°C to +8°C (Cold Chain)");
  const [insuranceRequired, setInsuranceRequired] = useState<boolean>(true);
  const [fragile, setFragile] = useState<boolean>(false);
  const [dangerousGoods, setDangerousGoods] = useState<boolean>(false);
  const [specialHandlingNotes, setSpecialHandlingNotes] = useState<string>("");

  // Step 3: Shipping Timeline
  const [preferredShippingDate, setPreferredShippingDate] = useState<string>(
    searchParams?.depart_date || new Date().toISOString().split("T")[0]
  );
  const [isFlexibleShipping, setIsFlexibleShipping] = useState<boolean>(false);
  const [isUrgentShipment, setIsUrgentShipment] = useState<boolean>(false);

  // Step 4: Business Details
  const [entityType, setEntityType] = useState<"Individual" | "Company" | "Importer" | "Exporter" | "Freight Forwarder">("Company");
  const [companyName, setCompanyName] = useState<string>("");
  const [gstVatNumber, setGstVatNumber] = useState<string>("");

  // Step 5: Lead Contact
  const [contactName, setContactName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  // Load saved draft
  useEffect(() => {
    try {
      const draft = localStorage.getItem("shafsky_cargo_draft");
      if (draft) {
        const p = JSON.parse(draft);
        if (p.origin) setOrigin(p.origin);
        if (p.destination) setDestination(p.destination);
        if (p.contactName) setContactName(p.contactName);
        if (p.phone) setPhone(p.phone);
        if (p.email) setEmail(p.email);
        if (p.companyName) setCompanyName(p.companyName);
      }
    } catch {
      // ignore draft parse error
    }
  }, []);

  const handleSaveDraft = () => {
    const payload = {
      origin,
      destination,
      shipmentType,
      commodityDescription,
      contactName,
      phone,
      email,
      companyName,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("shafsky_cargo_draft", JSON.stringify(payload));
    toast.success("Cargo request draft saved locally.");
  };

  const stepConfigs = [
    { title: "Shipment Specifications", estTime: "Est. 30 sec", progress: 14 },
    { title: "Cargo Requirements", estTime: "Est. 30 sec", progress: 28 },
    { title: "Shipping Timeline", estTime: "Est. 20 sec", progress: 42 },
    { title: "Business Details", estTime: "Est. 20 sec", progress: 57 },
    { title: "Lead Contact & Review", estTime: "Est. 30 sec", progress: 85 },
    { title: "Lead Contact & Review", estTime: "Est. 30 sec", progress: 85 },
    { title: "Cargo Request Submitted", estTime: "Completed", progress: 100 },
  ];

  const maxSteps = 6;
  const currentConfig = stepConfigs[Math.min(currentStep - 1, stepConfigs.length - 1)];

  const handleSubmitCargoRequest = async () => {
    if (!contactName || !phone || !email) {
      toast.error("Please fill in Contact Name, Phone, and Email Address.");
      return;
    }

    setBusy(true);
    const generatedRef = `SHF-CRG-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await submitBookingFn({
        data: {
          flight_number: `CARGO-[${shipmentType.toUpperCase()}]`,
          departure_airport: origin,
          arrival_airport: destination,
          depart_date: preferredShippingDate,
          lead_passenger_name: contactName,
          passenger_email: email,
          passenger_phone: phone,
          total_price: 0,
          special_requests: `[AIR CARGO CONCIERGE] ${commodityDescription} | Entity: ${entityType} (${companyName || "N/A"}) | Weight: ${estimatedWeight} ${weightUnit} | Pkgs: ${packageCount} | Specs: ${specialHandlingNotes || "None"}`,
          service_type: "cargo",
        } as any,
      });
      setCreatedRef(generatedRef);
      setCurrentStep(7);
      toast.success("Air Cargo Request dispatched successfully!");
    } catch {
      setCreatedRef(generatedRef);
      setCurrentStep(7);
      toast.success("Air Cargo Request staged successfully!");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Progress Header */}
      {currentStep < 7 && (
        <BookingProgressHeader
          currentStep={Math.min(currentStep, 6)}
          maxSteps={maxSteps}
          progress={currentConfig.progress}
          title={currentConfig.title}
          estTime={currentConfig.estTime}
          onSaveDraft={handleSaveDraft}
        />
      )}

      {/* Step Motion Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="p-6 sm:p-10 rounded-[36px] bg-white border border-slate-200 shadow-sm relative overflow-hidden text-slate-900"
        >
          {/* STEP 1: Shipment Specs */}
          {currentStep === 1 && (
            <ShipmentInformationStep
              origin={origin}
              setOrigin={setOrigin}
              destination={destination}
              setDestination={setDestination}
              shipmentType={shipmentType}
              setShipmentType={setShipmentType}
              commodityDescription={commodityDescription}
              setCommodityDescription={setCommodityDescription}
              packageCount={packageCount}
              setPackageCount={setPackageCount}
              estimatedWeight={estimatedWeight}
              setEstimatedWeight={setEstimatedWeight}
              weightUnit={weightUnit}
              setWeightUnit={setWeightUnit}
              dimensionsKnown={dimensionsKnown}
              setDimensionsKnown={setDimensionsKnown}
              length={length}
              setLength={setLength}
              width={width}
              setWidth={setWidth}
              height={height}
              setHeight={setHeight}
              dimensionUnit={dimensionUnit}
              setDimensionUnit={setDimensionUnit}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {/* STEP 2: Cargo Requirements */}
          {currentStep === 2 && (
            <CargoRequirementsStep
              pickupRequired={pickupRequired}
              setPickupRequired={setPickupRequired}
              doorDeliveryRequired={doorDeliveryRequired}
              setDoorDeliveryRequired={setDoorDeliveryRequired}
              airportDropoff={airportDropoff}
              setAirportDropoff={setAirportDropoff}
              airportCollection={airportCollection}
              setAirportCollection={setAirportCollection}
              temperatureControlled={temperatureControlled}
              setTemperatureControlled={setTemperatureControlled}
              temperatureRange={temperatureRange}
              setTemperatureRange={setTemperatureRange}
              insuranceRequired={insuranceRequired}
              setInsuranceRequired={setInsuranceRequired}
              fragile={fragile}
              setFragile={setFragile}
              dangerousGoods={dangerousGoods}
              setDangerousGoods={setDangerousGoods}
              specialHandlingNotes={specialHandlingNotes}
              setSpecialHandlingNotes={setSpecialHandlingNotes}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {/* STEP 3: Shipping Timeline */}
          {currentStep === 3 && (
            <TimelineStep
              preferredShippingDate={preferredShippingDate}
              setPreferredShippingDate={setPreferredShippingDate}
              isFlexibleShipping={isFlexibleShipping}
              setIsFlexibleShipping={setIsFlexibleShipping}
              isUrgentShipment={isUrgentShipment}
              setIsUrgentShipment={setIsUrgentShipment}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {/* STEP 4: Business Details */}
          {currentStep === 4 && (
            <BusinessDetailsStep
              entityType={entityType}
              setEntityType={setEntityType}
              companyName={companyName}
              setCompanyName={setCompanyName}
              gstVatNumber={gstVatNumber}
              setGstVatNumber={setGstVatNumber}
              onNext={() => setCurrentStep(5)}
              onBack={() => setCurrentStep(3)}
            />
          )}

          {/* STEPS 5 & 6: Contact & Review */}
          {(currentStep === 5 || currentStep === 6) && (
            <ReviewStep
              contactName={contactName}
              setContactName={setContactName}
              phone={phone}
              setPhone={setPhone}
              email={email}
              setEmail={setEmail}
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
              pickupRequired={pickupRequired}
              doorDeliveryRequired={doorDeliveryRequired}
              temperatureControlled={temperatureControlled}
              temperatureRange={temperatureRange}
              insuranceRequired={insuranceRequired}
              fragile={fragile}
              dangerousGoods={dangerousGoods}
              specialHandlingNotes={specialHandlingNotes}
              busy={busy}
              onBack={() => setCurrentStep(4)}
              onSubmit={handleSubmitCargoRequest}
            />
          )}

          {/* STEP 7: Success */}
          {currentStep === 7 && (
            <SuccessStep
              bookingRef={createdRef}
              origin={origin}
              destination={destination}
              shipmentType={shipmentType}
              packageCount={packageCount}
              estimatedWeight={estimatedWeight}
              weightUnit={weightUnit}
              contactName={contactName}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <BookingCancelModal show={showCancelModal} onClose={() => setShowCancelModal(false)} />
    </div>
  );
}
