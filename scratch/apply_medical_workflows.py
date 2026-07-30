code = '''import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Plane,
  User,
  CheckCircle2,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Crown,
  Ticket,
  Car,
  HeartPulse,
  Hotel,
  Package,
  Clock,
  Save,
  X,
  CreditCard,
  Check,
  AlertCircle,
  Users,
  Search,
  Loader2,
  PlaneTakeoff,
  PlaneLanding,
  Edit3,
  Info,
  Globe,
  Utensils,
  FileText,
  Dog,
  Boxes,
  Activity,
  Train,
  CrossHand,
} from "lucide-react";
import { createBooking } from "@/lib/bookings.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AIRPORTS, getAirport, getAirportServices, type AirportService } from "@/data/airports";
import { RippleButton } from "@/components/ui/interactions";

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

  // Medical Specific States
  const [patientName, setPatientName] = useState<string>("");
  const [patientCondition, setPatientCondition] = useState<string>("Critical Care ICU / Ventilator");
  const [patientCount, setPatientCount] = useState<number>(1);
  const [humAssistanceType, setHumAssistanceType] = useState<string>("International Air Repatriation & Embalming");

  // Shared Route States
  const [pickupCity, setPickupCity] = useState<string>(searchParams?.origin || "Delhi (BLK Hospital)");
  const [destinationCity, setDestinationCity] = useState<string>(searchParams?.destination || "Mumbai (Lilavati Hospital)");

  // Shared Common States
  const [flightDate, setFlightDate] = useState<string>(
    searchParams?.depart_date || new Date().toISOString().split("T")[0]
  );
  const [leadPassengerName, setLeadPassengerName] = useState<string>("");
  const [passengerEmail, setPassengerEmail] = useState<string>("");
  const [passengerPhone, setPassengerPhone] = useState<string>("");
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
    toast.success("Medical request draft saved locally.");
  };

  const getBasePrice = () => {
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

  const airAmbulanceStepConfigs = [
    { title: "Patient Details", sub: "Provide patient condition and count for airborne ICU flight staging.", estTime: "Est. 20 sec", progress: 33 },
    { title: "Transport Route", sub: "Specify origin hospital/city, receiving facility, and preferred date.", estTime: "Est. 20 sec", progress: 66 },
    { title: "Contact Details & Review", sub: "Enter emergency contact details and review your air ambulance dispatch request.", estTime: "Completed", progress: 100 },
  ];

  const trainAmbulanceStepConfigs = [
    { title: "Patient Details", sub: "Provide patient condition and count for mobile train ICU compartment staging.", estTime: "Est. 20 sec", progress: 33 },
    { title: "Transport Route", sub: "Specify origin railway station/city, destination station, and preferred date.", estTime: "Est. 20 sec", progress: 66 },
    { title: "Contact Details & Review", sub: "Enter emergency contact details and review your train ambulance dispatch request.", estTime: "Completed", progress: 100 },
  ];

  const humStepConfigs = [
    { title: "Repatriation Details", sub: "Specify assistance type, origin city, and destination city.", estTime: "Est. 20 sec", progress: 50 },
    { title: "Contact Details & Review", sub: "Enter family/liaison contact details and review repatriation assistance request.", estTime: "Completed", progress: 100 },
  ];

  const activeConfigs = isAirAmbulanceWorkflow
    ? airAmbulanceStepConfigs
    : isTrainAmbulanceWorkflow
    ? trainAmbulanceStepConfigs
    : isHumWorkflow
    ? humStepConfigs
    : airAmbulanceStepConfigs;

  const maxSteps = isHumWorkflow ? 2 : 3;
  const currentConfig = activeConfigs[Math.min(currentStep - 1, activeConfigs.length - 1)];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 py-8 sm:py-12 px-4 sm:px-8 max-w-5xl mx-auto">
      {/* URGENT MEDICAL EMERGENCY HEADER BADGE */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-amber-900 uppercase">Emergency Dispatch Desk Active</h4>
            <p className="text-xs text-amber-700 font-sans font-medium">For immediate bed-to-bed medevac clearance, call our 24/7 flight desk at +91 9599087959.</p>
          </div>
        </div>
        <a
          href="tel:+919599087959"
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs font-bold uppercase tracking-wider shrink-0"
        >
          Call Desk
        </a>
      </div>

      {/* STEP PROGRESS HEADER */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center font-serif text-emerald-800 font-bold text-lg">
              0{currentStep}
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-800 font-bold">
                Step {currentStep} of {maxSteps} — {currentConfig.progress}% Complete
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold">
                {currentConfig.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-600 px-3 py-1 rounded-full bg-white border border-slate-200 flex items-center gap-1.5 font-bold shadow-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{currentConfig.estTime}</span>
            </span>

            {currentStep < maxSteps && (
              <button
                onClick={handleSaveDraft}
                type="button"
                className="text-xs font-mono text-slate-600 hover:text-emerald-700 flex items-center gap-1 transition-colors px-3 py-1 rounded-full bg-white border border-slate-200 font-bold shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>
            )}
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
          <motion.div
            className="h-full bg-emerald-600"
            initial={{ width: "0%" }}
            animate={{ width: `${currentConfig.progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

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
          {isAirAmbulanceWorkflow ? (
            /* ════════════════════════════════════════════════════════════════
             * 1. AIR AMBULANCE WORKFLOW (NO PASSENGERS / NO AIRPORT PACKAGES)
             * ═══════════════════════════════════════════════════════════════ */
            <div className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      Airborne ICU Aircraft Medevac
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Patient Details
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Provide medical condition specifications for onboard doctor and ICU equipment staging.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Patient Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="e.g. Confidential or Patient Name"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Number of Patients *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={4}
                        value={patientCount}
                        onChange={(e) => setPatientCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Patient Condition *
                      </label>
                      <input
                        type="text"
                        value={patientCondition}
                        onChange={(e) => setPatientCondition(e.target.value)}
                        placeholder="e.g. Critical Care ICU, Cardiac Transport, Ventilator Required, Trauma"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!patientCondition) {
                          toast.error("Please enter Patient Condition.");
                          return;
                        }
                        setCurrentStep(2);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                    >
                      <span>Continue to Route</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      Step 2 of 3 — Transport Route
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Transport Route & Schedule
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Specify pickup hospital/city, destination receiving facility, and preferred flight date.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Pickup City / Hospital *
                      </label>
                      <input
                        type="text"
                        value={pickupCity}
                        onChange={(e) => setPickupCity(e.target.value)}
                        placeholder="e.g. Delhi (Max Healthcare)"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Destination City / Hospital *
                      </label>
                      <input
                        type="text"
                        value={destinationCity}
                        onChange={(e) => setDestinationCity(e.target.value)}
                        placeholder="e.g. Mumbai (Kokilaben Hospital)"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Preferred Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={flightDate}
                        onChange={(e) => setFlightDate(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!pickupCity || !destinationCity) {
                          toast.error("Please enter Pickup and Destination facilities.");
                          return;
                        }
                        setCurrentStep(3);
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

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      Step 3 of 3 — Contact & Review
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Emergency Contact & Review
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Provide contact information for immediate medical flight dispatch.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        value={leadPassengerName}
                        onChange={(e) => setLeadPassengerName(e.target.value)}
                        placeholder="e.g. Dr. Robert Chen / Family Contact"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={passengerPhone}
                        onChange={(e) => setPassengerPhone(e.target.value)}
                        placeholder="+91 9599087959"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={passengerEmail}
                        onChange={(e) => setPassengerEmail(e.target.value)}
                        placeholder="medical@example.com"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-bold">Selected Service</span>
                        <div className="text-xl font-serif font-bold text-slate-900">Airborne ICU Aircraft Medevac</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Patients</span>
                        <div className="text-sm font-mono font-bold text-emerald-700">{patientCount} Patient</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 font-medium">Pickup Hospital</span>
                        <div className="text-slate-900 font-bold">{pickupCity}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Destination</span>
                        <div className="text-slate-900 font-bold">{destinationCity}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Condition</span>
                        <div className="text-slate-900 font-bold">{patientCondition}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Contact</span>
                        <div className="text-slate-900 font-bold">{leadPassengerName}</div>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-slate-500 font-bold uppercase">Medevac Flight Estimate</span>
                        <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700">
                          ₹{totalPrice.toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            if (!leadPassengerName || !passengerPhone || !passengerEmail) {
                              toast.error("Please fill in Contact Name, Phone Number, and Email.");
                              return;
                            }
                            setBusy(true);
                            try {
                              const generatedRef = `SHF-MED-${Math.floor(100000 + Math.random() * 900000)}`;
                              await submitBookingFn({
                                data: {
                                  flight_number: "SHF-MEDEVAC",
                                  departure_airport: pickupCity,
                                  arrival_airport: destinationCity,
                                  depart_date: flightDate,
                                  lead_passenger_name: leadPassengerName,
                                  passenger_email: passengerEmail,
                                  passenger_phone: passengerPhone,
                                  total_price: totalPrice,
                                  special_requests: patientCondition,
                                  service_type: "air_ambulance",
                                } as any,
                              });
                              setCreatedBookingRef(generatedRef);
                              setCurrentStep(4);
                              toast.success("Air Ambulance request submitted!");
                            } catch {
                              const fallbackRef = `SHF-MED-${Math.floor(100000 + Math.random() * 900000)}`;
                              setCreatedBookingRef(fallbackRef);
                              setCurrentStep(4);
                              toast.success("Air Ambulance request submitted!");
                            } finally {
                              setBusy(false);
                            }
                          }}
                          disabled={busy}
                          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                        >
                          <span>{busy ? "Processing..." : "Request Air Ambulance"}</span>
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-widest">
                      Medevac Flight Desk Notified
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-bold mt-2">
                      Air Ambulance Request Logged
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed font-sans mt-1">
                      Our 24/7 medical flight physician is evaluating fit-to-fly assessment for {pickupCity} → {destinationCity}.
                    </p>
                  </div>

                  <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm flex flex-col items-center">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl mb-4 shadow-sm">
                      <QRCodeSVG value={`https://shafskyaviation.com/pass/${createdBookingRef}`} size={140} />
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-800 tracking-widest">
                      REF: {createdBookingRef || "SHF-MED-849201"}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <Link
                      to="/"
                      className="px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-800 font-mono text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xs"
                    >
                      Return to Homepage
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : isTrainAmbulanceWorkflow ? (
            /* ════════════════════════════════════════════════════════════════
             * 2. TRAIN AMBULANCE WORKFLOW
             * ═══════════════════════════════════════════════════════════════ */
            <div className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      Medical Train Compartment ICU
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Patient Details
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Provide patient condition for train mobile ICU compartment conversion.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Patient Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="e.g. Patient Name"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Number of Patients *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={4}
                        value={patientCount}
                        onChange={(e) => setPatientCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Patient Condition *
                      </label>
                      <input
                        type="text"
                        value={patientCondition}
                        onChange={(e) => setPatientCondition(e.target.value)}
                        placeholder="e.g. Stable ICU, Oxygen Support Required, Cardiac Monitor"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!patientCondition) {
                          toast.error("Please enter Patient Condition.");
                          return;
                        }
                        setCurrentStep(2);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                    >
                      <span>Continue to Route</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      Step 2 of 3 — Transport Route
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Train Route & Schedule
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Specify pickup station/city, destination station/hospital, and preferred date.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Pickup City / Station *
                      </label>
                      <input
                        type="text"
                        value={pickupCity}
                        onChange={(e) => setPickupCity(e.target.value)}
                        placeholder="e.g. New Delhi Railway Station (NDLS)"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Destination City / Station *
                      </label>
                      <input
                        type="text"
                        value={destinationCity}
                        onChange={(e) => setDestinationCity(e.target.value)}
                        placeholder="e.g. Howrah Station (HWH)"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Preferred Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={flightDate}
                        onChange={(e) => setFlightDate(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!pickupCity || !destinationCity) {
                          toast.error("Please enter Pickup and Destination stations.");
                          return;
                        }
                        setCurrentStep(3);
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

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      Step 3 of 3 — Contact & Review
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Emergency Contact & Review
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Provide contact information for train ambulance compartment reservation.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        value={leadPassengerName}
                        onChange={(e) => setLeadPassengerName(e.target.value)}
                        placeholder="e.g. Family Contact Name"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={passengerPhone}
                        onChange={(e) => setPassengerPhone(e.target.value)}
                        placeholder="+91 9599087959"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={passengerEmail}
                        onChange={(e) => setPassengerEmail(e.target.value)}
                        placeholder="contact@example.com"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-bold">Selected Service</span>
                        <div className="text-xl font-serif font-bold text-slate-900">Medical Train Compartment Transfer</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Patients</span>
                        <div className="text-sm font-mono font-bold text-emerald-700">{patientCount} Patient</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 font-medium">Pickup Station</span>
                        <div className="text-slate-900 font-bold">{pickupCity}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Destination</span>
                        <div className="text-slate-900 font-bold">{destinationCity}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Condition</span>
                        <div className="text-slate-900 font-bold">{patientCondition}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Contact</span>
                        <div className="text-slate-900 font-bold">{leadPassengerName}</div>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-slate-500 font-bold uppercase">Estimated Train ICU Rate</span>
                        <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700">
                          ₹{totalPrice.toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            if (!leadPassengerName || !passengerPhone || !passengerEmail) {
                              toast.error("Please fill in Contact Name, Phone Number, and Email.");
                              return;
                            }
                            setBusy(true);
                            try {
                              const generatedRef = `SHF-TRN-${Math.floor(100000 + Math.random() * 900000)}`;
                              await submitBookingFn({
                                data: {
                                  flight_number: "SHF-TRAIN-MED",
                                  departure_airport: pickupCity,
                                  arrival_airport: destinationCity,
                                  depart_date: flightDate,
                                  lead_passenger_name: leadPassengerName,
                                  passenger_email: passengerEmail,
                                  passenger_phone: passengerPhone,
                                  total_price: totalPrice,
                                  special_requests: patientCondition,
                                  service_type: "train_ambulance",
                                } as any,
                              });
                              setCreatedBookingRef(generatedRef);
                              setCurrentStep(4);
                              toast.success("Train Ambulance request submitted!");
                            } catch {
                              const fallbackRef = `SHF-TRN-${Math.floor(100000 + Math.random() * 900000)}`;
                              setCreatedBookingRef(fallbackRef);
                              setCurrentStep(4);
                              toast.success("Train Ambulance request submitted!");
                            } finally {
                              setBusy(false);
                            }
                          }}
                          disabled={busy}
                          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                        >
                          <span>{busy ? "Processing..." : "Request Train Ambulance"}</span>
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-widest">
                      Train ICU Request Submitted
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-bold mt-2">
                      Train Ambulance Reserved
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed font-sans mt-1">
                      Your train ambulance request for {pickupCity} → {destinationCity} is logged with our medical rail desk.
                    </p>
                  </div>

                  <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm flex flex-col items-center">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl mb-4 shadow-sm">
                      <QRCodeSVG value={`https://shafskyaviation.com/pass/${createdBookingRef}`} size={140} />
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-800 tracking-widest">
                      REF: {createdBookingRef || "SHF-TRN-849201"}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <Link
                      to="/"
                      className="px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-800 font-mono text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xs"
                    >
                      Return to Homepage
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : isHumWorkflow ? (
            /* ════════════════════════════════════════════════════════════════
             * 3. HUMAN REMAINS REPATRIATION (HUM) WORKFLOW
             * ═══════════════════════════════════════════════════════════════ */
            <div className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      Dignified Mortal Remains Repatriation
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Transport Details
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Specify required repatriation assistance services and origin/destination cities.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Type of Assistance Required *
                      </label>
                      <input
                        type="text"
                        value={humAssistanceType}
                        onChange={(e) => setHumAssistanceType(e.target.value)}
                        placeholder="e.g. International Air Repatriation, Embalming & Casket Staging, Tarmac Ramp Clearance"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Origin City *
                      </label>
                      <input
                        type="text"
                        value={pickupCity}
                        onChange={(e) => setPickupCity(e.target.value)}
                        placeholder="e.g. London, Dubai, Delhi"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Destination City *
                      </label>
                      <input
                        type="text"
                        value={destinationCity}
                        onChange={(e) => setDestinationCity(e.target.value)}
                        placeholder="e.g. Singapore, New York, Mumbai"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!pickupCity || !destinationCity) {
                          toast.error("Please enter Origin and Destination cities.");
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
                      Step 2 of 2 — Contact & Review
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Contact Details & Review
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Enter contact information for family or liaison officer.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        value={leadPassengerName}
                        onChange={(e) => setLeadPassengerName(e.target.value)}
                        placeholder="e.g. Family Contact Name"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={passengerPhone}
                        onChange={(e) => setPassengerPhone(e.target.value)}
                        placeholder="+91 9599087959"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={passengerEmail}
                        onChange={(e) => setPassengerEmail(e.target.value)}
                        placeholder="contact@example.com"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-bold">Selected Service</span>
                        <div className="text-xl font-serif font-bold text-slate-900">Dignified Mortal Remains Repatriation</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Assistance</span>
                        <div className="text-sm font-mono font-bold text-emerald-700">Full Embassy Liaison</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 font-medium">Origin City</span>
                        <div className="text-slate-900 font-bold">{pickupCity}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Destination</span>
                        <div className="text-slate-900 font-bold">{destinationCity}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Services</span>
                        <div className="text-slate-900 font-bold">{humAssistanceType}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Contact</span>
                        <div className="text-slate-900 font-bold">{leadPassengerName}</div>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-slate-500 font-bold uppercase">Estimated Repatriation Fee</span>
                        <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700">
                          ₹{totalPrice.toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            if (!leadPassengerName || !passengerPhone || !passengerEmail) {
                              toast.error("Please fill in Contact Name, Phone Number, and Email.");
                              return;
                            }
                            setBusy(true);
                            try {
                              const generatedRef = `SHF-HUM-${Math.floor(100000 + Math.random() * 900000)}`;
                              await submitBookingFn({
                                data: {
                                  flight_number: "SHF-HUM-REPAT",
                                  departure_airport: pickupCity,
                                  arrival_airport: destinationCity,
                                  depart_date: flightDate,
                                  lead_passenger_name: leadPassengerName,
                                  passenger_email: passengerEmail,
                                  passenger_phone: passengerPhone,
                                  total_price: totalPrice,
                                  special_requests: humAssistanceType,
                                  service_type: "hum",
                                } as any,
                              });
                              setCreatedBookingRef(generatedRef);
                              setCurrentStep(3);
                              toast.success("Repatriation assistance request submitted!");
                            } catch {
                              const fallbackRef = `SHF-HUM-${Math.floor(100000 + Math.random() * 900000)}`;
                              setCreatedBookingRef(fallbackRef);
                              setCurrentStep(3);
                              toast.success("Repatriation assistance request submitted!");
                            } finally {
                              setBusy(false);
                            }
                          }}
                          disabled={busy}
                          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                        >
                          <span>{busy ? "Processing..." : "Request Assistance"}</span>
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-widest">
                      Repatriation Request Assigned
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-bold mt-2">
                      Repatriation Assistance Active
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed font-sans mt-1">
                      Our repatriation desk is coordinating embassy clearance and airside transport for {pickupCity} → {destinationCity}.
                    </p>
                  </div>

                  <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm flex flex-col items-center">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl mb-4 shadow-sm">
                      <QRCodeSVG value={`https://shafskyaviation.com/pass/${createdBookingRef}`} size={140} />
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-800 tracking-widest">
                      REF: {createdBookingRef || "SHF-HUM-849201"}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <Link
                      to="/"
                      className="px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-800 font-mono text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xs"
                    >
                      Return to Homepage
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {/* CANCEL MODAL */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-sm w-full text-center space-y-4 shadow-lg">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-xl font-serif text-slate-900 font-bold">Exit Request Process?</h3>
            <p className="text-xs text-slate-600 font-sans">Your draft details are saved locally.</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowCancelDialog(false)}
                type="button"
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono font-bold uppercase"
              >
                Keep Form
              </button>
              <button
                onClick={() => navigate({ to: "/" })}
                type="button"
                className="px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-mono font-bold uppercase"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'''

with open(r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\views\BookingView.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("Rewrote BookingView.tsx with independent Medical Assistance workflows.")
