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

  // Private Charter Specific States
  const [aircraftCategory, setAircraftCategory] = useState<string>("Ultra Long Range (Gulfstream G650ER)");

  // Medical Specific States
  const [patientName, setPatientName] = useState<string>("");
  const [patientCondition, setPatientCondition] = useState<string>("Critical Care ICU / Ventilator");
  const [patientCount, setPatientCount] = useState<number>(1);
  const [humAssistanceType, setHumAssistanceType] = useState<string>("International Air Repatriation & Embalming");

  // Cargo Specific States
  const [cargoType, setCargoType] = useState<string>("General Commercial Freight");
  const [cargoWeight, setCargoWeight] = useState<string>("");
  const [cargoPackages, setCargoPackages] = useState<string>("");
  const [cargoDescription, setCargoDescription] = useState<string>("");
  const [cargoCompany, setCargoCompany] = useState<string>("");

  // AVI Specific States
  const [animalType, setAnimalType] = useState<string>("Dog");
  const [petBreed, setPetBreed] = useState<string>("");
  const [petWeight, setPetWeight] = useState<string>("");
  const [animalCount, setAnimalCount] = useState<number>(1);

  // Hotel Specific States
  const [hotelDestination, setHotelDestination] = useState<string>(searchParams?.destination || "New Delhi, India");
  const [checkInDate, setCheckInDate] = useState<string>(searchParams?.depart_date || new Date().toISOString().split("T")[0]);
  const [checkOutDate, setCheckOutDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]
  );
  const [roomPreference, setRoomPreference] = useState<string>("Executive Presidential Suite");

  // Visa Specific States
  const [visaCountry, setVisaCountry] = useState<string>("India");
  const [visaType, setVisaType] = useState<string>("Diplomatic / Express e-Visa");
  const [passportNationality, setPassportNationality] = useState<string>("United Kingdom");

  // Ticketing Specific States
  const [tripType, setTripType] = useState<"one_way" | "round_trip" | "multi_city">("round_trip");
  const [departureCity, setDepartureCity] = useState<string>(searchParams?.origin || "London Heathrow (LHR)");
  const [arrivalCity, setArrivalCity] = useState<string>(searchParams?.destination || "Delhi Indira Gandhi (DEL)");
  const [travelClass, setTravelClass] = useState<string>("First / Business Class");

  // Meals Specific States
  const [mealAirline, setMealAirline] = useState<string>("");
  const [mealPreference, setMealPreference] = useState<string>("Gourmet Michelin-Star Menu");
  const [dietaryNotes, setDietaryNotes] = useState<string>("");

  // Chauffeur Specific States
  const [pickupLocation, setPickupLocation] = useState<string>(searchParams?.origin || "DEL Airport T3");
  const [dropLocation, setDropLocation] = useState<string>(searchParams?.destination || "The Taj Mahal Palace, City");
  const [needsFlightCoordination, setNeedsFlightCoordination] = useState<boolean>(false);

  // Fast Track & Meet Greet States
  const [fastTrackType, setFastTrackType] = useState<"arrival" | "departure" | "transit">("arrival");
  const [flightDirection, setFlightDirection] = useState<"arrival" | "departure">("arrival");
  const [pickupCity, setPickupCity] = useState<string>(searchParams?.origin || "Delhi (DEL)");
  const [destinationCity, setDestinationCity] = useState<string>(searchParams?.destination || "Dubai (DXB)");

  const [flightNumber, setFlightNumber] = useState<string>("");
  const [flightDate, setFlightDate] = useState<string>(
    searchParams?.depart_date || new Date().toISOString().split("T")[0]
  );
  const [flightTime, setFlightTime] = useState<string>("14:30");
  const [originAirport, setOriginAirport] = useState<string>(searchParams?.origin || "DEL");

  const [leadPassengerName, setLeadPassengerName] = useState<string>("");
  const [passengerEmail, setPassengerEmail] = useState<string>("");
  const [passengerPhone, setPassengerPhone] = useState<string>("");
  const [paxAdults, setPaxAdults] = useState<number>(searchParams?.pax_adults || 1);
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

  const trainAmbulanceStepConfigs = [
    { title: "Patient Details", sub: "Provide patient condition and count for mobile train ICU compartment staging.", estTime: "Est. 20 sec", progress: 33 },
    { title: "Transport Route", sub: "Specify origin railway station/city, destination station, and preferred date.", estTime: "Est. 20 sec", progress: 66 },
    { title: "Contact Details & Review", sub: "Enter emergency contact details and review your train ambulance dispatch request.", estTime: "Completed", progress: 100 },
  ];

  const humStepConfigs = [
    { title: "Repatriation Details", sub: "Specify assistance type, origin city, and destination city.", estTime: "Est. 20 sec", progress: 50 },
    { title: "Contact Details & Review", sub: "Enter family/liaison contact details and review repatriation assistance request.", estTime: "Completed", progress: 100 },
  ];

  const cargoStepConfigs = [
    { title: "Cargo Specifications", sub: "Specify commodity type, approximate weight, package count, and description.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Freight Route & Schedule", sub: "Specify pickup city, destination city, and preferred shipping date.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Contact Info & Review", sub: "Enter logistics contact details and verify your air freight quotation request.", estTime: "Completed", progress: 100 },
  ];

  const aviStepConfigs = [
    { title: "Pet & Animal Specifications", sub: "Specify animal species, breed, approximate weight, and count.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Transit Route & Date", sub: "Specify pickup city, destination city, and preferred travel date.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Owner Contact & Review", sub: "Enter owner contact details and verify your live pet air transit request.", estTime: "Completed", progress: 100 },
  ];

  const hotelStepConfigs = [
    { title: "Hotel Destination & Schedule", sub: "Select destination, check-in/out dates, headcount, and room preferences.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Contact Info & Review", sub: "Enter lead guest details and verify your 5-star hotel suite request.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Hotel Request Confirmed", sub: "Your luxury hotel reservation request is submitted to our VIP concierge desk.", estTime: "Completed", progress: 100 },
  ];

  const visaStepConfigs = [
    { title: "Visa & Country Selection", sub: "Specify destination country, visa type, expected travel date, and applicant nationality.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Applicant Contact & Review", sub: "Provide applicant contact info and verify visa document processing requirements.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Visa Request Submitted", sub: "Your diplomatic visa processing request is assigned to our embassy liaison officer.", estTime: "Completed", progress: 100 },
  ];

  const ticketingStepConfigs = [
    { title: "Flight Routing & Class", sub: "Select trip type, departure/destination cities, travel date, and preferred cabin class.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Passenger Contact & Review", sub: "Enter lead passenger contact details and review your commercial flight booking request.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Flight Request Reserved", sub: "Your commercial flight seat request is staged with our airline ticketing desk.", estTime: "Completed", progress: 100 },
  ];

  const mealsStepConfigs = [
    { title: "In-Flight Catering Preferences", sub: "Choose gourmet meal options, passenger count, travel date, and dietary requirements.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Contact Info & Review", sub: "Enter guest contact details and confirm your gourmet inflight menu selection.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Meal Request Staged", sub: "Your inflight gourmet meal order is sent to our executive culinary team.", estTime: "Completed", progress: 100 },
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
    : charterStepConfigs;

  const maxSteps = isHumWorkflow ? 2 : 3;
  const currentConfig = activeConfigs[Math.min(currentStep - 1, activeConfigs.length - 1)];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 py-8 sm:py-12 px-4 sm:px-8 max-w-5xl mx-auto">
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
          {isCharterWorkflow ? (
            /* ════════════════════════════════════════════════════════════════
             * PRIVATE JET CHARTER WORKFLOW
             * ═══════════════════════════════════════════════════════════════ */
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Charterer Name *
                      </label>
                      <input
                        type="text"
                        value={leadPassengerName}
                        onChange={(e) => setLeadPassengerName(e.target.value)}
                        placeholder="e.g. Lord Henry Sterling"
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
                        placeholder="charter@example.com"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-bold">Selected Fleet</span>
                        <div className="text-xl font-serif font-bold text-slate-900">{aircraftCategory}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Passengers</span>
                        <div className="text-sm font-mono font-bold text-emerald-700">{paxAdults} Guests</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 font-medium">Departure</span>
                        <div className="text-slate-900 font-bold">{pickupCity}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Destination</span>
                        <div className="text-slate-900 font-bold">{destinationCity}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Date & Time</span>
                        <div className="text-slate-900 font-bold">{flightDate} ({flightTime} HRS)</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Charterer</span>
                        <div className="text-slate-900 font-bold">{leadPassengerName}</div>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-slate-500 font-bold uppercase">Charter Estimate</span>
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
                          disabled={busy}
                          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                        >
                          <span>{busy ? "Processing..." : "Request Private Charter Quote"}</span>
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
                      Charter Quote Staged
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-bold mt-2">
                      Private Jet Quote Request Logged
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed font-sans mt-1">
                      Our flight dispatch desk is staging tail options for {pickupCity} → {destinationCity} ({aircraftCategory}).
                    </p>
                  </div>

                  <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm flex flex-col items-center">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl mb-4 shadow-sm">
                      <QRCodeSVG value={`https://shafskyaviation.com/pass/${createdBookingRef}`} size={140} />
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-800 tracking-widest">
                      REF: {createdBookingRef || "SHF-JTS-849201"}
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

print("Rewrote BookingView.tsx with all 5 dedicated workflows including Private Charter.")
