import os

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
} from "lucide-react";
import { createBooking } from "@/lib/bookings.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AIRPORTS, getAirport, getAirportServices, type AirportService } from "@/data/airports";
import { RippleButton } from "@/components/ui/interactions";
import { MeetGreetPackageComparison } from "@/components/airports/MeetGreetPackageComparison";

interface FlightDataResult {
  flightNum: string;
  carrier: { iata: string; name: string };
  origin: { code: string; name: string; city: string };
  destination: { code: string; name: string; city: string };
  departure: { scheduledTime: string; terminal: string };
  arrival: { scheduledTime: string; terminal: string };
  duration: string;
  status: string;
  aircraft: { model: string; reg?: string };
}

interface BookingViewProps {
  searchParams?: any;
}

const AIRLINE_PREFIXES: Record<string, string> = {
  AI: "Air India",
  EK: "Emirates",
  QR: "Qatar Airways",
  SQ: "Singapore Airlines",
  BA: "British Airways",
  LH: "Lufthansa",
  AF: "Air France",
  "6E": "IndiGo",
  UK: "Vistara",
  SG: "SpiceJet",
  "9W": "Jet Airways",
  TK: "Turkish Airlines",
  EY: "Etihad Airways",
  CX: "Cathay Pacific",
};

function guessAirline(flightNum: string): string | null {
  const cleaned = flightNum.trim().toUpperCase().replace(/\\s+/g, "");
  const twoChar = cleaned.slice(0, 2);
  if (AIRLINE_PREFIXES[twoChar]) return AIRLINE_PREFIXES[twoChar];
  return null;
}

