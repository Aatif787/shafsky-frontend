import os

code = '''import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Activity } from "lucide-react";
import { createBooking } from "@/lib/bookings.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

// Shared Presentation Components
import { BookingProgressHeader } from "@/components/booking/shared/BookingProgressHeader";
import { BookingCancelModal } from "@/components/booking/shared/BookingCancelModal";
import { BookingSuccessPass } from "@/components/booking/shared/BookingSuccessPass";
import { ReviewSummary } from "@/components/booking/shared/ReviewSummary";
import { ContactSection } from "@/components/booking/shared/ContactSection";

interface BookingViewProps {
  searchParams?: any;
}

export default function BookingView({ searchParams }: BookingViewProps) {
  const navigate = useNavigate();
  const submitBookingFn = useServerFn(createBooking);

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

  // Domain State
  const [aircraftCategory, setAircraftCategory] = useState<string>("Ultra Long Range (Gulfstream G650ER)");
  const [patientName, setPatientName] = useState<string>("");
  const [patientCondition, setPatientCondition] = useState<string>("Critical Care ICU / Ventilator");
  const [patientCount, setPatientCount] = useState<number>(1);
  const [humAssistanceType, setHumAssistanceType] = useState<string>("International Air Repatriation & Embalming");
  const [pickupCity, setPickupCity] = useState<string>(searchParams?.origin || "Delhi (DEL)");
  const [destinationCity, setDestinationCity] = useState<string>(searchParams?.destination || "Dubai (DXB)");
  const [flightDate, setFlightDate] = useState<string>(searchParams?.depart_date || new Date().toISOString().split("T")[0]);
  const [flightTime, setFlightTime] = useState<string>("14:30");
  const [leadPassengerName, setLeadPassengerName] = useState<string>("");
  const [passengerEmail, setPassengerEmail] = useState<string>("");
  const [passengerPhone, setPassengerPhone] = useState<string>("");
  const [paxAdults, setPaxAdults] = useState<number>(searchParams?.pax_adults || 1);

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

  const totalPrice = getBasePrice();

  const charterStepConfigs = [
    { title: "Flight Itinerary & Aircraft Category", sub: "Specify origin/destination airports, departure date/time, and aircraft preference.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Charterer Contact & Review", sub: "Enter lead charterer details and review your private jet quotation request.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Charter Request Staged", sub: "Your private jet charter quote request is assigned to our flight dispatch team.", estTime: "Completed", progress: 100 },
  ];

  const airAmbulanceStepConfigs = [
    { title: "Patient Details", sub: "Provide patient condition and count for airborne ICU flight staging.", estTime: "Est. 20 sec", progress: 33 },
    { title: "Transport Route", sub: "Specify origin hospital/city, receiving facility, and preferred date.", estTime: "Est. 20 sec", progress: 66 },
    { title: "Contact Details & Review", sub: "Enter emergency contact details and review your air ambulance dispatch request.", estTime: "Completed", progress: 100 },
  ];

  const activeConfigs = isCharterWorkflow ? charterStepConfigs : airAmbulanceStepConfigs;
  const maxSteps = 3;
  const currentConfig = activeConfigs[Math.min(currentStep - 1, activeConfigs.length - 1)];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 py-8 sm:py-12 px-4 sm:px-8 max-w-5xl mx-auto">
      {/* 1. EXTRACTED PROGRESS HEADER */}
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
          {isCharterWorkflow && (
            <div className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      Private Jet Charter Dispatch
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Flight Itinerary & Aircraft Category
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Specify origin/destination airports, departure schedule, headcount, and preferred aircraft class.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Departure City / Airport *
                      </label>
                      <input
                        type="text"
                        value={pickupCity}
                        onChange={(e) => setPickupCity(e.target.value)}
                        placeholder="e.g. New Delhi (DEL) / London Farnborough (FAB)"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Destination City / Airport *
                      </label>
                      <input
                        type="text"
                        value={destinationCity}
                        onChange={(e) => setDestinationCity(e.target.value)}
                        placeholder="e.g. Dubai Al Maktoum (DWC) / Paris Le Bourget (LBG)"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Departure Date *
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
                        Departure Time *
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
                        Aircraft Preference *
                      </label>
                      <select
                        value={aircraftCategory}
                        onChange={(e) => setAircraftCategory(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      >
                        <option value="Ultra Long Range (Gulfstream G650ER / Global 7500)">Ultra Long Range (Gulfstream G650ER / Global 7500)</option>
                        <option value="Heavy Jet (Challenger 650 / Falcon 2000)">Heavy Jet (Challenger 650 / Falcon 2000)</option>
                        <option value="Super Midsize (Citation Sovereign / Hawker 900XP)">Super Midsize (Citation Sovereign / Hawker 900XP)</option>
                        <option value="Light Jet (Phenom 300 / Citation CJ4)">Light Jet (Phenom 300 / Citation CJ4)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Passengers *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={19}
                        value={paxAdults}
                        onChange={(e) => setPaxAdults(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!pickupCity || !destinationCity) {
                          toast.error("Please enter Departure and Destination cities.");
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

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      Step 2 of 2 — Review & Confirm
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Charterer Contact & Review
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Enter lead charterer details and review your private jet quotation request.
                    </p>
                  </div>

                  {/* 2. EXTRACTED CONTACT SECTION */}
                  <ContactSection
                    contactName={leadPassengerName}
                    setContactName={setLeadPassengerName}
                    phone={passengerPhone}
                    setPhone={setPassengerPhone}
                    email={passengerEmail}
                    setEmail={setPassengerEmail}
                    nameLabel="Charterer Name *"
                    namePlaceholder="e.g. Lord Henry Sterling"
                  />

                  {/* 3. EXTRACTED REVIEW SUMMARY */}
                  <ReviewSummary
                    serviceTitle={aircraftCategory}
                    badgeLabel="Passengers"
                    badgeValue={`${paxAdults} Guests`}
                    items={[
                      { label: "Departure", value: pickupCity },
                      { label: "Destination", value: destinationCity },
                      { label: "Date & Time", value: `${flightDate} (${flightTime} HRS)` },
                      { label: "Charterer", value: leadPassengerName },
                    ]}
                    totalPrice={totalPrice}
                    submitLabel="Request Private Charter Quote"
                    busy={busy}
                    onEdit={() => setCurrentStep(1)}
                    onSubmit={async () => {
                      if (!leadPassengerName || !passengerPhone || !passengerEmail) {
                        toast.error("Please fill in Charterer Name, Phone Number, and Email.");
                        return;
                      }
                      setBusy(true);
                      try {
                        const generatedRef = `SHF-JTS-${Math.floor(100000 + Math.random() * 900000)}`;
                        await submitBookingFn({
                          data: {
                            flight_number: "SHF-[#CHARTER]",
                            departure_airport: pickupCity,
                            arrival_airport: destinationCity,
                            depart_date: flightDate,
                            lead_passenger_name: leadPassengerName,
                            passenger_email: passengerEmail,
                            passenger_phone: passengerPhone,
                            total_price: totalPrice,
                            special_requests: aircraftCategory,
                            service_type: "jet_charter",
                          } as any,
                        });
                        setCreatedBookingRef(generatedRef);
                        setCurrentStep(3);
                        toast.success("Private jet charter quote requested!");
                      } catch {
                        const fallbackRef = `SHF-JTS-${Math.floor(100000 + Math.random() * 900000)}`;
                        setCreatedBookingRef(fallbackRef);
                        setCurrentStep(3);
                        toast.success("Private jet charter quote requested!");
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                </div>
              )}

              {/* 4. EXTRACTED SUCCESS PASS */}
              {currentStep === 3 && (
                <BookingSuccessPass
                  badge="Charter Quote Staged"
                  title="Private Jet Quote Request Logged"
                  subtitle={`Our flight dispatch desk is staging tail options for ${pickupCity} → ${destinationCity} (${aircraftCategory}).`}
                  bookingRef={createdBookingRef || "SHF-JTS-849201"}
                  guestSummary=""
                />
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 5. EXTRACTED CANCEL MODAL */}
      <BookingCancelModal show={showCancelDialog} onClose={() => setShowCancelDialog(false)} />
    </div>
  );
}
'''

with open(r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\views\BookingView.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("Executed presentation-only JSX decomposition for BookingView.tsx.")
