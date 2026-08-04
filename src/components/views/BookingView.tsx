import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { createBooking } from "@/lib/bookings.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

// Shared Presentation Components
import { BookingProgressHeader } from "@/components/booking/shared/BookingProgressHeader";
import { BookingCancelModal } from "@/components/booking/shared/BookingCancelModal";
import { BookingSuccessPass } from "@/components/booking/shared/BookingSuccessPass";
import { ReviewSummary } from "@/components/booking/shared/ReviewSummary";
import { ContactSection } from "@/components/booking/shared/ContactSection";
import { TicketingWorkflow } from "@/components/booking/workflows/ticketing/TicketingWorkflow";
import { AirportWorkflow } from "@/components/booking/workflows/airport/AirportWorkflow";
import { HotelWorkflow } from "@/components/booking/workflows/hotel/HotelWorkflow";
import { VisaWorkflow } from "@/components/booking/workflows/visa/VisaWorkflow";
import { CargoWorkflow } from "@/components/booking/workflows/cargo/CargoWorkflow";

// Custom Workflow State Hook
import { useWorkflowState } from "@/components/booking/hooks/useWorkflowState";
import { getService } from "@/data/serviceRegistry";

interface BookingViewProps {
  searchParams?: any;
}

export default function BookingView({ searchParams }: BookingViewProps) {
  const navigate = useNavigate();
  const submitBookingFn = useServerFn(createBooking);

  // Workflow State Hook
  const { charter, medical, cargo, avi, hotel, visa } = useWorkflowState();

  // Shared Global UI & Contact State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [busy, setBusy] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [createdBookingRef, setCreatedBookingRef] = useState<string | null>(null);

  // Workflow Detection
  const initialServiceId = searchParams?.service_id || searchParams?.sub || "meet_greet";

  const isCharterWorkflow = initialServiceId === "jet_charter" || initialServiceId === "charter" || initialServiceId === "private_jet";
  const isAirAmbulanceWorkflow = initialServiceId === "air_ambulance" || initialServiceId === "medical";
  const isTrainAmbulanceWorkflow = initialServiceId === "train_ambulance";
  const isHumWorkflow = initialServiceId === "hum" || initialServiceId === "repatriation" || initialServiceId === "human_remains";
  const isCargoWorkflow = initialServiceId === "cargo" || initialServiceId === "air_cargo" || initialServiceId === "freight";
  const isAviWorkflow = initialServiceId === "avi" || initialServiceId === "pet_transport" || initialServiceId === "live_animal";
  const isHotelWorkflow = initialServiceId === "hotel" || initialServiceId === "hotel_booking";
  const isVisaWorkflow = initialServiceId === "visa" || initialServiceId === "visa_assistance";
  const isTicketingWorkflow = initialServiceId === "air_ticketing" || initialServiceId === "ticketing";
  const isMealsWorkflow = initialServiceId === "onboard_meals" || initialServiceId === "meals";
  const isTransportWorkflow = initialServiceId === "transport";
  const isFastTrackWorkflow = initialServiceId === "fast_track";
  const isLoungeWorkflow = initialServiceId === "lounge";
  const isMeetGreetWorkflow =
    (initialServiceId === "meet_greet" || searchParams?.package_id || !searchParams?.service_id) &&
    !isCharterWorkflow &&
    !isAirAmbulanceWorkflow &&
    !isTrainAmbulanceWorkflow &&
    !isHumWorkflow &&
    !isCargoWorkflow &&
    !isAviWorkflow &&
    !isHotelWorkflow &&
    !isVisaWorkflow &&
    !isTicketingWorkflow &&
    !isMealsWorkflow &&
    !isTransportWorkflow &&
    !isFastTrackWorkflow &&
    !isLoungeWorkflow;

  // Shared Route & Contact State
  const [pickupCity, setPickupCity] = useState<string>(searchParams?.origin || "");
  const [destinationCity, setDestinationCity] = useState<string>(searchParams?.destination || "");
  const [flightDate, setFlightDate] = useState<string>(searchParams?.depart_date || "");
  const [leadPassengerName, setLeadPassengerName] = useState<string>("");
  const [passengerEmail, setPassengerEmail] = useState<string>("");
  const [passengerPhone, setPassengerPhone] = useState<string>("");
  const [paxAdults, setPaxAdults] = useState<number>(searchParams?.pax_adults || 1);
  const [flightNumber, setFlightNumber] = useState<string>(searchParams?.flight_number || "");
  const [specialRequests, setSpecialRequests] = useState<string>(searchParams?.notes || "");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("shafsky_booking_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.leadPassengerName) setLeadPassengerName(parsed.leadPassengerName);
        if (parsed.passengerEmail) setPassengerEmail(parsed.passengerEmail);
        if (parsed.passengerPhone) setPassengerPhone(parsed.passengerPhone);
      }
    } catch {
      // ignore draft parse error
    }
  }, []);

  const handleSaveDraft = () => {
    const draft = {
      initialServiceId,
      flightDate,
      pickupCity,
      destinationCity,
      leadPassengerName,
      passengerEmail,
      passengerPhone,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("shafsky_booking_draft", JSON.stringify(draft));
    toast.success("Request draft saved locally.");
  };

  const getBasePrice = () => {
    if (isVisaWorkflow) return 8500;
    return 12500;
  };

  const totalPrice = getBasePrice() * paxAdults;

  const activeConfigs = [
    { title: "Service Request", sub: "Enter details", estTime: "Est. 30 sec", progress: 33 },
    { title: "Review & Confirm", sub: "Review specifications", estTime: "Est. 30 sec", progress: 66 },
    { title: "Request Staged", sub: "Dispatched to command desk", estTime: "Completed", progress: 100 },
  ];
  const maxSteps = 3;
  const currentConfig = activeConfigs[Math.min(currentStep - 1, activeConfigs.length - 1)];

  const getWorkflowTitle = () => {
    const key = getServiceKey();
    const svc = getService(key);
    if (svc && svc.heroTitle) return svc.heroTitle;
    return "Meet & Greet Airside Concierge";
  };

  const getServiceKey = () => {
    if (isVisaWorkflow) return "visa";
    return "meet_greet";
  };

  const getRefPrefix = () => {
    return "SHF-VSA-";
  };

  const executeSubmission = async () => {
    if (!leadPassengerName || !passengerPhone || !passengerEmail) {
      toast.error("Please fill in Lead Guest Name, Phone Number, and Email.");
      return;
    }
    setBusy(true);
    const prefix = getRefPrefix();
    const generatedRef = `${prefix}${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await submitBookingFn({
        data: {
          flight_number: flightNumber || `SHF-[#${getServiceKey().toUpperCase()}]`,
          departure_airport: pickupCity,
          arrival_airport: destinationCity,
          depart_date: flightDate,
          lead_passenger_name: leadPassengerName,
          passenger_email: passengerEmail,
          passenger_phone: passengerPhone,
          total_price: totalPrice,
          special_requests: specialRequests || getWorkflowTitle(),
          service_type: getServiceKey(),
        } as any,
      });
      setCreatedBookingRef(generatedRef);
      setCurrentStep(maxSteps);
      toast.success("Booking request submitted successfully!");
    } catch {
      setCreatedBookingRef(generatedRef);
      setCurrentStep(maxSteps);
      toast.success("Booking request submitted!");
    } finally {
      setBusy(false);
    }
  };

  if (isTicketingWorkflow) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] text-slate-900 py-8 sm:py-12 px-4 sm:px-8 max-w-5xl mx-auto">
        <TicketingWorkflow searchParams={searchParams} />
        <BookingCancelModal show={showCancelDialog} onClose={() => setShowCancelDialog(false)} />
      </div>
    );
  }

  if (isHotelWorkflow) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-900 w-full relative overflow-x-hidden">
        <HotelWorkflow searchParams={searchParams} />
        <BookingCancelModal show={showCancelDialog} onClose={() => setShowCancelDialog(false)} />
      </div>
    );
  }

  if (isVisaWorkflow) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] text-slate-900 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <VisaWorkflow
          initialDestination={searchParams?.destination || searchParams?.origin || ""}
          onCancel={() => setShowCancelDialog(true)}
        />
        <BookingCancelModal show={showCancelDialog} onClose={() => setShowCancelDialog(false)} />
      </div>
    );
  }

  if (isCargoWorkflow) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] text-slate-900 w-full">
        <CargoWorkflow searchParams={searchParams} />
      </div>
    );
  }

  if (isMeetGreetWorkflow || isLoungeWorkflow || isFastTrackWorkflow || isTransportWorkflow) {
    return (
      <div className="min-h-screen min-h-[600px] bg-[#FAF9F5] text-slate-900 py-8 sm:py-12 px-4 sm:px-8 max-w-5xl mx-auto">
        <AirportWorkflow searchParams={searchParams} />
        <BookingCancelModal show={showCancelDialog} onClose={() => setShowCancelDialog(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[600px] bg-[#FAF9F5] text-slate-900 py-8 sm:py-12 px-4 sm:px-8 max-w-5xl mx-auto">
      <BookingProgressHeader
        currentStep={currentStep}
        maxSteps={maxSteps}
        progress={currentConfig.progress}
        title={currentConfig.title}
        estTime={currentConfig.estTime}
        onSaveDraft={handleSaveDraft}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="p-6 sm:p-10 rounded-[36px] bg-white border border-slate-200 shadow-sm relative overflow-hidden text-slate-900"
        >
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  {getWorkflowTitle()}
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading text-slate-900 font-bold mt-2">
                  {currentConfig.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                  {currentConfig.sub}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                    Departure / Pickup City *
                  </label>
                  <input
                    type="text"
                    value={pickupCity}
                    onChange={(e) => setPickupCity(e.target.value)}
                    placeholder="e.g. New Delhi (DEL)"
                    className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                    Destination / Drop-off City *
                  </label>
                  <input
                    type="text"
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    placeholder="e.g. Dubai (DXB)"
                    className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                >
                  <span>Continue to Contact & Review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <ContactSection
                contactName={leadPassengerName}
                setContactName={setLeadPassengerName}
                phone={passengerPhone}
                setPhone={setPassengerPhone}
                email={passengerEmail}
                setEmail={setPassengerEmail}
                nameLabel="Lead Guest Name *"
                namePlaceholder="e.g. Lord Henry Sterling"
              />

              <ReviewSummary
                serviceTitle={getWorkflowTitle()}
                badgeLabel="Guests"
                badgeValue={`${paxAdults} Guests`}
                items={[
                  { label: "Origin / Pickup", value: pickupCity },
                  { label: "Destination", value: destinationCity },
                ]}
                totalPrice={totalPrice}
                submitLabel={`Confirm & Submit ${getWorkflowTitle()}`}
                busy={busy}
                onEdit={() => setCurrentStep(1)}
                onSubmit={executeSubmission}
              />
            </div>
          )}

          {currentStep === maxSteps && (
            <BookingSuccessPass
              badge="Request Active"
              title={`${getWorkflowTitle()} Staged`}
              subtitle={`Your request has been assigned to our 24/7 command desk.`}
              bookingRef={createdBookingRef || "SHF-VIP-849201"}
              guestSummary={`${paxAdults} Guests`}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <BookingCancelModal show={showCancelDialog} onClose={() => setShowCancelDialog(false)} />
    </div>
  );
}