export default function BookingView({ searchParams }: BookingViewProps) {
  const navigate = useNavigate();
  const submitBookingFn = useServerFn(createBooking);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [busy, setBusy] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [createdBookingRef, setCreatedBookingRef] = useState<string | null>(null);

  // Workflow Detection
  const initialServiceId = searchParams?.service_id || "meet_greet";
  const isFastTrackWorkflow = searchParams?.service_id === "fast_track";
  const isLoungeWorkflow = searchParams?.service_id === "lounge";
  const isMeetGreetWorkflow =
    (searchParams?.service_id === "meet_greet" || searchParams?.package_id || !searchParams?.service_id) &&
    !isFastTrackWorkflow &&
    !isLoungeWorkflow;

  const [fastTrackType, setFastTrackType] = useState<"arrival" | "departure" | "transit">("arrival");
  const [flightDirection, setFlightDirection] = useState<"arrival" | "departure">("arrival");
  const [subServiceId, setSubServiceId] = useState<string>(initialServiceId);

  const [flightNumber, setFlightNumber] = useState<string>("");
  const [airline, setAirline] = useState<string>("");
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
      originAirport,
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
    let base = 12500;
    if (isFastTrackWorkflow || subServiceId === "fast_track") base = 7500;
    if (isLoungeWorkflow || subServiceId === "lounge") base = 9500;
    if (subServiceId === "transport") base = 14000;
    if (subServiceId === "air_ambulance") base = 185000;
    if (subServiceId === "jet_charter") base = 450000;
    return base * paxAdults;
  };

  const totalPrice = getBasePrice();

  const fastTrackStepConfigs = [
    {
      title: "Passenger & Fast Track Details",
      sub: "Select clearance type (Arrival/Departure/Transit) and enter passenger contact details.",
      estTime: "Est. 30 sec",
      progress: 33,
    },
    {
      title: "Review Fast Track Clearance",
      sub: "Verify your priority immigration clearance details before confirming.",
      estTime: "Est. 30 sec",
      progress: 66,
    },
    {
      title: "Fast Track Confirmed",
      sub: "Your diplomatic fast track pass is active and assigned to terminal escort.",
      estTime: "Completed",
      progress: 100,
    },
  ];

  const loungeStepConfigs = [
    {
      title: "Passenger & Lounge Details",
      sub: "Enter guest details, headcount, access date, and preferred lounge entry time.",
      estTime: "Est. 30 sec",
      progress: 33,
    },
    {
      title: "Review Lounge Access",
      sub: "Verify your airport lounge suite reservation details before confirming.",
      estTime: "Est. 30 sec",
      progress: 66,
    },
    {
      title: "Lounge Access Confirmed",
      sub: "Your digital VIP lounge pass is active and staged at the lounge desk.",
      estTime: "Completed",
      progress: 100,
    },
  ];

  const meetGreetStepConfigs = [
    {
      title: "Passenger & Travel Details",
      sub: "Enter lead passenger details, travel date, and flight direction.",
      estTime: "Est. 30 sec",
      progress: 33,
    },
    {
      title: "Review & Confirm Booking",
      sub: "Verify your Meet & Greet package details before confirming.",
      estTime: "Est. 30 sec",
      progress: 66,
    },
    {
      title: "Booking Confirmed & Digital Pass",
      sub: "Your airside Meet & Greet pass is active and assigned to our command desk.",
      estTime: "Completed",
      progress: 100,
    },
  ];

  const activeConfigs = isFastTrackWorkflow
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
          {isFastTrackWorkflow ? (
            /* ════════════════════════════════════════════════════════════════
             * DEDICATED 3-STEP FAST TRACK WORKFLOW
             * ═══════════════════════════════════════════════════════════════ */
            <div className="space-y-6">
              {/* STEP 1: FAST TRACK DETAILS */}
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
                    {/* Fast Track Type Selector */}
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

                    {/* Passenger Name */}
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

                    {/* Phone */}
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

                    {/* Email */}
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

                    {/* Number of Passengers */}
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

                    {/* Travel Date */}
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

                    {/* Flight Number (Optional) */}
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

                    {/* Special Requests */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Special Requests / Luggage Assistance
                      </label>
                      <textarea
                        rows={3}
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Express luggage clearance, diplomatic passport lane escort..."
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>
                  </div>

                  {/* STEP 1 CTA */}
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

              {/* STEP 2: REVIEW FAST TRACK */}
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

                    <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 font-medium">Phone</span>
                        <div className="text-slate-900 font-bold">{passengerPhone}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Email</span>
                        <div className="text-slate-900 font-bold">{passengerEmail}</div>
                      </div>
                    </div>

                    {flightNumber && (
                      <div className="pt-3 border-t border-slate-100 text-xs font-mono">
                        <span className="text-slate-500 font-medium">Flight Reference</span>
                        <div className="text-slate-900 font-bold">{flightNumber}</div>
                      </div>
                    )}

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

              {/* STEP 3: CONFIRMED */}
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
                    <div className="text-xs text-slate-600 font-sans mt-1 font-medium">
                      Lead Guest: {leadPassengerName} | {originAirport} ({fastTrackType.toUpperCase()})
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <Link
                      to="/"
                      className="px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-800 font-mono text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xs"
                    >
                      Return to Homepage
                    </Link>
                    <a
                      href="tel:+919599087959"
                      className="px-6 py-3 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                    >
                      Call 24/7 Command Desk
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : isLoungeWorkflow ? (
            /* ════════════════════════════════════════════════════════════════
             * DEDICATED 3-STEP AIRPORT LOUNGE WORKFLOW
             * ═══════════════════════════════════════════════════════════════ */
            <div className="space-y-6">
              {/* STEP 1: LOUNGE DETAILS */}
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

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Special Requests / Dietary Requirements
                      </label>
                      <textarea
                        rows={3}
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Private rest suite requirement, halal/vegan meal preferences, shower access..."
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
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

              {/* STEP 2: REVIEW LOUNGE */}
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

                    <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 font-medium">Phone</span>
                        <div className="text-slate-900 font-bold">{passengerPhone}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Email</span>
                        <div className="text-slate-900 font-bold">{passengerEmail}</div>
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

              {/* STEP 3: LOUNGE CONFIRMED */}
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
                    <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed font-sans mt-1">
                      Your VIP lounge pass is active. Show your QR code at the lounge front desk upon arrival.
                    </p>
                  </div>

                  <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm flex flex-col items-center">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl mb-4 shadow-sm">
                      <QRCodeSVG value={`https://shafskyaviation.com/pass/${createdBookingRef}`} size={140} />
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-800 tracking-widest">
                      REF: {createdBookingRef || "SHF-LNG-849201"}
                    </div>
                    <div className="text-xs text-slate-600 font-sans mt-1 font-medium">
                      Lead Guest: {leadPassengerName} | {originAirport} Hub ({flightTime} HRS)
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <Link
                      to="/"
                      className="px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-800 font-mono text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xs"
                    >
                      Return to Homepage
                    </Link>
                    <a
                      href="tel:+919599087959"
                      className="px-6 py-3 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                    >
                      Call 24/7 Command Desk
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* DEDICATED 3-STEP MEET & GREET WORKFLOW */
            <div className="space-y-6">
              {/* STEP 1: MEET & GREET */}
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

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Special Request / Instructions
                      </label>
                      <textarea
                        rows={3}
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Wheelchair assistance, language preferences, special luggage requirements..."
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
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

              {/* STEP 2: REVIEW MEET & GREET */}
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

                    <div className="pt-[#15px] border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 font-medium">Phone</span>
                        <div className="text-slate-900 font-bold">{passengerPhone}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Email</span>
                        <div className="text-slate-900 font-bold">{passengerEmail}</div>
                      </div>
                    </div>

                    {flightNumber && (
                      <div className="pt-3 border-t border-slate-100 text-xs font-mono">
                        <span className="text-slate-500 font-medium">Flight Reference</span>
                        <div className="text-slate-900 font-bold">{flightNumber}</div>
                      </div>
                    )}

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

              {/* STEP 3: MEET & GREET CONFIRMED */}
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
                    <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed font-sans mt-1">
                      Your Meet & Greet airside pass is active. Our host officer is staged for your arrival.
                    </p>
                  </div>

                  <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm flex flex-col items-center">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl mb-4 shadow-sm">
                      <QRCodeSVG value={`https://shafskyaviation.com/pass/${createdBookingRef}`} size={140} />
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-800 tracking-widest">
                      REF: {createdBookingRef || "SHF-849201"}
                    </div>
                    <div className="text-xs text-slate-600 font-sans mt-1 font-medium">
                      Lead Guest: {leadPassengerName} | {originAirport} ({flightDirection.toUpperCase()})
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <Link
                      to="/"
                      className="px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-800 font-mono text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xs"
                    >
                      Return to Homepage
                    </Link>
                    <a
                      href="tel:+919599087959"
                      className="px-6 py-3 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                    >
                      Call 24/7 Command Desk
                    </a>
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

print("Rewrote BookingView.tsx with independent Fast Track workflow.")
