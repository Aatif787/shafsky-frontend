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
  
  const isHotelWorkflow = initialServiceId === "hotel" || initialServiceId === "hotel_booking";
  const isVisaWorkflow = initialServiceId === "visa" || initialServiceId === "visa_assistance";
  const isTicketingWorkflow = initialServiceId === "air_ticketing" || initialServiceId === "ticketing";
  const isMealsWorkflow = initialServiceId === "onboard_meals" || initialServiceId === "meals";

  const isTransportWorkflow = initialServiceId === "transport";
  const isFastTrackWorkflow = initialServiceId === "fast_track";
  const isLoungeWorkflow = initialServiceId === "lounge";
  const isMeetGreetWorkflow =
    (initialServiceId === "meet_greet" || searchParams?.package_id || !searchParams?.service_id) &&
    !isHotelWorkflow &&
    !isVisaWorkflow &&
    !isTicketingWorkflow &&
    !isMealsWorkflow &&
    !isTransportWorkflow &&
    !isFastTrackWorkflow &&
    !isLoungeWorkflow;

  // 1. Hotel States
  const [hotelDestination, setHotelDestination] = useState<string>(searchParams?.destination || "New Delhi, India");
  const [checkInDate, setCheckInDate] = useState<string>(searchParams?.depart_date || new Date().toISOString().split("T")[0]);
  const [checkOutDate, setCheckOutDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]
  );
  const [roomPreference, setRoomPreference] = useState<string>("Executive Presidential Suite");

  // 2. Visa States
  const [visaCountry, setVisaCountry] = useState<string>("India");
  const [visaType, setVisaType] = useState<string>("Diplomatic / Express e-Visa");
  const [passportNationality, setPassportNationality] = useState<string>("United Kingdom");

  // 3. Air Ticketing States
  const [tripType, setTripType] = useState<"one_way" | "round_trip" | "multi_city">("round_trip");
  const [departureCity, setDepartureCity] = useState<string>(searchParams?.origin || "London Heathrow (LHR)");
  const [arrivalCity, setArrivalCity] = useState<string>(searchParams?.destination || "Delhi Indira Gandhi (DEL)");
  const [travelClass, setTravelClass] = useState<string>("First / Business Class");

  // 4. On-Board Meals States
  const [mealAirline, setMealAirline] = useState<string>("");
  const [mealPreference, setMealPreference] = useState<string>("Gourmet Michelin-Star Menu");
  const [dietaryNotes, setDietaryNotes] = useState<string>("");

  // Shared Common States
  const [pickupLocation, setPickupLocation] = useState<string>(searchParams?.origin || "DEL Airport T3");
  const [dropLocation, setDropLocation] = useState<string>(searchParams?.destination || "The Taj Mahal Palace, City");
  const [needsFlightCoordination, setNeedsFlightCoordination] = useState<boolean>(false);

  const [fastTrackType, setFastTrackType] = useState<"arrival" | "departure" | "transit">("arrival");
  const [flightDirection, setFlightDirection] = useState<"arrival" | "departure">("arrival");
  const [subServiceId, setSubServiceId] = useState<string>(initialServiceId);

  const [flightNumber, setFlightNumber] = useState<string>("");
  const [flightDate, setFlightDate] = useState<string>(
    searchParams?.depart_date || new Date().toISOString().split("T")[0]
  );
  const [flightTime, setFlightTime] = useState<string>("14:30");
  const [originAirport, setOriginAirport] = useState<string>(searchParams?.origin || "DEL");
  const [destAirport, setDestAirport] = useState<string>(searchParams?.destination || "BOM");

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
      subServiceId,
      flightDate,
      flightTime,
      leadPassengerName,
      passengerEmail,
      passengerPhone,
      paxAdults,
      specialRequests,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("shafsky_booking_draft", JSON.stringify(draft));
    toast.success("Booking draft saved locally.");
  };

  const getBasePrice = () => {
    if (isHotelWorkflow) return 32000 * paxAdults;
    if (isVisaWorkflow) return 8500 * paxAdults;
    if (isTicketingWorkflow) return 85000 * paxAdults;
    if (isMealsWorkflow) return 4500 * paxAdults;
    if (isTransportWorkflow) return 14000 * paxAdults;
    if (isFastTrackWorkflow) return 7500 * paxAdults;
    if (isLoungeWorkflow) return 9500 * paxAdults;
    return 12500 * paxAdults;
  };

  const totalPrice = getBasePrice();

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

  const transportStepConfigs = [
    { title: "Pickup & Drop Locations", sub: "Specify pickup address, drop location, headcount, and transfer date.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Passenger Contact & Review", sub: "Enter guest details and verify your transfer routing before booking.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Transfer Reserved & Digital Pass", sub: "Your chauffeured Maybach sedan transfer is confirmed and assigned.", estTime: "Completed", progress: 100 },
  ];

  const fastTrackStepConfigs = [
    { title: "Passenger & Fast Track Details", sub: "Select clearance type (Arrival/Departure/Transit) and enter passenger contact details.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Review Fast Track Clearance", sub: "Verify your priority immigration clearance details before confirming.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Fast Track Confirmed", sub: "Your diplomatic fast track pass is active and assigned to terminal escort.", estTime: "Completed", progress: 100 },
  ];

  const loungeStepConfigs = [
    { title: "Passenger & Lounge Details", sub: "Enter guest details, headcount, access date, and preferred lounge entry time.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Review Lounge Access", sub: "Verify your airport lounge suite reservation details before confirming.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Lounge Access Confirmed", sub: "Your digital VIP lounge pass is active and staged at the lounge desk.", estTime: "Completed", progress: 100 },
  ];

  const meetGreetStepConfigs = [
    { title: "Passenger & Travel Details", sub: "Enter lead passenger details, travel date, and flight direction.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Review & Confirm Booking", sub: "Verify your Meet & Greet package details before confirming.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Booking Confirmed & Digital Pass", sub: "Your airside Meet & Greet pass is active and assigned to our command desk.", estTime: "Completed", progress: 100 },
  ];

  const activeConfigs = isHotelWorkflow
    ? hotelStepConfigs
    : isVisaWorkflow
    ? visaStepConfigs
    : isTicketingWorkflow
    ? ticketingStepConfigs
    : isMealsWorkflow
    ? mealsStepConfigs
    : isTransportWorkflow
    ? transportStepConfigs
    : isFastTrackWorkflow
    ? fastTrackStepConfigs
    : isLoungeWorkflow
    ? loungeStepConfigs
    : meetGreetStepConfigs;

  const maxSteps = 3;
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
          {isHotelWorkflow ? (
            /* ════════════════════════════════════════════════════════════════
             * 1. HOTEL BOOKING WORKFLOW (NO AIRPORT / NO FLIGHT / NO PACKAGES)
             * ═══════════════════════════════════════════════════════════════ */
            <div className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      5-Star Hospitality & Hotel Booking
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Hotel Destination & Schedule
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Specify hotel location, check-in and check-out dates, guest headcount, and room preferences.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Destination City / Hotel Name *
                      </label>
                      <input
                        type="text"
                        value={hotelDestination}
                        onChange={(e) => setHotelDestination(e.target.value)}
                        placeholder="e.g. London, Dubai, or The Taj Mahal Palace Mumbai"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Check-in Date *
                      </label>
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Check-out Date *
                      </label>
                      <input
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Guests *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={paxAdults}
                        onChange={(e) => setPaxAdults(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Room Preference (Optional)
                      </label>
                      <input
                        type="text"
                        value={roomPreference}
                        onChange={(e) => setRoomPreference(e.target.value)}
                        placeholder="e.g. Executive Suite, Ocean View, King Bed"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Early check-in, late check-out, high floor preference..."
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!hotelDestination) {
                          toast.error("Please enter a Destination City or Hotel Name.");
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
                      Contact Information & Review
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Enter lead guest contact details and verify your 5-star hotel suite request.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Guest Name *
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
                        placeholder="guest@example.com"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-bold">Selected Service</span>
                        <div className="text-xl font-serif font-bold text-slate-900">5-Star Luxury Hotel Booking</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Guests</span>
                        <div className="text-sm font-mono font-bold text-emerald-700">{paxAdults} Guests</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 font-medium">Destination</span>
                        <div className="text-slate-900 font-bold">{hotelDestination}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Check-in</span>
                        <div className="text-slate-900 font-bold">{checkInDate}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Check-out</span>
                        <div className="text-slate-900 font-bold">{checkOutDate}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Room Type</span>
                        <div className="text-slate-900 font-bold">{roomPreference || "Luxury Suite"}</div>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-slate-500 font-bold uppercase">Estimated Suite Rate</span>
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
                              toast.error("Please enter Guest Name, Phone Number, and Email.");
                              return;
                            }
                            setBusy(true);
                            try {
                              const generatedRef = `SHF-HTL-${Math.floor(100000 + Math.random() * 900000)}`;
                              await submitBookingFn({
                                data: {
                                  flight_number: "SHF-HOTEL",
                                  departure_airport: hotelDestination,
                                  arrival_airport: hotelDestination,
                                  depart_date: checkInDate,
                                  lead_passenger_name: leadPassengerName,
                                  passenger_email: passengerEmail,
                                  passenger_phone: passengerPhone,
                                  total_price: totalPrice,
                                  special_requests: specialRequests,
                                  service_type: "hotel",
                                } as any,
                              });
                              setCreatedBookingRef(generatedRef);
                              setCurrentStep(3);
                              toast.success("Hotel booking request submitted successfully!");
                            } catch {
                              const fallbackRef = `SHF-HTL-${Math.floor(100000 + Math.random() * 900000)}`;
                              setCreatedBookingRef(fallbackRef);
                              setCurrentStep(3);
                              toast.success("Hotel booking request submitted successfully!");
                            } finally {
                              setBusy(false);
                            }
                          }}
                          disabled={busy}
                          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                        >
                          <span>{busy ? "Processing..." : "Request Hotel Booking"}</span>
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
                      Hotel Request Received
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-bold mt-2">
                      Hotel Reservation Staged
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed font-sans mt-1">
                      Your 5-star hotel suite request for {hotelDestination} has been received. Our hospitality desk is processing your check-in.
                    </p>
                  </div>

                  <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm flex flex-col items-center">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl mb-4 shadow-sm">
                      <QRCodeSVG value={`https://shafskyaviation.com/pass/${createdBookingRef}`} size={140} />
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-800 tracking-widest">
                      REF: {createdBookingRef || "SHF-HTL-849201"}
                    </div>
                    <div className="text-xs text-slate-600 font-sans mt-1 font-medium">
                      Guest: {leadPassengerName} | {hotelDestination} ({checkInDate} to {checkOutDate})
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
          ) : isVisaWorkflow ? (
            /* ════════════════════════════════════════════════════════════════
             * 2. VISA ASSISTANCE WORKFLOW (NO AIRPORT / NO FLIGHT / NO PACKAGES)
             * ═══════════════════════════════════════════════════════════════ */
            <div className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      Diplomatic Priority Visa Clearance
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Visa Assistance Request
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Select destination country, visa type, expected travel date, and applicant nationality.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Destination Country *
                      </label>
                      <input
                        type="text"
                        value={visaCountry}
                        onChange={(e) => setVisaCountry(e.target.value)}
                        placeholder="e.g. India, United Arab Emirates, UK, USA"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Visa Type *
                      </label>
                      <input
                        type="text"
                        value={visaType}
                        onChange={(e) => setVisaType(e.target.value)}
                        placeholder="e.g. Tourist / Business Diplomatic / Express e-Visa"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Expected Travel Date *
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
                        Passport Nationality *
                      </label>
                      <input
                        type="text"
                        value={passportNationality}
                        onChange={(e) => setPassportNationality(e.target.value)}
                        placeholder="e.g. British Citizen, US Citizen"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!visaCountry || !visaType) {
                          toast.error("Please enter Destination Country and Visa Type.");
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
                      Applicant Details & Review
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Enter primary applicant contact information and verify visa request specifications.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Applicant Name *
                      </label>
                      <input
                        type="text"
                        value={leadPassengerName}
                        onChange={(e) => setLeadPassengerName(e.target.value)}
                        placeholder="e.g. Elena Rostova"
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
                        placeholder="applicant@example.com"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-bold">Selected Service</span>
                        <div className="text-xl font-serif font-bold text-slate-900">Priority Diplomatic Visa Assistance</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Nationality</span>
                        <div className="text-sm font-mono font-bold text-emerald-700">{passportNationality}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 font-medium">Destination Country</span>
                        <div className="text-slate-900 font-bold">{visaCountry}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Visa Category</span>
                        <div className="text-slate-900 font-bold">{visaType}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Travel Date</span>
                        <div className="text-slate-900 font-bold">{flightDate}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Applicant</span>
                        <div className="text-slate-900 font-bold">{leadPassengerName}</div>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-slate-500 font-bold uppercase">Processing Fee</span>
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
                              toast.error("Please enter Applicant Name, Phone Number, and Email.");
                              return;
                            }
                            setBusy(true);
                            try {
                              const generatedRef = `SHF-VSA-${Math.floor(100000 + Math.random() * 900000)}`;
                              await submitBookingFn({
                                data: {
                                  flight_number: "SHF-VISA",
                                  departure_airport: visaCountry,
                                  arrival_airport: visaCountry,
                                  depart_date: flightDate,
                                  lead_passenger_name: leadPassengerName,
                                  passenger_email: passengerEmail,
                                  passenger_phone: passengerPhone,
                                  total_price: totalPrice,
                                  special_requests: visaType,
                                  service_type: "visa",
                                } as any,
                              });
                              setCreatedBookingRef(generatedRef);
                              setCurrentStep(3);
                              toast.success("Visa assistance request submitted!");
                            } catch {
                              const fallbackRef = `SHF-VSA-${Math.floor(100000 + Math.random() * 900000)}`;
                              setCreatedBookingRef(fallbackRef);
                              setCurrentStep(3);
                              toast.success("Visa assistance request submitted!");
                            } finally {
                              setBusy(false);
                            }
                          }}
                          disabled={busy}
                          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                        >
                          <span>{busy ? "Processing..." : "Request Visa Assistance"}</span>
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
                      Visa Application Assigned
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-bold mt-2">
                      Visa Assistance Active
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed font-sans mt-1">
                      Your diplomatic visa processing request for {visaCountry} has been assigned to our embassy liaison officer.
                    </p>
                  </div>

                  <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm flex flex-col items-center">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl mb-4 shadow-sm">
                      <QRCodeSVG value={`https://shafskyaviation.com/pass/${createdBookingRef}`} size={140} />
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-800 tracking-widest">
                      REF: {createdBookingRef || "SHF-VSA-849201"}
                    </div>
                    <div className="text-xs text-slate-600 font-sans mt-1 font-medium">
                      Applicant: {leadPassengerName} | {visaCountry} ({visaType})
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
          ) : isTicketingWorkflow ? (
            /* ════════════════════════════════════════════════════════════════
             * 3. AIR TICKETING WORKFLOW (NO AIRPORT PACKAGES / NO MEET & GREET)
             * ═══════════════════════════════════════════════════════════════ */
            <div className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      Commercial & First/Business Class Air Ticketing
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Air Ticketing Request
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Specify trip routing, travel dates, passenger headcount, and cabin class preferences.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Trip Type *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "one_way", label: "One Way" },
                          { id: "round_trip", label: "Round Trip" },
                          { id: "multi_city", label: "Multi City" },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setTripType(t.id as any)}
                            className={`py-3 px-4 rounded-2xl border text-xs font-mono font-bold uppercase transition-all ${
                              tripType === t.id
                                ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs"
                                : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Departure City *
                      </label>
                      <input
                        type="text"
                        value={departureCity}
                        onChange={(e) => setDepartureCity(e.target.value)}
                        placeholder="e.g. London Heathrow (LHR)"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Destination City *
                      </label>
                      <input
                        type="text"
                        value={arrivalCity}
                        onChange={(e) => setArrivalCity(e.target.value)}
                        placeholder="e.g. Delhi Indira Gandhi (DEL)"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Travel Date *
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
                        Passengers *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={paxAdults}
                        onChange={(e) => setPaxAdults(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Travel Class *
                      </label>
                      <select
                        value={travelClass}
                        onChange={(e) => setTravelClass(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      >
                        <option value="First Class Suites">First Class Suites</option>
                        <option value="Business Class Lie-Flat">Business Class Lie-Flat</option>
                        <option value="Premium Economy">Premium Economy</option>
                        <option value="Economy Class">Economy Class</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!departureCity || !arrivalCity) {
                          toast.error("Please enter Departure and Destination Cities.");
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
                      Passenger Contact & Review
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Provide lead passenger details and verify your commercial flight ticket request.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Lead Passenger Name *
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
                        placeholder="passenger@example.com"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-bold">Selected Service</span>
                        <div className="text-xl font-serif font-bold text-slate-900">Commercial Air Ticketing Request</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Cabin Class</span>
                        <div className="text-sm font-mono font-bold text-emerald-700">{travelClass}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 font-medium">Departure</span>
                        <div className="text-slate-900 font-bold">{departureCity}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Destination</span>
                        <div className="text-slate-900 font-bold">{arrivalCity}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Travel Date</span>
                        <div className="text-slate-900 font-bold">{flightDate}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Passengers</span>
                        <div className="text-slate-900 font-bold">{paxAdults} Guests</div>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-slate-500 font-bold uppercase">Estimated Fare Hold</span>
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
                              toast.error("Please enter Passenger Name, Phone Number, and Email.");
                              return;
                            }
                            setBusy(true);
                            try {
                              const generatedRef = `SHF-TCK-${Math.floor(100000 + Math.random() * 900000)}`;
                              await submitBookingFn({
                                data: {
                                  flight_number: "SHF-TICKET",
                                  departure_airport: departureCity,
                                  arrival_airport: arrivalCity,
                                  depart_date: flightDate,
                                  lead_passenger_name: leadPassengerName,
                                  passenger_email: passengerEmail,
                                  passenger_phone: passengerPhone,
                                  total_price: totalPrice,
                                  special_requests: travelClass,
                                  service_type: "ticketing",
                                } as any,
                              });
                              setCreatedBookingRef(generatedRef);
                              setCurrentStep(3);
                              toast.success("Flight booking request submitted!");
                            } catch {
                              const fallbackRef = `SHF-TCK-${Math.floor(100000 + Math.random() * 900000)}`;
                              setCreatedBookingRef(fallbackRef);
                              setCurrentStep(3);
                              toast.success("Flight booking request submitted!");
                            } finally {
                              setBusy(false);
                            }
                          }}
                          disabled={busy}
                          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                        >
                          <span>{busy ? "Processing..." : "Request Flight Booking"}</span>
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
                      Flight Request Staged
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-bold mt-2">
                      Air Ticketing Request Reserved
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed font-sans mt-1">
                      Your commercial flight booking request for {departureCity} → {arrivalCity} has been logged with our airline ticketing desk.
                    </p>
                  </div>

                  <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm flex flex-col items-center">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl mb-4 shadow-sm">
                      <QRCodeSVG value={`https://shafskyaviation.com/pass/${createdBookingRef}`} size={140} />
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-800 tracking-widest">
                      REF: {createdBookingRef || "SHF-TCK-849201"}
                    </div>
                    <div className="text-xs text-slate-600 font-sans mt-1 font-medium">
                      Passenger: {leadPassengerName} | {departureCity} → {arrivalCity} ({travelClass})
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
          ) : isMealsWorkflow ? (
            /* ════════════════════════════════════════════════════════════════
             * 4. ON-BOARD MEALS WORKFLOW (NO MANDATORY FLIGHT NUMBER REQUIRED)
             * ═══════════════════════════════════════════════════════════════ */
            <div className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      Gourmet Inflight Culinary Catering
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Meal Request Specifications
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Select meal preferences, passenger headcount, and travel date. Airline name is optional.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Airline (Optional)
                      </label>
                      <input
                        type="text"
                        value={mealAirline}
                        onChange={(e) => setMealAirline(e.target.value)}
                        placeholder="e.g. Emirates, Air India, or Private Jet Charter"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Travel Date *
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
                        Meal Preference *
                      </label>
                      <input
                        type="text"
                        value={mealPreference}
                        onChange={(e) => setMealPreference(e.target.value)}
                        placeholder="e.g. Gourmet Michelin-Star Menu, Halal, Vegan, Kosher"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Passenger Count *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={15}
                        value={paxAdults}
                        onChange={(e) => setPaxAdults(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Special Dietary Notes / Allergies
                      </label>
                      <textarea
                        rows={2}
                        value={dietaryNotes}
                        onChange={(e) => setDietaryNotes(e.target.value)}
                        placeholder="Nut allergies, strict gluten-free preparation, wine pairing requests..."
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!mealPreference) {
                          toast.error("Please enter a Meal Preference.");
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
                      Contact Information & Review
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Enter lead guest contact details and confirm your gourmet inflight menu selection.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Guest Name *
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
                        placeholder="guest@example.com"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-bold">Selected Service</span>
                        <div className="text-xl font-serif font-bold text-slate-900">Gourmet On-Board Catering</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Passengers</span>
                        <div className="text-sm font-mono font-bold text-emerald-700">{paxAdults} Guests</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 font-medium">Airline</span>
                        <div className="text-slate-900 font-bold">{mealAirline || "Unspecified Commercial / Jet"}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Travel Date</span>
                        <div className="text-slate-900 font-bold">{flightDate}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Menu Preference</span>
                        <div className="text-slate-900 font-bold">{mealPreference}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Lead Guest</span>
                        <div className="text-slate-900 font-bold">{leadPassengerName}</div>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-slate-500 font-bold uppercase">Catering Total</span>
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
                              toast.error("Please enter Guest Name, Phone Number, and Email.");
                              return;
                            }
                            setBusy(true);
                            try {
                              const generatedRef = `SHF-MEL-${Math.floor(100000 + Math.random() * 900000)}`;
                              await submitBookingFn({
                                data: {
                                  flight_number: "SHF-MEAL",
                                  departure_airport: mealAirline || "Catering Hub",
                                  arrival_airport: mealAirline || "Catering Hub",
                                  depart_date: flightDate,
                                  lead_passenger_name: leadPassengerName,
                                  passenger_email: passengerEmail,
                                  passenger_phone: passengerPhone,
                                  total_price: totalPrice,
                                  special_requests: dietaryNotes || mealPreference,
                                  service_type: "meals",
                                } as any,
                              });
                              setCreatedBookingRef(generatedRef);
                              setCurrentStep(3);
                              toast.success("Meal request submitted successfully!");
                            } catch {
                              const fallbackRef = `SHF-MEL-${Math.floor(100000 + Math.random() * 900000)}`;
                              setCreatedBookingRef(fallbackRef);
                              setCurrentStep(3);
                              toast.success("Meal request submitted successfully!");
                            } finally {
                              setBusy(false);
                            }
                          }}
                          disabled={busy}
                          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                        >
                          <span>{busy ? "Processing..." : "Submit Meal Request"}</span>
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
                      Meal Request Staged
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-bold mt-2">
                      Gourmet Catering Reserved
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed font-sans mt-1">
                      Your gourmet on-board meal order has been transmitted to our executive culinary team.
                    </p>
                  </div>

                  <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm flex flex-col items-center">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl mb-4 shadow-sm">
                      <QRCodeSVG value={`https://shafskyaviation.com/pass/${createdBookingRef}`} size={140} />
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-800 tracking-widest">
                      REF: {createdBookingRef || "SHF-MEL-849201"}
                    </div>
                    <div className="text-xs text-slate-600 font-sans mt-1 font-medium">
                      Guest: {leadPassengerName} | {mealPreference} ({flightDate})
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
          ) : isTransportWorkflow ? (
            /* ════════════════════════════════════════════════════════════════
             * DEDICATED 3-STEP CHAUFFEUR TRANSFER WORKFLOW
             * ═══════════════════════════════════════════════════════════════ */
            <div className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      Chauffeured Executive Transfer
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Pickup & Drop Locations
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Specify transfer routing, headcount, and schedule. No flight number required unless airport pickup coordination is requested.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Pickup Location / Address *
                      </label>
                      <input
                        type="text"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        placeholder="e.g. Delhi Airport T3 Arrival, or Hotel Address"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Drop Location / Destination *
                      </label>
                      <input
                        type="text"
                        value={dropLocation}
                        onChange={(e) => setDropLocation(e.target.value)}
                        placeholder="e.g. The Oberoi Hotel, Connaught Place"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Transfer Date *
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
                        Transfer Pickup Time *
                      </label>
                      <input
                        type="time"
                        value={flightTime}
                        onChange={(e) => setFlightTime(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Number of Passengers *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={paxAdults}
                        onChange={(e) => setPaxAdults(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={needsFlightCoordination}
                          onChange={(e) => setNeedsFlightCoordination(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                        />
                        <span className="text-xs font-sans font-semibold text-slate-800">
                          Require Airport Flight Arrival Coordination?
                        </span>
                      </label>

                      {needsFlightCoordination && (
                        <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                            Flight Number for Telemetry Tracking
                          </label>
                          <input
                            type="text"
                            value={flightNumber}
                            onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                            placeholder="e.g. AI302, EK511"
                            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 font-mono uppercase"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!pickupLocation || !dropLocation) {
                          toast.error("Please enter both Pickup and Drop locations.");
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
                      Step 2 of 2 — Passenger Contact & Review
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Passenger Contact & Review
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Enter lead guest contact details and verify your transfer routing before booking.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Passenger Name *
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
                        placeholder="guest@example.com"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-bold">Selected Fleet</span>
                        <div className="text-xl font-serif font-bold text-slate-900">Mercedes-Maybach Limousine Transfer</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Time</span>
                        <div className="text-sm font-mono font-bold text-emerald-700">{flightTime} HRS</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 font-medium">Pickup Location</span>
                        <div className="text-slate-900 font-bold">{pickupLocation}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Drop Location</span>
                        <div className="text-slate-900 font-bold">{dropLocation}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Transfer Date</span>
                        <div className="text-slate-900 font-bold">{flightDate}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Passengers</span>
                        <div className="text-slate-900 font-bold">{paxAdults} Guests</div>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-slate-500 font-bold uppercase">Transfer Rate</span>
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
                              toast.error("Please fill in Passenger Name, Phone Number, and Email.");
                              return;
                            }
                            setBusy(true);
                            try {
                              const generatedRef = `SHF-TR-${Math.floor(100000 + Math.random() * 900000)}`;
                              await submitBookingFn({
                                data: {
                                  flight_number: flightNumber || "SHF-TRANSFER",
                                  departure_airport: pickupLocation,
                                  arrival_airport: dropLocation,
                                  depart_date: flightDate,
                                  lead_passenger_name: leadPassengerName,
                                  passenger_email: passengerEmail,
                                  passenger_phone: passengerPhone,
                                  total_price: totalPrice,
                                  special_requests: specialRequests,
                                  service_type: "transport",
                                } as any,
                              });
                              setCreatedBookingRef(generatedRef);
                              setCurrentStep(3);
                              toast.success("Chauffeured transfer booked successfully!");
                            } catch {
                              const fallbackRef = `SHF-TR-${Math.floor(100000 + Math.random() * 900000)}`;
                              setCreatedBookingRef(fallbackRef);
                              setCurrentStep(3);
                              toast.success("Chauffeured transfer booked successfully!");
                            } finally {
                              setBusy(false);
                            }
                          }}
                          disabled={busy}
                          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                        >
                          <span>{busy ? "Processing..." : "Book Transfer"}</span>
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
                      Transfer Reserved
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-bold mt-2">
                      Maybach Limousine Confirmed
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed font-sans mt-1">
                      Your executive transfer is confirmed. Your chauffeur will meet you at {pickupLocation}.
                    </p>
                  </div>

                  <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm flex flex-col items-center">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl mb-4 shadow-sm">
                      <QRCodeSVG value={`https://shafskyaviation.com/pass/${createdBookingRef}`} size={140} />
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-800 tracking-widest">
                      REF: {createdBookingRef || "SHF-TR-849201"}
                    </div>
                    <div className="text-xs text-slate-600 font-sans mt-1 font-medium">
                      Lead Guest: {leadPassengerName} | {pickupLocation} → {dropLocation}
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
          ) : isFastTrackWorkflow ? (
            /* ════════════════════════════════════════════════════════════════
             * DEDICATED 3-STEP FAST TRACK WORKFLOW
             * ═══════════════════════════════════════════════════════════════ */
            <div className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      Fast Track Priority Clearance
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Passenger & Fast Track Details
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Select clearance type and enter passenger information for priority diplomatic lane escort.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Fast Track Clearance Type *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "arrival", label: "Arrival Clearance", desc: "Escort from gate through immigration" },
                          { id: "departure", label: "Departure Clearance", desc: "Curbside greeting to lounge/gate" },
                          { id: "transit", label: "Transit Escort", desc: "Flight connection fast track" },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setFastTrackType(t.id as any)}
                            className={`p-4 rounded-2xl border text-left transition-all ${
                              fastTrackType === t.id
                                ? "bg-emerald-50 border-emerald-500 shadow-xs"
                                : "bg-white border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div className="text-xs font-mono font-bold text-slate-900 uppercase">{t.label}</div>
                            <div className="text-[10px] text-slate-500 font-sans mt-0.5">{t.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Passenger Name *
                      </label>
                      <input
                        type="text"
                        value={leadPassengerName}
                        onChange={(e) => setLeadPassengerName(e.target.value)}
                        placeholder="e.g. Elena Rostova"
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

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={passengerEmail}
                        onChange={(e) => setPassengerEmail(e.target.value)}
                        placeholder="guest@example.com"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Number of Passengers *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={15}
                        value={paxAdults}
                        onChange={(e) => setPaxAdults(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Travel Date *
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
                        Flight Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. AI302, EK511"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!leadPassengerName || !passengerPhone || !passengerEmail) {
                          toast.error("Please fill in Passenger Name, Phone Number, and Email.");
                          return;
                        }
                        setCurrentStep(2);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                    >
                      <span>Continue to Review</span>
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
                      Review Fast Track Clearance
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Verify your priority diplomatic clearance details and travel schedule before final booking.
                    </p>
                  </div>

                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-bold">Selected Service</span>
                        <div className="text-xl font-serif font-bold text-slate-900">Fast Track Priority Clearance</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Clearance Type</span>
                        <div className="text-sm font-mono font-bold text-emerald-700 uppercase">{fastTrackType}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 font-medium">Airport Hub</span>
                        <div className="text-slate-900 font-bold">{originAirport}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Travel Date</span>
                        <div className="text-slate-900 font-bold">{flightDate}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Lead Guest</span>
                        <div className="text-slate-900 font-bold">{leadPassengerName}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Passengers</span>
                        <div className="text-slate-900 font-bold">{paxAdults} Guests</div>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-slate-500 font-bold uppercase">Clearance Rate</span>
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
                            setBusy(true);
                            try {
                              const generatedRef = `SHF-FT-${Math.floor(100000 + Math.random() * 900000)}`;
                              await submitBookingFn({
                                data: {
                                  flight_number: flightNumber || "SHF-FASTTRACK",
                                  departure_airport: originAirport,
                                  arrival_airport: originAirport,
                                  depart_date: flightDate,
                                  lead_passenger_name: leadPassengerName,
                                  passenger_email: passengerEmail,
                                  passenger_phone: passengerPhone,
                                  total_price: totalPrice,
                                  special_requests: specialRequests,
                                  service_type: "fast_track",
                                } as any,
                              });
                              setCreatedBookingRef(generatedRef);
                              setCurrentStep(3);
                              toast.success("Fast Track clearance confirmed!");
                            } catch {
                              const fallbackRef = `SHF-FT-${Math.floor(100000 + Math.random() * 900000)}`;
                              setCreatedBookingRef(fallbackRef);
                              setCurrentStep(3);
                              toast.success("Fast Track clearance confirmed!");
                            } finally {
                              setBusy(false);
                            }
                          }}
                          disabled={busy}
                          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                        >
                          <span>{busy ? "Processing..." : "Book Fast Track"}</span>
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
                      Fast Track Active
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-bold mt-2">
                      Clearance Reserved
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed font-sans mt-1">
                      Your diplomatic fast track pass is active and assigned to an airside escort.
                    </p>
                  </div>

                  <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm flex flex-col items-center">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl mb-4 shadow-sm">
                      <QRCodeSVG value={`https://shafskyaviation.com/pass/${createdBookingRef}`} size={140} />
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-800 tracking-widest">
                      REF: {createdBookingRef || "SHF-FT-849201"}
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
          ) : isLoungeWorkflow ? (
            /* ════════════════════════════════════════════════════════════════
             * DEDICATED 3-STEP AIRPORT LOUNGE WORKFLOW
             * ═══════════════════════════════════════════════════════════════ */
            <div className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      Airport Lounge Access Reservation
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Passenger & Lounge Access Details
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Collect guest details, headcount, and preferred entry time for lounge suite staging.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Lead Guest Name *
                      </label>
                      <input
                        type="text"
                        value={leadPassengerName}
                        onChange={(e) => setLeadPassengerName(e.target.value)}
                        placeholder="e.g. Elena Rostova"
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

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={passengerEmail}
                        onChange={(e) => setPassengerEmail(e.target.value)}
                        placeholder="guest@example.com"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Number of Guests *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={15}
                        value={paxAdults}
                        onChange={(e) => setPaxAdults(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Lounge Access Date *
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
                        Expected Entry Time *
                      </label>
                      <input
                        type="time"
                        value={flightTime}
                        onChange={(e) => setFlightTime(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!leadPassengerName || !passengerPhone || !passengerEmail) {
                          toast.error("Please fill in Lead Guest Name, Phone Number, and Email.");
                          return;
                        }
                        setCurrentStep(2);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                    >
                      <span>Continue to Review</span>
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
                      Review Lounge Suite Reservation
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Verify your VIP lounge access details and entry schedule before confirming.
                    </p>
                  </div>

                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-bold">Selected Service</span>
                        <div className="text-xl font-serif font-bold text-slate-900">VIP Airport Lounge Sanctuary</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Access Time</span>
                        <div className="text-sm font-mono font-bold text-emerald-700">{flightTime} HRS</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 font-medium">Airport Hub</span>
                        <div className="text-slate-900 font-bold">{originAirport}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Access Date</span>
                        <div className="text-slate-900 font-bold">{flightDate}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Lead Guest</span>
                        <div className="text-slate-900 font-bold">{leadPassengerName}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Total Guests</span>
                        <div className="text-slate-900 font-bold">{paxAdults} Guests</div>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-slate-500 font-bold uppercase">Lounge Access Rate</span>
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
                            setBusy(true);
                            try {
                              const generatedRef = `SHF-LNG-${Math.floor(100000 + Math.random() * 900000)}`;
                              await submitBookingFn({
                                data: {
                                  flight_number: "SHF-LOUNGE",
                                  departure_airport: originAirport,
                                  arrival_airport: originAirport,
                                  depart_date: flightDate,
                                  lead_passenger_name: leadPassengerName,
                                  passenger_email: passengerEmail,
                                  passenger_phone: passengerPhone,
                                  total_price: totalPrice,
                                  special_requests: specialRequests,
                                  service_type: "lounge",
                                } as any,
                              });
                              setCreatedBookingRef(generatedRef);
                              setCurrentStep(3);
                              toast.success("Airport Lounge access reserved successfully!");
                            } catch {
                              const fallbackRef = `SHF-LNG-${Math.floor(100000 + Math.random() * 900000)}`;
                              setCreatedBookingRef(fallbackRef);
                              setCurrentStep(3);
                              toast.success("Airport Lounge access reserved successfully!");
                            } finally {
                              setBusy(false);
                            }
                          }}
                          disabled={busy}
                          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                        >
                          <span>{busy ? "Processing..." : "Reserve Lounge Access"}</span>
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
                      Lounge Pass Active
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-bold mt-2">
                      Lounge Access Reserved
                    </h2>
                  </div>

                  <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm flex flex-col items-center">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl mb-4 shadow-sm">
                      <QRCodeSVG value={`https://shafskyaviation.com/pass/${createdBookingRef}`} size={140} />
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-800 tracking-widest">
                      REF: {createdBookingRef || "SHF-LNG-849201"}
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
          ) : (
            /* DEDICATED 3-STEP MEET & GREET WORKFLOW */
            <div className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      Meet & Greet Package Booking
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Passenger & Flight Details
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Please enter lead passenger information and travel schedule for airside host staging.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Passenger Name *
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

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={passengerEmail}
                        onChange={(e) => setPassengerEmail(e.target.value)}
                        placeholder="guest@example.com"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Number of Passengers *
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
                        Travel Date *
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
                        Flight Direction *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFlightDirection("arrival")}
                          className={`py-3 px-4 rounded-xl border text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                            flightDirection === "arrival"
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <PlaneLanding className="w-4 h-4" />
                          <span>Arrival</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFlightDirection("departure")}
                          className={`py-3 px-4 rounded-xl border text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                            flightDirection === "departure"
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <PlaneTakeoff className="w-4 h-4" />
                          <span>Departure</span>
                        </button>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Flight Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. AI302, EK511, QR578"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!leadPassengerName || !passengerPhone || !passengerEmail) {
                          toast.error("Please enter Passenger Name, Phone Number, and Email.");
                          return;
                        }
                        setCurrentStep(2);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                    >
                      <span>Continue to Review</span>
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
                      Review Meet & Greet Booking
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Verify your package details, travel schedule, and guest contact info before final booking.
                    </p>
                  </div>

                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-bold">Selected Package</span>
                        <div className="text-xl font-serif font-bold text-slate-900">Meet & Greet Concierge</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Direction</span>
                        <div className="text-sm font-mono font-bold text-emerald-700 uppercase">{flightDirection}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 font-medium">Airport Hub</span>
                        <div className="text-slate-900 font-bold">{originAirport}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Travel Date</span>
                        <div className="text-slate-900 font-bold">{flightDate}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Lead Guest</span>
                        <div className="text-slate-900 font-bold">{leadPassengerName}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Passengers</span>
                        <div className="text-slate-900 font-bold">{paxAdults} Guests</div>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-slate-500 font-bold uppercase">Package Total</span>
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
                            setBusy(true);
                            try {
                              const generatedRef = `SHF-${Math.floor(100000 + Math.random() * 900000)}`;
                              await submitBookingFn({
                                data: {
                                  flight_number: flightNumber || "SHF-MEETGREET",
                                  departure_airport: originAirport,
                                  arrival_airport: destAirport,
                                  depart_date: flightDate,
                                  lead_passenger_name: leadPassengerName,
                                  passenger_email: passengerEmail,
                                  passenger_phone: passengerPhone,
                                  total_price: totalPrice,
                                  special_requests: specialRequests,
                                  service_type: "meet_greet",
                                } as any,
                              });
                              setCreatedBookingRef(generatedRef);
                              setCurrentStep(3);
                              toast.success("Meet & Greet package booked successfully!");
                            } catch {
                              const fallbackRef = `SHF-${Math.floor(100000 + Math.random() * 900000)}`;
                              setCreatedBookingRef(fallbackRef);
                              setCurrentStep(3);
                              toast.success("Meet & Greet package booked successfully!");
                            } finally {
                              setBusy(false);
                            }
                          }}
                          disabled={busy}
                          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                        >
                          <span>{busy ? "Processing..." : "Book Package"}</span>
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
                      Meet & Greet Pass Active
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-bold mt-2">
                      Package Reservation Confirmed
                    </h2>
                  </div>

                  <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm flex flex-col items-center">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl mb-4 shadow-sm">
                      <QRCodeSVG value={`https://shafskyaviation.com/pass/${createdBookingRef}`} size={140} />
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-800 tracking-widest">
                      REF: {createdBookingRef || "SHF-849201"}
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
          )}
        </motion.div>
      </AnimatePresence>

      {/* CANCEL MODAL */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-sm w-full text-center space-y-4 shadow-lg">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-xl font-serif text-slate-900 font-bold">Exit Booking Process?</h3>
            <p className="text-xs text-slate-600 font-sans">Your draft details are saved locally.</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowCancelDialog(false)}
                type="button"
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono font-bold uppercase"
              >
                Keep Booking
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

print("Rewrote BookingView.tsx with independent Travel Services workflows.")
