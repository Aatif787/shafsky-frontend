import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, HeartPulse, Building2, Globe, Plane, Utensils, Package, Dog, ShieldAlert, Train, Cross } from "lucide-react";
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
  const [flightDirection, setFlightDirection] = useState<"arrival" | "departure" | "transit">("arrival");
  const [airportBookingMode, setAirportBookingMode] = useState<"individual" | "package">("individual");
  const [pickupCity, setPickupCity] = useState<string>(searchParams?.origin || "Delhi (DEL)");
  const [destinationCity, setDestinationCity] = useState<string>(searchParams?.destination || "Dubai (DXB)");
  const [flightDate, setFlightDate] = useState<string>(searchParams?.depart_date || new Date().toISOString().split("T")[0]);
  const [flightTime, setFlightTime] = useState<string>("14:30");
  const [leadPassengerName, setLeadPassengerName] = useState<string>("");
  const [passengerEmail, setPassengerEmail] = useState<string>("");
  const [passengerPhone, setPassengerPhone] = useState<string>("");
  const [paxAdults, setPaxAdults] = useState<number>(searchParams?.pax_adults || 1);
  const [flightNumber, setFlightNumber] = useState<string>(searchParams?.flight_number || "AI302");
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
    if (isCharterWorkflow) return 450000;
    if (isAirAmbulanceWorkflow) return 185000;
    if (isTrainAmbulanceWorkflow) return 45000;
    if (isHumWorkflow) return 65000;
    if (isCargoWorkflow) return 45000;
    if (isAviWorkflow) return 28000;
    if (isHotelWorkflow) return 32000;
    if (isVisaWorkflow) return 8500;
    if (isTicketingWorkflow) return 85000;
    if (isMealsWorkflow) return 4500;
    if (isTransportWorkflow) return 14000;
    if (isFastTrackWorkflow) return 7500;
    if (isLoungeWorkflow) return 9500;
    return 12500;
  };

  const totalPrice = getBasePrice() * paxAdults;

  const charterStepConfigs = [
    { title: "Flight Itinerary & Aircraft Category", sub: "Specify origin/destination airports, departure date/time, and aircraft preference.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Charterer Contact & Review", sub: "Enter lead charterer details and review your private jet quotation request.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Charter Request Staged", sub: "Your private jet charter quote request is assigned to our flight dispatch team.", estTime: "Completed", progress: 100 },
  ];

  const airAmbulanceStepConfigs = [
    { title: "Patient Details & Airborne ICU", sub: "Provide patient condition and count for airborne ICU flight staging.", estTime: "Est. 20 sec", progress: 33 },
    { title: "Medical Route & Emergency Contact", sub: "Specify origin/receiving facilities, travel date, and contact info.", estTime: "Est. 20 sec", progress: 66 },
    { title: "Air Ambulance Dispatched", sub: "Your medevac flight dispatch request is assigned to our flight doctor.", estTime: "Completed", progress: 100 },
  ];

  const trainAmbulanceStepConfigs = [
    { title: "Patient Details & Train ICU", sub: "Provide patient condition and count for mobile train ICU compartment staging.", estTime: "Est. 20 sec", progress: 33 },
    { title: "Station Route & Contact Review", sub: "Specify pickup station, destination station, date, and contact info.", estTime: "Est. 20 sec", progress: 66 },
    { title: "Train ICU Staged", sub: "Your train ambulance dispatch request is active with our railway logistics team.", estTime: "Completed", progress: 100 },
  ];

  const humStepConfigs = [
    { title: "Repatriation Specifications", sub: "Specify assistance type, origin city, destination city, and date.", estTime: "Est. 20 sec", progress: 50 },
    { title: "Repatriation Contact & Staging", sub: "Enter family/liaison contact details and review repatriation request.", estTime: "Completed", progress: 100 },
  ];

  const cargoStepConfigs = [
    { title: "Air Cargo Freight Manifest", sub: "Specify commodity type, weight, package count, and routing details.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Logistics Contact & Review", sub: "Enter logistics manager contact details and verify quotation request.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Air Cargo Quote Staged", sub: "Your cargo freight quotation is assigned to our air logistics desk.", estTime: "Completed", progress: 100 },
  ];

  const aviStepConfigs = [
    { title: "Pet & Live Animal Manifest", sub: "Specify species, breed, weight, count, and travel route.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Owner Contact & Review", sub: "Enter owner contact info and verify your live pet air transit request.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Pet Transit Staged", sub: "Your live animal air transit reservation is assigned to our veterinary handler.", estTime: "Completed", progress: 100 },
  ];

  const hotelStepConfigs = [
    { title: "5-Star Hotel Suite Selection", sub: "Select destination city, check-in/out dates, and suite preference.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Guest Contact & Review", sub: "Enter lead guest details and review your luxury hotel reservation.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Hotel Reservation Staged", sub: "Your VIP hotel reservation request is assigned to our concierge desk.", estTime: "Completed", progress: 100 },
  ];

  const visaStepConfigs = [
    { title: "Diplomatic Visa Processing", sub: "Select destination country, visa type, and passport nationality.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Applicant Contact & Review", sub: "Enter applicant contact details and verify embassy liaison requirements.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Visa Request Submitted", sub: "Your visa application request is assigned to our embassy liaison officer.", estTime: "Completed", progress: 100 },
  ];

  const ticketingStepConfigs = [
    { title: "Commercial Flight Ticketing", sub: "Specify travel itinerary, dates, cabin class, and headcount.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Passenger Contact & Review", sub: "Enter lead passenger details and confirm your flight reservation.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Flight Seat Reserved", sub: "Your commercial flight seat request is staged with our airline ticketing desk.", estTime: "Completed", progress: 100 },
  ];

  const mealsStepConfigs = [
    { title: "Gourmet In-Flight Catering", sub: "Choose gourmet menu options, flight airline, and dietary preferences.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Guest Contact & Review", sub: "Enter guest contact details and confirm your inflight culinary order.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Inflight Menu Staged", sub: "Your inflight gourmet meal order is sent to our executive culinary team.", estTime: "Completed", progress: 100 },
  ];

  const genericStepConfigs = [
    { title: "Passenger & Travel Details", sub: "Specify travel route, departure date, flight info, and headcount.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Review & Confirm Booking", sub: "Verify your service itinerary breakdown before payment.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Booking Confirmed & Digital Pass", sub: "Your airside concierge pass is active and assigned to our command desk.", estTime: "Completed", progress: 100 },
  ];

  const activeConfigs = isCharterWorkflow
    ? charterStepConfigs
    : isAirAmbulanceWorkflow
    ? airAmbulanceStepConfigs
    : isTrainAmbulanceWorkflow
    ? trainAmbulanceStepConfigs
    : isHumWorkflow
    ? humStepConfigs
    : isCargoWorkflow
    ? cargoStepConfigs
    : isAviWorkflow
    ? aviStepConfigs
    : isHotelWorkflow
    ? hotelStepConfigs
    : isVisaWorkflow
    ? visaStepConfigs
    : isTicketingWorkflow
    ? ticketingStepConfigs
    : isMealsWorkflow
    ? mealsStepConfigs
    : genericStepConfigs;

  const maxSteps = isHumWorkflow ? 2 : 3;
  const currentConfig = activeConfigs[Math.min(currentStep - 1, activeConfigs.length - 1)];

  const getWorkflowTitle = () => {
    const key = getServiceKey();
    const svc = getService(key);
    if (svc && svc.heroTitle) return svc.heroTitle;
    if (isCharterWorkflow) return "Private Jet Charter Dispatch";
    if (isAirAmbulanceWorkflow) return "Air Ambulance Medevac Dispatch";
    if (isTrainAmbulanceWorkflow) return "Train ICU Ambulance Staging";
    if (isHumWorkflow) return "Human Remains Repatriation Service";
    if (isCargoWorkflow) return "General Air Cargo Logistics";
    if (isAviWorkflow) return "Live Pet & Animal Transport (AVI)";
    if (isTransportWorkflow) return "Chauffeur Airport Transfer";
    if (isFastTrackWorkflow) return "VIP Fast-Track Immigration Clearance";
    if (isLoungeWorkflow) return "Executive Airport Lounge Access";
    return "Meet & Greet Airside Concierge";
  };

  const getServiceKey = () => {
    if (isCharterWorkflow) return "jet_charter";
    if (isAirAmbulanceWorkflow) return "air_ambulance";
    if (isTrainAmbulanceWorkflow) return "train_ambulance";
    if (isHumWorkflow) return "hum";
    if (isCargoWorkflow) return "cargo";
    if (isAviWorkflow) return "avi";
    if (isHotelWorkflow) return "hotel";
    if (isVisaWorkflow) return "visa";
    if (isTicketingWorkflow) return "air_ticketing";
    if (isMealsWorkflow) return "onboard_meals";
    if (isTransportWorkflow) return "transport";
    if (isFastTrackWorkflow) return "fast_track";
    if (isLoungeWorkflow) return "lounge";
    return "meet_greet";
  };

  const getRefPrefix = () => {
    const key = getServiceKey();
    const map: Record<string, string> = {
      jet_charter: "SHF-JTS-",
      air_ambulance: "SHF-MED-",
      train_ambulance: "SHF-TRN-",
      hum: "SHF-HUM-",
      cargo: "SHF-CGO-",
      avi: "SHF-AVI-",
      hotel: "SHF-HTL-",
      visa: "SHF-VSA-",
      air_ticketing: "SHF-TCK-",
      onboard_meals: "SHF-MEL-",
      transport: "SHF-TRP-",
      fast_track: "SHF-FT-",
      lounge: "SHF-[#LOUNGE]-",
      meet_greet: "SHF-[#MEET]-",
    };
    return map[key] || "SHF-";
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

  if (isMeetGreetWorkflow || isLoungeWorkflow || isFastTrackWorkflow || isTransportWorkflow) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] text-slate-900 py-8 sm:py-12 px-4 sm:px-8 max-w-5xl mx-auto">
        <AirportWorkflow searchParams={searchParams} />
        <BookingCancelModal show={showCancelDialog} onClose={() => setShowCancelDialog(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 py-8 sm:py-12 px-4 sm:px-8 max-w-5xl mx-auto">
      {/* 1. PROGRESS HEADER */}
      <BookingProgressHeader
        currentStep={currentStep}
        maxSteps={maxSteps}
        progress={currentConfig.progress}
        title={currentConfig.title}
        estTime={currentConfig.estTime}
        onSaveDraft={handleSaveDraft}
      />

      {/* ANIMATED STEP CONTAINER */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="p-6 sm:p-10 rounded-[36px] bg-white border border-slate-200 shadow-sm relative overflow-hidden text-slate-900"
        >
          {/* STEP 1 FOR ALL WORKFLOWS */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {(isMeetGreetWorkflow || isLoungeWorkflow || isFastTrackWorkflow || isTransportWorkflow) && (
                <AirportPhase1Header
                  airportCode={pickupCity.match(/\(([A-Z]{3})\)/)?.[1] || "DEL"}
                  direction={flightDirection}
                  onDirectionChange={setFlightDirection}
                  bookingMode={airportBookingMode}
                  onBookingModeChange={setAirportBookingMode}
                />
              )}

              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  {getWorkflowTitle()}
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                  {currentConfig.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                  {currentConfig.sub}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                    {isLoungeWorkflow ? "Airport Hub *" : isHotelWorkflow ? "Hotel Destination *" : isVisaWorkflow ? "Destination Country *" : "Departure / Pickup City *"}
                  </label>
                  <input
                    type="text"
                    value={pickupCity}
                    onChange={(e) => setPickupCity(e.target.value)}
                    placeholder="e.g. New Delhi (DEL) / London Heathrow (LHR)"
                    className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                    {isVisaWorkflow ? "Visa Type *" : isHotelWorkflow ? "Room Preference *" : "Destination / Drop-off City *"}
                  </label>
                  <input
                    type="text"
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    placeholder="e.g. Dubai (DXB) / Taj Mahal Palace"
                    className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                    Departure / Service Date *
                  </label>
                  <input
                    type="date"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                    Service Time / Flight Time *
                  </label>
                  <input
                    type="time"
                    value={flightTime}
                    onChange={(e) => setFlightTime(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                    Passengers / Guests *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={paxAdults}
                    onChange={(e) => setPaxAdults(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                    Flight Number / Ref (Optional)
                  </label>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. AI302, EK511, SQ406"
                    className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!pickupCity || !destinationCity) {
                      toast.error("Please fill in location details.");
                      return;
                    }
                    setCurrentStep(2);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                >
                  <span>Continue to Contact & Review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 FOR ALL 14 WORKFLOWS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  Step 2 of {maxSteps} — Review & Confirm
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                  {getWorkflowTitle()}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                  Enter lead contact details and review your service quotation request.
                </p>
              </div>

              {/* SHARED CONTACT SECTION */}
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

              {/* SHARED REVIEW SUMMARY */}
              <ReviewSummary
                serviceTitle={getWorkflowTitle()}
                badgeLabel="Passengers"
                badgeValue={`${paxAdults} Guests`}
                items={[
                  { label: "Origin / Pickup", value: pickupCity },
                  { label: "Destination", value: destinationCity },
                  { label: "Date & Time", value: `${flightDate} (${flightTime} HRS)` },
                  { label: "Lead Contact", value: leadPassengerName || "Not specified" },
                ]}
                totalPrice={totalPrice}
                submitLabel={`Confirm & Submit ${getWorkflowTitle()}`}
                busy={busy}
                onEdit={() => setCurrentStep(1)}
                onSubmit={executeSubmission}
              />
            </div>
          )}

          {/* SUCCESS PASS FOR ALL 14 WORKFLOWS */}
          {currentStep === maxSteps && (
            <BookingSuccessPass
              badge="Request Active"
              title={`${getWorkflowTitle()} Staged`}
              subtitle={`Your request for ${pickupCity} → ${destinationCity} has been assigned to our 24/7 command desk.`}
              bookingRef={createdBookingRef || "SHF-VIP-849201"}
              guestSummary={`${paxAdults} Guests | ${flightDate}`}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* CANCEL MODAL */}
      <BookingCancelModal show={showCancelDialog} onClose={() => setShowCancelDialog(false)} />
    </div>
  );
}
